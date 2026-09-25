---
name: "p2s-long-tail-keyword-mining"
title: "长尾关键词挖掘 — NLP词频+竞品反查+搜索建议词三路融合"
description: "触发词：长尾词挖掘、三路融合、词频与竞品反查、旺季词布局、关键词覆盖面。何时不用：要找高需求低竞争的蓝海主词时用「关键词需求缺口矩阵分析」；要把标签映射成词包时用「标签→关键词自动映射矩阵」。安全边界：只产出候选词表，不代改 Listing、不保证流量增幅。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Long-Tail-Keyword-Mining"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "词频、竞品反查、搜索建议三路一起挖，把 3 个核心词扩成两百多个长尾词，赶在旺季前铺好。"
user_try: "试试：用 5 个竞品 ASIN 和我的 Listing 挖 200 个长尾词，挑出最值得写进去的 50 个。"
whenToUse: "当核心词流量饱和、Listing 曝光上不去，需要多渠道融合扩充长尾词时用本技能；要找蓝海主词，用「关键词需求缺口矩阵分析」；要把标签转成词包，用「标签→关键词自动映射矩阵」。"
workflow: "收集竞品 Listing 文本与自身核心词 → TF-IDF 与 n-gram 提取未覆盖候选词 → 用竞品搜索词反查与搜索建议词补齐 → 三路融合打分精选 TOP 50 落地"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 长尾关键词挖掘 — NLP词频+竞品反查+搜索建议词三路融合

## ① 解决的问题

选品运营面临"核心词流量饱和、Listing 曝光上限瓶颈"——三路融合挖掘将关键词覆盖扩大3-5倍，自然流量年化增收20-50万元

## ② 核心算法逻辑

论文：YAKE! Keyword Extraction from Single Documents using Multiple Local Features | 年份：2020

## ③ 业务应用场景

场景A：婴儿背带新品关键词扩充 - 业务问题：Listing 仅覆盖"baby carrier"等3个核心词，搜索曝光量上限低 - 数据要求：竞品 ASIN × 5 个，自身 Listing 文本，核心词列表（≥5 个） - 预期产出：200+ 长尾候选词 + 搜索量估算 + 竞争度评分，精选 TOP 50 填入 Listing - 业务价值：关键词覆盖扩大 3-5 倍，自然流量增长 20-40%，年化增收 25-60 万元
场景B：旺季前关键词地毯式扫描 - 业务问题：双11/Prime Day 前，需快速找出季节性高潜长尾词提前布局 - 数据要求：去年同期搜索趋势数据，类目 TOP 100 ASIN 列表 - 预期产出：季节性长尾词 TOP 30，提前 45 天写入 Listing 和广告 - 业务价值：抢占季节性流量红利，预计 ROAS 提升 0.8-1.2
三轨验证 | 成本轨：月均成本1200元（AI工具订阅800元+人工分析12小时/月@400元），ROI周期2-3个月 | 合规轨：符合《电商平台搜索公平竞争规范》，关键词挖掘需避免虚假属性词，合规率需≥95% | 风险轨：长尾词转化率波动大（±25%概率），竞争对手跟风导致流量衰减（概率40%），平台算法更新影响排名（概率30%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：关键词覆盖率提升 3 倍，自然搜索曝光年化增加 40-80 万次，对应增收 20-50 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：长尾词竞争度低、CPC 低，是 ROI 最高的流量获取方式；三路融合比单路挖掘准确率高 30-40%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（121 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import math
from collections import Counter, defaultdict
from typing import List, Dict, Set

def tokenize(text: str) -> List[str]:
    """简单英文分词，去标点小写"""
    return re.findall(r'[a-zA-Z]{2,}', text.lower())

def extract_ngrams(tokens: List[str], n: int) -> List[str]:
    return [' '.join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]

def compute_tfidf(docs: List[str], min_df: int = 2) -> Dict[str, float]:
    """计算所有文档的词组 TF-IDF，返回 term -> avg_tfidf"""
    tokenized = [tokenize(d) for d in docs]
    all_terms = []
    for tokens in tokenized:
        all_terms.extend(tokens)
        all_terms.extend(extract_ngrams(tokens, 2))
        all_terms.extend(extract_ngrams(tokens, 3))
    
    N = len(docs)
    doc_freq = Counter()
    doc_tfs = []
    
    for tokens in tokenized:
        terms = set(tokens + extract_ngrams(tokens, 2) + extract_ngrams(tokens, 3))
        for t in terms:
            doc_freq[t] += 1
        tf = Counter(tokens + extract_ngrams(tokens, 2) + extract_ngrams(tokens, 3))
        doc_tfs.append(tf)
    
    tfidf_sum = defaultdict(float)
    for tf in doc_tfs:
        total = sum(tf.values())
        for term, cnt in tf.items():
            if doc_freq[term] < min_df:
                continue
            tfidf = (cnt / total) * math.log(N / doc_freq[term])
            tfidf_sum[term] += tfidf
    
    return {k: round(v / N, 6) for k, v in tfidf_sum.items()}

def mine_long_tail_keywords(
    competitor_listings: List[str],
    own_listing: str,
    search_suggestions: List[str],
    competitor_search_terms: List[str],
    top_n: int = 50
) -> List[Dict]:
    """三路融合长尾词挖掘"""
    # 路径1：TF-IDF 从竞品 Listing 提取
    tfidf_scores = compute_tfidf(competitor_listings)
    own_terms = set(tokenize(own_listing))
    own_ngrams = set(extract_ngrams(tokenize(own_listing), 2) + extract_ngrams(tokenize(own_listing), 3))
    own_all = own_terms | own_ngrams
    
    path1_candidates = {k: v for k, v in tfidf_scores.items() if k not in own_all and v > 0.001}
    
    # 路径2：竞品搜索词反查 - 自身未覆盖的
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2005.00065，但该号在 arXiv 上是《Generative Adversarial Networks (GANs Survey): Challenges, Solutions, and Future Directions》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《YAKE! Keyword Extraction from Single Documents using Multiple Local Features》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 ASIN（卡页 5 个）及其 Listing 文本、自身 Listing 文本与已覆盖核心词（≥5 个）、可选搜索建议词与去年同期搜索趋势数据；粒度为 SKU / 关键词。

**输出**：200+ 长尾候选词（含搜索量估算与竞争度评分）与精选 TOP 50 词表；供 Listing 优化与广告投放使用。

## 执行步骤

1. 收集竞品 ASIN 的 Listing 文本、自身 Listing 与核心词列表
2. 用 TF-IDF 与 n-gram 从竞品语料提取自身未覆盖的候选词
3. 用竞品搜索词反查与搜索建议词补齐长尾
4. 三路融合打分并估算搜索量与竞争度
5. 精选 TOP 50 词写入 Listing 与广告，旺季前提前约 45 天布局

## 边界与不做

- 数据不满足：拿不到竞品 ASIN 的 Listing 文本或核心词清单时三路融合退化为单路，候选质量下降。
- 何时不用：要找的是高需求低竞争的蓝海主词（词级机会矩阵），用「关键词需求缺口矩阵分析」；要把结构化标签转成词包，用「标签→关键词自动映射矩阵」。
- 能力边界：只产出候选词表，不代改 Listing、不保证流量增幅（长尾词转化率波动较大）；卡页的覆盖扩大 3-5 倍、年化增收 20-50 万元为案例口径。

## 技能关联

- **前置**：Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Long-Tail-Keyword-Mining

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Long-Tail-Keyword-Mining`