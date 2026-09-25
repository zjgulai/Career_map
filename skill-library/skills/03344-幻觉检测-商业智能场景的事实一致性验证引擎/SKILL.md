---
name: "p2s-llm-hallucination-detection-bi"
title: "LLM幻觉检测 — 商业智能场景的事实一致性验证引擎"
description: "触发词：幻觉检测、事实一致性、BI 报表核验、数字对账、来源分级。何时不用：要评知识库检索与回答质量走 RAG 评测；要做论文级原子声明核查走声明级核查流水线。安全边界：检测结果不可直接对外公开（如 AI 报告含多少幻觉会引发舆论风险），判为错误的关键决策数字须触发人工复核而非自动拦截。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 证据复核"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-LLM-Hallucination-Detection-BI"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "逐句核对 AI 日报里的数字与真实数据，标出可信、存疑和错误。"
user_try: "试试：把这份 AI 运营日报里的每个数字和数据库对一遍，标出哪些有问题。"
whenToUse: "AI 生成的报告要进入决策流程、数字出错代价很高时用；要评知识库检索质量请转 RAG 评测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM幻觉检测 — 商业智能场景的事实一致性验证引擎

## ① 解决的问题

DataAgent运营面临"AI日报数字偶发错误损害工具可信度"——多层事实核查使幻觉检测TPR达82%，避免月均3-5起决策失误，年化预防损失约200万元

## ② 核心算法逻辑

LLM幻觉（Hallucination）指模型生成"流畅但事实错误"的输出。在BI场景中危害尤为严重：AI分析报告声称"本月ROAS提升12%"但数据库显示下降3%，或AI建议"增加婴儿车类目备货30%"实为虚构的市场趋势。

## ③ 业务应用场景

场景A：AI日报事实一致性自动校验 - 业务问题：DataAgent每天自动生成"母婴SKU运营日报"（DeepSeek驱动），偶发数字错误（如将"环比-5%"描述为"环比+5%"），CEO直接看到错误数据做决策，严重损害AI工具可信度 - 数据要求：AI生成的日报文本 + 原始数据库/API返回的真实数字（SQL查询结果作为ground truth） - 预期产出：自动标注日报中每个数字陈述的"可信/存疑/错误"标签，对"存疑"项附上ground truth值 - 业务价值：发现幻觉准确率TPR达82%，误报率（将正确数字标为错误）控制在8%以内，日报可信度提升至"90%+经过验证"，AI工
三轨对抗验证： 1. 成本验证：每篇日报检测约0.8秒，API调用成本约0.02元/篇，可行；但需要维护SQL查询接口作为ground truth来源，初期接入成本约2人周 2. 合规验证：幻觉检测系统本身不涉及平台规则；注意检测结果不可直接对外公开（"AI报告含XX%幻觉"可能引发舆论风险） 3. 风险验证：检测系统自身也可能出错（meta-hallucination）；对于检测结果"错误"的关键决策数字，应触发人工复核而非自动拦截
场景B：选品Agent推荐的市场数据核查 - 业务问题：选品Agent引用"某品类市场规模2.3亿美元"，但该数字无从溯源，可能是LLM幻觉 - 数据要求：Agent输出文本 + Jungle Scout/Helium 10 API实时数据 + arXiv/行业报告摘录数据库 - 预期产出：对每项市场数据声明，返回"有来源/可疑/无法验证"三档评级 + 可追溯的数据来源链接 - 业务价值：减少选品决策中约40%的虚假市场数据引用，降低进入错误品类的风险

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：每月避免3-5起因LLM幻觉导致的错误决策，每起预估损失10-50万元，年化避免损失约200万元；AI工具可信度提升使工具使用率从60%提升至85%，间接带动运营效率提升约15%
实施难度：⭐⭐⭐☆☆（规则+API核查方案1周可上线；深度内部表示方法需ML工程师投入2-3周）
优先级：⭐⭐⭐⭐⭐（DataAgent部署后的必要安全层，无幻觉检测的AI报告不可直接入决策流程）
评估依据：ICLR 2026 RAGLens证明幻觉检测AUC可达0.89+；UniFact框架表明混合方法比单一方法提升8-15%；母婴跨境电商决策数字错误的容忍度极低（直接影响备货/广告支出）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（199 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-LLM-Hallucination-Detection-BI
BI场景LLM幻觉检测 — 事实一致性验证引擎

依赖：pip install numpy pandas re
注意：生产环境需接入 DeepSeek/OpenAI API 和业务数据库
"""

import re
import json
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Optional

# ── 1. 数据结构定义 ─────────────────────────────────────────────────
@dataclass
class FactClaim:
    """从LLM输出中提取的单条事实声明"""
    text: str           # 原文片段
    claim_type: str     # 'percentage', 'absolute', 'trend', 'comparison'
    value: float        # 提取的数值
    metric: str         # 指标名称（如 ROAS, GMV, 库存）
    unit: str           # 单位

@dataclass
class VerificationResult:
    """单条声明的核查结果"""
    claim: FactClaim
    ground_truth: Optional[float]
    status: str         # 'verified', 'suspicious', 'hallucination', 'unverifiable'
    deviation: Optional[float]  # 与ground truth的偏差
    explanation: str

# ── 2. 事实抽取器（规则 + 正则）──────────────────────────────────────
class FactExtractor:
    """从LLM报告文本中抽取数字性事实声明"""

    PATTERNS = {
        'percentage': r'([\w\s]+?)[：:]\s*([+-]?\d+\.?\d*)\s*%',
        'absolute':   r'([\w\s]+?)[：:]\s*([+-]?\d+\.?\d*)\s*(件|万元|元|USD|\$)',
        'change':     r'([\w\s]+?)(?:环比|同比|较上[月周])[：:\s]*([+-]?\d+\.?\d*)\s*%',
    }

    def extract(self, text: str) -> list[FactClaim]:
        claims = []
        for claim_type, pattern in self.PATTERNS.items():
            for match in re.finditer(pattern, text):
                metric = match.group(1).strip()
                value  = float(match.group(2))
                unit   = match.group(3) if len(match.groups()) >= 3 else '%'
                claims.append(FactClaim(
                    text=match.group(0),
                    claim_type=claim_type,
                    value=value,
                    metric=metric,
                    unit=unit
                ))
        return claims
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2512.02772 — Towards Unification of Hallucination Detection and Fact Verification for Large Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：AI 生成文本（日报、Agent 输出），以及可作为事实基准的原始数据（SQL 查询结果、业务 API 返回值）

**输出**：逐条声明的可信/存疑/错误标注与基准值对照；市场数据类声明输出有来源、可疑、无法验证三档评级

## 执行步骤

1. 从生成文本中抽取数字型事实声明。
2. 用原始数据库或 API 返回值作为基准做逐条比对。
3. 给每条声明打可信、存疑或错误标签，存疑项附上真实值。
4. 对判为错误的关键决策数字触发人工复核，而不是自动拦截或改写。

## 边界与不做

- 何时不用：要评的是知识库检索与回答质量时请转 RAG 评测；要做论文级原子声明核查请转声明级核查流水线。
- 能力边界：检测系统自身也可能出错（元幻觉），错误判定必须走人工复核。
- 安全边界：检测结果不可直接对外公开（如 AI 报告含多少幻觉会引发舆论风险），仅用于内部改进与复核。

## 技能关联

- **前置**：Skill-Agent-Capability-Evaluation.html、Skill-Agent-Capability-Evaluation、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Uncertainty-Quantification-BI.html、Skill-LLM-Uncertainty-Quantification-BI、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-RAG-Enhanced-Data-Analysis.html、Skill-RAG-Enhanced-Data-Analysis、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-Agent-Capability-Evaluation.html、Skill-Agent-Capability-Evaluation、Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-LLM-Uncertainty-Quantification-BI.html、Skill-LLM-Uncertainty-Quantification-BI、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **可组合**：Skill-LLM-Annotation-Weak-Supervision.html、Skill-LLM-Annotation-Weak-Supervision、Skill-LLM-Uncertainty-Quantification-BI.html、Skill-LLM-Uncertainty-Quantification-BI、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL、Skill-LLM-Hallucination-Detection-BI

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Hallucination-Detection-BI`