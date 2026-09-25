---
name: "p2s-position-bias-debiasing-rec"
title: "Position Bias Debiasing Recommendation — 位置偏差去偏公平推荐"
description: "触发词：位置偏差、去偏训练、新品曝光、公平推荐。何时不用：曝光日志缺少位置字段时无法估计倾向分数；新品完全无数据需主动探索流量时用老虎机类技能。安全边界：用随机实验估计倾向分数时，需确保随机策略不损害用户体验。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-023"
l3_business: "组合取舍"
l3_all: "组合取舍 / 商品诊断"
l1_l2_l3: "业务运营/产品与创新/组合取舍"
p2s_card_id: "Skill-Position-Bias-Debiasing-Rec"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "用逆倾向加权纠正位置偏差，让被历史曝光抬高的老品不再霸屏、新品有机会露出。"
user_try: "试试：老 ASIN 靠历史曝光霸屏、新品拿不到流量，帮我做一版位置去偏的排序训练方案。"
whenToUse: "本卡属「组合取舍」。排序模型受位置偏差影响、老品长期霸屏需要纠正时用本卡；新品完全无数据、需要主动分配探索流量时用上下文老虎机类技能。"
workflow: "采集含位置字段的曝光日志 → 估计位置倾向分数 → 用 IPS 或双重稳健损失重训模型 → 对比去偏前后的排序指标"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Position Bias Debiasing Recommendation — 位置偏差去偏公平推荐

## ① 解决的问题

运营面临"老ASIN因历史曝光多CTR虚高持续霸屏、新品流量<老品1/10"——IPS逆倾向去偏将模型NDCG@10提升12%、新品前10位占比从8%升至18%，年化广告节省约30万元

## ② 核心算法逻辑

位置偏差（Position Bias） 是推荐系统中最普遍的系统性偏差：用户点击行为受商品展示位置强烈影响，排名靠前的商品获得更多点击，无论其真实质量如何。这导致训练数据中的点击信号"因果混淆"——我们观测到的是"被曝光后点击"，而非"真实偏好"。

## ③ 业务应用场景

场景1：Amazon Search 结果位置去偏，改善新品排名公平性 - 业务问题：Search 推荐模型用原始 CTR 训练，老 ASIN 因历史曝光多、CTR 虚高持续霸屏，新品即使质量更好也难以获得流量；新品曝光机会 < 老品 1/10 - 数据要求：Search 曝光日志（ASIN、位置 k、用户 ID、是否点击）、最近 90 天数据 - 预期产出：去偏后模型 NDCG@10 提升 12%，新品（上线 <30 天）在前 10 位的占比从 8% 提升至 18% - 业务价值：新品孵化效率提升，减少对外部广告投入的依赖，年化广告节省约 30 万元
场景2：Listing 详情页"相关推荐"位置公平化 - 业务问题：Listing 页推荐栏中，曝光位置 1-3 的点击率是 7-10 位的 5-8 倍，但点击不一定是真实偏好，导致推荐越来越同质化 - 数据要求：商品详情页推荐曝光日志（位置、点击、后续购买）、商品特征向量 - 预期产出：基于去偏模型的推荐与实际购买相关性（AUROC）从 0.72 提升至 0.81 - 业务价值：推荐质量提升减少"看了不买"，Session CVR 提升 8%，年化约 40 万元
**三轨验证**： - 成本：IPS 去偏仅修改训练损失函数，无需改变推理架构；额外计算开销 <5% - 合规：去偏不影响用户隐私；若用随机实验估计倾向分数，需确保随机策略不损害用户体验 - 风险：倾向分数估计偏差会放大 IPS 方差；需定期重估（月度），防止位置-点击分布漂移

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：NDCG@10 提升 10-15%，新品流量公平化减少广告依赖，年化综合价值约 50-80 万元（广告节省+推荐质量提升）
实施难度：⭐⭐☆☆☆（仅需修改训练损失函数，对现有推荐架构侵入最小）
优先级：⭐⭐⭐⭐☆
评估依据：实施成本极低（改损失函数），但效果显著；尤其对新品孵化场景，是性价比最高的推荐优化手段之一

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（101 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np

# ============================================================
# Position Bias Debiasing（IPS + DR 去偏推荐训练）
# ============================================================

def estimate_propensity_scores(
    click_logs: list[dict], n_positions: int = 10
) -> np.ndarray:
    """
    从点击日志估计各位置倾向分数 p(click | position)
    click_logs: [{"position": int, "clicked": bool}, ...]
    """
    impressions = np.zeros(n_positions)
    clicks = np.zeros(n_positions)
    for log in click_logs:
        pos = min(log["position"], n_positions - 1)
        impressions[pos] += 1
        if log["clicked"]:
            clicks[pos] += 1
    # 防止除零
    propensity = clicks / (impressions + 1e-9)
    return propensity

def ips_loss(predictions: np.ndarray, labels: np.ndarray,
             propensities: np.ndarray, clip_min: float = 0.01) -> float:
    """
    IPS（逆倾向分数）加权损失
    predictions: 模型预测分数 [0,1]
    labels: 真实点击标签 {0,1}
    propensities: 每条样本对应的倾向分数
    """
    propensities = np.clip(propensities, clip_min, 1.0)
    weights = np.where(labels == 1, 1.0 / propensities, 1.0 / (1.0 - propensities + 1e-9))
    # 二元交叉熵
    eps = 1e-7
    pred = np.clip(predictions, eps, 1 - eps)
    bce = -(labels * np.log(pred) + (1 - labels) * np.log(1 - pred))
    weighted_loss = np.mean(weights * bce)
    return float(weighted_loss)

def doubly_robust_loss(predictions: np.ndarray, labels: np.ndarray,
                       direct_model_preds: np.ndarray,
                       propensities: np.ndarray,
                       clip_min: float = 0.01) -> float:
    """
    DR-IPS 双鲁棒损失
    direct_model_preds: 直接估计模型的预测（可用简单线性模型）
    """
    propensities = np.clip(propensities, clip_min, 1.0)
    eps = 1e-7
    pred = np.clip(predictions, eps, 1 - eps)
    dm_pred = np.clip(direct_model_preds, eps, 1 - eps)

    # 直接估计项
    dm_loss = -(labels * np.log(dm_pred) + (1 - labels) * np.log(1 - dm_pred))

    # IPS 修正项
    actual_loss = -(labels * np.log(pred) + (1 - labels) * np.log(1 - pred))
    ips_correction = (labels - direct_model_preds) / propensities * (actual_loss - dm_loss)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.06195，但该号在 arXiv 上是《NeuSpin: Design of a Reliable Edge Neuromorphic System Based on Spintronics for Green AI》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：搜索或推荐位曝光日志（商品 ID、位置 k、用户 ID、是否点击），最近 90 天数据，以及商品特征向量。

**输出**：去偏后的排序模型与评估结果：NDCG@10 变化、新品在前 10 位的占比变化、推荐与实际购买的相关性，用于排序上线与流量公平性评估。

## 执行步骤

1. 采集含位置字段的曝光与点击日志
2. 估计各位置的倾向分数
3. 用 IPS 或双重稳健损失重训排序模型
4. 对比去偏前后的 NDCG 与新品曝光占比
5. 输出上线建议并设定倾向分数月度重估机制

## 边界与不做

- 曝光日志缺少位置字段、无法估计倾向分数时不用本卡
- 本卡只产出训练损失改造与评估结论，不负责线上排序服务发布
- 倾向分数估计偏差会放大方差，用随机实验估计时需确保随机策略不损害用户体验

## 技能关联

- **前置**：Skill-CAGED-Debiased-Rec.html、Skill-CAGED-Debiased-Rec、Skill-Causal-Deconfounded-Recommendation.html、Skill-Causal-Deconfounded-Recommendation、Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **延伸**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization
- **可组合**：Skill-Contextual-Bandits-Rec.html、Skill-Contextual-Bandits-Rec、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Position-Bias-Debiasing-Rec

---

> 分类：业务运营/产品与创新/组合取舍　·　技术族：05-推荐系统　·　源卡：`Skill-Position-Bias-Debiasing-Rec`