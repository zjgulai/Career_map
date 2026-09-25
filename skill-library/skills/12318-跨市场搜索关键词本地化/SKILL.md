---
name: "p2s-international-search-localization"
title: "Skill-International-Search-Localization — 跨市场搜索关键词本地化"
description: "触发词：关键词本地化、跨语言语义相似度、LABSE、本地搜索词、Autocomplete挖掘、词库迁移。何时不用：要做季节性峰值词轮换排期用「季节性关键词轮换策略」；要找竞品覆盖缺口用「竞品关键词缺口分析」；要做长尾词挖掘用「长尾关键词挖掘」；要改写文案内容用「跨文化内容自动适配」。安全边界：词库须符合目标国消费者权益保护法与平台搜索政策，避免关键词堆砌导致限流，落地前经母语与合规复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-083"
l3_business: "本地化"
l3_all: "本地化 / 搜索意图分析"
l1_l2_l3: "业务运营/渠道经营/本地化"
p2s_card_id: "Skill-International-Search-Localization"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "把英语关键词库按目标市场的真实搜索习惯重做成本地词库，让日德法等站点的自然流量真正涨起来。"
user_try: "试试：把这款婴儿车的 200 个英语关键词本地化到日本站，输出 Top 本地高频词和语义过滤后的词库。"
whenToUse: "本卡属「本地化」并覆盖「搜索意图分析」，做关键词库的跨语言语义迁移。要做季节性峰值识别与竞价轮换用「季节性关键词轮换策略（Skill-Seasonal-Keyword-Rotation-Strategy）」；要找竞品覆盖缺口用「竞品关键词缺口分析（Skill-Competitor-Keyword-Gap-Analysis）」；要做长尾词挖掘用「长尾关键词挖掘（Skill-Long-Tail-Keyword-Mining）」；要做文案内容的文化重写用「文化感知内容本地化（Skill-Cross-Market-Content-Localization）」；要做多语言 Listing 生成用「多语言 Listing 生成（Skill-Multilingual-Listing-Generation）」。"
workflow: "整理英语种子词库并确定目标市场 → 抓取目标市场 Autocomplete Top 词作为翻译候选池 → 用多语言嵌入计算跨语言余弦相似度，过滤明显偏离的直译词 → 验证并保留本地高频词，补充文化特有需求词 → 输出本地化词库表并交付站点运营替换使用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-International-Search-Localization — 跨市场搜索关键词本地化

## ① 解决的问题

跨市场运营面临"直译关键词本地搜索量很低"——语义迁移本地化将德语市场自然搜索点击率提升3倍，年化增收25万元

## ② 核心算法逻辑

论文：Languageagnostic BERT Sentence Embedding (LABSE) | 年份：2020

## ③ 业务应用场景

场景：婴儿车进入日本/德国市场关键词本地化
- 业务问题：婴儿车英语词库（200个词）直接机器翻译后，日本市场点击量仅英国站的 30%，怀疑关键词不符合日本买家搜索习惯 - 数据要求：英语种子词库、目标市场 Amazon 域名访问权、多语言嵌入 API 或本地模型 - 执行方案： - 提取日语市场 Autocomplete Top 5（「ベビーカー」关联词） - 用语义相似度过滤明显偏离的翻译词 - 验证日语词「ベビーカー バギー 軽量 折りたたみ」等本地高频词 - 补充日本文化特有需求词：「コンパクト」「電車」「改札」（电车、检票口友好） - 量化产出：本地化词库从 200 个词扩展到 180 个高质量词，日站搜索曝光量提升 85% 
**三轨验证** | 成本轨：A9算法关键词优化月均成本1200元（工具订阅800元+人工40小时/月@10元/小时），3个月ROI达340%需投入3600元，预期自然流量增长带来月均GMV提升15-25万元 | 合规轨：符合《电商平台搜索算法推荐管理规范》，关键词本地化需符合目标国家《消费者权益保护法》，产品描述合规率需≥95%（依据：亚马逊A9、eBay搜索政策），建议建立合规审核流程 | 风险轨：①关键词堆砌导致账户限流概率15%（中风险）；②本地化翻译不当引发退货率上升概率20%（中风险）；③算法更新导致排名波动概率25%（低风险但高频发生）；④跨境物流延迟影响转化率概率10%（中风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：本地化词库优化后，日/德/法站搜索曝光量提升 50-100%，年化增量销售 3-10 万元/市场
实施难度：⭐⭐⭐☆☆（需要目标语言母语校对，存在文化理解门槛）
优先级：⭐⭐⭐⭐☆（进入新市场的基础动作，搜索流量直接影响初期生死）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（119 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
import re

# 模拟多语言嵌入（真实场景替换为 LABSE/mBERT）
def mock_multilingual_embedding(text: str, lang: str) -> np.ndarray:
    """模拟多语言嵌入向量（测试用）"""
    np.random.seed(hash(text + lang) % (2**31))
    vec = np.random.randn(128)
    return vec / np.linalg.norm(vec)

def cross_lingual_similarity(
    keyword_en: str,
    keyword_target: str,
    lang_target: str = "ja"
) -> float:
    """计算跨语言语义相似度"""
    vec_en = mock_multilingual_embedding(keyword_en, "en")
    vec_tg = mock_multilingual_embedding(keyword_target, lang_target)
    return float(np.dot(vec_en, vec_tg))

def filter_by_semantic_similarity(
    en_kw: str,
    translated_candidates: List[str],
    lang_target: str,
    threshold: float = 0.75
) -> List[Dict]:
    """语义相似度过滤翻译候选"""
    results = []
    for cand in translated_candidates:
        sim = cross_lingual_similarity(en_kw, cand, lang_target)
        results.append({
            "en_keyword": en_kw,
            "target_keyword": cand,
            "language": lang_target,
            "similarity": round(sim, 4),
            "pass_filter": sim >= threshold
        })
    return sorted(results, key=lambda x: -x["similarity"])

def localize_keyword_library(
    en_keywords: List[str],
    target_translations: Dict[str, List[str]],
    lang_target: str,
    threshold: float = 0.6
) -> pd.DataFrame:
    """批量本地化关键词库"""
    all_results = []
    for en_kw in en_keywords:
        candidates = target_translations.get(en_kw, [])
        if not candidates:
            all_results.append({
                "en_keyword": en_kw, "target_keyword": None,
                "language": lang_target, "similarity": 0, "pass_filter": False
            })
            continue
        filtered = filter_by_semantic_similarity(en_kw, candidates, lang_target, threshold)
        best = filtered[0] if filtered else None
        if best:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.09408，但该号在 arXiv 上是《Language Models with Transformers》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Languageagnostic BERT Sentence Embedding (LABSE)》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：输入为英语种子词库（原案例 200 词）、目标市场（如日本 / 德国 / 法国）、目标市场 Amazon 域名访问权，以及多语言嵌入 API 或本地 LABSE/mBERT 模型；另需目标市场的 Autocomplete 候选词（如日语「ベビーカー」关联词）作为翻译候选池。模板以 128 维多语言嵌入计算跨语言相似度，语义过滤阈值默认 0.75，词库批量本地化阈值默认 0.6。

**输出**：产出本地化关键词表（DataFrame：en_keyword、target_keyword、language、similarity、pass_filter）与按相似度排序的候选词清单，用于替换直译词、保留本地高频词并补充文化特有需求词（如日语「コンパクト」「電車」「改札」）。交付站点运营替换 Listing 关键词；原案例口径为词库从 200 词整理为 180 个高质量词、日站搜索曝光提升 85%，日/德/法站搜索曝光提升 50-100%。

## 执行步骤

1. 整理英语种子词库并确定目标市场
2. 抓取目标市场 Autocomplete Top 词作为翻译候选池
3. 用多语言嵌入计算跨语言余弦相似度，过滤明显偏离的直译词
4. 验证并保留本地高频词，补充文化特有需求词
5. 输出本地化词库表并交付站点运营替换使用

## 边界与不做

- 数据不满足：缺少英语种子词库、目标市场 Autocomplete 候选词，或无目标语言母语校对资源时不要用，先补齐词源与校对能力。
- 何时不用：要做季节性峰值词轮换用「季节性关键词轮换策略」；要找竞品词缺口用「竞品关键词缺口分析」；要做长尾词挖掘用「长尾关键词挖掘」；要改文案内容用「跨文化内容自动适配」或「文化感知内容本地化」。
- 能力边界：只做关键词的跨语言语义匹配与词库整理，不做关键词堆砌、不代投广告、不改写 Listing 正文，也不承诺排名；曝光提升 50-100%、年化增量 3-10 万元/市场均为原案例口径。
- 安全边界：关键词本地化须符合目标国家消费者权益保护法与平台搜索政策，产品描述合规率需保持在 95% 以上，落地前建立合规审核流程，避免堆砌关键词被限流。

## 技能关联

- **前置**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Cross-Market-Content-Localization.html、Skill-Cross-Market-Content-Localization、Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining、Skill-Multi-Market-Search-Localization.html、Skill-Multi-Market-Search-Localization、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy
- **延伸**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Cross-Market-Content-Localization.html、Skill-Cross-Market-Content-Localization、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy
- **可组合**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-Cross-Market-Content-Localization.html、Skill-Cross-Market-Content-Localization、Skill-International-Search-Localization

---

> 分类：业务运营/渠道经营/本地化　·　技术族：25-搜索流量工程　·　源卡：`Skill-International-Search-Localization`