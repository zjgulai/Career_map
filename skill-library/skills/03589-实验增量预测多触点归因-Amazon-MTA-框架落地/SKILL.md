---
name: "p2s-pie-experimental-mta"
title: "PIE 实验增量预测多触点归因 - Amazon MTA 框架落地"
description: "触发词：实验归因、RCT锚点、多触点归因、触点下钻、归因校准。何时不用：只要渠道总盘增量、不做触点下钻时直接用Geo实验结论即可。安全边界：遵循Amazon Sponsored Ads政策，数据仅在指定区域存储、不涉个人数据，投放建议不得含虚假声称。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-PIE-Experimental-MTA"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用实验得到的总盘增量当锚点去校准多触点归因，让触点级的细颗粒结论和实验真值对得上账。"
user_try: "试试：Google、Facebook、TikTok 三渠道预算怎么分？帮我用 RCT 锚点校准多触点归因再给分配建议。"
whenToUse: "当既有渠道级实验锚点、又有触点级用户旅程数据，需要兼顾宏观真实性并下钻到触点、避免触点贡献被系统性高估时用；只要渠道总盘增量时直接做 Geo Holdout；只要单条内容归因时用内容归因类技能。"
workflow: "每季度为每个渠道跑一次 Geo-holdout 实验，取得渠道增量锚点 → 整理用户旅程触点数据，并把缺失渠道标记映射为未知 → 训练触点级归因模型（Shapley 或注意力类方法） → 用 RCT 增量做校准，把各渠道总量强制对齐实验结论 → 输出渠道预算分配建议与触点级归因报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PIE 实验增量预测多触点归因 - Amazon MTA 框架落地

## ① 解决的问题

Momcozy / Graco 等大牌同投 Google Search + Facebook DPA + TikTok Shop

## ② 核心算法逻辑

广告归因的根本悖论：精度 vs 可信度。纯 RCT 实验（停投对照）可以给出无偏的渠道因果增量，但只能看总盘，无法下钻到每一条 Campaign 甚至每一次点击；纯 ML 多触点归因（Shapley / Attention）能细化到触点级别，但平台总是把广告优先投给"本来就要买"的高意图用户，模型捡到的全是"选择偏差"，转化贡献被系统性高估。

## ③ 业务应用场景

- 业务问题：Momcozy / Graco 等大牌同投 Google Search + Facebook DPA + TikTok Shop。投手根据 Last-Click 数据削减 Facebook/TikTok 预算，老板看不到真实因果增量，高管层（要 RCT）与执行层（要触点）两套数据永远对不上账，每季度预算分配争论消耗 3-5 天。 - 数据要求： - RCT 数据：三渠道分别跑 4 周 Geo-holdout（2500+ 实验单元/渠道） - 触点数据：用户旅程记录（journey_id、channel、timestamp、converted），日均 5000+ 条转化路径 - 预
- 业务问题：Apple ATT 导致 Facebook 归因窗口数据缺失率 60%+，ML 模型在数据断点处随机输出，归因报告失真度高达 40%，导致 Facebook 预算被错误削减 30%，实际 ROAS 反而下降。 - 数据要求： - RCT "总盘"锚点：即使触点数据残缺，RCT 仍能给出渠道增量真实值（宏观约束） - 残缺触点数据：允许 journey 内某些触点无 channel 标记（映射到 `unknown`） - 预期产出： - 即使 ML 因数据断点产生偏差，PIE 校准会将所有渠道的总量强制对齐 RCT 增量，防止灾难性偏离 - 输出"ATT 容忍归因报告"：各渠道 P
三轨验证 | 成本轨：API调用月均450元（Claude API广告数据分析），人工校验12小时/月（成本约1200元），总月成本约1650元，年成本约19800元 | 合规轨：符合Amazon Sponsored Ads政策，数据仅在AWS美国区域存储，不涉及GDPR个人数据，广告投放建议不含虚假声称 | 风险轨：模型对季节性变化敏感度18%，建议每月重新训练；ROAS预测偏差±8%，需人工复核关键决策；竞品价格波动可能导致推荐失效，建议周更新竞品库

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

中型品牌月广告费 200 万 × ROAS 提升 10-15%（归因偏差修正）= 20-30 万/月 × 12 = 240-360 万/年
决策时间从 3-5 天 → 0.5 天，运营人力节省约 20 万/年
避免 Facebook 被错误削减 30% 导致的 ROAS 损失 = 100-200 万/年
易处：PIE 框架逻辑清晰，校准公式简洁，本 Skill 提供完整可运行代码
易处：RCT 实验设计（Geo-holdout）母婴品牌通常已有实践经验
难处：需要整合三平台触点日志（ETL 工程量），大品牌可能涉及数据合规与隐私

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（53 行）。**下面 53 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **53 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，53 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/pie_experimental_mta` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-PIE-Experimental-MTA.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
PIE MTA 三步校准 - 最小可运行示例
依赖: numpy, pandas, scipy
"""
from paper2skills_code.advertising.amazon_mta_pie_2025.model import (
    PIEAttributionPipeline,
    simulate_rct_experiment,
    TouchpointMLEstimator,
    PIECalibrator,
)

CHANNELS = ['google_search', 'facebook', 'tiktok']

# ---- Step 1: 每季度跑一次 RCT 实验 ----
rct_results = simulate_rct_experiment(
    channels=CHANNELS,
    n_treated=5000,
    n_control=5000,
    true_incrementality={'google_search': 0.035, 'facebook': 0.018, 'tiktok': 0.012},
    seed=42,
)
# 输出：{'google_search': {'rct_incrementality': 0.037, 'ci_lower': ..., 'ci_upper': ...}, ...}

# ---- Step 2: ML 对每日触点路径打分 ----
estimator = TouchpointMLEstimator(channels=CHANNELS, seed=42)
touchpoint_df = estimator.generate_touchpoint_data(n_journeys=10000)
scored_df = estimator.fit_predict(touchpoint_df)
# scored_df 新增列：ml_prob（无偏）、ml_prob_biased（有偏，待校准）

# ---- Step 3: PIE 校准 ----
calibrator = PIECalibrator()
report = calibrator.calibrate(scored_df, rct_results, CHANNELS)
print(report[['channel', 'ml_share_biased', 'rct_share', 'pie_share', 'scaling_factor']])
# channel         ml_share_biased  rct_share  pie_share  scaling_factor
# google_search          0.4138     0.5918     0.5918          1.4300
# facebook               0.3444     0.2722     0.2722          0.7901
# tiktok                 0.2417     0.1361     0.1361          0.5630

# ---- 预算建议 ----
current_budget = {'google_search': 10000, 'facebook': 3000, 'tiktok': 2000}
rec = calibrator.budget_recommendation(current_budget, total_budget=15000)
print(rec[['channel', 'current_budget', 'pie_weight', 'recommended_budget', 'action']])
# channel         current_budget  pie_weight  recommended_budget  action
# google_search            10000      0.5917              8876.0      削减
# facebook                  3000      0.2722              4083.0      增加
# tiktok                    2000      0.1361              2041.0      持平

# ---- 一行快速调用（Pipeline 封装） ----
pipeline = PIEAttributionPipeline(channels=CHANNELS, n_journeys=10000, seed=42)
pipeline.run_rct_experiment()
pipeline.score_touchpoints()
final_report = pipeline.calibrate()
print("[✓] PIE Experimental MTA 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2508.08209 — Amazon Ads Multi-Touch Attribution
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：RCT 数据：三渠道分别跑 4 周 Geo-holdout（卡页示例 2500+ 实验单元/渠道）；触点数据：用户旅程记录（journey_id、channel、timestamp、converted），日均 5000+ 条转化路径；允许部分触点缺失渠道标记（映射为 unknown）。

**输出**：经 RCT 增量校准后的渠道级归因报告与触点级归因明细（代码模板示例输出各渠道削减、增加、持平的分配建议），以及即使触点数据残缺也会把各渠道总量强制对齐实验的容忍归因报告。

## 执行步骤

1. 每季度为每个渠道跑一次 Geo-holdout 实验，取得渠道增量锚点
2. 整理用户旅程触点数据并把缺失渠道标记映射为未知
3. 训练触点级归因模型（Shapley 或注意力类方法）
4. 用 RCT 增量做校准，把所有渠道总量强制对齐实验结论
5. 输出渠道预算分配建议与触点级归因报告

## 边界与不做

- 何时不用：只需要渠道级总盘增量、不做触点下钻时，直接用 Geo 实验结论即可；没有可用的实验锚点时，本技能的校准机制失效。
- 能力边界：校准只保证渠道总量对齐实验，触点内部权重仍是模型估计；模型对季节性敏感需按月重训，ROAS 预测存在偏差需人工复核。
- 合规边界：遵循 Amazon Sponsored Ads 政策，数据仅在指定区域存储、不涉及 GDPR 个人数据，投放建议不得含虚假声称。
- 卡页数字（月广告费 200 万、ROAS 提升 10-15%、年化 240-360 万元、ROAS 预测偏差 ±8%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CDA-Cookieless-Attribution.html、Skill-CDA-Cookieless-Attribution
- **延伸**：Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-PIE-Experimental-MTA

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：13-广告分析　·　源卡：`Skill-PIE-Experimental-MTA`