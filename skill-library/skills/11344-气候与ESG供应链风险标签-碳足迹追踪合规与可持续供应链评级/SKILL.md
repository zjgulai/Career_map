---
name: "p2s-climate-esg-supply-chain-tag"
title: "气候与ESG供应链风险标签 — 碳足迹追踪、CSRD合规与可持续供应链评级"
description: "触发词：碳足迹、ESG披露、合规评级、可持续供应链。何时不用：缺少物料用量或排放因子数据时无法计算碳足迹；只评估供应商价格交期质量用供应商评估类技能。安全边界：ESG 与碳数据用于对外披露前必须经合规与审计复核，不得自行宣称合规。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估 / 产品准入核对"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-Climate-ESG-Supply-Chain-Tag"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "按物料用量算产品碳足迹并给供应商打 ESG 标签，支撑合规披露与可持续定位。"
user_try: "试试：欧盟要求 ESG 披露，帮我算这几款产品的 Scope 3 碳足迹并整理供应商 ESG 标签。"
whenToUse: "本卡属「供应商评估」。需要计算产品碳足迹、做 ESG 或可持续供应链评级时用本卡；只评估供应商价格、交期与质量时用供应商评估模型类技能。"
workflow: "采集物料用量与排放因子 → 计算 Scope 3 碳足迹 → 生成供应商 ESG 标签 → 汇总披露口径数据表"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 气候与ESG供应链风险标签 — 碳足迹追踪、CSRD合规与可持续供应链评级

## ① 解决的问题

品牌面临"EU CSRD强制ESG披露但无系统化数据"——碳足迹+劳工合规Tag体系满足CSRD合规要求，支持高溢价ESG定位（欧洲市场+5-10%）

## ② 核心算法逻辑

ESG供应链标签 将抽象的"可持续发展"转化为具体可量化的Tag体系，满足欧盟CSRD（企业可持续发展报告指令）等强制报告要求。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：欧盟CSRD 2025年开始对大型企业强制，预计2027年扩展到SME；ESG评分高的品牌在欧洲市场可溢价5-10%；防止因ESG不达标被大型零售商（Walmart/Target/Otto）踢出供应商名单
实施难度：⭐⭐⭐☆☆（主要是碳排放因子数据库建立）
优先级评分：⭐⭐⭐⭐☆（2025-2027年ESG从"可选项"变为"强制项"，先行布局有战略优势）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（75 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/climate_esg_supply_chain_tag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Climate-ESG-Supply-Chain-Tag.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
气候与ESG供应链风险标签系统
功能：碳足迹计算 / ESG评分 / CSRD合规检查 / 可持续供应链标签
"""
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


# 碳排放因子（kgCO2e/kg）
EMISSION_FACTORS = {
    "ABS塑料": 3.1, "铜": 3.8, "硅胶": 2.2, "纸板": 0.9,
    "铝": 11.5, "钢铁": 2.0, "锂电池": 15.0,
}

TRANSPORT_FACTORS = {  # kgCO2e/(tonne·km)
    "sea_freight": 0.008, "air_freight": 0.55, "road_freight": 0.062,
}


@dataclass
class ProductESGProfile:
    sku_id: str
    materials: dict      # material_name → weight_kg
    transport_routes: list  # [(mode, distance_km, weight_kg)]
    supplier_audit_score: float = 0.0
    supplier_labor_compliance: str = "UNKNOWN"
    energy_renewable_pct: float = 0.0


def compute_carbon_footprint(profile: ProductESGProfile) -> dict:
    """计算产品碳足迹（Scope 3）"""
    material_emissions = sum(
        EMISSION_FACTORS.get(mat, 2.0) * weight
        for mat, weight in profile.materials.items()
    )
    transport_emissions = sum(
        TRANSPORT_FACTORS.get(mode, 0.03) * dist_km * weight_kg / 1000
        for mode, dist_km, weight_kg in profile.transport_routes
    )
    total_co2e = material_emissions + transport_emissions
    carbon_intensity = total_co2e / max(0.01, sum(profile.materials.values()))  # per kg product

    esg_score = min(100, max(0,
        50 * (1 - min(1, total_co2e / 20)) +
        30 * profile.supplier_audit_score +
        20 * (1 if profile.supplier_labor_compliance == "COMPLIANT" else 0.3)
    ))

    tags = {
        "sku.carbon_kg_co2e": round(total_co2e, 3),
        "sku.carbon_intensity": round(carbon_intensity, 4),
        "sku.esg_score": round(esg_score, 1),
        "supplier.labor_compliance": profile.supplier_labor_compliance,
        "sku.csrd_disclosure_required": total_co2e > 5.0,  # 超过阈值需要CSRD披露
    }
    return {"total_co2e": total_co2e, "material_emissions": material_emissions,
            "transport_emissions": transport_emissions, "esg_score": esg_score, "tags": tags}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.11823，但该号在 arXiv 上是《Logarithmic correction to the entropy of a Kerr-Newman family of black holes in $U(1)^2$-charged STU supergravity models》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品物料清单与用量、各物料的碳排放因子，以及供应商的劳工与环境合规信息。

**输出**：产品碳足迹（Scope 3）测算结果、供应商 ESG 标签与可持续评级，以及可用于合规披露的数据表。

## 执行步骤

1. 采集物料清单用量与对应排放因子
2. 逐项计算产品碳足迹（Scope 3）
3. 结合劳工与环境信息生成供应商 ESG 标签
4. 汇总为可披露的 ESG 数据表
5. 标注需人工复核的合规口径

## 边界与不做

- 缺少物料用量或排放因子数据时无法计算碳足迹，不用本卡
- 本卡产出碳足迹与 ESG 标签，不负责对外披露与第三方审计
- ESG 与碳数据用于对外披露前必须经合规与审计复核，不得自行宣称合规

## 技能关联

- **前置**：Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Green-Supply-Chain-Carbon-Footprint.html、Skill-Green-Supply-Chain-Carbon-Footprint、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI
- **延伸**：Skill-EPR-Extended-Producer-Responsibility-Tag.html、Skill-EPR-Extended-Producer-Responsibility-Tag、Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain
- **可组合**：Skill-Geopolitical-Ri[REDACTED].html、Skill-Geopolitical-Ri[REDACTED]、Skill-Multi-Market-Compliance-Matrix-Ontology.html、Skill-Multi-Market-Compliance-Matrix-Ontology、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-Climate-ESG-Supply-Chain-Tag

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：24-标签工程　·　源卡：`Skill-Climate-ESG-Supply-Chain-Tag`