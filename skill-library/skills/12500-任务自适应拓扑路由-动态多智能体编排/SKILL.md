---
name: "p2s-ta[REDACTED]"
title: "任务自适应拓扑路由 — AdaptOrch 动态多智能体编排"
description: "触发词：拓扑路由、任务分级、并发仲裁、成本优化、客服工单。何时不用：固定 DAG 即可满足时用「MAS Orchestrator」；要基于历史轨迹训练编排策略用「编排轨迹强化学习」。安全边界：高耦合工单必须走主控 Agent 仲裁，不得为省成本把复杂仲裁降级为简单并发。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-Ta[REDACTED]"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2602.16873"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Ta[REDACTED]"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Ta[REDACTED].md"
rebase_source_sha256: "d7018a43785d18e9b58cd13013207258e01ea3d69777978bd02dab71c84b7efc"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d7018a43785d18e9b58cd13013207258e01ea3d69777978bd02dab71c84b7efc"
rebase_full_card_bytes: "19047"
rebase_full_card_lines: "423"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "2fdac767a33d2c2f8627c072750ff2c97a52e768cf8871b55fcbdd96186beff6"
user_summary: "按任务形态（简单查询、流程型、复杂仲裁、批量）自动选拓扑，简单的快跑、复杂的慢想。"
user_try: "试试：把客服工单按类型分派到不同拓扑，简单查询并发跑、复杂仲裁走主控 Agent 仲裁。"
whenToUse: "当同一系统要处理形态差异很大的任务（从单子任务到 50 个并行子任务）、固定拓扑效率低时用本技能；固定 DAG 够用就用「MAS Orchestrator」；要基于轨迹训练策略用「编排轨迹强化学习」。"
workflow: "抽取任务画像（子任务数量、依赖形态、耦合度） → 按规则把任务分到对应拓扑（简单查询并发、流程型链式、复杂仲裁由主控 Agent 仲裁） → 估算选定拓扑的延迟与成本 → 输出拓扑决策与阈值配置"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "8"
rebase_evidence_quotes_total: "24"
rebase_evidence_quotes_complete: "false"
---
# 任务自适应拓扑路由 — AdaptOrch 动态多智能体编排

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`，sha256 `d7018a43785d18e9b58cd13013207258e01ea3d69777978bd02dab71c84b7efc`，19047 字节 / 423 行 / 24 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 8 条（共 24 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `2fdac767a33d2c2f8627c072750ff2c97a52e768cf8871b55fcbdd96186beff6`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 任务自适应拓扑 — AdaptOrch 动态编排与收敛定律

---

## ① 算法原理

### 核心思想

**AdaptOrch** 针对 LLM 能力收敛趋势(2026 年前沿模型 MMLU/HumanEval 差距 <5%)提出一个关键洞察:当个体模型能力趋同时,**编排拓扑(拓扑选择)** 的方差贡献远超 **模型选择** 的贡献,成为系统性能的主变量。

核心洞察:**task dependency DAG 的结构属性(parallelism width / critical path depth / coupling density)可预测最优编排拓扑**,从静态(chain/graph/role)升级到动态路由。

### 性能收敛定律(Proposition 1)

给定 ε-收敛模型集 M(所有模型在基准上差距 ≤ε),设 Var_M 为模型选择方差,Var_τ 为拓扑选择方差:


（**换底正文在此截断** —— 完整卡正文共 423 行，本页内联到第 17 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 8 / 全 24 条 —— **其余 16 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 24 条逐字引文。本页按完整卡顺序内联**前 8 条整条引文**（不在引文中间断开）；其余 16 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"GPT-4o, Claude 3.5 Sonnet, Gemini 2.0, Llama 3.3 70B, DeepSeek-V3, and Qwen 2.5 72B now cluster within 2–5% of each other on standard benchmarks including MMLU, HumanEval, and MATH"
> 出处：2602.16873 §1 Introduction
>
> 原文:"The central insight is straightforward: tasks decompose into dependency-annotated directed acyclic graphs (DAGs), and structural properties of these DAGs—parallelism width, critical path depth, inter-subtask coupling—turn out to predict the optimal orchestration topology with high accuracy."
> 出处：2602.16873 §1 Introduction
>
> 原文:"demonstrating that topology-aware orchestration achieves 12–23% improvement over static single-topology baselines"
> 出处：2602.16873 Abstract
>
> 原文:"When $\epsilon\to 0$ (perfect convergence) and $\omega(G_{T})>1$ (parallelizable tasks), $\text{Var}_{\tau}/\text{Var}_{M}\to\infty$."
> 出处：2602.16873 §3.4 Performance Convergence Scaling Law, Corollary 1
>
> 原文:"Coupling strength $c(u,v)$ is estimated based on declared context requirements: $c(u,v)=\begin{cases}0.0&\text{if coupling = none (outputs fully independent)}\\ 0.3&\text{if coupling = weak (shared context helpful but not required)}\\ 0.7&\text{if coupling = strong (output of $u$ is direct input to $v$)}\\ 1.0&\text{if coupling = critical (semantic coherence required)}"
> 出处：2602.16873 §4.2 Phase 2: DAG Construction, Eq. 11
>
> 原文:"Default thresholds: $\theta_{\omega}=0.5$ (at least half the subtasks parallelizable), $\theta_{\gamma}=0.6$ (high coupling threshold), $\theta_{\delta}=5$ (minimum subtasks for hierarchical)."
> 出处：2602.16873 §4.3 Phase 3: Topology Routing, Algorithm 1
>
> 原文:"the exact $\omega$ via König’s theorem on the transitive closure requires $O(|V|^{2.5})$ matching and is used only for offline calibration."
> 出处：2602.16873 §4.3 Phase 3: Topology Routing, Algorithm 1
>
> 原文:"Under the adaptive re-routing mechanism (Algorithm 2, line 8), the synthesis protocol terminates within at most $\lceil(1-\gamma_{0})/0.2\rceil\leq 5$ iterations."
> 出处：2602.16873 §4.5 Phase 5: Adaptive Synthesis Protocol, Proposition 2
>

## 输入 / 输出契约

**输入**：历史任务分解样本与耦合标注、任务画像特征（子任务数、依赖形态、耦合度），以及各拓扑的延迟与成本画像。

**输出**：任务画像与选定拓扑及其延迟、成本估计；供编排层按工单类型执行。

## 执行步骤

1. 抽取任务画像（子任务数量、依赖形态、耦合度）
2. 按规则把任务分到对应拓扑（并发、链式、主控 Agent 仲裁）
3. 估算选定拓扑的延迟与成本
4. 输出拓扑决策与阈值配置

## 边界与不做

- 数据不满足：任务无法分解、耦合度无法标注时拓扑选择退化，先补任务分解标注。
- 何时不用：固定 DAG 可满足时用「MAS Orchestrator」；要训练编排策略用「编排轨迹强化学习」；单一任务类型反复出现时固定拓扑更省。
- 能力边界：输出拓扑选择规则与阈值，不做执行器，也不保证阈值跨领域通用（需按年校准）。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Ta[REDACTED]

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-Ta[REDACTED]`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（41 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`）。

- 论文：2602.16873
- 标题：AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`）。
>
> - 论文：2602.16873
> - 标题：AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2602.16873
> > - 标题：AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2602.16873
> > > - 标题：AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Ta[REDACTED]`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2602.16873
> > > > - 标题：AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2602.16873 — AdaptOrch: Task-Adaptive Multi-Agent Orchestration in the Era of LLM Performance Convergence
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
