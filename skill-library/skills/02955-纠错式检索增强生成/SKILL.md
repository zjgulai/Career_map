---
name: "p2s-corrective-rag-crag"
title: "Corrective-RAG — 纠错式检索增强生成"
description: "触发词：纠错检索、过期文档、知识库时效、Web 补充检索、文档分类器、合规查询。何时不用：要按问题逐步决定检索时机时用「DeepRAG 逐步检索」，要抽取长文档跨句关系时用「文档级关系抽取」。安全边界：自动纠错结果仍需标注来源与文档版本，不得把过期文档当作现行合规依据。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 知识溯源"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Corrective-RAG-CRAG"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "知识库里的 FDA/CE 文档动不动滞后几个月，查之前先自动判一遍该不该信，过期就上网补最新口径。"
user_try: "试试：我知识库里的 FDA 婴儿配方粉重金属限值可能是旧的，帮我判断这批文档哪些过期并补上最新要求。"
whenToUse: "本地知识库文档可能滞后、合规问答需要先判文档可用性再回答时用；要按问题逐步决定检索时机时用「DeepRAG 逐步检索」；要抽长文档跨句关系时用「文档级关系抽取」。"
workflow: "以周频爬取 FDA/CE 官方文档并打时间戳与修订版本标签 → 对检索到的文档用轻量分类器判定正确、错误或模糊 → 对判定为错误或模糊的文档触发 Web 搜索补充证据 → 用补充后的证据生成合规回答并标注来源 → 持续收集用户反馈标注回流训练分类器"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Corrective-RAG — 纠错式检索增强生成

## ① 解决的问题

运营面临知识库过期文档导致合规建议错误——Corrective-RAG自动纠错将过期文档误用率从22%→3%，年化避免合规风险40万元

## ② 核心算法逻辑

核心思想：检索文档三分类评估（Correct/Ambiguous/Incorrect），根据分类结果动态选择知识精炼、补充搜索或混合策略，消除噪声文档对生成质量的干扰。

## ③ 业务应用场景

- 业务问题：母婴跨境卖家查询FDA/CE认证要求时，本地知识库文档平均滞后4-6个月。2024年FDA新增婴儿配方粉重金属限值标准，导致库存合规性判断错误，某品牌因此被平台警告3次，影响销售权限。月均因过期文档导致的合规咨询错误≥12起。
- 数据要求：(1)FDA/CE官方文档爬虫更新（周频）；(2)历史合规查询日志（≥5000条/月）；(3)文档时间戳+修订版本标签；(4)用户反馈标注（正确/错误/模糊）≥500条用于训练分类器。
- 预期产出：(1)合规查询准确度从62%→94%；(2)自动纠错率≥78%（Incorrect文档自动触发Web搜索）；(3)平均响应时间3.2秒（含Web搜索）；(4)月均减少合规咨询错误至≤2起。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：合规运营负责人面临「过期文档导致合规错误」和「定价团队面临模糊竞品数据」——Corrective RAG将合规查询准确度从62%改善至94%、定价准确度从71%改善至89%，年化合计90万元（合规场景38万+定价场景52万）
实施难度：⭐⭐⭐☆☆（需要：轻量级分类器训练、Web API集成、文档特征工程；无需复杂基础设施）
优先级：⭐⭐⭐⭐☆（高频痛点、快速见效、ROI周期短<4个月）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（263 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import requests
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import json

# ============ 模拟数据生成 ============
np.random.seed(42)

# 母婴跨境场景：婴儿推车、暖奶器、有机辅食的合规与价格数据
class CorrectiveRAGSimulator:
    def __init__(self):
        self.knowledge_base = self._init_kb()
        self.classifier = None
        self.scaler = StandardScaler()
        
    def _init_kb(self):
        """初始化知识库（模拟过期/准确/模糊文档混合）"""
        kb = {
            'doc_001': {
                'title': 'FDA婴儿推车安全标准',
                'content': 'ASTM F833-2019标准要求...',
                'timestamp': datetime.now() - timedelta(days=180),  # 过期6个月
                'source': 'local_kb',
                'category': 'compliance'
            },
            'doc_002': {
                'title': '暖奶器CE认证要求',
                'content': 'EN 60950-1:2020标准，功率≤500W...',
                'timestamp': datetime.now() - timedelta(days=15),  # 近期
                'source': 'local_kb',
                'category': 'compliance'
            },
            'doc_003': {
                'title': '有机辅食FDA标签要求',
                'content': '需标注营养成分，重金属限值...',
                'timestamp': datetime.now() - timedelta(days=90),
                'source': 'local_kb',
                'category': 'compliance'
            },
            'price_001': {
                'product': '婴儿推车A型',
                'price_range': '¥299-399',  # 模糊数据
                'timestamp': datetime.now() - timedelta(hours=25),
                'source': 'crawler_db',
                'category': 'pricing'
            },
            'price_002': {
                'product': '暖奶器B型',
                'price': '¥189.99',
                'timestamp': datetime.now() - timedelta(hours=2),
                'source': 'crawler_db',
                'category': 'pricing'
            }
        }
        return kb
    
    def _extract_features(self, doc, query):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.15884，但该号在 arXiv 上是《Corrective Retrieval Augmented Generation》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：FDA/CE 官方文档爬虫更新（周频）、历史合规查询日志（≥5000 条/月）、文档时间戳与修订版本标签、用户反馈标注（正确/错误/模糊，≥500 条）用于训练分类器；粒度：单篇文档 × 单次查询。

**输出**：带时效判定的合规查询结果：文档可用性标签（正确/错误/模糊）、自动纠错触发记录与 Web 补充证据、带来源与版本的答案；目标为查询准确度由 62% 提升至 94%、自动纠错率 ≥78%、平均响应 3.2 秒，供合规运营使用。

## 执行步骤

1. 周频抓取官方文档并标注时间戳与版本
2. 用分类器判定检索文档是否过期或模糊
3. 对不可信文档触发 Web 搜索补充
4. 基于补充证据生成带来源的合规回答
5. 回流用户反馈标注持续训练分类器

## 边界与不做

- 数据不满足时不用：没有文档时间戳与版本标签、或用户反馈标注不足 500 条时，分类器判不准时效。
- 能力边界：只做文档时效判定与检索纠错，不代替官方口径解释法规，纠错后的答案仍需人工确认责任口径。
- 时效边界：Web 补充检索引入外部来源，需核对来源权威性并保留出处，避免以二手解读替代官方法规原文。

## 技能关联

- **前置**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **延伸**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Self-RAG-Reflective-Retrieval.html、Skill-Self-RAG-Reflective-Retrieval
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-KG-Incremental-Update.html、Skill-KG-Incremental-Update、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-Corrective-RAG-CRAG

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：08-知识图谱　·　源卡：`Skill-Corrective-RAG-CRAG`