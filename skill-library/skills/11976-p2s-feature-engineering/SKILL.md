---
name: "p2s-feature-engineering"
title: "Feature Engineering for E-Commerce Machine Learning"
description: "触发词：特征工程、特征复用、口径统一、流失特征、训练数据准备。何时不用：特征已经齐备、只想精简子集时用特征选择；要解释某次预测的特征贡献时用 SHAP 归因。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 数据管道 / 指标契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
quality_tier: "curated"
p2s_card_id: "Skill-Feature-Engineering"
p2s_src_domain: "12-ML基础"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.09162"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Feature-Engineering"
rebase_vault_path: "paper2skills-vault/12-ML基础/Skill-Feature-Engineering.md"
rebase_source_sha256: "a9bb443c583bbb676c0f678ea1576a505608ef04a05432c97c419b5f6b25c2fb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a9bb443c583bbb676c0f678ea1576a505608ef04a05432c97c419b5f6b25c2fb"
rebase_full_card_bytes: "42841"
rebase_full_card_lines: "705"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "b0c7a7d05567554cae5a814fe22ce3ba6b03eeedcc8b8db2b9f000b69a191e7d"
user_summary: "把散落的原始字段加工成可复用的业务特征，比如多久没来、近 90 天买了几次，让建模周期明显缩短。"
user_try: "试试：用我们的用户注册、订单、浏览数据，构建一套可复用的流失预测特征表。"
whenToUse: "属于「业务工具实现」：需要把原始业务字段加工成可复用特征并统一口径时用；若特征已齐备、只想砍冗余，用特征选择；若要解释模型为什么这样打分，用 SHAP 归因。"
workflow: "梳理原始数据：用户 ID、注册日期、订单记录、浏览记录 → 按业务含义设计特征：最近购买间隔、近 90 天订单数、累计消费、客单价 → 实现数值变换与类别编码：对数变换、分箱、独热编码 → 评估特征重要性，剔除冗余与泄漏项 → 把特征计算固化为可复用管线并沉淀字段口径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "5"
rebase_evidence_quotes_total: "30"
rebase_evidence_quotes_complete: "false"
---
# Feature Engineering for E-Commerce Machine Learning

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Feature-Engineering`（完整卡：`references/full-card.md`，sha256 `a9bb443c583bbb676c0f678ea1576a505608ef04a05432c97c419b5f6b25c2fb`，42841 字节 / 705 行 / 30 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 5 条（共 30 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `b0c7a7d05567554cae5a814fe22ce3ba6b03eeedcc8b8db2b9f000b69a191e7d`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Feature Engineering

## ① 算法原理

**核心问题**：模型效果的上限由特征质量决定。同样的算法，好的特征 vs 差的特征，效果可能差3-5倍。特征工程是"把领域知识注入模型的艺术"。

**母婴电商的关键特征类别**：

| 类别 | 示例 | 用途 |
|------|------|------|
| **用户行为** | 浏览次数、加购次数、购买频次、浏览深度 | Churn/LTV/Uplift |
| **用户属性** | 注册时长、来源渠道、设备类型、国家 | 分群/冷启动 |
| **商品属性** | 品类、品牌、价格段、适用月龄 | 推荐/定价 |
| **时序特征** | RFM、生命周期阶段、距离上次购买天数 | 复购预测 |

（**换底正文在此截断** —— 完整卡正文共 705 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 5 / 全 30 条 —— **其余 25 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 30 条逐字引文。本页按完整卡顺序内联**前 5 条整条引文**（不在引文中间断开）；其余 25 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Comprehensive experiments on 38 datasets from the TALENT benchmark demonstrate that supervised stretch consistently outperforms all baselines."
> 出处：2608.09162 §Abstract

> 原文："We empirically validate the framework on 38 datasets from the TALENT benchmark, where supervised stretch consistently outperforms all baselines, with the largest gains in regression tasks."
> 出处：2608.09162 §1 Introduction（Contributions）
> 原文："While tree-based methods naturally handle diverse distributions through split-based decisions, neural networks require careful preprocessing to achieve competitive performance [35, 23]."
> 出处：2608.09162 §1 Introduction
> 原文："We compare our proposed supervised and unsupervised stretch against seven established baselines: standardization (z-score normalization), Yeo-Johnson (YJ) power transformation [36], quantile transformation to a Gaussian distribution, min-max scaling to $[0,1]$, RobustScale+SmoothClip (RS-SC) as originally used in RealMLP [17], Piecewise Linear Encoding (PLE) [10], and PLE with Tree-based binning (PLE-T)."
> 出处：2608.09162 §4.1 Experimental Setup（基线清单）
> 原文："We conduct Bayesian optimization using Optuna [1] with 100 trials for each dataset-model-transformation combination, jointly tuning model and transformation hyperparameters (e.g., number of bins for stretch and PLE) using only the training and validation partitions."
> 出处：2608.09162 §4.1 Experimental Setup（协议）

## 输入 / 输出契约

**输入**：原始业务明细表：用户 ID、注册日期、订单记录、浏览记录（卡页示例为流失预测场景）；卡页第 4 段未给字段级规格，落地前需确认各字段口径与统计窗口。

**输出**：一张可复用的特征表（含 recency_days、frequency_90d、monetary_total、avg_order_value、browse_to_buy_ratio、category_diversity 等特征）与特征计算管线，供建模与指标口径对齐使用。

## 执行步骤

1. 梳理原始表：用户 ID、注册日期、订单记录、浏览记录
2. 按业务含义设计特征：最近购买间隔、近 90 天订单数、累计消费、客单价
3. 实现变换与编码：对数变换、分箱、类别编码
4. 评估特征重要性与相关性，剔除冗余和泄漏特征
5. 把特征计算固化为可复用管线并沉淀字段口径

## 边界与不做

- 数据不满足时不用：原始明细缺失或口径无人确认时不要造特征，否则模型学到的是错误口径。
- 能力边界：本卡产出特征与加工管线，不含模型训练与线上打分服务，也不承担指标治理的组织流程。

## 技能关联

- **延伸**：Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Deep-Learning-Churn-Prediction.html、Skill-Deep-Learning-Churn-Prediction、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Feature-Engineering

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：12-ML基础　·　源卡：`Skill-Feature-Engineering`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（156 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Feature-Engineering`（完整卡：`references/full-card.md`）。

- 论文：2608.09162
- 标题：Tabular Numeric Stretch Transformation
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Customer-Churn-Prediction.md, Skill-RFM-Customer-Segmentation.md, Skill-Uplift-Modeling.md

- 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Feature-Engineering`（完整卡：`references/full-card.md`）。
>
> - 论文：2608.09162
> - 标题：Tabular Numeric Stretch Transformation
> - 发表处：arXiv preprint
> - venue 档位：preprint
> - 证据等级：A
> - 关联卡：Skill-Customer-Churn-Prediction.md, Skill-RFM-Customer-Segmentation.md, Skill-Uplift-Modeling.md
>
> - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Feature-Engineering`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2608.09162
> > - 标题：Tabular Numeric Stretch Transformation
> > - 发表处：arXiv preprint
> > - venue 档位：preprint
> > - 证据等级：A
> > - 关联卡：Skill-Customer-Churn-Prediction.md, Skill-RFM-Customer-Segmentation.md, Skill-Uplift-Modeling.md
> >
> > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Feature-Engineering`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2608.09162
> > > - 标题：Tabular Numeric Stretch Transformation
> > > - 发表处：arXiv preprint
> > > - venue 档位：preprint
> > > - 证据等级：A
> > > - 关联卡：Skill-Customer-Churn-Prediction.md, Skill-RFM-Customer-Segmentation.md, Skill-Uplift-Modeling.md
> > >
> > > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Feature-Engineering`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2608.09162
> > > > - 标题：Tabular Numeric Stretch Transformation
> > > > - 发表处：arXiv preprint
> > > > - venue 档位：preprint
> > > > - 证据等级：A
> > > > - 关联卡：Skill-Customer-Churn-Prediction.md, Skill-RFM-Customer-Segmentation.md, Skill-Uplift-Modeling.md
> > > >
> > > > - 逐字引文：30 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2103.13342 — The Shapley Value of coalition of variables provides better explanations
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Feature Engineering for Machine Learning: A Comprehensive Survey》，与这个号指的不是同一篇。
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0.25）。引用前请自行确认。
