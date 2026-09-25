---
name: "p2s-long-term-holdout-group"
title: "长期保留组设计 — 防止新奇效应污染实验结论"
description: "触发词：长期保留组、新奇效应、学习效应、衰减曲线、长期ATE。何时不用：短期指标已能代表长期价值的功能不必设保留组；采用永久对照跨迭代评估的口径请对照「长期保留组设计」条目。安全边界：需在用户协议中说明实验性质与保留组安排，满足用户告知权要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Long-Term-Holdout-Group"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "留一小撮用户长期不给新功能，用他们的数据判断效果是真的，还是只有头几周虚高。"
user_try: "试试：智能补货提醒实验复购涨了 12%，我怀疑是新奇效应，帮我设计一个 5% 长期保留组验证。"
whenToUse: "当功能效果可能随时间衰减（新奇效应）或反而递增（学习效应），需要跨数周甚至数月判断长期真实效果时用；短期指标已能代表长期价值的功能不必设保留组。"
workflow: "划出永久保留组并确保与实验组工程隔离 → 连续多周采集保留组与实验组的复购或转化指标 → 按周计算处理效应与置信区间 → 用早期与晚期 ATE 比较识别新奇效应或学习效应 → 按衰减系数判定长期稳定 ATE 并给出是否全量的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 长期保留组设计 — 防止新奇效应污染实验结论

## ① 解决的问题

实验平台工程师面临"AB实验结束后用户学习效应导致长期效果被高估"——长期保留组设计将长期效果估计偏差降低50%，年化提升实验决策长期有效性减少错误迭代成本15-30万元

## ② 核心算法逻辑

新奇效应（Novelty Effect） 指用户对新功能/设计的短期过度反应，导致实验前期指标虚高，而长期指标回归基线甚至低于基线（习惯化效应）。学习效应（Learning Effect）则相反：有些功能（如推荐算法）随使用时间延长效果递增，短期实验严重低估长期收益。

## ③ 业务应用场景

场景1：婴儿护肤订阅推送功能 — 检测新奇 vs 长期复购效果 - 业务问题：新的"智能补货提醒"功能在 2 周实验中复购率 +12%，产品团队怀疑是新奇效应 - 数据要求：实验组（全量）+ 5% 永久保留组，连续 16 周复购率数据 - 方法：每周计算 $\hat{\tau}$ 衰减曲线，在第 12 周评估长期稳定 ATE - 预期产出：若 Decay = 0.2（轻微），长期 ATE ≈ +10%，功能价值确认；若 Decay > 0.5，需重新评估 - 业务价值：避免基于虚高短期数据做出错误全量推送决策，防止透支用户注意力，长期复购保护价值约 50 万元/年
场景2：推荐算法迭代 — 捕捉学习效应 - 业务问题：新推荐算法 2 周实验 ATE = +2% CVR，但算法依赖用户行为学习，怀疑长期更优 - 数据要求：5% 保留组持续 8 周 - 方法：追踪 ATE 时序变化，若 ATE 第 6 周 > 第 2 周，确认学习效应（反新奇） - 预期产出：第 8 周 ATE 增长至 +5% CVR，长期价值被正确评估 - 业务价值：正确衡量推荐系统长期价值，支撑更大资源投入决策，潜在 GMV 贡献 +80 万元/年
**三轨验证**： - 成本：需工程隔离保留组（防 cookie 泄漏/跨设备识别），开发成本约 5-10 人天 - 合规：保留组用户未享受新功能（需在用户协议中说明实验性质，GDPR 要求告知权） - 风险：保留组污染（用户多设备登录、推荐内容渗透）会导致估计偏低，需定期污染检测

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：防止新奇效应导致的错误全量决策，单次避损约 10-50 万元；正确识别学习效应可支撑算法迭代投入决策，潜在 GMV 贡献 100 万元/年
实施难度：⭐⭐⭐⭐☆（工程隔离保留组有一定复杂度，需防止跨设备污染）
优先级：⭐⭐⭐⭐☆（推荐算法、UI 大改版、订阅功能等场景必用）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
长期保留组设计 — 新奇效应 / 学习效应检测与长期 ATE 估计
依赖：pip install numpy pandas scipy statsmodels matplotlib
"""
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass
from typing import Optional


@dataclass
class WeeklyATE:
    week: int
    ate: float
    ci_lower: float
    ci_upper: float
    p_value: float
    n_treatment: int
    n_holdout: int


def estimate_weekly_ate(
    df: pd.DataFrame,
    week: int,
    metric_col: str = "metric",
    group_col: str = "group",
) -> WeeklyATE:
    """计算某周的 treatment vs holdout ATE"""
    week_df = df[df["week"] == week]
    trt = week_df[week_df[group_col] == "treatment"][metric_col].values
    hld = week_df[week_df[group_col] == "holdout"][metric_col].values

    t_stat, p_val = stats.ttest_ind(trt, hld)
    ate = np.mean(trt) - np.mean(hld)
    se = np.sqrt(np.var(trt) / len(trt) + np.var(hld) / len(hld))

    return WeeklyATE(
        week=week,
        ate=round(ate, 5),
        ci_lower=round(ate - 1.96 * se, 5),
        ci_upper=round(ate + 1.96 * se, 5),
        p_value=round(p_val, 4),
        n_treatment=len(trt),
        n_holdout=len(hld),
    )


def detect_novelty_effect(
    weekly_ates: list[WeeklyATE],
    early_weeks: int = 2,
    late_weeks_start: int = 8,
) -> dict:
    """
    检测新奇效应或学习效应。
    早期 ATE vs 晚期 ATE 的变化方向决定效应类型。
    """
    early_ate = np.mean([w.ate for w in weekly_ates if w.week <= early_weeks])
    late_ate = np.mean([w.ate for w in weekly_ates if w.week >= late_weeks_start])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验组（全量）与保留组的连续多周指标数据（卡页示例：5% 永久保留组、连续 16 周复购率；推荐算法场景为 5% 保留组持续 8 周），以及按周计算处理效应所需的样本量信息。

**输出**：每周 ATE 与置信区间序列、衰减系数判定与长期稳定 ATE 估计（卡页示例：衰减系数 0.2 时长期 ATE 约 +10%；衰减系数大于 0.5 需重新评估），以及是否全量推送的建议。

## 执行步骤

1. 划出永久保留组（卡页示例 5%）并确保与实验组工程隔离
2. 连续多周采集保留组与实验组的复购或转化指标
3. 按周计算处理效应与置信区间
4. 用早期与晚期 ATE 比较，识别新奇效应或学习效应
5. 按衰减系数判定长期稳定 ATE 并给出是否全量的建议

## 边界与不做

- 何时不用：短期指标已能代表长期价值的功能不必设保留组；若采用永久对照组、跨多次迭代评估长期效果的口径，请对照「长期保留组设计」条目选用。
- 能力边界：保留组需工程隔离（防 cookie 泄漏与跨设备识别），保留组污染会导致估计偏低，需定期做污染检测；本技能只做检测与估计，不改变分流实现。
- 合规边界：需在用户协议中说明实验性质与保留组安排，满足用户告知权要求。
- 卡页数字（5% 保留组、16 周、衰减系数 0.2 与 0.5、长期 ATE 约 +10%、年化 15-30 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Long-Term-Holdout-Group

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Long-Term-Holdout-Group`