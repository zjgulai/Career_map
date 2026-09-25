---
name: "p2s-3d-bin-packing-optimization"
title: "3D Bin Packing Optimization — 3D 装箱优化：集装箱/货架空间利用率最大化"
description: "触发词：装箱优化、集装箱装载率、海运装柜、装载率提升、货架空间利用。何时不用：要选运输方式与时效方案用「物流方案」，要安排仓内作业与交接协同用「仓储协作」；本技能只算柜内与货架内的空间排布。安全边界：装箱方案须现场核对重量分布与摞放限制后执行，模型不替代实际配载与安全审核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 仓储协作"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-3D-Bin-Packing-Optimization"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "把要发的箱子按尺寸和重量排进集装箱，让同样的货少用一个柜、少付一趟运费。"
user_try: "试试：黑五这批 35 种 SKU、55 个立方的货，能不能用 2 个 40HC 柜装完？给我每个箱子的摆放位置。"
whenToUse: "已有每个 SKU 的单箱尺寸、重量、发货数量与柜型规格，需要给出具体装柜排布时用；要选运输方式与时效方案用「物流方案」，要安排仓内作业协同用「仓储协作」。"
workflow: "整理 SKU 箱规、重量、数量与柜型约束 → 按体积降序排列待装箱体 → 在柜内放置并匹配合法旋转方向 → 校验载重与摞放限制并分配柜号 → 输出箱位坐标、装载率与节省估算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 3D Bin Packing Optimization — 3D 装箱优化：集装箱/货架空间利用率最大化

## ① 解决的问题

跨境卖家海运集装箱人工装载率只有65-70%每次多花一个柜子运费18000元——3D装箱优化算法智能排列商品箱子将利用率提升到85%，全年海运4-6批年化节省集装箱费用10-30万元

## ② 核心算法逻辑

3D 装箱问题（Bin Packing Problem）：

## ③ 业务应用场景

业务问题：黑五备货海运，35 种 SKU，总体积约 55 立方米，需要 2 个 40HC 集装箱（68 立方米容量）。人工装箱经验：装载率约 70%，经常需要用 3 个集装箱。3D 装箱优化目标：2 个集装箱装完，节省 1 个柜子的费用（约 $2,500）。
数据要求： - 每种 SKU 的单箱尺寸（长×宽×高，厘米）和重量 - 每种 SKU 的发货数量 - 集装箱规格和约束（重量限制/摞放限制）
预期产出： - 每种 SKU 的推荐装箱位置（3D坐标图） - 理论装载率（体积利用率） - 预计节省的集装箱数量和费用

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
集装箱利用率从 70% → 85%：每 10 柜节省 1-2 柜，¥15,000-30,000/次
年化海运备货 4-6 批：年化节省 ¥6-20 万
减少仓储占地（紧凑装载→更少货架空间）：¥2-5 万/年
年化综合 ROI：¥10-30 万
实施难度：⭐⭐☆☆☆（FFD 启发式 1 周可实现；生产级 DRL 需要 3D 模拟环境；约 2-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（214 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/logistics/3d_bin_packing_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-3D-Bin-Packing-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
3D Bin Packing Optimization
集装箱/货架空间利用率最大化
First Fit Decreasing (FFD) + 贪心优化
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Item:
    """单个商品箱子"""
    item_id: str
    length: float   # cm
    width: float
    height: float
    weight: float   # kg
    quantity: int = 1
    fragile: bool = False

    @property
    def volume(self):
        return self.length * self.width * self.height

    def get_rotations(self):
        """获取所有合法的旋转方向（6种）"""
        l, w, h = self.length, self.width, self.height
        rotations = [
            (l, w, h), (l, h, w), (w, l, h),
            (w, h, l), (h, l, w), (h, w, l),
        ]
        # 易碎品限制某些旋转
        if self.fragile:
            rotations = [(l, w, h)]  # 只允许正放
        return list(set(rotations))


@dataclass
class Container:
    """集装箱"""
    container_id: str
    length: float   # cm
    width: float
    height: float
    max_weight: float  # kg
    items_placed: list = field(default_factory=list)
    current_weight: float = 0.0

    @property
    def volume(self):
        return self.length * self.width * self.height

    @property
    def used_volume(self):
        return sum(
            p['l'] * p['w'] * p['h'] * p['quantity']
            for p in self.items_placed
        )
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.12089，但该号在 arXiv 上是《Many-Body Quantum Geometric Dipole》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 级箱规与发货量：item_id、单箱长宽高（厘米）、单箱重量（千克）、发货数量、是否易碎（易碎品限制旋转方向）；以及容器参数——集装箱或货架的长宽高、最大载重与摞放限制。

**输出**：每种 SKU 的推荐装箱位置（3D 坐标）、按柜的装柜方案与理论装载率（体积利用率）、所需集装箱数量，以及预计节省的集装箱数量与费用；供物流与仓库现场按图配载使用。

## 执行步骤

1. 收集每种 SKU 的单箱尺寸、重量、发货数量与易碎属性
2. 按整柜的容积与载重约束确定待装的箱体清单
3. 按体积从大到小排序，逐个尝试合法旋转方向放入柜内可放置点
4. 校验每柜的重量上限与摞放限制，超限则启用下一个集装箱
5. 输出每种 SKU 的箱位坐标、装载率与预计节省的柜数与费用

## 边界与不做

- 数据不满足时不用：缺单箱尺寸或重量的 SKU 无法参与排布，柜型规格不明时也算不出装载率。
- 只给装柜排布方案与利用率估算，不替代现场配载、重量分布与安全审核。
- 卡页 ROI（装载率 70%→85%、每 10 柜节省 1-2 柜、年化综合 ROI ¥10-30 万）为估算口径，落地前须用本批实际货量与运价重算。

## 技能关联

- **前置**：Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **延伸**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-Supply-Chain-Resilience-Modeling.html、Skill-Supply-Chain-Resilience-Modeling、Skill-Zone-GNN-Last-Mile-Routing.html、Skill-Zone-GNN-Last-Mile-Routing
- **可组合**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Inventory-Financing-Optimization.html、Skill-Inventory-Financing-Optimization、Skill-3D-Bin-Packing-Optimization

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-3D-Bin-Packing-Optimization`