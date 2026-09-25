---
name: "p2s-social-proof-viral-rec"
title: "Social Proof Viral Recommendation — 社交证明病毒式推荐"
description: "触发词：社交证明、KOL 背书时效、UGC 得分、退货率、动态重排。何时不用：没有 KOL 发布记录或评论流数据时无法构建时效得分；纯行为序列推荐用序列推荐技能。安全边界：背书数据须来自真实付费或自然合作，不得使用刷量数据；UGC 使用须符合平台评论政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-098"
l3_business: "达人筛选"
l3_all: "达人筛选 / 联盟运营"
l1_l2_l3: "业务运营/品牌与增长/达人筛选"
p2s_card_id: "Skill-Social-Proof-Viral-Rec"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "把达人刚发布的视频和最新的评论情绪带进推荐排序，让热度和口碑变化当天就反映到推荐位。"
user_try: "试试：用 KOL 发布日志和每日评论流，把背书得分与 UGC 情感得分合进推荐排序，看当日转化与退货率变化。"
whenToUse: "推荐排序需要纳入达人热度与评论时效时用本技能；纯行为序列推荐用序列推荐技能。"
workflow: "接入 KOL 发布日志与商品挂载对照表 → 按粉丝量与互动率计算时效加权的背书得分 → 接入每日评论流计算动态 UGC 情感得分 → 把两个得分合入推荐排序并跟踪退货率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Social Proof Viral Recommendation — 社交证明病毒式推荐

## ① 解决的问题

运营面临"KOL推荐后24h内流量峰值未被利用、错失转化窗口"——KOL背书+UGC时效融合将当日CVR提升25%、退货率从18%降至11%，年化综合贡献约200-350万元

## ② 核心算法逻辑

社交证明（Social Proof） 是母婴品类中最强的购买触发因子：妈妈群体天然依赖 KOL 推荐和其他用户真实评价降低决策不确定性。本方法将 KOL 背书强度、UGC 情感信号、病毒传播速度编码为推荐特征，实现"热度感知 × 个性化偏好"的双轨推荐。

## ③ 业务应用场景

场景1：TikTok Shop 母婴 KOL 背书融合推荐 - 业务问题：平台推荐系统只看商品历史销量，无法及时捕捉"育儿博主爆款"效应，KOL 推荐后 24h 内流量峰值利用不足，错失转化窗口 - 数据要求：TikTok KOL 发布日志（视频 ID-商品挂载-发布时间-互动数）、商品挂载 ASIN/SKU 对照表 - 预期产出：KOL 发布后 24h 内目标商品曝光量提升 400%，当日 CVR 提升 25% - 业务价值：单次 KOL 合作额外 GMV 增量约 15-30 万元；年化 10 次合作贡献约 150-300 万元
场景2：Amazon Review 社交证明得分动态更新推荐 - 业务问题：推荐系统使用 90 天静态 Review 评分，无法区分"老口碑持续好"和"近期负评爆发"；用户因推荐到口碑下滑商品导致退货率 18% - 数据要求：Amazon Review 数据流（每日新增评论）、商品 ASIN 评论时间戳、情感分类标签 - 预期产出：动态 UGC 得分替代静态评分后，退货率降至 11%，Review 好评率 4.5★+ 商品 CVR 提升 12% - 业务价值：退货率降低 7%，年化退货成本节省约 50 万元（以月均 GMV 500 万计）
**三轨验证**： - 成本：ABSA 情感分析 API 调用约 $0.001/条；KOL 数据需与 TikTok/Instagram API 对接 - 合规：KOL 背书必须为真实付费或有机合作，不得使用刷量数据；UGC 使用需符合平台评论政策 - 风险：KOL 数据依赖第三方 API（TikTok API 限速）；病毒速度特征存在噪声，需设置最小样本量门槛

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：KOL 背书时效利用提升 CVR 20-30%，UGC 时效去偏降低退货率 5-8%；年化综合贡献约 200-350 万元（含 GMV 增量+退货成本节省）
实施难度：⭐⭐⭐☆☆（数据接入是主要挑战；KOL 数据需与第三方平台对接）
优先级：⭐⭐⭐⭐⭐
评估依据：母婴品类是社交证明效应最强的品类之一，妈妈群体的"KOL 推荐"转化率是普通推荐的 3-5 倍；这是母婴跨境场景最具差异化的推荐优化策略

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（124 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import math
from datetime import datetime, timedelta

# ============================================================
# Social Proof Viral Recommendation（社交证明病毒式推荐）
# ============================================================

def kol_score(endorsements: list[dict], current_time: datetime,
              decay_days: float = 7.0) -> float:
    """
    计算商品 KOL 背书得分（时效加权）
    endorsements: [{"followers": int, "engagement_rate": float, "timestamp": datetime}]
    """
    total = 0.0
    for e in endorsements:
        influence = math.log(1 + e["followers"]) * e["engagement_rate"]
        days_ago = (current_time - e["timestamp"]).days
        recency = math.exp(-days_ago / decay_days)
        total += influence * recency
    return total

def ugc_sentiment_score(reviews: list[dict], current_time: datetime,
                         decay_days: float = 14.0) -> float:
    """
    计算 UGC 情感得分（指数时效加权平均）
    reviews: [{"sentiment": float (0-1), "timestamp": datetime}]
    """
    if not reviews:
        return 0.5  # 无评论时中性分数
    weights = []
    sentiments = []
    for r in reviews:
        days_ago = max(0, (current_time - r["timestamp"]).days)
        w = math.exp(-days_ago / decay_days)
        weights.append(w)
        sentiments.append(r["sentiment"])
    total_w = sum(weights) + 1e-9
    return sum(s * w for s, w in zip(sentiments, weights)) / total_w

def viral_velocity(mentions_7d: int, mentions_30d: int) -> float:
    """病毒传播速度：近7天提及占30天比例（越高=越热）"""
    if mentions_30d == 0:
        return 0.0
    base_rate = mentions_7d / mentions_30d
    return min(base_rate * (30 / 7), 1.0)  # 归一化到[0,1]

def social_proof_recommend(user_cf_scores: dict[str, float],
                            items_social_data: dict[str, dict],
                            current_time: datetime,
                            weights: tuple[float, float, float, float] = (0.4, 0.2, 0.25, 0.15),
                            top_n: int = 5) -> list[tuple[str, float]]:
    """
    融合 CF + KOL + UGC + 病毒速度的社交证明推荐
    weights: (CF权重, KOL权重, UGC权重, 病毒速度权重)
    """
    alpha, beta, gamma, delta = weights
    final_scores = {}

    for item, cf_score in user_cf_scores.items():
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.08521，但该号在 arXiv 上是《Magnetism measurements of two-dimensional van der Waals antiferromagnet CrPS4 using dynamic cantilever magnetometry》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：KOL 发布日志（视频 ID、挂载商品、发布时间、互动数）、商品与 ASIN/SKU 对照表、每日新增评论数据与情感分类标签。

**输出**：商品级的 KOL 背书时效得分与动态 UGC 得分、推荐排序更新结果与转化及退货率跟踪口径；供推荐系统与运营使用。

## 执行步骤

1. 接入 KOL 发布日志与商品映射
2. 计算时效加权的背书得分
3. 用每日评论流更新 UGC 情感得分
4. 把两个得分合入推荐排序
5. 跟踪当日转化与退货率变化

## 边界与不做

- 缺少 KOL 发布记录或评论流数据时不用本技能，得分没有输入。
- 本技能输出得分与排序建议，不代替推荐系统上线与评论运营。
- 安全边界：背书数据须为真实付费或自然合作，不得使用刷量数据；UGC 使用须符合平台评论政策。

## 技能关联

- **前置**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-Marketing-Driven-Recommendation.html、Skill-Marketing-Driven-Recommendation、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RLHF-Recommendation.html、Skill-RLHF-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Real-Time-Streaming-Recommendation.html、Skill-Real-Time-Streaming-Recommendation
- **延伸**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RLHF-Recommendation.html、Skill-RLHF-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-Cross-Platform-Transfer-Rec.html、Skill-Cross-Platform-Transfer-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Social-Proof-Viral-Rec

---

> 分类：业务运营/品牌与增长/达人筛选　·　技术族：05-推荐系统　·　源卡：`Skill-Social-Proof-Viral-Rec`