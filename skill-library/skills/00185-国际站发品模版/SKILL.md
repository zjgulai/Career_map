---
name: alibaba-global-smart-publish
version: 1.0.0
description: |
  Supports publishing from material packages/URLs, batch publishing/product variants, and creating, referencing, and reusing publishing templates.
  Uses the data flow "submit cloud material processing with `workctl icbu-ggs product analyze-merge-optimize-material` (returns taskId) -> poll for JSON data with `workctl icbu-ggs product query-material-analysis-result` (returned directly in model) -> save `product.json` locally without modification -> publish each item by passing the material parsing result directly to `workctl icbu-ggs product new-publish-product`";
  Saves a single master template to the session artifacts panel. Does not handle product field optimization, market analysis, or image generation.
enabled: true

triggers:
  - publishing template
  - create publishing template
  - save product template
  - publish using a referenced template
  - publish from material package
  - publish from URL
  - batch publishing
  - variant publishing

examples:
  - Help me publish a product using these images and save it as a template
  - Only generate a sofa publishing template for me
  - Publish this new product based on the "Sofa Publishing Template"
  - Copy the previous configuration and publish a batch

excludes:
  - skill: alibaba-global-smart-optimize
    when: The user wants to modify, edit, or optimize fields such as the title, price, selling points, images, or attributes of an existing product or draft product
  - skill: alibaba-global-ai-image-studio
    when: Image-processing requests in the context of publishing from a material package/URL (image generation, color changes, white-background images, watermark removal, scene images, model images, etc.) -- always write them to user_query.json for cloud processing; invoking local image_edit/image_generate is prohibited

workflow: |
  1. Apply the "Decision Rules" to identify one of the 5 intent categories (create template + publish / create template only / publish using a referenced template / publish via Product.xlsx / publish from a material package / URL / batch publishing and variant creation)
  1.5 When publishing from a material package/URL, first execute `ask_publish_mode` and use ask_user to select the publishing mode. **Based on the user's language detected according to the "Multilingual Output Rules," invoke ask_user using the corresponding language version below verbatim. Rewriting, abbreviating, substituting synonyms, changing the option order, adding or removing options, or appending questions is prohibited** (the contract is maintained in sync in the `ask_publish_mode` section of [reference/material-publish.md](reference/material-publish.md); any change must be synchronized in both directions):
      - header: zh `Publishing Mode Selection` / en `Publish Mode`
      - question: zh `Please select a publishing mode.` / en `Please select the publishing mode?`
      - options (choose one of two; fixed order): 1. label zh `AI Publishing (including image generation)` / en `AI Publishing (with image generation)`, description zh `AI intelligently analyzes materials and automatically completes the category, attributes, SKUs, and product-detail decoration. It supports editing attributes according to instructions and AI image generation. Suitable for scenarios with insufficient images or scattered materials that require AI completion.` / en `AI smart material analysis, auto-fill category, attributes, SKU and detail decoration, supports attribute editing and AI image generation. Suitable for insufficient images or scattered materials needing AI completion.`; 2. label zh `Minimal Publishing (excluding image generation)` / en `Minimal Publishing (without image generation)`, description zh `Skips product-detail decoration and AI image generation for faster publishing with lower consumption. Suitable when 5 product images and several product-detail images have already been prepared and the materials are complete.` / en `Skip detail decoration and AI image generation, faster publishing with lower consumption. Suitable when 5 product images and detail images are already prepared.`
      Select AI Publishing -> continue to step 2; select Minimal Publishing -> skip step 2 (`plan_select`), set decorationPlan to `minimal`, and follow the same steps 3-7 as AI Publishing; do not guide ordinary material-package publishing to step 8 (`save_template`), but still execute step 8 if the user's intent is "create template + publish"
  2. Select the publishing plan decorationPlan (premium/standard), using ask_user to let the user choose a publishing plan. **Based on the user's language detected according to the "Multilingual Output Rules," invoke ask_user using the corresponding language version below verbatim. Rewriting, abbreviating, substituting synonyms, changing the option order, adding or removing options, or appending questions is prohibited** (the contract is maintained in sync in the `plan_select` section of [reference/material-publish.md](reference/material-publish.md); any change must be synchronized in both directions):
      - header: zh `Publishing Plan Selection` / en `Decoration Plan`
      - question: zh `Please select your publishing and decoration plan.` / en `Please select your publishing and decoration plan?`
      - options (choose one of two; fixed order; labels must not be simplified and must be output verbatim): 1. label zh `[All-in-One Premium Edition]` / en `【Premium Edition】`, description zh `All-in-one publishing + structured product-detail premium edition (generates/optimizes 6-10 images), including selling-point discovery and multiple rich AI-generated HD images; suitable for flagship store products.` / en `All-in-one publishing + structured detail premium edition (generate/optimize 6~10 images), includes selling point mining, multiple rich AI HD image generation, suitable for flagship products.` (premium); 2. label zh `[Cost-Effective Standard Edition] (Recommended)` / en `【Standard Edition】(Recommended)`, description zh `All-in-one publishing + structured product-detail standard edition (generates/optimizes 3-5 images), including selling-point generation and basic product-detail decoration; suitable for regular store products and rapid product testing.` / en `All-in-one publishing + structured detail standard edition (generate/optimize 3~5 images), includes selling point generation, basic detail decoration, suitable for regular products and quick testing.` (standard)
  2.5 Multi-product detection (execute only when the user provides `.xlsx` / `.xls` / `.csv` and `parse-product-excel --probe` returns `isProductXlsx: false`): first execute `workctl publishflow split-material` in scan mode -> the Agent reads `scan_result.json` to determine which sheet contains multiple products -> if there are at least 2 rows of product data, execute split mode to split them into N subdirectories -> enter the parallel multi-product pipeline (run parse_collect -> material_process -> material_poll -> fetch_json -> publish in parallel for each subdirectory -> unified present). See Phase 0 of [reference/material-publish.md](reference/material-publish.md) for details
  3. Material collection parse_collect (only for publishing from a material package/an existing MD file; URL publishing uses url_collect): **first execute `workctl publishflow material-extract`** to extract materials and produce `result/extracted_texts.json` + `result/image_list.json` -> upload images to the CDN -> generate `user_query.json` -> use `workctl publishflow material-collect` to package and upload to OSS, yielding `MATERIAL_PATH` (`data.ossUrl`). Skipping extract and using Write to create files directly is prohibited. URL publishing uses url_collect: generate `url_publish.json` -> use `material-collect --mode url-publish` to package `url_publish.json` + `decoration_plan.json` as a ZIP and upload it to OSS, yielding `MATERIAL_PATH`
  4. Submit material processing: `workctl icbu-ggs product analyze-merge-optimize-material --ossUrl "$MATERIAL_PATH" --extInfo "$EXT_INFO" --format json` (`EXT_INFO` = `{"decorationPlan":"<premium|standard|minimal>"}`; the returned `data` is taskId, recorded as `MATERIAL_TASK_ID`)
  5. Poll for the material-processing result: `workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" --format json` -> nonempty `model` means JSON data has been obtained (for initial parsing, sleep 20 for at most 25 attempts; for merging user modifications, sleep 10 for at most 30 attempts)
  6. Save the JSON returned directly in `model` locally as `product.json` without modification (if the top level is a list, preserve the original text); Product.xlsx is only rendered and saved in parallel (`render-product-excel`) and does not participate in processing the initial publishing input
  7. Publish: parse the top-level list/object in `product.json`, **save each item as a separate JSON file**, then execute `MATERIAL="$(cat "$ITEM_JSON")"` -> `workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" --format json` for each item; `PUBLISH_TYPE` defaults to `product` (formal publication) and changes to `draft` only when the user requests a draft; **the Agent must dynamically determine the publishing type from human instructions and pass it explicitly: multi-product batches (a top-level list with at least 2 items, multi-row Excel splitting, or variant creation) default to `draft` (publish as drafts), and `--publishType draft` must be passed explicitly, because omitting it will formally list the entire batch; pass `product` only when the user explicitly requests that the whole batch be formally listed**. A successful item returns `model` (containing `productId` + quality score `{finalScore, lowScore, deductReasons, qualityScoreMessage}`); a failed item (`success=false`) with `errorCode`/`errorMsg` enters the completeness-filling process (the Agent parses all errors in one batch -> the user chooses Excel completion or reference-product backfilling -> after updating the item JSON, republish that individual product (**using the same `--publishType` as that item's initial publishing attempt**; if the first attempt used draft, republishing must explicitly include it), for at most 3 rounds). Only if completion still fails should it fall back using `--publishType draft` (multi-product batches are already drafts, so republish as draft after completion; if it still fails after 3 rounds, record it directly as a publishing failure)
  8. Save 1 master template according to the intent / prompt the user to save it

data_flow_contract: |
  The material-processing submission command is fixed as `workctl icbu-ggs product analyze-merge-optimize-material --ossUrl "$MATERIAL_PATH" --extInfo "$EXT_INFO" --format json`, where `EXT_INFO` is a JSON string that must contain `decorationPlan` (`premium` / `standard` / `minimal`); record the returned `taskId` (the `data` field) as `MATERIAL_TASK_ID`. If the response is `success:true` but `taskId` is empty (for example, `data:null`), treat the material-processing submission as abnormal and do not proceed to polling.
  The material-processing polling command is fixed as `workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" --format json`; if it returns a processing status, initial material parsing must execute `sleep 20` before the next poll, and the JSON data is obtained after polling completes. Use low-noise reporting during polling: output in the conversation body only when polling starts, after every 5 attempts that are still processing, and on success, failure, or timeout; for other processing attempts, only wait and query.
  After polling completes, `model` directly contains the JSON data. Save it to `product.json` without modification; during the save stage, only writing it to disk unchanged is permitted. If the top level is a list, the original list text must be preserved; split it into individual product items only during the subsequent publishing stage. Field cleaning, format repair, or rewriting business content is prohibited. Each item must first be saved as a separate JSON file; during publishing, use `cat` on that file to obtain the string input.
  Product.xlsx is a standard intermediate artifact that is saved in parallel and does not enter the critical path for initial publishing.
  The publishing command is fixed as `workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" --format json`; `new-publish-product` accepts only the `material` and `publishType` input fields. The parameter type of `material` is a string (str); if the material-parsing result is a list, the Agent must extract each individual product JSON item and first save every item as a separate JSON file; if it is a single object, it must likewise be saved as 1 item JSON file. Then, for each item file, independently execute `MATERIAL="$(cat "$ITEM_JSON")"` -> `workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" --format json`. By default, this skill parses the top-level list/object from the unmodified downloaded `product.json`; splitting is limited to generating individual item JSON files. Field filtering, field cleaning, format repair, and object reconstruction are prohibited. Passing the entire list directly as `material` in one call is prohibited. Re-encoding an item as a backslash-escaped JSON string literal (for example, `"{...}"`) is prohibited. Switching to `--json` / `--json-file` or manually constructing an outer `{"material":"$MATERIAL"}` JSON object is prohibited. `PUBLISH_TYPE` defaults to `product` (formal publication) and changes to `draft` only when the user explicitly requests a draft; **multi-product batches default to `draft`, and `--publishType draft` must be passed explicitly**. On success, `model` is an object containing a numeric-only `productId` + quality score `{finalScore, lowScore, deductReasons, qualityScoreMessage}`; on failure, `success=false` with `errorCode`/`errorMsg` enters the completeness-filling process (the Agent parses all errors and identifies them in one batch -> the user chooses Excel completion or reference-product backfilling -> update the item JSON -> republish that individual product, **using the same `--publishType` as that item's initial publishing attempt**, for at most 3 cycles). Only after 3 unsuccessful cycles or if the user gives up should that item fall back separately using `--publishType draft` (multi-product batches are already drafts, so republish as draft after completion; if it still fails after 3 rounds, record it directly as a publishing failure). Automatically falling back to draft immediately after failure is prohibited. Only the minimal-publishing flow for an existing Product.xlsx ([material-excel-publish.md](reference/material-excel-publish.md)) appends `--strip-agent-edit-ai-detail` when generating JSON (first backfill the 5 categories of fields, then recursively remove `agentEditAiDetailDTO` at any nesting level); for minimal publishing from a material package (`decorationPlan: "minimal"`), the cloud MCP guarantees that this field is not returned, so local cleaning is unnecessary; `premium` / `standard` must retain this field, and deleting it with Python `del`, `jq del`, or any inline script is prohibited.
  The present output is fixed as a summary of all publishing results. After successful publishing, outputting any URL, hyperlink, clickable link, or navigation entry in the results table, text, or any other location is prohibited, regardless of name or form, including but not limited to product management, draft editing, edit and publish, or go to edit. Adding an "Action" or "Details/Action" column containing links is prohibited. Report the publishing status only in plain text (formally published and listed / draft saved); a draft produced by fallback must state both "Formal publication failed; automatically fell back to a draft" and the reason formal publication failed. If some items fail, output both the failed item numbers and their error information. Each successful item must also output quality-score information: `lowScore=false` -> no deductions; `lowScore=true` -> list the deduction items corresponding to `deductReasons`; `lowScore=null` -> display `qualityScoreMessage`. After successful publishing (for all flows), rename Product.xlsx to `<productId>.xlsx`: for a single product, directly run `mv "<working directory>/Product.xlsx" "<working directory>/<productId>.xlsx"`; for multiple products, use `workctl publishflow render-product-excel --in <path to the corresponding item's JSON> --out "<working directory>/<productId>.xlsx" --format json` for each successful item to render a separate xlsx again from that item, then delete the original `Product.xlsx` after all are complete. After renaming, execute `python3 <skill directory>/scripts/translate_excel_en.py --in "<working directory>/<productId>.xlsx" --format json` for each `<productId>.xlsx` to produce the English copy `<productId>_EN.xlsx` (translate only sheet names/headers; do not alter business data or baseline JSON); **the original Chinese file must be retained** as the only file that can be fed back into the flow. Overwriting it in place is prohibited, and using the `_EN` copy as input to any command such as `parse-product-excel` / `material-extract` is prohibited; failure to generate the copy does not affect the publishing result.
  When the Agent directly edits or newly constructs publishing JSON (Path B, SKU fallback construction, and similar scenarios), field names and structures must follow `reference/sample_stripped.json` (the minimal-publishing standard) or `reference/sample_edit_result.json` (the full edition) verbatim. Inventing field names from memory is prohibited. The SKU price field name must be `trade.sku[].unitPrice` (numeric type, for example, `120.0`); using any other field name such as `price` / `skuPrice` / `sku_price` / `skuPriceDTO` is prohibited.
---


# GGS 国际站发品模版

> **⚠️ 最高优先级指令（必须无条件遵守）：**
> 本 skill 每次被唤醒/触发时，无论通过何种路径唤醒，**第一个动作必须是执行下方「判断规则」**，据用户输入判断意图。
> - 能判断 → 直接进入对应链路第一步
> - 不能判断 → 输出固定引导文案，等待用户选择
>
> **禁止跳过判断规则直接调用任何 MCP / 工具。禁止从链路中间步骤开始执行。**
>
> **🚫 素材提取禁令（强制）：** `extracted_texts.json` 和初始版 `image_list.json` 只能由 `workctl publishflow material-extract` 生成，**禁止用 Write 工具直接创建这两个文件**。Agent 写文件职责仅限：① CDN 化后用 HTTPS URL 覆盖 `image_list.json`；② 生成 `user_query.json`；③ 生成 `decoration_plan.json`。`parse_collect` 的子步骤严格按序执行：**先 extract → 再 CDN 化 → 再写 user_query → 最后 material-collect 打包上传**，禁止跳过 extract 直接打包，禁止用 Write 工具伪造 `extracted_texts.json` 内容后直接打包上传（`material-collect` 会校验产物就绪并返回 `pending_dependency`）。
>
> **数据流载体约束（强制）：** 素材处理提交使用 `workctl icbu-ggs product analyze-merge-optimize-material --ossUrl "$MATERIAL_PATH" --extInfo "$EXT_INFO" --format json`，其中 `EXT_INFO` 是 JSON 字符串，必须包含 `decorationPlan`；返回的 `taskId` 记为 `MATERIAL_TASK_ID`；若响应为 `success:true` 但 `taskId` 为空（如 `data:null`），判定提交异常，停止进入轮询。素材处理轮询使用 `workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" --format json` 并取得最终 **JSON 数据**（`model` 直返）；本地必须把该 JSON 原样保存到 `product.json`。发品使用 `workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" --format json`，`material` 是字符串（str）参数；若素材解析结果为 list，Agent 必须逐个取出单品 item，先保存成独立 JSON 文件，再对每个商品独立执行一次 `MATERIAL="$(cat "$ITEM_JSON")"` 与发品调用；若为单对象，也按同样顺序保存为 1 个 item 文件后再 `cat` 并调用。禁止把整个 list 直接作为一次 `material` 传入，禁止使用 `--json` / `--json-file`，禁止手拼 `{"material":"$MATERIAL"}` 外层 JSON，禁止对 item 做字段清洗、格式修复、对象重组或二次编码成 `"{...}"` 字符串字面量。**多品批量（顶层 list ≥2）必须由 Agent 显式加 `--publishType draft`**。
>
> **present 输出约束（强制）：** 发品完成后必须输出全部 item 的结果汇总，按每个成功 item 的**最终发布类型**区分输出，禁止混用两种链接拼接方式：正式发布成功（`publishType=product`）不拼接单品链接，告知已正式发布上架并统一透出卖家后台[「商品管理」](https://hz-productposting.alibaba.com/product/manage_products.htm#/product/all)链接，禁止给正式品拼 `pubAction=draft` 草稿编辑链接；草稿成功（用户要求发草稿、多品批量默认，或完整性补全后回退）逐个透出草稿编辑链接 `https://post.alibaba.com/product/publish.htm?itemId=<productId>&pubAction=draft`，`<productId>` 必须替换为对应 `new-publish-product` 返回 `model.productId` 中的真实 productId，禁止只输出商品 ID，回退产生的草稿须同时说明正式发布失败原因；若部分 item 失败，必须同时列出失败 item 序号与 `errorMsg` 错误信息。每个成功 item 还须输出质量分：`lowScore=false` → 无扣分项；`lowScore=true` → 列出 deductReasons 对应的扣分原因；`lowScore=null` → 显示 qualityScoreMessage。
>
> **全链路去预览：** 素材处理 MCP + 发品 MCP 直出结果，**无任何中间预览 / 确认 slot**。
>
> **🚫 禁止爬取商品链接（强制）：** 当用户提供 alibaba.com / 1688 / 淘宝 / AliExpress / Amazon 等商品 URL 时，**禁止使用 WebFetch / web_fetch / 浏览器子代理等方式直接抓取页面内容**。正确做法按链路区分：
> - **链路 F（模版来源 = URL）**：从 URL 中提取 productId → `workctl icbu-ggs product query-product-by-id --productId <productId> --format json` 获取商品数据后由 skill 落盘 `template/ref_<productId>.json`
> - **url_collect（URL 发品，含或不含修改需求）**：构造 `url_publish.json` → `material-collect --mode url-publish` 打包上传 → 由**云端**负责抓取 URL 内容
> - **completeness_check 参考品补全**：从 URL 中提取 productId → `workctl icbu-ggs product query-product-by-id`
>
> alibaba.com 等电商站点有反爬机制，WebFetch 必定失败。所有 URL 内容获取一律通过 MCP 或云端完成，Agent 本地**只做 productId 提取**。
>
> **云端素材处理能力范围（禁止本地截胡）：** 云端 `analyze-merge-optimize-material` MCP 能处理以下诉求：价格/MOQ/交期/包装设置、SKU换色/多色变体、白底图/去水印/场景图/模特图/图片翻译、标题优化/卖点重写/多语言/关键词、类目属性调整等。这些诉求一律以自然语言写入 `user_query.json`，由云端统一处理。**在本 skill 执行期间禁止读取或调用 `alibaba-image-generation` / `alibaba-product-optimization` 等其他 skill，禁止调用 `image_edit` / `image_generate` 等本地工具。**
>
> **用户诉求单一入口原则（禁止双重处理）：** 用户原始 query 中的所有修改诉求（价格、标题、SKU、图片、属性等），只通过 `user_query.json`（素材包）或 `url_publish.json` 每条的 `user_query`（URL）一次性透传给云端 MCP，由云端在初次解析时融合到返回的 `product.json` 中。**`render_excel` 完成后到 `publish` 之间，主 Agent 禁止依据同一份原始诉求回头核对、回填或编辑 Product.xlsx / product.json 的任何字段**——即使发现某字段为空或看起来不匹配 user_query，也必须直接走 publish，不做二次编辑。只有在 `present` 之后用户明确提出**新的**修改诉求时，才走 [reference/material-excel-edit.md](reference/material-excel-edit.md) 修改链路。
>
> **轮询展示约束（强制）：** 素材处理轮询采用低噪音展示。进入轮询时只提示一次"素材解析已提交，预计需要几分钟，我会持续等待并在完成后继续发品。"；处理中轮次优先静默执行等待和查询；每 5 次仍处理中最多输出一行"素材解析仍在处理中，我会继续等待。"；成功、失败或超时时再输出明确结果。Bash 工具展示文案使用短句，例如"等待 20 秒后继续查询素材解析结果"。

> **多语言输出规则（强制）：** 先检测用户输入语言，再执行和回复。所有对话输出（含 `ask_user` 的 header / question / options、轮询提示、present 结果、引导文案）必须跟随用户输入语言直接输出；若无法识别，则默认英文。无论输出语言是什么，以下术语始终保持英文不翻译：decorationPlan 枚举值（`premium` / `standard` / `minimal`）、publishType 枚举值（`product` / `draft`）、MCP 工具名与 workctl 命令名、JSON 字段名（`unitPrice` / `moq` / `agentEditAiDetailDTO` 等）。`ask_user` 文案以中文（zh）为**语义基准**（见 reference 各章节与下文 workflow 内联契约）：用户输入中文时直接使用 zh 版文案，输入其他语言时由 Agent 以 zh 语义为基准**直接输出为用户输入语言**，保持选项数量、顺序、语义一致。reference 中同时提供英文（en）版仅作参考，非翻译中转。

在 Alibaba.com 国际站（ICBU）发布商品并沉淀可复用的发品模版。

## 一、意图识别与链路路由

根据用户当前消息识别意图，路由到对应 reference 文档，与唤醒路径无关。

### 判断规则

1. **创建模版 + 发品** — query 同时含「生成/创建模版」与发品意图（或用户上传素材且要求"发品并保存成模版"）
   - → 读取 [reference/template.md](reference/template.md)（链路 1）

2. **仅创建模版** — query 仅含「生成/创建模版」意图，无发品意图（如"只帮我生成一个沙发模版"）
   - → 读取 [reference/template.md](reference/template.md)（链路 2，**必过素材处理 MCP**）

3. **引用模版发品（素材+模版联合发品）** — 用户提供已有模版（xlsx）、参考品 productId、或商品 URL 作为**参考/模版**进行发品，可同时携带新素材（图片等）；模版以结构化方式传递给云端（template.json），而非当作文本素材。
   - 典型 query：「参考这个品发品」「学习/照着/按照这个链接发品」「用这个链接当模版」「参考 productId + 图片」「引用模版发品」「价格/属性跟这个链接一样」
   - **与 Rule 4 的区分**：当用户提供商品 URL **且同时有自己的素材（图片等）**，URL 的作用是作为参考/模版（提供属性、价格、结构参考），用户自己的素材才是商品主体 → **走链路 F**。Rule 4 的 URL 场景是 URL 本身就是要发的商品（无另外的图片素材）。
   - **alibaba.com 链接强制走本链路**：凡是 alibaba.com 相关的链接，无论用户表述如何，**一律走链路 F**。原因：alibaba.com 是发品目标站，url_collect 云端抓取无法获取站内品，只能通过提取 productId → `query-product-by-id` MCP 获取数据。
   - → 读取 [reference/template.md](reference/template.md)（链路 F）

4. **通过 Product.xlsx / 素材包 / URL 发品** — 用户上传素材文件（图片/ZIP/Excel/Word/PPT/PDF/MD）、提供**非 alibaba.com 的外站** URL（无论是否附带修改/生图/编辑/属性变更等需求；无修改需求时 `url_publish.json` 各条目 `user_query` 传空串 `""`），或已有 Product.xlsx 要发品
   - → 读取 [reference/material-publish.md](reference/material-publish.md)（链路一 / 链路 H）
   - **Excel 文件路由检测（强制）**：用户传入 `.xlsx` / `.xls` / `.csv` 文件时，先执行结构探测确定入口：
     ```bash
     workctl publishflow parse-product-excel --in <xlsx文件路径> --probe --format json
     ```
     - 返回 `{"isProductXlsx": true}` → 该 Excel 是标准 Product.xlsx（含 Sheet「商品信息」+ Sheet「基线JSON」），走 [reference/material-excel-publish.md](reference/material-excel-publish.md)（已有 Product.xlsx 发品）
     - 返回 `{"isProductXlsx": false}` → 该 Excel 是普通素材，走 [reference/material-publish.md](reference/material-publish.md)（素材包发品）；进入 Phase 0 多品检测（scan → Agent 判断 → split），检测到多品则进入多品并行管线，否则当作单品素材处理
   - 素材包/URL 发品时，先执行 `ask_publish_mode`：**根据「多语言输出规则」检测到的用户语言，逐字使用 workflow 步骤 1.5 中对应语言版本的 ask_user 契约文案**（zh: header `发品方式选择` / question `请选择发品方式？` / options `AI 发品（含图片生成）`、`极简发品（不含图片生成）`；en: header `Publish Mode` / question `Please select the publishing mode?` / options `AI Publishing (with image generation)`、`Minimal Publishing (without image generation)`），**禁止改写、缩写、同义替换、调整选项顺序、增减选项或追加问题**；选极简发品 → 走 [reference/material-publish.md](reference/material-publish.md) 极简发品分支
   - 通过已有 Product.xlsx 发品时（probe 确认），先按 [reference/material-excel-publish.md](reference/material-excel-publish.md) 询问「素材包发品 / 极简发品」
   - 纯素材包（图片/ZIP/普通 Excel 等，无 URL）也走本链路

5. **批量发品 / 裂变** — 用户要复制已有配置批量发一批
   - → 读取 [reference/material-excel-publish.md](reference/material-excel-publish.md)（链路二）

6. **无法判断** — 若无法通过用户输入判断意图，**必须**输出以下固定引导文案（按「多语言输出规则」使用用户语言输出同等含义的文案，以下中文为语义基准），等待用户明确选择。**禁止自行推断、禁止跳过引导直接执行。**

   > 我是国际站发品模版助手，可帮您发布商品并沉淀可复用的发品模版。请选择：
   > 1. **发品并保存模版** — 上传素材或提供链接，我发布后帮您保存成发品模版
   > 2. **仅创建模版** — 只生成一个发品模版，暂不发布
   > 3. **引用模版发品** — 提供已有模版文件 + 新素材，AI 结构化引用模版快速发同类商品
   > 4. **批量发品 / 裂变** — 复制已有配置批量发布一批

## 二、核心数据流（所有发品链路共用）

```
[素材包 / URL / 已有 Product.xlsx]
        │
        ▼
选发品方式 ask_publish_mode(AI 发品/极简发品)   ← ask_user 反问卡片（⚠️ 必须先读 reference/material-publish.md ask_publish_mode 章节再调用 ask_user，按「多语言输出规则」使用对应语言版本的 header/question/options，禁止自行编造；选极简发品跳过 plan_select，decorationPlan 固定为 minimal）
   ├─ AI 发品 → 下方流程
   └─ 极简发品 → 跳过 plan_select，decorationPlan="minimal"，其余步骤与 AI 发品一致（parse_collect/url_collect → material_process → material_poll → fetch_json → render_excel → publish → present）

已有 Product.xlsx：按 reference/material-excel-publish.md 询问「极简发品 / 素材包发品」

AI 发品分支：
选发品方案 decorationPlan(premium/standard)   ← ask_user 反问卡片（⚠️ 必须先读 reference/material-publish.md plan_select 章节再调用 ask_user，按「多语言输出规则」使用对应语言版本的 header/question/options，禁止自行编造；极简发品跳过本步，固定 minimal）
        │
        ▼
素材处理提交：workctl icbu-ggs product analyze-merge-optimize-material --ossUrl "$MATERIAL_PATH" --extInfo "$EXT_INFO" → data 为 taskId
        │
        ▼
workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" → model 直返 JSON 数据（处理中则 sleep 20/10 再查）
        │
        ▼
本地保存 model JSON 到 product.json（原样落盘）
        ├─ workctl publishflow render-product-excel → 渲染 Product.xlsx 落盘（产物/模版来源，并行展示）
        └─ Agent 解析 list/object → 单品 item 落独立 JSON 文件 → cat 文件得到 JSON 文本字符串 → workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE"（多品批量须显式加 --publishType draft；失败 item 进 completeness_check，3 轮后 --publishType draft 单独回退）→ 汇总全部发布结果（无预览、无发品轮询）

修改发品数据（跨链路通用，按修改主体双轨，见 reference/material-excel-edit.md）：
  用户手动改（路径A）：用户编辑 Product.xlsx Sheet 1 → parse-product-excel（xlsx→product_edited.json，默认保留 agentEditAiDetailDTO；仅已有 Product.xlsx 极简发品追加 --strip-agent-edit-ai-detail 先回填后删除）
  Agent 帮改（路径B）：从 Product.xlsx Sheet 2 提取基线 JSON → Agent 直接编辑 JSON → publish-from-json --validate-only 校验（极简发品追加 --strip-agent-edit-ai-detail）→ product_edited.json；禁止 Agent 编辑 xlsx
  ⚠️ Agent 直编/新写 JSON 字段时，字段名与结构必须逐字参照 reference/sample_stripped.json（极简标准）或 reference/sample_edit_result.json（完整版），禁止凭记忆自造字段名；SKU 价格字段名必须为 trade.sku[].unitPrice（数字类型），禁止 price / skuPrice / sku_price / skuPriceDTO（那是老版/global 版 skill 的字段）
  → 解析 product_edited.json 顶层，逐 item cat 后用 workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" 发品
```

- MCP 调用命令见本文件「MCP / 工具速查表」。
- present 输出固定为全部 item 的结果汇总，发品成功后禁止在结果表格、文本或任何位置输出任何 URL、超链接、可点击链接或跳转入口（无论使用什么名称或形式，包括但不限于商品管理、草稿编辑、编辑并发布、去编辑等），禁止新增「操作」或「详情/操作」列放置链接，仅以纯文本告知发布状态（正式发布上架/草稿已保存）；部分失败时同时列出失败 item 序号与错误信息。
- Product.xlsx 字段规范见 [reference/product-excel-format.md](reference/product-excel-format.md)。
- 用户 query 意图透传文件（user_query.json）见 [reference/user-query-format.md](reference/user-query-format.md)。
- URL 发品输入清单（url_publish.json）见 [reference/url-publish-format.md](reference/url-publish-format.md)。
- 模版格式与命名见 [reference/template-excel-format.md](reference/template-excel-format.md)。
- 模版保存与产物面板见 [reference/template.md](reference/template.md)。

## 三、Task-Based Execution Protocol（任务执行协议）

路由判断完成后，按 DAG 任务系统驱动执行。plan 以 session 内存对象为权威（承载 `intent` / `materialTaskId` / `materialJson` / `productJsonPath` / `decorationPlan` / `subtasks` 等）；task 系统承载 step 持久化状态、依赖与任务面板渲染。**禁止跳过本协议直接调用工具。**

### Step 1: Plan — 一次性创建完整 DAG（2-pass init）

平台 task API 不支持 `task_create` 内联 `blockedBy`，用 2-pass 初始化：

1. **Pass 1（并行 task_create）**：一个 response 内按 plan.steps 顺序并行创建全部 task，不传依赖；记录返回 `task.id` 回写 `plan.steps[i].taskId`。
2. **Pass 2（并行 task_update 串依赖）**：`task_update({ taskId, addBlockedBy: [<上一 step.taskId>] })` 串线性依赖。
3. **Pass 3（task_list 验证）**：`task_list({})` 核对全部 task 已建、依赖符合 DAG。

**禁止分批创建、禁止用模型记忆替代 task_list 验证。** 本框架**无 confirm / merge 预览 step**，DAG 支持线性与 fan-out/fan-in 两种形态（多品并行管线为 fan-out/fan-in）。

各链路 DAG 定义见对应 reference 文档「DAG 结构」章节，典型形态：

```
链路一/H(单品): ask_publish_mode → { AI 发品: plan_select → { URL: url_collect | 素材包: parse_collect } → material_process → material_poll → fetch_json → render_excel → publish → present → [save_template?]
                    | 极简发品(素材): → { URL: url_collect | 素材包: parse_collect } → material_process(minimal) → material_poll → fetch_json → render_excel → publish → present → [save_template?] }
链路一/H(多品): ask_publish_mode → plan_select → scan_material → [Agent判断] → split_material → batch_1(≤20品并行) → batch_2(≤20品并行) → ... → unified present → [save_template?]
链路2(仅创建模版): plan_select → parse_collect → material_process → material_poll → fetch_json → render_excel → save_template
链路F(引用模版): resolve_template → ask_publish_mode → { AI 发品: plan_select → parse_collect(仅用户新素材) + template_extract → category_check → material_collect --template → material_process → material_poll → fetch_json → render_excel → publish → [completeness_check] → present
                 | 极简发品: decorationPlan=minimal(跳过 plan_select) → parse_collect(仅用户新素材) + template_extract → category_check → material_collect --template → material_process(minimal) → material_poll → fetch_json → render_excel → publish → [completeness_check] → present }
链路H(极简发品-Product.xlsx): [edit?: 用户手动改→路径A xlsx_edit | Agent帮改→路径B json_edit+validate-only] → parse-product-excel(--strip-agent-edit-ai-detail，路径B已产出校验后 JSON 则跳过) → publish → present
```

**多品并行编排**：split 后以批次为粒度创建 task（每批 ≤20 个商品），不拆到单品 task。批次间串行依赖（batch_2 blockedBy batch_1），present 依赖最后一个 batch。每个 batch task 内部由 Agent 自行并行处理各子目录（parse_collect → material_process → material_poll → fetch_json → publish）。例如 50 个商品：split → batch_1(品1~20) → batch_2(品21~40) → batch_3(品41~50) → present，共 5 个 task。

### Step 2: Execute — 按 plan.steps 顺序推进

1. 取下一个 `pending` step → `task_update({ taskId, status: "in_progress" })`
2. **必须先读取该 step 对应 reference 章节（按 step.id 锚点）再执行**——尤其 `ask_user` 步骤，header / question / options 必须逐字取自 reference 文档，禁止在读取 reference 文档之前调用 ask_user、禁止自行编造文案或增减选项。按文档执行（workctl 命令、轮询、ask_user）
3. 成功：`task_update({ taskId, status: "completed" })`，关键产出写 `plan.steps[i].output`（尤其**最新 JSON 数据 / 本地 JSON 路径**）
4. 失败：老 API 无 `failed`/`skipped`，统一 `task_update({ taskId, status: "archived", description: "[FAILED] <原 description> — 错误: <摘要+traceId>" })`
5. `i++` 回到 1

> **无预览分支**：本框架不存在素材包 confirm 后是否 merge 的分支，Execute 主循环为线性推进。

### Step 3: Verify — 验证所有任务完成

plan 跑完后 `task_list` 检查：无遗留 `pending`/`in_progress`；依赖符合 DAG。遗留则按『取消分支兜底』处理。

### 取消分支兜底

用户主动取消或检测到不可恢复错误时：
1. 当前 step task → `archived`，description 前缀 `[CANCELLED] ... — 原因: <用户取消/错误摘要>`
2. 所有下游未完成 task → 并行 `archived`，前缀 `[CANCELLED] ... — 原因: 上游 <stepId> 取消`
3. 内存 plan 标 `cancelled`
4. 若已建工作目录 `analysis_<YYYYMMDD_HHMMSS>/`，删除
5. 输出一行 `✅ 已取消本次发品流程。` 不再 ask_user

### ask_user 渲染规范

SKILL.md 及 reference 中所有"向用户展示 / 等待确认 / 提示 / 引导"节点，默认必须通过 `ask_user` 实现而非纯文本。

- `message` 支持完整 Markdown 与自定义组件，格式与对话直接输出一致
- 快速操作按钮：reference 以表格列出 label/description 的小节，提供 zh（语义基准）/ en（英文参考），**按「多语言输出规则」跟随用户输入语言直接输出为 `ask_user` 的 `options` 数组**（中文用 zh 版、其他语言以 zh 语义为基准直接输出为用户语言），不得改名/改序/省略，保持选项数量、顺序、语义一致
- 未传 `options` 会渲染默认兜底按钮，属违规
- 按钮存在同时仍允许用户自由打字输入

> **本框架无强交互预览 slot**：全链路去预览，不提交任何预览 render slot；发品结果直接由 present step 输出。

### Task 系统与 reference 文档的边界

- ✅ Task 系统决定：任务创建、依赖管理、状态推进、任务面板渲染
- ❌ Task 系统不决定：每步调什么 MCP/工具、入参构造、轮询秒数、状态判断、展示排版 —— 一律按 reference 执行
- ❌ Task 系统不能绕过 reference 里的禁令（如数据流载体 JSON 约束、去预览约束、会话隔离禁读 memory）

## 四、MCP / 工具速查表

> **调用入口说明**：全链路统一使用 `workctl` 命令，**禁止调用 accio-mcp-cli**。业务能力（素材处理提交/轮询、发品、类目预测、参考品查询）统一走 `workctl icbu-ggs product <命令>`；本地文件处理（素材提取/打包、Excel 渲染/解析、多品拆分、模版导出、完整性 Excel 处理、URL 清单打包上传）统一走 `workctl publishflow <命令>`。业务命令与本地命令均统一追加 `--format json` 以获得可解析的 JSON 输出。单图 CDN 地址只通过内置 `read` 工具读取本地图片获得。

### 素材采集

| 命令/工具 | 用途 | 入参 |
|------|------|------|
| `workctl publishflow material-extract` | 仅用于 `parse_collect` 的素材提取子步骤：从素材文件提取图片和文本，输出 `result/`（`image_list.json`/`extracted_texts.json`，如有 PDF 额外输出 `pdf_pages_local.json`/`pdf_pages/`）。若返回 `success:true` 但三个计数全为 0 且工作目录根下存在素材文件，说明素材格式不受支持或文件损坏，须向用户说明并要求补充可解析素材，禁止继续打包。`parse_collect` 的打包/OSS上传走 `workctl publishflow material-collect` | `--work_dir <工作目录> --format json` |
| 内置 `read` 工具 | 单图 CDN 化入口：读取 `image_list.json` 的本地文件名，按 `<工作目录>/result/<文件名>` 调用 `read` 获取 HTTPS CDN URL，并按原顺序覆盖写回 `image_list.json`；若存在 `pdf_pages_local.json`，按 `<工作目录>/result/<相对路径>` 调用 `read`，把返回 URL 按原顺序写入 `pdf_pages.json` | 本地图片绝对路径 |

### 素材处理（提交 MCP + 轮询 MCP）

| 能力 | 用途 | 入参 | 出参 |
|------|------|------|------|
| `workctl icbu-ggs product analyze-merge-optimize-material --ossUrl "$MATERIAL_PATH" --extInfo "$EXT_INFO" --format json` | 提交云端素材解析/合并优化任务 | `MATERIAL_PATH` = parse_collect/url_collect 输出的 OSS 地址；`EXT_INFO` = JSON 字符串，格式 `{"decorationPlan":"premium|standard|minimal"}` | 返回 `taskId`；`taskId` 为空时判定提交异常 |
| `workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" --format json` | 轮询素材处理结果 | `MATERIAL_TASK_ID` = 上一步返回的 `taskId` | `model` 非空且解析后无 `errorCode` / `errorMsg` 时完成，`model` 直接包含 JSON 数据，原样保存到 `product.json` |

### 发品

| 能力 | 用途 | 入参 | 出参 |
|------|------|------|------|
| `workctl icbu-ggs product new-publish-product --material "$MATERIAL" --publishType "$PUBLISH_TYPE" --format json` | 用单品素材同步发品 | 命令名严格使用 `new-publish-product`；仅允许 `material`、`publishType` 两个入参；`material` 是字符串（str）参数。若 `product.json` 顶层为 list，Agent 必须拆成多个单品 item，每个 item 先保存为独立 JSON 文件，再通过 `MATERIAL="$(cat "$ITEM_JSON")"` 读取文件内容作为 JSON 文本字符串并单独调用一次发品命令；若为单对象，也按 1 个 item 文件处理。禁止把整个 list 作为一次 `material`，禁止 Python/jq/shell 字段清洗、格式修复、对象重组或二次编码成 `"{...}"` 字符串字面量；`PUBLISH_TYPE` 默认 `product`（正式发布），仅用户明确要求发草稿/多品批量时使用 `draft`；禁止改用 `--json` / `--json-file` 或手拼外层 JSON | 每次调用返回 `success/errorCode/errorMsg/model`；成功时 `model` 为对象含纯数字 `productId` + 质量分 `{finalScore, lowScore, deductReasons, qualityScoreMessage}`，失败时 `success=false` + `errorCode`/`errorMsg`；全部 item 结果汇总输出 |
| `workctl icbu-ggs product predict-category` | 素材+模版链路 category_check 的类目预测：入参 imageInfo/textInfo（至少一项非空），返回类目候选列表（元素含 cateId/cateLevel/catePath）。Agent 自行拼装素材/模版的 texts/images 为两个 List<String>，取候选首个 cateId 与模版类目对比；非英语输入须先翻译为英文类目描述再作为 textInfo（预测服务对中文支持差） | `--imageInfo "<图片URL列表>" --textInfo "<文本列表>" --format json` | 类目候选列表 JSON |
| `workctl icbu-ggs product query-product-by-id` | 链路 F 参考品查询：按 productId 查商品全量信息（类目/属性/SKU/图片/描述等），做归属校验（sellerId 必须与当前用户一致）。Agent 从返回 JSON 中提取 categoryId、并过滤组装 texts/image_list（丢弃 product-gallery/非 CDN 图/HTML）后落盘 `template/ref_<productId>.json` | `--productId <id> --format json` | 商品查询结果 JSON（ProductQueryResultDTO） |

### 本地文件处理

> workctl publishflow 命令的文件缺失/未就绪返回 `success=true` + `data.status="pending_dependency"`（按引导补齐后重试），入参可修正错误返回 `data.status="pending_fix"`。

| workctl 命令 | 用途 |
|------|------|
| `workctl publishflow render-product-excel --in <json> --out Product.xlsx --format json` | JSON → 渲染 Product.xlsx（Sheet 商品信息 + 基线JSON，保留全部 ID） |
| `workctl publishflow parse-product-excel --in Product.xlsx [--out product_edited.json] [--require-image] [--strip-agent-edit-ai-detail] --format json` | 改后 xlsx → 严格发品 JSON（基线 + 可见区 overlay，保留 `agentEditAiDetailDTO`；极简发品加 `--strip-agent-edit-ai-detail` 删除任意层级该字段） |
| `workctl publishflow parse-product-excel --in <xlsx> --probe --format json` | 探测 Excel 是否标准 Product.xlsx → 输出 `{"isProductXlsx": true/false}` |
| `workctl publishflow publish-from-json --input <json> --validate-only [--strip-agent-edit-ai-detail] --format json` | 路径B Agent 直编 JSON 后的结构校验（四大块完整性、必填字段、ID 保全、阶梯价与 MOQ 一致性自动修正）；**仅 `--validate-only` 校验用途**，实际发品仍走 `new-publish-product` |
| `workctl publishflow export-template-excel --in <json> --category <类目名> [--out-dir <目录>] [--with-date] --format json` | 出 1 个总模版（无子模版），命名 `{类目}发品模版.xlsx`（重名自动加日期） |
| `workctl publishflow split-material --work_dir <工作目录> --format json`（scan）<br>`workctl publishflow split-material --work_dir <工作目录> --split --target-file <文件名> --target-sheet <sheet名> --header-row <表头行号> [--image-dirs <目录1,...>] --format json`（split） | 多品 Excel 本地拆分两阶段 |
| `workctl publishflow material-collect --work_dir <工作目录> [--mode url-publish] [--template] --format json` | parse_collect 打包上传（素材+模版链路加 `--template`）；成功返回 `data.ossUrl` |

本 skill 另附 1 个本地脚本（非 workctl）：

| 脚本 | 用途 |
|------|------|
| `python3 <skill目录>/scripts/translate_excel_en.py --in <xlsx> [--out <xlsx>] --format json` | 产出 xlsx 的英文副本 `_EN.xlsx`（仅翻 Sheet 名/表头/模版固定说明文案，不动业务数据与「基线JSON」单元格）；在 `present` 重命名之后、`save_template` 产出模版之后各执行一次。副本文件名会把 `发品模版` 换成 ` Publish Template`（类目名不翻），**一律以返回的 `excelPath` 为准**。**禁止原地覆盖**（传同路径会报 `IN_PLACE_FORBIDDEN`），中文原件是唯一能通过 `parse-product-excel --probe` 的可回流文件；`_EN` 副本仅供阅读，禁止作为任何命令入参或引用模版。返回 `UNMAPPED_LABEL` 说明 xlsx 结构变更，此时不产出文件且**不影响发品/模版保存结果** |

### 发品完整性补全（completeness_check 步骤）

| workctl 命令 | 用途 |
|------|------|
| `workctl publishflow render-completeness-excel --product <item JSON> --missing-fields <逗号分隔path列表> --out <xlsx> --format json` | item JSON + 缺失字段 → 高亮 Excel（缺失列红色字体，空值填「待补充」） |
| `workctl publishflow parse-completed-excel --in <用户Excel> --base <原item JSON> --out <更新后JSON> --format json` | 用户补全后的 Excel → 非空值写回 item JSON（数字自动解析，「待补充」跳过） |
| `workctl icbu-ggs product query-product-by-id --productId <id> --format json` | 参考品补全取数：查得参考品商品信息供 Agent 按缺失字段回填 |

> **命令调用统一使用绝对路径 + 非空校验**：workctl 本地命令的 `--work_dir` 必须传写文件工具返回的绝对路径，禁止传相对路径。

# 会话隔离

每次执行本 skill 都是独立任务：

1. **必须从判断规则开始执行**：禁止跳过判断规则直接调工具，禁止从链路中间步骤开始，禁止假设之前步骤已完成。即使用户声称"之前解析过"也须重新执行。
2. **本地 JSON 仅来自当前会话**：发品所用 JSON 路径、素材轮询所用 `taskId` / JSON 数据只能从当前会话上游步骤返回值获取，禁止从 memory 读取。
3. **不复用历史结果**：即使商品相似也须重新执行完整流程。
4. **禁止读取记忆/缓存文件**：禁止读 `memory/queries.json`、`TASK_HISTORY.json` 等历史数据作为执行依据。
5. **每次从零开始执行完整流程**。

## 错误处理

- **网络/工具调用错误**：默认自动重试 2 次；仍失败则报告错误（含 traceId）并终止。
- **completeness_check 批量修复（强制）**：`new-publish-product` 返回 `success=false` 时，Agent 必须**一次性解析 errorMsg 中的所有错误**（可能含多个字段缺失/冲突），在同一轮中批量修复所有可识别的问题后再重试，**禁止只修一个字段就重试**。具体做法：
  1. 解析 errorMsg，提取所有缺失/非法字段（如 pkgWeight=0、MOQ 冲突、SKU 价格缺失等）
  2. 若选择参考品回填：一次性从 `query-product-by-id` 参考品数据中提取所有相关字段，批量写入 item JSON
  3. 若选择 Excel 补全：`render-completeness-excel` 将所有缺失字段一次性标记到高亮 Excel 中，用户补完后 `parse-completed-excel` 一次性回写
  4. 修复完成后重发该单品（`new-publish-product`），最多 3 轮（每轮都应批量修复该轮所有错误）
- **发品结果判断**：`new-publish-product` 成功判断为 `success=true` 且 `model.productId` 为纯数字；`success=false` 或 `model.productId` 非纯数字视为失败，进入 completeness_check。
- **本地文件处理命令的 pending 状态**：`workctl publishflow` 的本地文件处理命令（`render-product-excel`/`parse-product-excel`/`publish-from-json --validate-only`/`export-template-excel`/`split-material`/`material-collect`/`material-extract`/`render-completeness-excel`/`parse-completed-excel`）对文件缺失/未就绪返回 `success=true` + `data.status="pending_dependency"`（含 `next_step`/`retry_after_ms`），对入参可修正错误返回 `data.status="pending_fix"`（含 `next_step`/`details`）——均**不是错误**，按 `next_step` 引导补齐或修正后重试，不要走错误终止分支。
- **轮询超时**：告知用户超时并提供手动跟进指引（提供 `taskId` / JSON 数据）。

## 轮询实现规范

素材处理轮询由 `workctl icbu-ggs product query-material-analysis-result` 驱动，遵循：

0. 确认来源：`taskId` / JSON 数据只能从当前会话上游步骤返回值提取，禁止 memory/历史/口述来源。
1. 计数器置 0。
2. 调用轮询命令：`workctl icbu-ggs product query-material-analysis-result --taskId "$MATERIAL_TASK_ID" --format json`，每次只调用一次。
3. 失败判断：`success === false`，或 `errorDTO` 非空，或 `model` 非空且按 JSON 解析后包含 `errorCode` / `errorMsg`。
4. 成功判断：`model` 非空，且按 JSON 解析后不包含 `errorCode` / `errorMsg`；`model` 直接包含 JSON 数据，原样保存到 `product.json`。
5. 处理中：`model` 为空且无错误时，必须先执行等待命令，再发起下一次独立轮询；禁止连续快速调用。
6. 初次素材解析固定执行 `sleep 20`，每次等待 **20 秒**，最多 **25 次**；用户修改合并场景固定执行 `sleep 10`，每次等待 **10 秒**，最多 **30 次**。

> **禁止将轮询循环包装为一次性脚本**（如 `while`/`for` wrapper、后台轮询、`nohup`/`&`）：会吞错误、屏蔽进度、无法人工介入。必须由执行者分次直接调用，并保持「查询一次 → 判断三态 → 如处理中则 `sleep 20`（初次解析）/`sleep 10`（修改合并）→ 再查询一次」的节奏。
