---
name: "p2s-eventcast-llm-event-forecasting"
title: "EventCast — LLM 事件感知需求预测：大促/节假日场景 MAE-57%"
description: "触发词：大促需求预测、事件感知、直播排期、事件贡献度、618备货。何时不用：只需搜索量领先信号做短周期修正用「需求信号Nowcasting」，按分位数做三级备货用「需求分位数预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-EventCast-LLM-Event-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把满减、直播、平台流量这些大促事件喂给模型，逐日预测活动期需求，并算清每个事件贡献了多少。"
user_try: "试试：618 前 7 天要给 A2 奶粉下 PO，帮我结合满减和直播排期预测活动期逐日需求。"
whenToUse: "本卡属需求预测中的事件驱动场景：大促与节假日需要把促销、直播、平台流量显式建模进预测时用；只做短周期信号修正用 Nowcasting 类技能，只做分位数备货用分位数预测类技能。"
workflow: "整理过去 90 天的日销量、价格与库存数据 → 录入促销、直播与平台活动事件表 → 输出大促逐日需求预测与 P10/P50/P90 区间 → 分解促销、直播与平台流量的事件贡献度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EventCast — LLM 事件感知需求预测：大促/节假日场景 MAE-57%

## ① 解决的问题

某母婴品牌618大促备货奶粉 SKU（如 A2 奶粉 900g），需提前 7 天向供应商下 PO

## ② 核心算法逻辑

核心思想：传统时序模型（ARIMA、Prophet、TFT）在大促/节假日期间严重失效，原因是分布偏移——大促期的需求量级、峰值形态与日常完全不同，历史模式无法外推。EventCast 的解法是：让 LLM 做语义推理（不做数值预测），将运营事件转化为结构化特征，再喂给专门的预测模型。

## ③ 业务应用场景

业务问题：某母婴品牌618大促备货奶粉 SKU（如 A2 奶粉 900g），需提前 7 天向供应商下 PO。传统 Prophet 模型因无法感知"满 300 减 100 + 直播预告 + 平台流量加持"，备货量误差高达 40%，导致要么断货要么积压。
数据要求： | 类型 | 字段 | 说明 | |------|------|------| | 历史数值 | daily_sales, price, stock_level | 过去 90 天销量/价格/库存 | | 促销事件 | promo_type, discount_rate, start_date, duration | 内部运营日历 | | 直播事件 | host_name, expected_viewers, time_slot | 直播排期表 | | 平台事件 | platform_flow_bonus, category_rank | Amazon/Tmall 活动数据 |
预期产出： - 大促期间（活动前 3 天 + 活动中 + 活动后 2 天）逐日需求预测 - P10/P50/P90 预测区间（用于安全库存计算） - 事件贡献度分解（促销提升量 vs 直播提升量 vs 平台流量提升量）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（333 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/eventcast_llm_event_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-EventCast-LLM-Event-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
EventCast: LLM 事件感知需求预测
论文: arXiv 2602.07695 | 2026-02
场景: 618/双11 大促备货 + 跨境节假日需求预测
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import numpy as np
from datetime import date, timedelta
from enum import Enum


class EventType(Enum):
    PROMOTION = "promotion"
    HOLIDAY = "holiday"
    LIVESTREAM = "livestream"
    PLATFORM_CAMPAIGN = "platform_campaign"


@dataclass
class BusinessEvent:
    """业务事件（LLM 推理的输入单元）"""
    event_type: EventType
    date: date
    description: str
    affected_regions: List[str]
    expected_lift: float           # 预期需求提升倍数（如 2.5 = 提升 150%）
    discount_rate: float = 0.0     # 折扣率（0.0-1.0）
    duration_days: int = 1
    confidence: float = 0.8        # 预期估计置信度


class EventKnowledgeBase:
    """事件知识库：存储和查询促销/节假日事件"""

    def __init__(self):
        self._events: List[BusinessEvent] = []

    def add_event(self, event: BusinessEvent) -> None:
        self._events.append(event)

    def query_events(
        self,
        start_date: date,
        end_date: date,
        regions: Optional[List[str]] = None,
        event_types: Optional[List[EventType]] = None,
    ) -> List[BusinessEvent]:
        """查询指定日期范围和地区的事件"""
        results = []
        for evt in self._events:
            evt_end = evt.date + timedelta(days=evt.duration_days - 1)
            if not (evt.date <= end_date and evt_end >= start_date):
                continue
            if regions and not any(r in evt.affected_regions for r in regions):
                continue
            if event_types and evt.event_type not in event_types:
                continue
            results.append(evt)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.07695 — EventCast: Hybrid Demand Forecasting in E-Commerce with LLM-Based Event Knowledge
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去 90 天的日销量、价格、库存；促销事件字段（促销类型、折扣率、开始日期、持续时长）；直播事件字段（主播、预计观看人数、时段）；平台事件数据（流量加权、类目排名）。

**输出**：大促期间（活动前 3 天、活动中、活动后 2 天）的逐日需求预测、P10/P50/P90 预测区间与事件贡献度分解，输出给大促备货与采购下单决策。

## 执行步骤

1. 整理过去 90 天的日销量、价格与库存数据。
2. 录入促销、直播与平台活动的事件表。
3. 用事件感知模型输出大促期间逐日需求预测与分位数区间。
4. 分解促销、直播与平台流量各自的事件贡献度，支撑下单决策。

## 边界与不做

- 何时不用：拿不到促销、直播或平台活动事件数据时，事件感知退化为普通时序模型，不适用本技能。
- 能力边界：事件贡献度是模型归因而非因果实验结论，事件口径变化后需重新标定；分位数区间转安全库存仍需结合资金与产能约束。

## 技能关联

- **前置**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Hierarchical-Demand-Forecasting-Reconciliation.html、Skill-Hierarchical-Demand-Forecasting-Reconciliation、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **延伸**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **可组合**：Skill-AI-Consumer-Wellbeing-Ethics.html、Skill-AI-Consumer-Wellbeing-Ethics、Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-EventCast-LLM-Event-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-EventCast-LLM-Event-Forecasting`