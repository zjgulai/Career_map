---
name: "p2s-empirical-bayes-multiple-testing"
title: "Empirical Bayes for Multiple Testing — 多重检验的经验贝叶斯校正（eBH/qvalue）"
description: "触发词：多重检验、FDR、qvalue、假阳性、批量实验。何时不用：只检验单个指标、或指标数很少且相互独立时不必做多重校正。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Empirical-Bayes-Multiple-Testing"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一次实验看好几十个指标时，把必然出现的假显著挑出来，别照着噪声去做优化和调价。"
user_try: "试试：618 实验同时看了 15 个指标，帮我做多重检验校正，看哪些才是真显著的。"
whenToUse: "当一次实验同时监控多个指标、或同时批量测试上百个 SKU，需要把假阳性压住时用；只检验单个指标时不必校正。"
workflow: "收集同一批实验或同一实验全部指标的 p 值 → 估计原假设为真的比例并计算 q-value → 用 BH 或经验贝叶斯方法把错误发现率控制在目标水平 → 比较原始、Bonferroni、BH 与 q-value 四种结论 → 输出可据以决策的显著指标或 SKU 清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Empirical Bayes for Multiple Testing — 多重检验的经验贝叶斯校正（eBH/qvalue）

## ① 解决的问题

数据分析师面临"同时测试50+指标导致大量虚假阳性决策"——经验贝叶斯多重检验将错误发现率从22%降至4%，年化避免基于噪声的错误决策损失30-60万元

## ② 核心算法逻辑

当同时进行多个 AB 实验或同一实验检验多个指标时，多重检验问题（Multiple Testing Problem） 会使假阳性率（Type I Error）急剧膨胀。若同时检验 100 个指标，即使全部无效，期望也有 5 个"显著"结果（α=0.05 时）。

## ③ 业务应用场景

场景1：大促活动多指标 AB 实验综合检验 - 业务问题：一次 618 大促实验同时监控 15 个指标（CTR/CVR/AOV/复购率/退款率/etc），若每个指标 α=0.05，期望假阳性 0.75 个，导致虚假"胜利"决策 - 数据要求：所有指标的 p 值列表（15 个），样本量 ≥ 5,000/组 - 预期产出：BH 校正后，真实显著指标从"8个"缩减为"5个"，避免 3 个虚假正向优化方向 - 业务价值：防止基于假阳性决策做错误优化，避免投入约 5 万元无效改版成本
场景2：ArXiv 选品信号批量 AB 测试（100+ SKU 同测） - 业务问题：同时对 120 个 SKU 做定价调整实验，若 α=0.05，预期 6 个 SKU 虚假"显著提升"，导致错误上调价格 - 数据要求：120 个 SKU 的 t 检验 p 值，需 eBH 控制 FDR ≤ 5% - 预期产出：q-value 分析识别出真实显著的 18 个 SKU（而非原始的 24 个），精准定价调整 - 业务价值：防止 6 个 SKU 错误调价，月均避免定价损失约 2 万元
**三轨验证**： - 成本：纯统计分析，无工程成本；Python statsmodels/pingouin 自带 BH 实现 - 合规：内部分析，无平台风险 - 风险：FDR 控制不代表每个声明显著的结果都为真（仍有约 5% 假阳性），重要决策需后验验证

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：防止大促实验假阳性驱动错误优化决策，每次避免约 2-5 万元无效改版成本；批量 SKU 定价实验精准化，月均减少定价损失约 2-4 万元
实施难度：⭐⭐☆☆☆（纯统计实现，statsmodels 一行代码；关键是业务理解和流程规范化）
优先级：⭐⭐⭐⭐⭐
评估依据：母婴大促期间高频多指标监控是标配需求，不做多重校正等于在"捡显著"；实施成本极低而质量保障价值高，是所有实验团队必须具备的基础能力

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from statsmodels.stats.multitest import multipletests

# ============================================================
# Empirical Bayes Multiple Testing Correction (BH / q-value)
# ============================================================

def compute_q_values(p_values: np.ndarray,
                      lambda_range: np.ndarray = None) -> np.ndarray:
    """
    Storey's q-value：经验贝叶斯 FDR 估计
    1. 估计 pi0（原假设为真的比例）
    2. q_i = pi0 * m * p_i / rank(p_i)
    """
    m = len(p_values)
    if lambda_range is None:
        lambda_range = np.arange(0.05, 0.95, 0.05)

    # 估计 pi0：对每个 lambda，pi0(lambda) = #{p > lambda} / (m * (1-lambda))
    pi0_estimates = []
    for lam in lambda_range:
        pi0_l = np.sum(p_values > lam) / (m * (1 - lam))
        pi0_estimates.append(pi0_l)

    # 取最保守（最大）稳定估计（简化版，完整版用 spline 拟合）
    pi0 = min(1.0, np.percentile(pi0_estimates, 25))

    # BH 步骤
    p_sorted_idx = np.argsort(p_values)
    p_sorted = p_values[p_sorted_idx]
    ranks = np.arange(1, m + 1)

    # q_i = pi0 * m * p_{(i)} / i，并单调性调整
    q_sorted = pi0 * m * p_sorted / ranks

    # 单调性保证：从右向左累积最小值
    q_monotone = np.minimum.accumulate(q_sorted[::-1])[::-1]
    q_monotone = np.clip(q_monotone, 0, 1)

    # 恢复原始顺序
    q_values = np.empty(m)
    q_values[p_sorted_idx] = q_monotone

    return q_values, pi0


def multiple_testing_report(test_names: list[str],
                              p_values: list[float],
                              alpha: float = 0.05) -> pd.DataFrame:
    """
    综合多重检验校正报告
    比较：原始 / Bonferroni / BH / q-value 四种结论
    """
    p_arr = np.array(p_values)
    m = len(p_arr)

    # Bonferroni
    bonf_reject, bonf_p, _, _ = multipletests(p_arr, alpha=alpha, method="bonferroni")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：所有被检验指标的 p 值列表（卡页示例 15 个指标、或 120 个 SKU 的 t 检验 p 值）+ 每组样本量（卡页示例 ≥ 5,000/组）+ 目标错误发现率水平（示例 ≤ 5%）。

**输出**：校正后的显著指标或 SKU 清单（卡页示例：BH 校正后真实显著指标从 8 个缩减为 5 个；q-value 分析从 24 个 SKU 中识别出真实显著的 18 个），以及原始、Bonferroni、BH、q-value 四种口径的对比报告。

## 执行步骤

1. 收集同一批实验或同一实验全部指标的 p 值
2. 估计原假设为真的比例并计算 q-value
3. 用 BH 或经验贝叶斯方法把错误发现率控制在目标水平
4. 比较原始、Bonferroni、BH 与 q-value 四种结论
5. 输出可据以决策的显著指标或 SKU 清单

## 边界与不做

- 何时不用：只检验单个指标时不必做多重校正；指标数很少且相互独立时，校正带来的收益有限。
- 能力边界：控制错误发现率不等于每个显著结果都为真（卡页指出仍有约 5% 假阳性），重要决策需后验验证或复现；本技能只输出校正后的显著性判据。
- 卡页数字（15 个指标、120 个 SKU、从 8 个缩减为 5 个、从 24 个识别出 18 个、年化 30-60 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Empirical-Bayes-Multiple-Testing

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Empirical-Bayes-Multiple-Testing`