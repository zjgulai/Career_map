---
name: "p2s-dynamic-bundle-pricing"
title: "Dynamic Bundle Pricing — 动态捆绑定价：配套商品组合最优定价策略"
description: "触发词：动态捆绑定价、套餐最优价、价格弹性曲线、配件渗透率、套餐组合 ROI、客单价提升。何时不用：要选纯捆绑还是混合捆绑并定结构用「Bundle Pricing Strategy」，要做多 SKU 联动定价与联盟博弈用「MAS 多 SKU 定价联盟博弈」；本技能只做单个套餐的定价与组合枚举。安全边界：模型只给套餐定价方案，改价与上架须人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Dynamic-Bundle-Pricing"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "给配套商品套餐找到利润最大的那个价格点，顺便回答该把哪几件商品捆在一起、能让多少原本只买主机的客户顺手买配件。"
user_try: "试试：独立站新生儿礼包（吸奶器+储奶袋+消毒器）单品合计 $249，现在卖 $239，帮我算最优套餐价和价格弹性曲线，再告诉我哪几个组合 ROI 最高。"
whenToUse: "已有各单品历史价格-销量、成本结构与价格弹性，要为某个套餐找最大利润定价点或枚举最值得捆的组合时用；要判断捆绑结构该用纯捆绑还是混合捆绑用「Bundle Pricing Strategy」，要多 SKU 联合定价与联盟稳定性判断用「MAS 多 SKU 定价联盟博弈」。"
workflow: "汇总各单品单价、成本、月需求与价格弹性 → 枚举候选商品组合并算成本、原价合计与折扣率 → 按最小单品需求×价格弹性影响×便利性加成估套餐需求 → 扫描价格得到利润曲线，取最大利润点作为最优套餐价 → 按利润率与 ROI 排出推荐组合与定价建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dynamic Bundle Pricing — 动态捆绑定价：配套商品组合最优定价策略

## ① 解决的问题

吸奶器配套储奶袋消毒器独立销售只有30%客户会主动购买配件——动态捆绑定价算法找到最优套餐组合和价格，配件渗透率提升到70%套餐利润率比单品高10-20%年化增益15-40万元

## ② 核心算法逻辑

为什么捆绑销售利润更高：

## ③ 业务应用场景

业务问题：独立站销售"新生儿礼包"（吸奶器+储奶袋+消毒器），原定价 $239（单品合计 $249），但不知道这个价格是否最优。是定 $229 转化率更高？还是 $249 利润更好？
数据要求： - 各单品的历史价格-销量数据 - 套餐历史销量和实验数据（如有） - 商品成本结构
预期产出： - 最优套餐定价（最大利润点） - 价格弹性曲线（利润 vs 套餐价格） - 建议套餐组合：哪些商品组合ROI最高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
套餐利润率比单品高 10-20%：月增利润 ¥3-10 万
配件渗透率从 30% → 70%（套餐效应）
用户 AOV 提升：客单价提升 25-40%
年化综合 ROI：¥15-40 万
实施难度：⭐⭐☆☆☆（需要单品历史数据；优化算法简单；约 1-2 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（165 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/pricing/dynamic_bundle_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Dynamic-Bundle-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Dynamic Bundle Pricing
动态捆绑定价：最优套餐组合与定价
"""
import numpy as np
from dataclasses import dataclass
from itertools import combinations


@dataclass
class Product:
    """单品"""
    product_id: str
    name: str
    unit_price: float
    unit_cost: float
    monthly_demand: float
    price_elasticity: float = -1.5  # 需求价格弹性


@dataclass
class Bundle:
    """捆绑套餐"""
    products: list
    bundle_price: float

    @property
    def total_cost(self):
        return sum(p.unit_cost for p in self.products)

    @property
    def items_regular_price(self):
        return sum(p.unit_price for p in self.products)

    @property
    def discount_rate(self):
        return (self.items_regular_price - self.bundle_price) / self.items_regular_price

    @property
    def margin(self):
        return (self.bundle_price - self.total_cost) / self.bundle_price


def estimate_bundle_demand(bundle: Bundle, price: float,
                            bundle_convenience_factor: float = 1.15) -> float:
    """估计套餐需求量（基于单品需求 + 便利性加成）"""
    # 套餐基础需求 = 各单品需求的加权平均（取最小的）
    min_demand = min(p.monthly_demand for p in bundle.products)

    # 价格弹性影响
    avg_elasticity = np.mean([p.price_elasticity for p in bundle.products])
    price_change = (price - bundle.items_regular_price) / bundle.items_regular_price
    demand_multiplier = (1 + avg_elasticity * price_change)

    # 套餐便利性加成（用户愿意因为方便而购买）
    bundle_lift = bundle_convenience_factor if price <= bundle.items_regular_price else 1.0

    return max(0, min_demand * demand_multiplier * bundle_lift)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.12456，但该号在 arXiv 上是《Deep-learning-based groupwise registration for motion correction of cardiac $T_1$ mapping》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：单品级：product_id、名称、单价、单位成本、月需求量与需求价格弹性（模板默认 -1.5）；套餐侧要套餐历史销量与实验数据（如有）、套餐挂牌价；成本结构需覆盖套餐内全部单品。卡页难度口径为需要单品历史数据，缺历史价格-销量或成本时估不出弹性与利润曲线。

**输出**：套餐级产出：最优套餐定价（最大利润点）、利润 vs 套餐价格的弹性曲线、各候选组合的折扣率／利润率／需求估计与 ROI 排序，以及配件渗透率与客单价变化预估；供独立站定价与套餐上架决策使用。

## 执行步骤

1. 汇总各单品的单价、成本、月需求与价格弹性
2. 用组合枚举列出候选套餐并算成本、原价合计与折扣率
3. 估套餐需求：最小单品需求×价格弹性影响×便利性加成
4. 扫描价格求利润曲线并取最大利润点
5. 按利润率与 ROI 排序输出推荐组合与定价建议

## 边界与不做

- 数据不满足：缺单品历史价格-销量或商品成本结构时不要用——先补齐单品级历史数据（卡页口径约 1-2 周实施），否则弹性只能靠假设。
- 何时不用：要选纯捆绑还是混合捆绑并定结构用「Bundle Pricing Strategy」，要做多 SKU 联动定价与均衡判断用「MAS 多 SKU 定价联盟博弈」，要识别心理账户对捆绑感知的影响用「心理账户捆绑定价心理学」。
- 能力边界：只算套餐层面的定价与组合建议，不替代单品日常调价，也不直接改价或上架套餐；卡页 ROI（套餐利润率比单品高 10-20%、月增利润 ¥3-10 万、配件渗透率 30%→70%、客单价提升 25-40%、年化 ¥15-40 万）为估算口径，落地须用本店实际数据重算。
- 安全边界：模型只输出套餐定价与组合建议，改价须人工确认后执行。

## 技能关联

- **前置**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-MAPPO-GAT-Dynamic-Pricing.html、Skill-MAPPO-GAT-Dynamic-Pricing、Skill-Personalized-ML-Pricing.html、Skill-Personalized-ML-Pricing、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-MAPPO-GAT-Dynamic-Pricing.html、Skill-MAPPO-GAT-Dynamic-Pricing、Skill-Personalized-ML-Pricing.html、Skill-Personalized-ML-Pricing、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-MAPPO-GAT-Dynamic-Pricing.html、Skill-MAPPO-GAT-Dynamic-Pricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Dynamic-Bundle-Pricing

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：17-价格优化　·　源卡：`Skill-Dynamic-Bundle-Pricing`