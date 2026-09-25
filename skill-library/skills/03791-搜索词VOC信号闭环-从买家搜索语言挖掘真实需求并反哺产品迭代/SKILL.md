---
name: "p2s-search-voc-signal-loop"
title: "搜索词VOC信号闭环 — 从买家搜索语言挖掘真实需求并反哺产品迭代"
description: "触发词：搜索词 VOC、未满足痛点、Listing 改写、需求词挖掘、迭代优先级。何时不用：分析对象是评论而非搜索词时用「AGRS 属性引导评论摘要」；要按属性组合量化偏好用「联合分析产品设计」。安全边界：禁止直接复制竞品 ASIN 搜索词用于广告或 Listing 抄袭；避免使用 best、#1 等广告法敏感词。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码 / 产品需求定义"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
p2s_card_id: "Skill-Search-VOC-Signal-Loop"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从买家还没下单时的搜索词里挖真实痛点，排出高频未满足需求，再用它指导 Listing 改写和产品迭代。"
user_try: "试试：用近三个月的品类搜索词列出高频未满足痛点排行，再给这 20 个 SKU 各出 TOP5 待覆盖痛点词。"
whenToUse: "要用买家自己的搜索语言找需求缺口、或给 Listing 改写排优先级时用本技能；若分析对象是已有评论，用「AGRS 属性引导评论摘要」；若要量化属性偏好组合，用「联合分析产品设计」。"
workflow: "采集品类搜索词数据与搜索量代理信号（如近 3 个月万级搜索词） → 按意图分类关键词并识别未满足需求表达 → 聚合高频未满足痛点并排序 → 为各 SKU 匹配最高频未覆盖痛点词 → 输出产品迭代优先级与 Listing 改写要点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索词VOC信号闭环 — 从买家搜索语言挖掘真实需求并反哺产品迭代

## ① 解决的问题

产品负责人面临"用户搜索词里包含大量产品改进信号但从未被系统分析利用"——搜索词VOC信号挖掘将用户真实需求语言提炼效率提升8倍，Listing迭代周期从季度压缩至月度，年化$4.8万

## ② 核心算法逻辑

传统 VOC（Voice of Customer）分析依赖评论/调研，存在时间滞后（商品上市后才有评论）和选择偏差（只有购买者才会评论）。搜索词是更直接的 VOC 信号：买家还没买产品时，用自己的语言描述需求——「奶瓶换完宝宝不接受」「纸尿裤漏到背上怎么办」，这些搜索词是真实痛点的第一手表达。

## ③ 业务应用场景

场景A：新品开发方向决策 - 业务问题：吸奶器品类市场饱和，不知道下一个功能差异化方向在哪里 - 数据要求：3 个月内品类搜索词数据（万级），搜索量代理信号（AC 接口） - 预期产出：高频未满足痛点排行榜（如「silent breast pump office use」「wearable pump no tubing」各出现 8000+ 次/月），量化产品迭代优先级 - 业务价值：基于数据的产品决策替代拍脑袋，新品成功率从 25% → 45%，每款成功新品年均 GMV 约 50-100 万元，ROI 极高
三轨验证： - 成本：显性成本约 2-5 万元/年（搜索词数据采集工具费 + 1 名运营每周 4 小时分析时间）。若使用第三方工具（如 Helium 10、Jungle Scout）需额外订阅费 1000-3000 元/月。 - 合规：Amazon 政策允许使用搜索词数据进行产品开发，但禁止直接复制竞品 ASIN 搜索词用于广告或 Listing 抄袭。GDPR 方面，搜索词为聚合匿名数据，不涉及个人身份信息，合规风险低。需注意避免使用「best」「#1」等广告法敏感词。 - 风险：① 竞品可能同步获取相同数据，导致差异化窗口缩短至 3-6 个月；② 若过度依赖搜索词数据而忽略用户访谈/实地调
场景B：Listing 改写优先级排序 - 业务问题：200 个 SKU 需要更新 Listing 文案，不知道从哪里改、改什么 - 数据要求：各 SKU 对应的搜索词数据，现有 Listing 文本 - 预期产出：每个 SKU 的「最高频未覆盖痛点词 TOP5」，作为 Listing 改写重点 - 业务价值：改写后转化率平均提升 10-20%，假设 50 个主力 SKU 月均销售额各 5 万元，转化率+15% → 月增 GMV 约 37.5 万元，年化约 450 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
产品决策提速：新品方向有数据支撑，开发成功率从 25% → 45%，年化可量化增量 ≥ 50 万元（1-2 款成功新品）
Listing 转化率提升：痛点词注入 bullets 后转化率 +10-20%，50 主力 SKU 年化 GMV 增量约 200-450 万元
关键词选词质量：高机会痛点词 CPC 通常比功能词低 20-40%，年化广告节省约 5-10 万元
综合年化 ROI ≈ 255-510 万元（产品迭代 + Listing 优化的长期复利效益）
实施难度：⭐⭐☆☆☆（低，仅需搜索词数据+规则分类，无需复杂 ML 基础设施）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（212 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_voc_signal_loop` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-VOC-Signal-Loop.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
搜索词 VOC 信号闭环分析
Search Query → VOC Signal Extraction → Listing/Product Feedback Loop
"""

import re
import math
from collections import Counter, defaultdict

# ─── 示例数据：搜索词日志（模拟） ───
SEARCH_QUERY_DATA = [
    # (搜索词, 月搜索量代理, 点击率代理)
    ("breast pump leaking milk", 4200, 0.12),
    ("silent breast pump work office", 3800, 0.09),
    ("wearable pump no tubes", 6100, 0.15),
    ("breast pump suction too weak", 2900, 0.08),
    ("hands free pump spill", 3300, 0.11),
    ("breast milk storage freezer leak", 2100, 0.07),
    ("baby bottle nipple flow too fast", 5400, 0.13),
    ("anti colic bottle still gassy", 4700, 0.10),
    ("newborn reject bottle nipple", 3600, 0.09),
    ("bottle warmer hot spots uneven", 1800, 0.06),
    ("overnight diapers leak back", 8900, 0.18),
    ("diaper rash red bump", 7200, 0.16),
    ("pull up diaper fall down active toddler", 5600, 0.14),
    ("diaper wings fall off", 4100, 0.10),
    ("newborn diaper umbilical cord uncomfortable", 3200, 0.08),
    ("baby carrier hurt back after 30 min", 6700, 0.17),
    ("carrier too hot summer", 5100, 0.12),
    ("newborn not supported in carrier", 4400, 0.11),
    ("best breast pump insurance coverage", 9200, 0.20),
    ("best anti colic bottle 2024", 7800, 0.18),
    ("anti colic bottle newborn", 12000, 0.25),
    ("overnight diapers size 4", 11500, 0.23),
    ("electric breast pump double", 8600, 0.19),
    ("baby bottle slow flow 4oz", 6900, 0.16),
]

# 意图分类关键词
INTENT_KEYWORDS = {
    "problem_solving": ["leak", "leaking", "hurt", "pain", "too hot", "too weak", "spill",
                        "reject", "uncomfortable", "fall off", "fall down", "uneven",
                        "gassy", "still", "red", "bump", "not supported"],
    "comparison": ["best", "vs", "compare", "better", "alternative", "top", "review", "2024", "2025"],
    "functional": ["how", "work", "use", "install", "clean", "sterilize", "replace"],
    "attribute": ["size", "flow", "silent", "hands free", "wearable", "wireless", "double", "single"],
}


def classify_intent(query: str) -> str:
    """简单规则意图分类"""
    query_lower = query.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            return intent
    return "navigational"


def simple_sentiment_score(query: str) -> str:
    """简化情感分析（基于词典）"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.11924，但该号在 arXiv 上是《LCODE: Quasistatic code for simulating long-term evolution of three-dimensional plasma wakefields》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 3 个月的品类搜索词数据（万级）与搜索量代理信号（AC 接口），以及各 SKU 对应的搜索词数据与现有 Listing 文本。

**输出**：高频未满足痛点排行榜（含月搜索量，如 silent breast pump office use、wearable pump no tubing 各 8000+ 次/月）、产品迭代优先级，以及每个 SKU 的最高频未覆盖痛点词 TOP5，作为 Listing 改写重点。

## 执行步骤

1. 采集品类搜索词与搜索量代理信号
2. 按意图分类并识别未满足需求表达
3. 聚合排序高频未满足痛点
4. 为每个 SKU 匹配未覆盖的痛点词
5. 输出迭代优先级与 Listing 改写要点

## 边界与不做

- 拿不到品类搜索词与搜索量代理信号时不适用；单一时间窗数据不足以判断趋势
- 搜索词反映的是购买前意图，需与评论、访谈交叉验证，不能替代实地用户研究
- 禁止直接复制竞品 ASIN 搜索词用于广告或 Listing 抄袭，避免使用 best、#1 等广告法敏感词

## 技能关联

- **前置**：Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-LLM-Search-Query-Expansion.html、Skill-LLM-Search-Query-Expansion、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Temporal-Trend-Mining.html、Skill-Review-Temporal-Trend-Mining、Skill-Search-Driven-Product-KG.html、Skill-Search-Driven-Product-KG、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-LLM-Search-Query-Expansion.html、Skill-LLM-Search-Query-Expansion、Skill-NLP-Sentiment-ML-Pipeline.html、Skill-NLP-Sentiment-ML-Pipeline、Skill-Review-Temporal-Trend-Mining.html、Skill-Review-Temporal-Trend-Mining、Skill-Search-Driven-Product-KG.html、Skill-Search-Driven-Product-KG、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping
- **可组合**：Skill-LLM-Search-Query-Expansion.html、Skill-LLM-Search-Query-Expansion、Skill-Search-Driven-Product-KG.html、Skill-Search-Driven-Product-KG、Skill-Search-Tag-Keyword-Auto-Mapping.html、Skill-Search-Tag-Keyword-Auto-Mapping、Skill-Search-VOC-Signal-Loop

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-VOC-Signal-Loop`