---
name: "p2s-brand-hijacking-realtime-monitor"
title: "Buy Box劫持实时监控 — 品牌跟卖检测与自动预警"
description: "触发词：Buy Box 劫持、跟卖监控、授权卖家白名单、价格异常告警、跟卖预警。何时不用：要识别多个跟卖账号是否同属一个集团时用「跟卖卖家网络图谱」；要判断自家 Listing 是否被算法压制时用「Listing 压制检测」。安全边界：只做检测、告警与证据文案生成，不代发律师函、不自动向平台投诉。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-065"
l3_business: "商品诊断"
l3_all: "商品诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/商品诊断"
p2s_card_id: "Skill-Brand-Hijacking-Realtime-Monitor"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯着每个 ASIN 的购物车归属与价格，一有非授权卖家低价抢 Buy Box 就立刻告警并备好举报材料。"
user_try: "试试：监控这批目标 ASIN 的 Buy Box，非授权卖家抢到购物车就告警，并生成一封含证据的 Cease & Desist 草稿。"
whenToUse: "当需要按分钟级盯住 Buy Box 归属、发现非授权跟卖并出告警与证据包时用本技能；若要判定的是一批跟卖账号是否同属一个有组织的集团，用「跟卖卖家网络图谱」；若要判断的是自家 Listing 被平台算法压制，用「Listing 压制检测」。"
workflow: "配置目标 ASIN 与授权卖家白名单，接入价格快照 → 对每个 ASIN 维护价格窗口并算 Z-score → 结合卖家是否在白名单与是否 FBA 判定劫持 → 告警并生成 Cease & Desist 草稿与每日报告"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Buy Box劫持实时监控 — 品牌跟卖检测与自动预警

## ① 解决的问题

品牌负责人面临"跟卖者在ASIN上挂Offer劫持Buy Box发现总是延迟1-3天"——轮询+Z-score异常检测将跟卖发现时间从3天压缩至15分钟，年化避损$3.2万

## ② 核心算法逻辑

Buy Box 劫持指未授权第三方卖家通过低价策略抢夺亚马逊购物车黄金入口，导致品牌方失去销售控制权。本方法结合价格时序异常检测与卖家ID轮询监控，实现亚分钟级告警：

## ③ 业务应用场景

场景A：吸奶器品牌 Buy Box 被跟卖劫持
- 业务问题：某母婴品牌 Medela 同款吸奶器 ASIN，每逢促销期（Prime Day 前72小时）频繁被未授权跟卖商以低价 $15-20 抢入 Buy Box，导致品牌官方店铺销售额骤降 40%，差评率上升（因跟卖商发货质量差） - 数据要求：目标 ASIN 列表（50-200个）、品牌授权卖家白名单、MWS/SP-API 访问权限（代码用 mock 模拟） - 预期产出： - 劫持事件检测延迟 < 20分钟 - 自动生成 Cease & Desist 邮件草稿（含证据包） - 每日监控报告（劫持次数、持续时长、价格损失估算） - 业务价值：Prime Day 期间避免 Buy Box
场景B：婴儿奶粉品牌多地仓库ASIN跟卖清除

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：Prime Day 等大促期间 Buy Box 保护，按月均跟卖损失 $2,700 估算，年化避损 $3.2 万；工具成本（API调用+服务器）约 $1,200/年，净ROI ≈ 2,500%
实施难度：⭐⭐☆☆☆（主要依赖 SP-API，mock 可先验证逻辑，正式接入需 MWS 资质）
优先级：⭐⭐⭐⭐⭐（大促前必备，直接影响收入）
数据依赖：SP-API Listing/Pricing 接口，授权卖家白名单（内部运营维护）
覆盖场景：母婴快消品（吸奶器、奶瓶、辅食）被跟卖风险最高，优先覆盖

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（206 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/brand_hijacking_realtime_monitor` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Brand-Hijacking-Realtime-Monitor.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Buy Box 劫持实时监控系统（mock API 演示版）
使用 Z-score 异常检测 + 卖家ID变更追踪 + Cease & Desist 模板生成
"""
import numpy as np
import random
from datetime import datetime, timedelta
from collections import deque
from typing import Optional
import json


# ────── Mock 数据层 ──────

AUTHORIZED_SELLERS = {"BRAND_OFFICIAL_STORE", "AUTH_DIST_001", "AUTH_DIST_002"}

def mock_fetch_buy_box(asin: str) -> dict:
    """模拟 Amazon SP-API 返回的 Buy Box 快照"""
    # 模拟正常价格 + 随机劫持事件
    base_price = 29.99
    seller_pool = list(AUTHORIZED_SELLERS) + ["HIJACK_SELLER_X", "HIJACK_SELLER_Y"]
    is_hijack = random.random() < 0.3  # 30% 概率触发劫持事件
    
    if is_hijack:
        seller_id = random.choice(["HIJACK_SELLER_X", "HIJACK_SELLER_Y"])
        price = base_price - random.uniform(3, 8)  # 低价劫持
    else:
        seller_id = "BRAND_OFFICIAL_STORE"
        price = base_price + random.uniform(-0.5, 0.5)
    
    return {
        "asin": asin,
        "seller_id": seller_id,
        "price": round(price, 2),
        "timestamp": datetime.now().isoformat(),
        "is_fba": not is_hijack,
    }


# ────── 监控引擎 ──────

class BuyBoxMonitor:
    def __init__(self, window_size: int = 20, z_threshold: float = 2.5):
        self.window_size = window_size
        self.z_threshold = z_threshold
        self.price_windows: dict[str, deque] = {}
        self.last_sellers: dict[str, str] = {}
        self.alerts: list[dict] = []
    
    def _update_price_window(self, asin: str, price: float) -> None:
        if asin not in self.price_windows:
            self.price_windows[asin] = deque(maxlen=self.window_size)
        self.price_windows[asin].append(price)
    
    def _compute_zscore(self, asin: str, price: float) -> Optional[float]:
        """计算当前价格 Z-score（相对历史窗口）"""
        window = list(self.price_windows[asin])
        if len(window) < 5:
            return None
        mu = np.mean(window)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09841，但该号在 arXiv 上是《Monoculture in Matching Markets》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：目标 ASIN 列表（卡页 50-200 个）、品牌授权卖家白名单、SP-API/MWS 的 Buy Box 快照（卖家 ID、价格、时间戳、是否 FBA）；无接口资质时先用 mock 数据验证逻辑；粒度为 ASIN × 轮询时刻。

**输出**：跟卖劫持告警（卡页口径检测延迟 <20 分钟）、Cease & Desist 邮件草稿与证据包、每日监控报告（劫持次数、持续时长、价格损失估算）；供品牌保护与运营值班使用。

## 执行步骤

1. 配置目标 ASIN 清单与品牌授权卖家白名单，接入 SP-API Listing/Pricing 快照（无资质先用 mock 验证逻辑）
2. 对每个 ASIN 维护价格滚动窗口，计算当前价格的 Z-score
3. 结合卖家 ID 是否在授权白名单内与是否非 FBA，判定跟卖劫持
4. 触发告警并自动生成 Cease & Desist 邮件草稿与证据包
5. 每日汇总劫持次数、持续时长与价格损失估算，输出监控报告

## 边界与不做

- 数据不满足：没有授权卖家白名单时，任何非白名单卖家都会被误判为跟卖，必须先由运营维护白名单；无 SP-API/MWS 资质只能先跑 mock。
- 何时不用：要识别的是有组织的跟卖集团（多账号共享图片或供应商），用「跟卖卖家网络图谱」；要判断的是 Listing 被算法压制而非被抢购物车，用「Listing 压制检测」。
- 能力边界：只做检测、告警与证据文案生成，不代发律师函、不自动投诉；卡页的年化避损 $3.2 万、净 ROI ≈2,500% 为案例测算。

## 技能关联

- **前置**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring
- **延伸**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-IP-Trademark-Brand-Monitoring.html、Skill-IP-Trademark-Brand-Monitoring
- **可组合**：Skill-AI-Fake-Review-Detection.html、Skill-AI-Fake-Review-Detection、Skill-Brand-Hijacking-Realtime-Monitor

---

> 分类：业务运营/渠道经营/商品诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Brand-Hijacking-Realtime-Monitor`