---
id: return-decision-tree
title: 退货/换货决策树（平台政策 + 成本与库存）
description: 当工单进入退款/退货阶段、需根据平台规则、成本、库存与用户体验给出可执行方案时调用；输出供客服执行与财务备案。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
---

## 目标

输出 **推荐方案**（全额退 / 部分退 / 换货 / 重发配件 / 优惠券安抚）与 **条件**（用户是否需寄回、标签谁承担）。

## 前置条件

- **平台**（亚马逊 FBA/FBM、Shopify、KA）与 **订单日期**、**类目**（母婴可能涉安全召回例外）。  
- **成本**：退货处理费、残值、运费；无则标区间。  
- **战略红线**：单笔最大让步（可粘贴）。

## 步骤

1. **匹配平台政策窗口**（如 30 天、A-to-z）。  
2. **分支**：质量问题 vs 主观不满 vs 物流损坏。  
3. **安全相关** — 优先 **召回/停售流程**，不单走退款结案。  
4. 计算 **方案总成本** 与 **用户 LTV 粗估**（可选）。  
5. 输出 **话术要点** 给 `reply-generator-multilingual`。

## 输出格式

- `recommended_option | conditions | cost_estimate | approval_needed`  
- **树状附录**（Markdown 嵌套列表）。

## When NOT to use

- 批量政策变更公告 — 用公告模板，非单票树。  
- 仅询价未下单 — 用售前政策。

## 相关 Skill

- 上游：`inquiry-classifier-multilingual`、`reply-generator-multilingual`  
- 联动：`sku-exit-decision-tree`（批量不良）、战略侧毛利（待接）
