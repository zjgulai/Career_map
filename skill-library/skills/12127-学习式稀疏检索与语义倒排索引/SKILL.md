---
name: "p2s-splade-learned-sparse-retrieval"
title: "SPLADE — 学习式稀疏检索与语义倒排索引"
description: "触发词：稀疏检索、语义倒排、同义词召回、中英混合查询、供应商搜索。何时不用：需要稠密向量语义匹配时用向量检索；只做查询改写时用查询扩展。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 搜索意图分析"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-SPLADE-Learned-Sparse-Retrieval"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "用学习出来的稀疏权重词表做检索，既保留倒排索引的效率，又能把纸尿裤、nappies 这类同义说法一起召回。"
user_try: "试试：用 baby diapers 搜供应商时，把 pull-ups、infant nappies 这些同义表述也一起召回。"
whenToUse: "属于「业务工具实现」：搜索词与页面表述不一致、同义词或中英混合导致召回不足，且希望沿用现有倒排索引（如 Elasticsearch）时用；若要稠密语义匹配，用向量检索；若只是改写查询，用查询扩展。"
workflow: "对语料（供应商页面、产品描述、认证信息）做 SPLADE 编码 → 构建稀疏倒排索引，记录每篇文档的扩展词与权重 → 查询进入后自动扩展到同义与相关词 → 按稀疏向量点积打分并召回候选 → 对比召回覆盖与采购成本，确认后接入生产检索"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SPLADE — 学习式稀疏检索与语义倒排索引

## ① 解决的问题

运营面临"中英混合查询或同义词搜索召回失效"——SPLADE学习式稀疏检索使跨语言场景召回率提升22%，无需向量数据库直接复用Elasticsearch

## ② 核心算法逻辑

核心思想：用 BERT MLM 头学习稀疏权重向量，在词汇表空间（~30K维）上实现语义感知的稀疏表示，既保留倒排索引的工程优势，又获得语义扩展能力。

## ③ 业务应用场景

业务问题： - 某母婴品牌方在阿里国际站寻找"婴儿纸尿裤"供应商，但搜索词为英文"baby diapers" - 现有 BM25 系统只召回含"baby diapers"的供应商页面（~12 家） - 错过了用"pull-ups""infant nappies""disposable diapers"等表达的优质供应商（~28 家） - 结果：可选供应商池仅 30% 覆盖，导致备选方案不足，单一供应商议价能力强
SPLADE 方案： 1. 对 5000+ 供应商页面（含产品描述、认证信息、历史订单标签）进行 SPLADE 编码 2. 生成稀疏倒排索引（占用空间 ~80MB，vs 稠密向量 1.2GB） 3. 用户查询"baby diapers"→ SPLADE 自动扩展到 {baby, diapers, infant, nappies, disposable, pull-ups, ...} 4. 召回供应商从 12 家 → 40 家
量化产出： - 供应商候选池扩大 233%（12→40 家） - 通过多源对比，采购成本下降 18%（从 $2.8/件 → $2.3/件） - 建立 3 个替代供应商，断货风险从 45% 降低至 18%（降幅 60%） - 年度采购额 500 万美元，成本节省 90 万美元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

90 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（294 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional, List, Dict, Tuple

@dataclass
class SparseVector:
    """稀疏向量表示：仅存储非零维度"""
    indices: List[int]
    values: List[float]
    
    def to_dict(self) -> Dict[int, float]:
        return dict(zip(self.indices, self.values))
    
    @staticmethod
    def from_dict(d: Dict[int, float]) -> "SparseVector":
        items = sorted(d.items())
        return SparseVector([k for k, _ in items], [v for _, v in items])
    
    def dot(self, other: "SparseVector") -> float:
        """计算两个稀疏向量的点积"""
        d1, d2 = self.to_dict(), other.to_dict()
        return sum(d1.get(k, 0) * d2[k] for k in d2)


class SimpleTokenizer:
    """简化的分词器（模拟 BERT 词汇表）"""
    def __init__(self, vocab_size: int = 1000):
        self.vocab: Dict[str, int] = {}
        self.inv_vocab: Dict[int, str] = {}
        self.vocab_size = vocab_size
        self._build_vocab()
    
    def _build_vocab(self):
        """构建词汇表（包含常见母婴词汇）"""
        base_words = [
            "baby", "diaper", "nappy", "pull-up", "infant", "disposable",
            "leakage", "leak", "spill", "seepage", "wetness", "moisture",
            "纸尿裤", "纸尿布", "尿不湿", "漏液", "漏水", "渗漏", "溅出",
            "supply", "stockout", "断货", "缺货", "库存", "告急",
            "supplier", "vendor", "manufacturer", "factory",
            "quality", "defect", "issue", "problem", "risk",
            "amazon", "aliexpress", "ebay", "wish", "shopee"
        ]
        
        # 添加基础词汇
        for i, word in enumerate(base_words[:min(len(base_words), self.vocab_size)]):
            self.vocab[word] = i
            self.inv_vocab[i] = word
        
        # 填充剩余词汇表
        for i in range(len(base_words), self.vocab_size):
            [REDACTED]"[UNK_{i}]"
            self.vocab[token] = i
            self.inv_vocab[i] = token
    
    def tokenize(self, text: str) -> List[str]:
        """分词"""
        text = text.lower()
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2107.05720 — SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待索引的语料（卡页示例 5000+ 供应商页面，含产品描述、认证信息、历史订单标签）与查询词；卡页第 4 段未给字段级规格，落地前需确认语料规模与索引空间预算。

**输出**：稀疏倒排索引与召回结果：卡页示例索引占用约 80MB（稠密向量为 1.2GB），供应商候选池从 12 家扩大到 40 家（+233%）、采购成本下降 18%（从 2.8 美元每件降到 2.3 美元）。

## 执行步骤

1. 对语料（供应商页面、产品描述、认证信息）做 SPLADE 编码
2. 构建稀疏倒排索引，记录每篇文档的扩展词与权重
3. 查询进入后自动扩展到同义与相关词
4. 按稀疏向量点积打分并召回候选
5. 对比召回覆盖与采购成本，确认后接入生产检索

## 边界与不做

- 数据不满足时不用：语料规模不足以训练稀疏编码器时扩展词质量不可靠，效果可能不如关键词检索。
- 能力边界：本卡产出检索索引与召回能力，不含供应商准入评估与采购谈判。

## 技能关联

- **前置**：Skill-BERT-Masked-Language-Model
- **延伸**：Skill-Dense-Retrieval-Embedding、Skill-Inverted-Index-BM25
- **可组合**：Skill-GNN-Ecommerce-Recommendation.html、Skill-GNN-Ecommerce-Recommendation、Skill-Hybrid-Search-Sparse-Dense-Fusion、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-SPLADE-Learned-Sparse-Retrieval

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：08-知识图谱　·　源卡：`Skill-SPLADE-Learned-Sparse-Retrieval`