---
name: "p2s-time-series-forecasting"
title: "Skill Card: 时间序列预测 (Time Series Forecasting)"
description: "触发词：时间序列预测、趋势季节性、指数平滑、置信区间、补货预测。何时不用：要用文本事件修正预测时用「LLMForecaster」；要零样本跨品类预测时用「时序基础模型」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
quality_tier: "curated"
p2s_card_id: "Skill-Time-Series-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Time-Series-Forecasting"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Time-Series-Forecasting.md"
rebase_source_sha256: "7084e8d643650c5dd766b3c0651a8e73adbe7c2e8f285b3ff14bdbaf82190efc"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "7084e8d643650c5dd766b3c0651a8e73adbe7c2e8f285b3ff14bdbaf82190efc"
rebase_full_card_bytes: "14682"
rebase_full_card_lines: "458"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "2b0d75f92b9a6a26b91764b0d6ef8411b91ced57fca6791fe6ac1e7b5ddcc90b"
user_summary: "用趋势、季节和节假日把未来三周销量算出来，缺货和积压一起往下走。"
user_try: "试试：用 24 个月日销数据预测欧洲站未来 21 天销量，给出 95% 区间和补货建议。"
whenToUse: "需要覆盖多重周期与离散事件的基础预测并输出置信区间时用；要吸收文本事件做修正用 LLMForecaster；零样本跨品类用时序基础模型。"
workflow: "准备 24 个月日销量与外部变量（促销标记、竞品价格指数、搜索量、节假日） → 拟合带趋势与多重周期的模型 → 输出未来 21 天点预测与 95% 置信区间 → 把区间转成采购与库存计划"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill Card: 时间序列预测 (Time Series Forecasting)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`，sha256 `7084e8d643650c5dd766b3c0651a8e73adbe7c2e8f285b3ff14bdbaf82190efc`，14682 字节 / 458 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `2b0d75f92b9a6a26b91764b0d6ef8411b91ced57fca6791fe6ac1e7b5ddcc90b`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Time Series Forecasting (时间序列预测)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
时间序列预测解决的核心问题是：**基于历史销售数据，预测未来一段时间的需求量**，从而指导备货、定价和供应链决策。与简单外推不同， modern 时间序列模型能捕捉季节性、趋势、节假日效应和外部变量（促销、竞品）的影响。

### 数学直觉

**分解模型 (Additive)**：
$$Y(t) = Trend(t) + Seasonality(t) + Holiday(t) + Noise(t)$$

- **Trend（趋势）**：长期增长或下降趋势
- **Seasonality（季节性）**：周期性的波动（如每周、每月、每季）
- **Holiday（节假日）**：节假日效应（如双11、黑五）
- **Noise（噪声）**：随机波动

**Prophet 模型**：
$$g(t) = \frac{C}{1 + e^{-k(t - m)}} + b t \quad \text{(logistic trend)}$$
$$s(t) = \sum_{n=1}^{N} a_n \cos\left(\frac{2\pi n t}{P}\right) + b_n \sin\left(\frac{2\pi n t}{P}\right)$$

**LSTM/GRU**：
- 门控机制：输入门、遗忘门、输出门
- 长期依赖：$C_t = f_t \times C_{t-1} + i_t \times \tilde{C}_t$
- 时序记忆：隐藏状态 $h_t$ 包含历史信息

### 关键假设
- **历史可重复**：未来模式与历史相似
- **独立同分布噪声**：残差服从正态分布
- **无外部冲击**：不考虑突发事件（可通过外部变量引入）

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器周销量预测

**业务问题**：
母婴出海电商需要预测未来 4 周的销量，以指导海外仓补货。传统方法是基于移动平均或简单指数平滑，但无法捕捉：
- 周期性：周末销量通常高于工作日
- 季节性：奶粉、尿裤在大促季（618、双11、黑五）销量激增
- 趋势：新品牌上线后有爬坡期

**数据要求**：
- 历史销量：至少 2 年的日/周销量数据
- 节假日：春节、618、双11、黑五、圣诞节
- 促销标记：是否有活动、活动力度
- 外部变量：竞品价格、搜索指数

**预期产出**：
- 未来 4 周销量预测（点预测 + 置信区间）
- 预测误差评估（MAPE、RMSE）
- 关键影响因子贡献度

**业务价值**：
- 库存周转提升 15-25%
- 缺货率降低 30-50%
- 滞销库存减少 10-20%

---

### 场景二：爆款生命周期预测

**业务问题**：
新款婴儿推车、 安全座椅上市后，需要预测其生命周期曲线：导入期、成长期、成熟期、衰退期。这决定了：
- 首批采购量（多了压库存，少了丢销售）
- 价格策略（成长期可维持高价，衰退期需清仓）
- 备货节奏（成长期需频繁补货）

**数据要求**：
- 新品上市后前 4-8 周的销售数据
- 同品类历史新品曲线（参考相似产品）
- 竞品上市信息

**预期产出**：
- 未来 12 周销量预测曲线
- 峰值销量和峰值时间预测
- 生命周期阶段判断

**业务价值**：
- 新品首批库存准确率提升 30%+
- 价格策略优化增加毛利 5-10%
- 避免滞销品积压

---

（**换底正文在此截断** —— 完整卡正文共 458 行，本页内联到第 92 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：24 个月日销量（卡页按欧洲、北美、日本三站点分别统计）、周促销标记、竞品价格指数、Google Trends 搜索量、节假日日历；粒度：SKU×站点×日。

**输出**：未来 21 天日销量点预测与 95% 置信区间及量化改善对照（卡页：MAPE 由 22.5% 降至 12.3%、缺货率由 18% 降至 5.2%），供采购与库存决策使用。

## 执行步骤

1. 整理日销量与外部变量并对齐口径
2. 拟合趋势与多重周期模型
3. 输出点预测与 95% 置信区间
4. 把区间转为采购与补货建议
5. 上线后按周复盘预测误差

## 边界与不做

- 数据不满足时不用：历史不足 12 个月、或站点数据未分开统计时，季节性无法稳定估计。
- 能力边界：产出预测与区间，采购下单与库存调整仍需人工确认。
- 能力边界：预测仅作决策参考，突发事件下需人工干预。

## 技能关联

- **前置**：Skill-数据清洗与特征工程
- **延伸**：Skill-定价策略优化、Skill-库存优化与补货策略
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-供应链风险预警、Skill-促销效果评估、Skill-时间序列预测、Skill-Time-Series-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Time-Series-Forecasting`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（290 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`）。
>
> - venue 档位：non-paper
> - 证据基础：author-practice
>
> - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`）。
> >
> > - venue 档位：non-paper
> > - 证据基础：author-practice
> >
> > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`）。
> > >
> > > - venue 档位：non-paper
> > > - 证据基础：author-practice
> > >
> > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Time-Series-Forecasting`（完整卡：`references/full-card.md`）。
> > > >
> > > > - venue 档位：non-paper
> > > > - 证据基础：author-practice
> > > >
> > > > - 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > （卡页此段未自动抽取，本卡未记录论文出处。）
