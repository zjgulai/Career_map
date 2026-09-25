---
id: ka-vs-online-assortment-planner
title: KA 与线上货盘差异化规划（防渠道冲突）
description: 当需要为同一品牌在线下 KA 与亚马逊/TikTok/独立站之间划分 SKU 组合、包装与定价边界以减少串货与价格冲突时调用；条款与合同须法务与渠道负责人确认。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
  - C
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
data_from: erp
---

## 目标

输出 **渠道货盘对照表**：线上专供 / KA 专供 / 共用（有条件）三类；每 SKU 标注 **角色**、**包装差异建议**、**MAP/价格条款占位**、**冲突风险**。

## 前置条件

- 已有 `new-sku-opportunity-scanner` 或等价 **新品与结构结论**；KA 侧可有 `ka-sell-through-analyzer` 摘要。  
- 已知 **零售商限制**（如包装尺寸、条码体系、是否禁止线上同款）。  
- ERP 能区分 **渠道字段** 或手工映射表。

## 步骤

1. 拉取 **线上动销 Top** 与 **KA POS/动销**（若有）对照，标 **重叠款**。  
2. 对重叠款给出 **差异化选项**：改型号后缀、套装、颜色/配件独占、容量规格等（占位）。  
3. 定义 **上新顺序**：先上哪一渠道、另一渠道解锁条件。  
4. **促销协同**：大促周与 KA 促销叠放时的 **价盘保护** 原则（不写具体数字除非已授权）。  
5. 将需供应链配合项标 **E 域 follow-up**（MOQ、包材、交期）。

## 输出格式

- 表：`SKU | Online_role | KA_role | Overlap_risk | Mitigation | Owner`  
- **执行摘要**：供 `ka-jbp-generator` 或内部渠道会引用。

## When NOT to use

- 纯线上无 KA — 省略本 Skill。  
- 单一合同条款审阅 — 法务流程。

## 相关 Skill

- 上游：`new-sku-opportunity-scanner`（`next`）；`ka-sell-through-analyzer`（`triggers`）  
- 关联：`ka-replenishment-planner`、`pricing-strategy-advisor`（人工联席）
