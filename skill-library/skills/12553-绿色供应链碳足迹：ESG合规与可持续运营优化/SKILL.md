---
name: "p2s-green-supply-chain-carbon-footprint"
title: "Green Supply Chain Carbon Footprint — 绿色供应链碳足迹：ESG合规与可持续运营优化"
description: "触发词：碳足迹、CO2e 核算、CBAM 申报、排放因子、物流排放、减碳机会。何时不用：要办欧盟 EPR 包装注册与费用测算时用「EPR 标签体系」，要核化学限值物质时用「REACH 化学品合规」。安全边界：结果基于公开排放因子估算，对外披露或申报前须按 CBAM 口径复核。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 关务资料检查"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Green-Supply-Chain-Carbon-Footprint"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "算清一个 SKU 从广东工厂到德国消费者排了多少碳，满足零售商要的碳足迹信息，顺便找出最该减哪一环。"
user_try: "试试：算一下吸奶器从广东生产、海运到汉堡再配送的总碳排放，并指出排放最高的环节。"
whenToUse: "欧盟零售商或 CBAM 要求提供产品碳足迹、需要按 SKU 核算并定位减碳点时用；要办 EPR 注册与回收费测算时用「EPR 标签体系」；要核化学限值物质时用「REACH 化学品合规」。"
workflow: "收集产品重量体积、产地与制造方式 → 梳理物流路线（海运/空运距离）与包装材料用量 → 按排放因子库逐环节计算排放量 → 汇总每个 SKU 的 kg CO2e 并生成标签数据 → 识别排放最高环节并给出减碳建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Green Supply Chain Carbon Footprint — 绿色供应链碳足迹：ESG合规与可持续运营优化

## ① 解决的问题

欧盟CBAM2026年强制实施进口商品需申报碳含量但跨境卖家完全没有碳足迹数据——全生命周期碳足迹核算从制造到配送量化每个SKU的CO₂排放，欧洲市场ESG合规+绿色品牌溢价年化ROI10-30万元

## ② 核心算法逻辑

跨境电商碳足迹的三个范围：

## ③ 业务应用场景

业务问题：进入德国市场，部分零售商要求产品提供"碳足迹信息"。吸奶器从广东生产→海运到德国汉堡→配送，总碳排放是多少？
数据要求： - 产品重量和体积 - 供应商生产地和制造方式 - 物流路线（海运/空运距离） - 包装材料类型和用量
预期产出： - 每个 SKU 的碳足迹核算（kg CO₂e） - 碳足迹标签数据（可用于产品页展示） - 减碳机会识别：哪个环节碳排放最高

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
EU CBAM 2026 合规（强制）：避免碳关税罚款
德国/北欧市场品牌溢价：绿色认证提升支付意愿 5-10%，月增收 ¥2-8 万
减碳措施（可回收包装/海运优先）：降低包装成本 ¥2-5 万/年
年化综合 ROI：¥10-30 万（避损+溢价）
实施难度：⭐⭐☆☆☆（排放因子数据库公开可用；计算逻辑清晰；约 1-2 周实施）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（167 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/green_supply_chain_carbon_footprint` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-Green-Supply-Chain-Carbon-Footprint.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Green Supply Chain Carbon Footprint
绿色供应链碳足迹计算与优化
"""
from dataclasses import dataclass
import numpy as np


# 排放因子数据库（kg CO₂e / 单位）
EMISSION_FACTORS = {
    'sea_freight':    0.0115,   # per tonne-km
    'air_freight':    0.602,    # per tonne-km
    'road_freight':   0.115,    # per tonne-km
    'fba_storage':    0.023,    # per unit per day
    'plastic_pkg':    2.53,     # per kg packaging
    'cardboard_pkg':  0.89,     # per kg
    'manufacturing':  {'china_avg': 3.2, 'vietnam_avg': 2.8, 'eu_avg': 1.5},  # per kg product
}

# 欧盟碳交易价格 (€/tonne CO₂)
EU_ETS_PRICE_EUR = 90.0
CNY_PER_EUR = 7.8


@dataclass
class ProductCarbon:
    """单品碳足迹"""
    product_id: str
    weight_kg: float
    manufacturing_location: str = 'china_avg'
    packaging_plastic_kg: float = 0.05
    packaging_cardboard_kg: float = 0.15
    fba_storage_days: int = 60


@dataclass
class ShipmentRoute:
    """运输路线"""
    origin: str
    destination: str
    mode: str           # 'sea', 'air', 'road'
    distance_km: float
    weight_tonnes: float


def compute_product_carbon(product: ProductCarbon) -> dict:
    """计算单品全生命周期碳足迹（制造+包装）"""
    # 制造排放
    mfg_factor = EMISSION_FACTORS['manufacturing'].get(product.manufacturing_location, 3.2)
    manufacturing_co2 = product.weight_kg * mfg_factor

    # 包装排放
    packaging_co2 = (product.packaging_plastic_kg * EMISSION_FACTORS['plastic_pkg'] +
                     product.packaging_cardboard_kg * EMISSION_FACTORS['cardboard_pkg'])

    # FBA 仓储排放
    storage_co2 = EMISSION_FACTORS['fba_storage'] * product.fba_storage_days

    total_co2 = manufacturing_co2 + packaging_co2 + storage_co2
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.14378，但该号在 arXiv 上是《X-ray view of dissipative warm corona in active galactic nuclei》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：产品重量与体积、供应商生产地与制造方式、物流路线与距离（海运/空运/陆运）、包装材料类型与用量、FBA 仓储天数；粒度：单 SKU × 单物流链路。

**输出**：每个 SKU 的碳足迹核算结果（kg CO2e，含制造、包装、运输、仓储分项）、可用于产品页展示的碳足迹标签数据与减碳机会识别（指出排放最高环节）；供 ESG 合规申报与欧洲市场零售沟通使用。

## 执行步骤

1. 收集产品重量、产地与制造方式
2. 整理物流路线与包装材料用量
3. 按排放因子库分环节计算排放量
4. 汇总 SKU 碳足迹并生成标签数据
5. 定位高排放环节并给出减碳建议

## 边界与不做

- 数据不满足时不用：缺物流距离、生产地或包装用量时，分环节核算会缺项，结果不能对外披露。
- 能力边界：只做基于公开排放因子的估算与减碳建议，不出具第三方核查报告、不代替 CBAM 正式申报。
- 口径边界：排放因子为通用平均值，与供应商实际工艺存在偏差，供应链或路线变化后需重算。

## 技能关联

- **前置**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-Logistics-Cost-PL-Attribution.html、Skill-Logistics-Cost-PL-Attribution、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Warehouse-Location-Optimization.html、Skill-Warehouse-Location-Optimization
- **延伸**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Warehouse-Location-Optimization.html、Skill-Warehouse-Location-Optimization
- **可组合**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-Green-Supply-Chain-Carbon-Footprint

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：04-供应链　·　源卡：`Skill-Green-Supply-Chain-Carbon-Footprint`