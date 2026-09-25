---
name: "p2s-ato-spatio-temporal-graph"
title: "账号盗用时空图检测 — GraphSAGE+因果标签传播"
description: "触发词：账号盗用、时空图、登录异常、设备指纹、标签传播。何时不用：只有单账号孤立行为、没有账号间关系数据时用常规规则风控；本技能依赖设备、IP、账号构成的关系网络。安全边界：账号与登录数据属高敏个人信息，需授权采集、最小化留存，并按 PIPL 与 GDPR 处理。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 账号诊断"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-ATO-Spatio-Temporal-Graph"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "把登录设备、IP、账号连成时空图，同一设备登多个号、异地登录后改银行账户这类盗号链路一眼看穿。"
user_try: "试试：用这批登录日志找出可疑的账号盗用链路，标出高风险账号。"
whenToUse: "有账号、设备、IP 的关系数据、需要团伙级检出时用本技能；单账号行为异常且无关系数据时用常规风控规则。"
workflow: "整理登录日志与已知盗号标签 → 构建账号、设备、IP 的时空图 → 做节点嵌入与因果标签传播 → 按高危行为序列输出风险账号与处置建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 账号盗用时空图检测 — GraphSAGE+因果标签传播

## ① 解决的问题

风控面临账号异常检出率低——时空图神经网络将ATO欺诈检测率从62%提升至91%，年化挽回损失35万元

## ② 核心算法逻辑

ATO攻击本质：账号盗取（Account Takeover）是攻击者窃取合法用户账号后实施欺诈的核心手段。在跨境电商场景中，盗取Amazon卖家账号意味着可篡改银行账户、修改出货地址、提走保证金，单次损失动辄数万美元。传统基于规则的检测（IP封禁、设备指纹）已被精密攻击者绕过。

## ③ 业务应用场景

业务痛点：跨境卖家的Amazon卖家账号是核心资产——绑定的银行账户、店铺权限、广告账户一旦被盗，攻击者可在24小时内清空账户余额、批量发货骗取货物、留下大量差评损毁品牌。现有手机验证码验证在SIM Swap攻击面前形同虚设。
数据要求： - 登录日志字段：`account_id`、`device_fingerprint`、`ip_address`、`login_timestamp`、`action_type`（登录/改密/改银行账户） - 时间窗口：建议24小时滑动窗口 - 已知风险标签：至少有少量历史盗号事件（用于标签传播初始化）
检测触发条件： - 同一设备24小时内登录3+个不同账号 - 账号从未出现过的地理位置+新设备同时访问 - 登录后15分钟内出现"修改银行账户"操作（高危行为序列） - 关联IP曾出现在已知盗号事件中

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：6.38%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（354 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
账号盗用时空图检测 — ATLAS GraphSAGE+因果标签传播
论文: arXiv:2509.20339
场景: Amazon卖家账号安全监控 / 跨境店铺账号群联防
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


# ── 数据结构 ─────────────────────────────────────────────────

@dataclass
class LoginEvent:
    """单次登录事件"""
    event_id:   str
    account_id: str
    device_id:  str
    ip_addr:    str
    timestamp:  float
    action:     str = "login"  # login / change_bank / change_password / withdraw
    is_fraud:   Optional[int] = None  # 1=盗号, 0=合法, None=未知


@dataclass
class ATOGraph:
    """时空登录图：设备-账号-IP有向图"""
    events:    List[LoginEvent] = field(default_factory=list)
    time_window: float = 86400.0  # 24小时滑动窗口（秒）

    def add_event(self, event: LoginEvent) -> None:
        self.events.append(event)

    def __len__(self) -> int:
        return len(self.events)


# ── 时空图特征工程 ────────────────────────────────────────────

def extract_ato_features(graph: ATOGraph) -> np.ndarray:
    """
    提取时空图结构特征，捕获ATO攻击的图信号
    8维特征：
      0. 设备登录账号数（24h窗口内）
      1. 账号登录设备数（新设备登录）
      2. 账号登录IP数
      3. 高危操作标志（改银行/提现=1）
      4. 登录速率（事件/小时）
      5. IP历史风险分（若IP曾出现盗号事件）
      6. 账号首次使用此设备标志
      7. 深夜登录标志（0-6点 UTC）
    """
    n = len(graph.events)
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2509.20339 — Spatio-Temporal Directed Graph Learning for Account Takeover Fraud Detection

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：登录日志：account_id、device_fingerprint、ip_address、login_timestamp、action_type（登录、改密、改银行账户），建议 24 小时滑动窗口；并需少量历史盗号事件作为标签传播的种子。

**输出**：账号风险评分与可疑盗用链路、处置建议（如强制验证、冻结复核），供风控与账号安全团队使用。

## 执行步骤

1. 汇总登录日志并构建账号、设备、IP 图
2. 用少量已知盗号事件初始化标签
3. 跑图卷积与标签传播打分
4. 结合高危行为序列筛出风险账号
5. 输出可疑链路与处置建议

## 边界与不做

- 没有账号间关系数据、只有单账号孤立日志时，图方法不占优。
- 本技能产出风险评分与可疑链路，不直接封号或改密。
- 登录与设备数据属高敏个人信息，采集需授权、留存需最小化并符合隐私法规。

## 技能关联

- **前置**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Anomaly-Detection-Unsupervised、Skill-Brand-Hijacking-Realtime-Monitor.html、Skill-Brand-Hijacking-Realtime-Monitor、Skill-Cross-Platform-Account-Linkage-Risk.html、Skill-Cross-Platform-Account-Linkage-Risk、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Graph-Neural-Network-Basics、Skill-Hijacker-Seller-Network-Analysis.html、Skill-Hijacker-Seller-Network-Analysis、Skill-LLM-Review-Manipulation-Detection.html、Skill-LLM-Review-Manipulation-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-Account-Association-Risk-Detection.html、Skill-Account-Association-Risk-Detection、Skill-Brand-Hijacking-Realtime-Monitor.html、Skill-Brand-Hijacking-Realtime-Monitor、Skill-Cross-Platform-Account-Linkage-Risk.html、Skill-Cross-Platform-Account-Linkage-Risk、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Hijacker-Seller-Network-Analysis.html、Skill-Hijacker-Seller-Network-Analysis、Skill-LLM-Review-Manipulation-Detection.html、Skill-LLM-Review-Manipulation-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Brand-Hijacking-Realtime-Monitor.html、Skill-Brand-Hijacking-Realtime-Monitor、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Hijacker-Seller-Network-Analysis.html、Skill-Hijacker-Seller-Network-Analysis、Skill-LLM-Review-Manipulation-Detection.html、Skill-LLM-Review-Manipulation-Detection、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ATO-Spatio-Temporal-Graph

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-ATO-Spatio-Temporal-Graph`