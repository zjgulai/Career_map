---
name: "p2s-maseval-system-evaluation"
title: "MASEval — 系统级 MAS 评估：Framework 影响与模型影响同等重要"
description: "触发词：MAS系统评估、framework选型、全因子实验、效应量、协调逻辑对比。何时不用：没有统一任务集与评分标准时不适用；只评单个Agent版本能力走Agent能力评估基准。安全边界：评估用任务数据须脱敏，结论只覆盖被比较的framework与模型组合，不外推到未测配置。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-148"
l3_business: "Playbook评估"
l3_all: "Playbook评估"
l1_l2_l3: "数据与Agent平台/数据与AI运行/Playbook评估"
p2s_card_id: "Skill-MASEval-System-Evaluation"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把模型、框架和协调逻辑当作一个整体系统来对比，用全因子实验选出最适合业务的组合。"
user_try: "试试：补货 MAS 要在 LangGraph、CrewAI、AutoGen 之间选型，帮我跑系统级对比并给出推荐 framework。"
whenToUse: "当处于框架选型阶段、需要知道 framework 与协调逻辑对性能的实际影响时用本卡；只评测单个 Agent 版本的任务完成率与工具准确率用 Agent 能力评估基准。"
workflow: "定义标准评测任务集与统一评分标准 → 把候选 framework 实现为相同的 Agent 逻辑 → 组合 model、framework 与协调逻辑配置 → 运行对比实验采集准确率、延迟与 token 开销 → 输出最优与次优 framework 推荐"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MASEval — 系统级 MAS 评估：Framework 影响与模型影响同等重要

## ① 解决的问题

质检经理面临多Agent效果难量化——MASEval将人工抽检工时40小时降到12小时，年化省13万元

## ② 核心算法逻辑

传统 MAS 评估聚焦模型级（ModelLevel）：固定 framework，换 LLM 比性能差异。MASEval 提出系统级（SystemLevel）评估范式，将完整 MAS 系统（模型 × Framework × 协调逻辑）作为原子评测单元，形成 3×3×3 全因子实验设计：3 个 LLM backbone × 3 个 Agent Framework（smolagents/LlamaIndex/AutoGen 等）× 3 种协调

## ③ 业务应用场景

业务问题：WF-A 补货决策 MAS 计划部署，技术选型阶段在 LangGraph / CrewAI / AutoGen 间抉择，不同 framework 带来的性能差异不明。
数据要求： - 标准补货决策任务集（20-50 条，含 SKU 历史销量、库存水位、lead time） - 3 种 framework 的相同 Agent 逻辑实现 - 统一评分标准（补货量偏差率 ≤ 5%、响应延迟 ≤ 2s）
预期产出： MASEval 跑完 3×1×3（3 framework × 固定模型 × 3 协调逻辑）全因子实验，输出 `ComparisonReport`： - 各 framework 准确率对比及 effect_size - framework overhead（额外 latency/token） - 最优 framework 推荐 + 次优备选

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

20-60 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（19 行）。**下面 19 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **19 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，19 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/mas/maseval_system_evaluation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-MASEval-System-Evaluation.md`），已与卡面节选核对，不依赖上述路径。

```python
# 快速调用示例
from mas.maseval_system_evaluation import MASEvalRunner, AgentSystemConfig, BenchmarkTask

tasks = [BenchmarkTask(task_id="t1", description="补货决策", 
                        input_data={"sku": "B001", "stock": 50},
                        expected_output={"reorder_qty": 200}, domain="supply_chain")]

configs = [
    AgentSystemConfig(model="gpt-4o-mini", framework="langgraph",  coordination_logic="sequential"),
    AgentSystemConfig(model="gpt-4o-mini", framework="crewai",     coordination_logic="sequential"),
    AgentSystemConfig(model="gpt-4o-mini", framework="autogen",    coordination_logic="sequential"),
]

runner = MASEvalRunner()
report = runner.compare_systems(configs, tasks)
print(f"最优 Framework: {report.best_system.framework}")
print(f"最大性能差距: {report.performance_gap:.1%}")
print(f"Framework 效应量: {report.framework_effect_size:.3f}")
print("[✓] MASEval System Evaluation 测试通过")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2603.08835 — MASEval: Extending Multi-Agent Evaluation from Models to Systems

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：标准业务任务集（如 20-50 条补货决策任务，含 SKU 历史销量、库存水位与 lead time）、各 framework 的相同 Agent 逻辑实现，以及统一评分标准（如补货量偏差率上限与响应延迟上限）。

**输出**：系统级对比报告，含各 framework 的准确率对比与效应量、framework 额外开销（延迟与 token）、最优 framework 推荐与次优备选，供技术选型决策。

## 执行步骤

1. 定义标准评测任务集（含输入数据、期望输出与评分标准）
2. 把待比较的 framework 与协调逻辑实现为统一的 Agent 逻辑
3. 按全因子设计组合模型、framework 与协调逻辑配置
4. 运行对比实验并采集准确率、延迟与 token 开销
5. 计算 framework 效应量并输出最优与次优推荐

## 边界与不做

- 何时不用：没有统一任务集与评分标准时不适用；只关心单个 Agent 版本是否退化时用更轻的能力评估技能。
- 能力边界：只做系统级离线对比，不替代上线后的线上监控；结论依赖任务集与评分标准的代表性。
- 结果边界：结论只覆盖被比较的 framework 与模型组合，未测配置不可外推。

## 技能关联

- **前置**：Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **延伸**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-Agent-Stage-Evaluation.html、Skill-Agent-Stage-Evaluation、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-MASEval-System-Evaluation

---

> 分类：数据与Agent平台/数据与AI运行/Playbook评估　·　技术族：10-MAS　·　源卡：`Skill-MASEval-System-Evaluation`