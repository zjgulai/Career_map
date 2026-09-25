---
name: "p2s-multi-step-reasoning-bi"
title: "多步推理BI分析 — LLM链式推理自动生成财务归因报告"
description: "触发词：多步推理、链式推理、代码辅助计算、利润归因报告、实时根因分析。何时不用：要多 Agent 分部门把差异落到责任部门用「多智能体 P&L 协同」；要阅读原始账单并做数值验证的财务解读用「财务报告解读 Agent」。安全边界：财务数据发给外部模型前须脱敏；对外报告须人工审核；数值计算交由代码执行，避免模型直接算错。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-016"
l3_business: "经济性分析"
l3_all: "经济性分析 / 月度经营复盘"
l1_l2_l3: "经营管理/财务与合规/经济性分析"
p2s_card_id: "Skill-Multi-Step-Reasoning-BI"
p2s_src_domain: "09-DataAgent-LLM"
quality_tier: "preview"
user_summary: "用链式推理加代码执行自动生成月度利润归因报告，先说清利润为什么变，再给具体 SKU 和数字佐证。"
user_try: "试试：解释本月利润为什么下降 15%，拆成 GMV、退款率和 FBA 费用各自的贡献并给出佐证数字。"
whenToUse: "需要自动生成带推理链与代码核算的月度归因报告时用本技能；多 Agent 分部门归因用「多智能体 P&L 协同」；多平台账单解读与验证用「财务报告解读 Agent」。"
workflow: "从数据仓库取结构化财务数据，含 GMV、退款、FBA 费、广告费与物流费 → 按多步推理链把利润变化逐层分解到指标 → 用代码执行完成每一步数值计算 → 生成标准化归因报告并标注佐证 SKU 与数字 → 遇到异常步骤时停止并告警"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 多步推理BI分析 — LLM链式推理自动生成财务归因报告

## ① 解决的问题

财务团队面临"月度P&L归因报告需2天人工分析且框架不一致"——CoT+PAL多步推理链20分钟自动生成可信归因报告，年化节省80万元

## ② 核心算法逻辑

问题：运营问"为什么这个月利润下降了15%？"——这需要多步推理：

## ③ 业务应用场景

场景A：月度P&L自动归因报告 - 业务问题：每月底需要生成"利润分析报告"，当前需要财务/数据分析师花4小时手工查数据+撰写，且分析框架不一致 - 数据要求：结构化财务数据（各SKU/渠道/地区的GMV、退款、FBA费、广告费、物流费）；接入LLM API（DeepSeek/GPT） - 预期产出：3分钟内生成：总利润变化-15%→拆解为GMV-8%（主因：德国站流量下滑）+退款率+2%（次因：某款奶粉投诉增加）+FBA费+3%（次因：仓储超期）；每项有具体SKU/数字佐证 - 业务价值：4小时→3分钟分析（节省人力约10万元/年）；分析框架标准化（错误率从15%降至3%）；同一套逻辑每周/
三轨对抗验证： 1. 成本验证：每次报告约5000-10000 tokens（DeepSeek约0.1元/次）；每月30次=3元/月，极低成本 2. 合规验证：发送给LLM API的财务数据需要做脱敏（SKU名称替换为ID，金额做模糊处理）；对外发布的报告需人工审核确认 3. 风险验证：LLM在复杂数值计算上容易出错（加减乘除可能算错）→ 用PAL让Python执行计算，LLM只负责逻辑和叙事；多步推理中如果某步骤数据异常，需要有"停止并告警"机制
场景B：广告ROAS下滑根因实时分析 - 业务问题：广告系统检测到ROAS下滑12%，需要快速（30分钟内）定位是出价问题/素材问题/定向问题还是竞争环境变化 - 方案：ReAct框架自动查询广告维度数据，逐步缩小嫌疑范围，生成诊断报告 - 业务价值：响应时间从2天（等数据分析师排期）到30分钟，避免大促期间广告预算浪费约20万元/次

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月度P&L归因报告从4小时→3分钟（节省财务/数据工程师人力约10万元/年）；标准化框架减少错误（从15%→3%，避免决策失误约30万元/年）；支持每日/实时报告，发现异常提前约3天
实施难度：⭐⭐⭐☆☆（框架设计1周，LLM API接入1-2天；主要挑战是数据标准化和提示词工程）
优先级：⭐⭐⭐⭐⭐（财务归因是高频高价值需求，每个有数字化运营的团队都需要；直接连接LLM和数据仓库即可落地）
评估依据：NeurIPS 2022 CoT论文引用量10000+；ICML 2023 PAL证明代码辅助推理精度比纯文本提升30%+；Stripe/Airbnb/Amazon内部均有类似多步推理财务分析系统

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（206 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after class definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：3」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Multi-Step-Reasoning-BI
多步推理BI分析 — PAL+CoT利润归因自动报告

依赖：pip install numpy pandas
注意：生产环境需接入LLM API；此处展示多步推理框架设计
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Any, Callable

np.random.seed(42)

# ── 1. 模拟财务数据（P&L数据库）─────────────────────────────────────
def get_pl_data(month: str) -> dict:
    """模拟获取P&L数据（生产环境连接数据仓库）"""
    if month == '2026-06':
        return {
            'gmv_usd':       285000,
            'refund_usd':    18500,
            'fba_fee_usd':   42000,
            'ad_spend_usd':  38000,
            'logistics_usd': 22000,
            'cogs_usd':      85000,
            'other_cost':    12000,
        }
    elif month == '2026-05':
        return {
            'gmv_usd':       335000,
            'refund_usd':    15000,
            'fba_fee_usd':   38000,
            'ad_spend_usd':  35000,
            'logistics_usd': 20000,
            'cogs_usd':      95000,
            'other_cost':    11000,
        }
    else:
        raise ValueError(f"Unknown month: {month}")

def compute_profit(pl: dict) -> float:
    """计算净利润（Python执行，精确）"""
    revenue_net = pl['gmv_usd'] - pl['refund_usd']
    total_cost  = (pl['fba_fee_usd'] + pl['ad_spend_usd']
                   + pl['logistics_usd'] + pl['cogs_usd'] + pl['other_cost'])
    return revenue_net - total_cost

def get_sku_breakdown(month: str) -> pd.DataFrame:
    """模拟SKU级GMV数据"""
    skus = ['stroller-A', 'pump-B', 'formula-C', 'monitor-D', 'diaper-E']
    if month == '2026-06':
        gmv = [62000, 45000, 88000, 38000, 52000]
    else:
        gmv = [78000, 47000, 99000, 42000, 69000]
    return pd.DataFrame({'sku': skus, 'gmv_usd': gmv})

# ── 2. 多步推理框架（ReAct + PAL）────────────────────────────────────
@dataclass
class Step:
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2211.10435 — PAL: Program-aided Language Models

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：结构化财务数据：各 SKU、渠道与地区的 GMV、退款、FBA 费、广告费与物流费，以及可调用的 LLM API。

**输出**：3 分钟内生成的利润归因报告：主因与次因、各因素贡献与具体 SKU 数字佐证，以及异常时的告警，供财务与运营复盘。

## 执行步骤

1. 取结构化财务数据作为输入
2. 按推理链把利润变化逐层拆到指标
3. 用代码执行完成各步数值计算
4. 生成标准化归因报告并附数字佐证
5. 对异常步骤停止并告警后交人工复核

## 边界与不做

- 数据未结构化或各平台口径不统一时不适用，推理链会在第一步断裂
- 模型不直接做数值计算，计算必须交由代码执行；对外发布前须人工审核
- 财务数据发给外部模型前须脱敏，模型只负责逻辑与叙事

## 技能关联

- **前置**：Skill-LLM-Business-Intelligence-Reasoning.html、Skill-LLM-Business-Intelligence-Reasoning、Skill-LLM-Financial-Report-Analyst.html、Skill-LLM-Financial-Report-Analyst、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **延伸**：Skill-LLM-Financial-Report-Analyst.html、Skill-LLM-Financial-Report-Analyst、Skill-LLM-Hallucination-Detection-BI.html、Skill-LLM-Hallucination-Detection-BI、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis
- **可组合**：Skill-LLM-Financial-Report-Analyst.html、Skill-LLM-Financial-Report-Analyst、Skill-PL-Attribution-Analysis.html、Skill-PL-Attribution-Analysis、Skill-ProRCA-Business-Analysis.html、Skill-ProRCA-Business-Analysis、Skill-Multi-Step-Reasoning-BI

---

> 分类：经营管理/财务与合规/经济性分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-Multi-Step-Reasoning-BI`