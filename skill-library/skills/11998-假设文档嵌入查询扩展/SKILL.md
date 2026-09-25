---
name: "p2s-hyde-hypothetical-document"
title: "HyDE - 假设文档嵌入查询扩展"
description: "触发词：查询扩展、跨语言检索、假设文档、冷启动召回、口语查询。何时不用：查询规范且与文档同语言时普通检索即可；要生成多条查询变体再融合时用多查询融合。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-HyDE-Hypothetical-Document"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "先把用户的口语提问写成一段假设答案，再用这段假答案去检索专业文档，跨语言的冷启动查询也能搜到东西。"
user_try: "试试：用户用中文问奶瓶能不能微波加热，帮我检索英文说明书并给出可读答案。"
whenToUse: "属于「业务工具实现」：查询与文档在语言或表述上差异大、关键词稀疏导致召回低时用；若查询规范且与文档同语言，普通检索即可；若要生成多条查询变体并融合排名，用多查询融合。"
workflow: "接收用户原始查询，保留其口语与语言特征 → 用 LLM 生成假设文档，覆盖目标文档的专业表述 → 用假设文档的嵌入替代原始查询向量做检索 → 必要时生成多条假设文档取平均，提升检索稳定性 → 把检索结果翻译或改写后返回用户"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HyDE - 假设文档嵌入查询扩展

## ① 解决的问题

研究员面临冷启动问题搜不到高质量答案——假设文档生成将首轮召回率提升20%，年化省9万元

## ② 核心算法逻辑

HyDE（Hypothetical Document Embeddings） 的洞察极其简单却有效：

## ③ 业务应用场景

业务背景：中国消费者在海外购物平台用中文口语提问（"这个奶瓶能放微波炉加热吗"），需要检索英文产品说明书中的专业表述（"Microwave sterilization: Polypropylene (PP) materials are rated for microwave use up to 120°C for 5 minutes maximum"）。直接用中文 embedding 检索英文文档，因语言差异召回率仅 38%。
HyDE 方案： 1. 中文查询 → LLM 生成英文假设答案："Microwave heating for PP baby bottles is safe under specific conditions..." 2. 用英文假设文档 embedding 检索英文产品手册 3. 检索结果翻译返回用户
量化 ROI： | 指标 | 无 HyDE | 有 HyDE | 提升 | |---|---|---|---| | 跨语言检索召回率 | 38% | 71% | +87% | | MRR@10 | 0.31 | 0.58 | +87% | | 用户找到正确信息率 | 41% | 76% | +85% | | 退货（错误操作导致）| 3.8% | 1.9% | -50% |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（411 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/knowledge_graph/hyde_hypothetical_document` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-HyDE-Hypothetical-Document.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
HyDE - 假设文档嵌入查询扩展
arXiv: 2212.10496 (HyDE, CMU, 2022)

实现要点：
1. LLM 生成假设文档（mock）
2. 用假设文档 embedding 替代查询 embedding 检索
3. 支持多假设文档平均（HyDE-Multi）
4. 支持查询-假设文档混合权重

运行环境：Python 3.9+，无需外部 API（全 mock）
"""

import ast
import math
import random
from typing import Dict, List, Optional, Tuple


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

class Document:
    """检索文档"""
    def __init__(self, doc_id: str, text: str, metadata: Optional[Dict] = None):
        self.doc_id = doc_id
        self.text = text
        self.metadata = metadata or {}
        self.embedding: Optional[List[float]] = None


# ─────────────────────────────────────────────
# Mock 工具函数
# ─────────────────────────────────────────────

def mock_embed(text: str, dim: int = 32) -> List[float]:
    """
    Mock embedding：deterministic，基于文本内容

    关键设计：专业词汇相似的文本会产生相近 embedding，
    模拟 HyDE "假设文档与真实文档措辞相近" 的效果
    """
    random.seed(hash(text) % (2 ** 31))
    base = [random.gauss(0, 1) for _ in range(dim)]

    # 注入领域信号：包含相同关键词的文本 embedding 更接近
    professional_keywords = [
        "月龄", "婴儿", "配方", "BPA", "FDA", "CE认证",
        "polypropylene", "BPA-free", "infant", "formula",
        "microwave", "sterilization", "0-6", "newborn",
        "双边", "水解", "低敏",
    ]
    for keyword in professional_keywords:
        if keyword.lower() in text.lower():
            random.seed(hash(keyword) % (2 ** 31))
            signal = [random.gauss(0, 0.3) for _ in range(dim)]
            base = [b + s for b, s in zip(base, signal)]

    norm = math.sqrt(sum(v * v for v in base)) + 1e-9
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2212.10496 — Precise Zero-Shot Dense Retrieval without Relevance Labels

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户原始查询（可为口语化或多语言）、目标文档库与可调用的 LLM；卡页第 4 段未给字段级规格，落地前需确认文档语言分布与生成模型的可用性。

**输出**：检索命中的文档与面向用户的可读答案；卡页示例把跨语言检索召回率从 38% 提升至 71%、MRR@10 从 0.31 提升至 0.58、用户找到正确信息率从 41% 提升至 76%。

## 执行步骤

1. 接收用户原始查询，保留其口语与语言特征
2. 用 LLM 生成假设文档，覆盖目标文档的专业表述
3. 用假设文档的嵌入替代原始查询向量做检索
4. 必要时生成多条假设文档取平均，提升检索稳定性
5. 把检索结果翻译或改写后返回给用户

## 边界与不做

- 数据不满足时不用：没有可调用的生成模型，或目标文档本身就是口语文本时，假设文档带来的增益有限。
- 能力边界：本卡产出查询扩展与检索策略，不改善文档库本身的内容质量与覆盖度。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals
- **延伸**：Skill-RAG-Reranking-CrossEncoder.html、Skill-RAG-Reranking-CrossEncoder
- **可组合**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-RAPTOR-Hierarchical-RAG.html、Skill-RAPTOR-Hierarchical-RAG、Skill-HyDE-Hypothetical-Document

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-HyDE-Hypothetical-Document`