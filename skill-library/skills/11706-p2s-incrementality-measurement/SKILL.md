---
name: "p2s-incrementality-measurement"
title: "Skill-Incrementality-Measurement"
description: "触发词：p2s-incrementality-measurement。Skill-Incrementality-Measurement"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 实验设计"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
quality_tier: "curated"
p2s_card_id: "Skill-Incrementality-Measurement"
p2s_src_domain: "14-用户分析"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2607.09608"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Incrementality-Measurement"
rebase_vault_path: "paper2skills-vault/14-用户分析/Skill-Incrementality-Measurement.md"
rebase_source_sha256: "a65b5ebb8fa3e182679c9686033eb15f24fe984303af33b6aea95876fcb1cdca"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a65b5ebb8fa3e182679c9686033eb15f24fe984303af33b6aea95876fcb1cdca"
rebase_full_card_bytes: "46107"
rebase_full_card_lines: "582"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "22"
rebase_evidence_quotes_total: "31"
rebase_evidence_quotes_complete: "false"
---
# Skill-Incrementality-Measurement

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Incrementality-Measurement`（完整卡：`references/full-card.md`，sha256 `a65b5ebb8fa3e182679c9686033eb15f24fe984303af33b6aea95876fcb1cdca`，46107 字节 / 582 行 / 31 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 22 条（共 31 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 渠道完整结果的受众级增量测量（Channel-Complete ITT Incrementality Measurement）

**与同目录两张卡的分工**：`Skill-User-Funnel-Analysis.md` 回答「漏斗每一步流失多少」，`Skill-Cohort-Retention-Analysis.md` 回答「按批次看留存」。两张卡都建立在**同一份可观测事件表**之上。本卡问的是更上游的问题：漏斗顶端那些「种草了、但在别的平台成交」的增量，在归因数据里**根本不存在**——不是漏斗哪一步漏了，而是这笔转化从未被记到发起渠道名下。因此本卡与 `Skill-Ad-Attribution-Modeling.md`（归因口径）是**替代关系**，不是叠加关系。


（**换底正文在此截断** —— 完整卡正文共 582 行，本页内联到第 5 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 22 / 全 31 条 —— **其余 9 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 31 条逐字引文。本页按完整卡顺序内联**前 22 条整条引文**（不在引文中间断开）；其余 9 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："We term the un-credited, demand-generating impression an assist, in the football sense: it set up the goal. But because the assist is invisible to the measurement system in attribution-based systems, it is scored against the originating platform—an own goal."
> 出处：2607.09608 §1 Introduction（fulltext.md L33）｜Q3

> 原文："Hence the assisted own goal hypothesis: the act of successfully generating demand can, through the attribution layer, either not increase, or in some cases even reduce the generating platform’s measured performance and therefore its advertising revenue."
> 出处：2607.09608 §1 Introduction（fulltext.md L33）｜Q4

> 原文："When the purchase occurs on a trusted marketplace that does not pass conversion signals from the originating platform back to the advertiser – and that is true for most inter-marketplace transactions – the conversion is simply not observed by the advertiser’s attribution system."
> 出处：2607.09608 §1 Introduction（fulltext.md L31）｜Q2

> 原文："Because ITT contrasts are computed on channel-complete outcomes, the estimator is unbiased and the own goal disappears."
> 出处：2607.09608 §Abstract（fulltext.md L19）｜Q1

**B. 归因为什么看不见（τ 与 φ 的机制）**

> 原文："Trusted marketplaces characteristically suppress third-party signal or share any data of its referrer (in this case $G$), so empirically $\phi$ is close to $0$."
> 出处：2607.09608 §2.5 The attribution measurement layer（fulltext.md L123）｜Q6

> 原文："$\kappa(\tau,\phi)\;\equiv\;(1-\tau)+\phi\,\tau\;=\;1-\tau(1-\phi)\;\in(0,1].$"
> 出处：2607.09608 §2.5 The attribution measurement layer 式 (4)（fulltext.md L129）｜Q7

> 原文："It is worth pointing out that the failure is not the crediting heuristic (i.e. last- vs. multi-touch), but the observability constraint: while multi-touch or data-driven attribution re-divides credit among observed touchpoints, the own goal removes the conversion from the observable universe. No re-weighting of visible touchpoints can restore credit for this invisible conversion."
> 出处：2607.09608 §4.1 Attribution-based measurement（fulltext.md L203）｜Q11

**C. 理论结果（Proposition 1 / 2 / 3）**

> 原文："Measured ROAS understates true incremental ROAS by exactly the observability factor $1-\tau(1-\phi)$ with equality if and only if either there is no distrust ($\tau=0$) or off-platform purchases are perfectly back-propagated ($\phi=1$). The wedge is strictly increasing in distrust $\tau$ and strictly decreasing in the recovery rate $\phi$."
> 出处：2607.09608 §2.6 Proposition 1（fulltext.md L143）｜Q8

> 原文："Under ROAS-thresholding allocation, the demand-generating platform receives strictly less than first-best spend whenever $\tau>0$ and $\phi<1$:"
> 出处：2607.09608 §2.7 Proposition 2（fulltext.md L157）｜Q9

> 原文："$\frac{s_{G}^{\text{attr}}}{s_{G}^{\text{true}}}=\kappa(\tau,\phi)^{\frac{1}{1-\beta}}=\big(1-\tau(1-\phi)\big)^{\frac{1}{1-\beta}}\;<\;1.$"
> 出处：2607.09608 §2.7 Proposition 2 的比值式（fulltext.md L159）｜Q10

> 原文："Under randomization of $Z_{i}$ and channel-complete outcome measurement, $\Delta^{\text{ITT}}$ identifies the average incremental purchase effect per assigned user and is invariant to the diversion share $\tau$, the recovery rate $\phi$, and the marketplace claim share $\eta$."
> 出处：2607.09608 §5.2 Proposition 3（fulltext.md L243）｜Q18

> 原文："The proposition states the formal sense in which the own goal is a measurement artifact: the same assist that is invisible to attribution is fully recoverable by a channel-complete ITT under a randomized experiment."
> 出处：2607.09608 §5.2（fulltext.md L245）｜Q19

**D. 另外两个测量口径为什么不解决它**

> 原文："First, and most directly tied to our mechanism, the harvester’s spend is endogenous to the generator’s demand: $R$ prices and sells sponsored placements against the arriving intent, so any typical regression model regressing total purchase intent on $s_{R}$ and $S_{G}$ does not know how much of the generated demand to attribute to the harvesting channel—the own goal reappears as simultaneity or multi-colinearity bias rather than signal loss."
> 出处：2607.09608 §4.2 Marketing-mix models（fulltext.md L209）｜Q12

> 原文："Third, MMM resolves channels by week or quarter, not by day, so it cannot drive the thresholding decisions even when its aggregate reading is correct."
> 出处：2607.09608 §4.2 Marketing-mix models（fulltext.md L209）｜Q13

> 原文："Such estimates recover $\mathrm{ROAS}^{\text{true}}_{G}$ and are, by construction, invariant to the diversion share $\tau$: a holdout simply buys less of the product in total, wherever those sales would have occurred."
> 出处：2607.09608 §4.3 Incrementality-based experimentation（fulltext.md L213）｜Q14

**E. 测量方案的两个部件（ambient 随机化 + 个体级扩展）**

> 原文："Assignment is a deterministic hash of the user identifier salted by an audience-specific key: user $i$ is assigned to control in audience $a$ if and only if $h(i,a)\bmod 100<100\,c_{a}$, where $c_{a}$ is the audience’s control percentage."
> 出处：2607.09608 §5.1 Ambient audience-level randomization（fulltext.md L231）｜Q15

> 原文："the outcome measured in the brand’s first-party transaction data—channel-complete by construction, in the sense that it aggregates purchases wherever they are booked: on the generator’s storefront, on the marketplace, or offline."
> 出处：2607.09608 §5.2 Intent-to-treat as the estimand（fulltext.md L235）｜Q16

> 原文："Using assignment rather than exposure avoids conditioning on the ad platform’s endogenous delivery decisions (who saw the ad is algorithmically selected; who was assigned is controled by GrowthLoop’s randomization procedure), and matches the advertiser’s decision variable: budget buys assignment, not exposure."
> 出处：2607.09608 §5.2（fulltext.md L239）｜Q17

> 原文："using 2,226 Meta RCTs, it trains a model mapping campaign features—including post-determined aggregates such as exposure rates and last-click conversions, which would be invalid controls in a causal regression but are valid predictors once identification is handled by the experiments—to experiment-identified incrementality, achieving out-of-sample $R^{2}=0.88$ against $R^{2}=0.19$ for seven-day last-click attribution."
> 出处：2607.09608 §5.3（fulltext.md L249，**论文转引 Gordon et al. (2023) 的 campaign 级结果，不是本论文的实验**）｜Q20

> 原文："The feature coefficients can now be projected onto any audience with no holdout given that the audience in question has the same features at both individual- and campaign-level as the initial set of experiments."
> 出处：2607.09608 §5.3 Projection onto campaigns without holdouts（fulltext.md L259）｜Q21

> 原文："Assigning converters randomly after the fact is independent of treatment by construction and dilutes the intent-to-treat effect toward zero; assigning by observed exposure conditions on the platform’s endogenous delivery reproduces the attribution bias. Assignment must precede exposure."
> 出处：2607.09608 §5.4 Acquisition advertising and the enumerability constraint（fulltext.md L263）｜Q22

> 原文："Note that platform-side lift studies delegate individual-level randomization to the party that can enumerate at auction time—though their platform-observed outcomes are not channel-complete, so the own goal survives inside the lift test itself."
> 出处：2607.09608 §5.4（fulltext.md L265）｜Q23

**F. 模拟研究（§6）—— 论文**没有**真实数据，本段全部是模拟设定与模拟输出**

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Incrementality-Measurement`（完整卡：`references/full-card.md`）。

- 论文：2607.09608
- 标题：Media Measurement and the Assisted Own Goal: Attribution, Marketing-Mix Models, and Individual-Level Incrementality
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Ad-Attribution-Modeling.md, Skill-Cannibalization-Corrected-Attribution.md, Skill-Causal-Budget-Allocation.md, Skill-Marketing-Mix-Modeling.md, Skill-Uplift-Modeling.md, Skill-User-Funnel-Analysis.md

- 逐字引文：31 条，全部内联于上方「原文引用」段；一条不截断。
