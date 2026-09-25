---
name: "p2s-cda-cookieless-attribution"
title: "CDA（Causal-Driven Attribution）— 无用户级数据的因果驱动归因"
description: "触发词：无 Cookie 归因、因果驱动归因、大盘数据归因、滞后效应、渠道权重、跨端断链。何时不用：能拿到用户级触点序列时优先用多触点归因；数据不足半年或渠道投放高度同步时无法识别因果方向。安全边界：只需渠道级大盘数据、不涉及用户级隐私，数据导出需遵循各平台条款，不尝试还原个人身份。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-CDA-Cookieless-Attribution"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "跨端追踪断链后，用每日大盘数据反推渠道真实贡献，避免误砍上漏斗渠道。"
user_try: "试试：iOS 断链后 Facebook 显示零转化，帮我用大盘数据判断它的真实贡献。"
whenToUse: "无法获得用户级旅程（Cookie 或 ATT 断链）但有大盘日数据时用本技能；有用户级触点时用多触点归因；要判断增量而非贡献拆分时用增量实验。"
workflow: "整理渠道级每日大盘数据并对齐日期 → 拟合因果驱动归因管道并识别滞后阶数 → 生成因果图谱与渠道助攻关系 → 输出渠道归因权重并与末次点击对照 → 给出预算调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CDA（Causal-Driven Attribution）— 无用户级数据的因果驱动归因

## ① 解决的问题

业务问题：出海独立站在欧美市场同时投放 Facebook 视频广告（漏斗上层）和 Google 搜索广告（漏斗下层）

## ② 核心算法逻辑

核心思想：仅用聚合级别的每日广告曝光量与总订单数，无需任何 User ID 或 Cookie 追踪数据，通过时序因果图谱量化各渠道对转化的真实贡献比例。

## ③ 业务应用场景

业务问题：出海独立站在欧美市场同时投放 Facebook 视频广告（漏斗上层）和 Google 搜索广告（漏斗下层）。由于苹果 iOS ATT 政策，用户从 Facebook 看到广告到 Google 搜索购买的路径追踪中断，运营团队只能看到 Last-Click 数据显示 Google ROI 极高、Facebook ROI 极差，存在砍掉 Facebook 预算的风险。
数据要求： - 过去 180 天以上的每日大盘数据（无需用户维度） - 字段：`日期 | FB每日曝光量 | TikTok每日播放量 | Google每日点击量 | Shopify每日总订单` - 数据源：FB Ads Manager 导出 + Google Ads 报告 + Shopify 后台
预期产出： - 因果图谱：`FB曝光(t-2) → Google搜索(t) → 订单(t)`，量化滞后天数和相关强度 - 渠道归因权重：Facebook 实际贡献 ~18%，Last-Click 0%，Google 真实贡献 ~72%（非 100%） - 预算调整建议：在维持 Google 预算的前提下，按 CDA 权重重新分配 Facebook/TikTok 预算

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（37 行）。**下面 37 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **37 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，37 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/cda_cookieless_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-CDA-Cookieless-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import simulate_ad_data, CDAAttributionPipeline

# 1. 准备数据（或加载真实数据）
df = simulate_ad_data(n_days=180, seed=42)
# df = pd.read_csv("daily_ad_data.csv")  # 真实数据替换

# 2. 拟合 CDA 归因管道
pipeline = CDAAttributionPipeline(
    channels=['facebook', 'tiktok', 'google'],
    target='orders',
    max_lag=5,
    alpha=0.05,
)
pipeline.fit(df)

# 3. 查看因果图谱
causal_df = pipeline.causal_summary()
print(causal_df)
# 输出示例:
#   source   target  lag_days  correlation
#   google   orders         0       0.9831
# facebook   orders         3       0.4351
# facebook   google         2       0.2100  ← FB助攻效应

# 4. 归因权重报告
report = pipeline.attribution_report()
print(report)
# channel  attribution_weight  attribution_pct
#  google              0.7159           71.6%
# facebook             0.1803           18.0%   ← Last-Click: 0%!
#  tiktok              0.1038           10.4%

# 5. 预算调整建议
current_budget = {'facebook': 3000, 'tiktok': 2000, 'google': 10000}
rec = pipeline.budget_recommendation(current_budget, total_budget=15000)
print(rec)
print("[✓] CDA Cookieless Attributio 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.21211 — Causal-driven attribution (CDA): Estimating channel influence without user-level data
⚠️ 该号被 4 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去 180 天以上的每日大盘数据：各渠道每日曝光、播放或点击量，以及每日总订单量；数据来自各广告后台导出与独立站后台，无需用户维度。

**输出**：含滞后天数与相关强度的因果图谱、各渠道归因权重、预算调整建议；供运营在无用户级数据时仍能做出渠道取舍。

## 执行步骤

1. 整理渠道级每日大盘数据并对齐日期
2. 拟合因果驱动归因管道并识别滞后阶数
3. 生成因果图谱与渠道间助攻关系
4. 输出渠道归因权重并与末次点击对照
5. 给出预算调整建议

## 边界与不做

- 何时不用：能拿到用户级触点序列时优先用多触点归因，本技能只能给出渠道级结论。
- 能力边界：本技能产出渠道权重与建议，不做投放执行，也不替代实验验证。
- 数据边界：样本不足半年，或各渠道投放高度同步缺少时序差异时，因果方向无法识别，结论不可用。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization
- **延伸**：Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-HGNN-Cross-Device-Matching.html、Skill-HGNN-Cross-Device-Matching、Skill-Identity-Fragmentation-Debiasing.html、Skill-Identity-Fragmentation-Debiasing、Skill-PIE-Experimental-MTA.html、Skill-PIE-Experimental-MTA、Skill-TESLA-NetCVR-Cascade.html、Skill-TESLA-NetCVR-Cascade、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-CDA-Cookieless-Attribution

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-CDA-Cookieless-Attribution`