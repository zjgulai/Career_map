---
name: "p2s-california-prop65-label-check"
title: "加州65号提案标签合规 — 母婴产品化学物质自动检查"
description: "触发词：加州 65 号提案、Prop65 警告、NSRL、MADL、化学物质比对、暴露量计算。何时不用：要核欧盟 REACH 限制物质时用「REACH 化学品合规」，要办欧盟 EPR 注册与包装标签时用「EPR 标签体系」。安全边界：输出为标签合规判断与警告语模板，不代替律师出具法律意见，也不代理已发生的诉讼应对。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-California-Prop65-Label-Check"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "进加州市场的母婴产品，先算清铅、BPA、甲醛这些物质要不要挂 Prop65 警告，别等消费者起诉才补标签。"
user_try: "试试：这份婴儿玩具的铅检测是 15 ppm，帮我判断加州 Prop65 要不要加警告，并给出警告语模板。"
whenToUse: "母婴产品销往加州、需按检测结果判断是否触发 Prop65 警告时用；要核欧盟化学品限制时用「REACH 化学品合规」；要办欧盟包装注册与标签时用「EPR 标签体系」。"
workflow: "收集第三方检测报告、材质清单与用户年龄段 → 把检出物质按 CAS 号与 Prop65 物质库比对 → 按 NSRL/MADL 阈值与接触场景计算暴露量 → 判定是否需警告或可否豁免 → 输出警告语模板与加州销售标签方案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 加州65号提案标签合规 — 母婴产品化学物质自动检查

## ① 解决的问题

产品团队面临"进入加州市场的母婴产品因Prop65标签缺失被投诉起诉"——自动Prop65合规检查将上架前标签遗漏率从35%降至<1%，年化避免加州诉讼和赔偿风险100-500万元

## ② 核心算法逻辑

加州《安全饮用水和有毒物质执行法》（Proposition 65，2018 年 Safe Harbor 警告修订）要求：凡产品含加州认定有害物质（900+ 种，含致癌/生殖毒性）且暴露量超过「无显著风险水平（NSRL）」，必须在产品或包装上附加警告语。

## ③ 业务应用场景

场景1：Amazon 美国站婴儿玩具铅含量标签审查 - 业务问题：供应商检测报告含铅 15 ppm（低于 CPSC 100 ppm 限值），但 Prop65 铅 NSRL 仅 0.5 µg/day，婴儿口腔接触场景下仍需警告 - 数据要求：第三方检测报告（SGS/Intertek）+ 产品材质清单 + 目标用户年龄段 - 预期产出：Prop65 命中物质列表 + 是否需要警告判断 + 合规警告语模板 - 业务价值：规避 Prop65 诉讼（每件产品每天 $2,500 民事处罚），年化风险规避价值 $50K+
场景2：婴儿床品甲醛 Prop65 合规自查 - 业务问题：进口纺织品甲醛检测合格，但 Prop65 对甲醛单独有 NSRL 要求 - 数据要求：甲醛释放量测试结果（mg/kg）+ 床品使用场景参数 - 预期产出：暴露量计算书 + 是否豁免判断 + 销售加州市场的标签方案
**三轨验证**：成本（律师费 $5K/案 → 自动化规避）/ 合规（900+ 物质全库比对）/ 风险（公益诉讼 → 零容忍）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：Prop65 每天每件产品 $2,500 民事处罚，品牌公益诉讼平均和解金 $30K–$200K；自动化审查将漏检率从人工的 20% 降至 <2%
实施难度：⭐⭐⭐☆☆（物质库需年度更新，核心计算逻辑稳定）
优先级：⭐⭐⭐⭐⭐（Prop65 是母婴品类最高频诉讼来源，且任何消费者均可起诉，零容忍）
评估依据：加州市场占美国母婴电商 22% 份额，Prop65 诉讼案件近年年增 15%；提前合规是规模化进入加州市场的必要条件。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（189 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import Optional

# Prop65 高频母婴物质库（NSRL µg/day，MADL µg/day，-1 表示无该阈值）
PROP65_SUBSTANCES: dict[str, dict] = {
    "lead": {
        "cas": "7439-92-1", "type": "both",
        "nsrl_ug_day": 0.5,    # 致癌
        "madl_ug_day": 0.5,    # 生殖毒性
        "category": "heavy_metal",
    },
    "bpa": {
        "cas": "80-05-7", "type": "reproductive",
        "nsrl_ug_day": -1,
        "madl_ug_day": 3.0,
        "category": "plasticizer",
    },
    "dehp": {
        "cas": "117-81-7", "type": "reproductive",
        "nsrl_ug_day": -1,
        "madl_ug_day": 91.0,
        "category": "phthalate",
    },
    "cadmium": {
        "cas": "7440-43-9", "type": "carcinogen",
        "nsrl_ug_day": 0.03,
        "madl_ug_day": 4.1,
        "category": "heavy_metal",
    },
    "formaldehyde": {
        "cas": "50-00-0", "type": "carcinogen",
        "nsrl_ug_day": 40.0,
        "madl_ug_day": -1,
        "category": "voc",
    },
    "acrylamide": {
        "cas": "79-06-1", "type": "both",
        "nsrl_ug_day": 0.2,
        "madl_ug_day": 140.0,
        "category": "food_contaminant",
    },
}

# 接触场景暴露系数（单位体重 µg/day per mg/kg）
EXPOSURE_SCENARIOS: dict[str, float] = {
    "oral_infant_toy": 8.0,       # 婴儿口腔接触玩具
    "skin_contact_textile": 0.5,  # 皮肤接触床品
    "inhalation_indoor": 0.1,     # 室内吸入
    "food_contact_plastic": 3.0,  # 食品接触塑料
}

PROP65_WARNING_TEMPLATE = (
    "WARNING: This product can expose you to {substance}, which is known to the "
    "State of California to cause {harm_type}. "
    "For more information go to www.P65Warnings.ca.gov."
)


@dataclass
class Prop65Finding:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：第三方检测报告（如 SGS/Intertek，含物质与含量，如铅 15 ppm、纺织品甲醛释放量 mg/kg）、产品材质清单、目标用户年龄段与使用场景参数（如婴儿口腔接触）；粒度：单个 SKU × 单种物质。

**输出**：Prop65 命中物质列表（含 CAS 号与 nsrl_ug_day、madl_ug_day 阈值）、是否需警告的判断与暴露量计算书、合规警告语模板（WARNING: This product can expose you to ... www.P65Warnings.ca.gov）及加州标签方案；供产品团队与合规审核使用。

## 执行步骤

1. 收集检测报告、材质清单与年龄段参数
2. 按 CAS 号与 Prop65 物质库比对
3. 用 NSRL/MADL 阈值与接触场景算暴露量
4. 判定是否需警告或可豁免
5. 输出警告语模板与标签方案

## 边界与不做

- 数据不满足时不用：没有第三方检测报告或材质清单、或物质库未按年度更新时，判断结论不可靠。
- 能力边界：只做标签合规判断与警告语生成，不代替律师意见、不代理诉讼应对，也不保证豁免认定成立。
- 口径边界：CPSC 限值与 Prop65 阈值是两套口径（如铅 CPSC 100 ppm 与 Prop65 铅 NSRL 0.5 µg/day），不能互相替代。

## 技能关联

- **可组合**：Skill-California-Prop65-Label-Check

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-California-Prop65-Label-Check`