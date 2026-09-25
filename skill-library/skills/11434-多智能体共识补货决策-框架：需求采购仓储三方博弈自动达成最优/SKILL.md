---
name: "p2s-llm-sc-multiagent-consensus-replenishment"
title: "LLM多智能体共识补货决策 — InvAgent框架：需求/采购/仓储三方博弈自动达成最优"
description: "触发词：多智能体共识、三方协商补货、拆单策略、MOQ与仓容约束、共识备货。何时不用：单一部门自己算补货量时用「自动补货决策」；跨仓调拨而非一次备货拆单时走「调拨清货建议」。安全边界：共识结果须人工确认后才对外下单，资金上限等敏感约束不得随提示词外传。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-LLM-SC-MultiAgent-Consensus-Replenishment"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "让需求、采购、仓储三方各自把约束摆出来，自动谈到一个能落地的备货与拆单方案。"
user_try: "试试：旺季这款消毒锅需求 5000 件、MOQ 2000、仓容 4000，跑一遍三方共识给出拆单方案。"
whenToUse: "备货决策同时受需求、采购、仓储多方约束、人工周会成本高时用；单方即可决定的补货量不必走共识流程。"
workflow: "输入需求预测与置信区间 → 汇总采购约束与仓储约束 → 各角色 Agent 给出方案并进入调解仲裁 → 输出拆单与总量共识结果及成本估算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM多智能体共识补货决策 — InvAgent框架：需求/采购/仓储三方博弈自动达成最优

## ① 解决的问题

补货决策需要销售/采购/仓储三方周会耗时3天且结果次优——InvAgent三方共识框架将决策时间→1小时自动达成，牛鞭效应降低30%

## ② 核心算法逻辑

核心问题：跨境电商补货决策天然是多方博弈问题——销售端希望备货激进（不能断货）、采购端希望保守（减少资金占用）、仓储端受容量约束（FBA 储存费）。传统方式靠周会人工拉齐，往往耗时 3 天且结果次优。

## ③ 业务应用场景

场景A：旺季前多方共识备货（Q4 黑五/圣诞）
母婴爆款婴儿消毒锅面对 Q4 旺季，三方矛盾突出： - 销售预测需要备货 5000 件（旺季需求放大 3x） - 采购发现供应商 MOQ=2000 件且需提前 60 天下单 - 仓储 FBA 容量限制 + $0.75/件/月储存费使得超过 4000 件不经济
InvAgent 共识流程： 1. DemandAgent 输出：需求 5000，P90 置信区间 [4200, 6800] 2. ProcurementAgent 输出：MOQ=2000，最晚下单日期 10月1日，资金上限 $80K 3. WarehouseAgent 输出：FBA 容量上限 4000，超额储存费估算 $2400/月 4. MediatorAgent 仲裁：建议分两批下单（第一批 3000 件 10/1 到仓，第二批 1500 件 11/15 直发 3PL） 5. 共识结果：总备货 4500 件，拆单策略，总成本最优

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：补货决策时间从 3 天 → 1 小时（↓90%），牛鞭效应降低 30%（减少过量/欠量备货损失），年化节省 5-15 万元；竞品断货机会窗口抓取率从 20% → 80%
实施难度：⭐⭐⭐☆☆（LLM API + 标准 Python，可以 POC 1 天完成）
优先级：⭐⭐⭐⭐⭐（Palantir AIP Action Layer 核心场景，高频高价值决策）
企业AI知识库依赖：中 — 需要历史订单数据库（相似情景检索）+ Action 审计日志

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（300 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/llm_sc_multiagent_consensus_replenishment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-LLM-SC-MultiAgent-Consensus-Replenishment.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import math

@dataclass
class InventoryState:
    """当前库存状态（Object）"""
    sku: str
    current_stock: int
    in_transit: int
    daily_sales_mean: float
    daily_sales_std: float
    reorder_point: int
    lead_time_days: int
    unit_cost: float
    unit_price: float
    storage_cost_per_unit_month: float = 0.75  # FBA 平均储存费

@dataclass  
class ProcurementConstraints:
    """采购约束（Action Parameters）"""
    moq: int
    budget_limit: float
    supplier_lead_time_days: int
    payment_terms_days: int = 30

@dataclass
class WarehouseConstraints:
    """仓储约束（Object Properties）"""
    max_capacity: int
    current_utilization: int
    peak_season_factor: float = 1.5  # 旺季容量收紧系数

@dataclass
class ConsensusResult:
    """共识决策结果（Action Output）"""
    final_order_qty: int
    order_batches: List[Dict]
    total_cost_estimate: float
    stockout_risk_pct: float
    consensus_rounds: int
    rationale: str

class MultiAgentReplenishmentSystem:
    """
    LLM多智能体补货共识框架
    
    角色分工：
    - DemandAgent: 需求预测 + 安全库存计算
    - ProcurementAgent: 采购约束 + 资金优化
    - WarehouseAgent: 容量约束 + 储存成本
    - MediatorAgent: 共识调解 + 最终决策
    """
    
    def __init__(self, llm_func=None):
        self.llm = llm_func or self._mock_llm
        self.consensus_log = []
    
    def _mock_llm(self, prompt: str) -> str:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2407.11384 — InvAgent: A Large Language Model based Multi-Agent System for Inventory Management in Supply Chains
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：库存状态（当前库存、在途、日均销量与标准差、补货点、前置期、单位成本与售价、储存费）、采购约束（MOQ、资金上限、供应商前置期、账期）与仓储约束（容量上限、当前利用率、旺季收紧系数）。

**输出**：共识决策结果：最终备货量、分批明细、总成本估算、缺货风险百分比、协商轮数与理由，供人工确认后下单。

## 执行步骤

1. 需求侧给出预测区间与安全库存
2. 采购侧给出 MOQ、最晚下单日与资金上限
3. 仓储侧给出容量上限与超额储存费
4. 调解角色仲裁并给出拆单方案
5. 输出总量、分批与成本估算供确认

## 边界与不做

- 数据不满足时不适用：拿不到采购 MOQ、资金上限或仓储容量约束时，协商退化为单边拍量。
- 能力边界：只产出共识方案与理由，下单、锁产能与跨部门承诺由人工确认后执行。

## 技能关联

- **前置**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture
- **可组合**：Skill-SC-Causal-DAG-E2E-Attribution.html、Skill-SC-Causal-DAG-E2E-Attribution、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-LLM-SC-MultiAgent-Consensus-Replenishment

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：24-标签工程　·　源卡：`Skill-LLM-SC-MultiAgent-Consensus-Replenishment`