---
name: "p2s-creator-economy-roi-model"
title: "Creator Economy ROI Model — KOL 分级评估、内容衰减曲线与 GMV 净贡献量化"
description: "触发词：KOL 分级、微 KOL 矩阵、内容衰减曲线、GMV 净贡献、达人预算分配。何时不用：还没拿到达人候选池、要先做匹配打分时用达人匹配技能；本技能用于已合作或候选达人的效益量化。安全边界：达人合作须按平台要求标注广告合作标识；互动与转化数据不得使用刷量数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-098"
l3_business: "达人筛选"
l3_all: "达人筛选 / 合作复盘"
l1_l2_l3: "业务运营/品牌与增长/达人筛选"
p2s_card_id: "Skill-Creator-Economy-ROI-Model"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清同样预算给一个大达人还是给十个微达人更划算，并给出内容发帖节奏建议。"
user_try: "试试：用这份达人档案和合作数据，比较 50 万粉大 KOL 与 10 个 2 万粉微 KOL 的预期 GMV，并给出投放建议。"
whenToUse: "已有达人历史数据、要决定预算怎么分给谁时用本技能；候选池筛选打分用达人匹配技能。"
workflow: "接入达人档案与历史内容表现数据 → 按粉丝量级核实互动率与转化率口径 → 测算不同达人组合的预期销售与 ROIS → 结合内容衰减曲线给出发帖频率与停止合作建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Creator Economy ROI Model — KOL 分级评估、内容衰减曲线与 GMV 净贡献量化

## ① 解决的问题

花 $4000 签大 KOL ROAS 不如 $500 签 10 个微 KOL——Journal of Marketing 2024 田野实验证明 5K-50K 粉丝的垂直微 KOL ROI 高出一个数量级，内容衰减曲线指导最优发帖频率

## ② 核心算法逻辑

论文用 1,881,533 笔真实购买数据 + 3 次田野实验得出了一个反直觉结论：小粉丝创作者（微 KOL）的 ROI 往往远超大 KOL，平均量级差距高达一个数量级。根本原因是"社会资本悖论"——粉丝越多，每个粉丝的信任感越低，互动率和转化率越差。

## ③ 业务应用场景

业务问题：预算 $5,000 给 KOL 投放，有两个选择：一个有 500K 粉丝要价 $4,000；另一个有 20K 粉丝要价 $500。
ROI 预测： - 500K KOL：互动率估算 1.2%（大 KOL 均值），转化率 0.8%，曝光 × 互动 × 转化 = 预期销售 48 件 - 20K KOL：互动率估算 4.5%（微 KOL 均值），转化率 2.8%，= 预期销售 25 件/人 - $5,000 可以找 10 个 20K 微 KOL = 预期销售 250 件（vs 大 KOL 48 件）
结论：微 KOL 矩阵 ROIS > 5x，大 KOL ROIS ≈ 1.1x

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
微 KOL 矩阵 vs 单个大 KOL：同等预算 GMV 提升 3-5x（论文验证）
内容类型优化（增加教程类比例）：长尾 GMV 提升 30-50%
停止低 ROIS KOL 合作：月节省无效支出 $1,000-3,000
年化综合 ROI：¥50-200 万
实施难度：⭐⭐☆☆☆（核心是数据采集 + 模型计算，2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（234 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/creator_economy_roi_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Creator-Economy-ROI-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Creator Economy ROI Model — KOL 分级评估与内容衰减建模
基于 Journal of Marketing 2024 (Revenue Generation through Influencer Marketing)

依赖: numpy, statistics, dataclasses (标准库)
"""

from dataclasses import dataclass, field
import numpy as np
from statistics import mean


@dataclass
class CreatorProfile:
    """KOL 档案"""
    creator_id: str
    platform: str               # tiktok / instagram / youtube
    followers: int
    niche: str                  # parenting / momlife / baby_products
    avg_engagement_rate: float  # 实测互动率（可从历史数据计算）
    content_quality_score: float = 0.7  # 0-1，内容质量主观评分
    fee_per_post: float = 0.0   # 单帖报价


@dataclass
class ContentPost:
    """单条 KOL 内容"""
    post_id: str
    creator_id: str
    content_type: str           # promo / review / tutorial / seo
    post_timestamp: float
    peak_gmv: float             # 发布后24小时的峰值 GMV
    gross_margin: float = 0.35


@dataclass
class CreatorROIResult:
    """KOL ROI 评估结果"""
    creator_id: str
    followers: int
    predicted_gmv_7d: float
    rois: float
    cost_per_acquisition: float
    tier: str                   # nano/micro/mid/macro/mega
    recommendation: str


class ContentDecayModel:
    """内容衰减模型（指数衰减）"""

    # 各内容类型的衰减速度（论文校准）
    DECAY_RATES = {
        "promo":    0.25,   # 促销帖：4天半衰期
        "review":   0.10,   # 评测帖：7天半衰期
        "tutorial": 0.05,   # 教程帖：14天半衰期
        "seo":      0.02,   # SEO帖：35天半衰期
    }

    def gmv_at_time(self, post: ContentPost, hours_since_post: float) -> float:
        """t小时后的累计 GMV"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.12345，但该号在 arXiv 上是《Performance Portable Monte Carlo Particle Transport on Intel, NVIDIA, and AMD GPUs》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：达人档案（粉丝量、垂类、实测互动率、内容质量评分、单帖报价）与历史合作内容的表现数据（曝光、互动、转化）。

**输出**：达人分级与预期 ROIS 及 GMV 净贡献测算、微 KOL 矩阵与大达人对比结论、内容衰减曲线指导的发帖频率与停止合作清单；供投放与达人运营使用。

## 执行步骤

1. 接入达人档案与历史合作表现数据
2. 按量级核实互动率与转化率口径
3. 测算各投放组合的预期销售与 ROIS
4. 拟合内容衰减曲线给出发帖频率
5. 输出达人分级与预算分配建议

## 边界与不做

- 达人互动率与转化数据缺失或来源不可核验时不用本技能，测算不成立。
- 本技能输出达人效益测算与预算建议，不执行签约、寄样与结算。
- 安全边界：合作内容须按平台要求标注广告标识；不得使用刷量数据做决策。

## 技能关联

- **前置**：Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-KOL-Creator-Matching.html、Skill-KOL-Creator-Matching、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-Creator-Economy-ROI-Model.html、Skill-Creator-Economy-ROI-Model、Skill-KOL-Creator-Matching.html、Skill-KOL-Creator-Matching、Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-TikTok-Algorithm-Content-Boost.html、Skill-TikTok-Algorithm-Content-Boost
- **可组合**：Skill-Multi-Objective-Budget-Allocation.html、Skill-Multi-Objective-Budget-Allocation、Skill-Social-Proof-Amplification.html、Skill-Social-Proof-Amplification、Skill-Creator-Economy-ROI-Model

---

> 分类：业务运营/品牌与增长/达人筛选　·　技术族：20-AI视频生成　·　源卡：`Skill-Creator-Economy-ROI-Model`