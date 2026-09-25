---
name: "p2s-push-notification-decision-transformer"
title: "推送通知优化 — Decision Transformer多目标时机预测"
description: "触发词：推送时机、Decision Transformer、月龄内容、疲劳控制、取关率、触达节奏。何时不用：只需按固定规则定时推送时不必上模型；要在多目标（转化、疲劳、取关）之间权衡推送时机与内容时用本卡。安全边界：推送须获授权并提供关闭入口，须设频率上限；不得基于儿童健康或敏感信息定向，禁止夜间打扰。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
p2s_card_id: "Skill-Push-Notification-Decision-Transformer"
p2s_src_domain: "06-增长模型"
quality_tier: "preview"
user_summary: "按宝宝月龄和用户活跃习惯挑推送时机，避免无关内容把用户逼到取关。"
user_try: "试试：这是我的推送历史（打开、忽略、取关）和宝宝月龄，帮我用 Decision Transformer 找出每个用户的最佳推送时机。"
whenToUse: "与「购买意向预测」相比：判断谁高意向用那张卡；决定什么时候推、推什么内容并控制疲劳时用本卡。"
workflow: "构造状态（时段、星期、月龄、近 7 天推送次数与打开率） → 定义动作（不发、立即发、延迟 2 小时、延迟 6 小时）与含疲劳惩罚的奖励 → 用历史轨迹训练决策模型 → 按策略推送并监控取关率与 CTR 变化"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 推送通知优化 — Decision Transformer多目标时机预测

## ① 解决的问题

运营面临推送打开率持续下滑——Transformer决策引擎将推送CTR从2.1%提升至5.8%，年化增收42万元

## ② 核心算法逻辑

论文：Decision Transformer: Reinforcement Learning via Sequence Modeling | 年份：2021

## ③ 业务应用场景

某婴儿食品跨境品牌用DT结合月龄数据优化推送策略： - 痛点：统一推送"辅食添加指南"给所有用户，6个月以下用户无关，导致取关率8.3% - 数据要求：用户注册时填写宝宝生日 + 历史推送打开/忽略/取消订阅记录 - DT策略：月龄4~6个月期间，在用户历史活跃时段±1小时内推送"辅食启蒙"内容；月龄7~12个月切换为"手指食物推荐"，同步附加商品卡 - 量化产出：取关率从8.3%→4.1%，推送CTR +23%，相关SKU转化率 +18%
场景B：大促前推送节奏优化（避免用户疲劳）
- 痛点：Prime Day前14天密集推送，第7天起打开率跌40%，反向压制大促转化 - DT策略：学习"高频推送→疲劳"的历史轨迹，自动退让——对已打开≥2次的用户缩减频率，对沉默用户在大促前2天发送高价值锚定内容 - 量化产出：大促期间推送打开率 +15%，GMV贡献 +9%

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：0.72%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（216 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import List, Tuple

# ============================================================
# Decision Transformer 推送通知时机优化（简化演示）
# ============================================================

np.random.seed(42)

# ------ 数据结构定义 ------
# state: [小时(0-23), 星期(0-6), 月龄(月), 近7天推送次数, 近7天打开率]
# action: 0=不发, 1=立即发, 2=延迟2h, 3=延迟6h
# reward: sessions增量 - 0.3*fatigue_penalty - 0.5*unsubscribe_signal

STATE_DIM = 5
ACTION_DIM = 4
CONTEXT_LEN = 10  # 历史序列长度

def simulate_user_trajectory(n_steps: int = 50) -> List[Tuple]:
    """模拟一个用户的推送历史轨迹"""
    trajectory = []
    hour = np.random.randint(0, 24)
    weekday = np.random.randint(0, 7)
    baby_age_months = np.random.randint(1, 24)
    push_count_7d = 0
    open_rate_7d = np.random.uniform(0.1, 0.5)

    for step in range(n_steps):
        state = np.array([
            hour / 23.0,
            weekday / 6.0,
            baby_age_months / 24.0,
            min(push_count_7d, 20) / 20.0,
            open_rate_7d
        ], dtype=np.float32)

        # 模拟规则引擎动作（作为离线数据来源）
        if 8 <= hour <= 22 and push_count_7d < 5:
            action = np.random.choice([1, 2, 3], p=[0.5, 0.3, 0.2])
        else:
            action = 0

        # 模拟reward（多目标加权）
        if action == 0:
            reward = 0.0
        else:
            # 活跃时段奖励
            time_bonus = 0.3 if 9 <= hour <= 21 else -0.1
            # 疲劳惩罚
            fatigue_penalty = max(0, push_count_7d - 3) * 0.15
            # 月龄相关性奖励（4-12个月用户对育儿内容更敏感）
            age_bonus = 0.2 if 4 <= baby_age_months <= 12 else 0.0
            reward = time_bonus + age_bonus - fatigue_penalty + np.random.normal(0, 0.05)

        # Return-to-go（倒推累计奖励，DT训练核心）
        rtg = reward * (n_steps - step) / n_steps  # 简化版RTG

        trajectory.append((state, action, reward, rtg))

        # 更新状态
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2106.01345 — Decision Transformer: Reinforcement Learning via Sequence Modeling

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：用户注册时填写的宝宝生日（月龄）、历史推送打开、忽略与取消订阅记录，以及推送时段与频次数据；卡页用于月龄分段的辅食场景。

**输出**：每位用户的最佳推送时机与内容类型建议、疲劳控制策略（如对已打开 2 次以上用户降频），以及取关率与 CTR 评估（卡页取关率 8.3%→4.1%、CTR +23%），供推送运营配置。

## 执行步骤

1. 构造包含时段、月龄、近期推送频次与打开率的状态特征。
2. 定义动作空间与含疲劳、取关惩罚的奖励函数。
3. 用历史推送轨迹训练决策模型。
4. 执行模型策略推送并设置频率与时段护栏。
5. 监控取关率、CTR 与大促期间的打开率变化。

## 边界与不做

- 何时不用：没有月龄或推送响应历史、且对所有人群只推同一内容时不要用；固定节奏的常规推送不必上模型。
- 能力边界：产出时机与内容建议，不代发推送；CTR 2.1%→5.8%、年化增收 42 万为卡页案例值。
- 安全边界：须有推送授权与关闭入口、设频率上限，禁止夜间打扰与敏感信息定向。

## 技能关联

- **前置**：Skill-Reinforcement-Learning-Bidding、Skill-User-Engagement-Prediction
- **延伸**：Skill-Cross-Sell-LLM-GNN.html、Skill-Cross-Sell-LLM-GNN
- **可组合**：Skill-Baby-Age-Aware-Recommendation.html、Skill-Baby-Age-Aware-Recommendation、Skill-Infant-Lifecycle-Purchase-Rhythm.html、Skill-Infant-Lifecycle-Purchase-Rhythm、Skill-Push-Notification-Decision-Transformer

---

> 分类：业务运营/品牌与增长/生命周期触达　·　技术族：06-增长模型　·　源卡：`Skill-Push-Notification-Decision-Transformer`