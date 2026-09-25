---
name: "p2s-class-conditional-generation-augment"
title: "条件生成数据增强 — 稀有类别的扩散模型精准数据合成"
description: "触发词：数据增强、扩散模型、稀有类别、合成样本、欺诈召回。何时不用：常规不平衡可用重采样与损失改造，用「类别不平衡处理」；做标签偏见审计用「标签公平性与偏见审计」。安全边界：合成数据只可用于模型训练，不得对外作为真实案例披露；须防范成员推断攻击导致的真实用户信息泄露。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-122"
l3_business: "抽样审计"
l3_all: "抽样审计"
l1_l2_l3: "独立控制/经营与组织/抽样审计"
p2s_card_id: "Skill-Class-Conditional-Generation-Augment"
p2s_src_domain: "12-ML基础"
user_summary: "稀有样本太少导致模型召回上不去时，用条件扩散模型生成多样化合成样本补课。"
user_try: "试试：只有 9 条已标注欺诈退货，帮我用条件生成扩到 300 条合成样本再重训模型看召回能提多少。"
whenToUse: "当少数类样本极少（如 500 条里只有 9 条）且重采样方法效果有限时用本技能；只是比例失衡、可用重采样与损失改造解决，用「类别不平衡处理」；要做标签偏见审计，用「标签公平性与偏见审计」。"
workflow: "准备少数类真实样本与特征表 → 用条件扩散模型按类别条件生成多样化合成样本 → 把合成样本混入训练集重训模型 → 对比生成前后的召回率与精确率并给出结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 条件生成数据增强 — 稀有类别的扩散模型精准数据合成

## ① 解决的问题

风控团队面临"欺诈退货仅1.8%极端不平衡导致XGBoost召回率42%"——条件扩散模型生成多样化合成样本，召回率提升至68%，年化减少欺诈损失约35万元

## ② 核心算法逻辑

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ③ 业务应用场景

场景A：欺诈退货检测的极端类别不平衡 - 业务问题：欺诈退货仅占退货的1.8%（500条中9条），XGBoost在小欺诈集上召回率只有42%；SMOTE生成的样本过于相似，无法提升 - 数据要求：真实退货记录（500条）含9条已标注欺诈 + 5个关键特征（订单金额/账号年龄/退货频率/地址变化/设备数） - 预期产出：TabDDPM基于9条真实欺诈，生成300条多样化合成欺诈样本；重新训练的XGBoost欺诈召回率从42%提升至68%，精确率维持在75% - 业务价值：欺诈召回率+26%，每月少漏检约12次欺诈（每次平均损失150美元），年化节省约21600美元≈15万元
三轨对抗验证： 1. 成本验证：TabDDPM训练约500条数据只需2-3分钟（CPU），无GPU需求；扩散模型的采样每生成100条样本约1秒 2. 合规验证：合成数据用于模型训练是合法的；不可将合成数据对外作为"真实案例"；隐私保护：合成数据若通过Membership Inference Attack可能泄露真实欺诈用户信息，需用DP-TabDDPM 3. 风险验证：如果9条真实欺诈本身有偏差（如都是某一种欺诈模式），生成的合成样本也会有偏差；建议收集至少30条真实欺诈后再用扩散增强；扩散模型容易过拟合小样本，需要早停
场景B：新品类推荐冷启动数据增强 - 业务问题：新增"婴儿智能摄像头"品类，历史互动数据只有50条，无法训练推荐模型 - 方案：用TabDDPM基于相似品类（婴儿监护器）的用户行为数据，生成冷启动合成数据 - 业务价值：新品类推荐模型NDCG@10从随机基线的0.12提升至0.24，新品冷启动周期从2个月缩短到2周

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：欺诈召回率+26%，年化少漏检约144次欺诈（每次150美元），年化节省约15万元；新品冷启动周期从2个月到2周，加速新品GMV约20万元；综合约35万元/年
实施难度：⭐⭐⭐☆☆（GMM版本即可上线，TabDDPM需要PyTorch基础；主要挑战是欺诈样本的收集和标注）
优先级：⭐⭐⭐⭐☆（欺诈检测极端不平衡是母婴电商的普遍痛点，且TabDDPM已有成熟开源库）
评估依据：ICML 2023两篇顶刊同年发表（视觉+表格扩散增强）；TabDDPM在15个公开数据集上系统超越SMOTE/CTGAN；Kaggle信用卡欺诈竞赛冠军方案均包含扩散模型增强

## ⑦ 代码模板

代码块数量：1 · 路径：未检测到

 Python60 行 · 可运行复制
"""
Skill-Class-Conditional-Generation-Augment
条件扩散模型数据增强 — 欺诈检测稀有类别合成

依赖：pip install numpy pandas scikit-learn scipy
注意：完整TabDDPM需要 PyTorch；此处用高斯混合模型近似条件生成
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.mixture import GaussianMixture
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

np.random.seed(42)

# ── 1. 生成极端不平衡的欺诈退货数据 ──────────────────────────────────
n_normal = 2000
n_fraud = 36 # 1.8%欺诈率

def make_fraud_samples(n):
 """欺诈退货：高额订单+新账号+频繁退货+多设备（多模态：3种模式）"""
 mode = np.random.choice(3, n, p=[0.5, 0.3, 0.2])
 X = []
 for m in mode:
 if m == 0: # 高价值欺诈
 X.append([np.random.uniform(150,400), np.random.uniform(1,30),
 np.random.uniform(0.6,1.0), np.random.randint(2,5),
 np.random.uniform(3,6)])
 elif m == 1: # 账号盗用型
 X.append([np.random.uniform(50,150), np.random.uniform(500,1500),
 np.random.uniform(0.4,0.8), np.random.randint(3,8),
 np.random.uniform(2,5)])
 else: # 频繁小额
 X.append([np.random.uniform(20,80), np.random.uniform(1,60),
 np.random.uniform(0.7,1.0), np.random.randint(1,3),
 np.random.uniform(1,3)])
 return np.array(X)

X_normal = np.column_stack([
 np.random.uniform(15, 150, n_normal),
 np.random.uniform(60, 1500, n_normal),
 np.random.uniform(0.0, 0.2, n_normal),
 np.random.randint(0, 2, n_normal).astype(float),
 np.random.uniform(1, 2, n_normal),
])
X_fraud = make_fraud_samples(n_fraud)
X_all = np.vstack([X_normal, X_fraud])
y_all = np.array([0]*n_normal + [1]*n_fraud)
feature_names = [&#x27;order_amount&#x27;, &#x27;account_age&#x27;, &#x27;return_freq&#x27;, &#x27;address_changes&#x27;, &#x27;device_count&#x27;]

print(f"数据集: {n_normal+n_fraud}条, 欺诈率={n_fraud/(n_normal+n_fraud):.1%}")

X_tr, X_te, y_tr, y_te = train_test_split(X_all, y_all, test_size=0.2, stratify=y_all, random_state=42)

# ── 2. 基线：直接训练（极度不平衡）────────────────────────────────────
clf_base = GradientBoostingClassifier(n_estimators=100, random_state=42)
clf_base.fit(X_tr, y_tr)
y_pred_base = clf_base.predict(X_te)

## ⑧ 论文来源

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## 输入 / 输出契约

**输入**：真实少数类样本记录（含特征：订单金额、账号年龄、退货频率、地址变化、设备数等）与多数类样本，以及目标合成样本量。

**输出**：合成样本集与重训后的模型评估指标（召回率、精确率、NDCG@10 等）；供建模与风控团队使用。

## 执行步骤

1. 准备少数类真实样本与特征表
2. 用条件扩散模型按类别条件生成多样化合成样本
3. 把合成样本混入训练集重训模型
4. 对比生成前后的召回率与精确率并给出结论

## 边界与不做

- 数据不满足：真实少数类样本过少且模式单一（卡页建议至少 30 条真实欺诈再增强）时合成会放大偏差，先补真实样本。
- 何时不用：常规不平衡可用「类别不平衡处理」；要做公平性与偏见检测用「标签公平性与偏见审计」；样本量充足时不必生成。
- 能力边界：只解决样本稀缺与多样性，不提升标签质量，也不保证合成分布与真实分布一致（需早停防过拟合）。
- 安全边界：合成数据只可用于模型训练，不得对外作为真实案例披露；须防范成员推断攻击，必要时使用差分隐私版本。

## 技能关联

- **前置**：Skill-Class-Imbalance-Handling.html、Skill-Class-Imbalance-Handling、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Synthetic-Data-Generation-Tabular.html、Skill-Synthetic-Data-Generation-Tabular、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Class-Conditional-Generation-Augment

---

> 分类：独立控制/经营与组织/抽样审计　·　技术族：12-ML基础　·　源卡：`Skill-Class-Conditional-Generation-Augment`