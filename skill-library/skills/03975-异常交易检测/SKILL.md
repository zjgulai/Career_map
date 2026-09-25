---
name: "p2s-transaction-anomaly-detection"
title: "Transaction Anomaly Detection（异常交易检测）"
description: "触发词：异常交易、盗刷、机刷下单、实时拦截、订单冻结。何时不用：账号间共享地址与设备的退货团伙走「退货欺诈识别」；促销券批量套利走「促销欺诈检测」。安全边界：本技能只产出异常评分与冻结建议，实际 hold 订单、冻结资金须由确定性风控执行层按规则执行，模型不得直接操作。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 异常冻结与恢复"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-Transaction-Anomaly-Detection"
p2s_src_domain: "19-风控反欺诈"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "同一 IP 短时间多张卡、多个地址下单这类盗刷信号出现时，毫秒级打分并建议先冻结订单再人工核实。"
user_try: "试试：帮我看下最近的订单，有没有同一 IP 短时间多卡多地址下单的盗刷可疑单？"
whenToUse: "当风险信号集中在单笔交易的支付与下单行为（同 IP、多卡、多地址、下单间隔异常）时用；若要找账号之间的关联团伙，用「退货欺诈识别」或「促销欺诈检测」。"
workflow: "采集订单与支付的实时特征（IP、卡、地址、下单间隔） → 用滚动窗口基线计算 z-score 异常分 → 超阈值触发高风险预警 → 生成冻结建议并派发人工审核工单 → 人工核实后记录放行或拦截结论"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Transaction Anomaly Detection（异常交易检测）

## ① 解决的问题

同一 IP 在 10 分钟内下 5 单跨州发货使用 5 张信用卡，人工审核滞后导致盗刷损失 $5000——Isolation Forest 实时异常交易检测在毫秒内触发 hold 订单，年化止损 3-8 万元

## ② 核心算法逻辑

论文：Isolation Forest: IsolationBased Anomaly Detection | arXiv：1712.02763

## ③ 业务应用场景

品类：婴儿暖奶器（SKU：WARM-2000，库存 2000 件，日销 50 件，客单价 $89，转化率 4.5%，ROAS 3.2）
事件：同一 IP（印尼）在 8 分钟内连续下单 6 单婴儿暖奶器，收货地址分别为美国加州、德州、纽约州、佛罗里达州、伊利诺伊州、俄亥俄州，使用 6 张不同信用卡（发卡行均为印尼本地银行）。下单到支付间隔平均 12 秒（正常用户平均 90 秒），地址变更次数为 0（正常用户平均 1.2 次）。
检测：z-score 计算得 5.2（阈值 3.5），触发高风险预警，自动 hold 订单并发送人工审核工单。经核实，6 张信用卡均为盗刷，拦截总金额 $534（6 × $89）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：45 万元 | 难度：⭐⭐☆☆☆ | 优先级：⭐⭐⭐☆☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（17 行）。**下面 17 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **17 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，17 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/risk_fraud/transaction_anomaly_detection` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/19-风控反欺诈/Skill-Transaction-Anomaly-Detection.md`），已与卡面节选核对，不依赖上述路径。

```python
import numpy as np
from sklearn.ensemble import IsolationForest

def transaction_anomaly_score(features, window_history):
    """z-score anomaly detection with rolling baseline"""
    mu, sigma = window_history.mean(axis=0), window_history.std(axis=0) + 1e-6
    z_scores = np.abs((features - mu) / sigma)
    max_z = z_scores.max(axis=1)
    return {'z_scores': max_z, 'high_risk': max_z > 3.5}

# test
hist = np.random.randn(500, 6) * 0.5
curr = np.array([[3.0, 4.2, -2.8, 3.5, 0.1, 4.5]])  # anomalous
r = transaction_anomaly_score(curr, hist)
print(f"z-score: {r['z_scores'][0]:.1f}, high_risk: {r['high_risk'][0]}")
assert r['high_risk'][0]
print("[✓] Transaction Anomaly 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1712.02763，但该号在 arXiv 上是《Single top production at linear $e^-e^+$ colliders》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Isolation Forest: IsolationBased Anomaly Detection》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：需订单流水与支付特征（IP、收货地址、卡标识、下单与支付时间戳）以及历史窗口的正常行为基线，订单级、实时粒度。

**输出**：产出每笔订单的异常分（z-score 与阈值比较）、高风险预警与冻结建议、人工审核工单，供风控人员核实与放行决策。

## 执行步骤

1. 采集订单与支付的实时特征，按 IP 与账号对齐
2. 计算滚动窗口的基线均值与标准差
3. 计算 z-score 异常分并与阈值比较
4. 触发高风险预警并生成冻结建议与人工审核工单
5. 记录人工核实结论并回写样本

## 边界与不做

- 大促期间的集中下单会抬高基线，窗口未覆盖促销峰值时误报明显上升
- 只做异常打分与冻结建议，冻结、退款、封禁等动作由模型外的确定性控制层执行
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Feature-Engineering.html、Skill-Feature-Engineering、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **可组合**：Skill-Click-Fraud-Detection.html、Skill-Click-Fraud-Detection、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection、Skill-Transaction-Anomaly-Detection

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：19-风控反欺诈　·　源卡：`Skill-Transaction-Anomaly-Detection`