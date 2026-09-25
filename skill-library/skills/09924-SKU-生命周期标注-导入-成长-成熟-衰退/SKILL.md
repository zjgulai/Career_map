---
id: sku-lifecycle-classifier
title: SKU 生命周期标注（导入/成长/成熟/衰退）
description: 当已有销量时间序列或周度销量斜率、需将 SKU 标注为导入/成长/成熟/衰退以驱动归因或退场策略时调用；依赖 ERP 或报表数据。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
data_from: erp
---

## 目标

为每个 SKU（可按站点）输出 **生命周期阶段** 与 **置信度**，作为 `attribution-analyzer`、`sku-exit-decision-tree` 的输入。

## 前置条件

- 至少 **12 周** 周销量或等价的日聚合；促销大促周需标注或剔除。  
- 与 `sku-health-scanner` 使用同一 **SKU 键** 与 **市场维度**。

## 步骤

1. 计算滚动斜率、同比/环比、增速分位数（阈值可配置并写在输出头）。  
2. 规则映射：**导入**（低基数高增）、**成长**、**成熟**（增速趋缓）、**衰退**（持续负增长或低于类目阈值）。  
3. 对 **季节品** 单独打标或要求输入季节日历。  
4. 输出与 `sku-health-scanner` 等级（S/A/B/C）的 **交叉表**，标出不一致项供人工复核。

## 输出格式

- 表：`sku | market | phase | confidence | key_metrics | notes`  
- **摘要**：各阶段 SKU 数量与 GMV 占比（若提供金额字段）。

## When NOT to use

- 新品上架不足 4 周且无行业对标 — 标为「观察期」而非强分阶段。  
- 全量仅 1 个快照周 — 无法分阶段。

## 相关 Skill

- 上游：`sku-health-scanner`（建议先跑健康度再跑本 Skill）  
- 下游：`attribution-analyzer`、`sku-exit-decision-tree`（`triggers`）；`assortment-structure-analyzer`（`next`，货盘结构链）
