---
name: "p2s-multivariate-cointegration"
title: "Multivariate Cointegration（多变量协整 VECM）"
description: "触发词：协整、VECM、关联品类、联动补货、长期均衡。何时不用：单品独立需求、无明显关联品时用常规时序预测；要判断缺货责任归属时用「供应链因果归因」。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-047"
l3_business: "需求预测"
l3_all: "需求预测 / 补货模拟"
l1_l2_l3: "业务运营/供应与履约/需求预测"
p2s_card_id: "Skill-Multivariate-Cointegration"
p2s_src_domain: "03-时间序列"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "主机和配件本来是一起卖的，用协整找出它们的长期比例，就不会出现主机有货、配件断货的情况。"
user_try: "试试：用 VECM 找出米粉和配套勺子的长期均衡比例，提前 21 天告诉我配件该补多少。"
whenToUse: "多个关联商品存在长期均衡关系、需要联动补货时用；单品独立预测用常规时序模型；要判断因果责任用供应链因果归因。"
workflow: "准备多个关联品的 24 个月（卡页为 104 周）销量序列 → 做 ADF 平稳性检验与 Johansen 协整检验确认协整向量 → 拟合 VECM 估计短期调整速度 → 按均衡比例换算关联品补货量"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Multivariate Cointegration（多变量协整 VECM）

## ① 解决的问题

吸奶器与法兰配件分别独立预测备货，导致主机有货但配件经常断货——多变量协整建模发现两者长期均衡关系，实现联动补货，配件断货率降低 40%

## ② 核心算法逻辑

核心思想：通过向量误差修正模型（VECM）识别多个关联商品销量间的长期均衡关系，在短期波动中捕捉动态调整路径，实现关联品类的精准补货预测。

## ③ 业务应用场景

业务问题： 某跨境 B2B 平台销售有机米粉（主产品）和配套勺子（耗材）。历史数据显示两者销量相关，但采购团队按独立需求预测，导致：米粉库存周转 45 天，勺子缺货率 22%，每月因配件缺货损失订单 8-12 万元。
具体数字： - 时间跨度：24 个月历史数据（104 周） - 米粉月销：8000-12000 件，勺子月销：24000-36000 件 - Johansen 协整检验：trace statistic = 18.7（p<0.01），确认 1 个协整向量 - 长期均衡比例：勺子/米粉 = 2.95（±0.18） - 调整速度：$\alpha$ = 0.38，表示偏差在 2-3 周内调整 60%
VECM 预测表现： - 当米粉销量环比 +15% 时，VECM 预测勺子在 14-21 天内需求 +13.2%（±2.1%） - 提前 21 天补货，MAPE = 12.8%，优于独立预测的 MAPE = 28.5% - 库存周转率提升 28%（45 天 → 32 天） - 配件缺货率从 22% 降至 4.1%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

缺货率 22% → 4.1%（改善 81%）
库存周转 45 天 → 32 天（加速 28%）
年度避免损失 30 万元（缺货 12 万 + 库存资金释放 18 万）
客户满意度提升 8-12%（配件不缺货）
初期投入：2-3 周开发 + 数据标注
月度维护：<5000 元（模型监控 + Johansen 检验）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（258 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/time_series/multivariate_cointegration` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/03-时间序列/Skill-Multivariate-Cointegration.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

class MultivariateCointegratedForecast:
    """
    多变量协整 VECM 模型：用于母婴品类关联销量预测
    """
    
    def __init__(self, data: np.ndarray, lag_order: int = 2):
        """
        Args:
            data: (n_obs, n_vars) 时间序列数据，每列为一个商品销量
            lag_order: VECM 滞后阶数，默认 2
        """
        self.data = data
        self.lag_order = lag_order
        self.n_obs, self.n_vars = data.shape
        self.coint_rank = None
        self.beta = None  # 协整向量
        self.alpha = None  # 调整速度
        self.gamma = None  # 短期系数
        self.fitted = False
        
    def adf_test(self, series: np.ndarray, name: str = ""):
        """单位根检验（ADF）"""
        n = len(series)
        y = series
        y_lag = np.roll(y, 1)[1:]
        dy = np.diff(y)
        
        # 简化 ADF：$\Delta y_t = \rho y_{t-1} + \epsilon_t$
        X = np.column_stack([np.ones(len(y_lag)), y_lag])
        beta = np.linalg.lstsq(X, dy, rcond=None)[0]
        residuals = dy - X @ beta
        sigma = np.std(residuals)
        se = sigma / np.sqrt(np.sum(y_lag**2))
        t_stat = (beta[1] - 1) / se
        
        return {
            'series': name,
            't_statistic': t_stat,
            'is_stationary': t_stat < -2.86,  # 5% 临界值
            'interpretation': 'I(0) 平稳' if t_stat < -2.86 else 'I(1) 单整'
        }
    
    def johansen_test(self):
        """Johansen 协整检验"""
        # 构建 VECM 数据矩阵
        dy = np.diff(self.data, axis=0)  # (n-1, k)
        y_lag = self.data[:-1, :]  # (n-1, k)
        
        # 简化 Johansen：通过 OLS 残差协方差矩阵估计协整秩
        X = np.column_stack([np.ones(len(dy)), y_lag])
        for i in range(1, self.lag_order):
            dy_lag = np.roll(dy, i, axis=0)[i:, :]
            X = np.column_stack([X, dy_lag])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：多个关联商品的历史销量序列（卡页案例为 24 个月/104 周）与配套比例关系；粒度：关联品×周或月。

**输出**：协整检验结论（协整向量、调整速度）、关联品未来需求预测与补货量建议，供联动补货与采购计划使用。

## 执行步骤

1. 整理关联品类销量序列并对齐时间轴
2. 做平稳性与协整检验确认长期均衡存在
3. 拟合 VECM 估计调整速度与短期偏离
4. 按均衡比例换算关联品补货量
5. 把联动规则接入采购计划

## 边界与不做

- 数据不满足时不用：序列过短或协整检验不显著（不存在长期均衡）时，联动结论不成立。
- 能力边界：只描述统计上的长期均衡与短期调整，不解释业务因果，外部冲击下关系可能失效。

## 技能关联

- **前置**：Skill-Stationarity-Testing、Skill-Time-Series-Decomposition
- **延伸**：Skill-Granger-Causality、Skill-Multivariate-GARCH
- **可组合**：Skill-Anomaly-Detection、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Multivariate-Cointegration.html、Skill-Multivariate-Cointegration、Skill-Seasonal-Decomposition

---

> 分类：业务运营/供应与履约/需求预测　·　技术族：03-时间序列　·　源卡：`Skill-Multivariate-Cointegration`