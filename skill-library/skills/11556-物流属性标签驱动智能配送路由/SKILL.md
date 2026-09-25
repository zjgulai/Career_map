---
name: "p2s-tag-optimized-logistics-routing"
title: "Tag-Optimized Logistics Routing — SKU物流属性标签驱动智能配送路由"
description: "触发词：危品发货、承运商资质、温控配送、超规大件、标签路由。何时不用：要核对报关资料用「关务资料检查」，要横向比较承运商报价用「采购比价」；本技能只按 SKU 标签过滤合规渠道并选路由。安全边界：危品与温控渠道资质须以承运商能力数据库实时核对，SKU 危品与尺寸属性完整度须达 98%，模型不下单、不改标签。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Tag-Optimized-Logistics-Routing"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "给每个 SKU 贴上危品、温控、超规、时效标签后，自动过滤掉没资质的承运商，挑出成本与时效最平衡的渠道。"
user_try: "试试：这批含锂电池的婴儿监控器（UN3481）发美国，帮我筛出有资质的承运商，再挑一个成本时效最合适的。"
whenToUse: "已有 SKU 物流属性标签与承运商能力数据库、要发货选渠道时用；要核对报关与关务资料用「关务资料检查」，要横向比承运商报价用「采购比价」。"
workflow: "由 SKU 尺寸重量算体积重与计费重，判定是否超规 → 读危品与温控标签，过滤无对应资质的承运商渠道 → 用各承运商实时报价与历史时效达成率构建候选集 → 取成本与时效的 Pareto 最优路由并给出备选渠道 → 标注标签误分类风险与数据库更新提示"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tag-Optimized Logistics Routing — SKU物流属性标签驱动智能配送路由

## ① 解决的问题

物流负责人面临"危品品类和温控商品每次发货都要人工核查承运商资质耗时且易出错"——标签规则引擎自动过滤合规承运商将物流合规核查从人工1小时压缩至自动秒级，年化节省物流合规损失75万元

## ② 核心算法逻辑

本 Skill 将 SKU 物流属性标签（体积重量标签/危品标签/温控标签/时效标签）作为配送路由决策的核心输入，通过「标签规则引擎过滤合规承运商 + 成本×时效 Pareto 最优路由选择」，实现「SKU贴标即自动路由」的全自动物流优化。

## ③ 业务应用场景

场景A：含锂电池婴儿监控器跨境配送合规 - 业务问题：含锂电的婴儿监控器因承运商资质不符，扣关率 18%，每次扣关损失 $180+时效损失 - 数据要求：SKU 危品标签（锂电容量/UN编号）+ 承运商资质数据库（实时更新） - 预期产出：`危品标签=含锂电池-UN3481` 自动过滤无资质渠道，扣关率从 18% 降至 1.5% - 业务价值：年减少扣关事件约 400 件，挽回损失约 7.2 万美元（≈52 万元），客诉率降低 60%
场景B：Q4 旺季大件婴儿推车成本×时效 Pareto 优化 - 业务问题：婴儿推车（超规格货物）Q4 旺季路由策略混乱，平均运费 $45/件，且时效达成率仅 71% - 数据要求：SKU 尺寸重量标签 + 各承运商实时报价 + 历史时效达成率 - 预期产出：Pareto 优选路由，运费降至 $36/件（-20%），时效达成率提升至 89% - 业务价值：年化运费节省约 18 万元，时效达成改善减少差评和纠纷约 5 万元，合计 23 万元
三轨验证 | 成本轨：月均成本1200元（AI标签引擎订阅800元+人工审核4小时/月×100元/小时=400元），相比纯人工标注（月均3000元）降低60% | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，标签数据可溯源审计，满足海关HS编码对应要求 | 风险轨：标签误分类导致商品错配（概率8%），可能触发平台下架或消费者投诉，影响SKU转化率2-5%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：含锂电危品扣关率 18%→1.5%，年化挽回损失约 52 万元；大件超规格运费降低 20%，年化节省约 18 万元；时效达成率提升减少差评和客诉约 5 万元，合计年化价值约 75 万元
实施难度：⭐⭐⭐☆☆（规则引擎部分 1 周可上线，需承运商能力数据库持续维护）
优先级：⭐⭐⭐⭐⭐（危品合规是法律红线，ROI 最高且风险最高的必做项）
数据门槛：SKU 危品/尺寸属性完整度 ≥98%，承运商能力数据库每月更新
风险：承运商能力数据库更新滞后导致误判，需建立月度核对 + 变更自动同步机制

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（302 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/tag_optimized_logistics_routing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Tag-Optimized-Logistics-Routing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Tag-Optimized Logistics Routing
SKU物流属性标签驱动智能配送路由

依赖：numpy, pandas
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import json


# ─── 1. SKU 物流标签体系 ──────────────────────────────────────────────────────

@dataclass
class SKULogisticsProfile:
    """SKU 物流属性标签（由 WMS/商品系统自动生成）"""
    sku_id: str
    # 重量体积标签
    weight_kg: float
    length_cm: float
    width_cm: float
    height_cm: float
    # 危品标签
    hazmat_type: Optional[str]   # None / "锂电池-UN3481" / "锂电池-UN3480" / "液体危品"
    # 温控标签
    temp_requirement: str        # "常温" / "冷藏(2-8°C)" / "冷冻(<-18°C)"
    # 时效标签
    urgency: str                 # "急单(≤3天)" / "标准(5-7天)" / "经济(≥10天)"
    # 目的地
    destination_country: str
    # 计算属性
    volume_weight_kg: float = 0.0

    def __post_init__(self):
        self.volume_weight_kg = round(self.length_cm * self.width_cm * self.height_cm / 5000, 2)
        self.billable_weight_kg = max(self.weight_kg, self.volume_weight_kg)

    @property
    def is_oversize(self) -> bool:
        max_side = max(self.length_cm, self.width_cm, self.height_cm)
        girth = 2 * (self.width_cm + self.height_cm)
        return max_side > 150 or (self.length_cm + girth) > 300

    @property
    def is_hazmat(self) -> bool:
        return self.hazmat_type is not None

    @property
    def needs_cold_chain(self) -> bool:
        return self.temp_requirement != "常温"


# ─── 2. 承运商能力数据库 ──────────────────────────────────────────────────────

@dataclass
class Carrier:
    """承运商能力档案"""
    carrier_id: str
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.02817，但该号在 arXiv 上是《Instabilities of Gauged Q-Balls》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 物流属性标签：weight_kg、长宽高 cm（据此算体积重与计费重）、危品标签（None / 锂电池-UN3481 / 锂电池-UN3480 / 液体危品）、温控标签（常温 / 冷藏 2-8 度 / 冷冻低于 -18 度）、时效标签（急单 3 天内 / 标准 5-7 天 / 经济 10 天以上）、目的国；以及承运商能力档案（资质、可达国家、限重限尺寸）、实时报价与历史时效达成率。

**输出**：输出过滤后的合规承运商清单与推荐的 Pareto 最优路由（含成本与时效）、备选渠道，以及每个 SKU 的体积重、计费重、是否超规、是否危品、是否需冷链的判定结果；供物流负责人发货选渠道与合规留档使用。

## 执行步骤

1. 由 SKU 尺寸重量算出体积重与计费重，判定是否超规
2. 读取危品与温控标签，过滤掉无对应资质的承运商渠道
3. 用各承运商实时报价与历史时效达成率构建成本与时效候选集
4. 取 Pareto 最优路由，输出推荐渠道与备选渠道
5. 标注标签误分类风险，提示每月核对承运商能力数据库

## 边界与不做

- 数据不满足时不用：SKU 危品与尺寸属性完整度低于 98%，或承运商能力数据库未按月更新时，判定结果不可靠。
- 只输出合规渠道与路由建议，不直接下单、不改动 SKU 标签；卡页提示标签误分类概率 8%，须人工复核后再发货。
- 卡页收益（含锂电危品扣关率从 18% 降至 1.5%、大件运费降低 20%、合计年化约 75 万元）为案例口径，落地前须用本店数据重算。

## 技能关联

- **前置**：Skill-3D-Bin-Packing-Optimization.html、Skill-3D-Bin-Packing-Optimization、Skill-Cross-Border-Last-Mile-Routing.html、Skill-Cross-Border-Last-Mile-Routing、Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Shipment-Ri[REDACTED].html、Skill-Shipment-Ri[REDACTED]、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **延伸**：Skill-3D-Bin-Packing-Optimization.html、Skill-3D-Bin-Packing-Optimization、Skill-Cross-Border-Last-Mile-Routing.html、Skill-Cross-Border-Last-Mile-Routing、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection
- **可组合**：Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-ML-Causal-Feature-Selection.html、Skill-Tag-ML-Causal-Feature-Selection、Skill-Tag-Optimized-Logistics-Routing

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Optimized-Logistics-Routing`