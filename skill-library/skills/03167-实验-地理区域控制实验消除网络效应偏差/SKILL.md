---
name: "p2s-geo-holdout-experiment"
title: "Geo Holdout实验 — 地理区域控制实验消除网络效应偏差"
description: "触发词：Geo实验、地理对照、DMA配对、增量测量、平台归因高估。何时不用：能做用户级随机分流时用A/B实验设计（更省成本、灵敏度更高）。安全边界：仅用聚合地区数据、不涉个人标识；控制组不投放前须确认平台条款（Meta允许Brand Lift、TikTok需白名单）。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 广告实验 / 预算分配"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Geo-Holdout-Experiment"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用有些地区投、有些地区不投的对照实验，测出广告真正带来的增量，戳破平台归因的高估。"
user_try: "试试：帮我按 DMA 配对设计一个 Geo Holdout，测一下婴儿推车 618 广告的真实增量。"
whenToUse: "当用户级 A/B 不可实施（平台条款限制分流、或网络效应与溢出太强）却仍要严格测量广告或 Deal 增量时用；若能做用户级随机分流，用「A/B 实验设计」类技能，成本更低、灵敏度更高。"
workflow: "收集 DMA 或州级历史销量并按均值与趋势做最近邻配对 → 从配对地区中随机指定处理组与控制组 → 处理组投放广告或 Deal，控制组不投或只维持最低投放量 → 用 Geo 双重差分估计增量效果与置信区间 → 对比平台归因数据并按真实增量重排预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Geo Holdout实验 — 地理区域控制实验消除网络效应偏差

## ① 解决的问题

市场团队面临"平台归因虚高23%实际增量仅11%导致广告预算严重误分配"——Geo地理控制实验揭示真实增量，年化优化广告预算效率约100万元

## ② 核心算法逻辑

Geo Holdout实验是当传统用户级A/B实验无法实施时（如平台不允许分流、或网络效应太强），用地理区域作为实验单位的控制实验。

## ③ 业务应用场景

场景A：社交媒体投放的真实增量测量 - 业务问题：在Instagram/TikTok投放了"婴儿推车618促销"广告，平台报告点击量和归因销量很好看，但CMO怀疑大部分是原来就会买的用户（触达偏差），要求验证真实增量 - 数据要求：按DMA（Nielsen designated market area）的历史销售数据（至少8周前期）+ 广告投放方案 - 预期产出：选择20个配对DMA，随机10个暴露广告（处理组），10个不投广告（控制组）。Geo DiD估计广告真实增量 = +8.3%（区间[4.1%, 12.5%]），而平台归因数据显示+23%（高估了14.7pp） - 业务价值：发现平台归
三轨验证： - 成本：需购买Nielsen DMA级销售数据（约$5,000-15,000/年），或自建ERP地区汇总；协调广告平台按DMA分区投放需额外人力（约2-3人周）；计算成本极低（单次实验< $10云资源） - 合规：不触碰GDPR（仅聚合数据，无个人标识）；不违反Amazon政策（非价格测试）；需注意广告平台服务条款中是否禁止"控制组不投放"（如Meta允许Brand Lift实验，TikTok需申请白名单） - 风险：控制组完全不投广告可能导致该地区市场份额短期流失给竞品（尤其长周期实验）；若实验泄露可能引发经销商不满（"为什么我们区域没有广告支持"）；建议控制组投放最低维持量而
场景B：亚马逊站内Deal效果评估（按国家/州） - 业务问题：亚马逊美国站计划对婴儿推车做Lightning Deal，但无法对同一ASIN做用户级A/B（违反ToS），需要评估Deal的真实增量 - 数据要求：按州级历史销售数据（12周前期）+ Deal排期表 - 预期产出：选择10对相似州（如加州vs德州，纽约vs佛州），处理组州做Deal，控制组州不做。Geo DiD估计Deal真实增量 = +15.2%（区间[8.7%, 21.7%]），而亚马逊后台"Deal效果报告"显示+35%（高估19.8pp） - 业务价值：发现Deal的"虚假繁荣"（大部分销量来自原本就会购买的顾客），优化

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：发现平台归因高估14.7pp，重新校准广告预算节省约40万元/年；准确的增量ROI使营销预算分配更优，年化效率提升约30%（约60万元）；综合约100万元/年
实施难度：⭐⭐⭐☆☆（配对匹配和DiD约100行代码；主要挑战在获取地区级历史销售数据和协调广告平台分区投放）
优先级：⭐⭐⭐⭐☆（02-AB实验域盲区填补；当用户级A/B无法实施时的唯一严格评估方法）
评估依据：Google 2015 JMR论文奠定方法论基础，引用量800+；P&G/Unilever/Amazon均使用Geo实验评估品牌广告；Meta/Google均提供Geo实验工具（Brand Lift）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（124 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Geo-Holdout-Experiment
地理区域控制实验 — 营销广告增量测量

依赖：pip install numpy pandas scipy
"""

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# ── 1. 生成多地区时序数据 ─────────────────────────────────────────────
n_regions  = 20   # 20个DMA市场
n_pre      = 8    # 8周前期数据（用于匹配和基线）
n_post     = 4    # 4周后期（实验期）
n_total    = n_pre + n_post

true_geo_effect = 0.083  # 真实增量8.3%

# 各区域基线销量（含区域固定效应 + 共同趋势）
region_baselines = np.random.uniform(100, 500, n_regions)
common_trend     = 0.05  # 每周0.5%增长

# 生成时序（含周季节性和噪声）
sales_matrix = np.zeros((n_regions, n_total))
for r in range(n_regions):
    base = region_baselines[r]
    for t in range(n_total):
        trend   = base * (1 + common_trend) ** t
        season  = 0.1 * base * np.sin(2*np.pi*t/4)
        noise   = np.random.normal(0, base * 0.05)
        sales_matrix[r, t] = trend + season + noise

# 前8周（Pre-period）
pre_sales = sales_matrix[:, :n_pre]

# ── 2. 配对匹配：按前期指标相似性配对 ─────────────────────────────────
def match_markets(pre_sales: np.ndarray) -> list[tuple]:
    """按前期均值和趋势配对（最近邻配对）"""
    metrics = np.column_stack([
        pre_sales.mean(axis=1),
        np.array([np.polyfit(range(pre_sales.shape[1]), pre_sales[r], 1)[0]
                  for r in range(pre_sales.shape[0])]),
    ])
    scaler = StandardScaler()
    metrics_sc = scaler.fit_transform(metrics)

    used = set()
    pairs = []
    for i in range(len(metrics_sc)):
        if i in used: continue
        dists = np.linalg.norm(metrics_sc - metrics_sc[i], axis=1)
        dists[list(used) + [i]] = np.inf
        j = dists.argmin()
        if j not in used:
            pairs.append((i, j))
            used.add(i); used.add(j)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：按 DMA（场景 A）或州级（场景 B）的历史销售数据，前期长度示例为 8 周（社交媒体投放）与 12 周（站内 Deal），外加广告投放方案或 Deal 排期表；实验期示例为 4 周，需覆盖完整投放周期。

**输出**：配对地区清单与处理/控制分配方案、Geo 双重差分的增量估计及置信区间、与平台归因数据的差值对照（卡页示例：真实 +8.3% 区间 [4.1%, 12.5%] 而平台归因 +23%），供预算再分配决策。

## 执行步骤

1. 收集 DMA/州级历史销量并做地区配对（按销量均值与趋势最近邻匹配）
2. 随机指定处理组与控制组（从配对地区中各取 10 个）
3. 处理组投放广告或 Deal，控制组不投或只维持最低投放量
4. 用 Geo 双重差分估计真实增量与置信区间
5. 对比平台归因数据并按真实增量重排预算

## 边界与不做

- 何时不用：能做用户级随机分流时不用（地区级实验成本更高、周期更长）；可用地区太少无法完成配对时也不适用。
- 能力边界：控制组完全不投放会造成该地区短期份额流向竞品，长周期实验还存在方案泄露与经销商沟通风险，卡页建议控制组保留最低投放量；本技能只产出增量结论，不执行投放与预算动作。
- 合规边界：仅使用聚合地区数据、不含个人标识；开跑前须确认广告平台条款是否允许控制组不投放（Meta 允许 Brand Lift、TikTok 需申请白名单）。

## 技能关联

- **前置**：Skill-Augmented-Synthetic-Control-ML.html、Skill-Augmented-Synthetic-Control-ML、Skill-Causal-Time-Series-CausalImpact.html、Skill-Causal-Time-Series-CausalImpact、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff
- **延伸**：Skill-Augmented-Synthetic-Control-ML.html、Skill-Augmented-Synthetic-Control-ML、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff、Skill-Geo-Holdout-Experiment

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：02-A_B实验　·　源卡：`Skill-Geo-Holdout-Experiment`