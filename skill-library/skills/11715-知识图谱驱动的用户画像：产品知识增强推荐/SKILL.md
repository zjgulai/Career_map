---
name: "p2s-kg-powered-user-profiling"
title: "KG-Powered User Profiling — 知识图谱驱动的用户画像：产品知识增强推荐"
description: "触发词：知识图谱画像、跨品类推荐、产品属性关联、标签覆盖率、语义增强偏好。何时不用：只做价值分层或人群标签生成用 RFM、Persona 类技能，本技能把产品知识图谱与用户行为图融合来做偏好与推荐。安全边界：用户行为与购买数据须脱敏，产品属性与认证信息须来自可核验来源，推荐理由不得使用健康功效表述。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-KG-Powered-User-Profiling"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "把产品属性和用户行为连成一张图，让推荐能跨品类找到用户真正需要的东西。"
user_try: "试试：用产品知识图谱分析买过有机奶粉的用户，推荐知识关联最强的辅食与护肤品类。"
whenToUse: "需要跨越品类边界做推荐、协同过滤只靠用户商品矩阵而效果弱时用本技能；只做价值分层用 RFM 类技能，生成可读人群画像用 Persona 类技能。"
workflow: "构建产品知识图谱（属性、认证、成分、适用月龄） → 构建用户行为图（购买、浏览、评价） → 融合成知识增强的用户偏好向量 → 输出跨品类推荐并回测点击表现"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# KG-Powered User Profiling — 知识图谱驱动的用户画像：产品知识增强推荐

## ① 解决的问题

用户运营面临画像碎片化——知识图谱画像将标签覆盖率提40%，年化增收15万元

## ② 核心算法逻辑

传统协同过滤仅依赖 useritem 矩阵，缺乏对产品语义的理解，导致跨品类推荐能力弱。KGPowered User Profiling 通过异构图融合将产品知识图谱（属性/认证/成分/适用年龄段）与用户行为图（购买/浏览/评价）结合，构建知识增强的用户偏好向量。

## ③ 业务应用场景

业务背景：用户历史购买了有机奶粉，如何推荐有机辅食/有机婴儿护肤？
效果：跨越奶粉→辅食→婴儿护肤的品类边界，CTR 提升 18%，用户 LTV 增加。
业务背景：WF-D 选品阶段，发现用户购买了竞品 X 但未购买我方同类产品，通过 KG 分析竞品属性关联，找到用户未购买但知识关联强的品类。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

18%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（323 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/kg_powered_user_profiling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Powered-User-Profiling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
KG-Powered User Profiling — 知识图谱驱动的用户画像
Python 标准库实现，无第三方依赖
"""
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
import math
import heapq


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class ProductKGNode:
    """产品知识图谱节点"""
    product_id: str
    name: str
    category: str                          # 一级品类，如 "奶粉"
    sub_category: str = ""                 # 二级品类，如 "有机奶粉"
    attributes: dict[str, str] = field(default_factory=dict)       # 如 {"成分": "DHA", "适用月龄": "0-6"}
    certifications: list[str] = field(default_factory=list)        # 如 ["EU有机认证", "FDA认证"]
    tags: list[str] = field(default_factory=list)                   # 如 ["有机", "益生菌"]
    price_tier: str = "mid"                # low/mid/high


@dataclass
class UserAction:
    """用户行为记录"""
    user_id: str
    product_id: str
    action_type: str      # purchase/view/review
    timestamp: float      # Unix timestamp
    score: float = 1.0    # 评分（review时有效）


# ─────────────────────────────────────────────
# 用户 KG 画像构建器
# ─────────────────────────────────────────────

class UserKGProfiler:
    """从行为历史推断用户知识偏好向量"""

    # 行为类型基础权重
    ACTION_WEIGHTS = {
        "purchase": 3.0,
        "review": 2.0,
        "view": 0.5,
    }

    def __init__(
        self,
        kg_nodes: list[ProductKGNode],
        decay_factor: float = 0.9,
        max_age_days: float = 180.0,
    ):
        """
        Args:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.07808，但该号在 arXiv 上是《Characterizing SLAM Benchmarks and Methods for the Robust Perception Age》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品知识图谱数据（品类、属性如成分与适用月龄、认证信息）以及用户行为记录（购买、浏览、评价，需按行为类型赋权）。

**输出**：知识增强的用户偏好向量与跨品类推荐结果，用于提升推荐点击与用户长期价值；卡页口径标签覆盖率提升 40%、CTR 提升 18%、年化增收 15 万元。

## 执行步骤

1. 构建产品知识图谱节点，录入品类、属性与认证信息。
2. 采集用户购买、浏览与评价行为，并按行为类型赋权。
3. 融合产品语义与用户行为，得到知识增强的偏好向量。
4. 基于偏好向量输出跨品类推荐并回测点击表现。

## 边界与不做

- 产品知识图谱属性不全（缺成分、认证、适用月龄等字段）时不要用，跨品类知识关联无法成立。
- 能力边界：本技能输出偏好向量与推荐排序，不保证 CTR 提升；卡页的覆盖率与增收数字为特定口径。
- 合规红线：产品属性与认证信息须来自可核验来源，推荐理由不得使用健康功效表述，用户行为数据须脱敏。

## 技能关联

- **前置**：Skill-HGT-Heterogeneous-Graph-Transformer.html、Skill-HGT-Heterogeneous-Graph-Transformer、Skill-KG-Augmented-Recommendation-CoLaKG.html、Skill-KG-Augmented-Recommendation-CoLaKG、Skill-User-Profile-Long-Memory.html、Skill-User-Profile-Long-Memory
- **延伸**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Hierarchical-Product-KG-Construction.html、Skill-Hierarchical-Product-KG-Construction
- **可组合**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent、Skill-KG-Powered-User-Profiling

---

> 分类：业务运营/品牌与增长/分群　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Powered-User-Profiling`