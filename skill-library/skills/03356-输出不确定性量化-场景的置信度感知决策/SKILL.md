---
name: "p2s-llm-uncertainty-quantification-bi"
title: "LLM输出不确定性量化 — BI场景的置信度感知决策"
description: "触发词：置信度标注、不确定性量化、语义熵、Platt 校准、人工复核、BI 结论。何时不用：要为已执行的自动化决策补留痕时用「决策审计追踪本体」，要做对外文案违禁宣称检测时用「AIGC 内容合规审查」。安全边界：置信度标注仅限内部使用，低置信结论不得进入客服话术与对外营销文案。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-123"
l3_business: "证据复核"
l3_all: "证据复核"
l1_l2_l3: "独立控制/经营与组织/证据复核"
p2s_card_id: "Skill-LLM-Uncertainty-Quantification-BI"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "给 AI 日报的每个结论挂上可信度标签，高置信直接用、低置信自动转人工复核，别照着错数字做决策。"
user_try: "试试：给这份运营日报的每个关键数字标上置信度，低于 70% 的单独列出来让我复核。"
whenToUse: "LLM 生成的日报或选品结论需要区分可直接用与必须复核时用；要为自动化决策补审计留痕时用「决策审计追踪本体」；要做对外内容合规审查时用「AIGC 内容合规审查」。"
workflow: "对同一问题多次采样收集 LLM 回答 → 按语义等价分组计算语义熵作为不确定性信号 → 用历史标注数据做 Platt 校准修正过度自信 → 为每个关键数字与结论标注置信度 → 低于 70% 的结论自动触发人工核查"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM输出不确定性量化 — BI场景的置信度感知决策

## ① 解决的问题

运营面临"AI日报数字无法判断哪些可信哪些需复核"——语义熵+Platt校准为每个结论标注置信度，高置信直接使用低置信必核，年化避免AI错误决策损失约110万元

## ② 核心算法逻辑

问题：LLM回答"本月ROAS是多少"时总是自信满满，但有时答错。如何让LLM知道"我不确定这个答案"，并在不确定时主动告知用户？

## ③ 业务应用场景

场景A：运营日报数字的置信度标注 - 业务问题：DeepSeek驱动的运营日报，有时对"同比增长"方向判断错误（数据库里是日期维度导致的join问题），运营不知道哪些数字可信哪些要复核 - 数据要求：LLM生成的日报文本 + 用于校准的历史标注数据（各类型问题的正确率统计） - 预期产出：每个关键数字/结论都标注置信度（"本月ROAS 3.2 [95%置信]"、"同比增长12% [61%置信，建议复核]"），低于70%的自动触发人工核查 - 业务价值：高置信度答案（>85%）直接使用，减少人工核查约60%；低置信度答案（<70%）必须核查，防止决策错误，年化避免因AI错误数据导致的决策损失约8
三轨对抗验证： 1. 成本验证：语义不确定性需要多次采样（5-10次），API成本增加5-10倍，但只对重要决策问题使用，总成本可控（<500元/月） 2. 合规验证：置信度标注是内部工具，无合规风险；注意不要将"置信度低"的结论对外（如在客服/营销文案中）使用 3. 风险验证：校准模型可能过时（LLM更新后准确率分布变化）；建议每季度重新校准；语义等价判断本身也可能出错（NLI模型的局限）
场景B：选品分析Agent的不确定性透传 - 业务问题：选品Agent判断"婴儿监护器市场规模2.3亿美元"，但这个数字来自LLM的训练知识而非实时数据，不确定性高 - 方案：自动检测回答来源（知识型/检索型），知识型回答附加"数据可能截止2024年，建议查询实时数据" - 业务价值：防止基于过时数据的选品决策，年化避免选品错误损失约50万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：低置信度结论自动触发人工复核，防止基于错误AI数据决策，年化避免决策损失约80万元；高置信度答案（>85%）直接使用，减少人工核查60%，节省约30万元/年；总ROI约110万元/年
实施难度：⭐⭐⭐☆☆（语义熵需多次LLM调用，成本增加5-10倍；Platt校准需要历史标注数据）
优先级：⭐⭐⭐⭐☆（AI工具可信度是工业落地的关键瓶颈，不确定性标注是提升信任的最直接手段）
评估依据：ICLR 2023 Semantic Uncertainty论文验证语义熵比token-level熵更准确；ICLR 2024展示LLM自报置信度系统性高估约15-25%，校准是必要步骤；Google/Anthropic的内部评估系统均包含不确定性量化模块

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（180 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-LLM-Uncertainty-Quantification-BI
LLM输出不确定性量化 — BI场景置信度感知决策

依赖：pip install numpy pandas scikit-learn scipy
注意：生产环境需接入LLM API进行多次采样
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss
from scipy.special import expit  # sigmoid

np.random.seed(42)

# ── 1. 模拟LLM回答的不确定性信号 ─────────────────────────────────────
def simulate_llm_responses(question_type: str, n_samples: int = 5):
    """
    模拟同一问题的多次LLM采样（temperature>0）
    生产环境：替换为真实LLM API调用
    """
    if question_type == 'factual_number':
        # 数字型问题：LLM通常较确定
        base = np.random.normal(3.2, 0.1)
        responses = [f"ROAS是{base + np.random.normal(0, 0.05):.2f}" for _ in range(n_samples)]
        true_label = 1  # 正确的概率高
    elif question_type == 'trend_direction':
        # 趋势方向：LLM可能混淆方向
        directions = np.random.choice(['增长', '下降'], n_samples, p=[0.6, 0.4])
        responses = [f"同比{d}了X%" for d in directions]
        true_label = int(np.random.binomial(1, 0.65))  # 65%概率正确
    elif question_type == 'prediction':
        # 预测型：高度不确定
        values = np.random.normal(0, 1, n_samples)
        responses = [f"预计{'增长' if v>0 else '下降'}" for v in values]
        true_label = int(np.random.binomial(1, 0.52))  # 接近随机
    else:
        # 因果推断或其他：默认随机响应
        responses = [f"可能{'有' if np.random.random()>0.5 else '无'}因果关系" for _ in range(n_samples)]
        true_label = int(np.random.binomial(1, 0.58))
    return responses, true_label

# ── 2. 语义不确定性计算（简化版：基于回答多样性）────────────────────
def semantic_entropy(responses: list) -> float:
    """
    计算语义熵（语义不确定性）
    简化版：基于唯一回答比例（生产版用NLI模型判断语义等价）
    """
    # 简化的语义等价分组：相同关键词视为同一语义
    def extract_key_token(r):
        for kw in ['增长', '下降', '上升', '减少', '持平']:
            if kw in r: return kw
        # 数字型：四舍五入到一位小数
        import re
        nums = re.findall(r'\d+\.\d+', r)
        if nums: return str(round(float(nums[0]), 1))
        return r[:10]
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2306.13063 — Can LLMs Express Their Uncertainty? An Empirical Evaluation of Confidence Elicitation in LLMs

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：LLM 生成的日报文本或选品结论，以及用于校准的历史标注数据（各类型问题的正确率统计）；数字型与方向型问题需多次采样（temperature 大于 0，5-10 次）；粒度：单条结论或单个关键数字。

**输出**：每个关键数字与结论的置信度标注（如「本月 ROAS 3.2 [95% 置信]」「同比增长 12% [61% 置信，建议复核]」）；低于 70% 自动转人工核查，知识型回答附加数据时效提示，供运营日报解读与选品决策使用。

## 执行步骤

1. 对目标问题做多次 LLM 采样
2. 按语义等价分组计算语义熵
3. 用 Platt 校准把原始分数转成置信概率
4. 给结论与关键数字逐条标注置信度
5. 对低于 70% 的结论触发人工核查

## 边界与不做

- 数据不满足时不用：缺历史标注数据时校准无法拟合，只能给未校准的原始不确定性；非关键问题不值得付出多倍采样成本。
- 能力边界：只标注与分流置信度、不修正错误答案本身，且语义等价判断依赖 NLI 模型，本身也可能出错。
- 时效边界：LLM 更新后准确率分布会变化，校准模型需按季度重新校准，否则标注会失真。

## 技能关联

- **前置**：Skill-Agentic-ETL-Data-Pipeline.html、Skill-Agentic-ETL-Data-Pipeline、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-Model-Calibration.html、Skill-Model-Calibration
- **延伸**：Skill-Agentic-ETL-Data-Pipeline.html、Skill-Agentic-ETL-Data-Pipeline、Skill-Conformal-Prediction-Framework.html、Skill-Conformal-Prediction-Framework、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator
- **可组合**：Skill-Agentic-ETL-Data-Pipeline.html、Skill-Agentic-ETL-Data-Pipeline、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-as-Judge-Evaluator.html、Skill-LLM-as-Judge-Evaluator、Skill-LLM-Uncertainty-Quantification-BI

---

> 分类：独立控制/经营与组织/证据复核　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Uncertainty-Quantification-BI`