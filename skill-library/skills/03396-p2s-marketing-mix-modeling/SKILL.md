---
name: "p2s-marketing-mix-modeling"
title: "Marketing Mix Modeling (MMM) for Macro Budget Allocation"
description: "触发词：营销组合模型、渠道贡献拆解、增量ROAS、饱和状态、宏观预算分配。何时不用：历史数据不足3个月或各渠道投入长期无变化时不适用；已有后验样本只想出多档方案用贝叶斯MMM情景技能。安全边界：模型只做相关贡献估计，品牌词搜索等间接路径须另行验证，结论不得直接当作因果承诺。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 渠道经营分析"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
quality_tier: "curated"
p2s_card_id: "Skill-Marketing-Mix-Modeling"
p2s_src_domain: "15-营销投放分析"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Marketing-Mix-Modeling"
rebase_vault_path: "paper2skills-vault/15-营销投放分析/Skill-Marketing-Mix-Modeling.md"
rebase_source_sha256: "236d4780f225f454b5ecb1234594845f7bcaf9b7702feba690bec1c90615fa31"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "236d4780f225f454b5ecb1234594845f7bcaf9b7702feba690bec1c90615fa31"
rebase_full_card_bytes: "13319"
rebase_full_card_lines: "349"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "d83e6a74605e42d81280a054d83b9c43ebca9d6b23330f4ab8e27746ad8e6eb9"
user_summary: "用 Adstock 与饱和变换加贝叶斯回归拆开各渠道真实贡献，回答明年预算该往哪分。"
user_try: "试试：2024年广告总投入600万分散在 Facebook、Google、TikTok、KOL 和展会，帮我拆出各渠道真实贡献和明年分配建议。"
whenToUse: "当需要宏观层面拆解各渠道贡献、给出增量 ROAS 与饱和状态判断时用本卡；需要自动搜索 adstock 与饱和参数并做归因时用 DARA Agentic MMM；只做利润约束下的分配用 MMM 预算利润对齐。"
workflow: "汇总各渠道至少 3 个月花费与销售时序 → 对每渠道做 Adstock 衰减与 Hill 饱和转换 → 拟合模型得到渠道系数与基准销量 → 估计各渠道贡献占比与增量 ROAS → 结合饱和状态给出预算分配建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Marketing Mix Modeling (MMM) for Macro Budget Allocation

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`，sha256 `236d4780f225f454b5ecb1234594845f7bcaf9b7702feba690bec1c90615fa31`，13319 字节 / 349 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `d83e6a74605e42d81280a054d83b9c43ebca9d6b23330f4ab8e27746ad8e6eb9`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Marketing Mix Modeling (MMM)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：品牌每个月在不同渠道（Facebook、Google、TikTok、KOL、线下）投入数百万广告费。如何量化每个渠道对销售额的真实增量贡献？如何预测下个月预算调整后的销售表现？

MMM与传统归因的区别：
- **归因模型**：追踪单个用户的触点路径（微观）
- **MMM**：用时间序列回归，从宏观层面分离各渠道的增量效应
- 两者互补：归因解决"谁参与了"，MMM解决"真实增量是多少"

**回归模型框架**：

$$Sales_t = \alpha + \sum_{i} \beta_i \cdot Adstock(AdSpend_{i,t}) + \gamma \cdot Price_t + \delta \cdot Seasonality_t + \epsilon_t$$

**三个关键技术**：

**1. Adstock 转化（广告效果衰减）**
- 广告投入的效果不是即时的，会随时间衰减
- $Adstock_t = Ad_t + \lambda \cdot Adstock_{t-1}$，$\lambda$ 为衰减率（通常0.3-0.8）
- Facebook广告今天投，效果可能持续2-3周

**2. Hill 转化（边际收益递减）**
- 花费越多，边际效果越低
- $Effect = \beta \cdot \frac{Adstock^\eta}{Adstock^\eta + K^\eta}$
- $\eta$ 控制曲线形状，$K$ 控制半饱和点

**3. 先验分布（Bayesian MMM）**
- Google Meridian和Meta Robyn都用Bayesian方法
- 将业务经验编码为先验：如"Facebook的ROAS通常在2-4之间"
- 数据少时靠先验，数据多时靠似然

**2025年前沿**：
- **Google Meridian** (2024)：基于TensorFlow Probability，支持地理层级分解、自定义先验
- **Meta Robyn** (2021-2024)：开源MMM框架，自动化特征工程、超参调优
- **DeepCausalMMM** (2025)：用深度学习替代线性假设，捕捉非线性交互效应

**反直觉洞察**：
- MMM通常显示"品牌搜索"的贡献被严重高估——因为它其实是其他渠道广告带来的"收割"
- 节假日期间渠道协同效应放大：单独看每个渠道ROI都在降，但整体销售额上升
- 新媒体渠道（TikTok）初期数据少，Bayesian先验能帮助稳定估计

---

## ② 母婴出海应用案例

### 场景1：年度预算重新规划

**业务问题**：Momcozy 2024年广告总投入600万，分布在：Facebook 240万、Google 180万、TikTok 90万、KOL合作 60万、线下展会 30万。年底复盘发现销售额增长但不知道各渠道真实贡献，2025年预算怎么分配？

**MMM分析**：

| 渠道 | 2024投入 | MMM估算贡献 | 增量ROAS | 饱和状态 |
|------|---------|------------|---------|---------|
| Facebook | 240万 | 35% | 2.8 | 接近饱和 |
| Google | 180万 | 22% | 2.2 | 已饱和（多为收割） |
| TikTok | 90万 | 18% | 3.5 | 远未饱和 |
| KOL合作 | 60万 | 15% | 4.0 | 中度饱和 |
| 线下展会 | 30万 | 5% | 1.2 | 低效 |

**关键发现**：
1. Google的22%贡献中，约60%实际来自Facebook/TikTok的品牌曝光带来的品牌词搜索
2. TikTok虽投入最少，但边际ROAS最高，增量效应最强
3. 线下展会投入产出比低，建议削减

**2025预算调整**：
- Facebook: 240万 → 220万（维持，接近饱和）
- Google: 180万 → 150万（削减，主要是收割效应）
- TikTok: 90万 → 150万（大幅加码，增量空间大）
- KOL合作: 60万 → 80万（加码）
- 线下展会: 30万 → 0（砍掉）

### 场景2：大促期间的渠道协同预测

**业务问题**：黑五期间计划总预算100万，想知道不同分配方案下的预期销售额。

**MMM预测**：


（**换底正文在此截断** —— 完整卡正文共 349 行，本页内联到第 83 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：各渠道至少 3 个月的历史投入与销售额时序数据、渠道清单（含线上与线下、KOL 等非标渠道），以及可选的季节性等控制变量；投入口径需与销售口径期间对齐。

**输出**：各渠道的贡献占比、增量 ROAS、饱和状态判断与预算分配建议，附关键发现（如哪些贡献其实来自其他渠道的品牌曝光溢出），供市场总监与财务做年度预算决策。

## 执行步骤

1. 汇总各渠道至少 3 个月的历史投入与销售时序数据
2. 对每个渠道的花费序列做 Adstock 衰减转换
3. 对衰减后的序列做 Hill 饱和转换
4. 拟合贝叶斯回归得到渠道系数、基准销量与季节系数
5. 估计各渠道贡献占比、增量 ROAS 与饱和状态
6. 结合饱和与溢出发现给出下一年预算分配建议

## 边界与不做

- 何时不用：历史数据不足 3 个月、或各渠道投入长期无变化导致系数无法识别时不适用。
- 能力边界：只能给出相关贡献估计，品牌词搜索等间接路径需要额外实验验证；结论质量取决于数据口径一致性。
- 解读边界：贡献占比与增量 ROAS 是模型估计而非承诺，不得直接作为因果结论对外使用。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Marketing-Data-Pipeline.html、Skill-Marketing-Data-Pipeline、Skill-Multi-Market-Ad-Copy-Compliance.html、Skill-Multi-Market-Ad-Copy-Compliance、Skill-Platform-Policy-Change-Adaptive-Monitor.html、Skill-Platform-Policy-Change-Adaptive-Monitor、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness
- **可组合**：Skill-Marketing-Mix-Modeling

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：15-营销投放分析　·　源卡：`Skill-Marketing-Mix-Modeling`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（234 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Marketing-Mix-Modeling`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2004.00530，但该号在 arXiv 上是《Learning Sparse Rewarded Tasks from Sub-Optimal Demonstrations》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Bayesian Marketing Mix Modeling at Google》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
