---
name: "p2s-heterogeneous-treatment-effect-xlearner"
title: "X-Learner异质处理效应 — 识别不同用户群的差异化因果效应"
description: "触发词：异质处理效应、X-Learner、个体效应、差异化发券、广告定向、交叉拟合。何时不用：只需筛出可说服者做发券用「因果提升模型」；要做实验子群挖掘与规则解释用「因果森林异质处理效应」。安全边界：基于个体效应的差异化发券与定价须注意价格歧视合规，优先使用中性属性（如月龄），不使用受保护属性。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 分群"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Heterogeneous-Treatment-Effect-XLearner"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "谁对折扣真有反应、谁反而会掉：算出每个人的差异化效应，再决定把券和广告预算投给谁。"
user_try: "试试：我给用户发 10% 折扣券，整体复购只涨 3%，帮我用 X-Learner 看看哪类用户效应最高、哪类反而是负的。"
whenToUse: "当处理组与控制组比例不平衡、且需要比平均效应更细的个体化效应估计时用本技能；若只需按增量响应筛出可说服者，用「因果提升模型」；若用因果森林做子群挖掘与规则解释，用「因果森林异质处理效应」。"
workflow: "整理实验的处理分配、结果变量与用户特征：月龄、消费频次、账号年龄、客单价 → 训练倾向得分模型与两组结果模型 → 用 X-Learner 三阶段估计个体效应 → 输出各用户群的效应排序与负效应人群 → 按效应阈值重排发券与广告预算分配"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# X-Learner异质处理效应 — 识别不同用户群的差异化因果效应

## ① 解决的问题

运营面临"发券无差别，低效用户占用预算"——X-Learner识别高CATE人群，缩减72%发券量仍保持高效果覆盖，年化节省+增量约80万元

## ② 核心算法逻辑

Uplift Modeling已有，但它主要处理平均处理效应（ATE）。真实业务问题更微妙：折扣优惠券对哪类用户最有效？会员权益对哪个月龄段的妈妈有更强复购效果？

## ③ 业务应用场景

场景A：会员折扣的差异化效果分析 - 业务问题：给用户发10%折扣券，总体复购率提升了3%，但运营怀疑对不同月龄段/消费频次的用户效果差异很大，希望精准投放 - 数据要求：历史折扣投放实验数据（A/B分组）+ 用户特征（月龄、消费频次、账号年龄、历史AOV）+ 结果变量（30天复购率） - 预期产出：X-Learner输出每个用户的个性化CATE估计：0-6月龄新手妈妈 CATE = +8%；老用户（账号>1年）CATE = +1%；中高消费频次用户 CATE = +5%；低频用户 CATE = -2%（负效应！） - 业务价值：仅对高CATE用户投放折扣券（CATE>4%），节省券成本约40
三轨对抗验证： 1. 成本验证：X-Learner底层用任意ML模型（GBM/RF），训练时间约3-10分钟；推理时间约1秒/万用户 2. 合规验证：基于CATE差异化定价/发券需注意价格歧视合规（美国联邦贸易委员会关注基于受保护属性的差异化）；月龄是中性属性，合规 3. 风险验证：X-Learner对模型规格敏感，建议用多个底层模型取平均（Ensemble），并用交叉拟合（Cross-fitting）避免过拟合偏差
场景B：广告定向的因果增益评估 - 业务问题：视频广告在不同地区/设备类型上的真实增量效果不同，希望根据CATE优化预算分配 - 数据要求：广告随机实验数据（不同市场的控制/处理组）+ 用户地区/设备/行为特征 - 预期产出：移动端用户CATE=+4.5%，桌面端CATE=+1.2%；西海岸CATE=+6%，中西部CATE=+2% - 业务价值：按CATE重新分配广告预算，整体ROAS提升约15%，年化增量约60万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：精准发券节省约40%券成本（约20万元/年），同时维持效果；按CATE优化广告定向ROAS提升约15%（约60万元增量）；综合约80万元/年
实施难度：⭐⭐⭐☆☆（需要A/B实验数据；X-Learner实现约100行代码；主要挑战在模型规格选择和效果验证）
优先级：⭐⭐⭐⭐⭐（任何有促销/干预A/B数据的场景都可用，且比传统Uplift提供更细粒度的用户洞察）
评估依据：PNAS 2019顶刊，引用量1000+；业界Airbnb/Meta/Netflix均公开分享Metalearner用于个性化实验分析；causalml/econml库均内置X-Learner实现

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（132 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Heterogeneous-Treatment-Effect-XLearner
X-Learner异质处理效应估计 — 母婴用户差异化促销效果

依赖：pip install numpy pandas scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.model_selection import cross_val_predict

np.random.seed(42)

# ── 1. 生成模拟用户数据（处理组/控制组不平衡：20%/80%）──────────────
n = 3000
# 用户特征
baby_age_months  = np.random.randint(0, 24, n).astype(float)
purchase_freq    = np.random.exponential(2, n)  # 月均购买次数
account_age_days = np.random.uniform(30, 1500, n)
avg_order_value  = np.random.lognormal(4.5, 0.5, n)  # 元

X = np.column_stack([baby_age_months, purchase_freq, account_age_days, avg_order_value])
feature_names = ['baby_age_months', 'purchase_freq', 'account_age_days', 'avg_order_value']

# 倾向得分（处理组20%）
propensity = 0.2 * np.ones(n)
T = np.random.binomial(1, propensity)

# 真实个性化处理效应（HTE）
true_cate = (
    0.08 * (baby_age_months < 6)           # 新生儿期效果最强
    + 0.04 * (purchase_freq > 3)            # 高频用户有效
    - 0.03 * (account_age_days > 500)       # 老用户效果弱
    + 0.02 * (avg_order_value > 150)        # 高消费效果强
)
true_ate = true_cate.mean()

# 潜在结果
Y0 = 0.25 + 0.01*purchase_freq + np.random.normal(0, 0.05, n)
Y1 = Y0 + true_cate + np.random.normal(0, 0.03, n)
Y  = T * Y1 + (1-T) * Y0  # 观测结果

df = pd.DataFrame({**{f: X[:, i] for i, f in enumerate(feature_names)},
                   'T': T, 'Y': Y, 'true_cate': true_cate})

print(f"数据: n={n}, 处理组={T.sum()} ({T.mean():.0%}), 控制组={n-T.sum()}")
print(f"真实ATE={true_ate:.4f}, 真实CATE范围=[{true_cate.min():.3f}, {true_cate.max():.3f}]")

# ── 2. X-Learner 三阶段实现 ──────────────────────────────────────────
class XLearner:
    def __init__(self, base_learner_cls=GradientBoostingRegressor):
        self.mu0 = base_learner_cls(n_estimators=100, max_depth=3, random_state=42)
        self.mu1 = base_learner_cls(n_estimators=100, max_depth=3, random_state=42)
        self.tau0 = base_learner_cls(n_estimators=100, max_depth=3, random_state=42)
        self.tau1 = base_learner_cls(n_estimators=100, max_depth=3, random_state=42)
        self.propensity_model = GradientBoostingClassifier(n_estimators=50, random_state=42)

    def fit(self, X, Y, T):
        X0, Y0 = X[T==0], Y[T==0]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1706.03461 — Meta-learners for Estimating Heterogeneous Treatment Effects using Machine Learning
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史折扣或广告投放实验数据（处理组与控制组）与用户特征（月龄、消费频次、账号年龄、历史客单价、地区、设备）；卡页建议用交叉拟合避免过拟合；粒度为用户 × 实验。

**输出**：每位用户的个性化效应估计、细分人群效应排序与负效应人群清单，以及按效应重排的发券与预算分配建议；供增长与投放团队使用。

## 执行步骤

1. 整理实验处理、结果与用户特征数据
2. 训练倾向得分与两组结果模型
3. 用三阶段方法估计个体效应
4. 输出人群效应排序与负效应人群
5. 按效应阈值重排发券与广告预算

## 边界与不做

- 数据不满足：没有 A/B 实验数据时估不出反事实；本方法对模型规格敏感，建议多模型平均加交叉拟合。
- 何时不用：可说服者筛选用「因果提升模型」；子群挖掘与规则解释用「因果森林异质处理效应」。
- 能力边界：只做效应估计与分配建议，不含券系统与广告平台执行。
- 安全边界：差异化发券与定价须注意价格歧视合规，只使用中性属性，不使用受保护属性。

## 技能关联

- **前置**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-Propensity-Score-Matching-QuasiExp.html、Skill-Propensity-Score-Matching-QuasiExp、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Personalized-Promotion-Targeting.html、Skill-Personalized-Promotion-Targeting、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Heterogeneous-Treatment-Effect-XLearner

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：01-因果推断　·　源卡：`Skill-Heterogeneous-Treatment-Effect-XLearner`