---
name: "p2s-multi-agent-collaboration-tax"
title: "Skill-Multi-Agent-Collaboration-Tax"
description: "触发词：p2s-multi-agent-collaboration-tax。Skill-Multi-Agent-Collaboration-Tax"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-005"
l3_business: "能力匹配"
l3_all: "能力匹配 / 依赖协调"
l1_l2_l3: "经营管理/经营与组织/能力匹配"
quality_tier: "curated"
p2s_card_id: "Skill-Multi-Agent-Collaboration-Tax"
p2s_src_domain: "10-MAS"
p2s_venue: "EMNLP 2026"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.22152"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Multi-Agent-Collaboration-Tax"
rebase_vault_path: "paper2skills-vault/10-MAS/Skill-Multi-Agent-Collaboration-Tax.md"
rebase_source_sha256: "cb8ad460772787d55513c8c03a8f54be49626daf96dab1761b8011c1ee9cf825"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "cb8ad460772787d55513c8c03a8f54be49626daf96dab1761b8011c1ee9cf825"
rebase_full_card_bytes: "67355"
rebase_full_card_lines: "932"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "25"
rebase_evidence_quotes_total: "55"
rebase_evidence_quotes_complete: "false"
---
# Skill-Multi-Agent-Collaboration-Tax

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Multi-Agent-Collaboration-Tax`（完整卡：`references/full-card.md`，sha256 `cb8ad460772787d55513c8c03a8f54be49626daf96dab1761b8011c1ee9cf825`，67355 字节 / 932 行 / 55 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 25 条（共 55 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 多 Agent 协作税（Collaboration Tax）—— 「这个流程到底该不该拆成多 Agent」

**本卡与同域其它卡的分工**：`10-MAS/` 里已有的卡片（`Skill-Subagent-Decomposition.md`、
`Skill-MAS-Orchestrator.md`、`Skill-MetaGPT-SOP-Driven-Collaboration.md`、`Skill-Multi-Agent-Debate.md` …）
回答的都是「**怎么搭**多 Agent」；本卡回答的是「**该不该搭**、搭了亏多少、亏在对话的哪一阶段、
不换模型不重训能不能修好」。交付物是**一个可测的量 + 一个四阶段诊断器 + 一份 prompt 级干预**，
不是又一套编排框架。

**先看结论**：把「单 Agent 拿全量信息」与「两个 Agent 各拿一半私有视图、对话到底」放在同一批任务上、

（**换底正文在此截断** —— 完整卡正文共 932 行，本页内联到第 10 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 25 / 全 55 条 —— **其余 30 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 55 条逐字引文。本页按完整卡顺序内联**前 25 条整条引文**（不在引文中间断开）；其余 30 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："We formulate the collaboration tax as the team-decentralisation loss of a two-player cooperative game with private information, with two propositions characterising its sign and its equivalence to a max-superadditivity violation."
> 出处：2608.22152 Abstract｜Q1

> 原文："Operational form. For a task T with instances x scored by a deterministic grader U ∈ [0, 1], and a union-necessary partition x = v1 (x) ∪ v2 (x) such that neither view alone determines the answer, the homogeneous tax of model M is c tax(M, T ) = ssolo-full (M, T ) − shomo (M, T ), (1) where ssolo-full is the mean score of M given the merged instance and shomo is the mean score of two copies of M given v1 and v2 exchanging messages until termination, each averaged over 50 rollouts with independent seeds."
> 出处：2608.22152 3 The Collaboration Tax（Operational form 段）｜Q2

> 原文："This is precisely the failure of max-superadditivity for the cooperative game (N, v). A coalition that satisfies max-superadditivity produces at least as much joint utility as its strongest member acting alone."
> 出处：2608.22152 Appendix A.4 Max-superadditivity equivalence｜Q3

> 原文："If the partition is degenerate, say v1 = x, then the paired protocol Π can ignore v2 and emulate the solo policy exactly, producing Vpair = Vsolo and forcing tax = 0 by construction regardless of coordination ability."
> 出处：2608.22152 Appendix A.6 Design principles as theoretical requirements｜Q4

> 原文："If the views are trivially mergeable, for instance one agent serialising its view to the other in a canonical form that both agents share, then Π can directly emulate the centralised baseline and the upper bound binds with equality at zero coordination effort. Multiple equivalent surface representations break this trivial pass-through: agents grounded in different schemes (origin, axis order, naming convention) cannot simply concatenate their views without first aligning representations, so the upper bound is approached only by competent coordination, and the tax becomes a measure of that competence."
> 出处：2608.22152 Appendix A.6 Design principles as theoretical requirements｜Q5

> 原文："Solo-trivial: with the full instance a single agent should solve the task at a high rate, so that ssolo-full is near ceiling and the gap reflects coordination cost rather than problem-solving capacity."
> 出处：2608.22152 4.1 Design Principles for the Task Suite｜Q8

> 原文："Union-necessary: each instance is partitioned into views v1 , v2 with v1 ∪ v2 = x and neither view alone admits the canonical answer."
> 出处：2608.22152 4.1 Design Principles for the Task Suite｜Q9

> 原文："Multiply expressible: the same content admits several equivalent surface representations (coordinate origins, axis orderings, naming conventions, ordinal directions, relational vocabularies), providing the grounding friction we aim to measure"
> 出处：2608.22152 4.1 Design Principles for the Task Suite｜Q10

> 原文："a single misaligned step invalidates the rest of a path (Wang et al., 2026), relational query errors stay local to their query, and constraint violations cascade through the assignment."
> 出处：2608.22152 4.2 Task Families｜Q11

> 原文："These deployments treat collaboration as a free primitive: assemble enough capable models, give them clear roles, and the team will outperform any single member. The premise is rarely tested directly."
> 出处：2608.22152 1 Introduction｜Q12

### B. 任务与模型设定 / 测量协议

> 原文："We operationalise this definition on 32 solo-tractable tasks grouped by source of grounding friction and measure it on 11 models from 7 providers."
> 出处：2608.22152 Abstract｜Q6

> 原文："We evaluate eleven models from seven providers: OpenAI (gpt-5, gpt-5-nano, gpt-4.1-mini, gpt-4.1-nano, gpt-4o-mini), Anthropic (claude-sonnet-4-5), Google (gemini-2.5-flash-lite), DeepSeek (DeepSeek-V4-Pro), and three open-weight models hosted through API endpoints: Llama-4-Maverick (Meta, mixture-of-experts), Phi-4 (Microsoft), and Qwen3-8B (Alibaba)."
> 出处：2608.22152 5.1 Experimental Setup｜Q7

> 原文："We run 50 independent rollouts per (task, mode, model or pair) cell, with consecutive integer seeds controlling both instance generation and the partition into views."
> 出处：2608.22152 Appendix I Hyperparameters（Generation 段）｜A4

> 原文："The collaborative dialogue is capped at 50 exchanges per rollout, where one exchange is a turn from each agent. Each rollout starts from an empty context, so no state leaks across rollouts."
> 出处：2608.22152 Appendix I Hyperparameters（Generation 段）｜A5

> 原文："The grader is a fixed model (gpt-4o-mini in our experiments), held constant across every cell of the design. In particular, the grader does not change when the agents do, so heterogeneous-pair comparisons are not confounded by grader-side capability differences."
> 出处：2608.22152 Appendix I Hyperparameters（Grading 段）｜A6

### C. 两条「无例外」的轴

> 原文："two patterns hold without exception across the eleven models. Within every row, the ordering is Spatial ≻ Relational ≻ CSP: spatialcoordination tasks lose the most from collaboration, relational queries lose less, and constraintsatisfaction tasks lose least."
> 出处：2608.22152 5.2 The Gap Landscape｜Q13

> 原文："the gap scales monotonically with model capability: the weakest models lose roughly half of their solo success to coordination"
> 出处：2608.22152 5.2 The Gap Landscape｜Q14

> 原文："The three weakest rows come from three different model families, so the capability ordering is not a family-style artefact."
> 出处：2608.22152 5.2 The Gap Landscape｜Q15

### D. 机制：四阶段对话级联

> 原文："The proximate mechanism is not a reasoning deficit but a four-stage conversational cascade in which agents make ungrounded claims, fail to query the partner, skip integrating both views, and accept the answer without re-derivation."
> 出处：2608.22152 Abstract｜Q16

> 原文："From 700 openended LLM failure descriptions clustered under a neutral prompt and an anti-bias naming rule (Appendix B), we extract 16 behaviourally specific themes"
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade｜A22

> 原文："L1 Grounding. A claim is grounded if it can be traced to information stated by either agent. Panel L1 of Figure 2 shows that grounding is the cleanest single-feature fail/success discriminator in the judge: successful rollouts are grounded in essentially every category, while a substantial fraction of failures contain at least one ungrounded claim."
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade（L1 Grounding 段）｜A1

> 原文："L2 Querying. A pair queries iff at least one agent makes a specific factual request of the partner (“what is the value of node K?”). Querying discriminates failure from success across all three categories (panel L2 of Figure 2), with the largest gap on CSP"
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade（L2 Querying 段）｜A2

> 原文："(panel L2 of Figure 2), with the largest gap on CSP, where successful pairs explicitly elicit cross-half capacity and constraint facts that failed pairs leave latent."
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade（L2 Querying 段）｜A2b

> 原文："L3 Integration. A pair integrates iff the decisive claim is preceded by an explicit combined-state message that lists facts from both views and any derived consequences. Panel L3 of Figure 2 shows that integration is the strongest single-variable predictor of the collaboration tax and the only stage whose marginal contribution to a multi-feature regression is positive."
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade｜Q18

> 原文："L4 Re-derivation. A pair re-derives iff the receiving agent shows actual recomputation work (rewalks the path, recomputes the sum, re-checks the constraints) before either agent wants to end."
> 出处：2608.22152 5.3 Mechanism: A Four-Stage Cascade｜Q19

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Multi-Agent-Collaboration-Tax`（完整卡：`references/full-card.md`）。

- 论文：2608.22152
- 标题：The Collaboration Tax: How Much LLM Multi-Agent Systems Pay to Coordinate
- 发表处：EMNLP 2026
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Subagent-Decomposition.md, Skill-MAS-Orchestrator.md, Skill-MetaGPT-SOP-Driven-Collaboration.md, Skill-Multi-Agent-Debate.md, Skill-Agent-Stage-Evaluation.md, Skill-Context-Compression.md

- 逐字引文：55 条，全部内联于上方「原文引用」段；一条不截断。
