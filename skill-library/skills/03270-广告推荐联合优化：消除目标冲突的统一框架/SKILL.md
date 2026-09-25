---
name: "p2s-joint-ads-recommendation-optimization"
title: "Joint Ads Recommendation Optimization — 广告推荐联合优化：消除目标冲突的统一框架"
description: "触发词：广告推荐联合优化、目标冲突、统一排序、广告占比、用户体验权重、GMV 提升。何时不用：页面只有广告或只有自然推荐时不存在目标冲突；要判断广告的增量效果时用实验方法。安全边界：排位调整需符合平台广告展示政策，不得让低质量广告靠高出价长期占据首位而损害体验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Joint-Ads-Recommendation-Optimization"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让付费广告和自然推荐用同一套评分竞争，避免各自优化反而拖累整体成交。"
user_try: "试试：首页广告和自然推荐各优化各的，帮我做一套统一排序让整体 GMV 上去。"
whenToUse: "同一页面既放付费广告又放自然推荐、两个团队目标冲突时用本技能；页面只有一种内容时不需要；要判断广告增量效果时用实验方法。"
workflow: "整理广告与有机商品的历史表现数据 → 定义统一排序分与广告收益权重 → 加入用户体验与长期留存调整项 → 优化页面位置与广告占比上限 → 输出排序公式与配比建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Joint Ads Recommendation Optimization — 广告推荐联合优化：消除目标冲突的统一框架

## ① 解决的问题

广告推荐系统分别优化导致高出价低质广告占据最佳位置整体GMV反而下降——统一排序框架让广告和有机推荐在同一评分体系竞争，消除目标冲突整体GMV提升10-18%年化20-60万元

## ② 核心算法逻辑

分离优化 vs 联合优化：

## ③ 业务应用场景

业务问题：独立站首页同时展示付费广告（合作品牌）和有机推荐（自有商品）。目前分开管理：广告部门最大化广告 CTR，运营最大化商品 CVR，两者冲突——广告出价高时会把有机推荐挤出首屏，但用户对广告的信任度低，整体 CVR 反而下降。
数据要求： - 广告和有机商品的历史 CTR/CVR 数据 - 用户对广告 vs 有机商品的差异化响应 - 平台整体 GMV 和用户留存数据
预期产出： - 联合排序分公式和权重 - 各位置广告 vs 有机推荐的最优比例 - 预期 GMV 提升估算

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
整体 GMV 提升 10-18%（消除目标冲突）
广告商满意度提升（更有效的曝光）
用户体验提升（低质量广告减少）
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐⭐☆（需要同时修改广告和推荐系统；统一排序分设计约 3-4 周；LTV 模型需要长期数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/joint_ads_recommendation_optimization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Joint-Ads-Recommendation-Optimization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Joint Ads Recommendation Optimization
广告推荐联合优化：统一排序框架
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class AdItem:
    item_id: str
    is_ad: bool
    bid: float = 0.0        # 广告出价（有机商品=0）
    predicted_ctr: float = 0.0
    predicted_cvr: float = 0.0
    quality_score: float = 1.0   # 商品质量分（影响用户体验）
    avg_order_value: float = 100.0


def compute_unified_score(item: AdItem,
                           alpha: float = 0.4,
                           ltv_factor: float = 0.1) -> dict:
    """
    计算统一排序分
    alpha: 广告收益权重（1-alpha 为有机推荐权重）
    ltv_factor: 长期用户留存价值因子
    """
    # 广告收益（只对广告商品有效）
    ad_revenue = item.bid * item.predicted_ctr if item.is_ad else 0

    # 有机推荐收益（GMV贡献）
    organic_revenue = item.predicted_cvr * item.avg_order_value

    # 用户体验调整（低质量广告会降低留存）
    experience_score = item.quality_score
    ltv_adjustment = ltv_factor * (experience_score - 1.0)  # 质量>1加分，<1减分

    # 统一分
    unified = (alpha * ad_revenue + (1 - alpha) * organic_revenue +
               ltv_adjustment)

    return {
        'item_id': item.item_id,
        'is_ad': item.is_ad,
        'unified_score': round(unified, 4),
        'ad_revenue': round(ad_revenue, 4),
        'organic_revenue': round(organic_revenue, 4),
        'ltv_adjustment': round(ltv_adjustment, 4),
    }


def optimize_page_layout(items: list[AdItem],
                          n_slots: int = 6,
                          alpha: float = 0.4,
                          max_ad_ratio: float = 0.33) -> dict:
    """
    优化页面布局：广告和有机推荐的最优组合
    max_ad_ratio: 广告占比上限（避免广告过多伤害体验）
    """
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2408.09885 — Joint Auction in the Online Advertising Market

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：广告与有机商品的历史点击率与转化率数据、用户对广告与有机内容的差异化响应、平台整体 GMV 与用户留存数据，以及各广告位的出价信息。

**输出**：统一排序分公式与权重、各位置广告与有机推荐的最优比例、预期 GMV 提升估算；供广告与运营团队共同执行页面排序策略。卡页无代码模板，产出以公式与配比方案为主。

## 执行步骤

1. 整理广告与有机商品的历史表现数据
2. 定义统一排序分与广告收益权重
3. 加入用户体验与长期留存调整项
4. 优化页面位置与广告占比上限
5. 输出排序公式与配比建议

## 边界与不做

- 何时不用：页面只有付费广告或只有自然推荐时不存在目标冲突，不必做联合优化。
- 能力边界：本技能产出排序公式与配比，不负责推荐系统与广告系统的工程上线。
- 合规边界：排位调整需符合平台广告展示政策，不能让低质量广告靠高出价长期占据首位。

## 技能关联

- **前置**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Price-Sensitive-Personalized-Recommendation.html、Skill-Price-Sensitive-Personalized-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **延伸**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Personalized-Search-Ranking.html、Skill-Personalized-Search-Ranking、Skill-Price-Sensitive-Personalized-Recommendation.html、Skill-Price-Sensitive-Personalized-Recommendation、Skill-RTB-Multi-Objective-Bidding.html、Skill-RTB-Multi-Objective-Bidding
- **可组合**：Skill-Explainable-Recommendation.html、Skill-Explainable-Recommendation、Skill-Price-Sensitive-Personalized-Recommendation.html、Skill-Price-Sensitive-Personalized-Recommendation、Skill-Joint-Ads-Recommendation-Optimization

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Joint-Ads-Recommendation-Optimization`