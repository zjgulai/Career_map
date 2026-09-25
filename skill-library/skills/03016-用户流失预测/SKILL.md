---
name: "p2s-customer-churn-prediction"
title: "Customer Churn Prediction (用户流失预测)"
description: "触发词：流失预测、风险评分、AUC、特征工程、预警清单、CRM 触达。何时不用：要看干预增量效果用因果 Uplift 归因卡；只需要一份可靠的流失风险评分与高风险清单时用本卡。安全边界：预测结果仅限内部触达使用，不得对外披露或用于歧视性定价，用户特征采集须获授权并遵守隐私法规。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-Customer-Churn-Prediction"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Customer-Churn-Prediction"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-Customer-Churn-Prediction.md"
rebase_source_sha256: "d363bdcfccf4c84fa3742f279f58b73618915e15190bb69929ef0e2e0437ab73"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d363bdcfccf4c84fa3742f279f58b73618915e15190bb69929ef0e2e0437ab73"
rebase_full_card_bytes: "12807"
rebase_full_card_lines: "365"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "d81962fe818038f47fc25fd48e6cc445fe19a86b0947581a3c7abbd614faad29"
user_summary: "给每个用户算出流失风险分，提前圈出要挽留的人，让客服先打最有价值的那批电话。"
user_try: "试试：这是我 12 个月的交易与行为数据，帮我训练流失预测模型，输出风险分、AUC 和高风险用户清单。"
whenToUse: "与「因果流失归因」相比：要问给谁发券才有效用那张因果卡；只需一份风险打分与优先级排序时用本卡。"
workflow: "定义流失口径（30/45/90 天）并构造正负样本 → 构建用户、行为与时序三类特征 → 训练并对比 Logistic 与 GBDT，评估 AUC 与召回 → 输出风险分与高风险清单，按 LTV 排序触达优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Customer Churn Prediction (用户流失预测)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`，sha256 `d363bdcfccf4c84fa3742f279f58b73618915e15190bb69929ef0e2e0437ab73`，12807 字节 / 365 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `d81962fe818038f47fc25fd48e6cc445fe19a86b0947581a3c7abbd614faad29`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Customer Churn Prediction (用户流失预测)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
用户流失预测解决的核心问题是：**识别哪些用户即将停止使用产品/服务**，从而提前采取挽留措施。与被动等待用户流失后分析不同，预测模型可以提前 7-30 天预警，让运营团队有足够时间干预。

### 数学直觉

**Logistic 回归模型**：
$$P(churn=1|X) = \frac{1}{1 + e^{-z}}$$
其中 $z = \beta_0 + \beta_1 x_1 + ... + \beta_n x_n$

- 将线性组合映射到 (0,1) 区间
- $\beta_i$ 为特征权重，可解释

**特征重要性（基于树模型）**：
- **Information Gain**: $IG(S, A) = H(S) - \sum_{v \in Values(A)} \frac{|S_v|}{|S|} H(S_v)$
- **Gain**: $Gain(S, A) = \sum_{v \in Values(A)} \frac{|S_v|}{|S|} Gini(S_v)$

### 关键假设
- **历史可预测未来**：过去流失模式可预测未来
- **特征稳定性**：特征分布不随时间剧烈变化
- **定义清晰**：明确定义"流失"（如 90 天未活跃）

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器配件复购用户流失预警

**业务问题**：
购买吸奶器的妈妈用户（如定期更换配件：喇叭罩、鸭嘴阀、储奶袋）是核心复购用户。但部分复购用户会逐渐减少购买甚至不再访问，需要提前识别并挽留。

**数据要求**：
- 用户特征：注册时间、首次购买吸奶器时间、历史购买次数/金额
- 行为特征：浏览配件页面数、加购未购次数、收藏商品数
- 时序特征：近 7/30/90 天活跃天数、登录频次
- 标签：90 天未购买配件 = 流失

**预期产出**：
- 每个用户的流失概率（0-1）
- 高风险用户清单（top 20%）
- 挽留优先级排序

**业务价值**：
- 流失率降低 15-25%
- 挽留成本降低 30%（精准触达）
- 挽回收入：假设月流失用户贡献 50 万，挽回 20% = 10 万/月

---

### 场景二：沉默用户激活预测

**业务问题**：
部分注册用户首次购买后，逐渐沉默（不再访问网站）。需要识别哪些沉默用户可以通过优惠激活，哪些会自然回流。

**数据要求**：
- 沉默标记：30 天未访问
- 历史行为：购买频次、加购行为、浏览深度
- 营销响应历史：历史领券/点击记录

**预期产出**：
- 激活概率评分
- 最优触达策略（发券/推送/短信）
- 预期 ROI

**业务价值**：
- 沉默用户激活率提升 20%+
- 营销成本降低 25%
- 预算聚焦高ROI用户

---

（**换底正文在此截断** —— 完整卡正文共 365 行，本页内联到第 80 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：交易与行为日志：注册与首购时间、历史购买次数与金额、近 7/30/90 天浏览配件页数、加购未购、收藏、活跃天数、最后购买距今天数、登录频次；卡页为 12 个月、1,840 个流失样本与 4,320 个活跃样本。

**输出**：每位用户的 0–1 流失风险分（卡页 AUC 0.84）、Top 20% 高风险清单与按 LTV 的触达优先级，供 CRM、客服与营销自动化调用。

## 执行步骤

1. 确认流失口径并划分正负样本。
2. 构造用户特征、行为特征与时序特征。
3. 训练并对比候选模型，评估 AUC、召回与阈值代价。
4. 输出风险分与高风险清单，按 LTV 排序优先级。
5. 对接 CRM 触达并监控模型漂移与定期重训。

## 边界与不做

- 何时不用：缺失完整行为日志、或流失定义未确认时不要用；样本极少（数百条）时模型不可靠。
- 能力边界：产出风险评分与清单，不评估干预效果；AUC 0.84、挽留成功率 38% 为卡页案例值。
- 安全边界：须防模型漂移并定期重训，预测结果仅限内部使用，不得用于歧视性定价。

## 技能关联

- **前置**：Skill-Data-Cleaning-for-Ecommerce、Skill-Feature-Engineering-Behavioral
- **延伸**：Skill-Customer-Lifetime-Value-Prediction、Skill-Retention-Campaign-Optimization
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Churn-Prediction、Skill-Marketing-Attribution、Skill-Propensity-Scoring、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Customer-Churn-Prediction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Customer-Churn-Prediction`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（241 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Customer-Churn-Prediction`（完整卡：`references/full-card.md`）。
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
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
