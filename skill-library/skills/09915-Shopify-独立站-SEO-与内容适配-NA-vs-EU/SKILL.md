---
id: shopify-seo-optimizer
title: Shopify 独立站 SEO 与内容适配（NA vs EU）
description: 当需要为 DTC 独立站优化集合页/博客/产品页的 SEO 要素（标题、meta、结构化数据占位、hreflang 思路）并区分北美与欧洲搜索习惯时调用；不替代技术 SEO 爬网与 Core Web Vitals 工程排障。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
channel_type: dtc
---

## 目标

输出 **页面级 SEO 包**：目标关键词、title/description、H1 建议、内链锚文本、FAQ 架构占位；**欧盟市场** 单独备注 **多语言 URL 与 GDPR  Cookie/同意** 对内容可见性的约束（高层级）。

## 前置条件

- 已有 `keyword-matrix-builder` 或调研词表；**一国一策略**，禁止混用关键词语言。  
- 已知 Shopify **主题/SEO 插件** 能力边界（可标「需开发」）。  
- 产品合规宣称与 Listing 一致（引用 ERP/合规 Skill）。

## 步骤

1. **意图映射**：信息型 vs 交易型查询；集合页 vs 产品页分工。  
2. 生成 **meta 两套长度**（Google SERP 与社交分享）。  
3. **结构化数据**：Product/FAQPage JSON-LD **字段清单**（非代码也可）。  
4. **hreflang / Markets**：若多市场，列 **URL 规则与 canonical 原则**（占位）。  
5. **内容缺口**：需补充的博客主题列表（信任/教育类优先于硬推销）。

## 输出格式

- 每 URL 一行表：`URL | PrimaryKW | Title | Meta | H1 | Notes`  
- **附录**：与亚马逊 Listing 的 **canonical 冲突** 检查项。

## When NOT to use

- 纯亚马逊站内 SEO — 用广告与 Listing 链。  
- 全站性能与爬虫预算 — 需技术 SEO/工程。

## 相关 Skill

- 上游：`platform-formatter`（`next`）；词源 `keyword-matrix-builder`
