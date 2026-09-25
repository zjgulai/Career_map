---
name: "p2s-last-mile-network-planning"
title: "Last Mile Network Planning — VRP变体+海外仓选址末端网络优化"
description: "触发词：海外仓选址、仓网规划、末端网络优化、配送路径优化、2 日达覆盖率。何时不用：仓网已定、只做仓间调拨与库存分配用「仓储协作」，只看单票时效与在途异常用「到货异常追踪」；本技能做末端选址与配送路径的联合规划。安全边界：选址结论仅为决策建议，建仓、租约与运力协议须人工评审后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 仓储协作"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Last-Mile-Network-Planning"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "评估该在哪些城市建设海外仓、每个客户从哪个仓发货，让更多订单做到 2 日达并压低整体配送成本。"
user_try: "试试：我现在只有洛杉矶一个海外仓，东海岸客户流失率 18%，在 NJ、达拉斯、芝加哥里加一个仓能省多少配送成本？"
whenToUse: "已有订单地址分布、候选仓成本与分区运费、需要决定开哪些仓并优化末端路径时用；仓网已固定、只想优化仓间协作与调拨用「仓储协作」。"
workflow: "列出候选仓位置与月固定成本、车辆容量 → 把每个客户分配给最近的开放仓 → 用 Clarke-Wright 节约算法生成末端配送路线 → 对比各方案总成本与 2 日达覆盖率 → 输出开仓组合与货量分配方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Last Mile Network Planning — VRP变体+海外仓选址末端网络优化

## ① 解决的问题

物流战略团队面临"仅LA单仓导致东海岸2日达覆盖率仅12%、流失率18%"——VRP选址优化增设NJ仓后2日达覆盖率提升至87%，年化节省配送成本55万元+间接增收20-30万元

## ② 核心算法逻辑

末端网络规划（Last Mile Network Planning）联合解决两个相互耦合的问题：

## ③ 业务应用场景

场景A：美国东海岸母婴 DTC 海外仓布局优化
- 业务问题：仅在洛杉矶有一个海外仓，东海岸客户（占 40%）平均配送 5-7 天，Prime 时代消费者期望 2-3 天，流失率约 18% - 数据要求：过去 12 个月订单地址分布（州/邮编）、候选仓城市（LA/达拉斯/芝加哥/NJ）的仓储建设成本、UPS/FedEx 分区运费 - 预期产出：在 NJ 增加东海岸仓后，东海岸 2-day 覆盖率从 12% 提升至 87%，平均配送成本下降 $2.1/单 - 业务价值：月均 3000 单东海岸订单，节省 $2.1/单，月均节省约 $6,300（4.5 万人民币），年化约 55 万；流失率改善间接增收约 20-30 万元/年
场景B：德国婴儿用品 FBA 补货路径优化（多仓→多 FBA）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：增加东海岸仓后年化节省配送成本约 55 万元，流失率改善间接增收约 20-30 万元；德国多仓路线优化年化节省约 42 万元
实施难度：⭐⭐⭐⭐☆（需要物流数据积累、候选仓成本谈判、选址决策周期长）
优先级：⭐⭐⭐⭐☆
评估依据：海外仓布局是母婴 DTC 时效竞争的核心杠杆；一次性规划投入，长期持续收益；是规模化后必做的战略基础设施决策

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（155 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from itertools import combinations

np.random.seed(42)

# ===== 场景：美国母婴 DTC 海外仓选址 + 末端路径优化 =====

# 候选仓库（城市坐标，简化为2D平面）
CANDIDATE_WAREHOUSES = {
    'LA':      np.array([0.0, 0.0]),
    'Dallas':  np.array([2.5, -1.0]),
    'Chicago': np.array([5.0, 2.0]),
    'NJ':      np.array([8.5, 1.5]),
}

# 固定建仓成本（月）
WAREHOUSE_FIXED_COST = {
    'LA': 15000, 'Dallas': 8000, 'Chicago': 10000, 'NJ': 12000
}

# 模拟 200 个客户订单（地理分布偏东海岸）
n_customers = 200
# 60% 西海岸，40% 东海岸
west_customers = np.random.multivariate_normal([1.5, 0], [[1.5, 0], [0, 1.5]], 120)
east_customers = np.random.multivariate_normal([7.5, 1], [[1.0, 0], [0, 1.0]], 80)
customer_positions = np.vstack([west_customers, east_customers])
customer_demands = np.random.randint(1, 5, n_customers)  # 每单件数

COST_PER_KM = 0.8  # 每公里配送成本（美元）
VEHICLE_CAPACITY = 50  # 每趟最大件数

print(f"客户数: {n_customers}, 总需求: {customer_demands.sum()} 件")
print(f"东海岸客户（x>5）: {(customer_positions[:, 0] > 5).sum()} 人")


def dist(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))


def assign_customers_to_warehouses(warehouses_open):
    """将每个客户分配到最近的开放仓库"""
    wh_positions = {k: v for k, v in CANDIDATE_WAREHOUSES.items() if k in warehouses_open}
    assignments = {}
    total_transport_cost = 0.0
    for i, pos in enumerate(customer_positions):
        best_wh = min(wh_positions.keys(), key=lambda w: dist(pos, wh_positions[w]))
        assignments[i] = best_wh
        total_transport_cost += dist(pos, wh_positions[best_wh]) * COST_PER_KM * customer_demands[i]
    return assignments, total_transport_cost


def clarke_wright_routes(depot_pos, customers_pos, customers_demands, capacity):
    """Clarke-Wright 节约算法构造路线"""
    n = len(customers_pos)
    if n == 0:
        return [], 0.0
    # 计算节约值
    savings = []
    for i, j in combinations(range(n), 2):
        s = (dist(depot_pos, customers_pos[i]) +
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：以客户点/订单点为粒度：客户坐标与订单件数、候选仓城市坐标与月固定成本、每公里配送成本与车辆容量上限；另需过去 12 个月订单地址分布（州/邮编）与 UPS/FedEx 分区运费报价。

**输出**：选址结论（应开放哪些仓）、每个客户归属的仓、按节约算法构造的末端配送路线草案、仓网总成本（固定成本 + 运输成本）与关键指标（2 日达覆盖率、单均配送成本）；供物流战略团队做仓网投资与网络调整决策。

## 执行步骤

1. 把 12 个月订单地址分布整理成州/邮编粒度的需求点，并录入候选仓成本
2. 枚举候选开仓组合，将每个客户分配给最近的开放仓
3. 在车辆容量约束下用 Clarke-Wright 节约算法构造末端配送路线
4. 比较各方案的总成本与 2 日达覆盖率，选出最优仓网拓扑
5. 输出开仓建议与配送路线草案，标注需要人工评审的投资项

## 边界与不做

- 数据不满足时不用：缺候选仓固定成本或分区运费报价时，无法比较不同开仓方案。
- 只输出选址与路线建议，不签约仓库、不锁定运力、不直接改配送规则。
- 卡页 ROI（如年化节省约 55 万元、间接增收 20-30 万元）为估算口径，落地前须用真实报价与订单量重算。

## 技能关联

- **前置**：Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Warehouse-Location-Optimization.html、Skill-Warehouse-Location-Optimization、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Inventory-Demand-Sensing.html、Skill-Inventory-Demand-Sensing、Skill-Last-Mile-Network-Planning

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Last-Mile-Network-Planning`