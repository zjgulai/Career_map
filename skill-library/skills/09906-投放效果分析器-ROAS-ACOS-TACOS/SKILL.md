---
id: campaign-performance-analyzer
title: 投放效果分析器（ROAS/ACOS/TACOS）
description: 当广告花费波动、转化下滑或复盘周期到达时，输出渠道与素材分层效率以及预算调整建议。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
  - B
  - H
risk_tier: P0_gate
execution_boundary: internal
data_from: erp
---

## 目标

形成可执行的投放优化动作，提升花费效率与稳定性。

## 前置条件

- 渠道投放花费与转化数据
- 素材/人群维度表现明细
- 近周期基线指标

## 步骤

1. 计算 ROAS/ACOS/TACOS 与趋势
2. 分析渠道、素材、人群分层效率
3. 识别异常花费与低效项
4. 输出停投、加预算、重测建议

## 输出格式

表：`渠道 | 素材 | 花费 | 产出 | 核心指标 | 结论 | 动作建议`

## When NOT to use

- 数据归因窗口未闭合时

## 相关 Skill

- 上游：`ad-copy-matrix`（`next`）
- 下游：`pricing-strategy-advisor`（`triggers`）
