---
name: "p2s-tool-auto-discovery"
title: "Tool Auto Discovery — Agent 工具自动发现：OpenAPI + MCP Schema 自注册"
description: "触发词：工具自动发现、OpenAPI注册、MCP自注册、工具注册表、供应商接口接入。何时不用：工具已在册、需要判断该不该调用时用工具调用决策技能；需要审计工具描述质量时用工具描述审核技能。安全边界：自注册范围须限定在受信来源与白名单域内，涉及下单、改价等写操作的工具须保留人工确认。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-143"
l3_business: "接口契约"
l3_all: "接口契约 / 业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/接口契约"
p2s_card_id: "Skill-Tool-Auto-Discovery"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "新供应商开放接口后不必手写工具定义，让 Agent 从 OpenAPI 或 MCP 描述里自动发现并注册。"
user_try: "试试：把这个供应商的 OpenAPI 文档和 MCP 工具列表接进注册表，自动发现可用的 MOQ 查询工具。"
whenToUse: "希望减少手工注册与联调、让新接口快速变成可用工具时用本技能；工具已在册、要决定调不调用，用工具调用决策技能。"
workflow: "从 OpenAPI schema 或 MCP 工具列表读取定义 → 在注册表中自动生成工具定义与入参 schema → 绑定处理器并做可用性校验 → 按质量分排序输出活跃工具"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Tool Auto Discovery — Agent 工具自动发现：OpenAPI + MCP Schema 自注册

## ① 解决的问题

ROI：接入时间从 2 天→30 分钟，节省 90%+ 开发成本

## ② 核心算法逻辑

论文：ToolLLM: Facilitating Large Language Models to Master 16000+ Realworld APIs | 年份：2023

## ③ 业务应用场景

背景：供应商 SupplyX 开放 MOQ 查询 API，提供标准 OpenAPI schema。
传统方式：后端工程师阅读文档 → 编写 ToolDefinition → 更新 SkillRegistry → 测试联调 → 部署（约 2 天）
ROI：接入时间从 2 天→30 分钟，节省 90%+ 开发成本。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

✅ 多供应商 API 集成（供应链、物流、广告平台）
✅ API 版本频繁迭代的平台（TikTok/Meta/Google Ads）
✅ 快速构建 MAS PoC（无需手写工具注册代码）
❌ 内部私有 API（无标准 schema，需手工适配）
❌ 高安全要求场景（自动发现需额外审计）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（14 行）。**下面 14 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **14 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，14 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：4」并记录位置 `paper2skills-code/llm_agent_engineering/tool_auto_discovery` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Tool-Auto-Discovery.md`），已与卡面节选核对，不依赖上述路径。

```python
from tool_auto_discovery import AutoDiscoveryRegistry, OpenAPIParser

registry = AutoDiscoveryRegistry()

# 方式1：从 OpenAPI schema 发现
tools = registry.discover_from_schema(openapi_schema, source="supplyx")
print(f"注册了 {len(tools)} 个工具")

# 方式2：从 MCP list_tools 发现
mcp_tools = registry.discover_from_mcp(mcp_list_tools_response)

# 查询活跃工具（按质量排序）
active = registry.get_active_tools(min_success_rate=0.8)
print("[✓] Tool Auto Discovery 测试通过")
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2309.07892，但该号在 arXiv 上是《Pseudoscalar current and covariance with the light-front approach》，与本卡主题无关。
⚠️ 卡页 ② 段点名的论文是《ToolLLM: Facilitating Large Language Models to Master 16000+ Realworld APIs》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：工具来源描述文件（OpenAPI schema 或 MCP 工具列表）与对应服务地址、鉴权信息，粒度到单个接口与单个工具。

**输出**：自动生成的工具注册表与活跃工具清单（按质量排序），供 Agent 运行时选取工具与平台工程师复用。

## 执行步骤

1. 接入 OpenAPI schema 或 MCP 工具列表作为工具来源
2. 在注册表中自动生成工具定义与入参 schema
3. 绑定处理器并做基本可用性校验
4. 按质量分排序输出活跃工具清单

## 边界与不做

- 接口没有可机读的 schema（只有口头或截图文档）时不适用；单个长期稳定的工具无需自动发现。
- 自动发现只解决注册与描述解析，不评估业务正确性，也不代做鉴权与配额管理。

## 技能关联

- **前置**：Skill-Agent-Registry-Discovery.html、Skill-Agent-Registry-Discovery、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework
- **延伸**：Skill-Agentic-Workflow-Compilation.html、Skill-Agentic-Workflow-Compilation、Skill-Tool-Description-Audit.html、Skill-Tool-Description-Audit
- **可组合**：Skill-Cultural-Adaptation-Agent.html、Skill-Cultural-Adaptation-Agent、Skill-Flowr-Supply-Chain-MAS.html、Skill-Flowr-Supply-Chain-MAS、Skill-ParaManager-Parallel-Orchestration.html、Skill-ParaManager-Parallel-Orchestration、Skill-Skill-Card-API-Serving.html、Skill-Skill-Card-API-Serving、Skill-Tool-Auto-Discovery

---

> 分类：数据与Agent平台/数据与AI运行/接口契约　·　技术族：16-智能体工程　·　源卡：`Skill-Tool-Auto-Discovery`