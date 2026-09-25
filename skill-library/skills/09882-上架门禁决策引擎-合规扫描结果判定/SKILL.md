---
id: listing-gate-decision-engine
title: 上架门禁决策引擎（合规扫描结果判定）
description: 当需要把合规扫描结果转化为可执行上架决策（通过、补充资料、阻断）并输出可审计判定原因时调用。
skill_version: "0.1.0"
l2_pillar: 渠道
ref_domain:
  - F
  - B
risk_tier: P0_gate
execution_boundary: internal
data_from: erp
---

## 目标

把扫描结果统一转化为可执行门禁结论，减少人工口径差异。

## 前置条件

- 已完成 `listing-compliance-scanner` 输出
- 已有目标站点与类目规则版本

## 步骤

1. 读取扫描结果与规则版本
2. 归并风险等级（阻断/补充/通过）
3. 输出判定结论与可审计原因
4. 给出补充材料清单（若需）

## 输出格式

表：`SKU | 市场 | 判定结果 | 风险等级 | 证据项 | 补充清单`

## When NOT to use

- 尚未完成合规扫描时
- 需要法律最终裁定时（需外部法务）

## 相关 Skill

- 上游：`listing-compliance-scanner`（`next`）
- 下游：`listing-bulk-generator`（`blocks_until`）
