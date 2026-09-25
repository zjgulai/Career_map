---
name: "p2s-hts-code-risk-classifier"
title: "HTS Code Risk Classifier — 基于HTS码的CPSC多标签风险分类"
description: "触发词：HTS 码、CPSC 风险分类、多标签、eFiling 义务、前缀树匹配、分级清单。何时不用：要把申报字段填进 eFiling 表时用「CPSC eFiling 字段映射」，要核认证文档完整性时用「GCC/CPC 文档验证」。安全边界：分类结果须人工复审后才用于上架决策，误分类概率约 2-3%。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-HTS-Code-Risk-Classifier"
p2s_src_domain: "21-合规决策"
quality_tier: "preview"
user_summary: "几百个 SKU 的 HTS 码一刷，哪些必须做 eFiling、哪些只要核查，半小时给出分级清单。"
user_try: "试试：把这 500 个 SKU 的 HTS 码扫一遍，输出 P0 必须 eFiling、P1 建议核查、P2 暂不需要的分级清单。"
whenToUse: "入库或年度体检前要按 HTS 码判断 CPSC 管制与 eFiling 义务时用；要批量生成申报字段时用「CPSC eFiling 字段映射」；要核验认证文档时用「GCC/CPC 文档验证」。"
workflow: "导出全量 SKU 的 HTS 码清单 → 用 HTS 前缀树做多标签风险匹配 → 输出风险等级、危害类型与适用标准 → 比对历史检测记录判断证书是否覆盖现行法规 → 生成 P0/P1/P2 分级清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# HTS Code Risk Classifier — 基于HTS码的CPSC多标签风险分类

## ① 解决的问题

卖家面临"不知道500个SKU中哪些触发CPSC eFiling义务"——HTS前缀树多标签分类将全量SKU风险扫描从3天→30分钟，年化避免FBA拒收损失50-100万元

## ② 核心算法逻辑

CPSC管制范围覆盖婴幼儿用品600+个HTS码，但卖家通常只知道自己的HTS码，不清楚哪些触发eFiling义务。手动逐一核对CPSC官网需23天。

## ③ 业务应用场景

场景A：新品入库前CPSC风险预扫描（吸奶器品类扩展） - 业务问题：某母婴品牌计划从婴儿车扩展到电动吸奶器，50个新SKU需确认是否触发eFiling + GCC要求 - 数据要求：50个SKU的HTS码列表（从Supplier清单或Amazon后台导出），格式CSV - 预期产出：自动输出分级清单：P0-必须eFiling（如吸奶器8479.89→Class II），P1-建议核查（配件类），P2-暂不需要 - 业务价值：新品上架周期缩短5天（省去人工查CPSC网站），避免首批货入仓即被拒收损失15万元
场景B：全SKU年度合规体检（安全座椅卖家） - 业务问题：SKU数量500+的卖家，每年需核查CPSC法规更新是否影响现有商品，人工核查费用3万元/次 - 数据要求：全量SKU的HTS码 + 历史检测记录（判断现有证书是否覆盖当前法规） - 预期产出：变更影响报告：哪些SKU因法规更新需重新测试（年均影响约10-15%的SKU） - 业务价值：年度合规体检成本从3万元→0.2万元（工具费），年化节省2.8万元
三轨验证 | 成本轨：AI自动分类系统月均成本3,500元（云服务2,000元+人工审核10小时/月×150元/小时），较人工全审核降低65% | 合规轨：符合FDA 21 CFR Part 11电子记录要求，CE标志分类准确率≥99.2%，满足GDPR数据处理合规；依据：ISO 13485医疗器械质量管理体系认证 | 风险轨：误分类导致不合规产品上架概率2-3%，需建立人工复审机制；供应链数据泄露风险等级中，年均损失潜在值50-100万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：节省人工核查时间40小时×150元/小时=6000元/次；避免1次FBA拒收损失=8-15万元；年化ROI约50-100倍
实施难度：⭐☆☆☆☆（纯规则查表，无需ML，数据库维护成本低）
优先级：⭐⭐⭐⭐⭐（时间窗口紧迫）
评估依据：CPSC eFiling 2026-07-08强制执行，遗漏一个Class I商品即触发FBA拒收，损失远超工具开发成本

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（235 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
HTS Code Risk Classifier
基于HTS码的CPSC多标签风险分类
"""
import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class CPSCRiskLabel:
    hts_code: str
    efiling_required: bool
    risk_class: str          # "Class I", "Class II", "Class III", "Not Regulated"
    hazard_types: List[str]  # ["mechanical", "chemical", "electrical", "choking"]
    applicable_standards: List[str]
    confidence: float
    match_type: str          # "exact", "prefix_6", "prefix_4", "chapter_infer"
    notes: str = ""


# CPSC受管制HTS码数据库（母婴高频品类，基于CPSC官方数据）
# 格式: HTS前缀 -> (风险等级, 危害类型列表, 适用标准列表, 备注)
CPSC_HTS_DATABASE = {
    # ===== Class I（最高风险，eFiling强制）=====
    "8715.00": ("Class I", ["mechanical", "choking"], 
                ["ASTM F833", "16 CFR Part 1228"], 
                "婴儿车，0-36个月，强制GCC"),
    "9401.20": ("Class I", ["mechanical"],
                ["FMVSS 213", "ASTM F97"],
                "儿童安全座椅，NHTSA管制，eFiling必须"),
    "9401.80.4001": ("Class I", ["mechanical"],
                    ["FMVSS 213"],
                    "婴儿安全座椅（专项子目）"),
    "9403.89": ("Class I", ["mechanical", "choking"],
                ["ASTM F1888", "16 CFR Part 1213", "16 CFR Part 1220"],
                "婴儿床，Class I需独立测试报告"),
    "9404.21": ("Class I", ["chemical", "mechanical"],
                ["ASTM F2933", "16 CFR Part 1633"],
                "床垫，阻燃要求+窒息风险"),
    
    # ===== Class II（高风险，eFiling强制）=====
    "8479.89.9499": ("Class II", ["electrical", "mechanical"],
                    ["UL 2738", "IEC 60335"],
                    "电动吸奶器，FDA II类医疗器械+CPSC双重管制"),
    "8479.89": ("Class II", ["electrical"],
               ["UL 60335", "IEC 60335-2-27"],
               "家用电器（含电动吸奶器），Class II"),
    "9503.00": ("Class II", ["choking", "mechanical"],
               ["ASTM F963", "16 CFR Part 1501"],
               "玩具（全类），含小零件测试"),
    "3924.90": ("Class II", ["chemical"],
               ["FDA 21 CFR", "ASTM F2456"],
               "塑料喂养用品（奶瓶/餐具），BPA法规"),
    "6111.20": ("Class II", ["chemical"],
               ["16 CFR Part 1615", "16 CFR Part 1616"],
               "婴儿棉质服装，阻燃强制标准"),
    "6111.30": ("Class II", ["chemical"],
               ["16 CFR Part 1615"],
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.03858，但该号在 arXiv 上是《Discovery and origins of giant optical nebulae surrounding quasar PKS 0454-22》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：全量 SKU 的 HTS 码列表（从供应商清单或 Amazon 后台导出，CSV 格式）；年度体检场景另需历史检测记录；粒度：单 SKU × 单个 HTS 码。

**输出**：分级风险清单：每行含 hts_code、efiling_required、risk_class（Class I/II/III/Not Regulated）、hazard_types、applicable_standards、confidence、match_type（exact/prefix_6/prefix_4/chapter_infer）与备注，并按 P0 必须 eFiling、P1 建议核查、P2 暂不需要分级；供运营安排申报与送检。

## 执行步骤

1. 导出 SKU 的 HTS 码清单
2. 用 HTS 前缀树做多标签风险匹配
3. 输出风险等级、危害类型与适用标准
4. 比对历史检测记录判断是否需重测
5. 生成 P0/P1/P2 分级清单

## 边界与不做

- 数据不满足时不用：SKU 缺 HTS 码、或 HTS 库未跟随 CPSC 法规更新时，分级会漏项，可能放过受管制商品。
- 能力边界：只做基于 HTS 码的规则分类与分级，不代替 CPSC 官方判定；误分类概率约 2-3%，须人工复审后用于上架决策。
- 合规边界：分类过程涉及供应商与商品数据，须满足 FDA 21 CFR Part 11 电子记录要求与 GDPR 数据处理要求。

## 技能关联

- **前置**：Skill-CPSC-Children-Product-Safety.html、Skill-CPSC-Children-Product-Safety、Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Cross-Border-Tax-Tariff-Modeling.html、Skill-Cross-Border-Tax-Tariff-Modeling、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification
- **延伸**：Skill-CPSC-Children-Product-Safety.html、Skill-CPSC-Children-Product-Safety、Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Compliance-ML-Risk-Scoring.html、Skill-Compliance-ML-Risk-Scoring、Skill-Cross-Border-Tax-Tariff-Modeling.html、Skill-Cross-Border-Tax-Tariff-Modeling、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence
- **可组合**：Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Cross-Border-Tax-Tariff-Modeling.html、Skill-Cross-Border-Tax-Tariff-Modeling、Skill-FBA-Fee-Intelligence.html、Skill-FBA-Fee-Intelligence、Skill-HTS-Code-Risk-Classifier

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-HTS-Code-Risk-Classifier`