---
name: "p2s-automated-causal-discovery"
title: "Automated Causal Discovery — 自动化因果发现：从数据自动识别业务驱动因素"
description: "触发词：因果发现、因果图、驱动因素、中介变量、投放诊断。何时不用：要归因内容投入对 GMV 的增量用「AIGC 收入归因」；要按购买意图分层触达用「购买意图预测」。安全边界：因果图只是数据驱动的假设，须经领域专家与对照实验验证后才能作为决策依据；不得把相关结构直接当作可干预结论对外承诺。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析 / 投放诊断"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-Automated-Causal-Discovery"
p2s_src_domain: "01-因果推断"
quality_tier: "preview"
user_summary: "BSR 排名到底是销量的原因还是结果：用因果发现把驱动因素和中介变量分开，别再刷错指标。"
user_try: "试试：用 180 天的日度数据跑一遍因果发现，找出哪些变量真正因果影响销量，哪些只是相关。"
whenToUse: "当要判断一组业务指标里谁真正驱动销量（而非只是相关）并找到可干预变量时用本技能；要归因内容投入的增量用「AIGC 收入归因」；要按购买意图分层触达用「购买意图预测」。"
workflow: "整理 180 天日度多指标数据：销量、价格、广告花费、ROAS、BSR、评论数、评分、退货率、搜索量 → 做平稳性与缺失处理 → 用 PC 或 NOTEARS 类算法发现因果骨架与方向 → 识别中介路径（如评论速度到 BSR 到销量） → 与领域专家核对后给出干预点建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Automated Causal Discovery — 自动化因果发现：从数据自动识别业务驱动因素

## ① 解决的问题

运营长期认为BSR排名是销量的原因努力刷排名但效果不稳定——NOTEARS自动因果发现揭示BSR是销量的结果而非原因，纠正错误认知后将资源聚焦真正的驱动因素（广告/价格）年化ROI提升10-30万元

## ② 核心算法逻辑

传统因果分析 vs 因果发现：

## ③ 业务应用场景

业务问题：运营直觉认为"ROAS 高→销量好"，但数据分析显示 BSR 排名变化比 ROAS 变化更能预测未来销量。不知道哪些变量真正"因果"影响销量，哪些只是相关。
数据要求： - 多维度日度数据（180天）：销量/价格/广告花费/ROAS/BSR/评论数/评分/退货率/搜索量 - 建议 10-20 个业务指标
预期产出： - 因果 DAG：哪些变量因果影响销量（而非只是相关） - 关键发现：意外的因果路径（"评论速度→BSR→销量"中，BSR 是中介） - 建议干预点：最高效的提升销量的操作变量

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
纠正错误认知（BSR 不是销量原因，而是结果）：停止无效"刷排名"操作，节省 ¥5-20 万/年
发现意外因果路径（如评论速度→搜索权重→销量）：优化正确的驱动变量，ROI 提升 10-20%
自动化消除人工建模的先验假设偏差：分析质量提升，避免因错误模型导致的决策失误
年化综合 ROI：¥10-30 万
实施难度：⭐⭐⭐☆☆（causal-learn 库有成熟 PC/NOTEARS 实现；需要 2-6 个月历史数据；因果图解读需要领域专家配合；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（154 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：unterminated triple-quoted string literal (detected at line 60)）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/causal_inference/automated_causal_discovery` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/01-因果推断/Skill-Automated-Causal-Discovery.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Automated Causal Discovery
自动化因果发现：从业务数据学习因果图结构
简化版 NOTEARS / PC 算法
生产环境: pip install causal-learn 或 cdt (Causal Discovery Toolbox)
"""
import numpy as np
from itertools import combinations


def generate_ecommerce_causal_data(n_days: int = 180, seed: int = 42) -> tuple:
    """生成含已知因果结构的电商数据（用于验证）"""
    np.random.seed(seed)
    t = np.arange(n_days)

    # 真实因果结构：
    # season → ad_spend → sales
    # price → sales
    # sales → bsr (BSR是结果，不是原因)
    # bsr → future_sales (排名影响下一期销量)

    season = np.sin(2 * np.pi * t / 365) + np.random.normal(0, 0.1, n_days)
    price = 100 - 5 * (t % 30 < 5) + np.random.normal(0, 3, n_days)  # 月初促销
    ad_spend = 500 + 200 * season + np.random.normal(0, 50, n_days)   # 季节性广告

    # 销量受价格和广告驱动
    sales = 80 - 0.5 * (price - 100) + 0.02 * ad_spend + np.random.normal(0, 5, n_days)
    sales = np.maximum(0, sales)

    # BSR 受销量驱动（结果变量）
    bsr = 500 - 2 * sales + np.random.normal(0, 20, n_days)
    bsr = np.maximum(1, bsr)

    # 退货率弱相关于价格（高价→更多退货）
    return_rate = 0.06 + 0.001 * (price - 100) + np.random.normal(0, 0.01, n_days)

    data = np.column_stack([season, price, ad_spend, sales, bsr, return_rate])
    var_names = ['season', 'price', 'ad_spend', 'sales', 'bsr', 'return_rate']
    return data, var_names


def compute_partial_correlation(X: np.ndarray, i: int, j: int, S: list) -> float:
    """计算控制变量 S 后 i 和 j 的偏相关系数"""
    if not S:
        corr_mat = np.corrcoef(X.T)
        return corr_mat[i, j]
    # 用残差法计算偏相关
    cond_vars = list(S)
    def residual(target, regressors):
        X_reg = np.column_stack([X[:, r] for r in regressors] + [np.ones(len(X))])
        beta = np.linalg.lstsq(X_reg, X[:, target], rcond=None)[0]
        return X[:, target] - X_reg @ beta
    ri = residual(i, cond_vars)
    rj = residual(j, cond_vars)
    return float(np.corrcoef(ri, rj)[0, 1])


def pc_skeleton_discovery(data: np.ndarray, var_names: list,
                           alpha: float = 0.05) -> dict:
    """
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.14691 — CAMO: An Agentic Framework for Automated Causal Discovery from Micro Behaviors to Macro Emergence in LLM Agent Simulations

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：多维度日度业务数据（卡页示例 180 天、建议 10-20 个业务指标，含销量、价格、广告花费、ROAS、BSR、评论数、评分、退货率、搜索量）；粒度为指标 × 日。

**输出**：因果有向图（哪些变量因果影响销量）、意外的因果路径（含中介变量）与建议干预点；供经营分析与运营调整资源投放方向。

## 执行步骤

1. 整理 180 天日度的多维业务指标数据
2. 做平稳性与缺失值处理后进入因果发现
3. 用 PC 或 NOTEARS 类算法发现因果骨架与方向
4. 识别中介路径并区分原因变量与结果变量
5. 与领域专家核对后输出干预点建议

## 边界与不做

- 数据不满足：历史长度不足（卡页建议 2-6 个月）或指标数过少时因果结构不稳，先攒数据。
- 何时不用：要归因内容投入的增量效果用「AIGC 收入归因」；要按购买意图分层触达用「购买意图预测」。
- 能力边界：只输出数据驱动的因果假设与干预点，不替代对照实验，也不保证卡页口径的 ROI 提升。
- 安全边界：因果图须经领域专家与验证实验确认后才能作为决策依据，不得把相关结构直接当作可干预结论对外承诺。

## 技能关联

- **前置**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-ML-Feature-Engineering.html、Skill-Causal-ML-Feature-Engineering、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation
- **延伸**：Skill-Causal-Attribution-Bridge.html、Skill-Causal-Attribution-Bridge、Skill-Causal-RL-Dynamic-Pricing.html、Skill-Causal-RL-Dynamic-Pricing、Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation
- **可组合**：Skill-Data-Collection-Agent-Pipeline.html、Skill-Data-Collection-Agent-Pipeline、Skill-NL2Dashboard-Automation.html、Skill-NL2Dashboard-Automation、Skill-Automated-Causal-Discovery

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：01-因果推断　·　源卡：`Skill-Automated-Causal-Discovery`