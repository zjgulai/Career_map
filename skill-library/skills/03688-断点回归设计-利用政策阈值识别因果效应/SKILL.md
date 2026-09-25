---
name: "p2s-rdd-regression-discontinuity-design"
title: "断点回归设计 — 利用政策阈值识别因果效应"
description: "触发词：断点回归、阈值效应、会员门槛、密度检验、心理定价。何时不用：处理不由明确阈值规则分配时RDD不适用；用户可操控阈值指标时RDD失效。安全边界：策略调整（如降低门槛、改价）前需检查是否触及平台最低资质与定价要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 会员活动 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-RDD-Regression-Discontinuity-Design"
p2s_src_domain: "01-因果推断"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "利用明确的规则门槛（比如满 1000 积分升级会员）比较门槛两侧的用户，量出政策本身的真实效果。"
user_try: "试试：黄金会员门槛设在 1000 积分，帮我用断点回归看看这个门槛到底提升了多少复购率。"
whenToUse: "当处理由清晰阈值规则分配（会员升级门槛、满减门槛、29.99 与 30.00 的定价断点）且阈值附近样本充足时用；处理分配没有阈值规则时改用倾向得分匹配或实验设计类技能。"
workflow: "取阈值附近的用户或商品样本，确认分配变量与结果变量 → 跑 McCrary 密度检验，确认阈值处没有人为堆积 → 做局部线性回归估计阈值两侧的跳跃幅度 → 输出效应点估计与 95% 置信区间 → 按结果优化会员门槛或验证定价策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 断点回归设计 — 利用政策阈值识别因果效应

## ① 解决的问题

运营团队面临"会员门槛策略效果无法区分因果效应与选择偏差"——RDD在阈值处精确识别7.76%的真实复购率提升，年化GMV增量约120万元

## ② 核心算法逻辑

断点回归设计（Regression Discontinuity Design, RDD）是一种准自然实验方法：当某个处理变量（如优惠券发放、会员升级）根据明确的阈值规则分配时，阈值两侧的用户可视为"随机"分配，因此阈值处的跳跃即为真实的因果效应。

## ③ 业务应用场景

场景A：会员积分升级门槛的真实效应评估 - 业务问题：设置"积分满1000升级黄金会员（享免运费+5%折扣）"，但不确定这是否真正提升了复购率，还是"快升级的用户本来就会复购"的选择偏差 - 数据要求：用户积分数据（分配变量）+ 升级后60天复购行为（结果变量）；需要足够多在阈值1000附近的用户（±100积分内至少500用户） - 预期产出：RDD估计显示：黄金会员制度在阈值处使60天复购率提升 +8.3个百分点（95%CI: [4.1%, 12.5%]），且阈值两侧密度检验无操控（p=0.43），结论可信 - 业务价值：量化了会员制度的真实ROI，据此优化升级门槛（调整到800积分覆盖更多
三轨对抗验证： 1. 成本验证：RDD计算极轻量（局部回归），单次分析约10秒；主要成本在数据治理（确保积分记录完整、时间戳准确） 2. 合规验证：RDD本身是观测性研究，无平台风险；但基于RDD结果做的策略调整（如降低门槛）需检查是否影响平台最低资质要求 3. 风险验证：若用户知晓阈值并人为堆积积分（刷单），会导致分配变量操控，RDD失效；需先做McCrary密度检验，若阈值处有密度突变则方法不可用
场景B：促销价格截断效应评估 - 业务问题：29.99美元 vs 30.00美元的价格，是否真正有转化率突变（心理定价效应）？用RDD精确量化$30价格关卡的因果效应 - 数据要求：历史定价实验数据（分配变量：商品定价；结果变量：点击转化率）；需要在$29-$31区间有密集价格点 - 预期产出：在$30价格关卡处，CVR跳跃+1.8%（95%CI: [0.3%, 3.3%]），统计显著 - 业务价值：确认心理定价策略的真实效果，指导全品类定价策略制定，预估CVR提升1.5%对应月增量约15万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：准确量化会员门槛效应后，优化门槛设置可使会员覆盖率提升20%（从25%→30%），对应复购率整体提升约2%，年化GMV增量约60万元；心理定价策略确认后，全品类优化CVR提升约1.5%，年化增量约40万元
实施难度：⭐⭐☆☆☆（方法论简单清晰，实现仅需OLS；主要要求是数据质量和阈值清晰度）
优先级：⭐⭐⭐⭐☆（适用于任何有明确阈值的运营策略，如满减/会员等级/促销截断，应用场景极多）
评估依据：Cattaneo 2020 JASA论文是RDD理论最权威参考；母婴电商运营充斥各类阈值规则（积分/等级/折扣），是天然的RDD实验室；相比A/B测试，RDD利用历史数据，无需等待实验期

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-RDD-Regression-Discontinuity-Design
断点回归设计 — 会员积分升级门槛的因果效应评估

依赖：pip install numpy pandas scikit-learn statsmodels
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

# ── 1. 生成模拟会员积分数据 ──────────────────────────────────────────
def generate_rdd_data(n=3000, cutoff=1000, true_effect=0.08):
    """
    模拟会员积分RDD数据
    cutoff: 升级门槛（1000积分）
    true_effect: 黄金会员对复购率的真实因果效应
    """
    # 分配变量：积分（连续，用户无法精确操控）
    scores = np.random.normal(1000, 250, n).clip(0, 2500)

    # 处理变量：是否升级为黄金会员
    treated = (scores >= cutoff).astype(float)

    # 潜在结果（不含处理效应）：积分越高，基础复购率越高（连续趋势）
    base_repurchase = 0.15 + 0.0001 * (scores - 1000) + np.random.normal(0, 0.05, n)

    # 处理效应（仅在升级处发生跳跃）
    repurchase = base_repurchase + true_effect * treated
    repurchase = np.clip(repurchase, 0, 1)

    return pd.DataFrame({
        'score':      scores,
        'treated':    treated,
        'repurchase': repurchase,
        'above_cut':  treated  # 是否越过阈值
    })

df = generate_rdd_data(n=3000, cutoff=1000, true_effect=0.08)
cutoff = 1000

print(f"数据集: {len(df)} 用户, 阈值={cutoff}积分")
print(f"升级比例: {df['treated'].mean():.2f}")
print(f"阈值以上复购率: {df[df['treated']==1]['repurchase'].mean():.3f}")
print(f"阈值以下复购率: {df[df['treated']==0]['repurchase'].mean():.3f}")

# ── 2. 密度连续性检验（McCrary Test简化版）──────────────────────────
def mccrary_density_test(scores, cutoff, bin_width=20):
    """
    检验分配变量在阈值处是否有密度突变（操控检验）
    如果用户可以操控积分，会在阈值右侧出现异常密度堆积
    """
    bins_left  = np.arange(cutoff - 500, cutoff, bin_width)
    bins_right = np.arange(cutoff, cutoff + 500, bin_width)

    count_left  = np.array([((scores >= b) & (scores < b + bin_width)).sum() for b in bins_left])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：分配变量（用户积分或商品定价）+ 结果变量（升级后 60 天复购行为或点击转化率）；阈值附近样本需充足，卡页示例为 ±100 积分内至少 500 用户，价格场景需在 29-31 美元区间有密集价格点。

**输出**：阈值处的因果效应点估计与 95% 置信区间、McCrary 密度检验结果（用于判断是否存在阈值操控），以及门槛或定价优化建议（卡页示例：60 天复购率提升 +8.3 个百分点、CVR 跳跃 +1.8%）。

## 执行步骤

1. 取阈值附近的用户或商品样本，确认分配变量与结果变量
2. 跑 McCrary 密度检验，确认阈值处没有人为堆积
3. 做局部线性回归估计阈值两侧的跳跃幅度
4. 输出效应点估计与 95% 置信区间
5. 按结果优化会员门槛或验证定价策略

## 边界与不做

- 何时不用：阈值附近样本太少、分配规则不清晰，或用户能操控分配变量（如人为刷积分）时不要用；卡页要求先做密度检验，阈值处密度异常则方法不可用。
- 能力边界：只识别阈值处的局部效应，不能外推到远离阈值的用户；只产出效应估计与门槛建议，不执行门槛或价格变更。
- 合规边界：基于结果做策略调整（如降低门槛、调整定价）前，需检查是否触及平台最低资质与定价要求。
- 卡页数字（+8.3 个百分点、CVR +1.8%、覆盖率 25% 到 30%、年化 60 万与 40 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-IV-Instrumental-Variables.html、Skill-IV-Instrumental-Variables、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-Cohort-Analysis.html、Skill-Causal-Cohort-Analysis、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Conformal-ROI-Prediction.html、Skill-Conformal-ROI-Prediction、Skill-DML-Cohort-Causal-Effect.html、Skill-DML-Cohort-Causal-Effect、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-RDD-Regression-Discontinuity-Design

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：01-因果推断　·　源卡：`Skill-RDD-Regression-Discontinuity-Design`