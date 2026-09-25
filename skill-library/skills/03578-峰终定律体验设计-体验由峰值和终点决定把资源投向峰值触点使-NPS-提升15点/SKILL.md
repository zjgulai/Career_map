---
name: "p2s-peak-end-rule-customer-experience"
title: "峰终定律体验设计 — 体验由峰值和终点决定，把资源投向峰值触点使 NPS 提升15点"
description: "触发词：峰终定律、触点情感评分、负峰消除、终点强化、NPS提升、预算投向。何时不用：要做评论内容维度分析而非旅程触点分析时不适用；要做留存预测用「评论语言特征留存预测」。安全边界：旅程情感与行为数据采集须按隐私政策明示告知并取得明确同意；涉及儿童信息须按跨境电商数据出境与儿童信息保护要求特殊处理。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-06"
l2_domain: "服务与体验"
l3_id: "DOM-06-114"
l3_business: "体验分析"
l3_all: "体验分析 / 使用旅程"
l1_l2_l3: "业务运营/服务与体验/体验分析"
p2s_card_id: "Skill-Peak-End-Rule-Customer-Experience"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "预算别撒在所有触点上：先消掉物流延误这个负峰，再强化开箱这个终点，NPS 提 15 点、复购率涨 18%。"
user_try: "试试：对下单到复购的全链路做触点情感评分，找出负峰和终点并给出资源投向建议。"
whenToUse: "当体验预算分散、触点众多却效果不显、需要决定把资源压在哪个触点时用本技能；若要做的是评论内容维度的分析或留存预测，本技能不适用，改用对应的评论分析技能。"
workflow: "采集各触点的情感评分与旅程时序数据 → 按触点评分识别正峰、负峰与终点 → 测算峰终加权的 NPS 与复购影响 → 给出消除负峰与强化终点的具体动作 → 用 A/B 验证优化效果"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 峰终定律体验设计 — 体验由峰值和终点决定，把资源投向峰值触点使 NPS 提升15点

## ① 解决的问题

用户体验负责人面临"品牌体验预算分散在所有触点效果远低于预期"——峰终定律将预算集中在峰值和终点触点，NPS提升15点复购率+18%，年化$7.2万

## ② 核心算法逻辑

峰终定律（PeakEnd Rule）：人对一段体验的整体评价，不是全程体验的积分均值，而是由两个时刻决定：

## ③ 业务应用场景

场景A：母婴跨境电商全链路峰终优化 - 业务问题：NPS=28，复购率 31%，差评集中在「收货等待」和「开箱」两个阶段 - 触点调研：对 200 名用户做旅程情感评分，发现： - 正峰：「下单成功」瞬间（情感得分 +3.8） - 负峰：「快递延误 Day10」（-4.2，是拉低 NPS 的主因） - 终点：「首次开箱/使用」（得分 +2.1，但未充分利用） - 方案：① 升级终点：定制开箱卡+产品使用视频二维码（使终点得分 +2.1 → +4.0）；② 消除负峰：Day8 主动预告延误+补偿券（-4.2 → -1.5） - 预期产出：NPS 提升 15 点（28→43），复购率 +18%（3
场景B：客服触点体验终点强化 - 发现：客服解决问题后用户满意度 5.8/10，但结束语「好的，祝您生活愉快」让最后印象停留在平淡 - 优化：结束时主动告知「已帮您记录本次问题，下次同类问题30秒内解决」 - 结果：CSAT 从 5.8 升至 7.2（+24%），即使解决时长未变
**三轨验证** | 成本轨：Peak-End规则数据采集月均成本1200元（服务器日志存储300元+数据分析工具400元+人工标注12小时/月500元），RFM模型维护月均800元（算法优化8小时/月400元+A/B测试400元），总计月均2000元 | 合规轨：符合《个人信息保护法》第二十三条（用户行为分析需明示告知），需在隐私政策中披露Peak-End数据采集范围，获得用户明确同意；符合跨境电商数据出境规范，母婴产品涉及儿童信息需特殊保护 | 风险轨：数据泄露风险（概率15%，影响高），可能导致用户投诉和平台处罚；Peak-End偏差识别不准确（概率25%），影响复购转化效果；高价值客户

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：集中改善物流等待（负峰）+ 开箱（终点），NPS 提升 15 点、复购率 +6pp，月增量复购 300 单，年化增量收入 $7.2 万（基于月订单 5,000、AOV $42）
实施难度：⭐⭐⭐☆☆（需要客户旅程各触点评分数据收集体系；开箱体验改造有一次性包装成本 $0.3-0.8/单）
优先级：⭐⭐⭐⭐⭐（NPS 是 LTV 的最强预测因子；峰终优化比均匀提升全触点成本低 60%）
适用条件：能收集各触点满意度评分（CSAT / 星级评价 / NPS 分项）；有物流延误数据
关键指标：负峰（最差触点）得分 < -2 的用户流失率是普通用户 2.3 倍；优先消除 -3 以下的触点

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（203 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 48 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/peak_end_rule_customer_experience` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Peak-End-Rule-Customer-Experience.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
峰终定律客户体验分析：
1. 客户旅程触点情感评分时序分析
2. 峰值/终点识别
3. 峰终加权 NPS 预测模型
4. 资源分配优化（把钱投在峰值触点）
"""

import numpy as np
import pandas as pd
from scipy import stats
from scipy.signal import find_peaks
import warnings
warnings.filterwarnings('ignore')

# ── 1. 定义客户旅程触点 ──
print("=" * 65)
print("【峰终定律客户旅程分析】")
print("=" * 65)

TOUCHPOINTS = [
    "01_搜索发现",
    "02_商品详情页",
    "03_价格评估",
    "04_加入购物车",
    "05_结算下单",
    "06_支付成功",
    "07_发货通知",
    "08_物流跟踪等待",
    "09_预计到达前1天",
    "10_实际收货",
    "11_开箱体验",
    "12_首次使用",
    "13_客服（如触发）",
    "14_复购/沉默期",
]

# 模拟两组用户：当前状态 vs 峰终优化后
np.random.seed(42)
N_USERS = 500

def simulate_journey_scores(n_users, optimized=False):
    """
    模拟每位用户在各触点的情感得分（-5到+5）
    optimized=True 时，峰值触点和终点得分更高
    """
    # 各触点基础均值和标准差（当前状态）
    touchpoint_params = {
        "01_搜索发现":       (1.5, 1.2),
        "02_商品详情页":     (2.0, 1.5),
        "03_价格评估":       (0.5, 2.0),
        "04_加入购物车":     (2.5, 1.0),
        "05_结算下单":       (1.8, 1.3),
        "06_支付成功":       (3.8, 0.8),   # 正峰候选
        "07_发货通知":       (2.2, 1.0),
        "08_物流跟踪等待":   (-2.5, 2.0),  # 负峰（等待焦虑）
        "09_预计到达前1天":  (1.5, 1.5),
        "10_实际收货":       (2.8, 1.2),
        "11_开箱体验":       (2.1, 1.8),   # 终点候选（当前未充分利用）
        "12_首次使用":       (3.2, 1.3),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2301.12345，但该号在 arXiv 上是《Chemotactic motility-induced phase separation》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：各触点满意度评分（CSAT、星级、NPS 分项）与旅程时序数据、物流延误数据；卡页示例为对 200 名用户做旅程情感评分。

**输出**：触点情感分布与峰值、终点识别结果，峰终加权的 NPS 预测、资源投向建议与优化前后对比；供用户体验与运营团队决策。

## 执行步骤

1. 采集客户旅程各触点的情感评分数据
2. 按触点评分识别正峰、负峰与终点时刻
3. 测算峰终加权模型下的 NPS 与复购影响
4. 针对负峰与终点给出具体改进行动
5. 用 A/B 对比验证优化前后的 NPS 变化

## 边界与不做

- 数据不满足：没有各触点满意度评分与旅程数据时无法识别峰终，只能退回整体满意度调查。
- 何时不用：评论内容维度分析用「差评根因分析」，留存预测用「评论语言特征留存预测」。
- 能力边界：只做触点评分分析与资源投向建议，不直接改造物流或包装供应链。
- 安全边界：旅程与行为数据采集须明示告知并获同意，儿童相关信息须特殊保护。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Loss-Aversion-Promotion-Design.html、Skill-Loss-Aversion-Promotion-Design、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-Peak-End-Rule-Customer-Experience

---

> 分类：业务运营/服务与体验/体验分析　·　技术族：14-用户分析　·　源卡：`Skill-Peak-End-Rule-Customer-Experience`