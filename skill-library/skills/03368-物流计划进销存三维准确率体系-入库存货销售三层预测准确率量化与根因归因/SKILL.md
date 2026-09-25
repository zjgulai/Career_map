---
name: "p2s-logistics-plan-three-dimension-accuracy"
title: "物流计划进销存三维准确率体系 — 入库/存货/销售三层预测准确率量化与根因归因"
description: "触发词：进销存准确率、入库准确率、存货预测、件单比、误差归因。何时不用：只算单一预测精度指标、不做环节归因时用常规预测评估；要做因果层面的归因时用「供应链因果归因」。安全边界：仅用内部进销存数据，不涉用户隐私；涉奶粉等品类需符合相应食品安全与标签合规要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 供需协调"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Logistics-Plan-Three-Dimension-Accuracy"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "备货没到位时，分清是入库少了还是预测本身偏了，把责任落到具体环节，不再盲目调模型。"
user_try: "试试：用进销存三维准确率拆一下这次 Prime Day 备货缺口，看是入库环节还是预测偏差造成的。"
whenToUse: "备货结果与计划不符、需要区分入库、存货、销售三个环节责任时用；只要单点预测精度评估用常规指标；要量化多因素因果责任时用供应链因果归因。"
workflow: "按 SKU 与仓库整理计划与实际入库、库存、销售数据 → 分别计算入库准确率、存货预测准确率与销售件数准确率 → 沿误差传播链定位偏差来源环节 → 输出归因结论与针对性行动（补货或调模型）"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 物流计划进销存三维准确率体系 — 入库/存货/销售三层预测准确率量化与根因归因

## ① 解决的问题

发现备货不足时不知道是入库出问题还是预测本身偏差——进销存三维准确率（入库准确率/存货预测/销售件数）独立追踪，误差传播链精准归因，解决幽灵库存和计划失效问题

## ② 核心算法逻辑

书籍核心洞察（陈凤霞）：物流计划供应链的计划准确率，必须分"进、销、存"三个维度独立追踪，而不是只看一个综合指标。书中给出了精确定义：

## ③ 业务应用场景

- 业务问题：Prime Day前1周，运营发现备货件数比预期少15%，不知道是入库环节出了问题还是库存预测本身偏差 - 三维准确率诊断： 1. 入库准确率：计划入库3000件，实际入库2700件（90%）→入库环节损失300件 2. 存货预测准确率：预测期末库存2500件，实际2200件（88%）→库存预测偏差300件 3. 归因：存货偏差完全来自入库不足，预测模型本身是准确的 4. 行动：紧急联系供应商补货300件，不需要调整预测模型 - 预期产出：精准归因节省错误干预成本；大促缺货率从预期8%降至3%
- 业务问题：某月订单量同比增长20%，但销售件数同比增长只有8%（件单比从2.1降至1.89） - 件单比分析：件单比下降→用户从"多件购买"转变为"单件购买"→可能是大件商品（婴儿推车）占比上升，或多件优惠活动失效→针对性恢复多件购买优惠
**三轨验证** | 成本轨：FBA备货优化系统月均成本3,200元（AI预测模型维护1,500元+数据分析人工12小时×100元/小时+云计算资源200元），相比缺货损失年化45万可节省36万+，ROI达11:1 | 合规轨：符合《跨境电商商品质量管理规范》和亚马逊FBA库存政策，婴儿奶粉需满足进口食品安全证书和营养标签合规，三维需求预测基于历史销售数据+季节系数+汇率波动，合规依据：GB 10765婴幼儿配方乳粉标准 | 风险轨：预测偏差风险（概率15%）导致过度备货积压，应对措施为设置±8%预测区间；供应链中断风险（概率8%）需建立2周安全库存；汇率波动风险（概率25%）影响成本，建议锁

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：入库准确率每提升1%（减少幽灵库存），避免约$500-2000的库存虚报；销售件数准确率从75%提升至85%，减少缺货损失约$3000/月；系统建设$1.5万，ROI≈400%
实施难度：⭐⭐☆☆☆（数据已存在于WMS/OMS系统，关键是建立"进+销+存三层独立追踪"的意识和流程）
优先级：⭐⭐⭐⭐⭐（书中将其列为物流计划供应链KPI第一节，是所有其他KPI的数据基础，数据准不准直接影响所有决策质量）
适用规模：所有规模，月销售>$3万且有WMS系统的卖家
数据依赖：WMS入库记录、库存盘点数据、OMS订单数据（三个系统数据对齐是最大挑战）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/logistics_plan_three_dimension_accuracy` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Logistics-Plan-Three-Dimension-Accuracy.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
物流计划进销存三维准确率体系
基于《全链路管理》陈凤霞 第三节物流计划供应链KPI
进库准确率 + 存货预测准确率 + 销售件数预测准确率 + 件单比
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class LogisticsPlanData:
    """物流计划数据结构"""
    sku_id: str
    period: str  # 'YYYY-MM' 格式

    # 进：入库
    planned_inbound: int    # 计划入库件数
    actual_inbound: int     # 实际入库件数

    # 存：库存
    opening_stock: int      # 期初库存
    planned_closing_stock: int  # 预测期末库存
    actual_closing_stock: int   # 实际期末库存
    planned_space_sqm: float    # 计划仓容（平米）
    actual_space_sqm: float     # 实际占用仓容（平米）

    # 销：销售
    planned_sales_units: int    # 预测销售件数
    actual_sales_units: int     # 实际销售件数
    total_orders: int           # 订单数（用于件单比）


class ThreeDimensionAccuracyTracker:
    """进销存三维准确率追踪器"""

    def compute_inbound_accuracy(self, data: LogisticsPlanData) -> Dict:
        """计算入库准确率"""
        if data.planned_inbound == 0:
            return {'accuracy': None, 'status': 'N/A'}
        accuracy = data.actual_inbound / data.planned_inbound
        gap = data.actual_inbound - data.planned_inbound
        ghost_inventory_risk = max(-gap, 0)  # 系统记录>实际=幽灵库存风险

        status = '✅准确' if accuracy >= 0.97 else ('🟡轻微偏差' if accuracy >= 0.92 else '🔴偏差大')
        return {
            'planned': data.planned_inbound,
            'actual': data.actual_inbound,
            'accuracy': accuracy,
            'accuracy_pct': f"{accuracy:.1%}",
            'gap_units': gap,
            'ghost_inventory_risk': ghost_inventory_risk,
            'status': status,
            'action': '检查供应商交期和质检通过率' if accuracy < 0.95 else '正常',
        }

    def compute_inventory_accuracy(self, data: LogisticsPlanData) -> Dict:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2106.12345。
⚠️ 该号被 16 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：WMS/OMS 的计划与实际数据：计划入库量、实际入库量、期末库存预测与实际、销售件数与订单量；粒度：SKU×仓×周期。

**输出**：三维准确率指标（入库/存货/销售）、误差传播归因结论与行动建议（补货或调整模型），供物流计划与采购复盘使用；件单比分析可辅助判断商品结构变化。

## 执行步骤

1. 整理计划与实际入库、存货、销售三组数据
2. 分别计算三层准确率并与目标比对
3. 沿误差链判断偏差出自入库不足还是预测偏差
4. 输出归因结论与补货或建模的处置建议

## 边界与不做

- 数据不满足时不用：缺计划口径或实际入库记录时无法做三维拆分，只能退回单点精度评估。
- 能力边界：给出的是准确率与归因判断，不代替采购谈判与供应商补货动作。

## 技能关联

- **前置**：Skill-Business-Scale-KPI-Growth-Achievement.html、Skill-Business-Scale-KPI-Growth-Achievement、Skill-In-Transit-Inventory-Tracking-Visibility.html、Skill-In-Transit-Inventory-Tracking-Visibility、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Purchase-Sales-Inventory-3D-Tracking.html、Skill-Purchase-Sales-Inventory-3D-Tracking、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning
- **延伸**：Skill-Business-Scale-KPI-Growth-Achievement.html、Skill-Business-Scale-KPI-Growth-Achievement、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning
- **可组合**：Skill-Business-Scale-KPI-Growth-Achievement.html、Skill-Business-Scale-KPI-Growth-Achievement、Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Warehouse-Capacity-Efficiency-Planning.html、Skill-Warehouse-Capacity-Efficiency-Planning、Skill-Logistics-Plan-Three-Dimension-Accuracy

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Logistics-Plan-Three-Dimension-Accuracy`