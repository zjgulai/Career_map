---
id: strategic-review-generator
title: 月度/季度战略复盘报告（八域摘要 + 决策建议）
description: 当需要把各职能域关键指标与异常汇总成一份给 CGO/管理层的复盘稿（非执行细项）时调用；建议与 cross-domain-trigger-hub 输出联用。
skill_version: "0.1.0"
l2_pillar: 战略
ref_domain:
  - H
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

输出 **一页执行摘要 + 分域段落 + 未决事项 + 下周期重点**，强调 **决策点** 与 **资源分配**，避免堆数据表。

## 前置条件

- 各域 **输入摘要**（可粘贴：合规状态、货盘等级分布、渠道 GMV、供应链断货风险、客服安全事件数等）。  
- 时间范围：**月度** 或 **季度** 明确。

## 步骤

1. **八域扫描**（A–H）：每域 3～5 行：结论、风险、机会。  
2. **交叉主题**：NA vs EU、KA vs 线上、ERP 数据质量。  
3. **决策清单**：需你拍板的 Top 5（含可选方案与影响）。  
4. **指标表**仅放附录，正文以 **结论先行**。  
5. 显式列出 **假设与数据缺口**。

## 输出格式

- `Executive Summary`  
- `Domain_sections A–H`  
- `Decisions`  
- `Appendix_metrics`（可选）

## When NOT to use

- 仅要单域 deep dive — 用该域专用 Skill。  
- 数据未关账 — 标注 **preliminary**。

## 相关 Skill

- 上游：`cross-domain-trigger-hub`、`anomaly-detector`、`north-america-europe-comparison`、各域周报素材  
- 财务约束：战略侧单位经济 Skill（待建）可 `requires` 接入
