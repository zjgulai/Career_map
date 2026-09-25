---
name: "p2s-cuped-variance-reduction"
title: "Skill Card: CUPED 方差缩减法——母婴跨境电商 A/B 实验加速器"
description: "触发词：CUPED、方差缩减、实验加速、历史协变量、样本量节省。何时不用：没有实验前历史数据、或历史指标方差过小相关性弱时CUPED无效。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-CUPED-Variance-Reduction"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用实验前的历史数据当协变量压掉噪声，同样的样本量能测出更小的提升，实验周期直接减半。"
user_try: "试试：推车 Listing 想加折叠视频，实验要跑 28 天太久，帮我用 CUPED 算能缩短到几天。"
whenToUse: "当有实验前 14-30 天历史数据、想在同样样本量下测出更小效应或缩短实验周期时用；历史数据缺失或相关性极弱时改用文本协变量方差缩减或贝叶斯实验；实验还没设计、要算初始样本量时用 A/B 实验设计基础。"
workflow: "取出实验前 14-30 天的用户历史指标与实验期指标及分组标签 → 计算历史指标与实验指标的协方差和方差，得到 θ 系数 → 用 Y 减 θ 乘（X 减 X 均值）调整指标 → 计算方差缩减率与统计功效提升 → 按缩减后的方差重算所需样本量与实验周期"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill Card: CUPED 方差缩减法——母婴跨境电商 A/B 实验加速器

## ① 解决的问题

数据分析师面临样本波动太大——CUPED将方差降35%，年化省11万元

## ② 核心算法逻辑

CUPED（Controlledexperiment Using PreExperiment Data）通过引入实验前的用户历史数据作为协变量，消除用户个体差异对实验结果的噪声干扰，在相同样本量下检测更小的效应量，或用更少样本量达到相同统计功效——本质是用历史信息降低实验方差，加速收敛。

## ③ 业务应用场景

业务问题： 某跨境卖家在亚马逊美站运营高端婴儿推车（客单价 $299，月销 800 台）。产品经理发现竞品 Listing 中包含"一键折叠收纳"视频演示，假设加入此视频可提升转化率 3-5%。传统 A/B 实验需 28 天，成本高且周期长。
实验设置： - 日均流量：5,000 UV/天（日均 150 订单） - 历史数据：实验前 30 天同一用户的购买转化行为 - 相关系数：$\rho = 0.72$（用户购买习惯稳定） - 目标效应量：3% 转化率提升
CUPED 优化效果： - 方差缩减率：$1 - 0.72^2 = 48.2\%$ - 所需样本量：从 4,200 订单 → 2,184 订单（降低 48%） - 实验周期：从 28 天 → 14 天 - 流量成本节省：14 天 × 5,000 UV × $0.8 CPC = $56,000（约 40 万元） - 实验结论：转化率提升 4.2%（p<0.01），年化 GMV 增长 180 万元 - ROI：40 万元投入 → 180 万元收益，ROI = 350%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

直接成本节省：实验周期压缩 50-75%，流量成本降低 40-120 万元/年
决策加速收益：提前 2-3 周上线优化方案，年化 GMV 增长 200-500 万元
统计功效提升：在相同样本量下检测更小效应量（从 3% → 1.5%），发现更多优化机会
总 ROI：500-800%（以 50 万元年度投入计）
需要 14-30 天历史数据完整性（通常已有）
代码集成 <1 周（仅需调用 CUPED 函数）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（276 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'if' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/ab_testing/cuped_variance_reduction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-CUPED-Variance-Reduction.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
import pandas as pd
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

class CUPEDVarianceReducer:
    """
    CUPED 方差缩减实现
    用实验前数据作为协变量，降低实验噪声，加速 A/B 实验
    
    应用场景：母婴跨境电商 A/B 实验加速
    - 输入：实验前用户指标、实验期用户指标、分组标签
    - 输出：调整后的指标、方差缩减率、统计功效提升
    """
    
    def __init__(self, pre_experiment_data, experiment_data, treatment_mask):
        """
        初始化 CUPED 缩减器
        
        Args:
            pre_experiment_data: array-like，实验前用户指标（如历史客单价）
            experiment_data: array-like，实验期用户指标（如实验期客单价）
            treatment_mask: boolean array，True 表示实验组，False 表示对照组
        """
        self.X = np.array(pre_experiment_data).flatten()  # 历史指标
        self.Y = np.array(experiment_data).flatten()      # 实验期指标
        self.treatment_mask = np.array(treatment_mask)
        self.control_mask = ~self.treatment_mask
        
        # 验证数据长度一致
        assert len(self.X) == len(self.Y) == len(self.treatment_mask), \
            "数据长度不一致"
        
        self.theta = None
        self.Y_adjusted = None
        self.variance_reduction_ratio = None
        
    def compute_theta(self):
        """
        计算回归系数 θ = Cov(Y,X) / Var(X)
        衡量历史指标对当期指标的预测能力
        """
        covariance = np.cov(self.Y, self.X)[0, 1]
        variance_x = np.var(self.X, ddof=1)
        
        if variance_x > 1e-10:
            self.theta = covariance / variance_x
        else:
            self.theta = 0
            print("[⚠] 警告：历史指标方差过小，θ 设为 0")
        
        return self.theta
    
    def adjust_metrics(self):
        """
        调整指标：Y_cuped = Y - θ(X - mean(X))
        消除用户个体差异对实验结果的噪声干扰
        """
        if self.theta is None:
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：实验前 14-30 天同一用户的历史指标（如历史购买与转化行为）、实验期用户指标与分组标签；卡页示例中历史协变量与实验指标相关系数为 0.72。

**输出**：调整后的指标、θ 系数、方差缩减率与统计功效提升（卡页示例：方差缩减 48.2%、所需样本从 4,200 订单降到 2,184、实验周期从 28 天降到 14 天）。

## 执行步骤

1. 取出实验前 14-30 天的用户历史指标、实验期指标与分组标签
2. 计算历史指标与实验指标的协方差和方差，得到 θ 系数
3. 用 Y 减 θ 乘（X 减 X 均值）调整指标
4. 计算方差缩减率与统计功效提升
5. 按缩减后的方差重算所需样本量与实验周期

## 边界与不做

- 何时不用：没有实验前历史数据、或历史指标方差过小（代码模板会给出警告并把 θ 设为 0）时，CUPED 无效；相关性很弱时缩减有限。
- 能力边界：只做方差缩减与周期重算，不改变分流与指标定义；需要 14-30 天历史数据完整，历史期与实验期行为分布变化会削弱效果。
- 卡页数字（相关系数 0.72、方差缩减 48.2%、样本 4,200 降到 2,184、周期 28 天到 14 天、ROI 350%）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-A、Skill-用户行为数据建模
- **延伸**：Skill-因果推断与倾向得分、Skill-多臂老虎机算法、Skill-贝叶斯
- **可组合**：Skill-Cohort-Retention-Analysis.html、Skill-Cohort-Retention-Analysis、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-CUPED-Variance-Reduction

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-CUPED-Variance-Reduction`