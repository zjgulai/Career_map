---
name: "p2s-drone-uav-last-mile-delivery"
title: "无人机末端配送调度 — UAV最后一公里的路径规划"
description: "触发词：无人机配送、末端配送调度、郊区急送、无人机路径规划、仓库内取货。何时不用：常规订单交给快递承运商比选用「承运商动态选择」，只算物流成本率与空运海运取舍用「经济性分析」；本技能只判断哪些货能用无人机飞、怎么飞。安全边界：航线须先过 FAA/CAAC 认证、实时禁飞区与远程 ID 校验，模型不直接下发飞行指令，方案须人工与合规复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Drone-UAV-Last-Mile-Delivery"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "为郊区急需订单规划可飞的无人机路径，算清载重航程与充电约束，并和人工配送的成本时效做对比。"
user_try: "试试：这批深夜急送的婴儿奶粉在郊区，用无人机配送怎么排路线？成本和时效比人工配送好多少？"
whenToUse: "已有收货坐标、商品重量与充电站位置，需要判断哪些订单可用无人机飞并排出任务路径时用；常规订单的承运商比选用「承运商动态选择」，只做物流成本率拆解用「经济性分析」。"
workflow: "按收货坐标、商品重量与航程筛出可无人机配送的订单 → 核对禁飞区、重量上限与远程 ID 等合规项 → 按载重折算有效航程与飞行时间，规划含充电约束的任务路径 → 对比无人机与人工配送的单件成本与时效 → 输出可行订单与任务方案，标注需人工与合规确认项"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 无人机末端配送调度 — UAV最后一公里的路径规划

## ① 解决的问题

跨境运营面临"郊区最后一公里配送成本高达12元/件且急需品时效慢"——无人机调度规划降低配送成本至3元/件，30分钟配送留存率+15%，规模化后年化ROI约125万元

## ② 核心算法逻辑

无人机配送（UAV Delivery）正在从实验走向规模化（亚马逊Prime Air/美团/顺丰均已商业试运营）。母婴电商场景特别适合：

## ③ 业务应用场景

场景A：美国郊区婴幼儿急需品无人机配送 - 业务问题：用户深夜急需婴儿奶粉（断货），最近人工配送需要2小时，用户已经流失 - 业务场景：亚马逊Prime Air类型服务，在郊区/低密度区测试无人机30分钟配送 - 数据要求：收货地址（坐标）、商品重量（<2.5kg）、无人机航程和充电站位置 - 预期产出：在15km配送半径内规划最优无人机路径，满足FAA合规要求，预计配送时间18分钟（vs人工配送90分钟） - 业务价值：急需品配送满足率从40%提升至85%，该品类用户留存率+15%；无人机配送成本约3元/件（规模化后），vs人工末端12元/件，年化成本节省约180万元（基于5万次/年无人机配
三轨对抗验证： 1. 成本验证：单架无人机购置约5-15万元，年维护约1万元；在订单密度>50次/天/架时实现盈亏平衡；前期需要FAA/CAAC认证成本约20-50万元（一次性） 2. 合规验证：美国远程ID强制要求（2023年起）；禁飞区数据库需实时更新（机场、政府建筑）；夜间飞行需要额外认证；GDPR对无人机拍摄图像有严格要求 3. 风险验证：天气依赖性强（风速>8m/s、雨雪无法飞行）；包裹失窃风险；无人机故障概率约0.1次/百次飞行，需备用人工配送流程；噪音投诉在居民区需要评估
场景B：仓库内货架到出库口无人机辅助搬运 - 业务问题：大型母婴仓库内货架高达12米，取货人工需要升降车，效率低 - 方案：室内小型无人机（限定区域BVLOS）从高层货架取货到处理区 - 业务价值：取货效率提升约40%，大促期间拣货速度瓶颈解除，年化价值约30万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：郊区配送成本从12元/件降至3元/件（规模化后），年化5万次无人机配送节省约45万元；急需品30分钟配送将该品类留存率+15%，年化GMV增量约80万元；综合ROI约125万元/年（规模化后第3年）
实施难度：⭐⭐⭐⭐⭐（监管认证、硬件采购、运营体系建设是巨大障碍；建议先以"特定场景试点"模式启动）
优先级：⭐⭐☆☆☆（3-5年视野的前瞻布局，当前成本收益比需要达到一定规模才正向；规模<5000次/月的场景暂不推荐）
评估依据：亚马逊Prime Air已在德克萨斯州和加利福尼亚州商业运营；美团无人机在深圳、上海已规模化；Transportation Science是OR领域顶刊；2023年末无人机配送成本已较2020年下降60%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（190 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Drone-UAV-Last-Mile-Delivery
无人机末端配送调度 — 郊区最后一公里UAV路径规划

依赖：pip install numpy pandas scipy
"""

import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
from dataclasses import dataclass
from typing import Optional

np.random.seed(42)

# ── 1. 无人机参数配置 ────────────────────────────────────────────────
@dataclass
class DroneSpec:
    max_payload_kg: float = 2.5     # 最大载重（kg）
    max_range_km: float = 15.0      # 最大航程（km，满载时）
    speed_kmh: float = 60.0         # 巡航速度（km/h）
    energy_per_km: float = 15.0     # 耗电（Wh/km）
    battery_capacity_wh: float = 250.0  # 电池容量
    charge_time_min: float = 45.0   # 充电时间（分钟）

    def effective_range(self, payload_kg: float) -> float:
        """实际航程随载重减少（线性近似）"""
        payload_factor = 1 - 0.3 * (payload_kg / self.max_payload_kg)
        return self.max_range_km * payload_factor

    def flight_time_min(self, distance_km: float) -> float:
        return distance_km / self.speed_kmh * 60

# ── 2. 合规约束检查器 ────────────────────────────────────────────────
class RegulationChecker:
    """FAA/CAAC无人机配送合规检查"""

    NO_FLY_ZONES = [
        {'name': '纽约JFK机场', 'center': [40.64, -73.78], 'radius_km': 5.0},
        {'name': '人口密集区', 'center': [40.73, -74.00], 'radius_km': 2.0},
    ]

    def check_delivery_point(self, lat: float, lng: float, payload_kg: float) -> dict:
        """检查配送点是否合规"""
        issues = []
        # 重量限制
        if payload_kg > 25.0:
            issues.append(f"超重: {payload_kg:.1f}kg > 25kg（FAA限制）")
        # 禁飞区检查
        for zone in self.NO_FLY_ZONES:
            dist = np.sqrt(((lat-zone['center'][0])*111)**2 +
                           ((lng-zone['center'][1])*111*0.85)**2)
            if dist < zone['radius_km']:
                issues.append(f"在禁飞区 {zone['name']} 内（距中心{dist:.1f}km）")
        return {'compliant': len(issues) == 0, 'issues': issues}

# ── 3. 无人机路径规划（含充电约束）──────────────────────────────────────
class DroneMissionPlanner:
    """无人机任务路径规划，含充电站优化"""
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：订单/配送点粒度：收货地址经纬度、商品重量（kg，单件上限 2.5kg）、无人机参数（最大载重、最大航程 15km、巡航速度 60km/h、能耗与电池容量、充电时长）、充电站位置，以及禁飞区数据库（含中心坐标与半径）。

**输出**：每个配送点的合规检查结果（是否合规与具体 issues，如超重或在禁飞区内）、按载重折算的有效航程与飞行时间、含充电约束的任务路径，以及无人机与人工配送的单件成本与时效对比；供物流调度与合规评审使用。

## 执行步骤

1. 按收货坐标、商品重量与无人机航程筛出可配送的订单
2. 用合规检查器逐个核对禁飞区、重量上限与远程 ID 要求
3. 按载重折算有效航程与飞行时间，规划含充电站约束的任务路径
4. 对比无人机方案与人工配送的单件成本、配送时间与满足率
5. 输出可行订单清单与任务方案，标注需人工与合规确认的动作

## 边界与不做

- 数据不满足时不用：缺收货坐标、商品重量或充电站位置时无法算航程与排路径。
- 只做路径与合规判断，不承担飞行执行、认证据办理与硬件采购。
- 卡页 ROI（12 元/件降至 3 元/件、年化约 125 万元）为规模化后第 3 年的估算口径，且原文注明规模小于 5000 次/月暂不推荐，落地前须用本场景实际数据重算。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cross-Border-Last-Mile-Routing.html、Skill-Cross-Border-Last-Mile-Routing、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Real-Time-Fleet-Dynamic-Routing.html、Skill-Real-Time-Fleet-Dynamic-Routing
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Real-Time-Fleet-Dynamic-Routing.html、Skill-Real-Time-Fleet-Dynamic-Routing
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Delivery-Promise-Optimization.html、Skill-Delivery-Promise-Optimization、Skill-Green-Logistics-Carbon-Optimization.html、Skill-Green-Logistics-Carbon-Optimization、Skill-Drone-UAV-Last-Mile-Delivery

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Drone-UAV-Last-Mile-Delivery`