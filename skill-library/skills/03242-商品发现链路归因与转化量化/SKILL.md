---
name: "p2s-instagram-reels-commerce-attribution"
title: "Instagram Reels Commerce Attribution — Reels 商品发现链路归因与转化量化"
description: "触发词：Reels归因、跨平台链路、多触点归因、内容ROAS、UTM追踪。何时不用：需要严格因果增量而非归因拆分时用Geo Holdout或归因去偏类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Instagram-Reels-Commerce-Attribution"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "打通从 Reels 视频到平台下单的链路，算出每条内容的 ROAS，告诉你哪类视频值得加投、哪类该停。"
user_try: "试试：我每月花 3000 美元做 Reels，帮我算出每条视频带来的 Amazon 销售和 ROAS。"
whenToUse: "当内容渠道投入清晰但站外到站内链路是黑盒、需要按单条内容算归因 GMV 与 ROAS 时用；若要严格测量投与不投的增量差异，用「Geo Holdout 实验」或广告归因去偏类技能。"
workflow: "给每条 Reels 配置独立 UTM 与带追踪的专属落地页 → 采集触点日志（浏览、标签点击、主页访问、链接点击）与完播率 → 在 7 天归因窗口内把购买事件按时间衰减权重归因到对应 Reels → 用归因 GMV 除以制作加推广成本算出每条内容 ROAS → 按内容类型汇总，调整内容与投放策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Instagram Reels Commerce Attribution — Reels 商品发现链路归因与转化量化

## ① 解决的问题

Instagram Reels 投入 $3000/月但 CFO 问不出 GMV 贡献——时间衰减多触点归因模型打通 Reels 商品标签→Amazon 购买的跨平台链路，将 ROAS 盲区变成可量化的 4.2x

## ② 核心算法逻辑

Instagram Reels 已成为母婴 DTC 品牌的重要发现渠道，但 Instagram → 产品标签点击 → 官网/Amazon 购买 这条链路的归因一直是黑盒。DV365 揭示了 Reels 推荐的底层逻辑：用稠密视频嵌入（Dense Video Embeddings）跨越推荐、检索、排序三个阶段，同一视频特征在全链路复用，这意味着视频内容质量直接决定整个商业转化链路的效率。

## ③ 业务应用场景

业务问题：团队每月在 Instagram 投入 $3,000 Reels 内容（制作 + 推广），但不清楚带来了多少 Amazon 销售，CFO 质疑这笔投入的价值。
归因方案： 1. 所有 Reels 使用独立 UTM 参数（`utm_source=instagram&utm_medium=reels&utm_content=VID-001`） 2. Reels 中的产品链接指向专属落地页（带 tracking） 3. 7 天归因窗口内的购买事件归因给对应 Reels 4. 计算每条 Reels 的 `归因 GMV / (制作成本 + 推广成本)`
典型发现：真实使用场景类视频 ROAS=4.2x；产品功能展示类 ROAS=1.8x → 内容策略调整

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
Reels 归因打通后停止低 ROAS 内容投放：月省 $1,000-3,000
发现高 ROAS 内容类型并扩大投放：月增 GMV ¥5-20 万
Reels → A10 协同效应量化：发现间接价值，争取更多内容预算
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（UTM 追踪 + 时间衰减模型，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（186 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/instagram_reels_commerce_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Instagram-Reels-Commerce-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Instagram Reels Commerce Attribution — 多触点归因链路量化
基于 DV365 (arXiv: 2506.00450) + Amazon MTA (arXiv: 2508.08209)

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np
from datetime import datetime, timedelta


@dataclass
class ReelsTouchpoint:
    """单个 Reels 触点"""
    reel_id: str
    user_id: str
    action: str             # view / tag_click / profile_visit / link_click
    timestamp: float        # Unix timestamp
    video_completion_rate: float = 0.0
    product_tag_id: str = ""


@dataclass
class PurchaseEvent:
    """购买事件"""
    order_id: str
    user_id: str
    sku_id: str
    amount: float
    timestamp: float
    channel: str            # instagram / amazon_organic / direct


@dataclass
class ReelsAttributionResult:
    """Reels 归因结果"""
    reel_id: str
    attributed_orders: int
    attributed_gmv: float
    attributed_gmv_7d: float    # 7天窗口
    attributed_gmv_28d: float   # 28天窗口
    roas: float
    content_cost: float


class TimeDecayAttributor:
    """
    时间衰减多触点归因模型
    基于 Amazon MTA 的 Transformer 注意力归因方法简化版
    """

    def __init__(self, half_life_hours: float = 72.0,
                 attribution_window_days: int = 7):
        self.half_life = half_life_hours
        self.window = attribution_window_days * 24 * 3600  # 转秒

    def decay_weight(self, hours_before_purchase: float) -> float:
        """指数衰减权重"""
        lam = np.log(2) / self.half_life
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2506.00450 — DV365: Extremely Long User History Modeling at Instagram
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：每条 Reels 的触点日志：reel_id、user_id、动作类型（view/tag_click/profile_visit/link_click）、时间戳、视频完播率、商品标签 id；外加购买事件与时间戳，以及每条内容的制作成本与推广成本以便计算 ROI。

**输出**：时间衰减多触点归因后的每条内容归因 GMV 与 ROAS（卡页示例：真实使用场景类 4.2x、产品功能展示类 1.8x），以及停投低 ROAS 内容、扩大高 ROAS 内容类型的策略建议。

## 执行步骤

1. 给每条 Reels 配置独立 UTM 参数与带追踪的专属落地页
2. 采集触点日志（浏览、标签点击、主页访问、链接点击）与完播率
3. 用时间衰减权重在 7 天窗口内归因购买事件到对应 Reels
4. 用归因 GMV 除以制作成本加推广成本，算出每条内容 ROAS
5. 按内容类型汇总结果，调整内容策略与投放预算

## 边界与不做

- 何时不用：没有独立 UTM 参数或站内购买事件无法回传时不要用；需要严格因果增量而非归因拆分时，改用 Geo Holdout 或去偏类技能。
- 能力边界：7 天归因窗口会漏掉窗口外的延迟购买，时间衰减权重也仍是近似；本技能只做归因与建议，不改变投放、不替代内容创意判断。
- 卡页数字（每月 3000 美元、4.2x 与 1.8x、年化 30-100 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Amazon-External-Traffic-Boost.html、Skill-Amazon-External-Traffic-Boost、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-Amazon-External-Traffic-Boost.html、Skill-Amazon-External-Traffic-Boost、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost
- **可组合**：Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Instagram-Reels-Commerce-Attribution

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：15-营销投放分析　·　源卡：`Skill-Instagram-Reels-Commerce-Attribution`