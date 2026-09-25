---
name: "p2s-rfm-to-action-policy-engine"
title: "RFM to Action Policy Engine — RFM 分层驱动的自动化触达策略决策引擎"
description: "触发词：分群触达策略、自动化发券、策略引擎决策、生命周期动作、每日触达计划。何时不用：只做 RFM 分群本身用 RFM 分群技能，估计优惠券的分群因果效应用 DML 类技能，本技能在分群之上决定发什么、发给谁、发几次。安全边界：触达频次须遵守平台政策与退订要求，不得对沉睡用户无限加大折扣力度，须提供一键退订。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-101"
l3_business: "分群"
l3_all: "分群 / 生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/分群"
p2s_card_id: "Skill-RFM-to-Action-Policy-Engine"
p2s_src_domain: "06-增长模型"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "分群之后自动决定每类用户发什么、发几次，把运营的手工决策交给策略引擎。"
user_try: "试试：基于我们的 RFM 分层和历史触达记录生成每日触达计划，说明各群体该发什么内容。"
whenToUse: "已有 RFM 分层、但分群到具体动作还靠人工拍脑袋时用本技能；只做分群本身用 RFM 分群技能，要估计券对不同人群的因果效应用 DML 类技能。"
workflow: "接入订单与历史触达记录 → 计算 RFM 分层与策略状态 → 按 ε-greedy 选择各群体动作 → 生成每日触达计划 → 按 CTR 与转化回写策略"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# RFM to Action Policy Engine — RFM 分层驱动的自动化触达策略决策引擎

## ① 解决的问题

运营主管面临"RFM分群做了但不知道对每群用户该做什么动作"——ε-greedy策略引擎将分群到自动化触达从2天手工决策压缩至实时触发，复购率提升18%

## ② 核心算法逻辑

问题：RFM 分析做了很多，但「数据分析」和「运营动作」之间永远有一条鸿沟——分析师给出分层报告，运营拿着 Excel 手动决定发什么券、推什么品、发几次。这个决策过程本身就是可以自动化的。

## ③ 业务应用场景

- 业务问题：运营团队每周花 6 小时人工决定哪些用户发券、发什么内容，但人工经验往往基于整体而非分群差异——Champion 用户不需要折扣，反而只需提醒；Lost 用户发普通提醒完全无效 - 数据要求：用户购买记录（近 180 天）、RFM 计算结果、历史触达记录（发送时间、内容、CTR、是否转化） - 预期产出：每日自动生成各 RFM 群体的触达计划（发送数量、内容模板、渠道选择），ε-greedy 持续优化各群体的最优策略 - 业务价值：相比纯规则驱动，ε-greedy 在 4 周内使 At-Risk 群体的复购 CTR 从 5.2% 提升至 8.7%，Champion 群体减少 30
三轨验证： - 成本：数据采集需接入订单 API（Klaviyo/Shopify 月费 $150-300）；计算资源 1 台云服务器（$50/月）；人力成本为 1 名数据工程师 2 周开发（$2,000 一次性） - 合规：Amazon 政策禁止对已流失用户频繁发送促销邮件（超过 3 次/周可能触发封号）；GDPR 要求用户可一键退订触达；需在邮件底部添加 unsubscribe 链接 - 风险：Champion 用户收到过多提醒可能产生疲劳导致退订；Lost 用户折扣力度过大可能养成「等折扣再买」的习惯；若 ε 值过高（>0.3）可能导致短期 CTR 下降
- 业务问题：纸尿裤有明显的「阶段性用户生命周期」（NB→S→M→L），不同尺码阶段的用户需求完全不同，统一的营销内容导致尺码不匹配的推荐 - 数据要求：用户购买尺码历史、婴儿月龄（推算）、RFM 分层、各阶段历史转化率 - 预期产出：按「当前尺码阶段 × RFM 分层」的二维矩阵决策，自动选最优内容 - 业务价值：尺码适配推荐使点击率+22%，每月少 150 单因推荐错误导致的退货，节省退货成本 $1,200/月

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：月活 8,000 用户场景，ε-greedy 经 12 轮优化后 CTR 相对提升 15-25%，以客单价 $55 计算，月增收 $13,200-22,000；节省运营人工每周 6 小时 × 52 周 = $7,800/年（按 $25/h）；总年化 ROI 约 $165,000-271,000
实施难度：⭐⭐☆☆☆（核心逻辑纯 Python，接入 Klaviyo/Mailchimp API 为主要工程量）
优先级：⭐⭐⭐⭐⭐（打通「数据分析→运营执行」闭环，是私域运营自动化的核心基础设施）
评估依据：ε-greedy 是 Starbucks、Netflix 等成熟电商的标配决策层，实现成本极低，但收益与用户量正相关——月活 < 500 时效果有限

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（252 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/growth_model/rfm_to_action_policy_engine` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/06-增长模型/Skill-RFM-to-Action-Policy-Engine.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
RFM 分层驱动的自动化触达策略决策引擎（ε-greedy 版本）
依赖: numpy, pandas（标准库，无需 API key）
"""
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional
from collections import defaultdict


# ============================================================
# 数据结构定义
# ============================================================
@dataclass
class Action:
    """触达动作定义"""
    action_id: str
    name: str
    channel: str      # email / sms / push
    discount_pct: float  # 折扣力度（0=无折扣）
    content_type: str    # reminder / coupon / recommendation / winback


@dataclass 
class PolicyState:
    """策略状态（Q-table）"""
    q_values: Dict[str, Dict[str, float]] = field(default_factory=dict)
    counts: Dict[str, Dict[str, int]] = field(default_factory=dict)
    
    def get_q(self, segment: str, action_id: str) -> float:
        return self.q_values.get(segment, {}).get(action_id, 0.0)
    
    def update(self, segment: str, action_id: str, reward: float):
        if segment not in self.q_values:
            self.q_values[segment] = {}
            self.counts[segment] = {}
        n = self.counts[segment].get(action_id, 0) + 1
        old_q = self.q_values[segment].get(action_id, 0.0)
        self.q_values[segment][action_id] = old_q + (reward - old_q) / n
        self.counts[segment][action_id] = n


# ============================================================
# RFM 分层
# ============================================================
def compute_rfm(df: pd.DataFrame, reference_date: pd.Timestamp) -> pd.DataFrame:
    """
    计算 RFM 分层
    
    Args:
        df: 包含 user_id, order_date, order_value 的购买记录
        reference_date: 参考日期
    
    Returns:
        含 rfm_segment 列的用户 DataFrame
    """
    rfm = df.groupby('user_id').agg(
        recency=('order_date', lambda x: (reference_date - x.max()).days),
        frequency=('order_date', 'count'),
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2401.05312，但该号在 arXiv 上是《Hemodynamical Behavior Analysis of Anemic, Diabetic, and Healthy Blood Flow in the Carotid Artery》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：近 180 天用户购买记录、RFM 计算结果、历史触达记录（发送时间、内容、CTR、是否转化）；纸尿裤等阶段品类另需购买尺码历史与婴儿月龄推算结果。

**输出**：每日各 RFM 群体的触达计划（发送数量、内容模板、渠道选择、折扣力度）与策略引擎持续优化后的动作表；卡页口径 At-Risk 群体复购 CTR 从 5.2% 提升到 8.7%，运营每周 6 小时的人工决策被压缩。

## 执行步骤

1. 接入近 180 天购买记录与历史触达记录。
2. 计算 RFM 分层并维护各群体的策略状态。
3. 按 ε-greedy 为每个群体选择动作，如提醒、发券、推荐或召回。
4. 生成每日触达计划，含发送数量、内容模板与渠道。
5. 按 CTR 与转化回写奖励，持续更新各群体的最优策略。

## 边界与不做

- 月活过低（卡页口径月活低于 500 时效果有限）或缺少历史触达记录时不要用，策略没有可学习的数据。
- 能力边界：本技能产出触达计划与策略，不执行发送、不保证 CTR 提升；ε 值过高（卡页口径超过 0.3）会短期拉低 CTR，且对沉睡用户加大折扣可能养成等折扣的习惯。
- 合规红线：触达频次须遵守平台政策（过度频繁的促销邮件可能触发封号），须提供一键退订链接。

## 技能关联

- **前置**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-RFM-Customer-Segmentation.html、Skill-RFM-Customer-Segmentation、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **延伸**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-Email-Sequence-Multiarm-Optimizer.html、Skill-Email-Sequence-Multiarm-Optimizer、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction
- **可组合**：Skill-Ad-Attribution-Modeling.html、Skill-Ad-Attribution-Modeling、Skill-LTV-Prediction-BTYD.html、Skill-LTV-Prediction-BTYD、Skill-Repurchase-Trigger-Timing-Model.html、Skill-Repurchase-Trigger-Timing-Model、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-RFM-to-Action-Policy-Engine

---

> 分类：业务运营/品牌与增长/分群　·　技术族：06-增长模型　·　源卡：`Skill-RFM-to-Action-Policy-Engine`