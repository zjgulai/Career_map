---
name: "p2s-semantic-blueprint-compiler"
title: "Schema-Guided Generation — 语义蓝图编译器"
description: "触发词：语义蓝图、Schema 约束生成、结构化输出、实体关系校验、VOC 数据标准。何时不用：还没有抽取结果、需要从原文抽取实体关系时先做上游抽取；只要人读的评论摘要用「AGRS 属性引导评论摘要」。安全边界：Schema 变更须版本化管理以免下游失配；蓝图中的实体不得含可识别个人的信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-026"
l3_business: "产品需求定义"
l3_all: "产品需求定义 / 业务工具实现"
l1_l2_l3: "业务运营/产品与创新/产品需求定义"
quality_tier: "curated"
p2s_card_id: "Skill-Semantic-Blueprint-Compiler"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2307.09702"
p2s_code_level: "无代码"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Semantic-Blueprint-Compiler"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-Semantic-Blueprint-Compiler.md"
rebase_source_sha256: "251a649bfb402b1d8c170e7124143dffaa9a118bb83d66c0252c8e6a0ee7bc61"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "251a649bfb402b1d8c170e7124143dffaa9a118bb83d66c0252c8e6a0ee7bc61"
rebase_full_card_bytes: "13277"
rebase_full_card_lines: "285"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "153411f0c3e1a35c9d85829d8ab7b15611d84a9f39826a4c3794ec774017aa4e"
user_summary: "把上游抽取出来的零散评论实体和关系，按固定 Schema 编译成格式统一、可校验的语义蓝图，让下游分析系统能直接消费。"
user_try: "试试：把 InstructUIE 抽出来的评论实体关系按 VOC 语义 Schema 编译成蓝图，并标出置信度不足的条目。"
whenToUse: "上游已有抽取结果、但格式与类型不统一、需要标准化后再喂给下游图模型时用本技能；若还没有抽取结果，先做上游实体关系抽取；若只要给人看的摘要，用「AGRS 属性引导评论摘要」。"
workflow: "定义 VOC 语义 Schema（实体类型、关系类型、事件框架枚举） → 把上游抽取结果映射进 Schema 结构并统一类型 → 按置信度阈值过滤并检查引用完整性 → 输出标准化语义蓝图供下游异构图构建"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "12"
rebase_evidence_quotes_total: "13"
rebase_evidence_quotes_complete: "false"
---
# Schema-Guided Generation — 语义蓝图编译器

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`，sha256 `251a649bfb402b1d8c170e7124143dffaa9a118bb83d66c0252c8e6a0ee7bc61`，13277 字节 / 285 行 / 13 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 12 条（共 13 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `153411f0c3e1a35c9d85829d8ab7b15611d84a9f39826a4c3794ec774017aa4e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Schema-Guided Generation — 语义蓝图编译器

---

## ① 算法原理

### 核心思想

**Schema-Guided Generation** 将语言模型的生成过程约束在预定义的结构化模式（Schema）中，确保输出符合预期的语义结构。核心洞察：**无约束的 LLM 生成是“创造性”的，但业务系统需要的是“确定性”的结构化输出**。

Schema-Guided Generation 的三个层次：
1. **Schema 定义层**：使用 CFG（上下文无关文法）、FSM（有限状态机）或 JSON Schema 定义合法输出空间
2. **约束解码层**：在解码过程中动态 mask 掉不符合 Schema 的 token，确保每一步输出都在合法空间内

（**换底正文在此截断** —— 完整卡正文共 285 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 12 / 全 13 条 —— **其余 1 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 13 条逐字引文。本页按完整卡顺序内联**前 12 条整条引文**（不在引文中间断开）；其余 1 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"In this article we describe an efficient approach to guiding language model text generation with regular expressions and context-free grammars."
> 出处：2307.09702 §Abstract（① 的核心命题：约束解码约束在正则/CFG 上）

> 原文:"This kind of guided LLM generation is used to make LLM model output usable under rigid formatting requirements that are either hard or costly to capture through fine-tuning alone"
> 出处：2307.09702 §1 Introduction（① 为什么需要 Schema-Guided：业务要求刚性格式）

> 原文:"The newer generation of Large Language Models has proven efficient at generating structured outputs, for instance code or outputs in JSON format, by conditioning on the prompt alone."
> 出处：2307.09702 §2.1 Guided generation（只靠 prompt 已能产出 JSON 等结构化输出）

> 原文:"The validity of the output is however influenced heavily by subtle differences in prompting, and even the best known prompting techniques do not systematically result in valid outputs."
> 出处：2307.09702 §2.1 Guided generation（① 「无约束生成不可靠」的原文依据）

> 原文:"The methods exposed here guarantee the validity of the output. They guide the sequence generation process by complementing it with a deterministic monitoring process. This process keeps track of the generated tokens, and manipulates the logits at each step of the process."
> 出处：2307.09702 §2.1 Guided generation（① 第 2 层「约束解码层」的原始表述）

> 原文:"We propose an approach that uses the standard finite state machine (FSM) formulation of regular expressions to both arbitrarily start and stop guided generation and allow the construction of an ”index” with which the set of non-zero-probability tokens can be obtained efficiently at each step."
> 出处：2307.09702 §1 Introduction（① Schema 定义层用 FSM 表达合法输出空间）

> 原文:"The result is an algorithm that scales as $\mathcal{O}(1)$ on average."
> 出处：2307.09702 §1 Introduction（约束解码的复杂度：均摊 O(1)）

> 原文:"Our FSM approach can also be extended to CFGs and $\operatorname{LALR}(1)$ parsers to allow for efficient guided generation according to popular data formats and programming languages (e.g. JSON, Python, SQL, etc.)."
> 出处：2307.09702 §1 Introduction（① CFG 约束生成，覆盖 JSON/Python/SQL）

> 原文:"We want to extend the state-based indexing provided above for regular expressions and their FSMs to CFGs. This can be done using pushdown automata (PDA)."
> 出处：2307.09702 §4.1 Pushdown Automata Formulation（④ CFG 路线用下推自动机实现）

> 原文:"The vocabulary indexing introduced in this paper removes a prohibitive run-time scaling barrier in guided generation."
> 出处：2307.09702 §5 Discussion（③ 生产环境建议「用 Outlines 做高效约束解码」的依据）

> 原文:"An implementation is provided in the open source Python library Outlines (Louf and Willard, )."
> 出处：2307.09702 §Abstract（④ 延伸技能 Outlines 的出处）

> 原文:"This means that guided generation is ultimately an ”iterative” matching and/or parsing problem, because we are not given the entire string upfront."
> 出处：2307.09702 §2.1 Guided generation（约束解码须逐步增量匹配，而非整串事后校验）

## 输入 / 输出契约

**输入**：上游抽取的原始结果（实体、关系、事件字符串）+ VOC 语义 Schema 定义（实体类型枚举、关系类型枚举、事件框架）+ 置信度阈值配置。

**输出**：标准化的 VOC 语义蓝图：类型统一、引用完整、低置信条目被过滤或标记，供下游异构图（HGT/HGCN）与分析系统直接消费。

## 执行步骤

1. 定义 VOC 语义 Schema 与类型枚举
2. 把上游抽取结果映射进 Schema 结构
3. 统一实体与关系的类型与引用
4. 按置信度阈值过滤并校验引用完整性
5. 输出可被下游直接消费的语义蓝图

## 边界与不做

- 上游没有抽取结果、或 Schema 尚未定义时不适用，没有约束就无从编译
- 本技能只做结构化转换与校验，不判断业务含义、不产出业务结论
- Schema 变更需版本化管理，否则下游图模型会因字段漂移而失配

## 技能关联

- **可组合**：Skill-Semantic-Blueprint-Compiler

---

> 分类：业务运营/产品与创新/产品需求定义　·　技术族：07-NLP-VOC　·　源卡：`Skill-Semantic-Blueprint-Compiler`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（222 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`）。

- 论文：2307.09702
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`）。
>
> - 论文：2307.09702
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2307.09702
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2307.09702
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Semantic-Blueprint-Compiler`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2307.09702
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2307.09702 — Efficient Guided Generation for Large Language Models
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
