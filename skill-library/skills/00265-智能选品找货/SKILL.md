---
name: 1688-sourcing
displayName: 智能选品
version: "2.0.0"
description: |
  1688智能选品找货能力。通过文字、图片或链接搜商品、找同款、找相似款，支持批量采购比价、热销选品、跨境找货、场景化选品及多条件筛选（价格/销量/材质/属性排除等）。支持中英双语：英文输入自动译为中文检索，结果译回英文展示。
  ❗英文输入时必须给后处理命令附加 --lang en 参数（否则可视化页面仍为中文）。
  触发词：找商品、找同款、搜商品、帮我找、想要XX、图片找货、链接找货、以图搜图、选品、批发、找货源、热销、比价、最便宜、按销量排序、出口、跨境、找供应商、find product、source product、find similar、cheapest、wholesale。
description_zh: 1688智能选品找货，支持文本搜索、图片搜索、商品ID/链接搜索、比价，可按价格/销量/严选指数排序
user-invocable: true
argument-hint: 描述您想要的商品，或上传图片/提供链接找同款
---

# 1688 智能选品找货

> ❗❗ **执行前必看（两个最常被遗漏的必传参数）**
>
> 1. 每次调用 MCP `find_product` 必须带 `tags="4306497"`。
> 2. **用户输入为英文时**，每次调用 `text_search` / `image_search` / `link_search` 后处理命令必须带 **`--lang en`** 与 **`--translation-map-file`**（后者提供商品标题/规格/店铺名的英译）。脚本无法自动识别用户语言、也无法翻译商品数据，漏传则页面仍为中文。
>
> 判断方法：用户本轮找货请求以英文为主 → 全程按英文用户处理（详见「语言处理」）。

## 处理边界

本 Skill 采用 **MCP 调用 + Python 后处理** 两段式流程：

1. **鉴权与 API 调用全部交给 MCP 连接器 `ali1688`**。Agent 不处理 AK、本地 Token、browser_use 授权、签名或 HTTP 请求。
2. **数据后处理必须交给 Python 脚本**。Agent 不直接对 MCP 返回商品做字段映射、排序选品、表格格式化或比价筛选。
3. **语言由 Agent 显式告知脚本**。脚本不推断用户语言，英文用户必须通过 `--lang en` 传递。

## MCP 连接器

- 连接器名称：`ali1688`
- 本技能使用的 MCP 工具：`find_product`、`offer_query_for_trade`
- `__userId__` 等用户身份参数由 MCP 网关自动注入，Agent 不手动传递。

## 语言处理（中英双语）

1688 平台与 MCP 工具仅支持**中文**检索，本技能按用户输入语言执行以下翻译规则。

### 语言处理速查表

| 用户语言 | MCP `query` | CLI `--query` | CLI `--lang` | CLI `--translation-map-file` | 输出 `markdown` |
|---------|-------------|---------------|--------------|------------------------------|------------------|
| 中文 | 原始中文 | 原始中文 | 不传（或 `zh`） | 不传 | 原样输出 |
| **英文** | 译后中文 | 译后中文 | **`en`（必传）** | **必传（标题/规格/店铺名英译）** | 整体译成英文 |

### 语言判定

- 用户本轮找货请求以中文为主 → 判定为**中文用户**。
- 用户本轮找货请求以英文为主（如 "find me a black hoodie"）→ 判定为**英文用户**，后续命令一律带 `--lang en`。
- 中英混合时以主要叙述语言为准；仅夹杂品牌名、型号等英文词（如“找 Type-C 数据线”）仍判定为中文用户。

### 输入端（调用 MCP 前）

- **中文用户**：搜索词原样使用，不做任何翻译或改写。
- **英文用户**：Agent 先将商品描述**忠实翻译成中文搜索词**（保留品牌名、型号、规格数字），再以中文调用 `find_product(query=中文搜索词, ...)`；Python 后处理 `--query` 参数同样传中文搜索词。
- 翻译只做语言转换，禁止增删商品属性、价格、数量等需求条件。
- 图片/链接搜索不涉及输入翻译；但英文用户附带的文字筛选要求（如 "cheapest", "sort by sales"）需正确映射为对应参数（`sortType` 等）。

### 输出端（展示结果时）

- **中文用户**：原样输出脚本返回的 `markdown`，不翻译。
- **英文用户**：Agent 将脚本返回的 `markdown` **整体翻译成英文**后输出，翻译时必须遵守：
  - 表格结构、行数、行顺序与原文完全一致，禁止增删、重排商品行。
  - 商品标题译为英文；价格、数字、货币符号、`productId`、商品链接、图片链接、HTML 文件路径**原样保留，逐字不改**。
  - 表头、标签（如“销量最高/价格最低/综合最优”→ "Best Seller / Lowest Price / Best Overall"）、提示语句译为英文。
  - 「🖼️ 可视化商品页面」段落照常完整展示（文件路径不变）。
- 输出翻译仅是语言转换，禁止借翻译之机篡改、补齐或臆造任何商品数据。

### 可视化 HTML 页面（英文用户）

> ❗ **强制要求**：判定为英文用户后，调用 `text_search` / `image_search` / `link_search` 后处理命令时**必须附加 `--lang en`**，否则可视化页面会以中文渲染，英文用户无法使用。该参数不会自动附加，必须由 Agent 显式传入（同 `tags="4306497"` 一样不可省略）。

英文用户时，可视化商品墙页面由后处理脚本直接渲染为英文，Agent 必须：

1. 调用 `text_search` / `image_search` / `link_search` 时附加 **`--lang en`**，页面固定界面文案（表头、按钮、字段标签、库存/起批量、推荐理由等）自动渲染为英文。
2. **商品动态内容必须由 Agent 翻译**：商品列中的 **商品标题、规格（spec）、店铺/供应商名称** 都是数据库中文文本，脚本无法自动翻译。Agent 需先将这三类文本译成英文，写入临时 JSON 映射文件，再通过 **`--translation-map-file /tmp/translation_map.json`** 传入。
3. 页面展示英文，鼠标悬停可看中文原文；铺货指令仍使用中文原标题。
4. 翻译必须忠实，禁止增删商品属性；未提供映射的字段降级展示中文，不报错。
5. 中文用户不传 `--lang`（或传 `zh`），页面保持中文，禁止传 `--translation-map-file`。

#### 翻译映射文件格式

三组映射，缺少的组可省略；`titles` / `specs` 的 key 可用 `productId` 或中文原文，`suppliers` 的 key 用中文店铺名原文：

```json
{
  "titles": {
    "778899001122": "Black Hooded Sweatshirt Fleece-Lined Unisex"
  },
  "specs": {
    "黑色 XL 加绒款": "Black / XL / Fleece-lined"
  },
  "suppliers": {
    "杭州思远服饰有限公司": "Hangzhou Siyuan Apparel Co., Ltd."
  }
}
```

翻译要点：

- **规格（specs）**：颜色/尺码/材质等译为英文（如“黑色 XL 加绒款”→ "Black / XL / Fleece-lined"），尺码与数字原样保留。
- **店铺名（suppliers）**：公司名用拼音 + 英文后缀（如“杭州思远服饰有限公司”→ "Hangzhou Siyuan Apparel Co., Ltd."；“XX制衣厂”→ "XX Garment Factory"），不意译、不缩写、不遗漏主体名。
- **标题（titles）**：保留品牌名、型号、规格数字。

英文用户完整命令模板（直接照此执行）：

```bash
python3 {baseDir}/cli.py text_search --query "<译后中文搜索词>" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json
```

## 严格禁止

- 禁止配置、读取、提示用户粘贴或管理 AK。
- 禁止调用 `scripts/_http.py`、旧 service 层、浏览器或网页搜索引擎请求 1688 商品数据。
- 禁止在 MCP 调用失败后自行通过浏览器访问 1688 网站搜索商品。
- 禁止让 AI 直接改写 MCP 原始商品列表为最终表格；必须调用 Python 后处理脚本输出 `markdown`。
- 禁止编造商品价格、链接、`productId`、规格、销量、库存或供货信息。
- **禁止在英文用户场景下不带 `--lang en` 调用 `text_search` / `image_search` / `link_search`**（会导致可视化页面以中文渲染）。
- 用户明确要下单、支付、查物流、管库存时，不触发本技能。

## 命令入口

统一入口：

```bash
python3 {baseDir}/cli.py <command> [options]
```

所有命令只做 MCP 返回结果后处理，支持通过 `--mcp-result-file` 读取 MCP 原始 JSON；不传该参数时从 stdin 读取。

| 命令 | 用途 | 示例（中文用户） | 示例（英文用户，必须带 `--lang en`） |
|------|------|------|------|
| `text_search` | 文本搜索结果后处理 | `python3 cli.py text_search --query "黑色连帽卫衣" --mcp-result-file /tmp/find_product.json` | `python3 cli.py text_search --query "黑色连帽卫衣" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json` |
| `image_search` | 图片搜索结果后处理 | `python3 cli.py image_search --image "https://...jpg" --mcp-result-file /tmp/find_product.json` | `python3 cli.py image_search --image "https://...jpg" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json` |
| `link_search` | 链接找同款结果后处理 | `python3 cli.py link_search --url "https://detail.1688.com/offer/xxx.html" --image "https://...jpg" --mcp-result-file /tmp/find_product.json` | `python3 cli.py link_search --url "..." --image "..." --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json` |
| `compare` | 比价结果后处理 | `python3 cli.py compare --image "https://...jpg" --mcp-result-file /tmp/find_product.json` | 同中文（不生成 HTML，无 `--lang` 参数） |

> ❗ **重要**：英文用户调用 `text_search` / `image_search` / `link_search` 时，`--lang en` 与 `--translation-map-file` **必传**，脚本不会自动推断用户语言；漏传将导致可视化页面以中文渲染。中文用户则两者都不传。详见「语言处理」。

输出统一为：

```json
{"success": true, "markdown": "...", "data": {"data": {...}}}
```

## 意图判断

### 触发本技能

- 用户用自然语言描述想要的商品，如“帮我找一件黑色卫衣”“我要买打印纸”。
- 用户上传商品图片并表达找同款/找相似意图。
- 用户提供 1688 商品链接或商品 ID 并要求找同款。
- 用户在搜索结果中选定商品后要求“比价”“对比”“找更便宜的”。
- 用户上传图片/链接并明确提到“比价”“哪家便宜”“低价同款”。

### 不触发本技能

- 用户要下单、支付、结算。
- 用户查物流、订单状态。
- 用户管理库存或修改商品信息。
- 用户闲聊且没有找商品意图。

## 调用决策树

```text
用户输入（英文输入先按「语言处理」规则译成中文搜索词，且后处理命令全部附加 --lang en）
├─ 纯文本描述商品 → 调用 MCP find_product(query=..., tags="4306497") → Python text_search 后处理
├─ 上传图片/图片 URL
│  ├─ 明确要求比价 → 调用 MCP find_product(imageUrl/imgBase64=..., pageSize=20, tags="4306497") → Python compare 后处理
│  └─ 找同款/找相似 → 调用 MCP find_product(imageUrl/imgBase64=..., tags="4306497") → Python image_search 后处理
├─ 1688 链接/商品 ID
│  ├─ 调用 MCP offer_query_for_trade(offerId=...) 获取 image
│  ├─ 调用 MCP find_product(imageUrl=image, pageSize=用户要求数量或默认10；比价固定20, tags="4306497")
│  └─ Python link_search 或 compare 后处理
└─ 已展示搜索结果，用户选中某款后说“比价”
   └─ 取该商品 image_url → 调用 MCP find_product(imageUrl=..., pageSize=20, tags="4306497") → Python compare 后处理
```

> ❗ 英文用户：上图中的 `text_search` / `image_search` / `link_search` 命令均需额外传 `--lang en --translation-map-file /tmp/translation_map.json`。

## MCP 工具调用规则

### `find_product`

| 参数 | 类型 | 说明 |
|------|------|------|
| `query` | string | 文本搜索关键词；可同时承载用户的价格、销量、品牌、规格等要求 |
| `imageUrl` | string | 图片 URL 搜索 |
| `imgBase64` | string | 本地图片经客户端/网关转 base64 后搜索 |
| `pageSize` | integer | 普通搜索在用户未指定数量时默认 10；用户明确要求返回数量时按用户需求传入；比价固定 20 |
| `sortType` | string | 可选：`price_asc` / `price_desc` / `sold_desc` / `yx_desc` |
| `purchaseAmount` | integer | 采购件数，默认 1 |
| `tags` | string | TC 标（严选品池），**必传**，固定 `4306497` |
| `icTags` | string | IC 标，可选 |

比价模式默认不传 `sortType`，保持 MCP 默认相关性/相似度召回，后续由 Python 脚本按销量、价格、严选指数做确定性筛选。

> ❗ **重要**：每次调用 `find_product` 必须携带 `tags="4306497"`，该参数是严选品池筛选条件，MCP 工具不会自动附加。

### `offer_query_for_trade`

用于 1688 链接或纯数字商品 ID 获取商品详情和主图：

1. 从链接 `/offer/{offerId}.html` 中提取 `offerId`。
2. 调用 `offer_query_for_trade(offerId=...)`。
3. 从返回结果中取 `image` 字段。
4. 用该 `image` 调用 `find_product(imageUrl=...)`。
5. 将 `find_product` 返回结果交给 Python 后处理。

淘宝/天猫链接无法通过本技能自动获取主图，应引导用户提供商品图片 URL 或直接上传图片。

## Python 后处理规则

### 文本搜索

1. Agent 调用 `find_product(query=..., pageSize=用户要求数量或默认10, tags="4306497")`。当用户没有明确要求返回数量时使用 `pageSize=10`；用户明确说“给我看 5 个/20 个/多找几款”等数量需求时，按用户需求设置 `pageSize`。
2. 将 MCP 返回 JSON 写入临时文件或通过 stdin 传给：

```bash
python3 {baseDir}/cli.py text_search --query "中文搜索词（中文用户即原始输入；英文用户为译后中文）" --mcp-result-file /tmp/find_product.json
```

> ❗ **英文用户改用此命令**（必须带 `--lang en`）：
>
> ```bash
> python3 {baseDir}/cli.py text_search --query "<译后中文搜索词>" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json
> ```

3. 完整输出脚本返回的 `markdown` 字段（含末尾可视化商品墙页面链接）。

### 图片搜索

1. Agent 调用 `find_product(imageUrl=..., tags="4306497")` 或 `find_product(imgBase64=..., tags="4306497")`。
2. 调用：

```bash
python3 {baseDir}/cli.py image_search --image "图片URL或图片标识" --mcp-result-file /tmp/find_product.json
```

> ❗ **英文用户改用此命令**（必须带 `--lang en`）：
>
> ```bash
> python3 {baseDir}/cli.py image_search --image "图片URL" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json
> ```

3. 完整输出脚本返回的 `markdown` 字段（含末尾可视化商品墙页面链接）。

### 链接找同款

1. 1688 链接：先用 `offer_query_for_trade` 获取 `image`，再用 `find_product(imageUrl=image, tags="4306497")` 搜同款。
2. 调用：

```bash
python3 {baseDir}/cli.py link_search --url "原始链接" --image "主图URL" --mcp-result-file /tmp/find_product.json
```

> ❗ **英文用户改用此命令**（必须带 `--lang en`）：
>
> ```bash
> python3 {baseDir}/cli.py link_search --url "原始链接" --image "主图URL" --lang en --translation-map-file /tmp/translation_map.json --mcp-result-file /tmp/find_product.json
> ```

3. 完整输出脚本返回的 `markdown` 字段（含末尾可视化商品墙页面链接）。

### 比价

1. Agent 调用 `find_product(imageUrl=..., pageSize=20, tags="4306497")`。
2. 调用：

```bash
python3 {baseDir}/cli.py compare --image "主图URL" --mcp-result-file /tmp/find_product.json
```

3. Python 脚本保留原有三维度选品逻辑：

| 维度 | 排序规则 | 标签 |
|------|----------|------|
| 销量最高 | 按 `sold_count` 降序，缺失视为 0 | `销量最高` |
| 价格最低 | 排除无价格商品，按 `price` 升序 | `价格最低` |
| 综合最优 | 按 `yx_index` 降序，缺失视为 0 | `综合最优` |

同一商品命中多个维度时，Python 脚本会合并标签，例如 `销量最高 且 价格最低 且 综合最优`。Agent 不得自行重算或补齐商品。

## 输出完整性要求

- Agent 必须完整输出 Python 脚本返回的 `markdown` 字段（英文用户按「语言处理」规则整体翻译后输出）。
- 禁止省略、截断或重排表格行。
- 禁止丢失商品链接。
- 禁止把表格改写成列表、卡片或自行组织的格式。
- 除「语言处理」允许的语言转换外，禁止修改 `markdown` 中的任何数据内容。
- Agent 的补充分析只能追加在 `markdown` 之后，不能混入表格。

### 可视化商品墙页面（必须展示）

> ❗ **强制要求**：Python 脚本返回的 `markdown` 末尾如果包含 `🖼️ **可视化商品页面**` 段落及其 HTML 文件路径，Agent **必须原样展示**该段落给用户，**禁止省略、删除或隐藏**。

该段落格式如下：

```
---

🖼️ **可视化商品页面**（浏览器打开后可勾选商品、发起询盘、批量铺货）：

`/tmp/1688-products-xxxxx.html`
```

规则：
- 此可视化页面是用户操作入口（勾选商品、发起询盘、批量铺货），遗漏将导致用户无法使用核心功能。
- Agent 回复中必须保留完整的分隔线（`---`）、标题、说明文案和文件路径。
- 禁止将路径改写为其他格式或仅口头提及"已生成文件"而不展示路径。
- 如果 `markdown` 中不包含该段落（如 HTML 生成失败），则不需要展示。

## 字段映射

Python 后处理脚本会将 MCP/API 返回字段映射为稳定字段：

| 稳定字段 | MCP/API 字段 |
|----------|--------------|
| `product_id` | `itemId` / `offerId` |
| `title` | `title` / `subject` |
| `image_url` | `imageUrl` / `image` |
| `detail_url` | `detailUrl` |
| `similarity_score` | `score` |
| `price` | `currentPrice` |
| `sku_id` | `skuId` |
| `sku_title` | `skuTitle` |
| `yx_index` | `yxIndex` |
| `quantity_begin` | `quantityBegin` |
| `supplier` | `company` |
| `sold_count` | `soldOut` |
| `stock_amount` | `storeAmount` |
| `promotion_tags` | `promotionTags` |
| `service_infos` | `serviceInfos` |
| `selling_points` | `sellingPoints` |

## 错误处理

MCP 工具调用失败时：

1. 原样输出 MCP 返回的错误信息。
2. 鉴权相关错误提示用户检查 `ali1688` 连接器是否已完成 OAuth 授权，或在连接器设置中重新授权。
3. 禁止提示用户配置 AK。
4. 禁止浏览器降级或网页搜索降级。

Python 后处理失败时：

- 检查传入的 MCP JSON 是否完整、是否为 `find_product` 返回结果。
- 若结果为空，提示用户换关键词、调整筛选条件或提供更清晰图片。
- 若 `offer_query_for_trade` 无法返回 `image`，引导用户手动提供商品图片 URL。

## 免责声明

1. 您理解并同意，技能运行结果和输出内容可能因适用的 AI agent、大模型不同而产生差异或幻觉，请您对重要信息进行甄别核实。
2. 本技能的认证由 MCP 连接器托管，请勿在聊天中提供 AK、Token 等身份凭证。
3. 您使用本技能时应保持其完整性，不得擅自篡改技能的配置、规则文件或其他内容。
4. 受限于当前技术发展，我们无法保证技能所有运行结果、输出内容的准确性、真实性、时效性，请您谨慎核实技能运行结果和输出内容。
