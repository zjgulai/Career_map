---
name: "p2s-multimodal-rag"
title: "Multimodal RAG - 图文混合多模态检索增强生成"
description: "触发词：多模态检索、证书图片、OCR 索引、CLIP 嵌入、图文融合、证据回答。何时不用：只解析 PDF 表格页面时用「VisRAG 视觉文档 RAG」，要审合同条款风险时用「LLM 合同合规审查」。安全边界：回答须附图片证据与证书编号，不得引用无法核验的认证截图。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查 / 市场语境审查"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Multimodal-RAG"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "客户问奶瓶 SKU 有没有 FDA 认证时，证书图片也能被搜出来，30 秒给出带图证据的答案。"
user_try: "试试：奶瓶 SKU-A32 有 FDA 认证吗？从证书图片库里检索，给出证书编号、机构、有效期和图片证据。"
whenToUse: "认证证书以图片或扫描件存在、纯文本检索覆盖不到时用；只解析 PDF 表格页面时用「VisRAG 视觉文档 RAG」；要审合同条款时用「LLM 合同合规审查」。"
workflow: "对全部证书图片做 OCR 提取编号、机构与有效期 → 用图像嵌入建立证书图片索引 → 文本查询同时检索 OCR 索引与图像索引 → 用 Late Fusion 融合多模态排序结果 → 由 LMM 生成带图证据的回答"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multimodal RAG - 图文混合多模态检索增强生成

## ① 解决的问题

内容审核面临图文视频信息混杂——多模态RAG将审核漏检率降30%，年化省13万元

## ② 核心算法逻辑

Multimodal RAG（多模态检索增强生成） 将 RAG 系统从纯文本扩展到图文混合模态，实现：

## ③ 业务应用场景

业务背景：母婴卖家在亚马逊/独立站上传产品时，需要提供 FDA、CE、ASTM 等认证证书图片。客服和运营团队每天需要回答"奶瓶 SKU-A32 有 FDA 认证吗？"类问题，但证书存在图片 PDF 中，无法被纯文本系统检索。
Multimodal RAG 方案： 1. 对所有认证证书图片执行 OCR，提取证书编号/机构/有效期 2. CLIP 图像 embedding 索引证书图片 3. 用户文本查询同时检索 OCR 文本索引 + CLIP 图像索引 4. Late Fusion 融合排序后，LMM 生成带图证据的回答
量化 ROI： | 指标 | Before（人工翻查）| After（Multimodal RAG）| 提升 | |---|---|---|---| | 认证查询响应时间 | 15-30分钟 | 30秒 | 97% 降低 | | 认证覆盖率（能被检索到）| 60% | 94% | +57% | | 运营团队效率 | 基准 | 节省 10h/人/周 | $15K/人/年 | | 错误认证引用率 | 8% | 0.5% | -94% |

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（489 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/knowledge_graph/multimodal_rag` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-Multimodal-RAG.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Multimodal RAG - 图文混合多模态检索增强生成
参考论文: CLIP (arXiv:2103.00020), MuRAG (arXiv:2210.02928),
          LLaVA (arXiv:2304.08485)

实现要点：
1. 图文统一 embedding（CLIP 风格，mock 实现）
2. OCR 文字提取（mock）
3. Late Fusion 多模态评分融合
4. 多模态检索器（文本/图像/混合查询）
5. 上下文组装（供 LMM 生成回答）

运行环境：Python 3.9+，无需外部 API（全 mock）
"""

import ast
import math
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple


# ─────────────────────────────────────────────
# 枚举 & 数据结构
# ─────────────────────────────────────────────

class ModalityType(Enum):
    TEXT = "text"
    IMAGE = "image"
    MULTIMODAL = "multimodal"   # 图文混合文档（如带图说明书）


@dataclass
class MultimodalDocument:
    """多模态文档节点"""
    doc_id: str
    modality: ModalityType
    text: Optional[str] = None          # 文本内容（文本文档 / OCR 文字）
    image_description: Optional[str] = None  # 图像语义描述（mock）
    ocr_text: Optional[str] = None      # OCR 提取的图中文字
    metadata: Dict = field(default_factory=dict)
    text_embedding: Optional[List[float]] = None
    image_embedding: Optional[List[float]] = None


@dataclass
class RetrievalResult:
    """检索结果"""
    document: MultimodalDocument
    text_score: float = 0.0
    image_score: float = 0.0
    fusion_score: float = 0.0
    matched_by: str = "text"    # "text" | "image" | "ocr" | "fusion"


# ─────────────────────────────────────────────
# Mock 工具函数（CLIP 风格）
# ─────────────────────────────────────────────
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2210.02928 — MuRAG: Multimodal Retrieval-Augmented Generator for Open Question Answering over Images and Text

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：认证证书图片（FDA、CE、ASTM 等，含证书编号、机构、有效期）与用户的自然语言查询（如某 SKU 是否有某认证）；粒度：单张证书图片。

**输出**：带图证据的认证问答结果：命中的证书图片与 OCR 字段（证书编号、机构、有效期）、融合排序得分与答案文本；把认证查询响应由人工 15-30 分钟缩短至 30 秒，供客服与运营回答认证类问题。

## 执行步骤

1. 对证书图片做 OCR 提取关键字段
2. 用图像嵌入建立证书图片索引
3. 文本查询并行检索 OCR 与图像索引
4. 用 Late Fusion 融合排序证据
5. 生成带图证据的认证回答

## 边界与不做

- 数据不满足时不用：证书图片缺失、或模糊到 OCR 提不出编号时，检索覆盖不全（卡页给出人工基线覆盖率 60%）。
- 能力边界：只做检索与证据组装，不判定认证真伪与有效性；回答须附证书编号供人工核验，不得直接作为法律证据。
- 时效边界：证书过期或换版后索引需同步更新，否则会拿过期证书作答。

## 技能关联

- **前置**：Skill-Dense-Retrieval-Ecommerce-Semantic-Search.html、Skill-Dense-Retrieval-Ecommerce-Semantic-Search、Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing
- **延伸**：Skill-KGQA-Question-Answering.html、Skill-KGQA-Question-Answering、Skill-LMM-Searcher-Multimodal-Context.html、Skill-LMM-Searcher-Multimodal-Context
- **可组合**：Skill-HyDE-Hypothetical-Document.html、Skill-HyDE-Hypothetical-Document、Skill-Visual-Data-Collection.html、Skill-Visual-Data-Collection、Skill-Multimodal-RAG

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：08-知识图谱　·　源卡：`Skill-Multimodal-RAG`