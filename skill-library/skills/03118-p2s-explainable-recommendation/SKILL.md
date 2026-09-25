---
name: "p2s-explainable-recommendation"
title: "Explainable Recommendation for Business Trust"
description: "触发词：可解释推荐、推荐理由生成、关联规则解释、推荐信任度、解释模板。何时不用：要提升的是搜索排序质量而非推荐解释时用「个性化搜索排序」；要解决的是爆款挤压长尾的曝光结构时用「推荐去偏」。安全边界：解释是展示层归因，不得宣称与真实因果一致，也不得用于误导性表述。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 申诉材料准备"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
quality_tier: "curated"
p2s_card_id: "Skill-Explainable-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Explainable-Recommendation"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Explainable-Recommendation.md"
rebase_source_sha256: "a82c7274ef4dbf358ac2770221f5bc0d79c945abb172cdcfcc5305f8815c7f99"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a82c7274ef4dbf358ac2770221f5bc0d79c945abb172cdcfcc5305f8815c7f99"
rebase_full_card_bytes: "10657"
rebase_full_card_lines: "288"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "972b2b8eb20bdb0fa66c975ffa78275ea84a1bf9b643ecc8b5d6a662ce1fdfcc"
user_summary: "给每条推荐配一句人话解释，让用户知道为什么推这个，点击和信任一起涨。"
user_try: "试试：给首页推荐位每条商品生成一句推荐理由，并告诉我哪类解释的点击表现最好。"
whenToUse: "当推荐位点击率不高、用户不信任推荐结果、需要给每个推荐项附一句可读解释时用本技能；若要提升的是搜索排序质量，用「个性化搜索排序」；若要解决的是长尾曝光不足的结构性问题，用「推荐去偏」。"
workflow: "从交易记录挖掘关联规则 → 为推荐项匹配推荐原因（协同/内容/知识/热门/价格） → 渲染成一句话解释文案 → 做有解释与无解释的 A/B 并固化最优策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Explainable Recommendation for Business Trust

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`，sha256 `a82c7274ef4dbf358ac2770221f5bc0d79c945abb172cdcfcc5305f8815c7f99`，10657 字节 / 288 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `972b2b8eb20bdb0fa66c975ffa78275ea84a1bf9b643ecc8b5d6a662ce1fdfcc`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Explainable Recommendation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：黑盒推荐系统给用户推了"吸奶器"，用户会问"为什么给我推这个？"如果无法解释，用户不信任、不点击、甚至反感。业务方也不理解模型逻辑，无法优化。

**可解释性的三个层次**：

| 层次 | 解释对象 | 示例 |
|------|---------|------|
| **模型层面** | 为什么模型做了这个预测 | SHAP值、注意力权重 |
| **用户层面** | 为什么推给这个用户 | "因为你买过奶粉" |
| **物品层面** | 为什么推这个物品 | "因为这个品牌和A品牌相似" |

**主流方法**：

**1. 基于关联规则的解释**
- "买了A的人也买了B"（Amazon经典）
- 简单、直观、无需额外模型
- 局限：只能解释协同过滤类推荐

**2. 基于知识的解释（Knowledge-aware）**
- 利用知识图谱中的关系路径解释
- "推荐爱他美3段，因为它含有DHA，和您之前买的美赞臣成分相似"
- 优势：解释内容丰富、有说服力

**3. 基于自然语言的解释（NLG）**
- 用模板或生成模型产出自然语言解释
- "这款吸奶器静音设计，适合夜间使用，和您收藏的一款功能类似"
- 前沿：LLM生成个性化解释

**4. 因果解释（Causal Explanation）**
- 不只看相关性，看因果性
- "如果去掉'价格'这个特征，推荐结果会从A变成B"
- 2025年前沿：Causal RecSys

**反直觉洞察**：
- 解释不一定要"完全准确"——用户需要的是"听起来合理"的解释，而非模型内部的数学真相
- 过长的解释反而降低点击率——一行字的解释效果最好
- "个性化解释"比"通用解释"点击率高30%+——"因为你"比"很多人"更有说服力

---

## ② 母婴出海应用案例

### 场景1：首页"猜你喜欢"的解释

**业务问题**：Momcozy 首页推荐位点击率2.5%，但用户调研显示40%的用户"不信任推荐结果"。需要给每个推荐商品添加一句话解释。

**解释生成策略**：

| 推荐原因 | 解释模板 | 示例 |
|---------|---------|------|
| 协同过滤 | "和您购买的{过往商品}很搭" | "和您买的吸奶器很搭：储奶袋" |
| 内容相似 | "和您浏览过的{商品}功能相似" | "和您浏览的A款功能相似：静音升级" |
| 知识关联 | "适合{宝宝阶段}的妈妈" | "适合6个月+宝宝：辅食机" |
| 热门趋势 | "本周{品类}热销Top 3" | "本周吸奶器热销Top 3" |
| 价格敏感 | "比您收藏的{商品}省${金额}" | "比您收藏的A款省$20" |

**A/B测试结果**：
- 有解释版：点击率3.2%（+28%）
- 无解释版：点击率2.5%
- 解释类型效果排序：知识关联 > 协同过滤 > 价格敏感 > 热门趋势

### 场景2：业务方理解模型逻辑

**业务问题**：产品团队质疑推荐系统"为什么总在推低价商品，不打高客单价用户？"

**因果解释分析**：
1. 用SHAP值分析每个特征对推荐结果的影响
2. 发现"价格"特征的SHAP值为负（模型偏好低价）
3. 根因：训练数据中低价商品的点击率天然更高（选择偏误）
4. 修正：在损失函数中加入"客单价"的加权，或做因果纠偏

---

（**换底正文在此截断** —— 完整卡正文共 288 行，本页内联到第 80 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户的交易或点击记录（购买/浏览过的商品列表）、商品与品类元数据、用于生成解释的规则来源（关联规则、知识图谱关系或 SHAP 特征贡献）；粒度为用户 × 推荐项。

**输出**：每条推荐附带的一句话解释（按推荐原因分类的模板文案，如「和您买的吸奶器很搭」）、解释类型效果排序与 A/B 对比结果；供推荐产品在推荐位展示，也可作为申诉材料说明推荐依据。

## 执行步骤

1. 从交易记录挖掘关联规则并计算支持度、置信度与提升度
2. 为每个推荐项匹配推荐原因（协同过滤/内容相似/知识关联/热门趋势/价格敏感）
3. 用模板或 LLM 把推荐原因渲染成一句话解释文案
4. 对有解释与无解释两版做 A/B 对比点击率
5. 按解释类型效果排序，固化表现最好的解释策略

## 边界与不做

- 数据不满足：交易记录过于稀疏（支持度低于 0.01 量级）时挖不出可用关联规则，解释会退化成通用文案。
- 何时不用：要提升的是搜索结果的排序质量，用「个性化搜索排序」；要解决的是爆款挤压长尾的曝光结构，用「推荐去偏」。
- 能力边界：只生成解释文案与效果对比，不改变推荐模型打分逻辑，也不保证解释与真实因果一致；卡页的 CTR 2.5%→3.2%（+28%）、申诉率 5%→1% 为案例口径。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank
- **可组合**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management、Skill-Explainable-Recommendation

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：05-推荐系统　·　源卡：`Skill-Explainable-Recommendation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（187 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Explainable-Recommendation`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1905.09237，但该号在 arXiv 上是《Arbitrary high-order, conservative and positive preserving Patankar-type deferred correction schemes》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Explainable Recommendation: A Survey and New Perspectives》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
