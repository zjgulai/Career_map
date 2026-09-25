---
name: "p2s-ai-algorithmic-bias-audit"
title: "AI Algorithmic Bias Audit — AI 算法偏见审计：跨境电商推荐公平性检测"
description: "触发词：算法偏见审计、公平性指标、曝光日志、EU AI Act、推荐合规。何时不用：怀疑的是定价层面的价格歧视用「算法定价公平性审计」；要测 AI 助手回复的安全边界用「负责任 AI 红队测试」。安全边界：结论属内部合规文档，须按透明度义务准备；日志含用户属性，须按 GDPR 最小化与匿名化。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-036"
l3_business: "算法评估设计"
l3_all: "算法评估设计"
l1_l2_l3: "业务运营/产品与创新/算法评估设计"
p2s_card_id: "Skill-AI-Algorithmic-Bias-Audit"
p2s_src_domain: "11-AI人文"
quality_tier: "preview"
user_summary: "用公平性指标检查推荐系统是否对德国和法国用户给出系统性不同的曝光，并输出 EU AI Act 需要的合规说明材料。"
user_try: "试试：用我们的推荐曝光日志审计 DE 和 FR 用户的公平性差异，并生成合规文件草稿。"
whenToUse: "面向欧洲市场部署推荐系统、需要出示公平性说明或排查新品曝光偏差时用本技能；若怀疑的是价格层面的歧视，用「算法定价公平性审计」；若要测 AI 助手的安全边界，用「负责任 AI 红队测试」。"
workflow: "准备推荐曝光日志、用户属性与商品属性数据 → 计算 Demographic Parity 与 Equal Opportunity 差异 → 做偏见来源分析，区分数据偏见与算法放大 → 输出公平性指标报告与合规文件模板"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AI Algorithmic Bias Audit — AI 算法偏见审计：跨境电商推荐公平性检测

## ① 解决的问题

品牌向欧洲市场扩张时推荐系统对德国vs法国用户存在系统性差异可能违反EU AI Act——因果公平性审计框架检测算法偏见并生成合规文档，避免最高30M美元罚款同时提升欧洲市场CVR5-10%

## ② 核心算法逻辑

推荐算法的偏见来源于两个层面：

## ③ 业务应用场景

业务问题：2025年 EU AI Act 要求部署在欧洲的推荐系统提供"算法公平性说明"。卖家的 Shopify 独立站推荐系统是否存在对德国用户 vs 法国用户的系统性偏差？
数据要求： - 推荐系统的曝光日志（用户 ID + 推荐商品 + 用户地区） - 用户属性（地区/语言/设备类型） - 商品属性（价格档位/品类/新旧商品）
预期产出： - 公平性指标报告：Demographic Parity / Equal Opportunity 差异 - 偏见来源分析：是数据偏见还是算法放大 - EU AI Act 合规文件模板：算法说明 + 公平性测试结果

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
避免 EU AI Act 违规罚款：最高 $30M 或营收 6%（避损为主）
新品曝光公平性修复：首月 GMV 提升 15-30%（取决于新品占比）
建立算法透明度品牌信任：欧洲市场 CVR 提升 5-10%
年化综合 ROI：¥30-200 万（以避损为主）
实施难度：⭐⭐☆☆☆（统计方法；需要推荐系统日志权限；合规文档模板化约 2 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（144 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ai_humanities/ai_algorithmic_bias_audit` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/11-AI人文/Skill-AI-Algorithmic-Bias-Audit.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AI Algorithmic Bias Audit
推荐系统公平性检测：统计公平 + 反事实公平 + 曝光公平
"""
import numpy as np
from collections import defaultdict


def generate_recommendation_logs(n_users=1000, seed=42):
    """生成模拟推荐系统日志数据"""
    np.random.seed(seed)

    # 用户属性
    regions = np.random.choice(['DE', 'FR', 'US', 'UK'], n_users, p=[0.3, 0.25, 0.3, 0.15])
    genders = np.random.choice(['F', 'M', 'unknown'], n_users, p=[0.65, 0.25, 0.1])
    age_groups = np.random.choice(['18-25', '26-35', '36-45', '45+'], n_users, p=[0.15, 0.55, 0.25, 0.05])

    # 商品属性
    n_items = 200
    item_age_days = np.random.exponential(90, n_items)  # 上架天数
    item_prices = np.random.lognormal(4.0, 0.6, n_items)
    item_categories = np.random.choice(['breast_pump', 'bottle', 'sterilizer', 'accessory', 'clothing'],
                                        n_items)

    # 推荐日志（含偏见：新品系统性减少曝光）
    logs = []
    for u_idx in range(n_users):
        n_recommendations = np.random.poisson(8)
        # 模拟算法偏见：老品（age > 60天）被推荐概率更高
        item_probs = np.exp(-item_age_days / 200)  # 越新越不被推荐（偏见！）
        item_probs = item_probs / item_probs.sum()
        recommended = np.random.choice(n_items, min(n_recommendations, n_items),
                                        replace=False, p=item_probs)
        for item_id in recommended:
            clicked = np.random.random() < 0.12
            logs.append({
                'user_id': u_idx,
                'region': regions[u_idx],
                'gender': genders[u_idx],
                'item_id': item_id,
                'item_age_days': item_age_days[item_id],
                'item_price': item_prices[item_id],
                'item_category': item_categories[item_id],
                'clicked': clicked,
            })

    return logs, item_age_days


def audit_exposure_fairness(logs, item_age_days):
    """曝光公平性审计：新品 vs 老品"""
    new_threshold = 30  # 上架30天内为新品
    new_items = set(i for i, age in enumerate(item_age_days) if age <= new_threshold)
    old_items = set(i for i, age in enumerate(item_age_days) if age > new_threshold)

    new_exposures = sum(1 for l in logs if l['item_id'] in new_items)
    old_exposures = sum(1 for l in logs if l['item_id'] in old_items)

    new_prop = new_exposures / len(logs)
    old_prop = old_exposures / len(logs)
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2404.01234，但该号在 arXiv 上是《GFLean: An Autoformalisation Framework for Lean via GF》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：推荐系统曝光日志（用户 ID + 推荐商品 + 用户地区）、用户属性（地区 / 语言 / 设备类型）、商品属性（价格档位 / 品类 / 新旧商品）。

**输出**：公平性指标报告（Demographic Parity / Equal Opportunity 差异）、偏见来源分析（数据偏见还是算法放大）、EU AI Act 合规文件模板（算法说明 + 公平性测试结果）。

## 执行步骤

1. 准备曝光日志与用户、商品属性数据
2. 计算 Demographic Parity 与 Equal Opportunity 差异
3. 区分是数据偏见还是算法放大造成差异
4. 输出公平性指标报告与合规文件模板
5. 修复曝光偏差后复测公平性指标

## 边界与不做

- 拿不到曝光日志或用户地区等受保护属性标签时不适用，无法计算群体差异指标
- 输出是公平性指标与合规文档模板，不构成法律意见，最终合规结论须经法务确认
- 日志含用户属性，须按 GDPR 做最小化与匿名化处理

## 技能关联

- **前置**：Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-Algorithmic-Accountability-Audit.html、Skill-Algorithmic-Accountability-Audit、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-Cross-Border-Compliance-Framework.html、Skill-Cross-Border-Compliance-Framework、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining
- **延伸**：Skill-AI-Explainability-Consumer-Trust.html、Skill-AI-Explainability-Consumer-Trust、Skill-Algorithmic-Accountability-Audit.html、Skill-Algorithmic-Accountability-Audit、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining
- **可组合**：Skill-Algorithmic-Accountability-Audit.html、Skill-Algorithmic-Accountability-Audit、Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-VOC-Compliance-Signal-Mining.html、Skill-VOC-Compliance-Signal-Mining、Skill-AI-Algorithmic-Bias-Audit

---

> 分类：业务运营/产品与创新/算法评估设计　·　技术族：11-AI人文　·　源卡：`Skill-AI-Algorithmic-Bias-Audit`