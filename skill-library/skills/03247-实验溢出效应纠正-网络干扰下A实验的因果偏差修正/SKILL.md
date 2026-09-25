---
name: "p2s-interference-spillover-correction"
title: "实验溢出效应纠正 — 网络干扰下A/B实验的因果偏差修正"
description: "触发词：溢出效应、SUTVA违反、暴露模型、集群随机化、库存竞争。何时不用：实验单元之间确实独立（无共享库存、无社交传播）时不必纠正。安全边界：用共同购买等行为数据构图，不获取直接社交关系，并在隐私政策中说明行为数据分析用途。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 算法评估设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Interference-Spillover-Correction"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "修正因库存竞争和口碑外溢导致实验低估了真实效果，别把本来有价值的功能误判成没用。"
user_try: "试试：新推荐算法实验只涨 1.2%，怀疑是爆款库存被抢导致的溢出，帮我做纠正。"
whenToUse: "当实验单元之间共享库存、共享商品或存在社交传播（SUTVA 被违反），朴素估计可能低估真实效果时用；单元之间确实互相独立时无需纠正。"
workflow: "整理实验分配、用户购买关系网络与库存变化数据 → 用暴露映射函数构造每个用户的邻居处理比例 → 同时建模直接效应与溢出效应，输出纠正后的 ATE → 与朴素估计对比，判断是否因溢出而低估 → 用多种网络定义与集群随机化方案做敏感性检验"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 实验溢出效应纠正 — 网络干扰下A/B实验的因果偏差修正

## ① 解决的问题

数据团队面临"推荐系统A/B因库存溢出效应低估真实增量"——暴露模型纠正溢出偏差，ATE从+1.2%修正至+2.1%，防止错误拒绝有价值功能，年化机会成本约60万元

## ② 核心算法逻辑

传统A/B实验假设SUTVA（稳定单元处理值假设）：每个用户的结果只受自己所在组（A或B）影响，与其他用户无关。但在电商推荐/社交/平台场景中，这个假设经常被违反：

## ③ 业务应用场景

场景A：推荐算法A/B实验的溢出效应纠正 - 业务问题：测试新推荐算法（B组）对复购率的影响，A组用户被分配旧算法。但新算法把某款爆款婴儿床推给B组用户，导致库存下降，A组用户也看不到这款商品，复购率下降——溢出效应低估了新算法的效果 - 数据要求：用户的推荐系统实验分配 + 用户购买行为网络（谁与谁有共同购买历史）+ 库存变化数据 - 预期产出：朴素估计ATE=+1.2%，溢出纠正后ATE=+2.1%（库存竞争导致了低估）；社交溢出估计=+0.3%（B组用户口碑传播给A组的间接效应） - 业务价值：避免低估新算法效果，防止因此错误拒绝上线真正有价值的功能；年化节省错误决策导致的机会成本约60
三轨对抗验证： 1. 成本验证：暴露模型建模需要用户社交/推荐图数据（通常已有），建模约1天工作量；计算量中等（图分析） 2. 合规验证：分析用户社交关系属于"行为数据分析"，需在隐私政策中说明；不涉及直接社交关系获取（使用共同购买行为作为图边，更合规） 3. 风险验证：网络构建方法（共同购买 vs 直接关系）会显著影响结果；建议多种网络定义做敏感性分析；集群随机化在母婴平台上实施需修改实验基础设施
场景B：价格测试的市场均衡溢出 - 业务问题：对20%用户测试提价5%，但被提价用户可能转向其他SKU，压低了其他SKU的价格弹性估计 - 方案：按SKU/品类做集群随机化（而非按用户随机化），一个品类全部提价或全部不提 - 业务价值：更准确的价格弹性估计指导全平台定价策略，年化价格优化收益约80万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：纠正溢出偏差避免低估真实效应（历史上约20%的A/B实验有显著溢出），防止错误拒绝有价值功能；年化机会成本节省约60万元；更准确的价格弹性估计年化优化约80万元
实施难度：⭐⭐⭐☆☆（暴露模型方法约1周工程量；集群随机化需要修改实验基础设施，约1个月）
优先级：⭐⭐⭐⭐☆（推荐/社交场景必须处理溢出；价格/促销实验也强烈建议检验SUTVA是否成立）
评估依据：KDD 2017 Saveski在LinkedIn大规模实验中验证；Airbnb/LinkedIn/Twitter均发表了网络效应实验的工程博客；亚马逊推荐系统A/B实验中溢出效应已被证实显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（142 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Interference-Spillover-Correction
网络溢出效应纠正 — A/B实验SUTVA违反的偏差修正

依赖：pip install numpy pandas scikit-learn scipy
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from scipy import stats

np.random.seed(42)

# ── 1. 生成含溢出效应的实验数据 ──────────────────────────────────────
n = 2000

# 用户特征
X = np.random.randn(n, 4)
feature_names = ['purchase_freq', 'account_age', 'baby_age', 'avg_spend']

# 随机分配（50/50 A/B）
T = np.random.binomial(1, 0.5, n)

# 构建用户邻接图（基于相似购买行为的弱社交网络）
def build_purchase_network(n, avg_degree=5):
    """简化：随机邻接图（近似共同购买网络）"""
    adj = {i: [] for i in range(n)}
    for i in range(n):
        # 每个用户平均5个邻居
        neighbors = np.random.choice(
            [j for j in range(n) if j != i],
            size=min(avg_degree, n-1), replace=False
        )
        for j in neighbors:
            adj[i].append(j)
            adj[j].append(i)  # 无向图
    return adj

adj = build_purchase_network(n, avg_degree=4)

# 计算邻居处理比例（暴露程度）
neighbor_treatment_ratio = np.array([
    T[adj[i]].mean() if adj[i] else 0.0
    for i in range(n)
])

# 真实效应：直接效应 + 溢出效应
direct_effect  = 0.08   # 直接处理效应
spillover_coef = 0.04   # 邻居处理比例的溢出效应

# 潜在结果（含溢出）
Y_base = (0.25
    + 0.05 * X[:, 0]    # 购买频次正向
    + 0.02 * X[:, 2]    # 宝宝月龄正向
    + np.random.normal(0, 0.05, n))

Y_obs = (Y_base
    + direct_effect * T
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:1611.09032。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户的推荐系统实验分配 + 用户购买行为网络（谁与谁有共同购买历史）+ 库存变化数据；价格场景另需按 SKU 或品类的分组结构以支持集群随机化；卡页示例为 2000 用户规模。

**输出**：纠正后的直接效应与溢出效应分解（卡页示例：朴素 ATE +1.2%、溢出纠正后 +2.1%、社交溢出 +0.3%），以及是否上线的建议与更准确的价格弹性估计。

## 执行步骤

1. 整理实验分配、用户购买关系网络与库存变化数据
2. 用暴露映射函数构造每个用户的邻居处理比例
3. 同时建模直接效应与溢出效应，输出纠正后的 ATE
4. 对比朴素估计，判断是否因溢出而低估效果
5. 用多种网络定义与集群随机化方案做敏感性检验

## 边界与不做

- 何时不用：实验单元之间确实独立（无共享库存、无社交传播）时不必纠正；没有可用的网络或库存数据时也无法建模。
- 能力边界：网络构建方式（共同购买还是直接关系）会显著影响结果，需做多种网络定义的敏感性分析；集群随机化需改造实验基础设施，本技能只给出纠正后的结论与方案。
- 合规边界：使用共同购买等行为数据构图，不获取直接社交关系，并在隐私政策中说明行为数据分析用途。
- 卡页数字（ATE 从 +1.2% 修正至 +2.1%、社交溢出 +0.3%、约 20% 的实验有显著溢出、年化 60 万与 80 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Network-Effect-Experiments.html、Skill-Network-Effect-Experiments、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design
- **延伸**：Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design
- **可组合**：Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Interference-Spillover-Correction

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Interference-Spillover-Correction`