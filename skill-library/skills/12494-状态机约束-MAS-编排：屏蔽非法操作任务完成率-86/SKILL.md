---
name: "p2s-sdof-state-constrained-orchestration"
title: "SDOF — 状态机约束 MAS 编排：屏蔽非法操作，任务完成率 86.5%"
description: "触发词：状态机约束、非法操作拦截、审批节点、预算变更、审计日志。何时不用：只做并发调度与失败重试用「MAS Orchestrator」；运行时调整拓扑用「Dynamic DAG Orchestration」。安全边界：预算变更与大额采购必须经审批状态后才可执行，拦截事件须完整留审计日志，不得静默放行。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 授权审查"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-SDOF-State-Constrained-Orchestration"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "用状态机把 Agent 的合法操作框死，跳过审批的动作当场被拦下并记审计日志。"
user_try: "试试：给广告优化链路加状态机约束，让执行 Agent 在提议阶段就不能直接改预算。"
whenToUse: "当 MAS 存在越权风险（跳过审批直接改预算、自动下大额采购单）时用本技能；只要并发调度与失败恢复，用「MAS Orchestrator」；要运行时改拓扑，用「Dynamic DAG Orchestration」。"
workflow: "把 MAS 执行流程建模为有限状态机并定义合法迁移 → 在执行入口做双层防护校验 → 对非法动作立即拦截、记录审计日志并抛出非法迁移错误 → 把需审批动作切到审批状态后才允许执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SDOF — 状态机约束 MAS 编排：屏蔽非法操作，任务完成率 86.5%

## ① 解决的问题

供应链经理面临库存状态约束冲突——SDOF将违规补货率5%降到1%，年化省17万元

## ② 核心算法逻辑

SDOF 将 MultiAgent System（MAS）的执行流程建模为有限状态机（FSM），通过双层防护机制确保 Agent 行为的合法性。

## ③ 业务应用场景

问题：多 Agent 广告优化链路中，执行 Agent 可能直接触发预算变更，跳过品牌负责人审批，造成未授权的大额消耗。
效果：广告执行 Agent 若尝试在 PROPOSE 阶段直接调用 `execute_budget_change`，`StateAwareDispatcher` 立即拦截，记录审计日志，返回 `IllegalTransitionError`，预算变更风险归零。
问题：供应链补货 Agent 在需求预测后可能自动下大额采购订单（PO），缺少人工确认节点导致库存积压风险。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

12%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（2 行）。**下面 2 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **2 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，2 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/sdof_state_constrained_orchestration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-SDOF-State-Constrained-Orchestration.md`），已与卡面节选核对，不依赖上述路径。

```python
# 见 paper2skills-code/mas/sdof_state_orchestration/model.py
print("[✓] SDOF State Constrained Or 测试通过")
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2605.15204 — SDOF: Taming the Alignment Tax in Multi-Agent Orchestration with State-Constrained Dispatch

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各 Agent 的角色与当前状态、动作清单（如预算变更）、合法状态到动作的迁移表，以及需要人工审批的动作清单。

**输出**：合法性校验结果与非法迁移的拦截记录（含审计日志与非法迁移错误）；供编排层与合规审计使用。

## 执行步骤

1. 把 MAS 执行流程建模为有限状态机并定义合法迁移
2. 在执行入口用状态感知派发器做双层防护校验
3. 对非法动作立即拦截、记录审计日志并报非法迁移错误
4. 把需审批动作切到审批状态后才允许执行

## 边界与不做

- 数据不满足：动作清单与状态迁移表定义不全时拦截会有漏网，先补齐契约。
- 何时不用：只做并发调度与重试用「MAS Orchestrator」；运行时改拓扑用「Dynamic DAG Orchestration」；不需要审批约束的内部实验不必上状态机。
- 能力边界：产出合法性规则与拦截契约，不做执行器，也不替代审批本身。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery、Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **延伸**：Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration
- **可组合**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-SDOF-State-Constrained-Orchestration

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：10-MAS　·　源卡：`Skill-SDOF-State-Constrained-Orchestration`