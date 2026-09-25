---
name: "p2s-ab-test-result-interpretation"
title: "A/B Test Result Interpretation and Practical Significance"
description: "触发词：实验结果解读、效应量、置信区间、分段分析、Guardrail。何时不用：实验还在设计阶段用A/B实验设计类技能；本技能用于拿到结果后判断该不该上线。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
quality_tier: "curated"
p2s_card_id: "Skill-AB-Test-Result-Interpretation"
p2s_src_domain: "02-A_B实验"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-AB-Test-Result-Interpretation"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-AB-Test-Result-Interpretation.md"
rebase_source_sha256: "f36010deae0d5c4a3f97384a8a65e02f8a006e133fe489be06abe0780b9663c6"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "f36010deae0d5c4a3f97384a8a65e02f8a006e133fe489be06abe0780b9663c6"
rebase_full_card_bytes: "9195"
rebase_full_card_lines: "238"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "fc5426c43a81e7dbafaef29fd68757736ab863c8a09b3b2fdd09c16d332f099a"
user_summary: "拿到实验结果后判断除了统计显著之外业务上是否值得上线，并指出哪些国家或分段该推、哪些不该推。"
user_try: "试试：实验组 +6%、P=0.03，帮我判断这个结果值不值得全量上线。"
whenToUse: "当实验已跑完、需要判断统计显著与业务显著并决定全量或分国家上线时用；实验还没开始、要算样本量与分层方案时用 A/B 实验设计类技能。"
workflow: "检查 P 值与 95% 置信区间，判断是否统计显著 → 计算绝对提升与相对提升，评估效应量大小 → 用日均 UV 折算每天与每月的业务增量，判断业务显著性 → 做分国家、分设备的分段分析并检查 Guardrail 指标 → 给出全量、分国家上线或不推的结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# A/B Test Result Interpretation and Practical Significance

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`，sha256 `f36010deae0d5c4a3f97384a8a65e02f8a006e133fe489be06abe0780b9663c6`，9195 字节 / 238 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `fc5426c43a81e7dbafaef29fd68757736ab863c8a09b3b2fdd09c16d332f099a`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: A/B Test Result Interpretation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：Power Analysis告诉你"测多少"，实验跑完后，如何正确解读结果？很多团队会犯这些错误：
- 只看P值，不估计效应量
- 把统计显著当成业务显著
- 忽视置信区间的宽度
- 对不显著的结果下"无效"结论（可能是样本量不足）

**正确解读框架**：

**1. 效应量估计（Effect Size）**

统计显著 ≠ 业务有价值。效应量告诉你"改了之后提升了多少"。

- **绝对提升**：实验组 - 对照组
- **相对提升**：（实验组 - 对照组）/ 对照组
- **Cohen's d**：（实验组 - 对照组）/ 合并标准差（标准化效应量）

**2. 置信区间（Confidence Interval）**

点估计不可靠，区间估计才可靠。95%置信区间告诉你"真实效应有95%的概率落在这个范围"。

- 如果CI下限 > 0：正向显著
- 如果CI上限 < 0：负向显著
- 如果CI包含0：不显著（但不能说"无效"）

**3. 统计显著 vs 业务显著**

| 场景 | 统计显著 | 业务显著 | 结论 |
|------|---------|---------|------|
| 转化率提升0.1%，P=0.01 | ✅ | ❌（提升太小） | 不值得上线 |
| 转化率提升5%，P=0.10 | ❌ | ✅（提升大） | 样本量不足，需要扩大实验 |
| 转化率提升5%，P=0.001 | ✅ | ✅ | 上线 |
| 转化率下降2%，P=0.03 | ✅ | ✅（负向） | 不上线 |

**4. 实验后检验（Post-hoc Analysis）**

- **分段分析**：不同用户群体（新/老、不同国家）的效果是否一致？
- **时间趋势**：效果是否随时间衰减？
- **Guardrail Metrics**：是否对其他关键指标产生负面影响？

**反直觉洞察**：
- P=0.05意味着"如果改动无效，有5%的概率看到当前结果"——不是"改动有效的概率是95%"
- 跑了10个实验，即使所有改动都无效，也有约40%的概率至少有一个显著（多重比较问题）
- "不显著"不等于"零效应"——可能是效应存在但样本量不够检测出来

---

## ② 母婴出海应用案例

### 场景1：首页改版实验结果解读

**实验结果**：
- 对照组转化率：2.00%
- 实验组转化率：2.12%
- 相对提升：+6.0%
- P值：0.03
- 95% CI：[0.02%, 0.22%]

**解读流程**：
1. **统计显著？** P=0.03 < 0.05 → ✅ 统计显著
2. **效应量？** 绝对提升0.12个百分点，相对提升6% → 中小效应
3. **业务显著？** 日均50,000 UV，提升0.12% = 每天多60单，月增1,800单 → ✅ 业务显著
4. **置信区间？** [0.02%, 0.22%] → 真实提升至少0.02%，值得上线
5. **分段分析？** 美国站+8%，德国站+3%，英国站-1% → 考虑分国家上线
6. **Guardrail？** 客单价无显著变化，退货率无显著变化 → ✅ 安全

**结论**：建议在美国站和德国站上线，英国站不推。

### 场景2：不显著结果的后续决策

**实验结果**：
- 对照组转化率：2.00%
- 实验组转化率：2.05%
- 相对提升：+2.5%
- P值：0.25
- 95% CI：[-0.05%, 0.15%]

**解读**：
- 不显著（P>0.05），但CI上限0.15%暗示可能有正向效应
- MDE回顾：如果实验前设定的MDE是0.1%（相对5%），当前提升2.5%小于MDE
- 决策：不扩大实验，也不放弃——将这个设计元素保留为备选方案，在更大改动中复用

---

（**换底正文在此截断** —— 完整卡正文共 238 行，本页内联到第 91 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：实验的对照组与实验组转化数与样本量（或转化率）、P 值与 95% 置信区间、日均 UV、分国家与分设备的分段结果，以及客单价、退货率等 Guardrail 指标；卡页示例为对照 2.00%、实验 2.12%、相对 +6.0%、P=0.03、CI [0.02%, 0.22%]。

**输出**：统计显著与业务显著的判定、分段上线建议与 Guardrail 检查结论（卡页示例结论：美国站 +8%、德国站 +3% 建议上线，英国站 -1% 不推）。

## 执行步骤

1. 检查 P 值与 95% 置信区间，判断是否统计显著
2. 计算绝对提升与相对提升，评估效应量大小
3. 用日均 UV 折算每天与每月的业务增量，判断业务显著性
4. 做分国家、分设备的分段分析并检查 Guardrail 指标
5. 输出全量、分国家上线或不推的结论

## 边界与不做

- 何时不用：实验还在设计阶段、要算样本量与分层方案时用 A/B 实验设计类技能；只看 P 值而不看业务增量与 Guardrail 时，容易得出错误的上线结论。
- 能力边界：只做结论解读与上线范围建议，不执行上线动作；解读依赖实验期间的数据质量，若存在污染或分流不均需另行排查。
- 卡页数字（+6.0%、P=0.03、CI [0.02%, 0.22%]、美国 +8%/德国 +3%/英国 -1%、年化省 12 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size
- **延伸**：Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest
- **可组合**：Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-AB-Test-Result-Interpretation

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-AB-Test-Result-Interpretation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（126 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-AB-Test-Result-Interpretation`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1906.07191，但该号在 arXiv 上是《Interacting Valley Chern Insulator and its Topological Imprint on Moiré Superconductors》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《A/B Testing: A Systematic Literature Review》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
