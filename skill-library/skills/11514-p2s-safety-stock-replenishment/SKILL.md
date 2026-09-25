---
name: "p2s-safety-stock-replenishment"
title: "Safety Stock and Replenishment Strategy"
description: "触发词：安全库存、再订货点、经济订货量、EOQ、服务水平。何时不用：前置期本身波动大时用「前置期需求联合建模」；要按价格阶梯凑量时用「动态批量与MOQ」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-048"
l3_business: "补货模拟"
l3_all: "补货模拟"
l1_l2_l3: "业务运营/供应与履约/补货模拟"
quality_tier: "curated"
p2s_card_id: "Skill-Safety-Stock-Replenishment"
p2s_src_domain: "04-供应链"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Safety-Stock-Replenishment"
rebase_vault_path: "paper2skills-vault/04-供应链/Skill-Safety-Stock-Replenishment.md"
rebase_source_sha256: "c450f4d320449df06e6ca011845c4c8ed4608128347ad4f11c2451b474628968"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "c450f4d320449df06e6ca011845c4c8ed4608128347ad4f11c2451b474628968"
rebase_full_card_bytes: "9403"
rebase_full_card_lines: "254"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "99773b275e6aa09dec92bed5443af3a59a7dc83a623feb975e6c6680767aac9d"
user_summary: "最基础的一笔账：该备多少安全库存、什么时候下单、一次订多少罐。"
user_try: "试试：周需求 200±40 罐、交期 6 周、95% 服务水平，算安全库存、再订货点和 EOQ。"
whenToUse: "需求与前置期相对稳定、要定安全库存、再订货点与订货量三件套时用；前置期波动大或要凑 MOQ 时换对应技能。"
workflow: "由目标服务水平查 z 值计算安全库存 → 用前置期需求加安全库存算再订货点 → 按年需求、订货成本与持有成本算经济订货量 → 输出平均库存、周转率与年总成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Safety Stock and Replenishment Strategy

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`，sha256 `c450f4d320449df06e6ca011845c4c8ed4608128347ad4f11c2451b474628968`，9403 字节 / 254 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `99773b275e6aa09dec92bed5443af3a59a7dc83a623feb975e6c6680767aac9d`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Safety Stock & Replenishment

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：需求预测告诉你"预计卖多少"，安全库存告诉你"为了防止意外，应该多备多少"。补货策略告诉你"什么时候下单、下多少"。三者构成供应链决策的完整链条。

**安全库存公式**：

$$SS = Z \cdot \sigma_{LTD}$$

其中：
- $Z$ = 服务水平对应的标准正态分位数（95%服务水平 → Z=1.65）
- $\sigma_{LTD}$ = 提前期需求的标准差 = $\sigma_D \cdot \sqrt{LT}$
- $\sigma_D$ = 周需求标准差
- $LT$ = 提前期（周）

**再订货点（Reorder Point, ROP）**：

$$ROP = \bar{D}_{LT} + SS = \bar{D} \cdot LT + Z \cdot \sigma_D \cdot \sqrt{LT}$$

当库存降到ROP时触发补货。

**补货量（Order Quantity）**：

经典**经济订货量（EOQ）**：
$$EOQ = \sqrt{\frac{2 \cdot D \cdot S}{H}}$$
- $D$ = 年需求量
- $S$ = 每次订货固定成本
- $H$ = 单位年持有成本

但EOQ假设需求恒定，电商场景更常用**动态补货量**：
- 补到目标库存水平（Order-Up-To）
- 目标库存 = 预测需求 + 安全库存

**（Q, R）策略 vs （T, S）策略**：

| 策略 | 触发条件 | 适用场景 |
|------|---------|---------|
| （Q, R） | 库存降到R，补Q | 高价值SKU，监控成本高 |
| （T, S） | 每T周期检查，补到S | 低价值SKU，批量处理 |
| （R, S） | 库存降到R，补到S | 最常用，灵活且简单 |

**反直觉洞察**：
- 安全库存不与平均需求成正比，而与**需求波动×提前期**成正比。需求稳定但 lead time 长的SKU，安全库存可能比高需求SKU还大。
- 服务水平从95%提升到99%，安全库存增加约40%——但多卖的收入可能不抵库存成本。
- 合并补货（多个SKU一起下单）可以大幅降低订货成本，但增加了协调复杂度。

---

## ② 母婴出海应用案例

### 场景1：奶粉SKU的安全库存计算

**业务问题**：Momcozy 销售某品牌3段奶粉，供应商在德国，海运 lead time 6周。需要确定：
- 安全库存多少罐？
- 再订货点多少罐？
- 每次补货多少罐？

**参数**：
- 平均周需求：200罐
- 周需求标准差：40罐
- Lead time：6周
- 目标服务水平：95%（Z=1.65）
- 年需求量：10,400罐
- 每次订货成本：$500（运费+报关）
- 单位年持有成本：$2.4/罐（仓储+资金占用）

**计算**：
1. **安全库存**：$SS = 1.65 \cdot 40 \cdot \sqrt{6} = 162$ 罐
2. **再订货点**：$ROP = 200 \cdot 6 + 162 = 1,362$ 罐
3. **经济订货量**：$EOQ = \sqrt{2 \cdot 10400 \cdot 500 / 2.4} = 2,083$ 罐

**决策**：
- 当库存降到1,362罐时，下单2,083罐
- 平均库存水平 = 1,362/2 + 162 ≈ 843罐
- 年订货次数 = 10,400 / 2,083 ≈ 5次

### 场景2：多SKU联合补货

**业务问题**：同一供应商有10个SKU，单独补货每个SKU运费$500，联合补货总运费$800。如何决定哪些SKU一起补？

**策略**：
- 按 lead time 分组：相同 lead time 的SKU一起补
- 按销量分组：高销量SKU频繁补，低销量SKU定期补
- 按体积分组：凑集装箱

---

（**换底正文在此截断** —— 完整卡正文共 254 行，本页内联到第 92 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：单位时间需求均值与标准差（如周需求 200 罐、标准差 40 罐）、前置期时长、目标服务水平、年需求量、每次订货成本与单位年持有成本，单 SKU 粒度。

**输出**：安全库存、再订货点、经济订货量与平均库存，以及年订货成本、持有成本、总成本与库存周转次数，供日常补货决策。

## 执行步骤

1. 读取需求分布、前置期与成本参数
2. 按目标服务水平计算安全库存
3. 用前置期需求加安全库存得到再订货点
4. 计算经济订货量与平均库存
5. 输出周转率与年总成本

## 边界与不做

- 数据不满足时不适用：需求标准差缺失，或前置期波动显著偏离正态假设（如跨境海运的长尾延误）时，本公式会低估风险。
- 能力边界：只给三件套参数与成本，不替代供应商谈判，也不处理清仓与调拨。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain
- **延伸**：Skill-Two-Echelon-Inventory-DRL.html、Skill-Two-Echelon-Inventory-DRL
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-FSDA-DRL.html、Skill-FSDA-DRL、Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-Multilevel_FLP.html、Skill-Multilevel_FLP、Skill-PPO_swap.html、Skill-PPO_swap、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Safety-Stock-Replenishment

---

> 分类：业务运营/供应与履约/补货模拟　·　技术族：04-供应链　·　源卡：`Skill-Safety-Stock-Replenishment`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（141 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Safety-Stock-Replenishment`（完整卡：`references/full-card.md`）。
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
