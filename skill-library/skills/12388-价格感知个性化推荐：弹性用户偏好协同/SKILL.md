---
name: "p2s-price-sensitive-personalized-recommendation"
title: "Price-Sensitive Personalized Recommendation — 价格感知个性化推荐：弹性×用户偏好协同"
description: "触发词：价格感知推荐、推荐重排、价格档位、舒适度分、首页排序、转化提升。何时不用：要按个体支付意愿直接定展示价用「个性化 ML 定价」；促销期按折扣响应排序用「营销活动驱动的推荐系统」。安全边界：价格档位只用于排序而非定价歧视，用户画像使用须符合个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Price-Sensitive-Personalized-Recommendation"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "别给高端用户推 49 美元、给敏感用户推 299 美元：按价格舒适度重排首页，转化率自然上来。"
user_try: "试试：我有用户历史购买记录和商品价格，帮我给访客分价格档位，再重排一版首页推荐顺序。"
whenToUse: "当推荐排序忽略价格匹配、导致高预算用户看到低价品或价格敏感用户被推超预算品时用本技能；若要对用户直接展示差异化价格，用「个性化 ML 定价」；若排序目标是促销折扣响应，用「营销活动驱动的推荐系统」。"
workflow: "汇总用户历史购买记录与商品价格、属性数据 → 用敏感度估计函数给用户划分价格档位 → 计算候选商品与用户习惯价格的舒适度分 → 按价格感知权重与评论质量权重重排候选列表 → 设计价格感知推荐与传统推荐的 A/B 对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price-Sensitive Personalized Recommendation — 价格感知个性化推荐：弹性×用户偏好协同

## ① 解决的问题

独立站首页推荐对高端用户推49美元低价品对价格敏感用户推299美元高端品导致CVR仅3.2%——价格感知推荐按用户历史购买价格档位差异化排序，CVR提升到5-6%年化增收30-80万元

## ② 核心算法逻辑

传统协同过滤：只考虑用户商品交互矩阵。价格感知推荐额外建模：

## ③ 业务应用场景

业务问题：独立站首页推荐对所有访客展示相同的热销排行。实际上，历史购买均价 $200+ 的用户不应该被推荐 $49 的入门款（转化率极低），而历史均价 $50 的用户看到 $299 产品大概率流失。
数据要求： - 用户历史购买记录（商品ID/价格/购买时间） - 商品属性（价格/品类） - 商品评论情感汇总（来自 VOC 分析）
预期产出： - 用户价格档位分类：低（<$50）/中（$50-150）/高（>$150） - 差异化首页推荐：每类用户的最优价格区间商品集 - A/B 测试设计：价格感知 vs 传统推荐的 CVR 对比

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
推荐 CVR 提升（价格匹配度提升）：从 3.2% → 5-6%，月增收 ¥8-20 万
减少高端用户被推低价品的"品牌稀释"：提升用户 LTV
减少价格敏感用户被推超预算品的跳出率：独立站 bounce rate 降低
年化综合 ROI：¥30-80 万
实施难度：⭐⭐⭐☆☆（需要用户购买历史 + 推荐系统接口改造；约 3-4 周工程量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（122 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/pricing/price_sensitive_personalized_recommendation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Price-Sensitive-Personalized-Recommendation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Price-Sensitive Personalized Recommendation
价格感知×协同过滤×VOC评论 三层融合推荐
"""
import numpy as np
from collections import defaultdict


def estimate_user_price_sensitivity(purchase_history: list) -> dict:
    """
    从用户购买历史估计价格敏感度档位
    返回: {user_id: {'avg_price': X, 'std_price': X, 'tier': 'low/mid/high'}}
    """
    user_stats = defaultdict(list)
    for record in purchase_history:
        user_stats[record['user_id']].append(record['price'])

    profiles = {}
    for user_id, prices in user_stats.items():
        avg = np.mean(prices)
        std = np.std(prices)
        tier = 'high' if avg > 150 else ('mid' if avg > 60 else 'low')
        profiles[user_id] = {'avg_price': round(avg, 2), 'std_price': round(std, 2), 'tier': tier}
    return profiles


def price_comfort_score(user_avg_price: float, item_price: float,
                        user_std: float = 30.0) -> float:
    """
    计算用户对商品价格的舒适度分（0-1）
    偏离用户习惯价格越多，分越低
    """
    if user_std < 1:
        user_std = user_avg_price * 0.3
    z = abs(item_price - user_avg_price) / (user_std + 1e-8)
    # 使用半高斯（偏高价格惩罚更大）
    if item_price > user_avg_price:
        z *= 1.5  # 价格过高惩罚更强
    return float(np.exp(-0.5 * z * z))


def price_sensitive_rerank(
    candidates: list,
    user_profile: dict,
    alpha: float = 0.4,   # 价格感知权重
    beta: float = 0.2,    # VOC评论质量权重
) -> list:
    """
    价格感知推荐重排
    candidates: [{'item_id', 'base_score', 'price', 'voc_score'}]
    user_profile: {'avg_price', 'std_price', 'tier'}
    """
    results = []
    for item in candidates:
        base = item['base_score']
        price_score = price_comfort_score(
            user_profile['avg_price'],
            item['price'],
            user_profile['std_price']
        )
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.12983，但该号在 arXiv 上是《Lopsidedness in Early-Type Galaxies: the role of the $m=1$ multipole in Isophote Fitting and Strong Lens Modelling》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户历史购买记录（商品 ID、价格、购买时间）、商品属性（价格、品类）与商品评论情感汇总（来自 VOC 分析）；粒度为用户 × 候选商品集合。

**输出**：用户价格档位画像、每位访客的差异化推荐排序与各档位的最优价格区间商品集，以及 A/B 对比设计；供推荐系统与独立站运营使用。

## 执行步骤

1. 汇总用户历史购买记录与商品价格属性
2. 按历史购买价格给用户划分价格档位
3. 计算候选商品与用户习惯价格的舒适度分
4. 按价格与质量权重对候选商品重排
5. 设计价格感知与传统推荐的 A/B 对比

## 边界与不做

- 数据不满足：没有用户历史购买价格时不适用，新用户可先用默认档位观察。
- 何时不用：直接差异化定价用「个性化 ML 定价」；促销折扣响应排序用「营销活动驱动的推荐系统」。
- 能力边界：只做排序与档位画像，不含推荐系统接口改造与商品池运营。
- 安全边界：价格档位只用于排序，不得演变为价格歧视；用户画像使用须符合个人信息保护要求。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis
- **延伸**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis
- **可组合**：Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-VOC-Price-Signal-Analysis.html、Skill-VOC-Price-Signal-Analysis、Skill-Price-Sensitive-Personalized-Recommendation

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Price-Sensitive-Personalized-Recommendation`