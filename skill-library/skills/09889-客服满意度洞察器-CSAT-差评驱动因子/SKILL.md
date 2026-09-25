---
id: csat-insight-extractor
title: 客服满意度洞察器（CSAT/差评驱动因子）
description: 在周报复盘或差评波动时，提取满意度驱动因子并输出改进优先级。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
  - H
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

把客服反馈转化为可执行改进项，提升满意度与复购。

## 前置条件

- 评分与评价文本
- 工单结案标签

## 步骤

1. 聚合 CSAT 与差评样本
2. 提取高频问题与情绪标签
3. 计算影响权重与优先级
4. 输出整改建议与责任归属

## 输出格式

表：`问题主题 | 影响范围 | 负向权重 | 优先级 | 改进建议 | Owner`

## When NOT to use

- 反馈样本量不足时

## 相关 Skill

- 上游：`review-response-writer`（`next`）
- 下游：`strategic-review-generator`（`triggers`）
