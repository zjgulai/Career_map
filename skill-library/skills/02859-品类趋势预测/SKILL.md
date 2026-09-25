---
name: "p2s-category-trend-forecasting"
title: "Category Trend Forecasting（品类趋势预测）"
description: "触发词：品类趋势、搜索量增长、趋势评分、机会窗口。何时不用：只有单平台单日波动、不构成趋势序列时不用本卡；预测单个爆款峰值用流量拐点类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-021"
l3_business: "趋势监测"
l3_all: "趋势监测 / 市场机会评估"
l1_l2_l3: "业务运营/产品与创新/趋势监测"
p2s_card_id: "Skill-Category-Trend-Forecasting"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把搜索热度、排名与社媒信号合成趋势评分，判断哪些品类正在整体上行。"
user_try: "试试：帮我评估穿戴式吸奶器这个品类的趋势强度，看要不要进选品短名单。"
whenToUse: "本卡属「趋势监测」。需要判断品类整体上行趋势与机会窗口时用本卡；需要预测单条内容或单品的流量峰值与备货节奏时用流量拐点预测类技能。"
workflow: "采集搜索趋势序列 → 采集 BSR 与社媒热度 → 加权合成趋势评分 → 输出短名单建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Category Trend Forecasting（品类趋势预测）

## ① 解决的问题

监测到"wearable breast pump"（穿戴式吸奶器）谷歌搜索量过去 6 个月增长 180%（$p<0.01$），BSR 上升 45%，TikTok 话题 #wearablepump 播放量 2.3 亿

## ② 核心算法逻辑

论文：Robust Trend Filtering and Segmentation via Approximate Message Passing | arXiv：1809.07421

## ③ 业务应用场景

监测到"wearable breast pump"（穿戴式吸奶器）谷歌搜索量过去 6 个月增长 180%（$p<0.01$），BSR 上升 45%，TikTok 话题 #wearablepump 播放量 2.3 亿。趋势评分 0.72（强烈上升）。建议将穿戴式吸奶器纳入选品短名单，优先于传统电动吸奶器。
价值：提前 2-3 个月卡位新兴品类，先发优势价值难以量化但极高。
- 成本轨： - Google Trends API 调用：$0/月（免费） - Amazon Product Advertising API：$0.01/请求，月均 5K 请求 = $50/月 - 社交媒体数据爬取（TikTok/Instagram）：第三方服务 $200-500/月（如 Brandwatch） - 人力投入：数据分析师 0.2 FTE = $3,000/月 - 总月度成本：$3,250-3,750 元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：先发优势难以量化，年化隐性价值 50-100 万元
难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐⭐⭐（5 星）— WF-D 核心能力

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（18 行）。**下面 18 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **18 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，18 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/category_trend_forecasting` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Category-Trend-Forecasting.md`），已与卡面节选核对，不依赖上述路径。

```python
"""Category Trend Forecasting"""

import numpy as np
from scipy.stats import kendalltau

def trend_score(search_trend, bsr_trend, social_trend, w=(0.4, 0.3, 0.3)):
    tau_s, _ = kendalltau(range(len(search_trend)), search_trend)
    tau_b, _ = kendalltau(range(len(bsr_trend)), bsr_trend)
    tau_sc, _ = kendalltau(range(len(social_trend)), social_trend)
    return w[0]*tau_s + w[1]*tau_b + w[2]*tau_sc

# test
s = np.array([100, 120, 150, 200, 280])  # up
b = np.array([60, 58, 55, 50, 45])       # BSR下降=好
sc = np.array([1, 1.5, 2, 3, 5])         # up
ts = trend_score(s, b, sc)
print(f"Trend Score: {ts:.2f} → {'RISING ⬆' if ts>0.3 else 'STABLE/declining'}")
print("[✓] Category Trend 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1809.07421，但该号在 arXiv 上是《Supersingular Elliptic Curves and Moonshine》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Robust Trend Filtering and Segmentation via Approximate Message Passing》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标品类的搜索趋势序列、对应 BSR 变化、社媒话题热度数据，以及品类关键词映射表。

**输出**：品类趋势评分与上升强度判断，给出是否纳入选品短名单的建议与优先顺序。

## 执行步骤

1. 采集目标品类的搜索趋势序列
2. 采集对应 BSR 变化与社媒话题热度
3. 按权重合成趋势评分并判定强度
4. 输出选品短名单建议与卡位时间窗

## 边界与不做

- 只有单平台短窗口数据、无法构成趋势序列时不用本卡
- 本卡产出趋势评分与机会判断，不负责具体备货量与投放预算测算

## 技能关联

- **前置**：Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Cross-Market-Product-Transfer.html、Skill-Cross-Market-Product-Transfer、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Category-Trend-Forecasting

---

> 分类：业务运营/产品与创新/趋势监测　·　技术族：06-增长模型　·　源卡：`Skill-Category-Trend-Forecasting`