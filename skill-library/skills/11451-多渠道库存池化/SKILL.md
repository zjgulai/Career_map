---
name: "p2s-multi-channel-inventory-pooling"
title: "Multi-Channel Inventory Pooling（多渠道库存池化）"
description: "触发词：库存池化、多渠道调拨、安全库存合并、调拨触发策略、渠道协同。何时不用：需要按渠道优先级分单防超卖时用「全渠道订单编排」；跨境多平台统一调度用「一盘货库存调度」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-052"
l3_business: "调拨清货建议"
l3_all: "调拨清货建议 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/调拨清货建议"
p2s_card_id: "Skill-Multi-Channel-Inventory-Pooling"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把多个渠道的库存看成一个池子，从积压渠道调到缺货渠道，安全库存还能降下来。"
user_try: "试试：Amazon 缺货、独立站积压 800 件，按调拨成本和时效给出调拨方案与池化后的安全库存。"
whenToUse: "同一 SKU 在多渠道销售、渠道间库存割裂造成一边断货一边积压时用；只分订单不调库存用「全渠道订单编排」。"
workflow: "汇总各渠道库存、安全库存与调拨成本时效 → 按预测需求识别缺货渠道与盈余渠道 → 求解调拨量并校验服务水平 → 输出池化后的安全库存与触发策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Channel Inventory Pooling（多渠道库存池化）

## ① 解决的问题

吸奶器在 Amazon FBA 仓缺货（销量超预期），但独立站海外仓还有 200 件积压，TikTok Shop 也在慢速消化——三渠道信息不互通，总库存 800 件却出现"某渠道缺货 + 某渠道积压"

## ② 核心算法逻辑

多个销售渠道（Amazon / 独立站 / TikTok Shop）独立备货会造成总库存冗余——A 渠道缺货的同时 B 渠道积压。库存池化通过调拨中心（transshipment hub）实现跨渠道动态调拨，用 GNN 建模渠道拓扑 + DRL 学习最优调拨策略。

## ③ 业务应用场景

业务问题：某母婴品牌爆款婴儿推车（SKU: STROLLER-X1，售价 $299，成本 $120）在 Amazon FBA 仓缺货（日销从 30 件飙升至 50 件），但独立站海外仓积压 800 件（日销仅 8 件），TikTok Shop 日均 15 件且库存 400 件——三渠道信息不互通，总库存 2000 件却出现"Amazon 断货 3 天 + 独立站积压 800 件"。
数据要求： - 各渠道 6 个月日销量（Amazon: 均值 30，标准差 12；独立站: 均值 8，标准差 3；TikTok: 均值 15，标准差 6） - 库存水位：Amazon 200 件（安全库存 150），独立站 800 件（安全库存 400），TikTok 400 件（安全库存 200） - 调拨成本与时效：Amazon↔独立站 $5/件，2 天；Amazon↔TikTok $8/件，3 天；独立站↔TikTok $6/件，2 天 - GNN 拓扑：3 节点（渠道）+ 1 中心调拨节点（美国西部海外仓）
预期产出： - 池化后总安全库存从 750 件降至 540 件（-28%），同等服务水平（97.5%） - 调拨触发策略：当 Amazon 库存 < 7 天预测需求（350 件）且独立站 > 14 天需求（112 件）时，自动从独立站调拨 150 件至 Amazon - 缺货率从 8% 降至 2.5%（Amazon 缺货天数从 22 天/年降至 7 天/年） - 周转率从 4.2 次/年提升至 5.4 次/年（+28%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：库存持有成本 -28%（$6,720/年）+ 缺货损失 -5.5pp（$39,600/年）- 调拨成本 $8,500/年；年化 45 万元人民币
实施难度：⭐⭐⭐☆☆（3 星）— GNN + DRL 有一定工程复杂度，贪心简化版可快速上线
优先级评分：⭐⭐⭐⭐☆（4 星）— 多渠道场景下 ROI 极高，WF-A P7 核心能力
评估依据：HDPO 论文含完整开源代码（transshipment_backlogged 环境），IBM 论文真实零售链数据验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（117 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/multi_channel_inventory_pooling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Multi-Channel-Inventory-Pooling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multi-Channel Inventory Pooling — GNN + Hindsight Policy Optimization
基于 HDPO (arXiv:2306.11246) 框架的简化实现
"""

import numpy as np
from typing import List, Dict, Tuple


class ChannelInventoryPool:
    """多渠道库存池化管理器"""
    
    def __init__(self, n_channels: int, 
                 transship_cost: np.ndarray,  # (n, n) 调拨成本矩阵
                 lead_times: np.ndarray):      # (n, n) 调拨提前期
        self.n = n_channels
        self.transship_cost = transship_cost
        self.lead_times = lead_times
        self.inventory = np.zeros(n_channels)
    
    def pool_decision(
        self, 
        inventory: np.ndarray,
        demand_forecast: np.ndarray,  # 未来 7 天预测
        holding_cost: float = 1.0,
        shortage_cost: float = 10.0,
    ) -> Dict:
        """
        池化决策：决定是否调拨、调拨多少
        
        简化贪心策略：对每对 (i,j)，
        如果 i 缺货风险高且 j 库存充裕 → 调拨
        """
        n = len(inventory)
        decisions = []
        
        for i in range(n):
            # 渠道 i 的缺货风险
            i_demand_7d = demand_forecast[i].sum()
            i_risk = max(0, i_demand_7d - inventory[i])
            
            if i_risk <= 0:
                continue
            
            # 找最优调拨源
            best_source = -1
            best_profit = -np.inf
            
            for j in range(n):
                if j == i:
                    continue
                j_surplus = inventory[j] - demand_forecast[j].sum()
                
                if j_surplus <= 0:
                    continue
                
                transfer_qty = min(i_risk, j_surplus)
                transfer_cost = transfer_qty * self.transship_cost[j, i]
                saving = transfer_qty * shortage_cost - transfer_cost - \
                         transfer_qty * holding_cost * self.lead_times[j, i]
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2306.11246 — Deep Reinforcement Learning for Inventory Networks: Toward Reliable Policy Optimization

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各渠道 6 个月日销量（含均值与标准差）、库存水位、安全库存、渠道间调拨成本矩阵与调拨时效，按渠道与 SKU 组织。

**输出**：调拨触发策略（触发条件与调拨量）、池化后的总安全库存与服务水平、缺货率与周转率改善预期，供多渠道库存协同决策。

## 执行步骤

1. 汇总各渠道库存、需求分布与调拨成本
2. 计算各渠道缺货风险与可出让盈余
3. 求解调拨量与满足服务水平的库存水位
4. 输出池化后的安全库存与触发阈值
5. 给出缺货率与周转率改善预期

## 边界与不做

- 数据不满足时不适用：各渠道销量与库存数据不互通、或拿不到调拨成本与时效时，池化无从计算。
- 能力边界：只给调拨与安全库存建议，实物调拨、头程运输与平台库存同步由人工或系统执行。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Channel-Inventory-Pooling

---

> 分类：业务运营/供应与履约/调拨清货建议　·　技术族：04-供应链　·　源卡：`Skill-Multi-Channel-Inventory-Pooling`