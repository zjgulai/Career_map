---
name: "p2s-prophet-forecasting"
title: "Prophet Forecasting with Seasonality and Holidays"
description: "触发词：Prophet、节假日效应、季节性预测、置信区间、备货方案。何时不用：需要多变量协变量与注意力解释时用「TFT 多水平预测」；要剥离节日脉冲做增长率修正时用「节日峰值分解」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
quality_tier: "curated"
p2s_card_id: "Skill-Prophet-Forecasting"
p2s_src_domain: "03-时间序列"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Prophet-Forecasting"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Prophet-Forecasting.md"
rebase_source_sha256: "a1ea8365888c78f0c7ee6ccfc1d41da87f95a8e60156527cdeba34e952f28b9c"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a1ea8365888c78f0c7ee6ccfc1d41da87f95a8e60156527cdeba34e952f28b9c"
rebase_full_card_bytes: "9571"
rebase_full_card_lines: "246"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "aca17622ddb7b14ca71225d509f0cc4ecc73c02cd260c2bf39f0100d4845a94e"
user_summary: "用现成的季节与节假日模型把旺季销量和区间算出来，备货时能同时给出乐观和悲观两套方案。"
user_try: "试试：用 Prophet 拟合我两年周销，预测到黑五并给出 95% 区间，我要两套备货方案。"
whenToUse: "需要快速拿到含季节与节假日效应的预测和置信区间时用；要多变量协变量与注意力解释用 TFT；要剥离节日脉冲修正增长用节日峰值分解。"
workflow: "整理过去 2 年周销量并标注节假日 → 拟合趋势、季节与节假日项并设置变点 → 预测覆盖大促到圣诞的 16 周 → 按置信区间输出乐观与悲观备货方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Prophet Forecasting with Seasonality and Holidays

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`，sha256 `a1ea8365888c78f0c7ee6ccfc1d41da87f95a8e60156527cdeba34e952f28b9c`，9571 字节 / 246 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `aca17622ddb7b14ca71225d509f0cc4ecc73c02cd260c2bf39f0100d4845a94e`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Prophet Forecasting

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：业务时序数据充满"人造季节性"——黑五、Prime Day、圣诞促销让销量暴涨，春节让物流停滞。传统ARIMA难以处理这些不规则的节假日效应，而Prophet专为业务时序设计。

**Prophet的加法模型**：

$$y(t) = g(t) + s(t) + h(t) + \epsilon_t$$

- **$g(t)$ 趋势项**：分段线性或逻辑增长趋势，自动检测变化点（changepoints）
- **$s(t)$ 季节性项**：用傅里叶级数建模年周期、周周期、日周期
- **$h(t)$ 节假日项**：用户自定义节假日列表，每个节假日可独立建模效应大小和前后影响窗口
- **$\epsilon_t$ 误差项**：假设服从正态分布

**关键设计**：

1. **趋势变化点自动检测**：不需要手动指定断点，Prophet自动在80%均匀分布的位置检测趋势变化
2. **节假日效应可定制**：每个节假日可指定：
   - `prior_scale`：效应强度（黑五=10倍于普通节日）
   - `lower_window` / `upper_window`：影响前后几天（黑五前3天预热+后2天回落）
3. **缺失值和异常值鲁棒**：内置异常值处理，不需要预处理
4. **不确定性区间**：输出预测值的同时给出置信区间

**NeuralProphet（2025年演进）**：

将Prophet与PyTorch结合：
- 用神经网络替代傅里叶季节性
- 支持自回归（AR）组件
- 支持多变量输入（外部回归量自动学习非线性关系）
- 训练速度显著提升

**反直觉洞察**：
- Prophet在"有规律的业务数据"上表现极好，但在"高频、高噪声"数据上不如深度学习模型（如TFT、N-BEATS）
- 节假日效应往往被低估——黑五的销量可能是平时的10倍，但模型如果只学到了"5倍"，会严重低估备货需求
- 趋势变化点检测对参数敏感：`changepoint_prior_scale`从0.05调到0.5，趋势灵活性增加10倍

---

## ② 母婴出海应用案例

### 场景1：黑五促销期的销量预测

**业务问题**：Momcozy 需要在8月预测11月黑五期间的销量，用于提前向供应商备货（lead time 12周）。黑五期间销量通常是平时的5-10倍，传统方法严重低估。

**Prophet应用**：
1. **定义节假日**：

2. **拟合模型**：用过去2年周销量数据训练
3. **预测未来16周**：覆盖黑五到圣诞季
4. **输出置信区间**：用于制定乐观/悲观两种备货方案

**预期产出**：
- 黑五周预测准确率（WAPE）：基线方法 40% → Prophet 18%
- 备货精准度：从"备货过多/过少"到"95%置信区间内"
- 资金效率：库存周转从4次/年提升到6次/年

### 场景2：多品类协调预测

**业务问题**：同时预测奶粉、纸尿裤、辅食三个品类的周销量，确保各品类的预测之和等于总销量预测（分层协调）。

**分层Prophet**：
1. 顶层：总销量Prophet
2. 中层：各品类独立Prophet
3. 底层：各SKU独立Prophet
4. 用`hierarchicalforecast`库进行预测协调

---

（**换底正文在此截断** —— 完整卡正文共 246 行，本页内联到第 79 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：过去 2 年周销量（含日期）、节假日日历、预测跨度；粒度：SKU×周。

**输出**：未来 16 周预测、趋势与季节分解、95% 置信区间及乐观/悲观两套备货方案，供向供应商提前备货使用。

## 执行步骤

1. 准备周销量序列并配置节假日
2. 拟合趋势、季节与节日项
3. 预测覆盖大促与圣诞的周期
4. 按置信区间输出两套备货方案

## 边界与不做

- 数据不满足时不用：历史不足一年、或大促未登记进节假日日历时，旺季峰值会被低估。
- 能力边界：只做单变量时序预测，不吸收广告、价格、竞品等外生变量。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Prophet-Forecasting

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Prophet-Forecasting`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（146 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Prophet-Forecasting`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1703.07793，但该号在 arXiv 上是《A model for continuous thermal Metal to Insulator Transition》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Forecasting at Scale》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
