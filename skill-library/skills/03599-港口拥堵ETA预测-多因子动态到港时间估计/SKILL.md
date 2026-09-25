---
name: "p2s-port-congestion-eta-prediction"
title: "港口拥堵ETA预测 — 多因子动态到港时间估计"
description: "触发词：港口拥堵、ETA预测、到港时间、备货窗口、运力风险。何时不用：需要按批次追踪在途状态与异常响应时用在途库存追踪与全链路可视化；需要把在途指标做成考核 KPI 时用在途ETA准确率与到货履约率KPI。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-058"
l3_business: "到货异常追踪"
l3_all: "到货异常追踪 / 物流方案"
l1_l2_l3: "业务运营/供应与履约/到货异常追踪"
p2s_card_id: "Skill-Port-Congestion-ETA-Prediction"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用港口拥堵、天气和政策因子预测到港时间区间，让备货和发货日期不再只靠历史平均。"
user_try: "试试：10 月中旬从宁波发洛杉矶港，帮我预测到港时间区间和延误风险，反推最优发货日期。"
whenToUse: "需要多因子动态估计到港时间并据此安排备货与发货窗口时用本技能；逐批次在途可视化用在途库存追踪与全链路可视化。"
workflow: "接入港口泊位、班次与滞港数据 → 叠加天气与政策事件特征 → 训练并输出到港时间区间预测 → 按延误风险分级反推发货与备货建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 港口拥堵ETA预测 — 多因子动态到港时间估计

## ① 解决的问题

采购团队面临港口拥堵导致旺季缺货——ETA预测精度达到±3天置信区间85%，年化避免缺货损失52万元

## ② 核心算法逻辑

核心机制：采用XGBoost集成学习框架，融合时序特征与外部因子进行港口到港时间(ETA)预测。时序特征包括过去30天港口拥堵指数、同航线历史延误分布、航班密度(船舶到达频率)；外部因子包括天气预报(风速、浪高)、节假日日历编码、贸易政策变化指标。模型输出ETA的置信区间分布(95%置信度)，而非点估计，允许供应链决策者量化风险。

## ③ 业务应用场景

场景A：圣诞旺季备货到港时间预测（避免缺货）
业务问题：某母婴品牌9月启动圣诞备货，计划10月中旬从宁波港发货至洛杉矶港。历年数据显示10月中旬LA港平均拥堵延误8-15天，但变异大(标准差5天)。采购团队基于"历史平均+5天安全库存"备货，结果2024年因港口罢工延误18天，导致圣诞档期缺货损失约120万元；2025年过度备货，滞销品积压成本45万元。
数据要求： - 港口数据：过去24个月LA港每日泊位占用率、船舶到达班次、平均滞港时间(来自港口API或Vessel Tracking平台) - 天气数据：LA港所在地区的风速、浪高、降雨预报(NOAA或Weather API) - 政策数据：美国港口罢工日历、关税政策变化时间戳、海事法规更新记录 - 业务数据：该品牌历史发货日期、实际到港日期、货物重量、柜型、船公司

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
采购经理面临"圣诞旺季备货时港口拥堵不可控"的场景——通过港口拥堵ETA预测，将备货决策从"历史平均+固定安全库存"升级为"动态置信区间+风险分级"，将缺货率从8%降至2%、滞销积压成本从45万元降至15万元，年化收益90万元
FBA运营面临"入库时间窗口严格导致罚款频繁"的场景——通过ETA预测反推最优发货日期，罚款从年均15万元降至2万元，库存周转加速带来资金释放20万元，年化收益33万元
海外仓经理面临"区域库存不均衡导致缺货与积压并存"的场景——通过动态补货触发与跨区域调拨优化，库存成本从80万元降至60万元、缺货损失规避25万元，年化收益45万元
总体ROI：三个场景年化收益168万元，总投入成本约35万元(含数据、模型、系统集成)，ROI=380%
实施难度：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（217 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import pandas as pd
import numpy as np
import xgboost as xgb
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# ============ 1. 数据准备 ============
np.random.seed(42)

# 模拟港口历史数据(24个月)
dates = pd.date_range(start='2022-01-01', end='2023-12-31', freq='D')
n_samples = len(dates)

# 时序特征
historical_congestion = np.sin(np.arange(n_samples) * 2 * np.pi / 30) * 5 + 10  # 30天周期
vessel_density = np.random.poisson(lam=8, size=n_samples)  # 日均船舶到达班次
day_of_week = np.array([d.dayofweek for d in dates])  # 0=Monday, 6=Sunday

# 外部因子
wind_speed = np.random.gamma(shape=2, scale=3, size=n_samples)  # 风速(m/s)
wave_height = np.random.gamma(shape=1.5, scale=1.5, size=n_samples)  # 浪高(m)
holiday_flag = np.zeros(n_samples)
holiday_flag[np.array([d.month in [12, 1] or (d.month == 7 and d.day >= 1) for d in dates])] = 1  # 圣诞、新年、独立日
policy_change = np.zeros(n_samples)
policy_change[np.array([d >= datetime(2023, 6, 1) for d in dates])] = 0.5  # 模拟6月政策变化

# 目标变量: 实际延误天数(相对于标准15天)
actual_delay = (
    historical_congestion * 0.3 +
    vessel_density * 0.4 +
    wind_speed * 0.2 +
    wave_height * 0.15 +
    holiday_flag * 2 +
    policy_change * 1.5 +
    np.random.normal(0, 1.5, n_samples)  # 噪声
)
actual_delay = np.clip(actual_delay, -5, 20)  # 延误范围: -5到20天

# 构建训练数据
train_data = pd.DataFrame({
    'date': dates,
    'historical_congestion': historical_congestion,
    'vessel_density': vessel_density,
    'day_of_week': day_of_week,
    'wind_speed': wind_speed,
    'wave_height': wave_height,
    'holiday_flag': holiday_flag,
    'policy_change': policy_change,
    'actual_delay': actual_delay
})

# ============ 2. 特征工程 ============
# 滞后特征(过去7天平均拥堵)
train_data['congestion_lag7'] = train_data['historical_congestion'].rolling(window=7, min_periods=1).mean()

# 周期特征(sin/cos编码)
train_data['day_sin'] = np.sin(2 * np.pi * train_data['day_of_week'] / 7)
train_data['day_cos'] = np.cos(2 * np.pi * train_data['day_of_week'] / 7)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.12847，但该号在 arXiv 上是《Banach Lie groupoid of partial isometries over restricted Grassmannian》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：港口数据（泊位占用率、船舶到达班次、平均滞港时间）、天气数据（风速、浪高、降雨预报）、政策事件时间戳，以及本品牌历史发货与到港记录（重量、柜型、船公司）。

**输出**：各航线到港时间区间与延误风险分级、最优发货日期与备货建议（含入库窗口与跨区域调拨建议），供采购与仓配团队使用。

## 执行步骤

1. 接入港口、天气与政策事件数据
2. 训练到港时间预测并输出置信区间
3. 按延误风险对批次分级
4. 反推发货日期与备货补货建议

## 边界与不做

- 何时不用：需要逐批次在途看板与异常响应时用在途库存追踪与全链路可视化；需要把 ETA 准确率做成 KPI 时用在途ETA准确率与到货履约率KPI。
- 能力边界：输出到港区间与计划建议，不代替订舱、报关与仓容预约的实际执行。
- 数据边界：港口与天气数据源不完整时预测区间会变宽，罢工等突发事件仍需人工预案。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Mother-Infant、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FBA-Inventory-Optimization、Skill-Last-Mile-Network-Planning.html、Skill-Last-Mile-Network-Planning、Skill-Regional-Warehouse-Allocation、Skill-Supplier-Lead-Time-Buffer.html、Skill-Supplier-Lead-Time-Buffer
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Mother-Infant、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FBA-Inventory-Optimization、Skill-Last-Mile-Network-Planning.html、Skill-Last-Mile-Network-Planning、Skill-Regional-Warehouse-Allocation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Mother-Infant、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FBA-Inventory-Optimization、Skill-Regional-Warehouse-Allocation、Skill-Port-Congestion-ETA-Prediction

---

> 分类：业务运营/供应与履约/到货异常追踪　·　技术族：18-物流履约　·　源卡：`Skill-Port-Congestion-ETA-Prediction`