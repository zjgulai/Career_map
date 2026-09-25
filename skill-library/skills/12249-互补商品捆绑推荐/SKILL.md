---
name: "p2s-bundle-recommendation-complementary"
title: "Bundle Recommendation Complementary — 互补商品捆绑推荐"
description: "触发词：互补捆绑推荐、关联购买率、共购矩阵、类目差异度、礼盒组合、套餐选品。何时不用：要给捆绑包定价用「Bundle Pricing Strategy」或「Dynamic Bundle Pricing」，要做不限组合的个性化排序推荐用「GNN Ecommerce Recommendation」；本技能只挑互补组合、不定价。安全边界：捆绑价须符合平台促销规则且不得低于平台最低价政策，组合方案须人工确认后上架。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-079"
l3_business: "组合设计"
l3_all: "组合设计 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/组合设计"
p2s_card_id: "Skill-Bundle-Recommendation-Complementary"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "从真实共购记录里找出真正互补的商品组合，让详情页推荐不再是同品类热销榜，从而抬高客单价、降低礼盒退货。"
user_try: "试试：这是 6 个月的订单-SKU 共购日志和商品类目树，帮我给奶粉详情页配一套互补捆绑组合，并说明为什么不是「奶瓶+奶瓶」这种冗余搭配。"
whenToUse: "有 3-6 个月共购日志与商品类目树（或用 TikTok 购物车共现数据与商品属性标签），要挑互补商品组合做套餐或礼盒时用；要给捆绑包定价用「Bundle Pricing Strategy」或「Dynamic Bundle Pricing」，要做不带组合约束的个性化推荐排序用「GNN Ecommerce Recommendation」。"
workflow: "从订单列表构建商品对共购矩阵 → 用共购频率乘类目差异度算互补性得分（同类目打 0.5 折） → 对给定商品挑出得分最高的候选组成捆绑组合 → 在详情页或礼盒场景落地，对比关联购买率、AOV 与退货率 → 按月重训互补关系，冷启动 SKU 回退到类目规则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Bundle Recommendation Complementary — 互补商品捆绑推荐

## ① 解决的问题

运营面临"奶粉详情页客单价低、关联购买率仅12%"——互补图神经网络捆绑推荐将AOV提升35%、关联购买率改善至28%，年化增量GMV约96万元

## ② 核心算法逻辑

捆绑推荐（Bundle Recommendation）的核心挑战：捆绑内商品的互补关系建模。传统协同过滤忽略商品语义互补，导致推荐的组合缺乏协同价值。

## ③ 业务应用场景

场景1：Amazon 奶粉 + 奶瓶套餐捆绑推荐 - 业务问题：奶粉详情页转化率 8%，单品推荐关联销售弱，客单价低 - 数据要求：6 个月内共购日志（订单-SKU 矩阵）、商品类目树、用户历史评分 - 预期产出：互补捆绑 CTR 提升 22%，捆绑订单 AOV（客单价）提升 35%，关联购买率从 12% 升至 28% - 业务价值：单 ASIN 月均额外捆绑收入约 8 万元；年化贡献 ~96 万元
场景2：TikTok Shop 婴儿护理礼盒策划 - 业务问题：节日礼盒 SKU 组合靠人工经验，常出现"奶瓶 + 奶瓶"冗余组合 - 数据要求：TikTok 购物车共现数据、商品属性标签（功能/年龄段） - 预期产出：礼盒退货率从 18% 降至 9%，礼盒复购率提升 15% - 业务价值：退货成本节省约 12 万元/年
**三轨验证**： - 成本：GNN 训练日均 GPU 成本约 $30（单机），在线推理延迟 <50ms - 合规：捆绑价需符合平台促销规则，不得低于平台最低价政策 - 风险：互补关系随季节变动，需月度重训；冷启动 SKU 需 fallback 到类目规则

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：捆绑推荐 AOV 提升 30-40%，关联转化率提升 15-25%；以月 GMV 100 万计，增量约 15-25 万/月，年化 180-300 万
实施难度：⭐⭐⭐☆☆（需共购数据+类目树，无需复杂基础设施）
优先级：⭐⭐⭐⭐☆
评估依据：母婴品类天然存在互补关系（奶粉-奶瓶-消毒），捆绑策略是客单价提升最直接手段；数据门槛低，3 个月历史订单即可启动

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（79 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict

# ============================================================
# Bundle Recommendation: 互补商品捆绑推荐（简化版GNN）
# ============================================================

def build_complement_matrix(orders: list[list[str]]) -> dict:
    """从订单列表构建商品互补共购矩阵"""
    co_purchase = defaultdict(int)
    for order in orders:
        items = list(set(order))
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                pair = tuple(sorted([items[i], items[j]]))
                co_purchase[pair] += 1
    return dict(co_purchase)

def compute_complement_score(item_a: str, item_b: str,
                              co_matrix: dict,
                              category_map: dict) -> float:
    """互补性得分：共购频率 × 类目差异度"""
    pair = tuple(sorted([item_a, item_b]))
    freq = co_matrix.get(pair, 0)
    # 类目相同=替代品，不同=互补品
    same_cat = int(category_map.get(item_a) == category_map.get(item_b))
    diversity_bonus = 1.0 - 0.5 * same_cat  # 同类目打0.5折
    return freq * diversity_bonus

def recommend_bundle(user_item: str,
                     candidate_items: list[str],
                     co_matrix: dict,
                     category_map: dict,
                     bundle_size: int = 3) -> list[str]:
    """给定用户感兴趣商品，推荐最佳捆绑组合"""
    scores = []
    for candidate in candidate_items:
        if candidate == user_item:
            continue
        score = compute_complement_score(
            user_item, candidate, co_matrix, category_map
        )
        scores.append((candidate, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [item for item, _ in scores[: bundle_size - 1]]

# ---------- 示例数据（母婴品类） ----------
orders = [
    ["奶粉A", "奶瓶B", "奶嘴C"],
    ["奶粉A", "奶瓶D", "消毒锅E"],
    ["奶粉A", "奶嘴C"],
    ["奶瓶B", "奶嘴C", "奶嘴F"],
    ["尿布G", "湿巾H", "尿布桶I"],
    ["尿布G", "湿巾H"],
    ["奶粉A", "尿布G", "湿巾H"],
]

category_map = {
    "奶粉A": "奶粉", "奶瓶B": "奶瓶", "奶瓶D": "奶瓶",
    "奶嘴C": "奶嘴", "奶嘴F": "奶嘴", "消毒锅E": "消毒",
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.09058，但该号在 arXiv 上是《Stellar Population Astrophysics (SPA) with TNG, Fluorine abundances in seven open clusters》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：订单级共购数据：订单-商品对（模板为订单内 SKU 列表），时间跨度卡页建议 3-6 个月；商品侧要类目树与属性标签（功能／年龄段），以及用户历史评分；TikTok 场景用购物车共现数据。卡页口径为 3 个月历史订单即可启动，冷启动 SKU 缺共购记录时只能回退类目规则。

**输出**：商品对级与组合级产出：共购矩阵、商品对互补性得分、给定商品的 Top 捆绑组合（bundle_size 默认 3）；业务侧对应关联购买率、AOV 与礼盒退货率的前后对比，以及可直接上架的套餐／礼盒组合清单；供详情页运营与礼盒策划使用。

## 执行步骤

1. 把订单内的 SKU 列表展开成商品对共购矩阵
2. 按共购频率乘类目差异度给商品对打互补性得分
3. 对目标商品挑出得分最高的候选组成捆绑组合
4. 输出推荐组合清单并对齐客单价、关联购买率与退货率指标
5. 标注需月度重训的互补关系与冷启动 SKU 的类目规则回退

## 边界与不做

- 数据不满足：没有足够共购日志（卡页口径为至少 3 个月历史订单）或没有类目树时不要用——冷启动 SKU 先回退类目规则，否则组合没有依据。
- 何时不用：要给捆绑包定价用「Bundle Pricing Strategy」或「Dynamic Bundle Pricing」，要做不带组合约束的个性化推荐排序用「GNN Ecommerce Recommendation」。
- 能力边界：只负责挑互补组合与推荐组合，不改价、不代替上架套餐；互补关系随季节变动需月度重训，卡页指标（CTR +22%、AOV +35%、关联购买率 12%→28%、年化约 96 万与 180-300 万区间）为估算口径，落地须用本店实际数据重算。
- 安全边界：捆绑价须符合平台促销规则、不得低于平台最低价政策，方案须人工确认后上架。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Price-Sensitive-Recommendation.html、Skill-Price-Sensitive-Recommendation、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Diversity-Reranking-SMMR.html、Skill-Diversity-Reranking-SMMR、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Price-Sensitive-Recommendation.html、Skill-Price-Sensitive-Recommendation、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer、Skill-Bundle-Recommendation-Complementary

---

> 分类：业务运营/渠道经营/组合设计　·　技术族：05-推荐系统　·　源卡：`Skill-Bundle-Recommendation-Complementary`