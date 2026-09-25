---
name: "p2s-dangerous-goods-dg-classification"
title: "Dangerous Goods Classification — 危险品自动分类（锂电池/液体/气溶胶跨境合规）"
description: "触发词：危险品分类、锂电池申报、空运合规预检、UN 编号查询、气溶胶限运。何时不用：只核对报关单证与 HS 编码用「关务资料检查」，要选运输路径与装载方式用「物流方案」类技能；本技能只输出危险品等级与申报要求。安全边界：分类结果仅供预检，最终申报文件须由 IATA 认证危险品专员（DGR）签字；同时含锂电池与液体的复合危险品必须人工复核。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 关务资料检查"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Dangerous-Goods-DG-Classification"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "输入电池容量、液体或气雾罐规格与运输方式，判出 UN 编号、包装说明和申报要求，避免漏申报被扣货。"
user_try: "试试：婴儿监视器含 3.7V 6000mAh 锂电池要空运到美国，需要什么 UN 编号和包装说明？"
whenToUse: "有产品电池电压容量或液体、气雾罐规格，且已明确运输方式与目的地、需要判定危险品等级与申报要求时用；只核对报关单证与 HS 编码用「关务资料检查」。"
workflow: "收集产品规格与运输方式、目的地 → 按 IATA、IMDG 规则做危险品归类 → 按 Wh 或毫升阈值定位 UN 编号、包装说明与运输限制 → 标注 GREEN、YELLOW、RED 风险等级 → 生成申报要求清单并标出需人工复核项"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dangerous Goods Classification — 危险品自动分类（锂电池/液体/气溶胶跨境合规）

## ① 解决的问题

含锂电池母婴产品跨境航空运输因未申报危险品被海关扣押——引入 DG 自动分类引擎（IATA/IMDG 规则库+LLM 解析），合规预检准确率 96%，避免平均每次扣押损失8万元+14天延误。

## ② 核心算法逻辑

核心思想：母婴产品中含锂电池（电动推车/婴儿监视器）、液体（奶粉/护肤品）、气溶胶（驱蚊喷雾）的 SKU 受 IATA/IMDG/ADR 危险品法规约束，不同运输方式（航空/海运/陆运）规定不同。自动分类系统通过规则引擎 + ML 模型从产品属性中判断危险品等级，输出对应运输规范。

## ③ 业务应用场景

场景1：含锂电池婴儿监视器跨境航空运输合规 - 业务问题：婴儿监视器含 3.7V 6000mAh 锂电池（= 22.2Wh），航空运输时运营未申报危险品导致被海关扣押，延误 14 天损失 8 万元 - 数据要求：产品规格（电压/容量）+ 运输方式（空运/海运）+ 目的地（US/EU） - 预期产出：UN 编号（UN3481）+ 适用包装说明（PI966 Section II）+ 申报要求清单 - 业务价值：避免危险品未申报扣押和罚款，年化保护物流通畅价值 20-50 万元
**三轨验证**： - 成本：规则引擎开发约 3 人天，法规数据库维护约 0.5 人/季度 - 合规：系统辅助分类，最终申报文件须由 IATA 认证危险品专员（DGR）签字 - 风险：自动分类可能遗漏复合危险品（如既含锂电池又含液体的产品），需人工复核

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：避免危险品未申报导致的扣押/罚款/延误，单次事件损失 5-50 万元；年化保护航空物流通畅价值 20-80 万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：锂电池监管日趋严格（2024 年 IATA 更新），含电子产品的母婴 SKU 大幅增加；合规失误代价远高于工具建设成本，且规则相对确定性强（适合规则引擎）。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（99 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 56 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class DGClassification:
    un_number: str
    proper_shipping_name: str
    hazard_class: str
    packing_instruction: str
    transport_restriction: str
    risk_level: str  # GREEN / YELLOW / RED

def classify_lithium_battery(voltage_v: float, capacity_mah: float,
                              in_equipment: bool = True) -> DGClassification:
    """锂电池危险品分类（IATA PI965-PI970）"""
    wh = voltage_v * capacity_mah / 1000  # 转换为 Wh
    un = "UN3481" if in_equipment else "UN3480"
    psn = ("Lithium ion batteries contained in equipment"
           if in_equipment else "Lithium ion batteries")
    if wh <= 100:
        section = "Section II"
        restriction = "客货机均可（需声明）"
        risk = "GREEN"
    elif wh <= 160:
        section = "Section IB"
        restriction = "客货机均可（需额外申报）"
        risk = "YELLOW"
    else:
        section = "Section I"
        restriction = "仅限货机，禁止客机"
        risk = "RED"
    pi_map = {
        "UN3481": {"Section II": "PI966", "Section IB": "PI966", "Section I": "PI965"},
        "UN3480": {"Section II": "PI965", "Section IB": "PI965", "Section I": "PI965"},
    }
    return DGClassification(
        un_number=un,
        proper_shipping_name=psn,
        hazard_class="Class 9",
        packing_instruction=pi_map[un].get(section, "PI965"),
        transport_restriction=f"{section}: {restriction}",
        risk_level=risk,
    )

def classify_aerosol(volume_ml: float, flammable: bool = True) -> DGClassification:
    """气溶胶分类（UN1950）"""
    if volume_ml <= 50:
        restriction = "客货机可运，Q值≤1"
        risk = "GREEN"
    elif volume_ml <= 120:
        restriction = "货机仅限，需申报"
        risk = "YELLOW"
    else:
        restriction = "禁止航空运输"
        risk = "RED"
    return DGClassification(
        un_number="UN1950",
        proper_shipping_name="Aerosols, flammable" if flammable else "Aerosols",
        hazard_class="Class 2.1" if flammable else "Class 2.2",
        packing_instruction="PI203",
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：产品规格：电池电压 V 与容量 mAh（或液体、气雾罐容量 ml）及是否装在设备内；运输方式（空运、海运、陆运）；目的地（如 US、EU）。粒度：单个 SKU 加本次运输方式。

**输出**：每个 SKU 的危险品分类结果：UN 编号、正式运输名称、危险类别、包装说明（如 PI966、PI965、PI203）、Section 等级与运输限制（客机可否、是否需额外申报）、GREEN/YELLOW/RED 风险等级，以及申报要求清单；供运营备货和申报专员复核使用。

## 执行步骤

1. 收集待发 SKU 的产品规格（电池电压与容量、液体或气雾罐容量）与运输方式、目的地
2. 套用 IATA、IMDG 规则库对产品属性做危险品归类
3. 按 Wh 或毫升阈值判定 UN 编号、包装说明与运输限制
4. 标注 GREEN、YELLOW、RED 风险等级与是否需要额外申报
5. 生成申报要求清单，并提示需 IATA 认证专员复核的复合危险品

## 边界与不做

- 数据不满足时不用：缺电池电压容量或液体、气雾罐规格，或未标明运输方式与目的地，分类结果不可靠。
- 只输出分类与申报要求参考，不生成或代签正式申报文件；卡页置信度为 medium，且明确复合危险品可能被遗漏，须人工复核。
- 卡页 ROI（单次事件损失 5-50 万元、年化保护航空物流通畅价值 20-80 万元）为估算口径，落地前须用本店实际数据重算。

## 技能关联

- **可组合**：Skill-Dangerous-Goods-DG-Classification

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：21-合规决策　·　源卡：`Skill-Dangerous-Goods-DG-Classification`