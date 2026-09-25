---
name: "p2s-amazon-external-traffic-boost"
title: "Amazon External Traffic Boost — 站外流量对 A10 排名速度的提升效应建模"
description: "触发词：站外流量、TikTok 引流、排名提速、UTM 追踪、转化权重。何时不用：Listing 因子诊断用「Amazon A10 排名建模」；本技能只量化站外转化对自然排名的加速效应。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 投放诊断"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Amazon-External-Traffic-Boost"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "看清站外内容带来的转化到底给自然排名加了多少速，哪天该加码、哪天该停。"
user_try: "试试：这条 TikTok 视频带来 180 个购买，帮我算它对关键词排名的提速效应。"
whenToUse: "当要用站外内容推动 Amazon 自然排名、需要归因与每日目标量时用；站内广告与 Listing 因子体检不在本技能。"
workflow: "发布前记录目标关键词的自然排名基准 → 在站外内容链接中埋 UTM 追踪外部流量 → 每日记录排名变化与外部转化量 → 用提速模型预测排名变化并调整目标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Amazon External Traffic Boost — 站外流量对 A10 排名速度的提升效应建模

## ① 解决的问题

新品上架 90 天仍靠昂贵 PPC 维持排名——A10 Velocity 模型揭示 TikTok 外部转化的权重是站内的 3.2×，每天 20 个外部转化可将关键词排名从第 15 位推升至第 7 位，自然流量增加 2-3×

## ② 核心算法逻辑

Amazon A10 算法的核心升级是大幅提高外部流量（OffAmazon Traffic）的排名权重。背后逻辑很简单：当 TikTok 用户看了视频后跑到 Amazon 搜索购买，说明这个产品有真实需求，Amazon 愿意给这类产品更好的自然排名——因为这为 Amazon 引入了新流量，而非仅在站内循环。

## ③ 业务应用场景

业务问题：发了一条 TikTok 视频（100K 播放），想知道它对 Amazon 排名有没有帮助，多久能看到效果，如何最大化 A10 权重。
追踪框架： 1. 视频发布时记录 Amazon 关键词当前自然排名（基准） 2. 在视频链接中放 Amazon 专属 UTM 链接追踪外部流量 3. 每天记录关键词排名变化 + 外部流量量 4. 通常 48-72 小时后看到排名上升
实测发现（母婴吸奶器案例）： - TikTok 视频引入 180 个 Amazon 购买（7天） - 关键词 "wearable breast pump" 排名：15 → 7（+8 位） - 7天后自然流量增加 230%（排名提升带来的飞轮效应）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
排名从第 15 → 第 7：自然流量增加 2-3×，等效减少 PPC 支出 $2,000-5,000/月
新品 90 天蜜月期外部流量加速：自然排名建立速度快 2-3×
TikTok Velocity 效应：同等内容投入带来额外 40-80% Amazon 自然排名提升
年化综合 ROI：¥60-200 万
实施难度：⭐⭐☆☆☆（UTM 追踪 + Velocity 计算，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（241 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/amazon_external_traffic_boost` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Amazon-External-Traffic-Boost.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Amazon External Traffic Boost — A10 排名速度模型
基于 Learning to Rank (arXiv:1704.08173) + A10 实测数据

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np
from collections import defaultdict


@dataclass
class ExternalTrafficEvent:
    """外部流量事件"""
    date: str
    source: str                 # tiktok / pinterest / youtube / instagram / google
    clicks: int
    conversions: int            # Amazon 购买转化
    platform_content_id: str = ""


@dataclass
class AmazonRankingSnapshot:
    """Amazon 排名快照"""
    date: str
    keyword: str
    natural_rank: int
    page_one: bool              # 是否在第一页（前48名）
    daily_organic_sessions: int


@dataclass
class VelocityBoostResult:
    """Velocity 提升估算结果"""
    keyword: str
    current_rank: int
    velocity_score: float
    predicted_rank_7d: int
    predicted_rank_30d: int
    top_traffic_source: str
    recommended_daily_target: int


class A10ExternalTrafficModel:
    """
    Amazon A10 外部流量排名速度模型

    基于逆向工程的 A10 行为 + Learning to Rank 弱监督方法
    """

    # 各平台 A10 权重倍数（实测数据）
    PLATFORM_WEIGHTS = {
        "tiktok":    3.2,
        "pinterest": 2.8,
        "youtube":   2.5,
        "instagram": 2.1,
        "google":    1.5,
        "facebook":  1.2,
        "direct":    1.0,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1704.08173，但该号在 arXiv 上是《Scalar products of Bethe vectors in the models with $\mathfrak{gl}(m|n)$ symmetry》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：外部流量事件（日期、来源、点击、转化、内容 ID）与排名快照（日期、关键词、自然排名、日自然流量），按天记录。

**输出**：提速评分、7 天与 30 天排名预测、最优流量来源与建议日目标转化量，供投放排期使用。

## 执行步骤

1. 发布前记录目标关键词的自然排名基准
2. 在站外内容链接中埋 UTM 追踪点击与转化
3. 每日记录排名变化与外部转化量
4. 按平台权重倍数计算提速评分
5. 按预测调整每日站外转化目标并复盘

## 边界与不做

- 何时不用：无法追踪外部转化来源或缺少排名基线时，提速效应无法归因
- 能力边界：只做效应建模与目标量建议，不执行站外内容投放，也不保证平台排名结果

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Instagram-Reels-Commerce-Attribution.html、Skill-Instagram-Reels-Commerce-Attribution、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-Cross-Platform-Brand-Search-Volume.html、Skill-Cross-Platform-Brand-Search-Volume、Skill-Instagram-Reels-Commerce-Attribution.html、Skill-Instagram-Reels-Commerce-Attribution、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **可组合**：Skill-Instagram-Reels-Commerce-Attribution.html、Skill-Instagram-Reels-Commerce-Attribution、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Amazon-External-Traffic-Boost

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：13-广告分析　·　源卡：`Skill-Amazon-External-Traffic-Boost`