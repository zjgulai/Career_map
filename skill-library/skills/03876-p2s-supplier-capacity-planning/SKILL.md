---
name: "p2s-supplier-capacity-planning"
title: "Multi-objective multi-site supplier selection and order splitting"
description: "触发词：产能缺口、多供应商分单、Pareto取舍、滚动排产。何时不用：缺少供应商延误率或可靠性数据时无法做 Pareto 取舍；只锁定旺季弹性产能用产能预订类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-042"
l3_business: "产能调查"
l3_all: "产能调查 / 供应商评估"
l1_l2_l3: "业务运营/供应与履约/产能调查"
p2s_card_id: "Skill-Supplier-Capacity-Planning"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在产能缺口下用滚动排产与 Pareto 取舍，决定订单在主供与备供之间怎么分。"
user_try: "试试：吸奶器工厂 8 到 10 月总缺口 3500 件，帮我排产并给出备供分单比例。"
whenToUse: "本卡属「产能调查」。存在产能缺口、需要在跨月排产与多供应商分单之间做取舍时用本卡；只锁定旺季弹性产能用供应商产能预订类技能。"
workflow: "汇总各月需求与产能 → 计算缺口 → 滚动排产使缺货损失最小 → Pareto 分析给出分单比例"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-objective multi-site supplier selection and order splitting

## ① 解决的问题

业务问题：吸奶器工厂月产能 5,000 件，8-10 月三个月需求分别为 6,500/8,000/4,000 件，总缺口 3,500 件

## ② 核心算法逻辑

核心思想：当旺季需求（如双11前 8,000 件/月）超过工厂单月产能（5,000 件），需要解决三个问题：① 提前多久开始生产（提前期排程）？② 多供应商时如何分单（Pareto 前沿）？③ 产能完全满足不了时，哪个 SKU 优先（优先级排序）？

## ③ 业务应用场景

- 业务问题：吸奶器工厂月产能 5,000 件，8-10 月三个月需求分别为 6,500/8,000/4,000 件，总缺口 3,500 件。如何排产使缺货损失最小？ - 预期产出：
场景 B：多供应商分单的 Pareto 决策
- 业务问题：主供（深圳工厂）vs 备供（广州工厂），成本低 15% 但历史延误率 22%，如何分配 2,000 件订单？ - Pareto 分析输出：

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：90%
ROI 预估：
备供分单的最优 Pareto 点（70/30）vs 全主供：延误风险从 22% → 6%，期望缺货损失减少 $6,280/批次
随机优化 vs MRP（满产场景）：年节省 10-20% × $200K 季度采购 = $80,000-$160,000/年
产能优先级排序：高毛利 SKU 优先保障，避免因低毛利 SKU 占产能导致主力 SKU 断货
实施难度：⭐⭐⭐☆☆（3/5）— 需要供应商产能数据和历史延误率

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（158 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：8」并记录位置 `paper2skills-code/supply_chain/supplier_capacity_planning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Capacity-Planning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Supplier-Capacity-Planning
基于 arXiv:2402.14506 (滚动排产随机优化) +
    IJPE 2024 (CLSP鲁棒vs随机决策树) +
    JIMO 2024 (多供应商Pareto分单)
母婴跨境 DTC 供应商产能约束下的生产排期与分单决策
"""

import numpy as np
from dataclasses import dataclass, field
from scipy import stats


@dataclass
class SupplierSpec:
    supplier_id: str
    monthly_capacity: int
    unit_cost: float
    lead_time_days: int
    delay_rate: float
    delay_days_avg: float = 5.0
    is_primary: bool = True

    @property
    def reliability_score(self) -> float:
        return 1.0 - self.delay_rate


@dataclass
class SKUPlan:
    sku_id: str
    monthly_demands: list[float]
    gross_margin: float
    bsr_rank: int
    demand_cv: float
    unit_price: float

    @property
    def priority_score(self) -> float:
        bsr_factor = max(0.1, 1.0 - self.bsr_rank / 200.0)
        cv_factor = max(0.5, 1.0 - self.demand_cv)
        return self.gross_margin * bsr_factor * cv_factor


def rolling_horizon_plan(
    skus: list[SKUPlan],
    monthly_capacity: int,
    horizon: int = 3,
    rush_premium_rate: float = 0.08,
) -> dict:
    """
    滚动视野排产：满产时按优先级分配产能，缺口触发备供。
    """
    monthly_plans = []
    for t in range(horizon):
        total_demand = sum(s.monthly_demands[t] for s in skus if t < len(s.monthly_demands))
        capacity_util = total_demand / monthly_capacity
        gap = max(0, total_demand - monthly_capacity)

        sorted_skus = sorted(skus, key=lambda s: -s.priority_score)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.14506，但该号在 arXiv 上是《Enhancing Rolling Horizon Production Planning Through Stochastic Optimization Evaluated by Means of Simulation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各月需求、各工厂月产能、供应商成本与历史延误率、订单总量与交期要求。

**输出**：滚动排产计划、缺货损失评估、主供与备供的分单比例，以及 Pareto 前沿上的备选方案对比。

## 执行步骤

1. 汇总各月需求与自有产能并计算缺口
2. 做滚动周期排产使缺货损失最小
3. 评估主供与备供的成本与延误率
4. 用 Pareto 分析给出分单比例
5. 输出排产与分单方案供采购执行

## 边界与不做

- 缺少供应商延误率或可靠性数据时无法做 Pareto 取舍，不用本卡
- 本卡产出排产与分单建议，不负责下单、比价与合同执行

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model
- **延伸**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supplier-Capacity-Planning

---

> 分类：业务运营/供应与履约/产能调查　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Capacity-Planning`