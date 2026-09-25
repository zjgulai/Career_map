---
name: "p2s-supply-chain-network-design"
title: "跨境供应链网络设计 — P-Median 选址 + MIP 库存分配优化"
description: "触发词：海外仓选址、多仓布局、备货分配、总成本测算、时效约束。何时不用：要出具体调拨清货动作清单用「调拨清货建议」，要评估已建仓库的搬迁用 PPO-swap 类选址技能；本技能从零决定在哪建仓、每仓备多少货。安全边界：选址与备货结论须与实际仓储报价、租约和关税政策复核，模型不直接签约建仓或改动库存。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Supply-Chain-Network-Design"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "从零规划海外仓布局：选哪几个城市建仓、每个仓备多少货，让头程、仓储和关税总成本最低且时效达标。"
user_try: "试试：美国站现在只用 FBA，我想在 NJ、TX、CA 里选一个自营海外仓，帮我算算选哪个、备多少货最省。"
whenToUse: "已有 12 个月订单分布、候选仓报价与运输费率矩阵，要从零决定仓网布局与备货量时用；要出调拨清货动作清单用「调拨清货建议」，要评估单仓搬迁用 PPO-swap 类技能。"
workflow: "整理需求点分布、候选仓成本与运输成本矩阵 → 贪心逐个加入使总加权运输成本下降最多的仓，直到选满 p 个 → 用局部搜索微调已选仓组合 → 对比各方案的运输、仓储与关税总成本及配送时效 → 输出推荐仓组合、需求覆盖比例与备货量建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨境供应链网络设计 — P-Median 选址 + MIP 库存分配优化

## ① 解决的问题

供应链规划师面临"海外仓选址靠直觉不知道哪个城市组合总成本最低"——P-Median+MIP选址优化将头程+仓储+关税总成本降低18%，年化节省物流成本$23万

## ② 核心算法逻辑

核心思想：将「在哪里建海外仓、在每个仓备多少货」建模为 PMedian 设施选址问题，目标是最小化总物流成本（运输成本 + 仓储成本 + 关税）同时满足配送时效约束，通过贪心启发式 + 局部搜索求解大规模实例。

## ③ 业务应用场景

场景A：美国 FBA + 独立海外仓选址优化
- 业务问题：目前只用 FBA，FBA 超重货物附加费极高（吸奶器 2kg/单，附加费 $4.5/单）；考虑在 NJ/TX/CA 三地选一个自营海外仓分担部分订单，但不知道应该选哪个，备多少货 - 数据要求：历史订单数据（收货地址、重量、金额，12 个月），候选仓地址（NJ/TX/CA）的仓储报价，快递费率矩阵 - 预期产出：P-Median 分析建议选 TX（达拉斯）：覆盖中南部 42% 需求量，FBA + TX 海外仓组合使平均履约成本从 $6.2 → $4.8，年化节省约 $42 万元（≈290 万元） - 业务价值：履约成本降低 22.6%，同时平均配送时效从 4.2 天 → 2.8 
- 业务问题：欧洲站销量增长，目前只在德国一个 FBA 仓，法国/西班牙/意大利配送时效 7-10 天，导致法国差评率（物流慢）高达 18%；考虑在法/波兰增加仓库 - 数据要求：欧洲 6 国订单分布（需求密度图）、德/法/波兰候选仓储报价、欧盟内陆运输费率 - 预期产出：最优方案：德国 + 波兰 2 仓布局（法国通过波兰仓配送反而更优），法国配送时效从 8 天 → 4 天，差评率从 18% → 9%，总物流成本节省 15% - 业务价值：差评率下降 9pp → BSR 改善 → 年化 GMV 增量约 30 万元；物流成本节省约 15 万元。总年化约 45 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：美国双仓布局节省履约成本约 42 万元/年（22.6%↓）；配送时效改善降差评带来 GMV 约 15 万元；欧洲双仓方案节省 15 万元 + GMV 30 万元。综合年化约 102 万元
实施难度：⭐⭐⭐⭐☆（P-Median + 局部搜索实现较复杂；真正落地需要仓储成本谈判数据、实际运费矩阵；大规模（n>50 仓）需改用商业 MIP 求解器如 CBC/Gurobi）
优先级：⭐⭐⭐⭐⭐（月销 3000 单以上的品牌必须考虑多仓布局；FBA 附加费每年上涨，自营仓 ROI 空间快速扩大）
评估依据：P-Median 是设施选址的经典算法（Daskin 1995），已被沃尔玛、亚马逊大规模应用；贪心+局部搜索在实践中可达最优解的 95%+，计算速度比 MIP 快 100×

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（221 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/supply_chain_network_design` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supply-Chain-Network-Design.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
跨境供应链网络设计
P-Median 选址 + Newsvendor 库存分配
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from scipy.stats import norm
from scipy.optimize import linprog


class SupplyChainNetworkDesigner:
    """
    跨境供应链网络设计器
    支持：P-Median 选址 + 库存分配优化
    """

    def __init__(
        self,
        demand_points: List[Dict],    # [{"name": ..., "demand": ..., "lat": ..., "lon": ...}]
        candidate_warehouses: List[Dict],  # [{"name": ..., "fixed_cost": ..., "capacity": ..., "storage_rate": ...}]
        transport_cost_matrix: np.ndarray,  # (n_warehouses, n_demand_points) 单位运输成本
        p: int = 2,                  # 最多选 p 个仓库
    ):
        self.demand_points = demand_points
        self.warehouses = candidate_warehouses
        self.cost_matrix = transport_cost_matrix
        self.p = p
        self.n_warehouses = len(candidate_warehouses)
        self.n_demand = len(demand_points)

    def p_median_greedy(self) -> Tuple[List[int], float]:
        """
        P-Median 贪心求解
        返回：选中仓库索引列表、总加权运输成本
        """
        demands = np.array([d["demand"] for d in self.demand_points])
        selected = []
        remaining = list(range(self.n_warehouses))

        # 贪心：每次选择加入后使总成本降低最多的仓库
        for _ in range(min(self.p, self.n_warehouses)):
            best_warehouse = None
            best_cost = float("inf")

            for j in remaining:
                candidate = selected + [j]
                # 每个需求点分配给最近的候选仓
                cost = self._assignment_cost(candidate, demands)
                if cost < best_cost:
                    best_cost = cost
                    best_warehouse = j

            if best_warehouse is not None:
                selected.append(best_warehouse)
                remaining.remove(best_warehouse)

        final_cost = self._assignment_cost(selected, demands)
        return selected, final_cost

    def _assignment_cost(self, warehouse_indices: List[int], demands: np.ndarray) -> float:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09821，但该号在 arXiv 上是《Fragility, Robustness and Antifragility in Deep Learning》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需求点数据（名称、需求量、经纬度）、候选仓数据（名称、固定成本、容量、仓储费率）、候选仓乘以需求点的单位运输成本矩阵、最多选仓数 p；美国场景还需 12 个月历史订单的收货地址、重量与金额，以及快递费率矩阵。

**输出**：输出选中的仓组合与总加权运输成本、各需求点的仓库分配方案、各仓备货量建议，以及与现状对比的履约成本与平均配送时效变化；供供应链规划与仓网投资决策使用。

## 执行步骤

1. 按每个需求点分配给最近仓的规则定义总加权运输成本
2. 贪心逐个加入使总成本下降最多的候选仓，直到选满 p 个
3. 用局部搜索微调已选仓组合，逼近更优解
4. 对比各方案的头程、仓储与关税总成本及平均配送时效
5. 输出推荐仓组合、需求覆盖比例与各仓备货量建议
6. 标注须与仓储方谈判确认的报价项

## 边界与不做

- 数据不满足时不用：缺候选仓报价或运输成本矩阵无法建模；结论基于 12 个月历史订单，季节性剧变时会失真。
- 只给选址与备货建议，不直接签约建仓、不改动库存；贪心加局部搜索约达最优解的 95%，候选仓超过 50 个需改用商业 MIP 求解器。
- 卡页年化收益（美国双仓节省履约成本约 42 万元、欧洲双仓方案约 45 万元、综合年化约 102 万元）为案例口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Causal-Supply-Chain-Attribution.html、Skill-Causal-Supply-Chain-Attribution、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-NEO_LRP.html、Skill-NEO_LRP、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-NEO_LRP.html、Skill-NEO_LRP、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-NEO_LRP.html、Skill-NEO_LRP、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supply-Chain-Network-Design

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-Supply-Chain-Network-Design`