---
name: "p2s-causal-churn-retention-attribution"
title: "Causal Churn Retention Attribution — Uplift + DiD 因果用户流失归因与留存优化"
description: "触发词：因果归因、Uplift、CATE、DiD、可说服用户、促销 ROI。何时不用：预测谁会流失但不问干预效果用流失预测卡；要判断发券到底有没有带来增量、流失是哪个因子造成时用本卡。安全边界：需有随机或近似随机的处理记录，结果须标注置信区间，结论须合规披露方法论，不得操作用户数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Causal-Churn-Retention-Attribution"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "只给真正会被优惠券说动的人发券，并搞清楚流失到底是价格、缺货还是竞品造成的。"
user_try: "试试：这是我的发券记录与续订结果，帮我估计每位用户的 CATE，圈出可说服用户，并用 DiD 拆解流失因子。"
whenToUse: "与「流失预测」相比：只要一份风险打分用那张卡；要评估干预增量收益、决定给谁发券时用本卡的因果方法。"
workflow: "整理用户特征、是否发券与续订结果的历史记录 → 用 DR-Learner 估计每位用户的 CATE → 按 CATE 阈值圈出可说服用户，只对该群体发券 → 用 DiD 三重交互分解价格、缺货、竞品各因子贡献"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal Churn Retention Attribution — Uplift + DiD 因果用户流失归因与留存优化

## ① 解决的问题

母婴订阅运营面临流失挽留精准度不足——DR-Learner uplift 模型识别可说服用户（30%），将挽留 ROI 从 1.2x 提升至 4.8x，DiD 三重交互精准分解价格/产品/竞品各因子净贡献，年化节省无效促销成本 30-100 万元

## ② 核心算法逻辑

核心问题：用户流失挽留中，"发券给谁"比"发什么券"更重要。naive 模型看到"收到券的用户留存更好"——但这是选择偏差：运营往往只对高价值用户发券，他们本来就不会流失。

## ③ 业务应用场景

- 业务问题：母婴奶粉/纸尿裤订阅服务季度续订率下滑 12pp，运营默认"发优惠券 = 提升留存"，给所有流失预警用户发 8 元券，月均成本 4.2 万元，但实际挽留率仅 18% - 数据要求：用户特征（购买频次、客单价、会员等级、最近一次购买距今天数）、是否收到优惠券（T）、30 天内是否续订（Y），约 500-2000 条历史记录 - 预期产出：每位用户的 CATE 估计 τ(x)，圈出 CATE > 阈值的"可说服用户"（约 30%），仅对此群体发券 - 业务价值：发券成本降低 70%，挽留 ROI 从 1.2x 提升至 4.8x，年化节省无效促销成本 30-100 万元
- 业务问题：Q3 流失率同比暴增 15pp，同期发生了三件事：调价 +8%、主推 SKU 缺货 2 周、竞品推出月度订阅，不知道哪个因素是主因 - 数据要求：按周/月的用户群流失数据（处理前后各 3 期），能区分受影响用户（暴露组）vs 未暴露用户（对照组） - 预期产出：价格因子贡献 +6pp，产品缺货贡献 +5pp，竞品贡献 +4pp（含交互项），指导资源优先修复供应链而非降价 - 业务价值：避免用降价解决供应链问题，单次决策节省促销预算 50-200 万元
**三轨验证** | 成本轨：因果推断模型开发月均3,500元（数据标注2,000元+模型训练1,200元+人工验证300元），需投入人工12小时/月；A/B测试成本月均2,800元（流量成本1,500元+技术维护1,300元），年化成本77,600元。与年化42万元促销归因收益相比，ROI为4.4:1 | 合规轨：符合《电商平台促销规范》和《消费者权益保护法》第八条（知情权）；因果推断结果需标注置信区间（建议≥95%）并在营销物料中披露方法论；依据：国家市场监管总局2023年电商合规指南 | 风险轨：①模型偏差风险（概率15%）——因果识别不足导致归因错误，影响决策准确性；②数据隐私风险（概

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：挽留 ROI 从 1.2x 提升至 4.8x（基于 30% 可说服用户比例 + 8 元券成本 + 50 元 LTV 增量估算）；年化节省无效促销成本 30-100 万元（视订阅用户体量而定，1 万流失用户规模基准）
实施难度：⭐⭐⭐⭐☆（需历史实验数据或近似随机化的发券记录，倾向得分假设较强）
优先级：⭐⭐⭐⭐⭐（订阅业务高频决策场景，ROI 杠杆显著）
数据门槛：≥300 条含处理/对照的留存记录，处理率建议 10%-70%（极端倾向得分会导致方差爆炸）
关键风险：违反可忽略性假设（运营有未观测选择逻辑）→ 可结合 RCT 验证；DiD 平行趋势需在 Post 期前 3 期图形验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（274 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/causal_churn_retention_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Causal-Churn-Retention-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import cross_val_predict
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# ─────────────────────────────────────────────
# 数据生成：500个母婴订阅用户
# ─────────────────────────────────────────────
def generate_baby_subscription_data(n=500):
    """生成母婴订阅用户模拟数据"""
    # 用户特征
    recency = np.random.exponential(30, n)           # 最近一次购买距今(天)
    frequency = np.random.poisson(5, n) + 1          # 过去6个月购买次数
    monetary = np.random.lognormal(4.5, 0.5, n)      # 平均客单价(元)
    membership = np.random.choice([0, 1, 2], n, p=[0.5, 0.3, 0.2])  # 会员等级

    X = np.column_stack([recency, frequency, monetary, membership])

    # 倾向得分：高价值用户更容易收到券（运营bias）
    propensity_logit = -1.0 + 0.02 * frequency - 0.003 * recency + 0.3 * membership
    propensity = 1 / (1 + np.exp(-propensity_logit))
    T = (np.random.random(n) < propensity).astype(int)

    # 潜在结果：CATE 异质性（recency 大、frequency 低的用户对券更敏感）
    cate_true = 0.15 - 0.002 * recency + 0.02 * frequency + 0.05 * membership
    cate_true = np.clip(cate_true, -0.05, 0.4)

    # 基础留存概率
    base_retention = 0.3 + 0.02 * frequency - 0.003 * recency + 0.1 * membership
    base_retention = np.clip(base_retention, 0.05, 0.95)

    Y = (np.random.random(n) < (base_retention + T * cate_true)).astype(int)

    return X, T, Y, cate_true, propensity


# ─────────────────────────────────────────────
# Phase 1: S-Learner 基础 Uplift（基准方法）
# ─────────────────────────────────────────────
def s_learner_uplift(X, T, Y):
    """S-Learner: 将T作为特征，预测处理/对照的差值"""
    XT = np.column_stack([X, T])
    model = LogisticRegression(max_iter=1000, C=0.5)
    model.fit(XT, Y)

    X1 = np.column_stack([X, np.ones(len(X))])
    X0 = np.column_stack([X, np.zeros(len(X))])

    uplift = model.predict_proba(X1)[:, 1] - model.predict_proba(X0)[:, 1]
    return uplift


# ─────────────────────────────────────────────
# Phase 2: DR-Learner 双重鲁棒 Uplift
# ─────────────────────────────────────────────
def dr_learner_uplift(X, T, Y, n_folds=5):
    """
    DR-Learner: 双重鲁棒元学习器
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户特征（购买频次、客单价、会员等级、最近购买距今天数）、是否接受干预（如是否发券）与 30 天内续订结果，约 500–2000 条历史记录；卡页要求至少 300 条含处理/对照的记录，处理率 10%–70%。

**输出**：每位用户的 CATE 估计与可说服用户名单（卡页约 30%）、DiD 因子贡献分解（卡页价格 +6pp、缺货 +5pp、竞品 +4pp）与资源优先修复建议。

## 执行步骤

1. 整理处理与对照标签及用户特征，检查处理率是否落在可用区间。
2. 用倾向得分或交叉拟合消除选择偏差。
3. 训练 DR-Learner 输出每位用户的 CATE。
4. 圈定 CATE 超过阈值的可说服用户，仅对其发放干预。
5. 用 DiD 分解流失因子并输出资源修复优先级。

## 边界与不做

- 何时不用：没有处理与对照记录、干预完全非随机且不可忽略时不要用；只想要流失名单不必上因果模型。
- 能力边界：产出 CATE 与因子贡献，不代发券；挽留 ROI 1.2x→4.8x、年化节省 30–100 万元为卡页案例值，结论须附置信区间。
- 安全边界：可忽略性假设不成立时结论不可用，须结合 RCT 验证，DiD 需先做平行趋势检验。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Sentiment-Attribution.html、Skill-Causal-Sentiment-Attribution、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Causal-Churn-Retention-Attribution

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Churn-Retention-Attribution`