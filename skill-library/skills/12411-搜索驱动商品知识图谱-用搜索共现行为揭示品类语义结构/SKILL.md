---
name: "p2s-search-driven-product-kg"
title: "搜索驱动商品知识图谱 — 用搜索共现行为揭示品类语义结构"
description: "触发词：搜索共现图、图嵌入、关联品类发现、选品关联、词扩展。何时不用：要基于竞品排名找缺口词时用「竞品关键词缺口分析」；要从评论语料挖词时用「评论关键词挖掘 SEO」。安全边界：搜索日志须脱敏并通过官方 API 获取，第三方抓取违反平台 ToS。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 市场机会评估"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Search-Driven-Product-KG"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "看买家的搜索轨迹自己暴露了哪些品类相关，把「还会一起搜什么」变成可查的图谱。"
user_try: "试试：用我的搜索日志构建共现图谱，看看婴儿游泳圈会和哪些品类关联。"
whenToUse: "当需要从搜索行为自动发现品类语义结构与关联品、支撑关联选品或词扩展时用本技能；要基于竞品排名找缺口词，用「竞品关键词缺口分析」；要从评论挖词，用「评论关键词挖掘 SEO」。"
workflow: "采集搜索日志（会话与搜索词序列） → 脱敏后构建搜索词共现图 → 用图嵌入学习节点向量建语义图谱 → 查邻居品类并做词扩展"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索驱动商品知识图谱 — 用搜索共现行为揭示品类语义结构

## ① 解决的问题

数据科学家面临"品类语义结构只能靠人工梳理无法系统化发现搜索意图间的关联"——搜索词共现图嵌入将品类语义空间构建自动化，选品相关性发现效率提升5倍，年化$4.2万

## ② 核心算法逻辑

传统商品知识图谱依赖人工标注属性关系（纸尿裤 → 适用年龄 → 03M），成本高且更新慢。搜索行为天然包含买家对商品关系的隐式认知：当用户搜索「纸尿裤 + 湿巾」时，说明这两个品类在买家心智中高度关联；当「吸奶器」和「储奶袋」总是共现，说明它们构成功能组合关系。

## ③ 业务应用场景

场景A：新品选品关联分析 - 业务问题：运营不知道新品（婴儿游泳圈）关联哪些品类，不知道买家还会搜索什么 - 数据要求：平台搜索日志（用户ID + 会话ID + 搜索词 + 时间戳），最少 10 万条记录 - 预期产出：以「婴儿游泳圈」为节点的一跳知识图谱，揭示关联品类（浮水背心/防水尿裤/婴儿防晒/泳圈打气筒） - 业务价值：选品决策效率提升 3 倍，新品开发成功率从 30% → 50%（有数据支撑的关联选品），年化 GMV 增量约 20-40 万元
三轨验证： - 成本：需采购或自建搜索日志采集管道（约 5-8 万元/年），图数据库（Neo4j 或 ArangoDB 许可费约 3-5 万元/年），1 名数据工程师 2 周开发时间（约 2 万元人力成本）。总计约 10-15 万元初始投入。 - 合规：搜索日志需脱敏处理（去除用户ID、IP、设备指纹），仅保留聚合后的共现统计，避免触碰 GDPR 个人数据定义。Amazon 平台禁止使用第三方工具抓取搜索数据，必须通过官方 API（如 SP-API 的搜索查询报告）获取，否则违反 ToS。 - 风险：共现关系可能被恶意刷单/虚假搜索污染（竞品可通过自动化脚本制造虚假共现），需引入异常检测过滤噪
场景B：Listing 语义关键词扩展 - 业务问题：「婴儿背带」的 Listing 缺失大量搜索关联词（「新生儿抱抱带」「哺乳期背巾」） - 数据要求：同上，已构建的商品知识图谱 - 预期产出：基于图谱邻居节点的关键词扩展建议，覆盖买家搜索路径中的所有关联词 - 业务价值：自然流量覆盖词从 40 个扩展到 120 个，搜索曝光量提升 60-80%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
选品决策：关联选品成功率从 30% → 50%，假设年均尝试 20 个关联新品，每个新品年 GMV 差异 10 万，增量约 40 万元/年
Listing 优化：搜索覆盖词 +60-80%，带动自然流量年增量约 15-30 万元
用户旅程延长：图谱驱动的关联推荐使客单价提升 10-15%，年化约 8-20 万元
综合年化 ROI ≈ 63-90 万元
实施难度：⭐⭐⭐☆☆（中，需要平台搜索日志数据，图数据库部署）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（247 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 32 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_driven_product_kg` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-Driven-Product-KG.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
搜索驱动商品知识图谱构建
Search Co-occurrence → Node2Vec Graph Embedding → Semantic KG
"""

import numpy as np
from collections import defaultdict
import random
import math

# ─── 示例数据：模拟搜索日志 ───
SEARCH_LOGS = [
    # (session_id, user_id, [搜索词序列])
    ("s001", "u001", ["baby diapers newborn", "baby wipes sensitive", "diaper rash cream"]),
    ("s002", "u002", ["breast pump electric", "milk storage bags", "nursing bra"]),
    ("s003", "u003", ["baby bottle anti colic", "bottle warmer", "formula dispenser"]),
    ("s004", "u001", ["pull up training pants", "potty training seat", "toddler underwear"]),
    ("s005", "u004", ["baby carrier newborn", "nursing cover", "baby wrap"]),
    ("s006", "u002", ["baby monitor wifi", "white noise machine", "swaddle blanket"]),
    ("s007", "u003", ["baby diapers size 2", "baby wipes unscented", "baby lotion"]),
    ("s008", "u005", ["breast pump portable", "milk storage bags freezer", "nursing pad"]),
    ("s009", "u006", ["baby bottle slow flow", "bottle brush cleaner", "bottle sterilizer"]),
    ("s010", "u007", ["swim diaper reusable", "baby sunscreen", "baby swim ring"]),
    ("s011", "u004", ["pull up diapers girls", "potty training chart", "potty seat"]),
    ("s012", "u008", ["baby carrier hiking", "baby wrap stretchy", "infant carrier"]),
    ("s013", "u001", ["baby wipes travel", "diaper bag backpack", "changing pad"]),
    ("s014", "u009", ["electric breast pump", "storage bags breast milk", "breast pad"]),
    ("s015", "u003", ["anti colic bottle", "formula mixer", "baby bottle warmer electric"]),
]

# 搜索词规范化映射（简化品类）
QUERY_NORM = {
    "baby diapers newborn": "newborn_diaper",
    "baby diapers size 2": "size2_diaper",
    "baby wipes sensitive": "baby_wipes",
    "baby wipes unscented": "baby_wipes",
    "baby wipes travel": "baby_wipes",
    "diaper rash cream": "diaper_rash_cream",
    "breast pump electric": "electric_breast_pump",
    "electric breast pump": "electric_breast_pump",
    "breast pump portable": "portable_breast_pump",
    "milk storage bags": "milk_storage_bag",
    "milk storage bags freezer": "milk_storage_bag",
    "storage bags breast milk": "milk_storage_bag",
    "nursing bra": "nursing_bra",
    "nursing pad": "nursing_pad",
    "nursing cover": "nursing_cover",
    "breast pad": "nursing_pad",
    "baby bottle anti colic": "anti_colic_bottle",
    "baby bottle slow flow": "slow_flow_bottle",
    "anti colic bottle": "anti_colic_bottle",
    "bottle warmer": "bottle_warmer",
    "baby bottle warmer electric": "bottle_warmer",
    "formula dispenser": "formula_dispenser",
    "formula mixer": "formula_dispenser",
    "bottle brush cleaner": "bottle_brush",
    "bottle sterilizer": "bottle_sterilizer",
    "pull up training pants": "pull_up_diaper",
    "pull up diapers girls": "pull_up_diaper",
    "potty training seat": "potty_seat",
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2405.16871。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：平台搜索日志（用户 ID、会话 ID、搜索词、时间戳，卡页最少 10 万条）；粒度为 会话 × 搜索词。

**输出**：以目标品类或商品为节点的一跳或多跳关联图谱（卡页示例：婴儿游泳圈关联浮水背心/防水尿裤/婴儿防晒/泳圈打气筒）、基于图谱邻居的词扩展建议；供选品与 Listing 优化使用。

## 执行步骤

1. 采集搜索日志（会话 ID + 搜索词序列），卡页要求至少 10 万条
2. 对日志脱敏并构建搜索词共现图
3. 用图嵌入（Node2Vec）学习节点向量并建语义知识图谱
4. 以新品为节点查一跳邻居，输出可关联的品类清单
5. 用图谱邻居做 Listing 关键词扩展并评估覆盖提升

## 边界与不做

- 数据不满足：日志量不足（少于卡页 10 万条）或未脱敏时不得建图；被刷单或虚假搜索污染的共现需异常过滤。
- 何时不用：要基于竞品排名找缺口词，用「竞品关键词缺口分析」；要从评论语料挖词，用「评论关键词挖掘 SEO」。
- 能力边界：只输出关联图谱与扩展建议，不代选品决策；搜索数据须通过官方 API 获取并脱敏（第三方抓取违反平台 ToS）；卡页的新品成功率 30%→50%、综合年化 63-90 万元为案例口径。

## 技能关联

- **前置**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Listing-Semantic-Relevance-Scoring.html、Skill-Listing-Semantic-Relevance-Scoring、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop
- **延伸**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop
- **可组合**：Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-Search-VOC-Signal-Loop.html、Skill-Search-VOC-Signal-Loop、Skill-Search-Driven-Product-KG

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Driven-Product-KG`