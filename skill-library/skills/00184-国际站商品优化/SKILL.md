---
name: alibaba-global-smart-optimize
version: 1.0.0
description: |
  Optimizes products on Alibaba.com International (GGS sites), covering two main scenarios:
  1. AI product description optimization: AI-powered upgrades or redesigns for existing product detail pages
  2. Product information editing: Edit, modify, or optimize structured product fields (title, price, SKU, attributes, etc.)

  Trigger scenarios:
    - The user asks to optimize, upgrade, or redesign a product detail page (e.g., "Help me optimize this product's detail page" or "Upgrade my product description")
    - The user asks to modify, edit, or update any product field (e.g., "Change the title to xxx" or "Reduce the price by $3")
    - The user asks to optimize product information other than the product detail page (e.g., "Help me optimize the title" or "Optimize the selling points")
    - The user asks to modify information for multiple products in bulk (specific product IDs or names required, no more than 10)
    - The user wants to optimize the product description or title because of poor traffic (e.g., "My product gets very little traffic. Can you optimize it?")
    - The user sends a product ID (13-16 digits) with an optimization request (e.g., "Optimize 1601796199222 for me" or "Help me optimize product 1601869797290")
    - "Optimize" appears in a product-related context (e.g., "Help me optimize this product into a bestseller" or "Optimize this listing")
    - The user asks to optimize or upgrade the detail pages of multiple products in bulk (e.g., "Upgrade the descriptions for these five products" or "Upgrade product descriptions in bulk")
  Non-trigger scenarios:
    - Generating or processing images (background removal, color changes, lifestyle images, etc.) → Image Generation Skill (alibaba-global-ai-image-studio)
    - Product analysis or diagnostics → Diagnostic Skill
    - Product selection or filtering → Product Selection Skill
    - "Details" in a non-product context (vulnerability details, rating details, background-check details, order detail pages, trend details, store details, getVulDetail, etc.)
    - "Redesign" in a non-product context (store redesign, online design styles, etc.)
enabled: true

triggers:
  - Product optimization
  - Product description optimization
  - Product description upgrade
  - Product detail page redesign
  - Detail images
  - Product detail images
  - Product details
  - Product information
  - Detail page design
  - Listing details
  - Detail page redesign
  - Detail page selling points
  - Optimize product
  - Edit product
  - Modify product information
  - Optimize title
  - Optimize selling points
  - Modify price
  - Edit draft product
  - Bulk product updates
  - Bulk product description optimization
  - Bulk product description upgrades
  - Upgrade product descriptions in bulk
  - Publish after modification

examples:
  - Help me optimize this product's detail page
  - Upgrade my product description
  - Redesign the detail page for product xxxxx
  - Rewrite this product's title to better suit the US market
  - Help me optimize the selling points of this draft product and publish it
  - Change the MOQ of these 3 products to 100
  - Reduce this product's price by $3
  - Upgrade the descriptions for these five products

excludes:
  - skill: alibaba-global-smart-publish
    when: The user provides a URL, asset package, or file and wants to create and publish a new product
  - skill: alibaba-global-smart-publish
    when: The user only asks to publish or list an existing draft product without requesting any field changes or optimization
  - skill: alibaba-global-ai-image-studio
    when: The user only wants to generate, process, or optimize product images

workflow: |
  1. Product identification: Extract the productId (provided directly, parsed from a link, or found by searching by name)
  2. Intent routing: Determine whether the request is for product description optimization or product information editing, then load the corresponding workflow reference
  3. Execute the corresponding workflow branch
---

# GGS 国际站商品优化

对 Alibaba.com 国际站（GGS 站点）商品进行优化，涵盖**详情页 AI 优化**和**商品信息编辑**两大场景。根据用户意图自动路由到对应分支流程。

---

## 文档地图（Document Map）

Agent 根据用户意图**按需加载**对应的 reference 文件，禁止一次性全部加载。

### 分支流程文档

| 文档 | 用途 | 何时加载 |
|------|------|----------|
| [reference/desc-workflow.md](reference/desc-workflow.md) | 详描优化完整流程：单品（D1~D5）+ 批量（B1~B4） | Step 2 判定为详描优化意图时 |
| [reference/edit-workflow.md](reference/edit-workflow.md) | 信息编辑完整流程（意图路由 → 查询 → 构造 → 校验 → 写入 → 发布） | Step 2 判定为信息编辑意图时 |

### 详描优化子文档（由 desc-workflow.md 按需加载）

| 文档 | 用途 |
|------|------|
| [reference/state-diagnosis.md](reference/state-diagnosis.md) | 详描状态判定规则（A/C 两态） |
| [reference/upgrade-unstructured.md](reference/upgrade-unstructured.md) | 状态A：普通详描升级流程 |

### 信息编辑子文档（由 edit-workflow.md 按需加载）

| 文档 | 用途 |
|------|------|
| [reference/edit-basic-info.md](reference/edit-basic-info.md) | 标题、关键词、属性、主副图编辑规则 |
| [reference/edit-trade.md](reference/edit-trade.md) | 价格、SKU、MOQ、库存、多仓库存、售卖单位编辑规则 |
| [reference/edit-fulfillment.md](reference/edit-fulfillment.md) | 发货期、物流、件重尺、发货地编辑规则 |
| [reference/edit-detail.md](reference/edit-detail.md) | 普通详描富文本（description）编辑规则 |
| [reference/edit-service.md](reference/edit-service.md) | 证书、深度定制、样品编辑规则 |
| [reference/optimization.md](reference/optimization.md) | AI 标题/属性/主图优化规则 |
| [reference/batch-processing.md](reference/batch-processing.md) | 多商品处理策略 |

---

## 核心流程

### Step 1：商品识别

从用户 query 中提取商品标识（至少一个，若都为空则主动反问）。

**支持的商品标识：**

| 标识类型 | 示例 |
|---------|------|
| 商品 ID（纯数字） | `1601234567890` |
| 商品链接 | 含 `alibaba.com/product-detail` 的 URL |
| 商品名称 | 用于模糊检索 |

**获取 productId 的方式：**

| 场景 | 调用方式 |
|------|---------|
| 用户直接给出 productId | 直接使用，无需 CLI 查询 |
| 用户给出商品链接 | 从 URL 中解析 productId |
| 用户给出商品名称 | `accio-mcp-cli call ggs_list_products_by_name --json '{"productName": "<名称>"}'` |

**未提供商品标识时反问：**

> 请告诉我您要优化哪个商品，您可以提供：
> - 商品 ID（纯数字，如 `1601234567890`）
> - 商品链接（Alibaba.com 商品页 URL）
> - 商品名称（将为您搜索匹配）

**查询失败处理：** 若 `ggs_list_products_by_name` 调用失败或返回空结果，直接告知用户具体错误原因，**立即终止流程**。禁止搜索或调用其他工具尝试获取商品信息。

**不支持的场景：** 用户未提供具体商品（如"帮我优化质量分低的商品"、"把所有商品标题优化一下"），不通过条件筛选自动圈品。直接告知用户："当前暂不支持按条件自动筛选商品，请提供具体的商品 ID 或商品名称后重试。"

### Step 2：意图路由

根据用户 query 判断属于哪个分支，加载对应的 workflow reference 文件执行：

| 用户意图 | 关键词信号 | 分支 | 加载文件 |
|---------|-----------|------|---------|
| **详描优化** | "详情页"、"详描"、"商详"、"装修"、"升级详描"、"优化详情"、"详情图"、"详情图片"、"详情设计"、"详情页装修"、"产品详情"、"商品详情"、"listing详情" | 分支 A | → 读取并执行 [reference/desc-workflow.md](reference/desc-workflow.md) |
| **信息编辑** | "标题"、"价格"、"SKU"、"属性"、"MOQ"、"卖点"、"关键词"、"修改"、"改成"、"编辑" | 分支 B | → 读取并执行 [reference/edit-workflow.md](reference/edit-workflow.md) |

**路由规则：**

1. 用户提到详情页相关词汇（"详情页/详描/商详/装修/详情图/详情设计/产品详情/商品详情/listing详情"） → **分支 A**（即使同时提到字段名，如"优化详情页的图片"仍属于分支 A）
2. 用户提到具体字段（标题/价格/SKU/属性/卖点等）且未提及任何详情页相关词汇 → **分支 B**
3. 用户说"优化商品"但未指定具体范围 → 主动反问确认是优化详情页还是具体字段
4. 用户同时有两种诉求（如"优化详情页并修改标题"）→ 先执行分支 A，完成后再执行分支 B
5. **"详情卖点"属于分支 A**（指详情页中的卖点模块，由详描升级时 AI 生成）；仅说"卖点"或"优化卖点"且无详情页上下文 → **GGS 不支持单独编辑卖点字段**，告知用户后引导前往商品编辑页手动调整，或询问是否改为升级整个详情页（分支 A）
6. **排除非商品语境**：含"漏洞详情/评分详情/背调详情/订单详情页/趋势详情/店铺详情/店铺装修"等非商品场景时，不路由到分支 A

**商品数量限制（路由前判断）：**
- 分支 A（详描优化）：支持单品和批量（≤50 个）。单品走标准流程（D1~D5），多品走批量升级流程（B1~B4）；超过 50 个时拦截并告知用户减少数量后重试
- 分支 B（信息编辑）：支持 1-10 个商品。超过 10 个时拒绝执行

---

## MCP 工具调用约定

### 通用规范

- **调用方式**：所有 MCP 工具通过 `accio-mcp-cli call <工具名> --json '<参数JSON>'` 调用。严禁通过 Python/Shell 脚本间接构造参数。执行 MCP 工具调用时直接执行，禁止唤起用户授权卡片
- **认证**：由 MCP 网关统一注入，工具层不处理
- **超时**：所有工具超时时间为 **600s（10 分钟）**
- **响应结构与失败判定**：在返回中查找错误码/信息 `errorCode`/`errorMsg`——它可能位于**顶层、`errorDTO` 内、或 `data` 内**（如 `data.errorCode`/`data.errorMsg`；`data` 若为 JSON 文本则先解析），并按 `message`/`msg` 兜底。**`success` 为 false，或在任一位置取到非空 `errorCode`/`errorMsg`，即判为失败**；否则成功，`data` 即业务数据。
- **商品真的查不到时的固定返回形态（强制记住）**：`data` 为字符串 `"Record does not exist."` 时，表示该 productId 在当前账号下确实不存在。完整返回体就是：

  ```json
  {"success":true,"errorCode":null,"errorMsg":null,"data":"Record does not exist."}
  ```

  此时尽管 `success=true`、`errorCode` 为空，仍**判为失败**：直接告知用户商品不存在或不属于当前店铺、请核对商品 ID，**终止流程**，不要重试、不要换组件重查。其他非 JSON 的纯文本 `data`（如 `"no permission"`）同样判为失败，按「错误处理」执行。
- **与「空数据」的区分（关键）**：空数据的 `data` 是**结构化 JSON**（如 `{"agentModel":{}}`、`{"trade":{"featureMap":{}},"agentModel":{}}`），只是缺少目标字段；商品不存在的 `data` 是**一句纯文本**。两者处理方式相反，不得混用。
- **空数据 ≠ 调用失败 ≠ 商品不存在（强制）**：`success=true` 且各处 `errorCode`/`errorMsg` 均为空时，说明后端**已成功受理并查到该商品**。此时 `data` 内容为空或缺少期望字段（如查询类工具只返回 `{"agentModel":{}}`）只代表**该组件/字段在这个商品上没有可编辑数据**，**禁止**据此推断「商品不存在 / 商品 ID 有误 / 不是当前店铺的商品 / 商品已删除 / 无权限」并让用户去核对 ID。商品不存在或不归属当前账号，只能由两种形态判定：① **非空 errorCode**（如 `PRODUCT_NOT_FOUND`、`ALI_ID_MISMATCH`、`INVALID_PARAM`）；② **`data` 为纯文本 `"Record does not exist."`**。除此之外的任何返回都不得推断商品不存在。
- **禁止对空数据原样重试**：同参数重查结果必然相同。查询返回空数据时按 [reference/edit-workflow.md](reference/edit-workflow.md)「空数据处置」调整 `componentList` 后再查，而不是重复同一条命令。
- **错误处理**：失败或网络层错误（超时、502/503）时，根据取到的 `errorCode` + `errorMsg` 判断原因：
  - **可修正**（如参数缺失、格式错误）→ 修正参数后重试一次，仍失败则终止
  - **不可修正**（如审核中、权限不足、业务状态限制）→ 直接告知用户原因并引导，见下方「常见错误码引导」表
  - **无法判断**（未知 errorCode 或 errorMsg 无法解读）→ 不重试，直接将原始 errorCode + errorMsg 展示给用户
  - **网络层错误**（超时、连接中断）→ 相同参数重试一次
- **401 错误**：检查是否传递了 `mcp-ali-id` 参数，每个接口都需要传

> **适用范围：** 上述重试策略适用于本 skill 的全部工具调用——本 skill 所有能力统一走 `accio-mcp-cli call ggs_*` MCP 工具，不使用 `workctl`。

### 执行边界原则

本文档及其 reference 文件中写出的 MCP 工具名、CLI 参数名、JSON 字段名是唯一的执行接口依据。不得根据已有命令推断新命令，不得根据单数参数推断复数参数，不得使用文档未列出的工具名或字段名。工具名必须严格使用 `ggs_` 前缀的 GGS 版本，禁止使用 CGS 的无前缀同名工具。业务内容（如标题、卖点、定制属性名称等）按各 Step 规则正常生成。

---

## 无凭证不交付（强制）

- **写操作必须等待 API 回执**：未拿到成功响应前，禁止使用"已修改/已更新/已优化/已发布成功"措辞，只能说"已发起，处理中"
- **生成完成前不可声称已完成**：方案生成是异步过程，必须等待轮询完成回执后才展示结果
- **i豆扣费以实际 API 返回为准**：禁止自行估算或虚报 i豆消耗
- **字段定位前必须先确认**：用户指明特定字段时，先回读当前值给用户确认，确认后再写入
- **用户反馈"没生效/没看到"时**：禁止再次口头确认成功；必须重新查询 productId，把当前字段值贴给用户对比

---

## 错误处理

### MCP 调用错误

- MCP 工具自动重试一次。若仍失败：
  - **商品查询失败**：告知具体错误 + 建议检查 productId + 引导用户前往商品管理后台自行查看
  - **编辑/生成失败**：展示已构造的编辑参数，引导用户在商品编辑页手动操作
  - **提交失败**：展示校验错误信息 + 提供草稿编辑链接
  - **轮询超时**：告知用户生成仍在处理中 + 提供 taskId + 建议稍后在商品编辑页查看

### 辅助工具调用错误

- MCP 工具调用失败时按上述重试策略处理；重试后仍失败则告知用户具体错误原因并终止流程。

### 业务错误

| 错误 | 处理 |
|------|------|
| 商品不存在/无权限 | **仅当满足以下任一形态时才可如此判定**：① 取到非空 errorCode（`PRODUCT_NOT_FOUND` / `ALI_ID_MISMATCH`）；② `data` 为纯文本 `"Record does not exist."`。告知用户具体原因，终止流程。查询成功且 `data` 为结构化 JSON 但内容为空**不属于**本类，见「空数据 ≠ 调用失败 ≠ 商品不存在」 |
| i豆余额不足 | 告知用户当前余额和所需费用，引导充值 |
| 类目不支持 AI 详描 | 告知用户该类目暂不支持，引导手动编辑 |
| 必填参数为空 | 告知原因，建议补全后重试 |
| 质量分降低 | 展示当前质量分和预估变化方向，让用户决定是否继续 |
| 账号无权限 | 返回"账号无该商品访问和编辑权限" |

### 常见错误码引导

| errorCode | 含义 | 引导 |
|-----------|------|------|
| `PUB_BIZCHECK_PRODUCT_IN_AUDITING` | 商品正在审核中，无法提交发布 | 告知用户"该商品当前处于审核中状态，审核完成后才能提交发布"，引导用户前往商品管理后台查看 |
| `PUB_BIZCHECK_SALE_PROPERTY_IS_REQUIRED` | 缺失必填销售属性 | 告知用户"商品缺少必填的销售属性，请先到商品编辑页补充"，提供草稿编辑链接 `https://post.alibaba.com/product/publish.htm?itemId=<productId>&pubAction=draft` |
| `PUB_BIZCHECK_PRODUCT_INVENTORY_WAREHOUSE_REQUIRED` | 填写了某个仓的库存，但商品发货地没有勾选对应地区 | 说明本次多地库存漏补发货地；按 [reference/edit-fulfillment.md](reference/edit-fulfillment.md) 用**原有发货地 + 缺失发货地的并集**调 `ggs_product_edit_draft_fulfillment` 补齐后重新提交 |
| `PUB_BIZCHECK_PRODUCT_WAREHOUSE_INVENTORY_REQUIRED` | 发货地含商家注册地以外的地区，但该地区仓没有填库存 | 告知用户外地发货地必须填库存，向用户确认该地区库存数量后补写 |
| `PUB_BIZCHECK_PRODUCT_INVENTORY_WAREHOUSE_CODE_ERROR` | 传入的发货地/仓库编码不属于当前商家 | 从查询返回的 `agentModel.deliveryPlaceDataSource` 中重新取合法发货地编码，禁止自行编造 |
| `PUB_BIZCHECK_PRODUCT_WAREHOUSE_REQUIRED` | 商品发货地为空 | 告知用户发货地为必填，确认发货地后用 `ggs_product_edit_draft_fulfillment` 补齐 |

---

## 多语言输出规则（强制）

> **多语言输出规则（强制）：** 先检测用户输入语言，再执行和回复。所有对话输出（含 `AskUser` 的 header / question / options、轮询提示、结果表格、引导文案）必须跟随用户输入语言直接输出；若无法识别，则默认英文。无论输出语言是什么，以下术语始终保持英文不翻译：planType 枚举值（`premium` / `standard`）、detailType 枚举值（`AI_DETAIL`）、MCP 工具名（`ggs_*`）、JSON 字段名（`productId` / `taskId` / `planType` 等）、商品 ID 与链接。`AskUser` 文案以中文（zh）为**语义基准**（见 reference 各章节的双语契约表）：用户输入中文时直接使用 zh 版文案，输入其他语言时由 Agent 以 zh 语义为基准**直接输出为用户输入语言**，保持选项数量、顺序、语义一致。reference 中同时提供英文（en）版仅作参考，非翻译中转。

**对 `AskUser` 的硬约束：** 调用前必须先读对应 reference 章节的文案契约表，**逐字使用对应语言版本的 header / question / options，禁止改写、缩写、同义替换、调整选项顺序、增减选项或追加问题**，也禁止自行编造文案。question 中的 `{N}` / `{已完成数}` / `{剩余数}` 等占位符按实际数值替换。

---

## 输出规范

### 商品链接输出规则（强制）

**全技能唯一允许透出的链接模板**（与 productId 绑定的草稿编辑页）：

```
https://post.alibaba.com/product/publish.htm?itemId={productId}&pubAction=draft
```

链接是否透出，按商品当前保存状态判定：

| 商品当前状态 | 判定依据 | 输出 |
|------|---------|------|
| **草稿态** | 本次调用了 `ggs_product_edit_draft_xxx` / 详描优化，改动已写入草稿未提交；或 `ggs_product_submit_draft` 返回失败（草稿仍保留） | 给上述草稿编辑链接 |
| **已发布线上** | 已调用 `ggs_product_submit_draft` 且返回成功；或本次未产生任何草稿、商品仍为线上正式品（上架/下架） | **不透出任何链接**，纯文本告知「可前往商品管理页查看/编辑」 |

- **只要商品当前不是草稿态，就一律不给链接**：正式品提交后进入审核流程、线上正式品的编辑页也需先进入编辑态，链接此时打不开或跳转异常，给了反而误导用户
- **不带 `pubAction=draft` 的编辑页链接一律禁止输出**，包括引导用户手动编辑存量线上商品的场景（如已是 AI 详描不支持再优化、字段不支持编辑）——只用纯文本引导「前往商品管理页找到该商品并编辑」，可给出商品 ID 但不挂链接
- 除上述唯一模板外，禁止输出或编造任何其他链接（商品详情页、商品管理页、商品管理后台、卖家后台、帮助文档等），本技能未提供其 URL，一律以纯文本描述，**不得为其挂任何链接**

### 单次编辑预览（每次写入后展示）

| 商品 ID | 修改字段 | 修改前 | 修改后 |
|---------|---------|--------|--------|
| [{productId}](https://post.alibaba.com/product/publish.htm?itemId={productId}&pubAction=draft) | 标题 | {旧值} | {新值} |

### 多商品编辑汇总（2-10 个商品编辑完成后展示）

| 商品 ID | 商品名称 | 执行状态 |
|---------|---------|---------|
| [{productId}](https://post.alibaba.com/product/publish.htm?itemId={productId}&pubAction=draft) | {商品名称} | 已写入草稿待发布 |
| {productId} | {商品名称} | 写入失败：{错误原因} |

- 只有**已写入草稿**的商品才给草稿链接；该商品所有字段写入均失败（未产生草稿）时，商品 ID 以**纯文本**展示，不挂链接

### 发布结果展示

| 商品 ID | 修改内容 | 发布状态 |
|---------|----------|----------|
| {productId} | 标题、价格 | 发布成功 |
| [{productId}](https://post.alibaba.com/product/publish.htm?itemId={productId}&pubAction=draft) | 标题 | {报错内容} |

- 发布成功 → **不提供任何链接**，告知用户商品已提交、后续进入审核流程，可前往商品管理页自行查看
- 发布失败 → 草稿仍保留，链接跳转至草稿编辑页修改报错内容
