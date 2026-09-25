---
name: "p2s-class-imbalance-handling"
title: "Class Imbalance Handling — SMOTE/ADASYN/Focal Loss 处理低频事件"
description: "触发词：类别不平衡、SMOTE、ADASYN、Focal Loss、低频事件。何时不用：少数类极少需要生成式合成用「条件生成数据增强」；做合规风险评分建模用「合规 ML 风险评分」。安全边界：过采样只能作用于训练集，禁止在验证集或测试集上重采样，避免评估指标泄漏。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-122"
l3_business: "抽样审计"
l3_all: "抽样审计"
l1_l2_l3: "独立控制/经营与组织/抽样审计"
p2s_card_id: "Skill-Class-Imbalance-Handling"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "欺诈、退货这类低频事件样本太少时，用重采样加损失函数改造把召回率提上来。"
user_try: "试试：我们欺诈检测召回只有 38%，帮我用 SMOTE 加 Focal Loss 重训一版看看能到多少。"
whenToUse: "当低频高价值事件（欺诈、退货、差评）类别严重不平衡、需要提升召回时用本技能；少数类极少需要生成式合成，用「条件生成数据增强」；要做合规违规概率打分的完整建模，用「合规 ML 风险评分」。"
workflow: "统计类别比例并建立不处理的基线模型 → 对训练集做 SMOTE 或 ADASYN 过采样 → 引入 Focal Loss 等损失改造重训模型 → 在未重采样的验证集上对比召回、精确率与 F1"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Class Imbalance Handling — SMOTE/ADASYN/Focal Loss 处理低频事件

## ① 解决的问题

风控运营面临"欺诈/退货低频事件召回率仅38%、大量漏检导致月均损失15万元"——SMOTE+Focal Loss将欺诈召回率从38%提升至78%，年化减损85-95万元

## ② 核心算法逻辑

真实业务数据往往严重不平衡：欺诈交易占 0.1%、产品退货 515%、高价值用户 2%。直接训练会导致模型偏向多数类，少数类召回率极低。

## ③ 业务应用场景

场景A：账号欺诈检测（欺诈率 < 0.5%）
- 业务问题：传统 GBM 在欺诈检测上召回率仅 38%，大量刷单账号漏检，平均每月损失约 15 万元 - 数据要求：历史交易日志（含特征：下单频率、IP 变动、设备指纹、支付方式），欺诈标签 - 预期产出：SMOTE + Focal Loss 组合将欺诈召回率从 38% 提升至 78%，精确率保持 > 70% - 业务价值：漏检减少 50%+，月均减损约 7-8 万元，年化节省 85-95 万元
- 业务问题：退货预测模型 F1 Score 仅 0.41，高退货订单无法提前干预（加售后支持、包装优化） - 数据要求：订单特征（品类/价格段/买家历史）+ 退货标签，近 6 个月数据 - 预期产出：ADASYN 处理后 F1 从 0.41 提升至 0.67，Top 精准率 > 80% - 业务价值：提前干预高风险订单，退货率降低约 1.5-2 个百分点，年化节省仓储+逆向物流成本约 20-30 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：欺诈识别召回率提升 40%，月均减损约 7-8 万元，年化节省 85-95 万元；退货高风险预测 F1 从 0.41→0.67，年化降低逆向物流成本约 20-30 万元
实施难度：⭐⭐☆☆☆（sklearn 内置支持，imbalanced-learn 库直接调用）
优先级：⭐⭐⭐⭐⭐
评估依据：欺诈、退货、差评等低频高价值事件在母婴跨境中普遍存在，是最高频需求之一；ROI 极高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（110 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.datasets import make_classification
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
from sklearn.utils import resample

np.random.seed(42)

# 模拟母婴账号欺诈场景：严重不平衡（欺诈率约 1%）
X, y = make_classification(
    n_samples=10000, n_features=12, n_informative=8,
    weights=[0.99, 0.01],  # 欺诈率 1%
    flip_y=0.01, random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

print(f"训练集分布: 多数类={sum(y_train==0)}, 少数类(欺诈)={sum(y_train==1)}, 比例={sum(y_train==1)/len(y_train):.3f}")


# ===== 方法1: 基线（不处理不平衡）=====
clf_baseline = GradientBoostingClassifier(n_estimators=100, random_state=42)
clf_baseline.fit(X_train, y_train)
y_pred_base = clf_baseline.predict(X_test)
f1_base = f1_score(y_test, y_pred_base, pos_label=1)


# ===== 方法2: SMOTE 手工实现（不依赖 imbalanced-learn）=====
def smote_oversample(X, y, minority_class=1, k=5, ratio=1.0):
    """简化版 SMOTE：在少数类 k-近邻间插值合成"""
    from sklearn.neighbors import NearestNeighbors
    X_min = X[y == minority_class]
    X_maj = X[y != minority_class]
    n_maj = len(X_maj)
    n_synthetic = int(n_maj * ratio) - len(X_min)
    if n_synthetic <= 0:
        return X, y
    nbrs = NearestNeighbors(n_neighbors=min(k + 1, len(X_min))).fit(X_min)
    _, indices = nbrs.kneighbors(X_min)
    synthetic = []
    np.random.seed(42)
    for _ in range(n_synthetic):
        idx = np.random.randint(len(X_min))
        neighbor_idx = indices[idx, np.random.randint(1, indices.shape[1])]
        lam = np.random.random()
        synthetic.append(X_min[idx] + lam * (X_min[neighbor_idx] - X_min[idx]))
    X_synthetic = np.array(synthetic)
    X_res = np.vstack([X, X_synthetic])
    y_res = np.hstack([y, np.ones(len(X_synthetic), dtype=int)])
    return X_res, y_res


X_smote, y_smote = smote_oversample(X_train, y_train, ratio=0.3)
clf_smote = GradientBoostingClassifier(n_estimators=100, random_state=42)
clf_smote.fit(X_smote, y_smote)
y_pred_smote = clf_smote.predict(X_test)
f1_smote = f1_score(y_test, y_pred_smote, pos_label=1)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史交易或订单日志（含下单频率、IP 变动、设备指纹、支付方式、品类、价格段等特征）与欺诈或退货标签，以及时间窗口（如近 6 个月）。

**输出**：处理后的训练数据与模型评估结果（召回率、精确率、F1、Top 精准率）及对比；供风控与算法团队上线模型。

## 执行步骤

1. 统计类别比例并建立不处理的基线模型
2. 对训练集做 SMOTE 或 ADASYN 过采样
3. 引入 Focal Loss 等损失改造重训模型
4. 在未重采样的验证集上对比召回、精确率与 F1

## 边界与不做

- 数据不满足：标签噪声大或正类样本过少时过采样会放大噪声，先做标签质量核查。
- 何时不用：少数类极少、需要生成式合成用「条件生成数据增强」；要做合规风险评分建模用「合规 ML 风险评分」；正负样本均衡时不必处理。
- 能力边界：只改善不平衡带来的召回损失，不解决特征缺失与标签错误问题。
- 安全边界：过采样只能作用于训练集，禁止在验证集或测试集上重采样，避免评估指标泄漏。

## 技能关联

- **前置**：Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics
- **延伸**：Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Model-Calibration.html、Skill-Model-Calibration
- **可组合**：Skill-Ensemble-Methods.html、Skill-Ensemble-Methods、Skill-Logistics-Fraud-Detection.html、Skill-Logistics-Fraud-Detection、Skill-Class-Imbalance-Handling

---

> 分类：独立控制/经营与组织/抽样审计　·　技术族：12-ML基础　·　源卡：`Skill-Class-Imbalance-Handling`