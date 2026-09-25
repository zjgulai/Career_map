---
name: "p2s-paramanager-parallel-orchestration"
title: "ParaManager — 小模型主编排：Agent-as-Tool 并行子任务分解"
description: "触发词：并行编排、Agent-as-Tool、小模型主编排、选品扫描、子任务并行。何时不用：子任务有强依赖、需要 DAG 排序与局部重算用「DAG 任务解耦规划」；按任务形态选拓扑用「任务自适应拓扑路由」。安全边界：并行子任务的结论冲突不得静默取其一，必须标记待人工裁决。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-ParaManager-Parallel-Orchestration"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用小模型当主编排，把选品、上架这类多维度任务并行拆出去跑，几分钟出结果。"
user_try: "试试：把选品的市场空间、毛利测算、合规评估、属性匹配、因果 Lift 预测五个维度并行跑，把 5 分钟压到 1 分钟。"
whenToUse: "当多个子任务相互独立、可并行执行且能统一接口调用时用本技能；子任务间有依赖、需要拓扑排序与局部重算，用「DAG 任务解耦规划」；要按任务形态自动选拓扑，用「任务自适应拓扑路由」。"
workflow: "把任务拆成相互独立的子任务 → 用 AgentAsTool 协议把各子任务统一为 invoke 接口 → 并行调度各子任务并收集状态与产出 → 按统一 Schema 汇总结果并输出"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ParaManager — 小模型主编排：Agent-as-Tool 并行子任务分解

## ① 解决的问题

运营专员面临多任务串行拖慢时效——ParaManager将处理时长4小时压到50分钟，年化省18万元

## ② 核心算法逻辑

AgentasTool 协议统一：ParaManager 将传统系统中异构的 Agent（具有内部状态、多轮推理能力）和 Tool（无状态函数调用）统一为标准化的 AgentAsTool 接口。每个动作单元暴露相同的 invoke(input) result 接口，同时携带显式状态反馈（status, progress, output），让编排器无需了解底层实现差异即可统一调度。

## ③ 业务应用场景

问题：选品分析需要市场空间、毛利测算、合规评估、KG 属性匹配、因果 Lift 预测 5 个维度，串行执行耗时约 5 分钟，严重影响选品决策效率。
效果：WF-D 选品扫描时间从 5 分钟降至 1 分钟，日处理选品数量从 12 → 60 个。
问题：新品上架流程包含合规检查、图片生成、关键词研究三条串行流水线，总耗时约 45 分钟，阻塞上架节奏。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（2 行）。**下面 2 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **2 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，2 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/paramanager_parallel_orchestration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-ParaManager-Parallel-Orchestration.md`），已与卡面节选核对，不依赖上述路径。

```python
# 见 paper2skills-code/mas/paramanager_parallel/model.py
print("[✓] ParaManager Parallel Orch 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.17009 — Small Model as Master Orchestrator: Learning Unified Agent-Tool Orchestration with Parallel Subtask Decomposition

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待分解任务的子任务清单（如市场空间、毛利测算、合规评估、属性匹配、Lift 预测）、各子任务输入规格与统一的 invoke 接口契约。

**输出**：并行执行后的子任务结果与汇总输出（如选品扫描结论）；供选品与上架流程直接消费。

## 执行步骤

1. 把任务拆成相互独立的子任务
2. 用 AgentAsTool 协议把各子任务统一为 invoke 接口
3. 并行调度各子任务并收集状态与产出
4. 按统一 Schema 汇总结果并输出

## 边界与不做

- 数据不满足：子任务接口无法统一为标准 invoke 时先做协议适配，否则无法并行调度。
- 何时不用：子任务有强依赖、需要 DAG 排序与局部重算用「DAG 任务解耦规划」；按任务形态选拓扑用「任务自适应拓扑路由」；串行本身很短的流程不必并行化。
- 能力边界：产出并行编排契约与汇总结果，不做执行器，也不解决子任务之间的结论冲突。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Subagent-Decomposition.html、Skill-Subagent-Decomposition、Skill-Ta[REDACTED].html、Skill-Ta[REDACTED]
- **延伸**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework、Skill-ParaManager-Parallel-Orchestration

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-ParaManager-Parallel-Orchestration`