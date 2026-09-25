---
name: "p2s-inventory-aging-cost-management"
title: "库龄分段管理与资金成本化 — 库存账龄结构诊断、持有成本精算与阶梯清仓触发"
description: "触发词：库龄管理、持有成本、资金成本化、清仓触发、库存账龄。何时不用：需要做批次效期预警与 FIFO 管理时用母婴产品效期管理与临期品KPI；需要做多SKU尾部风险组合优化时用CVaR库存风险组合。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 调拨清货建议"
l1_l2_l3: "业务运营/供应与履约/库存分层"
p2s_card_id: "Skill-Inventory-Aging-Cost-Management"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "把库龄分段并算清每段的持有成本，给老库存排清仓优先级，主动清比等着贬值更划算。"
user_try: "试试：用 FBA 库龄报告把这批存货分段，算出各段持有成本并排出清仓优先级和触发规则。"
whenToUse: "需要按库龄分段做持有成本精算、风险评分与阶梯清仓触发时用本技能；效期与批次预警用母婴产品效期管理与临期品KPI。"
workflow: "拉取并解析 FBA 库龄报告 → 按四段库龄统计数量与占比 → 精算各段持有成本与净残值 → 输出清仓优先级与阶梯触发规则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 库龄分段管理与资金成本化 — 库存账龄结构诊断、持有成本精算与阶梯清仓触发

## ① 解决的问题

卖家只看"总库存量"不知道其中多少是"时间炸弹"——四段库龄成本精算将90天+高危库存年额外持有成本$9.2/件可视化，主动清仓比被动等待多回收$4250/批（250件规模）

## ② 核心算法逻辑

业务背景（陈凤霞实战经验）：书中第7章专节阐述健康库存系统的核心要素：库存可视层必须包含"库龄明细"，将库存按入库时间分段（030天、3160天、6190天、91180天、180天+），每一段对应不同的风险等级和处置优先级。书中强调：库龄不是一个数字，而是一面镜子——照出选品决策、补货计划、促销执行的真实质量。

## ③ 业务应用场景

场景A：FBA库存库龄结构诊断与清仓优先级规划
- 业务问题：某母婴卖家FBA有2000件存货，感觉库存"挺多的"，但月销只有400件。不知道哪些是新货、哪些是老货，也不知道清哪些能最快释放资金 - 数据要求：FBA库龄报告（Amazon后台可下载，字段：ASIN/FNSKU/库龄区间/数量）、SKU采购成本、历史销量 - 算法应用： 1. 拉取FBA库龄报告，按四段分类：0-30天=800件（40%），31-60天=600件（30%），61-90天=350件（17.5%），90天+=250件（12.5%） 2. 精算各段持有成本：以吸奶器为例，61-90天段已累计持有成本$4.5/件，90天+累计$9.2/件 3. 风险评分：250件90
场景B：季节性品类库龄主动管理（婴儿防晒）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：100件91-180天高危库存（采购成本$38/件），提前60天清仓vs自然到期处置，每件多回收约$12，总多回收$1200；每月处理2-3批这样的批次，年化额外回收$30000+；系统建设成本$2万，ROI≈150%+（首年），后续年ROI远高于此
实施难度：⭐⭐☆☆☆（Amazon FBA库龄报告直接可下载，数据基础完善；主要工作是建立触发规则和自动提醒机制）
优先级：⭐⭐⭐⭐⭐（所有有FBA库存的卖家必备，Amazon已提供库龄报告，但绝大多数卖家没有系统化行动机制）
适用规模：FBA在架SKU>20个的卖家，所有规模均适用
数据依赖：Amazon FBA库龄报告（Seller Central > Inventory > FBA Inventory Age）、SKU采购成本、历史日销量

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（275 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/supply_chain/inventory_aging_cost_management` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Inventory-Aging-Cost-Management.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
库龄分段管理与资金成本化系统
功能：四段库龄分析 + 持有成本精算 + 风险评分 + 阶梯清仓触发
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


# ─── 库龄分段标准 ───────────────────────────────────────────────
AGING_SEGMENTS = {
    'FRESH':    (0,  30,  '🟢新鲜',   0.0,  '正常流通，无需干预'),
    'WATCH':    (31, 60,  '🔵观察',   0.30, '销速低于50%时检查竞品价格'),
    'ALERT':    (61, 90,  '🟡预警',   0.60, '触发优惠券-15% + 广告加投'),
    'DANGER':   (91, 180, '🟠高危',   0.80, '折扣-30%~40% + Deal申请'),
    'DEAD':     (181, 999,'🔴死库',   1.00, '批量出售/销毁/捐赠非常规处置'),
}

# 清仓行动规则
CLEARANCE_RULES = {
    'WATCH':  {'discount': 0.05, 'action': '小幅降价5%，增加SP广告'},
    'ALERT':  {'discount': 0.15, 'action': '优惠券-15% + 站内促销'},
    'DANGER': {'discount': 0.35, 'action': '大折扣+Deal申请+Bundle打包'},
    'DEAD':   {'discount': 0.55, 'action': '批量出售清仓商或销毁申报'},
}


@dataclass
class AgingBatch:
    """库龄批次"""
    sku_id: str
    batch_id: str
    quantity: int
    inbound_date: datetime
    unit_cost: float            # 采购成本($)
    current_price: float        # 当前售价($)
    daily_storage_fee: float    # 日均仓储费/件($)
    capital_cost_rate_annual: float = 0.20  # 资金年化成本率
    shrinkage_rate_annual: float = 0.008    # 年化损耗率

    @property
    def aging_days(self) -> int:
        return (datetime.now() - self.inbound_date).days

    @property
    def daily_holding_cost(self) -> float:
        capital = self.unit_cost * self.capital_cost_rate_annual / 365
        shrinkage = self.unit_cost * self.shrinkage_rate_annual / 365
        return capital + self.daily_storage_fee + shrinkage

    @property
    def cumulative_holding_cost(self) -> float:
        return self.daily_holding_cost * self.aging_days

    @property
    def net_residual_value(self) -> float:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2402.09812。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：FBA 库龄报告（ASIN、FNSKU、库龄区间、数量）、SKU 采购成本与历史销量数据。

**输出**：库龄结构诊断与分段占比、各段持有成本与净残值测算、风险评分与阶梯清仓优先级清单，供运营与财务团队使用。

## 执行步骤

1. 拉取并解析 FBA 库龄报告
2. 按四段库龄统计数量与占比
3. 精算各段持有成本与净残值
4. 输出清仓优先级与阶梯触发规则

## 边界与不做

- 何时不用：需要做批次效期与 FIFO 预警时用母婴产品效期管理与临期品KPI；多 SKU 尾部风险组合优化用CVaR库存风险组合。
- 能力边界：输出库龄诊断、成本测算与清仓建议，实际折扣清售、移除与销毁动作需人工执行。
- 数据边界：依赖 FBA 库龄报告与采购成本口径，缺少采购成本或销量数据时无法计算净残值与回收金额。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-ITO-DOI-Inventory-Turnover-Optimizer.html、Skill-ITO-DOI-Inventory-Turnover-Optimizer、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-Long-Tail-SKU-Clearance-Optimization.html、Skill-Long-Tail-SKU-Clearance-Optimization、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Logistics-Cost-Structure-Decomposition.html、Skill-Logistics-Cost-Structure-Decomposition、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Inventory-Aging-Cost-Management

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Inventory-Aging-Cost-Management`