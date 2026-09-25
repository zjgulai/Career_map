---
name: "p2s-rfm-customer-segmentation"
title: "RFM Customer Segmentation for Targeted Marketing"
description: "触发词：RFM 分群、用户价值分层、差异化触达、沉睡用户召回、会员分层运营。何时不用：要按婴儿月龄等生命周期阶段修正分群用月龄推断技能，要估计促销的分群因果效应用 DML 类技能，本技能只做交易价值维度分层。安全边界：用户交易与联系数据仅在授权范围内使用，触达须提供退订方式，不得基于分群做歧视性定价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/分群"
quality_tier: "curated"
p2s_card_id: "Skill-RFM-Customer-Segmentation"
p2s_src_domain: "06-增长模型"
p2s_venue_tier: "non-paper"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-RFM-Customer-Segmentation"
rebase_vault_path: "paper2skills-vault/06-增长模型/Skill-RFM-Customer-Segmentation.md"
rebase_source_sha256: "1fe9483a235b882ee3709bbf8258757706a1126f3926c39eab4932488aaf0444"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "1fe9483a235b882ee3709bbf8258757706a1126f3926c39eab4932488aaf0444"
rebase_full_card_bytes: "9319"
rebase_full_card_lines: "235"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "adac3dc95aa5fc361fcf47b69798e935dbf65c208daf40fc2a02da950478d598"
user_summary: "按最近购买、购买频次和金额把会员分成几档，每档发不一样的消息。"
user_try: "试试：对我们 10 万注册用户跑一遍 RFM 分群，给出每档人群的触达策略建议。"
whenToUse: "需要按用户交易价值分层并制定差异化触达策略时用本技能；怀疑生命周期节点被误判、要给分群加时间维度用月龄推断类技能。"
workflow: "计算 R、F、M 三项得分 → 按分位切档并分群 → 为每档人群匹配触达策略 → 执行差异化消息投放 → 跟踪打开、点击与转化变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# RFM Customer Segmentation for Targeted Marketing

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`，sha256 `1fe9483a235b882ee3709bbf8258757706a1126f3926c39eab4932488aaf0444`，9319 字节 / 235 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `adac3dc95aa5fc361fcf47b69798e935dbf65c208daf40fc2a02da950478d598`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: RFM Customer Segmentation

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

## ① 算法原理

**核心思想**：用三个维度刻画用户价值——
- **R (Recency)**：最近一次购买距今多少天。越近越可能再次购买。
- **F (Frequency)**：购买次数。越高越忠诚。
- **M (Monetary)**：累计消费金额。越高价值越大。

**为什么RFM有效**：

母婴电商的特殊性使RFM尤其适用：
- **生命周期明确**：从孕期到 toddler（0-3岁），每个阶段需求完全不同
- **复购驱动力强**：奶粉、纸尿裤是消耗品，必须定期复购
- **高价值用户集中**：少量高消费用户贡献大部分GMV

**分群方法**：

1. **等频分箱（Quantile-based）**：将R/F/M各自分为1-5分（5分最高）
2. **组合标签**：如 R=5, F=4, M=5 → "冠军用户"

**典型用户群**：

| 用户群 | R | F | M | 特征 | 策略 |
|--------|---|---|---|------|------|
| 冠军用户 | 高 | 高 | 高 | 核心高价值 | VIP专属服务、新品优先体验 |
| 忠诚用户 | 中 | 高 | 中 | 经常买但金额一般 | 升级客单价（套装推荐） |
| 潜力用户 | 高 | 低 | 高 | 新用户但消费高 | 快速建立复购习惯 |
| 沉睡用户 | 低 | 中 | 中 | 很久没买 | 召回活动、优惠券 |
| 流失风险 | 低 | 低 | 高 | 曾经高价值但很久没来 | 大额优惠券、电话回访 |
| 新用户 | 高 | 低 | 低 | 刚注册/首单 | 引导二次购买 |
| 低价值 | 低 | 低 | 低 | 偶尔买且金额低 | 降低营销成本，自然留存 |

**反直觉洞察**：
- RFM不是静态的——用户每个月都在不同群之间迁移
- "冠军用户"的流失是最痛的损失——维护1个老用户的成本是获取新用户的1/5
- 母婴用户的RFM变化有强规律性：怀孕期（高F）→ 新生儿期（极高M）→ toddler期（F下降）→ 二胎（重新高F）

---

## ② 母婴出海应用案例

### 场景1：精准营销推送

**业务问题**：Momcozy 有10万注册用户，营销团队想给不同用户发不同的邮件/推送。但一刀切的消息打开率<2%，转化率<0.1%。

**RFM应用**：
1. 计算每个用户的R、F、M得分
2. 分群并制定差异化策略：
   - 冠军用户（~5%）：新品预售邀请、VIP专属折扣
   - 沉睡用户（~20%）："我们想念你" + 15% off coupon
   - 新用户（~15%）：首单复购引导（买吸奶器→推荐储奶袋）
   - 潜力用户（~10%）：快速升级（满$150送配件套装）

**预期产出**：
- 邮件打开率：2% → 8%
- 点击率：0.3% → 1.5%
- 转化率：0.1% → 0.5%

### 场景2：用户生命周期预警

**业务问题**：识别即将从"忠诚用户"滑向"沉睡用户"的人群，在流失前干预。

**RFM迁移分析**：
1. 每月计算用户RFM并记录历史标签
2. 检测迁移模式：
   - 冠军 → 忠诚 → 沉睡 → 流失（危险路径）
   - 忠诚 → 冠军（升级路径）
3. 对处于"忠诚→沉睡"迁移中的用户触发召回

**预期产出**：
- 预警准确率：70%+
- 召回成功率：20-30%（vs 无预警召回的5%）

---

（**换底正文在此截断** —— 完整卡正文共 235 行，本页内联到第 80 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：订单明细数据，每行一笔订单，至少包含用户 ID、订单日期与订单金额三列，可从订单系统导出为表格。

**输出**：每个用户的 R、F、M 得分与人群分档（如冠军用户、沉睡用户、新用户、潜力用户）及对应的差异化触达策略；卡页口径打开率从 2% 提升到 8%、转化率从 0.1% 提升到 0.5%。

## 执行步骤

1. 按用户汇总最近购买时间、购买频次与累计消费金额。
2. 对三项指标分位打分并合成 RFM 分档。
3. 为每一档人群匹配策略，如冠军用户给预售与专属折扣。
4. 执行差异化邮件与推送触达，并跟踪打开与转化变化。

## 边界与不做

- 订单数据缺用户 ID、日期或金额任一字段，或订单量过少时不要用，分档会失去区分度。
- 能力边界：RFM 只看交易价值维度，容易把生命周期节点前的正常沉默误判为流失，需要配合月龄推断类技能修正；卡页的提升幅度为特定口径。
- 合规红线：触达须在授权范围内并提供退订方式，不得基于分群做歧视性定价。

## 技能关联

- **前置**：Skill-Feature-Engineering.html、Skill-Feature-Engineering
- **延伸**：Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎.html、Skill-VOC-Proxy-NPS-AIPL-统一萃取引擎、Skill-RFM-Customer-Segmentation

---

> 分类：业务运营/品牌与增长/分群　·　技术族：06-增长模型　·　源卡：`Skill-RFM-Customer-Segmentation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（134 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-RFM-Customer-Segmentation`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
> > > > > ⚠️ 该号被 19 张卡共用，最多只有一张能对。
> > > > > ⚠️ 卡页 ② 段点名的论文是《RFM Analysis for Customer Segmentation: A Review and Extension》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
