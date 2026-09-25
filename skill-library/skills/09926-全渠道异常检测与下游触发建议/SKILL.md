---
id: anomaly-detector
title: 全渠道异常检测与下游触发建议
description: 当需要基于销量、ACOS、库存、退货率等阈值发现异常，并建议触发产品/供应链/渠道域的哪个 Skill 时调用；不替代人工确认是否执行触发。
skill_version: "0.1.0"
l2_pillar: 战略
ref_domain:
  - H
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **异常事件列表** 与 **建议触发的 Skill id**（如 `sku-health-scanner`），支撑 H 域「分析驱动行动」；**最终是否触发**由你或编排层决定。

## 前置条件

- 输入为 **标准化指标表**（按日/周聚合），字段名与口径一致。  
- 已配置 **阈值**（可在 Skill 内用 YAML 块或外部配置粘贴）。

## 步骤

1. 分指标检测：销量突降/飙升、ACOS 异常、库存可售天数过低、退货率跳升等。  
2. 每条异常打标签：`severity`、`likely_domain`（产品/供应链/渠道/客服）。  
3. 映射 **建议触发**：例如库存+销量矛盾 → `sku-health-scanner`；Listing 流量断崖 → 渠道侧归因 Skill（待建）。  
4. **去重**：同一根因多指标只保留一条主异常。  
5. 输出 **简报** 供周会使用。

## 输出格式

- 表格：`异常ID | 指标 | 维度值 | 阈值 | 严重度 | 建议触发 Skill | 备注`  
- **不触发列表**：数据不足或口径不明项。

## When NOT to use

- 单一已知事件（如平台封店）— 直接走危机预案 Skill。  
- 无历史基线首日数据 — 只做展示不做异常判定。

## 相关 Skill

- 下游：`sku-health-scanner`（`triggers`）、`cross-domain-trigger-hub`（`next`）、`replenishment-predictor`（库存/断货类异常，`triggers`）  
- 扩展：`cross-domain-trigger-hub` → `strategic-review-generator`
