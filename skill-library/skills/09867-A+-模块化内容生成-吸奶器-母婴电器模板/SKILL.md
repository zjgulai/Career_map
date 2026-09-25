---
id: aplus-content-generator
title: A+ 模块化内容生成（吸奶器/母婴电器模板）
description: 在 Listing 文案合规通过后，生成亚马逊 A+（或等价富媒体）模块草稿：技术参数、场景、安全认证、用户故事等模块占位与文案；不自动上传。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

输出 **模块类型 + 文案 + 图片 brief**（给设计或 AI 出图），符合品牌模块顺序与平台字符限制。

## 前置条件

- `listing-compliance-checker` = **PASS**（或等效签署）。  
- ERP 或素材包中 **图片版权/认证标** 可用性已确认。

## 步骤

1. 选择模板：**标准吸奶器**（参数表、使用场景、清洗、认证、FAQ）。  
2. 每模块填入 **事实性内容**（从 ERP/说明书）；营销句与 Listing 主描述 **同源避免矛盾**。  
3. 输出 **图片 brief**：构图、禁忌（如不得夸大疗效）、需出现的认证 logo 列表。  
4. 多语言：每模块标注目标语与 **从属 ASIN**。  
5. 导出为 **表格或 JSON**，便于上传工具。

## 输出格式

- `module_id | title | body | image_brief | lang | char_count`  
- **上传检查表**：字符上限、禁止 HTML。

## When NOT to use

- 站点不支持 A+ — 改为 **品牌故事长描述** 变体（单独说明）。  
- 合规未过 — 禁止生成对外版。

## 相关 Skill

- 上游：`listing-compliance-checker`（`next`）  
- 下游：`platform-formatter`（`next`）
