---
id: reply-generator-multilingual
title: 多语言客服回复生成（品牌调性 + 母婴用语）
description: 在已确认非安全升级类工单、需生成首响或跟进回复草稿时调用；须符合品牌调性，且不含医疗承诺或违规宣称。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **2 个语气版本**（正式/亲切）或 **单版本**（按渠道规范），并附 **需人工确认句** 列表。

## 前置条件

- `safety-flag-detector` = `SAFE_TO_ASSIST` 或已人工解除升级。  
- **政策摘要**：退换货窗口、保修、寄回地址规则（可粘贴）。  
- **语言** 与 **渠道字符限制**（如聊天 500 字）。

## 步骤

1. **共情 + 事实确认** 开场；避免过度道歉模板化。  
2. **解决方案** 分步（补发、退款、教程链接）。  
3. **合规**：不诊断疾病、不承诺疗效；母婴类附 **安全使用提醒** 引用说明书。  
4. 附 **下一步**：若用户未回复的跟进时间。  
5. 标 **敏感词** 供质检。

## 输出格式

- `draft_reply | lang | tone | human_review_flags`  
- 可选 **EN + 用户语言** 双语版本。

## When NOT to use

- 安全升级未结案 — **禁止** 发本 Skill 草稿。  
- 媒体/监管来函 — 升级公关与法务。

## 相关 Skill

- 上游：`safety-flag-detector`（`next`）  
- **按需并行**：`return-decision-tree`（退款/退货）、`review-response-writer`（公开评价）；图中 **无强制 next**，按工单类型选用。
