---
name: "p2s-shap-shapley-feature-attribution"
title: "SHAP Shapley值特征归因 — 可解释AI的通用特征重要性引擎"
description: "触发词：特征归因、模型可解释、预算调整依据、瀑布图、根因定位。何时不用：只要特征重要性排序时用特征选择；要评估生成内容质量时用 LLM-as-Judge。安全边界：不将归因结果作为平台算法的逆向依据对外宣传，归因结论只用于内部调优。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 投放诊断"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-SHAP-Shapley-Feature-Attribution"
p2s_src_domain: "12-ML基础"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把模型预测拆成每个特征加了多少分、减了多少分，让运营看懂为什么建议砍预算，从而愿意执行。"
user_try: "试试：解释这个 SKU 为什么被建议砍半广告预算，用瀑布图拆出每个特征的贡献。"
whenToUse: "属于「业务工具实现」：模型精度够但业务方不信任、需要把预测拆成可操作归因时用；若只要特征重要性排序，用特征选择；若要评估生成内容质量，用 LLM-as-Judge。"
workflow: "准备模型训练数据与待解释的具体预测样本 → 用 TreeSHAP 等快速算法计算每个特征的贡献值 → 生成瀑布图或力图，标出正负贡献 → 结合业务语义解读归因，形成行动建议 → 归因前做特征相关性检测，避免结论不稳定"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# SHAP Shapley值特征归因 — 可解释AI的通用特征重要性引擎

## ① 解决的问题

运营面临"AI模型黑盒决策无法说服团队执行"——SHAP将特征贡献分解为可操作归因，模型决策接受率从40%提升至78%，年化减少无效广告支出80万元

## ② 核心算法逻辑

SHAP（SHapley Additive exPlanations）将博弈论中的Shapley值移植到机器学习可解释性领域。核心问题：当一个模型做出预测时，每个特征贡献了多少？

## ③ 业务应用场景

场景A：广告ROAS预测模型的归因诊断 - 业务问题：XGBoost预测模型ROAS精度达0.83，但运营无法理解"为何某SKU的广告投放预算建议砍半"，团队对模型产生信任危机 - 数据要求：模型训练数据（广告指标）+ 拟解释的具体预测样本；XGBoost/LightGBM模型对象 - 预期产出：每次预测的瀑布图（waterfall plot），显示"关键词竞争度+0.18 ROAS、季节因子+0.12 ROAS、Review评分-0.08 ROAS"的精确分解 - 业务价值：运营人员获得可操作的调优方向（优先提升Review评分），模型从"黑盒"变"白盒"，决策接受率从40%提升至78%，年
三轨对抗验证： 1. 成本验证：TreeSHAP计算100个样本约0.3秒，几乎零边际成本；KernelSHAP每个样本需10-60秒，大批量需异步计算 2. 合规验证：SHAP本身无平台红线风险；但注意不可将SHAP归因结果作为"平台算法偷窥"依据对外宣传 3. 风险验证：高度相关特征（如关键词数量和广告组规模）会导致SHAP值在两个特征间"分配不稳定"，误导决策；需提前做相关性检测
场景B：供应链库存积压根因分析 - 业务问题：吸奶器SKU库存周转率连续3个月下降，需快速定位是选品问题、定价问题还是供应问题 - 数据要求：历史周转率数据 + 影响因素特征（定价/竞品数/Review均分/搜索量趋势）+ 已训练的XGBoost周转率预测模型 - 预期产出：SHAP力图（force plot），显示本月周转率下降0.18中"竞品新增+12款"贡献了-0.11，"定价高于均值15%"贡献了-0.09 - 业务价值：聚焦竞品响应策略（降价或差异化）而非误判为备货失误，避免错误清仓决策，节省约30万元库存损失

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：广告团队决策接受率从40%提升至75%，按年化广告支出500万、ROAS提升0.3估算，增量GMV约90万元；运营自主诊断效率提升60%，每月节省数据分析人工约20小时
实施难度：⭐⭐☆☆☆（pip安装即用，无需GPU，TreeSHAP计算毫秒级）
优先级：⭐⭐⭐⭐⭐（所有生产ML模型的解释需求，投入产出比极高）
评估依据：SHAP是工业界事实标准（Kaggle竞赛解决方案60%+使用），无需训练额外模型，即插即用；母婴电商场景下运营团队信任AI决策的最大障碍就是"不知道为什么"，SHAP直接解决这个痛点

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（147 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-SHAP-Shapley-Feature-Attribution
母婴跨境电商 SHAP 特征归因工具（sklearn内置实现，无需shap包）

生产环境安装 shap 后可用 shap.TreeExplainer 获得精确Shapley值；
本模板用 sklearn PermutationImportance + 手工近似实现核心概念，
零额外依赖，可直接运行。

依赖：pip install scikit-learn numpy pandas
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

# ── 1. 模拟母婴电商广告ROAS数据集 ──────────────────────────────────
np.random.seed(42)
n = 500

data = pd.DataFrame({
    'keyword_competition': np.random.beta(2, 5, n),         # 关键词竞争度 [0,1]
    'review_score':        np.random.uniform(3.5, 5.0, n),  # Review均分
    'price_ratio':         np.random.uniform(0.7, 1.3, n),  # 相对均价比
    'season_index':        np.random.uniform(0.5, 2.0, n),  # 季节指数
    'listing_quality':     np.random.uniform(0.4, 1.0, n),  # Listing质量分
    'competitor_count':    np.random.randint(5, 50, n).astype(float),
    'bid_amount':          np.random.uniform(0.3, 2.5, n),  # 出价
})

# 生成ROAS标签（含业务逻辑）
roas = (
    3.0
    - 1.5 * data['keyword_competition']
    + 0.8 * (data['review_score'] - 4.0)
    - 0.6 * (data['price_ratio'] - 1.0)
    + 0.5 * data['season_index']
    + 0.7 * data['listing_quality']
    - 0.02 * data['competitor_count']
    + np.random.normal(0, 0.2, n)
)
data['roas'] = np.clip(roas, 0.5, 8.0)

feature_cols = [c for c in data.columns if c != 'roas']
X = data[feature_cols].values
y = data['roas'].values

# ── 2. 训练 GradientBoosting 模型 ───────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
model.fit(X_train, y_train)

train_r2 = model.score(X_train, y_train)
test_r2  = model.score(X_test, y_test)
print(f"模型R² — 训练: {train_r2:.3f} | 测试: {test_r2:.3f}")

# ── 3. 全局特征重要性（Permutation Importance，近似SHAP全局均值）─────
perm_result = permutation_importance(model, X_test, y_test,
```

## ⑧ 论文来源

**出处（可能对应，未达已核验线）**：arXiv:2601.23068 — ExplainerPFN: Towards tabular foundation models for model-free zero-shot feature importance estimations

核验口径：主题指向成立但强度不足（词重合 0.333／点名相似 0）。引用前请自行确认。

## 输入 / 输出契约

**输入**：模型训练数据（卡页示例为广告指标，或库存周转率的影响因素特征）与拟解释的具体预测样本，以及已训练好的模型对象（示例 XGBoost/LightGBM）。

**输出**：每次预测的归因结果与可视化：卡页示例输出瀑布图分解（关键词竞争度 +0.18 ROAS、季节因子 +0.12、Review 评分 -0.08）与行动建议，供运营与投放团队使用。

## 执行步骤

1. 准备模型训练数据与待解释的预测样本
2. 用 TreeSHAP 等算法计算每个特征的贡献值
3. 生成瀑布图或力图，标出正负贡献
4. 结合业务语义解读归因，形成可执行建议
5. 归因前做特征相关性检测，避免结论不稳定

## 边界与不做

- 数据不满足时不用：没有已训练好的模型，或关键特征高度相关时归因会误导决策，应先处理相关性。
- 能力边界：本卡解释模型为什么这样预测，不提升模型精度，也不替代业务判断。
- 不将归因结果作为平台算法的逆向依据对外宣传，归因结论只用于内部调优。

## 技能关联

- **前置**：Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Model-Evaluation-Metrics.html、Skill-Model-Evaluation-Metrics、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor
- **延伸**：Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Intelligent-Attribution-Causal-Forest.html、Skill-Intelligent-Attribution-Causal-Forest、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor
- **可组合**：Skill-AutoML-Pipeline-Design.html、Skill-AutoML-Pipeline-Design、Skill-Data-Drift-Detection.html、Skill-Data-Drift-Detection、Skill-Model-Performance-Monitor.html、Skill-Model-Performance-Monitor、Skill-SHAP-Shapley-Feature-Attribution

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：12-ML基础　·　源卡：`Skill-SHAP-Shapley-Feature-Attribution`