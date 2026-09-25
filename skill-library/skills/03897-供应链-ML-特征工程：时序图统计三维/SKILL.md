---
name: "p2s-supply-chain-ml-features"
title: "Supply Chain ML Feature Engineering — 供应链 ML 特征工程：时序+图+统计三维"
description: "触发词：特征工程、时序特征、图特征、统计特征、特征契约。何时不用：要直接跑端到端预测用「TFT 多水平预测」；只做实时数据接入不做特征设计时用「流式预测」。安全边界：所有特征必须基于 t-1 及以前数据，禁止未来信息泄露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 指标契约 / 数据管道"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Supply-Chain-ML-Features"
p2s_src_domain: "12-ML基础"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "把供应链预测要用的特征口径统一好，模型精度跟着上去，库存和缺货同时改善。"
user_try: "试试：按三维特征体系给我这款暖奶器做特征表，并校验有没有用到未来信息。"
whenToUse: "模型预测口径混乱、需要统一定义时序、图与统计三类特征时用；端到端跑预测用 TFT 多水平预测；只做实时管道用流式预测。"
workflow: "盘点可用数据源并定义时序、图与统计三类特征 → 按 t-1 及以前口径生成特征，禁止未来信息泄露 → 把交货期波动等风险项纳入 P90 特征 → 输出特征表与特征契约供下游建模复用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain ML Feature Engineering — 供应链 ML 特征工程：时序+图+统计三维

## ① 解决的问题

供应链分析师面临特征口径不一致——供应链特征将预测MAPE降12%，年化省18万元

## ② 核心算法逻辑

论文：Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting | 年份：2019 (KDD)

## ③ 业务应用场景

业务背景： - SKU：婴儿恒温暖奶器（型号 WM-2024A），日均销量 45 件 - 库存现状：平均库存 2,100 件，周转率 21 天 - 痛点：传统 ARIMA 预测 RMSE=12.3 件，导致缺货率 8.2%、积压率 14.5%
特征工程效果： - 预测精度：RMSE 从 12.3 件 → 8.7 件（降低 29%） - 库存优化：平均库存 2,100 件 → 1,650 件（降低 21%），周转率 21 天 → 15 天（+28%） - 缺货率：8.2% → 2.1%（降低 74%） - 年化收益：减少积压资金 ¥94 万，缺货损失减少 ¥38 万，合计年化节省 ¥132 万
三轨验证： - 成本：特征工程开发 3 人周 + 数据管道维护 0.5 人月，ROI 周期 2.3 个月 - 合规：所有特征基于历史数据（t-1 及以前），无未来信息泄露，符合 ISO 9001 数据完整性要求 - 风险：供应商交货期波动（std=2.1 天）纳入 P90 特征，缓冲库存覆盖 95% 场景

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：算法工程师面临核心业务决策——供应链 ML 特征工程效率提升 40%，模型准确率 +8%
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（30 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2006.09917，但该号在 arXiv 上是《FISHING Net: Future Inference of Semantic Heatmaps In Grids》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 历史销量、促销与价格、库存与周转、供应商交货期等（卡页示例：日均销量 45 件、平均库存 2,100 件、周转 21 天、交货期 std=2.1 天）；粒度：SKU×日。

**输出**：统一口径的特征表与特征契约（含 P90 风险特征），供下游预测模型训练与复用；卡页记录的效果为 RMSE 由 12.3 件降至 8.7 件、缺货率由 8.2% 降至 2.1%、年化节省 132 万元。

## 执行步骤

1. 盘点数据源并划分三类特征
2. 按 t-1 口径生成特征防止泄露
3. 加入 P90 风险特征覆盖交期波动
4. 输出特征表并登记特征契约
5. 交付下游模型训练与复用

## 边界与不做

- 数据不满足时不用：历史积累不足 3 个月、或交期与促销等关键维度无记录时，特征表无法支撑建模。
- 能力边界：只产出特征与契约，不负责模型训练、调参与上线。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-RFM-User-Segmentation
- **延伸**：Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-RFM-User-Segmentation
- **可组合**：Skill-Ad-Creative-Optimization、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Model-Calibration.html、Skill-Model-Calibration、Skill-RFM-User-Segmentation、Skill-Supply-Chain-ML-Features

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：12-ML基础　·　源卡：`Skill-Supply-Chain-ML-Features`