---
name: excel-product-publish
displayName: 多平台商品上架
displayDescription: 根据用户填写的商品信息 Excel，将商品发布到目标店铺并汇报发品结果。
description: 根据已填写的商品上架素材包或商品信息 Excel，编排多平台、多店铺的商品发品任务。用于商品上架、批量商品上架、批量录入商品或创建商品发品任务；仅生成模板时使用 product-package-template，仅准备或校验数据时使用 excel-product-data。最终结果以商品发品成功或商品发品未成功为准。
version: 0.1.0
---

# 商品上架

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

## 不可违背的门禁

- 商品上架结果以商品发品成功或商品发品未成功为准，最终回复必须使用发品结果口径。
- 每次创建全新的 `<workspace>/product-data/<runId>`；只读取本次运行产物，不覆盖、复用或搜索其他运行目录。
- Agent 修改素材后，按以下具体条件决定是否重新生成数据；依据本次 `data.json` 中的实际路径和 Excel 元数据中的素材目录映射，不凭文件名或目录名猜测用途：

  1. 删除、移动或重命名了本次 `data.json` 已引用的文件，或对包含这些文件的目录执行了上述操作，导致原引用路径失效。
  2. 为本次上传新增素材：文件放入 Excel 元数据已映射、由数据准备阶段扫描的素材目录，或在 SKU 素材文件名单元格中填写了新文件名。
  3. 修改了本次商品在 Excel 中填写的素材文件名或素材包根路径。

  命中任一条件，不再使用修改前的 `data.json` 和计划执行受影响商品；已执行调用按现有事件与汇总规则处理，已有结果不覆盖。后续满足原有继续执行或重试条件时，从第 1 阶段开始，在全新 `<runDir>` 中从当前 Excel 和实际素材目录重新生成、校验数据，再依次完成店铺绑定与发品范围确认、计划生成。不得手工修补旧数据、修改旧计划或直接重放原 `browser_rpa_run` 调用。素材变更不改变现有禁止自动重试及状态未知的处理规则。仅改无关文件或在原路径覆盖文件内容，不触发本条重新生成要求。
- `partial` 默认整批暂停。只有用户已获知缺规格风险并明确要求继续时，才可使用 `--allow-partial`。
- `enum-value-not-allowed` 不属于协议错误；必须先用 `ask_user(mode="form")` 展示 Excel 修复建议并询问是否忽略继续。只有用户明确选择继续时，才可使用 `--allow-enum-warnings`。该参数不跳过店铺绑定，仍必须写入符合 `excel-product-publish.store-selections.v1` 的 `store-selections.json`。
- `execution_plan.json` 是登录态门禁和录入的唯一执行依据；不得手工增删、重排、合并或拆分计划步骤。`call.request` 及其 `dataPaths[]` 是不可解释的机器值（opaque strings）：必须从计划逐字符原样复制，保留全部空格、连续空格、中文、连字符、括号、标点和重复词段；不得根据商品名称或目录规律手输、补全、删减、改写、规范化或重建路径。
- 所有商品发品任务必须由当前主 Agent 直接完成；当前主 Agent 必须直接调用 `functions.browser_rpa_run` 执行商品录入。
- 同一 `lane` 严格串行。不同 `lane` 的并行只允许通过当前主 Agent 在同一轮直接发起多个 `functions.browser_rpa_run` 调用实现。工具返回后必须先保存最终事件，再推进该 `lane`。
- 严禁调用 `functions.sessions_spawn`。不得以并行执行、任务拆分、浏览器操作、耗时较长或上下文隔离为理由派出子 Agent。
- 超时、取消、响应无效或状态未知时不自动重试；不得通过重新执行制造重复商品风险。唯一例外是工具明确返回顶层 `code=BROWSER_RPA_RUN_DATA_READ_FAILED`、全部 item 均为 `BROWSER_RPA_RUN_NOT_STARTED`，且调用前参数核对证明实际传参曾偏离计划：此时必须重新读取计划、通过 `prepare_publish_call.py` 校验，并仅对修正后的同一 call 重试一次。参数原本与计划一致、无法证明浏览器未启动，或单次修正重试仍失败时立即停止。
- 汇总成功后以 `execution_result.json` 的计数和问题状态为准；计划、商品数据和已有事件只用于报告中的任务顺序与成功商品标识，不得覆盖或重算汇总结果。
- 阶段顺序不可跳过：第 1 阶段只做数据准备；`data_generation_result.json` 中的平台只表示素材包/商品数据已生成对应平台资料，是店铺绑定阶段的候选平台范围，不是用户确认的本轮实际发品平台；数据准备通过不代表已确认发品平台、店铺、商品范围或发品动作。第 2 阶段店铺绑定的第一步才是只读账号发现：先解析用户 query 是否明确指定平台并校验其属于素材包支持平台；若指定平台，调用一次 `discover_store_accounts(platformIdList=[...])`，若未指定平台，零参数调用一次 `discover_store_accounts()` 且不得传空数组；账号发现后再通过 `ask_user(mode="form")` 让用户确认本轮实际发品平台和发品店铺；不得先要求用户凭记忆填写店铺，不得把当前绑定店铺、默认店铺、历史店铺或上下文店铺当作本轮目标。
- 账号候选不得按 `enable` 过滤，面向用户统一展示“店铺名（脱敏账号）”；同平台存在多个候选店铺，或用户指定店铺无法唯一匹配时，必须使用 `ask_user(mode="form")` 提供候选店铺选项并要求用户选择发品店铺。不得让用户自由填空，不得默认全选；用户选择前不得生成执行计划。
- 普通对话不得替代 `ask_user(mode="form")`：可以进行只读探测和阶段说明，但探测结果一旦包含可被选作执行范围的候选目标，或需要用户确认、选择、澄清平台、店铺、商品范围、发品动作、登录态处理方式，必须立即使用 `ask_user(mode="form")` 承载这些待确认目标和信息。不得把“探路汇总”“信息咨询”“先列出真实情况”当作绕过表单的理由；不得先用普通文字、Markdown 表格、项目符号或“回复确认/确认发布到已就绪店铺”收集用户自然回复。
- `ask_user` 是发布确认门禁的唯一交互动作：出现多选一、唯一候选但禁止默认选择、账号不可用、平台无法闭环、商品范围需要确认、登录态处理需要用户决定、或最终发品确认时，下一步必须是实际调用 `ask_user(mode="form")`，而不是先解释背景、给建议或等待用户自然回复。表单必须承载必要背景和选择项，包括实际发品平台、店铺/账号、对象范围、发品动作，以及异常账号的处理方式（跳过、更换账号、停止或确认已有登录态）。受 `ask_user` 每题 2-6 个 option 限制时，必须拆成多道表单题或多次表单：先确认实际发品平台，再逐平台确认店铺，最后确认商品范围/发品动作/登录态处理；不得为了塞入“全部/全选”而省略逐项平台或店铺选项。
- 禁止“声明会调用但未调用”的空话：如果回复中出现“现在/立即/接下来调用 `ask_user`”等表述，下一条动作必须是实际工具调用；如果当前环境没有可调用的 `ask_user` 工具，必须明确说明工具不可用并使用当前环境最接近的阻塞式确认机制，不得伪装已经调用。
- 所有商品上架目标都必须来自同一次完整 `discover_store_accounts` 结果，并携带同条记录的 `storeId/storeAccountId`；目标账号 `enable=false` 时，必须使用 `ask_user(mode="form")` 询问用户是前往“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）手动登录并停止本次运行，还是确认浏览器已有登录态并继续执行。所有待确认目标和信息都必须通过 `ask_user(mode="form")` 展示并确认，包括本轮平台、店铺（店铺名 + 脱敏账号）、商品数量/范围、发品动作和登录态处理选择；不得提供“确认发布到全部已就绪店铺”这类默认批量确认入口，除非同一表单中逐项列出目标并要求用户显式选择。用户确认前不得生成执行计划或调用浏览器。

任一门禁无法满足时停止受影响的流程，保留原始错误，并说明当前阶段、实际状态和下一步。

发布类任务状态机：`DISCOVERED_CONTEXT -> NEED_USER_CONFIRMATION -> ASK_USER_CALLED -> USER_CONFIRMED -> EXECUTE_ACTION -> VERIFY_RESULT`。当状态为 `NEED_USER_CONFIRMATION` 时，唯一允许的下一步是实际调用 `ask_user(mode="form")`；不得输出普通解释性聊天内容来替代工具调用。

## 用途

本 Skill 使用 `excel-product-data` 准备商品数据，使用 `discover-store-accounts` 确认商品上架目标并完成 Profile 登录态门禁，再按固定计划调用 `browser-rpa-run`。每次执行结果写入不可覆盖的事件，最后由确定性脚本汇总。

| 用户任务 | 路由 |
|---|---|
| 生成空白商品上架模板或素材包 | 使用 `product-package-template` |
| 只准备或校验商品数据 | 使用 `excel-product-data` |
| 根据已填写 Excel 执行商品发品 | 使用本 Skill |

输入必须是当前环境可访问的商品上架素材包目录或商品信息 Excel。输入定位、表格解析和素材校验遵循 `excel-product-data`。

## Workflow 总览

进入本 Skill 后严格按以下 Gate 顺序执行；当前 Gate 未通过时不得进入下一 Gate。

```text
输入与路由 -> 数据准备 -> 店铺绑定 -> 计划生成 -> lane 执行与事件保存 -> 汇总与报告
```

| Gate | 输入与资源 | 动作 | 产物与通过条件 | 未通过时 |
|---|---|---|---|---|
| 1. 数据准备 | 商品上架素材包或 Excel；`excel-product-data` | 创建全新 `<runDir>` 并准备、校验数据 | `data_generation_result.json` 属于本次运行且协议有效 | 停止，不查询店铺或调用浏览器 |
| 2. 店铺绑定 | 有效数据结果；[数据与店铺选择](references/data-and-store-selection.md) | 从商品数据提取素材包支持的候选平台范围；在本阶段先一次查询全部候选账号以明确可供用户选择的平台和店铺；所有待确认目标和信息都必须用 `ask_user(mode="form")` 展示并确认，包括实际发品平台、发品店铺、商品范围、发品动作和 `enable=false` 登录态处理选择 | `store-selections.json` 通过严格校验 | 停止，不生成执行计划 |
| 3. 计划生成 | 数据结果和店铺选择；[执行计划契约](references/execution-plan.md) | 只调用一次计划脚本 | `execution_plan.json` 有效且 `execution_events/` 新建并为空 | 停止，不手工构造或修改计划 |
| 4. lane 执行 | 唯一执行计划；[lane 规则](references/lane-execution.md) 与 [事件契约](references/event-contract.md) | 当前主 Agent 直接调度 `functions.browser_rpa_run`：同一 lane 串行、不同 lane 可同批多次调用；失败结果以 `reportPath` 指向的 `report.json.errors[]` 生成 `errors[]`；严禁 `functions.sessions_spawn` 或派子 Agent；每步先保存最终事件再推进 | 每个 lane 完成，或在有最终事件的明确步骤停止 | 停止受影响 lane，不补事件或自动重试 |
| 5. 汇总与报告 | 执行计划和已有事件；[汇总规则](references/result-reporting.md) 与 [报告模板](references/publish-status-report-template.md) | 只汇总一次，并按模板直接生成 Markdown 报告 | `execution_result.json` 有效且最终报告通过生成前校验 | 不手工汇总或重新调用浏览器；按报告规则安全降级 |

## 执行流程

### 1. 创建运行目录并准备数据

按当前时间生成 `YYMMDD-HHmmss` 格式的 `<runId>`。若目录重名，在 `<runId>` 后追加递增序号；不得覆盖或复用已有目录。

执行数据准备前，必须使用文件读取工具读取 [`../excel-product-data/SKILL.md`](../excel-product-data/SKILL.md) 全文并遵循其流程。`excel-product-data` 已随插件打包但未暴露在 `plugin.json.skillIds`，因此无法通过 Skill 发现或 Read Skill 加载；不得将其误判为未安装，也不得以浏览脚本代替读取该 `SKILL.md`。

将 `excel-product-data` 的产物目录指定为 `<runDir>`，取得本次新生成的 `data_generation_result.json`。按 [数据与店铺选择](references/data-and-store-selection.md) 校验结果并处理 `ready`、`partial`、`failed`。

通过条件：结果文件属于本次运行、可解析且通过协议校验。无效结果直接停止，不查询店铺、不生成计划、不调用浏览器。

### 2. 确认平台与店铺绑定

进入店铺绑定阶段后，从本次 `data_generation_result.json` 提取素材包支持的候选平台范围 `supported`，再解析用户 query 的发品平台意图 `intent.platformIds`。平台 ID 只允许 `jd/pdd/dy/1688/taobao/tmall`；抖店/抖音统一映射为 `dy`，不得使用 `douyin` 或 `doudian`。若用户指定的平台不在 `supported` 中，立即停止并说明“用户指定的平台不在本次素材包可支持的平台中”。若用户明确指定平台，发现范围 `scope=intent.platformIds`，调用一次 `discover_store_accounts` 时必须传 `platformIdList=scope`，且它必须是白名单的非空子集；若用户未指定平台，`scope=supported` 仅用于候选过滤，但账号发现必须零参数调用 `discover_store_accounts()`，完全不传 `platformIdList`，不得传 `platformIdList: []`。

`data_generation_result.json` 的平台不得直接命名为“待上架平台”或“本轮实际发品平台”；它只限定候选平台范围，不代表用户已选择这些平台发品。账号发现是第 2 阶段的只读候选查询，不是整个发品流程的第 1 阶段，不代表确认或使用任何店铺执行；数据准备通过也不代表已确认发品平台、已授权生成计划、录入商品或提交上架。账号发现完成后，如果存在任何候选目标、待确认目标或待确认信息，必须直接进入 `ask_user(mode="form")`；不得用普通对话把候选列表当作“探路汇总”“信息咨询”或非正式确认问题。不得用当前绑定店铺、默认店铺、历史店铺、历史账号、路由前注入信息或上下文信息替用户决定本轮实际发品平台或店铺。实际发品平台选择必须优先作为独立表单题处理：若用户 query 已明确指定平台，表单仍需展示并确认这些平台；若用户未指定平台，平台选项只列 `supported` 中具体平台，不额外提供“全部/全选”；若未来候选平台超过 6 个，必须按稳定顺序分批展示 2-6 个具体平台选项并累积用户选择，最后再用表单汇总确认，不得用普通对话或单个“全部”选项替代逐项选择。随后按 [数据与店铺选择](references/data-and-store-selection.md) 的候选过滤和匹配矩阵逐平台确认实际发品目标。`enable=false` 不是候选过滤条件；必须先保留并展示全部目标的“店铺名（脱敏账号）”。同平台只有一家候选且用户未指定店铺时可以默认作为候选绑定，但仍必须在生成执行计划前通过 `ask_user(mode="form")` 展示并确认本轮平台、店铺（店铺名 + 脱敏账号）、商品数量/范围和发品动作；表单中的账号展示必须使用同一次发现结果的 L3 脱敏 `account`，不得展示原始邮箱、手机号或未脱敏账号；同平台存在多家候选，或用户指定店铺无法唯一匹配时，必须使用 `ask_user(mode="form")` 以候选店铺作为选项并要求用户选择发品店铺；不得让用户自由填空，不得默认全选，用户选择前不得写入 `<runDir>/store-selections.json`。

目标店铺确定后，检查同条账号记录的 `enable`。`enable=true` 直接通过登录态门禁；`enable=false` 时必须使用 `ask_user(mode="form")` 询问用户是前往“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）手动登录并停止本次运行，还是确认浏览器已有登录态并继续执行。用户选择继续时，后续登录事件来源为 `user`；用户选择手动登录、取消或未作明确选择时停止，不生成执行计划或调用浏览器。`source=user` 的依据只在本次连续运行的店铺绑定到 lane 执行阶段有效；如果执行阶段无法确认本轮 `ask_user(mode="form")` 结果，必须按未确认继续处理并停止受影响目标。只有查询成功、每个未明确跳过的平台都有目标账号、完成全部必要店铺选择和登录态确认后，才能写入 `<runDir>/store-selections.json`。

通过条件：本轮实际发品平台只来自用户通过 `ask_user(mode="form")` 的明确确认；用户明确跳过的平台不得写入执行绑定。每个实际发品平台都已绑定账号管理中的具名账号；每个绑定都包含 `storeId/storeAccountId`，且选择文件通过严格字段约束。

### 3. 生成唯一执行计划

必须先运行 `scripts/build_publish_plan.py --help` 并以本次 help 输出确认参数名，再按 [执行计划契约](references/execution-plan.md) 调用一次计划脚本。不得凭经验、语义猜测或旧记忆构造参数；脚本失败时停止，不得手工构造、补写或修改计划。首次使用前运行 `scripts/prepare_publish_call.py --help`；每次浏览器调用前执行对应 `callId` 的只读预检，以脚本输出的完整 `request` 作为本次工具参数真源；不得从上下文或相邻路径重建。

通过条件：`execution_plan.json` 新生成且有效，`execution_events/` 新建并为空。

### 4. 执行 lane 并保存事件

按 [lane 执行与停止规则](references/lane-execution.md) 分批调度。登录态门禁复用店铺绑定阶段的同一次完整 `discover_store_accounts` 结果：只按计划 `storeAccountId` 精确恢复记录并核对 `storeId/platformId`。命中记录 `enable=true` 时写入 `confirmed/source=tool`；命中记录 `enable=false` 且本次连续运行中已有用户通过 `ask_user(mode="form")` 确认浏览器已有登录态并继续时，写入 `confirmed/source=user`；其他身份缺失、不一致或未确认继续的情况停止受影响目标。调用 `browser_rpa_run` 时，把同条记录的 `platformId/storeId/storeAccountId` 放在工具顶层。录入工具遵循对应 Skill 的响应校验规则；对失败结果，若实际返回非空 `reportPath`，先调用 `scripts/extract_rpa_report_errors.py` 读取该 `report.json` 的 `errors[].stepId` 与 `errors[].message`，再把脚本输出的 `errors[]` 写入事件；不得保存或沿用工具响应原本的粗粒度失败摘要；不得把 `reportPath`、`outputsPath`、`issueSummary` 或 `retentionMessage` 写入事件。随后按 [事件契约](references/event-contract.md) 保存每个实际步骤或当前停止步骤的最终事件。

调度边界：所有商品发品任务必须由当前主 Agent 直接完成；当前主 Agent 必须直接调用 `functions.browser_rpa_run` 执行商品录入。不同 lane 的并行通过同一轮直接发起多个 `functions.browser_rpa_run` 调用实现。严禁调用 `functions.sessions_spawn`；不得以并行执行、任务拆分、浏览器操作、耗时较长或上下文隔离为理由派出子 Agent。若工具接口或当前环境不支持同批多次调用，则安全降级为主 Agent 串行执行。

通过条件：每个 `lane` 已完成或在一个有最终事件的明确步骤停止；停止步骤之后不存在该 `lane` 的后续事件。

### 5. 汇总并回复

全部 `lane` 完成或停止后，必须先读取 [汇总与最终回复](references/result-reporting.md)，再运行 `scripts/result_to_report.py --help`，并以该 reference 和本次 help 输出确认参数名与必需参数后，只调用一次汇总脚本。不得凭经验、语义猜测、旧记忆或前序脚本参数类推构造参数；缺少 `--data-result`、`--plan`、`--events-dir` 或 `--result-out` 任一参数时不得执行汇总命令。汇总成功后加载 [商品上架状态报告模板](references/publish-status-report-template.md)，直接生成 Markdown 最终回复。

通过条件：命令成功，本次 `<runDir>/execution_result.json` 存在并可解析，最终报告通过模板的生成前校验。汇总失败时不修改事件、不手工汇总、不自动重试浏览器。

## 资源导航

按当前阶段加载资源，不要一次性读取全部 references。

| 资源 | 何时加载 |
|---|---|
| [商品上架数据生成 Skill](../excel-product-data/SKILL.md) | 数据准备前使用文件读取工具读取全文；不依赖 Skill 发现或 Read Skill |
| [数据与店铺选择](references/data-and-store-selection.md) | 校验数据状态、处理 `partial`、发现和绑定店铺时 |
| [执行计划契约](references/execution-plan.md) | 调用计划脚本或解释 lane/target/call 结构时 |
| [lane 执行与停止规则](references/lane-execution.md) | 调度登录态门禁与录入、处理取消、超时或工具不可用时 |
| [事件契约](references/event-contract.md) | 将工具响应转换为登录或调用事件时 |
| [汇总与最终回复](references/result-reporting.md) | 生成并校验 `execution_result.json` 时 |
| [商品上架状态报告模板](references/publish-status-report-template.md) | 汇总成功后生成最终用户回复时 |
| [异常排查](references/troubleshooting.md) | 仅在事件缺失、事件无效或汇总脚本失败时 |

脚本作为整体直接使用：每次调用 `scripts/build_publish_plan.py` 或 `scripts/result_to_report.py` 前，必须先读取当前阶段对应 reference，再运行同一脚本的 `--help`，并以本次 reference 与 help 输出共同确认参数名和必需参数。不得用直觉、通用习惯、旧报错、旧记忆或其他脚本参数名猜测参数；不得把前一阶段脚本参数迁移到后一阶段，例如不得因数据准备使用 `--out` 或计划生成使用 `--plan-out`，就推断汇总脚本也接受 `--out`。不得在未完成 reference + help 探测时调用业务命令。不要为了普通调用读取源码。

手写 `store-selections.json` 时，必须先回读 [数据与店铺选择](references/data-and-store-selection.md) 的“选择文件契约”，按示例写入后立即用计划脚本校验；不得把 `discover_store_accounts` 返回字段直接搬成选择文件字段。

计划脚本通过拒绝已有计划或非空事件目录防止覆盖，汇总脚本只允许写入受控的本次结果路径。

| 脚本 | 作用 |
|---|---|
| `scripts/build_publish_plan.py` | 校验数据和店铺选择，原子生成计划与空事件目录 |
| `scripts/prepare_publish_call.py` | 只读定位一个 `callId`，验证计划中的全部数据文件，并输出必须逐字符原样传给 `browser_rpa_run` 的完整 `request`；不写文件、不调用浏览器 |
| `scripts/extract_rpa_report_errors.py` | 从失败 RPA 的 `report.json.errors[]` 提取可写入事件的 `errors[].stepId` 与 `errors[].message`；`--report-path` 必须从工具结果的 `reportPath` 字段原样复制，禁止手动重打或改写路径中的随机 run 目录名；若因路径不存在失败且报错含 `did you mean:` 建议路径，核对后用建议路径重试一次 |
| `scripts/result_to_report.py` | 校验计划和已有事件，原子生成最终汇总 |
| `scripts/publish_contract.py` | 前两个 CLI 共用的内部协议库，不直接调用 |

## 输出契约

本次运行只允许在 `<runDir>` 中产生以下业务产物：

```text
data_generation_result.json
products/
store-selections.json
execution_plan.json
execution_events/
execution_result.json
```

最终回复必须：

- 遵循 [商品上架状态报告模板](references/publish-status-report-template.md) 的字段来源、任务筛选、状态规则和生成前校验。报告格式采用中等自由度，可调整标题、措辞、段落顺序或合并重复内容，但不得省略关键信息或改变计数、成功条件和发品结果边界。
- 最终报告必须直接以 Markdown 输出并遵循模板。
- 只汇报 `savedComplete + unknown > 0` 的平台-店铺任务；已尝试为 `0` 的任务及其商品不进入报告。
- 计数和问题状态只取自 `execution_result.json`；计划、商品数据和已有事件只补充任务顺序与成功商品标识。
- 商品标识使用 `productId`。只有明确满足成功条件的商品可以说明“商品发品成功”；`unknown` 必须说明“商品发品未成功”。
- 不展示未执行商品、`unassignedItems[]`、内部状态名、内部问题码、`dataPath`、运行 ID、DSL、JSON、日志或报告路径。
- 对未成功结果提示检查对应平台和店铺的商品发品状态，但不自动重试。
- 明确区分商品发品成功和商品发品未成功。

## 边缘情况

| 风险 | 可见症状 | 安全动作 | 停止条件 |
|---|---|---|---|
| 数据结果无效 | 文件缺失、不可解析或协议校验失败 | 保留原始错误并检查本次输入 | 不生成计划或调用浏览器 |
| Excel 下拉值不匹配 | `issues[].code=enum-value-not-allowed`，常带 `rawValue`、`column`、`suggestion` | 按实际字段生成 Excel 修复建议，并用 `ask_user(mode="form")` 询问是否忽略继续 | 用户选择先修复或未明确继续时不生成计划；用户确认继续后可生成计划 |
| `partial` 未获授权 | `summary.failed > 0` | 完整说明 `issues[]`，引导修复 Excel | 用户未明确承担缺规格风险 |
| 店铺查询失败 | 工具调用失败或响应无效 | 报告查询阶段和原始错误 | 不写 `store-selections.json` |
| 账号为空 | 仍有未跳过的平台，但 `accounts=[]` 或目标平台没有商家账号 | 停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。 | 不生成执行计划 |
| 店铺选择歧义 | 多家候选或指定店铺无法精确匹配 | 使用“店铺名（脱敏账号）”一次询问一个明确选择 | 不自动选择其他账号 |
| 工具不可用 | 调度前已确认对应工具不可调用 | 按 lane 当前步骤记录 `not_started` | 已发起的调用仍按实际结果处理 |
| 计划路径预检失败 | `prepare_publish_call.py` 报文件不存在、不可读、非法 JSON 或 call 不唯一 | 保留原始计划，不搜索相似路径、不手改字符串；记录当前 call `not_started` | 不调用浏览器并停止 lane |
| 调用参数偏离计划 | `DATA_READ_FAILED` 且全部 item 明确 `NOT_STARTED`，逐字符串比较发现实际 `dataPaths` 与磁盘计划不同 | 重新读取计划并通过预检，仅对修正后的同一 call 重试一次 | 参数原本一致、无法证明未执行或单次修正重试失败时停止 |
| 事件缺失 | 实际步骤返回后没有对应最终事件 | 立即停止对应 lane | 不补事件、不重试、不推进后续步骤 |
| 汇总失败 | 命令非零退出或结果文件无效 | 已调用浏览器时提示检查商品发品状态；未调用时说明未执行 | 不手工计算或自动重跑 |
