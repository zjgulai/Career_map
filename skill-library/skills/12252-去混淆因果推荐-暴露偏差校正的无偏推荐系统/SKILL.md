---
name: "p2s-causal-deconfounded-recommendation"
title: "去混淆因果推荐 — 暴露偏差校正的无偏推荐系统"
description: "触发词：去偏推荐、暴露偏差、IPS 加权、倾向得分、无偏排序。何时不用：要生成式地给新品做嵌入推荐用「扩散模型推荐」；要压制首页同质化用「多样性重排 SMMR」。安全边界：倾向得分取倒数会放大估计误差，必须做权重裁剪（卡页示例上限 50）；随机展示流量仅用于校准，不得用本方法歧视性压低某类商品曝光。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 组合取舍"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-Causal-Deconfounded-Recommendation"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "把推荐系统因位置和流行度造成的偏见校正回来，让真正相关的新品不再被老爆款压住。"
user_try: "试试：用我们 1-5% 的随机展示流量校准倾向得分，把被压到第 10 位的吸奶器算回真实相关性排名。"
whenToUse: "当推荐被流行度偏差与展示位置偏差拖住、需要无偏排序（尤其新品与长尾）时用本技能；要生成式地做新品推荐用「扩散模型推荐」；要压制首页同质化用「多样性重排 SMMR」。"
workflow: "采集历史交互日志并保留展示位置字段 → 从 1-5% 随机展示流量估计倾向得分 → 做 IPS 加权并裁剪极端权重 → 重排候选并对比校正前后的排名 → 上线后观察新品与长尾的转化变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 去混淆因果推荐 — 暴露偏差校正的无偏推荐系统

## ① 解决的问题

电商团队面临"推荐系统流行度偏差导致新品和长尾商品被系统性低估"——IPS去混淆推荐使Precision@20提升35%，年化新品孵化价值约180万元

## ② 核心算法逻辑

推荐系统的根本偏差问题：

## ③ 业务应用场景

场景A：新品冷启动的无偏排序 - 业务问题：新款婴儿吸奶器上线初期曝光少，点击率被低估，推荐系统将其排在第10位（实际相关性排第3位）。导致新品冷启动失败，月销量只有旧款的15% - 数据要求：历史交互日志（含展示位置）+ 1-5%随机展示的小实验数据（用于倾向得分校准）+ 用户画像特征 - 预期产出：AutoDebias校正后，新款吸奶器的"真实相关性"排名从10位提升至3位；部署后新品GMV提升约40%，比盲目给新品流量扶持（会损害旧款的收入）更精准 - 业务价值：新品冷启动成功率从30%提升至55%，年化新品孵化价值约120万元；减少流行度偏差导致的"马太效应"，促进商品多样性，用户满意
三轨对抗验证： 1. 成本验证：需要1-5%的随机展示流量用于倾向得分校准（短期CTR略降），但长期收益显著；计算开销与标准矩阵分解相当 2. 合规验证：倾向得分加权是推荐算法的内部训练策略，无平台合规风险；注意不可用此方法歧视性地降低某类商品的曝光 3. 风险验证：倾向得分估计误差会被放大（因为取倒数作为权重）；需要裁剪极端权重（Clipping）防止方差爆炸：$w_{clip} = \min(w, W_{max})$，通常 $W_{max} = 50$
**三轨验证** | 成本轨：月均成本3,200元（服务器GPU计算1,500元/月、数据标注人工1,200元/月、模型维护400元/月、人工投入12小时/月）| 合规轨：符合《个人信息保护法》第24条（个性化推荐需告知用户）、《电商法》第18条（推荐算法透明度要求）、跨境合规需满足目标国隐私法规（如GDPR若涉及欧洲用户）；建议部署用户同意机制和推荐解释模块 | 风险轨：①推荐偏差风险（概率35%）- 过度推荐高价产品导致用户投诉；②数据泄露风险（概率15%）- 婴儿用户敏感信息暴露；③模型漂移风险（概率40%）- 季节性需求变化导致CTR下降；④跨境支付风险（概率20%）- 汇率波动影响复

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：新品冷启动成功率从30%提升至55%，年化新品孵化价值约120万元；减少马太效应提升多样性，用户满意度NPS+5，长期留存价值约60万元；综合约180万元/年
实施难度：⭐⭐⭐⭐☆（IPS加权的工程实现较简单，但需要1-5%的RCT流量用于校准；工业实现需修改训练流水线）
优先级：⭐⭐⭐⭐⭐（修复01-因果↔05-推荐的断层桥梁；推荐偏差是规模化后最大的质量问题）
评估依据：KDD 2021 AutoDebias在多个公开数据集上显著超越标准MF；RecSys 2018开创性工作；Netflix/Amazon均有内部IPS推荐实现

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Causal-Deconfounded-Recommendation
去混淆因果推荐 — 暴露偏差校正的无偏推荐

依赖：pip install numpy pandas scikit-learn
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import ndcg_score

np.random.seed(42)

# ── 1. 生成含偏差的历史交互数据 ───────────────────────────────────────
n_users, n_items = 500, 200
# 真实相关性（未知，我们要恢复的）
true_relevance = np.random.beta(2, 5, (n_users, n_items))  # 大多数不相关

# 流行度偏差：热门商品有更多曝光机会
item_popularity = np.random.pareto(1.5, n_items)
item_popularity /= item_popularity.sum()

# 用户特征
user_features = np.random.randn(n_users, 5)
item_features = np.random.randn(n_items, 5)

# 模拟带偏差的历史数据：曝光概率受流行度和用户历史影响
def generate_biased_data(n_obs=50000):
    """生成含暴露偏差的历史交互"""
    data = []
    for _ in range(n_obs):
        u = np.random.randint(n_users)
        # 曝光概率：热门商品 + 用户倾向
        exposure_prob = (0.7 * item_popularity
                         + 0.3 * np.random.dirichlet(np.ones(n_items) * 0.1))
        # 展示商品（有偏）
        i = np.random.choice(n_items, p=exposure_prob)
        # 点击概率：真实相关性 × 位置偏差（简化）
        click_prob = true_relevance[u, i] * 0.5  # 展示才可能点击
        clicked = int(np.random.random() < click_prob)
        if clicked:  # 只记录点击（隐式反馈）
            data.append({'user': u, 'item': i, 'exposure_prob': exposure_prob[i]})
    return pd.DataFrame(data)

df = generate_biased_data()
print(f"历史数据: {len(df)}条点击, 唯一用户={df['user'].nunique()}, 唯一商品={df['item'].nunique()}")
print(f"最热门商品点击占比: {df['item'].value_counts(normalize=True).iloc[0]:.1%}")

# ── 2. 倾向得分估计 ────────────────────────────────────────────────────
# 估计 P(exposed | user, item) — 用LogReg近似
X_ps = np.column_stack([
    user_features[df['user'].values],
    item_features[df['item'].values],
    item_popularity[df['item'].values].reshape(-1,1),
])
# 用历史曝光概率作为近似标签（实际生产中从展示日志计算）
y_ps = (df['exposure_prob'] > df['exposure_prob'].median()).astype(int)
ps_model = LogisticRegression(C=1.0, max_iter=300)
ps_model.fit(X_ps, y_ps)
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2105.10648。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：历史交互日志（含展示位置）、1-5% 随机展示的小实验数据（用于倾向得分校准）、用户画像特征；粒度为一次曝光或交互。

**输出**：校正后的商品相关性排名与推荐列表，以及校正前后的排名对比；供推荐工程改造训练流水线并评估新品孵化效果。

## 执行步骤

1. 汇集带展示位置字段的历史交互日志
2. 用随机展示流量估计倾向得分
3. 做 IPS 加权并裁剪极端权重以抑制方差
4. 重排候选集并与校正前的排名做对比
5. 上线后跟踪新品与长尾的转化变化

## 边界与不做

- 数据不满足：没有 1-5% 随机展示流量做校准、或日志缺展示位置字段时倾向得分估不准，先补实验流量。
- 何时不用：要做生成式新品推荐用「扩散模型推荐」；要压制首页同质化用「多样性重排 SMMR」。
- 能力边界：只做偏差校正与无偏排序，不扩大召回池，也不保证特定方法在自有数据上的收益。
- 安全边界：倾向得分取倒数会放大误差，必须裁剪极端权重；随机展示流量只用于校准，不得用来歧视性压低某类商品的曝光。

## 技能关联

- **前置**：Skill-CAGED-Debiased-Rec.html、Skill-CAGED-Debiased-Rec、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Interleaving-Experiment-Recommendation.html、Skill-Interleaving-Experiment-Recommendation、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization、Skill-Propensity-Score-Matching-QuasiExp.html、Skill-Propensity-Score-Matching-QuasiExp、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer
- **延伸**：Skill-CAGED-Debiased-Rec.html、Skill-CAGED-Debiased-Rec、Skill-Interleaving-Experiment-Recommendation.html、Skill-Interleaving-Experiment-Recommendation、Skill-Propensity-Score-Matching-QuasiExp.html、Skill-Propensity-Score-Matching-QuasiExp、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer
- **可组合**：Skill-Interleaving-Experiment-Recommendation.html、Skill-Interleaving-Experiment-Recommendation、Skill-Propensity-Score-Matching-QuasiExp.html、Skill-Propensity-Score-Matching-QuasiExp、Skill-Sequential-Recommendation-Transformer.html、Skill-Sequential-Recommendation-Transformer、Skill-Causal-Deconfounded-Recommendation

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-Causal-Deconfounded-Recommendation`