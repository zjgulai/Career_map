---
name: "p2s-flash-sale-price-optimization"
title: "闪购定价优化 — 限时折扣期间最优折扣率与时间窗口计算"
description: "触发词：闪购定价、折扣率测算、售罄时间、限时活动、清仓窗口、秒杀策划。何时不用：多周清仓折扣路径用「折扣清仓定价优化」；按库存紧张度定价用「EMSR-b 边际库存定价」。安全边界：折扣率须满足平台要求（如 Amazon 要求不低于 15%）并相对近期售价计算，不得虚构原价或虚假限时。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 价格敏感性"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Flash-Sale-Price-Optimization"
p2s_src_domain: "17-价格优化"
p2s_code_level: "节选·不可解析"
quality_tier: "preview"
user_summary: "4 小时的闪购该怎么打折才能卖完又不亏：算清折扣率与售罄时间的最佳组合。"
user_try: "试试：我参加 Prime Day Lightning Deal，库存 500 件、窗口 4 小时、原价 $22.99，帮我算最优折扣率和预计售罄时间。"
whenToUse: "当参与限时闪购或秒杀、要在固定窗口内把有限库存卖完并最大化收益时用本技能；若要在多周窗口做阶梯式清仓，用「折扣清仓定价优化」；若按库存分层做收益定价，用「EMSR-b 边际库存定价」。"
workflow: "准备历史促销转化率（按折扣率分层）、平日销量基线与活动流量倍数 → 用需求响应函数估算各折扣率下的总需求量 → 用收益函数与售罄时间预测选最优折扣率 → 按平台折扣门槛与近期售价口径校准后报名"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 闪购定价优化 — 限时折扣期间最优折扣率与时间窗口计算

## ① 解决的问题

运营面临"闪购折扣率靠拍脑袋导致GMV未最优化"——数据驱动的最优折扣率比主观设定高出15-25% GMV，年化增收20-40万元

## ② 核心算法逻辑

闪购是有限时间窗口内的库存清仓问题：在 T 小时内，以折扣价 P_d = P_0(1d) 销售最多 Q_max 件，目标最大化总收益 R = P_d Q_sold，同时避免：折扣太深 → 过早售罄损失溢价；折扣太浅 → 结束时库存未清。

## ③ 业务应用场景

场景：婴儿湿巾 Prime Day Lightning Deal 最优折扣率
- 业务问题：参加 Prime Day Lightning Deal，库存 500 件，窗口 4 小时，正常价 $22.99，历史折扣在 20-30%，不知道哪个折扣率能实现收益最大化同时恰好售罄 - 数据要求：历史促销转化率（按折扣率分层）、正常日销量基线、Lightning Deal 流量倍数 - 预期产出：最优折扣率约 22-25%，4 小时售罄 500 件，较盲目 30% 折扣多收 $800-1200 - 业务价值：每次 Lightning Deal 多收 $800，全年 8 次活动，年化增收约 4 万元
三轨验证： - 成本：分析计算成本极低；报名 Lightning Deal 有参与费（约 $150/次） - 合规：折扣率须满足 Amazon 要求（≥15%），且相对 Recent Sales Price 计算 - 风险：库存未售罄则 Lightning Deal 位置浪费；提前售罄则损失后续曝光时间

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：相比直觉定价，数据驱动折扣率每次活动多收 $500-2000，年化 8 次活动约 3-8 万元
实施难度：⭐⭐⭐⭐☆（需历史促销数据和弹性系数标定）
优先级：⭐⭐⭐⭐☆（频繁参与平台活动的品牌必备能力）
评估依据：Prime Day Lightning Deal 曝光极其稀缺，非最优折扣率浪费一次活动机会成本极高

## ⑦ 代码节选

> **本节是源站卡页的代码预览节选，不是完整实现。**
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余代码源站未发布。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'(' was never closed）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
闪购定价优化：最优折扣率与售罄时间预测
"""
import numpy as np
from scipy.optimize import minimize_scalar
import pandas as pd
from typing import Tuple


def demand_response(
    discount_rate: float,
    base_demand_per_hour: float,
    duration_hours: float,
    traffic_multiplier: float = 4.0,
    alpha: float = 2.5,
    beta: float = 0.75,
    gamma: float = 0.5,
) -> float:
    """计算闪购期间总需求量"""
    lift = alpha * (discount_rate ** beta) * (duration_hours ** gamma) * traffic_multiplier
    return max(base_demand_per_hour * duration_hours * (1 + lift), 0)


def flash_sale_revenue(
    discount_rate: float,
    base_price: float,
    max_inventory: int,
    base_demand_per_hour: float,
    duration_hours: float,
    traffic_multiplier: float = 4.0,
) -> float:
    sale_price = base_price * (1 - discount_rate)
    demand = demand_response(discount_rate, base_demand_per_hour, duration_hours, traffic_multiplier)
    return sale_price * min(demand, max_inventory)


def predict_sellout_time(
    discount_rate: float,
    base_price: float,
    max_inventory: int,
    base_demand_per_hour: float,
    duration_hours: float,
    traffic_multiplier: float = 4.0,
) -> Tuple[float, str]:
    demand = demand_response(discount_rate, base_demand_per_hour, duration_hours, traffic_multiplier)
    dph = demand / duration_hours
    if dph <= 0:
        return float("inf"), "未售罄"
    t = max_inventory / dph
    if t >= duration_hours:
        return t, f"活动结束仍剩余库存（预计卖出 {int(demand)}/{max_inventory} 件）"
    return t, f"预计在第 {t:.1f} 小时售罄"


def optimize_flash_sale_discount(
    base_price: float,
    max_inventory: int,
    base_demand_per_hour: float,
    duration_hours: float,
    min_discount: float = 0.15,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史促销转化率（按折扣率分层）、正常日销量基线、活动流量倍数、库存量、活动时长与正常售价；粒度为 SKU × 一次活动。

**输出**：最优折扣率、预计售罄时间与活动总收益（含与直觉折扣的收益差）；供运营决定报名折扣与备货量。

## 执行步骤

1. 准备分层促销转化率与销量基线数据
2. 用需求响应函数估算各折扣率下的需求
3. 按收益与售罄时间选最优折扣率
4. 按平台折扣门槛与售价口径校准后报名

## 边界与不做

- 数据不满足：没有按折扣率分层的促销转化率时无法标定需求响应曲线。
- 何时不用：多周清仓节奏用「折扣清仓定价优化」；库存分层定价用「EMSR-b 边际库存定价」。
- 能力边界：只算折扣率与售罄预测，不含活动报名、库存调拨与广告协同。
- 安全边界：折扣率须满足平台要求并相对近期售价计算，不得虚构原价或虚假限时。

## 技能关联

- **可组合**：Skill-Flash-Sale-Price-Optimization

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：17-价格优化　·　源卡：`Skill-Flash-Sale-Price-Optimization`