---
name: "p2s-price-elasticity-time-series-fusion"
title: "Price Elasticity Time Series Fusion — 价格弹性×时间序列融合预测"
description: "触发词：弹性融合预测、降价备货、大促销量预测、时序修正、需求量推算、备货准确率。何时不用：只判断要不要打折、不看备货量时用「需求价格弹性估算」；要规划清仓折扣路径用「折扣清仓定价优化」。安全边界：预测为估算值，备货须留安全库存余量，不得直接作为采购或资金承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 需求预测 / 促销规划"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Price-Elasticity-Time-Series-Fusion"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "降价前先算清会多卖多少：把价格弹性和时序预测合起来，给出大促备货量而不是拍脑袋。"
user_try: "试试：黑五我打算降价 25%，帮我用历史弹性和时序基线预测销量，看要备多少货。"
whenToUse: "当已有基础销量预测、需要把计划降价折算成备货量时用本技能；若只判断折扣值不值得做，用「需求价格弹性估算」；若规划季末清仓的降价节奏，用「折扣清仓定价优化」。"
workflow: "拉取 52 周价格、销量、促销标记与 BSR 历史 → 用对数回归估计价格弹性系数 → 用弹性指数把时序基础预测折算为降价后销量 → 输出调整后预测与需求变化幅度供备货决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price Elasticity Time Series Fusion — 价格弹性×时间序列融合预测

## ① 解决的问题

运营面临"黑五计划降价25%需要预测销量确定备货量但纯时序模型不感知价格变化"——价格弹性融合时序将大促备货准确率提升40%，年化减少缺货损失25万元

## ② 核心算法逻辑

论文：Demand Forecasting with Price Elasticity Embedding for ECommerce | 年份：2022

## ③ 业务应用场景

场景：某卖家吸奶器 A 款在黑五计划降价 25%，需要预测降价后的销量以确定备货量和 FBA 补仓时机。历史显示该品类弹性约 -2.1。
数据要求：52 周价格 + 销量记录，促销标记，BSR 历史。
融合预测：时序基础预测 = 200 件/周，价格调整因子 = (75/100)^(-2.1) ≈ 1.65，预测黑五销量 = 200 × 1.65 = 330 件/周。比之前简单拍脑袋 250 件更有根据。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

25 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（81 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def estimate_price_elasticity(
    prices: np.ndarray,
    quantities: np.ndarray,
    controls: np.ndarray = None
) -> dict:
    """
    价格弹性估计（对数线性回归）
    prices: 价格序列
    quantities: 销量序列
    controls: 控制变量矩阵（趋势、季节等）
    """
    log_p = np.log(prices + 1e-8)
    log_q = np.log(quantities + 1e-8)

    if controls is not None:
        X = np.column_stack([np.ones(len(log_p)), log_p, controls])
    else:
        X = np.column_stack([np.ones(len(log_p)), log_p])

    # OLS 估计
    beta = np.linalg.lstsq(X, log_q, rcond=None)[0]
    elasticity = beta[1]  # ln(p) 的系数即弹性

    # 计算 R²
    y_pred = X @ beta
    ss_res = np.sum((log_q - y_pred) ** 2)
    ss_tot = np.sum((log_q - np.mean(log_q)) ** 2)
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0

    return {'elasticity': elasticity, 'r2': r2, 'beta': beta}

def price_elasticity_ts_forecast(
    base_forecast: float,
    base_price: float,
    new_price: float,
    elasticity: float
) -> dict:
    """
    价格弹性×时序融合预测
    """
    price_ratio = new_price / base_price
    adjustment = price_ratio ** elasticity
    adjusted_forecast = base_forecast * adjustment

    return {
        'base_forecast': base_forecast,
        'price_ratio': price_ratio,
        'elasticity': elasticity,
        'adjustment_factor': adjustment,
        'adjusted_forecast': adjusted_forecast,
        'demand_change_pct': (adjustment - 1) * 100
    }

# 测试
np.random.seed(42)
n = 52
# 生成价格弹性为 -2 的模拟数据
prices = np.random.uniform(90, 120, n)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2206.04615，但该号在 arXiv 上是《Beyond the Imitation Game: Quantifying and extrapolating the capabilities of language models》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Demand Forecasting with Price Elasticity Embedding for ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：52 周的价格与销量记录、促销标记与 BSR 历史，以及一个时序基础预测值（件/周）；粒度为 SKU × 周。

**输出**：降价情景下的销量预测：价格比、弹性、调整因子、调整后预测量与需求变化百分比；供备货与补货计划使用。

## 执行步骤

1. 拉取 52 周价格、销量、促销标记与排名历史
2. 用对数回归估计价格弹性系数
3. 用弹性指数修正时序基础预测量
4. 输出降价后的销量预测与需求变化幅度

## 边界与不做

- 数据不满足：缺少促销标记或基础预测值时不适用，先补齐时序基线。
- 何时不用：纯折扣值不值得的判断用「需求价格弹性估算」；清仓节奏规划用「折扣清仓定价优化」。
- 能力边界：只做价格维度的预测修正，不含补货执行与安全库存策略设计。
- 安全边界：预测为估算值，备货决策须留安全余量，不得直接作为采购或资金承诺。

## 技能关联

- **可组合**：Skill-Price-Elasticity-Time-Series-Fusion

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：03-时间序列　·　源卡：`Skill-Price-Elasticity-Time-Series-Fusion`