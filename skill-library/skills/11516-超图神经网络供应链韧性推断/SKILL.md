---
name: "p2s-sc-resilience-hypergraph"
title: "Supply Chain Resilience Hypergraph — 超图神经网络供应链韧性推断"
description: "触发词：供应韧性、单点故障、级联风险、备选供应商。何时不用：供应关系只到一级、缺少多跳数据时推断会失真；只评估单个供应商交货表现用准时足量交货分析类技能。安全边界：供应商地理位置数据涉跨境传输时需符合数据出境安全评估要求。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-041"
l3_business: "供应商评估"
l3_all: "供应商评估"
l1_l2_l3: "业务运营/供应与履约/供应商评估"
p2s_card_id: "Skill-SC-Resilience-Hypergraph"
p2s_src_domain: "04-供应链"
quality_tier: "preview"
user_summary: "用超图建模供应网络，找出单点故障节点与级联风险路径并给出备选方案。"
user_try: "试试：我们 80% 硅胶配件来自同一家工厂，帮我评估停产两周的影响和备选供应商。"
whenToUse: "本卡属「供应商评估」。需要评估整体供应链韧性、定位单点故障与级联风险时用本卡；只评估单个供应商交货表现时用准时足量交货分析类技能。"
workflow: "整理供应商与供应关系 → 计算风险暴露度 → 识别单点故障节点 → 计算韧性并给备选建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Supply Chain Resilience Hypergraph — 超图神经网络供应链韧性推断

## ① 解决的问题

80% 硅胶配件来自同一东莞工厂但无法量化停产 2 周的影响烈度——超图神经网络识别单点故障节点和级联风险传播路径，提前建立双供应商体系，中断事件损失降低 50-70%

## ② 核心算法逻辑

核心思想：当一个供应商中断时，影响会沿供应链网络传播——但传统图模型只能表示"A 供应给 B"这样的二元关系，而现实中往往是"供应商 A、B、C 共同提供某个零件给多个品牌"。超图（Hyperedge）可以将多个节点打包进同一条边，精确捕捉供应商组合关系。SCRIHN 用超图神经网络预测供应链的韧性指标（中断后恢复速度、抗冲击能力）。

## ③ 业务应用场景

- 业务问题：某母婴品牌 80% 的硅胶配件来自同一家东莞工厂，无法量化"如果该工厂停产 2 周"对整个 SKU 矩阵的影响烈度。 - 数据要求：供应商列表 + 供应关系（谁供什么给谁）+ 供应商基本信息（地理位置、产能、历史断供记录）。 - 预期产出： - 各供应商的风险暴露度（依赖度分数） - 韧性评分（整体供应链抗冲击能力） - 关键单点故障（SPOF）节点清单 - 备选供应商建议（填补 SPOF） - 业务价值：提前识别 SPOF → 建立双供应商体系或备货缓冲 → 中断事件损失降低 50-70%。
三轨验证： - 成本：显性成本约 8-15 万元（数据采集与清洗 3-5 万，超图模型训练与部署 5-10 万）；若使用云端 GPU 实例，月均计算成本约 2000-5000 元。 - 合规：不涉及 Amazon 政策红线或 GDPR 直接冲突；但供应商地理位置数据若涉及跨境传输，需符合数据出境安全评估要求；不涉及广告法。 - 风险：次生风险较低，主要风险为模型误判导致过度备货（库存成本上升 10-15%），或误判 SPOF 引发供应商关系紧张；不会直接引发竞品价格战或平台审查。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：提前识别 SPOF 建立双供应商 → 中断损失降低 50-70%，一次断供事件通常损失 50-200 万元
实施难度：⭐⭐⭐☆☆（中等，需要整理供应关系数据）
优先级：⭐⭐⭐⭐☆（地缘风险上升背景下，供应链韧性是战略级议题）
评估依据：AAAI 2026，超图模型比传统图模型韧性推断精度提升显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（74 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/supply_chain/sc_resilience_hypergraph` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/04-供应链/Skill-SC-Resilience-Hypergraph.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import List, Set

@dataclass
class Supplier:
    id: str
    name: str
    location: str
    capacity: float
    historical_disruption_rate: float
    financial_health: float

@dataclass
class HyperEdge:
    material: str
    supplier_ids: Set[str]
    dependent_brands: Set[str]

def compute_supplier_risk(supplier: Supplier) -> float:
    geo_risk = 0.3 if supplier.location in ["东莞","深圳","广州"] else 0.15
    disruption_risk = supplier.historical_disruption_rate
    financial_risk = max(0, 1 - supplier.financial_health)
    return round((geo_risk + disruption_risk + financial_risk) / 3, 3)

def identify_spof(suppliers: List[Supplier], hyperedges: List[HyperEdge],
                  brands: Set[str]) -> List[dict]:
    spof_candidates = []
    supplier_map = {s.id: s for s in suppliers}
    for edge in hyperedges:
        for sup_id in edge.supplier_ids:
            if len(edge.supplier_ids) == 1:
                sup = supplier_map.get(sup_id)
                if sup:
                    risk = compute_supplier_risk(sup)
                    impact = len(edge.dependent_brands) / max(len(brands), 1)
                    spof_candidates.append({
                        "supplier": sup.name,
                        "material": edge.material,
                        "risk_score": risk,
                        "impact_score": round(impact, 2),
                        "combined_score": round(risk * impact, 3),
                        "alert": "🔴 单点故障" if impact > 0.5 else "🟡 需关注"
                    })
    return sorted(spof_candidates, key=lambda x: -x["combined_score"])

def compute_chain_resilience(suppliers: List[Supplier],
                             hyperedges: List[HyperEdge]) -> float:
    redundancy_scores = []
    for edge in hyperedges:
        redundancy_scores.append(min(1.0, len(edge.supplier_ids) / 3))
    avg_redundancy = sum(redundancy_scores) / max(len(redundancy_scores), 1)
    avg_sup_health = sum(s.financial_health for s in suppliers) / max(len(suppliers), 1)
    return round(0.6 * avg_redundancy + 0.4 * avg_sup_health, 3)

suppliers = [
    Supplier("S1", "东莞硅胶厂", "东莞", 10000, 0.08, 0.75),
    Supplier("S2", "越南棉料厂A", "越南", 5000, 0.03, 0.90),
    Supplier("S3", "越南棉料厂B", "越南", 3000, 0.04, 0.85),
    Supplier("S4", "台湾PCB厂",  "台湾", 2000, 0.05, 0.92),
]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2511.06208 — Resilience Inference for Supply Chains with Hypergraph Neural Network

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：供应商列表与基本信息（地理位置、产能、历史断供记录）以及供应关系数据（谁供什么给谁）。

**输出**：各供应商的风险暴露度与依赖度分数、供应链韧性评分、关键单点故障节点清单与备选供应商建议。

## 执行步骤

1. 整理供应商清单与供应关系超边
2. 计算各供应商的风险暴露度分数
3. 识别关键单点故障节点
4. 计算整体供应链韧性评分
5. 输出双供应商或备货缓冲建议

## 边界与不做

- 供应关系只到一级、缺少多跳数据时推断会失真，不用本卡
- 本卡产出韧性评估与备选建议，不负责供应商开发与备货执行
- 供应商地理位置数据涉跨境传输时需符合数据出境安全评估要求

## 技能关联

- **前置**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence、Skill-Supply-Chain-Network-Betweenness-Resilience.html、Skill-Supply-Chain-Network-Betweenness-Resilience
- **延伸**：Skill-Lead-Time-Distribution-Risk-GenQOT.html、Skill-Lead-Time-Distribution-Risk-GenQOT、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Network-Betweenness-Resilience.html、Skill-Supply-Chain-Network-Betweenness-Resilience
- **可组合**：Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Network-Betweenness-Resilience.html、Skill-Supply-Chain-Network-Betweenness-Resilience、Skill-SC-Resilience-Hypergraph

---

> 分类：业务运营/供应与履约/供应商评估　·　技术族：04-供应链　·　源卡：`Skill-SC-Resilience-Hypergraph`