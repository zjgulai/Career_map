---
name: "p2s-tiktok-content-lifecycle-analytics"
title: "TikTok内容生命周期分析 — 指数衰减建模与二次投流最佳时机"
description: "触发词：内容生命周期、指数衰减、二次投流、流量窗口、视频投流、播放量预测。何时不用：素材创意与脚本优化不走本卡；要在视频发布后用衰减曲线判断何时加投、是否出现二次传播时用本卡。安全边界：须遵守平台内容与投流规则，AI 生成内容须标注，母婴类医疗健康信息需具备相应资质。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 内容策划"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-TikTok-Content-Lifecycle-Analytics"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "盯住每条视频的衰减曲线，在二次传播信号出现时提醒加投，别错过流量窗口。"
user_try: "试试：这是我每条视频发布后的每日播放、点赞、评论数据，帮我拟合衰减曲线，标出应该二次投流的时机。"
whenToUse: "与投放诊断类出价卡相比：账户级出价与预算优化走那张卡；本条视频要不要追投、什么时候追投，用本卡的内容生命周期判断。"
workflow: "采集视频发布后每日播放、点赞、评论、收藏时序 → 用指数衰减模型拟合基线并识别二次上升异常信号 → 给每条视频打生命周期类型标签（快闪/长尾/双峰） → 按标签给出投流触发时间与预算上限建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok内容生命周期分析 — 指数衰减建模与二次投流最佳时机

## ① 解决的问题

内容运营面临"视频发出去不知道什么时候二次推流效果最好错过流量窗口"——指数衰减模型+二次上升信号识别将视频总播放量提升2.3倍，年化节省$3.6万

## ② 核心算法逻辑

TikTok 视频流量遵循指数衰减模式：发布后 2472 小时达到播放峰值，随后指数级衰退。但部分视频会出现二次上升（Second Wave）——外部触发（话题爆发、KOL引用、投流加持）导致衰退后重新加速。

## ③ 业务应用场景

- 业务问题：某品牌发布吸奶器开箱视频，首发72小时播放量 50万，后自然衰退。但第10天被一个育儿KOL引用，引发二次传播信号，品牌方未监测到错过二次加投，总播放量仅 80 万（潜力值 300 万+） - 数据要求： - 视频发布后每日播放量、点赞量、评论量、收藏量时序数据（mock演示） - 广告投流预算上限（控制二次投流金额） - 预期产出： - 每支视频的生命周期类型标签（快闪/长尾/双峰） - 投流触发时间建议（精确到小时） - 预期效果：总播放量提升 2.3 倍 - 业务价值：提升视频总播放量 2.3 倍，按 CPM $5 换算，年化节省等效流量采购费 $3.6 万（即用更少预算获
- 业务问题：Black Friday 前发布 20 条视频，如何分配有限的 $5,000 投流预算实现最大覆盖 - 数据要求：每条视频发布后48小时播放数据（Early Signal） - 预期产出：基于早期衰减系数排序，优先追投衰减慢（潜力大）的视频，放弃快闪型 - 业务价值：预算使用效率提升 40%，ROI 从 3:1 提升至 4.2:1
**三轨验证** | 成本轨：传统真人主播月均成本8000元（主播费6000+场景布景2000），虚拟主播方案月均成本1200元（AI生成工具订阅800+内容审核400），成本降低85%，人工投入从80小时/月降至12小时/月（仅审核和文案）| 合规轨：符合《网络直播内容管理规定》，虚拟主播需标注AI生成身份，母婴类需获得医疗健康信息发布资质，建议在直播间显著位置标注"AI虚拟主播"标签，合规依据：中国互联网协会AI内容标识指南+平台虚拟人政策 | 风险轨：用户信任度风险（概率35%）-虚拟主播可能降低母婴用户购买转化率；监管风险（概率20%）-平台对虚拟主播政策调整；技术风险（概率15%）-

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
视频总播放量提升 2.3 倍（快闪型经二次投流），等效流量价值 ≈ CPM $5 × 增量播放
按月均 15 条视频 × 增量 50 万播放/条估算，年化节省等效广告费 $3.6 万
投流预算节省（更精准触发）约 15-20%，$10万/年投流预算节省 $1.5-2 万
综合年化价值 $5-6 万，系统成本约 $2,000/年
实施难度：⭐⭐⭐☆☆（scipy 依赖轻量；难点是实时数据管道建设 + TikTok Ads API 自动触发）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（282 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/visual_content/tiktok_content_lifecycle_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-TikTok-Content-Lifecycle-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok 内容生命周期分析系统
指数衰减拟合 + 二次上升异常检测 + 投流时机推荐
使用 scipy curve_fit + numpy 实现
"""
import numpy as np
from scipy.optimize import curve_fit
from scipy.stats import zscore as scipy_zscore
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict


# ────── 衰减模型定义 ──────

def exponential_decay(t: np.ndarray, A: float, lam: float, C: float) -> np.ndarray:
    """指数衰减函数：V(t) = A * exp(-lambda * t) + C"""
    return A * np.exp(-lam * t) + C


@dataclass
class DecayFitResult:
    A: float         # 初始幅度
    lam: float       # 衰减系数
    C: float         # 基线播放量
    r_squared: float # 拟合优度
    
    @property
    def half_life_hours(self) -> float:
        """半衰期（小时）"""
        return math.log(2) / self.lam if self.lam > 0 else float("inf")
    
    @property
    def lifecycle_type(self) -> str:
        if self.lam > 0.08:
            return "快闪型"
        elif self.lam < 0.03:
            return "长尾型"
        else:
            return "标准型"


import math


def fit_decay(
    times: np.ndarray,
    views: np.ndarray,
    max_iter: int = 5000,
) -> Optional[DecayFitResult]:
    """拟合指数衰减参数"""
    try:
        # 初始猜测
        A0 = max(views) - min(views)
        lam0 = 0.05
        C0 = min(views)
        
        popt, _ = curve_fit(
            exponential_decay,
            times,
            views,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.03671，但该号在 arXiv 上是《Prompting Task Trees using Gemini: Methodologies and Insights》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：视频发布后的每日播放量、点赞、评论、收藏等时序数据，以及可支配的投流预算上限；卡页用发布后 48 小时数据做早期信号排序。

**输出**：每条视频的生命周期类型标签、衰减拟合参数与二次上升告警、精确到小时的投流触发时间建议（卡页总播放量可提升 2.3 倍），供内容运营排投流计划。

## 执行步骤

1. 采集每条视频发布后的每日互动时序并清洗异常点。
2. 用指数衰减函数拟合基线，计算半衰期与拟合优度。
3. 用 Z 分数检测偏离衰减基线的二次上升信号。
4. 打上快闪、长尾、双峰标签并排序。
5. 输出投流触发时间与预算分配建议，回看播放增量。

## 边界与不做

- 何时不用：拿不到发布后逐日数据、或视频发布不足 48 小时时不要用；纯创意优化不需要生命周期模型。
- 能力边界：只给标签与投流时机建议，不自动下单投流；2.3 倍播放提升与年化 $5–6 万为卡页案例值。
- 安全边界：AI 生成内容须标注，母婴健康类信息需具备资质，投流须遵守平台规则。

## 技能关联

- **前置**：Skill-Short-Video-Commerce-Attribution.html、Skill-Short-Video-Commerce-Attribution、Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-TikTok-Trending-Product-Signal.html、Skill-TikTok-Trending-Product-Signal
- **延伸**：Skill-TikTok-Shop-Content-Commerce-Funnel.html、Skill-TikTok-Shop-Content-Commerce-Funnel、Skill-TikTok-Trending-Product-Signal.html、Skill-TikTok-Trending-Product-Signal
- **可组合**：Skill-TikTok-Trending-Product-Signal.html、Skill-TikTok-Trending-Product-Signal、Skill-TikTok-Content-Lifecycle-Analytics

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：20-AI视频生成　·　源卡：`Skill-TikTok-Content-Lifecycle-Analytics`