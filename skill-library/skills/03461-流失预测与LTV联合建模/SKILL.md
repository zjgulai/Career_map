---
name: "p2s-mtl-churn-ltv-joint-prediction"
title: "MTL Churn-LTV Joint Prediction — 流失预测与LTV联合建模"
description: "触发词：多任务学习、联合建模、流失与 LTV、优先级排序、共享表征、挽留名单。何时不用：只做单一任务时用对应的流失或 LTV 单卡；要同时输出流失概率与 LTV、并按加权合成触达优先级时用本卡。安全边界：行为数据采集须符合同意机制，触达须提供退出选项，不得基于模型结果做歧视性处置。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-MTL-Churn-LTV-Joint-Prediction"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一份模型同时给出流失风险和长期价值，按两者加权排出最该先挽留的人。"
user_try: "试试：这是我近 30/60/90 天的用户行为与消费数据，帮我联合训练流失与 LTV 两个任务并输出挽留优先级。"
whenToUse: "与「流失预测」相比：只要一份流失概率用那张卡；需要把流失风险与 LTV 放在一起看、避免误伤高价值用户时用本卡。"
workflow: "整理行为与消费特征（浏览、下单、复购、客单价、折扣敏感度） → 共享底层表征，接流失分类头与 LTV 回归头联合训练 → 按权重合成 churn_prob 与 ltv_pred 得出优先级 → 输出分层触达名单与优惠券预算建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MTL Churn-LTV Joint Prediction — 流失预测与LTV联合建模

## ① 解决的问题

数据科学家面临"流失预测和LTV预测分开建模两个模型都不够准"——MTL联合建模将两个任务准确率各提升15%，年化增收$7.2万

## ② 核心算法逻辑

论文：MultiTask Learning for Customer Churn and Lifetime Value Prediction | 年份：2017

## ③ 业务应用场景

场景：会员流失预警 + 高价值用户挽留 - 业务问题：只看流失会误伤高价值用户，只看 LTV 会漏掉短期掉线用户 - 数据要求：近 30/60/90 天游览、下单、复购、客单价、折扣敏感度、客服触达记录 - 预期产出：每个用户输出 churn_prob 和 ltv_pred，再按 alpha 合成优先级 - 业务价值：流失+LTV 联合准确率各提升 15%，年化增收 $7.2 万
三轨验证： - 成本轨：数据采集费用 $800/月（行为日志存储+ETL），模型训练计算资源 $200/月（GPU 小时），人力投入 160h（初期模型开发+验证），合计首期成本 $3,200，月度运维成本 $1,000 - 合规轨：✓ 合规。用户行为数据采集符合 GDPR 用户同意机制，流失预测不涉及歧视性决策，符合 Amazon 政策；触达策略需在用户偏好设置中提供退出选项，符合广告法第 7 条（明示身份） - 风险轨：(1) 竞品跟风降价促销，引发价格战，概率 35%；(2) 平台审查用户数据使用合规性，概率 15%；(3) 过度触达导致用户投诉率上升 5-8%，品牌口碑风险，概率 25
场景：分层触达策略 - 业务问题：高 LTV 且高流失风险用户优先进入人工挽留名单 - 数据要求：用户行为序列、历史消费金额、最后购买时间、促销响应 - 预期产出：挽留名单、优惠券预算建议、触达优先级 - 业务价值：减少无效优惠发放，提升挽留 ROI

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：联合建模使挽留名单命中率提升，年化增收 $7.2 万
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（74 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/mtl_churn_ltv_joint_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-MTL-Churn-LTV-Joint-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


class MTLChurnLTVModel:
    def __init__(self, alpha=0.6, random_state=42):
        self.alpha = alpha
        self.random_state = random_state
        self.shared_scaler = StandardScaler()
        self.churn_head = LogisticRegression(max_iter=1000, random_state=random_state)
        self.ltv_head = Ridge(alpha=1.0, random_state=random_state)

    def fit(self, X, y_churn, y_ltv):
        Xs = self.shared_scaler.fit_transform(X)
        self.churn_head.fit(Xs, y_churn)
        self.ltv_head.fit(Xs, y_ltv)
        return self

    def predict(self, X):
        Xs = self.shared_scaler.transform(X)
        churn_prob = self.churn_head.predict_proba(Xs)[:, 1]
        ltv_pred = self.ltv_head.predict(Xs)
        joint_score = self.alpha * churn_prob + (1 - self.alpha) * (ltv_pred / (ltv_pred.max() + 1e-9))
        return churn_prob, ltv_pred, joint_score


def make_synthetic_data(n=300, seed=7):
    rng = np.random.default_rng(seed)
    sessions = rng.poisson(12, n)
    orders = rng.poisson(3, n)
    days_since_last = rng.integers(0, 120, n)
    avg_basket = rng.lognormal(mean=3.3, sigma=0.35, size=n)
    discount_rate = rng.uniform(0, 0.6, n)
    support_tickets = rng.poisson(1.2, n)
    X = np.c_[sessions, orders, days_since_last, avg_basket, discount_rate, support_tickets]

    churn_logit = -0.08 * sessions - 0.25 * orders + 0.03 * days_since_last + 1.6 * discount_rate + 0.2 * support_tickets
    churn_prob = 1 / (1 + np.exp(-churn_logit))
    y_churn = (rng.random(n) < churn_prob).astype(int)

    ltv = 80 + 4.5 * sessions + 18 * orders - 0.4 * days_since_last + 26 * (1 - discount_rate) + rng.normal(0, 10, n)
    y_ltv = np.clip(ltv, 10, None)
    return X, y_churn, y_ltv


def run_demo():
    X, y_churn, y_ltv = make_synthetic_data()
    split = 240
    X_train, X_test = X[:split], X[split:]
    churn_train, churn_test = y_churn[:split], y_churn[split:]
    ltv_train, ltv_test = y_ltv[:split], y_ltv[split:]

    model = MTLChurnLTVModel(alpha=0.65).fit(X_train, churn_train, ltv_train)
    churn_prob, ltv_pred, joint_score = model.predict(X_test)

    churn_pred = (churn_prob >= 0.5).astype(int)
    churn_acc = accuracy_score(churn_test, churn_pred)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1706.05098 — An Overview of Multi-Task Learning in Deep Neural Networks
⚠️ 卡页 ② 段点名的论文是《MultiTask Learning for Customer Churn and Lifetime Value Prediction》，与这个号指的不是同一篇。

核验口径：主题指向成立但强度不足（词重合 0.167／点名相似 0.352）。引用前请自行确认。

## 输入 / 输出契约

**输入**：近 30/60/90 天浏览、下单、复购、客单价、折扣敏感度与客服触达记录，以及流失标签与 LTV 标签；两任务需同一批用户样本。

**输出**：每位用户的流失概率与 LTV 预测、加权后的挽留优先级名单与优惠券预算建议（卡页两任务准确率各提升 15%），供会员运营与客服排期。

## 执行步骤

1. 整理行为与消费特征并对齐两任务标签。
2. 构造共享表征，接入分类头与回归头联合训练。
3. 用权重参数合成两类预测，生成优先级分数。
4. 输出按优先级排序的触达名单与预算建议。
5. 分别评估两任务指标并监控触达投诉率。

## 边界与不做

- 何时不用：只有单任务标签、或样本无法对齐时不要用；单一流失预警不必上多任务。
- 能力边界：产出预测与优先级，不代发券；准确率各提升 15%、年化 $7.2 万为卡页案例值。
- 安全边界：数据采集须有同意基础，触达须可退出，不得做歧视性处置。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Subscription-Renewal-Intervention-Gate.html、Skill-Subscription-Renewal-Intervention-Gate、Skill-TikTok-Repurchase-From-Live-Audience.html、Skill-TikTok-Repurchase-From-Live-Audience、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Subscription-Renewal-Intervention-Gate.html、Skill-Subscription-Renewal-Intervention-Gate、Skill-TikTok-Repurchase-From-Live-Audience.html、Skill-TikTok-Repurchase-From-Live-Audience、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Journey-Prototype.html、Skill-Customer-Journey-Prototype、Skill-Subscription-Renewal-Intervention-Gate.html、Skill-Subscription-Renewal-Intervention-Gate、Skill-TikTok-Repurchase-From-Live-Audience.html、Skill-TikTok-Repurchase-From-Live-Audience、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-MTL-Churn-LTV-Joint-Prediction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-MTL-Churn-LTV-Joint-Prediction`