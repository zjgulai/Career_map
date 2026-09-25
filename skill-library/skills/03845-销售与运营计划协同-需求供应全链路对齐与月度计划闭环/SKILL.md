---
name: "p2s-sop-sales-operations-planning"
title: "S&OP销售与运营计划协同 — 需求供应全链路对齐与月度计划闭环"
description: "触发词：S&OP、销售运营协同、月度盘货、需求供应对齐、预测准确率。何时不用：大促专项备货追踪与紧急补货触发用大促盘货S&OP流程自动化；供给不足时的分配决策用供需缺口分析与优先级分配。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-SOP-Sales-Operations-Planning"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把销售、采购、财务拉到同一张月度计划表上，对齐需求与供应，减少旺季缺货和淡季积压。"
user_try: "试试：按月度 S&OP 流程帮我跑一遍下三个月：需求基线、供应对齐、差距闭环和复盘口径都要。"
whenToUse: "需要按月建立需求计划、供应对齐与差距闭环的常规协同机制时用本技能；单次大促的备货追踪用大促盘货S&OP流程自动化。"
workflow: "月度盘货会前准备 SKU 级需求计划、库存与在途清单 → 生成需求基线并叠加旺季与促销调整 → 检查到货节奏并识别缺货风险 → 输出追单与舱位锁定建议并做次月偏差复盘"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# S&OP销售与运营计划协同 — 需求供应全链路对齐与月度计划闭环

## ① 解决的问题

采购/销售/财务三方各自为政导致旺季爆款缺货淡季大量积压——月度S&OP协同将预测准确率从55%提升至72%，缺货率从18%降至7%，年化收益约$18万（$50万GMV规模）

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：S&OP（Sales & Operations Planning，销售与运营计划）是连接"生意目标"与"物流履约"的桥梁。书中强调：电商供应链的核心矛盾是销售要库存充足，财务要资金效率，运营要成本最低——S&OP就是在这三者之间找到最优均衡的协同机制，每月滚动一次。

## ③ 业务应用场景

- 业务问题：某卖家月销$50万，销售团队预测与采购各做各的，备货时常"旺季爆单缺货、淡季大量积压"，年均库存积压成本$15万，缺货损失$10万 - 数据要求：历史12个月SKU级销售数据、当前库存水位、在途清单、供应商交期、促销日历 - S&OP流程执行： 1. 月度盘货会（每月25日）：30分钟，3方到场（运营/采购/财务） 2. 需求计划：Prophet预测下3个月基线，销售叠加Q4旺季+30% 3. 供应对齐：检查到货节奏，识别"9月吸奶器缺货风险" 4. 差距闭环：提前30天追加采购500件，锁定海运舱位 5. 次月复盘：实际vs预测偏差分析，调整模型参数 - 预期产出：预测准确率从
场景B：大促盘货S&OP（Prime Day/双11）
- 业务问题：大促备货完全靠"经验拍脑袋"，连续3年出现"爆款缺货、滞销款积压$30万" - 算法应用：大促专项S&OP提前8周启动：自上而下目标拆解（总GMV目标→品类→SKU）+ 自下而上盘货聚合（每个SKU历史大促数据×增长系数），两路收敛校准 - 预期产出：大促备货准确率从40%提升至68%，大促后滞销库存减少45%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月销$50万卖家，S&OP将预测准确率从55%→72%，缺货率18%→7%，年化收益$18万；系统成本$6000/年，ROI≈300x
实施难度：⭐⭐☆☆☆（流程和数据门槛低，最难的是让销售/采购/财务三方都参与月度会议）
优先级：⭐⭐⭐⭐⭐（供应链管理的顶层框架，所有其他优化的前提）
适用规模：月销>$20万、SKU数>50个的卖家强烈推荐；更小规模可用简化版（双周盘货表）
数据依赖：历史12个月SKU销售数据、库存系统实时数据、采购到货记录

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（279 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/sop_sales_operations_planning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-SOP-Sales-Operations-Planning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
S&OP销售与运营计划协同系统
功能：需求计划 + 供应对齐 + 差距闭环 + 滚动更新
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUPlan:
    """SKU计划单元"""
    sku_id: str
    category: str           # A/B/C 分类
    current_stock: int      # 当前库存
    in_transit: int         # 在途库存
    committed: int          # 已承诺订单
    daily_sales: float      # 日均销量
    lead_time_days: int     # 采购提前期
    unit_cost: float        # 单位采购成本($)
    safety_stock_days: int = 14  # 安全库存天数


@dataclass
class DemandPlan:
    """需求计划"""
    sku_id: str
    period: str             # '2026-07', '2026-08', '2026-09'
    baseline_forecast: float   # 基线预测
    sales_adjustment: float    # 销售调整系数
    final_forecast: float = 0.0
    
    def __post_init__(self):
        self.final_forecast = self.baseline_forecast * self.sales_adjustment


class SalesOperationsPlanner:
    """S&OP销售运营计划协同引擎"""
    
    def __init__(self, planning_horizon_months: int = 3):
        self.horizon = planning_horizon_months
        self.skus: Dict[str, SKUPlan] = {}
        self.demand_plans: List[DemandPlan] = []
        self.sop_results = []
    
    def add_sku(self, sku: SKUPlan):
        self.skus[sku.sku_id] = sku
    
    def add_demand_plan(self, plan: DemandPlan):
        self.demand_plans.append(plan)
    
    def compute_atp(self, sku: SKUPlan) -> float:
        """计算可承诺库存 ATP"""
        return max(sku.current_stock + sku.in_transit - sku.committed, 0)
    
    def compute_doi(self, sku: SKUPlan) -> float:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2312.09847。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史 12 个月 SKU 级销售数据、当前库存水位、在途清单、供应商交期、促销日历与 SKU 分级。

**输出**：需求计划与 ATP/DOI 口径的供应对齐结果、差距闭环行动清单、月度复盘偏差分析，供运营、采购与财务三方使用。

## 执行步骤

1. 准备 SKU 级需求计划、库存与在途数据
2. 生成需求基线并叠加旺季与促销调整
3. 检查到货节奏并识别缺货风险
4. 输出追单与舱位锁定建议并做次月偏差复盘

## 边界与不做

- 何时不用：单次大促的备货追踪与紧急补货触发用大促盘货S&OP流程自动化；短缺时的 SKU 与渠道分配用供需缺口分析与优先级分配。
- 能力边界：提供计划、ATP 与复盘口径的量化支持，跨部门承诺与会议决策仍需人工推进。
- 数据边界：需要至少 12 个月 SKU 级销售与实时库存数据，口径不统一会让预测与复盘失去可比性。

## 技能关联

- **前置**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Automated-Replenishment-Decision-Engine.html、Skill-Automated-Replenishment-Decision-Engine、Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Promo-Stocktaking-SOP-Automation.html、Skill-Promo-Stocktaking-SOP-Automation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Bullwhip-Effect-Mitigation.html、Skill-Bullwhip-Effect-Mitigation、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SOP-Sales-Operations-Planning

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：04-供应链　·　源卡：`Skill-SOP-Sales-Operations-Planning`