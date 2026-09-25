---
name: "p2s-long-term-holdout-group-design"
title: "Long-term Holdout Group Design — 长期保留组设计（防止学习效应污染）"
description: "触发词：长期保留组、NoveltyDecay、分桶持久化、保留组轮换、长期增量。何时不用：只判断单次实验是否存在新奇效应、不做跨迭代长期跟踪时，用更轻的保留组实现即可。安全边界：需告知保留组用户可能不会收到最新功能，并按年轮换保留组成员。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查 / 算法评估设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Long-Term-Holdout-Group-Design"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "用一小撮长期不享受新功能的用户当永久对照，把推荐算法和会员体系被短期效果高估的部分挤出来。"
user_try: "试试：推荐算法实验 CTR 涨了 12% 但三个月后衰减了，帮我设计长期保留组验证真实增量。"
whenToUse: "当策略效果需要数月才稳定（推荐算法、会员体系、定价模型），且要跨越多次迭代评估长期因果效应时用；只判断单次实验的新奇效应时用更轻的实现即可。"
workflow: "设定保留组比例、最小样本量与观测期、洗消期参数 → 做用户分桶持久化，确保保留组长期不接触新策略 → 持续追踪保留组与实验组的 LTV、复购率与流失率 → 比较长期增益与短期结论，识别 Novelty Decay 幅度 → 按真实长期增益调整投入并建立保留组轮换机制"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Long-term Holdout Group Design — 长期保留组设计（防止学习效应污染）

## ① 解决的问题

推荐算法2周AB实验显著（CTR+12%）但3个月后效果衰减——引入长期保留组设计隔离学习效应，长期真实增量捕获率从 60%→92%，避免高估短期 CTR 导致的过度投入。

## ② 核心算法逻辑

标准 AB 实验通常运行 14 周，但许多策略（推荐算法、会员体系、定价模型）的真实效果需要数月才能稳定——初始效果可能是「学习期效应」而非真实增益。长期保留组（LongTerm Holdout Group） 设计通过维持一个永久对照组，跨越多次迭代估计策略的长期因果效应。

## ③ 业务应用场景

场景1：婴儿奶粉推荐系统长期效果验证 - 业务问题：协同过滤推荐算法上线 2 周 AB 结论显著（CTR +12%），但 3 个月后推荐效果下降（用户习惯化），短期实验无法捕捉 - 数据要求：5% 保留组（约 500 用户/月）不接受推荐系统，长期追踪 90 天 LTV 和复购率 - 预期产出：90 天长期实验发现真实增益为 +6%（而非 +12%），调整模型迭代优先级 - 业务价值：基于真实 6% 增益定 ROI，避免过度投入推荐系统优化（节省研发成本约 15 万元/年）
场景2：订阅会员体系设计长期保留验证 - 业务问题：Prime-like 母婴订阅会员上线后 3 周，转化率 +18%，但怀疑是「新鲜感效应」而非真实价值提升 - 数据要求：8% 保留组（约 300 用户）不接受会员权益，持续 180 天追踪 LTV/流失率 - 预期产出：6 个月后保留组 LTV 仅低 8%（而非 +18%），表明有显著 Novelty Decay；调整会员定价策略 - 业务价值：防止基于短期效果过度补贴会员权益，年均节省补贴成本约 8 万元
**三轨验证**： - 成本：保留组工程实现约 1 人周（用户分桶持久化）；长期运营成本为 5-10% 业务增益损失 - 合规：需要告知保留组用户可能不会收到最新功能（可通过隐私政策覆盖）；建议每年轮换保留组成员 - 风险：保留组用户如果意识到被排除，可能产生 SUTVA 违反（向邻居打听新功能）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：识别 Novelty Effect 防止按短期效果过度投入研发/优化，年均节省研发成本约 10-20 万元；精准评估推荐系统/会员体系长期价值，优化 CAC/LTV 模型准确度提升约 20%
实施难度：⭐⭐⭐⭐☆（用户分桶持久化需要工程支持；长期维护需要保留组轮换机制，工程成本约 1 人月）
优先级：⭐⭐⭐⭐☆
评估依据：母婴用户高粘性且购买周期与婴儿月龄强绑定，短期实验天然存在学习效应；推荐系统和会员体系是母婴跨境电商长期竞争力，错误评估长期价值代价大

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass

# ============================================================
# Long-Term Holdout Group Design Analysis
# ============================================================

@dataclass
class HoldoutConfig:
    holdout_fraction: float = 0.05    # 保留组比例
    min_holdout_n: int = 300          # 最小保留组样本量
    observation_days: int = 90        # 观测期（天）
    washout_days: int = 14            # 洗消期（迭代间隔）


def simulate_holdout_experiment(
    n_users: int,
    n_iterations: int,            # 版本迭代次数
    true_short_term_lift: float,  # 短期真实提升（带 Novelty）
    true_long_term_lift: float,   # 长期真实提升（稳定期）
    novelty_decay_days: int = 30, # Novelty Effect 衰减天数
    holdout_fraction: float = 0.05,
    seed: int = 42
) -> dict:
    """
    模拟多轮迭代下保留组 vs 当前版本的 LTV 轨迹
    """
    np.random.seed(seed)
    n_holdout = int(n_users * holdout_fraction)
    n_treatment = n_users - n_holdout
    obs_days = 90

    # 用户基线 LTV（对数正态分布）
    baseline_ltv = np.random.lognormal(4.5, 0.6, n_users)

    # 保留组（持续旧版本）：无策略提升，只有自然增长
    holdout_ltv_trajectory = []
    treatment_ltv_trajectory = []

    for day in range(obs_days):
        # Novelty Effect 曲线：指数衰减
        novelty_factor = np.exp(-day / novelty_decay_days)
        day_lift = (true_long_term_lift +
                    (true_short_term_lift - true_long_term_lift) * novelty_factor)

        # 保留组：基线自然增长
        holdout_day_ltv = baseline_ltv[:n_holdout] * (1 + 0.001 * day) + \
                           np.random.normal(0, 5, n_holdout)

        # 处理组：策略提升（含 Novelty Decay）
        trt_day_ltv = baseline_ltv[n_holdout:] * (1 + day_lift + 0.001 * day) + \
                       np.random.normal(0, 5, n_treatment)

        holdout_ltv_trajectory.append(np.mean(holdout_day_ltv))
        treatment_ltv_trajectory.append(np.mean(trt_day_ltv))

    return {
        "days": list(range(obs_days)),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：保留组配置参数：保留组比例（卡页示例 5% 与 8%）、最小保留组样本量（示例 300）、观测期（示例 90 天与 180 天）、洗消期（示例 14 天），外加长期追踪的用户级 LTV、复购率与流失率数据。

**输出**：长期保留验证结果与真实增益估计（卡页示例：90 天长期实验真实增益 +6% 而非 +12%；会员场景 6 个月后保留组 LTV 仅低 8% 而非 +18%），以及模型迭代优先级与定价策略调整建议。

## 执行步骤

1. 设定保留组比例、最小样本量与观测期、洗消期参数
2. 做用户分桶持久化，确保保留组长期不接触新策略
3. 持续追踪保留组与实验组的 LTV、复购率与流失率
4. 比较长期增益与短期结论，识别 Novelty Decay 幅度
5. 按真实长期增益调整投入并建立保留组轮换机制

## 边界与不做

- 何时不用：只需判断单次实验是否存在新奇效应、不做跨迭代长期跟踪时，用更轻的保留组实现即可；短期即可判定的功能不必设保留组。
- 能力边界：分桶持久化与长期维护需工程支持（卡页估约 1 人月），保留组长期不享受新功能会损失 5-10% 业务增益；卡页也提示用户若意识到被排除可能产生 SUTVA 违反（向邻居打听新功能）。
- 合规边界：需告知保留组用户可能不会收到最新功能，并按年轮换保留组成员。
- 卡页数字（真实增量捕获率从 60% 到 92%、真实增益 +6% 对比 +12%、保留组 LTV 低 8% 对比 +18%、年化 10-20 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Long-Term-Holdout-Group-Design

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Long-Term-Holdout-Group-Design`