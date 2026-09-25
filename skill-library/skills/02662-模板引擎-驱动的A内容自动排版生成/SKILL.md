---
name: "p2s-a-plus-content-template-engine"
title: "A+Content模板引擎 — VOC驱动的A+内容自动排版生成"
description: "触发词：A+ 内容、VOC 洞察、模块模板、图文方案、季节性更新。何时不用：生成整条 Listing 标题与五点用「Listing 文案 AI 生成」；本技能只做 A+ 模块级内容方案。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 内容策划"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-A-Plus-Content-Template-Engine"
p2s_src_domain: "20-AI视频生成"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从竞品评论里找出用户最在意的点，自动排出一套 A+ 图文模块方案，把制作从几天压到几小时。"
user_try: "试试：根据这 1000 条竞品评论，给新款婴儿推车出一套 A+ 模块文案和图片建议。"
whenToUse: "当需要结构化 A+ 模块方案而非整条 Listing 文案、要按 VOC 优先级排模块时用；标题与五点批量生成用「Listing 文案 AI 生成」。"
workflow: "从 VOC 评论中检索高频关注点与痛点 → 把洞察填充进预设 A+ 模块模板生成文案 → 为每个模块给出图片尺寸建议与植入关键词 → 按优先级排序模块并给出 A/B 测试建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# A+Content模板引擎 — VOC驱动的A+内容自动排版生成

## ① 解决的问题

品牌运营面临"A+Content制作外包贵且来回修改周期长"——RAG+模板引擎将A+内容从创意到成稿压缩至2小时，CTR提升12%，年化节省制作费$2.4万

## ② 核心算法逻辑

核心思想：RAG（检索增强生成）+ 模板引擎双轨协同。先从 VOC 评论数据中检索用户高频关注点（RAG），再将这些洞察填充到预设的 A+ Content 模块模板（Template Engine），生成结构化的图文内容方案。

## ③ 业务应用场景

场景A：新品 A+ Content 快速产出 - 业务问题：一款婴儿推车新品缺乏 A+ Content，导致详情页内容单薄，转化率比竞品低 18%；设计师制作一套 A+ 需 3-5 天，且经常不知道用户最关心什么 - 数据要求： - 竞品 Top10 评论（1,000+ 条，可爬取） - 本品基础参数（重量/尺寸/材质/认证/特色功能） - 品牌故事素材（成立年份/理念/获奖记录） - 预期产出：6-8 个 A+ 模块的完整文案方案 + 建议图片尺寸和内容说明 + 模块优先级建议 - 业务价值：A+ Content 上线后 CTR 提升 10-15%，转化率提升 3-5%；制作周期从 5 天压
**场景B：A+ Content 季节性更新** - 业务问题：Prime Day 前需对 30 个主力 SKU 的 A+ Content 注入促销信息和节日元素，但不破坏现有结构 - 数据要求：现有 A+ Content HTML + 促销主题关键词 + 节日时间节点 - 预期产出：差异化更新方案（只改需要改的模块），附 A/B 测试建议 - 业务价值：节日期间转化率提升预估 8%，节省内容团队 60 小时/活动 - **三轨验证**： - **成本**：LLM 调用（30 SKU × 3 模块更新 × $0.1 = $9/活动）；人工审核（2 小时 × $80 = $160/活动）；A/B

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
单 SKU 制作费节省：设计师 3-5 天 × $80/天 = $240-400/SKU
时间节省：5 天 → 2 小时（96% 压缩），节假日首发前置
A+ Content 上线转化提升：转化率 +3-5% → 月均 GMV 增量 **$3,000-8,000

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（318 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/a_plus_content_template_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-A-Plus-Content-Template-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
A+ Content 模板引擎
VOC 检索增强 + 结构化模板填充 + LLM 文案润色
生产环境：接入真实 LLM API + Sentence-BERT 向量检索
"""
import json
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class VOCInsight:
    """用户声音洞察"""
    aspect: str          # 关注维度（如 "安全性"、"易用性"）
    sentiment: str       # 情感倾向（positive/negative/neutral）
    frequency: int       # 出现频次
    example_quote: str   # 代表性原文
    pain_point: bool     # 是否为痛点（负面高频）


@dataclass
class APlusModule:
    """单个 A+ Content 模块"""
    module_type: str              # headline_image / standard_text / comparison_table / brand_story / tech_specs
    headline: str                 # 模块标题
    body_text: str                # 正文
    image_suggestion: str         # 图片建议描述
    keywords: List[str]           # 植入关键词
    priority: int                 # 模块优先级（1=最重要）


@dataclass
class APlusContentPlan:
    """完整 A+ Content 方案"""
    product_name: str
    modules: List[APlusModule]
    estimated_ctr_lift: str       # 预估 CTR 提升
    ab_test_suggestion: str       # A/B 测试建议


class MockVectorDB:
    """
    向量检索 Mock（生产环境替换为 FAISS / Pinecone）
    模拟从 VOC 数据中检索相关洞察
    """
    def __init__(self, voc_data: List[VOCInsight]):
        self._data = voc_data

    def search(self, query: str, top_k: int = 3) -> List[VOCInsight]:
        """
        生产环境实现：
            embeddings = SentenceTransformer("all-MiniLM-L6-v2").encode([query])
            distances, indices = faiss_index.search(embeddings, top_k)
            return [voc_data[i] for i in indices[0]]
        
        Mock：简单关键词匹配模拟检索
        """
        scored = []
        query_lower = query.lower()
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2004.11892 — Template-Based Question Generation from Retrieved Sentences for Improved Unsupervised Question Answering

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：竞品 Top10 评论 1000 条以上、本品基础参数（重量、尺寸、材质、认证、特色功能）、品牌故事素材；可选现有 A+ 内容 HTML 用于季节更新。

**输出**：6-8 个 A+ 模块的完整文案方案（标题、正文、图片建议、关键词、模块优先级）加预估 CTR 提升与 A/B 测试建议。

## 执行步骤

1. 汇总竞品评论并检索用户高频关注点
2. 把洞察填充进预设 A+ 模块模板生成文案
3. 为每个模块给出图片建议与植入关键词
4. 按优先级排序模块并给出 A/B 测试建议
5. 季节更新时只改动需要变更的模块

## 边界与不做

- 何时不用：缺少竞品评论或本品参数时，洞察与模块会空转
- 能力边界：只产出内容方案与图片建议，不生成图片素材，也不代替合规审核

## 技能关联

- **前置**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-LLM-Review-Structured-Extraction.html、Skill-LLM-Review-Structured-Extraction、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-Multilingual-Listing-Generation.html、Skill-Multilingual-Listing-Generation
- **可组合**：Skill-AI-Brand-Storytelling.html、Skill-AI-Brand-Storytelling、Skill-A-Plus-Content-Template-Engine

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：20-AI视频生成　·　源卡：`Skill-A-Plus-Content-Template-Engine`