---
name: "p2s-personalized-ml-pricing"
title: "Personalized ML Pricing — 个性化 ML 定价：用户级支付意愿驱动的差异化定价"
description: "触发词：个性化定价、支付意愿预测、差异化展示、用户分层定价、价格实验、WTP 建模。何时不用：用购买条件分档定价时用「Price Fence 分档定价」；从评论读价格信号时用「评论价格信号分析」。安全边界：差异化定价须避开受保护属性与价格歧视红线，个人信息使用需取得授权，模型输出人工审核后才可上线。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 分群"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Personalized-ML-Pricing"
p2s_src_domain: "17-价格优化"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让每个访客看到自己愿意付的价格：用历史购买和浏览行为估个体支付意愿，把愿意多付的人的价值接住。"
user_try: "试试：我独立站对所有用户都是 $149，帮我用历史购买和浏览行为估一版用户级支付意愿，并给出分档展示方案。"
whenToUse: "当同一商品对不同用户展示不同价格或折扣、且手上有用户历史购买与实时行为数据时用本技能；若想用购买条件（订阅、批量）划分价格档，用「Price Fence 分档定价」；若价格判断来自评论语义，用「评论价格信号分析」。"
workflow: "汇总用户历史购买记录、当前会话行为与历史价格实验数据 → 用特征提取函数把用户特征转成数值向量 → 训练支付意愿预测模型（生产环境使用真实 A/B 实验数据） → 按 WTP 区间生成个性化展示价与折扣策略 → 对比统一定价的利润增益后灰度上线"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Personalized ML Pricing — 个性化 ML 定价：用户级支付意愿驱动的差异化定价

## ① 解决的问题

DTC独立站对所有用户展示相同价格$149但高消费老用户愿意付$169而新用户最多付$129——ML预测用户个体支付意愿并差异化展示价格，利润提升10-18%加上价格敏感用户转化率提升年化增益20-60万元

## ② 核心算法逻辑

市场级定价 vs 个性化定价：

## ③ 业务应用场景

业务问题：独立站吸奶器标价 $149，对所有用户相同。实际上： - 老用户群（历史购买均价 $180+）：愿意付 $169 - 新用户群（来自 Google 搜索"最便宜吸奶器"）：最高愿意付 $129 - 若不区分，要么流失价格敏感用户，要么损失高 WTP 用户的溢价
数据要求： - 用户历史购买记录（均价/频率/品类） - 当前 session 行为（停留时间/页面路径/设备） - 历史价格实验数据（不同价格点的转化率）
预期产出： - 每位用户的 WTP 估计（区间而非点估计） - 个性化显示价格建议（含折扣显示策略） - 预期利润提升：vs 统一定价的收益对比

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
利润提升 10-18%（更充分利用 WTP 分布）：月增利润 ¥5-15 万
价格敏感用户转化率提升（展示合适价格）：月增 GMV ¥3-10 万
高 WTP 用户溢价捕捉（减少"本来愿意多付"的机会损失）
年化综合 ROI：¥20-60 万
实施难度：⭐⭐⭐⭐☆（需要用户行为数据基础设施 + WTP 历史实验标注；法律合规边界需注意；约 6-8 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（168 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/pricing/personalized_ml_pricing` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Personalized-ML-Pricing.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Personalized ML Pricing
个性化ML定价：用户级WTP估计与差异化定价策略
"""
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from dataclasses import dataclass


@dataclass
class UserPricingFeatures:
    """用户定价特征"""
    user_id: str
    avg_past_purchase_price: float    # 历史购买均价
    purchase_frequency: int            # 购买次数
    days_since_last_purchase: int
    is_repeat_buyer: bool
    session_duration_sec: float        # 当前访问时长
    pages_viewed: int                  # 浏览页面数
    comparison_events: int             # 竞品对比次数（价格敏感信号）
    device_type: str                   # mobile / desktop / tablet
    acquisition_channel: str           # organic / paid / email / direct
    region_tier: int                   # 1=一线 2=二线 3=三四线


def extract_feature_vector(user: UserPricingFeatures) -> np.ndarray:
    """将用户特征转为数值向量"""
    device_score = {'mobile': 0.6, 'desktop': 0.8, 'tablet': 0.7}.get(user.device_type, 0.7)
    channel_score = {'direct': 1.0, 'email': 0.9, 'organic': 0.7, 'paid': 0.6}.get(user.acquisition_channel, 0.7)
    price_sensitivity_proxy = 1 - min(1, user.comparison_events / 3)  # 越多对比越敏感

    return np.array([
        user.avg_past_purchase_price / 200,    # 归一化
        user.purchase_frequency / 10,
        1 / (1 + user.days_since_last_purchase / 30),
        float(user.is_repeat_buyer),
        min(1, user.session_duration_sec / 300),
        min(1, user.pages_viewed / 10),
        price_sensitivity_proxy,
        device_score,
        channel_score,
        (4 - user.region_tier) / 3,
    ])


class WTPPredictor:
    """支付意愿预测模型"""

    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=100, max_depth=3, random_state=42)
        self.is_trained = False

    def generate_training_data(self, n_samples: int = 500, seed: int = 42):
        """生成模拟训练数据（生产中用真实A/B实验数据）"""
        np.random.seed(seed)
        features_list = []
        wtp_labels = []

        for _ in range(n_samples):
            avg_price = np.random.lognormal(5.0, 0.5)  # ~$150 均值
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2406.18234，但该号在 arXiv 上是《Measurement-Induced Spectral Transition》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户历史购买记录（均价、频次、品类）、当前会话行为（停留时长、浏览页数、竞品对比次数、设备与获客渠道、地区档位）与历史价格实验数据（各价格点的转化率）；粒度为用户 × 访问会话。

**输出**：每位用户的支付意愿估计（区间形式）与个性化显示价格或折扣建议，以及相对统一定价的利润对比；供独立站运营与定价团队评审后上线。

## 执行步骤

1. 汇总用户历史购买记录、会话行为与历史价格实验数据
2. 把用户特征转成数值向量并对齐模型输入
3. 训练支付意愿预测模型并校验拟合与泛化
4. 按 WTP 区间生成个性化展示价与折扣建议
5. 估算相对统一定价的利润增益后灰度上线

## 边界与不做

- 数据不满足：没有用户级历史购买与行为数据、也没有价格实验标注时，模型学不出个体差异。
- 何时不用：按购买条件分档用「Price Fence 分档定价」；从评论判断价格阻力用「评论价格信号分析」。
- 能力边界：只做支付意愿预测与展示建议，不含前端价格投放系统改造与法律合规审查。
- 安全边界：个性化定价须避开受保护属性与价格歧视红线，个人信息使用需授权，上线前人工审核。

## 技能关联

- **前置**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **延伸**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-LLM-Negotiation-Conversion-Agent.html、Skill-LLM-Negotiation-Conversion-Agent、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing
- **可组合**：Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Personalized-ML-Pricing

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Personalized-ML-Pricing`