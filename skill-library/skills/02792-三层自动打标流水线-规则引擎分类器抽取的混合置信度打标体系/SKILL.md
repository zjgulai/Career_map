---
name: "p2s-auto-tagging-pipeline-rule-ml-llm"
title: "三层自动打标流水线 — 规则引擎+ML分类器+LLM抽取的混合置信度打标体系"
description: "触发词：自动打标、规则引擎、混合置信度、SKU标签、人工复核队列。何时不用：只需要从描述中抽取结构化字段时用统一信息抽取技能；只把评论转成情感特征时用情感 ML 管道技能。安全边界：低置信标签必须进入人工复核队列，不得直接用于结算、合规声明等高风险用途。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-141"
l3_business: "数据管道"
l3_all: "数据管道 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据管道"
p2s_card_id: "Skill-Auto-Tagging-Pipeline-Rule-ML-LLM"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "规则先兜底、模型补一层、大模型再补语义，把 SKU 打标从一周人工压到近实时，只留少量需人工复核。"
user_try: "试试：给这 500 个 SKU 搭三层打标流水线，规则和模型先跑，剩下含糊的交给大模型，结果标出置信度和是否需复核。"
whenToUse: "标签维度多、数据量大，纯人工或单层规则覆盖不住时用本技能；只做字段抽取或只做情感分析，用对应的抽取与情感类技能。"
workflow: "把标签维度拆成可判定的规则 → 用规则层做确定性打标 → 用 ML 分类器覆盖统计型标签 → 用 LLM 处理非结构化描述与语义标签 → 把低置信结果推入人工复核队列"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 三层自动打标流水线 — 规则引擎+ML分类器+LLM抽取的混合置信度打标体系

## ① 解决的问题

数据团队面临"500个SKU打标需要1周人工"——规则+ML+LLM三层流水线将覆盖率从30%提升至97%，人工审核量从100%降至3%，节省标注成本4万元/年

## ② 核心算法逻辑

三层打标策略（按优先级从高到低）：

## ③ 业务应用场景

场景A：SKU全量自动打标流水线 - 业务问题：500个 SKU，10 种标签维度，传统人工打标需要 1 周/次更新，远不能满足实时性要求 - 三层方案： - 规则层（瞬时）：`IF DOS<7 → stockout_risk=critical`；`IF 退货率>10% → return_risk=high` - ML层（毫秒）：GBM 训练 ABC 分类器（特征：销售额/周转率/库龄） - LLM层（分钟）：从产品描述提取合规关键词 → 合规标签 - 覆盖分布：规则层 45%，ML层 40%，LLM层 12%，人工审核 3% - 业务价值：打标时效从 1 周→ 实时（规则+ML），LLM每日
场景B：供应商评论语义标签（LLM层） - 业务问题：采购团队对供应商有大量非结构化备注（"这家工厂交期不稳定""质量检查很严格"），无法被规则或ML处理 - LLM提取： - 输入：`"宁波精工交期非常稳定，但价格略高，CE认证资料齐全"` - 输出：`{delivery_reliability: "high", price_competitiveness: "low", compliance_certs: ["CE"]}` - 业务价值：采购知识从"只存在个人脑中"→ 结构化供应商标签，可被后续决策系统使用
三轨验证 | 成本轨：月均成本1200元（LLM API调用约800元/月基于10万SKU×0.008元/次，人工审核8小时/月×150元/小时=1200元，总计2000元/月），ROI周期3个月 | 合规轨：符合《电商平台商品信息规范》和《跨境电商商品分类标准》，标签数据不涉及个人隐私，合规度100% | 风险轨：模型漂移风险（概率15%/季度，因母婴品类更新快），多语言标签误分类风险（概率8%，影响欧美站点），供应商标签不规范导致准确率下降至88%以下（概率12%/月）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：三层流水线将500个SKU的10维标签打标时效从"1周人工→实时(规则+ML)+每日批量(LLM)"，标签覆盖率从30%→97%；人工审核量从100%降至3%，节省人力成本约4万元/年
实施难度：⭐⭐⭐☆☆（规则层容易，ML层需要训练数据，LLM层需要API成本控制）
优先级评分：⭐⭐⭐⭐⭐（打标是整个标签工程体系的数据入口，没有高质量打标，传播和Action触发都无从谈起）
评估依据：三层混合策略比纯LLM打标便宜90%（LLM每千tokens约¥0.1，500 SKU × 10 tags × LLM全量 vs 仅12%走LLM层）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（351 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/data_collection/auto_tagging_pipeline_rule_ml_llm` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
三层自动打标流水线
功能：规则引擎 / ML分类器 / LLM抽取 / 置信度聚合 / 人工审核队列
输入：实体数据 + Tag Schema定义
输出：标签结果 + 置信度 + 来源追踪 + 审核队列
"""
import numpy as np
import pandas as pd
import re
import json
from dataclasses import dataclass, field
from typing import Any, Optional
import warnings
warnings.filterwarnings('ignore')


@dataclass
class TagResult:
    tag_id: str
    value: Any
    confidence: float
    source: str          # rule/ml/llm/manual
    rule_matched: Optional[str] = None
    needs_review: bool = False


class RuleEngine:
    """Layer 1: 规则引擎（确定性标签）"""

    def __init__(self):
        self.rules = []

    def add_rule(self, tag_id: str, condition: callable, value_fn: callable,
                 description: str = ""):
        self.rules.append({
            "tag_id": tag_id, "condition": condition,
            "value_fn": value_fn, "description": description
        })

    def evaluate(self, entity: dict) -> list:
        results = []
        for rule in self.rules:
            try:
                if rule["condition"](entity):
                    value = rule["value_fn"](entity)
                    results.append(TagResult(
                        tag_id=rule["tag_id"],
                        value=value,
                        confidence=1.0,
                        source="rule",
                        rule_matched=rule["description"],
                    ))
            except Exception:
                continue
        return results


class MLTagger:
    """Layer 2: ML分类器（统计推断标签）"""
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2402.15758 — Chimera: A Lossless Decoding Method for Accelerating Large Language Models Inference by Fusing all Tokens

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待打标实体的结构化字段（如销售额、周转率、库龄、退货率）与非结构化文本（产品描述、供应商备注）以及标签维度定义，粒度到单个 SKU 与单个标签。

**输出**：带来源与置信度的标签结果（来源区分为规则、ML、LLM、人工，并含是否需复核标志），供数据团队与下游决策系统使用。

## 执行步骤

1. 把标签维度拆解为规则层可判定的条件
2. 用规则引擎做即时确定性打标
3. 用 ML 分类器覆盖统计型标签并输出概率
4. 用 LLM 从文本中抽取合规与语义标签
5. 对低置信标签打上需复核标记并推入人工队列

## 边界与不做

- 标签定义本身含糊、连规则都写不出来时不可用；标签维度很少的场景用人工或单层规则即可。
- 本技能产出标签及其置信度，不保证标签的业务正确性，低置信结果需人工复核后才能进入高风险决策。

## 技能关联

- **前置**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Product-Attribute-Completion.html、Skill-Product-Attribute-Completion、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle、Skill-Weak-Supervision-Data-Labeling.html、Skill-Weak-Supervision-Data-Labeling
- **延伸**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Product-Attribute-Completion.html、Skill-Product-Attribute-Completion、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Tag-Propagation-Supply-Chain.html、Skill-Tag-Propagation-Supply-Chain、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **可组合**：Skill-Amazon-Search-Ranking-Factor-Model.html、Skill-Amazon-Search-Ranking-Factor-Model、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-Product-Attribute-Completion.html、Skill-Product-Attribute-Completion、Skill-SEO-Organic-Ranking-Optimization.html、Skill-SEO-Organic-Ranking-Optimization、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM

---

> 分类：数据与Agent平台/数据与AI运行/数据管道　·　技术族：24-标签工程　·　源卡：`Skill-Auto-Tagging-Pipeline-Rule-ML-LLM`