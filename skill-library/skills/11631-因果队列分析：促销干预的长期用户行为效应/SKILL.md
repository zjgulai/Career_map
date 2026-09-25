---
name: "p2s-causal-cohort-analysis"
title: "Causal Cohort Analysis — 因果队列分析：促销干预的长期用户行为效应"
description: "触发词：因果队列、平行趋势检验、动态效应、长期留存、促销反噬识别。何时不用：只看干预后短窗口的增效用合成控制或时序因果技能，判断渠道归因份额用因果归因类技能，本技能追踪促销对长期用户价值的动态效应。安全边界：队列划分与对照选择须有业务依据并留档，不得为得到预期结论挑选用例，涉用户数据须在授权范围内使用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Causal-Cohort-Analysis"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "看促销拉来的用户半年后还在不在，别把短期 GMV 当成真增长。"
user_try: "试试：用双重差分评估买三送一对 6 个月 LTV 的因果效应，并画出逐月效应衰减曲线。"
whenToUse: "促销或干预上线后需要追踪半年级别的长期用户价值效应、并检验对照组是否可比时用本技能；只看干预后短窗口的增效用合成控制或时序因果技能，渠道归因份额用因果归因类技能。"
workflow: "划分处理队列与对照队列 → 做平行趋势检验 → 用双重差分估计平均效应 → 按月分解动态效应 → 识别受促销反噬的老用户"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Causal Cohort Analysis — 因果队列分析：促销干预的长期用户行为效应

## ① 解决的问题

增长经理面临留存变化找不到真因——因果队列将误判率从28%降到9%，年化增收18万元

## ② 核心算法逻辑

核心问题：传统队列分析的混淆陷阱

## ③ 业务应用场景

业务问题：平台推出"购买3件免费送1件"促销，GMV 短期上涨 22%。但运营团队对 6 个月后的真实 LTV 效果存疑：这批用户是真的因为促销被激活了，还是本来就会复购的高价值用户？
应用流程： 1. 队列划分：将2025年10月接受促销的用户定为处理队列，选择2025年9月（同期购买但未接受促销）作为对照队列 2. 结果变量：月度 LTV（月均消费金额），追踪促销后6个月 3. 平行趋势检验：检查两个队列在2025年7-9月的 LTV 趋势是否平行 4. DiD 估计：计算 ATT，按月分解动态效应
预期产出： - 真实因果效应：ATT ≈ 促销使 6 月 LTV 提升 12%（而非表观的 22%） - 动态效应图：第1月效应最强（+28%），第6月衰减至+8% - 识别 sleeping dogs：约 15% 的高价值老用户接受促销后 LTV 反而下降（价格锚点降低）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处：纯 Python 实现，无外部依赖；DiD 逻辑清晰
难处：平行趋势假设验证需要业务判断；小样本 SCM 权重求解需调参
前提：至少 2 个月的干预前历史数据；对照组选择需业务知识

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（362 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/causal_inference/causal_cohort_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Causal-Cohort-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Causal Cohort Analysis — 因果队列分析
用 DiD + Synthetic Control 评估促销干预对长期 LTV/留存的因果效应

纯 Python 标准库 + math/statistics，无 sklearn/pandas 依赖
Python 3.14 兼容
"""
from __future__ import annotations

import math
import statistics
from dataclasses import dataclass, field


# ─── 数据结构 ────────────────────────────────────────────────────────────────

@dataclass
class CohortRecord:
    """单个用户的队列观测记录"""
    user_id: str
    cohort_month: str          # e.g. "2025-10"
    treated: bool              # 是否接受促销干预
    pre_metric: float          # 干预前指标（如月均 LTV）
    post_metrics: list[float]  # 干预后各月指标，post_metrics[0]=第1月，依此类推


@dataclass
class ATTResult:
    """ATT 估计结果"""
    period: int                # 干预后第几个月
    att: float                 # Average Treatment Effect on the Treated
    se: float                  # 标准误（Bootstrap 估计）
    ci_lower: float
    ci_upper: float
    n_treated: int
    n_control: int


# ─── DiD 队列分析器 ──────────────────────────────────────────────────────────

class DiDCohortAnalyzer:
    """
    双重差分因果队列分析器

    假设：平行趋势（pre-period 趋势相同）
    估计量：ATT = E[Y(1) - Y(0) | Treated=1]
    """

    def __init__(self, n_bootstrap: int = 200, alpha: float = 0.05):
        self.n_bootstrap = n_bootstrap
        self.alpha = alpha
        self._treated: list[CohortRecord] = []
        self._control: list[CohortRecord] = []
        self._n_periods: int = 0

    def fit(self, records: list[CohortRecord]) -> "DiDCohortAnalyzer":
        """加载数据，分离处理组/对照组"""
        self._treated = [r for r in records if r.treated]
        self._control = [r for r in records if not r.treated]
        if not self._treated or not self._control:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：按队列组织的用户观测记录，含用户、队列月份、是否接受干预、干预前指标与干预后逐月指标；卡页前提是至少 2 个月的干预前历史数据。

**输出**：干预的平均处理效应估计与逐月动态效应曲线、平行趋势检验结论、长期价值反而下降的老用户占比；卡页案例中促销对 6 个月 LTV 的真实效应为提升 12%（表观为 22%），约 15% 高价值老用户 LTV 下降。

## 执行步骤

1. 划分处理队列与同期对照队列，明确干预时点。
2. 做平行趋势检验，确认两组干预前走势可比。
3. 用双重差分估计平均处理效应。
4. 按月分解动态效应，观察衰减曲线。
5. 识别接受促销后长期价值反而下降的老用户。

## 边界与不做

- 干预前历史不足（卡页口径至少 2 个月）、或两组平行趋势不成立时不要用，双重差分的前提被破坏。
- 能力边界：平行趋势假设需要业务判断，小样本下合成控制权重求解需调参；本技能给出效应估计，不替代促销方案设计；卡页的误判率下降与增收为特定口径。
- 合规红线：队列划分与对照选择须有业务依据并留档，不得为了得到预期结论挑选用例，涉用户数据须在授权范围内使用。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences
- **延伸**：Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-User-Lifecycle-STAN.html、Skill-User-Lifecycle-STAN
- **可组合**：Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Causal-Cohort-Analysis

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Cohort-Analysis`