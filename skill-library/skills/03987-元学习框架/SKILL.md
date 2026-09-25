---
name: "p2s-uplift-modeling"
title: "Uplift Modeling (元学习框架)"
description: "触发词：Uplift 建模、增量效应、优惠券定向、自然购买者识别、X-Learner。何时不用：只预测转化概率、不做增量归因时用常规响应模型；本技能要区分广告敏感型与本来就会买的用户。安全边界：建模用的用户级数据须已获授权并匿名化；投放须遵守平台广告与隐私政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 促销规划"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-Uplift-Modeling"
p2s_src_domain: "01-因果推断"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Uplift-Modeling"
rebase_vault_path: "paper2skills-vault/01-因果推断/Skill-Uplift-Modeling.md"
rebase_source_sha256: "d591b4e83a2a824feee66a5d4bc9d949edcf5a8fb75ab72c4b3065ca888a9f7f"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d591b4e83a2a824feee66a5d4bc9d949edcf5a8fb75ab72c4b3065ca888a9f7f"
rebase_full_card_bytes: "22888"
rebase_full_card_lines: "594"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "3c0799d8e735e3155251892f767c02d1cacbc819878eff1537aeee56db040c93"
user_summary: "找出只有被优惠或广告推动才会下单的人，把钱花在他们身上，而不是补贴本来就会买的客户。"
user_try: "试试：用干预组与对照组的历史数据训练 Uplift 模型，输出高增量、低增量与负增量人群名单和投放建议。"
whenToUse: "已有干预组与对照组数据、要决定给谁发券或给谁投广告时用本技能；只想知道谁会买，用常规响应模型即可。"
workflow: "整理干预组与对照组的特征、处理标志与转化结果 → 拟合倾向得分并训练 X-Learner 双模型 → 按 Uplift Score 分成高增量、低增量、负增量三群 → 输出预算向高增量人群集中的投放策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Uplift Modeling (元学习框架)

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`，sha256 `d591b4e83a2a824feee66a5d4bc9d949edcf5a8fb75ab72c4b3065ca888a9f7f`，22888 字节 / 594 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `3c0799d8e735e3155251892f767c02d1cacbc819878eff1537aeee56db040c93`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Uplift Modeling (元学习框架)

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想
Uplift Modeling（提升建模）解决的核心问题是：**识别哪些用户最有可能因为某个干预（如促销、广告）而产生正向行为**。与传统的响应预测模型不同，uplift model 预测的是"干预带来的增量效果"，而非"干预后的绝对结果"。

### 数学直觉

**条件平均处理效应 (CATE)**：
$$\tau(x) = E[Y(1)|X=x] - E[Y(0)|X=x]$$

其中：
- Y(1) 是接受干预后的结果
- Y(0) 是未接受干预的结果
- x 是用户特征

**T-Learner 方法**：分别训练两个模型
- 模型 μ₁(x)：预测干预组结果
- 模型 μ₀(x)：预测对照组结果
- CATE 估计：τ̂(x) = μ̂₁(x) - μ̂₀(x)

**X-Learner 方法**（更高效）：
1. 阶段一：用 T-Learner 估计 τ₁(x) 和 τ₀(x)
2. 阶段二：计算 imputed treatment effect
   - 对干预组：τ₀(xᵢ) ≈ Yᵢ(1) - μ̂₀(xᵢ)
   - 对对照组：τ₁(xᵢ) ≈ μ̂₁(xᵢ) - Yᵢ(0)
3. 最终估计：τ̂(x) = τ₁(x) + e(x)·(τ₀(x) - τ₁(x))
   - e(x) 是倾向评分 P(T=1|X=x)

### 关键假设
- **SUTVA**：稳定单元处理值假设，用户间无干扰
- **条件独立假设**：给定特征 X，处理分配 T 与潜在结果 (Y(0), Y(1)) 条件独立
- **重叠假设**：对于所有 x，P(T=1|X=x) ∈ (0,1)，即每个用户都有被干预或不干预的可能性

---

## ② 吸奶器出海应用案例

### 场景一：吸奶器Facebook广告投放归因优化

**业务问题**：
我们销售吸奶器到北美/欧洲市场，在 Facebook/Instagram 投放广告。传统方法是预测转化概率，但高转化概率用户可能本身就是高购买意愿用户，广告只是"锦上添花"。我们需要找到广告"增量转化"的用户——即如果不投广告就不会购买，但投了广告就会购买的用户。

**数据要求**：
- 用户特征：年龄、性别、国家（美国/加拿大/英国/德国）、设备类型、浏览行为（浏览页数、浏览时长）、加购行为、购买历史、是否孕妈/新手妈妈等
- 实验数据：Facebook A/B 测试数据或历史渐进式投放数据
- 标签：广告曝光、点击、是否购买吸奶器
- 数据量：建议至少 10,000 条样本（干预组和对照组各 5,000+）

**预期产出**：
- 每个用户的 uplift score：预测该用户看到吸奶器广告后的增量购买概率
- 用户分群：高 uplift（广告敏感）/ 中 uplift / 低 uplift（自然转化）/ 负 uplift（看了广告反而降低购买意愿）
- 投放策略：
  - 高 uplif：重点投放，预算倾斜
  - 负 uplift：减少投放或排除
  - 低 uplift：自然转化，不依赖广告

**业务价值**：
- 吸奶器客单价 $80-150，广告预算月均 30 万，优化后预计：
  - 广告预算节省 20-30%（节省 6-9 万）
  - 转化率提升 15-25%
  - CPA（单客获取成本）降低 $5-10

---

### 场景二：吸奶器新客首单优惠券敏感度分析

**业务问题**：
我们面向北美/澳洲新手妈妈用户，发放首单优惠券（如满 $100 减 $20）。但并非所有新用户都需要优惠券来促成首单。部分高需求妈妈即使没有优惠券也会购买，给她们发券浪费了营销成本。需要识别哪些新用户是"优惠券敏感型"（有券才会下单），避免给"自然购买型"用户发券。

**数据要求**：
- 新用户特征：
  - 来源渠道（TikTok/Instagram/Facebook/Google）
  - 浏览页面数（吸奶器详情页、配件页、对比页）
  - 加购商品数、加购金额
  - 注册时间、设备类型
  - 是否为新手妈妈（通过问卷判断）
- 干预数据：历史发券数据（有券/无券）
- 标签：是否使用优惠券、是否完成首单、订单金额

**预期产出**：
- 每个新用户的优惠券敏感度评分
- 用户分群：
  - **自然购买型**（负 uplift）：高收入/高需求妈妈，有无券都会买，发券浪费
  - **券后必买型**（高 uplift）：价格敏感型妈妈，券是成交关键，精准发券
  - **券无影响型**（低 uplift）：有无券都会买/都不买，中等关注

**业务价值**：
- 优惠券成本降低 30-40%（假设月发券成本 10 万，节省 3-4 万）
- 首单转化率维持或提升 5-10%
- 重点：识别高收入妈妈，避免对她们发放优惠券

---

（**换底正文在此截断** —— 完整卡正文共 594 行，本页内联到第 101 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户级实验数据：特征矩阵、干预标志（1=干预，0=对照）、结果变量（转化 0/1 或连续值）。必须同时具备干预组与对照组。

**输出**：每位用户的 Uplift Score 与分群结果（高/低/负增量）、对应的投放或发券建议与预算倾斜方向；供投放与促销团队使用。

## 执行步骤

1. 整理干预组与对照组的特征、处理与结果数据
2. 拟合倾向得分并训练 X-Learner 双模型
3. 计算每位用户的 Uplift Score 并分群
4. 输出高、低、负增量人群名单与投放建议
5. 给出预算向高增量人群倾斜的分配方案

## 边界与不做

- 没有对照组，或干预分配与用户特征高度相关且无法校正时不用本技能。
- 本技能输出分群与投放建议，不代投广告、也不代发优惠券。
- 安全边界：建模数据须已获授权并匿名化；投放须遵守平台广告与隐私政策。

## 技能关联

- **前置**：Skill-A、Skill-因果推断基础
- **延伸**：Skill-异质性处理效应估计、Skill-营销归因模型
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling、Skill-动态定价策略、Skill-客户生命周期价值预测

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：01-因果推断　·　源卡：`Skill-Uplift-Modeling`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（325 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Uplift-Modeling`（完整卡：`references/full-card.md`）。
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
