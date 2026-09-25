---
name: "p2s-itext2kg-schema-free-kg-induction"
title: "iText2KG — 零样本增量知识图谱构建"
description: "触发词：零样本建图、增量三元组、自动抽取、图谱连通、幻觉控制。何时不用：要求严格 Schema 与强一致的核心主数据不要用本技能直接落库；本技能适合探索性、可增量合并的图谱。安全边界：大模型输出须做幻觉校验，低置信产物不得直接进生产图谱；示例中的 API Key 必须换成宿主注入的凭证。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-iText2KG-Schema-Free-KG-Induction"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "新文档进来就自动抽实体和关系并接进现有图谱，不用人工维护链接，边数翻倍也不靠加班。"
user_try: "试试：把新一批卡片自动抽成实体和关系，增量并进现有图谱。"
whenToUse: "图谱靠人工维护链接、新增内容接不上时用本技能；要求严格 Schema 与强一致的主数据用本体设计与主数据治理类技能。"
workflow: "输入原始文本或文档 → 零样本抽取实体与关系并归一 → 与现有图谱做增量合并去重 → 校验幻觉并抽检落库结果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# iText2KG — 零样本增量知识图谱构建

## ① 解决的问题

知识库运营面临"知识图谱边全靠人工维护双括号链接无法规模化"——iText2KG零样本自动抽取三元组将图谱边数从11643条扩展至25000+，人工构建成本降低95%

## ② 核心算法逻辑

iText2KG 完全不需要预定义 Schema，通过三个增量模块从任意文本构建 KG：

## ③ 业务应用场景

场景 A：paper2skills 知识图谱自动构建
- 业务痛点：当前知识图谱边来自 Skill 卡片的 `双括号链接`（人工维护），新 Skill 没有链接时图谱不连通 - 方案：iText2KG 处理每个 Skill 卡片 → 自动抽取实体（算法名/数据集/业务场景）和关系（基于/改进/应用于）→ 增量合并到现有图谱 - 量化产出：图谱边数从人工维护的 11,643 → 自动化后预计 25,000+，连通性提升 2x
- 业务痛点：从竞品官网、媒体报道、评论自动构建竞品关系图（A品牌 → 主要竞品 → 差异化功能） - 数据要求：竞品相关文本（官网/评论/新闻），每次新增增量处理 - 量化产出：竞品关系图谱节点数在 2 周内从 0 → 500+，人工构建需 3 个月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

图谱边数自动化提升：11,643（人工）→ 25,000+（自动）
竞品关系图谱构建：人工 3 个月 → 自动化 2 周
幻觉率 < 5%（官方 benchmark），企业级可信度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import json
import hashlib
from dataclasses import dataclass, field
from typing import Optional

try:
    from openai import OpenAI
    _CLIENT = OpenAI(
        [REDACTED] references/SECURITY.md>",
        base_url="https://api.deepseek.com"
    )
    LLM_OK = True
except Exception:
    LLM_OK = False

@dataclass
class KGEntity:
    id: str
    name: str
    entity_type: str
    source_doc: str = ""

@dataclass
class KGRelation:
    head: str
    relation: str
    tail: str
    confidence: float = 1.0

@dataclass
class IncrementalKG:
    entities: dict[str, KGEntity] = field(default_factory=dict)
    relations: list[KGRelation] = field(default_factory=list)

    def _entity_id(self, name: str) -> str:
        return hashlib.md5(name.lower().encode()).hexdigest()[:8]

    def _similar(self, a: str, b: str, threshold: float = 0.8) -> bool:
        a_words = set(a.lower().split())
        b_words = set(b.lower().split())
        if not a_words or not b_words:
            return False
        overlap = len(a_words & b_words) / max(len(a_words), len(b_words))
        return overlap >= threshold

    def add_entity(self, name: str, entity_type: str,
                   source: str = "") -> str:
        for eid, ent in self.entities.items():
            if self._similar(name, ent.name):
                return eid
        new_id = self._entity_id(name)
        self.entities[new_id] = KGEntity(
            id=new_id, name=name,
            entity_type=entity_type, source_doc=source
        )
        return new_id

    def add_relation(self, head_name: str, relation: str,
                     tail_name: str) -> bool:
        head_id = self._entity_id(head_name)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2409.03284 — iText2KG: Incremental Knowledge Graphs Construction Using Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：原始文本或文档（每次可增量追加），既有图谱作为合并基线；无需预定义 Schema，需要一个可用的模型调用凭证。

**输出**：抽取出的实体与三元组、增量合并后的图谱边数与连通性变化，以及幻觉率校验结果，供知识库与竞品关系图使用。

## 执行步骤

1. 输入新增文档或卡片
2. 零样本抽取实体与关系
3. 做实体归一与增量合并
4. 校验低置信与幻觉产物
5. 输出合并后的图谱与连通性变化

## 边界与不做

- 核心主数据、要求严格 Schema 与强一致的场景不要用本技能直接落库。
- 本技能产出候选三元组与合并结果，不做实体消歧的最终裁决。
- 必须配幻觉校验，低置信产物不得直接进生产图谱；API Key 由宿主注入，不得硬编码。

## 技能关联

- **前置**：Skill-MetaIE-Unified-Information-Extraction-Distillation.html、Skill-MetaIE-Unified-Information-Extraction-Distillation、Skill-Ontology-Schema-Design.html、Skill-Ontology-Schema-Design
- **延伸**：Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval.html、Skill-HippoRAG-Multi-Hop-Reasoning-Retrieval、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update
- **可组合**：Skill-DIAL-KG-Schema-Free-Incremental.html、Skill-DIAL-KG-Schema-Free-Incremental、Skill-Property-Graph-Query-Optimization.html、Skill-Property-Graph-Query-Optimization、Skill-iText2KG-Schema-Free-KG-Induction

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-iText2KG-Schema-Free-KG-Induction`