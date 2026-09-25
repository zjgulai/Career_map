---
name: "p2s-reach-chemical-compliance"
title: "REACH化学品合规 — 母婴玩具/床品化学物质限制自动检查"
description: "触发词：REACH、SVHC、ANNEX XVII、化学物质限制、DoC 符合性声明、芳香胺。何时不用：要判加州 Prop65 警告时用「加州 65 号提案标签合规」，要办欧盟包装回收注册时用「EPR 标签体系」。安全边界：判定以检测报告与供应商 SDS 为准，本技能不出具检测数据，超限结论须经合规负责人确认。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-REACH-Chemical-Compliance"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "进欧盟前把硅胶牙胶、床品的成分对一遍 REACH 限制物质，先看清会不会被 RAPEX 通报。"
user_try: "试试：拿这份硅胶牙胶的 SGS 报告和 BOM，按 REACH ANNEX XVII 与 SVHC 核一遍，并说明要不要出 DoC。"
whenToUse: "母婴产品进欧盟前要核化学物质限制与 SVHC 命中情况时用；要判加州 Prop65 警告时用「加州 65 号提案标签合规」；要办 EPR 注册与回收费测算时用「EPR 标签体系」。"
workflow: "收集检测报告、材质 BOM 与供应商 SDS → 按 CAS 号比对 SVHC 库并核对阈值 → 核查 ANNEX XVII 限制项（邻苯、芳香胺等） → 判定是否需要 DoC 符合性声明 → 输出命中清单与物质替换建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# REACH化学品合规 — 母婴玩具/床品化学物质限制自动检查

## ① 解决的问题

产品合规经理面临"母婴产品进入欧盟市场时化学物质超标风险无法提前识别"——REACH合规自动检测将上市前违规发现率提升70%，年化避免召回和罚款保护50-150万元

## ② 核心算法逻辑

欧盟 REACH 法规（EC No 1907/2006）是全球最严格的化学品管控体系，对进口欧盟的母婴产品影响尤为显著。核心合规要求：

## ③ 业务应用场景

场景1：德国亚马逊婴儿硅胶牙胶 REACH 全项审查 - 业务问题：硅胶配方含润滑剂成分疑似包含短链氯化石蜡（SCCP），属 REACH ANNEX XVII 限制物质 - 数据要求：SGS/TÜV 化学测试报告 + 材质 BOM + 供应商 SDS（安全数据表） - 预期产出：SVHC 命中清单 + ANNEX XVII 限制项核查 + 是否需要 DoC（符合性声明） - 业务价值：规避 EU 市场召回（平均成本 €80K+）；提前识别物质替换需求，节省 6–12 个月重新认证时间
场景2：法国 TikTok Shop 婴儿床品甲醛+染料 REACH 审查 - 业务问题：纺织品含偶氮染料疑似释放 ANNEX XVII 禁止芳香胺，法国 DGCCRF 抽查频率高 - 数据要求：染料成分表 + 纺织品检测报告（Oeko-Tex / REACH） - 预期产出：禁用芳香胺命中检查 + 偶氮染料合规性报告 + 替代染料方案
**三轨验证**：成本（提前筛查 vs 召回成本比 = 1:50）/ 合规（240+ SVHC 全覆盖）/ 风险（EU RAPEX 预警通报 → 避免上榜）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：EU RAPEX 通报导致产品下架+召回平均成本 €80K–€500K；REACH 审查工具替代 TÜV 审查人工费约 €2K/次，年化节省 15–40 万元
实施难度：⭐⭐⭐⭐☆（SVHC 清单需半年更新一次，ECHA API 集成提升时效性）
优先级：⭐⭐⭐⭐⭐（欧盟是母婴品类最严格市场，REACH 违规等同封号，零容忍）
评估依据：ECHA 2024 年新增 12 种 SVHC 物质，母婴玩具和床品是 RAPEX 通报前三类别；建立自动化检查体系是进入欧洲市场的必要基础。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 56）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import Optional

# SVHC 高频母婴产品物质库（简化，实际应从 ECHA API 同步）
SVHC_SUBSTANCES: dict[str, dict] = {
    "DEHP": {"cas": "117-81-7", "threshold_pct": 0.1, "category": "phthalate",
             "restriction": "ANNEX XVII Entry 51", "toy_limit_pct": 0.1},
    "DBP":  {"cas": "84-74-2",  "threshold_pct": 0.1, "category": "phthalate",
             "restriction": "ANNEX XVII Entry 51", "toy_limit_pct": 0.1},
    "BBP":  {"cas": "85-68-7",  "threshold_pct": 0.1, "category": "phthalate",
             "restriction": "ANNEX XVII Entry 51", "toy_limit_pct": 0.1},
    "DIBP": {"cas": "84-69-5",  "threshold_pct": 0.1, "category": "phthalate",
             "restriction": "ANNEX XVII Entry 51", "toy_limit_pct": 0.1},
    "Lead": {"cas": "7439-92-1", "threshold_pct": 0.1, "category": "heavy_metal",
             "restriction": "ANNEX XVII Entry 63", "toy_limit_pct": 0.005},
    "Cadmium": {"cas": "7440-43-9", "threshold_pct": 0.01, "category": "heavy_metal",
                "restriction": "ANNEX XVII Entry 23", "toy_limit_pct": 0.01},
    "Formaldehyde": {"cas": "50-00-0", "threshold_pct": 0.1, "category": "voc",
                     "restriction": "ANNEX XVII Entry 28", "toy_limit_pct": None},
    "SCCP": {"cas": "85535-84-8", "threshold_pct": 0.1, "category": "chlorinated_paraffin",
             "restriction": "ANNEX XVII Entry 45", "toy_limit_pct": 0.1},
    "Bisphenol_A": {"cas": "80-05-7", "threshold_pct": 0.02, "category": "plastic_additive",
                    "restriction": "ANNEX XVII Entry 66", "toy_limit_pct": 0.02},
}

# 禁用偶氮染料芳香胺（EN 14362-1，ANNEX XVII Entry 43）
PROHIBITED_AROMATIC_AMINES = [
    "4-aminobiphenyl", "benzidine", "4-chloro-o-toluidine", "2-naphthylamine",
    "o-aminoazotoluene", "2-amino-4-nitrotoluene", "p-chloroaniline",
]


@dataclass
class REACHFinding:
    substance: str
    cas: str
    detected_pct: float
    threshold_pct: float
    toy_limit_pct: Optional[float]
    status: str  # COMPLIANT / NON_COMPLIANT / DISCLOSURE_REQUIRED
    restriction: str
    action_required: str


@dataclass
class REACHReport:
    product_name: str
    product_type: str
    findings: list[REACHFinding]
    aromatic_amine_issues: list[str]
    overall_status: str
    doc_required: bool  # 是否需要 DoC（符合性声明）
    summary: str


def check_svhc_substance(
    substance_key: str,
    detected_pct: float,
    product_type: str,
) -> REACHFinding:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：第三方化学测试报告（SGS/TÜV）、材质 BOM、供应商 SDS（安全数据表）；纺织品类另需染料成分表与 Oeko-Tex 检测报告；粒度：单 SKU × 单材质 × 单物质（按 CAS 号比对）。

**输出**：SVHC 命中清单与 ANNEX XVII 限制项核查结果、是否需要 DoC（符合性声明）的判断、禁用芳香胺与偶氮染料检查结论及替代染料方案建议；供欧盟上架前整改与供应商沟通使用。

## 执行步骤

1. 收集检测报告、BOM 与供应商 SDS
2. 按 CAS 号比对 SVHC 库与阈值
3. 核查 ANNEX XVII 限制项
4. 判定是否需要 DoC 声明
5. 输出命中清单与物质替换方案

## 边界与不做

- 数据不满足时不用：缺检测报告、BOM 或 SDS 时无法按 CAS 号比对；SVHC 清单需定期更新（卡页提示半年一次），过期清单结论不可用。
- 能力边界：只做物质比对与合规判断，不出具检测数据、不代替 TÜV 等机构审查，也不代替企业签署 DoC。
- 口径边界：REACH 阈值（如邻苯 0.1%）与 Prop65、CPSC 限值分属不同体系，不能互相替代。

## 技能关联

- **可组合**：Skill-REACH-Chemical-Compliance

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-REACH-Chemical-Compliance`