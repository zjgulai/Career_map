---
name: "p2s-context-engine-architecture"
title: "Context Engine三层架构 — engine/agents/registry分离的可复用MAS骨架"
description: "触发词：Context Engine、三层架构、Agent编排拆分、注册表治理、MAS骨架。何时不用：一次性脚本或不需要长期扩展的 MAS 不必引入三层拆分；只是要把同一引擎换到新业务域复用时，用域无关 Context Engine。安全边界：上线前必须跑预生产检查（Agent 能否实例化、工具端点是否可达、Token 上限与上下文窗口是否充足），未通过不得接入生产。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Context-Engine-Architecture"
p2s_src_domain: "10-MAS"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "把编排、Agent 定义与工具注册拆成三层，改一个 Agent 不再牵动整个系统，单 Agent 可独立测试。"
user_try: "试试：帮我按 engine/agents/registry 三层重构这个 4-Agent 选品 Notebook，并生成上线前检查脚本。"
whenToUse: "属于「业务工具实现」：要落地一个可长期维护扩展的 MAS 骨架（调度层、Agent 层、注册层分离）时用；若目标是一套引擎跨多个业务域复用，用「域无关 Context Engine」；若只要单个 Agent 的推理-行动范式，用 ReAct。"
workflow: "拆分三层：engine 接请求做调度、agents 只描述各自职责、registry 登记能力与端点 → 迁移现有逻辑：把紧耦合 Notebook 里的 Agent 逐个搬进 agents 并独立测试 → 登记能力：新增 Agent 只改 registry，不再重写编排代码 → 上线前跑硬化检查：实例化、端点可达、Token 上限、上下文窗口 → 把检查脚本接进发布流程，不通过即阻断上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Context Engine三层架构 — engine/agents/registry分离的可复用MAS骨架

## ① 解决的问题

紧耦合MAS中改一个Agent需要2天且担心影响其他Agent——engine/agents/registry三层分离使新增Agent从2天压缩至2小时，单Agent可独立测试无副作用

## ② 核心算法逻辑

核心洞察（Rothman三层分离）：大多数MAS实现把编排逻辑、Agent定义、工具注册混在一起，导致"改一个Agent需要修改整个系统"。Rothman的Context Engine提出严格的三层分离架构：

## ③ 业务应用场景

场景A：选品MAS系统重构为Context Engine三层架构
- 业务问题：原有4-Agent选品系统所有逻辑都写在一个Notebook里，每次想改Research Agent的检索策略都要担心影响其他Agent；新增Finance Agent时需要重写大量编排代码 - 重构方案： - engine.py：接收"选品分析请求"→调用registry查找对应Agent→顺序执行→汇总输出 - agents.py：4个Agent类（ResearchAgent/CompetitorAgent/FinanceAgent/ReportAgent），各自只知道自己的职责 - registry.py：注册4个Agent的能力描述，新增Agent只需在registry中
- 业务问题：某次上线前Registry中的工具端点URL写错，导致整个MAS在生产环境崩溃 - 硬化方案：预生产检查脚本自动验证：①所有注册Agent实例化是否成功 ②所有工具端点ping是否可达 ③Token上限设置是否合理 ④内存/上下文窗口是否充足 - 预期产出：生产环境故障率从每月2-3次降至接近0次

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：将紧耦合Notebook式MAS重构为三层架构，新增Agent时间从2天→2小时（节省$500/次），每年约10次变更节省$4500；单Agent测试时间从"全系统测试"→"独立测试"，减少80%回归测试开销；系统成本$8万，年ROI≈200%
实施难度：⭐⭐⭐☆☆（三层分离本身不复杂；难点在于将现有紧耦合系统重构迁移，需要耐心的渐进式重构）
优先级：⭐⭐⭐⭐⭐（Rothman书中Ch4-5是整本书的核心工程章节，三层架构是Context Engine可复用性的基础——没有这个架构，所有其他能力都无法域无关复用）
适用规模：所有需要长期维护和扩展的MAS系统；一次性脚本不值得引入
数据依赖：无需外部数据；需要对现有MAS做模块化分析

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（421 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：现有 MAS 的编排代码、Agent 清单与工具端点信息，以及各 Agent 的输入输出约定；卡页第 4 段未给字段级规格，落地前需按实际系统补齐模块边界与依赖清单。

**输出**：三层分离的代码骨架（engine / agents / registry 三类模块）与预生产硬化检查脚本，检查项结果可直接进发布流水线，供工程与平台负责人使用。

## 执行步骤

1. 拆分三层：把编排调度、Agent 定义、工具注册分别落到 engine、agents、registry
2. 迁移现有逻辑：将紧耦合 Notebook 中的 Agent 逐个搬入 agents 模块并独立测试
3. 登记能力：在 registry 中写入各 Agent 的能力描述与工具端点，新增 Agent 只改注册表
4. 编写硬化检查：自动验证 Agent 能否实例化、工具端点是否可达、Token 上限与上下文窗口是否充足
5. 接入发布流程：把检查脚本挂到上线前，未通过即阻断发布

## 边界与不做

- 数据不满足时不用：没有可拆分的现有 MAS 代码，或系统本身是一次性脚本时，三层架构只会增加负担。
- 能力边界：本卡只给架构骨架与检查脚本，不含具体 Agent 的算法实现，也不做线上部署与运维。
- 上线前未通过预生产检查（实例化、端点可达、Token 上限、上下文窗口）不得进入生产；卡页记录过一次注册表端点 URL 写错导致整个 MAS 在生产崩溃。

## 技能关联

- **前置**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-SRL-Semantic-Blueprint-MAS.html、Skill-SRL-Semantic-Blueprint-MAS
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Domain-Agnostic-Context-Engine.html、Skill-Domain-Agnostic-Context-Engine、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-Context-Engine-Architecture

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：10-MAS　·　源卡：`Skill-Context-Engine-Architecture`