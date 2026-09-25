---
name: "p2s-entity-resolution-kg-dedup"
title: "KG 实体消歧与去重（Entity Resolution & Deduplication）"
description: "触发词：实体消歧、跨源去重、SKU统一、阻塞与LSH、相似度融合、规范名合并。何时不用：要在线上做跨平台 SKU 与编码的查询映射时用「产品知识图谱查询」；要做标签一致性与统一标识同步时用「SKU统一标识与标签同步」。安全边界：合并阈值与权重设定必须留痕可回溯，低于阈值的候选一律不自动合并；多语言名与别名数据须来自授权渠道，不得引入未经授权的个人信息。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-138"
l3_business: "账号商品映射"
l3_all: "账号商品映射 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/账号商品映射"
p2s_card_id: "Skill-Entity-Resolution-KG-Dedup"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把亚马逊、独立站、天猫上叫法不同的同一款商品认出来，合成一个规范节点，让竞品分析不再漏项。"
user_try: "试试：把三个渠道的 SKU 表做一次实体消歧，找出同一款吸奶器的重复节点并合并成规范实体。"
whenToUse: "当同一商品在不同渠道、不同语言下命名各异、KG 里已出现重复孤立节点时用本技能做离线消歧合并；若要在查询时实时做跨平台 SKU 映射，改用「产品知识图谱查询」；若要保证各平台标签与统一编码一致，改用「SKU统一标识与标签同步」。"
workflow: "定义实体记录结构：名称、别名、来源、品类与属性键值 → 用 Token Blocking 加 LSH 阻塞压缩候选对（卡页示例从 40 万平方降至 3.2 万对） → 计算词法、语义、结构三维相似度 → 按权重融合打分并与阈值比较 → 对连通分量做聚类与规范名合并"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG 实体消歧与去重（Entity Resolution & Deduplication）

## ① 解决的问题

业务背景：某母婴出海品牌同时运营亚马逊、独立站、天猫国际三个渠道，SKU 数据由不同团队维护，同一款"Spectra S1 双边电动吸奶器"在三个平台分别叫： - Amazon：`Spectra - S1 Plus Electric Breast Pump` - 独立站：`Spectra S1+ 双边吸奶器` - 天猫：`贝瑞克S1Plus吸奶器双边电动`

## ② 核心算法逻辑

电商知识图谱中同一商品在不同数据源有多种命名：中文名"吸奶器"、英文名"breast pump"、闽南语"集乳器"、品牌型号"Spectra S1"、Amazon ASIN"B07XYZ123"——若不做统一，KG 会出现大量重复节点，导致关系断裂、推理失效、检索召回率下降。实体消歧（Entity Resolution） 通过三步流水线将多源异构实体识别为同一现实对象并合并。

## ③ 业务应用场景

业务背景：某母婴出海品牌同时运营亚马逊、独立站、天猫国际三个渠道，SKU 数据由不同团队维护，同一款"Spectra S1 双边电动吸奶器"在三个平台分别叫： - Amazon：`Spectra - S1 Plus Electric Breast Pump` - 独立站：`Spectra S1+ 双边吸奶器` - 天猫：`贝瑞克S1Plus吸奶器双边电动`
KG 中存在 3 个孤立节点，导致"同款商品竞品分析"查询结果不完整。
解决过程： 1. 阻塞：品类="吸奶器" + LSH，候选对从 40万² 降至 3.2 万对（RR=99.6%） 2. 相似度：Jaccard=0.18，余弦（multilingual-e5）=0.91，结构重叠（品牌 Spectra、双边、电动）=0.85 3. 融合分 $s = 0.2×0.18 + 0.6×0.91 + 0.2×0.85 = 0.75$，超过阈值 $\theta=0.65$，判定为同一实体

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

节省人工：52 人天 × ¥800/天 = ¥41,600/季
KGQA 准确率提升带来客服效率提升（减少重复咨询）：约 ¥15,000/季
合计季度 ROI ≈ ¥56,600，实施成本约 ¥20,000（工程投入），回报周期 < 1 个季度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（536 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/entity_resolution_kg_dedup` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Entity-Resolution-KG-Dedup.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
KG 实体消歧与去重系统（Entity Resolution & Deduplication）
基于 arXiv:2406.02344, arXiv:2312.00601 等 2024 年最新方法

功能：
1. Token Blocking + LSH 阻塞
2. 词法 + 语义 + 结构三维相似度融合
3. 连通分量聚类 + 规范名合并

Author: paper2skills
Date: 2026-06-06
"""

import math
import hashlib
import ast
from typing import List, Dict, Tuple, Optional, Set, FrozenSet
from dataclasses import dataclass, field
from collections import defaultdict


# ============================================================
# 数据模型
# ============================================================

@dataclass
class Entity:
    """KG 实体节点"""
    entity_id: str
    name: str
    source: str                          # 数据来源："amazon" / "shopify" / "tmall"
    category: str                        # 品类："吸奶器" / "奶瓶"
    attributes: Dict[str, str] = field(default_factory=dict)  # 属性键值对
    aliases: List[str] = field(default_factory=list)          # 别名列表

    def all_names(self) -> List[str]:
        return [self.name] + self.aliases


@dataclass
class EntityPair:
    """候选实体对"""
    id1: str
    id2: str
    lex_score: float = 0.0
    sem_score: float = 0.0
    struct_score: float = 0.0
    final_score: float = 0.0
    is_match: Optional[bool] = None     # 标注结果（评估用）


@dataclass
class MergedEntity:
    """合并后的规范实体"""
    canonical_id: str
    canonical_name: str
    member_ids: List[str]
    merged_attributes: Dict[str, str] = field(default_factory=dict)
    source_map: Dict[str, str] = field(default_factory=dict)  # entity_id -> source
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.00601，但该号在 arXiv 上是《Online Graph Coloring with Predictions》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多源实体记录（名称、别名、数据来源、品类、属性键值对），来自各渠道的商品主数据；粒度为单实体记录及其别名字段。

**输出**：合并后的规范实体（canonical_id、规范名、成员 ID 列表、合并属性与来源映射），以及候选对的评分明细；供知识图谱构建与后续竞品分析、KGQA 使用。

## 执行步骤

1. 整理各渠道实体记录并补全别名与属性键值
2. 用 Token Blocking 与 LSH 生成候选对，把比较规模压到可计算范围
3. 计算词法相似度、多语言语义相似度与结构重叠度
4. 按权重融合得到总分并与阈值（如 0.65）比较判定是否同一实体
5. 对判定为同一实体的节点做连通分量聚类并合并为规范实体

## 边界与不做

- 数据不满足：实体缺少品类、品牌或别名字段时阻塞与相似度都会失真，先补主数据再跑消歧。
- 何时不用：在线查询映射用「产品知识图谱查询」，标签与统一编码同步用「SKU统一标识与标签同步」。
- 能力边界：只做实体识别与合并，不负责合并后的图谱查询服务与标签下发。
- 安全边界：融合权重与阈值必须记录可回溯，低于阈值的候选不得自动合并；别名数据须来自授权渠道。

## 技能关联

- **前置**：Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction
- **可组合**：Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Privacy-Safe-Identity-Resolution.html、Skill-Privacy-Safe-Identity-Resolution、Skill-Entity-Resolution-KG-Dedup

---

> 分类：数据与Agent平台/数据与AI运行/账号商品映射　·　技术族：08-知识图谱　·　源卡：`Skill-Entity-Resolution-KG-Dedup`