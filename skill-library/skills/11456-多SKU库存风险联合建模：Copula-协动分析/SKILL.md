---
name: "p2s-multi-sku-copula-risk"
title: "Multi-SKU Copula Risk — 多SKU库存风险联合建模：Copula 协动分析"
description: "触发词：多SKU联合风险、Copula、相关矩阵、组合断货概率、应急产能配额。何时不用：SKU 需求彼此独立、只算单 SKU 安全库存时用「安全库存与补货策略」；只做预算切分时用「多SKU采购预算分配」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Multi-SKU-Copula-Risk"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "别再假设几个相关 SKU 各断各的，用联合分布算出它们一起断货的真实概率。"
user_try: "试试：这 5 个相关系数 0.87 的 SKU，算算旺季同时断货的概率和该加多少安全库存。"
whenToUse: "多个 SKU 需求强相关（同一场景配套购买）、独立建模已低估联合断货风险时用；SKU 相互独立时用单 SKU 安全库存公式即可。"
workflow: "为每个 SKU 拟合边际需求分布 → 用秩变换与高斯 Copula 估计相关矩阵 → 蒙特卡洛模拟联合需求场景 → 计算组合断货概率与安全库存上调幅度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-SKU Copula Risk — 多SKU库存风险联合建模：Copula 协动分析

## ① 解决的问题

供应链面临"多SKU联合断货风险被独立模型低估525倍"——Copula联合分布建模使旺季组合断货概率从18.7%降至6%，年化GMV保护25-40万元

## ② 核心算法逻辑

核心问题：大多数库存模型把每个 SKU 的风险独立计算，但现实中相关 SKU（同品类/同供应商/同季节性）的需求高度相关——旺季到来时它们同时激增，旺季结束时同时回落。独立建模会低估组合断货风险（多个核心 SKU 同时缺货）。

## ③ 业务应用场景

场景：某母婴卖家有 5 个强相关 SKU（婴儿车 + 安全座椅 + 推车脚套 × 3 色），Q4 旺季备货。过去独立建模，每个 SKU 设 15% 缺货安全余量。但 2024 年 Q4 出现问题：主力款断货时，替代款也恰好在最低库存——原来两者需求相关系数高达 0.87。
Copula 分析： - 独立假设下，5 个 SKU 同时断货概率：$0.15^5 ≈ 0.008\%$（极小） - 实际 Gaussian Copula 下（$\rho=0.87$）：约 4.2%（高 525 倍） - 旺季 12 周内至少 2 个 SKU 同时断货的概率：独立 2.3% → Copula 18.7%
决策调整： - 高相关 SKU 组合安全库存上调 25%（从 P85 → P90） - 在供应商处预留 5% 应急产能配额 - 年化旺季 GMV 保护额：约 25-40 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

独立假设下，5 个 SKU 同时断货概率：$0.15^5 ≈ 0.008\%$（极小）
实际 Gaussian Copula 下（$\rho=0.87$）：约 4.2%（高 525 倍）
旺季 12 周内至少 2 个 SKU 同时断货的概率：独立 2.3% → Copula 18.7%
高相关 SKU 组合安全库存上调 25%（从 P85 → P90）
在供应商处预留 5% 应急产能配额
年化旺季 GMV 保护额：约 25-40 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（116 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats
from scipy.optimize import minimize

def fit_marginals(demands_matrix):
    """对每个 SKU 拟合边际分布（负二项）"""
    n_skus = demands_matrix.shape[1]
    marginals = []
    for i in range(n_skus):
        d = demands_matrix[:, i]
        mu = np.mean(d)
        var = np.var(d)
        # 负二项参数估计
        if var > mu:
            r = mu**2 / (var - mu)
            p = mu / var
        else:
            r, p = 100.0, mu / (mu + 1)
        marginals.append({'r': r, 'p': p, 'mu': mu, 'std': np.std(d)})
    return marginals

def demands_to_uniform(demands_matrix, marginals):
    """将需求值转换为 [0,1] 均匀边际（秩变换）"""
    n_obs, n_skus = demands_matrix.shape
    U = np.zeros_like(demands_matrix, dtype=float)
    for i in range(n_skus):
        ranks = stats.rankdata(demands_matrix[:, i])
        U[:, i] = ranks / (n_obs + 1)
    return U

def fit_gaussian_copula(demands_matrix):
    """估计 Gaussian Copula 相关矩阵"""
    marginals = fit_marginals(demands_matrix)
    U = demands_to_uniform(demands_matrix, marginals)
    # 转换为标准正态
    Z = stats.norm.ppf(np.clip(U, 0.001, 0.999))
    # 相关矩阵
    corr_matrix = np.corrcoef(Z.T)
    return corr_matrix, marginals

def simulate_joint_demand(corr_matrix, marginals, n_sim=10000, seed=42):
    """蒙特卡洛模拟联合需求场景"""
    np.random.seed(seed)
    n_skus = len(marginals)
    # 从 Gaussian Copula 采样
    L = np.linalg.cholesky(corr_matrix + 1e-6 * np.eye(n_skus))
    Z_indep = np.random.randn(n_sim, n_skus)
    Z_corr = Z_indep @ L.T
    U_sim = stats.norm.cdf(Z_corr)
    # 转换回需求值（使用正态近似边际）
    demands_sim = np.zeros_like(U_sim)
    for i, m in enumerate(marginals):
        demands_sim[:, i] = m['mu'] + m['std'] * stats.norm.ppf(np.clip(U_sim[:, i], 0.001, 0.999))
        demands_sim[:, i] = np.maximum(0, demands_sim[:, i])
    return demands_sim

def compute_portfolio_stockout_risk(demands_sim, safety_stocks, prices):
    """计算组合断货风险（VaR/CVaR）"""
    n_sim = demands_sim.shape[0]
    stockout_mask = demands_sim > safety_stocks[np.newaxis, :]  # 哪些 SKU 断货
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：多 SKU 历史需求矩阵（同一时间轴逐期销量，每列一个 SKU）、安全库存与价格参数，按时间序列逐期组织。

**输出**：各 SKU 边际分布参数、相关矩阵、组合断货概率（独立假设与联合假设对照）、建议的安全库存上调幅度与应急产能比例。

## 执行步骤

1. 整理多 SKU 同期需求矩阵
2. 为每个 SKU 拟合边际分布并做秩变换
3. 估计相关矩阵并采样联合需求场景
4. 计算至少两个 SKU 同时断货的概率
5. 输出安全库存上调与应急产能建议

## 边界与不做

- 数据不满足时不适用：多 SKU 历史需求序列太短、或缺乏同期对齐数据时，相关矩阵估计不稳。
- 能力边界：只量化联合风险与上调幅度，不决定最终备货量，也不代签供应商应急产能协议。

## 技能关联

- **可组合**：Skill-Multi-SKU-Copula-Risk

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Multi-SKU-Copula-Risk`