---
name: "p2s-product-knowledge-graph-query"
title: "Product KG Query — 多 Agent 产品知识图谱查询与 SKU 跨平台映射"
description: "触发词：跨平台SKU映射、产品知识图谱查询、多Agent匹配、消歧问题生成、同款判定、多平台ID打通。何时不用：要对离线多源实体做去重合并时用「KG实体消歧与去重」；要做统一标识建立与标签一致性同步时用「SKU统一标识与标签同步」。安全边界：匹配结果必须保留可人工审计的推理链，低于相似度阈值的候选不得自动打通平台 ID；平台数据使用须遵守各平台政策，禁止跨平台价格同步与将平台数据用于竞品分析。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-138"
l3_business: "账号商品映射"
l3_all: "账号商品映射 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/账号商品映射"
p2s_card_id: "Skill-Product-Knowledge-Graph-Query"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同一款吸奶器在三个平台各有各的 ID，让多个 Agent 自动问出关键差异、比对事实，把同款认出来并打通 ID。"
user_try: "试试：把 Amazon、Shopee、TikTok Shop 三平台的吸奶器 SKU 做一次同款匹配，给出可审计的推理链。"
whenToUse: "当查询期要回答这两个不同平台的 SKU 是不是同一款产品、并据此打通平台 ID 做跨平台聚合时用本技能；若要做的是批量离线实体去重与规范名合并，改用「KG实体消歧与去重」；若要建立统一标识与标签同步，改用「SKU统一标识与标签同步」。"
workflow: "由 Reasoning Agent 为产品类目生成消歧问题集（吸力档位、充电方式、适用月龄、认证等） → 由 Knowledge Agent 从各平台 PKG 检索每个候选 SKU 的事实答案 → 由 Dedup Agent 复用已推理过的 trace，降低重复 LLM 调用 → 对比事实集合，相似度达标即判定同款并打通三平台 ID → 输出可人工审计的推理链供运营复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Product KG Query — 多 Agent 产品知识图谱查询与 SKU 跨平台映射

## ① 解决的问题

跨境运营面临多平台 SKU 数据孤岛——Q2K 多 Agent 自动匹配将跨平台 SKU 对齐准确率从人工 78% 提升至 92%，运营手工比对时间从 3-4 小时/款降至自动完成，年化节省 ¥15-30 万

## ② 核心算法逻辑

构建了产品知识图谱（PKG）之后，紧接着的挑战是：如何在多平台、多命名规范的 SKU 海洋里精确匹配同一个产品？ 母婴跨境卖家在 Amazon、Shopee、TikTok Shop 三个平台运营同一款吸奶器，但商品 ID 各不同、属性字段名也不统一，跨平台聚合分析时"是同一个产品"这个问题就变得极难回答。

## ③ 业务应用场景

业务问题：某母婴团队的吸奶器产品在三平台 GMV 总计 2000 万/年，但三个平台的 SKU 用不同 ID 管理，无法自动聚合"同款产品跨平台销售对比"。运营要花 3-4 小时/款手工比对产品规格确认是同一个 SKU。
Q2K 处理流程： 1. 消歧问题生成：Reasoning Agent 为吸奶器自动生成 12 个消歧问题（吸力档位、充电方式、适用月龄、静音等级、BPA-Free 认证……） 2. 事实检索：Knowledge Agent 从三平台 PKG 中分别查询每个候选 SKU 的事实答案 3. 去重复用：Dedup Agent 检测已推理过的产品，直接复用 trace（降低 LLM 调用成本 60%） 4. 匹配判决：事实集合对比，相似度 ≥ 0.85 → 确认同款 → 自动打通三平台 ID
数据要求： - 各平台 PKG（由 AutoPKG 或人工维护的属性表输出） - 各平台 SKU 基础信息（标题 + bullet points + 主图）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
运营手工比对成本节省：¥150,000-300,000/年（按 30 SKU/月 × 3 小时 × ¥200/小时，500 SKU 规模）
跨平台数据聚合后解锁的 GMV 归因收益：¥500,000-1,000,000/年（基于跨平台数据洞察优化备货和广告）
避免重复订货损失：¥80,000+/次（历史案例）
年化综合 ROI：800 万 GMV 规模 → ¥80-150 万增量（含成本节省 + 决策优化）
实施难度：⭐⭐☆☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（390 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/knowledge_graph/product_knowledge_graph_query` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Product-Knowledge-Graph-Query.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Product Knowledge Graph Query — 多 Agent SKU 跨平台映射
基于 Q2K (arXiv: 2509.01182) 简化实现

依赖: json, re, typing, dataclasses
"""

from dataclasses import dataclass, field
from typing import Optional
import json
import re


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class SKUNode:
    """产品知识图谱中的 SKU 节点"""
    sku_id: str
    platform: str           # amazon / shopee / tiktok_shop
    title: str
    attributes: dict        # {attr_key: attr_value}


@dataclass
class FactEntry:
    """单条可检查事实"""
    question: str
    answer: str
    confidence: float
    source: str             # 'pkg_lookup' / 'llm_infer' / 'cached'


@dataclass
class MappingResult:
    """SKU 映射结果"""
    source_sku_id: str
    target_sku_id: str
    is_match: bool
    similarity_score: float
    facts: list[FactEntry] = field(default_factory=list)
    inspectable_trace: str = ""     # 可供人工审计的推理链


# ─────────────────────────────────────────────
# Agent 实现
# ─────────────────────────────────────────────

class ReasoningAgent:
    """生成消歧问题：针对产品类别生成最具区分力的问题集"""

    QUESTION_TEMPLATES = {
        "吸奶器": [
            "该产品的最大吸力值（mmHg）是多少？",
            "该产品支持几档可调吸力？",
            "充电接口类型是什么（USB-C / Micro-USB / 其他）？",
            "电池容量（mAh）是多少？",
            "噪音等级（dB）是多少？",
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.01182 — Question-to-Knowledge (Q2K): Multi-Agent Generation of Inspectable Facts for Product Mapping

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各平台产品知识图谱或属性表、各平台 SKU 基础信息（标题 + bullet points + 主图）以及待匹配的候选 SKU 清单；粒度为单个 SKU 及其属性事实。

**输出**：SKU 映射结果（源与目标 SKU、是否同款、相似度分数、事实条目列表与可人工审计的推理 trace），用于跨平台聚合分析与同款销售对比。

## 执行步骤

1. 生成待匹配产品类目的消歧问题集
2. 检索各平台产品知识图谱中每个候选 SKU 的事实答案
3. 复用已推理产品的 trace，避免重复推理开销
4. 逐条比对事实集合并计算相似度，达到阈值判定为同款
5. 打通各平台商品 ID 并输出可审计的匹配 trace 供运营复核

## 边界与不做

- 数据不满足：各平台缺少属性表或 SKU 基础信息（标题、卖点、主图）时无法生成与核验事实，先补齐主数据。
- 何时不用：离线多源实体去重合并用「KG实体消歧与去重」，统一标识与标签同步用「SKU统一标识与标签同步」。
- 能力边界：本技能只做同款判定与 ID 打通，不负责图谱本身的构建与维护，也不做定价或库存口径对齐。
- 安全边界：匹配结论必须附可审计推理链，低于相似度阈值不得自动打通 ID；平台数据不得用于跨平台价格同步或竞品分析。

## 技能关联

- **前置**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Entity-Resolution-KG-Dedup.html、Skill-Entity-Resolution-KG-Dedup、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **延伸**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Product-Knowledge-Graph-Query

---

> 分类：数据与Agent平台/数据与AI运行/账号商品映射　·　技术族：08-知识图谱　·　源卡：`Skill-Product-Knowledge-Graph-Query`