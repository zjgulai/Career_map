---
id: ftc-gdpr-compliance-checker
title: FTC 广告披露 + GDPR 数据使用（营销物料门禁）
description: 当营销物料（短视频脚本、达人 Brief、广告文案）定稿前需做北美 FTC 广告披露与欧洲 GDPR/营销同意相关的高层级检查时调用；不替代律师意见或 DPIA。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
  - F
risk_tier: P0_gate
execution_boundary: hybrid
market_profile: both
---

## 目标

输出 **PASS / FIX / BLOCK** 三态与 **可执行修改清单**：FTC 侧侧重赞助披露、证言与典型结果声明；GDPR 侧侧重用户生成内容、邮件与再营销中的数据提示（框架级）。

## 前置条件

- 完整 **待审物料** + **发布渠道/地区**。  
- 已知 **商业关系**（自有/赞助/联盟）。  
- 若含 **用户故事或画像**，说明数据收集方式（勾选/表单/截图授权）。

## 步骤

1. **FTC（NA）**：识别应披露关系；检查背书与评价是否需「典型结果」说明；标出可能误导的省略。  
2. **州/平台**：记录需进一步确认的 **平台专属规则**（TikTok/ Meta 广告库等）为 TODO。  
3. **GDPR（EU）**：若物料涉及个人数据展示或再营销，列出 **合法性基础** 占位与 **缺少的同意话术**；不涉及个人数据则标 N/A。  
4. **母婴特殊**：夸大安全/疗效、恐惧营销 — 与 `listing-compliance-scanner` 规则对齐引用。  
5. 输出 **修订句** 仅作草稿，须人工与法务确认。

## 输出格式

- `status: PASS | FIX | BLOCK`  
- 表：`条款/主题 | 风险 | 市场 | 建议修改 | 责任方(营销/法务)`  
- **BLOCK** 时列出 **解锁条件**（如补充披露句、删除未授权证言）。

## When NOT to use

- 医疗器械技术文件或 DoC — 走认证与法规岗位。  
- 纯 Listing 医疗宣称扫描 — 用 `listing-compliance-scanner`。

## 相关 Skill

- 上游（汇入）：`brand-voice-guardian`、`ad-copy-matrix`、`influencer-brief-generator`（`next`）  
- 调性前置：`brand-voice-guardian`
