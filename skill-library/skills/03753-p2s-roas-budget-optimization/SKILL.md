---
name: "p2s-roas-budget-optimization"
title: "ROAS Optimization and Ad Budget Allocation"
description: "触发词：边际ROAS、花费收入曲线、预算再分配、决策反转、渠道升降预算。何时不用：各渠道花费档位过少导致曲线拟合不可靠时不适用；只看边际ROAS不看毛利率时改用MMM预算利润对齐。安全边界：只产出分配方案与预估，不执行平台预算变更，削减渠道时须与投放负责人确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
quality_tier: "curated"
p2s_card_id: "Skill-ROAS-Budget-Optimization"
p2s_src_domain: "13-广告分析"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-ROAS-Budget-Optimization"
rebase_vault_path: "paper2skills-vault/13-广告分析/Skill-ROAS-Budget-Optimization.md"
rebase_source_sha256: "7c6c9b4b287ced536b21deed87c81f6831851fa5f115752b2f13eef4755e6394"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "7c6c9b4b287ced536b21deed87c81f6831851fa5f115752b2f13eef4755e6394"
rebase_full_card_bytes: "9533"
rebase_full_card_lines: "240"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "1e7a0a3659016da6b871e6cb7f59ce1410ba233a0800e1a0fe0373ce4df6a702"
user_summary: "比较各渠道的边际 ROAS 而不是平均 ROAS，把预算加到还在上升期的渠道上。"
user_try: "试试：月预算50万，Facebook 30万 ROAS 2.8、Google 15万 3.5、TikTok 5万 1.8，帮我按边际 ROAS 重新分配。"
whenToUse: "当要决定各渠道该加预算还是减预算、且已有多个花费档位的历史数据时用本卡；需要带毛利率口径的取舍用 MMM 预算利润对齐；需要按饱和度阈值触发小步调整用渠道预算再分配触发器。"
workflow: "汇总各渠道历史花费与收入序列 → 对 log 花费与 log 收入做回归拟合响应曲线 → 计算各渠道平均 ROAS 与边际 ROAS → 按边际 ROAS 排序决定增、减或维持 → 在总预算约束下求解再分配并预估整体 ROAS"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# ROAS Optimization and Ad Budget Allocation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`，sha256 `7c6c9b4b287ced536b21deed87c81f6831851fa5f115752b2f13eef4755e6394`，9533 字节 / 240 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `1e7a0a3659016da6b871e6cb7f59ce1410ba233a0800e1a0fe0373ce4df6a702`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: ROAS Optimization & Budget Allocation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：广告预算有限，如何在不同渠道（Facebook/Google/TikTok）、不同 campaign、不同受众之间分配，使总ROAS（广告支出回报率）最大化？

**ROAS = 广告带来的收入 / 广告花费**

**边际收益递减**：
- 每个渠道都存在"甜蜜点"——预算过少时，算法没足够数据优化；预算过多时， Audience 耗尽，成本飙升
- Facebook的第1万刀可能ROAS=4，第10万刀可能ROAS=1.5
- 最优分配：让每个渠道的**边际ROAS相等**

**预算分配策略**：

| 策略 | 逻辑 | 适用场景 |
|------|------|---------|
| **Equal ROAS** | 各渠道ROAS目标相同 | 成熟稳定期 |
| **Marginal ROAS Equalization** | 各渠道边际ROAS相等时总收益最大 | 有充足数据时 |
| **Portfolio Optimization** | 用均值-方差优化，平衡收益和风险 | 多渠道大规模投放 |
| **Thompson Sampling** | 多臂老虎机，动态探索-利用 | 新渠道测试期 |

**边际ROAS计算**：

对历史数据拟合花费-收入曲线（通常是凹函数）：
$$Revenue = a \cdot Spend^b, \quad 0 < b < 1$$

边际ROAS = d(Revenue)/d(Spend) = $a \cdot b \cdot Spend^{b-1}$

当所有渠道的边际ROAS相等时，总预算分配最优。

**反直觉洞察**：
- 不应该"把所有预算给ROAS最高的渠道"——边际递减会让它迅速变差
- 新渠道的"测试预算"不是浪费——是购买信息的成本，信息价值 > 短期ROAS损失
- 日预算是算法的枷锁——Facebook的算法在3-7天学习期内表现不稳定，日预算太小会导致频繁进入学习期

---

## ② 母婴出海应用案例

### 场景1：三渠道预算重新分配

**业务问题**：Momcozy 月预算50万，当前分配：Facebook 30万（ROAS 2.8）、Google 15万（ROAS 3.5）、TikTok 5万（ROAS 1.8）。团队想把TikTok预算砍了加到Google。

**边际ROAS分析**：

| 渠道 | 当前花费 | 当前ROAS | 边际ROAS | 建议动作 |
|------|---------|---------|---------|---------|
| Facebook | 30万 | 2.8 | 1.5 | 维持 |
| Google | 15万 | 3.5 | 2.0 | 增加预算 |
| TikTok | 5万 | 1.8 | 2.5 | **增加预算** |

**决策反转**：TikTok当前ROAS最低，但边际ROAS最高——说明它还在上升期，加大投入效率最高。Google虽然平均ROAS高，但边际ROAS已经下降。

**新分配**：
- Facebook: 28万（-2万）
- Google: 18万（+3万）
- TikTok: 10万（+5万）

### 场景2：Campaign层级的动态预算调整

**业务问题**：双11期间，有5个Facebook campaign在跑，如何根据实时ROAS动态调整预算？

**Thompson Sampling策略**：
1. 每个campaign是一个"臂"
2. 每小时更新ROAS后验分布
3. 按概率采样选择"可能最好"的campaign加预算
4. 同时保留20%预算给表现一般的campaign（探索）

---

（**换底正文在此截断** —— 完整卡正文共 240 行，本页内联到第 75 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：各渠道历史花费与对应收入的成对数据（需覆盖多个花费档位以拟合曲线）与总预算约束；数据口径需与渠道后台对账一致。

**输出**：各渠道的花费-收入曲线参数、当前平均 ROAS 与边际 ROAS、建议动作（增加、维持、削减）与再分配后的整体 ROAS 预估，供媒体经理决策。

## 执行步骤

1. 汇总各渠道历史花费与收入序列
2. 用对数线性回归拟合 Revenue = a × Spend^b 的响应曲线
3. 计算各渠道当前平均 ROAS 与边际 ROAS
4. 按边际 ROAS 排序决定增加、维持或削减
5. 在总预算约束下求解再分配方案并预估整体 ROAS 变化

## 边界与不做

- 何时不用：各渠道花费档位过少导致曲线拟合不可靠、或渠道只有一个时不适用。
- 能力边界：只产出分配方案与预估，不执行平台预算变更；只看边际 ROAS 不看毛利率时结论可能偏离利润目标。
- 口径边界：边际 ROAS 依赖曲线拟合质量，历史投放结构发生突变时需重新拟合。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling
- **延伸**：Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-Audience-Knowledge-Graph.html、Skill-Audience-Knowledge-Graph、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-PVM-Attribution-Window-Harmonization.html、Skill-PVM-Attribution-Window-Harmonization、Skill-ROAS-Budget-Optimization

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：13-广告分析　·　源卡：`Skill-ROAS-Budget-Optimization`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（144 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-ROAS-Budget-Optimization`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1906.00138，但该号在 arXiv 上是《Efficient Adaptation of Pretrained Transformers for Abstractive Summarization》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Budget Allocation for Online Advertising via Marginal ROAS Optimization》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
