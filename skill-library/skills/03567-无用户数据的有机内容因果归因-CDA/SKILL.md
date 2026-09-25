---
name: "p2s-organic-content-causal-attribution"
title: "Organic Content Causal Attribution — 无用户数据的有机内容因果归因 (CDA)"
description: "触发词：有机内容归因、品牌词搜索、聚合数据、因果发现、KOL种草。何时不用：有用户级触点日志时用多触点归因类技能，不必用聚合数据做因果发现。安全边界：使用平台官方API与聚合数据，需签署数据处理协议（DPA）。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 合作复盘"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Organic-Content-Causal-Attribution"
p2s_src_domain: "15-营销投放分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在没有用户级数据的情况下，用聚合曝光与搜索量判断哪类种草内容真的拉动了品牌词搜索和成交。"
user_try: "试试：每月在小红书和 TikTok 投 15 万 KOL，帮我判断这些内容有没有真的带来品牌词搜索增长。"
whenToUse: "当有机内容没有用户级路径数据、只能拿到渠道级聚合曝光与搜索量时间序列，却要判断各内容渠道贡献时用；有完整用户级触点日志时改用多触点归因类技能。"
workflow: "汇总周维度的各渠道 KOL 发帖时间与曝光量 → 整理品牌词搜索量、自然流量点击与 GMV 时间序列（12 个月） → 用因果发现与时滞相关性检验识别各渠道对搜索与 GMV 的方向与滞后 → 输出各渠道因果贡献度与滞后天数 → 按贡献度砍掉低效内容投入、重排内容预算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Organic Content Causal Attribution — 无用户数据的有机内容因果归因 (CDA)

## ① 解决的问题

每月 15 万 KOL 种草投入但不知道有没有带来 Amazon 品牌词搜索增长——CDA 框架仅用聚合曝光数据推断各渠道因果贡献（无需用户 ID），砍掉无效内容投入，年化节省 54 万元以上

## ② 核心算法逻辑

核心思想：传统营销归因（MTA/MMM）依赖用户级路径数据（cookie/IDFA），在 iOS14 隐私政策后几乎不可用。更大的问题是有机内容（KOL种草/博客/TikTok自然流量）根本没有用户路径——你不知道是哪篇小红书笔记带来了 Amazon 的品牌词搜索增长。

## ③ 业务应用场景

场景：KOL 种草 × Amazon 品牌词搜索量因果归因
- 业务问题：某母婴品牌每月在小红书/TikTok 上合作 20 个 KOL，总投入 15 万元，但不知道这些内容有没有带来 Amazon 的品牌词搜索增长（Momcozy 自然搜索），还是只是花了钱没效果。 - 数据要求： - KOL 发帖时间 + 曝光量（按渠道汇总，周维度） - Amazon 品牌词搜索量（Amazon Brand Analytics） - 自然流量点击量（Google Search Console） - GMV 时间序列（周维度，12 个月历史） - 预期产出： - 每个内容渠道的因果贡献度（"小红书 KOL → +12% 品牌搜索，滞后 14 天"） - 渠道因果 D
三轨验证 | 成本轨：月均投入3,200元（MMM模型搭建2,000元/月+数据分析师0.5人月8,000元/月÷4），人工投入12小时/月（数据清洗4h+模型训练5h+结果解读3h） | 合规轨：符合《电商平台数据使用规范》和TikTok/Amazon官方API接口政策，需签署数据处理协议DPA，合规结论：可行 | 风险轨：①数据延迟导致归因偏差（概率35%）②平台API调用限制影响模型更新（概率25%）③跨平台数据口径不一致（概率40%），整体风险等级中

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：优化内容渠道预算分配，砍掉 20-50% 无效投入，月投入 15 万 × 30% = 年化节省 54 万元
实施难度：⭐⭐⭐☆☆（中等，需要时序数据整合 + PCMCI 因果发现库）
优先级：⭐⭐⭐⭐⭐（随隐私政策收紧，有机归因是下一个核心竞争力）
评估依据：arXiv 2512.21211，开源代码 + 大规模模拟验证，RMSE 9.5%，隐私友好

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（74 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/marketing/organic_content_causal_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/15-营销投放分析/Skill-Organic-Content-Causal-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class ChannelTimeSeries:
    name: str
    weekly_values: List[float]

def granger_causality_simple(cause: List[float], effect: List[float],
                              max_lag: int = 4) -> Dict[str, float]:
    n = len(cause)
    best_lag = 0
    best_corr = 0.0
    for lag in range(1, min(max_lag + 1, n // 3)):
        x_lagged = cause[:-lag]
        y_shifted = effect[lag:]
        if len(x_lagged) < 4:
            continue
        x_arr = np.array(x_lagged)
        y_arr = np.array(y_shifted)
        if x_arr.std() < 1e-9 or y_arr.std() < 1e-9:
            continue
        corr = float(np.corrcoef(x_arr, y_arr)[0, 1])
        if abs(corr) > abs(best_corr):
            best_corr = corr
            best_lag = lag
    return {"optimal_lag_weeks": best_lag, "correlation": round(best_corr, 3),
            "causal_strength": round(abs(best_corr), 3)}

def counterfactual_contribution(channel: ChannelTimeSeries, outcome: List[float],
                                 reduction_pct: float = 1.0) -> Dict[str, float]:
    gc = granger_causality_simple(channel.weekly_values, outcome)
    avg_channel = np.mean(channel.weekly_values)
    avg_outcome = np.mean(outcome)
    contribution_pct = gc["causal_strength"] * reduction_pct * 100
    counterfactual_loss = avg_outcome * (contribution_pct / 100)
    return {"channel": channel.name, "causal_strength": gc["causal_strength"],
            "optimal_lag_weeks": gc["optimal_lag_weeks"],
            "estimated_contribution_pct": round(contribution_pct, 1),
            "counterfactual_gmv_loss": round(counterfactual_loss, 0)}

def cda_attribution(channels: List[ChannelTimeSeries], gmv: List[float]) -> List[Dict]:
    results = []
    for ch in channels:
        contrib = counterfactual_contribution(ch, gmv)
        results.append(contrib)
    total_strength = sum(r["causal_strength"] for r in results)
    for r in results:
        r["attribution_share"] = round(r["causal_strength"] / max(total_strength, 1e-9) * 100, 1)
    return sorted(results, key=lambda x: -x["causal_strength"])

np.random.seed(42)
weeks = 52
t = np.linspace(0, 4 * np.pi, weeks)
kol_exposure = (500 + 200 * np.sin(t) + np.random.normal(0, 50, weeks)).clip(0)
paid_ads = (1000 + 300 * np.cos(t * 0.5) + np.random.normal(0, 80, weeks)).clip(0)
seo_organic = (300 + 100 * np.sin(t * 0.3) + np.random.normal(0, 30, weeks)).clip(0)
gmv = (50000 + 0.8 * np.roll(kol_exposure, 2) + 1.2 * paid_ads + 0.5 * seo_organic
       + np.random.normal(0, 2000, weeks)).clip(0)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.21211 — Causal-driven attribution (CDA): Estimating channel influence without user-level data
⚠️ 该号被 4 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：按渠道汇总、周维度的 KOL 发帖时间与曝光量；Amazon 品牌词搜索量（Amazon Brand Analytics）；自然流量点击量（Google Search Console）；周维度 GMV 时间序列（12 个月历史）；无需用户 ID。

**输出**：每个内容渠道的因果贡献度与滞后天数（卡页示例：小红书 KOL 对品牌搜索 +12%、滞后 14 天），以及内容预算再分配与削减建议。

## 执行步骤

1. 汇总周维度的各渠道 KOL 发帖时间与曝光量
2. 整理品牌词搜索量、自然流量点击与 GMV 时间序列（12 个月）
3. 用因果发现与时滞相关性检验识别各渠道的方向与滞后
4. 输出各渠道因果贡献度与滞后天数
5. 按贡献度砍掉低效内容投入并重排内容预算

## 边界与不做

- 何时不用：有用户级触点日志时优先做多触点归因；时间序列短于 12 个月、或促销等混杂事件未标注时结论不可靠。
- 能力边界：聚合数据只能给出渠道级因果贡献与滞后，无法下钻到单篇内容或单个用户；结论受平台数据口径与 API 更新延迟影响。
- 合规边界：使用平台官方 API 与聚合数据，符合平台数据使用规范并需签署数据处理协议（DPA）。
- 卡页数字（月投入 15 万元、砍掉 20-50% 无效投入、年化节省 54 万元、RMSE 9.5%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary
- **可组合**：Skill-MOS-Multi-Source-Opinion-Summary.html、Skill-MOS-Multi-Source-Opinion-Summary、Skill-Organic-Content-Causal-Attribution

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：15-营销投放分析　·　源卡：`Skill-Organic-Content-Causal-Attribution`