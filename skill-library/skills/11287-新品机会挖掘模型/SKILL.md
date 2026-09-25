---
name: "p2s-new-product-opportunity-mining"
title: "New Product Opportunity Mining (新品机会挖掘模型)"
description: "触发词：新品成功概率、机会挖掘、区域优先级、投资建议、组合取舍。何时不用：只判断品类容量大小用「Market Size Estimation」；只做单品加权评分卡用「Product Opportunity Scoring」。安全边界：概率评分用于内部排序取舍，不得对外承诺成功率；训练用历史样本与当前品类不可比时须标注置信度下降。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 组合取舍"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
quality_tier: "curated"
p2s_card_id: "Skill-New-Product-Opportunity-Mining"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "preprint"
p2s_paper_id: "2405.19456"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-New-Product-Opportunity-Mining"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-New-Product-Opportunity-Mining.md"
rebase_source_sha256: "8a72faf6e4db303249c7f171c93332d946c9a10311dd3825492bc6d22f467f94"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "8a72faf6e4db303249c7f171c93332d946c9a10311dd3825492bc6d22f467f94"
rebase_full_card_bytes: "32455"
rebase_full_card_lines: "744"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "089bfd0447dc15cb8617bf1fec0620045f14492ec106834eecef7f8d0f6329f3"
user_summary: "在上新品前，用市场、产品、执行、时机四个维度的评估框架预测成功概率，并给出先投哪个市场、投多少力度的建议。"
user_try: "试试：评估智能穿戴式吸奶器值不值得投，并排出美国、欧洲、东南亚的首发优先级。"
whenToUse: "要在多个新品之间做资源取舍、并需要区域投放优先级时用本技能；若只需判断品类容量区间，用「Market Size Estimation」；若只要一张单品加权评分卡，用「Product Opportunity Scoring」。"
workflow: "汇总区域市场数据、产品数据、团队数据与时机数据 → 按 18 个维度计算市场、产品、执行、时机四组得分 → 合成 0-100% 的新品成功概率评分 → 排出区域进入优先级 → 输出投资建议与关键风险提示"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "5"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "false"
---
# New Product Opportunity Mining (新品机会挖掘模型)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`，sha256 `8a72faf6e4db303249c7f171c93332d946c9a10311dd3825492bc6d22f467f94`，32455 字节 / 744 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 5 条（共 17 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `089bfd0447dc15cb8617bf1fec0620045f14492ec106834eecef7f8d0f6329f3`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: New Product Opportunity Mining (新品机会挖掘模型)

---

## ① 算法原理

### 核心思想

新品机会挖掘模型解决的核心问题是：**在新商品上市前预测其成功概率，从而优化选品决策和资源配置**。与传统的事后分析不同，该模型通过多维度评估框架，在投入大量资源前识别高潜力新品。

该框架源自 [SSFF (Startup Success Forecasting Framework)](https://arxiv.org/abs/2405.19456) 研究，将创业成功预测方法论迁移到电商新品场景。

### 数学直觉

**LLM-Enhanced Random Forest (LLM-RF)**:

$$
P(success|X) = \frac{1}{M} \sum_{m=1}^{M} I(h_m(X) = 1)
$$

其中 $h_m$ 是第 $m$ 棵决策树，$X = \{x_1, x_2, ..., x_{14}\}$ 是14个维度的特征向量。


（**换底正文在此截断** —— 完整卡正文共 744 行，本页内联到第 23 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 5 / 全 17 条 —— **其余 12 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 17 条逐字引文。本页按完整卡顺序内联**前 5 条整条引文**（不在引文中间断开）；其余 12 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："The conventional Random Forest algorithm, celebrated for its effectiveness and explainability, often faces challenges with categorical variables due to its inherent design constraints. To overcome these limitations, we introduce an LLM-based "Fuzzy" Random Forest model."
> 出处：2405.19456 §4.1.1 Model Design（PDF 第 4 页）

> 原文："This process is guided by a Chain of Thought prompting technique, where the LLM is presented with a series of questions designed to elicit specific insights into various aspects of a startup’s potential for success."
> 出处：2405.19456 §4.1.2 LLM-Based Categorical Data Extraction（PDF 第 5 页）

> 原文："In our framework, startup and founder information is processed through an LLM to categorize data across 14 dimensions, including industry growth, market size, development pace, and product-market fit, among others."
> 出处：2405.19456 §4.1.1 Model Design（PDF 第 4 页）——随机森林特征抽取用的是 **14** 维；本卡正文的「18 维度」见下一条

> 原文："Initially, the data undergoes a preliminary review by a VC scout agent who synthesizes the information into 18 critical dimensions."
> 出处：2405.19456 §7.1 Framework Design（PDF 第 13 页）——**18 维度**是 SSFF 框架层（VC scout agent 汇总）的口径，与 §4.1.1 随机森林的 14 维不是同一层

> 原文："The application of this model to a dataset comprising 1400 startups—equally split between successful and unsuccessful cases—yielded promising results."
> 出处：2405.19456 §4.1.1 Model Design（PDF 第 4 页）

## 输入 / 输出契约

**输入**：区域市场数据（搜索量、竞品数量、价格带分布）、产品数据（功能清单、专利情况、预计成本价、FDA/CE 等认证状态）、团队数据（母婴品类运营经验、供应链稳定性评分）、时机数据（竞品上市时间、平台政策变化）。

**输出**：0-100% 的新品成功概率评分 + 市场可行性 / 产品可行性 / 执行能力三维细分得分 + 区域优先级排序 + 全力投入 / 试点测试 / 暂缓观望的投资建议与关键风险提示。

## 执行步骤

1. 收集市场、产品、团队与时机四类数据
2. 按 18 个维度计算四组维度得分
3. 合成新品成功概率评分
4. 排出区域进入优先级
5. 输出投资建议与关键风险提示

## 边界与不做

- 极度创新的全新品类、或季节性极强的短期爆款不适用（缺乏可比历史数据，时机维度会主导结果）
- 概率评分用于内部排序与取舍，不得对外承诺成功率；训练样本与当前品类可比性下降时须显式标注
- 不替代财务测算与合规认证结论

## 技能关联

- **前置**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation
- **可组合**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management、Skill-New-Product-Opportunity-Mining

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：06-增长模型　·　源卡：`Skill-New-Product-Opportunity-Mining`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（502 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`）。

- 论文：2405.19456
- 标题：An Automated Startup Evaluation Pipeline: Startup Success Forecasting Framework (SSFF)
- venue 档位：preprint
- 证据基础：paper-verbatim
- 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Customer-Journey-Prototype.md

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`）。
>
> - 论文：2405.19456
> - 标题：An Automated Startup Evaluation Pipeline: Startup Success Forecasting Framework (SSFF)
> - venue 档位：preprint
> - 证据基础：paper-verbatim
> - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Customer-Journey-Prototype.md
>
> - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2405.19456
> > - 标题：An Automated Startup Evaluation Pipeline: Startup Success Forecasting Framework (SSFF)
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Customer-Journey-Prototype.md
> >
> > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2405.19456
> > > - 标题：An Automated Startup Evaluation Pipeline: Startup Success Forecasting Framework (SSFF)
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Customer-Journey-Prototype.md
> > >
> > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-New-Product-Opportunity-Mining`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2405.19456
> > > > - 标题：An Automated Startup Evaluation Pipeline: Startup Success Forecasting Framework (SSFF)
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-Cold-Start-Product-Recommendation.md, Skill-Customer-Journey-Prototype.md
> > > >
> > > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2405.19456，但该号在 arXiv 上是《SSFF: Investigating LLM Predictive Capabilities for Startup Success through a Multi-Agent Framework with Enhanced Explainability and Performance》，与本卡主题无关。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
