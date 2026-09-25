---
name: "p2s-tiktok-shop-content-attribution"
title: "TikTok Shop Content Attribution — 短视频带货兴趣图谱归因"
description: "触发词：内容带货归因、帧级内容元素、延迟归因窗口、兴趣图谱、素材效率对比。何时不用：只做视频特征与转化的相关性排序用短视频内容归因技能，评估达人真实增量用 KOL 因果归因技能，本技能解决长决策周期下的内容元素级归因。安全边界：曝光与转化数据须按用户 ID 关联后脱敏，遵守平台数据使用条款，不得用于跨平台个体追踪。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 内容实验"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-TikTok-Shop-Content-Attribution"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "看清每条带货视频里哪类画面元素真正带来成交，把预算挪到有效内容上。"
user_try: "试试：把这三支 KOL 带货视频做帧级归因，告诉我产品特写、使用场景、KOL 口播哪类元素效率最高。"
whenToUse: "母婴大件等长决策周期品类、24 小时归因窗口漏判转化时用本技能；只做视频特征重要性排序用短视频内容归因技能，判断达人本身带来的增量用 KOL 因果归因技能。"
workflow: "导出曝光与互动日志 → 用视觉模型做帧级内容元素标注 → 关联订单转化事件并做延迟归因 → 比对各类内容元素效率 → 重配内容制作预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# TikTok Shop Content Attribution — 短视频带货兴趣图谱归因

## ① 解决的问题

短视频运营面临内容带货说不清——内容归因将素材误判率21%压到7%，年化省23万元

## ② 核心算法逻辑

TikTok Shop 的归因困境与传统广告归因有本质差异：

## ③ 业务应用场景

业务背景：某母婴品牌在 TikTok US 投放 3 支 KOL 带货视频（A/B/C），均实现销售，但品牌无法区分哪类内容元素效率最高，无法指导下一期视频制作方向。
量化 ROI：基于帧级归因重新分配内容制作预算，测算 3 个月视频 ROAS 从 3.8x→4.9x（+29%），增量 GMV $112,500/月（假设 $50,000 投放预算）。
业务背景：母婴大件商品（婴儿车、儿童安全座椅）决策周期长，买家常在 TikTok 看完视频后 3-7 天才购买，现有 24h 归因窗口漏判大量转化，导致高质量内容 ROI 被低估，投放预算向短决策周期品类转移。

## ④ 输入数据要求

TikTok 后台导出：曝光用户 ID、视频 ID、时间戳、互动行为
帧级标注：使用 CV 模型（CLIP）对视频帧自动标注内容元素类型
转化事件：TikTok Shop 后台的订单数据与用户 ID 关联

## ⑤ 输出结果

TikTok 后台导出：曝光用户 ID、视频 ID、时间戳、互动行为
帧级标注：使用 CV 模型（CLIP）对视频帧自动标注内容元素类型
转化事件：TikTok Shop 后台的订单数据与用户 ID 关联

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（538 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/advertising/tiktok_shop_content_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-TikTok-Shop-Content-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
TikTok Shop 短视频内容归因系统
整合 TICA（兴趣图谱归因）+ VideoAttr（帧级元素归因）+ MICE（延迟归因）
使用 mock 数据，无需真实模型权重即可运行
"""

from __future__ import annotations
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from enum import Enum


# ── 数据结构 ─────────────────────────────────────────────────────────────────

class ContentElementType(Enum):
    PRODUCT_CLOSEUP = "product_closeup"       # 产品特写
    USE_SCENARIO = "use_scenario"             # 使用场景
    KOL_RECOMMENDATION = "kol_recommendation" # KOL推荐口播
    PRICE_PROMO = "price_promo"               # 价格/促销信息
    SAFETY_SPEC = "safety_spec"               # 安全/规格说明
    BEFORE_AFTER = "before_after"             # 使用前后对比


@dataclass
class VideoContent:
    """TikTok 视频内容"""
    video_id: str
    duration_seconds: int
    completion_rate: float          # 完播率 [0, 1]
    interaction_rate: float         # 互动率（点赞+评论+分享）/ 曝光 [0, 1]
    frames: List[Dict] = field(default_factory=list)  # 帧数据列表
    # 每帧格式: {"timestamp": float, "element_type": ContentElementType, "visual_embedding": np.ndarray}

    @property
    def content_quality(self) -> float:
        """内容质量分"""
        return self.completion_rate * 0.6 + self.interaction_rate * 0.4

    @property
    def adaptive_attribution_window_hours(self) -> float:
        """MICE: 自适应归因窗口（小时）"""
        sigma0 = 36.0   # 基础窗口 36h
        beta = 0.8      # 内容质量放大系数
        return sigma0 + beta * self.content_quality * 72.0


@dataclass
class UserInterestNode:
    """用户兴趣图谱节点"""
    node_id: str
    name: str                           # 兴趣名称（如"母婴安全关注"）
    activation_threshold: float = 0.5   # 激活阈值
    conversion_weight: float = 0.0      # 对购买转化的贡献权重（从历史数据学习）


@dataclass
class ContentExposure:
    """用户接触内容事件"""
    video_id: str
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.16817，但该号在 arXiv 上是《Acquisition of high-quality three-dimensional electron diffuse scattering data》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：TikTok 后台导出的曝光用户 ID、视频 ID、时间戳与互动行为；用 CLIP 等视觉模型对视频帧自动标注的内容元素类型；TikTok Shop 后台订单数据与用户 ID 关联的转化事件。

**输出**：各内容元素类型（产品特写、使用场景、KOL 口播、价格促销、安全规格、前后对比）的转化贡献与效率排序、自适应归因窗口判定，以及内容制作预算重配建议；卡页测算 3 个月视频 ROAS 从 3.8x 提升到 4.9x。

## 执行步骤

1. 导出曝光、视频、时间戳与互动行为日志。
2. 用视觉模型对视频做帧级内容元素标注。
3. 关联 TikTok Shop 订单转化事件并做延迟归因。
4. 比对不同内容元素的转化效率，定位高效元素组合。
5. 按归因结果重配内容制作预算与下一期视频方向。

## 边界与不做

- 拿不到用户级曝光日志、或订单无法与用户 ID 关联时不要用，帧级归因算不出来。
- 能力边界：结果依赖归因窗口设定与标注质量，只指示效率排序，不等于内容元素的因果增量；ROAS 与增量 GMV 为卡页测算口径（含假设投放预算），不可直接外推。
- 数据合规：曝光与转化明细须脱敏，遵守平台数据使用条款，不得用于跨平台个体追踪。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling
- **延伸**：Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization
- **可组合**：Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-DAWN-Talking-Head-Review.html、Skill-DAWN-Talking-Head-Review、Skill-TikTok-Shop-Content-Attribution

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：13-广告分析　·　源卡：`Skill-TikTok-Shop-Content-Attribution`