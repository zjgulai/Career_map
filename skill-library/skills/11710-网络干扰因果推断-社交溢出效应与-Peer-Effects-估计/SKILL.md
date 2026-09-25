---
name: "p2s-interference-networks-causal"
title: "网络干扰因果推断 — 社交溢出效应与 Peer Effects 估计"
description: "触发词：网络干扰、溢出效应、Peer Effects、裂变ROI、聚类随机化。何时不用：用户之间没有可观测的关系图时溢出效应无从估计，改用常规A/B设计。安全边界：构建用户关系图谱需脱敏，不暴露个人社交关系，仅用于效应估计。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 传播规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Interference-Networks-Causal"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "把朋友被带动的那部分效果单独算出来，别让裂变与 KOL 活动的真实价值被传统实验低估。"
user_try: "试试：帮我评估这场拉新裂变的溢出效应，算算第 1 跳和第 2 跳各该给多少奖励。"
whenToUse: "当实验单元之间存在社交或邀请关系、用户结果不仅受自身处理影响还受邻居处理影响，需要把直接效应与溢出效应分开估计时用；没有关系图或关系不可观测时用常规 A/B 实验设计。"
workflow: "构建用户关注图或邀请关系图并做社区划分 → 按社区进行聚类随机化，避免组内互相干扰 → 采集各跳新用户的首购时间、GMV 与活动参与标记 → 固定邻居处理比例，分别估计直接效应与溢出效应 → 用溢出衰减曲线确定第 1 跳与第 2 跳的奖励梯度"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 网络干扰因果推断 — 社交溢出效应与 Peer Effects 估计

## ① 解决的问题

增长团队面临"社交裂变活动效果被低估因忽略用户间溢出效应"——网络干扰因果推断将裂变ROI估计准确率提升35%，年化减少无效裂变预算浪费30-60万元

## ② 核心算法逻辑

核心问题：SUTVA（稳定单元处理值假设）在社交网络中被违反——用户 i 的结果不仅受自身处理 $T_i$ 影响，还受邻居处理状态 $\mathbf{T}_{N(i)}$ 影响。

## ③ 业务应用场景

场景1：Amazon Vine 评论员口碑溢出 - 业务问题：邀请 Top Reviewer 测评婴儿推车，其粉丝群的购买率受影响——传统 A/B 忽略此溢出，低估促销 ROI。 - 数据要求：评论员关注图（follower graph）、评测时间戳、商品购买记录（30 天窗口） - 预期产出：直接效应（被邀评论员本身转化）+ 溢出效应（粉丝网络转化增量）分离估计 - 业务价值：溢出效应通常占总效应 25-40%，重新分配 KOL 预算可提升整体 ROAS 约 18%
场景2：母婴社群裂变活动设计 - 业务问题：「拉新立减」活动中，老用户邀请新用户，新用户再拉新——多跳干扰导致传统实验低估活动效果 - 数据要求：用户邀请关系图、每层新用户的首购时间与 GMV、活动参与标记 - 预期产出：各跳溢出衰减曲线，用于确定最优奖励梯度（第1跳 vs 第2跳奖励比） - 业务价值：优化奖励结构后裂变系数 K 从 1.2 提升至 1.6，获客成本降低 22%
**三轨验证**： - 成本：需构建用户关系图，数据工程成本约 2 周 - 合规：用户图谱需脱敏，不暴露个人社交关系 - 风险：曝光映射函数选择错误会导致估计偏差，需多种映射函数稳健性检验

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

实施难度：⭐⭐⭐⭐☆（需要用户关系图构建，工程复杂度较高）
优先级：⭐⭐⭐⭐☆（社交电商、KOL 营销场景高度相关）
适用规模：节点数 >5000 效果更稳健；小网络需谨慎解读

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（94 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
网络干扰下的因果推断 — 溢出效应估计
依赖: numpy, pandas, networkx, scipy
"""
import numpy as np
import pandas as pd
import networkx as nx
from scipy.stats import norm

np.random.seed(42)

# ── 1. 构造模拟社交网络 ──────────────────────────────────────────
n_nodes = 200
G = nx.barabasi_albert_graph(n_nodes, m=3, seed=42)

# ── 2. 聚类随机化（按社区分层）───────────────────────────────────
communities = list(nx.community.greedy_modularity_communities(G))
cluster_treatment = {}
for i, comm in enumerate(communities):
    # 随机决定该 cluster 是否接受处理
    treated = np.random.binomial(1, 0.5)
    for node in comm:
        cluster_treatment[node] = treated

T = np.array([cluster_treatment[i] for i in range(n_nodes)])

# ── 3. 计算曝光映射（邻居处理比例）──────────────────────────────
def exposure_mapping(G, T, node):
    """邻居处理比例作为溢出曝光摘要"""
    neighbors = list(G.neighbors(node))
    if len(neighbors) == 0:
        return 0.0
    return np.mean(T[neighbors])

neighbor_treat_ratio = np.array([exposure_mapping(G, T, i) for i in range(n_nodes)])

# ── 4. 生成潜在结果（含直接效应 + 溢出效应）────────────────────
# Y_i = alpha * T_i + beta * neighbor_ratio + epsilon
alpha_true = 0.5   # 直接效应
beta_true  = 0.3   # 溢出效应强度
epsilon    = np.random.normal(0, 0.5, n_nodes)

Y = alpha_true * T + beta_true * neighbor_treat_ratio + epsilon

# ── 5. Horvitz-Thompson 估计量 ───────────────────────────────────
# 简化版：按曝光状态分组比较

# 定义高/低溢出区间
high_spill = neighbor_treat_ratio > 0.5
low_spill  = neighbor_treat_ratio <= 0.5

# 直接效应（控制溢出水平）
DE_high = Y[(T == 1) & high_spill].mean() - Y[(T == 0) & high_spill].mean()
DE_low  = Y[(T == 1) & low_spill].mean()  - Y[(T == 0) & low_spill].mean()
DE_avg  = 0.5 * DE_high + 0.5 * DE_low

# 溢出效应（固定自身处理为 0）
SE = Y[(T == 0) & high_spill].mean() - Y[(T == 0) & low_spill].mean()

# ── 6. OLS 回归验证（同时估计 DE + SE）─────────────────────────
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户间关系图（评论员关注图或邀请关系图）、干预处理标记（建议按社区做聚类随机化）、各层新用户的首购时间与 GMV 或 30 天窗口内的商品购买记录、活动参与标记；卡页指出节点数 > 5000 时结果更稳健。

**输出**：直接效应与溢出效应的分离估计、各跳溢出衰减曲线与最优奖励梯度，供 KOL 预算与裂变奖励结构决策使用（卡页示例：溢出通常占总效应 25-40%、裂变系数 K 从 1.2 提升至 1.6、获客成本降低 22%）。

## 执行步骤

1. 构建用户关注图或邀请关系图并做社区划分
2. 按社区进行聚类随机化，避免组内干扰
3. 采集各跳新用户的首购时间、GMV 与活动参与标记
4. 固定邻居处理比例，分别估计直接效应与溢出效应
5. 用溢出衰减曲线确定各跳的奖励梯度

## 边界与不做

- 何时不用：没有可用的用户关系图，或网络规模太小（卡页建议节点数 > 5000）时不要用，结论不稳。
- 能力边界：结论受曝光映射函数选择影响，需做多种映射的稳健性检验；本技能只估计效应与奖励梯度，不执行奖励发放或活动上线。
- 合规边界：构建用户关系图谱需脱敏，不暴露个人社交关系，图谱仅用于效应估计。
- 卡页数字（溢出占总效应 25-40%、K 从 1.2 到 1.6、获客成本降 22%）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Interference-Networks-Causal

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Interference-Networks-Causal`