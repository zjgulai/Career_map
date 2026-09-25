---
name: "p2s-multi-market-voc-cross-analysis"
title: "Skill-Multi-Market-VOC-Cross-Analysis — 多市场VOC交叉分析"
description: "触发词：多市场 VOC、跨站评论差异、评分差异归因、市场语境审查、属性情感对比、差评根因。何时不用：要重写目标站文案用「Listing 本地化」；要建覆盖全语言的评论情感管道用「多语言 NLP 管道」；只做单市场属性情感拆解用「VOC 属性情感抽取」。安全边界：只分析公开评论文本，不采集或留存可关联到个人身份的信息；认证与说明书缺口只作核查提示，不得声称已完成合规认证。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / 市场语境审查 / 体验分析"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-Multi-Market-VOC-Cross-Analysis"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把同一款产品在各站点的评论放在一起比，定位是哪个属性在哪个市场拖了评分，找出要补的认证或说明书缺口。"
user_try: "试试：同款婴儿监视器美国站 4.3 星、德国站 3.7 星，帮我比一比各属性的情感差异，找出德国站差评的根因。"
whenToUse: "同一款产品在多站点评分或口碑不一致、要定位属性级差异根因时用；只重写目标站文案用「Listing 本地化」，要建全语言评论打标管道用「多语言 NLP 管道」，只做单市场属性情感拆解用「VOC 属性情感抽取」。"
workflow: "按市场汇总评论原文，并加载各市场语言、币种与本地安全认证词表 → 按安全、质量、易用性、设计、性价比等通用属性逐条匹配提及 → 统计每个市场每个属性的提及数与正面率、负面率 → 逐属性跨市场对齐，标出差异显著的短板属性 → 输出属性乘市场的交叉表用于定位根因"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Multi-Market-VOC-Cross-Analysis — 多市场VOC交叉分析

## ① 解决的问题

跨站卖家面临"同款婴儿监视器美国4.3星欧洲3.7星不知道差异根因是什么"——多市场VOC交叉分析识别德国CE认证缺失和德语说明书问题，补全后3个月评分升至4.2星月销量+65%

## ② 核心算法逻辑

论文：CrossCultural Sentiment Analysis for Product Reviews | 年份：2021

## ③ 业务应用场景

场景：母婴品牌同一款婴儿监视器在美国（4.3 星/2,400 评）表现良好，但德国站（3.7 星/320 评）差评集中。
多市场 VOC 交叉分析（共分析 2,720 条评论）：
| 属性 | 美国情感正面率 | 德国情感正面率 | 差异 | |------|-------------|-------------|------| | 安全认证 | 71% | 23% | -48% ⚠️ | | 图像质量 | 88% | 85% | -3% | | 易用性 | 79% | 61% | -18% ⚠️ | | 德语说明书 | N/A | 12% | 极低 |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（139 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
import re

# 多市场VOC交叉分析

MARKET_PROFILES = {
    'US': {'language': 'en', 'currency': 'USD', 'safety_terms': ['safety', 'fda', 'cpsc', 'bpa free']},
    'DE': {'language': 'de', 'currency': 'EUR', 'safety_terms': ['ce', 'tuv', 'sicherheit', 'zertifiziert']},
    'JP': {'language': 'ja', 'currency': 'JPY', 'safety_terms': ['安全', 'pse', '認証', 'sgマーク']},
    'UK': {'language': 'en', 'currency': 'GBP', 'safety_terms': ['uk ca', 'kite mark', 'bsi', 'trading standards']},
}

UNIVERSAL_ATTRIBUTES = {
    'safety': [r'safe\w*', r'secur\w*', r'certif\w*', r'hazard', r'danger'],
    'quality': [r'qualit\w*', r'durabl\w*', r'sturdy', r'broke', r'cheap', r'premium'],
    'ease_of_use': [r'easy', r'simple', r'difficult', r'hard to', r'intuiti\w*'],
    'design': [r'design', r'look', r'style', r'aesthetic', r'beautiful', r'ugly'],
    'value': [r'value', r'worth', r'price', r'expensive', r'affordable', r'overpriced'],
}

POSITIVE_WORDS = {'great', 'excellent', 'love', 'amazing', 'perfect', 'good',
                  'wonderful', 'fantastic', 'recommend', 'worth'}
NEGATIVE_WORDS = {'bad', 'poor', 'terrible', 'disappointed', 'broke', 'return',
                  'refund', 'worst', 'avoid', 'waste'}


def compute_attribute_sentiment(texts: list, attribute_patterns: list) -> dict:
    """计算一组文本在特定属性上的情感分布"""
    pos, neg, total = 0, 0, 0
    for text in texts:
        text_lower = text.lower()
        has_attr = any(re.search(p, text_lower) for p in attribute_patterns)
        if not has_attr:
            continue
        words = set(re.findall(r'\b\w+\b', text_lower))
        if words & POSITIVE_WORDS:
            pos += 1
        if words & NEGATIVE_WORDS:
            neg += 1
        total += 1

    return {
        'total_mentions': total,
        'positive_pct': pos / total if total > 0 else 0,
        'negative_pct': neg / total if total > 0 else 0,
    }


def cross_market_analysis(market_reviews: dict) -> pd.DataFrame:
    """
    多市场VOC交叉分析

    market_reviews: {'US': [text1, ...], 'DE': [...], ...}
    """
    rows = []
    for attr, patterns in UNIVERSAL_ATTRIBUTES.items():
        row = {'属性': attr}
        for market, texts in market_reviews.items():
            stats = compute_attribute_sentiment(texts, patterns)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.08678，但该号在 arXiv 上是《Improving Question Answering Model Robustness with Synthetic Adversarial Data Generation》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《CrossCultural Sentiment Analysis for Product Reviews》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：市场粒度分组的评论原文（卡页口径为 {'US': [...], 'DE': [...], 'JP': [...], 'UK': [...]}），评论保留原文语种；另需各市场档案：语言、币种与本地安全认证词表（如 DE 的 ce/tuv/sicherheit/zertifiziert）。下限：每个市场需有可比样本量（卡页案例为美国 2,400 条、德国 320 条，合计 2,720 条），且每个待比属性的提及数大于 0，否则算不出正负率。

**输出**：属性乘市场的情感交叉表：属性、各市场提及数 total_mentions、正面率 positive_pct、负面率 negative_pct，用于定位同款产品在不同市场的差异属性与根因（卡页案例指向安全认证与德语说明书）；供运营与产品团队决定补全动作，输出为 DataFrame。

## 执行步骤

1. 按市场汇总同一款产品的评论原文，保留原文语种
2. 用各市场档案的本地语言与认证词表匹配评论中与属性相关的表述
3. 逐属性统计每个市场的提及数与正面率、负面率
4. 对齐各市场同一属性的正面率，标出差异显著的短板属性
5. 输出属性乘市场交叉表并给出补全方向建议

## 边界与不做

- 数据不满足：某市场评论量过少或该属性零提及（total_mentions 为 0）时算不出正负率，先扩样或改为定性复核。
- 何时不用：只做单市场属性情感拆解用「VOC 属性情感抽取」，只做全语言评论打标管道用「多语言 NLP 管道」，只重写目标站文案用「Listing 本地化」。
- 能力边界：只做属性级情感对比与差异定位，不作因果断言（卡页中补全动作与评分回升为业务举例），也不替代产品认证与合规评审。
- 安全边界：仅分析公开评论文本、不涉及用户身份信息；涉及认证缺失类结论只能提示待核查项，须由合规与产品人工确认后再动作。

## 技能关联

- **可组合**：Skill-Multi-Market-VOC-Cross-Analysis

---

> 分类：业务运营/渠道经营/本地化　·　技术族：07-NLP-VOC　·　源卡：`Skill-Multi-Market-VOC-Cross-Analysis`