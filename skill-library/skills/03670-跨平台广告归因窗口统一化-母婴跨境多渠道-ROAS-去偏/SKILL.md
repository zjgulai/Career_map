---
name: "p2s-pvm-attribution-window-harmonization"
title: "PVM 跨平台广告归因窗口统一化 - 母婴跨境多渠道 ROAS 去偏"
description: "触发词：归因窗口统一、多渠道信用分配、重复归因、渠道矫正ROAS、大促渠道贡献。何时不用：只是把各平台字段对齐成一张表、不重算信用分配时用广告统一数据模型技能；要判断素材或关键词效果好坏时用投放诊断技能。安全边界：归因差异的压缩幅度以卡页原始口径为准，本技能不额外承诺任何跨渠道贡献的绝对值。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-137"
l3_business: "指标契约"
l3_all: "指标契约 / 投放诊断"
l1_l2_l3: "数据与Agent平台/数据与AI运行/指标契约"
p2s_card_id: "Skill-PVM-Attribution-Window-Harmonization"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让多个平台不再抢同一笔订单的功劳，把渠道 ROAS 矫正到可以横向比较、可以拿来分预算的口径。"
user_try: "试试：把这几个平台的触点时间和订单时间对齐，做一次归因去重，给我渠道矫正 ROAS 和重复计数率。"
whenToUse: "当同一批订单被多个平台重复计入、需要重新分配归因信用并矫正 ROAS 时用本技能；只是字段口径不一致、不需要重算信用时用广告统一数据模型技能。"
workflow: "把各平台触点时间映射到以转化为原点的对齐时间轴 → 做窗口截断审计，提取各平台窗口内最后点击 → 按同行报告时序概率分配信用并约束总和不超过 1 → 识别同 order_id 的多平台归因 → 输出渠道矫正 ROAS 与重复计数率报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# PVM 跨平台广告归因窗口统一化 - 母婴跨境多渠道 ROAS 去偏

## ① 解决的问题

投放分析师面临窗口口径打架——PVM将归因差异18%压到5%，年化省20万元

## ② 核心算法逻辑

WFB 跨渠道归因痛点:Amazon 14dclick、Meta 7dclick、TikTok 7dclick 归因窗口不一致,LastClick Mechanism (LCM) 让平台策略性延迟上报点击时间抢归因信用,LCM 不满足 DSIC (Dominant Strategy Incentive Compatible),准确率最低可趋近于 0. PVM (PeerValidated Mechanism) 让每个平台的归因信用仅依赖

## ③ 业务应用场景

- 业务问题:Momcozy 同投 Amazon SP + Meta DPA + TikTok Shop. 用户 6 天前在 TikTok 看吸奶器短视频, 2 天前看 Meta DPA 再营销, 5 分钟前在 Amazon 搜索点击购买. Amazon 14d-click 抢走 100% 归因信用, TikTok/Meta ROAS 系统性低估,导致削减二者预算 → 全渠道流量恶性循环 - 数据要求:三平台 click_time + 转化时间戳 + spend - PVM 配置: - 各平台触点统一映射到 $(-W, 0]$ 转化对齐时间轴 - PVM 按"同行报告时序概率"分配信用(Sof
- 业务问题:大促后 Amazon 声称带来 GMV 500 万,Meta 声称 200 万,TikTok 声称 150 万,三者之和远超实际 GMV 600 万(双重计数). 无法判断真实渠道贡献 → 下一轮大促预算分配错误率 40%+ - 数据要求:大促期间(6.1-6.18)所有订单 + 三平台触点记录 - PVM 配置: - 窗口截断审计:每笔订单提取三平台窗口内最后点击 - 重复转化识别:同 order_id 多平台归因 → 强制 $\sum_i x_i \leq 1$ - 输出"渠道矫正 ROAS"+ 重复计数率报告 - 业务价值: - 跨渠道 ROAS 可比性 → 下一轮大促渠道

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

易处:PyMAL GitHub 开源(MAC 基准 + 多归因学习基线)
易处:PVM 数学框架明确,可纯 Python 实现核心
难处:PVM 主论文是理论论文,无官方代码
难处:三平台 click_time 精确对齐需要 ETL 工程(timezone / 时间戳格式)

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（128 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/advertising/pvm_attribution_window_harmonization` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/13-广告分析/Skill-PVM-Attribution-Window-Harmonization.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
PVM 跨平台归因窗口统一化最小骨架
主论文 arXiv:2511.22918 (NeurIPS 2025)
辅: PyMAL https://github.com/alimama-tech/PyMAL
依赖: pip install numpy
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import numpy as np


ATTRIBUTION_WINDOWS = {
    "amazon": timedelta(days=14),
    "meta": timedelta(days=7),
    "tiktok": timedelta(days=7),
}


@dataclass
class TouchPoint:
    platform: str
    click_time: datetime
    spend: float = 0.0


@dataclass
class Conversion:
    order_id: str
    convert_time: datetime
    revenue: float
    touchpoints: List[TouchPoint] = field(default_factory=list)


def normalize_to_conversion_timeline(tp: TouchPoint, t0: datetime, window: timedelta) -> Optional[float]:
    """Step 1: 转化对齐时间归一化 t_i = t_i^abs - t_0"""
    relative_seconds = (tp.click_time - t0).total_seconds()
    if relative_seconds > 0:
        return None
    if tp.click_time < t0 - window:
        return None
    return relative_seconds


def pvm_attribution(conversion: Conversion, windows: Dict[str, timedelta] = None) -> Dict[str, float]:
    """Peer-Validated Mechanism: 信用按时序加权,sum <= 1"""
    windows = windows or ATTRIBUTION_WINDOWS
    eligible: Dict[str, float] = {}

    for tp in conversion.touchpoints:
        window = windows.get(tp.platform, timedelta(days=7))
        rel_t = normalize_to_conversion_timeline(tp, conversion.convert_time, window)
        if rel_t is not None:
            if tp.platform not in eligible or rel_t > eligible[tp.platform]:
                eligible[tp.platform] = rel_t

    if not eligible:
        return {}
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2511.22918 — Beyond Last-Click: An Optimal Mechanism for Ad Attribution

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：各平台触点记录（平台、click_time、spend）与转化记录（order_id、转化时间戳、GMV），大促场景需窗口期内全部订单加三平台触点，粒度到单次点击与单笔订单。

**输出**：每个渠道的矫正 ROAS 与信用分配系数、重复计数率报告，以及窗口截断审计明细，供大促预算分配与渠道评估使用。

## 执行步骤

1. 把各平台触点时间相对转化时间归一化到转化前窗口的对齐时间轴
2. 对每笔订单做窗口截断审计，提取各平台窗口内最后点击
3. 按同行报告时序概率分配信用，强制各平台信用之和不超过 1
4. 识别同 order_id 被多平台重复归因的情况并计算重复计数率
5. 输出渠道矫正 ROAS 与可比的跨渠道贡献表

## 边界与不做

- 触点时间戳或订单时间缺失、无法对齐时间轴时不可用；只做字段映射不重算信用的场景不属于本技能。
- 本技能只做归因信用再分配与口径矫正，不改动平台后台的归因设置，也不替代财务口径的收入确认。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Hierarchical-Search-Intent-Classification.html、Skill-Hierarchical-Search-Intent-Classification
- **延伸**：Skill-DARA-Agentic-MMM-Optimizer.html、Skill-DARA-Agentic-MMM-Optimizer、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Promotion-Effectiveness.html、Skill-Promotion-Effectiveness、Skill-PVM-Attribution-Window-Harmonization

---

> 分类：数据与Agent平台/数据与AI运行/指标契约　·　技术族：13-广告分析　·　源卡：`Skill-PVM-Attribution-Window-Harmonization`