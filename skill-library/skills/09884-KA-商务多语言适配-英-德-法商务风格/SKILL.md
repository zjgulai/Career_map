---
id: multilingual-localizer-ka
title: KA 商务多语言适配（英/德/法商务风格）
description: 在买手提案中文案已定稿后，将执行摘要、条款说明、邮件沟通稿转为目标市场商务用语（英式/美式、德语、法语等），保持数字与法律含义不变；不替代法律翻译。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - C
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
channel_type: offline_ka
---

## 目标

输出 **分语言版本** 的提案关键段落与 **往来邮件模板**，语气符合 **零售商采购沟通习惯**（简洁、可承诺、少形容词）。

## 前置条件

- 源稿来自 `ka-buyer-proposal-generator` 或已定稿中文/英文母稿。  
- 明确 **目标语言** 与 **受众**（买手母语/团队工作语）。  
- **合同级条款** 标为「仅参考译文」，须 `external` 审阅。

## 步骤

1. **锁数字与 SKU**：译文中禁止改动 MOQ、价格、日期。  
2. **德/法**：注意性别与格式名词、正式称呼（Sie）。  
3. **英式 vs 美式**：货币、日期格式统一。  
4. **附件命名规范**：`Vendor_Proposal_SKU_Walmart_2025Q1_EN` 等。  
5. **禁忌**：过度承诺销量、医疗疗效类词汇（与 F 域一致）。

## 输出格式

- `段落ID | EN | DE | FR | notes`  
- 单独 **邮件模板**：首封跟进、会议邀请、材料补充。

## When NOT to use

- 仅需机翻全文 — 本 Skill 强调 **商务语境**，不是字对字。  
- 合同正文 — 走法务翻译流程。

## 相关 Skill

- 上游：`ka-buyer-proposal-generator`（`next`）  
- 下游：`ka-financial-model`（`next`）
