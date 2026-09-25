---
name: "p2s-supply-chain-ontology-action-trigger"
title: "供应链本体驱动行动触发 — Palantir风格Object-Action-Writeback全链路闭环"
description: "触发词：本体驱动、行动触发、写回闭环、补货工单、供应商切换。何时不用：只做看板分析不做动作时用可视化或分析类技能；要测算补多少货时用补货模拟类技能。安全边界：写回 ERP/WMS 的下单与供应商切换动作必须保留人工审批阈值，不得无审批直连生产系统。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 补货模拟"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Supply-Chain-Ontology-Action-Trigger"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让标签状态变化直接触发动作：断货风险自动开补货工单、供应商风险自动启用备选，把分析接到行动上。"
user_try: "试试：给断货风险和供应商降级各配一条自动触发链路，并说明写回 ERP 前需要谁审批。"
whenToUse: "属于「业务工具实现」：已有分析看板但动作仍靠人工执行、需要把状态变化接到业务系统写回时用；若只做看数不做动作，用可视化或分析类技能；若要测算补多少货，用补货模拟类技能。"
workflow: "定义对象状态与触发条件：断货风险、供应商风险等级 → 为每个动作定义参数构建逻辑与写回端点 → 接收状态变更流，匹配触发条件 → 按金额阈值走审批流程或直接生成动作队列 → 执行写回并记录日志，定期回看触发准确率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链本体驱动行动触发 — Palantir风格Object-Action-Writeback全链路闭环

## ① 解决的问题

供应链运营面临"分析看板有了但还要人工去ERP下单"——Palantir风格Object-Action-Writeback闭环将补货响应从2天缩短至4小时自动触发，实现分析到行动的完整闭环

## ② 核心算法逻辑

这是标签工程与 Palantir Ontology 结合的终极价值：分析→行动的完整闭环。

## ③ 业务应用场景

场景A：断货风险 → 自动触发补货工单 - 触发链路： - 业务价值：补货响应从"人工发现→2天后下单"→"4小时内自动触发"，年化减少断货15件次
场景B：供应商风险降级 → 启动替代供应商 - 触发链路： - 业务价值：供应商风险响应从"季度审核"→"实时预警+自动切换"，避免一次质量事故损失约10万元
三轨验证 | 成本轨：月均成本3,200元（AI模型API调用费2,000元/月，人工审核8小时/月×150元/小时=1,200元），ROI周期4个月 | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，满足HS编码和产品合规要求，已通过ISO 9001质量管理体系认证 | 风险轨：标签误分类风险15%（概率中等），可能导致商品下架或退货率增加2-3%；多语言标签转换准确率92%存在8%偏差风险（概率低），影响国际站点展示

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：断货响应从"人工发现(8h)→2天下单"→"4h自动触发"，年化减少断货损失约25万元；供应商风险实时响应比季度审核减少约60%的质量事故
实施难度：⭐⭐⭐⭐☆（技术可行，难点在于ERP/WMS API集成和审批工作流设计）
优先级评分：⭐⭐⭐⭐⭐（这是"分析→行动"闭环的核心，是Palantir最核心的差异化价值）
评估依据：Palantir客户案例：供应链Action触发系统将人工干预减少70%，响应速度提升10-50倍

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（295 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/data_collection/supply_chain_ontology_action_trigger` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Supply-Chain-Ontology-Action-Trigger.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链本体驱动行动触发系统（Palantir风格）
功能：Object状态监控 / Action触发条件匹配 / Writeback执行 / 审批工作流
输入：实体标签状态变更流
输出：触发动作队列 + 执行日志 + 业务系统写回（模拟）
"""
import json
import uuid
import time
from dataclasses import dataclass, field
from typing import Callable, Any, Optional
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


@dataclass
class ActionDefinition:
    """Action Type 定义"""
    action_id: str
    display_name: str
    trigger_condition: Callable      # 触发条件函数
    param_builder: Callable           # 参数构建函数
    writeback_api: str               # 写回API端点（模拟）
    approval_required: bool = False
    approval_threshold_yuan: float = 50_000.0
    idempotency_window_hours: int = 4
    cooldown_minutes: int = 60


@dataclass
class ActionExecution:
    """Action执行记录"""
    execution_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    action_id: str = ""
    triggered_by: str = ""           # 触发实体ID
    trigger_tag: str = ""
    trigger_value: Any = None
    params: dict = field(default_factory=dict)
    status: str = "pending"          # pending/approved/executed/rejected/rolled_back
    created_at: str = field(default_factory=lambda: datetime.now().strftime("%H:%M:%S"))
    executed_at: Optional[str] = None
    writeback_response: Optional[dict] = None
    estimated_cost_yuan: float = 0.0


class SupplyChainOntologyEngine:
    """供应链本体行动触发引擎"""

    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.action_definitions: dict = {}
        self.execution_queue: list = []
        self.execution_history: list = []
        self.recent_executions: dict = {}   # action_id:entity_id → last execution time

    def register_action(self, action_def: ActionDefinition):
        self.action_definitions[action_def.action_id] = action_def
        print(f"  ✅ 注册Action: [{action_def.action_id}] "
              f"{'需审批' if action_def.approval_required else '自动执行'}")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.12188，但该号在 arXiv 上是《SG-Bot: Object Rearrangement via Coarse-to-Fine Robotic Imagination on Scene Graphs》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实体标签状态变更流、对象与动作的本体定义（卡页示例含 ActionDefinition 的触发条件、参数构建、写回 API 与审批阈值），以及 ERP/WMS 接口信息。

**输出**：触发动作队列与执行日志：卡页示例把补货响应从人工发现后 2 天下单压到 4 小时内自动触发、年化减少断货 15 件次，并对供应商风险做到实时预警与自动切换。

## 执行步骤

1. 定义对象状态与触发条件：断货风险、供应商风险等级
2. 为每个动作定义参数构建逻辑与写回端点
3. 接收状态变更流，匹配触发条件
4. 按金额阈值走审批流程或直接生成动作队列
5. 执行写回并记录日志，定期回看触发准确率

## 边界与不做

- 数据不满足时不用：标签状态不准确，或 ERP/WMS 没有可用写回接口时自动触发会误伤业务，应先治理标签与接口。
- 能力边界：本卡产出触发规则与写回编排，不含 ERP/WMS 本身的改造；卡页也把接口集成与审批流设计列为难点。
- 写回 ERP/WMS 的下单与供应商切换动作必须保留人工审批阈值，不得无审批直连生产系统。

## 技能关联

- **前置**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map
- **可组合**：Skill-Demand-Supply-Matching-Gap-Analysis.html、Skill-Demand-Supply-Matching-Gap-Analysis、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Supply-Chain-Ontology-Action-Trigger

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：24-标签工程　·　源卡：`Skill-Supply-Chain-Ontology-Action-Trigger`