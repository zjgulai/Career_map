---
id: sla-monitor
title: 客服 SLA 监控器（响应/解决时效）
description: 当客服响应或解决时长接近或超过阈值时，输出预警与资源调整建议。
skill_version: "0.1.0"
l2_pillar: 客服
ref_domain:
  - G
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

提升客服时效稳定性，降低超时导致的口碑与赔付风险。

## 前置条件

- 工单生命周期明细
- 响应/解决 SLA 阈值

## 步骤

1. 计算工单各阶段时长
2. 标注即将超时与已超时工单
3. 识别队列瓶颈与优先级冲突
4. 输出调度与人力建议

## 输出格式

表：`工单 | 当前状态 | 已耗时 | SLA阈值 | 风险等级 | 建议动作`

## When NOT to use

- 无工单时序数据时

## 相关 Skill

- 上游：`customer-resolution-router`（`next`）
