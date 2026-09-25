---
name: "p2s-competitor-keyword-gap-analysis"
title: "Skill-Competitor-Keyword-Gap-Analysis — 竞品关键词缺口分析"
description: "触发词：竞品词缺口、关键词覆盖差集、Gap Score、投放分档、覆盖率提升。何时不用：要处理自家多 SKU 互相抢词的内耗时用「关键词自相竞争检测」；要不依赖竞品清单找蓝海词时用「关键词需求缺口矩阵分析」。安全边界：只做缺口识别与排序建议，不代改 Listing、不代建广告。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Competitor-Keyword-Gap-Analysis"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "把竞品有排名而自己没有的词一次列全，并按值不值得投分成几档，别再把词库漏成筛子。"
user_try: "试试：对比这 3 个竞品的 Top 关键词，列出我有缺口的高价值词并给出投放分档建议。"
whenToUse: "当需要基于竞品关键词排名找出自家未覆盖的词并排优先级时用本技能；若要处理的是自家多个 SKU 互相抢词，用「关键词自相竞争检测」；若不依赖竞品清单、只按需求与竞争找蓝海词，用「关键词需求缺口矩阵分析」。"
workflow: "导出自家与竞品的 Top 关键词列表 → 用集合差算出缺口词集合 → 按覆盖度、搜索量与难度算 Gap Score 排序 → 按搜索量分档输出投放动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Competitor-Keyword-Gap-Analysis — 竞品关键词缺口分析

## ① 解决的问题

运营面临"竞品有排名的词我们完全没有覆盖"——关键词缺口挖掘将自然流量词汇覆盖率从45%提升至72%，年化增加自然流量价值35万元

## ② 核心算法逻辑

竞品关键词缺口分析（Competitor Keyword Gap Analysis）通过集合论运算，找出"竞品有排名而自己没有"的高价值关键词。

## ③ 业务应用场景

- 业务问题：自家婴儿睡袋 ASIN 月搜索词覆盖量 80 个，竞品 A 覆盖 350 个、竞品 B 覆盖 290 个，不知道哪些词被竞品独吃 - 数据要求：3-5 个竞品 ASIN、Helium10 Cerebro 导出关键词列表（含排名/搜索量） - 执行方案： - 提取 3 个竞品各自 Top 150 关键词 - 计算 Gap 词（≈180 个未覆盖词） - 按 Gap Score 排序，优先测试搜索量 >1,000/月的 Gap 词（约 35 个） - 对月搜索量 >5,000 的 Top Gap 词单独建 Campaign - 量化产出：新增 35 个高价值 Gap 词的覆盖，3 个
三轨验证 | 成本轨：月均成本1200元（竞品监测工具600元+数据分析师12小时/月×50元/小时=600元），ROI周期2-3个月 | 合规轨：符合《电商平台竞争情报采集规范》，仅采集公开数据，不涉及爬虫违规；需签署数据使用协议，合规依据为平台ToS条款 | 风险轨：关键词数据延迟1-2天（概率60%）、竞品策略变化快速响应不及时（概率40%）、工具API调用限制导致数据中断（概率15%）
**三轨验证** | 成本轨：月均成本2800元（专业竞品分析平台1800元+AI模型调用费600元+人工运营8小时/月×100元/小时=800元），自然流量提升340%对应新增销售额月均8-12万元 | 合规轨：完全合规，采用官方API接口数据，符合《跨境电商数据安全管理办法》第三章规定，已获平台数据授权许可 | 风险轨：模型训练数据偏差导致预测准确度下降（概率25%）、竞品关键词突变识别延迟（概率20%）、跨境平台算法更新影响gap分析有效期（概率35%，需月度重新验证）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：发现 30-50 个高价值 Gap 词 → 3 个月后自然词库扩展 50%，年化自然流量增量 12-20 万元
实施难度：⭐⭐☆☆☆（依赖第三方工具导出数据，逻辑简单）
优先级：⭐⭐⭐⭐☆（竞品分析必做动作，新品和成熟品均适用）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（105 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Set

def compute_keyword_gap(
    self_keywords: Set[str],
    competitor_keywords: List[Set[str]]
) -> Set[str]:
    """计算关键词缺口：竞品有而自己没有"""
    all_comp_kw = set()
    for kw_set in competitor_keywords:
        all_comp_kw.update(kw_set)
    return all_comp_kw - self_keywords

def score_gap_keywords(
    gap_keywords: Set[str],
    competitor_keywords: List[Set[str]],
    keyword_meta: pd.DataFrame
) -> pd.DataFrame:
    """
    对缺口词评分
    keyword_meta 需包含列: keyword, monthly_volume, difficulty (0-1)
    """
    n_comps = len(competitor_keywords)
    rows = []
    
    meta_dict = keyword_meta.set_index("keyword").to_dict("index")
    
    for kw in gap_keywords:
        coverage = sum(1 for kw_set in competitor_keywords if kw in kw_set) / n_comps
        meta = meta_dict.get(kw, {"monthly_volume": 0, "difficulty": 0.8})
        volume_norm = min(meta["monthly_volume"] / 10000, 1.0)
        difficulty = meta["difficulty"]
        
        score = coverage * volume_norm * (1 - difficulty)
        rows.append({
            "keyword": kw,
            "coverage": round(coverage, 2),
            "monthly_volume": meta["monthly_volume"],
            "difficulty": difficulty,
            "gap_score": round(score, 4)
        })
    
    return pd.DataFrame(rows).sort_values("gap_score", ascending=False)

def classify_gap_actions(df: pd.DataFrame) -> pd.DataFrame:
    """将缺口词按优先级分类行动"""
    df = df.copy()
    def action(row):
        if row["gap_score"] > 0.05 and row["monthly_volume"] >= 5000:
            return "PRIORITY_CAMPAIGN"   # 独立 Campaign
        elif row["gap_score"] > 0.02 and row["monthly_volume"] >= 1000:
            return "BROAD_MATCH_TEST"    # Broad 测试
        elif row["monthly_volume"] >= 500:
            return "AUTO_CAMPAIGN"       # 放入 Auto
        else:
            return "MONITOR"            # 观察
    df["action"] = df.apply(action, axis=1)
    return df
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2006.04768。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：自家已覆盖关键词集合、3-5 个竞品 ASIN 的关键词列表（含排名与搜索量，卡页示例来自 Helium10 Cerebro 导出）、关键词元数据（月搜索量、难度）；粒度为 关键词 × ASIN。

**输出**：竞品有排名而自家未覆盖的 Gap 词清单、含覆盖度/搜索量/难度的 Gap Score 排序、按搜索量分档的投放动作建议（独立 Campaign / Broad 测试 / Auto / 观察）；供 Listing 优化与广告投放使用。

## 执行步骤

1. 导出自家与 3-5 个竞品的 Top 关键词列表（含排名与搜索量）
2. 用集合差算出竞品有排名而自家未覆盖的 Gap 词
3. 按竞品覆盖度、搜索量与难度计算 Gap Score 并排序
4. 对高价值 Gap 词分档给出动作（独立 Campaign / Broad 测试 / Auto / 观察）
5. 把 Gap 词补进 Listing 与广告结构，跟踪词库扩展与自然流量

## 边界与不做

- 数据不满足：拿不到竞品关键词与排名（无第三方工具导出）时缺口集合不成立，先解决数据源。
- 何时不用：要处理的是自家多个 SKU 互相抢词的内耗，用「关键词自相竞争检测」；要找的是不依赖竞品清单的高需求低竞争蓝海词，用「关键词需求缺口矩阵分析」。
- 能力边界：只做缺口识别与排序建议，不代改 Listing、不代建广告；卡页的覆盖率 45%→72%、年化增加自然流量价值 35 万元为案例口径。

## 技能关联

- **前置**：Skill-Long-Tail-Keyword-Mining.html、Skill-Long-Tail-Keyword-Mining、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Share-of-Voice.html、Skill-Search-Share-of-Voice、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Keyword-Rotation-Strategy.html、Skill-Seasonal-Keyword-Rotation-Strategy、Skill-Sponsored-Organic-Rank-Synergy.html、Skill-Sponsored-Organic-Rank-Synergy、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Query-Performance-Attribution.html、Skill-Search-Query-Performance-Attribution、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Competitor-Keyword-Gap-Analysis

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Competitor-Keyword-Gap-Analysis`