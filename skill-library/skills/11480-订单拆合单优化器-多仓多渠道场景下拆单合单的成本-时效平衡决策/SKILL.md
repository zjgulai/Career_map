---
name: "p2s-order-splitting-merging-optimizer"
title: "订单拆合单优化器 — 多仓多渠道场景下拆单合单的成本-时效平衡决策"
description: "触发词：拆单、合单、多仓发货、运费优化、多包裹客诉。何时不用：要查看已发包裹走到哪了用「履约跟踪」，要处理配送失败与到货异常用「到货异常追踪」；本技能只决定这一单怎么拆、怎么合。安全边界：拆单会改变客户收到的包裹数与平台时效承诺，高风险方案须先核对平台政策与客户体验，模型不直接改单。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Order-Splitting-Merging-Optimizer"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "多仓多渠道下，帮每一单在运费、时效和包裹数之间找到最划算的拆单或合单方式，减少运费和多包裹差评。"
user_try: "试试：这个订单要从两个仓发货，帮我算算拆成两包还是并成一包更划算，客户会不会因此差评？"
whenToUse: "已有订单行、履约仓与运费费率，要在拆单与合单之间做单量级决策时用；要查包裹在途进度用「履约跟踪」，要处理到货异常用「到货异常追踪」。"
workflow: "把订单展开为订单行，标注履约仓、重量与优先级 → 按仓与目的区域费率算出单包、拆单、合单三种方案成本 → 识别同一客户同日可合单的订单并套用合单折扣 → 对比总成本与预计送达天数，输出决策类型与客户影响"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 订单拆合单优化器 — 多仓多渠道场景下拆单合单的成本-时效平衡决策

## ① 解决的问题

多仓运营面临"多包裹发货增加运费和客户差评"——智能拆合单减少10%运费支出，同一客户合并发货减少Split-delivery差评

## ② 核心算法逻辑

拆单：一个订单 → 多个子订单（从不同仓发）

## ③ 业务应用场景

| 场景 | 成本/月 | 合规性 | 风险等级 | 推荐度 | |-----|--------|--------|---------|--------| | 单仓单包 | $2-5 | ✅完全 | 低 | ⭐⭐⭐⭐⭐ | | 多仓拆单 | $715-1025 | ⚠️条件 | 中 | ⭐⭐⭐⭐ | | Prime拆单 | $455 | ⚠️条件 | 高 | ⭐⭐⭐ | | 合单发货 | $308 | ✅基本 | 低-中 | ⭐⭐⭐⭐ |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：智能合单减少10%的运费支出（月均1000单×$4.5×10%=$450/月）；减少多包裹发货导致的客诉（Split delivery是差评原因之一）；扣除成本$308-1025/月后，净收益$-575~$142/月（需结合平台政策和客户体验权衡）
实施难度：⭐⭐⭐☆☆（逻辑清晰，主要是OMS集成和合规审查）
优先级评分：⭐⭐⭐⭐☆（多仓多渠道是现代跨境品牌标配，拆合单是日常必须，但需谨慎管理风险）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（164 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/order_splitting_merging_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Order-Splitting-Merging-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
订单拆合单优化器
功能：拆单条件判断 / 合单机会识别 / 成本计算 / 最优决策
"""
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class OrderLine:
    sku_id: str
    qty: int
    fulfillment_warehouse: str
    weight_kg: float
    is_oversized: bool = False
    priority: str = "STANDARD"  # PRIME / STANDARD / ECONOMY


@dataclass
class OrderRequest:
    order_id: str
    customer_id: str
    order_lines: list   # [OrderLine]
    destination_zone: str
    order_timestamp: str


@dataclass
class SplitMergeDecision:
    order_id: str
    decision_type: str   # SINGLE / SPLIT / MERGE
    sub_orders: list     # [(warehouse, [lines], cost)]
    total_cost: float
    total_packages: int
    estimated_delivery_days: float
    customer_impact: str
    tags: dict = field(default_factory=dict)


SHIPPING_RATES = {
    ("WH-NJ", "US-East"): {"STANDARD": 4.5, "OVERSIZED": 18.0},
    ("WH-CA", "US-West"): {"STANDARD": 4.2, "OVERSIZED": 16.0},
    ("WH-OH", "US-Midwest"): {"STANDARD": 4.0, "OVERSIZED": 15.0},
}

MERGE_DISCOUNT = 0.15  # 同日合并发货节省15%运费


def compute_shipping_cost(warehouse: str, zone: str, lines: list) -> float:
    total_weight = sum(l.weight_kg * l.qty for l in lines)
    has_oversized = any(l.is_oversized for l in lines)
    rate_type = "OVERSIZED" if has_oversized else "STANDARD"
    base_rate = SHIPPING_RATES.get((warehouse, zone), {}).get(rate_type, 5.0)
    return base_rate + total_weight * 0.5


def optimize_order(order: OrderRequest) -> SplitMergeDecision:
    """决定最优拆/合单策略"""
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2308.11823。
⚠️ 该号被 7 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：订单行级明细：order_id、customer_id、每行 sku_id、数量、履约仓、重量 kg、是否超规、优先级（PRIME/STANDARD/ECONOMY）、目的地区域与下单时间；另需各（仓, 目的区域）的 STANDARD 与 OVERSIZED 运费费率表，以及同日合单折扣率。

**输出**：每单输出决策类型（SINGLE 单包 / SPLIT 拆单 / MERGE 合单）、子单列表（仓、包含订单行、成本）、总成本、总包裹数、预计送达天数、客户影响说明与标签；供 OMS 执行分单，并供客服向客户解释包裹安排。

## 执行步骤

1. 把订单展开为订单行，读取每行的履约仓、重量、是否超规与优先级
2. 按仓与目的区域的费率表算出单包、拆单、合单三种方案的成本
3. 识别同一客户同日可合并的订单，套用合单折扣
4. 对比各方案总成本与预计送达天数，选出决策类型
5. 标注客户影响（包裹数与时效变化）与合规标签，输出给 OMS 执行

## 边界与不做

- 数据不满足时不用：缺履约仓、重量或运费费率的订单行算不出方案成本，不产出拆合单结论。
- 只做单量级的拆合单决策建议，不直接改单、不承诺平台 Prime 时效；高风险拆单须人工确认后再执行。
- 卡页净收益为 -575 至 142 美元/月区间（月均 1000 单、合单省 10% 运费约 450 美元/月，扣除 308-1025 美元/月成本），落地前须按本店运费与平台政策重算。

## 技能关联

- **前置**：Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine
- **延伸**：Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI
- **可组合**：Skill-Local-Order-Fulfillment-Rate-FDC.html、Skill-Local-Order-Fulfillment-Rate-FDC、Skill-Order-Accuracy-Exception-Rate-KPI.html、Skill-Order-Accuracy-Exception-Rate-KPI、Skill-Order-Splitting-Merging-Optimizer

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-Order-Splitting-Merging-Optimizer`