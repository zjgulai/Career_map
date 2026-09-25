---
id: unit-economics-calculator
title: 单位经济测算（毛利·ROI·回本周期）
description: 当需要基于采购成本、物流费用、平台佣金与投放成本测算单 SKU 毛利率、ROI 与回本周期时调用。
skill_version: "0.1.0"
l2_pillar: 财务
ref_domain:
  - H
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

输出单 SKU 或项目级单位经济结果，支撑定价与投放决策。

## 前置条件

- ERP 成本字段（采购、物流、平台费用）
- 目标销量与投放预算假设

## 步骤

1. 汇总成本项（固定+可变）
2. 计算毛利与毛利率
3. 计算 ROI 与回本周期
4. 输出敏感性结果（成本或转化率波动）

## 输出格式

表：`SKU | 毛利 | 毛利率 | ROI | 回本周期 | 关键假设`

## When NOT to use

- 需要完整财务报表级建模时（应使用独立财务模型工具）

## 相关 Skill

- 上游：`pricing-strategy-advisor`（`next`）
