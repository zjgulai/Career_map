---
id: inquiry-classifier-multilingual
title: 进线问题多语言分类（咨询/投诉/退款/安全/好评）
description: 当收到英/德/法/意/西/阿等语言的客服工单或邮件、需先分类与打优先级以便路由时调用；**安全类永远最高优先级**。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **结构化标签**：`category`（咨询/投诉/退款退货/安全疑虑/好评邀评/其他）、`urgency`、`language_detected`、`sku_if_any`、`channel`（邮件/聊天/社媒/电话纪要）。

## 前置条件

- 原始文本粘贴；若为图片/OCR，标注 **可信度**。  
- **时区**：用户所在市场（影响 SLA 表述）。

## 步骤

1. **语言检测**；不确定标 `mixed`。  
2. **意图分类**；多意图拆成主/次。  
3. **安全关键词**（漏电、异味、婴儿不适、零件脱落等）— **强制标 `safety_suspected: true`** 并 **不得** 自动关闭。  
4. **订单号/SKU** 抽取；缺失列 **待补字段**。  
5. 输出 **路由建议**：`safety-flag-detector` / `reply-generator` / `return-decision-tree` / 人工。

## 输出格式

- JSON 或表：`ticket_id | lang | category | urgency | safety_suspected | route_next`  
- **摘要一句** 供主管扫读。

## When NOT to use

- 已人工分类完毕仅需回复 — 直达 `reply-generator-multilingual`。  
- 法律函件 — 升级法务，不自动分类结案。

## 相关 Skill

- 下游：`safety-flag-detector`（`next`，或并行优先执行）
