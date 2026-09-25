---
name: "p2s-video-roi-attribution"
title: "Video ROI Attribution — 短视频内容 GMV 归因与财务 ROI 量化"
description: "触发词：视频 ROI、VEI 指数、短视频归因、素材效果、预算分配。何时不用：要看多渠道整体归因报告时用「DataAgent营销归因分析」；只做财务口径预算分配建模时用预算分配类技能。安全边界：归因 GMV 属归因口径估算，须标注时间窗与假设，不得当作已实现收入对外披露。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 预算分配"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-Video-ROI-Attribution"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "把完播率、互动率折算成归因 GMV 和净利润贡献，让视频预算花在真正带货的素材上。"
user_try: "试试：按 VEI 和归因 GMV 给这个月 15 条 TikTok 视频排名，指出哪种素材类型值得加预算。"
whenToUse: "当要评估逐条短视频的内容效果、决定下轮素材预算倾斜时用本技能；要全渠道归因报告与对话式追问，用「DataAgent营销归因分析」；只做投放渠道口径归因的不用本技能。"
workflow: "拉取每条视频的参与度数据（完播率、互动率、点击率）与成本 → 计算 VEI 并与对应时间窗口的订单量对比 → 按归因 GMV 与总成本的比值排名，输出 ROI 热力表 → 把高 ROI 素材类型沉淀为下一轮制作参考模板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Video ROI Attribution — 短视频内容 GMV 归因与财务 ROI 量化

## ① 解决的问题

视频创作团队和 CFO 说不同语言——VEI 指数将完播率/互动率转化为归因 GMV 和净利润贡献，预算效率提升 40-60%，视频团队获得财务话语权

## ② 核心算法逻辑

短视频创作团队和财务团队说不同的语言：创作团队看"播放量、完播率、点赞数"，财务团队看"ROAS、GMV、毛利"。这两套指标之间缺乏一个翻译层，导致视频预算决策凭感觉而非数据。

## ③ 业务应用场景

业务问题：运营团队每月制作 10-20 条 TikTok 视频，每条成本 $500-2000（包含制作 + 投放），但不知道哪些视频真正带来销售，预算分配凭感觉。
Video ROI Attribution 处理： 1. 拉取每条视频的参与度数据（完播率/互动率/点击率） 2. 计算 VEI 并与对应时间窗口的订单量对比 3. 按归因 GMV / 总成本排名，输出"ROI 热力表" 4. 高 ROI 素材类型作为下一轮制作的参考模板
示例发现："妈妈真实使用 60 秒完播"型视频 VEI 0.72，归因 ROAS 6.2x；"产品功能展示 30 秒"型 VEI 0.41，ROAS 2.8x → 下轮预算向真实使用场景倾斜

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
停止低 ROI 素材：预算效率提升 40-60%，月省 $1,000-3,000 无效投放
高 ROI 素材类型复用：制作成本降低 30%（基于成功模板）
CFO 信任度提升：视频预算审批速度加快，年均多获批 ¥10-30 万预算
年化综合 ROI：¥30-100 万
实施难度：⭐⭐☆☆☆（数据打通是主要工作量，算法本身简单，1 周接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（209 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/video_roi_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Video-ROI-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Video ROI Attribution — 短视频 GMV 归因与财务 ROI 量化
综合工业实践（Attribution Labs 2026）

依赖: numpy, dataclasses (标准库)
"""

from dataclasses import dataclass, field
from typing import Optional
import numpy as np
from datetime import datetime, timedelta


@dataclass
class VideoMetrics:
    """单条视频的参与度指标"""
    video_id: str
    platform: str              # tiktok / youtube / instagram
    title: str
    publish_date: str
    production_cost: float     # 制作成本（USD）
    ad_spend: float            # 投放预算（USD）
    # 参与度指标
    views: int = 0
    completion_rate: float = 0.0   # 完播率
    engagement_rate: float = 0.0   # 互动率（点赞+评论+分享 / 播放）
    click_through_rate: float = 0.0
    search_lift: float = 0.0       # 视频发布后品牌词搜索提升率


@dataclass
class AttributionResult:
    """归因结果"""
    video_id: str
    attributed_gmv: float       # 归因 GMV
    attributed_orders: int      # 归因订单数
    vei_score: float            # 视频效能指数
    roas: float                 # 广告支出回报
    net_profit_contribution: float  # 净利润贡献（归因 GMV × 毛利率 - 成本）
    roi_rank: int = 0


class VideoROIAttributor:
    """
    视频 ROI 归因计算器

    支持三种归因模式：
    - linear: 线性归因（平均分配）
    - time_decay: 时间衰减（近期权重更高）
    - vei_weighted: VEI 权重归因
    """

    # VEI 各指标权重（基于 Attribution Labs 研究）
    VEI_WEIGHTS = {
        "completion_rate": 0.35,
        "engagement_rate": 0.30,
        "click_through_rate": 0.25,
        "search_lift": 0.10,
    }
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：逐条视频的参与度数据（完播率、互动率、点击率）与成本（制作加投放），以及对应时间窗口内的订单量；视频粒度。

**输出**：VEI 指数、归因 GMV 与 ROAS、按 ROI 排序的 ROI 热力表；供内容与财务团队决定素材预算与制作模板。

## 执行步骤

1. 拉取每条视频的参与度数据与成本
2. 计算 VEI 并与时间窗口内订单量对齐
3. 按归因 GMV 与总成本排名，输出 ROI 热力表
4. 把高 ROI 素材类型沉淀为下一轮制作模板

## 边界与不做

- 数据不满足：视频与订单时间窗口无法对齐或缺成本口径时排名不可信，先补数据。
- 何时不用：多渠道归因报告与追问用「DataAgent营销归因分析」；只做财务口径预算分配建模用预算分配类技能；要判断因果驱动因素用「PC算法因果发现」。
- 能力边界：输出归因口径内的估计与素材建议，不做投放执行，也不替代增量实验。
- 安全边界：归因 GMV 属估算口径，须标注时间窗与假设，不得当作已实现收入对外披露。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-KOL-Video-ROI-Attribution.html、Skill-KOL-Video-ROI-Attribution、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-KOL-Video-ROI-Attribution.html、Skill-KOL-Video-ROI-Attribution、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-KOL-Video-ROI-Attribution.html、Skill-KOL-Video-ROI-Attribution、Skill-Video-ROI-Attribution

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：20-AI视频生成　·　源卡：`Skill-Video-ROI-Attribution`