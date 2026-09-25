---
name: "p2s-camel-role-playing-agents"
title: "CAMEL — 角色扮演式自主协作多 Agent 框架"
description: "触发词：角色扮演、双视角协作、评论洞察、自主对话、VOC 分析。何时不用：要中央调度与角色分工的完整对话框架用「AutoGen」；要 SOP 与统一产出格式用「MetaGPT」。安全边界：提示词中不得注入用户隐私字段；洞察结论须标注来自评论样本，不得当作因果结论。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / VOC编码"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-CAMEL-Role-Playing-Agents"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "2303.17760"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-CAMEL-Role-Playing-Agents"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-CAMEL-Role-Playing-Agents.md"
rebase_source_sha256: "0f07fd22d3dbbabcf1e7dfd88278b931712cec0dc0a0d41fb2540d0b4fed5961"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "0f07fd22d3dbbabcf1e7dfd88278b931712cec0dc0a0d41fb2540d0b4fed5961"
rebase_full_card_bytes: "17764"
rebase_full_card_lines: "325"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "c8a5ddf465263b0cb6504267cc3f4f5c197b38fc1076d09bef5cac279700e845"
user_summary: "让业务视角和数据视角两个 Agent 自己聊下去，把评论里真正重要的属性挖出来。"
user_try: "试试：让两个 Agent 分别从业务和数据视角分析评论，找出 Spectra S1 吸奶器的 Top 3 负面驱动因素。"
whenToUse: "当需要多视角互补、不想人工逐步引导分析深度时用本技能；需要中央调度与角色分工的完整对话框架，用「AutoGen」；需要 SOP 与标准化产出格式，用「MetaGPT」。"
workflow: "设定业务视角与数据视角两个角色及各自任务提示 → 用 Inception Prompting 让双方自主推进对话 → 在每轮中交换抽取结果与业务解读 → 收敛输出多维洞察与优先级结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "19"
rebase_evidence_quotes_complete: "false"
---
# CAMEL — 角色扮演式自主协作多 Agent 框架

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`，sha256 `0f07fd22d3dbbabcf1e7dfd88278b931712cec0dc0a0d41fb2540d0b4fed5961`，17764 字节 / 325 行 / 19 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 19 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `c8a5ddf465263b0cb6504267cc3f4f5c197b38fc1076d09bef5cac279700e845`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: CAMEL — 角色扮演式自主协作多 Agent 框架

---

## ① 算法原理

### 核心思想

**CAMEL** (Communicative Agents for "Mind" Exploration of Large Language Model Society) 提出了一种基于**角色扮演（Role-Playing）**的多 Agent 自主协作范式。核心洞察：**当两个互补角色的 Agent（指令发出者 vs 执行者）在结构化协议约束下对话时，可以自主完成复杂任务，无需人工逐步干预**。

CAMEL 的三个核心机制：

1. **Role-Playing 角色分离**：
   - **AI User**：负责提出指令、定义目标、评判结果
   - **AI Assistant**：负责理解指令、执行任务、返回结果
   - 严格的角色边界防止"角色翻转"（双方互相推诿或都等对方行动）

2. **Inception Prompting 递归提示**：
   - 将任务描述、角色定义、通信协议、终止条件**嵌入 Agent 的系统提示中**

（**换底正文在此截断** —— 完整卡正文共 325 行，本页内联到第 20 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 19 条 —— **其余 13 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 19 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 13 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"To address the challenges of achieving autonomous cooperation, we propose a novel communicative agent framework named role-playing . Our approach involves using inception prompting to guide chat agents toward task completion while maintaining consistency with human intentions."
> 出处：2303.17760 Abstract

> 原文:"This paper explores the potential of building scalable techniques to facilitate autonomous cooperation among communicative agents and provide insight into their “cognitive” processes."
> 出处：2303.17760 Abstract

### B. 三机制之一：Role-Playing 角色分离（对应 ①机制 1「AI User / AI Assistant」）

> 原文:"Our proposed framework is a novel role-playing approach for studying multiple communicative agents. Specifically, we concentrate on task-oriented role-playing that involves one AI assistant and one AI user. After the multi-agent system receives a preliminary idea and the role assignment from human users, a task-specifier agent will provide a detailed description to make the idea specific and then the AI assistant and AI user will cooperate on completing the specified task through multi-turn conversations until the AI user determines the task is done."
> 出处：2303.17760 §3.1 Role-playing Framework

> 原文:"The AI user is responsible for giving instructions to the AI assistant and directing the conversation toward task completion. On the other hand, the AI assistant is designed to follow the instructions from the AI user and respond with specific solutions."
> 出处：2303.17760 §3.1 Role-playing Framework

> 原文:"After the role assignment is completed, the AI assistant $\mathcal{A}$ and AI user $\mathcal{U}$ will collaborate in an instruction-following manner to accomplish the task. In the AI assistant-user scenario, the AI user is responsible for providing instructions, and the assistant is expected to respond with a solution that fulfills the instructions."
> 出处：2303.17760 §3.1 Role-playing Framework（Conversation Towards Task-Solving）

> 原文:"After the task specification, The AI assistant role and the AI user role will be assigned to the user agent and the assistant agent correspondingly to complete the specified task. In practice, a system message is passed to each agent declaring roles to each."
> 出处：2303.17760 §3.1 Role-playing Framework（AI Assistant-User Role Assignment）

### C. 三机制之二：Inception Prompting 递归提示（对应 ①机制 2）

## 输入 / 输出契约

**输入**：用户评论文本（Amazon/Trustpilot/Zendesk）、产品品类信息，以及明确的分析目标（如找出某产品的 Top 3 负面驱动因素）。

**输出**：一次对话产出的多维度评论洞察（重要属性、负面驱动因素、改进优先级）；供产品与运营团队使用。

## 执行步骤

1. 设定业务视角与数据视角两个角色及任务提示
2. 用 Inception Prompting 让双方自主推进对话
3. 在每轮中交换抽取结果与业务解读
4. 收敛输出多维洞察与优先级结论

## 边界与不做

- 数据不满足：评论样本量过小或品类信息缺失时洞察不稳，先补样本。
- 何时不用：需要中央调度与角色分工用「AutoGen」；需要 SOP 与统一产出格式用「MetaGPT」；要按任务形态动态选拓扑用「任务自适应拓扑路由」。
- 能力边界：只做洞察产出，不执行动作；对话可能发散，需要轮数上限与目标收敛条件。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-CAMEL-Role-Playing-Agents

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-CAMEL-Role-Playing-Agents`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（27 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`）。

- 论文：2303.17760
- 标题：CAMEL: Communicative Agents for “Mind” Exploration of Large Scale Language Model Society
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`）。
>
> - 论文：2303.17760
> - 标题：CAMEL: Communicative Agents for “Mind” Exploration of Large Scale Language Model Society
> - venue 档位：CCF-A
> - 证据基础：paper-verbatim
>
> - 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2303.17760
> > - 标题：CAMEL: Communicative Agents for “Mind” Exploration of Large Scale Language Model Society
> > - venue 档位：CCF-A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2303.17760
> > > - 标题：CAMEL: Communicative Agents for “Mind” Exploration of Large Scale Language Model Society
> > > - venue 档位：CCF-A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-CAMEL-Role-Playing-Agents`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2303.17760
> > > > - 标题：CAMEL: Communicative Agents for “Mind” Exploration of Large Scale Language Model Society
> > > > - venue 档位：CCF-A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2303.17760 — CAMEL: Communicative Agents for "Mind" Exploration of Large Language Model Society
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
