---
name: "p2s-causal-discovery-pc-algorithm"
title: "PC算法因果发现：从观测数据识别销售驱动因果链"
description: "触发词：因果图发现、PC算法、条件独立性检验、销量驱动因素、因果链识别。何时不用：只需渠道贡献占比与归因报表时用「DataAgent营销归因分析」；样本极少要先用领域知识打底时用「LLM 辅助因果图先验」；要秒级定位告警根因时用「ProRCA 根因溯源」。安全边界：存在未观测混杂变量时不得把图上的边直接当作干预依据，发现的因果边必须用 A/B 实验定期复核后才可用于投放与定价决策。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 渠道经营分析"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
quality_tier: "curated"
p2s_card_id: "Skill-Causal-Discovery-PC-Algorithm"
p2s_src_domain: "01-因果推断"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Causal-Discovery-PC-Algorithm"
rebase_vault_path: "paper2skills-vault/01-因果推断/Skill-Causal-Discovery-PC-Algorithm.md"
rebase_source_sha256: "a47921274e4974aa8873e77d75f6b750d5a895e94c61a0c0c50df3d3d0803823"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a47921274e4974aa8873e77d75f6b750d5a895e94c61a0c0c50df3d3d0803823"
rebase_full_card_bytes: "5767"
rebase_full_card_lines: "118"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "f034b0fe6260cb3d711cb5d563cd7b959cb2a67f38b4f1af8426102357bb5cd3"
user_summary: "用观测数据画出销售驱动因素的因果图，分清谁真正影响销量，避免把相关当因果押错策略。"
user_try: "试试：用我们 20 周的广告支出、竞品均价、季节指数、促销标记、KOL 合作数和销量跑一遍 PC 算法，输出因果图并指出真正的销量驱动因素。"
whenToUse: "当变量之间谁影响谁不明确、又做不了 A/B 实验（竞品价格、季节性、物流时效），需要先得到因果结构再定策略时用本技能；只是要算各渠道贡献占比或生成归因报告，用「DataAgent营销归因分析」；样本量小、需要领域先验引导结构，用「LLM 辅助因果图先验」；高维数据要更快求解，用「NOTEARS/DAGMA」。"
workflow: "汇总并按周对齐广告支出、竞品均价、季节指数、促销标记、KOL 合作数与销量六列数据 → 对所有变量做标准化（均值 0、方差 1） → 设定显著性水平 α=0.05 运行 PC 算法，做条件独立性检验并剔除无关边 → 识别碰撞节点并传播因果方向，输出有向无环图 → 标注关键因果路径与权重，交运营团队确定干预节点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# PC算法因果发现：从观测数据识别销售驱动因果链

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`，sha256 `a47921274e4974aa8873e77d75f6b750d5a895e94c61a0c0c50df3d3d0803823`，5767 字节 / 118 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `f034b0fe6260cb3d711cb5d563cd7b959cb2a67f38b4f1af8426102357bb5cd3`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Causal Discovery with PC Algorithm

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

**核心思想**：从纯观测数据（无干预、无实验）中自动发现变量间的因果结构。PC 算法通过系统的条件独立性检验，逐步剔除无关边、识别 v-structures、传播方向约束，最终输出一个有向无环图（DAG）或部分定向图（CPDAG）。

**为什么需要因果发现**：

在母婴出海电商中，大量决策场景无法进行 A/B 实验：
- 竞品降价对本品销量的影响（无法操控竞品价格）
- 季节性因素 vs 营销活动对需求的独立贡献
- 物流时效 vs 商品价格对退货率的因果方向

传统相关性分析只能回答&quot;X 和 Y 是否相关&quot;，因果发现回答&quot;X 是否导致 Y&quot;。

**PC 算法四步流程**：

1. **骨架学习（Skeleton Learning）**

   从完全连接的无向图开始，对所有变量对 (X, Y) 进行条件独立性检验：
   - 初始：检验 X ⊥ Y | ∅（无条件独立）
   - 若独立，删除边 X-Y
   - 逐步增加条件集大小
   - 直到所有邻域节点的条件集都被检验

   关键参数：分离集 Sepset(X, Y) —— 使 X 和 Y 条件独立的最小变量集合。

2. **V-Structure 定向**

   对于未定向的三元组 X - Z - Y，如果 Z ∉ Sepset(X, Y)，则定向为 X → Z ← Y。

   直觉：如果 Z 是 X 和 Y 的共同原因，那么以 Z 为条件应该让 X 和 Y 独立；如果 Z 不是分离集的一员，说明 Z 是 X 和 Y 的共同结果（碰撞节点）。

3. **方向传播**

   应用三条规则迭代定向未定向的边。

4. **输出 CPDAG**

   完全定向的边表示确定的因果关系；剩余未定向的边表示数据无法区分方向。

**关键假设**：
- 因果充分性：不存在未观测的混杂变量
- 忠实性：数据中的条件独立性完全反映真实的因果结构
- 无环性：因果关系不形成循环

**反直觉洞察**：PC 算法的复杂度是 O(n^(d+2))，其中 d 是图的最大度。在高维稀疏场景下（如母婴电商有数百个 SKU 特征但每个商品只与少数几个相关），PC 算法反而比暴力搜索更高效。

---

## ② 母婴出海应用案例

### 场景1：销量驱动因素因果结构发现

**业务问题**：Momcozy 美国站想理解广告 spend、竞品 price、季节 index、促销活动、KOL 合作这 5 个因素如何因果影响周销量。传统回归只能做单个变量的系数估计，无法回答因果路径结构。

**应用流程**：
1. 数据预处理：标准化连续变量
2. 运行 PC 算法，设置显著性水平 alpha = 0.05
3. 解读输出的 CPDAG

**预期产出**：


（**换底正文在此截断** —— 完整卡正文共 118 行，本页内联到第 70 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：观测数据表（每列一个变量：广告支出、竞品均价、季节指数、促销标记、KOL 合作数、目标销量），周度或日度粒度，来源为店铺后台 + 广告平台 + 竞品爬虫；卡页口径下 20–100 周即可，变量需先标准化。

**输出**：有向无环因果图（含边方向与关键路径权重）与条件独立性检验结果；供运营与数据团队判断干预节点、确定预算投向。

## 执行步骤

1. 汇总并按周对齐广告支出、竞品均价、季节指数、促销标记、KOL 合作数与销量六列数据
2. 对所有变量做标准化（均值 0、方差 1）
3. 设定 α=0.05 运行 PC 算法做条件独立性检验，剔除无关边并识别碰撞节点
4. 传播因果方向并输出有向无环图
5. 标注关键因果路径与权重，交运营团队确定干预节点

## 边界与不做

- 数据不满足：样本量远低于 20 周，或变量高度共线、缺失严重时结构不稳定，先用「LLM 辅助因果图先验」补领域知识，不要硬跑。
- 何时不用：只要渠道贡献占比或现成归因报告时用「DataAgent营销归因分析」；异常突发要在分钟内定位根因时用「需求异常因果归因」或「根因分析 Agent」；已验证变量后只想估效应大小时用中介分析类技能。
- 能力边界：只输出观测数据支持的因果结构，不做干预执行，也不保证方向唯一（等价类内的方向需实验或业务判断确认）。
- 安全边界：存在未观测混杂时不得把图中边当作干预依据，因果边必须经 A/B 实验定期复核后才能用于投放与定价决策。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Forest-Effect-Estimation、Skill-Correlation-Causation-Distinction、Skill-Doubly-Robust-Estimation、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-Causal-Forest-Effect-Estimation、Skill-Doubly-Robust-Estimation、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Causal-Discovery-PC-Algorithm

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-Causal-Discovery-PC-Algorithm`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（256 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Causal-Discovery-PC-Algorithm`（完整卡：`references/full-card.md`）。
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
