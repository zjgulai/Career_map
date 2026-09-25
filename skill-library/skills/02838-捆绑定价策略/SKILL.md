---
name: "p2s-bundle-pricing-strategy"
title: "Bundle Pricing Strategy（捆绑定价策略）"
description: "触发词：捆绑定价、纯捆绑、混合捆绑、配件回购、套餐价、利润模拟。何时不用：要用单品历史价格-销量与弹性求套餐最大利润点用「Dynamic Bundle Pricing」，要按竞品实时价跟随调价用「Competitive Price Monitoring」；本技能只决定捆绑结构与套餐挂牌价，不管单品日常价。安全边界：模型只输出价格方案，改价与上架捆绑 Listing 须人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Bundle-Pricing-Strategy"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "判断配件值不值得捆、该做纯捆绑还是混合捆绑，并算出既不吓跑只买主机的用户、又能拉高客单价的套餐价。"
user_try: "试试：S1 吸奶器单品 $129、配件包 $39，竞品捆绑包卖 $149，帮我算纯捆绑最优价和混合捆绑方案，看哪种总利润更高。"
whenToUse: "已知单品成本、用户估值分布与配件回购行为，要在纯捆绑与混合捆绑之间选结构并定捆绑价时用；要用单品历史价格-销量与价格弹性估套餐需求、求最大利润点用「Dynamic Bundle Pricing」，要按竞品实时价跟随调价用「Competitive Price Monitoring」。"
workflow: "汇总单品成本、用户估值分布与配件回购率、回购间隔 → 用估值分布与协同效应求纯捆绑最优价格 → 按单品价与捆绑价模拟用户在买 A／买 B／买捆绑／不买之间的决策 → 对比纯捆绑、混合捆绑与纯单品的总利润 → 结合竞品捆绑包价格给出最终套餐定价建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Bundle Pricing Strategy（捆绑定价策略）

## ① 解决的问题

定价经理面临单卖转化低——捆绑定价将客单价从68元提到89元，年化增收26万元

## ② 核心算法逻辑

论文：The Economics of Bundling | arXiv：1502.04066

## ③ 业务应用场景

业务问题：S1 吸奶器单品 $129，配件包（法兰+奶瓶+储奶袋）单品 $39。发现购买吸奶器的用户 60%+ 会在 30 天内回购配件。设计捆绑包"S1 Complete Set"应该定价多少？
数据要求：吸奶器购买用户的配件回购率 + 时间间隔 + 竞品捆绑包价格（Momcozy Complete $149）
预期产出： - 纯捆绑分析：$P_{bundle}^* = \$152$（基于估值分布优化） - 混合捆绑：单品 $129 + $39，捆绑包 $149（低于纯捆绑最优但高于竞品） - 混合捆绑策略使总利润 +18% vs 纯单品：既捕获了"全买"用户的高客单价，又不丢失"只买主机"用户

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：捆绑使配件回购率 60%→85%，客单价 +$20，年化 $10-15 万
实施难度：⭐⭐☆☆☆（2 星）
优先级评分：⭐⭐⭐⭐☆（4 星）— 母婴天然适合捆绑（主机+耗材）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（84 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/bundle_pricing_strategy` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Bundle-Pricing-Strategy.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Bundle Pricing Strategy — 混合捆绑定价优化"""

import numpy as np
from scipy.optimize import minimize_scalar


def pure_bundle_optimal_price(
    cost_a: float, cost_b: float,
    va_mean: float, va_std: float,
    vb_mean: float, vb_std: float,
    synergy: float = 0.1
) -> float:
    """纯捆绑最优价格"""
    bundle_cost = cost_a + cost_b
    
    def neg_profit(price):
        # 捆绑估值分布（正态假设）
        bundle_value_mean = va_mean + vb_mean + synergy * (va_mean + vb_mean)
        bundle_value_std = np.sqrt(va_std**2 + vb_std**2)
        prob_buy = 1 - _norm_cdf(price, bundle_value_mean, bundle_value_std)
        return -(price - bundle_cost) * prob_buy
    
    res = minimize_scalar(neg_profit, bounds=(bundle_cost, va_mean+vb_mean*2), method='bounded')
    return res.x


def mixed_bundle_simulate(
    cost_a: float, cost_b: float,
    prices: dict,  # {'single_a':, 'single_b':, 'bundle':}
    n_users: int = 10000
) -> dict:
    """混合捆绑模拟"""
    np.random.seed(42)
    va = np.random.normal(120, 30, n_users)
    vb = np.random.normal(35, 15, n_users)
    synergy = np.random.uniform(0, 0.15, n_users)
    vbundle = va + vb + synergy * (va + vb)
    
    # 用户决策
    profits = {'single_a': 0, 'single_b': 0, 'bundle': 0, 'total': 0}
    
    for i in range(n_users):
        options = {
            'none': 0,
            'single_a': va[i] - prices['single_a'],
            'single_b': vb[i] - prices['single_b'],
            'bundle': vbundle[i] - prices['bundle'],
        }
        best = max(options, key=options.get)
        
        if best == 'single_a':
            profits['single_a'] += prices['single_a'] - cost_a
        elif best == 'single_b':
            profits['single_b'] += prices['single_b'] - cost_b
        elif best == 'bundle':
            profits['bundle'] += prices['bundle'] - cost_a - cost_b
    
    profits['total'] = profits['single_a'] + profits['single_b'] + profits['bundle']
    return profits
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1502.04066，但该号在 arXiv 上是《Viscous corrections to anisotropic flow and transverse momentum spectra from transport theory》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《The Economics of Bundling》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：单品与用户估值粒度：两个单品的单位成本、用户对单品 A／B 的估值均值与标准差、捆绑协同效应系数（模板默认 0.1）；行为侧要配件回购率与回购时间间隔（卡页案例为 60%+ 用户在 30 天内回购配件），以及竞品捆绑包价格（案例为 Momcozy Complete $149）；模拟需指定用户数（模板默认 10000）与三档价格（单 A、单 B、捆绑）。缺估值分布或成本时求不出最优价。

**输出**：价格与利润级产出：纯捆绑最优价格（案例口径 $152）、混合捆绑方案下的分渠道利润（单 A／单 B／捆绑）与总利润对比、相对纯单品的利润变化（案例口径 +18%），以及最终套餐定价建议；供定价经理决定捆绑结构与套餐挂牌价使用。

## 执行步骤

1. 汇总两个单品的成本、用户估值分布与配件回购率、回购间隔
2. 用估值分布与协同效应求纯捆绑的最优价格
3. 按单品价与捆绑价模拟用户四选一决策（买 A／买 B／买捆绑／不买）
4. 对比纯捆绑、混合捆绑与纯单品的总利润
5. 结合竞品捆绑包价格给出套餐定价与结构建议

## 边界与不做

- 数据不满足：缺用户估值分布、单品成本或配件回购行为数据时不要用——先补齐估值与成本口径，否则最优价只是假设值。
- 何时不用：要用单品历史价格-销量与弹性求套餐最大利润点用「Dynamic Bundle Pricing」，要按竞品实时价跟随调价用「Competitive Price Monitoring」；本技能也不负责单品日常价与促销节奏。
- 能力边界：只给捆绑结构与套餐价格方案，不直接改价、不代替上架捆绑 Listing；卡页 ROI（配件回购率 60%→85%、客单价 +$20、年化 $10-15 万）与示例结论为估算口径，落地须用本店实际数据重算。
- 安全边界：模型只输出价格方案，改价与上架须人工确认后执行。

## 技能关联

- **前置**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **延伸**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Bundle-Pricing-Strategy

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：17-价格优化　·　源卡：`Skill-Bundle-Pricing-Strategy`