---
name: "p2s-mcp-tool-use-benchmark"
title: "MCP Tool Use 评估基准 — TFS/TEFS 双指标与干扰测试"
description: "触发词：MCP工具评估、TFS与TEFS、工具选择审计、并行串行效率、干扰测试、模型选型。何时不用：要定位感知/规划/执行阶段短板用「Agent阶段评估」；要评估生产可靠性三维曲面用「Agent可靠性评估」。安全边界：评测必须在沙箱中运行并 mock 外部工具，禁止在评测环境调用生产接口或产生真实下单、扣款等副作用。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 接口契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
quality_tier: "curated"
p2s_card_id: "Skill-MCP-Tool-Use-Benchmark"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2512.24565"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-MCP-Tool-Use-Benchmark"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-MCP-Tool-Use-Benchmark.md"
rebase_source_sha256: "822ce88f55b852c2e9f8eb9915324080c25a07fbd43bad3359a00803ca47c2f7"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "822ce88f55b852c2e9f8eb9915324080c25a07fbd43bad3359a00803ca47c2f7"
rebase_full_card_bytes: "20741"
rebase_full_card_lines: "428"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "a5b449939555ae13a90d4924d6ea5b9078091ac19b751dee70e7644dc2e28918"
user_summary: "同样的客服任务，谁的 Agent 调工具又对又省步骤？用 TFS/TEFS 双指标量出来，别再靠人工抽查。"
user_try: "试试：给我们几个客服 Agent 跑一轮工具调用评测，比较 TFS、TEFS 和 Token 效率。"
whenToUse: "当要在多个模型或 Agent 之间客观比较工具调用能力、而不是只看任务成败时用本技能；若要定位能力出在感知还是规划，用「Agent阶段评估」；若要评估生产压力下的可靠性，用「Agent可靠性评估」。"
workflow: "构建领域测试集：简单查询、多步串行、批量并行三类任务 → 在沙箱中以 mock 工具运行各模型并记录调用轨迹 → 计算 TFS 任务成功率与 TEFS 高效成功率双指标 → 审计缺失工具、多余工具与步骤冗余 → 输出跨模型对比结论与选型建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "32"
rebase_evidence_quotes_complete: "false"
---
# MCP Tool Use 评估基准 — TFS/TEFS 双指标与干扰测试

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`，sha256 `822ce88f55b852c2e9f8eb9915324080c25a07fbd43bad3359a00803ca47c2f7`，20741 字节 / 428 行 / 32 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 32 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `a5b449939555ae13a90d4924d6ea5b9078091ac19b751dee70e7644dc2e28918`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: MCP Tool Use 评估基准 — TFS/TEFS 双指标与干扰测试

---

## ① 算法原理

### 核心思想

**MCPAgentBench** (北京大学 + ZTE, 2026) 是首个专注于**工具选择与执行效率**的 MCP 评估基准。现有基准 (MCP-Universe, MCP-RADAR) 主要测正确性，忽略了一个关键问题：**模型能完成任务，但效率极低** —— 该并行时串行、该串行时并行、传过多参数、反复试错。

论文核心洞察：**任务完成率 ≠ 执行效率**。一个模型可能 TFS (完成率) 很高，但 TEFS (效率完成率) 很低，说明它在"暴力解题"而非"优雅解题"。

### 数据集构建

**四步流水线**:

| 步骤 | 输入 | 输出 | 方法 |

（**换底正文在此截断** —— 完整卡正文共 428 行，本页内联到第 18 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 32 条 —— **其余 22 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 32 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 22 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"MCPAgentBench employs a sandbox environment built upon the Autogen framework."
> 出处：2512.24565 §3.1（评估环境基于 Autogen 沙箱）

> 原文:"After deduplication, we obtain definitions for 9714 MCP servers and over 20000 MCP tools."
> 出处：2512.24565 §3.2 Step 1（原始数据规模：9,714 servers / 20,000+ tools）

> 原文:"For Tasks, we collect real-world user queries and task descriptions from the Hugging Face Datasets platform and other academic datasets like Infinity-Instruct (2025) and Schema-Guided Dialogue Dataset Rastogi et al. (2020)."
> 出处：2512.24565 §3.2 Step 1（任务侧数据来源：HuggingFace + Infinity-Instruct）

> 原文:"To construct high-quality test cases, MCPAgentBench employs a four-step data processing workflow designed to ensure task authenticity, tool representativeness, and solution uniqueness."
> 出处：2512.24565 §3.2（四步流水线的出处）

> 原文:「Therefore, strict manual curation is performed, aiming to align the Task and Tool to achieve a "unique solution" with minimal modifications.」
> 出处：2512.24565 §3.2 Step 3（人工审核确保唯一解）

> 原文:"LLM (e.g., GPT-4o) automatically generate Python stub functions based on the curated tool definitions (including tool name, description, and parameters)."
> 出处：2512.24565 §3.2 Step 4（GPT-4o 生成 stub 函数 + 专家审核）

> 原文:「This design not only tests the model’s fundamental tool-calling capabilities but also specifically assesses its tool discrimination and anti-interference abilities in a "needle in a haystack" scenario.」
> 出处：2512.24565 §3.1（Distractor「大海捞针」场景的原文表述）

> 原文:"Task Domain: 1) General Tasks: Covers common scenarios such as daily life, entertainment, and office work. 2) Professional Tasks: Involves specific domains, such as academic research or software engineering."
> 出处：2512.24565 §3.3（两个 domain 的划分）

> 原文:"Invocation Complexity: 1) Single-Tool Invocation: The task can be resolved by invoking only one MCP tool. This tests the Agent’s foundational ability to understand and select the correct tool."
> 出处：2512.24565 §3.3（Single-Tool 类型定义）

> 原文:"2) Dual-Tool Parallel Invocation: The task requires the Agent to plan and invoke two independent tools concurrently. This assesses the Agent’s task decomposition and parallel planning capabilities."
> 出处：2512.24565 §3.3（Dual Parallel 类型定义）

## 输入 / 输出契约

**输入**：领域化测试集（任务、期望工具集、期望步数）、待评测模型的执行轨迹（实际调用的工具与步数、是否成功）、沙箱环境与 mock 工具定义；粒度为单条任务的一次执行轨迹。

**输出**：TFS 与 TEFS 双指标、Token 效率对比表与工具选择审计明细（缺失工具、多余工具、步骤冗余），形成模型选型结论；供技术选型与工具上线前回归测试使用。

## 执行步骤

1. 按业务场景构建简单查询、多步串行、批量并行三类测试任务
2. 用 mock 工具在沙箱中运行各候选模型并采集调用轨迹
3. 计算 TFS 成功率与 TEFS 高效成功率两项指标
4. 审计每次执行的缺失工具、多余工具与步骤冗余
5. 输出跨模型对比表与选型建议

## 边界与不做

- 数据不满足：没有领域化测试集时指标不具代表性，先按业务任务类型构建测试集。
- 何时不用：阶段能力诊断用「Agent阶段评估」，生产可靠性评估用「Agent可靠性评估」。
- 能力边界：只做评测与对比，不改进模型本身，也不替代上线前的真实业务验收。
- 安全边界：评测必须在沙箱内用 mock 工具完成，不得调用生产接口或产生真实交易副作用。

## 技能关联

- **前置**：Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Open-Source-Tool-Use-Model.html、Skill-Open-Source-Tool-Use-Model、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **延伸**：Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization
- **可组合**：Skill-AB-Test-Result-Interpretation.html、Skill-AB-Test-Result-Interpretation、Skill-MCP-Tool-Use-Benchmark

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-MCP-Tool-Use-Benchmark`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（46 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`）。

- 论文：2512.24565
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`）。
>
> - 论文：2512.24565
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2512.24565
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2512.24565
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-MCP-Tool-Use-Benchmark`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2512.24565
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：32 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2512.24565 — MCPAgentBench: A Real-world Task Benchmark for Evaluating LLM Agent MCP Tool Use
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
