---
name: "p2s-mas-multi-warehouse-replenishment-consensus"
title: "MAS多仓库补货Nash协商 — 多仓库Agent协商最优库存调拨方案"
description: "触发词：Nash协商、多仓Agent、调拨均衡、效用函数、库存协同。何时不用：单次撮合式调拨用「多仓协商调拨」；只算补货量用「自动补货决策」。安全边界：调拨方案须设每仓最低保留库存阈值，避免激进清空引发新的缺货。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-MAS-Multi-Warehouse-Replenishment-Consensus"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "几个仓各自拿着自己的数据谈判，几小时内谈出调拨方案，而不是等中心拍板两天。"
user_try: "试试：美东过剩、美西断货、德国正常，跑一遍三仓 Nash 协商给出调拨量。"
whenToUse: "多仓（含跨境仓）库存不平衡、中心化调配响应慢时用；两个仓之间的小额调拨用「多仓协商调拨」即可。"
workflow: "定义各仓状态（库存、安全库存、日需求、前置期、调拨成本） → 按库存覆盖天数构造效用函数 → 求不协商基准效用并评估调拨增益 → 迭代到 Nash 均衡并输出调拨方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS多仓库补货Nash协商 — 多仓库Agent协商最优库存调拨方案

## ① 解决的问题

供应链团队面临"多仓库存不平衡调配响应慢"——Nash协商将多仓调拨决策从48-72小时→8-12小时，年化节省断货损失+仓储费15-30万元

## ② 核心算法逻辑

多仓库库存管理的核心矛盾：每个仓库都想最大化自己的库存安全（本地最优），但全局最优要求适度不平衡（有仓库多、有仓库少）。中央统筹则信息延迟、无法实时响应。

## ③ 业务应用场景

场景：吸奶器三仓库库存协同（美东/美西/德国）
- 业务问题：吸奶器在美东仓库库存过剩（150%安全库存），美西仓断货（30%），德国仓库正常。中心化调配决策延迟48-72小时，经常错过调仓窗口 - 数据要求：各仓库当前库存、安全库存目标、日均销量、前置期、仓间调拨成本（每件$3-8） - 多Agent设计： - Agent_US_East：持有美东仓数据，目标减少过剩 - Agent_US_West：持有美西仓数据，目标消除缺货风险 - Agent_DE：持有德国仓数据，目标维持安全水位 - 预期产出：24小时内达到Nash协商均衡，输出调拨方案（如：美东→美西调 50件，成本$150） - 业务价值：消除缺货损失（美西1天缺货约$200
**三轨验证**： - **成本**：需搭建Agent框架（约5-8万元一次性开发），各仓库数据接口对接（约2-3万元/仓），每次协商计算资源成本约$5-10（云函数） - **合规**：不涉及Amazon政策违规（调拨为卖家自主操作），不触碰GDPR（仅使用库存/销量聚合数据，无个人数据），不涉及广告法 - **风险**：若调拨方案过于激进（如将美东库存全部清空），可能导致美东突发需求时缺货；建议设置每仓最低保留库存阈值（如安全库存的80%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：美东→美西调拨50件，避免美西缺货损失$2000/天，调拨成本$200，净收益$1800/决策；年化（假设每月2次）约 15-25万元；同时减少美东过剩FBA仓储费约 5-10万元/年
vs 中心化决策：响应速度从48-72小时→8-12小时，信息完整性更高（仓库Agent持有实时数据）
实施难度：⭐⭐⭐⭐☆（需要各仓库数据接口打通，以及Agent框架部署）
优先级：⭐⭐⭐⭐☆（多仓运营的中级场景，库存规模大的品牌优先）
成本：Agent框架部署及数据接口打通约8-11万元一次性投入，每次协商计算成本$5-10，人力维护成本约0.5人月/季度
合规：不涉及Amazon政策违规（调拨为卖家自主操作），不触碰GDPR（仅使用库存/销量聚合数据，无个人数据），不涉及广告法

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class WarehouseState:
    """仓库状态"""
    warehouse_id: str
    current_stock: int
    safety_stock: int
    daily_demand: float
    lead_time_days: int
    transfer_cost_per_unit: float  # 调出成本

class WarehouseAgent:
    """仓库Agent：持有本地信息，参与Nash协商"""
    
    def __init__(self, state: WarehouseState):
        self.state = state
        
    def compute_utility(self, stock_after_transfer: int) -> float:
        """计算调拨后的效用值（库存健康度）"""
        s = self.state
        # 库存覆盖天数
        coverage_days = stock_after_transfer / max(s.daily_demand, 0.1)
        safety_coverage = s.safety_stock / max(s.daily_demand, 0.1)
        
        # 最优覆盖在安全库存的1.5倍处
        optimal_coverage = safety_coverage * 1.5
        
        # 效用函数：覆盖不足惩罚重（缺货），过多惩罚轻（仓储费）
        if coverage_days < safety_coverage:
            # 缺货风险：惩罚系数3x
            utility = -3.0 * (safety_coverage - coverage_days)
        else:
            # 过剩：轻惩罚
            utility = -0.3 * max(coverage_days - optimal_coverage, 0)
        
        return utility
    
    def compute_no_deal_utility(self) -> float:
        """不协商时的基准效用（维持现状）"""
        return self.compute_utility(self.state.current_stock)
    
    def evaluate_transfer(self, send_units: int, receive_units: int) -> Dict:
        """评估调拨方案"""
        net_transfer = receive_units - send_units
        new_stock = self.state.current_stock + net_transfer
        new_stock = max(0, new_stock)
        
        transfer_cost = send_units * self.state.transfer_cost_per_unit
        utility_gain = self.compute_utility(new_stock) - self.compute_no_deal_utility()
        
        return {
            'new_stock': new_stock,
            'utility_gain': utility_gain - transfer_cost * 0.01,  # 成本折算
            'feasible': new_stock >= 0 and send_units <= self.state.current_stock
        }
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.15891，但该号在 arXiv 上是《Labor-based grading practices in the physics classroom》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各仓当前库存、安全库存目标、日均销量、前置期与仓间单位调拨成本（卡页场景为每件 3-8 美元），按仓组织并含仓间成本矩阵。

**输出**：协商均衡下的调拨方案（调出仓、调入仓、件数、成本）、各方效用变化与最低保留库存约束建议，供多仓调拨决策。

## 执行步骤

1. 录入各仓库存、安全库存、日需求与前置期
2. 按覆盖天数构造缺货重罚、过剩轻罚的效用函数
3. 计算不协商基准并评估各调拨方案的效用增益
4. 迭代至 Nash 均衡确定调拨量
5. 输出调拨方案与每仓最低保留库存建议

## 边界与不做

- 数据不满足时不适用：各仓数据接口未打通、只能拿到日汇总库存时，快速达成均衡的前提不成立。
- 能力边界：只产出协商方案，调拨执行、运输与成本结算由人工完成；方案过激（接近清空某仓）时须按保留阈值收敛。

## 技能关联

- **前置**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-MAS-Consensus-Mechanism.html、Skill-MAS-Consensus-Mechanism、Skill-MAS-Dynamic-Pricing-Coalition.html、Skill-MAS-Dynamic-Pricing-Coalition、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-MAS-Dynamic-Pricing-Coalition.html、Skill-MAS-Dynamic-Pricing-Coalition、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **可组合**：Skill-CONCAT-Consensus-Decentralized-MAS.html、Skill-CONCAT-Consensus-Decentralized-MAS、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-MAS-Dynamic-Pricing-Coalition.html、Skill-MAS-Dynamic-Pricing-Coalition、Skill-MAS-Multi-Warehouse-Replenishment-Consensus

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：10-MAS　·　源卡：`Skill-MAS-Multi-Warehouse-Replenishment-Consensus`