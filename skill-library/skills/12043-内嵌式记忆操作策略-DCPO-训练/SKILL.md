---
name: "p2s-memory-as-action"
title: "Memory-as-Action — RL 内嵌式记忆操作策略 (DCPO 训练)"
description: "触发词：记忆即动作、策略内嵌记忆、多目标客诉、强化学习训练、一次解决率。何时不用：单目标简单对话用规则化上下文管理即可；要按容量做分层淘汰时用分级记忆管理。安全边界：训练需要客户对话轨迹，须脱敏并取得授权，不得把客户个人信息写入可被检索的长期记忆。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Memory-as-Action"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2510.12635"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Memory-as-Action"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Memory-as-Action.md"
rebase_source_sha256: "70f5e6f151cc0f08089ec4a5a8f636e3cb5c66f3373e1e5e68fca6e97e13168b"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "70f5e6f151cc0f08089ec4a5a8f636e3cb5c66f3373e1e5e68fca6e97e13168b"
rebase_full_card_bytes: "25144"
rebase_full_card_lines: "499"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "51ed0e167207ba7d94cbe96e54189ab4e5ff9bf0725a65acd202a92697823bf3"
user_summary: "把存取、压缩、总结记忆变成模型自己能学的一个动作，让一次对话里同时处理多个诉求也不丢上下文。"
user_try: "试试：规划一套把记忆操作内嵌进策略的训练方案，用我们的客服轨迹提升多目标客诉的一次解决率。"
whenToUse: "属于「业务工具实现」：对话里子目标多、纯提示词控制会丢上下文且换模型后失效时用；若对话只有一个目标，规则化上下文管理即可；若要按容量与重要性分层淘汰，用分级记忆管理。"
workflow: "把记忆操作定义成可选动作：写入长期、检索长期、裁剪短期、摘要 → 构造冷启动轨迹，让模型先学会何时调用记忆动作 → 用分段式强化学习训练，把每段动作与最终结果对应 → 在真实多目标客诉对话上评估一次解决率与上下文丢失 → 小流量上线，用失败样本回流训练"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "45"
rebase_evidence_quotes_complete: "false"
---
# Memory-as-Action — RL 内嵌式记忆操作策略 (DCPO 训练)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Memory-as-Action`（完整卡：`references/full-card.md`，sha256 `70f5e6f151cc0f08089ec4a5a8f636e3cb5c66f3373e1e5e68fca6e97e13168b`，25144 字节 / 499 行 / 45 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 45 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `51ed0e167207ba7d94cbe96e54189ab4e5ff9bf0725a65acd202a92697823bf3`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Memory-as-Action — 记忆操作嵌入策略 + DCPO 训练

---

## ① 算法原理

### 核心思想

**MemAct(Memory-as-Action)** 把"记忆管理"从外部启发式控制器(sliding window / 外部 summarizer)升级为 **agent policy 内嵌的可学习 action**:

- **传统范式**:agent π_task 只负责任务,memory 由外部 controller 用 rule-based 启发式管理(MemGPT / MemOS)
- **MemAct 范式**:统一 policy π_θ 同时输出 task action 和 memory action,**端到端 RL 训练**

### 与已有方案的关键差异

| 方案 | Memory 控制 | 训练方式 | 端到端? |
|------|-----------|--------|--------|
| MemGPT | 外部 paging | 无 | ❌ |

（**换底正文在此截断** —— 完整卡正文共 499 行，本页内联到第 19 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 45 条 —— **其余 35 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 45 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 35 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"We propose a novel framework, Memory-as-Action, where an agent actively manages its working memory by executing explicit editing operations as part of a unified policy."
> 出处：2510.12635 §Abstract（核心思想：memory 操作内嵌进统一 policy）

> 原文:"In this work, we reframe working memory management as a learnable, intrinsic capability."
> 出处：2510.12635 §Abstract（把 memory 管理从外部启发式升级为可学习能力）

> 原文:"The dominant approach to context engineering today relies on a workflow of external, rule-based operations (Packer et al., 2023; Jin et al., 2025; Li et al., 2025)."
> 出处：2510.12635 §1（传统范式 = 外部 rule-based 控制器的依据）

> 原文:"We introduce the Memory-as-Action framework, which enables an agent to actively edit its own working memory"
> 出处：2510.12635 §2.1 Overview

> 原文:"memory actions can overwrite or remove past context, breaking the common prefix assumption and resulting in trajectory fractures."
> 出处：2510.12635 §2.1（trajectory fracture 的成因）

> 原文:"such memory editing actions break the standard assumption of a continuously growing prefix in LLM interactions, leading to what we call trajectory fractures."
> 出处：2510.12635 §Abstract（trajectory fracture 的命名）

> 原文:"we propose a new algorithm, Dynamic Context Policy Optimization, which enables stable end-to-end reinforcement learning by segmenting trajectories at memory action points and applying trajectory-level advantages to the resulting action segments."
> 出处：2510.12635 §Abstract（DCPO 的定位）

> 原文:"We model the agent’s interaction as a Markov Decision Process (MDP), allowing the policy to explicitly edit its working memory while pursuing the primary task."
> 出处：2510.12635 §2.2（MDP 重定义）

> 原文:"Action Space: $\mathcal{A}=\mathcal{A}_{\text{task}}\cup\mathcal{A}_{\text{mem}}$, where $\mathcal{A}_{\text{task}}$ contains task-oriented actions that interact with the external environment, and $\mathcal{A}_{\text{mem}}$ contains memory actions that directly modify the working memory."
> 出处：2510.12635 §2.2（action space = task ∪ mem。注：底本用 LaTeX 记号，卡片写的 $\mathcal{A}_{\text{task}}$ / $\mathcal{A}_{\text{mem}}$ 与之一致）

> 原文:"This creates what we term a trajectory fracture—a point where the working memory $H_{t+1}$ is no longer a simple extension of $H_{t}$."
> 出处：2510.12635 §2.3.2（trajectory fracture 的定义）

## 输入 / 输出契约

**输入**：多目标客服对话轨迹与训练样本（卡页示例：800+ 条冷启动轨迹、8k+ RL 训练样本）、工具调用记录，以及训练资源（示例 8×H100 级别）。

**输出**：内嵌记忆动作的策略模型与训练管线：卡页示例以一次解决率从 72% 提升到 89% 为目标，并给出自训模型把单位成本降到约十分之一的成本账。

## 执行步骤

1. 把记忆操作定义成可选动作：写入长期、检索长期、裁剪短期、摘要
2. 收集多目标客诉轨迹，构造冷启动训练样本
3. 用分段式强化学习训练，把记忆动作与最终结果对齐
4. 在真实多目标对话上评估一次解决率与上下文丢失率
5. 小流量上线，用失败样本持续回流训练

## 边界与不做

- 数据不满足时不用：没有足够的冷启动轨迹与工具调用记录时分段式 RL 无从下手，卡页示例需 800+ 条冷启动轨迹。
- 能力边界：本卡产出策略训练方案与模型，不含对话系统上下游集成；卡页提示实施门槛极高，小团队不易承担工程基建。
- 训练需要客户对话轨迹，须脱敏并取得授权，不得把客户个人信息写入可被检索的长期记忆。

## 技能关联

- **前置**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Context-Compression.html、Skill-Context-Compression
- **延伸**：Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL
- **可组合**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design、Skill-Memory-as-Action

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Memory-as-Action`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（46 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Memory-as-Action`（完整卡：`references/full-card.md`）。

- 论文：2510.12635
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Memory-as-Action`（完整卡：`references/full-card.md`）。
>
> - 论文：2510.12635
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Memory-as-Action`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2510.12635
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Memory-as-Action`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2510.12635
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Memory-as-Action`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2510.12635
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：45 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2510.12635 — Memory as Action: Autonomous Context Curation for Long-Horizon Agentic Tasks
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
