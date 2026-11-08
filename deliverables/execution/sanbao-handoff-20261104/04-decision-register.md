---
title: 决策登记 C-377 起
doc_type: other
module: handoff
topic: decision-register
status: review
created: 2026-11-04
updated: 2026-11-04
owner: self
source: human+ai
---

# 决策登记 C-377 起

本文件登记 2026-11-04 全部已定决策。每条含来源、内容、边界、未解、不上图声明。

**格式约定**：`[来源]` 必须可回查；`[边界]` 写清不管什么；`[未解]` 写清还差什么；`[不上图]` 声明不新增画布节点。

---

## C-377 · 53 席是可寻址专家目录

**[来源]** 用户 2026-11-04；`AI组织变革/docs/05-agents/role-catalog.json`（50 行）+ `management-catalog.json`（3 行）。

**[内容]** 53 = AGT-001..050 + MGT-001..003。固定目录，不合并、不撤销、不新增。席位是地址，不是进程。`tier` 是目标运行层，不是身份类型，也不是已实例化状态。T0/T4 是执行与决策模式：T0 单次运行不加载 persona，T4 是规则包 + 具名人类；**AGT 席位仍保留岗位卡、persona 引用与 53 席身份**。

**[边界]** 不表示 53 席已实例化；不表示 53 个并发。

**[未解]** 无。

**[不上图]** 不新增画布节点。

---

## C-378 · A 方案：8 项 P0 缺口扩写进现有席位

**[来源]** 用户 2026-11-04 选 A；覆盖度审计发现的 8 项缺口。

**[内容]** 不新增席位，把 8 项缺口扩写进 AGT-041/019/044/014/018/020/027/043 与 MGT-003。责任句统一改为「对证据完整性、预警及时性、建议有据负责」，**不对外部决定的结果负责**。

**[边界]** 不改变 53 席数量；不新增专业身份；不授权任何外部动作。

**[未解]** 逐席映射需用户逐格确认；源 catalog 尚未写入。

**[不上图]** 不新增画布节点。

---

## C-379 · 九条责任句与产物收口

**[来源]** 本轮核查 + 用户「跑，但为后续加 skill 留口子」。

**[内容]**

1. 身份层与运行层分开：T0 不消灭 53 席身份
2. 覆盖分母统一写「50 AGT preset + 3 MGT rule pack = 53 seat」
3. 0.2.0 只认 `config.id = agt-NNN`；`dsh.role.*` 只作 legacy 追溯
4. 「配不了」只指三缺口（0.2 声明行 / 正文落盘 / mount 证据），不指 53 席目录或 22/22 正文
5. 正文缺口按合并来源复算为 **4 个**；41 是 git 跟踪的局部口径，**禁止再用**
6. 升级路径写「MGT-003 治理官 + 真人所有者（L3→L4）」，**v2 无 CFO**
7. 不用「T0 确定性工具层」对应 L0；L0 是决策权级别
8. 升级不等于每笔人批，用预授权政策
9. 8 席视觉改写只作展示字段

**[边界]** 不改变任何席位的授权状态。

**[未解]** 无。

**[不上图]** 不新增画布节点。

---

## C-380 · 试点准备预授权

**[来源]** 用户 2026-11-04 授权本轮推进。

**[内容]** 在源项目 D-051 未回写前，预授权「准备态」工作：写 seat registry、overlay、read policy、八阶段合同、四席合同、技能矩阵、交接包。**全部只写文件与配置，不启动 Case、不接外部数据、不写源仓、不动生产。** 有期限、可撤销、逐文件 owner 签核。

**[边界]** 不是运行时授权，不是 D-051 变更，不是生产授权；不覆盖凭据使用、外部网络、真实数据接入。

**[未解]** 七项前置的 owner 落名。

**[不上图]** 不新增画布节点。

---

## C-381 · DSH 0.2.0-rc.2 为唯一目标基座

**[来源]** `apps/sage-shell/seed/package.json` 锁定 `@deepseek-ai/dsh = 0.2.0-rc.2`；用户 2026-11-04 确认。

**[内容]** 0.2.0 的 preset 是 profile 里一行 `@deepseek-ai/dsh-agent-preset` 声明，字段为 `config.id/name/description/order/plugins`。目录型 preset 是 0.1.x / 2.0.x legacy，0.2.0 不读。`standard.patch.yml` 提供 19 顶层 + 13 嵌套行。

**[边界]** 不锁定模型 provider；不锁定部署形态。

**[未解]** Sanbao 0.2 迁移批的排期（已定排在当前 wave 收口后）。

**[不上图]** 不新增画布节点。

---

## C-382 · pilot-only role_scope 扩展

**[来源]** 用户 2026-11-04 接受；`FLOW-CATALOG.md` 与 `e2e-value-streams.json` 的 26 人 role_scope。

**[内容]** AGT-005 → STG-06 assurance；AGT-045 → STG-02/04 口径契约。**仅 FLOW-02 × SCN-002**；不改全局 role_scope；不新增席位；pilot 结束即失效；记录 operator / reason / timestamp 与 `scenario_selector_override=true`。

**[边界]** 不扩展到其他 flow 或 scenario。

**[未解]** 源仓协同图是否登记。

**[不上图]** 不新增画布节点。

---

## C-383 · 具名人类 owner 登记在 layer_0

**[来源]** 用户 2026-11-04「他是上帝创造者」。

**[内容]** `human_owner_ref` 含姓名 / 替补 / 联系方式 / 签核范围。**不生成 seat 行、不进 53 计数、不参与 Case、不持工具或数据权限。** 一人可兼多岗，但必须写替补与升级 SLA。MGT 三岗 owner、AGT-005/008 验收 owner、数据 owner 需在 pilot 生效前落名。

**[边界]** 不创建 agent 身份、不授予数据访问、不改变 T4 规则包。

**[未解]** 姓名、替补、SLA、签核范围。

**[不上图]** 不新增画布节点。

---

## C-384 · 8 席视觉改写只作展示字段

**[来源]** 用户 2026-11-04 选 C。

**[内容]** 8 席（MGT-001~003 + AGT-001~005）的改写保留为展示字段，仅进展示层：`display_name` / `avatar_ref` / `status`。**禁止进入 persona、preset、交办提示词、skill-subset。**

改写清单（12 处字段）：

| 席位 | 字段 | 原文 | 改写 |
| --- | --- | --- | --- |
| MGT-001 | alias | 天時 | 天时 |
| MGT-003 | title | CGOv | CGOV |
| AGT-001~005 | mission | 见 role-catalog | 见 registry |
| AGT-002/005 | personality | 见 role-catalog | 见 registry |

**[边界]** 不改写角色权威资产；不影响身份、权限、tier；不进入 agent 行为指令。

**[未解]** 展示字段 schema。

**[不上图]** 不新增画布节点。

---

## C-385 · 纸库著作权与可用范围

**[来源]** 用户 2026-11-04：「paper_to_skills 是我自己的，著作权是我，A（可直接使用）。」

**[内容]** 著作权人 = 用户。1,357 张卡文本可入册、公开、出货。**前提是 LICENSE / NOTICE 写明著作权人与授权范围。**

**[边界]** 不授权公开以下三类：第三方论文原文与图表（756 个 PDF、`papers/` 下 95 个 md）、内部客户数据、员工资料。卡内引用保留出处与许可说明。

**[未解]** LICENSE 文本选型；`playbook/` 1,357 页公开面处置。

**[不上图]** 不新增画布节点。

---

## C-386 · 只读边界：禁公网、只写事项工作区

**[来源]** 用户 2026-11-04 选 C。

**[内容]** pilot 工具面仅 `evidence_read` / `deterministic_validate` / `presentation` / `artifact_emit`。禁止 `action_intent_request` / `receipt_query` / `write` / `shell` / `web` / `jobs` / `workflow` / `delegation`。唯一写入面 = 事项工作区（case artifact store + append-only ledger）。数据仅离线证据包。**服务端 Policy Gate 强制，不靠提示词。**

**[边界]** 不授权任何外部业务动作；不授权实时数据接入。

**[未解]** 负向测试的具体用例。

**[不上图]** 不新增画布节点。

---

## C-387 · MGT 三席：T4 规则包，session_allowed=false

**[来源]** 用户 2026-11-04；`management-catalog.json` 现写 `runtime_agent_identity=true`。

**[内容]** MGT-001/002/003 = T4 决策权规则包 + 具名人类 owner 输入面。**只做内容/规则展示，`session_allowed=false`。** 不挂 session、不进 Case、不发 ActionIntent、无数据写。MGT-EVAL 改为规则有效性验证；R0 不再当出货前置。源仓三个 `runtime_agent_identity` 必须改 false。

**[边界]** 不撤销 3 席；不改变决策权归属；L2b / L4 只由真人。

**[未解]** 源仓回写。

**[不上图]** 不新增画布节点。

---

## C-388 · 53 席技能扩展入口

**[来源]** 用户 2026-11-04「为后续继续为 53 个专家添加 skill 留口子」。

**[内容]** 扩展口 = `role-assignments.json` 的 `source=add-on` 记录，含 `skill_id` / `seat` / `approved_by` / `note`。**不新增第七份映射层。**

三条规则：

| 场景 | 走哪条 |
| --- | --- |
| 技能属于岗位声明能力 | `skill-map`（改一次，多席继承） |
| 技能只是该席位的额外能力 | RA `source=add-on` |
| 同时给 ≥3 席使用 | **必须**走 `skill-map`（validator J3 禁止多席标 high） |

**[边界]** 不改 preset id、不改 53 席列表、不扩权限、不新增席位。

**[未解]** `skill-map.overrides` 的 quota 会静默裁掉不在 keep 名单的新 supply，需先修。

**[不上图]** 不新增画布节点。

---

## C-389 · AI组织变革 交接冻结前置

**[来源]** 用户 2026-11-04 决定提交并打 tag。

**[内容]** AI组织变革 当前工作树不干净。交接冻结前由源仓 owner 提交并打不可变 tag，tag 名与 commit sha 写入快照文件。Sanbao 快照必须 pin 该 tag / commit。不属于本次交付的改动先 revert 或归档，不得夹带。

**[边界]** Career 不代写源仓提交、不改 D-051、不替源仓决定 tag 语义、不授权生产。

**[未解]** tag 名与提交范围。

**[不上图]** 不新增画布节点。

---

## 决策索引

| 编号 | 主题 | 影响面 |
| --- | --- | --- |
| C-377 | 53 席定义 | 全局 |
| C-378 | A 方案 8 缺口 | 9 席 |
| C-379 | 九条责任句 | 文档 |
| C-380 | 准备预授权 | pilot |
| C-381 | 0.2.0-rc.2 基座 | 全局 |
| C-382 | pilot-only role_scope | 2 席 |
| C-383 | human owner layer_0 | 治理 |
| C-384 | 8 席展示字段 | 8 席 |
| C-385 | 纸库著作权 | 技能库 |
| C-386 | 只读边界 | pilot |
| C-387 | MGT 处置 | 3 席 |
| C-388 | 技能扩展入口 | 全局 |
| C-389 | 源仓冻结前置 | 跨仓 |
