---
name: "p2s-predictive-tag-engine-supply-chain"
title: "预测型标签引擎 — 将未来风险转化为当前可查询标签的供应链预测打标体系"
description: "触发词：预测型标签、断货预警、置信度阈值、动作优先级、大促备货。何时不用：只需要未来需求量的数值预测时用需求预测技能；只把不确定性表达成区间时用不确定性量化技能。安全边界：标签须设置信度阈值并建立误报回溯机制，高影响补货决定不得仅凭标签自动执行。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 需求预测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Predictive-Tag-Engine-Supply-Chain"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把未来的风险提前变成现在就能查的标签，断货和大促备货都能在触发线上自动开单。"
user_try: "试试：给旗舰款吸奶器做 7 日断货预测标签，置信度 0.75 以上自动创建补货预审单。"
whenToUse: "需要把预测结果落成可查询标签并绑定触发动作时用本技能；只要一个预测数值，用需求预测技能。"
workflow: "确定标签口径与预测窗口 → 用库存、在途与需求波动计算预测 → 按置信度阈值判定标签是否可执行 → 绑定标签到动作优先级与工作流 → 跟踪误报与漏报并回溯"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 预测型标签引擎 — 将未来风险转化为当前可查询标签的供应链预测打标体系

## ① 解决的问题

补货团队面临"等到断货才发现已经来不及"——预测型标签引擎将断货事件从12件/年→3件/年，T-14天提前响应比T-0应急成本低20倍

## ② 核心算法逻辑

预测型标签（Predictive Tag） 的核心洞察：传统标签描述当前状态（库存=50件），但决策需要的是未来状态（7天后会断货）。预测标签把"预测模型的输出"编码为可查询、可触发行动的标签。

## ③ 业务应用场景

场景A：7日断货预测标签（主力场景） - 业务问题：吸奶器旗舰款在Amazon平均PLT=35天，等到真的断货再补货已经来不及 - 预测标签逻辑： - 触发动作：`predicted_stockout_7d=True` → 自动创建补货预审单（采购经理24h内确认） - 业务价值：断货事件从"12件/年"降至"3件/年"，年化减少断货损失约18万元
三轨验证： - 成本：需接入Amazon实时库存API（约$200/月）、PLT历史数据清洗（人力2人周）、每日全量预测计算（云资源约$50/月）。初始模型开发约3人月。 - 合规：预测标签仅用于内部补货决策，不涉及Amazon Listing内容修改，不触发平台政策风险。库存数据为自有系统数据，无GDPR用户隐私问题。 - 风险：预测标签误报（假阳性）可能导致过度备货，占用仓储资金；假阴性则断货风险未预警。需设置置信度阈值（建议≥0.75）并建立误报回溯机制。
场景B：大促需求峰值预测标签 - 业务问题：Black Friday前需要知道哪些SKU需要额外备货，但不确定会大多少 - 预测标签：`predicted_demand_spike=True`（置信度≥0.80）→ 触发"大促备货复核"工作流 - 预测逻辑：历史大促销量倍数 × 当年广告投入比例 × 外部搜索热度指数 - 业务价值：大促备货准确率（售罄率50-65%目标）从42%提升至68%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：7日断货预测标签使断货事件从12件/年→3件/年，年化减少断货损失约18万元；大促需求峰值预测标签使大促备货准确率从42%→68%，减少大促后尾货损失约10万元
实施难度：⭐⭐⭐☆☆（需要时序预测模型和PLT数据支撑，中等难度）
优先级评分：⭐⭐⭐⭐⭐（把"响应式"补货变为"预防式"补货，是标签工程对供应链最大的价值贡献）
评估依据：预测标签实现"T-14天提前响应"比"T-0天断货应急"，响应成本降低10-20倍（无需紧急空运）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（238 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_collection/predictive_tag_engine_supply_chain` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Predictive-Tag-Engine-Supply-Chain.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
预测型标签引擎 — 供应链供应链预测打标体系
功能：多类型预测标签计算 / 滚动更新 / 置信度管理 / 提前行动映射
输入：SKU库存数据 + 销售历史 + PLT数据
输出：预测标签集 + 置信度 + 行动优先级 + 预测准确率追踪
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class PredictiveTag:
    tag_id: str
    horizon_days: int
    value: bool
    confidence: float
    predicted_at: str
    model_name: str
    evidence: dict = field(default_factory=dict)
    action_priority: str = "normal"  # low/normal/high/urgent

    def is_actionable(self, min_confidence: float = 0.75) -> bool:
        return self.value and self.confidence >= min_confidence


class PredictiveTagEngine:
    """预测型标签引擎"""

    def __init__(self, confidence_thresholds: dict = None):
        self.thresholds = confidence_thresholds or {
            "predicted_stockout_7d": 0.75,
            "predicted_stockout_14d": 0.70,
            "predicted_stockout_30d": 0.65,
            "predicted_demand_spike": 0.72,
            "predicted_slow_moving": 0.68,
            "predicted_price_increase": 0.70,
        }
        self.prediction_log = []

    def predict_stockout(self, sku: dict, horizon_days: int,
                          plt_p85: float = 35.0) -> PredictiveTag:
        """
        断货预测：基于DOS + PLT + 需求波动
        DOS = current_inventory / avg_daily_sales
        """
        inventory = sku.get("inventory", 0)
        avg_daily = max(0.1, sku.get("avg_daily_sales_30d", 1.0))
        demand_cv = sku.get("demand_cv", 0.25)
        pending_po = sku.get("pending_po_qty", 0)

        # 有效库存天数（含在途但扣安全库存）
        effective_inventory = inventory + pending_po * 0.8  # 在途80%可期
        dos = effective_inventory / avg_daily

        # 需求上行风险（CV越大，断货风险越高）
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2305.14481。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：实时库存与在途数据、历史销量与大促数据、交期统计（如 P85 交期）、促销与广告投入计划，粒度到单个 SKU 与单个预测窗口。

**输出**：可查询的预测型标签（标签 id、预测窗口、取值、置信度、模型名、证据、动作优先级）与可执行判定结果，供补货预审、大促备货复核等工作流触发使用。

## 执行步骤

1. 定义标签口径与预测窗口（如 7 日断货）
2. 用有效库存天数与需求波动计算预测值
3. 按置信度阈值判定标签是否可执行
4. 为可执行标签绑定动作优先级与工作流
5. 跟踪误报漏报并回溯修正阈值

## 边界与不做

- 缺少实时库存接口或历史交期数据时预测可靠性不足；只做一次性备货估算不必引入标签体系。
- 本技能产出预测标签与触发判据，不代替采购经理确认，也不自动下发采购订单。

## 技能关联

- **前置**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Climate-ESG-Supply-Chain-Tag.html、Skill-Climate-ESG-Supply-Chain-Tag、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Index-Health-Monitoring.html、Skill-Index-Health-Monitoring、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Return-Fraud-Detection-Tag-Engine.html、Skill-Return-Fraud-Detection-Tag-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Climate-ESG-Supply-Chain-Tag.html、Skill-Climate-ESG-Supply-Chain-Tag、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Index-Health-Monitoring.html、Skill-Index-Health-Monitoring、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Return-Fraud-Detection-Tag-Engine.html、Skill-Return-Fraud-Detection-Tag-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-A9-Algorithm-Sales-Velocity-Optimization.html、Skill-A9-Algorithm-Sales-Velocity-Optimization、Skill-Climate-ESG-Supply-Chain-Tag.html、Skill-Climate-ESG-Supply-Chain-Tag、Skill-Forecast-MAPE-MinMax-Accuracy-System.html、Skill-Forecast-MAPE-MinMax-Accuracy-System、Skill-Index-Health-Monitoring.html、Skill-Index-Health-Monitoring、Skill-Procurement-Cycle-Time-KPI.html、Skill-Procurement-Cycle-Time-KPI、Skill-Return-Fraud-Detection-Tag-Engine.html、Skill-Return-Fraud-Detection-Tag-Engine、Skill-Predictive-Tag-Engine-Supply-Chain

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Predictive-Tag-Engine-Supply-Chain`