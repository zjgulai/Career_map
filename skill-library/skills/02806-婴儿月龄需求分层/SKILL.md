---
name: "p2s-baby-age-stage-demand-segmentation"
title: "Skill-Baby-Age-Stage-Demand-Segmentation — 婴儿月龄需求分层"
description: "触发词：月龄分层、评论挖掘、卖点提炼、Listing优化。何时不用：评论中不含月龄信息时无法分层；纯关键词排名优化用常规方法。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-018"
l3_business: "需求分群"
l3_all: "需求分群 / Listing优化"
l1_l2_l3: "业务运营/产品与创新/需求分群"
p2s_card_id: "Skill-Baby-Age-Stage-Demand-Segmentation"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从评论里按月龄拆出各阶段专属痛点，把笼统的适龄描述改成精准卖点。"
user_try: "试试：帮我分析这 1200 条带月龄的评论，按阶段整理痛点并改写 Listing 卖点。"
whenToUse: "本卡属「需求分群」。需要按月龄等属性把需求拆到不同人群阶段、用于 Listing 与内容优化时用本卡；从非结构化文本中批量抽取需求信号时用需求信号抽取类技能。"
workflow: "抽取评论中的月龄阶段 → 按阶段提取关键词 → 汇总各阶段主诉 → 输出分阶段卖点模块"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Baby-Age-Stage-Demand-Segmentation — 婴儿月龄需求分层

## ① 解决的问题

运营面临"婴儿玩具垫Listing写'适合0-3岁'但4-6月龄关键词排名第12位始终无法提升"——月龄需求分层从1200条评论挖掘各阶段专属痛点，Listing精准化后目标关键词排名升至第4位，转化率+22%

## ② 核心算法逻辑

论文：AspectBased Sentiment Analysis with AgeStage Segmentation for Infant Product Reviews | 年份：2019

## ③ 业务应用场景

场景：母婴品牌销售婴儿玩具垫，在 Listing 上统一描述为"适合 0-3 岁"，转化率偏低，尤其在 4-6 月龄家长搜索时表现差。
分析 1,200 条含月龄信息的评论发现： - 0-3m 家长主诉：tummy time support（59%）、too loud（23%） - 4-6m 家长主诉：sensory stimulation（67%）、easy to clean（31%） - 7-12m 家长主诉：durable enough for standing（45%）、bpa free materials（38%）
优化行动： - 按月龄阶段创建 3 个 A+ 内容模块 - Bullet Point 1 改为："For 0-3M: Gentle Tummy Time Support with Low-Noise Crinkle" - 30 天后：4-6 月龄关键词排名从第 12 位升至第 4 位，转化率 +22%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-20 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（118 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
import re
from collections import Counter

# 婴儿月龄需求分层分析

AGE_PATTERNS = [
    (r'\bnewborn\b', '0-3m'),
    (r'\b([0-2])\s*month', '0-3m'),
    (r'\b(3)\s*month', '0-3m'),
    (r'\b(4|5|6)\s*month', '4-6m'),
    (r'\b(7|8|9|10|11|12)\s*month', '7-12m'),
    (r'\b(1[3-9]|2[0-4])\s*month', '13-24m'),
    (r'\b([2-3])\s*year', '2-3y'),
    (r'\btoddler\b', '13-24m'),
    (r'\binfant\b', '0-3m'),
]


def extract_age_stage(text: str) -> str:
    """从评论文本中提取婴儿月龄阶段"""
    text_lower = text.lower()
    for pattern, stage in AGE_PATTERNS:
        if re.search(pattern, text_lower):
            return stage
    return 'unknown'


def extract_keywords(texts: list, top_n: int = 10) -> list:
    """简单TF-IDF风格关键词提取"""
    stopwords = {'the', 'a', 'an', 'is', 'it', 'my', 'i', 'and', 'or', 'for',
                 'to', 'of', 'this', 'that', 'very', 'so', 'but', 'with', 'in',
                 'on', 'at', 'from', 'my', 'our', 'her', 'his', 'we', 'they',
                 'have', 'has', 'be', 'are', 'was', 'were', 'not', 'she', 'he'}
    words = []
    for text in texts:
        tokens = re.findall(r'\b[a-z]{3,}\b', text.lower())
        words.extend([w for w in tokens if w not in stopwords])
    return [w for w, _ in Counter(words).most_common(top_n)]


def segment_demand_by_age(reviews: pd.DataFrame, text_col: str = 'text') -> pd.DataFrame:
    """
    按月龄阶段分层分析需求

    输入: reviews DataFrame，含 text 和可选的 rating 列
    输出: 各月龄段痛点关键词摘要
    """
    df = reviews.copy()
    df['age_stage'] = df[text_col].apply(extract_age_stage)

    results = []
    stage_order = ['0-3m', '4-6m', '7-12m', '13-24m', '2-3y']

    for stage in stage_order:
        stage_df = df[df['age_stage'] == stage]
        if len(stage_df) == 0:
            continue
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.12698，但该号在 arXiv 上是《Leveraging Latent Features for Local Explanations》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《AspectBased Sentiment Analysis with AgeStage Segmentation for Infant Product Reviews》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：含月龄信息的评论文本数据集（评论正文，可含评分）以及目标关键词清单。

**输出**：各月龄阶段的需求分层结果与高频痛点关键词，以及可直接使用的分阶段 A+ 内容与 bullet point 文案。

## 执行步骤

1. 从评论文本中抽取婴儿月龄阶段
2. 按阶段统计关键词与主诉频率
3. 为每个阶段归纳专属痛点与卖点
4. 生成分阶段的 A+ 模块与 bullet point 文案
5. 跟踪目标关键词排名与转化率变化

## 边界与不做

- 评论中缺少月龄或阶段信息时无法分层，不用本卡
- 本卡产出需求分层与文案建议，不负责 Listing 上架与广告投放

## 技能关联

- **可组合**：Skill-Baby-Age-Stage-Demand-Segmentation

---

> 分类：业务运营/产品与创新/需求分群　·　技术族：07-NLP-VOC　·　源卡：`Skill-Baby-Age-Stage-Demand-Segmentation`