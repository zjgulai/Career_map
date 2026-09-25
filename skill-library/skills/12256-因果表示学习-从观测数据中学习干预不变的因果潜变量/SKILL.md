---
name: "p2s-causal-representation-learning"
title: "因果表示学习 — 从观测数据中学习干预不变的因果潜变量"
description: "触发词：因果表示学习、环境不变特征、跨市场迁移、干预标签、分布鲁棒。何时不用：要用协方差对齐把源域特征迁到小样本目标域时用「因果表示学习跨域迁移」；要做因子解耦与效应归因时用「解耦因果表示学习」。安全边界：因果假设错误时迁移可能不升反降，落地前须预留 A/B 验证。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-072"
l3_business: "市场进入"
l3_all: "市场进入"
l1_l2_l3: "业务运营/渠道经营/市场进入"
p2s_card_id: "Skill-Causal-Representation-Learning"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "让模型学市场之间都成立的那部分规律，而不是某个市场特有的习惯，换市场时不用从头重训。"
user_try: "试试：用美国和德国的行为数据学一套环境不变的购买意愿表示，看德国市场性能能保住多少。"
whenToUse: "当已有市场训练的模型跨市场性能明显下降、需要用环境不变性约束学因果潜变量时用本技能；要做的是跨域特征对齐迁移，用「因果表示学习跨域迁移」；要做因子解耦与效应归因，用「解耦因果表示学习」。"
workflow: "准备多环境特征、结果标签与环境/干预标签 → 先用标准回归做分环境基线 → 训练带环境不变性约束的因果表示模型 → 分环境验证迁移稳定性并做 A/B"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 因果表示学习 — 从观测数据中学习干预不变的因果潜变量

## ① 解决的问题

算法团队面临"从美国市场训练的模型在德国市场性能下降30%无法直接迁移"——环境不变因果表示将跨市场性能下降从30%降至8%，年化新市场冷启动价值100万元

## ② 核心算法逻辑

传统表示学习的根本局限：

## ③ 业务应用场景

场景A：跨市场用户偏好迁移 - 业务问题：从美国市场学到的用户偏好模型（基于点击/购买历史）在德国市场性能下降30%（市场差异导致分布偏移） - 数据要求：美国和德国用户行为数据 + 干预标签（促销/非促销期） - 预期产出：因果表示模型学到与市场无关的"用户购买意愿"潜变量，在德国市场性能下降从30%降至8% - 业务价值：跨市场模型迁移节省重新训练成本约20万元；更重要的是新市场冷启动速度提升，年化新市场开拓价值约100万元
**三轨验证**： - **成本**：数据采集成本约5万元（需获取德国市场至少3个月用户行为日志，含促销标签）；计算资源成本约2万元（GPU训练+存储）；人力成本约15万元（1名算法工程师2个月） - **合规**：需确保德国市场数据符合GDPR要求（用户行为数据需匿名化处理，干预标签不得包含个人身份信息）；跨市场数据传输需签署DPA协议 - **风险**：若因果假设错误（如美国与德国用户购买决策机制本质不同），模型迁移后性能可能不升反降；需预留A/B测试预算（约3万元）验证实际效果

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：跨市场模型迁移性能提升（从30%下降→8%），新市场开拓节省重新训练成本20万元，加速新市场冷启动年化100万元；模型分布鲁棒性提升，减少季节切换期的模型退化损失约50万元
实施难度：⭐⭐⭐⭐☆（理论要求较高；实现需要PyTorch；工业落地需要明确定义"环境"变量）
优先级：⭐⭐⭐⭐☆（填补01-因果推断重要方向盲区；多市场扩张的核心挑战是模型迁移，因果表示是根本解）
评估依据：Proceedings of IEEE 2021（最高引用量期刊之一），Bernhard Schölkopf（因果ML领域最高权威）；NeurIPS 2022理论突破；Meta/Google均有因果表示学习的工业应用

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（108 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Causal-Representation-Learning
因果表示学习 — 环境不变的用户偏好表示

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score

np.random.seed(42)

# ── 1. 生成含环境变化的用户数据 ──────────────────────────────────────
n = 3000

# 真实因果潜变量（环境不变）
z_need        = np.random.normal(0, 1, n)  # 刚性购买需求
z_price_sens  = np.random.normal(0, 1, n)  # 价格敏感度
z_brand_loyal = np.random.normal(0, 1, n)  # 品牌忠诚度

# 环境变量（干预标签）
env_promo = np.random.binomial(1, 0.4, n)  # 大促/非大促
env_market = np.random.choice([0, 1], n, p=[0.5, 0.5])  # 美国/德国

# 观测特征（受环境影响的代理变量）
X_clicks    = z_need + 0.5*env_promo + np.random.normal(0, 0.3, n)
X_cart      = z_need * 0.8 + z_price_sens * 0.6 + 0.3*env_promo + np.random.normal(0, 0.3, n)
X_reviews   = z_brand_loyal + 0.2*env_market + np.random.normal(0, 0.2, n)
X_freq_buy  = z_need * 0.7 + 0.4*env_promo + np.random.normal(0, 0.3, n)
X_price_click = -z_price_sens + 0.3*env_promo + np.random.normal(0, 0.3, n)

X = np.column_stack([X_clicks, X_cart, X_reviews, X_freq_buy, X_price_click])
feature_names = ['点击频率', '加购行为', '评论数', '购买频次', '价格点击']

# 目标：LTV（受因果潜变量驱动，与环境无关）
ltv = (2*z_need + 1.5*z_brand_loyal - z_price_sens +
       np.random.normal(0, 0.5, n))

# ── 2. 标准OLS（有偏，受环境混淆）──────────────────────────────────
scaler = StandardScaler()
X_sc   = scaler.fit_transform(X)

# 训练（全量）
ols = LinearRegression().fit(X_sc, ltv)
r2_all  = ols.score(X_sc, ltv)

# 评估：在各环境下的性能
envs = [(env_promo==1, '大促期'), (env_promo==0, '非大促'),
        (env_market==0, '美国市场'), (env_market==1, '德国市场')]
print('【标准OLS（基线，受环境混淆）】')
for mask, name in envs:
    r2 = r2_score(ltv[mask], ols.predict(X_sc[mask]))
    print(f'  {name:<12}: R²={r2:.3f}')

# ── 3. 环境不变性约束的因果表示学习 ─────────────────────────────────
def causal_rep_learning(X, y, env_labels, lambda_inv=1.0):
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2102.11107。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：多环境用户行为数据（如美国/德国）的观测特征与结果标签、环境变量或干预标签（促销/非促销、市场标识）；粒度为 用户 × 环境。

**输出**：环境不变的因果潜变量表示与各环境上的表现对比（卡页案例：德国市场性能下降从 30% 收敛到 8%）；供算法团队做跨市场模型迁移与新市场冷启动。

## 执行步骤

1. 准备多环境观测特征、结果标签与环境/干预标签
2. 先用标准回归做基线并分环境评估表现差异
3. 训练带环境不变性约束的因果表示模型
4. 用各环境评估集验证不变潜变量的迁移稳定性
5. 通过 A/B 验证后用于新市场冷启动

## 边界与不做

- 数据不满足：缺少干预或环境标签、或目标市场样本过少时，不变性约束无法成立，迁移效果不保证。
- 何时不用：要解决的是把源域特征迁到小样本目标域（CORAL 对齐类），用「因果表示学习跨域迁移」；要解决的是因子解耦与独立效应归因，用「解耦因果表示学习」。
- 能力边界：因果假设错误时迁移可能不升反降，落地前须预留 A/B 验证预算；数据须满足 GDPR 等隐私要求（需匿名化、不传个人身份信息）；卡页的 30%→8%、年化 100 万元为案例口径。

## 技能关联

- **前置**：Skill-Causal-Representation-Disentangle.html、Skill-Causal-Representation-Disentangle、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **延伸**：Skill-Causal-Representation-Disentangle.html、Skill-Causal-Representation-Disentangle、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **可组合**：Skill-Causal-Representation-Disentangle.html、Skill-Causal-Representation-Disentangle、Skill-Continual-Learning-Production.html、Skill-Continual-Learning-Production、Skill-Federated-Learning-Privacy.html、Skill-Federated-Learning-Privacy、Skill-Causal-Representation-Learning

---

> 分类：业务运营/渠道经营/市场进入　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Representation-Learning`