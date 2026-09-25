---
name: "p2s-routed-graph-handoff"
title: "Skill-Routed-Graph-Handoff"
description: "触发词：p2s-routed-graph-handoff。Skill-Routed-Graph-Handoff"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 接口契约"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-Routed-Graph-Handoff"
p2s_src_domain: "10-MAS"
p2s_venue: "EMNLP 2026"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.25277"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Routed-Graph-Handoff"
rebase_vault_path: "paper2skills-vault/10-MAS/Skill-Routed-Graph-Handoff.md"
rebase_source_sha256: "01bf1c27353ba718b046b68837197aacfcced71836924be2523cf97971ed9956"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "01bf1c27353ba718b046b68837197aacfcced71836924be2523cf97971ed9956"
rebase_full_card_bytes: "52310"
rebase_full_card_lines: "780"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "29"
rebase_evidence_quotes_total: "51"
rebase_evidence_quotes_complete: "false"
---
# Skill-Routed-Graph-Handoff

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Routed-Graph-Handoff`（完整卡：`references/full-card.md`，sha256 `01bf1c27353ba718b046b68837197aacfcced71836924be2523cf97971ed9956`，52310 字节 / 780 行 / 51 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 29 条（共 51 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 路由式图交接（Routed Graph Handoff, RGH）

**一句话定位**：现有框架只管「谁跟谁说话」（拓扑），不管「怎么说话」（格式）。本卡管格式：
把多 Agent 之间的交接从散文换成**类型化依赖图**，并用一次**轻量 router 调用**决定哪些委派值得图化。

**与同域 `Skill-Subagent-Decomposition.md` 的分工**：那张卡回答「要不要拆、怎么切」；
本卡回答「拆开之后，两个 agent 之间那句话该怎么写」。两张卡是流水线上的前后两道，
**先有拆分才有交接格式**，所以本卡默认你已经在拆 sub-agent。

---

## ① 算法原理

**核心思想**：多 Agent 的瓶颈常不是模型能力，而是**交接格式**——散文把执行顺序与前置条件留在
隐含处。Routed Graph Handoff 把每次委派编码成类型化依赖图（显式 depends_on / precondition）以消掉
错序，但不无条件使用：委派前用一次轻量 LLM 分类调用（约 155 token）判断任务的**计算模式**——

（**换底正文在此截断** —— 完整卡正文共 780 行，本页内联到第 17 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 29 / 全 51 条 —— **其余 22 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 51 条逐字引文。本页按完整卡顺序内联**前 29 条整条引文**（不在引文中间断开）；其余 22 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Multi-agent LLM systems coordinate through natural-language messages that consume 40–60% of their token budget."
> 出处：2608.25277 §Abstract｜Q1

> 原文："We propose Routed Graph Handoff, where a lightweight LLM router (155 tokens, 0.15% overhead) selects between a typed dependency graph and natural language for each delegation."
> 出处：2608.25277 §Abstract｜Q2

> 原文："On four benchmarks (1,050+ trajectories), the routed system matches or exceeds NL-only on every task: +12.7 pp on $\tau$-retail at 3.2$\times$ compression ($p{<}0.01$), +8.7 pp on BrowseComp at 2.2$\times$ compression ($p{<}0.05$), and parity on BFCL and AppWorld."
> 出处：2608.25277 §Abstract｜Q3

> 原文："Without the router, graph-only delegation regresses 14.6 pp on AppWorld; the router eliminates this at near-zero cost."
> 出处：2608.25277 §Abstract｜Q4

> 原文："A graph-aware executor prompt is required: the same schema without interpretation guidance yields no gain."
> 出处：2608.25277 §Abstract｜Q5

> 原文："An oracle analysis reveals 8.6 pp of additional headroom, motivating execution-time adaptive routing as future work."
> 出处：2608.25277 §Abstract｜Q6

> 原文："Error analysis on 345 multi-agent trajectories reveals that 76% of failures stem from inter-agent misalignment: the executor misinterprets ordering constraints, drops prerequisites, or loops on ambiguous instructions."
> 出处：2608.25277 §1 Introduction｜Q7

> 原文："We resolve this tradeoff with Routed Graph Handoff (Figure 1): a lightweight LLM router (${\sim}$155 tokens, 0.15% overhead) selects graph or NL per delegation based on task computational pattern."
> 出处：2608.25277 §1 Introduction｜Q9

**B. schema、router 与 graph-aware executor**

> 原文："Each delegation is encoded as a typed DAG with 8 node types (goal, constraint, entity, action, precondition, postcondition, tool_call, tool_arg) and 7 edge relations (requires, targets, blocks, enables, depends_on, contradicts, follows)."
> 出处：2608.25277 §2.1 Native Graph Handoff Schema｜Q10

> 原文："We design such a schema (8 node types, 7 edge relations) emitted via constrained decoding at ${\sim}$350 tokens per delegation (2$\times$ compression vs. NL)."
> 出处：2608.25277 §1 Introduction（schema 规模与压缩口径）｜Q8

> 原文："The schema was designed iteratively on 47 $\tau$-bench trajectories."
> 出处：2608.25277 §2.1 Native Graph Handoff Schema｜Q11

> 原文："This receiver-side instruction is essential: passing the same JSON to a standard executor prompt yields no gain, and on $\tau$-retail restoring it lifts NGH from below NL to +12.7 pp (Appendix E)."
> 出处：2608.25277 §2.1 Graph-aware execution is part of the interface｜Q12

> 原文："We therefore treat the typed graph and its interpretation guidance as a single mechanism, not the graph alone."
> 出处：2608.25277 §2.1 Graph-aware execution is part of the interface｜Q13

> 原文："Without this prompt (i.e., passing the JSON graph to a standard executor prompt), the sub-agent treats the graph as opaque data and fails to interpret the dependency structure."
> 出处：2608.25277 §Appendix E Graph-Aware Executor Prompt｜Q45

> 原文："Before each delegation, a single classification call (${\sim}$155 tokens total, $0.0005) decides whether to use graph or NL."
> 出处：2608.25277 §2.2 LLM Router｜Q14

> 原文："Pick GRAPH if the task requires deterministic answers that depend on ordered sub-tasks (aggregations, multi-step lookups, sequential API calls). Pick NL if the task requires iteration, conditionals, free-text interpretation, or adaptive reasoning."
> 出处：2608.25277 §2.2 LLM Router（router prompt 原文）｜Q15

> 原文："Conservative default: NL unless dependency-chain pattern is detected. This ensures zero NL wins are sacrificed."
> 出处：2608.25277 §2.2 LLM Router（保守默认）｜Q16

> 原文："Deterministic: temperature = 0, verified identical across 3 independent runs."
> 出处：2608.25277 §2.2 LLM Router（确定性）｜Q17

> 原文："The per-benchmark rates we report are therefore a post-hoc aggregate of these blind per-task decisions: 100% graph on BrowseComp/$\tau$-retail/BFCL; 11% graph / 89% NL on AppWorld; 2% graph on $\tau$-airline."
> 出处：2608.25277 §2.2 LLM Router（逐 benchmark 的 post-hoc 聚合）｜Q18

> 原文："That the same classifier splits AppWorld itself 11%/89% (which a fixed per-benchmark rule cannot do) confirms the decision is made per task, not per domain; the clustering by benchmark arises because within each of these benchmarks nearly every task shares the same better format."
> 出处：2608.25277 §2.2 LLM Router（per-task 而非 per-domain 的证据）｜Q19

**C. 主结果、规模与错因**

> 原文："We evaluate on four diverse multi-agent tasks: BrowseComp (Wei et al., 2025) (150 trials, long-horizon web search requiring multi-step evidence gathering), BFCL v3 (Patil et al., 2025) (600 trials, Berkeley Function Calling Leaderboard with complex API sequences), $\tau$-bench retail (Yao et al., 2025) (150 paired trials: 50 tasks $\times$ 3 seeds, multi-step customer service with tool calls), and AppWorld (Trivedi et al., 2024) (152 paired trials, multi-app tool use with conditional logic). Total: 1,052 trajectories."
> 出处：2608.25277 §3 Experiments（四个 benchmark / 1,052 trajectories）｜Q20

> 原文："Splits. Pinned 50 $\tau$-retail tasks $\times$ 3 seeds; BrowseComp 150; BFCL v3 600; AppWorld 152; $\tau$-airline 150. Total 1,052 trajectories (plus 150 $\tau$-airline for the router ablation)."
> 出处：2608.25277 §Appendix J Artifacts and Reproducibility（Splits）｜Q48

> 原文："*Table 1: Main results (task success / accuracy %). Routed matches or exceeds NL on all four benchmarks. $\tau$-retail: +12.7 pp (150 paired trials, $p{<}0.01$). BrowseComp: +8.7 pp, CI [+2.7, +14.7], $p{<}0.05$. AppWorld NGH-only regresses $-$14.6 pp; the router recovers parity.*"
> 出处：2608.25277 §3.1 Main Results（Table 1 表注）｜Q22

> 原文："The router’s primary function is regression prevention (Table 1). NGH delivers significant gains"
> 出处：2608.25277 §3.1 Main Results（router 的首要功能）｜Q23

> 原文："NGH delivers significant gains on dependency-chain tasks: +12.7 pp on $\tau$-retail (150 paired trials; $p{<}0.01$) and +8.7 pp on BrowseComp (CI [+2.7, +14.7]; $p{<}0.05$). Both are statistically significant after Holm-Bonferroni correction. However, NGH regresses sharply on AppWorld: $-$14.6 pp (CI [$-$22.8, $-$6.4])."
> 出处：2608.25277 §3.1 Main Results（显著性与 AppWorld 回退 CI）｜Q24

> 原文："By defaulting to NL on 89% of AppWorld tasks (those involving iteration, conditionals, or free-text interpretation), it recovers full parity (51.7% vs. 51.7%)."
> 出处：2608.25277 §3.1 Main Results（router 恢复 parity）｜Q25

> 原文："Some benchmarks are not natively multi-agent (BFCL, for instance, is function calling), but casting it this way tests whether the graph preserves complex API-sequence structure without harm; the parity we observe (75.4 vs. 75.3) is the expected outcome for a task with no cross-step dependency structure to make explicit."
> 出处：2608.25277 §3 Handoff harness（BFCL 打平）｜Q21

> 原文："The 76% inter-agent misalignment figure derives from an automated error taxonomy (MAST, Multi-Agent Systematic Taxonomy) applied to 345 $\tau$-bench trajectories across three protocols (single-agent, NL multi-agent, graph multi-agent; 115 tasks $\times$ 3 seeds each)."
> 出处：2608.25277 §Appendix C Misalignment Annotation Methodology（345 条轨迹口径）｜Q49

> 原文："Of all multi-agent failures, 76% are inter-agent misalignment: the executor misinterprets ordering, drops prerequisites, or enters retry loops from ambiguous instructions; this share is robust to the taxonomy’s thresholds (Appendix I)."
> 出处：2608.25277 §4 Analysis（76% 错位份额及阈值鲁棒性）｜Q34

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Routed-Graph-Handoff`（完整卡：`references/full-card.md`）。

- 论文：2608.25277
- 标题：Routed Graph Handoff: Adaptive Format Selection for Multi-Agent LLM Delegation
- 发表处：EMNLP 2026
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Subagent-Decomposition.md, Skill-MAS-Orchestrator.md, Skill-MetaGPT-SOP-Driven-Collaboration.md, Skill-AutoGen-Multi-Agent-Conversation.md

- 逐字引文：51 条，全部内联于上方「原文引用」段；一条不截断。
