---
name: "p2s-llm-financial-report-analyst"
title: "LLM Financial Report Analyst — 迭代精化 + 代码验证的智能财务报告解读"
description: "触发词：财务报告解读、多平台汇总、数值验证、三层归因、账单口径对齐。何时不用：要多 Agent 分工做部门责任归因用「多智能体 P&L 协同」；要标准化月度归因报告叙事用「多步推理 BI 归因」。安全边界：财务数据外发前须脱敏，敏感数据禁止传输外部系统；数值须经代码验证并留审计日志，模型不直接下财务结论。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-125"
l3_business: "税务资料"
l3_all: "税务资料 / 收入与费用核对 / 经济性分析"
l1_l2_l3: "独立控制/财务与合规/税务资料"
p2s_card_id: "Skill-LLM-Financial-Report-Analyst"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "把 Amazon、广告和头程三处账单自动汇总成月度 P&L，每一步数字都用代码复算并标注出处，误差率压到 2% 以内。"
user_try: "试试：把 Amazon 结算报告、TikTok 广告导出和头程发票汇总成本月 P&L，每步数值都复算并标出引用行号。"
whenToUse: "需要跨平台账单归一化并对每个数值做代码验证时用本技能；多 Agent 分部门做归因用「多智能体 P&L 协同」；标准化叙事报告用「多步推理 BI 归因」。"
workflow: "识别各平台数据格式并归一化到统一财务记录 → 把问题拆成可计算的子查询，例如本月广告 ROAS → 用代码逐步验证每个数值计算 → 输出三层归因结果并引用原始数据行号"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Financial Report Analyst — 迭代精化 + 代码验证的智能财务报告解读

## ① 解决的问题

跨境母婴 CFO 面临 Amazon/TikTok/银行三平台账单手工汇总需 3 天——迭代精化 + Python 数值验证 Agent 将月度 P&L 汇总压缩至 30 分钟，误差率从手工 5-10% 降至 <2%，年化节省财务人力成本 10-30 万元

## ② 核心算法逻辑

核心问题：LLM 做财务数值计算时容易"幻觉"——看起来正确但数字偏差 530%，根本原因是 LLM 把文本推理和数值计算混在一起处理。

## ③ 业务应用场景

场景 A：跨平台 P&L 30 分钟汇总（Momcozy 月度财务）
- 业务问题：Amazon 账单（FBA 费/退款/平台佣金）+ TikTok 广告账单 + 头程发票分散三处，财务手工汇总需 3 天，数据口径不统一（USD/CNY 汇率、退货时间匹配） - 数据要求：Amazon Settlement Report（CSV）、TikTok Ads Manager 导出（JSON）、货代头程发票（PDF，可 OCR）、银行流水（CSV） - 处理流程：LLM Agent 自动识别各平台数据格式 → Query 分解（"本月广告 ROAS"拆为：提取广告花费 + 提取归因收入 + 计算比率）→ Python 验证每步数值 → 三层归因输出（引用原始数据行号） 
场景 B：FBA 费用异常归因（涨费预警）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：财务汇总工作量 3 天→30 分钟（提效 97%），节省财务专员 1.5 人月/月，年化人力成本节省 10-30 万元；数值误差率从手工的 5-10% 降至 <2%，避免税务和对账风险
实施难度：⭐⭐⭐☆☆（主要挑战：各平台数据格式解析和字段口径对齐）
优先级：⭐⭐⭐⭐⭐（财务合规硬需求，直接影响决策质量，可立即产生 ROI）
适用规模：月销 50 万 USD 以上的卖家开始体现价值；月销 200 万 USD 以上的团队，财务自动化投资回报率 >10x

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（461 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_agent_llm/llm_financial_report_analyst` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-LLM-Financial-Report-Analyst.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Financial Report Analyst
实现三层归因 + Python 数值验证的财务分析 Agent
支持 Mock LLM 模式（无需真实 API key 也能测试逻辑）
"""

import json
import ast
import re
from dataclasses import dataclass, field
from typing import Any


# ─────────────────────────────────────────
# 0. 数据结构
# ─────────────────────────────────────────

@dataclass
class FinancialRecord:
    """统一财务记录（多平台归一化后格式）"""
    platform: str        # amazon / tiktok / freight / bank
    record_type: str     # revenue / ad_spend / fba_fee / freight / refund
    sku: str
    amount_usd: float
    date: str
    metadata: dict = field(default_factory=dict)


@dataclass
class AttributionResult:
    """三层归因结果"""
    answer: float | str
    evidence: list[str]          # 证据层：引用原始数据
    domain_rules: list[str]      # 领域知识层：财务规则
    computation_code: str        # 计算层：Python 代码
    computation_result: float | None
    confidence: float            # 0-1
    verified: bool               # Python 验证是否通过


# ─────────────────────────────────────────
# 1. 多平台数据加载器
# ─────────────────────────────────────────

class MultiPlatformLoader:
    """加载并归一化多平台财务数据"""

    def load_amazon_settlement(self, data: list[dict]) -> list[FinancialRecord]:
        records = []
        for row in data:
            record_type = self._map_amazon_type(row.get("type", ""))
            if record_type:
                records.append(FinancialRecord(
                    platform="amazon",
                    record_type=record_type,
                    sku=row.get("sku", "UNKNOWN"),
                    amount_usd=float(row.get("amount", 0)),
                    date=row.get("settlement_start_date", ""),
                    metadata={"order_id": row.get("order_id", ""), "description": row.get("description", "")}
                ))
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.06426 — FinLFQA: Evaluating Attributed Text Generation of LLMs in Financial Long-Form Question Answering

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：Amazon Settlement Report（CSV）、TikTok Ads Manager 导出（JSON）、货代头程发票（PDF，可 OCR）、银行流水（CSV），需先统一币种与退货时间匹配口径。

**输出**：月度 P&L 汇总与三层归因结果（答案、证据引用行号、领域规则、计算代码与验证状态），供财务与管理层复盘使用。

## 执行步骤

1. 识别并归一化各平台账单格式
2. 把财务问题拆解为可计算子查询
3. 用代码复算每步数值并保留代码
4. 输出三层归因结果并引用原始数据行号
5. 标记验证未通过的条目交人工复核

## 边界与不做

- 账单格式缺失或字段口径无法对齐时不适用，归一化后的金额不可比
- 模型只负责拆解与叙事，数值必须由代码验证，未通过验证的结论不得使用
- 财务数据外发前须脱敏，敏感数据不得传输外部系统，输出须保留审计日志

## 技能关联

- **前置**：Skill-Agent-Finance-Autopilot.html、Skill-Agent-Finance-Autopilot、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Agent-Finance-Autopilot.html、Skill-Agent-Finance-Autopilot、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution
- **可组合**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-KG-Supply-Chain-Cost-Attribution.html、Skill-KG-Supply-Chain-Cost-Attribution、Skill-LLM-Financial-Report-Analyst

---

> 分类：独立控制/财务与合规/税务资料　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Financial-Report-Analyst`