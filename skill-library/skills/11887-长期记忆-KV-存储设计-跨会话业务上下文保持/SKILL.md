---
name: "p2s-agent-memory-kv-store"
title: "Agent 长期记忆 KV 存储设计 — 跨会话业务上下文保持"
description: "触发词：长期记忆、KV 存储、跨会话上下文、TTL、记忆淘汰。何时不用：要管理知识库事实的时效与冲突走知识溯源侧技能；单次会话内的上下文压缩不属于本技能。安全边界：记忆中不得存储用户个人信息（PII），仅存业务实体数据，过期记忆须按 TTL 清理。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-Agent-Memory-KV-Store"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "让 Agent 记住上次的决策背景和历史风险事件，不用每次重新交代一遍。"
user_try: "试试：给补货 Agent 加长期记忆，让它自动带上这个 SKU 近 30 天的决策历史。"
whenToUse: "Agent 需要跨会话保留业务实体上下文（SKU、供应商等）时用；要管理的是知识库事实的时效与生命周期，请转知识溯源侧技能。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 长期记忆 KV 存储设计 — 跨会话业务上下文保持

## ① 解决的问题

Agent工程师面临"跨会话业务上下文丢失导致用户每次交互都要重新描述背景"——Agent长期记忆存储将用户背景重述次数从每次降至0次，年化提升Agent使用效率节省用户时间成本10-20万元

## ② 核心算法逻辑

LLM Agent 的上下文窗口是短暂的，每次会话结束后状态丢失。长期记忆 KV Store 通过将业务上下文持久化到外部存储，使 Agent 具备跨会话记忆能力。

## ③ 业务应用场景

场景1：补货决策 Agent 跨会话记忆 - 业务问题：每次打开补货 Agent，都需要重新告知"这个 SKU 上次是因为大促备货了 3 个月库存"，无法积累决策上下文 - 数据要求：SKU 维度的历史决策记录（时间、决策类型、触发原因） - 预期产出：Agent 自动加载近 30 天该 SKU 的决策历史，补货建议更贴合实际业务逻辑 - 业务价值：减少人工重复说明时间，决策质量提升，年化节省运营时间约 200 小时
场景2：供应商风险 Agent 积累经验 - 业务问题：供应商 Agent 每次分析都是"全新视角"，无法记住"A 供应商去年双十一延误 15 天"等关键历史 - 数据要求：供应商 ID 维度的事件记录（延误、质量问题、涨价历史） - 预期产出：Agent 自动引用历史风险事件，风险评估准确率提升 25% - 业务价值：提前识别高风险供应商，避免因历史信息缺失导致的决策失误
**三轨验证**： - 成本：Redis 存储成本极低（GB 级 <$10/月）；SQLite 本地存储零成本 - 合规：记忆中不存储用户个人信息（PII），仅存储业务实体数据 - 风险：过期记忆可能导致决策偏差，需设置合理 TTL 和记忆置信度衰减

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：减少运营人员重复上下文说明，每 SKU 每月节省 2-5 小时沟通时间；Agent 决策质量提升 20-30%
实施难度：⭐⭐⭐☆☆（KV 存储简单，关键在 Key 设计和上下文注入策略）
优先级：⭐⭐⭐⭐☆（所有 Agent 产品化的必需能力，高优）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Agent 长期记忆 KV Store（SQLite 实现，可替换为 Redis）
依赖：sqlite3（标准库）, json（标准库）
"""
import sqlite3
import json
import time
import hashlib
from typing import Any, Optional
from dataclasses import dataclass


@dataclass
class MemoryEntry:
    key: str
    value: Any
    updated_at: float
    ttl: Optional[float]  # None 表示永不过期
    source: str
    importance: float = 1.0  # 重要性权重，用于记忆淘汰


class AgentMemoryKVStore:
    def __init__(self, db_path: str = ":memory:", namespace: str = "agent"):
        self.namespace = namespace
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS agent_memory (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at REAL NOT NULL,
                ttl REAL,
                source TEXT,
                importance REAL DEFAULT 1.0
            )
        """)
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_updated_at ON agent_memory(updated_at)")
        self.conn.commit()

    def _make_key(self, entity_type: str, entity_id: str, attribute: str) -> str:
        return f"{self.namespace}:{entity_type}:{entity_id}:{attribute}"

    def put(
        self,
        entity_type: str,
        entity_id: str,
        attribute: str,
        value: Any,
        ttl: Optional[float] = None,
        source: str = "unknown",
        importance: float = 1.0
    ) -> str:
        key = self._make_key(entity_type, entity_id, attribute)
        entry = {
            "key": key,
            "value": json.dumps(value, ensure_ascii=False),
            "updated_at": time.time(),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：按业务实体维度组织的记忆条目（如 SKU 的决策记录、供应商的延误与质量事件），含时间戳与重要度

**输出**：可按 Key 调取的记忆片段（含 TTL 与重要度衰减策略），供 Agent 跨会话注入上下文

## 执行步骤

1. 按业务实体设计记忆 Key 与条目结构。
2. 把决策记录与历史事件写入 KV 存储，并打上时间与重要度。
3. 设置 TTL 与重要度衰减，控制过期记忆污染决策。
4. 在会话开始时按实体 Key 注入近期记忆，替代人工重复交代。

## 边界与不做

- 何时不用：要管理的是知识库事实的时效与冲突，请转知识溯源侧的时效管理技能。
- 能力边界：记忆只提供历史上下文，不保证历史结论仍适用于当前场景。
- 安全边界：记忆中不得存储用户个人信息（PII），仅存业务实体数据；过期记忆须按 TTL 清理。

## 技能关联

- **可组合**：Skill-Agent-Memory-KV-Store

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agent-Memory-KV-Store`