---
name: "p2s-rag-reranking-crossencoder"
title: "检索后精排 — Cross-Encoder Reranking"
description: "触发词：检索精排、候选重排、Top3准确率、FAQ检索、注意力位置衰减。何时不用：候选只有三五条时不必重排；要用大模型对整列表排序时用 Listwise 重排。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-RAG-Reranking-CrossEncoder"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "在召回之后加一层精排模型，把最相关的几条 FAQ 顶到前面，减少模型因位置靠后而忽略关键信息的概率。"
user_try: "试试：把这 20 条候选 FAQ 精排一下，只把最相关的 5 条放进答案上下文。"
whenToUse: "属于「业务工具实现」：召回候选多但排序不准、导致答案漏掉关键条款时用；若候选只有三五条，重排收益有限；要用大模型做整列表排序，用 Listwise 重排技能。"
workflow: "先用混合检索召回候选（卡页示例 top-20） → 用 Cross-Encoder 对每个候选与查询逐条打分 → 按分数重排，只把最相关的前几条交给生成模型 → 用 NDCG 等指标评估重排前后的效果差异 → 上线后监控人工介入率与自动回复准确率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 检索后精排 — Cross-Encoder Reranking

## ① 解决的问题

知识产品经理面临搜索结果前后不一致——重排模型将Top3准确率提升16%，年化省9万元

## ② 核心算法逻辑

RAG 管道的检索阶段（BM25/向量检索）优先保证召回率，会返回大量候选文档（top50~100）。但这些候选文档与查询的相关性排序往往不准——召回阶段的 Biencoder 是独立编码查询和文档，无法捕捉两者间的细粒度交互。

## ③ 业务应用场景

业务问题： 母婴出海卖家的客服 FAQ 系统包含 2000+ 条目，覆盖退换货政策、安全认证、喂养指南等话题。混合检索召回 top-20 候选后，LLM 直接基于这 20 条生成答案，但排名靠后的高相关 FAQ 经常被 LLM 忽略（注意力随位置衰减）。
解决方案： 引入 BGE-Reranker-v2 对 top-20 候选重排，将最相关的 5 条 FAQ 放在前面送给 LLM，显著减少 LLM 忽略关键信息的概率。
业务价值： - 客服自动回复准确率提升 21pp - 人工客服介入率从 38% 降至 21% - 年化节省人工客服成本约 ¥28 万（月均 5000 工单 × 17% 减少量 × 人均成本）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

28 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（464 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/knowledge_graph/rag_reranking_crossencoder` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-RAG-Reranking-CrossEncoder.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
检索后精排系统（Cross-Encoder Reranking）
基于 arXiv:2310.07554 和 arXiv:2304.09542

功能：
1. Pointwise Cross-Encoder 精排（Mock + 真实模型接口）
2. Listwise LLM 精排（Mock 实现）
3. 融合元数据的混合精排
4. 母婴 FAQ 精排演示 + 3 测试用例
5. NDCG@k 评估指标

Author: paper2skills
Date: 2026-06-06
"""

import math
import re
import ast
from typing import List, Dict, Tuple, Optional, Callable
from dataclasses import dataclass, field


# ============================================================
# 数据模型
# ============================================================

@dataclass
class Candidate:
    """精排候选文档"""
    doc_id: str
    text: str
    title: str = ""
    initial_rank: int = 0       # 召回阶段排名
    initial_score: float = 0.0  # 召回阶段分数
    metadata: Dict = field(default_factory=dict)

    def full_text(self) -> str:
        return f"{self.title} {self.text}".strip()


@dataclass
class RerankResult:
    """精排结果"""
    doc_id: str
    rerank_score: float
    rerank_rank: int
    initial_rank: int
    rank_change: int  # 正数=上升，负数=下降
    document: Optional[Candidate] = None


# ============================================================
# Cross-Encoder 精排器（Pointwise）
# ============================================================

class CrossEncoderReranker:
    """
    Pointwise Cross-Encoder 精排器
    
    s(q, d) = BERT([CLS] q [SEP] d [SEP])
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2309.15088 — RankVicuna: Zero-Shot Listwise Document Reranking with Open-Source Large Language Models

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：候选文档集（卡页示例 FAQ 系统 2000+ 条目，混合检索召回 top-20）与查询语句；卡页第 4 段未给字段级规格，落地前需确认候选数量与文本长度上限。

**输出**：重排后的候选列表与答案依据：卡页示例把客服自动回复准确率提升 21 个百分点、人工客服介入率从 38% 降到 21%，年化节省人工客服成本约 28 万元。

## 执行步骤

1. 先用混合检索召回候选文档（卡页示例 top-20）
2. 用 Cross-Encoder 对每个候选与查询逐条打分
3. 按分数重排，只把最相关的前几条交给生成模型
4. 用 NDCG 等指标评估重排前后的效果差异
5. 上线后监控人工介入率与自动回复准确率

## 边界与不做

- 数据不满足时不用：候选集很小，或候选文本极短时，Cross-Encoder 的重排收益有限。
- 能力边界：本卡只做候选重排，不解决召回阶段就漏掉相关文档的问题，那部分要靠召回策略与查询扩展。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Hybrid-Search-BM25-Vector.html、Skill-Hybrid-Search-BM25-Vector
- **延伸**：Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **可组合**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-HyDE-Hypothetical-Document.html、Skill-HyDE-Hypothetical-Document、Skill-RAG-Reranking-CrossEncoder

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-RAG-Reranking-CrossEncoder`