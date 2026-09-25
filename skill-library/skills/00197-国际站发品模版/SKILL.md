---
name: 国际站智能发品
version: 3.4.8
description: |
  支持素材包/URL 发品、批量发品/裂变，以及发品模版的创建、引用与复用。
  rlab 云端链路（素材包 / URL 含修改需求）收敛为单命令：`node <SKILL_ROOT>/scripts/run_publish.js --work-dir <工作目录> --decoration-plan <方案> --user-query "<诉求原文>"` 一条命令完成「素材提取 → 图片 CDN 化 → 播种 user_query.json / decoration_plan.json + 打包上传 + 提交云端素材处理 → `fetch-material-result --wait` 等到终态（云端解析 user_query 原文理解发品意图并自动发品）→ item 物化与发品收据 → 渲染 `<productId>.xlsx`」六阶段（阶段账本断点续跑，脚本内置判读与 fail-closed），Agent 只做路由判断、前置 ask_user、调用该命令、按汇总 present。
  多品并行管线（Excel 多商品 Phase 0 split 之后）由同一单命令承载：脚本检测到工作目录 `split_manifest.json` 自动进入多品 `--batch` 六阶段（批≤50 路串行推进、fetch 脚本内跨轮轮询、路级解析失败自动 `--force` 重提）；Phase 0 判定无需拆分的表格素材重跑单命令时追加 `--xlsx-single-material` 放行（阶段 0 表格 GATE fail-closed 防回归——多行商品表未经拆分整包提交会被压成 1 个素材、云端只发 1 个品）。
  直发链路（URL 直发、已有 Product.xlsx 极简发品）不经云端素材解析，仍由 `publish-from-json` 本地发品，且只有该链路保留失败重试。
  沉淀单一总模版到会话产物面板。不处理商品字段优化、市场分析、图片生成。
enabled: true

triggers:
  - 发品模版
  - 创建发品模版
  - 保存商品模版
  - 引用模版发品
  - 素材包发品
  - URL 发品
  - 批量发品
  - 裂变发品

examples:
  - 用这些图片帮我发品并保存成模版
  - 只帮我生成一个沙发发品模版
  - 参考「沙发发品模版」发这个新品
  - 复制上次的配置批量发一批

excludes:
  - skill: alibaba-product-optimization
    when: 用户要修改、编辑或优化已存在商品/草稿商品的标题、价格、卖点、图片、属性等字段
  - skill: alibaba-hot-product-insight
    when: 用户要分析热销原因、爆品趋势、热卖特征或市场榜单
  - skill: alibaba-image-generation
    when: 素材包/URL 发品语境下的图像处理诉求（生图、换色、白底图、去水印、场景图、模特图等）—— 一律透传 user_query 由云端处理，禁止调用本地 image_edit/image_generate

workflow: |
  1. 执行「判断规则」识别意图并路由到对应 reference 文档（禁止跳过判断规则直接调工具，禁止从链路中间步骤开始）
  2. 反问前置（唯一两次 ask_user，均在提交云端之前完成；调用前必须先读 reference/material-publish.md 对应章节，逐字使用文档中的 header/question/options，禁止编造文案、改写、缩写、同义替换、调整选项顺序、增减选项或追加问题）：
      - ask_publish_mode（仅素材包发品）：选发品方式，二选一——「AI 发品（含图片生成）」继续选方案；「极简发品（不含图片生成）」跳过选方案、decorationPlan 固定 minimal。URL（含修改需求）发品跳过本步，固定 AI 发品
      - plan_select（仅 AI 发品）：选发品方案 decorationPlan，三选一——【全能精装版】=premium /【经济简装版】（推荐）=standard /【基础版】=none
      反问完成后一次性向用户说明：「素材解析与发品已提交后将自动完成，预计需要几分钟，我会在完成后汇报结果」（提交后不再有任何二次确认，全链路去预览）
  3. 素材落地入参（素材包发品必做；**本步不执行任何命令**，只是准备第 5 步单命令的参数）：用户上传的附件在平台侧只有 CDN URL / 平台附件 id，**两者都不是可用路径**，而 `material-extract` 只扫工作目录根层、不递归、不下载。Agent 从附件卡片逐个取 `https://` 链接，按用户给出的顺序传给第 5 步的 `--material-url "<CDN URL>"`（可重复；多于约 10 个改用 `--material-url-file <文件>`，每行一个，需显式指定落地文件名时写 `URL<TAB>文件名`）——下载、编号改名、0 字节校验、逐条失败即中断、重跑幂等全部由脚本负责，**Agent 不再自己 curl**。禁止把平台附件 id（形如 `image_0049...`）或本地路径塞进该参数（脚本以 `invalid_material_url` 当场拒绝并指明取链接的位置）；素材本就在工作目录根层时不传该参数。未传且根层无素材时脚本以 `missing_material` fail-closed 中断——此时禁止原样重跑、**禁止用 Glob 全盘搜图补位**（会命中别的会话同名图发错品），只能补齐 URL 或要求用户重新上传。URL（含修改需求）发品不传该参数
  4. Phase 0 表格素材前置检测（**仅当工作目录根已含 `.xlsx` / `.xls` / `.csv` 时执行**，是「Agent 只调一次命令」的唯一例外）：按 reference/material-publish.md「Phase 0：多品检测」执行 `split-material` 扫描 → 定 header_row 与商品行数 → ① 商品数据行 ≥ 2：`--split` 拆分 + 过拆分质检（下一步重跑同一条单命令自动进多品管线）；② 仅 0-1 行商品 / 非商品表：不拆分，下一步单命令必须追加 `--xlsx-single-material` 显式放行。纯图片/MD/Word 素材跳过本步。**素材走 `--material-url` 落地时根层此刻为空**，直接执行第 5 步即可——脚本落地后若发现根层有非 Product.xlsx 表格，会以 `phase0-gate` fail-closed 中断，届时再回本步做拆分判定并重跑同一条命令（素材已落地、账本命中，不会重复下载）
  5. 单命令执行（rlab 云端链路：素材包 / URL 含修改需求）：
      - 素材包：`node "$SKILL_PATH/scripts/run_publish.js" --work-dir <工作目录绝对路径> --decoration-plan <plan_select 选定值|minimal> --user-query "<用户原始诉求原文>" --material-url "<CDN URL>" --format json`（`--material-url` 按素材顺序重复传，见第 3 步；诉求较长或含引号时改用 `--user-query-file <文件>`；Phase 0 判定表格无需拆分时追加 `--xlsx-single-material`，split 后重跑同一条命令自动进入多品管线）
      - URL（含修改需求）：Agent 先按 reference/url-publish-format.md 用写文件工具生成 `<工作目录>/result/url_publish.json`（Agent 在本链路唯一需要写的文件），再执行 `node "$SKILL_PATH/scripts/run_publish.js" --work-dir <工作目录绝对路径> --decoration-plan <方案> --mode url-publish --format json`
      脚本内部固定串行六阶段（material-extract → upload_images.js CDN 化 → material-collect --submit 播种+打包+上传+提交 → fetch-material-result --wait --wait-timeout 10m → publish-from-json --prepare-items 物化 → render-product-excel 渲染 <productId>.xlsx），阶段账本落盘 `<工作目录>/.run_publish_ledger.json`，重跑自动跳过已完成阶段；检测到 split_manifest.json 时自动切换为多品 `--batch` 管线（批≤50 路串行、各阶段同构），仍是一条命令、同形参数；Agent 不拆解阶段、不逐段调用 workctl、不读写账本
  6. 判读脚本 stdout 汇总 JSON 并 present（规则见 data_flow_contract 的 present 段）：status="done" 按 publish_results 逐 item 输出（成功逐 item 按 `publishType` 区分链接并附质量分，多品也不得整批一刀切；文件清单逐条取 `rendered[]` 的 `file_name` / `excel_path`；失败 item 只如实告知 errorCode/error，禁止自动重发）；status="timeout" 用完全相同的命令重跑脚本继续等待（严禁重新提交素材）；success=false 按其 next_step 处理
  7. 按意图沉淀 1 个总模版 / 引导保存（见 reference/template.md）

data_flow_contract: |
  rlab 云端链路的编排权威是 scripts/run_publish.js（阶段判读、幂等账本、fail-closed 语义全部内建于脚本；Agent 只调一次命令 + 判读汇总）。脚本内部：云端提交固定走 `workctl publishflow material-collect --work_dir "<工作目录>" --submit --decoration-plan <方案> --user-query "<诉求>"`（--user-query-file 为长诉求兜底）——素材处理提交唯一入口仍是 material-collect --submit（`--user-query` / `--decoration-plan` 参数自动播种写入 result/user_query.json / decoration_plan.json，Agent 在 result/ 下不再写任何 JSON 文件——URL 链路例外：url_publish.json 是 Agent 唯一写的文件），**禁止再单独调用 `workctl icbu product analyze-merge-optimize-material`**；extInfo 由 CLI 从播种后的 decoration_plan.json 自动构造（仅含 decorationPlan，不携带 publishType），OSS 地址 CLI 内部流转，Agent 不持有、不手拼。发品意图由云端解析 user_query / url_publish.json 原文自行理解（正式 product / 草稿 draft / 仅创建模版→纯解析不发品），用户诉求中的发布类型表述必须通过 --user-query 完整原样透传，禁止截留、改写或概括；未提及时云端默认单品 product、多品 draft。`--work_dir` 必须传绝对路径。
  等待与断点：fetch 固定 `--wait --wait-timeout 10m` 进程内轮询到终态；status="timeout" 不是失败，uniqueRequestId 仍有效，重跑脚本同参续等（脚本已提交阶段自动跳过，绝不重提素材——云端提交非幂等，重提会重复建品）。云端提交后不可拦截：云端将自动完成解析与发品，本地取消仅终止等待。
  present 输出固定为全部发品结果汇总，按每个成功 item 的最终发布类型区分，禁止混用两种链接：正式发布成功（publishType=product）不拼单品链接，告知已正式发布上架并统一透出卖家后台「商品管理」链接 https://hz-productposting.alibaba.com/product/manage_products.htm#/product/all；草稿成功逐个输出草稿编辑链接 https://post.alibaba.com/product/publish.htm?itemId=<productId>&pubAction=draft（<productId> 必须替换为 publishResults[] 的真实 productId，禁止只输出商品 ID）。每个成功 item 输出质量分：lowScore=false → 无扣分；lowScore=true → 列出 deductReasons；缺失或 null → 质量分暂不可用（有 qualityScoreMessage 时一并透出）；质量分只影响这一项展示，不决定发布类型。部分失败时必须同时列出失败 item 序号（publishResults[].index）与 errorCode/error；publishType 只认 publishResults[].publishType（源于云端 item 级 publish_mode：发布类型词表只有 product=正式上架 / draft=草稿，云端线上以 publish 表示正式上架、按别名归到 product，编排器已归一并标注 publish_type_source；只有 publishType 与 publish_mode 双缺失时才兜底按质量分推导，两类计数见 publish_type_counts），**逐 item 判读；「多品批量默认 draft」只是提交侧默认值，质量分也不是判读依据，两者都不是 present 依据，禁止因本次是多品、或因为算出了质量分就把正式品说成草稿**，禁止 Agent 自行猜测。文件清单唯一取自汇总 JSON 的 rendered[]（标签用 file_name、路径用 excel_path，禁止用 productId 自行拼文件名或把商品名当文件名；rendered_missing[] 内的成功 item 无 xlsx 产物，不得列入清单）。失败 item 禁止自动重发、禁止进 completeness_check、禁止回退 draft——是否修改后重发由用户决定。
  直发链路（不经 run_publish.js）：URL 直发走 reference/url-direct-publish.md（start-url-product-generate 云端异步）；已有 Product.xlsx 极简发品/编辑后重发走 reference/excel-direct.md（publish-from-json 本地发品，顶层 list ≥2 必须显式传 --publish_type draft，CLI 默认恒为 product 不感知单/多品；只有该链路保留 completeness_check 完整性补全重试，最多 3 轮）。
  多品并行管线（Excel 多商品 split 后）由 run_publish.js 单命令承载：脚本检测到工作目录 `split_manifest.json` 自动进入多品 `--batch` 管线（批≤50 路串行推进、fetch 脚本进程内跨轮轮询、路级解析失败自动 `--force` 重提，汇总合并各路 publishResults 带 route 标签），编排与分步契约见 reference/material-publish.md「多品并行管线」章；Phase 0 判定无需拆分的表格素材重跑单命令时必须追加 `--xlsx-single-material` 显式放行（不传会被阶段 0 表格 GATE 以 phase0-gate fail-closed 拦下，防多行商品表被压成单素材只发 1 个品）。素材+模版链路 F 走 reference/template.md（模版解析与类目核对含 Agent 决策，分步执行）。
---

# ICBU 国际站发品模版

在 Alibaba.com 国际站（ICBU）发布商品并沉淀可复用的发品模版。

> **执行总则：** 每次唤醒本 skill 第一个动作是执行「判断规则」；用户消息同时含明确动作意图与可操作输入源（URL/图片/品类词/描述/productId）时直接进入链路执行，禁止反问确认、禁止索要素材超过 1 次（无响应时用已有信息继续并在交付物标注推断字段）。alibaba.com/1688/淘宝/AliExpress/Amazon 等商品 URL 禁止 WebFetch/浏览器抓取（反爬必失败），URL 内容一律云端获取，Agent 本地只做 productId 提取。

## 一、意图识别与链路路由

### 判断规则

1. **创建模版 + 发品** — query 同时含「生成/创建模版」与发品意图 → [reference/template.md](reference/template.md)（链路 1）
2. **仅创建模版** — 仅模版意图无发品意图 → [reference/template.md](reference/template.md)（链路 2，云端纯解析不发品）
3. **引用模版发品** — 已有模版 xlsx / 参考品 productId / 商品 URL 作为参考（**alibaba.com 链接无论用户表述如何一律走本链路**——本站是发品目标站，URL 直发与 url_collect 均无法抓取站内品，只能提取 productId 走 `query-template-info-by-id`；URL+自有素材时 URL 是模版、素材是主体）→ [reference/template.md](reference/template.md)（链路 F）
4. **URL 直发（纯外站 URL、非 alibaba.com、无任何修改需求）** → [reference/url-direct-publish.md](reference/url-direct-publish.md)
5. **素材包 / 非 alibaba.com 外站 URL（含修改需求）/ 已有 Product.xlsx 发品** → [reference/material-publish.md](reference/material-publish.md)（链路一/H）
   - `.xlsx`/`.xls`/`.csv` 先 `workctl publishflow parse-product-excel --in <文件> --probe --format json` 探测：`isProductXlsx: true` → [reference/excel-direct.md](reference/excel-direct.md)；`false` → 素材包链路（Excel 多商品按 material-publish.md Phase 0 检测拆分，split 后重跑同一条单命令自动进入多品管线）
   - 素材包先 ask_publish_mode；URL（含修改需求）跳过、固定 AI 发品；已有 Product.xlsx 按 excel-direct.md 询问
6. **批量发品 / 裂变** → [reference/excel-direct.md](reference/excel-direct.md)（链路二）
7. **无法判断** — 输出固定引导文案（发品并保存模版 / 仅创建模版 / 引用模版发品 / URL 直发 / 批量发品裂变五项）等待用户选择，禁止自行推断

## 二、单命令执行（rlab 云端链路）

```bash
# 素材包发品（AI 发品 / 极简发品同形，极简 decorationPlan 传 minimal）：
node "$SKILL_PATH/scripts/run_publish.js" \
  --work-dir <工作目录绝对路径> \
  --decoration-plan <premium|standard|none|minimal> \
  --user-query "<用户原始诉求原文>" --format json

# URL（含修改需求）发品：先由 Agent 写 result/url_publish.json，再：
node "$SKILL_PATH/scripts/run_publish.js" \
  --work-dir <工作目录绝对路径> \
  --decoration-plan <premium|standard|none> \
  --mode url-publish --format json
```

- 调用前校验 `$SKILL_PATH` 非空；`--work-dir` 必须是写文件工具返回的绝对路径
- 脚本 stdout 恒为单个汇总 JSON（`success` / `status` / `stages[]` / `publish_results[]` / `publish_type_counts` / `rendered[]` / `rendered_missing[]` / `next_step` / `notes[]`），Agent 只判读汇总，不拆阶段、不读写 `.run_publish_ledger.json`、不手工执行其中任何 workctl 子命令
- 退出码：0 完成（含 timeout 可续跑）/ 1 参数或环境错误 / 3 流程中断（按汇总 next_step 处理；云端提交阶段失败禁止盲目重跑脚本，按 next_step 或交用户决断）
- 云端 item 发品失败不算流程中断（退出码 0）：按 present 规则如实告知即可
- 三个不得当成成功的中断码（均退出码 3）：
  - `status="done_no_result"` + `error="publish_result_empty"`：云端回 done 但 `publish_results` 为空。**绝不得向用户声称发品成功**——无商品链接、无质量分可列；凭 `unique_request_id`（多品凭各 `split_product_*/result`）核查云端终态后如实告知，素材已提交，严禁重提素材或重建工作目录
  - `status="cloud_failed"`：云端回 done 但业务失败（`error_message` 为云端原文，`cloud_result_url` 为云端结果 JSON 地址）且无任何发品记录。**同样绝不得声称发品成功**——本地未建成任何商品。瞬时故障编排器已自动重提素材重试过，能到这个码说明重试已耗尽或该错误确定性无法重试，**重跑脚本无意义**：按 `next_step` 区分——属云端/网络故障则告知稍后重试，属素材问题则要求用户按 `error_message` 修正素材后重新发起
  - `error="manifest_missing"`：账本已定性多品并行管线但 `split_manifest.json` 丢失/损坏。脚本 fail-closed 拒绝降级成单品管线（降级会按单品重新提交 → 重复建品）；恢复该文件后重跑，不可恢复时交用户决断，严禁 `split-material` 重拆后直接重跑
- **🚫 云端链路失败后禁止转本地构造 JSON 发品（强制）：** 上述两个中断码、以及任何阶段的云端解析/发品失败，处置都只有"如实告知 + 按 next_step 处理 + 交用户决断"三件事。**禁止 Agent 自行拼一份发品 JSON 再走 `publish-from-json` 兜底**——云端链路失败时本地没有任何可信的商品结构（类目、属性 ID、SKU 属性对、图片 CDN 地址全部依赖云端解析产出），Agent 拼出来的必然是靠推断填充的假数据，最典型的就是**编造一个 categoryId**（见第四节 categoryId 禁令），发出去是错类目的脏商品，用户还得人工删改。`excel-direct.md` 的本地直发链路**只适用于已有云端产出的 Product.xlsx**（链路二/H），不是云端失败时的降级通道
- 分步阶段契约：见 [reference/material-publish-steps.md](reference/material-publish-steps.md)（阶段命令、GATE 判读与失败处置）。双定位——(1) 仅 run_publish.js 环境不可用时的应急手册，正常单品/多品流程禁止逐步执行；(2) 素材+模版链路 F 分步执行时各阶段的语义契约（链路 F 含类目核对与 `--template` 组装，本就不走编排器，以本篇为准，不属于「应急」）
- 编排器不承载链路 F：run_publish.js 无 `--template` 参数（传了会以 `unknown_flag` 退出码 1 拒绝）；链路 F 一律按 [reference/template.md](reference/template.md) 分步执行，禁止把模版 xlsx 丢进工作目录当普通素材走单命令（模版语义与类目核对会丢失）

## 三、present 输出

- 输出全部 item 结果：成功 item 按 publishType 区分链接（正式→商品管理后台链接；草稿→草稿编辑链接，productId 取 publishResults[]）并附质量分与冲突摘要（`template_conflicts.json` 存在时）；失败 item 列序号（publishResults[].index）与 errorCode/error，到此为止不重发
- publishType 源于云端 item 级 `publish_mode`（编排器已归一，来源见 `publish_type_source`）：逐 item 只读这个值，**质量分与「多品批量默认 draft」都不是 present 依据**——正式品也会算出质量分，拿 `finalScore` 或批量身份反推类型会把已上架商品误报成草稿
- **草稿成因只认 `publish_results[].first_time_publish_error`**（`{errorCode, errorMsg}`，云端原文）：非空 = 首次按正式发布提交被拦下、云端已回退存草稿，必须在该草稿链接旁原样引用 `errorCode｜errorMsg` 说清为何是草稿（不翻译、不改写、不自行解释字段含义），再引导用户在草稿里补齐后重新提交上架；字段缺失/为空 = 用户要求草稿或提交侧默认，**禁止编造失败原因**。该字段与质量分无关（**禁止把 `deductReasons` 说成发草稿的原因**），也不是失败：这些 item 商品已建成（有 productId、有 `<productId>.xlsx`），不得归入失败 item、禁止本地重发
- 发品成功后 `<productId>.xlsx` 已由脚本落盘（多成功 item 多文件），告知用户可后续编辑或作模版复用；纯解析链路（链路 2）透出 Product.xlsx 进入 save_template。**本地直发链路无编排脚本**：由 Agent 按 [reference/excel-direct.md](reference/excel-direct.md) present 段自行调一次 `render-product-excel --batch --work_dir <工作目录绝对路径>` 落盘（命令按 `publish_items/` 下的发品收据自行推导全部 item，不传 item 路径与 productId；禁止逐 item 调 `--in/--out`、禁止 for 循环），文件清单同样取其返回的 `rendered[]`，不得假定脚本已代为渲染而跳过本步
- present 之后用户提出字段修改（已有 productId）→ 路由到 alibaba-product-optimization 的信息编辑分支，禁止走 excel-direct.md 重新发品产生新商品
- rlab 链路提交后无本地编辑窗口：禁止依据原始诉求回头核对/回填/编辑 product.json 或 Product.xlsx 的任何字段；素材+模版链路冲突以素材值为准（material_priority），冲突表在 present 展示
- **拿到汇总即 present，禁止二次核验**：present 所需数据全在汇总内——标题 `publish_results[].productTitle`、id `.productId`、类型 `.publishType`、质量分 `.finalScore`、草稿成因 `.first_time_publish_error`、文件 `rendered[].file_name`/`excel_path`；**禁止再读 product.json / Product.xlsx / 产物目录去核对一致性，禁止为此另起 subagent 核验**。**云端解析出的商品数不等于素材图片数属正常**（一图多品、或同一素材按款式拆成多个品），不是异常、不核查：逐 item 如实列出，数量与用户预期不符时在 present 说明一句「云端将 N 份素材解析为 M 个商品」，差异交用户判断

## 四、命令速查（直发链路与辅助工具）

| 命令 | 用途 |
|------|------|
| `node <SKILL_ROOT>/scripts/run_publish.js` | **rlab 云端链路单命令入口**（素材包 / URL 含修改需求；检测到 split_manifest.json 自动进入多品 --batch 管线；Phase 0 判定无需拆分的表格加 `--xlsx-single-material` 放行 GATE） |
| `workctl publishflow publish-from-json --input <json> [--publish_type product\|draft] [--strip-agent-edit-ai-detail] [--validate-only]` | 本地直发（已有 Product.xlsx 极简发品/编辑后重发；多品批量必须显式 --publish_type draft；--prepare-items 物化模式由 run_publish.js 内部使用） |
| `workctl icbu product precheck-url-product-generate` / `start-url-product-generate` / `list-task-list` | URL 直发链路（见 url-direct-publish.md） |
| `workctl publishflow parse-product-excel --in <xlsx> --probe` | Excel 结构探测（Product.xlsx vs 普通素材） |
| `workctl publishflow parse-product-excel --in Product.xlsx [--out product_edited.json]` | 改后 xlsx → 发品 JSON（极简发品加 --strip-agent-edit-ai-detail） |
| `workctl publishflow split-material --work_dir <目录>` | 多品 Excel scan/split（见 material-publish.md Phase 0；split 后重跑 run_publish.js 单命令自动进入多品管线） |
| `workctl publishflow render-completeness-excel` / `parse-completed-excel` / `query-template-info-by-id` | completeness_check 补全工具（仅本地直发链路） |
| `workctl publishflow export-template-excel --in <json> --category <类目名>` | 导出总模版（save_template） |

> 全链路统一 workctl 入口，禁止直调 accio-mcp-cli（唯一例外：upload_images.js 脚本内部经 --json-file 调 upload_image_filebroker；Agent 禁止逐图直调该工具、禁止用 read 读图、禁止把 base64 读进上下文）。Agent 直编/新构造发品 JSON 时字段名与结构必须逐字参照 reference/sample_stripped.json（极简）或 sample_edit_result.json（完整版）；SKU 价格字段名必须为 `trade.sku[].unitPrice`（数字类型）。
>
> **🚫 `categoryId` 是逐字参照的唯一例外（强制）：** Agent 自行构造或直编发品 JSON 时**一律不写 `categoryId` / `catDesc` 这两个顶层键**（不写整个键，而非写空串或 0）——发品 MCP 对无类目输入会按商品内容**自动预测类目**，`publish-from-json` 也已不校验类目缺失。样例文件里的 `"categoryId": 1001` 只是在标注"云端产出的真实形态含此键"（供 `render-product-excel` / `parse-product-excel` 保留全部 ID 用），**不是可照填的值**。类目由类目预测服务或参考品模版决定，**Agent 没有任何依据凭商品标题/描述推断出正确的 categoryId**，编造一个会让商品落到错误类目（属性校验连带失败、需人工改类目重发）。唯一可写类目的场景：链路 F 类目冲突处置时，把复检返回的 `data.predictedCateId` 落进 `template/result/extracted_texts.json`（见 [reference/template.md](reference/template.md) 步骤 6），那是命令返回的权威值，不是推断值。

## 五、会话隔离

每次执行本 skill 都是独立任务：从判断规则开始执行；发品 JSON 路径与 uniqueKey 只能取当前会话上游步骤返回值，禁止读 memory/TASK_HISTORY 等历史数据；即使用户声称「之前解析过」也重新执行完整流程；run_publish.js 的账本只用于同一次发品的断点续跑，跨会话不复用。

## 六、错误处理

- **run_publish.js 汇总判读**：`status="timeout"` → 同命令重跑继续等待（告知用户仍在处理中，严禁重提素材）；`success=false` → 按其 `next_step` 执行。编排器全部阶段命令（probe / 素材提取 / CDN 化 / 提交 / fetch 查询 / 物化 / 渲染 / 多品 --force 重提）失败后已在脚本内立即自动重试至多 3 次（不加间隔；pending_fix 入参问题与图片 invalid/broken 质量问题属确定性失败，不消耗重试），其中提交阶段（material_submit_failed / material_submit_no_key / 进程级失败 / 空 key）重试耗尽仍无任务标识时禁止盲目重跑脚本（云端提交非幂等，重试有重复建品风险），交用户决断；错误信封的 error/message 字段可能是嵌套对象，编排器统一 JSON 展开渲染，不会显示成 `[object Object]` 吞掉错误码；`notes[]` 中的渲染跳过项可单独补跑 render-product-excel，不影响发品结果；汇总出现 `reparse_rounds` / `abandoned_submits[]` 说明编排器因云端解析侧瞬时故障自行重提过素材（判据与安全闸门在脚本内，Agent 不参与判断），照实转述即可：**用户若在商品管理后台发现重复商品，可凭这些作废的 id 追查**
- **云端失败 item（rlab 链路）**：只如实告知 errorCode/error，禁止自动重发、禁止进 completeness_check、禁止回退 draft（发品接口无幂等键，本地盲重发可能重复建品）；仅当用户明确要求时才按其指示单独重发
- **本地直发链路失败**（唯一保留重试的链路）：一次性解析 errorMsg 中**所有**错误并批量修复（Excel 补全或参考品回填）后重发，最多 3 轮；3 轮不过或用户放弃才 `--publish_type draft` 单独回退（禁止失败后立即自动回退）；重发必须沿用该 item 首次发品类型
- **网络/工具调用错误**：默认自动重试 2 次；仍失败则按下方「工具失败降级」切换；降级链无对应方案时报告错误（含 traceId）并终止。**适用边界必须严格界定**——本条只覆盖「调用本身没拿到业务返回」（进程/网关失败、连接错误、超时、`model` 解析不出结果）；**调用成功但业务判失败（`success=false`、item 级 `errorCode`/`errorMsg`）不属于本条**，一律按各链路既有口径处置：本地直发进 completeness_check（最多 3 轮），云端 item 只如实告知、不重发。混淆两者会让「发品接口已建成商品、只是返回体判失败」被当成网络错误盲目重发 → 重复建品
- **网关返回格式兼容**（Agent 直调 MCP/CLI 的链路——URL 直发、本地直发、链路 F 均适用）：兼容新旧网关——旧版 `success=false` 或 `errorDTO` 非空为失败；新版可能 `success=true` 但错误对象仅在 `model` 字符串中，`model` 非空必须先按 JSON 解析，含 `errorCode`/`errorMsg` 一律视为失败（不得因 `success=true` 就当成功继续推进）；run_publish.js 内部已内建等价判读，云端单命令链路无需 Agent 再判
- **workctl pending 状态**（pending_dependency / pending_fix / timeout）均不是错误：按返回的 next_step / retry_after_ms 引导处理后重试，不要走错误终止分支
- **工具失败降级**：同一工具连续失败 2 次切换备选（read→web_fetch→browser）；ask_user 无响应则用已有信息继续并标注推断字段；素材提取与 CDN 化失败无降级出口，中断向用户说明；每 5 次工具调用自检一次（3 次同工具 / 2 次报错 / 30 次调用进度不足 50% 即重估策略），触发时输出一行 `[自检] <原因及动作>`

## 七、执行协议补充

- **Task 任务系统的适用边界**：rlab 云端单命令链路与本地直发链路的进度由脚本汇总 / reference 自身承载，**不建 task**；仅 URL 直发链路使用 Task 系统，其任务初始化（2-pass init：task_create → task_update 挂依赖 → task_list 核对）与步骤定义以 [reference/url-direct-publish.md](reference/url-direct-publish.md) 为准（该篇自包含）。Task 系统只决定任务创建/依赖/状态推进/面板渲染，不决定调什么工具、入参构造、轮询秒数与展示排版——一律按 reference 执行
- **ask_user 渲染规范**：本 skill 及 reference 中所有「向用户展示 / 等待确认 / 提示 / 引导」节点默认必须通过 `ask_user` 实现而非纯文本；reference 中以表格列出 label/description 的小节必须逐字转为 `options` 数组，不得改名/改序/省略；未传 `options` 会渲染默认兜底按钮，属违规。全链路去预览，不提交任何预览 render slot，发品结果直接由 present 输出
- **取消分支兜底**：用户主动取消或出现不可恢复错误时——已建 task 的链路把当前 step task 置 `archived` 并在 description 加前缀 `[CANCELLED] … — 原因: <用户取消/错误摘要>`，下游未完成 task 同样并行 `archived`（原因写「上游 <stepId> 取消」）；本次会话新建且未提交云端的工作目录 `analysis_<YYYYMMDD_HHMMSS>/` 删除；输出一行 `✅ 已取消本次发品流程。` 后不再 ask_user
- **取消时的目录保留例外**：云端已提交（汇总已持有 uniqueRequestId / 已进 fetch 阶段）时**禁止删除工作目录**——`.run_publish_ledger.json` 与各路 uniqueRequestId 是续跑与排查的唯一凭据，删了就只能重提（云端提交非幂等，会重复建品）；此时只终止本地等待并如实告知云端仍会自行完成
