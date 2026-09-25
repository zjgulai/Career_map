---
name: "p2s-causal-budget-allocation"
title: "Skill-Causal-Budget-Allocation"
description: "触发词：p2s-causal-budget-allocation。Skill-Causal-Budget-Allocation"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
quality_tier: "curated"
p2s_card_id: "Skill-Causal-Budget-Allocation"
p2s_src_domain: "13-广告分析"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.10182"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Causal-Budget-Allocation"
rebase_vault_path: "paper2skills-vault/13-广告分析/Skill-Causal-Budget-Allocation.md"
rebase_source_sha256: "c116dd97cf1c47c1f85d5ec28cb9920d80d4921fee53826ef2bb69e09e70486a"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c116dd97cf1c47c1f85d5ec28cb9920d80d4921fee53826ef2bb69e09e70486a"
rebase_full_card_bytes: "42576"
rebase_full_card_lines: "633"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "31"
rebase_evidence_quotes_total: "38"
rebase_evidence_quotes_complete: "false"
---
# Skill-Causal-Budget-Allocation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Causal-Budget-Allocation`（完整卡：`references/full-card.md`，sha256 `c116dd97cf1c47c1f85d5ec28cb9920d80d4921fee53826ef2bb69e09e70486a`，42576 字节 / 633 行 / 38 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 31 条（共 38 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: 增量优先的约束预算分配（Causal Budget Allocation under Global Constraints）

**与同目录 `Skill-ROAS-Budget-Optimization.md` 的分工（两张卡不重复）**：那张卡解决「给定各渠道的
花费-收入曲线，如何让边际 ROAS 相等」——输入是历史 ROAS，是相关性口径；本卡解决「曲线的输入本身
不可信（平台归因天然高估），且分配必须同时满足广告位容量、独立站承接、现金三类硬约束」——输入是
因果增量，输出是每条约束的**影子价格**。前者是「怎么分」，本卡是「分给谁才算增量、以及到底是什么
在卡脖子」。

---

## ① 算法原理

**核心思想**：把「谁会响应」换成「谁会**因为这次投放才**响应」。用预测响应排序再按启发式分预算，
钱会流向「不投也会买」的人；本方法在全局硬约束下直接最大化因果增量：max Σ τ̃ x，

（**换底正文在此截断** —— 完整卡正文共 633 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 31 / 全 38 条 —— **其余 7 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 38 条逐字引文。本页按完整卡顺序内联**前 31 条整条引文**（不在引文中间断开）；其余 7 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："The end-to-end treatment policy delivered a statistically significant $+7.20\%$ lift in the primary long-term-value metric, demonstrating the feasibility of production-scale causal optimization under business constraints."
> 出处：2608.10182 §Abstract｜Q1

> 原文："Measured against long-term-value metrics over an eight-week period, the treatment arm achieved a statistically significant $+7.20\%$ lift ($p=0.041$, 95% CI: $[0.31\%,14.09\%]$)."
> 出处：2608.10182 §5.5 Results｜Q2

> 原文："The online result therefore measures the system-level impact of the complete production policy, while the offline studies examine individual mechanisms under controlled settings."
> 出处：2608.10182 §5.5 Results｜Q3

> 原文："Members were randomly assigned 50/50 to the two experiment arms."
> 出处：2608.10182 §5.4 Agentic Experimentation｜Q24

> 原文："We also distill production lessons on causal training-data construction and cost and delivery control, which were critical to successful deployment."
> 出处：2608.10182 §Abstract｜Q31

**B. 方法：因果估计 / 探索 / 对偶 LP**

> 原文："Incremental optimization requires estimating user-level treatment effects that quantify the expected lift from a targeting or recommendation action."
> 出处：2608.10182 §2.1 Incremental Modeling｜Q36

> 原文："Two standard assumptions identify $\tau(X)$ from observational data: unconfoundedness, $\{Y(0),Y(1)\}\perp\!\!\!\perp T\mid X$, and overlap, $0<e(X)<1$ for all $X$, where $e(X)=P(T=1\mid X)$ is the propensity score."
> 出处：2608.10182 §2.1 Incremental Modeling｜Q9

> 原文："Thus exploration guarantees positivity conditional on the feasible action."
> 出处：2608.10182 §2.2 Neural Bandit Exploration｜Q10

> 原文："We approximate the posterior over network parameters by a Gaussian centered at the MAP solution $\hat{\theta}_{\mathrm{MAP}}$ via the linearized Laplace approximation (LLA)"
> 出处：2608.10182 §2.2.1 Neural Thompson sampling via Laplace approximation｜Q37

> 原文："In the absence of shared allocation constraints, the resulting policy is equivalent to Thompson sampling: for each user, it selects the feasible action that maximizes the sampled incremental reward."
> 出处：2608.10182 §2.3 Large-scale Allocation with Constraints｜Q33

> 原文："Suppressing the round index, we relax $x_{u,i,t}$ to represent an action probability and solve the resulting large-scale problem using a smoothed dual-decomposition method (Basu et al., 2020)."
> 出处：2608.10182 §2.3.1 Scalability via Dual Decomposition｜Q5

> 原文："The solver then maximizes $g_{\gamma}$ over the $K$-dimensional dual with Nesterov-accelerated ascent, giving per-iteration cost linear in $|\mathcal{U}|\cdot|\mathcal{I}|$ versus $O((|\mathcal{U}||\mathcal{I}|)^{3.5})$ for interior-point methods."
> 出处：2608.10182 §2.3.1 Scalability via Dual Decomposition｜Q6

> 原文："The regularization $\gamma$ is picked as the largest value satisfying $\frac{\gamma\,\hat{x}^{T}\hat{x}}{2\,|c^{T}\hat{x}|}<10^{-3}$, so the ridge perturbation contributes $<0.1\%$ of the objective and the perturbed optimum is practically indistinguishable from the true LP optimum; when $A$ is ill-conditioned across constraint scales, we apply Jacobi row preconditioning."
> 出处：2608.10182 §2.3.1 Scalability via Dual Decomposition｜Q7

> 原文："At production scale, each round contains tens of millions of users and hundreds of items, so its batch has $|\mathcal{U}|\times|\mathcal{I}|$ variables and is intractable for general-purpose solvers."
> 出处：2608.10182 §2.3.1 Scalability via Dual Decomposition｜Q4

> 原文："In steady state, we warm-start the dual from the previous period’s $\lambda^{*}$, which under stable input distributions (KS-tested) achieves over 99% of the current optimum and also serves as an SLA fallback when the solver does not converge in time."
> 出处：2608.10182 §2.3.1 Scalability via Dual Decomposition｜Q8

> 原文："The framework also supports sequential context and multi-outcome, attribute-conditioned scoring through a Transformer encoder and outcome embeddings."
> 出处：2608.10182 §Abstract｜Q32

**C. 离线验证的规模与结果**

> 原文："We utilize the random-policy subset, synthetically mapping the original 34 products that were recommended to $>400$K users to 5 distinct actions that are relevant to the production incrementality use case: recommendation to one of four business lines or no-recommendation."
> 出处：2608.10182 §4.1 Dataset｜Q20

> 原文："The no-recommendation action is a key difference between incremental and non-incremental targeting."
> 出处：2608.10182 §4.1 Dataset｜Q34

> 原文："Finally, we assign a cost of $0.1 to each recommendation/targeting action to capture operational and bidding costs."
> 出处：2608.10182 §4.1 Dataset｜Q21

> 原文："We solve the offline simulation LP with Google OR-Tools, which is tractable at this scale (${\sim}400$K members, 5 actions) and convenient for reproduction; at full production scale we use the dual-decomposition method described in Section 2.3 instead."
> 出处：2608.10182 §4.2 Setup｜Q16

> 原文："We then simulate deployment over $T=200$ rounds using the prediction set as the environment: at each round, each method selects actions for the current batch, observes the realized rewards from its own recommendations, updates its training data accordingly, and incrementally updates the model before the next round."
> 出处：2608.10182 §4.2 Setup｜Q17

> 原文："Figure 2. Average cumulative reward and 95% confidence intervals after 200 rounds of feedback. The confidence intervals are calculated from 30 simulation runs."
> 出处：2608.10182 §4.3.2 Multi-turn evaluation（Figure 2 图注）｜Q18

> 原文："This reflects the short-term cost of exploration in exchange for long-term gains: after roughly 50 model updates, the Bandit Incremental Model begins to outperform both greedy variants."
> 出处：2608.10182 §4.3.2 Multi-turn evaluation｜Q19

> 原文："We tested 8 configurations on a fixed train/validation snapshot, each repeated 5 times with common hyperparameters."
> 出处：2608.10182 §4.4 Ablation Study｜Q15

> 原文："As shown in Table 2, incremental scores lead to higher rewards compared to propensity scores."
> 出处：2608.10182 §4.3.1 Single-turn evaluation｜Q38

> 原文："We also provide the corresponding send volumes in Table 3, where it can be seen that incremental targeting leads to a higher percentage of no-recommendations as the engine is able to identify members likely to convert organically."
> 出处：2608.10182 §4.3.1 Single-turn evaluation｜Q39

> 原文："Removing dense features is neutral or beneficial for uplift AUUC despite reducing outcome AUROC from 0.857 to 0.826 and minimally affecting treatment AUROC."
> 出处：2608.10182 §A.3 Uplift Results｜Q22

**D. 生产落地：数据构造、投递控制、实验脚手架**

> 原文："For each member, production samples $D=R-(W_{C}+W_{T}+W_{D})+U$, where $U\sim\operatorname{Uniform}\{0,\ldots,W_{D}-1\}$, $W_{D}=90$ days, $W_{T}=7$ days, and $W_{C}=30$ days. Thus $D\in[R-127,R-38]$."
> 出处：2608.10182 §5.1 Training-Data Construction for Causal Estimation｜Q11

> 原文："We set $T=1$ when at least one qualifying email send, on-platform impression, or video view occurs in $[D,D+7)$. We set $Y=1$ when the corresponding business-line or product-family conversion occurs in $[D+7,R]$, and $Y=0$ otherwise."
> 出处：2608.10182 §5.1 Training-Data Construction for Causal Estimation｜Q12

> 原文："Randomizing $D$ avoids a last-touch label, captures long-term action effects, and preserves variable-length histories."
> 出处：2608.10182 §5.1 Training-Data Construction for Causal Estimation｜Q35

> 原文："Let $B$ be the committed budget, $S_{t}$ the cumulative realized spend, and $q(t/H)$ the desired cumulative pacing curve over a horizon $H$, with $q(0)=0$ and $q(1)=1$."
> 出处：2608.10182 §5.2 Cost and Delivery Control｜Q14

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Causal-Budget-Allocation`（完整卡：`references/full-card.md`）。

- 论文：2608.10182
- 标题：From Prediction to Incrementality: Causal Optimization for Large-Scale Targeting and Recommendation
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-ROAS-Budget-Optimization.md, Skill-Ad-Attribution-Modeling.md, Skill-Uplift-Modeling.md, Skill-Multi-Armed-Bandit.md, Skill-Marketing-Mix-Modeling.md

- 逐字引文：38 条，全部内联于上方「原文引用」段；一条不截断。
