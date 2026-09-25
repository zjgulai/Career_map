---
name: "p2s-ssbc-small-sample-conformal"
title: "小样本Beta修正共形预测 - 50个样本也能保证覆盖"
description: "触发词：小样本校准、共形预测、覆盖保证、区间可信度、预算决策置信。何时不用：要做的是把推荐结果讲清楚（可解释推荐）而不是给区间覆盖保证时用「可解释推荐」。安全边界：只保证区间覆盖概率，不提升底层模型精度，也不作因果断言。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-072"
l3_business: "市场进入"
l3_all: "市场进入 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/市场进入"
p2s_card_id: "Skill-SSBC-Small-Sample-Conformal"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "样本只有几十条时，也能给出一个真正可信的预测区间，让预算决策不再靠碰运气。"
user_try: "试试：日本站只有 50 条带标签转化数据，帮我校准一个以 95% 概率覆盖 95% 的预测区间。"
whenToUse: "当新市场校准样本很小、标准共形预测的名义覆盖率不可信（实际可能远低于目标）时用本技能；若要做的是推荐结果解释而非区间覆盖保证，用「可解释推荐」。"
workflow: "收集小样本校准集（卡页示例 50 条） → 计算共形分数（残差或区间宽度） → 用 Beta 反推调整后的显著性水平 → 构建预测区间并判断可行性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 小样本Beta修正共形预测 - 50个样本也能保证覆盖

## ① 解决的问题

业务问题：日本市场刚上线，只收集了50条带标签的转化数据做校准

## ② 核心算法逻辑

标准 Split Conformal Prediction 的覆盖保证是"期望意义"的——跨多次校准集随机抽取，平均覆盖率为 1α，但单次校准的覆盖率可能远低于目标值。实验表明：当校准集 n=50 时，目标覆盖率 90% 的标准共形预测，实际违约率高达 ~40%（即 40% 的概率实际覆盖 < 90%）。

## ③ 业务应用场景

业务问题：日本市场刚上线，只收集了50条带标签的转化数据做校准。标准共形预测名义 95% 覆盖率，但实际可能只有 82%——基于此做预算决策犹如"碰运气"。SSBC 修正后保证以 95% 概率实际覆盖 ≥ 95%，做预算决策时心里有底。
数据要求： - 小样本校准集（n ≥ 20 即可用，n ≥ 50 效果稳定） - 任意共形分数（绝对残差、预测区间宽度等均可） - 需指定目标覆盖率 `1-α_target` 和置信参数 `1-δ`
预期产出： - 调整后的 `α_adj`（比 `α_target` 更严格的显著性水平） - 基于 `α_adj` 构建的共形预测集/区间 - 可行性判断（n 是否足够达到 (α, δ) 目标）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

现状痛点：日本市场校准集仅 50 条数据，标准共形预测 40% 概率实际覆盖 < 90%
SSBC 收益：将违约率从 ~40% 降至 ~10%（与目标 δ 对齐），预算决策信心大幅提升
量化价值：避免每月 1-2 次"基于不可信区间"的错误决策，每次预估损失 3-10 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（720 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/causal_inference/ssbc_small_sample_conformal` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-SSBC-Small-Sample-Conformal.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SSBC (Small Sample Beta Correction) - 小样本共形预测精确覆盖保证
论文: arXiv:2509.15349 (2025)
场景: 母婴出海新市场小样本校准集下的 PAC 覆盖保证

依赖: numpy, scipy, pandas
"""

import numpy as np
import pandas as pd
from scipy import stats
from scipy.special import betaln
import warnings
warnings.filterwarnings('ignore')


# ==================== SSBC 核心算法 ====================

class SSBC:
    """
    Small Sample Beta Correction (SSBC)
    
    将标准 Split Conformal Prediction 的期望覆盖保证
    升级为 PAC (Probably Approximately Correct) 覆盖保证：
    
        Pr(coverage >= 1-α_target) >= 1-δ
    
    即插即用：不改变模型或共形分数，只调整显著性水平 α_adj。
    """
    
    def __init__(self, alpha_target: float, delta: float, n_cal: int, 
                 m_test: int = None):
        """
        Args:
            alpha_target: 目标名义显著性水平（如 0.05 表示 95% 覆盖率）
            delta: 风险容忍度——以概率 1-delta 保证覆盖（如 0.05）
            n_cal: 校准集大小
            m_test: 测试集大小（None 表示无穷，即 Beta 分布；给定时用 Beta-Binomial）
        """
        self.alpha_target = alpha_target
        self.delta = delta
        self.n_cal = n_cal
        self.m_test = m_test
        self.alpha_adj = None
        self.feasible = False
        self._grid = None
    
    def _coverage_prob(self, alpha_prime: float) -> float:
        """
        计算 Pr(C(α') >= 1-α_target)
        
        使用 Beta（无穷测试集）或 Beta-Binomial（有限测试集）
        """
        n = self.n_cal
        k = int(np.ceil((1 - alpha_prime) * (n + 1)))
        k = max(1, min(k, n))  # 边界约束
        
        a = k        # Beta 参数 a
        b = n + 1 - k  # Beta 参数 b
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.15349 — Probabilistic Conformal Coverage Guarantees in Small-Data Settings

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：小样本校准集（卡页 n≥20 可用、n≥50 稳定）的预测值与真实标签、任一共形分数（绝对残差、预测区间宽度等）、目标覆盖率 1-α_target 与置信参数 1-δ；粒度为 样本。

**输出**：调整后的显著性水平 α_adj、基于 α_adj 构建的共形预测集/区间，以及样本量是否够达到 (α, δ) 目标的可行性判断；供市场团队的预算与投放决策参考。

## 执行步骤

1. 收集小样本校准集（卡页示例为日本站 50 条带标签转化数据）
2. 计算用于共形的分数（绝对残差或区间宽度）
3. 用 Beta / Beta-Binomial 反推满足 PAC 保证的调整后 α_adj
4. 基于 α_adj 构建预测集或区间并判断可行性
5. 把带覆盖保证的区间交给预算决策使用

## 边界与不做

- 数据不满足：校准样本少于卡页下限（n<20）时给不出可靠保证，先攒样本。
- 何时不用：要做的是把推荐结果讲清楚（可解释推荐）而不是给区间覆盖保证，用「可解释推荐」。
- 能力边界：只保证区间覆盖概率，不提升底层模型精度，也不对业务因果作断言；卡页的违约率 ~40%→~10%、每次错误决策预估损失 3-10 万为案例口径。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-EPICSCORE-Uncertainty.html、Skill-EPICSCORE-Uncertainty
- **延伸**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits
- **可组合**：Skill-BCCB-Causal-Bandits.html、Skill-BCCB-Causal-Bandits、Skill-SSBC-Small-Sample-Conformal

---

> 分类：业务运营/渠道经营/市场进入　·　技术族：01-因果推断　·　源卡：`Skill-SSBC-Small-Sample-Conformal`