---
name: "p2s-openre-llm-knowledge-extraction"
title: "Skill-OpenRE-LLM-Knowledge-Extraction"
description: "触发词：开放关系抽取、大模型抽取、无监督标注、关系类型发现、合规图谱。何时不用：实体类型固定且只有少量已知关系时，规则或模板抽取更划算；本技能面向关系类型未知、需要自动发现的场景。安全边界：无。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-139"
l3_business: "主数据治理"
l3_all: "主数据治理 / 数据管道"
l1_l2_l3: "数据与Agent平台/数据与AI运行/主数据治理"
p2s_card_id: "Skill-OpenRE-LLM-Knowledge-Extraction"
p2s_src_domain: "08-知识图谱"
quality_tier: "preview"
user_summary: "不预设关系类型，让大模型从商品描述和合规文档里自己发现关系，建图时间从三个月压到两天。"
user_try: "试试：从这批 listing 文本里自动发现关系类型，输出三元组。"
whenToUse: "关系类型未知或会持续新增时用本技能；关系清单已固定、追求低成本高吞吐时用依存句法类抽取技能。"
workflow: "准备文本与实体清单 → 三阶段大模型抽取并对多次采样做一致性投票 → 按一致度阈值过滤低置信关系 → 归纳新出现的关系类型并写入图谱"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-OpenRE-LLM-Knowledge-Extraction

## ① 解决的问题

运营面临"需要人工标注50万条商品描述的实体关系耗时3个月"——LLM-OREF三阶段开放关系抽取将标注时间压缩至2天，关系类型覆盖从30种扩展至150+种，年化节省标注人力60万元

## ② 核心算法逻辑

开放关系抽取（Open Relation Extraction, OpenRE）在无预定义关系类型前提下，从文本中自动发现实体对间的关系。2025年最新进展转向LLM驱动的范式：

## ③ 业务应用场景

场景1：产品属性关系自动抽取 从Amazon listing文本（"Pampers Grade A diapers for newborns, 0-5kg, ultra-thin"）无监督抽取： - (Pampers, 适用体重范围, 0-5kg) - (Pampers, 产品等级, Grade A) - (ultra-thin, 材质特性, ?)
输入：商品listing/评论/手册文本，10万条 产出：自动发现50+关系类型，KG节点覆盖率提升3倍，无需人工标注Ontology
**场景2：合规文件关系图谱** 从FDA/CE/REACH合规文档抽取： - (成分X, 受监管于, EU Regulation 2023/xxx) - (检测方法Y, 适用标准, EN71-3) 年化减少合规律师审查时间60%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

产品KG构建时间：人工标注3个月 → OpenRE自动构建2天，效率提升45x
关系类型覆盖：预定义30种 → 自动发现150+种，覆盖率提升5倍
年化节省标注人力：约60万元（3名标注员/年）
合规图谱构建：从无到有，监管风险预警提前30天

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（186 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
OpenRE for E-commerce Knowledge Graph Construction
基于LLM-OREF框架的开放关系抽取
"""
from typing import List, Tuple, Dict
import re

def extract_relations_llm_oref(
    text: str,
    entities: List[str],
    llm_client,
    n_samples: int = 3,
    consistency_threshold: float = 0.6
) -> List[Tuple[str, str, str]]:
    """
    LLM-OREF三阶段开放关系抽取
    
    Args:
        text: 输入文本（产品描述/评论/合规文档）
        entities: 已识别实体列表
        llm_client: LLM客户端（支持OpenAI接口）
        n_samples: 自洽采样次数
        consistency_threshold: 一致性过滤阈值
    
    Returns:
        List of (subject, relation, object) triples
    """
    # Stage 1: 候选关系生成
    prompt_template = """
    给定文本："{text}"
    已知实体：{entities}
    
    请抽取实体间的关系，以三元组格式输出：
    (主体, 关系, 客体)
    
    要求：
    - 关系用简洁动词短语描述（2-5个词）
    - 只抽取文本中有明确依据的关系
    - 输出JSON格式：{{"triples": [["实体A", "关系", "实体B"]]}}
    """
    
    # 多次采样
    candidates = []
    for _ in range(n_samples):
        response = llm_client.chat([{
            "role": "user",
            "content": prompt_template.format(
                text=text, entities=", ".join(entities)
            )
        }])
        try:
            import json
            result = json.loads(response)
            candidates.extend(result.get("triples", []))
        except:
            pass
    
    # Stage 2: 自洽过滤（基于频次）
    from collections import Counter
    triple_counts = Counter(
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：商品 listing、评论、手册、合规文档等文本（如 10 万条量级），可给定实体清单；无需预定义 Ontology 或人工标注。

**输出**：自动发现的关系类型集合与三元组（含一致性得分），供产品知识图谱与合规关系图谱构建使用。

## 执行步骤

1. 收集待抽取文本并整理实体清单
2. 用三阶段流程抽取候选关系
3. 对多次采样做一致性校验并过滤
4. 归纳新出现的关系类型
5. 输出三元组并增量并入图谱

## 边界与不做

- 关系类型已固定、只需稳定抽取时，规则或模板方案成本更低，不必用本技能。
- 本技能产出候选关系与类型，不代替本体治理与实体消歧的最终裁决。
- 开放抽取会引入噪声，须保留一致性阈值与人工抽检环节。

## 技能关联

- **可组合**：Skill-OpenRE-LLM-Knowledge-Extraction

---

> 分类：数据与Agent平台/数据与AI运行/主数据治理　·　技术族：08-知识图谱　·　源卡：`Skill-OpenRE-LLM-Knowledge-Extraction`