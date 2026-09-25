---
name: "p2s-agent-stage-evaluation"
title: "EComStage — 电商 Agent 三阶段(Perception/Planning/Action)双向 Benchmark"
description: "触发词：阶段评估、感知规划执行、能力体检、双语标注、Benchmark、模型选型。何时不用：要看生产运行链路与 Token 成本用「Agent可观测性追踪」；要做生产可靠性三维评估用「Agent可靠性评估」。安全边界：评估集标注与参考答案必须人工复核，不得用被测模型自身的输出充当标准答案；评测样本涉及真实用户会话时须做脱敏。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 算法评估设计"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
quality_tier: "curated"
p2s_card_id: "Skill-Agent-Stage-Evaluation"
p2s_src_domain: "16-智能体工程"
p2s_venue_tier: "preprint"
p2s_paper_id: "2601.02752"
p2s_code_level: "完整实现·可解析"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Agent-Stage-Evaluation"
rebase_vault_path: "paper2skills-vault/16-智能体工程/Skill-Agent-Stage-Evaluation.md"
rebase_source_sha256: "0c9044708663cff586bf244a9ec46ef71419da264046d22d45da709a9b0ce853"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "0c9044708663cff586bf244a9ec46ef71419da264046d22d45da709a9b0ce853"
rebase_full_card_bytes: "12810"
rebase_full_card_lines: "312"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "caa05ee55c562cfc3094838f39a664d0a9cbc3a160c4dacfad5438eb7c43306a"
user_summary: "总指标差但不知道差在哪——把 Agent 拆成听懂、规划、执行三段分别打分，一眼看出短板在哪一段。"
user_try: "试试：用我们的跨境母婴客服历史会话做一次感知/规划/执行三阶段评估，告诉我短板在哪一段。"
whenToUse: "当客服或运营 Agent 整体指标下滑、需要把问题定位到感知、规划、执行中的具体一段时用本技能；若要盯生产链路与成本，用「Agent可观测性追踪」；若要做上线前的可靠性三维评估，用「Agent可靠性评估」。"
workflow: "准备历史会话与双语人工标注（意图、attitude、scenario route、solution 与参考答复） → 把评测用例按感知、规划、执行三阶段切分 → 对每阶段做闭式打分与余弦相似度评分 → 汇总各阶段得分并通过一致性检查复核 → 输出阶段级能力体检报告，指导优化与模型选型"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "9"
rebase_evidence_quotes_total: "10"
rebase_evidence_quotes_complete: "false"
---
# EComStage — 电商 Agent 三阶段(Perception/Planning/Action)双向 Benchmark

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`，sha256 `0c9044708663cff586bf244a9ec46ef71419da264046d22d45da709a9b0ce853`，12810 字节 / 312 行 / 10 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 9 条（共 10 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `caa05ee55c562cfc3094838f39a664d0a9cbc3a160c4dacfad5438eb7c43306a`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill Card: EComStage — 电商 Agent 三阶段双向评估框架

---

## ① 算法原理

### 核心思想

**EComStage** 解决现有 e-commerce benchmark 只看"最终任务是否成功"的盲点。它把 LLM Agent 的推理过程分解为三阶段评估,并首次**同时覆盖 customer-oriented 和 merchant-oriented 两类视角**:

- **Perception(感知)**:理解用户意图,识别上下文中的关键信号
- **Planning(规划)**:基于感知做行动方案,选择正确的工作流路径
- **Action(执行)**:输出最终决策或回复

7 个代表性任务覆盖三阶段 × 两视角:

| 阶段 | 任务 | 视角 | 样本数 |
|------|------|------|--------|
| Perception | Query Rewrite | 客户 | 233 |
| Perception | Attitude Classification | 商家 | 424 |
| Perception | Query Match | 客户 | 1927 |

（**换底正文在此截断** —— 完整卡正文共 312 行，本页内联到第 22 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 9 / 全 10 条 —— **其余 1 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 10 条逐字引文。本页按完整卡顺序内联**前 9 条整条引文**（不在引文中间断开）；其余 1 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Qwen3-4B-Instruct achieves the highest overall score (82.26)"
> 出处：2601.02752 §4.2.2 Open-source Models less than 7B
>
> 原文:"Among them, Claude Sonnet 4 achieves the best average score (84.21), followed closely by Gemini 2.5-Pro (84.01)."
> 出处：2601.02752 §4.2.1 Closed-source APIs
>
> 原文:"In contrast, Gemini 2.5-Pro achieves the highest accuracy in Solution Decision, benefiting from its enhanced long-term planning ability"
> 出处：2601.02752 §4.2.1 Closed-source APIs
>
> 原文:"Notably, GPT-4o, previously one of the strongest LLMs, shows relative weakness on merchant-oriented tasks."
> 出处：2601.02752 §4.3 Stage-wise and Side-wise Comparison
>
> 原文:"Our experiments reveal that no single model consistently excels across all tasks, stages, or orientations."
> 出处：2601.02752 §4.3 Stage-wise and Side-wise Comparison
>
> 原文:"EComStage evaluates LLMs through seven separate representative tasks spanning diverse e-commerce scenarios, with all samples human-annotated and quality-checked."
> 出处：2601.02752 Abstract
>
> 原文:"We evaluate a wide range of over 30 LLMs, spanning from 1B to over 200B parameters, including open-source models and closed-source APIs, revealing stage/orientation-specific strengths and weaknesses."
> 出处：2601.02752 Abstract
>
> 原文:"Unlike prior benchmarks that focus only on customer-oriented interactions, EComStage also evaluates merchant-oriented scenarios, including promotion management, content review, and operational support relevant to real-world applications."
> 出处：2601.02752 Abstract
>
> 原文:"Specifically, our Planning set contains only 164 samples, but each sample spans multiple merchant scenarios, making it highly informative despite the smaller quantity. Overall, the benchmark includes five close-ended tasks and two open-ended generation tasks."
> 出处：2601.02752 §4.2 Main Experimental Results
>

## 输入 / 输出契约

**输入**：跨境业务历史会话（每个任务 200-500 条样本）与双语人工标注（意图标签、attitude 标签、scenario route 标签、solution 选项、reference answer），并用大模型做标注一致性检查。

**输出**：分阶段得分与通过判定、任务级评估明细与能力短板定位报告；供产品与运营决定优化方向，并支持不同模型选型对比。

## 执行步骤

1. 收集历史会话并按任务类型挑选足量样本
2. 完成双语标注（意图、态度、处理路径、解决方案与参考答复）
3. 把用例切分到感知、规划、执行三个阶段
4. 对每个阶段做闭式打分与相似度评分并判定通过
5. 汇总阶段得分输出能力体检报告与选型建议

## 边界与不做

- 数据不满足：每个任务不足量标注样本时阶段得分不可信，先扩标注再出结论。
- 何时不用：运行链路与成本监控用「Agent可观测性追踪」，生产可靠性评估用「Agent可靠性评估」。
- 能力边界：只做评估与诊断，不自动修改 Agent 逻辑，也不替代线上真实业务验收。
- 安全边界：参考答案必须人工复核，禁止用被测模型输出充当标准答案；真实会话样本须脱敏。

## 技能关联

- **延伸**：Skill-Auto-Skill-Synthesis.html、Skill-Auto-Skill-Synthesis、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Multi-Agent-Debate.html、Skill-Multi-Agent-Debate
- **可组合**：Skill-Agent-Stage-Evaluation

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：16-智能体工程　·　源卡：`Skill-Agent-Stage-Evaluation`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（30 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`）。

- 论文：2601.02752
- 标题：EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：10 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`）。
>
> - 论文：2601.02752
> - 标题：EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：10 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2601.02752
> > - 标题：EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：10 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2601.02752
> > > - 标题：EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：10 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Agent-Stage-Evaluation`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2601.02752
> > > > - 标题：EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：10 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2601.02752 — EComStage: Stage-wise and Orientation-specific Benchmarking for Large Language Models in E-commerce
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
