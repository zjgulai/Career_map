---
name: "p2s-supply-chain-finance-risk-tag"
title: "供应链金融风险标签 — 融资依赖度/信用评级/现金流压力的综合风险画像"
description: "触发词：供应链金融风险、融资依赖度、信用评级、现金流压力、资金链预警。何时不用：做供应商三维合规尽调时用供应链合规尽职调查；做供应商多维断供风险评分时用供应商风险评分。安全边界：财务数据仅限授权人员访问并按需脱敏，不得用于对外信用承诺或替代正式尽职调查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supply-Chain-Finance-Risk-Tag"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给品牌与供应商打金融风险标签，从流动性、杠杆和现金流三个角度提前几个月预警资金链问题。"
whenToUse: "需要提前 3-6 个月识别供应商或自身资金链压力并生成预警标签时用本技能；合规层面尽调用供应链合规尽职调查，供应商综合风险评分用供应商风险评分。"
workflow: "录入主体财务指标（现金、应收、库存、短期负债、总资产、月收入与成本） → 计算流动性、融资依赖与现金流压力分项评分 → 汇总为综合风险画像并生成预警标签"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链金融风险标签 — 融资依赖度/信用评级/现金流压力的综合风险画像

## ① 解决的问题

CFO面临"不知道供应商是否面临资金链断裂风险"——金融风险三维画像（流动性/杠杆/现金）提前3-6个月预警，防止供应商断供损失20-50万元

## ② 核心算法逻辑

供应链金融风险标签 将财务脆弱性量化为可查询的Tag，在现金流危机前触发预警和主动干预。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：供应商金融风险高预警可提前3-6个月准备备用供应商，防止供应商资金链断裂导致的断供（每次约20-50万元损失）；品牌自身金融风险监控防止现金流危机，及时融资
实施难度：⭐⭐⭐☆☆（数据来源：财务系统，计算逻辑清晰）
优先级评分：⭐⭐⭐⭐☆（2024-2025年多家中小跨境卖家因现金流管理失败倒闭，金融风险是生死线）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（70 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/supply_chain_finance_risk_tag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Supply-Chain-Finance-Risk-Tag.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链金融风险标签系统
功能：流动性评分 / 融资风险评估 / 综合风险画像 / 预警Tag生成
"""
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class FinancialMetrics:
    entity_id: str
    entity_type: str        # Brand / Supplier
    cash_usd: float
    accounts_receivable_usd: float
    inventory_value_usd: float
    current_liabilities_usd: float
    short_term_debt_usd: float
    total_assets_usd: float
    monthly_revenue_usd: float
    monthly_cogs_usd: float


def compute_finance_risk_tags(metrics: FinancialMetrics) -> dict:
    """计算供应链金融风险标签"""
    # 流动性指标
    current_assets = metrics.cash_usd + metrics.accounts_receivable_usd + metrics.inventory_value_usd
    current_ratio = current_assets / max(1, metrics.current_liabilities_usd)
    quick_ratio = (metrics.cash_usd + metrics.accounts_receivable_usd) / max(1, metrics.current_liabilities_usd)
    cash_coverage_days = metrics.cash_usd / max(1, metrics.monthly_cogs_usd / 30)

    # 融资依赖度
    leverage_ratio = metrics.short_term_debt_usd / max(1, metrics.total_assets_usd)

    # 风险等级
    liquidity_risk = "CRITICAL" if quick_ratio < 0.5 else ("HIGH" if quick_ratio < 1.0 else "LOW")
    leverage_risk = "HIGH" if leverage_ratio > 0.4 else ("MEDIUM" if leverage_ratio > 0.2 else "LOW")
    cash_risk = "CRITICAL" if cash_coverage_days < 7 else ("HIGH" if cash_coverage_days < 14 else "LOW")

    overall_risk = "CRITICAL" if "CRITICAL" in [liquidity_risk, cash_risk] else (
        "HIGH" if "HIGH" in [liquidity_risk, leverage_risk, cash_risk] else "MEDIUM")

    return {
        "finance.liquidity_risk": liquidity_risk,
        "finance.leverage_risk": leverage_risk,
        "finance.cash_risk": cash_risk,
        "finance.overall_risk": overall_risk,
        "finance.current_ratio": round(current_ratio, 2),
        "finance.quick_ratio": round(quick_ratio, 2),
        "finance.cash_coverage_days": round(cash_coverage_days, 0),
        "finance.leverage_ratio": round(leverage_ratio, 2),
        "finance.procurement_approval_required": overall_risk in ["CRITICAL", "HIGH"],
    }


if __name__ == "__main__":
    print("【供应链金融风险标签系统】\n")
    entities = [
        FinancialMetrics("MCC-Brand", "Brand", 50_000, 120_000, 300_000, 150_000, 80_000, 500_000, 500_000, 300_000),
        FinancialMetrics("SUP-SZ", "Supplier", 10_000, 30_000, 80_000, 120_000, 100_000, 200_000, 100_000, 70_000),
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.11234。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：品牌或供应商的财务指标：现金、应收账款、库存价值、流动负债、短期债务、总资产、月收入与月销货成本，以及主体标识与类型。

**输出**：金融风险标签与综合风险画像（流动性评分、融资风险评估、预警等级），供财务负责人与供应链负责人做备选供应商准备与融资决策。

## 执行步骤

1. 整理主体财务指标并按统一口径录入
2. 计算流动性、杠杆与现金流压力分项得分
3. 汇总综合风险画像并生成预警标签

## 边界与不做

- 何时不用：做劳工环境产品三维合规尽调时用供应链合规尽职调查；做供应商交期与质量多维风险评分时用供应商风险评分。
- 能力边界：输出财务风险标签与预警，不构成信用评级、授信建议或审计意见。
- 数据边界：财务数据口径不一致或缺失时标签会失真，需以经审计报表或财务系统字段为准。

## 技能关联

- **前置**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Working-Capital-Optimization.html、Skill-Supply-Chain-Working-Capital-Optimization
- **延伸**：Skill-Dynamic-Payment-Terms-Tag-Engine.html、Skill-Dynamic-Payment-Terms-Tag-Engine、Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]
- **可组合**：Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Finance-Risk-Tag

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：24-标签工程　·　源卡：`Skill-Supply-Chain-Finance-Risk-Tag`