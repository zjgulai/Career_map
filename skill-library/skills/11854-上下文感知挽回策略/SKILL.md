---
name: "p2s-tscan"
title: "Skill-TSCAN-上下文感知挽回策略"
description: "触发词：p2s-tscan。Skill: TSCAN上下文感知Uplift - 流失原因到挽回策略"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-TSCAN-上下文感知挽回策略"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2504.18881"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-TSCAN-上下文感知挽回策略"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-TSCAN-上下文感知挽回策略.md"
rebase_source_sha256: "5f35dc5557e0cbbbb8016a28dc0f66764fb3fd42a07a45d315909ec1f7e96c0b"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "5f35dc5557e0cbbbb8016a28dc0f66764fb3fd42a07a45d315909ec1f7e96c0b"
rebase_full_card_bytes: "8815"
rebase_full_card_lines: "193"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "19"
rebase_evidence_quotes_total: "19"
rebase_evidence_quotes_complete: "true"
---
# Skill-TSCAN-上下文感知挽回策略

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-TSCAN-上下文感知挽回策略`（完整卡：`references/full-card.md`，sha256 `5f35dc5557e0cbbbb8016a28dc0f66764fb3fd42a07a45d315909ec1f7e96c0b`，8815 字节 / 193 行 / 19 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill: TSCAN上下文感知Uplift - 流失原因到挽回策略

## 基础信息

- **arXiv ID**: 2504.18881
- **论文标题**: TSCAN: Context-Aware Uplift Modeling via Two-Stage Training for Online Merchant Business Diagnosis
- **发表会议**: arXiv 2025
- **核心方法**: 两阶段神经网络（上下文编码器 + Uplift估计器）

---

## 1. 算法原理

### 1.1 问题背景

传统流失预测模型存在的问题：
1. **只预测流失概率**，不预测**挽回成功率**
2. **统一策略**，不区分流失原因
3. **忽视上下文**，同一用户在不同生命周期阶段需要不同策略

### 1.2 TSCAN框架

TSCAN (Two-Stage Context-Aware Network) 桥接流失原因 → 最优挽回策略。


### 1.3 核心创新

**上下文感知**：
- 同一用户在不同流失原因下，最优策略不同
- 例：产品问题 → 免费换新；价格敏感 → 优惠券；服务不满 → 人工关怀

**反直觉洞察**：
1. **"Do Not Disturb"用户**：15-20%的流失用户不应被干预（干预反而加速流失）
2. **中价值用户响应更好**：中等价值客户对挽回的响应率比VIP高40%
3. **时机比力度更重要**：第2次触达后边际效应急剧下降

---

## 2. 业务应用

### 2.1 Momcozy场景：流失挽回策略选择


### 2.2 流失原因-策略匹配矩阵

| 流失原因 | 识别信号 | 推荐策略 | Uplift |
|---------|---------|---------|--------|
| **产品故障** | 频繁退货、差评 | 免费换新 + 延保 | +32% |
| **配件成本** | 配件页面停留、客服询价 | 配件订阅服务优惠 | +28% |
| **自然断奶** | 使用递减、宝宝月龄6月+ | 断奶指南 + 二手回收 | +15% |
| **竞品转移** | 竞品页面浏览 | 差异化功能强调 | +18% |
| **服务不满** | 投诉记录 | 人工道歉 + 专属客服 | +22% |

### 2.3 与现有技能的衔接


---

## 3. 业务价值

| 收益来源 | 提升幅度 | 预估收益 |
|---------|---------|---------|
| 挽回成功率 | +20-35% | 100万/年 |
| 避免过度干预 | 识别15%"Do Not Disturb"用户 | 减少反感流失 30万/年 |
| 策略精准匹配 | 从统一优惠券到个性化策略 | 50万/年 |
| **总计** | - | **180万+/年** |

---

## 4. 技能关联

| 前置技能 | 关系 | 说明 |
|---------|------|------|
| **Causal Forest** | 输入 | 提供异质性处理效应基础 |
| **流失原因推断** | 输入 | 2405.11377提供流失原因分类 |

| 后置技能 | 关系 | 说明 |
|---------|------|------|
| **挽回时机预测** | 配合 | 确定策略后选择最佳触达时机 |

---

**难度**: ⭐⭐⭐⭐ (4/5) - 需要因果推断和神经网络基础  
**优先级**: P4 - 流失挽回方向核心技能

---

## ⑥ 原文引用

（**换底正文在此截断** —— 完整卡正文共 193 行，本页内联到第 135 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 19 条 · 不截断）

> 原文:"Accurate estimation of the Individual Treatment Effect (ITE) is essential for business diagnostics in the online food delivery industry, particularly for assessing the impact of various business strategies, such as inventory management, pricing optimization and online marketing campaigns."
> 出处：2504.18881 §Abstract

> 原文:"A primary challenge in ITE estimation lies in sample selection bias."
> 出处：2504.18881 §Abstract

> 原文:"However, these regularizations may introduce undesirable information loss and limit predictive performance."
> 出处：2504.18881 §Abstract

> 原文:"To address these issues, we propose TSCAN: a Context-Aware uplift model based on a Two-Stage training approach, comprising CAN-U and CAN-D sub-models."
> 出处：2504.18881 §Abstract

> 原文:"In Stage 1, CAN-U generates counterfactual uplift labels while mitigating selection bias through integrated IPM and propensity score regularization."
> 出处：2504.18881 §Abstract

> 原文:"In Stage 2, CAN-D eliminates these regularizations and leverages an isotonic output layer to directly model uplift effects in a supervised manner."
> 出处：2504.18881 §Abstract

> 原文:"By reinforcing factual outcomes, CAN-D adaptively corrects estimation errors from CAN-U while circumventing the performance degradation induced by bias-mitigation regularizations."
> 出处：2504.18881 §Abstract

> 原文:"We design a Context-Aware Attention Layer that explicitly models the tripartite interaction among merchant features, treatments, and external contexts, enabling adaptive ITE estimation across diverse operational scenarios."
> 出处：2504.18881 §1 Introduction（Contributions）

> 原文:"This problem differs from traditional supervised learning in that it requires causal inference rather than mere association modeling."
> 出处：2504.18881 §1 Introduction

> 原文:"In dynamic environments such as online marketing, the efficacy of a given intervention (treatment, e.g., a promotional subsidy or ad bid) is highly context-dependent."
> 出处：2504.18881 §1 Introduction

> 原文:"Such contextual heterogeneity is essential for accurate uplift estimation, yet it remains largely unexploited by existing methods, which typically assume treatment effects are context-invariant."
> 出处：2504.18881 §1 Introduction

> 原文:"In summary, two overarching challenges remain: (1) developing more effective methods to address selection bias while maintaining the predictive performance of the model and the quality of personalized recommendations; (2) accounting for the impact of contextual factors on treatment effects."
> 出处：2504.18881 §1 Introduction

> 原文:"These works underscore a critical insight: the same treatment can yield divergent outcomes under different contextual conditions."
> 出处：2504.18881 §2.2 Context-Aware Treatment Effect Estimation

> 原文:"For example, a merchant discount may significantly increase order volume during off-peak hours but have negligible effect during lunchtime peak periods due to demand saturation."
> 出处：2504.18881 §2.2 Context-Aware Treatment Effect Estimation

> 原文:"The two-stage training strategy improves performance: CAN-D (full TSCAN) outperforms CAN-U on both datasets, with relative improvements of up to 5.95% in QINI and 1.45% in AUUC on the Eleshop-1M dataset."
> 出处：2504.18881 §5.2.2 RQ2

> 原文:"To evaluate the performance of TSCAN in real-world online scenarios, we deployed TSCAN on a real merchant diagnosis system of an online food ordering platform in China."
> 出处：2504.18881 §5.2.3 RQ3

> 原文:"The A/B test compares TSCAN against BART (the previously deployed model) across 90,000 merchants randomly assigned to treatment groups."
> 出处：2504.18881 §5.2.3 RQ3

> 原文:"As shown in Table 4, in the online experiment, TSCAN outperforms the baseline model BART, achieving an AUUC improvement of 0.0349, a CAUUC improvement of 0.0411 and a 0.76% increase in order volume (95% CI [0.68%, 0.84%], p=0.001)."
> 出处：2504.18881 §5.2.3 RQ3

> 原文:"This adaptive behavior validates the design of the context-aware attention layer."
> 出处：2504.18881 §5.2.3 RQ3

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-TSCAN-上下文感知挽回策略`（完整卡：`references/full-card.md`）。

- 论文：2504.18881
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：19 条，全部内联于上方「原文引用」段；一条不截断。
