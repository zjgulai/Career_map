---
name: "p2s-bom-cost-rollup-tag-engine"
title: "BOM成本卷积标签引擎 — 从原材料到制成品的全层级成本精算与Tag驱动"
description: "触发词：BOM成本、成本卷积、涨价传导、成本Tag、价格倒挂预警。何时不用：算采购加仓储加物流加质量的全链路总成本用「供应链总成本TCO模型」，算采购价格达成率用「采购价格达成率KPI」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-044"
l3_business: "采购比价"
l3_all: "采购比价 / 经济性分析"
l1_l2_l3: "业务运营/供应与履约/采购比价"
p2s_card_id: "Skill-BOM-Cost-Rollup-Tag-Engine"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "原料一涨价就知道哪些成品成本变了、变了多少钱，别等价格倒挂亏了一个季度才发现。"
whenToUse: "本卡属采购比价中的成本结构侧：需要把原材料价格变动沿多层级 BOM 传导到成品成本时用；横向比较采购、仓储、物流、质量的综合成本用供应链总成本 TCO 类技能。"
workflow: "结构化录入多层级 BOM 节点与子件关系 → 注册各叶节点的原材料价格与用量 → 价格变动时递归卷积向上重算各级成本 → 更新成本 Tag 并对成本倒挂的成品发预警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# BOM成本卷积标签引擎 — 从原材料到制成品的全层级成本精算与Tag驱动

## ① 解决的问题

采购面临"铜价上涨但不知道影响哪些产品成本多少"——BOM卷积Tag实时传播价格变动，避免价格倒挂季度亏损约5万元

## ② 核心算法逻辑

BOM（Bill of Materials）成本卷积 将原材料价格的每一次变化，精确传递到制成品的成本标签，实现成本的实时追踪。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：原材料价格波动时实时感知成本影响，避免价格倒挂（以铜价上涨5%为例，不及时响应可能导致季度亏损约5万元）；精准BOM成本使定价决策准确率提升约20%
实施难度：⭐⭐⭐☆☆（需要BOM数据结构化，OEM/ODM模式下供应商要提供BOM配合）
优先级评分：⭐⭐⭐⭐☆（原材料价格波动是2024-2025年跨境卖家的主要利润风险之一）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（130 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/bom_cost_rollup_tag_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-BOM-Cost-Rollup-Tag-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
BOM成本卷积标签引擎
功能：多层级BOM定义 / 成本卷积 / 价格变动传播 / 成本Tag更新 / 涨价预警
"""
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class BOMNode:
    node_id: str
    name: str
    unit_price: float        # 当前单价
    is_leaf: bool = True     # 叶节点=原材料，非叶=半成品/成品
    labor_cost: float = 0.0
    overhead_cost: float = 0.0
    children: list = field(default_factory=list)  # [(child_node, qty)]
    # Cost Tags
    rolled_cost: float = 0.0
    cost_change_pct: float = 0.0
    cost_tags: dict = field(default_factory=dict)


class BOMCostRollupEngine:

    def __init__(self):
        self.nodes: dict = {}
        self.price_history: dict = {}  # node_id → [历史价格]

    def register_node(self, node: BOMNode):
        self.nodes[node.node_id] = node

    def add_child(self, parent_id: str, child_id: str, qty: float):
        parent = self.nodes[parent_id]
        child = self.nodes[child_id]
        parent.children.append((child, qty))
        parent.is_leaf = False

    def rollup(self, node_id: str) -> float:
        """递归卷积：从叶节点向上计算成本"""
        node = self.nodes[node_id]
        if node.is_leaf:
            node.rolled_cost = node.unit_price
            return node.rolled_cost

        children_cost = sum(self.rollup(child.node_id) * qty for child, qty in node.children)
        old_cost = node.rolled_cost
        node.rolled_cost = children_cost + node.labor_cost + node.overhead_cost

        if old_cost > 0:
            node.cost_change_pct = (node.rolled_cost - old_cost) / old_cost * 100
            node.cost_tags = {
                "bom_rolled_cost": round(node.rolled_cost, 4),
                "cost_change_pct": round(node.cost_change_pct, 2),
                "pricing_review_required": abs(node.cost_change_pct) > 5.0,
            }

        return node.rolled_cost
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.08923，但该号在 arXiv 上是《Towards Informative Few-Shot Prompt with Maximum Information Gain for In-Context Learning》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：结构化多层级 BOM（节点、子件、用量）、各原材料价格及变动数据；节点级粒度，OEM/ODM 模式下需供应商提供 BOM 配合。

**输出**：各层级物料的卷积成本、受价格变动影响的成品成本变化与成本 Tag 更新、价格倒挂预警清单，输出给采购与定价决策人。

## 执行步骤

1. 结构化录入多层级 BOM 的节点与子件关系。
2. 注册各叶节点的原材料价格与用量。
3. 价格变动时递归卷积，向上重算各级成本。
4. 更新成本 Tag 并对价格倒挂的成品发预警。

## 边界与不做

- 何时不用：BOM 未结构化或供应商不提供 BOM 明细时无法卷积，不适用本技能。
- 能力边界：结果精度取决于 BOM 完整性与价格数据时效，只覆盖物料成本，不含人工与制造费用的完整分摊。

## 技能关联

- **前置**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-Procurement-Cost-KPI-Price-Achievement.html、Skill-Procurement-Cost-KPI-Price-Achievement、Skill-Production-Quality-Tag-Writeback、Skill-SKU-Level-Margin-Attribution-Ontology.html、Skill-SKU-Level-Margin-Attribution-Ontology、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **延伸**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-Production-Quality-Tag-Writeback、Skill-SKU-Level-Margin-Attribution-Ontology.html、Skill-SKU-Level-Margin-Attribution-Ontology、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **可组合**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-Production-Quality-Tag-Writeback、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model、Skill-BOM-Cost-Rollup-Tag-Engine

---

> 分类：业务运营/供应与履约/采购比价　·　技术族：04-供应链　·　源卡：`Skill-BOM-Cost-Rollup-Tag-Engine`