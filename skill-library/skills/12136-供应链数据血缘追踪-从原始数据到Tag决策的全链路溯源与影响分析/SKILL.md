---
name: "p2s-supply-chain-data-lineage-tracking"
title: "供应链数据血缘追踪 — 从原始数据到Tag决策的全链路溯源与影响分析"
description: "触发词：供应链血缘、标签溯源、影响分析、审计报告、决策依据。何时不用：面向推荐模型做法规级数据来源证明走数据血缘追踪；只是比对多系统数字一致性走跨系统对账。安全边界：须满足 GDPR、CSRD 等监管对可追溯性的要求，审计报告须保留完整来源链证据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-142"
l3_business: "溯源监测"
l3_all: "溯源监测 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/溯源监测"
p2s_card_id: "Skill-Supply-Chain-Data-Lineage-Tracking"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "从原始数据一路追到标签与补货动作，出问题时几分钟就能定位到源头。"
user_try: "试试：这次补货是被哪个标签触发的？沿着血缘把上游数据源追出来。"
whenToUse: "AI 触发的业务动作需要解释数据依据、或数据出错要快速定位来源时用；只是比对多系统数字一致性请转跨系统对账。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链数据血缘追踪 — 从原始数据到Tag决策的全链路溯源与影响分析

## ① 解决的问题

数据团队面临"AI补货触发后不知道数据来源"——血缘图谱将数据问题排查从2天→5分钟，满足EU AI Act可解释性合规要求

## ② 核心算法逻辑

数据血缘（Data Lineage） 追踪回答三个关键问题：

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：数据问题排查从"2天找数据来源"→"5分钟溯源"，合规审计证明AI决策依据节省法务时间约20小时/次；防止因数据错误导致的错误补货（每次约损失5-10万元）
实施难度：⭐⭐⭐⭐☆（需要在数据管道中埋点，初期工程投入较大）
优先级评分：⭐⭐⭐⭐☆（监管合规（GDPR/CSRD）要求数据可追溯；AI决策的可解释性需要血缘支撑）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/supply_chain_data_lineage_tracking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Supply-Chain-Data-Lineage-Tracking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链数据血缘追踪系统
功能：血缘图谱构建 / 溯源查询 / 影响分析 / 审计报告
"""
from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict, deque
import warnings
warnings.filterwarnings('ignore')


@dataclass
class LineageNode:
    node_id: str
    node_type: str      # DataSource / Transform / Tag / Action
    name: str
    metadata: dict = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


@dataclass
class LineageEdge:
    from_id: str
    to_id: str
    edge_type: str      # PRODUCES / CONSUMES / TRIGGERS
    transform_info: str = ""


class DataLineageGraph:

    def __init__(self):
        self.nodes: dict = {}
        self.edges: list = []
        self.adj: dict = defaultdict(list)      # 正向
        self.radj: dict = defaultdict(list)     # 反向

    def add_node(self, node: LineageNode):
        self.nodes[node.node_id] = node

    def add_edge(self, edge: LineageEdge):
        self.edges.append(edge)
        self.adj[edge.from_id].append(edge)
        self.radj[edge.to_id].append(edge)

    def trace_upstream(self, node_id: str, max_hops: int = 5) -> list:
        """溯源：追踪某Tag/决策的数据来源"""
        visited, path = set(), []
        queue = deque([(node_id, 0)])
        while queue:
            nid, hop = queue.popleft()
            if nid in visited or hop > max_hops:
                continue
            visited.add(nid)
            node = self.nodes.get(nid)
            if node:
                path.append({"hop": hop, "node": node.name, "type": node.node_type, "id": nid})
            for edge in self.radj[nid]:
                queue.append((edge.from_id, hop + 1))
        return path
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.08923，但该号在 arXiv 上是《Fast Approximation of the Shapley Values Based on Order-of-Addition Experimental Designs》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应链数据链路的节点（数据源、加工步骤、标签、决策动作）与它们之间的依赖关系

**输出**：血缘图谱、上游溯源查询结果、影响分析与审计报告，供合规审计与故障排查使用

## 执行步骤

1. 把数据源、加工步骤、标签与决策动作登记为血缘节点与边。
2. 顺着血缘做上游溯源，定位触发某次补货标签的原始数据。
3. 做影响分析，评估某个数据源异常会影响哪些标签与动作。
4. 导出审计报告，作为 AI 决策依据的可解释性证据。

## 边界与不做

- 何时不用：要面向推荐模型做法规级数据来源证明时，请转通用的数据血缘追踪。
- 能力边界：血缘只描述依赖关系，不判断数据正确性与标签合理性。
- 安全边界：须满足 GDPR、CSRD 等监管对可追溯性的要求，审计报告须保留完整来源链证据。

## 技能关联

- **前置**：Skill-Cross-System-Data-Reconciliation.html、Skill-Cross-System-Data-Reconciliation、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SKU-Master-Data-Golden-Record.html、Skill-SKU-Master-Data-Golden-Record、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **延伸**：Skill-Cross-System-Data-Reconciliation.html、Skill-Cross-System-Data-Reconciliation、Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Cross-System-Data-Reconciliation.html、Skill-Cross-System-Data-Reconciliation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Supply-Chain-Data-Lineage-Tracking

---

> 分类：数据与Agent平台/数据与AI运行/溯源监测　·　技术族：24-标签工程　·　源卡：`Skill-Supply-Chain-Data-Lineage-Tracking`