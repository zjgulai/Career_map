---
name: "p2s-causal-uplift-modeling"
title: "Causal Uplift Modeling — 因果提升模型：识别\"可说服者\"的跨域基础层"
description: "触发词：提升模型、可说服者、增量响应、发券阈值、因果归因、促销预算。何时不用：要按用户价格弹性排序推荐用「价格感知推荐」；要生成有限资源的执行队列用「Uplift 干预优先级队列」。安全边界：基于提升模型的差异化发券须避免对受保护属性的歧视，用户特征使用须符合个人信息保护要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 生命周期触达 / 分群"
l1_l2_l3: "业务运营/渠道经营/促销规划"
p2s_card_id: "Skill-Causal-Uplift-Modeling"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "别把券发给本来就会买的人：用因果提升模型找出因为这张券才下单的用户，只给他们发。"
user_try: "试试：我每月发 2 万张 20% 折扣券，帮我用历史 A/B 数据识别可说服者，并给出该发的阈值。"
whenToUse: "当促销资源有限、需要区分必然购买者、可说服者与抵触型以决定发给谁时用本技能；若只是按价格偏好排序商品，用「价格感知推荐」；若要把效应变成有限券的领取队列，用「Uplift 干预优先级队列」。"
workflow: "整理历史 A/B 实验数据：有券组与无券组的购买结果 → 用 T-Learner 分别训练处理组与对照组模型 → 对每个用户计算增量响应得分 → 按阈值划分可说服者、中立与抵触型用户并定发券阈值 → 用增量投入产出比核对发券成本与增量成交"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal Uplift Modeling — 因果提升模型：识别"可说服者"的跨域基础层

## ① 解决的问题

母婴品牌发2万张优惠券时60-70%给了本来就会买的用户白白损失利润——因果提升模型从A/B实验数据识别「可说服者」，精准发券后ROI从1.2x提升至3-5x，年化节省无效促销50-80万元

## ② 核心算法逻辑

传统机器学习预测"谁会买"，Uplift Modeling 预测"谁因为我们的干预才会买"。两者差异在于因果归因：找到 CATE（条件平均处理效应），即每位用户在"被干预 vs 不被干预"两种情景下的响应差异。

## ③ 业务应用场景

业务问题：每月发 2 万张 20% 折扣券，其中 60-70% 是"必然购买者"（拿了券也会买，白给折扣）。Uplift 模型识别真正的"可说服者"，只向他们发券，节省预算同时提升增量 GMV。
数据要求： - 历史 A/B 实验数据：有券组 vs 无券组的购买结果 - 用户特征：购买历史、浏览行为、品类偏好、注册天数
预期产出： - 每位用户的 CATE 得分（升序排列） - 最优发券阈值：CATE > X 的用户值得发券 - 增量 ROI：发券成本 vs 真实增量 GMV

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
优惠券精准定向：从全量发送到仅向可说服者发送，ROI 从 1.2x 提升至 3-5x
月均优惠券预算 ¥10 万 → 精准后节省 ¥4-6 万/月
年化 ROI：¥50-80 万（节省无效促销 + 增量 GMV）
实施难度：⭐⭐☆☆☆（需要 A/B 实验历史数据；scikit-learn 可实现；约 1-2 周）
优先级评分：⭐⭐⭐⭐⭐（图谱基础层 Skill，被3个高层 Skill 依赖；用户运营最高 ROI 的基础工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（95 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/causal_uplift_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Causal-Uplift-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Causal Uplift Modeling — T-Learner & X-Learner 实现
母婴跨境电商优惠券发放精准化
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier


class TLearnerUplift:
    """T-Learner Uplift Model：分别训练处理组和对照组"""

    def __init__(self, base_model=None):
        self.model_t = base_model or GradientBoostingClassifier(n_estimators=100, random_state=42)
        self.model_c = base_model or GradientBoostingClassifier(n_estimators=100, random_state=42)

    def fit(self, X, treatment, outcome):
        idx_t = treatment == 1
        idx_c = treatment == 0
        self.model_t.fit(X[idx_t], outcome[idx_t])
        self.model_c.fit(X[idx_c], outcome[idx_c])
        return self

    def predict_uplift(self, X):
        p_t = self.model_t.predict_proba(X)[:, 1]
        p_c = self.model_c.predict_proba(X)[:, 1]
        return p_t - p_c

    def classify_users(self, X, threshold=0.05):
        uplift = self.predict_uplift(X)
        segments = np.where(uplift > threshold, 'Persuadable',
                   np.where(uplift < -threshold, 'Sleeping_Dog', 'Neutral'))
        return uplift, segments


def generate_sample_data(n=2000, seed=42):
    """生成模拟母婴用户优惠券实验数据"""
    np.random.seed(seed)
    # 用户特征
    purchase_history = np.random.poisson(3, n)
    days_since_last  = np.random.exponential(30, n)
    category_loyalty = np.random.uniform(0, 1, n)
    clv_score        = np.random.lognormal(3, 1, n)

    X = np.column_stack([purchase_history, days_since_last, category_loyalty, clv_score])

    # 随机处理分配（A/B实验）
    treatment = np.random.binomial(1, 0.5, n)

    # 真实提升效应（异质性：价格敏感用户提升更大）
    true_uplift = 0.2 * (category_loyalty < 0.4) + 0.1 * (days_since_last > 20) - 0.05
    base_prob   = 0.1 + 0.05 * np.log1p(purchase_history)
    p_outcome   = np.clip(base_prob + treatment * true_uplift, 0.01, 0.99)
    outcome     = np.random.binomial(1, p_outcome)

    return X, treatment, outcome, true_uplift


def run_uplift_analysis():
    print("=" * 60)
    print("Causal Uplift Modeling — 母婴电商优惠券精准发放")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1706.03461，但该号在 arXiv 上是《Meta-learners for Estimating Heterogeneous Treatment Effects using Machine Learning》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史 A/B 实验数据（有券组与无券组的购买结果）与用户特征（购买历史、浏览行为、品类偏好、注册天数）；粒度为用户 × 干预实验。

**输出**：每位用户的增量响应得分与人群分类（可说服者、中立、抵触型）、最优发券阈值与增量投入产出比估算；供用户运营制定发券名单。

## 执行步骤

1. 整理有券与无券的历史实验数据
2. 用双模型分别拟合处理组与对照组
3. 计算每位用户的增量响应得分
4. 按阈值划分可说服者、中立与抵触型
5. 用增量投入产出比核定发券阈值

## 边界与不做

- 数据不满足：没有带对照组的 A/B 历史数据时算不出增量，得到的只是相关性。
- 何时不用：按价格偏好排序用「价格感知推荐」；有限资源队列生成用「Uplift 干预优先级队列」。
- 能力边界：只做效应估计与阈值建议，不含券系统对接与发放执行。
- 安全边界：差异化发券须避免受保护属性歧视，用户特征使用须符合个人信息保护要求。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Causal-Uplift-Modeling

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Uplift-Modeling`