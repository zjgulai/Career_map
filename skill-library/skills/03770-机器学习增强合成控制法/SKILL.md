---
name: "p2s-scm-ml-enhanced"
title: "Synthetic Control + ML — 机器学习增强合成控制法"
description: "触发词：合成控制、ML增强、市场扩张、溢出效应、置换检验。何时不用：捐赠单元与处理单元差异过大、或预处理期不足时外推失效；SKU级日常运营决策不必用。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 需求预测"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-SCM-ML-Enhanced"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用多个对照市场合成一条如果没有进德国会怎样的曲线，判断新市场是抢了自己原有市场还是把盘子做大了。"
user_try: "试试：2025Q3 进了德国市场，帮我评估这是不是分流了英国的销售额。"
whenToUse: "当发生市场进入、渠道政策这类无法做 A/B 的市场级事件，需要评估对既有市场的溢出或互补效应时用；SKU 级日常运营决策不必用；有可比对照、平行趋势成立时用双重差分更简单。"
workflow: "汇总目标市场与 5-10 个对照市场的月度 GMV 时间序列 → 用预处理期误差最小化求解合成控制权重（可用 Ridge、Lasso 等 ML 方法增强） → 合成处理期的反事实曲线 → 对比实际值与反事实值量化溢出或互补效应 → 做置换检验与预处理期 MSPE 诊断，输出扩张决策依据"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Synthetic Control + ML — 机器学习增强合成控制法

## ① 解决的问题

供应链分析师面临"新市场进入后无法分离销量增长是趋势还是策略效果"——ML增强合成控制将因果效应估计误差降低45%，年化精准归因节省备货成本20-35万元

## ② 核心算法逻辑

传统合成控制法（Abadie 2003）用捐赠单元（donor pool）的加权组合构造「反事实对照组」，权重通过最小化预处理期误差获得。关键局限：仅支持线性组合，捐赠单元数量少时拟合差。

## ③ 业务应用场景

场景1：新市场上线对核心市场销售的溢出效应评估 - 业务问题：品牌 2025Q3 进入德国市场，需要评估此举是否「分流」了英国市场的销售额（市场自然实验） - 数据要求：英国+5-10个欧洲对照市场 × 24个月 GMV 数据（月度），处理前至少 12 个月 - 预期产出：英国市场的合成反事实曲线，量化德国上线的溢出/互补效应 - 业务价值：为后续市场扩张决策提供量化依据，避免盲目扩张侵蚀核心市场，年化决策价值 50-100 万元
**三轨验证**： - 成本：Python 单机实现，无需云资源 - 合规：使用内部销售数据，无隐私风险 - 风险：捐赠单元选择不当（与处理单元差异太大）会导致外推失效；需验证预处理期 MSPE（均方预测误差）达标

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：为市场扩张、渠道策略等重大决策提供可靠因果证据，避免错误决策损失，单次决策价值 50-200 万元
实施难度：⭐⭐⭐⭐☆（需要理解合成控制逻辑 + 置换检验推断，捐赠单元选择需领域知识）
优先级：⭐⭐⭐☆☆（适用于市场级政策评估，不适合 SKU 级日常运营决策）
评估依据：当无法做 A/B 实验（如新市场进入、价格政策改变）时，合成控制是最严谨的准实验方法；ML 增强版显著改善小样本下的拟合质量。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（88 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# ML 增强合成控制法：评估市场扩张的溢出效应
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, Lasso
from scipy.optimize import minimize

np.random.seed(2024)
T_pre = 18   # 预处理期（月）
T_post = 6   # 处理后（月）
T_total = T_pre + T_post
n_donors = 8  # 捐赠单元数（对照市场）

# ---- 数据模拟：欧洲市场月度 GMV ----
# 捐赠单元（对照市场）：随机游走趋势
donors_gmv = np.zeros((T_total, n_donors))
for j in range(n_donors):
    donors_gmv[:, j] = 100 + np.cumsum(np.random.normal(0, 2, T_total)) + np.random.normal(0, 1, T_total)
    donors_gmv[:, j] += 10 * np.sin(np.arange(T_total) * np.pi / 6)  # 季节性

# 处理单元（英国）：预处理期与捐赠单元相关
w_true = np.array([0.3, 0.25, 0.2, 0.1, 0.1, 0.03, 0.01, 0.01])
uk_cf = donors_gmv @ w_true + np.random.normal(0, 2, T_total)
# 处理效应（德国上线后英国小幅流失）
treatment_effect = np.concatenate([np.zeros(T_pre), -np.array([3, 4, 5, 5, 6, 5])])
uk_obs = uk_cf + treatment_effect

# 划分预/后处理期
donors_pre = donors_gmv[:T_pre, :]
donors_post = donors_gmv[T_post:, :]
uk_pre = uk_obs[:T_pre]
uk_post = uk_obs[T_pre:]
uk_cf_post = uk_cf[T_pre:]  # 真实反事实（用于验证）

# ---- 传统合成控制（有约束权重）----
def sc_objective(w, Y_donor, Y_treated):
    """最小化预处理期合成误差"""
    return np.sum((Y_treated - Y_donor @ w) ** 2)

constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]
bounds = [(0, 1)] * n_donors
w0 = np.ones(n_donors) / n_donors
result = minimize(sc_objective, w0, args=(donors_pre, uk_pre),
                  method='SLSQP', bounds=bounds, constraints=constraints)
w_sc = result.x

# ---- ML 增强合成控制（Ridge + 无约束）----
ridge_model = Ridge(alpha=1.0, fit_intercept=True)
ridge_model.fit(donors_pre, uk_pre)
w_ridge = ridge_model.coef_

# ---- 生成后处理期反事实 ----
uk_synth_sc = donors_gmv[T_pre:, :] @ w_sc
uk_synth_ridge = ridge_model.predict(donors_gmv[T_pre:, :])

# ---- 计算处理效应 ----
tau_sc = uk_post - uk_synth_sc
tau_ridge = uk_post - uk_synth_ridge
tau_true = treatment_effect[T_pre:]

print("=" * 55)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标市场与 5-10 个对照市场的月度 GMV 时间序列，总长度示例 24 个月（处理前至少 12 个月；代码模板为 18 期预处理 + 6 期处理后）。

**输出**：目标市场的合成反事实曲线、溢出或互补效应的量化结果，以及预处理期均方预测误差（MSPE）等拟合诊断，供市场扩张与渠道策略决策使用（卡页示例：单次决策价值 50-200 万元）。

## 执行步骤

1. 汇总目标市场与 5-10 个对照市场的月度 GMV 时间序列
2. 用预处理期误差最小化求解合成控制权重（可叠加 Ridge/Lasso 等 ML 增强）
3. 合成处理期的反事实曲线
4. 对比实际值与反事实值量化溢出或互补效应
5. 做置换检验与预处理期 MSPE 诊断，输出扩张决策依据

## 边界与不做

- 何时不用：捐赠单元与处理单元差异过大、或预处理期不足 12 个月时外推失效，不要用；SKU 级日常运营决策也无需使用（卡页指出其适用于市场级政策评估）。
- 能力边界：只给出效应估计与拟合诊断，不替代扩张决策；结论依赖捐赠单元选择，需领域知识并验证预处理期 MSPE 是否达标。
- 卡页数字（估计误差降低 45%、年化节省 20-35 万元、单次决策价值 50-200 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-SCM-ML-Enhanced

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-SCM-ML-Enhanced`