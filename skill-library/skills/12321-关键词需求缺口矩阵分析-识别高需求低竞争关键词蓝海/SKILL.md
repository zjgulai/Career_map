---
name: "p2s-keyword-demand-gap-analysis"
title: "关键词需求缺口矩阵分析 — 识别高需求低竞争关键词蓝海"
description: "触发词：需求缺口矩阵、蓝海词、高需求低竞争、机会分排序、ACoS 优化。何时不用：要基于竞品排名找竞品有而自己没有的词时用「竞品关键词缺口分析」；要从评论语料挖词时用「评论关键词挖掘 SEO」。安全边界：只输出机会词与优先级建议，不代改 Listing。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 市场机会评估"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Keyword-Demand-Gap-Analysis"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "在「搜索量大、竞争小」的象限里找词，绕开红海主词，用更低的出价拿到自然流量。"
user_try: "试试：用这个品类 200 个关键词的搜索量和竞品数量，找出 15 个高需求低竞争的蓝海词。"
whenToUse: "当主词竞争过激、需要按需求与竞争双维度矩阵找蓝海关键词并排优先级时用本技能；要基于竞品排名找缺口词，用「竞品关键词缺口分析」；要从评论挖词，用「评论关键词挖掘 SEO」。"
workflow: "收集关键词搜索量、竞品数量与 CPC → 归一化后构建需求-竞争矩阵并算机会分 → 聚类识别蓝海词簇并做相似度扩展 → 输出优先级词表与投放建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 关键词需求缺口矩阵分析 — 识别高需求低竞争关键词蓝海

## ① 解决的问题

选品负责人面临"关键词研究全靠感觉竞争激烈蓝海找不到"——双维度缺口矩阵将高价值低竞争关键词发现效率提升5倍，年化流量成本降低$8.4万

## ② 核心算法逻辑

论文：Keyword Gap Analysis via DemandCompetition Matrix for Ecommerce Search | 年份：2020

## ③ 业务应用场景

卖家主攻「baby pacifier」（红海，搜索量 120 万但竞品 8000+），通过缺口分析发现未被充分挖掘的长尾词。
- 业务问题：主词竞争过激，PPC ACoS 高达 45%，自然排名难以突破 - 数据要求：目标品类 200 个关键词的搜索量 + 竞品数量 + CPC 数据 - 执行步骤：构建双维度矩阵 → 蓝海词聚类 → 相似度扩展 → 优先级排序 - 预期产出：识别「orthodontic pacifier for newborn」（搜索量 3.2 万，竞品仅 180 个）等 15 个蓝海词 - 业务价值：布局蓝海词 60 天后，自然流量增加 40%，PPC ACoS 降至 28%，月均 GMV 增加 $2.1 万
场景B：竞品 Listing TF-IDF 关键词挖掘

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：识别并布局 10 个蓝海词后，60 天自然流量提升 25%，PPC ACoS 从 40% 降至 27%，月均 GMV 增加 $2.5 万（以年销 $30 万店铺测算）
实施难度：⭐⭐☆☆☆（主要依赖现有工具数据，Python 实现门槛低）
优先级：⭐⭐⭐⭐⭐（每个新品上架前必做，直接决定流量底盘）
评估依据：亚马逊研究显示，搜索词覆盖率每提升 10%，自然流量增加约 8%；蓝海词竞争 PPC 出价平均低 35%，同等预算获得更多曝光

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（161 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/keyword_demand_gap_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Keyword-Demand-Gap-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────
# 关键词需求缺口矩阵分析
# 内置模拟数据，无需外部文件
# ─────────────────────────────────────────────

np.random.seed(2024)

# ─── Part 1: 模拟关键词数据 ───
def generate_keyword_data(n: int = 80) -> pd.DataFrame:
    """模拟品类关键词的搜索量 & 竞争指标"""
    keywords = [
        "baby pacifier", "newborn pacifier", "orthodontic pacifier",
        "silicone pacifier", "pacifier clip", "pacifier for breastfed baby",
        "glow in dark pacifier", "wubbanub pacifier", "mam pacifier",
        "avent soothie pacifier", "pacifier holder", "pacifier case",
        "natural rubber pacifier", "pacifier 0-3 months", "pacifier 3-6 months",
        "pacifier sterilizer", "pacifier chain", "cute pacifier",
        "pacifier with stuffed animal", "hospital grade pacifier",
    ]
    # 扩展到 n 个词
    base_kws = keywords * (n // len(keywords) + 1)
    kw_list = [f"{kw} v{i}" if i >= len(keywords) else kw
               for i, kw in enumerate(base_kws[:n])]
    
    # 搜索量（对数正态分布，模拟长尾效应）
    search_volume = np.random.lognormal(9.5, 1.5, n).clip(100, 1_200_000).astype(int)
    # 竞品数量
    competitor_count = np.random.lognormal(7.0, 1.2, n).clip(10, 30000).astype(int)
    # 平均 CPC（$）
    avg_cpc = np.random.lognormal(0.3, 0.5, n).clip(0.15, 4.5)
    # Top-3 点击集中度
    click_concentration = np.random.beta(5, 3, n).clip(0.2, 0.95)
    # 头部竞品均值评论数
    top5_avg_reviews = np.random.lognormal(7.5, 1.0, n).clip(50, 50000).astype(int)
    # 90 天增长率
    trend_90d = np.random.normal(0.05, 0.20, n).clip(-0.5, 1.2)
    
    return pd.DataFrame({
        "keyword": kw_list,
        "search_volume": search_volume,
        "competitor_count": competitor_count,
        "avg_cpc": avg_cpc,
        "click_concentration": click_concentration,
        "top5_avg_reviews": top5_avg_reviews,
        "trend_90d": trend_90d,
    })


def compute_opportunity_scores(df: pd.DataFrame) -> pd.DataFrame:
    """计算需求分 & 竞争分 & 机会分"""
    scaler = MinMaxScaler()
    
    # 需求分（越高越好）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.11239，但该号在 arXiv 上是《Denoising Diffusion Probabilistic Models》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Keyword Gap Analysis via DemandCompetition Matrix for Ecommerce Search》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标品类一批关键词（卡页 200 个）的搜索量、竞品数量与平均 CPC，可含点击集中度、Top5 平均评论数与 90 天趋势；粒度为 关键词。

**输出**：需求-竞争双维度矩阵与机会分排序、蓝海词清单（含搜索量与竞品数量）、聚类扩展出的相似长尾词与优先级投放建议；供选品与广告投放使用。

## 执行步骤

1. 收集目标品类关键词的搜索量、竞品数量与 CPC 数据
2. 归一化后构建需求分 × 竞争分双维度矩阵并计算机会分
3. 对候选词聚类，识别高需求低竞争的蓝海簇
4. 用相似度扩展蓝海词并排序优先级
5. 把蓝海词布局进 Listing 与广告，60 天后复盘流量与 ACoS

## 边界与不做

- 数据不满足：关键词搜索量与竞品数量缺失或口径不一致时矩阵失真，先统一数据源。
- 何时不用：要基于竞品实际排名找竞品有而自己没有的词，用「竞品关键词缺口分析」；要从评论语料挖买家真实用词，用「评论关键词挖掘 SEO」。
- 能力边界：只输出机会词与优先级建议，不代改 Listing、不保证 ACoS 下降幅度；卡页的自然流量 +40%、月均 GMV +$2.1 万为案例口径。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Keyword-Demand-Gap-Analysis

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Keyword-Demand-Gap-Analysis`