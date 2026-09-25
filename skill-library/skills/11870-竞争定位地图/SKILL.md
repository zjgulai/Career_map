---
name: "p2s-voc-competitive-positioning-map"
title: "Skill-VOC-Competitive-Positioning-Map — VOC竞争定位地图"
description: "触发词：竞争定位地图、属性情感对比、差异化卖点、主图卖点重构、竞品评论分析。何时不用：只监控自家评论舆情用视频评论情感监控技能，做价格信号与保价判断用价格信号类技能，本技能对比自家与竞品的属性表现。安全边界：竞品评论须来自公开或授权渠道，不得抓取受限数据，素材与宣称不得贬低竞品或使用未证实的比较。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-086"
l3_business: "品牌定位"
l3_all: "品牌定位 / 竞品研究"
l1_l2_l3: "业务运营/品牌与增长/品牌定位"
p2s_card_id: "Skill-VOC-Competitive-Positioning-Map"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把自家和竞品的评论摆在一起比，找出真正能打出去、别人没说的卖点。"
user_try: "试试：分析我们和三个竞品的背带评论，找出优势区与劣势区属性，给出主图和标题的改造方向。"
whenToUse: "需要判断哪些属性是自己强、竞品弱的差异化机会，并据此改主图与广告标题时用本技能；只盯自家舆情用视频评论情感监控技能，价格与保价问题用价格信号类技能。"
workflow: "对齐自家与竞品的评论语料 → 按属性做情感打分 → 构建优势区、劣势区与双弱区定位图 → 选定主推差异化属性 → 重构素材与广告标题并回测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-VOC-Competitive-Positioning-Map — VOC竞争定位地图

## ① 解决的问题

品牌运营面临"凭感觉认为质量最好但广告转化率持续比竞品低15%"——VOC竞争定位矩阵识别差异化优势属性重构广告素材，30天后CTR提升28%转化率+18%，年化广告效率增值30万元

## ② 核心算法逻辑

论文：AspectBased Sentiment Analysis for Competitive Positioning | 年份：2019

## ③ 业务应用场景

场景：母婴品牌婴儿背带面临 3 个主要竞品，运营团队凭感觉认为"我们质量最好"，但广告转化率持续低于竞品 15%。
通过 VOC 竞争定位分析（共分析 4,800 条评论）： - 优势区（右下）："safety buckle"、"lumbar support" → 竞品几乎无人提及 - 劣势区（左上）："easy to put on" → 竞品 83% 正面评价，我们仅 41% - 双弱区："color options" → 消费者关注度低，不需投入
决策：将主图和 A+ 内容聚焦展示"安全扣"和"腰部支撑"，广告 Headline 改用"The Only Baby Carrier with Ergonomic Lumbar Lock"，30 天内广告 CTR 提升 28%，转化率 +18%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（113 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
import re

# VOC竞争定位地图

PRODUCT_ATTRIBUTES = {
    'safety': [r'safe\w*', r'secur\w*', r'buckle', r'certif\w*'],
    'ease_of_use': [r'easy', r'simple', r'quick', r'difficult', r'hard to'],
    'quality': [r'quality', r'durable', r'sturdy', r'broke', r'cheap'],
    'comfort': [r'comfort\w*', r'soft', r'cozy', r'pain', r'hurt'],
    'value': [r'worth', r'price', r'value', r'expensive', r'cheap'],
    'design': [r'design', r'look', r'style', r'cute', r'ugly'],
}

POSITIVE_WORDS = {'great', 'love', 'excellent', 'perfect', 'good', 'amazing', 'best', 'easy', 'comfortable', 'safe', 'recommend'}
NEGATIVE_WORDS = {'bad', 'poor', 'difficult', 'hard', 'broke', 'cheap', 'disappointed', 'return', 'worst', 'unsafe'}


def extract_attribute_sentiment(text: str) -> dict:
    """提取属性级情感分数"""
    text_lower = text.lower()
    words = set(re.findall(r'\b\w+\b', text_lower))
    pos_count = len(words & POSITIVE_WORDS)
    neg_count = len(words & NEGATIVE_WORDS)
    base_sentiment = (pos_count - neg_count) / max(1, pos_count + neg_count)

    scores = {}
    for attr, patterns in PRODUCT_ATTRIBUTES.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                scores[attr] = base_sentiment
                break
    return scores


def compute_brand_attribute_scores(reviews: pd.DataFrame, text_col: str = 'text') -> dict:
    """计算品牌各属性平均情感分"""
    attr_scores = {attr: [] for attr in PRODUCT_ATTRIBUTES}
    for text in reviews[text_col]:
        sentiment = extract_attribute_sentiment(str(text))
        for attr, score in sentiment.items():
            attr_scores[attr].append(score)

    return {attr: np.mean(scores) if scores else 0.0
            for attr, scores in attr_scores.items()}


def build_positioning_map(
    own_scores: dict,
    competitor_scores: dict,
    attribute_mentions: dict = None,
) -> pd.DataFrame:
    """构建竞争定位矩阵"""
    attrs = list(own_scores.keys())
    rows = []
    for attr in attrs:
        own = own_scores.get(attr, 0)
        comp = competitor_scores.get(attr, 0)
        mentions = attribute_mentions.get(attr, 50) if attribute_mentions else 50
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.03197，但该号在 arXiv 上是《Unified Language Model Pre-training for Natural Language Understanding and Generation》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《AspectBased Sentiment Analysis for Competitive Positioning》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：自家与竞品的评论文本及其评分（卡页案例为 4,800 条评论），以及按属性划分的关键词规则表（安全、易用、质量、舒适、价值等维度）。

**输出**：属性级情感对比与竞争定位图（优势区、劣势区、双弱区）、主推差异化属性建议，供主图、详情页内容与广告标题改造；卡页口径 30 天内广告 CTR 提升 28%、转化率提升 18%。

## 执行步骤

1. 汇总自家与竞品的评论文本并统一属性口径。
2. 按属性做情感打分并计算各属性的提及率。
3. 构建竞争定位图，划分优势区、劣势区与双弱区。
4. 选定优势区属性作为主推差异化卖点。
5. 重构主图与广告标题并回测点击与转化。

## 边界与不做

- 竞品评论量不足或属性口径不可比时不要用，定位图会出现伪优势区。
- 能力边界：属性情感由关键词规则或模型判断，存在误分类；结论只用于素材方向，不替代产品端的质量改进。卡页的 CTR 与转化提升为特定案例口径。
- 合规红线：竞品评论须来自公开或授权渠道，不得抓取受限数据，素材与宣称不得贬低竞品或使用未证实的比较。

## 技能关联

- **可组合**：Skill-VOC-Competitive-Positioning-Map

---

> 分类：业务运营/品牌与增长/品牌定位　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Competitive-Positioning-Map`