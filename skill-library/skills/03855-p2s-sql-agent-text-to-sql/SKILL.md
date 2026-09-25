---
name: "p2s-sql-agent-text-to-sql"
title: "Text-to-SQL Agent for Natural Language Data Query"
description: "触发词：自然语言取数、Schema理解、SQL生成、固定口径查询、取数自助。何时不用：表名列名映射模糊时用 Schema-Linking 感知方案；要跨库语义推理时用混合检索。安全边界：仅限只读查询自有业务库，禁止生成写操作与 DDL，结果不得包含个人隐私字段并外发。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-SQL-Agent-Text-to-SQL"
p2s_src_domain: "09-DataAgent-LLM"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-SQL-Agent-Text-to-SQL"
rebase_vault_path: "paper2skills-vault/09-DataAgent-LLM/Skill-SQL-Agent-Text-to-SQL.md"
rebase_source_sha256: "be94a3c46898296b679e5aebcc3876743594eae550cc9c1aa2f409631713d3bd"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "be94a3c46898296b679e5aebcc3876743594eae550cc9c1aa2f409631713d3bd"
rebase_full_card_bytes: "12825"
rebase_full_card_lines: "354"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "65b4927164b5facedb3855ce828baf7ce707131e8cee55e4e80deaeeb4a19b93"
user_summary: "运营用大白话问数，Agent 读懂表结构后生成 SQL 并执行，把取数从排队两天缩到几分钟。"
user_try: "试试：上个月德国站各品类的转化率和退货率是多少，直接给我结果和用到的 SQL。"
whenToUse: "属于「业务工具实现」：重复取数需求多、表结构相对稳定、希望业务方自助问数时用；若表名与列名映射很模糊，用 Schema-Linking 感知的方案；若要跨结构化与非结构化库推理，用混合检索。"
workflow: "维护数据库 Schema 描述与字段说明 → 解析用户问题，识别相关表与字段 → 生成 SQL 并做语法与逻辑校验 → 执行查询并解释结果 → 把高频问题沉淀为模板，减少生成开销"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Text-to-SQL Agent for Natural Language Data Query

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`，sha256 `be94a3c46898296b679e5aebcc3876743594eae550cc9c1aa2f409631713d3bd`，12825 字节 / 354 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `65b4927164b5facedb3855ce828baf7ce707131e8cee55e4e80deaeeb4a19b93`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Text-to-SQL Agent

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：业务团队（运营、市场、产品）需要数据但不懂SQL。每次提数需求都要排期给数据团队，平均等待2-3天。Text-to-SQL让非技术用户用自然语言直接查询数据库。

**技术演进**：

**v1.0 模板匹配（2010s）**：
- 预定义查询模板，用规则匹配用户意图
- 局限：只能处理预定义问题，灵活性差

**v2.0 Seq2Seq模型（2018-2022）**：
- 用Encoder-Decoder模型将自然语言直接映射到SQL
- 代表：Seq2SQL、SQLNet、IRNet
- 局限：需要大量标注数据，对复杂查询（多表JOIN、子查询）效果差

**v3.0 LLM时代（2023-2025）**：
- 大模型（GPT-4、Claude）直接生成SQL
- 配合Schema Linking（先识别相关表和字段，再生成SQL）
- 配合Self-Correction（生成SQL→执行→报错→修正）

**关键挑战与解法**：

| 挑战 | 解法 |
|------|------|
| Schema理解 | 将表结构、字段描述注入Prompt |
| 歧义消解 | 让用户澄清模糊查询 |
| 复杂JOIN | 分步生成：先确定表→再确定JOIN条件→最后生成完整SQL |
| 安全性 | 只读权限 + SQL注入过滤 + 敏感字段脱敏 |
| 准确性验证 | 执行SQL后用自然语言解释结果，让用户确认 |

**反直觉洞察**：
- Text-to-SQL的准确率瓶颈不在"生成SQL"，而在**Schema理解**——模型不知道`user_id`和`customer_id`是同一个东西
- 80%的业务查询可以用20个标准SQL模板覆盖——与其追求100%的任意查询，不如优先覆盖高频场景
- 最安全的做法是"人机协同"：模型生成草稿SQL，人工审核后执行

---

## ② 母婴出海应用案例

### 场景1：运营自助取数

**业务问题**：运营团队每天问数据团队同样的问题："昨天德国站奶粉类目的转化率是多少？"、"上周各品类的退货率排名"。数据团队80%时间在回答重复问题。

**SQL Agent应用**：

1. **Schema准备**：

2. **用户提问**："上个月德国站各品类的转化率和退货率"

3. **Agent处理**：
   - Schema Linking：识别相关表（orders, users）、字段（country, category, amount, is_returned, order_date）
   - SQL生成：

4. **结果解释**：用自然语言解释SQL结果

**预期产出**：
- 数据团队重复取数工作量：80% → 20%
- 业务方取数等待：2-3天 → 即时
- 数据民主化：运营/产品/市场都能自助分析

### 场景2：高管自然语言报表

**业务问题**：CEO每周需要看核心指标Dashboard，但Dashboard是固定的，无法回答临时问题如"对比去年同期，Q1新客获取成本变化了多少？"

**SQL Agent + 可视化**：
- CEO用自然语言提问
- Agent生成SQL + 执行 + 生成图表
- 输出：带图表的自然语言报告

---

（**换底正文在此截断** —— 完整卡正文共 354 行，本页内联到第 105 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：数据库 Schema（表结构、字段说明）、业务问题语句，以及可选的历史 SQL 样例；卡页第 4 段未给字段级规格，落地前需确认 Schema 描述与数据字典的维护方式。

**输出**：查询结果与可追溯的 SQL：卡页示例按问题返回转化率、退货率排名等结果并附上所用 SQL；业务侧重复取数工作量减少 80%、决策速度提升 10 倍。

## 执行步骤

1. 维护数据库 Schema 描述与字段说明，让模型读懂表结构
2. 解析用户问题，识别相关表与字段
3. 生成 SQL 并做语法与逻辑校验
4. 执行查询并解释结果，附上所用 SQL
5. 把高频问题沉淀为模板，降低生成开销

## 边界与不做

- 数据不满足时不用：Schema 缺少字段说明，或表结构频繁变动时生成的 SQL 容易查错表，应先补数据字典。
- 能力边界：本卡产出 SQL 与查询结果，不含数据仓库建模与指标口径治理。
- 仅限只读查询自有业务库，禁止生成写操作与 DDL；结果不得包含个人隐私字段并外发。

## 技能关联

- **前置**：Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting
- **延伸**：Skill-Data-to-Dashboard-Multi-Agent-Visualization.html、Skill-Data-to-Dashboard-Multi-Agent-Visualization、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-SQL-Agent-Text-to-SQL

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-SQL-Agent-Text-to-SQL`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（228 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-SQL-Agent-Text-to-SQL`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2304.04690，但该号在 arXiv 上是《Digraph Colouring and Arc-Connectivity》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Binding Language Models in Symbolic Languages》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
