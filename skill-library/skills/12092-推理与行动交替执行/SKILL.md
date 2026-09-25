---
name: "p2s-react-reasoning-acting"
title: "'Skill: ReAct — 推理与行动交替执行'"
description: "触发词：推理与行动交替、工具调用、补货决策、动态定价、Agent范式。何时不用：任务不需要外部信息时纯推理即可；要多智能体分工协作时用 MAS 架构类技能。安全边界：补货与调价属执行器动作，须设人工审批阈值，不得让 Agent 无审批直接改价或下采购单。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-ReAct-Reasoning-Acting"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "2210.03629"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-ReAct-Reasoning-Acting"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-ReAct-Reasoning-Acting.md"
rebase_source_sha256: "90c34924e66c81c8009cea92342fcecda74b4bf43019310f79073a8202cb3ef8"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "90c34924e66c81c8009cea92342fcecda74b4bf43019310f79073a8202cb3ef8"
rebase_full_card_bytes: "14854"
rebase_full_card_lines: "303"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "f0d74a1158d7b6133f7bd7276e8ac6d4406495f1e4bc2e6ed8cb844544a94d5a"
user_summary: "让模型在想一步、做一步之间来回切换：先推理需要什么信息，再调工具取数，据此继续推理出结论。"
user_try: "试试：用推理加行动的方式判断这款恒温暖奶器该不该补货、要不要调价，并说明每一步依据。"
whenToUse: "属于「业务工具实现」：任务需要边推理边查外部数据、单靠一次生成答不准时用；若任务不需要外部信息，纯推理即可；若要多个 Agent 分工协作，用 MAS 架构类技能。"
workflow: "定义行动空间：库存、销售、竞品、供应链等可用工具 → 模型给出推理轨迹，决定下一步需要查什么 → 调用工具取回观测结果并写入上下文 → 交替推理与行动，直到信息足够后给出结论 → 对涉及调价与采购的动作加人工确认后再执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "8"
rebase_evidence_quotes_total: "14"
rebase_evidence_quotes_complete: "false"
---
# 'Skill: ReAct — 推理与行动交替执行'

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`，sha256 `90c34924e66c81c8009cea92342fcecda74b4bf43019310f79073a8202cb3ef8`，14854 字节 / 303 行 / 14 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 8 条（共 14 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `f0d74a1158d7b6133f7bd7276e8ac6d4406495f1e4bc2e6ed8cb844544a94d5a`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: ReAct — 推理与行动交替执行

---

## ① 算法原理

### 核心思想

**ReAct** (Reasoning + Acting) 提出了一种**推理与行动交织**的范式。核心洞察：**纯推理（Chain-of-Thought）容易幻觉，纯行动（Tool Use）缺乏规划——只有把两者交替进行，才能既保持思维连贯性又确保信息准确性**。

ReAct 的核心循环：


每个循环中：
1. **Thought**：Agent 进行内部推理——计划下一步、分析现状、更新策略
2. **Action**：Agent 执行具体行动——调用 API、搜索、查询数据库
3. **Observation**：Agent 接收外部反馈——API 返回结果、搜索结果、数据库记录

ReAct 解决了两个关键问题：
- **CoT 的幻觉问题**：推理不再仅依赖内部知识，每一步都可以获取外部真实信息

（**换底正文在此截断** —— 完整卡正文共 303 行，本页内联到第 24 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 8 / 全 14 条 —— **其余 6 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 14 条逐字引文。本页按完整卡顺序内联**前 8 条整条引文**（不在引文中间断开）；其余 6 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"In this paper, we explore the use of LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing for greater synergy between the two: reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with and gather additional information from external sources such as knowledge bases or environments."
> 出处：2210.03629 Abstract

> 原文:"The idea of ReAct is simple: we augment the agent’s action space to $\mathcal{\hat{A}}=\mathcal{A}\cup\mathcal{L}$, where $\mathcal{L}$ is the space of language. An action $\hat{a}_{t}\in\mathcal{L}$ in the language space, which we will refer to as a thought or a reasoning trace, does not affect the external environment, thus leading to no observation feedback."
> 出处：2210.03629 §2 ReAct: Synergizing Reasoning + Acting

### B. 两个关键问题：CoT 幻觉 与 Act-only 无规划（对应 ①「ReAct 解决了两个关键问题」）

> 原文:"Concretely, on question answering (HotpotQA) and fact verification (Fever), ReAct overcomes prevalent issues of hallucination and error propagation in chain-of-thought reasoning by interacting with a simple Wikipedia API, and generating human-like task-solving trajectories that are more interpretable than baselines without reasoning traces."
> 出处：2210.03629 Abstract

> 原文:"However, this “chain-of-thought” reasoning is a static black box, in that the model uses its own internal representations to generate thoughts and is not grounded in the external world, which limits its ability to reason reactively or update its knowledge."
> 出处：2210.03629 §1 Introduction

> 原文:"However, they do not employ language models to reason abstractly about high-level goals or maintain a working memory to support acting"
> 出处：2210.03629 §1 Introduction

> 原文:"Hallucination is a serious problem for CoT, resulting in much higher false positive rate than ReAct (14% vs. 6%) in success mode, and make up its major failure mode (56%)."
> 出处：2210.03629 §3.3 Results and Observations

### C. 关键假设与适用面（对应 ①关键假设、⑤「广泛适用」「基础性地位」「可解释」）

> 原文:"General and flexible. Due to the flexible thought space and thought-action occurrence format, ReAct works for diverse tasks with distinct action spaces and reasoning needs, including but not limited to QA, fact verification, text game, and web navigation."
> 出处：2210.03629 §2 ReAct: Synergizing Reasoning + Acting

> 原文:"Performant and robust. ReAct shows strong generalization to new task instances while learning solely from one to six in-context examples, consistently outperforming baselines with only reasoning or acting across different domains."
> 出处：2210.03629 §2 ReAct: Synergizing Reasoning + Acting

## 输入 / 输出契约

**输入**：实时库存数据（卡页示例 FBA 仓与海外仓）、过去 90 天销售趋势（日/周维度）、竞品价格（示例 Top 5 竞品实时价格）与供应链数据（示例供应商交期 25-35 天、海运周期 18 天）。

**输出**：带推理轨迹的结论与动作建议：卡页示例把断货从每季度 2 次降到 0 次（年化减少损失 32 万元）、仓储费年化节省 4.8 万元、动态定价带来平均售价提升 4.2%（年化增加毛利 8.5 万元）。

## 执行步骤

1. 定义行动空间：库存、销售、竞品、供应链等可用工具
2. 模型给出推理轨迹，决定下一步需要查什么
3. 调用工具取回观测结果并写入上下文
4. 交替推理与行动，直到信息足够后给出结论
5. 对涉及调价与采购的动作加人工确认后再执行

## 边界与不做

- 数据不满足时不用：所需外部数据源不可用或工具接口不稳定时，推理-行动循环会空转，应先打通数据接口。
- 能力边界：本卡产出推理与行动范式及动作建议，不含工具本身的实现，也不承担跨系统写操作的集成。
- 补货与调价属执行器动作，须设人工审批阈值，不得让 Agent 无审批直接改价或下采购单。

## 技能关联

- **可组合**：Skill-ReAct-Reasoning-Acting

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：10-MAS　·　源卡：`Skill-ReAct-Reasoning-Acting`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`）。

- 论文：2210.03629
- 标题：ReAct: Synergizing Reasoning and Acting in Language Models
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`）。
>
> - 论文：2210.03629
> - 标题：ReAct: Synergizing Reasoning and Acting in Language Models
> - venue 档位：CCF-A
> - 证据基础：paper-verbatim
>
> - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2210.03629
> > - 标题：ReAct: Synergizing Reasoning and Acting in Language Models
> > - venue 档位：CCF-A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2210.03629
> > > - 标题：ReAct: Synergizing Reasoning and Acting in Language Models
> > > - venue 档位：CCF-A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-ReAct-Reasoning-Acting`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2210.03629
> > > > - 标题：ReAct: Synergizing Reasoning and Acting in Language Models
> > > > - venue 档位：CCF-A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2210.03629 — ReAct: Synergizing Reasoning and Acting in Language Models
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
