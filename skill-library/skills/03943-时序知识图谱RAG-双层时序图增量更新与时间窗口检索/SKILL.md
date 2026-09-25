---
name: "p2s-tg-rag-temporal-knowledge-graph"
title: "时序知识图谱RAG — 双层时序图增量更新与时间窗口检索"
description: "触发词：时序知识图谱、时间窗口检索、增量更新、关税政策、知识新鲜度。何时不用：知识本身无时效性时不必建时序图；只做嵌入级衰减走自感知嵌入。安全边界：图谱数据滞后会导致税率与成本测算错误，须建立周期性数据验证与定期重训机制。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 溯源监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-TG-RAG-Temporal-Knowledge-Graph"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给知识加上时间窗口，查当前政策用最新值、查历史沿革用全景，不用重建整个库。"
user_try: "试试：把关税政策存成带时间窗口的事实，问当前税率时自动用最新那条。"
whenToUse: "知识有强时效（政策、费率、市场数据）且需同时回答当前值与历史值时用；无时效性的知识不必建时序图。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 时序知识图谱RAG — 双层时序图增量更新与时间窗口检索

## ① 解决的问题

静态知识库的过期答案率高达35%，语义相关不等于时间有效——TG-RAG双层时序图在不重建知识库的前提下实现增量时序更新，过期答案率从35%降至13.3%（2025 arXiv:2510.13590）

## ② 核心算法逻辑

反直觉洞察：大多数RAG系统将知识库视为静态快照——一次性摄入，永久使用。但跨境电商的知识具有强时效性：关税税率会变（2025年关税调整），平台政策会变（Amazon更新FBA规则），市场数据会过期（2021年的市场份额数据在2025年无效）。反直觉的是：向静态知识库中加入"同样的事实在不同时间是不同事实"的概念，检索准确率可以翻倍（62%→31%的staleanswer率从35%降至13%）。

## ③ 业务应用场景

- 业务问题：2025年关税政策频繁变化（Section 301 301多次调整），AI助手使用的是静态知识库，频繁给出过时的税率信息，导致成本测算错误 - TG-RAG方案： 1. 知识库存储格式：`(母婴电器HS8543.70, 关税率, 25%, 2023-09-01 to 2025-05-01)` 2. 新政策发布时增量更新：`(母婴电器HS8543.70, 关税率, 30%, 2025-05-01 to present)` 3. 查询"当前税率"→自动使用最新时间窗口检索；查询"历史税率"→使用全局检索 4. 不重建知识库，增量更新在1分钟内完成 - 预期产出：税率信息过期错误率从3
- 业务问题：选品AI基于2021-2022年的市场数据给出"婴儿监控品类增速35%"的建议（实际2025年已放缓至8%），导致错误备货 - TG-RAG方案：为市场规模/增速/竞品格局添加时间戳，查询时自动使用最近12个月数据；全局摘要提供趋势分析；"过时证据"自动降权 - 预期产出：市场分析使用的数据新鲜度从平均2年→平均3个月，选品成功率提升25%
三轨验证 | 成本轨：月均成本3,200元（知识图谱构建2,000元+RAG系统维护800元+人工标注12小时/月×100元/小时），首期投入15,000元（模型训练+数据清洗） | 合规轨：符合《跨境电商商品质量管理规范》和《供应商信息安全管理办法》，需建立数据隐私保护机制，通过ISO27001认证可加分 | 风险轨：知识图谱数据滞后导致断货预测准确率下降（概率35%）、供应商数据不完整影响节点关联（概率28%）、模型漂移需定期重训（概率22%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：跨境电商的知识（关税/平台政策/市场数据）每月变化10-20次，静态RAG的stale-answer率35%导致AI助手每月产生约30次错误决策；TG-RAG将stale-answer降至13.3%，减少约65%的错误决策；以每次错误决策损失$500计，月节省$8750，年化$105000；系统成本$8万，ROI≈131%
实施难度：⭐⭐⭐⭐☆（时序数据模型设计需要额外工作；增量更新逻辑有一定复杂度；开源实现可参考）
优先级：⭐⭐⭐⭐⭐（跨境电商的知识具有极强时效性，时序知识管理是所有知识密集型Agent的必备基础设施）
适用规模：所有需要处理时效性信息的知识库（特别是政策/法规/市场/价格类知识）
数据依赖：历史事实数据含时间戳（大多数结构化数据源天然有时间戳）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（341 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：7」并记录位置 `paper2skills-code/knowledge_graph/tg_rag_temporal_knowledge_graph` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/08-知识图谱/Skill-TG-RAG-Temporal-Knowledge-Graph.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
时序知识图谱RAG系统 (TG-RAG)
功能：双层时序图构建 + 增量更新 + 时间窗口检索 + 冲突解决
基于 arXiv:2510.13590 (2025) + LedgerRAG (2026)
"""
import json
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timedelta
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')


@dataclass
class TemporalFact:
    """时序事实三元组"""
    fact_id: str
    subject: str
    relation: str
    value: Any
    valid_from: datetime
    valid_to: Optional[datetime] = None     # None = 持续有效
    source: str = ""
    confidence: float = 1.0

    @property
    def is_current(self) -> bool:
        """判断事实是否当前有效"""
        now = datetime.now()
        if self.valid_to and self.valid_to < now:
            return False
        return self.valid_from <= now

    @property
    def age_days(self) -> float:
        """事实年龄（天）"""
        return (datetime.now() - self.valid_from).days

    def overlaps_window(self, start: datetime, end: datetime) -> bool:
        """检查是否与时间窗口重叠"""
        fact_end = self.valid_to or datetime.max
        return self.valid_from <= end and fact_end >= start


@dataclass
class TimeNode:
    """时间图节点"""
    time_key: str               # 如 '2025-Q4', '2025-11', '2025-W47'
    granularity: str            # 'year', 'quarter', 'month', 'week', 'day'
    start: datetime
    end: datetime
    summary: str = ""           # 该时间段的知识摘要
    fact_ids: List[str] = field(default_factory=list)
    children_keys: List[str] = field(default_factory=list)
    parent_key: Optional[str] = None


class TemporalKnowledgeGraph:
    """
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2510.13590 — RAG Meets Temporal Graphs: Time-Sensitive Modeling and Retrieval for Evolving Knowledge

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：带时间戳的事实三元组（实体、属性、取值、生效区间）与增量更新的事件流

**输出**：双层时序图谱与按时间窗口的检索结果（当前值与历史值分开返回）、增量更新记录，供成本测算与市场分析使用

## 执行步骤

1. 按实体、属性、取值、生效区间的格式存储事实。
2. 新政策发布时以增量方式追加新区间，不重建整库。
3. 检索时区分当前查询与历史查询，分别走最新窗口与全局检索。
4. 对过时证据自动降权，并记录数据新鲜度。

## 边界与不做

- 何时不用：知识本身无时效性时，时序建模只增加复杂度而无收益。
- 能力边界：只管理事实的时间有效性，不判断事实本身是否准确。
- 安全边界：图谱数据滞后会导致税率与成本测算错误，须建立周期性数据验证与重训机制。

## 技能关联

- **前置**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Graph-RAG-Knowledge-Retrieval.html、Skill-Graph-RAG-Knowledge-Retrieval、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SmartVector-Self-Aware-Embeddings.html、Skill-SmartVector-Self-Aware-Embeddings
- **延伸**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-Context-Kubernetes-KB-Orchestration.html、Skill-Context-Kubernetes-KB-Orchestration、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-NuggetIndex-Atomic-Knowledge-Management.html、Skill-NuggetIndex-Atomic-Knowledge-Management、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SmartVector-Self-Aware-Embeddings.html、Skill-SmartVector-Self-Aware-Embeddings
- **可组合**：Skill-CausalRAG-Causal-Graph-Retrieval.html、Skill-CausalRAG-Causal-Graph-Retrieval、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SmartVector-Self-Aware-Embeddings.html、Skill-SmartVector-Self-Aware-Embeddings、Skill-TG-RAG-Temporal-Knowledge-Graph

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：08-知识图谱　·　源卡：`Skill-TG-RAG-Temporal-Knowledge-Graph`