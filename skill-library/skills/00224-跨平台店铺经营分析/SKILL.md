---
name: multi-platform-store-analysis-new
displayName: 多平台电商店铺分析
displayDescription: 当用户需要分析淘宝、天猫、抖店、京东、拼多多或 1688 店铺的整体经营状况时使用本 Skill。典型场景：查看店铺经营数据、生成经营周报/月报、分析 GMV/流量/订单/转化趋势、对比多平台或多店铺经营表现、导出经营原始数据。只要用户诉求涉及“店铺经营分析、经营报告、周报/月报、GMV、流量、订单、转化”等内容，无论单平台还是多平台、单店铺还是多店铺，即应加载本 Skill。用户在店铺相关诉求中附带任何 URL 时，URL 输入完全无效：必须直接忽略，不得打开、访问、解析或用于定位；只使用 URL 之外的用户文本和 Router 已确定的店铺信息。仅只读采集与分析并输出 HTML 报告和原始 Excel；不修改店铺任何经营设置。
description: 当用户需要分析淘宝、天猫、抖店、京东、拼多多或 1688 店铺的整体经营状况时使用本 Skill。典型场景：查看店铺经营数据、生成经营周报/月报、分析 GMV/流量/订单/转化趋势、对比多平台或多店铺经营表现、导出经营原始数据。只要用户诉求涉及“店铺经营分析、经营报告、周报/月报、GMV、流量、订单、转化”等内容，无论单平台还是多平台、单店铺还是多店铺，即应加载本 Skill。用户在店铺相关诉求中附带任何 URL 时，URL 输入完全无效：必须直接忽略，不得打开、访问、解析或用于定位；只使用 URL 之外的用户文本和 Router 已确定的店铺信息。仅只读采集与分析并输出 HTML 报告和原始 Excel；不修改店铺任何经营设置。
---

# 跨平台店铺经营分析

> **Python 执行约定**：本 Skill 的脚本一律用 `python3` 执行，即 `python3 <本 Skill 目录>/<脚本> <参数>`。`python3` 的工作目录是当前 shell 的 cwd，因此脚本路径与所有传参路径必须先展开为绝对路径。xlsx/时区依赖由 AccioWork 预装统一 Python 环境提供。

> **执行状态门禁**：`build_all_views.py`、`build_drilldown_pack.py`、`preflight_insight.py`、`merge_agent_insight.py`、`build_report_model.py`、`render_report.py`、`render_multi_store_report.py`、`collect_present_files.py` 及所有 build/final gate 命令，必须以 `python3 "<pluginRoot>/runtime/shell_execution.py" -- python3 "<目标脚本绝对路径>" ...` 执行。只有外层 envelope 同时满足 `transportStatus=ok`、`processExitCode=0`、`semanticStatus=ok` 才能进入下一阶段；非零退出、超时、命令不存在，或 child exit 0 但显式返回非 `ok` 语义状态时均停止。工具顶层 `isError=false`、stdout 非空或部分产物存在不能覆盖失败。本文后续裸命令只表示 child argv，实际执行仍必须经过上述 Runner。

> 本文中的 `references/` 和 `scripts/` 均相对本 SKILL.md 所在目录。先定位 Skill 目录，再调用其中的脚本。

> **Python 执行约定**：Python 脚本统一使用 `python3` 工具执行，即 `python3 <本 Skill 目录>/<脚本> <参数>`。`python3` 的工作目录是当前 shell 的 cwd，因此脚本路径与所有传参路径必须先展开为绝对路径。xlsx 依赖优先复用 AccioWork 环境，缺失时从插件 wheelhouse 离线安装到动态 Accio `site-packages`；时区统一用 `datetime` 内置固定 +08:00 偏移，无第三方依赖。

本 Skill 只负责选择采集范围、消费 Excel、分析和报告。所有 DSL 生成、登录、浏览器 RPA、并发、下载处理和 Excel 采集交付都委托给 `multi-platform-rpa-execution-new`。

## 边界

本 Skill 可以：

- 解析平台、店铺展示名、分析周期和 Router batch。
- 读取 `references/dsl-selection.json` 决定各平台一次采集所需的店铺经营、商品明细和广告投放原子 DSL。
- 生成一份 Execution `batch-request.json`。
- 消费 Execution 根 `raw_data/` 和逐 request `raw_data/`。
- 构建数据视图、事实包、洞察、Action 和 HTML 报告。
- 按平台、店铺和分析类型规范化交付报告与原始 Excel。

本 Skill 禁止：

- 打开、访问、解析或保存用户附带的任何店铺相关 URL（包括使用 browser、browser RPA、HTTP 或其他网络工具），或用它推断平台、店铺、商品、分类或账号；同时禁止保存 DSL、selector、浏览器 profile、账号凭证或登录态。
- 生成、修改或运行 DSL。
- 选择京东 `_1d/_7d/_30d` 物理文件或解释 DSL 的 `preset/range/fixed`。
- 为每个店铺生成一份 Execution request，或生成 `execution-request-plan.json`。
- 直接扫描浏览器下载目录、拼接 Execution 子路径或自行后处理 RPA 输出。
- 临时发明 `dsl-selection.json` 之外的 DSL ID，或把 `metric-selection.json` 传给 Execution。

采集契约的唯一事实源：

- `../multi-platform-rpa-execution-new/references/contract/batch-request.schema.json`
- `../multi-platform-rpa-execution-new/references/dsl/<platform>/*.dsl-spec.json`

## 输入归一

- 归一前先整段移除店铺相关 URL；平台、店铺名、商品/分类范围只取 Router plan 和 URL 之外的用户文本，禁止回访 URL 补全信息。
- 平台未指定时属于平台意图不明确：必须先 `ask_user(mode="form")` 只问平台（选项为 `taobao,tmall,doudian,jd,pdd,1688` 对应的平台名并附「全部平台」，允许多选），拿到答复后再发起账号发现；禁止未追问就默认全平台。
- 平台别名：淘宝/千牛、天猫/Tmall、抖店/抖音/罗盘、京东/京麦、拼多多/PDD、1688/阿里巴巴。
- 淘宝和天猫是两个独立平台键：淘宝使用 `platform=taobao`，天猫使用 `platform=tmall`。天猫有自己独立的 Router 计划、DSL 白名单、Execution request、RPA 任务、后处理目录、原始 Excel、数据视图和分析报告流程；当前五个天猫经营 DSL 与对应淘宝 DSL 的模板内容逐份一致，但禁止运行时回落或复用淘宝平台流程。
- 周期未指定时按近 7 天分析，不询问、不展示时间选项，作为开工播报的「周期」字段提示后直接继续。
- 打断边界：执行前允许的打断项只有**平台范围与店铺范围**：平台意图不明确时先追问平台（选项含「全部平台」，允许多选，拿到答复后才能发起账号发现），平台确定后店铺无法唯一确定时再追问店铺，两者都必须 `ask_user(mode="form")`。店铺打断条件只按**已登录**（`enable=true`）候选判定：用户指定的店铺在已登录候选中无法唯一匹配（命中多条/同店多账号）、同平台已登录候选 `N_on≥2` 且用户本轮未唯一指定（只给平台名、未点名具体店铺也未说“全部店铺”），并列出候选“`platformName / storeName（脱敏 account）`”让用户选择（含「全部店铺」选项）。`N_on=1` 或用户已唯一指定（含明确“全部店铺”）时不打断；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。旧口径「平台级全选时不需确认」已废止。**登录状态不是打断项**：目标 `enable` 混合、某平台无已登录店铺或无候选时自动跳过这些目标并在开工播报中列明后继续。全部目标未登录或全部平台无候选时，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。其余有默认值的参数（时间窗、采集范围）一律取默认并由开工播报告知后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」句式或任何自由文本框索要确认。
- 开工播报（硬规则）：目标锁定后、首个 Execution 采集请求之前，必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮直接继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：动作 = “进入商家后台采集店铺整体经营数据”；交付 = “店铺经营分析 HTML 报告 + 原始数据，保存到本次会话工作目录”。
- `day/week/month` 是相对时间意图；Execution 统一以 Assemble 冻结日期的昨天为结束日，换算 1/7/30 天。
- `custom` 必须具有合法的开始、结束日期。
- Router plan 携带的绝对起止日必须原样进入 Execution request，`day/week/month` 与 `custom` 一致处理。adapter 不得裁剪相对档位的 `start/end`：含广告 DSL 的平台（taobao/tmall/doudian）会因缺少绝对窗口在编译阶段直接失败，且跨天排队时 Execution 会按执行当天重新推算，把用户选定的周期悄悄后移一天。

## 工作流

### 1. 创建运行根目录

使用一份 Store Analysis 工作区作为 Execution 的同一个 `run_dir`：

```text
data/store-analysis-<timestamp>-<scope>/
├── logs/
├── raw_data/       # Execution 后处理生成的全 request 汇总
├── execution/      # Execution 为每个 request 自动生成
├── data_view/
└── report/
```

在 `logs/run_context.env` 记录 scope、Router 请求窗口、周期标签和运行开始时间。不要预创建或传递 request 级 `runDir/rawDataDir`。

**开工播报（进入下一步前必做）**：按本 Skill 规则区「开工播报」条做一次播报后同一轮直接继续；未播报就发 Execution 请求视为流程未完成。

**单一 run 根目录（强制）**：一次分析请求只允许一个 run 根目录，目录名固定 `store-analysis-<timestamp>-<scope>`，禁止追加 `-2stores`、`-noads` 等自定义后缀。无论店铺数量、店铺间 DSL 差异（如某店跳过广告采集）、还是重试与部分失败，都不得把同一次请求拆成多个 run 根目录；店铺间的 DSL 差异在该店 request 内解决。若因权限失败等原因需要重采，应在同一个 run 根目录内重建，废弃 run 不得参与后续构建与渲染。

拆 run 会使某个 run 的 `rpa-post-process-result.json` 含多条 `requests`，进而在店铺目录中被误用为店铺名来源，导致多家店共用同一拼接名、趋势图曲线互相覆盖。同理，**禁止把 run 级 `rpa-post-process-result.json` 或 `batch-request.json` 复制进 `<store_run_dir>`**：店铺名一律由该店 `data_view_manifest.accountByPlatform` 固化，`render_multi_store_report.py` 检测到店铺目录解析出多个店铺名时会直接非零退出。

### 2. 生成唯一 Execution 请求

Router 输入继续使用 `multi-platform-intention-router.plan.v3`。不要手工展开、合并或重排 `batches[].stores[]`，运行 adapter：

```bash
python3 scripts/build_collection_requests.py \
  --plan /absolute/path/to/plan.json \
  --run-dir /absolute/path/to/data/store-analysis-<timestamp>-<scope>
```

adapter 只生成：

```text
<run_dir>/logs/batch-request.json
```

该文件必须使用 `multi-platform-rpa-execution-new.batch-request.v1`：

- Router 外层 batch 顺序保持不变。
- 每个 `stores[]` 原位转换为 batch 内的 `{storeName, platform, storeId, storeAccountId, timeRange}`；两个 ID 必须原样来自同一条发现记录。
- `day/week/month` 输出 `mode + timezone`；`custom` 额外输出 `start + end`。
- `dsls` 只包含本次出现的平台，每个平台的所有店铺共享同一份 DSL 白名单。
- `run_dir` 是第 1 步的绝对根路径。
- `accountDiscovery.platformIdList` 必填且非空：由 adapter 根据本次计划的真实店铺平台映射为发现键（`doudian → dy`，其余原样）并去重；Execution 只校验并原样透传，登录态复检必须带该范围调用 `discover_store_accounts`，禁止零参数。
- 不包含 requestId、单店路径、DSL 路径、`accountName`、`platformId`、`enable` 或报告指标。
- adapter 保留原生平台键；兼容旧 Router 计划时，仅把 `platform=taobao, commercePlatform=tmall` 明确转换为 `platform=tmall`，然后移除旧字段。
- adapter 会按 Router 的 `references/batching-contract.md` 复检账号隔离：同一批次内出现同平台不同 `storeAccountId`（含淘宝店与天猫店，二者在 Router 口径同属 `taobao`）或 taobao 与 1688 并存时直接非零退出，并指名冲突店铺。冲突判定使用 `commercePlatform` 改写**之前**的原始平台键。该校验与 Router 的 `validate_plan.py` 同规则，用于兜住跳过 Router 校验或手工拼装的计划，避免冲突拖到执行期才因登录态互相顶掉而暴露。

`references/dsl-selection.json` 的 `dslIdsByPlatform` 是唯一采集白名单。淘宝选择 `store_core_daily` 等五个淘宝 DSL；天猫单独选择 `tmall_store_core_daily` 等五个天猫 DSL。两组模板当前逐份同构，但 ID、平台键、请求、运行任务和产物全程独立。其他平台仍同时采集店铺经营、商品明细和可用的广告投放数据；客服聊天、物流、竞品交给专项 Skill。

### 3. 一次委托采集

把完整的 `logs/batch-request.json` 一次性交给 `multi-platform-rpa-execution-new`，不要逐店调用。

Execution 必须完成：

1. Assemble 时间过滤、最终 DSL 和 `dsl-run-plan.json`。
2. 按 Router batch 串行、batch 内所有平台和店铺以单 DSL 为任务滚动并发，`maxConcurrency=5`。
3. 登录态核对和浏览器 RPA。
4. 写入 `dsl-run-results.json`。
5. 调用统一后处理，必要时只恢复一轮 `recoveryTaskIds`。
6. 生成 request 级兼容 Excel 和根 `raw_data/` 汇总。

Execution 返回后要求以下文件存在且可解析：

```text
<run_dir>/dsl-run-plan.json
<run_dir>/dsl-run-results.json
<run_dir>/rpa-post-process-result.json
<run_dir>/raw_data/
<run_dir>/execution/<requestId>/raw_data/
<run_dir>/execution/<requestId>/rpa/postprocess_result.json
```

以 `rpa-post-process-result.json` 为采集事实源：

- `status=complete` 才表示完整采集。
- `status=partial` 时保留可用 Excel，并把缺项写入报告数据缺口。
- `requests[].workDir/raw_data` 是对应店铺的 request 级原始交付目录。
- 顶层 `deliveryFiles` 只是后处理**本次调用的文件差分**，不是交付全集；`<run_dir>/raw_data/` 是汇总副本。交付清单一律以请求级 `execution/<requestId>/raw_data/` 的实际文件为准（见第 7 步）。
- `remediationNotices[]` 非空时，必须把每条 `message` 原文转达给用户，且不得只写成普通「采集失败」。`reason=lyone_not_enabled` 表示 `store_core_daily` / `tmall_store_core_daily` 执行失败或导出的核心日报没有任何统计日期数据行（整表 NULL），根因通常是账号未开通生意参谋 lyone 自助取数，重试无法自愈。此时店铺流量、成交、转化等核心指标会整体为 0，禁止把这些 0 当作真实经营结果写进报告结论，只能作为数据缺口说明。

Execution 已完成 request 隔离和根目录汇总，本 Skill 不再自行汇总原始数据。任一 DSL 采集失败均进入数据缺口，不由本 Skill 另起第二轮请求补采。

### 4. 构建指标视图

运行前读取 `references/report/metric/data_view_instruction.md`：

**多店输入隔离（2 个及以上店铺）**：禁止把下列命令的 `--raw-dir` 指向根 `<run_root>/raw_data/`，否则同平台多店会按平台键错误加总。必须按 `rpa-post-process-result.json.requests[]` 为每店预创建绝对路径子目录，对每个 `<store_run_dir>` 分别执行本节及后续事实、洞察和模型构建；单店才允许使用根 `<run_dir>/raw_data/`。

`<store_run_dir>` 的定义与创建：它是为每店新建的独立分析目录，推荐 `<run_root>/stores/<requests[].storeName>`，与 `requests[].workDir` **不是同一个目录**。禁止把 `workDir` 直接当作 `<store_run_dir>`，否则 `ln -s <workDir>/raw_data <workDir>/raw_data` 会因目标已存在而自引用失败。固定做法：

```bash
python3 scripts/init_store_dirs.py --run-dir <run_root>
```

该脚本按 `rpa-post-process-result.json.requests[]` 逐店建目录并软链回请求级 `raw_data`，
建完自检软链指向与非空，等价于下面这组手工命令，但不会踩自引用、复制代替软链、
店铺名被改写这三个坑；加 `--dry-run` 可先看将执行的动作。同名店铺会直接报错，
避免两店共用同一目录互相覆盖。

手工等价形式（仅在脚本不可用时使用）：

```bash
mkdir -p <absolute_store_run_dir>/{data_view,report}
ln -sfn <absolute_request_work_dir>/raw_data <absolute_store_run_dir>/raw_data
```

必须用符号链接指回请求级目录，**不要复制**：复制会让同一份数据在事实层被重复计入，导致同一商品重复出现、GMV 翻倍。`<storeName>` 原样取 `requests[].storeName`，含 `:` 等字符也不改写，保持与 manifest 一致。

随后本节及后续第 5、6 节命令中出现的 `<run_dir>`，在多店模式下一律替换为该店的 `<store_run_dir>`。

**多店清单隔离（强制）**：`--manifest` 与 `--aggregated` 必须与 `--out-dir` 同样按店隔离，写入 `<store_run_dir>/`。若两店共用根 `<run_dir>/data_view_manifest.json` 或 `<run_dir>/aggregated_metrics.json`，后执行的店铺会整体覆盖前一店，`manifest.accountByPlatform` 只保留最后一店，导致报告店铺名错误且必须重跑。每店构建完成后校验各自 `manifest.accountByPlatform` 与本店 `storeName` 一致。

每店运行 `build_all_views.py` 时必须原样传入对应 `requests[].storeName`，由 `manifest.accountByPlatform` 固化真实店铺名；禁止省略、缩写或用平台名/目录名代替，也禁止依赖 store run 中并不存在的根级 `batch-request.json` 或 `rpa-post-process-result.json`。

**`--scope` 与 `--commerce-platform` 适用范围（先查表，不要逐个脚本试 `--help`）**：

| 脚本 | `--scope` | `--commerce-platform` |
|---|---|---|
| `build_all_views.py` | 必传 | **新调用不传**；仅兼容旧调用并校验与 `scope` 一致 |
| `build_drilldown_pack.py` | 必传 | **新调用不传**；仅兼容旧调用并校验与 `scope` 一致 |
| `build_report_model.py` | **不接受** | **新调用不传**；从 manifest 的 `scope` 派生，旧参数仅交叉校验 |
| `render_report.py` | 必传 | **新调用不传**；仅兼容旧调用并校验与 `scope` 一致 |
| `render_multi_store_report.py` | **不接受**（从各 run 的 manifest `scope` 派生） | **始终省略**；旧参数仅兼容接收并忽略 |

- `build_all_views.py`、`build_drilldown_pack.py`、`build_report_model.py`、`render_report.py` 的平台元数据统一由 `scope` 或 manifest 推导；旧调用里的 `--commerce-platform` 处于兼容弃用期，只做交叉校验，冲突时直接失败。
- `jd` / `pdd` / `doudian` / `1688` 一律省略 `--commerce-platform`，产物中也不写空字符串占位。
- `render_multi_store_report.py` 的旧参数不参与渲染；每个 run 独立从自己的 manifest 推导平台身份，新调用始终省略该参数。
- 对不接受 `--scope` 的两个脚本传该参数会直接非零退出（`unrecognized arguments`）。

单店（根 `<run_dir>`）：

```bash
python3 scripts/report/metric/build_all_views.py \
  --raw-dir <run_dir>/raw_data \
  --dimension <day|week|month|custom> \
  --scope <scope> \
  --store-name "<requests[].storeName>" \
  --out-dir <run_dir>/data_view \
  --manifest <run_dir>/data_view_manifest.json \
  --aggregated <run_dir>/aggregated_metrics.json
```

多店（每店各跑一次，全部路径落在本店 `<store_run_dir>` 下）：

```bash
python3 scripts/report/metric/build_all_views.py \
  --raw-dir <store_run_dir>/raw_data \
  --dimension <day|week|month|custom> \
  --scope <scope> \
  --store-name "<requests[].storeName>" \
  --out-dir <store_run_dir>/data_view \
  --manifest <store_run_dir>/data_view_manifest.json \
  --aggregated <store_run_dir>/aggregated_metrics.json
```

- 经营概况：GMV、订单数、客单价、支付件数。
- 流量漏斗：曝光、UV、加购、支付买家、转化率。
- 营业额退款分项：订单、退款金额和退款金额占比仅供第一节店铺营业额使用，不独立渲染交易履约章节。
- 客户服务：好评、差评、响应、体验分。
- 运营推广：花费、ROI、CPC、点击。
- 同行水位：本店、同行平均/优秀、排名和差距。

无明确字段锚点时保持 `missing_artifact`、`missing_value` 或 `empty`，不得补 0 或估算。

### 5. 生成事实与洞察

读取 `references/store_analysis_framework.md`，再运行：

```bash
python3 scripts/report/view/build_report_model.py \
  --aggregated <run_dir>/aggregated_metrics.json \
  --manifest <run_dir>/data_view_manifest.json \
  --output <run_dir>/report_model.json
```

多店模式下把上述三处 `<run_dir>` 替换为本店 `<store_run_dir>`，每店各生成一份 `report_model.json`；禁止多店共用根级 `aggregated_metrics.json` 或 `data_view_manifest.json`。

然后**必须**运行下钻脚本，从规范视图与商品明细中提取汇总层看不到的结构性事实：

```bash
python3 scripts/report/fact/build_drilldown_pack.py \
  --run-dir <run_dir> \
  --scope <scope> \
  --dimension <day|week|month|custom>
```

`--dimension` 为必填，且必须与 `plan.timeRange.mode` 一致。传错会把「近30天」按 7 天窗口截断，使日度分布与集中度结论整体失真。

产出 `<run_dir>/drilldown-pack.json`，含日度、结构、商品和广告六类下钻事实。**该包只提供中性度量，不含任何诊断结论**：

> **读取纪律（该文件可达 MB 级，禁止整体 read）**：撰稿取下钻数字时一律用 json-pointer 精确切片，只取当前诊断需要的那一段，例如
> `python3 scripts/report/insight/read_json_slice.py --input "<run_dir>/drilldown-pack.json" --pointer "/platforms/jd/productPerformance/topProducts"`。
> 重点商品看 `topProducts`（Top10）与各下钻类目（`productRisks`/`funnelBreakpoint`/`budgetMismatch`/`multiPeriodTrend`）；`productPerformance.items` 是下钻兜底明细，**已在生成阶段剔除零流量零成交商品并移除逐条 previousPeriod**，商品总数以 `totalProducts` 为准、同期对比查 `multiPeriodTrend`。`drilldown:` 引用的可解析性由 `build_report_model.py` 自行校验，无需 Agent 通读整包核对。

**A/B/C 数据边界**：HTML 趋势图使用视图 `时序日值`（A），卡片/表格使用视图 `周期汇总`（B），`drilldown-pack.json` 只是诊断依据（C）。C 层日度事实必须优先读取与 A/B 同源的 `data_view` 时序行；只有视图无日值时才可回退日报类原始源。C 类数字只写入诊断卡 `evidencePoints`，不新增 HTML 表格或替换 A/B 层数值。`dailyMetadata.viewConsistency` 中日值合计与周期汇总偏差超过 5% 时禁止交付。

| 字段 | 内容 | 用途 |
|---|---|---|
| `distribution` | 零成交天数、TOP3 单日集中度、成交日期 | 判断「持续经营」还是「零星大单」 |
| `crossSignals` | 投放×成交、访客×成交、新客×老客 | 定位投放是否买错人、流量是否错位 |
| `structure` | 按载体拆成交、零成交载体 | 识别某平台核心玩法未被使用 |
| `benchmark` | 同行同层对比 | 判断是流量获取问题还是承接问题 |
| `productPerformance` | 商品 ID、动销/零成交数、成交与退款集中度、TOP 商品 | 把店铺营收与转化问题落到具体商品 |
| `promotionAttribution` | 商品级花费、推广交易额、推广退款、实际 ROI、净 ROI | 判断广告是否带来可归因成交 |
| `budgetMismatch` | 商品预算份额、产出份额及两者差值 | 识别预算给多/给少的商品；份额偏低不直接等于应加投 |
| `productRisks` | 高访客零成交、有消耗无成交、高退款或高跳出商品 | 为业务章节诊断卡提供逐品证据 |
| `funnelBreakpoint` | 商品访客/加购/下单买家与金额/支付买家与金额 | 区分访客→下单与下单→支付断点 |
| `multiPeriodTrend` | 同商品当期与可用历史周期 | 区分长期低效与短期异常；少于3期不得下长期结论 |
| `crossPlatformSameProduct` | 跨平台同名商品候选 | 只作待核对线索；未核对 SKU/定价时禁止断言同款 |

**先出经营摘要，再决定读哪里（强制）**：`report_model.json` 与 `drilldown-pack.json` 都是**给渲染器吃的**形态，直接翻会陷入「打印宽表 → 输出过大被清理 → 再重读一遍」的循环。撰写诊断前先跑一次摘要脚本，把本轮核心指标、日度序列、渠道效率、商品集中度、TOP/风险榜、漏斗断点、同行对标、数据缺口压成 ~90 行纯文本：

```bash
# 打到 stdout 直接读；多店时逐店各跑一次
python3 scripts/report/insight/emit_analysis_brief.py --run-dir <store_run_dir>

# 榜单条数可调，也可落盘后再定向检索
python3 scripts/report/insight/emit_analysis_brief.py --run-dir <store_run_dir> \
    --top 12 --output <store_run_dir>/analysis-brief.txt
```

摘要中所有数字原样取自 `report_model` / `drilldown-pack`，与报告正文同源，**不重算、不判断、不给选题建议**——发现仍必须由 Agent 自行形成（见 `findingPolicy`）。摘要每段都标注了对应的 `drilldown:` 指针前缀，需要完整数组或未列字段时，再按指针定向切片，不要整体 read。

`emit_analysis_brief.py → list_evidence_refs.py → read_json_slice.py` 三步都先通过版本化 Artifact Reader 校验 `schemaVersion`。版本缺失或未知时必须立即停止，不得猜 `/metrics`、`/products` 等路径，也不得在字段不存在后轮流尝试相似字段；错误返回中的 `availableKeys` 是唯一合法的恢复提示，只能从其中选择下一条指针。

> 摘要里出现 `结构化归因不可用（status=...）` 时，表示该模块在本轮没有数据，**不等于该维度没有数据**：渠道/场景级 ROI 需从 `raw_data` 的广告营销数据表按场景列自行聚合，单品级广告字段则可直接引用 `productRisks/<i>/{adSpend,adGmv,adClicks,actualRoi}`。

再完整读取 `references/report/insight/diagnosis-authoring.md`。Agent 基于 `fact-pack.json`（汇总值）+ `drilldown-pack.json`（下钻事实）产出诊断。

> **不必先通读 schema.json**：字段与枚举由 `preflight_insight.py` 在片段层面机器校验，报错直接定位到具体 case 文件与字段（见下文「片段预检」）。仅当预检报错信息不足以判断字段契约时，才去读 `references/report/insight/agent-insight.schema.json`。

> **fact-pack.json 读取纪律（单店可达 10 万+ token，禁止逐 Case 重读）**：本轮撰稿**只读一次 fact-pack.json 并全程复用**，不得每写一个 Case 就重新 read 整包。按 Case 取证据时用 json-pointer 切片，只取当前 Case 相关段，例如
> `python3 scripts/report/insight/read_json_slice.py --input "<run_dir>/fact-pack.json" --pointer "/abnormalCaseFacts"`；
> 需要事实正文时按 `factRefs`/`factId` 去 `facts` 段定位，不必反复整体加载。`fact:<factId>` 引用的可解析性由 `build_report_model.py` 自校验，无需 Agent 通读整包核对。

**先取指针清单，再动笔（强制）**：撰写片段前运行一次下面的命令，拿到本轮**实际可解析**的
`fact:` / `drilldown:` 指针清单，不要靠打印事实包 key 去猜字段名：

```bash
# 列出全部可用指针（fact 带指标与当期值，drilldown 数组默认预览前 3 项）
python3 scripts/report/insight/list_evidence_refs.py --run-dir <store_run_dir>

# 按需过滤，例如只看某类商品下钻或某个指标
python3 scripts/report/insight/list_evidence_refs.py --run-dir <store_run_dir> \
    --kind drilldown --contains productRisks

# 指针常达数百条，可落盘后用 grep 定向检索，避免刷进上下文
python3 scripts/report/insight/list_evidence_refs.py --run-dir <store_run_dir> \
    --output <store_run_dir>/evidence-refs.txt
```

`drilldown:` 指针清单每行形如 `<指针> = <当前值> « <所属对象>`，直接给出该指针的实际取值与所属商品/渠道（如 `productRisks/0` 属于哪个商品）。**不要再自行打印数组去反查下标映射**——写引用时照抄清单里的指针即可，值也可直接用于 `evidencePoints` 复算。

该脚本复用 `report/view/validators.py::_source_ref_exists`，与 merge、编译阶段同一套解析
逻辑，清单里出现的指针必定可解析。写完片段后的引用自检不必再单独跑 `--check`，
已并入下文的 `preflight_insight.py`。

**产出方式（强制）**：**不要直接 write/edit 最终文件 `agent-insight.src.json`**——它是派生产物。只写独立小片段到 `<run_dir>/agent-insight-parts/`，再由脚本合成最终文件。片段目录结构：

```
agent-insight-parts/
  meta.json                 # {"scope": ["taobao"], "periodLabel": "近7天"}
  floors.json               # floorInsights 数组（4 节 revenue/promotion/conversion/service）
  cases/case-01.json        # 每个 case 一个文件，单对象，约 3.5KB 一次写得完
  cases/case-02.json
  actions.json              # actions 数组（偏大可改 actions/act-*.json 逐个）
  insights.json / drilldowns.json / dataGaps.json / findingDispositions.json   # 可选
```

**abnormalCases 必须按 case 逐个成文件**，不要写成一个大的 `abnormalCases.json`（数万字符仍会截断；单 case 才稳落在可靠写入区间）。数组型片段接受裸数组或 `{"字段名": [...]}` 包裹形式。

> **顶层 `evidenceRefs` 不用手写**：case 片段省略该字段即可，合成时会自动从
> `evidenceTrace[].sourceRefs` + `reasoningAudit.whyChain[].sourceRefs` 按出现顺序去重派生（上限 6 条）。
> 只有需要人工指定「本 Case 主证据」且与自动结果不同时才显式写；写了就以片段为准，不会被覆盖。
> `evidenceTrace[]` 与 `whyChain[]` 的绑定仍必须逐条手写，它们才是证据本体。

**片段预检（强制，先于合成）**：全部片段写完后，先跑一次预检。它把语法、schema 结构、
引用可解析性、文案洁净与雷同四类校验合并为一条命令、一份命中清单，避免「四步顺序跑、
每步回改都要从头来」：

```bash
python3 <skill>/scripts/report/insight/preflight_insight.py \
    --parts <run_dir>/agent-insight-parts --scope <taobao|tmall>

# 多店可一次预检（--parts 可重复传入）
python3 <skill>/scripts/report/insight/preflight_insight.py \
    --parts <storeA_run_dir>/agent-insight-parts \
    --parts <storeB_run_dir>/agent-insight-parts
```

预检只读、不产出任何文件，全部复用 merge / build 阶段的同一套执行器与规则，不存在规则漂移。
Runner envelope 的 `transportStatus=ok`、`processExitCode=0`、`semanticStatus=ok` 三项同时成立后再执行合成：

```bash
python3 <skill>/scripts/report/insight/merge_agent_insight.py \
    --parts <run_dir>/agent-insight-parts \
    --output <run_dir>/agent-insight.src.json \
    --scope <taobao|tmall> --max-cases 8
```

脚本负责语法校验（精确定位非法片段）、补齐 `schemaVersion/domain/scope`、合成 10 个顶层字段、原子写出并立即复验。这样最终文件永远合法，避免长 JSON 被逐段追加成半成品导致截断。

每个商家可见结论必须由 `fact:<factId>` 或 `drilldown:/<json-pointer>` 引用支撑，并在 `evidenceTrace[]` 与对应 `evidencePoints[]` 一一绑定。引用不可解析、数据不存在或当前证据不能唯一证明原因时，收窄结论并写 `dataGaps[]`，不得用行业常识补齐。完成后再次运行 `build_report_model.py --agent-insight <run_dir>/agent-insight.src.json` 编译最终 `report-view-model.json`；平台元数据由 manifest 的 `scope` 自动派生。管线生成的 `<run_dir>/agent-insight.json` 是只读产物，不得手工编辑。显式传入的 Agent 洞察不合格时脚本会直接失败，不再静默回退规则模板。

**大文件读写硬禁令（违反即停止并说明）**：`agent-insight.src.json` 与 `agent-insight.json` 是合成/管线产物，体积大，**全流程禁止 read / write / edit**——不论撰稿、自查、排错还是渲染失败后回查。单次读取即可能耗尽步骤预算并挤占上下文。各场景替代路径：

- 改诊断 → 改 `agent-insight-parts/` 下对应片段 → 重跑 `preflight_insight.py` → 通过后 `merge_agent_insight.py`；片段编辑前只重读对应小片段。
- 定位编译/引用错误 → 读脚本报错输出（已含片段指向与 json-pointer），不要打开产物文件。
- 结构 / 引用 / 文案 / 雷同自查 → 一律跑 `preflight_insight.py`，只看命中清单回改片段（`lint_insight_parts.py` 仍可单独跑，但已被预检覆盖）。
- 确认字段契约 → 优先看预检报错；仍不明确时才读 `references/report/insight/agent-insight.schema.json`（小文件，可读）。

写入新鲜度冲突时只执行“重读片段→编辑→重跑合并”，不得用重跑管线应对；同一冲突连续 2 次或同一命令/失败连续 3 轮即停止该路径并说明。确实无法从报错定位问题时，停止并向用户说明，不得改为读产物文件。

**诊断发现必须由 Agent 自主产出（强制）**

脚本不再下发任何 findings 清单。诊断的选题、根因与优先级全部由 Agent 自行分析得出。禁止把 `drilldown-pack.json` 的任一字段当作"待办清单"逐条作答——那会让诊断长期停留在少数几个易得指标上。

产出诊断前，必须完成以下自主分析动作：

1. **全字段扫描**：打开 `<work_dir>/raw_data/` 下每一个原始表，逐列确认可用字段。核心日报常含 60+ 字段（分渠道推广花费、新老客分层、会员、履约、评价计数等），远多于视图汇总层暴露的指标。只用汇总层字段做诊断视为不合格。
   - **输出指引（避免单次输出过长被截断）**：分表逐个扫描，不要一次性 dump 所有表的表头与样本行；每张表**优先只输出列名清单**（表头一行），确认字段可用性后，再按需只读取要深挖的少数几列的样本行。一次性全量 dump 会导致输出超长被截断、需再读一次结果文件，一次扫描消耗两轮上下文。
2. **周期内分段对比**：把分析周期对半切分（如 30 天切前后各 15 天），对成交、流量、效率、投放、退款分别算环比。**只看周期总量会完全错过趋势反转**——总量增长与效率下滑可以同时发生。
3. **效率型指标优先**：UV 价值、支付转化率、加购率、费比、客单价属于效率型指标。当规模指标（访客、GMV）与效率型指标背离时，优先诊断效率反转，而不是报告规模增长。
4. **结构占比核算**：推广按渠道拆分占比与环比、流量按来源拆分占比、成交按新老客与会员拆分占比、货盘按动销与零成交拆分占比。
5. **交叉验证因果**：任何根因判断都要找一个可证伪的对照。例如判断"页面承接差"前，先看跳失率与停留时长是否同步恶化；若未恶化则该解释不成立，须换方向。

`findingDispositions[]` 记录 Agent 自己的诊断发现与取舍：`accepted.finding` 与其绑定的 `abnormalCases[].title` 必须逐字符一致，并给出非空、可解析的 `sourceRefs`；`rejected` 用于记录你主动排除的候选解释并附反证。每个 Case 都必须能追溯到一条 accepted 发现。

读取 `productRisks[].counterEvidence`；没有可用反向证据时不得声称已排除竞争性解释。若 `dailyMetadata.sourceConflicts` 非空，回源后在 `dataCorrections[]` 记录每个冲突字段的错误值、正确值、原因与来源，并重算所有下游派生量。跨平台或跨口径比较前读取 `references/platform-caliber-diff.json`，命中的声明必须进入卡片的口径依据。

**口径自检（发现即修正并写入 `dataCorrections[]`）**：交付前核对商品总数与动销率是否来自全量在售商品、推广花费是否已含全部渠道（含全站推广）、好评率等比率是否为全期汇总口径而非日快照均值。以下四条为实战踩坑项，交付前逐项核对：
1. **好评率**：源表「正面评价数/评价数」是**当日快照/部分评价口径**（不含中评），直接使用会严重失真，**禁止**作为好评率渲染。淘宝/天猫已改为 **`好评率 = 1 - sum(差评数)/sum(评价数)`**（`reducer="derived_complement_rate"`）：中评计入非差评，与平台 DSR 好评率口径一致；周期值必须按评价量加权，禁止对日好评率简单平均（低评价量日会被等权放大）。其他平台维持各自口径（抖店按评价等级明细、1688 按五星/全部星级、京东/拼多多取后台直出字段）。若差评数或评价数缺失导致无法计算，改用体验分（描述相符/服务/物流）展示，并将缺失字段写入数据缺口。
2. **曝光量**：源表「浏览量」是 PV 不是曝光量，禁止拿浏览量冒充曝光量；视图无真实曝光字段时该指标标注缺失，不填充 PV。
3. **同行对比窗口**：同行数据若为整月口径（如 7-01~7-31），而店铺侧为近30天（7-13~8-11），窗口不一致时对比结论不成立；要么强制对齐窗口，要么在报告中明确标注"整月口径，仅作参考"，不得写成"仅为同行 N 倍"式结论。
4. **退款金额占比**：指标口径为 `sum(退款金额)/sum(订单金额)`，属**现金流视角**——回答"本期退出去的钱相当于本期成交的百分之多少"，**不是退货率**，禁止表述为"本期订单有 X% 被退掉"。
   - **命名**：商家可见文案一律写「退款金额占比」，不得简写为「退款率」，避免与订单口径退货率混淆。
   - **跨期错位（双向，不可断言方向）**：分子是本期**退款发生额**（含更早订单的退款流入），分母是本期**成交额**；同时本期成交、下期才退的订单未被计入（流出）。两者不是同一批订单，偏差方向取决于业务扩张或收缩，**禁止简单标注"偏高估"**，应标注"现金流口径，与订单归属期不一致"。
   - **聚合方式**：必须金额加权，禁止对日退款率做无权重平均（低成交日分母塌陷会系统性抬高日比率）。
   - **真实退货率**需 `退款订单数/订单数`，当前六平台仅拼多多后台直出退款单数，其余平台需补采订单级退款明细（含下单时间）后才能计算，并预留 15–30 天退款观察期。

**数据洞察写入约定（必须遵守）**：营业额、推广和转化三个业务章节的洞察统一渲染为 **问题 → 归因 → 结论** 三段链路，而不是现状复述列表。三段写在手稿 `agent-insight.src.json` 的 `floorInsights[]` 上：

| 字段 | 写什么 | 硬性要求 |
|---|---|---|
| `keyProblem` | 本节**唯一最痛**的那个问题 | 必填。只挑一个，不并列罗列；必须带下钻数值（具体日期、日度值、结构占比、人群对比），不得是汇总表已可直接看到的数字 |
| `rootCause` | 推到底的原因 | 内部至少追问两层「为什么」，直到落到供需、人货匹配、决策链路或成本结构等经营事实；对外只写最终归因，证据确实不足时才可留空 |
| `conclusion` | 一句可判定的结论 | 必填。必须是**判断句**（"是什么问题 / 该往哪走"），不是现象描述，也不是"建议关注" |

- `floorInsights[].sectionId` 使用 `revenue`（店铺营业额）/ `promotion`（推广投放）/ `conversion`（店铺转化分析）/ `service`（客户服务）；兼容旧值 `overview` / `traffic`。
- 三段式缺失时渲染器回退旧字段 `dataInsight`（单段文本），但新分析一律写三段式。
- `abnormalCases[]` 只用于营业额、推广和转化章节内的诊断卡，`sectionId` 只能为 `revenue` / `promotion` / `conversion`；每条提供 `platformName`、`title`、`verdict`、`analysisObject`、`evidencePoints`、`evidenceTrace`、`reasoningAudit`、`severity` 和 `priority`。商品营收/退款归 `revenue`，商品广告归 `promotion`，商品访客/转化归 `conversion`，禁止集中塞到独立诊断章节。
- `agent-insight.src.json` 的所有商家可见字段（含 `floorInsights`、Case 标题/`verdict`/`evidencePoints`、Action `steps`、下钻 `reason/query`）提及已知商品时，必须写成 `商品名称(ID: 数字)`；禁止只写名称或裸写商品 ID。
- 客户服务章节不生成、不渲染“诊断发现”。保留 `service` 的 `floorInsights[]` 以记录指标事实，但令 `abnormalCaseRefs=[]`。**`actions[]` 与 `drilldowns[]` 中一条客服条目都不要写**：校验器要求 `actions[].case` 集合与 `abnormalCases[].title` 集合严格相等，客服不产 Case，任何客服 Action 都会导致编译失败。客服改进建议写入 `service` 的 `floorInsights[].conclusion`；报告中的客户服务专项分析 Action/query 由渲染层固定生成，无需也不能在手稿中提供。
- 营业额、推广或转化某节无异常时三段仍要写：`keyProblem` 写"本节未发现制约经营的问题"，`conclusion` 给出维持判断，不要留空。
- 整店四节均无异常、全轮 `abnormalCases[]` 为空时：在 `agent-insight-parts/meta.json` 增加 `"noCaseReason": "<写明为何无异常>"`，`merge_agent_insight.py` 才会放行并把该字段写入产物留痕；未声明时脚本按"漏写 case"拦截。不要为了通过合成而编造无依据的诊断卡。

**第一性原理归因要求（`rootCause` 判定标准）**：

以下分层与追问只用于内部推演，不是输出模板。所有商家可见字段（`floorInsights`、`abnormalCases`、`insights`、`actions` 的文案）均禁止出现「第一层/第二层/第 N 层」「不可再拆/不可再分」「第一性原理/第一性事实」「行为层/结构层/指标层」「追问两层/再问一次为什么」「根因层级/归因层级」等推演术语，也禁止「……为什么？因为……」式自问自答。`rootCause` 只有一步时直接写一段；需要递进时仅用 `1. 2. 3.`，最多三段。`keyProblem` 和 `conclusion` 始终保持单段陈述。

- ❌ 只回答"哪个指标不好" → 不合格。例：「转化率低导致成交少」——这是同义反复。
- ❌ 只回答一层"为什么" → 不合格。例：「零成交是因为没流量」——没回答为什么没流量。
- ✅ 固定完成五次 Why，且每层标记 `verified/inferred/unknown` 并引用数据；追到未知时停止断言，把缺失字段与获取路径写清。
- 归因必须能解释**已观察到的全部反常现象**：若归因为"流量不足"，就必须解释为什么低流量日反而出大单。解释不了就说明归因错了，重推。
- 五次 Why 是内部 `reasoningAudit.whyChain`，不得出现在商家文案中；**五层不等于五个确定答案**。任何 `unknown` 都禁止用经验补齐，`rootCauseStatus` 必须降为 `bounded_hypothesis` 或 `unresolved`。

**下钻建议写入约定**：Agent 在 `agent-insight.src.json` 顶层写 `drilldowns[]`，供对应业务章节诊断卡的「建议下钻」区域渲染：

```json
"drilldowns": [
  {
    "platformName": "淘宝",
    "skill": "单品下钻分析",
    "reason": "现有数据已确认商品名（ID 123456）141 个访客零成交，但缺少 SKU 与支付链路字段，无法区分规格还是支付问题",
    "case": "商品支付断点",
    "query": "帮我深度分析淘宝单品，商品 ID：123456，拆 SKU、库存、优惠与支付断点"
  }
]
```

- `skill` 必须命中白名单，否则渲染层会丢弃：`商品明细分析`、`单品下钻分析`、`广告投放分析`、`评价分析`、`接待分析`、`自定义数据采集`、`竞品分析`。
- `reason` 必须引用本次诊断的具体证据，不能写"进一步分析"这类空话。
- `reason` 必须说明为什么现有数据还答不了；`query` 必须包含具体平台、店铺/对象、时间窗、商品 ID/计划名、所需字段和判定目标。
- `case` 必填并逐字符等于对应 `abnormalCases[].title`；所有 `query` 必须两两不同。
- 每店最多 3 条；无下钻必要时留空数组，渲染层会按异常信号走规则兜底路由。
- **可直接执行的动作不要写进 `drilldowns`**，写进 `actions[].steps`（带 `platform`）——诊断卡会把它渲染成绿色「建议 action」，并与可复制 query 分开展示。

**写卡片前先寻找本次问题自己的证据路径**：`fact-pack.json` 只有周期汇总值，不能直接据此写诊断。先扫描 `<run_dir>/raw_data/` 与 `data_view/` 中实际存在的日度、商品、渠道/来源、人群、退款/售后、投放归因和同行明细，再根据当前 Case 选择能解释它的维度。不得要求每个 Case 都依次计算日度分布、交叉相关、结构占比和同行水位；与问题无关的维度不要写。

日度分布、投放×成交、访客×成交、渠道/人群结构、退款售后和同行水位都只是候选路径。每个 Case 至少使用一项汇总表看不到、且与其归因直接相关的下钻事实。先发现数据中的异常结构，再决定追问顺序和证据组织，禁止从预设结论反向挑数。

商品明细有效时，营业额、推广和转化 Case 仍必须落到真实商品名与商品 ID，但使用哪些商品事实由问题决定：营收问题可看成交、动销或退款，推广问题可看花费、归因成交或 ROI，转化问题可看当前平台实际提供的曝光、点击、访客、加购、下单和支付。没有对应字段时停止在已证实的位置并记录缺口，不为补齐固定链路而推断。

**商品级归因的三条硬性判据**：

- **退款结论服从商品明细口径**：只有源表提供本期商品/SKU 退款字段时才能点名退款商品；缺少原因或归属期时只描述集中度，不推断历史遗留或具体原因。
- **投放效果以平台归因字段为先**：优先使用广告报表的花费、推广成交和 ROI；只有花费没有归因成交时，再用日度花费 × 日度成交做方向性推断并注明口径。
- **淘宝/天猫推广口径锁定广告营销数据**：花费=`花费`、推广交易额=`总成交金额`、曝光=`展现量`、点击=`点击量`，ROI=`sum(总成交金额)/sum(花费)`，CPC=`sum(花费)/sum(点击量)`；禁止用总预售、直接或间接成交金额单独替代。仅缺少广告营销数据文件时，推广花费才回退核心日报四类花费。**淘宝/天猫无广告归因退款字段，推广商品退款与净 ROI 一律保持无法核算**：全店在售商品「成功退款金额」含自然流量成交与历史订单退款，与广告归因成交不同源，禁止替代，也禁止据此写「保守下限」净 ROI；退款问题在营业额章节按全店口径单独分析。
- **拼多多推广唯一取 `pdd_promotion`**：花费优先=`成交花费`、缺失回退=`总花费`，推广交易额=`交易额`，净交易额=`净交易额`，实际 ROI=`实际投产比`，净 ROI 优先=`净实际投产比`、缺失时=`净交易额/成交花费`，曝光/点击分别取同名字段；净口径存在时不得要求“推广退款”。字段必须精确匹配，禁止把“交易额/实际投产比”与其“净”字段混算。推广页默认近7日，必须读取 `* YYYY/MM/DD 至 YYYY/MM/DD 的数据；...` 注释并按 `day/week/month→今日/近7日/近30日` 校验；错配时标记数据缺口，不做跨窗口占比。推广归因 GMV/全店 GMV 的占比只作方向性参考并声明口径差异。
- **商品承接必须逐品判断**：高曝光/高访客但零成交的商品必须点名商品 ID；拿到跳出率、点击率或加购数时，再区分素材、详情页承接和支付环节，不得用店铺汇总值替代。

**诊断卡证据契约（违反即失败）**：

- 每条 Case 的 `evidencePoints[]` 必须 4–6 条，至少 3 条带可复算数字；逐条在 `evidenceTrace[]` 引用真实来源，引用必须可解析。
- **证据维度由 Agent 根据本轮问题与可用数据自行组织，禁止按固定角色模板填充**。日度、商品、渠道、人群、投放、退款售后、同行或异常日期都可使用，但只写与当前归因有关且有数据支撑的维度。
- 有数据时量化损失并检验竞争性解释；确有口径差异或不确定性时再说明边界。禁止为了满足模板而补“无数据的排除法”或“并不存在的口径说明”，缺失事实应进入 `dataGaps[]`。
- 商品明细有效时，营业额、推广和转化 Case 的 `analysisObject.type` 必须为 `product`，并同时写真实商品名与商品 ID；商品明细无效时禁止猜 ID，只能形成数据缺口与补采动作。
- 因果文案只能写到数据已证明的位置：高跳失只能证明点击后早期承接断点，未读取页面内容时不得断言缺规格、交期或某段文案；高退款只能证明退款侵蚀，未采退款原因时不得断言质量/物流/描述问题。
- 禁止使用“结果损失：”“商品集中度：”“排除法：”“口径说明：”“目标空间：”等固定前缀，也禁止不同 Case 复用同一证据顺序和句式。

**质量红线（违反必须重写）**：

- ❌ 禁止把汇总值换措辞当结论：「GMV 占 90.6%，依赖单一平台」「转化率 0.78%，承接偏弱」
- ❌ 禁止用字段缺失代替分析：写「ROI 缺失，效果不可评估」前必须先做日度花费 × 成交交叉推断
- ❌ 禁止用样本小回避归因：成交少时改看结构（哪个载体为 0、哪几天出的单）
- ❌ 禁止在 `keyProblem` 里并列三四个问题——挑最痛的一个，其余进 `abnormalCases`
- ❌ 禁止 `conclusion` 写成"需要关注 / 建议优化"这类无判定的句子
- ✅ evidence 必须含汇总表里看不到的下钻数据：具体日期、日度数值、结构占比、人群对比
- ✅ `rootCause` 必须回答「为什么」并追到不可再拆的经营事实，不是把 evidence 换个说法重说一遍
- ❌ 商品明细存在有效记录时，禁止只写店铺级结论：`keyProblem` 或 `evidence` 必须点名具体商品 ID/SKU
- ❌ 禁止在缺少退款归属期或原因字段时，把退款直接写成历史遗留或断言具体原因
- ❌ 广告报表已有推广成交或 ROI 时，禁止只用日度相关性判断投放效果

**诊断文案的归属权（不可让渡）**：

- **营业额、推广和转化章节的所有诊断发现与绑定建议 action 必须由 Agent 亲自撰写**。脚本只负责计算事实（金额、占比、集中度、日度交叉）与结构校验，**不生成这三个章节的商家文案**；客户服务章节例外，只展示固定专项分析 Action/query。
- **一条建议只服务一条诊断**：`actions[]` 与 `drilldowns[]` 必须写 `case` 字段，值等于对应 `abnormalCases[].title`。渲染层据此绑定；未绑定的条目会退化成全店通用建议，在多张卡上重复出现。
- **禁止跨章节复用同一句建议**：同一段话（如「把预算向搜索倾斜」「开通推广归因字段导出」）只能出现在最相关的那一章一次。不同的问题必须给不同的解法；写完通读全文，发现重复即改写或删除。
- **建议必须绑定本章维度的具体对象**：营业额章说到商品，投放章说到计划/渠道/关键词，转化章说到具体链接的承接环节。**不得把投放动作写进营业额章，也不得用店铺级泛化动作充数**。
- 每条 `actions[]` 必须写 `actionType`、2–5 个 `steps`、`basisRefs`、`expectedEffect`、`validationMetric`、`observationWindow`、量化 `acceptance` 和 `rollbackRule`。根因未验证时禁止 `execute`，只允许 `stop_loss`、`experiment` 或 `data_collection`。
- 能反推治理门槛时必须计算“降到多少才达标”和“极限情况下能否达标”；目标不可达时直说，不用“持续优化”掩盖。

**六道自检（写完逐条过，任一不过就重写）**：

1. **复述检查**：`keyProblem` 和 `rootCause` 的内容，是否在本节表格里已经能直接看到？能看到 → 重新下钻。
2. **追问检查**：对 `rootCause` 再问一次「那为什么会这样」，如果还能顺畅答出更底层的原因，说明没追到底 → 继续往下推。
3. **反例检查**：`rootCause` 能否解释本期所有反常数据点（尤其是与结论方向相反的那些）？解释不了 → 归因错误，重推。
4. **数据适配检查**：每条依据是否来自本次问题真正相关的明细维度？为了凑集中度、断点、排除法或口径说明而加入的无关证据 → 删除并按实际数据重写。
5. **去模板检查**：不同 Case 的证据维度、顺序和句式是否高度一致？一致但数据结构不同 → 说明在套模板；重新从各自异常数据出发组织。只有存在反向/对照事实时才写排除，只有确有口径差异时才写口径说明。
6. **去重检查**：运行 `python3 scripts/report/insight/preflight_insight.py --parts <run_dir>/agent-insight-parts`，看其相似度命中清单；对命中的两条分别回改各自所属片段，按该条诊断的实际数据重写。**不要为「排在一起通读」而读取 `agent-insight.src.json`——脚本已在片段层完成比对。**

上述 1-6 项中可机器判定的部分（语法、结构、引用、洁净、雷同）已全部并入 `preflight_insight.py`：**在合成之前**跑一次即可拿到完整命中清单，按清单回改片段后重跑预检，通过后再执行 `merge_agent_insight.py` 与 `build_report_model.py --agent-insight`。**自查对象是 `agent-insight-parts/` 下的片段（`floors.json`、`cases/*.json` 等）——片段即商家可见文案的唯一来源，合成产物 `agent-insight.src.json` 全程不读不改。** 发现命中即改片段后重跑预检，不得直接进入下一步。渲染后不再重读 HTML 复查文案。

自查范围限定在**商家可见字段**：`keyProblem`、`rootCause`、`conclusion`、`verdict`、`evidencePoints`、`steps`、`reason`、`claim`、`missingData`、`blockedConclusion` 等（lint 脚本已按此范围扫描）。`reasoningAudit.whyChain[].question` 等内部推演字段按契约允许写问句，`evidenceTrace[].sourceRefs`、`basisRefs`、`evidenceRefs` 等内部引用字段一律跳过，不要据此改写文案。

自查两类问题：

1. **推演术语泄露**：「为什么X？<陈述>」这类问句式自问自答，以及`第一层`/`第二层`/`不可再拆`等分层推演词，出现在商家可见字段即改写。纯因果词正则查不出问句式自问自答，`preflight_insight.py`（复用 `lint_insight_parts.py` 的同一套规则）已用启发式在片段层扫出该类命中；按其清单回改片段即可，无需自行通读大文件。
2. **实现细节泄露**：`.py` / `.json` 文件名、`raw_data/`、`data_view/`、`logs/` 路径、`--xxx` 命令行参数、`missing_artifact`、`missing_value`、`effective_reducer`、`weighted_avg`、`page_status`、`crossPlatformInsights` 等内部字段名、`sum(` 等公式写法、`( ok )` 状态标记。商家可见字段一律改用商家语言表达口径，例如把 `sum(退款金额)/sum(支付金额)` 写成「本期退款金额合计 ÷ 本期成交金额合计」。

第 2 类由 `render_report.py` 的 `assert_user_facing_content` 在渲染阶段兜底拦截，命中即渲染失败。这是硬门禁但位置靠后，必须在写片段时就用 lint 自查，不要等渲染报错再回头改。**若仍在渲染阶段命中，回到 `agent-insight-parts/` 对应片段修改后重跑合并与渲染，不要打开 `agent-insight.json` 或 `agent-insight.src.json` 查看渲染用文案。**

### 6. 渲染

最终 HTML 的框架、样式、章节和组件由 `references/report/template/report-template.html` 与渲染脚本统一产出。营业额、推广和转化的诊断卡保持“问题分析 → 4–6 条依据 → 建议 action → 必要时唯一 query”，客户服务不显示诊断卡。固定结构为四个业务章节加附录（下钻思维：营业额 → 投放 → 转化 → 服务）：

1. **一、店铺营业额**（`sec-revenue`）：全域四卡（总 GMV/投放支出/退款/净入账）→ 逐店表（GMV | 投放 | 退款 | 净入账 | 环比，按净入账排序，状态灯标异常）→ 各店铺 GMV 日趋势（一图多彩线，每店一色，单日归零直接标注）→ 圈出问题店铺结论（亏损/弱于同行/趋势走低三信号）。
2. **二、推广投放分析**（`sec-promotion`）：推广花费/推广交易额/实际 ROI/净 ROI 四卡 → 按店铺推广交易额、花费、推广退款、净交易额、实际 ROI、净 ROI 汇总 → 商品级「预算份额 − 产出份额」错配图与可折叠明细 → 一句话结论 → 商品级投放诊断卡。推广交易额必须来自广告归因字段；净 ROI 缺推广退款时保持无法核算。
3. **三、店铺转化分析**（`sec-conversion`）：各店转化漏斗矩阵（曝光→访客→加购→支付，异常格标色）→ 支付转化率日趋势图 → 商品/店铺转化诊断卡；注意区分"转化低"与"转化不低但支付后退款回吐"。

   **漏斗表格规范**：表头为「店铺 | 曝光量 | 访客数 | 加购数 | 支付买家数 | 成交转化率」，每列附商家口径小字解释（如「访客数 / 进店的人数（去重）」）。
   **严禁新增「漏斗判断」列**：分级判定（`_funnel_stage_diagnosis`）只用于内部圈定异常店铺、决定是否出警告卡，绝不作为表格列对外展示——判定标签是规则套话，会与 Agent 撰写的诊断结论重复且互相矛盾。转化问题一律由 Agent 在诊断卡中用具体商品与数据说清。

   内部圈店阈值（3% 加购率 / 30% 加购支付率 / 60% 同行水位）仅作宽松下限，不对外披露、不作为行业基准。
4. **四、客户服务分析**（`sec-service`）：按店铺展示好评率、差评数、平均回复时长和体验分 → 可折叠数据口径 → 直接展示“建议 action”与绿色客户服务专项分析面板及可复制 query，**不显示“诊断发现”**。字段缺失时如实展示数据缺口。1688 评价表是累计截面：五星计为好评，好评率按五星总计/全部评价总计计算；一星和二星计为差评。1688 体验分必须同时展示新灯塔总分、商品/物流/售后/咨询子项、等级和同行差距。
5. **附录 · 数据口径**（`sec-appendix`）：统计窗口、净入账口径、同行口径、转化口径、数据缺口与采集数据清单。

渲染要求：禁止生成 `sec-diagnosis` 和独立商品表现章节；诊断卡嵌入营业额、推广、转化等对应业务章节，结构必须包含明确标题、结论型 verdict、可折叠 evidence、绿色 action 和可复制 query。同行 GMV 水位以"同行的 N 倍"呈现且不跨店比较；净入账缺失分项（投放/退款/扣费）必须在行内标注"未采集"，不虚构合计。

先按实际范围确定 `<report_filename>`：单平台单店使用 `<平台>店铺经营分析报告.html`，同一分析范围包含多个店铺时使用 `多店铺经营分析报告.html`，多平台且未形成多店铺范围时使用 `多平台店铺经营分析报告.html`。

**多店铺合并报告**：分析范围包含多个店铺（含同平台多店铺）时，各店仍按店独立采集、独立构建 data_view 与洞察（数据视图以平台为主键，同平台多店混跑会导致数据加总混淆，禁止合并采集）；报告层使用 `scripts/report/render/render_multi_store_report.py` 把多个单店 run 目录合并渲染为一份 `多店铺经营分析报告.html`：

```bash
python3 <skill>/scripts/report/render/render_multi_store_report.py \
  --template <skill>/references/report/template/report-template.html \
  --run <run_dir_店铺1> --run <run_dir_店铺2> [...] \
  --out <run_root>/report/多店铺经营分析报告.html
```

> `render_multi_store_report.py` 的 `--commerce-platform` 仅为兼容旧调用而保留，传入时会输出 deprecated 提示且不参与渲染。渠道身份由每个 run 自己的 `data_view_manifest.json.scope` 推导；新调用始终省略该参数。

**天猫店在 `build_all_views.py` / `build_drilldown_pack.py` / `render_report.py` 必传原生 `--scope tmall`，不再重复传 `--commerce-platform`。`render_multi_store_report.py` 与 `build_report_model.py` 不接受 `--scope`**（传入会直接非零退出），二者从 `data_view_manifest.json.scope` 自动识别天猫。天猫视图、下钻、同行分析与渲染均走独立天猫入口，只读取 `天猫-*.xlsx`，不得调用淘宝入口、读取或改名淘宝产物。

合并报告保持同一结构：营业额逐店行+合计+GMV 趋势+内嵌诊断；推广逐店行+合计+商品错配+内嵌诊断；转化逐店漏斗+转化率趋势+内嵌诊断；客服逐店指标+专项 query；附录逐店列窗口与缺口。每个 run 目录需已完成单店链路（data_view/、manifest、drilldown-pack.json、report-view-model.json、agent-insight.json、rpa-post-process-result.json）。多店必须使用 `render_multi_store_report.py`，不得逐店或合并调用 `render_report.py`；单店场景才使用 `render_report.py`。

```bash
python3 scripts/report/render/render_report.py \
  --template references/report/template/report-template.html \
  --views-dir <run_dir>/data_view \
  --scope <scope> \
  --manifest <run_dir>/data_view_manifest.json \
  --raw-dir <run_dir>/raw_data \
  --report-view-model <run_dir>/report-view-model.json \
  --out <run_dir>/report/<report_filename>
```

渲染 Runner envelope 的 `transportStatus=ok`、`processExitCode=0`、`semanticStatus=ok` 三项同时成立，且 `<run_dir>/report/*.html` 存在、大小大于 0，本步才完成并进入第 7 步交付。本步不做任何报告校验：不运行 `validate_report_pipeline.py`，不重读 HTML 核对数值、Case、店铺名、scope 平台标记或卡片计数，也不因此改写报告或重复渲染。任一状态失败时才排查参数与前置产物后重跑；部分 HTML 不得覆盖失败状态。

`--scope` 必须原样取自 Router plan / `logs/batch-request.json` 的请求平台集合。`data_view_manifest.json.scope`、`report-view-model.json.scope`、渲染 `--scope` 三者必须完全一致，禁止追加淘宝或任何其它平台。

`data_view/`、manifest、logs、DSL 和浏览器原始 JSON 都是中间产物，不参与交付。

### 7. 按店铺规范化交付

交付前只做报告与原始文件存在性检查。以请求级 `execution/<requestId>/raw_data/` 的实际文件为准，按 `platform/storeName` 汇总其中全部 `.xlsx` 和 `.zip`；`requests[].deliveryFiles` 只作候选提示。不读取 `data_view/`，也不分析报告内容。

```bash
python3 scripts/collect_present_files.py \
  --report <run_dir>/report/<report_filename> \
  --post-process-result <run_dir>/rpa-post-process-result.json \
  --out <run_dir>/logs/present_files.json
```

报告缺失或为空、未说明的原始文件缺失才阻塞交付。后处理已记录的数据缺口（如阿里妈妈报表下载失败）只告警、不阻塞；报告已在撰写阶段标注时，在交付说明中如实列出，不补跑校验或返工报告。

**交付全集以文件系统为准，脚本已内置全量对账**：`requests[].deliveryFiles` 是后处理**本次调用的文件差分**，每重跑一次就缩水一次、且不报错（详见 `../multi-platform-rpa-execution-new/references/delivery-contract.md`）。为从根上消除「重跑即静默缩水」，`collect_present_files.py`（D4 修复，2026-08-24）**不再信任该差分数组**，而是按每个 request 的 `workDir` 直接枚举请求级 `execution/<requestId>/raw_data/` 的全部 `.xlsx`/`.zip` 作为权威全量交付集；差分声明仅用于对账，声明里出现全量集不存在的过期路径时如实告警。

- 脚本输出的 `present_files.json` 即为全量交付集，正常情况下**无需再手工 `find` 对账**。
- 若需人工复核，仍可用以下命令枚举，结果应与 `present_files.json` 的原始文件条目一致：

```bash
find "<run_dir>/execution" -path "*/raw_data/*" \( -name "*.xlsx" -o -name "*.xls" -o -name "*.zip" \) | sort
```

- 交付集合 = 1 份报告 HTML + 请求级 `raw_data/` 全部原始文件（剔除空表）。
- 脚本只枚举请求级 `execution/<requestId>/raw_data/` 的**无后缀原件**；根 `<run_dir>/raw_data/` 是汇总副本，其中 `-2/-3` 后缀是后处理重跑碰撞产物，不会被纳入交付清单。
- 兼容回退：结果 JSON 缺少 `workDir`（旧版产物）时，脚本退回原 `deliveryFiles` 差分声明作为交付源，此时仍需按上面的 `find` 命令人工对账。

**空表文件必须剔除**：`collect_present_files.py` 现已在生成 `present_files.json` 时自动剔除整簿空表（`all sheets empty`），并同时打出 `excluded empty workbook from delivery` 的 warning（不静默丢弃）；「部分空表」(empty sheets) 仍保留并告警。整簿空表对应的原始文件保留在 `raw_data/` 供商家核查，但不进入交付清单，并须在报告与完成小结中作为**该 DSL 的数据缺口**明确列出。高发场景（六平台通用）：投放类报表在零投放/无归因成交时导出空表，常见于 `doudian_qc_product_goods`、`pdd_promotion`、`jd_jzt_home`、`ads_marketing`、`tmall_ads_marketing`。空表 ≠ 采集失败，措辞用“该报表本周期无数据”，不得写成“采集失败”，也不得当作有效数据进入分析。

只有脚本不存在时才手工按店铺汇总“报告 + 全部现有原始 Excel/ZIP”。把完整数组一次性原样交给 `present_files`，只能调用一次；只给报告、只给 Excel、只给路径或分步展示都属于交付不完整。

交付前自检：

- [ ] `present_files.json` 已由脚本按请求级 `raw_data/` 全量枚举生成（不依赖差分声明）；如为旧版无 `workDir` 结果，则已手工 `find` 对账
- [ ] 空表文件已剔除清单、已列为数据缺口
- [ ] 交付路径均为请求级原件，无 `-2/-3` 副本
- [ ] `present_files` 仅调用一次，含报告 + 全部有效原始文件

### 8. 交付后推荐深入分析引导

`present_files` 交付完成后，仅当本轮诊断仍存在需要额外采数的深层维度时，才在最终回复结尾给出「推荐深入分析」引导；本轮证据已足够支撑动作时直接省略。规则：

- **只推荐本轮仍缺失的深层维度**：商品明细和广告投放已在本轮默认采集，不再把“商品明细分析”作为固定推荐；只有当前平台明细缺少 SKU、内容素材、退款原因或更细投放归因时，才推荐对应专项分析。
- **按实际异常生成**：只能根据本次报告的真实诊断与数据证据给出最多 3 项；如有投放花费/ROI 异常才给投放方向，有退款/差评异常才给评价方向。不得为凑数而添加无证据的分析。
- **来源对齐**：推荐必须与报告各业务章节中诊断卡的分析建议一致，不得推荐与本次诊断无关的分析。
- **推荐映射**（按业务章节内诊断卡的问题类型选择，可多选；括号内为插件中对应 skill，仅供 Agent 路由，不对商家展示）：
  - 商品承接问题已由本轮商品明细定位；只有字段不足以区分商品漏斗断点时，才推荐「商品明细分析」（multi-platform-product-analysis）补齐更深维度。
  - 已锁定具体单品且报告中有明确商品 ID 需要深挖（某单品转化断层、推广 ROI、SKU/库存/评价拆解）→ 推荐「单品下钻分析」（multi-platform-single-product-analysis）；没有明确商品 ID 时先做商品明细分析。
  - 退款/差评异常（退款率突增、疑似质量批次）→ 推荐「评价分析」（multi-platform-review-reply）拆解差评焦点与回复策略。
  - 客服接待疑点（询单流失、话术问题，限淘宝/1688）→ 推荐「接待分析」（multi-platform-chat-analysis）分析聊天记录找未成交原因。
  - 竞品/市场疑点（份额被抢、价格被压）→ 推荐「竞品分析」（ecommerce-search）做同款对比。
  - 投放问题（推广花费高、ROI 低、亏损投放）→ 推荐「广告投放分析」（multi-platform-ads-analysis）拆解计划/关键词维度的消耗与产出。
- **话术要求**：面向商家的业务语言，说明“推荐做什么 + 为什么（引用本次诊断结论）”；不暴露 skill id 等内部术语，用能力名称表述。
- **数量控制**：深入分析最多推荐 3 项；本轮证据已足够支撑动作时可以不推荐额外分析。

示例（对应“淘宝 XX 店已定位商品 123456 高访客零成交 + 好评率偏低”的诊断）：

> **推荐深入分析**
> 1. 深入分析淘宝 XX 店商品 123456——本次商品明细已定位该商品高访客零成交，需要继续拆 SKU、素材和支付断点。
> 2. 对淘宝 XX 店做下评价分析——本次好评率偏低，需要拆解高频负面关键词与回复策略。

## 数据规则

- 店铺名只用于展示并原样使用 Router `storeName`；账号身份由 `storeAccountId` 确定，并用同一条发现记录的 `storeId` 交叉核对。
- 报告数字必须追溯到原始文件、sheet/模块和字段。
- HTML 正文只使用面向商家的业务语言；脚本名、命令参数、JSON 路径、内部目录、公式表达式和字段匹配状态只保留在日志、数据视图与证据索引中。
- 整个模块无有效数据时保留既有章节结构，以简短的“本期数据暂缺”说明替代数据洞察，不得用空数据生成结论。
- 某平台/店铺关键数据文件为空表或缺失时，对应章节必须标为数据缺口，写入 `agent-insight.src.json` 的 `dataGaps[]`，并在 `whyChain` 中以 `status: "unknown"` + `neededData` 表达；禁止用 0 值或空表推导经营结论。尤其禁止把空投放报表解读为“投放效率低”或“ROI 为 0”——无数据与零效果是两件事。
- 率类周期指标使用分子/分母加权计算，禁止平均每日率。
- 拼多多私有字体不可信值必须保持缺失。
- 拼多多经营概况 Excel 含「全部指标」「交易概况」「流量数据总览」三个 sheet，其中「全部指标」是后两者的合并汇总表；读取时只保留一个规范化明细 sheet（优先「指标明细」，其次「全部指标」），并在该 sheet 内按「指标名」去重。禁止跨 sheet 累加，否则成交买家数、商品访客数、商品浏览量等会被重复计入 2~3 倍。
- 拼多多退款口径取交易数据卡片的「退款金额」「退款单数」；后台不直出退款率，按 sum(退款金额)/sum(订单金额) 金额口径派生，不得因无原生字段就标记为数据缺口。
- 指标由分子/分母成功派生出数值时，字段匹配状态必须从 `missing_*` 升级为 `derived`，禁止出现「已有值又同时列入数据缺口」的矛盾展示。
- 客单价六平台统一口径为 成交金额/支付买家数（淘宝天猫=支付买家数、抖店=成交人数、京东=成交客户数、拼多多=成交买家数、1688=支付买家数），与拼多多等平台后台客单价卡片一致；买家数缺失时才回退 成交金额/订单数（笔单价口径）并在备注标注。禁止把笔单价当客单价交付。
- 净入账分项中若投放缺失但退款已采集，展示「已扣退款、未扣投放」的金额并显式标注，不得整格显示“无法核算”而浪费已采集数据；投放与退款均缺失时才显示“无法核算”。
- 抖店交易漏斗只取“成交概览 + 全部载体 + 不限时段”；缺失时保持数据缺口，不回退商品列表、商品流量或商品卡数据。
- 抖店标准视图与淘宝使用相同指标集合，不增加搜索词数、搜索词转化率等抖店专属报告字段；投放费比不得冒充 ROI，两日内发货率不得冒充平均发货时长。
- 最终 HTML 禁止渲染独立的「交易履约分析」「商品表现分析」和 `sec-diagnosis`；退款数据并入第一节，商品与广告明细进入对应业务章节的归因、行动与可复制 query。
- 净入账的投放或退款分项缺失时显示“无法核算”，不得把缺失值按 0 补齐。
- 营业额、推广和转化章节的诊断卡只取 `agent-insight.json` 的 abnormalCases/insights；客户服务不渲染诊断卡，不得虚构结论。
- 报告可见平台严格等于本次 scope。

## 按需读取

「按需」指的是**按阶段**，不是按文件逐个读。同一组内的资源没有依赖关系，
**必须在进入该阶段时一次性并行读取**，逐份串行读取会把一轮可完成的准备拆成多轮往返。

**A 组 · 采集准备**（生成 `batch-request.json` 前一次性读取）

- `references/dsl-selection.json`：生成唯一 Execution 请求时读取。
- `references/data-source-mapping.md`：核对命名 Excel 与分析模块映射。

**B 组 · 视图与指标**（构建 `data_view` 前一次性读取）

- `references/report/metric/data_view_instruction.md`：构建数据视图前读取。
- `references/metric-selection.json`：构建报告指标和缺口时读取，不传给 Execution。
- `references/platform-caliber-diff.json`：跨平台/跨粒度比较前读取；命中的口径差异必须进入诊断卡或数据口径说明。

**C 组 · 诊断撰写**（撰写诊断片段前一次性读取，可与 `fact-pack.json` / `drilldown-pack.json` 同批发出；产出方式：写 `agent-insight-parts/` 片段 → `preflight_insight.py` 预检 → `merge_agent_insight.py` 合成最终文件，勿直接 write/edit `agent-insight.src.json`）

- `scripts/report/insight/emit_analysis_brief.py`：**本组第一步先跑**。输出 ~90 行经营摘要（核心指标 / 日度序列 / 渠道效率 / 商品集中度 / TOP 与风险榜 / 漏斗断点 / 同行对标 / 数据缺口），替代自行打印原始宽表；数字与报告同源，只压缩不判断。
- `scripts/report/insight/list_evidence_refs.py`：动笔前取指针清单；`drilldown:` 行自带当前值与所属对象，无需再反查数组下标。
- `references/store_analysis_framework.md`：生成诊断和建议前读取；重点看「反复述铁律」「按问题选择下钻维度」「口径防错」「归因不到底时的诚实写法」「缺字段时的推断规则」。
- `references/report/insight/diagnosis-authoring.md`：生成 `agent-insight.src.json` 前完整读取；这是五次 Why、事实引用、商品级定位、Action 与数据缺口的交付契约。
- `references/report/insight/agent-insight.schema.json`：**不列入本组常规读取**。字段与枚举由 `preflight_insight.py` 机器校验并精确定位，仅当预检报错不足以判断契约时才按需读取。

**D 组 · 渲染**

- `references/report/template/report-template.html`：渲染报告时使用。

## 完成条件

- `batch-request.json` 通过 Assemble，所有选择的 DSL 均生成无占位符的 atomic DSL。
- Execution 后处理报告可解析，complete/partial 状态如实传递。
- 根 `raw_data/` 用于本次分析，每店交付只使用对应 request 的 `raw_data/`。
- `drilldown-pack.json` 已用与 `plan.timeRange.mode` 一致的 `--dimension` 生成；诊断发现由 Agent 自主产出，每个 Case 都能在 `findingDispositions[]` 追溯到 accepted 发现。
- 已完成全字段扫描与周期内前后分段对比，诊断覆盖效率、流量结构、货盘、投放四个域（该域有数据时）；商品总数、推广花费、比率类指标的口径已自检。
- 营业额、推广和转化的 `floorInsights[]` 都写了 `keyProblem` + `rootCause` + `conclusion`；service floor 只记录指标事实且 `abnormalCaseRefs=[]`。每个 Case 的五次 Why 均完成数据状态审计，未知层未被写成确定原因。
- 商品明细有效时，每个营业额/推广/转化 Case 均已点名商品名+商品 ID；证据维度由本次数据驱动，无固定模板。只有确有口径差异或不确定性时才写边界说明。
- 每个 Case 有 4–6 条 `evidencePoints`，`evidenceTrace` 全量覆盖且所有引用可解析；每条 Action 逐字符绑定 Case，并有对象、依据、预期效果、量化验收和回滚规则。
- 每条数据洞察的 evidence 都含汇总表看不到的下钻数据（具体日期、日度数值、结构占比或人群对比），无一条是汇总值的换词复述。
- `agent-insight.src.json` 的商家文案洁净自查无命中，未泄露归因推演术语或自问自答过程。
- 有问题店铺时，营业额、推广或转化章节诊断卡同时给出可直接执行 action 与可复制下钻 query；`drilldowns[].skill` 全部命中白名单。客户服务只保留固定专项分析 query。
- 渲染退出码为 0，报告 HTML 非空；请求级 `raw_data/` 中未标记为数据缺口的 `.xlsx/.zip` 均存在。
- 交付清单已与请求级 `raw_data/` 的 `find` 枚举对账，空表已剔除并列为数据缺口，无 `-2/-3` 副本混入。
- `present_files.json` 同时包含报告和全部有效原始 Excel/ZIP，并已通过一次 `present_files` 完整展示。
- 仍有深层数据缺口时，最终回复结尾已按实际诊断给出「推荐深入分析」引导；无需额外分析时未强行推荐（第 8 步）。
