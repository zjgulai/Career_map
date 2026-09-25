---
name: "p2s-identity-fragmentation-debiasing"
title: "Identity Fragmentation Debiasing（身份碎片化纠偏）"
description: "触发词：身份碎片化、跨端断链、分层聚合、Cohort 纠偏、渠道被低估、曝光购买对应。何时不用：完全没有任何用户或 cohort 关联字段时无法纠偏；要判断渠道的增量效果时用实验方法。安全边界：用户标识需哈希处理，cohort 层聚合不得输出个体明细，数据使用须在隐私政策覆盖范围内。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Identity-Fragmentation-Debiasing"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用户在手机看广告、电脑下单导致渠道被低估时，用分层聚合把真实效果算回来。"
user_try: "试试：Instagram 报表显示转化接近零，帮我用分层聚合纠偏看真实效果。"
whenToUse: "设备级日志把同一用户拆成多个碎片、导致曝光与购买无法对应时用本技能；有完整用户级关联时用常规归因；完全没有关联字段时不适用。"
workflow: "加载并校验设备级曝光与转化日志 → 计算朴素设备级效应，量化低估幅度 → 按 cohort 分层聚合并重建曝光与购买对应 → 输出纠偏后的效应与渠道 ROI → 生成 cohort 级报告与预算结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Identity Fragmentation Debiasing（身份碎片化纠偏）

## ① 解决的问题

业务问题：女装独立站通过 Instagram（手机端）大量投放信息流广告

## ② 核心算法逻辑

核心思想：用户在多设备间切换（手机看广告、电脑下单）导致底层 Cookie/IDFA 无法跨端串联，同一真实用户被拆分为多个"碎片化身份"。这使得广告平台看到的 ROAS 严重失真——有的记录"只有曝光没有购买"，有的记录"只有购买没有广告"。算法通过 Stratified Aggregation（分层聚合） 在 Cohort 层面重建真实曝光与购买的对应关系，无需跨设备图谱，还原因果 ROI。

## ③ 业务应用场景

业务问题：女装独立站通过 Instagram（手机端）大量投放信息流广告。后台报表显示广告 CVR 极低（曝光了但转化接近 0），财务部门准备砍掉 Instagram 预算。真实情况是：高活跃用户在手机看到广告后，习惯切换到电脑上完成购买——这部分转化在设备级日志中被完全"断链"，无法归因到 Instagram。
数据要求： - 字段：`user_id（或邮箱哈希/手机号哈希）| device_id | cohort（地区+时段） | exposed | converted` - 数据源：Instagram Ads API（曝光数据）+ Shopify 后台（订单数据，含 UTM 来源） - 如无 user\_id 关联能力，则退化为 Cohort 层面的聚合统计（不需要用户级关联）
预期产出： - 朴素设备级 ATE：≈ 0.016（严重低估） - Stratified Aggregation 纠偏后 ATE：≈ 0.055-0.065（接近真实效果） - 纠偏后 ROI 从 0.28 提升至 0.80+，揭示 Instagram 渠道被严重低估

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：8%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（39 行）。**下面 39 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **39 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，39 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/identity_fragmentation_debiasing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Identity-Fragmentation-Debiasing.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import (
    simulate_cross_device_logs,
    naive_roi_estimate,
    StratifiedAggregationDebiaser,
    bias_decomposition_report,
)

# 1. 加载数据（或使用模拟数据）
df = simulate_cross_device_logs(
    n_true_users=3000,
    fragmentation_rate=0.40,  # 40% 用户跨设备碎片化
    ad_lift=0.06,              # 真实广告提升效果 6pp（仅模拟用）
    seed=2024,
)
# df = pd.read_csv("cross_device_log.csv")  # 真实数据替换

# 2. 朴素估计（展示有偏结果）
naive = naive_roi_estimate(df, ad_spend=10000.0)
print(f"朴素 ATE: {naive['naive_lift']:.4f}  朴素 ROI: {naive['naive_roi']:.3f}")
# 朴素 ATE: 0.0164   朴素 ROI: 0.279  ← 严重低估（碎片化失真）

# 3. Stratified Aggregation 纠偏
debiaser = StratifiedAggregationDebiaser(cohort_col="cohort", min_cohort_size=20)
debiaser.fit(df)  # 关键：内部自动按 user_id 聚合，恢复真实曝光/购买状态
corrected = debiaser.corrected_roi(ad_spend=10000.0, revenue_per_conversion=50.0)
print(f"纠偏 ATE: {corrected['corrected_ate']:.4f}  纠偏 ROI: {corrected['corrected_roi']:.3f}")
# 纠偏 ATE: 0.0548   纠偏 ROI: 0.821  ← 接近真实效果

# 4. Cohort 级别报告
cohort_df = debiaser.cohort_report()
print(cohort_df)
# cohort  n_users  n_exposed  n_control  cvr_exposed  cvr_control    ate  ci_lower  ci_upper
# C05      629        355        274        0.2901       0.1460   0.1442    0.0811    0.2072
# ...

# 5. 对比汇总
bias_df = bias_decomposition_report(naive, corrected, true_lift=0.06)
print(bias_df)
print("[✓] Identity Fragmentation De 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2008.12849 — The Identity Fragmentation Bias

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：设备级日志字段：user_id（或邮箱、手机号哈希）、device_id、cohort（地区加时段）、exposed、converted；数据来自广告平台曝光数据与独立站订单数据，无用户级关联能力时可退化为 cohort 层聚合。

**输出**：朴素设备级效应与分层聚合纠偏后的效应对照、Cohort 级报告、纠偏后的渠道 ROI；供财务与投放团队避免误砍被低估的渠道。

## 执行步骤

1. 加载并校验设备级曝光与转化日志
2. 计算朴素设备级效应并量化低估幅度
3. 按 cohort 分层聚合并重建曝光与购买对应关系
4. 输出纠偏后的效应与渠道 ROI
5. 生成 cohort 级报告与预算结论

## 边界与不做

- 何时不用：没有任何用户或 cohort 关联字段、或碎片化比例极低时纠偏空间有限，用常规归因即可。
- 能力边界：本技能产出纠偏后的效应估计与报告，不做投放执行，也不替代实验验证。
- 合规边界：用户标识需哈希处理，cohort 层聚合不得输出个体明细，数据使用须在隐私政策覆盖范围内。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-GraphTrack-Cross-Device-Tracking.html、Skill-GraphTrack-Cross-Device-Tracking、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-Identity-Fragmentation-Debiasing

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Identity-Fragmentation-Debiasing`