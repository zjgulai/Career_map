---
name: "p2s-reflexion-self-improvement"
title: "Reflexion — 言语强化学习与自我反思"
description: "触发词：自我反思、打标一致性、错误复盘、记忆检索、无需重训。何时不用：要提升的是评论摘要或分类本身精度用「AGRS 属性引导评论摘要」；要多角色交叉分析用「MAS VOC 多智能体分析」。安全边界：反思记忆库须定期清理且不得写入个人信息；反思结论只用于改进策略，不得当作事实证据引用。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-019"
l3_business: "VOC编码"
l3_all: "VOC编码"
l1_l2_l3: "业务运营/产品与创新/VOC编码"
quality_tier: "curated"
p2s_card_id: "Skill-Reflexion-Self-Improvement"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "preprint"
p2s_paper_id: "2303.11366"
p2s_code_level: "非 Python"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Reflexion-Self-Improvement"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Reflexion-Self-Improvement.md"
rebase_source_sha256: "89d336628da2d57c0fcfec3cb05a0ad7320c65632b3f4299bd7a9b755f914f4d"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "89d336628da2d57c0fcfec3cb05a0ad7320c65632b3f4299bd7a9b755f914f4d"
rebase_full_card_bytes: "15076"
rebase_full_card_lines: "329"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "3eb612ad52a3f72bfe3ff033cc37d8b10f9d988b0ceb19e0626d7caff39a8a81"
user_summary: "让打标 Agent 从人工修正过的错例里总结规律写进记忆，下一批同类评论不再犯同样的错，不用重新训练模型。"
user_try: "试试：用上个月人工修正过的打标记录跑一轮反思，看这批新评论的打标一致性能不能提上来。"
whenToUse: "打标或分类结果在不同批次之间一致性差、需要 Agent 自我纠错时用本技能；若要提升的是评论摘要质量，用「AGRS 属性引导评论摘要」；若需要多角色交叉分析，用「MAS VOC 多智能体分析」。"
workflow: "准备历史打标结果、人工修正记录与评估标准 → 让 Agent 评估自身输出并定位错误案例 → 生成自然语言反思结论并写入记忆库 → 在后续批次检索记忆并更新打标策略 → 按准确率、覆盖率与一致性复评效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "10"
rebase_evidence_quotes_total: "16"
rebase_evidence_quotes_complete: "false"
---
# Reflexion — 言语强化学习与自我反思

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`，sha256 `89d336628da2d57c0fcfec3cb05a0ad7320c65632b3f4299bd7a9b755f914f4d`，15076 字节 / 329 行 / 16 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 10 条（共 16 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `3eb612ad52a3f72bfe3ff033cc37d8b10f9d988b0ceb19e0626d7caff39a8a81`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Reflexion — 言语强化学习与自我反思

---

## ① 算法原理

### 核心思想

**Reflexion** 提出了一种**言语强化学习（Verbal Reinforcement Learning）**机制。核心洞察：**传统 RL 需要更新模型权重，成本高且难以解释；而 LLM 可以通过自然语言形式的"自我反思"来改进策略，无需任何权重更新**。

Reflexion 的三组件架构：

1. **Actor**：执行任务，生成输出（如代码、分析、决策）
2. **Evaluator**：评估 Actor 的输出，给出成功/失败信号和分数
3. **Self-Reflection Model**：生成 verbal reinforcement——用自然语言总结"哪里做错了、为什么、下次怎么做"


（**换底正文在此截断** —— 完整卡正文共 329 行，本页内联到第 17 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 10 / 全 16 条 —— **其余 6 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 16 条逐字引文。本页按完整卡顺序内联**前 10 条整条引文**（不在引文中间断开）；其余 6 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"Building on recent research, we propose Reflexion, an approach that endows an agent with dynamic memory and self-reflection capabilities to enhance its existing reasoning trace and task-specific action choice abilities."
> 出处：2303.11366 Abstract

> 原文:"In this study, Reflexion leverages ReAct (Yao et al.,, 2023), but any decision-making approach can be used in future implementations."
> 出处：2303.11366 §2 Architecture

> 原文:"The reflection loop aims to help the agent correct common cases of hallucination and inefficiency through trial and error. The model used for self-reflection is an LLM prompted with two-shot learning examples of domain-specific failed trajectory and ideal reflection pairs."
> 出处：2303.11366 §2.3 Reflexion

> 原文:"A heuristic $\operatorname{h}(s_{t},a_{t},\Omega,\varepsilon,\left[a_{o},o_{0},\ldots,a_{t-1},o_{t-1}\right])$ is defined to tell the agent when to reflect, where $t$ is the time step, $s_{t}$ is the current state, $\Omega$ and $\varepsilon$ are hyperparameters for the maximum number of repetitive action cycles and the maximum number of total actions allowed, and $\left[a_{o},o_{0}\ldots,a_{t-1},o_{t-1}\right])$ is the trajectory history."
> 出处：2303.11366 §2.2 Heuristics

### B. 评估信号：二值奖励（对应 ①「Evaluator 给出成功/失败信号」与 ①关键假设 3）

> 原文:"Typically, designing or training an effective yet broadly-applicable reward model can be challenging. In this work, we limit the agent to a binary reward model. A binary reward model is a type of reward function that assigns a value of 0 or 1 to an action taken by the agent in the current state. 1 indicates a successful outcome and 0 indicates an unsuccessful outcome."
> 出处：2303.11366 §2.4 Reward model

### C. 论文自报效果（对应 ⑤「无需重训」「效果验证」的量级参照）

> 原文:"To assess our approach, we evaluate the agent’s ability to complete decision-making tasks in AlfWorld environments and knowledge-intensive, search-based question-and-answer tasks in HotPotQA environments. We observe success rates of 97% and 51%, respectively, and provide a discussion on the emergent property of self-reflection."
> 出处：2303.11366 Abstract

> 原文:"We ran the agent without reflection for a single trial to establish a starting point, which achieved 63% accuracy (Fig. 2), which is in-line with the results from (Yao et al.,, 2023)"
> 出处：2303.11366 §3.1 AlfWorld（Results）

> 原文:"Given the ability to reflect, the agent used ReAct to solve 97% of the given environments in 12 trials, failing to solve only 4 out of 134 tasks."
> 出处：2303.11366 §3.1 AlfWorld（Results）

> 原文:"Reflexion enabled the agent to successfully answer 54% of the questions from the dataset, outperforming the base ReAct agent by 20% (Fig. 3) and its first trial attempt by 22%."
> 出处：2303.11366 §3.2 HotPotQA（Results）

> 原文:"While the base ReAct agent achieved 34% accuracy and the Reflexion agent achieved 32% accuracy in the first trials (Fig. 3), the Reflexion agent was able to outperform the base ReAct agent over the course of 7 trials."
> 出处：2303.11366 §3.2 HotPotQA（Results）

## 输入 / 输出契约

**输入**：历史打标结果、人工审核后的修正记录，以及评估标准（标签准确率、覆盖率、一致性）。

**输出**：反思结论与更新后的策略：调整后的打标规则与记忆条目，以及准确率、覆盖率、一致性的前后对比（卡页称打标一致性可从 72% 提升到 91%）。

## 执行步骤

1. 准备历史打标结果与人工修正记录
2. 让 Agent 评估输出并定位错误案例
3. 生成自然语言反思并写入记忆库
4. 在后续批次检索记忆并更新策略
5. 复评一致性与准确率的变化

## 边界与不做

- 没有人工修正记录或评估信号时不适用，缺乏 ground truth 的反思无法验证
- 反思与记忆只改进策略、不更新模型权重；反思结论须人工审核后才可进入生产规则
- 记忆库需定期清理，不得写入用户个人信息或原始敏感评论

## 技能关联

- **可组合**：Skill-Reflexion-Self-Improvement

---

> 分类：业务运营/产品与创新/VOC编码　·　技术族：10-MAS　·　源卡：`Skill-Reflexion-Self-Improvement`

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`）。

- 论文：2303.11366
- 标题：Reflexion: an autonomous agent with dynamic memory and self-reflection
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`）。
>
> - 论文：2303.11366
> - 标题：Reflexion: an autonomous agent with dynamic memory and self-reflection
> - venue 档位：preprint
> - 证据基础：paper-verbatim
>
> - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2303.11366
> > - 标题：Reflexion: an autonomous agent with dynamic memory and self-reflection
> > - venue 档位：preprint
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2303.11366
> > > - 标题：Reflexion: an autonomous agent with dynamic memory and self-reflection
> > > - venue 档位：preprint
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Reflexion-Self-Improvement`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2303.11366
> > > > - 标题：Reflexion: an autonomous agent with dynamic memory and self-reflection
> > > > - venue 档位：preprint
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：16 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2303.11366 — Reflexion: Language Agents with Verbal Reinforcement Learning
> > > > > ⚠️ 该号被 2 张卡共用，最多只有一张能对。
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
