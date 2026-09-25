---
name: "p2s-longrag-long-context-hybrid"
title: "LongRAG — 长上下文与RAG混合决策策略"
description: "触发词：长上下文、混合路由、文档规模判断、成本权衡、条款抽取。何时不用：文档很短时直接喂长上下文即可；要跨文档建抽象树检索时用分层检索。安全边界：合同内容属商业敏感信息，路由与截断须留痕，不得把整份合同透传给未经批准的外部服务。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-LongRAG-Long-Context-Hybrid"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "按文档长短自动选路：短文档整篇交给长上下文模型，长文档转成检索，在成本与条款覆盖率之间取平衡。"
user_try: "试试：这份 60 页采购合同，自动判断该走长上下文还是检索，并把最小订单量、退货期限、质检标准抽出来。"
whenToUse: "属于「业务工具实现」：文档规模跨度大、需要在成本与质量之间自动取舍时用；若文档都很短，直接长上下文即可；若要处理 200 页以上政策文档并做分层检索，用分层检索技能。"
workflow: "估算文档 token 规模与问题复杂度 → 按阈值路由：落在预算内走长上下文，超出则触发检索关键章节 → 对超长文档做章节级检索，抽取与问题相关的条款 → 合并两路结果，输出结论并标注所用策略 → 记录每次路由与成本，复核阈值设置是否合理"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LongRAG — 长上下文与RAG混合决策策略

## ① 解决的问题

运营团队面临长文档与知识库检索策略选择困难——LongRAG自动路由将综合成本降低40%，质量保持97%，年化节省API成本32万元

## ② 核心算法逻辑

核心思想：根据文档集规模、问题复杂度、成本约束自适应决策——小规模文档直接喂长上下文LLM（成本低、延迟短），大规模库存用RAG精准检索（精度高、成本可控）。

## ③ 业务应用场景

- 业务问题：母婴供应商与海外平台（Amazon/Shopee）签订50-80页采购合同，涉及价格条款、物流要求、质量标准、退货政策等多维信息。传统方案需人工逐页审阅（8-12小时/份），或用RAG检索但易遗漏关键条款；现需在2小时内完成合同风险评估与条款提取，准确率>95%。
- 数据要求： - 合同库：200份历史合同（PDF格式，平均60页/份，共12,000页） - 查询：「该合同中婴儿推车的最小订单量、退货期限、质检标准分别是什么？」等5-8个结构化问题 - 上下文窗口：Claude 3.5 Sonnet 200K token
- 预期产出： - 自动判断：该合同<100K token ⟹ 直接长上下文处理；若>100K token ⟹ 触发RAG检索关键章节 - 条款提取准确率：96.2%（vs 人工100%，差异仅关键边界条款） - 处理时间：8分钟/份（vs 人工10小时，加速75倍） - 成本对比：¥0.32/份（长上下文）vs ¥1.20/份（RAG+人工审核）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
场景A（合同分析）：采购经理面临年1000份合同审阅——LongRAG混合策略将人工审阅时间从10小时/份降至8分钟/份，成本从¥1.20/份降至¥0.32/份，年化收益¥128万元
场景B（评论分析）：运营分析师需月100次产品评论查询——混合策略将月成本从¥1,200（全长上下文）降至¥180，年化节省¥12,240元；若扩展至10个SKU产品线，年化ROI升至¥84万元
实施难度：⭐⭐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（426 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import Literal, Dict, Tuple
import json

# ============================================================================
# Skill-LongRAG-Long-Context-Hybrid: 母婴跨境电商场景实现
# ============================================================================

class LongRAGHybridRouter:
    """
    自适应决策路由：根据文档规模、问题类型、成本约束选择最优策略
    """
    
    def __init__(self, 
                 long_context_cost_per_1k_[REDACTED] = 0.15,  # Claude 3.5 Sonnet
                 rag_cost_per_query: float = 0.08,  # 检索+生成成本
                 long_context_token_budget: int = 200000,
                 quality_weight: Dict[str, float] = None):
        """
        初始化混合路由器
        
        Args:
            long_context_cost_per_1k_[REDACTED] token）
            rag_cost_per_query: RAG单次查询成本（元）
            long_context_token_budget: 长上下文预算（token）
            quality_weight: 质量权重 {'cost': 0.3, 'latency': 0.3, 'accuracy': 0.4}
        """
        self.long_context_cost = long_context_cost_per_1k_token
        self.rag_cost = rag_cost_per_query
        self.token_budget = long_context_token_budget
        
        self.quality_weight = quality_weight or {
            'cost': 0.3,
            'latency': 0.3,
            'accuracy': 0.4
        }
        
        # 母婴产品类别与问题类型映射
        self.product_categories = {
            '婴儿推车': {'avg_tokens': 8500, 'query_type': 'mixed'},
            '暖奶器': {'avg_tokens': 5200, 'query_type': 'precision'},
            '有机辅食': {'avg_tokens': 6800, 'query_type': 'mixed'},
            '奶瓶': {'avg_tokens': 4100, 'query_type': 'precision'},
            '安全座椅': {'avg_tokens': 9200, 'query_type': 'global'}
        }
        
        # 问题类型特征
        self.query_type_patterns = {
            'global': ['总结', '综合', '全部', '整体', '所有'],
            'precision': ['具体', '特定', '哪个', '多少', '是否'],
            'mixed': ['对比', '分析', '评估']
        }
    
    def estimate_document_tokens(self, 
                                  doc_count: int, 
                                  avg_doc_length: str = 'medium') -> int:
        """
        估算文档集总token数
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2406.15319 — LongRAG: Enhancing Retrieval-Augmented Generation with Long-context LLMs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：文档库（卡页示例 200 份合同、平均 60 页、共 12,000 页）与结构化问题清单（示例每份 5-8 个问题），以及上下文窗口约束（示例 200K token）。

**输出**：条款抽取结果与路由判定记录：卡页示例条款提取准确率 96.2%、处理时间约 8 分钟每份（人工约 10 小时每份）、成本约 0.32 元每份（对比 1.20 元每份）。

## 执行步骤

1. 估算文档 token 规模，判断是否落在长上下文预算内
2. 按阈值路由：短文档直接长上下文处理，超长文档改走检索
3. 对超长文档做章节级检索，定位与问题相关的条款
4. 合并两路结果，输出结构化答案并标注所用策略
5. 记录路由与成本，定期复核阈值设置

## 边界与不做

- 数据不满足时不用：没有可靠的 token 估算，或问题清单本身模糊时路由会选错策略，应先规范提问口径。
- 能力边界：本卡产出路由策略与抽取结果，条款的最终法律解释与签署仍由人工负责。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-Context-Compression.html、Skill-Context-Compression、Skill-GraphRAG-Knowledge-Enhanced-Retrieval.html、Skill-GraphRAG-Knowledge-Enhanced-Retrieval、Skill-LLMLingua-Context-Compression.html、Skill-LLMLingua-Context-Compression、Skill-Speculative-RAG.html、Skill-Speculative-RAG
- **延伸**：Skill-Adaptive-RAG-Query-Routing.html、Skill-Adaptive-RAG-Query-Routing、Skill-LLMLingua-Context-Compression.html、Skill-LLMLingua-Context-Compression、Skill-Speculative-RAG.html、Skill-Speculative-RAG
- **可组合**：Skill-Speculative-RAG.html、Skill-Speculative-RAG、Skill-LongRAG-Long-Context-Hybrid

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-LongRAG-Long-Context-Hybrid`