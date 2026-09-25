---
name: "p2s-consumer-complaint-recall-prediction"
title: "Consumer Complaint Recall Prediction — 消费者投诉驱动的召回风险预测"
description: "触发词：召回风险、投诉主题聚类、集中度指标、选品合规门控、安全预警。何时不用：要提取单条评论的安全隐患信号用「安全隐患信号提取」；要算来料合格率 KPI 用「供应商来料质量KPI」。安全边界：只作风险提示与选品门控信号，不构成召回结论，对外动作须由合规与法务确认。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-053"
l3_business: "质量分析"
l3_all: "质量分析 / 客诉聚类"
l1_l2_l3: "业务运营/供应与履约/质量分析"
p2s_card_id: "Skill-Consumer-Complaint-Recall-Prediction"
p2s_src_domain: "21-合规决策"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "从历史投诉里看出某款产品正往召回的方向走，选品阶段就能提前避开。"
user_try: "试试：用婴儿推车品类近三年投诉，聚类出风险主题并判断召回风险集中的品类。"
whenToUse: "选品或品类扫描阶段要提前识别召回风险时用；单条评论的安全信号分级用「安全隐患信号提取」。"
workflow: "采集公开投诉数据并按品类归集 → 用主题模型提取投诉主题与权重 → 计算主题集中度并与阈值比较 → 输出高召回风险标记与受影响品类清单"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Consumer Complaint Recall Prediction — 消费者投诉驱动的召回风险预测

## ① 解决的问题

业务问题：在 Amazon 选品婴儿推车时，如何提前识别某款车型即将遭遇 CPSC 强制召回

## ② 核心算法逻辑

论文：Hierarchical Dirichlet Processes for Unsupervised Topic Discovery in Short Texts | 年份：2012

## ③ 业务应用场景

场景 A：婴儿推车安全预警（提前 12 个月识别召回风险）
- 业务问题：在 Amazon 选品婴儿推车时，如何提前识别某款车型即将遭遇 CPSC 强制召回？ - 数据来源：SaferProducts.gov 婴儿推车品类近 3 年投诉，约 800 条记录 - HDPYP 产出： - 主题 1（权重 0.47）：`wheel`, `broken`, `collapse`, `sudden` → 车轮/折叠机构失效主题 - 主题 2（权重 0.31）：`buckle`, `release`, `strap`, `fall` → 安全带扣解锁失效主题 - 主题集中度（Gini=0.72）超过阈值 0.60 → 高召回风险 - 预期效果：提前 12 个月标记
场景 B：WF-D 选品合规门控（品类级投诉集中度扫描）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（14 行）。**下面 14 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **14 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，14 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/compliance/consumer_complaint_recall_prediction` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/21-合规决策/Skill-Consumer-Complaint-Recall-Prediction.md`），已与卡面节选核对，不依赖上述路径。

```python
# 运行方式: python model.py
# 依赖: 纯 Python 标准库 (Python 3.8+)

from paper2skills_code.compliance.complaint_recall_prediction import (
    ComplaintRecord,
    LDATopicExtractor,
    RecallRiskPredictor,
    run_demo,
)

# 快速运行演示
if __name__ == "__main__":
    run_demo()
print("[✓] Consumer Complaint Recall 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:1205.2678，但该号在 arXiv 上是《Evaluation of Proactive, Reactive and Hybrid Ad hoc Routing Protocol for various Battery models in VANET using Qualnet》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《Hierarchical Dirichlet Processes for Unsupervised Topic Discovery in Short Texts》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：公开投诉记录（卡页场景为 SaferProducts.gov 婴儿推车品类近三年约 800 条），含文本、品类与时间，按条组织。

**输出**：投诉主题及权重、主题集中度指标与阈值比较结果、召回风险标记与受影响品类清单，供选品门控与合规预审。

## 执行步骤

1. 采集并清洗品类投诉文本
2. 用主题模型提取风险主题与权重
3. 计算主题集中度并与阈值比较
4. 标记高召回风险品类
5. 输出选品门控建议与风险清单

## 边界与不做

- 数据不满足时不适用：公开投诉样本量过小、或品类没有可用投诉数据源时，主题集中度不稳。
- 能力边界：只输出风险提示与门控信号，不构成召回判定，也不替代合规与法务的对外处置。
- 卡页置信度为 medium，结论需结合近年投诉趋势复核。

## 技能关联

- **前置**：Skill-Category-Compliance-Prescan.html、Skill-Category-Compliance-Prescan、Skill-Review-Fraud-Detection.html、Skill-Review-Fraud-Detection
- **延伸**：Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-FraudSquad-LLM-Review-Detection.html、Skill-FraudSquad-LLM-Review-Detection
- **可组合**：Skill-Agent-SLO-Manager.html、Skill-Agent-SLO-Manager、Skill-Guardrailed-Uplift-Targeting.html、Skill-Guardrailed-Uplift-Targeting、Skill-Time-Series-Anomaly-Detection.html、Skill-Time-Series-Anomaly-Detection、Skill-Time-Series-Forecasting.html、Skill-Time-Series-Forecasting、Skill-Consumer-Complaint-Recall-Prediction

---

> 分类：业务运营/供应与履约/质量分析　·　技术族：21-合规决策　·　源卡：`Skill-Consumer-Complaint-Recall-Prediction`