---
name: "p2s-open-source-tool-use-model"
title: "开源 Tool Use 基座模型选型 — Hermes 4 混合推理家族"
description: "触发词：开源基座模型、Tool Use、本地部署、数据主权、API 成本。何时不用：只把简单 tool call 交给小模型省钱走「SLM Tool Calling 优化」；按任务在模型间路由走「上下文感知模型路由」。安全边界：自部署须落实数据不出境与访问审计，模型输出不得绕过人工复核直接对客执行。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-150"
l3_business: "容量管理"
l3_all: "容量管理 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/容量管理"
quality_tier: "curated"
p2s_card_id: "Skill-Open-Source-Tool-Use-Model"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2508.18255"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Open-Source-Tool-Use-Model"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Open-Source-Tool-Use-Model.md"
rebase_source_sha256: "1ac7ab2efe9d58d466552319a0fd7cf6feaf23d1249b640f1cf5e9d5f9be3bee"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "1ac7ab2efe9d58d466552319a0fd7cf6feaf23d1249b640f1cf5e9d5f9be3bee"
rebase_full_card_bytes: "23434"
rebase_full_card_lines: "493"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "bf1b01d7bf8c7a4e470564ebb3f505921602cdd9013a5026c980a5f4b02fec1c"
user_summary: "API 账单随工单量暴涨、数据又不能出境时，换成开源基座模型本地部署，成本大降还能保住数据主权。"
user_try: "试试：我们客服 Agent 每月 API 成本很高，帮我评估换成开源 70B 本地部署的方案。"
whenToUse: "当 API 成本高、数据出境受限或需要领域继续预训练时用；若只是把简单 tool call 交给小模型省钱，用「SLM Tool Calling 优化」；若要在多个模型间按任务路由，用「上下文感知模型路由」。"
workflow: "梳理现有 Agent 的 tool use 需求与调用量 → 对比开源模型家族的参数规模与推理格式 → 用 vLLM 或 llama.cpp 本地部署并压测延迟 → 迁移 prompt 与 tool call 格式并做效果回归 → 核算成本、合规与维护开销后决定切换范围"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "11"
rebase_evidence_quotes_total: "48"
rebase_evidence_quotes_complete: "false"
---
# 开源 Tool Use 基座模型选型 — Hermes 4 混合推理家族

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`，sha256 `1ac7ab2efe9d58d466552319a0fd7cf6feaf23d1249b640f1cf5e9d5f9be3bee`，23434 字节 / 493 行 / 48 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 11 条（共 48 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `bf1b01d7bf8c7a4e470564ebb3f505921602cdd9013a5026c980a5f4b02fec1c`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 开源 Tool Use 基座模型选型 — Hermes 4 混合推理家族

---

## ① 算法原理

### 核心思想

**Hermes 4** 是 Nous Research 发布的开源权重混合推理模型家族,核心贡献是证明**开源模型可以通过系统性后训练(pipeline)达到接近闭源前沿模型的 tool use 和推理能力**。

"混合推理"(hybrid reasoning)指模型同时具备:
- **结构化多轮推理**:通过 `<think>` / `</think>` 标签包裹推理链,支持动态计算分配
- **广泛指令遵循**:非推理任务不强制触发 reasoning,减少 token 浪费

### 模型家族

| 模型 | 基座 | 规模 | 定位 | 关键分数(R/N) |

（**换底正文在此截断** —— 完整卡正文共 493 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 11 / 全 48 条 —— **其余 37 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 48 条逐字引文。本页按完整卡顺序内联**前 11 条整条引文**（不在引文中间断开）；其余 37 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"We present Hermes 4, a family of hybrid reasoning models that combine structured, multi-turn reasoning with broad instruction-following ability."
> 出处：2508.18255 §Abstract（「混合推理」的原文定义）

> 原文:"Together, these contributions demonstrate how open-weight reasoning models can be effectively trained and rigorously evaluated, yielding models that are comparable to frontier systems while remaining transparent and reproducible."
> 出处：2508.18255 §1 Introduction（开源模型接近前沿的核心论断）

> 原文:"The Hermes 4 dataset consists primarily of newly synthesized reasoning and non-reasoning data, totaling approximately 5 million samples and 19 billion tokens."
> 出处：2508.18255 §2 Post-training Data（5M 样本 / 19B tokens）

> 原文:"The dataset is a composite of 3.5 million reasoning samples and 1.6 million non-reasoning samples."
> 出处：2508.18255 §2（3.5M reasoning + 1.6M non-reasoning）

> 原文:"A significant portion of the Hermes 3 [51] dataset3 was retained to ensure continuity in the model’s capabilities."
> 出处：2508.18255 §2（保留 Hermes 3 数据以维持能力连续性；"dataset3" 是底本 PDF 的脚注粘连，逐字照录）

> 原文:"The reasoning samples were intentionally token-heavy, with an average of five times more tokens per sample than their non-reasoning counterparts, accommodating thinking traces up to 16 thousand tokens long."
> 出处：2508.18255 §2（reasoning 样本约为非推理的 5 倍 token、thinking trace 最长 16k）

> 原文:"We process pre-training seed data through a graph-based synthetic data generator called DataForge."
> 出处：2508.18255 §2.1 DataForge

> 原文:"Inspired by AgentInstruct [31] , DataForge generates conversational data across a wide variety of tasks."
> 出处：2508.18255 §2.1（DataForge 的灵感来源 AgentInstruct）

> 原文:"Each datapoint is generated via a random walk through a directed acyclic graph (DAG) where each node implements a struct → struct map."
> 出处：2508.18255 §2.1（图-based DAG 合成）

> 原文:"We draw seed data from a biased sample of DCLM [22] and FineWeb [42], preferring more recent samples."
> 出处：2508.18255 §2.1.1（seed passage 来自 DCLM / FineWeb）

> 原文:"we might condition on a Wikipedia article from the pre-training data and transform it into a rap song"
> 出处：2508.18255 §2.1.2（Passage Transformation：Wikipedia → rap song）

## 输入 / 输出契约

**输入**：需现有 Agent 的 tool 定义与调用日志、月调用量与 Token 规模（卡页示例月度 100k 工单、5B tokens）、部署算力与合规要求，调用级粒度；卡页称数据要求低，用开源权重不需训练数据。

**输出**：产出选型与部署方案、成本与延迟对照（卡页记录成本 -99%、本地 14B 推理比 API 快 3-5 倍）、数据不出境的合规说明，供技术负责人决策。

## 执行步骤

1. 梳理现有 Agent 的 tool 定义、调用量与成本结构
2. 对比候选开源模型的参数规模与 tool use 能力
3. 完成本地部署与延迟压测（vLLM 或 llama.cpp）
4. 迁移 prompt 与 tool call 格式并做效果回归
5. 核算成本、数据合规与维护开销后确定切换范围

## 边界与不做

- 调用量小、API 成本占比低时，自建推理集群的运维投入不划算
- 只做选型评估与部署方案，模型效果回归与格式适配仍需工程实施
- 涉跨境客户数据时须落实本地化部署与访问审计
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Open-Source-Tool-Use-Model.html、Skill-Open-Source-Tool-Use-Model
- **延伸**：Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Open-Source-Tool-Use-Model

---

> 分类：数据与Agent平台/数据与AI运行/容量管理　·　技术族：16-智能体工程　·　源卡：`Skill-Open-Source-Tool-Use-Model`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（49 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`）。

- 论文：2508.18255
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：48 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`）。
>
> - 论文：2508.18255
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：48 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2508.18255
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：48 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2508.18255
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：48 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Open-Source-Tool-Use-Model`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2508.18255
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：48 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2508.18255 — Hermes 4 Technical Report
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
