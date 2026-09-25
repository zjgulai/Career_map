---
name: pinduoduo
description: 当用户需要在安卓手机上的拼多多应用中执行文搜、图搜、排序、商品采集、规格/评论/商详证据采集、多商品对比或生成表格时使用。
---

# 拼多多商品采集 Skill

## 适用场景

使用本 Skill，当用户要求在拼多多应用中：

- 文搜商品、图搜/搜同款、找热销同款、按销量/价格/好评排序。
- 从搜索结果页采集一个或多个商品。
- 采集主图、SKU、商详三屏、评论首屏。
- 生成一次任务总目录和总 Excel。

不要用于未指定拼多多的其他 App、纯网页电商任务或只需分析本地图片的任务。

## P0：拼多多与抖音不能同时运行

拼多多与抖音共用同一台手机，绝对不能同时运行；必须完整做完一个平台的全部操作后，才能开始另一个平台。禁止用 subagent、并行工具调用或两个 `run/step` 进程交叉操作同一设备。

## P0：工作目录与会话 ID

- 执行前必须确定用户工作目录绝对路径，并导出 `ECOMMERCE_OUTPUT_ROOT=<用户工作目录绝对路径>`；所有 `--output-dir` 都必须落在该目录下，禁止使用插件目录、插件子目录或相对 `reports`。
- 每个新任务的 `run_id` 必须由 Agent 显式生成，格式为 `<semantic_ascii>_<YYYYMMDDHHmmssSSS>_<4位随机>`；同一任务继续执行只复用已返回的 `run_id` / `task_dir`，禁止按 query 或 mtime 自动寻找最近目录。
- 最终交付必须直接调用主 Skill 的 `node "<ecommerce-search 根>/common/finalize.js" deliver`，不得经过 shell wrapper；只向会话流和 `present_files` 输出 finalizer 返回的中文语义化最终路径。

## 总原则

```text
Plugin 负责机械流程
Skill 负责告诉 agent 何时调用哪个命令
```

agent 不需要输出点击坐标。选择商品时传搜索结果返回的 `candidate_id`，并同时把该候选的 `candidate_fingerprint` 传给采集命令；plugin 内部负责在当前页面重新定位并转换为点击坐标。只有旧产物缺少指纹时才允许单独使用 `candidate_id` 或 `candidate_index`。

## 搜索后必须采集

只要使用了本插件的文搜、图搜、排序或候选能力，就不能停在“找到候选商品”。候选列表只是中间态，禁止只返回候选不采集，必须继续执行 `pdd-capture-one-product` 采集商品信息，除非用户明确说“只看候选/不要采集”。

错误做法：

```text
图搜销量排序完成
  ↓
只把 c1/c2/c3/c4 候选列表发给用户
  ↓
询问用户要不要采集
```

正确做法：

```text
图搜/文搜排序完成
  ↓
按目标数量选择 candidate_id + candidate_fingerprint
  ↓
逐个执行 pdd-capture-one-product
  ↓
采集完成后再汇总商品信息或生成表格
```

## 默认采集数量档位

用户明确指定数量时，按用户指定数量采集。

用户未指定数量时，在下面三个档位中选择：

| 用户意图 | 默认数量 |
|---|---:|
| 搜同款、找几个热销同款、简单看看 | 4 |
| 找几款、常规对比、没有明确深度要求 | 5 |
| 详细对比、竞品调研、做表格/报告 | 8 |

用户完全未提数量时，默认采集 **4 个商品**。如果用户说“几个”但没有更多约束，优先从 4 或 5 中选择；如果任务明显是详细对比或要输出总表格，优先用 8。

## 排序模式选择（按用户意图映射 --sort）

`pdd-search-sort-candidates`（文搜）与 `pdd-image-search-sort-candidates`（图搜）都接受 `--sort`。插件内部会从**实时 UI 层级**（u2 dump）用「文本 + 几何」两层策略定位排序栏并点击切换，再用双次 dump 校验候选稳定后返回新候选。Agent **不需要自己 dump 或手点排序 Tab**，只需按用户意图选对 `--sort` 值：

| 用户意图 | `--sort` 值 | 拼多多排序 Tab 动作 |
|---|---|---|
| 综合 / 默认 / 未提排序 | `default` | 保持综合（不点击） |
| 销量 / 最好卖 / 热销 | `sales` | 点「销量」 |
| 价格从低到高 / 便宜优先 | `price_asc` | 点「价格」一次（升序） |
| 价格从高到低 / 贵的优先 | `price_desc` | 点「价格」两次（降序） |
| 好评 / 评分 / 口碑 | `score_desc` | 点「综合」后在弹层选「好评 / 评分排序」 |

规则：

- 用户没提排序时用 `default`；只说「排序」却没指明维度时，优先按 `sales`（销量，竞品调研最常用）并向用户说明。
- 切换成功后直接用插件返回的 `candidates` 继续采集，**不要再自己 dump-ui 或手点排序栏**——UI 层级提取与点击已由插件完成。
- 若用户明确要求某种排序而插件返回失败（如 `无法定位排序按钮`），停止当前候选阶段并说明缺失控件，禁止盲点坐标或把默认结果当成已排序；只有用户未指定排序时才保持 `default`。

## 价格区间（仅文搜）

用户给出最低价、最高价或价格区间时，必须使用 `pdd-search-sort-candidates` 文搜，并增加 `--min-price` / `--max-price`；两个参数均可单独使用。插件会从实时 u2 UI 层级按文本、EditText 类型和 `bounds` 定位“筛选 → 最低价/最高价 → 确定”，点击每一个价格输入框后分别等待 **2 秒**（`PRICE_INPUT_FOCUS_WAIT_MS=2000`）再输入文本，不使用固定坐标。

文搜结果页固定顺序：先执行关键词搜索；再 dump `result_controls` 并提取“综合、销量、价格、筛选”的实时坐标；有价格区间时点击“筛选”，dump `price_panel`，定位最低价/最高价输入框与“确定”，输入并确认；随后才按实时坐标执行排序；最后双次 dump 提取稳定候选。禁止缓存或手写固定坐标。

结果页首屏与双次 dump 等待：搜索启动后至第一次 dump 默认等 **2 秒**（`options.wait=2000`），两次 dump 之间默认等 **2 秒**（`stableIntervalMs=2000`），给拼多多首屏商品卡完全渲染留时间，避免骨架屏期间抓到 0 张候选或指纹不一致。若已知设备渲染更慢可继续加大，切勿改回原来的 500ms/300ms。

```bash
# 50~100 元、销量排序：只能文搜
"$NODE_BIN" "$CLI" pdd-search-sort-candidates \
  --keyword 短裤 --sort sales --min-price 50 --max-price 100 \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/raw/<category>"
```

`pdd-image-search-sort-candidates` 不暴露价格参数；即使已有商品链接种子图，只要用户有价格条件，也必须改用清洗后的 `text_seed` 文搜。图搜只允许排序，禁止采集后本地补价格区间。文搜价格筛选必须先于排序；找不到控件时明确失败，不能把未筛选候选当成已满足价格区间。

## CLI 路径解析（跨机器必读）

拼多多 CLI 一律在 shell 中以文件方式执行：先解析 `NODE_BIN` 和 `CLI`，再以 `"$NODE_BIN" "$CLI" <cmd>` 调用；`<pluginRoot>` 是拼多多平台目录 `.../platforms/pinduoduo/`（含 `tools/phone-auto-cli.js`）。不要假定系统已全局安装 `node` 或 `pinduoduo-phone-auto`，也不要期望宿主注册了同名工具。

推荐优先用 `skill({action:"read", skill_id:"pinduoduo"})` 返回的 `install_path`；如需 shell 动态解析：

**bash / zsh**：
```bash
NODE_BIN="$(command -v node 2>/dev/null || true)"
if [ -z "$NODE_BIN" ]; then
  for node_root in \
    "$HOME/Library/Accio/external-tools" \
    "$HOME/.config/Accio/external-tools" \
    "$HOME/.local/lib/agentshell-node" \
    "$HOME/.cache/codex-runtimes"; do
    [ -d "$node_root" ] || continue
    node_candidate="$(find "$node_root" -maxdepth 7 -type f -name node -path '*/bin/node' -print 2>/dev/null | head -n 1)"
    [ -x "$node_candidate" ] && NODE_BIN="$node_candidate" && break
  done
fi
[ -z "$NODE_BIN" ] && { echo "Node.js >=20.9.0 not found"; exit 1; }
"$NODE_BIN" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)' \
  || { echo "Node.js >=20.9.0 required"; exit 1; }

CLI=""
for d in "$HOME"/.accio/accounts/*/plugins/installed/*/skills/ecommerce-search/platforms/pinduoduo/tools/phone-auto-cli.js; do
  [ -f "$d" ] && CLI="$d" && break
done
[ -z "$CLI" ] && { echo "CLI not found"; exit 1; }
```

**PowerShell**：
```powershell
$NODE_BIN = (Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $NODE_BIN) {
  $nodeCandidates = @(
    "$env:USERPROFILE\AppData\Roaming\Accio\pre-install\*\node\node.exe"
    "$env:USERPROFILE\.local\lib\agentshell-node\*\node.exe"
    "$env:USERPROFILE\.cache\codex-runtimes\*\dependencies\node\bin\node.exe"
  )
  $NODE_BIN = Get-ChildItem -Path $nodeCandidates -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $NODE_BIN) { Write-Error "Node.js >=20.9.0 not found"; exit 1 }
& $NODE_BIN -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)'
if ($LASTEXITCODE -ne 0) { Write-Error "Node.js >=20.9.0 required"; exit 1 }

$env:CLI = ""
Get-ChildItem "$env:USERPROFILE\.accio\accounts\*\plugins\installed\*\skills\ecommerce-search\platforms\pinduoduo\tools\phone-auto-cli.js" -ErrorAction SilentlyContinue |
  Select-Object -First 1 |
  ForEach-Object { $env:CLI = $_.FullName }
if (-not $env:CLI) { Write-Error "CLI not found"; exit 1 }
```

后续 bash/zsh 命令示例统一写 `"$NODE_BIN" "$CLI" xxx`；PowerShell 等价写法是 `& $NODE_BIN $env:CLI xxx`。

## 必做前置检查

任何真机采集前先读取 `../../references/mobile-android-preflight.md`，再执行：

```bash
"$NODE_BIN" "$CLI" preflight-check --app 拼多多
```

硬门禁：

- 只要走拼多多真机链路，就必须先把 `data.setup_guide_markdown`（安卓调试教程链接 + 「有操作成本、请耐心做完」提醒）原样展示给用户一次，**无论 `ready` 是 true 还是 false**；同一任务只展示一次。
- 只有 `success=true` 且 `data.ready=true` 才能进入文搜或图搜。
- `data.ready=false` 时，原样展示 `data.primary_issue.user_message_markdown`，停止所有平台操作并等待用户处理；不得解析 Java 堆栈或继续猜测。
- 用户确认处理完成后重新执行完整 `preflight-check`，不得从失败检查之后继续。
- preflight 已统一检查 ADB、设备状态、目标 serial、屏幕、输入注入、IME、ADBKeyboard、拼多多 App、u2 和包级权限；权限处理遵循“先验证最终状态，缺失才修复，再验证”。
- 多设备时使用 `PHONE_AUTO_DEVICE_SERIAL` 或 `ANDROID_SERIAL` 明确目标；指定设备不存在时禁止回退操作其他手机。
- preflight 只安装并启用 ADBKeyboard，**不改当前默认输入法**。真正需要文本输入的价格区间筛选会自己切到 ADBKeyboard，并在该步结束时切回原输入法（成功和失败都切回）；返回的 `original_ime` 只作兜底记录。

`pdd-grant-permissions` 仅保留为独立诊断/修复命令，不再是成功 preflight 后的重复必做步骤。禁止手写裸 `adb shell pm grant ...`。

输入法异常时兜底执行：

```bash
"$NODE_BIN" "$CLI" task-cleanup --restore-ime <original_ime>
```

价格筛选已经自己成对完成「切到 ADBKeyboard → 输入 → 切回原输入法」，常规任务不需要收尾恢复。只在 `pdd-search-sort-candidates` 返回的 `selection_filter.ime.restored=false`（或用户反馈手机调不出键盘）时，用 preflight 返回的 `original_ime` 跑这条命令兜底。

## 文搜流程

```text
用户给关键词
  ↓
pdd-search-sort-candidates（先结束拼多多进程并冷启动进入结果页，返回 candidates_json）
  ↓
按目标数量调用 pdd-capture-batch，读取 candidates_json 串行采集
  ↓
每成功一品原子更新 products.json；单品失败可继续，未采满则整体 success=false
  ↓
采满后再构建总 Excel
```

示例（两条命令必须是**两次独立的工具调用**，且采集那次必须显式设 `timeout=300000`）：

```bash
"$NODE_BIN" "$CLI" pdd-search-sort-candidates \
  --keyword 短裤 \
  --sort sales \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/raw/<category>"
```

```bash
# 本次调用必须 timeout=300000；--target 见下方「采集批次容量与超时」
"$NODE_BIN" "$CLI" pdd-capture-batch \
  --candidates-json "<搜索返回的 data.candidates_json>" \
  --products-json "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/products.json" \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/raw/<category>" \
  --category "<category>" \
  --target 4
```

禁止把整段 CLI stdout 存进 Shell 变量再二次截取 JSON，也禁止依赖未 `export` 的 `RUN_ID/NODE_BIN/CLI/OUTDIR` 启动子进程。候选与采集进度必须通过 `candidates_json`、`products.json` 文件传递。

### P0：采集批次容量与超时（必须遵守，否则必被强杀）

单品完整采集（主图 → SKU → 商详三屏 → 评论）实测 **30–50 秒/品**，而工具调用默认超时只有 **150 秒**、最大 **300 秒**。由此推出三条硬约束：

| `--target` | 预计耗时 | 要求 |
|---:|---|---|
| ≤3 | 90–150s | 必须 `timeout=300000`，可一次采完 |
| >3（≥4，含默认 4） | >2.5 min | 必须 `timeout=300000`，接近/超上限；**必须靠落盘分批续采**——保持完整 `--target` 原样重跑，命令自动跳过已完成项补采剩余 |
| ≥6 | >4 min | 同上，必须分多次调用续采到 `completed == target` |

1. **任何 `pdd-capture-batch` 调用都必须显式传 `timeout=300000`**，不传必然在 150s 处 exit 124。
2. **目标 >3（即 ≥4，含默认 4）时，一次工具调用很可能采不满就撞超时**——这是正常的：`pdd-capture-batch` 每成功一品即**原子落盘 `products.json`**，被超时强杀（exit 124）后保持完整 `--target` 原值重跑同一条命令，会自动跳过已完成项、只补采剩余，重复到 `data.completed == target`。**禁止改小 `--target`**（跳过逻辑靠 `products.json` 驱动，改小反而会让命令提前认为已达标）。只有 ≤3 才可能一次采完。
3. **`pdd-capture-batch` 与 `pdd-search-sort-candidates` 禁止用 `&&` 串在同一次工具调用里**——搜索约 5s、采集数分钟，串起来必撞超时。

### 超时不等于失败：原样重跑即可续采

`pdd-capture-batch` 每成功一品就**原子写入 `products.json`**，进度落盘。因此被超时强杀（exit 124）时：

```text
命令被 kill（exit 124）
  ↓
手机端可能仍在跑，先等 30 秒再操作设备
  ↓
读 products.json，确认已完成条数
  ↓
用完全相同的参数重跑同一条命令（--target 保持原值）
  ↓
命令自动跳过已完成项（回执 results[].skipped=true），只补采剩余
  ↓
重复直到 data.completed == target
```

三条配套纪律：

- **重跑时 `--target` 保持原始目标值，不要改成"剩余数量"**；跳过逻辑由 `products.json` 驱动，改小反而会让命令提前认为已达标。
- **超时后不要立刻重跑**：手机端可能还在采当前商品，立即重跑会与残留操作抢设备。先读 `products.json` 确认状态。
- **超时不得记为失败、更不得据此宣称完成**；未达 `data.completed == target` 前禁止 `pdd-build-static-excel` 与 finalize。

`pdd-capture-batch` 的 `data.target` 始终保留用户要求的总目标数，不会因当前屏候选少而缩小；当前屏不足时返回 `success=false`、`data.needs_more_candidates=true`、`data.next_action=scroll_list_candidates`。收到该结果必须按“当前屏候选不足时的处理规范”滚动补采，禁止生成总 Excel、finalize 或宣称完成。只有累计 `products.json` 的唯一商品数达到目标，或插件明确返回 `at_bottom=true` 后如实说明实际可采数量，才可结束。

## 图搜流程

### P0 硬性禁令：图搜结果是否达标由拼多多算法负责

这是图搜链路的**最高优先级约束**：

```text
图片是否能搜
结果是否达标
候选是否相似
  ↓
都由拼多多图搜算法负责
  ↓
Agent 不复核、不质疑、不二次裁判
```

Agent 不是相似度裁判，agent 没有相似度判定权限。只要 `pdd-image-search-sort-candidates` 成功返回非空 `candidates`，就视为拼多多算法已经完成相似候选召回；`candidates` 非空时必须继续采集，不能再判断“这些结果是否和原图相符合”。

严禁以下行为：

- 禁止因为“看起来不像原图”而重搜。
- 禁止因为标题/颜色/款式与原图主观不一致而跳过候选。
- 禁止自行判断搜索结果是否达标、是否足够相似、是否值得采集。
- 禁止换关键词、换图片、重新打开相机、安全重启后再图搜。
- 禁止向用户汇报“拼多多搜出来的不太像，所以我不采集”。

唯一允许的判断：

```text
是否有 candidates
目标数量是多少
按什么排序
采哪些 candidate_ref
是否需要滚动补下一屏
```

默认执行规则：

```text
图搜命令成功 + candidates 非空
  ↓
信任拼多多候选列表
  ↓
按排序结果和目标数量选择 candidate_id + candidate_fingerprint
  ↓
直接执行 pdd-capture-one-product
```

唯一早停例外：如果插件返回 `success:false` 且 `error=image_search_image_too_small_or_unclear`，说明拼多多已经明确拒图（如弹出“图片尺寸过小，请更换清晰图片重试”）。这不是 Agent 判断相似度，而是拼多多算法拒绝输入图；此时必须退出本次图搜任务，让用户重新准备图片，不再排序、不再采集。

```text
拼多多明确拒图弹窗
  ↓
插件返回 success:false
  ↓
Agent 告知用户重新准备更清晰、更大尺寸、主体更明显的图片
  ↓
等待用户换图后重新开始
```

只有用户明确说“帮我人工判断这些候选像不像/相似度是否达标”时，Agent 才能额外说明需要用户确认；否则默认流程中绝不做主观相似度判断。

```text
用户提供图片
  ↓
pdd-image-search-sort-candidates（先结束拼多多进程并冷启动进入结果页；candidates 非空即视为拼多多算法已完成达标召回，Agent 不复核）
  ↓
agent 根据目标数量和候选顺序选择 candidate_id + candidate_fingerprint 列表
  ↓
循环执行 pdd-capture-one-product，直到达到目标数量
  ↓
采满后再汇总或构建总 Excel
```

示例：

```bash
"$NODE_BIN" "$CLI" pdd-image-search-sort-candidates \
  --local-image-path <image_path> \
  --sort sales \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/raw/<category>"
```

## 单品复合采集

从搜索结果页开始，采集完成后返回搜索结果页：

```bash
"$NODE_BIN" "$CLI" pdd-capture-one-product \
  --candidate-ref <candidate.candidate_id> \
  --candidate-fingerprint "<candidate.candidate_fingerprint>" \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/raw/<category>" \
  --time-budget-ms 240000
```

`candidate_id`、`candidate_fingerprint` 必须来自同一次搜索/图搜命令返回的同一个 `data.candidates[]` 元素。采集前会重新 dump 当前页面：指纹由规范化标题与展示价生成，优先用于身份匹配，编号只作为兼容回退，避免广告刷新、懒加载或排序变化后按旧位置采错商品。`candidate_fingerprint` 是插件返回的稳定字段，agent 不自行改写、截断或重新生成；旧产物的标题型指纹仍兼容。

内部顺序固定：

```text
主图采集
  ↓
SKU 规格枚举
  ↓
商详三屏 XML + 截图
  ↓
评论首屏采集
  ↓
返回搜索结果页
```

主图采集策略：每个商品都优先尝试“一键保存全部图片”。保存检测采用 MediaStore + PDD保存目录扫描双通道；如果保存到部分原图（通常≥3张）也优先使用原图并标记 partial，不直接降级截图。若一键保存完全失败，只对当前商品执行截图 fallback；**不再读取或写入设备级当日缓存**，一次失败不能影响后续商品。

每个商品约 30–50 秒。

**`pdd-capture-one-product` 与 `pdd-capture-batch` 的选用边界**（避免二选一时犯难）：

| 场景 | 用哪个 |
|---|---|
| 常规批量采集（默认 4 品） | `pdd-capture-batch`，`--target` 传完整值，`timeout=300000`；>3 靠落盘续采 |
| 目标 ≤3 | `pdd-capture-batch` 通常一次采完 |
| 目标 >3（含默认 4） | `pdd-capture-batch` 分多次调用，`--target` 保持原值靠跳过续采 |
| 需要逐品人工确认、调试单品、定向补采某一个候选 | `pdd-capture-one-product` |
| batch 中某品反复失败要单独排查 | `pdd-capture-one-product` |

单品命令本身也要 `timeout=300000`（单品最长 50s，但商详三屏偶发变慢）。无论用哪个，最终都必须采满目标数量。

## 总 Excel 构建

一次用户任务对应一个总目录：

```text
$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/
  report.xlsx
  report.json
  report.html
  temp/
    products.json
    task_index.json
    raw/
      <category>/
        candidates.json
        <raw_product_dir>/
  products/
    product_001/
      product.json
      sku.json
      media/images/image_001.jpg
      evidence/detail_001.png
      evidence/review_001.png
      temp/
    product_002/
      ...
```

每个商品只暴露 `product_001/product_002` 这类正式目录；`c1/c2` 候选编号和类目名不能作为最终商品目录名。所有候选快照、原始单品目录、XML、manifest 和采集上下文必须写到任务的 `temp/raw/<category>/`。主图放正式商品目录的 `media/images/`，商详/评论截图放 `evidence/`，构建中间数据放商品目录下的 `temp/`；类目保留在 `product.json` 字段中。

### products.json 输入目录硬约束

`products.json` 的每一个 `product_dir` 必须原样复制对应 `pdd-capture-one-product` 成功响应中的 `data.output_dir`，即 `temp/raw/<category>/<timestamp>_<candidate>/` 原始采集目录。该目录至少包含 `product_manifest.json`，并包含 `main_images/`、`sku/`、`detail_screens/` 中至少一个采集子目录。

`products/product_001` 等目录由 `pdd-build-static-excel` 创建，是报告输出，绝不是下一次构建的输入。禁止手动预整理、复制或改名 raw 文件后再传给构建器；构建器会校验并拒绝输出目录，防止 SKU、价格、图片和评论字段被错误置空。

多类目时先把 `products-json` 写到 `$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/products.json`：

```json
[
  { "category": "图搜_格子短裤", "product_dir": "<第1次成功采集返回的data.output_dir绝对路径>" },
  { "category": "文搜_牙刷", "product_dir": "<第2次成功采集返回的data.output_dir绝对路径>" }
]
```

上例中的完整路径不是按名字推测出来的；必须直接使用两次采集响应的 `data.output_dir` 实际值。只有采集响应 `success=true` 且该目录存在时才加入数组。

再执行：

```bash
"$NODE_BIN" "$CLI" pdd-build-static-excel \
  --products-json "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<run_id>/temp/products.json" \
  --run-id <run_id> \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT" \
  --cleanup
```

### 最终交付必须精简清理

正常最终交付必须给 `pdd-build-static-excel` 加 `--cleanup`；仅在排障、准备重新构建或用户明确要求保留中间数据时不加。只有 `report.xlsx`、`report.html` 均成功且非空时清理才会执行；清理后必须保留 `report.xlsx`、`report.html`、`report.json` 和 `media/images`、`evidence` 中的图片，删除其余 JSON/XML/manifest/log/temp 数据。`report.json` 是统一 finalizer 的 `raw_data` 输入，禁止在 finalizer 前删除。任务内的 `temp/raw/` 会随 `temp/` 一次删除；本次构建若使用了任务外部的原始商品目录，也会按显式路径删除。

**安全约束**：`--cleanup` 的外部目录删除仅限满足以下**全部**条件的路径：
1. 目录必须位于当前 `$ECOMMERCE_OUTPUT_ROOT`（workspace）内，且不等于 workspace 根目录本身；
2. 目录必须位于本工具拥有的 capture root（即 `$ECOMMERCE_OUTPUT_ROOT/pinduoduo/`）之内，且相对该 root 的层级 ≥ 2 —— 平台目录本身、任何 run 的整个任务目录都删不到；
3. 目录名必须匹配 output-layout 生成的模式（如 `capture_NNN_xxx`、`<timestamp>_xxx`、`search_NNN_xxx`、`seed_product_NNN_xxx`、`pdd_capture_NNN_xxx`）；
4. 归属必须可证：目录内存在 `.pdd-capture.owner` 且 `platform` 为 `"pinduoduo"`，或存在原始采集标志 `product_manifest.json`；两者皆无一律拒删；
5. 目录必须是普通目录（非 symlink）；
6. 目录不得与 taskDir 在 realpath 层面重叠。

所有目标在删除第一个字节之前统一校验，任一条不满足则整次清理直接失败且磁盘不动（fail-closed）。因此被篡改或写错的 `products.json` 无法把递归删除引向工作区里的普通用户目录；任务外目录、用户手建目录、历史残留目录不会被删除，只会被复制。

独立命令 `pdd-cleanup-output --run-id <run_id> --output-dir "$ECOMMERCE_OUTPUT_ROOT" [--products-json <file>|--product-dirs <dirs>] [--dry-run] [--allow-missing-report]` 使用同一套安全检查。`--dry-run` 只返回预计删除文件数和字节数，不修改磁盘。

`--allow-missing-report`：**仅在明确知道该 run 已废弃（如候选返回全无关、用户放弃继续采集）时使用**——允许在没有 `report.xlsx` / `report.html` 的情况下清理拼多多任务目录（会删除 `temp/`、`products/` 里的所有中间态；task 目录本身如变空一并移除）。默认场景仍要求 report 存在，避免误删仍在使用中的中间数据。清理后若本轮还有共享任务根空壳，由主 Skill 的 `abort-task` 仅针对本次唯一任务 ID 回收；禁止清理裸 `pinduoduo/` 平台目录。

**生成 Excel/HTML 后不能直接 present 中间路径**：必须立即调用统一 finalizer，把 `pdd-build-static-excel` 返回的真实 `workbook_path`、`html_path`、`json_path/report_json` 作为 `--file` 入参；只有 finalizer stdout 的 `present_files` 可以注册，否则 AccioWork 可能引用已移动或即将清理的路径。

`pdd-build-static-excel` 成功后会同时返回：

```text
workbook_path  # Excel字段对比表
html_path      # HTML商品卡预览页（如果生成成功）
report_json    # 原始汇总 JSON
```

文件写入磁盘不等于用户可见。Accio Work 侧边栏不会自动扫描磁盘，必须由 agent 显式注册。

```text
✅ 必须做：
  pdd-build-static-excel 成功 → 返回 workbook_path + html_path + report_json/json_path
    ↓
  调用 node "<ecommerce-search 根>/common/finalize.js" deliver 语义化移动
    ↓
  注册 deliver 返回的最终 .xlsx/.html/.json 路径

❌ 错误做法：
  生成 Excel/HTML 后直接告知用户“产物已生成”
  没有调用 present_files → 用户实际看不到文件
```

## 当前屏候选不足时的处理规范

当目标采集数量 > 当前搜索页首屏可见候选数时，遵循以下流程：

```text
搜索/图搜排序完成，首屏只有 N 个候选（N < 目标）
  ↓
先将首屏 N 个候选全部采集完毕（不能中途提前滚动）
  ↓
已采数量 < 目标数量
  ↓
调用 pdd-scroll-list-candidates --screen-index 2 --prev-fingerprint <首屏fingerprint>
  ↓
从新屏候选继续采集，直至达到目标数量或 at_bottom=true
```

**坐标安全要求**：
- 滚动前的所有候选坐标在滚动后全部失效，禁止在滚动后使用旧坐标
- `pdd-scroll-list-candidates` 返回的 `candidates` 是滚动后当前屏的坐标，与前一屏候选独立
- `at_bottom=true` 时停止继续滚动，向用户说明实际可采数量

## agent 决策边界

agent 只做：判断文搜/图搜、排序模式、目标数量档位、采哪些 `candidate_id + candidate_fingerprint`、拆几批采集、是否已采满、何时生成总 Excel。

agent 不做：只返回候选不采集、手写坐标、直接分析原始截图、主观判断图搜候选是否相似、因“看起来不像”而重搜/跳过/中止、用子 agent 还原 SKU、手工编造 Excel 字段、并行控制同一台手机、生成 Excel 后不调用 `present_files` 就告知用户完成。

**采集调用纪律（三条，违反即为执行错误）**：

1. 任何 `pdd-capture-*` 调用都必须显式 `timeout=300000`，且**单独一次工具调用**，不与搜索/构建命令用 `&&` 串联。
2. `pdd-capture-batch --target` 始终传完整目标值：≤3 通常一次采完；>3（含默认 4）分多次重跑同一命令、`--target` 保持原值靠落盘跳过续采。
3. 超时（exit 124）**不是失败**：等 30 秒 → 读 `products.json` → 原样重跑续采；未达 `completed == target` 前不得构建 Excel 或宣称完成。

## 常用命令清单

所有 shell 命令都通过 `"$NODE_BIN" "$CLI" <cmd>` 调用（变量解析见「CLI 路径解析」章节）；宿主工具调用使用 `pinduoduo-phone-auto`。不要写裸 `phone-auto xxx`、`node xxx` 或 `adb xxx`。

| 目的 | 命令 |
|---|---|
| 前置检查 | `preflight-check --app 拼多多` |
| 权限独立诊断/修复 | `pdd-grant-permissions`（preflight 已执行最终状态校验，成功后无需重复运行） |
| 文搜排序候选 | `pdd-search-sort-candidates --keyword <词> --sort <模式>` |
| 图搜排序候选 | `pdd-image-search-sort-candidates --local-image-path <图> --sort <模式>` |
| 查看当前候选 | `pdd-list-candidates --limit <N>` |
| 单品完整采集（调试/定向补采，需 `timeout=300000`） | `pdd-capture-one-product --candidate-ref <candidate_id> --candidate-fingerprint <candidate_fingerprint>` |
| 批量串行采集并落进度（**默认 4 品；`--target` 传完整值，必须 `timeout=300000`；>3 靠落盘原样重跑续采**） | `pdd-capture-batch --candidates-json <搜索返回路径> --products-json <绝对路径> --output-dir <绝对路径> --target <N> --category <类目>` |
| 构建总 Excel 并精简清理 | `pdd-build-static-excel --products-json "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/<id>/temp/products.json" --run-id <id> --output-dir "$ECOMMERCE_OUTPUT_ROOT" --cleanup` |
| 预览/执行已有任务清理 | `pdd-cleanup-output --run-id <id> --output-dir "$ECOMMERCE_OUTPUT_ROOT" [--dry-run]` |
| 兜底恢复输入法（仅 `selection_filter.ime.restored=false` 时） | `task-cleanup --restore-ime <ime>` |
| 滚动补候选 | `pdd-scroll-list-candidates --screen-index <N> --prev-fingerprint <fp>` |

## 图搜最小可用模板（复制即可跑，跨机器可移植）

拼多多图搜的全链路串起来是这样——把它当"金标准"，任何图搜请求都可以从这里开始改：

```bash
# 0. 解析 CLI 路径（见「CLI 路径解析」章节，bash 版）
CLI=""
for d in "$HOME"/.accio/accounts/*/plugins/installed/*/skills/ecommerce-search/platforms/pinduoduo/tools/phone-auto-cli.js; do
  [ -f "$d" ] && CLI="$d" && break
done

ECOMMERCE_OUTPUT_ROOT="<用户工作目录绝对路径>"
RUN_ID="pdd_$(date +%Y%m%d%H%M%S000)_$(openssl rand -hex 2)"
CATEGORY="图搜_<描述性关键词>"
OUTDIR="$ECOMMERCE_OUTPUT_ROOT/pinduoduo/$RUN_ID/temp/raw/$CATEGORY"
IMG="<本地图片绝对路径>"      # 图搜只接受本地路径，URL 需要先下载到本地
TARGET=4                       # 默认档位：搜同款用 4，常规对比用 5，深度对比用 8

# 1. 环境预检（每 session 一次，首次可能懒下载 adb）
"$NODE_BIN" "$CLI" preflight-check --app 拼多多

# 2. 图搜 + 排序（preflight 已完成权限最终状态校验）
"$NODE_BIN" "$CLI" pdd-image-search-sort-candidates \
  --local-image-path "$IMG" \
  --sort sales \
  --output-dir "$OUTDIR"
# → stdout JSON 里读 data.candidates；candidate_id 形如 c1/c2/…，每项同时含 candidate_fingerprint
# ⚠️ candidates 非空即视为拼多多算法已完成召回，Agent 不复核相似度

# 3. 批量采集（每品 30-50s）
# ⚠️ 本步必须单独一次工具调用 + timeout=300000；--target 传完整值（默认 4）；>3 撞超时属正常，原样重跑靠落盘续采
mkdir -p "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/$RUN_ID/temp"
PRODUCTS_JSON="$ECOMMERCE_OUTPUT_ROOT/pinduoduo/$RUN_ID/temp/products.json"
"$NODE_BIN" "$CLI" pdd-capture-batch \
  --candidates-json "<搜索返回的 data.candidates_json>" \
  --products-json "$PRODUCTS_JSON" \
  --output-dir "$OUTDIR" \
  --category "$CATEGORY" \
  --target "$TARGET"
# 被超时 kill（exit 124）不是失败：等 30s → 读 products.json → 用完全相同参数重跑，
# 命令会自动 skipped 掉已完成项，只补采剩余。重复直到 data.completed == TARGET。
# 需要逐品人工确认或定向补采某个候选时，才改用 pdd-capture-one-product。

# 4. 合并 products.json 并构建总 Excel（--cleanup 会精简中间态）
# pdd-capture-batch 已原子写好 products.json，无需手工拼装；
# 只有用 pdd-capture-one-product 逐品采集时才需要自己按下面格式写入：
#   [ { "category": "<类目>", "product_dir": "<成功采集返回的 data.output_dir 绝对路径>" }, ... ]

"$NODE_BIN" "$CLI" pdd-build-static-excel \
  --products-json "$ECOMMERCE_OUTPUT_ROOT/pinduoduo/$RUN_ID/temp/products.json" \
  --run-id "$RUN_ID" \
  --output-dir "$ECOMMERCE_OUTPUT_ROOT" \
  --cleanup

# 5. Excel/HTML 写盘 ≠ 用户可见，必须先用 node "<ecommerce-search 根>/common/finalize.js" deliver 语义化移动
#    → 只注册 deliver stdout 的 present_files
```

> **⚠️ 图搜返回 `error=image_search_image_too_small_or_unclear` 是拼多多算法拒图**（非 Agent 判断相似度）——按 SKILL「图搜流程」硬性禁令处理：告知用户换更清晰的图，禁止自行换关键词或重搜。

## 变更记录

### v0.2
- **修复"跨机器 adb 不在 PATH 导致授权全部失败"的老坑**：SKILL 原来要求 Agent 手写 5 条 `adb shell pm grant`；跨机器安装插件后（尤其 Windows）adb 不在 PATH，会 `CommandNotFoundException`。此外 5 条裸 `pm grant` 手写，既受 SDK 版本影响不完备（Android ≤12 用 `READ_EXTERNAL_STORAGE`，13+ 用 `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO`），也失去了授权是否生效的校验。
- **新增 `pdd-grant-permissions` 命令**（当前实现在 `src/commands/pdd-utils.js`，由 `tools/routes.json` 注册）：内部走插件已解析好的 adb（懒下载到 `~/.phone-auto/platform-tools/`），按 `dumpsys package` 检测 `targetSdk` 智能选权限集，pm grant 后再用 dumpsys 二次校验授权真正生效。已废弃 SKILL 里旧的 5 条裸 `adb shell pm grant`。
- **消除 `<pluginRoot>` 占位符歧义**：新增「CLI 路径解析」章节，给出 bash / PowerShell 两版 CLI 路径自解析代码；当前版本同时解析 `$NODE_BIN`，避免新机器没有全局 Node 时命令在业务执行前失败。
- **新增「图搜最小可用模板」章节**：约 40 行 bash，涵盖 CLI 解析 → preflight（含权限最终状态校验）→ 图搜排序 → 逐品采集 → 构建 Excel 全链路，跨机器复制即可跑。
- 更新「必做前置检查」「P0：授权」「常用命令清单」三节。
