---
name: "p2s-promotion-effectiveness"
title: "Promotion Effectiveness Evaluation with Causal ML"
description: "触发词：促销效果、增量评估、因果评估、促销幻觉、利润侵蚀、首单券复盘。何时不用：要按人群拆异质效应做投放用「因果森林异质处理效应」；要直接从观测数据学策略用「观测数据策略学习」。安全边界：评估结论仅用于预算与活动决策，不得据此对个体用户差别待遇，数据使用须符合平台与隐私条款。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-078"
l3_business: "促销规划"
l3_all: "促销规划 / 价格敏感性 / 经济性分析"
l1_l2_l3: "业务运营/渠道经营/促销规划"
quality_tier: "curated"
p2s_card_id: "Skill-Promotion-Effectiveness"
p2s_src_domain: "15-营销投放分析"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Promotion-Effectiveness"
rebase_vault_path: "paper2skills-vault/15-营销投放分析/Skill-Promotion-Effectiveness.md"
rebase_source_sha256: "9dbc7886bfe38d30ef01d6deb6d75ca9307b48dc45f40a8c6f1532f7e58c6392"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "9dbc7886bfe38d30ef01d6deb6d75ca9307b48dc45f40a8c6f1532f7e58c6392"
rebase_full_card_bytes: "15305"
rebase_full_card_lines: "389"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "78463e473fbe11a8471cdb76be01c49d92ca5926369a13c2688dd1e1cb3d56e7"
user_summary: "促销带来的是真增量还是本来就会买：用因果方法算清增量，别被折扣白送出去的幻觉骗了。"
user_try: "试试：我给新用户发 20% 首单券，使用率 35%、客单 $80，帮我算真实增量而不是只看用券用户的消费。"
whenToUse: "当促销结果需要去伪存真（区分真实增量与自然购买）、并要判断是否侵蚀利润时用本技能；若要把效应拆到人群层面做投放，用「因果森林异质处理效应」；要从观测数据学策略，用「观测数据策略学习」。"
workflow: "找到与用券用户相似但未收券的对照组，做倾向得分匹配 → 控制渠道、注册时间、浏览行为等混淆变量 → 用双重机器学习交叉拟合估计处理效应与个体效应 → 对照朴素分析核算真实增量收入与利润影响"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Promotion Effectiveness Evaluation with Causal ML

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`，sha256 `9dbc7886bfe38d30ef01d6deb6d75ca9307b48dc45f40a8c6f1532f7e58c6392`，15305 字节 / 389 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `78463e473fbe11a8471cdb76be01c49d92ca5926369a13c2688dd1e1cb3d56e7`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Promotion Effectiveness Evaluation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：促销活动期间销售额暴涨30%，这是促销的真实效果，还是"本来就会买的用户"恰好遇到了促销？如果不做促销，销售额会是多少？促销是否侵蚀了利润？

**关键概念：反事实（Counterfactual）**
- 问题本质是一个因果推断问题
- 我们需要知道：同一个用户在"有促销"和"无促销"两种情况下的购买概率差异
- 但现实中只能观察到一种情况（fundamental problem of causal inference）

**因果ML框架（基于DoorDash KDD 2025方法）**：

**1. 双重机器学习（DML）估计平均处理效应**
- 将促销视为Treatment（T=1有促销，T=0无促销）
- 结果变量Y：购买金额/利润
- 协变量X：用户特征、历史行为、时间特征
- 模型：
  $$Y = \theta(X) \cdot T + g(X) + \epsilon$$
  $$T = m(X) + \eta$$
- $\theta(X)$ 就是条件平均处理效应（CATE）——促销对每个用户群体的增量效果
- DML用交叉拟合（cross-fitting）避免过拟合偏差

**2. Uplift Modeling识别"促销敏感"用户**
- 促销效果在不同用户间异质性很大
- "肯定会买"的用户：促销只是给了折扣（利润损失）
- "促销敏感"用户：本来不买，因为促销才买（增量收入）
- "促销反感"用户：促销反而降低购买意愿（少见但存在）

**3. 利润视角的优化**
- 增量收入 ≠ 增量利润
- 促销成本 = 折扣金额 + 运营成本
- 有效促销：Uplift收入 × 毛利率 > 促销成本

**反直觉洞察**：
- 促销的"增量"通常只有表面增长的30-50%——其余是用户的时间转移（把下个月的购买提前了）
- 最响应促销的用户往往不是最有价值的用户——高价值用户本来就会买
- "全站促销"的ROI通常远低于"定向促销"——给不需要的人发折扣是浪费
- 黑五/双十一的数据不能直接用来评估促销效果——因为同期竞品也在促销，需要对照组

---

## ② 母婴出海应用案例

### 场景1：新用户首单折扣的真实效果

**业务问题**：Momcozy对新注册用户发20%首单优惠券，使用率为35%，使用后平均订单金额$80。团队认为"首单折扣很成功"。真实增量是多少？

**因果分析**：

** naive分析**（错误）：
- 使用优惠券的用户平均消费$80
- 假设不用券会买$0 → 增量=$80
- 1000人使用 → 增量收入=$80,000

**DML因果分析**（正确）：
1. 找到"类似但未收到券"的用户作为对照组（Propensity Score Matching）
2. 控制变量：用户来源渠道、注册时间、浏览行为、 demographics
3. DML估计结果：

| 用户群 | 表面收入 | 反事实收入 | 增量收入 | 增量率 |
|--------|---------|----------|---------|--------|
| 整体 | $80 | $55 | $25 | 31% |
| 自然流量 | $85 | $70 | $15 | 18% |
| 广告流量 | $78 | $45 | $33 | 42% |
| 老用户推荐 | $82 | $65 | $17 | 21% |

**利润计算**：
- 折扣成本 = $80 × 20% = $16
- 增量毛利（按40%毛利率）= $25 × 40% = $10
- 净效果 = $10 - $16 = **-$6（亏损）**

**决策反转**：
- 表面看"优惠券带来了收入"，实际看"每笔使用券的订单亏损$6"
- 优化方向：只对"广告流量"用户发券（他们的增量率42%，净效果为正）
- 取消对自然流量用户的折扣（他们本来就会买）

### 场景2：黑五促销的边际效应递减

**业务问题**：黑五期间测试了3个折扣力度：10% off、20% off、30% off。哪个ROI最高？

**Uplift分析**：

| 折扣力度 | 转化率 | 订单量 | 平均客单价 | 增量订单 | 增量利润 |

（**换底正文在此截断** —— 完整卡正文共 389 行，本页内联到第 89 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：促销活动的处理变量（是否收到促销或优惠券）、结果变量（购买金额或利润）、用户特征矩阵（渠道、注册时间、浏览行为等）与用于匹配的对照数据；粒度为用户 × 活动。

**输出**：促销的真实增量效应（含个体效应估计）与利润影响核算，以及与朴素分析的差异对照；供营销预算与促销决策使用。

## 执行步骤

1. 匹配出与用券用户可比的未收券对照组
2. 控制渠道、注册时间与浏览行为等混淆变量
3. 用双重机器学习估计处理效应与个体效应
4. 对照朴素分析核算真实增量与利润影响

## 边界与不做

- 数据不满足：找不到可比对照、混淆变量缺失时增量会被高估，结论不可用。
- 何时不用：人群级异质投放用「因果森林异质处理效应」；观测数据学策略用「观测数据策略学习」。
- 能力边界：只做效果评估与利润核算，不含促销执行与预算审批。
- 安全边界：结论仅用于预算与活动决策，不得据此对个体用户差别待遇，数据使用须合规。

## 技能关联

- **前置**：Skill-Intelligent-Prediction-Doubly-Robust.html、Skill-Intelligent-Prediction-Doubly-Robust、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling
- **延伸**：Skill-Monodense-单品价格弹性估计.html、Skill-Monodense-单品价格弹性估计
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Promotion-Effectiveness

---

> 分类：业务运营/渠道经营/促销规划　·　技术族：15-营销投放分析　·　源卡：`Skill-Promotion-Effectiveness`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（266 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Promotion-Effectiveness`（完整卡：`references/full-card.md`）。
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
