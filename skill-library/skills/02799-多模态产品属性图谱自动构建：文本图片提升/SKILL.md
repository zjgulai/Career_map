---
name: "p2s-autopkg-multimodal-product-attribute-kg"
title: "AutoPKG — 多模态产品属性图谱自动构建：文本+图片→GMV提升"
description: "触发词：属性图谱构建、多模态属性提取、属性填充率、属性值规范化、商品主数据。何时不用：只核查图片是否覆盖必需角度、图文是否一致时用「VLM 电商适配」；只做商品图文统一检索与以图搜货时用「多模态商品理解」。安全边界：只产出属性键与属性值，不代改 Listing 文案，也不替代品类合规审查。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / Listing优化 / 主数据治理"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-AutoPKG-Multimodal-Product-Attribute-KG"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让机器读图文自动归纳品类属性并批量填好，运营不用再手填几十个属性，也不再各人一套标准。"
user_try: "试试：用 500 个母婴品类样本 SKU 归纳属性键，再把 800 个 SKU 的属性批量提取并合并同义值。"
whenToUse: "当需要为整个品类自动归纳属性 Schema、并对大批量 SKU 做文本 + 图片双通道属性提取与同义值规范化时用本技能；若只是核查单个 SKU 的图片角度覆盖与图文一致性，用「VLM 电商适配」；若只是要图文统一的相似商品检索，用「多模态商品理解」。"
workflow: "采样品类 SKU，用 LLM 归纳属性 Schema → 批量跑文本 + 图片双通道属性提取 → 用 Consolidation Agent 合并同义属性值 → 输出结构化属性表并接入搜索与推荐下游"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AutoPKG — 多模态产品属性图谱自动构建：文本+图片→GMV提升

## ① 解决的问题

母婴跨境团队面临"商品属性人工填写耗时且不标准导致推荐失准"——多模态多Agent自动构建产品属性图谱，属性填充率从60%→96%，Search GMV+5.32%（Lazada生产A/B实测）

## ② 核心算法逻辑

电商产品属性图谱（PKG）长期被一个矛盾困住：维护成本高得离谱（人工定义属性Schema），同时又随时过期（新品类涌现速度快于人工更新速度）。母婴跨境电商尤其典型——吸奶器的"静音分贝"、婴儿推车的"折叠尺寸"这类属性，既没有统一标准，又直接影响转化。

## ③ 业务应用场景

业务问题：某母婴跨境团队在Amazon US/UK/DE三站运营800+ SKU，品类跨越吸奶器、婴儿推车、安抚奶嘴、纸尿裤。每款新品上架时，运营需要手工填写40+个属性（BPA-Free认证、适用月龄、最大承重、折叠尺寸…），耗时2-3小时/SKU，且不同运营填写标准不统一，导致推荐系统"品类混淆"（把NB码尿布推给6月大婴儿）。
AutoPKG处理流程： 1. 属性归纳：喂入500个品类样本SKU（文本描述+主图），Agent自动归纳出68个属性键，覆盖率96.3% 2. 批量提取：对800+ SKU并发运行多模态属性提取，文本+视觉双通道 3. 规范化：Consolidation Agent合并同义属性值（如"0-6月"/"出生至6M"/"新生儿"→ 统一为 "0-6M"） 4. 接入下游：PKG输出接入推荐系统的商品Profile向量、搜索系统的属性Filter、Detail页的角标展示
数据要求： - 每个SKU的商品描述文本（Bullet Points + Feature Description，≥50字符） - 商品主图（JPG/PNG，≥400×400px，避免纯白背景） - 历史有效属性样本（可选，用于Consolidation Agent校准）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：
属性填写人工成本节省：¥80,000-200,000/年（视SKU数量）
GMV增量（参考Lazada A/B数据）：
Search GMV：+5.32%（1,000万GMV规模→+53.2万/年）
Recommendation GMV：+7.89%
Badge展示效率：+3.81%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（394 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/knowledge_graph/autopkg_multimodal_product_attribute_kg` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-AutoPKG-Multimodal-Product-Attribute-KG.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AutoPKG - 多模态产品属性图谱自动构建
简化实现版：文本+图片属性抽取 + Consolidation Agent

依赖: openai (或任意LLM客户端), PIL, requests, json
"""

import json
import re
from typing import Dict, List, Optional, Any
from collections import defaultdict

# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

class ProductNode:
    """电商产品节点"""
    def __init__(self, sku_id: str, title: str, description: str, 
                 image_url: Optional[str] = None, category: str = ""):
        self.sku_id = sku_id
        self.title = title
        self.description = description
        self.image_url = image_url
        self.category = category
        self.attributes: Dict[str, Any] = {}  # 提取到的属性


class ProductAttributeKG:
    """产品属性知识图谱"""
    def __init__(self):
        self.products: Dict[str, ProductNode] = {}
        self.attribute_schema: Dict[str, List[str]] = {}  # category -> [attr_keys]
        self.canonical_values: Dict[str, Dict[str, str]] = {}  # attr_key -> {raw -> canonical}
    
    def add_product(self, product: ProductNode):
        self.products[product.sku_id] = product
    
    def get_attributes_df(self):
        """输出属性数据框（可接入推荐系统）"""
        rows = []
        for sku_id, product in self.products.items():
            row = {"sku_id": sku_id, "category": product.category}
            row.update(product.attributes)
            rows.append(row)
        return rows


# ─────────────────────────────────────────────
# AutoPKG核心模块
# ─────────────────────────────────────────────

class AttributeInductor:
    """
    Module 1: 按需属性归纳（On-demand Schema Induction）
    从样本SKU中自动发现该品类应有哪些属性键
    """
    
    def __init__(self, llm_client):
        self.llm = llm_client
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2604.16950 — AutoPKG: An Automated Framework for Dynamic E-commerce Product-Attribute Knowledge Graph Construction

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：每个 SKU 的商品描述文本（Bullet Points + Feature Description，≥50 字符）、商品主图（JPG/PNG，≥400×400px，避免纯白背景）、用于归纳属性的品类样本 SKU，可选历史有效属性样本用于同义合并校准；粒度为 SKU × 品类。

**输出**：属性 Schema（属性键清单）、每 SKU 的结构化属性表（含规范化后的属性值）与同义值映射；可接入推荐系统的商品 Profile 向量、搜索系统的属性 Filter 与详情页角标。

## 执行步骤

1. 用 500 个品类样本 SKU 的文本与主图归纳该品类属性键（卡页口径得到 68 个属性键、覆盖率 96.3%）
2. 对全量 SKU（卡页为 800+）并发运行文本 + 视觉双通道属性提取
3. 用 Consolidation Agent 合并同义属性值（如 0-6月 / 出生至6M / 新生儿 统一为 0-6M）
4. 输出结构化属性表并接入推荐 Profile 向量、搜索属性 Filter 与详情页角标
5. 定期用新样本 SKU 复跑属性归纳，跟上新品类涌现速度

## 边界与不做

- 数据不满足：SKU 描述短于 50 字符，或主图为纯白底、小于 400×400px 时视觉通道失效，先补素材。
- 何时不用：只是要核查商品图与文字是否一致、是否覆盖必需角度，用「VLM 电商适配」；只是要把商品图文统一成单一向量做检索，用「多模态商品理解」。
- 能力边界：只产出属性键、属性值与同义映射，不代改 Listing、不判定属性是否合规；卡页的属性填充率 60%→96%、Search GMV +5.32% 为 Lazada 生产 A/B 与案例口径，不是对本店效果的承诺。

## 技能关联

- **前置**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-KG-Auto-Construction-Agent-Driven.html、Skill-KG-Auto-Construction-Agent-Driven、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Multimodal-Product-Search.html、Skill-Multimodal-Product-Search、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **延伸**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-Multimodal-Product-Search.html、Skill-Multimodal-Product-Search、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **可组合**：Skill-Ad-Aware-Recommendation.html、Skill-Ad-Aware-Recommendation、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multimodal-Product-Search.html、Skill-Multimodal-Product-Search、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining、Skill-AutoPKG-Multimodal-Product-Attribute-KG

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：08-知识图谱　·　源卡：`Skill-AutoPKG-Multimodal-Product-Attribute-KG`