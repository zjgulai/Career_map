---
name: "p2s-kg-incremental-update"
title: "知识图谱增量更新（KG Incremental Update）"
description: "触发词：知识图谱增量更新、时序三元组、时间衰减、冲突消解、事实有效期。何时不用：需要做本体版本升级与依赖通知时用本体版本管理技能；只做变更检测的流水线调度时用图谱增量更新流水线技能。安全边界：旧三元组不得硬删除，须按时间衰减保留有效期，图谱变更须留审计记录。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-KG-Incremental-Update"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "图谱只更新变了的那几条，并用时间权重让旧事实自动退场，不再每天全量重建。"
user_try: "试试：把价格三元组改成增量更新加时间衰减，验证一下最低价查询还会不会报过期价格。"
whenToUse: "图谱数据高频变化、全量重建太慢或旧数据会污染查询结果时用本技能；只需一次性重建图谱，用全量构建方式即可。"
workflow: "把事实存为带时间戳的时序三元组 → 按实体指纹检测变更，只更新变化部分 → 给旧三元组按时间衰减降权 → 消解同一关系的冲突取值 → 按当前时间点查询有效事实"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 知识图谱增量更新（KG Incremental Update）

## ① 解决的问题

业务背景：亚马逊 Prime Day 期间，价格每 10 分钟可能变化

## ② 核心算法逻辑

电商知识图谱的数据不是静态的——新品上架、价格调整、用户评论新增、竞品关系变化，每天都有大量三元组需要更新。若每次变更都触发全量 KG 重建，计算成本极高（百万节点 KG 重建需 48 小时）。增量更新（Incremental Update） 只处理变更的局部子图，将更新耗时压缩至秒级到分钟级。

## ③ 业务应用场景

业务背景：亚马逊 Prime Day 期间，价格每 10 分钟可能变化。KG 中的价格三元组若不实时更新，KGQA 给出的"最低价"查询结果会错误，客服机器人报价失准，导致客诉。
时间衰减应用：历史价格三元组不硬删除，设 $\lambda=0.3/\text{天}$，查询时权重衰减后自动退化。
量化 ROI： - KG 价格准确率从 83% 提升至 99.2%（+16pp） - 客服因报价问题的退款率下降 34%，节省 ¥28,000/月 - Prime Day 当天 KGQA 响应延迟 < 200ms（全量重建方案需离线等待）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

服务器成本：12 vs 0.8 CPU·h × ¥0.5/h = 节省 ¥5.6/天 → ¥2,044/年
价格准确率提升减少客诉退款：¥28,000/月 → ¥336,000/年
工程师等待时间节省：20 人时/周 × ¥150/h → ¥156,000/年
合计年化 ROI ≈ ¥494,000

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（514 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：invalid syntax）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/knowledge_graph/kg_incremental_update` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-KG-Incremental-Update.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
知识图谱增量更新系统（KG Incremental Update）
基于 arXiv:2405.12232, arXiv:2312.14557 等 2024/2025 年方法

功能：
1. 变更检测（Change Detection）
2. 影响传播分析（Impact Propagation）
3. 局部子图更新（Local Subgraph Update）
4. 一致性验证（Consistency Verification）

Author: paper2skills
Date: 2026-06-06
"""

import hashlib
import math
import time
from typing import (
    List, Dict, Tuple, Optional, Set, Iterator
)
from dataclasses import dataclass, field
from collections import defaultdict, deque
from enum import Enum


# ============================================================
# 数据模型
# ============================================================

class ChangeType(Enum):
    INSERT = "INSERT"
    DELETE = "DELETE"
    UPDATE = "UPDATE"


@dataclass
class TemporalTriple:
    """时序 KG 三元组：(h, r, t, τ)"""
    head: str
    relation: str
    tail: str
    timestamp: float                     # Unix 时间戳
    valid_start: float = 0.0
    valid_end: float = float('inf')      # inf = 无限期有效
    metadata: Dict[str, str] = field(default_factory=dict)

    def triple_id(self) -> str:
        key = f"{self.head}|{self.relation}|{self.tail}"
        return hashlib.md5(key.encode()).hexdigest()[:12]

    def is_valid_at(self, t: float) -> bool:
        return self.valid_start <= t < self.valid_end

    def temporal_weight(self, current_time: float, decay_lambda: float = 0.1) -> float:
        """时间衰减权重 w(τ) = exp(-λ(T - τ))"""
        age_days = (current_time - self.timestamp) / 86400.0
        return math.exp(-decay_lambda * age_days)


@dataclass
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.14557，但该号在 arXiv 上是《Aurora:Activating Chinese chat capability for Mixtral-8x7B sparse Mixture-of-Experts through Instruction-Tuning》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：图谱实体与关系的增量数据（头实体、关系、尾实体、时间戳、有效期）与变更来源，粒度到单条三元组。

**输出**：增量更新后的时序图谱（含有效期与时间衰减权重）、变更记录与按时间点的有效事实查询结果，供图谱问答与定价、客服等下游使用。

## 执行步骤

1. 把事实改存为带时间戳与有效期的时序三元组
2. 按实体指纹比对，只更新发生变化的部分
3. 对历史三元组套用时间衰减权重
4. 对同一关系的时间冲突取值做消解
5. 按查询时间点返回有效事实

## 边界与不做

- 事实缺少时间戳、无法判断新旧的场景不适用；数据量很小、全量重建成本可忽略时无需增量方案。
- 本技能产出时序图谱更新与查询结果，不保证上游事实本身真实，也不做知识抽取与建模。

## 技能关联

- **前置**：Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **延伸**：Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Realtime-Feature-Collection.html、Skill-Realtime-Feature-Collection、Skill-KG-Incremental-Update

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：08-知识图谱　·　源卡：`Skill-KG-Incremental-Update`