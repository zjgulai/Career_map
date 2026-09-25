---
name: "p2s-decision-conditioned-forecasting"
title: "Skill-Decision-Conditioned-Forecasting"
description: "触发词：p2s-decision-conditioned-forecasting。Skill-Decision-Conditioned-Forecasting"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
quality_tier: "curated"
p2s_card_id: "Skill-Decision-Conditioned-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_venue: "KDD 2026"
p2s_venue_tier: "CCF-A"
p2s_evidence_grade: "A"
p2s_paper_id: "2608.25871"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Decision-Conditioned-Forecasting"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Decision-Conditioned-Forecasting.md"
rebase_source_sha256: "37194df1702c6b1f361b7167d823a711e9da797c11b5be7ea835737bcf6321c8"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "37194df1702c6b1f361b7167d823a711e9da797c11b5be7ea835737bcf6321c8"
rebase_full_card_bytes: "53280"
rebase_full_card_lines: "852"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "39"
rebase_evidence_quotes_total: "47"
rebase_evidence_quotes_complete: "false"
---
# Skill-Decision-Conditioned-Forecasting

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Decision-Conditioned-Forecasting`（完整卡：`references/full-card.md`，sha256 `37194df1702c6b1f361b7167d823a711e9da797c11b5be7ea835737bcf6321c8`，53280 字节 / 852 行 / 47 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 39 条（共 47 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill-Decision-Conditioned-Forecasting

> **venue 说明（R3 要求显式标注）**：本文收录于 **KDD 2026**（第 32 届 ACM SIGKDD，
> 2026-08-09–13，济州）会议论文集（论文集 DOI 见 evidence.md），属 CCF-A，无需降级。
> 发表机构署名包含中国科学技术大学、阿里巴巴集团与香港科技大学（广州）。
> 论文用的是 **Alibaba 1688**（国内 B2B 批发平台）的工业数据，**不是跨境场景** ——
> 迁移到贵司时必须按 ①b 与 ② 的边界重新取证，不能直接套用。

---

## ① 算法原理

**核心思想**：常规时序模型回答「接下来会发生什么」，而商家真正要问的是
「**如果我按这个预算排期走，接下来会发生什么**」。论文把后者定义为

（**换底正文在此截断** —— 完整卡正文共 852 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 39 / 全 47 条 —— **其余 8 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 47 条逐字引文。本页按完整卡顺序内联**前 39 条整条引文**（不在引文中间断开）；其余 8 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："merchants need to evaluate sales outcomes under future action sequences such as budget schedules, rather than passively predicting what happens next."
> 出处：2608.25871 Abstract（PDF 第 1 页）

> 原文："what would happen if I follow a particular budget schedule (and other actions) over the next weeks?"
> 出处：2608.25871 §1（PDF 第 1 页）

> 原文："This shifts the goal from passive forecasting to decision-conditioned simulation"
> 出处：2608.25871 §1（PDF 第 1 页）

> 原文："This design suffers from autoregressive inertia and conflates endogenous market evolution with decision-induced transitions, leading to policy-insensitive rollouts and unreliable counterfactual analysis."
> 出处：2608.25871 Abstract（PDF 第 1 页）

> 原文："we propose CEDAR (Controlled and Event-Driven Demand forecasting via Action-aware Residual decomposition), a two-stage framework for robust decision-conditioned simulation"
> 出处：2608.25871 Abstract（PDF 第 1 页）

> 原文："If these exogenous shocks are not separated from action effects, the simulator will misattribute demand changes, leading to erroneous credit assignment and disastrous budget decisions."
> 出处：2608.25871 §1（PDF 第 2 页）

> 原文："which reflects the natural causal structure of merchant operations: historical system states inform merchant decisions, and these decisions subsequently drive state transitions."
> 出处：2608.25871 §3.2 式 (2) 后（PDF 第 3 页）

> 原文："where $f_{\theta}$ captures controllable dynamics and $\epsilon_{t}$ represents latent external perturbations. Stage I models the former, while Stage II estimates the latter."
> 出处：2608.25871 §3.3 式 (5) 后（PDF 第 3 页）

> 原文："The hotspot embedding $\mathbf{h}_{t}$ is then combined with the item status embedding via a cross-attention module, enabling dynamic alignment between external events and product-level temporal patterns."
> 出处：2608.25871 §3.3 Residual Prediction（PDF 第 4 页）

> 原文："For instance, the demand for seasonal items, such as Christmas hats, is unlikely to surge during the Chinese New Year, despite the presence of a significant festival event."
> 出处：2608.25871 §3.4.2（PDF 第 4 页）

> 原文："Consequently, we do not include explicit timestamp embeddings in CEDAR."
> 出处：2608.25871 §3.4.1（PDF 第 4 页）

> 原文："to perform multi-step forecasting, this result is appended to the historical sequence and fed back into the model in an auto-regressive manner, enabling the stable simulation of future product trajectories over an extended horizon."
> 出处：2608.25871 §3.4.3 Inference Phase（PDF 第 4 页）

> 原文："comprising approximately 32 million product trajectories with paired state–action sequences and aligned event signals"
> 出处：2608.25871 Abstract（PDF 第 1 页）

> 原文："This process yields approximately 32 million training samples."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："We segment each trajectory into overlapping windows of 15 consecutive weeks."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："The action vector contains two controllable variables: the 7-day average marketing discount (defined as the ratio between the discounted price and the original price) and the total advertising expenditure during the same period."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："we further incorporate exogenous event signals derived from both on-platform trending search topics and off-platform public hotspots, along with a curated list of 26 major holidays."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："At the finest granularity, the taxonomy contains 8,942 distinct subcategories."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："we reserve the final window of 2025 as the test set and use all preceding windows for training, because random sampling may cause shortcut learning on already observed external shocks."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："we consider two evaluation settings: (i) forecasting the next 10 weeks given the past 5 weeks of observations, and (ii) forecasting the next 5 weeks given the past 10 weeks of observations."
> 出处：2608.25871 §4.1.3（PDF 第 5 页）

> 原文："The hidden dimension of all models is uniformly set to 256."
> 出处：2608.25871 §4.1.3（PDF 第 5 页）

> 原文："we configure the number of attention heads and layers as $n_{\text{head}}=4$ and $n_{\text{layer}}=5$, respectively."
> 出处：2608.25871 §4.1.3（PDF 第 5 页）

> 原文："we adopt the BGE-zh-v1.5 model as our text encoder, with an embedding dimension of 1024."
> 出处：2608.25871 §4.1.3（PDF 第 5 页）

> 原文："at horizon next 5, CEDAR attains an MSE of $0.182$, significantly outperforming the strongest baseline PatchTST $0.424$ and PETFormer $0.434$, corresponding to relative improvements of $57.1\%$ and $58.1\%$, respectively."
> 出处：2608.25871 §4.2（PDF 第 5 页）

> 原文："For the next 10 horizon, CEDAR also achieves the lowest MSE $0.414$ and NMSE $0.189$, consistently outperforming all competing approaches."
> 出处：2608.25871 §4.2（PDF 第 5 页）

> 原文："Similar trends are observed under NMSE, where CEDAR reduces the error to $0.083$, yielding more than $56\%$ improvement over the best baseline."
> 出处：2608.25871 §4.2（PDF 第 5 页）

> 原文："classical TSF models such as Informer suffer from severe performance degradation, with MSE exceeding $30$ at next 10."
> 出处：2608.25871 §4.2（PDF 第 5 页）

> 原文："| Full Model | 0.414 | 0.182 | 0.132 | 0.0603 |"
> 出处：2608.25871 §4.2 表 2（PDF 第 5 页）

> 原文："| w/o AIT Prediction | 0.499 | 0.264 | 0.181 | 0.0697 |"
> 出处：2608.25871 §4.2 表 2（PDF 第 5 页）

> 原文："| Temporal shuffle | 0.527 | 0.274 | 0.194 | 0.0712 |"
> 出处：2608.25871 §4.2 表 2（PDF 第 5 页）

> 原文："baselines that treat actions as exogenous covariates exhibit limited sensitivity to intervention signals"
> 出处：2608.25871 §4.3（PDF 第 6 页）

> 原文："This ability enables stable and realistic multi-step rollouts under dynamically changing action plans, which is critical for budget planning and strategy exploration."
> 出处：2608.25871 §4.3（PDF 第 6 页）

> 原文："This variant performs worse than the aligned-event setting and even degrades relative to AIT-only in next-5 MSE, indicating that CEDAR benefits from temporally meaningful event-demand alignment rather than merely using event embeddings as generic auxiliary features."
> 出处：2608.25871 §4.4（PDF 第 6 页）

> 原文："we observe that incorporating the Residual Correction Module yields a modest improvement in MSE but leads to a substantial reduction in MAE."
> 出处：2608.25871 §4.4（PDF 第 6 页）

> 原文："it differs from our setting because it is organized at the store-family level and lacks merchant actions with explicit budget-planning semantics"
> 出处：2608.25871 §4.5（PDF 第 7 页）

> 原文："Thus, this experiment mainly tests whether the event-aware residual decomposition transfers to a public retail forecasting scenario, rather than fully reproducing our counterfactual budget-planning task."
> 出处：2608.25871 §4.5（PDF 第 7 页）

> 原文："CEDAR reduces MSE from $0.6321$ to $0.5819$ compared with the strongest baseline PETFormer, and also achieves lower MAE and NMSE than both PatchTST and PETFormer."
> 出处：2608.25871 §4.5（PDF 第 7 页）

> 原文："As the largest domestic B2B wholesale platform in China, Alibaba 1688 provides a uniquely rich environment for studying decision-conditioned forecasting and budget planning."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

> 原文："we are actively working toward releasing a partially anonymized version to facilitate future research."
> 出处：2608.25871 §4.1.1（PDF 第 5 页）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Decision-Conditioned-Forecasting`（完整卡：`references/full-card.md`）。

- 论文：2608.25871
- 标题：CEDAR: Controlled and Event-Driven Demand Forecasting via Residual Decomposition
- 发表处：KDD 2026
- venue 档位：CCF-A
- 证据等级：A
- 关联卡：Skill-Time-Series-Forecasting.md, Skill-Temporal-Fusion-Transformer.md, Skill-Marketing-Mix-Modeling.md, Skill-Promotion-Effectiveness.md, Skill-Demand-Forecasting-Supply-Chain.md, Skill-Safety-Stock-Replenishment.md, Skill-ROAS-Budget-Optimization.md

- 逐字引文：47 条，全部内联于上方「原文引用」段；一条不截断。
