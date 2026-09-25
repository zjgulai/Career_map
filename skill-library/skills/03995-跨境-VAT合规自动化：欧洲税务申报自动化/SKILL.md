---
name: "p2s-vat-gst-compliance-automation"
title: "VAT GST Compliance Automation — 跨境 VAT/GST 合规自动化：欧洲税务申报自动化"
description: "触发词：VAT 自动申报、税率分类、OSS 申报、多国税制、商品税率匹配。何时不用：只需在破阈前预警注册义务用「税务风险信号监控」；要处理关税与 HTS 编码用「HTS 关税分类与节税」。安全边界：税率分类存在争议的 SKU 必须标记并交税务顾问确认，不得以模型分类直接申报；申报文件须人工复核后提交。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-127"
l3_business: "申报协作"
l3_all: "申报协作 / 税务资料"
l1_l2_l3: "独立控制/财务与合规/申报协作"
p2s_card_id: "Skill-VAT-GST-Compliance-Automation"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "自动给每个商品匹配各国 VAT 税率并生成申报汇总与 OSS 文件，把每月 10 小时的手工申报压到 1 小时。"
user_try: "试试：按德法意三国销售数据给每个 ASIN 分类 VAT 税率，输出各国应缴税额汇总和需要争议确认的 SKU。"
whenToUse: "需要把订单按商品类别映射到各国税率并生成申报汇总时用本技能；只在破阈前做注册预警用「税务风险信号监控」；处理关税编码与节税用「HTS 关税分类与节税」。"
workflow: "汇总月度订单数据，含商品、金额、目的国与 B2B 或 B2C 标识 → 按商品描述与关键词规则匹配各国 VAT 税率 → 汇总各国应缴税额并标记争议分类 SKU → 生成 OSS 申报文件与注册阈值预警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VAT GST Compliance Automation — 跨境 VAT/GST 合规自动化：欧洲税务申报自动化

## ① 解决的问题

进入德国法国意大利三国VAT税率各不同商品分类也各异每月手工申报需10小时还容易出错——ML自动分类商品税率+自动计算申报，准确率提升到99.5%人工时间降低90%年化节省15-40万元

## ② 核心算法逻辑

跨境税务的核心挑战：

## ③ 业务应用场景

业务问题：品牌刚进入欧洲市场（德国+法国+意大利），三个国家 VAT 税率不同，商品品类也不同（吸奶器按医疗设备还是消费品？婴儿奶粉税率是多少？）。每月手动计算需要 10 小时，且不确定分类是否正确。
数据要求： - 月度订单数据（商品/金额/目的国/B2B/B2C 标识） - 商品描述和 HS Code（海关编码） - 各国 VAT 税率表（从 EU TARIC 获取）
预期产出： - 每个商品的 VAT 税率自动分类 - 各国 VAT 税额汇总报告 - OSS 申报文件（格式符合欧盟要求） - 超阈值预警：是否需要在某国单独注册

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
人工申报时间节省：10小时/月 → 1小时/月，年化 ¥8-15 万
分类准确率提升（95% → 99.5%）：减少罚款风险（欧盟 VAT 罚款 20-50%）
快速进入新国家市场（自动适配税率）
年化综合 ROI：¥15-40 万
实施难度：⭐⭐☆☆☆（规则引擎版 2 周；需要 EU TARIC API 接入；生产级约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（170 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/compliance/vat_gst_compliance_automation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-VAT-GST-Compliance-Automation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VAT/GST Compliance Automation
跨境税务合规自动化：商品税率分类 + VAT计算 + 申报生成
"""
from dataclasses import dataclass, field
from collections import defaultdict
import re


# 欧盟主要国家 VAT 税率数据库（2025年）
VAT_RATES_EU = {
    'DE': {'standard': 0.19, 'reduced': 0.07, 'super_reduced': 0.07, 'zero': 0.0},
    'FR': {'standard': 0.20, 'reduced': 0.055, 'super_reduced': 0.021, 'zero': 0.0},
    'IT': {'standard': 0.22, 'reduced': 0.10, 'super_reduced': 0.04, 'zero': 0.0},
    'UK': {'standard': 0.20, 'reduced': 0.05, 'super_reduced': 0.0, 'zero': 0.0},
    'NL': {'standard': 0.21, 'reduced': 0.09, 'zero': 0.0},
}

# 母婴商品税率分类规则
PRODUCT_VAT_RULES = [
    {'keywords': ['formula', 'baby food', 'infant milk', '婴儿奶粉'],
     'category': 'baby_food',
     'rates': {'DE': 'zero', 'FR': 'reduced', 'IT': 'reduced', 'UK': 'zero'}},
    {'keywords': ['breast pump', 'breastfeeding', 'nursing'],
     'category': 'medical_device',
     'rates': {'DE': 'reduced', 'FR': 'reduced', 'IT': 'reduced', 'UK': 'zero'}},
    {'keywords': ['sterilizer', 'bottle warmer', 'baby bottle'],
     'category': 'baby_equipment',
     'rates': {'DE': 'standard', 'FR': 'standard', 'IT': 'standard', 'UK': 'standard'}},
    {'keywords': ['car seat', 'stroller', 'pushchair'],
     'category': 'child_safety',
     'rates': {'DE': 'standard', 'FR': 'standard', 'IT': 'standard', 'UK': 'standard'}},
    {'keywords': ['organic', 'cotton', 'onesie', 'baby clothes', 'clothing'],
     'category': 'baby_clothing',
     'rates': {'DE': 'standard', 'FR': 'standard', 'IT': 'reduced', 'UK': 'zero'}},
]


@dataclass
class Order:
    """订单"""
    order_id: str
    product_description: str
    net_amount: float
    destination_country: str
    is_b2b: bool = False
    customer_vat_number: str = ''


def classify_product_vat(description: str, country: str) -> dict:
    """自动分类商品VAT税率"""
    desc_lower = description.lower()

    for rule in PRODUCT_VAT_RULES:
        if any(kw.lower() in desc_lower for kw in rule['keywords']):
            rate_key = rule['rates'].get(country, 'standard')
            rate = VAT_RATES_EU.get(country, {}).get(rate_key, 0.20)
            return {
                'category': rule['category'],
                'rate_key': rate_key,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.14562，但该号在 arXiv 上是《Thought-Like-Pro: Enhancing Reasoning of Large Language Models through Self-Driven Prolog-based Chain-of-Thought》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：月度订单数据（商品、金额、目的国、B2B 或 B2C 标识）、商品描述与 HS Code、各国 VAT 税率表（可取自 EU TARIC）。

**输出**：每个商品的 VAT 税率分类、各国税额汇总报告、符合欧盟要求的 OSS 申报文件，以及是否需要在某国单独注册的超阈预警。

## 执行步骤

1. 汇总月度订单数据并识别 B2B 与 B2C 交易
2. 按商品描述与 HS Code 匹配各国税率类别
3. 计算各国应缴税额并标记争议分类
4. 生成 OSS 申报文件与注册阈值预警

## 边界与不做

- 缺少目的国标识、商品描述过于笼统或没有 HS Code 时不适用，分类准确率会显著下降
- 只产出分类、税额汇总与申报文件草稿，最终申报由税务代理或财务复核提交
- 争议税率分类（如医疗器械与消费品之争）必须标记并交税务顾问确认，不得直接申报

## 技能关联

- **前置**：Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-FX-Hedging-Strategy.html、Skill-FX-Hedging-Strategy、Skill-HTS-Tariff-Classification.html、Skill-HTS-Tariff-Classification、Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST
- **延伸**：Skill-FX-Hedging-Strategy.html、Skill-FX-Hedging-Strategy、Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Tax-Compliance-VAT-GST.html、Skill-Tax-Compliance-VAT-GST
- **可组合**：Skill-LLM-Contract-Compliance-Review.html、Skill-LLM-Contract-Compliance-Review、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-VAT-GST-Compliance-Automation

---

> 分类：独立控制/财务与合规/申报协作　·　技术族：21-合规决策　·　源卡：`Skill-VAT-GST-Compliance-Automation`