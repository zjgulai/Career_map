---
name: "p2s-price-signal-collection"
title: "Price Signal Collection — 竞品价格信号实时采集与结构化"
description: "触发词：竞品价格采集、价格信号融合、多平台比价、价格突变检测、调价响应。何时不用：要判断的是自家 SKU 的定价效率（销售额/可售库存）时用「REVPAS 定价效率」。安全边界：采集须遵守平台条款与数据使用规范；只做采集与融合，不自动发起调价。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 数据管道"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Price-Signal-Collection"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把多个平台、多种货币的竞品报价收成一条干净的价格信号，让调价决策在十几分钟内就能做出。"
user_try: "试试：为这 5 个竞品 SKU 建价格采集与融合，竞品降价时第一时间给我一条融合价与变动幅度。"
whenToUse: "当需要跨平台、跨币种持续采集竞品价格并输出可用于快速调价的融合信号时用本技能；若要判断的是自家 SKU 的定价效率（销售额/可售库存），用「REVPAS 定价效率」。"
workflow: "配置竞品 SKU 与来源，接入多平台页面采集 → 抽取价格、币种、库存与卖家并统一币种 → 按价格波动自适应调度采集频率 → Kalman 融合多源报价并推送价格信号"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price Signal Collection — 竞品价格信号实时采集与结构化

## ① 解决的问题

价格运营面临市场价信号分散——价格信号采集将监控覆盖率提40%，年化省8万元

## ② 核心算法逻辑

竞品价格信号采集的核心挑战在于：数据异构性（多平台格式差异）、反爬对抗（动态 JS 渲染、验证码）、实时性需求（价格窗口窄、竞品调价响应快）三重矛盾。

## ③ 业务应用场景

业务背景：某母婴 DTC 品牌旗下安抚奶嘴（ASIN B0XXXX001）面对 Top5 竞品的价格战。需要在竞品降价 30 分钟内做出调价响应，否则 Buy Box 获得率从 82% 跌至 41%。
效果量化： - 竞品降价捕获率：71% → 94%（+23 pp） - 平均响应延迟：47 min → 18 min（-62%） - Buy Box 获得率月均：41% → 79%（+38 pp） - 月度 GMV 增量：约 +$32,000（基于 Buy Box 转化率提升测算）
ROI：爬取基础设施成本 $800/月，GMV 增量带来毛利约 $9,600/月，ROI ≈ 12x。

## ④ 输入数据要求

`dt_min=15`（促销期可调至 5 min）
`dt_max=1440`（非活跃 SKU 每天一次）
`lam=3.0`（调高 → 更激进高频；调低 → 更平滑）
反爬应对：建议使用住宅 IP 代理池 + User-Agent 轮换 + 随机延迟 [0.5, 3.0]s
汇率更新：`CURRENCY_RATES` 应每小时从 ECB/OpenExchangeRates 刷新

## ⑤ 输出结果

`dt_min=15`（促销期可调至 5 min）
`dt_max=1440`（非活跃 SKU 每天一次）
`lam=3.0`（调高 → 更激进高频；调低 → 更平滑）
反爬应对：建议使用住宅 IP 代理池 + User-Agent 轮换 + 随机延迟 [0.5, 3.0]s
汇率更新：`CURRENCY_RATES` 应每小时从 ECB/OpenExchangeRates 刷新

## ⑥ 业务价值 / ROI

73.2 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（349 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/pricing/price_signal_collection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Price-Signal-Collection.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Price Signal Collection Pipeline
整合 PriceHunter (DOM抽取) + DART-Price (自适应调度) + SignalFusion (Kalman融合)
使用 mock 数据，可直接运行
"""

import re
import math
import time
import random
import numpy as np
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta


# ── 数据结构 ────────────────────────────────────────────────────────────

@dataclass
class PriceRecord:
    """单次价格采集记录"""
    sku_id: str
    source: str          # amazon / walmart / 1688
    raw_price: float     # 原始价格（本地货币）
    currency: str        # USD / CNY / EUR
    timestamp: datetime
    stock_status: str    # in_stock / out_of_stock / limited
    seller: str = ""


@dataclass
class PriceSignal:
    """融合后的价格信号"""
    sku_id: str
    fused_price: float          # Kalman 融合价格（USD）
    price_change_pct: float     # 相对上次融合值的变化百分比
    volatility: float           # 历史波动率 σ
    anomaly: bool               # 是否异常（价格突变）
    sources_count: int          # 本次融合的数据源数量
    updated_at: datetime


# ── PriceHunter：DOM 语义价格抽取 ───────────────────────────────────────

class PriceHunter:
    """
    模拟 DOM 树剪枝 + 语义价格抽取
    真实环境中使用 playwright + BeautifulSoup 替换 mock_html_fetch
    """

    # 货币符号 + 数字模式
    PRICE_PATTERN = re.compile(
        r'([$€¥£₩])\s*(\d{1,6}(?:[,，]\d{3})*(?:\.\d{1,2})?)'
        r'|(\d{1,6}(?:[,，]\d{3})*(?:\.\d{1,2})?)\s*(USD|CNY|EUR|GBP)'
    )
    CURRENCY_RATES = {"USD": 1.0, "CNY": 0.138, "EUR": 1.08, "GBP": 1.27, "$": 1.0, "¥": 0.138, "€": 1.08, "£": 1.27, "₩": 0.00073}

    def extract_from_html(self, html: str, sku_id: str, source: str) -> Optional[PriceRecord]:
        """从 HTML 字符串中抽取价格"""
        matches = self.PRICE_PATTERN.findall(html)
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2501.14423 — Human Activity Recognition with a 6.5 GHz Reconfigurable Intelligent Surface for Wi-Fi 6E

核验口径：主题指向成立但强度不足（词重合 0.25／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：竞品 SKU 与平台来源清单、商品页 HTML 或接口响应（多平台、多币种）、采集频率与调度预算；数据结构含 sku_id、source、raw_price、currency、timestamp、stock_status、seller；粒度为 SKU × 来源 × 采集时刻。

**输出**：结构化价格信号（Kalman 融合价、相对上次的变动百分比、历史波动率、异常标记、数据源数量），可用于在卡页口径的 30 分钟内触发调价响应；供价格运营与定价系统消费。

## 执行步骤

1. 配置竞品 SKU 与来源清单，接入含动态渲染的多平台页面采集
2. 从页面抽取价格、币种、库存状态与卖家，并按汇率统一到目标币种
3. 用自适应调度分配采集频率，对价格窗口窄的 SKU 加密轮询
4. 用 Kalman 融合多源报价，输出融合价、波动率与价格突变异常标记
5. 把价格信号推给定价与调价流程，跟踪捕获率与响应延迟

## 边界与不做

- 数据不满足：目标平台强反爬（验证码、动态 JS 渲染）或页面响应不稳定时捕获率会下降，先解决采集稳定性。
- 何时不用：要判断的是自家 SKU 的定价效率（销售额/可售库存单位），用「REVPAS 定价效率」。
- 能力边界：只做采集、清洗与融合，不自动发起调价；采集须遵守平台条款与数据使用规范；卡页的降价捕获率 71%→94%、ROI ≈12x 为案例口径。

## 技能关联

- **前置**：Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Market-Signal-Realtime-Collection.html、Skill-Market-Signal-Realtime-Collection
- **延伸**：Skill-UCB-LDP-Dynamic-Pricing.html、Skill-UCB-LDP-Dynamic-Pricing
- **可组合**：Skill-Adaptive-Crawl-Scheduling.html、Skill-Adaptive-Crawl-Scheduling、Skill-Web-Page-Change-Detection.html、Skill-Web-Page-Change-Detection、Skill-Price-Signal-Collection

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：17-价格优化　·　源卡：`Skill-Price-Signal-Collection`