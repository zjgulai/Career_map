---
name: "p2s-graph-grounded-mas-protocol"
title: "G²CP — 图结构 MAS 通信协议：消除级联幻觉"
description: "触发词：MAS 通信协议、图结构消息、级联幻觉、认证信息传递、字段级契约。何时不用：单 Agent 场景或信息允许措辞损失时不必协议化；要检测单条回答的幻觉走三元组幻觉检测。安全边界：认证类信息传递必须无损，任何措辞偏差（如 compliant with 被写成 certified by）都可能触发平台下架，不得由自然语言改写。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 依赖协调"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-Graph-Grounded-MAS-Protocol"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "让 Agent 之间传结构化图消息而不是自然语言，认证与预测数字不再被传歪。"
user_try: "试试：把合规 Agent 到文案 Agent 的认证信息改成图结构传递，避免措辞失真。"
whenToUse: "多个 Agent 之间有必须无损传递的字段（认证、预测数值、约束）时用；单 Agent 或可容忍措辞损失的场景不必。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# G²CP — 图结构 MAS 通信协议：消除级联幻觉

## ① 解决的问题

数据产品经理面临知识源引用失真——Graph-Grounded Protocol将错引率9%降到1%，年化省14万元

## ② 核心算法逻辑

传统 LLM MultiAgent System（MAS）中，Agent 之间通过自然语言传递信息。自然语言的歧义性导致两个严重问题：

## ③ 业务应用场景

业务痛点：Amazon 母婴品类对产品认证极为敏感（ASTM F963、EN 71、CPSC），如果合规 Agent 输出的认证信息以自然语言传递给文案 Agent，一旦措辞有偏差（如 "compliant with" → "certified by"），就可能触发 Amazon 下架，损失数万美元库存。
量化效益：认证信息传递准确率 100%（vs 自然语言 73%），Amazon 合规投诉归零，listing 制作时间 -60%。
业务痛点：需求预测 Agent 输出的 SKU 预测结果，以自由文本传给库存 Agent，导致"预计销量约 500 件"被解读为"备货 500 件"，忽略了安全库存系数和 MOQ 约束，产生错误采购单。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Amazon listing 认证错误下架：每次 ~$5,000-20,000 损失 → G²CP 后归零
采购错误率 -89% → 超买库存资金占用减少约 15%
合规风险损失：假设中型卖家年均 2 次事故，单次 $10,000 → 年节省 $20,000+

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（326 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/mas/graph_grounded_mas_protocol` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Graph-Grounded-MAS-Protocol.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
G²CP: Graph-Grounded Communication Protocol
图结构 MAS 通信协议 — 消除 LLM 多 Agent 系统的级联幻觉

论文: arXiv 2602.13370 | AAMAS 2026
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional
import json


# ─── 数据结构 ────────────────────────────────────────────────────────────────

class QueryType(Enum):
    NODE_LOOKUP = "NodeLookup"
    EDGE_TRAVERSAL = "EdgeTraversal"
    SUBGRAPH_FILTER = "SubgraphFilter"


@dataclass
class GraphNode:
    node_id: str
    node_type: str
    attributes: dict[str, Any] = field(default_factory=dict)

    def get(self, attr: str, default=None):
        return self.attributes.get(attr, default)

    def update(self, **kwargs):
        self.attributes.update(kwargs)


@dataclass
class GraphEdge:
    src: str
    tgt: str
    relation: str
    weight: float = 1.0


@dataclass
class GraphMessage:
    """Agent 间通信的图消息单元，替代自然语言"""
    sender: str
    receiver: str
    query_type: QueryType
    nodes: list[GraphNode] = field(default_factory=list)
    edges: list[GraphEdge] = field(default_factory=list)
    query_params: dict[str, Any] = field(default_factory=dict)
    trace_id: str = ""  # 全审计链 ID

    def serialize(self) -> str:
        """序列化为 JSON，供网络传输"""
        return json.dumps({
            "sender": self.sender,
            "receiver": self.receiver,
            "query_type": self.query_type.value,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2602.13370，但该号在 arXiv 上是《G2CP: A Graph-Grounded Communication Protocol for Verifiable and Efficient Multi-Agent Reasoning》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：跨 Agent 传递的实体与字段定义（如认证类型、预测数量、安全库存系数、MOQ 约束）与图谱模式

**输出**：图结构消息契约（节点与边的序列化格式、字段类型与校验规则），供各 Agent 按协议读写而不走自然语言

## 执行步骤

1. 把需要跨 Agent 传递的信息定义成图谱节点与边（含字段类型）。
2. 约定消息序列化格式与校验规则，禁止用自然语言承载关键字段。
3. 发送方按协议写入、接收方按类型读取，越界即报错而非猜测。
4. 为预测类数值同时传递约束字段（安全库存系数、MOQ），避免被当成下单量。

## 边界与不做

- 何时不用：只有单个 Agent，或信息本身允许措辞损失时，协议化传递的成本不划算。
- 能力边界：只定义通信契约与数据格式，不替任何 Agent 决定业务结论。
- 安全边界：认证类信息的传递必须无损，任何措辞偏差（如 compliant with 被写成 certified by）都可能触发平台下架，不得由自然语言改写。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack
- **延伸**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction
- **可组合**：Skill-Agent-QMix-Topology-Learning.html、Skill-Agent-QMix-Topology-Learning、Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-Graph-Grounded-MAS-Protocol

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：10-MAS　·　源卡：`Skill-Graph-Grounded-MAS-Protocol`