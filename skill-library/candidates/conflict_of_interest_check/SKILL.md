---
name: conflict-of-interest-check
title: "独立复核利益冲突检查"
description: "检查复核者（Reviewer）与被复核事项、发起人（Proposer）或贡献者之间是否存在利益冲突。用于独立复核（STG-06 / IC-01）前置门禁校验。触发词：利益冲突、独立性检查、回避判断、复核资质、自审检查。何时不用：普通业务评审（非独立复核场景）、产品合规审查（转 IC-04）。"
version: 0.1.0
status: candidate
owner: AGT-005
source_kind: native
body_profile: native-v1
disable-model-invocation: true
user-invocable: true
input_contract: "proposer, reviewer, contributors[], reporting_lines[], financial_interests[], prior_involvement[]"
output_contract: "IndependenceDeclaration（含 conflicts[], severity, disposition: ALLOW|REQUIRE_MITIGATION|REFUSE, can_issue_assurance_review）"
---

# 独立复核利益冲突检查（Conflict of Interest Check）

## 1. 适用边界与停止线

- **适用岗位/阶段**：`AGT-005 守衡`（`IC-01 经营证据与利益冲突独立复核`）及 `FLOW-02 × SCN-002` 试点的 `STG-06 独立复核` 前置校验。
- **核心不变量**：
  1. `proposer == reviewer`（自审）→ 立即判定 `HIGH` 冲突，`disposition = REFUSE`，`can_issue_assurance_review = false`。
  2. `reviewer` 曾参与被审产物制作或指标口径定义（`prior_involvement` 命中）→ 判定 `HIGH` 冲突，不允许自己给自己出具缓解豁免。
  3. 汇报线指向被复核决策的直接受益人且无独立加签 → 判定 `HIGH` 冲突。
  4. 存在 `HIGH` 冲突且无经具名人类 owner 批准的独立替代复核人时，**禁止出具 `AssuranceReview`**。

## 2. 六项必检规则

1. **自审检查（Self-Review）**：`proposer == reviewer`。
2. **制作参与检查（Contributor Overlap）**：`reviewer in contributors` 或 `prior_involvement` 含产物起草、模型训练、数据清洗。
3. **汇报线独立性（Reporting Line）**：`reporting_lines` 中 `reviewer` 汇报给 `proposer`。
4. **财务与绩效绑定（Financial / KPI Tie）**：`financial_interests` 含与被审事项通过率挂钩的奖金或预算份额。
5. **自豁免拦截（Self-Mitigation Ban）**：任何 `mitigation_approver == reviewer` 或 `mitigation_approver == proposer` 的缓解声明一律无效。
6. **声明完整性（Missing Declaration）**：输入缺少 `proposer` 或 `reviewer` 标识时直接 `REFUSE`。
