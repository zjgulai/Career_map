---
name: "p2s-llm-demand-signal-extraction"
title: "LLM 从非结构化数据抽取需求信号 — 评论/社媒挖掘"
description: "触发词：需求信号、评论挖掘、卖点提炼、结构化抽取。何时不用：评论量很小、人工即可读完时不必批处理；需要严格统计口径时用规则化编码类技能。安全边界：评论数据获取需遵守平台条款，建议通过官方 API 或合规数据供应商获取。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-018"
l3_business: "需求分群"
l3_all: "需求分群 / VOC编码"
l1_l2_l3: "业务运营/产品与创新/需求分群"
p2s_card_id: "Skill-LLM-Demand-Signal-Extraction"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用大模型批量读评论与社媒内容，抽出未被满足的需求和可直接使用的卖点。"
user_try: "试试：帮我读完这 500 条竞品评论，列出未被满足的功能需求和高频使用场景。"
whenToUse: "本卡属「需求分群」。需要从大批非结构化评论或社媒文本中抽取需求信号时用本卡；把需求按人群属性分层时用月龄需求分层类技能。"
workflow: "批量切分评论文本 → 用提示词抽取信号 → 过滤低置信项 → 汇总 Top 需求与场景"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM 从非结构化数据抽取需求信号 — 评论/社媒挖掘

## ① 解决的问题

选品分析师面临"从海量评论和社媒内容中手动提炼需求信号耗时且遗漏多"——LLM结构化需求信号抽取将分析覆盖率从5%提升至90%且速度提升50倍，年化发现更多选品机会增收30-60万元

## ② 核心算法逻辑

非结构化文本（亚马逊评论、Reddit 讨论、TikTok 评论）蕴含丰富的需求信号，但传统关键词匹配难以捕捉语义。LLM 需求信号提取通过以下框架实现结构化输出：

## ③ 业务应用场景

场景1：婴儿喂养类目新品机会挖掘 - 业务问题：分析 500 条竞品评论找选品机会，人工需 4-6 小时 - 数据要求：竞品 ASIN 的评论文本（含评分）、评论时间（取近 90 天） - 预期产出：Top-10 未被满足的功能需求、Top-5 高频使用场景，30 分钟内完成 - 业务价值：发现选品机会（如"支持蓝牙 APP 监控的智能暖奶器"），年化潜在新品销售额 50 万元+
场景2：Listing 优化卖点提炼 - 业务问题：产品有 200+ 条好评，但无法快速提炼哪些卖点最能打动买家 - 数据要求：5 星评论文本（取正向信号），区分 verified purchase - 预期产出：按频次排序的前 10 个买家认可卖点，直接用于 Listing bullet points - 业务价值：Listing 优化后 CTR 提升 8-15%，CVR 提升 3-8%
**三轨验证**： - 成本：500 条评论约消耗 50K tokens（批处理），成本约 $0.10-0.50 - 合规：亚马逊评论数据爬取需遵守 ToS，建议通过官方 API 或合规数据供应商获取 - 风险：LLM 可能将文化差异性评论误判为需求信号（如某些国家的惯用夸张表达）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：选品研究时间从 6 小时降至 30 分钟，每次选品研究节省 90% 时间；发现高价值需求信号后，新品成功率提升 20-35%
实施难度：⭐⭐⭐☆☆（核心逻辑简单，关键是分类体系设计和批处理效率）
优先级：⭐⭐⭐⭐☆（选品和 Listing 优化都依赖此能力，高优）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
LLM 需求信号提取框架
依赖：json（标准库）, collections（标准库）
注：LLM 调用使用 mock，替换为真实 API 即可
"""
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Optional


@dataclass
class DemandSignal:
    signal_type: str  # feature_request / pain_point / use_case / comparison
    content: str
    product_aspect: str  # 涉及产品维度（price/quality/usability/safety...）
    confidence: float
    source_text: str


# === Mock LLM ===
def call_llm_extract(reviews_batch: list[str]) -> str:
    """Mock 提取，实际替换为 LLM API"""
    mock_signals = [
        {"signal_type": "pain_point", "content": "预热时间太长，超过 5 分钟",
         "product_aspect": "usability", "confidence": 0.92,
         "source_text": reviews_batch[0] if reviews_batch else ""},
        {"signal_type": "feature_request", "content": "希望支持 APP 远程控制温度",
         "product_aspect": "technology", "confidence": 0.88,
         "source_text": reviews_batch[1] if len(reviews_batch) > 1 else ""},
        {"signal_type": "use_case", "content": "夜间喂奶使用，不想开灯操作",
         "product_aspect": "usability", "confidence": 0.85,
         "source_text": reviews_batch[0] if reviews_batch else ""},
        {"signal_type": "comparison", "content": "比竞品 B 预热更稳定但价格更贵",
         "product_aspect": "price", "confidence": 0.75,
         "source_text": reviews_batch[2] if len(reviews_batch) > 2 else ""},
    ]
    return json.dumps(mock_signals[:len(reviews_batch)+1])


class DemandSignalExtractor:
    def __init__(self, llm_fn=call_llm_extract, batch_size: int = 20, min_confidence: float = 0.7):
        self.llm_fn = llm_fn
        self.batch_size = batch_size
        self.min_confidence = min_confidence

    def _build_prompt(self, reviews: list[str]) -> str:
        reviews_str = "\n".join(f"{i+1}. {r}" for i, r in enumerate(reviews))
        return f"""分析以下产品评论，提取需求信号。输出 JSON 数组，每项包含：
- signal_type: "feature_request"/"pain_point"/"use_case"/"comparison"
- content: 信号内容（简洁描述，20字以内）
- product_aspect: "price"/"quality"/"usability"/"safety"/"technology"之一
- confidence: 0-1 置信度
- source_text: 原文片段

评论：
{reviews_str}

直接输出 JSON 数组："""
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：竞品 ASIN 的评论文本（含评分与评论时间，取近 90 天）或社媒内容文本，批量处理时按固定条数分批。

**输出**：结构化需求信号清单（含置信度）：未被满足的功能需求榜、高频使用场景、买家认可的卖点排序，可直接用于选品与 Listing。

## 执行步骤

1. 采集并清洗目标评论文本
2. 按批次构造抽取提示词并调用模型
3. 过滤低于置信度阈值的结果
4. 汇总未被满足需求与高频场景
5. 输出可用于选品与 Listing 的卖点清单

## 边界与不做

- 评论量很小、人工可直接读完成时不必用本卡
- 本卡产出需求信号与卖点，不负责选品定案与 Listing 上架
- 评论数据获取需遵守平台条款，建议通过官方 API 或合规数据供应商获取

## 技能关联

- **可组合**：Skill-LLM-Demand-Signal-Extraction

---

> 分类：业务运营/产品与创新/需求分群　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Demand-Signal-Extraction`