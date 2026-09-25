---
name: "p2s-personalized-search-ranking"
title: "Personalized Search Ranking — 个性化搜索排名：用户历史驱动的搜索结果重排"
description: "触发词：个性化排序、用户画像、搜索 CVR、冷启动降级、差异化排序。何时不用：只优化排序指标本身而不依赖用户画像时用「NeuralNDCG 排序优化」；要联动搜索意图与推荐位时用「搜索意图感知推荐重排序」。安全边界：只做重排层，不改变召回集合。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Personalized-Search-Ranking"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "老用户搜同一个词想找配件，新用户想看整机，别再给他们同一版排序了。"
user_try: "试试：给老用户和新用户在同一搜索词下做差异化排序，并估算搜索转化率能提升多少。"
whenToUse: "当所有用户看到同一排序、老用户找不到配件或升级款、搜索转化率低于行业均值时用本技能；只优化排序指标本身，用「NeuralNDCG 排序优化」；要联动搜索意图与推荐位，用「搜索意图感知推荐重排序」。"
workflow: "汇总用户搜索与购买历史构建画像 → 计算查询与商品的文本相关性基础分 → 用 LTR 融合偏好与商品特征做重排 → 设冷启动降级并分用户段 A/B"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Personalized Search Ranking — 个性化搜索排名：用户历史驱动的搜索结果重排

## ① 解决的问题

独立站搜索"吸奶器"所有用户看同样排序导致CVR仅3.5%低于行业均值——用户历史偏好驱动的LTR个性化重排，老用户便携款和配件优先展示CVR从3.5%提升到5-7%年化增益10-30万元

## ② 核心算法逻辑

统一排名 vs 个性化排名：

## ③ 业务应用场景

业务问题：独立站月均 5,000 次搜索，搜索转化率 3.5%（低于行业 6-8% 均值）。分析发现：搜索"吸奶器"时，老用户（已购买便携款）和新用户看到完全一样的结果，老用户通常是来找配件/升级款，但被通用排序埋没了。
数据要求： - 用户搜索历史（查询词 + 点击商品） - 用户购买历史（品类偏好/价格档位） - 商品特征（标题/品类/评分/库存）
预期产出： - 个性化搜索排名模型 - 搜索 CVR 提升估计（A/B 测试对比） - 用户段差异化策略（新用户/老用户/高意图用户）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
搜索 CVR 提升（3.5% → 5-7%）：月增收 ¥3-8 万
用户满意度提升（搜索更精准）：长期留存提升
减少用户搜索放弃率：降低 bounce rate
年化综合 ROI：¥10-30 万
实施难度：⭐⭐⭐☆☆（需要用户行为数据和 LTR 模型；冷启动降级逻辑；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（155 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/recommendation/personalized_search_ranking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Personalized-Search-Ranking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Personalized Search Ranking
个性化搜索排名：用户历史 + LTR 模型
"""
import numpy as np
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class Product:
    """商品"""
    product_id: str
    title: str
    category: str
    price: float
    rating: float
    review_count: int
    in_stock: bool = True


@dataclass
class UserSearchProfile:
    """用户搜索画像"""
    user_id: str
    preferred_categories: dict   # {category: score}
    price_preference: float      # 0-1（越高越倾向高价）
    brand_preferences: dict      # {brand: affinity}
    search_history: list         # [(query, clicked_product_id, converted)]


def compute_text_relevance(query: str, product: Product) -> float:
    """简化的文本相关性评分（生产用BM25/BERT）"""
    query_terms = set(query.lower().split())
    title_terms = set(product.title.lower().split())
    category_terms = set(product.category.lower().split())

    # Jaccard + 品类匹配
    title_match = len(query_terms & title_terms) / max(len(query_terms | title_terms), 1)
    cat_match = len(query_terms & category_terms) / max(len(query_terms), 1)

    return 0.6 * title_match + 0.4 * cat_match


def compute_user_preference_score(user: UserSearchProfile, product: Product) -> float:
    """计算用户对商品的个性化偏好分"""
    # 品类偏好
    cat_score = user.preferred_categories.get(product.category, 0.3)

    # 价格契合度（用户价格偏好 vs 商品价格档位）
    max_price = 300.0
    price_tier = min(1.0, product.price / max_price)
    price_fit = 1 - abs(user.price_preference - price_tier)

    return 0.6 * cat_score + 0.4 * price_fit


def personalized_search_rank(query: str, products: list[Product],
                               user: UserSearchProfile | None,
                               alpha: float = 0.4, beta: float = 0.4,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.08126，但该号在 arXiv 上是《Towards a unified description of isotopic fragment properties in spontaneous and fusion-induced fission within a 4D dynamical Langevin model》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户搜索历史（查询词与点击商品）、购买历史（品类偏好、价格档位、品牌偏好）、商品特征（标题/品类/评分/库存）以及查询的文本相关性基础分；粒度为 用户 × 查询 × 候选商品。

**输出**：个性化重排后的搜索结果、分用户段（新用户/老用户/高意图）的差异化排序策略与 A/B 对比结论（卡页口径 CVR 3.5%→5-7%）；供搜索工程与运营使用。

## 执行步骤

1. 汇总用户搜索与购买历史，构建品类偏好、价格档位与品牌偏好画像
2. 计算查询与候选商品的文本相关性基础分
3. 用 LTR 融合相关性、用户偏好与商品特征做个性化重排
4. 设置冷启动降级逻辑：无历史用户退回通用排序
5. 分用户段做 A/B，评估 CVR 与搜索放弃率变化

## 边界与不做

- 数据不满足：无用户历史或搜索量过小时（卡页示例月均 5000 次搜索），个性化收益有限且无法分段验证。
- 何时不用：要优化的是排序指标本身而不依赖用户画像，用「NeuralNDCG 排序优化」；要解决的是搜索结果页推荐位与搜索意图脱节，用「搜索意图感知推荐重排序」。
- 能力边界：只做重排层，不改变召回；需处理冷启动与偏好漂移，不保证对所有用户段都提升；卡页的 CVR 5-7%、年化 10-30 万元为案例口径。

## 技能关联

- **前置**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal
- **延伸**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal
- **可组合**：Skill-Amazon-A10-Algorithm-Ranking.html、Skill-Amazon-A10-Algorithm-Ranking、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Personalized-Search-Ranking

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：05-推荐系统　·　源卡：`Skill-Personalized-Search-Ranking`