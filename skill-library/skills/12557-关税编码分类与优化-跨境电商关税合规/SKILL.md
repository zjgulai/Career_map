---
name: "p2s-hts-tariff-classification"
title: "HTS 关税编码分类与优化（跨境电商关税合规）"
description: "触发词：HTS 编码查询、税率对比、Section 301、重分类裁定、睡袋归类。何时不用：要用多 Agent 共识与不确定性分流做批量分类用「HTS 多 Agent 分类」；要用 LLM 分层推理加 GRI 依据做节税方案用「HTS 关税分类与节税」。安全边界：编码变更须走正式重分类或裁定流程，不得自行改单；不构成海关法律意见。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-125"
l3_business: "税务资料"
l3_all: "税务资料 / 关务资料检查"
l1_l2_l3: "独立控制/财务与合规/税务资料"
p2s_card_id: "Skill-HTS-Tariff-Classification"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "查母婴品类各 SKU 的 HTS 编码、基础关税与附加税率，比较备选编码找出合法节税空间。"
user_try: "试试：查一下婴儿有机棉睡袋和含防窒息功能睡袋的编码与总税率差异，评估重分类的可行性。"
whenToUse: "需要按品类查编码、比基础关税与 Section 301 附加税率并评估重分类路径时用本技能；批量多 Agent 分类用「HTS 多 Agent 分类」；LLM 分层推理加 GRI 依据用「HTS 关税分类与节税」。"
workflow: "对比产品功能描述，识别目标编码的适用条件 → 向 CBP 提交 Form 484 申请重分类裁定 → 向报关行提供 FDA 等清关证明文件支撑新编码 → 重分类完成后核算税率与年度节税金额"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HTS 关税编码分类与优化（跨境电商关税合规）

## ① 解决的问题

吸奶器套装被默认归类为液体泵（关税 3%）而非呼吸治疗器具（0%），每年多付 15 万元关税——AI 驱动 HTS 精准分类识别节税机会，配合 CBP Binding Ruling 申请实现合规节税 20-200 万元/年

## ② 核心算法逻辑

论文：Hierarchical Multilabel Text Classification with Labelaware Attention for HS Code Prediction | 年份：2021

## ③ 业务应用场景

业务问题（场景 A）：某母婴品牌新品吸奶器套装（含电动泵 + 配件），清关时被归类为 `8413.19`（液体泵，关税 3%）而非 `9019.20`（呼吸治疗装置，关税 0%），每年多付约 15 万元关税。
纠正路径： 1. 对比产品功能描述 → 识别 `9019.20` 的适用条件（乳腺增强/医疗辅助功能） 2. 向 CBP 提交 Form 484 申请重分类裁定 3. 同时向报关行提供 FDA 510k 清关文件作为 `9019.20` 的证明材料 4. 重分类完成后：关税从 3% → 0%，年省约 15 万元
业务问题（场景 B）：婴儿有机棉睡袋，纯棉编织物可能归为 `6307.90`（其他制成品，10% + 7.5% Section 301 = 17.5% 总税率），而功能性睡袋（含防窒息功能）可归为 `6302.10`（婴儿用床上用品，0% 基础关税）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

规则引擎（确定性品类）：低难度，1 周上线
ML 分类器（模糊品类）：中等，需 CBP 历史数据训练
Binding Ruling 申请：低技术难度，高文档工作量

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 55 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/compliance/hts_tariff_classification` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-HTS-Tariff-Classification.md`），已与卡面节选核对，不依赖上述路径。

```python
import json

# HTS 编码数据库（母婴核心品类）
HTS_DATABASE = {
    # 喂养类
    "breast_pump_electric": {
        "code": "9019.20.0000",
        "description": "呼吸治疗器具及雾化器",
        "us_tariff_rate": 0.0,
        "section_301": False,
        "notes": "需提供 FDA 510k 或医疗辅助功能说明",
        "alternative": {
            "code": "8413.19.0000",
            "description": "液体泵（其他）",
            "us_tariff_rate": 0.03,
            "risk": "被重分类风险低，但税率高于 9019.20",
        }
    },
    "infant_formula": {
        "code": "1901.10.0000",
        "description": "婴儿配方食品",
        "us_tariff_rate": 0.0,
        "section_301": False,
        "notes": "FDA 21 CFR 107 强制监管，进口需 FDA 通知",
    },
    "baby_monitor_wifi": {
        "code": "8525.89.3000",
        "description": "无线传输图像/声音设备",
        "us_tariff_rate": 0.0,
        "section_301": False,
        "notes": "FCC Part 15 认证必须，WiFi 设备通常享受 ITA 协议 0% 税率",
    },
    "wooden_toy": {
        "code": "9503.00.0090",
        "description": "玩具（其他，木制）",
        "us_tariff_rate": 0.0,
        "section_301": False,
        "notes": "9503 类玩具通常 0% 基础关税，Section 301 免除",
    },
    "baby_clothing_organic": {
        "code": "6111.20.6010",
        "description": "婴儿棉质服装",
        "us_tariff_rate": 0.148,  # 14.8%
        "section_301": True,
        "section_301_rate": 0.075,  # 7.5%
        "total_rate": 0.223,
        "notes": "服装品类关税较高，优先评估产地多元化（越南/孟加拉）",
        "optimization": "越南制造可享受 MFN 基础税率 14.8%（不触发 Section 301）",
    },
    "baby_sleep_sack": {
        "code": "6302.10.0010",
        "description": "婴儿床上用品（含功能性睡袋）",
        "us_tariff_rate": 0.0,
        "section_301": False,
        "alternative": {
            "code": "6307.90.9889",
            "description": "其他纺织制成品",
            "us_tariff_rate": 0.07,
            "section_301_rate": 0.075,
            "risk": "若无防窒息功能说明，可能被归为 6307.90",
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.08728，但该号在 arXiv 上是《Revealing Persona Biases in Dialogue Systems》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Hierarchical Multilabel Text Classification with Labelaware Attention for HS Code Prediction》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品功能描述与材质信息、当前申报编码与历史清关记录，以及目的国适用的 HTS 编码与税率库（含 Section 301 等附加税率）。

**输出**：SKU 对应的 HTS 编码、基础与附加税率、备选编码及风险提示，以及重分类可行性判断，供关务与报关行使用。

## 执行步骤

1. 查表得到各 SKU 的 HTS 编码与税率
2. 对比备选编码的适用条件与税率差
3. 标注 Section 301 等附加税率与证明文件要求
4. 评估重分类可行性并给出申报调整路径

## 边界与不做

- 品类不在编码库覆盖范围、或缺少功能描述与证明材料时不适用，重分类缺少依据
- 只做编码查询、税率对比与路径建议，不代替报关行申报，也不构成法律意见
- 编码调整必须走 Form 484 或正式裁定流程，不得自行改单申报

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **延伸**：Skill-Compliant-Dynamic-Pricing-Guard.html、Skill-Compliant-Dynamic-Pricing-Guard、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning、Skill-Supply-Chain-Due-Diligence.html、Skill-Supply-Chain-Due-Diligence
- **可组合**：Skill-HTS-Tariff-Classification

---

> 分类：独立控制/财务与合规/税务资料　·　技术族：21-合规决策　·　源卡：`Skill-HTS-Tariff-Classification`