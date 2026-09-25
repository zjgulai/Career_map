---
name: "p2s-bayesian-hyperparameter-optimization"
title: "贝叶斯超参搜索 — Optuna/BO 替代随机搜索"
description: "触发词：贝叶斯超参优化、TPE代理模型、采集函数、剪枝提前终止、GPU算力节省。何时不用：单次评估代价极高或试验预算不足20次时不适用；需要端到端自动建模与算法选择用AutoML流水线设计。安全边界：只优化模型元参数，不改变训练数据与业务口径，调参过程不涉及用户隐私数据。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Bayesian-Hyperparameter-Optimization"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用代理模型和采集函数挑下一组超参，用更少的试验次数拿到更好的模型表现。"
user_try: "试试：LightGBM CTR 模型 Grid Search 要跑8小时，帮我用贝叶斯优化在50次试验内找到更好的超参。"
whenToUse: "当超参组合爆炸、需要用尽可能少的试验找到较优配置时用本卡；需要连同算法选择与特征流程一起自动化用 AutoML 流水线设计；需要代码模板检索复用用代码检索类技能。"
workflow: "明确待调模型的评估指标与试验预算 → 定义超参搜索空间 → 用 TPE 代理模型按采集函数选下一组超参 → 交叉验证评估并按中位数剪枝提前终止 → 输出最优超参组合与试验记录"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 贝叶斯超参搜索 — Optuna/BO 替代随机搜索

## ① 解决的问题

数据科学家面临"随机搜索超参耗费大量GPU算力且效果不稳定"——贝叶斯超参优化将调参迭代次数减少60%且最终模型性能提升8-15%，年化节省GPU成本10-20万元

## ② 核心算法逻辑

贝叶斯超参优化（Bayesian Hyperparameter Optimization）用概率代理模型（高斯过程 GP 或 TPE）对目标函数 f(x) 建立置信区间估计，通过采集函数（Expected Improvement、UCB）在「探索未知区域」与「利用已知高分区域」之间动态权衡，每次试验均利用历史观测结果更新后验分布，从而以极少次评估定位最优超参组合。

## ③ 业务应用场景

场景1：Amazon 母婴商品 CTR 预测模型调参 - 业务问题：LightGBM CTR 模型超参（学习率/树深/特征采样比）组合爆炸，Grid Search 耗时 8h 且结果次优 - 数据要求：历史浏览/点击日志 ≥50 万条，特征含商品类别、用户月龄标签、价格段 - 预期产出：50 次试验内找到 AUC +2.3% 的超参组合，调参耗时从 8h 降至 1.5h - 业务价值：CTR +2.3% → 自然流量增加 ~15%，月均 GMV 提升约 12 万元
场景2：新生儿护肤品差评预测模型（NLP）调参 - 业务问题：BERT fine-tune 超参空间（lr/warmup/dropout/batch_size）需快速收敛 - 数据要求：Amazon 评论 2 万条（含星级标签），GPU 资源有限（A10 × 1） - 预期产出：30 次试验内 F1 +3.8%，每次试验含 pruning 中位耗时 12 min - 业务价值：差评预测准确率提升 → 客服分诊成本降低约 30%，年化节省 8 万元
**三轨验证**： - 成本：Optuna 开源免费，云端 GPU 调参成本可控（30 次 × 12 min × $0.3/h ≈ $18） - 合规：调参过程不涉及用户隐私数据，仅操作模型元参数 - 风险：代理模型过拟合（试验数过少时 GP 方差估计不准），建议 ≥20 次预热随机探索

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：CTR 模型 AUC +2%~4% → 广告 ROAS 提升约 8%~15%，年化增益 15~50 万元（依 GMV 规模）
实施难度：⭐⭐☆☆☆（Optuna 3 行代码即可接入现有训练脚本）
优先级：⭐⭐⭐⭐☆
评估依据：调参是模型性能提升最高 ROI 的工程优化手段之一，且无需新增数据。母婴电商 CTR/CVR 模型每季度需重训，BO 可持续复用降低调参边际成本。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（86 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
贝叶斯超参优化 — Optuna TPE + LightGBM CTR 预测
依赖: pip install optuna lightgbm scikit-learn
"""
import optuna
import lightgbm as lgb
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import roc_auc_score

optuna.logging.set_verbosity(optuna.logging.WARNING)

# 模拟母婴电商 CTR 数据
np.random.seed(42)
X, y = make_classification(
    n_samples=50000, n_features=30, n_informative=15,
    n_redundant=5, weights=[0.97, 0.03], random_state=42
)

def objective(trial: optuna.Trial) -> float:
    params = {
        "objective": "binary",
        "metric": "auc",
        "verbosity": -1,
        "boosting_type": "gbdt",
        "num_leaves": trial.suggest_int("num_leaves", 20, 300),
        "max_depth": trial.suggest_int("max_depth", 3, 12),
        "learning_rate": trial.suggest_float("learning_rate", 1e-4, 0.3, log=True),
        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
    }
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    scores = []
    for fold, (tr_idx, va_idx) in enumerate(cv.split(X, y)):
        model = lgb.LGBMClassifier(**params)
        model.fit(
            X[tr_idx], y[tr_idx],
            eval_set=[(X[va_idx], y[va_idx])],
            callbacks=[
                lgb.early_stopping(50, verbose=False),
                lgb.log_evaluation(-1),
                optuna.integration.LightGBMPruningCallback(trial, "auc"),
            ],
        )
        scores.append(roc_auc_score(y[va_idx], model.predict_proba(X[va_idx])[:, 1]))
    return float(np.mean(scores))

# TPE 采样器 + 中位数剪枝
sampler = optuna.samplers.TPESampler(seed=42, n_startup_trials=10)
pruner = optuna.pruners.MedianPruner(n_startup_trials=5, n_warmup_steps=1)

study = optuna.create_study(
    direction="maximize",
    sampler=sampler,
    pruner=pruner,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：待调模型的训练数据与特征、评估指标（如 AUC 或 F1）、超参搜索空间定义（如学习率、树深、采样比、正则系数）与试验预算（次数与算力上限）。

**输出**：最优超参组合、每次试验的评估记录与耗时，以及相对基线（如 Grid Search）的指标提升与调参耗时对比，供算法团队复用与复现。

## 执行步骤

1. 明确待调模型的评估指标与总试验预算
2. 定义各超参的取值范围与分布
3. 用 TPE 代理模型按采集函数选择下一组超参
4. 用交叉验证评估每次试验并按中位数剪枝提前终止
5. 用不少于 20 次随机预热缓解代理模型过拟合
6. 输出最优超参组合与完整试验记录

## 边界与不做

- 何时不用：单次评估代价极高、或试验预算不足 20 次时不适用（代理模型方差估计不准，易过拟合）。
- 能力边界：只优化模型元参数，不改变训练数据、特征口径与业务定义；算力与试验预算上限由使用者给定。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **可组合**：Skill-Bayesian-Hyperparameter-Optimization

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：12-ML基础　·　源卡：`Skill-Bayesian-Hyperparameter-Optimization`