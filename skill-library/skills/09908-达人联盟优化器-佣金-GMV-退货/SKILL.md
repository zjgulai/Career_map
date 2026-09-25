---
id: creator-affiliate-optimizer
title: 达人联盟优化器（佣金/GMV/退货）
description: 当达人联盟计划启动或效率下滑时，基于内容表现与退货数据输出达人分层和佣金优化建议。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

提高达人联盟计划的有效 GMV 与稳定协作质量。

## 前置条件

- 达人内容表现数据
- 佣金结构与结算数据
- GMV 与退货率数据

## 步骤

1. 按表现与退货率对达人分层
2. 识别高潜与高风险达人
3. 给出佣金与合作策略建议
4. 输出白名单与淘汰建议

## 输出格式

表：`达人 | 内容效率 | GMV | 退货率 | 当前佣金 | 建议佣金 | 建议动作`

## When NOT to use

- 达人样本不足时

## 相关 Skill

- 上游：`influencer-brief-generator`（`next`）
- 下游：`campaign-performance-analyzer`（`triggers`）
