---
name: "p2s-automl-pipeline-design"
title: "AutoML 流水线设计 — Optuna TPE + FLAML 自动化建模"
description: "触发词：AutoML流水线、TPE超参搜索、自动算法选择、MAPE改善、模型自动导出。何时不用：样本量过小或特征不稳定时不适用；只对单一模型做精细调参用贝叶斯超参搜索。安全边界：搜索到的策略若涉及定价等业务动作须加业务约束（如价格下限），预测结果不得直接当作定价决策。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-AutoML-Pipeline-Design"
p2s_src_domain: "12-ML基础"
quality_tier: "preview"
user_summary: "把特征、算法和超参的挑选交给自动搜索，几小时跑出比人工调优更准的模型。"
user_try: "试试：XGBoost 销量预测模型 MAPE 长期停在18%，帮我用 AutoML 自动试200组配置把精度提上去。"
whenToUse: "当需要端到端自动化建模流程（算法选择加超参搜索）且样本量充足时用本卡；只对既有模型做超参搜索用贝叶斯超参搜索技能；需要代码语义检索复用模板用代码检索类技能。"
workflow: "整理历史销量与特征矩阵 → 定义候选算法与各自超参搜索空间 → 用 TPE 采样器在预算内自动试验多组配置 → 交叉验证评估并按中位数剪枝提前终止 → 导出最优模型并对比精度与耗时"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AutoML 流水线设计 — Optuna TPE + FLAML 自动化建模

## ① 解决的问题

数据科学家面临"每个新预测任务都要重新手工搜索超参模型选择耗时数天"——Optuna TPE贝叶斯搜索将模型调优时间从3天压缩至4小时，准确率提升7%

## ② 核心算法逻辑

核心思想：AutoML 将「特征工程 → 算法选择 → 超参调优」三个步骤自动化，通过贝叶斯优化在搜索空间中高效找到最优配置，让非 ML 专家也能获得接近专家水平的模型。

## ③ 业务应用场景

- 业务问题：数据工程师每季度手动调优 XGBoost 预测模型，耗时 3 天，调优结果依赖个人经验，MAPE 长期停在 18% 无法突破 - 数据要求：历史销量数据（时间序列特征矩阵，≥5000 行）、特征列表（价格/促销/节假日/竞品价格） - 预期产出：AutoML 在 2 小时内自动试验 200+ 配置（LightGBM/XGBoost/Random Forest + 超参），MAPE 从 18% → 12%，最优模型自动导出 - 业务价值：预测精度提升 6pp → 库存准确率提升 → 年化节省缺货损失约 80 万元；工程师从 3 天/季 → 0.5 天，节省人力成本约 5 万元/年
三轨验证： - 成本：显性成本包括 Optuna/FLAML 库部署（免费）、CPU 计算资源（50 trials 约 5-15 分钟，AWS EC2 t3.medium 约 $0.04/次）、数据清洗人力（约 0.5 人天/季度）。年化总成本约 2 万元。 - 合规：使用历史销量数据不涉及 GDPR 个人隐私；不触碰 Amazon 定价政策（仅用于预测，不操纵价格）；无广告法风险。 - 风险：模型预测偏差可能导致过度备货（次生风险）；若 AutoML 搜索到极端低价策略并被业务采纳，可能引发竞品价格战；需设置价格下限约束。
场景B：Listing 质量分类模型快速迭代

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：预测精度提升 6pp 带来库存节省 80 万元/年；工程师人力节省约 5 万元/年。总年化约 85 万元
实施难度：⭐⭐⭐☆☆（需要 optuna 库，搜索时间随 n_trials 增加；本地 CPU 50 trials 约 5-15 分钟）
优先级：⭐⭐⭐⭐⭐（通用性极强，所有需要建模的 Skill 都可受益；一次实现多处复用）
评估依据：FLAML 论文在多个 benchmark 上比手工调优平均提升 15-30%；母婴供应链场景数据量适中（103 万 SKU），AutoML 完全可行

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（157 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ml_fundamentals/automl_pipeline_design` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/12-ML基础/Skill-AutoML-Pipeline-Design.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AutoML 流水线设计 — Optuna TPE 贝叶斯超参搜索
（不依赖 FLAML/AutoSklearn，用 Optuna + sklearn 实现核心逻辑）
"""
import numpy as np
import optuna
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_percentage_error
import warnings

warnings.filterwarnings("ignore")
optuna.logging.set_verbosity(optuna.logging.WARNING)


def make_pipeline(trial: optuna.Trial, X: np.ndarray) -> Pipeline:
    """
    定义搜索空间：算法选择 + 超参
    """
    algo = trial.suggest_categorical("algorithm", ["gbm", "rf", "ridge"])

    if algo == "gbm":
        model = GradientBoostingRegressor(
            n_estimators=trial.suggest_int("gbm_n_estimators", 50, 300),
            max_depth=trial.suggest_int("gbm_max_depth", 2, 8),
            learning_rate=trial.suggest_float("gbm_lr", 0.01, 0.3, log=True),
            subsample=trial.suggest_float("gbm_subsample", 0.6, 1.0),
            random_state=42,
        )
    elif algo == "rf":
        model = RandomForestRegressor(
            n_estimators=trial.suggest_int("rf_n_estimators", 50, 300),
            max_depth=trial.suggest_int("rf_max_depth", 3, 15),
            min_samples_leaf=trial.suggest_int("rf_min_leaf", 1, 10),
            random_state=42,
        )
    else:
        model = Ridge(
            alpha=trial.suggest_float("ridge_alpha", 0.01, 100.0, log=True),
        )

    use_scaler = trial.suggest_categorical("use_scaler", [True, False])
    steps = ([("scaler", StandardScaler())] if use_scaler else []) + [("model", model)]
    return Pipeline(steps)


def automl_search(
    X: np.ndarray,
    y: np.ndarray,
    n_trials: int = 50,
    cv: int = 5,
    metric: str = "neg_mean_absolute_percentage_error"
) -> dict:
    """
    AutoML 超参搜索主入口
    返回：最优算法配置 + 验证分数
    """
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2005.01571 — Frugal Optimization for Cost-related Hyperparameters

核验口径：主题指向成立但强度不足（词重合 0.2／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：历史销量数据构成的时间序列特征矩阵（通常不少于 5000 行）、特征列表（价格、促销、节假日、竞品价格等），以及试验预算与评估指标（如 MAPE）。

**输出**：最优算法与超参配置、验证分数与精度提升幅度、试验耗时对比，以及导出的最优模型，供数据与业务团队复用于预测任务。

## 执行步骤

1. 整理历史销量与特征矩阵并确认样本量充足
2. 定义搜索空间：候选算法及其超参范围
3. 用 TPE 采样器在试验预算内自动试验多组配置
4. 用交叉验证评估并按中位数剪枝提前终止差试验
5. 导出最优模型并报告精度提升与耗时对比

## 边界与不做

- 何时不用：样本量过小、或特征分布不稳定时不适用；只对既有模型调超参时用更轻的贝叶斯超参搜索。
- 能力边界：只做建模流程自动化，不替代业务对预测结果的判断；搜索到的极端策略若被业务采纳可能引发价格战，须设置业务约束（如价格下限）。
- 合规边界：仅使用历史销量数据做预测，不操纵平台价格；数据准备须避免时间序列信息泄漏（按时间切分）。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Feature-Selection.html、Skill-Feature-Selection、Skill-Hyperparameter-Optimization.html、Skill-Hyperparameter-Optimization、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-Online-Incremental-Learning.html、Skill-Online-Incremental-Learning
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-AutoML-Pipeline-Design

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：12-ML基础　·　源卡：`Skill-AutoML-Pipeline-Design`