---
name: "p2s-dense-passage-retrieval"
title: "Dense Passage Retrieval — 密集段落检索：超越关键词的语义搜索基础设施"
description: "触发词：密集检索、语义召回、DPR 向量、同义词与多语言查询、Recall 提升。何时不用：要同时覆盖精确型号与 ASIN 这类字面查询时用「稀疏+稠密混合检索」；要用 LLM 直接理解复杂自然语言意图时用「LLM 生成式商品搜索」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Dense-Passage-Retrieval"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "让搜索能听懂话：用户说「安静的吸奶器」，也能召回写着 low noise breast pump 的商品。"
user_try: "试试：用语义检索改造我的独立站搜索，让「安静吸奶器」这类查询也能召回对应商品。"
whenToUse: "当关键词检索对同义词、多语言与长句查询召回不足、需要稠密向量语义检索时用本技能；要覆盖精确型号与字面查询，用「稀疏+稠密混合检索」；要用 LLM 理解复杂自然语言意图，用「LLM 生成式商品搜索」。"
workflow: "准备商品标题与要点语料并切分检索单元 → 用双编码器生成商品稠密向量 → 建向量索引并接入查询编码与检索 → 用相关性数据微调并对比 BM25 基线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dense Passage Retrieval — 密集段落检索：超越关键词的语义搜索基础设施

## ① 解决的问题

独立站搜索「安静吸奶器」找不到「low noise breast pump」的产品因为BM25只做关键词匹配——DPR密集向量检索捕捉语义相似度，搜索Recall@10提升25-40%长尾查询和多语言搜索大幅改善年化GMV增益15-45万元

## ② 核心算法逻辑

BM25 vs DPR：

## ③ 业务应用场景

业务问题：独立站的 BM25 搜索对以下场景效果差： - "portable pump"找不到"wearable breast pump"（同义词） - "hospital grade"找不到"医院级"（多语言） - 长句查询："pump that won't wake sleeping baby"
用 DPR 改造后，这些查询都能找到正确的商品。
数据要求： - 商品标题+要点（用于生成商品向量） - 可选：查询-商品相关性数据（用于微调）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
搜索 Recall@10 提升 25-40%：搜索转化率提升，月增 GMV ¥5-15 万
长尾查询覆盖：原来找不到的词现在能找到，新增潜在转化
多语言搜索改善（英文搜索找到中文产品）
年化综合 ROI：¥15-45 万
实施难度：⭐⭐⭐☆☆（sentence-transformers 有开源预训练模型；FAISS 成熟；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/knowledge_graph/dense_passage_retrieval` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Dense-Passage-Retrieval.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Dense Passage Retrieval
DPR语义搜索：超越BM25的密集向量检索
生产: pip install faiss-cpu sentence-transformers
"""
import numpy as np
import re
from collections import defaultdict


def simple_bm25_score(query: str, doc: str, k1: float = 1.5, b: float = 0.75) -> float:
    """简化版 BM25 评分（生产用 rank_bm25 库）"""
    query_terms = query.lower().split()
    doc_terms = doc.lower().split()
    doc_len = len(doc_terms)
    avg_doc_len = 50  # 假设平均文档长度

    tf_dict = defaultdict(int)
    for term in doc_terms:
        tf_dict[term] += 1

    score = 0
    for term in query_terms:
        tf = tf_dict.get(term, 0)
        # BM25 TF 归一化
        tf_norm = tf * (k1 + 1) / (tf + k1 * (1 - b + b * doc_len / avg_doc_len))
        # IDF 近似（假设简单值）
        idf = 1.0 if tf > 0 else 0
        score += idf * tf_norm

    return score


class SimpleDPR:
    """
    DPR 简化实现（无需 BERT，用 TF-IDF 近似嵌入）
    生产代码:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('multi-qa-MiniLM-L6-cos-v1')
    embeddings = model.encode(documents)
    """

    def __init__(self, embed_dim: int = 64):
        self.embed_dim = embed_dim
        self.doc_embeddings = {}
        self.doc_texts = {}
        self.vocab = {}

    def _text_to_embedding(self, text: str) -> np.ndarray:
        """TF-IDF 近似嵌入（生产替换为 BERT 嵌入）"""
        text_lower = text.lower()
        words = re.findall(r'\w+', text_lower)

        # 简单字符 n-gram 嵌入
        vec = np.zeros(self.embed_dim)
        for word in words:
            for i in range(0, len(word), 2):
                gram = word[i:i+4]
                gram_hash = hash(gram) % self.embed_dim
                vec[gram_hash] += 1.0 / len(words)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2004.04906 — Dense Passage Retrieval for Open-Domain Question Answering
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：商品标题与要点文本（用于生成商品向量）、可选查询-商品相关性数据（用于微调）、查询日志；粒度为 商品 / 查询。

**输出**：商品与查询的稠密向量表示与语义检索结果（卡页口径 Recall@10 提升 25-40%）；供独立站搜索服务使用。

## 执行步骤

1. 准备商品标题与要点语料并切分为可检索单元
2. 用双编码器（卡页生产环境用 sentence-transformers 预训练模型）为商品生成稠密向量
3. 建向量索引并接入查询编码与相似度检索
4. 用查询-商品相关性数据微调并对比 BM25 基线
5. 上线后监控 Recall@10 与长尾、多语言查询命中情况

## 边界与不做

- 数据不满足：商品文本过短或缺要点时语义区分度不足，检索质量受限。
- 何时不用：要同时覆盖精确型号与 ASIN 这类字面查询，用「稀疏+稠密混合检索」；要用 LLM 理解复杂自然语言意图，用「LLM 生成式商品搜索」。
- 能力边界：只提供稠密召回层，不含重排序与业务规则兜底；卡页的 Recall@10 提升 25-40%、年化 15-45 万元为案例口径。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Generative-Product-Search.html、Skill-LLM-Generative-Product-Search、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking
- **延伸**：Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Generative-Product-Search.html、Skill-LLM-Generative-Product-Search、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking
- **可组合**：Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-LLM-Generative-Product-Search.html、Skill-LLM-Generative-Product-Search、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Dense-Passage-Retrieval

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：08-知识图谱　·　源卡：`Skill-Dense-Passage-Retrieval`