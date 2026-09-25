---
name: "p2s-delayed-conversion-causal-mtl"
title: "促销延迟转化因果多任务建模 — 大促期用户行为的反事实分析"
description: "触发词：延迟转化、AICR、大促增量、反事实多任务、优惠券精准投放。何时不用：只要一场促销的总体净增量用反事实评估（合成控制）；干预前能随机分流测促销则用实验设计类技能。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Delayed-Conversion-Causal-MTL"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "分清大促单量里哪些是本来就会买的，算出真正被促销拉动的那部分，把优惠券发给确实需要刺激的人。"
user_try: "试试：Prime Day 说带来 3000 单增量，帮我用大促前 14 天行为算出每个用户的真实增量购买率 AICR。"
whenToUse: "当大促结束后需要区分真实增量与本来就会买、并要按单用户增量率 AICR 精准发券时用；只要整场促销的一个净增量数字，用「反事实评估（合成控制）」；若要事前验证促销设计，先做实验设计。"
workflow: "收集大促前 14 天用户行为序列（浏览/加购/搜索/停留） → 用历史非促销期数据标定自然转化率 → 对比大促期间实际转化率与自然转化率预测 → 计算用户级促销增量购买率 AICR → 按 AICR 高低筛选优惠券投放对象"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 促销延迟转化因果多任务建模 — 大促期用户行为的反事实分析

## ① 解决的问题

大促结束后财务无法区分"真实增量"和"本来就会买"导致ROI虚高——反事实多任务建模精准测量AICR，优惠券精准投放节省41%预算，年化保护促销预算18-80万元

## ② 核心算法逻辑

大促前的延迟转化有两种本质不同的路径：

## ③ 业务应用场景

业务问题：每次 Prime Day 后，广告团队说"Prime Day 带来了 3,000 单增量"，但 CFO 质疑"其中多少是本来就会买的？"。传统方法：总 Prime Day 销量 - 同期去年销量 = 增量（非常粗糙，忽略自然增长趋势）。
CMTL 处理： 1. 收集 Prime Day 前 14 天用户行为（浏览次数/收藏/加购/停留时长） 2. 训练 Counterfactual 模型：用历史非大促期数据标定 $P(Y=1|X,T=0)$ 3. 对比 Prime Day 期间实际转化率与模型预测的"自然转化率" 4. AICR = 促销增量购买率
数据要求： - 用户前14天行为序列（每日浏览次数、加购次数、搜索词、页面停留时长） - 历史非促销期（普通周）的购买记录（用于训练反事实模型） - Prime Day 期间的购买记录（实际 $Y$）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
优惠券精准投放节省：30% 预算 = 月均 $5,000 优惠券支出节省 $1,500/月 = $18,000/年
更准确的促销 ROI 测量 → 避免在低效促销上追加投入：年化节省 $30,000-80,000（中型卖家）
大卖家（月销 $1M+）：优化促销预算的 15% = $180,000/年
实施难度：⭐⭐⭐☆☆
需要2-3个月历史非促销期数据作为 control 训练集

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/delayed_conversion_causal_mtl` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Delayed-Conversion-Causal-MTL.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CMTL - 促销延迟转化因果多任务建模
估算每个用户的真实促销增量转化率 (AICR)

依赖: numpy, scikit-learn
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple

# ─────────────────────────────────────────────
# 特征工程：大促前行为序列
# ─────────────────────────────────────────────

def extract_pre_promo_features(behavior_logs: List[dict]) -> np.ndarray:
    """
    从大促前14天行为日志提取特征
    
    behavior_logs 格式：
    [{'user_id': str, 'days_before_promo': int(1-14),
      'page_views': int, 'add_to_cart': int, 'searches': int,
      'session_duration_min': float, 'wishlist_add': int}]
    
    返回：每用户的特征矩阵 shape=(n_users, n_features)
    """
    from collections import defaultdict
    user_data = defaultdict(lambda: {
        'total_pv': 0, 'total_atc': 0, 'total_search': 0,
        'total_duration': 0, 'total_wishlist': 0,
        'active_days': 0, 'recent_3d_pv': 0
    })
    
    for log in behavior_logs:
        uid = log['user_id']
        d = log['days_before_promo']
        user_data[uid]['total_pv'] += log.get('page_views', 0)
        user_data[uid]['total_atc'] += log.get('add_to_cart', 0)
        user_data[uid]['total_search'] += log.get('searches', 0)
        user_data[uid]['total_duration'] += log.get('session_duration_min', 0)
        user_data[uid]['total_wishlist'] += log.get('wishlist_add', 0)
        user_data[uid]['active_days'] += 1
        if d <= 3:
            user_data[uid]['recent_3d_pv'] += log.get('page_views', 0)
    
    uids = list(user_data.keys())
    X = np.array([
        [
            user_data[u]['total_pv'],
            user_data[u]['total_atc'],
            user_data[u]['total_search'],
            user_data[u]['total_duration'],
            user_data[u]['total_wishlist'],
            user_data[u]['active_days'],
            user_data[u]['recent_3d_pv'] / max(user_data[u]['total_pv'], 1),
        ]
        for u in uids
    ])
    return uids, X
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2604.21675。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户大促前 14 天行为序列（每日浏览次数、加购次数、搜索词、页面停留时长等，代码模板聚合为总浏览、加购、搜索、停留、收藏、活跃天数与近 3 日浏览占比）+ 历史非促销期（普通周）购买记录用于标定反事实 + 大促期间实际购买记录。

**输出**：每个用户的自然转化率预测与促销增量购买率 AICR，以及按增量高低排序的优惠券投放名单（卡页示例：按增量投放节省约 30% 优惠券预算，月均 5000 美元支出节省 1500 美元/月）。

## 执行步骤

1. 收集大促前 14 天用户行为序列并聚合为特征
2. 用历史非促销期数据标定自然转化率模型
3. 对比大促期间实际转化率与自然转化率预测
4. 计算每个用户的促销增量购买率 AICR
5. 按 AICR 高低筛选优惠券投放对象

## 边界与不做

- 何时不用：没有 2-3 个月历史非促销期数据作为对照、或大促前行为埋点缺失时，不要用本技能。
- 能力边界：只输出增量概率与投放名单，不执行发券；模型假设非促销期与促销期用户行为分布可比，跨期结构变化会引入偏差。
- 卡页数字（优惠券省 30% 预算、年化 1.8 万至 8 万美元、月销百万级卖家 18 万美元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Uplift-Churn-Prediction.html、Skill-Uplift-Churn-Prediction
- **延伸**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Conformal-TS-Intervals.html、Skill-Conformal-TS-Intervals、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-ML-AB-Randomization-Test.html、Skill-ML-AB-Randomization-Test、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Delayed-Conversion-Causal-MTL

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：02-A_B实验　·　源卡：`Skill-Delayed-Conversion-Causal-MTL`