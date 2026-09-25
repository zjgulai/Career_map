---
name: "p2s-hybrid-search-bm25-vector"
title: "稀疏+稠密混合检索 — BM25 与向量检索融合"
description: "触发词：混合检索、BM25、向量检索、RRF 融合、零结果率。何时不用：只做语义召回且不需覆盖精确型号时用「密集段落检索」；要用生成式方式理解复杂查询时用「LLM 生成式商品搜索」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Hybrid-Search-BM25-Vector"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "精确型号交给关键词、模糊描述交给语义，再把两路排名融成一版结果，覆盖面比单路都宽。"
user_try: "试试：给搜索同时接上 BM25 和向量检索并做 RRF 融合，看零结果率能降多少。"
whenToUse: "当查询既有精确型号/ASIN 又有模糊语义表达、单路检索覆盖不全时用本技能；只需语义召回，用「密集段落检索」；要用 LLM 直接理解复杂查询，用「LLM 生成式商品搜索」。"
workflow: "建 BM25 稀疏索引与稠密向量索引两路 → 查询同时打给两路检索器 → 用 RRF 或加权 RRF 融合排名 → 校验字面命中与语义召回并监控指标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 稀疏+稠密混合检索 — BM25 与向量检索融合

## ① 解决的问题

母婴出海电商的搜索场景高度两极化：部分用户输入精确型号（"Spectra S1 Plus"、"B07X4X5GXD"），纯向量检索因 OOV 问题召回率低；另一部分用户输入模糊语义查询（"适合背奶妈妈的静音吸奶器"），纯 BM25 只能匹配字面词汇，无法理解意图

## ② 核心算法逻辑

单一检索方式存在固有短板：BM25 擅长精确关键词匹配（SKU 编号、品牌名、型号），但无法理解语义；向量检索擅长语义模糊匹配，但对精确词汇（如"B07X4X5GXD"）敏感度低。混合检索将两路融合，在母婴电商场景中相比单一检索 Recall@10 提升 1525%（arXiv:2210.11773, 2022）。

## ③ 业务应用场景

业务问题： 母婴出海电商的搜索场景高度两极化：部分用户输入精确型号（"Spectra S1 Plus"、"B07X4X5GXD"），纯向量检索因 OOV 问题召回率低；另一部分用户输入模糊语义查询（"适合背奶妈妈的静音吸奶器"），纯 BM25 只能匹配字面词汇，无法理解意图。单一检索方式覆盖不了全场景。
解决方案： 双路并行检索后 RRF 融合。BM25 负责精确 SKU/型号匹配，Dense 负责语义意图理解，RRF 自动将两路排名融合输出最终结果。
业务价值： - 综合 Recall@10 提升 15-22%（相比最优单路） - 搜索零结果率下降 45% - 年化营收增量约 ¥35 万（基于搜索转化率提升 2.5%，月 GMV 200 万）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

35 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（523 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/hybrid_search_bm25_vector` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Hybrid-Search-BM25-Vector.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
稀疏+稠密混合检索系统（BM25 + Vector + RRF）
基于 arXiv:2210.11773 和 arXiv:2009.10056

功能：
1. BM25 稀疏检索（TF-IDF 改进版）
2. 向量稠密检索（Mock Bi-encoder）
3. RRF 倒数排名融合
4. 加权 RRF 变体
5. 母婴商品搜索演示 + 3 测试用例

Author: paper2skills
Date: 2026-06-06
"""

import math
import re
import ast
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict


# ============================================================
# 数据模型
# ============================================================

@dataclass
class Document:
    """检索文档"""
    doc_id: str
    text: str
    title: str = ""
    metadata: Dict = field(default_factory=dict)

    def full_text(self) -> str:
        return f"{self.title} {self.text}".strip()


@dataclass
class SearchResult:
    """检索结果"""
    doc_id: str
    score: float
    rank: int
    source: str  # "bm25" / "dense" / "hybrid"
    document: Optional[Document] = None


# ============================================================
# BM25 稀疏检索器
# ============================================================

class BM25Retriever:
    """
    BM25 稀疏检索器
    
    BM25(d, Q) = Σ IDF(q_i) * f(q_i,d)*(k1+1) / (f(q_i,d) + k1*(1-b+b*|d|/avgdl))
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2009.10056，但该号在 arXiv 上是《Composed Variational Natural Language Generation for Few-shot Intents》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品或文档语料（标题与正文）、查询流（含精确型号/ASIN 与模糊语义两类）、可选的稠密向量索引；粒度为 文档 / 查询。

**输出**：BM25 与稠密两路结果经 RRF 融合后的统一排名（卡页口径 Recall@10 相比最优单路提升 15-22%、零结果率下降 45%）；供搜索服务使用。

## 执行步骤

1. 建立 BM25 稀疏索引与稠密向量索引两路
2. 把查询同时打给两路检索器
3. 用 RRF（或加权 RRF）融合两路排名
4. 对精确型号类查询校验字面命中，对语义查询校验召回
5. 上线后监控 Recall@10、零结果率与转化

## 边界与不做

- 数据不满足：缺少任一单路索引（无向量模型或不建 BM25）时融合无从谈起。
- 何时不用：只用语义召回且不需要精确型号覆盖，用「密集段落检索」；要用生成式方式理解复杂查询，用「LLM 生成式商品搜索」。
- 能力边界：只做召回融合，排序质量仍受单路模型上限约束，不含重排序与业务规则；卡页的 Recall@10 +15-22%、年化营收增量约 ¥35 万为案例口径。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals
- **延伸**：Skill-RAG-Reranking-CrossEncoder.html、Skill-RAG-Reranking-CrossEncoder
- **可组合**：Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy、Skill-Hybrid-Search-BM25-Vector

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：08-知识图谱　·　源卡：`Skill-Hybrid-Search-BM25-Vector`