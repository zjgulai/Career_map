---
name: "p2s-seasonal-keyword-rotation-strategy"
title: "Skill-Seasonal-Keyword-Rotation-Strategy — 季节性关键词轮换策略"
description: "触发词：季节性关键词轮换、旺季关键词布局、搜索峰值预判、STL分解、竞价节奏排期、旺季备货提前量。何时不用：要建模搜索趋势本身用「季节性搜索趋势建模」；要找竞品覆盖缺口用「竞品关键词缺口分析」；要清理无效搜索词用「搜索词否定优化」；要做广告预算全局分配用「ROAS预算优化」。安全边界：只输出峰值窗口与竞价增减建议，不代投广告、不改账户预算；关键词轮换须遵守平台搜索公平竞争规范与季节性词库政策，落地前按平台要求申报并人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Seasonal-Keyword-Rotation-Strategy"
p2s_src_domain: "25-搜索流量工程"
quality_tier: "preview"
user_summary: "按历史月搜索量做 STL 分解，提前识别旺季峰值窗口并排布关键词与竞价节奏，避免旺季临时冲量把竞价抬高、ACOS 失控。"
user_try: "试试：用婴儿礼品套装过去 2 年的月搜索量和历史 ACOS 做 STL 分解，找出峰值窗口，给出 9 月底到 12 月的关键词布局与竞价排期。"
whenToUse: "本卡属「搜索意图分析」，只做季节性峰值时机识别与关键词轮换排期。要预测搜索趋势本身的走势用「季节性搜索趋势建模（Skill-Seasonal-Search-Trend-Modeling）」；要找竞品覆盖而我未覆盖的词用「竞品关键词缺口分析（Skill-Competitor-Keyword-Gap-Analysis）」；要清理无效搜索词用「搜索词否定优化（Skill-Search-Term-Negative-Optimization）」；要做广告预算全局分配用「ROAS 预算优化（Skill-ROAS-Budget-Optimization）」；跨市场关键词直译问题改用「跨市场搜索关键词本地化（Skill-International-Search-Localization）」。"
workflow: "汇总过去 2 年月搜索量时序（Google Trends + Helium10 Trend）与历史 ACOS 数据 → 对月搜索量做 STL 分解，拆出趋势项、季节项与残差 → 计算季节性强度指数 F_S，判断该品类季节性是否显著 → 识别 Top-N 峰值月份，并推算提前 2 个月的布局起点月 → 按窗口输出 INCREASE_BID / REDUCE_BID 动作与竞价排期建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Seasonal-Keyword-Rotation-Strategy — 季节性关键词轮换策略

## ① 解决的问题

运营面临"节假日流量峰值前关键词布局不足"——峰值预判提前布局将Prime Day当天自然流量比平日高出4倍，年化多增GMV60万元

## ② 核心算法逻辑

季节性关键词轮换策略（Seasonal Keyword Rotation Strategy）将关键词的月搜索量时序视为STL 分解（SeasonalTrend decomposition using LOESS）问题，提前识别搜索峰值时机，在峰值前 24 周布局关键词和库存。

## ③ 业务应用场景

- 业务问题：婴儿礼品套装每年 11-12 月销量占全年 45%，但每年圣诞前才临时加大 PPC，竞价被抬高 3 倍，ACOS 超 60% - 数据要求：过去 2 年月搜索量数据（Google Trends + Helium10 Trend）、历史 ACOS 数据 - 执行方案： - STL 分解识别峰值窗口：10 月第 3 周 → 12 月第 2 周 - 9 月底：开始布局「christmas baby gift set」Exact Match，竞价 $1.5（低竞争期） - 11 月初：峰值确认，竞价提升至 $2.8，日预算 $200 - 12 月 15 日后：逐步削减，切换至「baby 
三轨验证 | 成本轨：月均成本1,200元（关键词数据库订阅300元+AI工具费600元+人工优化12小时/月×75元/小时=900元），首月建立成本额外3,000元 | 合规轨：符合《电商平台搜索公平竞争规范》，关键词轮换需遵守平台季节性词库政策，不涉及虚假宣传，合规度95%+ | 风险轨：关键词堆砌被判违规概率8%，季节词预测偏差导致流量下降15-20%概率12%，竞对跟风导致词竞争加剧概率35%
**三轨验证** | 成本轨：月均成本2,800元（专业SEO团队外包2,000元+高级数据分析工具800元+人工审核8小时/月=600元），年度投入33,600元，ROI预期4-6倍 | 合规轨：需获得平台搜索算法白名单认证，关键词轮换策略需提前30天向平台申报，符合A9算法更新周期（每季度更新），合规度98%+ | 风险轨：算法更新导致策略失效概率18%，季节性预测错误影响销售概率10%，竞对恶意举报概率5%，但可通过完整文档记录规避

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：旺季提前布局可将峰值期 ACOS 降低 20-30%，年化增量 GMV 8-15 万元/主力品
实施难度：⭐⭐⭐☆☆（需要历史数据支撑，建议提前 6 个月规划）
优先级：⭐⭐⭐⭐⭐（母婴品季节性极强，提前布局 vs 临时冲量差距巨大）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（122 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple

def stl_decompose_simple(
    series: np.ndarray,
    period: int = 12
) -> Dict[str, np.ndarray]:
    """
    简化 STL 分解（用滑动平均代替 LOESS）
    series: 月度搜索量时序（至少 24 个月）
    """
    n = len(series)
    if n < period * 2:
        raise ValueError(f"需要至少 {period * 2} 个月数据")
    
    # 趋势项（移动平均）
    half = period // 2
    trend = np.convolve(series, np.ones(period) / period, mode='same')
    trend[:half] = trend[half]
    trend[-half:] = trend[-half-1]
    
    # 季节项
    detrended = series - trend
    seasonal = np.zeros(n)
    for i in range(period):
        indices = list(range(i, n, period))
        seasonal[indices] = np.mean(detrended[indices])
    
    # 残差
    residual = series - trend - seasonal
    
    return {"trend": trend, "seasonal": seasonal, "residual": residual}

def compute_seasonal_strength(seasonal: np.ndarray, residual: np.ndarray) -> float:
    """季节性强度指数 F_S"""
    var_r = np.var(residual)
    var_sr = np.var(seasonal + residual)
    fs = max(0, 1 - var_r / var_sr) if var_sr > 0 else 0
    return round(float(fs), 4)

def identify_peak_windows(
    seasonal: np.ndarray,
    period: int = 12,
    top_n: int = 2
) -> List[Dict]:
    """识别季节峰值窗口（月份）"""
    seasonal_cycle = seasonal[:period]
    peak_months = np.argsort(seasonal_cycle)[::-1][:top_n]
    
    windows = []
    for month_idx in peak_months:
        month = month_idx + 1  # 1-indexed
        prep_start = (month_idx - 2) % 12 + 1  # 提前2个月准备
        windows.append({
            "peak_month": month,
            "prep_start_month": prep_start,
            "seasonal_strength": round(seasonal_cycle[month_idx], 2),
            "action": "INCREASE_BID" if seasonal_cycle[month_idx] > 0 else "REDUCE_BID"
        })
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2104.07700。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：输入为关键词的月度搜索量时序：来源 Google Trends + Helium10 Trend，实体粒度为单个关键词（Exact Match 词），时间粒度为月，序列长度至少 24 个月（代码模板 period=12，低于 24 个月直接抛出异常）；另需同期历史 ACOS 数据（按关键词或广告活动粒度）用于判断竞价动作。数据格式为数值型月度序列加关键词元数据，可读入 np.ndarray / DataFrame。

**输出**：产出 STL 三分解结果（trend / seasonal / residual 数组）、季节性强度指数 F_S（0-1，保留 4 位小数）与 Top-N 峰值窗口列表；每个窗口含 peak_month（峰值月）、prep_start_month（提前 2 个月的准备起点月）、seasonal_strength 与 action（INCREASE_BID / REDUCE_BID）。交付给投放与运营，用于排关键词布局、备货与竞价节奏。

## 执行步骤

1. 归集过去 2 年月搜索量时序与历史 ACOS 数据，按关键词对齐
2. 对月搜索量做 STL 分解，拆出趋势项、季节项与残差
3. 计算季节性强度指数 F_S，判断该品类季节性是否足够强
4. 识别 Top-N 峰值月份，并推算提前 2 个月的布局起点
5. 按窗口给出 INCREASE_BID / REDUCE_BID 动作与竞价排期建议

## 边界与不做

- 数据不满足：月搜索量序列不足 24 个月、或缺失同期历史 ACOS 时不要用，先补齐至少 2 年月度数据再跑 STL 分解。
- 何时不用：要预测搜索趋势本身用「季节性搜索趋势建模」；找竞品词缺口、做预算分配、清否定词分别改用「竞品关键词缺口分析」「ROAS 预算优化」「搜索词否定优化」。
- 能力边界：只输出峰值时机、季节性强度与竞价增减方向建议，不代投广告、不改账户预算，也不承诺增量；原文 4 倍流量峰值、ACOS 降 20-30%、年化增量 8-15 万元/主力品均为原案例口径，不是本技能保证值。
- 安全边界：关键词轮换需遵守平台搜索公平竞争规范与季节性词库政策，落地前按平台要求申报并由人工复核。

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-Seasonal-Search-Trend-Modeling.html、Skill-Seasonal-Search-Trend-Modeling、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Ad-Budget-ROI-Integration.html、Skill-Search-Ad-Budget-ROI-Integration、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Competitor-Keyword-Gap-Analysis.html、Skill-Competitor-Keyword-Gap-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Search-Term-Negative-Optimization.html、Skill-Search-Term-Negative-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Seasonal-Keyword-Rotation-Strategy

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Seasonal-Keyword-Rotation-Strategy`