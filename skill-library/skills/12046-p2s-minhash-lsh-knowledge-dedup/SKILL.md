---
name: "p2s-minhash-lsh-knowledge-dedup"
title: "Skill-MinHash-LSH-Knowledge-Dedup"
description: "触发词：知识库去重、MinHash、LSH、近似重复、向量成本优化。何时不用：要处理的是跨平台评论去重与质量排序走评论去重；要消解知识冲突走冲突检测。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-MinHash-LSH-Knowledge-Dedup"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "在近似线性时间里找出知识库里重复的文档，只留最完整的那一份。"
user_try: "试试：给这五十万条商品描述做近似去重，重复的只留最完整版本。"
whenToUse: "大规模知识库里存在大量轻微改写的重复文档、拖累检索与存储时用；要做评论级去重与质量排序请转评论去重。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-MinHash-LSH-Knowledge-Dedup

## ① 解决的问题

数据工程师面临"知识库30%重复文档导致RAG返回冗余且向量存储浪费"——MinHash-LSH近似去重在O(n)时间处理50万文档，RAG精度+23%，向量存储成本节省36%

## ② 核心算法逻辑

MinHash + LSH（Locality Sensitive Hashing）是近似去重的工业标准方法，用于在大规模知识库中检测和删除近似重复文档，时间复杂度从O(n²)降至O(n)。

## ③ 业务应用场景

场景1：商品知识库去重 Amazon母婴品类知识库：50万条商品描述，30%为轻微改写的近似重复（不同卖家相同产品）
问题：重复文档导致： - RAG检索返回冗余内容 - 知识图谱出现重复实体 - 嵌入空间资源浪费
MinHash去重： - Jaccard阈值0.8，检测出15万对近似重复 - 保留最完整版本，删除18万重复文档 - RAG精度提升23%，向量存储成本降低36%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

知识库去重率：典型电商场景30-40%文档为重复
RAG精度提升：去重后+23%（减少冗余干扰）
向量存储成本节省：去重后节省36%存储和计算
处理速度：10万文档<60秒（vs 暴力O(n²)需要数小时）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（215 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
MinHash-LSH 知识库近似去重
支持大规模电商知识库去重
"""
from typing import List, Dict, Tuple, Set
import hashlib
import re
from collections import defaultdict

class MinHashLSHDeduplicator:
    """
    MinHash + LSH 近似去重器
    时间复杂度: O(n) vs 暴力O(n^2)
    """
    
    def __init__(
        self,
        num_perm: int = 128,        # MinHash签名维度
        threshold: float = 0.8,      # Jaccard相似度阈值
        ngram_size: int = 3,         # n-gram大小
        num_bands: int = 32          # LSH band数
    ):
        self.num_perm = num_perm
        self.threshold = threshold
        self.ngram_size = ngram_size
        self.num_bands = num_bands
        self.rows_per_band = num_perm // num_bands
        
        # 哈希函数参数（大素数）
        import random
        random.seed(42)
        p = (1 << 31) - 1  # 梅森素数
        self.hash_params = [
            (random.randint(1, p), random.randint(0, p), p)
            for _ in range(num_perm)
        ]
        
        self.buckets = defaultdict(list)  # band_id+hash -> [doc_ids]
        self.signatures = {}  # doc_id -> minhash signature
    
    def _tokenize(self, text: str) -> Set[str]:
        """文本n-gram分词"""
        # 预处理：小写+去特殊字符
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        tokens = text.split()
        
        # n-gram
        ngrams = set()
        for i in range(len(tokens) - self.ngram_size + 1):
            ngram = ' '.join(tokens[i:i+self.ngram_size])
            ngrams.add(ngram)
        
        # 也加入unigram保证短文本有特征
        ngrams.update(tokens)
        return ngrams
    
    def _compute_minhash(self, tokens: Set[str]) -> List[int]:
        """计算MinHash签名"""
        signature = [float('inf')] * self.num_perm
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待去重文档集（卡页场景为 50 万条商品描述），以及相似度阈值、n-gram 粒度等参数配置

**输出**：重复文档对清单与保留、删除决策（保留最完整版本），以及去重后的文档集，供 RAG 索引与图谱构建使用

## 执行步骤

1. 对文档做 n-gram 切分并计算 MinHash 签名。
2. 用 LSH 分桶把候选重复对压到可计算规模。
3. 按 Jaccard 阈值判定近似重复对，保留最完整版本。
4. 输出去重结果，并复检检索精度与向量存储占用的变化。

## 边界与不做

- 何时不用：要处理的是跨平台评论去重与质量排序时，请转评论去重技能。
- 能力边界：只做近似去重的取舍判定，不保证语义等价，重大删除须人工抽检。
- 能力边界：阈值直接影响误删与漏删，需按文档类型调校后再全量执行。

## 技能关联

- **可组合**：Skill-MinHash-LSH-Knowledge-Dedup

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：08-知识图谱　·　源卡：`Skill-MinHash-LSH-Knowledge-Dedup`