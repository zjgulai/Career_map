---
name: "p2s-ad-creative-personalization-bandit"
title: "Ad Creative Personalization Bandit — 上下文 Bandit 动态为不同人群选最优广告创意"
description: "触发词：创意个性化、上下文 Bandit、LinUCB、素材组合、创意疲劳、人群定向创意。何时不用：创意组合很少且流量充裕时用简单 A/B；需要严格归因结论时用固定分配实验。安全边界：前段全探索会牺牲短期转化，必须设探索预算与创意疲劳惩罚，素材与文案需符合平台广告政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-097"
l3_business: "广告实验"
l3_all: "广告实验 / 素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/广告实验"
p2s_card_id: "Skill-Ad-Creative-Personalization-Bandit"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "同一批素材按人群自动分发，让不同设备、时段的用户各自看到最合适的广告创意。"
user_try: "试试：帮我把 18 个创意组合做成上下文 Bandit，自动给不同人群选最合适的创意。"
whenToUse: "创意组合多、希望按人群自动分化且能接受探索成本时用上下文 Bandit；只比较少数素材时用常规 A/B；需要报表级显著性结论时用序列检验。"
workflow: "建立创意臂库与创意属性 → 抽取设备、时段、粉丝量等上下文特征 → 用 LinUCB 打分并按 UCB 选择展示创意 → 回填点击转化更新各臂参数 → 输出人群与最优创意的映射及疲劳控制参数"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad Creative Personalization Bandit — 上下文 Bandit 动态为不同人群选最优广告创意

## ① 解决的问题

广告投手面临"18种创意组合靠经验固定选择、A/B测试需6周才能收敛"——LinUCB上下文Bandit 2周收敛至最优创意，CTR从1.8%→2.6%，年化广告效率增益约30万元

## ② 核心算法逻辑

广告优化通常分两层：出价（Bidding） 决定花多少钱争取一次展示，创意（Creative） 决定展示什么内容。大多数广告主只优化出价，忽视创意层——但同一母婴产品的不同主图/标题/CTA，CTR 差异可达 35 倍。创意个性化 Bandit 在固定出价的前提下，为每个用户实时选择最可能转化的创意组合。

## ③ 业务应用场景

业务问题：奶粉 TikTok 广告有 3 张主图（产品图/使用场景图/妈妈评价图）× 3 个标题（价格导向/成分导向/场景导向）× 2 个 CTA（"立即购买"/"限时抢购"），共 18 种组合。当前团队用经验选择固定组合，A/B 测试周期长（每次测 2 周），错失快速迭代机会。
Bandit 方案： - 上下文特征：用户设备（iOS/Android）、时段（早/午/晚）、账号粉丝量（冷/暖/热）、历史点击品类 - 18 臂 LinUCB，每天更新参数 - 探索预算：前 3 天全探索，之后 UCB 自适应
预期产出： - 2 周内收敛到最优创意组合（vs 传统 A/B 测试需 6 周） - 不同用户群最优创意自动分化：iOS 用户 → 场景图+成分标题；安卓用户 → 价格图+价格标题

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：$10 万/月广告预算，CTR 提升 30-44%，等效每月多获得 3 万次有效点击，年化增收约 25-35 万元；无需额外广告预算，纯算法优化
实施难度：⭐⭐☆☆☆（LinUCB 轻量，可接入现有广告系统，约 2-3 周实现；疲劳感知需额外 1 周）
优先级：⭐⭐⭐⭐⭐（创意层是广告效果最被忽视的优化空间，且与出价优化正交，是"免费的 ROAS 提升"）
评估依据：CECS 在真实展示广告数据上 CTR +6.02%、GMV +10.37%；adSformers 在 Etsy 生产系统 ROC-AUC +2.66%，已全量上线

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（245 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 59)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Ad Creative Personalization Bandit
上下文 Bandit 广告创意个性化选择

依赖：numpy, pandas
实现：LinUCB + 创意疲劳惩罚
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 创意臂定义
# ─────────────────────────────────────────────

@dataclass
class Creative:
    """广告创意定义"""
    creative_id: str
    image_type: str      # product / lifestyle / review
    title_type: str      # price / ingredient / scene
    cta_type: str        # buy_now / limited_offer
    # 运行时统计
    n_impressions: int = 0
    n_clicks: int = 0
    fatigue_score: float = 0.0

    @property
    def true_ctr(self) -> float:
        """模拟真实 CTR（与创意属性相关）"""
        base = {'product': 0.018, 'lifestyle': 0.024, 'review': 0.021}[self.image_type]
        title_mult = {'price': 1.2, 'ingredient': 1.0, 'scene': 1.1}[self.title_type]
        cta_mult = {'buy_now': 1.0, 'limited_offer': 1.15}[self.cta_type]
        return base * title_mult * cta_mult


def create_creative_library() -> List[Creative]:
    """生成创意组合库（3图×3标题×2CTA = 18个创意）"""
    creatives = []
    for img in ['product', 'lifestyle', 'review']:
        for title in ['price', 'ingredient', 'scene']:
            for cta in ['buy_now', 'limited_offer']:
                cid = f"{img[:3]}_{title[:3]}_{cta[:3]}"
                creatives.append(Creative(cid, img, title, cta))
    return creatives


# ─────────────────────────────────────────────
# 2. LinUCB 上下文 Bandit
# ─────────────────────────────────────────────

class LinUCBCreativeBandit:
    """
    LinUCB 广告创意个性化 Bandit
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2302.01255 — adSformers: Personalization from Short-Term Sequences and Diversity of Representations in Etsy Ads

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：创意属性定义（主图、标题、CTA 的组合）、用户上下文特征（设备、时段、账号粉丝量、历史点击品类）以及广告点击与转化结果；需要能按天更新各臂参数。

**输出**：各创意臂参数与最优创意、按人群分化的创意推荐规则、收敛所需时间与 CTR 变化结论；供广告投手在素材层做自动化投放决策，并配套创意疲劳惩罚。

## 执行步骤

1. 定义创意臂库与每类创意的属性
2. 抽取设备、时段、粉丝量等上下文特征
3. 用 LinUCB 打分并按 UCB 选择展示创意
4. 回填点击转化并更新各臂参数
5. 输出人群与最优创意映射以及疲劳控制参数

## 边界与不做

- 何时不用：创意只有两三个、流量充足且想拿一次性结论时用标准 A/B，不必上上下文 Bandit。
- 能力边界：本技能产出创意选择策略与参数，不代替广告平台完成素材上传与投放执行。
- 风险边界：前段全探索会让部分用户看到低效创意，必须设置探索预算与创意疲劳惩罚，并确保素材符合平台广告政策。

## 技能关联

- **前置**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Creative-Fatigue-Detection.html、Skill-Creative-Fatigue-Detection、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-RELATE-RL-Ad-Text-Generation.html、Skill-RELATE-RL-Ad-Text-Generation、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **延伸**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-RELATE-RL-Ad-Text-Generation.html、Skill-RELATE-RL-Ad-Text-Generation、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **可组合**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Ad-Creative-Personalization-Bandit

---

> 分类：业务运营/品牌与增长/广告实验　·　技术族：13-广告分析　·　源卡：`Skill-Ad-Creative-Personalization-Bandit`