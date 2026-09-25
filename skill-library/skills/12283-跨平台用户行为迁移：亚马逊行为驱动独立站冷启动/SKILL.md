---
name: "p2s-cross-platform-user-transfer"
title: "Cross-Platform User Behavior Transfer — 跨平台用户行为迁移：亚马逊行为驱动独立站冷启动"
description: "触发词：跨平台用户迁移、独立站冷启动、Amazon 老买家偏好迁移、邮箱匹配对齐、偏好向量初始化、冷启动推荐。何时不用：要预测单次会话的购买意图用「Purchase Intent Prediction」，要做用户分层与留存判断用「RFM Customer Segmentation」；本技能只解决独立站首周还没有站内行为时的推荐初始化。安全边界：邮箱属个人信息，须有合法授权并做哈希对齐、不留存明文邮箱；迁移结果须人工复核后上线，卡页 ROI（CTR 提升 20-35%、年化 ¥10-30 万）为估算口径。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-069"
l3_business: "站点运营"
l3_all: "站点运营 / 转化优化"
l1_l2_l3: "业务运营/渠道经营/站点运营"
p2s_card_id: "Skill-Cross-Platform-User-Transfer"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "把 Amazon 老买家的购买偏好迁到刚上线的独立站，让推荐系统第一天就能个性化，而不是只推千篇一律的热销榜。"
user_try: "试试：我们独立站首周用邮件邀请了 500 位用户注册，其中约 80% 是 Amazon 老买家，帮我把他们的 Amazon 购买历史迁移成初始偏好向量，并给出与热销榜对比的 CTR 评估方案。"
whenToUse: "独立站刚上线、用户没有站内行为但能用邮箱匹配到 Amazon 购买历史，需要初始化个性化推荐时用；要预测单次会话购买意图用「Purchase Intent Prediction」，要做用户价值分层用「RFM Customer Segmentation」，站内已有足量行为后的常规推荐不属本技能。"
workflow: "汇总 Amazon 购买历史（product_id、category、price、timestamp）与独立站注册邮箱 → 按邮箱把 Amazon 老买家对齐到独立站用户，算出跨平台对齐率 → 按品类聚合购买次数、最近时间与均价，提取 affinity／recency／price_tier 偏好 → 按 domain_shift_factor 把偏好迁移成独立站初始用户向量 → 用 A/B 测试对比冷启动个性化推荐与热销榜的 CTR"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Cross-Platform User Behavior Transfer — 跨平台用户行为迁移：亚马逊行为驱动独立站冷启动

## ① 解决的问题

DTC独立站刚上线用户没有行为历史只能展示热销榜推荐——将Amazon老买家的购买偏好迁移到独立站，第一天就能个性化推荐比热销榜CTR提升20-35%年化GMV增益10-30万元

## ② 核心算法逻辑

跨平台冷启动问题：

## ③ 业务应用场景

业务问题：品牌独立站刚上线，第一周有 500 位用户注册（通过邮件邀请）。其中 80% 是之前 Amazon 的老买家。如果能把他们的 Amazon 购买历史迁移过来，推荐系统第一天就能运行，而不是展示千篇一律的热销榜。
数据要求： - Amazon 购买历史（通过亚马逊订单导出 API） - 用户邮件匹配（Amazon 邮件 = 独立站注册邮件）
预期产出： - 跨平台用户对齐率（多少 Amazon 用户可以匹配到独立站） - 迁移后的初始用户偏好向量 - 冷启动推荐 vs 热销榜的 CTR 对比（A/B 测试）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
独立站第一天就有个性化推荐（vs 等 3-6 个月）：早期 CVR 提升 20-35%
用户对齐率 60-80%：大多数 Amazon 老买家可以无缝迁移偏好
减少独立站建站初期的推荐冷启动损失
年化综合 ROI：¥10-30 万
实施难度：⭐⭐⭐☆☆（用户邮件匹配 1 周；偏好提取算法 2 周；Domain Adaptation 深度版约 4-6 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（144 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/user_analytics/cross_platform_user_transfer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Cross-Platform-User-Transfer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Cross-Platform User Behavior Transfer
跨平台用户行为迁移：Amazon行为驱动独立站冷启动
"""
import numpy as np
from dataclasses import dataclass, field
from collections import defaultdict


@dataclass
class PlatformUser:
    """跨平台用户"""
    email: str
    amazon_purchases: list = field(default_factory=list)  # [(product_id, category, price, timestamp)]
    dtc_interactions: list = field(default_factory=list)  # 独立站行为（通常为空）


@dataclass
class CategoryPreference:
    """用户品类偏好"""
    category: str
    affinity: float      # 0-1，偏好强度
    recency: float       # 0-1，最近是否活跃
    price_tier: str      # low/mid/high，价格档位偏好


def extract_amazon_preferences(user: PlatformUser) -> list[CategoryPreference]:
    """从 Amazon 购买历史提取品类偏好"""
    cat_data = defaultdict(lambda: {'count': 0, 'total_price': 0, 'max_ts': 0})

    for product_id, category, price, timestamp in user.amazon_purchases:
        cat_data[category]['count'] += 1
        cat_data[category]['total_price'] += price
        cat_data[category]['max_ts'] = max(cat_data[category]['max_ts'], timestamp)

    max_count = max(d['count'] for d in cat_data.values()) if cat_data else 1
    max_ts = max(d['max_ts'] for d in cat_data.values()) if cat_data else 1

    preferences = []
    for cat, data in cat_data.items():
        affinity = data['count'] / max_count
        recency = data['max_ts'] / max_ts if max_ts > 0 else 0
        avg_price = data['total_price'] / data['count']
        price_tier = 'high' if avg_price > 150 else ('mid' if avg_price > 60 else 'low')

        preferences.append(CategoryPreference(cat, affinity, recency, price_tier))

    return sorted(preferences, key=lambda p: -p.affinity * p.recency)


def transfer_to_dtc_profile(amazon_preferences: list[CategoryPreference],
                             domain_shift_factor: float = 0.8) -> np.ndarray:
    """
    将 Amazon 偏好迁移为独立站初始用户嵌入
    domain_shift_factor: 0-1，越低说明两平台差异越大
    """
    # 将偏好编码为向量（简化版，生产用神经域适配）
    categories = ['breast_pump', 'bottle', 'sterilizer', 'accessories', 'clothing', 'car_seat']
    cat_to_idx = {c: i for i, c in enumerate(categories)}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.18234，但该号在 arXiv 上是《Recent Developments in Degenerate Higher Order Scalar Tensor Theories》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：两个来源、用户级粒度：① Amazon 购买历史（经订单导出 API），字段为 product_id、category、price、timestamp 的逐笔购买记录；② 独立站注册用户表，含注册邮箱与站点品类体系。对齐键为邮箱（Amazon 邮箱 = 独立站注册邮箱），品类需能映射到站点体系（卡页代码口径为 breast_pump／bottle／sterilizer／accessories／clothing／car_seat）。卡页示例规模为首周 500 位注册用户、其中约 80% 为 Amazon 老买家；购买历史跨度越长，affinity 与 recency 越可靠，缺邮箱或购买品类字段则无法对齐。

**输出**：用户级产出：跨平台用户对齐率、每位可对齐用户的品类偏好（category、affinity 0-1、recency 0-1、price_tier low/mid/high）、迁移后的独立站初始用户偏好向量，以及冷启动个性化推荐与热销榜的 CTR 对比 A/B 结果；供 DTC 站点运营与推荐上线决策使用。

## 执行步骤

1. 汇总 Amazon 逐笔购买记录（product_id／category／price／timestamp）与独立站注册邮箱
2. 用邮箱把 Amazon 老买家对齐到独立站用户并算出跨平台对齐率
3. 按品类聚合购买次数、最近时间与均价，提取 affinity、recency 与 price_tier
4. 按 domain_shift_factor 把 Amazon 偏好迁移成独立站初始用户向量
5. 设计 A/B 测试对比冷启动个性化推荐与热销榜的 CTR，输出上线建议

## 边界与不做

- 数据不满足：拿不到可授权导出的 Amazon 购买历史，或注册邮箱无法与 Amazon 邮箱对齐时不要用——先补齐订单导出与邮箱匹配键，否则只能退回热销榜。
- 何时不用：要预测单次会话购买意图用「Purchase Intent Prediction」，要做用户分层与留存价值判断用「RFM Customer Segmentation」；站内已有足量行为后属常规推荐，不再需要跨平台迁移。
- 能力边界：只做跨平台偏好对齐与初始向量迁移，不替代独立站自身推荐模型的持续训练，效果口径也只覆盖上线首日的冷启动对比。
- 安全边界：邮箱属个人信息，须有合法授权、哈希对齐且不留存明文，迁移结果须人工复核后上线；卡页 ROI（早期 CVR 提升 20-35%、对齐率 60-80%、年化 ¥10-30 万）为估算口径，落地须用本店实际数据重算。

## 技能关联

- **前置**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **延伸**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction
- **可组合**：Skill-DTC-Customer-Acquisition-Attribution.html、Skill-DTC-Customer-Acquisition-Attribution、Skill-Federated-Cross-Seller-Recommendation.html、Skill-Federated-Cross-Seller-Recommendation、Skill-Cross-Platform-User-Transfer

---

> 分类：业务运营/渠道经营/站点运营　·　技术族：14-用户分析　·　源卡：`Skill-Cross-Platform-User-Transfer`