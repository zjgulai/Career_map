---
id: brand-voice-guardian
title: 品牌调性守护（专业·温暖·可信赖）
description: 当需要在发布前检查营销文案/脚本是否符合「专业+温暖+可信赖」母婴调性、并标出语气偏离与夸大风险时调用；不替代法律合规结论。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

对 **待发布文本**（Hook、标题、口播稿）做调性评分与修订建议，输出「可发 / 需改 / 禁发」三档中的前两档处理意见（禁发项移交合规门）。

## 前置条件

- 已有完整 **待检文案** 与 **目标受众**（如新手妈妈、职场哺乳）。  
- 若有 **品牌词库**（首选词/禁用词）可一并粘贴。

## 步骤

1. 对照四维：**专业**（无恐吓营销、无未证实疗效）、**温暖**（不制造喂养焦虑）、**可信赖**（不虚假社会证明）、**清晰**（无过度网络梗导致歧义）。  
2. 标出 **夸大用语**（best #1、治愈、医疗承诺倾向）并给 **替换短语**。  
3. 检查 **文化雷区**（NA vs EU 对「天然/有机」宣称的敏感度差异）。  
4. 输出修订版 **diff 风格** 或逐句批注。

## 输出格式

- `verdict: OK | REVISE`（若疑似违法宣称标 `ESCALATE_TO_COMPLIANCE`）  
- 表：`片段 | 问题类型 | 严重度 | 建议替换 | 备注`

## When NOT to use

- FDA/MDR Listing 用词扫描 — 用 `listing-compliance-scanner`。  
- FTC 披露与证言披露完备性 — 用 `ftc-gdpr-compliance-checker`。

## 相关 Skill

- 上游：`tiktok-hook-writer`（`next`）  
- 下游：`ftc-gdpr-compliance-checker`（`next`）
