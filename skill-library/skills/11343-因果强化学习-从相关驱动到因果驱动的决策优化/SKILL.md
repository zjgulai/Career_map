---
name: "p2s-causal-rl-decision-making"
title: "因果强化学习 — 从相关驱动到因果驱动的决策优化"
description: "触发词：因果强化学习、离线策略学习、备货策略优化、混淆变量、反事实检验。何时不用：历史决策日志不足或没有大促/非大促标签时，先做「需求预测」与常规「补货模拟」；只优化广告出价不涉及备货时另走广告类技能。安全边界：策略上线必须保留人工 override，不得让模型自动做出大幅偏离业务常识的备货动作。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟 / 供需协调 / 库存分层"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
p2s_card_id: "Skill-Causal-RL-Decision-Making"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把历史备货经验里被大促带偏的部分洗干净，再学一版更省资金的备货策略。"
user_try: "试试：用三年的备货与销售记录剔除大促期偏差，给出平时和新品期的安全库存系数建议。"
whenToUse: "已有三年以上历史备货决策日志（含状态、动作、结果与是否大促标签）时用；只是想按现有参数算补货量，用「补货模拟」里的常规补货技能。"
workflow: "构造状态、动作、奖励的历史决策数据集 → 标记混淆变量（如大促期）并做因果选择 → 训练并评估净化后的策略 → 在留出数据上做反事实一致性检验 → 输出策略建议并保留人工 override 通道"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 因果强化学习 — 从相关驱动到因果驱动的决策优化

## ① 解决的问题

供应链团队面临"历史备货策略混杂大促偏差无法直接学习"——因果净化后的离线RL策略库存周转率提升15%，年化资金效率节省约180万元

## ② 核心算法逻辑

传统强化学习（RL）通过最大化累积奖励学习决策策略，但存在三大致命问题：

## ③ 业务应用场景

场景A：离线数据驱动的SKU备货策略优化 - 业务问题：历史备货策略由人工经验决定，混杂了大促/非大促/新品/爆款等不同条件，直接用历史数据训练RL会学到"大促期多备货有效"这一虚假因果（实因：大促期本身销量就高） - 数据要求：历史SKU备货记录（状态：库存水位、预测销量、竞品数、季节指数）+ 实际销售结果（奖励：周转率、缺货率、利润率）+ 行为策略标签（是否为大促期决策） - 预期产出：因果净化后的最优备货策略：在非大促平时，安全库存系数1.3（而非人工经验的1.8），在新品导入期，降低初始备货30%以减少积压风险 - 业务价值：论文实验数据表明离线RLRS中PGCR使推荐准确率提升约15
三轨对抗验证： 1. 成本验证：PGCR需要训练两阶段神经网络（因果选择策略+编码器），训练时间约4-8小时（CPU），推理约0.1秒/SKU，可接受；历史数据需求约3年以上月度数据 2. 合规验证：决策系统不涉及平台规则；注意CRL输出的策略需有人工override机制（HITL），防止算法做出大幅偏离业务常识的建议 3. 风险验证：因果假设可能错误（如"竞品数"实际是混淆变量而非工具变量）；需定期做反事实检验，验证策略在hold-out数据上的一致性
场景B：广告出价离线策略学习 - 业务问题：MAB出价实验数据来自"高竞争词的探索期"，直接用于训练Q-learning会高估低竞争词的出价上限 - 数据要求：历史广告出价日志 + 点击率/CVR/CPC（奖励分量）+ 词竞争度标签 - 预期产出：因果校正后的出价策略，仅保留词本身属性（搜索意图强度、品类相关性）对CVR的真实效应，去掉历史出价偏差 - 业务价值：预估广告ROAS从3.2提升至3.7，年化广告支出200万下额外产出约100万GMV

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：论文PGCR在推荐系统实验中提升约15%；映射到母婴供应链，预估库存周转率从4.8提升至5.5，资金效率提升约15%，按库存金额500万元估算，年化节省资金占用成本约50万元（5%利率）；缺货率降低3%，对应年化GMV损失减少约120万元
实施难度：⭐⭐⭐⭐☆（需ML工程能力和历史数据质量保障，生产部署约1-2个月）
优先级：⭐⭐⭐☆☆（需先有稳定的需求预测和历史决策日志，是进阶项）
评估依据：arXiv:2512.18135综述显示CRL在供应链/推荐/广告三大领域均有实证效果；母婴跨境历史备货数据通常有3年以上，满足离线RL的数据需求

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 53 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Causal-RL-Decision-Making
离线因果强化学习 — SKU备货策略优化（简化版PGCR）

依赖：pip install numpy pandas scikit-learn
注意：生产环境需深度学习框架（PyTorch），此处为概念验证
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from dataclasses import dataclass

np.random.seed(42)

# ── 1. 生成模拟离线备货数据集 ────────────────────────────────────────
def generate_inventory_data(n=2000):
    """
    模拟历史备货决策数据
    混淆变量：is_promo（大促期）会同时影响备货决策和销量
    目标：学习因果净化后的最优备货系数
    """
    # 混淆变量（大促期）
    is_promo = np.random.binomial(1, 0.3, n).astype(float)

    # 状态特征
    forecast_sales    = 100 + 50 * is_promo + np.random.normal(0, 20, n)    # 预测销量
    competitor_count  = np.random.randint(5, 40, n).astype(float)
    season_index      = np.random.uniform(0.5, 2.0, n)
    review_score      = np.random.uniform(3.8, 5.0, n)

    # 历史行为策略：大促期备货系数偏高（人工经验导入的偏差）
    stockup_ratio = 1.2 + 0.5 * is_promo + 0.1 * np.random.normal(0, 1, n)
    stockup_ratio = np.clip(stockup_ratio, 0.8, 2.5)

    # 真实销量（因果模型）：受品类属性和季节影响，非备货比影响
    true_sales = (
        forecast_sales * 0.9
        + 20 * season_index
        - 0.3 * competitor_count
        + 15 * (review_score - 4.0)
        + np.random.normal(0, 15, n)
    )
    true_sales = np.clip(true_sales, 10, 500)

    # 奖励：库存周转率（真实销量/实际备货量，越高越好）
    actual_stock = forecast_sales * stockup_ratio
    turnover     = np.clip(true_sales / actual_stock, 0.3, 2.0)
    stockout     = (true_sales > actual_stock).astype(float)  # 缺货标志

    return pd.DataFrame({
        'forecast_sales': forecast_sales,
        'competitor_count': competitor_count,
        'season_index': season_index,
        'review_score': review_score,
        'is_promo': is_promo,          # 混淆变量
        'stockup_ratio': stockup_ratio, # 历史行为动作
        'true_sales': true_sales,
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2502.02327。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史 SKU 备货记录：状态（库存水位、预测销量、竞品数、季节指数、评分）、动作（备货系数）与结果（周转率、缺货标志、利润率），并带是否大促期这类行为策略标签；模板以 2000 行规模演示，卡页要求约三年以上月度数据。

**输出**：因果净化后的备货策略与系数建议（如平时安全库存系数、新品期初始备货下调幅度），以及策略在留出集上的一致性表现，供人工审核后写入补货参数。

## 执行步骤

1. 把历史备货记录整理成状态-动作-奖励数据集
2. 标注大促等混淆变量并分离其影响
3. 训练因果选择与编码两阶段模型得到净化策略
4. 在留出数据上做反事实检验确认策略稳定
5. 输出备货系数建议并交人工 override 审核

## 边界与不做

- 数据不满足时不适用：没有三年以上历史决策日志，或缺失是否大促这类行为策略标签时，因果净化无从下手。
- 能力边界：只产出策略与系数建议，不直接改补货系统参数，也不替代人工对非常识动作的否决权。
- 因果假设本身可能不成立（例如把混淆变量当成工具变量），结论须经反事实检验后才能使用。

## 技能关联

- **前置**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit
- **延伸**：Skill-Automated-Causal-Discovery.html、Skill-Automated-Causal-Discovery、Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit
- **可组合**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Causal-RL-Decision-Making

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：01-因果推断　·　源卡：`Skill-Causal-RL-Decision-Making`