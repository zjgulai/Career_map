---
name: "p2s-abandoned-cart-recovery-ml"
title: "Abandoned Cart Recovery ML — 弃购挽回机器学习：预测意图×序列触达×个性化优惠"
description: "触发词：弃购挽回、弃购分型、差异化触达、挽回率、促销时机。何时不用：只要按加购后固定时间点跑挽回序列用「加购未购自动挽回触发」；要给用户打 0-1 购买意图分档触达用「购买意图预测」。安全边界：触达须提供退订入口，短信营销须用户 opt-in（美国 TCPA），Amazon 站外引流邮件须确认域名与账号无关联；不得向比价型用户无差别发折扣，以免提前泄露促销计划。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 促销规划"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Abandoned-Cart-Recovery-ML"
p2s_src_domain: "14-用户分析"
quality_tier: "preview"
user_summary: "月有上千个弃购订单，先分清用户是比价、卡流程还是犹豫，再决定发折扣、发提醒还是发内容。"
user_try: "试试：把这 2000 个弃购订单分成比价型、摩擦型、犹豫型和意外型，分别给出触达策略。"
whenToUse: "当弃购量已经上来（卡页示例月弃购 2000 单量级）、统一发折扣效果差、需要按用户类型差异化挽回时用本技能；只要固定的延时挽回序列用「加购未购自动挽回触发」；要按 0-1 购买意图概率分档触达用「购买意图预测」。"
workflow: "整理弃购会话与用户行为特征 → 把弃购用户分为比价型、摩擦型、犹豫型、意外型 → 为每一型配置触达内容并决定是否给折扣 → 按预测类型执行触达并记录结果 → 复盘各类型挽回率并迭代分型规则"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Abandoned Cart Recovery ML — 弃购挽回机器学习：预测意图×序列触达×个性化优惠

## ① 解决的问题

当月弃购订单超过200个时，ML将弃购用户分为比价型/摩擦型/犹豫型/意外型并分别触达——挽回率从统一发折扣的3%提升到12%，同时减少对比价型用户的无效折扣损耗。

## ② 核心算法逻辑

弃购挽回是一个两阶段决策问题：

## ③ 业务应用场景

业务数据：某母婴独立站月均弃购订单2000个，客单价$180，原始挽回率3%（统一发优惠邮件）。
三轨验证： - 成本：需接入邮件/SMS/Push API（Klaviyo/SendGrid月费$200-500），ML模型训练需1名数据工程师2周工时（约$3,000），特征数据采集需埋点SDK（免费但开发集成约$1,000）。 - 合规：GDPR下需在首次触达时提供退订链接；短信营销需用户opt-in（美国TCPA要求）；Amazon站外引流邮件可能违反平台TOS（需确认独立站域名非Amazon关联）。 - 风险：过度触达（>3次/周）可能引发用户投诉或标记为垃圾邮件，导致ESP账户降权；折扣策略若被爬虫抓取，可能被竞品用于比价攻击。
反直觉洞察：促销季前2周，弃购用户中"比价型"比例从70%升至85%（大家都知道双11/黑五要打折，在等）。此时给折扣是在"提前泄露"促销计划，且白白损失利润。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（185 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after function definition on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/14-用户分析/abandoned_cart_recovery_ml` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Abandoned-Cart-Recovery-ML.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class RecoveryAction:
    channel: str        # 'email', 'sms', 'push'
    delay_hours: float  # 触达时机
    content_type: str   # 'reminder', 'social_proof', 'discount', 'friction_resolve'
    discount_pct: float # 0.0 = 无折扣


class CartAbandonmentClassifier:
    """
    弃购意图分类器：Gradient Boosting多分类
    """
    
    ABANDONMENT_TYPES = ['price_comparison', 'payment_friction', 'decision_hesitant', 'accidental']
    
    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            random_state=42
        )
        self.le = LabelEncoder()
        self.feature_cols = [
            'session_duration_min', 'scroll_depth_pct', 'image_clicks',
            'cart_items', 'cart_value', 'is_first_purchase',
            'days_since_last_order', 'device_mobile', 'hour_of_day',
            'viewed_competitors', 'payment_page_reached'
        ]
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """特征工程"""
        features = df[self.feature_cols].copy()
        features['cart_value_log'] = np.log1p(features['cart_value'])
        features['session_engagement'] = (
            features['scroll_depth_pct'] * features['session_duration_min'] / 100
        )
        return features
    
    def train(self, df: pd.DataFrame, labels: pd.Series):
        X = self.prepare_features(df)
        y = self.le.fit_transform(labels)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        print(classification_report(y_test, y_pred, target_names=self.le.classes_))
        return self
    
    def predict(self, session_data: Dict) -> Tuple[str, float]:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.12543，但该号在 arXiv 上是《Symmetric Group Gauge Theories and Simple Gauge/String Dualities》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：弃购会话特征数据（加购时间与金额、浏览与比价行为、用户历史），卡页示例为月均 2000 个弃购订单、客单价 $180 量级；粒度为单次弃购会话。

**输出**：每个弃购会话的用户类型（比价型、摩擦型、犹豫型、意外型）与对应挽回动作（是否给折扣、发什么内容）；供增长与 CRM 按类型执行触达。

## 执行步骤

1. 汇集弃购会话与加购行为特征
2. 训练分类器把弃购用户划分为四类
3. 为每类配置挽回动作：比价型不给折扣、摩擦型给流程帮助
4. 按类型执行邮件、短信或 Push 触达并记录结果
5. 复盘各类型挽回率，迭代分型规则

## 边界与不做

- 数据不满足：没有加购行为埋点、也区分不出弃购原因时，分型会退化，先补齐特征采集。
- 何时不用：只要固定的延时挽回序列用「加购未购自动挽回触发」；要按购买意图概率分档触达用「购买意图预测」。
- 能力边界：只做弃购分型与策略建议，不负责把消息真正发出去，也不保证卡页口径的挽回率。
- 安全边界：触达须带退订入口，短信需用户 opt-in；Amazon 站外引流邮件须确认域名与账号无关联；不得向比价型用户无差别发折扣以免提前泄露促销计划。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-User-Funnel-Analysis.html、Skill-User-Funnel-Analysis
- **延伸**：Skill-Email-Sequence-RL-Optimizer.html、Skill-Email-Sequence-RL-Optimizer、Skill-Post-Purchase-Email-Sequence-Optimizer.html、Skill-Post-Purchase-Email-Sequence-Optimizer
- **可组合**：Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Price-Elasticity-Estimation.html、Skill-Price-Elasticity-Estimation、Skill-Shopify-Landing-Page-CRO.html、Skill-Shopify-Landing-Page-CRO、Skill-Abandoned-Cart-Recovery-ML

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：14-用户分析　·　源卡：`Skill-Abandoned-Cart-Recovery-ML`