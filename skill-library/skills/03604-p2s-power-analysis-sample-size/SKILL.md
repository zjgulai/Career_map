---
name: "p2s-power-analysis-sample-size"
title: "Power Analysis and Sample Size Calculation for A/B Testing"
description: "触发词：功效分析、样本量计算、MDE、实验周期估算、检验功效、实验前置检查。何时不用：实验已在跑或已结束、要判断结果显著性时用序列检验或常规检验；需要动态分流时用 MAB 类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
quality_tier: "curated"
p2s_card_id: "Skill-Power-Analysis-Sample-Size"
p2s_src_domain: "02-A_B实验"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Power-Analysis-Sample-Size"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-Power-Analysis-Sample-Size.md"
rebase_source_sha256: "c761372212a684aa3e70b9aa0c747603386400bac3de2ca9d6fb3430d827b894"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c761372212a684aa3e70b9aa0c747603386400bac3de2ca9d6fb3430d827b894"
rebase_full_card_bytes: "11652"
rebase_full_card_lines: "335"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "fe318be3b44e8253dbf757814446250fad9b3d379ce892663a0dc54ff19108cb"
user_summary: "实验前先算清楚要多少样本、要跑几天，避免样本不足导致实验白跑。"
user_try: "试试：我的基线转化率 2%，想检测 10% 的相对提升，帮我算样本量和实验天数。"
whenToUse: "实验启动前定样本量与周期时用本技能；实验已开始要判断显著性时用序列检验或常规检验；要边跑边分配流量时用 MAB 或 Thompson 采样。"
workflow: "明确基线指标、MDE、显著性水平与目标功效 → 按比例型或连续型指标选择计算公式 → 算出每组与两组总样本量 → 结合日均流量与分流比例推算实验天数 → 给出分流、缓冲天数与不显著时的判断建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Power Analysis and Sample Size Calculation for A/B Testing

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`，sha256 `c761372212a684aa3e70b9aa0c747603386400bac3de2ca9d6fb3430d827b894`，11652 字节 / 335 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `fe318be3b44e8253dbf757814446250fad9b3d379ce892663a0dc54ff19108cb`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Power Analysis and Sample Size Calculation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心问题**：A/B测试需要多少样本才能检测出真实的效应？样本太少——检验力不足，假阴性率高（漏掉真实有效的改动）；样本太多——浪费流量和时间，拖慢迭代速度。

**四个核心参数**：

| 参数 | 符号 | 含义 | 常用取值 |
|------|------|------|---------|
| 显著性水平 | $\alpha$ | 假阳性率（I类错误） | 0.05 |
| 统计功效 | $1 - \beta$ | 正确拒绝原假设的概率 | 0.80 |
| 最小可检测效应 | MDE | 业务上值得检测的最小差异 | 依场景而定 |
| 标准差 | $\sigma$ | 结果变量的波动程度 | 历史数据估计 |

**样本量公式（连续型指标）**：

$$n = \frac{2\sigma^2(Z_{1-\alpha/2} + Z_{1-\beta})^2}{MDE^2}$$

其中：
- $Z_{1-\alpha/2} = 1.96$（双侧检验，α=0.05）
- $Z_{1-\beta} = 0.84$（功效80%）

**比例型指标（如转化率）**：

$$n = \frac{(Z_{1-\alpha/2}\sqrt{2p(1-p)} + Z_{1-\beta}\sqrt{p(1-p) + (p+MDE)(1-p-MDE)})^2}{MDE^2}$$

其中 $p$ 是基准转化率。

**反直觉洞察**：
- 样本量与 MDE 的平方成反比——想把检测精度提高一倍，需要四倍样本
- 提升功效从80%到90%，样本量增加约30%；从90%到95%，再增加约60%
- 90%的测试失败不是因为改动无效，而是因为样本量不够检测出真实的小幅改进

---

## ② 母婴出海应用案例

### 场景1：首页改版实验的样本量计算

**业务问题**：产品团队想测试新版首页布局对转化率的影响。预期转化率从2.0%提升到2.2%（相对提升10%），需要多少样本？实验要跑多久？

**计算流程**：
1. **确定参数**：
   - 基准转化率 $p = 0.02$
   - MDE = 0.002（绝对提升0.2个百分点）
   - $\alpha = 0.05$（双侧）
   - 功效 = 0.80
2. **计算样本量**：
   - 每组需要约 39,000 用户
   - 两组共 78,000 用户
3. **计算实验时长**：
   - 日均活跃用户（DAU）= 50,000
   - 实验分流50% → 每天进入实验 25,000 人
   - 所需天数 = 78,000 / 25,000 ≈ 3.1 天

**决策输出**：
- 实验设计：50/50分流，跑4天（含1天缓冲）
- 若4天后结果不显著，不要急于下结论"无效"——可能是MDE设得太小

### 场景2：多实验并行时的流量分配

**业务问题**：同时有3个A/B测试在进行（首页改版、详情页优化、购物车流程），每个都需要一定样本量。如何在有限流量下合理分配？

**策略**：
1. 计算每个实验所需样本量
2. 按业务优先级排序
3. 高优先级实验全流量，低优先级实验降流量延长实验周期
4. 避免实验间相互污染（正交分层）

---

（**换底正文在此截断** —— 完整卡正文共 335 行，本页内联到第 78 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：历史数据汇总参数：基线转化率或指标均值与标准差、想检测的最小可检测效应 MDE、显著性水平与目标功效，以及日均流量与分流比例；只需汇总值，不要求用户级明细。

**输出**：每组与总样本量、预计实验天数、对应的 MDE 或功效，以及分流与缓冲天数建议；供产品或研究经理在实验启动前做设计评审。

## 执行步骤

1. 明确基线指标、MDE、显著性水平与目标功效
2. 按比例型或连续型指标选择样本量公式
3. 计算每组与两组总样本量
4. 用日均流量与分流比例推算实验天数
5. 给出分流方案、缓冲天数与不显著时的后续判断建议

## 边界与不做

- 何时不用：实验已在运行或已结束就不要用本技能，此时应做显著性检验、序列检验或干扰校正。
- 能力边界：本技能只算样本量与周期，不判断业务上该不该做这个实验，也不产出显著性结论。
- 使用前提：MDE 需与业务方共同确认；没有功效分析的 A/B 测试视为设计不完整。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design
- **可组合**：Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-Power-Analysis-Sample-Size

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Power-Analysis-Sample-Size`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（201 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Power-Analysis-Sample-Size`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2002.05798，但该号在 arXiv 上是《Compensation of Linear Attacks to Cyber Physical Systems through ARX System Identification》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Sample Size Determination for A/B Testing in Online Controlled Experiments》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
