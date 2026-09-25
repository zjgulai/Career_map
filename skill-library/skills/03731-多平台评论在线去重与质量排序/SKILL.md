---
name: "p2s-review-dedup-quality-filter"
title: "Review Dedup & Quality Filter — 多平台评论在线去重与质量排序"
description: "触发词：评论去重、跨平台合并、质量排序、SimHash、水评过滤。何时不用：要判断是否有组织刷单走假评论检测；要判断文本是否机器生成走内容检测。安全边界：采集须遵守平台爬虫协议与反不正当竞争法规，需获得数据使用授权或走官方 API，卡页标注为条件合规。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / VOC编码"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Review-Dedup-Quality-Filter"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把跨平台重复和水评压下去，让每天的评论分析只算有效意见。"
user_try: "试试：把这批跨平台评论去重并排个质量序，水评先剔掉再进 VOC 分析。"
whenToUse: "评论来自多个平台、重复与水评比例高、会污染趋势分析时用；要判断是否有组织刷单请转假评论检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Review Dedup & Quality Filter — 多平台评论在线去重与质量排序

## ① 解决的问题

内容运营面临评论重复污染分析——Dedup Filter将重复率18%压到2%，年化省16万元

## ② 核心算法逻辑

从 Amazon、TikTok Shop、独立站同时采集的评论中，3040% 是重复或低质量内容（同一用户多平台发布、机器生成水评、极短无意义评论）。直接用于 VOC 分析会严重扭曲洞察结论。

## ③ 业务应用场景

业务背景：每日从 Amazon US/UK、TikTok Shop、独立站采集约 500 条新评论，其中约 180 条（36%）是跨平台重复或水评。人工清洗需 30-45 分钟/天。
业务背景：季度复盘需要分析过去 3 个月全渠道 470 万条评论，识别"静音性能下降"等趋势。人工抽样误差大，全量处理成本高。
三轨验证 | 成本轨：月均成本3,200元（服务器资源1,500元+人工审核20小时×85元/小时=1,700元），年度投入38,400元 | 合规轨：符合《电商法》第五条数据采集规范，遵守Amazon爬虫协议（robots.txt）和《反不正当竞争法》，需获得数据使用授权或采用API接口，结论：条件合规 | 风险轨：IP被封禁风险60%（需轮换代理），数据准确率下降至95-98%风险40%（需人工复核），法律诉讼风险15%（Amazon可能追究违约责任）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

10-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（272 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：6」并记录位置 `paper2skills-code/data_collection/review_dedup_quality_filter` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/22-数据采集工程/Skill-Review-Dedup-Quality-Filter.md`），已与卡面节选核对，不依赖上述路径。

```python
import hashlib
import heapq
import math
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class Review:
    review_id: str
    text: str
    platform: str
    timestamp: float = 0.0
    rating: float = 3.0
    verified_purchase: bool = False
    helpful_votes: int = 0
    aspects: Dict[str, str] = field(default_factory=dict)
    quality_score: float = 0.0


PLATFORM_PRIORITY = {"amazon": 3, "independent": 2, "tiktok": 1, "other": 0}


class SimHashSignature:
    def __init__(self, n_bits: int = 64, n_shingles: int = 3):
        self.n_bits = n_bits
        self.n_shingles = n_shingles

    def _shingles(self, text: str) -> List[str]:
        tokens = re.sub(r'[^\w\s]', '', text.lower()).split()
        return [" ".join(tokens[i:i+self.n_shingles])
                for i in range(len(tokens) - self.n_shingles + 1)] or [text[:16]]

    def compute(self, text: str) -> int:
        shingles = self._shingles(text)
        v = [0] * self.n_bits
        for s in shingles:
            h = int(hashlib.md5(s.encode()).hexdigest(), 16)
            for i in range(self.n_bits):
                v[i] += 1 if (h >> i) & 1 else -1
        return sum(1 << i for i in range(self.n_bits) if v[i] > 0)

    def hamming_distance(self, sig_a: int, sig_b: int) -> int:
        xor = sig_a ^ sig_b
        return bin(xor).count('1')

    def similarity(self, sig_a: int, sig_b: int) -> float:
        return 1.0 - self.hamming_distance(sig_a, sig_b) / self.n_bits


class HNSWIndex:
    """轻量 HNSW 近似最近邻索引（FOLD 核心数据结构）"""

    def __init__(self, max_neighbors: int = 16, similarity_fn=None):
        self.max_neighbors = max_neighbors
        self.nodes: Dict[str, int] = {}
        self.signatures: List[Tuple[str, int]] = []
        self.graph: Dict[int, List[int]] = {}
        self.sim_fn = similarity_fn or (lambda a, b: 1.0 - bin(a ^ b).count('1') / 64)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.07449 — RLPO: Residual Listwise Preference Optimization for Long-Context Review Ranking

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：多平台评论数据（文本、平台、时间戳、评分、是否验证购买等）与相似度、质量排序阈值

**输出**：去重后的评论集与质量排序结果（含被过滤项标记），供 VOC 编码与趋势分析使用

## 执行步骤

1. 对评论做 SimHash 一类签名，生成可比对的指纹。
2. 用近似索引跨平台匹配重复与高度相似评论。
3. 按质量特征排序，低质水评标记后过滤或降权。
4. 输出去重与排序后的评论集，供下游 VOC 分析。

## 边界与不做

- 何时不用：要判断的是有组织刷单行为请转假评论检测；只判别文本是否机器生成请转内容检测。
- 能力边界：去重与排序只做信号提纯，不判断评论观点是否正确。
- 安全边界：采集须遵守平台爬虫协议与反不正当竞争法规，需获得数据使用授权或走官方 API，卡页标注为条件合规。

## 技能关联

- **延伸**：Skill-AGRS-Aspect-Guided-Review-Summarization.html、Skill-AGRS-Aspect-Guided-Review-Summarization、Skill-Fake-Review-Detection.html、Skill-Fake-Review-Detection、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-Review-Pain-Point-Mining.html、Skill-Review-Pain-Point-Mining
- **可组合**：Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment、Skill-MAS-Dynamic-Trust.html、Skill-MAS-Dynamic-Trust、Skill-Review-Dedup-Quality-Filter

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Review-Dedup-Quality-Filter`