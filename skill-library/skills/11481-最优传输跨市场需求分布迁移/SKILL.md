---
name: "p2s-ot-cross-market-demand-transfer"
title: "OT Cross-Market Demand Transfer — 最优传输跨市场需求分布迁移"
description: "触发词：最优传输、跨市场迁移、Sinkhorn、新市场预测、分布对齐。何时不用：本市场已有充足历史时不需要迁移；只迁移旺季放大系数时用「旺季模式迁移学习」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 市场进入"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-OT-Cross-Market-Demand-Transfer"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "新市场才上线几周，用成熟市场的需求分布把数据垫厚，把预测误差从四成多压到两成。"
user_try: "试试：用美国站两年数据做最优传输，把德国站 8 周数据扩成可训练样本再预测 12 周。"
whenToUse: "新市场数据不足 3 个月、但有成熟市场同品类分布可借时用；本市场历史充足直接建模；只迁移旺季放大系数用旺季模式迁移学习。"
workflow: "拟合源市场需求分布并检查尺度差异 → 用 Sinkhorn OT 求传输矩阵映射到目标市场尺度 → 生成虚拟历史样本补足目标市场数据 → 训练预测模型并输出未来 12 周预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# OT Cross-Market Demand Transfer — 最优传输跨市场需求分布迁移

## ① 解决的问题

供应链面临"新市场<3个月数据导致需求预测MAPE达45%"——最优传输跨市场分布迁移将预测误差降至22%，首季备货节省18-28万元

## ② 核心算法逻辑

论文：Sinkhorn Distances: Lightspeed Computation of Optimal Transport | 年份：2013 (NeurIPS)

## ③ 业务应用场景

场景：某婴儿安全座椅品牌在美国已有 2 年销售数据（月均 800 单），决定进入德国市场。德国市场刚上线 8 周，只有 [45, 52, 61, 48, 67, 73, 58, 82] 周销量数据，需要预测未来 3 个月制定补货计划。
OT 迁移流程： 1. 美国需求分布：对数正态，$\mu_{log}=6.3, \sigma_{log}=0.28$（月度） 2. 德国早期 8 周数据：计算样本分布，$\bar{x}=60.8, \sigma=12.1$ 3. Sinkhorn OT 计算传输矩阵，将美国分布迁移到德国尺度 4. 生成 200 条"虚拟德国历史周销量"，训练 Prophet 模型 5. 预测未来 12 周：均值 [88, 95, 103, 112, 98, 86, 79, 115, 142, 168, 155, 130]（含旺季）
对比结果： - 纯德国数据（8周）训练：MAPE = 43.2% - OT 迁移增强后：MAPE = 21.7%（提升 49.8%） - 首季度备货准确率提升，避免过量积压 30%，年化节省约 18-28 万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

纯德国数据（8周）训练：MAPE = 43.2%
OT 迁移增强后：MAPE = 21.7%（提升 49.8%）
首季度备货准确率提升，避免过量积压 30%，年化节省约 18-28 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（128 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy.spatial.distance import cdist

def sinkhorn_log(a, b, M, reg, num_iter=200, tol=1e-9):
    """
    Sinkhorn 算法（对数域数值稳定版本）
    a: 源分布权重 (n,)
    b: 目标分布权重 (m,)
    M: 成本矩阵 (n, m)
    reg: 正则化参数
    返回：传输矩阵 T (n, m)
    """
    n, m = len(a), len(b)
    log_a = np.log(a + 1e-10)
    log_b = np.log(b + 1e-10)
    K = np.exp(-M / reg)  # Gibbs 核

    u = np.zeros(n)
    v = np.zeros(m)
    for _ in range(num_iter):
        u_prev = u.copy()
        u = log_a - np.log(K @ np.exp(v) + 1e-10)
        v = log_b - np.log(K.T @ np.exp(u) + 1e-10)
        if np.max(np.abs(u - u_prev)) < tol:
            break
    T = np.exp(u[:, None] + (-M / reg) + v[None, :])
    return T

def compute_wasserstein(source_samples, target_samples, reg=0.1):
    """计算两个样本集之间的 Sinkhorn Wasserstein 距离"""
    n, m = len(source_samples), len(target_samples)
    a = np.ones(n) / n
    b = np.ones(m) / m
    xs = source_samples.reshape(-1, 1) if source_samples.ndim == 1 else source_samples
    xt = target_samples.reshape(-1, 1) if target_samples.ndim == 1 else target_samples
    M = cdist(xs, xt, metric='sqeuclidean')
    T = sinkhorn_log(a, b, M, reg=reg)
    return np.sum(T * M)

def ot_transfer_samples(source_samples, target_samples, n_virtual=200, reg=0.05):
    """
    用 OT 传输映射生成虚拟目标市场样本
    核心思想：从源分布按传输矩阵加权采样
    """
    n, m = len(source_samples), len(target_samples)
    a = np.ones(n) / n
    b = np.ones(m) / m
    xs = source_samples.reshape(-1, 1)
    xt = target_samples.reshape(-1, 1)
    M = cdist(xs, xt, metric='sqeuclidean')
    T = sinkhorn_log(a, b, M, reg=reg)

    # 传输后的期望位置：对每个源样本，按传输矩阵加权计算目标坐标
    transferred = T @ xt / (T.sum(axis=1, keepdims=True) + 1e-10)

    # 生成虚拟样本（从传输后的位置加噪声采样）
    np.random.seed(42)
    idx = np.random.choice(n, size=n_virtual, p=a)
    noise_std = np.std(target_samples) * 0.15
    virtual_samples = transferred[idx].flatten() + np.random.normal(0, noise_std, n_virtual)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:1803.00567 — Computational Optimal Transport

核验口径：主题指向成立但强度不足（词重合 0／点名相似 0.617）。引用前请自行确认。

## 输入 / 输出契约

**输入**：成熟市场长期销量序列（卡页示例：美国 2 年、月均 800 单）、新市场早期数据（卡页示例：8 周周销量）、市场差异说明；粒度：市场×周。

**输出**：迁移增强后的新市场周销量预测（卡页对比：MAPE 由 43.2% 降至 21.7%）与首季备货建议，供新市场补货计划使用。

## 执行步骤

1. 拟合源市场需求分布并检查尺度差异
2. 用 Sinkhorn OT 求传输矩阵完成尺度映射
3. 生成虚拟样本补足目标市场历史
4. 训练模型并输出未来 12 周预测

## 边界与不做

- 数据不满足时不用：源市场无同品类数据、或两市场需求结构无关时，迁移会把错误分布带进新市场。
- 能力边界：只做分布层面的迁移与预测，不负责本地化定价、认证与渠道差异判断。

## 技能关联

- **可组合**：Skill-OT-Cross-Market-Demand-Transfer

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-OT-Cross-Market-Demand-Transfer`