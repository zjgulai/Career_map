---
name: "p2s-variance-reduction-control-variates"
title: "Variance Reduction via Control Variates — 控制变量法降方差（MLRATE/RLMRT）"
description: "触发词：控制变量、MLRATE、CUPED 降方差、等效样本量、协变量调整、实验灵敏度。何时不用：没有可信的实验前协变量时不要用；只想算样本量、还没设计实验时用功效分析。安全边界：控制变量不可包含实验期数据以免污染估计，使用内部历史数据需先确认无隐私风险。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Variance-Reduction-Control-Variates"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用历史行为当控制变量压低指标方差，等于凭空放大样本量、缩短实验周期。"
user_try: "试试：我的 LTV 实验样本不够，能用过去 90 天的购买记录来降方差吗？"
whenToUse: "指标方差大、样本不足导致功效偏低且存在高质量实验前协变量时用本技能；没有协变量时先扩量或改用重尾鲁棒方法；只是规划样本量时用功效分析。"
workflow: "整理并对齐实验前协变量表 → 估计 theta 或训练 ML 调整模型 → 计算方差缩减后的调整指标 → 重新估计处理效应与标准误 → 输出等效样本量倍数与周期缩短结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Variance Reduction via Control Variates — 控制变量法降方差（MLRATE/RLMRT）

## ① 解决的问题

实验平台工程师面临"实验样本量不足导致检验功效过低错过真实效果"——控制变量降方差将等效样本量提升40-60%，年化减少实验等待时间节省机会成本15-30万元

## ② 核心算法逻辑

控制变量法（Control Variates） 是继 CUPED 之后更通用的降方差技术族群。核心思想：用与结果指标高度相关的已知协变量（控制变量），通过回归调整来吸收无处理效应的随机波动，从而在不增加样本量的前提下提升统计功效。

## ③ 业务应用场景

场景1：奶粉 SKU 新功能测试——用历史购买行为降方差 - 业务问题：奶粉订阅功能上线 AB 测试，30 日 LTV 指标方差极大（$50-$800），需样本量 10,000 才能达到功效，而平台每周新流量仅 3,000 - 数据要求：过去 90 天用户购买记录（频次、客单价、类别偏好）作为控制变量 - 预期产出：MLRATE 利用历史行为解释 60% 的 LTV 方差，等效样本量扩大 2.5×，实验期缩短 60%（从 10 周压缩到 4 周） - 业务价值：加速上线节省 6 周时间窗口，假设功能贡献月增收 5 万元，早上线价值约 7.5 万元
场景2：TikTok 广告素材 AB 测试 ROAS 降方差 - 业务问题：广告 ROAS 日间波动巨大（节假日/工作日差异 3×），导致实验结论不稳定 - 数据要求：过去 14 天各广告组 ROAS 日均值、曝光量、点击率 - 预期产出：使用历史 ROAS 作为控制变量，方差降低 45%，检验功效从 0.62 提升到 0.80 - 业务价值：广告优化决策置信度提升，减少错误素材迭代成本约 20%（约每月 3 万元）
**三轨验证**： - 成本：需要维护用户历史行为特征表，工程成本约 3 人天（与现有数据仓库对接） - 合规：使用内部历史数据，无隐私风险；控制变量不可包含实验期数据（污染风险） - 风险：ML 模型过拟合会导致调整偏差，需在训练集上交叉验证并限制模型复杂度

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：方差降低 50% 等效样本量翻倍，实验周期缩短 50%，按月 10 次实验计算每次节省 3 周×价值 5 万/周 = 月增益约 15 万元；减少因样本不足导致的错误决策成本约 20%
实施难度：⭐⭐⭐⭐☆（需维护用户特征表 + ML 推理流水线，工程成本中等）
优先级：⭐⭐⭐⭐⭐
评估依据：母婴电商用户行为强烈延续（购买习惯稳定），控制变量与 LTV 相关性天然高（ρ > 0.7），MLRATE 降方差效果优异；高频实验场景下投入产出比最优

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（187 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.linear_model import Ridge
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import cross_val_predict
from sklearn.preprocessing import StandardScaler
from dataclasses import dataclass

# ============================================================
# Variance Reduction via Control Variates (MLRATE / CUPED+)
# ============================================================

@dataclass
class TreatmentEffectEstimate:
    """处理效应估计结果"""
    method: str
    ate: float           # 平均处理效应
    std_err: float       # 标准误
    ci_lower: float
    ci_upper: float
    p_value: float
    variance_reduction_pct: float  # 相比原始指标的方差降低百分比
    is_significant: bool


def cuped_estimate(Y: np.ndarray, T: np.ndarray,
                    X_pre: np.ndarray, alpha: float = 0.05) -> TreatmentEffectEstimate:
    """
    CUPED：单变量控制变量法（X_pre 为 1D 实验前协变量）
    经典实现：Y_cuped = Y - theta * (X_pre - E[X_pre])
    """
    theta = np.cov(Y, X_pre)[0, 1] / np.var(X_pre)
    Y_cuped = Y - theta * (X_pre - np.mean(X_pre))

    Y_ctrl = Y_cuped[T == 0]
    Y_trt = Y_cuped[T == 1]

    t_stat, p_val = stats.ttest_ind(Y_trt, Y_ctrl)
    ate = np.mean(Y_trt) - np.mean(Y_ctrl)
    se = np.std(Y_cuped) * np.sqrt(1/len(Y_ctrl) + 1/len(Y_trt))
    var_reduction = (1 - np.var(Y_cuped) / np.var(Y)) * 100

    return TreatmentEffectEstimate(
        method="CUPED",
        ate=round(ate, 4),
        std_err=round(se, 4),
        ci_lower=round(ate - 1.96 * se, 4),
        ci_upper=round(ate + 1.96 * se, 4),
        p_value=round(p_val, 4),
        variance_reduction_pct=round(var_reduction, 1),
        is_significant=p_val < alpha
    )


def mlrate_estimate(Y: np.ndarray, T: np.ndarray,
                     X_pre: np.ndarray, alpha: float = 0.05,
                     model_type: str = "gbm") -> TreatmentEffectEstimate:
    """
    MLRATE：机器学习回归调整
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验前若干周期的用户历史行为特征（购买频次、客单价、类别偏好、历史 ROAS 等）作为控制变量，以及实验期的处理标记与结果指标；协变量表需与实验群体一一对应。

**输出**：处理效应估计、标准误、相比原始指标的方差降低百分比与等效样本量倍数；供实验平台工程师判断能否缩短实验周期。

## 执行步骤

1. 对齐实验前协变量表与实验期指标
2. 用 CUPED 估计 theta，或用 MLRATE 训练回归调整模型
3. 计算调整后指标与方差降低幅度
4. 重新估计处理效应与标准误
5. 输出等效样本量倍数与周期缩短建议

## 边界与不做

- 何时不用：没有任何可信的实验前协变量时不要用；样本瓶颈无法靠降方差解决时应先扩量。
- 能力边界：本技能产出调整后的估计与方差缩减量，不改变随机化与分流设计。
- 数据边界：控制变量不得包含实验期数据，模型复杂度需受控并通过交叉验证避免过拟合偏差。

## 技能关联

- **可组合**：Skill-Variance-Reduction-Control-Variates

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Variance-Reduction-Control-Variates`