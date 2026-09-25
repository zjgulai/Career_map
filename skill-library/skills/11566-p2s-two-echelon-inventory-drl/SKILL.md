---
name: "p2s-two-echelon-inventory-drl"
title: "Deep RL for Two-Echelon Inventory Optimization"
description: "触发词：双层库存、区域仓备货、跨区调拨、补货策略训练、库存周转提升。何时不用：只想按公式算各级安全库存与再订货点用「补货模拟」，只想按月销给 SKU 分层用「库存分层」；本技能要用强化学习训练生产与调拨策略。安全边界：策略上线前须在仿真中验证并加极端决策监控，模型不直接向 WMS／TMS／ERP 下发指令。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/库存分层"
quality_tier: "curated"
p2s_card_id: "Skill-Two-Echelon-Inventory-DRL"
p2s_src_domain: "04-供应链"
p2s_venue: "AI4M 2023 (ECML PKDD Workshop)"
p2s_venue_tier: "preprint"
p2s_evidence_grade: "C"
p2s_paper_id: "2204.09603"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Two-Echelon-Inventory-DRL"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Two-Echelon-Inventory-DRL.md"
rebase_source_sha256: "3892ec9d6bf8464d973e9f4c752ed0efe0d134346f973cfae5739a5267b31296"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "3892ec9d6bf8464d973e9f4c752ed0efe0d134346f973cfae5739a5267b31296"
rebase_full_card_bytes: "27066"
rebase_full_card_lines: "743"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "654e01526d4b3799f75dcb8f5a5c32628353941c77058ff8659cf77256a14b7f"
user_summary: "让中央仓和几个区域仓一起决定生产多少、货发去哪，用历史需求练出比固定规则更好的补货策略。"
user_try: "试试：深圳中央仓加新加坡、雅加达、曼谷三个区域仓，帮我练一套补货与调拨策略，目标是提升库存周转。"
whenToUse: "有多仓历史需求、在途与成本数据，需要把生产与跨区调拨联合优化时用；按公式算安全库存与触发点用「补货模拟」，只做动销分层用「库存分层」。"
workflow: "整理 日期×仓库×SKU 的库存与需求历史 → 配置两阶仿真环境与提前期、成本参数 → 校准各仓时序需求并训练补货调拨策略 → 与传统补货策略对比 → 输出各仓策略建议与周转改善结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Deep RL for Two-Echelon Inventory Optimization

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`，sha256 `3892ec9d6bf8464d973e9f4c752ed0efe0d134346f973cfae5739a5267b31296`，27066 字节 / 743 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `654e01526d4b3799f75dcb8f5a5c32628353941c77058ff8659cf77256a14b7f`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Deep RL for Two-Echelon Inventory Optimization

> **venue 与证据基础说明（2026-09-13 补 frontmatter 时核验）**
> - **venue 证据在底本之外**：arXiv 元数据 `Comments` 逐字为
>   `The paper has been accepted for presentation and inclusion in the proceedings of the
>   AI for Manufacturing workshop (AI4M), co-located with the ECML PKDD 2023`；
>   另有 Springer Related DOI `10.1007/978-3-031-74640-6_37`。
>   依 `venue-whitelist.md` §3「comment 含 `workshop` → 降级」，故 `venue_tier: workshop`。
>   ⚠️ 本卡底本正文**不含**任何 venue 字样 —— 论文正文不自述 venue 是常态，
>   **venue 声明不得用底本判定**。
> - **`evidence_grade: C`（仅二手描述）**：仓库内**没有**该论文的底本（`papers/04-供应链/` 下无 `2204.09603/`），
>   本卡也没有任何 `> 原文:"..."` 逐字引文 —— 卡内容是对方法的转述，**未经逐字核验**。
>   卡内所有效果/ROI 数字均为**作者估算**，不是论文结论。补底本后应转 `paper-verbatim`。


---

## ① 算法原理

### 核心思想
多级库存优化（Multi-Echelon Inventory Optimization, MEIO）解决的是供应链中多个节点（工厂、仓库、门店）的联合库存决策问题。相比传统的单点库存管理，DRL方法将供应链建模为**马尔可夫决策过程（MDP）**，智能体（Agent）学习在每个时间步决定"生产多少、发往哪里"，以最大化长期累积利润。

两阶段库存（Two-Echelon）是MEIO的基础形式，包含：
- **上游节点**：工厂/中央仓（决定生产量、发货量）
- **下游节点**：区域仓/门店（决定订货量、库存策略）

### 数学直觉
**状态空间 S**：
- 各节点库存水平
- 在途库存（已发货未到达）
- 需求预测（历史需求、季节性、趋势）
- 时间特征（月份、促销周期）

**动作空间 A**：
- 工厂生产量
- 各仓库之间的调拨量
- 订货点/订货量决策

**奖励函数 R**：

**状态转移**：
- 执行动作后，库存水平更新

（**换底正文在此截断** —— 完整卡正文共 743 行，本页内联到第 46 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：按 日期×仓库×SKU 粒度的历史数据：期初库存、在途库存、当日需求、当日满足量、缺货损失、生产成本、持有成本等；另需仿真环境参数——区域仓数量、工厂到仓与仓到客户的提前期、持有／缺货／调拨成本、售价与最大库存容量。

**输出**：各区域仓每个时间步的补货与调拨建议（生产多少、发往哪个仓）、长期累积利润与库存周转率的对比结果，以及需上线监控的极端决策风险提示；供供应链在仿真验证后参考落地到 WMS／TMS／ERP。

## 执行步骤

1. 按 日期×仓库×SKU 整理历史库存、需求、在途、缺货损失与成本数据
2. 配置两阶库存仿真环境：中央仓 → 区域仓 → 消费者，录入各段提前期与成本参数
3. 用历史需求校准各区域仓的需求规模与季节性强度
4. 把生产与调拨决策建模为马尔可夫决策过程，训练智能体最大化长期累积利润
5. 与传统 (s, Q) 策略对比，输出各仓补货与调拨策略及库存周转改善结果
6. 标注上线后需监控的极端决策风险

## 边界与不做

- 数据不满足时不用：缺在途、缺货损失或分仓需求历史的链路无法建仿真环境与校准需求。
- 只输出策略与仿真结论，不直接向 WMS／TMS／ERP 下发生产或调拨指令。
- 卡页 ROI（库存周转提升 25%、年化省 28 万元）为估算口径，落地前须用本店数据重算。

## 技能关联

- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Two-Echelon-Inventory-DRL

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Two-Echelon-Inventory-DRL`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（481 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`）。

- 论文：2204.09603
- 标题：Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
- 发表处：AI4M 2023 (ECML PKDD Workshop)
- venue 档位：preprint
- 证据等级：C
- 证据基础：paper-traceable
- 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Multi-Warehouse-Allocation-LLM.md, Skill-Supply-Network-Simulation.md

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`）。
>
> - 论文：2204.09603
> - 标题：Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
> - 发表处：AI4M 2023 (ECML PKDD Workshop)
> - venue 档位：preprint
> - 证据等级：C
> - 证据基础：paper-traceable
> - 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Multi-Warehouse-Allocation-LLM.md, Skill-Supply-Network-Simulation.md
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2204.09603
> > - 标题：Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
> > - 发表处：AI4M 2023 (ECML PKDD Workshop)
> > - venue 档位：preprint
> > - 证据等级：C
> > - 证据基础：paper-traceable
> > - 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Multi-Warehouse-Allocation-LLM.md, Skill-Supply-Network-Simulation.md
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2204.09603
> > > - 标题：Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
> > > - 发表处：AI4M 2023 (ECML PKDD Workshop)
> > > - venue 档位：preprint
> > > - 证据等级：C
> > > - 证据基础：paper-traceable
> > > - 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Multi-Warehouse-Allocation-LLM.md, Skill-Supply-Network-Simulation.md
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Two-Echelon-Inventory-DRL`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2204.09603
> > > > - 标题：Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
> > > > - 发表处：AI4M 2023 (ECML PKDD Workshop)
> > > > - venue 档位：preprint
> > > > - 证据等级：C
> > > > - 证据基础：paper-traceable
> > > > - 关联卡：Skill-Multi-Echelon-Inventory.md, Skill-Multi-Warehouse-Allocation-LLM.md, Skill-Supply-Network-Simulation.md
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2204.09603 — Comparing Deep Reinforcement Learning Algorithms in Two-Echelon Supply Chains
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
