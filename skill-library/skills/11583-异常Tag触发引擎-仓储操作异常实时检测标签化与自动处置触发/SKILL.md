---
name: "p2s-wms-exception-action-trigger"
title: "WMS异常Tag触发引擎 — 仓储操作异常实时检测、标签化与自动处置触发"
description: "触发词：WMS异常、实时检测、Tag触发、自动处置。何时不用：没有实时事件流、只能事后统计时不用本卡；纯 KPI 报表用仓储运营 KPI 类技能。安全边界：暂停波次等动作不得违反平台发货时效承诺，误报可能导致延迟发货与索赔，需保留人工确认缓冲。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-061"
l3_business: "仓储协作"
l3_all: "仓储协作 / 履约异常"
l1_l2_l3: "业务运营/供应与履约/仓储协作"
p2s_card_id: "Skill-WMS-Exception-Action-Trigger"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "实时监测仓储操作异常，打上标签并在超阈值时触发暂停、复核等处置动作。"
user_try: "试试：过去一小时拣货差错率升到 3.2%，帮我设计一套异常 Tag 与自动处置规则。"
whenToUse: "本卡属「仓储协作」。需要把仓储操作异常实时检测并触发处置动作时用本卡；只做事后 KPI 统计与改善分析时用仓储运营 KPI 类技能。"
workflow: "接入 WMS 实时事件流 → 按阈值检测异常并打 Tag → 触发暂停波次等处置动作 → 解除后清除 Tag 恢复作业"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# WMS异常Tag触发引擎 — 仓储操作异常实时检测、标签化与自动处置触发

## ① 解决的问题

仓库主管面临"拣货差错率升高1小时后才被发现"——WMS异常Tag实时检测+自动暂停波次，将异常响应从1小时降至实时，年化减少补发成本5万元

## ② 核心算法逻辑

WMS异常Tag触发 将仓库中每一个"异常事件"转化为结构化Tag，进而触发标准化处置Action，消除人工发现→手工处理的延迟。

## ③ 业务应用场景

场景A：大促期间拣货差错率预警 - 监测：过去1小时拣货差错率从0.5%升至3.2%（超过3%阈值） - 自动Tag：`wh.pick.error_rate=HIGH` - 触发Action： 1. 暂停新的拣货波次下达 2. 对当前批次已拣出货物做二次扫码确认 3. 通知仓储主管排查原因（新员工培训不足/条码扫描器问题） - 恢复：问题解决后清除Tag，恢复正常作业
三轨验证： - 成本：需接入WMS实时事件流（API调用费约$0.003/次），每仓库日均处理10万次事件，月成本约$900；规则引擎维护需0.5人力/月 - 合规：暂停拣货波次不涉及消费者数据，无GDPR风险；但需确保暂停逻辑不违反Amazon发货时效SLA（如超过承诺发货时间可能触发平台处罚） - 风险：误报导致正常订单延迟发货，可能引发买家差评或A-to-Z索赔；建议设置人工确认缓冲期（5分钟）再执行暂停
场景B：奶粉临期库存紧急处置 - 检测：`wh.expiry.days_remaining=25 AND sku.abc_class=B AND sku.inventory=500件` - Tag：`wh.expiry.alert=CRITICAL` - 触发： 1. 自动在Amazon创建Lightning Deal申请（折扣10%） 2. 通知运营团队准备促销文案 3. 调整该SKU在WMS的出库优先级（FIFO+临期优先）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：WMS异常自动检测+触发，将响应时间从"人工发现1-2小时"→"实时自动"；拣货差错率下降60%（自动暂停+审核），减少补发成本约5万元/年；仓容预警自动处理减少急仓成本约3万元/年
实施难度：⭐⭐⭐☆☆（需要WMS事件API，主要是事件接入和规则配置）
优先级评分：⭐⭐⭐⭐☆（仓库是供应链的物理执行层，异常不处理直接影响发货质量）
评估依据：仓储研究：80%的异常事件在发现后4小时内可处理，自动化检测将MTTD从1小时降至实时

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（180 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 47 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/wms_exception_action_trigger` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-WMS-Exception-Action-Trigger.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
WMS 异常 Tag 触发引擎
功能：异常事件检测 / Tag实时更新 / 规则引擎匹配 / 自动Action触发 / 异常统计
输入：WMS操作事件流 + 异常阈值配置
输出：异常Tag集合 + 触发Action列表 + 异常统计报告
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


@dataclass
class WMSEvent:
    event_id: str
    event_type: str
    warehouse_id: str
    sku_id: str
    timestamp: datetime
    details: dict = field(default_factory=dict)


@dataclass
class WMSExceptionTag:
    tag_id: str
    warehouse_id: str
    sku_id: str
    tag_value: str
    severity: str
    triggered_at: datetime
    source_event: str
    active: bool = True


@dataclass
class WMSAction:
    action_id: str
    action_type: str
    warehouse_id: str
    sku_id: str
    triggered_by_tag: str
    params: dict = field(default_factory=dict)
    status: str = "pending"


EXCEPTION_RULES = [
    {"name": "拣货差错率预警",
     "condition": lambda tags: tags.get("wh.pick.error_rate_1h", 0) > 0.03,
     "tag": "wh.pick.error_rate", "value": "HIGH", "severity": "HIGH",
     "actions": ["pause_pick_waves", "audit_current_batch", "notify_ops_manager"]},
    {"name": "仓容超载预警",
     "condition": lambda tags: tags.get("wh.capacity_utilization", 0) > 0.92,
     "tag": "wh.capacity_alert", "value": "CRITICAL", "severity": "HIGH",
     "actions": ["notify_clearance_needed", "pause_inbound_scheduling"]},
    {"name": "效期临近预警",
     "condition": lambda tags: (tags.get("wh.expiry_days_remaining", 999) < 30 and
                                 tags.get("sku.units_in_stock", 0) > 50),
     "tag": "wh.expiry.alert", "value": "CRITICAL", "severity": "CRITICAL",
     "actions": ["create_lightning_deal_request", "set_fifo_priority"]},
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.11823，但该号在 arXiv 上是《Coulomb contribution to Shockley-Read-Hall (SRH) recombination》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：WMS 实时事件流（拣货差错、临期天数、ABC 分类、库存量等字段）以及阈值规则配置。

**输出**：异常 Tag 与触发的处置动作清单（暂停波次、二次扫码、通知主管、创建促销申请等），以及恢复条件与监控记录。

## 执行步骤

1. 接入 WMS 实时事件流并定义字段
2. 按阈值规则实时检测异常并生成 Tag
3. 命中规则时触发对应处置动作
4. 通知责任人排查并将处置结果回写
5. 问题解除后清除 Tag 恢复常态作业

## 边界与不做

- 没有实时事件流、只能事后统计时不用本卡
- 本卡产出标签规则与处置动作定义，真正的波次暂停与冻结由 WMS 等确定性控制层执行
- 暂停波次不得违反平台发货时效承诺，建议设置人工确认缓冲期以降低误报影响

## 技能关联

- **前置**：Skill-Expiry-Date-Aging-Baby-Products-KPI.html、Skill-Expiry-Date-Aging-Baby-Products-KPI、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle、Skill-Warehouse-Inbound-Quality-Accuracy-KPI.html、Skill-Warehouse-Inbound-Quality-Accuracy-KPI、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag
- **延伸**：Skill-Expiry-Date-Aging-Baby-Products-KPI.html、Skill-Expiry-Date-Aging-Baby-Products-KPI、Skill-Supply-Chain-Agent-Orchestration-Hub.html、Skill-Supply-Chain-Agent-Orchestration-Hub、Skill-Warehouse-Outbound-Fulfillment-SLA.html、Skill-Warehouse-Outbound-Fulfillment-SLA、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag
- **可组合**：Skill-Expiry-Date-Aging-Baby-Products-KPI.html、Skill-Expiry-Date-Aging-Baby-Products-KPI、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag、Skill-WMS-Exception-Action-Trigger

---

> 分类：业务运营/供应与履约/仓储协作　·　技术族：24-标签工程　·　源卡：`Skill-WMS-Exception-Action-Trigger`