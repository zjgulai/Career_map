---
name: "p2s-out-of-distribution-detection"
title: "Out-of-Distribution Detection — OOD 检测识别分布外样本（新品/新市场冷启动防御）"
description: "触发词：OOD 检测、分布外样本、Energy Score、马氏距离、置信门控。何时不用：只在训练分布内做常规预测时不需要；要检测时间序列漂移点用「在线增量学习」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Out-of-Distribution-Detection"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "模型遇到没见过的新品或新市场时不再硬猜，先标出来交给人工判断，避免照瞎猜的数字备货。"
user_try: "试试：给新品需求预测加上 OOD 分数，把不可信的预测挑出来给我人工复核。"
whenToUse: "新品、新市场或极端事件下模型会给出高置信度错误预测、需要门控时用；分布内常规预测不需要；时序漂移点检测用在线增量学习。"
workflow: "整理新品或新市场样本特征向量与训练集类中心特征 → 计算 Energy Score 与马氏距离 → 按业务容忍度标定阈值分位 → 输出 OOD 分数与可信或转人工的分类"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Out-of-Distribution Detection — OOD 检测识别分布外样本（新品/新市场冷启动防御）

## ① 解决的问题

新品冷启动阶段需求预测模型对未知品类给出虚假高置信度预测导致备货严重失误——引入 OOD 检测（Energy Score+马氏距离）识别分布外样本，异常备货率降低 35%，新品冷启动库存准确率提升至 78%。

## ② 核心算法逻辑

核心问题：ML 模型在训练分布内表现良好，但遇到训练集未覆盖的样本（新品类、新市场、极端事件）时会给出高置信度的错误预测，而不是"不知道"。OOD 检测的目标是识别这类样本并触发人工审核或保守策略。

## ③ 业务应用场景

场景1：新品上线初期需求预测 OOD 检测 - 业务问题：需求预测模型对从未销售过的新品给出高置信度预测（实为瞎猜），导致备货严重失误 - 数据要求：新品特征向量 + 训练集的类中心特征（或 Energy Score 阈值） - 预期产出：每个新品的 OOD 分数 + "可信预测" vs "触发人工评估" 分类 - 业务价值：避免盲目相信模型对新品的预测，减少因此导致的滞销积压，年化减少库存损失 20-40 万元
**三轨验证**： - 成本：每次预测增加约 5ms 推理时间（Energy Score 计算），基本可忽略 - 合规：无合规风险，是增加模型可靠性的防御手段 - 风险：阈值设置过严会导致大量正常样本被标为 OOD，降低模型使用率；需要基于业务容忍度标定

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：减少对新品/新市场的盲目预测，年化减少备货失误损失 20-40 万元；间接提升模型可信度
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐☆
评估依据：母婴出海频繁推新品和进入新市场，OOD 检测是 ML 系统可靠性的基础设施；实现简单，收益明确。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（61 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

def energy_score(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Energy-based OOD score: lower energy = more in-distribution"""
    return -temperature * np.log(np.sum(np.exp(logits / temperature), axis=1))

def mahalanobis_distance(x: np.ndarray, class_means: np.ndarray,
                          precision: np.ndarray) -> np.ndarray:
    """Mahalanobis distance from nearest class center"""
    dists = []
    for mean in class_means:
        diff = x - mean
        dist = np.sqrt(np.einsum('ij,jk,ik->i', diff, precision, diff))
        dists.append(dist)
    return np.min(np.stack(dists, axis=1), axis=1)

class OODDetector:
    def __init__(self, threshold_percentile: float = 95.0):
        self.threshold_percentile = threshold_percentile
        self.threshold_ = None
        self.class_means_ = None
        self.precision_ = None

    def fit(self, features: np.ndarray, labels: np.ndarray):
        """Calibrate OOD threshold on in-distribution training data"""
        classes = np.unique(labels)
        self.class_means_ = np.array([features[labels == c].mean(axis=0) for c in classes])
        cov = np.cov(features.T)
        self.precision_ = np.linalg.inv(cov + 1e-6 * np.eye(cov.shape[0]))
        id_scores = mahalanobis_distance(features, self.class_means_, self.precision_)
        self.threshold_ = np.percentile(id_scores, self.threshold_percentile)
        return self

    def predict(self, features: np.ndarray) -> dict:
        scores = mahalanobis_distance(features, self.class_means_, self.precision_)
        is_ood = scores > self.threshold_
        return {
            "ood_scores": scores,
            "is_ood": is_ood,
            "ood_rate": is_ood.mean(),
        }

if __name__ == "__main__":
    np.random.seed(42)
    # 模拟训练数据（母婴产品特征：销量历史、类目、价格段）
    n_train = 200
    train_features = np.random.randn(n_train, 5)
    train_labels = np.random.randint(0, 3, n_train)
    # 测试：in-distribution + 新品（OOD，分布偏移）
    in_dist = np.random.randn(20, 5)
    ood_samples = np.random.randn(10, 5) * 3 + 5  # 明显偏移
    test_features = np.vstack([in_dist, ood_samples])
    detector = OODDetector(threshold_percentile=95)
    detector.fit(train_features, train_labels)
    result = detector.predict(test_features)
    print(f"OOD 检测率: {result['ood_rate']:.1%} (前20个in-dist, 后10个真OOD)")
    print(f"后10个样本 OOD 标记: {result['is_ood'][20:]}")
    assert result['is_ood'][20:].sum() >= 7, "OOD 样本应被大多数检测出"
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：新品或新市场样本的特征向量、训练集类中心特征或阈值标定数据；粒度：样本×特征。

**输出**：每个样本的 OOD 分数与分类结果（可信预测/触发人工评估），供备货审核与模型可信度管理使用。

## 执行步骤

1. 计算样本的 Energy Score 与马氏距离
2. 基于训练集分布标定 OOD 阈值
3. 输出 OOD 分数并区分可信与转人工
4. 复核阈值过严或过松带来的误判

## 边界与不做

- 数据不满足时不用：训练集样本过少、类中心无法估计时，OOD 分数没有校准基准。
- 能力边界：只做分布外识别与门控，不修正预测值，也不替代人工判断新品是否值得备货。
- 能力边界：阈值需按业务容忍度标定，过严会让大量正常样本被拦下。

## 技能关联

- **可组合**：Skill-Out-of-Distribution-Detection

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Out-of-Distribution-Detection`