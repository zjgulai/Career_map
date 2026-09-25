---
name: "p2s-multi-warehouse-allocation-llm"
title: "Skill-Multi-Warehouse-Allocation-LLM"
description: "触发词：p2s-multi-warehouse-allocation-llm。Skill-Multi-Warehouse-Allocation-LLM"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
quality_tier: "curated"
p2s_card_id: "Skill-Multi-Warehouse-Allocation-LLM"
p2s_src_domain: "04-供应链"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2606.29366"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Multi-Warehouse-Allocation-LLM"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Multi-Warehouse-Allocation-LLM.md"
rebase_source_sha256: "c8579e603eea6c609c536e02b3d7f03d32d89abe8d67eface56cd93d3a997710"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c8579e603eea6c609c536e02b3d7f03d32d89abe8d67eface56cd93d3a997710"
rebase_full_card_bytes: "56213"
rebase_full_card_lines: "876"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "29"
rebase_evidence_quotes_total: "41"
rebase_evidence_quotes_complete: "false"
---
# Skill-Multi-Warehouse-Allocation-LLM

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Multi-Warehouse-Allocation-LLM`（完整卡：`references/full-card.md`，sha256 `c8579e603eea6c609c536e02b3d7f03d32d89abe8d67eface56cd93d3a997710`，56213 字节 / 876 行 / 41 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 29 条（共 41 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill-Multi-Warehouse-Allocation-LLM

> **venue 说明（R3 要求显式标注）**：全文首页页眉写着 `Journal: European Journal of Operational Research`
> （见 ⑥ 引用），但 `papers_registry.json` 里该论文的 `venue` 为空、`venue_tier: preprint`，
> 本次核验也**没有**在 EJOR 的正式录用信息中找到它。因此按 R3 一律记为 **arXiv preprint**，
> **不得**当作 EJOR 论文引用；页眉那行只说明作者当时的投稿目标。
>
> **registry 备注的核对结论（重要）**：registry 的 `decision_reason` 写「支持自然语言约束（'优先保 FBA 不断货'）」。
> 全文**从未出现 FBA、跨境、断货（stockout）等字样**（已 grep 全篇确认）。论文自己举的自然语言约束例子是
> Table 6 的 **`Minimum TID requirement` → `Enforce minimum TID`** 与 §4.4 的
> `ratio constraints, lower and upper allocation bounds, case-pack restrictions, group-level service requirements, and cardinality controls`。
> 也就是说：「优先保 FBA 不断货」是**业务侧的转译**，不是论文原话。本卡 ② 用运营原话做业务映射，
> 但在 ⑥ 只引论文自己的措辞，不把业务转译伪装成引文。

（**换底正文在此截断** —— 完整卡正文共 876 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 29 / 全 41 条 —— **其余 12 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 41 条逐字引文。本页按完整卡顺序内联**前 29 条整条引文**（不在引文中间断开）；其余 12 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："Balance-oriented multi-warehouse inventory allocation is a recurring decision problem in large-scale e-commerce supply chains, in which a fixed replenishment quantity is distributed across warehouses to balance post-allocation inventory coverage while accounting for demand forecasts and heterogeneous allocation constraints."
> 出处：2606.29366 Abstract（fulltext.md L16）

> 原文："In practice, allocation requirements are often scenario-dependent and expressed in semi-structured or natural-language form rather than as ready-to-solve operations research (OR) formulations."
> 出处：2606.29366 Abstract（fulltext.md L16）

> 原文："The LLM component generates candidate formulations and executable solver code from textual or semi-structured specifications, while the solver provides verification signals for executability, feasibility, and solution quality."
> 出处：2606.29366 Abstract（fulltext.md L16）

> 原文："Experimental results on 29 production evaluation batches from JD.com show that the best single OR formulation improves allocation accuracy by 3.4 percentage points over the incumbent approach, while the full ORLA framework achieves a 4.5 percentage-point overall improvement and improves allocation accuracy in 26 of the 29 evaluation batches."
> 出处：2606.29366 Abstract（fulltext.md L16）

> 原文："We measure inventory coverage through Target Inventory Days (TID), defined as the ratio between available inventory and forecast demand, and use TID-based balance as the organizing principle of the optimization problem."
> 出处：2606.29366 §1 Introduction（fulltext.md L26）

> 原文："For a given stock keeping unit (SKU), the input consists of: (i) the on-hand inventory $I_{k}\geq 0$ at warehouse $k$, (ii) the forecasted daily demand $D_{k}>0$, and (iii) the total replenishment quantity $R\in\mathbb{Z}_{\geq 0}$ to be allocated across warehouses."
> 出处：2606.29366 §3.1 Problem Setup（fulltext.md L62）

> 原文："The decision is an integer allocation plan $x_{k}\in\mathbb{Z}_{\geq 0}$ for each warehouse $k$, satisfying the conservation constraint $\sum_{k=1}^{n}x_{k}=R$."
> 出处：2606.29366 §3.1 Problem Setup（fulltext.md L64）

> 原文："Based on these notions, the multi-warehouse allocation accuracy (or balance rate) is defined as"
> 出处：2606.29366 §3.1 Problem Setup（fulltext.md L78）

> 原文："In this section, three complementary mixed-integer formulations are developed, and we further enrich these base models through a modular constraint library and a penalty-based relaxation mechanism for instances in which strict allocation constraints render the original formulation infeasible."
> 出处：2606.29366 §4 A Family of OR Formulations（fulltext.md L100）

> 原文："real-world decision instances often involve heterogeneous operational rules, such as ratio constraints, lower and upper allocation bounds, case-pack restrictions, group-level service requirements, and cardinality controls."
> 出处：2606.29366 §4.4 Modular Heterogeneous Constraints（fulltext.md L204）

> 原文："A natural consequence of heterogeneous side constraints is that strict formulations may become infeasible."
> 出处：2606.29366 §4.5 Penalty-Based Relaxation（fulltext.md L294）

> 原文："A key design choice is that the solver serves both as an execution engine and as a correctness filter."
> 出处：2606.29366 §5.1 Problem–Model–Code Representation（fulltext.md L328）

> 原文："The hard-constraint model is solved first. If the solver reports infeasibility, the corresponding relaxation model is activated and re-solved to obtain a feasible allocation plan."
> 出处：2606.29366 §5.1 Problem–Model–Code Representation（fulltext.md L328）

> 原文："Our SFT dataset contains solver-verifiable PMC triples paired with structured prompts, covering the base formulation and 17 real-world constraint extensions."
> 出处：2606.29366 §5.1 Problem–Model–Code Representation（fulltext.md L332）

> 原文："Furthermore, we include targeted negative instances (e.g., non-linear modeling hallucinations, wrong variable types, missing key constraints) alongside positive instances to improve format robustness and error awareness."
> 出处：2606.29366 §5.1 Problem–Model–Code Representation（fulltext.md L332）

> 原文："If the generated code is executable, and its executed allocation matches the ground-truth plan, we label it as a positive sample."
> 出处：2606.29366 §5.1 Problem–Model–Code Representation（fulltext.md L336）

> 原文："Their outputs are then combined through score-aware weighting, and feasibility is restored when aggregation introduces mild violations."
> 出处：2606.29366 §5.2 Learning-Based Formulation-Selection（fulltext.md L340）

> 原文："For LLM training, we fine-tune the Qwen3-8B base model by minimizing the standard token-level cross-entropy loss under teacher forcing, with AdamW (Loshchilov and Hutter, 2019) as the optimizer and NEFTune (Jain et al., 2024) applied during training. The generated MILP problems are solved using SCIP."
> 出处：2606.29366 §6 Computational Evaluation（fulltext.md L358）

> 原文："We build PMC-style SFT data for all 18 formulations reported in Table 2, covering the base MIP formulation and its 17 variants."
> 出处：2606.29366 §6.1 Data Pools for Post-Training（fulltext.md L362）

> 原文："Negative multi-warehouse inventory allocation SFT samples are further constructed by injecting 6 common solver-script error types with approximately uniform frequency across categories."
> 出处：2606.29366 §6.1 Data Pools for Post-Training（fulltext.md L362）

> 原文："In the final mixture, the proportions of multi-warehouse inventory allocation positive samples, multi-warehouse inventory allocation negative samples, and classical MIP samples are 85%, 10%, and 5%, respectively."
> 出处：2606.29366 §6.1 Data Pools for Post-Training（fulltext.md L362）

> 原文："The evaluation is conducted on a held-out test set containing more than 10,000 real-world multi-warehouse allocation instances."
> 出处：2606.29366 §6.2 Code Generation Reliability（fulltext.md L368）

> 原文："| Code Syntax Accuracy | 99.9% | 100% |"
> 出处：2606.29366 §6.2 Code Generation Reliability；表 4 Code Syntax Accuracy 行（fulltext.md L374）

> 原文："| Code Execution Success Rate | 99% | 99.9% |"
> 出处：2606.29366 §6.2 Code Generation Reliability；表 4 Code Execution Success Rate 行（fulltext.md L376）

> 原文："| Code Execution Failure Rate | 1% | 0.1% |"
> 出处：2606.29366 §6.2 Code Generation Reliability；表 4 Code Execution Failure Rate 行（fulltext.md L378）

> 原文："On the held-out test set, the SFT+KTO variant attains 100% code syntax accuracy and reduces the code execution failure rate from 1.0% to 0.1% relative to the SFT-only variant."
> 出处：2606.29366 §6.2 Code Generation Reliability（fulltext.md L380）

> 原文："It is worth noting that these results are obtained under a constrained PMC protocol, where the MILP modeling and solver APIs schema are included during post-training."
> 出处：2606.29366 §6.2 Code Generation Reliability（fulltext.md L380）

> 原文："In this task, each predefined warehouse group is required to receive at least a minimum fraction of the total replenishment quantity."
> 出处：2606.29366 §6.3 Relaxation（fulltext.md L386）

> 原文："A typical conflicting case arises when the groups are disjoint and their required minimum shares satisfy $\eta_{1}+\eta_{2}>1$."
> 出处：2606.29366 §6.3 Relaxation（fulltext.md L386）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Multi-Warehouse-Allocation-LLM`（完整卡：`references/full-card.md`）。

- 论文：2606.29366
- 标题：Solver-Verified Formulation Generation and Selection for Multi-Warehouse Inventory Allocation Using Large Language Models
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-Safety-Stock-Replenishment.md, Skill-Demand-Forecasting-Supply-Chain.md, Skill-Multi-Echelon-Inventory.md, Skill-Two-Echelon-Inventory-DRL.md, Skill-Tool-Description-Audit.md, Skill-SQL-Agent-Text-to-SQL.md

- 逐字引文：41 条，全部内联于上方「原文引用」段；一条不截断。
