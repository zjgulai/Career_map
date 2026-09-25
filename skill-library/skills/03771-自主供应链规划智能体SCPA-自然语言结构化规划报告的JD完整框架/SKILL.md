---
name: "p2s-scpa-autonomous-sc-planning-agent"
title: "自主供应链规划智能体SCPA — 自然语言→结构化规划报告的JD.com完整框架"
description: "触发词：供应链晨报、自然语言规划、规划智能体、库存健康报告、补货草案。何时不用：需要端到端多智能体自动补货链路时用多Agent供应链端到端自动化；需要计算缺口分配优先级时用供需缺口分析与优先级分配。安全边界：自动生成的是补货草案与行动建议，正式发 PO 或改价前必须由人工确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-049"
l3_business: "供需协调"
l3_all: "供需协调 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/供需协调"
p2s_card_id: "Skill-SCPA-Autonomous-SC-Planning-Agent"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用一句话问库存健康，两分钟内拿到含断货风险、呆滞库存和补货草案的结构化报告。"
user_try: "试试：帮我看看吸奶器这个月的库存健康，重点说断货风险和呆滞库存，并附一份补货草案。"
whenToUse: "需要把自然语言问题转成结构化供应链规划报告与行动草案时用本技能；需要多智能体端到端自动补货链路用多Agent供应链端到端自动化。"
workflow: "识别用户意图对应的规划分析类型 → 调用 ERP 库存、销售预测与供应商档案数据 → 生成库存健康与风险结构化报告 → 输出补货草案与行动建议供确认"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 自主供应链规划智能体SCPA — 自然语言→结构化规划报告的JD.com完整框架

## ① 解决的问题

日常供应链晨报人工准备30分钟且双十一备货规划需3天——JD.com SCPA自然语言→结构化规划报告，晨报2分钟/备货规划1小时，运营人效提升2-3倍

## ② 核心算法逻辑

SCPA 架构三核心（JD.com 2025，已在亿级订单生产环境验证）：

## ③ 业务应用场景

运营主管早会前在企业微信发消息："帮我看看吸奶器这个月库存健康状况，主要关注断货风险和呆滞库存"
SCPA 在 2 分钟内生成结构化报告： - 当前健康库存：3 个 SKU（DOS 30-60 天）✅ - 断货风险：2 个 SKU（DOS < 14 天）⚠️ 建议立即补货 - 呆滞库存：1 个 SKU（DOS > 90 天）→ 建议启动清仓 - 附：自动生成的补货草案（可一键确认发 PO）
数据要求：ERP 库存数据 API + 销售预测服务 + 供应商档案数据库 预期产出：结构化 Markdown 报告 + 自动生成的行动建议 + 草案 PO 业务价值：日常供应链晨报从 30 分钟人工准备 → 2 分钟自动生成，运营效率提升 90%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：日常供应链报告从 30 分钟手工 → 2 分钟自动（↓93%），双十一备货规划从 3 天 → 1 小时（↓87%），运营人效提升约 2-3 倍
实施难度：⭐⭐⭐☆☆（核心是工具函数接入 ERP API，LLM 框架相对标准）
优先级：⭐⭐⭐⭐⭐（Palantir AIP Copilot 的核心场景，JD.com 生产验证，直接可迁移）
企业AI知识库依赖：高 — 工具函数需接入 ERP/WMS API；长期记忆需要历史决策数据库

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（282 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/llm_agent_engineering/scpa_autonomous_sc_planning_agent` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-SCPA-Autonomous-SC-Planning-Agent.md`），已与卡面节选核对，不依赖上述路径。

```python
import json
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from enum import Enum

class IntentType(Enum):
    INVENTORY_STATUS = "inventory_status"
    COVERAGE_ANALYSIS = "coverage_analysis"
    REPLENISHMENT_PLAN = "replenishment_plan"
    SCENARIO_PLANNING = "scenario_planning"
    SUPPLIER_RISK = "supplier_risk"
    UNKNOWN = "unknown"

@dataclass
class SCPAMemory:
    """SCPA 三层记忆"""
    session_context: List[Dict] = field(default_factory=list)    # 短期：对话历史
    historical_decisions: List[Dict] = field(default_factory=list)  # 长期：历史决策
    business_rules: Dict[str, Any] = field(default_factory=lambda: {
        "peak_season_safety_multiplier": 1.5,
        "min_dos_trigger_replenishment": 21,
        "max_dos_trigger_clearance": 90,
        "urgent_replenishment_threshold_days": 14,
    })
    
    def add_session_message(self, role: str, content: str):
        self.session_context.append({"role": role, "content": content})
        # 保持最近20条（token budget）
        if len(self.session_context) > 20:
            self.session_context = self.session_context[-20:]
    
    def retrieve_similar_decisions(self, intent: IntentType, k: int = 3) -> List[Dict]:
        """RAG 检索相似历史决策"""
        return [d for d in self.historical_decisions 
                if d.get("intent") == intent.value][-k:]

class SCPAAgent:
    """
    自主供应链规划智能体（SCPA）
    
    实现 JD.com 三层架构：
    意图理解 → 任务编排 → 工具执行 → 报告生成
    """
    
    # 意图-任务映射表（JD.com Task Registry 模式）
    TASK_REGISTRY: Dict[IntentType, List[str]] = {
        IntentType.INVENTORY_STATUS: [
            "fetch_inventory_snapshot",
            "classify_health_status",
            "generate_status_report",
        ],
        IntentType.COVERAGE_ANALYSIS: [
            "fetch_inventory_snapshot",
            "fetch_in_transit",
            "compute_demand_forecast",
            "compute_coverage_days",
            "identify_risks",
            "generate_coverage_report",
        ],
        IntentType.REPLENISHMENT_PLAN: [
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2509.03811，但该号在 arXiv 上是《Rethinking Supply Chain Planning: A Generative Paradigm》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：ERP 库存数据 API、销售预测服务、供应商档案数据库，以及用于长期记忆的历史决策记录与用户自然语言请求。

**输出**：结构化 Markdown 规划报告（库存健康、断货风险、呆滞库存）、行动建议与草案 PO，供运营主管一键确认。

## 执行步骤

1. 识别用户意图对应的规划分析类型
2. 调用 ERP、预测与供应商档案数据
3. 生成库存健康与风险结构化报告
4. 输出补货草案与行动建议供确认

## 边界与不做

- 何时不用：需要多智能体端到端自动补货链路时用多Agent供应链端到端自动化；只需计算缺口分配优先级时用供需缺口分析与优先级分配。
- 能力边界：产出报告、建议与草案，正式发 PO、改价等写操作须人工确认，工具函数需自行接入 ERP API。
- 数据边界：ERP/WMS 接口未接入时只能用模拟数据演示；历史决策库缺失会影响相似场景的推荐质量。

## 技能关联

- **前置**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine、Skill-Supply-Chain-KPI-Health-Dashboard.html、Skill-Supply-Chain-KPI-Health-Dashboard、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **延伸**：Skill-LLM-SC-MultiAgent-Consensus-Replenishment.html、Skill-LLM-SC-MultiAgent-Consensus-Replenishment、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SC-WhatIf-Scenario-Analysis-Engine.html、Skill-SC-WhatIf-Scenario-Analysis-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-SCPA-Autonomous-SC-Planning-Agent

---

> 分类：业务运营/供应与履约/供需协调　·　技术族：16-智能体工程　·　源卡：`Skill-SCPA-Autonomous-SC-Planning-Agent`