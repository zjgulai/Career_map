---
name: "p2s-multilingual-listing-generation"
title: "LLM多语言Listing批量生成 — 1小时完成5语言新品入驻"
description: "触发词：多语言 Listing、小语种上新、Few-shot 生成、站点字数约束、本地化。何时不用：客服会话的多语翻译用「多语言客服翻译」；本技能产出各站点的 Listing 文案。安全边界：译文须经母语与合规复核，不得沿用未获认证的资质或功效宣称。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-067"
l3_business: "Listing优化"
l3_all: "Listing优化 / 本地化"
l1_l2_l3: "业务运营/渠道经营/Listing优化"
p2s_card_id: "Skill-Multilingual-Listing-Generation"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "一份商品信息一次性生成五个站点的标题、五点和描述，赶得上节日首发。"
user_try: "试试：把这款吸奶器生成 US、DE、FR、JP、UK 五个站点的 Listing，按各站字数规范来。"
whenToUse: "当新品要同步上架多站点、需要按各站字数与条目规范批量生成文案时用；客服会话的多语处理用「多语言客服翻译」。"
workflow: "整理商品基础属性与各站认证信息 → 收集各语言种子关键词与竞品示例 → 按各站字数与条目约束生成多语言文案 → 检查关键词密度与字符数并本地化复核"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM多语言Listing批量生成 — 1小时完成5语言新品入驻

## ① 解决的问题

跨境运营面临"新品进入德国日本市场人工翻译需2周且成本高"——LLM Few-shot多语言生成将5语言Listing制作从14天压缩至1小时，单SKU节省$1,200

## ② 核心算法逻辑

核心思想：基于大语言模型（LLM）的 Fewshot Prompt 工程 + 结构化约束生成，将商品核心属性自动转化为符合各平台规范的多语言 Listing（标题/五点/描述）。关键创新是品类词库注入（Category Keyword Injection）和关键词密度控制（Keyword Density Control）。

## ③ 业务应用场景

场景A：新品同步上架 5 国站点 - 业务问题：一款吸奶器新品需同时上架 US/DE/FR/JP/UK 5 站，人工翻译+撰写需 3-5 天，错过节日首发窗口 - 数据要求： - 商品基础信息：品名、材质、功能、认证（CE/FDA）、适用年龄 - 各语言种子关键词：3-5 个高搜索量词（可从 Helium10 导出） - 竞品 Best Seller Listing 样本：各站各 2-3 个（作为 Few-shot 示例） - 预期产出：5 语言 × (标题 + 五点 × 5 + 描述) = 55 条文案，1 小时内生成 - 业务价值：节省翻译费用 $800-1,200/SKU（按专业母语翻译
场景B：存量 SKU Listing 关键词刷新 - 业务问题：旺季前需对 50 个核心 SKU 刷新 Listing，嵌入当季热词（如"Christmas gift for baby"） - 数据要求：原有 Listing + 当季热词列表 + 平台关键词搜索量数据 - 预期产出：关键词密度报告 + 优化后 Listing（替换低效词段） - 业务价值：旺季 ACoS 降低约 8%，自然流量词命中率提升 20%
**三轨验证** | 成本轨：传统真人主播月均成本8000-15000元（含薪资、服装、场地），AI虚拟主播月均成本1200-2500元（含云渲染500元、模型订阅800元、人工审核2小时/月），成本降低85%；ROI周期从6个月降至1个月 | 合规轨：符合《电商直播内容规范》，虚拟主播需在直播间明确标注"AI生成"标识，依据《互联网广告管理办法》第八条；母婴品类需额外获得商品资质认证，不涉及医疗宣传风险 | 风险轨：用户信任度下降15-20%（概率60%），可通过真人背书降低；平台审核延迟导致上线周期延长3-5天（概率40%）；AI生成内容偶现语言不当（概率8%，可通过人工审核规避）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
直接节省翻译费：$200-250/语言/SKU × 5 语言 = $1,000-1,250/SKU
时间节省：3 天 → 1 小时，节假日首发提前对应 GMV 增量约 $5,000/活动（保守估计）
按月均 20 个新品计：月节省成本 $20,000-25,000
实施难度：⭐⭐☆☆☆（2/5）— 调用 LLM API 即可，工程复杂度低
优先级：⭐⭐⭐⭐⭐（5/5）— 直接替代高频人工操作，ROI 清晰，1 周可上线

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（300 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/visual_content/multilingual_listing_generation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/20-AI视频生成/Skill-Multilingual-Listing-Generation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
多语言 Listing 批量生成引擎
基于 LLM Few-shot + 品类词库注入 + 关键词密度控制
生产环境接入 OpenAI / DeepSeek / Claude API（当前为 Mock 演示）
"""
import json
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class ProductInfo:
    """商品基础信息结构"""
    product_name: str               # 商品名（中文或英文）
    category: str                   # 品类（如 breast pump）
    material: str                   # 材质（如 BPA-free silicone）
    age_range: str                  # 适用年龄（如 0-24 months）
    key_features: List[str]         # 核心功能，3-5 条
    certifications: List[str]       # 认证（CE, FDA, BPA-free）
    brand: str                      # 品牌名


@dataclass
class ListingResult:
    """单语言 Listing 生成结果"""
    language: str
    title: str
    bullet_points: List[str]        # 五点描述，5 条
    description: str
    keyword_coverage: float         # 关键词覆盖率 0-1
    char_count_title: int           # 标题字符数


# 各站点 Listing 规范约束
PLATFORM_CONSTRAINTS = {
    "US": {"title_max_bytes": 200, "bullet_count": 5, "desc_max_words": 2000},
    "DE": {"title_max_bytes": 80,  "bullet_count": 5, "desc_max_words": 1500},
    "FR": {"title_max_bytes": 80,  "bullet_count": 5, "desc_max_words": 1500},
    "JP": {"title_max_bytes": 120, "bullet_count": 5, "desc_max_words": 1000},
    "UK": {"title_max_bytes": 200, "bullet_count": 5, "desc_max_words": 2000},
}

# 品类种子关键词库（生产环境从 Helium10 / DataDive 同步）
CATEGORY_KEYWORDS = {
    "breast pump": {
        "US": ["breast pump", "electric breast pump", "portable breast pump",
               "wearable breast pump", "hands free breast pump"],
        "DE": ["Milchpumpe", "elektrische Milchpumpe", "tragbare Milchpumpe",
               "kabellose Milchpumpe", "Doppelmilchpumpe"],
        "FR": ["tire-lait", "tire-lait électrique", "tire-lait portable",
               "tire-lait sans fil", "extracteur de lait"],
        "JP": ["搾乳器", "電動搾乳器", "ハンズフリー搾乳器", "携帯搾乳器", "静音搾乳器"],
        "UK": ["breast pump", "electric breast pump", "portable breast pump",
               "hands free breast pump", "silent breast pump"],
    },
    "baby bottle": {
        "US": ["baby bottle", "anti-colic bottle", "wide neck bottle",
               "BPA free bottle", "newborn bottle"],
        "DE": ["Babyflasche", "Anti-Kolik-Flasche", "Weithalsflasche",
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1912.02164，但该号在 arXiv 上是《Plug and Play Language Models: A Simple Approach to Controlled Text Generation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：商品基础信息（品名、材质、功能、认证、适用年龄）、各语言 3-5 个种子关键词、各站 2-3 个竞品畅销 Listing 作为 few-shot 示例。

**输出**：各语言标题加五条要点加描述文案（含字符数统计与关键词覆盖率），覆盖多个站点，供运营审校后上架。

## 执行步骤

1. 整理商品基础属性与各站认证信息
2. 收集各语言种子关键词与竞品示例
3. 按各站字数与条目约束生成多语言文案
4. 检查关键词密度与字符数是否越界
5. 做本地化与合规复核后交付上架

## 边界与不做

- 何时不用：缺少种子关键词或竞品示例时生成质量下降，小语种尤其明显
- 能力边界：只产出草稿与覆盖率数据，不替代母语审校与合规复核，也不得沿用未获认证的宣称

## 技能关联

- **前置**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-NLP-Text-Classification.html、Skill-NLP-Text-Classification、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization
- **可组合**：Skill-A-Plus-Content-Template-Engine.html、Skill-A-Plus-Content-Template-Engine、Skill-Multilingual-Listing-Generation

---

> 分类：业务运营/渠道经营/Listing优化　·　技术族：20-AI视频生成　·　源卡：`Skill-Multilingual-Listing-Generation`