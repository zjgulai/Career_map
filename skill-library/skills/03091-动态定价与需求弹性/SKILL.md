---
name: "p2s-dynamic-pricing-elasticity"
title: "Dynamic Pricing with Demand Elasticity（动态定价与需求弹性）"
description: "触发词：动态定价、需求弹性、竞品跟价、贝叶斯弹性更新、最优价格区间、价格杠杆。何时不用：竞品用自动跟价工具、要打乱对方节奏用「混合策略定价不可预测性」；要按库存窗口保护高价档收益用「EMSR-b 边际库存定价」。安全边界：竞品价格须来自合规数据源，调价建议需人工确认，不得用于平台禁止的自动跟价与价格操纵。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Dynamic-Pricing-Elasticity"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "竞品降价时该跟多少、什么时候涨回去：用弹性矩阵加动态策略，给出各市场的跟降幅度与可守价格区间。"
user_try: "试试：美国站竞品把价格打到 $99，我该跟降到多少？按我的弹性给出跟降幅度和可守的价格区间。"
whenToUse: "当已有各市场价格弹性估计、要在竞品价格波动中决定跟价幅度与价格区间时用本技能；若要主动打乱竞品跟价算法的节奏，用「混合策略定价不可预测性」；若以库存分层收益为目标，用「EMSR-b 边际库存定价」。"
workflow: "汇总各市场 12 个月日销量与价格历史，并接入 3-5 个竞品的每日价格 → 用弹性估计器（含贝叶斯更新）算出各市场弹性矩阵 → 竞品价格变动时用 DynamicPricingAgent 给出跟降或跟涨幅度 → 用竞品溢价约束与单次调幅限制裁剪建议价 → 输出各市场最优价格区间并纳入日常监测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dynamic Pricing with Demand Elasticity（动态定价与需求弹性）

## ① 解决的问题

吸奶器在美国定价 $129，德国 €119，英国 £99

## ② 核心算法逻辑

论文：Deep Reinforcement Learning for Trading | arXiv：1811.02395

## ③ 业务应用场景

业务问题：吸奶器在美国定价 $129，德国 €119，英国 £99。但美国市场竞品 Momcozy 经常在亚马逊闪电促销降价到 $99，导致我们的转化率周期性波动。需要动态调价策略——竞品降价时跟多少？竞品恢复后涨回去吗？
数据要求： - 各市场 12 个月日销量 + 价格历史 - 竞品价格（Momcozy/Medela/Spectra 等 3-5 个竞品）每日监测 - 各市场价格弹性估计（来自历史 A/B 测试或准实验）
预期产出： - 弹性矩阵：美国 $|\epsilon|=1.5$（高度弹性→不宜轻易涨价）、德国 $|\epsilon|=1.1$（中等）、英国 $|\epsilon|=0.9$（偏非弹性→涨价空间大） - DRL 策略：竞品降价 15% 时，我们跟降 8-12%（而非完全匹配）以平衡利润和份额 - 最优价格区间：美国 $119-135 / 德国 €109-125 / 英国 £95-108

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：利润率 +8-12%，月 GMV $50 万 → 年化 50-80 万元
实施难度：⭐⭐⭐☆☆（3 星）— 需要持续竞品监测 + A/B 验证
优先级评分：⭐⭐⭐⭐⭐（5 星）— 定价是电商四大杠杆之首（定价 > 流量 > 转化率 > 复购率）
评估依据：价格弹性估计是所有定价决策的基础，新领域 17-价格优化的第一张核心卡片

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（128 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/17-价格优化/dynamic_pricing_elasticity` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Dynamic-Pricing-Elasticity.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Dynamic Pricing with Demand Elasticity — DRL + Bayesian 弹性估计
"""

import numpy as np
from scipy.optimize import minimize_scalar
from typing import Dict, Tuple


class DemandElasticityEstimator:
    """需求价格弹性估计"""
    
    def __init__(self, prior_elasticity: float = -1.5, prior_std: float = 0.5):
        self.elasticity = prior_elasticity
        self.std = prior_std
        self.n_obs = 0
    
    def update(self, price_change_pct: float, demand_change_pct: float):
        """贝叶斯更新弹性估计"""
        if abs(price_change_pct) < 0.001:
            return
        new_obs = demand_change_pct / price_change_pct
        self.n_obs += 1
        alpha = 1.0 / (1.0 + self.n_obs)
        self.elasticity = (1 - alpha) * self.elasticity + alpha * new_obs
        self.std *= 0.95  # 随观测增加不确定性递减
    
    def optimal_price(self, cost: float, current_price: float,
                      competitor_price: float = None) -> float:
        """计算最优价格"""
        eps = abs(self.elasticity)
        if eps <= 1.0:
            # 非弹性需求 → 涨价
            return current_price * 1.05
        margin = (eps - 1) / eps
        optimal = cost / (1 - margin) if margin > 0 else cost * 2
        
        if competitor_price and competitor_price < optimal:
            # 竞品约束：不高于竞品 15% 以上
            optimal = min(optimal, competitor_price * 1.15)
        
        # 调价幅度限制
        return np.clip(optimal, current_price * 0.8, current_price * 1.2)


class DynamicPricingAgent:
    """简化 DRL 动态定价 Agent"""
    
    def __init__(self, cost: float, elasticity_estimator: DemandElasticityEstimator):
        self.cost = cost
        self.elasticity = elasticity_estimator
        self.price_history = []
        self.demand_history = []
    
    def decide_price(self, current_price: float, inventory: int,
                     demand_forecast: float, competitor_price: float) -> float:
        """
        定价决策
        
        Args:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1706.06551，但该号在 arXiv 上是《Grounded Language Learning in a Simulated 3D World》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Deep Reinforcement Learning for Trading》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各市场 12 个月日销量与价格历史、3-5 个竞品的每日价格监测数据、各市场由历史 A/B 或准实验得到的弹性估计；粒度为市场 × SKU × 天。

**输出**：各市场弹性矩阵、竞品动作下的跟价幅度建议与最优价格区间（含竞品溢价约束与单次调幅限制）；供定价运营日常执行参考。

## 执行步骤

1. 汇总各市场 12 个月日销量与价格历史并接入竞品每日价格
2. 用弹性估计器做贝叶斯更新，得到各市场弹性矩阵
3. 竞品价格变动时用动态定价 Agent 给出跟降或跟涨幅度
4. 按竞品溢价约束与单次调幅上限裁剪建议价
5. 输出各市场最优价格区间并纳入日常监测

## 边界与不做

- 数据不满足：没有竞品每日价格或弹性估计时不建议做跟价决策，缺 12 个月历史时先补数据。
- 何时不用：对抗自动跟价算法用「混合策略定价不可预测性」；库存分层收益用「EMSR-b 边际库存定价」。
- 能力边界：只输出跟价幅度与价格区间建议，不含改价执行与竞品数据采集。
- 安全边界：竞品价格采集须走合规数据源，建议价人工确认，不得用于价格操纵。

## 技能关联

- **前置**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Cross-Border-Price-Harmonization.html、Skill-Cross-Border-Price-Harmonization、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Markdown-Optimization.html、Skill-Markdown-Optimization、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-Dynamic-Pricing-Elasticity

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Dynamic-Pricing-Elasticity`