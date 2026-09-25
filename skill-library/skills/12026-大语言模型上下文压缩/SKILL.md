---
name: "p2s-llmlingua-context-compression"
title: "LLMLingua-2 — 大语言模型上下文压缩"
description: "触发词：上下文压缩、token降本、大促成本控制、长文档喂入、困惑度过滤。何时不用：上下文本来就很短时压缩收益有限；检索不到对的文档时用精排或分层检索，而非压缩。安全边界：压缩只做 token 级重组、不删除原始数据，须保留完整审计链路，不得借压缩规避留痕。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-LLMLingua-Context-Compression"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "用小模型学出的删除策略把长上下文压到原来的两成左右，语义关键信息还在，大促期间的调用成本随之下降。"
user_try: "试试：把这段 10000 token 的大促备货上下文压到 2000 token 以内，并核对关键阈值有没有丢。"
whenToUse: "属于「业务工具实现」：单次调用上下文很长、成本或延迟成为瓶颈时用；若上下文本来就不长，压缩收益有限；若问题是检索不到对的文档，用精排或分层检索。"
workflow: "收集历史 prompt-response 对与查询日志作为训练信号 → 用小模型蒸馏学习 token 级删除策略，设定困惑度阈值 → 对目标上下文逐 token 筛选，达到目标压缩率 → 核对库存阈值、价格、时效等关键信息是否保留 → 接入线上调用链，监控压缩后的决策质量与成本"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLMLingua-2 — 大语言模型上下文压缩

## ① 解决的问题

工程团队面临大促期间Agent调用成本激增——LLMLingua压缩率80%，大促API成本从¥5万/天→¥1万/天，年化节省48万元

## ② 核心算法逻辑

核心思想：通过小模型蒸馏学习token级删除策略，在保留语义关键信息的前提下，实现80%+压缩率，困惑度感知的精准过滤。

## ③ 业务应用场景

- 业务问题：618大促期间，备货决策Agent需要同时处理5000+SKU库存状态、3个月历史销售数据、竞品价格监控、物流时效信息，每次调用上下文达10000 tokens，日均调用1000次，月度API成本12万元；压缩前后端延迟差异导致决策时间窗口错失 - 数据要求： - 历史prompt-response对：5000+条大促场景真实交互记录 - 商品维度特征：SKU编码、品类、库存量、历史销量、毛利率、物流成本 - 时间序列数据：过去90天的日销量、价格变动、竞品动态 - 预期产出： - 压缩率：82%（10000 tokens → 1800 tokens） - 保留关键信息：库存阈值
三轨验证 | 成本轨：月均API成本2.4万元（基于Claude 3.5 Sonnet按token计费，压缩后月均调用30万tokens vs原先150万tokens），较原方案节省9.6万元 | 合规轨：压缩过程不涉及数据删除，仅对prompt进行token级重组，符合数据隐私法规，保留完整审计链路 | 风险轨：压缩过度导致关键信息丢失概率8%（可通过困惑度阈值调整至<2%），备货决策偏差风险可控
- 业务问题：母婴出海运营团队维护的Skill卡片库、竞品分析文档、供应商协议库共3000+份文档，平均长度8000 tokens，检索增强生成(RAG)时将完整文档喂入LLM进行决策推理，导致每次查询成本0.8元，月均查询2万次，月度成本1.6万元；长文档还引入噪声，影响决策质量 - 数据要求： - 文档库：3000+份母婴品类文档（产品规格、市场分析、供应链信息） - 标注数据：200份文档的人工摘要与关键信息标注 - 查询日志：过去3个月的2万条RAG查询及用户反馈 - 预期产出： - 压缩率：75%（8000 tokens → 2000 tokens） - 保留内容：产品核心属性、市场

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（440 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from collections import defaultdict
import json

# ============ LLMLingua-2 Context Compression Implementation ============

class LLMLinguaContextCompressor:
    """
    母婴跨境电商Agent上下文压缩器
    应用场景：大促备货决策、知识库RAG检索
    """
    
    def __init__(self, compression_ratio=0.8, perplexity_threshold=2.5):
        """
        初始化压缩器
        :param compression_ratio: 目标压缩率（0-1），默认80%
        :param perplexity_threshold: 困惑度阈值，超过则停止压缩
        """
        self.compression_ratio = compression_ratio
        self.perplexity_threshold = perplexity_threshold
        self.token_importance_scores = {}
        self.compression_history = []
        
    def tokenize_prompt(self, prompt_text):
        """
        将prompt分词（简化版，实际使用tokenizer库）
        :param prompt_text: 原始prompt文本
        :return: token列表及位置信息
        """
        tokens = prompt_text.split()
        token_info = [
            {"id": i, "text": token, "position": i, "importance": 0.0}
            for i, token in enumerate(tokens)
        ]
        return token_info
    
    def calculate_token_importance(self, tokens, task_context):
        """
        计算每个token的重要度评分（基于梯度和语义相关性）
        :param tokens: token列表
        :param task_context: 任务上下文（如"备货决策"、"竞品分析"）
        :return: 重要度评分字典
        """
        importance_scores = {}
        
        # 关键词字典（母婴跨境场景）
        keyword_weights = {
            "备货": 0.95, "库存": 0.92, "销量": 0.90, "成本": 0.88,
            "竞品": 0.85, "价格": 0.83, "物流": 0.82, "风险": 0.80,
            "SKU": 0.87, "毛利": 0.84, "供应链": 0.81, "大促": 0.89,
            "婴儿": 0.78, "推车": 0.76, "暖奶器": 0.75, "有机": 0.74,
            "辅食": 0.73, "安全": 0.91, "认证": 0.86, "售后": 0.79
        }
        
        # 结构化信息权重（数字、日期、百分比）
        structural_weight = 0.85
        
        for token_info in tokens:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2403.12968 — LLMLingua-2: Data Distillation for Efficient and Faithful Task-Agnostic Prompt Compression

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：历史 prompt-response 交互记录（卡页示例 5000+ 条大促场景真实交互）、商品维度特征（SKU 编码、品类、库存量、历史销量、毛利率、物流成本）、时间序列数据（过去 90 天日销量、价格变动、竞品动态）与查询日志。

**输出**：压缩后的上下文与压缩率报告：卡页示例压缩率 82%（10000 tokens 降至 1800 tokens）或 75%（8000 降至 2000），并保留库存阈值等关键信息，供 Agent 调用链与成本核算使用。

## 执行步骤

1. 收集历史 prompt-response 对与查询日志，作为删除策略的训练信号
2. 用小模型蒸馏学习 token 级删除策略，设定困惑度阈值
3. 对目标上下文逐 token 筛选，达到目标压缩率
4. 核对库存阈值、价格条款、时效等关键信息是否保留
5. 接入线上调用链，监控压缩后的决策质量与成本

## 边界与不做

- 数据不满足时不用：没有历史交互记录可蒸馏，或上下文本身很短时，压缩的投入产出不划算。
- 能力边界：本卡产出压缩后的上下文，不提升知识覆盖与答案正确性；压缩过度存在关键信息丢失风险，需靠困惑度阈值与人工抽检控制。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Context-Compression.html、Skill-Context-Compression、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-LongRAG-Long-Context-Hybrid.html、Skill-LongRAG-Long-Context-Hybrid、Skill-Multi-Agent-Context-Sharing、Skill-Semantic-Preservation-Verification、Skill-Token-Importance-Scoring
- **延伸**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Context-Token-Compression.html、Skill-Context-Token-Compression、Skill-LongRAG-Long-Context-Hybrid.html、Skill-LongRAG-Long-Context-Hybrid、Skill-Multi-Agent-Context-Sharing、Skill-Semantic-Preservation-Verification
- **可组合**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Multi-Agent-Context-Sharing、Skill-LLMLingua-Context-Compression

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-LLMLingua-Context-Compression`