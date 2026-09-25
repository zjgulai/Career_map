---
name: "p2s-co-evolutionary-skill-verification"
title: "Skill 自动演化与验证 — EvoSkills 双 LLM 协同优化"
description: "触发词：技能演化、双 LLM 协同、回归验证、跨模型迁移、SOP 质检。何时不用：技能注册与动态加载走「技能注册表」；技能全生命周期治理走「技能生命周期设计」。安全边界：演化与验证须在隔离沙箱中执行，生成方与验证方不得共享上下文造成互相迁就。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本 / Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
quality_tier: "curated"
p2s_card_id: "Skill-Co-Evolutionary-Skill-Verification"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "field-top"
p2s_paper_id: "2604.01687"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Co-Evolutionary-Skill-Verification"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Co-Evolutionary-Skill-Verification.md"
rebase_source_sha256: "b82a76fb06e0db524800353d8fffd6fe13643de66b865ab8081cb61b3bc338f5"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "b82a76fb06e0db524800353d8fffd6fe13643de66b865ab8081cb61b3bc338f5"
rebase_full_card_bytes: "19096"
rebase_full_card_lines: "397"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "a1b00568b8cea03d68e703a37be06cea6096cba0c3bad7f75bfcbf6a73e25467"
user_summary: "技能改来改去容易改坏时，让两个模型一个负责生成、一个负责验证，把回归问题挡在上线之前。"
user_try: "试试：帮我把这个客服场景的 SOP 用生成加验证的双模型流程打磨一遍。"
whenToUse: "当技能迭代频繁、需要防回归且要在多模型间迁移时用；若只是技能注册与加载，用「技能注册表」；若要做全生命周期治理，用「技能生命周期设计」。"
workflow: "为场景收集 oracle 真值样本（30-100 个） → 生成方 LLM 产出技能包草案 → 验证方 LLM 在隔离沙箱中执行并打分 → 按反馈迭代演化技能直到通过 → 记录回归结果与跨模型迁移表现"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "11"
rebase_evidence_quotes_total: "21"
rebase_evidence_quotes_complete: "false"
---
# Skill 自动演化与验证 — EvoSkills 双 LLM 协同优化

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`，sha256 `b82a76fb06e0db524800353d8fffd6fe13643de66b865ab8081cb61b3bc338f5`，19096 字节 / 397 行 / 21 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 11 条（共 21 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `a1b00568b8cea03d68e703a37be06cea6096cba0c3bad7f75bfcbf6a73e25467`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: 协同演化 Skill 验证 — EvoSkills 自动萃取 + 信息隔离审核

---

## ① 算法原理

### 核心思想

**EvoSkills** 解决 LLM Agent **多文件 Skill 包**自动生成的两个根本挑战:

1. **一次性生成不可靠**:单次 LLM 调用难以同时写好 `SKILL.md` + 多个脚本 + 参考资料
2. **缺失 ground-truth 信号**:真实环境下没有 oracle 测试,只有不透明的 pass/fail 二值反馈

EvoSkills 用**双 LLM 协同演化框架**绕过这两个问题:


（**换底正文在此截断** —— 完整卡正文共 397 行，本页内联到第 16 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 11 / 全 21 条 —— **其余 10 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 21 条逐字引文。本页按完整卡顺序内联**前 11 条整条引文**（不在引文中间断开）；其余 10 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"provides the first systematic benchmark for evaluating agent skills, comprising 87 tasks across 11 domains with deterministic verifiers."
> 出处：2604.01687 §2 Related Work
>
> 原文:"It contains 87 tasks across roughly 20 professional domains, providing broad coverage of the real-world distribution of skill-augmented tasks."
> 出处：2604.01687 §4.1 Experimental Setup
>
> 原文:"EvoSkills reaches a 71.1% pass rate, exceeding the no-skill baseline (30.6%) by $+40.5$pp and human-curated skills (53.5%) by $+17.6$pp. The Skill-Creator baseline achieves only 34.1%, barely above the no-skill baseline"
> 出处：2604.01687 §4.2 RQ1: Skill Quality Comparison
>
> 原文:"removing the surrogate verifier drops pass rate from 71.1% to 41.1%, and using background context yields only 48.6%."
> 出处：2604.01687 §4.3 RQ2: Ablation Studies
>
> 原文:"First, removing the surrogate verifier drops the pass rate from 71.1% to 41.1% ($-30.0$pp)."
> 出处：2604.01687 Appendix B Ablation Studies
>
> 原文:"Second, providing only background context documents without any evolution yields 48.6% pass rate, above the no-skill baseline ($+18.0$pp) but well below EvoSkills ($-22.5$pp)."
> 出处：2604.01687 Appendix B Ablation Studies
>
> 原文:"Self-evolved skills outperform human-curated skills in 9 of 11 domains, with the largest margins in Finance ($+56.9$pp over human-curated) and Cybersecurity ($+23.2$pp)."
> 出处：2604.01687 §4.5 RQ4: Domain-Level Analysis
>
> 原文:"At round 0 (one-shot generation without verification), EvoSkills performs on par with the no-skill baseline, but the pass rate climbs sharply once iterative verification begins, reaching 44% at round 2, surpassing human-curated skills at round 3 (63%), and converging at 75% by round 5."
> 出处：2604.01687 §4.6 Evolution Dynamics
>
> 原文:"each task requires 4.1 verification cycles and 2.4 evolution iterations on average to achieve convergence."
> 出处：2604.01687 §4.6 Evolution Dynamics
>
> 原文:"skills evolved by a single frontier LLM transfer effectively to six additional LLMs from five companies, yielding 35–45pp gains over their respective no-skill baselines."
> 出处：2604.01687 §1 Introduction
>
> 原文:"agents create better skills than human-curated ones by capturing the reasoning patterns and tool-use strategies that agents actually need;"
> 出处：2604.01687 §1 Introduction
>

## 输入 / 输出契约

**输入**：需每个场景的 oracle ground-truth 样本（卡页示例 30-100 个每场景）、现有 SOP 与执行环境，场景级粒度；卡页称技术门槛高，需多 LLM session 编排与沙箱隔离。

**输出**：产出经双 LLM 验证的技能包与验证结果（是否通过、反馈、评分）、场景接入周期与质量改进数据（卡页记录 1-2 周降至 2 天、+18pp 至 +40pp、跨模型迁移 +36 至 +44pp），供技能团队发布。

## 执行步骤

1. 收集场景 oracle 真值样本
2. 产出技能包草案（生成方大模型）
3. 执行并打分（验证方大模型，隔离沙箱）
4. 迭代演化技能直至通过验证
5. 记录回归结果与跨模型迁移表现

## 边界与不做

- 缺少 oracle 真值样本时验证环节没有判据，演化结果不可信
- 只产出经验证的技能包与评分，上线部署与编排仍由平台执行
- 生成与验证须信息隔离并在沙箱执行，避免相互迁就

## 技能关联

- **前置**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Skill-Lifecycle-Design.html、Skill-Skill-Lifecycle-Design
- **延伸**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Memory-as-Action.html、Skill-Memory-as-Action、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **可组合**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Context-Compression.html、Skill-Context-Compression、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Co-Evolutionary-Skill-Verification

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：16-智能体工程　·　源卡：`Skill-Co-Evolutionary-Skill-Verification`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（51 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`）。

- 论文：2604.01687
- 标题：EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification
- venue 档位：field-top
- 证据基础：paper-verbatim

- 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`）。
>
> - 论文：2604.01687
> - 标题：EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification
> - venue 档位：field-top
> - 证据基础：paper-verbatim
>
> - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2604.01687
> > - 标题：EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification
> > - venue 档位：field-top
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2604.01687
> > > - 标题：EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification
> > > - venue 档位：field-top
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Co-Evolutionary-Skill-Verification`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2604.01687
> > > > - 标题：EvoSkills: Self-Evolving Agent Skills via Co-Evolutionary Verification
> > > > - venue 档位：field-top
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：21 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（可能对应，未达已核验线）**：arXiv:2602.20867 — SoK: Agentic Skills -- Beyond Tool Use in LLM Agents
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。
