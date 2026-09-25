---
name: "p2s-inventory-theft-warehouse-anomaly"
title: "Inventory Theft Warehouse Anomaly — 海外仓库存异常检测盗窃/错发/损耗识别"
description: "触发词：库存差异、盗损识别、持续偏差告警、周期规律。何时不用：缺少每日盘点或出入库日志时无法建立基线；一次性账实核对用人工盘点流程。安全边界：仅用于内部库存与操作审计，结论不得用于无证据的员工定性处理。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 差异追踪"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-Inventory-Theft-Warehouse-Anomaly"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "用持续偏差检测把海外仓的库存异常从年底对账提前到第二周告警。"
user_try: "试试：我们海外仓奶粉每周二周四都少几件，帮我做一版库存异常检测找出规律。"
whenToUse: "本卡属「仓储协作」。需要从每日库存与出入库日志中持续检测差异与盗损规律时用本卡；只做一次账实核对时用人工盘点流程。"
workflow: "计算每日预期与实际变化 → 用基线期建立基准 → 检测异常并累计差异 → 按星期聚合找周期规律"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Inventory Theft Warehouse Anomaly — 海外仓库存异常检测盗窃/错发/损耗识别

## ① 解决的问题

仓储管理面临"奶粉海外仓3个月内220件差异到年底对账才发现每罐$50合计损失$11000"——CUSUM库存偏差检测在第2周触发告警，年化发现并预防盗损10-20万元

## ② 核心算法逻辑

论文：Anomaly Detection in Time Series with Robust Statistical Baselines | 年份：2019

## ③ 业务应用场景

场景：某母婴卖家在美国海外仓存放奶粉（高价值品，约 $50/罐），3 个月内共 220 件库存差异（账面多于实际），发现规律是每周二、四各缺少约 8-12 件。经比对出库记录和运单，发现是某班次操作员系统性错误记录。
数据要求：WMS（仓库管理系统）库存日志、出库单、运单号，每日盘点记录。
异常检测应用：持续偏差检测在第 2 周触发告警，3 个月内追回损失，而非年底对账时才发现。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-20 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（100 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict

def inventory_anomaly_detector(
    inventory_records: list,  # [{'date': int, 'actual': float, 'sales': float, 'shipped': float, 'restocked': float}]
    k: float = 2.5,
    warmup_days: int = 14
) -> dict:
    """
    库存异常检测
    """
    n = len(inventory_records)
    if n < warmup_days + 1:
        return {'error': '数据不足'}

    discrepancies = []
    expected_changes = []

    # 计算每天的预期变化和实际变化
    for i in range(1, n):
        prev = inventory_records[i - 1]
        curr = inventory_records[i]

        expected_change = -(curr['sales'] + curr['shipped']) + curr['restocked']
        actual_change = curr['actual'] - prev['actual']
        discrepancy = actual_change - expected_change

        discrepancies.append(discrepancy)
        expected_changes.append(expected_change)

    discrepancies = np.array(discrepancies)

    # 用 warmup 期建立基线
    baseline = discrepancies[:warmup_days]
    mu = np.mean(baseline)
    sigma = np.std(baseline) + 1e-8

    # 检测异常
    z_scores = (discrepancies - mu) / sigma
    anomalies = np.abs(z_scores) > k

    # 累积差异趋势（CUSUM 风格）
    cumulative_discrepancy = np.cumsum(discrepancies)

    # 模式分析：按日期（模 7）聚合，找周期性规律
    day_of_week_disc = defaultdict(list)
    for i, disc in enumerate(discrepancies):
        dow = (inventory_records[i + 1]['date']) % 7
        day_of_week_disc[dow].append(disc)

    weekly_pattern = {
        dow: {'mean': np.mean(vals), 'std': np.std(vals)}
        for dow, vals in day_of_week_disc.items()
    }

    # 找最异常的星期几（均值最负 = 系统性损耗）
    worst_dow = min(weekly_pattern.keys(), key=lambda d: weekly_pattern[d]['mean'])

    return {
        'discrepancies': discrepancies,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1904.04208，但该号在 arXiv 上是《Analysis and design of a Germanium multi-quantum well metal strip nanocavity plasmon laser》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Anomaly Detection in Time Series with Robust Statistical Baselines》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：WMS 库存日志、出库单、运单号与每日盘点记录，需要日粒度且连续覆盖基线观察期。

**输出**：异常告警时点、累积差异趋势与按星期的周期性损耗规律，输出最异常的日期或班次定位，供仓储主管核查。

## 执行步骤

1. 汇总每日库存的预期变化与实际变化
2. 用基线期数据建立偏差基线
3. 检测超限异常并累计差异趋势
4. 按星期与班次聚合定位周期性规律
5. 输出告警与核查建议

## 边界与不做

- 缺少每日盘点或出入库日志时无法建立基线，不用本卡
- 本卡只输出统计异常与定位线索，不下达处罚或责任认定结论

## 技能关联

- **可组合**：Skill-Inventory-Theft-Warehouse-Anomaly

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：19-风控反欺诈　·　源卡：`Skill-Inventory-Theft-Warehouse-Anomaly`