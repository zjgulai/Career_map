---
name: "p2s-geo-incrementality-dml"
title: "Geo-Level增量效果测量 — 面板DML vs 合成控制法"
description: "触发词：地理增量、面板DML、双重去偏、增量ROAS、ACOS虚低。何时不用：平台允许用户级分流时用常规A/B；只有单个地区无法配对时用合成控制法。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 实验设计"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Geo-Incrementality-DML"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "在按地区分流的增量实验里用面板双重机器学习扣掉季节与基线因素，还原广告真实增量 ROAS。"
user_try: "试试：平台报的 ACOS 偏低我不信，我打算按 50 州配对停投 28 天，帮我用面板 DML 算真实增量 ROAS。"
whenToUse: "当已按地理区域分流、需要在面板结构下控制基线销量、节假日、竞品排名等混杂再估广告净增量时用；只需简单配对双重差分的结论用「Geo Holdout 实验」；只有单一处理地区、无法配对时用合成控制类方法。"
workflow: "汇总地区×日期的面板销量、投放与协变量数据 → 按历史销量配对地区并随机划分处理组与控制组 → 保持完整实验周期（示例 28 天）不改变投放策略 → 用面板 DML 控制混杂估计净增量转化率 → 与平台归因对比后重新分配投放预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Geo-Level增量效果测量 — 面板DML vs 合成控制法

## ① 解决的问题

广告归因平台将自然搜索单量虚报为广告转化导致 ACOS 虚低30-40%——引入地理级别增量 DML（面板数据双重去偏），真实广告增量 ROAS 回归准确，预算再分配后年化 ROI 提升7倍。

## ② 核心算法逻辑

地理级增量实验（GeoLevel Incrementality Test）是将不同地理区域（州/城市/邮编）随机分配为实验组/对照组，在排除平台归因偏差后，估计广告投放对销量/收入的真实因果增量。

## ③ 业务应用场景

痛点：平台归因将自然搜索单量虚报为广告转化，导致ACOS虚低30-40%。
做法：将美国50州按历史销量配对，随机选25州暂停SP广告投放（对照），保留25州正常投放（实验），持续28天。DML控制基线销量、节假日、竞品排名后，估计SP广告净增量转化率。
量化产出：某暖奶器品牌实验结果显示真实广告增量ROAS为2.1×，而平台归因报告为6.8×——差距3倍，据此将SP预算削减40%，利润率提升8个百分点。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-50万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（94 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Geo-Level增量效果测量 — 面板DML实现
依赖: numpy, pandas, scikit-learn, econml
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import GradientBoostingRegressor
from econml.dml import LinearDML

np.random.seed(42)

# ── 合成数据：10个地区 × 30天 ──────────────────────────────────────
N_GEO = 10
N_DAYS = 30
N_OBS = N_GEO * N_DAYS

geo_ids = np.repeat(np.arange(N_GEO), N_DAYS)
day_ids = np.tile(np.arange(N_DAYS), N_GEO)

# 基线特征（混杂变量）: 历史销量均值 + 节假日指标
baseline_sales = np.random.uniform(50, 200, N_GEO)[geo_ids]
holiday_effect = np.sin(day_ids * 2 * np.pi / 7) * 10  # 周期性

# 处置变量T：实验组 = 地区0-4，对照组 = 地区5-9
treatment = (geo_ids < 5).astype(float)

# 真实增量效果 θ = 15（每天销量+15）
TRUE_THETA = 15.0
noise = np.random.normal(0, 8, N_OBS)
sales = (
    baseline_sales
    + holiday_effect
    + TRUE_THETA * treatment
    + noise
)

# ── 构造面板特征矩阵 X ────────────────────────────────────────────
X = np.column_stack([
    baseline_sales,
    holiday_effect,
    day_ids / N_DAYS,           # 时间趋势
    (geo_ids % 3).astype(float) # 地区分组虚拟变量（简化）
])

Y = sales
T = treatment

# ── LinearDML 估计增量效果 ────────────────────────────────────────
# model_y: 预测 E[Y|X]
# model_t: 预测 E[T|X]
# 交叉拟合自动消除过拟合偏差
dml = LinearDML(
    model_y=GradientBoostingRegressor(n_estimators=50, max_depth=3),
    model_t=Ridge(alpha=1.0),
    cv=3,
    random_state=42
)
dml.fit(Y, T, X=X)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.20335 — Dynamic Synthetic Controls vs. Panel-Aware Double Machine Learning for Geo-Level Marketing Impact Estimation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：地理级面板数据：地区×日期的销量或转化结果、处理指示（停投/投放）、协变量（基线销量、节假日指标、时间趋势、地区分组），代码模板示例为 10 个地区 × 30 天，卡页业务示例为 50 州配对、28 天实验期。

**输出**：控制混杂后的广告净增量转化率与增量 ROAS，以及与平台归因报表的差值对照（卡页示例：真实增量 ROAS 2.1x、平台归因 6.8x），供预算削减或再分配决策（示例：SP 预算削减 40%、利润率提升 8 个百分点）。

## 执行步骤

1. 汇总地区×日期的面板销量、投放指示与协变量数据
2. 按历史销量配对地区并随机划分处理组与控制组
3. 按完整周期持续实验（示例 28 天）并保持投放策略不变
4. 用面板 DML 做交叉拟合与双重去偏，估计净增量转化率
5. 对比平台归因结果，重新分配或削减投放预算

## 边界与不做

- 何时不用：平台允许用户级分流时用常规 A/B；只有单个地区、无法配对时改用合成控制法做反事实基线。
- 能力边界：只做效应估计，停投与复投动作由投放系统执行；实验期停投会造成短期销量损失并可能被竞品抢占，需事前评估风险。
- 卡页数字（真实 2.1x 对比平台 6.8x、削减 SP 预算 40%、利润率 +8 个百分点）为示例场景结论，不可直接套用。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Augmented-Synthetic-Control-ML.html、Skill-Augmented-Synthetic-Control-ML、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Bayesian-MMM-Action-Plan-Generator.html、Skill-Bayesian-MMM-Action-Plan-Generator、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution
- **可组合**：Skill-Adaptive-Forecast-Accuracy-Optimization.html、Skill-Adaptive-Forecast-Accuracy-Optimization、Skill-Geo-Incrementality-DML

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：13-广告分析　·　源卡：`Skill-Geo-Incrementality-DML`