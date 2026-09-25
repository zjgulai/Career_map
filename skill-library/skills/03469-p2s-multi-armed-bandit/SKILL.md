---
name: "p2s-multi-armed-bandit"
title: "Multi-Armed Bandit Algorithm for Mother-Baby Cross-Border E-commerce"
description: "触发词：多臂老虎机、出价档位选择、预算分配、试错成本、Thompson 采样、关键词出价。何时不用：臂数量巨大而奖励稀疏时先做分层或合并；需要严格因果结论时用固定分配实验。安全边界：自动调整出价需遵守平台广告政策与预算约束，避免频繁调价触发账户风控。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-097"
l3_business: "广告实验"
l3_all: "广告实验 / 实验设计"
l1_l2_l3: "业务运营/品牌与增长/广告实验"
quality_tier: "curated"
p2s_card_id: "Skill-Multi-Armed-Bandit"
p2s_src_domain: "02-A_B实验"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Multi-Armed-Bandit"
rebase_vault_path: "paper2skills-vault/02-A_B实验/Skill-Multi-Armed-Bandit.md"
rebase_source_sha256: "b7a90a27c72691bf4f48d1269851e4636a594ecdee7c6995c5bc997429ccf7d6"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b7a90a27c72691bf4f48d1269851e4636a594ecdee7c6995c5bc997429ccf7d6"
rebase_full_card_bytes: "12427"
rebase_full_card_lines: "388"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "3d04fd36bf98b9a0117d6577c50b0a28902f7e6326ef89404c2c461844aeae24"
user_summary: "多个关键词与出价档位不用平均分预算，让算法把预算自动挪给更划算的组合。"
user_try: "试试：帮我用多臂老虎机给 15 个关键词出价组合分配曝光预算。"
whenToUse: "关键词乘以出价档位这类组合爆炸的广告选择用 MAB；只有几个明确方案时用 A/B 或 Thompson 采样；需要严格因果报告时用固定分配实验。"
workflow: "列出关键词与出价档位组合并定义奖励 → 初始化各臂先验与曝光分配 → 按 MAB 规则逐步分配曝光并回填结果 → 淘汰长期表现差的臂并集中预算 → 输出最优组合与预算迁移建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Multi-Armed Bandit Algorithm for Mother-Baby Cross-Border E-commerce

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`，sha256 `b7a90a27c72691bf4f48d1269851e4636a594ecdee7c6995c5bc997429ccf7d6`，12427 字节 / 388 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `3d04fd36bf98b9a0117d6577c50b0a28902f7e6326ef89404c2c461844aeae24`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Multi-Armed Bandit (多臂老虎机)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
多臂老虎机（Multi-Armed Bandit, MAB）解决的核心问题是：**在探索（exploration）和利用（exploitation）之间取得平衡**。与传统 A/B 测试不同，MAB 在测试过程中动态调整流量分配，将更多流量分配给表现好的广告版本，同时继续探索其他版本，从而在保证学习效果的同时最大化收益。

### 数学直觉

**问题定义**：
- K 个臂（广告版本）$a_1, a_2, ..., a_K$
- 每个臂的奖励分布 $R_i$，期望 $\mu_i$
- 目标是最大化累计奖励 $\sum_{t=1}^{T} r_t$

**UCB (Upper Confidence Bound)** 算法：
$$UCB_i = \bar{X}_i + \sqrt{\frac{2 \ln t}{n_i}}$$

- $\bar{X}_i$ 是臂 i 的平均奖励
- $n_i$ 是臂 i 被选择的次数
- $t$ 是总选择次数
- 第二项是置信上界，反映不确定性

**Thompson Sampling**（推荐使用）：
基于贝叶斯后验采样：

1. 对每个臂维护 Beta 分布参数 $(\alpha_i, \beta_i)$
   - $\alpha_i$ = 成功次数 + 1
   - $\beta_i$ = 失败次数 + 1
2. 每轮从每个臂的 Beta 分布中采样 $\theta_i \sim Beta(\alpha_i, \beta_i)$
3. 选择采样值最大的臂：$a_t = \arg\max_i \theta_i$
4. 观察奖励后更新参数

### 关键假设
- **独立同分布奖励**：每次选择获得的奖励与历史无关
- **平稳环境**：各臂的奖励分布不随时间变化（非平稳环境需用变体）
- **二值奖励**：通常用于点击/转化场景（可扩展到连续奖励）

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器Facebook/Instagram广告素材AB测试优化

**业务问题**：
我们在北美/澳洲投放吸奶器广告时，通常会准备多套广告素材（产品图片、使用场景图、妈妈晒单图、不同文案）。传统方法是固定流量分配 A/B 测试（如 50/50），但：
- 效果差的素材浪费 50% 预算
- 测试周期长（至少 1-2 周）
- 不确定性强，难以决策

使用 MAB 可以动态分配流量，自动淘汰差的素材，放大好的素材。

**数据要求**：
- 广告素材 ID（如 "素材A-哺乳妈妈使用图"、"素材B-产品正面图"）
- 每条广告的曝光、点击、加购、购买数据
- 实时或 near-real-time 数据回流

**预期产出**：
- 每个素材的实时流量权重（自动调整）
- 置信区间和胜出概率
- 自动停投低效素材

**业务价值**：
- 吸奶器客单价 $80-150，广告预算月均 30 万
- 广告预算节省 20-40%（减少低效素材消耗）
- 测试周期缩短 50%+（动态调整代替固定测试）
- 转化率提升 10-20%（流量向高效素材倾斜）
- 预计每月节省 6-12 万广告费

---

### 场景二：吸奶器TikTok/Instagram短视频出价策略优化

**业务问题**：
我们在 TikTok/Instagram Reels 投放吸奶器短视频广告时，需要找到最优出价策略。手动调价效率低，且容易过度优化。使用 MAB 可以自动探索最优出价区间。

**数据要求**：
- 出价区间离散化（如 $0.5, $1.0, $1.5, $2.0, $2.5）
- 每个出价的转化数据
- 国家/地区维度（美国/加拿大/英国/澳洲）

**预期产出**：
- 每个出价的最优概率分布
- 实时调整出价建议
- ROI 预测

**业务价值**：
- 出价优化时间减少 80%+
- 单次转化成本降低 10-15%
- 跨国投放效率提升

---

（**换底正文在此截断** —— 完整卡正文共 388 行，本页内联到第 98 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：广告投放日级数据：曝光、点击、转化、花费与 ROAS，按关键词与出价档位拆分；需给出日均曝光量、历史点击率与转化率基线、实验周期与预算上限。

**输出**：各臂的推荐曝光分配比例、要淘汰的低效组合、最优出价组合清单与月度花费变化；供投放经理把预算集中到高效组合。

## 执行步骤

1. 列出关键词与出价档位组合并定义奖励
2. 初始化各臂先验与曝光分配
3. 按 MAB 规则逐步分配曝光并回填结果
4. 淘汰长期表现差的臂并集中预算
5. 输出最优组合与预算迁移建议

## 边界与不做

- 何时不用：臂数量极多而每个臂奖励极稀疏时，先做分层或合并，不要直接上 MAB。
- 能力边界：本技能产出分配比例与最优组合，不直接调用广告平台改价。
- 风险边界：自动调价需受预算上限与调价频次约束，频繁改价可能触发平台账户风控。

## 技能关联

- **前置**：Skill-A-B-Testing-Fundamentals、Skill-Bayesian-Statistics-for-E-commerce
- **延伸**：Skill-Contextual-Bandit-for-Personalization、Skill-Real-time-Experimentation-Pipeline、Skill-Reinforcement-Learning-for-Dynamic-Pricing
- **可组合**：Skill-Attribution-Modeling、Skill-Conversion-Rate-Optimization、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Inventory-Management、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Multi-Armed-Bandit

---

> 分类：业务运营/品牌与增长/广告实验　·　技术族：02-A_B实验　·　源卡：`Skill-Multi-Armed-Bandit`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（303 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Multi-Armed-Bandit`（完整卡：`references/full-card.md`）。
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
