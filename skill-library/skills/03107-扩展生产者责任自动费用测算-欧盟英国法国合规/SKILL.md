---
name: "p2s-epr-auto-calculator"
title: "EPR扩展生产者责任自动费用测算 — 欧盟/英国/法国合规"
description: "触发词：EPR 费用测算、包装申报、德国 VerpackG、法国 CITEO、英国 PPT。何时不用：要做 VAT/GST 税率分类与申报用「VAT/GST 申报自动化」；要监控税务阈值与申报义务用「税务风险信号监控」。安全边界：费率表与注册截止日期须以官方系统为准，测算结果不构成申报承诺；不得漏报或低报包装投放量。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-127"
l3_business: "申报协作"
l3_all: "申报协作 / 产品准入核对"
l1_l2_l3: "独立控制/财务与合规/申报协作"
p2s_card_id: "Skill-EPR-Auto-Calculator"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按包装材质和克重自动测算德国、法国、英国的 EPR 费用，出季度申报数据和年度费用预测，避免漏报罚款。"
user_try: "试试：按包装 BOM 和月销量测算德国 VerpackG 与法国 CITEO 的季度 EPR 费用，并给出换材质的节省测算。"
whenToUse: "需要按包装材质与市场测算 EPR 申报费用和最优包材时用本技能；做 VAT/GST 税率分类与申报用「VAT/GST 申报自动化」；监控税务阈值与注册义务用「税务风险信号监控」。"
workflow: "整理包装 BOM 的材质与克重、各市场月销量 → 按市场费率表、可回收性系数与起征阈值计算单品 EPR 费用 → 按季度汇总投放量生成申报数据表与填报模板 → 对比材质方案输出包材优化与年度费用预测"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# EPR扩展生产者责任自动费用测算 — 欧盟/英国/法国合规

## ① 解决的问题

合规团队面临"进入欧盟市场手动计算EPR费用耗时且错误率高"——EPR费用自动测算将计算错误率从12%降至0.5%且节省90%人工时，年化节省合规运营成本15-25万元

## ② 核心算法逻辑

扩展生产者责任（EPR, Extended Producer Responsibility）要求向欧盟/英国销售的品牌商承担包装废弃物回收费用。主要制度包括：德国 VerpackG（Lucid 注册）、法国 REP（CITEO）、英国 PPT（Plastic Packaging Tax）、欧盟 PPWD（包装与包装废弃物指令）修订版（2024 正式实施）。

## ③ 业务应用场景

场景1：德国 Amazon.de 婴儿奶粉月均 1 万罐 EPR 申报 - 业务问题：奶粉铁罐+纸盒包装，Lucid 注册后需按季度申报包装投放量，不申报罚款高达 €200,000 - 数据要求：包装 BOM 表（材质+克重）+ 月销量 + 产品 ASIN 清单 - 预期产出：季度 EPR 申报数据表 + Lucid 系统填报模板 + 年度费用预测 - 业务价值：准确测算避免罚款，费率优化（材质切换）年化可节省包材成本 8–15 万元
场景2：法国+英国双市场婴儿玩具 EPR 综合测算 - 业务问题：CITEO 费率和英国 PPT 费率计算逻辑完全不同，手工计算错误率高 - 数据要求：产品包装明细 + 各市场销量 + 包材供应商材质证明 - 预期产出：双市场 EPR 费用对比报表 + 注册合规状态 + 最优包材建议
**三轨验证**：成本（精准测算避免多缴）/ 合规（各市场注册截止日期提醒）/ 风险（漏报罚款风险 → 接近零）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：德国 VerpackG 漏报罚款最高 €200,000；精准测算可避免多缴，平均节省 15–30%；年销 10 万件以上品牌年化收益约 10–25 万元
实施难度：⭐⭐⭐☆☆（费率表需年度更新，包装 BOM 数据需与供应链系统对接）
优先级：⭐⭐⭐⭐⭐（欧盟 PPWD 2024 正式生效，违规封号风险极高）
评估依据：EPR 已从可选合规项变为欧洲市场准入硬门槛，且费率逐年提升（2025 德国塑料费率上调 12%），提早建立自动化测算体系是规模化扩张的必要条件。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（177 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import Optional

# 各市场 EPR 费率表（€ 或 £ per kg，2024年参考值）
EPR_RATES: dict[str, dict[str, float]] = {
    "DE": {  # 德国 VerpackG，通过 DSD 等系统
        "paper_cardboard": 0.38,
        "plastic": 1.24,
        "glass": 0.12,
        "aluminum": 0.95,
        "composite": 1.45,
    },
    "FR": {  # 法国 CITEO REP
        "paper_cardboard": 0.25,
        "plastic": 1.10,
        "glass": 0.08,
        "aluminum": 0.80,
        "composite": 1.30,
    },
    "UK": {  # 英国 PPT（仅适用塑料，£0.2327/kg，2024）
        "paper_cardboard": 0.0,
        "plastic": 0.2327,  # GBP
        "glass": 0.0,
        "aluminum": 0.0,
        "composite": 0.15,  # 混合含塑料估算
    },
    "NL": {
        "paper_cardboard": 0.30,
        "plastic": 1.15,
        "glass": 0.10,
        "aluminum": 0.85,
        "composite": 1.35,
    },
}

# 可回收性系数（越高=费率折扣越大）
RECYCLABILITY_FACTOR: dict[str, float] = {
    "paper_cardboard": 0.85,
    "plastic": 0.45,
    "glass": 0.90,
    "aluminum": 0.92,
    "composite": 0.20,
}

# 各市场起征阈值（年度投放量，kg）
EPR_THRESHOLDS: dict[str, float] = {
    "DE": 0.0,   # 无免征
    "FR": 5.0,   # 5 kg 以下免征
    "UK": 10_000.0,  # 10 吨以下免征 PPT
    "NL": 0.0,
}


@dataclass
class PackagingComponent:
    name: str
    material: str  # paper_cardboard / plastic / glass / aluminum / composite
    weight_grams: float  # 单件包装重量（克）
    layer: str  # primary / secondary / transport
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：包装 BOM 表（材质与克重）、月度销量与产品 ASIN 清单；法国与英国场景还需包材供应商材质证明。

**输出**：季度 EPR 申报数据表与注册系统填报模板、双市场费用对比报表、注册合规状态与最优包材建议，供合规团队申报使用。

## 执行步骤

1. 整理包装 BOM 的材质与克重、月销量和 ASIN 清单
2. 按市场费率表、可回收性系数与起征阈值计算 EPR 费用
3. 按季度汇总包装投放量并生成申报数据表与填报模板
4. 输出费用预测与包材材质切换的节省测算

## 边界与不做

- 拿不到包装 BOM 的材质与克重、或销量未按市场拆分时不适用
- 只产出测算与申报模板，不代替注册与申报动作，也不出具税务或法律意见
- 费率表与截止日期须按官方系统年度核对；漏报存在高额罚款风险，测算结果不能替代申报

## 技能关联

- **可组合**：Skill-EPR-Auto-Calculator

---

> 分类：独立控制/财务与合规/申报协作　·　技术族：21-合规决策　·　源卡：`Skill-EPR-Auto-Calculator`