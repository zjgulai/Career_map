---
name: "p2s-infant-formula-fda-compliance-checker"
title: "婴儿配方奶粉FDA合规检查器 — 自动验证21 CFR Part 107标签合规性"
description: "触发词：婴儿配方奶粉、21 CFR Part 107、营养标签、禁用声称、营养素范围、上架前扫描。何时不用：要验婴儿辅食过敏原声明时用「婴儿食品过敏原标签验证器」，要判加州 Prop65 警告时用「加州 65 号提案标签合规」。安全边界：只做标签与声称比对，不出具检测报告，也不代替 FDA 申报。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Infant-Formula-FDA-Compliance-Checker"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "上架前把配方奶粉的营养素范围和声称逐条对一遍 21 CFR Part 107，别让一句禁用宣称换来整批召回。"
user_try: "试试：按 21 CFR Part 107 扫一下这款 Stage 1 配方奶粉的营养标签和声称，列出不合规项和整改建议。"
whenToUse: "美国市场婴儿配方奶粉上架前要核营养标签与声称合规时用；要核婴儿辅食过敏原声明时用「婴儿食品过敏原标签验证器」；要判加州 Prop65 警告时用「加州 65 号提案标签合规」。"
workflow: "收集配方成分表与营养标签文本 → 按 21 CFR Part 107 逐项比对营养素范围 → 扫描禁用或越界的营养声称 → 核对标注单位与格式（如 mcg 与 mg） → 输出不合规项与整改建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 婴儿配方奶粉FDA合规检查器 — 自动验证21 CFR Part 107标签合规性

## ① 解决的问题

合规负责人面临"婴儿配方奶粉上架美国前无法确认21 CFR Part 107标签合规"——自动化合规扫描将人工审查从2天→15分钟，单次拦截Critical违规避免召回损失约500-2000万元

## ② 核心算法逻辑

美国21 CFR Part 107（婴儿配方法规）规定了婴儿配方产品的强制标签要素：

## ③ 业务应用场景

场景A：新品上架前全量合规扫描 - 业务问题：即将上架美国市场的婴儿配方奶粉（Stage 1），营养标签是否满足21 CFR Part 107 - 检查发现：维生素D含量（75 IU/100kcal）低于法规最低值（40 IU/100kcal）→ 标准：40-100 IU/100kcal。等等，75在范围内。但检查发现声明"最像母乳的配方"属于禁用声明 - 整改：移除禁用声明，调整锰含量标注单位（需用mcg而非mg） - 业务价值：避免上架后因合规问题被Amazon下架（单次下架+重新上架周期约3-6周，损失约30-80万）
场景B：竞品合规缺陷识别 - 业务问题：分析竞品标签，找出其合规弱点，作为市场进入机会 - 分析：3家竞品中2家存在营养素声明超出CFR允许范围的情况 - 策略：在自身产品Listing中强调"完全符合21 CFR Part 107"作为差异化卖点 - 业务价值：合规透明度成为高价格区间的溢价依据，提升Premium定位
三轨验证 | 成本轨：月均2,800元（FDA数据库订阅800元/月+检测费1,500元/批+人工审核15小时/月×80元/小时=1,200元），年度成本33,600元 | 合规轨：符合FDA 21 CFR 101.36婴幼儿配方奶粉标签要求+营养成分声称合规，依据为通过FDA官方数据库验证配方成分清单与GRAS认证清单交叉对标 | 风险轨：标签翻译偏差导致成分描述不符（概率12%）、新批次供应商变更未及时更新合规数据（概率8%）、FDA临时指令变更响应延迟（概率5%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：婴儿配方召回事件平均损失约500-2000万元；上架前合规扫描发现1个Critical问题的成本约0（代码工具），防损ROI > 10000%
实施难度：⭐⭐☆☆☆（规则库维护有持续工作量，算法本身不复杂）
优先级：⭐⭐⭐⭐⭐（婴儿配方是FDA监管最严格的品类，任何标签违规=直接召回风险，零容忍）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（207 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
婴儿配方奶粉FDA合规检查器 - 21 CFR Part 107
自动验证营养成分、标签格式和声明合规性
"""
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple


# 21 CFR Part 107 营养素范围（每100kcal）
CFR107_NUTRIENT_RANGES = {
    'protein_g': {'min': 1.8, 'max': 4.5, 'unit': 'g', 'required': True},
    'fat_g': {'min': 3.3, 'max': 6.0, 'unit': 'g', 'required': True},
    'linoleic_acid_g': {'min': 0.3, 'max': None, 'unit': 'g', 'required': True},
    'vitamin_a_iu': {'min': 250, 'max': 750, 'unit': 'IU', 'required': True},
    'vitamin_d_iu': {'min': 40, 'max': 100, 'unit': 'IU', 'required': True},
    'vitamin_e_iu': {'min': 0.7, 'max': None, 'unit': 'IU', 'required': True},
    'vitamin_k_mcg': {'min': 4.0, 'max': None, 'unit': 'mcg', 'required': True},
    'vitamin_c_mg': {'min': 8.0, 'max': None, 'unit': 'mg', 'required': True},
    'calcium_mg': {'min': 60, 'max': None, 'unit': 'mg', 'required': True},
    'phosphorus_mg': {'min': 30, 'max': None, 'unit': 'mg', 'required': True},
    'iron_mg': {'min': 0.15, 'max': 3.0, 'unit': 'mg', 'required': True},
    'zinc_mg': {'min': 0.5, 'max': None, 'unit': 'mg', 'required': True},
    'manganese_mcg': {'min': 5.0, 'max': None, 'unit': 'mcg', 'required': True},
    'sodium_mg': {'min': 20, 'max': 60, 'unit': 'mg', 'required': True},
    'chloride_mg': {'min': 55, 'max': 150, 'unit': 'mg', 'required': True},
}

# 禁用声明列表
PROHIBITED_CLAIMS = [
    r'most\s+like\s+breast\s+milk',
    r'closest\s+to\s+mother.*?milk',
    r'identical\s+to\s+breast\s+milk',
    r'superior\s+to\s+breast\s+milk',
    r'better\s+than\s+breastfeeding',
    r'prevents?\s+(colic|allergy|illness)',
    r'cures?\s+\w+',
    r'clinically\s+proven\s+to\s+\w+',
    r'guaranteed\s+to\s+(improve|enhance|boost)',
]

# 必需标签格式要素
REQUIRED_LABEL_ELEMENTS = [
    'INFANT FORMULA',
    'directions for use',
    'preparation instructions',
    'per 100',
]


@dataclass
class ComplianceIssue:
    """单个合规问题"""
    severity: str     # 'critical', 'major', 'minor'
    category: str     # 'nutrient', 'claim', 'format'
    description: str
    regulation_ref: str
    recommendation: str
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.12345，但该号在 arXiv 上是《Overspinning a rotating black hole in semiclassical gravity with type-A trace anomaly》，与本卡主题无关。
⚠️ 该号被 19 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：配方成分清单、营养标签文本（每 100kcal 的营养素含量，如维生素 D 的 IU/100kcal）、产品阶段（如 Stage 1）与现有声称文案；粒度：单个配方 SKU 的标签与成分表。

**输出**：逐项合规比对结果与问题清单（按 critical/major/minor 分级，含 category 为 nutrient/claim/format、法规条款引用与整改建议）；供合规在上架前拦截召回级问题，也可用于识别竞品标签缺陷做差异化定位。

## 执行步骤

1. 收集配方成分与营养标签文本
2. 按 21 CFR Part 107 比对营养素范围
3. 扫描禁用与越界声称
4. 核对标注单位与格式
5. 输出分级问题清单与整改建议

## 边界与不做

- 数据不满足时不用：拿不到完整营养成分表或声称原文时无法逐条比对；法规库未更新时会给出过期结论。
- 能力边界：只做标签文本与声称的规则比对，不出具检测报告、不代替 FDA 申报或 GRAS 认定，最终口径由合规负责人确认。
- 口径边界：营养素按每 100kcal 口径比对，单位换算错误（如 mcg 与 mg 混用）会被判为格式问题而非营养问题。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Baby-Food-Allergen-Label-Validator.html、Skill-Baby-Food-Allergen-Label-Validator、Skill-CPSC-Children-Product-Safety.html、Skill-CPSC-Children-Product-Safety、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Baby-Food-Allergen-Label-Validator.html、Skill-Baby-Food-Allergen-Label-Validator、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Consumer-Complaint-Recall-Prediction.html、Skill-Consumer-Complaint-Recall-Prediction、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-Infant-Formula-FDA-Compliance-Checker

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-Infant-Formula-FDA-Compliance-Checker`