---
name: "p2s-gp-new-product-demand"
title: "GP New Product Demand — 高斯过程新品冷启动需求预测"
description: "触发词：高斯过程、小样本预测、新品冷启动、置信区间、分位补货。何时不用：有充足历史销量的常规预测用「Agent时序预测」，稀疏零膨胀需求用「GP+Tweedie间歇需求预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-GP-New-Product-Demand"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品只有几周数据也能算出带置信区间的预测，按偏高一点的分位补货，别一上市就断货。"
user_try: "试试：我这款辅食机前 6 周销量是 12、18、15、24、29、22，帮我预测第 7-14 周并给出补货量。"
whenToUse: "本卡属新品冷启动的小样本路线：可用数据点少于约 50 个、需要带置信区间的预测时用；大量零销售的稀疏需求用 GP+Tweedie 类技能，跨市场迁移用迁移类技能。"
workflow: "以周次与节假日标记构造输入特征 → 用组合核（局部平滑乘周期核）拟合高斯过程 → 预测后续周销量并输出置信区间 → 按分位数（如 P75）计算补货量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GP New Product Demand — 高斯过程新品冷启动需求预测

## ① 解决的问题

供应链面临"新品冷启动期<50个数据点预测精度极差"——高斯过程回归在小样本下给出带置信区间的预测，首批备货准确率从±40%提升至±20%，年化节省15-25万元

## ② 核心算法逻辑

论文：Gaussian Processes for Time Series Forecasting | 年份：2020

## ③ 业务应用场景

场景：某母婴品牌新上一款婴儿辅食机（$89.99），在美国站上线。前6周销量：[12, 18, 15, 24, 29, 22] 单/周，需要预测第 7-14 周销量以决定第一次补货量（头程 45 天，需提前决策）。
GPR 流程： 1. 以周次为输入特征（+节假日标记） 2. 组合核：RBF（局部平滑）× 周期核（7天购买周期） 3. 训练后预测第 7-14 周：均值 [28, 35, 38, 42, 39, 45, 51, 48] 4. 95% 置信区间：±40%（体现早期不确定性） 5. 决策：按 P75 分位（均值+0.67σ）补货，300 件
对比结果：均值预测补货 220 件 → 第 10 周断货；GPR P75 补货 300 件 → 无断货，积压 28 件（存储费 $14）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15-25 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（84 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ExpSineSquared, WhiteKernel, ConstantKernel

def build_baby_product_kernel():
    """构建母婴新品专用组合核函数"""
    # 局部趋势核（RBF）：捕捉销量增长趋势
    trend_kernel = ConstantKernel(1.0) * RBF(length_scale=4.0, length_scale_bounds=(1, 20))
    # 周期核：母婴消耗品7天购买周期
    periodic_kernel = ConstantKernel(0.5) * ExpSineSquared(
        length_scale=1.0, periodicity=7.0,
        length_scale_bounds=(0.5, 5), periodicity_bounds=(5, 14)
    )
    # 观测噪声
    noise_kernel = WhiteKernel(noise_level=0.1, noise_level_bounds=(1e-3, 1.0))
    return trend_kernel + periodic_kernel + noise_kernel

def fit_gpr_new_product(weeks_obs, sales_obs):
    """拟合高斯过程模型"""
    X = weeks_obs.reshape(-1, 1)
    y = sales_obs.astype(float)
    kernel = build_baby_product_kernel()
    gpr = GaussianProcessRegressor(
        kernel=kernel,
        n_restarts_optimizer=5,
        normalize_y=True,
        random_state=42
    )
    gpr.fit(X, y)
    return gpr

def predict_with_ci(gpr, weeks_future, ci_level=0.95):
    """预测未来需求及置信区间"""
    X_future = np.array(weeks_future).reshape(-1, 1)
    y_mean, y_std = gpr.predict(X_future, return_std=True)
    z = {0.90: 1.645, 0.95: 1.960, 0.99: 2.576}.get(ci_level, 1.96)
    y_lower = np.maximum(0, y_mean - z * y_std)
    y_upper = y_mean + z * y_std
    return y_mean, y_lower, y_upper, y_std

def compute_reorder_quantity(y_mean, y_std, lead_time_weeks=6, quantile=0.75):
    """按分位数计算补货量"""
    from scipy.stats import norm
    z = norm.ppf(quantile)
    # 提前期内累积需求
    total_mean = y_mean[:lead_time_weeks].sum()
    total_std = np.sqrt((y_std[:lead_time_weeks]**2).sum())  # 假设独立
    reorder_qty = total_mean + z * total_std
    return int(np.ceil(reorder_qty))

# ── 演示：婴儿辅食机新品前6周数据 ──
weeks_observed = np.array([1, 2, 3, 4, 5, 6], dtype=float)
sales_observed = np.array([12, 18, 15, 24, 29, 22], dtype=float)

# 拟合模型
gpr = fit_gpr_new_product(weeks_observed, sales_observed)

# 预测第7-16周
weeks_future = np.arange(7, 17, dtype=float)
y_mean, y_lower, y_upper, y_std = predict_with_ci(gpr, weeks_future, ci_level=0.95)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2009.10862，但该号在 arXiv 上是《An Intuitive Tutorial to Gaussian Process Regression》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Gaussian Processes for Time Series Forecasting》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：新品早期周销量序列（卡面示例为前 6 周）、节假日标记、上线时间；周粒度，适用于数据点少于约 50 个的冷启动期。

**输出**：未来数周销量预测与置信区间、按分位数计算的建议补货量，输出给新品采购做首单与追单决策。

## 执行步骤

1. 以周次与节假日标记构造输入特征。
2. 用组合核拟合高斯过程模型。
3. 预测后续周销量并输出置信区间。
4. 按分位数计算补货量。

## 边界与不做

- 何时不用：数据点充足（远超 50 个）的成熟品不需要本技能；销量大量为零的稀疏序列应先改用 Tweedie 类方法。
- 能力边界：早期置信区间很宽，补货仍需保留安全余量；节假日等外生冲击要显式标记才能被模型吸收。

## 技能关联

- **可组合**：Skill-GP-New-Product-Demand

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-GP-New-Product-Demand`