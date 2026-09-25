---
name: "p2s-tag-propagation-supply-chain"
title: "供应链知识图谱标签传播算法 — LPA/层级继承/关系链传播的Tag扩散引擎"
description: "触发词：标签传播、LPA、层级继承、关系链扩散、覆盖率提升。何时不用：还没建实体关系图谱、标签只能逐条人工录入时先补图谱；只做标签质量打分走标签质量 KPI。安全边界：合规类标签传播须符合商品信息规范与编码标准，传播与人工审核结论冲突时以人工裁决为准。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Tag-Propagation-Supply-Chain"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "供应商或仓库的一条标签，顺着关系图谱自动扩散到旗下 SKU，不再逐条手改。"
user_try: "试试：供应商拿到 CE 认证后，把合规标签自动传播到他旗下的吸奶器 SKU。"
whenToUse: "标签有明确继承或关系链可循、手工维护覆盖率上不去时用；还没有实体关系图谱、或只是要给标签打分时不用。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链知识图谱标签传播算法 — LPA/层级继承/关系链传播的Tag扩散引擎

## ① 解决的问题

供应链团队面临"认证标签手工维护60%覆盖率"——LPA+层级继承传播算法将合规标签覆盖率从60%提升至95%，供应商FDA认证自动扩散到旗下所有SKU

## ② 核心算法逻辑

标签传播（Tag Propagation） 解决的核心问题：人工打标覆盖率不足，但实体间存在关系——可以沿关系边"传导"已知标签到未标注节点。

## ③ 业务应用场景

场景A：供应商认证标签传播到 SKU - 业务问题：供应商「宁波精工」获得了 CE 认证，但旗下 15 个吸奶器 SKU 需要手工逐一更新合规标签，容易遗漏 - 数据要求：供应商→产品关系图谱 + 供应商认证数据 - 传播逻辑： - 业务价值：合规标签更新从 2 小时人工 → 5 秒自动，且零遗漏
场景B：仓库容量风险标签传播到 SKU - 业务问题：US-FBA 仓容量预警（使用率 92%），但系统不知道哪些 SKU 的补货计划应该调整 - 传播逻辑： - 业务价值：仓容预警自动影响 SKU 补货策略，避免入仓被拒收
三轨验证 | 成本轨：月均成本1200元（AI模型API调用费800元/月+人工审核4小时/月@100元/小时=400元），标注效率提升至2000个SKU/月，单位成本0.6元/SKU | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，标签体系通过ISO 8601编码规范验证，满足HS编码对应要求 | 风险轨：模型漂移风险（概率15%，母婴新品类上市时准确率下降至88%），需建立月度重训机制；标签冲突风险（概率8%，如

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：认证标签传播使合规覆盖率从60%→95%，合规审查效率提升10倍；风险标签扩散使断货预警从15%覆盖→85%覆盖，减少断货事件约50%，年化约8万元
实施难度：⭐⭐⭐☆☆（需要先建立实体关系图谱，然后配置传播规则）
优先级评分：⭐⭐⭐⭐⭐（是标签工程从"手工打标"到"自动扩散"的关键技术，直接解决覆盖率问题）
评估依据：供应链实体间关系密度高（每个SKU平均涉及1个供应商+2个仓库+3个物流商），传播效益显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（269 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/data_collection/tag_propagation_supply_chain` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Propagation-Supply-Chain.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链知识图谱标签传播引擎
功能：层级继承传播 / LPA迭代传播 / 关系链传播 / 置信度衰减管理
输入：实体关系图谱 + 种子标签集合
输出：传播后完整标签集 + 传播路径追踪 + 覆盖率提升报告
"""
import numpy as np
import pandas as pd
from collections import defaultdict, deque
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


class SupplyChainTagGraph:
    """供应链实体关系图谱（用于标签传播）"""

    def __init__(self):
        self.entities = {}   # entity_id → {type, name, tags: {tag_id: {value, confidence, source}}}
        self.edges = []      # (src, dst, relation_type, weight)
        self.adj = defaultdict(list)   # src → [(dst, relation, weight)]
        self.radj = defaultdict(list)  # dst → [(src, relation, weight)] 反向

    def add_entity(self, entity_id: str, entity_type: str, name: str, tags: dict = None):
        self.entities[entity_id] = {
            "type": entity_type, "name": name,
            "tags": {k: {"value": v, "confidence": 1.0, "source": "manual"}
                     for k, v in (tags or {}).items()}
        }

    def add_relation(self, src: str, dst: str, relation: str, weight: float = 1.0):
        self.edges.append((src, dst, relation, weight))
        self.adj[src].append((dst, relation, weight))
        self.radj[dst].append((src, relation, weight))

    def get_tag(self, entity_id: str, tag_id: str) -> Optional[dict]:
        e = self.entities.get(entity_id)
        if e and tag_id in e["tags"]:
            return e["tags"][tag_id]
        return None

    def set_tag(self, entity_id: str, tag_id: str, value, confidence: float, source: str):
        if entity_id in self.entities:
            self.entities[entity_id]["tags"][tag_id] = {
                "value": value, "confidence": confidence, "source": source
            }


class TagPropagationEngine:
    """三种传播模式引擎"""

    def __init__(self, graph: SupplyChainTagGraph, decay_alpha: float = 0.85, conf_threshold: float = 0.5):
        self.graph = graph
        self.decay_alpha = decay_alpha
        self.conf_threshold = conf_threshold
        self.propagation_log = []

    def hierarchical_propagation(self, tag_id: str, allowed_relations: list,
                                  max_hops: int = 3) -> int:
        """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.07682，但该号在 arXiv 上是《Growth of Massive Black Hole Seeds by Migration of Stellar and Primordial Black Holes: Gravitational Waves and Stochastic Background》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实体关系图谱（供应商到产品到仓库到物流等）与种子标签集合（含来源与置信度）

**输出**：传播后的完整标签集、传播路径追踪与覆盖率提升报告，供合规与补货策略直接消费

## 执行步骤

1. 构建实体关系图谱并挂上种子标签（如供应商 CE 认证）。
2. 按层级继承与关系链规则做标签传播（LPA 迭代）。
3. 对传播结果设置信度衰减，避免远距离传播失真。
4. 输出传播路径与覆盖率报告，交给合规与补货侧复核。

## 边界与不做

- 何时不用：实体关系尚未建图、标签只能逐条人工录入时，先补图谱基建；只做标签质量打分请转标签质量 KPI。
- 能力边界：传播结果只提升标签覆盖率，不替代官方认证与人工审核结论。
- 安全边界：合规类标签传播须符合商品信息规范与编码标准；传播结果与人工审核冲突时以人工裁决为准。

## 技能关联

- **前置**：Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-SC-Resilience-Hypergraph.html、Skill-SC-Resilience-Hypergraph、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Tag-Propagation-Supply-Chain

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Propagation-Supply-Chain`