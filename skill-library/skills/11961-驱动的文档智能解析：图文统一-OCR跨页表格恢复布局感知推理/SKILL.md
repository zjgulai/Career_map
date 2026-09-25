---
name: "p2s-document-intelligence-parsing"
title: "Document Intelligence Parsing — LLM 驱动的文档智能解析：图文统一 OCR、跨页表格恢复、布局感知推理"
description: "触发词：文档智能解析、PDF表格抽取、跨页表格、版面感知、扫描件识别。何时不用：只把长文档切块入库时用语义分块技能；把采购邮件正文结构化时用邮件抽取技能。安全边界：合规文件解析结果仅作预检参考，不得替代法规符合性判定与官方认证结论。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 采购比价 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Document-Intelligence-Parsing"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "把供应商发来的 PDF 报价单和合规报告，连同跨页表格一起读成结构化表格，录入不必再靠人工。"
user_try: "试试：解析这 20 家供应商的 PDF 报价单，抽商品名、规格、MOQ、阶梯价格和交期，输出成一张表。"
whenToUse: "输入是非结构化或扫描版文档、需要还原表格与版面结构时用本技能；输入本身是结构化数据或只需切块，用分块类技能。"
workflow: "按页解析文档，识别标题、正文、表格与图 → 恢复跨页表格的表头与合并单元格 → 按目标字段抽取键值 → 对识别结果做结构校验 → 输出结构化表格"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Document Intelligence Parsing — LLM 驱动的文档智能解析：图文统一 OCR、跨页表格恢复、布局感知推理

## ① 解决的问题

每季度收到 20 家供应商 PDF 报价单，人工录入 SKU/价格/MOQ 需 3-4 天且错误率 8%——Layout-aware LLM 解析实现 PDF→结构化数据全自动，人工录入工时归零，错误率降至 1% 以下

## ② 核心算法逻辑

供应商发来的报价单是 PDF，工厂产能表是 Excel 截图，海关 HS 编码文件是扫描件——这些"已有但不可用"的数据是母婴跨境电商最大的数据孤岛。传统 OCR（Tesseract）只能识别文字，无法理解表格结构、跨页截断、图文混排。

## ③ 业务应用场景

业务背景：每季度收到 15-20 家供应商的 PDF 报价单，每份 5-30 页，包含 SKU 表格（商品名/规格/MOQ/阶梯价格/交期）。目前人工录入需要 3-4 天，错误率约 8%。
业务背景：新品进入欧盟市场前需要检查 CE 声明、REACH 合规报告（通常为 PDF 扫描件），判断是否满足合规要求。
应用效果： - dots.mocr 从合规 PDF 中提取检测项目表格 - Qianfan-OCR 正确识别化学品限制值表格（多层表头：物质名 / 测试方法 / 限制值 / 检测值 / 结论） - 自动对比 REACH 法规阈值 → 生成合规预检报告 - 时间：人工 2h/份 → 自动化 5min/份

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（376 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/data_collection/document_intelligence_parsing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Document-Intelligence-Parsing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Document Intelligence Parsing
整合 dots.mocr (图文统一) + Qianfan-OCR (布局推理) + MinerU-Popo (跨页表格)

论文来源:
  dots.mocr:    arXiv:2603.13032
  Qianfan-OCR:  arXiv:2603.13398
  MinerU-Popo:  arXiv:2605.24973
"""

import json
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
from enum import Enum


class DocumentElementType(Enum):
    TEXT = "text"
    TABLE = "table"
    FIGURE = "figure"
    TITLE = "title"
    LIST = "list"


@dataclass
class TableCell:
    value: str
    row_span: int = 1
    col_span: int = 1
    is_header: bool = False


@dataclass
class ParsedTable:
    headers: List[List[str]]
    rows: List[List[str]]
    caption: str = ""
    page_start: int = 0
    page_end: int = 0
    is_truncated: bool = False

    def to_dicts(self) -> List[Dict[str, str]]:
        if not self.headers or not self.rows:
            return []
        flat_headers = self.headers[-1] if len(self.headers) > 1 else self.headers[0]
        return [
            {flat_headers[i]: row[i] for i in range(min(len(flat_headers), len(row)))}
            for row in self.rows
        ]


@dataclass
class ParsedFigure:
    figure_type: str
    caption: str
    extracted_data: Dict[str, Any] = field(default_factory=dict)
    certifications: List[str] = field(default_factory=list)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2603.13398 — Qianfan-OCR: A Unified End-to-End Model for Document Intelligence

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待解析文档（供应商报价单 PDF、合规声明与检测报告扫描件，通常 5 到 30 页）与目标字段清单，粒度到单个文档与单张表格。

**输出**：结构化表格与键值字段（商品名、规格、MOQ、阶梯价格、交期，或合规检测项与限制值）以及版面元素结果，供采购比价与合规预检使用。

## 执行步骤

1. 按页解析文档，切分标题、段落、表格与图片
2. 识别表头与合并单元格，恢复跨页表格
3. 按目标字段抽取单元格内容
4. 对提取结果做格式与单位校验
5. 输出结构化表格供下游比对

## 边界与不做

- 文档严重模糊、缺页或手写体占比高时识别质量无法保证；纯结构化输入无需本技能。
- 解析结果用于合规预检与比价参考，不替代法规符合性判定，错误率下降幅度以卡页原始口径为准。

## 技能关联

- **延伸**：Skill-Dynamic-Lot-Sizing-MOQ.html、Skill-Dynamic-Lot-Sizing-MOQ、Skill-Multi-SKU-Procurement-Budget-Allocation.html、Skill-Multi-SKU-Procurement-Budget-Allocation、Skill-Procurement-Email-Extraction.html、Skill-Procurement-Email-Extraction、Skill-Supplier-Capacity-Planning.html、Skill-Supplier-Capacity-Planning
- **可组合**：Skill-Cross-Org-Agent-Protocol.html、Skill-Cross-Org-Agent-Protocol、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-Document-Intelligence-Parsing

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Document-Intelligence-Parsing`