---
name: "p2s-review-keyword-mining-seo"
title: "Skill-Review-Keyword-Mining-SEO — 评论关键词挖掘 SEO"
description: "触发词：评论挖词、买家语言、高分评价词频、词库差集、Listing 改版。何时不用：要从竞品 Listing 文本与搜索建议扩词时用「长尾关键词挖掘」；要按需求-竞争矩阵找蓝海词时用「关键词需求缺口矩阵分析」。安全边界：采集评论须遵守平台数据使用规范，避免关键词堆砌被降权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Review-Keyword-Mining-SEO"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "买家在评论里是怎么说这件商品的，就用他们的话去写标题，搜索命中率自然上去。"
user_try: "试试：从竞品 Top 3 ASIN 各 100 条好评里挖出买家真实用词，和我的 Listing 词库比一下差在哪。"
whenToUse: "当 Listing 用词来自运营经验、与买家真实搜索语言有差距、需要从评论语料挖词时用本技能；要从竞品 Listing 与搜索建议扩词，用「长尾关键词挖掘」；要按需求-竞争矩阵找蓝海词，用「关键词需求缺口矩阵分析」。"
workflow: "采集竞品 Top 3 ASIN 评论并过滤正面评论 → 分词去停用词并提取 1-3 gram → 按情感权重做 TF-IDF 提取高分词 → 与现有词库求差集并融入 Listing"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Review-Keyword-Mining-SEO — 评论关键词挖掘 SEO

## ① 解决的问题

运营面临"关键词研究忽略买家真实搜索语言"——评论词挖掘将长尾词自然排名数量提升65%，月均自然流量增加8000次

## ② 核心算法逻辑

论文：Mining and Summarizing Customer Reviews（KDD 2004） | 年份：2004

## ③ 业务应用场景

场景：婴儿摇椅 Listing 关键词从评论中自动挖掘
- 业务问题：婴儿摇椅 Listing 标题词库来自运营经验，发现买家实际搜索词（如「vibrating baby seat」「soothing chair for colic baby」）与 Listing 用词有差距 - 数据要求：竞品 ASIN 的 200-500 条评论（可从 Amazon 抓取）、现有 Listing 文本 - 执行方案： - 爬取竞品 Top 3 ASIN 的评论各 100 条 - 过滤正面评论（评星 ≥ 4） - TF-IDF 提取高分词，与现有 Listing 词库求差集 - Top 15 个新发现词融入标题、Bullet Points - 量化产出：Listi
三轨验证 | 成本轨：月均成本1200元（关键词挖掘工具SEM Rush/Ahrefs订阅800元/月+人工分析12小时/月@50元/小时=400元），ROI周期2-3个月 | 合规轨：符合《电商平台搜索算法推荐公示规范》，关键词挖掘属自然优化范畴，无违规风险，需建立关键词库审核机制确保无侵权词汇 | 风险轨：A9算法更新导致优化策略失效（概率35%/季度），竞品恶意词汇抢占（概率20%），关键词堆砌被降权（概率15%若执行不当）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：从评论挖掘新词后 Listing 改版，自然曝光量提升 15-25%，年化增量销售 8-15 万元
实施难度：⭐⭐☆☆☆（纯 NLP 文本挖掘，无需外部 API）
优先级：⭐⭐⭐⭐☆（评论是最接近消费者真实语言的数据源，词库质量高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（129 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import math
import numpy as np
import pandas as pd
from typing import List, Dict, Set
from collections import Counter, defaultdict

STOP_WORDS = {
    "the", "a", "an", "is", "it", "was", "are", "for", "i", "my", "we",
    "this", "that", "with", "have", "has", "very", "and", "or", "but",
    "not", "be", "been", "on", "in", "at", "of", "to", "by", "so", "he",
    "she", "they", "you", "your", "our", "its", "as", "if", "use", "used",
    "get", "got", "just", "can", "will", "would", "could", "should"
}

def preprocess_review(text: str) -> List[str]:
    """预处理评论文本"""
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    tokens = text.split()
    # 过滤停用词和短词
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) >= 3]
    return tokens

def extract_ngrams(tokens: List[str], max_n: int = 3) -> List[str]:
    """提取 1-3 gram"""
    ngrams = []
    for n in range(1, max_n + 1):
        for i in range(len(tokens) - n + 1):
            ngrams.append(" ".join(tokens[i:i+n]))
    return ngrams

def compute_tfidf(
    reviews: List[str],
    sentiment_weights: List[float] = None
) -> pd.DataFrame:
    """计算 TF-IDF，可加情感权重"""
    if sentiment_weights is None:
        sentiment_weights = [1.0] * len(reviews)
    
    n_docs = len(reviews)
    doc_term_freq = []
    df_count = defaultdict(int)
    
    # 计算词频和文档频率
    for review in reviews:
        tokens = preprocess_review(review)
        ngrams = extract_ngrams(tokens, max_n=2)
        freq = Counter(ngrams)
        doc_term_freq.append(freq)
        for term in set(ngrams):
            df_count[term] += 1
    
    # 计算 TF-IDF
    tfidf_scores = defaultdict(float)
    for i, (freq_dict, weight) in enumerate(zip(doc_term_freq, sentiment_weights)):
        total_terms = sum(freq_dict.values())
        for term, count in freq_dict.items():
            tf = count / total_terms
            idf = math.log(n_docs / (1 + df_count[term]))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1105.3875，但该号在 arXiv 上是《Tunnel Spectroscopy of a Proximity Josephson Junction》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Mining and Summarizing Customer Reviews（KDD 2004）》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 ASIN 的评论语料（卡页 200-500 条，建议 Top 3 ASIN 各 100 条）含评分与文本、自身现有 Listing 文本与词库；粒度为 评论 / 关键词。

**输出**：从评论中挖掘的高价值词与新发现词清单（卡页 Top 15）、与现有词库的差集、建议融入标题与 Bullet Points 的分层词表；供 Listing 运营改版使用。

## 执行步骤

1. 采集竞品 Top 3 ASIN 的评论（卡页各 100 条）并过滤出正面评论（评星 ≥4）
2. 分词、去停用词并提取 1-3 gram
3. 按情感权重做 TF-IDF，提取高分买家用语
4. 与现有 Listing 词库求差集，选出 Top 15 新发现词
5. 把新词融入标题与 Bullet Points 并复盘自然曝光

## 边界与不做

- 数据不满足：评论量不足（少于卡页 200-500 条口径）或评论语言与目标市场不一致时词频失真。
- 何时不用：要从竞品 Listing 文本与搜索建议词扩词，用「长尾关键词挖掘」；要按需求-竞争矩阵找蓝海词，用「关键词需求缺口矩阵分析」。
- 能力边界：只产出词表建议，不代改 Listing；采集评论须遵守平台数据使用规范，避免堆砌被降权；卡页的长尾词自然排名 +65%、月均自然流量 +8000 次为案例口径。

## 技能关联

- **前置**：Skill-Click-Through-Rate-Title-Optimizer.html、Skill-Click-Through-Rate-Title-Optimizer、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Listing-Conversion-Rate-Optimizer.html、Skill-Listing-Conversion-Rate-Optimizer、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Voice-Search-Optimization-Amazon.html、Skill-Voice-Search-Optimization-Amazon
- **延伸**：Skill-Click-Through-Rate-Title-Optimizer.html、Skill-Click-Through-Rate-Title-Optimizer、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Listing-Conversion-Rate-Optimizer.html、Skill-Listing-Conversion-Rate-Optimizer、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Voice-Search-Optimization-Amazon.html、Skill-Voice-Search-Optimization-Amazon
- **可组合**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Listing-Conversion-Rate-Optimizer.html、Skill-Listing-Conversion-Rate-Optimizer、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Review-Keyword-Mining-SEO

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Review-Keyword-Mining-SEO`