---
name: "p2s-tool-description-audit"
title: "MCP Tool 描述质量审核 — 六维 Smell 扫描与动态路由"
description: "触发词：工具描述审核、MCP工具质量、Smell扫描、参数说明、示例补全。何时不用：工具描述没问题、只需决定调不调用时用工具调用决策技能；工具还没接入注册表时用工具自动发现技能。安全边界：审核结论只用于改进描述与路由，不得据此删除或改写生产工具的对外契约。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
quality_tier: "curated"
p2s_card_id: "Skill-Tool-Description-Audit"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2602.14878"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Tool-Description-Audit"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Tool-Description-Audit.md"
rebase_source_sha256: "4a1bf8364ac4e74d8ab8bf08707eff4221d5245655c488376a589c8711d4937e"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "4a1bf8364ac4e74d8ab8bf08707eff4221d5245655c488376a589c8711d4937e"
rebase_full_card_bytes: "15874"
rebase_full_card_lines: "369"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "fe9dd81f1dd8fdf5f5aa946d7bb272f6041f7883a25cec193d3995e07d59fe2a"
user_summary: "像查代码坏味道一样扫描工具描述，找出说不清用途、边界和参数的条目，让 Agent 少选错工具。"
user_try: "试试：帮我把这批 MCP 工具的 description 过一遍六维扫描，列出每条工具的 smell 和修改建议。"
whenToUse: "Agent 经常选错工具或传错参数、怀疑是描述质量问题时用本技能；工具找不到、需要先接入注册，用工具自动发现技能。"
workflow: "收集工具的名称、用途、参数、约束、示例、副作用与返回说明 → 按六维给每条描述打分并标注 smell → 定位缺失使用指南与未声明限制的工具 → 给出改写建议并按质量分用于路由排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "12"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "false"
---
# MCP Tool 描述质量审核 — 六维 Smell 扫描与动态路由

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`，sha256 `4a1bf8364ac4e74d8ab8bf08707eff4221d5245655c488376a589c8711d4937e`，15874 字节 / 369 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 12 条（共 17 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `fe9dd81f1dd8fdf5f5aa946d7bb272f6041f7883a25cec193d3995e07d59fe2a`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: MCP Tool 描述质量审核 — 六维 Smell 扫描与动态路由

---

## ① 算法原理

### 核心思想

Queen's University 2026 年的大规模实证研究揭示：**97.1% 的 MCP tool 描述至少含有一个 smell**，这些描述缺陷直接导致 FM 选错工具、传错参数或产生不必要的交互步骤。论文提出**六维评分 rubric + 动态组件路由**，在提升 agent 准确率 (+5.85pp) 的同时控制 token 开销 (+67.46% steps 的 trade-off)。

**研究规模**: 103 个 MCP servers, 856 个 tools

### Tool Description 的六组件模型

论文将 MCP tool 描述分解为六个互补组件：

| 组件 | 角色 | 作用 |

（**换底正文在此截断** —— 完整卡正文共 369 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 12 / 全 17 条 —— **其余 5 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 17 条逐字引文。本页按完整卡顺序内联**前 12 条整条引文**（不在引文中间断开）；其余 5 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"we conduct the first large-scale empirical study of 856 tools spread across 103 MCP servers, assessing their description quality and their impact on agent performance."
> 出处：2602.14878 Abstract
>
> 原文:"we find that 97.1% of the analyzed tool descriptions contain at least one smell, with 56% failing to state their purpose clearly."
> 出处：2602.14878 Abstract
>
> 原文:"While augmenting these descriptions for all components improves task success rates by a median of 5.85 percentage points and improves partial goal completion by 15.12%, it also increases the number of execution steps by 67.46% and regresses performance in 16.67% of cases."
> 出处：2602.14878 Abstract
>
> 原文:"All six smell types affect the majority of MCP tool descriptions, with the most severe issues appearing in nearly 90% of tools."
> 出处：2602.14878 §5.1 RQ-1
>
> 原文:"As shown in Figure 7, the most widespread smell categories are Unstated Limitations (89.8%), Missing Usage Guidelines (89.3%), and Opaque Parameters (84.3%)."
> 出处：2602.14878 §5.1 RQ-1
>
> 原文:"The next tier includes Underspecified or Incomplete descriptions (79.1%) and Exemplar Issues (77.9%)"
> 出处：2602.14878 §5.1 RQ-1
>
> 原文:"Even for the best-performing component (i.e., Purpose), we observe the Unclear Purpose smell in 56% of tools, indicating that more than half of tool descriptions do not clearly articulate their intended functionality."
> 出处：2602.14878 §5.1 RQ-1
>
> 原文:"Only 2.9% of MCP tool descriptions are fully smell-free."
> 出处：2602.14878 §5.1 RQ-1
>
> 原文:"we implement a 5-point Likert scale (Joshi et al., 2015) rubric for each component."
> 出处：2602.14878 §4.1.4 Scoring & smell derivation
>
> 原文:"We designate score 3 as the minimum threshold"
> 出处：2602.14878 §4.1.4 Scoring & smell derivation
>
> 原文:"To address this limitation, we extend the client with a configurable switching module called the Tool Description Router, which allows for the dynamic selection of tool descriptions."
> 出处：2602.14878 §4.5.2 Tool Description Router
>
> 原文:"With augmented tool descriptions, agents achieve an absolute increase of 5.85 percentage points (median) in task success rate across all models and domains."
> 出处：2602.14878 §5.2 RQ-2
>

## 输入 / 输出契约

**输入**：MCP 工具的描述原文（名称、用途、参数、约束、示例、副作用、返回格式），粒度到单个工具。

**输出**：工具描述六维评分表与 smell 清单（缺使用指南、未声明限制、示例问题等）及改写建议，供工具维护者与 Agent 路由使用。

## 执行步骤

1. 收集全部工具的现有描述字段
2. 按目的、指南、限制、参数、示例、返回六维打分
3. 标注每条工具命中的 smell 类型
4. 输出改写建议并按质量分排序
5. 把质量分用于工具路由与后续抽查

## 边界与不做

- 只有工具名、连用途都没写时无法打分，需先补齐基本信息；工具数量很少时收益有限。
- 本技能只做描述质量评估与改进建议，不修改工具实现，也不保证评分高就一定调用正确。

## 技能关联

- **前置**：Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Open-Source-Tool-Use-Model.html、Skill-Open-Source-Tool-Use-Model
- **延伸**：Skill-MCP-Tool-Use-Benchmark.html、Skill-MCP-Tool-Use-Benchmark、Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization
- **可组合**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Context-Compression.html、Skill-Context-Compression、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Tool-Description-Audit

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：16-智能体工程　·　源卡：`Skill-Tool-Description-Audit`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（45 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`）。

- 论文：2602.14878
- 标题：Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`）。
>
> - 论文：2602.14878
> - 标题：Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2602.14878
> > - 标题：Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2602.14878
> > > - 标题：Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Tool-Description-Audit`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2602.14878
> > > > - 标题：Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2602.14878 — Model Context Protocol (MCP) Tool Descriptions Are Smelly! Towards Improving AI Agent Efficiency with Augmented MCP Tool Descriptions
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
