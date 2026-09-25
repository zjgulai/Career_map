---
name: "p2s-dynamic-lot-sizing-moq"
title: "Efficient Algorithms for the Joint Replenishment Problem with Minimum Order Quantities"
description: "触发词：MOQ凑量、动态批量、联合订货、价格阶梯、采购批次成本。何时不用：只在单一 SKU 上算安全库存时用「安全库存与补货策略」；要把预算切给多个 SKU 时用「多SKU采购预算分配」。安全边界：结论只用于内部采购决策，不代签供应商合同、不改付款条款。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 采购比价"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Dynamic-Lot-Sizing-MOQ"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在最小起订量和价格阶梯之间算一笔账，决定凑量还是分批，顺带把几个 SKU 合并下单。"
user_try: "试试：这三个 SKU 的月需求、运费和价格阶梯，帮我判断该凑量拿折扣还是分批下单。"
whenToUse: "供应商给了价格阶梯与 MOQ、需要决定单批订多少或几单合并时用；需求本身还没预测出来时，先做需求预测。"
workflow: "录入需求均值与标准差、正常价与折扣价、折扣 MOQ 与最小起订量 → 用凑量判据比较持有成本加折扣价与折现后的正常价 → 计算凑量盈亏平衡需求量 → 对多 SKU 求联合最优订货间隔 → 输出方案成本对比与节省金额"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Efficient Algorithms for the Joint Replenishment Problem with Minimum Order Quantities

## ① 解决的问题

采购经理面临MOQ与现金流冲突——动态批量将采购批次成本降30%，年化省12万元

## ② 核心算法逻辑

论文：Procurement Strategies for LostSales Inventory Systems with AllUnits Discounts | 年份：2018

## ③ 业务应用场景

场景 A：MOQ=500，1000件降12%，3月需求700件
场景 B：三个 SKU 联合订货决策（合并运费 vs 分批）
- 独立运费：每 SKU $800/次；联合运费：一票 $1,200 - 三 SKU 月需求：A=200件@$35，B=150件@$28，C=80件@$42 - 联合最优间隔 T* = 1.8 个月（每 1.8 月联合下一次单） - 节省：3×$800 - $1,200 = $1,200/批次，年节省约 $8,000

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
母婴场景典型案例（MOQ=500，3月需求700件）：方案C vs 方案B 节省 ¥6,681 = $930/次
10 个 SKU × 年均 4 次采购决策 = 40 次 = 年节省约 $37,200
三 SKU 联合订货：年节省运费约 $8,000-$12,000
实施难度：⭐⭐☆☆☆（2/5）— 纯数学计算，无需机器学习
优先级评分：⭐⭐⭐⭐⭐（5/5）— 每次采购都需要，ROI 直接可量化

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（250 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/supply_chain/dynamic_lot_sizing_moq` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Dynamic-Lot-Sizing-MOQ.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Dynamic-Lot-Sizing-MOQ
基于 EJOR 2018 Q-jump (s,S) (All-Units Discount) +
    EJOR 2022 JRP with MOQ (Chugh et al.) +
    Wagner-Whitin DP (经典，1958)
母婴跨境 DTC 供应商 MOQ/价格阶梯下的动态批量决策
"""

import numpy as np
from dataclasses import dataclass
from scipy import stats


@dataclass
class LotSizingParams:
    sku_id: str
    demand_mean: float
    demand_std: float
    unit_price_normal: float
    unit_price_discount: float
    discount_moq: int
    min_order_qty: int
    holding_cost_rate: float = 0.20
    fixed_order_cost: float = 800.0
    stockout_cost_per_unit: float = 15.0
    discount_factor_per_period: float = 0.97

    @property
    def holding_cost_per_unit_per_period(self):
        return self.unit_price_normal * self.holding_cost_rate / 4


def should_jump_to_discount(params: LotSizingParams) -> tuple[bool, dict]:
    """
    EJOR 2018 凑量判据：h + p' >= α·p → 不值得凑量
    返回 (should_jump, 计算细节)
    """
    h  = params.holding_cost_per_unit_per_period
    p_prime = params.unit_price_discount
    alpha   = params.discount_factor_per_period
    p       = params.unit_price_normal

    lhs = h + p_prime
    rhs = alpha * p
    should_jump = lhs < rhs

    return should_jump, {
        "h": round(h, 4),
        "p_prime": p_prime,
        "alpha_times_p": round(rhs, 4),
        "lhs": round(lhs, 4),
        "verdict": "凑量有利 ✅" if should_jump else "不值得凑量 ❌"
    }


def breakeven_demand(params: LotSizingParams) -> float:
    """
    计算凑量盈亏平衡需求量：方案B（凑至折扣MOQ）vs 方案C（多次按小MOQ订）。
    """
    Q  = params.discount_moq
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1805.08342，但该号在 arXiv 上是《Nearest neighbor density functional estimation from inverse Laplace transform》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Procurement Strategies for LostSales Inventory Systems with AllUnits Discounts》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每个 SKU 的需求均值与标准差、正常单价、折扣单价、折扣起订量、最小起订量，以及固定订货成本、持货成本率、缺货成本与折扣折现系数。

**输出**：各方案的批量与成本对比（凑量方案与分批方案）、凑量判据结论、多 SKU 联合订货间隔与运费节省金额，供采购经理决策。

## 执行步骤

1. 录入 MOQ、价格阶梯与需求参数
2. 用凑量判据判断该批是否值得凑到折扣量
3. 算出凑量方案的盈亏平衡需求量
4. 对多个 SKU 计算联合订货间隔与运费节省
5. 输出方案成本对比与推荐批次

## 边界与不做

- 数据不满足时不适用：拿不到供应商的折扣起订量、阶梯价或固定订货成本时，凑量判据无法计算。
- 能力边界：只给出批量与成本的算术结论，不负责供应商谈判、产能锁定与实际下单。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Dynamic-Lot-Sizing-MOQ

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Dynamic-Lot-Sizing-MOQ`