---
id: listing-bulk-generator
title: Listing 批量生成（ERP 主数据 → 平台草稿）
description: 当有关键词矩阵与合规通过的文案约束、且需从 ERP 批量生成亚马逊/TikTok/Shopify 上架草稿时调用；生成前须满足 listing-compliance-scanner PASS。
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

将 **ERP SKU 行 + 关键词矩阵** 转为 **分平台结构的 Listing 草稿**（标题、五点、描述框架），并预留 A+ 模块占位；**不自动发布**。

## 前置条件

- `listing-compliance-scanner` 对同类目模板或本批样例输出为 **PASS**，或明确记录 **残留 Block 已人工豁免**（需战略/法务背书）。  
- 已具备 `keyword-matrix-builder` 输出或与之一致的词表。  
- 平台模板选定（字符上限、禁用 HTML 等）。

## 步骤

1. 按平台拆分生成逻辑（亚马逊标题 200 字节等硬约束优先）。  
2. 字段级填入：从 ERP 拉规格、认证展示位、包装清单等 **仅事实性内容**；营销形容词走营销域审过的词库。  
3. 每 SKU 输出 **合规声明脚注位**（如「详见说明书」类中性表述），避免医疗宣称。  
4. 批量输出为 **CSV/Markdown 表** 或 JSON 行，便于导入刊登工具。  
5. 对失败行（缺字段）单独 **ERROR 报告**，不混入成功文件。

## 输出格式

- 主文件：`sku | platform | title | bullets | description_stub | aplus_blocks_stub | errors`  
- **摘要**：成功条数 / 失败条数 / 需人工复核条数。

## When NOT to use

- 单条 Listing 微调 — 直接编辑即可。  
- 合规扫描未覆盖新宣称 — 先补扫再生成。

## 相关 Skill

- 上游：`keyword-matrix-builder`；**门禁**：`listing-compliance-scanner`  
- 下游：`multilingual-localizer`、`aplus-content-generator`（见《完整建议》B 域，待建）
