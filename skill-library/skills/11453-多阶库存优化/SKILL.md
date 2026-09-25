---
name: "p2s-multi-echelon-inventory"
title: "Multi-Echelon Inventory Optimization (多阶库存优化)"
description: "触发词：多阶库存、安全库存、再订货点、补货触发点、服务水平。何时不用：只想按公式算单点该补多少货用「补货模拟」，要预测未来销量用「需求预测」；本技能是按链路结构算各级该备多少。安全边界：结论依赖提前期、成本与服务水平参数，改动 ERP 里的库存策略参数须人工复核后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-050"
l3_business: "库存分层"
l3_all: "库存分层 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/库存分层"
quality_tier: "curated"
p2s_card_id: "Skill-Multi-Echelon-Inventory"
p2s_src_domain: "04-供应链"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Multi-Echelon-Inventory"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Multi-Echelon-Inventory.md"
rebase_source_sha256: "e3a6cf2472b962619ce45c009e182a3f1f754b12af89b25459f7dff95d5999c4"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "e3a6cf2472b962619ce45c009e182a3f1f754b12af89b25459f7dff95d5999c4"
rebase_full_card_bytes: "14364"
rebase_full_card_lines: "414"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "f57ce1ae1c2e5fa46d27ceece7752783214a0e3fcd0106831eca4bbfd95169dd"
user_summary: "给工厂到国内仓再到海外仓的整条链路，算出每级该备多少安全库存、跌到多少件就该补货。"
user_try: "试试：暖奶器 WN-200 国内仓和海外仓各该备多少安全库存？海外仓跌到多少件就该触发补货？"
whenToUse: "已有 1-2 年日销量、各段提前期与成本参数，需要给链路各级定安全库存与补货触发点时用；只算单点补货量用「补货模拟」，要预测销量用「需求预测」。"
workflow: "整理日销量与各段提前期、成本、服务水平参数 → 按服务水平折算 z 值算各级安全库存 → 算各节点再订货点与补货触发点 → 用报童模型校验订购量是否合理 → 输出各节点库存建议与周转率改善预期"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Multi-Echelon Inventory Optimization (多阶库存优化)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`，sha256 `e3a6cf2472b962619ce45c009e182a3f1f754b12af89b25459f7dff95d5999c4`，14364 字节 / 414 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `f57ce1ae1c2e5fa46d27ceece7752783214a0e3fcd0106831eca4bbfd95169dd`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Multi-Echelon Inventory Optimization (多阶库存优化)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
多阶库存优化解决的核心问题是：**如何在供应链的多个节点（工厂→仓库→配送中心→门店）之间分配库存，使得总成本最低的同时保证服务水平**。与单点库存管理不同，多阶优化需要考虑节点间的依赖关系、订货提前期和需求传递效应。

### 数学直觉

**报童模型 (Newsvendor Model)** - 单产品单周期：
$$Q^* = F^{-1}\left(\frac{p - c}{p}\right) = F^{-1}\left(\frac{c_u}{c_u + c_o}\right)$$

其中：
- $Q^*$ 是最优订购量
- $c_o$ 是缺货成本（lost profit per unit）
- $c_u$ 是未售出成本（holding cost per unit）
- $F$ 是需求分布的累积函数

**(s, S) 策略** - 连续检查：
- 当库存降到 s 时，订货到 S 水平
- 订货量 = S - 当前库存
- s = 安全库存，取决于服务水平

**安全库存计算**：
$$SS = z \times \sigma_L = z \times \sqrt{\sum_{i}(L_i \times \sigma_{D_i}^2)}$$

其中 $L_i$ 是第 i 阶段的提前期，$\sigma_{D_i}$ 是需求标准差。

### 关键假设
- **需求独立同分布**：各节点需求相互独立，分布已知
- **补货周期固定**：提前期已知（可设为随机变量）
- **无限产能**：供应商产能充足
- **服务水平约束**：需满足预设的订单履约率

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器海外仓备货策略优化

**业务问题**：
母婴出海电商在海外建立仓储物流体系，通常包含国内工厂 → 国内仓库 → 海外仓 → 消费者。由于跨境物流周期长（15-30天）、需求波动大，库存过多会导致仓储成本高、资金占用大，库存过少会导致缺货、丢失销售机会。需要科学计算各节点的合理库存量。

**数据要求**：
- 历史销量数据：SKU 级别日/周销量（建议 2 年）
- 物流参数：各段运输时长（工厂→国内仓、国内仓→海外仓）
- 成本参数：单位仓储成本、单位缺货成本、订货固定成本
- 服务水平目标：订单履约率 95%+

**预期产出**：
- 各节点安全库存建议（国内仓、海外仓）
- 最佳补货触发点（reorder point）
- 补货量计算公式
- 库存周转率预期

**业务价值**：
- 海外仓库存成本降低 20-30%（假设月仓储成本 30 万，可节省 6-9 万）
- 缺货率降低 50%+（从 10% 降至 5% 以下）
- 资金周转提升 15-25%

---

### 场景二：爆款SKU动态备货

**业务问题**：
母婴出海商品存在明显的季节性（奶粉、尿裤大促季）和趋势性（新款婴儿推车上市）。传统的固定安全库存策略无法适应需求变化，需要根据销售趋势动态调整库存。

**数据要求**：
- 实时销量数据：近 30 天滚动销量
- 趋势指标：销量增长率、季节指数
- 物流参数：当前库存、在途订单、预计到货时间
- 竞品数据（可选）：竞品价格、活动力度

**预期产出**：
- 动态安全库存建议（随趋势调整）
- 预警清单：哪些 SKU 需要补货、哪些需要清仓
- 补货优先级排序

**业务价值**：
- 爆款缺货率降低 60%+
- 滞销品库存清理提前 2-4 周
- 整体库存周转提升 20%

---

（**换底正文在此截断** —— 完整卡正文共 414 行，本页内联到第 91 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：两类入参：① SKU 级历史日销量序列（示例用 730 天）与需求标准差；② 链路参数——各段提前期（工厂→国内仓、国内仓→海外仓、海外仓→消费者）、单位仓储成本、单位缺货成本、每批订货固定成本，以及目标服务水平（示例 95%）。

**输出**：各节点安全库存量与再订货点（补货触发点）、对应的补货量公式结果（ROP = 日销均值 × 提前期 + 安全库存）、以及库存周转率的改善预期；供供应链把参数落到 ERP 的库存策略里。

## 执行步骤

1. 收集 SKU 历史日销量与各段提前期、仓储成本、缺货成本、订货固定成本
2. 设定目标服务水平并折算 z 值，按 SS = z × 需求标准差 × 提前期平方根 计算各级安全库存
3. 按 日销均值 × 提前期 + 安全库存 算出各节点再订货点与补货触发点
4. 用报童模型在售价、成本、残值下校验最优订购量
5. 输出各节点建议库存量与库存周转率改善预期，标注参数更新周期

## 边界与不做

- 数据不满足时不用：缺日销量历史或各段实际提前期的链路无法算安全库存与再订货点。
- 只产出库存参数建议，不直接改 ERP 或下单；提前期、成本、服务水平变动后需重算。
- 卡页给出的安全库存、触发点与周转率数字为单一 SKU 的示例口径，换品类须用本店数据重算。

## 技能关联

- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL、Skill-Multi-Echelon-Inventory

---

> 分类：业务运营/供应与履约/库存分层　·　技术族：04-供应链　·　源卡：`Skill-Multi-Echelon-Inventory`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（266 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Multi-Echelon-Inventory`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1502.01592，但该号在 arXiv 上是《Planck 2015 results. XVII. Constraints on primordial non-Gaussianity》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Optimal Inventory Management in MultiEchelon Supply Chains with Stochastic Demand》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
