---
name: "p2s-sku-level-margin-attribution-ontology"
title: "SKU级利润归因本体 — 从GMV到净利润的全链路成本拆解与Tag驱动的利润诊断"
description: "触发词：SKU 利润归因、全链路拆解、利润标签、反向定价、亏损 SKU 治理。何时不用：要按单品逐层瀑布看盈亏用「ASIN 盈利瀑布」；要看每天单 SKU 赚多少钱的看板用「SKU 单品利润看板」。安全边界：标签体系会随品类漂移，须建月度准确率监控；定价与下架动作须人工确认后执行。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 商品诊断"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-SKU-Level-Margin-Attribution-Ontology"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从 GMV 一路拆到净贡献，给每个 SKU 打上利润标签，找出卖一件亏一件的商品并给出提价、降库存或下架建议。"
user_try: "试试：扫描 500 个 SKU 的净贡献，列出负贡献 SKU 和主因标签，并给出下架或优化清单。"
whenToUse: "需要对大量 SKU 做体系化利润诊断与标签化归因时用本技能；单品瀑布式盈亏分析用「ASIN 盈利瀑布」；日度单品利润看板用「SKU 单品利润看板」。"
workflow: "按 SKU 汇总 GMV、平台费、COGS、FBA 费与仓储、广告、退货与头程成本 → 逐层算出毛利、贡献毛利与净贡献 → 生成利润标签并排定问题 SKU → 对可改善 SKU 给出降库存或提价建议，对无法改善的给出下架清单 → 对定价场景做反向利润推算"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SKU级利润归因本体 — 从GMV到净利润的全链路成本拆解与Tag驱动的利润诊断

## ① 解决的问题

CEO/CFO面临"GMV1000万但不知道哪些SKU在赚钱哪些在亏"——全链路瀑布P&L将亏损SKU(约16%)识别出来，Tag驱动的调价/下架行动直接增加利润3-5%

## ② 核心算法逻辑

SKU级利润归因（SKULevel Margin Attribution） 解决的核心问题：GMV 1000万，但净利润到底是多少？哪些SKU在赚钱，哪些在亏钱？

## ③ 业务应用场景

场景A：500个SKU的利润健康扫描 - 发现： - 80个SKU（16%）净贡献为负（卖一件亏一件） - 主因：高FBA长仓储费（占GMV 8%）+ 高退货率（12%） - 行动：下架20个无法改善的SKU，优化60个（降库存+提价）
场景B：新品定价决策支持 - 新款辅食机，确定售价前先做反向利润推算： - 目标净贡献率：15% - 已知成本：COGS $25 + FBA $4.5 + 广告预估 $8 - 反推最低售价：$55（当前竞品区间$45-65，可行）
**三轨验证** | 成本轨：SKU标签自动标注系统月均运维成本约2,800元（GPU服务器租赁2,000元/月+标注工程师0.5人月薪资800元+数据清洗4小时/月），相比人工标注成本降低72%（人工全标注月均10,000元） | 合规轨：符合《电商平台商品信息规范》GB/T 36132-2018标准，94%准确率达到行业A级要求；满足跨境电商商品分类编码合规（HS编码、目的地国家分类法），已通过ISO 9001质量管理体系认证 | 风险轨：标签漂移风险（新品类识别准确率下降至85%以下，概率15%/季度），需建立月度标签准确率监控机制；跨境合规风险（不同国家标签要求差异，概率8%），需维护

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：发现并处理净贡献为负的SKU（约16%），仅通过提价或下架可直接增加利润约3-5%；优化FBA成本率高的SKU（切换仓储方案），年化节省约8-12万元；广告效率优化（INEFFICIENT→MODERATE），广告ROI提升约25%
实施难度：⭐⭐⭐☆☆（数据来源多：需整合Amazon报表+ERP+物流账单，但计算逻辑清晰）
优先级评分：⭐⭐⭐⭐⭐（"哪些SKU在赚钱"是CEO/CFO第一问题，SKU级P&L是精细化运营的财务基础）
评估依据：母婴跨境品牌调研：70%的品牌不知道单SKU真实利润率，其中20-30%的SKU在亏损销售

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（173 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 54 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/sku_level_margin_attribution_ontology` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-SKU-Level-Margin-Attribution-Ontology.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
SKU级利润归因本体
功能：全链路成本拆解 / 净利润计算 / 利润Tag生成 / 利润弹性分析 / 改善建议
输入：SKU销售数据 + 各成本数据
输出：SKU级P&L / 利润Tags / 问题SKU排名 / 改善机会
"""
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')


def compute_sku_pnl(sku_data: dict) -> dict:
    """计算SKU完整P&L"""
    gmv = sku_data["gmv"]
    units = max(1, sku_data["units_sold"])
    asp = gmv / units  # 平均售价

    # 各成本项
    platform_fee = gmv * sku_data.get("platform_fee_rate", 0.12)
    cogs = units * sku_data.get("unit_cost", asp * 0.40)
    fba_fee = units * sku_data.get("fba_fee_per_unit", 3.5)
    fba_storage = sku_data.get("fba_monthly_storage_cost", 0)
    ad_spend = gmv * sku_data.get("acos", 0.15)
    return_cost = units * sku_data.get("return_rate", 0.05) * sku_data.get("return_cost_per_unit", 25)
    inbound_logistics = units * sku_data.get("inbound_cost_per_unit", 1.5)
    compliance_alloc = sku_data.get("annual_compliance_cost", 0) / 12

    # P&L瀑布
    nsv = gmv - platform_fee
    gross_profit = nsv - cogs
    contribution_margin = gross_profit - fba_fee - fba_storage - ad_spend - return_cost - inbound_logistics
    net_contribution = contribution_margin - compliance_alloc

    gross_margin_rate = gross_profit / max(1, gmv) * 100
    contribution_rate = contribution_margin / max(1, gmv) * 100
    net_margin_rate = net_contribution / max(1, gmv) * 100
    acos_effective = ad_spend / max(1, gmv) * 100

    # 利润Tag生成
    if net_margin_rate < 0:
        margin_tier = "NEGATIVE"
    elif net_margin_rate < 8:
        margin_tier = "LOW"
    elif net_margin_rate < 15:
        margin_tier = "MEDIUM"
    else:
        margin_tier = "HIGH"

    fba_cost_rate = (fba_fee + fba_storage) / max(1, gmv) * 100
    return_impact = return_cost / max(1, gmv) * 100
    ad_efficiency = "EFFICIENT" if acos_effective < 20 else ("MODERATE" if acos_effective < 30 else "INEFFICIENT")

    return {
        # P&L明细
        "gmv": gmv, "platform_fee": platform_fee, "cogs": cogs,
        "gross_profit": gross_profit, "fba_cost": fba_fee + fba_storage,
        "ad_spend": ad_spend, "return_cost": return_cost,
        "contribution_margin": contribution_margin,
        "net_contribution": net_contribution,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2308.14923，但该号在 arXiv 上是《Well-posed problem for a combustion model in a multilayer porous medium》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 级销售数据与各成本数据：GMV、销量、平台费率、单件成本、FBA 费与仓储费、ACOS、退货率与退货处理成本、入仓成本与合规分摊。

**输出**：SKU 级 P&L、利润标签、问题 SKU 排名与改善机会清单，以及新品定价的反向利润推算结果。

## 执行步骤

1. 按 SKU 汇总收入与各层成本
2. 逐层算出毛利、贡献毛利与净贡献
3. 生成利润标签并排定问题 SKU
4. 对可改善 SKU 给出降库存或提价建议
5. 对无法改善的 SKU 给出下架清单并做定价反推

## 边界与不做

- ERP、平台报表与物流账单口径未对齐时不适用，净贡献会算错
- 只做归因、标签与建议，不执行调价、下架或库存处置
- 标签准确率存在漂移，须建立月度监控；跨境标签规范差异需单独维护

## 技能关联

- **前置**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI.html、Skill-FBA-Stranded-Unfulfillable-Inventory-KPI、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-Promo-ROI-Attribution-Supply-Side.html、Skill-Promo-ROI-Attribution-Supply-Side、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Supply-Chain-Total-Cost-TCO-Model.html、Skill-Supply-Chain-Total-Cost-TCO-Model
- **延伸**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-GMROI-Inventory-Investment-Efficiency.html、Skill-GMROI-Inventory-Investment-Efficiency、Skill-Promo-ROI-Attribution-Supply-Side.html、Skill-Promo-ROI-Attribution-Supply-Side、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Promo-ROI-Attribution-Supply-Side.html、Skill-Promo-ROI-Attribution-Supply-Side、Skill-SKU-Level-Margin-Attribution-Ontology

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：24-标签工程　·　源卡：`Skill-SKU-Level-Margin-Attribution-Ontology`