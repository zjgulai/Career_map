---
name: "p2s-customer-journey-prototype"
title: "Customer Journey Prototype Detection 客户旅程序列原型检测"
description: "触发词：旅程序列原型、用户路径聚类、流失风险识别、序列编辑距离、跨渠道旅程。何时不用：只做页面级漏斗流失节点定位与优先级排序时用「用户旅程分析」；只做页面转移矩阵稀疏补全时用「超稀疏矩阵补全」。安全边界：跨渠道行为与门店信息属个人信息，身份打通须获授权并做隐私合规审查，不得用于未告知的个体触达。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 体验分析"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
quality_tier: "curated"
p2s_card_id: "Skill-Customer-Journey-Prototype"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "preprint"
p2s_paper_id: "2505.11086"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Customer-Journey-Prototype"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-Customer-Journey-Prototype.md"
rebase_source_sha256: "5f234ad6a967821061d1ff602e86997d1e9f625909154e26e442406f810c4ee3"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "5f234ad6a967821061d1ff602e86997d1e9f625909154e26e442406f810c4ee3"
rebase_full_card_bytes: "11581"
rebase_full_card_lines: "227"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "7b84f4167e46e2603dccd614a5a3c9c905f1c87e7548a06632a872040b2d0869"
user_summary: "把用户跨渠道的行走顺序聚成几类典型旅程，提前两周挑出即将流失的人并匹配干预动作。"
user_try: "试试：用我50万月活用户的跨渠道行为序列检测典型旅程原型，并挑出未来14天高流失风险的加购用户和干预建议。"
whenToUse: "需要在App、小程序、门店、Web跨渠道行为序列层面聚类典型旅程、提前识别即将流失的用户时用本技能；只做页面级漏斗流失节点定位时用「用户旅程分析」；只做页面转移矩阵缺观测补全时用「超稀疏矩阵补全」；需要评估干预动作的因果增量时用「因果提升模型」。"
workflow: "汇总跨渠道用户行为序列（user_id、event_type、category、channel、timestamp）并按时序排列 → 用编辑距离与归一化距离度量序列之间的相似度 → 用贪心k-center检测典型旅程原型（默认5个）并给出每条序列的归属 → 标记高流失风险用户并按需匹配干预动作（优惠券、门店地址、客服咨询） → 对比干预前后转化，量化干预效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "1"
rebase_evidence_quotes_total: "13"
rebase_evidence_quotes_complete: "false"
---
# Customer Journey Prototype Detection 客户旅程序列原型检测

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`，sha256 `5f234ad6a967821061d1ff602e86997d1e9f625909154e26e442406f810c4ee3`，11581 字节 / 227 行 / 13 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 1 条（共 13 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `7b84f4167e46e2603dccd614a5a3c9c905f1c87e7548a06632a872040b2d0869`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Customer Journey Prototype Detection 客户旅程序列原型检测

**论文来源**: Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data  
**arXiv ID**: [2505.11086](https://arxiv.org/abs/2505.11086)  
**发表日期**: 2025-05-16  
**适用领域**: 客户旅程分析、全渠道用户行为、反事实推荐

---

## ① 算法原理

### 核心思想
客户旅程是跨渠道、多触点的序列数据，传统分析方法难以量化。本方法通过三步法实现旅程分析：1) 定义序列距离识别代表性原型；2) 基于原型距离预测购买概率；3) 对低转化旅程推荐反事实优化路径。

### 数学直觉

**序列距离（编辑距离）**：  
将客户旅程编码为事件序列，计算两序列间的最小编辑操作数：

d(A, B) = min_ops(A → B) / max(len(A), len(B))

（**换底正文在此截断** —— 完整卡正文共 227 行，本页内联到第 21 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 1 / 全 13 条 —— **其余 12 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 13 条逐字引文。本页按完整卡顺序内联**前 1 条整条引文**（不在引文中间断开）；其余 12 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："In this study, we propose a novel approach comprising three steps for analyzing customer journeys. First, the distance between sequential data is defined and used to identify and visualize representative sequences. Second, the likelihood of purchase is predicted based on this distance. Third, if a sequence suggests no purchase, counterfactual sequences are recommended to increase the probability of a purchase using a proposed method, which extracts counterfactual explanations for sequential data."
> 出处：2505.11086 §Abstract（PDF 第 1 页）

## 输入 / 输出契约

**输入**：跨渠道用户行为序列：user_id、event_type（browse/search/click/cart/purchase/review）、category（milk_powder/diaper/formula/toy/clothing）、channel（app/web/mini_program/offline_store）、timestamp；按用户与时间排序；示例规模月活50万、加购率12%（约6万加购用户），序列需能构成完整旅程以支撑原型检测。

**输出**：典型旅程序列原型（默认5个原型及其代表序列）、每条序列到最近原型的归一化距离与归属、高流失风险用户清单（卡页目标为覆盖其中30%）与建议干预动作（优惠券、门店地址、客服咨询）；供会员运营与体验团队在流失前14天实施干预并量化效果。

## 执行步骤

1. 采集跨渠道事件日志并按用户、时间排序为行为序列
2. 计算序列之间的编辑距离与归一化距离
3. 运行k-center原型检测并输出每类原型的代表序列
4. 按原型归属与加购未支付状态标记高流失风险用户
5. 为高风险用户匹配干预动作并输出名单
6. 对比干预前后转化率，量化干预效果

## 边界与不做

- 数据不满足：缺少跨渠道事件日志、时间戳不完整或序列过短时无法构成旅程原型，只有加购与支付结果、缺少中间事件的样本不能用，需先补齐埋点。
- 何时不用：只做页面级漏斗流失定位与优先级排序时用「用户旅程分析」；只做页面转移矩阵稀疏补全时用「超稀疏矩阵补全」；需要评估干预真实因果增量时用「因果提升模型」。
- 能力边界：输出旅程原型、风险名单与干预建议，不替代CRM或门店系统执行触达；卡页目标（识别30%高风险用户、干预转化率提升20%）为设定目标，需实测校准。
- 安全边界：跨渠道身份打通涉及个人行为与门店信息，须有用户授权与隐私合规审查，不得用于未告知的个体触达。

## 技能关联

- **前置**：Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Recommendation-System-Collaborative-Filtering
- **可组合**：Skill-Customer-Journey-Prototype

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：06-增长模型　·　源卡：`Skill-Customer-Journey-Prototype`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（248 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`）。

- 论文：2505.11086
- 标题：Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
- venue 档位：preprint
- 证据基础：paper-verbatim
- 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Cold-Start-Product-Recommendation.md

- 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`）。
>
> - 论文：2505.11086
> - 标题：Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
> - venue 档位：preprint
> - 证据基础：paper-verbatim
> - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Cold-Start-Product-Recommendation.md
>
> - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2505.11086
> > - 标题：Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Cold-Start-Product-Recommendation.md
> >
> > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2505.11086
> > > - 标题：Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Cold-Start-Product-Recommendation.md
> > >
> > > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Customer-Journey-Prototype`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2505.11086
> > > > - 标题：Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Cold-Start-Product-Recommendation.md
> > > >
> > > > - 逐字引文：13 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2505.11086 — Analysis of Customer Journeys Using Prototype Detection and Counterfactual Explanations for Sequential Data
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
