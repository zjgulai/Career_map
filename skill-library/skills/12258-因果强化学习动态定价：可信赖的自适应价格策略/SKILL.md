---
name: "p2s-causal-rl-dynamic-pricing"
title: "Causal RL Dynamic Pricing — 因果强化学习动态定价：可信赖的自适应价格策略"
description: "触发词：因果定价、价格弹性、混淆剔除、Double ML、反事实分析。何时不用：单点跟价与实时监测用「竞品价格监测」；本技能要剔除广告等混淆后再估真实弹性。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 因果局限审查"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Causal-RL-Dynamic-Pricing"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "大促时又降价又加广告，帮你分清到底是哪一个在带销量，别再学错策略。"
user_try: "试试：把黑五的降价和广告混淆剔除，算出我们真实的价格弹性是多少。"
whenToUse: "当价格与广告、季节等因素同时变化、需要分离真实价格效应并做反事实评估时用；只看竞品调价的即时应对不用本技能。"
workflow: "整理日粒度价格、广告、销量与外生变量数据 → 用残差化方法剔除广告等混淆影响 → 估计真实价格弹性与置信区间 → 做反事实分析并只在不确定处小额探索"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal RL Dynamic Pricing — 因果强化学习动态定价：可信赖的自适应价格策略

## ① 解决的问题

纯RL定价因广告混淆错误学到促销期降价总是有效策略大促后无效降价继续损耗利润——因果强化学习DoubleML剔除广告混淆后才估计真实价格弹性，防止策略崩溃年化避免错误策略损失20-60万元

## ② 核心算法逻辑

经典 RL 定价的问题：

## ③ 业务应用场景

业务问题：黑五期间广告花费翻 3 倍，同时价格降低 20%，销量大幅增长。事后无法判断：是降价带来了销量？还是广告带来了销量？下一次应该多花广告还是继续降价？纯 RL 模型在这种混淆下会学到错误策略。
数据要求： - 历史价格×广告花费×销量数据（日粒度，至少 6 个月） - 价格随机化实验数据（最好有历史 A/B 测试） - 外生变量：竞品价格/季节/BSR
预期产出： - 因果效应分解：价格对销量的真实弹性（剔除广告混淆后） - 因果 RL 策略：在不同竞品状态/季节下的最优定价动作 - 反事实分析："如果当时不降价但维持广告，销量会是多少？"

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
防止错误策略（"低价万能"混淆学到）：避免大促后无效降价损失 ¥10-30 万
精准分离价格 vs 广告效应：预算分配决策准确，整体 ROI 提升 15-20%
因果 Bandit 探索效率更高：收敛速度比纯 RL 快 30-50%（减少试错成本）
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐⭐☆（因果图建模需要业务领域知识；Double ML 有成熟实现（EconML）；完整因果 RL 约 6-8 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（184 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/pricing/causal_rl_dynamic_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Causal-RL-Dynamic-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Causal RL Dynamic Pricing
因果强化学习定价：消除混淆的自适应价格策略
"""
import numpy as np
from scipy.optimize import minimize_scalar


class DoubleMLPriceElasticity:
    """
    Double/Debiased ML 因果效应估计
    估计价格对销量的真实因果弹性（剔除广告混淆）
    """

    def __init__(self):
        self.theta = None        # 因果弹性（价格→销量）
        self.theta_se = None     # 标准误

    def fit(self, price: np.ndarray, sales: np.ndarray,
            confounders: np.ndarray) -> None:
        """
        Double ML 估计流程：
        1. 残差化价格（剔除混淆变量对价格的影响）
        2. 残差化销量（剔除混淆变量对销量的影响）
        3. 残差×残差 → 因果效应
        """
        n = len(price)

        # 第一阶段：用混淆变量预测价格（留一法残差）
        from numpy.linalg import lstsq
        X = np.column_stack([confounders, np.ones(n)])
        b_price = lstsq(X, price, rcond=None)[0]
        price_resid = price - X @ b_price

        # 第一阶段：用混淆变量预测销量
        b_sales = lstsq(X, sales, rcond=None)[0]
        sales_resid = sales - X @ b_sales

        # 第二阶段：残差回归
        X2 = price_resid.reshape(-1, 1)
        b2 = lstsq(X2, sales_resid, rcond=None)[0]
        self.theta = float(b2[0])

        # 方差估计（异方差稳健）
        fitted = X2 * self.theta
        resid2 = sales_resid - fitted.flatten()
        meat = float(np.sum((X2.flatten() * resid2) ** 2))
        bread = float(np.sum(X2.flatten() ** 2))
        self.theta_se = np.sqrt(meat / max(bread ** 2, 1e-10))


class CausalPriceBandit:
    """
    因果 Bandit 价格探索
    只在因果效应不确定时探索，避免混淆驱动的无效探索
    """

    def __init__(self, price_grid: np.ndarray, cost: float,
                 exploration_bonus: float = 0.3):
        self.prices = price_grid
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.18135 — Unifying Causal Reinforcement Learning: Survey, Taxonomy, Algorithms and Applications
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：日粒度历史价格、广告花费、销量数据至少 6 个月，价格随机化或 A/B 实验记录，以及外生变量（竞品价格、季节、BSR）。

**输出**：剔除混淆后的价格弹性估计与标准误、因果定价策略与反事实分析结论，供预算与定价决策。

## 执行步骤

1. 整理日粒度价格、广告、销量与外生变量数据
2. 用残差化方法剔除广告等混淆影响
3. 估计真实价格弹性与置信区间
4. 做反事实分析回答不降价会怎样
5. 只在因果不确定处做小额探索并记录

## 边界与不做

- 何时不用：数据不足 6 个月或价格与广告高度共线时，因果结论不可靠
- 能力边界：只输出弹性估计与策略建议，不保证收益，策略上线仍需小范围实验验证

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Pricing-Causal-Identification.html、Skill-Pricing-Causal-Identification、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Pricing-Causal-Identification.html、Skill-Pricing-Causal-Identification、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Pricing-Causal-Identification.html、Skill-Pricing-Causal-Identification、Skill-Causal-RL-Dynamic-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Causal-RL-Dynamic-Pricing`