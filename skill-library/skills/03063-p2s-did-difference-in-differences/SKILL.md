---
name: "p2s-did-difference-in-differences"
title: "Difference-in-Differences (DiD) for Causal Effect Estimation"
description: "触发词：双重差分、平行趋势、处理组对照、促销因果效应、事件研究。何时不用：要评估单站点功能增量的因果影响用「推荐系统财务归因」；要看促销的供应侧全成本用「促销供应侧 ROI」。安全边界：平行趋势假设需业务判断，不满足时结论不可用；分析所需用户级数据须脱敏并遵守隐私法规。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 采购比价"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
quality_tier: "curated"
p2s_card_id: "Skill-DiD-Difference-in-Differences"
p2s_src_domain: "01-因果推断"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-DiD-Difference-in-Differences"
rebase_vault_path: "paper2skills-vault/01-因果推断/Skill-DiD-Difference-in-Differences.md"
rebase_source_sha256: "64b04f115d8873b958bdeac8ff41cd57f910211321c0f39cb5463a2f3be9ffee"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "64b04f115d8873b958bdeac8ff41cd57f910211321c0f39cb5463a2f3be9ffee"
rebase_full_card_bytes: "21088"
rebase_full_card_lines: "525"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "5335f07f6474731da1e93f651a71df276303576bce267233edac63b43af76953"
user_summary: "用处理组和对照组的对比剥离季节与大势，算出促销或政策变化到底带来了多少净增量。"
user_try: "试试：以英国站为对照、德国站为处理组，算出暖奶器满减活动的净增量销量与收益。"
whenToUse: "有明确处理组与对照组、要剥离时间趋势估计净效应时用本技能；单站点功能增量用「推荐系统财务归因」；促销供应侧成本核算用「促销供应侧 ROI」。"
workflow: "定义处理组、对照组与结果变量（如周均销量） → 定义干预前与干预后的时间窗口 → 做平行趋势检验确认两组可比 → 跑双重差分回归估计净效应与置信区间 → 用事件研究法检验效应的时间动态"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Difference-in-Differences (DiD) for Causal Effect Estimation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`，sha256 `64b04f115d8873b958bdeac8ff41cd57f910211321c0f39cb5463a2f3be9ffee`，21088 字节 / 525 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `5335f07f6474731da1e93f651a71df276303576bce267233edac63b43af76953`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Difference-in-Differences (DiD)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心思想**：利用处理组和对照组在政策/干预前后的变化差异来估计因果效应。基本逻辑是：如果没有干预，处理组的趋势应该与对照组平行（平行趋势假设）。干预后的实际差异减去趋势差异，就是干预的净效应。

**为什么需要DiD**：

母婴出海电商中有大量无法随机分配干预的场景：
- 某国突然加征关税（无法选择哪些商品被征税）
- 平台算法更新影响所有店铺（无法做A/B实验）
- 竞品在特定市场大幅降价（无法控制自己的价格）
- 物流商在某个区域暂停服务（无法选择受影响的订单）

这些场景下，DiD 是最自然的效果评估工具——用未受影响的区域/商品/时间作为对照组，剥离趋势后估计真实效应。

**数学公式**：

$$\hat{\tau}^{DiD} = (\bar{Y}_{treatment,post} - \bar{Y}_{treatment,pre}) - (\bar{Y}_{control,post} - \bar{Y}_{control,pre})$$

等价于回归形式：

$$Y_{it} = \alpha + \beta \cdot Treat_i + \gamma \cdot Post_t + \tau \cdot (Treat_i \times Post_t) + \epsilon_{it}$$

其中 $\tau$ 就是DiD估计量——交互项系数。

**关键假设**：

1. **平行趋势假设（Parallel Trends）**：若无干预，处理组和对照组的结果变量会遵循相同的时间趋势。这是DiD的核心识别假设，必须通过事件研究法（event study）进行检验。
2. **无预期效应（No Anticipation）**：处理组在干预前不会因为预期到干预而改变行为。
3. **无溢出效应（No Spillover）**：对照组不受干预的间接影响。

**Staggered DiD（交错处理）**：

现代DiD的核心进展。传统DiD假设所有处理单元在同一时间接受干预，但现实中干预往往是渐进的（如先在德国试点，再扩展到法国、英国）。Staggered DiD 处理这种情况，但传统双向固定效应（TWFE）在异质性处理效应下会产生偏误。

**最新解决方案**：
- **Callaway-Sant'Anna (2021)**：按处理队列分组，用尚未处理的单元作为对照
- **Sun-Abraham (2021)**：交互加权估计量，解决TWFE偏误
- **Borusyak et al. (2024) 插补DiD**：用对照组预测处理组的反事实结果，再用实际值减预测值

**反直觉洞察**：DiD 不要求处理组和对照组在水平上一致，只要求趋势平行。这意味着你可以用完全不同的市场（如德国 vs 日本）作为对照，只要它们的销量趋势在干预前相似。

---

## ② 母婴出海应用案例

### 场景1：关税政策对跨境销量的影响评估

**业务问题**：2025年美国对中国产婴儿推车加征25%关税。团队需要评估：关税究竟导致销量下降了多少？是自然的市场波动，还是关税的直接影响？

**应用流程**：
1. **定义处理组和对照组**：
   - 处理组：销往美国的婴儿推车（受关税影响）
   - 对照组：销往加拿大/英国的婴儿推车（未受关税影响）
2. **定义时间窗口**：
   - 干预前：2024年6月-2025年5月（12个月）
   - 干预后：2025年6月-2026年5月（12个月）
3. **检验平行趋势**：事件研究法，看干预前12个月处理组和对照组的趋势是否平行
4. **估计DiD效应**：计算交互项系数

**预期产出**：
- 关税导致的销量下降幅度（如：月均销量下降 18%，其中 12% 可归因于关税）
- 事件研究图：干预前后各月的动态效应
- 稳健性检验：安慰剂检验、替换对照组

**业务价值**：
- 精准量化关税冲击，为定价策略调整提供依据
- 评估是否需要转移产能到东南亚（如果关税效应 > 20%）
- 向投资人解释销量波动的归因

### 场景2：TikTok Shop 入驻对品牌曝光的影响

**业务问题**：某母婴品牌2025年3月入驻TikTok Shop英国站，同时在德国未入驻。需要评估TikTok Shop是否带来了增量曝光和转化。

**应用流程**：

（**换底正文在此截断** —— 完整卡正文共 525 行，本页内联到第 83 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：处理组与对照组的单元级时间序列数据，列为单元标识、时间、处理标志与结果变量（销量、转化率等），需覆盖干预前后足够期数。

**输出**：干预的净因果效应估计（系数、标准误、t 值、p 值与置信区间）及事件研究结果，用于评估促销或政策变化的真实增量。

## 执行步骤

1. 定义处理组、对照组与结果变量
2. 划分干预前后时间窗口
3. 做平行趋势检验确认可比性
4. 跑双重差分回归得到净效应与显著性
5. 用事件研究法检验效应的时间动态

## 边界与不做

- 找不到可比对照组或干预前观测期过短时不适用，平行趋势无法验证
- 只做因果效应估计，不判断业务上是否值得做，结论需与成本数据结合
- 用户级或订单级数据须脱敏使用，遵守隐私与平台数据合规要求

## 技能关联

- **前置**：Skill-A、Skill-因果推断基础
- **延伸**：Skill-Staggered-DiD与异质性处理效应、Skill-事件研究法、Skill-合成控制法
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Causal-Churn-Retention-Attribution.html、Skill-Causal-Churn-Retention-Attribution、Skill-DiD、Skill-时间序列预测、Skill-机器学习因果森林、Skill-贝叶斯统计、Skill-DiD-Difference-in-Differences

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：01-因果推断　·　源卡：`Skill-DiD-Difference-in-Differences`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（277 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-DiD-Difference-in-Differences`（完整卡：`references/full-card.md`）。
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
