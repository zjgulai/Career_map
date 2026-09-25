---
name: "p2s-experiment-data-quality-guard"
title: "Experiment Data Quality Guard — A/B 实验数据采集质量保障：爬虫/日志污染检测与因果实验完整性"
description: "触发词：实验数据质量、爬虫污染、AA测试、SMD均衡、日志乱序。何时不用：数据来源单一可控、无爬虫与多端上报问题时，用常规实验解读即可。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 数据质量"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Experiment-Data-Quality-Guard"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "实验出结果前先验一遍数据：爬虫刷的点击、分错组的高价值用户、乱序日志，别让这些把结论带偏。"
user_try: "试试：实验组 CTR 高了 8.3% 但转化没变，帮我查一下是不是爬虫污染导致的。"
whenToUse: "当实验出现点击显著但转化不动、或怀疑爬虫、SDK 批量上报、日志乱序污染了分组与指标时用；数据来源单一可控时用常规实验解读即可。"
workflow: "实验前 3 天部署 A/A 测试，验证协变量 SMD 小于 0.1 → 计算实验组与对照组的 bot_rate 并比较差值 → 检查分组均衡状态与协变量 SMD，判断是否出现 critical → 过滤爬虫与异常时序记录后重算指标 → 比较校正前后 p 值，输出继续、停止或改用校正结论的建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Experiment Data Quality Guard — A/B 实验数据采集质量保障：爬虫/日志污染检测与因果实验完整性

## ① 解决的问题

量化 ROI：避免因虚假显著性结果而错误全量上线（该改版涉及开发成本 ~15 万元 + 页面跳转改造），节省无效投入 15 万元

## ② 核心算法逻辑

A/B 实验的因果推断依赖随机化的完整性：处理组（Treatment）与对照组（Control）的差异必须仅来自实验干预，而非数据采集过程的污染。母婴跨境电商场景中常见的污染源包括：

## ③ 业务应用场景

业务背景：针对婴儿推车详情页（PDP）新版信任徽章（Trust Badge）的 A/B 实验，实验周期 14 天，发现实验组 CTR 显著高于对照组（+8.3%），但转化率无显著差异，怀疑爬虫污染导致点击数虚高。
量化 ROI：避免因虚假显著性结果而错误全量上线（该改版涉及开发成本 ~15 万元 + 页面跳转改造），节省无效投入 15 万元。
业务背景：针对母乳储奶袋的首购优惠券 Push 实验，发现实验组与对照组的实验前 GMV 协变量 SMD = 0.34（远超 0.1 阈值），怀疑 SDK 批量上报导致日志乱序，部分高价值用户被错误分配。

## ④ 输入数据要求

`bot_stats.bot_rate_treatment` vs `bot_stats.bot_rate_control`：差距 > 3pp 表示不均匀污染，需高度警惕
`balance.status == "critical"`：立即停止实验，排查日志管道
`effect.adjusted_p_value` vs `effect.raw_p_value`：对比校正前后结论
[ ] 部署 A/A 测试（实验前 3 天），验证 SMD < 0.1
[ ] 检查实验组/对照组 bot_rate 差值 < 2pp

## ⑤ 输出结果

`bot_stats.bot_rate_treatment` vs `bot_stats.bot_rate_control`：差距 > 3pp 表示不均匀污染，需高度警惕
`balance.status == "critical"`：立即停止实验，排查日志管道
`effect.adjusted_p_value` vs `effect.raw_p_value`：对比校正前后结论
[ ] 部署 A/A 测试（实验前 3 天），验证 SMD < 0.1
[ ] 检查实验组/对照组 bot_rate 差值 < 2pp

## ⑥ 业务价值 / ROI

10-50 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（360 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/experiment_data_quality_guard` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Experiment-Data-Quality-Guard.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
A/B 实验数据采集质量保障系统
整合爬虫过滤 + 分组均衡检验 + CUPED 偏差校正
arXiv 参考: 2309.12215 (ExP: Scalable Experimentation), 
           2405.01817 (Causal Testing with Contaminated Data)
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from scipy import stats


# ── 数据结构 ─────────────────────────────────────────────────────────────

@dataclass
class ExperimentRecord:
    user_id: str
    group: str          # "treatment" or "control"
    ua_string: str
    event_count: int
    session_duration: float   # 秒
    click_count: int
    pre_exp_gmv: float        # 实验前 GMV（CUPED 协变量）
    outcome_metric: float     # 实验期间指标（如 CTR, GMV）
    timestamp_gaps: List[float]  # 操作间隔时间列表（秒）


# ── Layer 1：爬虫/机器人检测 ───────────────────────────────────────────────

class BotDetector:
    """
    基于行为特征的爬虫检测
    三维评分：UA异常 + 时序异常 + 行为熵
    """

    KNOWN_BOT_PATTERNS = [
        "bot", "crawler", "spider", "scraper", "python-requests",
        "curl", "wget", "scrapy", "selenium", "headless",
    ]

    def __init__(self, bot_score_threshold: float = 0.6):
        self.threshold = bot_score_threshold

    def ua_score(self, ua_string: str) -> float:
        """UA 异常得分：匹配已知爬虫特征"""
        ua_lower = ua_string.lower()
        if any(pat in ua_lower for pat in self.KNOWN_BOT_PATTERNS):
            return 1.0
        # 缺少常见浏览器标识
        if not any(b in ua_lower for b in ["mozilla", "chrome", "safari", "firefox"]):
            return 0.7
        return 0.0

    def timing_score(self, timestamp_gaps: List[float]) -> float:
        """时序异常得分：机器行为 → 操作间隔方差极小"""
        if len(timestamp_gaps) < 3:
            return 0.0
        gaps = np.array(timestamp_gaps)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2405.01817 — Uniformly Stable Algorithms for Adversarial Training and Beyond

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：实验记录级数据（user_id、分组、UA 字符串、事件数、会话等）+ 两组 bot_rate 统计 + 实验前协变量的 SMD 均衡指标 + 校正前后的 p 值；卡页判据为 bot_rate 差距 > 3pp 需高度警惕、两组 bot_rate 差值 < 2pp、SMD < 0.1。

**输出**：污染与不均衡诊断结果（bot_rate 对比、balance.status、校正前后 p 值对照）与检查清单（示例：部署 A/A 测试验证 SMD < 0.1；检查两组 bot_rate 差值 < 2pp），供是否停止实验或改用校正结论的决策使用。

## 执行步骤

1. 实验前 3 天部署 A/A 测试，验证协变量 SMD 小于 0.1
2. 计算实验组与对照组的 bot_rate 并比较差值
3. 检查分组均衡状态与协变量 SMD，判断是否出现 critical
4. 过滤爬虫与异常时序记录后重算指标
5. 比较校正前后 p 值，输出继续、停止或改用校正结论的建议

## 边界与不做

- 何时不用：数据来源单一可控、不存在爬虫与多端上报问题时，用常规实验解读即可；实验已结束且原始记录级数据丢失时无法补救。
- 能力边界：只输出污染诊断与判据（bot_rate 差值、SMD、校正前后 p 值对照），实验的停止与重启动作由实验平台或人工执行，本技能不代为操作。
- 卡页数字（CTR +8.3%、SMD=0.34、阈值 0.1 与 3pp、改版成本约 15 万元、节省无效投入 15 万元、收益区间 10-50 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Ecommerce-Data-Quality-Assessment.html、Skill-Ecommerce-Data-Quality-Assessment
- **延伸**：Skill-CUPED-Variance-Reduction.html、Skill-CUPED-Variance-Reduction
- **可组合**：Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Switchback-Experiment-Design.html、Skill-Switchback-Experiment-Design、Skill-Experiment-Data-Quality-Guard

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Experiment-Data-Quality-Guard`