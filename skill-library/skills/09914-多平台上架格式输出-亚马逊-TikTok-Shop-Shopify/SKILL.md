---
id: platform-formatter
title: 多平台上架格式输出（亚马逊 / TikTok Shop / Shopify）
description: 当 Listing/A+ 已定稿且需按各平台字段长度、HTML/富文本、变体与媒体槽位导出可粘贴或批量导入片段时调用；不替代各平台后台发布权限与 API 报错排查。
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

将 **统一内容包** 拆成 **Amazon / TikTok Shop / Shopify** 三份平台规格表：字段映射、字符上限、禁用 HTML、变体键、主图/视频槽位说明。

## 前置条件

- 上游 **`aplus-content-generator`**（亚马逊 A+）或等价「已定稿内容块」；多平台并行时需 **同一 SKU 的 master 文案** 已冻结版本号。  
- 已知各站点 **卖家账户类型**（SC/VC 仅记备注，不展开权限）。

## 步骤

1. 建立 **字段映射表**：标题、五点、长描述、搜索词/标签、类目节点 ID（占位）。  
2. 按平台套用 **长度与格式**（纯文本 / 有限 HTML / 富文本）；标出 **与母本不一致的截断点**。  
3. **TikTok Shop**：商品卖点条数、短视频封面建议时长、必填属性（类目依赖）。  
4. **Shopify**：meta title/description、handle 规则、多语言路由占位（若启用 Markets）。  
5. 输出 **发布检查单**：品牌备案、GTIN、危险品/电器属性是否已选。

## 输出格式

- 分平台三份 Markdown/CSV；表：`Platform | Field | MaxLen | Content | Notes`  
- **Diff**：与上一版导出若版本管理可用则标变更行。

## When NOT to use

- 合规用词是否合格 — 须已通过 `listing-compliance-checker`。  
- 仅投广告不调 Listing — 用 `amazon-ad-optimizer`。

## 相关 Skill

- 上游：`aplus-content-generator`（`next`）  
- 下游：`amazon-ad-optimizer`、`tiktok-script-generator`、`shopify-seo-optimizer`（`next`）
