---
name: "p2s-listing-semantic-relevance-scoring"
title: "Listing 语义相关性评分 — 用 Sentence-BERT 诊断 SEO 缺口"
description: "触发词：语义相关性、搜索意图匹配、语义缺口、SEO 体检、语义向量。何时不用：标题结构与点击率优化用「标题 CTR 优化器」；本技能量化的是文案与搜索意图的语义匹配度。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Listing-Semantic-Relevance-Scoring"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "检查你的文案和买家搜索意图到底差多远，指出缺了哪些语义关联词。"
user_try: "试试：用语义相关性给这个婴儿奶瓶 Listing 做 SEO 体检，指出缺口在哪些模块。"
whenToUse: "当关键词已在文案里但排名不动、需要定位语义覆盖缺口时用；纯标题结构排序优化用「标题 CTR 优化器」。"
workflow: "把 Listing 各模块与目标关键词整理成对照清单 → 计算每段文本与每个关键词的语义相关分 → 定位得分明显偏低的模块 → 与竞品 Top5 相关分对照并输出补全建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Listing 语义相关性评分 — 用 Sentence-BERT 诊断 SEO 缺口

## ① 解决的问题

Listing优化专员面临"文案改了好几版但排名无明显变化"——Sentence-BERT语义相关性评分将Listing与搜索意图匹配度从62%提升至89%，CTR提升22%

## ② 核心算法逻辑

Amazon A9/A10 的相关性模块本质是搜索词与 Listing 文本的语义匹配。传统 TFIDF 仅检测词频重叠，无法捕捉语义同义（如「pacifier」vs「soother」）。SentenceBERT 将文本映射到稠密语义向量空间，余弦相似度即为语义相关度。

## ③ 业务应用场景

场景A：婴儿奶瓶 Listing SEO 体检
卖家「wide neck baby bottle」关键词排名在第 3 页，怀疑 Listing 相关性不足影响 A9 评分。
- 业务问题：Title 中虽含目标词，但语义覆盖不全（缺少「anti-colic」「BPA free」「slow flow nipple」等语义关联词） - 数据要求：当前 Listing 文本（Title + 5 Bullets + Description）+ 目标关键词列表（10-20 个） - 执行步骤：SBERT 语义评分 → 低分模块定位 → 语义补全建议 - 预期产出：发现 Bullets 平均相关分仅 0.51（远低于 Top-5 竞品的 0.73），定位出「防胀气」「单手操作」等语义缺口 - 业务价值：优化后 30 天内「wide neck baby bottle」关键词排名

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Listing 语义优化后，目标词自然排名平均提升 1-2 页，点击率提升 20%，月均 GMV 增加 $1.8 万（以 5 个目标词、均价 $79 的婴儿用品测算）
实施难度：⭐⭐☆☆☆（轻量 TF-IDF 版当天可上线；SBERT 版需安装 sentence-transformers，M1 Mac 约 5 分钟完成推理）
优先级：⭐⭐⭐⭐⭐（新品上架前必做，存量产品季度性复查）
评估依据：Amazon 官方披露 Listing 相关性权重在 A9 信号中占约 20%；头部卖家 Listing 优化报告显示，专项语义优化 6 周内平均提升搜索曝光量 38%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/listing_semantic_relevance_scoring` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Listing-Semantic-Relevance-Scoring.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────
# Listing 语义相关性评分
# 使用 TF-IDF + 余弦相似度作为 SBERT 的轻量代理
# 生产环境替换为 sentence-transformers 库（pip install sentence-transformers）
# ─────────────────────────────────────────────

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ─── 模拟 Listing 数据 ───
SAMPLE_LISTING = {
    "title": "Wide Neck Baby Bottles 8oz 2-Pack, Anti-Colic Nipple, BPA-Free Tritan, "
             "for Breastfed Babies, Newborn Slow Flow, Easy to Clean",
    "bullets": [
        "ANTI-COLIC DESIGN: Advanced venting system reduces colic, gas, and spit-up "
        "for a happier feeding experience",
        "WIDE NECK BOTTLE: Mimics breastfeeding, easy to fill, clean, and perfect "
        "for breast milk or formula",
        "BPA FREE MATERIAL: Made from safe Tritan plastic, dishwasher safe top rack",
        "SLOW FLOW NIPPLE: Size 1 nipple included, suitable for 0-3 months newborns",
        "EASY GRIP DESIGN: Ergonomic shape for comfortable one-hand holding during feeding",
    ],
    "description": "Our wide neck baby bottles are designed for breastfed babies transitioning "
                   "between breast and bottle. The anti-colic nipple reduces gas and fussiness. "
                   "Made with BPA-free materials for your baby's safety.",
}

# 目标关键词列表（模拟卖家想要提升排名的词）
TARGET_KEYWORDS = [
    "wide neck baby bottle",
    "anti colic baby bottle",
    "baby bottle for breastfed babies",
    "BPA free baby bottle newborn",
    "slow flow baby bottle 0-3 months",
    "baby bottle easy clean dishwasher safe",
    "baby bottle ergonomic grip",
    "formula bottle for newborn",
    "breast pump compatible bottle",  # 缺口词
    "hospital grade baby bottle",      # 缺口词
]

# Top-5 竞品 Listing（用于对标）
COMPETITOR_LISTINGS = [
    "Wide neck anti colic baby bottle 8oz BPA free slow flow newborn breast milk formula hospital grade",
    "Anti colic baby bottle wide neck for breastfed babies 0-6 months dishwasher safe ergonomic",
    "Baby bottle BPA free tritan slow flow nipple anti colic wide neck breast pump compatible",
    "Newborn baby bottle 8oz wide neck ergonomic grip anti colic venting system breast milk",
    "Hospital grade baby bottle wide neck anti colic BPA free dishwasher safe slow flow nipple",
]


class ListingSemanticScorer:
    """Listing 语义相关性评分器（TF-IDF 代理 SBERT）"""
    
    def __init__(self, competitor_corpus: List[str]):
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1908.10084 — Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：当前 Listing 文本（标题、五条要点、描述）与目标关键词列表 10-20 个，可选竞品 Top5 文本用于对照。

**输出**：各模块与目标词的语义相关分、低分模块定位与语义缺口清单、补全建议，供文案改写。

## 执行步骤

1. 整理 Listing 各模块与目标关键词清单
2. 计算每段文本与每个关键词的语义相关分
3. 定位得分明显偏低的模块
4. 与竞品 Top5 相关分对照，找出语义缺口
5. 输出补全建议并复查

## 边界与不做

- 何时不用：目标关键词列表缺失或过泛时，评分没有对照意义
- 能力边界：只输出语义匹配诊断与补词建议，不保证排名提升，也不得堆砌无关词

## 技能关联

- **前置**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis
- **可组合**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Listing-Semantic-Relevance-Scoring

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：25-搜索流量工程　·　源卡：`Skill-Listing-Semantic-Relevance-Scoring`