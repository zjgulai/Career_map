---
name: "p2s-patent-prior-art-risk-scan"
title: "专利先验技术风险扫描 — 新品上市前侵权风险评估"
description: "触发词：专利风险预筛、TF-IDF 相似度、权利要求比对、上市前排查、律师费优化。何时不用：要做商标、专利、著作权三维整体上架体检用「上架前 IP 侵权扫描」；要盯官方商标公告用「商标侵权追踪」。安全边界：只是律师分析前的排序预筛，不构成侵权法律意见；产品技术资料与比对结论属敏感信息，不得外传。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-129"
l3_business: "知识产权检索"
l3_all: "知识产权检索"
l1_l2_l3: "独立控制/财务与合规/知识产权检索"
p2s_card_id: "Skill-Patent-Prior-Art-Risk-Scan"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "上市前把技术说明和同品类专利文本做相似度比对，排出最有风险的专利，让律师只审重点，省下初审费用。"
user_try: "试试：把这款智能电动摇椅的技术说明和 A47D 类专利权利要求比对，输出相似度前五的专利和危险措辞清单。"
whenToUse: "需要在上架前用文本相似度快速给专利风险排序时用本技能；做三维整体 IP 体检用「上架前 IP 侵权扫描」；监控对手商标申请用「商标侵权追踪」。"
workflow: "整理新品技术规格说明书与产品描述（中英文） → 按 CPC 分类拉取同品类专利 Claim 文本 → 计算商品描述与专利文本的 TF-IDF 余弦相似度 → 输出相似度前五专利、风险分数与关键词命中分析 → 给出危险措辞修改清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 专利先验技术风险扫描 — 新品上市前侵权风险评估

## ① 解决的问题

合规负责人面临"新品上市前不知道是否侵犯现有专利直到被起诉才发现"——TF-IDF专利相似度扫描将专利风险发现提前到上架前，年化避免诉讼损失$15万+

## ② 核心算法逻辑

新品上市前专利风险扫描通过文本相似度计算将商品技术描述与专利文本进行对比，实现低成本、快速的侵权风险预筛查，帮助运营团队在聘请专利律师进行精确分析前完成初步风险排序。

## ③ 业务应用场景

场景A：婴儿电动摇椅新品上市前专利风险筛查
- 业务问题：某母婴品牌计划上线一款"自动感应哭声启动的智能电动摇椅"，担心侵犯 Fisher-Price 等竞品已有专利（如"声音触发自动摇摆装置"），若上市后被起诉，赔偿金额可能超百万美元 - 数据要求： - 新品技术规格说明书/产品描述（中英文） - 同品类专利数据库（USPTO CPC 分类 A47D）的 Claim 文本（mock 演示用） - 预期产出： - 相似度 TOP5 专利清单 + 风险分数 - 关键词命中分析报告 - 建议修改的危险措辞清单 - 业务价值：专利律师初审费用 $5,000-$15,000/次，通过预筛排除70%低风险专利，年化节省律师费 $8-12 万；若避
- 业务问题：新增"静音双泵同步技术"，需在量产前核查是否触碰竞品核心专利 - 数据要求：功能技术说明 + 竞品专利号（作为检索锚点） - 预期产出：风险等级报告 + 重点关注的权利要求条目 - 业务价值：规避量产后被迫下架损失（模具+库存+营销费用合计约 $20-40 万）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
避免律师初审成本：每次节省 $5,000-$15,000，年化 10 次扫描省 $5-15 万
规避专利诉讼：母婴行业专利诉讼赔偿中位数 $50-200 万，一次预防收益极高
工具维护成本：$3,000/年（主要是专利数据库API费用）
净ROI 保守估算：年化节省 $8 万以上，若防住一次诉讼则回报率超1000%
实施难度：⭐⭐⭐☆☆（核心算法简单，难点是建立高质量同品类专利文本数据库）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（255 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/compliance/patent_prior_art_risk_scan` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Patent-Prior-Art-Risk-Scan.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
专利先验技术风险扫描系统
使用 TF-IDF 余弦相似度 + 关键词命中率 综合评分
全部使用 mock 专利文本，不依赖真实 API
"""
import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import List, Dict, Tuple


# ────── TF-IDF 实现（纯 Python）──────

def tokenize(text: str) -> List[str]:
    """简单英文分词+停用词过滤"""
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "shall",
        "should", "may", "might", "must", "can", "could", "of", "in", "on",
        "at", "to", "for", "with", "by", "from", "and", "or", "but", "not",
        "which", "that", "this", "said", "claim", "wherein", "comprising",
    }
    tokens = re.findall(r"[a-zA-Z]+", text.lower())
    return [t for t in tokens if len(t) > 2 and t not in stop_words]


def build_tfidf(corpus: List[List[str]]) -> Tuple[Dict[str, int], List[Dict[str, float]]]:
    """构建 TF-IDF 向量"""
    # 构建词汇表
    vocab = {}
    for doc in corpus:
        for token in set(doc):
            if token not in vocab:
                vocab[token] = len(vocab)
    
    N = len(corpus)
    
    # 计算 IDF
    idf = {}
    for term in vocab:
        df = sum(1 for doc in corpus if term in doc)
        idf[term] = math.log((N + 1) / (df + 1)) + 1  # 平滑IDF
    
    # 计算每个文档的 TF-IDF 向量
    tfidf_vectors = []
    for doc in corpus:
        tf = Counter(doc)
        total = len(doc)
        vec = {}
        for term, count in tf.items():
            vec[term] = (count / total) * idf.get(term, 0)
        tfidf_vectors.append(vec)
    
    return vocab, tfidf_vectors


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """计算两个稀疏向量的余弦相似度"""
    common = set(vec1.keys()) & set(vec2.keys())
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2311.15423。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：新品技术规格说明书或产品描述（中英文），以及同品类专利数据库（如 USPTO CPC A47D）的 Claim 文本；另可提供竞品专利号作为检索锚点。

**输出**：相似度前五专利清单与风险分数、关键词命中分析报告、建议修改的危险措辞清单，作为专利律师精确分析的输入。

## 执行步骤

1. 整理新品技术说明与产品描述文本
2. 按 CPC 分类构建同品类专利 Claim 文本库
3. 计算 TF-IDF 余弦相似度与关键词命中率
4. 输出高相似专利清单与风险分数
5. 整理危险措辞修改清单交专利律师复核

## 边界与不做

- 同品类专利文本库缺失或技术描述过于笼统时不适用，相似度排序失去区分度
- 只做上架前预筛与风险排序，不构成侵权法律意见，精确判定须由专利律师完成
- 产品技术资料与专利比对结论属高敏信息，不得对外披露

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring、Skill-Product-Regulatory-Compliance-Classification
- **延伸**：Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring、Skill-Product-Regulatory-Compliance-Classification
- **可组合**：Skill-Product-Regulatory-Compliance-Classification、Skill-Patent-Prior-Art-Risk-Scan

---

> 分类：独立控制/财务与合规/知识产权检索　·　技术族：21-合规决策　·　源卡：`Skill-Patent-Prior-Art-Risk-Scan`