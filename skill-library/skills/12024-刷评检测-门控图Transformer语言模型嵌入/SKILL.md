---
name: "p2s-llm-review-manipulation-detection"
title: "LLM刷评检测 — 门控图Transformer+语言模型嵌入"
description: "触发词：AI 刷评检测、门控图变换器、语言嵌入、举报队列、评论清洗。何时不用：关键词规则就能覆盖的明显垃圾评论不必上模型；本技能针对语义自然、关键词检测失效的 AI 生成评论。安全边界：检测仅用于内部清洗与举报队列，不得自动删评或对用户报复；评论数据须脱敏。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-LLM-Review-Manipulation-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "关键词已经抓不到大模型写的刷评了，改用语言嵌入加图注意力做识别，精度能到九成左右。"
user_try: "试试：这批评论语言上挑不出毛病，帮我识别哪些是 AI 生成的刷评。"
whenToUse: "关键词规则命中率接近零、评论语言自然时用本技能；需要账号群结构判定用群体检测类技能。"
workflow: "采集评论字段并构建三方图 → 生成评论的语言模型嵌入 → 用门控图变换器输出欺诈概率 → 把高置信结果送入举报队列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM刷评检测 — 门控图Transformer+语言模型嵌入

## ① 解决的问题

竞品通过 ChatGPT 批量生成高质量刷评对传统关键词检测免疫——引入门控图 Transformer+语言模型嵌入检测框架，AI 生成刷评识别精度达 91%，年化减少因刷评攻击导致的 Listing 权重损失。

## ② 核心算法逻辑

核心挑战：2026年，LLM生成的虚假评论在语言质量上已全面超越真实评论——语法自然、情感真实、细节丰富，传统基于词频/情感/长度的NLP特征几乎完全失效，误判率接近随机猜测水平。

## ③ 业务应用场景

业务痛点：竞品通过ChatGPT批量生成高质量5星好评注入自家Listing，同时对我方Listing发起1星AI差评轰炸。传统关键词检测命中率接近零，人工审核成本极高。
数据要求： - Amazon评论爬虫字段：`reviewer_id`、`product_asin`、`rating`、`review_text`、`review_date`、`reviewer_join_date` - 构建三方图最少50条评论，含至少5条可疑样本 - 可选增强：`verified_purchase`标志、reviewer历史评论数
量化产出： - 每条评论欺诈概率分数（0~1） - 高置信度虚假评论列表（自动举报队列） - 刷评账号团伙聚类（识别协同攻击组织） - 保护月销$50k Listing约 $7,500/月（防止转化率下滑15%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（282 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM刷评检测 — 门控图Transformer+语言模型嵌入
论文: arXiv:2510.01801 (FraudSquad)
场景: Amazon母婴品类刷评检测 / VOC分析前置清洗层
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler


# ── 数据结构 ─────────────────────────────────────────────────

@dataclass
class ReviewGraph:
    """用户-商品-评论三方异构图"""
    review_ids: List[str] = field(default_factory=list)
    user_ids:   List[str] = field(default_factory=list)
    product_ids: List[str] = field(default_factory=list)
    texts:      List[str] = field(default_factory=list)
    ratings:    List[float] = field(default_factory=list)
    timestamps: List[float] = field(default_factory=list)
    labels:     Optional[np.ndarray] = None  # 1=虚假,0=真实,-1=未知

    def add(self, review_id: str, user_id: str, product_id: str,
            text: str, rating: float, timestamp: float, label: int = -1) -> None:
        self.review_ids.append(review_id)
        self.user_ids.append(user_id)
        self.product_ids.append(product_id)
        self.texts.append(text)
        self.ratings.append(rating)
        self.timestamps.append(timestamp)
        lbl = np.array([label])
        self.labels = lbl if self.labels is None else np.append(self.labels, lbl)

    def __len__(self) -> int:
        return len(self.review_ids)


# ── 图结构特征提取 ────────────────────────────────────────────

def extract_graph_features(graph: ReviewGraph) -> np.ndarray:
    """
    捕获LLM刷评团伙的图行为模式
    6维特征：用户评论频率、产品多样性、评论爆发强度、
             极端评分、用户平均评分、时间聚集度
    """
    n = len(graph)
    feats = np.zeros((n, 6))

    user_cnt: Dict[str, int] = defaultdict(int)
    user_prods: Dict[str, set] = defaultdict(set)
    prod_times: Dict[str, List[float]] = defaultdict(list)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2510.01801 — Detecting LLM-Generated Spam Reviews by Integrating Language Model Embeddings and Graph Neural Network
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：平台评论字段：reviewer_id、product_asin、rating、review_text、review_date、reviewer_join_date；三方图最少 50 条评论且含至少 5 条可疑样本，可选 verified_purchase 与历史评论数。

**输出**：每条评论的欺诈概率、高置信虚假评论清单（自动举报队列）与刷评账号团伙聚类，供评论清洗与 VOC 分析前置过滤使用。

## 执行步骤

1. 采集评论与账号字段
2. 构建评论、产品、账号三方图
3. 生成语言模型嵌入并跑门控图变换器
4. 输出欺诈概率并筛出高置信评论
5. 把结果送入举报队列并聚类团伙

## 边界与不做

- 明显的垃圾评论用关键词规则即可，不必上模型。
- 本技能产出概率与清单，不执行删评、封号等处置动作。
- 检测仅用于内部清洗与举报队列，评论数据须脱敏，不得对用户做报复性操作。

## 技能关联

- **前置**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-ATO-Spatio-Temporal-Graph.html、Skill-ATO-Spatio-Temporal-Graph、Skill-Competitor-Negative-Campaign-Detection.html、Skill-Competitor-Negative-Campaign-Detection、Skill-Explainable-Review-Adjudication.html、Skill-Explainable-Review-Adjudication、Skill-Graph-Neural-Network-Basics、Skill-Review-Helpfulness-Ranking-Model.html、Skill-Review-Helpfulness-Ranking-Model、Skill-Text-Classification-Transformer、Skill-VOC-Mining-Aspect-Sentiment
- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-ATO-Spatio-Temporal-Graph.html、Skill-ATO-Spatio-Temporal-Graph、Skill-Competitor-Negative-Campaign-Detection.html、Skill-Competitor-Negative-Campaign-Detection、Skill-Explainable-Review-Adjudication.html、Skill-Explainable-Review-Adjudication、Skill-Review-Helpfulness-Ranking-Model.html、Skill-Review-Helpfulness-Ranking-Model、Skill-VOC-Mining-Aspect-Sentiment
- **可组合**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-ATO-Spatio-Temporal-Graph.html、Skill-ATO-Spatio-Temporal-Graph、Skill-Explainable-Review-Adjudication.html、Skill-Explainable-Review-Adjudication、Skill-VOC-Mining-Aspect-Sentiment、Skill-LLM-Review-Manipulation-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-LLM-Review-Manipulation-Detection`