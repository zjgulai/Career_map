---
name: "p2s-return-root-cause-attribution-graph"
title: "退货根因归因图谱 — 多层次退货原因知识图谱与供应链改善闭环"
description: "触发词：退货归因、退货率异常、根因图谱、批次质量排查、退货分流。何时不用：只做单条差评的归因与派单用「客诉聚类」类技能，要预测未来退货量用「需求预测」。安全边界：仅对置信度大于 70% 的根因建议触发行动，模型不直接扣货、冻结批次或向供应商追责。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-055"
l3_business: "纠正预防措施"
l3_all: "纠正预防措施 / 质量分析 / 退货分流"
l1_l2_l3: "业务运营/供应与履约/纠正预防措施"
p2s_card_id: "Skill-Return-Root-Cause-Attribution-Graph"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "把退货率异常一路追到批次、供应商或 Listing 根因，给出可执行的整改动作，而不只看表层退货原因。"
user_try: "试试：S12Pro 这三个月退货率从 3% 涨到 7%，帮我追一下根因在哪，并列出该触发的整改动作。"
whenToUse: "有退货记录、退货原因分类与批次/供应商上下文、需要定位系统性根因时用；只做单条反馈的归因与派单用「客诉聚类」类技能。"
workflow: "按表层退货原因统计占比，找出异常集中的原因 → 用归因规则库把表层原因展开到运营层原因与根因提示 → 叠加批次、供应商与市场上下文确认根因 → 输出根因排名、Tag 更新与改善行动建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 退货根因归因图谱 — 多层次退货原因知识图谱与供应链改善闭环

## ① 解决的问题

运营面临"退货率从3%升至7%不知道根因"——三层因果图谱精确定位到电机批次变更，供应商整改后退货率回归3%，年化减少退货成本8万元

## ② 核心算法逻辑

退货根因归因（Return Root Cause Attribution） 将每个退货事件连接到其根本原因，并追踪到可以改善的供应链节点。

## ③ 业务应用场景

场景A：吸奶器退货率异常诊断 - 现象：S12Pro退货率从3%升至7%（3个月内） - 图谱分析： - 70%退货原因："吸力不够"（表层） - 追溯：→ 电机组件批次变更（运营层） - 根因：→ 供应商「宁波精工」2月份更换了电机供应商，新电机在低温下吸力下降20% - 触发行动： 1. 这批次库存打标`sku.quality_flag=SUSPECTED_DEFECT` 2. 触发供应商质量评审 3. 启动产品工程变更
三轨验证： - 成本：需接入供应商批次变更数据（约2人周数据清洗）+ 图谱构建与维护（约3人月初始开发，后续每月0.5人天维护）；计算资源成本低（单次归因<1秒） - 合规：不涉及客户个人数据（仅使用退货原因分类与SKU/供应商ID），无GDPR/CCPA风险；不触碰Amazon退货政策红线 - 风险：若根因误判（如误将用户操作问题归因为供应商），可能导致供应商关系紧张或错误整改；建议对高置信度（>70%）根因才触发行动
场景B：德国市场退货率分析 - 德国退货率18%（US 7%），差异巨大 - 图谱分析：45%退货原因是"与描述不符" - 根因：德文产品描述由机器翻译，3个关键功能描述有误 - 改善：重新翻译德文Listing后，退货率降至12%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：识别"电机批次变更"根因后，触发供应商整改 → 退货率从7%降回3% → 年化减少退货处理成本约8万元；德国Listing翻译修正 → 退货率从18%降至12% → 年化节省约6万元
实施难度：⭐⭐⭐☆☆（需要退货原因分类体系和供应链上下文数据，图谱构建有一定工作量）
优先级评分：⭐⭐⭐⭐⭐（退货成本在母婴跨境约占GMV的3-8%，根因闭环是系统性降本关键）
评估依据：退货研究：80%的退货问题是系统性的（同一批次/同一供应商/同一Listing问题），根因修复一次可持续生效

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（162 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/return_root_cause_attribution_graph` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Return-Root-Cause-Attribution-Graph.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
退货根因归因图谱
功能：三层归因路径构建 / 根因频次统计 / Tag传播 / 改善行动建议
输入：退货记录 + 归因规则库 + 供应链上下文
输出：根因排名 + Tag更新 + 改善行动
"""
from dataclasses import dataclass, field
from collections import Counter, defaultdict
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


# 三层归因规则库
ATTRIBUTION_RULES = {
    # surface_reason → [(operational_cause, weight, root_cause_hint)]
    "吸力不够": [
        ("电机性能不足", 0.6, "supplier_quality_change"),
        ("密封件磨损", 0.3, "material_degradation"),
        ("用户使用错误", 0.1, "listing_instructions_insufficient"),
    ],
    "与描述不符": [
        ("Listing图片不准确", 0.4, "listing_quality_issue"),
        ("翻译错误", 0.35, "localization_quality"),
        ("新品规格变更未更新", 0.25, "product_change_management"),
    ],
    "质量问题": [
        ("IQC检验遗漏", 0.45, "supplier_iqc_failure"),
        ("运输破损", 0.30, "packaging_insufficient"),
        ("仓储存放问题", 0.25, "warehouse_storage_issue"),
    ],
    "发货错误": [
        ("拣货差错", 0.70, "warehouse_pick_error"),
        ("订单系统异常", 0.20, "oms_mapping_error"),
        ("供应商发货错误", 0.10, "supplier_pack_error"),
    ],
    "改变主意": [
        ("价格期望不符", 0.50, "pricing_mismatch"),
        ("冲动购买", 0.30, "marketing_oversell"),
        ("对比后不满意", 0.20, "competitive_disadvantage"),
    ],
}

ROOT_CAUSE_ACTIONS = {
    "supplier_quality_change": "启动供应商质量评审+批次检验",
    "material_degradation": "更新IQC检验标准+供应商整改",
    "listing_quality_issue": "产品页面优化+图片重拍",
    "localization_quality": "本地化团队重新翻译",
    "supplier_iqc_failure": "对供应商发出整改通知+增加检验频次",
    "packaging_insufficient": "升级包材规格+运输测试",
    "warehouse_pick_error": "仓储操作培训+扫码验货升级",
    "pricing_mismatch": "竞品价格研究+定价策略调整",
}


@dataclass
class ReturnCase:
    return_id: str
    sku_id: str
    market: str
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2312.09823。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：退货明细：return_id、sku_id、市场、退货日期、表层退货原因、金额；归因规则库（表层原因 → 运营层原因、权重、根因提示）；供应链上下文（供应商与批次变更、IQC 记录、Listing 与翻译版本）。

**输出**：根因排名（按频次与权重）、需要更新的 Tag（如 sku.quality_flag=SUSPECTED_DEFECT）、对应改善行动建议（供应商质量评审、IQC 标准更新、包材升级、翻译修正等）；供质量、供应商管理与退货分流使用。

## 执行步骤

1. 汇总各 SKU 与各市场的退货记录，按表层退货原因统计占比找出异常
2. 用三层归因规则把表层原因展开成运营层原因与根因提示（带权重）
3. 叠加批次变更、供应商与市场上下文锁定根因（如电机批次变更、德文翻译错误）
4. 按频次与权重输出根因排名和受影响 SKU 清单
5. 给出改善行动建议并对可疑批次打质量 Tag，仅对置信度大于 70% 的根因建议触发行动

## 边界与不做

- 数据不满足时不用：缺退货原因分类或供应商批次上下文时，无法从表层原因追到根因。
- 只输出根因与行动建议，不直接扣货、冻结批次或向供应商追责。
- 卡页提示根因误判会导致供应商关系紧张或错误整改；ROI（年化减少退货成本约 8 万元、德国案例约 6 万元）为估算口径。

## 技能关联

- **前置**：Skill-Cross-Border-Return-Rate-By-Country-KPI.html、Skill-Cross-Border-Return-Rate-By-Country-KPI、Skill-Customer-Complaint-Supply-Root-Cause-KPI.html、Skill-Customer-Complaint-Supply-Root-Cause-KPI、Skill-GCF-Counterfactual-Unobserved-Demand.html、Skill-GCF-Counterfactual-Unobserved-Demand、Skill-Returnformer-Returns-Prediction.html、Skill-Returnformer-Returns-Prediction、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **延伸**：Skill-Customer-Complaint-Supply-Root-Cause-KPI.html、Skill-Customer-Complaint-Supply-Root-Cause-KPI、Skill-GCF-Counterfactual-Unobserved-Demand.html、Skill-GCF-Counterfactual-Unobserved-Demand、Skill-Reverse-Logistics-Disposition-Optimization.html、Skill-Reverse-Logistics-Disposition-Optimization、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Customer-Complaint-Supply-Root-Cause-KPI.html、Skill-Customer-Complaint-Supply-Root-Cause-KPI、Skill-GCF-Counterfactual-Unobserved-Demand.html、Skill-GCF-Counterfactual-Unobserved-Demand、Skill-Supplier-Delivery-Quality-Rate-KPI.html、Skill-Supplier-Delivery-Quality-Rate-KPI、Skill-Return-Root-Cause-Attribution-Graph

---

> 分类：业务运营/供应与履约/纠正预防措施　·　技术族：24-标签工程　·　源卡：`Skill-Return-Root-Cause-Attribution-Graph`