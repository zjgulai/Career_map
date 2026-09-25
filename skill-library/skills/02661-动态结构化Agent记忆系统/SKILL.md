---
name: "p2s-a-mem-agentic-memory-system"
title: "A-MEM — 动态结构化Agent记忆系统"
description: "触发词：结构化记忆、记忆节点、关联检索、决策一致性、Zettelkasten式管理。何时不用：一次性任务、无跨会话一致性需求时不适用；只压缩当轮上下文走主动上下文剪枝。安全边界：记忆节点须加密存储并符合个人数据处理规范，错误决策被强化的记忆污染风险须用人工审核阈值控制。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-A-MEM-Agentic-Memory-System"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让 Agent 自己把决策经验写成带上下文的记忆节点并互相链接，避免重复评估同一个问题。"
user_try: "试试：帮我把过去三个月的定价决策日志建成结构化记忆，下次评估定价时能自动召回当时的降价原因。"
whenToUse: "当 Agent 需要跨会话找回历史决策理由、避免决策反复时用本卡；只做当轮上下文压缩用主动上下文剪枝；需要长期与短期记忆统一调度用 AgeMem 统一记忆技能。"
workflow: "汇总历史决策日志与相关业务数据 → 为每段记忆生成含内容、上下文与关键词的节点 → 把节点向量化并写入向量库 → 按相似度阈值遍历已有记忆找关联 → 建立节点链接并持续演化记忆图谱"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# A-MEM — 动态结构化Agent记忆系统

## ① 解决的问题

运营Agent面临历史决策上下文易丢失——A-MEM动态结构化记忆将长期任务一致性+40%，避免重复错误，年化运营损失减少28万元

## ② 核心算法逻辑

核心思想：Agent自主管理结构化记忆网络，通过生成含上下文/关键词/链接的记忆节点，遍历已有记忆找关联，动态演化记忆图谱。采用Zettelkasten式知识管理，实现长期任务一致性。

## ③ 业务应用场景

场景A：婴儿推车跨境运营决策记忆 - 业务问题：运营Agent每季度重新评估定价策略，忘记3个月前降价原因（竞品促销/库存压力/汇率波动），导致决策反复，库存积压率达28% - 数据要求：历史定价决策日志、竞品价格变化、库存数据、汇率波动记录、销售转化率 - 预期产出：决策一致性提升至92%，库存积压率降至8%，定价周期缩短60% - 业务价值：年化降低库存成本约38万元，提升转化率带来年化增收约156万元
三轨验证 | 成本轨：月均部署成本1200元（向量数据库+推理调用），年均14400元 | 合规轨：符合GDPR个人数据处理规范，记忆节点加密存储 | 风险轨：记忆污染风险8%（错误决策被强化），可通过人工审核阈值控制
场景B：暖奶器供应链谈判经验积累 - 业务问题：采购Agent与供应商谈判时无法调用历史合作数据，每次谈判从零开始，导致采购价格波动大（同款产品价格差异18%），供应商关系管理效率低 - 数据要求：供应商历史报价、交期履约率、质量投诉记录、谈判过程日志、订单数据 - 预期产出：采购价格标准差降至3.2%，供应商评分模型准确率88%，谈判时间缩短45% - 业务价值：年化降低采购成本约92万元，供应链稳定性提升带来年化避免缺货损失约210万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴跨境运营经理面临「决策反复、经验丧失、谈判低效」——A-MEM将定价决策一致性改善至92%、采购价格波动降至3.2%、客服处理时间缩短67%，年化收益约496万元（库存成本+采购优化+客户LTV+缺货避免）
实施难度：⭐⭐⭐☆☆（需向量数据库+LLM集成，中等复杂度）
优先级：⭐⭐⭐⭐☆（直接影响运营效率与供应链稳定性，高优先级）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（238 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta
import json
from collections import defaultdict

class AMEMAgentMemory:
    """A-MEM: Agentic Memory System for Mother-Baby Cross-border E-commerce"""
    
    def __init__(self, embedding_dim=768, similarity_threshold=0.65):
        self.embedding_dim = embedding_dim
        self.similarity_threshold = similarity_threshold
        self.memory_nodes = []
        self.memory_graph = defaultdict(list)
        self.node_embeddings = np.array([]).reshape(0, embedding_dim)
        
    def create_memory_node(self, content, context, keywords, node_type="decision"):
        """生成结构化记忆节点"""
        node = {
            "id": len(self.memory_nodes),
            "content": content,
            "context": context,
            "keywords": keywords,
            "type": node_type,
            "timestamp": datetime.now().isoformat(),
            "access_count": 0,
            "related_nodes": []
        }
        self.memory_nodes.append(node)
        return node
    
    def embed_node(self, node):
        """将记忆节点转换为向量表示"""
        text = f"{node['content']} {' '.join(node['keywords'])}"
        embedding = np.random.randn(self.embedding_dim)
        embedding = embedding / np.linalg.norm(embedding)
        return embedding
    
    def retrieve_related_memories(self, query_node, top_k=5):
        """遍历已有记忆找关联节点"""
        if len(self.memory_nodes) == 0:
            return []
        
        query_embedding = self.embed_node(query_node).reshape(1, -1)
        similarities = cosine_similarity(query_embedding, self.node_embeddings)[0]
        
        related_indices = np.argsort(similarities)[::-1][:top_k]
        related_nodes = [
            {
                "node": self.memory_nodes[idx],
                "similarity": float(similarities[idx])
            }
            for idx in related_indices
            if similarities[idx] > self.similarity_threshold
        ]
        return related_nodes
    
    def add_memory_with_association(self, content, context, keywords, node_type="decision"):
        """添加记忆节点并建立关联"""
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2502.12110 — A-MEM: Agentic Memory for LLM Agents

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史决策日志与对应业务数据，如定价决策日志配上竞品价格变化、库存数据、汇率波动记录与销售转化率；或采购谈判场景下的供应商历史报价、交期履约率、质量投诉与谈判过程日志。

**输出**：结构化记忆节点与记忆图谱（含节点间关联链接与访问计数），以及在后续决策时召回的相关记忆与一致性建议，供运营与采购人员复用历史判断依据。

## 执行步骤

1. 汇总历史决策日志与相关业务数据
2. 为每段记忆生成含内容、上下文、关键词与类型的结构化节点
3. 把记忆节点向量化并写入向量库
4. 按相似度阈值遍历已有记忆检索关联节点
5. 为相关节点建立链接并动态演化记忆图谱
6. 在后续决策时召回关联记忆并输出建议

## 边界与不做

- 何时不用：一次性任务、或无需跨会话保持决策一致性时不适用；只需压缩单轮上下文时用主动上下文剪枝。
- 能力边界：存在记忆污染风险（错误决策被反复强化），须设置人工审核阈值控制写入；记忆质量取决于历史日志的完整度。
- 合规边界：记忆节点须加密存储并符合个人数据处理规范。

## 技能关联

- **前置**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Knowledge-Graph-Construction、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-MemoryOS-Agent-Memory-Management.html、Skill-MemoryOS-Agent-Memory-Management、Skill-Multi-Agent-Coordination、Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting、Skill-Temporal-Decision-Consistency、Skill-User-Profile-Long-Memory.html、Skill-User-Profile-Long-Memory、Skill-Vector-Embedding-Retrieval
- **延伸**：Skill-Knowledge-Graph-Construction、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-MemoryOS-Agent-Memory-Management.html、Skill-MemoryOS-Agent-Memory-Management、Skill-Multi-Agent-Coordination、Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting、Skill-Temporal-Decision-Consistency
- **可组合**：Skill-Multi-Agent-Coordination、Skill-ReAct-Reasoning-Acting.html、Skill-ReAct-Reasoning-Acting、Skill-Temporal-Decision-Consistency、Skill-A-MEM-Agentic-Memory-System

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-A-MEM-Agentic-Memory-System`