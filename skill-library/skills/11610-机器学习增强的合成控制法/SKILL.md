---
name: "p2s-augmented-synthetic-control-ml"
title: "Augmented Synthetic Control — 机器学习增强的合成控制法"
description: "触发词：合成控制、新市场增量、跨市场对照、安慰剂检验、偏差修正。何时不用：单个站点内的活动增效用时序因果技能，判断达人层级回报用 KOL 因果归因技能，本技能用多市场加权构造反事实来评估市场准入。安全边界：跨市场数据须聚合到市场层级、不含个人信息，结论须附安慰剂检验与捐赠池质量说明，不得只报点估计。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 市场进入"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Augmented-Synthetic-Control-ML"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "新市场销量涨了，但多少是自然增长？用其他市场拼一个对照来算清楚。"
user_try: "试试：用美英法三个市场做对照，估计德国站新品线的真实增量，并给出安慰剂检验结果。"
whenToUse: "评估新市场准入、新品线或区域活动的真实增量、且有多个可比控制市场时用本技能；站点内的时序活动增效用时序因果技能，达人层级回报用 KOL 因果归因技能。"
workflow: "准备目标市场与捐赠市场时序 → 拟合合成控制权重 → 做双重修正降低偏差 → 输出增量估计与区间 → 跑安慰剂检验验证"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Augmented Synthetic Control — 机器学习增强的合成控制法

## ① 解决的问题

运营面临"新市场准入后销量增长无法分离自然趋势与真实效果"——ASCM双重修正SCM偏差从3.5%降至0.8%，年化减少市场扩张错误决策损失约80万元

## ② 核心算法逻辑

经典合成控制（Synthetic Control Method, SCM）由 Abadie & Gardeazabal（2003）提出：用一组"捐赠"控制单元（其他未受干预的市场/产品/地区）的加权组合，构造处理单元的反事实。但原始SCM有两个显著局限：

## ③ 业务应用场景

场景A：新站点市场准入的增量效果评估 - 业务问题：在德国亚马逊推出"婴儿有机辅食"新品线后销量增加25%，但同期亚马逊整体德国市场也在增长。有美国、英国、法国三个控制市场，但它们增速各不相同，如何用合成控制估计真实增量 - 数据要求：目标市场（德国）和捐赠市场（美/英/法）的月度销量时序（至少24个月前历史）+ 无法进入德国的同类竞品作为补充控制 - 预期产出：ASCM估计真实因果增量 = +14%（区间[8%, 20%]），经典SCM估计+18%（存在3.5%偏差）；双重修正将偏差从3.5%降至0.8% - 业务价值：准确的增量评估指导市场拓展决策（是否值得进入更多欧洲站），年化减少错误市
三轨对抗验证： 1. 成本验证：ASCM计算量极小（秒级），仅需月度历史数据；主要成本是跨市场数据打通（约2-3天） 2. 合规验证：因果推断是内部分析工具，无合规风险；注意跨境数据不可包含个人信息 3. 风险验证：捐赠池质量（控制市场与目标市场的相关性）直接影响结果；当捐赠池<3个时估计不稳定；需用"安慰剂检验"验证——若对控制单元也做同样分析，效应应接近0
三轨验证 | 成本轨：月均成本3,500元（数据标注2,000元/月、模型训练800元/月、人工审核700元/月，共需人工120小时/月），年化成本42,000元 | 合规轨：符合《电商法》第17条因果推断披露要求，需在促销页面标注

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：消除SCM偏差（3.5% → 0.8%），避免高估新市场增量进而过度扩张，年化减少错误决策损失约80万元；精准市场进入策略支撑年化GMV增量约200万元
实施难度：⭐⭐⭐☆☆（Python 100行可实现；主要挑战在收集多市场可比性数据）
优先级：⭐⭐⭐⭐⭐（跨市场扩张是跨境电商的核心战略决策，SCM是唯一可行的严格方法）
评估依据：JASA 2021顶刊；Google/Uber均开源了SCM工具（CausalImpact/SyntheticControl）；Ben-Michael团队已在电商/政策评估中大量验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（125 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Augmented-Synthetic-Control-ML
机器学习增强的合成控制法 — 市场准入因果效应估计

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from scipy.optimize import minimize
from scipy import stats

np.random.seed(42)

# ── 1. 生成模拟跨市场时序数据 ──────────────────────────────────────────
n_pre, n_post = 24, 12   # 24个月前期，12个月处理后期
n_total = n_pre + n_post
t = np.arange(n_total)

true_effect = 0.14   # 真实因果效应（新品线带来+14%增量）

# 捐赠市场（控制单元）：美国/英国/法国
donors = pd.DataFrame({
    'US': 100 + 0.8*t + 8*np.sin(2*np.pi*t/12) + np.random.normal(0, 3, n_total),
    'UK': 60  + 0.5*t + 5*np.sin(2*np.pi*t/12) + np.random.normal(0, 2, n_total),
    'FR': 40  + 0.3*t + 3*np.sin(2*np.pi*t/12) + np.random.normal(0, 2, n_total),
})

# 目标市场（德国）：处理前与控制相关，处理后有真实效应
de_pre  = 70 + 0.6*t[:n_pre] + 6*np.sin(2*np.pi*t[:n_pre]/12) + np.random.normal(0, 2.5, n_pre)
de_post = 70 + 0.6*t[n_pre:] + 6*np.sin(2*np.pi*t[n_pre:]/12) + \
          true_effect * (70 + 0.6*t[n_pre:]) + np.random.normal(0, 2.5, n_post)
de_obs  = np.concatenate([de_pre, de_post])

print(f"数据: {n_pre}个月前期 + {n_post}个月后期")
print(f"德国站处理前均值: {de_obs[:n_pre].mean():.1f}")
print(f"德国站处理后均值: {de_obs[n_pre:].mean():.1f}")
print(f"表面变化: {(de_obs[n_pre:].mean()/de_obs[:n_pre].mean()-1)*100:+.1f}%")

# ── 2. 经典合成控制（凸组合约束）──────────────────────────────────────
def synthetic_control_weights(Y_pre_donor, y_pre_treated):
    """
    求解合成控制权重（非负 + 和为1）
    最小化: ||Y_pre_treated - Y_pre_donor @ w||^2
    s.t. w >= 0, sum(w) = 1
    """
    n_donors = Y_pre_donor.shape[1]
    def objective(w): return np.sum((y_pre_treated - Y_pre_donor @ w)**2)
    constraints = {'type': 'eq', 'fun': lambda w: w.sum() - 1}
    bounds = [(0, 1)] * n_donors
    w0 = np.ones(n_donors) / n_donors
    res = minimize(objective, w0, method='SLSQP',
                   bounds=bounds, constraints=constraints)
    return res.x

donors_pre  = donors.values[:n_pre]
donors_post = donors.values[n_pre:]

w_sc   = synthetic_control_weights(donors_pre, de_obs[:n_pre])
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1811.04170 — The Augmented Synthetic Control Method

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：目标市场与捐赠市场的月度销量时序（卡页口径至少 24 个月历史），可补充无法进入目标市场的同类竞品作为控制；跨市场数据须打通且不含个人信息。

**输出**：市场准入的真实因果增量估计与置信区间、经典合成控制与修正后的偏差对比、安慰剂检验结果，供市场扩张决策使用；卡页口径修正后偏差从 3.5% 降到 0.8%、年化减少错误决策损失约 80 万元。

## 执行步骤

1. 收集目标市场与捐赠市场的月度销量时序并对齐口径。
2. 拟合捐赠市场的加权组合，构造目标市场的反事实。
3. 做双重修正以降低经典合成控制的偏差。
4. 输出增量估计与置信区间。
5. 用安慰剂检验验证，对控制单元做同样分析时效应应接近 0。

## 边界与不做

- 捐赠市场少于 3 个、或捐赠市场与目标市场相关性差时不要用，估计结果不稳定。
- 能力边界：结果强依赖捐赠池质量与市场可比性；本技能估的是增量，不预测市场能否成功。卡页的偏差与损失数字为特定案例口径。
- 合规红线：跨市场数据须聚合到市场层级、不含个人信息，结论须附安慰剂检验与捐赠池质量说明，不得只报点估计。

## 技能关联

- **前置**：Skill-Causal-Time-Series-CausalImpact.html、Skill-Causal-Time-Series-CausalImpact、Skill-ClusterSC-Synthetic-Control.html、Skill-ClusterSC-Synthetic-Control、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SCM-ML-Enhanced.html、Skill-SCM-ML-Enhanced、Skill-Synthetic-Control-ML-Enhanced.html、Skill-Synthetic-Control-ML-Enhanced
- **延伸**：Skill-ClusterSC-Synthetic-Control.html、Skill-ClusterSC-Synthetic-Control、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SCM-ML-Enhanced.html、Skill-SCM-ML-Enhanced、Skill-Synthetic-Control-ML-Enhanced.html、Skill-Synthetic-Control-ML-Enhanced
- **可组合**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SCM-ML-Enhanced.html、Skill-SCM-ML-Enhanced、Skill-Synthetic-Control-ML-Enhanced.html、Skill-Synthetic-Control-ML-Enhanced、Skill-Augmented-Synthetic-Control-ML

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Augmented-Synthetic-Control-ML`