---
name: "p2s-email-sequence-multiarm-optimizer"
title: "Email Sequence Multiarm Optimizer — Thompson Sampling 驱动的邮件序列多臂老虎机优化"
description: "触发词：多臂老虎机、Thompson Sampling、邮件 A/B、文案优选、探索与利用、序列优化。何时不用：要按用户个体学习最优序列用邮件序列 RL 那种做法；本卡解决多版本文案在线择优、替代慢速人工 A/B。安全边界：折扣须标注有效期与限制条件，不得使用最优惠等绝对化用语；发送频率须符合 CAN-SPAM 并提供退订。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达 / 复购实验"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Email-Sequence-Multiarm-Optimizer"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "让系统边发边学，几周内自动把流量倾斜到最优邮件文案，不用等人工 A/B 跑完。"
user_try: "试试：这是我这 5 个邮件版本的发送与点击记录，帮我用 Thompson Sampling 决定下一轮该把流量分给谁。"
whenToUse: "与「邮件序列 RL 优化」相比：要按用户状态学个性化序列用那张 RL 卡；只把固定几个文案版本在线择优时用本卡更轻。"
workflow: "整理各版本历史发送、点击与购买记录 → 为每个版本建立 Beta 后验（点击与未点击） → 按 Thompson Sampling 抽样分配下一轮流量比例 → 保留 10–15% 探索流量并监控最优版本收敛"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Email Sequence Multiarm Optimizer — Thompson Sampling 驱动的邮件序列多臂老虎机优化

## ① 解决的问题

邮件运营面临"多版本邮件文案靠感觉选一个A/B测试太慢"——Thompson Sampling将最优邮件文案发现速度提升3倍，开启率年化提升$2.2万GMV

## ② 核心算法逻辑

问题：复购邮件通常有 35 个版本（不同主题行、不同促销力度、不同产品推荐逻辑），传统 A/B 测试需要等 24 周才能收敛，期间大量流量浪费在次优版本上。更麻烦的是，「最优版本」会随节假日、季节、用户生命周期阶段而变化，一次性测试结果很快过时。

## ③ 业务应用场景

- 业务问题：5 个复购邮件模板（无折扣提醒、5% 折扣、10% 折扣、新口味推荐、「宝宝长大了」情感文案），每月发 3 轮，人工 A/B 测试需要 6 周才能选出最优，但黑五等节点前后偏好完全变化 - 数据要求：历史邮件发送记录（版本ID、发送时间、是否点击、是否购买）；实时发送时每次返回点击结果（72小时内） - 预期产出：系统自动在 2-3 周内将 80%+ 流量倾斜到最优版本，同时保留 10-15% 探索流量测试新版本 - 业务价值：相比固定版本，Thompson Sampling 4 周内使综合开启率从 18% 提升至 23%（+28%），点击率从 3.2% 升至 4.1%（+28%
三轨验证： - 成本：数据采集需接入 Klaviyo/SendGrid webhook（开发 2-3 人天）；计算资源极低（单机 Python 脚本即可）；人力成本主要在初始版本设计与监控（每月约 4 小时）。 - 合规：需确保邮件发送频率符合 CAN-SPAM 法案（每日不超过 1 封营销邮件）；折扣版本需标注有效期与限制条件，避免虚假促销指控；不涉及 GDPR 敏感数据处理（仅使用点击/购买行为）。 - 风险：若折扣版本长期占优，可能培养用户「等折扣」习惯，降低正价购买意愿；需设置最低折扣阈值（如不低于 5%）防止利润侵蚀；平台审查风险低，但需避免在邮件中使用「最优惠」「唯一」等绝对化用语
- 业务问题：弃购用户发送 3 条 SMS 挽回序列（1h后、24h后、72h后），每条有 4 个版本（紧迫感文案、价值强调、问询式、折扣），最优组合有 4³=64 种可能性，人工无法全测 - 数据要求：弃购事件触发时间、各 SMS 版本的发送记录及回复/购买记录 - 预期产出：自动为每个时间节点独立优化最优 SMS 版本，累计 3 条序列的最优组合收敛 - 业务价值：弃购挽回率从基线 8% 提升至 11-13%，月弃购 1,200 单场景下，月额外回收 $8,580-$13,200

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月邮件列表 6,000 用户，Thompson Sampling 使 CTR 从 3.2% 提升至 4.1%（+28%），以 12% 转化率 × $55 客单价计算，月增收 $3,564；4 周内完成传统需 8-12 周的 A/B 测试，节省测试周期成本 $2,000/轮（人工+延误损失）；年化总价值约 $65,000
实施难度：⭐☆☆☆☆（纯统计算法，100 行 Python 即可实现，接入 Klaviyo webhook 是主要工程量）
优先级：⭐⭐⭐⭐☆（每个做邮件营销的 DTC 品牌都应有的基础能力，替换人工 A/B 轮换的最简单方案）
评估依据：Thompson Sampling 已被 LinkedIn、GitHub、Yelp 等验证可降低 A/B 测试遗憾（regret）50-70%；母婴 DTC 品牌邮件列表通常 3,000-20,000，规模下效果最显著

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（218 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/email_sequence_multiarm_optimizer` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-Email-Sequence-Multiarm-Optimizer.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
Thompson Sampling 驱动的邮件/SMS 序列多臂老虎机优化器
依赖: numpy, pandas（标准库，无需 API key）
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import json


@dataclass
class EmailVariant:
    """邮件/SMS 版本"""
    variant_id: str
    name: str
    subject_line: str
    discount_pct: float
    content_type: str  # reminder / discount / emotional / recommendation
    
    # Beta 分布参数（会随观测更新）
    alpha: float = 1.0  # 点击数 + 1（先验）
    beta: float = 1.0   # 未点击数 + 1（先验）
    
    @property
    def mean_ctr(self) -> float:
        return self.alpha / (self.alpha + self.beta)
    
    @property  
    def uncertainty(self) -> float:
        """分布方差，越小说明越确定"""
        a, b = self.alpha, self.beta
        return (a * b) / ((a + b) ** 2 * (a + b + 1))
    
    @property
    def n_observations(self) -> int:
        return int(self.alpha + self.beta - 2)  # 减去先验
    
    def sample_theta(self, rng: np.random.Generator) -> float:
        """从 Beta 分布采样一个 CTR 估计值"""
        return rng.beta(self.alpha, self.beta)
    
    def update(self, clicked: bool):
        """贝叶斯更新"""
        if clicked:
            self.alpha += 1
        else:
            self.beta += 1


class ThompsonSamplingEmailOptimizer:
    """Thompson Sampling 邮件序列优化器"""
    
    def __init__(
        self, 
        variants: List[EmailVariant],
        decay_factor: float = 0.98,  # 历史权重衰减（适应非平稳环境）
        seed: int = 42
    ):
        self.variants = {v.variant_id: v for v in variants}
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2311.08407，但该号在 arXiv 上是《Hom-associative algebras, Admissibility and Relative averaging operators》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：历史邮件或 SMS 发送记录（版本 ID、发送时间、是否点击、是否购买、72 小时内响应）与实时回传的点击结果；卡页为 5 个复购模板、每月 3 轮。

**输出**：各版本的后验点击率与推荐流量分配比例、最优版本结论与探索比例设置（卡页 2–3 周内 80% 以上流量倾斜到最优版本），供邮件运营接入发送平台。

## 执行步骤

1. 汇总各版本的发送、点击与购买记录。
2. 初始化每个版本的 Beta 先验并随观测更新后验。
3. 每轮按 Thompson Sampling 抽样决定流量分配。
4. 保留固定比例探索流量以发现新版本。
5. 监控收敛与收益，处理折扣版本长期占优的利润风险。

## 边界与不做

- 何时不用：每轮样本量过小、响应回传延迟或版本差异未被记录时不要用；只有一两个版本时可继续用人工 A/B。
- 能力边界：产出分配策略与结论，不代发邮件；开启率 18%→23%、年化约 $65,000 为卡页案例值。
- 安全边界：折扣须标注有效期与限制，禁用绝对化用语，发送频率与退订须合规。

## 技能关联

- **前置**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-RFM-to-Action-Policy-Engine.html、Skill-RFM-to-Action-Policy-Engine、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model
- **延伸**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-DiD-Difference-in-Differences.html、Skill-DiD-Difference-in-Differences、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation
- **可组合**：Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Email-Sequence-Multiarm-Optimizer

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Email-Sequence-Multiarm-Optimizer`