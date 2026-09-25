---
name: "p2s-ecommerce-data-quality-assessment"
title: "E-commerce Data Quality Assessment — 产品目录数据质量双轨评分与门控"
description: "触发词：商品数据质量、字段评分、行级门控、目录体检、待修复队列。何时不用：要对齐多系统同一实体的数字走跨系统对账；要监控管道运行状态走质量告警。安全边界：卡页原文明示低质 SKU 不得直接进入下游属性图谱与上架流程，门控阈值须先校准再全量放行。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Ecommerce-Data-Quality-Assessment"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "给商品目录做字段与整行的质量评分，低分 SKU 拦在上架和图谱构建之前。"
user_try: "试试：把这批 SKU 先过一遍质量评分，低于 0.6 的挑出来进待修复队列。"
whenToUse: "批量 SKU 要进下游（属性图谱、上架、推荐）之前需要质量门控时用；系统间数字对不齐请转跨系统对账。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# E-commerce Data Quality Assessment — 产品目录数据质量双轨评分与门控

## ① 解决的问题

母婴跨境电商应用：商品 catalog 错误检测与缺失模态补全，保证下游推荐/搜索质量

## ② 核心算法逻辑

电商产品目录的质量问题藏得很深——表面上 SKU 数据"有值"，但值是错的、过期的、格式不统一、或关键属性缺失。母婴跨境卖家最常见的问题：800 个 SKU 的适用月龄字段有 60 种写法，80 个 SKU 图片 URL 已失效，200 个 SKU 的 BPAFree 认证状态为空。这些直接导致推荐系统乱推、AutoPKG 构建图谱时噪声激增。

## ③ 业务应用场景

业务问题：AutoPKG 多模态属性图谱构建需要高质量输入——产品描述残缺（< 50 字符）、主图 URL 失效、属性格式混乱会让 PKG 属性提取 WKE 从 0.724 跌到 0.5 以下，浪费大量 LLM API 成本。
DQSOps 处理： 1. 批量 SKU 进入 AutoPKG 前，先运行 DQSOps 质量评估 2. 字段级评分：标题长度、描述长度、图片 URL 可访问性、必填属性完整率 3. 行级过滤：质量分 < 0.6 的 SKU 进入"待修复队列"，不进入 AutoPKG 4. 表级报告：完整性 xx%、异常 URL yy 个，帮助运营优先修复
业务价值：LLM API 成本节省 30%（过滤低质量 SKU）；PKG 属性提取 WKE 从 ~0.5 提升到 ~0.72，带来年化 GMV 增量 ¥20-50 万

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
过滤低质量 SKU 节省 LLM API 成本：¥5,000-20,000/批（1000 SKU × 30% 过滤率）
PKG 属性提取质量提升带来 GMV 增量：¥20-50 万/年
避免 Amazon 违规上架处罚：¥50,000-200,000/次
年化综合 ROI：¥80-300 万（视 SKU 规模）
实施难度：⭐⭐☆☆☆（纯 Python，无外部依赖，1-2 天接入）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（272 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/ecommerce_data_quality_assessment` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Ecommerce-Data-Quality-Assessment.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
E-commerce Data Quality Assessment — 产品目录数据质量双轨评分
基于 DQSOps (arXiv: 2303.15068) 实现

依赖: re, statistics, dataclasses (标准库)
"""

from dataclasses import dataclass, field
from typing import Optional
import re
import statistics


@dataclass
class FieldSchema:
    name: str
    required: bool = True
    min_length: int = 0
    max_length: int = 10000
    dtype: str = "str"                      # str / int / float / url
    valid_range: tuple = (None, None)
    weight: float = 1.0
    pattern: Optional[str] = None


@dataclass
class FieldQuality:
    field_name: str
    rule_score: float
    ml_score: float
    final_score: float
    issues: list = field(default_factory=list)


@dataclass
class RowQuality:
    row_id: str
    field_scores: dict = field(default_factory=dict)
    row_score: float = 1.0
    is_blocked: bool = False


@dataclass
class TableQualityReport:
    table_name: str
    total_rows: int
    passed_rows: int
    blocked_rows: int
    table_score: float
    dimension_scores: dict
    top_issues: list
    sla_passed: bool


class RuleScorer:
    """规则轨：完整性 + 类型准确性 + 长度约束 + 正则"""

    def score_field(self, value, schema: FieldSchema) -> FieldQuality:
        issues = []
        score = 1.0
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2303.15068 — DQSOps: Data Quality Scoring Operations Framework for Data-Driven Applications

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待评估的商品目录数据（标题、描述、图片 URL、必填属性等字段）与字段级质量规则及阈值

**输出**：字段级评分、行级质量分与待修复队列、表级质量报告（完整率、异常 URL 数），供运营优先修复并放行合格 SKU

## 执行步骤

1. 按字段规则做字段级评分（标题长度、描述长度、图片 URL 可访问性、必填属性完整率）。
2. 汇总行级质量分，把低于阈值（卡页示例 0.6）的 SKU 拦进待修复队列。
3. 生成表级报告，统计完整率与异常 URL 数量。
4. 只放行合格 SKU 进入下游图谱构建与上架流程。

## 边界与不做

- 何时不用：要对齐不同系统的同一实体数字时，请转跨系统对账；要看管道是否在正常运行，请转质量监控告警。
- 能力边界：只评分与拦截，不自动补全或修复商品字段。
- 安全边界：卡页原文明示低质 SKU 不得直接进入下游属性图谱与上架流程，门控阈值须先校准再全量放行。

## 技能关联

- **前置**：Skill-Adaptive-Crawl-Scheduling.html、Skill-Adaptive-Crawl-Scheduling、Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Data-Provenance-Lineage.html、Skill-Data-Provenance-Lineage、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query
- **延伸**：Skill-AutoPKG-Multimodal-Product-Attribute-KG.html、Skill-AutoPKG-Multimodal-Product-Attribute-KG、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Product-Knowledge-Graph-Query.html、Skill-Product-Knowledge-Graph-Query
- **可组合**：Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Ecommerce-Data-Quality-Assessment

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Ecommerce-Data-Quality-Assessment`