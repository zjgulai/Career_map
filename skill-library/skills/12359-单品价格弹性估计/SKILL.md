---
name: "p2s-monodense"
title: "Skill: Monodense 单品价格弹性估计"
description: "触发词：单品弹性、无需对照实验、高维特征弹性、SKU 分层、以价换量、溢价定价。何时不用：要用工具变量处理内生性时用「工具变量 IV 识别价格弹性」；要覆盖多 SKU 交互定价时用「MAPPO+GAT 多 SKU 协同定价」。安全边界：弹性结论只用于定价策略分层，不得据单一模型输出自动改价，差异化定价需过合规。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
quality_tier: "curated"
p2s_card_id: "Skill-Monodense-单品价格弹性估计"
p2s_src_domain: "04-供应链"
p2s_venue_tier: "preprint"
p2s_paper_id: "2603.29261"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Monodense-单品价格弹性估计"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Monodense-单品价格弹性估计.md"
rebase_source_sha256: "f74d96356aa91af0624cf4dc16e86ec6013a01e808f5894d09c1e4e3a7a6c935"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "f74d96356aa91af0624cf4dc16e86ec6013a01e808f5894d09c1e4e3a7a6c935"
rebase_full_card_bytes: "14266"
rebase_full_card_lines: "270"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "3470724615eaa482a78574f85ee3ec0c0178d58863608b2cc009c5233131d5e8"
user_summary: "不用逐个做对照实验也能看清单品的价格敏感度，从而分出该降价的引流款和该溢价的利润款。"
user_try: "试试：把我各平台的月销量、价格、促销标记和竞品价格整理好，帮我给每个 SKU 估一版弹性并做高低弹性分层。"
whenToUse: "当 SKU 数量多、特征维度高（竞品价格、季节、产品属性），且不想为每个单品做对照实验时用本技能；若追求识别上的严谨、要用工具变量处理内生性，用「工具变量 IV 识别价格弹性」；要处理 SKU 间交叉弹性，用「MAPPO+GAT 多 SKU 协同定价」。"
workflow: "整合各平台历史销售数据：月销量、价格、促销标记与库存状态 → 补齐竞品价格、季节性标记与产品属性特征 → 训练 Monodense 深度模型预测不同价格下的需求量 → 计算弹性并区分高弹性与低弹性商品 → 按弹性分层输出竞争性低价或溢价策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "24"
rebase_evidence_quotes_complete: "false"
---
# Skill: Monodense 单品价格弹性估计

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`，sha256 `f74d96356aa91af0624cf4dc16e86ec6013a01e808f5894d09c1e4e3a7a6c935`，14266 字节 / 270 行 / 24 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 24 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `3470724615eaa482a78574f85ee3ec0c0178d58863608b2cc009c5233131d5e8`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Monodense 单品价格弹性估计

## 一、算法原理

### 核心思想

传统价格弹性估计依赖计量经济学方法（log-log OLS、AIDS 等），需要强函数形式假设，且难以处理高维商品特征、季节性、竞品价格等复杂交互。Walmart 团队提出的 **Monodense Deep Learning Model (DLM)** 通过深度学习实现**无需对照实验（treatment-control free）**的单品级弹性估计。

核心创新是 **Monodense 层**：在神经网络中通过权重符号约束，强制价格与需求的单调递减关系（价格↓→需求↑）。这确保模型在经济意义上始终输出负弹性，避免了传统神经网络因数据噪声而学到"涨价反而畅销"的荒谬模式。

### 数学直觉

**1. 价格弹性定义**

$$

（**换底正文在此截断** —— 完整卡正文共 270 行，本页内联到第 16 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 24 条 —— **其余 14 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 24 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 14 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Item Price Elasticity is used to quantify the responsiveness of consumer demand to changes in item prices, enabling businesses to create pricing strategies and optimize revenue management."
> 出处：2603.29261 §Abstract（PDF 第 1 页）

> 原文："Price elasticity of demand measures sensitivity of consumer demand to changes in item prices. To make economic and business sense this elasticity of demand measure will be always negative."
> 出处：2603.29261 §I Introduction 式 (1) 前（PDF 第 2 页）

> 原文："In this paper, we model item-level price elasticity using large-scale transactional datasets, by proposing a novel elasticity estimation framework which has the capability to work in an absence of treatment control setting."
> 出处：2603.29261 §Abstract（PDF 第 1 页）

> 原文："1) Monodense-DL network – Hybrid neural network architecture combining embedding, dense, and Monodense layers 2) DML – Double machine learning setting using regression models 3) LGBM – Light Gradient Boosting Model"
> 出处：2603.29261 §Abstract（PDF 第 1 页）——本卡「三模型对比」的口径来源

> 原文："Traditional approaches to elasticity estimation, such as econometric models, often assume linear or exponential relationships between demand and price and fail to capture complex, non-linear, and non exponential patterns."
> 出处：2603.29261 §I Introduction（PDF 第 1 页）

> 原文："Moreover these traditional econometric approaches fail to scale across millions of items due to price and business constraints of running control/treatment (C/T) experiments across the whole item universe."
> 出处：2603.29261 §I Introduction（PDF 第 1 页）

> 原文："2) No requirement for a creation C/T group or the need to run recurrent expensive experiments."
> 出处：2603.29261 §III.A 框架优势（PDF 第 3 页）

> 原文："This monodense layer ensures that in the learned price to demand relationship a decrease in price results in an increase in demand and vice versa."
> 出处：2603.29261 §III.B Proposed Monodense-DLM network（PDF 第 4 页）

> 原文："Our proposed Monodense DLM ensures that the final evaluated item elasticities are always negative, thereby making them economically consistent, as it bakes in the monotonicity between price and demand while modeling the demand to price relationship."
> 出处：2603.29261 §II.B Machine-learning based methods（PDF 第 3 页）

> 原文："We apply weight constraints based on a monotonicity indicator vector t, where each element ti corresponds to a feature xi ."
> 出处：2603.29261 §III.B 单调性权重约束（PDF 第 4 页）

## 输入 / 输出契约

**输入**：各平台历史销售数据（月销量、价格、促销标记、库存状态），以及竞品价格、季节性标记与产品属性（容量、材质、功能）等特征；粒度为单品 × 月。

**输出**：每个单品的弹性估计与高/低弹性分层，以及对应的定价策略建议（高弹性走竞争性低价、低弹性走溢价）；供定价与品类运营使用。

## 执行步骤

1. 整合各平台的月销量、价格、促销标记与库存状态数据
2. 补齐竞品价格、季节性标记与产品属性特征工程
3. 训练模型预测不同价格下的需求量
4. 计算并区分高弹性与低弹性商品
5. 按弹性分层输出以价换量或溢价策略

## 边界与不做

- 数据不满足：缺少月级销量与价格标记，或缺竞品与属性特征时估不准弹性，先补特征。
- 何时不用：需要工具变量处理内生性用「工具变量 IV 识别价格弹性」；多 SKU 交叉弹性用「MAPPO+GAT 多 SKU 协同定价」。
- 能力边界：卡页未附完整代码模板，落地需另取原始实现；本技能只给弹性与策略分层，不含改价执行。
- 安全边界：弹性结论不得作为自动改价的唯一依据，涉及差异化定价时须过合规。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Monodense-单品价格弹性估计

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：04-供应链　·　源卡：`Skill-Monodense-单品价格弹性估计`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`）。

- 论文：2603.29261
- 标题：arXiv:2603.29261
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`）。
>
> - 论文：2603.29261
> - 标题：arXiv:2603.29261
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2603.29261
> > - 标题：arXiv:2603.29261
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2603.29261
> > > - 标题：arXiv:2603.29261
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Monodense-单品价格弹性估计`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2603.29261
> > > > - 标题：arXiv:2603.29261
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2603.29261 — Monodense Deep Neural Model for Determining Item Price Elasticity
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
