---
name: alibaba-global-product-migration-entry
description: |
  搬品入口与任务管理。负责搬品意图识别、预检查、物流模版选择、币种确认、搬品模式判定、恢复历史任务、取消任务。
  本 Skill 是搬品流程的总调度中心，完成所有前置准备后，将参数传递给 alibaba-global-product-migration-executor 执行实际搬品任务。
  When to use:
    - 用户想把其他平台的商品发布/搬运/迁移到 Alibaba 国际站（如"帮我把1688商品搬到国际站"、"I want to publish products on Alibaba.com"）
    - 用户上传了商品文件（Excel/CSV/PDF）并希望将其发布到国际站
    - 用户提供了站外商品链接并希望搬到国际站
    - 用户提供了 Shopify 的 API Key/Secret 并希望将 Shopify 商品搬到国际站
    - 用户希望恢复或继续之前未完成的搬品任务（如"继续昨天的搬品"、"恢复搬品任务"）
    - 用户希望取消正在运行的搬品任务
  Skip for:
    - 店铺内已有商品的优化治理 → 使用 alibaba-global-product-optimize
    - 纯咨询如何发布商品但无实际搬品意图
    - 已在国际站的商品编辑修改
    - 搬品任务已创建，正在执行中的操作 → 使用 alibaba-global-product-migration-executor
    - 搬品优化完成后的发布操作 → 使用 alibaba-global-product-publish
workflow: |
  1. 意图识别：判断用户是新搬品、恢复任务还是取消任务
  2. 预检查：调用 ggs_migration_pre_check 检查容量
  3. 物流模版选择：查询并展示物流模版供用户选择
  4. 币种确认：快速推断币种并等待用户确认
  5. 搬品模式判定：根据数据来源确定 productFrom
  6. 将所有参数传递给 alibaba-global-product-migration-executor
enabled: true
metadata:
  author: GGS
  version: "3.0.0"
---

> **⚠️ 严格执行模式（Strict Execution Mode）**
>
> 进入本 Skill 后，Agent 必须切换到严格执行模式：
> - **只做 Skill 定义的动作**：严格按流程执行，不得跳步、插入额外步骤
> - **MCP 调用失败 = 流程终止**：任何 MCP 工具调用失败，立即返回错误信息给用户
> - **不做多余解释**：每轮只输出必要信息
> - **🚫 严禁私自简化**：不得省略、合并、跳过本 Skill 定义的任何步骤

搬品入口与任务管理 Skill。负责搬品意图识别、预检查、物流模版选择、币种确认、搬品模式判定。完成后将参数传递给 `alibaba-global-product-migration-executor` 执行实际搬品任务。

## 核心规则（不可跳过）

1. **只做跨平台搬品**：本 Skill 仅覆盖站外商品到 Alibaba 国际站的搬运场景。
2. **预检查前置**：一旦识别到用户有搬品意图，**立即调用 `ggs_migration_pre_check`** 检查 photobank 和草稿箱容量，不要等到发布前才检查。
3. **交互效率优先**：每轮对话只传递必要信息，不做冗余解释或重复确认。能合并的步骤合并执行，能自动推断的参数不追问用户。
4. **语言适配**：Agent 输出必须使用用户当前使用的语言。
5. **MCP 调用失败直接终止**：任何 MCP 工具调用失败时，**立即将错误信息返回给用户，不尝试替代方案、不自行重试、不绕道执行**。
6. **所有工具通过 MCP 调用**：参数定义见 `./references/tools-openapi.md`。
7. **预估商品数量与预检查**：在开始搬品前，必须粗略预估商品数量。若超过 20 个，直接阻断。调用 `ggs_migration_pre_check` 时，`productCount` 参数固定传 20。
8. **originSite 传值规则**：当 `productFrom` 为 `API` (Shopify API 搬品) 时，`originSite` 参数固定传 `SHOPIFY`；其他模式下不传该参数。
9. **Shopify 凭证引导**：当用户选择 Shopify API 搬品但未提供凭证时，引导用户参照 `./references/shopify-admin-api-credentials-guide.md` 获取 Store URL 和 Admin API Access Token。
9. **🚫 币种确认强制门禁（HARD BLOCKER — 与物流模版同等强硬）**：调用 `start_ggs_product_migration` 前，Agent **必须**完成以下币种确认流程，缺一不可：
    - **快速推断**：根据数据来源（Excel 列名/货币符号、1688→CNY、Amazon 站点→对应币种等）快速推断原始数据币种，耗时不超过 5 秒
    - **用户确认**：将推断结果展示给用户，等待用户明确确认或修正。**禁止跳过确认、禁止默认选择、禁止自动使用推断结果**
    - **格式校验**：币种必须为 **ISO 4217 三位大写字母**（如 `USD`、`CNY`、`EUR`、`JPY`、`GBP`），不接受其他格式
    - **传参**：用户确认后的币种传入 `start_ggs_product_migration` 的 `currency` 参数。**若未传 `currency`，后端默认按 `USD` 处理**，可能导致价格数据错误
    - **禁止跳过**：即使 Agent 认为币种"显而易见"（如 1688 肯定是 CNY），也**必须展示推断结果并等待用户确认**
10. **🚫 防私自简化红线**：
    - **禁止跳过物流模版步骤**：物流模版查询和用户选择是必经步骤，不得自动跳过或默认选择
    - **禁止跳过币种确认步骤**：币种推断和用户确认是必经步骤（与物流模版同等强硬），不得自动跳过
11. **🚫 严禁私自轮询红线**：一旦确认开始搬品后，**必须立即**将搬品任务创建和任务追踪逻辑交由 `alibaba-global-product-migration-executor` Skill 处理。**绝对禁止**使用 `sessions_spawn` 发起子任务进行轮询。
---

## ▶ 恢复历史任务（断点续传）

当用户表达"继续搬品"、"恢复任务"或类似意图时，Agent 无需从头开始，直接执行断点续传：
1. **定位上下文**：寻找工作区内最近的搬品 CSV 文件及 `taskId`（若上下文中没有，可询问用户提供）。
2. **判断进度与无缝衔接**：
   - 读取 CSV，若 `after.title` 等优化后字段全为空，说明任务停留在 **解析完成，待优化**。Agent 应将控制权交给 `alibaba-global-product-migration-executor`，从数据预览步骤开始。
   - 若 CSV 中 `after.title` 等字段已有值，说明任务停留在 **优化完成，待发布**。Agent 应将控制权交给 `alibaba-global-product-publish`，从发布步骤开始。

---

## ▶ 取消任务

当用户表达"取消搬品"、"停止任务"或类似意图时：
1. 确认用户确实要取消（简短确认即可）
2. 调用 `ggs_cancel_migration_task` 取消任务
3. 展示取消结果

**⚠️ 任务冲突处理**：若 `start_ggs_product_migration` 返回错误码 `ALREADY_HAS_RUNNING_TASK`，说明用户正在运行的搬品任务已经达到阈值，Agent 必须询问用户是否需要取消老任务：
> 🚫 **任务冲突**
> 您正在运行的搬品任务已经达到阈值，无法再开启新任务。
> - **「取消老任务，开始新搬品」** → 取消现有任务后重新开始
> - **「查看现有任务进度」** → 查询当前任务状态
> - **「放弃本次操作」** → 不做任何操作

---

## ▶ 商品数量评估 & 预检查 & 物流模版选择 & 币种确认（识别意图即执行）

> **🚨 数量上限门禁（HARD BLOCKER）**：在开始搬品前，Agent 必须首先预估/检查用户提供的文件或链接中的商品总数。**如果预估商品数量 > 20 个，必须立即阻断流程**，并明确提示用户："当前系统不支持单次超过 20 个商品的搬品发布，请将文件拆分或减少商品数量后重试。" 绝对禁止继续后续步骤。

当用户表达搬品意图且商品数量 ≤ 20 时，**立即**调用 `ggs_migration_pre_check`，`productCount` 参数**固定传 20**。若容量不足，告知瓶颈并建议解决方案（清理草稿箱/升级空间）。容量充足才继续后续步骤。

预检查通过后，**并行执行两件事**：
1. 调用 `query_ggs_merchant_shipping_template` 查询商家可用的物流模版列表
2. **快速推断原始数据币种**（见下方推断规则）

### 币种快速推断规则

> **⚠️ 核心原则**：Agent 必须快速推断，不要耽误流程。推断完成后必须给用户确认。币种格式为 **ISO 4217 三位大写字母**（如 `USD`、`CNY`、`EUR`、`JPY`、`GBP`）。

| 数据来源 | 推断方法 | 预期耗时 |
|---------|---------|----------|
| **Excel 文件** | 快速扫描前 3-5 行数据：① 检查是否有名为"币种"/"currency"/"货币"的列，有则直接取值；② 若无币种列，检查价格列中是否包含货币符号（`¥`→CNY、`$`→USD、`€`→EUR、`£`→GBP）；③ 均无线索则默认推断 `USD` | < 5s |
| **1688 URL** | **固定推断 `CNY`**（1688 为人民币平台） | 即时 |
| **Amazon URL** | 根据站点域名推断：`.com`→`USD`、`.co.jp`→`JPY`、`.co.uk`→`GBP`、`.de`/`.fr`/`.it`/`.es`→`EUR`、`.ca`→`CAD`、`.com.au`→`AUD` | 即时 |
| **Shopee URL** | 根据站点推断：`.sg`→`SGD`、`.co.th`→`THB`、`.com.my`→`MYR`、`.co.id`→`IDR`、`.vn`→`VND`、`.ph`→`PHP`、`.com.br`→`BRL` | 即时 |
| **Shopify API** | 从 Shopify API 返回的商品数据中的 `currency` 字段获取 | 即时 |
| **其他 / 无法判断** | 默认推断 `USD` | 即时 |

> **🚨 强制阻断门禁（HARD BLOCKER）**：物流模版选择和币种确认是**两个强制暂停点**。Agent 必须将物流模版列表和推断的币种**一起展示给用户**，并**强制使用结构化菜单等待用户回复**。在用户未确认物流模版和币种前，**绝对禁止**将参数传递给 `alibaba-global-product-migration-executor`。

Agent 必须输出以下交互菜单：
> 📦 **可用物流模版**
> 1. [模版A名称] (ID: xxx)
> 2. [模版B名称] (ID: xxx)
> 
> 💱 **原始数据币种确认**
> 我根据您的数据推断原始币种为：**[推断的币种，如 CNY]**（推断依据：[简要说明，如"1688 平台默认人民币"]）
> 如果不正确，请告诉我正确的币种（ISO 4217 三位大写字母，如 USD、EUR、JPY）
> 
> 🔧 **请选择下一步操作**
> - **「开启一键搬品，使用模版 [名称/序号]，币种确认 [币种]」** → 自动完成解析和默认优化，直接生成最终发布预览（推荐）
> - **「常规搬品，使用模版 [名称/序号]，币种确认 [币种]」** → 逐步确认解析和优化结果
> - **「跳过物流，常规搬品，币种确认 [币种]」** → 暂不设置物流，逐步确认
> - **「币种改为 [XXX]」** → 修正币种后继续

---

## ▶ 搬品模式判定（Mode Decision）

> **⚠️ 此判定为强制前置步骤**，Agent 必须在将参数传递给 executor 之前完成模式判定，确定 `productFrom` 的值。

### 判定决策树

```
用户表达搬品意图（预检查 & 物流模版选择 & 币种确认已完成）
  │
  ├─── 📄 用户上传了 Excel/CSV/PDF 文件
  │      │
  │      ├── 检查行数：Agent 必须立即读取文件，统计数据行数（排除表头）
  │      │     └── 行数 > 20 → 🚫 直接拒绝
  │      │
  │      └── 行数 ≤ 20 → ✅ productFrom = `SMART_FILE`（云端解析）
  │           上传原文件到 OSS，由云端解析
  │
  ├─── 💬 用户输入了文字（非文件上传）
  │      │
  │      ├── 文字中包含 URL
  │      │     │
  │      │     ├── URL 属于 1688 或 Amazon
  │      │     │     ├── URL 为商品详情页 → ✅ productFrom = `PDP`（云端解析）
  │      │     │     └── URL 为店铺首页   → ✅ productFrom = `STORE`（云端解析）
  │      │     │
  │      │     └── URL 属于其他平台（Shopee、独立站、Temu 等）
  │      │           → 首先尝试 `PDP` 或 `STORE`（云端解析）
  │      │           → 若云端拉取阶段失败，降级为 `FILE`（本地兜底模式）
  │      │
  │      └── 文字中不含 URL → 判断是否为 Shopify API 搬品意图
  │            ├── 用户提供了 Shopify AK/SK → ✅ productFrom = `API`
  │            └── 其他情况 → 询问用户提供数据源
  │
  └─── 🔑 用户提供了 Shopify API Key/Secret
         → ✅ productFrom = `API`（Shopify 流程不变）
```

### URL 平台识别规则

| 平台 | URL 特征（域名匹配） | 搬品模式 |
|------|---------------------|----------|
| **1688** | `1688.com`、`detail.1688.com`、`shop*.1688.com` | 云端：`PDP`（详情页）或 `STORE`（店铺页） |
| **Amazon** | `amazon.com`、`amazon.co.jp`、`amazon.co.uk`、`amazon.de` 等各站点 | 云端：`PDP`（详情页）或 `STORE`（店铺页） |
| **Shopee** | `shopee.com`、`shopee.sg`、`shopee.co.th` 等 | 先尝试云端，失败则降级 `FILE` 兜底 |
| **Temu** | `temu.com` | 先尝试云端，失败则降级 `FILE` 兜底 |
| **独立站 / 其他** | 不匹配上述任何域名 | 先尝试云端，失败则降级 `FILE` 兜底 |

> **PDP vs STORE 判断**：
> - **PDP（商品详情页）**：URL 路径中包含商品 ID、`/offer/`、`/dp/`、`/product/` 等商品详情特征
> - **STORE（店铺首页）**：URL 路径为店铺根路径、包含 `/shop/`、`/store/` 等店铺特征，或用户明确表示"全店搬"

### FILE 兜底模式（Fallback）

> **FILE 不是首选模式，而是兜底手段。** 仅在以下场景触发：

| 触发场景 | 说明 |
|---------|------|
| **云端解析失败降级** | `start_ggs_product_migration` 以 `PDP`/`STORE` 模式创建任务后，在拉取阶段返回失败（如目标网站反爬、无 Sitemap、超时等），Agent 应提示用户可以改用 FILE 兜底模式 |
| **非 1688/Amazon URL 且无 Sitemap** | 用户提供的 URL 属于 Shopee、Temu、独立站等平台，且云端无法解析时 |

**云端解析失败时的降级交互**：当 `start_ggs_product_migration` 在拉取阶段返回失败时，Agent 必须输出以下提示：
> ⚠️ **云端解析失败**
> 错误信息：[展示完整错误]
> 
> 🔧 **可选方案**
> - **「使用本地解析兜底」** → 我将使用本地浏览器访问该链接，抓取商品数据后重新提交（FILE 模式）
> - **「更换链接重试」** → 提供新的商品链接
> - **「结束搬品」** → 取消本次操作

---

## ▶ 参数传递给 executor

模式判定完成后，Agent 将以下参数传递给 `alibaba-global-product-migration-executor` Skill：

| 参数 | 来源 |
|------|------|
| `productFrom` | 搬品模式判定结果 |
| `logisticsTemplateId` | 用户选择的物流模版 ID（可选） |
| `currency` | 用户确认的币种 |
| `originSite` | 当 `productFrom` 为 `API` 时传 `SHOPIFY`，其他模式下不传 |
| `urls` | 用户提供的 URL 列表（PDP/STORE 模式） |
| `fileName` | 上传文件后的 OSS 相对路径（SMART_FILE/FILE/API 模式） |
| `companyId` | 商家公司 ID |
| `language` | 目标语言（默认 en） |
| `isOneClickMode` | 是否开启一键搬品模式 |
