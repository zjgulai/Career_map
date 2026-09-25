---
name: "p2s-progent-privilege-control"
title: "Progent — 最小权限 Agent 框架：SMT 验证 + 单调约束性"
description: "触发词：最小权限Agent、策略即代码、SMT验证、扩权审批、单调约束、审计链。何时不用：需要隐藏明文密钥时用「Agent 秘密中介」；需要在工具调用层按命令语义拦危险动作时用「运行时安全拦截」；需要隔离执行环境并支持回滚时用「Agent 沙箱」。安全边界：扩权请求不得由 Agent 自行批准，必须走人工审批并写入完整审计链；策略只允许单调收紧，禁止静默放宽；符号验证层不得被 LLM 层输出绕过。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-134"
l3_business: "访问控制"
l3_all: "访问控制 / 授权审查"
l1_l2_l3: "独立控制/数据与AI运行/访问控制"
p2s_card_id: "Skill-Progent-Privilege-Control"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "给每个 Agent 发一张写死工具名与金额上限的权限卡，想临时提额必须走人工审批并全程留痕。"
user_try: "试试：给采购 Agent 配最小权限策略，下单金额超过 1000 美元时必须走人工审批才能提额。"
whenToUse: "当 Agent 的工具调用集合在运行时会变化、需要动态感知并按最小权限原则约束时用本技能；若只是想让 Agent 拿不到明文密钥，用「Agent 秘密中介」；若只想在调用前判一次危险动作，用「运行时安全拦截」。"
workflow: "为 Agent 生成初始策略：允许工具清单与逐参数约束（如采购单金额上限） → 用单调约束守卫实时评估每次工具调用的参数 → Agent 提出扩权请求时用 SMT 校验是否构成策略扩张 → 判定为扩张即触发人工审批与通知 → 审批通过后更新策略，并保留完整审计链"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Progent — 最小权限 Agent 框架：SMT 验证 + 单调约束性

## ① 解决的问题

采购 Agent 若获得全量 ERP 权限，一次提示注入攻击即可绕过审批直接下单——最小权限控制为每个 Agent 生成细粒度策略（仅允许创建限额内采购单），权限滥用风险降低 80%

## ② 核心算法逻辑

最小权限原则在 Agent 中的实现：传统应用最小权限通过 OS/IAM 静态配置实现，但 LLM Agent 的工具调用集合在运行时动态变化，需要动态感知策略。Progent 用符号规则表示权限策略：{tool: "purchase_order.create", constraints: {"amount": {"max": 1000}}}，支持在任务执行中实时评估。

## ③ 业务应用场景

场景一：WF-A 采购 Agent 权限管控
采购 Agent 初始化时自动生成策略： - `inventory.query`（无约束） - `purchase_order.create`（`amount ≤ 1000 USD`）
执行中，Agent 分析发现某 SKU 缺货严重，需下 5000 USD 大额 PO： 1. Agent 请求扩展策略：`purchase_order.create` 的 `amount ≤ 5000` 2. SMT 检测：5000 > 1000，属于策略扩张 → 触发人工审批 3. 采购经理在 Slack 收到通知，确认后 SMT 更新策略 4. 整个流程留有完整审计链

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

核心收益：广告预算误操作风险归零，大额 PO 强制人工确认，年化风险规避 30-80 万元
Prompt Injection 防护：符号验证层无法被 LLM 层的注入攻击绕过，零误操作保证
实施难度：⭐⭐⭐☆☆（需集成 SMT 求解器如 Z3，约 2-3 天）
优先级：⭐⭐⭐⭐⭐（P0 生产阻塞）
参考：arXiv:2504.11703 | Progent Framework

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（22 行）。**下面 22 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **22 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，22 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/progent_privilege_control` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Progent-Privilege-Control.md`），已与卡面节选核对，不依赖上述路径。

```python
# paper2skills-code/llm_agent_engineering/progent_privilege/model.py
# 完整实现见代码目录
from paper2skills_code.llm_agent_engineering.progent_privilege.model import (
    PrivilegePolicy, ArgumentConstraint, SMTChecker, ProgentFramework, MonotonicConfinementGuard
)

# WF-A 采购 Agent 初始策略
policy = PrivilegePolicy(
    allowed_tools=["inventory.query", "purchase_order.create"],
    argument_constraints={"purchase_order.create": ArgumentConstraint(max_amount=1000.0)},
)
guard = MonotonicConfinementGuard(initial_policy=policy)
framework = ProgentFramework(guard)

# 尝试扩权（下大额 PO）
result = framework.request_policy_update(
    new_tools=["inventory.query", "purchase_order.create"],
    new_constraints={"purchase_order.create": ArgumentConstraint(max_amount=5000.0)},
    reason="大额补货需要",
)
print(result.action, result.requires_approval)  # PENDING True
print("[✓] Progent Privilege Control 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2504.11703 — Progent: Securing AI Agents with Privilege Control

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Agent 的工具清单、每个工具的参数字段与约束（如金额上下限）、运行时提出的策略变更请求（新工具、新约束及理由）；粒度为单次工具调用参数。

**输出**：策略评估结果与动作判决（放行 / 待审批 / 拒绝）、需人工审批的通知，以及从初始策略到当前策略的完整审计链；供 Agent 编排层与审批人使用。

## 执行步骤

1. 初始化 Agent 权限策略，声明允许工具与参数约束（如采购单金额不超过 1000 美元）
2. 由单调约束守卫在执行中实时校验参数是否越界
3. 用 SMT 求解器判定 Agent 的扩权请求是否构成策略扩张（如 5000 大于 1000）
4. 对扩张请求触发人工审批并推送到协作工具通知审批人
5. 更新通过审批的策略并写入审计链留痕

## 边界与不做

- 数据不满足：无法枚举 Agent 的工具集与参数字段时写不出约束，先做工具盘点再上策略。
- 何时不用：密钥暴露问题用「Agent 秘密中介」，命令语义拦截用「运行时安全拦截」，执行隔离与回滚用「Agent 沙箱」。
- 能力边界：产出的是策略与验证规则，不承担执行隔离、回滚或工具调用本身；SMT 只验证参数与策略的一致性，不判断业务合理性。
- 安全边界：扩权一律人工审批，禁止 Agent 自行批准；策略不得被静默放宽，验证层不得因模型输出而跳过。

## 技能关联

- **前置**：Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Sandlock-Agent-Execution-Sandbox.html、Skill-Sandlock-Agent-Execution-Sandbox
- **延伸**：Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Progent-Privilege-Control

---

> 分类：独立控制/数据与AI运行/访问控制　·　技术族：16-智能体工程　·　源卡：`Skill-Progent-Privilege-Control`