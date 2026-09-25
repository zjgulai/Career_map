---
name: "p2s-experiment-sensitivity-robustness"
title: "Experiment Sensitivity & Robustness — 实验结果鲁棒性检验（Winsorization/截尾）"
description: "触发词：鲁棒性检验、Winsorization、截断均值、极端值、重尾分布。何时不用：指标分布规整、无B2B混批与机器人流量时无需截尾。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Experiment-Sensitivity-Robustness"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "实验结论被几笔超大订单或异常流量带偏时，用截尾处理把真实提升还原出来，别照虚高数字放量。"
user_try: "试试：实验组收入涨了 35% 但有几笔 B2B 大单，帮我做鲁棒性检验看真实提升是多少。"
whenToUse: "当实验指标为重尾分布（收入、客单价、LTV），存在 B2B 混批采购、超大订单或机器人流量时用；指标分布规整、无极端值时不必额外处理。"
workflow: "取订单级或用户级结果数据并计算实验前分布百分位 → 按 P95、P99 等百分位对两组数据做 Winsorize 处理 → 计算截断均值与校正后的提升幅度、p 值与显著性 → 生成多百分位敏感性矩阵，标记极端值驱动或鲁棒显著 → 用稳健后的结论决定放量、停止或继续观察"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Experiment Sensitivity & Robustness — 实验结果鲁棒性检验（Winsorization/截尾）

## ① 解决的问题

数据科学家面临"实验结果被极端值和机器人流量污染导致结论不可靠"——鲁棒性检验将实验结论稳定性提升60%，年化降低因不稳健决策造成的损失25-45万元

## ② 核心算法逻辑

电商 AB 实验中，收入/客单价等指标往往服从重尾分布（HeavyTailed Distribution）——少数超高客单订单能显著拉高均值，导致实验结论对极端值高度敏感。Winsorization（截尾处理） 和 Trimmed Mean（截断均值） 是解决该问题的主流工业方法。

## ③ 业务应用场景

场景1：婴儿车高客单 Listing 促销 AB 检验 - 业务问题：婴儿车客单价 $300-$800 区间，单笔超大订单（B2B 采购 $5,000）导致处理组收入均值虚高 35%，实验结论不可信 - 数据要求：订单级 GMV 数据，实验前记录分布百分位（P95/P99） - 预期产出：Winsorize 后剔除 B2B 噪声，真实散客转化提升从 "35%" 还原到实际 "8%"，避免错误放量 - 业务价值：防止错误决策带来的 Listing 优化成本浪费约 2 万元/次
场景2：奶粉订阅制复购 AB 实验结果核验 - 业务问题：新订阅优惠实验中，少数用户一次性订阅 24 罐（12 个月），拉高 LTV 均值，结论夸大真实效果 - 数据要求：用户 30 日 LTV，样本量 ≥ 2,000/组 - 预期产出：多百分位敏感性矩阵，自动标记「极端值驱动」或「鲁棒显著」 - 业务价值：识别出真实 LTV 提升 12%（而非表面的 31%），更准确的 CAC 核算节省无效投放约 15%
**三轨验证**： - 成本：纯数据处理，工程成本低；分析约 0.5 人天 - 合规：数据加工属于内部分析，无平台风险 - 风险：截尾比例过高会削弱功效（Type II 误差增加），需与统计功效平衡

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：每次实验防止错误放量/停止决策，避免无效优化成本或错失营收约 2-5 万元；大促期间鲁棒性校验阻止错误促销策略放量，价值量级更大
实施难度：⭐⭐☆☆☆（纯数据处理层，无需工程改造，现有实验平台可直接集成）
优先级：⭐⭐⭐⭐☆
评估依据：母婴跨境电商天然存在 B2B 混批采购和异常流量，极端值污染是高频问题；该技术实施成本极低而决策保险价值高

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（158 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass

# ============================================================
# Experiment Sensitivity & Robustness: Winsorization + Sensitivity
# ============================================================

@dataclass
class RobustnessReport:
    """鲁棒性检验报告"""
    method: str
    winsor_pct: float
    n_ctrl: int
    n_trt: int
    mean_ctrl: float
    mean_trt: float
    lift_pct: float
    p_value: float
    is_significant: bool
    conclusion: str


def winsorize(arr: np.ndarray, lower_pct: float, upper_pct: float) -> np.ndarray:
    """Winsorization：将超出百分位范围的值替换为边界值"""
    lower = np.percentile(arr, lower_pct * 100)
    upper = np.percentile(arr, upper_pct * 100)
    return np.clip(arr, lower, upper)


def trimmed_mean_test(ctrl: np.ndarray, trt: np.ndarray,
                      trim_pct: float = 0.05, alpha: float = 0.05) -> dict:
    """
    截断均值双样本检验
    trim_pct: 两端各截去的比例
    """
    n_ctrl = len(ctrl)
    n_trt = len(trt)
    k_ctrl = int(np.floor(trim_pct * n_ctrl))
    k_trt = int(np.floor(trim_pct * n_trt))

    ctrl_sorted = np.sort(ctrl)
    trt_sorted = np.sort(trt)

    ctrl_trimmed = ctrl_sorted[k_ctrl: n_ctrl - k_ctrl]
    trt_trimmed = trt_sorted[k_trt: n_trt - k_trt]

    t_stat, p_val = stats.ttest_ind(ctrl_trimmed, trt_trimmed)
    return {
        "trim_pct": trim_pct,
        "mean_ctrl": float(np.mean(ctrl_trimmed)),
        "mean_trt": float(np.mean(trt_trimmed)),
        "t_stat": float(t_stat),
        "p_value": float(p_val),
        "is_significant": p_val < alpha
    }


def sensitivity_analysis(ctrl_raw: np.ndarray, trt_raw: np.ndarray,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：订单级或用户级 GMV、客单价、30 日 LTV 等结果数据（卡页示例样本量 ≥ 2,000/组）+ 实验前记录的分布百分位（P95/P99），用于确定截尾比例。

**输出**：鲁棒性检验报告（截尾比例、两组均值、提升幅度、p 值与是否显著）与多百分位敏感性矩阵（卡页示例：真实散客转化提升从表面 35% 还原为 8%；LTV 从表面 31% 还原为 12%），供放量或停止决策使用。

## 执行步骤

1. 取订单级或用户级结果数据并计算实验前分布百分位
2. 按 P95、P99 等百分位对两组数据做 Winsorize 处理
3. 计算截断均值与校正后的提升幅度、p 值及显著性
4. 生成多百分位敏感性矩阵，标记极端值驱动或鲁棒显著
5. 用稳健后的结论决定放量、停止或继续观察

## 边界与不做

- 何时不用：指标分布规整、不存在 B2B 混批与机器人流量时无需额外做截尾；若极端值本身正是业务要研究的对象（如大客户行为），截尾会掩盖信号。
- 能力边界：截尾比例过高会削弱统计功效、增加 Type II 误差，需与统计功效平衡；本技能只做结论稳健性检验，不重新设计实验。
- 卡页数字（表面 35% 还原为 8%、表面 31% 还原为 12%、样本 ≥ 2,000/组、年化 25-45 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Experiment-Sensitivity-Robustness

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Experiment-Sensitivity-Robustness`