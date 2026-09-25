---
name: "p2s-adaptive-experiment-design"
title: "Adaptive Experiment Design — 自适应实验设计（提前停止与样本再分配）"
description: "触发词：自适应实验、提前停止、样本再分配、序贯检验、中期分析。何时不用：平台不支持中期分析API、或只需固定周期结论时用固定样本量设计。安全边界：动态分配流量需确保对照组流量不低于20%（卡页合规要求）。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Adaptive-Experiment-Design"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "实验不用死等跑满周期：设好中期检验节点，达标就提前停，把流量向表现好的组倾斜。"
user_try: "试试：新品主图实验固定 14 天太久了，帮我设计一份带中期检验和提前停止的自适应方案。"
whenToUse: "当实验周期过长、会持续暴露错误配置，或多档促销同测不想让低效组持续亏损时用；只能跑固定样本量、平台不支持中期分析时用 A/B 实验设计基础类技能。"
workflow: "设定显著性水平、功效与中期检验节点（示例 3 次） → 计算 O'Brien-Fleming 序贯检验边界 → 用累积数据在每个检验节点计算 Z 统计量并与边界比较 → 达标即提前停止出结论，否则继续或按 RAR 重新分配流量 → 记录完整分配历史备查，避免样本选择偏差"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Adaptive Experiment Design — 自适应实验设计（提前停止与样本再分配）

## ① 解决的问题

实验平台工程师面临"AB实验跑满30天才能停止造成大量错误配置暴露"——自适应实验设计将实验周期缩短50%且假阳性率不增加，年化节省无效实验损失30-50万元

## ② 核心算法逻辑

自适应实验设计（Adaptive Experiment Design）允许研究者在实验进行中根据累积数据动态调整试验参数，而不必等到固定样本量跑完。核心机制包含两类：提前停止（Early Stopping） 和 样本再分配（Sample Reallocation）。

## ③ 业务应用场景

场景1：Amazon Listing 主图 AB 实验提前停止 - 业务问题：新品上线第一周需快速验证主图点击率，固定 14 天实验周期太长，竞争对手已在跑同类款 - 数据要求：每日点击率（CTR）流量 ≥ 500 次曝光/组，实验前设定 3 次中期检验节点 - 预期产出：实验周期缩短 40%（约 8 天出结论），节省 6 天无效流量损耗 - 业务价值：按月均 30 次 Listing 实验计算，每次节省 2 天 × 平均日均收益损失 $200 = 每月节省 $12,000
场景2：婴儿奶粉促销价格策略自适应分配 - 业务问题：多档折扣同时测试（9折/85折/8折），传统 1:1:1 分配导致低折扣组持续亏损 - 数据要求：每小时转化率数据，最小可检测效应（MDE）设定为 2% 转化率差异 - 预期产出：RAR 将流量实时向高转化折扣档倾斜，实验期间 GMV 损失降低 15% - 业务价值：大促期间 3 天实验节省促销 GMV 损失约 8 万元
**三轨验证**： - 成本：需要实验平台支持中期分析 API，工程改造约 2 人周 - 合规：Amazon 平台允许流量动态分配，无违规风险；需确保对照组流量不低于 20% - 风险：RAR 可能导致样本选择偏差（Survivorship Bias），需记录分配历史备查

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：Listing 实验周期缩短 40%（14 天→8 天），按月 30 次实验、每次节省收益损失 $200/天计算，月增益约 $12,000；RAR 实验期间 GMV 损失减少 15%
实施难度：⭐⭐⭐⭐☆（需要实验平台支持中期 API 调用，工程改造约 2 人周）
优先级：⭐⭐⭐⭐☆
评估依据：母婴新品迭代节奏快（季节/竞品双重压力），实验提速直接影响上新速度；多档促销同测是大促标配需求，RAR 在资源约束下优化实验 GMV 损失价值明确

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（190 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# ============================================================
# Adaptive Experiment Design: O'Brien-Fleming Early Stopping
# ============================================================

class AdaptiveExperiment:
    """
    O'Brien-Fleming 边界的序贯实验，支持提前停止和样本再分配。
    适用场景：Amazon Listing CTR / 转化率 AB 实验
    """

    def __init__(self, alpha: float = 0.05, beta: float = 0.20,
                 n_interim: int = 3, n_max: int = 10000):
        self.alpha = alpha
        self.beta = beta
        self.n_interim = n_interim        # 中期检验次数
        self.n_max = n_max                # 最大样本量
        self.spending_times = np.linspace(1/n_interim, 1.0, n_interim)
        self.boundaries = self._compute_obf_boundaries()
        self.history = []

    def _compute_obf_boundaries(self) -> list[float]:
        """
        O'Brien-Fleming Alpha Spending 边界（近似值）
        z_k = z_{alpha/2} / sqrt(t_k)，t_k = k/K
        """
        z_alpha = stats.norm.ppf(1 - self.alpha / 2)
        boundaries = []
        for t in self.spending_times:
            # OBF 边界：早期检验使用更严格的阈值
            b = z_alpha / np.sqrt(t)
            boundaries.append(b)
        return boundaries

    def run_interim_analysis(self, control_data: np.ndarray,
                              treatment_data: np.ndarray,
                              interim_idx: int) -> dict:
        """执行中期分析，返回是否提前停止的决策"""
        n_ctrl = len(control_data)
        n_trt = len(treatment_data)

        # 双样本 z 检验
        p_ctrl = np.mean(control_data)
        p_trt = np.mean(treatment_data)
        se = np.sqrt(p_ctrl * (1 - p_ctrl) / n_ctrl +
                     p_trt * (1 - p_trt) / n_trt)

        if se == 0:
            return {"stop": False, "z_stat": 0, "boundary": self.boundaries[interim_idx]}

        z_stat = (p_trt - p_ctrl) / se
        boundary = self.boundaries[interim_idx]
        t_k = self.spending_times[interim_idx]

        result = {
            "interim": interim_idx + 1,
            "t_k": t_k,
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：每日指标数据（卡页示例 CTR 场景需 ≥ 500 次曝光/组，促销场景为每小时转化率数据）+ 实验前设定的中期检验节点（示例 3 次）+ 最小可检测效应（示例 2% 转化率差异）+ 显著性水平与功效设定。

**输出**：中期检验结果与是否提前停止的判定、按 O'Brien-Fleming 边界计算的 Z 统计量与阈值、以及 RAR 倾斜后的流量分配方案（卡页示例：周期缩短 40%、约 8 天出结论、实验期间 GMV 损失降低 15%）。

## 执行步骤

1. 设定显著性水平、功效与中期检验节点（示例 3 次）
2. 计算 O'Brien-Fleming 序贯检验边界
3. 用累积数据在每个检验节点计算 Z 统计量并与边界比较
4. 达标即提前停止出结论，否则继续或按 RAR 重新分配流量
5. 记录完整分配历史备查，避免样本选择偏差

## 边界与不做

- 何时不用：实验平台不支持中期分析 API、或只跑固定周期无中期节点时，用固定样本量设计即可；需要精确效应量估计的实验不适合提前停止。
- 能力边界：只输出停止与分配规则，不执行流量切换；RAR 可能引入样本选择偏差（幸存者偏差），卡页要求记录分配历史备查。
- 合规边界：动态分配流量需确保对照组流量不低于 20%（卡页合规要求）。
- 卡页数字（周期缩短 40%、14 天到 8 天、每月节省 12,000 美元、GMV 损失降低 15%、年化 30-50 万元）为示例场景，不可直接外推。

## 技能关联

- **可组合**：Skill-Adaptive-Experiment-Design

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Adaptive-Experiment-Design`