---
name: "p2s-cross-platform-account-linkage-risk"
title: "Cross-Platform Account Linkage Risk — 跨平台账号关联风险（Amazon+Walmart+eBay）"
description: "触发词：跨平台关联、硬关联软关联、账号隔离、支付账号共用、设备指纹。何时不用：只在单平台内做多维信号关联图用「账号关联检测」；只要单账号对的指纹相似分用「账号指纹风险评分器」。安全边界：支付与登录数据仅用于内部风险评分，不得对外共享或挪作他用；关联判定存在误报，隔离动作须人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-080"
l3_business: "账号诊断"
l3_all: "账号诊断 / 规则监测"
l1_l2_l3: "业务运营/渠道经营/账号诊断"
p2s_card_id: "Skill-Cross-Platform-Account-Linkage-Risk"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "一边平台被封，另一边当天就被限制：先算出两个平台的账号是靠支付、设备还是 IP 绑在一起，再决定先断哪条。"
user_try: "试试：算一下我们 Amazon 和 Walmart 两个账号的跨平台关联风险，指出硬关联和软关联各来自哪里。"
whenToUse: "当同一运营方同时经营多个平台账号、要判断一个平台出事会不会波及另一个平台时用本技能；只在单平台内做多账号信号关联图用「账号关联检测」；只要账号对指纹相似分用「账号指纹风险评分器」。"
workflow: "汇总各平台账号的注册信息、登录 IP 与支付信息台账 → 区分硬关联（同支付账号等）与软关联（同设备、同 IP） → 计算跨平台关联风险分并标注触发路径 → 输出隔离措施，如更换支付账户、专用设备登录 → 跟踪隔离后各平台的告警与状态变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Platform Account Linkage Risk — 跨平台账号关联风险（Amazon+Walmart+eBay）

## ① 解决的问题

跨平台运营面临"Amazon账号封号后Walmart账号当日也收到限制警告"——跨平台账号关联风险评分识别硬软关联并启动隔离，年化保护多平台GMV 100-300万元

## ② 核心算法逻辑

论文：Deep Graph Neural Networks for Account Linkage Detection in ECommerce | 年份：2019

## ③ 业务应用场景

场景：某卖家在 Amazon 和 Walmart 同时运营，两个账号使用同一台电脑登录（相同设备指纹）。Amazon 账号因 Listing 违规被封后，Walmart 账号同日也收到限制警告（软关联触发）。
数据要求：各平台账号注册信息、登录 IP 记录、支付信息（内部台账）、ASIN 发布时间。
应用：关联风险评分工具识别出硬关联（同支付账号）和软关联（同设备），立即启动账号隔离措施：更换支付账户、专用设备登录。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100 万元

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（90 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import hashlib
from collections import defaultdict

def compute_linkage_risk(
    accounts: list  # [{'platform': str, 'account_id': str, 'email': str, 'bank_last4': str, 'ip_prefix': str, 'device_hash': str}]
) -> dict:
    """
    跨平台账号关联风险分析
    返回账号对之间的关联评分
    """
    n = len(accounts)
    linkage_matrix = [[0.0] * n for _ in range(n)]
    linkage_details = defaultdict(list)

    for i in range(n):
        for j in range(i + 1, n):
            a, b = accounts[i], accounts[j]
            score = 0
            reasons = []

            # 硬关联（高风险）
            if a.get('email') and a['email'] == b.get('email'):
                score += 90
                reasons.append('相同邮箱（硬关联）')

            if a.get('bank_last4') and a['bank_last4'] == b.get('bank_last4'):
                score += 85
                reasons.append('相同银行账号（硬关联）')

            # 软关联（中风险）
            if a.get('ip_prefix') and a['ip_prefix'] == b.get('ip_prefix'):
                score += 40
                reasons.append('相同 IP 段（软关联）')

            if a.get('device_hash') and a['device_hash'] == b.get('device_hash'):
                score += 50
                reasons.append('相同设备指纹（软关联）')

            score = min(100, score)
            linkage_matrix[i][j] = linkage_matrix[j][i] = score

            if score > 0:
                pair_key = f"{a['account_id']}__{b['account_id']}"
                linkage_details[pair_key] = {
                    'platforms': (a['platform'], b['platform']),
                    'linkage_score': score,
                    'reasons': reasons,
                    'risk_level': 'HIGH' if score >= 70 else 'MEDIUM' if score >= 40 else 'LOW'
                }

    # 计算每个账号的最大关联风险
    account_risk = []
    for i, acc in enumerate(accounts):
        max_risk = max((linkage_matrix[i][j] for j in range(n) if j != i), default=0)
        account_risk.append({
            'account_id': acc['account_id'],
            'platform': acc['platform'],
            'max_linkage_risk': max_risk,
            'risk_level': 'HIGH' if max_risk >= 70 else 'MEDIUM' if max_risk >= 40 else 'LOW'
        })
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.11946，但该号在 arXiv 上是《EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《Deep Graph Neural Networks for Account Linkage Detection in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各平台账号注册信息、登录 IP 记录、支付信息（内部台账）、ASIN 发布时间；粒度为账号对 × 平台。

**输出**：跨平台关联风险评分与硬关联、软关联拆解，以及账号隔离措施建议；供跨平台运营负责人预防连坐限制。

## 执行步骤

1. 汇集各平台账号的注册、登录 IP 与支付信息台账
2. 判定硬关联（同支付账号）与软关联（同设备、同 IP）
3. 计算跨平台关联风险分并定位主要触发路径
4. 输出隔离动作：更换支付账户、专用设备与独立网络
5. 定期复检并记录隔离后的平台告警变化

## 边界与不做

- 数据不满足：拿不到各平台登录记录或支付台账时判定不了关联类型，先补齐内部台账。
- 何时不用：只做单平台内多账号关联图用「账号关联检测」；只要账号对指纹相似分用「账号指纹风险评分器」。
- 能力边界：只输出风险评分与隔离建议，不代改平台账户信息，也不保证与平台风控判定一致。
- 安全边界：支付与登录数据仅限内部风险评分使用，不得对外共享或用于其他目的。

## 技能关联

- **可组合**：Skill-Cross-Platform-Account-Linkage-Risk

---

> 分类：业务运营/渠道经营/账号诊断　·　技术族：19-风控反欺诈　·　源卡：`Skill-Cross-Platform-Account-Linkage-Risk`