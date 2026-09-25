---
name: "p2s-latent-class-demand-segmentation"
title: "潜在类别需求分群 — EM算法自动发现购买决策者类型"
description: "触发词：潜在类别、价格弹性、人群分群、差异化定价。何时不用：行为序列跨度不足、样本量过小时参数不稳；只按最近购买时间做 RFM 分层时用常规分群方法。安全边界：行为数据需匿名化，差异化定价不得基于画像直接展示不同价格，应通过优惠券或促销码间接实现。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-02"
l2_domain: "产品与创新"
l3_id: "DOM-02-018"
l3_business: "需求分群"
l3_all: "需求分群 / 分群 / 价格敏感性"
l1_l2_l3: "业务运营/产品与创新/需求分群"
p2s_card_id: "Skill-Latent-Class-Demand-Segmentation"
p2s_src_domain: "14-用户分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用潜在类别模型自动找出几类购买决策者，并给出各自的价格敏感度用于差异化策略。"
user_try: "试试：帮我从用户行为序列里分出几类买家，并给出每类的价格弹性。"
whenToUse: "本卡属「需求分群」。需要在行为序列上发现隐含的用户类别与价格弹性时用本卡；只按最近购买时间做 RFM 分层时用常规分群方法。"
workflow: "构造用户行为序列 → 多次重启初始化参数 → 用 EM 估计类别归属 → 输出类别占比与价格弹性"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 潜在类别需求分群 — EM算法自动发现购买决策者类型

## ① 解决的问题

用户运营面临"RFM分群维度太少无法区分不同定价敏感度的消费者"——潜在类别模型自动发现3-5类购买决策者，差异化策略年化增收$5.8万

## ② 核心算法逻辑

来自心理学/经济学的离散选择理论：潜在类别模型（Latent Class Model, LCM）源自心理学家Lazarsfeld对「态度量表」的结构分析——观测到的用户行为模式背后，存在若干个「隐藏的消费者类型」。不同类型的消费者对价格、品牌、成分安全的敏感度存在系统性差异，这些差异无法直接观测，但可以从购买行为中统计推断。

## ③ 业务应用场景

- 业务问题：吸奶器品类用户差异极大——有的只在意价格（$30能用就行），有的对医院级吸力和静音设计极度敏感愿意付$300。统一定价和统一促销策略，要么丢失高端用户，要么过度打折损失利润 - 数据要求：6-12个月的用户搜索点击→加购→购买行为序列，包含商品的价格/评分/品牌/认证等属性 - 预期产出： - 发现3-4个需求类别（如：价格党25%、功能至上40%、品牌信仰者20%、品质基础型15%） - 每类的价格弹性系数（价格敏感型弹性 -2.5，品牌型 -0.8） - 用户-类别归属概率分布，指导推送和定价策略
三轨验证： - 成本：需采集6-12个月全量用户行为序列（搜索/点击/加购/购买），数据清洗与特征工程约2人周；EM算法训练需GPU资源（单次约$50-100云成本）；后续每季度重训练一次，人力维护成本约0.5人天/次 - 合规：用户行为数据需匿名化处理，避免关联个人身份信息（PII）；在Amazon平台使用需注意不违反「操纵排名」政策（差异化定价不得基于用户画像直接显示不同价格，应通过优惠券/促销码间接实现）；GDPR下需用户同意行为追踪 - 风险：若价格敏感型用户发现被区别对待（如从未收到高端品推荐），可能引发差评或投诉；竞品可能通过价格监测快速跟进，导致差异化定价策略失效；平台算法审查可
- 业务问题：有机/A2/HMO等奶粉功能认证层出不穷，不知道哪类用户愿意为哪个功能付溢价，平台推荐频繁失效 - 数据要求：用户评论中的属性提及频率 + 购买历史（联合VOC分析） - 预期产出：发现「成分至上型」用户群，向其优先推送高端有机认证款，CTR提升 25-35%，转化率提升 15-20%，该群体ARPU提升 40%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴平台发现3类需求群体后，向「品质功能型」（占45%）精准推送中高端品，推荐精准度提升 30-40%，该群体ARPU提升 25-35%（约+$15/人）；对「价格敏感型」（占30%）单独设计促销策略，避免全店打折，年化减少不必要的利润侵蚀约 80-120 万元
实施难度：⭐⭐⭐☆☆（EM算法原理需要理解，但代码可开箱即用；数据要求历史购买会话，通常平台都有）
优先级：⭐⭐⭐⭐☆（用户分群是精细化运营的基础，影响推荐、定价、促销多个下游决策）
独特价值：相比RFM等描述性分群，LCM直接发现「决策动机」类型，每个类别有可解释的价格弹性和属性偏好，策略直接可执行

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/user_analytics/latent_class_demand_segmentation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/14-用户分析/Skill-Latent-Class-Demand-Segmentation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
潜在类别模型（LCM） - EM算法估计购买决策者类型
用于母婴电商用户异质性建模与差异化策略
[✓] 测试通过
"""
import numpy as np
from scipy.special import softmax, logsumexp
import warnings
warnings.filterwarnings('ignore')

np.random.seed(42)

# ====== 生成模拟数据：三类用户的购买选择 ======
# 每次展示3个商品，特征: [价格(越低越好), 评分, 品牌强度, 有机认证]
# 真实潜在类别及参数
TRUE_CLASSES = {
    "价格敏感型": {"pi": 0.30, "beta": np.array([-2.5, 0.5, 0.3, 0.4])},
    "品质功能型": {"pi": 0.45, "beta": np.array([-0.6, 2.0, 0.8, 1.5])},
    "品牌忠诚型": {"pi": 0.25, "beta": np.array([-0.8, 1.0, 2.5, 0.6])},
}

def generate_session(beta):
    """生成一次购买会话（3个商品选1）"""
    alternatives = np.random.uniform([0.2, 3.0, 0.2, 0.0], [1.0, 5.0, 2.0, 1.0], (3, 4))
    utils = alternatives @ beta
    probs = softmax(utils)
    chosen = np.random.choice(3, p=probs)
    return alternatives, chosen

# 模拟300个用户，每人做8次选择
N_USERS = 300
N_SESSIONS = 8
user_data = []
true_labels = []

class_names = list(TRUE_CLASSES.keys())
class_pis = np.array([v["pi"] for v in TRUE_CLASSES.values()])

for i in range(N_USERS):
    # 为每个用户随机分配真实类别
    true_class = np.random.choice(len(class_names), p=class_pis)
    true_labels.append(true_class)
    beta_true = list(TRUE_CLASSES.values())[true_class]["beta"]
    # 加个体随机扰动
    beta_i = beta_true + np.random.normal(0, 0.2, 4)
    sessions = [generate_session(beta_i) for _ in range(N_SESSIONS)]
    user_data.append(sessions)

print("=" * 60)
print(f"数据生成: {N_USERS}名用户 × {N_SESSIONS}次选择/人")
print("=" * 60)

# ====== LCM - EM算法实现 ======
K = 3  # 类别数（实际中用BIC选择）
N_FEATURES = 4

# 初始化参数（随机初始化 + 多次重启选最优）
def mnl_log_likelihood_weighted(beta, user_sessions, weights):
    """带权重的MNL负对数似然"""
    nll = 0.0
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：6 到 12 个月的用户行为序列（搜索、点击、加购、购买），以及被选商品的属性（价格、评分、品牌、认证）。

**输出**：三到四个需求类别及其占比、每类的价格弹性系数、用户到类别的归属概率分布，用于推送与定价策略。

## 执行步骤

1. 整理用户从搜索、点击到购买的完整行为序列
2. 构建商品属性特征矩阵
3. 用 EM 多次重启估计潜在类别参数
4. 输出类别占比、价格弹性与归属概率
5. 据此制定差异化推送与促销策略

## 边界与不做

- 行为序列跨度不足、样本量过小时参数不稳定，不用本卡
- 本卡产出用户类别与弹性估计，不负责推送系统改造与定价执行
- 用户行为数据需匿名化，差异化定价不得基于画像直接展示不同价格

## 技能关联

- **前置**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conjoint-Analysis-Product-Design.html、Skill-Conjoint-Analysis-Product-Design、Skill-MNL-Purchase-Choice-Model.html、Skill-MNL-Purchase-Choice-Model、Skill-Willingness-to-Pay-Estimation.html、Skill-Willingness-to-Pay-Estimation
- **延伸**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conjoint-Analysis-Product-Design.html、Skill-Conjoint-Analysis-Product-Design、Skill-Willingness-to-Pay-Estimation.html、Skill-Willingness-to-Pay-Estimation
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-Conjoint-Analysis-Product-Design.html、Skill-Conjoint-Analysis-Product-Design、Skill-Latent-Class-Demand-Segmentation

---

> 分类：业务运营/产品与创新/需求分群　·　技术族：14-用户分析　·　源卡：`Skill-Latent-Class-Demand-Segmentation`