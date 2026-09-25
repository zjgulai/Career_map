---
name: "p2s-agentic-pnl-analyst"
title: "Agent 驱动的 P&L 归因分析 — SKU 级成本拆解"
description: "触发词：SKU 级 P&L、成本拆解、异常成本项、盈亏拐点、大促利润诊断。何时不用：要多 Agent 分部门做月末责任归因用「多智能体 P&L 协同」；要按费用层级看单品盈利结构用「ASIN 盈利瀑布」。安全边界：模型只给分析建议不做财务决策；财务数据须审计留痕且禁止向外部系统传输。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 月度经营复盘"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Agentic-PnL-Analyst"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "30 分钟把每个 SKU 的成本拆开、排出利润榜，定位拖累整体的大促亏损款和新品盈亏拐点。"
user_try: "试试：拆解 618 大促后各 SKU 的成本与利润，排出利润排行榜并定位亏损前三的 SKU 和异常成本项。"
whenToUse: "需要 SKU 级成本拆解与偏差定位（含大促复盘、新品回本预测）时用本技能；多 Agent 分部门归因用「多智能体 P&L 协同」；逐层瀑布看结构用「ASIN 盈利瀑布」。"
workflow: "汇总期间每个 SKU 的销售额、COGS、FBA 费、广告费与退货数据 → 按成本项与行业基准比对，标记偏差超过 20% 的异常项 → 输出 SKU 级利润排行榜并定位前三名亏损 SKU → 对新品按周分阶段追踪并外推盈亏拐点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Agent 驱动的 P&L 归因分析 — SKU 级成本拆解

## ① 解决的问题

财务团队面临"SKU级P&L拆解耗时3天且人工汇总容易出错"——Agent驱动P&L归因分析将SKU级成本拆解时间从3天压缩至30分钟，年化节省财务分析人力成本20-35万元

## ② 核心算法逻辑

传统 P&L 分析停留在品类或月度层面，无法精准定位哪个 SKU 在哪个成本维度亏损。Agentic P&L 分析通过多工具协作实现 SKU 级归因：

## ③ 业务应用场景

场景1：大促后 SKU 利润异常诊断 - 业务问题：618 大促结束后发现整体利润低于预期 15%，但不知道哪个 SKU 拖累了整体 - 数据要求：大促期间每个 SKU 的销售额、COGS、FBA 费用、广告费、退货数据 - 预期产出：2 分钟内输出 SKU 级利润排行榜 + 异常成本项归因，定位 Top-3 亏损 SKU - 业务价值：快速识别出"退货率 18% 的婴儿座椅"是拖累元凶，及时停止广告投放，避免持续亏损
场景2：新品上线 90 天 P&L 追踪 - 业务问题：新品冷启期广告投入大，但不清楚哪个阶段开始盈利、广告 ACOS 是否合理 - 数据要求：按周维度的 SKU 收入/成本数据，分阶段追踪（冷启期/成长期/成熟期） - 预期产出：每周自动生成 P&L 周报，含盈亏拐点预测（基于当前趋势线性外推） - 业务价值：提前 2-4 周预警资金压力，指导广告策略调整
**三轨验证**： - 成本：每次分析约消耗 5K-20K tokens，成本 $0.05-0.20 - 合规：财务数据属于高度敏感信息，Agent 结果需记录审计日志，禁止向外部系统传输 - 风险：LLM 不应直接作出财务决策，仅提供分析建议，最终决策由人工审核

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：P&L 分析时间从 2-4 小时降至 5 分钟；及时发现亏损 SKU 后调整策略，年化避损约 30-100 万元（取决于 GMV 规模）
实施难度：⭐⭐⭐⭐☆（数据整合复杂，各平台成本数据格式不统一）
优先级：⭐⭐⭐⭐⭐（利润管理是跨境电商核心，最高优）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（171 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Agentic P&L 归因分析
依赖：dataclasses, typing（标准库）
"""
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SKUCostData:
    sku_id: str
    revenue: float
    cogs: float
    fba_fee: float
    ad_spend: float
    return_cost: float
    storage_fee: float
    other_cost: float = 0.0

    @property
    def total_cost(self) -> float:
        return self.cogs + self.fba_fee + self.ad_spend + self.return_cost + self.storage_fee + self.other_cost

    @property
    def gross_profit(self) -> float:
        return self.revenue - self.total_cost

    @property
    def gross_margin(self) -> float:
        return self.gross_profit / self.revenue if self.revenue > 0 else 0.0


@dataclass
class CostAttribution:
    sku_id: str
    gross_margin: float
    cost_breakdown: dict  # {cost_item: {amount, pct_of_revenue, deviation_pct}}
    anomalies: list[str]
    recommendation: str
    risk_level: str  # "high/medium/low"


class AgenticPnLAnalyst:
    """Agent 驱动的 P&L 归因分析器"""

    # 各成本项的行业基准占收入比（母婴跨境电商）
    BENCHMARKS = {
        "cogs": 0.35,        # 成本占收 35%
        "fba_fee": 0.15,     # FBA 费用 15%
        "ad_spend": 0.12,    # 广告费 12%
        "return_cost": 0.05, # 退货成本 5%
        "storage_fee": 0.02, # 仓储费 2%
    }
    ANOMALY_THRESHOLD = 0.20  # 偏差 >20% 触发异常

    def _analyze_cost_item(
        self, item: str, amount: float, revenue: float, benchmark: float
    ) -> dict:
        pct_of_revenue = amount / revenue if revenue > 0 else 0.0
        deviation = (pct_of_revenue - benchmark) / benchmark if benchmark > 0 else 0.0
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：期间内每个 SKU 的收入与成本数据：销售额、COGS、FBA 费用、广告费、退货数据与仓储费；大促场景覆盖促销期，新品场景需按周维度。

**输出**：SKU 级利润排行榜、异常成本项归因（含偏差比例与建议）、亏损 SKU 清单与新品盈亏拐点预测，供经营复盘使用。

## 执行步骤

1. 采集期间各 SKU 的收入与成本项
2. 按成本项与基准比对标记偏差异常
3. 输出 SKU 利润排行榜与亏损定位
4. 对新品做分阶段跟踪并外推盈亏拐点
5. 给出停投、调价或继续追踪的建议

## 边界与不做

- 各平台成本数据格式不统一、成本项缺失时不适用，SKU 级拆解会失真
- 只提供分析建议，不直接作财务决策，结论需人工审核
- 财务数据属高敏信息，须记录审计日志，禁止向外部系统传输

## 技能关联

- **可组合**：Skill-Agentic-PnL-Analyst

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Agentic-PnL-Analyst`