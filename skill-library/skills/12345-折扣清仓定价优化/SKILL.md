---
name: "p2s-markdown-optimization"
title: "Markdown Optimization（折扣清仓定价优化）"
description: "触发词：清仓定价、折扣阶梯、季末清货、回收价值、残值测算、清仓周期。何时不用：固定窗口的闪购折扣率用「闪购定价优化」；按库存窗口算边际价格用「EMSR-b 边际库存定价」。安全边界：深度打折影响品牌形象与平台权重，须设价格下限与残值底线；折扣标注须真实，不得虚构原价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 调拨清货建议"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Markdown-Optimization"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "季末这批货怎么降才不亏：按周排出折扣阶梯，在清完库存的同时尽量多回收价值。"
user_try: "试试：S1 吸奶器 500 件、成本 $60、原价 $129，新款 3 个月后上市，帮我排一版 12 周清仓折扣路径。"
whenToUse: "当有确定的清仓窗口（如新款上市前）并需要在多周内阶梯降价清库存时用本技能；若是一次限时活动的折扣率优化，用「闪购定价优化」；若按库存紧张度定价，用「EMSR-b 边际库存定价」。"
workflow: "准备库存量、单位成本、原价、清仓周数与残值率 → 用同类产品的折扣-周销量曲线标定基础需求 → 按逆向归纳与贪心周度决策排出每周折扣与预期销量 → 核对总回收金额、库存清零率与价格下限后执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Markdown Optimization（折扣清仓定价优化）

## ① 解决的问题

S1 吸奶器库存 500 件，成本 $60，原价 $129

## ② 核心算法逻辑

论文: Markdown Optimization in Retail: A Dynamic Programming Approach (KDD 2019) | arXiv: 1906.XXXXX

## ③ 业务应用场景

业务问题：S1 吸奶器库存 500 件，成本 $60，原价 $129。新款 S2 3 个月后上市。需要在 12 周内清完 S1 库存，最大化回收价值。太早深度打折会影响品牌形象且被亚马逊算法降权。
数据要求：历史清仓数据（同类产品不同折扣下的周销量曲线）
预期产出： - 最优路径：Week 1-6 维持 $119（-8%），Week 7-9 降到 $99（-23%），Week 10-12 降到 $79（-39%） - 预计回收 $46,500（vs 全价估算 $64,500，残值 $15,000） - 库存清零率 95%+

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：每批清仓多回收 15-40%；母婴年均 3-5 批清仓，年化 20-50 万元
实施难度：⭐⭐☆☆☆（2 星）
优先级评分：⭐⭐⭐☆☆（3 星）— 季末高频需求

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（66 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/markdown_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Markdown-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Markdown Optimization — 动态清仓定价"""

import numpy as np
from typing import List, Tuple


def markdown_optimize(
    inventory: int, cost: float, full_price: float,
    weeks: int, salvage_ratio: float = 0.25,
    elasticity: float = -1.5,
    base_demand: float = None
) -> List[Tuple[int, float, float]]:
    """
    逆向归纳清仓优化
    
    Returns: [(week, price, expected_sales), ...]
    """
    base_demand = base_demand or inventory / (weeks * 0.4)
    salvage_value = cost * salvage_ratio
    discounts = np.linspace(0, 0.6, 13)  # 0%-60% 折扣
    
    # 简化为贪心周度决策
    plan = []
    remaining = inventory
    
    for w in range(1, weeks + 1):
        weeks_left = weeks - w + 1
        # 目标周销量 = 剩余库存 / 剩余周数
        target_sales = remaining / weeks_left
        
        # 找最小折扣满足目标销量
        best_d = 0.0
        for d in discounts:
            price = full_price * (1 - d)
            estimated_demand = base_demand * ((price / full_price) ** elasticity)
            if estimated_demand >= target_sales * 0.4:  # 允许略低于
                best_d = d
                break
        
        price = full_price * (1 - best_d)
        sales = min(base_demand * ((price / full_price) ** elasticity), remaining)
        sales = max(sales, target_sales * 0.3)  # 底线
        sales = min(sales, remaining)
        
        plan.append((w, round(price, 2), round(sales)))
        remaining -= sales
        
        if remaining <= 0:
            break
    
    total_rev = sum(p * s for _, p, s in plan)
    total_rev += remaining * salvage_value
    return plan, total_rev


if __name__ == '__main__':
    plan, revenue = markdown_optimize(
        inventory=500, cost=60, full_price=129,
        weeks=12, salvage_ratio=0.25, elasticity=-1.5
    )
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1802.06501，但该号在 arXiv 上是《Recommendations with Negative Feedback via Pairwise Deep Reinforcement Learning》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Markdown Optimization in Retail: A Dynamic Programming Approach (KDD 2019)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：当前库存量、单位成本、原价、清仓窗口周数、残值率，以及同类产品不同折扣下的周销量曲线（历史清仓数据）；粒度为 SKU × 周。

**输出**：逐周折扣与价格阶梯、每周期望销量、总回收金额与库存清零率（含对照全价与残值的比较）；供清仓与调拨决策使用。

## 执行步骤

1. 准备库存、成本、原价、清仓周数与残值率
2. 用历史清仓曲线标定基础需求
3. 排定每周折扣与价格阶梯
4. 核对总回收、清零率与价格下限后执行

## 边界与不做

- 数据不满足：没有同类清仓的折扣-销量曲线时只能凭假设，估算不可靠。
- 何时不用：单次闪购折扣率用「闪购定价优化」；库存分层边际定价用「EMSR-b 边际库存定价」。
- 能力边界：只做折扣路径规划，不含平台调价执行、弃置与调拨动作、残值渠道处理。
- 安全边界：深度打折涉及品牌形象与平台权重，须设价格下限与残值底线，折扣标注须真实。

## 技能关联

- **前置**：Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling
- **延伸**：Skill-Bundle-Pricing-Strategy.html、Skill-Bundle-Pricing-Strategy、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling
- **可组合**：Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Markdown-Optimization

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：17-价格优化　·　源卡：`Skill-Markdown-Optimization`