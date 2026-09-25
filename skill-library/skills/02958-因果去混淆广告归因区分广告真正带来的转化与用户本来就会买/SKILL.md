---
name: "p2s-counterfactual-ad-attribution-debiasing"
title: "Counterfactual Ad Attribution Debiasing — 因果去混淆广告归因区分\"广告真正带来的转化\"与\"用户本来就会买"
description: "触发词：广告归因去偏、真实ROAS、iROAS、因果去混淆、预算重分配。何时不用：能停投或按地区做增量实验时优先做实验（Geo Holdout），本技能用于已有归因报表、无法停投的观察数据。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Counterfactual-Ad-Attribution-Debiasing"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把平台报表里虚高的 ROAS 还原成广告真正带来的增量，别再继续把预算花在本来就会买的用户身上。"
user_try: "试试：广告报表 ROAS 是 4.2x，但停投三天订单只降 15%，帮我估算真实 iROAS 并给出预算调整建议。"
whenToUse: "当平台归因 ROAS 与自然量、停投观测明显不符，需要用观察数据判断广告真实增量并重排预算时用；若要严格测广告 vs 不投的增量且能按地区配对停投，用「Geo Holdout 实验」；若只关心渠道效应的人群异质性，用因果森林类技能。"
workflow: "拉取广告曝光与购买日志，标记曝光/未曝光用户 → 选取与广告展示独立、反映购买意图的代理变量 → 用 iDCF/IPW 估计混淆强度并算出去偏系数 → 把报表 ROAS 折算为真实 iROAS → 按真实 iROAS 重排预算与目标人群"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Counterfactual Ad Attribution Debiasing — 因果去混淆广告归因区分"广告真正带来的转化"与"用户本来就会买

## ① 解决的问题

CFO面临"广告ROAS报告4.2x但暂停广告后订单只降15%、怀疑归因严重高估"——因果去混淆IPW去偏将真实iROAS从虚高4.2x还原为2.73x，按真实ROAS重新分配预算年化节省广告浪费约15-20万元

## ② 核心算法逻辑

所有广告归因模型都面临同一个根本问题：用户本来就会买（无论看不看广告），但平台把这次购买归功于广告——于是广告 ROAS 被高估，预算被误导分配到"锦上添花"而非"雪中送炭"的展示位。

## ③ 业务应用场景

业务问题：Amazon 婴儿奶粉广告，报告 ROAS = 4.2x，但运营发现暂停广告 3 天后，订单量只下降了 15%（预期应该下降更多）。怀疑大量"有机购买"被归因到广告。
去偏分析： 1. 代理变量：用户最近 7 天自然搜索次数（高搜索 = 高购买意图，与广告展示独立） 2. 用 iDCF 估算混淆强度：高搜索用户看到广告后购买率 = 82%，低搜索用户 = 38% 3. 去偏系数估算：真实广告增量贡献约 $\alpha = 0.65$（65% 是广告真正带来的） 4. 真实 iROAS = 4.2 × 0.65 = 2.73x（而非报告的 4.2x）
业务决策： - 重新评估 Amazon 广告预算（按 2.73x iROAS 而非 4.2x 调整） - 将"高购买意图用户"的广告预算转移到"低意图用户"（增量效果更大的人群） - 核准后的月度预算从 $8,000 降至 $6,000，但真实增量 GMV 不变

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：广告 ROAS 被高估 30-50%，按去偏后的真实 iROAS 重新分配 $10 万/月预算，年化可节省广告浪费约 $15-20 万（将高意图用户的广告预算转移到低意图高增量用户）
实施难度：⭐⭐⭐☆☆（倾向得分 IPW 约 2 周实现；完整 DCRMTA 深度学习方案约 6-8 周）
优先级：⭐⭐⭐⭐⭐（归因是广告预算分配的核心依据，错误归因导致系统性预算浪费，修复此问题 ROI 极高）
评估依据：DCRMTA 在真实广告数据集上去偏后 AUC 比 baseline 高 2-3%；iDCF 在多个推荐系统数据集上验证可识别潜在混淆变量；实际广告实验中朴素 MTA 高估 ROAS 的比例通常在 25-45%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（211 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Counterfactual Ad Attribution Debiasing
因果去混淆广告归因——代理变量法去偏 + 增量ROAS估算

依赖：numpy, pandas, scikit-learn
实现：iDCF简化版——代理变量估计混淆 + 倒数概率加权去偏
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from typing import Dict, Tuple
import warnings
warnings.filterwarnings('ignore')


# ─────────────────────────────────────────────
# 1. 模拟广告曝光 + 购买数据（含混淆）
# ─────────────────────────────────────────────

def generate_ad_attribution_data(n_users: int = 5000) -> pd.DataFrame:
    """
    生成含混淆偏差的广告归因数据

    混淆变量：用户购买意图强度（不可直接观测）
    代理变量：历史搜索次数（可观测，与意图相关）
    """
    np.random.seed(42)

    # 潜在混淆变量：购买意图强度（不可直接观测）
    purchase_intent = np.random.beta(2, 5, n_users)  # 大部分用户意图较低

    # 可观测代理变量：历史7天搜索次数（与意图正相关）
    search_count = np.random.poisson(purchase_intent * 8)  # 意图越强，搜索越多
    # 代理变量2：页面停留时长（秒）
    dwell_time = np.random.exponential(purchase_intent * 120 + 30)

    # 广告展示概率（受混淆影响：高意图用户更可能被算法推送广告）
    ad_prob = 0.3 + 0.4 * purchase_intent  # 混淆！意图强的用户更可能看到广告
    ad_shown = np.random.binomial(1, ad_prob)

    # 购买概率（受广告 + 意图双重影响）
    # 真实因果效应：广告增加购买概率 0.15（增量效果）
    ad_causal_effect = 0.15
    purchase_prob = (0.1 + 0.6 * purchase_intent +  # 意图的直接影响
                     ad_causal_effect * ad_shown)    # 广告的真实增量效应
    purchase_prob = np.clip(purchase_prob, 0, 1)
    purchased = np.random.binomial(1, purchase_prob)

    # 订单金额
    order_value = np.where(purchased, np.random.lognormal(4.2, 0.5, n_users), 0)

    return pd.DataFrame({
        'user_id': [f'U{i:04d}' for i in range(n_users)],
        'purchase_intent': purchase_intent,   # 真实混淆（不可观测）
        'search_count_7d': search_count,       # 代理变量（可观测）
        'dwell_time_sec': dwell_time.round(1),  # 代理变量（可观测）
        'ad_shown': ad_shown,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2302.05052 — Debiasing Recommendation by Learning Identifiable Latent Confounders
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户级广告曝光与购买日志（含是否曝光的处理标识与购买、订单金额结果），以及至少一个与广告展示独立、可反映购买意图的代理变量（如最近 7 天自然搜索次数、页面停留时长）；混淆变量本身不可观测。

**输出**：去偏后的真实 iROAS 与去偏系数、高意图与低意图人群的增量差异，以及按真实增量重排预算的建议（卡页示例：报表 4.2x、去偏系数 0.65、真实 iROAS 2.73x，月度预算从 8000 美元降至 6000 美元）。

## 执行步骤

1. 拉取广告曝光与购买日志并标记曝光/未曝光用户
2. 选取与广告展示独立的代理变量（如近 7 天自然搜索次数、停留时长）
3. 用 iDCF/IPW 估计混淆强度并计算去偏系数
4. 折算平台报表 ROAS 为真实 iROAS
5. 按真实 iROAS 与人群增量差异重排预算

## 边界与不做

- 何时不用：平台报表与自然量观测一致，或已能直接做停投/Geo 实验时，不必做去偏。
- 能力边界：去偏结论建立在代理变量有效、混淆强度可识别的前提上，代理变量选错仍会偏；本技能只做估计与建议，不执行投放或预算动作。
- 卡页数字（4.2x 还原为 2.73x、月预算 8000 降至 6000 美元、年化省 15-20 万美元）为示例场景，不可当作通用提升幅度。

## 技能关联

- **前置**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-FrontDoor-Causal-MTA.html、Skill-FrontDoor-Causal-MTA、Skill-PIE-Experimental-MTA.html、Skill-PIE-Experimental-MTA
- **延伸**：Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution、Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-PIE-Experimental-MTA.html、Skill-PIE-Experimental-MTA
- **可组合**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Cross-Channel-Budget-Pacing-Controller.html、Skill-Cross-Channel-Budget-Pacing-Controller、Skill-Counterfactual-Ad-Attribution-Debiasing

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Counterfactual-Ad-Attribution-Debiasing`