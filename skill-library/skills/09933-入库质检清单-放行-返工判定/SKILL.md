---
id: inbound-quality-checklist
title: 入库质检清单（放行/返工判定）
description: 在入库批次到仓时，按质检标准输出放行、返工或拦截判定。
skill_version: "0.1.0"
l2_pillar: 供应链
ref_domain:
  - E
  - F
risk_tier: P1_standard
execution_boundary: internal
data_from: erp
---

## 目标

降低批次质量问题扩散风险，形成可追踪处置闭环。

## 前置条件

- 质检标准与抽检规则
- 批次信息与供应商历史缺陷率

## 步骤

1. 读取批次到仓信息
2. 执行抽检与缺陷分类
3. 做出放行/返工/拦截判定
4. 回写供应商绩效线索

## 输出格式

表：`批次 | SKU | 抽检结果 | 缺陷等级 | 判定 | 处置动作 | 责任人`

## When NOT to use

- 未建立基础质检标准时

## 相关 Skill

- 上游：`purchase-order-generator`（`next`）
- 下游：`supplier-performance-tracker`（`triggers`）
