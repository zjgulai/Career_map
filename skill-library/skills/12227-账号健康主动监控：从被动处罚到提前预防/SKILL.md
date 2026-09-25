---
name: "p2s-account-health-proactive-monitor"
title: "Account Health Proactive Monitor — 账号健康主动监控：从被动处罚到提前预防"
description: "触发词：账号健康监控、主动预警、环比恶化、广告联动、旺季体检。何时不用：只需要阈值型多指标预警曲线用「账号健康预警系统」；要算账号间关联风险用「账号关联检测」。安全边界：联动建议只给到广告与库存调整方向，实际调预算须人工确认；健康判定依赖 Seller Central 报表完整性，数据有缺口时不得当作健康结论。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Account-Health-Proactive-Monitor"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "每天看账号健康报表，指标一恶化就提前报警，顺手给出该不该收广告、要不要补库存的动作建议。"
user_try: "试试：用我这个月的账号健康报告做一次体检，找出 7 日环比恶化超过 15% 的指标，并给出广告调整建议。"
whenToUse: "当需要把账号健康报表与广告报告放在一起看、指标恶化时同步给出经营联动动作（如降广告预算）时用本技能；只要阈值化的指标预警用「账号健康预警系统」；风险来自多账号关联判定用「账号关联检测」。"
workflow: "按日拉取账号健康报告与 ASIN 差评、投诉记录 → 补齐广告报告（ACOS/CTR/转化率）做联动分析 → 计算各指标 7 日环比，恶化超阈值即告警 → 输出实时健康仪表盘与距阈值百分比 → 生成广告预算与库存的联动调整建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Account Health Proactive Monitor — 账号健康主动监控：从被动处罚到提前预防

## ① 解决的问题

去年黑五账号ODR从0.6%升至1.2%接到Amazon警告广告暂停48小时损失15万但事前无任何预警——账号健康主动监控提前7-14天发现趋势恶化并联动降低广告预算年化避免封号损失30-100万元

## ② 核心算法逻辑

Amazon 账号健康 = 多维度综合评分：

## ③ 业务应用场景

业务问题：去年黑五期间，某 ASIN 的客诉缺陷率（ODR）从 0.6% 快速升到 1.2%（超过 1% 警戒线），导致账号收到 Amazon 警告邮件，广告被暂停 48 小时，损失 ¥15 万。事前没有任何预警，等收到邮件才知道。
数据要求： - Amazon Seller Central 每日账号健康报告（ODR/取消率/延迟率） - 各 ASIN 的差评率和违规投诉记录 - 广告报告（ACOS/CTR/转化率）
预期产出： - 实时账号健康仪表盘（各指标当前值 + 距阈值百分比） - 趋势预警：当指标 7 日环比恶化 > 15% 时告警 - 联动建议：健康恶化时自动生成广告调整建议

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
提前 7-14 天预警账号健康恶化：给充足时间修复，避免封号损失 ¥50-500 万
广告预算自动联动调整：高风险期停止烧广告，月节省 ¥3-10 万
大促期账号健康保障：旺季稳定运营，保护 ¥20-80 万 GMV
年化综合 ROI：¥30-100 万（以避损为主）
实施难度：⭐⭐☆☆☆（Seller Central API 获取指标数据；阈值规则 1 周可实现；趋势检测约 2 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（174 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/risk_fraud/account_health_proactive_monitor` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Account-Health-Proactive-Monitor.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Account Health Proactive Monitor
Amazon 账号健康主动监控 + 早期预警系统
"""
import numpy as np
from dataclasses import dataclass
from typing import Optional


@dataclass
class HealthMetric:
    name: str
    threshold: float        # Amazon 警戒线
    current: float = 0.0   # 当前值（运行时填入）
    buffer_pct: float = 0.2  # 提前预警缓冲区（距阈值20%内预警）
    higher_is_worse: bool = True  # True=越高越危险（ODR），False=越低越危险（追踪率）
    weight: float = 1.0


# Amazon 账号健康核心指标配置
HEALTH_METRICS = [
    HealthMetric('order_defect_rate',      threshold=0.01, buffer_pct=0.30, weight=3.0),  # ODR <1%
    HealthMetric('cancellation_rate',      threshold=0.025, buffer_pct=0.20, weight=2.0),
    HealthMetric('late_shipment_rate',     threshold=0.04, buffer_pct=0.20, weight=2.0),
    HealthMetric('valid_tracking_rate',    threshold=0.95, higher_is_worse=False, buffer_pct=0.05, weight=1.5),
    HealthMetric('ip_violations',          threshold=5, buffer_pct=0.40, weight=2.5),     # 违规商品数
    HealthMetric('safety_claims',          threshold=3, buffer_pct=0.50, weight=2.0),
]


def compute_metric_risk(metric: HealthMetric) -> float:
    """计算单指标风险分（0-1）"""
    if metric.higher_is_worse:
        # 越高越危险
        buffer_threshold = metric.threshold * (1 - metric.buffer_pct)
        if metric.current <= buffer_threshold:
            return 0.0
        elif metric.current >= metric.threshold:
            return 1.0
        else:
            progress = (metric.current - buffer_threshold) / (metric.threshold - buffer_threshold)
            return float(1 / (1 + np.exp(-6 * (progress - 0.5))))  # sigmoid
    else:
        # 越低越危险
        buffer_threshold = metric.threshold * (1 + metric.buffer_pct)
        if metric.current >= buffer_threshold:
            return 0.0
        elif metric.current <= metric.threshold:
            return 1.0
        else:
            progress = (buffer_threshold - metric.current) / (buffer_threshold - metric.threshold)
            return float(1 / (1 + np.exp(-6 * (progress - 0.5))))


def compute_account_health_score(metrics: list[HealthMetric]) -> dict:
    """计算综合账号健康评分"""
    total_weight = sum(m.weight for m in metrics)
    weighted_risk = sum(compute_metric_risk(m) * m.weight for m in metrics)
    overall_risk = weighted_risk / total_weight
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.16034，但该号在 arXiv 上是《Efficient Replay Memory Architectures in Multi-Agent Reinforcement Learning for Traffic Congestion Control》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：Seller Central 每日账号健康报告（ODR、取消率、延迟率）、各 ASIN 差评率与违规投诉记录、广告报告（ACOS/CTR/转化率）；粒度为账号 × ASIN × 日。

**输出**：账号健康仪表盘（各指标当前值 + 距阈值百分比）、7 日环比恶化告警与广告、库存联动建议；供账号运营与投放负责人在大促期守住账号。

## 执行步骤

1. 拉取每日账号健康报告与 ASIN 差评、投诉数据
2. 接入广告报告，建立健康与投放的联动视图
3. 计算各指标 7 日环比，恶化超过阈值即触发告警
4. 输出健康仪表盘与距红线百分比
5. 给出广告预算与库存调整建议并跟踪执行

## 边界与不做

- 数据不满足：Seller Central 报表缺失或广告数据接不上时，联动建议会失真，先补齐数据源。
- 何时不用：只要阈值型指标曲线预警用「账号健康预警系统」；要算多账号关联风险用「账号关联检测」。
- 能力边界：只做健康监控、趋势告警与联动建议，不直接修改广告预算或账号设置。
- 安全边界：联动调整动作须人工确认后执行，不得据单日波动自动关停广告或下架商品。

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fraud-Signal-Collection.html、Skill-Fraud-Signal-Collection、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Fraud-Signal-Collection.html、Skill-Fraud-Signal-Collection、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Account-Health-Proactive-Monitor

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Account-Health-Proactive-Monitor`