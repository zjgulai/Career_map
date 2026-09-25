---
name: "p2s-warehouse-capacity-efficiency-planning"
title: "仓容管理与仓储效率规划 — 仓容测算、仓储效率模拟与精细化5步运营"
description: "触发词：仓容测算、爆仓预警、分批入库、利用率控制。何时不用：缺少入库计划与需求预测时无法做峰值模拟；排查个别 SKU 的仓容问题用 SKU 级仓容监控类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Warehouse-Capacity-Efficiency-Planning"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "测算当前与未来仓容需求，提前规划转移与分批入库，避免旺季爆仓或被限制入库。"
user_try: "试试：Q4 备货可能爆仓，帮我测算峰值仓容并给出分流和分批入库方案。"
whenToUse: "本卡属「仓储协作」。需要从入库计划与需求预测做仓容峰值测算与规划时用本卡；排查个别 SKU 的仓容占用问题用 SKU 级仓容监控类技能。"
workflow: "计算当前仓容使用 → 确定性模拟推演到货与出货 → 识别超限峰值 → 安排转移与分批入库"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 仓容管理与仓储效率规划 — 仓容测算、仓储效率模拟与精细化5步运营

## ① 解决的问题

FBA旺季爆仓被强制移除或淡季空仓租金白付——仓容测算+双方案模拟将FBA利用率控制在82%，年化避免强制移除损失$5-8万

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中详述电商卖家两大仓容痛点——爆仓（旺季备货过多FBA仓容超限被强制移除）和空置（淡季仓容利用率不足支付固定仓储费）。FBA仓容限制（IPI指数）直接决定可以在Amazon仓储多少货；自营海外仓的固定成本要靠高利用率摊薄。书中提出精细化5步运营框架：测算→模拟→规划→执行→复盘。

## ③ 业务应用场景

场景A：Amazon FBA仓容精细化管理（避免IPI降分）
- 业务问题：某母婴卖家Q4备货过激进，10月底FBA库存超出限额，被Amazon限制入库，导致爆款无法及时补货到FBA，被迫走FBM（自发货）降低转化率 - 数据要求：所有FBA SKU的当前库存/体积/IPI分数、未来3个月入库计划、需求预测 - 算法应用： 1. 测算当前总FBA体积需求：4800ft³（FBA限额5000ft³，仅余4%余量） 2. 确定性模拟：未来4周新到货2200ft³，出货预计1800ft³ → 峰值5200ft³（超限！） 3. 规划调整：将DOI>60天的C类SKU（UV灯/旧款配件）约800ft³转移至第三方仓 4. 分批入库：将爆款Q4备货分3次入库（10
场景B：海外仓仓容利用率优化（降低固定成本摊薄）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免FBA强制移除一次损失$5-8万；优化C类转仓月节省仓储$0.5-1万；年化效益$10-15万；系统建设$3万，ROI≈400%
实施难度：⭐⭐☆☆☆（仓容测算逻辑简单，关键数据是每个SKU的体积/重量，FBA可从Seller Central导出）
优先级：⭐⭐⭐⭐☆（FBA IPI管理是所有亚马逊卖家的刚需，仓容规划是防止Q4旺季爆仓的必备能力）
适用规模：FBA库存价值>$10万或海外自营仓面积>500㎡的卖家
数据依赖：SKU体积/重量数据（FBA Inventory管理报告）、入库计划、日销量

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（265 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/warehouse_capacity_efficiency_planning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Warehouse-Capacity-Efficiency-Planning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
仓容管理与仓储效率规划系统
功能：仓容测算 + 确定性/随机模拟 + 精细化运营5步 + FBA/自营分配
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class WarehouseSKU:
    """仓储SKU信息"""
    sku_id: str
    abc_class: str
    current_stock: int
    volume_per_unit: float      # 体积（立方英尺/件 for FBA）
    weight_per_unit: float      # 重量（磅/件）
    daily_sales: float
    lead_time_days: int
    unit_storage_cost: float    # 仓储费（$/件/月）
    planned_inbound: List[Tuple[int, int]] = field(default_factory=list)  # [(days_from_now, qty)]


@dataclass
class WarehouseConfig:
    """仓库配置"""
    name: str
    capacity_ft3: float         # 总容量（立方英尺）
    utilization_target: float   # 目标利用率（0.75-0.85）
    fixed_monthly_cost: float   # 月固定成本($)
    cost_per_ft3: float         # 每立方英尺月成本($)


class WarehouseCapacityPlanner:
    """仓容管理规划器"""
    
    def __init__(self, warehouse: WarehouseConfig):
        self.wh = warehouse
        self.usable_capacity = warehouse.capacity_ft3 * warehouse.utilization_target
    
    def compute_current_usage(self, skus: List[WarehouseSKU]) -> Dict:
        """计算当前仓容使用情况"""
        total_volume = sum(sku.current_stock * sku.volume_per_unit for sku in skus)
        usage_pct = total_volume / self.wh.capacity_ft3
        usable_remaining = self.usable_capacity - total_volume
        
        by_abc = {}
        for cls in ['A', 'B', 'C']:
            cls_skus = [s for s in skus if s.abc_class == cls]
            vol = sum(s.current_stock * s.volume_per_unit for s in cls_skus)
            by_abc[cls] = {'volume': vol, 'pct': vol / max(total_volume, 1)}
        
        return {
            'total_volume': total_volume,
            'usage_pct': usage_pct,
            'usable_remaining': usable_remaining,
            'by_abc': by_abc,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2401.09237。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：所有在仓 SKU 的当前库存与体积、库存绩效分数、未来 3 个月入库计划与需求预测，以及仓库仓容上限与配置。

**输出**：当前仓容使用与利用率、未来峰值仓容预测、超限风险提示，以及低效 SKU 转移与爆款分批入库的调整方案。

## 执行步骤

1. 汇总各 SKU 库存体积计算当前仓容使用
2. 用确定性模拟推演未来到货与出货
3. 识别峰值超限的时点与缺口
4. 制定低效 SKU 转移与爆款分批入库方案
5. 输出仓容利用率控制目标与复盘指标

## 边界与不做

- 缺少入库计划或需求预测时无法做峰值模拟，不用本卡
- 本卡产出仓容规划方案，不负责实际移仓、租仓与入库下单

## 技能关联

- **前置**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-FDC-RDC-Inventory-Allocation.html、Skill-FDC-RDC-Inventory-Allocation、Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-Multi-Channel-Inventory-Sync.html、Skill-Multi-Channel-Inventory-Sync、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Flash-Sale-Realtime-Sellthrough-Forecast.html、Skill-Flash-Sale-Realtime-Sellthrough-Forecast、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Capacity-Efficiency-Planning

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：04-供应链　·　源卡：`Skill-Warehouse-Capacity-Efficiency-Planning`