---
name: "p2s-stateful-skill-runtime"
title: "Skill-Stateful-Skill-Runtime"
description: "触发词：p2s-stateful-skill-runtime。Skill-Stateful-Skill-Runtime"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理 / 失败恢复"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
quality_tier: "curated"
p2s_card_id: "Skill-Stateful-Skill-Runtime"
p2s_src_domain: "16-智能体工程"
p2s_venue: "EMNLP"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.26263"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Stateful-Skill-Runtime"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Stateful-Skill-Runtime.md"
rebase_source_sha256: "b21916e2a0d5c41d9dcbae38ed779c6965d79850e77c0d846a84bc853779723c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b21916e2a0d5c41d9dcbae38ed779c6965d79850e77c0d846a84bc853779723c"
rebase_full_card_bytes: "53135"
rebase_full_card_lines: "818"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "27"
rebase_evidence_quotes_total: "50"
rebase_evidence_quotes_complete: "false"
---
# Skill-Stateful-Skill-Runtime

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Stateful-Skill-Runtime`（完整卡：`references/full-card.md`，sha256 `b21916e2a0d5c41d9dcbae38ed779c6965d79850e77c0d846a84bc853779723c`，53135 字节 / 818 行 / 50 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 27 条（共 50 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 状态化的 Skill 运行时（SKILL.state — 显式执行状态替代对话历史）

**与同域两张「压缩卡」的分工（三张卡不重复）**：`Skill-Context-Compression.md` 与
`Skill-Active-Context-Pruning.md` 回答「上下文**已经**变长了怎么压」；本卡回答「它为什么一开始
就不该变长」——不是压缩历史，而是**取消历史**：把执行状态显式结构化，prompt 只由
(不可变规格, 当前状态, 最新观测) 三件东西组成。论文的预算对照实验正是冲着这个区别做的：
把压缩基线钉在**同样的** token 预算上，看它们是否还打得过结构化状态。

---

## ① 算法原理

**核心思想**：把「执行」从**对话流水账**改成**状态机**。对话式 runtime 每一步都把历史推理、
历史动作、历史观测重新喂给模型，让模型自己从文本里"还原"当前世界；SKILL.state 把「当前世界」

（**换底正文在此截断** —— 完整卡正文共 818 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 27 / 全 50 条 —— **其余 23 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 50 条逐字引文。本页按完整卡顺序内联**前 27 条整条引文**（不在引文中间断开）；其余 23 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Existing agent runtimes maintain execution by continually appending observations, actions, and intermediate reasoning traces to an ever-growing conversation history, causing latency degradation and context-poisoning failures over long horizons."
> 出处：2608.26263 §Abstract 摘要｜Q01

> 原文："Across diverse datasets, models, and execution environments, SKILL.state improves task accuracy while substantially reducing cumulative token consumption."
> 出处：2608.26263 §Abstract 摘要｜Q02

> 原文："Modern agent runtimes almost universally adopt a conversational execution model. At every execution step, the language model receives the original skill specification together with an ever-growing transcript of previous reasoning, actions, observations, and tool outputs (Yao et al., 2022; Mialon et al., 2023)."
> 出处：2608.26263 §1 Introduction｜Q03

> 原文："Prompt size grows with execution length, increasing token consumption and inference cost (Liu et al., 2024; Xiao et al., 2024a). Historical observations and obsolete reasoning remain embedded in the context long after they cease to be relevant, requiring the model to continually distinguish current facts from historical artifacts. Consequently, execution correctness increasingly depends on reconstructing state from accumulated textual history."
> 出处：2608.26263 §1 Introduction｜Q04

### B. 架构定义：每步只喂 (P, Σ_t, O_t)

> 原文："At execution step $t$, the language model receives only three inputs:"
> 出处：2608.26263 §1 Introduction｜Q05

> 原文："where $P$ is the immutable procedural specification, $\Sigma_{t}$ is the structured execution state at step $t$, and $O_{t}$ is the latest observation received from the environment. The language model never receives previous observations, previous actions, or previous reasoning traces."
> 出处：2608.26263 §3 SKILL.state｜Q06

> 原文："At each step, the runtime constructs a prompt from $(P,\Sigma_{t},O_{t})$, invokes the language model, deterministically validates the proposed state transition, updates the execution state, executes the selected action, and repeats the process using the updated state."
> 出处：2608.26263 §3 SKILL.state（Figure 1 执行循环）｜Q07

> 原文："Schemas are authored once per domain rather than per task; for example, across all 100 diverse challenge instances in the InterCode CTF benchmark, the agent reuses a single static 5-field schema (discovered_flags, tested_hypotheses, active_files, working_dir, cmd_summary)."
> 出处：2608.26263 §3.1 Execution State and Schema Authoring｜Q08

> 原文："After producing a validated state update, the intermediate reasoning trace is discarded while only the updated execution state is retained. Consequently, execution depends strictly on the current world state instead of replaying historical trajectories."
> 出处：2608.26263 §1 Introduction｜Q09

### C. 中间推理的丢弃机制与状态更新的校验

> 原文："Crucially, within-step multi-step reasoning is fully intact during generation to support complex deductive planning. However, once the state transition has been validated and applied, the reasoning trace $R_{t}$ is discarded permanently and never appears in subsequent prompts."
> 出处：2608.26263 §3.2 Reasoning and State Transitions｜Q10

> 原文："where $\oplus$ denotes the runtime’s dictionary merge operator with null-deletion semantics. This model projects transient reasoning into persistent structured state, allowing only information required for future execution to survive across interactions."
> 出处：2608.26263 §3.2 Reasoning and State Transitions（式 (4) 后）｜Q11

> 原文："Because schema ownership and validation reside in the deterministic runtime rather than the model, malformed outputs cannot corrupt persistent state $\Sigma_{t}$; an invalid patch triggers a rollback-retry cycle."
> 出处：2608.26263 §7 Limitations｜Q12

### D. O(1) prompt / O(T) 累计 token 的复杂度主张

> 原文："We propose SKILL.state, a runtime architecture that executes procedural skills through explicit structured execution state where intermediate reasoning is discarded after each step, proving a strictly bounded $\mathcal{O}(1)$ prompt footprint and $\mathcal{O}(T)$ cumulative token complexity."
> 出处：2608.26263 §1 Introduction（贡献 1）｜Q13

> 原文："Let $T$ denote the execution horizon. For conversational runtimes, prompt length grows with the accumulated interaction history, $|C_{t}|=\mathcal{O}(t)$, leading to cumulative token complexity:"
> 出处：2608.26263 §3.3 Complexity Analysis（式 (5) 前）｜Q14

> 原文："In contrast, SKILL.state maintains only the procedural specification, structured execution state, and latest observation:"
> 出处：2608.26263 §3.3 Complexity Analysis（式 (6) 前）｜Q15

> 原文："which is asymptotically bounded and independent of the number of previously executed turns $t$. Consequently, cumulative prompt complexity grows strictly linearly with the execution horizon:"
> 出处：2608.26263 §3.3 Complexity Analysis（式 (7) 前）｜Q16

> 原文："By discarding intermediate reasoning traces after each validated transition, SKILL.state maintains a bounded $\mathcal{O}(1)$ prompt footprint and scales linearly $\mathcal{O}(T)$ in cumulative tokens."
> 出处：2608.26263 §6 Conclusion｜Q17

### E. 对照组与「同预算」的压缩基线

> 原文："Memory (Summarization-style): Maintains a rolling 3-step conversational window alongside a periodically updated natural language summary of past interactions (Packer et al., 2023)."
> 出处：2608.26263 §5.1 Experimental Setup（Primary Runtime Paradigms）｜Q18

> 原文："Truncated (Sliding Window): Retains only the most recent interaction turns that fit within a fixed token budget."
> 出处：2608.26263 §5.1 Experimental Setup（Budget-Matched and Compression Controls）｜Q19

> 原文："Summary-capped: Strictly enforces a hard token ceiling on the natural language summary."
> 出处：2608.26263 §5.1 Experimental Setup（同组）｜Q20

> 原文："ReAct + LLMLingua (Jiang et al., 2023): Uses budget-aware small-model perplexity compression to prune tokens from the full history down to the target budget."
> 出处：2608.26263 §5.1 Experimental Setup（同组）｜Q21

> 原文："To determine whether SKILL.state’s performance gains stem merely from shorter prompts or from structured state representation, we evaluate budget-matched baselines on Warehouse ($T=100$, Gemini-3-Flash) pinned to the token budget of SKILL.state ($\sim$1,800 tokens)."
> 出处：2608.26263 §5.6 Experiment 5: Budget-Matched Controls and Statistical Compression｜Q22

### F. 结果数字（压缩比、准确率、公开基准）

> 原文："Results: As shown in Table 1, SKILL.state matches or exceeds baseline accuracy across all horizons while maintaining a flat prompt size ($\sim$1,736–1,905 tokens)."
> 出处：2608.26263 §5.2 Experiment 1: Long-Horizon Execution Scaling｜Q23

> 原文："In contrast, history-appending baselines suffer quadratic token accumulation $\mathcal{O}(T^{2})$."
> 出处：2608.26263 §5.2 Experiment 1（同段）｜Q24

> 原文："At $T=100$, the Stateful baseline consumes 1,062,387 tokens, whereas SKILL.state consumes only 65,408 tokens (a $16.2\times$ token reduction)."
> 出处：2608.26263 §5.2 Experiment 1（同段）｜Q25

> 原文："At $T=200$, SKILL.state maintains 0.94 accuracy consuming 122k tokens, while the Memory baseline inflates to 6.1M tokens."
> 出处：2608.26263 §5.2 Experiment 1（同段）｜Q26

> 原文："As shown in Table 2, the standard Prompt runtime degrades sharply from 0.68 at low noise down to 0.53 at high noise. In contrast, SKILL.state maintains robust task completion ($\geq 0.97$) across all noise levels because distractors are filtered out during state patch generation and never enter subsequent prompts."
> 出处：2608.26263 §5.3 Experiment 2: Context Corruption (Noise Robustness)｜Q27

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Stateful-Skill-Runtime`（完整卡：`references/full-card.md`）。

- 论文：2608.26263
- 标题：SKILL.state: Scalable Long-Horizon Agent Skills
- 发表处：EMNLP
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Context-Compression.md, Skill-Active-Context-Pruning.md, Skill-Skill-Lifecycle-Design.md, Skill-ReAct-Reasoning-Acting.md, Skill-Agent-Memory-Learning.md

- 逐字引文：50 条，全部内联于上方「原文引用」段；一条不截断。
