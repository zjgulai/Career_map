---
name: "p2s-temporal-fusion-transformer-inventory"
title: "Temporal Fusion Transformer Inventory — TFT 多变量时序库存补货决策"
description: "触发词：TFT 库存、多变量融合、8 周锁单、安全库存分位、广告计划。何时不用：要可解释的多水平预测与特征排名用「TFT 多水平预测」；只要单变量季节预测用「Prophet 预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Temporal-Fusion-Transformer-Inventory"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "把广告预算、竞品价格和会员日一起喂给模型，八周锁单的预测误差砍掉一半以上，安全库存也有依据。"
user_try: "试试：融合广告花费、BSR 和竞品价格，预测主力吸奶器未来 8 周周销量并按 P90 定安全库存。"
whenToUse: "8 周锁单需要融合广告计划、竞品价格、节假日等多变量信号时用；只要可解释多水平预测与排名用 TFT 多水平预测；单变量预测用 Prophet。"
workflow: "整理 52 周销量、广告花费、BSR、竞品价格与促销标记 → 查看变量选择网络的贡献权重 → 训练 TFT 输出周维度分位数预测 → 用 P90 分位设定安全库存与锁单量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Temporal Fusion Transformer Inventory — TFT 多变量时序库存补货决策

## ① 解决的问题

供应链团队面临"8周预测锁单需融合广告计划/竞品价格/节假日多信号但单变量模型误差高达28%"——TFT多变量时序融合将8周预测MAPE从28%降至12%，年化降低库存成本35万元

## ② 核心算法逻辑

论文：Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting | 年份：2019

## ③ 业务应用场景

场景：母婴卖家旗下吸奶器主力 SKU，需要融合广告计划（Sponsored Products 预算）、竞品价格变动、Prime 会员日安排，提前 8 周预测周维度销量用于供应链锁单。
数据要求：过去 52 周销量，广告花费，BSR 排名，竞品价格，促销标记，节假日标签。
TFT 应用：VSN 显示广告花费和 BSR 排名贡献权重各占 35%/28%，模型识别到 Prime Day 前 3 周广告加速 → 销量提升的滞后效应。P90 分位数用于安全库存设定。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

35 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（145 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import defaultdict

def tft_simple_quantile_forecast(
    y_hist: np.ndarray,
    exog: np.ndarray,
    horizon: int = 8,
    quantiles: list = None
) -> dict:
    """
    简化版 TFT 分位数预测（演示架构逻辑，生产建议用 pytorch-forecasting）
    
    Args:
        y_hist: 历史销量序列 (T,)
        exog: 外部变量矩阵 (T, n_features)
        horizon: 预测步数
        quantiles: 分位数列表
    
    Returns:
        dict: 包含各分位数预测和变量重要性
    """
    if quantiles is None:
        quantiles = [0.1, 0.5, 0.9]
    
    T, n_feat = exog.shape
    
    # 变量重要性计算（模拟 VSN 门控）
    # 使用相关系数的绝对值作为重要性指标
    var_importance = np.zeros(n_feat)
    for i in range(n_feat):
        corr = np.corrcoef(y_hist, exog[:, i])[0, 1]
        var_importance[i] = np.abs(corr) if not np.isnan(corr) else 0.0
    
    # 归一化重要性权重
    var_importance_sum = var_importance.sum()
    if var_importance_sum > 1e-8:
        var_importance = var_importance / var_importance_sum
    else:
        var_importance = np.ones(n_feat) / n_feat
    
    # 加权特征均值作为趋势信号
    weighted_signal = exog @ var_importance
    
    # 基于最近 8 期加权平均的基准预测
    window = min(8, T)
    base = np.mean(y_hist[-window:])
    trend = (y_hist[-1] - y_hist[-window]) / window if window > 1 else 0.0
    signal_adj = (weighted_signal[-1] - np.mean(weighted_signal[-window:])) * 0.3
    
    # 计算历史波动率
    hist_std = np.std(y_hist[-window:]) if window > 1 else np.std(y_hist)
    hist_std = max(hist_std, 1e-6)  # 防止除以零
    
    # 生成分位数预测
    results = {}
    for q in quantiles:
        # 根据分位数调整噪声尺度
        noise_scale = hist_std * (0.5 + q)
        preds = []
        for h in range(1, horizon + 1):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:1912.09363 — Temporal Fusion Transformers for Interpretable Multi-horizon Time Series Forecasting

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去 52 周销量、广告花费、BSR 排名、竞品价格、促销标记与节假日标签；粒度：SKU×周。

**输出**：未来 8 周周销量分位数预测与变量贡献解释（卡页示例 MAPE 由 28% 降至 12%，广告花费与 BSR 权重约 35% 与 28%），供供应链锁单与安全库存设定使用。

## 执行步骤

1. 整理多变量周度特征并补齐缺失
2. 训练模型并查看变量贡献权重
3. 输出 8 周分位数预测
4. 按 P90 设定安全库存与锁单量

## 边界与不做

- 数据不满足时不用：竞品价格或广告计划拿不到、或销量历史不足 52 周时，多变量融合的价值消失。
- 能力边界：只做预测与安全库存输入，不代替锁单谈判与下单。
- 能力边界：变量权重是模型内归因，不能当作因果结论解释销量。

## 技能关联

- **可组合**：Skill-Temporal-Fusion-Transformer-Inventory

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Temporal-Fusion-Transformer-Inventory`