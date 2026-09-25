---
name: "p2s-deep-learning-recommendation-hi"
title: "Deep Learning Recommendation with Heterogeneous Inference"
description: "触发词：异构信息网络、深度学习推荐、多样性提升、长尾曝光、推荐单一。何时不用：要做偏差校正的无偏排序用「去混淆因果推荐」；要做图文多模态融合推荐用「多模态产品推荐」。安全边界：多样性不得以牺牲合规属性为代价，不得把不适龄商品推给错误人群；长尾扶持须设流量上限，避免挤压已验证的爆款转化。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 组合取舍"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Deep-Learning-Recommendation-HI"
p2s_src_domain: "05-推荐系统"
p2s_venue_tier: "preprint"
p2s_paper_id: "2009.12969"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Deep-Learning-Recommendation-HI"
rebase_vault_path: "paper2skills-vault/05-推荐系统/Skill-Deep-Learning-Recommendation-HI.md"
rebase_source_sha256: "0fe0d67f7b0877e91f7227200bbcd348421f6af63a5b5527b99f0d7eccf0336a"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "0fe0d67f7b0877e91f7227200bbcd348421f6af63a5b5527b99f0d7eccf0336a"
rebase_full_card_bytes: "16312"
rebase_full_card_lines: "346"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "e7775280ef01da16a6c77b73181d5c199a2ed927f4b3ba60a5c14238e45673d4"
user_summary: "让推荐别只围着奶粉纸尿裤转：把用户、商品、属性连成一张网络，给新品和长尾更多曝光。"
user_try: "试试：用异构信息网络重训首页推荐，看长尾商品曝光占比和列表多样性能不能上去。"
whenToUse: "当推荐过度集中在标品、用户抱怨推荐单一、新品拿不到曝光时用本技能；需要无偏排序校正用「去混淆因果推荐」；需要图像与文本联合表征用「多模态产品推荐」。"
workflow: "整理用户、商品与属性特征的交互数据 → 构建异构信息网络并训练嵌入 → 把多样性目标并入排序并输出 Top-50 列表 → 监控长尾曝光占比与列表内相似度 → 按业务约束设定多样性权重与流量上限"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "false"
---
# Deep Learning Recommendation with Heterogeneous Inference

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`，sha256 `0fe0d67f7b0877e91f7227200bbcd348421f6af63a5b5527b99f0d7eccf0336a`，16312 字节 / 346 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 17 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `e7775280ef01da16a6c77b73181d5c199a2ed927f4b3ba60a5c14238e45673d4`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Deep Learning Recommendation with Heterogeneous Inference

---

## ① 算法原理

### 核心思想
传统协同过滤只利用**正向交互**（用户点击、购买）来建模，忽略了**负向信号**（用户不点击、跳过）的价值。Heterogeneous Inference (HI) 通过同时建模两种推理模式：
- **p2p (positive-to-positive)**：正向到正向的收敛性推理
- **n2p (negative-to-positive)**：负向到正向的发散性推理

实现"既精准又多样"的推荐效果，解决推荐系统中常见的"信息茧房"和"过滤气泡"问题。

### 数学直觉
**传统矩阵分解**只建模用户-物品正反馈矩阵 X：
- 目标：找到低秩分解 X^TX ≈ PQ
- 局限：推荐结果收敛到热门物品，多样性不足

**HI方法**同时建模两个通道：

（**换底正文在此截断** —— 完整卡正文共 346 行，本页内联到第 20 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 17 条 —— **其余 11 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 17 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 11 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："We propose a new approach, heterogeneous inference, which extends the general collaborative filtering (CF) by introducing a new way of CF inference, negative-to-positive."
> 出处：2009.12969 §Abstract（PDF 第 1 页）

> 原文："To tackle this challenge at its core, we propose a new recommendation approach, Heterogeneous Inference (HI), which fundamentally extends the CF approach by introducing into CF a new channel of relevance inference, negative-to-positive (n2p) inference, in addition to the existing p2p inference."
> 出处：2009.12969 §Introduction（PDF 第 2 页）

> 原文："Because both the source item and target item in the inter-item similarity inference are positive feedback (a.k.a. positive engagement), we consider conventional CF being based on positive-to-positive (p2p) inference."
> 出处：2009.12969 §Introduction（PDF 第 1 页）——本卡「p2p 通道」的原文定义

> 原文："Like p2p, n2p makes the observation that when users are not interested in one item (i.e., the negative) they tend to be interested in some other items (i.e., the positive)."
> 出处：2009.12969 §Introduction（PDF 第 2 页）——本卡「n2p 通道」的原文定义

> 原文："CF only cares about positive correlation (p2p). HI leverages both positive correlation (p2p) and negative correlation (n2p) in one cohesive model."
> 出处：2009.12969 §Introduction（PDF 第 2 页）

> 原文："HI combines p2p and n2p inference in one cohesive recommendation model. It is able to gain relevance and diversity collaboratively as inherent outcomes of one relevance inference process, i.e., divergent relevance (DR)."
> 出处：2009.12969 §Our approach → HI for divergent relevance（PDF 第 4 页）

## 输入 / 输出契约

**输入**：交互数据（用户 ID、商品 ID、交互类型、时间戳）、用户特征（宝宝月龄、地区）与商品特征（类目、品牌）；粒度为单用户 × 一次推荐请求。

**输出**：每位用户的个性化推荐列表（卡页示例 Top-50）与多样性、长尾曝光监控指标；供推荐工程与运营评估结构调整效果。

## 执行步骤

1. 整理用户侧、商品侧与属性侧的交互数据
2. 构建异构信息网络并训练节点嵌入
3. 在排序目标中并入多样性约束
4. 输出 Top-50 推荐并监控长尾曝光占比
5. 用列表相似度与复购率评估结构调整效果

## 边界与不做

- 数据不满足：缺用户或商品侧特征、交互类型标注不完整时网络建不起来，先补数据。
- 何时不用：要做无偏排序校正用「去混淆因果推荐」；要图文多模态融合用「多模态产品推荐」。
- 能力边界：只做排序结构调整与多样性优化，不保证销量提升，也不替代业务保底曝光规则。
- 安全边界：多样性不得以牺牲合规属性为代价，不得把不适龄商品推给错误人群；长尾扶持须设流量上限。

## 技能关联

- **可组合**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer、Skill-Session-Based-Recommendation-SR-GNN.html、Skill-Session-Based-Recommendation-SR-GNN、Skill-Deep-Learning-Recommendation-HI

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Deep-Learning-Recommendation-HI`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（171 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`）。

- 论文：2009.12969
- 标题：Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
- venue 档位：preprint
- 证据基础：paper-verbatim
- 关联卡：Skill-Session-Based-Recommendation-SR-GNN.md, Skill-NeuralNDCG-Learning-to-Rank.md

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`）。
>
> - 论文：2009.12969
> - 标题：Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
> - venue 档位：preprint
> - 证据基础：paper-verbatim
> - 关联卡：Skill-Session-Based-Recommendation-SR-GNN.md, Skill-NeuralNDCG-Learning-to-Rank.md
>
> - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2009.12969
> > - 标题：Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-Session-Based-Recommendation-SR-GNN.md, Skill-NeuralNDCG-Learning-to-Rank.md
> >
> > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2009.12969
> > > - 标题：Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-Session-Based-Recommendation-SR-GNN.md, Skill-NeuralNDCG-Learning-to-Rank.md
> > >
> > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Deep-Learning-Recommendation-HI`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2009.12969
> > > > - 标题：Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-Session-Based-Recommendation-SR-GNN.md, Skill-NeuralNDCG-Learning-to-Rank.md
> > > >
> > > > - 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2009.12969 — Simultaneous Relevance and Diversity: A New Recommendation Inference Approach
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
