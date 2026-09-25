---
name: "p2s-epicscore-uncertainty"
title: "认知不确定性共形评分 - 数据稀疏区域自适应区间加宽"
description: "触发词：共形区间、认知不确定性、稀疏路径置信、区间加宽、小样本转化率。何时不用：只做小样本场景的共形覆盖修正时用「小样本Beta修正共形预测」；只做ROI区间估计时用「共形预测ROI区间估计」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 增量分析"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-EPICSCORE-Uncertainty"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给桑基图每条路径的转化率配上可信区间，数据太少的冷门路径自动放宽，避免把小样本当成稳定结论。"
user_try: "试试：把这张桑基图每条路径边做成EPICSCORE区间，标出哪些边观测量太少、结论不可信。"
whenToUse: "需要区分数据充足区域与稀疏区域、给每条路径边输出可信转化区间时用本技能；只做小样本覆盖修正时用「小样本Beta修正共形预测」；只做ROI区间估计时用「共形预测ROI区间估计」；需要把未观测的页面转移补成完整矩阵时用「超稀疏矩阵补全」或「不确定性感知矩阵补全」。"
workflow: "为每条路径边整理观测并按回归split分数或CQR分数计算非一致性分数 → 把校准数据拆成D_cal,1与D_cal,2两段 → 用高斯过程后端对非一致性分数的条件分布建模，在D_cal,1上拟合后验 → 在D_cal,2上完成共形校准得到加权区间 → 输出各边加宽后的区间并标注哪条边可信"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 认知不确定性共形评分 - 数据稀疏区域自适应区间加宽

## ① 解决的问题

桑基图中每条边代表一条用户路径转化，观测量差异极大

## ② 核心算法逻辑

标准共形预测对所有数据点使用统一的非一致性分数，无法区分"数据多的区域"和"数据少的区域"。根本原因：传统共形分数只捕捉偶然不确定性（aleatoric uncertainty，数据本身的随机性），对认知不确定性（epistemic uncertainty，训练数据不足导致的模型无知）视而不见——在数据稀疏区域仍然给出窄区间，形成虚假的高置信度。

## ③ 业务应用场景

桑基图中每条边代表一条用户路径转化，观测量差异极大：
| 路径边 | 日均观测量 | 标准共形区间 | EPICSCORE 区间 | 决策含义 | |--------|-----------|-------------|----------------|---------| | SEARCH → PDP | 5,000次 | [78%, 82%] | [77%, 83%] | 数据充足，区间无明显变化 | | PDP → CART | 2,100次 | [43%, 49%] | [42%, 50%] | 数据较充足 | | SUPPORT → CHECKOUT | 23次 | 标准方法仍给 [8%, 38%] | [5%, 45%] | 数据稀疏
一眼看出哪条边可信、哪条边不可信，避免把小样本冷门路径的点估计误作稳定洞察。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（441 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/causal_inference/epicscore_uncertainty` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-EPICSCORE-Uncertainty.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
EPICSCORE 完整实现
论文: arXiv:2502.06995 — Epistemic Uncertainty in Conformal Scores: A Unified Approach

依赖:
  pip install numpy scipy scikit-learn gpytorch torch bartpy
  或: conda install numpy scipy scikit-learn pytorch -c pytorch
      pip install gpytorch bartpy
"""

import numpy as np
from scipy.stats import norm
from sklearn.linear_model import QuantileRegressor
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings("ignore")


# ─────────────────────────────────────────────
# 一、非一致性分数定义（任意分数可替换）
# ─────────────────────────────────────────────

def regression_split_score(y_pred: np.ndarray, y_true: np.ndarray) -> np.ndarray:
    """标准回归 split 分数: s(x,y) = |y - g(x)|"""
    return np.abs(y_true - y_pred)


def cqr_score(q_lo: np.ndarray, q_hi: np.ndarray, y_true: np.ndarray) -> np.ndarray:
    """CQR 分数: s(x,y) = max(q_lo(x)-y, y-q_hi(x))"""
    return np.maximum(q_lo - y_true, y_true - q_hi)


# ─────────────────────────────────────────────
# 二、贝叶斯后端 A — 高斯过程（GP）
# ─────────────────────────────────────────────

class GPEpistemicModel:
    """
    用 GP 对非一致性分数的条件分布建模。
    返回预测均值和方差，用正态近似计算 F(s | x, D)。
    依赖: gpytorch（可替换为 sklearn.gaussian_process）
    """

    def __init__(self, length_scale: float = 1.0, noise_var: float = 0.1):
        self.length_scale = length_scale
        self.noise_var = noise_var
        self._X_train = None
        self._s_train = None
        self._K_inv = None

    def _rbf_kernel(self, X1: np.ndarray, X2: np.ndarray) -> np.ndarray:
        """RBF 核函数"""
        diff = X1[:, None, :] - X2[None, :, :]  # (n1, n2, d)
        dist_sq = np.sum(diff ** 2, axis=-1)
        return np.exp(-0.5 * dist_sq / self.length_scale ** 2)

    def fit(self, X_cal1: np.ndarray, scores_cal1: np.ndarray):
        """在 D_cal,1 上拟合 GP 后验"""
        self._X_train = X_cal1
        self._s_train = scores_cal1
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2502.06995。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：每条路径边的转化观测与日均观测量（示例：SEARCH到PDP约5,000次、PDP到CART约2,100次、SUPPORT到CHECKOUT约23次），以及模型预测值与真值（回归split分数用y_pred与y_true）或分位数上下界（CQR分数用q_lo、q_hi与y_true）；校准数据需分成D_cal,1与D_cal,2两段，稀疏边样本量低至数十次也须保留、不得因样本少而剔除。

**输出**：每条路径边加宽后的预测区间（示例：SEARCH到PDP为77%至83%、PDP到CART为42%至50%、SUPPORT到CHECKOUT为5%至45%）与可信度标注；以路径边乘以区间上下界的形式交付，供增长与分析团队在桑基图上区分可信边与不可信边，避免把小样本冷门路径的点估计当作稳定洞察。

## 执行步骤

1. 汇总每条路径边的日均观测量与转化率观测
2. 按回归split分数或CQR分数计算非一致性分数
3. 用高斯过程拟合分数的条件分布，让稀疏区域获得更大方差
4. 按两段校准流程得到每条边的共形区间上下界
5. 与标准共形区间对比，标出明显加宽的稀疏边并输出可信度说明

## 边界与不做

- 数据不满足：没有可用于校准的分段数据，或缺少逐边观测与预测分数时无法给出有效区间，需先补齐路径级观测与分数数据。
- 何时不用：只需小样本共形覆盖修正时用「小样本Beta修正共形预测」；需要ROI区间估计时用「共形预测ROI区间估计」；需要补全未观测转移到完整矩阵时用「超稀疏矩阵补全」或「不确定性感知矩阵补全」。
- 能力边界：只产出带认知不确定性的预测区间与可信度标注，不做流失归因、不定位漏斗瓶颈，也不改变点估计本身。

## 技能关联

- **前置**：Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-EPICSCORE-Uncertainty

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：01-因果推断　·　源卡：`Skill-EPICSCORE-Uncertainty`