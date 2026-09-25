---
name: "p2s-supply-network-simulation"
title: "Skill-Supply-Network-Simulation"
description: "触发词：p2s-supply-network-simulation。Skill-Supply-Network-Simulation"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 物流方案"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
quality_tier: "curated"
p2s_card_id: "Skill-Supply-Network-Simulation"
p2s_src_domain: "04-供应链"
p2s_venue: "Winter Simulation Conference 2026"
p2s_venue_tier: "CCF-B"
p2s_evidence_grade: "A"
p2s_paper_id: "2607.09745"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Supply-Network-Simulation"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Supply-Network-Simulation.md"
rebase_source_sha256: "c5c93e8bcbf05998419bab690200f9110e65a617a6692626c512f49cac8f3bba"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c5c93e8bcbf05998419bab690200f9110e65a617a6692626c512f49cac8f3bba"
rebase_full_card_bytes: "55705"
rebase_full_card_lines: "868"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "34"
rebase_evidence_quotes_total: "38"
rebase_evidence_quotes_complete: "false"
---
# Skill-Supply-Network-Simulation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Supply-Network-Simulation`（完整卡：`references/full-card.md`，sha256 `c5c93e8bcbf05998419bab690200f9110e65a617a6692626c512f49cac8f3bba`，55705 字节 / 868 行 / 38 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 34 条（共 38 条）逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill-Supply-Network-Simulation

> **venue 说明（R3 要求显式标注）**：本文是 **Winter Simulation Conference 2026（WSC 2026）** 的录用稿，
> 作者自述为 preprint（原文见 ⑥）。registry 的 `venue_tier` 记作 `second`，本卡按 venue 白名单口径归一化为
> `CCF-B`；registry 的 `note` 写的「有开源实现」经核对**属实**（包名、安装方式、仓库地址与许可证见 ⑥）。
> 本文不是 workshop 短文，也不是 findings——它是 WSC 正会论文，含完整的 Related Work、Architecture、
> Validation、Case Study 与 Conclusions 各节。
>
> **registry 的四项能力断言逐项核对（全部属实，逐字证据见 ⑥）**
>
> | registry 断言 | 核验结论 | 逐字证据所在 |
> |---|---|---|

（**换底正文在此截断** —— 完整卡正文共 868 行，本页内联到第 13 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 34 / 全 38 条 —— **其余 4 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 38 条逐字引文。本页按完整卡顺序内联**前 34 条整条引文**（不在引文中间断开）；其余 4 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文："This is the author’s preprint of a paper accepted at Winter Simulation Conference, 2026."
> 出处：2607.09745 作者信息栏（作者自述）

### 能力声明与网络模型

> 原文："It supports multiple replenishment policies, perishable inventory, node disruptions, and stochastic demand and lead times."
> 出处：2607.09745 §Abstract

> 原文："The graph need not be a tree; an inventory node can be connected to multiple upstream manufacturers or suppliers, with a configurable supplier selection policy to choose among them."
> 出处：2607.09745 §3.1

> 原文："There is a dearth of well-maintained, well-documented open-source libraries specifically targeted for the discrete-event simulation (DES) of arbitrary SC networks."
> 出处：2607.09745 §2

> 原文："The library has been thoroughly validated through comparison with analytical benchmarks, against a commercial simulation tool (AnyLogistix) for unit-tests with deterministic configurations, and against published results from a case study."
> 出处：2607.09745 §1.1

### 易腐库存

> 原文："Perishable inventory is supported with per-unit expiry tracking using a first-in, first-out (FIFO) discipline and waste cost accounting, making the library attractive for use cases such as food SCs, milk distribution networks, cold chains for vaccines, and pharmaceutical SCs."
> 出处：2607.09745 §1.1

> 原文："For perishable inventory, each unit is tagged with its manufacture date and shelf life, and the expired items are removed using a FIFO discipline."
> 出处：2607.09745 §3.1（Inventory 类条目）

> 原文："The pharmacy stocks a perishable drug with a finite shelf life. Expired units are discarded and unmet demand is lost."
> 出处：2607.09745 §5.1（Problem description）

> 原文："The independent replication of this case study’s results confirms that SupplyNetPy correctly models perishable inventory with FIFO expiry, stochastic demand, probabilistic supply disruptions, and the associated cost structure."
> 出处：2607.09745 §5.1（Results）

### 节点中断

> 原文："Supports stochastic disruption modeling via a configurable failure probability (failure_p) and Python callables for disruption duration and recovery time."
> 出处：2607.09745 §3.1（Node 类条目）

> 原文："Nodes are configured with failure probability and callable disruption and recovery durations."
> 出处：2607.09745 §3.3

> 原文："There is no single universally correct scheme for simultaneous-event handling in DES, and both tools behave correctly according to their own documented semantics."
> 出处：2607.09745 §4.2

### 随机需求与提前期、策略与 API

> 原文："Demand arrival times, order quantities, and link lead times are all specified as Python callables, enabling any distribution (Poisson, normal, empirical, or user-defined)."
> 出处：2607.09745 §3.3

> 原文："Attributes include source node, sink node, transportation cost, and lead time (specified as a Python callable for deterministic or stochastic lead times)."
> 出处：2607.09745 §3.1（Link 类条目）

> 原文："When a node has multiple upstream suppliers, a supplier selection strategy determines which supplier fulfills each replenishment order."
> 出处：2607.09745 §3.2

### 安装方式、仓库与发布历史

> 原文："It is installable from the Python Package Index via pip install supplynetpy with detailed documentation, user guides and full examples at https://supplychainsimulation.github.io/SupplyNetPy, and source code on GitHub [8]."
> 出处：2607.09745 §1.1

> 原文："The full model configurations, tested parameter ranges, and numerical results of this validation study are available here: https://github.com/SupplyChainSimulation/SupplyNetPy/tree/main/validation."
> 出处：2607.09745 §4.2

> 原文："K. Lone (2024) SupplyNetPy github repository. Note: https://github.com/SupplyChainSimulation/SupplyNetPy"
> 出处：2607.09745 参考文献 [8]

> 原文："The library was subsequently expanded, improved, and thoroughly validated [10], and was released publicly on GitHub under an MIT license in 2025 as SupplyNetPy."
> 出处：2607.09745 §3.5

> 原文："SupplyNetPy has been under continuous development since 2022."
> 出处：2607.09745 §3.5

> 原文："the development of SupplyNet Web, a web-based GUI for SupplyNetPy, available at https://supply-net-web.vercel.app/."
> 出处：2607.09745 Acknowledgements

### 验证：解析基准

> 原文："We swept $Q$ from 10 to 200, ran 1,000 simulation replications at each value, and verified that the simulated profit curve peaks at $Q\approx 110$, matching the analytical optimum $Q^{*}\approx 110$."
> 出处：2607.09745 §4.1（Newsvendor problem 条目）

> 原文："At this optimum the mean simulated profit is $278.2$ with a 95% CI of $[273.5,282.8]$."
> 出处：2607.09745 §4.1（Newsvendor problem 条目）

> 原文："Over a long horizon (4,000 days), the simulated cost-minimizing lot size was approximately 1,010 units, within 3% of the analytical value."
> 出处：2607.09745 §4.1（Economic Order Quantity 条目）

> 原文："Because the EOQ total-cost curve is very flat near its optimum (the cost penalty at 1,010 versus 980 units is under 0.1%), this agreement validates the (R, Q) replenishment policy implementation and cost tracking."
> 出处：2607.09745 §4.1（Economic Order Quantity 条目）

> 原文："Over 100 simulation replications, the estimated safety stock level was 1,346.8 units (95% CI $[1{,}335.9,1{,}357.6]$), the average inventory level was 6,311.7 units (95% CI $[6{,}303.1,6{,}320.4]$), and the average order flow time was 13.81 days (95% CI $[13.79,13.83]$)."
> 出处：2607.09745 §4.1（Safety stock estimation 条目）

> 原文："The simulated safety stock and average inventory lie above their analytical values of 1,000 and 6,000 units, whereas the flow time lies below its analytical value of 2.4 weeks (16.8 days). These expected deviations arise because resampling negative demand realizations (an artifact of the normal approximation) makes the effective demand higher than the nominal normal demand assumed analytically, pushing the two inventory measures above and the flow time below their respective analytical values."
> 出处：2607.09745 §4.1（Safety stock estimation 条目）

### 验证：商业工具逐组件比对

> 原文："For most deterministic model configurations (non-stochastic demand and constant lead times), SupplyNetPy and AnyLogistix produced identical results across all tracked metrics for both single-echelon and two-echelon configurations over long simulations."
> 出处：2607.09745 §4.2（Results Summary）

> 原文："We found a few pathological configurations where results differed even though both models were deterministic and the implementation was correct."
> 出处：2607.09745 §4.2

> 原文："Each tool resolves such ties deterministically but differently: SupplyNetPy uses an event ID assigned at event creation time, whereas AnyLogistix uses the order in which processes register events."
> 出处：2607.09745 §4.2（A）

### 验证：已发表案例研究复现

> 原文："An exhaustive grid search over $(s,S)$ was performed, running 1,000 replications per parameter combination (chosen based on a convergence analysis of the standard error on mean daily cost)."
> 出处：2607.09745 §5.1（Implementation in SupplyNetPy 段）

> 原文："Further, the optimal region identified by SupplyNetPy is consistent with the original study."
> 出处：2607.09745 §5.1（Results 段）

### 性能

> 原文："Execution time grows linearly with simulation length, with tight median confidence intervals throughout."
> 出处：2607.09745 §5.2

> 原文："Scaling with $N$ is close to linear, and the per-event cost grows only gradually as $N$ increases, so SupplyNetPy introduces no super-linear overhead from component management or statistics collection."
> 出处：2607.09745 §5.2

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Supply-Network-Simulation`（完整卡：`references/full-card.md`）。

- 论文：2607.09745
- 标题：SupplyNetPy: An Open-Source Python Library for High-Fidelity Modeling and Simulation of Arbitrary Supply Chain and Inventory Networks
- 发表处：Winter Simulation Conference 2026
- venue 档位：CCF-B
- 证据等级：A
- 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Safety-Stock-Replenishment.md, Skill-Demand-Forecasting-Supply-Chain.md, Skill-Two-Echelon-Inventory-DRL.md, Skill-Time-Series-Forecasting.md

- 逐字引文：38 条，全部内联于上方「原文引用」段；一条不截断。
