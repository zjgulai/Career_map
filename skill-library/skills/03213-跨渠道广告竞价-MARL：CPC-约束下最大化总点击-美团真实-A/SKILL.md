---
name: "p2s-hmmcb-cross-channel-bidding"
title: "HMMCB — 跨渠道广告竞价 MARL：CPC 约束下最大化总点击（美团真实 A/B）"
description: "触发词：跨渠道竞价、CPC约束、MARL双层决策、预算分配层、渠道智能体。何时不用：只投单一渠道时不适用；问题若只是渠道预算比例或日内节奏，走预算分配与节奏控制技能。安全边界：只输出分层决策参数（预算分配与出价设置建议），实际竞价由各平台侧执行，不得绕过平台竞价政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-HMMCB-Cross-Channel-Bidding"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "上层按整体 CPC 约束分配渠道预算、下层各渠道自己实时竞价，同时守住 CPC 与总预算。"
user_try: "试试：我们 Google、Meta、TikTok 三渠道月预算50万、要求整体 CPC≤8元，帮我给出分层竞价方案。"
whenToUse: "当多渠道同时投放、且存在渠道级 CPC 约束需要上层分配与下层出价联动时用本卡；纯预算比例分配不带竞价层用多平台广告预算分配器；渠道饱和度触发削减用再分配触发器。"
workflow: "采集各渠道至少 3 个月出价、曝光、点击与成本数据 → 上层按整体 CPC 约束生成预算分配向量 → 下层各渠道在分配预算内实时调整出价参数 → 校验 CPC 约束与总预算恒等式 → 输出分层竞价结果与均匀基线对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HMMCB — 跨渠道广告竞价 MARL：CPC 约束下最大化总点击（美团真实 A/B）

## ① 解决的问题

母婴 DTC 品牌（如储奶袋/吸奶器）同时在 Google Ads（搜索意图强）、Meta（品牌认知+再营销）、TikTok Shop（内容种草+购买）三个渠道投放

## ② 核心算法逻辑

HMMCB 的核心洞察：跨渠道广告竞价是一个两层嵌套决策问题——上层决定「把钱分给哪个渠道」，下层决定「每个渠道出多少价」。单一智能体无法同时优化两个时间尺度和约束维度。

## ③ 业务应用场景

母婴 DTC 品牌（如储奶袋/吸奶器）同时在 Google Ads（搜索意图强）、Meta（品牌认知+再营销）、TikTok Shop（内容种草+购买）三个渠道投放。 - 每月广告预算 50 万，需满足整体 CPC ≤ 8 元的广告主约束 - 三个渠道竞价节奏不同（Google 实时竞价 < 0.1s、Meta CPM 买量、TikTok 竞价+内容分） - 运营团队手动调预算，每周一次，无法响应促销季/节假日的流量峰谷
数据要求 - 各渠道历史出价记录、曝光量、点击量、成本（≥ 3 个月） - 渠道级别的 CPC、CTR、转化率时序数据（按小时/天） - 广告主设定的预算上限和 CPC 约束参数
HMMCB 运作方式 1. Top-level：每日/每小时根据三渠道实时状态和 CPC 约束，扩散模型生成最优预算分配 $[b_G, b_M, b_T]$ 2. Bottom-level：三个独立渠道智能体，在分配预算约束下实时竞价（Google 调整 tCPC / Meta 调整出价上限 / TikTok 调整竞价系数） 3. 约束保证：Top-level 的条件扩散采样天然保证 $\sum_i b_i \cdot \text{CPC}_i \leq \text{Budget}_{\text{total}} \cdot \text{CPC}_{\text{target}}$

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

CPC 降低：10–20%（同渠道出价更精准）
同预算总点击提升：15–25%（预算分配优化）
母婴 DTC 品牌年广告投入 500 万，优化增效约 75–125 万/年

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（19 行）。**下面 19 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **19 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，19 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/hmmcb_cross_channel_bidding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-HMMCB-Cross-Channel-Bidding.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速使用示例
from hmmcb_cross_channel.model import HMMCBSystem, ChannelState

# 初始化三渠道系统
channels = [
    ChannelState("google", budget_remaining=200000, cpc_target=8.0,
                 historical_ctr=0.045, bid_history=[6.5, 7.0, 7.2]),
    ChannelState("meta",   budget_remaining=180000, cpc_target=8.0,
                 historical_ctr=0.028, bid_history=[5.0, 5.5, 6.0]),
    ChannelState("tiktok", budget_remaining=120000, cpc_target=8.0,
                 historical_ctr=0.015, bid_history=[]),  # 新渠道，无历史
]

system = HMMCBSystem(channels, total_budget=500000, global_cpc_target=8.0)
results = system.run_bidding_cycle(steps=10)

# 验证：CPC 约束满足 + TikTok 迁移效果 + 总点击超过均匀基线
system.validate_results(results)
print("[✓] HMMCB Cross Channel Biddi 测试通过")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2412.19064 — Hierarchical Multi-agent Meta-Reinforcement Learning for Cross-channel Bidding

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各渠道历史出价记录、曝光量、点击量、成本（至少 3 个月），渠道级 CPC、CTR 与转化率时序（按小时或天），以及广告主设定的预算上限和整体 CPC 约束参数。

**输出**：分层决策结果——上层三渠道预算分配向量与下层各渠道出价参数（Google 的 tCPC、Meta 的出价上限、TikTok 的竞价系数），附 CPC 约束满足校验与相对均匀基线的总点击提升对比。

## 执行步骤

1. 采集各渠道至少 3 个月的历史出价、曝光、点击与成本
2. 构造各渠道状态（剩余预算、CPC 目标、历史 CTR 与出价序列）
3. 上层按整体 CPC 约束采样生成渠道预算分配向量
4. 下层每个渠道智能体在分配预算内实时调整出价参数
5. 校验总花费与 CPC 约束恒等式是否同时成立
6. 输出分配方案与相对均匀基线的总点击对比

## 边界与不做

- 何时不用：只投单一渠道、或缺少渠道级 CPC 与 CTR 时序数据时不适用；问题若只是预算比例或日内节奏，用更轻的分配与节奏技能。
- 能力边界：只产出分配与出价参数建议，真实竞价由各平台侧执行；新渠道无历史时依赖迁移能力，效果需实测验证。
- 数据边界：需至少 3 个月各渠道投放数据，短于此无法稳定标定渠道状态。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-AIGP-LLM-Dynamic-Pricing.html、Skill-AIGP-LLM-Dynamic-Pricing、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-HMMCB-Cross-Channel-Bidding

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-HMMCB-Cross-Channel-Bidding`