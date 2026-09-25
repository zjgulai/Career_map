---
name: "p2s-thompson-sampling-traffic-allocation"
title: "Thompson Sampling Traffic Allocation — Thompson 采样流量分配：自适应在线实验设计"
description: "触发词：流量分配、自适应实验、贝叶斯后验、早停建议、损失转化、在线实验设计。何时不用：需要严格频率派显著性报告时用固定样本 A/B 或序列检验；只有两个方案且样本充足、不在乎实验期损失时用常规 A/B。安全边界：实时展示与点击数据需通过平台 API 或站内工具合规获取，分配决策需遵守平台流量政策。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-Thompson-Sampling-Traffic-Allocation"
p2s_src_domain: "02-A_B实验"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "实验期间就把流量多分给更优方案，减少损失转化，置信度够时还能提前收口。"
user_try: "试试：帮我给两张主图做自适应流量分配，并给出达到置信度后的早停建议。"
whenToUse: "方案差距可能很快显现、不愿在实验期浪费流量时用本技能；只看最终结论、不在乎实验期损失时用标准 A/B；需要固定时点的显著性报告时用序列检验。"
workflow: "定义各实验方案与奖励口径 → 按后验采样选择每个用户看到的方案 → 回填展示、点击与购买并更新后验 → 输出每日分配比例与后验可视化 → 达到置信度阈值时给出早停建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Thompson Sampling Traffic Allocation — Thompson 采样流量分配：自适应在线实验设计

## ① 解决的问题

传统A/B实验2周内50%流量给表现更差的方案浪费了大量转化机会——Thompson采样自适应流量分配减少损失转化30-50%同时将实验周期缩短20-40%，年化多发现2-3个增量实验结论

## ② 核心算法逻辑

固定分配 vs 自适应分配：

## ③ 业务应用场景

业务问题：测试两张主图，传统 A/B 需要 2 周才能达到显著性。前 3 天如果图 B 明显更好（CVR 6% vs 4%），后续 11 天继续给 A 50% 流量是在浪费转化机会。Thompson 采样可以在保证结论可靠性的前提下，减少总体损失转化数。
数据要求： - 实时展示/点击/购买数据（对于 Amazon，需要 API 或站内工具） - 每次"分配决策"的上下文（时间/设备/地区）
预期产出： - 自适应流量分配策略（每天更新分配比例） - 贝叶斯后验分布可视化（哪个方案更可能更好） - 早停建议：达到 95% 置信度时提前结束

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
实验总损失减少 30-50%：同等实验次数下多发现 30-50% 的增量
实验周期缩短 20-40%（早停）：更快迭代，年化多跑 2-3 个实验
每月 4-6 个实验 × 每次节省转化损失：年化 ¥5-15 万
年化综合 ROI：¥10-30 万
实施难度：⭐⭐☆☆☆（Thompson 采样实现简单；需要实时数据流接入；约 1-2 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（152 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/ab_testing/thompson_sampling_traffic_allocation` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-Thompson-Sampling-Traffic-Allocation.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Thompson Sampling Traffic Allocation
自适应流量分配：贝叶斯多臂老虎机
"""
import numpy as np
from dataclasses import dataclass, field


@dataclass
class BayesianArm:
    """Thompson 采样的单臂（单实验方案）"""
    name: str
    alpha: float = 1.0   # 先验 + 成功次数
    beta: float = 1.0    # 先验 + 失败次数

    @property
    def mean(self):
        return self.alpha / (self.alpha + self.beta)

    @property
    def sample(self):
        return float(np.random.beta(self.alpha, self.beta))

    def update(self, success: bool):
        if success:
            self.alpha += 1
        else:
            self.beta += 1

    @property
    def n_trials(self):
        return int(self.alpha + self.beta - 2)  # 减去先验


class ThompsonSamplingExperiment:
    """Thompson 采样多臂实验"""

    def __init__(self, variants: list[str], stop_threshold: float = 0.95):
        self.arms = [BayesianArm(name=v) for v in variants]
        self.stop_threshold = stop_threshold

    def select_arm(self) -> int:
        """选择下一个用户分配给哪个方案"""
        samples = [arm.sample for arm in self.arms]
        return int(np.argmax(samples))

    def update(self, arm_idx: int, success: bool):
        """更新实验结果"""
        self.arms[arm_idx].update(success)

    def probability_best(self, n_samples: int = 10000) -> np.ndarray:
        """蒙特卡洛估计每个方案是最优的概率"""
        counts = np.zeros(len(self.arms))
        for _ in range(n_samples):
            samples = [arm.sample for arm in self.arms]
            counts[np.argmax(samples)] += 1
        return counts / n_samples

    def should_stop(self) -> tuple[bool, str]:
        """贝叶斯停止标准：某方案 P(best) > threshold"""
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.15892，但该号在 arXiv 上是《A generalization of the Romanoff theorem》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：实时的展示、点击、购买数据（Amazon 需 API 或站内工具）以及每次分配决策的上下文（时间、设备、地区）；粒度到决策级，需要能按天更新分配比例。

**输出**：每日更新的自适应流量分配比例、贝叶斯后验分布可视化、达到预设置信度时的早停建议；供运营在更短周期内拿到可靠方案结论并减少损失转化。

## 执行步骤

1. 定义各实验方案的先验与实际奖励口径
2. 按后验采样为每个用户选择方案
3. 回填展示、点击与购买并更新 alpha 与 beta
4. 输出每日分配比例与后验可视化
5. 达到置信度阈值时给出早停建议

## 边界与不做

- 何时不用：需要在固定时点出正式显著性报告时用固定样本检验或序列检验，不要用自适应分配。
- 能力边界：本技能产出分配比例、后验与早停判据，不执行投放系统里的流量下发。
- 数据边界：没有实时展示与点击数据通道时先解决数据接入，否则自适应分配退化为事后分析。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Delayed-Conversion-Causal-MTL.html、Skill-Delayed-Conversion-Causal-MTL、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-MAB.html、Skill-Thompson-Sampling-MAB
- **延伸**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Delayed-Conversion-Causal-MTL.html、Skill-Delayed-Conversion-Causal-MTL、Skill-Listing-AB-Testing-Automation.html、Skill-Listing-AB-Testing-Automation、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **可组合**：Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Delayed-Conversion-Causal-MTL.html、Skill-Delayed-Conversion-Causal-MTL、Skill-Purchase-Intent-Prediction.html、Skill-Purchase-Intent-Prediction、Skill-Thompson-Sampling-Traffic-Allocation

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-Thompson-Sampling-Traffic-Allocation`