---
name: "p2s-inventory-carrying-cost-model"
title: "Skill-Inventory-Carrying-Cost-Model — 库存持有成本模型"
description: "触发词：持有成本、资金占用、LTSF 罚款、EOQ 订货量、库存周转优化。何时不用：要把资金在 SKU 间做效率配置用「GMROI 库存资金回报」；要提前预警长库龄与费用率异常用「FBA 费用结构分析」。安全边界：成本率与费率参数须按最新口径更新；结论只作内部优化依据，不构成对外财务口径。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 库存分层"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Inventory-Carrying-Cost-Model"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "把资金、仓储、长库龄罚款和折损全算进持有成本，算出年化成本率并用 EOQ 找出更省的订货量。"
user_try: "试试：算清 4500 件平均库存的年化持有成本率，并用 EOQ 模型给出降低安全库存后的节省。"
whenToUse: "需要量化库存占用的全口径持有成本并优化订货量时用本技能；SKU 间资金效率配置用「GMROI 库存资金回报」；长库龄与费用率预警用「FBA 费用结构分析」。"
workflow: "汇总平均库存货值、仓储费、长库龄费与折损比例 → 计算资金、仓储、罚款、保险与折损各项年化成本 → 汇总得出年化持有成本率 → 用 EOQ 求最优订货量并测算持有成本下降幅度 → 对成本率做敏感性分析"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Inventory-Carrying-Cost-Model — 库存持有成本模型

## ① 解决的问题

库存管理负责人面临"不知道积压500件库存每月实际损耗多少资金"——全口径持有成本模型（资金+仓储+LTSF+折损）显示年化成本率40%，EOQ优化后年省库存成本15万元

## ② 核心算法逻辑

论文：Economic Order Quantity Model with Inventory Carrying Cost Sensitivity Analysis | 年份：2019

## ③ 业务应用场景

场景：母婴品牌月销 3,000 件吸奶器，每件货值 $25，当前平均库存 4,500 件（1.5 个月库存），总货值 $112,500。
持有成本全口径核算： - 资金成本（年化 18%）：$112,500 × 18% = $20,250/年 - FBA 月仓储费：$1,800/月 × 12 = $21,600/年 - LTSF（180 天+库存占比 15%）：$2,700/年 - 折损保险估算：$1,125/年 - 总持有成本：$45,675/年（货值的 40.6%）
通过 EOQ 模型，将安全库存降至 0.8 个月，持有成本降至 $24,000/年，年化节省 $21,675（约 15 万元）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（101 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd

# 库存持有成本模型

def compute_carrying_cost(
    avg_inventory_value: float,       # 平均库存货值（USD）
    capital_cost_rate: float = 0.18,  # 资金年化成本率
    storage_cost_annual: float = 0.0, # 年仓储费（USD）
    ltsf_annual: float = 0.0,         # 年LTSF罚款（USD）
    insurance_rate: float = 0.007,    # 保险率
    shrinkage_rate: float = 0.015,    # 折损率
) -> dict:
    """计算全口径年化库存持有成本"""
    capital_cost = avg_inventory_value * capital_cost_rate
    insurance = avg_inventory_value * insurance_rate
    shrinkage = avg_inventory_value * shrinkage_rate

    total = capital_cost + storage_cost_annual + ltsf_annual + insurance + shrinkage
    carrying_rate = total / avg_inventory_value

    return {
        '资金成本(USD)': round(capital_cost, 0),
        '仓储成本(USD)': round(storage_cost_annual, 0),
        'LTSF罚款(USD)': round(ltsf_annual, 0),
        '保险成本(USD)': round(insurance, 0),
        '折损成本(USD)': round(shrinkage, 0),
        '总持有成本(USD)': round(total, 0),
        '年化持有成本率': f'{carrying_rate:.1%}',
    }


def eoq_model(
    annual_demand: float,      # 年需求量（件）
    unit_cost: float,          # 单件成本（USD）
    order_cost: float,         # 每次订货成本（USD）
    carrying_rate: float,      # 年化持有成本率
) -> dict:
    """经济订货量（EOQ）模型"""
    eoq = np.sqrt(2 * annual_demand * order_cost / (unit_cost * carrying_rate))
    num_orders = annual_demand / eoq
    avg_inventory = eoq / 2
    total_ordering_cost = num_orders * order_cost
    total_carrying_cost = avg_inventory * unit_cost * carrying_rate
    total_cost = total_ordering_cost + total_carrying_cost

    return {
        'EOQ（件）': round(eoq, 0),
        '年订货次数': round(num_orders, 1),
        '平均库存（件）': round(avg_inventory, 0),
        '年订货成本(USD)': round(total_ordering_cost, 0),
        '年持有成本(USD)': round(total_carrying_cost, 0),
        '年总成本(USD)': round(total_cost, 0),
    }


def sensitivity_analysis_carrying(
    avg_inventory_value: float,
    storage_cost_annual: float,
    capital_rates: list = None
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1903.01384，但该号在 arXiv 上是《A case of the Rodriguez Villegas conjecture》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Economic Order Quantity Model with Inventory Carrying Cost Sensitivity Analysis》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：平均库存货值、年仓储费、年 LTSF 罚款，以及资金成本率、保险率与折损率等参数；EOQ 场景还需年需求量、单件成本与每次订货成本。

**输出**：全口径年化持有成本明细与成本率、EOQ 与对应订货次数、平均库存与年总成本，以及持有成本率的敏感性分析结果。

## 执行步骤

1. 汇总平均库存货值与仓储、罚款数据
2. 按资金、仓储、长库龄、保险与折损口径计算年化持有成本
3. 汇总得出持有成本率
4. 用 EOQ 模型求解最优订货量与平均库存
5. 测算优化后的成本节省并做敏感性分析

## 边界与不做

- 平均库存货值或仓储费口径缺失时不适用，成本率会明显低估
- 只做成本核算与订货量建议，不代替补货计划与采购决策
- 费率与成本假设须按最新口径更新，结论不构成对外财务口径

## 技能关联

- **可组合**：Skill-Inventory-Carrying-Cost-Model

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：23-运营财务　·　源卡：`Skill-Inventory-Carrying-Cost-Model`