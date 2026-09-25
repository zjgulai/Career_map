---
name: "p2s-voc-semantic-blueprint"
title: "Skill-VOC-Semantic-Blueprint"
description: "触发词：p2s-voc-semantic-blueprint。Skill Card: VOC 语义蓝图生成"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-VOC-Semantic-Blueprint"
p2s_src_domain: "07-NLP-VOC"
p2s_venue: "ACL 2023"
p2s_venue_tier: "CCF-A"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-VOC-Semantic-Blueprint"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-VOC-Semantic-Blueprint.md"
rebase_source_sha256: "2cd6b1780c0c3df7777e172e42d4ff9235d49edb7444c62bed43178ef8a171d7"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "2cd6b1780c0c3df7777e172e42d4ff9235d49edb7444c62bed43178ef8a171d7"
rebase_full_card_bytes: "8018"
rebase_full_card_lines: "183"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill-VOC-Semantic-Blueprint

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-VOC-Semantic-Blueprint`（完整卡：`references/full-card.md`，sha256 `2cd6b1780c0c3df7777e172e42d4ff9235d49edb7444c62bed43178ef8a171d7`，8018 字节 / 183 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: VOC 语义蓝图生成
# VOC Semantic Blueprint Generation

> **证据基础声明**：本卡**有可定位的论文来源** —— 见下方「论文来源」与 frontmatter 的
> `anthology_id: 2023.acl-long.802`（ACL Anthology 正式编号，ACL 2023 长文）。
> 但**该论文全文尚未入库**，故卡内数字**暂无逐字引文支撑**，不可当作论文结论引用。
> 待补：把全文存入 `papers/07-NLP-VOC/2023.acl-long.802/` 并在「⑥ 原文引用」段补逐字摘录后，
> `evidence_basis` 应升级为 `paper-verbatim`。

**论文来源**: USSA: A Unified Table Filling Scheme for Structured Sentiment Analysis (ACL 2023)
**理论基础**: Bi-lexical Dependency Parsing → 2D Table-Filling + Bi-Axial Attention
**适用领域**: NLP-VOC / 消费者评论结构化分析 / 方面级情感抽取

---

## ① 算法原理

USSA 将结构化情感分析（Structured Sentiment Analysis, SSA）从传统的 bi-lexical dependency parsing 重构为**统一的 2D Table-Filling** 范式。

**核心问题**：传统 dependency parsing 无法同时处理两种常见现象——
- **Overlap**（重叠）：同一个词属于多个 sentiment tuple
- **Discontinuity**（不连续）：一个 entity 的 token 在句子中非连续出现

**数学直觉**：把句子中的词对 `(w_i, w_j)` 映射为一个 2D 表格。表格的下三角（`i > j`）填**关系预测**（Relation Prediction, RP），上三角（`i < j`）填**Token 提取**（Token Extraction, TE）。每个格子只需填 13 种预定义关系之一，就能完整编码所有 `(holder, target, expression, polarity)` 四元组。

**关键创新**：
1. **13 种关系类型**：涵盖 entity 边界（S-H/S-T/S-E）和情感极性（E-POS/E-NEG/E-NEU）
2. **Bi-axial Attention**：在表格的行轴和列轴分别做 attention，捕获关系间的远程相关性
3. **统一解码**：从填充好的表格中，通过简单的路径遍历即可还原所有 sentiment tuples

**VOC 语义蓝图扩展**：将 SSA 的 `(holder, target, expression, polarity)` 映射为 `(用户, 产品方面, 观点表达, 情感极性)`，并增加**原因（cause）**和**场景（scene）**两个维度，形成五元组语义蓝图。

---

## ② 母婴出海应用案例

### 案例 A：Momcozy 吸奶器评论结构化分析

**场景**：从 Amazon/Trustpilot 的用户评论中提取结构化反馈，支撑产品改进决策。

**输入**：
> "The suction is strong but the noise is too loud at night. I use it at work every day."

**输出（VOC 语义蓝图）**：

**业务价值**：
- 将 20,000 条非结构化评论自动解析为可查询的结构化数据
- 产品团队可直接按"方面×情感×场景"交叉分析，如"夜间场景下的噪音负面反馈占比"
- 替代人工标注，单条处理成本从 $0.5 降至 $0.01

**数据需求**：
- 评论文本（必须）
- 产品品类词典（用于初始化 aspect 候选集）
- 可选：场景关键词词典（夜间/上班/外出等）

### 案例 B：跨市场竞品评论对比

**场景**：对比 Momcozy 与竞品（如 Spectra/Medela）在不同市场的用户反馈结构差异。

**输入**：
- Momcozy US Amazon 评论 5,000 条
- 竞品 Amazon 评论 5,000 条

**输出**：
- 两品牌的"方面-情感"结构图谱
- 差异分析：Momcozy 在"便携性"上正面反馈 +23%，但在"噪音"上负面反馈 +15%

**数据需求**：
- 多品牌评论数据
- 统一的 aspect 词典（跨品牌对齐）

---

（**换底正文在此截断** —— 完整卡正文共 183 行，本页内联到第 82 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-VOC-Semantic-Blueprint`（完整卡：`references/full-card.md`）。

- 标题：USSA: A Unified Table Filling Scheme for Structured Sentiment Analysis
- 发表处：ACL 2023
- venue 档位：CCF-A
- 证据基础：paper-traceable

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
