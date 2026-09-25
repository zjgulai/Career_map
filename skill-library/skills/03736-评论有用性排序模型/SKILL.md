---
name: "p2s-review-helpfulness-ranking-model"
title: "Skill-Review-Helpfulness-Ranking-Model — 评论有用性排序模型"
description: "触发词：评论排序模型、A+ 素材、TOP 评论筛选、属性覆盖、素材提炼。何时不用：只要产品页展示排序用「评论有用性预测」；本技能是从海量评论中抽内容素材。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Review-Helpfulness-Ranking-Model"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从两千条评论里自动挑出最有参考价值的 Top50，直接拿去写 A+ 和社媒素材。"
user_try: "试试：从这两千条婴儿背带评论里挑出 Top50 高参考价值评论，用于 A+ 内容。"
whenToUse: "当需要从大量评论中批量抽取可用于内容创作的优质评论时用；仅做产品页展示排序用「评论有用性预测」。"
workflow: "采集并清洗评论文本与评分 → 计算文本质量分与语义深度分 → 按综合得分排序输出 TOP 评论清单 → 人工抽检后提炼进 A+ 与社媒素材"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Review-Helpfulness-Ranking-Model — 评论有用性排序模型

## ① 解决的问题

品牌运营面临"2000条评论中人工筛选优质评论做A+素材耗时20h且主观随机"——评论有用性自动排序从2000条中精准提取TOP50高参考价值评论，A+内容转化率提升11%，年化增量GMV约79万元

## ② 核心算法逻辑

论文：Learning to Rank Reviews with Deep Neural Networks | 年份：2018

## ③ 业务应用场景

场景：婴儿背带有 2,000 条评论，品牌希望从中提取最具转化价值的评论用于 A+ 内容和社交媒体素材。人工筛选需要 20h，且主观性强。
部署评论有用性排序模型后（自动处理 2,000 条）： - 识别出 TOP 50 高用性评论（精准率 89%） - TOP 评论平均含 3.2 个产品属性对比，文字描述具体且有时间跨度 - 6 条 TOP 评论被提炼进 A+ 内容，页面转化率提升 11% - 年化增量 GMV（月销 60 万元基数）约 79 万元
- 成本轨： - 数据采集：调用 Amazon API 获取 2,000 条评论数据，成本约 ¥800（API 调用费） - 计算资源：模型训练 + 推理在单机 CPU 环境完成，无额外云资源成本 - 人力投入：初期特征工程 + 权重校准 40h（¥4,000），后续维护 5h/月（¥500） - 总年化成本：¥14,600（初期 ¥8,800 + 年维护 ¥5,800）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

30-80 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（114 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 54 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
import re

# 评论有用性排序模型

def compute_text_quality_score(text: str) -> float:
    """文本质量分（字数、结构、具体性）"""
    words = len(text.split())
    # 最优字数100-500词，峰值得分
    word_score = min(1.0, words / 300) if words < 300 else max(0.5, 1 - (words - 500) / 1000)

    # 结构信号
    has_pros_cons = bool(re.search(r'\b(pros?|cons?|pros:|cons:|however|but|although)\b', text.lower()))
    has_time_ref = bool(re.search(r'\b(month|week|year|after|since)\b', text.lower()))
    has_comparison = bool(re.search(r'\b(compared|vs|versus|better than|worse than)\b', text.lower()))

    structure_bonus = 0.2 * has_pros_cons + 0.15 * has_time_ref + 0.15 * has_comparison
    return min(1.0, word_score + structure_bonus)


def compute_semantic_depth_score(text: str, product_terms: list = None) -> float:
    """语义深度分（属性覆盖、专业术语）"""
    text_lower = text.lower()
    if product_terms is None:
        product_terms = ['quality', 'safe', 'comfort', 'easy', 'durable',
                         'design', 'value', 'material', 'size', 'fit']

    covered = sum(1 for t in product_terms if t in text_lower)
    coverage_score = min(1.0, covered / 4)

    # 具体数字/度量是深度信号
    has_numbers = bool(re.search(r'\b\d+\b', text))
    return min(1.0, coverage_score + 0.2 * has_numbers)


def compute_sentiment_specificity(rating: float) -> float:
    """情感特异性分（中间评分更具参考价值）"""
    # 3-4星最具参考价值
    specificity = {1: 0.5, 2: 0.7, 3: 0.9, 4: 1.0, 5: 0.6}
    return specificity.get(int(rating), 0.6)


def compute_social_signal(verified: bool, top_reviewer: bool = False) -> float:
    """社会信号分"""
    score = 0.5
    if verified:
        score += 0.3
    if top_reviewer:
        score += 0.2
    return min(1.0, score)


def rank_reviews_by_helpfulness(
    reviews: pd.DataFrame,
    text_col: str = 'text',
    rating_col: str = 'rating',
    verified_col: str = 'verified_purchase',
    weights: dict = None,
    product_terms: list = None,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1809.04038，但该号在 arXiv 上是《Polarization observables in $e^+e^-$ annihilation to a baryon-antibaryon pair》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Learning to Rank Reviews with Deep Neural Networks》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：评论文本与评分（如 2000 条）、可选产品术语表用于语义深度评分、评论获取渠道（如平台 API）。

**输出**：按有用性排序的 TOP 评论清单（含质量分与属性覆盖），供 A+ 内容与社媒素材提炼，附精准率说明。

## 执行步骤

1. 采集并清洗评论文本与评分
2. 计算文本质量分与语义深度分
3. 按综合得分排序输出 TOP 评论清单
4. 人工抽检确认精准率
5. 把入选评论提炼进 A+ 内容与社媒素材

## 边界与不做

- 何时不用：评论量不足或缺少产品术语表时语义深度评分不稳
- 能力边界：只做评论筛选与排序，不替代内容创作的版权与授权确认，也不得篡改评论原意

## 技能关联

- **可组合**：Skill-Review-Helpfulness-Ranking-Model

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：07-NLP-VOC　·　源卡：`Skill-Review-Helpfulness-Ranking-Model`