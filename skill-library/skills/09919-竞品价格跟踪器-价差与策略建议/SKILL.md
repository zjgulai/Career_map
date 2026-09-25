---
id: competitor-price-tracker
title: 竞品价格跟踪器（价差与策略建议）
description: 当价格竞争加剧或转化率下降时，跟踪竞品价格与促销并输出应对建议。
skill_version: "0.1.0"
l2_pillar: 产品
ref_domain:
  - A
  - H
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

形成可执行的价差策略建议，支持定价与促销决策。

## 前置条件

- 竞品价格与促销快照
- 本品价格与转化数据

## 步骤

1. 计算竞品价差与波动趋势
2. 识别高冲突品类与 SKU
3. 估计价差对转化影响
4. 输出调价与促销建议

## 输出格式

表：`SKU | 竞品价 | 本品价 | 价差 | 波动趋势 | 风险等级 | 建议动作`

## When NOT to use

- 缺少竞品样本时

## 相关 Skill

- 下游：`pricing-strategy-advisor`（`triggers`）
