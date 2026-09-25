---
name: "p2s-bccb-causal-bandits"
title: "预算约束因果Bandit - 新渠道从Day1开始的转化率估计"
description: "触发词：预算约束 Bandit、新渠道冷启动、转化率置信区间、在线学习、早期止损。何时不用：渠道已累积足够样本、只需做事后归因时用常规归因技能；本技能解决的是冷启动期数据太少的问题。安全边界：投放实验须遵守平台广告政策与用户数据合规要求，成本与曝光数据须如实记录。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 广告实验"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-BCCB-Causal-Bandits"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "新渠道刚投出去、数据很少也能给出转化率的置信区间，早几天决定是加预算还是止损。"
user_try: "试试：用 Pinterest 渠道前几天的曝光、成本与转化数据，给出 CVR 的置信区间和加预算或停投建议。"
whenToUse: "新渠道数据极少、要在早期判断效果时用本技能；样本充足渠道的效果归因用常规归因技能。"
workflow: "接入用户级曝光、处理标志、转化与成本数据 → 用预算约束因果 Bandit 在线更新转化率估计 → 输出转化率置信区间与不确定性范围 → 按区间给出加预算或提前止损的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 预算约束因果Bandit - 新渠道从Day1开始的转化率估计

## ① 解决的问题

业务问题：刚在Pinterest上开了母婴用品广告，花了 $300，曝光 2000 次，只有 2 个转化

## ② 核心算法逻辑

传统Uplift模型遵循两阶段离线流程——先收集历史数据估计异质性处理效应（HTE），再求解预算约束优化问题。这在数据丰富时效果良好，但在冷启动场景（新渠道、新市场、新用户群）中完全失效。

## ③ 业务应用场景

业务问题：刚在Pinterest上开了母婴用品广告，花了 $300，曝光 2000 次，只有 2 个转化。传统归因模型因为数据太少完全无法运作——但营销团队需要知道"Pinterest 的 CVR 大概是多少"来决定要不要加预算。
BCCB 从第一个用户起就在线学习转化率，每来一个用户都更新估计，第二天就能给出有统计意义的 CVR 置信区间。
数据要求： | 字段 | 说明 | 格式 | |------|------|------| | user_id | 用户唯一标识 | string | | user_features | 设备、地区、行为特征 | array[float] | | is_treated | 是否被展示广告（0/1） | binary | | converted | 是否发生转化（0/1） | binary | | timestamp | 事件时间 | datetime | | cost | 单次曝光成本 | float |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

当前状态：每个新渠道测试期 14 天，日均预算 $300，总投入 $4,200/渠道
BCCB 后：2 天即可获得初步决策信号，无效渠道提前 12 天停投
每年节省：若测试 10 个渠道，每次平均止损 $3,000，年节省 $30,000
转化提升：在预算不变前提下，BCCB 优先处理高响应用户，转化提升预期 15-25%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（688 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ab_testing/bccb_causal_bandits` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-BCCB-Causal-Bandits.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Budget-Constrained Causal Bandits (BCCB) 完整实现
母婴出海场景：新渠道/新市场冷启动转化率估计

论文：arXiv:2604.26169 (2025)
数据集：Criteo Uplift Dataset 风格

包含：
- Causal Bandit 环境模拟
- BCCB 算法：CATE估计 + Thompson Sampling + 预算约束
- Baseline 对比：离线两阶段Uplift、Greedy HTE、Budgeted TS
- 数据效率对比图
- 方差分析（多次运行）
- 渠道CVR每日更新估计 + 置信区间
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────────────────────────────────────
# 1. 数据环境：Criteo Uplift 风格的母婴广告数据
# ─────────────────────────────────────────────────────────────────────────────

class MaternalAdEnvironment:
    """
    母婴广告因果Bandit环境
    模拟Criteo Uplift Dataset结构：用户特征 + 处理分配 + 转化结果
    """

    def __init__(
        self,
        n_features: int = 12,
        true_base_rate: float = 0.03,
        true_ate: float = 0.015,
        heterogeneity: float = 0.5,
        cost_per_impression: float = 0.15,  # 每次曝光成本（美元）
        random_seed: int = 42,
    ):
        """
        Args:
            n_features: 用户特征维度（设备/地区/行为等）
            true_base_rate: 自然转化率（未看广告）
            true_ate: 平均处理效应（广告带来的转化提升）
            heterogeneity: 异质性强度（0=均匀效应, 1=高度异质）
            cost_per_impression: 单次曝光成本（美元）
        """
        self.n_features = n_features
        self.true_base_rate = true_base_rate
        self.true_ate = true_ate
        self.heterogeneity = heterogeneity
        self.cost_per_impression = cost_per_impression
        self.rng = np.random.RandomState(random_seed)

        # 真实的CATE权重向量（实际中未知）
        self.true_cate_weights = self.rng.randn(n_features) * heterogeneity
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2604.26169 — Budget-Constrained Causal Bandits: Bridging Uplift Modeling and Sequential Decision-Making

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户级流数据：user_id、用户特征（设备、地区、行为）、是否被展示广告（0/1）、是否转化（0/1）、事件时间、单次曝光成本；粒度到单次曝光。

**输出**：各渠道转化率的在线估计与置信区间、投放决策信号（加预算、继续观察、止损）与预期节省口径；供投放团队做早期渠道决策。

## 执行步骤

1. 接入用户级曝光、处理与转化数据
2. 用预算约束因果 Bandit 在线更新估计
3. 输出转化率点估计与置信区间
4. 按区间给出加预算或止损建议
5. 持续回填数据滚动更新决策

## 边界与不做

- 没有用户级曝光与处理标志数据时用不了本技能，只能等样本累积。
- 本技能输出早期效果估计与决策信号，不执行广告预算调整与停投动作。
- 安全边界：投放实验须遵守平台广告政策与用户数据合规要求，成本与曝光数据须如实记录。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-SSBC-Small-Sample-Conformal.html、Skill-SSBC-Small-Sample-Conformal、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-STATE-Robust-Variance-Reduction.html、Skill-STATE-Robust-Variance-Reduction、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-BCCB-Causal-Bandits

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：02-A_B实验　·　源卡：`Skill-BCCB-Causal-Bandits`