---
name: "p2s-account-health-early-warning-system"
title: "账号健康预警系统 — ODR/LSR/VTR多指标趋势监控与早期预警"
description: "触发词：账号健康预警、ODR 监控、LSR 趋势、阈值告警、暂停前预警。何时不用：要在指标恶化时联动广告预算并给运营建议用「账号健康主动监控」；要算多账号关联风险用「账号指纹风险评分器」。安全边界：只输出指标趋势与告警，不代替平台判定；阈值与权重须按各站点实际红线校准，误判（卡页口径 5-8%）时不得据此限制正常经营动作。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Account-Health-Early-Warning-System"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把 ODR、LSR、VTR 这些红线指标盯成趋势曲线，在真正超标前十几天先报警，留出整改时间。"
user_try: "试试：监控我们 5 个品牌账号的 ODR/LSR/VTR，逼近阈值时提前告警并说明还剩多少空间。"
whenToUse: "当需要按阈值与多指标加权趋势，在账号被暂停前 15-30 天预警时用本技能；还要在恶化时联动广告预算与运营建议用「账号健康主动监控」；风险来自多账号关联判定用「账号指纹风险评分器」。"
workflow: "配置各指标的安全、预警、危险阈值与权重 → 按日拉取账号健康指标并写入时序 → 计算加权健康分与距阈值的剩余空间 → 穿越预警线或趋势恶化时发出告警 → 输出根因线索与对应处置动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 账号健康预警系统 — ODR/LSR/VTR多指标趋势监控与早期预警

## ① 解决的问题

亚马逊账号运营面临"ODR悄悄接近1%暂停红线但无预警机制"——多指标趋势预警在暂停前15-30天发出告警，年均防止账号被封损失约50-200万元

## ② 核心算法逻辑

Amazon账号健康由四类核心指标构成，任一超标将导致账号被暂停：

## ③ 业务应用场景

场景A：婴儿配方奶粉账号ODR突破预警 - 现象：ODR连续3周从0.45%缓慢爬升至0.78%（方向：向1%迫近） - 根因分析：一批铁罐包装产品物流损坏率偏高（3.2%），导致A-to-Z索赔增加 - 预警：系统在ODR=0.78%时发出预警（距1%阈值还有22%空间，预计9天后超标） - 处置：立即升级包装（增加珍珠棉内衬），联系FBA仓库检查在途库存 - 结果：ODR在预警后12天开始下降，最终稳定在0.52%，未触发暂停
场景B：旺季前账号健康体检 - 场景：Q4旺季前（10月）对5个品牌账号进行健康体检 - 发现：吸奶器账号LSR当前2.8%（安全区），但趋势显示旺季物流压力下预计升至4.5% - 预防措施：提前2个月增加FBA库存（避免自配送比例升高），签约备用3PL - 结果：旺季LSR峰值3.6%，未超阈值，平稳度过旺季
三轨验证 | 成本轨：系统开发成本12万元（一次性），月均运维成本3500元（技术维护8小时/月+服务器600元/月+数据处理2900元/月），ROI周期4.5个月（基于月均挽回8万损失） | 合规轨：符合《电商法》第十五条反不正当竞争规定，满足平台治理要求；需建立用户数据隐私保护机制，符合《个人信息保护法》第二十六条合法利益豁免条款；建议获得法务部门书面合规确认 | 风险轨：误判率风险（5-8%概率导致正常用户被限制，可能引发投诉）、模型漂移风险（3-5%概率因季节性变化导致检测准确度下降）、数据安全风险（2%概率的数据泄露可能引发舆情）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：账号被暂停1个月的损失约50-200万元（含销售损失+排名恢复成本）；提前15-30天预警可避免95%以上的暂停事件，年均防损价值约50-200万元
实施难度：⭐⭐☆☆☆（指标数据通过SP-API可获取，监控逻辑标准化）
优先级：⭐⭐⭐⭐⭐（账号是最核心资产，健康监控是运营的基础设施，不可或缺）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（287 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
账号健康预警系统 - ODR/LSR/VTR/POP多指标监控
在账号被暂停前15-30天发出告警
"""
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple


# 指标阈值配置
METRIC_THRESHOLDS = {
    'ODR': {  # Order Defect Rate（越低越好）
        'safe': 0.005,      # 0.5% 安全区
        'warn': 0.008,      # 0.8% 预警区
        'danger': 0.010,    # 1.0% 暂停阈值
        'weight': 0.40,
        'direction': 'lower_is_better'
    },
    'LSR': {  # Late Shipment Rate
        'safe': 0.020,
        'warn': 0.033,
        'danger': 0.040,
        'weight': 0.25,
        'direction': 'lower_is_better'
    },
    'VTR': {  # Valid Tracking Rate（越高越好）
        'safe': 0.980,
        'warn': 0.960,
        'danger': 0.950,
        'weight': 0.20,
        'direction': 'higher_is_better'
    },
    'POP': {  # Pre-fulfillment Cancellation Rate
        'safe': 0.010,
        'warn': 0.020,
        'danger': 0.025,
        'weight': 0.15,
        'direction': 'lower_is_better'
    }
}


@dataclass
class MetricSnapshot:
    """单个指标的时序快照"""
    metric_name: str
    values: List[float]      # 历史值（按天）
    dates: List[str]         # 对应日期


@dataclass
class HealthAlert:
    """健康告警"""
    metric: str
    current_value: float
    threshold: str           # 'warn' or 'danger'
    days_to_threshold: int   # 预计多少天后超阈值
    trend_slope: float       # 趋势斜率（正=恶化，负=改善）
    severity: str            # 'info', 'warning', 'critical'
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：每日账号健康报告（ODR、取消率、延迟率等指标时序）与相关 ASIN 的差评、违规投诉记录；粒度为账号 × 指标 × 日。

**输出**：多指标健康分与趋势告警（含距阈值百分比与预计超标时间）、根因线索与处置建议；供账号运营在暂停前完成整改。

## 执行步骤

1. 设定各指标的安全、预警、危险阈值与权重
2. 按日采集账号健康指标，形成时序数据
3. 计算加权健康分，判断趋势方向与逼近速度
4. 命中预警条件时告警并给出预计超标时间
5. 结合差评与物流记录定位根因，跟踪整改后指标回落

## 边界与不做

- 数据不满足：拿不到每日指标时序、或不掌握各站点红线口径时无法判定趋势，不要用本技能硬报。
- 何时不用：要在恶化时联动广告预算并给运营动作建议用「账号健康主动监控」；要算多账号关联风险用「账号指纹风险评分器」。
- 能力边界：只做指标趋势判定与告警，不改动账号设置，也不代替平台官方绩效口径。
- 安全边界：阈值与权重必须按站点实际红线校准；误判时不得据此直接限流或停止投放。

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Fingerprint-Risk-Scorer.html、Skill-Account-Fingerprint-Risk-Scorer、Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Multi-Account-Operational-Isolation.html、Skill-Multi-Account-Operational-Isolation
- **可组合**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Account-Fingerprint-Risk-Scorer.html、Skill-Account-Fingerprint-Risk-Scorer、Skill-Amazon-Account-Appeal-Strategy.html、Skill-Amazon-Account-Appeal-Strategy、Skill-Account-Health-Early-Warning-System

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Account-Health-Early-Warning-System`