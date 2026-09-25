---
name: "p2s-marketing-driven-recommendation"
title: "Marketing-Driven Recommendation — 营销活动驱动的推荐系统：Promotion-Aware 个性化协同优化"
description: "触发词：营销感知推荐、促销排序、预算利用率、折扣响应、双目标优化、促销池。何时不用：只按用户价格舒适度排序用「价格感知个性化推荐」；按个体弹性推折扣用「价格感知推荐」。安全边界：展示的促销信息须与真实状态一致（价格、时间窗、库存），不得展示已失效或不存在的折扣。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Marketing-Driven-Recommendation"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "让推荐同时看得懂促销：只把可能因为这个折扣才买的商品排给用户，别浪费曝光和预算。"
user_try: "试试：Prime Day 我有 200 个促销 SKU、折扣 15%-50%，帮我按折扣响应重排推荐并测算预算利用率。"
whenToUse: "当推荐系统要在促销池内排序、目标是同时提升促销预算利用率与成交额时用本技能；若只按用户价格舒适度排序，用「价格感知个性化推荐」；若按个体弹性推折扣，用「价格感知推荐」。"
workflow: "整理促销池商品的原始价、促销价、促销类型与起止时间 → 汇总用户历史折扣购买标记与促销效果反馈 → 估计用户折扣响应与商品相关分 → 用双目标优化融合相关性与促销增益并排序 → 用曝光点击购买反馈迭代并核对预算利用率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Marketing-Driven Recommendation — 营销活动驱动的推荐系统：Promotion-Aware 个性化协同优化

## ① 解决的问题

业务背景：母婴品类 Amazon Prime Day 期间，运营团队准备了 200 个参与促销的 SKU（折扣率 15%-50%），需要对不同用户展示「最可能因折扣购买」的商品组合，而非单纯推热销榜

## ② 核心算法逻辑

传统推荐系统的目标是最大化用户相关性（CTR/CVR），营销系统的目标是最大化 GMV 和促销 ROI。这两个目标通常分开优化，导致推荐了用户喜欢但不需要促销的商品（浪费预算），或促销了高利润商品但对用户不相关（浪费曝光）。

## ③ 业务应用场景

业务背景：母婴品类 Amazon Prime Day 期间，运营团队准备了 200 个参与促销的 SKU（折扣率 15%-50%），需要对不同用户展示「最可能因折扣购买」的商品组合，而非单纯推热销榜。
量化 ROI：促销预算 $50,000，利用率提升 35pp，间接减少预算浪费： $50,000 × 35% = $17,500 促销预算增效；GMV 增量 31.4% × baseline $200,000 = +$62,800
数据要求： - 促销池：`{item_id, original_price, promo_price, promo_type, promo_start, promo_end}` - 用户历史：含折扣购买标记（`{price_paid, original_price}`） - 促销效果反馈：`{impression_id, clicked: bool, purchased: bool}`

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

MMM 的输出（各渠道 ROI 系数）可作为 DECE 中的收益权重初值
PRME 学到的价格弹性曲线，可反馈到 MMM 的价格模型验证
两者共享营销日历配置，避免信号漂移

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（491 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：invalid syntax）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/recommendation/marketing_driven_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Marketing-Driven-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Marketing-Driven Recommendation
整合 PRME (促销感知) + DECE (双目标优化) + PRM (策略梯度协同排序)
母婴电商场景 mock 实现，含完整测试
"""

from __future__ import annotations

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum


# ── 数据模型 ─────────────────────────────────────────────────────────────

class PromoType(Enum):
    DISCOUNT = "discount"        # 直接折扣
    BUNDLE = "bundle"            # 买赠/捆绑
    COUPON = "coupon"            # 优惠券
    FLASH_SALE = "flash_sale"    # 秒杀


@dataclass
class PromotionInfo:
    """促销信息"""
    promo_id: str
    item_id: str
    original_price: float
    promo_price: float
    promo_type: PromoType
    stock_remaining: int = 9999

    @property
    def discount_rate(self) -> float:
        """折扣率 Δp"""
        return (self.original_price - self.promo_price) / self.original_price

    @property
    def margin_rate(self) -> float:
        """毛利率（mock：假设成本=原价40%）"""
        cost = self.original_price * 0.4
        return (self.promo_price - cost) / self.promo_price

    @property
    def is_available(self) -> bool:
        return self.stock_remaining > 0


@dataclass
class MarketingItem:
    """带营销属性的商品"""
    item_id: str
    title: str
    category: str
    base_embedding: np.ndarray = field(default_factory=lambda: np.random.randn(32))
    rating: float = 4.5


@dataclass
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.01837，但该号在 arXiv 上是《Extending CAM-based XAI methods for Remote Sensing Imagery Segmentation》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：促销池字段：商品标识、原价、促销价、促销类型、起止时间；用户历史含折扣购买标记（实付价与原价）；促销效果反馈含曝光、点击与购买标记；粒度为用户 × 曝光。

**输出**：面向每位用户的促销商品排序与曝光建议，以及促销预算利用率与成交额增量的测算；供大促运营与推荐系统使用。

## 执行步骤

1. 整理促销池商品与起止时间字段
2. 汇总用户折扣购买标记与效果反馈
3. 估计折扣响应与商品相关分
4. 用双目标优化融合排序并输出曝光建议
5. 用反馈迭代并核对预算利用率

## 边界与不做

- 数据不满足：没有结构化促销池字段与折扣购买标记时，无法区分促销驱动与自然购买。
- 何时不用：仅按价格舒适度排序用「价格感知个性化推荐」；按个体弹性推折扣用「价格感知推荐」。
- 能力边界：只做排序与测算，不含推荐系统上线改造与促销预算审批。
- 安全边界：展示的促销信息须与真实状态一致，不得展示失效折扣或不存在的时间窗。

## 技能关联

- **前置**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation
- **可组合**：Skill-DARA-Agentic-MMM.html、Skill-DARA-Agentic-MMM、Skill-Promotion-Demand-Decomposition.html、Skill-Promotion-Demand-Decomposition、Skill-Marketing-Driven-Recommendation

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：05-推荐系统　·　源卡：`Skill-Marketing-Driven-Recommendation`