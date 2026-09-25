---
name: "p2s-dqn-purchase-prediction"
title: "DQN-Inspired Purchase Intent Prediction"
description: "触发词：购买意向、转化窗口、行为序列、DQN、高意向识别、时机触达。何时不用：要算干预增量用因果 Uplift 卡；要在决策周期长但窗口短的品类里识别高意向用户并卡准触达时用本卡。安全边界：行为序列与画像特征须去标识化并获授权，不得使用孕周等敏感信息做歧视性处置或对外输出。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-DQN-Purchase-Prediction"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "preprint"
p2s_paper_id: "2506.17543"
p2s_code_level: "无代码"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-DQN-Purchase-Prediction"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-DQN-Purchase-Prediction.md"
rebase_source_sha256: "a2863d782d9d59cf03b2bd12f1c1b08ff4828c36ed85410822c85556f262ed42"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a2863d782d9d59cf03b2bd12f1c1b08ff4828c36ed85410822c85556f262ed42"
rebase_full_card_bytes: "24182"
rebase_full_card_lines: "478"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "8a01087e925ef08606e044ae360edd2d7c928387dedafdbbad1200c1e6cfa526"
user_summary: "用用户的行为序列判断她什么时候最可能下单，把优惠推在真正的窗口期。"
user_try: "试试：这是我的用户会话与行为序列数据，帮我预测购买意向并找出高意向用户和最佳触达时点。"
whenToUse: "与「推送通知决策 Transformer」相比：要优化推送时机与疲劳度用那张卡；要把行为序列编码成购买意向分、圈定高意向人群时用本卡。"
workflow: "构造用户画像、行为统计、品类偏好与时序编码特征 → 按时间顺序切分行为序列作为序列输入 → 训练购买意向模型并评估 AUC 与命中率 → 对高意向用户安排触达并回看转化窗口命中率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "6"
rebase_evidence_quotes_total: "24"
rebase_evidence_quotes_complete: "false"
---
# DQN-Inspired Purchase Intent Prediction

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`，sha256 `a2863d782d9d59cf03b2bd12f1c1b08ff4828c36ed85410822c85556f262ed42`，24182 字节 / 478 行 / 24 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 6 条（共 24 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `8a01087e925ef08606e044ae360edd2d7c928387dedafdbbad1200c1e6cfa526`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: DQN-Inspired Purchase Intent Prediction
# DQN深度强化学习购买意图预测

**论文来源**: Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model  
**arXiv ID**: [2506.17543](https://arxiv.org/abs/2506.17543)  
**发表日期**: 2025-06  
**作者**: Aditi Madhusudan Jain  
**适用领域**: 购买意图预测、AIPL的P阶段量化、实时转化评分

---

## ① 算法原理

### 核心思想
传统购买预测模型将问题视为静态分类任务。DQN-inspired方法把**单次用户会话**当作一个整体分析单元：用 LSTM 对会话内的行为序列建模，并借用 DQN 训练中的**经验回放**（把历史会话存池、训练时随机采样批次）来打破连续样本的相关性。模型输出的是「该会话最终成交」的概率，是**监督式二分类**，而不是 RL 闭环。

（**换底正文在此截断** —— 完整卡正文共 478 行，本页内联到第 16 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 6 / 全 24 条 —— **其余 18 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 24 条逐字引文。本页按完整卡顺序内联**前 6 条整条引文**（不在引文中间断开）；其余 18 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Our approach to predicting buying intent and product demand in e-commerce settings draws inspiration from Deep Q-Networks (DQN), a technique traditionally used in reinforcement learning. We adapt this concept to a supervised learning context, leveraging its ability to handle sequential data and make decisions based on complex patterns of user behavior."
> 出处：2506.17543 §V Methodology（PDF 第 5 页）

> 原文："Experience Replay: We implement a form of experience replay, storing and randomly sampling from past user sessions during training, mirroring the DQN training process."
> 出处：2506.17543 §V-A Deep Q-Network Inspiration（PDF 第 5 页）

> 原文："Epsilon-Greedy Exploration: While not directly applicable in our supervised setting, we implement a form of exploration by occasionally introducing random noise in our feature set during training, inspired by the epsilon-greedy strategy in DQNs."
> 出处：2506.17543 §V-C Training Process（PDF 第 6 页）——注意：论文**没有**把干预当作 action、把转化当作 reward 的 Q 学习闭环

> 原文："Value Prediction: While DQNs predict action-values, our model predicts the ”value” of a session in terms of its likelihood to result in a purchase."
> 出处：2506.17543 §V-A（PDF 第 5 页）

> 原文："We evaluate our model on a large-scale e-commerce dataset comprising over 885,000 user sessions, each characterized by 1,114 features."
> 出处：2506.17543 §Abstract（PDF 第 1 页）

> 原文："Through comprehensive experimentation with various classification thresholds, we show that our model achieves a balance between precision and recall, with an overall accuracy of 88% and an AUC-ROC score of 0.88."
> 出处：2506.17543 §Abstract（PDF 第 1 页）——摘要口径；与表 V 的 AUC-ROC 0.6257 **不一致**，见下

## 输入 / 输出契约

**输入**：用户会话特征（画像、浏览历史、加购记录）、点击/浏览/搜索/加购/收藏行为序列，以及是否购买与金额标签；卡页特征含 1,114 维会话特征与最近 20 步行为序列。

**输出**：用户级购买意向分与高意向名单、触达时机建议与模型评估指标（卡页 AUC-ROC 0.88，行业基准 0.65–0.75），供投放与运营配置触达。

## 执行步骤

1. 汇总用户画像、行为统计、品类偏好与时序编码特征。
2. 构造按时间排序的行为序列样本并处理类别编码。
3. 训练购买意向模型，评估 AUC 与 Top-K 命中率。
4. 输出高意向名单与建议触达时点。
5. 上线后回看转化窗口命中率并迭代特征。

## 边界与不做

- 何时不用：行为序列稀疏、样本量不足或缺少购买标签时不要用；单纯规则式触达（如加购 24 小时发券）无需模型。
- 能力边界：产出意向分与触达建议，不代发消息；AUC 0.88 与 24 倍 ROI 为卡页案例值，代码模板需回原卡获取。
- 安全边界：不得使用孕周等敏感信息做歧视性处置，特征须去标识化。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit
- **可组合**：Skill-DQN-Purchase-Prediction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-DQN-Purchase-Prediction`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（174 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`）。

- 论文：2506.17543
- 标题：Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model
- venue 档位：preprint
- 证据基础：paper-verbatim
- 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Customer-Journey-Prototype.md

- 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`）。
>
> - 论文：2506.17543
> - 标题：Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model
> - venue 档位：preprint
> - 证据基础：paper-verbatim
> - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Customer-Journey-Prototype.md
>
> - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2506.17543
> > - 标题：Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Customer-Journey-Prototype.md
> >
> > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2506.17543
> > > - 标题：Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Customer-Journey-Prototype.md
> > >
> > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-DQN-Purchase-Prediction`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2506.17543
> > > > - 标题：Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > > - 关联卡：Skill-User-Lifecycle-STAN.md, Skill-Customer-Journey-Prototype.md
> > > >
> > > > - 逐字引文：24 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2506.17543 — Predicting E-commerce Purchase Behavior using a DQN-Inspired Deep Learning Model for enhanced adaptability
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
