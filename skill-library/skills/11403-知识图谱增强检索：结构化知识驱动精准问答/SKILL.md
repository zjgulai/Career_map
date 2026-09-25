---
name: "p2s-graph-rag-knowledge-retrieval"
title: "Graph RAG Knowledge Retrieval — 知识图谱增强检索：结构化知识驱动精准问答"
description: "触发词：知识图谱、多跳推理、Graph RAG、供应商关联、跨SKU问题发现。何时不用：单跳的关键词或语义检索用常规检索即可；只做来料质量 KPI 统计用「供应商来料质量KPI」。安全边界：图谱中的供应商与客户数据须脱敏授权，推理结论不得直接用作对外指控依据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 供应商评估"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Graph-RAG-Knowledge-Retrieval"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "顺着产品、退货、供应商之间的关系一路查下去，找出被同一个供应商牵连的其他产品。"
user_try: "试试：查一下退货率升高的产品和哪些供应商有关联，这些供应商还给哪些 SKU 供货。"
whenToUse: "问题跨越产品、供应商、评论等多个实体、需要多跳推理时用；单点查询与统计报表不需要图谱。"
workflow: "构建产品、供应商、问题、评论等实体与关系边 → 从问题实体出发做限定跳数的图搜索 → 沿关系链找出受影响的关联产品 → 输出多跳推理结论与风险清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Graph RAG Knowledge Retrieval — 知识图谱增强检索：结构化知识驱动精准问答

## ① 解决的问题

向量RAG无法回答「高退货产品的供应商还给哪些产品供货」等多跳推理问题——知识图谱增强检索沿图边多跳遍历发现跨SKU系统性质量问题，避免批量召回损失年化50-200万元

## ② 核心算法逻辑

向量 RAG vs Graph RAG：

## ③ 业务应用场景

业务问题："最近退货率升高的产品，和哪些供应商有关联？这些供应商的其他产品是否也有问题？"——这个问题需要：产品→退货→供应商→供应商其他产品，4跳推理，向量RAG无法回答。
数据要求： - 产品-供应商关联表 - 产品-退货记录 - 评论情感数据
预期产出： - 供应商质量风险图谱 - 自动识别"问题供应商"影响的所有产品 - 多跳推理报告："退货率高 → 噪音问题 → 电机供应商X → 供应商X还供货给PUMP-003/PUMP-007"

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
发现跨 SKU 的系统性供应商质量问题（向量 RAG 无法发现）：避免批量召回损失 ¥50-200 万
自动化多跳推理替代人工数据挖掘：每次深度分析节省 1-3 天，年化 ¥5-15 万
竞品情报图谱查询：更快发现市场机会
年化综合 ROI：¥20-80 万（以避损为主）
实施难度：⭐⭐⭐☆☆（微软 GraphRAG 开源可用；需要构建结构化知识图谱；约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（189 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/graph_rag_knowledge_retrieval` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Graph-RAG-Knowledge-Retrieval.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Graph RAG Knowledge Retrieval
知识图谱增强检索：多跳推理回答复杂商业问题
"""
from dataclasses import dataclass, field
from collections import defaultdict, deque
from typing import Optional


@dataclass
class KGNode:
    """知识图谱节点"""
    node_id: str
    node_type: str    # product / supplier / issue / review / customer
    properties: dict = field(default_factory=dict)
    embedding: list = field(default_factory=list)


class EcommerceKnowledgeGraph:
    """电商领域知识图谱"""

    def __init__(self):
        self.nodes: dict[str, KGNode] = {}
        self.edges: dict[str, list[tuple]] = defaultdict(list)
        # edges[from_id] = [(to_id, relation_type, weight)]

    def add_node(self, node: KGNode):
        self.nodes[node.node_id] = node

    def add_edge(self, from_id: str, to_id: str, relation: str, weight: float = 1.0):
        self.edges[from_id].append((to_id, relation, weight))
        # 无向图
        self.edges[to_id].append((from_id, f'reverse_{relation}', weight))

    def local_search(self, start_node_id: str, max_hops: int = 3,
                     min_weight: float = 0.5) -> list[dict]:
        """从起始节点出发的局部图搜索（多跳检索）"""
        if start_node_id not in self.nodes:
            return []

        visited = set()
        results = []
        queue = deque([(start_node_id, 0, [])])  # (node_id, depth, path)

        while queue:
            node_id, depth, path = queue.popleft()
            if node_id in visited or depth > max_hops:
                continue
            visited.add(node_id)

            node = self.nodes[node_id]
            results.append({
                'node_id': node_id,
                'type': node.node_type,
                'depth': depth,
                'path': path,
                'properties': node.properties,
            })

            for (neighbor_id, relation, weight) in self.edges.get(node_id, []):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2404.16130 — From Local to Global: A Graph RAG Approach to Query-Focused Summarization
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：产品与供应商关联表、产品退货记录、评论情感数据，以及实体属性与关系权重；节点类型含产品、供应商、问题、评论、客户。

**输出**：供应商质量风险图谱、问题供应商影响的产品清单与多跳推理报告（含推理路径），供质量与采购联合排查。

## 执行步骤

1. 整理产品、供应商、退货与评论数据
2. 构建实体节点与关系边（含权重）
3. 从问题实体出发做限定跳数与权重的图搜索
4. 沿推理路径找出关联产品
5. 输出多跳推理报告与风险清单

## 边界与不做

- 数据不满足时不适用：缺少产品与供应商的关联数据时，图谱无法建立多跳路径。
- 能力边界：只产出关联推理与风险清单，责任判定、供应商约谈与召回决策由人工与合规流程负责。

## 技能关联

- **前置**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Multimodal-RAG.html、Skill-Multimodal-RAG、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver
- **延伸**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver
- **可组合**：Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-VOC-Returns-Cost-Driver.html、Skill-VOC-Returns-Cost-Driver、Skill-Graph-RAG-Knowledge-Retrieval

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：08-知识图谱　·　源卡：`Skill-Graph-RAG-Knowledge-Retrieval`