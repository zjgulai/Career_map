---
name: "p2s-rag-structured-data-fusion"
title: "RAG与结构化数据混合检索 — 向量检索与SQL查询融合"
description: "触发词：双路检索、结构化加非结构化、订单查询、口碑问答、问题路由。何时不用：问题只涉及数值统计时用 Text2SQL；只涉及评论文本理解时用普通 RAG。安全边界：生成内容须过人工审核机制以避免虚假宣传，对外答复不得包含个人隐私数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 产品问答"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-RAG-Structured-Data-Fusion"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "按问题类型自动分流：问订单状态走数据库，问口碑走评论检索，两类问题都能答上来。"
user_try: "试试：我的订单为什么还没到、你们产品质量怎么样——这两问分别走数据库和评论库，给我合并答复。"
whenToUse: "属于「业务工具实现」：同一入口既要答精确数值问题又要答语义问题、需要路由时用；若问题纯数值，用 Text2SQL；若纯语义，用普通 RAG 或精排技能。"
workflow: "判断问题类型：查数、查语义，还是两者都要 → 查数走 SQL 路径，语义走向量检索路径 → 必要时对同一问题同时触发两路检索 → 用排名融合把两路结果合并排序 → 综合成一段带数值与理由的回答"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RAG与结构化数据混合检索 — 向量检索与SQL查询融合

## ① 解决的问题

客服运营面临"智能客服单一检索路径、结构化查单与语义问答无法同时满足、首答解决率仅58%"——双路混合检索将首答解决率从58%提升至82%，年化节省人工客服成本15万元

## ② 核心算法逻辑

纯 RAG（向量检索非结构化文本）无法回答"上月销量是多少"这类需要精确数值的问题；纯 SQL 无法回答"吸奶器的用户口碑如何"这类需要语义理解的问题。混合检索将两者结合，路由决策引导不同类型问题到合适检索路径。

## ③ 业务应用场景

场景A：智能客服知识库 + 数据库混合问答 - 业务问题：客服 Bot 被问"我的订单为什么还没到/你们产品质量怎么样"，前者需查 DB，后者需查评论库，单一检索路径答非所问 - 数据要求：向量知识库（产品 FAQ/评论摘要），订单数据库（订单状态/物流） - 预期产出：问题类型自动路由，订单查询准确率 >95%，评论问答相关性 >80% - 业务价值：客服机器人首答解决率从 58% 提升至 82%，年化节省人工客服成本 15 万元
场景B：运营决策支持混合问答系统 - 业务问题：运营提问"上周销量下降了吗？主要原因是什么？"，前半句需 SQL，后半句需检索竞品/评论/广告数据 - 数据要求：销售数据库，竞品监控报告向量库，广告效果文档 - 预期产出：一个问题触发两路检索，综合回答数值+原因，响应时间 <3s - 业务价值：运营决策分析效率提升 4 倍，减少因信息不全导致的错误决策
三轨验证 | 成本轨：月均成本1200元（LLM API调用费用800元/月基于日均500次listing生成×0.002元/次，数据清洗工具300元/月，人工审核4小时/月），ROI周期2个月（基于CTR+22%带来的转化率提升） | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品描述指南》，需获得母婴产品资质认证，合规依据为平台品类准入要求和海关申报数据一致性要求 | 风险轨：主要风险包括生成内容虚假宣传（概率15%，需人工审核机制），多语言翻译偏差导致合规问题（概率8%，需本地化验证），数据隐私泄露风险（概率3%，需数据加密处理）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：客服机器人首答解决率提升 24pp，年化节省人工客服成本 15 万元
实施难度：⭐⭐⭐⭐☆（需要维护向量库 + SQL 数据库两条路，索引同步是挑战）
优先级：⭐⭐⭐⭐☆
评估依据：母婴出海业务既有大量非结构化内容（评论/FAQ/政策）也有大量结构化数据（订单/库存/财务），混合检索是覆盖全部问题类型的唯一方案

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（183 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
RAG 与结构化数据混合检索 — 双路检索 + RRF 融合
"""
import math
import re
from typing import Dict, List, Tuple, Optional
import hashlib


# ===== 向量检索模拟（使用 TF-IDF 近似 embedding）=====
class SimpleVectorStore:
    """简化向量存储（TF-IDF 代替真实 embedding）"""
    def __init__(self):
        self.docs: List[Dict] = []
        self.tfidf_index: Dict[int, Dict[str, float]] = {}

    def add_document(self, doc_id: str, content: str, metadata: Dict = None):
        idx = len(self.docs)
        self.docs.append({"id": doc_id, "content": content, "metadata": metadata or {}})
        tokens = re.findall(r'[\u4e00-\u9fff]|[a-zA-Z]+|\d+', content.lower())
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1 / len(tokens)
        self.tfidf_index[idx] = tf

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        q_tokens = re.findall(r'[\u4e00-\u9fff]|[a-zA-Z]+|\d+', query.lower())
        q_tf = {t: q_tokens.count(t) / len(q_tokens) for t in set(q_tokens)}
        scores = []
        for idx, doc_tf in self.tfidf_index.items():
            score = sum(q_tf.get(t, 0) * v for t, v in doc_tf.items())
            scores.append((idx, score))
        scores.sort(key=lambda x: x[1], reverse=True)
        results = []
        for idx, score in scores[:top_k]:
            if score > 0:
                doc = self.docs[idx].copy()
                doc["vector_score"] = round(score, 4)
                doc["rank"] = len(results) + 1
                results.append(doc)
        return results


# ===== SQL 检索模拟 =====
MOCK_DB = {
    "sales_data": [
        {"asin": "B08X", "date": "2026-06-14", "market": "US", "quantity": 120, "revenue": 3587.0},
        {"asin": "B08X", "date": "2026-06-15", "market": "US", "quantity": 98,  "revenue": 2931.5},
        {"asin": "B08X", "date": "2026-06-16", "market": "US", "quantity": 145, "revenue": 4335.5},
        {"asin": "B09Y", "date": "2026-06-14", "market": "US", "quantity": 67,  "revenue": 1340.0},
    ]
}


def mock_sql_execute(sql_query: str) -> List[Dict]:
    """模拟 SQL 执行（仅处理简单聚合）"""
    # 从 SQL 中提取 ASIN 过滤
    asin_match = re.search(r"asin\s*=\s*['\"]?(\w+)['\"]?", sql_query, re.IGNORECASE)
    data = MOCK_DB["sales_data"]
    if asin_match:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2305.06983，但该号在 arXiv 上是《Active Retrieval Augmented Generation》，与本卡主题无关。
⚠️ 该号被 3 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：向量知识库（卡页示例产品 FAQ、评论摘要）与订单数据库（订单状态、物流），另有竞品监控报告与广告效果文档；卡页第 4 段未给字段级规格，落地前需确认两条路的索引同步方式。

**输出**：综合答复与路由记录：卡页示例把客服机器人首答解决率从 58% 提升至 82%、订单查询准确率高于 95%、评论问答相关性高于 80%，运营决策分析效率提升 4 倍、响应时间小于 3 秒。

## 执行步骤

1. 判断问题类型：查数、查语义，还是两者都要
2. 查数走 SQL 路径，语义走向量检索路径
3. 必要时对同一问题同时触发两路检索
4. 用排名融合把两路结果合并排序
5. 综合成一段带数值与理由的回答并回传

## 边界与不做

- 数据不满足时不用：结构化库与向量库没有同步机制时，两路答案会互相矛盾，应先解决索引同步。
- 能力边界：本卡产出路由与融合答复，不含客服工单与坐席系统的对接集成。
- 生成内容须经人工审核机制，避免虚假宣传与违规表述；对外答复不得包含个人隐私数据，涉隐私查询需加密与脱敏。

## 技能关联

- **前置**：Skill-Agentic-RAG-Active-Retrieval.html、Skill-Agentic-RAG-Active-Retrieval、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-Text2SQL-Schema-Linking.html、Skill-Text2SQL-Schema-Linking
- **延伸**：Skill-Agentic-RAG-Active-Retrieval.html、Skill-Agentic-RAG-Active-Retrieval、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router、Skill-Text2SQL-Schema-Linking.html、Skill-Text2SQL-Schema-Linking
- **可组合**：Skill-Agentic-RAG-Active-Retrieval.html、Skill-Agentic-RAG-Active-Retrieval、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Tool-Selection-Router.html、Skill-LLM-Tool-Selection-Router、Skill-RAG-Structured-Data-Fusion

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-RAG-Structured-Data-Fusion`