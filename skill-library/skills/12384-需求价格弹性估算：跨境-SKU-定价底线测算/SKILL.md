---
name: "p2s-price-elasticity-estimation"
title: "Price Elasticity Estimation — 需求价格弹性估算：跨境 SKU 定价底线测算"
description: "触发词：价格弹性、打折测算、促销临界点、弹性系数、SKU 底线价、促销 ROI 曲线。何时不用：价格与销量互为因果、内生性严重时用「工具变量 IV 识别价格弹性」；要预测降价后备货量用「价格弹性×时间序列融合预测」。安全边界：弹性估计属内部分析，提价与折扣建议须人工确认，不得用于平台禁止的价格操纵。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-04"
l2_domain: "渠道经营"
l3_id: "DOM-04-077"
l3_business: "价格敏感性"
l3_all: "价格敏感性 / 促销规划"
l1_l2_l3: "业务运营/渠道经营/价格敏感性"
p2s_card_id: "Skill-Price-Elasticity-Estimation"
p2s_src_domain: "17-价格优化"
quality_tier: "preview"
user_summary: "先算清每个 SKU 的价格弹性，再决定黑五打不打折、打多少，以及哪些款其实该提价。"
user_try: "试试：帮我用过去 52 周的周销量与周均价算一版吸奶器的价格弹性，判断黑五降 15% 划不划算。"
whenToUse: "当要回答某个 SKU 值不值得打折、折扣临界点在哪里时用本技能；若价格与销量互为因果、需要处理内生性，用「工具变量 IV 识别价格弹性」；若还要把弹性接进销量预测做备货，用「价格弹性×时间序列融合预测」。"
workflow: "拉取 52 周 ASIN 级周销量与周均价，以及主要竞品的价格序列 → 标记促销事件时间窗口，作为回归的控制变量 → 用对数-对数 OLS 估计每个 SKU 的弹性系数 → 计算促销临界点与折扣-增量利润的 ROI 曲线 → 按弹性把 SKU 分成可提价与值得促销两类"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Price Elasticity Estimation — 需求价格弹性估算：跨境 SKU 定价底线测算

## ① 解决的问题

母婴卖家对吸奶器盲目大促打折，不知道该 SKU 弹性是否足够高值得降价——价格弹性工具变量估算（OLS + DiD）给出每个 SKU 的弹性系数，识别哪些SKU可提价哪些不值得促销，年化节省无效促销并增加利润30-80万元

## ② 核心算法逻辑

价格弹性 $\epsilon$ 定义为：价格变动1%时需求量变动的百分比。$|\epsilon|1$ 是弹性商品（涨价会显著降低销量），$|\epsilon|<1$ 是非弹性商品（涨价对销量影响小）。这是所有定价决策的底层参数——没有它，任何动态定价都是在盲飞。

## ③ 业务应用场景

业务问题：黑五要不要打折？打折多少？运营经验说"降15%就够了"，但没有数据支撑。每次促销结束后不知道是真的带动了增量销售，还是只是提前消费了原本会买的用户。
数据要求： - 过去52周 ASIN 级别周销量 + 周均价（来自 Seller Central） - 同类竞品价格序列（Keepa API，主要竞品3-5个） - 促销事件标记（Coupon/Deal/Lightning Deal 时间窗口）
预期产出： - 弹性系数：如 $\epsilon = -1.4$（价格降10%，销量预计涨14%） - 促销临界点：降价超过 X% 才能实现正增量GMV - 促销 ROI 曲线：横轴=折扣力度，纵轴=增量利润（考虑降价损失）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
识别强非弹性 SKU（奶粉配件类）后提价 10%：月增利润 ¥5-15 万
避免对高弹性 SKU 盲目提价造成的 BSR 崩塌：保护 ¥10-30 万/季度排名价值
促销预算精准分配（只对弹性高的 SKU 打折）：节省无效促销成本 ¥10-20 万/年
年化综合 ROI：¥30-80 万
实施难度：⭐⭐☆☆☆（需要 Seller Central 历史数据 + Keepa API；OLS 回归无需复杂环境）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（169 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/17-价格优化/price_elasticity_estimation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/17-价格优化/Skill-Price-Elasticity-Estimation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Price Elasticity Estimation for Cross-Border E-Commerce
基于 DiD + Log-Log OLS 的 SKU 级价格弹性估算
"""
import numpy as np
import pandas as pd
from scipy import stats
import warnings
warnings.filterwarnings('ignore')


def generate_sample_data():
    """生成模拟母婴 SKU 价格-需求数据"""
    np.random.seed(42)
    n_weeks = 52
    weeks = pd.date_range('2025-01-01', periods=n_weeks, freq='W')

    # 真实弹性设定：吸奶器 -1.4，奶粉 -0.6
    skus = {
        'breast_pump_A': {'base_price': 129, 'true_elasticity': -1.4, 'base_demand': 200},
        'formula_B':     {'base_price': 45,  'true_elasticity': -0.6, 'base_demand': 500},
        'sterilizer_C':  {'base_price': 89,  'true_elasticity': -1.1, 'base_demand': 150},
    }

    records = []
    for sku, params in skus.items():
        for i, week in enumerate(weeks):
            # 添加价格扰动（模拟促销/竞品调价）
            price_shock = np.random.choice([-0.15, -0.10, 0, 0, 0, 0.05], p=[0.05, 0.1, 0.5, 0.2, 0.1, 0.05])
            price = params['base_price'] * (1 + price_shock)
            # 季节性因子
            season = 1 + 0.3 * np.sin(2 * np.pi * i / 52)
            # 需求 = f(价格弹性, 季节, 噪声)
            demand = params['base_demand'] * season * (price / params['base_price']) ** params['true_elasticity']
            demand = max(0, demand * (1 + np.random.normal(0, 0.1)))
            records.append({'week': week, 'sku': sku, 'price': price, 'demand': demand})

    return pd.DataFrame(records)


def estimate_elasticity_ols(df, sku_name, control_vars=None):
    """
    对数-对数 OLS 弹性估算
    ln(demand) = α + ε·ln(price) + controls + ε_it
    """
    sku_df = df[df['sku'] == sku_name].copy()
    sku_df['ln_demand'] = np.log(sku_df['demand'].clip(lower=1))
    sku_df['ln_price'] = np.log(sku_df['price'])
    sku_df['week_num'] = range(len(sku_df))
    # 添加季节控制
    sku_df['sin_season'] = np.sin(2 * np.pi * sku_df['week_num'] / 52)
    sku_df['cos_season'] = np.cos(2 * np.pi * sku_df['week_num'] / 52)

    X = sku_df[['ln_price', 'sin_season', 'cos_season']].values
    X = np.column_stack([np.ones(len(X)), X])
    y = sku_df['ln_demand'].values

    # OLS
    beta, residuals, rank, sv = np.linalg.lstsq(X, y, rcond=None)
    y_pred = X @ beta
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2106.08274 — Elasticity Based Demand Forecasting and Price Optimization for Online Retail

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：过去 52 周 ASIN 级周销量与周均价（Seller Central）、主要竞品（3-5 个）的价格序列（如 Keepa）与促销事件标记（Coupon、Deal、Lightning Deal 的时间窗口）；粒度为 SKU × 周。

**输出**：每个 SKU 的价格弹性系数、促销临界点与促销 ROI 曲线，以及可提价或值得促销的 SKU 分层；供促销预算分配与定价决策使用。

## 执行步骤

1. 拉取 52 周周销量与周均价并接入竞品价格序列
2. 标记促销事件窗口并构造季节控制变量
3. 用对数-对数 OLS 估计每个 SKU 的弹性系数
4. 计算促销临界点与折扣-增量利润曲线
5. 按弹性把 SKU 分成可提价与值得促销两类

## 边界与不做

- 数据不满足：不足 52 周周级数据、或缺促销事件标记时弹性不可靠。
- 何时不用：需要处理内生性时用「工具变量 IV 识别价格弹性」；要与备货预测联动用「价格弹性×时间序列融合预测」。
- 能力边界：只估弹性并给出促销判据，不含促销报名、预算审批与改价执行。
- 安全边界：提价与折扣建议须人工确认，不得用于平台禁止的价格操纵或歧视性定价。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **延伸**：Skill-Contextual-Dynamic-Pricing-Optimal.html、Skill-Contextual-Dynamic-Pricing-Optimal、Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-Real-Time-Competitive-Repricing.html、Skill-Real-Time-Competitive-Repricing、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard
- **可组合**：Skill-Marketing-Mix-Modeling.html、Skill-Marketing-Mix-Modeling、Skill-SKU-Level-PL-Dashboard.html、Skill-SKU-Level-PL-Dashboard、Skill-Price-Elasticity-Estimation

---

> 分类：业务运营/渠道经营/价格敏感性　·　技术族：17-价格优化　·　源卡：`Skill-Price-Elasticity-Estimation`