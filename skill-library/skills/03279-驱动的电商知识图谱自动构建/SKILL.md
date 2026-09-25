---
name: "p2s-kg-auto-construction-agent-driven"
title: "AI Agent 驱动的电商知识图谱自动构建"
description: "触发词：自动建图、本体生成、三元组抽取、商品知识图谱、Agent 流水线。何时不用：文本量很小、手工整理一次就够时不用；本体需要人工评审定稿的场景用本体 Schema 设计类技能。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
quality_tier: "curated"
p2s_card_id: "Skill-KG-Auto-Construction-Agent-Driven"
p2s_src_domain: "08-知识图谱"
p2s_venue_tier: "preprint"
p2s_paper_id: "2511.11017"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-KG-Auto-Construction-Agent-Driven"
rebase_vault_path: "paper2skills-vault/08-知识图谱/Skill-KG-Auto-Construction-Agent-Driven.md"
rebase_source_sha256: "eb292fc2b692fdf11930bfee4130324183b493723da471237a8c62c423d71282"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "eb292fc2b692fdf11930bfee4130324183b493723da471237a8c62c423d71282"
rebase_full_card_bytes: "40529"
rebase_full_card_lines: "923"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "84a40c222dd2bbe724ab359eefaa06ad2c791f1ddba7cb6d326aa7ff8711850c"
user_summary: "把分散在 Amazon、Shopify、供应商文档里的商品信息自动抽成产品本体和三元组，新品上架也跟得上。"
user_try: "试试：把这些吸奶器和储奶袋的商品描述抽成三元组，先给我一版本体 Schema。"
whenToUse: "商品文本分散在多平台、上新频繁需要持续建图时用本技能；需要人工评审本体定稿用本体 Schema 设计类技能。"
workflow: "收集商品标题、要点与描述文本 → 生成并扩展商品本体 Schema → 迭代精炼本体概念 → 按本体抽取实例级三元组填充图谱"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "13"
rebase_evidence_quotes_total: "30"
rebase_evidence_quotes_complete: "false"
---
# AI Agent 驱动的电商知识图谱自动构建

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`，sha256 `eb292fc2b692fdf11930bfee4130324183b493723da471237a8c62c423d71282`，40529 字节 / 923 行 / 30 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 13 条（共 30 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `84a40c222dd2bbe724ab359eefaa06ad2c791f1ddba7cb6d326aa7ff8711850c`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: AI Agent 驱动的电商知识图谱自动构建

## ① 算法原理

### 核心思想

传统知识图谱构建依赖人工定义 Schema 和编写抽取规则，成本高、扩展性差。**AI Agent 驱动的 KG 自动构建** 将全流程拆解为三个由 LLM Agent 协作完成的阶段，从非结构化产品描述中自动产出结构化知识图谱，无需预定义 Schema 或人工规则。

三阶段流水线：

1. **Ontology Creation & Expansion（本体创建与扩展）**
   - 从产品描述语料中采样代表性样本
   - LLM Agent 提取产品类、属性、关系，组织为 RDF/Turtle 格式
   - 迭代扩展：持续送入新样本，Agent 自动发现新类/属性并扩展 Schema
   - 直到每轮新增元素显著衰减（plateau），平衡覆盖率与可管理性

2. **Ontology Refinement（本体精炼）**

（**换底正文在此截断** —— 完整卡正文共 923 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 13 / 全 30 条 —— **其余 17 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 30 条逐字引文。本页按完整卡顺序内联**前 13 条整条引文**（不在引文中间断开）；其余 17 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"This paper introduces a fully automated, AI agent-driven framework for constructing product knowledge graphs directly from unstructured product descriptions."
> 出处：2511.11017 §Abstract

> 原文:"Leveraging Large Language Models (LLMs), our method operates in three stages using dedicated agents: ontology creation and expansion, ontology refinement, and knowledge graph population."
> 出处：2511.11017 §Abstract

> 原文:"This agent-based approach ensures semantic coherence, scalability, and high-quality output without relying on predefined schemas or handcrafted extraction rules."
> 出处：2511.11017 §Abstract

> 原文:"We evaluate the system on a real-world dataset of air conditioner product descriptions, demonstrating strong performance in both ontology generation and KG population."
> 出处：2511.11017 §Abstract

> 原文:"The framework achieves over 97% property coverage and minimal redundancy, validating its effectiveness and practical applicability."
> 出处：2511.11017 §Abstract

> 原文:"Our framework consists of three main stages: (1) ontology creation and expansion, (2) ontology refinement, and (3) knowledge graph population."
> 出处：2511.11017 §3 Methodology

> 原文:"We begin by sampling representative product descriptions from the corpus, focusing on coverage across product categories. An LLM-based agent is employed to extract initial ontology elements."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Creation and Expansion）

> 原文:"The agent identifies product classes, attributes, and relationships, organizing them into RDF/Turtle format with clearly defined rdfs:domain, rdfs:range, and descriptive rdfs:comment annotations."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Creation and Expansion）

> 原文:"Ontology expansion proceeds iteratively. We present additional product descriptions to the agent using a prompt that instructs it to generalize beyond individual instances and extend the schema where necessary."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Creation and Expansion）

> 原文:"The agent integrates new classes or properties discovered in these samples without removing existing elements, preserving schema stability."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Creation and Expansion）

> 原文:"We typically iterate this expansion process over approximately 30 product samples per category until the number of new ontology elements added per iteration significantly diminishes (indicating a plateau), balancing coverage with schema manageability."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Creation and Expansion）

> 原文:"we perform zero-shot refinement leveraging the LLM’s encoded knowledge."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Refinement）

> 原文:"We provide the complete ontology as input, prompting the LLM to suggest revisions, merges, or extensions aimed at improving generality, reducing redundancy, clarifying ambiguities, and enhancing adaptability to diverse product domains."
> 出处：2511.11017 §3.1 The Agent-based Workflow（Ontology Refinement）

## 输入 / 输出契约

**输入**：商品描述文本（标题、Bullet Points、描述段落）、品类分类信息，可选产品规格表作结构化补充。

**输出**：自动生成的商品本体 Schema 与实例级三元组，供 GraphRAG 检索与商品关系推理使用。

## 执行步骤

1. 汇总多源商品描述文本与分类信息
2. 生成初始商品本体并扩展概念
3. 对本体的冗余概念做迭代精炼
4. 按本体抽取实例级三元组
5. 把三元组填充进图谱并抽检

## 边界与不做

- 商品文本量少、一次性人工整理即可时不用本技能。
- 本技能产出本体与三元组，不做本体的人工定稿与治理审批。
- 抽取质量依赖原文完整度，需保留人工抽检环节。

## 技能关联

- **可组合**：Skill-KG-Data-Fusion-Pipeline.html、Skill-KG-Data-Fusion-Pipeline、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2、Skill-VOC-Supply-Chain-Signal-Bridge.html、Skill-VOC-Supply-Chain-Signal-Bridge、Skill-KG-Auto-Construction-Agent-Driven

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Auto-Construction-Agent-Driven`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（598 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`）。

- 论文：2511.11017
- 标题：arXiv:2511.11017
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`）。
>
> - 论文：2511.11017
> - 标题：arXiv:2511.11017
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2511.11017
> > - 标题：arXiv:2511.11017
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2511.11017
> > > - 标题：arXiv:2511.11017
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-KG-Auto-Construction-Agent-Driven`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2511.11017
> > > > - 标题：arXiv:2511.11017
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2502.06472 — KARMA: Leveraging Multi-Agent LLMs for Automated Knowledge Graph Enrichment
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
