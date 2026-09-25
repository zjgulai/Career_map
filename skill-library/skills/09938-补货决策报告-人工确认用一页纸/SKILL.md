---
id: replenishment-decision-report
title: 补货决策报告（人工确认用一页纸）
description: 将预测、仓容、物流方案与财务/交期约束汇总为一份「补货决策报告」，供签字后再进入 purchase-order-generator；对应《完整建议》中「推送人工确认」环节。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
supply_focus: planning
---

## 目标

把 **量、时、钱、风险** 放在同一页：**建议是否补、补多少、何时到、备选方案、需 CGO/财务拍板的项**。

## 前置条件

- `logistics-route-optimizer` 输出；`demand-forecast-engine` 关键假设摘要。  
- **战略（含财务）**：最低毛利率、现金上限、是否允许加急费用 — 可粘贴为输入块。

## 步骤

1. **执行摘要**（5 行内）：总采购额、ETA、最大风险。  
2. **SKU/批次表**：与上游表对齐，附 **推荐选项** 列。  
3. **财务**：估计 COGS+物流占比、对现金流月份影响（粗算即可，标假设）。  
4. **异常与冲突**：仓容不足、MOQ、交期赶不上促销 — 单列。  
5. **签字栏**：采购、供应链负责人、（可选）财务。

## 输出格式

- 单页 Markdown/PDF 结构；**Approve / Adjust / Hold** 三态建议。

## When NOT to use

- 单笔小额补货 — 直接进 PO Skill 简化流程。  
- 战略约束未给 — 报告须列「待填」不得伪造通过。

## 相关 Skill

- 上游：`logistics-route-optimizer`（`next`）  
- 下游：`purchase-order-generator`（批准后 `next`）
