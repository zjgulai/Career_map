---
name: "p2s-causal-seo-search-attribution"
title: "搜索流量因果归因 — SEO排名提升的真实增量效果识别"
description: "触发词：搜索增量、排名提升效果、共同趋势剔除、关键词投入产出、SEO 预算分配。何时不用：搜索侧内容结构与特色摘要优化用零点击搜索优化技能，判断达人层级回报用 KOL 因果归因技能，本技能量化排名提升带来的真实流量增量。安全边界：关键词与流量数据须通过平台或授权工具获取，不得爬取受限数据，优化须符合平台内容政策、禁止关键词堆砌。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 内容策划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Causal-SEO-Search-Attribution"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "排名涨了流量也涨了，但多少是趋势、多少是优化带来的，分开算清楚。"
user_try: "试试：用未优化的同类词做对照，估算这次 Listing 优化的真实搜索增量。"
whenToUse: "需要判断 Listing 优化或关键词排名提升带来的真实流量增量、并给关键词排投入优先级时用本技能；搜索侧内容结构与摘要抢占用零点击搜索优化技能，达人层级回报用 KOL 因果归因技能。"
workflow: "收集优化前后的关键词排名与流量 → 选取未优化的同类词作控制组 → 做平行趋势检验 → 用双重差分估计真实增量 → 按因果投入产出排关键词优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 搜索流量因果归因 — SEO排名提升的真实增量效果识别

## ① 解决的问题

SEO团队面临"关键词排名提升后流量+22%但无法分离趋势混淆"——DiD去除共同趋势后真实增量+12%，年化SEO预算效率提升30%约60万元

## ② 核心算法逻辑

SEO归因的根本困难：关键词排名从第3位提升到第1位后，流量增加了35%——但多少是排名提升造成的，多少是该词本来在增长（季节性/品牌热度）？直接归因会系统性高估SEO工作的ROI。

## ③ 业务应用场景

场景A：Listing优化的真实SEO增量评估 - 业务问题：对婴儿推车做了Listing标题优化（加入更多关键词），有机搜索流量增加22%，但同期亚马逊整体流量也在增长，如何分离SEO贡献 - 数据要求：优化前后各30天的关键词排名+流量数据 + 未优化的同类词（控制组）+ 竞品同期数据 - 预期产出：DiD估计SEO真实增量 = +12%（非表面+22%），其中+10%是共同趋势；同时识别出"婴儿推车折叠"关键词的因果ROI最高（每提升1位增加月流量约200次） - 业务价值：精准量化SEO投入产出，避免将10%的共同趋势误算为SEO贡献；指导关键词投入优先级，年化SEO效率提升约30%（
三轨对抗验证： 1. 成本验证：DiD/CausalImpact计算完全免费（纯数据分析）；主要成本是收集关键词层面的对照数据（第三方SEO工具约200元/月） 2. 合规验证：SEO分析不涉及合规风险；注意亚马逊禁止"关键词堆砌"，优化需符合平台内容政策 3. 风险验证：控制组关键词选择不当（与优化组相关性不够高）会导致平行趋势假设失败；建议用优化前期数据做平行趋势检验（T检验，p>0.1则合格）
场景B：SEO vs 广告投入的效率对比 - 业务问题：运营总监要分配Q3预算，争论SEO还是广告更划算 - 方案：用CausalImpact分别评估SEO和广告投入的真实增量，计算每元投入的增量GMV - 业务价值：基于因果ROI而非观测ROI做预算决策，避免将趋势误归因，年化预算效率提升约25%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：精准量化SEO增量（去掉10-20%的趋势混淆），年化SEO预算效率提升约30%（约40万元增量）；指导关键词优先级投入，高ROI词增加投入，低ROI词缩减，年化综合约60万元
实施难度：⭐⭐☆☆☆（方法论直接复用DiD/CausalImpact；主要工作是收集关键词级别的日度数据，第三方工具可支持）
优先级：⭐⭐⭐⭐☆（搜索流量是母婴电商的最大有机流量来源；没有因果归因的SEO ROI计算必然高估）
评估依据：KDD 2022亚马逊搜索排名因果研究；Google官方搜索中心推荐DiD评估SEO效果；Airbnb/Booking.com均发表了SEO因果测量方法论博客

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（132 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Causal-SEO-Search-Attribution
搜索流量因果归因 — SEO优化真实增量估计

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import BayesianRidge
from scipy import stats

np.random.seed(42)

# ── 1. 生成模拟SEO数据 ──────────────────────────────────────────────
n_days    = 90
opt_day   = 45  # 第45天执行Listing优化

t = np.arange(n_days)

# 共同搜索趋势（影响所有关键词）
common_trend = 0.15 * t + 5 * np.sin(2*np.pi*t/365*2)

# 控制组：未优化的同类词（5个词）
control_kws = pd.DataFrame({
    f'ctrl_{i}': common_trend + np.random.normal(0, 5, n_days)
    for i in range(5)
})

# 处理组：目标关键词（有Listing优化，第45天起真实增量+12%）
true_seo_lift = 0.12
base_traffic  = 100 + common_trend
treated_traffic = (base_traffic
    + true_seo_lift * base_traffic * (t >= opt_day)  # 优化后的真实增量
    + np.random.normal(0, 8, n_days))

df = pd.DataFrame({'day': t, 'treated': treated_traffic})
for col in control_kws.columns:
    df[col] = control_kws[col]

# ── 2. 方法A：双重差分（DiD）─────────────────────────────────────────
pre  = t < opt_day
post = t >= opt_day

# 处理组前后变化
y_T_post = df['treated'][post].mean()
y_T_pre  = df['treated'][pre].mean()
delta_T  = y_T_post - y_T_pre

# 控制组前后变化（共同趋势）
ctrl_cols = [c for c in df.columns if c.startswith('ctrl_')]
y_C_post  = df[ctrl_cols][post].values.mean()
y_C_pre   = df[ctrl_cols][pre].values.mean()
delta_C   = y_C_post - y_C_pre

did_estimate = delta_T - delta_C  # DiD核心公式
did_pct      = did_estimate / y_T_pre

naive_estimate = delta_T
naive_pct      = naive_estimate / y_T_pre
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：优化前后各 30 天的关键词排名与流量数据、未优化的同类词作为控制组、竞品同期数据；关键词级日度数据可用第三方搜索工具获取。

**输出**：剔除共同趋势后的真实搜索增量（卡页案例表观 +22%、真实 +12%）、各关键词的因果投入产出与优先级清单，以及搜索与广告逐元增量对比；卡页口径年化综合约 60 万元。

## 执行步骤

1. 收集优化前后关键词的排名与流量日度数据。
2. 选取相关性高的未优化同类词作为控制组。
3. 用优化前期数据做平行趋势检验。
4. 用双重差分估计排名提升的真实增量。
5. 按因果投入产出排序关键词，调整投入优先级。

## 边界与不做

- 找不到相关性足够的控制组关键词时不要用，平行趋势假设不成立、结论会失真。
- 能力边界：本技能只剔除趋势混淆，不解释排名为何变化；卡页的提升幅度与效率收益为特定案例口径。
- 合规红线：关键词与流量数据须通过平台或授权工具获取，不得爬取受限数据；优化内容须符合平台内容政策，禁止关键词堆砌。

## 技能关联

- **前置**：Skill-Causal-Time-Series-CausalImpact.html、Skill-Causal-Time-Series-CausalImpact、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Double-Debiased-ML-Price.html、Skill-Double-Debiased-ML-Price、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **延伸**：Skill-Double-Debiased-ML-Price.html、Skill-Double-Debiased-ML-Price、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking
- **可组合**：Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Share-of-Voice-Tracking.html、Skill-Share-of-Voice-Tracking、Skill-Causal-SEO-Search-Attribution

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Causal-SEO-Search-Attribution`