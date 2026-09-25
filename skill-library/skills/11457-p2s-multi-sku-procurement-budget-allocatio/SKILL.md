---
name: "p2s-multi-sku-procurement-budget-allocation"
title: "Constructing decision rules for multiproduct newsvendors"
description: "触发词：采购预算分配、多SKU报童、背包排序、服务水平加权、预算削减降级。何时不用：单 SKU 的批量与 MOQ 凑量用「动态批量与MOQ」；大促前算盘货缺口用「大促前盘货」。安全边界：分配结果只用于内部采购决策，不用于对外报价，也不构成对供应商的采购承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 采购比价"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Multi-SKU-Procurement-Budget-Allocation"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把季度采购预算按毛利和需求波动切给各 SKU，而不是平均分或按销量比例分。"
user_try: "试试：20 万美元预算分给 8 个 SKU，按毛利和需求波动给出分配方案与服务水平。"
whenToUse: "预算或资金有限、要在多 SKU 之间取舍采购量时用；单一 SKU 该订多少用「动态批量」类技能。"
workflow: "计算每 SKU 的缺货成本与持有成本得到临界比 → 用报童分位数算出各 SKU 的理想量 → 按背包排序或拉格朗日松弛在预算内分配 → 预算被削减时按优先级截断"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Constructing decision rules for multiproduct newsvendors

## ① 解决的问题

场景 A：季度 $200K 预算在 8 个核心 SKU 间分配

## ② 核心算法逻辑

核心思想：季度采购预算有限时，不能对每个 SKU 独立做 Newsvendor 决策——预算约束把所有 SKU 耦合成一个联合优化问题。Knapsack Ordering 算法提供了一个 O(n) 的近最优分配方案：按每个 SKU 的「边际成本效应」排序，依序分配资金直到预算耗尽，同时通过差异化缺货成本系数（cᵤᵢ）将毛利率/战略优先级编码进目标函数。

## ③ 业务应用场景

场景 A：季度 $200K 预算在 8 个核心 SKU 间分配
- 业务问题：Q4 备货预算 $200,000，8 个 SKU，各有不同毛利率和需求不确定性，如何分配才能最大化整体服务水平并保障高毛利 SKU 不断货？ - 数据要求：每 SKU 的历史需求均值/标准差、采购单价、毛利率、BSR 重要性评级 - 预期产出： - 业务价值：相比「平均分配」或「按需求比例」，Knapsack Ordering 可将整体服务水平从 ~85% 提升至 ~92%，对应减少缺货损失约 $15,000-$25,000/季度
三轨验证： - 成本：数据采集需接入 ERP 获取每 SKU 历史需求均值/标准差（约 2 人天）；计算资源为单机 Python 脚本，无额外成本；人力投入为供应链分析师 1 人天/季度 - 合规：不涉及用户隐私数据，无 GDPR 风险；不触碰 Amazon 定价/广告政策；算法结果仅用于内部采购决策，无平台合规红线 - 风险：若需求均值/标准差基于历史数据，新品或促销期可能严重偏离，导致分配失真；过度依赖高毛利 SKU 可能造成低毛利但高周转 SKU 缺货，影响整体店铺评分；建议每季度根据实际销售数据重新校准参数

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
相比平均分配策略，Knapsack Ordering 将加权服务水平从约 85% 提升至约 92%
7pp 服务水平提升 × $200K 季度采购 × 缺货损失系数 ≈ 减少缺货损失约 $15,000-$25,000/季度
年化：$60,000-$100,000（4 个季度）
Budget-Consistency 降级策略：预算削减时，直接截断低优先级 SKU，零额外计算成本
实施难度：⭐⭐☆☆☆（2/5）— O(n) 排序算法，无需求解器

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（181 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/supply_chain/multi_sku_procurement_budget_allocation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Multi-SKU-Procurement-Budget-Allocation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Multi-SKU-Procurement-Budget-Allocation
基于 arXiv:2301.02662 (Boonstra et al. 2023, Knapsack Ordering) +
    EJOR Vol.315 2024 (Olivares-Nadal, 战略优先级加权)
母婴跨境 DTC 多 SKU 季度采购预算分配优化
"""

import numpy as np
from dataclasses import dataclass, field
from scipy import stats
from scipy.optimize import brentq


@dataclass
class SKUSpec:
    sku_id: str
    demand_mean: float
    demand_std: float
    unit_price: float
    gross_margin_rate: float
    stockout_bsr_penalty: float = 1.5
    strategic_priority: str = "medium"

    @property
    def holding_cost_per_unit(self) -> float:
        return self.unit_price * 0.20 / 4

    @property
    def stockout_cost_per_unit(self) -> float:
        return self.unit_price * self.gross_margin_rate * self.stockout_bsr_penalty

    @property
    def critical_ratio(self) -> float:
        cu, co = self.stockout_cost_per_unit, self.holding_cost_per_unit
        return cu / (cu + co)


@dataclass
class AllocationResult:
    sku_id: str
    order_qty: float
    budget_allocated: float
    service_level: float
    marginal_value: float
    rank: int
    truncated: bool = False


def newsvendor_qty(sku: SKUSpec, critical_ratio: float | None = None) -> float:
    cr = critical_ratio if critical_ratio is not None else sku.critical_ratio
    return max(0.0, stats.norm.ppf(cr, loc=sku.demand_mean, scale=sku.demand_std))


def lagrangian_allocation(skus: list[SKUSpec], budget: float) -> list[AllocationResult]:
    """
    Lagrangian 松弛：二分搜索 λ* 使预算约束恰好满足。
    适合需求分布已知（Normal）的场景。
    """
    def total_spend(lam: float) -> float:
        total = 0.0
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2301.02662 — Robust knapsack ordering for a partially-informed newsvendor with budget constraint

核验口径：主题指向成立但强度不足（词重合 0.167／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：每 SKU 的历史需求均值与标准差、采购单价、毛利率、BSR 重要性评级，以及预算总额（模板场景为季度 20 万美元、8 个 SKU）。

**输出**：各 SKU 的分配金额、订货量、服务水平、边际价值与排序（含是否被截断），以及加权服务水平相对平均分配策略的变化，供采购决策。

## 执行步骤

1. 录入各 SKU 的需求分布、单价与毛利
2. 计算临界比并求出各 SKU 的理想订货量
3. 用背包排序或拉格朗日松弛在预算内切分
4. 预算不足时按优先级截断低优先 SKU
5. 输出分配明细与服务水平对比

## 边界与不做

- 数据不满足时不适用：需求均值标准差基于历史数据，新品或促销期严重偏离时分配会失真，需先校准参数。
- 能力边界：只给分配量与服务水平估算，不负责供应商议价、付款安排与实际下单。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **可组合**：Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Multi-SKU-Procurement-Budget-Allocation

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Multi-SKU-Procurement-Budget-Allocation`