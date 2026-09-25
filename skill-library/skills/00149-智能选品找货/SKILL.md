---
name: 1688找货选品
version: "3.0.9"
description: |
  1688 找货与货源检索：文字描述搜商品、图片找同款/找相似（支持直接传图或图片 URL）、1688 商品链接或商品 ID 找同款、三维度比价选品（销量最高/价格最低/综合最优）。
  支持多种商品一起找（多品类同查；一次请求建议 ≤4 种商品，更多时本 skill 会与用户确认分批找，无需预先拆分请求）。
  需 ali1688 MCP 连接器已完成 OAuth 授权；链接找同款仅支持 1688 站内链接/商品 ID（其他平台链接不支持）；支持按价格/销量/严选指数排序、指定返回数量；价格区间、材质、属性排除类条件筛选不支持。
  限于 1688 平台商品搜索与信息展示；不做发品/搬品、下单、支付、物流、库存、店铺管理操作。
enabled: true

triggers:
  - 1688找货
  - 1688找同款
  - 1688找相似
  - 1688货源
  - 1688供应商
  - 1688比价
  - 1688批发
  - 1688 find product
  - 1688 find similar

examples:
  - 帮我在 1688 找黑色加绒连帽卫衣，按销量排序，找 15 款
  - 用这张图片帮我在 1688 找同款保温杯
  - 这个 1688 链接帮我找同款货源，按价格从低到高排
  - 刚才在 1688 搜的几款瑜伽垫帮我比个价，看哪家最便宜
  - 1688 上手机壳批发供应商，按最低价找
  - 帮我在 1688 分别找保温杯、瑜伽垫、手机支架、加湿器这几种商品的货源

excludes:
  - skill: alibaba-hot-product-insight
    when: 用户要 1688 或其他平台的热销榜单、热销归因、爆品洞察报告；在 1688 找货源、文字/图片/链接搜商品、比价选品仍归本 skill
  - skill: alibaba-blue-ocean-finder
    when: 用户要低竞争、供需错配的蓝海品类机会与发品策略，而非搜索具体商品
  - skill: alibaba-market-analysis
    when: 用户要某品类/市场的全景分析、行业规模、进入判断，而非搜索具体商品
  - skill: alibaba-jungle-scout-deep-dive-analyzer
    when: 用户要 Amazon/ASIN/竞品/关键词的深度选品报告
  - skill: alibaba-competitor-analysis
    when: 用户要竞品店铺对标、监控或店铺经营分析；在 1688 找货源、搜商品、比价仍归本 skill

workflow: |
  Step 1: 意图判断（文本/图片/链接/比价路由，含多目标拆解）、筛选/排序前置识别与语言判定
  Step 2: ali1688 取数落盘后传 workctl workflow 1688-product-find 后处理（搜索/比价）；英文用户附加 --lang en 与 --translation-map-file
  Step 3: 完整输出 CLI markdown（含商品墙段落）；终止序列详见 references/common/export-render.md
---

# 1688 智能选品找货

> ❗❗ **执行前必看（两个最常被遗漏的必传参数）**
>
> 1. 每次调用 MCP `find_product` 必须带 `tags="4306497"`（严选品池筛选条件，MCP 工具不会自动附加）。
> 2. **用户输入为英文时**，每次调用 `text-search` / `image-search` / `link-search` 后处理命令必须带 **`--lang en`** 与 **`--translation-map-file`**（后者提供商品标题/规格/店铺名的英译；首次搜索时映射文件可为空映射，见「语言处理」）。CLI 无法自动识别用户语言、也无法翻译商品数据，漏传则可视化页面仍为中文。
>
> 判断方法：用户本轮找货请求以英文为主 → 全程按英文用户处理（详见「语言处理」）。

## How to Use

### 处理边界

本 Skill 采用 **MCP 连接器取数 + workctl 后处理** 两段式流程，Agent 负责意图路由、语言判定、MCP 调用与展示输出。

1. **鉴权与取数交给 MCP 连接器 `ali1688`**。Agent 调用 `find_product`（必传 `tags="4306497"`）/ `offer_query_for_trade`（链接取主图）取数，不处理 AK、Token、签名或 HTTP 请求，不用浏览器或网页搜索取数。
2. **后处理交给 workctl**。`text-search` / `image-search` / `link-search` / `compare` 经 `--mcp-result-file` 接收 MCP 结果、跳过取数只做后处理（字段映射、人群过滤、推荐理由、markdown 表格与商品墙 HTML 渲染）。
3. **语言由 Agent 显式告知 CLI**。CLI 不推断用户语言，英文用户必须通过 `--lang en` 传递。
4. **compare 是纯后处理**：不取数、不产 HTML、无 `--lang`；输入为先前搜索结果 JSON（见「比价」数据链路）。
5. **agent 模式大 payload 走 artifact 投影**：搜索命令（含 `--mcp-result-file` bypass 模式）在 agent 模式 + `--format json` + 未指定 `--output` + `success: true` + 结果含 `similar_products` 时，回执中 `data` 字段照常投影为 artifact 回执（含 `artifact_id` / `next_action`），用 `workctl artifact get <artifact_id>` 获取完整数据；compare 自身不投影 artifact。

## MCP 连接器

- 连接器名称：`ali1688`（认证由连接器托管，Agent 不接触 AK/Token）。
- 本技能使用的 MCP 工具：`find_product`（取数）、`offer_query_for_trade`（链接/商品 ID 取主图）。
- `__userId__` 等用户身份参数由 MCP 网关自动注入，Agent 不手动传递。
- MCP 参数（`tags` / `pageSize` / `sortType` 等）写在 MCP 调用处，workctl 命令无这些参数；返回数量由 `find_product` 的 `pageSize` 控制（bypass 下 `--limit` 无效）。

## 能力边界与抗施压

> ★ **能力边界**：本 skill 限于 1688 商品搜索 + 信息展示（文本/图片/链接搜索、比价、商品墙展示）。发品/搬品/图片上传/草稿/下单/支付/物流/库存/店铺管理均不执行——通过追问段给快捷指令，由主 Agent 路由到对应 skill（跨 skill 衔接，不视为越权）。
>
> ★ **如实告知 > 迎合期望**——不得编造已完成的操作或不存在的能力；工具未返回的数据一律告知「该数据暂不可用」，禁止编造填充。
>
> ★ **过程叙事与 tool log 对照**——叙事中的可量化声明（次数/数量/状态，如「已重试一次」「已完成 N 个目标」）须与本次会话 tool log 事实一致，禁止声称未发生的操作或与事实不符的次数；无法确认的过程状态如实标注「未确认」，不以叙事填补。
>
> ★ **当前轮次交付（对话型两件）**：交付物 = ① **对话正文**（完整 markdown 商品表格 + summary + 追问段），✅ = 完整输出（对话内容豁免落盘要求，以回执内容完整性判定）+ ② **逐目标商品墙 HTML**（`1688-products-*.html`，CLI 生成时），✅ = CLI 成功回执 ∧ 落盘。summary 须含两件逐件 ✅/❌ 的交付清单（多目标逐目标列，见 `references/common/export-render.md`「交付清单」）。禁止以进行时态（“正在处理”“稍后完成”）或虚假承诺结束对话。
>
> ★ **交付单元绑定**：「交付正文 = summary + 追问段」不可分割，无论何种封装形式（如 `delivery` 字段）追问段必须与 summary 一起透传，禁止只透传 summary 而遗漏追问段。

## 语言处理（中英双语）

1688 平台仅支持**中文**检索，本技能按用户输入语言执行以下翻译规则。

### 语言处理速查表

| 用户语言 | `--query` 内容 | `--lang` | `--translation-map-file` | 输出 `markdown` |
|---------|---------------|----------|--------------------------|------------------|
| 中文 | 原始中文 | 不传（或 `zh`） | 不传 | 原样输出 |
| **英文** | 译后中文 | **`en`（必传）** | **英文用户必传（首次搜索映射可为空映射）** | Agent 整体译成英文后输出 |

### 语言判定

- 用户本轮找货请求以中文为主 → 判定为**中文用户**。
- 用户本轮找货请求以英文为主（如 "find me a black hoodie"）→ 判定为**英文用户**，后续命令一律带 `--lang en`。
- 中英混合时以主要叙述语言为准；仅夹杂品牌名、型号等英文词（如“找 Type-C 数据线”）仍判定为中文用户。

> 📖 输入端/输出端翻译细则、英文页面渲染与翻译映射构造见 `references/translation-and-fields.md`——**英文用户请求时先读该文件**（首次构造或补齐 translation_map.json 前必读）。

## 严格禁止

- 禁止配置、读取、提示用户粘贴或管理 AK。
- 禁止调用旧 HTTP 工具模块、旧 service 层、浏览器或网页搜索引擎请求 1688 商品数据。
- 禁止在 MCP / workctl 调用失败后自行通过浏览器访问 1688 网站搜索商品。
- 禁止让 AI 直接改写 CLI 返回的商品数据为最终表格；必须完整输出 CLI 返回的 `markdown`（英文用户按「语言处理」规则整体翻译成英文的除外，细则见 `references/translation-and-fields.md`）。
- 禁止 Agent 自行对商品做字段映射、人群过滤、比价选品、重排序或补齐数据。
- 禁止编造商品价格、链接、`product_id`、规格、销量、库存或供货信息。
- **禁止在英文用户场景下不带 `--lang en` 调用 `text-search` / `image-search` / `link-search`**（会导致可视化页面以中文渲染）。
- 用户明确要下单、支付、查物流、管库存时，不触发本技能。

★ 通用禁令（最小必含集）：

> ★ **禁止猜测或探索未文档化的命令**——所有 workctl 命令名和参数名已在 references/capabilities/ 中完整列出，禁止编造命令/参数；报错时允许运行 `workctl <cmd> --help` 查看正确参数格式并修正后重试一次。
> ★ **禁止文件探测**——禁止用 head/cat/ls/grep/find/glob/list 探测文件或目录结构；references/ 中的命令直接复制执行，不需要预检。
> ★ **禁止创建 Task**——本 skill 是场景类单轮执行，禁止 task_create / sessions_spawn。
> ★ **禁止用 `&&` 链接多个 workctl 调用**——也禁止将 workctl 与任何其他操作合并为一条复合命令；每次调用单独一条命令独立执行，单个失败不阻塞其他调用。
> ★ **禁止读取其他 skill 文件**——本 skill 的所有依赖已在 references/ 中自包含，禁止访问其他 skill 目录。
> ★ **JSON null 规范**——agent 写入的任何 JSON 文件中数值字段无值写 `null`（JSON 标准），禁止 `NaN`、`None`、`N/A`、空字符串；字符串字段无值写 `""`。
> ★ **UTF-8 编码**——所有 agent 写入的输出文件（.md / .json）一律 UTF-8 无 BOM。

## 命令入口

统一入口：

```bash
workctl workflow 1688-product-find <command> [options]
```

- 四个命令均为**纯后处理**：取数由 MCP 连接器 `ali1688` 完成，命令经 `--mcp-result-file`（或 stdin）接收 MCP 结果，跳过取数只做归一化 + 人群过滤 + markdown + 商品墙 HTML。
- 公共输出参数：`--format json|table|raw|markdown`（默认 json）、`--output <文件>`（须指向工作目录内真实文件路径；确需丢弃时 `/dev/null`（仅 macOS/Linux）为合法丢弃语义——返回成功、不落盘，下游不得再引用该路径；Windows 无此语义，改为照常输出至工作目录内真实文件且下游不消费其内容）。

| 命令 | 用途 | 完整参数与示例 |
|------|------|------------------|
| `text-search` | 文字搜索后处理 | `references/capabilities/text_search.md` |
| `image-search` | 图片搜索后处理 | `references/capabilities/image_search.md` |
| `link-search` | 链接找同款后处理 | `references/capabilities/link_search.md` |
| `compare` | 比价选品（纯后处理，无 HTML、无 `--lang`） | `references/capabilities/compare.md` |

> ❗ **bypass 契约**：传 `--mcp-result-file` 时 text/image/link 的 `--limit` 无效，返回数量由 `find_product` 的 `pageSize` 控制（默认 10、比价 20）；text-search 仍必填 `--query`、link-search 必填 `--url`。compare 候选来自上游搜索结果（artifact get 物化或直接比价取数落盘），compare 自身不投影 artifact。

各命令完整参数（含必传参数）以上表 capability reference 与命令自身 `--help` 输出为准，错误处理见 `references/common/error-handling.md`。

输出统一为 workctl success envelope 包裹：

```json
{"success": true, "markdown": "...", "data": {"data": {...}}}
```

## When to Use

- **触发**：自然语言描述商品找货、上传图片找同款/找相似、提供 1688 商品链接或商品 ID 找同款、搜索结果中选定商品后要求比价（触发词与示例问法见 frontmatter `triggers` / `examples`）。
- **不触发**：下单/支付/结算、查物流/订单状态、管库存/改商品信息、闲聊且没有找商品意图（见「严格禁止」末条与 frontmatter `description`）；店铺主页/类目浏览维度的检索（如「逛某店铺的全部商品」「按类目浏览」）同样不触发——该维度不属商品检索，本 skill 不支持。
- **店铺/类目浏览输入的处理**（已触发会话内遇到时）：① 如实声明本 skill 不支持店铺/类目维度浏览；② 引导改用本 skill 支持的检索方式——请用户提供具体商品词（走文字搜索）、商品图片（走图片搜索）或 1688 商品链接/商品 ID（走链接找同款）；③ 店铺管理与发品由主 Agent 路由对应 skill。禁止以 site: 限定搜索或网页抓取自行替代（见「严格禁止」）。

## 意图判断

### 筛选/排序请求（前置识别）

- 排序要求（“按销量排序”“最便宜的排前面”）→ 映射为 `find_product` 的 `sortType` 参数（`price_asc` / `price_desc` / `sold_desc` / `yx_desc`，见「MCP 工具调用规则」），检索结果即按该排序返回，无需声明限制。
- 条件筛选要求（价格区间、材质、属性排除，如“50-100 元的”）→ **先向用户声明当前不支持该条件筛选**，再按下方决策树正常检索（筛选意图可保留在搜索词中）；禁止编造筛选效果，不得声称结果已按该条件筛选。
- 数量要求（“找 10 款/15 个”）不是筛选/排序——通过 `find_product` 的 `pageSize` 传递。

## 多目标拆解

> 📖 请求含多个互相独立的搜索目标时先读 `references/common/multi-target.md`——三情形路由表（多关键词 / 文本+图片混合 / 搜索+比价并存）与三段批量化执行（N 个目标约 3 轮完成，不逐目标跑完整链路），含「write 与消费其文件的命令不同批」「真依赖保持串行」两条批量化红线。单目标场景不适用批量化，按各命令流程串行执行；禁止合并 query（合并会污染检索）。

## 调用决策树

```text
用户输入（英文输入先按「语言处理」规则译成中文搜索词，且后处理命令全部附加 --lang en；每次 find_product 必传 tags="4306497"）
├─ 纯文本描述商品 → MCP find_product(query=..., pageSize=默认10/按需, sortType=按排序意图) → workctl text-search 后处理
├─ 上传图片/图片 URL
│  ├─ 明确要求比价 → MCP find_product(imageUrl/imgBase64=..., pageSize=20) → workctl compare 后处理
│  └─ 找同款/找相似 → MCP find_product(imageUrl/imgBase64=...) → workctl image-search 后处理
├─ 1688 链接/商品 ID
│  ├─ MCP offer_query_for_trade(offerId=...) 获取 image
│  ├─ MCP find_product(imageUrl=image, pageSize=默认10/按需；比价固定20)
│  └─ workctl link-search 或 compare 后处理
└─ 已展示搜索结果，用户选中某款后说“比价”
   └─ 取该商品 image_url → MCP find_product(imageUrl=..., pageSize=20) → workctl compare 后处理
```

## MCP 工具调用规则

> ❗ **重要**：每次调用 `find_product` 必须携带 `tags="4306497"`，该参数是严选品池筛选条件，MCP 工具不会自动附加。

- `sortType` 可选四值：`price_asc` / `price_desc` / `sold_desc` / `yx_desc`；比价场景默认不传 `sortType`（保持 MCP 默认相关性/相似度召回，由 compare 按销量、价格、严选指数做确定性筛选）。
- `offer_query_for_trade` 用于 1688 链接/纯数字商品 ID 获取商品详情和主图（淘宝/天猫链接无法自动获取主图，引导用户提供商品图片 URL 或直接上传图片，改走 `image-search`；主图链路五步流程见 `references/capabilities/link_search.md`）。
- 📖 `find_product` 完整参数表（`query` / `imageUrl` / `imgBase64` / `pageSize` / `sortType` / `purchaseAmount` / `tags` / `icTags` 各参数类型、默认值与口径）见 `references/capabilities/mcp-params.md`——**首次构造 MCP 取数调用或核对参数时先读**。

## 搜索与后处理（MCP 取数 + workctl 后处理）

两段式通用步骤：① 调用 MCP 取数 → ② 将 MCP 返回 JSON 落盘 `search_result_N.json`（多目标按序编号，按下方「write 落盘模板」立即执行；回执被 artifact 投影时按模板内「artifact 投影分支」字节级搬运）→ ③ 对应 workctl 命令带 `--mcp-result-file` 做纯后处理。多目标时先读 `references/common/multi-target.md` 按三段批量化执行（同类调用同批，write 与消费其文件的命令不同批）。

### write 落盘模板（②的执行规范，照此调用）

MCP 取数成功后**立即落盘**——先落盘，再做任何其他处理；返回内容越大（数万字符级）越必须先落盘，超时中断时未落盘的数据会全部丢失且需重取。write 工具（`write_file`）调用按以下快照执行（`file_path` 与 `content` 两参数照此填写）：

```json
{"tool": "write_file", "file_path": "<当前工作目录>/search_result_1.json", "content": "<MCP 返回的 JSON 原文，完整复制>"}
```

> ★ **`file_path`**：当前工作目录内 `search_result_N.json` 的**绝对路径**——单目标 `search_result_1.json`；多目标按目标顺序 `search_result_2.json`、`search_result_3.json`…；重试落盘不得覆盖已有成功产物（见 `references/common/multi-target.md`）。⛔ 禁止写 `/tmp`、临时目录或工作目录外任何路径——③ 的后处理命令按工作目录内路径消费该文件，路径漂移直接产生 ENOENT 次生故障。
>
> ★ **`content`**：MCP 返回的 JSON **原文**，完整复制——禁止截断、改写、重排或只摘录部分字段；数值字段无值写 `null`（JSON 规范见「★ 通用禁令」）。
>
> ★ **编码与写入方式**：UTF-8 无 BOM（见「★ 通用禁令」）。⛔ 禁止用 shell 重定向（`>` / `>>` / `Out-File`）或 echo / cat 代替 write 工具落盘——重定向会产生编码损坏（如 UTF-16LE / BOM）或路径漂移，导致后处理解析失败。
>
> 落盘成功后才发起 ③ 的 workctl 后处理（`--mcp-result-file` 消费该文件）。
>
> 落盘失败（磁盘/权限/工具异常）→ 重试至多 1 次，仍失败如实告知并停止该目标的 ③ 后处理（该目标按已有数据或降级路径处理）；禁止改用 shell 重定向等替代方式落盘。
>
> ★ **artifact 投影分支**（MCP/workctl 回执被 artifact 投影时 ② 的替代落盘方式，与上方主形态并列）：回执被投影的判定——agent 上下文仅收到回执 preview（原文不在上下文中，主形态「`content` = 原文完整复制」物理不可执行），完整原文存于 skill-executor 的 tool-results 暂存区（暂存路径形如 `…/agent-core/tool-results/<会话标识>/…`，以回执/平台提示给出的实际路径为准）。此时按以下步骤落盘：
>
> 1. **字节级搬运**：用 python 字节读写（`open(src,'rb').read()` → `open(dst,'wb').write(data)`）或 `cp`，将暂存区原文文件原样搬运到 `search_result_N.json` 目标路径——上方 `file_path` 条款（绝对路径、按目标序号编号、防覆盖、禁写 `/tmp`）全部适用，仅「write 工具写 `content`」这一动作由搬运替代。搬运以内联单条命令执行（如 `python3 -c '…'`），禁止写成脚本文件再执行。
> 2. **搬运后三重验证**：① UTF-8 无 BOM + ② JSON 可解析 + ③ items 数与回执一致（回执 preview 可见 10 款商品则解析后条目数须为 10）。验证不通过 → 重新字节级搬运（至多 1 次），仍不通过按上方「落盘失败」口径如实告知并停止该目标的 ③ 后处理；⛔ 禁止手工修补或改写文件内容。
> 3. **暂存文件 schema**（r2 探测 KeyError 实锤，避免逐键盲猜）：success envelope 包裹形态的暂存回执形如 `{"success":true,"data":{"markdown":...}}`——顶层无 `markdown` 键，验证或读取字段时取 `data.markdown` 路径（`d["data"]["markdown"]`）。
>
> ⛔ **分支边界**：仅在回执被投影（上下文无原文）时使用本分支；未被投影时仍按主形态用 write 工具落盘。搬运是**字节级复制**——禁止截断、改写、重排暂存内容或只摘录部分字段（同主形态 `content` 条款）、禁止写入 `/tmp`、临时目录或工作目录外任何路径（同 `file_path` 条款）；搬运用的 python 字节读写/`cp` 不属「编码与写入方式」条款禁止的 shell 重定向（字节级复制不产生编码损坏），但仍禁止改用重定向/echo/cat 写文件。三重验证通过后才发起 ③ 的 workctl 后处理（`--mcp-result-file` 消费该文件）。

### 文本搜索

- 取数：`find_product(query="中文搜索词", pageSize=10, tags="4306497")`（排序意图传 `sortType`；数量需求改 `pageSize`），返回 JSON 落盘 `search_result_1.json`。
- 后处理：`workctl workflow 1688-product-find text-search --query "中文搜索词" --mcp-result-file search_result_1.json`（英文用户附加 `--lang en --translation-map-file translation_map.json`；`--query` 传中文搜索词，bypass 下仍必填）。
- 完整参数与输出要求见 `references/capabilities/text_search.md`。

### 图片搜索

- 取数：`find_product(imageUrl="图片URL", pageSize=10, tags="4306497")`（本地图片经客户端/网关转 base64 后以 `imgBase64` 传入），返回 JSON 落盘 `search_result_1.json`。
- 后处理：`workctl workflow 1688-product-find image-search --image "图片URL或图片标识" --mcp-result-file search_result_1.json`（英文用户附加 `--lang en --translation-map-file translation_map.json`）。
- 完整参数与输出要求见 `references/capabilities/image_search.md`。

### 链接找同款

- 取数：主图链路——`offer_query_for_trade` 从链接/商品 ID 取主图后 `find_product(imageUrl=主图, pageSize=10, tags="4306497")`（决策树含该链路；五步流程见 `references/capabilities/link_search.md`），返回 JSON 落盘 `search_result_1.json`。
- 后处理：`workctl workflow 1688-product-find link-search --url "https://detail.1688.com/offer/xxx.html" --image "主图URL" --mcp-result-file search_result_1.json`（`--url` 传 1688 商品链接或商品 ID，bypass 下仍必填；英文用户附加 `--lang en --translation-map-file translation_map.json`）。
- 完整流程与参数见 `references/capabilities/link_search.md`。

### 比价

`compare` 为**纯后处理**命令：不取数、不生成 HTML、无 `--lang` 参数。输入为搜索结果 JSON（`find_product` 返回的 MCP envelope），候选来自上游搜索取数结果。

数据链路（A. 已有搜索结果：artifact get 物化后传 compare；B. 直接比价：先经 `find_product(imageUrl, pageSize=20, tags="4306497")` 取数落盘再传 compare）与选品逻辑（三维度确定性选品，Agent 不自行重算）详见 `references/capabilities/compare.md`。

## 输出完整性要求

- Agent 必须完整输出 CLI 返回的 `markdown` 字段（英文用户按「语言处理」规则整体翻译后输出）。
- **多目标整合透传**：多目标取数成功后，逐目标完整结果均进对话正文——每个目标各自完整输出其 CLI 返回的 `markdown` 全文（「各出各的 markdown」的整合形态：全部目标逐一透传，见 `references/common/multi-target.md`），禁止以落盘文件替代对话正文输出，禁止仅输出摘要。
- 禁止省略、截断或重排表格行。
- 禁止丢失商品链接。
- 禁止把表格改写成列表、卡片或自行组织的格式。
- 除「语言处理」允许的语言转换（英文用户整体翻译成英文）外，禁止修改 `markdown` 中的任何数据内容。
- Agent 的补充分析只能追加在 `markdown` 之后，不能混入表格，且须标注来源命令（如 `workctl workflow 1688-product-find text-search`）与本次搜索时间。
- **报价/方案类汇总成表许可口径**（试运行版，待小样本会话观察后固化）：用户明确要求将多个商品的报价/字段汇总成表时，Agent 可基于**本次 CLI 返回数据**整理汇总表——作为补充分析追加在 CLI `markdown` 之后（遵守上条「不能混入表格」边界），逐项逐字引用、不改算、不新增、不补齐 CLI 未返回的数据，并标注来源命令与本次搜索时间；跨商品的比价选品/字段重算仍须走 `compare` 命令（禁止 Agent 自行判定，见「严格禁止」）。
- 回复中商品数据均来自本次 CLI 调用返回，禁止跨调用混用。

### 可视化商品墙页面（必须展示）

> ❗ **强制要求**：CLI 返回的 `markdown` 末尾如果包含 `🖼️ [**可视化商品页面**]` 链接段落，Agent **必须原样展示**该段落（含分隔线 `---` 与完整链接路径），**禁止省略、删除、隐藏**，禁止改写为其他格式或仅口头提及"已生成文件"而不展示路径——该页面是用户操作入口（勾选商品、发起询盘、批量铺货），遗漏将导致用户无法使用核心功能。
>
> - 商品墙 HTML 落盘到**当前工作目录**（文件名形如 `1688-products-*.html`），路径以 CLI 返回的 markdown 中实际路径为准。
> - `markdown` 中不含该段落（如 HTML 生成失败）时不需要展示，禁止口头虚构。
> - 中/英文版段落格式示例见 `references/common/export-render.md`「商品墙链接段落展示规范」。

### 交付协议与终止序列

> ★ Manifest v1 交付声明（十字段）、Manifest 声明表（visibility 映射）、登记基准（双基准：回执 ∧ 落盘，对话正文豁免落盘）、终止序列（manifest.json → direct_answer.md → present_files → summary（含交付清单）+ 追问段）、交付清单、交付核对清单与降级规则，全部详见 `references/common/export-render.md`。首次执行终止序列前：先完整阅读该文件。本节「输出完整性要求」的完整 markdown 输出与商品墙段落展示规则不变。

## 对话追问（Follow-up）

> 对话交付时，summary 之后**必须**追加追问段。summary 与追问段只生成一次（SSOT）——定稿后写入 `direct_answer.md` 并在对话中逐字复用，禁止两处各写一版。
>
> 📖 追问段格式（`💡 进一步探索` + 2-3 条快捷指令）、找货类/发品类内容规则与 URL 发品平台白名单见 `references/common/followup-rules.md`——**对话交付收尾（终止序列）前先读该文件**。

## 字段映射

CLI 内部会将 MCP 返回字段映射为稳定字段（如 `product_id` / `title` / `price` / `detail_url`）；完整「稳定字段 → 来源字段」映射表见 `references/translation-and-fields.md`（需核对输出字段含义或排查字段缺失时读取）。

## 错误处理

- **MCP 取数段失败**：原样转达 MCP 错误信息（不自行发明恢复操作）；鉴权类错误（401/OAuth/unauthorized）按 `references/common/error-handling.md` 双路径口径将鉴权指引写入最终执行结果返回（推荐引导用户回复「重新授权 1688」完成对话式授权；⛔ 禁止用 ask_user 发起鉴权追问），授权完成后按原查询重试。
- **workctl 后处理失败**（`success: false` envelope）按类型处理：授权无效/过期→同上口径引导重新授权；网关超时/502/网络异常→提示稍后重试；参数错误→经 `--help` 核对修正后重试一次；空结果→引导换关键词/降低相关性要求/提供更清晰图片。
- **先复现再归因**：失败诊断不得以未复现的机制假设直接指导行动或陈述——先复现失败（重跑/读回执定位实际失败点）再归因；未验证的机制假设须标注为「推测」，不得升格为确定结论（如路径类失败先确认实际路径/落盘状态，不径直判定为数据问题而重复取数）。
- **禁止提示用户配置 AK；禁止浏览器或网页搜索降级**。
- 详见 `references/common/error-handling.md`。

## Dependencies

| Tool | Purpose |
|------|---------|
| `workctl workflow 1688-product-find text-search` | 文字搜索后处理 |
| `workctl workflow 1688-product-find image-search` | 图片搜索后处理 |
| `workctl workflow 1688-product-find link-search` | 链接找同款后处理 |
| `workctl workflow 1688-product-find compare` | 比价选品（纯后处理） |
| MCP `find_product`（连接器 `ali1688`） | 商品搜索取数（必传 `tags="4306497"`） |
| MCP `offer_query_for_trade`（连接器 `ali1688`） | 1688 链接/商品 ID 取主图 |
| `read_file` | 读取 references 指令文件（流程多处要求先读，如 multi-target / export-render / followup-rules） |
| `write_file` | MCP 结果落盘（`search_result_N.json`）、翻译映射与终止序列文件（`manifest.json` / `direct_answer.md`）生成 |
| `present_files` | 交付 user 可见文件（商品墙 `1688-products-*.html`） |

> 前置：`ali1688` MCP 连接器须已完成 OAuth 授权；未授权/授权过期时按 `references/common/error-handling.md` 引导重新授权，不绕过、不降级取数。

## 免责声明

1. 您理解并同意，技能运行结果和输出内容可能因适用的 AI agent、大模型不同而产生差异或幻觉，请您对重要信息进行甄别核实。
2. 本技能的认证由 MCP 连接器托管，请勿在聊天中提供 AK、Token 等身份凭证。
3. 您使用本技能时应保持其完整性，不得擅自篡改技能的配置、规则文件或其他内容。
4. 受限于当前技术发展，我们无法保证技能所有运行结果、输出内容的准确性、真实性、时效性，请您谨慎核实技能运行结果和输出内容。
