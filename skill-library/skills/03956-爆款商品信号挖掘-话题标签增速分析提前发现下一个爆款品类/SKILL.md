---
name: "p2s-tiktok-trending-product-signal"
title: "TikTok爆款商品信号挖掘 — 话题标签增速分析提前发现下一个爆款品类"
description: "触发词：话题增速、爆款信号、选品优先级、社媒选品。何时不用：缺少连续话题播放量数据时不用本卡；判断搜索与排名层面的品类趋势用趋势预测类技能。安全边界：需遵守平台 API 条款，不得爬取非公开数据；母婴品类数据不得含未成年人可识别信息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-021"
l3_business: "趋势监测"
l3_all: "趋势监测 / 市场机会评估"
l1_l2_l3: "业务运营/产品与创新/趋势监测"
p2s_card_id: "Skill-TikTok-Trending-Product-Signal"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用话题标签增速提前发现正在起量的爆款品类，让备货领先竞品几周。"
user_try: "试试：帮我监控这 100 个母婴话题标签，哪些已经够得上爆款信号阈值。"
whenToUse: "本卡属「趋势监测」。需要从社媒话题增速里发现具体爆款品类并排优先级时用本卡；判断搜索与 BSR 层面的品类趋势时用品类趋势预测类技能。"
workflow: "采集话题每日播放量 → 计算增速并筛阈值 → 归因到具体品类 → 按信号强度与利润率排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok爆款商品信号挖掘 — 话题标签增速分析提前发现下一个爆款品类

## ① 解决的问题

选品运营面临"总是比竞品晚2-4周发现TikTok爆款品类错过流量红利"——话题标签增速信号挖掘将爆款发现提前2-4周，首波流量红利年化GMV$4.8万

## ② 核心算法逻辑

TikTok 爆款商品提前发现基于话题标签（Hashtag）视图增速分析，通过监测 话题标签 的播放量时序增长率，在爆款真正大规模传播（视频万级转发）前 24 周识别早期信号。

## ③ 业务应用场景

- 业务问题：2024年 Q2，#StrawCup #LeakProofBabyBottle 话题在 TikTok 突然加速，品牌方未及时察觉，错过 Prime Day 爆款窗口，竞品抢先备货享受 3 倍销量红利 - 数据要求：目标话题标签列表（50-200个）+ 每日播放量时序数据（mock演示）；母婴相关品类关键词映射表 - 预期产出： - 爆款信号话题清单（触发阈值的TOP20） - 话题→品类归因标签（如 #SiliconeNipple → 婴儿硅胶奶嘴） - 选品优先级排序（信号强度 × 品类利润率） - 业务价值：提前 3 周捕获爆款信号，备货充足率从 60% 提升至 90%，Pr
三轨验证： - 成本：TikTok Research API 订阅费约 $500/月 + 第三方数据平台（Kalodata）$200/月 + 1名数据分析师每周2小时（约 $400/月），合计约 $1,100/月 - 合规：需遵守 TikTok API 使用条款，不得爬取非公开数据；母婴品类涉及儿童隐私，需确保话题数据不包含未成年人可识别信息；Amazon 政策允许外部趋势分析，但不得直接引用竞品品牌名 - 风险：信号误报导致过度备货（历史误报率约15%）；竞品同步监测导致信号窗口缩短；若话题涉及虚假宣传或侵权内容，品牌关联可能引发平台审查
- 业务问题：每年11月 Black Friday 前，需预判哪些母婴商品会成为爆款，提前 8 周锁定供应商 - 数据要求：历史同期话题数据 + 当年话题增速数据 - 预期产出：结合历史季节性的话题增速预测，减少滞销库存备货 - 业务价值：库存周转率提升 20%，滞销品占比降低 15%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前 2-4 周捕获爆款信号，备货充足率从 60% → 90%
单个爆款品类 Prime Day 期间 GMV 增量 $3-6 万
年度爆款品类 2-3 个，年化 GMV 红利 $4.8 万（保守）
系统运维成本约 $1,500/年（TikTok 数据采集）
实施难度：⭐⭐⭐☆☆（数据采集是主要挑战，算法逻辑简单；需解决 TikTok API 访问合规问题）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/marketing/tiktok_trending_product_signal` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-TikTok-Trending-Product-Signal.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok 爆款商品信号挖掘系统
基于话题标签增速分析 + 品类关键词聚类
使用 mock 时序数据模拟真实 TikTok 增长曲线
"""
import numpy as np
import math
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple


# ────── Mock 数据生成 ──────

def generate_mock_hashtag_series(
    name: str,
    days: int = 30,
    trend: str = "viral",
    base_views: float = 5e6,
    seed: int = None,
) -> Dict:
    """
    生成模拟话题播放量时序
    trend: 'viral'（爆款）/ 'stable'（稳定）/ 'declining'（衰退）
    """
    rng = np.random.default_rng(seed)
    views = np.zeros(days)
    views[0] = base_views
    
    for d in range(1, days):
        if trend == "viral":
            # 指数增长 + 噪声
            growth = rng.uniform(0.15, 0.35) if d > 15 else rng.uniform(0.02, 0.08)
        elif trend == "stable":
            growth = rng.uniform(-0.02, 0.04)
        else:  # declining
            growth = rng.uniform(-0.08, -0.01)
        
        views[d] = views[d - 1] * (1 + growth)
    
    return {
        "hashtag": name,
        "views_series": views.tolist(),
        "base_views": base_views,
    }


# ────── 增速分析引擎 ──────

@dataclass
class TrendSignal:
    hashtag: str
    current_views: float
    growth_rate_7d: float        # 7日增长率（%）
    acceleration: float          # 增速加速度
    signal_strength: float       # 综合信号强度 [0,1]
    category: str                # 归因品类
    triggered: bool
    trigger_day: Optional[int] = None
    
    def display(self) -> str:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.11934，但该号在 arXiv 上是《Team QUST at SemEval-2024 Task 8: A Comprehensive Study of Monolingual and Multilingual Approaches for Detecting AI-generated Text》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标话题标签列表与每日播放量时序数据，以及母婴相关品类关键词映射表。

**输出**：触发阈值的爆款信号话题清单、话题到品类的归因标签、按信号强度与利润率排序的选品优先级，供备货与内容团队使用。

## 执行步骤

1. 确定目标话题标签清单并采集每日播放量
2. 计算增速并筛出触发阈值的 TOP 话题
3. 将话题归因到具体品类
4. 按信号强度与品类利润率排出选品优先级
5. 输出备货与内容选题建议

## 边界与不做

- 缺少连续话题播放量数据时不用本卡
- 本卡产出信号清单与优先级，不负责供应商锁产能与投放排期
- 需遵守平台 API 条款，不得爬取非公开数据，母婴品类数据不得含未成年人可识别信息

## 技能关联

- **前置**：Skill-Demand-Forecast-Causal-Model、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **延伸**：Skill-Demand-Forecast-Causal-Model、Skill-VOC-Trend-Signal-Forecasting.html、Skill-VOC-Trend-Signal-Forecasting
- **可组合**：Skill-Demand-Forecast-Causal-Model、Skill-TikTok-Trending-Product-Signal

---

> 分类：业务运营/产品与创新/趋势监测　·　技术族：15-营销投放分析　·　源卡：`Skill-TikTok-Trending-Product-Signal`