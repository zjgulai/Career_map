---
name: "p2s-gcc-cpc-document-validator"
title: "GCC/CPC Document Validator — 合规认证文档完整性自动验证"
description: "触发词：GCC 文档、CPC 证书、文档完整性、百分制评分、缺件清单、标准版本核查。何时不用：要批量填 eFiling 申报字段时用「CPSC eFiling 字段映射」，要先梳理该做哪些认证时用「CPSC 儿童产品安全合规」。安全边界：验证结论只代表文档字段完整，不代表产品实测合格或平台审核通过。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 关务资料检查"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-GCC-CPC-Document-Validator"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "十几份证书丢过来别靠肉眼翻，按 16 CFR 1110 逐项打分，缺哪一栏、该先补哪份一目了然。"
user_try: "试试：把这 15 份安全座椅 GCC 文档按 eFiling 要求逐份打分，列出缺失字段和优先补件顺序。"
whenToUse: "入仓或申报前要核验一批 GCC/CPC 文档字段完整性与标准时效时用；要批量生成申报字段时用「CPSC eFiling 字段映射」；要先梳理认证路径时用「CPSC 儿童产品安全合规」。"
workflow: "收集待审 GCC/CPC 文档与 CPSC 认可实验室清单 → 按 16 CFR Part 1110 逐项校验必填字段 → 给出百分制评分与逐项扣分原因 → 比对文档引用标准版本与最新版本 → 输出缺失字段清单与优先补件顺序"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# GCC/CPC Document Validator — 合规认证文档完整性自动验证

## ① 解决的问题

运营面临"15份GCC/CPC文档不知道是否符合eFiling要求导致FBA入库被拒"——规则Schema验证将文档合规率从65%改善为95%，年化节省检测返工费8万元

## ② 核心算法逻辑

GCC（General Conformity Certificate）和CPC（Children's Product Certificate）是CPSC eFiling的核心文件，但因格式复杂、字段多（17个必填项），65%的文档存在缺失或过期问题，直接导致FBA入库被拒。

## ③ 业务应用场景

场景A：FBA入库前GCC/CPC批量审核（安全座椅新款上市） - 业务问题：15个新款安全座椅SKU准备入仓，测试实验室发来15份GCC文档，运营不确定是否都符合eFiling要求 - 数据要求：15份GCC/CPC文档（PDF文本格式）+ CPSC当前认可实验室清单（每季度更新） - 预期产出：每份文档100分制评分 + 缺失字段清单 + 优先补件顺序（发给实验室的标准邮件模板） - 业务价值：文档合规率从65%→95%，避免FBA首批入库被拒（安全座椅单批次货值30-80万元）
场景B：老旧GCC文档年度更新核查（吸奶器） - 业务问题：50个吸奶器SKU有3-5年前的GCC文档，部分ASTM标准已更新到新版本，不确定哪些需要重新测试 - 数据要求：历史GCC文档 + ASTM/CPSC最新标准版本清单 - 预期产出：标准版本对比报告（当前文档引用标准版本 vs 最新版本），过期标准的SKU需重新送检 - 业务价值：精确定位需重新测试的SKU（而非全量重测），节省检测费用约8万元/年
三轨验证 | 成本轨：月均成本1200元（AI文档审核工具600元/月+人工审核12小时/月@50元/小时），年度投入14400元，相比传统人工审核（月均3000元）降低60% | 合规轨：通过FDA 21 CFR Part 11电子记录要求+CE MDR技术文件完整性验证，合规结论为

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：批量核查15份文档节省12小时×150元=1800元；避免1次FBA拒收（货值30万×5%=

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（328 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
GCC/CPC Document Validator
合规认证文档完整性验证 + 100分制评分
"""
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


# GCC/CPC必填字段（基于16 CFR Part 1110）
GCC_REQUIRED_FIELDS = {
    "cert_type": {"name": "证书类型(GCC/CPC)", "weight": 6, "type": "enum"},
    "product_name": {"name": "产品名称", "weight": 5, "type": "text"},
    "product_description": {"name": "产品描述", "weight": 4, "type": "text"},
    "manufacturer_name": {"name": "制造商名称", "weight": 6, "type": "text"},
    "manufacturer_address": {"name": "制造商地址", "weight": 4, "type": "text"},
    "importer_name": {"name": "进口商名称（美国）", "weight": 6, "type": "text"},
    "country_of_origin": {"name": "原产地", "weight": 5, "type": "text"},
    "test_standard": {"name": "适用测试标准", "weight": 7, "type": "text"},
    "test_lab_name": {"name": "测试实验室名称", "weight": 6, "type": "text"},
    "test_lab_cpsc_id": {"name": "实验室CPSC认可编号", "weight": 6, "type": "text"},
    "test_report_number": {"name": "测试报告编号", "weight": 5, "type": "text"},
    "test_date": {"name": "测试日期", "weight": 7, "type": "date"},
    "cert_issue_date": {"name": "证书签发日期", "weight": 5, "type": "date"},
    "model_number": {"name": "型号/款号", "weight": 4, "type": "text"},
    "age_grade": {"name": "适用年龄段", "weight": 6, "type": "text"},
    "hts_code": {"name": "HTS海关编码", "weight": 5, "type": "text"},
    "authorized_signature": {"name": "授权签名人", "weight": 5, "type": "text"},
}

# ASTM最新标准版本（2025年更新）
ASTM_LATEST_VERSIONS = {
    "ASTM F833": "F833-23",    # 婴儿车 2023版
    "ASTM F1004": "F1004-22",  # 婴儿车底架 2022版
    "ASTM F1888": "F1888-23",  # 婴儿床 2023版
    "ASTM F963": "F963-23",    # 玩具 2023版
    "ASTM F2550": "F2550-22",  # 摇椅 2022版
    "ASTM F2933": "F2933-22",  # 婴儿床垫 2022版
    "ASTM F1625": "F1625-20",  # 自行车儿童座 2020版
    "ASTM F1912": "F1912-19",  # 折叠高脚椅 2019版（无更新）
}

# CPSC认可实验室（2025年有效清单摘要）
CPSC_APPROVED_LABS = {
    "SGS", "Bureau Veritas", "BV", "Intertek", "ITS", "TUV", "TÜV",
    "UL Solutions", "UL", "QIMA", "Eurofins", "Element Materials",
    "Applied Research Laboratories", "NSF International"
}


@dataclass
class ValidationResult:
    field_name: str
    status: str          # "pass", "fail", "warning"
    value: Optional[str]
    message: str
    deduction: int = 0   # 扣分
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.04523，但该号在 arXiv 上是《Near-squares in binary recurrence sequences》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：GCC/CPC 文档（PDF 文本格式）、CPSC 当前认可实验室清单（每季度更新）、ASTM/CPSC 最新标准版本清单；粒度：单份证书对应单个 SKU。

**输出**：每份文档的百分制评分与字段级校验结果（pass/fail/warning 及扣分）、缺失字段清单、标准版本对比报告（现有引用版本 vs 最新版本）与优先补件顺序（含发给实验室的邮件模板）；供运营在入仓前拦截不合规文档。

## 执行步骤

1. 收集待审文档与认可实验室清单
2. 按 16 CFR Part 1110 校验必填字段
3. 打分并标注缺失与扣分项
4. 比对标准版本识别需重测 SKU
5. 输出补件顺序与实验室沟通模板

## 边界与不做

- 数据不满足时不用：文档为不可解析的扫描图片、或认可实验室清单未按季度更新时，校验结论会出错。
- 能力边界：只验证文档字段完整性与标准版本时效，不判断产品实测是否合格、不代替实验室复测，也不保证平台审核通过。

## 技能关联

- **前置**：Skill-AI-Product-Safety-Certification.html、Skill-AI-Product-Safety-Certification、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CPSC-Children-Product-Safety.html、Skill-CPSC-Children-Product-Safety、Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-HTS-Code-Risk-Classifier.html、Skill-HTS-Code-Risk-Classifier、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-AI-Product-Safety-Certification.html、Skill-AI-Product-Safety-Certification、Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-CPSC-eFiling-Auto-Mapper.html、Skill-CPSC-eFiling-Auto-Mapper、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-GCC-CPC-Document-Validator

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：21-合规决策　·　源卡：`Skill-GCC-CPC-Document-Validator`