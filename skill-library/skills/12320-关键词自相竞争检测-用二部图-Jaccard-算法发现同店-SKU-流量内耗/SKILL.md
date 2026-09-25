---
name: "p2s-keyword-cannibalization-detection"
title: "关键词自相竞争检测 — 用二部图 Jaccard 算法发现同店 SKU 流量内耗"
description: "触发词：关键词内耗、自相竞争检测、Jaccard 重叠、关键词主权分配、同店抢词。何时不用：要找的是竞品有而自己没有的词缺口时用「竞品关键词缺口分析」；要判断品类节点竞争密度时用「品类树节点竞争密度优化」。安全边界：只输出重叠诊断与词主权建议，不代改 Listing。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Keyword-Cannibalization-Detection"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "揪出自家几个 SKU 在同一批词上互相抢流量，给每个 SKU 划好主攻词，让总流量做加法而不是减法。"
user_try: "试试：检查我店里三款婴儿背带的关键词重叠度，给每款分配专属主攻词。"
whenToUse: "当同店多个同品类 SKU 在同一批关键词上互相内耗、流量集中度低时用本技能；若要找的是竞品有排名而自己没有的词，用「竞品关键词缺口分析」；若要判断的是品类节点竞争密度，用「品类树节点竞争密度优化」。"
workflow: "导出同品类各 SKU 的 Top-30 自然关键词与排名 → 构建 SKU-关键词二部图并算 Jaccard 矩阵 → 识别高重叠 SKU 对 → 分配关键词主权并复盘流量变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 关键词自相竞争检测 — 用二部图 Jaccard 算法发现同店 SKU 流量内耗

## ① 解决的问题

多SKU卖家面临"同店产品互相抢关键词流量越打越内耗"——Jaccard二部图检测将关键词重叠SKU识别精度达94%，流量集中度提升35%

## ② 核心算法逻辑

论文：Bipartite Graph Neural Networks for Keyword Cannibalization Detection in Ecommerce Search | 年份：2020

## ③ 业务应用场景

场景A：婴儿背带系列 SKU 关键词内耗诊断
店铺有 3 款婴儿背带（基础款/腰凳款/环抱款），发现「baby carrier ergonomic」关键词上 3 个 ASIN 都在第 2-3 页互相内耗，总流量不如聚焦 1 个。
- 业务问题：三款产品 Listing 关键词高度重叠（Jaccard ≈ 0.62），导致 A9 不确定展示哪个 - 数据要求：每个 SKU 的 Top-30 自然关键词 + 各关键词下的排名/点击量 - 执行步骤：构建二部图 → Jaccard 矩阵计算 → 高重叠对识别 → 关键词主权分配 - 预期产出：腰凳款专攻「baby carrier waist support」，环抱款专攻「newborn wrap carrier」，3 款产品 Top 词不重叠率从 38% 提升到 85% - 业务价值：30 天后三款产品各自排名提升 1.5 页，总自然流量增加 55%，月 GMV 增加 $4.

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：消除自相竞争后，店铺总自然流量增加 30-55%（竞争越严重提升越明显）；广告 CPC 因停止内部哄抬降低约 18%，同等预算月 GMV 增量估算 $3.5 万（以年销 $50 万多 SKU 店铺测算）
实施难度：⭐⭐⭐☆☆（需要各 SKU 关键词排名历史数据，Seller Central 可导出；Python 分析约 1 天完成）
优先级：⭐⭐⭐⭐☆（多 SKU 店铺（>3个同品类）必做，单 SKU 店铺不适用）
评估依据：实操案例显示，关键词分化后 60 天内同品类 SKU 各自排名平均提升 8-12 个位次，总点击量提升优于未分化时 40%+

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（168 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/keyword_cannibalization_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Keyword-Cannibalization-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from itertools import combinations
from collections import defaultdict
from typing import List, Dict, Set, Tuple

# ─────────────────────────────────────────────
# 关键词自相竞争检测 + 关键词主权分配
# 内置模拟数据，无需外部文件
# ─────────────────────────────────────────────

np.random.seed(2024)

# ─── 模拟多 SKU 关键词排名数据 ───
SKU_CATALOG = [
    {"sku": "BC-BASIC", "name": "婴儿背带基础款", "price": 49.99},
    {"sku": "BC-WAIST", "name": "婴儿背带腰凳款", "price": 79.99},
    {"sku": "BC-WRAP", "name": "新生儿环抱款背带", "price": 59.99},
    {"sku": "BC-TODDLER", "name": "幼儿大童背带", "price": 89.99},
]

# 关键词池（模拟该品类核心词）
ALL_KEYWORDS = [
    "baby carrier ergonomic", "baby carrier newborn", "baby wrap carrier",
    "baby carrier waist support", "newborn wrap carrier", "infant carrier",
    "baby carrier hip seat", "ergonomic baby carrier 0-3 months",
    "baby carrier toddler", "baby sling carrier", "structured baby carrier",
    "baby carrier lumbar support", "baby carrier 4 positions",
    "baby wearing carrier", "front pack baby carrier",
    "baby carrier lightweight", "breathable baby carrier",
    "baby carrier for dad", "toddler carrier hiking",
    "newborn to toddler carrier",
]


def generate_sku_keyword_data(skus: List[Dict],
                               keywords: List[str]) -> pd.DataFrame:
    """模拟每个 SKU 在各关键词下的排名和点击数据"""
    records = []
    for sku_info in skus:
        sku = sku_info["sku"]
        for kw in keywords:
            # 模拟相关性（不同 SKU 对不同词的相关性不同）
            if "waist" in kw or "hip seat" in kw:
                rel = 0.9 if "WAIST" in sku else 0.3
            elif "newborn" in kw or "wrap" in kw:
                rel = 0.9 if "WRAP" in sku else 0.35
            elif "toddler" in kw or "hiking" in kw:
                rel = 0.9 if "TODDLER" in sku else 0.2
            else:
                rel = 0.65  # 通用词所有 SKU 都有竞争
            
            # 加噪声
            rel = np.clip(rel + np.random.normal(0, 0.1), 0, 1)
            
            # 只记录有实质排名的词（相关性 > 0.3）
            if rel > 0.3:
                rank = max(1, int(np.random.exponential(20 / rel)))
                clicks = max(0, int(rel * 100 + np.random.normal(0, 10)))
                records.append({
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.04967，但该号在 arXiv 上是《Summarising Big Data: Common GitHub Dataset for Software Engineering Challenges》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Bipartite Graph Neural Networks for Keyword Cannibalization Detection in Ecommerce Search》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每个 SKU 的 Top-30 自然关键词及其排名、点击量（Seller Central 可导出）；粒度为 SKU × 关键词。

**输出**：高重叠 SKU 对清单（含 Jaccard 相似度）、关键词主权分配方案（哪个 SKU 主攻哪个词）与分化前后的词不重叠率对比；供 Listing 与广告运营执行词分化。

## 执行步骤

1. 导出同品类各 SKU 的 Top-30 自然关键词、排名与点击量
2. 构建 SKU-关键词二部图并计算 Jaccard 重叠矩阵
3. 识别高度重叠的 SKU 对（卡页示例 Jaccard ≈0.62）
4. 为每个 SKU 分配专属主攻词，实现关键词主权分配
5. 30 天后复盘词不重叠率、排名与总自然流量变化

## 边界与不做

- 数据不满足：只有店铺整体词表、拿不到 SKU 级关键词排名时算不出重叠，先导出 SKU 级数据。
- 何时不用：要解决的是竞品有而自己没有的词缺口，用「竞品关键词缺口分析」；要判断的是品类节点竞争密度，用「品类树节点竞争密度优化」；单 SKU 店铺不适用（卡页注明同品类 >3 个 SKU 才必要）。
- 能力边界：只输出重叠诊断与词主权建议，不代改 Listing、不保证排名恢复；卡页的识别精度 94%、流量 +30-55%、月 GMV 增量 $3.5 万为案例口径。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Keyword-Cannibalization-Detection

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Keyword-Cannibalization-Detection`