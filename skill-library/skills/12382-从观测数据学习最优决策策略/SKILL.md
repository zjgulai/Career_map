---
name: "p2s-policy-learning-observational"
title: "Policy Learning from Observational Data — 从观测数据学习最优决策策略"
description: "触发词：策略学习、观测数据、倾向得分、双重稳健、规则导出、个性化决策。何时不用：有干净实验数据时用「因果森林异质处理效应」或「Uplift 干预优先级队列」；只判断促销整体增量用「促销效果因果评估」。安全边界：使用平台内部数据须遵守隐私与最小化原则，导出规则须满足平台促销公平性要求并定期重训复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 增量分析"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Policy-Learning-Observational"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "没有新实验也能学策略：从被算法挑过的历史数据里纠偏，学出一条能直接交给运营执行的发券规则。"
user_try: "试试：我有 5000 条历史发券订单数据，但平台偏向给高意图用户发券，帮我学一条可执行的发券规则。"
whenToUse: "当只有观测数据（带倾向偏差）、无法或来不及做新实验，但仍要产出个体化决策策略时用本技能；若有干净的实验数据，直接用「因果森林异质处理效应」；只判断整体增量用「促销效果因果评估」。"
workflow: "整理历史观测数据：用户画像特征、是否收到优惠券、结果变量 → 用交叉预测估计倾向得分并截断极端值 → 训练结果模型并构造双重稳健伪结果 → 在伪结果上学习策略树并导出可读规则 → 用离线策略评估指标监控退化并定期重训"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Policy Learning from Observational Data — 从观测数据学习最优决策策略

## ① 解决的问题

业务策略师面临"依赖历史AB实验数据制定促销政策速度太慢"——观测数据策略学习将最优促销政策更新周期从30天缩短至3天，年化GMV提升15-25万元

## ② 核心算法逻辑

Policy Learning（策略学习）解决的核心问题：给定历史观测数据（包含混淆偏差），如何学习一个最优的个体化决策策略 π(x)，使平均结果最大化？

## ③ 业务应用场景

场景1：婴儿辅食新品个体化促销策略 - 业务问题：历史促销数据中，平台算法对高意图用户投放了更多优惠券，导致粗估促销效果虚高；需要学习「哪类用户真正需要促销才能转化」 - 数据要求：历史订单数据（用户画像 X：月龄、购买频次、客单价；处理变量 T：是否收到优惠券；结果 Y：7天内购买），至少 5000 条记录 - 预期产出：规则化策略（如「月龄 6-12 个月 + 首购用户 → 发券；其余免打扰」），精确定向率从全量投放提升到 35% - 业务价值：优惠券预算节省 40-60%，同等转化率下营销成本年化节省 20-50 万元
**三轨验证**： - 成本：离线训练 < 10 分钟；策略上线需接入用户画像接口 - 合规：使用平台内部数据，无隐私风险；策略规则需满足平台促销公平性要求 - 风险：倾向得分估计不准时策略退化，需定期重训并监控策略 OPE（离线策略评估）指标

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：优惠券预算节省 40-60%，同等转化规模下营销成本年化节省 20-50 万元
实施难度：⭐⭐⭐⭐☆（需要倾向得分建模 + DR 双重稳健估计，工程集成有一定门槛）
优先级：⭐⭐⭐⭐⭐（促销预算优化是高频高价值场景，ROI 可验证）
评估依据：母婴出海品牌促销预算通常占 GMV 的 8-15%，精准策略可将无效投放压缩 40%；策略树规则可直接导出给运营团队执行，透明可解释。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（88 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Policy Learning from Observational Data 在母婴促销场景的完整实现
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import cross_val_predict

np.random.seed(2024)
n = 5000

# ---- 数据模拟：带偏观测数据 ----
# 用户特征
baby_age = np.random.randint(1, 24, n)        # 婴儿月龄
purchase_freq = np.random.poisson(3, n)        # 历史购买频次
price_sensitivity = np.random.normal(0, 1, n)  # 价格敏感度（潜在）

# 倾向得分（历史上平台偏向高意图用户发券）
log_odds = 0.3 * (baby_age < 12).astype(float) + 0.5 * (purchase_freq < 2).astype(float) - 0.3
propensity_true = 1 / (1 + np.exp(-log_odds))
T = (np.random.uniform(0, 1, n) < propensity_true).astype(int)

# 个体化处理效应（真实值，仅用于验证）
tau_true = 0.3 * (baby_age >= 6).astype(float) * (baby_age <= 12).astype(float) \
           + 0.2 * (purchase_freq < 3).astype(float) \
           + 0.1 * price_sensitivity

# 结果变量（7天转化）
Y0 = (np.random.uniform(0, 1, n) < 0.2 + 0.05 * (purchase_freq > 3)).astype(float)
Y1 = (np.random.uniform(0, 1, n) < 0.2 + 0.05 * (purchase_freq > 3) + np.clip(tau_true, 0, 0.4)).astype(float)
Y = T * Y1 + (1 - T) * Y0  # 观测结果

X_feat = np.column_stack([baby_age, purchase_freq, price_sensitivity])
feat_names = ["baby_age", "purchase_freq", "price_sensitivity"]
df = pd.DataFrame(X_feat, columns=feat_names)
df["T"] = T
df["Y"] = Y

print(f"样本量: {n}, 发券率: {T.mean():.2%}, 整体转化率: {Y.mean():.2%}")

# ---- Step 1: 估计倾向得分（交叉预测避免过拟合）----
ps_model = LogisticRegression(max_iter=1000)
propensity_hat = cross_val_predict(ps_model, X_feat, T, cv=5, method='predict_proba')[:, 1]
propensity_hat = np.clip(propensity_hat, 0.05, 0.95)  # 截断极端值
print(f"倾向得分范围: [{propensity_hat.min():.3f}, {propensity_hat.max():.3f}]")

# ---- Step 2: 估计结果模型（DR 需要）----
from sklearn.ensemble import GradientBoostingClassifier
outcome_model_1 = GradientBoostingClassifier(n_estimators=100, random_state=42)
outcome_model_0 = GradientBoostingClassifier(n_estimators=100, random_state=42)
outcome_model_1.fit(X_feat[T == 1], Y[T == 1])
outcome_model_0.fit(X_feat[T == 0], Y[T == 0])
mu1_hat = outcome_model_1.predict_proba(X_feat)[:, 1]
mu0_hat = outcome_model_0.predict_proba(X_feat)[:, 1]

# ---- Step 3: 双重稳健伪结果（DR pseudo-outcome）----
# DR estimator: Γ_i = μ1(x) - μ0(x) + T(Y-μ1)/(e) - (1-T)(Y-μ0)/(1-e)
gamma_dr = (mu1_hat - mu0_hat
            + T * (Y - mu1_hat) / propensity_hat
            - (1 - T) * (Y - mu0_hat) / (1 - propensity_hat))
print(f"DR 伪结果均值（估计 ATE）: {gamma_dr.mean():.4f}")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史订单观测数据至少 5000 条：用户画像特征（月龄、购买频次、客单价等）、处理变量（是否收到优惠券）、结果变量（如 7 天内是否购买）；粒度为用户 × 观测记录。

**输出**：可解释的规则化策略（如月龄 6-12 个月且首购的用户发券、其余免打扰）、精确定向率与预算节省估算，以及离线策略评估指标；供运营直接执行。

## 执行步骤

1. 整理带倾向偏差的历史观测数据
2. 用交叉预测估计倾向得分并截断极端值
3. 构造双重稳健伪结果
4. 在伪结果上学习策略树并导出规则
5. 用离线评估指标监控退化并定期重训

## 边界与不做

- 数据不满足：观测样本不足（卡页要求 5000 条量级）或缺少混淆特征时策略会退化。
- 何时不用：有实验数据时用「因果森林异质处理效应」或「Uplift 干预优先级队列」；只看整体增量用「促销效果因果评估」。
- 能力边界：只做离线策略学习与规则导出，不含用户画像接口接入与线上 A/B 验证。
- 安全边界：平台数据使用须遵守隐私与最小化原则；规则须满足平台促销公平性要求并定期复核。

## 技能关联

- **可组合**：Skill-Policy-Learning-Observational

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：01-因果推断　·　源卡：`Skill-Policy-Learning-Observational`