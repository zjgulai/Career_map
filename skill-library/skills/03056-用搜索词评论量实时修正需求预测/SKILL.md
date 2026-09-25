---
name: "p2s-demand-signal-nowcasting"
title: "Demand Signal Nowcasting — 用搜索词/评论量实时修正需求预测"
description: "触发词：Nowcasting、搜索量领先信号、评论数监测、紧急补货、病毒传播。何时不用：要提前数周预警旺季拐点用「预订曲线预测」，要在大促活动期逐日预测用「LLM事件感知预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 趋势监测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Demand-Signal-Nowcasting"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "搜索量、评论数一异动就立刻修正需求预测，比等销量数据早几天触发紧急补货。"
user_try: "试试：某款吸奶器配件在 TikTok 爆了，搜索量 6 小时涨 3 倍，帮我修正未来 5 天销量并给补货建议。"
whenToUse: "本卡属需求预测的实时修正侧：外部信号（搜索、评论）剧烈异动、等销量数据来不及响应时用；需要数周尺度的旺季拐点预警，用预订曲线类技能。"
workflow: "接入搜索量指数、品牌词趋势与评论数等高频信号 → 监测信号相对基线的异常放大 → 用领先信号修正未来数天需求预测 → 触发紧急补货或资源调配"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Demand Signal Nowcasting — 用搜索词/评论量实时修正需求预测

## ① 解决的问题

运营面临"TikTok视频病毒传播后6小时搜索量暴涨但销量数据延迟3天已经缺货"——领先信号Nowcasting提前3天响应，避免缺货损失10-15万元/次

## ② 核心算法逻辑

论文：Nowcasting with Leading Indicators: A Bridge Equation Approach | 年份：2020

## ③ 业务应用场景

场景：TikTok 上某 Mommy Influencer 的视频病毒式传播（2 天内 500 万播放），该视频推荐了某款吸奶器配件。此时搜索量暴涨，但 Amazon 销量数据延迟 2-3 天。
数据要求：Helium 10 搜索量指数（实时），Google Trends（品牌词），新品评论数（每日爬取）。
Nowcasting 应用：搜索量指数在视频发布后 6 小时上涨 3 倍，触发 Nowcast 修正——预测未来 5 天销量上调 180%，立即触发紧急空运补货（额外成本 2 万元）。若等待销量数据确认，已经缺货 4 天（损失 15 万元）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

500 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（81 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def nowcast_with_leading_indicators(
    y_hist: np.ndarray,
    search_index: np.ndarray,
    review_count: np.ndarray,
    horizon: int = 7
) -> dict:
    """
    基于领先指标的 Nowcasting
    y_hist: 过去 T 期销量（可含 NaN，表示未实现）
    search_index: 同期搜索量指数（实时，1-100）
    review_count: 同期新增评论数
    horizon: 预测窗口（天）
    """
    T = len(y_hist)
    # 仅用已实现的销量训练
    valid_mask = ~np.isnan(y_hist)
    y_valid = y_hist[valid_mask]
    search_valid = search_index[valid_mask]
    review_valid = review_count[valid_mask]

    if len(y_valid) < 10:
        return {'error': '历史数据不足，至少需要 10 个有效观测'}

    # 标准化
    y_mean, y_std = np.mean(y_valid), np.std(y_valid) + 1e-8
    s_mean, s_std = np.mean(search_valid), np.std(search_valid) + 1e-8
    r_mean, r_std = np.mean(review_valid), np.std(review_valid) + 1e-8

    y_norm = (y_valid - y_mean) / y_std
    s_norm = (search_valid - s_mean) / s_std
    r_norm = (review_valid - r_mean) / r_std

    # 桥接方程：OLS 融合
    X = np.column_stack([np.ones(len(y_norm)), s_norm, r_norm])
    beta = np.linalg.lstsq(X, y_norm, rcond=None)[0]

    # 使用最新实时信号预测
    latest_search = search_index[-1]
    latest_review = review_count[-1]
    s_norm_new = (latest_search - s_mean) / s_std
    r_norm_new = (latest_review - r_mean) / r_std

    x_new = np.array([1, s_norm_new, r_norm_new])
    y_pred_norm = x_new @ beta
    y_pred = y_pred_norm * y_std + y_mean

    # 计算信号强度
    signal_strength = (latest_search - s_mean) / s_std

    return {
        'nowcast': max(0, y_pred),
        'baseline': y_mean,
        'uplift_factor': y_pred / (y_mean + 1e-8),
        'signal_strength': signal_strength,
        'coefficients': {'intercept': beta[0], 'search': beta[1], 'review': beta[2]},
        'alert': signal_strength > 2.0  # 信号超过 2σ 触发预警
    }
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2003.00127 — Time of arrival imaging: The proof of concept for a novel medical imaging modality
⚠️ 卡页 ② 段点名的论文是《Nowcasting with Leading Indicators: A Bridge Equation Approach》，与这个号指的不是同一篇。

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0.139）。引用前请自行确认。

## 输入 / 输出契约

**输入**：Helium 10 搜索量指数（实时）、Google Trends 品牌词、每日爬取的新品评论数；关键词×日或小时粒度，另需历史销量用于对比验证。

**输出**：修正后的未来 5 天销量预测、信号异动触发记录与紧急补货建议（含额外成本提示），输出给补货与运营决策。

## 执行步骤

1. 接入搜索量指数、品牌词趋势与评论数等高频信号。
2. 监测信号相对基线的异常放大，判断是否触发修正。
3. 用领先信号修正未来数天的需求预测。
4. 触发紧急补货或资源调配，并记录额外成本。

## 边界与不做

- 何时不用：缺少实时搜索量与评论数抓取能力时拿不到领先信号；只需稳定周期预测的场景不需要本技能。
- 能力边界：Nowcasting 只做短周期修正，不替代中长期预测；信号可能由非需求因素驱动，触发高成本动作前需业务确认。

## 技能关联

- **可组合**：Skill-Demand-Signal-Nowcasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Demand-Signal-Nowcasting`