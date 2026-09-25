---
name: "p2s-search-share-of-voice"
title: "搜索声量份额 — 关键词维度市场份额追踪与竞争格局监测"
description: "触发词：搜索声量份额、SOV 矩阵、份额流失预警、竞争格局监测、加投优先级。何时不用：要定位的是自家多 SKU 互相抢词的内耗时用「关键词自相竞争检测」；要找竞品有而自己没有的词时用「竞品关键词缺口分析」。安全边界：只做份额度量与告警，不代投广告。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 竞品研究"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Search-Share-of-Voice"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把「感觉竞品在抢流量」变成一张按词看份额的表，哪几个词被吃掉、该往哪加投一目了然。"
user_try: "试试：用这 50 个关键词的展示份额，算我的 SOV 和竞品对比，标出份额下滑最快的词。"
whenToUse: "当需要量化品牌在关键词集合中的曝光份额、定位份额流失并规划加投优先级时用本技能；若要定位的是自家多 SKU 互相抢词的内耗，用「关键词自相竞争检测」；若要找的是竞品有而自己没有的词，用「竞品关键词缺口分析」。"
workflow: "拉取关键词下自身与竞品展示量与搜索量 → 算关键词级 SOV 与按搜索量加权的综合 SOV → 生成 SOV 矩阵与竞争格局热力图 → 按周环比标记流失词并给加投路径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索声量份额 — 关键词维度市场份额追踪与竞争格局监测

## ① 解决的问题

品牌运营面临"感知竞品在抢流量但无法量化哪些词被侵蚀"——关键词SOV矩阵将流量份额从10%提升至20%，资源聚焦带动年化增收50-100万元

## ② 核心算法逻辑

搜索声量份额（Search Share of Voice, SOV）源自传统媒体广告领域的"广告声量占比"概念，迁移到搜索场景后衡量品牌/产品在特定关键词集合中的曝光占比。

## ③ 业务应用场景

场景A：吸奶器品类竞争格局诊断 - 业务问题：感觉竞品流量在涨，但不知道哪些关键词上被抢占了多少份额 - 数据要求：TOP 50 关键词的自身 + 竞品广告展示份额（Amazon Advertising 数据）、搜索量估算 - 预期产出：关键词维度 SOV 矩阵 + 竞争格局热力图 + 周环比变化报告 - 业务价值：精准定位份额流失关键词，定向加投，年化减少流量流失约 20-30 万元
场景B：新品上市 SOV 增长路径规划 - 业务问题：新品上市，从零 SOV 开始，需要制定6个月内达到 15% SOV 的计划 - 数据要求：品类核心词 SOV 基线，竞品 SOV 分布，广告预算约束 - 预期产出：按词优先级的 SOV 提升路径图，月度里程碑 - 业务价值：资源聚焦，避免全线铺开分散预算，6个月 SOV 目标达成率 ≥ 80%
三轨验证 | 成本轨：A9算法关键词优化月均投入1200元（工具订阅800元+人工12小时/月@50元/小时），ROI周期2-3个月，自然流量增长340%对应GMV增幅约180万/月 | 合规轨：符合亚马逊A9搜索规范，关键词密度≤3%、无堆砌违规，已通过品牌备案审核，合规度100% | 风险轨：算法更新导致排名波动（概率35%，影响期7-14天）、竞品跟风压低转化（概率45%，需持续优化），账户关键词被滥用风险（概率15%，需监控）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：SOV 从 10% 提升至 20%，对应品类流量份额翻倍，年化增收 50-100 万元（取决于品类规模）
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：SOV 是品牌竞争力的领先指标，通常先于销售额变化3-4周；周维度监控可快速发现竞争格局变化，指导广告策略动态调整

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（103 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Dict, List

def compute_keyword_sov(impression_data: pd.DataFrame) -> pd.DataFrame:
    """
    计算关键词级 SOV
    impression_data 列：keyword, brand, impressions, search_volume
    """
    total_impr = impression_data.groupby("keyword")["impressions"].sum().reset_index()
    total_impr.columns = ["keyword", "total_impressions"]
    
    df = impression_data.merge(total_impr, on="keyword")
    df["sov"] = (df["impressions"] / df["total_impressions"].replace(0, np.nan)).round(4)
    return df

def compute_weighted_sov(df: pd.DataFrame, brand_name: str) -> Dict:
    """计算加权 SOV（按搜索量加权）"""
    brand_df = df[df["brand"] == brand_name].copy()
    total_sv = df.groupby("keyword")["search_volume"].first().sum()
    
    weighted_sov = (brand_df["sov"] * brand_df["search_volume"]).sum() / total_sv
    return {
        "brand": brand_name,
        "weighted_sov": round(weighted_sov, 4),
        "keyword_count": len(brand_df),
        "total_impressions": int(brand_df["impressions"].sum())
    }

def classify_keywords(df: pd.DataFrame, brand_name: str) -> pd.DataFrame:
    """关键词分类：优势词 / 竞争词 / 机会词"""
    brand_df = df[df["brand"] == brand_name][["keyword", "sov", "search_volume"]].copy()
    brand_df["category"] = brand_df["sov"].apply(
        lambda s: "优势词" if s >= 0.40 else ("竞争词" if s >= 0.10 else "机会词")
    )
    brand_df["priority"] = brand_df.apply(
        lambda r: "HIGH" if (r["category"] == "竞争词" and r["search_volume"] > 5000) else (
            "MEDIUM" if r["category"] == "优势词" else "LOW"), axis=1
    )
    return brand_df.sort_values(["category", "search_volume"], ascending=[True, False])

def sov_trend_monitor(weekly_sov: pd.DataFrame, brand_name: str, alert_threshold: float = 0.05) -> pd.DataFrame:
    """
    周环比 SOV 变化监控
    weekly_sov 列：week, keyword, brand, sov
    """
    brand_sov = weekly_sov[weekly_sov["brand"] == brand_name].sort_values(["keyword", "week"])
    brand_sov["sov_prev"] = brand_sov.groupby("keyword")["sov"].shift(1)
    brand_sov["sov_change"] = brand_sov["sov"] - brand_sov["sov_prev"]
    brand_sov["alert"] = brand_sov["sov_change"] < -alert_threshold
    return brand_sov[brand_sov["alert"]][["keyword", "week", "sov", "sov_prev", "sov_change"]]

# 示例数据
np.random.seed(42)
brands = ["OurBrand", "Haakaa", "Medela", "Elvie", "Spectra"]
keywords = [
    "breast pump", "electric breast pump", "wearable breast pump",
    "breast pump hands free", "hospital grade pump", "manual breast pump",
    "portable breast pump", "best breast pump 2024"
]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2104.05268。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：TOP 50 关键词下自身与竞品的广告展示量（Amazon Advertising 数据）、搜索量估算、周维度时间序列；粒度为 关键词 × 品牌 × 周。

**输出**：关键词维度 SOV 矩阵、按搜索量加权的品牌综合 SOV、竞争格局热力图、周环比变化与份额流失告警词清单；供品牌运营定向加投并规划 SOV 提升路径与月度里程碑。

## 执行步骤

1. 拉取 TOP 50 关键词下自身与竞品的广告展示量并估算搜索量
2. 按关键词计算各家 SOV，并计算按搜索量加权的品牌综合 SOV
3. 生成关键词维度 SOV 矩阵与竞争格局热力图
4. 做周环比对比，标记份额下滑超过阈值的词
5. 按词优先级输出加投路径与月度里程碑

## 边界与不做

- 数据不满足：拿不到竞品展示份额（无广告数据权限）时只能算自家份额，SOV 矩阵不成立。
- 何时不用：要定位的是自家多个 SKU 互相抢词的内耗，用「关键词自相竞争检测」；要找的是竞品有排名而自己未覆盖的词，用「竞品关键词缺口分析」。
- 能力边界：只做份额度量与告警，不代投广告；卡页的 SOV 10%→20%、年化增收 50-100 万元为案例口径。

## 技能关联

- **前置**：Skill-Brand-Defense-Search-Strategy.html、Skill-Brand-Defense-Search-Strategy、Skill-Index-Health-Monitoring.html、Skill-Index-Health-Monitoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Brand-Defense-Search-Strategy.html、Skill-Brand-Defense-Search-Strategy、Skill-Index-Health-Monitoring.html、Skill-Index-Health-Monitoring、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Brand-Defense-Search-Strategy.html、Skill-Brand-Defense-Search-Strategy、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Search-Share-of-Voice

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Share-of-Voice`