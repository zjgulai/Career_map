---
name: "p2s-search-signal-realtime-pipeline"
title: "A9 搜索信号实时采集 Pipeline — 排名变化与竞品动态的流式监控"
description: "触发词：搜索排名监控、排名崩塌预警、变化点检测、竞品动态、小时级监控。何时不用：需要按大促与社交热度动态调频采集时用市场信号实时采集技能；只做跨平台广告归因时用营销归因管道技能。安全边界：平台条款禁止自动化爬取，生产环境应优先使用官方接口或合规第三方数据服务。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 商品诊断"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Search-Signal-Realtime-Pipeline"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯着核心关键词的排名，掉出阈值几分钟内就告警，不用等两小时后才发现流量被抢。"
user_try: "试试：给我这 100 个核心关键词做排名崩塌监控，排名变化超过 5 位就报警，并画出竞品 BSR 趋势。"
whenToUse: "需要小时级监控关键词排名与竞品动态并即时告警时用本技能；需要按业务事件动态调整采集频率，用市场信号实时采集技能。"
workflow: "确定目标关键词与 ASIN 清单 → 用历史排名基线初始化变化点检测器 → 流式接入排名数据并更新检测器 → 累积漂移超过控制限即触发告警 → 输出竞品价格评分与排名的动态摘要"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# A9 搜索信号实时采集 Pipeline — 排名变化与竞品动态的流式监控

## ① 解决的问题

运营面临"竞品排名变化2小时后才能发现导致响应滞后"——搜索信号实时采集将关键词排名监控延迟从2小时降至5分钟，年化减少因排名丢失导致的流量损失20-35万元

## ② 核心算法逻辑

核心思想：Amazon A9 搜索排名是母婴跨境品类最核心的流量入口，但其信号（关键词排名、BSR、竞品价格/评分）的变化是实时发生的。本 Skill 构建一条完整的实时信号采集 Pipeline，融合「拉取式爬取（Polling）」与「事件驱动推送（EventDriven）」两种模式，将搜索排名变化延迟从 24 小时压缩至 515 分钟。

## ③ 业务应用场景

场景1：婴儿推车核心词排名崩塌实时预警 - 业务问题：竞品突然跑大量广告或操纵评论导致我方排名在数小时内跌出首页，若 24 小时后才发现，已损失数万元广告预算和自然流量 - 数据要求：目标关键词列表（50-200 个）、ASIN 列表、历史排名基线（近 30 天 P50/P95） - 预期产出：排名变化实时告警（微信/飞书），变化幅度超过 ±5 位即触发；竞品 BSR 变化趋势图（小时粒度） - 业务价值：及时响应排名崩塌平均缩短损失窗口 18-20 小时，年化保护流量价值 20-50 万元
场景2：大促前 72 小时竞品动态监控 - 业务问题：Prime Day 前竞品集中刷排名、降价、补评，若不实时掌握竞品动态，定价和广告策略将滞后 - 数据要求：竞品 ASIN 列表（Top 20）、价格历史、评分历史、库存状态 - 预期产出：竞品动态变化摘要（每小时推飞书），自动识别异常补评模式 - 业务价值：大促期间精准调价和广告出价，预计提升大促 GMV 5-10%
**三轨验证**： - 成本：爬虫服务器（2核4G）+ 代理 IP 池（约 2000 元/月），开发成本 3-5 人周 - 合规：Amazon ToS 禁止自动化爬取，需通过官方 SP-API 获取数据；第三方工具（Helium10/Jungle Scout）是合规替代方案 - 风险：高频爬取可能触发 Amazon 封号，建议生产环境优先使用 SP-API + 第三方数据服务

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：年化保护流量价值 20-50 万元（排名崩塌提前预警 + 大促期精准操盘）
实施难度：⭐⭐⭐⭐☆（需爬虫基础设施 + CUSUM 参数调优，合规方案额外增加复杂度）
优先级：⭐⭐⭐⭐⭐
评估依据：搜索流量是母婴 Amazon 卖家最大自然流量来源，排名实时监控是精细化运营的基础设施，ROI 确定性高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（135 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
A9 搜索信号实时采集 Pipeline — 排名变化检测与告警
（使用模拟数据演示核心算法，生产环境接 SP-API 或第三方数据源）
"""
import numpy as np
import pandas as pd
from collections import deque
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import time

np.random.seed(42)

@dataclass
class RankingSignal:
    """搜索排名信号"""
    keyword: str
    asin: str
    rank: int
    timestamp: float
    bsr: Optional[int] = None
    price: Optional[float] = None

@dataclass
class CUSUMDetector:
    """CUSUM 变化点检测器"""
    mu0: float          # 基准均值（历史 P50 排名）
    k: float = 2.0      # 允许漂移（2 位排名变化为正常波动）
    h: float = 8.0      # 控制限（累积漂移超过 8 触发告警）
    S_upper: float = field(default=0.0, init=False)  # 上升 CUSUM
    S_lower: float = field(default=0.0, init=False)  # 下降 CUSUM

    def update(self, x: float) -> Dict:
        """更新检测器，返回是否触发告警"""
        self.S_upper = max(0, self.S_upper + x - self.mu0 - self.k)
        self.S_lower = max(0, self.S_lower - x + self.mu0 - self.k)
        alert_up = self.S_upper > self.h    # 排名上升（数字变大=排名下降）
        alert_down = self.S_lower > self.h  # 排名下降（数字变小=排名上升）
        return {
            "alert": alert_up or alert_down,
            "direction": "rank_drop" if alert_up else ("rank_rise" if alert_down else "normal"),
            "S_upper": round(self.S_upper, 2),
            "S_lower": round(self.S_lower, 2)
        }

class SearchSignalPipeline:
    """搜索信号实时 Pipeline"""
    
    def __init__(self, keywords: List[str], asin: str):
        self.keywords = keywords
        self.asin = asin
        self.rank_history: Dict[str, deque] = {kw: deque(maxlen=48) for kw in keywords}
        self.detectors: Dict[str, CUSUMDetector] = {}
        self.alerts: List[Dict] = []
    
    def initialize_baseline(self, baseline_ranks: Dict[str, float]) -> None:
        """用历史基线初始化 CUSUM 检测器"""
        for kw, mu0 in baseline_ranks.items():
            self.detectors[kw] = CUSUMDetector(mu0=mu0)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标关键词列表（50 到 200 个）、ASIN 列表与近 30 天的历史排名基线（含 P50、P95 分位），以及竞品价格与评分历史，粒度到单个关键词排名与单个小时时间片。

**输出**：排名变化告警（变化幅度超过阈值即触发）、竞品 BSR 与价格的小时级趋势图、竞品动态摘要，供运营与定价团队即时响应。

## 执行步骤

1. 确定目标关键词、ASIN 与历史排名基线
2. 用历史分位初始化变化点检测器
3. 流式接入排名数据并持续更新检测器
4. 累积漂移超过控制限时触发告警
5. 汇总竞品价格、评分与排名变化输出动态摘要

## 边界与不做

- 没有历史排名基线时无法判断异常波动；关键词数量很少、波动本身很大的场景告警噪声高。
- 本技能只做信号采集与告警，不建议具体调价与广告出价方案，自动化采集的合规性由使用方负责。

## 技能关联

- **前置**：Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Market-Signal-Realtime-Collection.html、Skill-Market-Signal-Realtime-Collection、Skill-Realtime-Feature-Collection.html、Skill-Realtime-Feature-Collection、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Search-Compliance-Guard.html、Skill-Search-Compliance-Guard、Skill-Search-Driven-Logistics-Promise.html、Skill-Search-Driven-Logistics-Promise
- **延伸**：Skill-Keyword-Competition-Scoring.html、Skill-Keyword-Competition-Scoring、Skill-Realtime-Feature-Collection.html、Skill-Realtime-Feature-Collection、Skill-Search-Compliance-Guard.html、Skill-Search-Compliance-Guard、Skill-Search-Driven-Logistics-Promise.html、Skill-Search-Driven-Logistics-Promise
- **可组合**：Skill-Search-Compliance-Guard.html、Skill-Search-Compliance-Guard、Skill-Search-Driven-Logistics-Promise.html、Skill-Search-Driven-Logistics-Promise、Skill-Search-Signal-Realtime-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Signal-Realtime-Pipeline`