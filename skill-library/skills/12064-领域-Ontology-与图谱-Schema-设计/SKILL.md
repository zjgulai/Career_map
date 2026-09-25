---
name: "p2s-ontology-schema-design"
title: "领域 Ontology 与图谱 Schema 设计"
description: "触发词：本体设计、Schema 统一、SHACL 约束、关系命名、覆盖率检查。何时不用：Schema 已稳定、只需按既有本体填数据时用建图类技能；本技能解决多人建模导致关系命名不一致、查询返回空结果的问题。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Ontology-Schema-Design"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把各写各的关系名统成一套本体和约束，让「某型号配什么配件」这类查询不再返回空结果。"
user_try: "试试：从这批产品描述里提一版本体候选，并给出 SHACL 约束和覆盖率检查结果。"
whenToUse: "多人建模导致关系名或类名不一致、下游查询结果不稳时用本技能；Schema 稳定后的数据填充用建图类技能。"
workflow: "用大模型从产品描述提候选类与属性 → 领域专家审核并合并冗余概念 → 写 SHACL 约束固化必填关系 → 跑覆盖率与关系完整性检查并补齐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 领域 Ontology 与图谱 Schema 设计

## ① 解决的问题

业务背景：某跨境母婴品牌 KG 建设初期，不同工程师对"吸奶器配件"的关系建模方式各不相同（有人用 `hasPart`，有人用 `compatibleWith`，有人用 `accessoryOf`）

## ② 核心算法逻辑

知识图谱的 Schema（本体 / Ontology）是整个 KG 的"地图"——它定义了有哪些实体类型、有哪些关系、每个属性的值域和约束。Schema 质量直接决定下游 KGQA 的检索上限和 GraphRAG 的推理深度。母婴电商领域 Ontology 设计需要平衡覆盖率（覆盖所有业务场景）与可管理性（避免过度细化导致维护失控）。

## ③ 业务应用场景

业务背景：某跨境母婴品牌 KG 建设初期，不同工程师对"吸奶器配件"的关系建模方式各不相同（有人用 `hasPart`，有人用 `compatibleWith`，有人用 `accessoryOf`）。导致 KGQA 查询"Spectra S1 配什么配件"时返回空结果——因为关系名不一致。
Schema 统一设计过程： 1. LLM 分析 3,000 条产品描述，自动提出 32 个候选类、87 个候选属性 2. 领域专家（2 人）2 天内审核，保留 18 类、54 属性，合并 14 个冗余概念 3. 定义 SHACL 约束：`BreastPumpAccessory` 必须有 `compatibleWith → BreastPump` 4. 运行覆盖率检查：$C = 96.2\%$，$R = 88.7\%$，补充 11 条缺失必填关系
量化 ROI： - KGQA 配件查询召回率：从 31% 提升至 92%（+61pp） - 新工程师 Schema 理解时间：从 3 天降至 4 小时（有 SHACL 文档） - 下游 GraphRAG 推理精度：$+18\%$（统一 Schema 后节点连通性提升）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

KGQA 召回率 +40pp 带来客服机器人解答率提升，减少人工客服：¥45,000/月
新品类上线加速（2周→2天），季度多上线 2 个新品类，GMV +8%：约 ¥120,000/季
合计年化 ROI ≈ ¥1,020,000

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（473 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/knowledge_graph/ontology_schema_design` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Ontology-Schema-Design.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
领域 Ontology 与图谱 Schema 设计工具
基于 arXiv:2405.08661, arXiv:2312.01044 等 2024/2025 年方法

功能：
1. Ontology 类层次定义（OWL-like）
2. SHACL 约束规则定义与验证
3. LLM 辅助 Schema 扩展（mock 实现）
4. 覆盖率 C 和关系完整性 R 量化计算

Author: paper2skills
Date: 2026-06-06
"""

from typing import List, Dict, Optional, Set, Tuple
from dataclasses import dataclass, field
from collections import defaultdict


# ============================================================
# 数据模型：Ontology
# ============================================================

@dataclass
class OWLClass:
    """OWL 类定义"""
    name: str
    label_cn: str
    parent: Optional[str] = None        # superclass name（单继承简化）
    description: str = ""
    examples: List[str] = field(default_factory=list)

    def is_root(self) -> bool:
        return self.parent is None


@dataclass
class OWLProperty:
    """OWL 属性定义（Object Property 或 Datatype Property）"""
    name: str
    label_cn: str
    domain: str                          # 主语类
    range_type: str                      # 宾语类或 xsd 类型
    is_object_property: bool = False
    description: str = ""
    # 约束
    min_count: int = 0
    max_count: Optional[int] = None      # None = 不限
    inverse_of: Optional[str] = None


@dataclass
class SHACLRule:
    """SHACL 约束规则（简化版）"""
    rule_id: str
    target_class: str
    property_name: str
    min_count: int = 0
    max_count: Optional[int] = None
    value_type: Optional[str] = None     # "xsd:decimal", "xsd:string", 或 class name
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.01044，但该号在 arXiv 上是《Large Language Models Are Zero-Shot Text Classifiers》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：领域文本语料（如 3000 条产品描述）与既有建模约定；需领域专家参与审核。

**输出**：统一的本体类层次、属性定义与 SHACL 约束，以及覆盖率 C 与关系完整性 R 的量化检查结果，供图谱构建与 GraphRAG 使用。

## 执行步骤

1. 收集领域语料与现有建模分歧点
2. 用大模型提出候选类与属性清单
3. 专家审核合并冗余概念并定稿
4. 用 SHACL 写必填关系约束
5. 跑覆盖率检查并补齐缺失关系

## 边界与不做

- Schema 已定稿、只是按既有本体填数据时不用本技能。
- 本技能产出本体与约束定义，不代替图谱数据填充与查询实现。
- 覆盖率与完整性指标只反映语料范围内的建模状态，不代表业务结论正确。

## 技能关联

- **前置**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management
- **延伸**：Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **可组合**：Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Ontology-Schema-Design

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-Ontology-Schema-Design`