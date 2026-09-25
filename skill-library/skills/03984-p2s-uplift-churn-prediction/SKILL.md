---
name: "p2s-uplift-churn-prediction"
title: "Uplift Modeling for Churn Prediction"
description: "触发词：Uplift建模、流失挽留、四象限分群、发券精准化、不要打扰者。何时不用：只想预测谁会流失时用流失预测模型；没有历史干预记录（缺处理/对照标签）无法训练。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
quality_tier: "curated"
p2s_card_id: "Skill-Uplift-Churn-Prediction"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "preprint"
p2s_paper_id: "2312.07206"
p2s_code_level: "无代码"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Uplift-Churn-Prediction"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-Uplift-Churn-Prediction.md"
rebase_source_sha256: "1ffafcea24ed364b7466706fb1f56ff2cc4cb42803f309f3dbed0c3751238210"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "1ffafcea24ed364b7466706fb1f56ff2cc4cb42803f309f3dbed0c3751238210"
rebase_full_card_bytes: "23035"
rebase_full_card_lines: "285"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "cc1f096c8d44398104896d7e4afa0ef4e6e402b3e05c2fa56261bd83f1f8f3c7"
user_summary: "找出给券才会留下来的人，别再对本来就会留和怎么留都留不住的人乱发券。"
user_try: "试试：帮我用 Uplift 模型分出哪些高危用户是给券才留的，减少无谓的挽留券。"
whenToUse: "当已有干预（发券、客服回访）历史数据，需要在流失预警基础上判断干预对谁有效并分群时用；只要预测谁会流失、不关心干预效果时用流失预测类技能；要在预算约束下生成干预名单时用干预名单优化器。"
workflow: "汇总用户特征、历史干预记录与流失标签 → 确认样本量达到卡页建议门槛（≥5000 条，处理组与对照组各 2500 以上） → 训练 Uplift 模型，输出每个用户的 Uplift 分数 → 按四象限把用户分为可说服者、必然转化者、无法挽回者与不要打扰者 → 只对可说服者发放高价值优惠券，其余分群改用低成本或不触达策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "20"
rebase_evidence_quotes_complete: "false"
---
# Uplift Modeling for Churn Prediction

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`，sha256 `1ffafcea24ed364b7466706fb1f56ff2cc4cb42803f309f3dbed0c3751238210`，23035 字节 / 285 行 / 20 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 20 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `cc1f096c8d44398104896d7e4afa0ef4e6e402b3e05c2fa56261bd83f1f8f3c7`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Uplift Modeling for Churn Prediction

**论文来源**: A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling  
**arXiv ID**: [2312.07206](https://arxiv.org/abs/2312.07206)  
**发表会议**: ECML PKDD 2023 Workshop（post-proceedings）✅ 已核验 —— 证据在 arXiv 元数据 `Comments`，**不在**底本正文（论文正文通常不写自己的 venue）；见附录  
**适用领域**: 用户流失预测、干预效果评估、精准营销

---

## ① 算法原理

### 核心思想

（**换底正文在此截断** —— 完整卡正文共 285 行，本页内联到第 13 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 20 条 —— **其余 14 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 20 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 14 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："This is the first publicly available dataset offering the possibility to evaluate the efficiency of uplift modeling on the churn prediction problem."
> 出处：2312.07206 §Abstract（PDF 第 1 页）

> 原文："Uplift modeling, also known as individual treatment effect (ITE) estimation, is an important approach for data-driven decision making that aims to identify the causal impact of an intervention on individuals."
> 出处：2312.07206 §Abstract（PDF 第 1 页）

> 原文："Uplift modeling, often called the conditional average treatment effect, has become a crucial tool for data-driven decision making. This modeling technique estimates the effect that a particular intervention or treatment has on individuals, enabling the selection of only those individuals who are likely to have a positive reaction to the action."
> 出处：2312.07206 §1 Introduction（PDF 第 1 页）

> 原文："Churn, in this context, refers to customers terminating their subscription to the telecom service."
> 出处：2312.07206 §Abstract（PDF 第 1 页）

> 原文："To address this issue, this paper introduces a new churn dataset for uplift modeling, coming from a major telecom company in Belgium, Orange Belgium."
> 出处：2312.07206 §1 Introduction（PDF 第 1 页）

> 原文："A subset of these high-risk customers was randomly assigned to the control group, while the remaining customers formed the target group."
> 出处：2312.07206 §2 Churn campaigns（PDF 第 1 页）

## 输入 / 输出契约

**输入**：用户特征（在网时长、月消费金额、累计消费、客服通话次数、购买产品数量）+ 历史干预数据（是否发放优惠券、是否进行客服回访）+ 流失标签（30 天内是否流失）；卡页建议样本量 ≥5000 条，处理组与对照组各 2500 以上。

**输出**：每个用户的 Uplift 分数（干预降低流失的概率）、四象限分群（可说服者 Uplift>0.1、必然转化者 0<Uplift<0.1、无法挽回者 Uplift 近似 0、不要打扰者 Uplift<0）与分群触达策略（仅对可说服者发高价值优惠券）。

## 执行步骤

1. 汇总用户特征、历史干预记录与流失标签
2. 确认样本量达到卡页建议门槛（≥5000 条，处理与对照各 2500 以上）
3. 训练 Uplift 模型，输出每个用户的 Uplift 分数
4. 按四象限把用户分为可说服者、必然转化者、无法挽回者与不要打扰者
5. 只对可说服者发放高价值优惠券，其余分群改用低成本或不触达策略

## 边界与不做

- 何时不用：只想预测谁会流失、不关心干预效果时用流失预测类技能；没有历史干预记录（缺处理与对照标签）时无法训练 Uplift 模型。
- 能力边界：只输出分群与触达建议，不执行发券；结论依赖历史干预数据的代表性，换一种干预方式（如改发别的券）需重新训练；卡页第 7 段无代码模板，落地需另行获取代码。
- 卡页数字（无效挽留率从 22% 压到 6%、年省 28 万元、券成本降低 30%、样本量建议 ≥5000）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-DQN-Purchase-Prediction.html、Skill-DQN-Purchase-Prediction、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Intelligent-Prediction-Doubly-Robust.html、Skill-Intelligent-Prediction-Doubly-Robust
- **可组合**：Skill-BERT-SRL-Event-Frame-Extraction.html、Skill-BERT-SRL-Event-Frame-Extraction、Skill-Uplift-Intervention-Queue-Optimizer.html、Skill-Uplift-Intervention-Queue-Optimizer、Skill-Uplift-Churn-Prediction

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：06-增长模型　·　源卡：`Skill-Uplift-Churn-Prediction`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`）。

- 论文：2312.07206
- 标题：A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
- venue 档位：preprint
- 证据基础：paper-verbatim
- 关联卡：Skill-Customer-Journey-Prototype.md, Skill-DQN-Purchase-Prediction.md

- 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`）。
>
> - 论文：2312.07206
> - 标题：A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
> - venue 档位：preprint
> - 证据基础：paper-verbatim
> - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-DQN-Purchase-Prediction.md
>
> - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2312.07206
> > - 标题：A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-DQN-Purchase-Prediction.md
> >
> > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2312.07206
> > > - 标题：A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-DQN-Purchase-Prediction.md
> > >
> > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Uplift-Churn-Prediction`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2312.07206
> > > > - 标题：A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-Customer-Journey-Prototype.md, Skill-DQN-Purchase-Prediction.md
> > > >
> > > > - 逐字引文：20 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2312.07206 — A churn prediction dataset from the telecom sector: a new benchmark for uplift modeling
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
