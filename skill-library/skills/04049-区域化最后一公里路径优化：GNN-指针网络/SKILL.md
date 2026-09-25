---
name: "p2s-zone-gnn-last-mile-routing"
title: "Zone-GNN — 区域化最后一公里路径优化：GNN + 指针网络"
description: "触发词：排线优化、最后一公里、配送路线、多站配送、司机路线。何时不用：要决定开几个仓、仓建在哪里用「仓储选址」类技能，路线由 3PL 提供只需比价选商用「采购比价」。安全边界：路线方案仅为建议，实际派车与对外时效承诺须人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Zone-GNN-Last-Mile-Routing"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把每天上百个配送点自动分区排线，减少绕路与日行里程，让两辆车也能跑完全部站点。"
user_try: "试试：帮我把新泽西这 80-120 个送货点按 2 辆车排线，尽量少绕路，并给每辆车一张停靠顺序表。"
whenToUse: "有自营车队、每日停靠点多且已积累历史配送记录时用；要决定开几个仓、仓位选在哪里用「仓储选址」类技能。"
workflow: "把当日停靠点按经纬度聚成若干配送 Zone → 按 Zone 质心到仓的距离贪心排出 Zone 间访问顺序 → 在每个 Zone 内按最近邻排停靠顺序并叠加时间窗 → 按车辆数切分路线，输出每车停靠顺序与预计里程"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Zone-GNN — 区域化最后一公里路径优化：GNN + 指针网络

## ① 解决的问题

跨境卖家自营海外仓配送路线靠人工排线效率低下——区域化GNN+指针网络学习历史驾驶偏好，日均里程减少10-14%，2辆车年化节省8-18万元

## ② 核心算法逻辑

传统路径优化用 VRP（车辆路径问题）求解器（如 ORTools），但在大规模（50200 个停靠点/路线）场景下计算量爆炸，且无法利用历史驾驶数据。ZoneGNN 的创新是：先用区域划分（Zone）将城市地理分割为小块，再在每个区域内学习局部路径策略，最后拼接成全局路径。

## ③ 业务应用场景

业务问题：母婴品牌在美国 NJ 有自营海外仓，每天需要用2辆货车完成新泽西周边 80-120 个站点配送（覆盖 Target、Walmart、Baby Depot 等零售商补货）。人工排线每天耗时 45 分钟，且经常绕路，导致单辆车日行里程达 280km。
Zone-GNN 处理： - 将新泽西配送区域划分为 8 个 Zone（北泽西/中泽西/南泽西各 2-3 个） - GNN 学习各 Zone 间的最优访问顺序（考虑早晚高峰、仓库开门时间） - Pointer Network 在每个 Zone 内优化 10-15 个停靠点的顺序
数据要求： - 历史配送记录（出发时间、到达时间、每站停留时长） - 停靠点坐标（收货地址 → GPS 转换） - 当日订单量和体积（影响装卸时间） - 交通历史数据（可用 Google Maps API 获取）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
自营配送：2辆车 × 250天 × 30km节省 × $0.8/km = $12,000/年
3PL 优化谈判筹码（提供最优路线给第三方物流）：节省 8-12% 物流费
月均物流支出 $50,000 → 节省 $4,000-6,000/月 = $48,000-72,000/年
实施难度：⭐⭐⭐⭐☆
需要积累至少 3-6 个月历史路线数据（冷启动期）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（184 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/logistics/zone_gnn_last_mile_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Zone-GNN-Last-Mile-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Zone-GNN 最后一公里路径优化
简化实现：区域划分 + 贪心排序（完整版需 PyTorch + Pointer Network）

依赖: numpy, scikit-learn
"""

import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass

@dataclass
class StopPoint:
    """配送停靠点"""
    stop_id: str
    lat: float
    lon: float
    service_time_min: float = 15.0
    time_window: Tuple[int, int] = (8, 18)

def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """经纬度计算距离（km）"""
    R = 6371
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlam = np.radians(lon2 - lon1)
    a = np.sin(dphi/2)**2 + np.cos(phi1)*np.cos(phi2)*np.sin(dlam/2)**2
    return 2 * R * np.arcsin(np.sqrt(a))


class ZoneRouter:
    """
    区域化路径优化器（Zone-GNN 简化版）
    
    完整版用 GNN 学习区域间顺序 + Pointer Network 学习区域内顺序
    简化版用 k-means 聚类区域 + 最近邻启发式排序
    """
    
    def __init__(self, n_zones: int = 4, depot_lat: float = 40.7, depot_lon: float = -74.0):
        self.n_zones = n_zones
        self.depot = (depot_lat, depot_lon)
    
    def assign_zones(self, stops: List[StopPoint]) -> Dict[int, List[StopPoint]]:
        """K-Means 区域划分"""
        from sklearn.cluster import KMeans
        coords = np.array([(s.lat, s.lon) for s in stops])
        kmeans = KMeans(n_clusters=self.n_zones, random_state=42, n_init=10)
        labels = kmeans.fit_predict(coords)
        zones = {}
        for i, stop in enumerate(stops):
            zone_id = labels[i]
            if zone_id not in zones:
                zones[zone_id] = []
            zones[zone_id].append(stop)
        return zones
    
    def order_zones(self, zones: Dict[int, List[StopPoint]]) -> List[int]:
        """贪心算法确定区域访问顺序（GNN 简化版）"""
        zone_centroids = {}
        for zone_id, zone_stops in zones.items():
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2601.04705，但该号在 arXiv 上是《A zone-based training approach for last-mile routing using Graph Neural Networks and Pointer Networks》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：当日停靠点清单：stop_id、纬度、经度、每站服务时长（模板默认 15 分钟）、时间窗（模板默认 8-18 点）；仓（depot）经纬度与可用车辆数；以及历史配送记录（出发/到达时间、每站停留时长）、当日订单量与体积、交通历史数据用于区域划分与顺序学习。

**输出**：按 Zone 分组的停靠点顺序、Zone 之间的访问顺序、每辆车的路线与预计日行里程/时长；供调度排线以及与 3PL 谈判最优路线时使用。

## 执行步骤

1. 把当日 80-120 个停靠点按经纬度聚成若干 Zone（如北/中/南泽西各 2-3 个）
2. 按 Zone 质心到仓的距离贪心排出 Zone 之间的访问顺序，并考虑早晚高峰与仓库开门时间
3. 在每个 Zone 内排出 10-15 个停靠点的先后顺序，叠加各站停留时长
4. 按车辆数切分路线，输出每辆车的停靠顺序与预计日行里程
5. 与人工排线基线对比里程，列出减少绕路的具体站点

## 边界与不做

- 数据不满足时不用：缺停靠点坐标或历史路线记录时不具备冷启动条件（卡页要求积累 3-6 个月历史路线数据）。
- 只输出排线建议，不直接调度车辆、不向零售商承诺时效。
- 卡页 ROI（日均里程减 10-14%、2 辆车年省 8-18 万元、月物流支出 $50,000 可省 $4,000-6,000）为估算口径，落地前须用本车队实际里程重算。

## 技能关联

- **前置**：Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **延伸**：Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Zone-GNN-Last-Mile-Routing

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Zone-GNN-Last-Mile-Routing`