---
name: "p2s-multi-factory-capacity-allocation"
title: "多工厂产能分配算法 — OEM/ODM多厂商协同下的弹性产能调度优化"
description: "触发词：多工厂分配、集中度、单点故障、弹性产能。何时不用：只有单一可选工厂时本卡不适用，应先做供应商开发；只测算单厂产能是否够用时用产能排程类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-042"
l3_business: "产能调查"
l3_all: "产能调查 / 供应商评估"
l1_l2_l3: "业务运营/供应与履约/产能调查"
p2s_card_id: "Skill-Multi-Factory-Capacity-Allocation"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把订单按成本与集中度上限分配到多个工厂，降低单一工厂依赖带来的断供风险。"
user_try: "试试：我现在 70% 产能押在一家工厂，帮我设计一份多工厂分配方案把集中度降下来。"
whenToUse: "本卡属「产能调查」。已有多家可选工厂、需要在成本与集中度之间分配订单时用本卡；只测算单厂产能是否够用时用产能约束生产排程类技能。"
workflow: "整理各工厂成本与产能 → 限集中度按成本首轮分配 → 高需求时放开集中度做第二轮 → 输出分配质量指标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多工厂产能分配算法 — OEM/ODM多厂商协同下的弹性产能调度优化

## ① 解决的问题

供应链面临"单一工厂依赖70%，停工即断供"——多工厂分配算法将集中度从70%降至40%，防止单点故障损失约20-50万元

## ② 核心算法逻辑

多工厂产能分配 解决：当需求超过单一工厂产能时，如何在多个工厂间优化分配生产任务，同时平衡成本、质量、交期三个目标。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：多工厂分配降低单一供应商集中度，防止供应商故障导致全量断产（每次可能损失约20-50万元）；成本优化通常能降低1-3%的综合采购成本
实施难度：⭐⭐⭐☆☆（算法简单，关键是与多个工厂建立合作关系）
优先级评分：⭐⭐⭐⭐☆（供应链韧性的基础：不把鸡蛋放在一个篮子里）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/multi_factory_capacity_allocation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Multi-Factory-Capacity-Allocation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多工厂产能分配算法
功能：多目标优化 / 风险分散 / 成本最优 / 质量约束分配
"""
import numpy as np
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class Factory:
    factory_id: str
    name: str
    monthly_capacity: int
    unit_cost: float
    quality_pass_rate: float    # IQC合格率
    on_time_rate: float         # OTIF率
    risk_tier: str              # LOW / MEDIUM / HIGH
    moq: int = 100


def allocate_capacity(demand: int, factories: list,
                       max_concentration_pct: float = 0.70) -> dict:
    """
    多工厂产能分配（贪心+约束）
    目标：成本最低，同时限制集中度风险
    """
    sorted_factories = sorted(factories, key=lambda f: f.unit_cost * (1 / f.quality_pass_rate))
    allocation = {f.factory_id: 0 for f in factories}
    remaining = demand

    # 第一轮：按成本排序分配，但限制集中度
    max_per_factory = int(demand * max_concentration_pct)

    for factory in sorted_factories:
        if remaining <= 0:
            break
        can_allocate = min(remaining, factory.monthly_capacity, max_per_factory)
        if can_allocate >= factory.moq:
            allocation[factory.factory_id] = can_allocate
            remaining -= can_allocate

    # 第二轮：如果还有剩余（高需求），放开集中度限制
    if remaining > 0:
        for factory in sorted_factories:
            if remaining <= 0:
                break
            extra = min(remaining, factory.monthly_capacity - allocation[factory.factory_id])
            if extra > 0:
                allocation[factory.factory_id] += extra
                remaining -= extra

    # 计算分配质量指标
    total_alloc = sum(allocation.values())
    weighted_cost = sum(allocation[f.factory_id] * f.unit_cost for f in factories) / max(1, total_alloc)
    weighted_quality = sum(allocation[f.factory_id] * f.quality_pass_rate for f in factories) / max(1, total_alloc)
    max_concentration = max(allocation.values()) / max(1, total_alloc)

    tags = {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11234，但该号在 arXiv 上是《Towards medhub: A Self-Service Platform for Analysts and Physicians》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需求总量、各工厂的成本与产能上限、集中度约束，以及各工厂的可靠性或历史延误数据。

**输出**：各工厂的订单分配结果、集中度指标与分配质量评估，用于在降低单点故障风险与控制成本之间取舍。

## 执行步骤

1. 整理需求总量与各工厂成本产能参数
2. 按成本排序并施加集中度上限做首轮分配
3. 高需求剩余时放开集中度做第二轮分配
4. 计算集中度与分配质量指标
5. 输出分配方案与备选工厂建议

## 边界与不做

- 只有单一可选工厂时本卡不适用，应先做供应商开发
- 本卡产出分配方案与指标，不负责供应商谈判与合同签署

## 技能关联

- **前置**：Skill-Capacity-Constraint-Production-Schedule-KPI.html、Skill-Capacity-Constraint-Production-Schedule-KPI、Skill-MOQ-Payment-Terms-Optimization.html、Skill-MOQ-Payment-Terms-Optimization、Skill-Supplier-Capacity-Booking-Engine.html、Skill-Supplier-Capacity-Booking-Engine、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map
- **延伸**：Skill-Capacity-Constraint-Production-Schedule-KPI.html、Skill-Capacity-Constraint-Production-Schedule-KPI、Skill-MOQ-Payment-Terms-Optimization.html、Skill-MOQ-Payment-Terms-Optimization、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map
- **可组合**：Skill-MOQ-Payment-Terms-Optimization.html、Skill-MOQ-Payment-Terms-Optimization、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Multi-Factory-Capacity-Allocation

---

> 分类：业务运营/供应与履约/产能调查　·　技术族：04-供应链　·　源卡：`Skill-Multi-Factory-Capacity-Allocation`