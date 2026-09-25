---
name: "p2s-causalrag-causal-graph-retrieval"
title: "CausalRAG — 因果图增强检索：语义相似 + 因果链路双轨 RAG"
description: "触发词：因果图检索、因果三元组、沿链路取证、知识溯源、相关不等于因果。何时不用：知识库中没有明确因果表述、或问题只需单跳事实检索时不适用；只按复杂度路由检索次数用自适应查询路由。安全边界：只做检索与因果路径组织，不判定因果真伪；节点须保留来源与置信度，答案须可回溯出处。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-CausalRAG-Causal-Graph-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把散落的法规、召回案例和业务影响用因果链路串起来，回答为什么和接下来会怎样的问题。"
user_try: "试试：帮我查清 FDA 21 CFR 107 是什么、违规会引发什么召回、召回又会带来哪些业务影响，并给出证据出处。"
whenToUse: "当问题需要完整因果链（触发、后果、连带影响）而非单点事实时用本卡；只需相关文档召回用普通检索；只需按复杂度决定检索次数用自适应查询路由。"
workflow: "从文档抽取因果三元组并标注来源 → 构建有向因果图与正反向邻接表 → 语义检索定位查询的入口节点 → 沿因果路径做前向与后向遍历 → 汇总路径节点生成带出处的答案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CausalRAG — 因果图增强检索：语义相似 + 因果链路双轨 RAG

## ① 解决的问题

研究经理面临知识检索只会相关不会因果——因果检索将方案误判率降35%，年化省10万元

## ② 核心算法逻辑

传统 RAG 的两个核心问题

## ③ 业务应用场景

业务问题： 运营团队需要查询"婴儿配方奶粉 FDA 21 CFR 107 是什么？违规会导致什么召回？召回会触发哪些业务影响？"这类需要完整因果链的问题。
传统 RAG 的缺陷： 语义检索会分别返回"21 CFR 107 法规文本"、"召回案例"、"业务损失报告"三段不相关的文本块，LLM 需要自行推理它们的因果连接，容易出错或遗漏。
CausalRAG 的优势： 构建因果图后，图中已存在显式路径： 检索时沿该路径抽取所有相关节点，LLM 获得完整因果上下文，生成连贯且准确的答案。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（350 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/causalrag_causal_graph_retrieval` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-CausalRAG-Causal-Graph-Retrieval.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CausalRAG — 因果图增强检索
论文：CausalRAG: Integrating Causal Graphs into Retrieval-Augmented Generation
arXiv：2503.19878 | ACL Findings 2025
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import re
import math
from collections import defaultdict, deque


# ──────────────────────────────────────────────
# 数据类
# ──────────────────────────────────────────────

@dataclass
class CausalTriple:
    """因果三元组"""
    cause: str
    relation: str  # leads_to / causes / triggers / results_in
    effect: str
    source_doc: str
    confidence: float = 1.0

    def __repr__(self) -> str:
        return f"[{self.cause}] --{self.relation}--> [{self.effect}] (doc={self.source_doc})"


@dataclass
class Document:
    """文档片段"""
    doc_id: str
    content: str
    metadata: dict = field(default_factory=dict)


# ──────────────────────────────────────────────
# 因果知识图谱
# ──────────────────────────────────────────────

class CausalKnowledgeGraph:
    """有向因果图：存储因果三元组，支持前向/后向链路遍历"""

    CAUSAL_PATTERNS = [
        (r"(.+?)\s+(?:leads? to|lead to)\s+(.+)", "leads_to"),
        (r"(.+?)\s+(?:causes?|cause)\s+(.+)", "causes"),
        (r"(.+?)\s+(?:triggers?|trigger)\s+(.+)", "triggers"),
        (r"(.+?)\s+(?:results? in|result in)\s+(.+)", "results_in"),
        (r"(?:due to|because of)\s+(.+?),\s+(.+)", "caused_by"),
        (r"(.+?)\s+(?:导致|引起|触发)\s+(.+)", "leads_to"),
        (r"(.+?)\s+(?:造成|引发)\s+(.+)", "causes"),
    ]

    def __init__(self):
        # 邻接表：cause -> [(relation, effect, triple)]
        self._forward: dict[str, list[tuple[str, str, CausalTriple]]] = defaultdict(list)
        # 反向邻接表：effect -> [(relation, cause, triple)]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2503.19878 — CausalRAG: Integrating Causal Graphs into Retrieval-Augmented Generation
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待检索的文档片段集合（每条含文档标识与正文），以及从文档中抽取的因果三元组（原因、关系、结果、来源文档与置信度）；关系类型如导致、引起、触发、造成。

**输出**：沿因果路径抽取的全部相关节点、组织好的完整因果上下文与带出处的答案，供研究、运营与合规人员追溯结论依据。

## 执行步骤

1. 从文档中抽取因果三元组（原因、关系、结果）并标注来源文档
2. 构建有向因果图与正反向邻接表
3. 对查询做语义检索定位入口节点
4. 沿因果路径做前向与后向链路遍历
5. 汇总路径上的全部节点作为上下文生成答案
6. 为答案标注出处文档与因果关系置信度

## 边界与不做

- 何时不用：知识库中没有明确因果表述、或问题只需单跳事实检索时不适用；简单事实问答用普通 RAG 即可。
- 能力边界：只做检索与因果路径组织，不验证因果关系本身的真伪；抽取质量直接决定答案质量。
- 溯源边界：节点须保留来源文档与置信度，答案必须能回溯到具体出处。

## 技能关联

- **前置**：Skill-Causal-Discovery-PC-Algorithm.html、Skill-Causal-Discovery-PC-Algorithm、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **延伸**：Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **可组合**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-CausalRAG-Causal-Graph-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-CausalRAG-Causal-Graph-Retrieval`