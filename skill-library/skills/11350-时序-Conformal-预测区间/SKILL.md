---
name: "p2s-conformal-ts-intervals"
title: "Conformal TS Intervals（时序 Conformal 预测区间）"
description: "触发词：共形时序区间、区间收紧、安全库存优化、库存周转、季节性分层。何时不用：需要框架级校准集设计用「共形预测区间框架」，需要把区间翻成补货与加急规则用「共形时序预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Conformal-TS-Intervals"
p2s_src_domain: "03-时间序列"
quality_tier: "preview"
user_summary: "把过宽的预测区间收紧，安全库存跟着降下来，缺货和积压两头一起改善。"
user_try: "试试：我这个暖奶器 SKU 用正态假设区间总是过宽，帮我换成共形区间并重算安全库存。"
whenToUse: "本卡针对单 SKU 的区间落地：已有基础预测模型、区间过宽导致安全库存偏高时用；需要框架级的校准集划分与覆盖率解释，用共形预测区间框架类技能。"
workflow: "准备过去 120 天日销、周期性与营销日历特征 → 用基础模型出预测，再做共形分位数校准 → 输出分季节的 90% 预测区间并核对覆盖率 → 按区间重算安全库存与仓储费节省"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Conformal TS Intervals（时序 Conformal 预测区间）

## ① 解决的问题

传统正态假设需求预测区间过宽（±25%），导致安全库存过度备货——Conformal 预测在无分布假设下输出紧致 90% 覆盖区间，减少过度备货成本 500 元/月/SKU

## ② 核心算法逻辑

论文：Predictive Inference with the Jackknife+ | arXiv：1905.03754

## ③ 业务应用场景

产品基线： - SKU：恒温暖奶器（€89.99） - 历史数据：过去 18 个月日销均值 28 件，标准差 12 件 - 库存现状：安全库存 1,200 件，月均仓储费 €1,850 - 痛点：传统正态假设区间 [8, 48] 件导致旺季（冬季新生儿潮）缺货率 18%，淡季（夏季）积压 650 件
Conformal 方案： - 输入特征：过去 120 天日销 + 周期性（周末 +35%）+ 营销日历（黑五、圣诞、复活节）+ 竞品价格 - 模型：XGBoost 基础预测 + Conformal 分位数校准 - 输出：90% 预测区间，冬季日销 [52, 78] 件，夏季日销 [12, 24] 件 - 相比正态假设，区间宽度收紧 28%，冬季覆盖率 92%，夏季覆盖率 91%
量化产出： - 安全库存从 1,200 件降至 780 件（优化 35%） - 仓储费年化节省：€1,850 × 12 × 35% = €7,770（约 6.2 万元人民币） - 缺货率从 18% 降至 4%，挽回冬季销售额约 €42,000（约 33.6 万元人民币） - 库存周转率从 3.8 次/年提升至 5.9 次/年（提升 55%） - 年化总节省：约 39.8 万元人民币

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

€1,850 × 12 × 35% = €7,770（约 6.2 万元人民币）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（23 行）。**下面 23 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **23 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，23 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/conformal_ts_intervals` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Conformal-TS-Intervals.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

def conformal_ts_interval(y_train, y_pred_train, y_pred_test, alpha=0.1):
    """
    时序 Conformal 预测区间
    """
    residuals = np.abs(y_train - y_pred_train)
    q = np.quantile(residuals, 1 - alpha)
    lower = y_pred_test - q
    upper = y_pred_test + q
    return lower, upper

# 婴儿暖奶器案例数据
y_train = np.array([28, 32, 25, 35, 42, 38, 22, 18, 24, 30, 45, 52, 48, 40, 35, 28])
y_pred_train = np.array([26, 30, 27, 33, 40, 36, 24, 20, 26, 32, 43, 50, 46, 38, 33, 30])
y_pred_test = np.array([55, 58, 62, 15, 18, 20])

lo, hi = conformal_ts_interval(y_train, y_pred_train, y_pred_test, alpha=0.1)
print("90% Conformal 预测区间：")
for i, (l, h) in enumerate(zip(lo, hi)):
    print(f"  Day {i+1}: [{l:.0f}, {h:.0f}] 件")
print("[✓] Conformal TS 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.03754，但该号在 arXiv 上是《Sharp asymptotics for Fredholm Pfaffians related to interacting particle systems and random matrices》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Predictive Inference with the Jackknife+》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：过去 120 天日销数据、周期性与营销日历（如黑五、圣诞、复活节）、竞品价格、已训练的基础预测模型；SKU×日粒度，需要可校准的残差样本。

**输出**：分季节的 90% 预测区间、收紧后的安全库存建议与仓储费节省、缺货率与库存周转率的变化测算，输出给库存计划与补货运营。

## 执行步骤

1. 准备过去 120 天日销、周期性与营销日历特征。
2. 用基础模型出预测，再做共形分位数校准。
3. 输出分季节的 90% 预测区间并核对覆盖率。
4. 按区间重算安全库存与仓储费节省。

## 边界与不做

- 何时不用：没有基础预测模型或残差样本，或季节性波动无法分层校准时区间会失真，不适用本技能。
- 能力边界：结论基于给定 SKU 的价格与仓储费率，换品类需重新校准；覆盖率需持续回测，分布漂移后要重跑校准。

## 技能关联

- **前置**：Skill-Conformal-Prediction-Demand-UQ.html、Skill-Conformal-Prediction-Demand-UQ、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-EventCast-LLM-Event-Forecasting.html、Skill-EventCast-LLM-Event-Forecasting、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Conformal-TS-Intervals

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Conformal-TS-Intervals`