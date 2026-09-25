---
name: "p2s-cold-start-product-recommendation"
title: "Cold-Start Product Recommendation (冷启动商品推荐)"
description: "触发词：冷启动推荐、新品曝光、内容特征匹配、目标人群、零销量上架。何时不用：要跨站点零样本迁移推荐用「图基础模型推荐」；要生成商品嵌入做新品推荐用「扩散模型推荐」。安全边界：商品标题与描述必须真实，不得为提高匹配度堆砌未经验证的属性或认证；无描述、无图片的商品不适用本技能。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化"
l1_l2_l3: "业务运营/渠道经营/转化优化"
quality_tier: "curated"
p2s_card_id: "Skill-Cold-Start-Product-Recommendation"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "CCF-B"
p2s_paper_id: "2402.09176"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Cold-Start-Product-Recommendation"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-Cold-Start-Product-Recommendation.md"
rebase_source_sha256: "8b7d41c0b3cbcafccd3d1459d623892236f6da9c59d0c683aceef63308958604"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "8b7d41c0b3cbcafccd3d1459d623892236f6da9c59d0c683aceef63308958604"
rebase_full_card_bytes: "32838"
rebase_full_card_lines: "760"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "9128229b54cef2f59e8e62e28eaabed88e4d7bed159e7899a46d1644defa59bf"
user_summary: "新品上架零销量零评价，先用商品内容和用户画像找出最可能买单的那批人。"
user_try: "试试：这款上架第一天、零销量的吸奶器，帮我从现有用户里找出最可能购买的人群并给出候选清单。"
whenToUse: "当新品或新 SKU 完全没有历史交互、只能靠内容特征与用户画像做首批推荐时用本技能；要跨站点零样本迁移推荐用「图基础模型推荐」；要生成理想商品嵌入用「扩散模型推荐」。"
workflow: "整理新品内容特征：标题、描述、类目、价格、图片 → 提取用户画像与历史交互偏好 → 按内容与画像匹配候选用户并排序 → 输出新品冷启动推荐清单 → 回收首周交互数据，衔接后续模型训练"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "7"
rebase_evidence_quotes_total: "20"
rebase_evidence_quotes_complete: "false"
---
# Cold-Start Product Recommendation (冷启动商品推荐)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`，sha256 `8b7d41c0b3cbcafccd3d1459d623892236f6da9c59d0c683aceef63308958604`，32838 字节 / 760 行 / 20 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 7 条（共 20 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `9128229b54cef2f59e8e62e28eaabed88e4d7bed159e7899a46d1644defa59bf`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Cold-Start Product Recommendation (冷启动商品推荐)

---

## ① 算法原理

### 核心思想

冷启动商品推荐解决的核心问题是：**新商品没有历史交互数据时，如何精准推荐给用户**。传统方法通过内容特征生成合成嵌入向量，但这会造成冷商品和热商品之间的表征差距。本框架采用**LLM用户行为模拟**的全新思路：让大语言模型基于世界知识和推理能力，模拟用户可能如何与新商品交互。

该框架源自 [ColdLLM: Large Language Model Simulator for Cold-Start Recommendation](https://arxiv.org/abs/2402.09176)，WSDM 2025 接受论文。

### 数学直觉

**传统方法 vs LLM模拟方法**

传统方法（合成嵌入）：
$$
\mathbf{e}_i^{cold} = f_{DNN}(\mathbf{c}_i)
$$


（**换底正文在此截断** —— 完整卡正文共 760 行，本页内联到第 22 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 7 / 全 20 条 —— **其余 13 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 20 条逐字引文。本页按完整卡顺序内联**前 7 条整条引文**（不在引文中间断开）；其余 13 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Recommending cold items remains a significant challenge in billion-scale online recommendation systems. While warm items benefit from historical user behaviors, cold items rely solely on content features, limiting their recommendation performance and impacting user experience and revenue."
> 出处：2402.09176v2 §Abstract

> 原文："Current models generate synthetic behavioral embeddings from content features but fail to address the core issue: the absence of historical behavior data."
> 出处：2402.09176v2 §Abstract

> 原文："To manage the computational complexity, we propose a coupled funnel ColdLLM framework for online recommendation. ColdLLM efficiently reduces the number of candidate users from billions to hundreds using a trained coupled filter, allowing the LLM to operate efficiently and effectively on the filtered set."
> 出处：2402.09176v2 §Abstract —— 卡片 ① 段「十亿→百级候选」与 ② 段「Coupled Funnel 双阶段架构」的出处

> 原文："Extensive experiments show that ColdLLM significantly surpasses baselines in cold-start recommendations, including Recall and NDCG metrics. A two-week A/B test also validates that ColdLLM can effectively increase the cold-start period GMV."
> 出处：2402.09176v2 §Abstract —— 卡片 ② 段「两周 A/B 测试 … GMV」的出处

> 原文："In this subsection, we propose the coupled-funnel ColdLLM to incorporate coupled filter models efficiently and effectively simulate cold item behaviors."
> 出处：2402.09176v2 §4.2 Coupled Funnel ColdLLM

> 原文："To filter users who are likely to interact with the cold item, we consider both content embeddings and behavioral embeddings. We use the dot product of the mapped user embedding and the mapped item embedding to identify the top-$K$ highest score candidates"
> 出处：2402.09176v2 §4.2.1 Filtering Simulation 式 (7)

> 原文："We opted for a top-k value of 20."
> 出处：2402.09176 §5.1.3 Hyperparameter Setting（PDF 第 6 页）

## 输入 / 输出契约

**输入**：商品内容特征（标题、描述、类目、价格、图片）与用户画像及历史交互（浏览、购买、偏好标签）；粒度为单个新品 × 用户。

**输出**：针对新品的候选用户与推荐清单（含匹配依据）；供运营与推荐系统做首批曝光与人群投放。

## 执行步骤

1. 整理新品的标题、描述、类目、价格与图片特征
2. 提取用户画像与历史交互偏好标签
3. 按内容与画像匹配候选用户并排序
4. 输出冷启动推荐清单并投放首批曝光
5. 回收首周交互数据，衔接后续模型训练

## 边界与不做

- 数据不满足：商品只有 ID、缺描述与图片时匹配不出人群（卡页明确列为不适用），先补齐商品内容。
- 何时不用：要跨站点零样本迁移用「图基础模型推荐」；要生成商品嵌入用「扩散模型推荐」；季度上新不足 10 个 SKU 的低频品类人工策略更划算。
- 能力边界：只解决首批曝光的人群匹配，不承担后续排序模型训练，也不保证卡页口径的 CTR 提升。
- 安全边界：商品标题与描述必须真实，不得为提高匹配度堆砌未经验证的属性或认证表述。

## 技能关联

- **前置**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM
- **延伸**：Skill-New-Product-Opportunity-Mining.html、Skill-New-Product-Opportunity-Mining
- **可组合**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Cold-Start-Product-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：06-增长模型　·　源卡：`Skill-Cold-Start-Product-Recommendation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（445 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`）。

- 论文：2402.09176
- 标题：Large Language Model Simulator for Cold-Start Recommendation
- venue 档位：CCF-B
- 证据基础：paper-verbatim
- 关联卡：Skill-New-Product-Opportunity-Mining.md, Skill-Uplift-Churn-Prediction.md

- 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`）。
>
> - 论文：2402.09176
> - 标题：Large Language Model Simulator for Cold-Start Recommendation
> - venue 档位：CCF-B
> - 证据基础：paper-verbatim
> - 关联卡：Skill-New-Product-Opportunity-Mining.md, Skill-Uplift-Churn-Prediction.md
>
> - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2402.09176
> > - 标题：Large Language Model Simulator for Cold-Start Recommendation
> > - venue 档位：CCF-B
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-New-Product-Opportunity-Mining.md, Skill-Uplift-Churn-Prediction.md
> >
> > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2402.09176
> > > - 标题：Large Language Model Simulator for Cold-Start Recommendation
> > > - venue 档位：CCF-B
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-New-Product-Opportunity-Mining.md, Skill-Uplift-Churn-Prediction.md
> > >
> > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Cold-Start-Product-Recommendation`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2402.09176
> > > > - 标题：Large Language Model Simulator for Cold-Start Recommendation
> > > > - venue 档位：CCF-B
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-New-Product-Opportunity-Mining.md, Skill-Uplift-Churn-Prediction.md
> > > >
> > > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2402.09176 — Large Language Model Simulator for Cold-Start Recommendation
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
