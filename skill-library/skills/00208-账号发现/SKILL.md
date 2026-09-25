---
name: discover-store-accounts
displayName: 查找账号管理中的店铺和账号
displayDescription: 查询 AccioWork 账号管理中维护的店铺信息和账号信息。
description: 当需要查询用户在账号管理中维护的平台账号、登录状态和 Profile 选择信息，并用于各平台业务时使用。
version: 0.1.0
---

# 账号发现

凡向用户输出“设置 - 账号管理”引导，必须先读取 `references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

## 使用边界

在本轮任务尚未取得有效 `accounts[]`，或用户完成新增、重新登录并明确要求刷新账号列表时，调用本 Skill。

本轮任务已经取得有效结果，且账号管理没有发生变化时，直接复用同一次完整 `accounts[]`，不要按平台、店铺、账号或登录状态重复调用。

本 Skill 只负责调用账号发现 Tool 并交付实际返回的账号列表。目标账号选择、业务用途和登录门禁由上层流程处理。

`enable` 只表示本次调用取得的登录状态检查结果，不表示账号记录是否存在。上层在候选展示、目标匹配和目标确认阶段不得按 `enable` 过滤，必须先从完整候选中确定目标，再对全部目标统一执行登录门禁。

## 调用工具

`discover_store_accounts` 支持两种调用形态，上层必须先决定发现范围再调用：

```text
discover_store_accounts()
```

```json
{
  "name": "default_api:discover_store_accounts",
  "arguments": {
    "platformIdList": ["taobao", "tmall"]
  }
}
```

调用规则：

- 用户 query 未明确指定发品平台时，零参数调用 `discover_store_accounts()`，不要传 `platformIdList`。
- 用户 query 明确指定一个或多个平台时，必须传 `platformIdList`，其值是平台白名单的非空子集。
- `platformIdList` 只接受 `jd`、`pdd`、`dy`、`1688`、`taobao`、`tmall`。抖店/抖音必须映射为 `dy`，不得传 `douyin` 或 `doudian`。
- 不得传中文平台名、别名、空数组、未知平台，或素材包不支持的平台。
- 不得按店铺、账号或登录状态拆分调用；同一轮业务最多一次账号发现，后续复用同一次完整 `accounts[]`。

## 返回结构

工具调用成功后，解析返回的 JSON 字符串并读取 `accounts[]`。只接受可解析为对象且 `accounts` 为数组的响应。

```json
{
  "accounts": [
    {
      "platform": "pdd",
      "name": "示例旗舰店",
      "isMerchantBackendAccount": true,
      "platformId": "pdd",
      "platformName": "拼多多",
      "storeId": "store-uuid",
      "storeAccountId": "store-account-uuid",
      "account": "示**",
      "enable": true
    }
  ]
}
```

每条记录必须包含：

- `platform`：非空字符串，原有业务平台键，供 Router、业务策略和 DSL 生成使用。
- `name`：字符串，店铺名；买家账号可以为空。
- `isMerchantBackendAccount`：布尔值；账号类型为 `seller` 时为 `true`，`buyer` 或其他类型为 `false`。
- `platformId`：非空字符串，Profile 平台 ID。
- `platformName`：非空字符串，平台展示名称，仅用于用户展示和日志。
- `storeId`：非空字符串，店铺或账号归属的稳定 ID；同店主、子账号可以相同。
- `storeAccountId`：非空字符串，店铺账号绑定唯一 ID；同店主、子账号必须不同。
- `account`：非空字符串，按 L3 要求脱敏的平台账号，仅用于展示、区分账号和日志；不得还原、猜测、校验登录或用于 Profile 定位。
- `enable`：布尔值；`true` 表示本次登录状态检查通过，`false` 表示未通过。

`platformId + storeId + storeAccountId` 共同构成 Browser Profile 选择器。三个 ID 必须从同一条发现记录原样传递，缺一不可；`platformName`、`name` 和 `account` 不能代替任何 ID。

处理规则：

- `enable=false` 的记录仍是有效的已保存账号，必须保留在候选列表、目标匹配结果和用户可见清单中。
- 同平台同店铺名的主、子账号不得按 `name` 或 `storeId` 合并，使用 `storeAccountId` 区分。
- `discover_store_accounts` 成功返回后，立即丢弃顶层 `unsupportedPlatformIdList` 字段；后续逻辑只处理 `accounts[]` 及其账号记录。严禁读取该字段做分支或生成用户回复，严禁据此报告“不支持 XXX 平台”、“该平台不支持”或任何同义结论。
- `newAuthGray` 是可选顶层灰度元数据；当 `accounts=[]` 时，无论该字段是否存在或值为何，都不得改变空账号分支。`accounts=[]` 是有效结果，统一表示当前未配置账号，必须停止业务流程，并引导用户到“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）新增、配置并登录账号。**必须立即读取 `references/merchant-account-management.md` 并执行其回复契约（含运行辅助脚本展示四步图文教程）；严禁只输出纯文本引导。**
- 任一记录缺少字段或字段类型错误时，整个响应无效；不得丢弃异常记录后返回部分列表。
- 工具调用失败、无返回、JSON 无法解析或 `accounts` 不是数组时，说明查询失败；不得构造账号记录或回退到其他登录链路。

## 上层登录门禁

上层流程先从完整候选中确定本次目标账号，再复用同一次 `accounts[]` 汇总目标的 `enable`：

- 目标全部 `enable=true`：直接继续原业务流程。
- 目标同时存在 `enable=true` 和 `enable=false`：**自动跳过未登录目标、只用已登录目标继续，不追问、不停止**。只把 `enable=false` 项从本次执行范围中移出，其余执行、并发、重试和交付规则保持不变；把每个被跳过的目标记为登录缺口并保留到最终摘要。**禁止**为登录状态调用 `ask_user`，**禁止**把用户点名的未登录店铺静默换成同平台其它店铺。
- 目标全部 `enable=false`：列出全部未登录账号，可到“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）登录后重跑，停止业务流程并**立即读取 `references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。不再询问是否继续。

登录状态不是打断项：上层唯一允许因账号相关原因停止的情形是「目标全部 `enable=false`」「`accounts=[]`」和「查询失败 / 字段非法 / Profile ID 不完整」。写操作类技能（如 `excel-product-publish`）在自身 `SKILL.md` 中声明了更严格的确认口径时，以该技能为准。

被跳过目标的**记录位置**按两个时点区分，对外行为一致（都自动跳过、都逐条列明），不得混用：

- **生成计划前**（目标确定与登录门禁阶段）：该记录 `enable=false`、从未被锁定为目标 → **不写入**计划 `stores[]`，缺口只出现在进度提示与最终摘要。
- **写入计划后的执行前复检**：写入时 `enable=true`、执行层按 `storeAccountId` 恢复时变为 `false`（会话失效）→ **保留在**计划 `stores[]` 中，状态置 `login_failed` 后跳过该目标，其余目标继续；不得从计划中删除该项（删除会破坏 `batchIndex` 与分批一致性）。

用户可见的账号选择、登录提示、进度和最终摘要必须包含工具返回的脱敏 `account`：

- 商家账号：`platformName / name（account）`。
- 没有店铺名的买家账号：`platformName / 买家账号（account）`。

部分目标未登录时，使用以下格式一句话播报后**直接继续**（这是进度播报，不是追问，不等待用户答复）：

```text
本次执行：<平台 / 店铺名（脱敏账号）列表>。
已跳过（未登录）：<平台 / 店铺名（脱敏账号）列表>；可到“设置 - 账号管理”（[点击前往账号管理](accio://settings/account-management)｜[账号登录使用教程](https://acciowork.yuque.com/rfmg8t/ieb85b/achx4dk5s999qoa4#WGzMZ)）登录后重跑。
```

## Profile 参数恢复

目标跨阶段只保存同一条发现记录的 `storeId` 和 `storeAccountId`。调用 Browser Tool 前必须：

1. 从本轮同一次 `accounts[]` 中按 `storeAccountId` 全等匹配，且恰好命中一条记录。
2. 核对记录的 `storeId` 与目标保存值全等，并核对目标平台与记录的 `platformId`；抖店/抖音口径必须已归一为 `dy`，不得使用 `douyin` 或 `doudian`。
3. 将命中记录的 `platformId`、`storeId`、`storeAccountId` 原样传给 Browser Tool；任一字段缺失、不一致或匹配不唯一时停止，不得按店铺名或脱敏 `account` 猜选。

## 交付结果

- 作为上层流程的一部分调用时，将有效的完整 `accounts[]` 交给上层继续原任务，不单独生成冗余回复。
- 用户直接要求查看已保存账号时，展示 `platformName`、店铺名、脱敏 `account` 和账号类型；不要展示三个 Profile ID 或完整工具响应。
- `accounts=[]` 时，按“返回结构”的空账号规则处理。
- 查询失败时，说明账号信息查询失败，不将其表述为账号列表为空或用户未登录。
