---
name: "p2s-demand-quantile-forecast"
title: "Demand Quantile Forecast — 需求分位数预测：备货决策的置信区间框架"
description: "触发词：分位数预测、P50/P85/P95、分级备货策略、安全库存触发、旺季锁产能。何时不用：需要无分布假设的区间保证用「共形预测区间框架」，要按漂移在线修正用「自适应预测精准化」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Demand-Quantile-Forecast"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把备货分成基础、安全、极端三档，各自对应不同分位数，旺季按档位提前锁产能。"
user_try: "试试：我这个推车 SKU 旺季需求会翻 2-3 倍，帮我训练 P50/P85/P95 分位数模型并给出三级备货策略。"
whenToUse: "本卡属需求预测中的分位数备货侧：需要用不同分位数分别驱动基础补货、安全库存与极端备货时用；需要严格覆盖率保证的区间，用共形预测类技能。"
workflow: "准备历史周需求与季节、促销标注 → 训练多分位数回归模型，输出 P50/P85/P95 → 评估各分位数的覆盖率是否符合预期 → 按分位数设定三级备货的触发时点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Demand Quantile Forecast — 需求分位数预测：备货决策的置信区间框架

## ① 解决的问题

供应链面临"均值备货导致断货率8%或大量积压"——分位数回归P50/P85/P95三级备货策略将缺货率降至3%，年化节省断货+积压损失20-35万元

## ② 核心算法逻辑

核心问题：传统需求预测输出单点均值，用于备货决策会导致50%概率断货、50%概率积压。母婴品类的损失函数严重不对称：断货一天损失排名+$2,000 GMV，积压一个月只损失存储费$0.5/件。正确做法是分位数预测——输出多个分位数，由业务决策层根据风险偏好选择备货量。

## ③ 业务应用场景

场景：某婴儿推车卖家，月销约 400 单，旺季（10-12月）需求激增 2-3 倍但方差极大。过去用均值预测导致：①Q4 断货 3 次，每次损失 BSR 位置 + $8,000 GMV；②淡季积压 1,200 件，长期仓储费 $3,600。
分位数备货策略： - P50 预测 → 基础补货（正常补货触发） - P85 预测 → 安全库存（旺季前 60 天触发） - P95 预测 → Prime Day/黑五极端备货（提前 90 天锁产能）
实施结果： - 断货率从 18% → 4.5%（减少 3 次断货损失，节省约 $24,000） - 积压量减少 40%（淡季备货更精准，节省仓储费 $1,500） - 年化综合节省：约 20-30 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

P50 预测 → 基础补货（正常补货触发）
P85 预测 → 安全库存（旺季前 60 天触发）
P95 预测 → Prime Day/黑五极端备货（提前 90 天锁产能）
断货率从 18% → 4.5%（减少 3 次断货损失，节省约 $24,000）
积压量减少 40%（淡季备货更精准，节省仓储费 $1,500）
年化综合节省：约 20-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（109 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.linear_model import QuantileRegressor
from sklearn.preprocessing import StandardScaler

def generate_baby_demand_data(n_weeks=104, seed=42):
    """生成模拟婴儿推车周需求数据（含季节性+促销效应）"""
    np.random.seed(seed)
    weeks = np.arange(n_weeks)

    # 基础趋势 + 季节性（Q4 旺季）
    seasonal = 1.0 + 0.8 * np.sin(2 * np.pi * weeks / 52 - np.pi/2)
    trend = 400 + weeks * 0.5
    promo = np.where((weeks % 26 == 0) | (weeks % 26 == 1), 1.6, 1.0)  # 大促
    noise = np.random.lognormal(0, 0.25, n_weeks)  # 右偏分布（旺季方差大）

    demand = (trend * seasonal * promo * noise).astype(int)
    demand = np.clip(demand, 50, 2000)

    # 特征工程
    df = pd.DataFrame({
        'week': weeks,
        'demand': demand,
        'week_of_year': weeks % 52,
        'is_q4': ((weeks % 52) >= 38).astype(int),
        'is_promo': (promo > 1).astype(int),
        'trend': weeks,
        'sin_season': np.sin(2 * np.pi * weeks / 52),
        'cos_season': np.cos(2 * np.pi * weeks / 52),
    })
    return df

def train_quantile_models(df, quantiles=(0.50, 0.85, 0.95)):
    """训练多个分位数回归模型"""
    feature_cols = ['week_of_year', 'is_q4', 'is_promo', 'trend', 'sin_season', 'cos_season']
    X = df[feature_cols].values
    y = df['demand'].values

    # 训练/测试分割（最后26周为测试集）
    split = len(df) - 26
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    models = {}
    predictions = {}
    for q in quantiles:
        model = QuantileRegressor(quantile=q, alpha=0.01, solver='highs')
        model.fit(X_train_s, y_train)
        models[q] = model
        predictions[q] = model.predict(X_test_s)

    return models, predictions, y_test, scaler

def evaluate_quantile_coverage(y_true, predictions):
    """评估分位数覆盖率（期望值 = 分位数）"""
    results = {}
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史周需求数据、季节与促销标注；SKU×周粒度，需覆盖旺季与淡季两个阶段以便评估分位数覆盖率。

**输出**：P50/P85/P95 分位数需求预测与对应的三级备货策略（基础补货、旺季前安全库存、提前锁产能的极端备货），输出给补货与产能计划。

## 执行步骤

1. 准备历史周需求数据与季节、促销标注。
2. 训练多分位数回归模型，输出 P50/P85/P95 预测。
3. 评估各分位数的覆盖率是否符合预期。
4. 按分位数设定基础补货、安全库存与极端备货的触发时点。

## 边界与不做

- 何时不用：历史序列不覆盖完整旺季与淡季时，分位数在高位段外推不可靠，不适用本技能。
- 能力边界：分位数覆盖率需持续回测；极端备货档位还受产能与资金约束，模型不负责产能可行性。

## 技能关联

- **可组合**：Skill-Demand-Quantile-Forecast

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Demand-Quantile-Forecast`