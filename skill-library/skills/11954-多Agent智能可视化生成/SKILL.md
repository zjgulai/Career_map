---
name: "p2s-data-to-dashboard-multi-agent-visualization"
title: "Data-to-Dashboard — 多Agent智能可视化生成"
description: "触发词：数据看板、多Agent可视化、周报图表、洞察生成、仪表盘自动生成。何时不用：只需把自然语言转成图表时用 NL2Dashboard；需要解释模型为何这样预测时用 SHAP 归因。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Data-to-Dashboard-Multi-Agent-Visualization"
p2s_src_domain: "09-DataAgent-LLM"
p2s_venue_tier: "preprint"
p2s_paper_id: "2505.23695"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Data-to-Dashboard-Multi-Agent-Visualization"
rebase_vault_path: "paper2skills-vault/09-DataAgent-LLM/Skill-Data-to-Dashboard-Multi-Agent-Visualization.md"
rebase_source_sha256: "5c97a03b2b4d702e45756f1902a41930bdf9cc9f68420f9bf923f208bee62780"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "5c97a03b2b4d702e45756f1902a41930bdf9cc9f68420f9bf923f208bee62780"
rebase_full_card_bytes: "23007"
rebase_full_card_lines: "454"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "1fe8d1d8ee277f2c65148d44e3f86fb88be06d2d47279a4f1a01a17d42ee37be"
user_summary: "模拟商业分析师的工作流，把多平台经营数据自动变成带洞察的多视角图表，周报制作从天级降到分钟级。"
user_try: "试试：把我这三个平台的周报数据生成多视角图表，并给出平台之间的关联洞察和异常时段。"
whenToUse: "属于「业务工具实现」：需要在无人预先定义图表模板的前提下，从原始数据自动产出洞察驱动的仪表盘时用；若只是把一句自然语言需求变成图表，用 NL2Dashboard；若要解释既有模型的预测原因，用 SHAP 归因。"
workflow: "Domain Detection：识别数据领域，判断是否跨境电商母婴销售分析 → Concept Extraction：提取 GMV、ROI、退货率、广告 ACOS、SKU 动销率等关键指标 → Multi-Perspective Analysis：按时间、分布、关联、异常、平台五个视角出图 → Self-Reflection：校验洞察与数据是否自洽，剔除站不住的结论 → 汇总为带图表与结论的周报或仪表盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "false"
---
# Data-to-Dashboard — 多Agent智能可视化生成

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`，sha256 `5c97a03b2b4d702e45756f1902a41930bdf9cc9f68420f9bf923f208bee62780`，23007 字节 / 454 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 17 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `1fe8d1d8ee277f2c65148d44e3f86fb88be06d2d47279a4f1a01a17d42ee37be`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Data-to-Dashboard — 多Agent智能可视化生成

## 1. 算法原理

Data-to-Dashboard 的核心思想是**模拟商业分析师的工作流**——不是让 LLM 直接生成图表，而是先理解数据背后的业务洞察，再基于洞察选择最合适的可视化表达方式。

**两阶段架构**：


**Stage 1 — Data-to-Insight（洞察生成）**：

| Agent | 职责 | 输出 |
|-------|------|------|
| **Domain Detection** | 识别数据所属业务领域 | 领域标签（销售/用户/库存等） |
| **Concept Extraction** | 提取关键指标和维度 | 概念列表（GMV、留存率、SKU等） |

（**换底正文在此截断** —— 完整卡正文共 454 行，本页内联到第 45 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 17 条 —— **其余 7 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 17 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 7 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Our agentic system operates in two sequential stages: data-to-insight and insight-to-chart"
> 出处：2505.23695 §3（Proposed Approach，对应本文 §1 的「两阶段架构」断言）

> 原文:"our framework simulates the analytical reasoning process of business analysts by retrieving domain-relevant knowledge and adapting to diverse datasets without relying on closed ontologies or question templates."
> 出处：2505.23695 §Abstract（对应「不依赖封闭本体或预定义问题模板」）

> 原文:"This label is inferred using external reference knowledge sources, such as Wikipedia, enabling broad transferability across industries without relying on closed taxonomies or predefined ontologies."
> 出处：2505.23695 §3.2（Domain Detector，Domain Detection Agent 的职责口径）

> 原文:"The Evaluator agent scores the generated outputs across five dimensions"
> 出处：2505.23695 §3.2（Evaluator，Multi-Perspective / Evaluator 的评分维度）

> 原文:"We adopt the Reflexion framework (Shinn et al., 2023) to enhance reasoning after the evaluation stage."
> 出处：2505.23695 §3.2（Self-Reflector，自反思迭代机制）

> 原文:"Our approach implements a Tree-of-Thought (ToT) reasoning framework (Yao et al., 2023) for transforming analytical insights into domain-appropriate visualizations."
> 出处：2505.23695 §3.3（Stage 2: Insight to Chart）

> 原文:"Through the three-expert consensus mechanism, the system can evaluate competing visualization strategies against domain requirements, debate the effectiveness of different chart types, and scrutinize the selection of visual encodings before committing to a final representation."
> 出处：2505.23695 §3.3（专家共识评估机制）

> 原文:"Moreover, most existing approaches—whether targeting low-level tasks such as chart factuality check or high-level insight generation—rely heavily on question-answer (QA) pairs(Masry et al., 2022; Sahu et al., 2024) to drive the analytical process."
> 出处：2505.23695 §2（Related Work，传统方案依赖预定义问题的依据）

> 原文:"As shown in Table 1, our approach significantly outperforms a non-agentic GPT-4o baseline with domain awareness in terms of insightfulness, novelty, and depth,"
> 出处：2505.23695 §6（Result 2 总结句）

> 原文:"| Insightful | 0.78 | 0.88 | +12 % |"
> 出处：2505.23695 §6 表 1（GPT-4o → Ours，Insightfulness 相对提升 +12%）

## 输入 / 输出契约

**输入**：多平台原始经营数据，日粒度订单与 SKU 级明细，含销售额、退货率、广告 spend、转化率、客户留存率等 12+ 指标；卡页第 4 段未给字段级规格，落地前需按数仓表结构对齐字段与口径。

**输出**：一份洞察驱动的可视化看板：折线、柱状、散点、热力、雷达等图表加每条洞察的自然语言描述与置信度，供运营与管理层看数决策。

## 执行步骤

1. 识别数据领域，确认数据是否属于跨境电商母婴销售分析
2. 提取关键指标：GMV、ROI、退货率、广告 ACOS、SKU 动销率、新客占比
3. 按时间、分布、关联、异常、平台五个视角生成对应图表
4. 对每条洞察做自反思校验，只保留有数据支撑的结论
5. 汇总为周报或仪表盘，交付运营与管理层

## 边界与不做

- 数据不满足时不用：数据没加工到指标层，或只有单一平台的单一数据源时，多视角分析会退化成普通报表。
- 能力边界：本卡产出图表与洞察，不含数据仓库建设与指标口径治理，也不做底层 ETL。

## 技能关联

- **前置**：Skill-LLM-Agent-Reasoning-Framework
- **延伸**：Skill-Insight-Extraction-from-Multimodal-Data
- **可组合**：Skill-Anomaly-Detection-in-Time-Series、Skill-Cross-Platform-Data-Integration、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Data-to-Dashboard-Multi-Agent-Visualization

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Data-to-Dashboard-Multi-Agent-Visualization`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（373 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`）。

- 论文：2505.23695
- 标题：arXiv:2505.23695
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`）。
>
> - 论文：2505.23695
> - 标题：arXiv:2505.23695
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2505.23695
> > - 标题：arXiv:2505.23695
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2505.23695
> > > - 标题：arXiv:2505.23695
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Data-to-Dashboard-Multi-Agent-Visualization`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2505.23695
> > > > - 标题：arXiv:2505.23695
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2505.23695 — Data-to-Dashboard: Multi-Agent LLM Framework for Insightful Visualization in Enterprise Analytics
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
