---
name: "p2s-utimac-uncertainty-completion"
title: "不确定性感知矩阵补全 - 补全值带置信区间的页面转移矩阵恢复"
description: "触发词：页面转移矩阵补全、置信区间、不确定性量化、稀疏路径恢复、填充率不足、补全值可信度。何时不用：只需要一个点估计的转移概率、不关心可信度时用「Sparse-Matrix-Completion」；只算漏斗各步转化率与流失去向用「User-Funnel-Analysis」；本技能在补全的同时给出区间。安全边界：输出是带区间的概率估计而非事实，宽区间结论不得直接用于预算调整；用户路径与会话数据须脱敏。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 数据质量"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
p2s_card_id: "Skill-Utimac-Uncertainty-Completion"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "补全只有三到六成填充率的页面转移矩阵，并给每个补全值配上 95% 置信区间，说明哪条结论可信、哪条该先补数据。"
user_try: "试试：这是我们独立站的页面转移观测矩阵（HOME、PDP、CART、CHECKOUT，填充率约四成），帮我补全缺失的转移概率，给每个值配上 95% 置信区间，并标出哪些区间太宽、暂时不能用来调预算。"
whenToUse: "页面转移矩阵观测稀疏（填充率约 30%-60%）、需要在补全的同时判断结论可信度时用本技能；只要点估计用「Sparse-Matrix-Completion」，要评估缺失数据本身的偏差用「BlockEcho-Missing-Data」。"
workflow: "整理页面转移矩阵观测值，并用观测掩码区分未观测与真值为 0 → 推断数据生成过程的参数，而不是直接补矩阵条目 → 用软阈值与坐标下降求解偏差更新，得到补全值 → 为每个补全值计算 95% 置信区间 → 按区间宽窄判定可信度，给出是否先补数据再决策的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 不确定性感知矩阵补全 - 补全值带置信区间的页面转移矩阵恢复

## ① 解决的问题

业务问题：跨境电商平台（如独立站）的用户行为分析依赖页面转移矩阵——HOME 页流向哪里

## ② 核心算法逻辑

Utimac 的核心洞察是：不直接补全矩阵条目，而是推断数据生成过程的参数（Estimate the Process, Not the Entries）。

## ③ 业务应用场景

业务问题：跨境电商平台（如独立站）的用户行为分析依赖页面转移矩阵——HOME 页流向哪里？PDP 页流失到哪里？但由于用户路径稀疏（每个session仅3-8次点击），加之数据收集丢失（广告拦截器、延迟等），实际观测到的转移矩阵往往只有 30%-60% 填充率。
现有矩阵补全方法（如低秩补全）给出的是点估计：HOME→CHECKOUT 转移概率 = 12%，但无法回答「这个 12% 可信吗？」。
Utimac 的价值：输出 12% ± 区间，例如： - 区间窄（95% CI: [10%, 14%]）：数据充分，可信，基于此优化 HOME 页 CTA 按钮 - 区间宽（95% CI: [3%, 21%]）：数据不足，不可信，告诉决策者「暂不基于此做预算调整，先补充数据」

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5-20 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（670 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/utimac_uncertainty_completion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Utimac-Uncertainty-Completion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Utimac: Uncertainty-Aware Matrix Completion
基于 arXiv:2605.02225 的实现

适用场景：稀疏页面转移矩阵补全，输出每个补全值的 95% 置信区间

用法示例：
    python utimac.py  # 运行内置示例（母婴电商转移矩阵）
"""

import numpy as np
from scipy.linalg import solve, cho_factor, cho_solve
from scipy.stats import norm as scipy_norm
from typing import List, Tuple, Optional
import warnings

warnings.filterwarnings("ignore", category=RuntimeWarning)


# ─── 软阈值算子（偏差更新核心）────────────────────────────────────────────────

def soft_threshold(x: np.ndarray, threshold: float) -> np.ndarray:
    """逐元素软阈值：sign(x) * max(|x| - threshold, 0)"""
    return np.sign(x) * np.maximum(np.abs(x) - threshold, 0.0)


def update_deviation(
    z_obs: np.ndarray,       # 观测 log 域子向量 (|Ω|,)
    mu_obs: np.ndarray,      # 均值子向量 (|Ω|,)
    sigma_obs: np.ndarray,   # 协方差子矩阵 (|Ω|, |Ω|)
    lam: float,              # 稀疏度参数
    max_iter: int = 100,
    tol: float = 1e-6
) -> np.ndarray:
    """
    求解偏差更新：argmin ½(o-r)ᵀ Q(o-r) + λ‖o‖₁
    使用坐标下降（对角近似时退化为软阈值）

    当 Σ 接近对角矩阵时，使用封闭式软阈值；
    否则使用 ADMM 风格的坐标下降
    """
    r = z_obs - mu_obs
    d = len(r)

    # 尝试 Cholesky 分解判断正定性
    try:
        cho = cho_factor(sigma_obs, lower=False)
        Q = np.linalg.inv(sigma_obs)  # 精度矩阵
    except np.linalg.LinAlgError:
        # 添加微小对角扰动保证正定
        sigma_obs = sigma_obs + 1e-6 * np.eye(d)
        Q = np.linalg.inv(sigma_obs)

    # 检查是否接近对角（对角近似加速）
    off_diag_ratio = (
        np.sum(np.abs(Q - np.diag(np.diag(Q)))) /
        (np.sum(np.abs(Q)) + 1e-10)
    )

    if off_diag_ratio < 0.01:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2605.02225。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：页面转移矩阵的观测数据：行列为页面类型（如 HOME、PDP、CART、CHECKOUT 等），元素是观测到的转移次数或概率，并须带观测掩码以区分「真值为 0」与「未观测」。典型输入是每个 session 仅 3-8 次点击、叠加广告拦截与延迟丢失，矩阵填充率只有 30%-60%；还需给出目标置信水平（如 95% CI）与稀疏度参数。

**输出**：每个缺失条目的补全转移概率及其 95% 置信区间，并据此给出可信度判定：区间窄（如 95% CI [10%,14%]）说明数据充分、可据此优化页面 CTA；区间宽（如 95% CI [3%,21%]）说明数据不足、应暂缓预算调整并先补充数据；供独立站增长与数据质量团队决定哪条结论可用。

## 执行步骤

1. 汇总页面转移矩阵观测值并标注观测掩码
2. 推断数据生成过程参数而非直接补条目
3. 用软阈值与坐标下降求解偏差更新，产出补全值
4. 为每个补全值计算 95% 置信区间
5. 按区间宽窄判定可信度，给出是否先补数据再决策的建议

## 边界与不做

- 数据不满足时不用：无法区分「未观测」与「真值为 0」的矩阵不能补全，先补齐埋点与观测掩码；填充率极低且无页面结构先验时，区间会宽到没有决策价值。
- 何时不用：只需要点估计转移概率用「Sparse-Matrix-Completion」；只算漏斗各步转化率与流失去向用「User-Funnel-Analysis」；要评估缺失机制本身的偏差用「BlockEcho-Missing-Data」。
- 能力边界：只产出带区间的统计估计，不判断业务上该优化哪个页面；区间宽代表数据不足，不代表该路径不重要。
- 安全边界：用户路径与会话数据须脱敏后使用；宽区间结论不得直接作为预算调整依据。

## 技能关联

- **前置**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty、Skill-STAMImputer-SpatioTemporal.html、Skill-STAMImputer-SpatioTemporal、Skill-Sparse-Matrix-Completion.html、Skill-Sparse-Matrix-Completion
- **延伸**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty
- **可组合**：Skill-BlockEcho-Missing-Data.html、Skill-BlockEcho-Missing-Data、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty、Skill-Utimac-Uncertainty-Completion

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-Utimac-Uncertainty-Completion`