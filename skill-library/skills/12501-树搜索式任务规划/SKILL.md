---
name: "p2s-tree-of-thoughts-planning"
title: "Tree of Thoughts — 树搜索式任务规划"
description: "触发词：树搜索规划、多路径探索、方案比选、回溯、设计决策。何时不用：促销等参数化情景对比用「供应链 What-If 情景分析引擎」；单步或线性即可回答的任务不必用本技能。安全边界：路径评估由 LLM 打分，关键方案必须人工复核后再落地，不得仅凭搜索得分决策。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-010"
l3_business: "情景模拟"
l3_all: "情景模拟 / 促销规划"
l1_l2_l3: "经营管理/经营与组织/情景模拟"
quality_tier: "curated"
p2s_card_id: "Skill-Tree-of-Thoughts-Planning"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "CCF-A"
p2s_paper_id: "2305.10601"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Tree-of-Thoughts-Planning"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Tree-of-Thoughts-Planning.md"
rebase_source_sha256: "a6255ed56e8ca7be39421e4d098d002291bb328cf6d508783983c2fb6e60afbf"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "a6255ed56e8ca7be39421e4d098d002291bb328cf6d508783983c2fb6e60afbf"
rebase_full_card_bytes: "14368"
rebase_full_card_lines: "304"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "e29aa876c90045f1a2eae2dfd4454912f7572a2feb1820f55f26c82d686cb967"
user_summary: "遇到一连串相互影响的决策时，像下棋一样展开多条路径、评估中间结果、走不通就回溯。"
user_try: "试试：用树搜索帮我设计新 VOC 标签体系，在层级不超过 3 层、标签 500-800 个的约束下比较几条设计路径。"
whenToUse: "当决策是树状耦合（每一步影响后续、容易陷入局部最优）且需要系统探索时用本技能；参数化情景对比用「供应链 What-If 情景分析引擎」；单步推理即可回答的问题不必用。"
workflow: "把问题拆成多层决策点并定义每步的候选动作 → 对候选动作做展开并评估中间进展 → 保留高分路径继续展开、淘汰低分路径并回溯 → 收敛输出推荐方案与备选路径"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "7"
rebase_evidence_quotes_total: "14"
rebase_evidence_quotes_complete: "false"
---
# Tree of Thoughts — 树搜索式任务规划

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`，sha256 `a6255ed56e8ca7be39421e4d098d002291bb328cf6d508783983c2fb6e60afbf`，14368 字节 / 304 行 / 14 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及前 7 条（共 14 条）逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `e29aa876c90045f1a2eae2dfd4454912f7572a2feb1820f55f26c82d686cb967`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Tree of Thoughts — 树搜索式任务规划

---

## ① 算法原理

### 核心思想

**Tree of Thoughts (ToT)** 将 LLM 的推理过程从线性链式思维（Chain-of-Thought）扩展为**树状搜索**。核心洞察：**人类解决复杂问题时会探索多条路径、评估中间进展、在死胡同回溯**——LLM 也应该具备这种"深思熟虑"的能力。

ToT 与 CoT 的本质区别：

| 维度 | CoT | ToT |
|------|-----|-----|
| 结构 | 单一路径 | 分支树 |
| 回溯能力 | 无 | 可剪枝回溯 |
| 探索能力 | 一次生成 | 多路径并行探索 |
| 评估 | 仅最终输出 | 中间节点可评估 |
| 适用任务 | 简单推理 | 需要探索的复杂问题 |

ToT 的四个步骤：
1. **Thought Decomposition**：将问题分解为中间推理步骤（thoughts）
2. **Thought Generation**：从每个节点生成 $k$ 个候选 thoughts（采样或提议）

（**换底正文在此截断** —— 完整卡正文共 304 行，本页内联到第 24 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 内联 7 / 全 14 条 —— **其余 7 条见 `references/full-card.md`**）

> ⚠️ SKILL.md 有 12 KB 硬门禁，本卡装不下全部 14 条逐字引文。本页按完整卡顺序内联**前 7 条整条引文**（不在引文中间断开）；其余 7 条逐字原文见 `references/full-card.md` 的「原文引用」段。

> 原文:"To surmount these challenges, we introduce a new framework for language model inference, “Tree of Thoughts” (ToT), which generalizes over the popular “Chain of Thought” approach to prompting language models, and enables exploration over coherent units of text (“thoughts”) that serve as intermediate steps toward problem solving. ToT allows LMs to perform deliberate decision making by considering multiple different reasoning paths and self-evaluating choices to decide the next course of action, as well as looking ahead or backtracking when necessary to make global choices."
> 出处：2305.10601 Abstract

> 原文:"Research on human problem-solving suggests that people search through a combinatorial problem-space – a tree where the nodes represent partial solutions, and the branches correspond to operators that modify them"
> 出处：2305.10601 §3 Tree of Thoughts: Deliberate Problem Solving with LM

> 原文:"ToT frames any problem as a search over a tree, where each node is a state $s=[x,z_{1\cdots i}]$ representing a partial solution with the input and the sequence of thoughts so far."
> 出处：2305.10601 §3 Tree of Thoughts: Deliberate Problem Solving with LM

### B. 四个步骤（对应 ①「ToT 的四个步骤」逐条）

> 原文:"1. Thought decomposition. While CoT samples thoughts coherently without explicit decomposition, ToT leverages problem properties to design and decompose intermediate thought steps."
> 出处：2305.10601 §3 Tree of Thoughts（1. Thought decomposition）

> 原文:"3. State evaluator $V(p_{\theta},S)$. Given a frontier of different states, the state evaluator evaluates the progress they make towards solving the problem, serving as a heuristic for the search algorithm to determine which states to keep exploring and in which order."
> 出处：2305.10601 §3 Tree of Thoughts（3. State evaluator）

> 原文:"Breadth-first search (BFS) (Algorithm 1) maintains a set of the $b$ most promising states per step."
> 出处：2305.10601 §3 Tree of Thoughts（4. Search algorithm）

> 原文:"Depth-first search (DFS) (Algorithm 2) explores the most promising state first, until the final output is reached ($t>T$), or the state evaluator deems it impossible to solve the problem from the current $s$ ($V(p_{\theta},\{s\})(s)\leq v_{th}$ for a value threshold $v_{th}$). In the latter case, the subtree from $s$ is pruned to trade exploration for exploitation. In both cases, DFS backtracks to the parent state of $s$ to continue exploration."
> 出处：2305.10601 §3 Tree of Thoughts（4. Search algorithm）

### C. 关键假设（对应 ①关键假设 2「Thought 可评估」与 3「搜索空间可控」）

## 输入 / 输出契约

**输入**：现有基础资料与约束条件（如现有标签体系字典、评论样本、层级与数量约束），以及初始决策点与目标判据。

**输出**：探索出的候选方案路径、各路径评估分数与推荐方案；供设计或计划负责人决策。

## 执行步骤

1. 把问题拆成多层决策点并定义每步候选动作
2. 对候选动作做展开并评估中间进展
3. 保留高分路径继续展开、淘汰低分路径并回溯
4. 收敛输出推荐方案与备选路径

## 边界与不做

- 数据不满足：缺少约束条件与评估判据时搜索会发散，先定义约束与打分标准。
- 何时不用：参数化情景对比用「供应链 What-If 情景分析引擎」；单步或线性任务不必树搜索；需要流程化推进用 SOP 类技能。
- 能力边界：只做方案探索与排序，不执行方案落地，也不保证搜索到全局最优（受搜索预算约束）。
- 安全边界：路径评估由 LLM 打分，关键方案必须人工复核后再落地，不得仅凭搜索得分决策。

## 技能关联

- **可组合**：Skill-Tree-of-Thoughts-Planning

---

> 分类：经营管理/经营与组织/情景模拟　·　技术族：10-MAS　·　源卡：`Skill-Tree-of-Thoughts-Planning`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（196 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`）。

- 论文：2305.10601
- 标题：Tree of Thoughts: Deliberate Problem Solving with Large Language Models
- venue 档位：CCF-A
- 证据基础：paper-verbatim

- 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`）。
>
> - 论文：2305.10601
> - 标题：Tree of Thoughts: Deliberate Problem Solving with Large Language Models
> - venue 档位：CCF-A
> - 证据基础：paper-verbatim
>
> - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
>
> **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
>
> > ## ⑧ 论文来源
> >
> > **本卡溯源换底自精选线** `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`）。
> >
> > - 论文：2305.10601
> > - 标题：Tree of Thoughts: Deliberate Problem Solving with Large Language Models
> > - venue 档位：CCF-A
> > - 证据基础：paper-verbatim
> >
> > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> >
> > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> >
> > > ## ⑧ 论文来源
> > >
> > > **本卡溯源换底自精选线** `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`）。
> > >
> > > - 论文：2305.10601
> > > - 标题：Tree of Thoughts: Deliberate Problem Solving with Large Language Models
> > > - venue 档位：CCF-A
> > > - 证据基础：paper-verbatim
> > >
> > > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> > >
> > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > >
> > > > ## ⑧ 论文来源
> > > >
> > > > **本卡溯源换底自精选线** `Skill-Tree-of-Thoughts-Planning`（完整卡：`references/full-card.md`）。
> > > >
> > > > - 论文：2305.10601
> > > > - 标题：Tree of Thoughts: Deliberate Problem Solving with Large Language Models
> > > > - venue 档位：CCF-A
> > > > - 证据基础：paper-verbatim
> > > >
> > > > - 逐字引文：14 条，全部内联于上方「原文引用」段；一条不截断。
> > > >
> > > > **换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：
> > > >
> > > > > ## ⑧ 论文来源
> > > > >
> > > > > **出处（已核验）**：arXiv:2305.10601 — Tree of Thoughts: Deliberate Problem Solving with Large Language Models
> > > > >
> > > > > 核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。
