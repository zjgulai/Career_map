---
id: production-schedule-planner
title: 排产计划器（促销备货与产能平衡）
description: 当促销备货或缺货风险上升时，基于需求预测与产能约束输出可执行排产计划。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

在交期、MOQ 与产能约束下，给出稳定可执行的排产方案。

## 前置条件

- 需求预测结果
- 产能与交期约束
- MOQ 与安全库存策略

## 步骤

1. 汇总预测需求与产能边界
2. 识别高风险 SKU 与瓶颈工序
3. 生成分周排产计划
4. 输出延误风险与替代策略

## 输出格式

表：`SKU | 周期 | 需求量 | 排产量 | 产能占用 | 风险等级 | 备注`

## When NOT to use

- 无有效预测与产能数据时

## 相关 Skill

- 上游：`demand-forecast-engine`（`next`）
- 下游：`fba-capacity-planner`（`next`）
