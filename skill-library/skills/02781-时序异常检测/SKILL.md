---
name: "p2s-argos-agentic-anomaly-detection"
title: "Argos — Agentic时序异常检测"
description: "触发词：时序异常检测、规则自动生成、误报抑制、可解释告警、多平台指标监控、F1提升。何时不用：要检测数据或概念分布漂移而非指标越界时用「数据漂移检测」；要做评论情感趋势异常触发时用「评论情感增长触发」。安全边界：Agent 生成的检测代码严禁在生产直接执行，必须在沙箱内运行并设执行超时、白名单 API、禁用危险内置函数；异常告警不得直接触发下单、改价等资金或库存动作，须人工确认。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 溯源监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
quality_tier: "curated"
p2s_card_id: "Skill-Argos-Agentic-Anomaly-Detection"
p2s_src_domain: "09-DataAgent-LLM"
p2s_venue_tier: "preprint"
p2s_paper_id: "2501.14170"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Argos-Agentic-Anomaly-Detection"
rebase_vault_path: "paper2skills-vault/09-DataAgent-LLM/Skill-Argos-Agentic-Anomaly-Detection.md"
rebase_source_sha256: "4fbfed78f8746559859c9126e875214592615c4f83a8f66fae8569d63d7508d6"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "4fbfed78f8746559859c9126e875214592615c4f83a8f66fae8569d63d7508d6"
rebase_full_card_bytes: "29514"
rebase_full_card_lines: "629"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "261d2cad214dba6c1ec45e9ab1cf8ff1c8b027771ba2bd4c801df663205e10e3"
user_summary: "让 Agent 自己写出业务能看懂的异常检测规则，比死阈值少误报，多平台销量、ROI、退货率异常一眼定位。"
user_try: "试试：用过去 90 天分平台销量数据生成一套可解释的异常检测规则，并在验证集上给出 F1。"
whenToUse: "当固定阈值规则误报率高、又需要业务人员能看懂触发条件时用本技能；若要判断的是数据分布是否漂移，改用「数据漂移检测」；若关注的是评论情感趋势，改用「评论情感增长触发」。"
workflow: "加载历史 90 天分平台、分 SKU 的指标数据 → 由 Detection Agent 为每个指标生成异常检测规则 → 由 Repair Agent 修语法、Review Agent 在验证集评估准确率 → 由 Aggregator 融合统计基线抑制误报 → 部署后实时检测并对异常触发告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "33"
rebase_evidence_quotes_complete: "false"
---
# Argos — Agentic时序异常检测

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`，sha256 `4fbfed78f8746559859c9126e875214592615c4f83a8f66fae8569d63d7508d6`，29514 字节 / 629 行 / 33 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 33 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `261d2cad214dba6c1ec45e9ab1cf8ff1c8b027771ba2bd4c801df663205e10e3`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Argos — Agentic时序异常检测

## 1. 算法原理

Argos 解决的核心矛盾是：**LLM能生成异常检测规则，但无法同时保证可解释性、可复现性和准确率**。

传统方法的缺陷：
- **深度学习模型**（FCVAE、LSTMAD）：黑盒，不可解释
- **人工规则**：可解释但无法自适应，维护成本高
- **直接LLM生成**：输出方差大，8.8%语法错误，无准确率保证

**Argos 三阶段架构**：


**三Agent协作机制**（核心创新）：

1. **Detection Agent**：接收时序数据样本和ground-truth标签，用代码模板生成Python异常检测规则
   - 输出格式：`def inference(sample: np.ndarray, threshold: float) -> np.ndarray`
   - 规则包含自然语言注释解释逻辑

2. **Repair Agent**：检查规则语法错误，用dummy data执行验证，自动修正

（**换底正文在此截断** —— 完整卡正文共 629 行，本页内联到第 33 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 33 条 —— **其余 23 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 33 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 23 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"We introduce Argos, an agentic system for detecting time-series anomalies in cloud infrastructure by leveraging large language models (LLMs)."
> 出处：2501.14170 §Abstract

> 原文:"However, existing systems often struggle to simultaneously achieve explainability, reproducibility, and autonomy, which are three indispensable properties for production use."
> 出处：2501.14170 §Abstract

> 原文:"Argos proposes to use explainable and reproducible anomaly rules as intermediate representation and employs LLMs to autonomously generate such rules."
> 出处：2501.14170 §Abstract

> 原文:"The system will efficiently train error-free and accuracy-guaranteed anomaly rules through multiple collaborative agents and deploy the trained rules for low-cost online anomaly detection."
> 出处：2501.14170 §Abstract

> 原文:"Through evaluation results, we demonstrate that Argos outperforms state-of-the-art methods, increasing $F_{1}$ scores by up to $9.5\%$ and $28.3\%$ on public anomaly detection datasets and an internal dataset collected from Microsoft, respectively."
> 出处：2501.14170 §Abstract

> 原文:"Prior work on time-series anomaly detection can be broadly categorized into three directions, yet none of these methods simultaneously address explainability, reproducibility, and autonomy."
> 出处：2501.14170 §1 Introduction

> 原文:"Conventional deep learning-based methods [68, 51, 67, 63, 75, 38, 56, 49, 70, 59] often lacks explainability since they generate anomaly labels directly from input data."
> 出处：2501.14170 §1 Introduction

> 原文:"However, due to the inherent non-determinism of LLMs [57, 45], these methods suffer from a lack of reproducibility and often produce inconsistent results when the same data is input across multiple trials."
> 出处：2501.14170 §1 Introduction

> 原文:"However, current rule generation and threshold tuning heavily rely on manual efforts, thereby lacking autonomy."
> 出处：2501.14170 §1 Introduction

> 原文:"We evaluate Argos on two widely used public time-series anomaly detection datasets, KPI [33] and Yahoo [27], as well as an internal dataset collected from Microsoft."
> 出处：2501.14170 §1 Introduction

## 输入 / 输出契约

**输入**：历史时序指标数据（如分平台、分 SKU 的每日销量、广告 ROI、退货率），带时间戳与维度字段，外加阈值或业务基线配置；粒度为指标 × 平台 × SKU × 日。

**输出**：可解释的异常检测规则（含 F1 评分与语法校验状态）、验证集评估结果与实时异常告警；供运营与数据团队定位并跟进异常。

## 执行步骤

1. 加载历史分平台分 SKU 指标数据并划分训练与验证集
2. 由 Detection Agent 针对每个指标生成检测规则
3. 由 Repair Agent 修正语法错误，Review Agent 在验证集上评估准确率
4. 由 Aggregator 融合现有统计基线，抑制误报
5. 运行受控沙箱内的检测规则做实时检测并输出可解释告警

## 边界与不做

- 数据不满足：历史长度不足或缺少平台、SKU 维度切分时规则生成与评估都不可靠，先补齐数据。
- 何时不用：分布漂移检测用「数据漂移检测」，评论情感趋势监控用「评论情感增长触发」。
- 能力边界：只生成与评估检测规则并告警，不做根因修复，也不自动执行任何业务处置。
- 安全边界：生成的规则代码严禁在生产直接执行，必须在沙箱内运行并限制超时与可用 API；告警不得直接驱动资金或库存动作。

## 技能关联

- **前置**：Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **可组合**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-Argos-Agentic-Anomaly-Detection

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Argos-Agentic-Anomaly-Detection`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（389 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`）。

- 论文：2501.14170
- 标题：arXiv:2501.14170
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：33 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`）。
>
> - 论文：2501.14170
> - 标题：arXiv:2501.14170
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：33 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2501.14170
> > - 标题：arXiv:2501.14170
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：33 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2501.14170
> > > - 标题：arXiv:2501.14170
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：33 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Argos-Agentic-Anomaly-Detection`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2501.14170
> > > > - 标题：arXiv:2501.14170
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：33 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2501.14170 — Argos: Agentic Time-Series Anomaly Detection with Autonomous Rule Generation via Large Language Models
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
