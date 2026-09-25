---
name: "p2s-neo-lrp"
title: "NEO-LRP（Neural Embedded Optimization for Location-Routing）"
description: "触发词：前置仓选址、选址路径优化、开仓组合、配送路线规划、单票里程优化。何时不用：只优化既有仓的末端路线用路径优化类技能，要规划工厂到分拨中心的多级仓网用多级选址类技能；本技能联合决定开哪些仓与怎么配送。安全边界：开仓与路线结论仅为决策建议，实际建仓、租约与调度下发须人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-NEO_LRP"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "一次算清该开哪几个前置仓、每个小区归哪个仓送、每天路线怎么排，让开仓成本加配送成本最低。"
user_try: "试试：8 个备选前置仓里选 2 个开，覆盖 120 个小区的尿布和奶粉配送，哪种组合总成本最低？"
whenToUse: "有备选仓坐标与开仓成本、客户点位与日订单量、需要同时决定开仓组合和配送路线时用；只排既有仓的路线用路径优化类技能，规划多级仓网用多级选址类技能。"
workflow: "整理备选仓与客户点的坐标、成本与需求 → 用历史配送轨迹校准路径成本估计器 → 在开仓数量约束下求解选址与客户分配 → 输出开仓组合、客户归属与各仓路线草案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NEO-LRP（Neural Embedded Optimization for Location-Routing）

## ① 解决的问题

履约规划经理面临线路频繁绕路——路径优化将单票配送里程降15%，年化省11万元

## ② 核心算法逻辑

核心思想：把"建哪些仓"和"怎么配送"这两个原本耦合的 NPhard 问题解耦——用一个预训练好的图神经网络（GNN）充当配送路径成本的快速估计器，把估计值直接嵌进选址的混合整数规划（MIP）里，从而让 MIP 求解器只需要做高层选址分配决策，而不必在求解过程中展开庞大的车辆路径（VRP）变量。

## ③ 业务应用场景

业务问题：计划在某一线城市新增 2～3 个母婴品类前置仓，备选点共 8 个（商业园区/物流园），每天需要向 120+ 个小区配送尿布、奶粉等，要求"开仓固定成本 + 每日配送成本"之和最低。
数据要求： - 备选仓位置（经纬度）、日租金/固定运营成本（元/天）、容量上限（单品件数/天） - 各小区中心坐标（或聚合地址）、日均订单量（件） - 历史配送记录（骑手/货车轨迹 + 成本），用于训练/校准 GNN 代理模型
预期产出： - 最优开仓组合（如从 8 个备选中选 2 个） - 每个小区归属哪个仓 - 各仓每日配送路线草案（可直接下发调度系统）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

91 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（29 行）。**下面 29 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **29 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，29 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/neo_lrp` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-NEO_LRP.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import solve_location_routing

depot_specs = [
    {"node_id": "仓A_东区", "x": 0.0,  "y": 0.0,  "open_cost": 200.0, "capacity": 300.0},
    {"node_id": "仓B_西区", "x": 10.0, "y": 0.0,  "open_cost": 180.0, "capacity": 300.0},
    {"node_id": "仓C_北区", "x": 5.0,  "y": 8.0,  "open_cost": 220.0, "capacity": 300.0},
]
customer_specs = [
    {"node_id": "小区01", "x": 1.0,  "y": 1.0,  "demand": 10.0},
    {"node_id": "小区02", "x": 2.0,  "y": -1.0, "demand": 15.0},
    {"node_id": "小区03", "x": 9.0,  "y": 1.0,  "demand": 12.0},
    {"node_id": "小区04", "x": 11.0, "y": -1.0, "demand": 8.0},
    {"node_id": "小区05", "x": 5.0,  "y": 7.0,  "demand": 20.0},
    {"node_id": "小区06", "x": 6.0,  "y": 9.0,  "demand": 18.0},
]

result = solve_location_routing(
    depot_specs,
    customer_specs,
    vehicle_capacity=50.0,
    vehicle_cost_per_km=3.0,
    max_open=2,
    verbose=True,
)

print(f"开放仓库: {result.open_depots}")
print(f"总成本: {result.total_cost:.2f} 元/天")
print(f"  开仓: {result.open_cost:.2f} | 路径: {result.routing_cost:.2f}")
print("[✓] NEO_LRP 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2412.05665 — Neural Embedded Mixed-Integer Optimization for Location-Routing Problems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：两类点位输入：备选仓（node_id、坐标 x/y、每日开仓固定成本、容量上限 件/天）与客户点（node_id、坐标、日均需求量 件）；另需车辆容量上限、每公里运输成本、允许开仓的最大数量，以及历史配送记录（骑手/货车轨迹与成本）用于训练校准路径成本估计器。

**输出**：最优开仓组合（如从 8 个备选中选 2 个）、每个客户点归属的仓、各仓每日配送路线草案（卡页口径可直接下发调度系统），以及总成本拆解（开仓固定成本 + 路径配送成本）；供履约规划团队做前置仓布点与调度准备。

## 执行步骤

1. 整理备选仓坐标、日固定成本与容量，以及客户点坐标与日均需求
2. 用历史配送轨迹与成本记录训练校准路径成本估计器
3. 把路径成本估计嵌入选址模型，在开仓数量约束下求解
4. 输出开仓组合与每个客户点的仓库归属
5. 生成各仓每日配送路线草案与开仓/路径成本拆解

## 边界与不做

- 数据不满足时不用：缺历史配送轨迹与成本记录时，路径成本估计器无法校准，联合优化退化为纯几何选址。
- 只输出开仓组合与路线草案，不直接建仓、不向骑手或调度系统下发任务。
- 卡页 ROI 与里程降幅为估算口径，落地前须用本店真实轨迹与运价重算。

## 技能关联

- **前置**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-FSDA-DRL.html、Skill-FSDA-DRL、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supply-Chain-Network-Design.html、Skill-Supply-Chain-Network-Design、Skill-NEO_LRP

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-NEO_LRP`