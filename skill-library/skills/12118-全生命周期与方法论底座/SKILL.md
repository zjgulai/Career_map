---
name: "p2s-skill-lifecycle-design"
title: "SoK Agentic Skills — Agent Skill 全生命周期与方法论底座"
description: "触发词：技能生命周期、能力契约、触发条件、下线淘汰、元数据建模。何时不用：技能优先级排序走「ROI 优先级排名」；技能自动演化与验证走「技能协同演化」。安全边界：生命周期元数据须与实际能力一致，不得为通过评估虚报效果指标。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
quality_tier: "curated"
p2s_card_id: "Skill-Skill-Lifecycle-Design"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2602.20867"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Skill-Lifecycle-Design"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Skill-Lifecycle-Design.md"
rebase_source_sha256: "a981dca0dff756bb7fc99cddaef3459cdc73d67982fe1dcfc4981c586a5f7d4a"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a981dca0dff756bb7fc99cddaef3459cdc73d67982fe1dcfc4981c586a5f7d4a"
rebase_full_card_bytes: "15582"
rebase_full_card_lines: "324"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "0e6316569b3b849df0b1c68a277b3b6750f7cdce550f7aac7a8ea2d315a707f5"
user_summary: "技能越攒越多、旧的没人用还在被调用时，给每个技能定统一的能力、触发、效果和版本契约。"
user_try: "试试：帮我把现有 80 多张技能卡补上统一的四元组头，方便 Agent 判断什么时候该用哪个。"
whenToUse: "当技能库持续累积、缺少统一契约导致误用率高时用；若要排优先级，用「ROI 优先级排名」；若要让技能自动演化并验证，用「技能协同演化」。"
workflow: "盘点现有技能卡与调用日志 → 为每张卡定义能力、触发、效果、版本四元组 → 批量补写统一 header 并登记生命周期阶段 → 用调用与错误案例校准触发条件 → 按阶段评估并淘汰无效技能"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "12"
rebase_evidence_quotes_complete: "false"
---
# SoK Agentic Skills — Agent Skill 全生命周期与方法论底座

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`，sha256 `a981dca0dff756bb7fc99cddaef3459cdc73d67982fe1dcfc4981c586a5f7d4a`，15582 字节 / 324 行 / 12 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 12 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `0e6316569b3b849df0b1c68a277b3b6750f7cdce550f7aac7a8ea2d315a707f5`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: SoK Agentic Skills — Skill 全生命周期与方法论底座

---

## ① 算法原理

### 核心思想

**SoK Agentic Skills**(Systematization of Knowledge)是 Agent Skill 领域第一篇综合 survey,把分散在 Voyager / CodeAct / Reflexion / Claude Skills / GPT Store / MCP 等系统中的"Skill 概念"统一为一个理论框架。它解决三个根本问题:

1. **Skill 到底是什么** —— 用 4 元组形式化定义,与 tool/plan/memory/prompt 区分开
2. **Skill 怎么演化** —— 用 7 阶段生命周期把所有现有系统映射到统一图谱
3. **Skill 怎么落地** —— 用 7 个设计模式 + Representation×Scope 双轴 taxonomy 系统化实现选择

（**换底正文在此截断** —— 完整卡正文共 324 行，本页内联到第 14 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 12 条 —— **其余 2 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 12 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 2 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"We ground the concept of an agentic skill in a four-tuple formalization that captures the essential properties distinguishing skills from related abstractions."
> 出处：2602.20867 §II-A Formal Definition
>
> 原文:"An agentic skill is a tuple"
> 出处：2602.20867 §II-A Formal Definition, Definition 1
>
> 原文:"The lifecycle comprises seven stages, depicted in Fig.2:"
> 出处：2602.20867 §IV Skill Lifecycle Model
>
> 原文:"Distillation: extracting a stable and generalizable procedure from trajectories or demonstrations and packaging it into the $(C,\pi,T,R)$ tuple together with descriptive metadata and usage constraints."
> 出处：2602.20867 §IV Skill Lifecycle Model, Distillation
>
> 原文:"the SkillsBench benchmark [32] demonstrates that curated skills raise agent pass rates by 16.2 percentage points on average, while self-generated skills degrade performance by 1.3 pp, encoding incorrect or overly specific heuristics."
> 出处：2602.20867 §II-C Skills as Procedural Memory
>
> 原文:"Notably, a smaller model equipped with curated skills can outperform a larger model operating without them. One interpretation is that procedural memory serves as an efficiency multiplier and partially substitute for model scale."
> 出处：2602.20867 §II-C Skills as Procedural Memory
>
> 原文:"The benchmark evaluates 86 tasks across 11 domains (healthcare, manufacturing, cybersecurity, natural science, energy, finance, office work, media, robotics, mathematics, and software engineering) using 7 agent-model configurations over 7,308 trajectories."
> 出处：2602.20867 §VIII-D Anchor Case Study: SkillsBench
>
> 原文:"Curated skills provide substantial, quantifiable improvement. Across all configurations, curated skills raise the average pass rate by 16.2 percentage points (from 24.3% to 40.6%). The effect varies dramatically by domain: healthcare sees +51.9 pp, manufacturing +41.9 pp, and cybersecurity +23.2 pp, while software engineering gains only +4.5 pp and mathematics +6.0 pp."
> 出处：2602.20867 §VIII-D Anchor Case Study: SkillsBench
>
> 原文:"Self-generated skills provide no benefit. Self-generated skills average $-$1.3 pp relative to the no-skills baseline, suggesting that models cannot yet reliably author the procedural knowledge they benefit from consuming in open-ended settings. Only one configuration (Claude Opus 4.6) showed a modest +1.4 pp, while Codex + GPT-5.2 degraded by $-$5.6 pp."
> 出处：2602.20867 §VIII-D Anchor Case Study: SkillsBench
>
> 原文:"Skills as compute equalizers. Smaller models equipped with curated skills can match or exceed larger models without skills. Claude Haiku 4.5 with skills (27.7%) outperforms Claude Opus 4.5 without skills (22.0%), suggesting that skill libraries may serve as a practical cost-reduction mechanism."
> 出处：2602.20867 §VIII-D Anchor Case Study: SkillsBench
>

## 输入 / 输出契约

**输入**：需现有技能卡内容（卡页示例 80 篇以上）、实际调用日志与错误案例（误用、用错时机），技能卡级粒度。

**输出**：产出带四元组 header 的技能卡与生命周期阶段标签、无效技能下线清单（卡页记录无效 Skill 下线率提升 60%），供 Agent 选技能与知识管理团队维护。

## 执行步骤

1. 盘点现有技能卡、调用日志与错误案例
2. 定义每张卡的能力、触发、效果、版本四元组
3. 批量补写统一 header 并登记生命周期阶段
4. 校准触发条件（调用数据与错误案例）
5. 评估并下线无效或过时技能

## 边界与不做

- 技能数量很少、调用场景单一时，统一契约的边际收益低
- 只做元数据建模与治理规则，技能内容质量与实现仍由各自负责人维护
- 元数据须反映真实能力与效果，不得虚报以通过评估

## 技能关联

- **前置**：Skill-Skill-Registry-Dynamic-Loading.html、Skill-Skill-Registry-Dynamic-Loading
- **延伸**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Co-Evolutionary-Skill-Verification.html、Skill-Co-Evolutionary-Skill-Verification、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **可组合**：Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Skill-Lifecycle-Design

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-Skill-Lifecycle-Design`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（52 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`）。

- 论文：2602.20867
- 标题：SoK: Agentic Skills - Beyond Tool Use in LLM Agents
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`）。
>
> - 论文：2602.20867
> - 标题：SoK: Agentic Skills - Beyond Tool Use in LLM Agents
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2602.20867
> > - 标题：SoK: Agentic Skills - Beyond Tool Use in LLM Agents
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2602.20867
> > > - 标题：SoK: Agentic Skills - Beyond Tool Use in LLM Agents
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Skill-Lifecycle-Design`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2602.20867
> > > > - 标题：SoK: Agentic Skills - Beyond Tool Use in LLM Agents
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：12 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2602.20867 — SoK: Agentic Skills -- Beyond Tool Use in LLM Agents
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
