---
id: keyword-matrix-builder
title: 关键词矩阵（核心/场景/长尾，NA 与 EU 分轨）
description: 当需要为亚马逊/TikTok/独立站搭建可批量用于 Listing 与广告的三层关键词矩阵时调用；必须指定 market_profile，北美与欧洲不得混表。
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

输出 **核心词 / 场景词 / 长尾词** 结构化表，并与 ERP 中 SKU、品类、目标站点对齐，供 `listing-bulk-generator` 消费。

## 前置条件

- 已选站点与语言（如 Amazon US 英语；Amazon DE 德语为主）。  
- 有关键词研究工具导出的原始表或搜索量字段时可粘贴；无则基于品类与竞品 Listing 反推并标注「待验证」。

## 步骤

1. 从 ERP 取 SKU、品类、核心属性（吸力档位、便携、静音等）作为 **种子词** 来源。  
2. 按三层扩展：核心（高相关）、场景（痛点/使用情境）、长尾（购买意图/兼容型号）。  
3. **NA/EU 分文件或分 Sheet**；欧洲多语言按 **一国一表** 或「主语言+备注译法」二选一，禁止混为一列无标注。  
4. 标记 **品牌词 / 竞品词 / 受限词**（与 `listing-compliance-scanner` 规则避免冲突）。  
5. 输出与平台字段映射建议（标题长度、埋词位置）。

## 输出格式

- 表格：`层级 | 关键词 | 语言 | 意图 | 证据/来源 | 建议用于标题/五点/搜索词 | 备注`  
- 每 SKU 或每 ASIN 目标一页摘要。

## When NOT to use

- 仅要单条标题口号 — 用营销域 brief。  
- 未确定目标市场 — 先 `market-compliance-checker` 定轨再定词。

## 相关 Skill

- 下一环：`listing-bulk-generator`（`next`）；并行：`pricing-strategy-advisor`（`next`，定价参谋）  
- 门禁依赖：`listing-compliance-scanner`（`blocks_until` 链）
