---
name: "p2s-growth-dataagent-analytics"
title: "增长DataAgent分析 — LLM驱动的用户增长全链路智能诊断"
description: "触发词：增长诊断、激活率异常、LTV 下降归因、指标异动排查、根因下钻、优先级行动清单。何时不用：只算渠道获客贡献用「DTC 获客归因」；只预测流失概率用「客户流失预测」；只做常规取数与多步 BI 问答用「多步推理 BI」。安全边界：不得采集或落库个人身份信息，欧洲站与加州站须分别符合 GDPR 与 CCPA；诊断与行动建议须人工审核后再执行，模型不直接改预算或价格。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-062"
l3_business: "渠道经营分析"
l3_all: "渠道经营分析 / 月度经营复盘"
l1_l2_l3: "业务运营/渠道经营/渠道经营分析"
p2s_card_id: "Skill-Growth-DataAgent-Analytics"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "几分钟内定位激活率或 LTV 异动的根因，给出主因、次因和按优先级排的行动清单，替代过去两天的人工排查。"
user_try: "试试：本周新用户 7 日激活率从 22% 掉到 15%，帮我 5 分钟内定位主因和次因，并给出优先级行动清单。"
whenToUse: "已有周粒度增长指标与行为、推荐、渠道数据，要快速定位激活率或 LTV 异动根因时用；只算获客渠道贡献用「DTC 获客归因」，只预测流失用「客户流失预测」，只做 LTV 数值预测用「LTV 预测」，只做常规多步 BI 问答用「多步推理 BI」。"
workflow: "汇总周粒度增长指标与注册行为、推荐展示、渠道来源、库存等下钻维度 → 用滑动窗口均值与标准差算 z-score，标记异常周 → 按业务假设树逐维度验证，区分主因与次因 → 输出异常清单与按优先级排序的行动清单 → 保留人工审核环节后再执行动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 增长DataAgent分析 — LLM驱动的用户增长全链路智能诊断

## ① 解决的问题

增长团队面临"用户激活率下降12%需2天排查原因错过干预窗口"——Growth Agent5分钟自动诊断定位月龄匹配问题，激活率恢复年化价值约120万元

## ② 核心算法逻辑

增长分析的数据驱动困境：

## ③ 业务应用场景

场景A：新用户激活率异常自动诊断 - 业务问题：本周新用户7日激活率（7日内有第二次购买）从22%下降至15%，运营团队无从下手，需要等数据分析师排查 - 数据要求：用户注册和行为日志 + 推荐展示数据 + 渠道获取来源 + 产品库存状态 - 预期产出：Growth Agent在5分钟内完成诊断：主因是"0-3月月龄段新用户（占新增50%）的首页推荐与实际月龄不匹配（推荐了6+月产品）"，次因是"德国站新用户因翻译质量差导致首次使用体验下降"；输出优先级行动清单 - 业务价值：激活率从15%恢复至20%（5分钟定位 vs 2天人工），年化留存价值约120万元
三轨验证： - 成本：需接入用户行为日志、推荐系统API、渠道归因数据，数据采集和LLM推理成本约2000元/月（按日均100次诊断调用计）；需1名数据工程师1周完成数据管道搭建 - 合规：用户行为数据需符合GDPR（欧洲站）和CCPA（加州站）要求，不得采集个人身份信息（PII）；推荐展示数据需脱敏；渠道归因需遵守Amazon Attribution政策，避免跨站追踪违规 - 风险：若Agent误判根因（如将正常波动标记为异常），可能导致运营团队错误调整策略（如过早关闭高价值渠道）；LLM生成的行动建议若包含"降价促销"可能触发竞品价格战；建议保留人工审核环节
场景B：LTV下降趋势自动归因 - 业务问题：母婴出海产品近3个月LTV（180天）从$45下降至$38，运营团队怀疑是用户留存策略失效，但无法定位具体环节 - 数据要求：用户分群LTV数据 + 各渠道留存曲线 + 复购行为序列 + 促销活动记录 - 预期产出：Agent诊断出主因是"德国站3-6月月龄段用户因物流时效从5天延长至12天，导致复购率下降30%"，次因是"美国站新用户首单优惠券使用率下降（从45%降至28%）" - 业务价值：定位物流问题后，切换本地仓使LTV回升至$43，年化价值约200万元

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：激活率异常响应时间从2天→5分钟，每次激活率异常事件的损失减少约80%；按年均4次激活率异常事件，年化价值约120万元；减少数据分析师重复性工作约40小时/月
实施难度：⭐⭐⭐☆☆（异常检测简单；假设树和验证逻辑需要业务领域知识积累；接入LLM约1周）
优先级：⭐⭐⭐⭐⭐（修复06-增长↔09-DataAgent断层（1→10+边）；增长是业务最核心关注点）
评估依据：KDD 2024多个增长DataAgent实验验证；arXiv:2408.05061 AutoAnalysis在真实数据集上超越人工分析准确率；Amplitude/Mixpanel均在推进AI自动分析功能

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（148 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Growth-DataAgent-Analytics
增长DataAgent — LLM驱动的用户增长智能诊断

依赖：pip install numpy pandas scipy
"""

import numpy as np
import pandas as pd
from scipy import stats
from dataclasses import dataclass
from typing import Optional

np.random.seed(42)

# ── 1. 生成增长指标数据（含异常注入）────────────────────────────────
n_weeks = 20
weeks   = [f'W{i+1:02d}' for i in range(n_weeks)]

# 激活率：第17周异常下降
activation_rate = np.array([0.22, 0.21, 0.23, 0.22, 0.21, 0.23, 0.22, 0.23, 0.22, 0.21,
                              0.22, 0.23, 0.22, 0.21, 0.22, 0.23, 0.15, 0.16, 0.15, 0.16])

# 渠道质量分（高=好）
channel_quality = np.random.uniform(0.6, 0.9, n_weeks)
channel_quality[16:] = np.array([0.58, 0.57, 0.56, 0.55])  # 第17周渠道质量轻微下降

# 月龄匹配率
age_match_rate = np.random.uniform(0.72, 0.82, n_weeks)
age_match_rate[16:] = np.array([0.48, 0.47, 0.49, 0.48])  # 第17周月龄匹配大幅下降

df_growth = pd.DataFrame({
    'week': weeks,
    'activation_rate': activation_rate,
    'channel_quality': channel_quality,
    'age_match_rate':  age_match_rate,
})

# ── 2. 异常检测Agent ─────────────────────────────────────────────────
@dataclass
class Anomaly:
    metric:     str
    week:       str
    value:      float
    z_score:    float
    baseline:   float

class AnomalyDetectionAgent:
    def __init__(self, window: int = 8):
        self.window = window

    def detect(self, df: pd.DataFrame, col: str) -> list[Anomaly]:
        anomalies = []
        vals = df[col].values
        for i in range(self.window, len(vals)):
            window_vals = vals[i-self.window:i]
            mu, sigma = window_vals.mean(), window_vals.std()
            if sigma < 1e-9: continue
            z = (vals[i] - mu) / sigma
            if abs(z) > 2.0:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2408.05061，但该号在 arXiv 上是《A Jailbroken GenAI Model Can Cause Substantial Harm: GenAI-powered Applications are Vulnerable to PromptWares》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：周粒度指标表（week、activation_rate 等，卡页模板为 20 周），加上定位根因所需的下钻数据：用户注册与行为日志（含月龄段）、推荐展示数据（推荐月龄与实际月龄匹配率）、渠道获取来源与渠道质量分、产品库存状态；做 LTV 归因时另需用户分群 LTV、各渠道留存曲线、复购行为序列、促销活动记录与物流时效。下限：需有历史窗口做基线（模板为 8 周滑动窗口），窗口不足则算不出 z-score 与基线。

**输出**：异常清单（指标、周次、当前值、z-score、基线）加主因与次因诊断结论，再加按优先级排序的行动清单；供增长与运营团队在分钟级内定位激活率或 LTV 异动并决定干预动作，卡页口径为响应时间从 2 天缩短到 5 分钟。

## 执行步骤

1. 拉取周粒度增长指标与用户注册行为、推荐展示、渠道来源、库存数据
2. 用滑动窗口均值与标准差算 z-score，标出偏离基线的异常周
3. 按业务假设树逐维度下钻验证，区分主因与次因
4. 输出异常清单与按优先级排序的行动清单
5. 标注需人工审核的动作后再交运营执行

## 边界与不做

- 数据不满足：历史窗口不足（模板需 8 周基线）或缺推荐、渠道、库存等下钻维度时定位不到根因，先补齐数据与数据管道。
- 何时不用：只算获客渠道贡献用「DTC 获客归因」，只做 LTV 数值预测用「LTV 预测」，只做流失概率预测用「客户流失预测」，只做常规 BI 问答用「多步推理 BI」。
- 能力边界：只输出异常清单、主次因诊断与行动建议，不直接执行改预算、降价、关渠道等动作，也不替代数据分析师对结论的复核。
- 安全边界：行为数据不得含个人身份信息、推荐展示数据须脱敏；卡页标注误判风险（把正常波动判为异常）与降价建议触发价格战风险，须保留人工审核环节。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Streaming-Analytics-Agent.html、Skill-Streaming-Analytics-Agent、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model
- **延伸**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Streaming-Analytics-Agent.html、Skill-Streaming-Analytics-Agent、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model
- **可组合**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Multi-Step-Reasoning-BI.html、Skill-Multi-Step-Reasoning-BI、Skill-Viral-Marketing-Model.html、Skill-Viral-Marketing-Model、Skill-Growth-DataAgent-Analytics

---

> 分类：业务运营/渠道经营/渠道经营分析　·　技术族：06-增长模型　·　源卡：`Skill-Growth-DataAgent-Analytics`