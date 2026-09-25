---
name: "p2s-temporal-fusion-transformer"
title: "'Skill: Temporal Fusion Transformer (TFT) 多水平时序预测'"
description: "触发词：TFT、多水平预测、注意力解释、分位数预测、多 SKU。何时不用：只要单变量季节与节假日预测时用「Prophet 预测」；面向 8 周库存锁单的多变量融合用「TFT 库存补货决策」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
quality_tier: "curated"
p2s_card_id: "Skill-Temporal-Fusion-Transformer"
p2s_src_domain: "03-时间序列"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Temporal-Fusion-Transformer"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Temporal-Fusion-Transformer.md"
rebase_source_sha256: "7c1142af69a8933efc822228bbb9156f74ab17dc4f3557a64b779142275b8d4d"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "7c1142af69a8933efc822228bbb9156f74ab17dc4f3557a64b779142275b8d4d"
rebase_full_card_bytes: "3371"
rebase_full_card_lines: "92"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "bc7d007933e32a1b307c06804d5bf63ac78af29c1009bb08f903e4775d4ce08c"
user_summary: "同时预测几百个 SKU，还能说清是促销计划还是浏览量在拉动销量，并给出分位数区间。"
user_try: "试试：用 TFT 预测我 180 个辅食 SKU 未来 21 天销量，并给出各特征的重要性排名。"
whenToUse: "SKU 多、特征含静态与时变已知变量、需要可解释性与分位数区间时用；单变量季节预测用 Prophet；面向库存锁单的多变量融合用 TFT 库存补货决策。"
workflow: "整理日销量、浏览量、加购数三类时变未知特征 → 登记品类、品牌线、国家等静态特征与促销日历 → 训练 TFT 输出分位数预测与特征重要性 → 按分位区间指导采购与国际物流"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# 'Skill: Temporal Fusion Transformer (TFT) 多水平时序预测'

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`，sha256 `7c1142af69a8933efc822228bbb9156f74ab17dc4f3557a64b779142275b8d4d`，3371 字节 / 92 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `bc7d007933e32a1b307c06804d5bf63ac78af29c1009bb08f903e4775d4ce08c`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Temporal Fusion Transformer (TFT)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心思想**：TFT 是一种专为多水平时间序列预测设计的深度学习架构，能够同时处理静态特征（如产品类别）、时变已知特征（如节假日）和时变未知特征（如历史销量），并提供可解释的预测结果。

**数学直觉**：
- **分位数预测**：输出多个分位数（P10, P50, P90），提供预测区间
- **变量选择网络**：Softmax 门控机制自动学习特征重要性
- **可解释多头注意力**：捕获长期时间依赖，揭示关键历史时间点

**关键假设**：
1. 历史模式对未来有预测价值
2. 静态特征能调节时序动态
3. 存在可识别的季节性/趋势模式

---

## ② 母婴出海应用案例

### 场景1：多品类销量预测

**业务问题**：预测数百个 SKU 未来 7-30 天销量，考虑节假日、促销和季节性

**数据要求**：
| 类型 | 字段 | 说明 |
|-----|------|------|
| 静态 | 品类、品牌、国家 | 产品属性 |
| 时变已知 | 节假日、促销计划 | 未来已知 |
| 时变未知 | 历史销量、浏览量 | 仅历史观测 |

**预期产出**：
- 未来 7/14/30 天销量预测（P50 中位数）
- 预测区间（P10-P90）用于安全库存
- 变量重要性排名
- 注意力热力图

**业务价值**：库存周转提升 15-20%，物流成本降低，GMV 提升 8-12%

### 场景2：用户复购周期预测

**业务问题**：母婴产品生命周期明显，预测复购时间点实现精准触达

**业务价值**：复购率提升 10-15%，营销成本降低，LTV 提升

---

（**换底正文在此截断** —— 完整卡正文共 92 行，本页内联到第 53 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：24 个月销售数据、静态特征（品类、品牌线、目标国家）、时变已知特征（周促销计划、节假日日历）、时变未知特征（日销量、浏览量、加购数）；粒度：SKU×日，卡页示例 180 个 SKU。

**输出**：未来 21 天各 SKU 分位数预测与特征重要性排名（卡页示例 MAPE 由 22% 降至 12.8%、缺货率由 8% 降至 2.1%），供采购与国际物流计划使用。

## 执行步骤

1. 整理静态、时变已知与时变未知三类特征
2. 训练 TFT 并校验分位数损失
3. 输出预测区间与特征重要性排名
4. 按区间指导采购与物流排期

## 边界与不做

- 数据不满足时不用：历史未覆盖完整季节周期、或促销计划等已知特征无法提前获取时，多水平预测退化。
- 能力边界：只给预测与解释，不替代采购下单与物流调度。
- 能力边界：特征重要性是模型内归因，不等于业务因果。

## 技能关联

- **前置**：Skill-Feature-Engineering-for-ML、Skill-Time-Series-Basics
- **延伸**：Skill-Attention-Mechanism-Interpretability、Skill-Quantile-Regression-for-Uncertainty
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Strategy、Skill-Marketing-Campaign-Optimization、Skill-Temporal-Fusion-Transformer

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Temporal-Fusion-Transformer`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（369 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Temporal-Fusion-Transformer`（完整卡：`references/full-card.md`）。
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
