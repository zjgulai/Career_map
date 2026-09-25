---
name: "p2s-causal-time-series-causalimpact"
title: "CausalImpact时序因果 — 政策/活动对时序指标的因果冲击估计"
description: "触发词：活动增量、反事实预测、控制序列、促销复核、新品溢出效应。何时不用：需要以跨市场加权构造反事实评估市场准入用合成控制技能，做长周期结构分解用贝叶斯结构时序技能，本技能针对单次促销或上新窗口估计冲击增量。安全边界：对外使用效果提升表述须注明是统计估计而非精确值，控制序列与竞品数据须在授权范围内使用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Causal-Time-Series-CausalImpact"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "促销后销量涨了，用控制序列算出到底有多少是促销带来的。"
user_try: "试试：评估这次买赠促销的真实增量，用同类未促销的商品做控制序列。"
whenToUse: "单次促销、上新或投放结束后需要估计该干预的净冲击、并判断是否值得再投时用本技能；跨市场构造反事实用合成控制技能，长周期结构分解用贝叶斯结构时序技能。"
workflow: "准备干预前后目标序列与历史 → 选取未受干预的控制序列 → 拟合反事实并给区间 → 计算累计增量与显著性 → 据此停投或加大投入"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CausalImpact时序因果 — 政策/活动对时序指标的因果冲击估计

## ① 解决的问题

运营面临"促销后销量增加但无法分离趋势贡献与真实促销增量"——BSTS反事实模型将真实增量从表面+22%修正至+8%，精准ROI指导下年化优化约200万元

## ② 核心算法逻辑

核心问题：某次促销/上新/广告投放后，销量确实增加了——但有多少是该干预造成的，有多少是自然趋势？

## ③ 业务应用场景

场景A：促销活动的真实增量效果评估 - 业务问题：婴儿推车做了一次"买赠"促销活动（持续14天），销量从日均50件增至70件，但同期整体品类也在增长。运营想知道促销本身带来了多少增量 - 数据要求：目标SKU的日销量时序（至少60天历史+14天干预期）+ 控制序列（同类别其他SKU销量、搜索指数、类目流量——未参与促销的同类竞品） - 预期产出：CausalImpact报告：平均每日真实增量 = 8件（区间[5, 11]），累计增量 = 112件；相对效应 = +16%（非表面的+40%）；贝叶斯p值 = 0.003（效果显著） - 业务价值：避免高估促销ROI，精准计算增量GMV；若增量不显
三轨对抗验证： 1. 成本验证：BSTS模型计算量小（1000条数据约2秒），无GPU需求；主要成本是找到合适的控制变量序列（需2-3天数据整理） 2. 合规验证：CausalImpact是内部分析工具，无平台合规风险；对外宣传"效果提升X%"时需注明是统计估计而非精确值 3. 风险验证：控制变量选择不当（如选了同样参与促销的竞品）会污染因果估计；需确保控制序列在干预期未受相同干预影响；BSTS在时序较短（<30天）时后验不稳定
场景B：新品上市对整体品类流量的冲击 - 业务问题：推出新款婴儿监护器，上市2周后整体店铺流量增加15%，想量化新品上市对存量SKU的"拉客"效应 - 数据要求：各SKU流量时序 + 同期竞争对手流量（控制外部趋势） - 预期产出：新品带动存量SKU流量净增量 = +7%（区间[3%, 11%]），确认新品具有正溢出效应

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：识别真实ROI不足的促销活动（历史上约30%的活动实际增量<5%），停止这些活动节省约50万元/年；精准量化有效活动的增量，为加大投入提供依据，潜在GMV增量约150万元/年
实施难度：⭐⭐☆☆☆（CausalImpact库开箱即用；主要挑战是找到合适的控制变量序列）
优先级：⭐⭐⭐⭐⭐（每次大促/新品上市后必用，替代主观的"前后对比"分析，是最高频因果推断工具）
评估依据：Google 2015年在Annals of Applied Statistics发表，已被Booking.com/Twitter/Lyft等广泛采用；Python `causalimpact` 库GitHub 1k+ stars，工业级成熟

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（117 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Causal-Time-Series-CausalImpact
贝叶斯结构时序因果冲击估计 — 促销活动真实增量

依赖：pip install numpy pandas scipy scikit-learn
注意：完整CausalImpact可用 causalimpact 库 (pip install causalimpact)
此处为核心算法的简化实现（状态空间模型+反事实预测）
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import BayesianRidge
from scipy import stats

np.random.seed(42)

# ── 1. 生成模拟时序数据 ──────────────────────────────────────────────
n_pre   = 60  # 干预前60天
n_post  = 14  # 干预期14天
n_total = n_pre + n_post

t = np.arange(n_total)

# 控制变量（未受干预的相关序列，如竞品流量）
control_series = (50
    + 0.1 * t                                       # 上升趋势
    + 8 * np.sin(2*np.pi*t/7)                       # 周季节性
    + np.random.normal(0, 3, n_total))

# 目标序列（促销前与控制正相关；促销期有真实增量）
true_causal_effect = 8.0  # 每天真实增量8件
target_base = (
    1.2 * control_series[:n_pre] / 50 * 50          # 与控制相关
    + 0.2 * t[:n_pre]
    + np.random.normal(0, 4, n_pre))
target_post = (
    1.2 * control_series[n_pre:] / 50 * 50
    + 0.2 * t[n_pre:]
    + true_causal_effect                             # 叠加真实效应
    + np.random.normal(0, 4, n_post))
target_series = np.concatenate([target_base, target_post])

df = pd.DataFrame({
    'y':       target_series,
    'control': control_series,
    't':       t,
    'sin7':    np.sin(2*np.pi*t/7),
    'cos7':    np.cos(2*np.pi*t/7),
})

print(f"数据集: {n_pre}天预训练 + {n_post}天干预期")
print(f"干预前目标均值: {df['y'][:n_pre].mean():.1f}")
print(f"干预期目标均值: {df['y'][n_pre:].mean():.1f}")
print(f"表面变化: {df['y'][n_pre:].mean() - df['y'][:n_pre].mean():+.1f}/天")

# ── 2. 贝叶斯回归反事实模型 ──────────────────────────────────────────
# 在预训练期拟合目标序列与控制变量的关系
X_pre = df[['control', 't', 'sin7', 'cos7']].values[:n_pre]
y_pre = df['y'].values[:n_pre]
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标商品的日销量时序（卡页口径至少 60 天历史加 14 天干预期）与控制序列（同类别未参与促销的其他商品、搜索指数、类目流量），控制序列在干预期不得受相同干预。

**输出**：平均每日真实增量与置信区间、累计增量、相对效应与显著性判定（卡页示例为日均增量 8 件、区间 5-11 件、相对效应 +16%），以及活动是否值得复投的结论；卡页口径年化可节省约 50 万元无效投放。

## 执行步骤

1. 准备目标序列的干预前后历史数据。
2. 选取在干预期未受相同干预的控制序列。
3. 拟合反事实预测并给出置信区间。
4. 计算累计增量与相对效应并判断显著性。
5. 按结论决定停止还是加大该活动投入。

## 边界与不做

- 控制序列选到了同样参与促销的对象、或历史短于 30 天时不要用，估计会被污染或不稳定。
- 能力边界：模型给出的是干预窗口内的增量估计，不解释长期留存影响；卡页的回报与节省金额为特定口径，对外宣传须注明是统计估计。
- 合规红线：对外使用效果提升之类表述须注明为统计估计而非精确值，涉用户与竞品数据须在授权范围内使用。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Conformal-Time-Series-Forecasting.html、Skill-Conformal-Time-Series-Forecasting、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Conformal-Time-Series-Forecasting.html、Skill-Conformal-Time-Series-Forecasting、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-Conformal-Time-Series-Forecasting.html、Skill-Conformal-Time-Series-Forecasting、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-Causal-Time-Series-CausalImpact

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Time-Series-CausalImpact`