---
name: "p2s-metagpt-sop-driven-collaboration"
title: "MetaGPT — SOP 驱动的多智能体协作框架"
description: "触发词：SOP 驱动、标准流程、角色分工、结构化产出、质检追溯。何时不用：自由对话式协作用「AutoGen」；角色扮演式协作用「CAMEL」。安全边界：SOP 与验收标准变更必须版本化并同步全部角色提示，不得只改其中一个 Agent。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / VOC编码"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-MetaGPT-SOP-Driven-Collaboration"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "preprint"
p2s_paper_id: "2308.00352"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MetaGPT-SOP-Driven-Collaboration"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-MetaGPT-SOP-Driven-Collaboration.md"
rebase_source_sha256: "d1bb8a0ab4d5eab3c223290e044de2314262ee5487457594523bd55d811eba09"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d1bb8a0ab4d5eab3c223290e044de2314262ee5487457594523bd55d811eba09"
rebase_full_card_bytes: "18084"
rebase_full_card_lines: "325"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "6c02a1f993d32cbf5ba9e86b41af4bed26a6b86e6d228688ea8c5055753cebb9"
user_summary: "把评论分析的标准流程固化成 SOP，让每个 Agent 按步骤和验收标准产出，质量不再靠人。"
user_try: "试试：按 VOC 分析的 SOP 建三个角色 Agent，让它们按统一格式产出并保留质检追溯。"
whenToUse: "当协作流程需要标准化（统一步骤、验收标准、输出格式）并要可追溯时用本技能；需要自由对话式分工用「AutoGen」；需要角色扮演式自主协作用「CAMEL」。"
workflow: "定义 SOP 步骤与各角色（分析师、工程师、质检员）职责 → 用共享消息池按主题订阅与发布消息 → 各 Agent 按声明的输入主题执行并输出到指定主题 → 按验收标准做结构化校验并留存追溯记录"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "20"
rebase_evidence_quotes_complete: "false"
---
# MetaGPT — SOP 驱动的多智能体协作框架

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`，sha256 `d1bb8a0ab4d5eab3c223290e044de2314262ee5487457594523bd55d811eba09`，18084 字节 / 325 行 / 20 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 20 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `6c02a1f993d32cbf5ba9e86b41af4bed26a6b86e6d228688ea8c5055753cebb9`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: MetaGPT — SOP 驱动的多智能体协作框架

---

## ① 算法原理

### 核心思想

**MetaGPT** 将人类组织中的 **Standardized Operating Procedures（SOP，标准作业程序）** 引入多 agent 协作。核心洞察：**复杂任务失败的主要原因是 agent 间缺乏标准化协作规范和结构化信息传递**。通过模拟软件公司的角色分工（PM → Architect → Engineer → QA）和文档驱动的工作流，MetaGPT 显著减少了多 agent 协作中的幻觉和级联错误。

MetaGPT 的三个核心机制：

1. **角色专业化（Role Specialization）**：每个 agent 有明确的角色、职责和约束。例如 Product Manager 负责编写 PRD，Architect 负责系统设计，Engineer 负责编码实现。

（**换底正文在此截断** —— 完整卡正文共 325 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 20 条 —— **其余 14 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 20 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 14 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"However, existing works primarily focuses on simple tasks lacking exploration and investigation in complicated tasks mainly due to the hallucination problem. This kind of hallucination gets amplified infinitely as multiple intelligent agents interact with each other, resulting in failures when tackling complicated problems."
> 出处：2308.00352 Abstract

> 原文:"Therefore, we introduce MetaGPT, an innovative framework that infuses effective human workflows as a meta programming approach into LLM-driven multi-agent collaboration. In particular, MetaGPT first encodes Standardized Operating Procedures (SOPs) into prompts, fostering structured coordination. And then, it further mandates modular outputs, bestowing agents with domain expertise paralleling human professionals to validate output"
> 出处：2308.00352 Abstract

> 原文:"Through prolonged collaborative practice, humans have developed widely accepted standardized operating procedures (SOPs) across many domains[1, 2, 3]. These SOPs play a critical role in supporting task decomposition and efficient coordination. For instance, in software engineering, the waterfall methodology delineates orderly phases of requirements analysis, system design, coding, testing, and deliverables."
> 出处：2308.00352 §1 Introduction

> 原文:"Moreover, human roles possess specialized expertise tailored to their assigned responsibilities: software engineers leverage programming proficiency to implement code, while product managers employ market analysis to formulate business needs. Without standardized outputs, collaboration becomes disorderly [4, 5, 6]."
> 出处：2308.00352 §1 Introduction

### B. 三个核心机制（对应 ①「角色专业化 / 结构化输出 / 共享消息池+发布订阅」）

> 原文:"In this work, we present MetaGPT, a pioneering multi-agent framework incorporating real-world expertise based on SOPs. Firstly, each agent is identified by a descriptive job title, allowing the system to initialize with an appropriate role-specific prompt prefix. This embeds domain knowledge within agent definitions, rather than simplistic role-playing prompts."
> 出处：2308.00352 §1 Introduction

> 原文:"Secondly, we analyze efficient human workflows to extract SOPs encapsulating procedural knowledge required for collaborative tasks. These SOPs are encoded into the agent architecture through role-based action specifications. Thirdly, agents produce standardized action outputs to enable knowledge sharing. By formalizing artifacts that human experts exchange, MetaGPT streamlines coordination between interdependent roles."
> 出处：2308.00352 §1 Introduction

## 输入 / 输出契约

**输入**：标准化 SOP 文档（分析步骤、验收标准、输出格式）、历史分析报告作为参考模板，以及待分析的评论数据。

**输出**：按 SOP 产出的结构化分析结果（含步骤留痕与责任人）与可追溯的质检记录；供分析与质检团队复用。

## 执行步骤

1. 定义 SOP 步骤与各角色（分析师、工程师、质检员）职责
2. 用共享消息池按主题订阅与发布消息
3. 各 Agent 按声明的输入主题执行并输出到指定主题
4. 按验收标准做结构化校验并留存追溯记录

## 边界与不做

- 数据不满足：没有可执行的 SOP 与验收标准时先写流程，不要急着上多 Agent。
- 何时不用：自由对话式协作用「AutoGen」；角色扮演式协作用「CAMEL」；任务形态多变需要动态拓扑用「任务自适应拓扑路由」。
- 能力边界：只固化流程与产出契约，不执行外部动作，也不保证 SOP 本身合理（需定期评审）。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-MetaGPT-SOP-Driven-Collaboration

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-MetaGPT-SOP-Driven-Collaboration`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（270 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`）。

- 论文：2308.00352
- 标题：MetaGPT: Meta Programming for Multi-Agent Collaborative Framework
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`）。
>
> - 论文：2308.00352
> - 标题：MetaGPT: Meta Programming for Multi-Agent Collaborative Framework
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2308.00352
> > - 标题：MetaGPT: Meta Programming for Multi-Agent Collaborative Framework
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2308.00352
> > > - 标题：MetaGPT: Meta Programming for Multi-Agent Collaborative Framework
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-MetaGPT-SOP-Driven-Collaboration`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2308.00352
> > > > - 标题：MetaGPT: Meta Programming for Multi-Agent Collaborative Framework
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2308.00352 — MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
