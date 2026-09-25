---
name: "p2s-amazon-tos-compliance-guardrail"
title: "Amazon ToS Compliance Guardrail（亚马逊合规护栏）"
description: "触发词：Amazon ToS、违禁声明、医疗声明、无证认证、保证性用语、强制覆盖。何时不用：要跨 FDA/CPSC/FTC/平台四套规则做复合扫描时用「合规知识图谱实时监控」，要比较多市场广告法规差异时用「多市场广告文案合规矩阵」。安全边界：风险分高于阈值时强制覆盖原文案，不得未经复核直接发布。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-132"
l3_business: "宣称审查"
l3_all: "宣称审查 / 规则监测"
l1_l2_l3: "独立控制/财务与合规/宣称审查"
p2s_card_id: "Skill-Amazon-ToS-Compliance-Guardrail"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大模型写的吸奶器文案里塞了 clinically proven、FDA approved 这类红线词，发出去前先拦下并给出安全替代表达。"
user_try: "试试：扫一下这段吸奶器 Listing 文案，列出违规声明并直接给我安全改写版本。"
whenToUse: "用大模型生成或改写 Listing 文案、需在发布前按平台条款拦截违规声明时用；要跨多套监管与平台规则做复合扫描时用「合规知识图谱实时监控」；要比较多市场广告法规差异时用「多市场广告文案合规矩阵」。"
workflow: "准备待审文案与 Amazon ToS 结构化规则库 → 按高危关键词与正则规则扫描违规声明 → 计算综合风险分并分级 → 对高风险文案强制覆盖为安全表达 → 输出合规扫描报告与修正建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Amazon ToS Compliance Guardrail（亚马逊合规护栏）

## ① 解决的问题

业务问题：运营用 ChatGPT 生成吸奶器 listing 文案，但 LLM 可能产出违规声明——"clinically proven to increase milk supply""FDA approved design""guaranteed results in 7 days"——这些在 Amazon 上都是红线

## ② 核心算法逻辑

LLM 在生成商品文案、广告文案、客服回复时可能无意间违反平台规则（医疗声明、安全认证、受限品类）。Compliance Guardrail 在 LLM 输出端建立三层过滤——从确定性规则匹配到风险评分到人工升级——确保所有面向亚马逊的内容合规。

## ③ 业务应用场景

业务问题：运营用 ChatGPT 生成吸奶器 listing 文案，但 LLM 可能产出违规声明——"clinically proven to increase milk supply""FDA approved design""guaranteed results in 7 days"——这些在 Amazon 上都是红线。
数据要求： - Amazon ToS 结构化规则库：医疗声明（禁止）、安全认证（需有证才能声明）、对比广告（按辖区不同） - EVADE-Bench 风格的多规则 prompt 模板
预期产出： - 合规扫描报告：原文案 3 处违规（医疗声明 × 1 / 无证认证声明 × 1 / 保证性用语 × 1） - 自动修正建议：将"clinically proven"替换为"designed for comfort"、"FDA approved"替换为"meets safety standards" - 风险分级：该 listing 综合风险分 0.72 → 强制覆盖（不送人工）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：拦截违规 listing 下架（$2,000-5,000/次 × 15 次/年）+ 账号健康保护；年化止损 5-10 万美元 + 无形风险规避
实施难度：⭐⭐☆☆☆（2 星）— 基于规则的初版可快速上线，ML 风险分类器需要训练数据
优先级评分：⭐⭐⭐⭐⭐（5 星）— 极高紧迫度（合规），账号安全是业务的底线
评估依据：SAFE-AGENT-L 三层框架直接可落地，EVADE-Bench 提供 26 个 LLM 的电商合规评测基线

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（129 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'for' statement on line 59）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/advertising/amazon_tos_compliance_guardrail` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-Amazon-ToS-Compliance-Guardrail.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Amazon ToS Compliance Guardrail — 三层合规过滤器
基于 SAFE-AGENT-L 框架
"""

import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass


@dataclass
class ComplianceResult:
    risk_score: float
    violations: List[Dict]
    action: str  # "pass" | "override" | "escalate" | "fallback"
    safe_text: Optional[str] = None


class ToSComplianceGuardrail:
    """亚马逊 ToS 合规护栏"""
    
    # 高危关键词 + 正则规则（母婴品类）
    FORBIDDEN_PATTERNS = [
        (r'(?i)FDA\s*approved', 'medical_certification', 0.9),
        (r'(?i)clinically\s*proven', 'medical_claim', 0.9),
        (r'(?i)guaranteed\s*(result|effect|outcome)', 'guarantee_claim', 0.85),
        (r'(?i)(treat|cure|heal|prevent)\s+\w+\s+(disease|condition)', 'medical_treatment', 0.95),
        (r'(?i)(increase|boost)\s+(milk|breast\s*milk)\s*(supply|production)', 'medical_efficacy', 0.8),
        (r'(?i)safe\s+for\s+(premature|newborn|infant)', 'safety_claim', 0.85),
        (r'(?i)#1\s+(rated|selling|recommended)', 'unsubstantiated_ranking', 0.7),
        (r'(?i)(free|100%|no)\s+(risk|side\s*effect)', 'absolute_claim', 0.85),
    ]
    
    # 安全替换模板
    SAFE_TEMPLATES = {
        'medical_claim': '[已移除医疗声明] 产品设计注重舒适性和易用性。',
        'medical_certification': '产品已通过相关安全标准检测。',
        'medical_efficacy': '产品设计旨在提供舒适的吸乳体验。',
        'medical_treatment': '[已移除治疗声明] 如有健康问题请咨询医生。',
        'safety_claim': '产品按照安全标准制造。具体使用请遵循说明书。',
        'guarantee_claim': '我们致力于提供优质产品和服务。',
        'absolute_claim': '我们提供满意的客户体验。',
    }
    
    def __init__(self, low_risk: float = 0.3, high_risk: float = 0.7):
        self.low_risk = low_risk
        self.high_risk = high_risk
    
    def scan_text(self, text: str) -> ComplianceResult:
        """
        扫描文本，返回合规评估结果
        """
        violations = []
        max_risk = 0.0
        override_text = text
        
        for pattern, category, base_risk in self.FORBIDDEN_PATTERNS:
            matches = re.finditer(pattern, text)
            for match in matches:
                # 上下文加权：句子越长越可能是复杂声明 → 风险微增
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2505.17654，但该号在 arXiv 上是《EVADE-Bench: Multimodal Benchmark for Evaluating and Enhancing Evasive Content Detection》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：待审 Listing 文案文本、Amazon ToS 结构化规则库（医疗声明禁用、安全认证需有证才能声明、对比广告按辖区不同）、EVADE-Bench 风格的多规则 prompt 模板；粒度：单条 Listing 文案。

**输出**：合规扫描报告（如原文案 3 处违规：医疗声明 1、无证认证声明 1、保证性用语 1）、自动修正建议（如 clinically proven 替换为 designed for comfort、FDA approved 替换为 meets safety standards）、综合风险分与动作（pass/override/escalate/fallback，如风险分 0.72 触发强制覆盖）；供运营在发布前落地。

## 执行步骤

1. 准备待审文案与 ToS 规则库
2. 按高危正则规则扫描违规声明
3. 计算综合风险分并分级
4. 对高风险文案强制覆盖为安全表达
5. 输出扫描报告与修正建议

## 边界与不做

- 数据不满足时不用：规则库未随平台政策更新、或文案缺上下文时，风险判定会漏项。
- 能力边界：只做规则匹配、风险打分与文本替换，不代替平台审核判定，也不保证改写后一定通过审核。
- 执行边界：高风险文案默认强制覆盖而非转人工，覆盖动作须留痕并保留原文案以便回溯。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model
- **延伸**：Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-Negative-Keyword-Safe-Guard.html、Skill-Negative-Keyword-Safe-Guard、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model
- **可组合**：Skill-DialIn-LLM-Case-Intent-Clustering.html、Skill-DialIn-LLM-Case-Intent-Clustering、Skill-LACA-CrossLingual-ABSA.html、Skill-LACA-CrossLingual-ABSA、Skill-Supplier-Evaluation-Model.html、Skill-Supplier-Evaluation-Model、Skill-Amazon-ToS-Compliance-Guardrail

---

> 分类：独立控制/财务与合规/宣称审查　·　技术族：13-广告分析　·　源卡：`Skill-Amazon-ToS-Compliance-Guardrail`