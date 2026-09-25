---
name: "p2s-ad-aware-recommendation"
title: "Ad-Aware Recommendation — 广告感知协同排序：有机推荐与赞助商品的联合优化"
description: "触发词：广告感知推荐、联合排序、ROAS 约束、付费与有机混排、出价权重、推荐广告协同。何时不用：没有广告位、纯有机推荐的场景不需要；要判断广告的真实增量时用实验方法。安全边界：需使用 mock 或授权数据，不得用真实用户隐私数据做演示，接入出价数据前需确认接口授权。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Ad-Aware-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让付费广告和自然推荐在同一套评分里竞争，避免广告挤掉更该出现的商品。"
user_try: "试试：我的广告位总被低相关商品占着，帮我把广告和自然推荐放进同一个排序分里优化。"
whenToUse: "首页或搜索页同时有付费广告与有机推荐、需要联合决定位置分配时用本技能；只看广告自身效率时用出价或归因类技能；纯有机推荐场景不适用。"
workflow: "整理广告活动与有机商品的数据结构 → 计算含收益、质量与预算约束的统一排序分 → 优化页面位置的广告与有机配比 → 回测整体 GMV 与留存变化 → 输出布局规则与权重配置"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Ad-Aware Recommendation — 广告感知协同排序：有机推荐与赞助商品的联合优化

## ① 解决的问题

业务背景：某母婴品牌同时运营 Sponsored Products 广告和自然搜索排名

## ② 核心算法逻辑

传统电商推荐系统中，广告排序（Sponsored Ranking） 和 有机推荐（Organic Recommendation） 是两个完全独立的系统，分别优化 CTR/ROAS 和个性化相关性，导致用户体验分裂——同一用户可能在广告位看到高竞价但低相关商品，在有机推荐区看到高相关但低转化意图商品。

## ③ 业务应用场景

业务背景：某母婴品牌同时运营 Sponsored Products 广告和自然搜索排名。广告团队为"婴儿奶粉"出价 $2.5/click，但广告曝光位常被用于低相关商品（竞品投放），有机推荐又没有利用广告转化信号。
Ad-Aware Recommendation 应用：
数据需求：用户点击日志、广告出价接口（或历史出价数据）、商品 Embedding（可用现有 MF 模型产出）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

`combined_score`：综合排序分（越高越靠前），已包含广告价值和预算约束
`item_type`：`"ad-boosted"` 表示受广告加权影响；`"organic"` 表示纯有机排序
当 `lambda_budget < 0.05` 时，广告商品不参与竞价（避免透支预算）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（384 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/recommendation/ad_aware_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Ad-Aware-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Ad-Aware Recommendation: 广告感知协同排序
整合 BPR-MF 个性化推荐 + CTR 预估 + ROAS 约束联合优化
完全使用 mock 数据，无需真实 API
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import ast  # 仅用于验证代码语法，运行时不需要


# ── 数据结构定义 ─────────────────────────────────────────────────────────────

@dataclass
class AdCampaign:
    """广告投放活动"""
    advertiser_id: str
    product_id: str
    bid: float           # 出价（美元/次点击）
    daily_budget: float  # 日预算
    spent: float = 0.0   # 已花费
    target_roas: float = 4.0

    @property
    def budget_ratio(self) -> float:
        """预算剩余系数 λ_budget"""
        remaining = max(0.0, self.daily_budget - self.spent)
        return min(1.0, remaining / self.daily_budget)

    @property
    def is_active(self) -> bool:
        return self.budget_ratio > 0.05  # 剩余5%以上才投放


@dataclass
class UserProfile:
    """用户画像"""
    user_id: str
    click_history: List[str] = field(default_factory=list)
    embedding: Optional[np.ndarray] = None


@dataclass
class Product:
    """商品信息"""
    product_id: str
    category: str
    price: float
    embedding: Optional[np.ndarray] = None
    organic_score: float = 0.0  # 有机推荐分


# ── 核心模型 ─────────────────────────────────────────────────────────────────

class MatrixFactorizationMock:
    """
    BPR-MF 模型（mock版，用随机Embedding模拟训练结果）
    真实场景替换为 implicit 库或 LightFM
    """
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.17289，但该号在 arXiv 上是《Active propulsion noise shaping for multi-rotor aircraft localization》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户点击日志、广告出价接口或历史出价数据、商品 embedding（可用现有 MF 模型产出）、有机与广告商品的质量分与转化特征；卡页示例以 mock 数据演示，真实场景需替换为业务数据。

**输出**：统一排序分公式与权重、各位置广告与有机推荐的最优比例、整体 GMV 提升估算；供推荐与广告团队共同调整页面布局。

## 执行步骤

1. 整理广告活动与有机商品的数据结构
2. 计算含收益、质量与预算约束的统一排序分
3. 优化页面位置的广告与有机推荐配比
4. 回测整体 GMV 与留存变化
5. 输出布局规则与权重配置

## 边界与不做

- 何时不用：页面没有付费广告位，或广告与有机推荐由不同团队完全隔离运营时，本技能无法单独落地。
- 能力边界：本技能产出排序分与位置配比，不负责推荐系统上线与广告投放执行。
- 数据边界：卡页以 mock 数据演示，接入真实出价与点击数据前需确认接口授权与用户隐私边界。

## 技能关联

- **前置**：Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Ad-Aware-Recommendation

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：05-推荐系统　·　源卡：`Skill-Ad-Aware-Recommendation`