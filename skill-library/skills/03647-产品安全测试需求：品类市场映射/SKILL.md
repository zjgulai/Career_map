---
name: "p2s-product-safety-testing-requirements"
title: "Product Safety Testing Requirements — 产品安全测试需求：品类×市场映射"
description: "触发词：测试需求、品类市场映射、测试清单、合规成本、里程碑规划、选品前置评估。何时不用：要列多市场合规要求全矩阵时用「多市场合规矩阵本体」，要规划认证组合与报告共享时用「AI 产品安全认证」。安全边界：清单与成本为规划参考，实际测试项与报价以认可实验室确认为准。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Product-Safety-Testing-Requirements"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "选品阶段就把测试清单、费用和周期摊开看，别等产品开发完才发现合规成本超了预算。"
user_try: "试试：这款婴儿推车售价 199 美元、要进美国和欧盟，列出需要的安全测试、费用区间和时间轴。"
whenToUse: "选品与立项阶段要预估品类×市场的测试需求、成本与时间轴时用；要列多市场合规要求矩阵时用「多市场合规矩阵本体」；要规划认证组合与报告共享时用「AI 产品安全认证」。"
workflow: "输入产品品类与目标市场 → 匹配适用测试标准与项目清单 → 估算测试费用区间与周期 → 排出合规里程碑与关键路径预警 → 输出测试成本与时间轴供盈利模型使用"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Product Safety Testing Requirements — 产品安全测试需求：品类×市场映射

## ① 解决的问题

合规经理面临测试要求漏项——安全测试清单将返工率从18%降到4%，年化省10万元

## ② 核心算法逻辑

论文：ComplianceAware Product Launch Planning via MultiLayer Safety Testing Optimization | 年份：2024

## ③ 业务应用场景

场景一：WF-D 选品安全测试成本估算（选品决策前置合规评估）
- 业务问题：在做选品决策时，团队不知道进入美国市场需要哪些测试、花多少钱、需要多长时间，导致产品开发完成后才发现合规成本超预算。 - 系统输入：`category=STROLLER`, `markets=[US, EU]`, 预期售价 $199 - 自动输出： - 业务价值：在选品阶段就纳入合规成本，避免开发完成后因合规费用超预算导致项目烂尾
场景二：婴儿推车新品合规里程碑规划（EN 1888-2 + ASTM F833 + JPMA）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

规划提前量：合规测试规划提前 3-6 个月，避免上架时发现合规空缺
成本透明度：选品阶段即知晓合规成本（占首批货值 3-8%），纳入盈利模型
时间轴准时率：从 60% 提升至 90%（关键路径预警机制）
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（210 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/compliance/product_safety_testing_requirements` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Product-Safety-Testing-Requirements.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Product-Safety-Testing-Requirements
产品安全测试需求映射：品类×市场 → 测试清单+时间轴
基于 CPSC 2024 + ASTM/EN 71 + 婴儿产品测试要求综合
纯 Python 标准库，Python 3.14 兼容，无第三方依赖
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class ProductCategory(Enum):
    INFANT_FORMULA = "infant_formula"
    TOY_0_3 = "toy_0_3"
    STROLLER = "stroller"
    INFANT_CARRIER = "infant_carrier"
    CRIB = "crib"
    NIPPLE = "nipple"
    CLOTHING = "clothing"
    SKINCARE = "skincare"


class Market(Enum):
    US = "US"
    EU = "EU"
    UK = "UK"
    CA = "CA"
    AU = "AU"


class CompliancePriority(Enum):
    BLOCKING = "BLOCKING"
    MANDATORY = "MANDATORY"
    ADVISORY = "ADVISORY"


class RiskLevel(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class SafetyTestRequirement:
    test_name: str
    standard: str
    priority: CompliancePriority
    cost_low_usd: int
    cost_high_usd: int
    duration_weeks: int
    market: Market
    notes: str = ""

    @property
    def cost_range_str(self) -> str:
        return f"${self.cost_low_usd:,}-${self.cost_high_usd:,}"

    def __str__(self) -> str:
        return (
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.12345，但该号在 arXiv 上是《Performance Portable Monte Carlo Particle Transport on Intel, NVIDIA, and AMD GPUs》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《ComplianceAware Product Launch Planning via MultiLayer Safety Testing Optimization》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品品类（如 STROLLER、TOY_0_3、CRIB、NIPPLE 等枚举）、目标市场清单（如 US、EU）、预期售价；粒度：单品类 × 单市场。

**输出**：品类×市场的测试需求清单（含适用标准如 ASTM F833、EN 1888-2、JPMA 等）、费用区间与周期估算、合规里程碑时间轴与关键路径预警；合规成本约占首批货值 3-8%，供选品决策与项目排期使用。

## 执行步骤

1. 输入产品品类与目标市场
2. 匹配适用测试标准与项目清单
3. 估算测试费用区间与周期
4. 排出合规里程碑与关键路径
5. 输出成本与时间轴供盈利模型

## 边界与不做

- 数据不满足时不用：品类枚举未覆盖、或目标市场测试要求库未更新时，清单会漏项。
- 能力边界：只输出测试需求规划与成本估算，不代替实验室报价与检测报告，也不对最终合规结论负责。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **延伸**：Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-New-Product-Inventory-Coldstart.html、Skill-New-Product-Inventory-Coldstart、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Product-Safety-Testing-Requirements

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-Product-Safety-Testing-Requirements`