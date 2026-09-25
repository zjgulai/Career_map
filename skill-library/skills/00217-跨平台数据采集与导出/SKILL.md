---
name: multi-platform-custom-analysis
displayName: 多平台自定义数据采集
description: 当用户想把淘宝、天猫、抖店、京东、拼多多或 1688 **自家已绑定店铺**的经营数据「抓下来」「爬一下」「拉一份原始表」「导出成 Excel」「只要 xlsx 不要报告」时使用本 Skill，也覆盖固定报告管道之外的自定义主题取数（评价、库存、广告、售后、搜索词、违规、行业对比与跨主题组合）。默认只做只读采集与原始 Excel 规范交付，不生成分析报告；交付后再询问用户是否需要基于本次数据出报告。不适用于非自家经营数据诉求，不修改店铺、商品、订单或后台配置。
---

# 跨平台数据采集与导出

凡向用户输出“设置 - 账号管理”引导，必须先读取 `../discover-store-accounts/references/merchant-account-management.md`，并按其中的 Agent 回复契约完整展示四步图文教程；同一条回复最多展示一次，不得只给链接或输出插件开发机路径。

> **路径基准**：所有 `references/`、`assets/`、`scripts/` 路径均以本 `SKILL.md` 所在技能目录为基准（插件安装后为 `<插件根>/skills/multi-platform-custom-analysis/`），禁止以插件根目录或其他目录拼接。
>
> **Python 执行统一口径**：本 Skill 的 Python 脚本均使用 `python3` 工具执行，脚本路径与传参路径先展开为绝对路径。

## Purpose

本 Skill 负责把用户的取数诉求转成运行级 DSL 选择，委托新版 RPA 执行层采集，抽取原始 Excel，并按店铺交付**原始数据（Excel-only）**。它既是用户可直达的独立取数入口（自带账号发现、登录门禁、时间解析与 plan 合成），也继续承接 `multi-platform-intention-router` 下发的 `自定义分析` 计划。分析与 HTML 报告不在默认链路内：交付完成后由用户确认是否需要，确认后才在同一次运行内复用已抽取数据出报告，不重复采集。它不实现固定报告管道（日/周/月报、固定章节诊断）。

## Non-Negotiable Rules

- 路径基准：见文首「路径基准」声明。
- 只读边界：只采集、抽取和交付（分析仅在用户确认后追加）；禁止修改店铺、商品、订单、广告、客服或后台配置。
- 执行层边界：禁止直接启动 RPA、保存 selector、复用浏览器会话、扫描下载目录、搬运下载文件或解析非执行层产物。
- 事实源边界：采集能力以 `../multi-platform-rpa-execution-new/references/dsl/<platform>/*.dsl-spec.json` 为准，`references/dsl-capability-map.md` 只是主题索引。
- 前置编排边界：账号发现、店铺范围消歧、登录门禁、时间解析和 plan 合成一律按 `references/request-routing.md` 执行，判定口径引用 Router 契约，禁止 fork 出第二套逻辑；Router 已注入 plan 时直接复用，禁止重复发现。
- 数据边界：分析（可选阶段）只能基于 `extracted/` JSON 与每店 `postprocess_result.json`；不得估算、补值、跨平台硬合并或用其他店铺/平台补缺口。
- 交付边界：最终交付只能由 `scripts/spec_delivery.py` 落标准店铺目录；默认取数交付必须显式传 `--excel-only`；禁止二次打包为 `.zip`、`.tar` 等归档；禁止手工往已生成的交付目录塞文件。
- 打断边界：采集前允许的打断项只有**平台范围与店铺范围**（均用 `ask_user(mode="form")`）；登录状态、时间窗、采集范围一律不打断。是否生成分析报告的追问只允许出现在交付与 `present_files` 之后一次。
- 开工播报（硬规则）：目标锁定后、首个采集调用前必须按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 播报**恰好一次**并在同一轮继续执行；禁止用 `ask_user` 承载，其余禁令见契约 §5。字段口径：动作 = “按本轮命中的采集任务到商家后台导出原始表”；交付 = “规范化 Excel，保存到本次会话工作目录（默认不生成分析报告，交付后再问你是否需要）”。
- Python 边界：按 `references/runtime-and-dependencies.md` 自检。
- 重试边界：不要用未变更输入重复执行失败步骤；只有执行层明确标记的瞬时错误才能按其 retry limit 重试。DSL 失败按数据缺口如实上报并继续交付 partial，禁止向用户索要 retry/upload/ignore 选择。

## Progress Checklist

- [ ] Runtime Gate
- [ ] Run Directory Gate
- [ ] Store Scope Gate
- [ ] DSL Selection Gate
- [ ] Execution Request Gate
- [ ] Collection Gate
- [ ] Extraction Gate
- [ ] Delivery Gate（Excel-only）
- [ ] Presentation Gate
- [ ] Collection Summary & Analysis Offer Gate
- [ ] Final Self-Check

可选分析阶段（仅在用户确认需要报告，或原始诉求已含显式分析信号时执行）：

- [ ] Analysis Gate（可选）
- [ ] Rendering Gate（可选）
- [ ] Analysis Delivery Gate（可选）

## Gate Pass Conditions

| Gate | Pass condition |
|---|---|
| Runtime | Python 自检退出码为 `0`。 |
| Run Directory | `data/custom-analysis-<timestamp>/` 与 `logs/` 可写。 |
| Store Scope | 直接命中时账号发现带非空 `platformIdList` 调用一次、店铺范围已消歧、未登录目标已自动跳过并记录，`logs/plan.json` 由 `build_plan.py` 生成；Router 命中时沿用注入 plan；两种入口都已完成一次开工播报（未播报就进入采集视为本门禁不通过）。 |
| DSL Selection | `dsl-selection.json` 合法、最小充分，且覆盖 plan 中可支持的平台。 |
| Execution Request | adapter 生成 `batch-request.json` 与 `execution-request-plan.json`，且执行输入为新版 schema。 |
| Collection | 每个 request 完成或产生可记录的数据缺口。 |
| Extraction | 至少一个 workbook 成功抽取，或失败被明确写入缺口。 |
| Delivery | 每店 `spec_delivery.py --excel-only` 成功或失败被报告，禁止手工替代落盘。 |
| Presentation | `present_files` 使用完整 `present_files.json` 数组，展示数量一致。 |
| Collection Summary & Analysis Offer | 采集详情已按唯一事实源如实播报，且已按下文规则完成一次分析追问或按例外直接进入分析。 |
| Final Self-Check | 缺口、来源、交付路径和验证证据完整。 |
| Analysis（可选） | report model 通过 schema 检查，数字结论有 `file` + `sheet` + `field` 溯源。 |
| Rendering（可选） | HTML 渲染成功，符合 `references/report-style-contract.md`，无自定义字体声明或外链资源。 |
| Analysis Delivery（可选） | 每店 `spec_delivery.py --report` 成功，`present_files` 重新聚合后二次展示。 |

## Decision Points

| Situation | Approach |
|---|---|
| 用户只想拿到数据（「抓一下」「爬一下」「导出」「拉一份原始表」「只要 Excel/xlsx」「不用报告」） | 使用本 Skill，主链路只交付原始 Excel，交付后再追问是否需要分析。 |
| 用户诉求是自家已绑定店铺的评价、库存、广告、售后、搜索词、违规、行业对比或跨主题组合取数 | 使用本 Skill，按 DSL Selection Gate 最小充分选择 DSL。 |
| 用户诉求是固定报告管道之外的自定义主题数据 | 使用本 Skill，按用户主题选 DSL，确无采集能力时剔除并记入缺口。 |
| 用户提供自家店铺/商品 URL 并提出取数或自定义数据诉求 | 使用本 Skill；URL 只用于定位平台、店铺或商品。 |
| 用户诉求不是自家经营数据（竞品、全网行业公开数据等），或要求修改后台状态 | 停止并说明超出本 Skill 边界。 |
| 店铺范围或登录态存疑 | 按 `references/request-routing.md` §2-§4 处理：平台意图不明确先 `ask_user(mode="form")` 只问平台（含「全部平台」，可多选）；平台确定后店铺无法唯一确定（按**已登录**候选判定，`N_on≥2` 且用户未唯一指定，或指定店铺命中多条）再 `ask_user(mode="form")` 选店铺（含「全部店铺」）。`N_on=1` 或用户已唯一指定时不打断；`<active_store>`、历史店铺、路由注入信息一律不算用户已指定。**登录状态不是打断项**：目标 `enable` 混合、某平台无已登录店铺或无候选时自动跳过这些目标、只处理已登录店铺并写入缺口，不追问不停止；全部目标未登录或全部平台无候选时，必须停止业务流程并**立即读取 `../discover-store-accounts/references/merchant-account-management.md`**，按其中的指引完整回复用户（包括账号管理地址和图片引导，不可丢失）。严禁只输出纯文本引导。其余有默认值的参数（周期、采集范围）一律取默认并由开工播报告知后继续，禁止用普通文字、Markdown 表格、编号列表、「确认使用【…】」「请回复'确认 + 店铺名'」「请确认目标店铺后开始」句式或任何自由文本框索要确认。 |

## Workflow

### 1. Runtime Gate

先按 `references/runtime-and-dependencies.md` 执行 Python 环境自检。退出码 `0` 才能继续；退出码 `1` 或 `2` 按该 reference 的 fail-fast 规则停止并报告。

### 2. Run Directory Gate

创建运行目录，格式固定为：

```text
data/custom-analysis-<timestamp>/
├── logs/            # run_context.env / stores.json / plan.json / dsl-selection.json / batch-request.json /
│                   # execution-request-plan.json / raw-data-collection.json / extraction-manifest.json /
│                   # spec_delivery_results.jsonl / present_files.json
├── execution/<request_id>/
├── raw_data/
└── extracted/
```

在 `logs/run_context.env` 写入 `RUN_START_ISO=<带时区的 ISO-8601>`，时间点必须早于首次浏览器任务；禁止用 `START_TIME` 等替代键。Execution New 以此校验下载文件属于本轮运行。

`report_model.json` 与 `report/` 只在可选分析阶段创建，默认取数链路不预建。

### 3. Store Scope Gate

读取 `references/request-routing.md`，按入口二态处理：

- **Router 已注入 `multi-platform-intention-router.plan.v3`**：直接复用，跳过本 Gate 的发现与合成步骤。Router 以**文本形式**交接 plan（交接模板的“执行范围”字段）时，先把它**原样**落盘为 `logs/plan.json` 再跑 adapter（adapter 只接文件路径）；禁止在落盘时增删改任何字段、重排 `batches`或补写默认值。
- **用户直达本 Skill**：按 request-routing §2-§6 完成平台推导（非空 `platformIdList` 单次发现）→ 店铺范围消歧 → 登录门禁（未登录自动跳过并记缺口）→ 时间解析（缺省近 7 天），写出 `logs/stores.json` 后调用 Router 的 `build_plan.py` 生成 `logs/plan.json`。**天猫店的 `platform` 写 `tmall`**（或「天猫」），`build_plan.py` 会归一为 `platform=taobao` 并保留 `commercePlatform=tmall`，天猫身份由该字段一路传到交付；禁止把天猫店手写成 `taobao`（会丢失天猫身份）。

锁定后按 `../multi-platform-intention-router/references/common/kickoff-briefing-contract.md` 做一次**开工播报**后直接继续，不等待确认（字段口径见 Non-Negotiable Rules 的「开工播报」条）。

### 4. DSL Selection Gate

读取 `references/dsl-capability-map.md` 和 `references/dsl-selection-contract.md`，按用户诉求写出 `data/<run_id>/logs/dsl-selection.json`。遵守最小充分原则：每个平台通常 1-3 个 DSL；plan 中的平台必须被覆盖，确无能力时从诉求中剔除并记入最终数据缺口。

### 5. Execution Request Gate

保持 `multi-platform-intention-router.plan.v3`（Router 注入或 `build_plan.py` 生成）不变，运行 adapter：

```bash
python3 scripts/build_collection_requests.py \
  --plan /abs/plan.json \
  --dsl-selection /abs/data/<run_id>/logs/dsl-selection.json \
  --run-dir /abs/data/custom-analysis-<timestamp>
```

输出必须是 `logs/batch-request.json` 与 `logs/execution-request-plan.json`。详细输入、禁止字段和京东族展开规则见 `references/execution-contract.md`。

### 6. Collection Gate

把 `logs/batch-request.json` 一次性交给 `multi-platform-rpa-execution-new`。本 Skill 只接收每店执行目录下的：

- `raw_data/*.xlsx`
- `rpa/postprocess_result.json`

全部 request 结束后归集原始 Excel：

```bash
python3 scripts/collect_execution_raw_data.py \
  --request-plan data/<run_id>/logs/execution-request-plan.json \
  --out-dir data/<run_id>/raw_data \
  --manifest data/<run_id>/logs/raw-data-collection.json
```

归集目录只是**分析用工作区**，不是交付物（交付读每店 `rawDataDir` 原件）。若报 `raw_data filename collision with different bytes`（退出码 2，同一 run 内有同名店铺产出同名但内容不同的文件，例：同名品牌的淘宝店与天猫店）：

1. **不要**用同输入重试，也不要手工改名/删文件后重跑（归集已部分落盘且 manifest 未生成）。
2. **照常完成取数交付**：Delivery Gate 用每店 `rawDataDir`，不依赖聚合 `raw_data/`，所以每家店的 Excel 仍能正确交付到各自的平台目录。
3. 把本次抽取（以及依赖抽取的可选分析）记为数据缺口并在 summary 如实说明冲突文件名与涉及店铺；需要分析时建议按单店分开重跑。

### 7. Extraction Gate

```bash
python3 scripts/extract_raw_data.py \
  --raw-dir data/<run_id>/raw_data \
  --out-dir data/<run_id>/extracted \
  --manifest data/<run_id>/logs/extraction-manifest.json
```

抽取只做格式转换，不做口径加工；空单元格保留 `null`，隐藏 sheet 也必须抽取。抽取只为后续可选分析服务，不影响交付的原始 Excel（交付始终是执行层原件的字节级副本）。

### 8. Delivery Gate（Excel-only）

读取 `references/delivery-contract.md` 与 `references/script-inventory.md`。遍历 `logs/execution-request-plan.json`，每个 `(平台, 店铺)` 调用一次 `scripts/spec_delivery.py`，**必须带 `--excel-only`、不传 `--report`**，并把结果追加到 `data/<run_id>/logs/spec_delivery_results.jsonl`。

`--platform` 取值规则（**天猫不得降级为淘宝**）：该 request 的 `commercePlatform == "tmall"` 时传 `天猫`；否则按 `platform` 映射中文枚举（`taobao→淘宝` / `doudian→抖店` / `jd→京东` / `pdd→拼多多` / `1688→1688`）。脚本会自动把天猫交付落到 `店铺端/天猫/<店铺>/`，且仍能收 `淘宝-` 前缀的原始文件（采集通道为淘宝）。

其余参数：`--plugin-root` 必须显式传入用户工作区下的 `全域电商运营` 目录；`--raw-data-dir` 必须使用该店 request 的 `rawDataDir`；`--metric` 写本次数据主题（如「评价数据」「库存数据」）。

### 9. Presentation Gate

全部店铺交付完成后运行：

```bash
python3 scripts/collect_present_files.py \
  --delivery-log data/<run_id>/logs/spec_delivery_results.jsonl \
  --out data/<run_id>/logs/present_files.json
```

读取 `logs/present_files.json`，将完整数组原样传给 `present_files`；禁止挑子集、改 label、重排或遗漏。取数交付时清单内只有 Excel 条目，展示后自查文件数等于清单项数。

### 10. Collection Summary & Analysis Offer Gate

先输出**采集详情 summary**，每项只能取自唯一事实源，禁止凭记忆或估算：

| Summary 内容 | 事实源 |
|---|---|
| 本次执行 / 已跳过（未登录或无候选）的“店铺名（脱敏账号）”（天猫店按 `commercePlatform` 显示为天猫） | Store Scope Gate 的发现结果与 `logs/plan.json` |
| 平台、时间窗（默认近 7 天时必须提示）、取数主题与 DSL 清单 | `logs/plan.json` + `logs/dsl-selection.json` |
| 逐店逐 DSL 采集状态与产物计数 | `logs/execution-request-plan.json` + `logs/raw-data-collection.json` + `logs/extraction-manifest.json` + 每店 `postprocess_result.json` |
| 逐店交付目录路径与 Excel 数量 | `logs/spec_delivery_results.jsonl` 的 `runDir` 与各店 `meta.json.raw_data_count` 合计 |
| 数据缺口（未登录 / 无权限 / 空数据 / 失败 DSL / 退出码 3） | 各阶段 manifest 与执行层后处理结果 |

播报纪律：统一展示“店铺名（脱敏账号）”；禁止暴露脚本名、内部路径、完整账号；DSL 失败只如实上报缺口并继续交付 partial，禁止向用户索要 retry/upload/ignore 选择。

**平台身份播报硬规则**：天猫店在 summary、店铺清单、交付路径与任何向用户的描述中**一律显示「天猫」**。**禁止**出现“系统对天猫店铺采用统一的淘宝通道”“将产物前缀调整为淘宝以符合交付契约”“以淘宝通道名义完成交付”类把商家平台身份改写成淘宝的说法，也禁止因此重命名、重提交交付。确需解释时只能如实说“原始文件名沿用采集通道前缀（淘宝-），交付与归档均为天猫”。

然后在 `present_files` **之后**做一次分析追问：`ask_user(mode="form")` 单选「生成分析报告」/「暂不需要」。硬约束：

- 交付已完成，该追问**不是阻塞门禁**；用户不回应不影响已交付结果。
- 只问一次；禁止在采集前或交付前问；禁止用普通文字、Markdown 表格、编号列表代替表单。
- 用户选「生成分析报告」→ 进入可选分析阶段（A1-A3）；选「暂不需要」→ 直接进入 Final Self-Check。

三个例外：

1. **原始诉求已含显式分析信号**（分析 / 诊断 / 为什么 / 原因 / 洞察 / 报告 / 复盘 / 对比结论）：不追问，交付 Excel 后一句话说明并**直接**执行可选分析阶段。
2. **全 run 零可用产物**：按 `failed` 报告缺口与下一步，不追问分析。
3. **有 Excel 但无成功抽取产物**（`logs/extraction-manifest.json` 零成功）：照常交付 Excel 与 summary，**不追问分析**，并一句话说明本轮数据无法支撑可溯源分析（避免承诺无法完成的报告）。

### 11. Final Self-Check

收尾前逐项确认：前置编排口径与 `request-routing.md` 一致（发现一次、非空范围、未登录自动跳过）；DSL 选择最小充分；执行输入不是旧 schema；交付的 Excel 只来自执行层 `raw_data/`；缺口如实记录；交付目录由 `spec_delivery.py` 生成；`present_files` 使用唯一事实源；采集详情 summary 与分析追问（或例外说明）已完成；若跑了可选分析，报告数字可溯源、二次交付与二次展示已完成。

## Optional Analysis Phase

仅在用户确认需要报告，或原始诉求已含显式分析信号时执行。本阶段**不重新采集**，只复用本次 run 的 `extracted/` 与每店 `postprocess_result.json`。前置条件：`logs/extraction-manifest.json` 至少有一份成功抽取产物；不满足时不进入本阶段（见 Gate 10 例外 3）。

### A1. Analysis Gate（可选）

读取 `references/analysis-contract.md` 与 `assets/report-model.schema.json`，基于用户原始诉求组织分析，先建 `data/<run_id>/report_model.json`。每个数字结论必须写入可追溯 `sources`（`file` + `sheet` + `field`）；跨平台口径不同则分平台呈现；未登录、无权限、空数据、失败、私有字体不可信值等必须写入 `dataGaps`。按 schema 检查；若失败，修正一次并复查，仍失败则停止并报告原始错误（已交付的 Excel 不受影响）。

### A2. Rendering Gate（可选）

先读 `references/report-style-contract.md`（紫色设计系统，本 Skill HTML 样式唯一事实源），再渲染：

```bash
python3 scripts/render_report.py \
  --model data/<run_id>/report_model.json \
  --template assets/report-template.html \
  --out "data/<run_id>/report/<平台>-<店铺>-自定义分析报告.html"
```

多店运行时逐店渲染，**输出文件名必须带该店身份**（同平台同店名不同账号时再拼 `storeAccountId`），禁止所有店共用一个固定文件名互相覆盖；全局汇总可作为参考，但不进入标准交付。报告标题必须含 `平台·主体·指标·周期` 四要素，其中**天猫店的平台写「天猫」**（report model 的 `stores[].platform` 同步写天猫），否则 `spec_delivery.py` 会因标题缺天猫而给 `report_title_missing_token` 软告警。

### A3. Analysis Delivery Gate（可选）

逐店再调用一次 `scripts/spec_delivery.py`，**带 `--report`、不带 `--excel-only`**，生成新的 `<产出时间>` 目录（HTML + `assets/*.xlsx` + `meta.json`），结果追加到同一份 `logs/spec_delivery_results.jsonl`；禁止手工往首次取数交付目录塞 HTML。然后重跑 `scripts/collect_present_files.py` 并二次 `present_files`（此时清单含 HTML 与 Excel）。

## Resources

| Resource | Load / Use When | Purpose |
|---|---|---|
| `references/runtime-and-dependencies.md` | Runtime Gate | Python 环境、自检、依赖和 fail-fast 规则。 |
| `references/request-routing.md` | Store Scope Gate | 入口二态、账号发现范围、店铺消歧、登录门禁、时间解析与 plan 合成。 |
| `references/dsl-capability-map.md` | DSL Selection Gate | 按主题索引可用 DSL 与口径限制。 |
| `references/dsl-selection-contract.md` | DSL Selection Gate | `dsl-selection.json` 写法、选择纪律和禁止项。 |
| `references/dsl-selection.example.json` | DSL Selection Gate | 运行级 DSL 选择示例。 |
| `references/execution-contract.md` | Execution Request Gate / Collection Gate | plan.v3、adapter、Execution New 和原始数据接收契约。 |
| `references/delivery-contract.md` | Delivery Gate / Presentation Gate / A3 | 两态交付目录、`spec_delivery.py` 参数和 `present_files` 展示规则。 |
| `references/script-inventory.md` | Before running scripts | 脚本用途、输入、输出、副作用和 dry-run 状态。 |
| `references/analysis-contract.md` | A1 Analysis Gate（可选） | 分析口径、溯源、缺口和 report model 要求。 |
| `references/report-style-contract.md` | A2 Rendering Gate（可选） | 紫色设计系统令牌、组件映射、布局与验证清单。 |
| `assets/report-model.schema.json` | A1 Analysis Gate（可选） | report model JSON schema。 |
| `assets/report-template.html` | A2 Rendering Gate（可选） | 紫色设计系统 HTML 报告模板。 |

## Output Contract

- 中间运行目录：`data/custom-analysis-<timestamp>/`，只作为本次运行工作区。
- 标准交付目录：`店铺端/<平台>/<店铺>/自定义分析/<产出时间YYYYMMDD_HHMMSS>/`，由 `scripts/spec_delivery.py` 生成。
- **默认取数交付**：每店目录只含 `assets/`（该店原始 `.xlsx` 字节级全集）与 `meta.json`，**无 HTML**。
- **可选分析交付**：用户确认后额外生成一个新的 `<产出时间>` 目录，含 HTML 报告 + `assets/` + `meta.json`；首次取数目录保持不变。
- 最终展示必须来自 `data/<run_id>/logs/present_files.json` 的完整数组。
- 交付完成后必须输出采集详情 summary，并按 Gate 10 规则完成一次分析追问或按例外直接分析。
- 失败时报告阶段、动作、原始错误、错误类别、已完成产物、验证证据和下一步；不得用未变更输入无限重试。

## Failure Report Format

失败时返回：阶段、动作、原始错误、错误类别（input/dependency/permission/external/internal）、已写入或跳过的产物、下一步。不要隐藏原始错误，不要扩展到未确认的修复范围。

## Edge Cases

- 平台未指定：若已有 Router plan，使用其中的平台（Router 已完成平台确认）；直接命中且无法从用户诉求 / 店铺名 / URL 唯一确定平台时，必须先 `ask_user(mode="form")` 只问平台（选项含「全部平台」，允许多选），拿到答复后再选择有匹配 DSL 的平台；禁止默认全平台或零参数发现账号。
- 天猫店：三层平台键各司其职，**禁止互串**——发现键 `taobao` 与 `tmall` 严格分列；计划键为 `platform=taobao` + `commercePlatform=tmall`（直达路径在 `stores.json` 写 `tmall`/「天猫」即可，`build_plan.py` 自动归一并保留该字段）；交付键为「天猫」。登录 Profile 按 `storeAccountId` 命中天猫账号，不会退化到淘宝。采集仍走淘宝通道（取数主题无天猫原生 DSL），所以原始文件名是 `淘宝-` 前缀，**这是正常现象**，`spec_delivery.py` 已按双前缀兼容；交付目录为 `店铺端/天猫/<店铺>/`、`meta.platform=天猫`、报告与播报也都是天猫。禁止为了“符合交付契约”把天猫店改成淘宝交付。
- 周期未指定：默认近 7 天（`end` = 昨天），不询问、不展示时间选项，由开工播报的「周期」字段提示后继续；`custom` 必须提供开始和结束日期，缺失时回落默认近 7 天。
- 淘宝 `store_core_daily` 固定近 30 天，拼多多快捷档等限制按 `references/dsl-capability-map.md` 保留，不得假装支持任意区间。
- 京东复合主题只写入 `jdFixedTimeFamilies`；禁止把旧版 `jd_store_report_read_*` 物理变体写入 `dslIdsByPlatform.jd`。
- `pdd_promotion` 只有用户明确要求拼多多推广数据时才能选择。
- 未登录、无权限、空数据或采集失败只进入数据缺口（summary 与可选报告 `dataGaps`）；不得补采、猜测或跨店补值。
- 部分店铺成功、部分失败：按 partial 交付成功店铺的 Excel，失败项进缺口，仍要完成 summary 与一次分析追问。
- 同名店铺（例：同一品牌的淘宝店与天猫店重名）：交付互不影响（分属 `店铺端/淘宝/` 与 `店铺端/天猫/`），`present_files` 也不会跨店去重；但 Collection Gate 的聚合归集会因“同名但字节不同”硬失败，按 Collection Gate 的处置步骤继续交付并把抽取/分析记为缺口。
- 拼多多私有字体不可信值必须缺失，不得 fallback。
- 用户在本轮已拿到 Excel 后又提新的取数诉求：开新一轮运行目录，不复用旧 run 的 `logs/`。
