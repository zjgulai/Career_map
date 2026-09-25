---
name: "p2s-graph-okb-design-sc"
title: "供应链操作知识库OKB图谱设计 — Neo4j+Delta双层架构与CDC实时同步策略"
description: "触发词：供应链图谱、OKB、多跳遍历、断供影响、CDC 同步。何时不用：只需几张表的常规报表或单跳查询时不用；本技能面向供应商到在途订单的多跳关系遍历与实时变更同步。安全边界：图谱承载供应商与采购数据，属商业敏感，访问须最小权限；CDC 同步不得把生产库凭证写进图服务。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Graph-OKB-Design-SC"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应商、SKU、库存、在途订单连成一张图，断供时几秒就能查出受影响范围和替代供应商。"
user_try: "试试：主供应商产能出问题，帮我列出受影响 SKU、可替代供应商和在途需要调整的 PO。"
whenToUse: "需要按关系做多跳影响分析（供应商到 SKU 到库存到在途 PO）时用本技能；单表统计或固定报表用常规数据管道技能。"
workflow: "定义节点与关系（供应商/SKU/仓库/采购单） → 把供货关系、BOM、在途 PO 建成图层 → 用 CDC 把源库变更实时同步进图 → 多跳遍历产出影响链与替代方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链操作知识库OKB图谱设计 — Neo4j+Delta双层架构与CDC实时同步策略

## ① 解决的问题

供应商断供影响链分析需要3层SQL JOIN耗时30分钟且容易漏查——Neo4j+Delta双层OKB将多跳BOM遍历从分钟级→2秒，供应商替代方案秒级发现

## ② 核心算法逻辑

OKB（操作知识库）vs 分析型数仓的根本区别：数仓回答"历史发生了什么"，OKB 支撑"现在该怎么做"。在 Palantir 架构中，Object Store 就是 OKB 的实现形式。

## ③ 业务应用场景

吸奶器主供应商突发产能危机，运营需要立即知道：哪些 SKU 受影响？有没有替代供应商？哪些在途 PO 需要取消？
传统 SQL 需要 3 层 JOIN（供应商→SKU→库存→在途PO），查询 >30 秒且容易漏查。Neo4j Cypher 多跳遍历 <2 秒完成完整影响链分析。
数据要求：供应商-SKU 供货关系、BOM 展开数据、在途 PO 记录 预期产出：影响 SKU 列表 + 可替代供应商排名 + 需取消/调整的 PO 清单 业务价值：应急响应从 3 小时人工梳理 → 2 秒自动图遍历，供应商替代方案发现时间 ↓95%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：供应商断供影响分析从 3 小时 → 2 秒（↓99.9%），AstraZeneca 400万节点 BOM 遍历 <2 秒，Rivian 根因分析 30 分钟 → <2 分钟（↓93%）
实施难度：⭐⭐⭐⭐☆（Neo4j AuraDB + Debezium CDC 是主要工程挑战）
优先级：⭐⭐⭐⭐⭐（企业 AI 知识库的核心基础设施，Palantir Object Store 的开源替代方案）
企业AI知识库依赖：极高 — OKB 本身即是企业 AI 知识库的图谱层，所有 Agent 的关系推理依赖于此

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（253 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/graph_okb_design_sc` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Graph-OKB-Design-SC.md`），已与卡面节选核对，不依赖上述路径。

```python
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
import math

@dataclass
class GraphNode:
    """知识图谱节点"""
    node_id: str
    node_type: str   # Supplier/Product/Warehouse/PurchaseOrder
    properties: Dict = field(default_factory=dict)

@dataclass
class GraphEdge:
    """知识图谱边"""
    from_id: str
    to_id: str
    relation_type: str  # SUPPLIES/CONTAINS/STORES/SHIPS_TO
    properties: Dict = field(default_factory=dict)

class SCKnowledgeGraph:
    """
    供应链知识图谱（内存图，用于原型验证）
    生产环境：替换为 Neo4j AuraDB Driver 调用
    
    核心能力：
    1. 多跳影响链遍历（断供影响分析）
    2. PageRank 关键节点识别
    3. 相似节点发现（可替代供应商）
    4. BOM 成本传播计算
    """
    
    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.edges: List[GraphEdge] = []
        self._adjacency: Dict[str, List[Tuple[str, str, Dict]]] = {}  # node_id → [(neighbor, rel, props)]
        self._reverse_adj: Dict[str, List[Tuple[str, str, Dict]]] = {}
    
    def add_node(self, node: GraphNode):
        self.nodes[node.node_id] = node
    
    def add_edge(self, edge: GraphEdge):
        self.edges.append(edge)
        if edge.from_id not in self._adjacency:
            self._adjacency[edge.from_id] = []
        self._adjacency[edge.from_id].append((edge.to_id, edge.relation_type, edge.properties))
        if edge.to_id not in self._reverse_adj:
            self._reverse_adj[edge.to_id] = []
        self._reverse_adj[edge.to_id].append((edge.from_id, edge.relation_type, edge.properties))
    
    def find_supply_disruption_impact(self, disrupted_supplier_id: str,
                                       max_hops: int = 4) -> Dict:
        """
        供应商断供影响链分析（模拟 Cypher 多跳遍历）
        对应 Cypher:
          MATCH (s:Supplier {id: $id})-[:SUPPLIES*1..4]->(affected)
          RETURN affected
        """
        affected = {}
        queue = [(disrupted_supplier_id, 0)]
        visited = {disrupted_supplier_id}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商与 SKU 的供货关系、BOM 展开数据、在途 PO 记录，以及源库变更流（CDC）；实体粒度到 SKU 与 PO 单据。

**输出**：影响 SKU 列表、可替代供应商排名、需取消或调整的 PO 清单，供供应链应急响应使用。

## 执行步骤

1. 定义节点类型与关系类型
2. 把供货、BOM、库存、在途 PO 数据灌入图库
3. 接入 CDC 保持图与源库同步
4. 用多跳遍历查询影响链
5. 输出受影响 SKU、替代供应商与 PO 调整清单

## 边界与不做

- 只有单跳查询或常规报表需求时不用本技能。
- 本技能产出图模型与影响分析结论，不直接取消或修改 PO。
- 供采数据属商业敏感，需最小权限访问；生产库凭证不得进入图服务代码。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Ontology-LLM-AutoBuild-SC.html、Skill-Ontology-LLM-AutoBuild-SC、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-SKU-Master-Data-Golden-Record.html、Skill-SKU-Master-Data-Golden-Record、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking、Skill-Supply-Chain-Data-Mesh-Architecture.html、Skill-Supply-Chain-Data-Mesh-Architecture
- **延伸**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Ontology-LLM-AutoBuild-SC.html、Skill-Ontology-LLM-AutoBuild-SC、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Data-Mesh-Architecture.html、Skill-Supply-Chain-Data-Mesh-Architecture
- **可组合**：Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SC-Digital-Twin-Sync-Architecture.html、Skill-SC-Digital-Twin-Sync-Architecture、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Graph-OKB-Design-SC

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：24-标签工程　·　源卡：`Skill-Graph-OKB-Design-SC`