---
name: "p2s-demand-forecasting-supply-chain"
title: "Demand Forecasting for Supply Chain"
description: "触发词：供应链需求预测、分层预测、多SKU批量预测、采购提前期、促销效应建模。何时不用：要按准确率口径定目标与分层用「预测准确率MAPE体系」，要处理新品零销售用「新品冷启动预测」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测"
l1_l2_l3: "业务运营/供应与履约/需求预测"
quality_tier: "curated"
p2s_card_id: "Skill-Demand-Forecasting-Supply-Chain"
p2s_src_domain: "04-供应链"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Demand-Forecasting-Supply-Chain"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Demand-Forecasting-Supply-Chain.md"
rebase_source_sha256: "92306d72d5852bc53b59c7eecf7511d4155705cb7fcac086079f4eaf45e09a25"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "92306d72d5852bc53b59c7eecf7511d4155705cb7fcac086079f4eaf45e09a25"
rebase_full_card_bytes: "10058"
rebase_full_card_lines: "253"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "e86d02b778152c79a069dc0d737b3dbd8a5dd568dbdcdcfea056f1b4937ba417"
user_summary: "按 SKU 和仓库逐层预测未来几周需求，给下采购单提供依据，别让大促又缺货或压货。"
user_try: "试试：我有 60 个 SKU-仓库组合、104 周历史销量和促销日历，帮我预测未来 4 周需求用于下采购单。"
whenToUse: "本卡属需求预测中的供应链主流程：需要在多 SKU 多仓场景下批量产出可直接用于下采购单的预测时用；只评估预测精度口径用准确率体系类技能，新品冷启动用冷启动类技能。"
workflow: "准备 104 周历史销量、促销日历、价格与外部搜索数据 → 构建滞后、促销、生命周期与季节特征 → 按 SKU-仓库分层训练并批量预测 → 输出未来 4 周需求供采购按提前期下单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Demand Forecasting for Supply Chain

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`，sha256 `92306d72d5852bc53b59c7eecf7511d4155705cb7fcac086079f4eaf45e09a25`，10058 字节 / 253 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `e86d02b778152c79a069dc0d737b3dbd8a5dd568dbdcdcfea056f1b4937ba417`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Demand Forecasting (Supply Chain)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：供应链的需求预测不同于通用时序预测——它必须考虑促销日历、竞品行动、渠道库存、季节性生命周期等商业因素。预测不准的代价是：过高→库存积压，过低→断货丢单。

**关键区别于通用时序**：

| 因素 | 通用时序 | 供应链需求预测 |
|------|---------|--------------|
| 季节性 | 自然季节性 | 促销日历驱动的"人造季节" |
| 外部变量 | 可选 | 必须（价格、促销、竞品价格） |
| 粒度 | 单SKU | SKU×仓库×渠道的多层级 |
| 更新频率 | 定期 | 实时（促销期间） |
| 评估指标 | MAE/RMSE | 偏差成本（Bias Cost） |

**分层预测（Hierarchical Forecasting）**：

需求在多个层级上存在：
- 顶层：全品类总需求
- 中层：品类/品牌维度
- 底层：SKU×仓库维度

分层预测确保各层级的预测相互一致（底层之和=中层之和=顶层）。方法：
- **Bottom-Up**：从SKU预测汇总到顶层，适合SKU差异大的场景
- **Top-Down**：从顶层按比例分解到SKU，适合SKU相似的场景
- **Middle-Out**：中层预测，向上汇总+向下分解
- **Reconciliation**：各层级独立预测后用最小二乘法协调

**促销效应建模**：

促销是母婴电商需求波动的最大来源。需要建模：
- **促销类型**：满减、折扣、买赠、捆绑
- **促销幅度**：折扣深度对销量的弹性
- **促销衰减**：促销结束后的需求回落（cannibalization + pull-forward）
- **竞争促销**：竞品同期促销对本品的交叉效应

**反直觉洞察**：
- 预测准确率不是越高越好——**预测偏差的方向更重要**。过度预测（安全）的代价是库存积压，低估预测（激进）的代价是断货。两种偏差的成本不对称。
- 新品需求预测不能用历史数据——需要用"类比法"（找相似老品的历史模式）或"Bass扩散模型"。
- 90%的预测误差来自10%的异常事件（大促、爆款、断货），而非日常波动。

---

## ② 母婴出海应用案例

### 场景1：奶粉SKU的月度需求预测

**业务问题**：Momcozy 代理某品牌奶粉在欧洲销售，涉及5个段位×3个规格×4个仓库=60个SKU-仓库组合。需要预测未来4周的周需求量，用于向供应商下采购单（ lead time 6周）。

**预测流程**：
1. **数据准备**：
   - 历史销量：过去104周（2年）的周销量
   - 促销日历：黑五、圣诞、复活节、Prime Day
   - 价格数据：自身价格 + 竞品价格
   - 外部数据：Google Trends（"baby formula"搜索指数）

2. **特征工程**：
   - 滞后销量：上周、上月同期、去年同期的销量
   - 促销特征：是否促销周、促销深度、促销类型
   - 生命周期：SKU上市周数（新品效应）
   - 季节特征：周数、是否节假日

3. **模型选择**：
   - 基线：移动平均
   - 主力：LightGBM（处理促销等非线性效应）
   - 校准：Prophet（捕捉趋势和季节性）

4. **分层协调**：
   - 先预测各仓库的总需求（Top-Down）
   - 按比例分解到各SKU
   - 用历史比例作为分解权重

**预期产出**：
- 预测准确率（WAPE）：基线 25% → 模型 15%
- 缺货率：8% → 3%
- 库存周转：4次/年 → 6次/年


（**换底正文在此截断** —— 完整卡正文共 253 行，本页内联到第 83 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：过去 104 周周销量、促销日历（黑五、圣诞、复活节、Prime Day）、自身与竞品价格、外部搜索指数；SKU×仓库×周粒度（卡面示例为 60 个 SKU-仓库组合）。

**输出**：未来 4 周的周需求预测（分层、含促销效应），输出给采购用于按 6 周提前期下单与库存计划。

## 执行步骤

1. 准备 104 周历史销量、促销日历、价格与外部搜索数据。
2. 构建滞后销量、促销、生命周期与季节特征。
3. 按 SKU-仓库分层训练模型并批量预测。
4. 输出未来 4 周需求预测，供采购按提前期下单。

## 边界与不做

- 何时不用：没有约两年的周销量历史，或促销日历缺失时促销效应无法建模，不适用本技能。
- 能力边界：预测面向补货决策，不含供应约束求解；提前期或促销规则变化后需重新训练。

## 技能关联

- **前置**：Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Temporal-Fusion-Transformer.html、Skill-Temporal-Fusion-Transformer
- **延伸**：Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **可组合**：Skill-Bass-Diffusion-New-Product-Forecasting.html、Skill-Bass-Diffusion-New-Product-Forecasting、Skill-Category-Trend-Forecasting.html、Skill-Category-Trend-Forecasting、Skill-Cross-Border-Cold-Start-Forecast.html、Skill-Cross-Border-Cold-Start-Forecast、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design、Skill-Demand-Forecasting-Supply-Chain

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：04-供应链　·　源卡：`Skill-Demand-Forecasting-Supply-Chain`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（138 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Demand-Forecasting-Supply-Chain`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2005.03825，但该号在 arXiv 上是《Learned Multi-layer Residual Sparsifying Transform Model for Low-dose CT Reconstruction》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Temporal Fusion Transformers for Interpretable Multihorizon Time Series Forecasting》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
