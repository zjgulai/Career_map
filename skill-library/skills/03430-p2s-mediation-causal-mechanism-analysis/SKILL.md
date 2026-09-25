---
name: "p2s-mediation-causal-mechanism-analysis"
title: "Causal Mediation Analysis — Decomposing \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"Why It Works"
description: "触发词：中介效应、机制分解、NDE、NIE、效果链路。何时不用：只需总效应点估计时用增量或双重稳健估计类技能；要从观测数据发现因果结构时用「PC算法因果发现」。安全边界：中介分析依赖无未观测混杂假设，结论须显式标注识别假设，不得对外宣称未经证实的因果机制。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 增量分析"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
quality_tier: "curated"
p2s_card_id: "Skill-Mediation-Causal-Mechanism-Analysis"
p2s_src_domain: "01-因果推断"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Mediation-Causal-Mechanism-Analysis"
rebase_vault_path: "paper2skills-vault/01-因果推断/Skill-Mediation-Causal-Mechanism-Analysis.md"
rebase_source_sha256: "7a603851fda1f17a4011c752d7f02efd6f9a0a9f9929241724a186a55c25128c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "7a603851fda1f17a4011c752d7f02efd6f9a0a9f9929241724a186a55c25128c"
rebase_full_card_bytes: "18678"
rebase_full_card_lines: "476"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "2b07a8c5ce906622753fcde6f0ee3a93707603ac54d69bb07c422eafe3d6f134"
user_summary: "效果有了却说不清怎么来的，用中介分析把总效应拆成几条路径，指出真正起作用的机制。"
user_try: "试试：推荐算法上线后转化率提升 2%，帮我分解成点击率、浏览深度、客单价三条路径的间接效应。"
whenToUse: "当已知某干预有效、需要回答它通过什么路径起作用（机制归属）时用本技能；只需处理效应的点估计与置信区间，用增量或双重稳健估计类技能；要发现变量间因果结构，用「PC算法因果发现」。"
workflow: "确定中介变量清单与控制变量 → 估计干预到结果的总效应 → 逐个中介估计干预到中介、中介到结果的路径系数 → 比较各中介的间接效应大小并做机制排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Causal Mediation Analysis — Decomposing \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\"Why It Works

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`，sha256 `7a603851fda1f17a4011c752d7f02efd6f9a0a9f9929241724a186a55c25128c`，18678 字节 / 476 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `2b07a8c5ce906622753fcde6f0ee3a93707603ac54d69bb07c422eafe3d6f134`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Causal Mediation Analysis

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心思想**：中介分析回答"为什么"——一个干预（如推荐算法更新）通过什么机制影响了结果（如转化率）。它将总效应分解为：
- **直接效应**：干预直接影响结果（不经过中介变量）
- **间接效应**：干预通过改变中介变量，再由中介变量影响结果

**为什么需要中介分析**：

母婴出海电商中，只知道"什么有效"不够，必须知道"为什么有效"才能复制和放大：
- 新推荐算法提升了转化率——是通过提升点击率实现的，还是通过提升客单价实现的？
- 客服响应速度加快降低了退货率——是因为用户更满意了，还是因为问题更快解决了？
- KOL合作带来了品牌曝光——是通过搜索量增长实现的，还是通过社交裂变实现的？

没有机制分解，就只能盲目复制表面动作，无法优化核心杠杆。

**核心公式（自然效应框架，Pearl 2001）**：

设：
- $T$ = 干预（如新旧推荐算法）
- $M$ = 中介变量（如点击率、浏览深度）
- $Y$ = 结果（如转化率、GMV）

**总效应（Total Effect, TE）**：
$$TE = E[Y(1, M(1))] - E[Y(0, M(0))]$$

**自然直接效应（Natural Direct Effect, NDE）**：
$$NDE = E[Y(1, M(0))] - E[Y(0, M(0))]$$
即：干预改变，但中介保持在未干预时的水平。

**自然间接效应（Natural Indirect Effect, NIE）**：
$$NIE = E[Y(1, M(1))] - E[Y(1, M(0))]$$
即：干预固定在接受状态，但中介从"未干预时的水平"变为"干预后的水平"。

**关键恒等式**：$TE = NDE + NIE$

**识别假设**：
1. **无未观测混杂**：干预→结果、干预→中介、中介→结果三条路径都没有未观测混杂
2. **无干预-中介交互混杂**：不存在同时影响中介和结果的变量受干预影响（这是最难满足的假设）
3. **序贯可忽略性**：给定协变量后，干预分配与潜在结果独立

**Surrogate Index（替代指标指数）**：

Chetty & Imai (2025) 提出的前沿方法：用短期可观测的中介变量（如点击率、加购率）构建"替代指标指数"，预测长期结果（如LTV、年度留存）。解决了长期效应评估的数据滞后问题。

**反直觉洞察**：直接效应和间接效应的符号可能相反。例如：促销活动（T）通过提升点击率（M）提升了转化率（Y），但同时促销活动也让用户产生"低价预期"心理，直接降低了转化率。此时 $NIE > 0$（点击率路径正向），但 $NDE < 0$（心理预期路径负向），总效应可能不显著——不看机制分解就会得出"促销无效"的错误结论。

---

## ② 母婴出海应用案例

### 场景1：推荐算法更新的机制分解

**业务问题**：产品团队上线了新的推荐算法（基于用户行为的协同过滤 → 基于内容的混合推荐），全站转化率提升了2%。但产品经理想知道：这2%是通过什么路径实现的？是点击率提升了？还是用户浏览深度增加了？还是客单价变了？

（**换底正文在此截断** —— 完整卡正文共 476 行，本页内联到第 62 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：同时观测干预、中介与结果三类变量的数据（含处理组/对照组标记）与必要控制变量，粒度到用户或订单。

**输出**：总效应、NDE、NIE 及各中介间接效应的排序；供产品与研究团队确定机制与优化重点。

## 执行步骤

1. 确定中介变量清单（如点击率、浏览深度、客单价）与控制变量
2. 估计干预到结果的总效应
3. 逐个中介 M 估计 T→M 与 M→Y 的路径系数
4. 比较各中介的间接效应大小并做机制排序
5. 输出主驱动机制结论

## 边界与不做

- 数据不满足：干预、中介、结果三者不能同时观测，或缺对照组时无法识别，不要硬做。
- 何时不用：只要总效应大小用增量或双重稳健估计类技能；要发现因果结构用「PC算法因果发现」；要判断异常来自哪条业务链路用「ProRCA」。
- 能力边界：只做机制分解，不执行干预，也不替代实验设计（结论受无未观测混杂假设约束）。
- 安全边界：必须显式论证并标注识别假设，不得把未验证的间接效应直接当作因果机制对外宣称。

## 技能关联

- **前置**：Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Network-Interference-Causal.html、Skill-Network-Interference-Causal、Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Mediation-Causal-Mechanism-Analysis

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-Mediation-Causal-Mechanism-Analysis`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（320 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Mediation-Causal-Mechanism-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2007.04271，但该号在 arXiv 上是《Incompleteness Matters Not: Inference of $H_0$ from BBH-galaxy cross-correlations》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Causal Mediation Analysis: A Review》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
