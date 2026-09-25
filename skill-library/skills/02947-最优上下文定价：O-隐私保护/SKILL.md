---
name: "p2s-contextual-dynamic-pricing-optimal"
title: "Contextual Dynamic Pricing — 最优上下文定价：O(√dT) Regret + LDP 隐私保护"
description: "触发词：上下文动态定价、个性化报价、在线学习定价、隐私保护定价、序贯试价、新客收敛。何时不用：只有离线历史价格-销量序列、没有在线试价回路时用「需求价格弹性估算」；要按买家档位而非逐单报价时用「Price Fence 分档定价」。安全边界：个性化报价须遵守平台反价格歧视与隐私合规要求，产出的是报价建议与仿真结论，不是自动改价指令。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 分群"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Contextual-Dynamic-Pricing-Optimal"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "边卖边学地给每个用户报价：不用先知道他的支付意愿，靠购买反馈几百轮就把最优价格试出来，比等 A/B 实验快得多。"
user_try: "试试：把独立站的用户上下文（月龄段、复购频次、平台来源）接进上下文定价器，先跑一版个性化报价的模拟并看累积 Regret。"
whenToUse: "当报价可以按上下文在线迭代、每单都要在用户/商品/市场特征下选价，且能拿到购买或放弃的二值反馈时用本技能；若只有历史价格-销量序列、没有在线试价回路，改用「需求价格弹性估算」；若目标是把买家分成几档而非逐单报价，用「Price Fence 分档定价」；若为临期库存做收益最大化，用「EMSR-b 边际库存定价」。"
workflow: "构建上下文特征向量：用户月龄段与复购行为、商品规格与认证、竞品均价与大促距离 → 初始化 OptimalContextualPricer，设定上下文维度与候选价格区间 → 在用户下单前调用 propose_price 输出上下文感知报价 → 用购买或放弃的二值反馈调用 observe_outcome 更新模型 → 用 simulate_pricing_trial 跑批量仿真核对累积 Regret 后再灰度上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Contextual Dynamic Pricing — 最优上下文定价：O(√dT) Regret + LDP 隐私保护

## ① 解决的问题

业务背景：不同用户群（海外华人/本地消费者/新生儿家庭）对同款婴幼儿奶粉的购买意愿差异显著

## ② 核心算法逻辑

上下文定价（Contextual Dynamic Pricing）将传统 MAB 定价问题扩展为依赖上下文的序贯决策。买家的潜在估值（valuation）被建模为：

## ③ 业务应用场景

业务背景：不同用户群（海外华人/本地消费者/新生儿家庭）对同款婴幼儿奶粉的购买意愿差异显著。传统定价对所有用户一刀切，损失大量利润空间。
| 特征类别 | 特征维度（示例） | |---------|----------------| | 用户上下文 | 婴儿月龄段（0-6/6-12/12-24个月）、历史复购频次、首购/复购标签、平台来源 | | 商品上下文 | 规格（900g/1.8kg）、段数（1/2/3段）、有机认证标志、季节性需求指数 | | 市场上下文 | 竞品近7日均价、平台大促距离天数、当地育儿论坛热度指数 |
算法应用：每个用户下单前，构建 $X_t \in \mathbb{R}^{15}$，UCB-based 定价器给出个性化报价。关键优势：在不知道用户真实 WTP（支付意愿）的情况下，通过序贯购买/放弃信号反向学习，300-500轮后收敛速度比 A/B 测试快 60%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（22 行）。**下面 22 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **22 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，22 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/contextual_dynamic_pricing_optimal` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Contextual-Dynamic-Pricing-Optimal.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速使用示例
from paper2skills_code.pricing.contextual_dynamic_pricing import (
    PricingContext,
    OptimalContextualPricer,
    simulate_pricing_trial,
)

# 构建上下文
ctx = PricingContext(
    product_features=[0.8, 1.0, 0.5],   # 规格/认证/竞争力
    user_features=[0.3, 0.7, 1.0],       # 月龄段/复购频次/平台权重
    market_features=[0.6, 0.2],          # 竞品价格指数/大促距离
)

pricer = OptimalContextualPricer(context_dim=8, price_range=(50.0, 200.0))
price = pricer.propose_price(ctx)        # 上下文感知报价
pricer.observe_outcome(purchased=True)   # 二值反馈学习

# 批量模拟
results = simulate_pricing_trial(n_rounds=1000)
print(f"累积 Regret: {results['cumulative_regret']:.2f}")
print("[✓] Contextual Dynamic Pricin 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.02424 — Contextual Dynamic Pricing: Algorithms, Optimality, and Local Differential Privacy Constraints

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：每个决策点的上下文特征：用户侧（婴儿月龄段、历史复购频次、首购/复购标签、平台来源）、商品侧（规格、段数、有机认证、季节性需求指数）、市场侧（竞品近 7 日均价、大促距离天数、当地论坛热度指数），以及持续回流的购买/未购买二值反馈；粒度为一次报价机会。

**输出**：每个用户下单前的一条上下文感知报价，以及报价后的模型更新；批量仿真时输出累积 Regret 供评估；供定价与增长运营评审后上线，输出为报价建议而非改价动作。

## 执行步骤

1. 把用户、商品、市场三类上下文整理成特征向量并对齐定价器输入维度
2. 初始化 OptimalContextualPricer 并设定上下文维度与价格上下限
3. 在用户下单前调用 propose_price 给出上下文感知报价
4. 用购买或放弃信号调用 observe_outcome 完成二值反馈学习
5. 用 simulate_pricing_trial 批量仿真核对累积 Regret 后再灰度上线

## 边界与不做

- 数据不满足：缺少稳定的上下文特征回流、或拿不到购买/未购买反馈时模型学不动，不要用本技能硬跑。
- 何时不用：只有离线价格-销量序列时用「需求价格弹性估算」；按买家档位设计价差时用「Price Fence 分档定价」；库存驱动的收益管理用「EMSR-b 边际库存定价」。
- 能力边界：只产出报价建议与仿真 Regret，不含自动改价执行，也不替代平台的定价合规审批。
- 安全边界：个性化报价不得基于受保护属性，隐私保护参数与披露口径需先过合规再上线。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-Psychological-Pricing-AB-Test.html、Skill-Psychological-Pricing-AB-Test、Skill-Contextual-Dynamic-Pricing-Optimal

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Contextual-Dynamic-Pricing-Optimal`