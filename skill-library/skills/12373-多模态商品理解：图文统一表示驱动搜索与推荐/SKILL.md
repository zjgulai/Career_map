---
name: "p2s-multimodal-product-understanding"
title: "Multimodal Product Understanding — 多模态商品理解：图文统一表示驱动搜索与推荐"
description: "触发词：多模态商品理解、以图搜货、图文一致性、统一向量、相似商品召回。何时不用：要从图文归纳品类属性键建图谱时用「多模态产品属性图谱 AutoPKG」；要审核图片角度与质量时用「VLM 电商适配」。安全边界：只输出相似度与一致性判定，不代改图片、不下架商品。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Multimodal-Product-Understanding"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "买家传张图问有没有类似的，也能直接给答案；顺手还能查出哪些 Listing 图文对不上。"
user_try: "试试：支持上传一张竞品图片搜出最相似的 5 个商品，并检查我的 Listing 有没有图文不符。"
whenToUse: "当需要把商品图文统一成同一向量空间、支撑以图搜货与图文一致性检测时用本技能；要归纳品类属性键建图谱，用「多模态产品属性图谱 AutoPKG」；要审核图片角度与质量，用「VLM 电商适配」。"
workflow: "采集主图与文本描述并抽取图文特征 → 建立图文统一的多模态嵌入索引 → 支持图片查询返回 Top 5 相似商品 → 做图文一致性检测并回流属性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multimodal Product Understanding — 多模态商品理解：图文统一表示驱动搜索与推荐

## ① 解决的问题

买家上传竞品图片询问有没有类似产品但文本搜索无法处理图片查询——多模态商品理解将图文统一为单一向量支持以图搜货和图文一致性检测，搜索CVR提升5-10%并发现Listing图文不符风险年化GMV增益15-50万元

## ② 核心算法逻辑

单模态 vs 多模态商品理解：

## ③ 业务应用场景

业务问题：买家上传一张竞品图片询问"有没有类似的？"，文本搜索无法处理图片查询。多模态理解让独立站支持"以图搜货"，同时识别山寨仿款。
数据要求： - 产品主图库（每个 SKU 至少 3 张主图） - 产品文本描述（标题/要点） - 预建多模态嵌入索引
预期产出： - 图片输入 → Top 5 相似商品（含相似度分） - 图文一致性检测：哪些 Listing 图片与文字描述不符

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
商品搜索相关性提升（图文统一）：搜索 CVR 提升 5-10%，月增 GMV ¥5-15 万
属性自动补全：Listing 完整度提升 → 搜索排名提升，长期流量价值 ¥5-20 万/年
图文一致性检测：发现不符合 Listing，避免因此被差评或下架
年化综合 ROI：¥15-50 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（172 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/multimodal_product_understanding` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Multimodal-Product-Understanding.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multimodal Product Understanding
图文统一表示：轻量多模态商品嵌入（无需 GPU）
生产环境推荐: transformers + CLIP / MOON3.0
"""
import numpy as np
import re
from dataclasses import dataclass


@dataclass
class ProductData:
    product_id: str
    title: str
    bullets: str
    image_url: str = ''
    image_features: np.ndarray = None   # 预提取图像特征（生产中用CLIP）


# 商品属性关键词词典（母婴品类）
ATTRIBUTE_PATTERNS = {
    'noise_level': [
        (r'under\s*(\d+)\s*db|<\s*(\d+)\s*db', 'quiet'),
        (r'silent|whisper|quiet|noiseless|低噪|静音|安静', 'quiet'),
        (r'loud|noisy|noise|噪音大', 'noisy'),
    ],
    'power_type': [
        (r'rechargeable|usb\s*charging|battery|充电', 'rechargeable'),
        (r'electric|plug[\s-]in|adapter|电动', 'electric'),
        (r'manual|hand[\s-]pump|手动', 'manual'),
    ],
    'portability': [
        (r'portable|compact|travel|lightweight|便携|轻便', 'portable'),
        (r'wearable|hands[\s-]free|可穿戴', 'wearable'),
        (r'desktop|table[\s-]top|bedside|台式', 'stationary'),
    ],
    'bpa_safety': [
        (r'bpa[\s-]free|non[\s-]bpa|无bpa|不含bpa', 'bpa_free'),
        (r'food[\s-]grade|fda|medical[\s-]grade', 'medical_grade'),
    ],
}


def extract_text_features(product: ProductData) -> np.ndarray:
    """
    从商品文本提取轻量特征向量
    生产中替换为 BERT/CLIP text encoder
    """
    text = f"{product.title} {product.bullets}".lower()
    # 特征1：属性存在标志（one-hot）
    attr_flags = []
    for attr, patterns in ATTRIBUTE_PATTERNS.items():
        found = False
        for pattern, _ in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                found = True
                break
        attr_flags.append(1.0 if found else 0.0)

    # 特征2：关键词 TF 特征（简化）
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.00513 — MOON3.0: Reasoning-aware Multimodal Representation Learning for E-commerce Product Understanding

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：每个 SKU 至少 3 张主图、商品文本描述（标题/要点）、预建的多模态嵌入索引；粒度为 商品 × 图片。

**输出**：以图搜货的 Top 5 相似商品与相似度分、图文一致性检测结果（哪些 Listing 图片与文字描述不符）；供独立站搜索与商品运营使用。

## 执行步骤

1. 采集每个 SKU 的主图与文本描述，抽取图像与文本特征
2. 建立图文统一的多模态嵌入索引
3. 支持图片查询，返回 Top 5 相似商品与相似度分
4. 做图文一致性检测，标出图片与描述不符的 Listing
5. 用一致的多模态表示补全属性并回流到搜索与推荐

## 边界与不做

- 数据不满足：每 SKU 图片少于卡页口径（3 张）或缺文本描述时图文对齐不可靠。
- 何时不用：要从图文归纳品类属性键并建属性图谱，用「多模态产品属性图谱 AutoPKG」；要审核图片角度覆盖与质量打分，用「VLM 电商适配」。
- 能力边界：只输出相似度与一致性判定，不代改图片、不下架商品；卡页的搜索 CVR +5-10%、年化 15-50 万元为案例口径。

## 技能关联

- **前置**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Embedding-Fundamentals.html、Skill-Embedding-Fundamentals、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal
- **延伸**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal
- **可组合**：Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-VOC-Driven-Recommendation-Signal.html、Skill-VOC-Driven-Recommendation-Signal、Skill-Multimodal-Product-Understanding

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：08-知识图谱　·　源卡：`Skill-Multimodal-Product-Understanding`