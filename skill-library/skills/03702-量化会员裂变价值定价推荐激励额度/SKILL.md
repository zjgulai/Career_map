---
name: "p2s-referral-network-value-attribution"
title: "Referral Network Value Attribution — 量化会员裂变价值定价推荐激励额度"
description: "触发词：推荐激励定价、网络价值、传导价值、LTV 溢价、分层激励。何时不用：只想算 K 因子与增长曲线时用病毒传播建模技能；本技能算的是推荐关系带来的单客价值与激励额度。安全边界：推荐关系追踪须告知用户并符合隐私政策；激励支出须在营销费用与税务申报中如实列示。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-099"
l3_business: "联盟运营"
l3_all: "联盟运营 / 分群"
l1_l2_l3: "业务运营/品牌与增长/联盟运营"
p2s_card_id: "Skill-Referral-Network-Value-Attribution"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "算清楚一个被推荐来的客户到底值多少钱，再据此定推荐奖励，该多给的别少给、该省的别乱发。"
user_try: "试试：用我的推荐关系网络和历史 LTV，测算最优推荐激励额度并给出分层激励方案。"
whenToUse: "已有推荐关系数据、要决定奖励给谁、给多少时用本技能；只看裂变增速用 K 因子建模技能。"
workflow: "接入会员历史数据与推荐关系网络 → 计算被推荐用户的 LTV 溢价与下游传导价值 → 求解最大愿意支付额度并折算利润目标下的实际激励 → 按用户经验分层设计差异化奖励"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Referral Network Value Attribution — 量化会员裂变价值定价推荐激励额度

## ① 解决的问题

运营总监面临"推荐激励额度拍脑袋定、不知道谁是超级推荐者、裂变传导价值被低估20-27%"——网络价值精算将激励ROI从0.8x提升至2.2x+，分层激励设计年化增收约1.5万美元

## ② 核心算法逻辑

推荐奖励（如"推荐好友得 $10 券"）的激励额度，大多数公司是拍脑袋定的。拍 $5 可能太低（用户懒得推荐），拍 $20 可能倒贴（推荐来的用户 LTV 不值 $20）。裂变价值归因回答三个具体问题：

## ③ 业务应用场景

业务问题：独立站推荐计划：推荐 1 名好友得 $10 购物券。月均推荐率 4%（100 名活跃会员中 4 人发出推荐链接），推荐转化率 22%。团队不知道 $10 是否合理，也不知道谁是"最值得激励推荐的用户"。
裂变价值精算： 1. 计算被推荐用户 LTV：历史被推荐买家 6 个月 LTV 均值 $185 vs 有机买家 $152（+$33 溢价） 2. 计算传导价值：历史被推荐买家中 8% 会继续推荐，平均带来 0.22 名新用户，下游 LTV 约 $8 3. 精算最优激励：$R^* = $33 + 0.9 × $8 = $40.2（最大愿意支付额度），利润目标下实际激励 $6-12
策略优化： - 对高经验用户（购买次数 ≥ 5 次）：推荐质量最高，给 $12 奖励 - 对中等用户（2-4 次）：$8 奖励 - 对新用户（≤ 1 次）：朋友圈小，给 $5 奖励（降低成本） - 在推荐链接中提醒被推荐用户"你是 XXX 推荐来的"（激活传导效应，提升再推荐率 20%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：500 名活跃会员，月推荐计划精算优化后激励成本降 25%（从 $400 → $300）、推荐转化率提升 15%（从 22% → 25%），年化净收益约 $15,000；识别超级推荐者并针对性激励后，推荐量年化增加 50-70 名新买家，LTV 贡献约 $9,000-13,000
实施难度：⭐⭐☆☆☆（主要是数据分析，推荐关系追踪系统已有即可，1-2 周出完整分析）
优先级：⭐⭐⭐⭐☆（推荐获客成本比广告低 5-8 倍，且被推荐用户 LTV 更高，精算激励是投入产出比极高的优化）
评估依据：IS Research 2023（40万用户）实证：用户使用频次与推荐质量正相关，不同生命周期阶段激励差异显著；Marketing Science 2023（4120万用户）：裂变传导效应使推荐计划价值被低估 20-27%，提醒推荐来源可额外提升推荐率 20-27%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（245 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Referral Network Value Attribution
会员裂变价值归因——网络分析 + 最优激励定价

依赖：numpy, pandas
"""

import numpy as np
import pandas as pd
from collections import defaultdict, deque
from typing import List, Dict, Tuple, Optional, Set
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟推荐网络数据
# ─────────────────────────────────────────────

def generate_referral_network(n_users: int = 500,
                               n_referrals: int = 120) -> Tuple[pd.DataFrame, List[Tuple]]:
    """生成会员数据 + 推荐关系网络"""
    np.random.seed(42)
    user_ids = [f"U{i:04d}" for i in range(n_users)]

    # 用户基础数据
    users_df = pd.DataFrame({
        'user_id': user_ids,
        'join_channel': np.random.choice(
            ['organic', 'paid_ad', 'referred'], n_users, p=[0.4, 0.35, 0.25]),
        'n_purchases': np.random.poisson(3, n_users),
        'ltv_6m': np.random.lognormal(5.0, 0.6, n_users),  # 均值约$150
        'days_since_last_purchase': np.random.exponential(25, n_users),
        'has_referred': np.zeros(n_users, dtype=int),
        'n_referrals_made': np.zeros(n_users, dtype=int),
    })

    # 标记被推荐用户（LTV 溢价 +20%）
    referred_mask = users_df['join_channel'] == 'referred'
    users_df.loc[referred_mask, 'ltv_6m'] *= 1.20

    # 生成推荐关系（有向边：referrer → referred）
    # 高购买频次用户更可能成为推荐者（IS Research 2023 发现）
    referral_prob = users_df['n_purchases'] / (users_df['n_purchases'].sum() + 1e-9)
    referrers = np.random.choice(n_users, n_referrals, p=referral_prob / referral_prob.sum())

    edges = []
    for ref_idx in referrers:
        # 推荐对象：随机选非自己的用户
        referred_idx = np.random.choice([i for i in range(n_users) if i != ref_idx])
        referrer_id = user_ids[ref_idx]
        referred_id = user_ids[referred_idx]
        edges.append((referrer_id, referred_id))
        users_df.loc[ref_idx, 'has_referred'] = 1
        users_df.loc[ref_idx, 'n_referrals_made'] += 1

    return users_df, edges


# ─────────────────────────────────────────────
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：会员级数据：购买次数、6 个月 LTV、加入渠道、推荐关系边（谁推荐了谁）。前提是已存在推荐关系追踪系统。

**输出**：最优激励额度测算、传导价值分解与分层激励方案（不同经验档位的奖励金额）；供会员运营制定与调整推荐计划。

## 执行步骤

1. 接入会员数据与推荐关系网络
2. 计算被推荐用户的 LTV 溢价
3. 叠加下游传导价值得到单客总价值
4. 求解最大愿意支付额度与利润约束下的实际激励
5. 按用户经验分层输出差异化奖励方案

## 边界与不做

- 没有推荐关系追踪数据时用不了本技能，只能做经验定价。
- 本技能输出激励额度与分层方案，不执行奖励发放与积分结算。
- 安全边界：推荐关系追踪须符合隐私政策并告知用户；激励支出须如实计入营销费用申报。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Referral-Viral-Loop-Trigger.html、Skill-Referral-Viral-Loop-Trigger、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-Social-Network-Viral-Growth-Simulation.html、Skill-Social-Network-Viral-Growth-Simulation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Loyalty-Program-ROI-Modeling.html、Skill-Loyalty-Program-ROI-Modeling、Skill-Member-Lifecycle-Intervention-Sequencing.html、Skill-Member-Lifecycle-Intervention-Sequencing、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Referral-Network-Value-Attribution

---

> 分类：业务运营/品牌与增长/联盟运营　·　技术族：06-增长模型　·　源卡：`Skill-Referral-Network-Value-Attribution`