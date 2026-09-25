---
id: ka-replenishment-planner
title: KA 补货计划（采购周期、库存水位、节假日备货）
description: 在已有动销与库存分析后，结合 KA 采购周期、最小订单、在途与促销备货需求，生成按 SKU/门店/周的补货建议与风险提示。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: offline_ka
data_from: erp
---

## 目标

输出 **建议补货量与到货周**，并与 **供应链 E 域**（`logistics-route-optimizer`、KA 直送路径）对齐，避免「电商 FBA 逻辑」与 **KA DC 逻辑**混用。

## 前置条件

- `ka-sell-through-analyzer` 或等价预警列表。  
- **采购周期**（下单至到货）、**MOQ**、**在途 PO**、**DC 库存水位**。  
- **节假日日历**（如 Black Friday、圣诞）。

## 步骤

1. 按 **安全库存天数策略**（如覆盖 6 周 sell-through）计算建议量。  
2. 拆分为 **补货批次**（对齐集装箱/托盘）。  
3. 标注 **与促销叠放的 uplift**（来自营销/销售输入）。  
4. **冲突检测**：若与 `replenishment-predictor` 电商侧抢货 — 标 **分配优先级**（需战略确认）。  
5. 输出 **执行表**：下单日、到港日、到 DC 日。

## 输出格式

- `sku | qty | ship_week | dc | reason | risk`  
- **摘要**：总件数、总货值、现金流峰值周。

## When NOT to use

- 零售商未提供可靠库存 — 仅给 **sell-in 建议** 并声明风险。  
- 合同冻结订货 — 走合同变更流程。

## 相关 Skill

- 上游：`ka-sell-through-analyzer`（`next`）  
- 联动：`logistics-route-optimizer`（KA 直送）、`purchase-order-generator`（需区分 KA PO 模板）
