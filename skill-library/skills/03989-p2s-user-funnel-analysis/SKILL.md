---
name: "p2s-user-funnel-analysis"
title: "User Funnel and Behavior Path Analysis"
description: "触发词：用户漏斗分析、行为路径分析、加购率诊断、流失点定位、跳出原因归因、优化优先级排序。何时不用：要把会话还原成路径桑基图并预测下一步页面用「Trajectory-Pattern-Mining」；要拆广告到行为的链路用「Ad-to-Behavior-Funnel」；本技能只按自定义步骤序列算转化与流失去向。安全边界：用户级路径明细须脱敏后再分析，输出仅用于站点与详情页优化，建议动作须业务方复核后落地。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-068"
l3_business: "漏斗诊断"
l3_all: "漏斗诊断 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/漏斗诊断"
quality_tier: "curated"
p2s_card_id: "Skill-User-Funnel-Analysis"
p2s_src_domain: "14-用户分析"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-User-Funnel-Analysis"
rebase_vault_path: "paper2skills-vault/14-用户分析/Skill-User-Funnel-Analysis.md"
rebase_source_sha256: "bd403430618b51b78c64bd98db4fd5620e506c2e9197aaffb5a6aec8f522947d"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "bd403430618b51b78c64bd98db4fd5620e506c2e9197aaffb5a6aec8f522947d"
rebase_full_card_bytes: "10767"
rebase_full_card_lines: "274"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "7da7413a2a5dec99469ea77dbfedda02b8829ee39c0acebe1a69a00da6d24c10"
user_summary: "按自定义步骤把用户路径排成漏斗，算出每步转化率、流失去向与流失原因，直接排出优化优先级。"
user_try: "试试：这是我们吸奶器详情页到支付的用户步骤序列（首页、详情页、加购、购物车、支付、完成），帮我算各步转化率与每步流失去向，并排出首屏吸引力、价格信任、运费透明三类的优化优先级。"
whenToUse: "有按顺序的用户步骤序列（如首页→详情页→加购→支付→完成）、要算各步转化率与流失去向时用本技能；要聚类典型轨迹并预测下一步页面用「Trajectory-Pattern-Mining」，要看同期群留存用「Cohort-Retention-Analysis」，要按用户价值分层用「RFM-Customer-Segmentation」。"
workflow: "与业务方确认漏斗步骤名称列表（如首页、详情页、加购、支付、完成） → 把每个用户的访问整理成有序步骤序列 → 统计每步人数并计算逐步转化率、整体转化率与流失率 → 对高流失区间做流失去向分析，区分流到下一步还是直接退出 → 按各步流失量排序输出优化优先级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# User Funnel and Behavior Path Analysis

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`，sha256 `bd403430618b51b78c64bd98db4fd5620e506c2e9197aaffb5a6aec8f522947d`，10767 字节 / 274 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `7da7413a2a5dec99469ea77dbfedda02b8829ee39c0acebe1a69a00da6d24c10`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: User Funnel Analysis

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：用户从"知道品牌"到"下单购买"要经历多个步骤。每一步都有用户流失。漏斗分析回答：用户在哪个步骤流失最多？为什么？优化哪个步骤的杠杆最大？

**经典电商漏斗（AIPL模型）**：


**行为路径分析**：

不仅看漏斗的"宽度"，还要看用户走的路径：
- 路径1：首页 → 搜索 → 详情页 → 加购 → 支付（理想路径）
- 路径2：首页 → 详情页 → 跳出（价格敏感）
- 路径3：首页 → 详情页 → 详情页 → 详情页（比较型用户）
- 路径4：广告 → 详情页 → 加购 → 支付（高意向用户）

**关键指标**：

| 指标 | 定义 | 诊断价值 |
|------|------|---------|
| **转化率** | 下一步人数 / 当前步人数 | 哪一步漏最多 |
| **流失率** | 1 - 转化率 | 哪一步需要优化 |
| **中位停留时间** | 每步的中位停留时长 | 用户是否困惑 |
| **回溯率** | 返回上一步的比例 | 信息是否不足 |
| **多步流失占比** | 流失前经过的步骤数 | 是突然离开还是慢慢放弃 |

**路径挖掘算法**：

**1. 序列模式挖掘（PrefixSpan）**
- 找出最常见的用户行为序列
- "首页 → 搜索 → 详情页 → 加购" 出现频率是多少？

**2. 马尔可夫链模型**
- 计算从状态A到状态B的转移概率
- 识别"吸收态"（如支付成功、跳出）
- 模拟：如果详情页转化率提升10%，整体转化率会提升多少？

**反直觉洞察**：
- 漏斗最大的漏洞往往不是最后一步（支付），而是第一步（从详情页到加购）——50%的用户在详情页就离开了
- "加购但未支付"的用户不是"流失"——他们是"延迟决策"，邮件提醒的回收率可达15%
- 比较型用户（看多个详情页）的转化率反而高于直接下单型——因为他们已经做好了功课

---

## ② 母婴出海应用案例

### 场景1：吸奶器详情页流失分析

**业务问题**：Momcozy 吸奶器详情页UV 10,000/天，但加购率只有3%，支付转化率1%。详情页是不是有问题？

**漏斗分析**：

| 步骤 | 用户数 | 转化率 | 流失原因分析 |
|------|--------|--------|-------------|
| 详情页UV | 10,000 | — | — |
| 看完详情（滚动>50%）| 6,000 | 60% | 40%跳出：页面加载慢/首屏不吸引人 |

（**换底正文在此截断** —— 完整卡正文共 274 行，本页内联到第 66 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：每个用户一条有序步骤序列：外层是用户、内层是该用户依次经过的步骤名列表，步骤名须与事先约定的漏斗步骤列表一致，可自定义为首页、详情页、加购、购物车、支付、完成等。样本需覆盖完整漏斗，并能区分「未进入下一步」与「直接退出」，否则算不出逐步转化率与流失去向。

**输出**：一张漏斗表：每步用户数、逐步转化率、整体转化率与流失率，以及指定步骤区间的流失去向分布（用户去了哪一步或直接退出）；据此给出按流失量排序的优化优先级；供增长负责人与详情页运营定位卡点。

## 执行步骤

1. 与业务方确认漏斗步骤名称列表
2. 把每个用户的访问整理为有序步骤序列
3. 统计每步人数，计算逐步转化率、整体转化率与流失率
4. 对高流失区间做流失去向分析，区分流到下一步还是直接退出
5. 结合各步流失量排出优化优先级

## 边界与不做

- 数据不满足时不用：只有各页 PV、没有用户级有序步骤序列时算不出逐步转化率；步骤命名与约定漏斗不一致时先统一命名再分析。
- 何时不用：要聚类典型轨迹并预测下一步页面用「Trajectory-Pattern-Mining」；要看广告投放链路用「Ad-to-Behavior-Funnel」；要看同期群留存用「Cohort-Retention-Analysis」。
- 能力边界：只做现状的转化与流失去向描述，不证明某处页面改动必然带来该幅度提升，也不替代后续实验验证。
- 安全边界：用户级路径明细须脱敏，分析结果只用于站点与详情页优化。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-User-Funnel-Analysis

---

> 分类：业务运营/渠道经营/漏斗诊断　·　技术族：14-用户分析　·　源卡：`Skill-User-Funnel-Analysis`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（155 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-User-Funnel-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1906.07609，但该号在 arXiv 上是《Entropy and codimension bounds for generic singularities》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《SequenceAware Recommendation with Temporal Point Processes》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
