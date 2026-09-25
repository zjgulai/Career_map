---
name: "p2s-last-mile-delivery-prediction"
title: "Last-Mile Delivery Prediction（最后一公里配送时效预测）"
description: "触发词：时效预测、配送时效、承运商选择、超时率、选路优化。何时不用：要规划仓网与配送网络用「物流方案」类技能中的仓网规划，要逐票追踪在途异常用「到货异常追踪」；本技能只预测签收时长分布并给出承运商分档规则。安全边界：预测与分档结果用于比价和制定时效承诺，切换承运商与赔付承诺须人工确认后执行。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-056"
l3_business: "物流方案"
l3_all: "物流方案 / 到货异常追踪"
l1_l2_l3: "业务运营/供应与履约/物流方案"
p2s_card_id: "Skill-Last-Mile-Delivery-Prediction"
p2s_src_domain: "18-物流履约"
quality_tier: "preview"
user_summary: "用历史配送数据算出各家快递到不同地区的签收时长分布，帮你在下单时选更靠谱的承运商、少赔超时款。"
user_try: "试试：拿我过去 6 个月的配送记录，看看东海岸寄 UPS 和 USPS 的签收时长差多少，城市订单该选哪家？"
whenToUse: "已有历史配送记录、需要判断各承运商时效分布与选路规则时用；要规划仓网与网络布局用仓网规划类技能，要逐票追踪在途异常用「到货异常追踪」。"
workflow: "整理历史配送记录为特征、观测时长与是否签收三类输入 → 用 Weibull AFT 拟合各承运商时效分布 → 按邮编密度与下单日期形成选路规则 → 对比实施前后的平均时效与超时率"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Last-Mile Delivery Prediction（最后一公里配送时效预测）

## ① 解决的问题

跨境母婴订单选择快递时仅凭经验判断，东海岸送 FedEx、西海岸送 USPS——最后一公里时效预测模型基于历史配送数据精准选路，每单节省 $1.2，年化 3000 单 = 节省 36 万元

## ② 核心算法逻辑

核心思想：通过生存分析（Survival Analysis）建立"包裹到达目的国仓库→用户签收"的时长预测模型，在右删失数据（未签收包裹）场景下，量化承运商、地理位置、季节因素对配送时效的影响，支持动态承运商选择和时效承诺。

## ③ 业务应用场景

业务问题：某母婴跨境电商在美国东海岸（纽约、宾州、新泽西）销售进口婴儿奶粉，目前采用统一 USPS 承运商，平均配送时效 5.2 天，客户投诉率 8.2%（超时占比）。公司承诺"5 天内送达"，超时需赔付 $2.5/单。
数据规模：过去 6 个月 12,000 单配送记录，其中 1,200 单超时（删失率 10%）。特征包括：承运商（USPS/UPS/FedEx）、目的邮编密度（城市/郊区/农村）、包裹重量（0.5-2kg）、下单日期（工作日/周末/节假日）。
模型应用： - 用生存分析拟合历史数据，得到各承运商的时效分布 - 结果：UPS 东海岸均值 2.8 天（95% 分位数 4.1 天），USPS 均值 4.9 天（95% 分位数 7.3 天） - 决策规则：城市地区（邮编密度 >500/km²）+ 工作日下单 → UPS；郊区 + 任意日期 → USPS - 实施后配送时效从 5.2 天 → 3.9 天，超时率从 8.2% → 2.1%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

场景 1（美国东海岸奶粉）：年净收益 3.08 万元
场景 2（欧洲德国推车）：年净收益 704 万人民币
综合平均（假设 50 个 SKU × 10 个国家，按场景 1 规模）：180-250 万元/年
✓ 算法复杂度中等（Weibull AFT 为标准统计模型，无深度学习依赖）
✓ 数据需求明确（6 个月历史配送数据 + 基础特征工程）
⚠ 难点 1：处理右删失数据需统计学背景，团队需培训

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 59 行：'[' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/logistics/last_mile_delivery_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/18-物流履约/Skill-Last-Mile-Delivery-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.special import xlogy
import warnings
warnings.filterwarnings('ignore')

class WeibullAFTSurvival:
    """
    Accelerated Failure Time (AFT) 模型，使用 Weibull 分布
    用于最后一公里配送时效预测
    """
    def __init__(self):
        self.params = None
        self.scale = None
        self.shape = None
        self.coef = None
        
    def _weibull_loglik(self, params, X, T, E):
        """Weibull AFT 对数似然函数"""
        n_features = X.shape[1]
        scale_param = params[0]
        shape_param = params[1]
        coef = params[2:2+n_features]
        
        # 线性预测器：log(T) = X*beta + epsilon
        eta = X @ coef
        
        # Weibull 分布的对数似然
        # 事件发生：log f(t)
        # 删失：log S(t)
        log_t = np.log(T + 1e-8)
        standardized_t = (log_t - eta) / scale_param
        
        # 事件项
        event_ll = E * (
            -np.log(scale_param) 
            + (shape_param - 1) * np.log(T + 1e-8)
            - shape_param * np.log(scale_param)
            + (shape_param - 1) * standardized_t
            - np.exp(shape_param * standardized_t)
        )
        
        # 删失项
        censored_ll = (1 - E) * (-np.exp(shape_param * standardized_t))
        
        return -np.sum(event_ll + censored_ll)
    
    def fit(self, X, T, E):
        """
        拟合 AFT 模型
        X: 特征矩阵 (n_samples, n_features)
        T: 观测时间（天数）
        E: 事件指示符（1=签收，0=未签收/删失）
        """
        n_features = X.shape[1]
        
        # 初始参数：scale, shape, coef
        init_params = np.concatenate([
            [0.5],  # scale
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：订单×包裹粒度历史配送记录：特征矩阵（承运商 USPS/UPS/FedEx、目的邮编密度、包裹重量 0.5-2kg、下单日期是工作日/周末/节假日）、观测时长（下单到签收的天数）、事件指示符（1=已签收、0=未签收的右删失样本）；建议 6 个月以上样本，卡页示例为 12,000 单、约 10% 删失。

**输出**：各特征的 AFT 系数与 Weibull 尺度/形状参数、各承运商在不同地区的时效分布（均值与 95% 分位数），以及按地区与下单日期给出的承运商选择规则与时效承诺建议；供运营团队制定选路规则、评估赔付成本使用。

## 执行步骤

1. 把历史配送记录整理成特征矩阵、观测时长与是否签收的事件指示符
2. 用 Weibull AFT 生存分析拟合模型，未签收包裹按右删失处理
3. 输出各承运商在各地区的时效均值与 95% 分位数
4. 按邮编密度与下单日期形成承运商选择规则
5. 对比实施前后的平均时效与超时率，回看超时赔付成本

## 边界与不做

- 数据不满足时不用：没有历史签收记录、或无法标注未签收的右删失样本时，生存分析无法拟合。
- 只输出时长分布与选路规则，不直接下单、不修改承运商合同与赔付条款。
- 卡页 ROI 与时效改善数字为示例场景口径，落地前须用本店真实配送数据重算。

## 技能关联

- **前置**：Skill-Cross-Border-Logistics-Routing.html、Skill-Cross-Border-Logistics-Routing
- **延伸**：Skill-Dynamic-Pricing-Logistics-Cost
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Inventory-Positioning-Optimization、Skill-Last-Mile-Delivery-Prediction

---

> 分类：业务运营/供应与履约/物流方案　·　技术族：18-物流履约　·　源卡：`Skill-Last-Mile-Delivery-Prediction`