---
id: customer-resolution-router
title: 客诉处理分流中枢（退货/差评/安全升级）
description: 当需要把客服输入按风险与诉求类型分流到退货判定、差评回复或安全升级流程时调用。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
  - F
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

将客服工单标准化分流，减少误判和重复处理。

## 前置条件

- 已有 `inquiry-classifier-multilingual` 或人工初筛结果
- 有基础客诉字段（订单、SKU、问题类型、风险标签）

## 步骤

1. 识别诉求类型与风险等级
2. 匹配分流规则
3. 路由到退货判定、差评回复或安全升级
4. 输出处理建议与时效要求

## 输出格式

表：`Ticket | Route | Priority | SLA | NextSkill | Reason`

## When NOT to use

- 无工单结构化信息时
- 需要法务最终判定时

## 相关 Skill

- 上游：`reply-generator-multilingual`（`next`）
- 下游：`return-decision-tree`（`triggers`）、`review-response-writer`（`triggers`）
