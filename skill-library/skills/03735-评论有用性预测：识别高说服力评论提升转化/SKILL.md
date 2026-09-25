---
name: "p2s-review-helpfulness-prediction"
title: "Review Helpfulness Prediction — 评论有用性预测：识别高说服力评论提升转化"
description: "触发词：评论有用性、评论排序、说服力评论、差评识别、产品页展示。何时不用：为 A+ 素材批量抽评论用「评论有用性排序模型」；本技能侧重产品页展示排序。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Review-Helpfulness-Prediction"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把最有说服力的评论排到最前面，买家几秒就能看懂产品的真实好坏。"
user_try: "试试：把这批评论按有用性排序，挑出 5 条最有说服力的放到产品页首位。"
whenToUse: "当产品页展示的是最新评论、需要按说服力重排并优先展示时用；为 A+ 素材批量抽优质评论用「评论有用性排序模型」。"
workflow: "提取文本特征（具体性、数字、情感极化度、优缺点平衡） → 预测每条评论的有用性分 → 选出 Top5 用于页面展示 → 单独捞出高有用性差评交给客服"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review Helpfulness Prediction — 评论有用性预测：识别高说服力评论提升转化

## ① 解决的问题

产品页默认展示最新评论但很多是无信息的'Great!'类评论转化率低——评论有用性预测模型识别最有说服力的评论展示在首位，转化率提升10-20%年化GMV增益5-20万元同时快速识别最有影响力的差评

## ② 核心算法逻辑

评论有用性的决定因素：

## ③ 业务应用场景

业务问题：独立站产品页展示5条最新评论，但最新评论质量参差不齐（"Very good!"，"Perfect!!!"）。用有用性预测模型重新排序，展示最有说服力的5条，转化率预期提升10-20%。
数据要求： - 所有产品评论（文本/评分/时间/验证购买标记） - Amazon 上同 ASIN 的"helpful"投票数（作为训练标签）
预期产出： - 每条评论的有用性评分（0-1） - Top 5 最有说服力评论 - 差评中的高有用性评论（真实痛点说明）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
展示高有用性评论：转化率提升 10-20%，月增收 ¥2-6 万
差评管理：快速识别最有影响力的差评并回应
评论运营效率：不需要人工阅读所有评论
年化综合 ROI：¥5-20 万
实施难度：⭐⭐☆☆☆（规则特征版 1 周；ML 版本需要训练数据（helpful votes）约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/review_helpfulness_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-Review-Helpfulness-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Review Helpfulness Prediction
评论有用性预测：识别高说服力评论
"""
import re
import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class Review:
    """评论数据"""
    review_id: str
    text: str
    rating: int           # 1-5星
    verified_purchase: bool
    helpful_votes: int = 0
    total_votes: int = 0
    reviewer_review_count: int = 0
    date: Optional[str] = None


def extract_text_features(text: str) -> dict:
    """提取文本特征"""
    word_count = len(text.split())
    sentences = len(re.split(r'[.!?]', text))
    # 具体性指标（数字/具体词汇）
    numbers = len(re.findall(r'\d+', text))
    specific_phrases = len(re.findall(r'\b(month|week|hour|day|year|dB|kg|oz)\b', text.lower()))
    # 情感极化度（极端表达）
    extreme_positive = len(re.findall(r'\b(amazing|perfect|absolutely|incredible|wonderful|best ever)\b', text.lower()))
    extreme_negative = len(re.findall(r'\b(terrible|horrible|awful|worst|disaster|never again)\b', text.lower()))
    # 平衡性（提到优点和缺点）
    positive_words = len(re.findall(r'\b(good|great|excellent|love|like|nice|quiet|easy|comfortable)\b', text.lower()))
    negative_words = len(re.findall(r'\b(bad|poor|disappointing|loud|difficult|broken|cheap|small)\b', text.lower()))
    balanced = (positive_words > 0 and negative_words > 0)
    # 场景描述
    scenario_words = len(re.findall(r'\b(nighttime|office|travel|hospital|work|baby|sleep|pump|use)\b', text.lower()))

    return {
        'word_count': word_count,
        'sentence_count': sentences,
        'num_numbers': numbers,
        'specificity': specific_phrases,
        'extreme_language': extreme_positive + extreme_negative,
        'balanced_review': int(balanced),
        'scenario_mentions': scenario_words,
        'avg_word_length': np.mean([len(w) for w in text.split()]) if text.split() else 0,
    }


def predict_helpfulness(review: Review) -> dict:
    """预测评论有用性分数（0-1）"""
    text_features = extract_text_features(review.text)
    score = 0.0
    factors = []

    # 1. 长度适中（50-300字最优）
    wc = text_features['word_count']
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.15234，但该号在 arXiv 上是《Exploring the Design of Collaborative Applications via the Lens of NDN Workspace》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：全部产品评论（文本、评分、时间、验证购买标记），可选同 ASIN 的有用性投票数作为训练标签。

**输出**：每条评论 0-1 有用性评分、Top5 展示清单与高有用性差评清单，供页面运营与差评响应。

## 执行步骤

1. 汇总评论并标注验证购买与投票信息
2. 提取具体性、数字、情感极化与优缺点平衡等特征
3. 预测每条评论的有用性得分
4. 按得分选出 Top5 用于页面展示
5. 单独挑出高有用性差评交给客服响应

## 边界与不做

- 何时不用：缺少投票标签时只能用规则特征版，精度下降，需说明口径
- 能力边界：只做有用性排序，不隐藏或删除差评，也不得干预评论真实性

## 技能关联

- **前置**：Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **延伸**：Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-VOC-Fraud-Review-Detection.html、Skill-VOC-Fraud-Review-Detection
- **可组合**：Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-Review-Helpfulness-Prediction

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：07-NLP-VOC　·　源卡：`Skill-Review-Helpfulness-Prediction`