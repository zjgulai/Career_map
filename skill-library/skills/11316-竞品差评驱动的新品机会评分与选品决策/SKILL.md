---
name: "p2s-voc-new-product-gap-scoring"
title: "VOC-New-Product-Gap-Scoring — 竞品差评驱动的新品机会评分与选品决策"
description: "触发词：新品机会评分、差评挖掘、痛点频率、解决率、差异化切入。何时不用：要找未满足需求清单与切入价格带用「跨竞品评论选品机会评分」；要估算品类容量用「Market Size Estimation」。安全边界：VOC 数据须脱敏、仅用于内部产品改进分析，不得用于对外竞品攻击；样本代表性不足时须降级表述结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 竞品研究"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-VOC-New-Product-Gap-Scoring"
p2s_src_domain: "07-NLP-VOC"
quality_tier: "preview"
user_summary: "把竞品差评按痛点频率、竞品解决率和市场规模算成机会分，直接排出新品该主攻哪个差异化卖点。"
user_try: "试试：用 TOP3 竞品各 500 条差评给学步鞋品类做机会评分，告诉我先从哪个痛点切入。"
whenToUse: "需要在候选品类里挑差异化切入口、并要有可解释排序依据时用本技能；若已锁定品类、要找未满足需求与切入价格带，用「跨竞品评论选品机会评分」；若要判断品类容量，用「Market Size Estimation」。"
workflow: "采集 TOP3 竞品差评（各约 500 条）并保留正负评 → 提取高频痛点短语并统计频率 → 计算每个痛点的竞品解决率 → 结合市场规模权重合成机会得分 → 输出排序结果与主攻的差异化卖点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC-New-Product-Gap-Scoring — 竞品差评驱动的新品机会评分与选品决策

## ① 解决的问题

运营面临新品方向靠人工主观判断导致40%新品失败——竞品差评三维评分（痛点频率×竞品解决率×市场规模）将新品失败率降低40%，单次选品价值年化GMV约$180,000

## ② 核心算法逻辑

论文: AspectBased Sentiment Analysis for Product Opportunity Scoring (KDD 2019) | 年份: 2019

## ③ 业务应用场景

- 痛点：公司计划进入学步鞋品类，不确定从哪个产品差异化切入，历史纯靠人工看评论，主观性强。 - 数据：TOP3竞品各500条差评，共1,500条输入。 - 挖掘结果： - 「鞋底硬/不柔软」：F=0.82，R=0.18，M=0.65，综合得分=0.491（第1） - 「尺码偏小」：F=0.71，R=0.35，M=0.65，综合得分=0.300（第2） - 「系带难解」：F=0.45，R=0.22，M=0.65，综合得分=0.256（第3） - 选品决策：主攻「超软鞋底+人体工学设计」，差异化卖点明确，选品研发聚焦「鞋底柔软度认证」。 - 业务价值：新品上市3个月评分4.6（竞品均值3.9），
三轨验证 | 成本轨：月均成本1200元（NLP模型API调用费800元/月，数据标注人工12小时/月×50元/小时=600元，系统维护100元/月），ROI周期3个月 | 合规轨：符合《电商平台商品评价管理规范》和《个人信息保护法》，VOC数据脱敏处理，仅用于产品改进分析，无涉及消费者隐私泄露风险，结论：完全合规 | 风险轨：模型误判率8-12%导致改进方向偏差（概率25%），新品上市前验证周期可能延长1-2周（概率40%），竞品同步采用导致差异化优势削弱（概率30%）
**三轨验证** | 成本轨：月均成本2800元（专业NLP团队外包2000元/月，数据清洗与标注16小时/月×50元/小时=800元），ROI周期6个月，年度投入33600元 | 合规轨：需签署《数据处理协议DPA》，建立VOC数据分类分级体系，通过ISO27001信息安全认证，符合跨境电商数据合规要求（欧盟GDPR、日本PPC法），结论：条件合规，需补充数据跨境传输协议 | 风险轨：外包团队数据安全管控风险（概率15%），模型训练数据不足导致垂直度低于85%（概率35%），供应链响应滞后致改进周期拉长至45天（概率20%），暖奶器品类特殊性（温度精度需求）可能导致算法适配困难（概率28%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

决策质量：从主观人工看评论→数据驱动三维评分，可解释性强，选品会议效率提升60%
实施难度：⭐⭐（词频统计+简单公式，无需ML）
优先级：⭐⭐⭐⭐⭐（直接影响新品成败，ROI最高的VOC应用场景）
数据要求：TOP3竞品各≥300条差评，正负评均需

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（149 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
import numpy as np
from collections import Counter
from typing import List, Dict, Tuple


def extract_pain_point_phrases(
    texts: List[str],
    min_freq: int = 3,
    top_n: int = 30
) -> List[Tuple[str, int]]:
    """
    从评论中提取高频名词短语（简化版：bigram + 关键词过滤）
    返回 [(phrase, freq), ...]
    """
    # 停用词
    stop_words = {
        "the", "a", "an", "is", "was", "are", "i", "my", "it", "this",
        "and", "or", "but", "for", "with", "have", "had", "not", "very",
        "so", "too", "also", "just", "really", "would", "could", "they"
    }
    
    all_phrases = []
    for text in texts:
        words = re.findall(r'\b[a-z]+\b', text.lower())
        # unigram（非停用词）
        for w in words:
            if w not in stop_words and len(w) > 3:
                all_phrases.append(w)
        # bigram
        for i in range(len(words) - 1):
            if words[i] not in stop_words and words[i+1] not in stop_words:
                all_phrases.append(f"{words[i]} {words[i+1]}")
    
    counter = Counter(all_phrases)
    return [(p, c) for p, c in counter.most_common(top_n) if c >= min_freq]


def compute_competitor_resolution_rate(
    pain_phrase: str,
    negative_reviews: List[str],
    positive_reviews: List[str]
) -> float:
    """竞品解决率：正面评论提及 / (正面+负面提及)"""
    pos_count = sum(1 for t in positive_reviews if pain_phrase.lower() in t.lower())
    neg_count = sum(1 for t in negative_reviews if pain_phrase.lower() in t.lower())
    return pos_count / (pos_count + neg_count + 1)


def score_new_product_gaps(
    competitor_data: List[Dict],  # [{"negative": [str], "positive": [str], "volume": int}]
    market_scale_factor: float = 1.0,
    top_k: int = 10
) -> List[Dict]:
    """
    三维新品机会评分
    
    Args:
        competitor_data: 竞品数据列表，每个包含差评/好评列表和销量
        market_scale_factor: 市场规模系数（类目特定）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.03197，但该号在 arXiv 上是《Unified Language Model Pre-training for Natural Language Understanding and Generation》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《AspectBased Sentiment Analysis for Product Opportunity Scoring (KDD 2019)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：TOP3 竞品的差评数据（各约 500 条，正负评均需，单竞品建议不少于 300 条差评），需含文本与评分。

**输出**：各痛点的频率、竞品解决率、市场规模与综合机会得分排序（如鞋底硬 0.491、尺码偏小 0.300、系带难解 0.256），以及建议主攻的差异化卖点，供选品与研发聚焦使用。

## 执行步骤

1. 采集并清洗竞品差评数据
2. 提取高频痛点短语并统计频率
3. 计算每个痛点的竞品解决率
4. 结合市场规模权重合成机会得分
5. 输出排序结果与主攻差异化卖点

## 边界与不做

- 竞品差评样本不足、或只有负面样本时评分不可靠（数据要求正负评均需）
- 评分只做需求侧排序，不含成本、供应链与认证可行性判断
- VOC 数据须脱敏、仅用于内部产品改进分析，不得用于对外竞品攻击

## 技能关联

- **前置**：Skill-NPS-Proxy-Retention-Predictor.html、Skill-NPS-Proxy-Retention-Predictor、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **延伸**：Skill-NPS-Proxy-Retention-Predictor.html、Skill-NPS-Proxy-Retention-Predictor、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-Churn-Signal-Extraction.html、Skill-VOC-Churn-Signal-Extraction
- **可组合**：Skill-NPS-Proxy-Retention-Predictor.html、Skill-NPS-Proxy-Retention-Predictor、Skill-Review-Sentiment-Growth-Trigger.html、Skill-Review-Sentiment-Growth-Trigger、Skill-VOC-New-Product-Gap-Scoring

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-New-Product-Gap-Scoring`