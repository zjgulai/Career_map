---
name: "p2s-sc-ontology-schema-versioning"
title: "供应链本体Schema版本化与迁移 — 向后兼容的本体演化策略防止Agent系统崩溃"
description: "触发词：本体版本管理、Schema迁移、向后兼容、双写过渡、依赖Agent通知。何时不用：只是检测上游字段变更并加兼容层时用数据契约技能；只做知识图谱实体增删改时用知识图谱增量更新技能。安全边界：破坏性变更必须走双写过渡与依赖方确认，不得直接切换版本，变更前须保留旧版本快照以便回滚。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-SC-Ontology-Schema-Versioning"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "本体要改字段时先版本化、再双写过渡，让依赖它的 Agent 不用停机就能跟上。"
user_try: "试试：Product 本体要新增两个合规属性，给我版本化变更记录、迁移脚本和依赖 Agent 的兼容性验证报告。"
whenToUse: "本体或主数据对象要发生字段变更且下游有多个 Agent 依赖时用本技能；只是上游数据源字段漂移、需要挡住变更时用数据契约技能。"
workflow: "登记 Schema 变更条目并判定是否 breaking → 给新版本打语义化版本快照 → 对破坏性变更启用双写过渡 → 生成迁移脚本并补齐历史数据 → 输出依赖 Agent 的兼容性验证报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链本体Schema版本化与迁移 — 向后兼容的本体演化策略防止Agent系统崩溃

## ① 解决的问题

本体Schema升级导致依赖Agent崩溃停机4-8小时——向后兼容双写过渡策略实现零停机Schema迁移，年化防止Agent崩溃事故损失20-80万元

## ② 核心算法逻辑

问题本质：当供应链本体（Ontology Schema）需要演化时（新增 SKU 属性、调整关系类型、修改约束条件），如何保证已部署的 Agent 和 Action 不中断？这是 Palantir 企业级部署中最容易忽视但最关键的工程能力。

## ③ 业务应用场景

场景A：新增 SKU 合规属性（CA65/CPSIA认证）
品牌扩展北美市场，需要在 Product Object 上新增 `ca65_compliant` 和 `cpsia_cert_number` 两个属性。这是安全变更（新增可选属性），但需要：通知所有依赖 Product Schema 的 Agent、更新 OKB 图谱、补充历史数据。
数据要求：现有 Product 节点列表、Agent 依赖清单、历史合规证书数据 预期产出：版本化的 Schema 变更记录 + 自动化迁移脚本 + Agent 兼容性验证报告 业务价值：新属性上线零停机，8 个依赖 Agent 全部平滑过渡，迁移时间从 2 周手工协调 → 1 天自动化

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Schema 迁移零停机（vs 传统停机 4-8 小时），Agent 升级不中断业务；Palantir 企业客户数据：Schema 变更事故导致的 Agent 崩溃年均成本约 20-80 万元人民币
实施难度：⭐⭐⭐☆☆（主要是工程纪律和流程规范，代码复杂度不高）
优先级：⭐⭐⭐⭐☆（随着 Agent 数量增长，Schema 管理变为关键路径）
企业AI知识库依赖：高 — 版本化的 Schema 历史即是企业知识库的元数据资产

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（308 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/sc_ontology_schema_versioning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SC-Ontology-Schema-Versioning.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
import re
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime

class ChangeType(Enum):
    ADD_OPTIONAL_PROPERTY = "add_optional_property"     # ✅ 安全
    ADD_OBJECT_TYPE = "add_object_type"                 # ✅ 安全
    ADD_LINK_TYPE = "add_link_type"                     # ✅ 安全
    EXTEND_ENUM = "extend_enum"                         # ✅ 安全
    REMOVE_PROPERTY = "remove_property"                 # ❌ 危险
    RENAME_PROPERTY = "rename_property"                 # ❌ 危险
    CHANGE_PROPERTY_TYPE = "change_property_type"       # ❌ 危险
    MAKE_PROPERTY_REQUIRED = "make_property_required"   # ❌ 危险
    REMOVE_OBJECT_TYPE = "remove_object_type"           # ❌ 危险

@dataclass
class SchemaChange:
    """单个 Schema 变更描述"""
    change_id: str
    change_type: ChangeType
    object_type: str
    property_name: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    is_breaking: bool = False
    migration_required: bool = False
    
    def __post_init__(self):
        breaking_types = {
            ChangeType.REMOVE_PROPERTY, ChangeType.RENAME_PROPERTY,
            ChangeType.CHANGE_PROPERTY_TYPE, ChangeType.MAKE_PROPERTY_REQUIRED,
            ChangeType.REMOVE_OBJECT_TYPE
        }
        self.is_breaking = self.change_type in breaking_types
        self.migration_required = self.is_breaking

@dataclass
class SchemaVersion:
    """Schema 版本快照"""
    version: str   # semver: "1.2.0"
    created_at: str = field(default_factory=lambda: datetime.now().isoformat()[:10])
    object_types: Dict[str, Dict] = field(default_factory=dict)
    link_types: Dict[str, Dict] = field(default_factory=dict)
    changelog: List[str] = field(default_factory=list)

class SCOntologyVersionManager:
    """
    供应链本体 Schema 版本管理器
    
    核心能力：
    1. 变更影响分析（哪些 Agent 受影响）
    2. 向后兼容性检查
    3. 双写过渡脚本生成
    4. 版本回滚支持
    """
    
    def __init__(self):
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待变更的对象定义与现有节点列表、依赖该 Schema 的 Agent 清单、历史数据（如合规证书）与变更诉求，粒度到对象属性与依赖方。

**输出**：版本化 Schema 变更记录（含是否破坏性、是否需迁移）、自动化迁移脚本与依赖 Agent 兼容性验证报告，供数据治理与平台团队执行升级。

## 执行步骤

1. 登记本次 Schema 变更并判定是否破坏性
2. 生成带语义化版本的 Schema 版本快照
3. 对破坏性变更启用双写，让新旧字段并存过渡
4. 生成迁移脚本并回填历史数据
5. 通知依赖 Agent 并输出兼容性验证报告

## 边界与不做

- 缺少依赖方清单或历史数据无法回填时，不能直接做破坏性变更；单个对象、无下游依赖的小改动无需引入版本管理。
- 本技能只产出变更记录、迁移脚本与兼容性判据，不执行生产环境的 Schema 切换与回滚。

## 技能关联

- **前置**：Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-Ontology-LLM-AutoBuild-SC.html、Skill-Ontology-LLM-AutoBuild-SC、Skill-SC-Agent-MCP-ERP-Integration.html、Skill-SC-Agent-MCP-ERP-Integration、Skill-Supply-Chain-Data-Lineage-Tracking.html、Skill-Supply-Chain-Data-Lineage-Tracking、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Decision-Audit-Trail-Ontology.html、Skill-Decision-Audit-Trail-Ontology、Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-Ontology-LLM-AutoBuild-SC.html、Skill-Ontology-LLM-AutoBuild-SC、Skill-SC-Agent-MCP-ERP-Integration.html、Skill-SC-Agent-MCP-ERP-Integration、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Graph-OKB-Design-SC.html、Skill-Graph-OKB-Design-SC、Skill-SC-Agent-MCP-ERP-Integration.html、Skill-SC-Agent-MCP-ERP-Integration、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-SC-Ontology-Schema-Versioning

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：24-标签工程　·　源卡：`Skill-SC-Ontology-Schema-Versioning`