---
name: "p2s-search-ad-budget-roi-integration"
title: "自然搜索与广告预算联合优化 — 有机排名提升vs广告CPC的边际收益对比"
description: "触发词：自然排名、边际ROI对比、广告与SEO取舍、长尾词再分配、防御性投放。何时不用：拿不到自然排名数据或关键词数量过少时不适用；纯渠道级预算分配走多平台分配技能。安全边界：只做边际收益对比与分配建议，不操纵自然排名；削减广告预算时须保留防御性投放额度。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-Search-Ad-Budget-ROI-Integration"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "比较把词打上自然排名和直接买广告各自的边际收益，回答某个关键词还该不该继续投广告。"
user_try: "试试：新品防胀气奶瓶自然排名第15位，帮我算该加广告打到前5还是直接跑 SP 出单更划算。"
whenToUse: "当同一关键词既有自然排名又有付费投放、需要判断两者是否重复投入时用本卡；跨平台预算总量分配用多平台预算分配器；渠道边际 ROAS 排序用 ROAS 预算优化。"
workflow: "汇总关键词搜索量、自然排名、CPC、转化率与售价 → 用幂律模型估计各排名的自然 CTR 与提升一位的边际增益 → 分别计算广告侧与 SEO 侧的边际 ROI → 对自然排名已高的词削减广告并转投长尾词 → 保留防御性广告预算并输出每词分配建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 自然搜索与广告预算联合优化 — 有机排名提升vs广告CPC的边际收益对比

## ① 解决的问题

广告投手面临"不知道投广告提排名和直接出价各自的边际ROI哪个更高"——自然+付费联合边际收益对比将广告预算ROI提升19%，年化$8.4万效率增量

## ② 核心算法逻辑

母婴卖家普遍面临「双轨搜索」困局：一边花钱跑 SP 广告抢关键词排名，另一边又投入 SEO 资源做自然排名优化，两者预算相互独立，实际上存在重叠和替代关系。核心洞察：当自然排名已经足够靠前时，该关键词的广告边际收益趋近于零。

## ③ 业务应用场景

场景A：新品广告预算决策 - 业务问题：新品「防胀气奶瓶」自然排名第 15 位，要不要加广告把排名打到前 5？还是用这个预算跑 SP 直接出单？ - 数据要求：当前自然排名、历史 CPC 数据、搜索量代理估计、Listing 优化成本预估 - 预期产出：量化对比「广告 vs SEO」的边际 ROI，输出每个关键词的最优预算分配建议 - 业务价值：避免在自然排名已高的词上浪费广告预算，月均节省无效广告支出约 2-5 万元
三轨验证： - 成本：需采购第三方排名追踪工具（如 Helium 10，月费约 $79-399），每次关键词排名更新约消耗 0.5 人工小时；计算资源极低，单机 Python 即可运行。 - 合规：不涉及用户隐私数据，仅使用公开搜索排名和广告 CPC 数据；符合 Amazon 广告政策，不操纵排名。 - 风险：若过度削减广告预算，可能导致竞品抢占广告位，短期销量波动；建议保留 20% 广告预算作为防御性投放。
场景B：爆款商品广告缩减决策 - 业务问题：核心词自然排名稳定在 TOP3，是否可以减少该词广告投入，把预算转给长尾词？ - 数据要求：核心词自然排名历史趋势，广告贡献 CTR vs 自然 CTR 拆分数据 - 预期产出：建议核心词广告日预算从 500 元降到 150 元，节省预算投入长尾词，总 ROI 提升 25% - 业务价值：年化广告预算优化节省约 12-20 万元，同时维持或提升总曝光量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
直接节省：识别「自然排名已高但仍大量投广告」的词，月均节省无效广告支出 2-5 万元，年化 24-60 万元
预算再分配：节省的预算转向长尾词，总曝光量不降反升，年化 GMV 增量约 10-20 万元
决策效率：人工分析 200 个词需要 3 天，本算法 1 小时内完成，节省人工成本约 1.5 万元/季度
综合年化 ROI ≈ 40-86 万元
实施难度：⭐⭐☆☆☆（低，仅需自然排名数据 + 广告数据，无需 ML 模型）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（208 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_ad_budget_roi_integration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-Ad-Budget-ROI-Integration.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
自然搜索与广告预算联合优化
Organic Search Ranking + Paid Ads: Marginal ROI Budget Allocation
"""

import numpy as np
import matplotlib
matplotlib.use('Agg')  # 无 GUI 环境


# ─── 示例数据：关键词搜索环境 ───
KEYWORDS = [
    {
        "keyword": "anti colic bottle newborn",
        "monthly_search_vol": 45000,       # 月搜索量（代理估算）
        "current_organic_rank": 12,         # 当前自然排名
        "avg_cpc_usd": 0.85,               # 广告平均 CPC（美元）
        "conversion_rate": 0.045,           # 搜索→购买转化率
        "product_revenue_usd": 24.99,       # 商品售价
        "seo_cost_per_rank": 800,           # 每提升1位自然排名的成本（人力+资源，美元/月）
    },
    {
        "keyword": "overnight diapers toddler",
        "monthly_search_vol": 62000,
        "current_organic_rank": 3,          # 已是 TOP3
        "avg_cpc_usd": 1.20,
        "conversion_rate": 0.038,
        "product_revenue_usd": 34.99,
        "seo_cost_per_rank": 1200,
    },
    {
        "keyword": "baby bottle warmer",
        "monthly_search_vol": 28000,
        "current_organic_rank": 25,
        "avg_cpc_usd": 0.65,
        "conversion_rate": 0.033,
        "product_revenue_usd": 39.99,
        "seo_cost_per_rank": 600,
    },
]

GAMMA = 1.5   # 幂律衰减参数
A = 0.30      # 位置1的基准 CTR（母婴品类，30%）


def organic_ctr(rank: int, a: float = A, gamma: float = GAMMA) -> float:
    """幂律 CTR 模型"""
    if rank <= 0:
        return a
    return a / (rank ** gamma)


def marginal_ctr_gain(rank: int, a: float = A, gamma: float = GAMMA) -> float:
    """从 rank 提升1位的边际 CTR 增益"""
    if rank <= 1:
        return 0.0
    return organic_ctr(rank - 1, a, gamma) - organic_ctr(rank, a, gamma)


def compute_seo_marginal_roi(kw: dict) -> dict:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2402.14253，但该号在 arXiv 上是《MVD$^2$: Efficient Multiview 3D Reconstruction for Multiview Diffusion》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各关键词的月搜索量（代理估计）、当前自然排名、广告平均 CPC、搜索到购买的转化率、商品售价与每提升一位自然排名的成本，以及广告侧历史 CPC 与点击数据。

**输出**：每个关键词的广告与 SEO 边际 ROI 对比、建议的最优预算分配（含从高自然排名词转移到长尾词的具体金额）与防御性投放保留比例，供投放与内容团队执行。

## 执行步骤

1. 汇总关键词的搜索量、自然排名、平均 CPC、转化率与售价
2. 用幂律 CTR 模型估计各排名的自然点击率与提升一位的边际增益
3. 分别计算广告侧与 SEO 侧的边际 ROI 并对比
4. 对自然排名已靠前的关键词削减广告预算
5. 把释放预算转投长尾词并保留防御性投放额度
6. 输出每个关键词的最优预算分配建议

## 边界与不做

- 何时不用：拿不到自然排名数据、或关键词数量太少无法形成边际对比时不适用。
- 能力边界：只做边际收益对比与分配建议，不操纵自然排名，也不承诺排名提升；过度削减广告可能被竞品抢占广告位，须保留防御性投放额度。
- 数据边界：自然 CTR 由幂律模型估计，不同品类与站点需要重新校准参数。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Organic-Paid-Rank-Synergy-Model.html、Skill-Organic-Paid-Rank-Synergy-Model、Skill-Search-Aware-Recommendation-Reranking.html、Skill-Search-Aware-Recommendation-Reranking、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Autobidding-Budget-Allocation-Optimization.html、Skill-Autobidding-Budget-Allocation-Optimization、Skill-Search-Aware-Recommendation-Reranking.html、Skill-Search-Aware-Recommendation-Reranking、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity
- **可组合**：Skill-Search-Aware-Recommendation-Reranking.html、Skill-Search-Aware-Recommendation-Reranking、Skill-Search-Position-Click-Elasticity.html、Skill-Search-Position-Click-Elasticity、Skill-Search-Ad-Budget-ROI-Integration

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Ad-Budget-ROI-Integration`