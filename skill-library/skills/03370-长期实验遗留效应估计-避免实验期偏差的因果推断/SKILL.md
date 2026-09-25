---
name: "p2s-long-horizon-experiment-effect"
title: "长期实验遗留效应估计 — 避免实验期偏差的因果推断"
description: "触发词：长期效应、代理指标、两阶段法、LTV预测、效应衰减。何时不用：没有已结束且带长期跟踪的历史实验可训练代理系数时无法使用。安全边界：长期跟踪需按合规要求告知用户实验结束后仍会追踪行为。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 复购实验 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Long-Horizon-Experiment-Effect"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用短期代理指标推算十几个月的长期 LTV 效果，避免实验只跑三周就把真正有价值的功能砍掉。"
user_try: "试试：会员权益实验只跑了 3 周，帮我用代理指标预测 12 个月 LTV 会不会更高。"
whenToUse: "当实验只能跑几周、但业务真正关心数月后的 LTV、复购或留存时用；若指标在实验期内就能稳定观测，用常规实验解读即可。"
workflow: "收集已结束历史实验的短期指标与长期跟踪指标 → 用两阶段最小二乘（2SLS）训练代理指标到长期指标的系数 → 用当前实验的短期指标预测长期 LTV 或复购效果 → 输出预测值与 95% 置信区间 → 用历史素材实验的衰减曲线给出建议投放或迭代周期"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 长期实验遗留效应估计 — 避免实验期偏差的因果推断

## ① 解决的问题

运营面临"A/B测试只跑3周但LTV效果需等12个月"——代理指标两阶段法在3周内预测12月LTV提升，避免因短期误判放弃高价值功能，年化避免损失约150万元

## ② 核心算法逻辑

长期实验困境：大多数A/B测试只跑24周，但对订阅制、复购、LTV等业务的真正影响需要数月才能显现。直接截断实验会导致：

## ③ 业务应用场景

场景A：会员权益迭代的长期LTV估计 - 业务问题：新会员权益方案（免费换货+生日礼）A/B测试跑了3周，7天复购率B>A明显，但12个月LTV是否更高？老板要在3周内做决策 - 数据要求：历史已结束的实验（用于训练代理系数）+ 当前实验的短期指标（7日复购、NPS、购物车放弃率） - 预期产出：用3周短期指标预测12个月LTV：B方案LTV预计高出A方案23%（95%CI：[14%, 32%]），建议上线 - 业务价值：准确的长期LTV预测避免因短期噪声误判，防止放弃真正有价值的功能改进，累计LTV损失避免约150万元/年
三轨对抗验证： 1. 成本验证：代理系数训练需要3-5个已完成的历史实验（含短期+长期跟踪数据），前期数据收集成本约1-2周 2. 合规验证：长期实验跟踪需要告知用户"实验结束后仍会追踪行为"（GDPR下的合法权益声明） 3. 风险验证：代理指标与长期指标的关系可能随时间变化（如市场环境变化）；建议每半年重新校准代理系数
场景B：广告素材疲劳的长期效应 - 业务问题：新广告素材测试2周CTR+3%，但担心"新鲜感效应"——2个月后用户习惯了，效果归零 - 方案：用历史素材实验的CTR→ROAS衰减曲线，预测当前素材的12周效果 - 预期产出：新素材4周后CTR优势降至+1.2%，8周后归零，建议实际投放周期控制在4周内 - 业务价值：避免素材"霸屏疲劳"，优化广告轮换策略，ROAS损失减少约20%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免因短期噪声误判而放弃真正有价值的功能（每年约2-3次此类误判，每次潜在LTV损失50万元），年化节省约150万元；避免上线无长期价值的"短期刷量"功能，节省开发成本约30万元/年
实施难度：⭐⭐⭐☆☆（需要积累历史实验的长期跟踪数据，冷启动期约3-6个月）
优先级：⭐⭐⭐⭐☆（订阅制/会员制业务的核心评估工具，传统A/B测试无法替代）
评估依据：KDD 2022论文在电商数据集上验证代理指标法的长期预测R²达0.72；LinkedIn和DoorDash均公开分享了类似方法的应用经验；亚马逊Prime会员评估中广泛应用长期实验方法论

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（150 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Long-Horizon-Experiment-Effect
长期实验遗留效应估计 — 代理指标预测长期LTV

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import cross_val_score
from scipy import stats

np.random.seed(42)

# ── 1. 生成历史实验数据（用于训练代理系数）───────────────────────────
def generate_historical_experiments(n_experiments=8, n_users_per=500):
    """
    生成历史已完成的实验数据
    每个实验有短期指标（可快速观测）+ 长期指标（需等待）
    """
    experiments = []
    for exp_id in range(n_experiments):
        n = n_users_per
        # 随机化分配（工具变量）
        treatment = np.random.binomial(1, 0.5, n)

        # 真实处理效应（每个实验略有不同）
        true_short_effect = np.random.uniform(0.02, 0.08)
        true_long_effect  = true_short_effect * np.random.uniform(2.5, 5.0)  # 长期效应更大

        # 短期代理指标（3周可观测）
        day7_repurchase = 0.22 + true_short_effect * treatment + np.random.normal(0, 0.05, n)
        day7_nps_proxy  = 0.35 + true_short_effect * 0.8 * treatment + np.random.normal(0, 0.08, n)
        cart_abandon    = 0.65 - true_short_effect * 0.5 * treatment + np.random.normal(0, 0.06, n)

        # 长期指标（12个月LTV，实验已完成可观测）
        ltv_12m = 180 + true_long_effect * 50 * treatment + np.random.normal(0, 20, n)

        exp_df = pd.DataFrame({
            'exp_id': exp_id,
            'treatment': treatment,
            'day7_repurchase': np.clip(day7_repurchase, 0, 1),
            'day7_nps_proxy':  np.clip(day7_nps_proxy, 0, 1),
            'cart_abandon':    np.clip(cart_abandon, 0, 1),
            'ltv_12m':         np.clip(ltv_12m, 50, 500),
        })
        experiments.append(exp_df)
    return pd.concat(experiments, ignore_index=True)

hist_data = generate_historical_experiments(n_experiments=8, n_users_per=500)
print(f"历史实验数据: {len(hist_data)}条, {hist_data['exp_id'].nunique()}个实验")
print(f"LTV均值={hist_data['ltv_12m'].mean():.0f}元, std={hist_data['ltv_12m'].std():.0f}元")

# ── 2. 两阶段代理指标法（2SLS）训练代理系数 ────────────────────────
# 阶段1：用治疗分配（IV）回归短期代理指标，消除混淆
short_cols = ['day7_repurchase', 'day7_nps_proxy', 'cart_abandon']

print("\n【第一阶段：IV→短期指标拟合】")
stage1_fitted = {}
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2202.07282。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史已结束的实验数据（卡页示例 8 个实验 × 500 用户，用于训练代理系数）+ 当前实验的短期指标（7 日复购、NPS 代理、购物车放弃率）；代理系数训练需 3-5 个含短期与长期跟踪的已完成实验。

**输出**：用短期指标预测的长期 LTV 效果与置信区间（卡页示例：B 方案 12 个月 LTV 预计高出 23%、95% CI [14%, 32%]），以及素材场景下的效果衰减曲线与建议投放周期（示例 4 周后优势降至 1.2%、8 周后归零）。

## 执行步骤

1. 收集已结束历史实验的短期指标与长期跟踪指标
2. 用两阶段最小二乘训练代理指标到长期指标的系数
3. 用当前实验的短期指标预测长期 LTV 或复购效果
4. 输出预测值与 95% 置信区间
5. 用历史素材实验的衰减曲线给出建议投放或迭代周期

## 边界与不做

- 何时不用：没有已结束且带长期跟踪的历史实验时无法训练代理系数（卡页提示冷启动期约 3-6 个月）；指标在实验期内已能稳定观测时用常规解读即可。卡页第 7 段为示例代码，落地需完整实现。
- 能力边界：代理指标与长期指标的关系可能随市场环境变化，卡页建议每半年重新校准代理系数；预测是估计而非观测，不替代长期实测。
- 合规边界：长期跟踪需按合规要求告知用户实验结束后仍会追踪行为。
- 卡页数字（LTV 高 23%、CI [14%, 32%]、长期预测 R²=0.72、年化避免 150 万元、素材 4 周与 8 周衰减、ROAS 损失减少 20%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD
- **延伸**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Long-Horizon-Experiment-Effect

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Long-Horizon-Experiment-Effect`