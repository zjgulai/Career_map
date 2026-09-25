---
name: 定制模板生成
version: "6.9.0"
description: |
  将商品目录、产品画册 PDF 或已确认页序的手册图片转换为定制商品表格，并在校验通过后导入定制商品。
  用于目录级产品族、定制项和代表图提取；不用于通用 PDF 阅读、普通发品模板、已有商品优化或单纯图片处理。
enabled: true

triggers:
  - 定制模板生成
  - PDF 定制模板
  - 产品目录
  - 商品目录
  - 产品画册
  - 商品画册
  - catalog PDF
  - 定制项表
  - 定制商品导入
  - 有序手册图片

examples:
  - 把这份产品目录 PDF 转成定制模板
  - 从这个产品画册提取可选定制项
  - 这些手册图片已按顺序上传，帮我生成定制
  - Convert this catalog PDF into customizable products and import them

excludes:
  - skill: alibaba-product-publish
    when: 用户要用 URL、素材包、图片、附件或 Product.xlsx 创建普通商品，或创建、保存、引用普通发品模板，而不要求从目录识别产品族和定制项
  - skill: alibaba-product-optimization
    when: 用户要修改或优化已有商品、草稿商品的标题、价格、SKU、属性、图片或详描
  - skill: image-prompt-guide
    when: 用户只要生成或处理图片、白底图、场景图、去背景、换色、去水印或图片翻译
renderers:
  import-results:
    description: 完整展示 PDF Catalog 逐产品导入结果
    app: app/index.html
---

# PDF / 顺序图片 → 产品可定制项表格

**版本：6.9.0**

在当前 CGS 主 Agent 前台直接执行完整链路。不得调用 `sessions_spawn`、`sessions_send`，不得委派给 `skill-executor`、通用 SubAgent 或后台 Agent；交互、视觉检查和工具调用都留在当前任务中。

由执行模型直接读取规范化源 PDF 并完成语义判断。脚本只负责纯图片转 PDF、确定性校验、取图辅助、拼表、外链发布和最终导入，不调用外部模型。

## 核心不变量

- 把最终产品表达为买家可配置的产品族，不机械按型号、编号或页面卡片拆分。
- 先建立最小叶子候选，再对同一预分组中的全部候选强制执行兼容性比较；叶子候选不等于最终产品。
- 只有合并后仍能准确表达全部定制维度、选项范围和依赖关系时才合并。
- 多个叶子合并后必须用款式、类型或其他来源可证的选项保留买家可感知差异；不能静默抹掉差异，无法无损表达时继续拆分。
- 具备完整交付形态、共同产品族标题和独立款式名的辅件或配套成品也必须建立叶子候选；不能只因它服务于另一商品就降级成 item。
- 把型号、货号、编号、序列仅用于识别候选，绝不写入 `items`。
- 区分页面版式与商品关系；`product_cards` 不自动代表不同产品。
- 判断定制证据的 `product/series/category/catalog/unresolved` 作用域；页序只能辅助判断，不能单独证明作用域。
- 作用域与最终 include/exclude 分开判断；已由章节或品类确定的宽证据不能因缺少具体型号文字、条件冲突或局部覆盖退回 `unresolved`。
- 更具体的证据覆盖更宽泛的证据，不能用全局范围扩大局部明确限制。
- 宽作用域证据含条件分支时先按产品局部规格过滤；局部冲突只覆盖冲突分支，不能导致整页证据被丢弃，也不能跨分支合并选项。
- 只把买家能够选择或提交的维度写入 `items`；固定属性、累计卖点、使用步骤和无法验证的候选必须排除。
- 每个 `input` item 都必须在 `options[0]` 写一个非空输入提示；优先使用来源中的真实示例、范围或格式，没有时按 item 名生成中性提示，不得把提示伪装成完整选项集。
- `result.json` 除根字段 `source_pdf_name` 外的所有字符串值必须使用简洁英文并只含可打印 ASCII 字符；翻译 item 名或 select 值时同步更新对应审计记录，不能破坏一对一映射。
- 为每个 select option 建立 accept/give_up 终态；只截取 PDF 原有且值得展示的视觉主体，没有可用视觉主体时以 `localizability=none` 直接 give_up；标签只用于冻结前证明映射，不要求进入最终 crop，不生成、重绘、翻译图片，也不复制含兄弟 option 的共享区域冒充单项图片。
- 同一来源证据应用到多个产品时只生成一套 option 资产，通过 binding 复用；不同来源页或局部范围不得只按 option 名跨页复用。
- PDF 是理想输入。纯图片输入必须先提示页序风险并取得用户确认，再严格按用户上传顺序生成一图一页的源 PDF；不得用文件名、修改时间、目录遍历顺序或 shell glob 自行重排。

## 参数与环境

- 当前任务附件和用户输入：用户提供的 PDF、按上传顺序排列的图片，或相应目录；不得使用其他任务附件。
- `SKILL_DIR`：从本轮 Skill `read` 返回的绝对 `install_path` 取得；不得猜测账号目录。
- `<输出目录>`：用户明确指定可写目录时使用该目录，否则使用当前可写任务目录。
- `RUNTIME_PYTHON`：宿主 Python 依赖检查成功后返回的绝对解释器路径。

选择宿主提供的 Python 3 命令运行一次：

```bash
<HOST_PYTHON> "<SKILL_DIR>/scripts/bootstrap_runtime.py"
```

bootstrap 只检查 `fitz` 和 `PIL`；缺少任一模块时使用当前解释器和附属 `requirements.txt` 安装一次。仅当 stdout JSON 的 `ready=true` 时保存其 `pythonPath` 为 `RUNTIME_PYTHON`。失败时按 `errorCode` 停止；不得创建 venv，不得使用 `sudo`、`--user`、备用解释器或自动重试。

`workctl` 由插件运行时提供。上传脚本使用 `WORKCTL_PATH` 或 PATH 定位它，并兼容 Windows `.cmd/.bat`；Skill 不安装或升级 workctl。

## 引用文件

- 执行第一轮和第二轮前，完整阅读 `references/extraction_guide.md`；它是页面分类、证据作用域、产品聚合和 item 判定的唯一语义规则来源。
- 写任何 JSON/JSONL 或表格前，阅读 `references/schema.md`；它是所有产物字段和约束的唯一结构来源。
- 仅在进入产品代表图步骤前阅读 `references/image_guide.md`；不要在页面语义分析阶段加载取图细节。
- 仅在进入 select option 代表图步骤前完整阅读 `references/option_image_guide.md`；它定义 option 定位、分类、裁图和独立验收。

## 执行流程

### 0. 输入路由与纯图片转 PDF

先解析用户实际提供的文件，不要只根据描述猜测输入类型：

- 只有 PDF、没有图片：用户已明确指定时直接使用；存在多个 PDF 且用户未明确指定时，使用 `ask_user` 选择本轮 PDF，然后进入步骤 1。
- 没有 PDF、只有可读取的单帧图片：向用户发送以下提示并等待明确确认。

> 理想的产品手册是 PDF 形式。当前输入为纯图片；请确认这些图片已经按产品手册的阅读顺序上传，否则可能因页序错误导致对页面含义、跨页关系和证据作用域产生误解。是否继续按当前上传顺序合成为 PDF？

用户未确认或否认页序正确时停止，不得生成 PDF。用户确认后：

1. 按用户消息中的附件顺序构造图片绝对路径列表；不得按文件名、路径、时间戳或目录顺序排序，也不得使用 shell glob。
2. 选用尚不存在的产品输出目录；目录名优先使用用户给出的手册名，否则使用 `image_catalog`。不得覆盖已有 `source_from_images.pdf`。
3. 严格按图片列表顺序运行：

```bash
mkdir -p "<输出目录>/{图片集合名}"
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/images_to_pdf.py" \
  -o "<输出目录>/{图片集合名}/source_from_images.pdf" \
  "<第1张图片绝对路径>" "<第2张图片绝对路径>" "<其余图片绝对路径>"
```

4. 检查脚本 JSON 输出的 `order_preserved=true`，且 `page_count` 等于输入图片数。生成 PDF 的第 1 页对应第 1 张上传图片，依此类推。
5. 把生成的 `source_from_images.pdf` 作为规范化源 PDF，把 `<输出目录>/{图片集合名}/` 作为后续产品输出目录；从步骤 1 起与普通 PDF 完全使用同一链路。后文所有 `<输出目录>/{pdf名}/` 在本分支均指这个目录，不得再按 `source_from_images` 嵌套一层。

输入同时包含 PDF 和图片、包含不支持的文件，或无法可靠取得图片上传顺序时，不得自行拼接；使用 `ask_user` 请用户明确选择 PDF，或重新提供并确认有序的纯图片集合。

### 1. 逐页召回

用 Read 按页读取规范化源 PDF。每页分析完成后，把该页全部记录一次性连续追加到：

`<输出目录>/{pdf名}/pass1_pages.jsonl`

- 使用 `sellable_product / customization_evidence / non_actionable` 三分类。
- 一页可写多行，但同页记录必须连续且一次性完成。
- 续跑前读取已有 JSONL；已出现的页码视为已完成并跳过。
- 第一轮只做高召回和页面语义备注，不建立最终产品或 item。

完成后运行：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/validate_pass1.py" \
  <输出目录>/{pdf名}/pass1_pages.jsonl
```

校验失败时修正对应记录并重跑；通过后才能进入第二轮。

### 2. 产品族聚合与定制项分析

完整执行 `references/extraction_guide.md` 的第二轮流程：

1. 仅用 `sellable_product` 建立核心品类预分组。
2. 按独立标题、规格归属和完整成品建立叶子候选。
3. 判断 `customization_evidence` 的证据作用域和适用对象。
4. 拆分页面区域，验证同产品关系和选择关系。
5. 为每个叶子候选建立产品身份特征与定制能力签名。
6. 对每个预分组中的全部叶子候选执行兼容性比较；兼容则合并为可配置产品族，不兼容或存在条件依赖则拆分。
7. 聚合后重算 items、证据和 source pages，并执行语义回滚。

同步生成：

- `result.json`
- `semantic_audit.jsonl`

写入时把 PDF 中的非英文产品名、品类、公司名、定制项、选项、输入提示和 evidence 准确翻译成英文；只保留 `source_pdf_name` 原文。不要翻译 JSON key、枚举、ID、相对路径或文件扩展名。若翻译了正式 item 的 `name` 或 select `options`，同步更新对应审计记录的 `name` 或 `values`。

宽作用域证据若贡献多个产品，为每个适用产品分别写一条唯一审计记录，并为同一来源区域、维度和选项集复用 `evidence_unit_id`。无法确定适用对象的候选写成 `evidence_scope=unresolved`、`decision=exclude`、`product_index=null`。



完成后运行：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/validate_result.py" \
  <输出目录>/{pdf名}/result.json \
  <输出目录>/{pdf名}/semantic_audit.jsonl
```

校验失败时同步修正结果和审计；通过后才能取图。

### 3. 产品代表图

进入本步骤前完整阅读 `references/image_guide.md`，按候选页排名、页面模式分流和逐产品上下文验收执行。每个候选页先用 `product_image_review.py locator` 查看带醒目连续坐标系和目标信息的全页图；crop 尝试只查看 `prepare-attempt` 生成的全页坐标单面板，extract 尝试只查看实际提取图单面板。禁止单独查看 crop；同页 retry 仅用橙色旧框与洋红色当前框反馈，跨页不携带上次图像或失败文字。

为每个产品写入相对路径或 `null`，同步生成 `image_attempts.jsonl`，然后运行：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/validate_product_images.py" \
  <输出目录>/{pdf名}/result.json \
  <输出目录>/{pdf名}/image_attempts.jsonl
```

校验通过后删除 `.image_work/`。若模型无法读取原页面或候选图片，退出 skill 并告知用户改用具备视觉能力的模型。

### 4. 发布产品代表图

图片门禁通过并删除 `.image_work/` 后，直接执行封装脚本：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/upload_product_images.py" \
  "<输出目录>/{pdf名}/"
```

当存在首个不可复用、确实需要发起 HTTP 上传的图片时，脚本内部在该上传请求前立即执行一次 `workctl icbu member list --format json --jq '[.data[] | select(.self == true)][0] | {aliId, admin, firstName, lastName}'`。脚本从 JSON 的 `aliId` 字段无损取得十进制字符串，并通过 multipart 表单字段 `aliId` 与 `file` 一起传递；不再使用身份请求头。身份查询失败或 `aliId` 无效时在发起上传前停止。若全部外链均可复用、没有实际上传，则不查询身份。不得由模型预先查询或注入 `ali_id`。

脚本上传每个非空 `productImage` 并生成 `image_urls.json`；不依赖 cookie，不得回退到 cookie 身份。不得读取、展开、复写或输出脚本内部的上传目标与身份查询实现；失败时只依据脚本错误处理，不得用临时 HTTP 调用替代。外链发布失败时不得生成表格或执行导入。

### 5. Select option 代表图

若结果不含 select，跳过步骤 5 和 6。否则完整阅读 `references/option_image_guide.md`，按 `evidence_unit_id` 去重，生成：

- `option_image_plan.jsonl`
- `option_image_attempts.jsonl`
- `option_images/`

每个 option 必须有 accept/give_up 终态。没有可用且可独立定位的视觉主体时使用 `localizability=none`，由 freeze 写入 `NO_USABLE_VISUAL` 的 attempt 0；其余 option 按 `(evidence_unit_id, source_page)` 建立 `processing_group`。强制按 `init-plan → render-locators → 写 plan_annotations → freeze-plan → start-page-session → advance-page` 使用 `option_group_pipeline.py`：正式 plan 只能由脚本从 skeleton 与 annotations 合成，冻结后不得修改 plan、删除状态重来或回退定位阶段。初次定位只查看完整页面坐标 locator；attempt 1–5 只查看脚本为 processing group 自动选择的 120 DPI 页面或聚焦视口，视口均重新归一化为 `0..1000`，retry 只增加橙色上次 crop。Agent 直接提交当前 preview 的局部坐标，禁止手工换算或打开完整 reference page；脚本负责映射并以页面全局坐标写入正式 attempt。Plan bbox 只是初始定位假设，不是验收正确性的证明。脚本仍批量生成未标注 300 DPI crop 供 accept 原子落盘，但 Agent 禁止打开。脚本一次准备全部页面的 attempt 1，但 Agent 只处理 stdout 指定的当前 source page；本页有失败时立即生成并验收本页下一 attempt，本页全部终态后才能进入下一页。标签只负责冻结前 mapping，最终验收不得因标签缺失、半截或不可读而 retry。普通视觉失败必须通过 `retry_bbox` 留下 attempt；仅 attempt 1 已证明目标完整但选项交错、任何连续 bbox 都无法排除兄弟项时，允许该资产以 `SIBLING_OPTION_PRESENT + NON_SEPARABLE_LAYOUT` 单独 give_up。每个分组每 attempt 只查看一张 `preview_path`，禁止打开其他页面目录、locator 裸页、重开 locator、逐 option 调用 `extract_images.py region`、查看单项 crop 或逐行写 attempt。完成后运行：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/validate_option_images.py" \
  <输出目录>/{pdf名}/result.json
```

校验通过后删除 `.option_image_work/`。若无法把 option 与原图区域唯一绑定，必须 give_up，不得制作替代文字卡。

### 6. 发布 option 代表图

直接执行封装脚本：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/upload_option_images.py" \
  "<输出目录>/{pdf名}/"
```

脚本只上传 accept 资产。脚本按内容摘要复用外链，并生成覆盖全部 select option 的 `option_image_urls.json`；give_up binding 写空资产。发布失败时不得生成表格或执行导入。

### 7. 生成表格

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/flatten.py" \
  <输出目录>/{pdf名}/result.json -o <输出目录>/{pdf名}
```

### 8. 导入定制数据

表格生成后，新提交需在导入前立即通过工具查看阿里国际站公司 ID 和当前会话 `ali_id`。任一值缺失、为空或无法取得时立即停止，不得调用导入脚本。

先检查 `<输出目录>/{pdf名}/import_results.json`：

- 已存在：不得再次获取身份或提交导入，直接进入下述结果卡片展示流程，使用该文件的绝对路径。
- 不存在：继续以下身份查询和单次提交。

**8.1 获取 `company_id`（当前绑定店铺的公司 ID）**

优先使用 `workctl` CLI（本会话直接可用，不要走 `accio-mcp-cli`，其 MCP server 可能未连通）：

```bash
workctl icbu storefront get-company-id --format json
```

**8.2 获取 ali_id（当前会话登录的阿里账号 ID）**

在执行导入脚本前紧接着运行：

```bash
workctl icbu member list --format json --jq '[.data[] | select(.self == true)][0] | {aliId, admin, firstName, lastName}'
```

只使用返回 JSON 的 `aliId`，并按原始十进制字符串传入。禁止截断、浮点转换、科学计数法或猜测。确认身份完整后只执行一次封装脚本：

```bash
"<RUNTIME_PYTHON>" "<SKILL_DIR>/scripts/submit_customization_import.py" \
  "<输出目录>/{pdf名}/" \
  --company-id <company_id> \
  --ali-id <ali_id>
```

不得读取、展开、复写或输出脚本内部的提交目标、转换规则和结果链接规则，不得自行拼装或使用临时 HTTP 请求替代。只要接口返回数量和索引完整的逐产品结果，脚本就确定性生成唯一结果数据产物 `import_results.json`；不得再生成内容重复的 HTML、CSV 或 Markdown 链接清单。

脚本退出码为 `0` 后，执行以下确定性结果卡片展示流程；复用已有 `import_results.json` 时也执行同一流程：

1. 使用本轮 Skill `read` 返回的绝对 `install_path`，即 `SKILL_DIR`；不得猜测账号目录。
2. 通过 Bash 直接执行以下命令一次且仅一次：

```bash
node "<SKILL_DIR>/scripts/show-import-results.js" \
  --results-file "<import_results.json 绝对路径>"
```

不要探测或尝试任何自定义展示工具。命令必须原样执行随 Skill 交付的脚本：不得读取或复制脚本内容，不得内联 JavaScript，不得读取结果 JSON 后由模型拼装、摘要或改写 payload，不得使用管道、重定向、命令替换或其他包装处理 stdout。Bash 工具会把脚本的一行 slot JSON 交给宿主处理；模型不得粘贴该 JSON。

Bash 退出非零、未返回宿主生成的 slot 指令或卡片仍无法展示时，不得再次运行展示脚本。此时保留 `import_results.json`，只报告展示失败，禁止重新提交导入。

展示成功后，宿主会在 Bash 工具结果中追加包含 `:::slot[<id>]` 的强制指令。最终回复必须把其中的 slot 标记原样复制并独占一行；`id` 是宿主动态生成的不透明值，不得自行构造、缩短或替换。禁止粘贴工具 stdout JSON、结果文件链接、逐产品链接、部分样例链接或省略号列表。

原生卡片只保留只读结果表格，不显示标题区、完成标记、汇总、搜索、状态筛选、可见条数或筛选空态。使用 MA 后台原生表格风格：单层细边框、6px 低圆角、无渐变和阴影、浅灰表头、中等字重、状态色点及阿里蓝文字操作入口。表格必须按产品原始顺序完整展示每个产品的 `导入成功 / 导入失败` 状态；成功行通过宿主 `openLink` 提供站外查看或编辑入口，失败行展示错误码和错误原因，不得因部分失败而省略任何产品。

接口的逐产品结果只有两种状态：存在有效 `pageId` 并能生成管理链接即为“导入成功”；不存在有效 `pageId` 即为“导入失败”，同时展示接口返回的错误码和错误原因。响应中的 `success` 必须与 `pageId` 是否存在一致，不得引入第三种产品状态。

脚本退出码只表达本次结果处理能否形成可靠产物，不表达每个产品的业务状态：

- `0`：接口返回数量和索引完整的逐产品结果，结果 JSON 已生成并校验；其中可以同时包含成功和失败产品。
- `1`：请求失败、响应无法解析或不符合上述逐产品结构，或者结果 JSON 写入失败，无法形成可靠的完整结果清单。此时产品可能尚未导入，也可能已经部分生效，不能据此把所有产品标记为“导入失败”，且不得自动重试。

最终回复固定包含以下三项：

1. `导入结束：总计 N，成功 S，失败 F；结果清单 N/N 行，成功链接 S/S。`
2. 按宿主指令原样输出 `:::slot[<id>]`，独占一行，以展示全部产品的导入状态、成功入口和失败原因。
3. 提示用户在结果卡片的导入成功行点击“查看或编辑”进入后台修改；不得提供 `import_results.json` 文件链接。

最终回复必须依据结果卡片中的 `S/F` 计数描述为“全部成功”“部分成功”或“全部失败”，不得仅凭退出码 `0` 宣告全部导入成功。退出码为 `1` 时依据错误告知用户；网络错误、超时或响应返回后的产物写入错误表示结果可能不确定，不得自动重试。唯一一次 Bash 卡片展示失败时保留 JSON，只报告展示失败，禁止重新提交导入。提交脚本在请求前同时检查新版 JSON 和旧版 HTML 哨兵，以免覆盖结果或重复导入；旧 HTML 只作为防重复导入哨兵。

## 输出

- `source_from_images.pdf`：仅纯图片输入时生成；严格一张图片对应一页，页序等于用户确认的上传顺序。
- `pass1_pages.jsonl`：逐页召回与页面分类。
- `result.json`：最终产品族、定制项、证据和代表图路径。
- `semantic_audit.jsonl`：候选项关系、证据作用域和 include/exclude 决策。
- `image_attempts.jsonl` 与 `images/`：代表图尝试审计和最终图片。
- `image_urls.json`：代表图本地路径、内容摘要与 HTTPS 外链的确定性映射。
- `option_image_plan.jsonl`：唯一 option 资产、来源坐标、分类和多产品 bindings。
- `option_image_attempts.jsonl` 与 `option_images/`：option 图片尝试审计和 accept 资产。
- `option_image_urls.json`：option 资产外链和覆盖全部 select option 的 accept/give_up bindings。
- `tables/`：产品索引、目录概览和逐产品定制项表。
- `import_results.json`：接口返回结构完整时生成的原生结果卡片数据；由 `scripts/show-import-results.js` 校验并展示。
