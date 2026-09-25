---
name: "p2s-dataagent-marketing-attribution"
title: "DataAgent营销归因分析 — LLM驱动的多渠道营销效果自动归因"
description: "触发词：营销归因、多渠道归因报告、对话式追问、预算优化、广告效果分析。何时不用：因果结构未知、需要先做结构发现时用「PC算法因果发现」；只评估单条短视频的内容 ROI 时用「Video ROI Attribution」。安全边界：使用 Amazon Attribution 时须遵守其数据共享限制，不得把 Amazon 广告数据与外部渠道合并归因；用户级转化路径数据受 GDPR 约束，须最小化使用。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 渠道经营分析"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-DataAgent-Marketing-Attribution"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "用对话生成多渠道营销归因报告，CMO 可以随时追问，把等两天的报告变成十分钟出结果。"
user_try: "试试：帮我把 Google、TikTok、Facebook 的广告数据和订单数据跑一份月度归因报告，并回答哪个用户群对 TikTok 响应最强。"
whenToUse: "当多渠道广告数据与订单数据已就绪、要定期产出归因报告并支持即兴追问时用本技能；因果结构未知需要先发现，用「PC算法因果发现」；只评估单条短视频的内容 ROI，用「Video ROI Attribution」；异常指标要定位到具体业务链路，用「ProRCA 根因溯源」。"
workflow: "接入各渠道广告 API 与订单数据，对齐时间与渠道维度 → 配置并训练归因模型（MMM 线性近似） → 生成结构化多渠道归因报告 → 支持 CMO 对报告即兴追问并做针对性分析 → 输出预算优化建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DataAgent营销归因分析 — LLM驱动的多渠道营销效果自动归因

## ① 解决的问题

CMO面临"多渠道营销归因报告需等2天且无法即兴追问"——对话式营销归因Agent 10分钟生成报告支持即兴追问，年化营销预算优化效益约100万元

## ② 核心算法逻辑

营销归因的Agent化将传统的"SQL查询+报表"模式升级为"对话式智能分析"：

## ③ 业务应用场景

场景A：月度营销归因自动化报告 - 业务问题：CMO每月需要"多渠道营销效果报告"，当前需要数据团队花2天生成，且每次只能回答预设问题，无法即兴追问 - 数据要求：各渠道广告数据（Google/TikTok/Facebook）+ 订单数据 + 归因模型配置 - 预期产出：Agent 10分钟内生成结构化归因报告，支持CMO随时追问（"哪个用户群对TikTok响应最强？"），全程对话完成分析 - 业务价值：分析师工作量减少60%，决策速度提升（从等2天到即时）；CMO决策质量提升带动年化营销ROI优化约100万元
**三轨验证**： - **成本**：显性成本包括：①数据采集：各渠道API对接（Google Ads API、TikTok Marketing API、Facebook Graph API）约2-3人周开发；②计算资源：MMM模型训练（90天数据）单次约0.5小时CPU，Agent对话调用LLM API（每次约0.01-0.05美元）；③人力：初始配置约5人天，后续维护约0.5人天/月。总年化成本约8-12万元。 - **合规**：①Amazon政策：若使用Amazon Attribution需遵守其数据共享限制，不得将Amazon广告数据与外部渠道合并归因；②GDPR：用户级转化路径数据需

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：营销归因分析师工作量减少60%（约20万元/年）；CMO决策速度提升（从2天→10分钟），更快响应市场变化；归因精准度提升使预算分配优化约100万元
实施难度：⭐⭐⭐☆☆（归因模型约2-3天；Agent对话框架约1周；LLM路由是难点）
优先级：⭐⭐⭐⭐⭐（修复09-DataAgent↔15-营销投放断层（规模69）；营销归因是CMO最高频的分析需求）
评估依据：SIGIR 2024自动营销归因Agent论文；arXiv:2407.13983对话式营销分析Agent；Northbeam/Triple Whale等营销归因SaaS产品均在向Agent化方向发展

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（134 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-DataAgent-Marketing-Attribution
LLM驱动的营销归因分析Agent

依赖：pip install numpy pandas scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

np.random.seed(42)

# ── 1. 生成多渠道营销数据 ────────────────────────────────────────────
n_days = 90  # 3个月数据

# 渠道花费
tiktok_spend  = np.random.uniform(500, 3000, n_days)
google_spend  = np.random.uniform(1000, 5000, n_days)
facebook_spend = np.random.uniform(300, 2000, n_days)

# 外部因素
seasonality = np.sin(2*np.pi*np.arange(n_days)/90) * 0.2 + 1.0
events = np.zeros(n_days); events[44:51] = 1.5  # 大促

# 真实归因权重（用于验证）
TRUE_WEIGHTS = {'tiktok': 0.25, 'google': 0.45, 'facebook': 0.15, 'organic': 0.15}

# 销量（真实归因+季节+噪声）
sales = (
    TRUE_WEIGHTS['tiktok']   * tiktok_spend * 0.1
    + TRUE_WEIGHTS['google'] * google_spend * 0.08
    + TRUE_WEIGHTS['facebook'] * facebook_spend * 0.12
    + 1000 * seasonality * events
    + np.random.normal(0, 100, n_days)
)

df = pd.DataFrame({
    'day': np.arange(n_days),
    'tiktok_spend': tiktok_spend,
    'google_spend':  google_spend,
    'facebook_spend': facebook_spend,
    'sales': sales,
})

# ── 2. 归因模型（MMM线性近似）────────────────────────────────────────
scaler = StandardScaler()
X = scaler.fit_transform(df[['tiktok_spend','google_spend','facebook_spend']])
model = Ridge(alpha=1.0).fit(X, df['sales'])

# 归因贡献比例
coefs_pos   = np.maximum(model.coef_, 0)
total_coef  = coefs_pos.sum()
attribution = {
    'TikTok':   coefs_pos[0] / total_coef if total_coef > 0 else 0,
    'Google':   coefs_pos[1] / total_coef if total_coef > 0 else 0,
    'Facebook': coefs_pos[2] / total_coef if total_coef > 0 else 0,
}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.13983，但该号在 arXiv 上是《Practical continuous-variable quantum secret sharing using local local oscillator》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各渠道广告数据（Google/TikTok/Facebook 的花费与投放维度）+ 订单/转化数据 + 归因模型配置；渠道粒度、日或月粒度，需通过各渠道 API 对接。

**输出**：结构化归因报告（渠道贡献、预算优化建议）并支持对话式追问；供 CMO 与营销分析师决策使用。

## 执行步骤

1. 接入各渠道广告 API 与订单数据并对齐时间与渠道维度
2. 配置并训练归因模型（MMM 线性近似）并输出各渠道贡献比例
3. 生成结构化归因报告
4. 支持 CMO 对报告即兴追问并给出针对性分析
5. 输出预算分配优化建议

## 边界与不做

- 数据不满足：渠道 API 未打通、订单数据归不到渠道维度时不要出报告，先补数据管道。
- 何时不用：因果结构未知要先发现用「PC算法因果发现」；只评估单条视频内容 ROI 用「Video ROI Attribution」；销量突变要五分钟内定位根因用「需求异常因果归因」。
- 能力边界：产出的是归因口径下的贡献估计与建议，不直接执行预算调整，也不替代增量实验验证。
- 安全边界：使用 Amazon Attribution 时不得把 Amazon 广告数据与外部渠道合并归因；用户级转化路径数据须符合 GDPR 并最小化使用。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Geo-Holdout-Experiment.html、Skill-Geo-Holdout-Experiment、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Geo-Holdout-Experiment.html、Skill-Geo-Holdout-Experiment、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI
- **可组合**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Geo-Holdout-Experiment.html、Skill-Geo-Holdout-Experiment、Skill-DataAgent-Marketing-Attribution

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-DataAgent-Marketing-Attribution`