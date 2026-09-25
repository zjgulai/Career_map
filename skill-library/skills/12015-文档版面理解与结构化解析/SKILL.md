---
name: "p2s-layoutlm-document-structure-parsing"
title: "LayoutLM — 文档版面理解与结构化解析"
description: "触发词：版面理解、区域分类、文本坐标、图注剔除、表格边界识别。何时不用：需要把表格内容还原成结构化字段时用文档智能解析技能；只需按语义切块入库时用语义分块技能。安全边界：解析只做结构分类与区域过滤，不得改动原文内容与法规条款表述。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-LayoutLM-Document-Structure-Parsing"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "用文本加坐标判断每段属于标题、正文还是图注参考文献，把混进正文的说明文字剔出去。"
user_try: "试试：用版面分析把这批 PDF 的图注和参考文献剔掉，只留摘要和正文再送去萃取。"
whenToUse: "文本提取后正文被图注、参考文献污染，或需要识别表格边界时用本技能；需要把表格还原成结构化字段，用文档智能解析技能。"
workflow: "提取带坐标的文本单元 → 按纵坐标、字号与加粗判断区域类型 → 按区域类型过滤要保留的正文 → 识别表格边界与单元格 → 输出按区域划分的文档结构"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LayoutLM — 文档版面理解与结构化解析

## ① 解决的问题

知识库运营面临"PDF论文文本提取后图表说明污染正文导致Skill萃取质量差"——LayoutLM联合文本+坐标+视觉将内容污染率从23%降至4%，萃取质量评分提升1.2分

## ② 核心算法逻辑

论文：LayoutLMv3: Pretraining for Document AI with Unified Text and Image Masking | 年份：2022

## ③ 业务应用场景

- 业务痛点：论文 PDF 经文本提取后，图表说明、参考文献、作者信息混入正文，污染 Skill 萃取 - 数据要求：PDF 文件（含坐标信息），需要 `pdfplumber` 或 `pymupdf` 提取带坐标的 token - 执行：LayoutLM 分类每个 token 属于「标题/摘要/正文/图注/参考文献」→ 只保留摘要+正文输入 MasterPrompt - 量化产出：Skill 卡片内容污染率从 23% → 4%，萃取质量评分提升 1.2 分
三轨验证： - 成本轨：GPU 推理成本约 ¥0.08/篇（A100 按量计费），年处理 10,000 篇论文约 ¥800；人工标注训练集 500 篇约 ¥15,000；总投入约 ¥15,800。ROI 周期 2 个月（相比人工校对节省 ¥25,000/月） - 合规轨：✓ 完全合规。仅涉及学术论文的结构化解析，不涉及个人隐私数据；符合 GDPR（无个人信息处理）、Amazon 政策（学术资源合法使用） - 风险轨：低风险。竞品（如 Grobid）已开源，不存在技术垄断风险；品牌风险极低（学术论文处理无争议）；概率估计 <5%
- 业务痛点：CPSC/FDA 合规文档里的规则表格，纯文本提取后行列混乱，合规 Agent 误判 - 数据要求：PDF 合规文档，LayoutLM 识别表格边界和单元格 - 量化产出：合规规则抽取准确率从 61%（纯文本）→ 91%（LayoutLM）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

Skill 卡片内容污染率：23% → 4%（萃取质量提升 1.2 分）
合规文档表格抽取准确率：61% → 91%
减少人工校对 PDF 的时间：每篇论文节省约 15 分钟

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（136 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import re
from dataclasses import dataclass
from typing import Optional

@dataclass
class Document[REDACTED] str
    x0: float
    y0: float
    x1: float
    y1: float
    label: str = "O"

@dataclass
class DocumentRegion:
    region_type: str  # title/abstract/body/caption/reference/table
    tokens: list[DocumentToken]

    @property
    def text(self) -> str:
        return " ".join(t.text for t in self.tokens)

class SimpleLayoutParser:
    """
    基于规则的版面分析器（LayoutLM 的轻量替代，用于演示）
    生产部署: pip install layoutparser transformers
    """
    PAGE_HEIGHT = 1000.0
    PAGE_WIDTH  = 1000.0

    TITLE_ZONE    = (0.0,  0.15)  # 页面顶部 15%
    ABSTRACT_ZONE = (0.15, 0.35)
    BODY_ZONE     = (0.35, 0.88)
    REF_ZONE      = (0.88, 1.0)

    def _normalize_y(self, y: float, page_height: float) -> float:
        return y / page_height if page_height > 0 else y

    def _classify_region(self, norm_y: float, font_size: float,
                          is_bold: bool) -> str:
        if norm_y < self.TITLE_ZONE[1] and (font_size > 14 or is_bold):
            return "title"
        if self.ABSTRACT_ZONE[0] <= norm_y < self.ABSTRACT_ZONE[1]:
            return "abstract"
        if norm_y >= self.REF_ZONE[0]:
            return "reference"
        return "body"

    def parse(self, raw_tokens: list[dict],
              page_height: float = 792.0) -> list[DocumentRegion]:
        classified: dict[str, list[DocumentToken]] = {
            "title": [], "abstract": [], "body": [],
            "caption": [], "reference": [], "table": [],
        }
        for tok in raw_tokens:
            norm_y = self._normalize_y(tok.get("y0", 0), page_height)
            font_size = tok.get("font_size", 12)
            is_bold = tok.get("bold", False)
            label = self._classify_region(norm_y, font_size, is_bold)
            if re.match(r'(fig\.|figure|table|tab\.)\s*\d+', tok["text"].lower()):
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2204.08387 — LayoutLMv3: Pre-training for Document AI with Unified Text and Image Masking

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：PDF 文件与其带坐标的文本单元（需要能提取 token 坐标的解析库）以及区域类型定义，粒度到单个文本单元与单个版面区域。

**输出**：按标题、摘要、正文、图注、参考文献、表格划分的文档区域结果（含每区文本），供后续萃取与合规规则抽取使用。

## 执行步骤

1. 提取文档中带坐标的文本单元
2. 按纵坐标、字号与加粗判断每个单元的区域类型
3. 只保留摘要与正文等目标区域
4. 识别表格边界与单元格范围
5. 输出结构化的文档区域结果

## 边界与不做

- 扫描件没有文本层、或版面极其复杂（多栏混排、艺术排版）时分类准确率下降；纯文本输入无需版面分析。
- 本技能只做版面分类与区域过滤，不做语义理解与内容改写，污染率与准确率的改善幅度以卡页原始口径为准。

## 技能关联

- **前置**：Skill-Multimodal-Product-Understanding.html、Skill-Multimodal-Product-Understanding、Skill-Semantic-Chunking-Strategy.html、Skill-Semantic-Chunking-Strategy
- **延伸**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-MetaIE-Unified-Information-Extraction-Distillation.html、Skill-MetaIE-Unified-Information-Extraction-Distillation、Skill-iText2KG-Schema-Free-KG-Induction.html、Skill-iText2KG-Schema-Free-KG-Induction
- **可组合**：Skill-InstructUIE-Unified-Information-Extraction.html、Skill-InstructUIE-Unified-Information-Extraction、Skill-Multimodal-RAG.html、Skill-Multimodal-RAG、Skill-LayoutLM-Document-Structure-Parsing

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：08-知识图谱　·　源卡：`Skill-LayoutLM-Document-Structure-Parsing`