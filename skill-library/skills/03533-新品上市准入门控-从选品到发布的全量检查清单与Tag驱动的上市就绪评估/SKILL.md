---
name: "p2s-new-sku-launch-readiness-gate"
title: "新品上市准入门控 — 从选品到发布的全量检查清单与Tag驱动的上市就绪评估"
description: "触发词：上市门控、就绪评分、五维检查、阻塞项、上新清单、Tag 驱动评估。何时不用：只想按合规分阈值自动阻断时用「上架前合规门控」，要按品类×市场列测试需求时用「产品安全测试需求映射」。安全边界：门控结论为放行建议，实际发货与上市动作由责任人与控制层执行。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 关务资料检查"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-New-SKU-Launch-Readiness-Gate"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "新品从选品到发布过一遍五维清单，合规、供应、Listing、财务、运营哪里卡住，发货前就看清楚。"
user_try: "试试：用五维门控给这款新品做上市就绪评估，列出阻塞项和就绪分数。"
whenToUse: "新品上市前要做跨维度就绪评估、识别硬阻塞项时用；只要合规单项评分与自动阻断时用「上架前合规门控」；要列品类×市场的测试需求与时间轴时用「产品安全测试需求映射」。"
workflow: "按五维收集各维度检查项及其状态 → 逐项判定 PASS/FAIL/CONDITIONAL/NA 与得分 → 标记必须通过才能上市的阻塞项 → 按权重汇总就绪分数并给出上市决策建议 → 输出阻塞项整改清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 新品上市准入门控 — 从选品到发布的全量检查清单与Tag驱动的上市就绪评估

## ① 解决的问题

运营面临"新品上市后才发现合规缺失被海关扣押"——5维门控检查将上市前风险完全暴露，防止货到港扣押损失5-15万元

## ② 核心算法逻辑

新品上市准入门控（Launch Readiness Gate） 是一个多维度、结构化的"上市检查清单"——防止因某个关键环节遗漏导致上市后的补救成本远高于预防成本。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：上市门控阻止不合规产品发货，每次避免海关扣押损失5-15万元；防止因Listing不完整导致的上市冷启动（差的Listing让转化率降低40-60%，损失约10-20万元/品）
实施难度：⭐⭐☆☆☆（主要是检查清单的结构化录入，技术门槛低）
优先级评分：⭐⭐⭐⭐⭐（新品是所有资源投入的核心决策点，门控防止"亡羊补牢"）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（211 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/supply_chain/new_sku_launch_readiness_gate` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-New-SKU-Launch-Readiness-Gate.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
新品上市准入门控系统
功能：多维度门控检查 / 就绪评分 / 阻塞项识别 / 上市决策建议
"""
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


GATE_WEIGHTS = {
    "compliance": 0.30,  # 合规是硬门控
    "supply":     0.25,
    "listing":    0.20,
    "finance":    0.15,
    "operations": 0.10,
}


@dataclass
class GateCheck:
    gate_name: str
    check_name: str
    status: str          # PASS / FAIL / CONDITIONAL / NA
    score: float         # 0-1
    details: str = ""
    is_blocker: bool = False  # True=必须PASS才能上市


@dataclass
class LaunchReadinessReport:
    sku_id: str
    product_name: str
    gate_scores: dict = field(default_factory=dict)  # gate → score
    all_checks: list = field(default_factory=list)
    overall_score: float = 0.0
    recommendation: str = "PENDING"
    blockers: list = field(default_factory=list)
    tags: dict = field(default_factory=dict)


def check_compliance_gate(sku_data: dict) -> list:
    checks = []
    markets = sku_data.get("target_markets", [])
    certs = sku_data.get("certifications", {})

    required = {"US": ["FCC"], "EU": ["CE", "ROHS"], "JP": ["PSE"]}
    all_pass = True
    for market in markets:
        for cert in required.get(market, []):
            has_cert = certs.get(cert, False)
            checks.append(GateCheck(
                "compliance", f"{market}:{cert}认证",
                "PASS" if has_cert else "FAIL",
                1.0 if has_cert else 0.0,
                f"{'已获得' if has_cert else '缺失'}{cert}认证",
                is_blocker=not has_cert,
            ))
            if not has_cert: all_pass = False
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2310.09823，但该号在 arXiv 上是《Finite size corrections for real eigenvalues of the elliptic Ginibre matrices》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：新品在五个维度的检查数据：合规（认证与检测状态）、供应、Listing、财务、运营，逐项带状态与得分；粒度：单 SKU × 单检查项。

**输出**：上市就绪评估结果：加权总分、各维度得分与状态（PASS/FAIL/CONDITIONAL/NA）、必须 PASS 才能上市的阻塞项清单与整改建议；用于在发货前暴露合规缺失，避免货到港被扣押（每次损失 5-15 万元）。

## 执行步骤

1. 按五维权重收集各维度检查项
2. 逐项判定状态与得分
3. 标记必须通过的阻塞项
4. 按权重汇总就绪分数
5. 输出上市决策建议与整改清单

## 边界与不做

- 数据不满足时不用：五维检查项数据缺失（如合规认证状态未录入）时，评分与阻塞判定无效。
- 能力边界：产出的是就绪评分与放行建议，不是执行器；实际发货、上架与冻结动作由模型外的控制层或责任人执行。
- 口径边界：合规维度权重最高（0.30）且是硬门控，其他维度得分再高也不能抵消合规维度的 FAIL。

## 技能关联

- **前置**：Skill-Competitor-SKU-Ontology.html、Skill-Competitor-SKU-Ontology、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Product-Category-Opportunity-Scoring.html、Skill-Product-Category-Opportunity-Scoring、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI
- **延伸**：Skill-Competitor-SKU-Ontology.html、Skill-Competitor-SKU-Ontology、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology
- **可组合**：Skill-Competitor-SKU-Ontology.html、Skill-Competitor-SKU-Ontology、Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-New-SKU-Launch-Readiness-Gate

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：04-供应链　·　源卡：`Skill-New-SKU-Launch-Readiness-Gate`