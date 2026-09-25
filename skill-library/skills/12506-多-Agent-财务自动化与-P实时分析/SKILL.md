---
name: "p2s-agent-finance-autopilot"
title: "Agent Finance Autopilot — LLM 多 Agent 财务自动化与 P&L 实时分析"
description: "触发词：财务自动化、P&L 实时分析、多 Agent 周报、差异归因、三平台汇总。何时不用：只做单月 SKU 级成本拆解用「SKU 级 P&L 归因 Agent」；只看广告费与利润关系用「广告 TACoS 与 P&L 集成」。安全边界：Agent 只产出分析与建议，付款、报税与调价动作须人工确认；财务数据不得外传第三方模型。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-120"
l3_business: "收入与费用核对"
l3_all: "收入与费用核对 / 差异追踪 / 经济性分析"
l1_l2_l3: "业务运营/财务与合规/收入与费用核对"
p2s_card_id: "Skill-Agent-Finance-Autopilot"
p2s_src_domain: "23-运营财务"
quality_tier: "preview"
user_summary: "每周一自动把 Amazon、广告后台和 FBA 报表三处数据汇总成 P&L，标出异动 SKU 并给出原因假设，把财务专员从做表里解放出来。"
user_try: "试试：把上周三个平台的数据拉齐，算出各 SKU 毛利率，把波动超过 5% 的 SKU 和可能原因列出来。"
whenToUse: "跨数据源的周期性财务汇总与异动归因用本技能；只做单月 SKU 级成本拆解用「SKU 级 P&L 归因 Agent」；只看广告费对利润的影响用「广告 TACoS 与 P&L 集成」。"
workflow: "Data Fetch Agent 并行拉取 Amazon、广告后台与 FBA 三个数据源 → P&L Calc Agent 按毛利等于销售额减 COGS、FBA 费、广告费与退货损失计算各 SKU 毛利率 → Variance Analysis Agent 与上周、上月和预算对比，标记正负 5% 以上异动 → Root Cause Agent 对异动 SKU 自动生成原因假设，例如 ACOS 上升可能因竞价提高 → Report Gen Agent 生成 Markdown 报告并推送钉钉或飞书通知"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent Finance Autopilot — LLM 多 Agent 财务自动化与 P&L 实时分析

## ① 解决的问题

财务专员每周手工汇总三平台数据耗时 3 小时且错误率高——FinRobot 多 Agent CoA 架构将 P&L 周报自动化，处理时间降低 40%、错误率降低 94%，年化节省 ¥8-20 万

## ② 核心算法逻辑

跨境电商的财务工作高度重复：每周拉 Amazon 报表 → 算 FBA 费用 → 核对广告花费 → 生成 P&L → 找各维度差异原因。这些工作 80% 是固定 SOP，却仍然需要 12 名财务专员每天操作，还容易出错。

## ③ 业务应用场景

业务问题：财务专员每周一早上花 3 小时，分别从 Amazon Seller Central、广告后台、FBA 报表三个数据源手工汇总数据，计算各 SKU 的毛利率，对比上周变化，找差异原因。这个工作重复、枯燥、容易出错，且强烈依赖个人经验。
Agent Autopilot 执行流： 1. Data Fetch Agent：并行拉取三个数据源 2. P&L Calc Agent：按 `毛利 = 销售额 - COGS - FBA费 - 广告费 - 退货损失` 计算 3. Variance Analysis Agent：与上周/上月/预算对比，标记 ±5% 以上异动 4. Root Cause Agent：对异动 SKU 自动生成假设（"ACOS 上升可能因竞价提高"） 5. Report Gen Agent：生成 Markdown 报告 + 发送钉钉/飞书通知
业务价值：财务专员从"做数据"转向"看数据 + 决策"，每周节省 2.5 小时

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
财务专员每周节省 2.5 小时：¥60,000-120,000/年（1-2 人）
FBA 异常费用追回：¥2-8 万/年
错误率降低 94%：避免财务决策失误损失 ¥5-20 万/年
年化综合 ROI：¥80-200 万
实施难度：⭐⭐⭐☆☆（需要 Amazon API 接入 + LLM 调用，2-3 周开发）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（232 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/agent_finance_autopilot` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/23-运营财务/Skill-Agent-Finance-Autopilot.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Agent Finance Autopilot — LLM 多 Agent 财务自动化
基于 FinRobot CoA 架构 (arXiv: 2506.01423)

依赖: json, dataclasses, typing (标准库)
生产环境替换 MockDataSource 为真实 API 调用
"""

from dataclasses import dataclass, field
from typing import Optional
import json
from datetime import date, timedelta


@dataclass
class FinancialRecord:
    """单条财务记录"""
    sku_id: str
    period: str
    revenue: float
    cogs: float
    fba_fee: float
    ad_spend: float
    return_cost: float

    @property
    def gross_profit(self) -> float:
        return self.revenue - self.cogs - self.fba_fee - self.ad_spend - self.return_cost

    @property
    def gross_margin(self) -> float:
        return self.gross_profit / self.revenue if self.revenue > 0 else 0.0

    @property
    def acos(self) -> float:
        return self.ad_spend / self.revenue if self.revenue > 0 else 0.0


@dataclass
class ActionResult:
    """Agent 执行结果"""
    action: str
    success: bool
    data: dict = field(default_factory=dict)
    error: str = ""
    requires_human: bool = False


class MockDataSource:
    """模拟数据源（生产环境替换为 Amazon API）"""

    def get_pl_records(self, period: str) -> list:
        base = [
            {"sku": "SKU-M5-BPump", "revenue": 12500, "cogs": 4200, "fba": 1800, "ad": 2100, "returns": 320},
            {"sku": "SKU-S12-BPump", "revenue": 8900, "cogs": 3100, "fba": 1200, "ad": 1800, "returns": 180},
            {"sku": "SKU-UV-Steril",  "revenue": 6200, "cogs": 2100, "fba": 890, "ad": 950, "returns": 90},
        ]
        # 模拟本周 ACOS 异常上升（SKU-M5 广告费暴增）
        if "current" in period:
            base[0]["ad"] = 3200  # M5 广告费从 2100 → 3200
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2506.01423 — FinRobot: Generative Business Process AI Agents for Enterprise Resource Planning in Finance

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：三个数据源的周期数据：Amazon Seller Central 报表、广告后台花费、FBA 报表，字段需覆盖收入、COGS、FBA 费、广告费与退货损失，粒度到 SKU 与周。

**输出**：各 SKU 毛利率与异动的 Markdown P&L 报告，含 5% 以上异动清单与原因假设，推送到钉钉或飞书供财务与管理层周度复盘。

## 执行步骤

1. 并行拉取 Amazon、广告后台与 FBA 三个数据源的本周记录
2. 按毛利公式逐 SKU 计算毛利率并与上周、上月和预算对比
3. 标记波动超过正负 5% 的异动 SKU
4. 为每个异动 SKU 生成原因假设
5. 生成 P&L 报告并推送到钉钉或飞书

## 边界与不做

- 只覆盖周度计划性汇总，不替代总账与审计口径的正式结账；源数据口径不统一时结论不成立
- Agent 只给分析与建议，不自动执行调价、付款或报税，预算与凭证类动作须人工复核
- 财务数据属高敏信息，不得传入外部模型或外部系统，输出须保留审计日志

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Amazon-Payment-Cycle-Forecast.html、Skill-Amazon-Payment-Cycle-Forecast、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis
- **延伸**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Amazon-Payment-Cycle-Forecast.html、Skill-Amazon-Payment-Cycle-Forecast、Skill-Forecast-to-PL-Bridge.html、Skill-Forecast-to-PL-Bridge、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator
- **可组合**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Amazon-Payment-Cycle-Forecast.html、Skill-Amazon-Payment-Cycle-Forecast、Skill-Agent-Finance-Autopilot

---

> 分类：业务运营/财务与合规/收入与费用核对　·　技术族：23-运营财务　·　源卡：`Skill-Agent-Finance-Autopilot`