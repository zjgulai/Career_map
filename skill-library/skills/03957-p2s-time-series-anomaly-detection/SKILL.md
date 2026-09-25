---
name: "p2s-time-series-anomaly-detection"
title: "Time Series Anomaly Detection for E-Commerce Monitoring"
description: "触发词：时序异常检测、STL分解、残差Z分数、多指标交叉验证、根因初判、告警降噪。何时不用：要判断分布是否系统性漂移用「数据漂移检测」；要用 Agent 自动生成可解释检测规则用「Agentic时序异常检测」。安全边界：异常告警不得直接触发资金、定价或库存动作，须经人工确认；节假日与已知促销必须走上下文校验，避免误报。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 溯源监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
quality_tier: "curated"
p2s_card_id: "Skill-Time-Series-Anomaly-Detection"
p2s_src_domain: "03-时间序列"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Time-Series-Anomaly-Detection"
rebase_vault_path: "paper2skills-vault/03-时间序列/Skill-Time-Series-Anomaly-Detection.md"
rebase_source_sha256: "b87d587b2ad893e039af70afc879c105c395f4887ce2023cdbdecf779ef6d965"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b87d587b2ad893e039af70afc879c105c395f4887ce2023cdbdecf779ef6d965"
rebase_full_card_bytes: "17099"
rebase_full_card_lines: "466"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "ca324ac89debe11aef2f01524f74455ca35a5fbf8322667c03caa8b544b4db27"
user_summary: "订单量突然掉到 200 单，30 分钟内告警并给出根因初判：不是市场波动，是支付成功率从 98% 掉到 72%。"
user_try: "试试：监控日订单量，异常时先排除节假日和促销，再交叉验证转化率和支付成功率。"
whenToUse: "当某个核心指标（订单量、转化率）突然异常、需要快速判断是故障还是正常波动时用本技能；若怀疑的是输入分布系统性变化，用「数据漂移检测」；若要用 Agent 生成并解释检测规则，用「Agentic时序异常检测」。"
workflow: "取过去 90 天指标序列并做预处理 → 用 STL 分解出趋势、周内季节性与残差 → 残差超过 3 倍标准差即标记为异常 → 做上下文校验，排除节假日与已知促销 → 交叉验证多个关联指标并给出根因初判"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Time Series Anomaly Detection for E-Commerce Monitoring

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`，sha256 `b87d587b2ad893e039af70afc879c105c395f4887ce2023cdbdecf779ef6d965`，17099 字节 / 466 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `ca324ac89debe11aef2f01524f74455ca35a5fbf8322667c03caa8b544b4db27`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Time Series Anomaly Detection

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心问题**：母婴出海电商的关键指标（GMV、订单量、转化率、退货率）时刻波动。如何区分"正常波动"和"真实异常"？异常检测的本质是：建立正常行为的概率模型，将低概率事件标记为异常。

**三种主流方法**：

### 统计方法（基线）

**Z-Score**：
$$z_t = \frac{x_t - \mu}{\sigma}$$
$|z_t| > 3$ 视为异常。简单但假设数据服从正态分布。

**STL分解 + 残差检验**：
1. 将时序分解为趋势（Trend）、季节性（Seasonal）、残差（Residual）
2. 对残差应用Z-Score或IQR规则
3. 分离季节性后，异常更易识别

### 机器学习方法

**Isolation Forest**：
- 核心思想：异常点是"容易被孤立"的点
- 随机选择特征和切分点构建多棵决策树
- 异常点的平均路径长度显著短于正常点
- 优势：无需标注数据，对高维特征友好

**Prophet + 区间外检测**：
- Prophet预测未来值及其置信区间
- 实际值落在置信区间外即标记为异常
- 优势：天然处理季节性和节假日效应

### 深度学习方法（前沿）

**AutoEncoder重构误差**：
- 用正常数据训练AutoEncoder学习"正常模式"
- 异常数据的重构误差显著大于正常数据
- 优势：捕获复杂的非线性模式

**VAE（变分自编码器）概率异常检测**：
- 不仅看重构误差，还看后验概率
- 异常点的后验分布与正常分布差异大
- 2025年前沿：结合Transformer的时序VAE

**反直觉洞察**：
- 95%的"异常告警"是误报——因为业务指标天然波动大（促销、周末、节假日）
- 好的异常检测不是灵敏度越高越好，而是**上下文感知**——知道今天是黑五，GMV翻倍是正常的
- 最简单的方法（STL + 3-sigma）在80%的场景下足够，深度学习只在复杂多变量场景有优势

---

## ② 母婴出海应用案例

### 场景1：订单量异常监控

**业务问题**：Momcozy 的日订单量通常在500-800单之间波动。某天订单量突然降到200单——是系统Bug、支付通道故障、还是正常的市场波动？

**检测流程**：
1. **数据预处理**：取过去90天日订单量
2. **STL分解**：分离趋势、季节性（周内模式）、残差
3. **残差异常检测**：残差超过3倍标准差标记为异常
4. **上下文校验**：检查当天是否为节假日、是否有已知促销活动
5. **多指标交叉验证**：同时检查转化率、客单价是否同步异常

**预期产出**：
- 异常检测：订单量残差 = -4.2σ → 标记为异常
- 根因定位：转化率正常，但支付成功率从98%降到72% → 支付通道故障
- 告警延迟：<30分钟（实时检测）

**业务价值**：
- 支付通道故障的平均发现时间：4小时 → 30分钟
- 避免损失：故障期间订单量损失约50%，快速修复可减少80%损失

### 场景2：退货率异常预警

**业务问题**：某批次婴儿推车退货率从正常的5%飙升到15%。需要尽早发现，避免更多问题订单发出。

**检测流程**：
1. **滚动窗口监控**：7天滚动退货率
2. **Prophet预测**：基于历史数据预测正常退货率区间
3. **异常标记**：实际值超出95%置信区间
4. **维度下钻**：按SKU、仓库、物流商拆解，定位问题来源

**预期产出**：
- 告警触发：退货率超出预测区间上限
- 根因：某仓库发货的SKU混入了错误配件
- 止损：及时暂停该仓库发货，避免问题扩大

---

（**换底正文在此截断** —— 完整卡正文共 466 行，本页内联到第 96 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：单变量时序指标数据（如日订单量，卡页示例取 90 天窗口），以及节假日日历与促销活动表用于上下文校验；粒度为日 × 指标。

**输出**：异常点标记与残差偏离度、根因初判结论（如支付通道故障）与告警记录；供运营与风控在 30 分钟内定位并处置。

## 执行步骤

1. 取过去 90 天指标序列并完成缺失与异常值预处理
2. 用 STL 分解出趋势项、周内季节项与残差
3. 对残差做 Z 分数检验，超过 3 倍标准差标记异常
4. 做上下文校验，排除节假日与已知促销造成的正常波动
5. 交叉验证转化率、支付成功率等关联指标并给出根因初判

## 边界与不做

- 数据不满足：历史序列太短或指标口径变动频繁时残差基线不可靠，先固定口径并积累窗口数据。
- 何时不用：系统性分布漂移用「数据漂移检测」，规则自动生成用「Agentic时序异常检测」。
- 能力边界：只做检测与根因初判，不自动执行修复，也不直接触发任何业务动作。
- 安全边界：告警须人工确认后才可触发资金、定价或库存动作。

## 技能关联

- **前置**：Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Time-Series-Anomaly-Detection

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：03-时间序列　·　源卡：`Skill-Time-Series-Anomaly-Detection`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（314 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Time-Series-Anomaly-Detection`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1902.08387，但该号在 arXiv 上是《Complexity and invariant measure of the period-doubling subshift》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Anomaly Detection in Time Series: A Comprehensive Evaluation》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
