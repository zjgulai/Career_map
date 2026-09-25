---
name: "p2s-tag-ab-experiment-design"
title: "标签-AB实验设计 — 基于用户标签的精准实验分层与分析"
description: "触发词：标签分层、分层分析、选择偏差、活跃度标签、人群分层、效果修正。何时不用：没有可用标签或标签口径不稳定时先补标签体系；分组已均衡且只关心整体效果时用常规 A/B。安全边界：标签应基于行为而非敏感个人信息并满足匿名化要求，精准营销需保证用户可退订，对高效果人群设置频次上限。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 分群"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Tag-AB-Experiment-Design"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户标签分布不均会让实验效果虚高，分层分析能把真实效果和最佳人群一起找出来。"
user_try: "试试：我的新会员礼包实验怀疑被高活跃标签带偏了，帮我做分层分析。"
whenToUse: "实验分组中高活跃或高价值人群分布不均、怀疑效果被抬高时用分层实验；无标签数据时先补标签体系；只关心整体效果且分组均衡时用常规 A/B。"
workflow: "接入用户标签与实验分组数据 → 先算简单 ATE 并检查标签分布是否失衡 → 按标签分层重新估计处理效应 → 识别效果最强的标签人群 → 给出分层投放与频次上限建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 标签-AB实验设计 — 基于用户标签的精准实验分层与分析

## ① 解决的问题

运营面临"AB实验因高活跃标签用户分布不均导致效果高估7pp造成浪费"——标签分层消除选择偏差并发现新生儿段效果达+20%精准投放，年化节省+增量约70万元

## ② 核心算法逻辑

标签与AB实验的结合痛点：

## ③ 业务应用场景

场景A：新会员权益的分层精准实验 - 业务问题："新会员专属礼包"的AB测试，因为"高活跃标签"用户本来就购买多，随机分组后处理组碰巧多了高活跃用户，导致效果虚高，错误决定全量发放 - 数据要求：用户行为标签（活跃度/月龄段/消费等级）+ 实验分组设计 - 预期产出：分层后控制了高活跃偏差，实际效果从+18%修正为+11%；同时发现"新用户+0-3月龄"标签组效果达+28%，是最佳投放人群 - 业务价值：避免全量发放导致的成本浪费约20万元；聚焦高效果标签组，同样预算获得更高LTV增量
**三轨验证**： - **成本**：显性成本约3-5万元（标签系统数据采集与清洗2万元，实验平台分层分配功能开发1-2万元，分析师人力0.5-1万元/次实验） - **合规**：低风险。标签基于用户行为而非敏感个人信息（如种族/健康），符合GDPR匿名化要求；Amazon政策允许基于行为的精准营销，但需确保用户可退订 - **风险**：中等风险。若"0-3月龄"标签组效果被过度解读，可能过度投放导致用户疲劳或反感；需设置频次上限和负面反馈监控

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：消除标签选择偏差（估计误差从+7%→+0.2%），避免全量推送低效权益节省约20万元/次；发现高效果标签人群后精准投放，相同预算产生更高LTV增量约50万元
实施难度：⭐⭐☆☆☆（分层逻辑约30行代码；主要挑战在标签质量和实验基础设施支持分层分配）
优先级：⭐⭐⭐⭐⭐（修复24-标签↔02-AB完全空白断层；标签 + 实验是精准运营的核心组合）
评估依据：KDD 2013/2020微软实验平台论文是行业标准；Booking.com/Netflix公开了分层实验的工程实践；CUPED+标签协变量在多家公司验证可减少方差30-50%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（108 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Tag-AB-Experiment-Design
标签分层AB实验设计与分析

依赖：pip install numpy pandas scipy scikit-learn
"""

import numpy as np
import pandas as pd
from scipy import stats

np.random.seed(42)

# ── 1. 生成含用户标签的实验数据 ──────────────────────────────────────
n = 10000
# 用户标签（混淆变量）
tag_high_active = np.random.binomial(1, 0.25, n)  # 25%高活跃用户
tag_new_baby    = np.random.binomial(1, 0.20, n)   # 20%宝宝0-3月
tag_high_value  = np.random.binomial(1, 0.15, n)   # 15%高价值用户

# 简单随机分组（有偏）
random_treatment = np.random.binomial(1, 0.5, n)

# 真实处理效应（不同标签组效果不同）
true_effects = {
    'high_active':      0.05,
    'new_baby':         0.20,
    'high_value':       0.08,
    'normal':           0.03,
}

def get_treatment_effect(high_active, new_baby, high_value):
    if new_baby:   return true_effects['new_baby']
    if high_active: return true_effects['high_active']
    if high_value:  return true_effects['high_value']
    return true_effects['normal']

true_te = np.array([get_treatment_effect(tag_high_active[i], tag_new_baby[i], tag_high_value[i])
                     for i in range(n)])
base_conversion = 0.12 + 0.08 * tag_high_active + 0.10 * tag_new_baby
Y = np.random.binomial(1, np.clip(base_conversion + true_te * random_treatment, 0.01, 0.99))

df = pd.DataFrame({'treatment': random_treatment, 'Y': Y,
                   'tag_high_active': tag_high_active,
                   'tag_new_baby': tag_new_baby,
                   'tag_high_value': tag_high_value})

# ── 2. 简单ATE（有标签选择偏差）──────────────────────────────────────
naive_ate = df[df['treatment']==1]['Y'].mean() - df[df['treatment']==0]['Y'].mean()

# ── 3. 分层随机化（在每层内随机分组）────────────────────────────────────
def stratified_ate(df, strata_cols):
    """分层ATE：在每个层内计算ATE，加权平均"""
    df_s = df.copy()
    strata_key = df_s[strata_cols].astype(str).agg('_'.join, axis=1)
    df_s['stratum'] = strata_key

    strata_ates = []
    strata_weights = []
    for stratum, sdf in df_s.groupby('stratum'):
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：用户行为标签（活跃度、月龄段、消费等级等）与实验分组、结果指标的用户级明细；标签需可追溯到行为口径，并说明实验平台是否支持分层分配。

**输出**：简单 ATE 与分层后 ATE 的对比、各标签组的效应与最佳投放人群、分层投放建议；供运营修正效果判断并把预算投向高效果人群。

## 执行步骤

1. 接入用户标签与实验分组数据
2. 先算简单 ATE 并检查标签分布是否失衡
3. 按标签分层重新估计处理效应
4. 识别效果最强的标签人群
5. 给出分层投放与频次上限建议

## 边界与不做

- 何时不用：标签缺失或口径不稳定时不要做分层分析，先补标签体系，否则修正常常比偏差更大。
- 能力边界：本技能产出修正后的效应与人群建议，不做投放执行和人群圈选。
- 风险边界：对小样本标签组的效果不宜过度解读，需设置频次上限与负面反馈监控以避免用户疲劳。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff、Skill-Tag-Causal-Treatment-Effect.html、Skill-Tag-Causal-Treatment-Effect、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **延伸**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Heterogeneous-Treatment-Effect-XLearner.html、Skill-Heterogeneous-Treatment-Effect-XLearner、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **可组合**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction、Skill-Multi-Metric-Experiment-Tradeoff.html、Skill-Multi-Metric-Experiment-Tradeoff、Skill-Tag-Driven-Ad-Audience-Segmentation.html、Skill-Tag-Driven-Ad-Audience-Segmentation、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection、Skill-Tag-AB-Experiment-Design

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：24-标签工程　·　源卡：`Skill-Tag-AB-Experiment-Design`