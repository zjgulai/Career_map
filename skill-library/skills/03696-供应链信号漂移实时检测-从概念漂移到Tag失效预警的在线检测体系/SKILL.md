---
name: "p2s-real-time-supply-chain-drift-detection"
title: "供应链信号漂移实时检测 — 从概念漂移到Tag失效预警的在线检测体系"
description: "触发词：流式漂移检测、Tag失效预警、置信度降级、需求尖峰告警、CUSUM监控、补货暂停。何时不用：只做离线特征分布周期检查用「数据漂移检测」；只做模型指标衰减告警用「模型性能监控」。安全边界：确认漂移后必须同步降级 Tag 置信度并暂停依赖该 Tag 的动作，误报须留人工复核窗口再恢复；若 Tag 用于自动定价，不得违反平台公平定价政策、不得借突发事件抬价。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-149"
l3_business: "运行监测"
l3_all: "运行监测 / 数据质量"
l1_l2_l3: "数据与Agent平台/数据与AI运行/运行监测"
p2s_card_id: "Skill-Real-Time-Supply-Chain-Drift-Detection"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "预测标签悄悄失效时立刻报警：置信度降级、依赖它的补货动作暂停，爆品尖峰提前几小时预警。"
user_try: "试试：监控 TikTok Shop 爆品的实时销速，出现需求尖峰时提前几小时给我补货预警。"
whenToUse: "当供应链预测与标签体系需要在线感知漂移、并在漂移发生时立刻收缩动作时用本技能；若只是离线周期性检查特征分布，用「数据漂移检测」；若只是看模型指标衰减，用「模型性能监控」。"
workflow: "接入实时信号流（销量、预测值、预测误差） → 用多窗口 ADWIN 与 CUSUM 检测分布漂移与需求尖峰 → 确认漂移后把预测 Tag 标记为 DRIFT_DETECTED 并下调置信度 → 暂停所有依赖该 Tag 的补货动作，触发模型更新 → 经人工复核窗口后恢复动作并跟踪断货与超卖情况"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 供应链信号漂移实时检测 — 从概念漂移到Tag失效预警的在线检测体系

## ① 解决的问题

数据团队面临"模型准确率悄悄下降但无法感知"——流式漂移检测将数据质量问题发现从月度审计→5分钟实时预警，防止错误预测导致的断货超卖

## ② 核心算法逻辑

供应链信号漂移是Palantir Ontology可靠性的隐形杀手。当数据分布发生变化时（疫情、贸易战、季节突变），基于历史数据训练的预测Tag会悄然失效——但系统继续"自信地"触发错误Action。

## ③ 业务应用场景

场景A：疫情后需求模式漂移（2022-2023） - 漂移事件：新冠期间的囤货模式消失，销售节奏完全改变 - 检测过程： - 自动响应：`predicted_demand_tag`被标记为`DRIFT_DETECTED`，置信度从0.85降至0.40，所有依赖此Tag的补货Action暂停，等待模型更新
三轨验证： - 成本：需接入历史24个月销售数据（约500GB）、部署3台GPU服务器（月均¥1.2万）、数据工程师0.5人月调参。若使用AWS Lambda无服务器方案，月均成本可降至¥3000。 - 合规：不涉及用户PII数据，仅处理聚合销售时序，无GDPR/CCPA风险。但需注意：若Tag用于自动定价，需确保不违反Amazon公平定价政策（禁止利用疫情等突发事件进行价格欺诈）。 - 风险：漂移误报可能导致正常补货中断（假阳性率约3-5%），需设置人工复核窗口（2小时）。极端情况下，若模型更新滞后，可能错过真实需求拐点（如报复性消费反弹）。
场景B：TikTok Shop爆品导致的需求尖峰漂移 - 特征：短视频带货导致单品需求在24h内增长10-50倍，历史模型无法感知 - 检测逻辑：实时监控销速的CUSUM，设置短窗口（1h）触发敏感检测 - 价值：在断货发生前4-8小时发出`SPIKE_ALERT`，触发紧急补货Action

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI预估：在疫情期间，未检测漂移的企业平均损失34%的预测准确率，导致断货率升高至18%（vs 有检测的企业8%）；TikTok爆品场景下，提前4-8小时预警断货，每次避免BSR排名损失价值约¥2-8万
实施难度：⭐⭐⭐☆☆（核心算法成熟，主要工作是信号接入和阈值调优）
优先级评分：⭐⭐⭐⭐⭐（Palantir Ontology可靠性的底层保障——没有漂移检测，所有预测Tag都会随时间腐化，导致错误决策积累）
评估依据：Airbus Skywise案例：漂移检测将生产异常的平均发现时间从"周级"缩短至"分钟级"，直接贡献33%的生产加速

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（323 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/data_collection/real_time_supply_chain_drift_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/24-标签工程/Skill-Real-Time-Supply-Chain-Drift-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
供应链信号漂移实时检测系统
功能：多层漂移检测 / 置信度降级 / Palantir Tag失效预警 / 自动重训练触发
输入：时间序列信号流（销量/预测/误差）
输出：漂移告警 + Tag置信度更新 + Action建议
"""
import numpy as np
from collections import deque
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum
import warnings
warnings.filterwarnings('ignore')


class DriftType(Enum):
    NO_DRIFT = "no_drift"
    WARNING = "warning"      # 轻微漂移
    DRIFT = "drift"          # 确认漂移
    SEVERE_DRIFT = "severe"  # 严重漂移，需要立即行动


@dataclass
class DriftSignal:
    """漂移检测结果——直接映射到Palantir Tag更新"""
    drift_type: DriftType
    confidence_degradation: float   # Tag置信度降低幅度 0-1
    affected_tags: list             # 受影响的Tag列表
    recommended_action: str         # Palantir Action建议
    evidence: dict = field(default_factory=dict)


class ADWINDriftDetector:
    """自适应窗口漂移检测器（均值漂移）"""
    
    def __init__(self, delta: float = 0.002, min_window: int = 10):
        self.delta = delta          # 置信水平（越小越敏感）
        self.min_window = min_window
        self.window = deque()
        self.n = 0
        self.sum = 0.0
        self.variance = 0.0
    
    def update(self, value: float) -> bool:
        """返回True表示检测到漂移"""
        self.window.append(value)
        self.n += 1
        self.sum += value
        
        if self.n < self.min_window * 2:
            return False
        
        # 检验：分割窗口，寻找最大分布差异
        n_total = len(self.window)
        values = list(self.window)
        
        for split in range(self.min_window, n_total - self.min_window):
            w0 = values[:split]
            w1 = values[split:]
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.11243，但该号在 arXiv 上是《Joint Minimum Processing Beamforming and Near-end Listening Enhancement》，与本卡主题无关。
⚠️ 该号被 4 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实时时间序列信号流（销量、预测值、预测误差），带时间戳与 SKU 维度；历史基线数据（如 24 个月销售时序）与各层检测阈值配置。

**输出**：漂移告警（含类型与严重度）、受影响 Tag 列表、Tag 置信度降级幅度与建议动作（如暂停补货、触发重训）；直接映射为知识/标签体系中的 Tag 更新，供供应链与数据团队使用。

## 执行步骤

1. 接入实时销量、预测与误差信号流并做维度对齐
2. 用 ADWIN 与短窗口 CUSUM 分别检测慢漂移与需求尖峰
3. 确认漂移后将相关预测 Tag 标记失效并下调其置信度
4. 暂停依赖该 Tag 的补货动作并触发模型更新
5. 设置人工复核窗口，复核后恢复动作并跟踪断货与超卖指标

## 边界与不做

- 数据不满足：没有可用的历史基线或实时信号流断点时无法判定漂移，先保证信号接入完整。
- 何时不用：离线特征分布检查用「数据漂移检测」，模型指标衰减告警用「模型性能监控」。
- 能力边界：产出的是漂移判据、Tag 置信度更新与动作建议，不是执行器；实际暂停补货、触发重训由模型外的确定性控制层执行。
- 安全边界：漂移确认须同步降级 Tag 并暂停相关动作，误报留人工复核窗口；用于定价时不得违反平台公平定价政策。

## 技能关联

- **前置**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Predictive-Tag-Engine-Supply-Chain.html、Skill-Predictive-Tag-Engine-Supply-Chain、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Signal-Uncertainty-Quantification-SC.html、Skill-Signal-Uncertainty-Quantification-SC、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Tag-Quality-Coverage-KPI.html、Skill-Tag-Quality-Coverage-KPI
- **延伸**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Decision-Confidence-Calibration-SC.html、Skill-Decision-Confidence-Calibration-SC、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Signal-Uncertainty-Quantification-SC.html、Skill-Signal-Uncertainty-Quantification-SC、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger
- **可组合**：Skill-Cross-Domain-Supply-Chain-Signal-Fusion.html、Skill-Cross-Domain-Supply-Chain-Signal-Fusion、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Supply-Chain-Ontology-Action-Trigger.html、Skill-Supply-Chain-Ontology-Action-Trigger、Skill-Real-Time-Supply-Chain-Drift-Detection

---

> 分类：数据与Agent平台/数据与AI运行/运行监测　·　技术族：24-标签工程　·　源卡：`Skill-Real-Time-Supply-Chain-Drift-Detection`