---
name: "p2s-kg-data-fusion-pipeline"
title: "KG Data Fusion Pipeline — 多源采集数据驱动的知识图谱自动构建：竞品属性图谱融合"
description: "触发词：知识图谱、多源融合、实体对齐、属性图谱、兼容关系。何时不用：只需把上游抽取结果按固定 Schema 编译用「语义蓝图编译器」；只需竞品价格与排名的结构化清单用「竞品 SKU 本体」。安全边界：多源采集须确认授权与平台条款，评论类数据须脱敏；图谱中的价格与评分须标注数据时点。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 主数据治理"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-KG-Data-Fusion-Pipeline"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把 Amazon、沃尔玛、品牌官网和评论里的产品属性自动融合成一张竞品知识图谱，连奶嘴和奶瓶的兼容关系一起管起来。"
user_try: "试试：用 200+ 婴儿奶瓶 SKU 的多源数据建一张竞品属性图谱，并把配件兼容关系也串进去。"
whenToUse: "要跨多个来源维护竞品属性与兼容关系、并希望自动更新时用本技能；若只需把上游抽取结果结构化编译，用「语义蓝图编译器」；若只需竞品价格与排名的结构化清单，用「竞品 SKU 本体」。"
workflow: "采集 Amazon、Walmart、品牌官网与评论等多源数据 → 按领域本体抽取实体、属性与关系 → 做实体对齐去重与属性冲突解决 → 写入图谱存储并建立兼容与竞争关系 → 输出对标报告或兼容推荐查询"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG Data Fusion Pipeline — 多源采集数据驱动的知识图谱自动构建：竞品属性图谱融合

## ① 解决的问题

业务背景：选品团队需要对婴儿奶瓶品类建立竞品知识图谱，覆盖 200+ SKU 的品牌、材质、容量、适用月龄、价格、评分等属性，以及产品间的兼容关系（哪些奶嘴可以与哪些奶瓶配合使用），以往依赖人工录入，每月更新需 3 天

## ② 核心算法逻辑

母婴跨境电商竞品分析需要整合来自 Amazon、Walmart、品牌官网、用户评论等多源异构数据，构建统一的产品属性知识图谱。核心挑战有三：

## ③ 业务应用场景

业务背景：选品团队需要对婴儿奶瓶品类建立竞品知识图谱，覆盖 200+ SKU 的品牌、材质、容量、适用月龄、价格、评分等属性，以及产品间的兼容关系（哪些奶嘴可以与哪些奶瓶配合使用），以往依赖人工录入，每月更新需 3 天。
量化 ROI：节省数据录入人力 18 天/年（约 4.5 万元），图谱查询赋能选品决策，竞品对标报告生成时间从 4 小时降至 20 分钟。
业务背景：母乳泵主机与配件（奶嘴、法兰、储奶袋）的兼容关系复杂，用户购买主机后常因买错配件退货，退货率约 8%。构建兼容性知识图谱后可支撑"购买了 X 的用户还需要 Y（且兼容）"的推荐。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

4.5 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（536 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/knowledge_graph/kg_data_fusion_pipeline` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Data-Fusion-Pipeline.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多源采集数据融合构建知识图谱 Pipeline
整合实体抽取 + 对齐去重 + 冲突解决 + 图谱存储
arXiv 参考: 2404.09596 (KGConstruct: LLM-driven KG construction),
           2401.11903 (UniKGQA: Unified KG Question Answering),
           2502.14051 (Multi-Source KG Fusion for E-commerce)
"""

import json
import hashlib
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple, Set
from collections import defaultdict
import numpy as np


# ── 本体与数据结构 ──────────────────────────────────────────────────────────

# 母婴产品领域本体
BABY_PRODUCT_ONTOLOGY = {
    "entity_types": ["Product", "Brand", "Category", "Feature", "Material"],
    "relation_types": [
        "belongs_to", "made_by", "has_feature", "made_of",
        "competes_with", "compatible_with", "suitable_for_age",
    ],
    "attribute_types": {
        "Product": ["price", "rating", "review_count", "capacity_ml",
                    "min_age_months", "max_age_months", "asin", "title"],
        "Brand": ["country_of_origin", "founded_year"],
        "Feature": ["feature_description"],
    }
}


@dataclass
class Entity:
    entity_id: str
    entity_type: str    # Product, Brand, Category, Feature
    name: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    source: str = ""
    source_weight: float = 1.0

    def to_dict(self) -> Dict:
        return {
            "id": self.entity_id,
            "type": self.entity_type,
            "name": self.name,
            "attributes": self.attributes,
            "source": self.source,
        }


@dataclass
class Triple:
    head: str       # entity_id
    relation: str   # 关系类型
    tail: str       # entity_id 或 属性值
    confidence: float = 1.0
    source: str = ""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2112.09380，但该号在 arXiv 上是《Simulating pharmaceutical treatment effects on osteoporosis via a bone remodeling algorithm targeting hypermineralized sites》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：多源竞品数据：Amazon/Walmart/品牌官网的商品属性（品牌、材质、容量、适用月龄、价格、评分）与评论文本，覆盖 200+ SKU；另需领域本体定义（实体类型、关系类型、属性类型）。

**输出**：可查询的竞品属性知识图谱（含 competes_with、compatible_with、suitable_for_age 等关系），支撑竞品对标报告生成与配件兼容推荐。

## 执行步骤

1. 采集多源竞品与评论数据
2. 按领域本体抽取实体、属性与关系
3. 做实体对齐去重与冲突解决
4. 写入图谱并建立兼容与竞争关系
5. 输出对标报告或兼容推荐查询

## 边界与不做

- 缺少稳定的多源采集授权、或本体定义未敲定时不适用，融合结果会互相冲突
- 图谱是属性与关系的事实层，不含销量预测与定价建议；价格与评分须标注数据时点
- 多源采集须确认平台条款与授权，评论类数据须脱敏

## 技能关联

- **前置**：Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **延伸**：Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer
- **可组合**：Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-KG-Data-Fusion-Pipeline

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Data-Fusion-Pipeline`