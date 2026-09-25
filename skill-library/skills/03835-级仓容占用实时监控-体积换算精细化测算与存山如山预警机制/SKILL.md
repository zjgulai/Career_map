---
name: "p2s-sku-warehouse-footprint-monitoring"
title: "SKU级仓容占用实时监控 — 体积换算精细化测算与存山如山预警机制"
description: "触发词：仓容占用、体积测算、IPI优化、仓容黑洞。何时不用：缺少 SKU 包装尺寸与库存参数时无法测算；判断库存该留多少用库存分层类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-SKU-Warehouse-Footprint-Monitoring"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按 SKU 精算仓容占用，找出占仓多却不出货的仓容黑洞并给出清仓方案。"
user_try: "试试：我的 FBA IPI 掉到 430 了，帮我找出哪些 SKU 在拖累仓容。"
whenToUse: "本卡属「仓储协作」。需要 SKU 级仓容占用与体积换算、定位拖累项时用本卡；判断库存该留多少、怎么分层时用库存分层类技能。"
workflow: "采集 SKU 尺寸与库存 → 算净占用与含通道面积 → 结合周转天数算仓容密度 → 识别仓容黑洞并给清减方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SKU级仓容占用实时监控 — 体积换算精细化测算与存山如山预警机制

## ① 解决的问题

仓容管理只看总利用率忽视SKU级仓容黑洞导致FBA IPI下降——SKU级体积精确测算+两大仿真方案（确定性vs场景），识别仓容黑洞并清仓，IPI从430提升至535解除发货限制

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：书中提出了仓容管理的精细化视角——不能只看"仓库总用了多少面积"，而要看"每个SKU用了多少面积"。SKU级仓容管理能精确识别哪些SKU是"仓容黑洞"（占用面积大但销售贡献小），从而优化货位布局和库存结构。书中还提出了两种仿真方案来预测未来仓容需求。

## ③ 业务应用场景

场景A：FBA IPI（库存绩效指数）优化
- 业务问题：FBA IPI分数低于450（Amazon限制发货阈值），卖家不知道是哪几个SKU在拖累 - SKU级仓容分析： 1. 计算每个SKU的FBA库存体积和DOI 2. 发现3个C类SKU（旧款配件）DOI>120天，占用17%仓容但只贡献2%销售 3. 将这3个SKU的FBA库存清减一半（发起移除），IPI从430提升至535 - 预期产出：解除FBA发货限制，爆款SKU可以正常补货，月GMV恢复增长
- 业务问题：Q3末需要决策是否租用额外仓位（月租金$3000），但不确定Q4需求 - 方案B（场景仿真）： - 乐观（销量+25%）：Q4峰值仓容需求=现有仓容×1.42（必须租额外仓） - 基准（销量正常）：Q4峰值仓容需求=现有仓容×1.18（略爆仓，也需要额外仓） - 悲观（销量-15%）：Q4峰值仓容需求=现有仓容×0.95（不需要额外仓） - 决策：乐观+基准加起来>70%概率→租额外仓（ROI正）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：清理仓容黑洞释放20%仓位（对Amazon FBA而言=IPI改善→解除发货限制→恢复全品增长）；每月节省额外仓储费用$500-2000；系统$1万，ROI>500%
实施难度：⭐⭐☆☆☆（需要每个SKU的体积数据（从产品手册获取）；核心计算简单）
优先级：⭐⭐⭐⭐⭐（书中第五章核心模块，特别是FBA卖家的IPI管理和旺季仓容预警价值极高）
适用规模：所有有仓储的卖家（FBA/自营仓），SKU数>20个即可受益
数据依赖：SKU体积（产品手册）、当前库存数量、销售数据；FBA有效体积Amazon报告可直接下载

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（194 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/sku_warehouse_footprint_monitoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-SKU-Warehouse-Footprint-Monitoring.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SKU级仓容占用实时监控
基于《全链路管理》陈凤霞 第五章第四节
体积精细测算 + 两大仿真方案 + 仓容ROI分析
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUWarehouseProfile:
    """SKU仓储档案"""
    sku_id: str
    abc_class: str
    current_stock: int
    monthly_sales: float            # 月均销量
    unit_price: float               # 售价
    unit_volume_m3: float           # 单件体积（立方米）
    shelf_layers: int = 4           # 货架层数
    utilization_rate: float = 0.75  # 层高利用率


class SKUWarehouseFootprintMonitor:
    """SKU级仓容占用监控器"""

    def __init__(self, aisle_factor: float = 1.35):
        """aisle_factor: 通道系数（书中标准1.3-1.5）"""
        self.aisle_factor = aisle_factor

    def compute_sku_footprint(self, sku: SKUWarehouseProfile) -> Dict:
        """计算单个SKU的仓容占用"""
        # 净占用体积（不含通道）
        net_volume_m3 = sku.current_stock * sku.unit_volume_m3
        # 考虑层高利用率后的地面面积
        floor_area_m2 = net_volume_m3 / (sku.shelf_layers * sku.utilization_rate)
        # 含通道的实际占用面积
        gross_area_m2 = floor_area_m2 * self.aisle_factor

        # 仓容密度（GMV/平米）
        monthly_gmv = sku.monthly_sales * sku.unit_price
        gmv_per_sqm = monthly_gmv / max(gross_area_m2, 0.01)

        doi = sku.current_stock / max(sku.monthly_sales / 30, 0.01)

        return {
            'sku_id': sku.sku_id,
            'abc_class': sku.abc_class,
            'current_stock': sku.current_stock,
            'doi': round(doi, 1),
            'net_volume_m3': round(net_volume_m3, 3),
            'floor_area_m2': round(floor_area_m2, 2),
            'gross_area_m2': round(gross_area_m2, 2),
            'monthly_gmv': monthly_gmv,
            'gmv_per_sqm': round(gmv_per_sqm, 0),
            'warehouse_roi_grade': 'A' if gmv_per_sqm > 5000 else ('B' if gmv_per_sqm > 1500 else 'C'),
        }
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每个 SKU 的包装尺寸与件数、FBA 库存与周转天数、通道系数（行业标准 1.3 到 1.5），以及未来入库计划。

**输出**：SKU 级仓容占用与仓容密度（GMV 每平米）测算、仓容黑洞清单与清仓建议，以及峰值仓容的确定性与场景双方案预测。

## 执行步骤

1. 采集 SKU 尺寸重量与当前库存
2. 计算净占用体积与含通道的地面面积
3. 结合周转天数计算仓容密度找出低效 SKU
4. 用确定性与场景两套方案预测峰值仓容
5. 输出清减与额外仓租决策建议

## 边界与不做

- 缺少 SKU 包装尺寸或库存参数时无法测算，不用本卡
- 本卡产出仓容测算与清仓建议，不负责实际移除与租仓签约

## 技能关联

- **前置**：Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency
- **延伸**：Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Operations-KPI-Picking-Efficiency.html、Skill-Warehouse-Operations-KPI-Picking-Efficiency
- **可组合**：Skill-ITO-Three-Phase-Health-Tracking.html、Skill-ITO-Three-Phase-Health-Tracking、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-SKU-Warehouse-Footprint-Monitoring

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：04-供应链　·　源卡：`Skill-SKU-Warehouse-Footprint-Monitoring`