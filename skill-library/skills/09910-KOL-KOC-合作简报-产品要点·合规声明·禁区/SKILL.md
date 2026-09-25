---
id: influencer-brief-generator
title: KOL/KOC 合作简报（产品要点·合规声明·禁区）
description: 当需要向达人交付标准化合作 Brief（产品使用要点、必须口播的合规声明、禁止场景与素材授权）且已有信任型内容框架时调用；不替代合同与付款条款。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
---

## 目标

生成 **单页 Brief** + **检查清单**，使达人内容在发布前可走 `ftc-gdpr-compliance-checker`（北美 FTC 披露、欧洲广告与数据处理提示）。

## 前置条件

- 已有 `trust-content-generator` 中的 **事实与认证** 列表。  
- 已知合作形式：**佣金 / 赠品 / 现金**（影响披露文案）。  
- 已选平台与地区（TikTok/IG/YouTube，NA 或具体欧盟国家）。

## 步骤

1. **产品要点**：安全使用、清洁方式、禁忌人群（按说明书事实，不扩展）。  
2. **必须披露**：赞助关系、#ad / Paid partnership 等平台格式；欧盟侧标注 **商业合作** 语言模板。  
3. **禁区**：不得宣称疗效、不得展示未授权证言、不得使用未授权竞品对比。  
4. **素材与数据**：UGC 授权范围；若涉及用户故事，说明 **GDPR/同意** 要求（高层级，细节由法务确认）。  
5. 输出 **达人自检表**（勾选后视为可送合规门）。

## 输出格式

- `Brief_1pager`：Markdown；含 `Disclosure | Talking_points | Forbidden | Deliverables | Legal_note`  
- 表：`检查项 | 是/否 | 证据`

## When NOT to use

- 纯站内付费广告文案 — 用 `ad-copy-matrix`。  
- 合同条款、报价 — 人工/法务。

## 相关 Skill

- 上游：`trust-content-generator`（`next`）  
- 下游：`ftc-gdpr-compliance-checker`（`next`）
