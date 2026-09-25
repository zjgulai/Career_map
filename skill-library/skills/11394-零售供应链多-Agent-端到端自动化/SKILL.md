---
name: "p2s-flowr-supply-chain-mas"
title: "Flowr — 零售供应链多 Agent 端到端自动化"
description: "触发词：多Agent供应链、端到端补货、跨境补货自动化、补货Agent、供应链自动化。何时不用：只做单一环节的补货量测算时用供需缺口分析与优先级分配；只做多渠道库存同步与超卖防护时用多渠道库存协同。安全边界：关键补货与下单动作须经人工确认门放行后再执行，涉及资金与合同的决策不得全自动放行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 补货模拟 / 履约跟踪"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-Flowr-Supply-Chain-MAS"
p2s_src_domain: "10-MAS"
quality_tier: "preview"
user_summary: "把销量预测、库存监控、采购下单等环节交给多个智能体协同，跨境补货从预测到下单串成一条自动链路。"
user_try: "试试：帮我按 Flowr 的多智能体流程跑一遍这三个 SKU 的跨境补货，从预测到下单草案都给我。"
whenToUse: "需要把预测、库存、采购、履约等多环节串成端到端自动化补货链路时用本技能；只做单点补货量测算用供需缺口分析与优先级分配。"
workflow: "接入销售历史、库存快照与运输时效数据 → 按角色划分预测、库存、采购、履约等智能体 → 各智能体产出结论并在人工确认门汇合 → 生成补货与下单草案供人工确认执行"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Flowr — 零售供应链多 Agent 端到端自动化

## ① 解决的问题

母婴品牌在亚马逊/独立站同时运营，SKU 达 500+，跨境仓（海外仓 + 国内直发）补货涉及 DHL/UPS 运输周期（15-30 天）、海关清关（3-7 天）、Amazon FBA 入仓（1-5 天），任何一环延误都导致断货（Lost Buy Box，单 SKU 日损失 2,000-8,000 元）

## ② 核心算法逻辑

Flowr 将人工密集型零售供应链操作系统性地分解为 6 个专业化 AI Agent 联盟，由中央 Reasoning LLM 协调编排，供应链经理通过 MCP（Model Context Protocol）接口实施人工监督（HITL）。核心洞察是：供应链决策具有天然的功能模块化特征，不同子任务所需的专业知识和数据源存在边界清晰的分工，因此适合由专业化 LLM（而非单一通用模型）各司其职，再由 Reasoning LLM 统一协调。

## ③ 业务应用场景

业务问题：母婴品牌在亚马逊/独立站同时运营，SKU 达 500+，跨境仓（海外仓 + 国内直发）补货涉及 DHL/UPS 运输周期（15-30 天）、海关清关（3-7 天）、Amazon FBA 入仓（1-5 天），任何一环延误都导致断货（Lost Buy Box，单 SKU 日损失 2,000-8,000 元）。
| Flowr Agent | 母婴对应角色 | 专属数据域 | |------------|------------|-----------| | Demand Forecasting | 销量预测 Agent（含节假日/季节/营销）| Amazon API 销售历史、促销日历 | | Inventory Monitoring | 库存状态 Agent（FBA + 海外仓 + 在途）| FBA Inventory Report、WMS 系统 | | Procurement & Ordering | 采购下单 Agent（MOQ/阶梯价格优化）| ERP 采购历史、供应商价格表 | | Sup
数据要求： - 销售历史：SKU × 日期 × 渠道，过去 12 个月，≥80% 数据完整率 - 库存快照：每日实时同步（FBA/海外仓/在途 三库区） - 运输时效：历史货代记录（含清关延误标记）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易：框架已有模板（本 Skill 提供完整代码骨架），6 个 Agent 边界清晰，可分阶段上线
中：需对接 Amazon API、WMS、ERP 等数据源（通常 2-4 周集成工期）
难：专业化 LLM 微调需要供应链领域语料（可用 RAG 替代降低门槛）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（421 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/mas/flowr_supply_chain_mas` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-Flowr-Supply-Chain-MAS.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Flowr Supply Chain MAS — 多 Agent 供应链协作框架（母婴出海版）
arXiv:2604.05987 | Python 3.14+ | 仅标准库，无需额外安装
"""
from __future__ import annotations
import json
import random
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any


# ── 数据结构 ──────────────────────────────────────────────────────────────────

@dataclass
class SKU:
    sku_id: str
    name: str
    current_stock: int        # 件
    daily_sales_avg: float    # 件/日
    lead_time_days: int       # 补货提前期（天）
    moq: int                  # 最小起订量
    unit_cost: float          # 元/件


@dataclass
class AgentResult:
    agent: str
    status: str               # "ok" | "warning" | "error"
    data: dict[str, Any]
    message: str = ""


@dataclass
class HITLGate:
    """人工监督门控记录"""
    gate_id: str
    agent: str
    decision_summary: str
    approved: bool = False
    approver: str = ""


# ── 6 个专业化 Agent ─────────────────────────────────────────────────────────

class DemandForecastingAgent:
    """需求预测 Agent — 基于移动平均 + 季节因子（生产环境可替换为 TFT/Prophet）"""

    def run(self, sku: SKU, horizon_days: int = 30, seasonality: float = 1.0) -> AgentResult:
        forecast_daily = sku.daily_sales_avg * seasonality
        forecast_total = round(forecast_daily * horizon_days)
        ci_lower = round(forecast_total * 0.8)
        ci_upper = round(forecast_total * 1.25)
        return AgentResult(
            agent="DemandForecasting",
            status="ok",
            data={
                "horizon_days": horizon_days,
                "forecast_total": forecast_total,
                "ci_lower": ci_lower,
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.05987 — Flowr -- Scaling Up Retail Supply Chain Operations Through Agentic AI in Large Scale Supermarket Chains
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：销售历史（SKU × 日期 × 渠道，过去 12 个月，数据完整率不低于 80%）、每日库存快照（FBA、海外仓、在途三库区）、历史运输时效（含清关延误标记）与补货参数。

**输出**：多智能体协作产出的补货与下单草案、各环节结论与人工确认门清单，供运营与采购团队确认后执行。

## 执行步骤

1. 接入销售历史、库存快照与运输时效数据源
2. 按角色实例化预测、库存、采购与履约智能体
3. 各智能体产出结论并在人工确认门汇合
4. 生成补货与下单草案供人工确认

## 边界与不做

- 何时不用：只需单点补货量测算时用供需缺口分析与优先级分配；只需多渠道库存配额与超卖防护时用多渠道库存协同。
- 能力边界：本技能产出协作框架与草案，真正的下单、付款与合同动作须由人工确认门放行后执行。
- 数据边界：需对接 Amazon API、WMS、ERP 等数据源，集成未完成时只能跑框架骨架与模拟数据。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-Multi-Echelon-Inventory.html、Skill-Multi-Echelon-Inventory
- **延伸**：Skill-AIM-RM-LLM-Inventory-MAS-Memory.html、Skill-AIM-RM-LLM-Inventory-MAS-Memory、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven
- **可组合**：Skill-Safety-Stock-Replenishment.html、Skill-Safety-Stock-Replenishment、Skill-Skill-Registry-Dynamic-Loading.html、Skill-Skill-Registry-Dynamic-Loading、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Flowr-Supply-Chain-MAS

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：10-MAS　·　源卡：`Skill-Flowr-Supply-Chain-MAS`