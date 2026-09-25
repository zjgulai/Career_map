---
name: "p2s-promotion-logistics-surge-forecast"
title: "Promotion Logistics Surge Forecast — 大促物流爆仓预测：营销-履约联动容量规划"
description: "触发词：物流爆仓、促销峰值、运力规划、履约容量、延误预警。何时不用：需要决定大促备多少货并追踪缺口时用大促盘货S&OP流程自动化；需要按优先级分配短缺供给时用供需缺口分析与优先级分配。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 需求预测"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Promotion-Logistics-Surge-Forecast"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "把广告投放和大促倍数折成峰值单量，提前判断仓配会不会爆仓并给出扩容与运力预订建议。"
user_try: "试试：黑五广告预算提到每天 2.8 万，帮我预测各仓峰值单量和爆仓风险，并给出运力预订建议。"
whenToUse: "促销期需要把营销投放折算成峰值单量、评估仓配与运力容量风险时用本技能；决定备货量与缺口追踪用大促盘货S&OP流程自动化。"
workflow: "接入广告投放、历史促销与仓储运力数据 → 在 T-14 做首次全量峰值预测并标出高风险 SKU → 在 T-7 结合实时投放更新预测 → 按容量风险分级输出扩容与运力预订建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Promotion Logistics Surge Forecast — 大促物流爆仓预测：营销-履约联动容量规划

## ① 解决的问题

仓配经理面临促销峰值压垮履约——峰值预测将爆仓率从17%降到4%，年化省26万元

## ② 核心算法逻辑

大促期间（黑五/Prime Day/双十一），营销投放与物流履约之间存在数据孤岛：营销团队在广告平台上看到 ROAS 飙升，但仓库团队直到订单涌入才发现已超容，导致延误和差评。Promotion Logistics Surge Forecast 解决的核心问题是：基于营销投放数据提前 37 天预测物流需求峰值，驱动仓储/运力的前置性扩容决策。

## ③ 业务应用场景

业务背景：某母婴品牌黑五前 2 周开始提升广告预算，Sponsored Products 预算从 $5,000/日提升至 $28,000/日。历史经验表明黑五 GMV 约为平日 4.5 倍，但今年新增 TikTok Shop 渠道，实际 GMV 达到平日 7.2 倍，导致 DHL Express 运力严重不足，延误率 34%。
量化收益： - 避免延误率从 34% 降至 8%，减少差评 ≈ 1,240 条 - 按每条差评影响 BSR 降权 ≈ $180 GMV 损失，节省 $223,200 - 提前预订运力节省紧急加价 ≈ $38,000（旺季紧急运力溢价通常 30-50%） - 单次大促 ROI ≈ $261,200
业务背景：轻便折叠婴儿车有 12 个 SKU（颜色×尺寸），Prime Day 期间某些颜色（如薰衣草紫）历史转化率是标准黑色的 2.3 倍，但备货比例未反映这一差异，导致爆款 SKU 断货。

## ④ 输入数据要求

广告平台数据：Amazon AMS / TikTok Ads 每日预算、CTR、CVR（过去 90 天）
历史促销数据：历届大促 GMV 倍数、折扣深度、持续天数
仓储数据：当前库存、日均运力、ERP 出库记录
大促前 T-14天：第一次全量预测，识别高风险 SKU
大促前 T-7天：第二次预测（结合实时投放数据更新），触发补仓决策

## ⑤ 输出结果

广告平台数据：Amazon AMS / TikTok Ads 每日预算、CTR、CVR（过去 90 天）
历史促销数据：历届大促 GMV 倍数、折扣深度、持续天数
仓储数据：当前库存、日均运力、ERP 出库记录
大促前 T-14天：第一次全量预测，识别高风险 SKU
大促前 T-7天：第二次预测（结合实时投放数据更新），触发补仓决策

## ⑥ 业务价值 / ROI

20-40 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（444 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/marketing/promotion_logistics_surge_forecast` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Promotion-Logistics-Surge-Forecast.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Promotion Logistics Surge Forecast
整合促销需求涌浪预测 + CVaR 容量规划 + 动态扩容决策
CampaignSurge (arXiv:2411.09283) + FulfillCap (arXiv:2502.16071) + DemandDecomp-Promo (arXiv:2409.18512)
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum
import warnings
warnings.filterwarnings("ignore")


class RiskLevel(Enum):
    LOW = "low"          # CVaR < 80% 容量
    MEDIUM = "medium"    # 80% <= CVaR < 100%
    HIGH = "high"        # 100% <= CVaR < 150%
    CRITICAL = "critical"  # CVaR >= 150%


@dataclass
class CampaignConfig:
    """大促活动配置"""
    name: str                           # 活动名（黑五/Prime Day/双十一）
    start_date: str                     # 活动开始日
    duration_days: int                  # 活动持续天数
    budget_usd_daily: float             # 日均广告预算（美元）
    discount_rate: float                # 折扣深度（0~1，0.3表示7折）
    channel_weights: Dict[str, float] = field(default_factory=lambda: {"amazon": 1.0})


@dataclass
class WarehouseCapacity:
    """仓储容量配置"""
    warehouse_id: str
    current_stock: int                  # 当前库存件数
    daily_inbound_capacity: int         # 日均入库容量
    daily_outbound_capacity: int        # 日均发货容量（运力上限）
    safety_stock_ratio: float = 0.15    # 安全库存比例


@dataclass
class SKUDemandProfile:
    """SKU 需求特征"""
    sku_id: str
    baseline_daily: float               # 平日日均需求
    promo_elasticity: float             # 促销弹性（β1）
    discount_elasticity: float          # 折扣弹性（β2）
    decay_rate: float = 0.15            # 促销衰减率 γ
    historical_std: float = 0.2         # 历史需求标准差/均值


class DemandDecomposer:
    """
    促销需求分解器
    arXiv:2409.18512 DemandDecomp-Promo
    分离 baseline / promotional / spillover 三组分
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2409.18512，但该号在 arXiv 上是《Expressive Prompting: Improving Emotion Intensity and Speaker Consistency in Zero-Shot TTS》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：广告平台数据（Amazon AMS 或 TikTok Ads 的每日预算、CTR、CVR，过去 90 天）、历史促销数据（大促 GMV 倍数、折扣深度、持续天数）、仓储数据（当前库存、日均运力、ERP 出库记录）。

**输出**：各仓与各 SKU 的峰值需求预测、容量风险分级、扩容与运力预订建议（含 T-14 与 T-7 两次预测结论），供仓配与营销团队使用。

## 执行步骤

1. 接入广告投放、历史促销与仓储运力数据
2. 在 T-14 做首次全量峰值预测并标出高风险 SKU
3. 在 T-7 结合实时投放更新预测
4. 按容量风险分级输出扩容与运力预订建议

## 边界与不做

- 何时不用：需要决定备货数量并追踪缺口时用大促盘货S&OP流程自动化；需要按 SKU 优先级分配短缺供给时用供需缺口分析与优先级分配。
- 能力边界：输出峰值预测与容量建议，不代替物流商签约与仓内排班执行。
- 数据边界：新增渠道或新品的促销倍数缺少历史样本时，预测区间会明显变宽。

## 技能关联

- **前置**：Skill-Cross-Border-Last-Mile-Routing.html、Skill-Cross-Border-Last-Mile-Routing、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain
- **可组合**：Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-DARA-Agentic-MMM.html、Skill-DARA-Agentic-MMM、Skill-Last-Mile-Delivery-Prediction.html、Skill-Last-Mile-Delivery-Prediction、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Promotion-Logistics-Surge-Forecast

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：15-营销投放分析　·　源卡：`Skill-Promotion-Logistics-Surge-Forecast`