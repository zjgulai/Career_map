---
name: "p2s-data-collection-agent-pipeline"
title: "Data Collection Agent Pipeline — LLM Agent 自动化多源数据采集 Pipeline"
description: "触发词：采集Agent、多源抓取、动作观察循环、指纹去重、批量数据采集。何时不用：页面结构固定、只需定时拉取接口时用普通采集管道；需要官方接口增量同步时用平台接口采集技能。安全边界：采集须遵守目标平台条款与 robots 协议，不得绕过反爬限制或采集受限数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 接口契约"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Data-Collection-Agent-Pipeline"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让 Agent 按目标自己决定抓什么、失败了换路径，把选品要的竞品数据在几小时内补齐。"
user_try: "试试：让 Agent 采集 Amazon US、UK、DE 三站点婴儿安全座椅 Top 200 SKU 的价格、评分、评论数与主图。"
whenToUse: "目标分散在多个站点或页面结构差异大、需要 Agent 边看边调整动作时用本技能；结构固定、有稳定接口的场景用普通采集管道。"
workflow: "定义采集目标与字段清单 → Agent 选择动作访问各来源并记录观察结果 → 失败时切换策略并重试 → 按内容指纹去重并落库 → 汇总为结构化数据集"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Data Collection Agent Pipeline — LLM Agent 自动化多源数据采集 Pipeline

## ① 解决的问题

研究助理面临数据采集人工慢——采集Agent将抓数工时从8小时压到1小时，年化省14万元

## ② 核心算法逻辑

传统数据采集依赖人工编写爬虫脚本，每个数据源需要单独维护。当数据源频繁变更（电商平台 DOM 更新、API 版本迭代、反爬策略升级）时，维护成本极高。LLM Agent 数据采集 Pipeline 解决的核心问题是：

## ③ 业务应用场景

业务背景：选品团队需要每周采集 Amazon US/UK/DE 三站点婴儿安全座椅品类 Top 200 SKU 的完整竞品数据（价格、评分、评论数、主图、A+页面关键词），以往需要 3 名数据专员耗时 2 天完成。
量化对比： - 人工耗时：3 人 × 2 天 = 48 人时 - Agent 耗时：2 小时 14 分（含重试），运营监督 30 分钟 - 效率提升：约 20 倍，数据新鲜度从"周更"提升至"日更"
业务背景：产品团队需要汇聚 Amazon + Walmart + BabyList + Reddit 四平台的母乳泵用户评论，构建 VOC（Voice of Customer）数据库，每月手工整理耗时约 40 小时。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

5万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（382 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_agent_llm/data_collection_agent_pipeline` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-Data-Collection-Agent-Pipeline.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Agent 自动化数据采集 Pipeline
整合 ReAct 规划执行 + 多源融合 + 实体对齐去重
arXiv 参考: 2403.08299 (WebVoyager: LLM Web Agent),
           2404.11584 (AgentBench),
           2502.09986 (DataHarvester: LLM-Driven Multi-Source Collection)
"""

import time
import json
import hashlib
import numpy as np
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Callable
from enum import Enum


# ── 数据结构 ─────────────────────────────────────────────────────────────

class ActionType(Enum):
    FETCH_URL = "fetch_url"
    PARSE_HTML = "parse_html"
    CALL_API = "call_api"
    EXTRACT_STRUCTURED = "extract_structured"
    DEDUP_AND_MERGE = "dedup_and_merge"
    DONE = "done"


@dataclass
class Action:
    action_type: ActionType
    params: Dict[str, Any]


@dataclass
class Observation:
    success: bool
    data: Any
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CollectedRecord:
    source: str
    entity_id: str       # 原始 ID（如 ASIN）
    fields: Dict[str, Any]
    embedding: Optional[np.ndarray] = None  # 用于实体对齐

    def fingerprint(self) -> str:
        """基于核心字段的内容指纹，用于去重"""
        key_fields = {k: v for k, v in self.fields.items()
                      if k in ["title", "brand", "price", "asin", "sku"]}
        return hashlib.md5(json.dumps(key_fields, sort_keys=True).encode()).hexdigest()


# ── 模拟工具函数（生产中替换为真实实现）────────────────────────────────────

def mock_fetch_url(url: str) -> Observation:
    """模拟 HTTP 请求，生产中替换为 httpx/playwright"""
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2308.03688 — AgentBench: Evaluating LLMs as Agents
⚠️ 该号被 2 张卡共用，最多只有一张能对。

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：采集目标清单（平台、站点、类目、Top N 或实体 id）与字段清单，以及可用访问方式与重试策略，粒度到单个实体页面。

**输出**：结构化采集记录（来源、实体 id、字段值，带内容指纹用于去重）与采集日志（含重试情况），供选品与用户之声分析使用。

## 执行步骤

1. 明确采集目标、来源站点与所需字段
2. 让 Agent 逐条执行访问动作并记录观察结果
3. 对失败项调整策略重试或更换来源
4. 用内容指纹去重并落库
5. 汇总成结构化数据集并输出采集日志

## 边界与不做

- 目标平台禁止自动化采集、或需要登录态与授权才能访问时不可用；只需采集少量单页数据的场景不必引入 Agent。
- 本技能负责采集流程与去重，不保证目标平台不封禁，也不做数据清洗与建模。

## 技能关联

- **前置**：Skill-LLM-Focused-Web-Crawling.html、Skill-LLM-Focused-Web-Crawling、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent
- **可组合**：Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-Data-Collection-Agent-Pipeline

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Data-Collection-Agent-Pipeline`