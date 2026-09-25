---
name: "p2s-supplier-development-roadmap-tracking"
title: "供应商发展路线图追踪 — 改进计划执行跟踪与供应商升降级Tag管理"
description: "触发词：供应商培育、升降级、改进计划、路线图追踪。何时不用：只有一次性评分、缺少月度 KPI 记录时无法判断升降级；一次性选型打分用供应商评估模型类技能。安全边界：升降级结论需与供应商沟通确认，不得仅凭模型结果单方面调整合作条件。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / OEM协作"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Supplier-Development-Roadmap-Tracking"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "按月跟踪供应商 KPI 与改进计划，按阶梯式路线图做升降级与培育动作。"
user_try: "试试：帮我按月跟踪供应商 KPI，判断谁该升级为战略供应商、谁该降级。"
whenToUse: "本卡属「供应商评估」。需要在选型之后持续跟踪改进计划与升降级时用本卡；一次性选型打分用供应商评估模型类技能。"
workflow: "采集供应商月度 KPI → 对照路线图阶段门槛 → 判定升或降级 → 更新标签与培育动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应商发展路线图追踪 — 改进计划执行跟踪与供应商升降级Tag管理

## ① 解决的问题

采购面临"供应商管理只有评分没有培育路径"——阶梯式发展路线图将战略供应商比例从10%提升至25%，年采购降本20-30万元

## ② 核心算法逻辑

供应商发展路线图 将供应商管理从"被动评估"升级为"主动培育"——识别有潜力的供应商，制定改进计划，追踪执行，实现阶梯式升级。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：系统化培育优质供应商，战略级供应商比例从10%提升至25%，年采购成本降低2-3%（约20-30万元）；及时降级不合格供应商，防止质量事故（每次约5-15万元损失）
实施难度：⭐⭐☆☆☆（主要是KPI数据录入和规则配置，技术门槛低）
优先级评分：⭐⭐⭐⭐☆（供应商质量是品牌竞争力的根基，发展路线图是长期供应链优化的引擎）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（89 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/supplier_development_roadmap_tracking` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Supplier-Development-Roadmap-Tracking.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应商发展路线图追踪系统
功能：路线图定义 / KPI追踪 / 升降级判断 / 改进计划管理
"""
from dataclasses import dataclass, field
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

TIER_ORDER = ["NEW", "TRIAL", "QUALIFIED", "PREFERRED", "STRATEGIC"]
UPGRADE_THRESHOLDS = {
    "TRIAL": {"otif": 0.93, "iqc": 0.93, "response": 48},
    "QUALIFIED": {"otif": 0.95, "iqc": 0.95, "response": 24},
    "PREFERRED": {"otif": 0.97, "iqc": 0.97, "response": 12},
}
DOWNGRADE_TRIGGER = {"otif_min": 0.85, "iqc_min": 0.87}


@dataclass
class SupplierMonthlyKPI:
    month: str
    otif_rate: float
    iqc_pass_rate: float
    response_time_hours: float
    major_incidents: int = 0


@dataclass
class SupplierDevelopment:
    supplier_id: str
    name: str
    current_tier: str
    kpi_history: list = field(default_factory=list)  # [SupplierMonthlyKPI]
    development_plan: list = field(default_factory=list)
    tags: dict = field(default_factory=dict)


def evaluate_tier_change(supplier: SupplierDevelopment) -> dict:
    """评估供应商是否应该升降级"""
    if len(supplier.kpi_history) < 3:
        return {"change": "NO_CHANGE", "reason": "数据不足（<3个月）"}

    recent_3m = supplier.kpi_history[-3:]
    avg_otif = sum(k.otif_rate for k in recent_3m) / 3
    avg_iqc = sum(k.iqc_pass_rate for k in recent_3m) / 3
    avg_response = sum(k.response_time_hours for k in recent_3m) / 3
    total_incidents = sum(k.major_incidents for k in recent_3m)

    current_idx = TIER_ORDER.index(supplier.current_tier)

    # 降级检查
    if (avg_otif < DOWNGRADE_TRIGGER["otif_min"] or
            avg_iqc < DOWNGRADE_TRIGGER["iqc_min"] or
            total_incidents >= 2):
        new_tier = TIER_ORDER[max(0, current_idx - 1)]
        return {"change": "DOWNGRADE", "new_tier": new_tier,
                "reason": f"KPI连续不达标: OTIF={avg_otif:.1%} IQC={avg_iqc:.1%} 重大事故={total_incidents}次"}

    # 升级检查
    if current_idx < len(TIER_ORDER) - 1:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.08923，但该号在 arXiv 上是《Towards Informative Few-Shot Prompt with Maximum Information Gain for In-Context Learning》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：供应商月度 KPI 记录（质量、交期、成本、响应等）与既有改进计划所处阶段。

**输出**：供应商升降级判定结果与所属阶段、改进计划执行跟踪状态、战略供应商占比变化，供采购制定培育动作。

## 执行步骤

1. 采集供应商月度 KPI 数据
2. 对照路线图各阶段门槛
3. 判定是否升级或降级并说明依据
4. 更新供应商标签与培育动作
5. 跟踪改进计划执行率与战略供应商占比

## 边界与不做

- 只有一次性评分、缺少月度 KPI 记录时无法判断升降级，不用本卡
- 本卡产出升降级判定与培育建议，不负责商务谈判与合同条款变更
- 升降级结论需与供应商沟通确认，不得仅凭模型结果单方面调整合作条件

## 技能关联

- **前置**：Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supplier-Performance-Scorecard.html、Skill-Supplier-Performance-Scorecard、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI
- **延伸**：Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supplier-Ontology-Capability-Map.html、Skill-Supplier-Ontology-Capability-Map、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI
- **可组合**：Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Supplier-Development-Roadmap-Tracking

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-Supplier-Development-Roadmap-Tracking`