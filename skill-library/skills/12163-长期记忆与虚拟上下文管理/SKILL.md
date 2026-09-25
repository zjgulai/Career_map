---
name: "p2s-agent-memory-learning"
title: "MemGPT — 长期记忆与虚拟上下文管理"
description: "触发词：长期记忆、虚拟上下文、分层存储、记忆压缩、跨会话连续。何时不用：只做商品偏好字段用「长期偏好记忆」；本技能是通用记忆架构，不限导购场景。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-109"
l3_business: "需求识别"
l3_all: "需求识别 / 生命周期触达"
l1_l2_l3: "业务运营/服务与体验/需求识别"
quality_tier: "curated"
p2s_card_id: "Skill-Agent-Memory-Learning"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "preprint"
p2s_paper_id: "2310.08560"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Agent-Memory-Learning"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Agent-Memory-Learning.md"
rebase_source_sha256: "d1a19be60a5b84ca95edbf8adcb0455e55e2eb7c62e5b7c98b2d47c6477c7a31"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d1a19be60a5b84ca95edbf8adcb0455e55e2eb7c62e5b7c98b2d47c6477c7a31"
rebase_full_card_bytes: "20509"
rebase_full_card_lines: "357"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "db8bf6f8aae440795c4ea8eae613df5607aab0dc19b99ce72cd88dba79805131"
user_summary: "给 Agent 一套分层记忆，让它记住用户几年间的偏好和背景，超出的部分自动换页保存。"
user_try: "试试：给我们的母婴客服 Agent 配一套长期记忆，让它记住用户孩子的月龄和历史咨询。"
whenToUse: "当 Agent 需要处理远超上下文窗口的历史、要实现主动记忆管理而非简单偏好字段时用；只做商品偏好推荐用「长期偏好记忆」。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "23"
rebase_evidence_quotes_complete: "false"
---
# MemGPT — 长期记忆与虚拟上下文管理

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`，sha256 `d1a19be60a5b84ca95edbf8adcb0455e55e2eb7c62e5b7c98b2d47c6477c7a31`，20509 字节 / 357 行 / 23 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 23 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `db8bf6f8aae440795c4ea8eae613df5607aab0dc19b99ce72cd88dba79805131`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: MemGPT — 长期记忆与虚拟上下文管理

---

## ① 算法原理

### 核心思想

**MemGPT** 将操作系统的虚拟内存管理思想引入 LLM Agent 的记忆系统。核心洞察：**LLM 的上下文窗口就像物理 RAM——容量有限且昂贵，而 Agent 需要处理的任务往往远超这个容量。解决方案是构建一个分层记忆体系，让 LLM 主动管理自己的记忆**。

MemGPT 的三层记忆架构（类比 OS 内存层次）：

| 层级 | OS 类比 | 功能 | 容量 | 速度 |
|------|---------|------|------|------|
| **Main Context** | 物理 RAM | 当前对话/任务状态/活跃记忆 | 有限（LLM 上下文窗口） | 最快 |

（**换底正文在此截断** —— 完整卡正文共 357 行，本页内联到第 16 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 23 条 —— **其余 14 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 23 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 14 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Large language models (LLMs) have revolutionized AI, but are constrained by limited context windows, hindering their utility in tasks like extended conversations and document analysis. To enable using context beyond limited context windows, we propose virtual context management, a technique drawing inspiration from hierarchical memory systems in traditional operating systems that provide the appearance of large memory resources through data movement between fast and slow memory."
> 出处：2310.08560 Abstract

> 原文:"Using this technique, we introduce MemGPT (Memory-GPT), a system that intelligently manages different memory tiers in order to effectively provide extended context within the LLM’s limited context window, and utilizes interrupts to manage control flow between itself and the user."
> 出处：2310.08560 Abstract

> 原文:"In this paper, we introduced MemGPT, a novel LLM system inspired by operating systems to manage the limited context windows of large language models. By designing a memory hierarchy and control flow analogous to traditional OSes, MemGPT provides the illusion of larger context resources for LLMs."
> 出处：2310.08560 §5 Concluding remarks and future directions

### B. 分层记忆体系（对应 ①「三层记忆架构」表）

> 原文:"In MemGPT we refer to the LLM inputs (that are bound by the maximum number of input tokens) as the system’s main context."
> 出处：2310.08560 §2.1 Main context

> 原文:"In our experiments on multi-session chat and document analysis, we further divide main context into three components: system instructions, which hold the base LLM instructions (e.g., information describing MemGPT functions and control flow to the LLM), conversational context, which holds a first-in-first-out (FIFO) queue of recent event history (e.g., messages between the agent and user), and working context, which serves as a working memory scratchpad for the agent."
> 出处：2310.08560 §2.1 Main context

> 原文:"External context refers to out-of-context storage that lies outside the context window of the LLM processor, analogous to disk memory (i.e. disk storage) in OSes. Information in external context is not immediately visible to the LLM processor, however, it can be brought into main context through appropriate function calls."
> 出处：2310.08560 §2.2 External context

> 原文:"We make a distinction between two types of external context: recall storage, which stores the entire history of events processed by the LLM processor (in essense the full uncompressed queue from active memory), and archival storage, which serves as a general read-write datastore that the agent can utilize as overflow for the in-context read-write core memory."
> 出处：2310.08560 §2.2 External context

> 原文:"In the context of conversational agents, archival storage allows MemGPT to store facts, experiences, preferences, etc. about the agent or user beyond the strict token limit of main context, and search over recall storage allows the MemGPT to find past interactions related to a particular query or within a specific time period."
> 出处：2310.08560 §2.2 External context

### C. 与 RAG 的区别：记忆操作由 LLM 自主发起（对应 ①「与 RAG 的区别」表第 1、2 行）

> 原文:"MemGPT orchestrates data movement between main context and external context via function calls that are generated by the LLM processor. Memory edits and retrieval are entirely self-directed: MemGPT autonomously updates and searches through its own memory based on the current context."
> 出处：2310.08560 §2.3 Self-directed editing and retrieval

## 输入 / 输出契约

**输入**：用户历史对话记录、购买记录与产品反馈、用户画像（偏好、阶段、关注点）、产品知识库，用于初始化分层记忆。

**输出**：分层记忆体系（主上下文与外部记忆的换入换出）与可复用的个性化上下文，支持跨会话连续服务。

## 执行步骤

1. 为用户建立分层记忆库（短期上下文与长期外部存储）
2. 把历史对话、购买记录与画像初始化进长期记忆
3. 由 Agent 主动判断哪些内容写入或换出记忆
4. 按当前咨询检索相关记忆片段供回答使用
5. 定期压缩与清理记忆库，维持长期关系连续性

## 边界与不做

- 何时不用：上下文窗口够用、历史只有几轮对话时，复杂记忆架构反而增加维护成本
- 能力边界：只提供记忆读写与上下文管理，不保证业务结论正确，记忆库需定期清理

## 技能关联

- **可组合**：Skill-Agent-Memory-Learning

---

> 分类：业务运营/服务与体验/需求识别　·　技术族：10-MAS　·　源卡：`Skill-Agent-Memory-Learning`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（245 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`）。

- 论文：2310.08560
- 标题：MemGPT: Towards LLMs as Operating Systems
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：23 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`）。
>
> - 论文：2310.08560
> - 标题：MemGPT: Towards LLMs as Operating Systems
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：23 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2310.08560
> > - 标题：MemGPT: Towards LLMs as Operating Systems
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：23 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2310.08560
> > > - 标题：MemGPT: Towards LLMs as Operating Systems
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：23 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Agent-Memory-Learning`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2310.08560
> > > > - 标题：MemGPT: Towards LLMs as Operating Systems
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：23 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2310.08560 — MemGPT: Towards LLMs as Operating Systems
> > > > > ⚠️ 该号被 4 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
