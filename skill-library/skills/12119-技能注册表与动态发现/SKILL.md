---
name: "p2s-skill-registry-dynamic-loading"
title: "Skill Registry — 技能注册表与动态发现"
description: "触发词：技能注册、技能编排、Task Blueprint、Schema 匹配、即插即用。何时不用：Agent 实例的注册与路由走「Agent 注册与发现」；技能生命周期治理走「技能生命周期设计」。安全边界：技能注册须校验输入输出 Schema 与权限范围，未通过校验的技能不得进入编排。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-147"
l3_business: "技能版本"
l3_all: "技能版本"
l1_l2_l3: "数据与Agent平台/数据与AI运行/技能版本"
quality_tier: "curated"
p2s_card_id: "Skill-Skill-Registry-Dynamic-Loading"
p2s_src_domain: "10-MAS"
p2s_venue_tier: "non-paper"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-Skill-Registry-Dynamic-Loading"
rebase_vault_path: "paper2skills-vault/10-MAS/00-知识库-Skill卡片/Skill-Skill-Registry-Dynamic-Loading.md"
rebase_source_sha256: "d63c53acda2892f2293c1300f78795343d55e5820398be9dda9cec5b167bc693"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d63c53acda2892f2293c1300f78795343d55e5820398be9dda9cec5b167bc693"
rebase_full_card_bytes: "8867"
rebase_full_card_lines: "248"
rebase_legacy_card: "references/legacy-preview-card.md"
rebase_legacy_card_sha256: "16fc601b65f485e2aaac60b7cc89d13603897f3e3d49bfae39176c5d862373c1"
user_summary: "不同分析任务要拼不同技能组合时，让系统按任务蓝图自动匹配技能，不用人工逐个配置。"
user_try: "试试：帮我按抽取实体和情感这类任务，自动匹配出该用哪些技能组合。"
whenToUse: "当任务类型多样、需要按蓝图自动组合技能时用；若注册对象是 Agent 实例，用「Agent 注册与发现」；若做技能生命周期治理，用「技能生命周期设计」。"
workflow: "登记技能元数据与输入输出 Schema → 接收 Task Blueprint 与质量阈值 → 按 Schema 与依赖关系匹配技能组合 → 校验依赖与权限后动态加载 → 记录技能效果指标供后续对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "0"
rebase_evidence_quotes_total: "0"
rebase_evidence_quotes_complete: "true"
---
# Skill Registry — 技能注册表与动态发现

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`，sha256 `d63c53acda2892f2293c1300f78795343d55e5820398be9dda9cec5b167bc693`，8867 字节 / 248 行 / 0 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。
> 被换掉的八段预览页逐字节留档在 `references/legacy-preview-card.md`（sha256 `16fc601b65f485e2aaac60b7cc89d13603897f3e3d49bfae39176c5d862373c1`），可回看、可回退。

## 换底正文（完整卡逐字摘录）


# Skill: Skill Registry — 技能注册表与动态发现

> **证据基础声明**：本卡为人写的经验与方法总结，**无对应论文来源**；
> 卡内数字为业内实践值/示例值，**不可当作论文结论引用**。
> 若这些数字实际来自某篇论文，请补 `paper_id` 与「⑥ 原文引用」段，本卡将转为有来源卡审查。

---

## ① 算法原理

### 核心思想

**Skill Registry** 是 MAS 工作流的核心基础设施，负责管理所有可用技能的元数据、依赖关系和运行时状态。核心洞察：**一个可扩展的多 Agent 系统必须能动态发现、加载和组合技能，而不是硬编码固定流程**。

Skill Registry 的四个核心能力：

1. **技能注册（Registration）**：技能以声明式方式注册，包含元数据（名称、版本、输入/输出 Schema、依赖、质量阈值）
2. **技能发现（Discovery）**：根据 Task Blueprint 的需求，动态匹配最合适的技能组合
3. **依赖解析（Dependency Resolution）**：解析技能间的依赖关系，确保执行顺序正确
4. **版本管理（Versioning）**：支持技能的多版本共存和兼容性检查

### 架构设计


### 关键假设

1. **技能可声明式描述**：每个技能都能用元数据完整描述其能力
2. **需求可精确表达**：Task Blueprint 能清晰表达所需技能类型
3. **依赖可静态解析**：技能间的依赖关系在运行前可确定
4. **Schema 可兼容检查**：技能的输入/输出可以通过 Schema 验证兼容性

---

## ② 母婴出海应用案例

### 场景一：Task Blueprint 动态技能匹配

**业务问题**：

不同分析任务需要不同的技能组合。例如"抽取实体和情感"需要 InstructUIE + ABSA，"构建用户画像"需要 PERSONABOT + SoMeR。系统需要根据 Task Blueprint 自动匹配最合适的技能，而不是人工配置。

**数据要求**：

- Skill Registry 中注册的所有技能元数据
- Task Blueprint（任务类型、输入/输出 Schema、质量阈值）

**预期产出**：


**业务价值**：
- 零配置启动分析任务，系统自动匹配最优技能
- 新技能注册后立即可用，无需修改编排逻辑
- 技能效果可量化对比（F1、延迟、成本）

---

### 场景二：技能版本管理与回滚

**业务问题**：

技能迭代更新时（如 InstructUIE v2.0 → v2.1），新版本可能在某些场景下表现更差。需要支持多版本共存、A/B 测试、快速回滚。

**数据要求**：

- 技能版本历史
- 版本性能指标（F1、延迟、错误率）
- 回滚策略配置

**预期产出**：


**业务价值**：
- 降低技能更新风险，确保生产稳定性
- A/B 测试驱动技能迭代决策
- 故障时自动回滚，减少人工干预

---

（**换底正文在此截断** —— 完整卡正文共 248 行，本页内联到第 139 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 输入 / 输出契约

**输入**：需 Skill Registry 中的技能元数据（输入输出 Schema、质量阈值）与 Task Blueprint（任务类型、输入输出 Schema、质量阈值），任务与技能级粒度。

**输出**：产出匹配到的技能组合与加载结果、技能效果对比指标（F1、延迟、成本），供 MAS 编排器与任务调度使用。

## 执行步骤

1. 登记技能元数据与输入输出 Schema
2. 接收 Task Blueprint 与质量阈值
3. 匹配技能组合（按 Schema 与依赖关系）
4. 校验依赖与权限后动态加载技能
5. 记录技能效果指标供后续对比优化

## 边界与不做

- 任务类型单一、技能固定时，动态发现是多余的复杂度
- 只做匹配与加载，不评估技能内部实现质量，依赖解析错误会导致编排失败
- 技能须通过 Schema 与权限校验，未通过不得进入编排

## 技能关联

- **可组合**：Skill-Skill-Registry-Dynamic-Loading

---

> 分类：数据与Agent平台/数据与AI运行/技能版本　·　技术族：10-MAS　·　源卡：`Skill-Skill-Registry-Dynamic-Loading`

## ⑦ 代码节选

> **本节的完整实现**在同目录的 `references/implementation.py`（192 行）。
> 换底后本卡正文**不再内联代码** —— SKILL.md 有 12 KB 硬上限，内联会挤掉逐字引文；引文是本次换底要送达产品的证据链。
> 该卡的完整实现**未经交叉核对**（卡面无节选可校验）。
> 换底前的八段预览页（含当时的代码节选）留在 `references/legacy-preview-card.md`，可逐字回看。

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`）。

- venue 档位：non-paper
- 证据基础：author-practice

- 逐字引文：0 条，全部内联于上方「原文引用」段；一条不截断。

**换底前八段预览页的出处声明（保留备查，不构成本卡的溯源结论）**：

> ## ⑧ 论文来源
>
> **本卡溯源换底自精选线** `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`）。
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
> > **本卡溯源换底自精选线** `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`）。
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
> > > **本卡溯源换底自精选线** `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`）。
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
> > > > **本卡溯源换底自精选线** `Skill-Skill-Registry-Dynamic-Loading`（完整卡：`references/full-card.md`）。
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
> > > > > **卡页记录的出处不可采信**：卡页写的是 arXiv:2004.07208，但该号在 arXiv 上是《Why integral equations should be used instead of differential equations to describe the dynamics of epidemics》，与本卡主题无关。
> > > > > ⚠️ 卡页 ② 段点名的论文是《SkillNet: A Dynamic Skill Discovery and Composition Framework for MultiAgent Systems》，与这个号指的不是同一篇。
> > > > >
> > > > > 按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。
