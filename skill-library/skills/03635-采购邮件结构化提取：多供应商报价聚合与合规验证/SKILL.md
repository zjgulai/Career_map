---
name: "p2s-procurement-email-extraction"
title: "Procurement Email Extraction — 采购邮件结构化提取：多供应商报价聚合与合规验证"
description: "触发词：采购邮件解析、报价提取、MOQ与交期、价格梯度、多供应商比价。何时不用：输入是 PDF 报价单而不是邮件正文时用文档智能解析技能；只需把供应商变更写进图谱时用图谱自动更新技能。安全边界：邮件与报价属商业敏感数据，不得未经授权外发第三方模型，供应商条款须人工复核确认。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 采购比价"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Procurement-Email-Extraction"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把供应商邮件的 MOQ、单价、交期和阶梯价自动抽成表格，采购员不用再一封封手抄。"
user_try: "试试：解析这 15 份供应商报价邮件，抽出 MOQ、单价、交期和价格梯度，合成一张对比表。"
whenToUse: "供应商报价以邮件正文或附件文本形式传来、需要批量结构化时用本技能；输入是 PDF 报价单，用文档智能解析技能。"
workflow: "读取邮件正文与附件文本 → 按模式抽取 MOQ、单价、交期与支付条款 → 解析阶梯价格区间 → 校验条款字段完整性 → 汇总多供应商对比表"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Procurement Email Extraction — 采购邮件结构化提取：多供应商报价聚合与合规验证

## ① 解决的问题

母婴跨境电商应用：自动解析供应商报价邮件→结构化 MOQ/交期/价格梯度，节省 4-6h/周人工录入

## ② 核心算法逻辑

通过多模态信息抽取（UIE）+ 上下文一致性验证 + 混合整数线性规划（MILP），将非结构化采购邮件自动转化为结构化采购订单参数（MOQ、单价、交期、支付条款），同时验证条款逻辑一致性，支持多供应商聚合决策与最优采购方案推荐。

## ③ 业务应用场景

业务问题： 母婴纸尿裤品类（Amazon 日销 5-10 万片）月销售预测 50 万片，需在 7 天内完成采购计划。当前采购员手动阅读 12-15 份供应商邮件（中英文混合），逐个提取 MOQ、单价、交期、支付条款，耗时 5-6 小时，条款误读率 8-12%（导致订单延期或超预算）。多供应商报价对比困难，经常遗漏最优采购组合，月均损失 8-12 万元。
具体数据规模： - 供应商数量：15 家（国内主流纸尿裤代工厂） - 邮件样本：月均 180 份（每家供应商 12 份） - SKU 覆盖：纸尿裤全尺码（NB/S/M/L/XL）+ 3 种吸收度等级 = 15 个 SKU - 价格梯度复杂度：平均 3-5 个阶段（订单量 1000-5000 片） - 采购预算：月均 200-300 万元，需精确控制成本 - 历史数据：12 个月采购记录，条款变化频率 30%/月
量化产出： - 成本节省：人工处理时间 5h/周 → 自动化 8min/周，年节省 380 小时（按采购员时薪 150 元/h，年节省 5.7 万元） - 准确率提升：条款误读率从 10% → 1.2%，避免因 MOQ 误解导致的超额采购，年减少呆滞库存 12-18 万元 - 采购成本优化：MILP 自动识别最优供应商组合，相比人工选择降低采购成本 3-5%（月均节省 6-15 万元，年均 72-180 万元） - 决策速度：采购计划生成时间 5h → 15min，支持日均 3 次动态调整（对标 Amazon 销售波动）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：数据工程师面临核心业务决策——数据采集覆盖率提升至 99%，年化节省人工 25 万元
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（370 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/procurement_email_extraction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Procurement-Email-Extraction.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy.optimize import linprog
from collections import defaultdict
import json
import re

class ProcurementEmailExtractor:
    """采购邮件结构化提取与多供应商合规验证"""
    
    def __init__(self):
        self.suppliers = {}
        self.extracted_terms = defaultdict(list)
        self.confidence_threshold = 0.75
        
    def extract_terms_from_email(self, email_text, supplier_name):
        """
        从邮件文本中提取采购条款（MOQ、价格、交期、支付）
        使用正则表达式 + 上下文一致性验证
        """
        terms = {
            'supplier': supplier_name,
            'moq': None,
            'unit_price': None,
            'price_tiers': [],
            'lead_time': None,
            'payment_terms': None,
            'currency': 'USD',
            'confidence': 0.0
        }
        
        # MOQ 提取（正则模式：MOQ: 1000 pieces / 1000 pcs / minimum order 1000）
        moq_patterns = [
            r'MOQ[:\s]+(\d+(?:,\d+)?)\s*(?:pieces?|pcs?|units?)',
            r'minimum\s+order[:\s]+(\d+(?:,\d+)?)',
            r'最小订单[:\s]+(\d+(?:,\d+)?)'
        ]
        for pattern in moq_patterns:
            match = re.search(pattern, email_text, re.IGNORECASE)
            if match:
                terms['moq'] = int(match.group(1).replace(',', ''))
                break
        
        # 单价提取（正则模式：$5.50/piece, EUR 3.20/unit）
        price_patterns = [
            r'(?:USD|\$|¥|EUR|€|GBP|£)\s*(\d+\.?\d*)\s*(?:/|per)\s*(?:piece|unit|pcs?)',
            r'(\d+\.?\d*)\s*(?:USD|EUR|GBP|CHF)\s*(?:/|per)\s*(?:piece|unit)',
            r'单价[:\s]+(?:USD|\$|EUR|€)?\s*(\d+\.?\d*)'
        ]
        for pattern in price_patterns:
            match = re.search(pattern, email_text, re.IGNORECASE)
            if match:
                terms['unit_price'] = float(match.group(1))
                break
        
        # 价格梯度提取（表格行：1000-5000 pcs: $4.50, 5000+ pcs: $4.00）
        tier_pattern = r'(\d+(?:,\d+)?)\s*-?\s*(\d+(?:,\d+)?)?\s*(?:pcs?|pieces?|units?)[:\s]+(?:USD|\$|EUR|€)?\s*(\d+\.?\d*)'
        tier_matches = re.findall(tier_pattern, email_text, re.IGNORECASE)
        for match in tier_matches:
            min_qty = int(match[0].replace(',', ''))
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2601.06164 — Contract2Plan: Verified Contract-Grounded Retrieval-Augmented Optimization for BOM-Aware Procurement and Multi-Echelon Inventory Planning

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：供应商报价邮件（中英文混合，含 MOQ、单价、交期、支付条款与阶梯价格文本）与供应商清单，粒度到单封邮件与单个报价条款。

**输出**：结构化的报价条款（供应商、SKU、MOQ、单价、价格梯度、交期、支付条款）与多供应商对比结果，供采购比价与最优组合选择使用。

## 执行步骤

1. 读取供应商邮件正文与附件内容
2. 按模式抽取 MOQ、单价与交期
3. 解析分段的阶梯价格区间
4. 校验抽取字段完整性并标记缺失项
5. 汇总成多供应商报价对比表

## 边界与不做

- 报价以图片或扫描件形式给出、没有任何可解析文本时不可用；只处理一两封邮件时人工更快。
- 本技能只做条款抽取与整理，误读风险需人工复核，最终采购决策与合规验证仍由采购人员负责。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-NLP-Entity-Extraction、Skill-Regex-Pattern-Matching、Skill-Web-Page-Change-Detection、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **可组合**：Skill-Procurement-Email-Extraction

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Procurement-Email-Extraction`