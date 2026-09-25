---
name: "p2s-combo-inventory-crisis-response"
title: "库存危机响应 Combo Pattern — 断货/积压异常触发的 5 步自动响应链路"
description: "触发词：库存危机、断货预警、积压清仓、DSI 异常、五步响应。何时不用：只算单点补货量用补货模拟类技能；只评估调拨或清货渠道用调拨清货建议类技能。安全边界：紧急空运与甩货动作须人工确认金额与批次后才可执行，链路本身不得自动下单。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-006"
l3_business: "依赖协调"
l3_all: "依赖协调 / 调拨清货建议 / 补货模拟"
l1_l2_l3: "经营管理/经营与组织/依赖协调"
p2s_card_id: "Skill-Combo-Inventory-Crisis-Response"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "断货或积压一发生，自动走完检测、重预测、重分级、决策、联动五步，把三天的协调压成四小时。"
user_try: "试试：Prime Day 前 21 天这个安全座椅 DSI 只剩 8 天，走一遍库存危机响应链路给我方案。"
whenToUse: "当库存出现断货或积压危机、需要把检测到决策的完整响应串起来时用本技能；只要算单点补货量，用补货模拟类技能；只要评估调拨或清货渠道，用调拨清货建议类技能。"
workflow: "Step1 检测 DSI 异常并判定危机类型与置信度 → Step2 结合大促季节倍数重新预测需求、修正 DSI → Step3 按 ABC 重新分级（提级紧急或降级清仓） → Step4 生成补货或甩货方案（分批空运、降价闪购） → Step5 联动第三方仓与费用方案并留痕"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 库存危机响应 Combo Pattern — 断货/积压异常触发的 5 步自动响应链路

## ① 解决的问题

供应链总监面临"断货或积压发生后应急响应需要多个系统多个人协调处理效率极低"——5步自动响应链路将库存危机响应时间从3天人工协调压缩至4小时自动完成，年化避损$12万

## ② 核心算法逻辑

论文：Inventory Crisis Response via EventDriven Orchestration | 年份：2021

## ③ 业务应用场景

场景A：儿童安全座椅亚马逊断货危机（大促前 21 天）
- 业务问题：Prime Day 前 21 天，FBA 库存 DSI = 8 天，供应商最短交期 35 天（海运），断货将错过全年最大流量窗口，损失估算 > 30 万元 - 数据要求：当前库存量、历史 30 天销速、供应商交期分布、FBA 入库时间 - 执行过程： - Step1 检测到 DSI = 8 天，异常类型 = 「断货危机」，置信度 0.94 - Step2 重新预测：大促期间需求是平日 3.2x，修正后 DSI 实际仅 2.5 天 - Step3 ABC 重分级：该 SKU 从 B 类提升至 A+ 类（紧急优先） - Step4 决策：紧急补货 500 件，分两批（空运 200 件
- 业务问题：库龄 > 120 天积压 2000 件，FBA 存储费用持续累计，且即将触发长期存储费（每件 $6.9） - 执行亮点：Step3 重分级标记为「C 类清仓」，Step4 生成甩货方案（降价 35% + 闪购），Step5 建议将部分库存转移至第三方仓降低 FBA 费用 - 业务价值：45 天内清库 85%，节省长期存储费 1.38 万美元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：大促断货一次平均损失 15-50 万元，本 Combo 早期预警 + 响应将断货概率从 18% 降至 4%，按年 2 次大促计算，期望避免损失 = (18%-4%) × 30 万元 × 2 = 8.4 万元/年；积压清仓优化节省存储费约 3-8 万元/年
响应时效：5 步链路 < 4 小时完成（vs 人工跨部门协调 2-3 天）
实施难度：⭐⭐⭐☆☆（依赖库存系统数据接口，核心逻辑可在 2 周内工程化）
优先级：⭐⭐⭐⭐⭐（库存危机是损失最直接的运营事件，ROI 极为确定）
适用场景：月销 > 500 件的 SKU，或大促期间所有 A 类 SKU 自动巡检

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（206 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'else' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/llm_agent_engineering/combo_inventory_crisis_response` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Combo-Inventory-Crisis-Response.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
库存危机响应 Combo Pattern — 5 步自动响应链路
模拟从异常检测到物流路由的完整决策流
"""
from dataclasses import dataclass, field
from typing import Optional
import math

# ──────────────────────────────────────────────
# 库存危机上下文
# ──────────────────────────────────────────────
@dataclass
class CrisisContext:
    sku_id: str
    current_inventory: int        # 当前库存件数
    daily_sales_rate: float       # 日均销速（件/天）
    days_to_peak_demand: int      # 距离销售高峰天数（大促/旺季）
    unit_price: float             # 单价（USD）
    lead_time_sea_days: int = 35  # 海运交期
    lead_time_air_days: int = 7   # 空运交期
    air_freight_cost_per_unit: float = 5.0  # 空运单件成本
    # 各 Step 填充
    crisis_type: str = "unknown"           # Step1
    forecast_dsi: float = 0.0             # Step2
    sku_priority: str = "B"               # Step3
    replenishment_qty: int = 0            # Step4
    logistics_plan: dict = field(default_factory=dict)  # Step5
    expected_crisis_resolved: bool = False

    @property
    def current_dsi(self) -> float:
        return self.current_inventory / max(self.daily_sales_rate, 0.1)

# ──────────────────────────────────────────────
# Step 1: 异常检测 — Skill-Anomaly-Detection-Foundation-Model
# ──────────────────────────────────────────────
def step1_anomaly_detection(ctx: CrisisContext) -> CrisisContext:
    dsi = ctx.current_dsi
    if dsi < 14:
        ctx.crisis_type = "stockout_crisis"
        severity = "CRITICAL" if dsi < 7 else "HIGH"
    elif ctx.current_inventory > ctx.daily_sales_rate * 120:
        ctx.crisis_type = "overstock_crisis"
        severity = "HIGH"
    else:
        ctx.crisis_type = "normal"
        severity = "LOW"
    print(f"  [Step1] 异常检测: DSI={dsi:.1f}天, 危机类型={ctx.crisis_type}, 严重度={severity}")
    return ctx

# ──────────────────────────────────────────────
# Step 2: 需求重新预测 — Skill-Demand-Forecasting-Supply-Chain
# ──────────────────────────────────────────────
def step2_demand_reforecast(ctx: CrisisContext) -> CrisisContext:
    # 考虑大促季节性倍数（简化 ARIMA + 季节因子）
    if ctx.days_to_peak_demand <= 30:
        peak_multiplier = 3.2  # 大促期间需求 3.2x
    elif ctx.days_to_peak_demand <= 60:
        peak_multiplier = 1.8
    else:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.03274，但该号在 arXiv 上是《The Magellanic Edges Survey -- II. Formation of the LMC's northern arm》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Inventory Crisis Response via EventDriven Orchestration》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：当前库存量、历史 30 天销速、供应商交期分布、FBA 入库时间，以及大促日历等季节因子；按 SKU 粒度。

**输出**：五步链路的完整响应记录（异常判定与置信度、修正后 DSI、ABC 重分级、补货或甩货方案、联动动作）；供供应链总监与运营执行。

## 执行步骤

1. 检测 DSI 异常并判定危机类型与置信度
2. 结合大促季节倍数重新预测需求并修正 DSI
3. 按 ABC 重新分级（提级紧急或降级清仓）
4. 生成补货或甩货方案（分批空运、降价闪购）
5. 联动第三方仓与费用方案并留痕

## 边界与不做

- 数据不满足：库存、销速或供应商交期数据缺一不可，缺项时不要触发自动响应。
- 何时不用：只需单点补货量用补货模拟类技能；只需调拨或清货渠道建议用调拨清货建议类技能；日常低风险库存巡检不必走五步链路。
- 能力边界：产出规则与建议契约，链路不执行下单、不发起空运，最终动作由确定性控制层与人工确认后执行。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **延伸**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **可组合**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Combo-New-Product-Launch-Playbook.html、Skill-Combo-New-Product-Launch-Playbook、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-Dynamic-ABC-Stratification-Adaptive-Policy.html、Skill-Dynamic-ABC-Stratification-Adaptive-Policy、Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Inventory-Health-Aging-Attribution.html、Skill-Inventory-Health-Aging-Attribution、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory、Skill-Combo-Inventory-Crisis-Response

---

> 分类：经营管理/经营与组织/依赖协调　·　技术族：16-智能体工程　·　源卡：`Skill-Combo-Inventory-Crisis-Response`