---
name: "p2s-review-sentiment-growth-trigger"
title: "Review-Sentiment-Growth-Trigger — 评论情感趋势监控与产品迭代自动触发"
description: "触发词：情感趋势监控、7日滚动均值、迭代自动触发、评分下滑预警、方面词定位、工单创建。何时不用：要做一次性差评根因排序用「差评根因分析」；要判断某次改动造成的情感变化用「因果VOC归因」。安全边界：情感下滑须经人工二审确认后再建单，不得仅凭模型判定自动下架评论或改动商品页；评论真实性与消费者隐私须符合平台评价规范与个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 改进验证"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-Review-Sentiment-Growth-Trigger"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "评分从 4.2 掉到 3.7，别再等 3 个月——7 日滚动情感均值跌破阈值就自动建单，28 天完成改版。"
user_try: "试试：监控安抚奶嘴的评论情感趋势，连续下滑就自动建产品工单并指出问题方面词。"
whenToUse: "当需要把评分下滑转成自动触发的产品迭代动作、缩短响应周期时用本技能；若只做一次性的差评根因排序，用「差评根因分析」；若要区分是否某次改动所致，用「因果VOC归因」。"
workflow: "按日抓取评论并计算情感分 → 计算 7 日滚动情感均值与相邻变化量 → 连续低于阈值即触发 P1 或 P2 告警 → 定位集中的方面词并自动创建产品工单 → 跟踪改版后情感均值是否回升"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review-Sentiment-Growth-Trigger — 评论情感趋势监控与产品迭代自动触发

## ① 解决的问题

运营面临评分从4.2跌至3.7却不知何时该启动优化、客诉爆发后3个月才改版——7日滚动情感均值触发机制将响应时间从90天压缩到28天，年化保护转化率贡献GMV约$77,000

## ② 核心算法逻辑

论文：Temporal Sentiment Analysis for Product Monitoring | 年份：2019

## ③ 业务应用场景

- 痛点：安抚奶嘴SKU月销300单，近期评分从4.2→3.7，但运营不知道是哪个维度出问题，3个月后才启动优化。 - 监控结果：第12天7日均值跌至-0.25（触发P1），ΔS=-0.19（同时触发P2），主要集中在「BPA材质担忧」和「奶嘴脱落」两个方面词。 - 执行：自动创建产品工单「BPA-free认证标注缺失」，商品页主图添加材质安全标识，标题加入「BPA-Free Certified」，4周内7日情感均值回升至+0.08。 - 业务价值：4周响应 vs 原3个月，差评积累减少约120条，评分守住4.0线，当月转化率回升1.8pp，GMV多回收约$6,400。
三轨验证 | 成本轨：月均成本1200元（NLP模型API调用费用800元/月，人工审核12小时/月×50元/小时=600元，系统维护200元/月），ROI周期3个月（差评率下降50%，预计月增收8000元） | 合规轨：符合《电商平台商品评价规范》和《消费者权益保护法》第八条，需建立评价真实性验证机制，获得平台合规认证 | 风险轨：模型误判率8-12%（概率60%），可能误删真实差评导致消费者投诉（风险等级中），建议配置人工二审阈值
**三轨验证** | 成本轨：月均成本2800元（专业NLP团队外包服务2000元/月，人工标注训练数据20小时/月×60元/小时=1200元，数据存储与安全600元/月），ROI周期2个月（差评率持续优化至2.5%以下，预计月增收15000元） | 合规轨：需获得《数据安全法》和《个人信息保护法》双重认证，建立消费者隐私保护协议，定期进行合规审计 | 风险轨：模型过度优化导致差评过滤过度（概率40%），可能引发消费者信任危机和平台舆情风险（风险等级高），需建立差评申诉通道和透明度机制

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

响应速度：客诉爆发响应时间从90天→28天，缩短68%
实施难度：⭐⭐（词典规则+滚动均值，无需ML模型）
优先级：⭐⭐⭐⭐（直接保护转化率，对高流量SKU ROI极高）
适用品类：安全敏感型母婴品（奶嘴/奶瓶/辅食）效果最显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（121 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

# 简版VADER极性词典（母婴领域扩充）
POSITIVE_WORDS = {
    "excellent", "perfect", "love", "great", "amazing", "safe", "soft",
    "comfortable", "recommended", "quality", "durable", "gentle",
    "好用", "安全", "舒适", "推荐", "质量好", "宝宝喜欢"
}
NEGATIVE_WORDS = {
    "terrible", "awful", "horrible", "dangerous", "toxic", "broken",
    "disappointed", "waste", "cheap", "defective", "smell", "bpa",
    "差", "危险", "有毒", "质量差", "不安全", "过敏", "脱落", "担心"
}

RATING_TO_SENTIMENT = {5: 0.8, 4: 0.3, 3: 0.0, 2: -0.4, 1: -0.8}


def score_review(text: str, rating: Optional[int] = None) -> float:
    """简版情感打分：词典匹配 + 星级校准"""
    words = set(text.lower().split())
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    total = pos + neg
    text_score = (pos - neg) / total if total > 0 else 0.0
    text_score = max(-1.0, min(1.0, text_score))
    
    if rating is not None:
        star_score = RATING_TO_SENTIMENT.get(rating, 0.0)
        return 0.6 * text_score + 0.4 * star_score  # 融合
    return text_score


def compute_rolling_sentiment(
    reviews: List[Dict],  # [{"date": "2026-06-01", "text": str, "rating": int}]
    window_days: int = 7
) -> Dict[str, float]:
    """按日期聚合情感均值，返回 {date_str: avg_sentiment}"""
    daily = defaultdict(list)
    for r in reviews:
        s = score_review(r["text"], r.get("rating"))
        daily[r["date"]].append(s)
    
    daily_avg = {d: np.mean(scores) for d, scores in daily.items()}
    sorted_dates = sorted(daily_avg.keys())
    
    # 7日滚动均值
    rolling = {}
    for i, d in enumerate(sorted_dates):
        window = sorted_dates[max(0, i - window_days + 1): i + 1]
        rolling[d] = np.mean([daily_avg[w] for w in window])
    return rolling


def check_triggers(
    rolling: Dict[str, float],
    threshold_p0: float = -0.40,
    threshold_p1: float = -0.20,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.04047，但该号在 arXiv 上是《Black is to Criminal as Caucasian is to Police: Detecting and Removing Multiclass Bias in Word Embeddings》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Temporal Sentiment Analysis for Product Monitoring》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品评论流（文本、星级、时间戳）与情感词典、滚动窗口长度与 P1/P2 触发阈值配置；粒度为评论 × 日。

**输出**：7 日滚动情感均值与变化量时间序列、触发的 P1/P2 告警与自动创建的产品工单（含问题方面词与建议动作）；供运营与产品团队驱动迭代并跟踪回升情况。

## 执行步骤

1. 按日抓取评论并计算每条评论的情感分
2. 计算 7 日滚动情感均值与相邻变化量
3. 连续低于阈值时触发 P1 或 P2 告警
4. 定位集中的问题方面词并自动创建产品工单
5. 跟踪改版后情感均值回升并验证响应周期

## 边界与不做

- 数据不满足：评论量太稀疏时滚动均值抖动大，需放宽窗口或提高触发门槛。
- 何时不用：一次性根因排序用「差评根因分析」，改动因果判断用「因果VOC归因」。
- 能力边界：负责监控与触发建单，不执行商品页修改，也不自动下架评论。
- 安全边界：建单前须经人工二审确认，评论真实性与隐私须符合平台规范。

## 技能关联

- **前置**：Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring
- **延伸**：Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring
- **可组合**：Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring、Skill-Review-Sentiment-Growth-Trigger

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：07-NLP-VOC　·　源卡：`Skill-Review-Sentiment-Growth-Trigger`