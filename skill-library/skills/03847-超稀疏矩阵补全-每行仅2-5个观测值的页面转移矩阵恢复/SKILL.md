---
name: "p2s-sparse-matrix-completion"
title: "超稀疏矩阵补全 - 每行仅2-5个观测值的页面转移矩阵恢复"
description: "触发词：超稀疏矩阵补全、页面转移矩阵、观测为零、桑基图断线、低频路径恢复。何时不用：需要补全值带置信区间时用「不确定性感知矩阵补全」；只需给已有路径边算可信区间时用「认知不确定性共形评分」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 数据质量"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Sparse-Matrix-Completion"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把从没被观测到的页面跳转补成有数据支撑的估计，让桑基图不再断线、不误判低频路径无效。"
user_try: "试试：我这10类页面的转移矩阵每行只有2至5个观测，帮我补全整张矩阵，并标出哪些条目是观测支撑、哪些是估计。"
whenToUse: "需要在每行仅2至5个观测的页面转移矩阵上恢复未观测转移、让桑基图不断线时用本技能；需要补全值带置信区间时用「不确定性感知矩阵补全」；需要恢复整段丢失的流量数据时用「块缺失数据补全」；只需给已有路径边算可信区间时用「认知不确定性共形评分」。"
workflow: "把会话级页面跳转整理成稀疏观测矩阵与二值掩码矩阵 → 用Hájek估计器逐元素计算观测二阶矩矩阵 → 生成Omega掩码，区分有共观测支撑与纯估计的条目 → 用Horvitz-Thompson基线按采样概率归一化做对照 → 用补全矩阵重绘桑基图连线并标出被恢复的低频路径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 超稀疏矩阵补全 - 每行仅2-5个观测值的页面转移矩阵恢复

## ① 解决的问题

业务问题：母婴独立站有10种页面类型（HOME/SEARCH/CAT/PDP/CART/CHECKOUT/PAY/REVIEW/BLOG/SUPPORT），理论上有 10×10=100 个可能的转移组合

## ② 核心算法逻辑

传统矩阵补全（如 SoftImpute、ALS）假设"大部分条目可观测"，但电商session的页面转移矩阵天然稀疏——每个用户session只有35次页面跳转，导致采样概率 p = C/d（C≈25, d=页面类型数），绝大多数转移对从未被同一用户触发。

## ③ 业务应用场景

业务问题：母婴独立站有10种页面类型（HOME/SEARCH/CAT/PDP/CART/CHECKOUT/PAY/REVIEW/BLOG/SUPPORT），理论上有 10×10=100 个可能的转移组合。但实际数据中，大量转移组合从未被观测到（如 BLOG→PAY、SUPPORT→CHECKOUT）。问题是：这些转移真的不存在，还是样本太少没被捕捉到？
当前做法"观测为零就当零"会导致： - 桑基图有大量断线，视觉上路径"碎片化" - 无法识别低频但高价值路径（如 REVIEW→CART 的内容驱动购买） - 运营团队误判"某路径无效"，放弃有潜力的优化方向
Hájek-GD 方案：在每行只有 3-5 个观测时仍能恢复完整矩阵，为桑基图提供"数据支撑的合理估计"而非"观测为零就当零"。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（745 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/user_analytics/sparse_matrix_completion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Sparse-Matrix-Completion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Hájek-GD 超稀疏矩阵补全 - 完整实现
论文: One-Sided Matrix Completion from Ultra-Sparse Samples (arXiv:2601.12213)
应用: 母婴电商页面转移矩阵补全，支撑桑基图绘制

依赖: numpy, scipy, sklearn, pandas
"""

import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.metrics import mean_squared_error
from typing import Optional, Tuple, Dict, List
import warnings


# ─────────────────────────────────────────────────────────────
# 1. Hájek 估计器：从稀疏观测构建无偏二阶矩矩阵
# ─────────────────────────────────────────────────────────────

def compute_hajek_estimator(
    M_hat: np.ndarray,
    I: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    计算 Hájek 估计器 T̂ = M̂⊤M̂ / (I⊤I)（逐元素除法）

    Args:
        M_hat: (n, d) 稀疏观测矩阵，未观测位置为 0
        I:     (n, d) 二值掩码矩阵，观测到为 1，未观测为 0

    Returns:
        T_hat: (d, d) Hájek 估计的二阶矩矩阵（仅 Omega 集合内有效）
        Omega: (d, d) 布尔矩阵，True 表示该条目在 Omega 中（被至少一对共同观测）
    """
    # 计算 M̂⊤M̂：分子（各对页面的加权共现）
    numerator = M_hat.T @ M_hat  # (d, d)

    # 计算 I⊤I：分母（各对页面的共观测次数）
    denominator = I.T @ I  # (d, d)

    # Omega: 分母 > 0 的位置（至少有一次共观测）
    Omega = denominator > 0

    # Hájek 估计器：逐元素除法，Omega 外置 0
    T_hat = np.zeros((M_hat.shape[1], M_hat.shape[1]))
    T_hat[Omega] = numerator[Omega] / denominator[Omega]

    return T_hat, Omega


def compute_horvitz_thompson_estimator(
    M_hat: np.ndarray,
    I: np.ndarray,
    p: float,
) -> np.ndarray:
    """
    Horvitz-Thompson 估计器（对比基线）：用真实采样概率 p 归一化

    Args:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2601.12213。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：会话级页面转移观测，组织成稀疏观测矩阵M_hat（未观测位置为0）与二值掩码矩阵I（观测到为1），d为页面类型数（示例10类：HOME/SEARCH/CAT/PDP/CART/CHECKOUT/PAY/REVIEW/BLOG/SUPPORT，即100个候选转移对）；每行仅有2至5个观测；对比基线还需提供真实采样概率p；也可用等价的会话、来源页、去向页、计数长表组织。

**输出**：补全后的页面转移二阶矩矩阵T_hat与Omega有效集合（标明哪些条目由共观测支撑、哪些是估计），以及与Horvitz-Thompson基线的对比；用于绘制连线完整的桑基图，识别低频但高价值的路径（如REVIEW到CART的内容驱动购买），并避免把观测为零直接当成路径无效。

## 执行步骤

1. 从会话日志统计页面类型间的转移次数，构建稀疏观测矩阵与掩码
2. 用Hájek估计器按分子M_hat转置乘M_hat、分母I转置乘I逐元素相除得到二阶矩矩阵
3. 生成Omega掩码，区分有观测支撑与纯估计的条目
4. 计算Horvitz-Thompson基线并对比两种估计结果
5. 用补全矩阵重绘桑基图，标出被恢复的低频路径

## 边界与不做

- 数据不满足：缺少会话级页面跳转日志、无法构成观测矩阵，或会话内跳转过少导致掩码几乎全为0时，补全结果不可用；需先补齐页面类型埋点与会话切分。
- 何时不用：需要补全值附置信区间时用「不确定性感知矩阵补全」；需要恢复整段丢失的流量块时用「块缺失数据补全」；已有路径观测只需算可信区间时用「认知不确定性共形评分」。
- 能力边界：只输出补全后的转移矩阵与Omega有效集合，不替代真实埋点采集；估计值须与原始观测区分标注，不得当作观测事实呈现。

## 技能关联

- **前置**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **延伸**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Utimac-Uncertainty-Completion.html、Skill-Utimac-Uncertainty-Completion
- **可组合**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-GraphDeepAR-Demand-Forecasting.html、Skill-GraphDeepAR-Demand-Forecasting、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Sparse-Matrix-Completion

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-Sparse-Matrix-Completion`