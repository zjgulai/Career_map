---
name: "p2s-frontdoor-causal-mta"
title: "ALM-MTA 前门因果多触点归因 - 剔除隐藏混淆的广告真实 ROI 剥离"
description: "触发词：前门准则、未观测混淆、归因水分、行为代理、重定向 ROAS、真实因果贡献。何时不用：找不到合适的行为代理指标时前门估计不成立；只有渠道级汇总数据时用大盘数据归因。安全边界：用户级触点与行为序列属个人信息，需在隐私政策与平台授权范围内使用，创作者与 KOL 数据需遵守平台 API 条款。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 增量分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-FrontDoor-Causal-MTA"
p2s_src_domain: "13-广告分析"
quality_tier: "preview"
user_summary: "剔除用户自身购买意愿带来的归因水分，还原各渠道真实的因果贡献。"
user_try: "试试：短信重定向 ROAS 显示 8x，帮我用前门因果方法去掉水分看真实贡献。"
whenToUse: "怀疑存在未观测混淆（用户先有购买意愿再点广告）导致重定向渠道虚高时用本技能；没有行为代理指标时改用大盘归因或实验；只看贡献拆分时用多触点归因。"
workflow: "整理用户级触点序列、购买标签与行为代理 → 构造合成代理指标并检验其合理性 → 用前门准则估计各渠道因果效应 → 对比因果与朴素归因，量化归因水分倍数 → 输出矫正 ROAS 与预算重分配建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ALM-MTA 前门因果多触点归因 - 剔除隐藏混淆的广告真实 ROI 剥离

## ① 解决的问题

孕晚期用户购买周期 6-8 周，在"下定决心买推车"后主动搜索并点击所有重定向短信/DPA 广告

## ② 核心算法逻辑

多触点归因的致命缺陷：广告数据中存在一个隐身幽灵——未观测混淆因子 U（用户内心的强烈购买意愿）。这个幽灵同时导致用户"疯狂点击各种重定向广告（触点 T）"并且"最终购买（转化 Y）"。传统模型把 U 的全部功劳都错误归到广告渠道头上，结果重定向广告（Retargeting）ROAS 虚高，真正创造需求的上漏斗渠道（TikTok/FB Awareness）被严重低估。

## ③ 业务应用场景

- 业务问题：孕晚期用户购买周期 6-8 周，在"下定决心买推车"后主动搜索并点击所有重定向短信/DPA 广告。Last-Click 把 500 美金订单 100% 归给"最后那条打折短信"，导致短信渠道 ROAS=8x，TikTok Awareness ROAS=1.2x。预算持续向短信倾斜，拉新渠道萎缩 → 全局流量恶性循环。 - 数据要求：用户级触点序列（渠道名、时间戳）+ 购买标签 Y + 行为代理指标（每用户 PDP 平均停留时长或滑动深度合成指数） - ALM-MTA 操作： - 代理 M = `scroll_depth_score × 0.6 + dwell_time_norm 
- 业务问题：新品吸奶器在 TikTok Creator 生态投放 KOL 内容（触点 A）+达人 Shop 链接（触点 B）+Amazon 品牌广告（触点 C）。用户在看到 KOL 内容时已有强购买意愿，导致 Amazon 广告被高估，KOL 内容被严重低估，创作者生态预算持续缩减。 - 数据要求：TikTok Creator API 视频观看深度（作为代理 M）+ 三渠道触点 + 购买转化 - 预期产出：KOC/KOL 内容的真实因果 ROAS，用于优化达人分佣和内容预算；Amazon 广告从"功劳抢夺者"还原为"收割层" - 业务价值：KOL 内容预算优化后 CPM 效率提升约 30%，
三轨验证 | 成本轨：月均投入3,200元（广告投放优化工具1,500元/月+数据分析师人工12小时/月×800元/小时=9,600元/月÷3个月周期），ROI提升43%（ROAS从2.8→4.1）可在2-3个月内收回成本 | 合规轨：符合《跨境电商平台服务规范》第8.2条广告投放透明度要求，需提供投放数据报告；符合《母婴产品广告管理办法》，不涉及医疗宣传；平台Sponsored Ads官方工具合规，无违规风险 | 风险轨：市场饱和风险(概率25%)—竞争对手跟风导致CPC上升；数据波动风险(概率35%)—季节性因素影响ROAS稳定性；平台政策变化风险(概率15%)—广告算法更新影响效果

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
中型母婴品牌月广告预算 150-300 万元，重定向广告占比通常 30-40%
矫正后识别虚假 ROI 水分，预算从 Retargeting 向上漏斗重分配 20-30%
保守估计：新客增量 15-25%，年化新增 GMV 300-800 万元
实施成本：1 名数据工程师 + 2 周开发接入，一次性成本约 3 万元
回收周期：< 1 个月

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（36 行）。**下面 36 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **36 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，36 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/frontdoor_causal_mta` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-FrontDoor-Causal-MTA.md`），已与卡面节选核对，不依赖上述路径。

```python
"""ALM-MTA 前门因果多触点归因 — 核心用法示例"""
from model import (
    simulate_frontdoor_data,
    ALMMTAPipeline,
    ALMMTAConfig,
    compute_roas_correction,
)

# 1. 准备用户级数据（真实场景替换为业务数据）
df, _, channels = simulate_frontdoor_data(n_users=5000, seed=42)

# 2. 运行归因管道
config = ALMMTAConfig(
    latent_dim=4,
    adversarial_weight=1.5,
    n_iter_purifier=300,
    n_bins_frontdoor=5,
)
pipeline = ALMMTAPipeline(config=config)
result = pipeline.fit_predict(df, channels)

# 3. 查看因果 vs 朴素归因对比
print(result.summary_df())
# 输出示例:
#              渠道  因果 ATE  朴素相关  偏差倍数  因果贡献%  朴素贡献%
#  fb_awareness  0.165   0.127   -0.23    32.5     63.5
# tiktok_content  0.211   0.059   -0.72    41.5     29.5
#   retarget_sms  0.132   0.014   -0.89    26.0      7.0

# 4. 计算矫正 ROAS 并做预算重分配决策
spend = {'fb_awareness': 80000, 'tiktok_content': 70000, 'retarget_sms': 50000}
roas_df = compute_roas_correction(result, spend, total_revenue=500000)
print(roas_df)
# retarget_sms 原始ROAS=0.70，矫正ROAS=2.60 → 水分倍数=0.27
# 说明 73% 的 ROAS 来自用户自身意愿，而非广告贡献
print("[✓] FrontDoor Causal MTA 测试通过")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2605.08881 — ALM-MTA:Front-Door Causal Multi-Touch Attribution Method for Creator-Ecosystem Optimization

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：用户级触点序列（渠道名、时间戳）、购买标签，以及每用户的行为代理指标（如商品页平均停留时长或滑动深度合成指数）；代理需与购买意愿相关且不被广告直接影响。

**输出**：各渠道的因果效应估计与朴素相关对照、偏差倍数、矫正后的渠道 ROAS 与预算重分配决策；供投放与内容团队区分收割层与创造需求的渠道。

## 执行步骤

1. 整理用户级触点序列、购买标签与行为代理
2. 构造合成代理指标并检验其合理性
3. 用前门准则估计各渠道因果效应
4. 对比因果与朴素归因，量化归因水分倍数
5. 输出矫正 ROAS 与预算重分配建议

## 边界与不做

- 何时不用：找不到与购买意愿相关、又不受广告直接影响的代理指标时，前门估计不成立，改用实验方法。
- 能力边界：本技能产出因果贡献与矫正 ROAS，不做投放执行，也不替代增量实验的最终验证。
- 数据边界：代理指标选择、触点回传口径与跨端断链都会影响结论，需在报告中标注不确定性。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **延伸**：Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution
- **可组合**：Skill-CABB-Cross-Category-Attribution.html、Skill-CABB-Cross-Category-Attribution、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-FrontDoor-Causal-MTA

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-FrontDoor-Causal-MTA`