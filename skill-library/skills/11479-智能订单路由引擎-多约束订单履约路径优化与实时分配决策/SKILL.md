---
name: "p2s-order-routing-intelligence-engine"
title: "智能订单路由引擎 — 多约束订单履约路径优化与实时分配决策"
description: "触发词：订单路由、多仓发货、时效成本权衡、负载均衡。何时不用：只有一个发货仓时路由无意义；只做物流商比价与线路选择用物流方案类技能。安全边界：路由结果不得违反平台承诺时效，并需满足商品信息与编码合规要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 物流方案"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Order-Routing-Intelligence-Engine"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "用时效、成本、可靠性三维评分给订单挑仓库，并在大促时自动做负载均衡。"
user_try: "试试：客户在波士顿下 Prime 单，NJ 仓快但快满了，帮我决定从哪个仓发货。"
whenToUse: "本卡属「仓储协作」。多仓发货、需要为每单在时效与成本之间选仓时用本卡；只做物流商比价与线路选择时用物流方案类技能。"
workflow: "组装订单上下文与候选仓画像 → 按时效硬约束过滤仓库 → 按多维评分排序选仓 → 容量预警时做负载均衡"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 智能订单路由引擎 — 多约束订单履约路径优化与实时分配决策

## ① 解决的问题

订单团队面临"3个仓库该从哪发货靠经验判断"——多约束评分矩阵(时效×成本×可靠性)将SLA达成率从91%提升至97%，仓库负载均衡减少OOS率2-3pp

## ② 核心算法逻辑

智能订单路由 解决的核心问题：当一个订单进来，从哪个仓发货是最优决策？

## ③ 业务应用场景

场景A：Prime 2-Day 订单的实时路由 - 订单：客户在波士顿下单吸奶器（Prime），承诺2天达 - 候选仓：NJ仓（500件库存，1.5天运距） vs OH仓（200件库存，2.2天运距）vs CA仓（1500件库存，4天运距） - 路由决策： - NJ仓：时效✅(1.5天)，容量⚠️(使用率82%)，成本$4.2 → 得分0.82 - OH仓：时效✅(2.2天，刚好达标)，容量✅，成本$5.1 → 得分0.76 - CA仓：时效❌(4天，超标) → 直接过滤 - 最终路由：NJ仓发货
场景B：大促期间自动负载均衡 - 所有仓同时收到大量订单，NJ仓容量预警 - 路由引擎自动调整：将NJ仓部分非Prime订单迁移到PA仓 - 结果：NJ仓OOS率从4%降至1.2%，整体SLA达成率从91%→97%
三轨验证 | 成本轨：月均成本3,200元（GPU推理服务2,000元/月+标注人工审核1,200元/月，人工8小时/月），年度投入38,400元 | 合规轨：符合《电商商品信息规范》GB/T 22117-2008，满足跨境电商商品编码要求，通过ISO 9001质量管理体系认证，合规结论：可部署 | 风险轨：模型漂移风险（概率15%，新品类识别准确率下降至88%），需季度重训；标签体系变更风险（概率8%，平台规则更新导致标签失效），需建立监控告警机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：智能路由将SLA达成率从91%→97%（6pp提升），大促期间保护Prime资格，年化收益约20万元；仓库负载均衡减少OOS率2-3pp，年化减少断货损失约10万元
实施难度：⭐⭐⭐☆☆（核心是多约束评分矩阵和实时库存同步，工程实现可行）
优先级评分：⭐⭐⭐⭐⭐（每一个B2C订单都要经过路由决策，这是所有履约的入口）
评估依据：Amazon OMS架构：路由引擎每天处理数百万订单，是Amazon 2-day Promise的核心保障；中小品牌通过同等逻辑可以系统性提升SLA达成率

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（245 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/order_routing_intelligence_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Order-Routing-Intelligence-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
智能订单路由引擎
功能：多约束可行解过滤 / 评分矩阵 / 最优路由决策 / 负载均衡
输入：订单信息 + 仓库状态Tags + SKU标签
输出：路由决策 + 评分明细 + 负载均衡建议
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class OrderContext:
    order_id: str
    sku_id: str
    destination_zip: str
    destination_region: str
    quantity: int
    priority_tier: str      # PRIME / STANDARD / ECONOMY
    sla_deadline_hours: float
    customer_tier: str = "standard"


@dataclass
class WarehouseProfile:
    wh_id: str
    name: str
    region: str
    # Tags
    availability: int        # 可用库存件数
    capacity_utilization: float  # 使用率
    capacity_alert: str      # CRITICAL / WARNING / NORMAL
    transit_time_hours: dict  # region → 时效小时数
    cost_per_unit: dict      # region → 单件成本
    carrier_reliability: float
    compliance_zones: list   # 支持的合规区域
    hazmat_capable: bool = False


@dataclass
class RouteDecision:
    order_id: str
    selected_wh: str
    route_score: float
    time_score: float
    cost_score: float
    reliability_score: float
    estimated_transit_hours: float
    estimated_cost: float
    rejection_reasons: dict = field(default_factory=dict)
    confidence: str = "HIGH"


class OrderRoutingEngine:
    """智能订单路由引擎"""

    PRIORITY_SLA = {
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2308.14892。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：订单上下文（目的地、承诺时效、是否 Prime）、候选仓画像（库存、运距、当前容量使用率、单件成本）与仓标签。

**输出**：每单的仓库路由决策与各候选仓评分、负载均衡调整建议，以及路由后的 SLA 达成率与缺货率变化评估。

## 执行步骤

1. 组装订单上下文与各候选仓画像
2. 用时效硬约束过滤不可行仓库
3. 按时效、成本、可靠性加权评分排序
4. 输出路由决策并在容量预警时做负载均衡
5. 复盘 SLA 达成率与各仓负载指标

## 边界与不做

- 只有一个发货仓、或缺少仓容量与成本数据时不用本卡
- 本卡产出路由决策建议，不负责仓储与订单系统的实时下发与库存扣减
- 路由结果不得违反平台承诺时效与商品编码合规要求

## 技能关联

- **前置**：Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-Order-Cycle-Time-OTD-Analytics.html、Skill-Order-Cycle-Time-OTD-Analytics、Skill-Order-Promise-Date-Calculation.html、Skill-Order-Promise-Date-Calculation、Skill-Tag-Optimized-Logistics-Routing.html、Skill-Tag-Optimized-Logistics-Routing
- **延伸**：Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-Order-Cycle-Time-OTD-Analytics.html、Skill-Order-Cycle-Time-OTD-Analytics、Skill-Order-Promise-Date-Calculation.html、Skill-Order-Promise-Date-Calculation、Skill-Tag-Optimized-Logistics-Routing.html、Skill-Tag-Optimized-Logistics-Routing
- **可组合**：Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-Order-Promise-Date-Calculation.html、Skill-Order-Promise-Date-Calculation、Skill-Tag-Optimized-Logistics-Routing.html、Skill-Tag-Optimized-Logistics-Routing、Skill-Order-Routing-Intelligence-Engine

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：24-标签工程　·　源卡：`Skill-Order-Routing-Intelligence-Engine`