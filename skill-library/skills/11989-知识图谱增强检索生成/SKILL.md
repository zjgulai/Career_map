---
name: "p2s-graphrag-knowledge-enhanced-retrieval"
title: "GraphRAG - 知识图谱增强检索生成"
description: "触发词：知识图谱检索、关系推理问答、商品对比、配件推荐、答案溯源。何时不用：只要关键词匹配 FAQ 时用基础检索加精排；要跨长文档做全局摘要层检索时用分层检索。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-GraphRAG-Knowledge-Enhanced-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "C"
p2s_paper_id: "2404.16130"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-GraphRAG-Knowledge-Enhanced-Retrieval"
rebase_vault_path: "paper2skills-vault/08-知识图谱/Skill-GraphRAG-Knowledge-Enhanced-Retrieval.md"
rebase_source_sha256: "609c3698ffe173e486641e26543dca3529eb68762436d5e138672b1af825d955"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "609c3698ffe173e486641e26543dca3529eb68762436d5e138672b1af825d955"
rebase_full_card_bytes: "43246"
rebase_full_card_lines: "950"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "8c1d1bdf5ddae335615cceca1b4abcf0263529ba6d3e40283988dc76cb93291e"
user_summary: "把商品、用户、行为搭成知识图谱，让客服能回答两个吸奶器差在哪、买了还要配什么这类关系问题。"
user_try: "试试：基于我们的商品知识图谱，回答吸奶器 A 和 B 的区别，并按配套关系推荐配件。"
whenToUse: "属于「业务工具实现」：问题需要跨实体关系推理、且答案要可溯源时用；若只是关键词命中 FAQ，用基础检索加精排即可；若要跨长文档在摘要层做全局检索，用分层检索（RAPTOR）。"
workflow: "构建商品图谱：实体为商品、品牌、属性，关系为配套购买、同类竞品、适用人群、使用场景 → 接入用户购买浏览行为与客服历史问答，补全关系 → 按查询做实体匹配、邻居扩展与路径搜索，召回子图 → 用语义相似度加图结构相关性混合打分排序 → 把结构化上下文交给生成模型，输出可溯源答案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "3"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "false"
---
# GraphRAG - 知识图谱增强检索生成

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`，sha256 `609c3698ffe173e486641e26543dca3529eb68762436d5e138672b1af825d955`，43246 字节 / 950 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 3 条（共 18 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `8c1d1bdf5ddae335615cceca1b4abcf0263529ba6d3e40283988dc76cb93291e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: GraphRAG - 知识图谱增强检索生成

> **证据拓扑说明（2026-09-13 补 frontmatter 时核验）—— 本卡有「两个论文」，不要混淆**
> - **来源论文（`paper_id: 2404.16130`）**：Edge et al.,
>   *From Local to Global: A Graph RAG Approach to Query-Focused Summarization*（GraphRAG 的提出者）。
>   arXiv 元数据**无 `Comments`、无 `journal_ref`** → `venue: arXiv preprint`。
>   ⚠️ 仓库内**没有**这篇的底本 → 故 `evidence_grade: C`（仅二手描述）。
> - **逐字证据来源（`2608.28978`）**：本卡 ⑥ 段的 18 条逐字引文**全部**出自
>   *Selective Forgetting: A Graph-Based Memory Framework for Long-Term LLM Agents*，
>   它是 PHASE3 批次 3E 用来给本卡补「负结果 / 适用边界」的**增强论文**，**不是**本卡的来源论文。
>   故 `evidence_basis: mixed` —— 来源声明与逐字证据来自**两篇不同论文**。

（**换底正文在此截断** —— 完整卡正文共 950 行，本页内联到第 12 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 3 / 全 18 条 —— **其余 15 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 18 条逐字引文。本页按完整卡顺序内联**前 3 条整条引文**（不在引文中间断开）；其余 15 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"On LongMemEval, the graph does not outperform a flat vector baseline at a matched candidate-generation budget of five retrieval roots: token F1 is $0.417$ against $0.468$, and a paired bootstrap over 500 questions gives $\Delta=-0.050$ (95% CI $[-0.085,-0.016]$)."
> 出处：2608.28978 §Abstract｜Q1

> 原文:"The gap is widest on questions that require recalling a specific prior assistant turn, where judged correctness falls from $0.911$ to $0.607$, suggesting that decomposing a turn into entities discards the surface form these questions depend on."
> 出处：2608.28978 §Abstract｜Q2

> 原文:"Because our extractor is a single small model evaluated on one benchmark, these results characterise this extraction-based pipeline rather than graph-structured memory in general."
> 出处：2608.28978 §Abstract｜Q3

## 输入 / 输出契约

**输入**：商品知识图谱（实体：商品、品牌、价格、材质、功能；关系：配套购买、同类竞品、适用人群、使用场景）、用户行为数据（购买、浏览、评价）与客服历史问答记录。

**输出**：结构化上下文与答案：商品对比结论、基于配套关系的配件推荐、结合购买历史的个性化回答，并附图谱路径便于溯源，供客服与推荐场景使用。

## 执行步骤

1. 构建商品知识图谱：定义商品、品牌、属性实体与配套、竞品等关系
2. 接入用户购买浏览行为与客服历史问答，补全关系
3. 按查询做实体匹配、邻居扩展与路径搜索，召回子图
4. 用语义相似度加图结构相关性混合打分排序
5. 把结构化上下文交给生成模型输出答案并附溯源路径

## 边界与不做

- 数据不满足时不用：图谱尚未建好、关系稀疏时关系推理答不出结果，应先把图谱补起来。
- 能力边界：本卡产出图谱检索与上下文组装，不含图谱数据的持续运营与人工校对，图结构变更后需重建索引。

## 技能关联

- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-GraphRAG-Knowledge-Enhanced-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-GraphRAG-Knowledge-Enhanced-Retrieval`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（512 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`）。

- 论文：2404.16130
- 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：C
- 证据基础：mixed
- 关联卡：Skill-Agentic-Memory-Management.md, Skill-KGQA-Question-Answering.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`）。
>
> - 论文：2404.16130
> - 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization
> - 发表处：arXiv preprint
> - venue 档位：preprint
> - 证据等级：C
> - 证据基础：mixed
> - 关联卡：Skill-Agentic-Memory-Management.md, Skill-KGQA-Question-Answering.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md
>
> - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2404.16130
> > - 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization
> > - 发表处：arXiv preprint
> > - venue 档位：preprint
> > - 证据等级：C
> > - 证据基础：mixed
> > - 关联卡：Skill-Agentic-Memory-Management.md, Skill-KGQA-Question-Answering.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md
> >
> > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2404.16130
> > > - 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization
> > > - 发表处：arXiv preprint
> > > - venue 档位：preprint
> > > - 证据等级：C
> > > - 证据基础：mixed
> > > - 关联卡：Skill-Agentic-Memory-Management.md, Skill-KGQA-Question-Answering.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md
> > >
> > > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-GraphRAG-Knowledge-Enhanced-Retrieval`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2404.16130
> > > > - 标题：From Local to Global: A Graph RAG Approach to Query-Focused Summarization
> > > > - 发表处：arXiv preprint
> > > > - venue 档位：preprint
> > > > - 证据等级：C
> > > > - 证据基础：mixed
> > > > - 关联卡：Skill-Agentic-Memory-Management.md, Skill-KGQA-Question-Answering.md, Skill-Dense-Retrieval-Ecommerce-Semantic-Search.md
> > > >
> > > > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2404.16130 — From Local to Global: A Graph RAG Approach to Query-Focused Summarization
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
