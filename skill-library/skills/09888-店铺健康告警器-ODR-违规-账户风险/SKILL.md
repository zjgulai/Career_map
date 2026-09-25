---
id: store-health-alerter
title: 店铺健康告警器（ODR/违规/账户风险）
description: 当店铺健康分、ODR 或违规项出现波动时，输出告警分级、修复清单和处理时效建议。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - B
  - C
  - F
risk_tier: P0_gate
execution_boundary: internal
data_from: erp
---

## 目标

提前识别平台账户风险，避免流量限制与店铺处罚。

## 前置条件

- 店铺健康指标快照
- 违规通知与申诉记录
- 客诉与退款相关数据

## 步骤

1. 汇总店铺健康核心指标
2. 按风险等级进行告警分层
3. 给出修复路径与 SLA 建议
4. 触发对应客服/渠道处置流程

## 输出格式

表：`店铺 | 指标项 | 当前值 | 风险等级 | 修复动作 | SLA | Owner`

## When NOT to use

- 无账户健康数据来源时

## 相关 Skill

- 上游：`listing-gate-decision-engine`（`triggers`）
- 下游：`customer-resolution-router`（`triggers`）
