---
name: "p2s-neuralndcg-learning-to-rank"
title: "NeuralNDCG — 可微分排序优化与Learning to Rank"
description: "触发词：排序优化、NeuralNDCG、可微分排序、偏好对训练、NDCG@10。何时不用：要做的是依赖用户画像的个性化重排时用「个性化搜索排序」；要先解决意图识别再排序时用「搜索层次化意图分类」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
quality_tier: "curated"
p2s_card_id: "Skill-NeuralNDCG-Learning-to-Rank"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "preprint"
p2s_paper_id: "2102.07831"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-NeuralNDCG-Learning-to-Rank"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-NeuralNDCG-Learning-to-Rank.md"
rebase_source_sha256: "b4295102c5b61cc589385984082339d00201385e61cae109d8ba277c31f8279f"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b4295102c5b61cc589385984082339d00201385e61cae109d8ba277c31f8279f"
rebase_full_card_bytes: "20810"
rebase_full_card_lines: "386"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "03e07400ca9e6cc1954c02bd7b606d1f70050b3b99da671da1fc7d495b1d3ce9"
user_summary: "让排序模型直接对着「排在前面的是不是用户最想要的」这个指标去学，而不是拿别的分数凑。"
user_try: "试试：用点击日志训练一版以 NDCG@10 为目标的排序模型，对比现在的销量排序效果。"
whenToUse: "当排序目标与训练损失不匹配（业务看 NDCG、模型练交叉熵或 MSE）、前几位点击率低时用本技能；要做依赖用户画像的个性化重排，用「个性化搜索排序」；要先解决意图识别，用「搜索层次化意图分类」。"
workflow: "准备商品、用户与交互三类排序特征 → 从点击日志构造偏好对训练初始模型 → 用 NeuralNDCG 损失做 listwise 精调 → 以 NDCG@10 评估并上线 A/B"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "25"
rebase_evidence_quotes_complete: "false"
---
# NeuralNDCG — 可微分排序优化与Learning to Rank

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`，sha256 `b4295102c5b61cc589385984082339d00201385e61cae109d8ba277c31f8279f`，20810 字节 / 386 行 / 25 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 25 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `03e07400ca9e6cc1954c02bd7b606d1f70050b3b99da671da1fc7d495b1d3ce9`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# NeuralNDCG — 可微分排序优化与Learning to Rank

## 1. 算法原理

Learning to Rank（LTR）的核心问题是**排序评估指标与训练损失函数之间的不匹配**。模型用交叉熵或MSE训练，但业务用 NDCG 评估——这就像用"练习册分数"预测"考试成绩"，两者可能背道而驰。

### 三种LTR范式

| 范式 | 核心思想 | 代表方法 | 优缺点 |
|------|---------|---------|--------|
| **Pointwise** | 将排序转化为独立回归/分类 | MLP打分、MSE损失 | 简单快速，但忽略item间相对关系 |
| **Pairwise** | 比较两两item的偏好顺序 | RankNet、LambdaRank | 捕获相对偏好，但计算量大 |

（**换底正文在此截断** —— 完整卡正文共 386 行，本页内联到第 13 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 25 条 —— **其余 16 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 25 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 16 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Learning to Rank (LTR) algorithms are usually evaluated using Information Retrieval metrics like Normalised Discounted Cumulative Gain (NDCG) or Mean Average Precision."
> 出处：2102.07831 §Abstract（PDF 第 1 页）

> 原文："As these metrics rely on sorting predicted items’ scores (and thus, on items’ ranks), their derivatives are either undefined or zero everywhere. This makes them unsuitable for gradient-based optimisation, which is the usual method of learning appropriate scoring functions."
> 出处：2102.07831 §Abstract（PDF 第 1 页）

> 原文："Commonly used LTR loss functions are only loosely related to the evaluation metrics, causing a mismatch between the optimisation objective and the evaluation criterion."
> 出处：2102.07831 §Abstract（PDF 第 1 页）——本卡开篇「评估指标与训练损失不匹配」的原文依据

> 原文："In this paper, we address this mismatch by proposing NeuralNDCG, a novel differentiable approximation to NDCG."
> 出处：2102.07831 §Abstract（PDF 第 1 页）

> 原文："Since NDCG relies on the nondifferentiable sorting operator, we obtain NeuralNDCG by relaxing that operator using NeuralSort, a differentiable approximation of sorting."
> 出处：2102.07831 §Abstract（PDF 第 1 页）——NeuralSort 可微松弛的原文依据

> 原文："As a result, we obtain a new ranking loss function which is an arbitrarily accurate approximation to the evaluation metric, thus closing the gap between the training and the evaluation of LTR models."
> 出处：2102.07831 §Abstract（PDF 第 1 页）

> 原文："We introduce two variants of the proposed loss function."
> 出处：2102.07831 §Abstract（PDF 第 1 页）

> 原文："Such loss functions fall into one of three categories: pointwise, pairwise or listwise. Pointwise approaches treat the problem as a simple regression or classification of the ground truth relevancy for each individual search result, foregoing possible interactions between items. In pairwise approaches, pairs of items are considered as independent variables and the function is learned to correctly indicate the preference among the pair. Examples include RankNet [5], LambdaRank [6] or LambdaMART [7]."
> 出处：2102.07831 §1 Introduction（PDF 第 2 页）——本卡「三种 LTR 范式」表的原文依据

> 原文："However, IR metrics consider entire search results lists at once, unlike pointwise and pairwise algorithms. This mismatch has motivated listwise approaches, which compute the loss based on the scores of the entire list of search results. Two popular listwise approaches are ListNet [8] and ListMLE [29]."
> 出处：2102.07831 §1 Introduction（PDF 第 2 页）

## 输入 / 输出契约

**输入**：排序特征（商品特征：价格/评分/评论数/退货率/库存深度；用户特征：浏览与购买历史/地域/设备；交互特征：CTR/加购率/转化率）与点击日志中的偏好对；粒度为 查询 × 候选商品。

**输出**：训练好的排序模型与优化后的 Top-10 排序结果（卡页口径搜索转化率提升 10-15%、新品曝光增加 30%）；供搜索工程团队上线精排层。

## 执行步骤

1. 准备商品、用户与交互三类排序特征
2. 从点击日志构造 pairwise 偏好对（点击优于未点击）训练初始排序模型
3. 用 NeuralNDCG 损失（可微分排序加 Sinkhorn 归一化）做 listwise 精调
4. 直接以 NDCG@10 为优化与评估目标验证效果
5. 上线精排并 A/B 对比转化率与新品曝光占比

## 边界与不做

- 数据不满足：没有点击日志构造偏好对时无法做 pairwise 与 listwise 训练，先补日志。
- 何时不用：要做依赖用户历史画像的个性化重排，用「个性化搜索排序」；要先解决查询意图识别再排序，用「搜索层次化意图分类」。
- 能力边界：只优化排序目标，不改变召回集合，也不解决意图识别问题；卡页的年 GMV 增量约 ¥4380 万为按日均 10 万 UV 的假设推演，不是承诺。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR
- **可组合**：Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN、Skill-NeuralNDCG-Learning-to-Rank

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：05-推荐系统　·　源卡：`Skill-NeuralNDCG-Learning-to-Rank`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（169 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`）。

- 论文：2102.07831
- 标题：arXiv:2102.07831
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：25 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`）。
>
> - 论文：2102.07831
> - 标题：arXiv:2102.07831
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：25 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2102.07831
> > - 标题：arXiv:2102.07831
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：25 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2102.07831
> > > - 标题：arXiv:2102.07831
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：25 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-NeuralNDCG-Learning-to-Rank`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2102.07831
> > > > - 标题：arXiv:2102.07831
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：25 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2102.07831 — NeuralNDCG: Direct Optimisation of a Ranking Metric via Differentiable Relaxation of Sorting
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
