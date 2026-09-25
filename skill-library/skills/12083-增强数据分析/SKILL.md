---
name: "p2s-rag-enhanced-data-analysis"
title: "RAG-Enhanced Data Analysis（RAG 增强数据分析）"
description: "触发词：RAG 增强分析、历史报告检索、根因分析、案例复用、实时验证。何时不用：只按固定模板出报表、不需要历史结论佐证时不必用；要核查报告真假走幻觉检测。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-146"
l3_business: "知识溯源"
l3_all: "知识溯源 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/知识溯源"
p2s_card_id: "Skill-RAG-Enhanced-Data-Analysis"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "分析异常指标时自动翻出历史相似案例，再用实时数据验证结论。"
user_try: "试试：英国站某奶粉 SKU 转化率骤降，帮我从历史报告里找出相似案例并给根因。"
whenToUse: "指标异常需要根因、且历史报告里可能已有同类结论时用；只跑固定报表或用不上历史结论的场景不必。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RAG-Enhanced Data Analysis（RAG 增强数据分析）

## ① 解决的问题

"为什么德国站吸奶器转化率下降"→ RAG 检索到上月分析"德国站转化率下降是因为欧元贬值导致价格上涨 8%"→本次发现同样模式→自动引用历史结论+实时数据验证

## ② 核心算法逻辑

核心思想：通过检索增强生成（RAG）将历史分析知识库与实时业务数据融合，使 LLM Agent 在数据分析决策中避免幻觉、提升准确性和一致性。

## ③ 业务应用场景

业务问题：英国站某进口婴儿奶粉（SKU: FD-5801，规格 800g）周转化率从 6.8% 骤降至 3.2%，日销从 120 件跌至 35 件，库存积压 8500 件，占用仓储成本 2.8 万元/月。
数据规模： - 知识库：过去 18 个月 450+ 份英国站分析报告 - 实时数据：FD-5801 过去 8 周的日均转化率、售价、竞品价格、Review 评分、物流时效 - 检索维度：品类、市场、时间窗口、价格变动幅度
RAG 分析过程： 1. Query 输入："英国站 FD-5801 转化率下降根因" 2. 系统检索到 3 份相似案例： - 上季度报告：同品类 SKU FD-5702 因脱欧关税增加 12%，售价从 £18.99 上升至 £21.29，转化率从 7.1% 降至 3.8% - 竞品分析报告：Aptamil 同规格奶粉在 Amazon.co.uk 降价 8%，市场份额提升 23% - 物流延迟报告：英国站 Q2 因港口拥堵，平均配送时间从 3 天延至 7 天，转化率平均下降 4.2% 3. LLM 结合实时数据验证：FD-5801 当前售价 £22.49（较 8 周前 £20.99 上涨 7.

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

直接收益：年化增收 264 万元（场景 2 Listing 优化）+ 库存成本节省 50 万元（场景 1 快速清库）= 314 万元
间接收益：分析人力成本节省 90 万元（分析自动化率 60%）
总 ROI：年化收益 404 万元，系统部署成本 18 万元，ROI 周期 5.4 天
✓ 核心算法成熟（向量检索 + LLM 推理），无需自研
✓ 知识库构建相对简单（历史报告标准化）
✗ 需要 1-2 周的数据清洗和元数据标注

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（257 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/data_agent_llm/rag_enhanced_data_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-RAG-Enhanced-Data-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import json
from datetime import datetime, timedelta
from collections import defaultdict

class RAGEnhancedDataAnalysis:
    """RAG 增强数据分析 Agent"""
    
    def __init__(self, embedding_dim=128):
        self.embedding_dim = embedding_dim
        self.knowledge_base = []
        self.embeddings = np.array([])
        self.analysis_cache = {}
    
    def add_historical_analysis(self, analysis_id, text, metadata):
        """添加历史分析报告到知识库"""
        embedding = self._text_to_embedding(text)
        self.knowledge_base.append({
            'id': analysis_id,
            'text': text,
            'metadata': metadata,
            'timestamp': datetime.now()
        })
        if len(self.embeddings) == 0:
            self.embeddings = embedding.reshape(1, -1)
        else:
            self.embeddings = np.vstack([self.embeddings, embedding])
    
    def _text_to_embedding(self, text):
        """简化的文本嵌入（实际应用中使用 BERT/OpenAI Embedding）"""
        np.random.seed(hash(text) % 2**32)
        emb = np.random.randn(self.embedding_dim)
        return emb / np.linalg.norm(emb)
    
    def retrieve_similar_cases(self, query, top_k=3, similarity_threshold=0.5):
        """检索相似的历史案例"""
        query_emb = self._text_to_embedding(query)
        
        if len(self.embeddings) == 0:
            return []
        
        # 计算余弦相似度
        similarities = np.dot(self.embeddings, query_emb)
        
        # 获取 Top-K 相似案例
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        retrieved_cases = []
        for idx in top_indices:
            if similarities[idx] >= similarity_threshold:
                retrieved_cases.append({
                    'case_id': self.knowledge_base[idx]['id'],
                    'text': self.knowledge_base[idx]['text'],
                    'metadata': self.knowledge_base[idx]['metadata'],
                    'similarity_score': float(similarities[idx])
                })
        
        return retrieved_cases
    
    def analyze_with_rag(self, query, current_data, top_k=3):
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史分析报告知识库（按品类、市场、时间窗口、价格变动等维度建元数据）与当前异常指标的实时数据

**输出**：根因分析结论（含引用的历史案例与实时数据验证）与相似案例清单，供运营直接做处置决策

## 执行步骤

1. 把异常指标转成检索 Query（品类、市场、时间窗口、变动幅度）。
2. 从历史报告库里检索相似案例及其结论。
3. 用当前实时数据（价格、竞品、评分、物流等）验证历史结论是否仍然成立。
4. 输出根因判断与处置建议，并标注每条结论的证据来源。

## 边界与不做

- 何时不用：只需要按固定模板出报表、不需要历史结论佐证时，本技能没有增量价值。
- 能力边界：结论依赖历史报告的质量与元数据完整度，报告未标准化时检索会失准。
- 能力边界：引用的是历史结论，须逐次用实时数据复核，不能直接复用旧结论。

## 技能关联

- **前置**：Skill-Semantic-Similarity-Retrieval、Skill-Vector-Embedding-Text-Encoding
- **延伸**：Skill-Causal-Inference-Root-Cause-Analysis、Skill-LLM-Agent-Autonomous-Decision-Making
- **可组合**：Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-NL2Dashboard-Automated-Reporting、Skill-RAG-Enhanced-Data-Analysis

---

> 分类：数据与Agent平台/数据与AI运行/知识溯源　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-RAG-Enhanced-Data-Analysis`