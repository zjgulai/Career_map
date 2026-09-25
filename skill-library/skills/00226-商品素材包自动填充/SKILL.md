---
name: product-package-autofill
description: 当用户需要从商品 URL、商家 Excel、ERP 导出或自然语言 JSON 自动准备商品发布素材包时使用。URL 新任务先初始化持久并行编排，标题交接后立即召回类目，同时继续来源处理；只处理必填字段主链，完成发布前预检后再交给发品技能。
metadata:
  displayName: 商品素材包自动填充
  displayDescription: 从商品素材生成 Product Draft，衔接类目模板，填充素材包并生成字段补全清单。
  version: 0.1.0
---

# 商品素材包自动填充

## 目标与边界

把商品详情、商家 Excel、ERP 导出或结构化 JSON 转成 Product Draft，生成或接入空白素材包，填充 `商品信息.xlsx` 和素材目录，并执行发布前预检。

本 Skill 不绑定店铺、不操作发品页面、不正式发布。只有 `<out-dir>/autofill_result.json` 顶层 `status=ready`，且最新 full preflight 与当前工作簿和发品数据 hash 一致时，才能把 `preflight.publishHandoff.productDataPaths[]` 交给 `excel-product-publish` 保存草稿。

验收目标是：

- `requiredFieldFillRate=1.0`、`requiredFields.missing=0`；
- `requiredAssetDirectories.missing=0`、`fallbackReviewRequired.missing=0`；
- full preflight 通过，且没有待确认、mock 或来源质量阻断；
- 不编造来源事实、合规资料、量化值或经营承诺，不缩小必填分母，不把 pending 当 verified。

## URL 新任务

先运行 `scripts/url_autofill_flow.py --help`，再以 `--execution-mode parallel --runtime-rpa-mode legacy` 初始化持久任务。初始化必须早于详情采集；后续始终使用同一 `out-dir` 加 `--resume`，消费返回的全部 `nextActions[]`。宿主可通过 `--request-started-at <epoch-ms>` 把 Skill 加载前的等待纳入时间轴。

```bash
python3 "<skillDir>/scripts/url_autofill_flow.py" \
  --execution-mode parallel \
  --runtime-rpa-mode legacy \
  --url "<source-url>" \
  --target-platform taobao \
  --out-dir "/absolute/url-flow-run"
```

执行规则：

1. 未提供显式类目查询时，初始化先返回唯一的 `title_probe`。先执行其 `startCommandArgs`，再按 `titleProbe.genFlowArgs` 生成仅采标题的 DSL，以 `runtimeAdapter.executionMode=sync` 调用 `browser_rpa_launch`；将同步返回的 outputs 路径替换进 `onTitleProbeCompleted.commandArgs` 并立即执行。已有全部叶子类目 ID 或 `--target-category` 时，初始化直接返回完整 `capture` 和 `category_recall`。
2. 标题回调原子创建完整 `capture` 与本地 `category_recall` 后，在同一调度轮派发两者；同时消费 `dispatchPolicy.categoryRecallWatch.commandArgs`，让 category 一就绪就回到当前调度轮。不得调用 `browser_rpa_task_status`，也不得等待完整详情才启动类目分支。
3. `category_recall` 完成后才创建外部 `category`，该动作只负责语义 Top 1 和同页确认，不得再次执行常规召回；确认结果由本地 `category_finalize` 固定收口。全部平台均为用户显式叶子 ID 且精确校验通过时，直接运行本地 finalize，不创建交互动作。
4. 完整 `capture` 同样以同步方式执行。拿到完整 RPA outputs 后，在任何详情后处理前立即执行 `onRpaCompleted.commandArgs`；它封存不可变来源快照并启动来源 worker。标题探针产物不能代替完整详情。
5. 按 `dispatchPolicy` 并发推进所有可运行的外部动作。遇到 `awaiting_input` 只暂停对应动作，不暂停另一分支。
6. `--status` 只读状态；`--wait-seconds` 只用于收取本地任务变化。不要用固定 sleep，也不要因动作处于 pending/running 而降级串行。

调度时按 `dispatchPolicy.runtimeActionIds` 批量提交采集/FieldSpec，按 `modelActionIds` 处理语义判断；`managedLocalActionIds` 已由脚本管理，不逐个调用子脚本或为本地进度唤醒模型。宿主未实现自动提交和回调时，按返回的命令参数衔接外部动作，不能宣称已消除这些模型轮次。已读取的命令帮助不重复读取；独立的必要帮助/协议读取可放在同一工具轮次。

缓存默认使用 `<out-dir>/cache`，初始化先检测可写，再派发采集。需要跨任务缓存时显式指定可写的 `--cache-dir`；显式目录不可写会直接报告错误，不自动换路径。来源后处理由 worker 使用固定参数执行，淘宝/天猫 SKU 图省略 `--max-sku-images` 表示全量下载，不能用 `0` 代替。

详细事件格式、恢复、失效和时间证据见 [URL 双分支执行协议](references/parallel-url-flow.md)。宿主工具的非阻塞提交与回调要求见 [外部运行时异步适配契约](references/external-runtime-adapter.md)。显式串行只用于历史产物兼容，必须传 `--execution-mode serial --serial-reason "实际原因"` 并展示 `executionNotice.message`；每次续跑写入 flow root 下独立的 `attempts/<序号>/`，根目录只保存最新受控结果和时间轴。

## 双分支流程

### 来源分支

流程为：

```text
capture -> source_candidates
  |- 来源 SKU/图片审计健康 -> automatic_source_audit -> detail -> source-check
  `- 审计异常 -> sku_review -> source_finalize -> detail -> source-check
```

- 淘宝/天猫 SKU 矩阵与图片审计、1688 `sku_quality` 全部通过时，脚本自动批准 SKU，不调用模型审核。
- 只有缺维度、组合冲突、图片绑定异常或平台审计失败时才生成 `sku_review` 动作；审核决定必须通过动作绑定事件提交。
- 正式详情通过 source-check 后生成 `validated-source-check.json`。填包脚本校验 detail、来源检查结果和质量报告 hash 后复用该结论，避免重复来源扫描；任一文件变化都拒绝复用。
- URL 来源仅采集发品字段和图片，不采集评论、评价 preview、差评或“问大家”。
- 素材包来源处理固定使用同步详情图下载，避免后台任务与 source-check 或来源快照冻结竞争。

### 类目与模板分支

流程为：

```text
同步标题探针 -> trusted title -> category_recall -> semantic Top 1
  -> one-page category confirmation -> local finalize -> FieldSpec -> template -> unpack
```

- 类目确认不等待完整详情、SKU 审核或 source-check。所有 `shortlisted` 平台都要用户明确选择；默认把所有平台的 Top 1 放在一个页面，通过一次“全部确认”提交。用户选择修改时只展开问题平台的其余候选和“以上均不合适”。用户传入的叶子类目 ID 仍须经过 taxonomy 精确校验，校验为 `exact` 后不重复确认。
- category 缓存按规范化 URL 与目标范围读取，并校验冻结结果和证据 hash；命中后可跳过重复召回。
- FieldSpec 接受 `publish.fieldspec.v2` 和 `publish.fieldspec.v3`，缓存按平台和类目校验内容 hash 与 TTL。全量命中直接生成模板；部分命中只请求缺失平台，全局最多并发 2 个独立请求，同一浏览器会话并发为 1。
- 缺空白包时，先用 `prepare_template_generation.py` 建立 contract，再调用 `product-package-template`，最后用 `prepare_package_dir.py` 官方入口解包。所有路径直接取 contract/result，不手工猜测；模板结果和最终素材包必须完整覆盖全部目标平台/类目。

两条分支完成后，编排器执行内部汇合门禁：正式来源检查和有效空白模板均完成才启动一次填包。该门禁不新增用户步骤。

## 填充与补全

主链只为适用的必填字段建立 completion plan；选填字段继续计入总体统计，但不进入 5 分钟阻塞链。处理顺序为：

1. 复制空白素材包，生成 Product Draft；
2. 写入来源事实、稳定平台默认值和唯一合法枚举；
3. 映射 SKU、价格、库存和素材目录；
4. 执行脚本二次兜底，再按默认 `--inference-mode max-fill` 为仍空的必填字段生成待确认候选；
5. 仅在实际写入新值后重建 completion plan；
6. 输出 `required_input_plan.json`，合并同平台、同商品的重复真实输入缺口；`autofill_rule_gap` 单列为 `automationBlockers`，不再伪装成用户应补的 `product_facts`。

字段规则：

- 必填枚举优先采用字段相关的来源属性、同义归一、标题证据和规则默认候选；仍无法判断时，在当前 FieldSpec 合法枚举中稳定随机选择。随机种子绑定商品和字段，重复运行不随意换值；不把规则排序伪称为统计概率。
- `max-fill` 可从原始 SKU 文本提取名义身高、推荐体重中点作为候选；没有来源候选时，只有模板给出明确合法数值范围才随机选值。没有合法候选空间的自由文本或数值仍返回缺口，不编造证件、授权、许可证等资料。
- 所有兜底猜测（包括随机值）写入 `inferred_pending_confirmation`，记录证据、置信等级和 `isRandom`；计入物理填写率，确认前不计入已验证率、不允许发布。用户已拒绝的候选不自动重新猜测。
- `--inference-mode review` 仅使用证据，`off` 关闭猜测；普通原包复检默认不新增猜测，需要补全旧包时显式传 `--inference-mode max-fill`。
- `--merchant-profile` 提供店铺级事实，`--product-facts` 提供商品级事实；写入前逐格通过 FieldSpec 校验。
- 有可靠来源可补录时，从 `requiredInputPlan.productFactsTemplate` 或 `merchantProfileTemplate` 复制模板，只填写有证据的值；保留平台编码、字段编码和 SKU 行列。先用 `read_completion_details.py --result <autofill_result.json> --product-facts <facts.json>` 一次只读预检，`invalid_input` 时按诊断修正，不重跑填包来试参数。通过后用 `recheck_filled_product_package.py --package-dir <filledPackagePath> --out-dir <原autofill输出目录> --product-facts <facts.json>` 原包补录并执行 full preflight；店铺资料使用同一入口的 `--merchant-profile`。人工缺口仍按下述 Excel 流程处理。
- 多维 SKU 不做无证据笛卡尔积。正常 SKU 保留来源组合；维度缺失或归一后碰撞时阻断整个平台 SKU 投影。
- 单个非法规格值只阻断该 SKU 对应的规格身份单元格，仍写价格、库存、货号和启用状态；问题中记录 `blockedColumns/blockedRows/blockedSkuIndexes/blockedCells`。
- 尺码支持 `M 90-115斤 -> M`、`XXL <-> 2XL` 等唯一归一；基础色族可从修饰色名归一。多候选时仍视为歧义。
- SKU、素材和各平台特殊字段规则见 [平台字段填充指南](references/platform-field-fill-guide.md)。

## 图片识别退出主链

主链只执行来源处理、素材复制/转码、脚本填充、规则猜测和完整预检。主填包不调用图片识别、不构建拼图或 handoff、不读取图片事实缓存，也不派发新的 `image_fallback` 动作；结果显式记录 `imageFallback.status=disabled`。

缺失素材仍单独阻断，随机文字不能代替图片。独立图片工具仅用于用户显式要求的专项处理或恢复已派发的历史任务，其证据与回填契约见 [图片工具兼容契约](references/contract.md)，正常填包无需读取。

## 状态与阻断

始终读取顶层 `status`、`primaryStatus` 和完整 `blockers[]`。`autofill_failed` 的优先级高于缺素材，避免映射规则缺陷被素材问题掩盖；`invalid_input`、`failed`、`needs_mock_replacement` 保持保护优先级。

常见 blocker：

| type | 含义 | 处理 |
|---|---|---|
| `autofill_rule_gap` | 自动映射规则缺口 | 修规则后复检 |
| `required_asset` | 必传素材缺失 | 补素材或修目录绑定 |
| `enum_ambiguous` | 枚举不唯一 | 在 Excel 合法下拉中选择 |
| `source_fact` | 来源事实缺失 | 补来源或结构化商品事实 |
| `merchant_config` | 商家配置缺失 | 补 `merchant-profile` |
| `compliance_fact` | 合规资料缺失 | 商家提供真实资料 |
| `fallback_review` | 兜底值待核验 | 确认、修改或拒绝 |
| `pending_confirmation` | 已写建议尚未确认 | 完成确认后复检 |

人工字段默认在生成包的 `商品信息.xlsx` 内补齐，再运行 `recheck_filled_product_package.py`。聊天中的 `--completion-input` 只用于 AI 建议或有来源价格建议的采用、修改和拒绝，不用多输入框收集枚举、合规、库存、重量或包装尺寸。

最终回复先说明生成结果，再原样展示 `agentDecision.delivery.markdownText`（持久入口为 `autofill.agentDecision.delivery.markdownText`），最后展示素材包路径。该正文由脚本按“风险提示 → 填充率 → 最终确认表”拼接，不再重复输出各分块。兼容没有组合正文的旧结果时，先展示 `materialUsageNotice.markdownText`，再展示 `fillRateDisplay.markdownText` 和 `finalDeliveryConfirmation.markdownText`；旧确认表末尾的素材使用提醒不重复展示。`status != ready` 时称为“当前填充率”。首次填包结果收取后直接使用 `agentDecision` 中的缺口、待确认项、路径和交付文案；不要重新读取 FieldSpec、猜补录 schema 或逐行展开 completion plan。超过内联页时使用 `read_completion_details.py --result <result.json> --offset <n> --limit 20`；单元格详细诊断使用原有 `--plan` 分页接口。确认表里的“位置”统一为商户可读格式 `X页签 →「字段」列 → 第N行`（SKU 行追加 `（SKU行）`，分页诊断的 `locationText` 同格式）；结构化字段 `excelAddress`（形如 `京东!P5`）只供程序定位，不得出现在面向用户的正文里。

URL/detail 来源已生成素材包（`filledPackagePath` 非空）时，无论 ready、待确认或仍有缺口，均在结果说明之后、填充率之前展示一次“用户需知悉的风险”。正文固定为：“AI生成内容仅供参考。发布前请务必核实信息与库存，确保不侵犯第三方合法权益，规避知识产权及履约风险。” `materialUsageNotice.mustDisplayInFinalResponse=true` 表示必须展示；`displayMode=before_fill_rate` 指定位置；`blocking=false`、`doNotUseAskUser=true` 表示只提示、不新增确认步骤。原包补齐/复检后的交付同样保留；尚未生成素材包的采集失败结果及非 URL 来源不展示该提示。

## 主要产物

| 产物 | 用途 |
|---|---|
| `url_autofill_flow_result.json` | 持久任务状态、动作与恢复参数 |
| `flow_timeline.json` | 分支耗时、派发延迟、重叠和慢步骤 |
| `source_quality_report.json` | 来源完整性与 SKU/图片审计 |
| `product_drafts.json` | 统一商品草稿 |
| `field_mapping.json` | 字段来源、枚举拒绝、SKU 阻断和素材记录 |
| `completion_plan.json` | 必填主链确认与缺口明细 |
| `required_input_plan.json` | 合并后的真实必填输入组 |
| `autofill_result.json` | 最终状态、覆盖率、blockers 和下一步 |
| `preflight_report*.json` | 版本化发布前门禁 |

## 资源与脚本

- [URL 双分支执行协议](references/parallel-url-flow.md)：动作事件、恢复、缓存、时间轴和失败处理。
- [图片工具兼容契约](references/contract.md)：仅专项图片处理或历史任务恢复时读取。
- [平台字段填充指南](references/platform-field-fill-guide.md)：SKU、价格、素材及平台特殊规则。
- `scripts/url_autofill_flow.py`：URL 串并行入口和持久编排。
- `scripts/source_postprocess.py`：来源候选、自动 SKU 审批和异常审核衔接。
- `scripts/autofill_product_package.py`：正式填包、来源检查复用和脚本候选补全；无图片识别主链。
- `scripts/recheck_filled_product_package.py`：人工修改后的原包复检。
- `scripts/read_completion_details.py`：统一决策视图、只读补录预检和 completion plan 分页。
- `scripts/package_filled_product_package.py`：ready 后官方打包。

直接调用主填包脚本前必须执行 `python3 "<skillDir>/scripts/check_python_env.py" --json`。URL wrapper 会自动执行该预检。所有输入输出使用绝对路径；初始化输出目录必须为空或不存在。

已有正式详情和历史模板产物时可使用串行兼容入口。新 URL 任务不得先串行采集再补开并行任务。
