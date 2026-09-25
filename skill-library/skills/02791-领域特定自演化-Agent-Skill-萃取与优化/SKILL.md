---
name: "p2s-auto-skill-synthesis"
title: "SkillForge — 领域特定自演化 Agent Skill 萃取与优化"
description: "触发词：技能自动生成、冷启动、多国多平台、工单挖掘、自演化优化。何时不用：技能版本管理与溯源走「技能版本管理」；技能注册与动态发现走「技能注册表」。安全边界：训练用工单须脱敏，自动生成的技能上线前须经人工审核。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
quality_tier: "curated"
p2s_card_id: "Skill-Auto-Skill-Synthesis"
p2s_src_domain: "16-智能体工程"
p2s_venue: "SIGIR 2026 (Industry Track)"
p2s_venue_tier: "CCF-A"
p2s_evidence_grade: "A"
p2s_paper_id: "2604.08618"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Auto-Skill-Synthesis"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Auto-Skill-Synthesis.md"
rebase_source_sha256: "93a261abe8ae1ebd783ea02e7031fef066bddc729ef17bfbf698388cd70a6e5a"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "93a261abe8ae1ebd783ea02e7031fef066bddc729ef17bfbf698388cd70a6e5a"
rebase_full_card_bytes: "14729"
rebase_full_card_lines: "297"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "7b10dbc7b260a258bc4c46c815aca2bc2ee5b0086036580fffac0710f2bd782b"
user_summary: "新国家、新类目上线时人工写 SOP 太慢，让系统从历史工单里自动萃取技能并持续迭代优化。"
user_try: "试试：我们要接入一个新国家的客服场景，帮我从历史工单里自动生成一套技能。"
whenToUse: "当业务扩张快、人工撰写 SOP 跟不上（新国家、新类目、新平台）时用；若重点是技能版本与知识溯源，用「技能版本管理」；若重点是技能注册与动态发现，用「技能注册表」。"
workflow: "采集历史工单与内部知识库文档 → 整理工具清单与接口 schema → 用 ReAct 轨迹与 LLM 评审萃取技能草案 → 四维度并行分析并迭代优化技能 → 人工审核后发布并跟踪一致性指标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "15"
rebase_evidence_quotes_complete: "false"
---
# SkillForge — 领域特定自演化 Agent Skill 萃取与优化

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`，sha256 `93a261abe8ae1ebd783ea02e7031fef066bddc729ef17bfbf698388cd70a6e5a`，14729 字节 / 297 行 / 15 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 15 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `7b10dbc7b260a258bc4c46c815aca2bc2ee5b0086036580fffac0710f2bd782b`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: SkillForge — 领域特定自演化 Agent Skill 萃取与优化

---

## ① 算法原理

### 核心思想

**SkillForge** 解决企业级 Agent Skill 的两大难题:(1) 通用 Skill 创建器缺少领域基础,产出的初始 Skill 与真实任务对不齐;(2) 部署后没有机制把执行失败回溯到 Skill 缺陷并定向修复。它把 Skill 视为可版本化的"软件模块"(包含 SKILL.md + tools.json + references/),建立 **创建-评估-优化** 端到端闭环。

两个核心子系统:

1. **Domain-Contextualized Skill Creator(初始化)**:从历史工单 + 内部文档 + 工具调用日志中,挖出"工作流模式 + 工具 schema + 领域知识",填入预定义模板生成 Skill_v0
2. **三阶段自演化管道**:

（**换底正文在此截断** —— 完整卡正文共 297 行，本页内联到第 15 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 15 条 —— **其余 5 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 15 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 5 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"| #Tickets | 389 | 527 | 256 | 385 | 326 | 1883 |"
> 出处：2604.08618 §3.1.1 Scenarios and Dataset, Table 1
>
> 原文:"| #Tasks | 706 | 1061 | 572 | 730 | 668 | 3737 |"
> 出处：2604.08618 §3.1.1 Scenarios and Dataset, Table 1
>
> 原文:"We evaluate SkillForge on five representative cloud technical support scenarios from a major cloud provider, as summarized in Table 1."
> 出处：2604.08618 §3.1.1 Scenarios and Dataset
>
> 原文:"All tickets are real-world, anonymized production tickets."
> 出处：2604.08618 §3.1.1 Scenarios and Dataset
>
> 原文:"We validated the LLM-judge against human annotations on a sample subset, achieving over 90% agreement, confirming its reliability for automated evaluation"
> 出处：2604.08618 §3.1.2 Evaluation Metrics
>
> 原文:"We report two variants: Strict CR (proportion classified as Consistent) and Lenient CR (proportion classified as Consistent or Partially Consistent)."
> 出处：2604.08618 §3.1.2 Evaluation Metrics
>
> 原文:"To evaluate the generality of the self-evolution mechanism, we apply it from three distinct starting points—S_manual, S_domain, and S_generic—and track the improvement over three evolution cycles."
> 出处：2604.08618 §3.3 RQ2: Effectiveness of the Self-Evolution Loop
>
> 原文:"All three starting points benefit from the self-evolution loop, with Strict CR gains of +10.99, +9.23, and +11.60 after three iterations respectively."
> 出处：2604.08618 §3.3 RQ2: Effectiveness of the Self-Evolution Loop
>
> 原文:"S_manual, despite being expert-authored, still benefits substantially (+10.99 Strict, +12.21 Lenient), indicating that automated evolution can surpass human-curated knowledge."
> 出处：2604.08618 §3.3 RQ2: Effectiveness of the Self-Evolution Loop
>
> 原文:"The skill-equipped agent achieves +13.76pp Strict CR over this legacy system on the same held-out set, confirming that domain-contextualized creation combined with automated self-evolution can surpass mature, human-engineered production systems."
> 出处：2604.08618 §3.4 Comparison with Production Legacy System
>

## 输入 / 输出契约

**输入**：需历史工单（卡页示例每场景 200-500 个 ticket，含中英与目标市场语言）、内部知识库文档、工具列表 schema，场景与工单级粒度，需脱敏管道。

**输出**：产出可发布的技能草案与版本、冷启动周期与一致性对比（卡页记录人工 2-3 周降至自动 1-2 天、客服一致性初始 +4.3pp、3 轮自演化后 +9-12pp），供运营与知识管理团队使用。

## 执行步骤

1. 采集历史工单、知识库文档与工具 schema
2. 萃取技能草案（ReAct 轨迹加 LLM 评审）
3. 并行做四维度分析并迭代优化技能
4. 人工审核技能内容与触发条件
5. 发布后跟踪客服一致性与转化指标

## 边界与不做

- 单场景工单量不足（卡页称每场景需 200-500 个）时，萃取出的技能不可靠
- 自动生成只产出草案，发布前必须人工审核，上线仍需工程配合
- 工单与知识库须脱敏，不得携带个人信息进入训练

## 技能关联

- **延伸**：Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Self-Improving-Agent-Feedback-Loop.html、Skill-Self-Improving-Agent-Feedback-Loop、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **可组合**：Skill-MetaGPT-SOP-Driven-Collaboration.html、Skill-MetaGPT-SOP-Driven-Collaboration、Skill-Auto-Skill-Synthesis

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-Auto-Skill-Synthesis`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（39 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`）。

- 论文：2604.08618
- 标题：SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
- 发表处：SIGIR 2026 (Industry Track)
- venue 档位：CCF-A
- 证据等级：A
- 证据基础：paper-verbatim

- 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`）。
>
> - 论文：2604.08618
> - 标题：SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
> - 发表处：SIGIR 2026 (Industry Track)
> - venue 档位：CCF-A
> - 证据等级：A
> - 证据基础：paper-verbatim
>
> - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2604.08618
> > - 标题：SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
> > - 发表处：SIGIR 2026 (Industry Track)
> > - venue 档位：CCF-A
> > - 证据等级：A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2604.08618
> > > - 标题：SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
> > > - 发表处：SIGIR 2026 (Industry Track)
> > > - venue 档位：CCF-A
> > > - 证据等级：A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Auto-Skill-Synthesis`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2604.08618
> > > > - 标题：SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
> > > > - 发表处：SIGIR 2026 (Industry Track)
> > > > - venue 档位：CCF-A
> > > > - 证据等级：A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：15 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2604.08618 — SkillForge: Forging Domain-Specific, Self-Evolving Agent Skills in Cloud Technical Support
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
