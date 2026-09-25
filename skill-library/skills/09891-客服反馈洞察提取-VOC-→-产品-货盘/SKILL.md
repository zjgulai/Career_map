---
id: feedback-insight-extractor
title: 客服反馈洞察提取（VOC → 产品/货盘）
description: 当需从一段时期内的工单与评价中提炼可结构化洞察（质量问题、包装、说明书、竞品对比）并推送给产品与货盘域时调用。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P2_nice
execution_boundary: internal
market_profile: both
---

## 目标

输出 **主题聚类**、**Top 问题 SKU**、**频次趋势**、**可执行建议**（设计/供应链/Listing），并 **标注严重度**。

## 前置条件

- 导出 **工单文本**（脱敏）或 **评价聚合**；时间窗 **≥14 天** 较稳。  
- **SKU 映射表**（若用户用语不标准）。

## 步骤

1. **清洗**：去 PII、去重模板回复。  
2. **主题模型或规则聚类**（吸力、噪音、配件、App 等）。  
3. **交叉**：主题 × 市场 × 渠道。  
4. **与质量数据对齐**（若 RMA 率可得）。  
5. 输出 **给产品周会** 的一页纸 + **给货盘** 的 SKU 清单。

## 输出格式

- `theme | count | example_quotes_redacted | sku_top | severity | owner_suggested`  
- **行动项**：进入 `sku-health-scanner` 或工程变更。

## When NOT to use

- 样本量 <20 条 — 只做定性摘录，不做强统计。  
- _campaign 期间噪声大 — 分段分析。

## 相关 Skill

- 下游：`sku-health-scanner`、`attribution-analyzer`（`triggers` 可选）  
- 定期与 `strategic-review-generator` 联动
