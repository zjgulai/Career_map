---
name: "p2s-ab-testing-platform-infrastructure"
title: "AB Testing Platform Infrastructure — A/B 实验平台基础设施：可扩展的在线实验框架"
description: "触发词：实验平台、流量分层、实验冲突、实时看板、早停机制。何时不用：只有一两个实验、不存在并发冲突时用单次实验设计类技能即可，不必搭平台。安全边界：无。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-104"
l3_business: "实验设计"
l3_all: "实验设计 / 业务工具实现 / 容量管理"
l1_l2_l3: "业务运营/品牌与增长/实验设计"
p2s_card_id: "Skill-AB-Testing-Platform-Infrastructure"
p2s_src_domain: "02-A_B实验"
quality_tier: "preview"
user_summary: "让多个实验同时跑而不互相打架：统一分层分流、自动统计、带早停，把实验分析从人工两小时压到半小时。"
user_try: "试试：我要同时跑主图、价格、推荐、文案、客服五个实验，帮我设计一套不互相干扰的分流方案。"
whenToUse: "当需要同时运行多个实验、担心实验之间互相干扰，或实验统计要人工耗时过长时用；只跑一两个独立实验、不涉及并发冲突时用单次实验设计类技能即可。"
workflow: "给用户分配稳定标识符并设计实验层 → 分配不同实验到独立层，并按层划分流量比例 → 用确定性哈希把用户分流到控制组与实验组 → 采集事件数据流并接入实时实验看板 → 自动输出各实验的统计显著性报告并配置早停机制"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# AB Testing Platform Infrastructure — A/B 实验平台基础设施：可扩展的在线实验框架

## ① 解决的问题

同时运行5个实验无法管理实验冲突每次统计都要人工2小时——统一实验平台流量分层+自动统计+早停机制，同时运行实验增至5-10个迭代速度3-5倍年化加速产品迭代价值20-50万元

## ② 核心算法逻辑

没有实验平台 vs 有实验平台：

## ③ 业务应用场景

业务问题：运营想同时测试：①主图 A/B ②价格敏感测试 ③推荐算法对比 ④标题文案优化 ⑤客服机器人。如果没有平台，这些实验可能相互干扰（同一用户既参与价格测试又参与推荐测试，无法分清哪个因素影响了转化）。
数据要求： - 用户 ID（稳定标识符） - 实验配置（变体/流量比/指标） - 事件数据流（点击/购买/退款等）
预期产出： - 5 个实验的独立结果（互不干扰） - 实时实验看板 - 每个实验的统计显著性报告

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：
实验并发数量：1-2个 → 5-10个，迭代速度 3-5x
实验分析时间：2小时 → 30分钟（自动化）
避免实验冲突带来的错误决策
年化综合 ROI：¥20-50 万（加速产品迭代的复利效应）
实施难度：⭐⭐⭐☆☆（核心组件并不复杂；关键是流量分层设计；约 3-4 周）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（197 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 60 行：expected an indented block after 'else' statement on line 60）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：3」并记录位置 `paper2skills-code/ab_testing/ab_testing_platform_infrastructure` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/02-A_B实验/Skill-AB-Testing-Platform-Infrastructure.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
AB Testing Platform Infrastructure
A/B实验平台：流量分层+统计引擎+实验管理
"""
import hashlib
import numpy as np
from dataclasses import dataclass, field
from collections import defaultdict
from scipy import stats
from typing import Optional


@dataclass
class Experiment:
    """实验配置"""
    experiment_id: str
    name: str
    layer: str               # 实验层（不同层的实验不冲突）
    control_pct: float = 0.5  # 对照组流量比例
    treatment_pct: float = 0.5  # 实验组流量比例
    primary_metric: str = 'conversion_rate'
    guardrail_metrics: list = field(default_factory=list)
    min_sample_size: int = 500
    is_active: bool = True


class ExperimentPlatform:
    """A/B 实验平台"""

    def __init__(self):
        self.experiments = {}
        self.metrics = defaultdict(lambda: defaultdict(list))
        # 实验层命名空间（同层实验互相冲突，不同层不冲突）
        self.layers = defaultdict(list)

    def register_experiment(self, exp: Experiment):
        """注册新实验"""
        self.experiments[exp.experiment_id] = exp
        self.layers[exp.layer].append(exp.experiment_id)
        print(f'✅ 实验 [{exp.experiment_id}] 注册成功: {exp.name} (Layer: {exp.layer})')

    def get_assignment(self, user_id: str, experiment_id: str) -> Optional[str]:
        """
        确定用户属于哪个实验变体
        使用确定性哈希：同一用户每次得到相同分配
        """
        exp = self.experiments.get(experiment_id)
        if not exp or not exp.is_active:
            return None

        # 确定性哈希分配
        salt = f"{user_id}_{experiment_id}"
        hash_val = int(hashlib.md5(salt.encode()).hexdigest(), 16) % 100
        threshold = exp.control_pct * 100

        if hash_val < threshold:
            return 'control'
        elif hash_val < (exp.control_pct + exp.treatment_pct) * 100:
            return 'treatment'
        else:
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2407.08452，但该号在 arXiv 上是《MITL Model Checking via Generalized Timed Automata and a New Liveness Algorithm》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：用户 ID（稳定标识符）+ 实验配置（变体、流量比、指标）+ 事件数据流（点击、购买、退款等）；卡页示例场景为同时运行主图、价格敏感测试、推荐算法对比、标题文案优化、客服机器人五个实验。

**输出**：多个实验互不干扰的独立结果、实时实验看板与每个实验的统计显著性报告（卡页示例：分析时间从 2 小时降到 30 分钟、并发实验从 1-2 个增至 5-10 个、迭代速度 3-5 倍）。

## 执行步骤

1. 给用户分配稳定标识符并设计实验层
2. 分配不同实验到独立层，并按层划分流量比例
3. 用确定性哈希把用户分流到控制组与实验组
4. 采集事件数据流并接入实时实验看板
5. 自动输出各实验的统计显著性报告并配置早停机制

## 边界与不做

- 何时不用：只有一两个实验、不存在并发冲突时，用单次实验设计类技能即可，不必搭建平台。
- 本技能承载的是规则与契约产物（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。
- 能力边界：只产出分层方案、实验配置与统计判据，不负责真实的流量编排与实验启停；分层与确定性哈希分流需与埋点、看板工程同步落地。
- 卡页数字（并发从 1-2 个增至 5-10 个、分析从 2 小时降到 30 分钟、迭代速度 3-5 倍、年化 20-50 万元）为示例场景，不可直接外推。

## 技能关联

- **前置**：Skill-AB-Experimental-Design.html、Skill-AB-Experimental-Design、Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing、Skill-Thompson-Sampling-Traffic-Allocation.html、Skill-Thompson-Sampling-Traffic-Allocation
- **延伸**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Causal-Uplift-Modeling.html、Skill-Causal-Uplift-Modeling、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-Sequential-AB-Testing.html、Skill-Sequential-AB-Testing
- **可组合**：Skill-Agent-Observability-Tracing.html、Skill-Agent-Observability-Tracing、Skill-Customer-Journey-Analytics.html、Skill-Customer-Journey-Analytics、Skill-AB-Testing-Platform-Infrastructure

---

> 分类：业务运营/品牌与增长/实验设计　·　技术族：02-A_B实验　·　源卡：`Skill-AB-Testing-Platform-Infrastructure`