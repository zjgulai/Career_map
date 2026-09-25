---
name: "p2s-autogen-multi-agent-conversation"
title: "AutoGen — 多智能体对话编排框架"
description: "触发词：多智能体对话、角色分工、VOC 多维分析、对话编排、校验与预警。何时不用：角色扮演式、无中央调度的自主协作用「CAMEL」；要 SOP 强约束产出格式用「MetaGPT」。安全边界：分析结论只在本组织业务系统内流转，涉及用户评论等数据不得外传给未授权第三方模型。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-AutoGen-Multi-Agent-Conversation"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "preprint"
p2s_paper_id: "2308.08155"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-AutoGen-Multi-Agent-Conversation"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-AutoGen-Multi-Agent-Conversation.md"
rebase_source_sha256: "28b6acbe149855baad824c2705488eb2e2029c2831429a735b3ff0691f852b8d"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "28b6acbe149855baad824c2705488eb2e2029c2831429a735b3ff0691f852b8d"
rebase_full_card_bytes: "15748"
rebase_full_card_lines: "299"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "0768cb06776df40e957d075b0bea2610937f1977dcd8c7f2283e54c36f770149"
user_summary: "把评论分析拆成抽取、情感、校验、预警几个角色，让它们对话协作，越聊越准。"
user_try: "试试：用多智能体对话方式分析本周数万条评论，一个做抽取、一个做校验、一个做预警。"
whenToUse: "当任务需要多个角色分工对话、单 Agent 容易遗漏维度时用本技能；角色扮演式自主协作、不设中央调度，用「CAMEL」；按 SOP 强约束产出格式，用「MetaGPT」；要按任务形态自动切换拓扑，用「任务自适应拓扑路由」。"
workflow: "定义抽取、情感、校验、预警等角色 Agent 与各自系统提示 → 用共享对话消息驱动角色轮流发言与交接 → 由校验 Agent 复核抽取结果并标记待人工复核项 → 由预警 Agent 按业务规则库触发阈值告警 → 汇总输出多维分析结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "16"
rebase_evidence_quotes_complete: "false"
---
# AutoGen — 多智能体对话编排框架

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`，sha256 `28b6acbe149855baad824c2705488eb2e2029c2831429a735b3ff0691f852b8d`，15748 字节 / 299 行 / 16 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 16 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `0768cb06776df40e957d075b0bea2610937f1977dcd8c7f2283e54c36f770149`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: AutoGen — 多智能体对话编排框架

---

## ① 算法原理

### 核心思想

**AutoGen** 是一个通用的多智能体对话框架，核心洞察：**将复杂的 LLM 应用开发简化为多 agent 之间的对话编排**。不同于传统的单 agent 链式调用，AutoGen 允许多个具备不同能力的 agent 通过自然语言对话协作完成复杂任务。

AutoGen 的两个核心抽象：

1. **Conversable Agent（可对话 Agent）**：每个 agent 是可定制、可对话的实体，后端可以是 LLM、人类输入或工具执行。Agent 具有统一的消息收发接口（`send`/`receive`），可以自主进行多轮对话。

（**换底正文在此截断** —— 完整卡正文共 299 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 16 条 —— **其余 10 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 16 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 10 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"This technical report presents AutoGen, a new framework that enables development of LLM applications using multiple agents that can converse with each other to solve tasks. AutoGen agents are customizable, conversable, and seamlessly allow human participation. They can operate in various modes that employ combinations of LLMs, human inputs, and tools."
> 出处：2308.08155 Abstract

> 原文:"AutoGen abstracts and implements conversable agents designed to solve tasks through inter-agent conversations. Using conversable agents in AutoGen, developers can create various forms and patterns of multi-agent conversations involving LLMs, humans, and tools."
> 出处：2308.08155 §2 The AutoGen Framework

> 原文:"A unique feature of agents in AutoGen is their conversability, allowing them to solve tasks collectively through inter-agent conversations. A conversable agent is an entity with a specific role that can send and receive messages to and from other conversable agents to start or continue a conversation. It maintains its internal states based on sent and received messages and can be configured with a set of capabilities (e.g., enabled by LLMs, humans, tools, etc.)."
> 出处：2308.08155 §2.1 Conversable Agent

> 原文:"Customizable agents that integrate LLMs, humans, and tools. AutoGen agent comes with a set of capabilities powered by LLMs, humans, tools, or a combination of these. By selecting and configuring a subset of built-in capabilities, one can easily create agents with different roles, as shown in Figure 2."
> 出处：2308.08155 §1 Introduction（key features）

### B. Computation 与 Control Flow（对应 ①「两种机制控制协作」）

> 原文:"With AutoGen, building a complex multi-agent conversation system involves (a) defining a set of conversable agents with specialized capabilities and roles, and (b) defining the interaction behavior between agents, i.e., how an agent should respond when receiving messages from another agent."
> 出处：2308.08155 §2 The AutoGen Framework

> 原文:"One main insight of AutoGen is to solve tasks via inter-agent conversations. With the goal of enabling next-gen applications, we face the challenge of finding a simple, unified approach to facilitate easy orchestration of complex workflows. We introduce the following designs to tackle this challenge: (1) intuitive and unified conversation interfaces; (2) automated agent chat via auto-reply; and (3) generic support of diverse conversation patterns."
> 出处：2308.08155 §2.2 Multi-Agent Conversations

## 输入 / 输出契约

**输入**：原始评论数据（多语言）、历史标注样本（用于校验 Agent 校准）、业务规则库（预警阈值、敏感词等）；按批次或时间窗传入。

**输出**：多维分析结果（实体、情感、异常）、校验结论与预警信号，以及可追溯的对话记录；供 VOC 分析与质检角色使用。

## 执行步骤

1. 定义抽取、情感、校验、预警等角色 Agent 与各自系统提示
2. 用共享对话消息驱动角色轮流发言
3. 由校验 Agent 复核结果并标记待人工复核项
4. 由预警 Agent 按业务规则库触发阈值告警
5. 汇总输出多维分析结论与对话记录

## 边界与不做

- 数据不满足：没有历史标注样本时校验 Agent 无法校准，先补标注或降级为规则校验。
- 何时不用：角色扮演式无中央调度用「CAMEL」；SOP 强约束流程用「MetaGPT」；拓扑要按任务形态自动切换用「任务自适应拓扑路由」。
- 能力边界：只做分析与校验编排，不执行对外动作；对话轮次需要设最大轮数兜底。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-AutoGen-Multi-Agent-Conversation

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-AutoGen-Multi-Agent-Conversation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（237 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`）。

- 论文：2308.08155
- 标题：AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`）。
>
> - 论文：2308.08155
> - 标题：AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2308.08155
> > - 标题：AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2308.08155
> > > - 标题：AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-AutoGen-Multi-Agent-Conversation`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2308.08155
> > > > - 标题：AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2308.08155 — AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
