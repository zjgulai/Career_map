---
name: douyin
description: 通过 Android 真机自动化搜索和采集抖音电商商品，支持关键词搜索、图片找同款、商品详情与 SKU 采集、短链解析、图片/视频下载和 Excel 报告。用户要求搜索抖音商品、图搜同款、采集竞品或导出抖音商品数据时使用。依赖 phone-auto CLI。
---

# 抖音商品采集

## 核心规则

1. 抖音和拼多多共用同一台手机，必须串行执行，禁止并发操作设备。
2. 用户未指定数量时，默认采集 **4 个商品**。
3. 每个新 session 先单独运行 `preflight`，工具超时设为 `300000`。
4. `preflight` 必须遵循 `../../references/mobile-android-preflight.md`：跑完先把 `data.setup_guide_markdown`（安卓调试教程链接 + 「有操作成本、请耐心做完」提醒）原样展示给用户一次，**无论 `ready` 是 true 还是 false**；若 `data.ready=false`，再原样展示 `data.primary_issue.user_message_markdown` 后停止，等待用户处理并重新执行完整 preflight。
5. 所有 phone-auto 命令都通过 helper 的 `pa` 子命令调用，不写裸 `phone-auto` 或 `adb`。
6. `<session>` 禁止手拼：**必须用 `new-session <语意名>` 生成**（语意名可直接传中文，会自动安全化；输出格式 `<semantic_ascii>_<YYYYMMDDHHmmssSSS>_<4位十六进制随机>`，时间戳是 **17 位含毫秒**）。**注意 stdout 有两行**：第一行才是 session，第二行是 `FINAL_RESULT=`（其 JSON 的 `session` 字段也携带同一值）。用变量捕获时必须只取第一行，且**先整体捕获、再取首行**，不要把 helper 直接管道给 `head`：bash 用 `OUT=$("$NODE_BIN" "$HELPER" new-session 裙子)` 后跟 `SESSION=$(printf '%s\n' "$OUT" | head -n1)`；PowerShell 用 `$SESSION = (& $NODE_BIN $HELPER new-session 裙子)[0]`。把两行一起塞进变量会带入换行和 JSON，后续传参必被校验拒绝。**不要写 `... new-session 裙子 | head -n1`**：`head` 读满一行就关闭管道读端，helper 写第二行 `FINAL_RESULT=` 时管道已断，stderr 会打印一段 `write EPIPE` 崩溃栈。v1.18 起脚本已忽略该 EPIPE、不再崩溃，但管道写法仍会让 `FINAL_RESULT` 丢失，失去判定 helper 是否真正跑通的唯一依据，因此一律改用先捕获后取行。同一会话继续执行时复用已返回 session，禁止按 query 自动找最近目录。若仍收到 session 格式报错：报错文案会回显实际收到的值，先核对是否多捕了 FINAL_RESULT 行；校验在任何设备操作之前完成，手机没有动过，**修正 session 后重跑同一条命令即可，绝不需要重新开始搜索流程**（秒级 14 位时间戳会被自动补 000 归一化，后续 report 用原 session 传参也会映射到同一目录）。
7. 用户给关键词走文搜；用户给商品图片或图片 URL 走图搜。
8. **每次调用完 helper，读 stdout 最后一行的 `FINAL_RESULT=` 判断真实结果**（v1.17 起）。看不到这一行 = helper 根本没跑起来，八成是变量展开踩坑（见下方 R0）。
9. 所有本地文件只能写入用户明确传入的工作目录：执行前必须设置 `ECOMMERCE_OUTPUT_ROOT=<用户工作目录绝对路径>`，禁止使用插件目录或相对 `reports`；最终交付必须直接调用主 Skill 的 `node "<ecommerce-search 根>/common/finalize.js" deliver`，不得经过 shell wrapper 或手工移动。
10. 单独调用 `pa screenshot` 时必须显式传 `--output-dir "$ECOMMERCE_OUTPUT_ROOT/douyin/<session>/temp/screenshots"`；禁止省略输出目录，避免截图散落在工作区平台根目录。
11. **`step` 一次只采 1 个商品，必须反复调用直到 `PROGRESS_JSON.done=true`**；看到 `done:false` 就继续调用同一条 `step`，禁止在未 done 时执行 `report` 或交付。详见「P0：step 必须循环到 done」。

## P0：step 必须循环到 done（最高频漏采原因）

`step` 的语义是**单步**——一次调用最多推进一个商品。它不会自动跑满 `target`。真实事故：图搜结果页已有 3 个候选，`step` 调用一次后返回 `completed:0, attempted:1, done:false, cached_cards_remaining:2`，Agent 直接去跑 `report`，最终只交付 1 个商品。

正确循环：

```text
step ... → 读 PROGRESS_JSON
  ├─ done:true            → 结束，进入 report
  └─ done:false           → 再次调用完全相同的 step 命令
                            （重复，直到 done:true 或 stop_reason 出现）
```

判定字段（每次 `step` 后必读）：

| 字段 | 含义 | 处置 |
|---|---|---|
| `done: false` | **还没采满**，无论 completed 是多少 | 继续调用 `step` |
| `completed` | 已成功入库数（PC 解析也完成） | 与 target 比对 |
| `desktop_queued` / `desktop_pending` | 手机端完成、PC 仍在解析 | 正常，继续 `step` |
| `cached_cards_remaining` | 结果页还剩几张未采卡片 | >0 且 done:false 时必须继续 |
| `failed` | 当前品失败 | 不中断，继续下一次 `step` |
| `stop_reason: exhausted` | 卡片已试完仍未凑齐 | 允许结束，但必须如实说明实际条数 |

三条硬约束：

1. **`done:false` 时禁止执行 `report`**，更禁止 finalize 或告知用户完成。
2. **每次 `step` 是一次独立工具调用**，`timeout=300000`；禁止用 `&&` / `for` 把多次 `step` 串进同一次调用。
3. **交付前必须核对 `report` 返回的 `product_count == target`**；不相等时说明还没采满，回到 `step` 继续补，或如实说明 `exhausted`。

> **只有目标 ≤3 且环境已缓存时才可用 `run` 一次跑完**（`timeout=300000`）；`run` 不落盘、被杀不可续跑，拿不准就用 `step`。
>
> **目标 >3（即 ≥4，含默认 4、10 个等）一律走 `step` 逐品循环，禁止用 `run`。** 单品 45–90s，4 品起就会逼近甚至超过工具 300s 上限；`run` 一旦被超时强杀，进度只在内存、无法续跑，重跑还会重复编号叠加导致成品数超 target。`step` 每品落盘（`.progress-*.json`），被杀后原样重跑即自动续采，天然抗超时——这是默认档位及以上唯一安全的路径。

### 按目标数量选择采集模式（硬规则）

| 目标数量 | 采集模式 | 超时与落盘 |
|---:|---|---|
| ≤3 | 可用 `run` 一次跑完 | `timeout=300000`；不落盘，被杀须整批清理换新 session 重来 |
| >3（≥4，含默认 4、10） | **强制 `step` 逐品循环** | 每次 `step` 独立工具调用 `timeout=300000`；落盘可续跑，被杀原样重跑续采 |

>3 品（含默认 4）执行要点：
1. 反复调用**完全相同**的 `step` 命令（`target` 全程保持用户要求的总数，如 `4` 或 `10`），每次一个独立工具调用，直到 `PROGRESS_JSON.done=true`。
2. 禁止把多次 `step` 用 `&&` / `for` / 后台任务串进同一次调用——一定撞超时。
3. 被超时/中断杀掉后**不要改小 target、不要 `--reset`、不要换 `run`**：先读 `PROGRESS_JSON` / 磁盘状态确认已完成条数，再原样重跑同一条 `step` 续采。
4. 交付前仍按 P0 核对 `report` 的 `product_count == target`；只有 `stop_reason=exhausted` 才允许少于 target 并如实说明。

## R0：环境变量陷阱（重要，先看）

Bash / zsh 里 **`VAR=val cmd`** 语法**只把变量注入到 cmd 的环境**，**不会写入当前 shell 变量表**。所以下面这行是坑：

```bash
# ❌ 错：单行前置赋值 + 立即展开 $HELPER
PHONE_AUTO_PLUGIN_ROOT=... HELPER=... "$NODE_BIN" "$HELPER" preflight
#                                                    ^^^^^^^^ 当前 shell 里没有 HELPER，展开成空串
#                                                    实际执行："$NODE_BIN" preflight
#                                                    Node 找不到叫 preflight 的文件，静默退出
#                                          bash 工具看到 "(success, no output)"
```

**正确写法（三选一）：**

```bash
# ✅ 方式 A：export 到当前 shell，再单独调用
export PHONE_AUTO_PLUGIN_ROOT="$SKILL_DIR"     # 扁平化后 SKILL 目录即平台根目录
export HELPER="$SKILL_DIR/scripts/douyin-capture.js"
"$NODE_BIN" "$HELPER" preflight

# ✅ 方式 B：不用变量，直接写绝对路径
PHONE_AUTO_PLUGIN_ROOT=/…/platforms/douyin \
  "$NODE_BIN" /…/platforms/douyin/scripts/douyin-capture.js preflight

# ✅ 方式 C：用 env 命令包裹（等价 B，参数更清爽）
env PHONE_AUTO_PLUGIN_ROOT=/…/platforms/douyin \
  "$NODE_BIN" /…/scripts/douyin-capture.js preflight
```

**判定 helper 真正跑起来了的唯一标准**（v1.17）：stdout 最后一行有 `FINAL_RESULT={"success":true/false,...}`。看不到这一行就是命令根本没进入 helper 主流程，回去检查变量展开。

## Helper 路径解析

`$SKILL_DIR` 是本 skill 目录，优先使用 `skill({action:"read", skill_id:"douyin"})` 返回的 `install_path`：

**Windows PowerShell：**

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

$env:PHONE_AUTO_PLUGIN_ROOT = $SKILL_DIR
$HELPER = Join-Path $SKILL_DIR "scripts\douyin-capture.js"
$env:ECOMMERCE_OUTPUT_ROOT = "<用户工作目录绝对路径>"
```

**macOS / Linux (bash / zsh)：** **必须先 export 再调用**，不要用单行前置赋值。

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

export PHONE_AUTO_PLUGIN_ROOT="$SKILL_DIR"
export HELPER="$SKILL_DIR/scripts/douyin-capture.js"
export ECOMMERCE_OUTPUT_ROOT="<用户工作目录绝对路径>"
# 若需 shell 自行解析（必须过滤到含 scripts/douyin-capture.js 的目录）：
# for d in "$HOME"/.accio/accounts/*/plugins/installed/*/skills/ecommerce-search/platforms/douyin; do
#   [ -f "$d/scripts/douyin-capture.js" ] && SKILL_DIR="$d" && break
# done
```

> 后续示例统一写 PowerShell 的 `& $NODE_BIN $HELPER ...`；macOS / Linux 等价写法为 `"$NODE_BIN" "$HELPER" ...`。必须先完成本节的 Node 版本检查和 R0 变量设置。

**禁止手写 `NODE_BIN` 绝对路径**：`external-tools` 下的目录名含随机哈希段（实际形如 `external-tools/va8fc21487f16/node/bin/node`），**不是** `external-tools/node/<版本号>/bin/node`。按版本号规律猜路径必然 `no such file or directory` 并以退出码 127 失败，且该失败发生在任何设备操作之前——手机不会有动作，改用正确写法重跑同一条命令即可，无需重新开始搜索流程。只允许两种取值方式：直接用 PATH 里的 `node`，或用上面的探测片段赋值 `NODE_BIN`。同理，`$SESSION`、`$HELPER` 等变量必须在**同一次** bash 调用内完成赋值与使用——本工具每次调用都是独立 shell，跨调用的变量一律为空。

## 文搜

适合关键词搜索。目标不超过 **3** 个时使用 `run`（session 先用 `new-session` 生成，**只取 stdout 第一行**，下同）：

```powershell
& $NODE_BIN $HELPER preflight
$SESSION = (& $NODE_BIN $HELPER new-session "运动鞋")[0]
& $NODE_BIN $HELPER run "运动鞋" 3 $SESSION
& $NODE_BIN $HELPER report $SESSION
```

macOS / Linux 等价写法：`OUT=$("$NODE_BIN" "$HELPER" new-session 运动鞋); SESSION=$(printf '%s\n' "$OUT" | head -n1)`。

执行要求：

- `preflight` 和 `run` 必须是不同的工具调用，均设置 `timeout=300000`。
- `run` 是一次性内存流程，不支持可靠续跑。若超时或中断，换新 session 重跑，或改用 `step`。
- 目标超过 **3** 个、需要人工检查或需要续跑时使用 `step`：

```powershell
& $NODE_BIN $HELPER step "运动鞋" 8 "sports_20260729153100123_cd34"
```

每次 `step` 最多尝试一个商品，重复调用直到 `PROGRESS_JSON.done=true`。

### 价格区间与排序筛选（仅文搜）

> ⛔ **`run` / `step` 不接受 `--min-price` / `--max-price` / `--sort`**。有任何价格或排序条件时，唯一入口是 `filtered-run`。
>
> 历史事故：`run <kw> 4 <session> --min-price 12 --max-price 15` 曾被静默忽略价格参数、照常退出 0，结果采回 179 元和 316 元的商品却被当作"已按 12-15 元筛选"交付。v1.19 起这类调用会在**任何设备操作之前**直接报错并提示改用 `filtered-run`，手机不会启动，改完命令原地重跑即可，无需换 session。

`run`/`step` 内部的 `search` 会 force-stop 冷启动并重置结果页。用户提出最低价、最高价或价格区间时必须改走文搜；图搜没有价格区间筛选，不得本地补筛：

1. 有价格条件时优先使用原子命令 `filtered-run <kw> <target> <session> --sort <comprehensive|sales> [--min-price N] [--max-price N]`。它内部依次执行文搜、筛选、`run --no-search`；搜索或筛选任一步 `success!=true` 都直接返回非零并停止，不能继续采集。
2. 仅在排障时才手动拆成 `pa search` → `pa apply-selection-filters` → `run/step --no-search`；每一步必须单独检查返回状态，筛选失败不得执行后续采集。
3. 无价格条件时才允许图搜；图搜排序使用 `pa apply-image-sort --sort <comprehensive|sales>`，该路由不暴露 `--min-price`/`--max-price`。
4. 最低价和最高价都可单独使用；两者都有时最低价不得高于最高价。当前稳定排序只支持综合、销量；虽然会提取“价格”坐标，但没有稳定实现前不得假装价格升降序成功。
5. 任一用户要求的控件无法定位时停止并报告具体缺失控件，禁止盲点固定坐标，也禁止退回默认排序后把任务描述成已满足约束。
6. 成功后采集统一带 `--no-search`：文搜用 `run/step <kw> <target> <session> --no-search`；无价格图搜加 `--ctx image_search`，避免重搜冲掉结果页。
7. **进入筛选面板填价格区间时，务必区分最低价/最高价的填写位置**：抖音价格区间输入框固定「左框=最低价、右框=最高价」。`apply-selection-filters` 已按 输入框文案 → 标签就近 → 同一行左右几何 → 左右位置自检纠偏 四层逻辑锁定，绝不能凭输入框在 XML 里的出现顺序猜；若定位到的最低价框在最高价框右侧会自动交换回来。填反价格区间即视为失败，需停止并报告。
8. **每个价格框填写完成后固定等待约 3 秒再操作下一步**：抖音价格输入是异步校验/回填的，填完最低价立即去点最高价或「确定」会丢字或筛选不生效。命令内部已在每个框输入后等待 3s（`--price-input-settle-wait-ms` 可调），不要把两个价格框的填写并到无间隔的连续点击里。

> helper 兜底：连续 3 屏无新品时会自动点一次「销量」Tab 扩量（见快照 `sort_tab`）。若用户明确指定综合排序且采集量大到触发该兜底，改用 `step` 逐品控制，避免排序被切到销量。

## 图搜

### 标准流程

每一步单独执行：

```powershell
& $NODE_BIN $HELPER preflight
& $NODE_BIN $HELPER grant-perms
& $NODE_BIN $HELPER pa push-image --image "<图片 URL 或本地绝对路径>" --session "img_20260729153200123_ab12"
& $NODE_BIN $HELPER pa image-search --app "抖音" --session "img_20260729153200123_ab12"
```

根据 `data.page_state` 分流：

| 状态 | 下一步 |
|---|---|
| `scan` | 只使用返回的 `data.album_entry.x/y/bounds` 点击相册入口，然后执行 `select-pushed-image` |
| `album_picker` | 直接执行 `select-pushed-image` |
| `results_half` / `results_full` | 已进入图搜结果页，直接执行 `expand-image-search-results` |
| `permission_popup` | 重跑一次 `grant-perms` 后重试 `image-search`；仍失败则停止并报告 |
| `unknown` / `wrong_app` | 停止，读取 trace 和当前状态排查 |

`scan` 示例：

```powershell
& $NODE_BIN $HELPER pa tap --x <album_entry.x> --y <album_entry.y>
& $NODE_BIN $HELPER pa select-pushed-image --session "img_20260729153200123_ab12"
```

到达结果页后：

```powershell
& $NODE_BIN $HELPER pa expand-image-search-results
```

到达结果页后开始采集。**默认目标 4 个（>3）必须走 `step` 逐品循环**，一次只采 1 个商品，要**反复执行**同一条命令，每次一个独立工具调用（`timeout=300000`），直到 `PROGRESS_JSON.done=true`：

```powershell
# ✅ 默认路径（目标 >3，含默认 4）：单步命令，一次只采 1 个商品，必须重复调用
& $NODE_BIN $HELPER step "sanag S6S Ultra" 4 "img_20260729153200123_ab12" --ctx image_search --no-search
# 读 PROGRESS_JSON：done:false → 原样再调一次；done:true → 才能继续下一步
```

本节前置步骤已执行 `expand-image-search-results`，所以 `step` 必须带 `--ctx image_search --no-search`，避免重新搜索冲掉结果页。

**仅当目标 ≤3** 且环境已缓存时，才可用 `run` 一次跑完（`timeout=300000`，无需循环）：

```powershell
# 仅 ≤3 时可用：一次跑完，不落盘、被杀不可续跑
& $NODE_BIN $HELPER run "sanag S6S Ultra" 3 "img_20260729153200123_ab12" --ctx image_search --no-search
```

`run` 正常结束即等价于 `done:true`，可直接进入 `report`，但仍须按「P0」核对 `product_count == target`。**目标 >3（含默认 4、10 个等）禁止用 `run`**：单品 45–90s 会逼近/超过 300s 上限，且 `run` 不落盘、被杀不可续跑，只能用可续跑的 step。

```text
第 1 次 step → done:false, completed:0  → 继续
第 2 次 step → done:false, completed:1  → 继续
第 3 次 step → done:false, completed:2  → 继续
第 4 次 step → done:true,  completed:4  → 结束循环
```

> **v1.20 修复**：step 的续跑进度写在 `temp/` 下，与 `products/` 同属一个 task_dir。此前 `selectionManifestPath` / `progressStatePath` 以 `create:true` 调 `douyinTaskLayout` 却未传 `allowProductsProgress`，导致第 2 次 step 因 `products/product_001` 已存在被目录守卫判为「已有业务数据」，在**任何设备操作之前**直接抛 `task_dir 已包含既有报告或业务数据，拒绝复用`。
> 该报错**与超时无关，拉长 timeout 无效，换新 session 只是绕过而非修复**。若再次遇到，先确认此修复是否已同步到实际运行的插件目录。

**`done:false` 时禁止往下走 `report`**（判定字段与硬约束见「P0：step 必须循环到 done」）。确认 done 后再生成报告和清理源图：

```powershell
& $NODE_BIN $HELPER report "img_20260729153200123_ab12"
& $NODE_BIN $HELPER pa cleanup-image-search --session "img_20260729153200123_ab12"
```

`cleanup-image-search` 默认会**递归删除本地 session 专属目录**（`$ECOMMERCE_OUTPUT_ROOT/douyin/image-search/<session>/` 内的元数据、dump 与临时诊断），让成功或失败的图搜临时顶壳都能消失。需要保留排错现场时才追加 `--keep-session`。采集/报告失败且决定停止时，先运行本命令清手机端源图，再由主 Skill 的 `abort-task` 回收唯一失败任务根。
若因排错需要保留 session 记录，追加 `--keep-session`：
```powershell
& $NODE_BIN $HELPER pa cleanup-image-search --session "img_20260729153200123_ab12" --keep-session
```

`cleanup-image-search` 默认会**同时删除本地 session 元数据**（`reports/image-search/<session>/image-source.json` 及其空目录），让 `reports/image-search/` 顶壳自然消失，与其他平台的收尾语义对齐。
若因排错需要保留 session 记录，追加 `--keep-session`：
```powershell
node $HELPER pa cleanup-image-search --session "img-01" --keep-session
```

`cleanup-image-search` 默认会**同时删除本地 session 元数据**（`reports/image-search/<session>/image-source.json` 及其空目录），让 `reports/image-search/` 顶壳自然消失，与其他平台的收尾语义对齐。
若因排错需要保留 session 记录，追加 `--keep-session`：
```powershell
node $HELPER pa cleanup-image-search --session "img-01" --keep-session
```

### 图搜职责边界

- `select-pushed-image` 负责确定性选择本 session 推送的图片；禁止截图后凭视觉猜缩略图坐标。
- `expand-image-search-results` 负责进入“商品”Tab、刷新商品结果并执行展开滑动；点击“商品”Tab 后固定等待 2 秒，再执行时长 1 秒的展开滑动。
- 已返回 `results_half` 或 `results_full` 后，不再调用 `image-search`，不手动重复点击商品 Tab，也不额外滑动。
- “点按两次即可激活”可能只是无障碍描述，不是操作指令。禁止双击该文字或把它当遮罩处理。
- `tap` 是纯坐标命令，不接 `--session`。
- 如果权限验证显示已全部授权，但状态仍是 `permission_popup`，应检查 `detect-image-search-state` 的分类结果；不要盲点弹层。

## 进度与恢复

关注 `PROGRESS_JSON`：

- `captured`：商品已完成。
- `desktop_queued` / `desktop_pending`：手机端完成，等待桌面解析。
- `failed`：当前商品失败，可继续下一次 `step`。
- `done`：成功商品数达到目标。
- `result_scan_failed`：结果页状态不满足采集门禁，先检查页面状态，不要盲目重试。

恢复原则：

- `run` 被杀后不要使用 `run --start N` 叠加采集。
- `step` 会保存进度，可继续调用；人工改变结果页后添加 `--refresh-cards`。
- 不手工补 `Back`、重新搜索或猜坐标；结果页恢复由采集代码负责。

## 报告与交付

```powershell
& $NODE_BIN $HELPER report "<session>"
```

`report` 默认使用 `ECOMMERCE_OUTPUT_ROOT`；也可显式传 `--output-dir <用户工作目录绝对路径>`，显式参数优先。

**调用 `report` 的前提：最后一次 `step` 已返回 `done:true`**（或 `run` 正常结束）。`done:false` 就跑 `report`，会把半成品当作最终结果交付——这是已发生过的真实事故。

先生成不清理的中间报告，检查：

1. **`product_count` 必须等于 target**。小于 target 说明 step 循环没跑完：回到 `step` 继续补采，不要在报告环节"接受现状"。只有 `stop_reason=exhausted`（卡片已试完）才允许少于 target，且必须向用户如实说明实际条数与原因。
2. 每个有效商品的 `capture-result.json.success` 为 `true`。
3. 按 `product_id` 去重；缺失时使用“店铺名 + 规范化主图 URL”作为指纹。
4. 有重复时先补采，不得直接交付。

任一条不满足都视为**本批次未完成**：禁止 finalize，禁止向用户宣称完成。

确认数量和唯一性后，不要直接 present 中间报告；调用主 Skill 统一 finalizer：

```text
node "<ecommerce-search 根>/common/finalize.js" deliver --workspace "<ECOMMERCE_OUTPUT_ROOT 绝对路径>" --task-root "<ECOMMERCE_OUTPUT_ROOT 绝对路径>/douyin/<session>" --subject "<中文主体>" --platform "抖音" --metric "<文搜TopN|图搜TopN|同款TopN>" --period "<YYYYMMDD>" --mode "<文搜|图搜|找同款>" --file main_html="<实际 wall_output>" --file detail_table="<实际 output>" --file raw_data="<实际 report_json>" --dir preserve="<ECOMMERCE_OUTPUT_ROOT 绝对路径>/douyin/<session>/products"
```

该命令在各平台都保持同一组 argv；所有路径必须先展开为绝对路径并作为单个参数传入，不定义 shell 命令字符串，不安装或寻找 bash/WSL，也不手工 `mv` 或跳过 deliver。

`report` stdout 会返回实际 `output`、`report_json`、`wall_output` 路径，finalizer 的 `--file` 必须使用这些真实路径，不能猜 `report.html`。最终交付只使用 finalizer stdout 的 `present_files`：

- `<主体>_抖音_<文搜|图搜|找同款>.html`
- `<主体>_抖音_<文搜|图搜|找同款>_明细.xlsx`
- `<主体>_抖音_<文搜|图搜|找同款>_原始数据.json`

## 常用命令

| 命令 | 用途 |
|---|---|
| `preflight` | 检查设备、ADB、浏览器和运行依赖 |
| `grant-perms` | 授予并验证图搜所需相机/相册权限 |
| `pa <subcmd>` | 透传 phone-auto 子命令 |
| `run <kw> <target> <session>` | 一次性文搜批量采集，**仅适合 ≤3 个商品**；`timeout=300000`，不落盘、被杀不可续跑；**目标 >3 禁用** |
| `step <kw> <target> <session>` | **单步采集：一次只采 1 个商品，必须循环调用到 `done:true`**；可续跑、抗超时；**默认路径，目标 >3（含默认 4、10 个）必须用它**；图搜必须加 `--ctx image_search --no-search` |
| `report <session>` | 等待后台任务并生成报告；**调用前必须确认 `done:true`，事后必须核对 `product_count == target`** |
| `list` | 列出当前结果页商品卡 |
| `capture-one` | 调试或补采指定商品 |

## 按需读取参考文档

只有遇到对应问题时再读取：

- Android 公共前置检查（每个真机任务必读）：`../../references/mobile-android-preflight.md`
- 图搜细节：`references/图搜采集.md`
- 批量进度与恢复：`references/批量采集编排.md`
- 商详五态：`references/五态判定.md`
- 环境问题：`references/环境搭建.md`
- 快速报错定位：`references/快速诊断.md`
- 报告、去重和补采：`references/报告生成.md`
- 坐标与设备兼容：`references/坐标与反检测.md`
