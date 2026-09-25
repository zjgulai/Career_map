---
id: weekly-assortment-report
title: 周度货盘经营报告（加码/观察/淘汰）
description: 每周汇总 SKU 健康、利润、动销、退货与库存周转，输出货盘分层与经营动作建议。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
  - H
risk_tier: P0_gate
execution_boundary: internal
data_from: erp
---

## 目标

形成周度货盘结构决策报告，支撑经营会快速决策。

## 前置条件

- SKU 健康评分与生命周期标签
- 单位经济测算结果
- 动销、退货、库存周转数据

## 步骤

1. 汇总货盘核心指标
2. 生成分层（加码/观察/淘汰）
3. 识别高风险与高潜力 SKU
4. 输出下周动作建议

## 输出格式

表：`SKU | 生命周期 | 毛利率 | 动销 | 退货率 | 周转天数 | 分层 | 建议动作`

## When NOT to use

- 日级实时调度场景

## 相关 Skill

- 上游：`sku-health-scanner`、`unit-economics-calculator`（`next`）
- 下游：`strategic-review-generator`（`next`）
