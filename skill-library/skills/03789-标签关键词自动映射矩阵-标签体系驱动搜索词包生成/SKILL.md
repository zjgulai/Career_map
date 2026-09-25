---
name: "p2s-search-tag-keyword-auto-mapping"
title: "标签→关键词自动映射矩阵 — SKU 标签体系驱动搜索词包生成"
description: "触发词：标签到关键词、本体映射、词包生成、批量词刷新、ACOS 降低。何时不用：要从评论语料挖买家真实用词时用「评论关键词挖掘 SEO」；要用 LLM 从种子词自由扩长尾时用「LLM 搜索词语义扩展」。安全边界：只生成词包，不代改 Listing；批量刷新仍需合规审核避免堆砌。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-066"
l3_business: "搜索意图分析"
l3_all: "搜索意图分析 / Listing优化"
l1_l2_l3: "业务运营/渠道经营/搜索意图分析"
p2s_card_id: "Skill-Search-Tag-Keyword-Auto-Mapping"
p2s_src_domain: "25-搜索流量工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "SKU 标签一更新，词包自动跟着变，不用每次上新都从头做一遍关键词研究。"
user_try: "试试：按我的 SKU 标签体系（品类/场景/人群）为这批拉拉裤生成 150-300 个优先级关键词包。"
whenToUse: "当卖家已有结构化 SKU 标签体系、需要批量把标签映射成搜索词包时用本技能；要从评论挖买家真实用词，用「评论关键词挖掘 SEO」；要用 LLM 从种子词自由扩长尾，用「LLM 搜索词语义扩展」。"
workflow: "整理 SKU 标签体系与竞品 Listing 语料 → 用本体词典把标签映射为候选搜索词 → TF-IDF 扩展并做相关性过滤 → 输出优先级词包并批量刷新 Listing"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 标签→关键词自动映射矩阵 — SKU 标签体系驱动搜索词包生成

## ① 解决的问题

SEO专员面临"SKU标签体系和关键词研究完全脱节每次更新标签都要手动重做关键词"——标签→关键词本体映射自动输出优先级关键词包，每SKU关键词研究时间从3天压缩至20分钟，年化效率提升$3.6万

## ② 核心算法逻辑

母婴跨境卖家通常已有结构化的 SKU 标签体系（品类标签 diaper_pullup、场景标签 overnight_use、人群标签 newborn_03m），但这些内部标签与买家搜索语言存在严重脱节——运营团队往往凭经验手工填词，覆盖率低且遗漏长尾。

## ③ 业务应用场景

场景A：拉拉裤新品 Listing 关键词包生成 - 业务问题：新品上架时运营手工填词仅覆盖 20-30 个核心词，忽略「overnight diaper pants」「leak proof pull ups」等高转化长尾词 - 数据要求：SKU 标签体系 JSON（品类/场景/人群 3 层），已有竞品 Listing 语料 50-100 条 - 预期产出：自动生成 150-300 个优先级关键词包，覆盖率提升 3-5 倍 - 业务价值：新品自然流量 30 天内提升 40-60%，前期广告 ACOS 降低 15%（更精准词） - 三轨验证： - 成本：显性成本约 200-500 元/次（爬虫代
**场景B：多 SKU 标签维护 → 批量关键词刷新** - 业务问题：促销季前需要批量更新 200+ SKU 的 Listing 关键词，人工成本 3-5 人天 - 数据要求：产品标签库（CSV），竞品搜索词语料（爬取 AC 接口） - 预期产出：2 小时内完成批量刷新，关键词包平均质量评分提升 25% - 业务价值：节省人工成本约 2 万元/季度，搜索可见度提升带来 GMV 增量 15-20 万元/季度 - **三轨验证**： - **成本**：批量处理 200 SKU 的计算成本约 50-100 元（云函数/本地服务器），数据采集成本约 300-800 元（AC 接口爬取 + 语料清洗）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
人工节省：200 SKU 批量词包生成从 5 人天→2 小时，节省约 3 万元/季度
流量增量：新品自然流量 +40-60%，假设单 SKU 月均自然流量价值 5,000 元，100 SKU 增量约 25-50 万元/年
广告降本：精准词包使 ACOS 降低 15%，年化广告预算节省约 8-15 万元
综合年化 ROI ≈ 35-65 万元
实施难度：⭐⭐☆☆☆（低，仅需 SKU 标签 CSV + Listing 语料，无需外部 API）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_collection/search_tag_keyword_auto_mapping` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/25-搜索流量工程/Skill-Search-Tag-Keyword-Auto-Mapping.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
标签→关键词自动映射矩阵
Tag-to-Search-Keyword Auto Mapping with TF-IDF Expansion + AC Proxy Filter
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import re

# ─── 示例数据：SKU 标签体系 ───
SKU_TAGS = {
    "SKU-DIAPER-001": {
        "category": ["diaper", "pull_up_pants", "training_pants"],
        "scene": ["overnight_use", "outdoor_activity", "travel"],
        "audience": ["toddler_1_3y", "heavy_wetter", "active_baby"]
    },
    "SKU-BOTTLE-002": {
        "category": ["baby_bottle", "feeding_bottle", "anti_colic_bottle"],
        "scene": ["breastfeeding_transition", "night_feeding", "daycare"],
        "audience": ["newborn_0_3m", "infant_3_6m", "premature_baby"]
    }
}

# 标签→候选词本体词典（生产中从 Amazon 品类树 + WordNet 自动构建）
ONTOLOGY_MAP = {
    "diaper":            ["diapers", "baby diaper", "disposable diaper", "infant diaper"],
    "pull_up_pants":     ["pull ups", "pull-up diapers", "training pants", "potty training pants"],
    "overnight_use":     ["overnight diapers", "nighttime diapers", "12 hour diaper", "sleep dry diapers"],
    "outdoor_activity":  ["active diapers", "stretchy diapers", "flexible fit diapers"],
    "travel":            ["travel diapers", "portable diapers", "compact diapers"],
    "toddler_1_3y":      ["toddler diapers", "size 4 diapers", "walker diapers"],
    "heavy_wetter":      ["leak proof diapers", "heavy wetters diapers", "extra absorbent diapers"],
    "active_baby":       ["stretchy waistband diapers", "active fit diapers", "flexible diapers"],
    "baby_bottle":       ["baby bottle", "infant bottle", "feeding bottle"],
    "anti_colic_bottle": ["anti-colic bottle", "colic relief bottle", "vented bottle", "no gas bottle"],
    "newborn_0_3m":      ["newborn bottle", "size 1 bottle", "preemie bottle"],
    "night_feeding":     ["slow flow nipple bottle", "night feeding bottle", "wide neck bottle"],
    "breastfeeding_transition": ["breastfeeding bottle", "breast-like bottle", "natural feel bottle"],
    "training_pants":    ["potty training pants", "toddler training underwear", "pull up trainers"],
    "infant_3_6m":       ["3-6 month bottle", "size 2 nipple bottle", "medium flow bottle"],
}

# 竞品 Listing 语料（生产中从爬虫获取，此处模拟）
LISTING_CORPUS = [
    "Overnight diapers for heavy wetters extra absorbent leak proof pull ups toddler",
    "Anti-colic baby bottle slow flow nipple breastfeeding transition newborn",
    "Pull-up training pants potty training toddler boys girls active flexible",
    "Baby feeding bottle wide neck natural feel anti gas vented night feeding",
    "Stretchy waistband diapers active fit 12 hour overnight sleep dry",
    "Size 4 diapers toddler heavy wetter leak guard stretchy sides",
    "Slow flow bottle newborn breastfed baby transition 0-3 month",
    "Portable travel diapers compact outdoor activity lightweight",
    "Colic relief bottle vented system reduce gas fussiness infant 3-6m",
    "Potty training pants padded toddler underwear leak protection",
]


def build_tfidf_expander(corpus: list, top_k: int = 5) -> dict:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.09812，但该号在 arXiv 上是《BANG-MaNGA: A census of kinematic discs and bulges across mass and star formation in the local Universe》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：SKU 标签体系（卡页为品类/场景/人群三层 JSON 或 CSV）、竞品 Listing 语料（卡页 50-100 条）或 AC 搜索建议语料、现有 Listing 文本；粒度为 SKU。

**输出**：每 SKU 150-300 个带优先级的关键词包（由标签本体映射加扩展过滤得到）与批量刷新结果；供 Listing/SEO 运营直接写入标题、要点与后端词。

## 执行步骤

1. 整理 SKU 标签体系（品类/场景/人群三层）与竞品 Listing 语料
2. 用本体词典把标签映射为候选搜索词
3. 用 TF-IDF 从语料扩展并对候选词做相关性过滤
4. 按优先级输出每 SKU 150-300 个关键词包
5. 批量刷新 Listing 词并跟踪自然流量与 ACOS 变化

## 边界与不做

- 数据不满足：SKU 标签体系不完整（缺品类/场景/人群任一层）或没有竞品语料时映射覆盖会明显不足。
- 何时不用：要从评论语料挖买家真实用词，用「评论关键词挖掘 SEO」；要用 LLM 从种子词自由扩展长尾，用「LLM 搜索词语义扩展」。
- 能力边界：只生成词包，不代改 Listing、不保证排名；批量刷新仍需合规审核以避免关键词堆砌；卡页的每 SKU 词研究 3 天→20 分钟、综合年化 35-65 万元为案例口径。

## 技能关联

- **前置**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle
- **延伸**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Keyword-Demand-Gap-Analysis.html、Skill-Keyword-Demand-Gap-Analysis、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Search-Tag-Keyword-Auto-Mapping

---

> 分类：业务运营/渠道经营/搜索意图分析　·　技术族：25-搜索流量工程　·　源卡：`Skill-Search-Tag-Keyword-Auto-Mapping`