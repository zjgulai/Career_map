---
name: "p2s-propensity-score-matching-quasiexp"
title: "倾向得分匹配准实验 — 无随机分配场景的因果效应估计"
description: "触发词：倾向得分匹配、准实验、选择偏差、区域先后上线、敏感性分析。何时不用：可以随机分配时直接做实验，不必用匹配；处理组与对照组无重叠时匹配无效。安全边界：匹配所用行为数据须已脱敏且取得用户同意，结果不得对外展示个人级数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Propensity-Score-Matching-QuasiExp"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "在没法随机分配的场景（比如某城市先上线某功能）用匹配法扣掉选择偏差，看清功能真实效果有多大。"
user_try: "试试：加州先上线了视频导购、德州没上，销量涨了 18%，帮我用 PSM 算出真实因果效应。"
whenToUse: "当处理分配不是随机的（区域先后上线、价格调整的自然实验），需要去掉选择偏差估真实效应时用；能随机分流时用实验设计类技能；协变量不全、担心不可观测混淆时用敏感性分析判断结论可用范围。"
workflow: "整理用户级协变量、处理状态与结果变量 → 用逻辑回归估计倾向得分并做共同支撑检查 → 匹配特征相似的对照用户并检验匹配后的平衡性 → 估计匹配样本上的因果效应并做分层分析 → 用 Rosenbaum 敏感性分析量化未观测混淆的影响范围"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 倾向得分匹配准实验 — 无随机分配场景的因果效应估计

## ① 解决的问题

数据团队面临"区域先后上线无法随机化分配导致混淆偏差"——PSM去除选择偏差后真实因果效应从+18%校正至+12%，避免对无效功能投资，年化ROI约120万元

## ② 核心算法逻辑

核心问题：无法随机化分配时（如某城市先上线了会员功能，另一城市后上线），如何估计因果效应而不是选择偏差？

## ③ 业务应用场景

场景A：区域推广效果的因果评估 - 业务问题：婴儿推车品牌在加州先上线了"视频导购"功能，德州未上线。3个月后加州销量+18%，但不确定多少是"视频导购"的效果，多少是本来加州就增长更快（混淆） - 数据要求：用户级特征（历史购买频率、账号年龄、设备类型、搜索行为、加入时间）+ 处理状态（是否在加州）+ 结果（3个月购买量） - 预期产出：PSM消除选择偏差后，视频导购真实因果效应 = +12%（vs 原始未匹配的+18%，差距6%是混淆造成的虚高）；分层分析显示效果在新用户群体更强（+19%） - 业务价值：去除混淆后的真实ROI更准确，避免过度投资低回报功能；精准识别高效果用户群（新用户）
三轨对抗验证： 1. 成本验证：PSM计算量极小（Python scikit-learn），百万用户级别处理约5秒，零额外成本 2. 合规验证：使用用户行为数据做匹配需确保GDPR合规（数据已脱敏、有用户同意）；匹配结果不可对外展示个人级数据 3. 风险验证：PSM无法处理不可观测混淆（如"加州用户本来就更愿意尝鲜"这类无法测量的特质）；用Rosenbaum敏感性分析（γ检验）量化未观测混淆对结论的影响范围
场景B：价格策略的自然实验评估 - 业务问题：某品类在欧洲站价格下调15%（先于美国站），评估价格下调对销量的真实弹性，排除"欧洲本来就在增长"的混淆 - 数据要求：欧美站用户行为历史特征（配置相似用户作为控制组） - 预期产出：PSM后价格弹性 = -1.8（价格降10%，销量增18%），比原始OLS估计的-2.3更保守可靠 - 业务价值：更准确的弹性估计指导全球定价策略，避免过度降价牺牲利润，年化利润保护约60万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：准确的因果效应估计（去除混淆后比原始差距低6%），避免对无效功能过度投资，年化节省开发+运营成本约40万元；精准识别高效果用户群后优先投放，年化GMV增量约80万元
实施难度：⭐⭐☆☆☆（scikit-learn即可实现，无需专用库；主要挑战在协变量选择和匹配质量验证）
优先级：⭐⭐⭐⭐☆（任何无法随机化分配的业务场景均可用，适用范围极广）
评估依据：Rosenbaum & Rubin 1983年奠定理论基础，至今仍是观察研究的标准方法；Susan Athey（斯坦福）系列研究证明PSM+现代机器学习的结合是最佳实践；主流工业界（Airbnb/Uber/微软）均采用PSM评估区域推广效果

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（141 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Propensity-Score-Matching-QuasiExp
倾向得分匹配准实验 — 区域推广效果因果评估

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from scipy import stats

np.random.seed(42)

# ── 1. 生成观察性数据（模拟加州vs德州自然分配）───────────────────────
n = 2000
# 混淆变量：加州用户本来就更活跃（选择偏差来源）
california = np.random.binomial(1, 0.45, n)  # 45%在加州

# 协变量（混淆变量）
purchase_history  = 2 + 1.5 * california + np.random.exponential(1, n)  # 加州用户购买更多
account_age_days  = 200 + 100 * california + np.random.normal(0, 80, n)
mobile_user       = np.random.binomial(1, 0.55 + 0.1*california, n).astype(float)
search_frequency  = 5 + 2 * california + np.random.normal(0, 2, n)
prior_reviews     = np.random.poisson(2 + california, n).astype(float)

X = pd.DataFrame({
    'purchase_history': np.clip(purchase_history, 0, 20),
    'account_age_days': np.clip(account_age_days, 30, 1000),
    'mobile_user':      mobile_user,
    'search_frequency': np.clip(search_frequency, 0, 20),
    'prior_reviews':    prior_reviews,
})

# 处理变量：是否在加州（先上线视频导购）
treatment = california

# 结果变量：3个月购买量
# 真实因果效应 = +12%（视频导购的贡献）
# 混淆效应：加州本来就+6%
true_causal_effect = 0.12
base_purchases = (3
    + 0.5 * X['purchase_history']
    + 0.001 * X['account_age_days']
    + 0.3 * X['mobile_user']
    + 0.2 * X['search_frequency'])
purchases_3m = base_purchases * (1 + true_causal_effect * treatment) + np.random.normal(0, 1, n)
purchases_3m = np.clip(purchases_3m, 0, 30)

df = pd.DataFrame({**X, 'treatment': treatment, 'purchases_3m': purchases_3m})

print(f"数据集: {n}用户, 加州(处理组)={treatment.sum()}, 德州(控制组)={n-treatment.sum()}")
print(f"原始（未匹配）购买量差: {df[df['treatment']==1]['purchases_3m'].mean():.2f} - {df[df['treatment']==0]['purchases_3m'].mean():.2f} = {df[df['treatment']==1]['purchases_3m'].mean() - df[df['treatment']==0]['purchases_3m'].mean():+.2f}")

# ── 2. 倾向得分估计 ────────────────────────────────────────────────
feature_cols = list(X.columns)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[feature_cols].values)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户级特征（历史购买频率、账号年龄、设备类型、搜索行为、加入时间等协变量）+ 处理状态（如是否在加州、是否被调价）+ 结果变量（3 个月购买量或价格弹性）；卡页示例为 2000 用户规模。

**输出**：匹配后消除选择偏差的因果效应估计（卡页示例：视频导购真实效应 +12%，而未匹配的原始差距为 +18%）、分层结果（新用户 +19%），以及价格弹性估计（示例 -1.8，比原始 OLS 的 -2.3 更保守）。

## 执行步骤

1. 整理用户级协变量、处理状态与结果变量
2. 用逻辑回归估计倾向得分并做共同支撑检查
3. 匹配特征相似的对照用户并检验匹配后平衡性
4. 估计匹配样本上的因果效应并做分层分析
5. 用 Rosenbaum 敏感性分析量化未观测混淆的影响

## 边界与不做

- 何时不用：可以随机分配处理时直接做实验；处理组与对照组几乎无重叠、或协变量缺失严重时，匹配无法消除偏差。
- 能力边界：PSM 无法处理不可观测混淆（如某地区用户本来更愿意尝鲜），只能用敏感性分析量化其影响；本技能只估效应，不替代功能上线决策。
- 合规边界：匹配所用的用户行为数据须已脱敏且取得用户同意，匹配结果不得对外展示个人级数据。
- 卡页数字（+18% 校正为 +12%、新用户 +19%、弹性 -1.8 对比 -2.3、年化 40 万与 80 万元、利润保护 60 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-RDD-Regression-Discontinuity-Design.html、Skill-RDD-Regression-Discontinuity-Design、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal
- **延伸**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-RDD-Regression-Discontinuity-Design.html、Skill-RDD-Regression-Discontinuity-Design、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal
- **可组合**：Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-Propensity-Score-Matching-QuasiExp

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Propensity-Score-Matching-QuasiExp`