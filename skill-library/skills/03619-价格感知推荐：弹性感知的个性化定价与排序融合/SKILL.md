---
name: "p2s-price-sensitive-recommendation"
title: "Price-Sensitive Recommendation — 价格感知推荐：弹性感知的个性化定价与排序融合"
description: "触发词：价格感知推荐、个体弹性、折扣精准触达、去偏排序、价格效用、促销推送。何时不用：只按价格档位做排序时用「价格感知个性化推荐」；要按增量效应生成发券队列时用「Uplift 干预优先级队列」。安全边界：折扣展示须与真实促销一致，不得制造虚假原价；个体弹性的使用须符合个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Price-Sensitive-Recommendation"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同样一张折扣券，只发给真正需要它才会买的人：按个体价格弹性决定推给谁、推多大折扣。"
user_try: "试试：Prime Day 消毒器打 7 折，帮我按用户价格弹性筛出真正需要折扣才买的群体，别把券发给本来就会买的人。"
whenToUse: "当促销折扣的推送对象需要按个体价格弹性区分、避免补贴低弹性用户时用本技能；若只需按价格档位重排推荐，用「价格感知个性化推荐」；若要按增量效应生成有限券的执行队列，用「Uplift 干预优先级队列」。"
workflow: "整理商品历史价格与销量、用户价格画像与折扣购买标记 → 估计用户级与品类级的价格弹性 → 用价格效用函数与相关分融合排序候选商品 → 用逆概率加权去偏后输出折扣展示排序与推送名单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price-Sensitive Recommendation — 价格感知推荐：弹性感知的个性化定价与排序融合

## ① 解决的问题

业务背景：Prime Day / Black Friday 母婴类目促销期间，某品牌对婴儿消毒器打折30%（$59.99→$41.99）

## ② 核心算法逻辑

传统推荐系统只关注用户与商品的"相关性"，完全忽视价格因素；而传统定价系统只优化利润或销量，不考虑用户个性化偏好。PriceSensitive Recommendation 的核心思想是将个体价格弹性注入推荐排序决策：

## ③ 业务应用场景

业务背景：Prime Day / Black Friday 母婴类目促销期间，某品牌对婴儿消毒器打折30%（$59.99→$41.99）。但促销推送策略是"给所有收藏过该商品的用户群发"，导致原本会全价购买的用户（低弹性）也被打折吸引，削减利润；而真正需要折扣激励才会购买的用户（高弹性）反而没被精准触达。
Price-Sensitive Recommendation 应用：
业务背景：AIM DTC 独立站（婴儿消毒设备）同时销售$49（基础款）、$79（升级款）、$129（旗舰款）三个价位产品。当前首页推荐对所有用户展示相同顺序，无法区分价格敏感度不同的访客。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

`final_score`：价格效用 + MF 锚定 + 促销增益的综合分
`segment_label`：用户弹性分层（`low/medium/high_elastic`），可用于前端展示逻辑差异化

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（477 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/recommendation/price_sensitive_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Price-Sensitive-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Price-Sensitive Recommendation: 价格感知个性化推荐
整合 MF 相关分 + 用户价格弹性估计 + 价格效用函数 + IPW 去偏
完全使用 mock 数据，无需真实 API
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# ── 数据结构 ──────────────────────────────────────────────────────────────────

@dataclass
class PriceHistory:
    """商品历史价格数据"""
    product_id: str
    prices: List[float]              # 历史价格序列
    sales_volumes: List[float]       # 对应销量
    reference_price: float = 0.0    # 参考价（类目均价）

    def __post_init__(self):
        if self.reference_price == 0.0 and self.prices:
            self.reference_price = float(np.mean(self.prices))


@dataclass
class PricedProduct:
    """带价格信息的商品"""
    product_id: str
    name: str
    current_price: float
    original_price: float       # 原价（促销时 < original_price）
    category: str
    reference_price: float = 0.0

    @property
    def is_on_sale(self) -> bool:
        return self.current_price < self.original_price * 0.97

    @property
    def discount_rate(self) -> float:
        if self.original_price <= 0:
            return 0.0
        return max(0.0, 1.0 - self.current_price / self.original_price)


@dataclass
class UserPriceProfile:
    """用户价格弹性画像"""
    user_id: str
    global_beta: float = 1.0         # 全局价格敏感系数 β_u
    category_betas: Dict[str, float] = field(default_factory=dict)
    purchase_price_history: List[float] = field(default_factory=list)  # 历史购买价格

    def get_beta(self, category: str) -> float:
        """获取特定品类的价格弹性"""
        return self.category_betas.get(category, self.global_beta)

    def elasticity_segment(self) -> str:
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2403.07571 — Proactive Recommendation with Iterative Preference Guidance

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：商品历史价格与销量（用于估参考价与弹性）、用户价格画像（历史购买价格、品类价格敏感系数）与折扣购买标记；粒度为用户 × 商品 × 促销活动。

**输出**：综合得分（价格效用、矩阵分解锚定与促销增益）与用户弹性分层标签（低/中/高），可用于前端展示逻辑差异化；供推荐与促销运营决定折扣展示对象。

## 执行步骤

1. 整理商品价格销量数据与用户价格画像
2. 估计用户级与品类级价格弹性参数
3. 用价格效用函数融合相关分做排序
4. 用逆概率加权去偏修正排序偏差
5. 输出折扣展示排序与分层推送名单

## 边界与不做

- 数据不满足：缺少历史价格-销量序列或折扣购买标记时估不准个体弹性。
- 何时不用：按价格档位排序用「价格感知个性化推荐」；有限资源发放队列用「Uplift 干预优先级队列」。
- 能力边界：只做排序与分层标签输出，不含前端展示改造与券系统对接。
- 安全边界：折扣展示须与真实促销一致，不得制造虚假原价；画像使用须符合个人信息保护要求。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR
- **可组合**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing、Skill-Price-Sensitive-Recommendation

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：05-推荐系统　·　源卡：`Skill-Price-Sensitive-Recommendation`