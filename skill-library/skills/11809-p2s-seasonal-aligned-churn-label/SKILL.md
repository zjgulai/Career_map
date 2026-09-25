---
name: "p2s-seasonal-aligned-churn-label"
title: "Skill-Seasonal-Aligned-Churn-Label"
description: "触发词：p2s-seasonal-aligned-churn-label。Skill-Seasonal-Aligned-Churn-Label"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/分群"
quality_tier: "curated"
p2s_card_id: "Skill-Seasonal-Aligned-Churn-Label"
p2s_src_domain: "06-增长模型"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.18174"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Seasonal-Aligned-Churn-Label"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-Seasonal-Aligned-Churn-Label.md"
rebase_source_sha256: "204512023d0dbb2d79161397e5cbcb63090966b236abbbbcb58c93f6a8790d1c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "204512023d0dbb2d79161397e5cbcb63090966b236abbbbcb58c93f6a8790d1c"
rebase_full_card_bytes: "43869"
rebase_full_card_lines: "648"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "32"
rebase_evidence_quotes_total: "40"
rebase_evidence_quotes_complete: "false"
---
# Skill-Seasonal-Aligned-Churn-Label

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Seasonal-Aligned-Churn-Label`（完整卡：`references/full-card.md`，sha256 `204512023d0dbb2d79161397e5cbcb63090966b236abbbbcb58c93f6a8790d1c`，43869 字节 / 648 行 / 40 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 32 条（共 40 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: Seasonal-Aligned Churn Label（季节性对齐的衰退标签）

> **与 `Skill-Customer-Churn-Prediction.md` 的分工（先读这一行）**
> 那张卡解决「**给定**流失标签，怎么把用户排序、怎么选阈值」；本卡解决「**标签本身错了**」。
> 论文的核心发现：相邻窗口（trailing vs forward）阈值比标签的两个窗口覆盖**不同的日历月**，
> 于是季节性实体的「淡季」会被读成「衰退」，而模型学得越好，越像一个季节性检测器。
> 本卡修的是标签，不是模型。两者可以叠加，但**先修标签，再训模型**。

---

## ① 算法原理

**核心思想**
非契约型业务里「衰退」只能从交易历史自己造出来：业界标准做法是相邻窗口阈值比 ——

（**换底正文在此截断** —— 完整卡正文共 648 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 32 / 全 40 条 —— **其余 8 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 40 条逐字引文。本页按完整卡顺序内联**前 32 条整条引文**（不在引文中间断开）；其余 8 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："The construction has a defect: its two windows cover different calendar months. For a seasonal entity the two windows sit at different points of the seasonal cycle. The label therefore fires on seasonal descent and heals on seasonal ascent, whether or not the entity’s trajectory has changed."
> 出处：2608.18174 §1 Introduction

> 原文："For a purely seasonal entity anchored just after its peak, the trailing baseline sums the high season and the outcome window sums the low season. The adjacent ratio then reads 0.5, and the label declares “decay” with no decline anywhere in the series. The year-over-year baseline reads parity."
> 出处：2608.18174 §3.2 Why the adjacent label is calendar-dependent

> 原文："Part (ii) is the mechanism in one line. The twelve anchor-month ratios have geometric mean exactly one. Any profile whose window sums are not all equal therefore places some anchors below parity."
> 出处：2608.18174 §3.2 Why the adjacent label is calendar-dependent

> 原文："Across its 10,426 buyer–month training observations, the decay-event rate ranged from 2.4% at April anchors to 9.3% at October anchors. About half of the decay events dissolved under a seasonally aligned definition."
> 出处：2608.18174 §1 Introduction


### 生产系统与公共面板的实测

> 原文："Raising it from zero through $50K, $100K, and $200K of trailing annual value moves the ratio $1.3\to 2.1\to 2.4\to 3.4$."
> 出处：2608.18174 §5.1 The anchor-month artifact replicates on public panels

> 原文："On the production material cohort (the deployed materiality floor applied to the full panel) the adjacent decay rate troughs at 3.9% in April and peaks at 9.1% in November. That is a max/min ratio of 2.4, with a coefficient of variation of 0.284. The aligned label sits nearly flat between 7.1% and 8.6% (CV 0.054). Half of the adjacent events (50%, interval $[45,54]$) have no aligned counterpart."
> 出处：2608.18174 §5.1 The anchor-month artifact replicates on public panels

> 原文："Seasonality is substantial: 214 of 383 material buyers swing more than 50% from peak to trough within a year."
> 出处：2608.18174 §4.1 Panels

> 原文："The adjacent label’s false-event rate rises from below 0.01% at $a=0$ through 3.0% at $a=0.4$ to 27.3% at $a=0.8$. The aligned label stays at or below 0.03% at every amplitude."
> 出处：2608.18174 §5.2 The synthetic sweep isolates the mechanism

> 原文："On the injected true declines, recall is 0.905 aligned against 0.820 adjacent (Figure 2b)."
> 出处：2608.18174 §5.2 The synthetic sweep isolates the mechanism

> 原文："Pooled across every anchor month, 37–69% of the adjacent label’s decay events on the public panels have no aligned counterpart."
> 出处：2608.18174 §5.3 Pooling does not repair the labels

> 原文："Pooling fixes the composition of the training set without fixing the labels inside it."
> 出处：2608.18174 §5.3 Pooling does not repair the labels

> 原文："An entity–anchor observation is valid when at least 75% of the trailing twelve available months are positive (the public analogue of the production materiality floor)."
> 出处：2608.18174 §4.2 Protocol


### 修正的代价、替代方案与稳健性

> 原文："Pooled indices fail where seasonal phases are heterogeneous — a panel-level index cannot serve entities that peak in different months."
> 出处：2608.18174 §5.5 Alternative remedies, measured

> 原文："On M5 and production, where profiles drift and history is shorter, they leave two to more than three times the aligned label’s dispersion. They also demand a year more history."
> 出处：2608.18174 §5.5 Alternative remedies, measured

> 原文："| Adjacent | 12 | 9.2% | 0.82 | 0.235 | 0.195 | 0.267 |"
> 出处：2608.18174 §5.5 Alternative remedies, measured（Table 2，Adjacent 行）

> 原文："| Deseason. (pooled idx) | 18 | 9.5% | 0.83 | 0.216 | 0.186 | 0.121 |"
> 出处：2608.18174 §5.5 Alternative remedies, measured（Table 2，Deseason. (pooled idx) 行）

> 原文："Among the arms that flatten the curve, only the aligned label keeps the six-month horizon, at tied-lowest history cost."
> 出处：2608.18174 §5.5 Alternative remedies, measured

> 原文："The aligned label fires on 27–41% of following-year anchors against 6–19% for the adjacent label, whose trailing baseline ratchets down with the decline."
> 出处：2608.18174 §5.4 What the disagreement events actually are

> 原文："Judged without precedence, however, 83% of the production disagreements on which the deseasonalized label is defined are removed by seasonal adjustment alone (70% on M5)."
> 出处：2608.18174 §5.4 What the disagreement events actually are

> 原文："On the production material cohort the adjacent growth label’s anchor-month ratio is 2.1, and 30% of its events lack an aligned counterpart."
> 出处：2608.18174 §5.7 Robustness


### 模型层与决策层

> 原文："ROC-AUC rises from 0.767 to 0.864 for the decay direction and from 0.736 to 0.857 for growth. Precision–recall AUC rises from 0.253 to 0.367 and from 0.430 to 0.743."
> 出处：2608.18174 §5.6 With the model held fixed, relabeling moves holdout skill

> 原文："The caution: the two rows of each pair score different response variables with different prevalences (decay: 5.5% adjacent against 7.0% aligned at training). The comparison therefore does not show one model beating another on a fixed task."
> 出处：2608.18174 §5.6 With the model held fixed, relabeling moves holdout skill

> 原文："Detecting declines in progress, the aligned-trained model reaches ROC 0.78. The adjacent-trained model scores 0.44, below chance, having learned to rank seasonal descent above genuine decline. The calendar features repair nothing (0.44)."
> 出处：2608.18174 §5.6 With the model held fixed, relabeling moves holdout skill

> 原文："Swapping learners under the same labels moved holdout skill insignificantly or negatively. The strongest challenger, the TabPFN tabular foundation model (Hollmann et al., 2025), changed precision–recall AUC by $-0.015$ in both directions."
> 出处：2608.18174 §5.6 With the model held fixed, relabeling moves holdout skill

> 原文："Against its own labels the adjacent-trained model scores 0.96 — a model can look excellent against a defective target."
> 出处：2608.18174 §5.6 With the model held fixed, relabeling moves holdout skill

> 原文："The served action list is the unit of cost: every flagged account consumes account-manager attention."
> 出处：2608.18174 §6 The correction in practice

> 原文："Relabeling shrank the served “shrinking” classification by a third (119 to 79 accounts)."
> 出处：2608.18174 §6 The correction in practice

> 原文："The adjacent list spends 119 intervention units per cycle to reach what the aligned list reaches with 79. That is a saving of 40 units per cycle at any $G$. In net-benefit terms ($Gr-79$ against $Gr-119$) the advantage is those same 40 units at every $r$."
> 出处：2608.18174 §6 The correction in practice

> 原文："At the boundary case $G=79$ this amounts to roughly double the net benefit at $r=2$, 14% more at $r=5$, and 6% more at $r=10$."
> 出处：2608.18174 §6 The correction in practice

> 原文："The aligned baseline needs the outcome window’s calendar months one year back: roughly $12+k$ months of history before an entity’s first label, against $2k$ for the adjacent construction."
> 出处：2608.18174 §6 The correction in practice

> 原文："A currency translation requires per-account margins and intervention costs that are confidential."
> 出处：2608.18174 §6 The correction in practice


### 复现材料与边界

> 原文："Scripts, the pre-specified analysis plan, and timestamped result artifacts sufficient to reproduce every synthetic and public-panel number accompany this preprint as arXiv ancillary files."
> 出处：2608.18174 Data and code availability

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Seasonal-Aligned-Churn-Label`（完整卡：`references/full-card.md`）。

- 论文：2608.18174
- 标题：Seasonal false alarms in customer churn and decline early-warning systems: adjacent-window labels confound seasonality with decline, and a year-over-year correction
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Customer-Churn-Prediction.md, Skill-Uplift-Churn-Prediction.md, Skill-Cohort-Retention-Analysis.md, Skill-Prophet-Forecasting.md, Skill-User-Lifecycle-STAN.md

- 逐字引文：40 条，全部内联于上方「原文引用」段；一条不截断。
