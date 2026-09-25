---
name: "p2s-network-interference-causal"
title: "Network Interference Causal — 网络干扰下的因果推断（peer effects）"
description: "触发词：网络干扰、溢出效应、peer effects、集群随机化、暴露映射、口碑溢出量化。何时不用：已确认无组间互动时不必做暴露映射；只是想让实验更灵敏时改用方差缩减或控制变量。安全边界：社交关系数据使用需符合 GDPR 等法规、建议聚合层面分析，竞品与平台数据采集需走官方 API 而非爬虫。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Network-Interference-Causal"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把直接效果和溢出效果分开量化，避免 KOL 与社群的推广收益被算错。"
user_try: "试试：帮我量化 KOL 带货对社群内非粉丝用户的溢出购买效应。"
whenToUse: "存在推荐、社群或 KOL 传播导致组间互相影响时用本技能；无互动时用标准 A/B；数据不足时先补社交关系图与集群规模。"
workflow: "构建用户社交关系图并划分集群 → 在集群层面分配处理与对照组 → 用邻居暴露比例做暴露映射与状态分类 → 分别估计直接效应与溢出效应 → 修正 KOL 或社群的 ROI 评估口径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Network Interference Causal — 网络干扰下的因果推断（peer effects）

## ① 解决的问题

增长团队面临"同一平台用户互动导致AB实验组污染"——网络干扰识别将实验偏差降低50%，年化提升实验决策准确率节省无效推广费20-40万元

## ② 核心算法逻辑

标准因果推断假设 SUTVA（稳定单元处理值假设）：个体 i 的结果只受自身处理影响，不受他人处理影响。但在社交平台、家庭购物、KOL 带货场景中，网络干扰（interference）普遍存在——用户 A 的购买决策会影响关联用户 B。

## ③ 业务应用场景

场景1：母婴 KOL 带货的溢出效应量化 - 业务问题：KOL 推广后，购买了该 KOL 推荐品的用户，其「粉丝圈/社群」内的其他用户是否也有购买提升？量化口碑溢出效应 - 数据要求：用户社交关系图（关注关系）、KOL 推广处理变量（是否粉丝/被推荐）、购买结果，至少 1000 用户 × 10 个社群 - 预期产出：直接购买率提升 + 溢出购买率提升分开量化，指导 KOL 矩阵扩大溢出覆盖 - 业务价值：合理计算 KOL ROI（含溢出效应通常是直接效应的 1.3-1.8 倍），年化节省 KOL 合作费用评估误差 10-20 万元
**三轨验证**： - 成本：纯 Python 实现，需要社交关系数据（可用关注/评论关系近似） - 合规：社交关系数据使用需符合 GDPR，建议聚合层面分析不涉及个体隐私 - 风险：集群界定（如何定义「社群」）影响估计结果；若集群间存在跨集群干扰（如公共 KOL），估计量有偏

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：正确计量 KOL ROI（含溢出效应通常高估 30-80%），优化 KOL 矩阵投放策略，年化节省或提升价值 15-40 万元
实施难度：⭐⭐⭐⭐⭐（需要社交关系数据 + 集群随机化设计 + 暴露映射，工程复杂度高）
优先级：⭐⭐⭐☆☆（仅在有社交关系数据且 KOL 投入较大时优先实施）
评估依据：亚马逊跨境电商的 KOL 带货溢出效应研究表明溢出率约为直接效应的 40-70%；忽略网络干扰会导致 KOL 效果严重低估，影响预算决策。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（104 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
# Network Interference Causal：网络干扰下的直接效应与溢出效应估计
import numpy as np
import pandas as pd
from scipy import stats

np.random.seed(2024)
n_clusters = 50     # 社群数
avg_cluster_size = 30  # 平均社群规模
n_total = n_clusters * avg_cluster_size

# ---- 数据模拟：集群随机化实验 ----
# 集群分配（50%集群被KOL覆盖处理）
cluster_treated = np.random.binomial(1, 0.5, n_clusters)

# 个体数据
cluster_id = np.repeat(np.arange(n_clusters), avg_cluster_size)
T_cluster = cluster_treated[cluster_id]  # 集群级处理

# 个体是否直接接触KOL（集群内部分接触）
individual_exposure = np.random.binomial(1, 0.4, n_total) * T_cluster  # 只有处理集群内才有暴露

# 特征
baby_age = np.random.randint(3, 18, n_total)
is_follower = individual_exposure  # 直接粉丝

# 暴露映射：邻居中有多少比例是 KOL 粉丝
neighbor_exposure_rate = np.zeros(n_total)
for c in range(n_clusters):
    mask = cluster_id == c
    neighbor_rate = individual_exposure[mask].mean()
    neighbor_exposure_rate[mask] = neighbor_rate

# 定义暴露状态（4类）
# (直接暴露, 邻居暴露) → (0,low), (0,high), (1,low), (1,high)
high_neighbor_threshold = 0.3
direct = individual_exposure
neighbor_high = (neighbor_exposure_rate > high_neighbor_threshold).astype(int)

# 真实效应
tau_direct = 0.15    # 直接效应
tau_spillover = 0.07  # 溢出效应
tau_interaction = 0.03  # 交互效应

p_base = 0.10
Y_prob = (p_base
          + tau_direct * direct
          + tau_spillover * neighbor_high * (1 - direct)
          + tau_interaction * direct * neighbor_high)
Y = np.random.binomial(1, np.clip(Y_prob, 0, 1), n_total)

df = pd.DataFrame({
    'cluster_id': cluster_id,
    'T_cluster': T_cluster,
    'direct': direct,
    'neighbor_high': neighbor_high,
    'neighbor_rate': neighbor_exposure_rate,
    'Y': Y,
    'baby_age': baby_age
})
print(f"样本量: {n_total}, 集群数: {n_clusters}")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户社交关系图（关注、评论关系）、集群随机化的处理分配、个体暴露变量与购买结果，规模需支撑集群级估计（如上千用户、数十个社群）；另需聚合层面的合规确认。

**输出**：直接效应与溢出效应分开的估计结果、暴露状态分类表、以及含溢出效应的渠道 ROI 修正结论；供增长团队与 KOL 预算评估使用。

## 执行步骤

1. 构建用户社交关系图并划分集群
2. 在集群层面分配处理与对照
3. 用邻居暴露比例做暴露映射与状态分类
4. 分别估计直接效应与溢出效应
5. 修正 KOL 或社群的 ROI 评估口径

## 边界与不做

- 何时不用：没有社交关系数据、或互动规模太小无法形成集群时不要使用，此时用标准 A/B 并显式声明干扰局限即可。
- 能力边界：本技能产出因果估计量与暴露映射规则，不做投放执行与社群运营动作。
- 风险边界：集群如何界定会显著影响估计结果，存在跨集群干扰时估计量有偏，需在报告中标注。

## 技能关联

- **可组合**：Skill-Network-Interference-Causal

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：01-因果推断　·　源卡：`Skill-Network-Interference-Causal`