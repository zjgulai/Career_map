---
name: "p2s-loyalty-program-roi-modeling"
title: "Loyalty Program ROI Modeling — 双重差分评估会员积分体系 LTV 增量价值"
description: "触发词：积分体系ROI、会员LTV、双重差分、积分负债、兑换率。何时不用：还能对是否邀请做随机分流时直接做随机实验；本技能用于已自然形成处理/对照组的复盘评估。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 会员活动"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Loyalty-Program-ROI-Modeling"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "算清积分会员体系到底带来多少净增量 LTV、每发 1 个积分实际赚回多少，别让积分负债吃掉利润。"
user_try: "试试：我们准备上线积分体系，帮我用 DiD 估算净增量 LTV 和每积分的实际收益。"
whenToUse: "当积分或会员体系已上线（或即将上线），需要判断复购增长里有多少是真实增量、并评估积分负债时用；若能对是否邀请做随机分流，用实验设计类技能；只评一次促销的净增量，用反事实评估。"
workflow: "划分处理组（已邀请加入积分计划）与特征相似的对照组 → 取计划前 90 天与后 180 天的购买、积分发放与兑换记录 → 用双重差分估计积分体系的净增量 LTV → 计算每发放 1 积分对应的净收入增量并做兑换率敏感性分析 → 按净收益与积分负债结论给出是否上线、汇率与门槛建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Loyalty Program ROI Modeling — 双重差分评估会员积分体系 LTV 增量价值

## ① 解决的问题

CFO面临"积分会员体系成本越来越高但到底有没有提升LTV不清楚"——DiD净增量建模将积分体系ROI精确量化，避免积分负债超过收益的$15万/年损失

## ② 核心算法逻辑

问题：引入会员积分体系（每消费 $1 = 1 积分，100 积分兑换 $5 券）看起来复购率涨了 12%——但这 12% 里有多少是「积分体系真正带来的」，多少是「本来就会复购的用户正好在积分期内买了」？如果搞不清楚，可能花了很多积分成本，真实增量收益却很少甚至为负（积分负债过高）。

## ③ 业务应用场景

场景A：婴儿用品会员积分体系 ROI 精算
- 业务问题：DTC 品牌即将推出积分体系（$1=1分，满 100 分兑 $5 优惠券），预计月发放 150,000 积分。老板问：「这个积分值不值做？每 1 积分我们实际赚了多少？积分负债会不会把利润吃掉？」 - 数据要求： - 处理组：已邀请加入积分计划的用户（1,500 人） - 对照组：类似特征未加入的用户（3,000 人） - 时间跨度：积分计划前 90 天 + 后 180 天的购买记录 - 字段：用户ID、购买日期、金额、积分发放/兑换记录 - 预期产出： - DiD 估计的积分体系净增量 LTV（$） - 每发放 1 积分对应的净收入增量（应 > 0.05 元才值得做） - 积分
场景B：积分汇率敏感性分析（防止负债膨胀）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：3,000 会员场景，DiD 测量净增量 LTV $18/人，总增量收入 $54,000，积分成本 $12,150，运营成本 $5,000，净收益 $36,850，ROI 214%；防止「积分负债失控」的风险价值：若兑换率从 25% 膨胀到 40%，积分成本翻 1.6 倍，提前建模可节省 $7,800/年潜在损失
实施难度：⭐⭐☆☆☆（DiD 统计模型成熟，主要挑战是历史数据质量和处理/对照组的合理划分）
优先级：⭐⭐⭐⭐☆（计划推出或已推出积分体系的品牌必做，未推出者可用于预评估是否值得做）
评估依据：积分体系是母婴 DTC 品牌提升 LTV 的常见手段，但「看起来有效」和「真正有增量」差异巨大；DiD 是 Starbucks、Amazon Prime 等成熟项目评估效果的标准工具；实施门槛（数据要求）中等，但对决策质量提升极大

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（263 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/loyalty_program_roi_modeling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Loyalty-Program-ROI-Modeling.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
双重差分（DiD）评估会员积分体系 ROI + 积分负债建模
依赖: numpy, pandas, scipy（标准库，无需 API key）
"""
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


def generate_loyalty_program_data(
    n_treated: int = 1500,
    n_control: int = 3000,
    true_att: float = 18.0,  # 真实处理效应：积分体系净增量 LTV
    seed: int = 42
) -> pd.DataFrame:
    """
    生成积分体系 DiD 评估数据
    
    处理组：加入积分计划用户
    对照组：未加入积分计划的相似用户
    """
    rng = np.random.default_rng(seed)
    
    records = []
    
    # 处理组
    for uid in range(n_treated):
        # 基础 LTV 水平（加入积分的用户本身就更活跃）
        base_ltv = rng.normal(85, 25)
        
        # 前期（积分前 90 天）LTV
        pre_ltv = max(0, base_ltv + rng.normal(0, 10))
        
        # 后期（积分后 180 天）LTV：自然增长 + 积分效应
        natural_growth = rng.normal(5, 8)
        treatment_effect = rng.normal(true_att, 5)  # ATT ≈ true_att
        post_ltv = max(0, pre_ltv + natural_growth + treatment_effect)
        
        records.append({
            'user_id': f'T{uid:04d}',
            'group': 'treated',
            'pre_period_ltv': round(pre_ltv, 2),
            'post_period_ltv': round(post_ltv, 2),
            'joined_loyalty': 1,
            'points_earned': int(post_ltv * 1.0),      # $1 = 1 积分
            'points_redeemed': int(post_ltv * rng.uniform(0.15, 0.35)),  # 兑换率 15-35%
        })
    
    # 对照组（类似基础特征，但未加入积分）
    for uid in range(n_control):
        base_ltv = rng.normal(80, 28)  # 略低于处理组（选择偏差）
        pre_ltv = max(0, base_ltv + rng.normal(0, 10))
        natural_growth = rng.normal(5, 8)  # 相同自然增长趋势（平行趋势假设）
        post_ltv = max(0, pre_ltv + natural_growth)  # 无处理效应
        
        records.append({
            'user_id': f'C{uid:04d}',
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.09031，但该号在 arXiv 上是《A Comprehensive Graph Pooling Benchmark: Effectiveness, Robustness and Generalizability》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：处理组（已邀请加入积分计划的用户）与对照组（特征相似但未加入的用户）的用户级购买记录；时间跨度为积分计划前 90 天 + 后 180 天；字段含用户ID、购买日期、金额、积分发放与兑换记录；卡页示例规模为处理组 1500 人、对照组 3000 人。

**输出**：双重差分估计的积分体系净增量 LTV、每发放 1 积分对应的净收入增量（卡页判据为每积分净收入应 > 0.05 元才值得做）、积分汇率敏感性分析，供是否上线与门槛设置决策使用（卡页示例：净增量 LTV 18 美元/人、ROI 214%）。

## 执行步骤

1. 划分处理组（已邀请加入积分计划）与特征相似的对照组
2. 取计划前 90 天与后 180 天的购买、积分发放与兑换记录
3. 用双重差分估计积分体系的净增量 LTV
4. 计算每发放 1 积分的净收入增量并做兑换率敏感性分析
5. 按净收益与积分负债结论给出是否上线、汇率与门槛建议

## 边界与不做

- 何时不用：若是否邀请可以随机分流，直接做随机实验比事后匹配更干净；积分记录缺失或时间戳不准时不要用。
- 能力边界：只拆增量收益与积分负债，不设计积分规则与成本结构；结论依赖平行趋势假设与处理组、对照组的特征可比性。
- 卡页数字（净增量 LTV 18 美元/人、总增量收入 54,000 美元、ROI 214%、每积分 > 0.05 元判据、兑换率 25% 膨胀到 40%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine、Skill-Referral-Network-Value-Attribution.html、Skill-Referral-Network-Value-Attribution、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine、Skill-Referral-Network-Value-Attribution.html、Skill-Referral-Network-Value-Attribution、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Referral-Network-Value-Attribution.html、Skill-Referral-Network-Value-Attribution、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-Loyalty-Program-ROI-Modeling

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：06-增长模型　·　源卡：`Skill-Loyalty-Program-ROI-Modeling`