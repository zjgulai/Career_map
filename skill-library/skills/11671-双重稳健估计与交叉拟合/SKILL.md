---
name: "p2s-doubly-robust-cross-fitting"
title: "Doubly Robust + Cross-fitting — 双重稳健估计与交叉拟合"
description: "触发词：双重稳健、交叉拟合、DR估计、选择偏差、渠道效应。何时不用：倾向得分无重叠或两个辅助模型都严重误设时改用随机实验；能按地区配对停投测增量时用Geo Holdout。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Doubly-Robust-Cross-Fitting"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "用双保险的方式估计渠道效应，压掉用户自选择带来的失真，看清哪个渠道对新客、哪个对老客真的有效。"
user_try: "试试：Amazon 和 TikTok 广告效果对比看着不可信，帮我用双重稳健估计算出无偏的渠道效应。"
whenToUse: "当只有观察数据、渠道曝光由用户自选择决定，需要无偏渠道因果效应与个体化渠道建议时用；若能按地区配对停投做严格增量实验，用「Geo Holdout 实验」；若只看单一渠道的人群异质性，用因果森林类技能。"
workflow: "整理曝光日志的用户特征、渠道分配与 GMV 结果 → 用交叉拟合分别训练倾向得分模型与结果模型 → 按双重稳健公式合成渠道效应估计 → 检查倾向得分重叠与模型误设风险 → 输出渠道因果效应与新客/老客的渠道推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Doubly Robust + Cross-fitting — 双重稳健估计与交叉拟合

## ① 解决的问题

数据科学家面临"观察数据因混淆偏差导致广告归因失真"——双重稳健估计将归因误差降低60%，年化广告投资优化节省40-80万元

## ② 核心算法逻辑

双重稳健估计（Doubly Robust, DR） 是因果推断中最重要的鲁棒性工具：同时建模结果函数 μ(x) 和倾向得分 e(x)，只要其中一个正确，ATE 估计就一致（双重保险）。

## ③ 业务应用场景

场景1：跨境广告渠道效应异质性估计 - 业务问题：Amazon 广告 vs TikTok 广告的 ROAS 差异，因渠道自选择偏差（高意图用户偏向搜索广告）导致直接对比严重失真 - 数据要求：广告曝光日志（用户特征 X：月龄段、地区、历史购买；渠道分配 T；GMV 结果 Y），至少 3000 条，倾向得分分布不过于极端 - 预期产出：无偏渠道因果效应估计 + 个体化渠道推荐（新客 vs 老客最优渠道不同） - 业务价值：渠道预算重分配，年化广告效率提升 20-30%，节省 15-40 万低效投放
**三轨验证**： - 成本：scikit-learn + econml 实现，< 15 分钟运行 - 合规：使用内部广告数据，无平台合规风险 - 风险：若两个辅助模型都严重误设（例如样本极度不平衡），DR 仍可能偏；需检验 overlap 假设

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：去除选择偏差后广告渠道重分配，年化广告效率提升 20-30%，节省无效投放 15-40 万元
实施难度：⭐⭐⭐☆☆（有 EconML 库封装，代码量小，但需要统计直觉理解双重稳健逻辑）
优先级：⭐⭐⭐⭐⭐（通用性极强，适用于所有带混淆偏差的效应估计场景，是因果推断基础工具）
评估依据：DR-Learner 已被广泛验证在中小样本下优于纯 IPW 或纯结果建模；EconML 1.x 版本已内置完整实现，工程集成成本低。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（91 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Doubly Robust + Cross-fitting 在广告渠道效应估计场景的完整实现
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold
from sklearn.metrics import mean_squared_error

np.random.seed(2024)
n = 4000

# ---- 数据模拟：广告渠道效应（带混淆）----
baby_age_group = np.random.choice([0, 1, 2], n, p=[0.3, 0.4, 0.3])  # 0:0-6月, 1:6-12月, 2:12+月
is_new_customer = np.random.binomial(1, 0.4, n)
region = np.random.choice([0, 1], n, p=[0.6, 0.4])  # 0:北美, 1:欧洲
X = np.column_stack([baby_age_group, is_new_customer, region])
feat_names = ["baby_age_group", "is_new_customer", "region"]

# 真实倾向：高意图新客更多出现在搜索广告（T=1:搜索广告, T=0:信息流广告）
log_odds = 0.8 * is_new_customer + 0.3 * (baby_age_group == 1).astype(float) - 0.5
e_true = 1 / (1 + np.exp(-log_odds))
T = (np.random.uniform(0, 1, n) < e_true).astype(int)

# 真实异质性效应：新客在搜索广告效果好；老客在信息流广告效果好
tau_true = (0.5 * is_new_customer - 0.3 * (1 - is_new_customer)
            + 0.2 * (baby_age_group == 1).astype(float))
mu0_true = 50 + 20 * (1 - is_new_customer) + 10 * region
Y = mu0_true + tau_true * T + np.random.normal(0, 10, n)  # GMV（元）

print(f"样本量: {n}, 搜索广告比例: {T.mean():.2%}")
print(f"真实 ATE: {tau_true.mean():.2f} 元")

# ---- DR + Cross-fitting 实现 ----
K = 5
kf = KFold(n_splits=K, shuffle=True, random_state=42)

mu1_hat = np.zeros(n)
mu0_hat = np.zeros(n)
e_hat = np.zeros(n)

for fold_idx, (train_idx, val_idx) in enumerate(kf.split(X)):
    X_tr, X_val = X[train_idx], X[val_idx]
    T_tr, T_val = T[train_idx], T[val_idx]
    Y_tr, Y_val = Y[train_idx], Y[val_idx]

    # 倾向得分模型（交叉拟合）
    ps_model = GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)
    ps_model.fit(X_tr, T_tr)
    e_hat[val_idx] = ps_model.predict_proba(X_val)[:, 1]

    # 结果模型（分组交叉拟合）
    out_model_1 = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
    out_model_0 = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
    out_model_1.fit(X_tr[T_tr == 1], Y_tr[T_tr == 1])
    out_model_0.fit(X_tr[T_tr == 0], Y_tr[T_tr == 0])
    mu1_hat[val_idx] = out_model_1.predict(X_val)
    mu0_hat[val_idx] = out_model_0.predict(X_val)

e_hat = np.clip(e_hat, 0.05, 0.95)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：广告曝光日志：用户特征（月龄段、地区、历史购买、是否新客等）、渠道分配标识、结果变量（GMV），至少 3000 条；倾向得分分布不宜过于极端，需满足重叠假设。

**输出**：无偏的渠道因果效应（总体与个体化）估计、新客与老客的最优渠道推荐，供渠道预算重分配使用（卡页示例：广告效率提升 20-30%、节省无效投放 15-40 万元）。

## 执行步骤

1. 整理曝光日志中的用户特征、渠道分配与 GMV 结果
2. 用 K 折交叉拟合训练倾向得分模型与结果模型以避免过拟合偏差
3. 按双重稳健公式合成渠道总体与个体效应估计
4. 检查倾向得分重叠情况与两个辅助模型的误设风险
5. 输出渠道因果效应与新客/老客渠道推荐

## 边界与不做

- 何时不用：倾向得分缺乏重叠（样本极度不平衡）或两个辅助模型都严重误设时，双重稳健仍会偏，应改做随机实验。
- 能力边界：只产出效应估计与渠道推荐，不做预算执行；建议至少 3000 条曝光记录，样本更少时估计不稳。
- 卡页数字（归因误差降低 60%、效率提升 20-30%、节省 15-40 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Doubly-Robust-Cross-Fitting

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Doubly-Robust-Cross-Fitting`