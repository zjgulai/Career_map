---
name: "p2s-calibrated-audience-expansion-uncertainty"
title: "Calibrated Audience Expansion Uncertainty — Lookalike 扩展置信度校准防止受众过泛导致 ROAS 崩盘"
description: "触发词：受众扩展、置信度校准、Platt Scaling、精度衰减、相似受众扩量、ROAS 预判。何时不用：种子池质量本身不过关时先优化种子；只判断渠道该不该加预算时用渠道饱和曲线。安全边界：用户特征与种子标签属个人信息，需在授权范围内使用，受众包上传需符合各平台数据政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 分群"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Calibrated-Audience-Expansion-Uncertainty"
p2s_src_domain: "15-营销投放分析"
quality_tier: "preview"
user_summary: "扩量前先预测相似受众放大后还剩多少精度与回报，判断哪个扩展比例还划算。"
user_try: "试试：我的 1% Lookalike ROAS 是 3.8x，扩到 5% 会掉到多少？帮我评估一下。"
whenToUse: "想把相似受众从小比例扩到更大比例、需要预判 ROAS 衰减时用本技能；种子池质量有问题时先用双塔或 LTV 种子优化；只判断渠道是否饱和时用饱和曲线。"
workflow: "生成用户特征矩阵与带噪种子集 → 用密度估计训练相似受众打分模型 → 用 Platt Scaling 校准分数 → 绘制分数分位数与实际转化率曲线 → 估算各扩展比例的精度与预期 ROAS"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Calibrated Audience Expansion Uncertainty — Lookalike 扩展置信度校准防止受众过泛导致 ROAS 崩盘

## ① 解决的问题

广告投手面临"Lookalike从1%扩展到5%ROAS大幅下滑、不知道最优扩展边界"——密度估计+Platt Scaling置信度校准将ROAS预判误差从±50%降至±15%，避免盲目扩量年化损失约22万元

## ② 核心算法逻辑

Lookalike 受众扩展的经典陷阱：把 1% 相似受众扩展到 5% 或 10% 时，ROAS 往往大幅下滑——因为模型分数没有经过置信度校准，高分用户和低分用户的相对差距被压缩，边界模糊区的用户被错误纳入。

## ③ 业务应用场景

业务问题：母婴品牌 Meta 1% Lookalike ROAS = 3.8x，想扩到 5% 增加流量，但不知道扩大后 ROAS 会变多少，不敢轻易操作。
校准方案： 1. 对自建 Lookalike 模型的输出分数做 Platt Scaling 校准 2. 在验证集上绘制"分数分位数 vs 实际转化率"曲线（Calibration Curve） 3. 估算不同扩展比例（Top 1%/3%/5%/10%）对应的预期精度 Precision@K
预期产出： - 校准后模型：1% 受众精度 68%，3% 精度 52%，5% 精度 41%，10% 精度 28% - 基于精度衰减预测：5% 扩展后 ROAS 约 2.9x（vs 1% 的 3.8x），可接受范围 - 10% 扩展后 ROAS 约 2.1x，低于 ROI 门槛，不建议

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：避免盲目扩量导致的 ROAS 崩盘（1% → 10% 可能让 ROAS 从 3.8x 跌到 1.9x），$10万/月广告预算下年化损失约 $22 万；校准后精准扩展到 3-5% 甜点区，年化广告效益提升约 $8-12 万
实施难度：⭐⭐☆☆☆（Platt Scaling 极轻量，在现有 Lookalike 模型上 1 周内可添加；SMOTE-MSFB 约 2 周）
优先级：⭐⭐⭐⭐☆（扩展比例决策是日常高频操作，置信度校准是"低成本高价值"的工程改进）
评估依据：arXiv:2311.05853 在 MNIST 模拟实验中 Precision@K 平均达 0.90；SMOTE-MSFB 比标准 SMOTE 精度高且计算效率提升 70%；KDD 2019 Pinterest 系统生产验证了密度视角的有效性

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（228 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Calibrated Audience Expansion Uncertainty
Lookalike 扩展置信度校准 — 密度估计 + Platt Scaling

依赖：numpy, pandas, scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score
from typing import List, Dict, Tuple
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟用户数据 + 种子集
# ─────────────────────────────────────────────

def generate_expansion_data(n_users: int = 3000,
                             n_seeds: int = 80) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """生成用户特征矩阵 + 种子标签"""
    np.random.seed(42)
    # 用户特征：品类偏好、客单价、时区、设备、购买频次等
    X = np.random.randn(n_users, 10)
    # 真实"好用户"：特征空间某区域的用户（密度集中区）
    true_good = (X[:, 0] > 0.5) & (X[:, 1] > 0.3) & (X[:, 3] > -0.5)
    y_true = true_good.astype(int)

    # 种子集：从真实好用户中采样（含 10% 噪声）
    good_indices = np.where(y_true == 1)[0]
    seed_indices = np.random.choice(good_indices, min(n_seeds, len(good_indices)), replace=False)
    # 加入 10% 噪声种子
    noise_count = max(1, int(n_seeds * 0.10))
    bad_indices = np.where(y_true == 0)[0]
    noise_indices = np.random.choice(bad_indices, noise_count, replace=False)
    all_seed_indices = np.concatenate([seed_indices[:n_seeds - noise_count], noise_indices])

    y_seed = np.zeros(n_users)
    y_seed[all_seed_indices] = 1

    return X, y_seed, y_true


# ─────────────────────────────────────────────
# 2. 密度估计 Lookalike（概率密度视角）
# ─────────────────────────────────────────────

class DensityLookalike:
    """
    密度估计视角的 Lookalike 模型
    负样本选择：用均匀分布在特征空间的人工样本
    而非从用户池随机采样（减少边界混淆）
    """

    def __init__(self, n_artificial_negatives: int = 500):
        self.n_neg = n_artificial_negatives
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2311.05853 — Reframing Audience Expansion through the Lens of Probability Density Estimation
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.286／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户特征矩阵（品类偏好、客单价、时区、设备、购买频次等）、带噪种子标签，以及用于验证的历史转化标签；需覆盖目标扩展比例所需的用户规模。

**输出**：校准后的分数与概率、校准曲线、各扩展比例的精度与预期 ROAS、建议的扩展边界；供投手决定是否扩量以及扩到多大比例。

## 执行步骤

1. 生成或接入用户特征矩阵与种子集
2. 用密度估计训练相似受众打分模型
3. 用 Platt Scaling 校准分数并绘制校准曲线
4. 估算各扩展比例的精度与预期 ROAS
5. 给出可接受的扩展边界与不建议扩张的阈值

## 边界与不做

- 何时不用：种子池本身质量差（未做 LTV 分层）时先优化种子，校准无法修正种子偏差。
- 能力边界：本技能产出精度与 ROAS 预判，不直接创建或上传平台受众包。
- 数据边界：验证集不足、或与真实投放人群分布不一致时，校准曲线不可外推。

## 技能关联

- **前置**：Skill-Conformal-Risk-Assessment.html、Skill-Conformal-Risk-Assessment、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Seed-Quality-Optimization-for-Lookalike.html、Skill-Seed-Quality-Optimization-for-Lookalike
- **延伸**：Skill-Conformal-Risk-Assessment.html、Skill-Conformal-Risk-Assessment、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-Seed-Quality-Optimization-for-Lookalike.html、Skill-Seed-Quality-Optimization-for-Lookalike
- **可组合**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Seed-Quality-Optimization-for-Lookalike.html、Skill-Seed-Quality-Optimization-for-Lookalike、Skill-Calibrated-Audience-Expansion-Uncertainty

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：15-营销投放分析　·　源卡：`Skill-Calibrated-Audience-Expansion-Uncertainty`