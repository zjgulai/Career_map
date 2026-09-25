---
name: "p2s-listing-suppression-detection"
title: "Listing Suppression Detection — Listing 被平台隐藏/降权检测（非账号问题）"
description: "触发词：Listing 压制检测、CUSUM 突变检测、流量解耦、自然流量归零、静默降权。何时不用：要判断的是 ASIN 是否被索引收录时用「索引健康度监控」；要判断的是 Buy Box 是否被跟卖抢走时用「Buy Box 劫持实时监控」。安全边界：只给疑似压制的统计信号，不判定违规条款、不代提交申诉。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 漏斗诊断"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Listing-Suppression-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "自然流量突然归零而广告流量还在时，第一时间告诉你是 Listing 被平台静默压了，而不是干等两三天。"
user_try: "试试：用我导出的每日自然 Session、PPC Session 和 BSR 数据，判断这个 ASIN 是否被静默压制。"
whenToUse: "当 ASIN 的自然流量相对广告流量出现异常脱钩、怀疑被平台静默压制（非账号问题）时用本技能；若要判断的是索引收录状态，用「索引健康度监控」；若要判断的是 Buy Box 被跟卖抢走，用「Buy Box 劫持实时监控」。"
workflow: "导出每日自然 Session、PPC Session、BSR 与 Page Views → 用 14 天基线算标准化序列与下行 CUSUM → 越限触发预警并做流量解耦判定 → 排查合规问题并跟踪恢复"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Listing Suppression Detection — Listing 被平台隐藏/降权检测（非账号问题）

## ① 解决的问题

运营面临"Listing被算法静默压制2-3天后才发现每天损失数千美元"——CUSUM流量解耦检测将发现时间从3天压缩至1.5天，年化减少Listing压制损失15-30万元

## ② 核心算法逻辑

论文：CUSUM for Change Point Detection | 年份：2020

## ③ 业务应用场景

场景：某吸奶器 Listing 因图片中含有「医疗器械」相关词汇被 Amazon 算法静默压制，Organic Session 在 2 天内归零，但 BSR 和广告 Session 暂时未变。
数据要求：每日 Organic Session、PPC Session、BSR、Page Views（Seller Central Business Report）。
CUSUM 检测：Session 异常在第 1.5 天触发预警（传统阈值法需要 3 天），运营立即排查发现图片合规问题，修复图片并重新提交后 24 小时恢复。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

15-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（74 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def cusum_listing_monitor(
    organic_sessions: np.ndarray,
    ppc_sessions: np.ndarray,
    k: float = 0.5,  # 允许漂移量（标准差单位）
    h: float = 4.0,  # 控制限
    warmup: int = 14  # 历史基线期（天）
) -> dict:
    """
    Listing 压制 CUSUM 检测器
    organic_sessions: 自然 Session 序列
    ppc_sessions: PPC Session 序列
    """
    n = len(organic_sessions)
    assert n > warmup, "数据不足"

    # 基线统计（warmup 期）
    mu_0 = np.mean(organic_sessions[:warmup])
    sigma_0 = np.std(organic_sessions[:warmup]) + 1e-8

    # 标准化
    x_norm = (organic_sessions - mu_0) / sigma_0

    # 下行 CUSUM（检测急剧下降）
    C_neg = np.zeros(n)
    alerts = np.zeros(n, dtype=bool)

    for t in range(1, n):
        C_neg[t] = max(0, C_neg[t - 1] - x_norm[t] - k)
        alerts[t] = C_neg[t] > h

    # 流量解耦检测：Organic 骤降但 PPC 正常
    organic_pct_change = np.zeros(n)
    ppc_pct_change = np.zeros(n)
    for t in range(1, n):
        if organic_sessions[t - 1] > 0:
            organic_pct_change[t] = (organic_sessions[t] - organic_sessions[t - 1]) / organic_sessions[t - 1]
        if ppc_sessions[t - 1] > 0:
            ppc_pct_change[t] = (ppc_sessions[t] - ppc_sessions[t - 1]) / ppc_sessions[t - 1]

    # 解耦信号：Organic 下降 > 30% 且 PPC 变化 < 15%
    decoupling = (organic_pct_change < -0.30) & (np.abs(ppc_pct_change) < 0.15)

    alert_days = np.where(alerts)[0].tolist()
    return {
        'cusum_values': C_neg,
        'alert_days': alert_days,
        'decoupling_days': np.where(decoupling)[0].tolist(),
        'suppressed': len(alert_days) > 0,
        'baseline_daily_sessions': mu_0
    }

# 测试：模拟 Listing 压制场景
np.random.seed(42)
n = 30
organic = np.random.poisson(500, n).astype(float)
ppc = np.random.poisson(200, n).astype(float)

# 第 17 天起 Organic Session 归零（Listing 被压制）
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2004.07683，但该号在 arXiv 上是《Do sequence-to-sequence VAEs learn global features of sentences?》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《CUSUM for Change Point Detection》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每日自然 Session、PPC Session、BSR、Page Views（Seller Central Business Report 导出）；需要 ≥14 天历史基线；粒度为 ASIN × 日。

**输出**：压制预警信号（触发日期与 CUSUM 值）、流量解耦判定（自然流量骤降而广告流量正常的日期）与基线日均 Session；供运营排查合规/图片问题并跟踪恢复。

## 执行步骤

1. 导出 ASIN 的每日自然 Session、PPC Session、BSR 与 Page Views
2. 用前 14 天做基线，计算标准化序列与下行 CUSUM 统计量
3. CUSUM 越过控制限时触发预警（卡页口径第 1.5 天发现）
4. 做流量解耦判定：自然流量骤降而 PPC 正常即判为疑似压制
5. 排查图片/文案合规问题，修复后跟踪 24 小时恢复情况

## 边界与不做

- 数据不满足：历史不足 14 天或缺少 PPC Session 对照时无法做解耦判定，先攒基线数据。
- 何时不用：要判断的是 ASIN 是否被搜索索引收录，用「索引健康度监控」；要判断的是 Buy Box 是否被跟卖抢走，用「Buy Box 劫持实时监控」。
- 能力边界：只给疑似压制的统计信号，不判定具体违规条款、不代提交申诉；卡页的发现延迟 3 天→1.5 天、年化减少损失 15-30 万元为案例口径。

## 技能关联

- **可组合**：Skill-Listing-Suppression-Detection

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Listing-Suppression-Detection`