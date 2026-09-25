---
name: "p2s-tiktok-flash-sale-inventory-pulse"
title: "TikTok直播闪购库存脉冲管理 — 泊松实时估计 + EWMA动态补货触发"
description: "触发词：直播闪购、库存脉冲、泊松到达率、EWMA平滑、分级补货触发。何时不用：日级大促备货与广告降速用「大促库存脉冲触发」；稳态补货用「自动补货决策」。安全边界：补货建议须保留主播临时加推等人工确认环节，实时订单数据仅用于库存预测。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-TikTok-Flash-Sale-Inventory-Pulse"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "直播卖得比预想快三倍时，提前几分钟喊补货，别让主播对着空库存讲半小时。"
user_try: "试试：按这场直播的实时订单流估计消耗速率，提前预警剩余库存还能撑几分钟。"
whenToUse: "直播或闪购场景下单量在分钟级突变、备货量靠历史场次拍时用；普通大促的日级备货用「大促库存脉冲触发」。"
workflow: "接入实时订单流与当前库存 → 用滑动窗口加 EWMA 估计到达率 → 外推剩余库存可支撑时长 → 按分级阈值触发补货预警与调拨建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok直播闪购库存脉冲管理 — 泊松实时估计 + EWMA动态补货触发

## ① 解决的问题

供应链负责人面临"直播闪购10分钟卖完平时3天的量库存脉冲完全不可控"——泊松分布实时购买率估计将断货概率降低78%，年化避损$12.4万

## ② 核心算法逻辑

直播闪购的库存管理与传统电商存在本质差异：传统电商购买行为服从日内平稳分布，可用历史均值预测；直播闪购10分钟内可卖出平时3天的库存，购买行为是脉冲式非平稳到达过程。

## ③ 业务应用场景

场景A：婴儿推车TikTok直播闪购备货 - 业务问题：某美国母婴品牌直播卖婴儿推车，原备货100台，11分钟内售罄（比预期快3倍），后续30分钟主播无货可推，流量浪费约 $4,000 - 数据要求：实时订单流（含时间戳）、当前库存数量、历史闪购场次数据（3场以上） - 预期产出：提前8分钟发出补货预警，触发后备仓30台推车调拨，全场GMV提升42% - 业务价值：单场闪购避免断货损失约 $3,600，全年12场闪购年化收益约 $28,000
三轨验证： - 成本：需接入TikTok Shop API获取实时订单流（开发成本约$1,500），部署1台轻量云服务器（约$50/月），仓库WMS系统对接改造（约$800） - 合规：订单数据仅用于库存预测，不涉及用户画像或行为追踪，符合TikTok数据使用政策；不触碰Amazon平台规则（独立站/TikTok Shop场景）；GDPR下需确保订单时间戳匿名化处理 - 风险：补货触发依赖实时数据，若API延迟超过30秒可能导致误判；过度依赖算法可能忽略主播临时加推等人工因素；建议保留人工确认环节
场景B：奶粉套装闪购精准备货量预测 - 业务问题：每次闪购过度备货（卖不完积压），或备货不足（断货） - 数据要求：历史场次直播数据（UV峰值、持续时长、CVR） - 预期产出：基于历史泊松参数估计最优备货量（置信区间90%不断货），库存周转天数从45天降至22天 - 业务价值：减少过度备货资金占用约 $15,000/季度

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：假设母婴品牌月均2场TikTok闪购，每场GMV约 $5,000。断货导致的尾部流量浪费约占场GMV 15%（= $750/场）。智能补货触发使断货率从60%降至 10%，年化增量 GMV 约 $12,600；过度备货资金节约（库存周转改善）约额外贡献 $8,000/年；总ROI ≈ 10x（系统实施成本约 $2,000）
实施难度：⭐⭐☆☆☆（纯Python实现，接入订单WebSocket即可）
优先级：⭐⭐⭐⭐⭐（供应链断货是TikTok母婴品牌最高频痛点之一，立竿见影）
量化指标：告警响应时间 <30秒，预测误差 ≤ 20%，断货率目标 <10%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（230 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/tiktok_flash_sale_inventory_pulse` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-TikTok-Flash-Sale-Inventory-Pulse.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok直播闪购库存脉冲管理
泊松实时率估计 + EWMA消耗预测 + 分级补货触发
"""
import numpy as np
from collections import deque
from dataclasses import dataclass, field
from typing import List, Tuple, Optional
import time

# ─── 数据结构
@dataclass
class OrderEvent:
    timestamp: float  # Unix时间戳（秒）
    quantity: int = 1

@dataclass
class InventoryAlert:
    level: str  # "green" | "yellow" | "red" | "critical"
    message: str
    remaining_stock: int
    predicted_minutes_left: float
    recommended_action: str

# ─── 1. 泊松过程实时到达率估计器
class PoissonRateEstimator:
    """
    基于滑动窗口的泊松到达率实时估计
    使用EWMA平滑，适应直播爆点的快速变化
    """
    def __init__(self, window_sec: int = 30, alpha: float = 0.3):
        self.window_sec = window_sec
        self.alpha = alpha  # EWMA遗忘因子（越大越重视最新数据）
        self.order_buffer = deque()  # 存 (timestamp, qty)
        self.ewma_rate = 0.0  # 当前EWMA平滑后的到达率（件/秒）
        self.last_update_ts = None
    
    def add_order(self, event: OrderEvent) -> float:
        """添加新订单事件，返回更新后的到达率"""
        self.order_buffer.append(event)
        now = event.timestamp
        
        # 清理超出窗口的旧数据
        while self.order_buffer and (now - self.order_buffer[0].timestamp) > self.window_sec:
            self.order_buffer.popleft()
        
        # 计算窗口内瞬时到达率
        window_qty = sum(e.quantity for e in self.order_buffer)
        actual_window = min(self.window_sec, 
                           now - self.order_buffer[0].timestamp + 1) if self.order_buffer else self.window_sec
        instant_rate = window_qty / actual_window  # 件/秒
        
        # EWMA平滑
        if self.ewma_rate == 0.0:
            self.ewma_rate = instant_rate
        else:
            self.ewma_rate = self.alpha * instant_rate + (1 - self.alpha) * self.ewma_rate
        
        self.last_update_ts = now
        return self.ewma_rate
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.11233，但该号在 arXiv 上是《Bridge and Hint: Extending Pre-trained Language Models for Long-Range Code》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实时订单流（含时间戳与件数）、当前库存数量，以及历史闪购场次数据（3 场以上，含 UV 峰值、持续时长与转化率）。

**输出**：剩余库存与预计可支撑分钟数、分级预警（绿/黄/红/危）与建议补货量，以及单场备货量建议与库存周转改善预期，供现场调拨决策。

## 执行步骤

1. 接入直播实时订单流与当前库存
2. 用滑动窗口与 EWMA 估计实时到达率
3. 外推剩余库存可支撑时长
4. 按分级阈值触发补货预警
5. 给出调拨或补货数量建议

## 边界与不做

- 数据不满足时不适用：拿不到实时订单流（或 API 延迟超过 30 秒）、历史场次不足 3 场时，到达率估计与备货建议不可靠。
- 能力边界：只产出预警与补货建议，实际调拨、加推与人工确认由现场人员完成。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Real-Time-Inventory-Event-Stream.html、Skill-Real-Time-Inventory-Event-Stream、Skill-TikTok-Live-Real-Time-CVR-Prediction.html、Skill-TikTok-Live-Real-Time-CVR-Prediction
- **延伸**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-TikTok-Live-Real-Time-CVR-Prediction.html、Skill-TikTok-Live-Real-Time-CVR-Prediction
- **可组合**：Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-TikTok-Flash-Sale-Inventory-Pulse

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-TikTok-Flash-Sale-Inventory-Pulse`