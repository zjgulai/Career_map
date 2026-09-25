---
name: "p2s-orchestration-trace-rl"
title: "编排轨迹驱动的强化学习 — MAS RL 三维设计框架"
description: "触发词：编排轨迹、强化学习、credit 分配、动态生成子 Agent、工单分级。何时不用：不想训练、只用规则选拓扑用「任务自适应拓扑路由」；要可靠调度与失败恢复用「MAS Orchestrator」。安全边界：策略上线前必须人工审核动作空间与话术边界，不得让强化学习决策绕过合规话术或审批环节。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-Orchestration-Trace-RL"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2605.02801"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Orchestration-Trace-RL"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Orchestration-Trace-RL.md"
rebase_source_sha256: "f7be18ec5b41599e982e7ac3e217c2ff2602831cfbde57ea66f360a85c0e91eb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "f7be18ec5b41599e982e7ac3e217c2ff2602831cfbde57ea66f360a85c0e91eb"
rebase_full_card_bytes: "23708"
rebase_full_card_lines: "454"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "1fab7401d4716cfac13fa5436b016a17e7d9398a5489fe49c1b207f47cb7633e"
user_summary: "用历史编排轨迹训练编排策略，让简单工单少生成子 Agent、复杂工单多找专家，成本和延迟一起降。"
user_try: "试试：用我们客服 MAS 的编排轨迹训练一版策略，看简单工单能不能少生成几个子 Agent。"
whenToUse: "当已有完整编排轨迹历史数据、愿意承担训练成本来优化生成与委派决策时用本技能；不想训练、只用规则选拓扑，用「任务自适应拓扑路由」；要稳定可靠调度，用「MAS Orchestrator」。"
workflow: "采集并结构化编排轨迹（步骤、动作类型、参与者） → 定义团队奖励（业务结果加成本与延迟惩罚） → 按 credit 分配把团队奖励分摊到步骤与 Agent → 用轨迹训练编排策略并评估成本、准确率与延迟变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "39"
rebase_evidence_quotes_complete: "false"
---
# 编排轨迹驱动的强化学习 — MAS RL 三维设计框架

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`，sha256 `f7be18ec5b41599e982e7ac3e217c2ff2602831cfbde57ea66f360a85c0e91eb`，23708 字节 / 454 行 / 39 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 39 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `1fab7401d4716cfac13fa5436b016a17e7d9398a5489fe49c1b207f47cb7633e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 编排轨迹驱动的 RL — MAS 三维设计框架与 Kimi PARL 实践

---

## ① 算法原理

### 核心思想

随着 LLM agent 从单 agent 工具调用进化为**协调团队(coordinated teams)**,RL 的优化对象不再是个体 action,而是**编排轨迹(orchestration trace)** —— 一个包含 spawn(生成)、delegate(委派)、communicate(通信)、aggregate(聚合)、stop(停止)决策的时序交互图。

本文提出**三维设计框架**:

1. **Reward Design**: 8 个奖励家族(R1-R8)
2. **Credit Assignment**: 8 个信度承载单元(team → token)
3. **Orchestration Learning**: 5 个子决策(O1-O5)

### Orchestration Trace 定义

不同于单 agent trajectory(token + tool call + observation),orchestration trace 是**时序事件图**:


（**换底正文在此截断** —— 完整卡正文共 454 行，本页内联到第 21 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 39 条 —— **其余 30 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 39 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 30 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"This paper studies RL for LLM-based multi-agent systems through orchestration traces: temporal interaction graphs whose events include sub-agent spawning, delegation, communication, tool use, return, aggregation, and stopping decisions."
> 出处：2605.02801 §Abstract（orchestration trace 的完整事件类型定义）

> 原文:"First, reward design falls into eight families; orchestration rewards target system-level properties such as parallelism speedup, split correctness, and aggregation quality."
> 出处：2605.02801 §Abstract（维度一：8 个奖励家族）

> 原文:"Second, reward and credit signals attach to eight credit- or signal-bearing units from token to team; explicit counterfactual message-level credit remains especially sparse in our curated pool, while agent-, role-, turn-, and orchestrator-level signals are beginning to fill in."
> 出处：2605.02801 §Abstract（维度二：8 个信度承载单元 + message 级最稀疏）

> 原文:"Third, orchestration learning decomposes into five sub-decisions (when to spawn, whom to delegate to, how to communicate, how to aggregate, when to stop); within our curated pool as of May 4, 2026, we found no explicit RL training method for the stopping decision."
> 出处：2605.02801 §Abstract（维度三：5 个子决策 + O5 stop 的空白声明）

> 原文:"R7 is newly central in LLM-MAS."
> 出处：2605.02801 §6.1（R7 是 LLM-MAS 最独特的奖励维度）

> 原文:"They reward system-level properties (wall-clock speedup, split correctness, finish-rate), not task-level correctness. This is where LLM-MAS RL departs most sharply from agentic RL."
> 出处：2605.02801 §6.1（R7 奖励的是系统级属性）

> 原文:"| R7 | Orchestration | per-orchestrator-decision | system metrics (speedup, finish-rate) | pseudo-parallelism; reward-shape collapse | Kimi PARL [28], Puppeteer [10], ParaManager [76], WideSeek-R1 [68] |"
> 出处：2605.02801 §6.1 表 10（R7 行：粒度 / 来源 / 主要 hack 风险 / 代表方法）

> 原文:"| R1 | Shared team / outcome | team (terminal) | verifier / ground truth | reward diffusion; free-riding | MAGRPO [37], MAPoRL [47], Dr. MAS [15], CoLLM-MAAC [38] |"
> 出处：2605.02801 §6.1 表 10（R1 行）

> 原文:"| R8 | Hybrid local–global | mixed | weighted composition of R1–R7 | weight drift; signal drowning | SHARP [31], M-GRPO [19], HERA [30], LangMARL [71], Agent Q-Mix [23] |"
> 出处：2605.02801 §6.1 表 10（R8 行）

## 输入 / 输出契约

**输入**：完整编排轨迹历史（含生成、委派、通信、聚合、停止决策的时序记录）、每步结果与最终业务结果（用于奖励计算）；卡页口径下数据要求高。

**输出**：训练后的编排策略与 credit 分配结果（各 Agent 与步骤对团队奖励的贡献）；供 MAS 编排器上线使用。

## 执行步骤

1. 采集并结构化编排轨迹（步骤、动作类型、参与者）
2. 定义团队奖励（业务结果加成本与延迟惩罚）
3. 按 credit 分配把团队奖励分摊到步骤与 Agent
4. 用轨迹训练编排策略并评估成本、准确率与延迟变化

## 边界与不做

- 数据不满足：没有足够完整的编排轨迹历史时无法训练，先用规则编排积累数据。
- 何时不用：只用规则决定拓扑用「任务自适应拓扑路由」；要可靠调度与失败恢复用「MAS Orchestrator」；缺乏算力与数据的小团队不要上强化学习。
- 能力边界：产出编排策略与判据，不做执行器，也不保证跨业务域的迁移效果。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **延伸**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Context-Compression.html、Skill-Context-Compression、Skill-Orchestration-Trace-RL

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-Orchestration-Trace-RL`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（59 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`）。

- 论文：2605.02801
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`）。
>
> - 论文：2605.02801
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2605.02801
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2605.02801
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Orchestration-Trace-RL`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2605.02801
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2605.02801，但该号在 arXiv 上是《Reinforcement Learning for LLM-based Multi-Agent Systems through Orchestration Traces》，与本卡主题无关。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
