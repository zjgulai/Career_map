---
name: "p2s-order-promise-date-calculation"
title: "ATP/CTP动态承诺交期计算 — 基于实时库存+PLT的订单交货承诺日期引擎"
description: "触发词：承诺交期、ATP、CTP、可承诺量、可靠性标签、批量承诺。何时不用：要在途与到货异常预警用「到货异常追踪」；补货量决策用「自动补货决策」。安全边界：承诺日期对外可见，须以真实可用量与前置期为依据，不得为转化率虚报交期。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-045"
l3_business: "订单协调"
l3_all: "订单协调 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/订单协调"
p2s_card_id: "Skill-Order-Promise-Date-Calculation"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "根据实时库存和前置期，给每个订单一个敢承诺、也做得到的交货日期。"
user_try: "试试：这是各仓库存、计划到货和 P85 前置期，帮我算出这批订单能承诺的交货日期。"
whenToUse: "客户下单需要立即给出交期、且库存与前置期数据可得时用；只做内部补货量决策时不涉及承诺口径。"
workflow: "由各仓在库量减预留量算出可承诺量 → 按出库时长与运输天数推算交期 → 库存不足时用前置期与计划到货推导 CTP 交期 → 标注可靠性标签并按需批量承诺"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ATP/CTP动态承诺交期计算 — 基于实时库存+PLT的订单交货承诺日期引擎

## ① 解决的问题

运营面临"承诺交期不准导致大量差评"——ATP/CTP引擎将承诺准确率从70%提升至92%，减少30%因交期不准导致的退款

## ② 核心算法逻辑

ATP（AvailabletoPromise） 和 CTP（CapabletoPromise） 是订单承诺的两个层次：

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：动态承诺日期准确率从70%→92%，减少因承诺不准导致的差评约30%；Amazon Delivery Promise准确率是Prime资格的核心指标，提升2pp可减少约5%的退款率
实施难度：⭐⭐⭐☆☆（依赖准确的库存数据和PLT参数，算法本身较清晰）
优先级评分：⭐⭐⭐⭐⭐（承诺交期直接影响转化率和客户满意度，Amazon将其列为账号健康核心指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（139 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/order_promise_date_calculation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Order-Promise-Date-Calculation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ATP/CTP 动态承诺交期计算引擎
功能：ATP计算 / CTP推导 / 承诺日期生成 / 可靠性标签 / 批量承诺
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SKUSupplyPosition:
    sku_id: str
    warehouse_id: str
    on_hand_qty: int
    reserved_qty: int
    planned_receipts: list = field(default_factory=list)  # [(date, qty)]
    plt_p85_days: float = 35.0
    daily_demand: float = 10.0

    @property
    def atp_today(self) -> int:
        return max(0, self.on_hand_qty - self.reserved_qty)

    @property
    def dos(self) -> float:
        return self.on_hand_qty / max(0.1, self.daily_demand)


@dataclass
class PromiseResult:
    order_id: str
    sku_id: str
    requested_qty: int
    promise_type: str      # ATP / CTP / PARTIAL / REJECT
    promise_date: Optional[datetime]
    available_qty: int
    reliability: str       # HIGH / MEDIUM / LOW
    reason: str
    tags: dict = field(default_factory=dict)


class PromiseDateEngine:

    TRANSIT_DAYS = {
        ("WH-NJ", "US-East"): 2, ("WH-NJ", "US-Midwest"): 4,
        ("WH-CA", "US-West"): 2, ("WH-CA", "US-East"): 5,
    }

    def calculate_promise(self, order_id: str, sku_pos: SKUSupplyPosition,
                           qty: int, destination: str, priority: str) -> PromiseResult:
        now = datetime.now()
        transit = self.TRANSIT_DAYS.get((sku_pos.warehouse_id, destination), 4)

        # 场景1: ATP充足
        if sku_pos.atp_today >= qty and sku_pos.dos >= 7:
            promise_date = now + timedelta(days=1 + transit)  # 1天出库+运输
            reliability = "HIGH" if sku_pos.dos >= 14 else "MEDIUM"
            return PromiseResult(
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2308.09823，但该号在 arXiv 上是《Stochastic Geometry Analysis of a New GSCM with Dual Visibility Regions》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 供应状态：在库量、已预留量、计划到货（日期与数量）、P85 前置期、日均需求，以及仓库到目的地的运输天数表，SKU 与仓库粒度。

**输出**：每个订单的承诺结果：承诺类型（ATP/CTP/部分满足/拒绝）、承诺日期、可满足数量、可靠性标签与理由，供下单页面与客服使用。

## 执行步骤

1. 汇总各仓在库、预留与计划到货
2. 计算可承诺量并判断 ATP 是否足够
3. ATP 不足时按前置期推导 CTP 承诺日期
4. 给出可靠性标签与部分承诺或拒绝的理由
5. 批量输出订单承诺结果

## 边界与不做

- 数据不满足时不适用：库存数据不准或前置期参数缺失时，承诺日期会系统性偏差，此时不应输出承诺。
- 能力边界：只产出承诺日期与标签，不负责库存数据治理与物流时效改善。

## 技能关联

- **前置**：Skill-Inventory-Event-Sourcing-Architecture.html、Skill-Inventory-Event-Sourcing-Architecture、Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI
- **延伸**：Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine
- **可组合**：Skill-Omnichannel-Order-Orchestration-MAS.html、Skill-Omnichannel-Order-Orchestration-MAS、Skill-On-Shelf-Availability-SKU-Matrix.html、Skill-On-Shelf-Availability-SKU-Matrix、Skill-Order-Promise-Date-Calculation

---

> 分类：业务运营/供应与履约/订单协调　·　技术族：24-标签工程　·　源卡：`Skill-Order-Promise-Date-Calculation`