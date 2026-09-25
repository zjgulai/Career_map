---
name: "p2s-multi-agent-debate"
title: "Multi-Agent Debate — 多智能体辩论共识"
description: "触发词：多智能体辩论、共识裁决、标注歧义、结论复核。何时不用：结论无歧义、单模型可稳定判断时不用辩论；需要事实查证而非观点权衡时用检索类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 依赖协调"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
quality_tier: "curated"
p2s_card_id: "Skill-Multi-Agent-Debate"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "CCF-B"
p2s_paper_id: "2305.19118"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Multi-Agent-Debate"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Multi-Agent-Debate.md"
rebase_source_sha256: "a36d97ce0936b84d92c8585100c8e0d5a9ba4630f4faa15c855b216244b466e0"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a36d97ce0936b84d92c8585100c8e0d5a9ba4630f4faa15c855b216244b466e0"
rebase_full_card_bytes: "15644"
rebase_full_card_lines: "319"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "fba03b68e722fa72a69b7154883a560dd3c960c1395537c765ebec883540655c"
user_summary: "让多个智能体先各自推理再互相反驳，由裁决方给出更稳的结论和置信度。"
user_try: "试试：这批评论情感标注分歧很大，帮我用多智能体辩论跑一遍并给出需要人工复核的案例。"
whenToUse: "本卡属「组合取舍」。结论存在歧义、需要多个视角辩论并量化置信度时用本卡；结论明确、只需一次判断时用单模型标注。"
workflow: "各 Agent 独立初始推理 → 互相生成反驳论证 → 根据反馈更新立场 → 裁决 Agent 综合评出结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "11"
rebase_evidence_quotes_total: "15"
rebase_evidence_quotes_complete: "false"
---
# Multi-Agent Debate — 多智能体辩论共识

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`，sha256 `a36d97ce0936b84d92c8585100c8e0d5a9ba4630f4faa15c855b216244b466e0`，15644 字节 / 319 行 / 15 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 11 条（共 15 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `fba03b68e722fa72a69b7154883a560dd3c960c1395537c765ebec883540655c`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Multi-Agent Debate — 多智能体辩论共识

---

## ① 算法原理

### 核心思想

**Multi-Agent Debate (MAD)** 提出了一种通过多 Agent 辩论来解决复杂推理问题的方法。核心洞察：**单个 LLM 一旦对初始答案建立信心，后续的自我反思会陷入"思维退化"（Degeneration-of-Thought），无法产生真正的新思路。多个 Agent 之间的对抗性辩论可以打破这种认知锁定**。

MAD 的三个核心机制：

1. **多 Agent 独立推理**：多个 Agent 独立回答同一问题，产生多样化的初始答案
2. **对抗性辩论（Tit-for-Tat）**：Agent 们轮流回应，提出反驳、补充证据、修正观点
3. **Judge 裁决**：独立的 Judge Agent 综合各方观点，输出最终结论

### Degeneration-of-Thought (DoT) 问题

（**换底正文在此截断** —— 完整卡正文共 319 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 11 / 全 15 条 —— **其余 4 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 15 条逐字引文。本页按完整卡顺序内联**前 11 条整条引文**（不在引文中间断开）；其余 4 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"However, our study shows that such reflection-style methods suffer from the Degeneration-of-Thought (DoT) problem: once the LLM has established confidence in its solutions, it is unable to generate novel thoughts later through reflection even if its initial stance is incorrect."
> 出处：2305.19118 Abstract

> 原文:"In this work, we focus on the Degeneration-of-Thought (DoT) problem in self-reflection, which is proposed and defined by us for the first time. Formally, DoT describes the following scenario:"
> 出处：2305.19118 §1 Introduction

> 原文:"Once the LLM has established confidence in its answers, it is unable to generate novel thoughts later through self-reflection even if the initial stance is incorrect."
> 出处：2305.19118 §1 Introduction

> 原文:"The low disagreement of self-reflection suggests that the LLM sticks to the incorrect answers predicted by CoT and is unable to engage in meaningful self-reflection."
> 出处：2305.19118 §1 Introduction

### B. MAD 的三机制（对应 ①「MAD 的三个核心机制」）

> 原文:"To address the DoT problem, we propose a Multi-Agent Debate (MAD) framework, in which multiple agents express their arguments in the state of “tit for tat” and a judge manages the debate process to obtain a final solution."
> 出处：2305.19118 Abstract

> 原文:"To address the DoT issue, we leverage another fundamental characteristic of human problem-solving, i.e., debate, to encourage divergent thinking in LLMs. Specifically, we propose the MAD framework, short for Multi-Agent Debate, where two agents express their own arguments in the state of “tit for tat” and a judge monitors and manages the debate process to obtain a final solution."
> 出处：2305.19118 §1 Introduction

> 原文:"The nature of MAD determines that (1) The distorted thinking of one LLM can be corrected by the others; (2) The resistance to change of one LLM will be complemented by the others; and (3) each agent can obtain external feedback from the others."
> 出处：2305.19118 §1 Introduction

> 原文:"There are $N$ debaters $D=\{D_{i}\}_{i=1}^{N}$ involved in the framework. In each debate iteration, the debaters $D_{i}$ speak one by one in a fixed order and express their arguments based on the previous debate history $H$, i.e., $D_{i}(H)=h$."
> 出处：2305.19118 §2 Multi-Agent Debate Framework（Debaters）

> 原文:"We also design a judge $J$ to manage and monitor the whole debate process. The judge contains two different modes: (a) Discrinative Mode, in which the judge $J$ decides whether the correct solution can be obtained after all the debaters finish their arguments in the current iteration"
> 出处：2305.19118 §2 Multi-Agent Debate Framework（Judge）

> 原文:"In this work, we mainly use three agents in our MAD framework, including two debaters (i.e., affirmative and negative) and a judge. Unless other stated, we use GPT-3.5-Turbo as the backbone model for all agents by default."
> 出处：2305.19118 §4.1 Setups（Backbone Models）

### C. 「GPT-3.5 + MAD 超越 GPT-4」的精确口径（对应 ①「关键洞察」、⑤「效果验证」）

> 原文:"Experimental results demonstrate that our MAD framework performs much better than the baseline methods, especially, MAD with GPT-3.5-Turbo can surpass the performance of GPT-4 on Common MT."
> 出处：2305.19118 §1 Introduction

## 输入 / 输出契约

**输入**：待标注或待裁决的文本、多个使用不同提示或模型的标注 Agent，以及裁决方的判断标准。

**输出**：聚合后的标注或裁决结论、各 Agent 立场与分歧点，以及歧义案例的置信度量化结果，用于指导人工复核优先级。

## 执行步骤

1. 组织多个使用不同提示或模型的辩论 Agent
2. 各 Agent 先独立推理并给出初始立场
3. 各 Agent 针对对手立场生成反驳并更新观点
4. 由裁决 Agent 综合各方立场给出结论
5. 标注歧义案例的置信度并排序人工复核优先级

## 边界与不做

- 结论无歧义、单模型即可稳定判断时不用本卡
- 本卡产出裁决结论与置信度，不替代人工终审
- 本技能承载的是规则与契约产物（DAG 定序规则、熔断阈值与退避策略、置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-Multi-Agent-Debate

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：10-MAS　·　源卡：`Skill-Multi-Agent-Debate`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（172 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`）。

- 论文：2305.19118
- 标题：Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
- venue 档位：CCF-B
- 证据基础：paper-verbatim

- 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`）。
>
> - 论文：2305.19118
> - 标题：Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
> - venue 档位：CCF-B
> - 证据基础：paper-verbatim
>
> - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2305.19118
> > - 标题：Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
> > - venue 档位：CCF-B
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2305.19118
> > > - 标题：Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
> > > - venue 档位：CCF-B
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Multi-Agent-Debate`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2305.19118
> > > > - 标题：Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
> > > > - venue 档位：CCF-B
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2305.19118 — Encouraging Divergent Thinking in Large Language Models through Multi-Agent Debate
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
