---
name: "p2s-market-size-estimation"
title: "Skill-Market-Size-Estimation"
description: "触发词：市场规模、TAM/SAM/SOM、蒙特卡洛、搜索量校准、进入决策。何时不用：只需给多个品类做机会排序时用「品类机会评分引擎」；要判断品类处于生命周期哪个阶段用「Product Lifecycle Stage」。安全边界：结论必须带区间与置信说明，不得把点估计对外承诺；Trends 校准误差与锚点选择须一并披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 经营预测"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Market-Size-Estimation"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用自上而下和自下而上两条路径估算品类的 TAM/SAM/SOM，并把点估计扩成置信区间，避免把全球大市场乘以 1% 就当成自己的盘子。"
user_try: "试试：帮我估算 baby sterilizer 品类的 TAM/SAM/SOM，目标 ASP 定在 129-149 美元。"
whenToUse: "需要在选品决策前量化品类容量与可达上限、为 ROI 模型提供数字范围时用本技能；若只要品类之间的相对机会排序，用「品类机会评分引擎」；若判断的是进场时机，用「Product Lifecycle Stage」。"
workflow: "取 Google Trends 目标词与锚点词近 24 个月数据 → 用 G-TAB 方法把相对指数校准为绝对搜索量 → 自上而下与自下而上两条路径分别估算 TAM/SAM/SOM → 用 Monte Carlo 把点估计扩展为置信区间 → 输出进入或 SKIP 的决策建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Market-Size-Estimation

## ① 解决的问题

战略经理面临市场容量拍脑袋——Market Size将TAM误差30%压到12%，年化省22万元

## ② 核心算法逻辑

核心思想：在选品决策前量化「这个品类有多大、能拿多少」，避免「市场很大」的模糊判断。用两条互相校验的路径（Topdown 和 Bottomup）估算 TAM/SAM/SOM，并通过 Google Trends 校准和 Monte Carlo 模拟将点估计扩展为置信区间，输出可进入 ROI 模型的数字范围。

## ③ 业务应用场景

场景 A：baby sterilizer 品类进入前 TAM/SAM 完整估算
- 业务问题：考虑推出 UV-C 密闭消毒器，在做选品决策前需要知道这个品类的市场规模和自己的可达市场上限。 - 数据要求： - Google Trends 数据（目标词 + 锚点词，近 24 个月） - Google Keyword Planner 锚点词绝对搜索量 - Amazon 竞品 Top 20 的月度销量估算（JungleScout/Helium10） - 目标 ASP（$129-$149） - 预期产出： - 业务价值：SAM $28M-$45M 足够支撑多个品牌，SOM 目标合理，给出进入决策的量化基础
场景 B：新品类快速 TAM 扫描（SOP-A 选品支撑）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
防止进入太小市场：SAM < $10M 的品类，即使做到 10% 份额也只有 $1M/年，按 baby sterilizer 开发成本 $50K 估算，ROI 不达标。本 Skill 在选品阶段即输出 SKIP 决策，节省 3-6 个月开发+认证时间
防止过度乐观假设：Monte Carlo 把 TAM 点估计转为范围，避免"全球市场 $46B × 1% = $460M 可达"的常见错误（实际 SAM 仅 $30-45M）
与 Skill-Category-Compliance-Prescan 联用：真实 SOM = 估算 SOM - 认证成本 $25-45K，影响进入 ROI 约 15-30%
实施难度：⭐⭐☆☆☆（2/5）— 纯 NumPy，无需外部 API（GT 数据手动输入即可）
优先级评分：⭐⭐⭐⭐⭐（5/5）— WF-D 选品扫描前置输入，缺失则选品 ROI 计算缺乏市场规模基础

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（272 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/growth_model/market_size_estimation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Market-Size-Estimation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Market-Size-Estimation
基于 G-TAB (arXiv:2007.13861, EPFL) +
    Bass+GT 动态市场潜力 (Hu et al., Kent) +
    Monte Carlo 置信区间 (MDPI Applied Sciences 2023)
母婴跨境电商品类 TAM/SAM/SOM 估算工具
"""

import numpy as np
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class MarketSizeResult:
    category: str
    tam_low: float
    tam_mid: float
    tam_high: float
    sam_low: float
    sam_mid: float
    sam_high: float
    som_target: float
    monthly_search_low: int
    monthly_search_mid: int
    monthly_search_high: int
    peak_month_estimate: Optional[int]
    top_sensitive_params: list[str]
    confidence_note: str
    decision: str


# ── G-TAB 校准：GT 指数 → 绝对搜索量 ─────────────────────
def calibrate_gt_volume(
    target_gt_index: float,
    anchor_keyword_monthly_volume: int,
    anchor_gt_peak: float = 100.0,
    rounding_error_pct: float = 0.30,
) -> tuple[int, int, int]:
    """
    G-TAB 方法：将 GT 相对指数校准为绝对月搜索量。
    返回 (low, mid, high) 置信区间。

    arXiv:2007.13861, EPFL Data Science Lab
    calibrated_volume = GT_raw × (R_anchor / m_anchor)
    """
    mid = int(target_gt_index / anchor_gt_peak * anchor_keyword_monthly_volume)
    low = int(mid * (1 - rounding_error_pct))
    high = int(mid * (1 + rounding_error_pct))
    return low, mid, high


# ── Bass 扩散：动态渗透率曲线 ─────────────────────────────
def bass_diffusion_curve(
    market_potential: float,
    p: float = 0.03,
    q: float = 0.38,
    periods: int = 36,
) -> np.ndarray:
    """
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2007.13861。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：Google Trends 数据（目标词 + 锚点词，近 24 个月）、Google Keyword Planner 锚点词的绝对搜索量、Amazon 竞品 Top 20 的月度销量估算（JungleScout/Helium10），以及目标 ASP。

**输出**：TAM/SAM/SOM 的低中高区间、校准后的月搜索量区间与敏感参数、以及 SKIP / 进入的决策建议，作为选品 ROI 模型的市场规模输入。

## 执行步骤

1. 收集 Trends 与锚点词绝对搜索量数据
2. 用 G-TAB 把相对指数校准为绝对月搜索量
3. 用自上而下与自下而上两条路径估算 TAM/SAM/SOM
4. 用 Monte Carlo 输出置信区间与敏感参数
5. 给出进入或 SKIP 的决策建议

## 边界与不做

- 拿不到锚点词绝对搜索量或竞品销量估算时只能做方向性判断，不能输出可进入 ROI 的数字
- 输出的是市场规模区间，不含认证成本、供应链与利润核算，需与合规预筛结果联用修正 SOM
- Trends 校准误差与锚点选择必须随结论一并披露，不得把点估计当作承诺

## 技能关联

- **前置**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **延伸**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring
- **可组合**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Market-Size-Estimation

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：06-增长模型　·　源卡：`Skill-Market-Size-Estimation`