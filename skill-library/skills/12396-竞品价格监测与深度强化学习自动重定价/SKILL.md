---
name: "p2s-real-time-competitive-repricing"
title: "Real-Time Competitive Repricing — 竞品价格监测与深度强化学习自动重定价"
description: "触发词：实时重定价、竞品监测、深度强化学习、Buy Box 争夺、价格窗口、调价护栏。何时不用：只做跟价检测与反爬防御用「价格爬取防御」；要从长期博弈维持合作价格用「重复博弈长期定价合作」。安全边界：不得与竞品合谋抬价或操纵价格，须设单次调幅与价格上下限护栏，调价建议人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 商品诊断"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Real-Time-Competitive-Repricing"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "不再机械地永远比竞品便宜几美元：让 Agent 学会旺季提价、竞品缺货时抬价，既守 Buy Box 也守利润。"
user_try: "试试：我现在永远比 Elvie 低 $5，旺季每件少赚 $10，帮我搭一版按市场状态决策的实时重定价策略。"
whenToUse: "当竞争激烈、Buy Box 频繁易手，需要按小时级市场状态动态调价时用本技能；若只是检测与防御竞品爬价，用「价格爬取防御」；若要维持寡头高价合作，用「重复博弈长期定价合作」。"
workflow: "接入竞品价格监测与自身库存、转化率数据 → 把市场状态编码成状态向量：价格比、库存天数、近 7 天转化率、时段 → 用强化学习学习最大化累积利润的调价动作 → 用价格上下限与单次调幅护栏裁剪决策 → 上线后持续观察 Buy Box 持有率与客单价变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Real-Time Competitive Repricing — 竞品价格监测与深度强化学习自动重定价

## ① 解决的问题

Momcozy M5 与 3 个竞品争夺 Buy Box，"永远低于 Elvie $5"策略导致旺季每件少赚 $10——DRL 动态重定价识别最优价格窗口，旺季 Buy Box 持有率保持 >85% 同时 ASP 提升 8-12%，年化 GMV 增量 30-60 万元

## ② 核心算法逻辑

传统规则型重定价（"比竞品低 $2"）有两个致命缺陷：反应慢（竞品改价后才响应）和无利润意识（只追求 Buy Box，可能把利润打穿）。深度强化学习（DRL）把重定价建模为马尔可夫决策过程：Agent 不断观察市场状态，学习在不同竞争环境下最大化累积利润（而非单次销售）。

## ③ 业务应用场景

业务问题：Momcozy M5 在 Amazon 与 3 个竞品共享 Buy Box，当前策略是"永远低于 Elvie $5"，导致旺季明明可以卖 $94.99 却只卖 $84.99，每件少赚 $10。
DRL 重定价的优势： - 旺季（黑五前 2 周）：竞品也在备货，对价格不敏感 → DRL 学到可以提价 $8-12 而不失 Buy Box - 平日夜间（0-6 点）：流量低，Buy Box 争夺不激烈 → DRL 可以轻微提价保护毛利 - 竞品缺货时：DRL 快速抬价，临时垄断利润
三轨验证： - 成本：Keepa API 订阅费约 $50-200/月；每小时爬虫运行需 1 台轻量云服务器（约 $30/月）；DRL 模型训练需 GPU 实例（约 $100/月，预训练后仅需推理）。总显性成本约 $180-330/月。 - 合规：Amazon 允许动态定价，但禁止"价格操纵"（如合谋抬价）。DRL 仅基于公开竞品价格和自身库存做决策，不涉及竞品间通信，符合 Amazon 定价政策。需确保不触发"价格欺诈"红线（如灾难期间大幅提价）。 - 风险：若竞品也使用类似 DRL 策略，可能形成"算法共谋"（双方同时提价或降价），引发平台审查。建议设置最大单次调价幅度（如 ±5%）和价格

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
旺季不再错过提价机会：月增 GMV 3-8%，1000 万 GMV 规模 → ¥30-80 万/年
停止无意义价格战：避免非高峰期无效降价损失毛利 ¥10-30 万/年
新品定价学习加速：30 天内找到最优价格区间（vs 手动 90 天）
年化综合 ROI：¥50-150 万
实施难度：⭐⭐⭐☆☆（需要 Keepa API + Q-learning 实现；生产级 DQN 需要 PyTorch，2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（71 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 59)）。上文那份完整实现同样未能通过 `ast.parse`，请以实际文件为准。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/pricing/real_time_competitive_repricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Real-Time-Competitive-Repricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Real-Time Competitive Repricing — DRL 竞品重定价简化实现
基于 arXiv: 1912.02572 (Alibaba/Tmall DRL Pricing)

依赖: numpy, dataclasses (标准库)
生产环境: 替换 MockMarketEnv 为实际 Keepa/Seller Central API
"""

from dataclasses import dataclass, field
import numpy as np


@dataclass
class MarketState:
    """当前市场状态（MDP 状态向量）"""
    our_price: float
    competitor_prices: list          # 竞品价格列表
    inventory_days: float            # 库存天数
    conversion_rate_7d: float        # 近7天转化率
    hour_of_day: int                 # 当前时段
    day_of_week: int                 # 星期几（0=周一）
    price_floor: float               # SKU 最低盈亏平衡价
    price_ceiling: float             # 最高心理价位

    @property
    def competitor_min(self) -> float:
        return min(self.competitor_prices) if self.competitor_prices else self.our_price

    @property
    def price_ratio(self) -> float:
        return self.our_price / max(self.competitor_min, 0.01)

    def to_vector(self) -> np.ndarray:
        """状态向量化"""
        peak_hour = 1.0 if 18 <= self.hour_of_day <= 22 else 0.0
        weekend = 1.0 if self.day_of_week >= 5 else 0.0
        return np.array([
            self.price_ratio,
            self.our_price / self.price_floor if self.price_floor > 0 else 1.0,
            min(1.0, self.inventory_days / 60),
            self.conversion_rate_7d,
            peak_hour,
            weekend,
            min(1.0, len(self.competitor_prices) / 5),
        ])


@dataclass
class RepricingDecision:
    """重定价决策"""
    new_price: float
    price_change: float
    confidence: float
    reason: str


class SimpleQLearner:
    """
    简化版 Q-Learning 重定价策略
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1802.03050，但该号在 arXiv 上是《Thompson Sampling for Dynamic Pricing》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：小时级市场状态：本品与竞品价格、库存天数、近 7 天转化率、时段与星期、价格上下限（含最低盈亏平衡价）；竞品价格可来自 Keepa 等订阅数据源。

**输出**：每次调价的决策（新价格、变动幅度、置信度与理由）与面向累积利润的策略参数；供运营在护栏内确认执行。

## 执行步骤

1. 接入竞品价格监测与自身库存、转化率数据
2. 把市场状态编码成状态向量
3. 用强化学习训练最大化累积利润的调价策略
4. 用价格上下限与单次调幅护栏裁剪决策
5. 观察 Buy Box 持有率与客单价并复评策略

## 边界与不做

- 数据不满足：没有小时级竞品价格与自身库存、转化数据时状态向量不成立。
- 何时不用：爬价检测与防御用「价格爬取防御」；长期合作价格维持用「重复博弈长期定价合作」。
- 能力边界：只输出调价决策与策略参数，不含平台改价接口、爬虫采集与算力环境。
- 安全边界：禁止与竞品合谋抬价或价格操纵，须设单次调幅与价格上下限护栏，人工确认后执行。

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Elasticity-Based-Repricing-Gate.html、Skill-Elasticity-Based-Repricing-Gate、Skill-Real-Options-Product-Launch-Timing.html、Skill-Real-Options-Product-Launch-Timing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Elasticity-Based-Repricing-Gate.html、Skill-Elasticity-Based-Repricing-Gate、Skill-Real-Options-Product-Launch-Timing.html、Skill-Real-Options-Product-Launch-Timing、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment
- **可组合**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Elasticity-Based-Repricing-Gate.html、Skill-Elasticity-Based-Repricing-Gate、Skill-Real-Options-Product-Launch-Timing.html、Skill-Real-Options-Product-Launch-Timing、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Real-Time-Competitive-Repricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Real-Time-Competitive-Repricing`