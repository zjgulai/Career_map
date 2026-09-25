---
name: "p2s-recommendation-ts-demand"
title: "推荐系统时序需求预测 — 购买序列驱动的个性化需求预警"
description: "触发词：月龄需求预测、时序推荐、需求爆发期预警、购买序列建模、前置备货。何时不用：只做当下时刻的商品排序与相似度召回时用常规推荐技能；本技能回答的是『什么时候推、什么时候备货』。安全边界：宝宝生日属敏感个人信息须获明确同意；Amazon 政策禁止基于儿童年龄定向，文案须改用育儿阶段表述、不得出现具体月龄。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Recommendation-TS-Demand"
p2s_src_domain: "05-推荐系统"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "跟着宝宝的月龄节奏预测下一个需求爆发点，提前两周把对的商品推给对的家庭，同时提醒仓库备货。"
user_try: "试试：用我的历史购买序列和商品月龄标签，预测每位用户的下一个需求爆发期，输出提前两周的推送名单与备货预警。"
whenToUse: "需求已存在、要判断推送时间点与备货前置期时用本技能；若只需在当前时刻给商品排序，用常规序列推荐技能即可。"
workflow: "接入用户历史购买序列、商品月龄标签与宝宝生日 → 训练时序协同过滤模型预测每位用户的下一个需求爆发期 → 提前两周生成推送名单与对应商品清单 → 把爆发期预警同步仓库做前置备货"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 推荐系统时序需求预测 — 购买序列驱动的个性化需求预警

## ① 解决的问题

推荐团队面临"在错误月龄段推荐商品导致转化率极低比如5月龄推辅食机"——时序协同过滤在正确月龄时间节点推送，转化率提升25%，年化GMV增量约80万元

## ② 核心算法逻辑

推荐系统和时序预测的互补融合：

## ③ 业务应用场景

场景A：基于购买序列的辅食品类需求预警 - 业务问题：辅食机在用户宝宝5.5-6月时销量激增，但根据历史购买序列（0段奶粉→奶瓶→奶嘴→），可以提前预测辅食需求，但不知道具体时间点 - 数据要求：用户历史购买序列 + 商品月龄标签 + 用户宝宝生日 - 预期产出：时序协同过滤预测每位用户的"下一个需求爆发期"，提前2周推送相关商品并预警仓库备货 - 业务价值：辅食品类推荐精准度提升40%（在正确时间推送），转化率提升约25%；前置备货减少断货损失约30万元/年
**三轨验证**： - **成本**：数据采集需接入用户购买历史API（约$500/月） + 商品月龄标签人工标注（约200小时，$3,000一次性） + 模型训练GPU成本（约$200/月）；人力投入约1.5个数据工程师月 - **合规**：需确保用户宝宝生日数据获得明确同意（GDPR第7条）；Amazon政策禁止基于儿童年龄的定向广告（需使用"育儿阶段"替代具体月龄）；避免在推送文案中出现"你的宝宝X个月"等敏感表述 - **风险**：若预测过早推送辅食机，用户可能产生"平台不了解我宝宝"的负面认知；过度备货若预测不准将导致库存积压；竞品可能通过价格战截流已预警的用户群

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：推荐精准度提升40%（在正确时间推送），转化率提升约25%，年化GMV增量约80万元；前置备货减少断货约30万元；综合约110万元
实施难度：⭐⭐⭐☆☆（矩阵分解扩展约2-3天；LLM增强版需要更多工程；难点在时序动态的实时更新）
优先级：⭐⭐⭐⭐⭐（修复05-推荐↔03-时序断层（规模70）；母婴品类的月龄驱动需求是精准推荐的核心机会）
评估依据：WWW 2023和KDD 2024均有时序推荐顶级论文；Amazon已将purchase sequence时序分析用于婴儿品类的Anticipatory Shipping；阿里婴儿母婴频道的核心算法之一就是月龄驱动时序推荐

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（104 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Recommendation-TS-Demand
推荐系统×时序需求预测

依赖：pip install numpy pandas scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_percentage_error

np.random.seed(42)

# ── 1. 生成用户购买序列数据 ───────────────────────────────────────────
n_users, n_weeks = 500, 52

PRODUCT_AGE_MAP = {
    'formula_0':   (0, 5),    # 0段奶粉：0-5月适用
    'bottle':      (0, 12),   # 奶瓶：0-12月
    'food_maker':  (5, 18),   # 辅食机：5-18月（月龄转换品）
    'stroller':    (0, 36),   # 推车：全程
    'teether':     (4, 15),   # 牙胶：4-15月
}

# 用户购买序列（按宝宝月龄驱动）
purchase_data = []
for u in range(n_users):
    baby_start_age = np.random.randint(0, 12)  # 用户开始购买时的宝宝月龄
    for w in range(n_weeks):
        current_age = baby_start_age + w * 0.23  # 每周约0.23个月
        for product, (min_age, max_age) in PRODUCT_AGE_MAP.items():
            if min_age <= current_age <= max_age:
                # 在适龄期内有购买概率，月龄临界时更高
                near_boundary = abs(current_age - min_age) < 0.5 or abs(current_age - max_age) < 0.5
                base_prob = 0.05 + 0.10 * near_boundary
                if np.random.random() < base_prob:
                    purchase_data.append({'user_id': u, 'week': w, 'product': product,
                                           'baby_age': current_age})

df = pd.DataFrame(purchase_data)
print(f"购买序列: {len(df)}条 | 用户{n_users}人 | 商品{df['product'].nunique()}类")

# ── 2. 时序协同过滤（矩阵分解+时间动态）─────────────────────────────
# 简化实现：用户-商品-周 的三维矩阵，用Ridge回归近似
def build_features(df, user_id, product, n_weeks):
    """为特定用户-商品对构建时序特征"""
    user_purchases = df[(df['user_id']==user_id) & (df['product']==product)]
    weekly_counts  = user_purchases.groupby('week').size().reindex(range(n_weeks), fill_value=0)
    # 时序特征
    features = []
    for w in range(4, n_weeks):  # 从第4周开始（需要历史窗口）
        feat = [
            weekly_counts.iloc[max(0,w-4):w].mean(),   # 过去4周均值
            weekly_counts.iloc[max(0,w-12):w].mean(),  # 过去12周均值
            np.sin(2*np.pi*w/52),                       # 年季节性
            np.cos(2*np.pi*w/52),
            w / n_weeks,                                # 归一化时间
        ]
        features.append((w, feat, weekly_counts.iloc[w]))
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2405.18684。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：用户历史购买序列、商品月龄标签、用户宝宝生日（须已获同意）。商品标签粒度到适用月龄区间（如 0-5 月、5-18 月），用户侧粒度到单个客户。

**输出**：每位用户『下一个需求爆发期』的时间点预测与对应商品清单，含提前两周的推送名单和仓库备货预警；供推荐/营销系统与仓储补货使用。

## 执行步骤

1. 接入用户购买序列、商品月龄标签与宝宝生日数据
2. 训练时序协同过滤模型预测下一个需求爆发期
3. 按预测时间点提前两周生成商品推送名单
4. 输出仓库前置备货预警
5. 按合规话术改写推送文案，避免出现具体月龄表述

## 边界与不做

- 商品缺少月龄适用标签、或用户宝宝生日缺失时不用本技能，应退回基于历史行为的通用推荐。
- 本技能输出需求时间点与备货预警，不执行广告投放、也不调度真实库存。
- 安全边界：不得基于儿童年龄做定向广告；推送文案不得出现具体月龄或育儿医疗建议。

## 技能关联

- **前置**：Skill-Agent-Time-Series-Forecasting.html、Skill-Agent-Time-Series-Forecasting、Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Prophet-Forecasting.html、Skill-Prophet-Forecasting、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge
- **延伸**：Skill-Agent-Time-Series-Forecasting.html、Skill-Agent-Time-Series-Forecasting、Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge
- **可组合**：Skill-Agent-Time-Series-Forecasting.html、Skill-Agent-Time-Series-Forecasting、Skill-User-Analytics-Logistics-Bridge.html、Skill-User-Analytics-Logistics-Bridge、Skill-Recommendation-TS-Demand

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：05-推荐系统　·　源卡：`Skill-Recommendation-TS-Demand`