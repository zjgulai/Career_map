---
name: "p2s-cross-system-data-reconciliation"
title: "跨系统数据对账 — ERP/WMS/OMS三系统库存一致性自动比对与差异处置"
description: "触发词：库存对账、跨系统比对、ERP、WMS、OMS、差异处置。何时不用：库存只有单一数据源时无需对账；要追问数据来源与影响面走血缘追踪。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Cross-System-Data-Reconciliation"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把 ERP、WMS、FBA 几套库存数字每天自动对一次，差异直接给出处置建议。"
user_try: "试试：把 ERP、WMS、FBA 三边的库存拉齐对一遍，把差异原因分出来。"
whenToUse: "同一批库存散在多个系统、数字对不上且影响补货或平台申诉时用；只有单一数据源时无需对账。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 跨系统数据对账 — ERP/WMS/OMS三系统库存一致性自动比对与差异处置

## ① 解决的问题

运营面临"ERP/WMS/FBA三套库存数字不一致无从判断"——自动对账从月度盘点→每日自动，防止超卖和缺货年化节省5-10万元

## ② 核心算法逻辑

跨系统对账 解决：ERP显示库存100件，WMS显示95件，Amazon FBA显示88件——哪个是真的？

## ③ 业务应用场景

（卡页此段是占位串，未承载业务场景；可读的落地口径见下方「执行步骤」与「输入 / 输出契约」。）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：自动对账将库存差异发现从"月度盘点"→"每日自动"，减少因库存数据不准导致的超卖/缺货，年化节省约5-10万元；Amazon FBA差异申诉成功率提升，每年追回约$1,000-3,000赔款
实施难度：⭐⭐⭐☆☆（需要各系统API接入，主要是技术集成工作）
优先级评分：⭐⭐⭐⭐⭐（多平台运营的品牌，库存数据不准是日常噩梦，自动对账是基础必须）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（110 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'elif' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/cross_system_data_reconciliation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Cross-System-Data-Reconciliation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
跨系统数据对账引擎
功能：三系统对账 / 差异计算 / 根因分类 / 自动处置建议 / 对账Tag生成
"""
from dataclasses import dataclass, field
import warnings
warnings.filterwarnings('ignore')


@dataclass
class SystemInventory:
    sku_id: str
    system_name: str
    qty: int
    reserved_qty: int = 0
    in_transit_qty: int = 0
    timestamp: str = ""


@dataclass
class ReconciliationResult:
    sku_id: str
    erp_qty: int
    wms_qty: int
    oms_available: int
    fba_sellable: int
    max_discrepancy: int
    discrepancy_status: str  # OK / MINOR / MAJOR / CRITICAL
    root_cause: str
    recommended_action: str
    tags: dict = field(default_factory=dict)


def reconcile_inventory(erp: SystemInventory, wms: SystemInventory,
                         oms: SystemInventory, fba: SystemInventory = None) -> ReconciliationResult:
    """执行四系统库存对账"""
    values = [erp.qty, wms.qty, oms.available if hasattr(oms, 'available') else oms.qty]
    if fba:
        values.append(fba.qty)

    max_val = max(values)
    min_val = min(values)
    max_discrepancy = max_val - min_val
    discrepancy_pct = max_discrepancy / max(1, max_val) * 100

    # 严重程度
    if discrepancy_pct < 2:
        status = "OK"
    elif discrepancy_pct < 5:
        status = "MINOR"
    elif discrepancy_pct < 15:
        status = "MAJOR"
    else:
        status = "CRITICAL"

    # 根因推断
    if erp.qty > wms.qty + 5:
        root_cause = "ERP_WMS_SYNC_DELAY"
        action = "检查近期入库单是否已在WMS确认扫描"
    elif wms.qty > (oms.qty if hasattr(oms, 'qty') else oms.qty) + 5:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11234，但该号在 arXiv 上是《Towards medhub: A Self-Service Platform for Analysts and Physicians》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各系统的库存快照（SKU、系统名、可用量、预留量、在途量、时间戳），按 SKU 对齐

**输出**：按 SKU 的差异清单与根因分类、自动处置建议与对账 Tag，供运营处置与平台差异申诉使用

## 执行步骤

1. 接入各系统库存快照并按 SKU 对齐（统一预留量与在途量口径）。
2. 计算三方差异，并对差异做根因分类（口径差异、时点差异、真实缺货等）。
3. 按差异类型给出自动处置建议并生成对账 Tag。
4. 把无法自动处置的差异推给人工，并留存结果供申诉使用。

## 边界与不做

- 何时不用：库存数据只有单一来源时对账没有对象；要追问数据来源与影响面请转血缘追踪。
- 能力边界：只产出差异判定与处置建议，不代执行库存调整或平台申诉提交。
- 能力边界：对账结论依赖各系统口径统一，口径未对齐前差异会长期存在。

## 技能关联

- **前置**：Skill-Healthy-Inventory-Three-Layer-KPI.html、Skill-Healthy-Inventory-Three-Layer-KPI、Skill-Inventory-Event-Sourcing-Architecture.html、Skill-Inventory-Event-Sourcing-Architecture、Skill-SKU-Master-Data-Golden-Record.html、Skill-SKU-Master-Data-Golden-Record、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **延伸**：Skill-Healthy-Inventory-Three-Layer-KPI.html、Skill-Healthy-Inventory-Three-Layer-KPI、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Healthy-Inventory-Three-Layer-KPI.html、Skill-Healthy-Inventory-Three-Layer-KPI、Skill-Cross-System-Data-Reconciliation

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：24-标签工程　·　源卡：`Skill-Cross-System-Data-Reconciliation`