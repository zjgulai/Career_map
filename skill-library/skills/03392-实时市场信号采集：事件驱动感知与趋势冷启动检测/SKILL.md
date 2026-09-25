---
name: "p2s-market-signal-realtime-collection"
title: "Market Signal Realtime Collection — 实时市场信号采集：事件驱动感知与趋势冷启动检测"
description: "触发词：实时市场信号、事件驱动采集、趋势冷启动、频率自适应、社交热度。何时不用：只需按固定频率监控排名变化时用搜索信号实时采集技能；需要跨平台多模态内容融合时用多模态UGC融合技能。安全边界：抓取须遵守平台条款，社交平台数据使用须符合其接口条款与隐私政策。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 趋势监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Market-Signal-Realtime-Collection"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让采集频率跟着大促日历和社交热度自动变，平静期省调用、爆发期几分钟就抓一次。"
user_try: "试试：按促销日历和社交热度给我排一套自适应的竞品价格监控频率，大促当天加密到 5 分钟一次。"
whenToUse: "需要按业务事件与社交信号动态调整采集频率、抓住爆发信号时用本技能；只做固定关键词的排名监控，用搜索信号实时采集技能。"
workflow: "接入促销日历与历史价格时序 → 从社交内容计算参与强度与趋势分 → 按信号强度分档设定采集频率 → 对高分趋势启动专项抓取并通知 → 回看捕获率并调整分档阈值"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Market Signal Realtime Collection — 实时市场信号采集：事件驱动感知与趋势冷启动检测

## ① 解决的问题

策略经理面临市场信号滞后——Realtime Collection将监测延迟6小时压到20分钟，年化省18万元

## ② 核心算法逻辑

传统爬虫调度的核心盲区：不知道"现在"值不值得爬。

## ③ 业务应用场景

业务背景：黑五/大促期间，竞品价格调整频率从"每天 1-2 次"激增到"每小时 3-5 次"。固定调度爬虫每小时一次，会错过 60-70% 的价格变动事件，导致跟价决策滞后。
数据要求： - 促销日历（CSV 或内部系统接口） - 历史价格时序（至少 3 个月）
预期产出： - 价格变动捕获率从 ~35%（固定调度）提升至 ~85%（事件感知调度） - ROI：大促期间提前 2-4 小时发现竞品降价 → 早 2-4 小时跟价 → 预估多转化 3-8%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

`signal_strength >= 0.8` → 高频模式（5分钟/次），大促当天、黑五
`signal_strength 0.5-0.8` → 中频模式（15-30分钟/次），大促前 2-3 天
`signal_strength < 0.3` → 低频模式（120分钟/次），平静期
`trend_score >= 0.75` → 立即启动专项爬取 + 通知选品团队
`trend_score 0.5-0.75` → 加入观察列表，持续监控 3-7 天

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（498 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/data_collection/market_signal_realtime_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Market-Signal-Realtime-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Market Signal Realtime Collection
整合 EventCast（事件感知信号强度） + RTTP（趋势冷启动检测）
输出：驱动 Skill-Adaptive-Crawl-Scheduling 的动态信号
"""

import math
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple


# ── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class BusinessEvent:
    """业务事件（EventCast 的输入单元）"""
    date: str                    # YYYY-MM-DD
    event_type: str              # "大促" / "节假日" / "flash_sale"
    categories: List[str]        # 受影响品类
    intensity: str               # "high" / "medium" / "low"
    description: str = ""

    @property
    def intensity_score(self) -> float:
        return {"high": 1.0, "medium": 0.6, "low": 0.3}.get(self.intensity, 0.3)


@dataclass
class SocialPost:
    """社交媒体帖子（RTTP 的输入单元）"""
    post_id: str
    content: str
    platform: str           # "tiktok" / "reddit" / "xiaohongshu"
    author_authority: float = 0.5     # 0-1，作者历史母婴内容可信度
    comment_count: int = 0
    like_count: int = 0
    share_count: int = 0
    timestamp: str = ""

    @property
    def engagement_strength(self) -> float:
        """深度参与 > 浅层参与（评论/分享权重高于点赞）"""
        score = (self.comment_count * 3.0 + self.share_count * 2.0 + self.like_count * 0.5)
        # 对数归一化，防止超级帖子垄断
        return min(1.0, math.log1p(score) / math.log1p(10000))


@dataclass
class TrendSignal:
    """趋势信号输出"""
    query: str
    trend_score: float
    source_post_id: str
    detected_at: str
    category_hints: List[str] = field(default_factory=list)

    @property
    def is_alert(self) -> bool:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2601.17567，但该号在 arXiv 上是《Real-Time Trend Prediction via Continually-Aligned LLM Query Generation》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：促销日历（文件或内部系统接口）、至少 3 个月的历史价格时序、社交平台帖子（内容、平台、作者权威度、互动量、时间戳），粒度到单次价格变动与单条帖子。

**输出**：分档的采集频率方案与趋势信号（查询词、趋势分、来源帖子、发现时间）以及价格变动捕获率统计，供策略经理与选品团队使用。

## 执行步骤

1. 接入促销日历与历史价格时序
2. 从社交内容计算参与强度与趋势分
3. 按信号强度把采集切成高频、中频、低频档
4. 对高分趋势立即启动专项抓取并通知选品团队
5. 统计价格变动捕获率并调整阈值

## 边界与不做

- 没有促销日历或历史价格基线时无法判断信号强度；数据变化极慢的品类不必做频率自适应。
- 本技能负责信号采集与频率调度，不负责跟价与定价决策，也不保证社交信号的商业价值。

## 技能关联

- **前置**：Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **延伸**：Skill-Adaptive-Crawl-Scheduling.html、Skill-Adaptive-Crawl-Scheduling、Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling
- **可组合**：Skill-Adaptive-Crawl-Scheduling.html、Skill-Adaptive-Crawl-Scheduling、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection、Skill-Market-Signal-Realtime-Collection

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Market-Signal-Realtime-Collection`