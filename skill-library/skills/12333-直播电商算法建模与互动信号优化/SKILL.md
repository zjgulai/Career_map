---
name: "p2s-live-commerce-stream-algorithm"
title: "Live Commerce Stream Algorithm — 直播电商算法建模与互动信号优化"
description: "触发词：直播算法评分、开播前 15 分钟、大流量池、弹幕密度、加购率信号、直播商品排期。何时不用：要预测某场直播的转化结果用「Live Stream Conversion Predictor」，要提升短视频自然推荐量用「TikTok Algorithm Content Boost」；本技能只做直播间实时评分、瓶颈信号定位与开播策略建议。安全边界：只输出指标诊断与排期建议，不代播、不自动投放、不改平台参数，策略落地须由直播团队确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-069"
l3_business: "站点运营"
l3_all: "站点运营 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/站点运营"
p2s_card_id: "Skill-Live-Commerce-Stream-Algorithm"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "在开播最关键的 15 分钟里看清算法在给哪个信号打分、卡在哪一环，并照策略排布暖场、钩子与商品出场顺序。"
user_try: "试试：我这场 TikTok 直播开播前 15 分钟在线人数增速很慢、加购率也低，帮我算一下各信号得分和瓶颈，再给出这几分钟具体该做什么。"
whenToUse: "有平台直播实时指标（在线人数、增速、GMV/UV、弹幕率、加购率）与商品售价成本，需要判断直播间处在哪个流量阶段、瓶颈信号是什么，并给出开播 15 分钟动作与商品排期时用；要预测单场直播转化结果用「Live Stream Conversion Predictor」，要提升短视频推荐量用「TikTok Algorithm Content Boost」。"
workflow: "采集直播实时指标（在线人数、增速、GMV/UV、弹幕率、加购率等） → 按平台权重把各信号加权成直播间算法总分与流量阶段 → 定位瓶颈信号并产出对应动作项 → 按钩子力与利润率把商品排到冷启／峰值／尾部时段 → 对照前 15 分钟 GMV/UV 与弹幕率目标给出暖场到钩子的节奏建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Live Commerce Stream Algorithm — 直播电商算法建模与互动信号优化

## ① 解决的问题

直播开播前 15 分钟是算法分流关键期，团队不知道该做什么来提升在线人数增速和加购率进入大流量池——针对算法决定期的预热策略将平均在线人数峰值提升 3-5 倍，场均 GMV 从 1 万增至 3-8 万元

## ② 核心算法逻辑

直播电商的算法与短视频完全不同——短视频是"发布后被动被推荐"，直播是"实时竞争曝光池位置"。平台每秒重新计算所有在播直播间的排名，决定哪个直播间出现在用户的首屏。

## ③ 业务应用场景

业务问题：每次开播前 15 分钟是算法最重要的"决定期"——这期间的在线人数增速和加购率决定这场直播能否进入大流量池。但团队不知道应该在开播时做什么来提升这 15 分钟的表现。
算法导向的开播策略： 1. T-30min：在私域（粉丝群/粉丝页）预告直播开始时间 2. T-0 到 T+3min：不卖货，先做互动暖场（提升弹幕密度） 3. T+3 到 T+8min：抛出"秒杀钩子"（限时特价），触发加购和购买 4. T+8 到 T+15min：加购率信号传递给算法，平台开始放大流量
关键指标目标：前 15 分钟 GMV/UV ≥ $3，弹幕发送率 ≥ 8%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
前 15 分钟策略优化 → 进入扩大流量池：直播 GMV 从 $2,000 → $8,000（4×）
商品排期优化：峰值流量期出利润品，GMV 提升 20-30%
算法评分实时监控：及时发现问题并干预，减少"白播"场次
年化综合 ROI：¥100-500 万（视直播频率和品牌规模）
实施难度：⭐⭐☆☆☆（算法评分纯指标计算，数据来源 TikTok Analytics，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（244 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/live_commerce_stream_algorithm` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Live-Commerce-Stream-Algorithm.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Live Commerce Stream Algorithm — 直播间算法评分与策略优化
基于 OneRetrieval (arXiv: 2606.13533) + TikTok Live 算法逆向工程

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np


@dataclass
class LiveStreamMetrics:
    """直播间实时指标"""
    stream_id: str
    platform: str               # tiktok / amazon_live / douyin
    elapsed_minutes: float      # 已直播分钟数
    current_viewers: int        # 当前在线人数
    peak_viewers: int           # 峰值人数
    viewer_growth_rate: float   # 在线人数增速（每分钟净增）
    gmv_per_viewer: float       # GMV/UV（最重要的商业化指标）
    comment_rate: float         # 弹幕发送率（评论数/在线人数/分钟）
    add_to_cart_rate: float     # 加购率
    gift_count_per_min: float   # 礼物数/分钟
    follower_ratio: float       # 粉丝占在线比例


@dataclass
class LiveRankingScore:
    """直播间算法评分"""
    stream_id: str
    total_score: float
    signal_breakdown: dict
    traffic_stage: str          # cold / testing / expanding / top
    estimated_next_viewers: int
    bottleneck_signal: str
    action_items: list


@dataclass
class ProductSchedule:
    """直播商品排期建议"""
    product_id: str
    product_name: str
    selling_price: float
    cost: float
    hook_power: float           # 钩子力（吸引力）：0-1
    profit_margin: float
    recommended_slot: str       # cold_start / peak / tail


class LiveStreamScorer:
    """
    直播间算法评分器

    基于 TikTok Shop 2026 逆向工程 + OneRetrieval 架构原理
    """

    # 平台权重配置
    PLATFORM_WEIGHTS = {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2606.13533，但该号在 arXiv 上是《OneRetrieval: Unifying Multi-Branch E-commerce Retrieval with an Editable Generative Model》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：直播中场粒度（需按分钟刷新）：stream_id、platform（tiktok／amazon_live／douyin）、已直播分钟数、当前与峰值在线人数、在线人数增速、GMV/UV、弹幕发送率、加购率、每分钟礼物数、粉丝占在线比例；商品侧要 product_id、售价、成本、钩子力与利润率。数据须来自平台直播分析接口并按分钟采集，否则判断不了前 15 分钟的决定期。

**输出**：直播间级产出：算法总分与各信号分解、流量阶段（cold／testing／expanding／top）、预估下一阶段在线人数、瓶颈信号与动作项清单，以及每个商品的推荐时段（cold_start／peak／tail）；供直播运营在开播期即时调整节奏与商品排期使用。

## 执行步骤

1. 按分钟采集直播间实时指标与商品侧售价、成本、钩子力
2. 用平台权重把在线增速、GMV/UV、弹幕率、加购率等信号加权成算法总分
3. 判定当前流量阶段、定位瓶颈信号并产出对应动作项
4. 按钩子力与利润率把商品排入冷启、峰值、尾部时段
5. 对照 GMV/UV 与弹幕率目标给出开播前 15 分钟优化建议

## 边界与不做

- 数据不满足：缺分钟级在线人数、GMV/UV、弹幕率或加购率时不要用——先接入平台直播分析接口，否则算不出信号分解与阶段判断。
- 何时不用：要预测单场直播的转化与 GMV 结果用「Live Stream Conversion Predictor」，要提升短视频自然推荐量用「TikTok Algorithm Content Boost」，要做虚拟主播形象克隆用「Multilingual Live Virtual Anchor Clone」。
- 能力边界：只做实时指标评分、瓶颈定位与排期建议，不代播、不自动投放、不改平台参数；卡页口径（在线峰值提升 3-5 倍、场均 GMV 从 1 万增至 3-8 万元、年化 ¥100-500 万）为估算，落地须用本店实际数据重算。
- 安全边界：限时特价与秒杀钩子的力度、库存与承诺须由直播团队人工确认后执行，模型不直接改价或投放；弹幕与互动数据须来自平台合规接口并遵守目标市场促销与消费者的合规要求。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-Live-Stream-Conversion-Predictor.html、Skill-Live-Stream-Conversion-Predictor、Skill-Multilingual-Live-Virtual-Anchor-Clone.html、Skill-Multilingual-Live-Virtual-Anchor-Clone、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-Live-Stream-Conversion-Predictor.html、Skill-Live-Stream-Conversion-Predictor、Skill-Multilingual-Live-Virtual-Anchor-Clone.html、Skill-Multilingual-Live-Virtual-Anchor-Clone、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **可组合**：Skill-Live-Stream-Conversion-Predictor.html、Skill-Live-Stream-Conversion-Predictor、Skill-Multilingual-Live-Virtual-Anchor-Clone.html、Skill-Multilingual-Live-Virtual-Anchor-Clone、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-Live-Commerce-Stream-Algorithm

---

> 分类：业务运营/渠道经营/站点运营　·　技术族：20-AI视频生成　·　源卡：`Skill-Live-Commerce-Stream-Algorithm`