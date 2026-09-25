---
name: "p2s-model-calibration"
title: "Model Calibration — 让预测概率真正可信的校准技术"
description: "触发词：概率校准、Platt缩放、保序回归、ECE、备货缓冲比例、预测可信度。何时不用：只按概率排序、不看绝对概率时无需校准；要提升模型区分能力时走需求预测或分类建模类技能。安全边界：校准只做后处理，不改动原始模型评估口径，也不用校准分数对外承诺具体退货率或点击率。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Model-Calibration"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让模型输出的概率真正等于现实发生率，备货缓冲不再按失真的分数拍比例。"
user_try: "试试：把这个退货预测模型的概率做校准，先给出校准前后的 ECE 对比。"
whenToUse: "模型概率被直接当成多少比例会退货或会点击使用，并据此设置备货缓冲或出价时用；只关心排序结果时不必校准。"
workflow: "准备带标签的验证集与模型原始概率 → 分箱计算期望校准误差 → 分别拟合 Platt 缩放与保序回归 → 比较校准前后的误差与缓冲比例偏差 → 把校准层接到下游决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Model Calibration — 让预测概率真正可信的校准技术

## ① 解决的问题

运营决策团队面临"退货预测模型概率输出失真、备货缓冲比例设置误差±20%导致过度备货"——Platt Scaling/Isotonic Regression将ECE从0.18降至0.04，年化节省FBA仓储成本40-60万元

## ② 核心算法逻辑

模型输出的原始 score 并非真正的概率——一个预测值 0.8 并不代表该事件真实发生概率为 80%。校准（Calibration）就是对模型输出做后处理，使得 P(Y=1 | f(x)=p) ≈ p。

## ③ 业务应用场景

场景A：退货概率校准 → 精准 FBA 备货决策
- 业务问题：退货预测模型的原始 score 0.7 并不意味着 70% 退货率，直接用于备货缓冲比例会导致过度备货（库存成本+15%） - 数据要求：验证集 2000+ 订单，含退货标签；模型输出的原始 probability score - 预期产出：ECE 从 0.18 降至 0.04，退货缓冲比例设置误差从 ±20% 降至 ±5% - 业务价值：减少过度备货，FBA 仓储成本年化降低约 8-12%，以月销 500 万计约节省 40-60 万元
场景B：广告点击率校准 → 实时竞价出价优化

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：以月销 500 万母婴 DTC 为基准，FBA 备货缓冲优化年化节省 40-60 万元；广告竞价准确性提升带来 ROAS +15%，月均额外利润约 5-8 万元
实施难度：⭐⭐☆☆☆（仅需在已有模型上做后处理，1 天可完成）
优先级：⭐⭐⭐⭐☆
评估依据：校准是"零成本提升"——无需重新训练模型，直接提升下游决策质量；退货预测、广告出价等多个业务场景均有收益

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（87 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.model_selection import train_test_split
from sklearn.isotonic import IsotonicRegression

# 模拟母婴退货预测场景：构造数据
np.random.seed(42)
X, y = make_classification(
    n_samples=5000, n_features=10, n_informative=6,
    weights=[0.85, 0.15],  # 退货率约15%
    random_state=42
)

X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.4, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

# 训练基础 GBM 模型
gbm = GradientBoostingClassifier(n_estimators=100, random_state=42)
gbm.fit(X_train, y_train)

raw_scores_val = gbm.predict_proba(X_val)[:, 1]
raw_scores_test = gbm.predict_proba(X_test)[:, 1]


def expected_calibration_error(y_true, y_prob, n_bins=10):
    """计算 ECE（期望校准误差）"""
    bin_edges = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    n = len(y_true)
    for i in range(n_bins):
        mask = (y_prob >= bin_edges[i]) & (y_prob < bin_edges[i + 1])
        if mask.sum() == 0:
            continue
        bin_acc = y_true[mask].mean()
        bin_conf = y_prob[mask].mean()
        ece += (mask.sum() / n) * abs(bin_acc - bin_conf)
    return ece


# 方法1：Platt Scaling（在验证集上拟合 LR）
platt_lr = LogisticRegression()
platt_lr.fit(raw_scores_val.reshape(-1, 1), y_val)
platt_scores_test = platt_lr.predict_proba(raw_scores_test.reshape(-1, 1))[:, 1]

# 方法2：Isotonic Regression
isotonic = IsotonicRegression(out_of_bounds='clip')
isotonic.fit(raw_scores_val, y_val)
isotonic_scores_test = isotonic.predict(raw_scores_test)

# 方法3：sklearn CalibratedClassifierCV (内置封装)
calibrated_gbm = CalibratedClassifierCV(
    GradientBoostingClassifier(n_estimators=100, random_state=42),
    method='isotonic', cv=3
)
calibrated_gbm.fit(X_train, y_train)
cv_scores_test = calibrated_gbm.predict_proba(X_test)[:, 1]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1706.04599 — On Calibration of Modern Neural Networks

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：带标签的验证集（模板为 5000 行规模、退货标签占比约 15%）与模型输出的原始概率分数，一行一条预测并附真实标签。

**输出**：校准后的概率分数、校准前后的期望校准误差对比，以及下游备货缓冲比例误差区间，供备货与竞价决策使用。

## 执行步骤

1. 准备验证集与模型原始概率
2. 分箱计算期望校准误差
3. 拟合并对比 Platt 缩放与保序回归
4. 用校准后分数重算备货缓冲比例
5. 输出校准前后误差对比供决策

## 边界与不做

- 数据不满足时不适用：没有独立验证集或验证样本过少时，校准层会过拟合，前后对比失去意义。
- 能力边界：只做概率后处理，不提升模型区分能力，也不改变原始模型的训练与特征口径。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Cross-Validation-Strategies.html、Skill-Cross-Validation-Strategies、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Imbalanced-Data-Handling.html、Skill-Imbalanced-Data-Handling、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Model-Calibration

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：12-ML基础　·　源卡：`Skill-Model-Calibration`