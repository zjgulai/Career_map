---
name: "p2s-cross-sku-demand-correlation-mining"
title: "Cross-SKU Demand Correlation Mining — 跨 SKU 需求相关性挖掘组合补货优化"
description: "触发词：跨SKU相关性、Granger因果、配件补货、需求跟随、合并补货。何时不用：单个 SKU 自身的历史外推用「Agent时序预测」，按准确率口径衡量预测用「预测准确率MAPE体系」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Cross-SKU-Demand-Correlation-Mining"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "发现主机卖得好配件随后就来，把配件的补货时点提前，顺手把订单合并少发几趟货。"
user_try: "试试：我有主机和 5 款配件 12 个月的周销量，帮我找出主机领先配件的关系并提前配件补货。"
whenToUse: "本卡属需求预测中的跨 SKU 关联侧：需要借助关联品的领先销量提前触发补货并合并订单时用；单个 SKU 自身的时序外推用通用时序预测类技能。"
workflow: "准备 12 个月以上 SKU 级周销量与物料关联标注 → 计算跨 SKU 相关性并做 Granger 因果检验 → 按显著领先关系把配件补货触发点提前 → 合并同源补货订单，减少物流次数"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-SKU Demand Correlation Mining — 跨 SKU 需求相关性挖掘组合补货优化

## ① 解决的问题

补货运营面临"主机吸奶器卖出后配件SKU缺货率高达15%因为未感知到需求跟随关系"——Granger因果挖掘将配件补货触发提前2周，缺货率从15%降至4%，年化节省20万元

## ② 核心算法逻辑

论文：Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting | 年份：2021

## ③ 业务应用场景

场景：某卖家有吸奶器主机 + 5 款配件 SKU，发现主机销量领先于配件 1-2 周（消费者先买主机，后买配件），可以用主机销量预测配件需求，提前补货。
数据要求：12 个月以上的 SKU 级周销量数据，SKU 物料关联关系标注。
应用：识别主机→配件 Granger 因果关系（p<0.05），将配件补货触发点提前 2 周，配件缺货率从 15% 降至 4%。同时合并补货订单，物流次数减少 30%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

数据采集与清洗：5,000-8,000 元（ERP 系统对接、异常值处理）
计算资源：云服务器 GPU 实例月租 2,000 元 × 3 个月 = 6,000 元
人力投入：数据分析师 1 人 × 4 周 × 5,000 元/周 = 20,000 元
总成本：31,000-34,000 元（ROI 周期 2-3 个月）
✅ Amazon 政策：合规。补货优化属于内部运营决策，不涉及虚假销量、刷单或价格操纵
✅ GDPR：合规。仅使用聚合销量数据，不涉及个人消费者信息

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（100 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from itertools import combinations

def compute_cross_sku_correlation(
    sales_matrix: np.ndarray,
    sku_names: list,
    window: int = 12,
    corr_threshold: float = 0.7
) -> dict:
    """
    跨 SKU 相关性矩阵计算
    sales_matrix: (T, n_sku) 周销量矩阵
    sku_names: SKU 名称列表
    window: 滑动窗口（周）
    corr_threshold: 相关性阈值
    """
    T, n_sku = sales_matrix.shape
    corr_matrix = np.corrcoef(sales_matrix.T)

    high_corr_pairs = []
    for i, j in combinations(range(n_sku), 2):
        if abs(corr_matrix[i, j]) >= corr_threshold:
            high_corr_pairs.append({
                'sku_a': sku_names[i],
                'sku_b': sku_names[j],
                'correlation': corr_matrix[i, j]
            })

    return {
        'corr_matrix': corr_matrix,
        'high_corr_pairs': sorted(high_corr_pairs, key=lambda x: -abs(x['correlation'])),
        'n_high_corr': len(high_corr_pairs)
    }

def granger_causality_test(
    y_cause: np.ndarray,
    y_effect: np.ndarray,
    max_lag: int = 4
) -> dict:
    """
    简化 Granger 因果检验（线性回归版本）
    检验 y_cause 是否 Granger 因果于 y_effect
    """
    n = len(y_effect)
    best_lag = 0
    best_r2_improvement = 0

    # 基础模型（仅自回归）
    X_base = np.column_stack([y_effect[max_lag - k - 1:-k - 1] for k in range(max_lag)])
    y = y_effect[max_lag:]

    # 添加因果变量的模型
    for lag in range(1, max_lag + 1):
        X_full = np.column_stack([
            X_base,
            y_cause[max_lag - lag:-lag]
        ])
        # 用最小二乘估计
        try:
            beta_full = np.linalg.lstsq(
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2106.07725 — Generalized kernel distance covariance in high dimensions: non-null CLTs and power universality
⚠️ 卡页 ② 段点名的论文是《Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting》，与这个号指的不是同一篇。

核验口径：主题指向成立但强度不足（词重合 0.167／点名相似 0.225）。引用前请自行确认。

## 输入 / 输出契约

**输入**：12 个月以上 SKU 级周销量数据、SKU 物料关联关系标注（如主机与配件的对应关系）；SKU×周粒度。

**输出**：跨 SKU 相关性与 Granger 因果检验结论（含显著性）、调整后的补货触发时点与合并补货建议，输出给补货运营。

## 执行步骤

1. 准备 12 个月以上 SKU 级周销量与物料关联标注。
2. 计算跨 SKU 相关性并做 Granger 因果检验，筛出显著领先关系。
3. 依据领先周期把配件补货触发点提前。
4. 合并关联品的补货订单，减少物流次数。

## 边界与不做

- 何时不用：不足 12 个月周销量，或 SKU 之间没有物料关联标注时无法区分真因果与共动，不适用本技能。
- 能力边界：因果检验只说明领先滞后关系，不等于可干预的因果机制；结果对小样本序列敏感，显著性阈值需按品类复核。

## 技能关联

- **可组合**：Skill-Cross-SKU-Demand-Correlation-Mining

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Cross-SKU-Demand-Correlation-Mining`