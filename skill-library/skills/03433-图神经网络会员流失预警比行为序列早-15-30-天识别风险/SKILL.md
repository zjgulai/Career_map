---
name: "p2s-membership-churn-early-warning-graph"
title: "Membership Churn Early Warning Graph — 图神经网络会员流失预警比行为序列早 15-30 天识别风险"
description: "触发词：图神经网络、社群关系、流失预警、关系衰减、中心性、提前干预。何时不用：只有个体行为数据、没有会员间关系数据时用常规流失预测；要利用社群与互动关系把预警提前 15–30 天时用本卡。安全边界：关系图只能用平台内可授权的互动与购买关系，不得抓取私人社交关系或敏感属性，图数据须脱敏存储。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Membership-Churn-Early-Warning-Graph"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从会员之间的社群关系变化里提前发现要流失的人，比等行为指标下滑更早介入。"
user_try: "试试：这是我的会员购买与互动关系数据，帮我构建关系图并提前识别高风险流失会员。"
whenToUse: "与「流失预测」相比：个体行为特征打分为主时用那张卡；有会员间关系与互动数据、需要更早预警时用本卡的图方法。"
workflow: "构建会员关系图（同品牌购买、UGC 互动、同 KOL 渠道） → 按月滑动窗口生成动态图快照 → 提取图结构变化指标（同伴流失比例、边权衰减、中心性下降） → 结合个体特征预测流失并输出高风险名单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Membership Churn Early Warning Graph — 图神经网络会员流失预警比行为序列早 15-30 天识别风险

## ① 解决的问题

会员运营面临"RFM流失预警太滞后（用户已45天未购买）、挽留成本高"——动态图神经网络从社群关系衰减提前15-20天识别高风险用户，干预成本从25元降至15元，年化节省约4.8万元

## ② 核心算法逻辑

传统会员流失预测只看个体行为序列（最近购买时间、频率、金额 = RFM），忽略了一个强信号：社群关系的衰减。当一个高价值会员的购买频率下降时，她的社群邻居（同品类购买者、同 KOL 粉丝群）的流失状态是最强的早期预警——邻居已经流失，她流失的概率大幅上升。这比 RFM 信号早 1530 天。

## ③ 业务应用场景

业务问题：独立站金卡会员（月消费 $200+）流失率 8%/月，用传统 RFM 预警时，用户已经 45 天没购买，此时挽回成本高（需要大力度折扣）。想把预警时间提前到 20-25 天（用户购买频率刚开始下滑时）。
图构建（母婴社群关系）： - 节点：所有会员（约 5,000 人） - 边1：「同月购买奶粉同品牌」（同品牌忠诚度群体） - 边2：「对同一产品有 UGC 互动」（评论/晒单） - 边3：「来自同一 KOL 渠道」（兴趣圈子） - 时间步：按月滑动窗口
早期信号（图结构变化指标）： - 用户的购买同伴（同品购买边）中，流失用户比例上升 - 用户的 KOL 群体中，近期互动减少（边权重衰减） - 用户在品类购买图中的中心性下降（从活跃节点变为孤立节点）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：5,000 金卡会员，月流失 400 人，图预警提前 15-20 天使干预成本从 $25 降至 $15/人，月化节省 $4,000，年化约 $4.8 万；同时减少流失本身带来的 LTV 损失（每流失 1 人损失约 $120 CLV）
实施难度：⭐⭐⭐☆☆（图构建需要用户关系数据，静态图版本 2-3 周；动态图 Neural ODE 需要额外 4-6 周）
优先级：⭐⭐⭐⭐☆（流失比获客成本低 5-7x，高价值用户流失尤其值得提前预警）
评估依据：TempODEGraphNet 在 NCSOFT 10,000 用户游戏数据上 F1 显著优于 static GNN 和 LSTM；TGN 银行流失预测比 LSTM/GCN 基线准确率提升 12-18%，客户 CLV 提升 14%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（247 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Membership Churn Early Warning Graph
图神经网络会员流失预警（动态图 + 时序建模）

依赖：numpy, pandas, scipy
实现：静态图 GCN + 时序特征 → 流失概率预测（简化版）
"""

import numpy as np
import pandas as pd
from scipy.sparse import lil_matrix, csr_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
from typing import List, Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 生成动态会员行为数据
# ─────────────────────────────────────────────

def generate_member_data(n_members: int = 600, n_months: int = 8) -> pd.DataFrame:
    """生成会员购买时序数据（含流失标签）"""
    np.random.seed(42)
    records = []

    for uid in range(n_members):
        # 会员类型
        mtype = np.random.choice(['loyal', 'at_risk', 'churned'],
                                  p=[0.5, 0.3, 0.2])
        # 购买频率（月均次数）
        base_freq = {'loyal': 2.5, 'at_risk': 1.2, 'churned': 0.3}[mtype]
        # KOL 来源
        kol = np.random.choice(['kol_A', 'kol_B', 'kol_C', 'organic'])
        # 最终是否流失（6个月内）
        churn_label = int(np.random.random() < {'loyal': 0.05, 'at_risk': 0.40, 'churned': 0.85}[mtype])

        for month in range(n_months):
            # 流失用户购买频率逐月下降
            decay = (1 - 0.25 * month / n_months) if churn_label else 1.0
            freq = max(0, np.random.poisson(base_freq * decay))
            spend = freq * np.random.lognormal(4.0, 0.4) if freq > 0 else 0

            records.append({
                'user_id': f'M{uid:04d}',
                'member_type': mtype,
                'kol_source': kol,
                'month': month,
                'purchase_freq': freq,
                'monthly_spend': round(spend, 2),
                'has_review': int(freq > 0 and np.random.random() < 0.3),
                'churn_label': churn_label,
            })

    return pd.DataFrame(records)


# ─────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2309.14390 — Early Churn Prediction from Large Scale User-Product Interaction Time Series

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：会员节点信息（卡页约 5,000 人规模）、会员间关系边（同品购买、UGC 互动、同渠道来源）、按月的行为与交易记录；需可授权的互动数据。

**输出**：会员流失概率与高风险名单、图结构预警指标（同伴流失比例、中心性下降等）与提前预警天数评估（卡页提前 15–20 天），供会员运营安排干预。

## 执行步骤

1. 定义节点与关系边，构建会员关系图。
2. 生成按月滑动的动态图快照并计算边权变化。
3. 提取图谱结构指标（同伴流失、互动衰减、中心性）。
4. 结合个体行为特征训练流失预测并输出名单。
5. 评估预警提前天数与干预成本收益。

## 边界与不做

- 何时不用：没有会员间关系数据（只有孤立行为日志）时不要用；个体特征已足够时可先用常规流失模型。
- 能力边界：产出预警名单与指标，不代做干预；干预成本 $25→$15、年化约 $4.8 万为卡页案例值。
- 安全边界：关系图只能用可授权数据，不得抓取私人社交关系，须脱敏存储。

## 技能关联

- **前置**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-GNN-Foundations.html、Skill-GNN-Foundations、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **延伸**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **可组合**：Skill-Cohort-Churn-Intervention-Dispatcher.html、Skill-Cohort-Churn-Intervention-Dispatcher、Skill-Graph-Neural-Lookalike-Propagation.html、Skill-Graph-Neural-Lookalike-Propagation、Skill-MTL-Churn-LTV-Joint-Prediction.html、Skill-MTL-Churn-LTV-Joint-Prediction、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-Membership-Churn-Early-Warning-Graph

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Membership-Churn-Early-Warning-Graph`