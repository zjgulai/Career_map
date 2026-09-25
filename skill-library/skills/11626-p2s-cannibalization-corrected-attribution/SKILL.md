---
name: "p2s-cannibalization-corrected-attribution"
title: "Skill-Cannibalization-Corrected-Attribution"
description: "触发词：p2s-cannibalization-corrected-attribution。Skill-Cannibalization-Corrected-Attribution"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
quality_tier: "curated"
p2s_card_id: "Skill-Cannibalization-Corrected-Attribution"
p2s_src_domain: "13-广告分析"
p2s_venue: "ADKDD 2026"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2606.26690"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Cannibalization-Corrected-Attribution"
rebase_vault_path: "paper2skills-vault/13-广告分析/Skill-Cannibalization-Corrected-Attribution.md"
rebase_source_sha256: "240fac4a089e28caa0ba1eeffcb271762f3884ff8844e93241e1ed1d7fad0b15"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "240fac4a089e28caa0ba1eeffcb271762f3884ff8844e93241e1ed1d7fad0b15"
rebase_full_card_bytes: "32894"
rebase_full_card_lines: "589"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "18"
rebase_evidence_quotes_total: "18"
rebase_evidence_quotes_complete: "true"
---
# Skill-Cannibalization-Corrected-Attribution

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Cannibalization-Corrected-Attribution`（完整卡：`references/full-card.md`，sha256 `240fac4a089e28caa0ba1eeffcb271762f3884ff8844e93241e1ed1d7fad0b15`，32894 字节 / 589 行 / 18 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill-Cannibalization-Corrected-Attribution

> **venue 说明（R3 要求显式标注）**：本文发表于 **ADKDD 2026**（KDD 的 workshop，2026-08-10 于济州），
> **不是 KDD 主会**。之所以仍纳入萃取：它同时给出了完整方法（§3）、离线前向验证（§4，
> 覆盖多个市场的多轮渠道级增量实验）与生产上线结果（§5），并非 workshop 短文或 demo。
> 但按 `venue-whitelist.md` 的层级规则，不应被当作 CCF-A 证据引用。

---

## ① 算法原理

**核心思想**：生产归因（last-touch / DDA）擅长「及时、细粒度」，但它是**观测**的，会把本来就会发生的
自然成交记在付费头上；增量实验能识别反事实增量，却**稀疏、延迟、贵**。本文不替换归因，而是把
实验当作**因果标尺**去校正归因。

**数学直觉**：设名义付费归因量 $A_t$、真实增量 $Lift_t$，则

- 蚕食率 $C_t = 1 - Lift_t / A_t$ —— 「记在我头上但不是我带来的」占比
- 校正后增量归因 $\hat{I}_t = A_t(1-\hat{C}_t)$

$C_t$ 在生产中**不可直接观测**，只能靠实验锚定。框架分两层：
**ETDC** 用稀疏的渠道-窗口实验读数训练 $f(\phi_{c,t})\to\widehat{Lift}$（$\phi$ 由自然基线代理、时间结构、
投放/渠道状态三块组成），把实验的因果**尺度**外推到日粒度；
**HCA** 再把已标定的蚕食总量按业务层级往下分摊，只保证聚合一致与可行性，
**不重新估计细粒度因果效应**。

**关键假设**：① 有可用的增量实验作锚点；② 代理变量与自然需求稳定相关、且不机械响应短期投放开关。

---

## ①b 反例与适用边界

**什么时候不要用**：

- **一期增量实验都没有**。ETDC 的因果尺度完全来自实验；没有实验就只能得到未标定的归因，
  此时本框架退化为「无锚可校」，**不要声称得到了增量口径的数字**。
- **需要单位级（某个 ASIN × 某个广告位）的因果结论**。HCA 的输出是**分摊**，不是识别。

**已知的失败模式**：

- 代理变量被投放动作污染（例如用「站内搜索量」当自然基线，但品牌词广告会直接抬高它），
  会让校正层把付费效果又学回去。
- 标定集过小 + 特征过多会过拟合。本模板实测：早期版本放了 7 个星期哑变量使参数数超过标定样本数，
  估计蚕食率明显偏离；补上渠道交互项、去掉近共线的二次项后收敛。
- 大促/新品上市会破坏代理变量的外生性，需要重新标定。

**论文自己承认的局限**（§6，原文引用见 ⑥）：

- 框架依赖实验的质量与覆盖：实验稀疏、置信区间宽、处置隔离不彻底、前拉效应（pull-forward）未解决，
  都会把不确定性传导进标定层。
- 代理外推要求「相关性可监控 + 近似外生」，而新品发布、季节性、市场冲击、获客渠道迁移都会削弱它。
- 细粒度输出应被理解为**受标定总量约束的运营分摊**，而非独立识别出的单位级因果效应。
- 负蚕食、自然外溢与渠道互补只被当作**诊断信号**，并未被完整建模。

---

## ② 母婴出海应用案例

### 场景一：站内品牌词广告「抢」自然品牌搜索的功劳

- **业务问题**：平台店铺（Amazon）的 SP 品牌词广告报表显示高 ROAS，同期自然搜索订单占比却在下滑。
  典型争功链路是：用户先在站外被种草（TikTok / 小红书），回到 Amazon **直接搜品牌词**，
  最后点了品牌词广告成交 —— 这笔单被记成「品牌词广告的功劳」，而它本来就会发生。
  每月做预算再分配时，这类虚高会让预算持续流向「收割既有需求」的广告位，而不是创造新需求的位置。
- **数据要求**：
  - **归因侧**：渠道 × 日粒度的名义付费归因转化量 $A_{c,t}$（Amazon 广告报表 / 独立站 GA4 均可导出），

（**换底正文在此截断** —— 完整卡正文共 589 行，本页内联到第 67 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 18 条 · 不截断）

> 原文："We refer to this gap between credited conversions and causal incremental conversions as the attribution–cannibalization mismatch"
> 出处：2606.26690 §1（PDF 第 1 页）

> 原文："Production attribution is timely, granular, and continuously available, but observational by construction."
> 出处：2606.26690 §1（PDF 第 1 页）

> 原文："we define the cannibalization rate as the fraction of nominal paid-attributed conversions that is not truly incremental"
> 出处：2606.26690 §3.1 式 (2) 前（PDF 第 3 页）

> 原文："In deployment, we use a generalized linear model for robustness and operational simplicity."
> 出处：2606.26690 §3.4（PDF 第 4 页）

> 原文："as Huber loss to reduce the influence of extreme daily experimental points that remain after input filtering"
> 出处：2606.26690 §3.4（PDF 第 4 页）

> 原文："Negative cannibalization estimates are treated as diagnostic signals for potential organic spillover, channel complementarity, or missing attribution touchpoints"
> 出处：2606.26690 §3.4（PDF 第 4 页）

> 原文："producing actionable fine-grained corrections while satisfying three operational constraints: aggregate consistency, feasibility, and locality"
> 出处：2606.26690 §3.5（PDF 第 5 页）

> 原文："the same experiment is not used both for calibration and evaluation within the same model version"
> 出处：2606.26690 §4.1（PDF 第 5 页）

> 原文："This section summarizes the overall performance across 18 rounds of channel-level A/B incrementality experiments, covering up to eight markets."
> 出处：2606.26690 §4.2（PDF 第 5 页）

> 原文："Device ML reduces normalized calibration error by 69.11% relative to Raw Attribution, but its signed-error distribution remains relatively wide across experiment slices."
> 出处：2606.26690 §4.2（PDF 第 5 页）

> 原文："ETDC+HCA achieves the best overall calibration, reducing normalized calibration error by 91.38%, with median signed error close to zero and a narrower interquartile range."
> 出处：2606.26690 §4.2（PDF 第 5 页）

> 原文："| ETDC+HCA | 0.09 | 91.38% | 0.60% | [-8.11%, 7.24%] |"
> 出处：2606.26690 §4.2 表 1（ETDC+HCA 行；PDF 第 5 页）

> 原文："Raw Attribution consistently overestimates incremental contribution in these slices, with signed relative errors ranging from 179% to 334%."
> 出处：2606.26690 §4.3（PDF 第 6 页）

> 原文："In contrast, ETDC+HCA stays close to experimental lift across all reported slices, with signed relative errors ranging from -7% to 10%."
> 出处：2606.26690 §4.3（PDF 第 6 页）

> 原文："the measured overall cannibalization rate subsequently decreased by approximately 15 percentage points"
> 出处：2606.26690 §5（PDF 第 6 页）

> 原文："The framework depends on the quality and coverage of incrementality experiments. Sparse experiments, wide confidence intervals, incomplete treatment isolation, or unresolved pull-forward effects can propagate uncertainty into calibration."
> 出处：2606.26690 §6 Limitations（PDF 第 6 页）

> 原文："Proxy-based extrapolation also requires monitored relevance and approximate exogeneity; product launches, seasonality, market shocks, or acquisition-channel shifts may weaken these assumptions and require recalibration."
> 出处：2606.26690 §6 Limitations（PDF 第 6 页）

> 原文："fine-grained outputs should be interpreted as calibrated allocations rather than independently identified unit-level causal effects"
> 出处：2606.26690 §6 Limitations（PDF 第 6 页）

---

## 附：证据链与核验方式

- **全文底本**：`paper2skills-vault/papers/13-广告分析/p2s-2026-0001/fulltext.md`
  （由 `paper2skills-research/scripts/fetch_fulltext.py` 从 arXiv LaTeXML HTML 转换，保留章节号）
- **引文逐字核验**：`python3 paper2skills-skills/paper-审核/scripts/quote_check.py --card <本卡>`
  —— 每条 ⑥ 引用块都会回查全文底本，报告 `VERBATIM` / `FUZZY` / `FABRICATED`
- **K1 代码可执行**：`python3 paper2skills-skills/paper-萃取/scripts/verify_skill_code.py --card <本卡>`
- **K2 门禁**：`python3 paper2skills-skills/paper-审核/scripts/gate_check.py --card <本卡>`
- **本地可复现数字的约定**：论文事实数字一律进 ⑥ 引用块；本模板运行输出与按贵司参数代入的算式
  放进代码/输出围栏并标注「可复现」——围栏内的数字是**可自行验证**的，不冒充论文结论。

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Cannibalization-Corrected-Attribution`（完整卡：`references/full-card.md`）。

- 论文：2606.26690
- 标题：Attributed, But Not Incremental: Cannibalization-Corrected Attribution for Large-Scale Advertising
- 发表处：ADKDD 2026
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Ad-Attribution-Modeling.md, Skill-ROAS-Budget-Optimization.md, Skill-DiD-Difference-in-Differences.md, Skill-Power-Analysis-Sample-Size.md, Skill-Marketing-Mix-Modeling.md

- 逐字引文：18 条，全部内联于上方「原文引用」段；一条不截断。
