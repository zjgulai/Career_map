---
name: "p2s-cohort-retention-analysis"
title: "Cohort Retention Analysis for User Lifecycle"
description: "触发词：队列留存、留存矩阵、留存曲线、D1/D7/D30、分群对比、健康度诊断。何时不用：要按队列留存自动派发干预用队列挽回调度卡；只做留存体检、找差距根因时用本卡。安全边界：留存数据须聚合展示，不得输出个体级活跃轨迹或用于对外披露。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 分群"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-Cohort-Retention-Analysis"
p2s_src_domain: "14-用户分析"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Cohort-Retention-Analysis"
rebase_vault_path: "paper2skills-vault/14-用户分析/Skill-Cohort-Retention-Analysis.md"
rebase_source_sha256: "44e30e8b027a616fef4ff7b5361e54a8d7aa970e268deebb24bc1a8233444701"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "44e30e8b027a616fef4ff7b5361e54a8d7aa970e268deebb24bc1a8233444701"
rebase_full_card_bytes: "10307"
rebase_full_card_lines: "280"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "f0bfe6c77bb9f8ebc2e7beb8db329710a90f31f3efdae91fa185b90a23ca734b"
user_summary: "用留存矩阵看清不同批次用户的留存差距，找出是哪批人、哪个环节出了问题。"
user_try: "试试：这是我近几个月的用户活跃数据，帮我生成留存矩阵、对比行业基准并给出根因假设。"
whenToUse: "与「队列挽回调度」相比：诊断阶段用本卡；诊断完要把低留存队列转成干预动作时用那张调度卡。"
workflow: "按首次活跃日期给用户分队列 → 计算 D1/D7/D30 留存矩阵与留存曲线 → 与行业基准和往期队列对比，定位恶化批次 → 结合渠道构成、注册引导、首单履约做根因假设"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Cohort Retention Analysis for User Lifecycle

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`，sha256 `44e30e8b027a616fef4ff7b5361e54a8d7aa970e268deebb24bc1a8233444701`，10307 字节 / 280 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `f0bfe6c77bb9f8ebc2e7beb8db329710a90f31f3efdae91fa185b90a23ca734b`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: Cohort Retention Analysis

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心问题**：新用户来了之后，第7天还剩多少？第30天呢？第90天呢？不同月份来的用户，留存曲线一样吗？Cohort分析把用户按"首次活跃时间"分组，追踪每组的留存轨迹。

**Cohort定义**：
- **时间Cohort**：按首次购买/注册月份分组（如"2025年1月Cohort"）
- **行为Cohort**：按首次行为特征分组（如"首单买奶粉的用户"vs"首单买纸尿裤的用户"）
- **渠道Cohort**：按获客渠道分组（Facebook/Google/TikTok）

**留存曲线（Retention Curve）**：

$$Retention(d) = \frac{\text{首次活跃后第d天仍活跃的用户数}}{\text{该Cohort总用户数}}$$

**关键指标**：

| 指标 | 定义 | 业务含义 |
|------|------|---------|
| **D1/D7/D30留存** | 第1/7/30天留存率 | 短期/中期/长期粘性 |
| **半衰期** | 留存率降到50%的天数 | 用户生命周期长度 |
| **曲线曲率** | 前7天下降速度 |  onboarding 质量 |
| **长期平台值** | 留存曲线渐近线 | 核心用户占比 |

**预测留存的方法**：

**1. 幂律模型（Power Law）**
$$Retention(d) = a \cdot d^{-b}$$
- $a$ ≈ D1留存
- $b$ 决定下降速度
- 拟合历史数据预测未来留存

**2. BG/NBD模型**
- 概率模型，假设用户的购买服从泊松过程，流失服从几何分布
- 可预测：未来某段时间内的购买次数、活跃用户数量
- 适用于非契约型场景（如电商）

**反直觉洞察**：
- D1留存提升5%，LTV可能提升20%——因为留存是复利效应
- 不同渠道的用户留存差异巨大：Facebook广告用户D30留存可能只有5%，而自然搜索用户可能30%
- " cohort 退化"是常态——每月新增用户的留存曲线会逐渐变差，因为好摘的果子先摘完了

---

## ② 母婴出海应用案例

### 场景1：新客留存诊断

**业务问题**：Momcozy 2025年1月新注册用户10,000人，D7留存15%，D30留存5%。行业标杆D7=25%，D30=12%。差距在哪？

**Cohort分析**：

| Cohort | D1 | D7 | D30 | 诊断 |
|--------|-----|-----|-----|------|
| 2024-10 | 35% | 22% | 10% | 基准 |
| 2024-11 | 33% | 20% | 9% | 下降 |
| 2024-12 | 30% | 18% | 8% | 继续下降 |
| 2025-01 | 28% | 15% | 5% | 恶化明显 |

**根因分析**：
- 渠道构成变化：1月新客中TikTok占比从20%提升到50%，TikTok用户质量较低
- Onboarding流程：1月更新了注册流程，但新用户引导缺失
- 首单体验：1月物流延迟增加，影响复购意愿

**优化策略**：
- TikTok用户单独设计onboarding流程
- 注册后24小时内发送"首单引导"邮件
- 物流延迟用户自动发放补偿优惠券

### 场景2：不同品类的留存差异

**业务问题**：首单买奶粉的用户 vs 首单买吸奶器的用户，谁的长期留存更好？

**Cohort对比**：

| 首单品类 | D1 | D7 | D30 | D90 | LTV(12月) |
|---------|-----|-----|-----|-----|----------|
| 奶粉 | 40% | 28% | 18% | 12% | $450 |
| 吸奶器 | 25% | 15% | 8% | 5% | $280 |
| 纸尿裤 | 35% | 22% | 14% | 10% | $380 |

**洞察**：奶粉用户留存最高（消耗品+定期复购），吸奶器用户留存最低（耐用品+一次性购买）。

**策略**：
- 吸奶器用户首单后强推配件（储奶袋、奶嘴）提升复购
- 纸尿裤用户推套装订阅（按月配送）锁定长期留存

---

（**换底正文在此截断** —— 完整卡正文共 280 行，本页内联到第 93 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：用户级活跃数据（user_id、活跃日期），需可识别首次活跃时间以划分队列；卡页案例为 2025 年 1 月新注册 10,000 人、D7 留存 15%、D30 留存 5%。

**输出**：队列留存矩阵与留存曲线、各队列与基准的差异诊断（卡页行业标杆 D7 25%、D30 12%）与根因假设清单（渠道构成变化、引导缺失、物流延迟），供增长与运营团队定改进优先级。

## 执行步骤

1. 划分用户队列：以首次活跃日期为口径。
2. 计算 D1/D7/D30 留存矩阵并绘制留存曲线。
3. 对比行业基准与往期队列，标出恶化最明显的批次。
4. 交叉渠道构成、注册引导与首单履约等维度做根因假设。
5. 输出改进优先级与后续观测指标。

## 边界与不做

- 何时不用：用户量太小、活跃数据不连续或无法确定首次活跃时间时不要用；个体级流失预测不属于本卡。
- 能力边界：本卡只做诊断与根因假设，不产出干预动作，也不承诺留存提升幅度。
- 安全边界：留存数据须聚合使用，不得输出个体轨迹或对外披露。

## 技能关联

- **前置**：Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Cohort-Retention-Analysis

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-Cohort-Retention-Analysis`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（166 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Cohort-Retention-Analysis`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:1905.09262，但该号在 arXiv 上是《Phase-coherent caloritronics with ordinary and topological Josephson junctions》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Modeling Retention Curves with Power Law and BG/NBD》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
