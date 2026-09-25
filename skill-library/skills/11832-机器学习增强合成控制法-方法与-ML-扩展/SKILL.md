---
name: "p2s-synthetic-control-ml-enhanced"
title: "机器学习增强合成控制法 — Doudchenko & Imbens 方法与 ML 扩展"
description: "触发词：合成控制、ML增强、算法冲击、政策评估、安慰剂检验。何时不用：控制单元少于5个或预处理期不足干预期3倍时权重不稳；能构造可比对照时DiD更简单。安全边界：仅使用汇总的类目/市场级时序数据，不使用个体用户数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 渠道经营分析"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Synthetic-Control-ML-Enhanced"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "用未受影响的类目或市场合成一条反事实曲线，把平台算法与政策冲击造成的销量损失量出来。"
user_try: "试试：A9 算法更新后推车类目销量异动，帮我分出多少是算法影响、多少是季节性。"
whenToUse: "当平台算法调整、海关或入仓政策变化这类外部冲击已发生、无法做实验，需要量化对销量或 GMV 的净影响时用；若冲击只影响单元自身且能构造可比对照，用双重差分更简单；SKU 级日常运营决策不必用。"
workflow: "选定目标单元与未受影响的控制单元，取足够长的预处理期时序 → 求解非负且和为 1 约束下的经典合成控制权重 → 用 ElasticNet、Ridge 等 ML 方法做 Doudchenko-Imbens 扩展 → 输出处理期的 ATT 时序曲线与 95% 置信区间 → 做安慰剂检验并据此调整预算或运营策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 机器学习增强合成控制法 — Doudchenko & Imbens 方法与 ML 扩展

## ① 解决的问题

Amazon A9 算法更新后销量异动无法区分算法影响与季节性导致策略误判——引入 ML 增强合成控制法（Doudchenko & Imbens），算法冲击净效应估计置信区间精度 95%，策略响应准确率大幅提升。

## ② 核心算法逻辑

经典合成控制法（Abadie et al. 2010）：用控制单元的加权组合构造处理单元的反事实：

## ③ 业务应用场景

场景1：亚马逊平台算法调整对销量的影响评估 - 业务问题：2024-Q3 亚马逊 A9 算法更新后，婴儿推车类目销量异动，需区分「算法影响」与「季节性」 - 数据要求：目标类目 + 20 个未受影响控制类目的周销量（48 周预处理期，12 周干预期）；类目特征（客单价、评论数等） - 预期产出：算法调整的 ATT 时序曲线（每周影响量）+ 95% 置信区间；识别影响是否持续衰减 - 业务价值：量化算法冲击 ROI（损失/收益），指导 Listing 优化投入，年化决策价值约 30-100 万
场景2：国家/地区入仓政策变化的销售影响 - 业务问题：某市场海关政策收紧（如德国 EPR 注册要求）导致部分 SKU 下架，需评估政策损失 - 数据要求：受影响市场（处理）+ 未受影响的 5 个相近市场（控制）的月 GMV 数据（24 个月预处理期） - 预期产出：政策冲击的累计损失额 + 置信区间，用于法务索赔计算或对冲策略量化 - 业务价值：精确损失估计误差从经验判断的 ±40% 缩小至 ±15%，支持商业保险理赔和预算重调
**三轨验证**： - 成本：仅需历史销量数据，无需个体级数据，隐私友好；计算成本低 - 合规：全部使用汇总数据，不涉及用户隐私 - 风险：控制单元数量不足（<5）或预处理期太短（<12 周）时，权重不稳定；需报告安慰剂检验

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：政策/算法冲击量化精度从 ±40% 提升至 ±15%，直接支持法务理赔、预算重调、运营干预决策；年化决策价值 50-200 万
实施难度：⭐⭐⭐☆☆（数据要求简单（汇总时序），算法实现中等，主要难点在控制单元选择）
优先级：⭐⭐⭐⭐☆（平台规则频繁变化的跨境电商场景，政策影响评估是高频需求）
数据要求：预处理期 ≥ 干预期的 3 倍，控制单元 ≥ 5 个；建议同时报告安慰剂检验

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（133 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
机器学习增强合成控制法 — Augmented SCM (ASCM)
依赖: numpy, pandas, scipy, sklearn
"""
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from sklearn.linear_model import ElasticNet, Ridge
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# ── 1. 生成模拟数据（婴儿推车类目，A9 算法冲击）──────────────────
T_pre  = 40   # 预处理期（周）
T_post = 12   # 干预期（周）
T_total = T_pre + T_post
J = 15        # 控制单元数量（其他类目）

# 控制单元：独立趋势 + 共同因子
common_factor = np.cumsum(np.random.normal(0, 0.5, T_total))
control_data  = np.array([
    0.8 * common_factor + np.cumsum(np.random.normal(0, 0.3, T_total))
    for _ in range(J)
]).T   # (T_total, J)

# 处理单元（婴儿推车类目）：预处理期跟随控制，干预期下降
true_weights = np.array([0.3, 0.2, 0.15, 0.15, 0.1] + [0.1/(J-5)]*(J-5))
Y_counterfactual = control_data @ true_weights + common_factor * 0.5
treatment_effect = np.concatenate([
    np.zeros(T_pre),
    -np.linspace(0, 0.8, T_post)  # 逐渐下降的冲击
])
Y_treated = Y_counterfactual + treatment_effect + np.random.normal(0, 0.1, T_total)

Y_pre_treated   = Y_treated[:T_pre]
Y_post_treated  = Y_treated[T_pre:]
X_pre_control   = control_data[:T_pre, :]
X_post_control  = control_data[T_pre:, :]

# ── 2. 经典 SCM（Abadie 非负约束）───────────────────────────────
def classic_scm_loss(w, X_pre, Y_pre):
    residual = Y_pre - X_pre @ w
    return np.sum(residual**2)

w0 = np.ones(J) / J
constraints = ({'type': 'eq', 'fun': lambda w: w.sum() - 1})
bounds = [(0, 1)] * J
result = minimize(classic_scm_loss, w0,
                  args=(X_pre_control, Y_pre_treated),
                  method='SLSQP', bounds=bounds, constraints=constraints)
w_classic = result.x

Y_cf_classic = X_post_control @ w_classic
tau_classic  = Y_post_treated - Y_cf_classic

# ── 3. Doudchenko-Imbens 扩展（ElasticNet，无非负约束）──────────
scaler = StandardScaler()
X_pre_scaled  = scaler.fit_transform(X_pre_control)
X_post_scaled = scaler.transform(X_post_control)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标单元与控制单元的时序数据：类目场景为目标类目 + 20 个未受影响控制类目的周销量（48 周预处理期、12 周干预期）；政策场景为受影响市场 + 5 个相近未受影响市场的月 GMV（24 个月预处理期）；另需类目或市场特征（客单价、评论数等）。

**输出**：冲击的 ATT 时序曲线（每周影响量）与 95% 置信区间、累计损失或收益估计，以及安慰剂检验结果，用于预算重调、Listing 优化投入与法务理赔（卡页示例：估计误差从经验判断的 ±40% 缩小到 ±15%）。

## 执行步骤

1. 选定目标单元与未受影响的控制单元，取足够长的预处理期时序
2. 求解非负且和为 1 约束下的经典合成控制权重
3. 用 ElasticNet、Ridge 等 ML 方法做 Doudchenko-Imbens 扩展
4. 输出处理期的 ATT 时序曲线与 95% 置信区间
5. 做安慰剂检验，并据此调整预算与运营策略

## 边界与不做

- 何时不用：控制单元少于 5 个、或预处理期不到干预期 3 倍时权重不稳定，不要用；冲击只影响单元自身且能构造可比对照时，用双重差分更简单。
- 能力边界：只量化冲击影响与置信区间，不解释平台算法内部机制，也不替代法务或索赔判断；结论依赖控制单元选择，需同时报告安慰剂检验。
- 合规边界：仅使用汇总的类目、市场级时序数据，不涉及个体用户数据，卡页指出该方法隐私友好。
- 卡页数字（20 个控制类目、48 周预处理 + 12 周干预、误差 ±40% 到 ±15%、年化决策价值 30-100 万与 50-200 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Synthetic-Control-ML-Enhanced

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Synthetic-Control-ML-Enhanced`