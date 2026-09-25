---
name: "p2s-first-mile-pickup-optimization"
title: "首公里取货路径优化 — 国内工厂到货代的调度算法"
description: "触发词：首公里取货、工厂集货、取货路线优化、多工厂取货、大促紧急集货。何时不用：只要按载重容积求解多停靠点路线、想直接走 OR-Tools 求解器用「首公里取货路径优化」；本技能按工厂可接受取货时间窗排线。安全边界：冷链货须独立车辆与食品安全合规把关，模型只排线路不派车、不派单。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-First-Mile-Pickup-Optimization"
p2s_src_domain: "18-物流履约"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把同城散落的工厂取货点排成几条最省里程的车线，压掉空驶率，也让大促前 24 小时紧急集货排得开。"
user_try: "试试：东莞惠州广州这 15 家工厂每天派 4 台车取货，帮我排一版总里程最短、又满足各家取货时间窗的路线。"
whenToUse: "已有工厂坐标、每日取货量与可接受取货时间窗，需要给车队排首公里取货线路时用；只要按载重容积求解的多停靠点路线用「首公里取货路径优化」。"
workflow: "整理取货点坐标、货量、时间窗与车辆载重容积约束 → 用 Clarke-Wright 节省算法合并初始的独立取货路线 → 在容量与时间窗约束下做 Or-opt 邻域改进 → 按可用车辆数做多车并行分工，输出每车到点顺序 → 对比优化前后的总里程与空驶率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 首公里取货路径优化 — 国内工厂到货代的调度算法

## ① 解决的问题

货代运营面临"多工厂取货路线重叠车辆调度低效首公里成本虚高"——VRP路径优化将首公里运费降低40%，年化节省物流成本15-25万元

## ② 核心算法逻辑

首公里取货优化是将多工厂/供应商的货物集约取货至货代仓/集运中心的车辆路径问题（VRP）。具体为带时间窗约束的 VRP（VRPTW）：

## ③ 业务应用场景

场景1：华南母婴工厂集货路线优化 - 业务问题：货代在东莞、惠州、广州散落着 15 个母婴工厂供应商，每天派 4 辆车取货，路线由司机自行规划，空驶率达 35%，燃油成本高 - 数据要求：各工厂经纬度坐标、每日取货量（箱/重量）、工厂可接受取货时间窗、车辆载重/容积限制 - 预期产出：最优取货路线方案，行驶总距离减少 20-30%，空驶率降至 15% 以下 - 业务价值：年化节省燃油+司机成本约 12-18 万元
场景2：大促前婴儿奶粉紧急集货调度 - 业务问题：大促前 3 天，10 个供应商同时备货完成，集货时效要求 24 小时内全部到货代仓，现有路线无法满足 - 数据要求：实时库存就绪确认时间、各取货点位置、可用司机和车辆数量 - 预期产出：多车并行最优分工方案，24 小时内完成全量集货的可行路线 - 业务价值：避免大促断货，保障 GMV 峰值不因集货延误损失
**三轨验证**：成本（行驶距离+油耗）/ 合规（冷链产品需独立车辆，食品安全合规）/ 风险（实时路况变化需动态重路由能力）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：对 10-20 个供应商规模的货代，年化节省燃油+人力成本 10-20 万元，投资回收期 2-4 个月
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：Clarke-Wright 算法实现简单，OR-Tools 开源免费，落地门槛低；母婴工厂通常集中在珠三角/长三角，取货点密度高，路径优化收益显著。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（127 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
首公里取货路径优化 — Clarke-Wright 节省算法 + Or-opt 改进
"""
import numpy as np
import random
from itertools import permutations

np.random.seed(42)
random.seed(42)

# ---- 1. 构造取货点数据 ----
depot = {"id": 0, "x": 113.75, "y": 23.02, "name": "货代仓(东莞)"}
factories = [
    {"id": i+1, "x": 113.75 + np.random.uniform(-0.5, 0.5),
     "y": 23.02 + np.random.uniform(-0.3, 0.3),
     "demand_cbm": np.random.uniform(1, 8),  # 货量（立方米）
     "tw_open": np.random.choice([8, 9, 10]),   # 最早取货时间
     "tw_close": np.random.choice([17, 18, 19]),  # 最晚取货时间
     "name": f"工厂_{i+1:02d}"}
    for i in range(12)
]
nodes = [depot] + factories

VEHICLE_CAPACITY = 20.0  # 立方米/车

def dist(a, b):
    """欧氏距离（近似公里，实际应用用真实路网距离）"""
    return np.sqrt((a["x"] - b["x"])**2 + (a["y"] - b["y"])**2) * 100

# ---- 2. Clarke-Wright 节省算法 ----
def clarke_wright(nodes, depot, capacity):
    customers = nodes[1:]
    # 初始解：每个工厂独立一条路线
    routes = [[c] for c in customers]

    # 计算所有节省量
    savings = []
    for i, ci in enumerate(customers):
        for j, cj in enumerate(customers):
            if i >= j:
                continue
            s = dist(depot, ci) + dist(depot, cj) - dist(ci, cj)
            savings.append((s, i, j))
    savings.sort(key=lambda x: -x[0])

    # 合并路线
    for s, i, j in savings:
        # 找 ci 和 cj 所在路线
        ri = next((r for r in routes if customers[i] in r), None)
        rj = next((r for r in routes if customers[j] in r), None)
        if ri is None or rj is None or ri is rj:
            continue
        # 检查容量约束
        total_demand = sum(n["demand_cbm"] for n in ri + rj)
        if total_demand > capacity:
            continue
        # 合并（ci 在 ri 末尾 且 cj 在 rj 开头）
        if ri[-1] is customers[i] and rj[0] is customers[j]:
            routes.remove(ri)
            routes.remove(rj)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：取货点级：工厂或供应商 id、经纬度坐标、每日取货量（立方米或重量）、可接受取货时间窗（最早与最晚取货时间）、是否需冷链独立车辆；车辆侧：载重与容积上限、可用车辆数与司机数；大促场景另需各取货点的库存就绪确认时间。

**输出**：每辆车的取货路线与到点顺序、各路线的载重与容积占用、总行驶里程与优化后的空驶率，以及优化前后对比；供货代调度安排车辆与司机、并支撑大促集货时效承诺使用。

## 执行步骤

1. 整理各工厂坐标、每日取货量、可接受取货时间窗与车辆载重容积
2. 用 Clarke-Wright 节省算法从各点独立路线出发合并线路
3. 在容量与时间窗约束下做 Or-opt 改进，剔除超载或超时的合并
4. 按可用车辆数做多车并行分工，给出每辆车的到点顺序
5. 对比优化前后的总里程与空驶率，输出取货排线方案

## 边界与不做

- 数据不满足时不用：缺工厂坐标、每日取货量或可接受取货时间窗时排不出可行路线。
- 只输出路线与车辆分工建议，不调度司机、不派单、不做实时路况改线。
- 卡页 ROI（首公里运费降低约 40%、年化省 15-25 万元；10-20 家供应商规模的货代年化省燃油与人力 10-20 万元、回收期 2-4 个月）为估算口径，落地前须用本货代实际数据重算。

## 技能关联

- **可组合**：Skill-First-Mile-Pickup-Optimization

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-First-Mile-Pickup-Optimization`