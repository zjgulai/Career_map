---
name: "p2s-offlinerl"
title: "Skill-OfflineRL-触达时机优化"
description: "触发词：p2s-offlinerl。Skill: 离线RL触达时机优化 - 不打扰的最优干预"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-102"
l3_business: "生命周期触达"
l3_all: "生命周期触达"
l1_l2_l3: "业务运营/品牌与增长/生命周期触达"
quality_tier: "curated"
p2s_card_id: "Skill-OfflineRL-触达时机优化"
p2s_src_domain: "07-NLP-VOC"
p2s_venue_tier: "preprint"
p2s_paper_id: "2202.03867"
rebase_version: "s5-b11-v1"
rebase_vault_card: "Skill-OfflineRL-触达时机优化"
rebase_vault_path: "paper2skills-vault/07-NLP-VOC/00-知识库-Skill卡片/Skill-OfflineRL-触达时机优化.md"
rebase_source_sha256: "d3f3ec88623fa9dab5705abffbd3f5494b61c1421fca3611c717708841603437"
rebase_full_card: "references/full-card.md"
rebase_full_card_sha256: "d3f3ec88623fa9dab5705abffbd3f5494b61c1421fca3611c717708841603437"
rebase_full_card_bytes: "8490"
rebase_full_card_lines: "200"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
rebase_evidence_quotes: "17"
rebase_evidence_quotes_total: "17"
rebase_evidence_quotes_complete: "true"
---
# Skill-OfflineRL-触达时机优化

> **底本**：本卡正文换底自语料 vault 的精选线卡 `Skill-OfflineRL-触达时机优化`（完整卡：`references/full-card.md`，sha256 `d3f3ec88623fa9dab5705abffbd3f5494b61c1421fca3611c717708841603437`，8490 字节 / 200 行 / 17 条逐字引文）。
> 完整卡的**全部**内容都在那份文件里。本页内联：完整卡正文的开头逐行摘录，以及全部逐字引文。

## 换底正文（完整卡逐字摘录）


# Skill: 离线RL触达时机优化 - 不打扰的最优干预

## 基础信息

- **arXiv ID**: 2202.03867
- **论文标题**: Offline Reinforcement Learning for Mobile Notifications
- **发表会议**: CIKM 2022 (LinkedIn)
- **核心方法**: 离线RL (CQL) + 状态边缘化重要性采样

---

## 1. 算法原理

### 1.1 问题背景

推送通知的困境：
- 发太少 → 用户遗忘，转化率低
- 发太多 → 打扰用户，导致关闭推送甚至卸载
- **时机不对** → 睡眠中的妈妈被吵醒，品牌好感度暴跌

传统方法缺陷：
- 响应预测模型只预测"是否点击"，不优化长期用户体验
- 无法处理序列决策（多次推送的累积效应）

### 1.2 离线RL框架


### 1.3 CQL (Conservative Q-Learning)

核心挑战：离线RL没有在线探索，容易高估未见过动作的价值。

**CQL解决方案**：

**反直觉洞察**：
1. **序列效应 > 单次决策**：优化推送序列比优化单条推送提升18%
2. **睡眠窗口期**：新妈妈凌晨2-5点绝对静默，即使"高价值"推送也要抑制
3. **疲劳衰减**：同一用户3天内第3条推送的边际效应趋近于0

---

## 2. 业务应用

### 2.1 Momcozy场景：新妈妈推送时机优化


### 2.2 不同人群的推送窗口

| 人群类型 | 最佳窗口 | 禁忌时段 | 周频次上限 |
|---------|---------|---------|-----------|
| **职场背奶妈妈** | 12:00-13:00, 18:00-19:00 | 09:00-11:30 (会议) | 3次 |
| **全职新手妈妈** | 10:00-11:00, 14:00-15:00 | 02:00-06:00 (夜奶) | 5次 |
| **出差旅行妈妈** | 灵活，基于地理位置 | 航班起飞/降落时段 | 2次 |

### 2.3 与GPLR的联动


---

## 3. 业务价值

| 收益来源 | 提升幅度 | 预估收益 |
|---------|---------|---------|
| 点击率提升 | +15-20% | 50万/年 |
| 负面反馈减少 | -30% | 减少流失 40万/年 |
| 用户满意度提升 | NPS +8分 | 品牌价值提升 |
| **总计** | - | **90万+/年** |

---

## 4. 技能关联

| 前置技能 | 关系 | 说明 |
|---------|------|------|
| **GPLR人群标签** | 输入 | 人群标签作为状态特征 |
| **TSCAN挽回策略** | 配合 | 确定策略后选择时机 |

| 后置技能 | 关系 | 说明 |
|---------|------|------|
| **个性化文案生成** | 配合 | 时机 + 内容联合优化 |

---

**难度**: ⭐⭐⭐⭐⭐ (5/5) - 需要RL基础设施  
**优先级**: P5 - 营销优化方向进阶技能

---

## ⑥ 原文引用

（**换底正文在此截断** —— 完整卡正文共 200 行，本页内联到第 148 行；其余见 `references/full-card.md`。
  代码围栏已整块移入 `references/implementation.py`，引文整段见下节。）

## 原文引用（逐字 · 全 17 条 · 不截断）

> 原文:"We propose an offline reinforcement learning framework to optimize sequential notification decisions for driving user engagement."
> 出处：2202.03867 §Abstract

> 原文:"We describe a state-marginalized importance sampling policy evaluation approach, which can be used to evaluate the policy offline and tune learning hyperparameters."
> 出处：2202.03867 §Abstract

> 原文:"we collect data through online exploration in the production system, train an offline Double Deep Q-Network and launch a successful policy online."
> 出处：2202.03867 §Abstract

> 原文:"a user’s experience depends on a sequence of notifications and attributing impact to a single notification is not always accurate, if not impossible."
> 出处：2202.03867 §Abstract

> 原文:"Most machine learning applications in notification systems are built around response-prediction models, trying to attribute both short-term impact and long-term impact to a notification decision."
> 出处：2202.03867 §Abstract

> 原文:"Although intrusive and frequent notifications can bring users back to site, they could create notification fatigue or cause notification disablement, which hurts user engagement in the long run"
> 出处：2202.03867 §I Introduction

> 原文:"We propose a state-marginalized importance sampling algorithm for offline evaluation to reduce the high variance of the existing importance sampling based algorithms."
> 出处：2202.03867 §I Introduction（贡献之一）

> 原文:"In this paper, we focus our discussions on applying reinforcement learning to such time-insensitive notifications to determine the best delivery times towards long-term engagement."
> 出处：2202.03867 §III Notification delivery time optimization

> 原文:"We consider a discrete action space consisting of two actions - SEND (send the notification candidate to the user) and NOT-SEND (the notification candidate is put back in the notification queue for further considerations)."
> 出处：2202.03867 §III-B Markov Decision Process for Notification Spacing

> 原文:"In this paper, we use a user visit to the platform within the next time step as a reward."
> 出处：2202.03867 §III-B Markov Decision Process for Notification Spacing

> 原文:"The reward can also be defined as notification clicks, or notification disables as negative rewards or a linear combination of them."
> 出处：2202.03867 §III-B Markov Decision Process for Notification Spacing

> 原文:"Our proposed offline solution is a combination of Offline Deep Q-Network (DQN) and data collection with well-controlled online exploration."
> 出处：2202.03867 §IV-A Offline Training

> 原文:"We then train the Double DQN models described in Section IV-A using a fully-connected 3-layer neural network with different hyper-parameters"
> 出处：2202.03867 §V-B Online Experiments in Notification Spacing

> 原文:"Compared with the baseline policy, the new policy from offline reinforcement learning increased the total sessions by $0.3\%$, which is considered a moderate gain in a volume neutral iteration, but very impressive given that the total notification volume is reduced by $3.49\%$."
> 出处：2202.03867 §V-B Online Experiments in Notification Spacing（表 I 线上 A/B 结果）

> 原文:"The $4.53\%$ increase in notification CTR and $4.37\%$ decrease in notification unfollow total are mainly driven by the reduction in notification volume."
> 出处：2202.03867 §V-B Online Experiments in Notification Spacing（表 I 线上 A/B 结果）

> 原文:"The tuning typically takes 1-3 weeks for notifications as site engagement responses takes days to show up."
> 出处：2202.03867 §V-B Online Experiments in Notification Spacing

> 原文:"One of the limitations of our presented results is that we trained and tested this framework in a one-week frame."
> 出处：2202.03867 §VI Discussion（论文自承局限）

## ⑦ 代码节选

（**本卡未附代码伴生文件** —— 产品侧完整实现索引里没有本卡；代码原文见 `references/full-card.md` 的「代码模板」段。）

## ⑧ 论文来源

**本卡溯源换底自精选线** `Skill-OfflineRL-触达时机优化`（完整卡：`references/full-card.md`）。

- 论文：2202.03867
- venue 档位：preprint
- 证据基础：paper-verbatim

- 逐字引文：17 条，全部内联于上方「原文引用」段；一条不截断。
