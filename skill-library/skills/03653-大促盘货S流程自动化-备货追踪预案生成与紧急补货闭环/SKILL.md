---
name: "p2s-promo-stocktaking-sop-automation"
title: "大促盘货S&OP流程自动化 — 备货追踪、预案生成与紧急补货闭环"
description: "触发词：大促备货、盘货追踪、S&OP自动化、紧急补货、备货缺口。何时不用：需要按月做需求供应对齐的常规 S&OP 会议时用S&OP销售与运营计划协同；需要为促销峰值做运力与爆仓预测时用大促物流爆仓预测。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Promo-Stocktaking-SOP-Automation"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促前八周启动备货追踪，双路预测收敛、缺口分级预警，缺货前把紧急补货方案摆上桌面。"
user_try: "试试：用上次大促的 SKU 销量和当前采购追踪数据，跑一遍 Prime Day 备货追踪并标出缺口超过 10% 的 SKU。"
whenToUse: "大促节点备货需要自上而下目标拆解、自下而上盘货收敛并按周追踪缺口时用本技能；常规月度 S&OP 协作用S&OP销售与运营计划协同。"
workflow: "提前八周做目标拆解与 SKU 级盘货 → 自上而下与自下而上两路预测收敛校准 → 第 6 周追踪采购确认与在途数量并计算缺口率 → 按缺口比例与天数触发紧急补货预案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 大促盘货S&OP流程自动化 — 备货追踪、预案生成与紧急补货闭环

## ① 解决的问题

大促备货靠拍脑袋年均缺货+积压损失$15万——双路预测收敛+8周备货追踪+紧急补货触发将备货准确率从40%提升至75%，年化节省$11万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中详述大促S&OP盘货流程包含参与部门（运营/采购/物流/财务）、盘货输入（预测/库存/供应商/资金）、盘货流程（对齐→差距→方案→决策）、成功因素（数据准确/提前启动/闭环追踪）。作者强调大促S&OP必须提前8周启动，核心是实现"从上往下目标拆解"（总GMV→品类→SKU）与"从下往上盘货聚合"（每SKU库存×预测→汇总）两路收敛。

## ③ 业务应用场景

场景A：Prime Day全流程S&OP自动化
- 业务问题：某母婴卖家每年Prime Day备货靠"感觉"，2023年吸奶器备500件缺货、婴儿温奶器备800件积压200件，年均大促备货损失$15万（缺货+积压合计） - 数据要求：历史2次大促SKU级销量、采购提前期、当前供应商产能 - 算法应用： 1. 提前8周启动：Top-Down目标$50万GMV → 拆解到20个SKU 2. Bottom-Up汇总：各SKU历史大促×1.3增长 = $48万（差距4%，通过） 3. 第6周追踪：吸奶器采购650件已确认，在途450件，缺口100件（15%） 4. 触发规则：>10%缺口，距大促21天 → 评估空运100件（成本$800 vs 缺货
场景B：双11/Black Friday多促活动并行管理

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月销$50万卖家，大促年损失（缺货+积压）$15万；系统将备货准确率从40%→75%，损失降至$4万，年化节省$11万；系统成本$3万，ROI≈367%
实施难度：⭐⭐⭐☆☆（流程逻辑清晰，难点是让销售/采购/物流三方都按节奏提交数据更新，需要组织配合）
优先级：⭐⭐⭐⭐⭐（大促是全年最高价值时段，备货失误的代价最大，S&OP是防失误的核心机制）
适用规模：参与Amazon/Shopee/TikTok Shop大促、年GMV>$200万的卖家
数据依赖：历史大促SKU级销量（至少2次）、当前采购追踪数据、供应商交期确认

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（324 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/promo_stocktaking_sop_automation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Promo-Stocktaking-SOP-Automation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
大促盘货S&OP流程自动化系统
功能：双路预测收敛 + 备货追踪矩阵 + 紧急补货触发 + 预案生成
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PromoSKUPlan:
    """大促SKU计划单元"""
    sku_id: str
    abc_class: str
    # 历史大促数据
    last_promo_sales: int           # 上次大促销量
    last_promo_gmv: float           # 上次大促GMV
    # 本次预测
    growth_factor: float            # 增长系数（如1.3=30%增长）
    # 采购状态（每周更新）
    ordered_qty: int = 0            # 已下采购单量
    confirmed_inbound: int = 0      # 已确认入库量
    in_transit_qty: int = 0         # 在途量
    eta_confidence: float = 0.9     # 在途到货置信度
    current_stock: int = 0          # 当前库存
    # 成本参数
    unit_margin: float = 30.0       # 单位毛利($)
    air_freight_premium: float = 8.0  # 空运附加费/件($)
    lead_time_sea: int = 35         # 海运提前期
    lead_time_air: int = 7          # 空运提前期

    @property
    def bottom_up_forecast(self) -> int:
        """自下而上预测"""
        return int(self.last_promo_sales * self.growth_factor)

    @property
    def effective_supply(self) -> int:
        """有效供应量（含在途加权）"""
        return (self.confirmed_inbound
                + int(self.in_transit_qty * self.eta_confidence)
                + self.current_stock)

    @property
    def supply_gap(self) -> int:
        return max(self.bottom_up_forecast - self.effective_supply, 0)

    @property
    def gap_rate(self) -> float:
        return self.supply_gap / max(self.bottom_up_forecast, 1)


class PromoSOP:
    """大促S&OP协同引擎"""

    def __init__(self, promo_name: str, promo_date: datetime,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2403.17821。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史至少 2 次大促的 SKU 级销量、采购提前期、当前供应商产能与采购追踪数据（已确认、在途、缺口），以及大促目标 GMV。

**输出**：备货追踪矩阵、双路预测收敛结果、缺口率与紧急补货触发预案，供销售、采购与物流三方按节奏执行。

## 执行步骤

1. 按大促目标做自上而下的 SKU 拆解
2. 用历史大促数据做自下而上汇总并收敛差距
3. 跟踪采购确认与在途数量并计算缺口率
4. 按缺口阈值触发空运或加急补货预案

## 边界与不做

- 何时不用：常规月度需求供应对齐会议用S&OP销售与运营计划协同；促销峰值的运力与爆仓容量规划用大促物流爆仓预测。
- 能力边界：输出追踪结果与预案，实际下单、舱位锁定与组织协同仍需人工推进。
- 数据边界：缺少至少两次大促的 SKU 级销量时备货基线不可靠，追踪只能退化为人工经验值。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning、Skill-Promo-Stocktaking-SOP-Automation

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：04-供应链　·　源卡：`Skill-Promo-Stocktaking-SOP-Automation`