---
name: "p2s-mas-orchestrator"
title: "MAS Orchestrator — 多智能体编排与调度"
description: "触发词：DAG 调度、并发编排、失败恢复、超时重试、进度可视化。何时不用：运行时依据中间结果改拓扑用「Dynamic DAG Orchestration」；状态机级非法操作拦截用「SDOF 状态机约束编排」。安全边界：编排层只按既定 DAG 与重试策略调度，不得自行扩权、跳过审批节点或改动作范围。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 失败恢复"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-MAS-Orchestrator"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MAS-Orchestrator"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-MAS-Orchestrator.md"
rebase_source_sha256: "847ffd034aa1fee03bf58b7bdb0ff6fd04d3109137607f45031698e1c8dbdbf0"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "847ffd034aa1fee03bf58b7bdb0ff6fd04d3109137607f45031698e1c8dbdbf0"
rebase_full_card_bytes: "9375"
rebase_full_card_lines: "280"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "56e804dedd3e61e1a845c8f046e4744162f50923bfe08bccb95149fd680ec33a"
user_summary: "把几十个并行子任务按 DAG 可靠跑完，部分失败自动恢复，全程进度可查。"
user_try: "试试：把全品类 VOC 分析拆成 8 个并行子任务加 2 个汇总任务，编排执行并在部分失败时自动恢复。"
whenToUse: "当多子任务需要可靠编排（并发、超时、重试、失败恢复）时用本技能；需要在运行时依据中间结果改拓扑，用「Dynamic DAG Orchestration」；需要状态机级非法操作拦截，用「SDOF 状态机约束编排」。"
workflow: "接收执行 DAG 并解析节点依赖 → 按依赖做并发或串行调度并下发子 Agent → 按策略对超时或失败节点重试或降级 → 汇总子任务结果并输出进度与状态"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# MAS Orchestrator — 多智能体编排与调度

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`，sha256 `847ffd034aa1fee03bf58b7bdb0ff6fd04d3109137607f45031698e1c8dbdbf0`，9375 字节 / 280 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `56e804dedd3e61e1a845c8f046e4744162f50923bfe08bccb95149fd680ec33a`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: MAS Orchestrator — 多智能体编排与调度

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想

**MAS Orchestrator** 是多 Agent 系统的"中枢神经系统"，负责协调多个子 Agent 的执行顺序、数据流转、状态同步和错误恢复。核心洞察：**分解后的子任务需要一个可靠的调度器来管理它们的生命周期——启动、监控、通信、容错、收尾**。

Orchestrator 的五大职责：

1. **生命周期管理**：启动子 Agent、监控执行状态、处理完成/失败事件
2. **数据流转**：管理子 Agent 间的输入/输出传递（消息总线）
3. **状态同步**：维护全局执行状态，支持断点续传和进度查询
4. **错误处理**：失败重试、降级策略、超时控制、死锁检测
5. **资源调度**：子 Agent 并发度控制、优先级调度、资源配额管理

### 执行模型

### 关键假设

1. **DAG 无环**：子任务依赖图必须是无环的
2. **状态可观测**：子 Agent 的执行状态可以被外部查询
3. **失败可恢复**：失败的子任务可以被重试或降级
4. **消息可靠传递**：子 Agent 间的数据传递可靠

---

## ② 母婴出海应用案例

### 场景一：全品类 VOC 分析流水线编排

**业务问题**：

全品类 VOC 分析涉及 8 个并行子任务（各品类分析）+ 2 个串行汇总任务。需要可靠地编排执行、处理部分失败、汇总结果。

**数据要求**：

- Subagent Decomposer 生成的执行 DAG
- 各子 Agent 的配置（技能、资源配额）
- 超时和重试策略配置

**预期产出**：

**业务价值**：
- 复杂流水线可靠执行，无需人工监控
- 部分失败自动恢复，不影响整体进度
- 执行过程可视化，进度可查询

---

### 场景二：实时 VOC 预警流水线

**业务问题**：

需要实时监控评论数据流，当某个品类的负面率突增时，自动触发分析流水线（抽取 → 根因分析 → 预警生成 → 通知发送），要求在 5 分钟内完成。

**数据要求**：

- 实时评论数据流（Kafka / 消息队列）
- 预警触发规则
- 各阶段子 Agent 配置
- 通知渠道配置

**预期产出**：

**业务价值**：
- 质量问题从"事后发现"变为"实时预警"
- 响应时间从 1-2 天缩短到 3 分钟
- 预警准确率随反馈持续优化

---

（**换底正文在此截断** —— 完整卡正文共 280 行，本页内联到第 165 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：执行 DAG（节点与依赖）、各子 Agent 配置（技能、资源配额）、超时与重试策略配置。

**输出**：执行状态与结果汇总（含部分失败恢复记录）与可视化进度；供运营与工程团队监控复杂流水线。

## 执行步骤

1. 接收执行 DAG 并解析节点依赖
2. 按依赖做并发或串行调度并下发子 Agent
3. 对超时与失败节点按策略重试或降级
4. 汇总子任务结果并输出进度与状态

## 边界与不做

- 数据不满足：没有 DAG 定义与子 Agent 配置时无法编排，先补契约。
- 何时不用：运行时动态改拓扑用「Dynamic DAG Orchestration」；状态合法性拦截用「SDOF 状态机约束编排」；单 Agent 可完成的任务不必引入编排层。
- 能力边界：承载调度规则与容错契约，不做执行器，也不替代各子 Agent 的产出质量。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-MAS-Orchestrator

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-MAS-Orchestrator`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`）。
>
> - venue 档位：non-paper
> - 证据基础：author-practice
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`）。
> >
> > - venue 档位：non-paper
> > - 证据基础：author-practice
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`）。
> > >
> > > - venue 档位：non-paper
> > > - 证据基础：author-practice
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-MAS-Orchestrator`（完整卡：`references/full-card.md`）。
> > > >
> > > > - venue 档位：non-paper
> > > > - 证据基础：author-practice
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2308.00352，但该号在 arXiv 上是《MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework》，与本卡主题无关。
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Temporal: Reliable Workflows at Scale》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
