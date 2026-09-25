---
name: "p2s-logistics-cost-structure-decomposition"
title: "全链路物流成本结构分解 — 进存销三段成本拆解与降本杠杆识别"
description: "触发词：物流成本拆解、物流费率、进存销成本、降本杠杆、备货成本模拟。何时不用：要逐条核对物流商账单差异用「收入与费用核对」，要按销量预测下达补货指令用「补货模拟」；本技能只做成本结构拆解、根因定位与降本杠杆识别。安全边界：清仓与补货建议须人工复核后执行，模型不直接改价、下架商品或改动库存。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 经济性分析"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Logistics-Cost-Structure-Decomposition"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把物流成本拆成进货、库存持有和末端配送三段，找出真正吃掉利润的环节和可执行的降本动作。"
user_try: "试试：我月销 50 万美元、物流费率 9.2%，帮我拆一下进存销三段各占多少，问题出在哪？"
whenToUse: "有采购、仓储、配送与退货数据、需要看清物流成本结构与降本空间时用；要与平台收入入账逐笔勾对用「收入与费用核对」，要按预测决定订多少货用「补货模拟」。"
workflow: "把采购、头程、仓储、配送、退货数据归集到 SKU → 拆出进、存、销三段成本与占售价比率 → 按 ABC 分层定位高占用低贡献的 SKU → 给出降本动作并模拟改进后的费率 → 对不同备货量做 What-if 模拟，选期望利润最大的方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 全链路物流成本结构分解 — 进存销三段成本拆解与降本杠杆识别

## ① 解决的问题

卖家只知道"物流贵"却不知道哪贵——进-存-销三段ABC成本拆解将物流费率从9.2%降至7.5%，月节省$8500（$50万GMV规模）

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中将电商物流成本系统性地分解为"进—存—销"三段结构，这是理解和优化供应链成本的核心框架。"进"是采购和头程成本，"存"是库存持有成本，"销"是末程配送成本。大多数卖家只关注末程快递费（"销"），却忽视了"存"（库存持有）通常是最大的隐性成本。书中强调物流成本管理必须做到事前模拟、事中管理、事后分析三段闭环。

## ③ 业务应用场景

- 业务问题：某卖家月销$50万，物流费率9.2%（行业基准6-7%），明显偏高，但不知道问题出在哪个环节 - 数据要求：12个月采购记录、FBA费率报告、仓储费账单、退货数据、海运账单 - 算法应用： 1. 三段成本拆解：进3.2% + 存3.8% + 销2.2% = 9.2%（存储成本异常高！） 2. 存成本深挖：DOI平均65天（行业基准35天），库存持有成本$4.5万/月 3. 根因：滞销C类SKU占用45%仓容但贡献仅5%销售额 4. 行动：清仓C类SKU + 优化ABC分层补货 → DOI目标35天 5. 预测：DOI改善后存成本降至2.1%，总物流费率降至7.5% - 预期产出：
场景B：大促前物流成本模拟（What-if分析）
- 业务问题：Q4大促备货前，需要模拟不同备货量下的全链路成本，找到利润最大化的备货点 - 算法应用：建立成本模型，输入不同备货量（300/500/800件），输出各场景的进存销总成本和预期利润，结合需求概率分布，找到期望利润最大的备货量 - 预期产出：大促备货决策从"经验拍板"升级为"成本模拟驱动"，大促利润率提升2-3个百分点

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月销$50万卖家，物流费率从9.2%降至7.5%节省$8500/月，年化$10.2万；分析系统建设成本$2万，ROI≈510%
实施难度：⭐⭐☆☆☆（成本计算逻辑直接，难点是整合FBA费率报告/仓储账单/采购记录三类数据源）
优先级：⭐⭐⭐⭐⭐（降本是所有规模卖家的刚需，且成本结构分析是一切降本行动的前提——不知道哪贵就无从下手）
适用规模：所有月销>$5万的卖家，数据越完整分析价值越高
数据依赖：FBA费率报告、仓储月账单、采购成本记录、头程运费账单、退货数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（270 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/logistics_cost_structure_decomposition` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Logistics-Cost-Structure-Decomposition.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
全链路物流成本结构分解系统
功能：进-存-销三段成本拆解 + ABC成本法 + 降本杠杆识别 + What-if模拟
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUCostProfile:
    """SKU成本档案"""
    sku_id: str
    monthly_units_sold: int
    unit_selling_price: float       # 售价($)

    # 进：采购与头程
    unit_purchase_price: float      # 采购价($)
    unit_freight_inbound: float     # 头程运费/件($)
    tariff_rate: float              # 关税率（如0.25）
    inspection_cost_per_unit: float # 质检费/件($)

    # 存：仓储持有
    avg_stock_units: int            # 平均库存件数
    unit_storage_fee_monthly: float # 月仓储费/件($)
    capital_cost_rate_annual: float # 资金年化成本率（如0.20）
    inventory_shrinkage_rate: float # 库存损耗率（如0.01）

    # 销：末程配送
    fba_fee_per_unit: float         # FBA费/件($)
    return_rate: float              # 退货率
    return_processing_cost: float   # 每件退货处理成本($)
    platform_commission_rate: float # 平台佣金率

    @property
    def monthly_revenue(self) -> float:
        return self.monthly_units_sold * self.unit_selling_price


def compute_three_stage_cost(sku: SKUCostProfile) -> Dict:
    """计算进-存-销三段成本"""

    # ① 进：采购+头程+关税+质检
    landed_cost_per_unit = (
        sku.unit_purchase_price * (1 + sku.tariff_rate)
        + sku.unit_freight_inbound
        + sku.inspection_cost_per_unit
    )
    inbound_total_monthly = landed_cost_per_unit * sku.monthly_units_sold

    # ② 存：仓储+资金成本+损耗
    storage_fee_monthly = sku.avg_stock_units * sku.unit_storage_fee_monthly
    capital_cost_monthly = (
        sku.avg_stock_units * sku.unit_purchase_price
        * (sku.capital_cost_rate_annual / 12)
    )
    shrinkage_cost_monthly = (
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.08834。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：SKU 粒度成本档案：月销量与售价、单位采购价、头程运费、关税率、质检费、平均库存件数、月仓储费、资金年化成本率、库存损耗率、FBA 费、退货率与退货处理成本、平台佣金率；另需 12 个月采购记录、FBA 费率报告、仓储费账单、海运账单与退货数据。

**输出**：进、存、销三段的成本金额与占售价比率（卡页示例 3.2% + 3.8% + 2.2% = 9.2%）、按 ABC 分层的 SKU 成本贡献与仓容占用、DOI 等库存效率指标、根因定位与降本杠杆清单，以及不同备货量下的 What-if 总成本与预期利润；供运营与财务做降本与大促备货决策。

## 执行步骤

1. 把采购、头程、仓储、配送与退货数据汇总成 SKU 成本档案
2. 把物流成本拆成进、存、销三段并算出各段占售价比率
3. 按 ABC 分层看各 SKU 的仓容占用与销售贡献，定位异常环节
4. 测算 DOI 等库存效率指标，找出持有成本偏高的根因
5. 给出清仓与分层补货优化动作，并模拟改进后的物流费率
6. 对不同备货量做 What-if 模拟，输出期望利润最大的备货点

## 边界与不做

- 数据不满足时不用：缺采购成本、仓储费或退货数据时无法把三段成本拆全。
- 只做成本拆解与模拟，不代替财务入账，也不直接执行清仓、改价等动作。
- 卡页 ROI（费率 9.2% 降至 7.5%、ROI≈510%）为估算口径，落地前须用本店实际账单重算。

## 技能关联

- **前置**：Skill-ATLAS-HTS-Tariff-Classification.html、Skill-ATLAS-HTS-Tariff-Classification、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **延伸**：Skill-ATLAS-HTS-Tariff-Classification.html、Skill-ATLAS-HTS-Tariff-Classification、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Tariff-FX-FBA-Cost-Dynamics.html、Skill-Tariff-FX-FBA-Cost-Dynamics
- **可组合**：Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Logistics-Cost-Structure-Decomposition

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-Logistics-Cost-Structure-Decomposition`