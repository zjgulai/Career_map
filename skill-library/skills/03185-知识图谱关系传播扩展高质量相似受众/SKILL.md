---
name: "p2s-graph-neural-lookalike-propagation"
title: "Graph Neural Lookalike Propagation — 知识图谱关系传播扩展高质量相似受众"
description: "触发词：Lookalike 扩展、图传播、种子人群冷启动、多关系图建模、新品类投放。何时不用：种子规模已够、靠互补品路径推理扩展人群用受众知识图谱技能，本技能专治种子极少时的相似人群扩展。安全边界：用户级行为与渠道来源数据须脱敏聚合，扩展人群投放须遵守平台定向与隐私政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-Graph-Neural-Lookalike-Propagation"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品类只有几十个种子用户时，靠关系图传播也能找到一批相似的高质量受众。"
user_try: "试试：用我们独立站的 80 个推车购买用户做多关系图传播，扩一批可投放的相似人群。"
whenToUse: "种子人数低于平台相似人群的最低要求（如少于 100 人）、传统双塔方法质量差时用本技能；种子已充足、要靠互补品与跨域行为做多跳扩展用受众知识图谱技能。"
workflow: "构建多关系用户图（同品类、同生命周期、同渠道） → 在图结构上计算用户相似度 → 从种子向外扩散候选人群 → 按分数排序取高分候选 → 接入投放并跟踪冷启动成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Graph Neural Lookalike Propagation — 知识图谱关系传播扩展高质量相似受众

## ① 解决的问题

广告投手面临"新品类仅80个种子用户、传统Lookalike质量差"——多关系图传播将种子覆盖从80人扩展到2400候选用户，冷启动CPA降低38%，新品类冷启动节省约6万元

## ② 核心算法逻辑

传统双塔 Lookalike 仅依赖单一特征空间（用户行为向量）做相似度计算。但真实用户的"相似性"是多维度、多关系的：两个母婴用户可能在购买行为上不同，但在社群归属（同一育儿群）、生命周期阶段（同为6个月婴儿妈妈）、跨品类偏好（都买奶粉+纸尿裤）上高度相似。图神经网络 Lookalike 将这些关系显式建模为图结构，通过消息传递找到传统方法遗漏的高质量相似用户。

## ③ 业务应用场景

业务问题：独立站刚上婴儿推车，历史购买者仅 80 人，Meta 平台内置 Lookalike 需要最少 100 人且质量差（都是早期测试购买者，不代表典型目标用户）。传统双塔方法因数据量不足效果极差。
图构建方案： - 节点：独立站所有注册用户 + 有行为记录访客（约 8,000 人） - 边类型1：「同品类购买」——购买过同一品类（婴儿车/奶粉/辅食）的用户连边 - 边类型2：「同生命周期阶段」——Skill-User-Lifecycle-STAN 判断为同阶段（0-6月/6-18月）的用户连边 - 边类型3：「同渠道来源」——来自同一 KOL 视频的用户连边（相似兴趣信号）
数据要求：用户注册信息 + 行为日志（品类浏览/购买）+ UTM 来源标记

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：种子仅需 50-80 人（比传统 Lookalike 低 50%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（244 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Graph Neural Lookalike Propagation
图神经网络 Lookalike 相似受众扩展

依赖：numpy, pandas, scipy
场景：构建多关系用户图，通过图传播找到高质量 Lookalike 受众
"""

import numpy as np
import pandas as pd
from scipy.sparse import lil_matrix, csr_matrix
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟母婴用户多视图数据
# ─────────────────────────────────────────────

def generate_user_graph_data(n_users: int = 1500, n_seeds: int = 80) -> Tuple[pd.DataFrame, List[str]]:
    """生成多视图用户数据：购买品类 + 生命周期 + 渠道来源"""
    np.random.seed(42)
    user_ids = [f"U{i:04d}" for i in range(n_users)]

    # 婴儿年龄段（决定生命周期阶段）
    baby_age_groups = np.random.choice(
        ['prenatal', '0-3m', '3-6m', '6-12m', '12-24m', '24m+'],
        n_users, p=[0.1, 0.15, 0.2, 0.25, 0.2, 0.1]
    )
    # 购买品类偏好（多热编码）
    categories = ['stroller', 'formula', 'diaper', 'toy', 'clothing', 'feeding']
    cat_matrix = np.zeros((n_users, len(categories)))
    for i in range(n_users):
        n_cats = np.random.randint(1, 4)
        chosen = np.random.choice(len(categories), n_cats, replace=False)
        cat_matrix[i, chosen] = 1

    # KOL来源渠道
    kol_source = np.random.choice(
        ['kol_A', 'kol_B', 'kol_C', 'organic', 'paid'],
        n_users, p=[0.2, 0.15, 0.1, 0.35, 0.2]
    )
    # LTV（用于标记种子）
    ltv = np.random.lognormal(3.8, 0.9, n_users)

    df = pd.DataFrame({'user_id': user_ids, 'baby_age': baby_age_groups,
                       'kol_source': kol_source, 'ltv': ltv})
    for j, cat in enumerate(categories):
        df[f'cat_{cat}'] = cat_matrix[:, j]

    # 种子：购买过推车且 LTV > P70
    stroller_buyers = df[df['cat_stroller'] == 1]
    ltv_threshold = np.percentile(stroller_buyers['ltv'], 30)
    seeds = stroller_buyers[stroller_buyers['ltv'] >= ltv_threshold]['user_id'].tolist()[:n_seeds]
    return df, seeds
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2301.03147 — Finding Lookalike Customers for E-Commerce Marketing
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户注册信息与行为日志（品类浏览、购买）、UTM 来源标记；图规模为站内全部注册用户与有行为记录访客（卡页口径约 8,000 人），种子为 50-80 人。

**输出**：从种子扩展出的相似候选人群列表与相似度排序（卡页口径由 80 人扩展到 2400 个候选），供投放团队做冷启动人群包；卡页口径冷启动 CPA 降低 38%。

## 执行步骤

1. 汇总站内注册用户与有行为记录的访客，构建图的节点集合。
2. 按同品类购买、同生命周期阶段、同渠道来源建立多类关系边。
3. 在图结构上做消息传播计算，得到用户之间的相似度。
4. 从种子节点向外扩散候选人群并按相似度排序。
5. 把高分候选打包投放，并跟踪冷启动成本变化。

## 边界与不做

- 站内行为数据过少、无法建立多类关系边时不要用，图传播会退化成普通相似度计算。
- 能力边界：本技能产出候选人群与排序，不执行投放、不保证 CPA 降幅；卡页的扩展规模与 CPA 数字来自特定冷启动案例。
- 合规红线：用户级行为与渠道来源数据须脱敏聚合，投放须遵守平台定向与隐私政策。

## 技能关联

- **前置**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Dual-Tower-Lookalike-Modeling.html、Skill-Dual-Tower-Lookalike-Modeling、Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-Graph-Attention-Network-Recommendation.html、Skill-Graph-Attention-Network-Recommendation、Skill-KG-Powered-User-Profiling.html、Skill-KG-Powered-User-Profiling、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-Graph-Attention-Network-Recommendation.html、Skill-Graph-Attention-Network-Recommendation、Skill-KG-Powered-User-Profiling.html、Skill-KG-Powered-User-Profiling、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **可组合**：Skill-Facebook-Audience-Lookalike-Scaling.html、Skill-Facebook-Audience-Lookalike-Scaling、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN、Skill-Graph-Neural-Lookalike-Propagation

---

> 分类：业务运营/品牌与增长/分群　·　技术族：08-知识图谱　·　源卡：`Skill-Graph-Neural-Lookalike-Propagation`