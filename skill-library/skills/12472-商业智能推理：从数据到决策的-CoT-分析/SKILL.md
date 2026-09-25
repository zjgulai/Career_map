---
name: "p2s-llm-business-intelligence-reasoning"
title: "LLM Business Intelligence Reasoning — LLM 商业智能推理：从数据到决策的 CoT 分析"
description: "触发词：经营复盘、CoT 推理、异常解释、周报分析、指标归因。何时不用：只要自动生成报表文本用「LLM 电商报表自动化」；要做目标达成与差异分解用「生意规模三维 KPI 监控」。安全边界：指标数字必须由代码计算并校验后传入，LLM 不得自行生成或推算数字。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-003"
l3_business: "月度经营复盘"
l3_all: "月度经营复盘 / 经营预测"
l1_l2_l3: "经营管理/经营与组织/月度经营复盘"
p2s_card_id: "Skill-LLM-Business-Intelligence-Reasoning"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "把上周多维度数据交给 LLM 按链条推理，自动写出异常、假设、结论和建议的复盘分析。"
user_try: "试试：用上周销量、ROAS、退货率、库存天数数据帮我做一页纸复盘，并解释退货率上升的原因。"
whenToUse: "当要在周度或月度复盘里把数据变成假设、验证、建议的推理链条时用本技能；只要报表文本自动生成，用「LLM 电商报表自动化」；要做目标达成率与差异分解，用「生意规模三维 KPI 监控」。"
workflow: "把各指标整理为快照并计算环比与是否异常 → 拼装 CoT 提示词（数据摘要、外部信号、推理框架） → 让 LLM 按异常、假设、结论、建议输出分析 → 任一指标异常时自动触发深度分析并生成汇报素材"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LLM Business Intelligence Reasoning — LLM 商业智能推理：从数据到决策的 CoT 分析

## ① 解决的问题

运营每周一分析多维度数据准备汇报需要3-4小时，异常出现时根因分析需1-2天——LLM Chain-of-Thought推理将数据→假设→验证→建议自动化，周报分析15分钟完成年化节省人力20-50万元

## ② 核心算法逻辑

传统 BI vs LLM 推理 BI：

## ③ 业务应用场景

业务问题：运营每周一需要分析上周多维度数据（销量/广告/库存/评论/退货率），准备会议汇报需要 3-4 小时。如果这周出现异常（某 ASIN 退货率突然上升），分析原因需要额外 1-2 天。
数据要求： - 标准化的指标 JSON（销量/ROAS/退货率/库存天数/评论均分） - 历史基准（过去4周均值） - 外部信号（竞品价格变化/平台公告/季节日历）
预期产出： - 自动化周报：一页纸的结构化分析（异常→假设→结论→建议） - 异常解释：当任一指标异常时，自动触发深度分析 - 会议 Deck 素材：可直接用于汇报的关键洞察文字

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
周报分析时间：3-4 小时 → 15 分钟，年化节省 ¥10-25 万（人力成本）
异常响应速度：1-2 天 → 1 小时，快速响应减少异常持续损失 ¥5-15 万/年
决策质量：结构化 CoT 比直觉更系统，错误决策减少 20-30%
年化综合 ROI：¥20-50 万
实施难度：⭐⭐☆☆☆（CoT 提示词工程 + LLM API 接入；规则化版本 1 周，LLM 版本约 2-3 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（161 行）。**下面 58 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，58 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_agent_llm/llm_business_intelligence_reasoning` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-LLM-Business-Intelligence-Reasoning.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LLM Business Intelligence Reasoning
LLM Chain-of-Thought 商业智能推理：数据→决策
（本实现为规则化CoT模拟，生产替换为LLM API调用）
"""
import json
from dataclasses import dataclass


@dataclass
class MetricSnapshot:
    """单指标快照"""
    name: str
    current: float
    baseline: float
    unit: str = ''

    @property
    def change_pct(self):
        return (self.current - self.baseline) / (abs(self.baseline) + 1e-8) * 100

    @property
    def is_anomaly(self):
        return abs(self.change_pct) > 15  # 偏离15%以上为异常

    @property
    def direction(self):
        return '↑升' if self.current > self.baseline else '↓降'


def build_cot_prompt(metrics: list[MetricSnapshot], external_signals: dict) -> str:
    """构建 CoT 推理提示词"""
    anomalies = [m for m in metrics if m.is_anomaly]
    prompt_parts = []

    # 数据摘要
    prompt_parts.append('=== 本周业务数据摘要 ===')
    for m in metrics:
        flag = '⚠️ ' if m.is_anomaly else '  '
        prompt_parts.append(f'{flag}{m.name}: {m.current:.2f}{m.unit} (基准 {m.baseline:.2f}, {m.change_pct:+.1f}%)')

    # 外部信号
    if external_signals:
        prompt_parts.append('\n=== 外部信号 ===')
        for signal, value in external_signals.items():
            prompt_parts.append(f'{signal}: {value}')

    # CoT 推理框架
    prompt_parts.append('\n=== Chain-of-Thought 分析 ===')
    prompt_parts.append(f'异常指标: {[m.name for m in anomalies]}')
    prompt_parts.append('请按以下步骤推理:')
    prompt_parts.append('Step 1 - 异常识别: 哪些指标偏离最大？')
    prompt_parts.append('Step 2 - 假设生成: 可能原因（3-5个，按概率排序）')
    prompt_parts.append('Step 3 - 证据检验: 结合外部信号验证假设')
    prompt_parts.append('Step 4 - 根因定位: 最可能的主要根因')
    prompt_parts.append('Step 5 - 行动建议: P0/P1/P2 优先级行动清单')

    return '\n'.join(prompt_parts)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.09783，但该号在 arXiv 上是《Infinite families of optimal and minimal codes over rings using simplicial complexes》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：标准化的指标 JSON（销量、ROAS、退货率、库存天数、评论均分）、历史基准（过去 4 周均值）、外部信号（竞品价格变化、平台公告、季节日历）。

**输出**：一页纸结构化分析（异常、假设、结论、建议）、异常深度解释与可直接用于汇报的关键洞察文字；供运营与管理层汇报使用。

## 执行步骤

1. 把各指标整理为快照并计算环比与是否异常
2. 拼装 CoT 提示词（数据摘要、外部信号、推理框架）
3. 让 LLM 按异常、假设、结论、建议输出分析
4. 任一指标异常时自动触发深度分析并生成汇报素材

## 边界与不做

- 数据不满足：指标未标准化或没有历史基准时推理会失真，先补基准口径。
- 何时不用：只要报表文本生成用「LLM 电商报表自动化」；要做目标达成差异分解用「生意规模三维 KPI 监控」；要判断异常根因链路用「ProRCA」。
- 能力边界：只做分析与叙述，不执行运营动作，也不替代根因取证与实验验证。
- 安全边界：指标数字必须由代码计算并校验后传入，LLM 不得自行生成或推算数字（卡页以数字由代码生成、LLM 仅写叙述来规避幻觉）。

## 技能关联

- **前置**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-Anomaly-Detection-Foundation-Model.html、Skill-Anomaly-Detection-Foundation-Model、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-LLM-Business-Intelligence-Reasoning

---

> 分类：经营管理/经营与组织/月度经营复盘　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-LLM-Business-Intelligence-Reasoning`