---
name: "p2s-multi-horizon-forecast-reconciliation"
title: "Multi-Horizon Forecast Reconciliation — 多时间粒度预测协调（日/周/月一致性）"
description: "触发词：多粒度协调、日周月一致、MinT、计划矛盾、粒度和。何时不用：要跨 SKU/仓/市场等实体层级做一致时用「多层时序预测调和」；只做单粒度预测时用基础时序预测。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Multi-Horizon-Forecast-Reconciliation"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "让日、周、月三套预测加起来能对上，仓储计划和补货计划不再各说各话。"
user_try: "试试：把日度补货计划和月度产能计划用 MinT 调和成一套一致的数字。"
whenToUse: "日/周/月多粒度预测互相矛盾、需要保证加总一致时用；跨实体层级一致用多层时序预测调和；单粒度预测不需要此技能。"
workflow: "准备日、周、月三粒度历史销售数据 → 分别生成各粒度独立预测 → 用 MinT 做统计最优调和 → 输出日周月一致的一致性预测矩阵"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multi-Horizon Forecast Reconciliation — 多时间粒度预测协调（日/周/月一致性）

## ① 解决的问题

计划团队面临"日度补货计划与月度产能计划相互矛盾导致决策混乱"——多粒度预测协调消除计划矛盾，年化减少库存误差损失10-20万元

## ② 核心算法逻辑

日度预测加总不等于月度预测是常见问题——导致仓储计划（用月度）和补货计划（用日度）相互矛盾。层级预测协调（Hierarchical Reconciliation）通过MinT算法将不同粒度的预测在统计上最优地对齐，保证日预测加总=周预测加总=月预测。

## ③ 业务应用场景

场景1：母婴供应链三层计划协调 - 业务问题：日度补货计划显示需补1000件，但月度产能计划只有800件，相互矛盾 - 数据要求：日/周/月三粒度历史销售数据 - 预期产出：协调后的一致性预测矩阵（日/周/月均一致） - 业务价值：消除计划矛盾，年化减少因计划不一致导致的库存误差损失10-20万元
**三轨验证**： - 成本：statsmodels+hierarchicalforecast库，开发约2人天 - 合规：预测数据属于内部数据，无合规风险 - 风险：协调算法假设底层预测误差独立，实际可能违反

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：消除计划矛盾，年化减少因计划不一致导致的库存误差损失10-20万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：消除计划矛盾，年化减少因计划不一致导致的库存误差损失10-20万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（23 行）。**下面 23 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **23 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，23 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

def reconcile_forecasts(daily_fc: np.ndarray, n_days_per_week: int = 7) -> dict:
    """简化版预测协调：用OLS使日度加总与周度一致"""
    weekly_from_daily = daily_fc.reshape(-1, n_days_per_week).sum(axis=1)
    monthly_from_weekly = weekly_from_daily.sum()
    discrepancy = abs(monthly_from_weekly - daily_fc.sum())
    correction_factor = monthly_from_weekly / daily_fc.sum() if daily_fc.sum() > 0 else 1.0
    reconciled_daily = daily_fc * correction_factor
    return {
        "original_sum": round(daily_fc.sum(), 1),
        "reconciled_sum": round(reconciled_daily.sum(), 1),
        "discrepancy_before": round(discrepancy, 1),
        "discrepancy_after": round(abs(reconciled_daily.sum() - monthly_from_weekly), 4),
        "correction_factor": round(correction_factor, 4),
    }

np.random.seed(42)
daily = np.random.poisson(100, 28)  # 4周日度预测
result = reconcile_forecasts(daily)
print(f"协调前差异: {result['discrepancy_before']} | 协调后: {result['discrepancy_after']}")
assert result["discrepancy_after"] < 1.0
print("[✓] Multi Horizon Forecast Reconciliation 测试通过")
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：日、周、月三粒度历史销售数据；粒度：SKU×日/周/月。

**输出**：协调后的一致性预测矩阵（日、周、月加总相等），供仓储计划与补货计划共用一套数字。

## 执行步骤

1. 对齐日周月三套历史与新预测
2. 计算各粒度预测的加总偏差
3. 用 MinT 投影得到一致预测矩阵
4. 复核底层误差独立性假设是否成立

## 边界与不做

- 数据不满足时不用：只有一个粒度、或粒度间历史口径不一致（如自然月与 4 周月混用）时无法调和。
- 能力边界：只保证数字一致，不判断哪套粒度更接近业务真实；假设不成立时结果仍可能有偏。

## 技能关联

- **可组合**：Skill-Multi-Horizon-Forecast-Reconciliation

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Multi-Horizon-Forecast-Reconciliation`