---
name: "p2s-ab-experimental-design"
title: "Skill: A/B 实验设计基础"
description: "触发词：样本量计算、功效分析、分层随机化、CUPED、实验计划。何时不用：无法做用户级随机分流时（平台限制或强网络效应）改用Geo Holdout或准实验方法。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 转化优化 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
quality_tier: "curated"
p2s_card_id: "Skill-AB-Experimental-Design"
p2s_src_domain: "02-A_B实验"
p2s_venue: "CIKM 2023"
p2s_venue_tier: "CCF-B"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-AB-Experimental-Design"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-AB-Experimental-Design.md"
rebase_source_sha256: "4ceb5b082e82b63fa5eacd3b06e6f507ece7c807f858ea61ad57330ec0d1f33b"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "4ceb5b082e82b63fa5eacd3b06e6f507ece7c807f858ea61ad57330ec0d1f33b"
rebase_full_card_bytes: "10785"
rebase_full_card_lines: "242"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "feaf21e59aaeeb502c5a5e12fcd9dae39a9c35ebd732950db175fd4cad000450"
user_summary: "实验开跑前先算准要多少样本、跑多少天、怎么分层，别让实验因为样本不足白跑一场。"
user_try: "试试：主图改版想把转化率从 2.5% 提到 2.75%、日流量 2000，帮我算样本量和实验天数。"
whenToUse: "当实验还能设计、需要规划样本量、实验天数、分层方式与方差缩减手段时用；已经无法做用户级随机分流（平台限制或强网络效应）时用「Geo Holdout 实验」；实验跑完要解读结论时用 A/B 结果解读类技能。"
workflow: "输入基线转化率与期望绝对提升，计算所需样本量 → 按相对提升做保守修正，并结合日流量推算实验天数 → 按国家、设备类型、新老用户做分层随机化，保证层内 1:1 → 用实验前转化率作为协变量做 CUPED 方差缩减 → 按缩减后的方差确定提前读出的时间点并产出实验计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill: A/B 实验设计基础

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`，sha256 `4ceb5b082e82b63fa5eacd3b06e6f507ece7c807f858ea61ad57330ec0d1f33b`，10785 字节 / 242 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `feaf21e59aaeeb502c5a5e12fcd9dae39a9c35ebd732950db175fd4cad000450`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: A/B 实验设计基础

> **证据基础声明**：本卡**有来源论文声明** —— frontmatter `paper:` 与 ① 段正文均写明
> 「基于 Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM」。
> 但**该论文全文尚未入库**，且卡内未记录其 arXiv/DOI 编号，
> 故卡内数字**暂无逐字引文支撑**，不可当作论文结论引用。
> 待补 `paper_id` 与「⑥ 原文引用」段后转为 `paper-verbatim`。
> （2026-09-12 修正：此前误标为「无对应论文来源」，与 frontmatter `paper:` 及 ① 段自相矛盾 ——
> 该矛盾由 G2 的 `BASIS-CONTRADICTION` 检查抓出，是那条检查生效的实证。）

## 一、算法原理

### 核心思想

A/B 测试的统计严谨性建立在**样本量规划**、**功效保证**和**方差控制**三大支柱上。本技能基于 Zhou et al. (2023) 的系统性综述，将学术界的最佳实践封装为可直接调用的 Python 工具包，解决电商实验中最常见的四类问题：

1. **该测多少用户？** — 连续/二分类指标的样本量计算
2. **能不能检测到这个效应？** — Power 分析与 MDE 回验
3. **分组是否公平？** — 分层随机分配消除基线偏差
4. **能不能更快出结论？** — CUPED 利用实验前数据缩减方差

### 数学直觉

**1. 连续型指标样本量 (两样本 t 检验)**

$$
n = \frac{(Z_{1-\alpha/2} + Z_{1-\beta})^2 \cdot \sigma^2 \cdot (1 + 1/r)}{\delta^2}
$$

其中 $\delta$ 为最小可检测效应 (MDE)，$\sigma$ 为指标标准差，$r$ 为治疗组/控制组样本量比。

**2. 二分类指标样本量 (比例检验)**

使用合并比例 (pooled proportion) 估计方差：

$$
p_{\text{pool}} = \frac{p_c + p_t}{2}, \quad n = \frac{(Z_{1-\alpha/2} + Z_{1-\beta})^2 \cdot p_{\text{pool}}(1-p_{\text{pool}}) \cdot (1 + 1/r)}{\delta^2}
$$

**3. 相对提升 (Relative Lift) 的 Delta Method 修正**

当业务关注相对提升 $\delta_{\text{rel}} = (p_t - p_c) / p_c$ 时，分母中的控制组比例引入额外方差。Zhou et al. (2023) 提出使用 Delta method 调整方差因子：

$$
n_{\text{rel}} \approx \frac{(Z_{1-\alpha/2} + Z_{1-\beta})^2 \cdot p_{\text{pool}}(1-p_{\text{pool}}) \cdot (1/p_c^2 + p_t^2/p_c^4)}{\delta_{\text{rel}}^2}
$$

相对提升设计通常比绝对提升**更保守**（需要更大样本量）。

**4. 统计功效 (Power) 与 MDE**

给定每组样本量 $n_t$，功效计算公式：

$$
\text{Power} = 1 - \Phi\left( Z_{1-\alpha/2} - \frac{\delta \sqrt{n_t}}{\sigma \sqrt{1+1/r}} \right)
$$

MDE（最小可检测效应）则是功效公式的反解：

$$
\text{MDE} = \frac{(Z_{1-\alpha/2} + Z_{1-\beta}) \cdot \sigma \cdot \sqrt{1+1/r}}{\sqrt{n_t}}
$$

**5. CUPED 方差缩减**

CUPED (Controlled-experiment Using Pre-Experiment Data) 通过实验前的同一指标 $x$ 对结果 $y$ 做线性调整：

$$
\theta = \frac{\text{Cov}(y, x)}{\text{Var}(x)}, \quad y_{\text{cuped}} = y - \theta \cdot (x - \bar{x})
$$

当历史指标与未来指标相关性高时，CUPED 可将方差降低 20%-50%，等效于样本量缩减 1.25-2 倍。

### 关键假设

- 样本独立同分布，治疗效果恒定 (ATE 框架)
- 对于二分类指标，正态近似在样本量足够大时成立
- CUPED 要求实验前协变量与实验结果存在稳定相关性
- 分层分配假设各 stratum 的处理概率恒定

---

## 二、业务应用

（**换底正文在此截断** —— 完整卡正文共 242 行，本页内联到第 84 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：基线转化率（卡页示例 2.5%）与期望提升（示例相对提升 10%）+ 日流量（示例 2000 UV/天）+ 分层变量（国家、设备类型、新老用户）+ 实验前各用户的转化率作为 CUPED 协变量。

**输出**：所需样本量与实验天数、分层随机化方案（各层内处理组与控制组 1:1 平衡）、以及经 CUPED 方差缩减后的提前读出时间（卡页示例可提前 30% 时间得出结论）。

## 执行步骤

1. 输入基线转化率与期望绝对提升，计算所需样本量
2. 按相对提升做保守修正并结合日流量推算实验天数
3. 按国家、设备类型、新老用户做分层随机化，保证层内 1:1
4. 用实验前转化率作为协变量做 CUPED 方差缩减
5. 按缩减后的方差确定提前读出时间并产出实验计划

## 边界与不做

- 何时不用：无法做用户级随机分流时（平台条款限制或网络效应强）不适用，改用 Geo Holdout 或准实验方法；样本量远达不到计算值时应延长周期或提高最小可检测效应，而不是硬跑。
- 能力边界：只输出实验计划与样本量方案，不执行分流与埋点；结论依赖基线转化率与日流量输入的准确性；卡页第 7 段无代码模板，落地需另行获取代码。
- 卡页数字（基线 2.5%、相对提升 10%、日流量 2000 UV/天、CUPED 提前 30%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-AB-Test-Result-Interpretation.html、Skill-AB-Test-Result-Interpretation、Skill-Power-Analysis-Sample-Size.html、Skill-Power-Analysis-Sample-Size
- **可组合**：Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB、Skill-AB-Experimental-Design

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-AB-Experimental-Design`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`）。

- 标题：Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM.
- 发表处：CIKM 2023
- venue 档位：CCF-B
- 证据基础：paper-traceable

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`）。
>
> - 标题：Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM.
> - 发表处：CIKM 2023
> - venue 档位：CCF-B
> - 证据基础：paper-traceable
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`）。
> >
> > - 标题：Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM.
> > - 发表处：CIKM 2023
> > - venue 档位：CCF-B
> > - 证据基础：paper-traceable
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`）。
> > >
> > > - 标题：Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM.
> > > - 发表处：CIKM 2023
> > > - venue 档位：CCF-B
> > > - 证据基础：paper-traceable
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-AB-Experimental-Design`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 标题：Zhou et al. (2023). All about Sample-Size Calculations for A/B Testing. CIKM.
> > > > - 发表处：CIKM 2023
> > > > - venue 档位：CCF-B
> > > > - 证据基础：paper-traceable
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
