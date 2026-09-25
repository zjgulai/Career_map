---
name: "p2s-nlp-sentiment-ml-pipeline"
title: "NLP Sentiment ML Pipeline — 评论情感→ML 特征工程桥梁：将 VOC 转化为可训练信号"
description: "触发词：情感特征工程、领先指标、特征矩阵、领先关系检验、需求拐点。何时不用：只需要情感极性结论本身时用情感分析与标注技能；需要用预测区间表达风险时用不确定性量化技能。安全边界：特征只用聚合后的评论信号，不把用户个人信息写入训练特征。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 需求预测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-NLP-Sentiment-ML-Pipeline"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把评论情感按周汇成能进预测模型的表格，让口碑变化比销量更早提示需求拐点。"
user_try: "试试：把这 12 个月的评论情感按周聚成特征矩阵，和历史销量做领先关系检验，看哪个维度领先性最强。"
whenToUse: "已有销量预测模型、想把评论情感作为领先特征补进去时用本技能；只需要情感分析结论本身，用情感分析与标注技能。"
workflow: "按日期聚合评论情感信号 → 构造情感分、趋势与词频三类特征 → 对齐周度销量形成特征矩阵 → 做领先关系检验验证先后顺序 → 输出特征重要性供模型使用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NLP Sentiment ML Pipeline — 评论情感→ML 特征工程桥梁：将 VOC 转化为可训练信号

## ① 解决的问题

NLP提取了丰富评论情感信号但ML预测模型从未使用这些领先指标——评论情感特征工程标准化管道将情感信号转化为ML可用特征矩阵，需求预测精度提升8-15%补全图谱唯一剩余NLP-VOC↔ML基础断链

## ② 核心算法逻辑

NLP→ML 的典型工程管道：

## ③ 业务应用场景

业务问题：吸奶器的需求预测模型只用了历史销量、价格、促销日历，但"recommend 词频上升"通常比销量上升早 2 周出现（口碑传播周期）。把这个领先信号加入 Prophet/LSTM 模型，可以提前感知需求拐点。
数据要求： - 近 12 个月 ASIN 评论（含文本和日期） - 同期每日销量数据（用于训练） - 目标：构建可输入预测模型的情感特征矩阵
预期产出： - 周度情感特征矩阵（情感分×趋势×词频） - 情感特征与销量的 Granger 因果检验结果（验证领先关系） - 特征重要性分析（哪个情感维度对预测贡献最大）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
需求预测模型加入情感领先特征：精度提升 8-15%，减少备货失误 ¥5-15 万/年
价格弹性模型加入情感特征：弹性估算更准确，定价决策 ROI 提升 10%
合规风险模型加入情感特征：召回风险预测更早，避损 ¥10-50 万
年化综合 ROI：¥15-40 万
实施难度：⭐⭐☆☆☆（情感提取已有成熟工具；特征工程标准化约 1-2 周；主要工作是数据管道对接）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（183 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/nlp_voc/nlp_sentiment_ml_pipeline` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/07-NLP-VOC/Skill-NLP-Sentiment-ML-Pipeline.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
NLP Sentiment ML Pipeline
评论情感信号 → 结构化 ML 特征 （NLP-VOC ↔ ML基础 桥梁）
"""
import re
import numpy as np
from collections import defaultdict
from datetime import datetime, timedelta


# 情感词典（复用 VOC Skill 的分析结果）
POSITIVE_KEYWORDS = {
    'recommend': 1.0, 'love': 0.9, 'great': 0.8, 'excellent': 0.8,
    'perfect': 0.7, 'worth': 0.7, 'satisfied': 0.8, '推荐': 1.0, '好': 0.8,
}
NEGATIVE_KEYWORDS = {
    'disappointed': -0.9, 'broke': -0.8, 'loud': -0.7, 'expensive': -0.6,
    'waste': -0.9, 'return': -0.7, 'poor': -0.8, '差': -0.8, '贵': -0.6,
}

ASPECT_KEYWORDS = {
    'noise': ['quiet', 'silent', 'loud', 'noise', 'noisy', '噪音', '安静'],
    'suction': ['suction', 'powerful', 'strong', 'weak', '吸力'],
    'price': ['expensive', 'cheap', 'price', 'worth', '贵', '便宜', '值'],
    'quality': ['quality', 'durable', 'broke', 'sturdy', '质量', '耐用'],
    'recommend': ['recommend', 'gift', 'share', '推荐', '送礼'],
}


def extract_review_signals(reviews: list) -> dict:
    """从评论列表提取情感信号（按日期聚合）"""
    daily_signals = defaultdict(lambda: {'pos': 0, 'neg': 0, 'count': 0, 'aspects': defaultdict(list)})

    for r in reviews:
        date_str = r.get('date', '2025-01-01')
        text = r.get('text', '').lower()
        rating = r.get('rating', 3)

        # 总体情感
        pos = sum(v for kw, v in POSITIVE_KEYWORDS.items() if kw in text)
        neg = sum(abs(v) for kw, v in NEGATIVE_KEYWORDS.items() if kw in text)
        sentiment = (pos - neg) / max(pos + neg, 1e-8)

        daily_signals[date_str]['pos'] += pos
        daily_signals[date_str]['neg'] += neg
        daily_signals[date_str]['count'] += 1
        daily_signals[date_str]['star_sum'] = daily_signals[date_str].get('star_sum', 0) + rating

        # 方面情感
        for aspect, keywords in ASPECT_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    # 简单判断方向
                    aspect_sentiment = sentiment if pos >= neg else -sentiment
                    daily_signals[date_str]['aspects'][aspect].append(aspect_sentiment)
                    break

    return daily_signals
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.15234，但该号在 arXiv 上是《Second order bosonic string effective action from $O(d,d)$》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 12 个月带日期的评论数据与同期每日销量数据，粒度到单条评论与单个自然周。

**输出**：周度情感特征矩阵（情感分、趋势、词频）、情感与销量的领先关系检验结果与特征重要性排序，供预测模型接入使用。

## 执行步骤

1. 按日期聚合评论，计算总体与方面情感
2. 构造情感分、趋势与词频三类特征
3. 把特征与周度销量对齐成特征矩阵
4. 做领先关系检验，验证情感信号是否先于销量变化
5. 输出特征重要性排序供预测模型接入

## 边界与不做

- 评论量太少或评论时间与销量时间无法对齐时，特征与领先关系都不成立；没有销量基线时不适用。
- 本技能只产出情感特征与检验结果，不训练预测模型，也不保证加入特征后精度提升幅度一致。

## 技能关联

- **前置**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Time-Series-Foundation-Model.html、Skill-Time-Series-Foundation-Model、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **可组合**：Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-NLP-Sentiment-ML-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：07-NLP-VOC　·　源卡：`Skill-NLP-Sentiment-ML-Pipeline`