---
name: "p2s-llm-focused-web-crawling"
title: "LLM-Focused Web Crawling — LLM/MLLM 引导的主题爬取：KG 驱动发现与动态 JS 页面抽取"
description: "触发词：主题爬取、图谱驱动发现、动态页面抽取、字段缺口补齐、模型引导抓取。何时不用：页面结构固定、字段清单明确时用普通采集管道；需要官方接口增量同步时用平台接口采集技能。安全边界：抓取须遵守目标站点条款与 robots 协议，不得绕过登录与付费墙获取受限内容。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-LLM-Focused-Web-Crawling"
p2s_src_domain: "22-数据采集工程"
quality_tier: "preview"
user_summary: "让模型带着知识图谱去爬：发现哪个实体还缺哪项属性，就按缺口找页面，把动态渲染的内容也读出来。"
user_try: "试试：围绕婴儿监视器的供应商图谱，找出还缺认证和产能的实体，再抓取能补上这些字段的页面。"
whenToUse: "目标内容散在动态渲染页面、且爬取目标由知识缺口动态决定时用本技能；页面结构固定、字段清单明确，用普通采集管道。"
workflow: "建立种子实体与必需属性清单 → 计算每个实体缺失的属性 → 按缺口选择目标页面 → 渲染并抽取动态页面中的实体与关系 → 把结果并入图谱并刷新缺口"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM-Focused Web Crawling — LLM/MLLM 引导的主题爬取：KG 驱动发现与动态 JS 页面抽取

## ① 解决的问题

研究员面临网页信息抓不全——LLM Web Crawling将有效字段覆盖率57%提到85%，年化省14万元

## ② 核心算法逻辑

传统爬虫的两大痛点：

## ③ 业务应用场景

业务背景：进入新品类（婴儿监视器）前，需要了解主要供应商生态——谁在给谁代工、谁有 FDA 认证、产能规模如何。手工调研需 2-3 周。
业务背景：Top-10 竞品 Listing 的价格、评分、变体规格、A+ 内容每日变化，需要日常监控。Amazon Listing 是 JS 动态渲染，静态 requests 无法抓取。
Webscraper MLLM 抓取流程：

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（277 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/data_collection/llm_focused_web_crawling` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-LLM-Focused-Web-Crawling.md`），已与卡面节选核对，不依赖上述路径。

```python
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple
from collections import defaultdict
import re
import time
import random


@dataclass
class Entity:
    name: str
    entity_type: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    source_url: str = ""


@dataclass
class KGRelation:
    subject: str
    predicate: str
    obj: str


@dataclass
class KnowledgeGraph:
    entities: Dict[str, Entity] = field(default_factory=dict)
    relations: List[KGRelation] = field(default_factory=list)

    def add_entity(self, entity: Entity):
        self.entities[entity.name] = entity

    def add_relation(self, rel: KGRelation):
        self.relations.append(rel)

    def get_gaps(self, required_attrs: List[str]) -> List[Tuple[str, List[str]]]:
        gaps = []
        for name, entity in self.entities.items():
            missing = [a for a in required_attrs if a not in entity.attributes]
            if missing:
                gaps.append((name, missing))
        return gaps

    def get_neighbors(self, entity_name: str) -> List[str]:
        neighbors = []
        for r in self.relations:
            if r.subject == entity_name:
                neighbors.append(r.obj)
            elif r.obj == entity_name:
                neighbors.append(r.subject)
        return neighbors


class WebToKGExtractor:
    """
    W→K Stage 1: 从爬取的页面文本中提取实体和关系（LLM 提取的轻量模拟）
    """

    SUPPLIER_PATTERNS = [
        r'(?:supplier|manufacturer|factory|代工|供应商|制造商)[:\s]+([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z]+)*)',
        r'([A-Za-z\u4e00-\u9fff]+(?:\s+[A-Za-z]+)*)\s+(?:manufactures|supplies|produces|生产|供应)',
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2602.24262 — Coverage-Aware Web Crawling for Domain-Specific Supplier Discovery via a Web--Knowledge--Web Pipeline

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：种子实体清单（品牌、品类、竞品 ASIN）与每个实体要求的属性集（如认证、产能、代工关系），以及可访问的目标站点，粒度到单个实体与单个属性。

**输出**：补充后的实体与关系（含来源地址）以及仍存在的字段缺口清单，供产业调研与竞品监控使用。

## 执行步骤

1. 建立种子实体与必需属性清单
2. 计算每个实体还缺哪些属性
3. 按缺口确定要抓取的页面
4. 渲染并抽取动态页面中的实体与关系
5. 把抽取结果并入图谱并刷新缺口清单

## 边界与不做

- 目标站点禁止自动化访问、或内容需要登录授权时不可用；只需抓固定几个字段的场景用普通采集管道更省事。
- 本技能负责按缺口发现与抽取，不保证抽取字段的准确性，抽取结果仍需抽样校验。

## 技能关联

- **延伸**：Skill-Adaptive-Crawl-Scheduling.html、Skill-Adaptive-Crawl-Scheduling、Skill-Competitor-Product-Intelligence.html、Skill-Competitor-Product-Intelligence、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection
- **可组合**：Skill-Document-Intelligence-Parsing.html、Skill-Document-Intelligence-Parsing、Skill-Helicase-Supply-Chain-KG-MAS.html、Skill-Helicase-Supply-Chain-KG-MAS、Skill-MAS-Dynamic-KG-Collaboration.html、Skill-MAS-Dynamic-KG-Collaboration、Skill-LLM-Focused-Web-Crawling

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-LLM-Focused-Web-Crawling`