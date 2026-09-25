---
name: "p2s-hierarchical-product-kg-construction"
title: "层级商品知识图谱自动构建（图片→KG）"
description: "触发词：商品知识图谱、图片萃取属性、品类路径、Flat File、多语种检索。何时不用：单条 Listing 的违规修复用「Listing 合规自动修复」；本技能面向万级 SKU 的属性图谱构建。安全边界：仅使用厂商提供的商品图与描述，供应商信息须脱敏，上架合规责任仍在卖家。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 商品诊断 / 主数据治理"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Hierarchical-Product-KG-Construction"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "上传商品图就能自动填出品类路径、净重、材质、适用月龄等必填属性，一套图谱还能多语种检索。"
user_try: "试试：用这批商品主图给 1 万个 SKU 生成 Amazon Flat File 兼容的属性 JSON。"
whenToUse: "当上万 SKU 需要批量建属性图谱、解决多语种与必填属性填写的重复劳动时用；单条 Listing 的合规修复用「Listing 合规自动修复」。"
workflow: "先定义品类 Schema 与枚举选项 → 用视觉模型从商品主图多轮萃取属性 → 用 LLM 做约束推理补齐缺失字段并校验 → 按层级扩展并程序化去重生成图谱节点"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 层级商品知识图谱自动构建（图片→KG）

## ① 解决的问题

业务问题:出海卖家上架 1 万件母婴新品到 Amazon US,需逐 SKU 填写品类路径(`Baby > Feeding > Baby Formula > Infant Formula 0-6m`)、净重(g)、包装材质、适用月龄等 10+ 个强制属性

## ② 核心算法逻辑

零样本下用商品图片自动构建跨语种属性知识图谱:Schema 先行 → VLM 多轮萃取 → LLM 约束推理 → 层级扩展 → 程序化去重。建库成本与 SKU 数量线性解耦,无需人工标注模板。

## ③ 业务应用场景

- 业务问题:出海卖家上架 1 万件母婴新品到 Amazon US,需逐 SKU 填写品类路径(`Baby > Feeding > Baby Formula > Infant Formula 0-6m`)、净重(g)、包装材质、适用月龄等 10+ 个强制属性。人工填写需 2-3 人月,且因中英描述不一致导致 listing 违规下架风险。 - 数据要求:仅需厂商提供的商品主图(JPG/PNG ≥ 448×448)和可选的中文描述 - 预期产出:对每件 SKU 自动输出 Amazon Flat File 兼容 JSON,含完整品类路径 + 物理属性 + 适用人群 - 业务价值:1 万 SKU 的
- 业务问题:某母婴出海选品平台需对马来西亚/印尼市场 5 万件 SKU 建可检索属性图谱。商品多为中国制造,只有中文描述+图片,但目标市场用 Bahasa/英文搜索。传统做法需要 3 套语种各建一遍图谱。 - 数据要求:商品主图(语言无关)+ 顶层品类配置文件(英文/中文/Bahasa 三语对照表) - 预期产出:统一的层级 KG,中间节点天然可挂载多语种别名(`安抚奶嘴 / pacifier / dot bayi`),支持任意语种检索 - 业务价值:单一图谱多语种复用,建图成本从 30 人月降到 5 GPU 天;因多语种检索召回率提升 25-40%,选品平台 GMV 增量可量化为单月 30
三轨验证 | 成本轨：知识图谱构建月均成本1200元（图数据库License 600元/月+数据标注人工12小时/月×50元/小时），初期投入15000元（服务器配置+模型训练） | 合规轨：符合《跨境电商商品信息规范》和《供应商数据安全管理办法》，需建立数据分类分级制度，供应商信息脱敏处理率需达100% | 风险轨：图谱数据质量不稳定导致断货预测准确率<75%（概率35%），供应商数据更新延迟超24小时影响实时性（概率28%），知识图谱维护人员流失导致更新中断（概率18%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

节省 listing 准备人力:1 万 SKU × 3 人月 × 月薪 1.5 万 = 45 万元/年/卖家
减少违规下架损失:违规率 5-8% → 0.5%,按平均 GMV 100 万元/月计 = 节省 50-80 万元/年
总收益:单卖家年增 95-125 万元,投入 GPU 推理成本约 2-5 万元
ROI ≈ 30-60 倍
多语种建图复用:30 人月 → 5 GPU 天 = 节省人工成本 ~100 万元
多语种检索召回提升 25-40%:中型平台月 GMV 5000 万 × 0.5%(召回提升的转化贡献) = 月增 25 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（224 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/knowledge_graph/hierarchical_product_kg_construction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Hierarchical-Product-KG-Construction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Hierarchical Product KG Construction — 论文 arXiv:2410.21237 最小骨架实现

依赖:
    pip install sglang[all] transformers pillow

注意:
    论文无公开代码,以下骨架按论文 §3-4 描述还原。
    生产环境替换 mock VLM/LLM 为 InternVL2-8B + Llama3.1-70B 或同等 API。
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Callable, Dict, List, Optional


BABY_ECOM_SCHEMA: Dict[str, object] = {
    "product_name": "str",
    "category": {
        "type": "choices",
        "options": [
            "Infant Formula", "Baby Food", "Baby Bottle", "Pacifier",
            "Diaper", "Baby Clothing", "Stroller", "Baby Carrier",
            "Baby Wipes", "Baby Skincare", "Others",
        ],
    },
    "brand": "str",
    "primary_color": {
        "type": "choices",
        "options": ["White", "Pink", "Blue", "Green", "Yellow", "Purple", "Others"],
    },
    "package_material": {
        "type": "choices",
        "options": ["Plastic", "Metal", "Cardboard", "Glass", "Fabric", "Others"],
    },
    "weight_kg": "float",
    "age_range": {
        "type": "choices",
        "options": ["0-6m", "6-12m", "1-3y", "3-6y", "All ages"],
    },
}


@dataclass
class ProductKGNode:
    properties: Dict[str, object]
    category_hierarchy: List[str]


def _mock_vlm_extract(image_path: str, schema: Dict[str, object]) -> str:
    desc_parts = []
    fname = image_path.lower()
    if "aptamil" in fname or "formula" in fname:
        desc_parts.append("infant formula in metallic cylindrical can")
    if "pacifier" in fname or "dot" in fname:
        desc_parts.append("silicone pacifier in pink/blue plastic packaging")
    if "diaper" in fname:
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2410.21237。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：商品主图（JPG 或 PNG，短边不小于 448 像素）、可选中文描述、顶层品类 Schema 配置（可含多语种对照表）。

**输出**：每件 SKU 的 Amazon Flat File 兼容 JSON（完整品类路径、物理属性、适用人群）与可挂多语种别名的层级知识图谱。

## 执行步骤

1. 定义品类 Schema 与各属性枚举选项
2. 用视觉模型从商品主图多轮萃取属性
3. 用 LLM 做约束推理补齐缺失字段并校验
4. 按层级扩展并程序化去重生成图谱节点
5. 导出 Flat File 兼容 JSON 并抽样人工复核

## 边界与不做

- 何时不用：没有合规商品图或不接受人工抽检时，图谱质量无法保障
- 能力边界：只产出属性图谱与 Flat File JSON，不负责平台合规判定，上架合规责任仍在卖家

## 技能关联

- **前置**：Skill-Knowledge-Graph-for-Skills-Management.html、Skill-Knowledge-Graph-for-Skills-Management、Skill-Multilingual-NER-Universal-v2.html、Skill-Multilingual-NER-Universal-v2
- **延伸**：Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Relation-Completion-CBLiP.html、Skill-KG-Relation-Completion-CBLiP
- **可组合**：Skill-Cold-Start-Product-Recommendation.html、Skill-Cold-Start-Product-Recommendation、Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Hierarchical-Product-KG-Construction

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：08-知识图谱　·　源卡：`Skill-Hierarchical-Product-KG-Construction`