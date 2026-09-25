---
name: "p2s-atomix-transactional-tool-calls"
title: "Atomix — Agent 工具调用事务性：故障注入成功率 0-7% → 37-57%"
description: "触发词：事务性工具调用、补偿回滚、副作用隔离、幂等、重复下单。何时不用：全流程都是只读查询、没有外部副作用时不需要事务包装；本技能面向会写外部系统的多步调用。安全边界：补偿函数必须幂等且可撤销；本技能承载回滚契约，不代替执行层的实际撤销动作。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-151"
l3_business: "失败恢复"
l3_all: "失败恢复 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/失败恢复"
p2s_card_id: "Skill-Atomix-Transactional-Tool-Calls"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "多步工具调用要么全成、要么全撤，中间失败也不会留下重复下单这类烂摊子。"
user_try: "试试：给这个补货三步流程加上事务语义，让步骤二失败时把已生成的 PO 撤掉。"
whenToUse: "多步调用里存在外部副作用、需要原子性时用本技能；只读链路失败后的重试与熔断用容错回退类技能。"
workflow: "把步骤标记为可缓冲或带外部副作用 → 为外部步骤注册补偿函数 → 以进度前沿推进判定提交或中止 → 失败时中止并回滚已执行的外部步骤"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Atomix — Agent 工具调用事务性：故障注入成功率 0-7% → 37-57%

## ① 解决的问题

业务问题：补货 Agent 三步工作流：① 需求预测（调用预测 API）→ ② 安全库存计算（调用库存 API）→ ③ PO 生成（调用 ERP 下单 API）

## ② 核心算法逻辑

Atomix 为 Agent 工具调用引入事务语义，解决多步 Agent 工作流在故障（网络抖动、服务超时、LLM 幻觉）下产生的中间态污染问题。无事务保护时，30% 故障注入场景的成功率仅 07%；Atomix TxFull 模式将其提升至 3757%，媲美快照回滚（CR）。

## ③ 业务应用场景

业务问题：补货 Agent 三步工作流：① 需求预测（调用预测 API）→ ② 安全库存计算（调用库存 API）→ ③ PO 生成（调用 ERP 下单 API）。若步骤②失败但步骤③已部分执行，会产生重复 PO 下单，损失 ¥1万-10万。
Atomix 保护： - 步骤①②标记为 BUFFERABLE（纯计算，不产生外部副作用） - 步骤③标记为 EXTERNALIZED，注册补偿函数 `cancel_po(po_id)` - progress predicate：三步均成功且 frontier 推进 → commit - 步骤②失败：abort → 步骤①②无副作用自动丢弃，步骤③若已创建 PO 则调用 `cancel_po` 回滚 - 重复下单风险归零，每次误操作损失风险消除
数据要求：ERP 系统支持 PO 撤销 API；补偿函数幂等（多次调用不产生额外效果）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（289 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/atomix_transactional_tool_calls` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Atomix-Transactional-Tool-Calls.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Atomix: 为 Agent 工具调用引入事务语义（epoch + frontier + 补偿）
参考: arXiv:2602.14849 — Atomix: Timely, Transactional Tool Use for Reliable Agentic Workflows
GitHub: https://github.com/mpi-dsg/atomix
"""
import uuid
from enum import Enum
from typing import Any, Callable, Optional
from dataclasses import dataclass, field

# ────────────────────────────────────────
# 1. ToolEffect 枚举
# ────────────────────────────────────────

class ToolEffect(Enum):
    BUFFERABLE = "bufferable"      # 纯内部效果，abort 时直接丢弃
    EXTERNALIZED = "externalized"  # 已产生外部副作用，abort 时需补偿

# ────────────────────────────────────────
# 2. Effect 数据类
# ────────────────────────────────────────

@dataclass
class Effect:
    tool_name: str
    effect_type: ToolEffect
    result: Any
    compensation_fn: Optional[Callable] = None
    epoch: int = 0

# ────────────────────────────────────────
# 3. Transaction
# ────────────────────────────────────────

@dataclass
class Transaction:
    tx_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    epoch: int = 0
    effects: list[Effect] = field(default_factory=list)
    status: str = "active"  # active | committed | aborted

# ────────────────────────────────────────
# 4. FrontierTracker
# ────────────────────────────────────────

class FrontierTracker:
    def __init__(self):
        self._frontiers: dict[str, int] = {}  # resource_id → max confirmed epoch

    def track(self, resource_id: str, epoch: int) -> None:
        current = self._frontiers.get(resource_id, -1)
        if epoch > current:
            self._frontiers[resource_id] = epoch

    def can_commit(self, tx: Transaction, required_resources: list[str]) -> bool:
        for res in required_resources:
            if self._frontiers.get(res, -1) < tx.epoch:
                return False
        return True
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.14849 — Atomix: Timely, Transactional Tool Use for Reliable Agentic Workflows

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：多步工具调用的步骤清单、每步是否产生外部副作用、外部系统的撤销能力（如 PO 撤销 API），补偿函数须幂等。

**输出**：步骤分类（可缓冲或外部化）、补偿函数契约、提交与中止判据，以及失败时的回滚结果，供 Agent 执行层落地。

## 执行步骤

1. 梳理步骤清单并标注外部副作用
2. 为每个外部步骤写幂等补偿函数
3. 定义进度前沿推进与提交条件
4. 失败时中止并执行补偿回滚
5. 记录事务结果供审计

## 边界与不做

- 全链路只读、没有外部副作用时不需要引入事务语义。
- 本技能产出事务契约与补偿函数设计，实际回滚由执行层调用外部接口完成。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 外部系统不支持撤销（没有 PO 撤销接口）时补偿不可行，只能靠前置校验阻断。

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Agent-Production-Engineering.html、Skill-Agent-Production-Engineering、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **延伸**：Skill-DAG-Ta[REDACTED].html、Skill-DAG-Ta[REDACTED]、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-Orchestration-Trace-RL.html、Skill-Orchestration-Trace-RL、Skill-Atomix-Transactional-Tool-Calls

---

> 分类：数据与Agent平台/数据与AI运行/失败恢复　·　技术族：16-智能体工程　·　源卡：`Skill-Atomix-Transactional-Tool-Calls`