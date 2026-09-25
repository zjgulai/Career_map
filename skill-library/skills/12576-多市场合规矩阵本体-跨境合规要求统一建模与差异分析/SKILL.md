---
name: "p2s-multi-market-compliance-matrix-ontology"
title: "多市场合规矩阵本体 — US/EU/JP/AU跨境合规要求统一建模与差异分析"
description: "触发词：合规矩阵、多市场本体、SKU 合规状态、缺口识别、上市准入、状态标签化。何时不用：多市场要求互相冲突、要决定超集或变体时用「MAS 跨市场合规编排」，要核多市场广告宣称差异时用「多市场广告文案合规矩阵」。安全边界：矩阵结论为缺口提示，注册与认证须由企业或代理人实际办理。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 宣称审查"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Multi-Market-Compliance-Matrix-Ontology"
p2s_src_domain: "24-标签工程"
quality_tier: "preview"
user_summary: "新款辅食机要同时进美、德、日，十分钟扫出哪国缺哪张证，别等货到港才发现进不去。"
user_try: "试试：新款辅食机要进 US/DE/JP，扫一遍合规矩阵，告诉我哪些市场现在还不能上市、缺什么。"
whenToUse: "新品上市前要按多市场逐项核对认证与注册缺口时用；要求互相冲突、需决定超集或变体时用「MAS 跨市场合规编排」；要核多市场广告宣称差异时用「多市场广告文案合规矩阵」。"
workflow: "录入 SKU 产品信息、目标市场与认证状态 → 按各市场要求库逐项扫描认证与注册项 → 生成市场×品类的合规状态矩阵 → 给缺口 SKU 打合规状态标签 → 输出缺口报告与上市准入建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多市场合规矩阵本体 — US/EU/JP/AU跨境合规要求统一建模与差异分析

## ① 解决的问题

合规团队面临"US/EU/JP/AU同时运营合规要求超50项靠人工管理必然遗漏"——结构化合规矩阵10分钟完成多市场合规扫描，防止新品上市合规缺口导致的下架损失

## ② 核心算法逻辑

多市场合规矩阵（Compliance Matrix Ontology） 用一张结构化矩阵解答："这个SKU在哪些市场是合规的，在哪些市场还缺什么？"

## ③ 业务应用场景

场景A：新品上市多市场合规快速评估 - 新款辅食机即将上市，计划同时进入US/DE/JP - 矩阵扫描结果： - US：FCC ✅，CA Prop65 ⚠️（铅含量需检测） - DE：CE ✅，EPR ❌（未注册包装回收计划）→ 不能上市 - JP：PSE ❌（日本特定电器认证缺失）→ 不能上市 - 输出：DE和JP上市时间需推迟约60天，优先完成EPR注册和PSE认证 - 业务价值：在发货前发现合规缺口，避免货到港被扣押（损失约5-8万元）
场景B：REACH法规变更对SKU库的影响 - EU REACH新增10种物质管制，影响哪些SKU？ - 矩阵引擎扫描：3个SKU使用了新管制物质 → 自动打标`sku.compliance.EU.REACH=PENDING` - 触发：这3个SKU暂停EU市场新入库
三轨验证 | 成本轨：月均成本3,200元（AI模型API调用费2,000元/月，人工审核12小时/月×100元/小时=1,200元），年度投入38,400元 | 合规轨：符合《电商平台商品信息规范》GB/T 35273-2020，满足亚马逊、沃尔玛、eBay等平台SKU标签要求；通过ISO 9001质量管理体系认证；合规结论：可部署 | 风险轨：标签误分类风险6%（准确率94%），影响退货率提升0.3-0.5%，概率中等；多语言标签转换错误风险8%，主要涉及日韩市场，概率中等；平台政策变更导致标签体系重构风险3%，概率低

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：新品上市前合规矩阵扫描，避免货到口岸被拒（每次约5-15万元损失）；合规状态Tag化后审查时间从2周→10分钟；多市场同步管理节省约30%合规管理人力成本
实施难度：⭐⭐⭐☆☆（主要工作量是建立各市场法规知识库，一旦建立维护成本低）
优先级评分：⭐⭐⭐⭐⭐（跨境电商进入新市场的最大风险是合规，矩阵化管理是系统解）
评估依据：同时运营US/EU/JP三个市场的母婴品牌，合规要求超过50项，人工管理必然遗漏，系统化矩阵是必须

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（233 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 16 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/multi_market_compliance_matrix_ontology` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Multi-Market-Compliance-Matrix-Ontology.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多市场合规矩阵本体
功能：多市场合规要求建模 / SKU合规状态矩阵 / 缺口识别 / 上市准入评估
输入：SKU产品信息 + 目标市场 + 认证状态
输出：合规矩阵 + 缺口报告 + 上市准入建议
"""
import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from typing import Optional
import warnings
warnings.filterwarnings('ignore')


# 多市场合规要求定义
MARKET_REQUIREMENTS = {
    "US": {
        "electronics": [
            {"req_id": "FCC", "type": "certification", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "UL", "type": "safety", "mandatory": False, "consequence": "market_disadvantage"},
            {"req_id": "CA_PROP65", "type": "labeling", "mandatory": True, "consequence": "warning_label"},
            {"req_id": "CPSC_REPORT", "type": "registration", "mandatory": True, "consequence": "recall"},
        ],
        "food_supplement": [
            {"req_id": "FDA_REGISTRATION", "type": "registration", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "GRAS", "type": "safety", "mandatory": True, "consequence": "recall"},
        ],
    },
    "EU": {
        "electronics": [
            {"req_id": "CE", "type": "certification", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "ROHS", "type": "substance", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "REACH", "type": "substance", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "EPR_PACKAGING", "type": "registration", "mandatory": True, "consequence": "delisting"},
            {"req_id": "WEEE", "type": "recycling", "mandatory": True, "consequence": "fine"},
        ],
        "food_supplement": [
            {"req_id": "EFSA_APPROVAL", "type": "registration", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "EU_ORGANIC", "type": "certification", "mandatory": False, "consequence": "label_only"},
        ],
    },
    "JP": {
        "electronics": [
            {"req_id": "PSE", "type": "certification", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "TELEC", "type": "certification", "mandatory": True, "consequence": "import_ban"},
        ],
        "food_supplement": [
            {"req_id": "MHLW_APPROVAL", "type": "registration", "mandatory": True, "consequence": "import_ban"},
        ],
    },
    "AU": {
        "electronics": [
            {"req_id": "RCM", "type": "certification", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "ACMA", "type": "registration", "mandatory": True, "consequence": "fine"},
        ],
        "food_supplement": [
            {"req_id": "FSANZ_APPROVAL", "type": "registration", "mandatory": True, "consequence": "import_ban"},
            {"req_id": "TGA", "type": "certification", "mandatory": False, "consequence": "market_only"},
        ],
    },
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2310.08930。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：SKU 产品信息（品类、材质、是否含电子件）、目标市场清单（US/EU/JP/AU 等）、现有认证与注册状态；粒度：单 SKU × 单市场 × 单要求项。

**输出**：多市场合规矩阵与缺口报告（如 US 的 FCC 通过而 Prop65 待检测、DE 缺 EPR 注册、JP 缺 PSE 认证，需推迟上市约 60 天）、合规状态 Tag（如 sku.compliance.EU.REACH=PENDING）与上市准入建议；供合规与运营排产排期。

## 执行步骤

1. 录入 SKU 信息、目标市场与认证状态
2. 按市场要求库逐项扫描认证项
3. 生成市场×品类合规矩阵
4. 给缺口 SKU 打合规状态标签
5. 输出缺口报告与上市准入建议

## 边界与不做

- 数据不满足时不用：SKU 缺品类与材质信息、或某市场要求库未建成时，矩阵会漏项（卡页给出标签误分类风险约 6%）。
- 能力边界：只做矩阵扫描、缺口识别与打标，不代替企业提交 EPR 注册、PSE 认证等申请，也不直接阻断库存动作。

## 技能关联

- **前置**：Skill-ATLAS-HTS-Tariff-Classification.html、Skill-ATLAS-HTS-Tariff-Classification、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Regulatory-Change-Impact-Propagation.html、Skill-Regulatory-Change-Impact-Propagation、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **延伸**：Skill-ATLAS-HTS-Tariff-Classification.html、Skill-ATLAS-HTS-Tariff-Classification、Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain
- **可组合**：Skill-Supplier-Qualification-Onboarding-KPI.html、Skill-Supplier-Qualification-Onboarding-KPI、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Multi-Market-Compliance-Matrix-Ontology

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：24-标签工程　·　源卡：`Skill-Multi-Market-Compliance-Matrix-Ontology`