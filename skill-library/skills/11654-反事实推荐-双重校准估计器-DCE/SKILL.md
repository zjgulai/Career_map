---
name: "p2s-counterfactual-recommendation-dce"
title: "反事实推荐 - 双重校准估计器（DCE）"
description: "触发词：反事实推荐、DCE、去偏CTR、曝光偏差、冷启动。何时不用：曝光策略已随机分流、可直接读线上A/B或交错实验结论时不用本技能。安全边界：按平台个性化推荐规范需算法备案与月度歧视审计（性别/年龄），并完善用户知情权提示。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-105"
l3_business: "增量分析"
l3_all: "增量分析 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/增量分析"
p2s_card_id: "Skill-Counterfactual-Recommendation-DCE"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "修正推荐系统把曝光多当成用户喜欢的偏差，让被历史热度压住的优质冷门商品重新有机会被推出来。"
user_try: "试试：推荐模型把某德国奶粉 CTR 抬得太高、长尾品牌起不来，帮我用 DCE 去掉曝光偏差看真实转化。"
whenToUse: "当曝光由热度与历史 CTR 决定、日志存在缺失非随机（MNAR）选择偏差，需要评估曝光给谁才有效、或要救长尾与新品牌冷启动时用；若只想比较不同推荐策略的效果，应先做线上 A/B 或交错实验（实验设计域）。"
workflow: "汇总曝光/点击/购买日志与商品属性、月龄等特征 → 用多重专家网络校准倾向分 → 用插补项校准未曝光样本的预测误差 → 以倾向分与插补项联合计算去偏损失并训练模型 → 输出去偏 CTR 预测并评估长尾与新品牌召回"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 反事实推荐 - 双重校准估计器（DCE）

## ① 解决的问题

增长分析师面临推荐因果不清——DCE将虚高转化率18%修正到7%，年化省27万元

## ② 核心算法逻辑

电商推荐系统的核心痛点是 MNAR（Missing Not At Random）选择偏差:用户只对系统曝光过的商品产生反馈,而曝光本身受热度/历史 CTR 影响,导致推荐模型陷入"自我强化"循环。DCE 用双重校准同时校准倾向分(propensity)与插补误差(imputation),即插即用与所有 DR 变体兼容。

## ③ 业务应用场景

- 业务问题:Shopee 印尼站某德国奶粉因历史曝光高 CTR 数据被高估,推荐模型持续压制澳洲/新西兰品牌的同质量 SKU。新妈妈点击不到优质冷门品牌,小品牌冷启动失败率 80%+。 - 数据要求:用户行为日志(曝光/点击/购买) + 商品特征(品牌/价格/认证) - 预期产出:DCE-DR 模型给出的去偏 CTR 预测,新品牌召回率提升 - 业务价值:小品牌冷启动 ROI 提升 30-50%,平台 SKU 多样性扩大,小品牌入驻意愿↑;按印尼站月 GMV 5000 万元计,长尾品牌 GMV 增量约 200-400 万元/月
- 业务问题:母婴电商的核心特征是月龄驱动的时间窗口需求(0-6月奶粉1段, 6-12月辅食),用户在"错误时期"未购买 ≠ 无需求,但模型把"未购"当作"不喜欢"。 - 数据要求:用户行为日志 + 宝宝月龄 + 商品适用月龄属性 - 预期产出:对每个用户做"如果在正确月龄推送,购买概率是多少"的反事实预测,前置 1-2 月推送 - 业务价值:前置触达转化率提升 25-40%,以美亚母婴专区 100 万月活计,GMV 增量约 80-150 万元/月
**三轨验证** | 成本轨：月均成本1200元（服务器GPU计算800元/月，数据标注人工12小时/月×300元/小时=3600元分摊=300元/月，模型维护工程师0.2人=2000元/月分摊），年度ROI=（日均订单增长15单×客单价180元×365天×18%CTR提升）/（1200×12）≈2.8倍 | 合规轨：符合《电商平台个性化推荐管理规范》，需建立推荐算法备案制度，每月审计反事实推荐逻辑是否存在性别/年龄歧视，合规结论：可部署，需完善用户知情权提示 | 风险轨：①算法偏差风险（概率25%）：反事实生成可能强化刻板印象，导致特定用户群体被过度推荐高价产品，影响用户满意度；②数据隐私风

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

长尾品牌 GMV 增量:200-400 万元/月(以印尼站 5000 万 GMV 计)
模型部署成本:GPU 训练 ~2 万元/月 + 工程 1 人月
ROI ≈ 100-200 倍/月
前置触达 GMV 增量:80-150 万元/月(美亚母婴专区 100 万月活)
年化收益:1000-1800 万元
易处:有官方 PyTorch 开源代码可直接复用

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（67 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/recommendation/counterfactual_recommendation_dce` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/05-推荐系统/Skill-Counterfactual-Recommendation-DCE.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
DCE (Doubly Calibrated Estimator) 最小骨架
论文 arXiv:2403.00817, WWW 2024 (oral)
官方完整实现: https://github.com/WonbinKweon/DCE_WWW2024
"""
from __future__ import annotations
import torch
import torch.nn as nn
import torch.nn.functional as F


class CalibratedPropensityModel(nn.Module):
    def __init__(self, n_users: int, n_items: int, emb_dim: int = 32, n_experts: int = 5):
        super().__init__()
        self.user_emb = nn.Embedding(n_users, emb_dim)
        self.item_emb = nn.Embedding(n_items, emb_dim)
        self.router = nn.Sequential(nn.Linear(emb_dim, n_experts), nn.Softmax(dim=1))
        self.a = nn.Parameter(torch.ones(n_experts))
        self.b = nn.Parameter(-torch.ones(n_experts))

    def forward(self, users: torch.Tensor, items: torch.Tensor, T: float = 1e-3) -> torch.Tensor:
        u = self.user_emb(users)
        v = self.item_emb(items)
        logit = (u * v).sum(-1)

        pi = self.router(u)
        g = -torch.log(-torch.log(torch.rand_like(pi) + 1e-10) + 1e-10)
        pi = F.softmax((pi.log() + g) / T, dim=1)

        logit_exp = logit.unsqueeze(1).expand(-1, self.a.size(0))
        p_cal = torch.sigmoid(logit_exp * self.a + self.b)
        return (p_cal * pi).sum(1).clamp(1e-4, 1 - 1e-4)


def dce_dr_loss(
    pred: torch.Tensor,
    label: torch.Tensor,
    prop: torch.Tensor,
    imp_pred: torch.Tensor,
    gamma: float = 0.05,
) -> torch.Tensor:
    inv_p = 1.0 / prop.detach().clamp(gamma, 1.0)
    ips_term = F.binary_cross_entropy(pred, label, weight=inv_p, reduction="mean")
    imp_term = F.binary_cross_entropy(pred, imp_pred.detach(), reduction="mean")
    return ips_term - imp_term


def main() -> None:
    n_users, n_items = 5000, 2000
    model = CalibratedPropensityModel(n_users, n_items, emb_dim=32, n_experts=5)

    users = torch.randint(0, n_users, (128,))
    items = torch.randint(0, n_items, (128,))
    labels = torch.randint(0, 2, (128,)).float()

    prop = model(users, items)
    print(f"校准倾向分均值: {prop.mean():.4f}, 标准差: {prop.std():.4f}")

    pred = torch.sigmoid(torch.randn(128))
    imp = torch.sigmoid(torch.randn(128))
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2403.00817，但该号在 arXiv 上是《Doubly Calibrated Estimator for Recommendation on Data Missing Not At Random》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户行为日志（曝光/点击/购买，用户级，含未曝光样本）+ 商品特征（品牌/价格/认证）；月龄驱动场景另需宝宝月龄与商品适用月龄属性；用户与商品 id 需可建立 embedding。

**输出**：去偏后的 CTR/购买概率预测、长尾新品牌的召回改善评估，以及对每个用户的反事实预测（如在正确月龄推送时的购买概率），供排序与前置触达策略使用。

## 执行步骤

1. 汇总曝光/点击/购买日志与商品属性、月龄等特征
2. 用多重专家网络估计并校准倾向分
3. 用插补项校准未曝光样本的预测误差
4. 以倾向分与插补项联合计算去偏损失并训练模型
5. 输出去偏 CTR 预测并评估长尾与新品牌召回效果

## 边界与不做

- 何时不用：曝光策略已经随机分流、可直接读线上实验结论，或没有曝光日志与商品属性字段时，不要用本技能。
- 能力边界：只输出去偏预测与排序信号，不保证线上多样性指标；估计依赖曝光日志覆盖度，新品类冷启动样本过少时结果不稳。
- 合规红线：按平台个性化推荐管理规范需建立算法备案制度并月度审计反事实推荐逻辑是否存在性别/年龄歧视，同时完善用户知情权提示。
- 卡页数字（小品牌冷启动 ROI 提升 30-50%、印尼站月 GMV 5000 万、前置触达 +25-40%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-Intelligent-Prediction-Doubly-Robust.html、Skill-Intelligent-Prediction-Doubly-Robust、Skill-Matrix-Factorization.html、Skill-Matrix-Factorization
- **延伸**：Skill-NeuralNDCG-Learning-to-Rank.html、Skill-NeuralNDCG-Learning-to-Rank、Skill-Uplift-Modeling.html、Skill-Uplift-Modeling
- **可组合**：Skill-Cold-Start-Meta-Learning-PAM.html、Skill-Cold-Start-Meta-Learning-PAM、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Counterfactual-Recommendation-DCE

---

> 分类：业务运营/品牌与增长/增量分析　·　技术族：05-推荐系统　·　源卡：`Skill-Counterfactual-Recommendation-DCE`