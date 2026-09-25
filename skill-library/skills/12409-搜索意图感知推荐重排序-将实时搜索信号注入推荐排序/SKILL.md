---
name: "p2s-search-aware-recommendation-reranking"
title: "搜索意图感知推荐重排序 — 将实时搜索信号注入推荐排序"
description: "触发词：搜索意图注入、推荐重排、搜索场景推荐、CTR 提升、Listing 优化优先级。何时不用：要用用户长期画像做搜索排序时用「个性化搜索排序」；要做召回层语义检索时用「密集段落检索」。安全边界：只做重排层融合，不改推荐模型本体。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Search-Aware-Recommendation-Reranking"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "用户正在搜什么，就影响右侧推荐什么，别在他搜奶瓶的时候还推婴儿车。"
user_try: "试试：把实时搜索词注入推荐重排，让搜索「防胀气奶瓶」时的推荐位不再出现婴儿车。"
whenToUse: "当搜索结果页的推荐位与用户当前搜索意图脱节、推荐点击率极低时用本技能；要用用户长期画像做搜索排序，用「个性化搜索排序」；要做召回层语义检索，用「密集段落检索」。"
workflow: "取推荐原始评分与商品文本算搜索相关性分 → 按权重融合搜索分与推荐分做重排 → 校验品牌词等特殊情况与多样性 → A/B 对比 CTR 并输出优化优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索意图感知推荐重排序 — 将实时搜索信号注入推荐排序

## ① 解决的问题

推荐算法工程师面临"推荐系统不知道用户当前搜索意图导致推荐与搜索意图脱节"——搜索意图向量注入重排序将搜索场景推荐CTR提升28%，年化$6.8万GMV增量

## ② 核心算法逻辑

传统推荐系统基于用户历史行为（购买/点击/收藏）建模兴趣，与用户当前搜索意图存在时序脱节。用户搜索「婴儿纸尿裤 敏感肌」时，推荐系统如果仍展示TA上次购买的「吸奶器」相关商品，就是意图错配。

## ③ 业务应用场景

场景A：搜索结果页「猜你喜欢」联动优化 - 业务问题：用户搜索「防胀气奶瓶」后，右侧推荐位仍展示「婴儿车」，点击率不足 0.5% - 数据要求：推荐系统原始评分（CSV：user_id, item_id, rec_score），商品标题/描述文本，实时搜索词 - 预期产出：重排序后推荐位 CTR 从 0.5% → 1.5-2.0% - 业务价值：推荐位 CTR 翻 3 倍，假设月均推荐位曝光 100 万次，CTR 提升 1%，月均点击增量 1 万，转化率 3%，客单价 200 元 → 月增 GMV 约 6 万，年化约 72 万元
三轨验证（场景A）： - 成本：需接入推荐系统评分 API（约 2 人周开发），TF-IDF 向量化计算资源约 0.5 核/天，月均服务器成本约 200 元；若需实时 embedding 模型（如 Sentence-BERT），GPU 实例成本约 3000 元/月 - 合规：Amazon 政策允许基于搜索词调整推荐排序，但不得伪造搜索词或操纵自然排名；GDPR 下需确保用户搜索数据匿名化处理，不存储原始查询与用户 ID 的关联超过 30 天 - 风险：过度依赖搜索信号可能导致推荐多样性下降，用户长期兴趣被短期意图淹没，引发「信息茧房」；若搜索词包含品牌名（如「Pampers」），重排序可能被平
场景B：Listing 优化优先级排序 - 业务问题：有 200 个 SKU 需要优化 Listing，不知道优先改哪些 - 数据要求：搜索词→商品相关性评分，推荐系统输出分 - 预期产出：搜索-推荐双维度评分最低的 SKU = 最急需优化，输出优先级排单 - 业务价值：资源集中在高价值 Listing，运营效率提升 40%，重点商品自然排名 30 天内平均上升 5-8 位

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
推荐位 CTR：从 0.5% → 1.5-2.0%，月均曝光 100 万次，年化 GMV 增量约 60-90 万元
广告协同降本：推荐位精准化后广告补充成本降低 10%，年化节省约 8 万元
Listing 优先级优化：运营效率提升 40%，聚焦高 ROI SKU，年化产出提升约 15 万元
综合年化 ROI ≈ 83-113 万元
实施难度：⭐⭐⭐☆☆（中，需要推荐系统已输出评分接口，融合层轻量级）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_aware_recommendation_reranking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-Aware-Recommendation-Reranking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
搜索意图感知推荐重排序（SEO-aware Reranking）
Search Query Intent + Recommendation Score → Pointwise Re-ranking
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ─── 示例数据 ───
# 商品库（item_id → 文本描述）
ITEMS = {
    "item_001": "Pampers Swaddlers overnight diapers size 4 extra absorbent leak protection 12 hour",
    "item_002": "Huggies Little Snugglers newborn diapers size 1 umbilical cord notch gentle",
    "item_003": "Dr. Brown anti-colic baby bottle slow flow nipple breastfeeding transition 4oz",
    "item_004": "Philips Avent anti-gas bottle natural feel wide neck newborn 4oz",
    "item_005": "Spectra S2 electric breast pump double hospital grade PISA insurance",
    "item_006": "Medela pump in style breast pump portable rechargeable wearable",
    "item_007": "Graco 4Ever car seat all-in-one infant toddler booster 4 stage",
    "item_008": "Uppababy Vista stroller full-size bassinet toddler seat city travel",
    "item_009": "MAM anti-colic bottle self-sterilizing slow flow 0 months newborn",
    "item_010": "Pampers Pure Protection diapers fragrance-free hypoallergenic sensitive skin newborn",
}

# 推荐系统原始评分（user_id → {item_id: rec_score}）
REC_SCORES = {
    "user_alice": {
        "item_001": 0.82, "item_002": 0.76, "item_003": 0.61,
        "item_004": 0.55, "item_005": 0.70, "item_006": 0.68,
        "item_007": 0.43, "item_008": 0.41, "item_009": 0.58, "item_010": 0.72,
    },
    "user_bob": {
        "item_001": 0.45, "item_002": 0.38, "item_003": 0.88,
        "item_004": 0.85, "item_005": 0.52, "item_006": 0.49,
        "item_007": 0.71, "item_008": 0.66, "item_009": 0.81, "item_010": 0.42,
    }
}

# 搜索查询
QUERIES = {
    "user_alice": "overnight diapers heavy wetter leak proof",
    "user_bob": "anti colic baby bottle newborn slow flow",
}


def build_item_embeddings(items: dict):
    """构建商品 TF-IDF 嵌入矩阵"""
    item_ids = list(items.keys())
    texts = [items[iid] for iid in item_ids]
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    tfidf_matrix = vectorizer.fit_transform(texts)
    return item_ids, tfidf_matrix, vectorizer


def compute_search_scores(query: str, item_ids: list, tfidf_matrix, vectorizer) -> dict:
    """计算搜索词与各商品的语义相关性分"""
    query_vec = vectorizer.transform([query])
    sims = cosine_similarity(query_vec, tfidf_matrix).flatten()
    return {item_ids[i]: float(sims[i]) for i in range(len(item_ids))}
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2406.08421。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：推荐系统输出的原始评分（user_id、item_id、rec_score）、商品标题或描述文本、用户的实时搜索词；粒度为 用户 × 推荐位 × 当前搜索词。

**输出**：融合实时搜索意图后的重排推荐列表（卡页口径推荐位 CTR 0.5%→1.5-2.0%），以及在场景 B 下输出的 Listing 优化优先级排单；供推荐服务与商品运营使用。

## 执行步骤

1. 取推荐系统原始评分与商品文本，向量化并计算与实时搜索词的相关性分
2. 把搜索相关性分与推荐分按权重融合，重排推荐位
3. 校验品牌词等特殊情况，避免排序被单一品牌带走
4. 监控推荐多样性，防止长期兴趣被短期意图淹没
5. A/B 对比推荐位 CTR，并对双维度低分 SKU 输出优化优先级

## 边界与不做

- 数据不满足：推荐系统尚未输出可用评分接口、或拿不到实时搜索词时无法做融合重排。
- 何时不用：要用用户长期画像做搜索排序，用「个性化搜索排序」；要做召回层语义检索，用「密集段落检索」。
- 能力边界：只做重排层融合，不改推荐模型本体；过度依赖搜索信号会降低推荐多样性；卡页的 CTR 0.5%→1.5-2.0%、综合年化 83-113 万元为案例口径。

## 技能关联

- **前置**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Organic-Paid-Rank-Synergy-Model.html、Skill-Organic-Paid-Rank-Synergy-Model、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Organic-Growth-Attribution.html、Skill-Search-Organic-Growth-Attribution、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-Organic-Paid-Rank-Synergy-Model.html、Skill-Organic-Paid-Rank-Synergy-Model、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Organic-Growth-Attribution.html、Skill-Search-Organic-Growth-Attribution
- **可组合**：Skill-Organic-Paid-Rank-Synergy-Model.html、Skill-Organic-Paid-Rank-Synergy-Model、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Organic-Growth-Attribution.html、Skill-Search-Organic-Growth-Attribution、Skill-Search-Aware-Recommendation-Reranking

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Aware-Recommendation-Reranking`