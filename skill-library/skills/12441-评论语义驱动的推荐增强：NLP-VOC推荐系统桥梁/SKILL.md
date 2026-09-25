---
name: "p2s-voc-driven-recommendation-signal"
title: "VOC-Driven Recommendation Signal — 评论语义驱动的推荐增强：NLP-VOC×推荐系统桥梁"
description: "触发词：VOC、评论方面情感、偏好向量、个性化重排、退货率。何时不用：要用商品评论做多模态融合推荐用「多模态产品推荐」；要按会话图预测下一件商品用「SR-GNN 会话推荐」。安全边界：评论数据用于推荐须符合平台 ToS 与授权范围；方面情感只作偏好信号，不得曲解评论原意用于夸大宣传。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 站点运营"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-VOC-Driven-Recommendation-Signal"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "用户评论里写着在乎静音，系统却还推噪音大的爆款：把评论里读出的偏好注入排序。"
user_try: "试试：从这位用户近 12 个月的评论里提取静音、便携等偏好，把静音型吸奶器从第 8 位提到前面。"
whenToUse: "当要利用评论中表达的偏好（而非仅行为）做个性化重排时用本技能；要图文多模态融合用「多模态产品推荐」；要按会话图预测下一件商品用「SR-GNN 会话推荐」。"
workflow: "提取用户历史评论的方面情感 → 汇总商品评论的方面质量画像 → 构建用户方面偏好向量 → 在现有候选集 Top-100 上做个性化重排 → 输出方面解释并跟踪 CVR 与退货率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC-Driven Recommendation Signal — 评论语义驱动的推荐增强：NLP-VOC×推荐系统桥梁

## ① 解决的问题

推荐系统对静音敏感用户推了嘈杂的热销吸奶器导致退货率高——方面情感向量注入协同过滤将静音型产品从第8位升至第2位，推荐CVR提升8-15%，年化GMV增益20-60万元

## ② 核心算法逻辑

传统协同过滤只用"谁买了什么"，忽略"为什么买"。ACFRS 框架把用户评论中的方面级情感注入推荐模型：

## ③ 业务应用场景

业务问题：搜索"breast pump"返回20个结果，但用户历史评论显示她特别在意"静音"（写了"sleep-friendly"，差评了噪音大的产品）——推荐系统完全不知道，只按购买频率排序。
数据要求： - 用户历史评论文本（近12个月） - 商品评论方面情感汇总（来自 VOC-Aspect-Sentiment-Extraction） - 现有推荐系统的候选集输出（Top 100）
预期产出： - 用户方面偏好向量（静音: 0.9, 便携: 0.7, 价格: 0.4...） - 个性化重排结果（静音型吸奶器从第8位升至第2位） - 方面解释："因为您对静音有强偏好，推荐此款 <45dB 产品"

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
搜索/推荐个性化重排：CTR 提升 12-20%，CVR 提升 8-15%
避免向"噪音敏感用户"推荐嘈杂产品：退货率降低 10-20%
年化 GMV 增益：¥20-60 万
实施难度：⭐⭐⭐☆☆（需要评论方面分析基础设施 + 推荐系统接口改造，约 3-4 周）
优先级评分：⭐⭐⭐⭐☆（填补 NLP-VOC ↔ 推荐系统完全断链；评论信号比行为数据更能解释"为什么不买"）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（134 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/voc_driven_recommendation_signal` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-VOC-Driven-Recommendation-Signal.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VOC-Driven Recommendation Signal
评论方面情感增强推荐系统（NLP-VOC × 推荐系统桥梁）
"""
import numpy as np
from collections import defaultdict


# 方面词典（母婴品类）
ASPECT_DICT = {
    '噪音': ['quiet', 'silent', 'noise', 'loud', '噪音', '安静'],
    '便携': ['portable', 'travel', 'compact', '便携', '轻便'],
    '吸力': ['suction', 'power', 'strong', '吸力', '吸奶量'],
    '价格': ['price', 'expensive', 'value', '价格', '贵', '便宜'],
    '清洁': ['clean', 'easy', 'wash', '清洗', '方便'],
}

SENTIMENT_WORDS = {
    'positive': ['good', 'great', 'love', 'excellent', 'perfect', 'best', '好', '棒', '喜欢'],
    'negative': ['bad', 'poor', 'hate', 'terrible', 'loud', 'heavy', '差', '不好', '失望'],
}


def extract_aspect_sentiment(review_text):
    """简化版方面情感提取"""
    text = review_text.lower()
    aspect_scores = {}
    for aspect, keywords in ASPECT_DICT.items():
        matched = any(kw in text for kw in keywords)
        if not matched:
            continue
        # 判断情感
        pos = sum(1 for w in SENTIMENT_WORDS['positive'] if w in text)
        neg = sum(1 for w in SENTIMENT_WORDS['negative'] if w in text)
        sentiment = (pos - neg) / (pos + neg + 1)
        aspect_scores[aspect] = round(sentiment, 2)
    return aspect_scores


def build_user_aspect_profile(user_reviews):
    """聚合用户历史评论，构建方面偏好向量"""
    aspect_accumulator = defaultdict(list)
    for review in user_reviews:
        scores = extract_aspect_sentiment(review)
        for asp, score in scores.items():
            aspect_accumulator[asp].append(score)
    # 加权平均（越强烈的情感权重越大）
    profile = {}
    for asp, scores in aspect_accumulator.items():
        abs_scores = [abs(s) for s in scores]
        weighted = sum(s * abs(s) for s in scores) / (sum(abs_scores) + 1e-8)
        profile[asp] = round(weighted, 3)
    return profile


def build_item_aspect_quality(item_reviews):
    """聚合商品评论，构建方面质量向量"""
    aspect_accumulator = defaultdict(list)
    for review in item_reviews:
        scores = extract_aspect_sentiment(review)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.15285，但该号在 arXiv 上是《Ransomware threat mitigation through network traffic analysis and machine learning techniques》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户历史评论文本（卡页示例近 12 个月）、商品评论的方面情感汇总、现有推荐系统的候选集输出（卡页示例 Top-100）；粒度为单用户 × 候选集。

**输出**：用户方面偏好向量、个性化重排结果与方面解释（如因为您对静音有强偏好，推荐此款），以及 CVR 与退货率变化；供推荐工程与运营上线评论信号。

## 执行步骤

1. 提取用户评论与商品评论的方面情感
2. 构建用户方面偏好向量与商品方面质量画像
3. 在现有候选集上做个性化重排
4. 输出方面解释文案并展示给用户
5. 跟踪 CVR 与退货率变化并迭代权重

## 边界与不做

- 数据不满足：用户与商品评论量太少、或没有现成的候选集输出时重排无从下手，先补评论信号与接口。
- 何时不用：要图文多模态融合用「多模态产品推荐」；要按会话图预测下一件商品用「SR-GNN 会话推荐」。
- 能力边界：只做偏好提取与重排，不改变召回池，也不保证卡页口径的转化提升。
- 安全边界：评论数据用于推荐须符合平台 ToS 与授权范围；方面情感只作偏好信号，不得曲解评论原意用于夸大宣传。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-VOC-Driven-Recommendation-Signal

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Driven-Recommendation-Signal`