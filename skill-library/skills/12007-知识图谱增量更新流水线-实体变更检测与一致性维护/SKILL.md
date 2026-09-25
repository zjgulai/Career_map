---
name: "p2s-kg-incremental-update-pipeline"
title: "知识图谱增量更新流水线 — 实体变更检测与一致性维护"
description: "触发词：图谱增量流水线、实体变更检测、刷新延迟、回滚机制、法规联动更新。何时不用：只处理单个图谱的时序事实与衰减时用知识图谱增量更新技能；需要本体 Schema 版本迁移时用本体版本管理技能。安全边界：图谱变更须留完整审计日志并具备回滚机制，防止脏数据扩散到下游决策。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-KG-Incremental-Update-Pipeline"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "用实体指纹只跑变了的数据，把图谱刷新从几小时压到十几分钟，法规模块更新还能自动带出受影响产品。"
user_try: "试试：把竞品价格图谱的全量重建改成增量流水线，并加上变更审计和回滚机制。"
whenToUse: "图谱每日全量重建耗时过长、下游等不起时用本技能；只处理单个图谱内时序事实的更新与衰减，用知识图谱增量更新技能。"
workflow: "按实体指纹检测新增、修改与删除 → 生成图谱变更集并只应用差异 → 联动重算受影响实体的下游状态 → 写入完整审计日志 → 异常时按变更集回滚"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 知识图谱增量更新流水线 — 实体变更检测与一致性维护

## ① 解决的问题

竞品价格知识图谱每日全量重建耗时4小时令定价师等不到数据——引入实体变更检测增量更新流水线，图谱刷新延迟从4小时→15分钟（延迟降低 80%），定价决策时效性显著改善。

## ② 核心算法逻辑

知识图谱的生产化难题不在构建，而在持续增量更新。核心挑战三点：

## ③ 业务应用场景

场景1：竞品价格知识图谱实时增量更新 - 业务问题：竞品价格图谱每日全量重建耗时 4 小时，定价师等不到数据 - 数据要求：Amazon 竞品爬虫输出（ASIN/价格/排名），每小时增量数据约 2 万条 - 预期产出：增量更新延迟从 4 小时降至 10 分钟，竞品价格图谱实时可查 - 业务价值：动态定价响应速度提升 24 倍，年化收入增加约 30 万元
场景2：合规法规知识图谱维护 - 业务问题：FDA/CPSC 法规更新时，手动核查哪些产品受影响需 2 天 - 数据要求：法规变更 RSS/API（条款 ID + 生效日期 + 影响产品类目） - 预期产出：法规节点更新后，自动触发受影响产品实体的合规状态重新计算 - 业务价值：合规风险响应时间从 2 天降至 2 小时，避免下架损失 50+ 万元/年
**三轨验证**：成本（增量更新 CPU 成本降低 80%）/ 合规（图谱变更有完整审计日志）/ 风险（回滚机制防止脏数据扩散）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：全量重建 4 小时 → 增量更新 10 分钟，CPU 成本降低 80%；合规响应从 2 天 → 2 小时，年化避免下架损失 50+ 万元
实施难度：⭐⭐⭐⭐☆（需 CDC 基础设施 + 约束规则设计）
优先级：⭐⭐⭐⭐☆（图谱生产化的必要组件）
适用规模：图谱节点 >10 万、日更新量 >5 万条的中大型知识图谱

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（210 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
KG Incremental Update Pipeline: 知识图谱增量更新与一致性维护
模拟母婴出海竞品价格图谱的增量更新流程
"""
import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from enum import Enum


class ChangeType(Enum):
    ADDED = "added"
    MODIFIED = "modified"
    DELETED = "deleted"
    UNCHANGED = "unchanged"


@dataclass
class Entity:
    """知识图谱实体节点"""
    entity_id: str
    entity_type: str       # brand / product / competitor / regulation
    attributes: dict[str, Any]
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    confidence: float = 1.0

    def fingerprint(self) -> str:
        """实体指纹：用于快速变更检测"""
        key_attrs = {k: v for k, v in sorted(self.attributes.items())}
        content = json.dumps(key_attrs, sort_keys=True, ensure_ascii=False)
        return hashlib.md5(content.encode()).hexdigest()


@dataclass
class GraphDelta:
    """图谱变更集"""
    change_type: ChangeType
    entity: Entity
    old_fingerprint: str | None = None
    new_fingerprint: str | None = None
    affected_relations: list[str] = field(default_factory=list)


class KnowledgeGraphStore:
    """内存模拟的知识图谱存储（生产环境替换为 Neo4j/ArangoDB）"""
    def __init__(self):
        self._entities: dict[str, Entity] = {}
        self._fingerprints: dict[str, str] = {}
        self._relations: list[tuple[str, str, str]] = []  # (src, rel_type, dst)
        self._audit_log: list[dict] = []

    def upsert(self, entity: Entity) -> ChangeType:
        old_fp = self._fingerprints.get(entity.entity_id)
        new_fp = entity.fingerprint()
        if entity.entity_id not in self._entities:
            change = ChangeType.ADDED
        elif old_fp != new_fp:
            change = ChangeType.MODIFIED
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每小时级增量数据（如竞品爬虫输出的 ASIN 与价格排名，约 2 万条/小时；或法规变更接口的条款 id、生效日期、影响类目）与现有图谱存储，粒度到单条实体变更。

**输出**：只应用差异的图谱更新结果与变更集、受影响实体的重算状态（如合规状态），以及审计日志与回滚依据，供定价师与合规团队使用。

## 执行步骤

1. 用实体指纹检测新增、修改与删除
2. 生成图谱变更集并只应用差异部分
3. 对法规等外部变更联动重算受影响实体
4. 写入完整审计日志
5. 发现脏数据时按变更集回滚

## 边界与不做

- 实体缺少稳定标识或指纹字段时无法做变更检测；图谱规模很小、全量重建可接受的场景不必引入。
- 本技能负责增量刷新与回滚机制，不负责上游数据是否准确，也不做定价与合规结论的最终判断。

## 技能关联

- **可组合**：Skill-KG-Incremental-Update-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-KG-Incremental-Update-Pipeline`