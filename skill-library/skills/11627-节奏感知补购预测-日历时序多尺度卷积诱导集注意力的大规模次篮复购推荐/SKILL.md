---
name: "p2s-case-cadence-aware-repurchase-prediction"
title: "CASE节奏感知补购预测 — 日历时序多尺度卷积+诱导集注意力的大规模次篮复购推荐"
description: "触发词：补购预测、购买节奏、复购提醒、时序卷积、诱导集注意力、次篮推荐。何时不用：只做队列留存体检用 Cohort 留存分析；要学习每个用户的补购节奏并决定提醒时机时用本卡。安全边界：仅使用购买时间戳与商品 ID 等非敏感字段，推送须遵守平台消息政策并提供退订，控制频次避免被判垃圾消息。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-CASE-Cadence-Aware-Repurchase-Prediction"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "学会每个用户和每类商品的补购节奏，在快用完的前几天提醒，把复购率提上去。"
user_try: "试试：这是我的订单数据（用户、商品、下单时间），帮我构建购买节奏信号，预测每位用户下次补购时间并排出提醒计划。"
whenToUse: "与「购买序列预测」相比：要预测下一购买品类与路径用那张卡；已知品类、要卡准补购时点做提醒时用本卡的节奏感知预测。"
workflow: "用订单数据构建 90 天购买节奏信号 → 多尺度卷积提取 7/14/30/60 天周期模式 → 识别高节奏商品（卡页如纸尿裤 28 天、奶粉 30 天） → 按个体节奏在窗口前推送补购提醒并做 A/B 对照"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# CASE节奏感知补购预测 — 日历时序多尺度卷积+诱导集注意力的大规模次篮复购推荐

## ① 解决的问题

母婴卖家3个月复购率仅22%因为补购提醒时机完全靠猜——CASE日历时序多尺度卷积学习每个SKU的个性化复购节奏，Top-5 Recall提升9.9%，复购率从22%提升至29%（2026 arXiv:2604.06718）

## ② 核心算法逻辑

反直觉洞察：大多数次篮预测模型把购买历史当作"离散访问事件的序列"，按购物车顺序建模。但对于复购品（纸尿裤、奶粉、洗手液），关键不是购买顺序，而是购买节奏——每个SKU都有独特的补购周期（日本品牌奶粉月均一罐，某品牌纸尿裤每28天一箱）。CASE将购买历史表示为日历时序信号而非序列索引，使模型能直接学习"距上次购买N天→该商品补购概率"的节奏模式。

## ③ 业务应用场景

- 业务问题：母婴跨境卖家的复购率远低于国内电商（3个月复购率约22% vs 国内35%），原因是没有节奏感知的补购提醒，买家在海外平台找不到自己之前买过的品牌，不得不重新搜索 - 数据要求：用户购买历史（订单ID/商品ID/下单时间），至少6个月历史 - CASE应用： 1. 对每位母婴用户，构建90天购买节奏信号 2. 识别高节奏商品（纸尿裤：28天周期，奶粉：30天） 3. 在用户购买后第25天推送精准补购提醒 4. Top-5 recall 比基线序列模型提升 +9.9% - 预期产出：3个月复购率从22%提升至约29%，客户LTV提升32% - 业务价值：每提升1%复购率 = 年GM
三轨验证： - 成本：数据采集成本低（标准电商事件数据即可）；计算资源约$500/月（单机GPU推理，百万用户级）；人力投入约2人月（模型适配+推送系统对接） - 合规：不涉及用户敏感信息（仅使用购买时间戳和商品ID）；推送通知需遵循Amazon平台消息政策（避免过度推送导致投诉）；GDPR下需提供退订选项 - 风险：若推送时机过于精准（如用户刚打开另一平台即收到提醒），可能引发用户隐私担忧；竞品可能模仿节奏策略导致价格战；需监控推送频次避免被平台判定为垃圾消息
- 业务问题：Prime Day后买家大量购买，但很多在3-6个月内没有再次复购，平台通知策略粗糙（发太早→忘记，发太晚→已在别处购买） - CASE机制：对每个SKU学习个性化最优提醒时机（而非固定的"购买后30天"），精准匹配每个用户的实际消耗速度 - 预期产出：补购提醒转化率从4.2%提升至约8.5%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月GMV $100万的跨境母婴店，复购率从22%提升至29%，月均增量收入约$7万；年化$84万；系统建设约$3万，ROI>2000%
实施难度：⭐⭐⭐☆☆（需要用户-商品-时间戳历史，模型相对轻量；生产扩展需注意诱导集注意力的K值调优）
优先级：⭐⭐⭐⭐⭐（复购是母婴跨境最核心的增长杠杆，比获客便宜5-7倍）
适用规模：有至少3个月购买历史的用户群，日均活跃用户>1000即可受益
数据依赖：用户ID + 商品ID + 购买时间戳（标准电商事件数据）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（158 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/case_cadence_aware_repurchase_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-CASE-Cadence-Aware-Repurchase-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
CASE节奏感知次篮补购预测
基于 arXiv:2604.06718 (2026)
多尺度时序卷积 + 诱导集注意力，生产级复购预测
"""
import numpy as np
import warnings
warnings.filterwarnings('ignore')


def build_cadence_signal(purchase_dates, horizon_days=90):
    """
    构建商品购买节奏信号（日历时序表示）
    Args:
        purchase_dates: 购买发生的天数列表（距今天数，负数=过去）
        horizon_days: 历史窗口长度
    Returns:
        signal: shape (horizon_days,)，1表示该天有购买
    """
    signal = np.zeros(horizon_days)
    for d in purchase_dates:
        idx = horizon_days + d  # d是负数（过去），转为正向索引
        if 0 <= idx < horizon_days:
            signal[idx] = 1.0
    return signal


def multiscale_temporal_conv(signal, scales=(7, 14, 30, 60)):
    """
    多尺度时序卷积特征提取
    Args:
        signal: 购买节奏信号 (T,)
        scales: 卷积尺度列表（对应周/双周/月/季节）
    Returns:
        features: (len(scales),) — 每个尺度的节奏强度
    """
    features = []
    T = len(signal)
    for s in scales:
        # 均值池化近似卷积（简化版）
        kernel = np.ones(s) / s
        if T >= s:
            conv = np.convolve(signal, kernel[::-1], mode='valid')
            features.append(float(conv.max()))  # 最强节奏响应
        else:
            features.append(0.0)
    return np.array(features)


def induced_set_attention(item_features, n_inducing=4):
    """
    诱导集注意力：建模商品间交叉依赖
    简化版：用k-means诱导点聚合
    Args:
        item_features: (n_items, d_feat) — 每个商品的特征向量
        n_inducing: 诱导点数量 K
    Returns:
        enhanced_features: (n_items, d_feat)
    """
    from sklearn.cluster import KMeans
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.06718 — CASE: Cadence-Aware Set Encoding for Large-Scale Next Basket Repurchase Recommendation

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户购买历史（用户 ID、商品 ID、下单时间），至少 6 个月；卡页要求日均活跃用户 1000 以上，无需敏感字段。

**输出**：每位用户的下次补购时间与 Top-K 补购商品预测、按节奏排定的提醒计划与效果评估（卡页 Top-5 recall 提升 9.9%、3 个月复购率 22%→29%），供运营与 CRM 使用。

## 执行步骤

1. 构建每位用户与每个 SKU 的购买节奏信号。
2. 用多尺度时序卷积提取不同周期的复购模式。
3. 用注意力机制聚合候选商品，输出补购概率排序。
4. 计算每位用户的补购窗口并生成提醒时点。
5. 评估 A/B 对照下的提醒转化与复购率提升并迭代阈值。

## 边界与不做

- 何时不用：历史不足 6 个月、订单数据缺商品或时间戳时不要用；复购周期很短、无需预测的品类不必上模型。
- 能力边界：产出预测与提醒计划，不代发消息；复购率 22%→29%、年化 $84 万等为卡页案例值，推送须控制频次避免骚扰。
- 安全边界：不得使用敏感信息做节奏建模，推送须提供退订。

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-Event-Driven-Demand-MAS.html、Skill-Event-Driven-Demand-MAS、Skill-LTV-Prediction-ZILN.html、Skill-LTV-Prediction-ZILN、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-Promotional-Demand-Planning
- **延伸**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Customer-Journey-Decision-Tree.html、Skill-Customer-Journey-Decision-Tree、Skill-Event-Driven-Demand-MAS.html、Skill-Event-Driven-Demand-MAS、Skill-Promotional-Demand-Planning
- **可组合**：Skill-Event-Driven-Demand-MAS.html、Skill-Event-Driven-Demand-MAS、Skill-Promotional-Demand-Planning、Skill-CASE-Cadence-Aware-Repurchase-Prediction

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：14-用户分析　·　源卡：`Skill-CASE-Cadence-Aware-Repurchase-Prediction`