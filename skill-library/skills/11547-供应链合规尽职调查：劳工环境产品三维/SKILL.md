---
name: "p2s-supply-chain-due-diligence"
title: "Supply Chain Due Diligence — 供应链合规尽职调查：劳工+环境+产品三维"
description: "触发词：合规尽调、劳工合规、环境合规、供应商合规评估、季度重评。何时不用：只做供应商财务与信用风险画像时用供应链金融风险标签；只做新供应商准入门槛与证书到期预警时用供应商准入认证KPI。安全边界：尽调结论须留存评分记录供审计追溯；发现被处罚或列入黑名单的供应商必须转人工处置，不得自动放行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supply-Chain-Due-Diligence"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "按劳工、环境、产品三个维度给供应商做合规尽调，新供应商入库和季度复评都有据可查。"
user_try: "试试：用供应商自报信息和第三方审计报告，给这家新供应商出三维合规结论并标出红灯项。"
whenToUse: "新供应商准入需要客观合规结论，或在用供应商需要季度合规重评与告警时用本技能；只做供应商财务与信用风险时用供应链金融风险标签。"
workflow: "汇总供应商自报信息与第三方审计报告 → 按劳工、环境、产品三维逐项核对并给出绿黄红分级 → 对红灯项输出阻断结论与整改要求 → 按季度自动重评在用供应商并触发告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Due Diligence — 供应链合规尽职调查：劳工+环境+产品三维

## ① 解决的问题

供应链负责人面临供应商尽调慢——尽调流程将风险漏检率从16%降到3%，年化省17万元

## ② 核心算法逻辑

论文：ESGSCORE: A MultiDimensional Compliance Scoring Framework for Supply Chain Due Diligence | 年份：2023

## ③ 业务应用场景

- 业务问题：新供应商申请进入合格供应商名单，需要客观、标准化地评估其合规状态，避免"凭感觉"或"关系"决策。 - 系统输入：供应商自报信息 + 第三方审计报告 - 自动输出： - 业务价值：供应商准入决策有据可查，避免"人情供应商"风险，合规供应商入库率从 70% 提升至 95%
场景二：WF-A 补货供应商风险监控（定期重评）
- 业务问题：在用供应商的合规状态可能随时间变化（认证到期/被处罚/列入黑名单），需要定期自动重评。 - 系统处理：每季度自动重新评估所有在用供应商： - 业务价值：供应商合规风险降低 70%（主动监控 vs 被动等投诉）；避免因供应商问题导致的平台处罚

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

合规风险降低：供应商合规风险降低 70%（系统性评估 vs 随机检查）
决策可审计：每次评分留存记录，供审计和零售商合规要求使用
自动化监控：季度重评自动触发告警，从被动应对到主动管控
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（214 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/compliance/supply_chain_due_diligence` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Supply-Chain-Due-Diligence.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Supply-Chain-Due-Diligence
供应链合规尽职调查：劳工+环境+产品三维评估
基于 LkSG 2023 + ESG 合规 + 供应链尽职调查最佳实践
纯 Python 标准库，Python 3.14 兼容，无第三方依赖
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class RiskLevel(Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"
    BLOCKED = "blocked"


@dataclass
class SupplierProfile:
    supplier_id: str
    name: str
    country: str
    # 劳工维度
    labor_cert: Optional[str] = None
    labor_cert_valid: bool = False
    wage_ratio_to_minimum: float = 1.0
    max_weekly_hours: float = 60.0
    uflpa_listed: bool = False
    # 环境维度
    env_cert: Optional[str] = None
    env_cert_valid: bool = False
    has_carbon_data: bool = False
    wastewater_compliant: bool = True
    # 产品认证维度
    product_certs: list[str] = field(default_factory=list)
    product_certs_valid: bool = False
    factory_audit_pass_rate: float = 1.0


class LaborComplianceChecker:
    def score(self, profile: SupplierProfile) -> tuple[float, list[str]]:
        score = 100.0
        notes: list[str] = []
        if profile.uflpa_listed:
            return 0.0, ["⛔ 列入 UFLPA 禁止采购名单，一票否决"]
        if not profile.labor_cert_valid:
            score -= 25
            notes.append(f"- {profile.labor_cert or '劳工认证'} 已过期或缺失")
        if profile.wage_ratio_to_minimum < 1.0:
            score -= 20
            notes.append(f"- 工资低于最低工资标准（比率: {profile.wage_ratio_to_minimum:.1%}）")
        elif profile.wage_ratio_to_minimum >= 1.4:
            notes.append(f"+ 工资高于最低工资标准 {(profile.wage_ratio_to_minimum-1):.0%}")
        if profile.max_weekly_hours > 60:
            score -= 10
            notes.append(f"- 工时超标（{profile.max_weekly_hours:.0f}h/周 > 60h）")
        if profile.labor_cert_valid:
            notes.append(f"+ 持有 {profile.labor_cert} 认证（有效期内）")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《ESGSCORE: A MultiDimensional Compliance Scoring Framework for Supply Chain Due Diligence》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商自报合规信息（劳工证书、工资工时、环境许可、产品合规文件）与第三方审计报告，以及供应商标识与国别信息。

**输出**：三维合规评分与绿/黄/红/阻断分级结论、可审计的评分留存记录与季度重评告警，供准入决策与合规审计使用。

## 执行步骤

1. 收集供应商自报信息与第三方审计报告
2. 按劳工、环境、产品维度逐项核对打分
3. 输出风险分级与阻断或整改结论
4. 季度重评在用供应商并触发风险告警

## 边界与不做

- 何时不用：只评估供应商资金链与信用风险时用供应链金融风险标签；只做准入打分与证书到期预警时用供应商准入认证KPI。
- 能力边界：基于供应商自报与第三方报告做规则化评分，不替代现场审核与法务判断，红灯结论需人工复核。
- 数据边界：缺少有效审计报告或自报字段大面积缺失时，结论只能标记为待补充资料。

## 技能关联

- **前置**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **延伸**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution
- **可组合**：Skill-AgenticPay-Procurement-Negotiation.html、Skill-AgenticPay-Procurement-Negotiation、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Due-Diligence

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：21-合规决策　·　源卡：`Skill-Supply-Chain-Due-Diligence`