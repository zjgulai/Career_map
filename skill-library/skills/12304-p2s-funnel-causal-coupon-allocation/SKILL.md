---
name: "p2s-funnel-causal-coupon-allocation"
title: "Skill-Funnel-Causal-Coupon-Allocation"
description: "触发词：p2s-funnel-causal-coupon-allocation。Skill-Funnel-Causal-Coupon-Allocation"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 增量分析"
l1_l2_l3: "业务运营/渠道经营/促销规划"
quality_tier: "curated"
p2s_card_id: "Skill-Funnel-Causal-Coupon-Allocation"
p2s_src_domain: "13-广告分析"
p2s_venue: "CIKM 2026"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.11675"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Funnel-Causal-Coupon-Allocation"
rebase_vault_path: "paper2skills-vault/13-广告分析/Skill-Funnel-Causal-Coupon-Allocation.md"
rebase_source_sha256: "f585f533a4d4309e2a37a4de55b4006f9dfb6130a0ceaafe087080ef4c90477f"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "f585f533a4d4309e2a37a4de55b4006f9dfb6130a0ceaafe087080ef4c90477f"
rebase_full_card_bytes: "36596"
rebase_full_card_lines: "606"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "28"
rebase_evidence_quotes_total: "28"
rebase_evidence_quotes_complete: "true"
---
# Skill-Funnel-Causal-Coupon-Allocation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Funnel-Causal-Coupon-Allocation`（完整卡：`references/full-card.md`，sha256 `f585f533a4d4309e2a37a4de55b4006f9dfb6130a0ceaafe087080ef4c90477f`，36596 字节 / 606 行 / 28 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: FunnelCausalNet — 漏斗分解的双目标优惠券 uplift 与预算分配

> 论文：`2608.11675`（CIKM 2026，CCF-B）。本卡正文里的每一个数字都在 ⑥ 段有逐字原文出处；
> 论文没有报告的量级，一律写「论文未报告」，不做任何推算与补全。

## ① 算法原理

**核心思想**：成交额有确定性漏斗结构——没转化就没有 GMV。所以对「零膨胀 + 重尾」的 GMV 直接回归是低效的。
FunnelCausalNet 把 GMV 的条件期望拆成两个共享表征的头：转化概率 μ_conv，与「已转化条件下客单」的期望 μ_val，
按 `μ_gmv = μ_conv · μ_val` 组合（论文 Eq. 5），再把两个头的 CATE 一起送进「按档位分配补贴预算」的分配器。

**数学直觉**：GMV 的方差可精确拆成两块，`Var(Y^g) = p·σ_v² + p(1-p)·μ_v²`：
前一块是「转化者内部的客单波动」，后一块是「零质量带来的伯努利切换方差」。
在「转化头以参数速率收敛、客单头以更慢的非参速率收敛」的速率差假设下，漏斗组合估计与直接非参估计的
点态 MSE 之比趋近 `1 / (1 + (1-p)·μ_v²/σ_v²)`：零质量 (1-p) 越大、客单均值相对其波动越主导，漏斗分解越省方差。
论文自己反复强调这只是**理想化的 regime 指标**，不是普适最优性定理，也不保证 CATE 排序更准。

**关键假设**：① RCT 式随机分配（`T ⊥ (Y^c(·), Y^g(·)) | X` 且倾向得分在 x 处有下界）；
② 漏斗支撑恒成立（`Y^c = 0 ⇒ Y^g = 0`）；③ 两个头的交叉协方差可控——独立样本切分能保证，
**共享表征网络并不保证**；④ 档位是离散 offer，不做连续券剂量的插值。

**配套三件套**：拉格朗日松弛把「谁分到哪一档」解耦成每人独立的内层问题（可扩到百万级用户）；
用 RCT 臂均值做**加性锚定**修正零膨胀下的水平偏差后再喂分配器；
两个目标各出一条 split-conformal 区间再加 Bonferroni 联合，**只当审计/监控带**，不作为分配器输入。

---

## ①b 反例与适用边界

**什么时候不要用这个算法**

（**换底正文在此截断** —— 完整卡正文共 606 行，本页内联到第 31 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 28 条 · 不截断）

> 原文："We propose FunnelCausalNet, an uplift estimator that couples a binary conversion head with a nonnegative conditional-value head under the funnel composition $\mu_{\mathrm{gmv}}=\mu_{\mathrm{conv}}\,\mu_{\mathrm{val}}$."
> 出处：2608.11675 §Abstract

> 原文："We identify $\tau^{c}_{t}$ and $\tau^{g}_{t}$ under randomized $T\mid X$ (RCT) as in standard analyses; we do not claim identification from purely observational logs."
> 出处：2608.11675 §3（Causal targets）

> 原文："$\mathrm{Var}(Y^{g}\mid X{=}x,T{=}t)=p\,\sigma_{v}^{2}+p(1-p)\,\mu_{v}^{2}.$"
> 出处：2608.11675 §4.2（Eq. 7）

> 原文："The first term is the within-converter variance; the second is the Bernoulli switching variance contributed by the zero mass."
> 出处：2608.11675 §4.2（Eq. 7 解读）

> 原文："Within these idealized assumptions, the ratio in (8) is below one whenever $(1{-}p)\mu_{v}^{2}/\sigma_{v}^{2}{>}0$, and shrinks as the zero mass $(1{-}p)$ grows or $\mu_{v}$ dominates $\sigma_{v}$."
> 出处：2608.11675 §4.2（Eq. 8 的 operational regime）

> 原文："Eq. (8) is an idealized pointwise variance comparison, not a universal optimality theorem or a guarantee for CATE ranking."
> 出处：2608.11675 §4.2（Eq. 8 的适用限制）

> 原文："We apply additive shifts estimated from RCT arm-wise averages on a held-in slice before forming rewards fed to the allocator, improving $\Delta\mathrm{ROI}$-style objectives without retraining."
> 出处：2608.11675 §4.4（Anchoring）

**合成数据上的估计质量与漏斗消融（论文最强的方法证据，但不是最强的业务证据）**

> 原文："EFIN attains the highest AUUC_GMV ($0.615$); FunnelCausalNet ranks second ($0.613$, within one seed standard deviation)"
> 出处：2608.11675 §5.2（Table 3）

> 原文："PEHE_CVR is led by DualHeadNet ($0.048$); FunnelCausalNet ($0.058$) remains competitive, confirming that funnel coupling does not destroy conversion-head identifiability."
> 出处：2608.11675 §5.2（Table 3）

> 原文："Hard coupling achieves the lowest PEHE_GMV at $10\mathrm{K}$, $20\mathrm{K}$, and $100\mathrm{K}$ samples, while the funnel-violation rate of A remains at $\gtrsim 60\%$ versus $0\%$ for C."
> 出处：2608.11675 §5.3（Table 4）

> 原文："Funnel composition reduces PEHE_GMV by $18$–$48\%$ across the tested $\hat{p}\in[4.6\%,45.4\%]$ range, with peak benefit at moderate-high zero inflation"
> 出处：2608.11675 §5.3（Table 5）

> 原文："generator parameters (baseline conversion ${\approx}8\%$, eight tiers $0\%$–$14\%$) fall inside operationally common e-commerce coupon ranges"
> 出处：2608.11675 §5.1（Semi-synthetic calibration disclosure）

**预算分配与不确定性层（论文的业务接口）**

> 原文："The anchored-Lagrangian pipeline attains higher $\Delta\mathrm{ROI}$ than random allocation under tight budgets—for example, $3.92$ versus $3.07$ at $B/B_{\mathrm{free}}{=}0.05$—with lower realized cost and competitive incremental GMV."
> 出处：2608.11675 §5.5（Table 7）

> 原文："Joint empirical coverage consistently exceeds nominal $1{-}\alpha$ by 3–15 pp across $\alpha\in\{0.05,0.10,0.20\}$"
> 出处：2608.11675 §5.6（Table 8）

> 原文："recommend wider nominal $\alpha\in[0.10,0.20]$ when widths must remain actionable, and pair intervals with anchored point estimates when feeding optimizers, because marginally valid lower-conformal bounds for $\tau^{g}$ at narrow $\alpha$ can be so pessimistic under zero inflation that budgeted LCB policies collapse to all-control assignments (Sec. 5.5)."
> 出处：2608.11675 §4.3（Deployment stance）

> 原文："Peak F1 reaches $\approx 0.25$ at $\rho_{\mathrm{conf}}{=}0.6$"
> 出处：2608.11675 §5.4（Table 6）

> 原文："Training scales sublinearly between $N{=}10^{4}$ and $10^{6}$ in our sweeps ($\approx 30\,\mathrm{s}\to 324\,\mathrm{s}$, $\sim 10\times$ wall-clock for $100\times$ users). Conformal calibration stays below one second even at $N{=}10^{6}$. Lagrangian dual updates stay near $0.13\,\mathrm{s}$ at one million users for $K{=}8$, whereas dense LP relaxations exceed tens of seconds already at $N{=}10^{5}$ and fail at larger $N$ due to memory."
> 出处：2608.11675 §5.7（Table 10）

**工业多臂 RCT：论文的最强业务证据与其自身保留意见**

> 原文："totaling $\approx 4.98\times 10^{6}$ exposure records from $\approx 2.79\times 10^{6}$ distinct users overall. For each of three permutation seeds we shuffle the full table, take the first $N_{\mathrm{train}}{=}50\mathrm{K}$ records for training, and retain the remaining $\approx 4.93$M exposure records per seed for evaluation."
> 出处：2608.11675 §5.8

> 原文："We treat the platform commission rate $\gamma$ as a sensitivity parameter over $[0.2,0.3]$, a band typical of online travel/coupon programs; the break-even point is $\Delta\mathrm{ROI}\!=\!1/\gamma\!\in\![3.3,5.0]$. Operating below the band ($\Delta\mathrm{ROI}\!<\!3$) means incremental commission no longer offsets subsidy cost"
> 出处：2608.11675 §5.8（Practical operating regime）

> 原文："at mid-to-large anchors ($25\%$–$60\%$) FunnelCausalNet’s mean exceeds the second-best by $0.18$–$0.21$ ROI units."
> 出处：2608.11675 §5.8（Table 11）

> 原文："Per-anchor paired-bootstrap CIs over three permutation seeds include $0$, so individual rows are not formally significant."
> 出处：2608.11675 §5.8（Table 11 caption）

> 原文："on industrial multi-arm RCT logs, FunnelCausalNet has the highest seed-averaged mean LP-frontier $\Delta\mathrm{ROI}$ at all $7/7$ reported anchors, although their correlation and the three permutation splits preclude an independent-anchor significance claim."
> 出处：2608.11675 §7（Conclusion）

**适用边界与可复现性（①b 的依据）**

> 原文："Empirically, revenue-focused rankers RERUM ($0.747$) and DualHeadNet ($0.739$) lead AUUC_GMV on Hillstrom, while all multi-tier funnel-aware deep models (DESCN, ECUP, FunnelCausalNet) underperform."
> 出处：2608.11675 §5.2（Public-RCT scope boundary）

> 原文："All causal interpretations assume RCT-like randomized assignment, not observational identification."
> 出处：2608.11675 §6（Identification scope and limitations）

> 原文："E7 uses record-level permutation splits, so repeated users can appear in both training and hold-out slices"
> 出处：2608.11675 §6（record-level permutation splits）

> 原文："Finally, the observed coupon arms are discrete offers: the model does not exploit smoothness or monotonicity across a continuous coupon dose"
> 出处：2608.11675 §6（discrete offer arms）

> 原文："The current version does not include a public code artifact."
> 出处：2608.11675 §5.9（Reproducibility）

> 原文："quantitative effect sizes, per-bucket exposure ratios, and ablation traces remain unavailable under the platform agreement"
> 出处：2608.11675 §5.8（Online consistency check）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Funnel-Causal-Coupon-Allocation`（完整卡：`references/full-card.md`）。

- 论文：2608.11675
- 标题：FunnelCausalNet: Funnel-aware Joint Conversion-Revenue Uplift for Multi-tier Coupon Allocation
- 发表处：CIKM 2026
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Uplift-Modeling.md, Skill-ROAS-Budget-Optimization.md, Skill-Ad-Attribution-Modeling.md, Skill-Promotion-Effectiveness.md

- 逐字引文：28 条，全部内联于上方「原文引用」段；一条不截断。
