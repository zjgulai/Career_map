---
name: "p2s-thompson-sampling-mab"
title: "Thompson Sampling for Multi-Armed Bandit"
description: "触发词：Thompson 采样、多臂老虎机、主图选优、Beta 后验、转化率优化、探索利用。何时不用：需要严格假设检验报告时用标准 A/B；奖励延迟很长（如订阅续费）时后验容易失真，需谨慎。安全边界：实时分配需具备平台 API 权限与合规的数据获取方式，避免反复试探同一批流量造成体验波动。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
quality_tier: "curated"
p2s_card_id: "Skill-Thompson-Sampling-MAB"
p2s_src_domain: "02-A_B实验"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Thompson-Sampling-MAB"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-Thompson-Sampling-MAB.md"
rebase_source_sha256: "cb7169c6a909c415b2de0f104b9fe8608c60656805db58f2c474b8685ccb5732"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "cb7169c6a909c415b2de0f104b9fe8608c60656805db58f2c474b8685ccb5732"
rebase_full_card_bytes: "17266"
rebase_full_card_lines: "469"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "badb27a681b65ddcd5111397d0983ce20b21146f0cbb2b49e26d3c8c0672ae18"
user_summary: "让流量自动向表现更好的方案倾斜，主图、渠道和素材不必再靠人工轮流试。"
user_try: "试试：帮我用 Thompson 采样给 4 个 listing 主图做流量分配，看谁最优。"
whenToUse: "高频、可快速回填结果的方案选优（主图、渠道、素材）用 Thompson 采样；需要无偏因果结论与显著性报告时用标准 A/B；只做一次性期末分析时用经典检验。"
workflow: "为每个方案设置 Beta 先验 → 每次决策从后验采样选择臂 → 回填转化结果并更新后验参数 → 监控后验分布与最优方案概率 → 收敛后固化最优方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Thompson Sampling for Multi-Armed Bandit

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`，sha256 `cb7169c6a909c415b2de0f104b9fe8608c60656805db58f2c474b8685ccb5732`，17266 字节 / 469 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `badb27a681b65ddcd5111397d0983ce20b21146f0cbb2b49e26d3c8c0672ae18`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Thompson Sampling for Multi-Armed Bandit

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
Thompson Sampling是一种**基于贝叶斯后验采样的在线决策算法**，用于解决探索-利用权衡（Exploration-Exploitation Tradeoff）问题。算法的核心洞见是：**按照每个动作是最优动作的概率来选择动作**，而非简单地选择当前估计奖励最高的动作。

### 数学直觉
对于Bernoulli Bandit问题（每个动作产生成功/失败结果）：
- **先验分布**：对每个动作的奖励概率θₖ使用Beta分布 Beta(αₖ, βₖ) 建模
- **后验更新**：观察到奖励rₜ后，更新参数
  - 成功时：αₖ ← αₖ + 1
  - 失败时：βₖ ← βₖ + 1
- **采样决策**：每轮从每个动作的后验分布中采样一个估计值 θ̂ₖ ~ Beta(αₖ, βₖ)，选择最大θ̂ₖ对应的动作

**直观理解**：Beta分布的均值代表当前估计的奖励率，方差代表不确定性。Thompson Sampling天然地让不确定性高的动作有更多机会被探索（因其分布更宽，采样出高值的概率更大），同时逐渐聚焦于高奖励动作。

### 关键假设
1. **动作奖励平稳**：各动作的真实奖励率θₖ不随时间变化
2. **反馈即时**：每次动作后立即获得奖励反馈
3. **动作独立**：各动作之间没有相关性（可通过扩展算法放松）
4. **计算可行**：后验分布需要可采样（Beta分布易于采样）

---

## ② 母婴出海应用案例

### 场景1：跨境电商首页Banner智能投放

**业务问题**
母婴出海APP首页有5个Banner位，每个位置可展示不同内容（新品推广、促销活动、育儿知识、用户UGC、跨境物流优势）。运营团队不知道哪种内容组合能带来最高的点击率（CTR）和转化率，传统的A/B测试需要大量流量且无法自适应变化。

**数据要求**
| 字段 | 说明 | 格式 |
|------|------|------|
| timestamp | 展示时间 | datetime |
| banner_id | Banner编号（1-5） | int |
| content_type | 内容类型 | categorical |
| clicked | 是否点击（0/1） | binary |
| converted | 是否转化（0/1） | binary |
| user_segment | 用户分群（新手妈妈/二胎妈妈/准妈妈） | categorical |

**预期产出**
- 每个Banner位的内容选择策略，自动平衡探索新内容 vs 利用已知高转化内容
- 相比轮播或随机展示，CTR提升15-30%
- 无需人工设定流量分配比例，算法自适应调整

**业务价值**
- **流量效率**：将有限的首页流量分配给最高价值的内容
- **自动化**：减少运营人员手动调整Banner的频率
- **响应速度**：快速发现热点内容（如某育儿话题突然走红），1小时内自动提升其展示权重

### 场景2：新市场广告投放渠道选择

**业务问题**
公司准备进入东南亚新市场（如越南、泰国），有5个广告渠道可选（Facebook、Google、TikTok、本地母婴论坛、KOL合作）。每个渠道的CPA（单次获取成本）未知且可能差异巨大。预算有限，需要快速识别最优渠道同时不放弃潜在优质渠道。

**数据要求**
| 字段 | 说明 |
|------|------|
| date | 日期 |
| channel | 投放渠道 |
| spend | 当日花费 |
| installs | 带来的App安装数 |
| revenue_7d | 7日内产生的GMV |
| roas | 广告支出回报率 |

**预期产出**
- 每日自动分配的预算比例建议
- 每个渠道的ROAS后验分布估计
- 置信度报告："TikTok渠道有85%概率是当前最优渠道"

**业务价值**
- **预算保护**：避免在早期将大部分预算浪费在低效渠道上
- **快速收敛**：通常2-3周内确定主次渠道，比传统A/B测试快50%
- **风险对冲**：保持对次优渠道的最低探索比例，防止环境变化导致判断失误

---

（**换底正文在此截断** —— 完整卡正文共 469 行，本页内联到第 85 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：日级更新的实验数据：每个方案（臂）的展示与转化（或点击）计数、流量规模与测试周期；粒度到臂-日，需要能实时或准实时回填结果。

**输出**：每臂的后验分布与最优概率、自适应分配比例、收敛后的最优方案与预期提升；供运营在 listing 素材、渠道选择等高频场景直接落地。

## 执行步骤

1. 定义待选方案（臂）与 Beta 先验
2. 每次决策从后验采样选择流量分配
3. 回填转化结果并更新 alpha 与 beta
4. 监控后验分布与最优方案概率
5. 收敛后固化最优方案并输出结论

## 边界与不做

- 何时不用：实验目的是拿到严格无偏的因果结论、需要显著性报告时用标准 A/B，不要用自适应分配替代。
- 能力边界：本技能产出分配策略与后验结果，不负责流量下发与素材上线。
- 风险边界：奖励延迟或反馈口径不一致会让后验失真，需先确认转化回填时效与口径。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Contextual-Bandit-Personalization、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Multi-Armed-Bandit.html、Skill-Multi-Armed-Bandit、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Ad-Creative-Optimization、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Contextual-Bandit-Personalization、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Ad-Creative-Optimization、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Thompson-Sampling-MAB

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Thompson-Sampling-MAB`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（319 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Thompson-Sampling-MAB`（完整卡：`references/full-card.md`）。
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
