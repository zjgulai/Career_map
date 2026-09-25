---
name: "p2s-intelligent-prediction-doubly-robust"
title: "智能预测 - 双重稳健估计 (Doubly Robust Estimation)"
description: "触发词：促销增量预测、双重稳健、反事实销量、促销决策、置信区间。何时不用：促销已结束只需复盘净增量时用反事实评估（合成控制）；渠道间效应对比走渠道效应类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
quality_tier: "curated"
p2s_card_id: "Skill-Intelligent-Prediction-Doubly-Robust"
p2s_src_domain: "03-时间序列"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Intelligent-Prediction-Doubly-Robust"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Intelligent-Prediction-Doubly-Robust.md"
rebase_source_sha256: "7fa7edcbf4797f39cd1d4f2beaca16b0a8d1485f6e849663671c079244e8ba15"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "7fa7edcbf4797f39cd1d4f2beaca16b0a8d1485f6e849663671c079244e8ba15"
rebase_full_card_bytes: "19157"
rebase_full_card_lines: "505"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "071fcc6ea589d8dc2de4f8bb67617adc50f786e5bf18bb2b2de08eefc07bf444"
user_summary: "在决定要不要做这场促销之前，先算出不做促销会卖多少，用增量而不是总销量判断这笔预算值不值。"
user_try: "试试：帮我预测母亲节吸奶器促销的增量销量，判断这笔促销预算值不值得投。"
whenToUse: "当要在促销投入前预测净增量、据此决定是否促销或调整力度时用；促销已经结束只需复盘净增量时用反事实评估（合成控制）；若是渠道之间的效应对比，用双重稳健渠道效应类技能。"
workflow: "整理历史销量、库存、竞品价格与历史促销记录等特征 → 用交叉拟合分别训练结果模型与倾向评分模型 → 按双重稳健公式估计促销的增量销量与置信区间 → 做稳健性诊断，比较倾向评分与结果模型哪一个更可靠 → 用增量与成本比较给出是否促销、以何种力度的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# 智能预测 - 双重稳健估计 (Doubly Robust Estimation)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`，sha256 `7fa7edcbf4797f39cd1d4f2beaca16b0a8d1485f6e849663671c079244e8ba15`，19157 字节 / 505 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `071fcc6ea589d8dc2de4f8bb67617adc50f786e5bf18bb2b2de08eefc07bf444`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 智能预测 - 双重稳健估计 (Doubly Robust Estimation)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
Doubly Robust Estimation（双重稳健估计）是一种**鲁棒的因果推断方法**，它结合了倾向评分（Propensity Score）和结果回归（Outcome Regression）两种估计量。其核心优势在于：**只要两种模型中有一种被正确设定，估计量就是一致的**。这使其成为预测任务中对抗模型误设风险的利器。

在智能预测场景中，我们不仅关注"会发生什么"，更关注"干预会产生什么效果"。双重稳健估计提供了在这种反事实预测中最可靠的估计框架。

### 数学直觉

**目标**：估计平均处理效应 (ATE)
$$\tau = E[Y(1) - Y(0)]$$

**双重稳健估计量**：
$$\hat{\tau}_{DR} = \frac{1}{n} \sum_{i=1}^{n} \left[ \hat{\mu}_1(X_i) - \hat{\mu}_0(X_i) + \frac{T_i(Y_i - \hat{\mu}_1(X_i))}{\hat{e}(X_i)} - \frac{(1-T_i)(Y_i - \hat{\mu}_0(X_i))}{1-\hat{e}(X_i)} \right]$$

其中：
- $\hat{\mu}_t(X)$：结果回归模型（预测在干预 $t$ 下的结果）
- $\hat{e}(X)$：倾向评分模型（预测接受干预的概率）

**双重稳健性的直观理解**：
- 如果结果模型正确：第二、三项趋于 0，估计量收敛到 $\mu_1(X) - \mu_0(X)$
- 如果倾向评分模型正确：通过 IPW 加权校正偏差
- **只要一个正确，估计就一致**

### 与机器学习的结合 (DML - Double Machine Learning)

现代双重稳健估计的核心创新是 **Neyman 正交化** + **交叉拟合 (Cross-fitting)**：

1. **Neyman 正交化**：使估计量对 nuisance 参数（倾向评分、结果模型）的估计误差不敏感
2. **交叉拟合**：将样本分为 K 份，用 K-1 份估计 nuisance 模型，在剩余 1 份上计算估计量
   - 避免过拟合导致的偏差
   - 支持使用灵活的机器学习方法（随机森林、神经网络等）

### 关键假设
- **条件独立性**：$T \perp (Y(0), Y(1)) | X$
- **重叠假设**：$0 < P(T=1|X) < 1$
- **一致性**：样本独立同分布

---

## ② 母婴出海应用案例

### 场景一：促销活动效果智能预测

**业务问题**：
我们计划在北美市场投放吸奶器季节性促销活动（如母亲节、黑五）。传统的销量预测只基于历史数据，无法回答"如果我们不促销，销量会是多少"这个反事实问题。我们需要**双重稳健的促销效果预测**，来决策是否值得投入促销预算。

**数据要求**：
- 历史特征：过去 6 个月销量、库存水平、竞品价格
- 用户特征：新老客户比例、平均客单价、复购率
- 干预数据：历史促销活动记录（是否促销、促销力度）
- 外部特征：节假日标识、季节性指数、市场趋势
- 标签：销量、销售额
- 数据量：建议至少 2 年日度数据（730+ 样本）

**预期产出**：
- **促销效果估计**：促销带来的增量销量（而非促销后的总销量）
- **置信区间**：效果估计的不确定性量化
- **稳健性诊断**：倾向评分和结果模型哪个更可靠
- **决策建议**：
  - 增量销量 > 成本 → 推荐促销
  - 增量销量不显著 → 建议不促销或调整策略

**业务价值**：
- 吸奶器母亲节促销预算 20 万，优化后预计：
  - 避免无效促销，节省预算 15-25%（3-5 万）
  - 提高促销决策准确率（从 60% → 85%+）
  - 量化促销效果的不确定性，降低决策风险

---

### 场景二：新产品上架时机预测

**业务问题**：

（**换底正文在此截断** —— 完整卡正文共 505 行，本页内联到第 83 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：历史特征：过去 6 个月以上（卡页建议 2 年日度、730+ 样本）的销量、库存水平、竞品价格；用户特征：新老客户比例、平均客单价、复购率；干预数据：历史促销活动记录（是否促销、促销力度）；外部特征：节假日标识、季节性指数、市场趋势；标签为销量、销售额。

**输出**：促销带来的增量销量估计与置信区间、倾向评分与结果模型谁更可靠的稳健性诊断，以及增量大于成本才建议促销的决策建议。

## 执行步骤

1. 整理历史销量、库存、竞品价格与历史促销记录等特征
2. 用交叉拟合分别训练结果模型与倾向评分模型
3. 按双重稳健公式估计促销的增量销量与置信区间
4. 做稳健性诊断，比较两个辅助模型的可靠度
5. 用增量与成本比较给出是否促销及促销力度的建议

## 边界与不做

- 何时不用：没有任何历史促销记录、或样本量远低于卡页建议门槛时不要用；促销已结束只需复盘净增量时改用反事实评估。
- 能力边界：只预测增量与区间，不替代定价与促销机制设计；结论依赖历史促销力度分布，跨到全新力度属于外推。
- 卡页数字（建议至少 2 年日度数据、730+ 样本、500+ 样本量）为数据门槛建议，不是效果承诺。

## 技能关联

- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Intelligent-Prediction-Doubly-Robust

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：03-时间序列　·　源卡：`Skill-Intelligent-Prediction-Doubly-Robust`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（337 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Intelligent-Prediction-Doubly-Robust`（完整卡：`references/full-card.md`）。
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
> > > > > **出处（已核验）**：arXiv:2411.02771 — Doubly robust inference via calibration
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
