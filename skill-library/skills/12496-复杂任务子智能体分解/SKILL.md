---
name: "p2s-subagent-decomposition"
title: "Subagent Decomposer — 复杂任务子智能体分解"
description: "触发词：任务分解、子 Agent 并行、VOC 周报、增量更新、上下文超限。何时不用：有依赖需要 DAG 定序与局部重算用「DAG 任务解耦规划」；按任务形态选拓扑用「任务自适应拓扑路由」。安全边界：子 Agent 只能访问本分区数据，分片权限必须在分解时显式声明，不得越界读取他区数据。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
quality_tier: "curated"
p2s_card_id: "Skill-Subagent-Decomposition"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Subagent-Decomposition"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Subagent-Decomposition.md"
rebase_source_sha256: "898ceedaa1b5d7a5b724b1d5e2c43ba5d04b57e397420cd816bc0b4e6d6a4d28"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "898ceedaa1b5d7a5b724b1d5e2c43ba5d04b57e397420cd816bc0b4e6d6a4d28"
rebase_full_card_bytes: "9292"
rebase_full_card_lines: "282"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "1c591a17cc736a5a0282830f6cc25fbdd55a894c256a72b7be5869a699063f59"
user_summary: "把一份全品类周报拆成多个子 Agent 并行跑，几十分钟的活压到几分钟，还支持增量更新。"
user_try: "试试：把 36 万条评论的全品类 VOC 周报拆成按品类的并行子任务，只重算变化的部分。"
whenToUse: "当单 Agent 处理大数据量任务会超上下文或太慢、需要按数据分区并行时用本技能；有依赖需要定序与局部重算，用「DAG 任务解耦规划」；要按任务形态选拓扑，用「任务自适应拓扑路由」。"
workflow: "按数据分区（如品类）把任务拆成子任务 → 为每个子任务分配专用 Agent 与分析技能 → 并行执行并按分区收集结果 → 汇总生成报告，并支持只重算变化分区"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Subagent Decomposer — 复杂任务子智能体分解

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`，sha256 `898ceedaa1b5d7a5b724b1d5e2c43ba5d04b57e397420cd816bc0b4e6d6a4d28`，9292 字节 / 282 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `1c591a17cc736a5a0282830f6cc25fbdd55a894c256a72b7be5869a699063f59`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Subagent Decomposer — 复杂任务子智能体分解

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想

**Subagent Decomposer** 负责将复杂的 Task Blueprint 分解为可独立执行的子任务，并分配给专门的子 Agent。核心洞察：**复杂任务（如"生成全品类 VOC 周报"）无法由单个 Agent 高效完成，必须分解为并行/串行的子任务，每个子任务由最优技能的子 Agent 执行**。

分解的三个层次：

1. **横向分解（Parallel Decomposition）**：按数据维度拆分，子任务间无依赖，可并行执行
   - 例：按品类拆分（吸奶器/储奶袋/推车分别分析）

2. **纵向分解（Sequential Decomposition）**：按处理阶段拆分，子任务间有依赖，必须串行
   - 例：抽取 → 清洗 → 分析 → 报告

3. **混合分解（Hybrid Decomposition）**：横向 + 纵向结合，形成 DAG（有向无环图）
   - 例：先按品类并行抽取，再汇总做跨品类对比分析

### 分解策略

**基于 Skill Registry 的分解**：


### 关键假设

1. **任务可分解**：复杂任务可以拆分为独立的子任务
2. **子任务可分配**：每个子任务有对应的最优技能
3. **依赖可静态分析**：子任务间的依赖关系在分解时可确定
4. **并行有收益**：并行执行的总时间 < 串行执行的总时间

---

## ② 母婴出海应用案例

### 场景一：全品类 VOC 周报生成

**业务问题**：

生成一份覆盖全品类的 VOC 周报需要：抽取所有品类的评论实体/情感、汇总趋势、生成洞察、输出报告。数据量大（36万+评论），单 Agent 处理太慢。

**数据要求**：

- 按品类分区的评论数据
- 各品类的分析技能（抽取/情感/汇总）
- 报告模板

**预期产出**：


**业务价值**：
- 周报生成从 8 小时缩短到 1.2 小时
- 各品类分析质量一致（专用 Agent 处理专用数据）
- 支持增量更新（只需重新分析变化的部分）

---

### 场景二：竞品深度对标分析

**业务问题**：

深度对标分析涉及多维度（价格、功能、用户评价、市场份额、渠道分布），每个维度需要不同的数据源和分析方法。

**数据要求**：

- 竞品产品数据（多平台）
- 用户评价数据
- 市场价格数据
- 渠道/市场份额数据

**预期产出**：


**业务价值**：
- 深度分析从 3-5 天缩短到 2-4 小时
- 各维度分析专业深度一致
- 分析框架可复用（换竞品只需替换数据）

---

（**换底正文在此截断** —— 完整卡正文共 282 行，本页内联到第 169 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：按品类分区的评论数据、各品类的分析技能（抽取、情感、汇总）、报告模板，以及任务定义与技能边界信息。

**输出**：各分区分析结果与汇总后的 VOC 周报，以及可增量更新的中间产物；供运营与分析师使用。

## 执行步骤

1. 按数据分区（如品类）把任务拆成子任务
2. 为每个子任务分配专用 Agent 与分析技能
3. 并行执行并按分区收集结果
4. 汇总生成报告并支持只重算变化分区

## 边界与不做

- 数据不满足：数据无法按分区切分或技能边界不清时分解会互相污染，先定义边界。
- 何时不用：有强依赖需要 DAG 定序与局部重算用「DAG 任务解耦规划」；按任务形态选拓扑用「任务自适应拓扑路由」；数据量小的任务单 Agent 更快。
- 能力边界：产出分解与并行契约，不做执行器，各分区产出需统一 Schema 后才能拼接。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-Subagent-Decomposition

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-Subagent-Decomposition`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（246 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Subagent-Decomposition`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2006.16668，但该号在 arXiv 上是《GShard: Scaling Giant Models with Conditional Computation and Automatic Sharding》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《Task Decomposition and Subagent Allocation in MultiAgent Systems》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
