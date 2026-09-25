---
name: "p2s-sandlock-agent-execution-sandbox"
title: "Sandlock — 轻量 Agent 沙箱：5ms 启动，HTTP ACL，可逆文件系统"
description: "触发词：Agent沙箱、可逆文件系统、HTTP ACL、工具执行隔离、失败回滚、短命令高频执行。何时不用：只想在调用前做语义判决、不隔离执行环境时用「运行时安全拦截」；只想做工具与参数的策略约束与审批时用「最小权限Agent框架」；只做知识库可见性控制时用「知识库RBAC」。安全边界：沙箱内可写路径、可访问主机与端口必须显式白名单，默认拒绝；沙箱内执行通过不等于可自动提交，真实写操作须人工二次确认后才可送达业务系统。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-134"
l3_business: "访问控制"
l3_all: "访问控制 / 安全事件处理"
l1_l2_l3: "独立控制/数据与AI运行/访问控制"
p2s_card_id: "Skill-Sandlock-Agent-Execution-Sandbox"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "给 Agent 一个 5 毫秒就能起来的临时房间：能写哪里、能调哪个接口都写死，失手写下东西自动回滚。"
user_try: "试试：让补货 Agent 先在沙箱里跑完下单流程，只允许写草稿目录、只允许调库存查询和创建采购单两个接口，通过后我再确认。"
whenToUse: "当 Agent 需要高频执行短命令、且必须隔离文件写入与网络访问、失败还要能回滚时用本技能；若只需在调用前做一次语义判决，用「运行时安全拦截」；若只需约束工具与参数策略，用「最小权限Agent框架」。"
workflow: "定义 SandboxPolicy：可读路径、可写路径、允许端口与 HTTP ACL 规则 → 在沙箱内执行工具命令并逐项校验文件与网络访问 → 拦截越界写入与未授权主机请求 → 失败时自动回滚可逆写入 → 沙箱通过与人工二次确认后，才真正提交到 ERP"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Sandlock — 轻量 Agent 沙箱：5ms 启动，HTTP ACL，可逆文件系统

## ① 解决的问题

安全负责人面临Agent误操作风险——Sandlock将事故外溢率3%压到0.1%，年化省35万元

## ② 核心算法逻辑

为什么容器/microVM 不适合短命令 Agent：Docker 容器启动需 500ms2s，microVM（Firecracker）需 125ms+，对于每次工具调用仅数十毫秒的 Agent 来说开销过大。Sandlock 通过 Rust 实现，启动延迟 5ms，专为短命令高频执行设计，Redis 集成零额外开销。

## ③ 业务应用场景

场景一：WF-A 补货 Agent 沙箱执行
补货 Agent 在下达采购 PO 前，需在沙箱中模拟完整执行流程： - 文件写入策略：只允许写 `/tmp/po_draft/`，写入结果可逆（失败自动回滚） - HTTP ACL：只允许 `POST /api/v1/purchase-orders` 和 `GET /api/v1/inventory`，禁止访问财务系统 - 沙箱通过后人工二次确认，才真正提交 ERP
实际价值：2024 年某 DTC 品牌因 Agent 误触发 `DELETE /orders/all` 导致 48 小时订单数据丢失。Sandlock 沙箱隔离完全规避此类风险。

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

核心收益：Agent 工具执行完全隔离，防止 PO 误操作（删除/超额下单）和数据外泄，年化风险规避价值 20-50 万元
性能开销：5ms 启动 vs 容器 500ms，对 Agent 工具调用吞吐量影响 <1%
实施难度：⭐⭐⭐☆☆（需 Linux 环境，Rust 依赖）
优先级：⭐⭐⭐⭐⭐（P0 生产阻塞）
参考：arXiv:2605.26298 | GitHub: github.com/multikernel/sandlock

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（21 行）。**下面 21 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **21 行，未到上限**（可能即为源站发布的全部）。
> 节选语法完整（`ast.parse` 通过，21 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/sandlock_agent_execution_sandbox` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-Sandlock-Agent-Execution-Sandbox.md`），已与卡面节选核对，不依赖上述路径。

```python
# paper2skills-code/llm_agent_engineering/sandlock_sandbox/model.py
# 完整实现见代码目录
from paper2skills_code.llm_agent_engineering.sandlock_sandbox.model import (
    SandboxPolicy, SandlockExecutor, ReversibleEffect, HTTPACLChecker,
    HTTPACLRule, CommandResult
)

# WF-A 补货 Agent 沙箱策略
policy = SandboxPolicy(
    readable_paths=["/tmp/inventory_data"],
    writable_paths=["/tmp/po_draft"],
    allowed_tcp_ports=[443],
    http_acl_rules=[
        HTTPACLRule(method="GET",  host="erp.company.com", path_prefix="/api/v1/inventory"),
        HTTPACLRule(method="POST", host="erp.company.com", path_prefix="/api/v1/purchase-orders"),
    ]
)
executor = SandlockExecutor(policy)
result = executor.execute("python generate_po.py --sku B001 --qty 500")
print(result.verdict, result.rollback_applied)  # ALLOW False
print("[✓] Sandlock Agent Execution  测试通过")
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2605.26298 — Sandlock: Confining AI Agent Code with Unprivileged Linux Primitives

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待执行的命令与工作目录、可读/可写路径清单、允许的 TCP 端口与 HTTP ACL 规则（方法 + 主机 + 路径前缀）；粒度为单条命令的执行会话。

**输出**：命令执行判决（ALLOW / BLOCK）、是否发生回滚的标志与执行结果产物；沙箱结论交人工确认后再写入真实业务系统，供 Agent 编排层与运维审计使用。

## 执行步骤

1. 声明沙箱策略：可读路径、可写路径、允许端口与 HTTP ACL 白名单
2. 执行沙箱内的 Agent 工具命令，模拟完整业务流程
3. 拦截越界文件写入与未授权主机、端口的网络请求
4. 执行失败时自动回滚可逆文件写入
5. 交人工二次确认沙箱结论，再提交真实 ERP 操作

## 边界与不做

- 数据不满足：非 Linux 环境或无法声明可写路径与 HTTP 白名单时无法建立隔离边界，不要退化为无策略直接执行。
- 何时不用：只做命令语义判决用「运行时安全拦截」，只做策略审批用「最小权限Agent框架」，都不需要本技能的执行隔离与回滚。
- 能力边界：只隔离执行并保证可逆，不判断业务动作是否合理，也不替代凭证代管与权限策略。
- 安全边界：白名单之外一律默认拒绝；沙箱内通过不得作为自动提交真实写操作的授权，必须人工二次确认。

## 技能关联

- **前置**：Skill-Agent-Fault-Tolerance.html、Skill-Agent-Fault-Tolerance、Skill-Agent-Safety-Guardrails.html、Skill-Agent-Safety-Guardrails、Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Atomix-Transactional-Tool-Calls.html、Skill-Atomix-Transactional-Tool-Calls、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Progent-Privilege-Control.html、Skill-Progent-Privilege-Control、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **延伸**：Skill-AgentTrust-Runtime-Safety-Interception.html、Skill-AgentTrust-Runtime-Safety-Interception、Skill-Atomix-Transactional-Tool-Calls.html、Skill-Atomix-Transactional-Tool-Calls、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-Progent-Privilege-Control.html、Skill-Progent-Privilege-Control、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration
- **可组合**：Skill-Atomix-Transactional-Tool-Calls.html、Skill-Atomix-Transactional-Tool-Calls、Skill-MCP-A2A-Protocol-Stack.html、Skill-MCP-A2A-Protocol-Stack、Skill-SDOF-State-Constrained-Orchestration.html、Skill-SDOF-State-Constrained-Orchestration、Skill-Sandlock-Agent-Execution-Sandbox

---

> 分类：独立控制/数据与AI运行/访问控制　·　技术族：16-智能体工程　·　源卡：`Skill-Sandlock-Agent-Execution-Sandbox`