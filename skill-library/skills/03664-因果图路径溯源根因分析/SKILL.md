---
name: "p2s-prorca-business-analysis"
title: "ProRCA — 因果图路径溯源根因分析"
description: "触发词：根因溯源、GMV 告警、因果路径、秒级定位、大促监控。何时不用：要走多假设检验做销量下滑诊断时用「需求异常因果归因」；离线复盘找驱动因素时用「PC算法因果发现」。安全边界：因果拓扑需人工维护或从架构图提取，拓扑缺失或过期时不得给出确定性根因结论，须标注待人工确认。"
l1_id: "PLN-MGT"
l1_plane: "经营管理"
l2_id: "DOM-01"
l2_domain: "经营与组织"
l3_id: "DOM-01-008"
l3_business: "GMV归因分析"
l3_all: "GMV归因分析"
l1_l2_l3: "经营管理/经营与组织/GMV归因分析"
p2s_card_id: "Skill-ProRCA-Business-Analysis"
p2s_src_domain: "09-DataAgent-LLM"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "大促中 GMV 掉点时，沿着指标因果拓扑秒级定位到真正的根因节点，并生成可推送的报告。"
user_try: "试试：GMV 跌破阈值了，用各支付通道成功率和流量的 5 分钟 z-score 帮我定位根因路径并出报告。"
whenToUse: "当已有实时指标流与维护好的指标因果拓扑、要在分钟级定位告警根因时用本技能；没有拓扑、需要多假设检验做诊断时用「需求异常因果归因」或「根因分析 Agent」；离线因果结构学习用「PC算法因果发现」。"
workflow: "定义业务指标节点并计算 5 分钟滚动 z-score → 维护指标间 parent 到 child 的因果边 → GMV 跌破阈值触发告警后调用引擎以 GMV 为触发节点分析 → 输出根因节点、追踪路径与因果链解释 → 交给 LLM Agent 生成自然语言报告并推送企业微信或钉钉"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# ProRCA — 因果图路径溯源根因分析

## ① 解决的问题

运营总监面临业绩下滑原因说不清——ProRCA将定位时间从3天缩到6小时，年化省15万元

## ② 核心算法逻辑

核心问题：当 GMV 暴跌时，传统监控会同时弹出几百个警报——流量跌、加购跌、结账跌、支付跌……却不告诉你哪个是起因，哪个是被牵连的。

## ③ 业务应用场景

业务问题：黑五顶峰期每分钟 GMV 损失几十万美金，从告警触发到找出根因人工需要 1-2 小时。
数据要求： - 各业务指标的 5 分钟滚动 z-score（流量、加购、转化、各支付通道成功率、GMV） - 指标间因果拓扑（可从系统架构图自动提取或人工维护）
实施步骤： 1. GMV 跌破阈值触发告警 2. ProRCAEngine 加载实时指标 z-score 和因果图 3. `engine.analyze(trigger_node="GMV")` 秒级输出根因路径 4. LLM Agent 读取路径后生成自然语言报告推送到企业微信/钉钉

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

100 万

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（45 行）。**下面 45 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **45 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，45 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/data_agent_llm/prorca_business_analysis` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/09-DataAgent-LLM/Skill-ProRCA-Business-Analysis.md`），已与卡面节选核对，不依赖上述路径。

```python
from model import ProRCAEngine

# 1. 定义业务指标节点（z_score = 当前相对基线的标准化偏差）
nodes = [
    {"name": "广告流量",        "z_score":  0.2,  "raw_value": 28000, "raw_baseline": 27500},
    {"name": "加购量",          "z_score": -0.3,  "raw_value": 5100,  "raw_baseline": 5200},
    {"name": "结账到达量",      "z_score": -2.1,  "raw_value": 1850,  "raw_baseline": 2100},
    {"name": "PayPal支付成功率","z_score": -4.5,  "raw_value": 0.32,  "raw_baseline": 0.97},
    {"name": "信用卡支付成功率","z_score":  0.1,  "raw_value": 0.96,  "raw_baseline": 0.97},
    {"name": "GMV",             "z_score": -3.8,  "raw_value": 45000, "raw_baseline": 75000},
]

# 2. 定义因果边（parent → child 表示 parent 是 child 的原因）
edges = [
    ("广告流量", "加购量"),
    ("加购量", "结账到达量"),
    ("结账到达量", "PayPal支付成功率"),
    ("结账到达量", "信用卡支付成功率"),
    ("PayPal支付成功率", "GMV"),
    ("信用卡支付成功率", "GMV"),
]

# 3. 初始化引擎并分析
engine = ProRCAEngine(propagation_beta=0.7, score_threshold=0.5)
engine.load_graph(nodes, edges)
result = engine.analyze(trigger_node="GMV")

# 4. 输出人类可读报告
print(engine.summary(result))
# 输出:
# 根因节点   : PayPal支付成功率
# 追踪路径   : GMV → PayPal支付成功率
# 根因分数   : 3.030
# 因果链解释: 【根因】PayPal支付成功率(z=-4.50) → 【影响终点】GMV(z=-3.80)

# 5. 接入 LLM Agent（将 result 序列化传给大模型）
agent_prompt = f"""
根因分析完成。
根因节点: {result.root_cause}
因果路径: {' → '.join(result.path)}
解释: {result.explanation}

请用一句话向运营团队说明问题，并给出立即行动建议。
"""
print("[✓] ProRCA Business Analysis 测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2503.01475 — ProRCA: A Causal Python Package for Actionable Root Cause Analysis in Real-world Business Scenarios

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：各业务指标的 5 分钟滚动 z-score（流量、加购、转化、各支付通道成功率、GMV），以及指标间因果拓扑（可从系统架构图提取或人工维护）。

**输出**：根因节点、追踪路径与根因分数，可序列化交给 LLM 生成自然语言报告推送到企业微信或钉钉。

## 执行步骤

1. 定义业务指标节点并计算 5 分钟滚动 z-score
2. 维护 parent 到 child 的指标因果边
3. GMV 跌破阈值触发告警并以 GMV 为触发节点运行分析
4. 输出根因节点、追踪路径与因果链解释
5. 交给 LLM Agent 生成报告并推送到企业微信或钉钉

## 边界与不做

- 数据不满足：没有实时指标流或指标因果拓扑时不要用，先补拓扑与数据源。
- 何时不用：没有拓扑、要用假设生成加取证时用「根因分析 Agent」；销量下滑的多假设并行检验用「需求异常因果归因」；离线结构学习用「PC算法因果发现」。
- 能力边界：只做定位与解释，不执行恢复动作；结论质量受拓扑维护质量约束。
- 安全边界：拓扑缺失或过期时不得给出确定性根因结论，必须标注为待人工确认。

## 技能关联

- **前置**：Skill-Argos-Agentic-Anomaly-Detection.html、Skill-Argos-Agentic-Anomaly-Detection、Skill-Root-Cause-Analysis-Agent.html、Skill-Root-Cause-Analysis-Agent
- **延伸**：Skill-DeepAnalyze-Autonomous-Data-Science-Agent.html、Skill-DeepAnalyze-Autonomous-Data-Science-Agent、Skill-SQL-Agent-Text-to-SQL.html、Skill-SQL-Agent-Text-to-SQL
- **可组合**：Skill-AgentTrace-Causal-RCA.html、Skill-AgentTrace-Causal-RCA、Skill-CDA-Privacy-Causal-Attribution.html、Skill-CDA-Privacy-Causal-Attribution、Skill-DS-DGA-GCN-Fake-Review-Group.html、Skill-DS-DGA-GCN-Fake-Review-Group、Skill-Demand-Forecasting-Supply-Chain.html、Skill-Demand-Forecasting-Supply-Chain、Skill-Dynamic-Pricing-Elasticity.html、Skill-Dynamic-Pricing-Elasticity、Skill-Multimodal-Table-Understanding.html、Skill-Multimodal-Table-Understanding、Skill-Supply-Chain-Causal-SCM-Attribution.html、Skill-Supply-Chain-Causal-SCM-Attribution、Skill-ProRCA-Business-Analysis

---

> 分类：经营管理/经营与组织/GMV归因分析　·　技术族：09-DataAgent-LLM　·　源卡：`Skill-ProRCA-Business-Analysis`