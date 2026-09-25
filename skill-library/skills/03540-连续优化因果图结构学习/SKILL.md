---
name: "p2s-notears-causal-discovery"
title: "NOTEARS/DAGMA — 连续优化因果图结构学习"
description: "触发词：NOTEARS、DAGMA、连续优化因果发现、复购驱动、伪相关。何时不用：样本极小需要领域先验时用「LLM 辅助因果图先验」；只判断一次复购实验的处理效应时用增量估计类技能。安全边界：线性假设可能低估非线性关系，结论须用非线性版本或 A/B 实验复核，不得直接据图放大投放。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 复购实验"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-NOTEARS-Causal-Discovery"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用连续优化的方式快速学出销售与复购的因果图，找出真正值得干预的节点。"
user_try: "试试：用 30 天 SKU 维度的曝光、点击率、差评率、促销力度、价格、销量、复购率数据跑 NOTEARS，画出因果图。"
whenToUse: "当变量较多（100 变量以内）、希望快速得到可微优化求解的因果图时用本技能；样本量极小需要领域先验，用「LLM 辅助因果图先验」；只判断一次复购实验的处理效应，用增量估计类技能。"
workflow: "整理 SKU 维度多列数据并做预处理 → 用增广拉格朗日法求解 NOTEARS 目标（无环约束 + L1 稀疏） → 输出有向因果图与关键路径权重 → 标注关键干预节点并按投放影响排序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# NOTEARS/DAGMA — 连续优化因果图结构学习

## ① 解决的问题

运营面临"不知道哪些操作真正驱动复购而非巧合相关"——NOTEARS因果图发现将伪相关决策占比从35%降至8%，年化避免无效投放损失50-100万元

## ② 核心算法逻辑

传统因果图学习（PC 算法、GES）依赖组合搜索，时间复杂度随变量数指数爆炸。NOTEARS（Zheng et al., NeurIPS 2018）的核心突破：将 DAG 约束转化为连续等式约束 h(W) = tr(e^{W⊙W}) d = 0（矩阵指数迹等式），使无环条件可被梯度下降优化。

## ③ 业务应用场景

场景1：母婴 SKU 销售驱动因子因果图发现 - 业务问题：运营不清楚「差评率上升」是导致「流量下降」的原因，还是反过来；广告投放方向混乱 - 数据要求：30天 × SKU维度数据：曝光量、点击率、差评率、促销力度、价格、销量、复购率（至少 7 列，500+ 行） - 预期产出：自动输出有向因果图，标注关键因果路径权重 - 业务价值：精准定位干预节点，广告 ROAS 提升 15-25%，决策时间从 2 周缩短到 2 天
**三轨验证**： - 成本：Python 单机运行 < 5 分钟（100 变量以内），无额外云资源 - 合规：仅使用内部销售数据，无平台风险 - 风险：线性假设可能低估非线性关系，建议用 NOTEARS-MLP 做非线性版本验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：精准干预节点使广告 ROAS 提升 15-25%，年化节省无效广告投入 40-80 万元
实施难度：⭐⭐⭐⭐☆（需要理解矩阵优化，调参较多）
优先级：⭐⭐⭐⭐☆
评估依据：相比 PC 算法在高维数据上速度快 10 倍，且无需离散化；首次因果图发现项目可作为核心基础设施，服务多个下游分析场景。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（98 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
# NOTEARS/DAGMA 在母婴出海 SKU 因果图发现场景的完整实现
import numpy as np
import pandas as pd
from scipy.linalg import expm
from scipy.optimize import minimize

# ---- 数据模拟：母婴 SKU 7 维销售数据 ----
np.random.seed(42)
n = 600  # 样本数
# 真实因果结构：差评率→曝光量→点击率→销量→复购率；促销→价格→销量
col_names = ["差评率", "曝光量", "点击率", "价格", "促销力度", "销量", "复购率"]
X = np.zeros((n, 7))
X[:, 0] = np.random.normal(0, 1, n)               # 差评率（外生）
X[:, 4] = np.random.normal(0, 1, n)               # 促销力度（外生）
X[:, 3] = -0.5 * X[:, 4] + np.random.normal(0, 0.5, n)   # 价格←促销
X[:, 1] = -0.8 * X[:, 0] + np.random.normal(0, 0.5, n)   # 曝光量←差评率
X[:, 2] = 0.7 * X[:, 1] + np.random.normal(0, 0.5, n)    # 点击率←曝光量
X[:, 5] = 0.6 * X[:, 2] - 0.4 * X[:, 3] + 0.3 * X[:, 4] + np.random.normal(0, 0.5, n)  # 销量
X[:, 6] = 0.5 * X[:, 5] - 0.2 * X[:, 0] + np.random.normal(0, 0.5, n)  # 复购率

# ---- NOTEARS 核心实现 ----
def h_notears(W):
    """DAG 约束：tr(e^{W⊙W}) - d == 0"""
    d = W.shape[0]
    return np.trace(expm(W * W)) - d

def notears_loss(w_flat, X, lambda1=0.1):
    d = X.shape[1]
    W = w_flat.reshape(d, d)
    # 最小二乘损失
    M = X @ W
    loss = 0.5 / X.shape[0] * np.sum((X - M) ** 2)
    # L1 正则（稀疏）
    loss += lambda1 * np.sum(np.abs(W))
    return loss

def notears_gradient(w_flat, X, lambda1=0.1):
    d = X.shape[1]
    n = X.shape[0]
    W = w_flat.reshape(d, d)
    M = X @ W
    grad = -X.T @ (X - M) / n + lambda1 * np.sign(W)
    return grad.flatten()

def fit_notears(X, lambda1=0.1, max_iter=100, h_tol=1e-8, rho_max=1e16):
    d = X.shape[1]
    W = np.zeros((d, d))
    rho, alpha, h_prev = 1.0, 0.0, np.inf

    for _ in range(max_iter):
        # 增广拉格朗日法（Augmented Lagrangian）
        def aug_loss(w_flat):
            W_ = w_flat.reshape(d, d)
            h_val = h_notears(W_)
            loss = notears_loss(w_flat, X, lambda1)
            loss += 0.5 * rho * h_val ** 2 + alpha * h_val
            return loss

        result = minimize(aug_loss, W.flatten(), method='L-BFGS-B',
                         options={'maxiter': 1000, 'ftol': 1e-12})
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：30 天（或更长）× SKU 维度数据表，至少 7 列、500+ 行（曝光量、点击率、差评率、促销力度、价格、销量、复购率等），数值化且缺失可控。

**输出**：有向因果图与关键因果路径权重；供运营定位干预节点、调整广告与促销投放。

## 执行步骤

1. 整理 SKU 维度多列数据并做预处理
2. 用增广拉格朗日法求解 NOTEARS 目标（无环约束 + L1 稀疏）
3. 输出有向因果图与关键路径权重
4. 标注关键干预节点并按对复购的影响排序

## 边界与不做

- 数据不满足：行数远低于数百或变量缺失严重时结构不可信，先补数据。
- 何时不用：小样本需要先验用「LLM 辅助因果图先验」；只估某个动作的效应大小用增量或双重稳健估计；判断异常根因用「需求异常因果归因」。
- 能力边界：输出静态因果图与权重，不做在线干预，也不覆盖非线性结构（需另做非线性版本验证）。
- 安全边界：线性假设可能低估非线性关系，结论须用非线性版本或 A/B 实验复核，不得直接据图放大投放。

## 技能关联

- **可组合**：Skill-NOTEARS-Causal-Discovery

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-NOTEARS-Causal-Discovery`