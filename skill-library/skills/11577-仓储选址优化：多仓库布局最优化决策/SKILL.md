---
name: "p2s-warehouse-location-optimization"
title: "Warehouse Location Optimization — 仓储选址优化：多仓库布局最优化决策"
description: "触发词：仓储选址、多仓布局、海外仓开仓、Zone 运费优化。何时不用：要决定某个仓该补多少货用「补货模拟」，已定仓只排配送线路用「物流方案」里的路径优化技能；本技能回答开几个仓、开在哪里。安全边界：选址与开仓结论须人工复核后执行，模型不直接签约租仓、不直接调拨库存。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 仓储协作"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Warehouse-Location-Optimization"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "判断该开几个海外仓、开在哪里最省钱，并给出各仓的备货比例与单仓/双仓/三仓总成本对比。"
user_try: "试试：我月均 2000 单、六成在美东，现在只发加州仓，要不要在新泽西开第二个仓？开了以后每个仓各备多少货？"
whenToUse: "有历史订单地理分布与各候选仓固定成本、要决定开几个仓／开在哪里／各仓备多少货时用；仓已定、只算补多少货用「补货模拟」。"
workflow: "把历史订单按邮编聚合成需求区域，算出每区月订单量 → 用经纬度与运费区表估算候选仓到各区的运费 → 贪心加局部搜索求候选仓组合，比较单仓/双仓/三仓总成本 → 输出最优仓数与位置、各仓服务区域 → 按各区需求量给出各仓备货比例建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Warehouse Location Optimization — 仓储选址优化：多仓库布局最优化决策

## ① 解决的问题

月均2000单60%在美东用加州单仓发货运费Zone 7-8超贵——混合整数规划选址优化找到美东+美西双仓最优方案，配送成本降低15-25%年化节省10-30万元

## ② 核心算法逻辑

单仓 vs 多仓的权衡：

## ③ 业务应用场景

业务问题：月均 2000 单，60% 在美东，40% 在美西。目前只使用加州 FBA 仓，东岸订单运费 Zone 7-8 很贵。是否应该在新泽西开第二个仓？如果是，每个仓应该备多少货？
数据要求： - 过去 12 个月订单数据（订单邮编 + 金额） - 各 FBA 仓的仓储成本（月租+人工） - 运费区表（按起点邮编×终点邮编）
预期产出： - 最优仓库数量和位置 - 各仓库服务的地理区域 - 总成本对比：单仓 vs 双仓 vs 三仓 - 库存分配建议：各仓备货比例

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
配送成本降低 15-25%（单仓→双仓）：月节省 ¥2-8 万（依规模）
时效提升（平均区数降低）：减少因配送慢导致的退货和差评
避免错误选址（人工直觉 vs 量化优化）：避免 $20,000/年 的冗余成本
年化综合 ROI：¥15-40 万
实施难度：⭐⭐⭐☆☆（贪心算法实现简单；生产级用 PuLP/Gurobi MIP；需要历史订单地理分布数据；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（168 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/logistics/warehouse_location_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Warehouse-Location-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Warehouse Location Optimization
仓储选址优化：贪心 + 局部搜索求解
生产环境建议: pip install scipy pulp (混合整数规划)
"""
import numpy as np
from dataclasses import dataclass, field
from collections import Counter


@dataclass
class WarehouseCandidate:
    """候选仓库"""
    warehouse_id: str
    name: str
    zip_code: str
    monthly_fixed_cost: float  # 月固定成本（租金+人工）
    lat: float
    lon: float
    max_capacity_units: int = 100000


@dataclass
class CustomerZone:
    """客户需求区域"""
    zone_id: str
    representative_zip: str
    monthly_demand: float  # 月订单量
    lat: float
    lon: float


def haversine_distance(lat1, lon1, lat2, lon2):
    """计算两点间球面距离（km）"""
    R = 6371
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
    return R * 2 * np.arcsin(np.sqrt(a))


def compute_shipping_cost(distance_km: float, weight_lb: float = 3.0) -> float:
    """
    估算运费（基于距离的简化模型）
    FBA Zone 1-8 对应 0-500km, 500-1000km, ...
    """
    zone = min(8, int(distance_km / 500) + 1)
    base_rates = {1: 5.0, 2: 6.5, 3: 7.5, 4: 8.5, 5: 9.5, 6: 11.0, 7: 13.0, 8: 15.5}
    return base_rates[zone] * max(1, weight_lb / 3)


def solve_facility_location_greedy(
    candidates: list[WarehouseCandidate],
    customers: list[CustomerZone],
    max_warehouses: int = 3,
    weight_lb: float = 3.0,
) -> dict:
    """
    贪心 + 局部搜索求解设施选址问题
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.15678，但该号在 arXiv 上是《Oscillation Frequencies of Moderately Rotating Delta Scuti Stars: Asymmetric Mode Splittings Due to Non-spherical Distortion》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 12 个月订单明细（订单邮编 + 金额）聚合出的需求区域（区代表邮编、月订单量、经纬度）；候选仓清单：warehouse_id、名称、邮编、经纬度、月固定成本（租金+人工）、最大容量；以及按起点邮编×终点邮编的运费区表（或距离到 FBA Zone 1-8 的换算关系）。

**输出**：最优仓库数量与位置、各仓负责的地理区域、单仓 vs 双仓 vs 三仓的总成本对比，以及各仓库存分配（备货比例）建议；供物流方案决策与开仓谈判使用。

## 执行步骤

1. 把过去 12 个月订单按邮编聚合成需求区域，标出各区的代表邮编、月订单量与经纬度
2. 为每个候选仓建档案（月固定成本、经纬度、容量），用球面距离估算到各区的运费与运费 Zone
3. 用贪心加局部搜索求解候选仓组合，逐档比较单仓、双仓、三仓的运费加固定成本总成本
4. 确定最优仓数与位置，划出各仓服务的地理区域
5. 按各区需求量给出各仓备货比例建议，并列出与当前单仓方案的节省金额

## 边界与不做

- 数据不满足时不用：缺历史订单地理分布（邮编）或候选仓固定成本时，算不出运费与总成本对比。
- 只做选址与分配建议，不直接签约租仓、不直接调拨库存或改运费渠道。
- 卡页 ROI（配送成本降 15-25%、月省 ¥2-8 万、年化 ¥15-40 万）为估算口径，落地前须用本店订单数据重算。

## 技能关联

- **前置**：Skill-Bonded-Warehouse-Inventory-Intelligence.html、Skill-Bonded-Warehouse-Inventory-Intelligence、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Inventory-Positioning-Multi-DC.html、Skill-Inventory-Positioning-Multi-DC、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Warehouse-Slotting-Optimization.html、Skill-Warehouse-Slotting-Optimization
- **延伸**：Skill-Bonded-Warehouse-Inventory-Intelligence.html、Skill-Bonded-Warehouse-Inventory-Intelligence、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Inventory-Positioning-Multi-DC.html、Skill-Inventory-Positioning-Multi-DC、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Warehouse-Slotting-Optimization.html、Skill-Warehouse-Slotting-Optimization
- **可组合**：Skill-Bonded-Warehouse-Inventory-Intelligence.html、Skill-Bonded-Warehouse-Inventory-Intelligence、Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Inventory-Positioning-Multi-DC.html、Skill-Inventory-Positioning-Multi-DC、Skill-Predictive-Returns-Management.html、Skill-Predictive-Returns-Management、Skill-Warehouse-Slotting-Optimization.html、Skill-Warehouse-Slotting-Optimization、Skill-Warehouse-Location-Optimization

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Warehouse-Location-Optimization`