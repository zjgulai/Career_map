---
name: "p2s-last-mile-cost-per-zone-analytics"
title: "末程分区成本精算 — 农村/偏远/标准区域差异化成本分解与路线优化"
description: "触发词：分区成本、末程成本精算、偏远附加费、邮编分区、承运商优化。何时不用：要在多家承运商之间按实时标签逐单选商与切换用「承运商动态选择」，要算头程与末程的整体成本率用「跨境头程末程成本 KPI」；本技能只做邮编到分区的末程成本拆解。安全边界：分区映射与附加费口径须按承运商最新报价校准，模型不直接改运单或切换承运商。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Last-Mile-Cost-Per-Zone-Analytics"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "按邮编把末程成本拆到区域一级，找出被附加费吃掉利润的偏远订单，并说清换哪家承运商更省。"
user_try: "试试：这批订单里哪些是偏远高成本区域？改用 USPS 大概能省多少钱？"
whenToUse: "已有邮编级运费与附加费数据、要定位高成本区域并给承运商建议时用；要按实时标签逐单动态选商用「承运商动态选择」，要算头程末程整体成本率用「跨境头程末程成本 KPI」。"
workflow: "建立邮编到分区的映射，为每单打上分区标签 → 按分区计算基础运费与附加费，汇总每单末程总成本 → 识别高成本区域及其订单占比 → 为高成本分区给出推荐承运商与可节省金额 → 汇总分区成本分布，输出优化建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 末程分区成本精算 — 农村/偏远/标准区域差异化成本分解与路线优化

## ① 解决的问题

物流面临"偏远区域附加费侵蚀利润但无法量化"——分区精算识别高成本区域改用USPS，年均1000件偏远订单节省$6,000-12,000

## ② 核心算法逻辑

末程分区成本精算 将"单均物流成本"拆解到邮政编码/行政区域级别，识别高成本区域并制定差异化策略。

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：识别高成本偏远区域订单（约15-20%），改用USPS可节省$6-12/件，年均1000件偏远订单节省约$6,000-12,000
实施难度：⭐⭐☆☆☆（主要是邮编分区数据库建立）
优先级评分：⭐⭐⭐⭐☆（末程成本是物流成本最大变量，分区精算是降本的精细化工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（163 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/last_mile_cost_per_zone_analytics` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Last-Mile-Cost-Per-Zone-Analytics.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
末程分区成本精算系统
功能：邮编分区映射 / 附加费计算 / 高成本区域识别 / 承运商优化建议
"""
from dataclasses import dataclass, field
from collections import Counter
import warnings
warnings.filterwarnings('ignore')


ZONE_CONFIG = {
    "URBAN":        {"base_cost": 4.5, "surcharge": 0.0, "best_carrier": "any"},
    "SUBURBAN":     {"base_cost": 5.0, "surcharge": 2.0, "best_carrier": "fedex_ground"},
    "RURAL":        {"base_cost": 5.0, "surcharge": 8.0, "best_carrier": "usps"},
    "REMOTE":       {"base_cost": 5.0, "surcharge": 15.0, "best_carrier": "usps"},
    "EXTREME":      {"base_cost": 5.0, "surcharge": 42.0, "best_carrier": "usps_priority"},
}

ZONE_MAPPING = {
    "10001": "URBAN", "10002": "URBAN", "10003": "URBAN",
    "90210": "SUBURBAN", "90211": "SUBURBAN",
    "60601": "URBAN", "60602": "URBAN",
    "59001": "RURAL", "59002": "RURAL", "59003": "RURAL",
    "99501": "EXTREME", "99502": "EXTREME",
    "77001": "SUBURBAN", "77002": "SUBURBAN",
    "19101": "URBAN", "19102": "URBAN",
    "98001": "REMOTE", "98002": "REMOTE",
    "85001": "SUBURBAN", "85002": "SUBURBAN",
}


def classify_zip_zone(zip_code: str) -> str:
    """邮编分区逻辑：优先查表，否则启发式分类"""
    if zip_code in ZONE_MAPPING:
        return ZONE_MAPPING[zip_code]
    
    if zip_code[:3] in ["100", "101", "102", "900", "601", "191"]:
        return "URBAN"
    elif zip_code[:3] in ["997", "998", "999"]:
        return "EXTREME"
    elif zip_code[:3] in ["590", "980"]:
        return "REMOTE"
    elif zip_code[0] in ["5", "6", "7", "8"]:
        return "RURAL"
    else:
        return "SUBURBAN"


@dataclass
class DeliveryZoneAnalysis:
    zip_code: str
    zone_type: str
    base_cost_usd: float
    surcharge_usd: float
    total_cost_usd: float
    best_carrier: str
    is_high_cost: bool
    tags: dict = field(default_factory=dict)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2308.11234。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：订单或邮编级：收货邮编、分区类型（城区/近郊/农村/偏远/极偏远）、基础运费、附加费、末程总成本、可用承运商及其分区报价；需要一份邮编到分区的映射表，表内未覆盖的邮编用启发式规则兜底。

**输出**：每一单的分区归类、基础运费与附加费拆解、末程总成本、是否高成本标记与推荐承运商，以及按分区汇总的成本分布和承运商优化建议；供物流与财务定位高成本区域、制定差异化末程策略使用。

## 执行步骤

1. 把订单收货邮编映射到城区、近郊、农村、偏远、极偏远五类分区
2. 按分区套用基础运费与附加费，算出每单的末程总成本
3. 标记高成本区域，统计其订单占比
4. 为每类分区给出推荐承运商与改用后的成本差
5. 汇总偏远订单的节省空间，输出分区成本报告

## 边界与不做

- 数据不满足时不用：缺邮编或附加费字段无法分区与算总成本，映射表未覆盖的区域只能启发式估计。
- 只做成本拆解与承运商建议，不直接改运单、改价或切换承运商。
- 卡页 ROI（偏远订单约 15-20%、换 USPS 每件省 6-12 美元、年均 1000 件偏远订单省约 6000-12000 美元）为估算口径，落地前须用本店实际数据重算。

## 技能关联

- **前置**：Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-First-Last-Mile-Cost-KPI-CrossBorder.html、Skill-First-Last-Mile-Cost-KPI-CrossBorder、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag
- **延伸**：Skill-Dynamic-Carrier-Selection-Tag-Driven.html、Skill-Dynamic-Carrier-Selection-Tag-Driven、Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag
- **可组合**：Skill-Order-Routing-Intelligence-Engine.html、Skill-Order-Routing-Intelligence-Engine、Skill-Warehouse-Slotting-Optimization-Tag.html、Skill-Warehouse-Slotting-Optimization-Tag、Skill-Last-Mile-Cost-Per-Zone-Analytics

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：24-标签工程　·　源卡：`Skill-Last-Mile-Cost-Per-Zone-Analytics`