---
name: "p2s-dtc-customer-acquisition-attribution"
title: "DTC Customer Acquisition Attribution — 独立站全渠道获客归因：从首触到首单的因果追踪"
description: "触发词：多触点归因、Shapley值、独立站首单、上漏斗误判、切断后果模拟。何时不用：没有用户级触点序列或订单无法按用户关联时不适用；站内无用户级路径的归因走MMM类技能。安全边界：用户级触点与订单数据须脱敏使用，归因结论用于预算决策，不直接改动渠道投放。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-096"
l3_business: "预算分配"
l3_all: "预算分配 / 投放诊断"
l1_l2_l3: "业务运营/品牌与增长/预算分配"
p2s_card_id: "Skill-DTC-Customer-Acquisition-Attribution"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "用 Shapley 归因还原每个渠道的真实边际贡献，避免把上游种草渠道误当亏损渠道砍掉。"
user_try: "试试：我们独立站 TikTok ROAS 只有0.8、Google 4.2，帮我用 Shapley 归因判断该不该砍 TikTok、砍了会怎样。"
whenToUse: "当独立站存在多触点路径、Last-Click 归因与直觉冲突、需要判断砍掉某渠道的连带影响时用本卡；站内渠道贡献分解（无用户级路径）用 MMM；预算比例分配用多平台预算分配器。"
workflow: "采集用户级触点序列与各渠道成本 → 关联 Shopify 订单数据标记转化 → 计算各渠道组合转化率与 Shapley 边际贡献 → 对比因果 ROAS 与 Last-Click ROAS → 输出建议分配与切断后果模拟"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# DTC Customer Acquisition Attribution — 独立站全渠道获客归因：从首触到首单的因果追踪

## ① 解决的问题

DTC独立站TikTok ROAS看起来亏损于是砍掉投放但整体流量随之崩塌——Shapley多触点因果归因揭示TikTok是Google搜索的上游触发器，正确预算分配后真实ROAS提升20-40%，年化保护GMV50-150万元

## ② 核心算法逻辑

DTC 独立站的获客归因比 Amazon 更复杂：用户从 TikTok 看到广告 → Google 搜索品牌词 → 邮件召回 → 最终在独立站购买。LastClick 归因把全部功劳给邮件，导致砍掉 TikTok 预算后流量暴跌——却不知道原因。

## ③ 业务应用场景

业务问题：独立站月预算 $30K，TikTok $15K，Google $10K，Email $5K。GMO报告显示 TikTok ROAS 0.8（亏损），Google ROAS 4.2（盈利）。运营计划砍掉 TikTok——但这是 Last-Click 归因的错误判断，TikTok 实际上带来了大量首次曝光用户后来被 Google 转化。
数据要求： - 用户级别的触点序列（需要 UTM 参数 + 会话 ID 拼接） - 各渠道的曝光/点击/成本数据 - Shopify 订单数据（含订单 ID、用户 ID、时间戳）
预期产出： - Shapley 归因分配：各渠道真实边际贡献百分比 - 建议预算分配：基于因果 ROAS 而非 Last-Click ROAS - "切断后果"模拟：如果砍掉 TikTok，预测 Google 转化量会下降多少

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
避免错误砍掉 TikTok 等上漏斗渠道：保护月 GMV ¥30-100 万
正确预算分配后真实 ROAS 提升 20-40%：月增利润 ¥5-20 万
新市场进入渠道决策准确：节省 ¥5-20 万的试错成本
年化综合 ROI：¥50-150 万
实施难度：⭐⭐⭐☆☆（需要 UTM 埋点体系 + Shopify API；Shapley 计算约 2-3 周工程量）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（167 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/growth_model/dtc_customer_acquisition_attribution` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-DTC-Customer-Acquisition-Attribution.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DTC Customer Acquisition Attribution
多触点因果归因：Shapley值 + 马尔可夫链模型
"""
import numpy as np
from itertools import combinations
from collections import defaultdict


def generate_dtc_journey_data(n_users=500, seed=42):
    """生成模拟 DTC 独立站用户触点路径数据"""
    np.random.seed(seed)
    channels = ['TikTok', 'Google_Brand', 'Google_NonBrand', 'Email', 'SEO', 'Direct']

    # 转化路径模板（模拟母婴独立站用户行为）
    path_templates = [
        (['TikTok', 'Google_Brand', 'Email'], 0.25),      # TikTok引流→品牌搜索→邮件转化
        (['Google_NonBrand', 'Google_Brand'], 0.20),       # 搜索意图驱动
        (['SEO', 'Email', 'Email'], 0.15),                 # SEO发现→邮件培育
        (['TikTok', 'TikTok', 'Google_Brand'], 0.15),    # 多次曝光→搜索
        (['Google_Brand'], 0.10),                           # 直接搜索转化
        (['Email'], 0.08),                                  # 直接邮件转化
        (['Direct'], 0.07),                                 # 直接访问
    ]

    journeys = []
    for i in range(n_users):
        rand = np.random.random()
        cump = 0
        for path, prob in path_templates:
            cump += prob
            if rand <= cump:
                # 加噪声变化
                actual_path = list(path)
                if np.random.random() < 0.2:
                    extra = np.random.choice(channels)
                    actual_path.insert(np.random.randint(0, len(actual_path)), extra)
                converted = np.random.random() < 0.15  # 15%转化率
                journeys.append({'user_id': f'U{i:04d}', 'path': actual_path, 'converted': converted})
                break

    return journeys


def shapley_attribution(journeys):
    """
    Shapley值多触点归因
    计算每个渠道在所有可能子集中的边际贡献
    """
    # 统计各渠道组合的转化率
    combo_conversions = defaultdict(lambda: {'conversions': 0, 'total': 0})

    for j in journeys:
        channels_set = frozenset(j['path'])
        combo_conversions[channels_set]['total'] += 1
        if j['converted']:
            combo_conversions[channels_set]['conversions'] += 1

    # 转化率函数
    def v(S):
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2312.09154，但该号在 arXiv 上是《CMG-Net: Robust Normal Estimation for Point Clouds via Chamfer Normal Distance and Multi-scale Geometry》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户级触点序列（需 UTM 参数加会话 ID 拼接）、各渠道曝光、点击与成本数据，以及 Shopify 订单数据（订单 ID、用户 ID、时间戳）用于标记转化。

**输出**：各渠道的 Shapley 真实边际贡献百分比、基于因果 ROAS 的建议预算分配，以及砍掉某渠道的连带影响模拟，供增长团队做渠道取舍决策。

## 执行步骤

1. 采集用户级触点序列并拼接 UTM 与会话 ID
2. 汇总各渠道曝光、点击与成本数据
3. 关联 Shopify 订单数据标记每个用户是否转化
4. 统计各渠道组合的转化率并计算 Shapley 边际贡献
5. 对比因果 ROAS 与 Last-Click ROAS 定位被误判的上漏斗渠道
6. 输出建议预算分配与切断后果模拟

## 边界与不做

- 何时不用：没有用户级触点埋点、或订单无法与用户标识关联时不适用；无用户级路径的场景应改用 MMM 类技能。
- 能力边界：只产出归因结果与分配建议，不直接改动渠道投放；样本量与路径覆盖不足时渠道贡献估计不稳定。
- 数据边界：用户标识须脱敏使用，触点与订单数据仅在授权范围内关联。

## 技能关联

- **前置**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Growth-DataAgent-Analytics.html、Skill-Growth-DataAgent-Analytics、Skill-KOL-ROI-Causal-Attribution.html、Skill-KOL-ROI-Causal-Attribution、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-WhatsApp-Private-Domain-Analytics.html、Skill-WhatsApp-Private-Domain-Analytics
- **延伸**：Skill-Channel-Saturation-Curve.html、Skill-Channel-Saturation-Curve、Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Growth-DataAgent-Analytics.html、Skill-Growth-DataAgent-Analytics、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-WhatsApp-Private-Domain-Analytics.html、Skill-WhatsApp-Private-Domain-Analytics
- **可组合**：Skill-GEO-Generative-Engine-Optimization.html、Skill-GEO-Generative-Engine-Optimization、Skill-Growth-DataAgent-Analytics.html、Skill-Growth-DataAgent-Analytics、Skill-LLM-Session-Personalization-Cache.html、Skill-LLM-Session-Personalization-Cache、Skill-WhatsApp-Private-Domain-Analytics.html、Skill-WhatsApp-Private-Domain-Analytics、Skill-DTC-Customer-Acquisition-Attribution

---

> 分类：业务运营/品牌与增长/预算分配　·　技术族：06-增长模型　·　源卡：`Skill-DTC-Customer-Acquisition-Attribution`