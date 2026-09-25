---
name: "p2s-competitor-product-intelligence"
title: "Competitor Product Intelligence（竞品选品监测）"
description: "触发词：竞品新品监测、SKU 异常检测、跟进选品、价格战识别、BSR 监控。何时不用：要预测竞品尚未上架的新品用「Competitor New Product Detection」；要 7×24 监控价格与 Listing 变化用「多 Agent 竞品情报系统」。安全边界：只采集竞品公开数据，不得使用侵权或非授权渠道；跟进选品不得照抄竞品设计或 Listing。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-020"
l3_business: "竞品研究"
l3_all: "竞品研究 / 趋势监测"
l1_l2_l3: "业务运营/产品与创新/竞品研究"
p2s_card_id: "Skill-Competitor-Product-Intelligence"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "盯着竞品密集上线的新 SKU 和它们的排名走势，判断哪些是新兴的高需求配件品类，再决定要不要跟进开发。"
user_try: "试试：分析 Momcozy 最近这批新 SKU 的上线密度和 BSR 走势，判断哪个配件品类值得跟进。"
whenToUse: "竞品已经上新、需要判断新 SKU 是否代表新兴需求并评估跟进价值时用本技能；若要提前预测还没上架的新品，用「Competitor New Product Detection」；若要持续监控价格与 Listing 变动，用「多 Agent 竞品情报系统」。"
workflow: "采集竞品新上线 SKU 的 BSR、评论数与价格数据 → 用异常检测识别密集上新与排名异常 → 估算新 SKU 的 30 天成功概率 → 判断是否出现集体降价的价格战迹象 → 输出跟进选品建议与差异化方向"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Competitor Product Intelligence（竞品选品监测）

## ① 解决的问题

监测到竞品 Momcozy 密集上线 5 个"Silicon Flange"（硅胶法兰）新 SKU，且上线 2 周内均进入 BSR Top 5000

## ② 核心算法逻辑

论文：Outlier Detection for Temporal Data with Applications to Ecommerce Product Monitoring | arXiv：1802.03426

## ③ 业务应用场景

监测到竞品 Momcozy 密集上线 5 个"Silicon Flange"（硅胶法兰）新 SKU，且上线 2 周内均进入 BSR Top 5000。推断硅胶法兰是新兴高需求配件品类。我们跟进开发类似产品，3 个月后上线，月销 2000+ 件。
三轨验证： - 成本轨：数据采集费用 $800-1200/月（第三方竞品监测工具如 Keepa/Helium10），计算资源 $200/月（云端异常检测模型），人力投入 40h/月（$2000），总计 $3000-3400/月 - 合规轨：✅ 完全合规。竞品公开数据采集不违反 Amazon ToS；无涉及个人数据，符合 GDPR；选品跟进属正常商业竞争，不违反《反不正当竞争法》 - 风险轨：⚠️ 中等风险。(1) 引发竞品价格战概率 35%（若跟进产品定价过激），(2) 平台审查风险 8%（若大量跟进同一品类被判定为侵权），(3) 品牌差异化丧失风险 20%（跟风产品易陷入红海），建议通过产品

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：跟对竞品选品方向，月增 $30-60K；年化 35-70 万元
难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐⭐☆（4 星）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（16 行）。**下面 16 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **16 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，16 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/competitor_product_intelligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Competitor-Product-Intelligence.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Competitor Product Intelligence"""

import numpy as np

def new_sku_success_prob(bsr_at_30d, review_count_30d, price_competitive=True):
    prob = 1 / (1 + np.exp(-(np.log1p(5000/max(bsr_at_30d,1)) + review_count_30d/50 + (0.5 if price_competitive else 0))))
    return min(prob, 0.95)

def detect_price_war(comp_prices_history: np.ndarray, n_comps: int = 3, drop_pct: float = 0.15):
    recent_drops = sum(1 for prices in comp_prices_history 
                       if (prices[0]-prices[-1])/prices[0] > drop_pct)
    return {'price_war': recent_drops >= n_comps, 'n_dropping': recent_drops}

# test
print(f"New SKU success prob: {new_sku_success_prob(bsr_at_30d=3000, review_count_30d=45):.0%}")
print("[✓] Competitor Intelligence 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1802.03426，但该号在 arXiv 上是《UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Outlier Detection for Temporal Data with Applications to Ecommerce Product Monitoring》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：竞品 SKU 监测数据：新上线 SKU 的 BSR、30 天评论数、价格与价格历史（用于价格战识别），以及品类内竞品数量。

**输出**：新兴品类判断与跟进建议：新 SKU 的成功概率估算、价格战识别结果、跟进开发方向与差异化建议。

## 执行步骤

1. 采集竞品新 SKU 的 BSR、评论数与价格数据
2. 用异常检测识别密集上新与排名异常
3. 估算新 SKU 的 30 天成功概率
4. 检测竞品价格是否出现集体下跌
5. 输出跟进选品与差异化建议

## 边界与不做

- 竞品数据量不足、或只有单一时点数据时不适用，异常检测无从建立基线
- 输出的是跟进方向的概率与建议，不含专利与设计侵权排查，也不含成本核算
- 只采集竞品公开数据，不得使用侵权或非授权渠道；跟进时不得照抄竞品设计与 Listing

## 技能关联

- **前置**：Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitive-Price-Monitoring.html、Skill-Competitive-Price-Monitoring、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model
- **可组合**：Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-Competitor-Product-Intelligence

---

> 分类：业务运营/产品与创新/竞品研究　·　技术族：06-增长模型　·　源卡：`Skill-Competitor-Product-Intelligence`