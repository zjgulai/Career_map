---
name: "p2s-identity-fraud-detection"
title: "Identity Fraud Detection — 多维账号欺诈检测：设备+行为+网络三重验证"
description: "触发词：身份欺诈、设备指纹、行为异常、IP 社区、多账号关联。何时不用：只有单一维度信号时容易误伤，不足以支撑判定；本技能要求设备、行为、网络三维交叉。安全边界：不得以单一维度作为封号依据，需多因子确认并保留申诉通道；设备与行为数据采集须合规。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 体验分析"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Identity-Fraud-Detection"
p2s_src_domain: "19-风控反欺诈"
quality_tier: "preview"
user_summary: "同一批五星评论，看设备指纹像不像、下单到评论的间隔正不正常、IP 是否成社区，三维交叉给欺诈概率。"
user_try: "试试：这批五星评论的账号，从设备、行为、网络三个维度看是不是一批刷单号。"
whenToUse: "需要判断一组账号是否为刷单身份、且手上有设备、行为、IP 多维数据时用本技能；只需评论内容维度判断用刷评检测类技能。"
workflow: "聚合账号的设备指纹并做相似度聚类 → 统计下单到评论的时间间隔并算异常度 → 分析共享 IP 段形成的社区密度 → 加权得到综合欺诈概率并分级"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Identity Fraud Detection — 多维账号欺诈检测：设备+行为+网络三重验证

## ① 解决的问题

业务问题：某婴儿推车 Listing 在 48 小时内收到 12 条五星评论，怀疑是刷单行为

## ② 核心算法逻辑

论文：Graph Neural Networks for Fraud Detection in ECommerce | 年份：2019

## ③ 业务应用场景

场景 A：刷单账号识别（新账号 24 小时刷评预警）
- 业务问题：某婴儿推车 Listing 在 48 小时内收到 12 条五星评论，怀疑是刷单行为。如何系统性识别这批账号？ - 三维检测结果： - 设备维度：12 个账号中 9 个设备指纹 Jaccard 相似度 > 0.88，聚类为 2 个设备组 - 行为维度：购买后平均 3.2 小时即发布评论（自然用户中位数 4.7 天），Z-score = 3.8 → 异常 - 网络维度：9 个账号共享同一 IP /24 段，形成一个高密度社区（社区欺诈率 78%） - 综合欺诈概率：0.82 → HIGH RISK，建议屏蔽全部 12 条评论并标记账号
场景 B：Amazon Seller 多账号规避 ToS（账号图关联发现）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（12 行）。**下面 12 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **12 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，12 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：5」并记录位置 `paper2skills-code/risk_fraud/identity_fraud_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Identity-Fraud-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
from paper2skills_code.risk_fraud.identity_fraud_detection import (
    AccountProfile,
    DeviceFingerprintMatcher,
    BehaviorAnomalyDetector,
    AccountGraphAnalyzer,
    IdentityFraudDetector,
    run_demo,
)

if __name__ == "__main__":
    run_demo()
print("[✓] Identity Fraud Detection 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1905.11818，但该号在 arXiv 上是《Viscosity solutions to parabolic complex Monge-Ampère equations》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Graph Neural Networks for Fraud Detection in ECommerce》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：账号档案（设备指纹、注册信息）、行为记录（下单与评论时间戳）、网络数据（登录 IP）；按账号粒度，需能两两比较相似度。

**输出**：三维度指标（设备相似度、行为异常度、社区欺诈率）与综合欺诈概率分级、建议处置（如屏蔽评论并标记账号），供风控与评论运营使用。

## 执行步骤

1. 汇总账号的设备、行为与网络数据
2. 做设备指纹相似度聚类
3. 计算行为时间间隔的异常度
4. 分析 IP 段的社区密度与欺诈率
5. 加权输出综合欺诈概率与处置建议

## 边界与不做

- 只有单一维度信号时不足以判定，容易误伤正常用户。
- 本技能产出欺诈概率与处置建议，不代替平台的最终处罚决定。
- 不得以单一维度作为封号依据，需多因子确认并保留申诉通道。

## 技能关联

- **前置**：Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection
- **可组合**：Skill-Agent-Payment-Security-Red-Team.html、Skill-Agent-Payment-Security-Red-Team、Skill-Crypto-Anomaly-Review-Fraud.html、Skill-Crypto-Anomaly-Review-Fraud、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-MUZZLE-Web-Agent-Red-Teaming.html、Skill-MUZZLE-Web-Agent-Red-Teaming、Skill-Identity-Fraud-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Identity-Fraud-Detection`