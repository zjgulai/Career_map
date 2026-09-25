---
name: "p2s-vlm-ecommerce-adaptation"
title: "VLM E-commerce Adaptation — 大规模视觉语言模型电商适配"
description: "触发词：视觉语言模型适配、多图属性提取、图片覆盖度、图片质量评分、认证标识识别。何时不用：要把整个品类的属性键归纳成图谱并接下游搜索推荐时用「多模态产品属性图谱 AutoPKG」。安全边界：只做图片审核与属性抽取，不判定商品真实合规、不代改 Listing。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 产品问答"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-VLM-Ecommerce-Adaptation"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "替运营把关商品图：属性有没有标对、关键角度有没有漏、哪张图糊了或挡住了，一次说清。"
user_try: "试试：审核这个 SKU 的 6 张产品图，抽出容量、材质、BPA-Free 属性并给图片覆盖度和质量打分。"
whenToUse: "当新建或维护 Listing 需要核查多张产品图的属性一致性、角度覆盖与图片质量时用本技能；若要做的是从图文归纳整个品类的属性键并生成属性图谱接下游，用「多模态产品属性图谱 AutoPKG」。"
workflow: "准备品类属性 Schema 与必需图片角度清单 → 输入图片 URL 走电商域适配后的 VLM 推理 → 抽属性、打置信度并评估覆盖度与质量 → 输出不合格原因列表交运营修改"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VLM E-commerce Adaptation — 大规模视觉语言模型电商适配

## ① 解决的问题

电商运营面临视觉判图不准——VLM适配将商品误判率11%降到2%，年化省18万元

## ② 核心算法逻辑

通用 VLM（如 GPT4V、LLaVA 等）在电商场景表现欠佳，根本原因是三大领域偏差：同款多图（同一产品的主图/侧面图/背面图/细节图共享同一 listing，模型需跨图聚合）、属性中心化（电商问答 90% 是围绕结构化属性如"材质/尺寸/颜色"，与图片描述类任务截然不同）、噪声图片（用户上传的低质量/遮挡/非标图占比极高）。

## ③ 业务应用场景

业务问题：新建 listing 时需要上传 5-8 张产品图，运营人员手动核查图片是否覆盖主图/侧面/刻度/奶嘴等关键角度，且需确认属性（容量/材质/BPA-Free 标注）与图片一致。每个 SKU 人工审核耗时 15-20 分钟，一个品牌月均 500+ 个新 SKU。
数据要求： - 输入：item_id + 多张图片 URL 列表 + 品类属性 Schema（JSON） - 属性 Schema 样例：`{"capacity_ml": int, "material": ["PP", "PPSU", "玻璃"], "bpa_free": bool, "age_range": str}`
预期产出： - 属性提取结果（JSON，带置信度） - 图片覆盖度评分（0-1，是否覆盖必需角度） - 质量评分（0-1，噪声/遮挡/模糊检测） - 不合格原因列表（供运营直接修改）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

1.6 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（277 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/vlm_ecommerce_adaptation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-VLM-Ecommerce-Adaptation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
VLM E-commerce Adaptation — 大规模视觉语言模型电商适配
论文: arXiv:2602.11733 | 2026年2月
场景: 母婴产品多图属性提取 + 认证标识识别
"""
from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ─── 数据类 ────────────────────────────────────────────────────────────────

class ViewType(str, Enum):
    MAIN = "main"
    SIDE = "side"
    BACK = "back"
    DETAIL = "detail"
    PACKAGE = "package"
    CERTIFICATION = "certification"


@dataclass
class ProductImage:
    """单张产品图片的元数据"""
    image_id: str
    url: str
    view_type: ViewType
    quality_score: float = 1.0      # 0-1，由 assess_image_quality 填入
    width: int = 1000
    height: int = 1000

    def is_usable(self, threshold: float = 0.4) -> bool:
        return self.quality_score >= threshold


# ─── 核心适配器 ────────────────────────────────────────────────────────────

class EcommerceVLMAdapter:
    """
    模拟电商域适配后的 VLM 推理接口。
    生产环境中此类调用真实 VLM API（如 Claude / GPT-4V / LLaVA-Next）。
    """

    # 认证标识库（名称 → 别名列表）
    CERT_LIBRARY: dict[str, list[str]] = {
        "FDA": ["fda", "food and drug administration", "fda approved"],
        "CE": ["ce", "ce mark", "ce marking", "conformité européenne"],
        "BPA_FREE": ["bpa-free", "bpa free", "no bpa", "bpa 0"],
        "ASTM_F963": ["astm f963", "astm", "toy safety"],
        "EN71": ["en71", "en 71", "european toy safety"],
        "CPSC": ["cpsc", "consumer product safety"],
    }

    def __init__(self, model_name: str = "ecom-vlm-v1", confidence_threshold: float = 0.7):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.11733 — Adapting Vision-Language Models for E-commerce Understanding at Scale

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：item_id 与多张图片 URL 列表、品类属性 Schema（JSON，如 capacity_ml、material、bpa_free、age_range），可选认证标识清单；粒度为 SKU × 图片。

**输出**：属性提取结果（JSON，带置信度）、图片覆盖度评分（0-1）、质量评分与噪声/遮挡/模糊检测结果、不合格原因列表；供新建 Listing 的运营直接据此修改。

## 执行步骤

1. 按品类准备属性 Schema（JSON）与需要覆盖的图片角度清单
2. 输入 item_id 与多张图片 URL，走电商域适配后的 VLM 推理
3. 抽取结构化属性并给出置信度，低于阈值（卡页 0.7）的标记待复核
4. 评估图片覆盖度与质量（噪声/遮挡/模糊），识别缺失角度
5. 输出不合格原因列表与认证标识识别结果，交运营修改 Listing

## 边界与不做

- 数据不满足：图片缺失、分辨率过低或属性 Schema 未定义时提取结果不可用，先补图片与 Schema。
- 何时不用：要做的是从图文把整个品类属性键归纳成图谱并接入搜索与推荐，用「多模态产品属性图谱 AutoPKG」；要做的是图文统一向量的以图搜货，用「多模态商品理解」。
- 能力边界：只做图片审核与属性抽取，不判定商品是否真正合规、不代改 Listing；卡页的误判率 11%→2%、年化省 18 万元为案例口径。

## 技能关联

- **前置**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-LMM-Searcher-Multimodal-Context.html、Skill-LMM-Searcher-Multimodal-Context、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **延伸**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-LMM-Searcher-Multimodal-Context.html、Skill-LMM-Searcher-Multimodal-Context、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **可组合**：Skill-AnchorCrafter-Virtual-Anchor-Demo.html、Skill-AnchorCrafter-Virtual-Anchor-Demo、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Phantom-Product-Showcase-I2V.html、Skill-Phantom-Product-Showcase-I2V、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework、Skill-VLM-Ecommerce-Adaptation

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：16-智能体工程　·　源卡：`Skill-VLM-Ecommerce-Adaptation`