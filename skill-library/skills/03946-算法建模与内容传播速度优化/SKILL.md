---
name: "p2s-tiktok-algorithm-content-boost"
title: "TikTok Algorithm Content Boost — FYP 算法建模与内容传播速度优化"
description: "触发词：TikTok 推流诊断、完播率优化、FYP 信号评分、发布时段优化、曝光提升。何时不用：只优化开头几秒钩子用钩子优化类技能，本技能解决整条视频在分层测试池中的信号诊断与放大策略。安全边界：不得使用刷量、机器互动等违反平台规则的手段制造互动速度信号，前 30 分钟互动须来自真实私域用户。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 传播规划"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-TikTok-Algorithm-Content-Boost"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按平台推流信号给视频打分，找出完播率和发布策略的卡点，让内容进入更大的测试池。"
user_try: "试试：诊断这三条吸奶器视频为什么曝光不到 500，给出完播率、开场钩子和发布时间的优化方案。"
whenToUse: "视频曝光上不去、需要判断卡在哪个推流信号（完播率、互动速度、发布时段）时用本技能；只针对开场三秒留存做文案排序用钩子优化类技能。"
workflow: "采集发布后的实时信号 → 对 FYP 信号打分定位瓶颈 → 改钩子、压时长、调发布时段 → 前 30 分钟补充真实互动 → 按评分停投低分视频"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok Algorithm Content Boost — FYP 算法建模与内容传播速度优化

## ① 解决的问题

TikTok 视频完播率只有 35% 导致流量熔断、每条视频曝光不足 500——FYP 信号评分模型精确诊断卡点，完播率优化到 70% 后进入扩大测试池，曝光提升 20×

## ② 核心算法逻辑

TikTok FYP（For You Page）算法不是一次性排序，而是阶段性放大机制——每条视频经历多轮测试池，每轮通过后获得更大曝光。论文用"数字木偶"实验（347 个真实用户 + 9.2M 条推荐数据）揭示了放大机制的精确时间窗口：

## ③ 业务应用场景

业务问题：Momcozy 发布新款吸奶器的 TikTok 视频，前 3 条视频完播率只有 35%，被 FYP 算法降权，每条视频曝光 < 500。不知道是内容问题还是发布策略问题。
FYP 信号诊断： - 完播率 35% < 70% 阈值 → 关键瓶颈 - 视频前 5 秒无钩子（用户滑走率高） - 发布时间 14:00（目标用户活跃峰值是 20:00-22:00）
优化策略： 1. 前 3 秒加"问题钩子"（"You're losing $200/month pumping wrong"） 2. 视频压缩到 45 秒内（提高完播率） 3. 改到 21:00 发布 4. 头 30 分钟人工互动（私域用户触发互动速度信号）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
完播率从 35% → 72%：进入扩大测试池，曝光从 500 → 10K+（20× 提升）
优化发布时间 + 前 30 分钟互动策略：每条视频额外 GMV ¥5,000-20,000
系统化内容评分 → 停止低分视频的广告投放：月省 $2,000-5,000 无效投放
年化综合 ROI：¥50-150 万
实施难度：⭐⭐☆☆☆（信号采集需要 TikTok API 接入；评分模型纯算法，1 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（181 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/tiktok_algorithm_content_boost` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-TikTok-Algorithm-Content-Boost.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok Algorithm Content Boost — FYP 信号评分与传播预测
基于 arXiv: 2503.20231 (2025)

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np


@dataclass
class VideoMetrics:
    """视频发布后的实时信号"""
    video_id: str
    duration_seconds: float        # 视频时长
    completion_rate: float         # 完播率 (0-1)
    like_rate_30min: float         # 前30分钟点赞率
    share_rate: float              # 分享率
    comment_rate: float            # 评论率
    rewatch_rate: float = 0.0      # 重播率
    publish_hour: int = 20         # 发布时间（24h制）
    account_followers: int = 10000


@dataclass
class FYPScore:
    """FYP 算法评分"""
    video_id: str
    total_score: float
    signal_breakdown: dict
    amplification_phase: str       # cold_start / expanding / viral / declining
    estimated_next_exposure: int   # 预估下一轮曝光量
    bottleneck: str                # 最需要优化的信号


class TikTokFYPScorer:
    """
    TikTok FYP 算法评分模型

    基于论文 arXiv:2503.20231 的实证权重
    适用于母婴类目视频优化
    """

    # 信号权重（母婴品类校准版）
    SIGNAL_WEIGHTS = {
        "completion_rate":   0.40,
        "like_rate_30min":   0.25,
        "rewatch_rate":      0.15,
        "share_rate":        0.12,
        "comment_rate":      0.08,
    }

    # 母婴类目行业基准阈值
    BENCHMARKS = {
        "completion_rate":  {"poor": 0.40, "ok": 0.60, "good": 0.70, "great": 0.80},
        "like_rate_30min":  {"poor": 0.01, "ok": 0.02, "good": 0.03, "great": 0.05},
        "rewatch_rate":     {"poor": 0.02, "ok": 0.04, "good": 0.06, "great": 0.10},
        "share_rate":       {"poor": 0.005,"ok": 0.01, "good": 0.015,"great": 0.025},
        "comment_rate":     {"poor": 0.003,"ok": 0.005,"good": 0.008,"great": 0.015},
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2503.20231 — Dynamics of Algorithmic Content Amplification on TikTok

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：视频发布后的实时信号：时长、完播率、前 30 分钟点赞率、分享率、评论率、重播率、发布小时与账号粉丝量，来源为 TikTok API 或后台分析数据。

**输出**：FYP 总分与逐信号分解、瓶颈定位结论（例如完播率低于阈值）、内容与发布策略的优化清单，以及建议停投的低分视频清单。

## 执行步骤

1. 接入 TikTok 信号数据，采集每条视频的完播率与互动率。
2. 用 FYP 评分模型计算总分并拆解各信号贡献。
3. 定位低于阈值的瓶颈信号，判断是内容问题还是发布策略问题。
4. 按结论改钩子、压缩时长、调整发布时段，并在前 30 分钟补充真实互动。
5. 用评分结果停投低分视频，把预算集中到高分内容。

## 边界与不做

- 拿不到发布后实时信号（接口未接入、样本过少）时不要用，评分模型没有输入。
- 能力边界：本技能交付诊断结论与优化建议，不保证曝光倍数；卡页的完播率与曝光提升来自特定案例，不能直接外推。
- 红线：不得用刷量、机器人互动或任何违规手段制造互动速度信号，被发现会直接损害账号权重。

## 技能关联

- **前置**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification
- **可组合**：Skill-AB-Variance-Downstream.html、Skill-AB-Variance-Downstream、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：20-AI视频生成　·　源卡：`Skill-TikTok-Algorithm-Content-Boost`