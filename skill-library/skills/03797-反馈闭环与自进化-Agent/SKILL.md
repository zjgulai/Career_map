---
name: "p2s-self-improving-agent-feedback-loop"
title: "Self-Refine + RL — 反馈闭环与自进化 Agent"
description: "触发词：反馈闭环、Self-Refine、自我批评、记忆复用、错误复发。何时不用：靠案例库在线适应走「案例推理部署时学习」；靠失败轨迹收敛策略走「对比反思与自我巩固」。安全边界：自我改进不得绕过人工评分与审核环节，错误案例须留痕可追溯。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
quality_tier: "curated"
p2s_card_id: "Skill-Self-Improving-Agent-Feedback-Loop"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "preprint"
p2s_paper_id: "2303.17651"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Self-Improving-Agent-Feedback-Loop"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Self-Improving-Agent-Feedback-Loop.md"
rebase_source_sha256: "08dff536db629107f820e4d4501409cfaa745801ff3ca786088c90d688c1cdf7"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "08dff536db629107f820e4d4501409cfaa745801ff3ca786088c90d688c1cdf7"
rebase_full_card_bytes: "14544"
rebase_full_card_lines: "311"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "5e66b2852bf50ff3e8387a5ad87b880bd69127ffda8cb572d4bc3177e23f940e"
user_summary: "Agent 老是犯同类错误时，把每次执行结果和评分记下来，让它下次先检索经验再作答。"
user_try: "试试：VOC 分析 Agent 遇到新品牌名就识别错，帮我做个能积累经验的反馈闭环。"
whenToUse: "当 Agent 在处理新类型输入时反复出错、需要从反馈中持续改进时用；若靠案例检索在线适应，用「案例推理部署时学习」；若靠失败轨迹收敛策略，用「对比反思与自我巩固」。"
workflow: "记录任务执行轨迹（输入、输出、反馈） → 对输出做自我批评并生成改进版本 → 把经验教训写入可检索的记忆库 → 下次执行前检索相似经验作为参考 → 跟踪错误复发率与人工审核量变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "16"
rebase_evidence_quotes_complete: "false"
---
# Self-Refine + RL — 反馈闭环与自进化 Agent

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`，sha256 `08dff536db629107f820e4d4501409cfaa745801ff3ca786088c90d688c1cdf7`，14544 字节 / 311 行 / 16 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 16 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `5e66b2852bf50ff3e8387a5ad87b880bd69127ffda8cb572d4bc3177e23f940e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Self-Refine + RL — 反馈闭环与自进化 Agent

---

## ① 算法原理

### 核心思想

**Self-Refine** 是一种让 Agent 对自身输出进行批评和改进的迭代机制。核心洞察：**语言模型不仅能生成内容，也能评估和改进内容**——利用同一模型的双重能力，实现无需外部监督的自我进化。

Self-Refine 的四个步骤：
1. **Generate**：Agent 生成初始输出
2. **Feedback**：Agent 对自身输出进行批评（识别问题、遗漏、不一致）
3. **Refine**：Agent 基于批评改进输出
4. **Iterate**：重复 Feedback-Refine 直到满足质量阈值

**经验记忆库（Memory Bank）** 扩展了 Self-Refine：
- 将成功和失败的经验存入长期记忆
- 支持相似情况的经验检索和复用
- 通过成功率排序实现经验优先级管理

**反馈闭环编排器（Feedback Loop Orchestrator）** 将两者结合：

（**换底正文在此截断** —— 完整卡正文共 311 行，本页内联到第 23 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 16 条 —— **其余 7 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 16 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 7 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Like people, LLMs do not always generate the best text for a given generation problem on their first try (e.g., summaries, answers, explanations). Just as people then refine their text, we introduce Self-Refine, a framework for similarly improving initial outputs from LLMs through iterative feedback and refinement. The main idea is to generate an output using an LLM, then allow the same model to provide multi-aspect feedback for its own output; finally, the same model refines its previously generated output given its own feedback. Unlike earlier work, our iterative refinement framework does not require supervised training data or reinforcement learning, and works with a single LLM."
> 出处：2303.17651 Abstract

> 原文:"Iterative refinement, a fundamental characteristic of human problem-solving, is a process that involves creating an initial draft and subsequently refining it through self-feedback (Simon, 1962; Flower and Hayes, 1981; Amabile, 1983)."
> 出处：2303.17651 §1 Introduction

> 原文:"Although LLMs can generate coherent outputs in the initial step, they often fall short in addressing more intricate requirements, especially for tasks with multifaceted objectives (e.g., dialogue response generation with criteria such as making the response relevant, engaging, and safe) or those with less defined goals (e.g., enhancing program readability)."
> 出处：2303.17651 §1 Introduction

> 原文:"We propose Self-Refine, a novel approach that allows LLMs to iteratively refine their own outputs using their own feedback, along multiple dimensions to improve performance on diverse tasks. Unlike prior work, our approach does not require supervised training data or reinforcement learning, and uses a single LLM."
> 出处：2303.17651 §1 Introduction（contributions）

### B. 四个步骤与迭代终止（对应 ①「Self-Refine 的四个步骤」与 ①数学直觉的停止条件）

> 原文:"Self-Refine consists of an iterative loop between two components: feedback, and refine, which work in tandem to generate high-quality outputs."
> 出处：2303.17651 §1 Introduction

> 原文:"Given an input $x$, and an initial output $y_{0}$, Self-Refine successively refines the output in a feedback $\rightarrow$ refine $\rightarrow$ feedback loop."
> 出处：2303.17651 §3.1 The Self-Refine Framework

> 原文:"feedback receives the initial output $y_{0}$ and provides feedback on how to enhance it. This feedback is task-dependent and generally addresses multiple aspects of the input."
> 出处：2303.17651 §3.1 The Self-Refine Framework

> 原文:"refine is responsible for refining an output $y_{t}$ based on the received feedback and the previously generated output."
> 出处：2303.17651 §3.1 The Self-Refine Framework

> 原文:"Iterative improvement The feedback $\rightarrow$ refine $\rightarrow$ feedback loop can be applied multiple times."
> 出处：2303.17651 §3.1 The Self-Refine Framework

## 输入 / 输出契约

**输入**：需任务执行轨迹（输入、输出、反馈）、人工评分（如 1-5 分）与成功失败案例标注，任务级粒度。

**输出**：产出自改进后的 Agent 输出与经验记忆库、错误复发率与准确率变化（卡页记录错误复发率 18% 降至 4%、人工审核工作量减少 50-60%），供运营与算法团队使用。

## 执行步骤

1. 记录任务执行轨迹与人工评分反馈
2. 生成自我批评与改进版本
3. 写入经验教训到可检索记忆库
4. 检索相似经验作为下次执行参考
5. 跟踪错误复发率与人工审核量变化

## 边界与不做

- 任务一次性、缺少反馈与评分数据时，闭环无法积累有效经验
- 只做输出改进与经验积累，不替代人工评分，记忆库需定期清理更新
- 自我改进不得绕过人工审核，错误案例须留痕可追溯

## 技能关联

- **可组合**：Skill-Self-Improving-Agent-Feedback-Loop

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：10-MAS　·　源卡：`Skill-Self-Improving-Agent-Feedback-Loop`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（177 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`）。

- 论文：2303.17651
- 标题：Self-Refine: Iterative Refinement with Self-Feedback
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`）。
>
> - 论文：2303.17651
> - 标题：Self-Refine: Iterative Refinement with Self-Feedback
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2303.17651
> > - 标题：Self-Refine: Iterative Refinement with Self-Feedback
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2303.17651
> > > - 标题：Self-Refine: Iterative Refinement with Self-Feedback
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Self-Improving-Agent-Feedback-Loop`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2303.17651
> > > > - 标题：Self-Refine: Iterative Refinement with Self-Feedback
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2303.11366 — Reflexion: Language Agents with Verbal Reinforcement Learning
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
