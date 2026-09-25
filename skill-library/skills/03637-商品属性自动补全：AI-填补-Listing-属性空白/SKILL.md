---
name: "p2s-product-attribute-completion"
title: "Product Attribute Completion — 商品属性自动补全：AI 填补 Listing 属性空白"
description: "触发词：属性补全、Listing 属性、字段空白、置信度填充、上架提效。何时不用：品类属性模板还没确定、需要先定义字段时用本体或 Tag Schema 类技能；本技能填的是已有模板下的空值。安全边界：低置信度取值必须标注待人工确认，不得自动写入平台后台。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据质量 / Listing优化"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-Product-Attribute-Completion"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "上架时几十个属性字段不用一个个填，从标题和图片里自动提取，人工只复核不确定的那几个。"
user_try: "试试：把这款吸奶器的 42 个属性字段从标题、要点和主图里补全，标出需要人工确认的。"
whenToUse: "品类属性模板已确定、缺的是字段取值时用本技能；需要新建属性模板或做品类本体设计用本体与 Schema 类技能。"
workflow: "载入品类属性模板与商品文本、主图 → 按属性类型抽取候选值 → 按置信度阈值自动填充或标记复核 → 输出补全前后的完整度对比"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Product Attribute Completion — 商品属性自动补全：AI 填补 Listing 属性空白

## ① 解决的问题

新款吸奶器需要填写42个属性字段人工填写1.5小时但30-40%属性空白导致搜索排名下降——AI从标题/要点/图片自动提取属性值5分钟完成，属性完整度60%提升到90%搜索曝光增加20-35%年化15-40万元

## ② 核心算法逻辑

人工填属性 vs AI 补全：

## ③ 业务应用场景

业务问题：新款吸奶器上架需要填写 42 个属性字段（Amazon 要求的 ASIN 属性），运营一个一个填写需要 1.5 小时/SKU，10 款新品需要 15 小时。AI 补全可以 10 秒完成，运营只需要复核高置信度的属性。
数据要求： - 商品标题/要点/描述（已有文本） - 商品主图（可选，提升精度） - 品类属性模板（Amazon 要求的属性字段列表）
预期产出： - 所有属性的预测值（含置信度） - 高置信度（>0.85）自动填充，低置信度标记为"需人工确认" - 属性填充前后的搜索曝光预期提升

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
属性填写效率提升 18x（90分钟 → 5分钟/SKU）
属性完整度 60% → 90%：A10 排名权重提升，搜索曝光 +20-35%
批量历史 SKU 处理：月增 GMV ¥5-20 万
年化综合 ROI：¥20-50 万
实施难度：⭐⭐☆☆☆（规则引擎版 1 周可实现；LLM 增强版约 2-3 周；需要品类属性模板建立）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（160 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/product_attribute_completion` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Product-Attribute-Completion.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Product Attribute Completion
商品属性自动补全：从文本+图片提取属性值
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class AttributeDefinition:
    name: str
    attr_type: str    # 'numeric', 'categorical', 'boolean', 'text'
    required: bool = False
    extraction_patterns: list = None


# 母婴吸奶器品类属性模板
BREAST_PUMP_ATTRIBUTES = [
    AttributeDefinition('noise_level_db', 'numeric', required=True,
                         extraction_patterns=[r'<?\s*(\d+)\s*dB', r'under\s*(\d+)\s*dB']),
    AttributeDefinition('pump_type', 'categorical', required=True,
                         extraction_patterns=[r'(single|double|dual)\s*(electric|breast)', r'(wearable|portable|hands-free)']),
    AttributeDefinition('power_source', 'categorical', required=True,
                         extraction_patterns=[r'(USB|AC|battery|rechargeable|electric)\s*(rechargeable|powered|charging)?']),
    AttributeDefinition('suction_levels', 'numeric',
                         extraction_patterns=[r'(\d+)\s*suction\s*(level|mode|setting)', r'(\d+)\s*level']),
    AttributeDefinition('bpa_free', 'boolean',
                         extraction_patterns=[r'BPA[\s-]?free', r'BPA[\s-]?Free', r'non[\s-]?BPA']),
    AttributeDefinition('weight_kg', 'numeric',
                         extraction_patterns=[r'(\d+\.?\d*)\s*(lb|lbs|kg|pounds?)', r'lightweight']),
    AttributeDefinition('warranty_years', 'numeric',
                         extraction_patterns=[r'(\d+)[\s-]?(year|yr)\s*(warranty|guarantee)']),
    AttributeDefinition('compatible_brands', 'text',
                         extraction_patterns=[r'compatible with\s+(\w+)', r'works with\s+(\w+)']),
]


def extract_attribute_from_text(text: str, attr_def: AttributeDefinition) -> dict:
    """从文本提取单个属性值"""
    text_normalized = re.sub(r'\s+', ' ', text.strip())

    for pattern in (attr_def.extraction_patterns or []):
        match = re.search(pattern, text_normalized, re.IGNORECASE)
        if match:
            raw_value = match.group(1) if match.lastindex else match.group(0)

            # 类型转换
            if attr_def.attr_type == 'numeric':
                try:
                    value = float(raw_value.replace(',', ''))
                    return {'value': value, 'confidence': 0.90, 'source': 'text_regex'}
                except:
                    pass
            elif attr_def.attr_type == 'boolean':
                return {'value': True, 'confidence': 0.95, 'source': 'text_keyword'}
            elif attr_def.attr_type == 'categorical':
                return {'value': raw_value.strip().title(), 'confidence': 0.85, 'source': 'text_regex'}
            else:
                return {'value': raw_value.strip(), 'confidence': 0.75, 'source': 'text_regex'}
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2507.19679 — Efficient Learning for Product Attributes with Compact Multimodal Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：商品标题、要点与描述文本，可选商品主图，品类属性模板（平台要求的属性字段清单），按 SKU 粒度。

**输出**：每个属性的预测值及置信度（高置信自动填充、低置信标记需人工确认）与填充前后的曝光提升预估，供上架运营复核使用。

## 执行步骤

1. 载入品类属性模板与商品素材
2. 按属性类型（数值、枚举、布尔、文本）抽取候选值
3. 按置信度阈值分流自动填充与人工复核
4. 对照填充前后的完整度与曝光预估
5. 把确认后的属性写回上架流程

## 边界与不做

- 品类属性模板还没确定、需要先定义字段时不用本技能。
- 本技能产出属性预测值与置信度，不自动写入平台后台，也不承担上架合规责任。
- 低置信度必须走人工确认，主图是可选输入但会显著影响提取精度。

## 技能关联

- **前置**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Multilingual-Listing-Localization.html、Skill-Multilingual-Listing-Localization、Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding
- **延伸**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Listing-AI-Copywriting.html、Skill-Listing-AI-Copywriting、Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO
- **可组合**：Skill-Listing-Compliance-Auto-Repair.html、Skill-Listing-Compliance-Auto-Repair、Skill-Long-Tail-Search-Embedding-SEO.html、Skill-Long-Tail-Search-Embedding-SEO、Skill-Product-Attribute-Completion

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：22-数据采集工程　·　源卡：`Skill-Product-Attribute-Completion`