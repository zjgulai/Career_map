---
id: pricing-strategy-advisor
title: 跨平台定价与单位经济参谋（佣金·税·竞争）
description: 当需要基于 ERP 成本与各平台佣金/物流/退货假设输出指导价区间、促销折扣底线与多市场价差建议时调用；输出为决策草稿，对外报价须财务与渠道负责人确认。
skill_version: "0.1.0"
l2_pillar: 财务
ref_domain:
  - H
  - B
risk_tier: P1_standard
execution_boundary: hybrid
market_profile: both
data_from: erp
---

## 目标

形成 **可比对表**：Amazon / TikTok Shop / Shopify（DTC）下的 ** landed 毛利区间**、**价格带建议**、**促销折扣上限**；北美与欧洲 **税与 VAT 处理** 分轨列示（占位符级别）。

## 前置条件

- ERP 或表格提供 **采购/到岸成本、包装、目标毛利率底线**（可部分缺失标 TBD）。  
- 各平台 **佣金与履约费规则版本**（日期标注）。  
- 竞品锚点价格 **来源说明**（爬虫/手工/第三方）。

## 步骤

1. **成本栈**：到岸成本 → 平台费用 → 支付与退货拨备 → 营销占比占位 → **贡献毛利**。  
2. **分平台**：插入费率差异、FBA vs 自发货、TTS 佣金政策等 **公开规则摘要**。  
3. **价差策略**：同款 **亚马逊 vs DTC** 防渠道冲突原则（MAP/价格条款占位）。  
4. **欧洲**：标价 **含 VAT 展示** 与各国税率占位；不写死法律结论。  
5. **输出敏感性**：成本 ±5%、退货率 ±X 对底价的 **压力测试三档**。

## 输出格式

- 表：`SKU | Channel | List_price_band | Promo_floor | Margin_indic | Fees_ver | Notes`  
- **决策摘要**：5 条以内，含 **须人工确认** 项。

## When NOT to use

- KA 进场条款与账期模型 — `ka-financial-model`。  
- 仅调广告不调价 — `amazon-ad-optimizer`。

## 相关 Skill

- 可与：`keyword-matrix-builder`（`next` 并行输入词与定价联席会）  
- 下游：渠道运营按表执行；重大变更进 `strategic-review-generator`
