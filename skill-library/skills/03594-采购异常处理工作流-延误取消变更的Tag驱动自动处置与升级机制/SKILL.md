---
name: "p2s-po-exception-handling-workflow"
title: "采购异常处理工作流 — PO延误/取消/变更的Tag驱动自动处置与升级机制"
description: "触发词：采购异常、PO延误、订单取消、Tag驱动处置、升级规则。何时不用：要预测交期分布做预警时用「提前期分布建模」；补货量决策用「自动补货决策」。安全边界：自动处置仅限提醒与建单，涉及取消订单、索赔与更换供应商的动作须人工审批。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-045"
l3_business: "订单协调"
l3_all: "订单协调 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/订单协调"
p2s_card_id: "Skill-PO-Exception-Handling-Workflow"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把采购异常按类型贴标签自动走处置流程，紧急的自动升级到人。"
user_try: "试试：这几个 PO 延误和取消了，按异常类型给出自动处置动作和该升级给谁。"
whenToUse: "PO 延误、取消、变更或质量拒收频繁、靠邮件处理导致响应慢时用；单纯的交期分布分析走「采购前置期KPI」。"
workflow: "识别异常类型与严重度 → 生成异常标签 → 执行对应的自动处置动作 → 达到升级条件时通知负责人并记录日志"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 采购异常处理工作流 — PO延误/取消/变更的Tag驱动自动处置与升级机制

## ① 解决的问题

采购面临"采购异常靠邮件通知处理延迟1-2天"——Tag驱动工作流将PO延误/取消响应从2天→4小时，减少断货损失5-10万元/年

## ② 核心算法逻辑

采购异常 是供应链最常见的中断事件。80%的异常都有固定处置模式，可以通过Tag+工作流自动化处理。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：PO异常自动处理将响应时间从"1-2天人工"→"4小时内自动"；减少因处理延迟导致的断货损失，年化约5-10万元
实施难度：⭐⭐☆☆☆（规则清晰，主要是采购系统集成）
优先级评分：⭐⭐⭐⭐☆（采购异常是日常最高频的供应链中断事件，自动化处理价值高）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（93 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/po_exception_handling_workflow` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-PO-Exception-Handling-Workflow.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
采购异常处理工作流
功能：异常类型识别 / Tag生成 / 自动处置 / 升级规则 / 处置日志
"""
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


EXCEPTION_HANDLERS = {
    "delay_minor":    {"auto_action": "system_reminder", "escalate": False},
    "delay_major":    {"auto_action": "notify_procurement+find_backup", "escalate": True},
    "cancelled":      {"auto_action": "emergency_supplier_search", "escalate": True},
    "qty_significant": {"auto_action": "recalculate_safety_stock", "escalate": True},
    "quality_reject": {"auto_action": "return+rework_notice", "escalate": True},
}


@dataclass
class POException:
    po_id: str
    supplier_id: str
    sku_id: str
    exception_type: str
    severity: str           # MINOR / MAJOR / CRITICAL
    details: dict = field(default_factory=dict)
    detected_at: datetime = field(default_factory=datetime.now)
    tags: dict = field(default_factory=dict)
    actions_taken: list = field(default_factory=list)


def handle_po_exception(exception: POException) -> dict:
    """处理采购异常"""
    handler = EXCEPTION_HANDLERS.get(exception.exception_type, {})

    # 生成Tags
    exception.tags = {
        f"po.{exception.exception_type}": True,
        "po.exception_severity": exception.severity,
        "po.exception_requires_action": exception.severity != "MINOR",
    }

    # 执行自动Actions
    auto_action = handler.get("auto_action", "log_and_monitor")
    exception.actions_taken.append({
        "action": auto_action,
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "automated": True,
    })

    # 升级决策
    should_escalate = handler.get("escalate", False) and exception.severity in ["MAJOR", "CRITICAL"]
    if should_escalate:
        exception.actions_taken.append({
            "action": "escalate_to_manager",
            "notification": f"PO异常升级: [{exception.po_id}] {exception.exception_type}",
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "automated": True,
        })
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11823，但该号在 arXiv 上是《Low luminosity observation of BeXRB source IGR J21347+4737》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：采购异常事件：PO 号、供应商、SKU、异常类型（延误/取消/数量变更/质量拒收）、严重度、明细与发现时间，按事件一条记录。

**输出**：异常标签、自动处置动作记录（含时间戳与是否自动）、升级通知与处置日志，供采购跟进与复盘。

## 执行步骤

1. 识别 PO 异常类型与严重度
2. 按异常类型生成标签
3. 执行对应的自动处置动作并记录时间戳
4. 按严重度与规则判断是否升级
5. 输出处置日志与升级通知

## 边界与不做

- 数据不满足时不适用：采购系统无法提供 PO 状态变更事件时，异常无从识别。
- 能力边界：自动处置只覆盖提醒、通知与建单，取消订单、索赔与更换供应商须人工审批后执行。

## 技能关联

- **前置**：Skill-OTIF-On-Time-In-Full-Analytics.html、Skill-OTIF-On-Time-In-Full-Analytics、Skill-Procurement-Budget-Rolling-Reforecast.html、Skill-Procurement-Budget-Rolling-Reforecast、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **延伸**：Skill-Procurement-Budget-Rolling-Reforecast.html、Skill-Procurement-Budget-Rolling-Reforecast、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub
- **可组合**：Skill-Procurement-Budget-Rolling-Reforecast.html、Skill-Procurement-Budget-Rolling-Reforecast、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-PO-Exception-Handling-Workflow

---

> 分类：业务运营/供应与履约/订单协调　·　技术族：04-供应链　·　源卡：`Skill-PO-Exception-Handling-Workflow`