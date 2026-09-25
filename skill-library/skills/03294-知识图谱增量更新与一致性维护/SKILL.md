---
name: "p2s-knowledge-graph-auto-update"
title: "Knowledge Graph Auto-Update — 知识图谱增量更新与一致性维护"
description: "触发词：图谱自动更新、新鲜度保障、来源可信度、冲突消解、关系自动维护。何时不用：只处理时序事实的时间衰减时用知识图谱增量更新技能；只做增量刷新的流水线调度与回滚时用图谱增量更新流水线技能。安全边界：爬取类数据源须遵守平台条款，实体消解错误会污染图谱，须保留人工复核队列兜底。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 主数据治理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Knowledge-Graph-Auto-Update"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让图谱跟着上游数据自己长，按来源可信度决定冲突时谁说了算，不再人工维护表格。"
user_try: "试试：把竞品价格和供应商目录的变更接进图谱自动更新，冲突时按来源可信度裁决，并给出人工复核队列。"
whenToUse: "图谱数据来自多个可信度不同的来源、需要自动写入并处理冲突时用本技能；只做单个图谱内时序事实的更新与衰减，用知识图谱增量更新技能。"
workflow: "接入各上游数据源的变更 → 按节点标识增量写入实体属性 → 按来源可信度消解属性冲突 → 写入去重后的关系边 → 把存疑的实体消解结果推入人工复核队列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Knowledge Graph Auto-Update — 知识图谱增量更新与一致性维护

## ① 解决的问题

数据工程师面临"知识图谱因手动维护滞后导致推荐链路使用过期关系"——增量更新自动化将图谱新鲜度从T+3提升至T+0.5，年化减少推荐质量损耗增收20-40万元

## ② 核心算法逻辑

知识图谱增量更新（Incremental KG Update）解决的是知识图谱在持续数据注入下的一致性维护问题。全量重建图谱成本高（母婴出海场景数百万三元组，全量重建需数小时），增量更新可在秒到分钟级内将新实体/关系合并入图。

## ③ 业务应用场景

场景1：竞品关系图谱实时更新 - 业务问题：竞品监控爬虫每小时抓取 Amazon 竞品信息（价格/评分/排名），但图谱全量更新需 4-6 小时，导致竞品定价决策使用旧数据，促销时机错失。 - 数据要求：竞品爬虫 JSON 输出（ASIN/价格/评分/BSR），每小时约 5000 条更新 - 预期产出：增量更新延迟 < 2 分钟，竞品价格图谱实时度提升，定价决策响应速度提升 - 业务价值：及时跟进竞品降价，避免价格劣势导致 Buy Box 丢失，Buy Box 保有率提升 5-8%，对应月 GMV 增量约 3-8 万元
场景2：供应商-品牌-SKU 三层关系增量维护 - 业务问题：采购团队每周更新供应商目录（新增/更换/价格变动），手动维护 Excel，与图谱脱节，导致供应链风险传播分析（某供应商断供影响哪些 SKU）无法实时查询。 - 数据要求：采购 ERP 变更日志（MySQL binlog via CDC）→ Kafka → 图谱更新服务 - 预期产出：供应商变更 15 分钟内反映到图谱，断供影响 SKU 查询从 2 天 → 实时 - 业务价值：断供预警响应时间缩短，避免断货损失 5-15 万元/次断供事件
**三轨验证**： - 成本：Neo4j Community Edition 免费，增量更新服务约 2 核 4GB 即可；全量图谱 < 100 万节点时单机可承载 - 合规：图谱中的竞品价格数据属于公开信息，但爬取需遵守平台 TOS（Amazon 禁止 systematic scraping） - 风险：实体消解错误会导致图谱污染（两个不同实体被误合并），需要人工审核队列兜底

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：竞品价格图谱实时化使 Buy Box 保有率提升 5-8%，月 GMV 增量 3-8 万元；断供影响查询从 2 天 → 实时，每次断供事件减少损失 5-15 万元
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐☆☆
评估依据：知识图谱适合已有大量结构化/非结构化数据但缺乏关系挖掘的团队。单纯的竞品关系图谱可以轻量落地，复杂的供应链多跳推理需要更成熟的图基础设施。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（224 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
知识图谱增量更新与一致性维护演示
（无需 Neo4j 环境，使用内存图结构模拟）
"""
from datetime import datetime
from typing import Any
import hashlib

# ── 轻量内存图谱 ──────────────────────────────────────────────────────────────
class KnowledgeGraph:
    def __init__(self):
        self.nodes: dict[str, dict] = {}       # node_id → attributes
        self.edges: list[dict] = []             # {src, rel, dst, confidence, timestamp}
        self.source_trust: dict[str, float] = {
            "amazon_sp_api": 0.95,
            "crawler_keepa": 0.85,
            "manual_input": 1.0,
            "user_reviews": 0.60,
        }

    def upsert_node(self, node_id: str, node_type: str,
                    attributes: dict[str, Any], source: str) -> dict:
        """增量写入节点（含冲突解消）"""
        trust = self.source_trust.get(source, 0.5)
        if node_id not in self.nodes:
            self.nodes[node_id] = {
                "id": node_id, "type": node_type,
                "source": source, "trust": trust,
                "updated_at": datetime.utcnow().isoformat(),
                **attributes
            }
            return {"action": "INSERT", "node_id": node_id}
        else:
            existing_trust = self.nodes[node_id].get("trust", 0.5)
            if trust >= existing_trust:
                # 高可信度来源覆盖
                self.nodes[node_id].update({
                    "source": source, "trust": trust,
                    "updated_at": datetime.utcnow().isoformat(),
                    **attributes
                })
                return {"action": "UPDATE", "node_id": node_id}
            else:
                return {"action": "SKIP_LOW_TRUST", "node_id": node_id}

    def add_edge(self, src: str, rel: str, dst: str,
                 confidence: float = 1.0) -> bool:
        """添加关系边（去重）"""
        # 检查是否已存在
        for e in self.edges:
            if e["src"] == src and e["rel"] == rel and e["dst"] == dst:
                if confidence > e["confidence"]:
                    e["confidence"] = confidence
                    e["updated_at"] = datetime.utcnow().isoformat()
                return False  # 已存在，更新置信度
        self.edges.append({
            "src": src, "rel": rel, "dst": dst,
            "confidence": confidence,
            "updated_at": datetime.utcnow().isoformat(),
        })
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：上游数据源（如竞品爬虫输出的 ASIN、价格、评分、BSR，约 5000 条/小时；采购系统变更日志经 CDC 进入消息队列）与来源可信度配置，粒度到单个节点与单条关系。

**输出**：增量更新后的图谱（节点属性与去重关系边，含来源与时间戳）、冲突消解记录与待人工审核清单，供定价、推荐与供应链风险分析查询。

## 执行步骤

1. 接入各上游数据源的变更流
2. 按节点标识增量写入属性并做冲突消解
3. 按来源可信度决定冲突时以谁为准
4. 写入关系边并去除重复边
5. 把实体消解存疑的结果推入人工复核队列

## 边界与不做

- 上游没有稳定的节点标识或变更日志时无法自动更新；只有单一来源、不存在冲突的图谱不必引入。
- 本技能负责自动写入与冲突消解规则，不做实体消解的最终裁决，也不保证爬取类数据源的合规性。

## 技能关联

- **可组合**：Skill-Knowledge-Graph-Auto-Update

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：22-数据采集工程　·　源卡：`Skill-Knowledge-Graph-Auto-Update`