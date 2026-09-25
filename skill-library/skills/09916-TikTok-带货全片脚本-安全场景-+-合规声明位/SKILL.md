---
id: tiktok-script-generator
title: TikTok 带货全片脚本（安全场景 + 合规声明位）
description: 当需要基于 Hook 与产品事实生成整支带货视频的完整脚本（分镜、口播、字幕、必填安全提示位）且将用于 TikTok Shop/信息流投放时调用；须再经 `ftc-gdpr-compliance-checker` 与平台政策。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: online_3p
---

## 目标

在 **`tiktok-hook-writer` 或平台格式化后的卖点** 基础上，扩展为 **30–60s（可标延长）** 全脚本：场景清单、镜头节奏、口播全文、on-screen 字幕与安全声明插入点。

## 前置条件

- 已有 **Hook**（来自 `tiktok-hook-writer`）或 `platform-formatter` 中的 TikTok 字段摘要。  
- 产品 **使用安全要点** 来自说明书事实层（禁止疗效宣称）。  
- 目标市场语言与 **#ad / 赞助披露** 格式已知。

## 步骤

1. **结构**：Hook（3s）→ 痛点共鸣 → 产品演示 → 社会证明或认证可见性 → CTA。  
2. 为每段标注 **时长与镜头**（特写/俯拍/手持）。  
3. 嵌入 **母婴安全**：清洁、禁忌人群、异常停机等等说明书可引用点（不夸大）。  
4. 输出 **合规占位**：医疗宣称禁用词自查提示（对齐 `listing-compliance-scanner` 精神）。  
5. 附 **备选结尾**（软转化 vs 强促销）。

## 输出格式

- `Script_v1`：分镜表 `T | 画面 | 口播 | 字幕 | 音效/贴纸`  
- **单页拍摄清单**：道具、婴儿/模特授权占位。

## When NOT to use

- 仅要前 3 秒 Hook — `tiktok-hook-writer`。  
- 纯品牌故事无带货 CTA — 营销域 brief。

## 相关 Skill

- 上游：`tiktok-hook-writer`（`next`）、`platform-formatter`（`next`）  
- 合规：`ftc-gdpr-compliance-checker`
