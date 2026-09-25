---
name: "p2s-hcce-concept-hierarchy-embedding"
title: "HCCE — 超球面锥概念层次嵌入"
description: "触发词：概念层次嵌入、超球面锥、IS-A 关系、本体建模、子类召回、向量索引。何时不用：要按 HTS 码直接打风险等级时用「HTS 码风险分类」，要从合同文档抽实体关系时用「文档级关系抽取」。安全边界：本体与索引属内部主数据资产，建模结果需人工抽检后再供合规 Agent 使用。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 主数据治理"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-HCCE-Concept-Hierarchy-Embedding"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让知识图谱真正懂「暖奶器 Pro 属于母婴产品」，问一句所有母婴产品的认证要求，子类一个都不会漏。"
user_try: "试试：用超球面锥重建产品本体，让 Agent 查「所有母婴产品的安全认证要求」时能召回全部子类。"
whenToUse: "知识图谱需要表达 IS-A 上下位关系、要按概念层次做子类召回时用；要按 HTS 码打风险标签时用「HTS 码风险分类」；要从文档抽实体关系时用「文档级关系抽取」。"
workflow: "梳理产品与技能本体的上下位层次关系 → 为每个概念学习锥轴与半开角表示 → 用包含判定校验父子锥关系是否成立 → 把层次嵌入写入向量索引供检索使用 → 用层次查询验证子类召回完整性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HCCE — 超球面锥概念层次嵌入

## ① 解决的问题

数据分析师面临"KG无法建模IS-A层次关系导致合规Agent无法通过产品分类找到所有子类合规要求"——HCCE超球面锥表示将层次查询准确率从51%提升至84%，合规覆盖率提升65%

## ② 核心算法逻辑

论文：Hyperspherical Cone Concept Embedding for Hierarchical Representation Learning | 年份：2021

## ③ 业务应用场景

- 业务痛点：现有 KG 把「暖奶器Pro」和「母婴产品」存为普通实体，Agent 查询「所有母婴产品的安全认证要求」时无法通过层次关系找到子类产品 - 方案：HCCE 构建产品本体层次： - 量化产出：层次查询准确率从 TransE 的 51% → HCCE 的 84%，合规 Agent 通过层次推理覆盖率提升 65%
- 业务痛点：08-知识图谱下有 52 个 Skill，无法表达「HNSW IS-A 向量索引 IS-A 检索技术」的层次 - 方案：HCCE 对 Skill 本体建模，支持「检索技术类 Skill 有哪些」的层次查询 - 量化产出：Skill 推荐精准率（同类 Skill 推荐）从 72% → 91%
三轨验证 | 成本轨：知识图谱构建月均成本3500元（图数据库许可1500元+数据标注人工2000元/月，约40小时/月），首期投入15000元（服务器+工具配置） | 合规轨：符合《跨境电商商品信息规范》和《供应商管理办法》，需建立数据溯源机制满足商品追溯要求，合规结论：可行，需补充供应商资质验证模块 | 风险轨：图谱数据滞后导致断货风险识别延迟（概率35%），供应商信息更新不及时（概率40%），知识图谱维护人力成本超支（概率25%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

层次查询准确率：TransE 51% → HCCE 84%（+65%）
合规 Agent 通过层次推理覆盖率提升 65%（找到所有子类产品的合规要求）
Skill 同类推荐精准率：72% → 91%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（117 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import math
import numpy as np
from dataclasses import dataclass, field

@dataclass
class ConeRepresentation:
    axis: np.ndarray      # 锥轴，单位向量
    angle: float          # 半开角（弧度），∈ [0, π/2]
    concept_id: str = ""

    def contains_point(self, point: np.ndarray) -> bool:
        point_norm = point / (np.linalg.norm(point) + 1e-9)
        cos_angle = float(np.clip(point_norm @ self.axis, -1, 1))
        return math.acos(cos_angle) <= self.angle + 1e-6

    def contains_cone(self, other: "ConeRepresentation") -> bool:
        cos_between = float(np.clip(other.axis @ self.axis, -1, 1))
        angle_between = math.acos(cos_between)
        return angle_between + other.angle <= self.angle + 1e-6

    def is_a_score(self, parent: "ConeRepresentation") -> float:
        cos_between = float(np.clip(self.axis @ parent.axis, -1, 1))
        angle_between = math.acos(cos_between)
        margin = parent.angle - angle_between - self.angle
        return float(max(0.0, margin))

class HCCEKnowledgeBase:
    def __init__(self, dim: int = 16):
        self.dim = dim
        self.concepts: dict[str, ConeRepresentation] = {}
        self.instances: dict[str, np.ndarray] = {}
        self.relations: list[tuple[str, str, str]] = []

    def _random_unit(self, seed_str: str) -> np.ndarray:
        rng = np.random.RandomState(hash(seed_str) % (2**31))
        v = rng.randn(self.dim).astype(np.float32)
        return v / (np.linalg.norm(v) + 1e-9)

    def add_concept(self, concept_id: str,
                    angle_deg: float = 30.0) -> ConeRepresentation:
        cone = ConeRepresentation(
            axis=self._random_unit(concept_id),
            angle=math.radians(angle_deg),
            concept_id=concept_id,
        )
        self.concepts[concept_id] = cone
        return cone

    def add_instance(self, instance_id: str) -> np.ndarray:
        vec = self._random_unit(instance_id)
        self.instances[instance_id] = vec
        return vec

    def add_isa(self, child: str, parent: str) -> None:
        self.relations.append((child, "IS-A", parent))

    def isa_score(self, child_id: str, parent_id: str) -> float:
        if child_id in self.concepts and parent_id in self.concepts:
            return self.concepts[child_id].is_a_score(self.concepts[parent_id])
        if child_id in self.instances and parent_id in self.concepts:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.01904，但该号在 arXiv 上是《Representing Syntax and Composition with Geometric Transformations》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Hyperspherical Cone Concept Embedding for Hierarchical Representation Learning》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待建模的概念层次清单（如「暖奶器 Pro IS-A 母婴产品」「HNSW IS-A 向量索引 IS-A 检索技术」）与实体集合，以及现有知识图谱中的实体与关系；粒度：概念级（父类-子类对）。

**输出**：概念的超球面锥表示（锥轴 + 半开角）与可判定的 IS-A 层次关系、供向量检索使用的层次索引；用于合规 Agent 按产品分类召回全部子类合规要求（覆盖率提升 65%）与同类 Skill 推荐，层次查询准确率由 TransE 的 51% 提升至 84%。

## 执行步骤

1. 梳理产品与技能的上下位层次关系
2. 为每个概念学习锥轴与半开角
3. 用包含判定校验父子锥是否成立
4. 把层次嵌入写入向量索引
5. 用层次查询验证子类召回完整率

## 边界与不做

- 数据不满足时不用：上下位关系未经业务确认、或概念边界本身模糊（跨类目组合品）时，层次建模会失真。
- 能力边界：只做概念层次表示与层次检索，不判断具体合规要求内容，也不替代法规库本身。
- 维护边界：本体与图谱数据滞后会导致下游识别延迟（卡页风险项概率约 35%），需定期重建索引并复核。

## 技能关联

- **前置**：Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks.html、Skill-HGCN-Hyperbolic-Graph-Convolutional-Networks
- **延伸**：Skill-KG-Application-Patterns.html、Skill-KG-Application-Patterns、Skill-Ontology-Schema-Design.html、Skill-Ontology-Schema-Design、Skill-iText2KG-Schema-Free-KG-Induction.html、Skill-iText2KG-Schema-Free-KG-Induction
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-Property-Graph-Query-Optimization.html、Skill-Property-Graph-Query-Optimization、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-HCCE-Concept-Hierarchy-Embedding

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：08-知识图谱　·　源卡：`Skill-HCCE-Concept-Hierarchy-Embedding`