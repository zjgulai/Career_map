---
name: "p2s-spot-freight-consolidation"
title: "SPOT Freight Consolidation — 时空模式挖掘的货运拼箱优化"
description: "触发词：拼箱、散货拼柜、头程降本、LCL 转 FCL、发货窗口。何时不用：要横向比较不同货代报价用「采购比价」，要查这批货走到哪了用「履约跟踪」；本技能只做同路货物的拼箱组合与成本对比。安全边界：多货主混装前须确认批次编码与检验检疫证书、中文营养标签、原产地证明等合规资料齐备，模型不代客订舱。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-SPOT-Freight-Consolidation"
p2s_src_domain: "04-供应链"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把同一时间段发往同一目的港的散货找出来拼成整柜，算出能省多少钱、什么时候发货最划算。"
user_try: "试试：我下个月有 50 票从深圳到洛杉矶的散货，帮我看看哪些能拼成整柜、能省多少、要不要等两天再发？"
whenToUse: "已有历史或在途发货记录、想压缩头程成本时用；要比不同货代报价用「采购比价」，要跟踪在途货物进度用「履约跟踪」。"
workflow: "按起运地与目的港把发货记录分组，找出同路可拼的货主 → 汇总每组总体积，判断是否达到整柜起拼量 → 用 LCL 与 FCL 费率算拼箱成本、节省额与节省比例 → 节省比例超过 20% 才建议转 FCL，否则维持 LCL → 给出最优发货窗口与拼箱组合优先序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SPOT Freight Consolidation — 时空模式挖掘的货运拼箱优化

## ① 解决的问题

月均 50 票 LCL 散货头程成本 $120-180/CBM，无法与同路货主智能拼箱——时空聚类+频繁模式挖掘识别拼箱组合，头程成本降低 30-50%、年化节省 20-80 万元

## ② 核心算法逻辑

核心思想：跨境电商小批量出货通常走 LCL（拼箱/散货），传统拼箱是人工匹配同路货物，效率低且成本高。SPOT 用时空聚类识别货运流的规律性模式（哪些货主在同一时间段向同一目的地发货），结合频繁模式挖掘找到最优拼箱组合，将拼箱成本降低约 50%。

## ③ 业务应用场景

- 业务问题：某母婴品牌月均发货 50 票 LCL，每票平均 2 CBM，每 CBM 头程成本 $120-180（LCL 溢价），如果能与同路货主拼成 FCL（整柜），每 CBM 成本降至 $60-80，节省 40-50%。 - 数据要求：历史发货记录（发货日期、重量/体积、目的港、货主/货代）、船期表、集装箱规格。 - 预期产出： - 本批货物的最优拼箱方案（与哪些货主组合，走哪个船期） - 拼箱后的预计成本 vs 散货成本对比 - 最优发货窗口建议（等 2 天拼到更多货可节省 $X） - 业务价值：头程成本降低 30-50%，年化节省 20-80 万元（视发货量）。
**三轨验证** | 成本轨：月均整合成本1200元（仓储费800元/月+系统管理200元/月+人工4小时/月@100元/小时），年化14400元，相比缺货损失45万降低96.8%，ROI达31倍 | 合规轨：符合《跨境电商零售进口商品清单》婴幼儿配方奶粉规范，需提供检验检疫证书、营养标签中文标识、原产地证明；合规依据：海关总署2021年第142号公告、国家市场监管总局婴幼儿配方乳粉注册制 | 风险轨：①供应商延迟风险（概率15%）导致整合周期延长3-5天，影响FBA补货时间；②多批次混装引发质量追溯困难（概率8%），需建立批次编码系统；③汇率波动风险（概率25%），月度汇率变化±2%影响成本

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：头程成本降低 30-50%，年化节省 20-80 万元（月发 50 票 LCL 的品牌）
实施难度：⭐⭐☆☆☆（低，历史发货数据分析即可，无需复杂模型）
优先级：⭐⭐⭐⭐☆（头程是跨境成本结构中最可压缩的部分之一）
评估依据：论文实验拼箱成本降低约 50%，工业数据集验证

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（70 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/spot_freight_consolidation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-SPOT-Freight-Consolidation.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass
from typing import List, Dict
from itertools import combinations

@dataclass
class Shipment:
    shipment_id: str
    shipper: str
    origin: str
    destination: str
    volume_cbm: float
    weight_kg: float
    ready_date: str

def compute_consolidation_saving(shipments: List[Shipment],
                                 lcl_rate: float = 150.0,
                                 fcl_rate: float = 75.0,
                                 fcl_capacity_cbm: float = 25.0) -> Dict:
    total_volume = sum(s.volume_cbm for s in shipments)
    lcl_cost = total_volume * lcl_rate
    if total_volume >= 15:
        containers = max(1, int(total_volume / fcl_capacity_cbm) + (1 if total_volume % fcl_capacity_cbm > 5 else 0))
        fcl_cost = containers * fcl_capacity_cbm * fcl_rate
        savings = lcl_cost - fcl_cost
        saving_pct = savings / lcl_cost
        recommendation = "FCL" if saving_pct > 0.2 else "LCL"
    else:
        fcl_cost = lcl_cost
        savings = 0
        saving_pct = 0
        recommendation = "LCL"
    return {
        "total_volume_cbm": round(total_volume, 2),
        "lcl_cost_usd": round(lcl_cost),
        "consolidation_cost_usd": round(fcl_cost),
        "savings_usd": round(savings),
        "saving_pct": round(saving_pct * 100, 1),
        "recommendation": recommendation,
        "shippers": [s.shipper for s in shipments]
    }

def find_consolidation_groups(all_shipments: List[Shipment],
                               fcl_min_cbm: float = 15.0) -> List[Dict]:
    same_route = {}
    for s in all_shipments:
        key = (s.origin, s.destination)
        same_route.setdefault(key, []).append(s)
    results = []
    for route, shipments in same_route.items():
        if len(shipments) >= 2:
            result = compute_consolidation_saving(shipments)
            if result["savings_usd"] > 0:
                result["route"] = f"{route[0]} → {route[1]}"
                results.append(result)
    return sorted(results, key=lambda x: -x["savings_usd"])

shipments = [
    Shipment("SH001", "品牌A", "深圳", "洛杉矶", 3.5, 800, "2026-06-15"),
    Shipment("SH002", "品牌B", "深圳", "洛杉矶", 4.2, 950, "2026-06-16"),
    Shipment("SH003", "品牌C", "深圳", "洛杉矶", 8.0, 1800, "2026-06-15"),
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2504.09680 — SPOT: Spatio-Temporal Pattern Mining and Optimization for Load Consolidation in Freight Transportation Networks

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：发货记录：shipment_id、货主、起运地、目的港、体积 CBM、重量 kg、可发日期；另需船期表、集装箱规格与容量，以及 LCL 单价（默认 150 美元/CBM）、FCL 单价（默认 75 美元/CBM）、整柜容量（默认 25 CBM）等费率参数。

**输出**：按节省额排序输出每个同路组合的拼箱方案（与哪些货主组合、走哪个船期）、总体积与拼箱成本对比散货成本的节省额与节省比例、FCL 或 LCL 建议，以及等几天拼到更多货可省多少的发货窗口建议；供物流负责人决策。

## 执行步骤

1. 按起运地与目的港把发货记录分组，找出同路可拼的货主
2. 汇总每组总体积，判断是否达到整柜起拼量
3. 用 LCL 与 FCL 费率算出拼箱成本、节省额与节省比例
4. 节省比例超过 20% 才建议转 FCL，否则维持 LCL
5. 给出最优发货窗口建议并排出拼箱组合优先序
6. 提示批次编码与检验检疫等合规材料要求

## 边界与不做

- 数据不满足时不用：缺体积、重量、目的港或可发日期的发货记录无法分组拼箱；单组总体积不足 15 CBM 不构成整柜建议。
- 只做拼箱组合与成本对比建议，不代客订舱，也不承诺船期与舱位。
- 卡页节省口径（头程成本降低 30-50%、年化节省 20-80 万元，论文实验约 50%）为案例与论文数据；拼箱存在供应商延迟（概率 15%）与混装追溯（概率 8%）风险，落地前须确认。

## 技能关联

- **前置**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Cross-Border-Cash-Flow-Forecasting.html、Skill-Cross-Border-Cash-Flow-Forecasting、Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Multi-Channel-Inventory-Pooling.html、Skill-Multi-Channel-Inventory-Pooling、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-SPOT-Freight-Consolidation

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：04-供应链　·　源卡：`Skill-SPOT-Freight-Consolidation`