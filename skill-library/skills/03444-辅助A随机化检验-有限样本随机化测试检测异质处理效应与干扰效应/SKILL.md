---
name: "p2s-ml-ab-randomization-test"
title: "ML辅助A/B随机化检验 — 有限样本随机化测试检测异质处理效应与干扰效应"
description: "触发词：随机化检验、异质处理效应、子群漏报、干扰效应检验、排列检验。何时不用：整体平均效果已足够、只需判断显著性时走「功效分析与样本量」或常规 A/B 检验；不存在子群差异与组间干扰疑虑时不必上 ML 统计量。安全边界：社交网络与行为关联分析需先确认用户同意条款覆盖，且仅用于检测，不做库存或流量的操纵性干预。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 因果局限审查"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-ML-AB-Randomization-Test"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "整体不显著但某些人群明明有效时，用 ML 随机化检验把子群效果和组间干扰揪出来。"
user_try: "试试：我的页面改版整体不显著，帮我检验新客和回头客是不是有相反的效果。"
whenToUse: "当整体 ATE 不显著却怀疑子群有强效应，或实验存在组间干扰（SUTVA 违反）时用本技能；若只是确定要多少样本、MDE 定多大，用「功效分析与样本量」；无干扰且只看平均效果时用常规 A/B 检验。"
workflow: "汇总实验日志，构造用户级协变量 X、处理标记 D 与结果 Y → 用 GBM 交叉验证误差差计算 ML 检验统计量 → 重排处理标记构造零假设分布并求 p 值 → 按新客/回头客、设备、时段等子群分别检验异质效应 → 必要时构建社交网络图量化溢出效应并校正结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ML辅助A/B随机化检验 — 有限样本随机化测试检测异质处理效应与干扰效应

## ① 解决的问题

传统t检验漏报异质处理效应导致真实有价值的实验被错误回滚——ML随机化检验将ML交叉验证误差差作为统计量，精准检测HTE和干扰效应，有限样本精确保证（2025 arXiv:2501.07722）

## ② 核心算法逻辑

反直觉洞察：传统A/B测试使用t检验或MannWhitney U检验，这两种方法只能检测平均处理效应（ATE）——对所有用户的平均影响。但跨境电商的很多关键问题是异质处理效应（HTE）：新版产品页面对"首次访问用户"有效，但对"回头客"反而降低转化；限时折扣对"犹豫型用户"有效，对"价格不敏感的忠实用户"没效果。传统t检验无法捕捉这类HTE，甚至在HTE显著时会"漏报"（虽然某子群有强效应，ATE接近0导致整体不显著）。ML辅助随机化检

## ③ 业务应用场景

- 业务问题：母婴卖家对吸奶器产品页面进行改版（加入视频评测+信任徽章），传统t检验显示整体转化率无显著提升（p=0.12）。但运营直觉告诉他们"首次访问用户"应该显著受影响 - ML随机化检验： 1. 特征X：用户类型（新/回头客）、设备类型、访问时段、地区 2. 分别对新用户/回头客子群运行ML随机化检验 3. 发现：新用户子群p=0.003（显著），回头客子群p=0.71（不显著） 4. 决策：对新用户保持新版页面，对回头客保留旧版（个性化A/B） - 预期产出：精准发现HTE后，个性化页面策略使整体转化率额外提升3.2% - 三轨验证： - 成本：需额外采集用户类型、设备、时段等协变量
- **业务问题**：闪购活动（限时折扣）实验设计中，被随机分配到"看到闪购"组的用户，其购买行为可能影响"未看到闪购"组（库存被抢购→其他用户无法购买） - **ML随机化干扰检验**：构建用户社交网络图，检测处理组对控制组邻居的溢出效应；量化干扰强度，校正实验结果 - **三轨验证**： - **成本**：需构建用户社交网络（基于分享/推荐/共同购买数据），数据清洗与图构建约5人天；每次检验需额外计算邻居特征（约3小时/次，GPU可选） - **合规**：社交网络数据需确保用户同意条款覆盖"行为关联分析"；Amazon政策禁止操纵库存感知，但本方法仅用于检测，不涉及干预 - **风险**：

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：传统t检验"不显著"而错误回滚一次实验的成本（假设实际有HTE效应）约等于放弃3-8%的GMV提升机会；ML随机化检验减少漏报，每季度至少识别1个被误判的有价值实验，年化价值$5-20万
实施难度：⭐⭐⭐☆☆（需要scikit-learn基础；排列检验计算量适中；主要挑战是选择合适的特征X和ML模型）
优先级：⭐⭐⭐⭐⭐（A/B测试是跨境电商迭代的核心工具，检验方法升级直接提升决策质量）
适用规模：样本量>200的实验即可使用；特别适合有丰富用户特征（新/老用户/设备/地区）的跨境平台
数据依赖：实验日志（用户ID/处理分配/结果/协变量），无需额外数据采集

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（172 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/ml_ab_randomization_test` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-ML-AB-Randomization-Test.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
ML辅助A/B随机化检验
基于 arXiv:2501.07722 (2025)
有限样本随机化测试，检测ATE/HTE/干扰效应
"""
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
import warnings
warnings.filterwarnings('ignore')


def compute_ml_test_statistic(X, D, Y, model=None, n_folds=5):
    """
    计算ML辅助测试统计量
    T_ML = CV_Error(无处理) - CV_Error(有处理)
    
    Args:
        X: 协变量矩阵 (n_samples, n_features)
        D: 处理变量 (n_samples,)，0=控制，1=处理
        Y: 结果变量 (n_samples,)
        model: ML模型（默认GBM）
    Returns:
        T_ML: 测试统计量（正值=处理有效）
    """
    if model is None:
        model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)

    n = len(Y)
    D_col = D.reshape(-1, 1)

    # 有处理变量的模型
    X_with_D = np.hstack([X, D_col])
    scores_with = cross_val_score(model, X_with_D, Y, cv=n_folds, scoring='neg_log_loss')

    # 无处理变量的模型
    scores_without = cross_val_score(model, X, Y, cv=n_folds, scoring='neg_log_loss')

    # 测试统计量：有处理时误差更小说明处理有效
    T_ML = np.mean(scores_without) - np.mean(scores_with)
    return T_ML


def randomization_test(X, D, Y, n_permutations=500, alpha=0.05):
    """
    随机化检验（排列检验）
    
    Args:
        X: 协变量
        D: 处理变量
        Y: 结果变量
        n_permutations: 排列次数
        alpha: 显著性水平
    Returns:
        p_value: p值
        T_observed: 观测统计量
        T_null_dist: 零假设分布
        significant: 是否显著
    """
    # 观测统计量
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2501.07722。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：实验日志级明细：用户 ID、处理分配 D（0/1）、结果变量 Y、协变量 X（用户类型、设备、访问时段、地区等），粒度为用户级；干扰检验另需基于分享、推荐、共同购买构建的用户社交网络。

**输出**：ML 检验统计量与排列检验 p 值、零假设分布、各子群的显著性与异质处理效应结论、干扰强度估计与校正后的实验结果；供实验决策者判断保留、回滚或分人群差异化上线。

## 执行步骤

1. 汇总实验日志并构造用户级 X/D/Y 数据
2. 用 GBM 的交叉验证误差差计算 ML 检验统计量
3. 随机重排处理标记得到零假设分布与 p 值
4. 按新客/回头客、设备、时段等子群分别检验并定位异质效应
5. 怀疑干扰时构建社交网络图，量化溢出效应并校正结论
6. 输出保留、回滚或分人群差异化的上线建议

## 边界与不做

- 何时不用：实验连基本随机化与样本量都不满足、或业务只关心整体平均效果时，先走功效分析与样本量，不要用 ML 统计量替代基础检验。
- 能力边界：本技能只输出统计判据（统计量、p 值、子群显著性与干扰强度），不做流量分配、不操作线上实验开关与回滚。
- 合规边界：社交网络与行为关联分析需用户同意条款覆盖，跨境平台禁止操纵库存感知类干预；本技能仅做检测，不涉及干预。

## 技能关联

- **前置**：Skill-AB-Testing-Fundamentals、Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Causal-Representation-Transfer-Learning.html、Skill-Causal-Representation-Transfer-Learning、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **延伸**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-Causal-Representation-Transfer-Learning.html、Skill-Causal-Representation-Transfer-Learning、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Bayesian-AB-Testing.html、Skill-Bayesian-AB-Testing、Skill-SOP-Sales-Operations-Planning.html、Skill-SOP-Sales-Operations-Planning、Skill-ML-AB-Randomization-Test

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-ML-AB-Randomization-Test`