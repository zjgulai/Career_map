---
name: "p2s-category-compliance-prescan"
title: "Skill-Category-Compliance-Prescan"
description: "触发词：合规预筛、召回风险、认证清单、准入核对、品类风险扫描。何时不用：只看品类市场机会与竞争强度时用「Blue Ocean Category Discovery」；需要出具正式合规结论或提交认证时走认证机构与法规流程，本技能只做进入前预筛。安全边界：风险结论基于公开召回库，不构成法规意见，认证清单、成本与工期须以认证机构实际报价为准。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-022"
l3_business: "市场机会评估"
l3_all: "市场机会评估 / 产品准入核对"
l1_l2_l3: "业务运营/产品与创新/市场机会评估"
p2s_card_id: "Skill-Category-Compliance-Prescan"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在决定进一个新品类前，先扫历史召回库，算出召回风险密度、风险等级和必须的认证清单与成本，避免踩已经爆过的雷。"
user_try: "试试：帮我预筛 UV-C 密闭消毒器的进入风险，给出近 5 年召回情况、风险等级和认证成本估算。"
whenToUse: "选品阶段需要判断品类的召回风险与认证门槛、给出 GO / CAUTION / NO-GO 时用本技能；若只评估市场机会与竞争强度，用「Blue Ocean Category Discovery」；若已进入执行期要核对合规材料，走正式认证与准入流程。"
workflow: "给出品类关键词与目标市场（如 US+EU） → 调用 CPSC 等召回数据库拉取近 5 年召回记录 → 统计召回次数、召回量、主要危害类型与 FDA 分级 → 输出风险等级、必要认证清单与合规成本及工期估算 → 按季度复扫在售品类并标记风险升级项"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Category-Compliance-Prescan

## ① 解决的问题

业务问题：考虑推出 UV-C 密闭消毒器，但市面上已有 2 次大规模召回（2025-08 BigTree 33,000 台 / 2026-04 Uvlizer 21,000 台），不知道自己的产品设计是否踩了同样的雷，认证需要多少成本和时间

## ② 核心算法逻辑

核心思想：在决定进入新品类之前，用 NLP + 向量聚类对历史召回数据库（CPSC/RAPEX）做自动扫描，计算该品类的「召回风险密度」和「危害类型分布」，输出风险等级（低/中/高）+ 合规成本估算，作为 WFD 选品扫描的进入前否决门。

## ③ 业务应用场景

场景 A：新品类进入前合规预筛（UV-C 消毒器示例）
- 业务问题：考虑推出 UV-C 密闭消毒器，但市面上已有 2 次大规模召回（2025-08 BigTree 33,000 台 / 2026-04 Uvlizer 21,000 台），不知道自己的产品设计是否踩了同样的雷，认证需要多少成本和时间。 - 数据要求：品类关键词（`UV sterilizer baby`）+ 目标市场（US+EU） - 预期产出： - 该品类近 5 年召回次数、总召回量、主要危害类型 - 风险等级：高风险（Class I 主导） - 必要认证清单：UL 8802 + CE + IEC 62471（3 项） - 合规成本估算：$25,000-$45,000 / 12-1
- 业务问题：每季度扫描所有在售品类的召回动态，及时发现「原本低风险品类因新召回事件升级为高风险」的变化。 - 数据要求：全品类关键词列表 + 扫描周期（按季度） - 预期产出：品类合规风险变化热力表（新增召回 / 风险等级变化 / 是否触发强制整改） - 业务价值：提前 1-2 个季度发现合规风险升级，有时间调整产品设计或准备认证，而非被动响应召回

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
规避 UV-C wand 进入：BigTree/Uvlizer 两次召回合计涉及 54,000 台，按平均 $39 售价 + 召回处理成本估算，单次召回损失 $150,000-$500,000；本 Skill 在选品阶段即拦截，成本接近零
量化合规成本进入 ROI 模型：UV-C 密闭消毒器认证 $25,000-$45,000，若不计入则 ROI 高估 30-50%
合规护城河识别：高门槛品类通过认证后竞品数量少 3-5×，LTV 提升显著
实施难度：⭐⭐☆☆☆（2/5）— CPSC API 直接调用，规则库无需训练
优先级评分：⭐⭐⭐⭐⭐（5/5）— WF-D 选品扫描的否决门，缺失则选品决策缺乏合规维度

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（364 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'except' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/compliance/category_compliance_prescan` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Category-Compliance-Prescan.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Skill-Category-Compliance-Prescan
基于 RECALL-MM (arXiv:2503.23213, ASME IDETC 2025) +
    WOA-BP 玩具召回 (Scientific Reports 2025) +
    FDA 21 CFR 1003.2 / UL 8802:2023 / EU GPSR 2023/988
母婴跨境电商品类合规风险预筛工具
"""

import json
import time
import urllib.request
import urllib.parse
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class RiskLevel(Enum):
    LOW    = "低风险"
    MEDIUM = "中风险"
    HIGH   = "高风险"
    CRITICAL = "极高风险（强制门控）"


@dataclass
class CompliancePrescanResult:
    category_keyword: str
    us_recall_count: int
    eu_recall_count: int
    total_units_recalled: int
    dominant_hazard_type: str
    risk_level: RiskLevel
    fda_class: str                    # "Class I" / "Class II" / "Class III"
    required_certifications: list[str]
    cert_cost_estimate_usd: tuple[int, int]   # (low, high)
    cert_timeline_months: tuple[int, int]     # (min, max)
    hard_blocked: bool                # True = 强制门控（如 UV-C wand）
    decision: str                     # GO-WITH-MOAT / CAUTION / NO-GO
    rationale: str
    recent_recalls: list[dict] = field(default_factory=list)


# ── CPSC API 采集 ────────────────────────────────────────
def fetch_cpsc_recalls(keyword: str, limit: int = 50) -> list[dict]:
    """
    调用 CPSC SaferProducts API 获取品类召回记录。
    API 文档: https://www.saferproducts.gov/RestWebServices
    """
    base_url = "https://www.saferproducts.gov/RestWebServices/Recall"
    params = {
        "format": "json",
        "RecallDescription": keyword,
        "limit": limit,
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data if isinstance(data, list) else []
    except Exception as e:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2503.23213。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：品类关键词（如 UV sterilizer baby）+ 目标市场（US+EU 等）；做周期扫描时还需提供全品类关键词列表与扫描周期。

**输出**：品类召回风险密度报告：近 5 年召回次数与总量、主要危害类型、风险等级（低 / 中 / 高 / 强制门控）、必要认证清单、合规成本与认证周期估算，以及 GO-WITH-MOAT / CAUTION / NO-GO 决策建议，作为选品扫描的进入前否决门。

## 执行步骤

1. 明确品类关键词与目标市场
2. 拉取 CPSC 等召回库的品类召回记录
3. 统计召回量、危害类型与 FDA 分级
4. 输出风险等级、认证清单与成本工期估算
5. 按季度复扫并标记风险升级品类

## 边界与不做

- 品类关键词过泛、或目标市场不在召回库覆盖范围内时，风险结论不可用
- 结论来自公开召回数据与规则库，不构成法规意见，认证清单与成本须以认证机构实际报价为准
- 本技能只做进入前预筛与风险门控判断，不执行任何认证申报动作

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Amazon-ToS-Compliance-Guardrail.html、Skill-Amazon-ToS-Compliance-Guardrail、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Product-Lifecycle-Stage.html、Skill-Product-Lifecycle-Stage、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Product-Opportunity-Scoring.html、Skill-Product-Opportunity-Scoring、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Market-Size-Estimation.html、Skill-Market-Size-Estimation、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-Category-Compliance-Prescan

---

> 分类：业务运营/产品与创新/市场机会评估　·　技术族：21-合规决策　·　源卡：`Skill-Category-Compliance-Prescan`