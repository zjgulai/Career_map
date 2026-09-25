---
name: "p2s-active-context-pruning"
title: "仿生粘菌主动上下文剪枝 — Focus Agent 自主压缩架构"
description: "触发词：上下文剪枝、主动压缩、Token降本、相关性排序、长会话工具结果。何时不用：单轮短会话或上下文远未触及上限时不必要；需要跨会话记忆沉淀走Agent记忆类技能。安全边界：剪枝须保留客户身份、品牌与决策依据等关键信息，不得剪掉结论所依赖的证据，准确率须内部评测通过后再放量。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Active-Context-Pruning"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2601.07190"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Active-Context-Pruning"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Active-Context-Pruning.md"
rebase_source_sha256: "49c3c9feb6ed653714b6eb9096abd2c4703859ed8298f5cf4a2af0d4f9c6278e"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "49c3c9feb6ed653714b6eb9096abd2c4703859ed8298f5cf4a2af0d4f9c6278e"
rebase_full_card_bytes: "15461"
rebase_full_card_lines: "336"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "b5ec538068699190884fbb36a535bb9b26748c5acbe7477bcef17cc995c2169b"
user_summary: "把 Agent 长会话里堆积的工具结果按相关性主动压缩，省下 token 成本又不丢掉关键结论。"
user_try: "试试：客服 agent 每轮都查订单、批次、物流和关税，上下文累积到 5 万 token，帮我剪枝保留关键信息。"
whenToUse: "当长会话上下文被中间工具结果撑大、需要按相关性主动压缩时用本卡；需要把历史知识持久化到跨会话记忆用 Agent 记忆类技能；需要按查询复杂度决定是否检索用自适应路由技能。"
workflow: "统计上下文各条目 token 总量与上限 → 按相关性分数对条目排序 → 在保留预算内保留高相关条目 → 把被剪枝条目压缩成摘要回填 → 输出精简上下文与压缩摘要"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "11"
rebase_evidence_quotes_total: "12"
rebase_evidence_quotes_complete: "false"
---
# 仿生粘菌主动上下文剪枝 — Focus Agent 自主压缩架构

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`，sha256 `49c3c9feb6ed653714b6eb9096abd2c4703859ed8298f5cf4a2af0d4f9c6278e`，15461 字节 / 336 行 / 12 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 11 条（共 12 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `b5ec538068699190884fbb36a535bb9b26748c5acbe7477bcef17cc995c2169b`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 主动上下文剪枝 — Focus 仿生粘菌自主压缩架构

---

## ① 算法原理

### 核心思想

**Focus** 借鉴 **Physarum polycephalum**(多头绒泡菌,俗称粘菌)的探索-收缩策略,把 LLM agent 从被动 "append-only" 模式升级为主动 "explore → compress → withdraw" 模式:

- **生物类比**:粘菌探索迷宫时不保留每条肌肉运动的轨迹,只保留"地图学习";它会主动撤回死胡同里的伪足,同时留下化学痕迹避免重复探索。
- **Agent 类比**:agent 不需要记住 10 分钟前 `ls -R` 输出的 50 行内容,只需要记住"配置文件不在 /src 目录里"。

### 与已有方案的差异

| 方案 | 控制方 | 时机 | 状态保留 |
|------|--------|------|---------|

（**换底正文在此截断** —— 完整卡正文共 336 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 11 / 全 12 条 —— **其余 1 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 12 条逐字引文。本页按完整卡顺序内联**前 11 条整条引文**（不在引文中间断开）；其余 1 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"22.7% Token Savings with Equal Accuracy: On 5 context-intensive SWE-bench instances, Focus reduced total tokens from 14.9M to 11.5M while matching Baseline accuracy (3/5 = 60%)."
> 出处：2601.07190 §VI Conclusion
>
> 原文:"Focus achieved 22.7% total token reduction (14.9M $\rightarrow$ 11.5M) while maintaining identical accuracy to Baseline (3/5 = 60% for both)."
> 出处：2601.07190 §IV-D Key Findings, Finding 1
>
> 原文:"Initial experiments showed passive Focus prompting yielded only 1-2 compressions per task with marginal (6%) token savings."
> 出处：2601.07190 §IV-B Aggressive Compression Prompting
>
> 原文:"Structured phases: Explicit guidance to use 4-6 focus phases"
> 出处：2601.07190 §IV-B Aggressive Compression Prompting
>
> 原文:"Focus averaged 6.0 compressions per task (vs. 2.0 with passive prompting), dropping 70.2 messages per task."
> 出处：2601.07190 §IV-D Key Findings, Finding 3
>
> 原文:"On matplotlib-26020, both agents passed the test suite, but Focus achieved 57% token savings (4.0M $\rightarrow$ 1.7M)."
> 出处：2601.07190 §IV-E Case Study: Maximum Savings (matplotlib-26020)
>
> 原文:"On pylint-7080, Focus used 110% more tokens than Baseline (4.3M vs. 2.1M), yet both agents passed the test suite."
> 出处：2601.07190 §IV-F Case Study: When Compression Adds Overhead (pylint-7080)
>
> 原文:"Our earlier experiments with passive Focus prompting showed accuracy degradation (60% vs. 80%)."
> 出处：2601.07190 §IV-G Analysis
>
> 原文:"Instances requiring extensive codebase navigation (matplotlib, sympy) showed 50-57% savings"
> 出处：2601.07190 §IV-G Analysis
>
> 原文:"Focus showed 50-57% savings on exploration-heavy tasks but 110% overhead on one iterative refinement task."
> 出处：2601.07190 §V-C Limitations
>
> 原文:"For tasks with 50+ tool calls (common in SWE-bench), this amortization strongly favors compression."
> 出处：2601.07190 §V-A The Cognitive Tax of Compression

## 输入 / 输出契约

**输入**：上下文条目列表（每条含内容、token 数、相关性分数），加当前查询，以及最大 token 上限（如 8000）与保留比例（如 0.4）等配置参数；低数据要求，不需要训练数据。

**输出**：剪枝后保留的上下文条目与压缩摘要（说明压缩了几条历史），供 Agent 继续推理，附带 token 消耗与响应延迟的改善幅度。

## 执行步骤

1. 统计上下文各条目的 token 总量并判断是否超过上限
2. 按相关性分数对条目排序
3. 在保留 token 预算内保留高相关条目
4. 把超预算条目剪枝并压缩为摘要回填
5. 输出精简后的上下文与压缩摘要
6. 对比剪枝前后的 token 消耗与响应延迟

## 边界与不做

- 何时不用：单轮短会话、上下文远未接近上限时不必要；需要跨会话知识沉淀时应改用记忆管理类技能。
- 能力边界：只产出剪枝规则与压缩产物，token 上限与保留比例由工程侧配置；论文实证准确率无退步，内部上线前仍须自测验证。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Context-Compression.html、Skill-Context-Compression、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Active-Context-Pruning

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Active-Context-Pruning`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（42 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`）。

- 论文：2601.07190
- 标题：Active Context Compression: Autonomous Memory Management in LLM Agents
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`）。
>
> - 论文：2601.07190
> - 标题：Active Context Compression: Autonomous Memory Management in LLM Agents
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2601.07190
> > - 标题：Active Context Compression: Autonomous Memory Management in LLM Agents
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2601.07190
> > > - 标题：Active Context Compression: Autonomous Memory Management in LLM Agents
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Active-Context-Pruning`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2601.07190
> > > > - 标题：Active Context Compression: Autonomous Memory Management in LLM Agents
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2601.07190 — Active Context Compression: Autonomous Memory Management in LLM Agents
> > > > > ⚠️ 该号被 3 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
