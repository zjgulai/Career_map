---
name: "p2s-bertopic-neural-topic-modeling"
title: "BERTopic — 神经主题模型与动态知识分类"
description: "触发词：主题建模、评论聚类、新兴主题发现、知识缺口、主题覆盖率。何时不用：追踪某个已知主题的时间演化用「Review 时序趋势挖掘」；本技能负责发现未知主题簇。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-113"
l3_business: "客诉聚类"
l3_all: "客诉聚类 / 体验分析"
l1_l2_l3: "业务运营/服务与体验/客诉聚类"
p2s_card_id: "Skill-BERTopic-Neural-Topic-Modeling"
p2s_src_domain: "07-NLP-VOC"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把几千条评论或文档自动归成主题，找出你还没注意到的新问题和新知识缺口。"
user_try: "试试：给这 5000 条评论跑主题聚类，告诉我哪些是最近才冒出来的新主题。"
whenToUse: "当需要从大量文本中发现未知主题簇、做知识缺口或新兴问题排查时用；已知主题的时序涨落分析用「Review 时序趋势挖掘」。"
workflow: "对全量文本运行 BERTopic 自动发现主题 → 与现有分类或域体系对比 → 找出未被覆盖的孤立簇作为知识缺口 → 把缺口簇交给对应团队优先补充"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# BERTopic — 神经主题模型与动态知识分类

## ① 解决的问题

运营面临"5000条评论无法快速发现新兴主题和知识缺口"——BERTopic将VOC主题覆盖率从68%提升至94%，自动发现安全性等预警主题，漏报率下降38%

## ② 核心算法逻辑

论文：BERTopic: Neural topic modeling with a classbased TFIDF procedure | 年份：2022

## ③ 业务应用场景

场景 A：Skill 知识库自动分类与缺口发现
- 业务痛点：1037 个 Skill 现在按人工划定的 25 个域分类，但随着新 Skill 涌入，人工分类滞后且可能漏掉新兴交叉主题（如「AI视频 + 合规」） - 数据要求：Skill 卡片标题 + problem_solved 字段，约 1037 条文本 - 执行： 1. 对全部 Skill 运行 BERTopic → 自动发现 30-40 个主题 2. 与现有 25 个域对比，找出「未被覆盖的新主题簇」 3. 这些孤立簇 = 知识缺口，优先萃取新 Skill - 量化产出：每季度自动发现 3-5 个新兴交叉主题，缺口发现效率 vs 人工提升 10x
场景 B：Amazon 评论主题挖掘（VOC 分析）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Skill 知识缺口自动发现：每季度节省 2-3 天人工分析时间
VOC 评论主题覆盖率：68%（关键词）→ 94%（BERTopic）
漏报率：38% 下降，避免因错过「安全性」主题上升而延误合规响应

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import math
import numpy as np
from collections import defaultdict, Counter
from dataclasses import dataclass, field

@dataclass
class Topic:
    id: int
    top_words: list[tuple[str, float]]
    doc_count: int
    representative_docs: list[str] = field(default_factory=list)

class SimpleBERTopic:
    """
    BERTopic 轻量模拟版（无需 GPU/大模型）
    生产部署: pip install bertopic sentence-transformers
    """
    def __init__(self, min_topic_size: int = 3, n_top_words: int = 8):
        self.min_topic_size = min_topic_size
        self.n_top_words = n_top_words
        self.topics_: dict[int, Topic] = {}
        self.doc_topics_: list[int] = []

    def _tokenize(self, text: str) -> list[str]:
        stop = {'的','了','是','在','和','有','也','这','那','但','很','都','我','你','他',
                'the','a','an','is','are','was','were','it','of','in','to','for'}
        tokens = re.findall(r'\w+', text.lower())
        return [t for t in tokens if len(t) > 1 and t not in stop]

    def _simple_embed(self, texts: list[str]) -> np.ndarray:
        vocab = list({t for text in texts for t in self._tokenize(text)})
        w2i = {w: i for i, w in enumerate(vocab)}
        mat = np.zeros((len(texts), len(vocab)), dtype=np.float32)
        for i, text in enumerate(texts):
            tokens = self._tokenize(text)
            for t in tokens:
                if t in w2i:
                    mat[i, w2i[t]] += 1
            row_sum = mat[i].sum()
            if row_sum > 0:
                mat[i] /= row_sum
        return mat

    def _cluster(self, embeddings: np.ndarray, n_clusters: int) -> list[int]:
        np.random.seed(42)
        n = len(embeddings)
        centroids = embeddings[np.random.choice(n, n_clusters, replace=False)]
        labels = np.zeros(n, dtype=int)
        for _ in range(20):
            dists = np.linalg.norm(embeddings[:, None] - centroids[None], axis=2)
            labels = dists.argmin(axis=1)
            for k in range(n_clusters):
                mask = labels == k
                if mask.sum() > 0:
                    centroids[k] = embeddings[mask].mean(axis=0)
        return labels.tolist()

    def _c_tfidf(self, docs_by_cluster: dict[int, list[str]]) -> dict[int, list[tuple[str, float]]]:
        cluster_tokens: dict[int, list[str]] = {}
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2203.05794 — BERTopic: Neural topic modeling with a class-based TF-IDF procedure

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：文本语料（评论正文或文档标题加问题描述字段），规模数百至上千条；可选现有人工分类体系用于对比。

**输出**：主题列表（每主题的 Top 词、文档数、代表文档）与相对现有分类的缺口簇清单，供选品与知识库补录决策。

## 执行步骤

1. 汇总待分析文本并做分词与停用词处理
2. 运行 BERTopic 自动发现主题簇
3. 输出每个主题的 Top 词、文档数与代表文档
4. 与现有分类体系对比，找出未覆盖的新主题
5. 把孤立缺口簇交给对应团队补充

## 边界与不做

- 何时不用：文本量低于最小主题规模时主题不稳，需先累积语料
- 能力边界：只做主题发现与聚类，不判断主题业务优先级，也不产出改版或上架方案

## 技能关联

- **前置**：Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-SmartVector-Self-Aware-Embeddings.html、Skill-SmartVector-Self-Aware-Embeddings
- **延伸**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-iText2KG-Schema-Free-KG-Induction.html、Skill-iText2KG-Schema-Free-KG-Induction
- **可组合**：Skill-Demand-Driven-KB-Construction.html、Skill-Demand-Driven-KB-Construction、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-Review-Temporal-Trend-Mining.html、Skill-Review-Temporal-Trend-Mining、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-New-Product-Gap-Scoring.html、Skill-VOC-New-Product-Gap-Scoring、Skill-BERTopic-Neural-Topic-Modeling

---

> 分类：业务运营/服务与体验/客诉聚类　·　技术族：07-NLP-VOC　·　源卡：`Skill-BERTopic-Neural-Topic-Modeling`