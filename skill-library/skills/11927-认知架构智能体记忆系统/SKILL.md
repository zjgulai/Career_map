---
name: "p2s-cognitive-architecture-agent-memory"
title: "Skill: 认知架构智能体记忆系统"
description: "触发词：认知架构、多级记忆、工作记忆与情景记忆、法规知识库、大促实时决策。何时不用：单系统、无跨轮次与跨库一致性需求时不适用；只做长期与短期记忆调度用统一记忆管理技能。安全边界：涉法规与税则的决策结论须可追溯到语义记忆条目并保留人工复核通道，法规库须定期同步更新。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 知识溯源"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Cognitive-Architecture-Agent-Memory"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "用工作、情景、语义、程序四层记忆支撑 Agent 在几秒内完成定价、库存与合规的联合决策。"
user_try: "试试：黑五期间要在5秒内完成价格调整、库存检查、FDA 合规验证和推荐生成，帮我搭一套多级记忆架构。"
whenToUse: "当决策需要同时依赖实时状态、历史大促经验、法规知识与固定流程，且对延迟与合规误触率敏感时用本卡；只需要跨会话记住用户偏好用统一记忆管理技能；只需要压缩上下文用上下文压缩技能。"
workflow: "接入实时工作记忆（价格表与库存状态） → 沉淀情景记忆（历史大促订单与用户偏好） → 维护语义记忆（法规、税则与黑名单） → 固化程序记忆（定价算法与合规流程） → 按层级检索串联四类记忆输出联合决策"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill: 认知架构智能体记忆系统

## ① 解决的问题

运营 Agent 因上下文窗口限制在大促期间丢失跨系统决策链——引入认知架构多级记忆管理（工作记忆+情景记忆+语义记忆），Agent 跨轮次决策一致性提升至 92%，大促期合规+定价联合决策速度提升12倍。

## ② 核心算法逻辑

Skill: 认知架构智能体记忆系统

## ③ 业务应用场景

业务问题： - 美国FDA对婴儿配方奶粉有108项合规指标，中国海关对进口母婴用品有动态税率 - 大促期间(黑五、618)需在5秒内完成"价格调整→库存检查→合规验证→推荐生成" - 传统流程需人工审核，周期24小时，错误率8.5%
数据要求： - 工作记忆：实时SKU价格表(2000件/秒更新)、库存状态(Redis) - 情景记忆：过去12个月大促销售数据(50万订单)、用户购买偏好(100万用户) - 语义记忆：FDA规则库(1200条)、海关税则(800条)、品牌黑名单(500条) - 程序记忆：定价算法(5个)、合规检查流程(8个)
量化产出： - 决策延迟：从24小时→12秒(2000倍加速) - 合规误触率：8.5%→1.8%(降低78%) - 大促期间订单处理量：日均从5000单→48000单(9.6倍提升) - 人工审核成本：从日均12人→2人(节省83%)

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

年省人工+系统维护¥480万

## ⑦ 代码节选

（卡页此段是占位串，本卡未附代码实现。）

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2309.02427。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：工作记忆所需的实时数据（如 SKU 价格表按秒级更新、库存状态存于 Redis）、情景记忆所需的历史大促销售与用户购买偏好、语义记忆所需的法规规则库与海关税则与品牌黑名单，以及程序记忆所需的定价算法与合规检查流程清单。

**输出**：四类记忆的组织结构与检索结果，以及在单一决策链上串联定价、库存与合规校验后的联合决策建议，附决策延迟与合规误触率的改善情况。

## 执行步骤

1. 接入实时工作记忆（SKU 价格表与库存状态）
2. 沉淀情景记忆（历史大促订单与用户购买偏好）
3. 维护语义记忆（法规规则库、海关税则与品牌黑名单）
4. 固化程序记忆（定价算法与合规检查流程）
5. 在决策时按层级检索并串联四类记忆
6. 输出定价、库存与合规的联合决策建议

## 边界与不做

- 何时不用：单系统、无跨轮次与跨数据源一致性需求时不适用；只需记住用户偏好的场景用更轻的记忆管理技能。
- 能力边界：只产出多级记忆的组织方式与决策建议，实时数据管道与并行校验能力需工程侧保障。
- 合规边界：涉法规与税则的决策结论须可追溯到语义记忆条目，法规库须定期同步更新并保留人工复核通道。

## 技能关联

- **前置**：Skill-AgeMem-Unified-Agent-Memory.html、Skill-AgeMem-Unified-Agent-Memory、Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-MemoryOS-Agent-Memory-Management.html、Skill-MemoryOS-Agent-Memory-Management、Skill-RAG-Production-Observability.html、Skill-RAG-Production-Observability
- **延伸**：Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-Long-Term-Preference-Memory.html、Skill-Long-Term-Preference-Memory、Skill-MemoryOS-Agent-Memory-Management.html、Skill-MemoryOS-Agent-Memory-Management、Skill-RAG-Production-Observability.html、Skill-RAG-Production-Observability
- **可组合**：Skill-Agent-Memory-Learning.html、Skill-Agent-Memory-Learning、Skill-MemoryOS-Agent-Memory-Management.html、Skill-MemoryOS-Agent-Memory-Management、Skill-RAG-Production-Observability.html、Skill-RAG-Production-Observability、Skill-Cognitive-Architecture-Agent-Memory

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Cognitive-Architecture-Agent-Memory`