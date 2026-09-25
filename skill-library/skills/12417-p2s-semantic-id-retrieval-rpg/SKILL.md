---
name: "p2s-semantic-id-retrieval-rpg"
title: "Semantic ID Retrieval for Recommendation (RPG)"
description: "触发词：语义 ID、多语言检索、跨语言搜索、召回覆盖、前缀检索。何时不用：要用自然语言与商品文本对齐做推荐用「LLM 增强推荐」；要按多模态图文匹配用「多模态产品推荐」。安全边界：商品多语言描述须与实物一致，不得为扩召回堆砌无关语义 ID；语义 ID 的生成与检索须遵守各市场的语言与广告合规要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Semantic-ID-Retrieval-RPG"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Semantic-ID-Retrieval-RPG"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Semantic-ID-Retrieval-RPG.md"
rebase_source_sha256: "a982e4126894afa5f3c1c0a7610491a8a7b4f2f86aab7617d812ffb4a0e192b1"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a982e4126894afa5f3c1c0a7610491a8a7b4f2f86aab7617d812ffb4a0e192b1"
rebase_full_card_bytes: "7730"
rebase_full_card_lines: "197"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "5fe2c125371dbba1349a2a285fed01d767381608bb45b7551c558fc6ab3b8cce"
user_summary: "同一个吸奶器，英语、德语、法语的搜法都不一样：把商品编成语义 ID，跨语言也能搜到同一件货。"
user_try: "试试：给这批吸奶器生成多语言语义 ID，让 breast pump、Milchpumpe、tire-lait 都检索到同一商品。"
whenToUse: "当多语言站点或跨境市场存在同物异名、传统 ID 检索漏匹配时用本技能；要用自然语言对齐做推荐用「LLM 增强推荐」；要图文多模态匹配用「多模态产品推荐」。"
workflow: "整理商品属性并生成多语言语义 ID：核心语义加语言变体 → 把用户 query 编码为语义 ID 前缀 → 在语义 ID 空间中做相似检索 → 评估跨语言搜索准确率与检索延迟 → 让新上架商品自动关联相似商品的用户"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Semantic ID Retrieval for Recommendation (RPG)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`，sha256 `a982e4126894afa5f3c1c0a7610491a8a7b4f2f86aab7617d812ffb4a0e192b1`，7730 字节 / 197 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `5fe2c125371dbba1349a2a285fed01d767381608bb45b7551c558fc6ab3b8cce`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Semantic ID Retrieval (RPG)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：传统推荐系统用无序的one-hot ID或量化向量表示商品，丢失了语义信息。"三段奶粉"和"二段奶粉"在向量空间里可能是遥远的点，尽管它们在语义上高度相关。

**RPG 创新（KDD 2025, Meta AI）**：
用**多token预测（MTP）**并行生成长语义ID：
1. **语义编码**：商品属性（品牌、品类、功能、适用年龄）编码为token序列
2. **并行生成**：用MTP一次性预测最多64个token的语义ID（vs 自回归逐个生成）
3. **图约束解码**：在解码过程中加入商品关系图的约束，确保生成的ID符合商品层级结构
4. **检索速度**：推理速度比自回归方法快5-14倍，且与候选集大小无关

**为什么语义ID比传统ID好**：
- **可解释性**：`[奶粉][3段][爱他美][德国]` 比 `item_id=78432` 更有语义
- **泛化能力**：新品可以通过语义ID自动关联到相似商品，无需重新训练
- **跨模态对齐**：文本描述、商品图片、用户query都可以映射到同一个语义ID空间

**关键洞察**：语义ID把"推荐问题"转化为"文本生成问题"——给定用户上下文，生成最可能感兴趣的商品语义ID。

---

## ② 母婴出海应用案例

### 场景：跨语言商品检索

**业务问题**：Momcozy 在欧美多国销售，商品信息用英语、德语、法语维护。用户用不同语言搜索"breast pump" / "Milchpumpe" / "tire-lait"，传统ID-based检索无法跨语言关联同一商品。

**RPG 应用**：
1. **语义ID编码**：每个商品生成多语言语义ID
   - 核心语义：`[吸奶器][电动][便携][单边]`
   - 语言变体：`[breast_pump][electric][portable][single]` / `[Milchpumpe][elektrisch]`
2. **用户query编码**：将用户搜索词编码为语义ID前缀
3. **检索**：在语义ID空间中找最相近的商品

**预期产出**：
- 跨语言搜索准确率：60% → 85%
- 新品自动关联：上架即被相似商品的用户看到
- 检索延迟：<10ms（与候选集大小无关）

**业务价值**：
- 减少多语言维护成本
- 加速新品发现
- 支持语音/图片搜索（统一映射到语义ID）

---

（**换底正文在此截断** —— 完整卡正文共 197 行，本页内联到第 51 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：商品多语言属性（标题、类目、关键特征）与用户搜索 query 文本；粒度为单商品 × 单 query。

**输出**：商品的多语言语义 ID、query 到商品语义 ID 的检索结果，以及跨语言搜索准确率与延迟指标；供搜索与商品运营接入检索链路。

## 执行步骤

1. 整理商品属性并生成核心语义与语言变体语义 ID
2. 把用户搜索词编码为语义 ID 前缀
3. 在语义 ID 空间检索最相近商品
4. 评估跨语言准确率与检索延迟（卡页口径小于 10ms）
5. 让新上架商品自动关联到相似商品的用户

## 边界与不做

- 数据不满足：商品属性缺关键特征、或缺少多语言描述时语义 ID 编码不完整，先补齐商品信息。
- 何时不用：要用自然语言对齐做冷启动推荐用「LLM 增强推荐」；要图文多模态匹配用「多模态产品推荐」。
- 能力边界：只做语义编码与检索召回，不替代排序模型，也不保证卡页口径的准确率提升。
- 安全边界：多语言描述须与实物一致，不得为扩召回堆砌无关语义 ID；编码与检索须遵守目标市场的语言与广告合规要求。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR
- **可组合**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN、Skill-Semantic-ID-Retrieval-RPG

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Semantic-ID-Retrieval-RPG`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（125 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Semantic-ID-Retrieval-RPG`（完整卡：`references/full-card.md`）。
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
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
