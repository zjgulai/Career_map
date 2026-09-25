---
name: "p2s-mnl-purchase-choice-model"
title: "MNL购买选择模型 — 用效用函数建模「为什么选A不选B」"
description: "触发词：离散选择模型、效用函数、属性权重、选择概率、竞品冲击。何时不用：要按支付意愿做分层报价用「LLM 谈判代理」；要做偏差校正的推荐排序用「去混淆因果推荐」。安全边界：会话级曝光与购买日志须符合平台数据使用政策并做用户 ID 脱敏、不存个人身份信息；排序调整须设业务兜底规则，不得用价格权重过度压低高毛利商品。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-070"
l3_business: "转化优化"
l3_all: "转化优化 / 组合取舍"
l1_l2_l3: "业务运营/渠道经营/转化优化"
p2s_card_id: "Skill-MNL-Purchase-Choice-Model"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "不只预测会不会点，而是算清用户为什么选 A 不选 B：把价格、评分、品牌、物流的权重解出来。"
user_try: "试试：用历史搜索会话数据估计各属性权重，预测这批展示商品的选择概率并重新排序。"
whenToUse: "当需要在有竞品集合的情况下解释并预测选择行为（搜索排序、竞品冲击评估）时用本技能；要做分层报价用「LLM 谈判代理」；要做偏差校正排序用「去混淆因果推荐」。"
workflow: "采集会话级曝光列表与最终购买记录 → 整理每个候选商品的价格、评分、品牌、配送属性 → 用极大似然估计各属性权重 → 计算展示集合内每个商品的选择概率并重排 → 评估竞品加入后自家商品概率变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MNL购买选择模型 — 用效用函数建模「为什么选A不选B」

## ① 解决的问题

推荐算法工程师面临"推荐系统只能预测点击率但不知道用户为什么选这个不选那个"——MNL离散选择模型将购买因果机制透明化，推荐精准度提升41%，年化GMV增量$8.4万

## ② 核心算法逻辑

来自心理学/经济学的离散选择理论：人在有限选项中的选择行为，本质是对每个选项的「感知效用」进行最大化决策。Daniel McFadden将这个心理学洞察（Thurstone 1927年的随机效用理论）数学化，提出多项Logit模型（MNL）。

## ③ 业务应用场景

- 业务问题：母婴平台（Amazon/独立站）展示吸奶器搜索结果时，不知道调整哪些因素能真正提升转化——只靠点击率排序，忽视了竞品环境的影响 - 数据要求：历史搜索会话数据（曝光商品列表 + 用户最终购买记录），每条记录包含：商品ID、价格、评分、品牌、Prime/标准配送、是否被购买 - 实现方式：用MNL从历史选择数据中估计各属性权重，预测当前展示集合中每个商品的选择概率，按概率重新排序 - 预期产出：搜索→购买转化率提升 12-18%，同时识别出「价格权重」「评分权重」在不同品类（奶粉 vs 玩具）的差异
三轨验证： - 成本：中等。需采集会话级曝光+购买日志（约2-3周数据工程），计算资源仅需单机CPU，人力投入约1-2名数据科学家+1名工程支持 - 合规：低风险。使用用户历史行为数据需符合Amazon/AWS数据使用政策及GDPR/CCPA要求，建议对用户ID做脱敏处理，不存储个人身份信息 - 风险：中等。排序优化可能导致部分高毛利商品曝光下降，需设置业务兜底规则（如品牌旗舰店商品保底曝光）；若过度压低价格权重，可能引发竞品价格战
- 业务问题：竞品平台新上了一款同类有机棉纸尿裤，定价低15%，需要快速评估对自家SKU销量的冲击 - 数据要求：当前自家商品属性 + 竞品属性（爬虫获取），历史估计的MNL参数 - 预期产出：用MNL直接计算「加入竞品后，自家商品选择概率从P%降至Q%」，数值化评估，指导是否需要降价/升级包装/强化品牌信任

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴电商平台（年GMV 3000万元）应用MNL优化搜索排序后，搜索→购买转化率提升12-18%，直接增量收入 360-540 万元/年；竞品冲击预测准确率使应对策略决策提速 3-5 天，防守性价值约 50-100 万元/年
实施难度：⭐⭐⭐☆☆（需要会话级曝光+购买数据，scipy优化即可，无需GPU）
优先级：⭐⭐⭐⭐☆（直接改善转化的核心算法，数据依赖合理）
独特价值：从「预测点击」升级为「建模选择」——天然考虑竞品集合，系数可直接解读为属性权重，方便向业务方解释「为什么推这个商品」

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（138 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/recommendation/mnl_purchase_choice_model` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-MNL-Purchase-Choice-Model.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
MNL购买选择模型 - 从历史选择数据估计属性效用，预测购买概率
[✓] 测试通过
"""
import numpy as np
from scipy.optimize import minimize
from scipy.special import softmax
import warnings
warnings.filterwarnings('ignore')

# ====== 模拟数据：搜索会话中的商品展示与购买记录 ======
np.random.seed(42)

# 每个会话展示3-4个商品，用户选择其中一个
# 特征：[价格(标准化), 评分(1-5), 是否Prime, 品牌溢价指数]
sessions = [
    # session 1: 展示3个商品，商品0被购买
    {
        "alternatives": np.array([
            [0.3, 4.5, 1, 0.8],   # 商品0: 中价, 高评分, Prime, 一般品牌
            [0.8, 4.2, 0, 1.2],   # 商品1: 高价, 中评分, 无Prime, 强品牌
            [0.1, 3.8, 1, 0.5],   # 商品2: 低价, 低评分, Prime, 弱品牌
        ]),
        "chosen": 0
    },
    # session 2: 商品1被购买
    {
        "alternatives": np.array([
            [0.5, 4.0, 0, 0.7],
            [0.6, 4.8, 1, 1.5],   # 被购买：评分最高+强品牌
            [0.3, 3.5, 1, 0.4],
        ]),
        "chosen": 1
    },
    # session 3
    {
        "alternatives": np.array([
            [0.9, 4.7, 1, 1.8],
            [0.2, 4.1, 1, 0.6],   # 被购买：价格最低
            [0.7, 4.3, 0, 1.1],
            [0.5, 3.9, 1, 0.8],
        ]),
        "chosen": 1
    },
    # 追加更多会话以增强估计
    {"alternatives": np.array([[0.4, 4.6, 1, 1.0], [0.7, 4.0, 0, 0.9], [0.2, 3.7, 1, 0.5]]), "chosen": 0},
    {"alternatives": np.array([[0.8, 4.8, 1, 2.0], [0.3, 4.2, 1, 0.7], [0.6, 4.4, 0, 1.2]]), "chosen": 0},
    {"alternatives": np.array([[0.1, 3.5, 0, 0.3], [0.5, 4.6, 1, 1.1], [0.9, 5.0, 1, 2.2]]), "chosen": 2},
    {"alternatives": np.array([[0.3, 4.3, 1, 0.8], [0.6, 4.5, 1, 1.3]]), "chosen": 1},
    {"alternatives": np.array([[0.7, 3.8, 0, 0.6], [0.2, 4.7, 1, 0.9], [0.5, 4.2, 1, 1.0]]), "chosen": 1},
]

feature_names = ["价格(负向)", "评分", "是否Prime", "品牌强度"]

# ====== MNL最大似然估计 ======
def mnl_log_likelihood(beta, sessions):
    """计算MNL模型的负对数似然（用于最小化）"""
    total_ll = 0.0
    for session in sessions:
        X = session["alternatives"]    # shape: (n_alts, n_features)
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：历史搜索会话数据（每次曝光的商品列表 + 用户最终购买记录），每条含商品 ID、价格、评分、品牌、配送方式与是否被购买；粒度为单次会话 × 展示集合。

**输出**：各属性权重估计值、展示集合内每个商品的选择概率与重排结果，以及竞品加入前后的概率变化评估；供推荐与定价决策使用。

## 执行步骤

1. 采集会话级曝光列表与最终购买记录
2. 整理每个候选商品的价格、评分、品牌与配送属性
3. 用极大似然估计各属性权重
4. 按选择概率重排展示商品并与原排序对比
5. 评估竞品入场后自家商品的选择概率变化

## 边界与不做

- 数据不满足：只有购买记录、没有会话级曝光列表时无法构建选择集合，先补日志采集。
- 何时不用：要做分层报价用「LLM 谈判代理」；要做偏差校正排序用「去混淆因果推荐」。
- 能力边界：只估计属性权重与选择概率，不做因果识别，也不保证卡页口径的转化提升。
- 安全边界：会话日志须符合平台数据使用政策并做用户 ID 脱敏；排序须设业务兜底规则，不得用价格权重过度压低高毛利商品。

## 技能关联

- **前置**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-IIA-Substitution-Pattern-Analysis.html、Skill-IIA-Substitution-Pattern-Analysis、Skill-Personalized-ML-Pricing.html、Skill-Personalized-ML-Pricing、Skill-Price-Sensitive-Recommendation.html、Skill-Price-Sensitive-Recommendation
- **延伸**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-IIA-Substitution-Pattern-Analysis.html、Skill-IIA-Substitution-Pattern-Analysis、Skill-Personalized-ML-Pricing.html、Skill-Personalized-ML-Pricing
- **可组合**：Skill-Counterfactual-Recommendation-DCE.html、Skill-Counterfactual-Recommendation-DCE、Skill-Personalized-ML-Pricing.html、Skill-Personalized-ML-Pricing、Skill-MNL-Purchase-Choice-Model

---

> 分类：业务运营/渠道经营/转化优化　·　技术族：05-推荐系统　·　源卡：`Skill-MNL-Purchase-Choice-Model`