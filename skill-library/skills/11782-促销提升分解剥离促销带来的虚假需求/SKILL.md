---
name: "p2s-promotional-lift-decomposition"
title: "Promotional Lift Decomposition — 促销提升分解剥离促销带来的虚假需求"
description: "触发词：促销提升分解、虚假需求、ForwardBuy、促销后洼地、备货修正。何时不用：只关心单场促销净增量、不涉及促销后洼地与备货时用反事实评估（合成控制）。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Promotional-Lift-Decomposition"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "把大促的表面涨幅拆成真实净提升和被提前透支的虚假需求，避免按 6 倍销量去备整个季度的货。"
user_try: "试试：Prime Day 销量是平时 6 倍，帮我拆一下有多少是提前透支，Q3 备货该下调多少。"
whenToUse: "当大促销量暴涨、需要在备货或预算决策前分清真实净提升与被提前透支的需求（促销后洼地）时用；若只关心整场促销的净增量、不涉及后续洼地，用反事实评估（合成控制）。"
workflow: "汇总 18 个月周度销量、促销标记与历史 5 次大促前后数据 → 构造促销期与促销后洼地哑变量，并加入趋势、季节等控制变量 → 回归分解出促销净提升与促销后需求跌幅 → 计算 Forward Buy 占促销峰值的比例 → 按真实净提升修正备货与后续促销计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Promotional Lift Decomposition — 促销提升分解剥离促销带来的虚假需求

## ① 解决的问题

采购面临"Prime Day销量达平时6倍上调Q3全季备货40%但促销后出现需求洼地导致大量滞销"——促销Forward Buy分解将真实净提升从500%修正为150%，年化节省FBA处置成本20-30万元

## ② 核心算法逻辑

论文：Causal Inference for Promotional Lift Decomposition with PostPromotion Dip | 年份：2021

## ③ 业务应用场景

场景：某卖家 Prime Day 期间销量达平时 6 倍，采购团队以此为基础上调 Q3 全季度备货量 40%。实际上 Prime Day 后 2 周需求骤降到平时 50%（Forward Buy 效应），导致 Q3 末大量滞销库存。
数据要求：18 个月周度销量，促销标记（含时间窗口），历史 5 次大促前后数据。
分解应用：识别 Prime Day 真实净提升约 150%（而非表面 500%），Forward Buy 比例占峰值的 55%，Q3 备货量从原计划下调 25%，避免滞销。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-30 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（80 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def promotional_lift_decomposition(
    y: np.ndarray,
    promo_flags: np.ndarray,
    post_window: int = 3,
    controls: np.ndarray = None
) -> dict:
    """
    促销提升分解
    y: 周度销量序列（对数变换后更稳定）
    promo_flags: 促销标记序列（0/1）
    post_window: 促销后洼地观测窗口（周）
    controls: 控制变量（趋势、季节等）
    """
    n = len(y)
    log_y = np.log(np.maximum(y, 1))

    # 构建促销后哑变量（滞后 1-post_window 周的平均）
    post_promo = np.zeros(n)
    for t in range(n):
        if promo_flags[t] == 1:
            for k in range(1, post_window + 1):
                if t + k < n:
                    post_promo[t + k] = 1

    # 构建设计矩阵
    cols = [np.ones(n), promo_flags, post_promo]
    if controls is not None:
        cols.append(controls)
    X = np.column_stack(cols)

    # OLS 回归
    beta = np.linalg.lstsq(X, log_y, rcond=None)[0]
    promo_lift = np.exp(beta[1]) - 1     # 促销期间的销量提升比例
    post_dip = np.exp(beta[2]) - 1       # 促销后洼地比例（负值）
    net_lift = promo_lift + post_dip      # 净增量

    # 分解各成分
    base = np.exp(beta[0])
    y_pred = np.exp(X @ beta)
    y_base = np.exp(beta[0] + (X[:, 2:] @ beta[2:] if controls is not None else np.zeros(n)))

    return {
        'gross_lift_pct': promo_lift * 100,
        'post_dip_pct': post_dip * 100,
        'net_lift_pct': net_lift * 100,
        'forward_buy_ratio': abs(post_dip) / (promo_lift + 1e-8),
        'base_demand': base,
        'y_pred': y_pred,
        'coefficients': beta
    }

# 测试：模拟 Prime Day 促销场景
np.random.seed(42)
n = 52
base = np.random.poisson(100, n).astype(float)

# 第 20 周 Prime Day：销量暴涨 5x
promo = np.zeros(n)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Causal Inference for Promotional Lift Decomposition with PostPromotion Dip》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：18 个月周度销量、促销标记（含时间窗口）、历史 5 次大促前后的数据；代码模板另可传入趋势与季节等控制变量，销量序列建议先做对数变换以保持稳定。

**输出**：促销净提升百分比、Forward Buy 比例、促销后洼地幅度与备货修正建议（卡页示例：真实净提升约 150% 而非表面 500%、Forward Buy 占峰值 55%、Q3 备货下调 25%）。

## 执行步骤

1. 汇总 18 个月周度销量、促销标记与历史 5 次大促前后数据
2. 构造促销期与促销后洼地哑变量并加入趋势、季节控制变量
3. 回归分解出促销净提升与促销后需求跌幅
4. 计算 Forward Buy 占促销峰值的比例
5. 按真实净提升修正备货与后续促销计划

## 边界与不做

- 何时不用：只有一两次促销记录、或周度销量历史不足时无法分解；只关心单场促销净增量而不关心促销后洼地时，用反事实评估更直接。
- 能力边界：只做提升分解与备货修正建议，不替代采购决策；结论依赖促销标记与促销后窗口（默认 3 周）设定，窗口选错会改变结果。
- 卡页数字（6 倍销量、净提升 150%、Forward Buy 占 55%、备货下调 25%、年化节省 20-30 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Promotional-Lift-Decomposition

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：03-时间序列　·　源卡：`Skill-Promotional-Lift-Decomposition`