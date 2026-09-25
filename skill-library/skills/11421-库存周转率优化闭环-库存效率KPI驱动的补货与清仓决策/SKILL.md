---
name: "p2s-ito-doi-inventory-turnover-optimizer"
title: "ITO/DOI库存周转率优化闭环 — 库存效率KPI驱动的补货与清仓决策"
description: "触发词：库存周转率、DOI优化、资金释放、五色灯、清仓触发、跨仓周转一致化。何时不用：大促前按盘货缺口临时补货时用「大促前盘货」；只分析供应商交期时走「采购前置期KPI」。安全边界：资金重分配与清仓建议须人工确认，自动降价还需产品方授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-ITO-DOI-Inventory-Turnover-Optimizer"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "用周转天数看清哪些货压了资金、哪些货快断了，再给出资金重分配与清仓方案。"
user_try: "试试：按各 SKU 的日销和库存算出 DOI 与五色灯，给出释放资金的采购与清仓建议。"
whenToUse: "要按库存效率 KPI 决定资金往哪挪、哪些款清仓时用；只需要某个 SKU 的补货点，用「安全库存与补货策略」。"
workflow: "按 SKU 计算当前 DOI 与目标 DOI → 用五色灯标注缺货、偏低、健康、偏高、滞销 → 对 DOI 过高的 SKU 减少采购、释放资金 → 对积压 SKU 启动阶梯促销清仓 → 统一跨仓 DOI 并给出调拨建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ITO/DOI库存周转率优化闭环 — 库存效率KPI驱动的补货与清仓决策

## ① 解决的问题

高DOI导致$17万资金压在仓库利息白付——ITO约束补货优化将库存周转从65天压缩至44天，释放资金$17.5万，ROI超1000%

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：ITO（Inventory Turnover，库存周转次数）和DOI（Days of Inventory，库存天数）是电商供应链最核心的效率指标。书中指出：库存是过程，效率是结果——过高的DOI意味着资金被压在仓库里，过低的DOI意味着频繁缺货。跨境母婴卖家的行业基准是ITO≥8次/年（DOI≤45天），优秀卖家可达ITO 12次（DOI 30天）。

## ③ 业务应用场景

- 业务问题：某卖家年销$300万，平均DOI 65天（行业基准45天），每多占用20天约$15万资金，年额外持有成本约$3万，且旺季爆款缺货（DOI仅8天）与滞销款积压同时存在 - 数据要求：所有SKU的日销量、当前库存、在途库存、采购成本 - 算法应用： 1. 计算全SKU ITO矩阵，发现A类SKU（吸奶器）DOI仅10天（偏低），C类SKU（旧款配件）DOI 150天（严重积压） 2. 资金重分配：从DOI>90天的SKU减少采购，释放$8万资金用于A类SKU加急补货 3. C类积压SKU启动阶梯促销清仓（每2周降价5%） 4. 3个月后：全品类平均DOI从65天降至44天，达行业基准
场景B：多仓库存周转一致化（FBA+海外仓）
- 业务问题：FBA仓DOI 30天（正常），自营海外仓DOI 90天（严重积压），两仓割裂导致整体效率低下 - 算法应用：统一计算跨仓DOI，发现海外仓积压的UV消毒仓可以调拨到FBA（FBA偏低SKU），减少重新采购；同时对海外仓独有滞销款启动清仓 - 预期产出：跨仓整体DOI从60天降至40天，释放$20万沉淀资金

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：年销$300万卖家，DOI从65天降至44天，释放约$17.5万资金；按20%资金成本，年省$3.5万持有成本；同时爆款缺货率降低带来GMV提升12%≈$36万；年总收益约$40万，系统成本$3万，ROI≈1300%
实施难度：⭐⭐☆☆☆（公式简单，关键是数据质量——日销量、库存数据需要准确实时）
优先级：⭐⭐⭐⭐⭐（所有供应链KPI中最直接与资金效率挂钩的指标，强烈推荐作为基础能力建设）
适用规模：所有卖家，SKU数>20个就值得系统化追踪
数据依赖：每日SKU销量、实时库存（含FBA+自营仓）、采购成本数据

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（292 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'elif' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/ito_doi_inventory_turnover_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-ITO-DOI-Inventory-Turnover-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ITO/DOI库存周转率优化闭环系统
功能：周转率计算 + 五色灯状态分类 + ITO约束补货优化 + 清仓建议
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from scipy.optimize import linprog
import warnings
warnings.filterwarnings('ignore')


@dataclass
class InventorySKU:
    """SKU库存状态"""
    sku_id: str
    abc_class: str              # A/B/C
    current_stock: int          # 当前库存（含FBA+自营）
    in_transit: int             # 在途
    daily_sales: float          # 近30天日均销量
    unit_cost: float            # 采购成本($)
    lead_time_days: int         # 采购提前期
    safety_stock_days: int      # 安全库存天数
    season_factor: float = 1.0  # 季节调整系数（旺季>1，淡季<1）
    
    @property
    def target_doi(self) -> float:
        """目标DOI = 提前期 + 安全库存"""
        return (self.lead_time_days + self.safety_stock_days) * self.season_factor
    
    @property
    def current_doi(self) -> float:
        """当前DOI（含在途）"""
        total_stock = self.current_stock + self.in_transit
        if self.daily_sales <= 0:
            return 999.0
        return total_stock / self.daily_sales
    
    @property
    def inventory_value(self) -> float:
        """当前库存价值($)"""
        return (self.current_stock + self.in_transit) * self.unit_cost
    
    @property
    def ito_annual(self) -> float:
        """年化ITO（次/年）"""
        if self.current_doi >= 999:
            return 0.0
        return 365 / self.current_doi


def classify_doi_status(sku: InventorySKU) -> Tuple[str, str]:
    """五色灯DOI状态分类"""
    doi = sku.current_doi
    target = sku.target_doi
    
    if doi <= 0 or sku.current_stock == 0:
        return 'BLACK', '⚫缺货'
    elif doi < target * 0.8:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.07334，但该号在 arXiv 上是《Differentially Private Training of Mixture of Experts Models》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：所有 SKU 的日销量、当前库存、在途库存、采购成本、采购提前期与安全库存天数，含 FBA 与自营仓，按日更新。

**输出**：全 SKU 的 ITO/DOI 矩阵与五色灯分类、资金重分配与清仓建议、跨仓周转一致化后的 DOI 目标，供供应链与运营决策。

## 执行步骤

1. 汇总各 SKU 的日销量、在库与在途库存
2. 计算当前 DOI、目标 DOI 与年化 ITO
3. 用五色灯分类标出缺货与滞销
4. 对高 DOI 的 SKU 减少采购并释放资金
5. 对积压 SKU 给出阶梯促销清仓方案

## 边界与不做

- 数据不满足时不适用：日销量或实时库存（含 FBA 与自营仓）不准确时，DOI 与五色灯会系统性判错。
- 能力边界：只产出资金重分配与清仓建议，采购调整、降价执行与实物调拨由业务系统或人工完成。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning
- **可组合**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-ITO-DOI-Inventory-Turnover-Optimizer

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-ITO-DOI-Inventory-Turnover-Optimizer`