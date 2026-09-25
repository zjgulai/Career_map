---
name: "p2s-cross-platform-brand-search-volume"
title: "Cross-Platform Brand Search Volume — 品牌搜索量作为营销效果领先指标"
description: "触发词：品牌搜索量、早期信号、营销效果速判、搜索增量、投放预警。何时不用：要算活动整体时序增效用合成控制或时序因果技能，要评估达人层级的真实回报用 KOL 因果归因技能，本技能用品牌词搜索量做早期信号。安全边界：搜索量与平台后台数据须按平台条款与授权方式获取，不得用爬取方式获取受限数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-088"
l3_business: "品牌反馈"
l3_all: "品牌反馈 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/品牌反馈"
p2s_card_id: "Skill-Cross-Platform-Brand-Search-Volume"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用品牌搜索量做早期信号，24 小时内就能判断这波投放值不值得继续。"
user_try: "试试：监测这条视频发布后的品牌词搜索量，12 小时内给我是否加预算的判断。"
whenToUse: "想在新内容或活动上线一天内就判断效果、不等 7 天 ROAS 时用本技能；估活动整体时序增效用合成控制或时序因果技能，评估达人层级真实回报用 KOL 因果归因技能。"
workflow: "接入品牌搜索量与投放、GMV 数据 → 建立搜索量基线 → 对营销事件估计搜索增量 → 按 12-24 小时信号判定成败 → 据此加预算或止损"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Platform Brand Search Volume — 品牌搜索量作为营销效果领先指标

## ① 解决的问题

营销效果要等 7 天 ROAS 才知道——品牌搜索量作为领先指标在 24 小时内预示 GMV 变化，Bayesian Causal Impact 精确量化每次营销事件的增量搜索效应

## ② 核心算法逻辑

传统营销效果测量有一个滞后问题：花了广告费，要 730 天后才能在 GMV 里看到效果。但品牌词搜索量（Brand Search Volume, BSV）会在 2448 小时内响应营销动作——当一波 TikTok 视频爆火时，Google Trends 会在当天就显示"Momcozy"搜索量飙升，而 Amazon 销量可能 35 天后才体现。

## ③ 业务应用场景

业务问题：发布了一条 TikTok 视频，想知道 24 小时内是否成功，而不是等 7 天 ROAS 出来。
BSV 实时监测： - 视频发布后每 4 小时监测一次 Amazon Brand Analytics 的品牌词搜索量 - 发布后 12 小时 BSV 上升 35% → 视频成功，立即增加广告预算 - 发布后 12 小时 BSV 无变化 → 视频失败，停止投放避免浪费
价值：把营销反馈周期从 7 天压缩到 12-24 小时，快速迭代内容策略

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
快速营销反馈：把决策周期从 7 天压缩到 24 小时，每个内容周期多节省无效投放 $500-2000
识别品牌建设 vs 促销效果：避免把促销效果误判为品牌效果，优化长期投资结构
BSV → GMV 领先预测：提前 7 天调整库存，减少缺货损失 ¥5-20 万/次大促
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（Google Trends 免费 API + Amazon Brand Analytics，2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（231 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/cross_platform_brand_search_volume` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Cross-Platform-Brand-Search-Volume.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Cross-Platform Brand Search Volume — 品牌搜索量监测与因果效应分析
基于 Prophet (arXiv:1707.03264) + Causal Impact (arXiv:1409.3119) 原理

依赖: numpy, statistics, dataclasses (标准库)
生产环境: 替换 MockBSVData 为 Google Trends API + Amazon Brand Analytics API
"""

from dataclasses import dataclass, field
import numpy as np
from statistics import mean, stdev


@dataclass
class BSVDataPoint:
    """品牌搜索量数据点"""
    date: str
    google_bsv: int             # Google Trends 相对值（0-100）
    amazon_bsv: int             # Amazon Brand Analytics 搜索量
    tiktok_bsv: int             # TikTok 站内搜索量（若有）
    ad_spend: float             # 当日广告花费
    gmv: float                  # 当日 GMV
    has_marketing_event: bool = False  # 是否有营销事件（KOL发帖/大促）


@dataclass
class BSVAnalysisResult:
    """BSV 分析结果"""
    period: str
    avg_bsv_google: float
    avg_bsv_amazon: float
    bsv_growth_wow: float       # 周同比增长率
    bsv_gmv_correlation: float  # BSV → GMV 相关性
    lead_lag_days: int          # BSV 领先 GMV 的天数
    causal_lift_pct: float      # 营销事件带来的增量 BSV %
    recommendation: str


class BrandSearchVolumeTracker:
    """
    品牌搜索量追踪与分析器

    核心功能：
    1. 跨平台 BSV 趋势监测
    2. BSV → GMV 领先指标验证
    3. 营销事件的 Causal Impact 估计
    4. 季节性分解（Prophet 简化版）
    """

    def normalize_bsv(self, values: list) -> list:
        """将 BSV 标准化为 0-100 的相对指数"""
        max_v = max(values) if values else 1
        return [round(v / max_v * 100, 1) for v in values]

    def compute_lead_lag(self, bsv_series: list, gmv_series: list,
                         max_lag: int = 14) -> int:
        """计算 BSV 领先 GMV 的天数（互相关）"""
        if len(bsv_series) < max_lag + 5:
            return 7  # 默认7天
        best_corr, best_lag = -1, 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1409.3119，但该号在 arXiv 上是《pde2path - version 2.0: faster FEM, multi-parameter continuation, nonlinear boundary conditions, and periodic domains - a short manual》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：品牌搜索量序列（Google Trends 相对值、Amazon Brand Analytics 搜索量、可选站内搜索量）以及同期的广告花费、GMV 与是否发生营销事件的标记。

**输出**：品牌搜索量的增量效应估计与领先滞后关系、发布后 12 至 24 小时的成败判定信号（如搜索量上升 35% 则继续加投、无变化则止损），以及库存调整建议；卡页口径年化综合 ROI 30-100 万元。

## 执行步骤

1. 接入品牌搜索量、广告花费与 GMV 数据。
2. 建立营销事件前的搜索量基线与正常波动区间。
3. 对营销事件估计搜索量的因果增量与领先滞后天数。
4. 按发布后 12 至 24 小时的信号判定继续加投或止损。
5. 用搜索量到 GMV 的领先关系提前调整备货。

## 边界与不做

- 拿不到品牌搜索量数据（平台未开通或量级未达门槛）时不要用，缺少领先指标只能等 GMV 反馈。
- 能力边界：搜索量是领先信号而非结果本身，搜索上升不等于成交；卡页的决策提速与 ROI 区间为估算口径。
- 合规红线：搜索量与后台数据须按平台条款与授权方式获取，不得用爬取方式获取受限数据。

## 技能关联

- **前置**：Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-MMM-Budget-PL-Alignment.html、Skill-MMM-Budget-PL-Alignment、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **延伸**：Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-MMM-Budget-PL-Alignment.html、Skill-MMM-Budget-PL-Alignment、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **可组合**：Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Cross-Platform-Brand-Search-Volume

---

> 分类：业务运营/品牌与增长/品牌反馈　·　技术族：15-营销投放分析　·　源卡：`Skill-Cross-Platform-Brand-Search-Volume`