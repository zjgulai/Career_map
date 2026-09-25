---
name: "p2s-sql-agent-access-control"
title: "Skill-SQL-Agent-Access-Control"
description: "触发词：p2s-sql-agent-access-control。Skill-SQL-Agent-Access-Control"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-135"
l3_business: "授权审查"
l3_all: "授权审查 / 访问控制"
l1_l2_l3: "独立控制/数据与AI运行/授权审查"
quality_tier: "curated"
p2s_card_id: "Skill-SQL-Agent-Access-Control"
p2s_src_domain: "09-DataAgent-LLM"
p2s_venue: "arXiv preprint"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "A"
p2s_paper_id: "2607.22115"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-SQL-Agent-Access-Control"
rebase_vault_path: "paper2skills-vault/09-DataAgent-LLM/Skill-SQL-Agent-Access-Control.md"
rebase_source_sha256: "a92c9799a60e21b3d0a8927ee1f12384f9846f4a415fd23102b215a521a513cb"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a92c9799a60e21b3d0a8927ee1f12384f9846f4a415fd23102b215a521a513cb"
rebase_full_card_bytes: "56204"
rebase_full_card_lines: "920"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "29"
rebase_evidence_quotes_total: "39"
rebase_evidence_quotes_complete: "false"
---
# Skill-SQL-Agent-Access-Control

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-SQL-Agent-Access-Control`（完整卡：`references/full-card.md`，sha256 `a92c9799a60e21b3d0a8927ee1f12384f9846f4a415fd23102b215a521a513cb`，56204 字节 / 920 行 / 39 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 29 条（共 39 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill Card: RBAC 感知的数据 Agent 上线门禁（越权率 + 过度拒答率双指标）

**与同目录 `Skill-SQL-Agent-Text-to-SQL.md` 的分工（两张卡不重复）**：那张卡解决「怎么把自然语言
问句变成一条跑得对的 SQL」——考核口径是执行准确率。本卡解决「这条 SQL **这个人有没有资格跑**」，
并且给出**两把尺子**：越权率（该拒却答）与过度拒答率（该答却拒）。前者单独看会奖励「一律拒答」的
废策略，后者单独看会放过「什么都答」的越权策略——**两个必须同时读**，这才是数据 Agent 的上线门禁。

---

## ① 算法原理

**核心思想**：把「生成一条跑得对的 SQL」拆成两件事——**能不能答**（权限判定）与**答得对不对**
（SQL 正确性）。给定角色 r 的细粒度策略 Π_r ⊆ 表 × 列 × 操作：gold SQL 行使的权限集 Perm(Y*)

（**换底正文在此截断** —— 完整卡正文共 920 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 29 / 全 39 条 —— **其余 10 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 39 条逐字引文。本页按完整卡顺序内联**前 29 条整条引文**（不在引文中间断开）；其余 10 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："This leads to a potential disconnect between benchmarking results and real-world performance: an LLM with high benchmark scores might perform poorly in an access-controlled environment, by frequently violating RBAC, or rejecting a query $q$ that could be answered with only permitted data in $\mathcal{S}$."
> 出处：2607.22115 §Abstract｜Q1

> 原文："This leaves an overlooked failure mode that we term an RBAC-rejected success, where a generated SQL query is syntactically correct and would be judged correct under unrestricted-access evaluation, yet is rejected at execution time due to RBAC violations."
> 出处：2607.22115 §1.1 Text-to-SQL in the Wild｜Q2

> 原文："Each role $r$ is associated with an access policy $\Pi_{r}\subseteq\mathcal{T}\times\mathcal{C}\times\mathcal{O}$, where $\mathcal{O}$ denotes the set of SQL operations (e.g., SELECT, INSERT, UPDATE, DELETE)."
> 出处：2607.22115 §2.1 Text-to-SQL under RBAC｜Q3

> 原文："A permission $(t,c,o)\in\Pi_{r}$ authorizes role $r$ to apply operation $o$ to column $c$ of table $t$."
> 出处：2607.22115 §2.1 Text-to-SQL under RBAC｜Q4

> 原文："Emitting $\bot$ induces $\hat{y}=\textsf{deny}$; emitting $\hat{Y}$ induces $\hat{y}=\textsf{allow}$, after which $\hat{Y}$ is evaluated along two dimensions: (i) RBAC compliance, by checking whether $\mathrm{Perm}(\hat{Y})\subseteq\Pi_{r}$, and (ii) execution correctness, by comparing its execution result with that of the gold SQL $Y^{\star}$."
> 出处：2607.22115 §2.1 Text-to-SQL under RBAC｜Q5

> 原文："We consider two modes for the schema available: (i) $\Sigma^{\mathrm{full}}$, which describes all information in $\mathcal{S}$; (ii) $\Sigma^{\mathrm{role}}(r)$, which describes only schema elements permitted by $\Pi_{r}$."
> 出处：2607.22115 §2.1 Text-to-SQL under RBAC｜Q6


**B. 两个度量：越权率 / 过度拒答率的定义式与六类结果空间**

> 原文："Violation rate $\downarrow$ is $(|\mathrm{VC}|+|\mathrm{VW}|)/N$, the fraction of all instances for which the ground-truth decision is deny but the system generates SQL. It captures unauthorized query attempts."
> 出处：2607.22115 §4.1 Metric Design｜Q8

> 原文："Over-refusal rate $\downarrow$ is $|\mathrm{OR}|/N$, the fraction of all instances for which the ground-truth decision is allow but the system refuses the query. It captures utility loss from denying legitimate access, but does not by itself create a security concern."
> 出处：2607.22115 §4.1 Metric Design｜Q9

> 原文："AC-F1 is the harmonic mean of the resulting precision and recall, penalizing both excessive violations and excessive refusals."
> 出处：2607.22115 §4.1 Metric Design｜Q10

> 原文："Violation correct (VC). The query was incorrectly generated with execution-correct SQL (RBAC-rejected success). This represents an attempted RBAC violation."
> 出处：2607.22115 §4.1 Metric Design｜Q11

> 原文："Over-refusal (OR). The query was denied despite being authorized, reflecting a security misjudgment and utility loss."
> 出处：2607.22115 §4.1 Metric Design｜Q12

> 原文："To this end, we define Safe Execution Accuracy (Safe-EX) as the fraction of ground-truth allowed instances for which the system returns SQL that is both execution-correct and RBAC-compliant:"
> 出处：2607.22115 §4.1 Metric Design｜Q13

> 原文："These metrics are orthogonal to SQL correctness and focus exclusively on whether the system’s behavior aligns with RBAC policy."
> 出处：2607.22115 §4.1 Metric Design｜Q14


**C. 数据集构造流程：合成 → 自动筛 → 4 位标注员 ≥3/4 通过**

> 原文："We apply this framework to several widely used text-to-SQL benchmarks, resulting in large-scale evaluation resources spanning 53 databases, 399 tables, and 3,353 columns, with a total of 21,502 RBAC-annotated query instances."
> 出处：2607.22115 §1.2 Contributions｜Q15

> 原文："Four annotators with database and access-control expertise first complete a lightweight calibration on held-out cases to align the review criteria."
> 出处：2607.22115 §3.2 Automated Role and Policy Synthesis｜Q16

> 原文："Each configuration receives a binary accept/reject judgment and is accepted only if at least three of the four annotators approve it; otherwise, it is rejected and regenerated using the collected rejection reasons as structured feedback."
> 出处：2607.22115 §3.2 Automated Role and Policy Synthesis｜Q17

> 原文："Note that human validation is performed at the database-level role configuration level (53 in total), not at the expanded role-query instance level."
> 出处：2607.22115 §3.2 Automated Role and Policy Synthesis｜Q18

> 原文："In the final construction, 28 of 53 database-level role configurations passed validation on the first attempt; 16 were accepted after one feedback-guided regeneration round; and 9 were directly revised by annotators. No configuration required more than one regeneration round and the process took 4 working days."
> 出处：2607.22115 §A.3.4 Statistics｜Q19

> 原文："Specifically, we parse $Y^{\star}$ using SQLGlot (Mao, 2023) to deterministically recover the set of referenced base tables and accessed columns, and map $Y^{\star}$ to its CRUD operation type."
> 出处：2607.22115 §3.3 RBAC-Aware Instance Construction｜Q20

> 原文："Each database is assigned 2 or 3 DataOperator roles with overlapping but incomplete access scopes. These roles provide broad schema coverage while still creating non-trivial deny cases for evaluation."
> 出处：2607.22115 §3.2 Automated Role and Policy Synthesis｜Q21

> 原文："| Allow / Deny (%) | 53 / 47 | 35 / 65 | 24 / 76 |"
> 出处：2607.22115 §3.3 Table 2 Role and policy distribution｜Q22


**D. 基线结果：EX 高 ≠ 合规，越权与过度拒答的此消彼长**

> 原文："Under RBAC, AC-F1 varies substantially across models and datasets, with violation rates consistently exceeding over-refusal rates."
> 出处：2607.22115 §5.2 Overall Performance｜Q23

> 原文："For instance, Snowflake-R1-7b, a strong model in terms of EX scores, records a 63.77% violation rate on BIRD, while multiple models on LiveSQLBench retain double-digit violation rate alongside low AC-F1."
> 出处：2607.22115 §5.2 Overall Performance｜Q24

> 原文："This pattern is most pronounced on LiveSQLBench, where Safe-EX increases but AC-F1 declines, indicating that reasoning-oriented post-training prioritizes executable SQL generation under constraints, but weakens refusal alignment at decision time."
> 出处：2607.22115 §5.2 Overall Performance｜Q25

> 原文："For example, Llama3-SQLCoder-8B improves its AC-F1 from 69.7 to 72.8, with Safe-Deny rising from near zero to over $90\%$ and violation rate dropping from $46\%$ to $4\%$."
> 出处：2607.22115 §6.3 Limitations of Heuristic Remedies｜Q26

> 原文："This indicates that the fine-tuned models become biased toward refusal rather than learning generalized RBAC reasoning. Instead of acquiring a generalized understanding of access control, the LLM adopts an ineffective, risk-averse denial strategy."
> 出处：2607.22115 §6.3 Limitations of Heuristic Remedies｜Q27

> 原文："Moreover, Safe-EX drops sharply and Over-Refusal rate increases, while Safe-Deny remains high ($>$70%)."
> 出处：2607.22115 §6.3 Limitations of Heuristic Remedies｜Q28


**E. 失败模式与论文自承局限**

> 原文："In sum, these results indicate that simply restricting schema visibility to role-accessible columns reduces explicit data leakage but does not effectively enforce RBAC policies, as models continue to hallucinate and rarely refuse unauthorized queries."
> 出处：2607.22115 §6.1 Impact of Schema Exposure｜Q29

> 原文："For example, DeepSeek-Coder shows a reduction from 325.0 to 52.6 cases, and GPT-5-mini decreases from 42.8 to 30.4 cases."
> 出处：2607.22115 §6.1 Impact of Schema Exposure｜Q30

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-SQL-Agent-Access-Control`（完整卡：`references/full-card.md`）。

- 论文：2607.22115
- 标题：Benchmarking Text-to-SQL under Role-Based Access Control
- 发表处：arXiv preprint
- venue 档位：preprint
- 证据等级：A
- 关联卡：Skill-SQL-Agent-Text-to-SQL.md, Skill-Data-to-Dashboard-Multi-Agent-Visualization.md, Skill-Root-Cause-Analysis-Agent.md, Skill-DeepAnalyze-Autonomous-Data-Science-Agent.md

- 逐字引文：39 条，全部内联于上方「原文引用」段；一条不截断。
