---
name: "p2s-mcp-a2a-protocol-stack"
title: "MCP + A2A 双协议栈 — Orchestrated Multi-Agent 企业架构"
description: "触发词：MCP协议、A2A协议、多Agent编排、工具注册、Agent互调。何时不用：只有单个 Agent、只需决定要不要调工具时用工具调用决策技能；只审计工具描述质量时用工具描述审核技能。安全边界：跨 Agent 消息须限定在已注册的信任域与工具白名单内，涉及用户数据与合规判定的请求不得绕过治理通道。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 集成验证"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
quality_tier: "curated"
p2s_card_id: "Skill-MCP-A2A-Protocol-Stack"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2601.13671"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MCP-A2A-Protocol-Stack"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-MCP-A2A-Protocol-Stack.md"
rebase_source_sha256: "c2bbd6909b4181f7c65afa1a61845a34cdbf4abc2f72743cd119466e21240a6c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c2bbd6909b4181f7c65afa1a61845a34cdbf4abc2f72743cd119466e21240a6c"
rebase_full_card_bytes: "15167"
rebase_full_card_lines: "357"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "6d6db9c203eb20a0626b70393fde0017c55a5ff8929be17bf1caca57b98fed2e"
user_summary: "用一套标准协议把工具接进 Agent、让 Agent 之间能互相派活，把多平台多角色的客服体系搭起来。"
user_try: "试试：帮我把这 5 个平台的 API 按 MCP 注册成工具，并设计客服多 Agent 之间的 A2A 派活与质检路径。"
whenToUse: "需要统一工具接入协议并让多个 Agent 协作编排时用本技能；只有单个 Agent 判断要不要调工具，用工具调用决策技能。"
workflow: "把平台 API 注册为 MCP 工具 → 为每个 Agent 建立 MCP Server 与工具处理器 → 定义 A2A 消息结构 → 按意图与注册表实现 Agent 间路由 → 接入质检、合规、升级三类治理通道"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "11"
rebase_evidence_quotes_complete: "false"
---
# MCP + A2A 双协议栈 — Orchestrated Multi-Agent 企业架构

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`，sha256 `c2bbd6909b4181f7c65afa1a61845a34cdbf4abc2f72743cd119466e21240a6c`，15167 字节 / 357 行 / 11 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 11 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `6d6db9c203eb20a0626b70393fde0017c55a5ff8929be17bf1caca57b98fed2e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: MCP + A2A 双协议栈 — Orchestrated MAS 企业架构

---

## ① 算法原理

### 核心思想

**The Orchestration of Multi-Agent Systems** 把 LLM Agent 系统的演化分三阶段:**单 Agent → 松耦合多 Agent → orchestrated 多 Agent**。论文的核心贡献是把"orchestration"形式化为四层架构 + 两类协议:

**4 层编排架构**(orchestration layer):

1. **A. Planning & Policy Management**:任务分解 + 治理约束
2. **B. Execution & Control Management**:任务调度 + 并发管理 + 遥测收集
3. **C. State & Knowledge Management**:状态总线 + 上下文知识库
4. **D. Quality & Operations Management**:输出验证 + 监控 + 沙箱测试

**3 类专用 Agent**:


（**换底正文在此截断** —— 完整卡正文共 357 行，本页内联到第 20 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 11 条 —— **其余 1 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 11 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 1 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Agentic systems have evolved from single agents that perform narrow tasks, to loosely coupled multi-agent setups, and now to orchestrated collectives where coordination ensures consistency, scale, and reliability."
> 出处：2601.13671 §X Conclusion
>
> 原文:"In a multi-agent system, specialized agents are autonomous components designed to perform narrowly scoped, role-specific tasks within the broader architecture. Each agent typically incorporates a large language model as its cognitive core, enabling it to perceive inputs, reason about them, and act within clearly defined operational boundaries."
> 出处：2601.13671 §IV Specialized Agents
>
> 原文:"Collectively, these mechanisms show that reliability in multi-agent systems arises not only from intelligent agents but from the orchestration layer that governs planning, execution, and validation, enabling scalable and policy-compliant performance."
> 出处：2601.13671 §V-E Closing Discussion
>
> 原文:"As illustrated in Fig. 3, MCP mediates every external invocation through a defined interface that enforces schema consistency, access control, and auditability."
> 出处：2601.13671 §VI-A Model Context Protocol
>
> 原文:"Together, MCP and A2A form the dual foundation of agent communication—MCP for tool access and A2A for peer collaboration"
> 出处：2601.13671 §VI-B Agent-to-Agent Protocol
>
> 原文:"Robust security controls, including cryptographic signing and role-based routing, guarantee message integrity and policy compliance."
> 出处：2601.13671 §VI-B Agent-to-Agent Protocol
>
> 原文:"For example, autonomous agents studied in [15] now parse insurance applications and supporting documents with over 95% accuracy, enabling much faster policy issuance."
> 出处：2601.13671 §VIII-A Banking, Financial Services and Insurance
>
> 原文:"In another use-case explored in [15], a mortgage lender integrated Document AI and Decision AI agents to handle loan paperwork, achieving a 20× faster approval process while cutting processing costs by 80%."
> 出处：2601.13671 §VIII-A Banking, Financial Services and Insurance
>
> 原文:"In practice, this approach led to over a 50% reduction in development time and effort for early-adopter teams at the bank."
> 出处：2601.13671 §VIII-B Software Engineering and IT Modernization
>
> 原文:"Studies suggest that up to 80% of common support incidents could be resolved by AI agents without human intervention, cutting resolution times by 60–90% in fully agent-driven workflows."
> 出处：2601.13671 §VIII-C Cross Industry Adoption
>

## 输入 / 输出契约

**输入**：各平台 API 或已有工具的接口定义（OpenAPI 或 MCP schema）、Agent 角色清单与治理要求（质检、合规、升级），粒度到单个工具与单条 A2A 消息。

**输出**：MCP 工具注册表、A2A 消息与路由结果，以及多 Agent 编排骨架实现，供平台架构师搭建企业级 MAS。

## 执行步骤

1. 把平台 API 的接口定义注册成 MCP 工具
2. 为每个 Agent 部署 MCP Server 并挂载工具处理器
3. 定义 A2A 消息结构与意图字段
4. 实现按意图的 Agent 间路由
5. 接入质检、合规与升级三类治理通道

## 边界与不做

- 只有单个 Agent、不需要跨 Agent 协作时不必引入；缺少可机读的接口定义时无法注册工具。
- 本技能产出协议栈骨架与注册契约，不对接真实生产鉴权、限流与审计系统。

## 技能关联

- **前置**：Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **可组合**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit、Skill-MCP-A2A-Protocol-Stack

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：16-智能体工程　·　源卡：`Skill-MCP-A2A-Protocol-Stack`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（54 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`）。

- 论文：2601.13671
- 标题：The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：11 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`）。
>
> - 论文：2601.13671
> - 标题：The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：11 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2601.13671
> > - 标题：The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：11 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2601.13671
> > > - 标题：The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：11 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-MCP-A2A-Protocol-Stack`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2601.13671
> > > > - 标题：The Orchestration of Multi-Agent Systems: Architectures, Protocols, and Enterprise Adoption
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：11 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2507.21105 — AgentMaster: A Multi-Agent Conversational Framework Using A2A and MCP Protocols for Multimodal Information Retrieval and Analysis
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
