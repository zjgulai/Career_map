---
name: "p2s-persona-based-ab-simulation"
title: "Skill-Persona-Based-AB-Simulation"
description: "触发词：p2s-persona-based-ab-simulation。Skill-Persona-Based-AB-Simulation"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
quality_tier: "curated"
p2s_card_id: "Skill-Persona-Based-AB-Simulation"
p2s_src_domain: "02-A_B实验"
p2s_venue: "EMNLP 2026 Industry Track"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2609.01038"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Persona-Based-AB-Simulation"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-Persona-Based-AB-Simulation.md"
rebase_source_sha256: "9dca10513cdcbe1c7b91e563b5d10f949314f74954fb643c0a85bb14d88fd725"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "9dca10513cdcbe1c7b91e563b5d10f949314f74954fb643c0a85bb14d88fd725"
rebase_full_card_bytes: "54421"
rebase_full_card_lines: "812"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "29"
rebase_evidence_quotes_total: "41"
rebase_evidence_quotes_complete: "false"
---
# Skill-Persona-Based-AB-Simulation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Persona-Based-AB-Simulation`（完整卡：`references/full-card.md`，sha256 `9dca10513cdcbe1c7b91e563b5d10f949314f74954fb643c0a85bb14d88fd725`，54421 字节 / 812 行 / 41 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 29 条（共 41 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 数据驱动人格 A/B 仿真（Data-Driven Persona-Conditioned A/B Simulation）

**这张卡与其他 A/B 卡的分工**：`Skill-AB-Experimental-Design.md` 回答「实验怎么设计」、
`Skill-Power-Analysis-Sample-Size.md` 回答「要多少流量才跑得动」、
`Skill-AB-Test-Result-Interpretation.md` 回答「跑完了怎么读」。
本卡解决它们前面的一步：**在花掉流量之前，先判断哪个候选方案的方向最有可能是正的**。
它是一条**粗筛**链路 —— 论文自己的定位就是「不能替代真实实验，也不需要替代」（⑥ Q3）。

---

## ① 算法原理

**核心思想**：把「预测 A/B 结果」改写成一道**结构化提问**。先用真实行为数据构造一批人格 agent，
再把控件与实验件**同屏**摆在每个 agent 面前，让它按 1–10 分各打一个分；把逐人格的相对分差聚合成
一个预测分布，**只看它的方向**与真实实验是否一致。


（**换底正文在此截断** —— 完整卡正文共 812 行，本页内联到第 17 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 29 / 全 41 条 —— **其余 12 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 41 条逐字引文。本页按完整卡顺序内联**前 29 条整条引文**（不在引文中间断开）；其余 12 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Online controlled experiments remain the gold standard for validating product changes, yet each test requires sufficient user traffic, engineering effort, and typically weeks of data collection to reach statistical significance (Kohavi et al., 2009). These costs limit how many ideas teams can evaluate."
> 出处：2609.01038 §1 Introduction｜Q1

> 原文："A particularly compelling application is the simulation of online controlled experiments (A/B tests): if persona-conditioned agents can reliably predict whether users prefer a treatment variant over a control, teams could pre-screen design candidates offline—reducing the time, traffic, and experimentation cost (Rieder et al., 2026; Castelo et al., 2026)."
> 出处：2609.01038 §1 Introduction｜Q2

> 原文："With current accuracy levels, the proposed framework cannot fully replace human A/B tests—but it does not need to."
> 出处：2609.01038 §6 Discussion · Potential applications｜Q3

> 原文："A potential application could be a pre-screening tool that filters clearly inferior treatment candidates before they consume traffic and prioritizes the experiments by ranking proposed changes by predicted impact."
> 出处：2609.01038 §6 Discussion · Potential applications｜Q4

### B. 方法：结构化提问 + 配对评分 + 方向聚合

> 原文："We frame A/B test simulation as a structured question task: each persona-conditioned agent is presented with variant screenshots and asked to evaluate them with respect to a target metric."
> 出处：2609.01038 §B.1 Question Design: Designs Description｜Q5

> 原文："We study four formats varying along two axes—isolation vs. comparison (whether the agent sees one variant or both) and binary vs. rating (whether the response is yes/no or a 1–10 score)."
> 出处：2609.01038 §3.3 Question Design｜Q41

> 原文："In independent formats, each variant is shown separately; in pairwise formats, both variants are presented together with order randomized per persona to control positional bias."
> 出处：2609.01038 §3.3 Question Design｜Q6

> 原文："Independent formats perform poorly, suggesting agents struggle to calibrate scores without comparative context."
> 出处：2609.01038 §5.1 Question Design Comparison｜Q7

> 原文："The binary pairwise format achieves strong results on subscription tests but fails on CTR, indicating that optimal design depends on metric type."
> 出处：2609.01038 §5.1 Question Design Comparison｜Q8

> 原文："Pairwise rating is the most effective question format, achieving 0.75 accuracy on CTR and 0.80 on subscription tests. All subsequent experiments use this format."
> 出处：2609.01038 §5.1 Question Design Comparison · Takeaway｜Q9

> 原文："For each A/B test, we collect per-persona $(s_{ref},s_{treat})$ tuples and compute the predicted effect as $\hat{\delta}_{s}=\frac{1}{N}\sum_{i=1}^{N}\frac{s_{treat}^{(i)}-s_{ref}^{(i)}}{s_{ref}^{(i)}}$."
> 出处：2609.01038 §I.5 Score Extraction｜Q10

> 原文："Accuracy (Acc): $\mathbb{I}[(p{-}0.5)(q{-}0.5)>0]$; Sign overlap (SignOv): $1-|p-q|$; Sign Bhattacharyya (SignBC): $(\sqrt{pq}+\sqrt{(1{-}p)(1{-}q)})^{2}$."
> 出处：2609.01038 §3.6 Evaluation Metrics｜Q11

### C. 基准：40 个测试、两类度量

> 原文："On a benchmark of 40 A/B tests spanning two metric types, our best configuration achieves 0.75–0.90 directional accuracy depending on the test metric, demonstrating that data-driven personas are a viable path toward fast, low-cost experiment pre-screening."
> 出处：2609.01038 §Abstract｜Q12

> 原文："We evaluate our framework on a benchmark of 40 A/B tests spanning two metric types—click-through rate (CTR) and subscriptions—and organize experiments around four research questions:"
> 出处：2609.01038 §1 Introduction｜Q13

> 原文："The original candidate set contained over 50 CTR tests and 40 subscription tests; applying these thresholds excluded tests with ambiguous ground truth, yielding the final benchmark of 40 tests (20 per metric)."
> 出处：2609.01038 §4.1 Benchmark Construction｜Q14

> 原文："The benchmark reflects a curated experimental sample and should not be interpreted as representative of any specific platform’s full user base or operational A/B testing infrastructure."
> 出处：2609.01038 §4.1 Benchmark Construction｜Q15

> 原文："The benchmark spans two metric types: click-through rate (engagement) and subscriptions (sign-up intent), evaluated with the same pipeline but different question framing."
> 出处：2609.01038 §4.1 Benchmark Construction｜Q16

### D. 人格数据源与域对齐（registry 的 0.75–0.90 分项来源）

> 原文："We compare two persona pools (both containing 935 personas)."
> 出处：2609.01038 §4.2 Personas Pool Construction｜Q17

> 原文："Among the external persona sources, open e-commerce data performs best and surpasses platform data on subscription tests (0.90 vs. 0.80 accuracy), likely due to domain alignment—e-commerce browsing and purchasing signals are directly relevant to evaluating widget engagement and subscription intent."
> 出处：2609.01038 §5.2 Synthetic vs Data-Driven Personas｜Q18

> 原文："Rotten Tomatoes personas, grounded in entertainment preferences, show reasonable performance on CTR tests (0.65) but degrade on subscription tests (0.60), suggesting that out-of-domain behavioral data provides insufficient signal for metric-specific predictions."
> 出处：2609.01038 §5.2 Synthetic vs Data-Driven Personas｜Q19

> 原文："Survey-based personas perform moderately without excelling on either metric."
> 出处：2609.01038 §5.2 Synthetic vs Data-Driven Personas｜Q20

> 原文："Personas constructed from platform behavioral data achieve competitive results on CTR tests (0.70 accuracy, 0.64 SignOv) and competitive performance on subscription tests."
> 出处：2609.01038 §5.2 Synthetic vs Data-Driven Personas｜Q21

> 原文："Domain alignment is crucial for personas effectiveness. In-domain behavioral data achieves 0.70–0.90 accuracy, while out-of-domain sources drop to 0.57–0.69. Public e-commerce data can rival platform-specific personas."
> 出处：2609.01038 §5.2 Synthetic vs Data-Driven Personas · Takeaway｜Q22

> 原文："Domain alignment matters more than data volume or source exclusivity. Public e-commerce data rivals platform-specific personas (Table 2), lowering adoption barriers. However, below ${\sim}20$ recorded transactions, simulation degrades as the LLM defaults to generic reasoning."
> 出处：2609.01038 §6 Discussion · Data requirements｜Q23

### E. 行为深度 vs 群体多样性、子采样、消融

> 原文："The deep pool significantly outperforms the representative pool on CTR accuracy (0.75 vs. 0.60), while on subscription tests there is no statistically significant difference on any metric (0.80 accuracy for both)."
> 出处：2609.01038 §5.3 Persona Pool Comparison｜Q24

> 原文："We hypothesize that for sparse personas, the LLM lacks sufficient behavioral grounding and defaults to generic reasoning rather than user-specific preferences, explaining the CTR accuracy gap."
> 出处：2609.01038 §5.3 Persona Pool Comparison｜Q25

> 原文："These gaps likely arise from LLM inference biases during persona generation rather than sampling limitations, and represent a primary lever for future improvement."
> 出处：2609.01038 §5.3 Persona Pool Comparison｜Q26

> 原文："Behavioral depth yields a statistically significant advantage on CTR accuracy, but demographic diversity fully compensates on subscription tests (no significant difference on any metric)."
> 出处：2609.01038 §5.3 Persona Pool Comparison · Takeaway｜Q27

> 原文："All subsampling strategies preserve near-full-pool accuracy at 500 personas (within 1pp on CTR, matching or exceeding on subscriptions), potentially enabling up to 2$\times$ cost reduction."
> 出处：2609.01038 §5.4 Population Sampling Efficiency · Takeaway｜Q28

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Persona-Based-AB-Simulation`（完整卡：`references/full-card.md`）。

- 论文：2609.01038
- 标题：Data-Driven Persona-Conditioned Agents for A/B Test Simulation
- 发表处：EMNLP 2026 Industry Track
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-AB-Experimental-Design.md, Skill-Power-Analysis-Sample-Size.md, Skill-AB-Test-Result-Interpretation.md, Skill-Multi-Armed-Bandit.md, Skill-Incrementality-Measurement.md

- 逐字引文：41 条，全部内联于上方「原文引用」段；一条不截断。
