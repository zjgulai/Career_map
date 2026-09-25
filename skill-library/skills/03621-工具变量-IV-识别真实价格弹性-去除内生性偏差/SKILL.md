---
name: "p2s-pricing-causal-identification"
title: "Pricing Causal Identification — 工具变量 IV 识别真实价格弹性（去除内生性偏差）"
description: "触发词：内生性偏差、工具变量、两阶段估计、真实弹性识别、与 OLS 对比、定价因果。何时不用：高维混淆变量下做去偏估计用「双重去偏机器学习价格弹性」；只想快速估一条基线弹性用「需求价格弹性估算」。安全边界：竞品价格监控须用合法数据源，不得直接爬取平台；识别结论需人工复核后才进入定价策略。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 因果局限审查"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Pricing-Causal-Identification"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "OLS 说降价没用，可能只是被内生性骗了：用工具变量把真实弹性识别出来，再决定定价策略。"
user_try: "试试：我用 OLS 算出弹性只有 -0.3，怀疑被高销量提价的反向因果压低了，帮我用工具变量重新估一版。"
whenToUse: "当 OLS 弹性估计与业务直觉冲突、怀疑反向因果导致低估时用本技能；若混淆变量维度高、想用机器学习去偏，用「双重去偏机器学习价格弹性」；若只需一条快速基线，用「需求价格弹性估算」。"
workflow: "准备 180 天日度的本品价格、销量、竞品价格与原材料指数 → 选取工具变量并论证排他性约束 → 用两阶段最小二乘估计弹性并计算标准误 → 与 OLS 估计做偏差对照 → 输出基于真实弹性的最优定价建议区间"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Pricing Causal Identification — 工具变量 IV 识别真实价格弹性（去除内生性偏差）

## ① 解决的问题

数据科学家面临"OLS估计弹性偏低导致放弃有效价格促销策略"——工具变量IV将弹性估计偏差降低80%，年化基于真实弹性优化定价增收50-120万元

## ② 核心算法逻辑

核心问题：用普通线性回归估计价格弹性时存在内生性偏差——高销量时商家倾向提价，低销量时倾向降价，导致 OLS 估计的弹性系数严重低估（看起来"降价没用"）。工具变量（IV）通过寻找只影响价格但不直接影响销量的外生变量，打破这种反向因果，识别真实弹性。

## ③ 业务应用场景

场景1：婴儿奶粉真实价格弹性识别（避免低估导致降价策略失效） - 业务问题：运营用 OLS 回归发现弹性仅 -0.3（降价 10% 仅增销 3%），因此放弃价格促销；但实际弹性用 IV 估计后为 -1.8，说明价格促销有显著效果 - 数据要求：180 天日度数据（本品价格+销量+竞品价格+原材料指数） - 预期产出：IV 弹性估计 + OLS 偏差对比 + 最优定价建议区间 - 业务价值：基于真实弹性优化定价策略，年化 GMV 提升 15-25%，约 50-120 万元
**三轨验证**： - 成本：需要 6 个月以上历史数据 + 竞品价格监控（约 2000 元/月 API 成本） - 合规：竞品价格监控须通过合法数据源（JungleScout/Helium10 等），不直接爬取 Amazon - 风险：若工具变量选取不当（排他性限制不满足），IV 估计比 OLS 偏差更大

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：正确识别弹性后定价策略有效性提升，年化 GMV 增量 15-25%；以单品月销 50 万元计，年化增收 90-150 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐⭐
评估依据：定价是电商最高杠杆决策，内生性偏差普遍存在于所有 OLS 弹性估计中，修正后的决策质量提升远超工具建设成本。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（55 行）。**下面 55 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **55 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，55 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from numpy.linalg import lstsq

def two_stage_least_squares(prices, quantities, instruments):
    """
    两阶段最小二乘估计价格弹性
    prices: 对数价格数组
    quantities: 对数销量数组
    instruments: 工具变量矩阵 (n x k)
    """
    n = len(prices)
    X = np.column_stack([np.ones(n), prices])
    Z = np.column_stack([np.ones(n), instruments])
    # Stage 1: 用 IV 预测价格
    alpha, _, _, _ = lstsq(Z, prices, rcond=None)
    price_hat = Z @ alpha
    # Stage 2: 用预测价格估计弹性
    X_hat = np.column_stack([np.ones(n), price_hat])
    beta, _, _, _ = lstsq(X_hat, quantities, rcond=None)
    # 标准误计算
    residuals = quantities - X @ beta
    sigma2 = np.var(residuals)
    XtX_inv = np.linalg.inv(X_hat.T @ X_hat)
    se = np.sqrt(np.diag(sigma2 * XtX_inv))
    return {
        "elasticity_2sls": round(beta[1], 4),
        "intercept": round(beta[0], 4),
        "std_error": round(se[1], 4),
        "t_stat": round(beta[1] / se[1], 3),
    }

def ols_elasticity(prices, quantities):
    """对照：OLS 估计（存在内生性偏差）"""
    X = np.column_stack([np.ones(len(prices)), prices])
    beta, _, _, _ = lstsq(X, quantities, rcond=None)
    return round(beta[1], 4)

if __name__ == "__main__":
    np.random.seed(42)
    n = 180
    # 模拟数据：真实弹性 -1.8，但内生性导致 OLS 低估
    competitor_price = np.random.normal(0, 0.1, n)   # 工具变量（竞品价格变化）
    true_demand_shock = np.random.normal(0, 0.3, n)  # 未观测需求冲击
    prices = -0.5 * competitor_price + 0.4 * true_demand_shock + np.random.normal(0, 0.05, n)
    quantities = -1.8 * prices - 0.5 * true_demand_shock + np.random.normal(0, 0.1, n)
    # 估计
    ols_est = ols_elasticity(prices, quantities)
    iv_result = two_stage_least_squares(prices, quantities, competitor_price.reshape(-1, 1))
    print(f"真实弹性: -1.800")
    print(f"OLS 估计: {ols_est}  （内生性偏差 {abs(-1.8 - ols_est):.3f}）")
    print(f"IV  估计: {iv_result['elasticity_2sls']}  （偏差 {abs(-1.8 - iv_result['elasticity_2sls']):.3f}）")
    print(f"t统计量: {iv_result['t_stat']}")
    assert abs(iv_result['elasticity_2sls'] - (-1.8)) < abs(ols_est - (-1.8)), "IV should be closer to true value"
    print("[✓] Pricing Causal Identification 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：180 天日度数据：本品价格与销量、竞品价格、原材料成本指数；工具变量矩阵与可选控制变量；粒度为 SKU × 天。

**输出**：两阶段最小二乘的弹性估计（含标准误与 t 统计量）、与 OLS 的偏差对照，以及基于真实弹性的最优定价建议区间；供定价策略与促销决策使用。

## 执行步骤

1. 准备 180 天日度价格、销量、竞品价格与原材料指数
2. 选定工具变量并论证排他性约束
3. 用两阶段最小二乘估出弹性与标准误
4. 与 OLS 估计做偏差对照
5. 输出最优定价建议区间供策略使用

## 边界与不做

- 数据不满足：不足 6 个月历史数据或缺可用工具变量时不适用；工具变量选取不当会让估计比 OLS 偏差更大。
- 何时不用：高维混淆场景用「双重去偏机器学习价格弹性」；快速基线用「需求价格弹性估算」。
- 能力边界：只做识别与估计，不含竞品数据采集基建与自动改价。
- 安全边界：竞品价格须通过 JungleScout、Helium10 等合法数据源获取，不得直接爬取 Amazon。

## 技能关联

- **可组合**：Skill-Pricing-Causal-Identification

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Pricing-Causal-Identification`