---
name: "p2s-agemem-unified-agent-memory"
title: "AgeMem — LTM+STM 统一 Agent 记忆：RL 自适应管理跨会话知识"
description: "触发词：LTM与STM统一、记忆即动作、跨会话知识、TTL过期管理、报表洞察压缩。何时不用：单次会话即可完成、无需跨会话积累时不适用；只做结构化记忆节点与图谱走A-MEM记忆系统。安全边界：记忆条目须支持过期清理避免陈旧结论长期生效，写入内容涉及客户数据时须脱敏。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-AgeMem-Unified-Agent-Memory"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把长期记忆和当周短期记忆交给同一个策略调度，让投放 Agent 不再每次从零开始。"
user_try: "试试：广告 Agent 每次启动都忘了上周哪些关键词 ROAS 高，帮我建立长期加短期记忆并给当周出价建议。"
whenToUse: "当需要跨会话积累关键词效果知识、同时压缩当周报表趋势时用本卡；只需要结构化决策记忆图谱用 A-MEM 记忆系统；只需要压缩上下文长度用主动上下文剪枝。"
workflow: "沉淀长期记忆条目（如关键词平均 ROAS 与旺季） → 按 TTL 自动清理过期条目并更新变更项 → 把当周报表压缩为短期记忆摘要 → 在报表 review 与大促节点触发记忆读写 → 融合长期历史与当周趋势生成建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AgeMem — LTM+STM 统一 Agent 记忆：RL 自适应管理跨会话知识

## ① 解决的问题

业务问题：广告 Agent 每次启动都是"空白大脑"，无法记住上周/上月哪些关键词 ROAS 高、竞品在哪些词上加价、大促节点的效果规律

## ② 核心算法逻辑

AgeMem 是首个将 LTM（长期记忆）和 STM（短期记忆）统一到 Agent Policy 的端到端框架。传统方案把两种记忆当作独立模块，由外置 Memory Manager 或启发式 trigger 决策，导致组合效果差、部署成本高（需要额外 expert LLM）。AgeMem 的突破在于：记忆操作本身就是 action，由同一个 LLM policy 通过 RL 学习"何时调什么"。

## ③ 业务应用场景

业务问题：广告 Agent 每次启动都是"空白大脑"，无法记住上周/上月哪些关键词 ROAS 高、竞品在哪些词上加价、大促节点的效果规律。一个有经验的广告优化师积累这些知识需要 3 个月，Agent 每次从零开始。
数据要求： - LTM：历史关键词 ROAS 表（`keyword → {avg_roas, peak_season, last_updated}`） - STM：当周广告报表（7 天窗口数据，含竞品曝光份额变化） - 触发事件：每次广告报表 review + 每次大促前后
预期产出： - 关键词效果 LTM 条目（自动 Add/Update/Delete 过期词） - 当周 STM 摘要（压缩 7 天数据为 3-5 条核心洞察） - 出价建议（基于 LTM 历史 + STM 当周趋势融合推理）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（257 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/agemem_unified_agent_memory` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-AgeMem-Unified-Agent-Memory.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AgeMem — LTM+STM 统一 Agent 记忆 RL 管理
论文: arXiv:2601.01885 | 2026年1月
场景: 广告 Agent 跨会话关键词效果积累 + 选品 Agent 品类知识持久化
"""
from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class MemoryType(str, Enum):
    LTM = "LTM"
    STM = "STM"


@dataclass
class MemoryItem:
    item_id: str
    content: str
    memory_type: MemoryType
    importance: float = 0.5
    timestamp: float = field(default_factory=time.time)
    tags: list[str] = field(default_factory=list)
    ttl_seconds: float | None = None

    def is_expired(self) -> bool:
        if self.ttl_seconds is None:
            return False
        return (time.time() - self.timestamp) > self.ttl_seconds


class LTMStore:
    def __init__(self):
        self._store: dict[str, MemoryItem] = {}

    def add(self, item: MemoryItem) -> str:
        self._store[item.item_id] = item
        return item.item_id

    def update(self, item_id: str, content: str, importance: float | None = None) -> bool:
        if item_id not in self._store:
            return False
        self._store[item_id].content = content
        self._store[item_id].timestamp = time.time()
        if importance is not None:
            self._store[item_id].importance = importance
        return True

    def delete(self, item_id: str) -> bool:
        return bool(self._store.pop(item_id, None))

    def search(self, query: str, top_k: int = 5) -> list[MemoryItem]:
        results = [
            item for item in self._store.values()
            if any(tag in query.lower() for tag in item.tags)
               or query.lower() in item.content.lower()
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.01885 — Agentic Memory: Learning Unified Long-Term and Short-Term Memory Management for Large Language Model Agents
⚠️ 该号被 3 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：长期记忆数据（如关键词到平均 ROAS、旺季与更新时间的映射表）、短期记忆数据（7 天窗口的当周广告报表，含竞品曝光份额变化），以及触发事件（每次广告报表 review 与大促前后）。

**输出**：长期记忆条目（自动新增、更新与删除过期词）、当周短期记忆摘要（7 天数据压缩为 3-5 条核心洞察），以及融合长期与短期记忆的出价建议，供广告 Agent 或投手使用。

## 执行步骤

1. 沉淀跨会话的长期记忆条目（如各关键词平均 ROAS 与旺季规律）
2. 按有效期自动清理过期条目并更新发生变化的条目
3. 把当周报表压缩为 3-5 条短期记忆摘要
4. 在报表回看与大促节点触发记忆的读写动作
5. 融合长期历史与当周趋势生成出价建议

## 边界与不做

- 何时不用：单次会话即可完成、无需跨会话知识积累时不适用；只需要压缩当轮上下文时用主动上下文剪枝。
- 能力边界：记忆操作由同一策略通过强化学习调度，落地需训练与评测资源，未训练时只能退化为启发式触发。
- 合规边界：记忆条目须支持过期清理，避免陈旧结论长期生效；涉及客户数据的写入须脱敏。

## 技能关联

- **前置**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Context-Compression.html、Skill-Context-Compression、Skill-KLong-Long-Horizon-Agent-Training.html、Skill-KLong-Long-Horizon-Agent-Training、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Memory-as-Action.html、Skill-Memory-as-Action、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-KLong-Long-Horizon-Agent-Training.html、Skill-KLong-Long-Horizon-Agent-Training、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent
- **可组合**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-KLong-Long-Horizon-Agent-Training.html、Skill-KLong-Long-Horizon-Agent-Training、Skill-AgeMem-Unified-Agent-Memory

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-AgeMem-Unified-Agent-Memory`