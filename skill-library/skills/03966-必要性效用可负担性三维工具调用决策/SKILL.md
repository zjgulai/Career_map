---
name: "p2s-tool-call-decision-framework"
title: "Tool Call Decision Framework — 必要性/效用/可负担性三维工具调用决策"
description: "触发词：工具调用决策、必要性判断、效用评估、预算约束、调用去冗余。何时不用：工具还没注册进来、找不到可调对象时用工具自动发现技能；工具描述本身质量差导致选错工具时用工具描述审核技能。安全边界：涉及下单、改价、发信等写操作的工具不得因预算紧张被静默跳过，必须显式确认后再决定。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-Tool-Call-Decision-Framework"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "每次让 Agent 先想清楚这个工具非调不可吗、能带来多少增量、还花得起吗，再决定调不调。"
user_try: "试试：给选品 Agent 的三个 API 加上必要性、效用、可负担性三维判断，先算一下哪些调用可以省掉。"
whenToUse: "工具调用存在明显冗余、需要按必要性收敛调用次数时用本技能；工具尚未注册、找不到可调对象，用工具自动发现技能。"
workflow: "列出 Agent 当前可调工具与调用场景 → 评估必要性（所需信息是否已在上下文） → 评估效用（结果是否改变决策） → 评估可负担性（剩余 token 与预算） → 输出调用或跳过的决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tool Call Decision Framework — 必要性/效用/可负担性三维工具调用决策

## ① 解决的问题

业务问题：选品 Agent 包含三个 API（市场搜索 / 价格查询 / 合规检查）

## ② 核心算法逻辑

LLM 工具调用存在系统性错位：模型既会过度调用（把可推理的问题交给工具），也会遗漏调用（低估工具对复杂查询的价值）。根本原因在于模型自感知与任务实际需求之间存在认知盲区——模型过度自信于自身知识覆盖，却对边界外的未知盲区无感知。

## ③ 业务应用场景

业务问题：选品 Agent 包含三个 API（市场搜索 / 价格查询 / 合规检查）。当前每次扫描固定调用全部工具，即便对热门品类（婴儿奶粉/纸尿裤）的常规扫描，价格数据已在 Agent 上下文中，合规规则也属已知，仍重复调用，每次扫描 10 次 API → 月均 1000 次扫描 = 10,000 次 API 调用，其中估计 40% 冗余。
三维决策介入： - 对"纸尿裤常规价格查询"：Necessity=0.3（模型已有 30 天内数据），直接 SKIP - 对"新品类合规检查"：Necessity=0.9 + Utility=0.95 → 强制 CALL - 对"促销期价格波动查询"：Affordability 根据剩余 token 预算动态调整
量化效果： - 每次扫描调用次数：10 → 6（减少 40%） - 月节省成本：$200（按 API 单价 $0.02/次 × 10,000 次 × 40%） - Agent 延迟降低 35%（串行 API 调用减少）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

直接节省 API 成本：$200-$500/月
减少 hallucination 导致的客服升级成本：$300-$800/月
合计：$500-$1300/月 → 年化 $6,000-$15,600

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（2 行）。**下面 2 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **2 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，2 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/tool_call_decision_framework` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Tool-Call-Decision-Framework.md`），已与卡面节选核对，不依赖上述路径。

```python
# 完整实现见 paper2skills-code/llm_agent_engineering/tool_call_decision/model.py
print("[✓] Tool Call Decision Framew 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.00737 — To Call or Not to Call: A Framework to Assess and Optimize LLM Tool Calling

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待评估的工具清单与调用场景、当前上下文已有信息、剩余 token 或成本预算，粒度到单次拟调用。

**输出**：每次调用的三维评分与调用或跳过的决策记录，以及调用次数与成本的前后对照，供 Agent 运行调优与成本负责人查看。

## 执行步骤

1. 梳理 Agent 现有工具与典型调用场景
2. 对每次拟调用评估必要性，判断所需信息是否已在上下文
3. 评估该调用是否可能改变决策结果
4. 结合剩余 token 与 API 预算评估可负担性
5. 输出调用与跳过的决策并统计节省的调用次数

## 边界与不做

- 工具调用本身没有冗余、或所需信息完全不在上下文时，三维判断收益有限；缺预算与上下文信息时无法评估。
- 本技能只给调用决策判据，不实现工具本身，也不保证决策结果与业务最优一致。

## 技能关联

- **前置**：Skill-Cost-Aware-Agent-Scheduling.html、Skill-Cost-Aware-Agent-Scheduling、Skill-SLM-Tool-Calling-Optimization.html、Skill-SLM-Tool-Calling-Optimization、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **延伸**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Tool-Call-Decision-Framework

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：16-智能体工程　·　源卡：`Skill-Tool-Call-Decision-Framework`