---
name: "p2s-supplier-capacity-booking-engine"
title: "供应商产能预订引擎 — 旺季弹性产能锁定与长期产能保障协议管理"
description: "触发词：产能预订、旺季锁产能、软硬期权、情景分析。何时不用：没有可用需求分布或情景假设时无法计算；已有确定订单、只需在工厂间分配时用多工厂分配类技能。安全边界：预订量与条款建议须人工核对后再对外承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-042"
l3_business: "产能调查"
l3_all: "产能调查 / 订单协调"
l1_l2_l3: "业务运营/供应与履约/产能调查"
p2s_card_id: "Skill-Supplier-Capacity-Booking-Engine"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用硬预订加软期权的组合，算清楚旺季前该锁多少产能、付多少预订成本才划算。"
user_try: "试试：旺季前要和工厂锁产能，帮我算算硬预订多少、软期权多少最划算。"
whenToUse: "本卡属「产能调查」。需要在旺季前与供应商锁定弹性产能、权衡预订成本与断货损失时用本卡；已有确定订单、只需工厂间分配时用多工厂产能分配类技能。"
workflow: "维护供应商产能与预订条款 → 设定多档需求情景 → 逐情景算期望利润并扣预订成本 → 输出最优预订量与期权配比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应商产能预订引擎 — 旺季弹性产能锁定与长期产能保障协议管理

## ① 解决的问题

采购面临"旺季前竞争对手抢光工厂产能导致断货"——双期权策略(硬预订+软期权)提前锁定产能，防止旺季断货损失35万元

## ② 核心算法逻辑

产能预订（Capacity Booking） 解决的核心矛盾：旺季前需求不确定，但工厂产能有限，谁先预订谁先生产。晚预订 = 产能被竞争对手占走 = 断货。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：旺季前锁定产能，防止因产能不足导致的断货（以旗舰款日均GMV 5万×断货7天=35万元损失）；软期权策略比硬预订降低约30%的资金占用，提高灵活性
实施难度：⭐⭐⭐☆☆（需要与供应商建立正式的产能预订协议，商务谈判为主）
优先级评分：⭐⭐⭐⭐⭐（旺季产能是供应链的最终约束，"买不到产能"比"没有库存算法"更致命）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（98 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/supplier_capacity_booking_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Capacity-Booking-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应商产能预订引擎
功能：产能评估 / 预订决策 / 期权费vs保障价值 / 弹性预订策略
"""
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SupplierCapacity:
    supplier_id: str
    max_monthly_capacity: int
    current_booked_pct: float    # 已被预订比例
    available_capacity: int
    lead_time_weeks: int
    min_booking_qty: int
    hard_booking_deposit_pct: float = 0.15
    soft_option_fee_pct: float = 0.03
    option_validity_weeks: int = 8


@dataclass
class DemandScenario:
    scenario: str
    probability: float
    demand_qty: int
    selling_price: float
    cogs: float


def compute_booking_decision(supplier: SupplierCapacity,
                               scenarios: list,
                               sku_unit_cost: float) -> dict:
    """计算最优产能预订量和策略"""

    # 情景分析：不同需求量下的期望利润
    booking_options = range(supplier.min_booking_qty,
                             min(supplier.available_capacity, 20001), 1000)
    best_qty = supplier.min_booking_qty
    best_ev = -float('inf')

    for book_qty in booking_options:
        ev = 0.0
        for sc in scenarios:
            actual_sales = min(book_qty, sc.demand_qty)
            revenue = actual_sales * sc.selling_price
            prod_cost = book_qty * sc.cogs          # 生产了才付成本
            unsold_cost = max(0, book_qty - sc.demand_qty) * sc.cogs * 0.3  # 滞销30%损失
            profit = revenue - prod_cost - unsold_cost
            ev += sc.probability * profit

        # 减去预订成本
        booking_cost = book_qty * sku_unit_cost * supplier.hard_booking_deposit_pct
        net_ev = ev - booking_cost

        if net_ev > best_ev:
            best_ev = net_ev
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.09823。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：供应商产能与预订条款（硬预订价格、软期权价格）、各需求情景的概率与需求量、单位缺货损失。

**输出**：最优产能预订量与硬预订加软期权的组合策略、各情景下的期望利润对比，用于旺季产能锁定谈判。

## 执行步骤

1. 整理供应商产能上限与预订报价条款
2. 设定乐观、基准、悲观等需求情景
3. 逐情景计算期望利润并扣除预订成本
4. 计算最优预订量与硬软期权配比
5. 输出谈判要点与保底方案

## 边界与不做

- 没有可用的需求分布或情景假设时无法计算，不用本卡
- 本卡产出预订量与策略建议，不负责与供应商签约和执行预订
- 预订量与条款建议须人工核对后再对外承诺

## 技能关联

- **前置**：Skill-Capacity-Constraint-Production-Schedule-KPI.html、Skill-Capacity-Constraint-Production-Schedule-KPI、Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Multi-Factory-Capacity-Allocation.html、Skill-Multi-Factory-Capacity-Allocation、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map
- **延伸**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Multi-Factory-Capacity-Allocation.html、Skill-Multi-Factory-Capacity-Allocation、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI
- **可组合**：Skill-Multi-Factory-Capacity-Allocation.html、Skill-Multi-Factory-Capacity-Allocation、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Supplier-Capacity-Booking-Engine

---

> 分类：业务运营/供应与履约/产能调查　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Capacity-Booking-Engine`