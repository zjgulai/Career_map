---
name: "p2s-multilevel-flp"
title: "Multilevel Facility Location Optimization (多级设施选址优化)"
description: "触发词：多级选址、仓网规划、仓网拓扑、设施选址、履约成本优化。何时不用：仓网结构已固定、短期无调整计划时不必用（此时应转向动态库存优化），只做仓间调拨协作与库存分配用「仓储协作」；本技能做多层级网络的选址与层级连通规划。安全边界：开仓、关仓与租约决策须人工评审后执行，模型不直接签约或关停设施。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 仓储协作"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Multilevel_FLP"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "在工厂、总仓、分拨中心和终端市场之间算出该开哪些节点、货怎么走，让全链路固定成本和运输成本最低。"
user_try: "试试：我有 2 个工厂、4 个总仓候选、8 个分拨中心候选、50 个终端市场，算一下该开哪些仓最省钱？"
whenToUse: "正在规划新市场进入、现有仓网 3 个以上节点怀疑冗余、或面临仓网从 2 级升 3 级的扩张决策时用；仓网已固定只做仓间协作与库存分配用「仓储协作」。"
workflow: "录入候选工厂、总仓、分拨中心的固定年化成本与处理能力 → 建立节点间运输成本矩阵与终端市场销量预测 → 用 VND 启发式求解多级选址与层级间分配 → 输出开放节点清单、DC 到总仓的映射与全链路总成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multilevel Facility Location Optimization (多级设施选址优化)

## ① 解决的问题

仓配规划经理面临仓网布局拍脑袋——多层选址将履约成本降8%，年化省30万元

## ② 核心算法逻辑

多级设施选址问题（MFL）解决的核心问题是：在一个从工厂到终端消费者的多层级供应链网络中，决定在哪里建哪类设施、各层级之间如何连通，使全链路固定成本和运输成本之和最小。它比传统的"仓库客户"两级模型更接近真实供应链。

## ③ 业务应用场景

业务问题： 某中国出海品牌（消费电子或母婴用品）正在规划全球供应链网络。现有候选节点：2 个国内工厂、4 个国内/海外总仓候选位置、8 个海外分拨中心候选位置、覆盖 50 个终端市场。问题是：应该开哪些仓？各仓如何互联？ 每个节点的开设都涉及高额固定租金合规成本，而物流方案又直接影响履约成本。
数据要求： - 候选设施列表：各层级候选位置的固定年化成本（万元/年）和处理能力（件/月） - 运输成本矩阵：各节点间单位货值的物流报价（万元/万件） - 市场需求预测：各终端市场月均销量（件/月）
预期产出： - 最优仓网拓扑：哪些工厂/总仓/分拨中心应该开设 - 物流分配方案：各层级之间的货量分配关系 - 全链路总成本：年化固定成本 + 运输成本

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

✓ 正在规划新市场进入（美国/欧洲/东南亚）
✓ 现有仓网有 3 个以上节点，怀疑存在冗余
✓ 面临仓网从 2 级升 3 级的扩张决策
✗ 仓网结构已固定且短期无调整计划（此时应转向动态库存优化）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（50 行）。**下面 50 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **50 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，50 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/multilevel_flp` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Multilevel_FLP.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
快速上手示例 - 出海供应链四级 FLP 规划
完整代码见: paper2skills-code/04-供应链/multilevel_flp_2024/model.py
"""
import sys
sys.path.insert(0, "paper2skills-code/04-供应链/multilevel_flp_2024")

from model import (
    FacilityNode, MarketNode, MLFLPInstance,
    generate_random_instance, vnd_solve, print_solution_summary
)

# -------------------------------------------------------
# 1. 构建实例（或使用 generate_random_instance 生成测试数据）
# -------------------------------------------------------
instance = generate_random_instance(
    n_plants=2,       # 国内工厂数量
    n_warehouses=3,   # 候选总仓数量
    n_dcs=5,          # 候选分拨中心数量
    n_markets=20,     # 终端市场数量
    seed=2024,
)

# -------------------------------------------------------
# 2. VND 启发式求解
# -------------------------------------------------------
best_solution, cost_history = vnd_solve(
    instance,
    max_iterations=1000,
    seed=42,
    verbose=True,      # 打印迭代过程
)

# -------------------------------------------------------
# 3. 输出结果
# -------------------------------------------------------
print_solution_summary(best_solution, instance)

# 查看分配决策
print("\n仓网分配决策:")
print(f"  开放总仓: {best_solution.open_warehouses}")
print(f"  开放分拨中心: {best_solution.open_dcs}")
print(f"  DC -> Warehouse 映射: {best_solution.assign_wd}")

# 优化效益
initial_cost = cost_history[0]
final_cost = best_solution.total_cost
saving_pct = (initial_cost - final_cost) / initial_cost * 100
print(f"\n优化效益: {initial_cost:.2f} → {final_cost:.2f} 万元 (节省 {saving_pct:.1f}%)")
print("[✓] Multilevel_FLP 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.07382 — Multilevel Facility Location Optimization: A Novel Integer Programming Formulation and Approaches to Heuristic Solutions

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：三层网络输入：各层级候选设施清单（工厂/总仓/分拨中心的固定年化成本，单位万元/年，以及处理能力 件/月）、节点间运输成本矩阵（单位货值物流报价 万元/万件）、终端市场的月均销量预测（件/月）。

**输出**：最优仓网拓扑（应开设的工厂、总仓与分拨中心清单）、各层级之间的货量分配关系（如 DC 到总仓的映射）、全链路年化总成本（固定成本 + 运输成本）与相对初始方案的节省比例；供仓配规划团队做网络扩张与投资决策。

## 执行步骤

1. 整理候选设施清单，录入各节点固定年化成本与处理能力
2. 建立节点间运输成本矩阵与终端市场月均销量预测
3. 用 VND 启发式求解多级选址与层级间货量分配
4. 输出开放总仓、开放分拨中心与 DC 到总仓的分配映射
5. 对比初始方案与最优方案的全链路总成本与节省比例

## 边界与不做

- 数据不满足时不用：缺候选节点固定成本或节点间运输报价时无法建立成本目标函数。
- 只做网络规划与成本比较，不执行开仓、关仓、签约等动作。
- 卡页降本幅度（履约成本降低 8%、年化省 30 万元）为估算口径，落地前须用真实报价重算。

## 技能关联

- **前置**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Multilevel_FLP

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-Multilevel_FLP`