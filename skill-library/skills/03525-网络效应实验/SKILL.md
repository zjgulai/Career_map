---
name: "p2s-network-effect-experiments"
title: "Network Effect Experiments（网络效应实验）"
description: "触发词：网络效应实验、簇随机化、SUTVA 违反、推荐链路、溢出效应、分簇分析。何时不用：用户之间不会互相影响（无分享、无推荐链路、无库存竞争）时个体随机化更高效；流量不足以形成足够簇数时先扩量。安全边界：社交与推荐链路数据需在合规范围内使用、优先聚合分析，不用实验结论去做操纵库存感知的动作。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Network-Effect-Experiments"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户之间会互相影响时，改用按推荐链路分簇的随机化实验，避免效果被算错。"
user_try: "试试：推荐有奖功能的 A/B 结果可能被推荐链路污染，帮我设计一个簇随机化实验。"
whenToUse: "推荐、分享、社群类功能存在组间互相影响时用簇随机化；用户相互独立时用个体随机化 A/B；只想提升灵敏度时改用方差缩减类技能。"
workflow: "识别互动链路并为用户分簇 → 按簇而非按用户随机分配处理与对照 → 估计簇内相关性与处理效应 → 校正 SUTVA 违反带来的效果偏差 → 结合库存与周期给出上线判断"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Network Effect Experiments（网络效应实验）

## ① 解决的问题

测试"推荐有奖"功能——A 组用户分享推荐链接，B 组收到推荐

## ② 核心算法逻辑

核心思想：传统A/B实验假设用户独立（SUTVA），但社交电商中用户行为相互影响，导致实验偏差。通过Cluster Randomization（簇随机化）将相关用户分组到同一treatment，消除跨组干扰。

## ③ 业务应用场景

业务问题：某品牌婴儿推车在Amazon US站点，测试"推荐有奖"功能是否提升转化。传统个体随机实验中，A组用户分享推荐链接，B组用户接收推荐——B组购买行为被A组推荐直接影响，违反SUTVA，导致效果被高估。
数据规模： - 周流量：5000 UV - 基线转化率：3.2%（周销售160件） - 基线ROAS：2.1 - 库存规模：800件 - 实验周期：4周
实验设计：Cluster Randomization按推荐链路分簇。将5000用户按"推荐来源账户"分为150个簇（平均33人/簇），随机75个簇启用推荐有奖（treatment），75个簇保持对照。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

直接产出：年化99.8万元（场景1）+ 172.8万元（场景2）= 272.6万元
间接产出：避免因SUTVA违反导致的错误决策（低估效果导致功能下线、高估效果导致库存积压），年化节省45-60万元
总ROI：实施成本5.7万元，首年产出318.3万元，ROI = 5483%
优势：算法逻辑清晰（仅需改造分流逻辑），无需复杂统计建模
难点：(1)簇定义需要深入理解业务（推荐链路、社群结构），(2)簇大小不均导致方差增加，需要分层随机化或加权估计，(3)后端改造成本中等（推荐链路追踪、用户分簇存储）
数据要求：需要用户社交图谱/推荐链路数据，中等规模团队可在2-3周内完成

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（193 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ab_testing/network_effect_experiments` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Network-Effect-Experiments.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy import stats

# ============ 数据生成 ============
np.random.seed(42)

# 场景1：婴儿推车推荐实验
n_clusters = 150
cluster_size = 33
n_users = n_clusters * cluster_size

# 生成簇ID和用户数据
cluster_ids = np.repeat(np.arange(n_clusters), cluster_size)
user_ids = np.arange(n_users)

# 基线转化率3.2%，簇内相关性0.15
baseline_conversion = 0.032
cluster_effect = np.random.normal(0, 0.008, n_clusters)
user_conversion_baseline = np.tile(
    baseline_conversion + cluster_effect, cluster_size
)
user_conversion_baseline = np.clip(user_conversion_baseline, 0.01, 0.15)

# ============ 簇随机化分配 ============
def cluster_randomize(cluster_ids, n_treatment_clusters):
    """
    簇随机化：随机选择n_treatment_clusters个簇作为treatment
    返回每个用户的assignment
    """
    unique_clusters = np.unique(cluster_ids)
    n_clusters_total = len(unique_clusters)
    
    treatment_cluster_indices = np.random.choice(
        n_clusters_total, n_treatment_clusters, replace=False
    )
    treatment_clusters = unique_clusters[treatment_cluster_indices]
    
    assignment = np.array(
        ['treatment' if c in treatment_clusters else 'control' 
         for c in cluster_ids]
    )
    return assignment, treatment_clusters

# 分配75个簇到treatment，75个到control
assignment, treatment_clusters = cluster_randomize(cluster_ids, 75)

# ============ 处理效应模拟 ============
# Treatment effect：推荐有奖提升转化率1.6pp
treatment_effect = 0.016

# 生成观测结果
np.random.seed(43)
user_outcomes = np.random.binomial(
    1, user_conversion_baseline
)

# 应用treatment effect
treatment_mask = assignment == 'treatment'
user_outcomes[treatment_mask] = np.random.binomial(
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户级数据加簇标识（如推荐来源账户）、处理分配与结果指标；另需周流量、基线转化率、基线 ROAS、库存规模与实验周期等背景参数，簇内相关性需可估计。

**输出**：簇随机化分配方案、簇内相关性与校正后的处理效应估计、基于效果区间的上线或下线决策建议；供增长团队在推荐、分享类功能上形成可靠因果结论。

## 执行步骤

1. 定义互动链路并为用户分簇
2. 按簇随机分配处理组与对照组
3. 估计簇内相关性与处理效应
4. 校正 SUTVA 违反导致的效应高估或低估
5. 结合库存与实验周期给出上线判断

## 边界与不做

- 何时不用：用户之间无互动链路或流量不足以形成足够簇数时用个体随机化 A/B，强行分簇只会牺牲统计功效。
- 能力边界：本技能给出分簇方案与校正后的效应估计，不执行线上分流与功能开关。
- 风险边界：簇的界定方式直接决定估计结果，跨簇干扰（公共大 V、跨簇传播）未处理时结论只能当作区间参考。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Inference-Fundamentals
- **延伸**：Skill-Heterogeneous-Treatment-Effects、Skill-Interference-Robust-Estimation
- **可组合**：Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-Network-Effect-Experiments

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Network-Effect-Experiments`