---
name: "p2s-seller-rating-attack-pattern"
title: "Seller Rating Attack Pattern — 卖家评分攻击模式识别恶意 A-to-Z 索赔检测"
description: "触发词：A-to-Z 索赔、ODR 超标、恶意索赔、新账号索赔、账号申诉。何时不用：差评集群攻击与排名打压预警走「差评攻击预警」；真实售后体验问题引发的索赔应先走服务与体验改进。安全边界：只做攻击判定与申诉材料整理，不得伪造证据或诱导买家撤诉。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 账号诊断 / 申诉材料准备"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Seller-Rating-Attack-Pattern"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "短期冒出一批新账号索赔把 ODR 顶到危险线时，判断是不是恶意攻击，并整理申诉要用的证据。"
user_try: "试试：这个月一下子来了 8 起 A-to-Z，帮我看是不是恶意攻击，顺便整理申诉要用的证据。"
whenToUse: "当 A-to-Z 或评分类索赔在短时间内集中出现、账号健康度逼近红线时用；若是差评数量异常增长，用「差评攻击预警」；若是真实售后体验问题，先走服务与体验改进。"
workflow: "汇总 A-to-Z 索赔记录并关联买家账号注册时间 → 计算时间聚集度、新账号比例与未联系卖家比例 → 给出恶意攻击判定与恶意评分 → 整理证据包并向平台提交撤销申请 → 跟踪 ODR 回落并复盘防守动作"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Seller Rating Attack Pattern — 卖家评分攻击模式识别恶意 A-to-Z 索赔检测

## ① 解决的问题

运营面临"8起A-to-Z索赔全来自7天内新账号ODR从0.3%升至1.8%接近危险线"——恶意A-to-Z攻击模式识别+证据申诉，ODR回落至0.5%，年化保护账号GMV 80-200万元

## ② 核心算法逻辑

论文：Temporal Anomaly Detection in ECommerce Rating Systems | 年份：2019

## ③ 业务应用场景

场景：某奶嘴品牌在上架第 3 个月收到 8 起 A-to-Z 索赔（正常月均 0-1 起），全部来自 7 天内注册的账号，均未联系卖家直接发起索赔，ODR 从 0.3% 升至 1.8%（危险区间）。
数据要求：Amazon Seller Central A-to-Z 记录、买家账号注册时间、订单历史、前置联系记录。
攻击检测：7 天内 8 起 A-to-Z，新账号比例 100%，无前置联系，确认为恶意攻击。向 Amazon 提交证据申请撤销，成功撤销 6 起，ODR 回落至 0.5%。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

80-200 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（91 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from collections import Counter

def analyze_atoz_claims(
    claims: list,  # [{'claim_id': str, 'date': int, 'order_amount': float, 'buyer_age_days': int, 'contacted_seller': bool, 'order_id': str}]
    total_orders_by_date: dict,  # {date: order_count}
    baseline_odr: float = 0.005
) -> dict:
    """
    A-to-Z 恶意攻击分析
    """
    if not claims:
        return {'attack_detected': False, 'malicious_score': 0}

    n = len(claims)

    # 特征1：时间聚集性（最近 7 天 A-to-Z 占比）
    max_date = max(c['date'] for c in claims)
    recent_7d = sum(1 for c in claims if c['date'] >= max_date - 7)
    time_cluster_ratio = recent_7d / n

    # 特征2：新账号比例
    new_accounts = sum(1 for c in claims if c.get('buyer_age_days', 999) < 90)
    new_account_ratio = new_accounts / n

    # 特征3：未联系卖家比例
    no_contact = sum(1 for c in claims if not c.get('contacted_seller', True))
    no_contact_ratio = no_contact / n

    # 特征4：低金额订单比例（< $20）
    low_amount = sum(1 for c in claims if c.get('order_amount', 100) < 20)
    low_amount_ratio = low_amount / n

    # 综合恶意评分
    malicious_score = (
        time_cluster_ratio * 30 +
        new_account_ratio * 30 +
        no_contact_ratio * 25 +
        low_amount_ratio * 15
    )

    # 计算当前 ODR 趋势
    dates = sorted(set(c['date'] for c in claims))
    odr_by_date = {}
    for d in dates:
        claims_today = sum(1 for c in claims if c['date'] == d)
        orders_today = total_orders_by_date.get(d, 100)
        odr_by_date[d] = claims_today / orders_today

    # 当前 ODR（最近 30 天）
    recent_claims = sum(1 for c in claims if c['date'] >= max_date - 30)
    recent_orders = sum(v for k, v in total_orders_by_date.items() if k >= max_date - 30)
    current_odr = recent_claims / (recent_orders + 1e-8)

    return {
        'attack_detected': malicious_score > 55,
        'malicious_score': round(malicious_score, 1),
        'current_odr': current_odr,
        'odr_status': 'DANGER' if current_odr > 0.01 else 'WARNING' if current_odr > 0.005 else 'OK',
        'features': {
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.11622，但该号在 arXiv 上是《Nonparametric Heterogeneous Treatment Effect Estimation in Repeated Cross Sectional Designs》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Temporal Anomaly Detection in ECommerce Rating Systems》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需 Seller Central 的 A-to-Z 索赔记录（索赔时间、订单金额、订单号）、买家账号注册时间、订单历史与买家前置联系记录，索赔单粒度。

**输出**：产出恶意攻击判定与恶意评分、支撑判定的特征依据（时间聚集度、新账号比例、无前置联系比例）、申诉证据包与撤销进展，并跟踪 ODR 从 1.8% 回落至 0.5% 的结果。

## 执行步骤

1. 汇总索赔记录并关联买家账号注册时间与订单历史
2. 计算时间聚集度、新账号比例与未联系卖家比例
3. 输出恶意攻击判定与恶意评分，确认攻击模式
4. 整理证据包并向平台提交撤销申请
5. 跟踪 ODR 变化并复盘防守动作

## 边界与不做

- 索赔为个位数且分散在不同月份时不构成攻击特征，应按正常售后流程处理
- 只做模式判定与申诉材料准备，撤销结果由平台裁决
- 申诉必须基于真实订单与联系记录，不得伪造证据或诱导买家撤诉

## 技能关联

- **可组合**：Skill-Seller-Rating-Attack-Pattern

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Seller-Rating-Attack-Pattern`