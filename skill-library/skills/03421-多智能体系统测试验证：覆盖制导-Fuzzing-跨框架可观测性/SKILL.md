---
name: "p2s-mas-testing-verification"
title: "MAS Testing & Verification — 多智能体系统测试验证：覆盖制导 Fuzzing + 跨框架可观测性"
description: "触发词：MAS测试验证、多Agent流程测试、覆盖制导Fuzzing、跨框架对比、边界场景验证、死循环检测。何时不用：要诊断单个 Agent 的阶段能力短板用「Agent阶段评估」；要做上线可靠性三维评估用「Agent可靠性评估」。安全边界：Fuzzing 与故障注入只能在测试环境执行，严禁对生产 Agent 或真实 ERP 系统发起；测试数据须脱敏，不得带入真实订单与用户信息。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-145"
l3_business: "集成验证"
l3_all: "集成验证 / 运行监测"
l1_l2_l3: "数据与Agent平台/数据与AI运行/集成验证"
p2s_card_id: "Skill-MAS-Testing-Verification"
p2s_src_domain: "10-MAS"
p2s_code_level: "无代码"
quality_tier: "preview"
user_summary: "5 个 Agent 串起来跑选品，单元测试测不出交互 bug——用覆盖制导 Fuzzing 把没竞品数据、合规库超时这类边界先跑一遍。"
user_try: "试试：给选品扫描工作流跑一轮多智能体测试，覆盖无竞品数据、合规数据库超时、汇率异常这些边界。"
whenToUse: "当多 Agent 流水线要迭代、需要验证整条链路与边界场景、或要在两个框架（如 AutoGen 与 LangGraph）之间做量化对比时用本技能；若只是单个 Agent 的能力诊断，用「Agent阶段评估」；若要做上线可靠性门禁，用「Agent可靠性评估」。"
workflow: "梳理多 Agent 串行协作链路与各环节输入输出 → 用覆盖制导 Fuzzing 生成边界与异常场景用例 → 注入工具失败、数据库超时、数据缺失等扰动 → 跨框架采集延迟、Token 消耗与可靠性指标做对比 → 输出测试报告、失败模式清单与框架迁移建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# MAS Testing & Verification — 多智能体系统测试验证：覆盖制导 Fuzzing + 跨框架可观测性

## ① 解决的问题

业务背景：选品扫描工作流由 5 个 Agent 串行协作（品类趋势 Agent → 竞品分析 Agent → 合规预筛 Agent → 利润计算 Agent → 综合评分 Agent）

## ② 核心算法逻辑

MAS 的失败模式与单体软件完全不同：Agent 之间的交互是非确定性的，工具调用可能失败，Agent 可能陷入死循环，而这些问题用传统单元测试根本无法发现。MAS 专用测试体系需要解决三个独特问题：

## ③ 业务应用场景

业务背景：选品扫描工作流由 5 个 Agent 串行协作（品类趋势 Agent → 竞品分析 Agent → 合规预筛 Agent → 利润计算 Agent → 综合评分 Agent）。每次代码迭代前需要验证整个流程的正确性，且要覆盖边界情况（无竞品数据、合规数据库超时、汇率异常等）。
预期收益：减少上线后因 Agent 交互 bug 导致的选品错误，避免错误进入 10-15 万元级采购决策。
业务背景：团队考虑将现有基于 AutoGen 的库存 MAS（AIM-RM）迁移到 LangGraph，需要量化两个框架的性能差异（延迟、Token 消耗、可靠性）。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：AI 工程师面临核心业务决策——MAS 自动化率提升 70%，年化节省运营人力 42 万元
实施难度：⭐⭐⭐☆☆（3/5星，需要历史数据积累 3 个月以上）
优先级：⭐⭐⭐⭐☆（4/5星，直接影响核心业务指标）

## ⑦ 代码节选

（卡页此段未附代码。但语料 vault 的同一张卡里有代码：本技能已附 `references/implementation.py`（20 行）。⚠️ 本卡卡面无节选可作对照，该文件取的是最长代码围栏，**未经交叉核对**。）

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.05289 — FLARE: Agentic Coverage-Guided Fuzzing for LLM-Based Multi-Agent Systems

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：MAS 的 Agent 拓扑与调用链路、工作流输入输出定义、边界场景清单（无竞品数据、合规数据库超时、汇率异常等），以及待对比框架的运行配置。

**输出**：覆盖制导 Fuzzing 的用例执行结果与失败模式清单、跨框架对比指标（延迟、Token 消耗、可靠性）与迁移建议；供 AI 工程师在上线前验收工作流正确性。

## 执行步骤

1. 梳理多 Agent 串行协作链路，标出各环节的输入输出契约
2. 用覆盖制导 Fuzzing 生成边界场景与异常输入用例
3. 注入无竞品数据、合规库超时、汇率异常等扰动跑流程
4. 采集延迟、Token 消耗与可靠性指标，做跨框架对比
5. 输出测试报告、失败模式清单与迁移或修复建议

## 边界与不做

- 数据不满足：工作流没有明确的输入输出契约时无法生成有效用例，先补齐接口定义。
- 何时不用：单 Agent 阶段能力诊断用「Agent阶段评估」，上线可靠性三维门禁用「Agent可靠性评估」。
- 能力边界：只做测试与验证并给出报告，不直接修复 Agent 交互缺陷，也不替代业务验收。
- 安全边界：Fuzzing 与故障注入限定在测试环境，测试数据须脱敏。

## 技能关联

- **前置**：Skill-AutoGen-Multi-Agent-Conversation.html、Skill-AutoGen-Multi-Agent-Conversation、Skill-Compliance-Scored-Guardrail-Orchestration.html、Skill-Compliance-Scored-Guardrail-Orchestration、Skill-MAS-Orchestrator.html、Skill-MAS-Orchestrator、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **延伸**：Skill-Compliance-Scored-Guardrail-Orchestration.html、Skill-Compliance-Scored-Guardrail-Orchestration、Skill-MAS-Resource-Scheduling.html、Skill-MAS-Resource-Scheduling、Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability
- **可组合**：Skill-ReliabilityBench-Agent-Reliability.html、Skill-ReliabilityBench-Agent-Reliability、Skill-MAS-Testing-Verification

---

> 分类：数据与Agent平台/数据与AI运行/集成验证　·　技术族：10-MAS　·　源卡：`Skill-MAS-Testing-Verification`