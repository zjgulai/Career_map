---
name: "p2s-user-lifecycle-stan"
title: "STAN 用户生命周期自适应建模"
description: "触发词：生命周期阶段识别、阶段标签、多任务权重自适应、分阶段推荐、新老客策略。何时不用：只按交易价值分层用 RFM 类技能，从购买品类序列推断婴儿月龄用月龄推断技能，本技能识别用户所处的行为生命周期阶段。安全边界：行为日志须在授权范围内采集并脱敏，分阶段策略不得用于歧视性定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/分群"
quality_tier: "curated"
p2s_card_id: "Skill-User-Lifecycle-STAN"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "CCF-B"
p2s_paper_id: "2306.12232"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-User-Lifecycle-STAN"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-User-Lifecycle-STAN.md"
rebase_source_sha256: "751ba4801f5bdf5a3b53ec5485ea70b674ce820ec8b05b30f54c5ae59e515e07"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "751ba4801f5bdf5a3b53ec5485ea70b674ce820ec8b05b30f54c5ae59e515e07"
rebase_full_card_bytes: "15802"
rebase_full_card_lines: "228"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "675265f514997185752b82247028b57a4457b1e91969b89393d9eaf1ebebf5f1"
user_summary: "认出用户处在认知、兴趣、购买还是忠诚阶段，给不同阶段配不同的推荐目标。"
user_try: "试试：用最近 90 天的行为日志给用户打生命周期阶段标签，并给出各阶段的推荐策略。"
whenToUse: "新客与老客用同一套策略导致新客流失快、老客触达疲劳时用本技能；只按交易价值分层用 RFM 类技能，要从购买序列推断婴儿月龄用月龄推断类技能。"
workflow: "接入 90 天行为日志与商品属性 → 用自注意力编码行为序列 → 输出生命周期阶段标签 → 计算阶段转移概率矩阵 → 按阶段调整推荐任务权重"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "false"
---
# STAN 用户生命周期自适应建模

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`，sha256 `751ba4801f5bdf5a3b53ec5485ea70b674ce820ec8b05b30f54c5ae59e515e07`，15802 字节 / 228 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 18 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `675265f514997185752b82247028b57a4457b1e91969b89393d9eaf1ebebf5f1`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: STAN 用户生命周期自适应建模

**论文来源**: STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation  
**arXiv ID**: [2306.12232](https://arxiv.org/abs/2306.12232)  
**发表会议**: RecSys 2023  
**适用领域**: 用户增长、生命周期运营、生命周期阶段标签（论文阶段名为 New / Wander / Stick / Loyal；**AIPL 为本项目映射，非论文概念**）

---

## ① 算法原理

### 核心思想

（**换底正文在此截断** —— 完整卡正文共 228 行，本页内联到第 13 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 18 条 —— **其余 12 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 18 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 12 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Existing methods generally formulate the optimization of these evaluation metrics as a multitask learning problem, but often overlook the fact that user preferences for different tasks are personalized and change over time. Identifying and tracking the evolution of user preferences can lead to better user retention."
> 出处：2306.12232 §Abstract（PDF 第 1 页）

> 原文："To address this issue, we introduce the concept of “user lifecycle,” consisting of multiple stages characterized by users’ varying preferences for different tasks."
> 出处：2306.12232 §Abstract（PDF 第 1 页）

> 原文："We propose a novel Stage-Adaptive Network (STAN) framework for modeling user lifecycle stages. STAN first identifies latent user lifecycle stages based on learned user preferences, and then employs the stage representation to enhance multi-task learning performance."
> 出处：2306.12232 §Abstract（PDF 第 1 页）

> 原文："It dynamically adjusts its focus on tasks according to the user’s stage, which is modeled by the representation of their preferences."
> 出处：2306.12232 §1 Introduction（PDF 第 2 页）

> 原文："we introduce the latent user stage representation module to adjust 𝑦˜𝑘 and generate a reliable preference"
> 出处：2306.12232 §3 阶段自适应模块（PDF 第 8 页）

> 原文："Note that the four discrete stages in Fig. 1 are merely examples for visualization purposes, and the actual stages in our model are represented by continuous vectors."
> 出处：2306.12232 §1 Introduction（PDF 第 2 页）——**边界**：论文的阶段是连续向量；本卡 ② 展示的离散标签用的是**论文自己**的 New / Wander / Stick / Loyal 命名（仅作业务解释），**AIPL 为本项目映射，非论文概念**

## 输入 / 输出契约

**输入**：用户行为日志（页面浏览、商品点击、加购、下单、复购，最近 90 天）、商品属性（品类如奶粉尿布辅食、适用阶段、品牌）、时间特征（距首次访问天数、距上次购买天数）。

**输出**：每个用户的生命周期阶段标签（认知、兴趣、购买、忠诚）、阶段转移概率矩阵与分阶段推荐策略配置（各阶段任务权重）；卡页口径转化率提升对应 GMV 约 176 万元、停留时间提升带来间接价值 50-100 万元。

## 执行步骤

1. 接入最近 90 天的用户行为日志与商品属性数据。
2. 用自注意力编码行为序列，学习用户状态表示。
3. 输出每个用户的生命周期阶段标签。
4. 计算阶段之间的转移概率矩阵，定位流失环节。
5. 按阶段自适应调整多任务推荐权重并回测转化。

## 边界与不做

- 行为日志覆盖不足（卡页要求最近 90 天）或行为过稀时不要用，阶段编码无法稳定区分新老客。
- 能力边界：本技能输出阶段标签与策略配置，不直接改动推荐系统；卡页的 GMV 与停留时间收益是按特定 GMV 规模与毛利率的测算，外推需重算。
- 合规红线：行为日志须在授权范围内采集并脱敏，分阶段策略不得用于歧视性定价。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit
- **可组合**：Skill-User-Lifecycle-STAN

---

> 分类：业务运营/品牌与增长/分群　·　技术族：06-增长模型　·　源卡：`Skill-User-Lifecycle-STAN`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（155 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`）。

- 论文：2306.12232
- 标题：STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
- venue 档位：CCF-B
- 证据基础：paper-verbatim
- 关联卡：Skill-Customer-Journey-Prototype.md, Skill-Uplift-Churn-Prediction.md

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`）。
>
> - 论文：2306.12232
> - 标题：STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
> - venue 档位：CCF-B
> - 证据基础：paper-verbatim
> - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-Uplift-Churn-Prediction.md
>
> - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2306.12232
> > - 标题：STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
> > - venue 档位：CCF-B
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-Uplift-Churn-Prediction.md
> >
> > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2306.12232
> > > - 标题：STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
> > > - venue 档位：CCF-B
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-Uplift-Churn-Prediction.md
> > >
> > > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-User-Lifecycle-STAN`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2306.12232
> > > > - 标题：STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
> > > > - venue 档位：CCF-B
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-Uplift-Churn-Prediction.md
> > > >
> > > > - 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2306.12232 — STAN: Stage-Adaptive Network for Multi-Task Recommendation by Learning User Lifecycle-Based Representation
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
