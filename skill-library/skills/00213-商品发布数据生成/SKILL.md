---
name: excel-product-data
displayName: 多平台商品发布数据生成
displayDescription: 解析商品发布素材包或商品信息表，为商品录入准备结构化业务数据。
description: 当用户需要从已填写的商品发布素材包或商品信息表中提取商品信息、关联图片和视频素材，并为后续商品录入流程准备结构化业务数据时使用。不生成或执行 DSL，也不操作浏览器。
version: 0.1.0
---

# 商品发布数据生成

## 执行门禁

- **职责边界**：只解析 Excel、校验数据并关联素材；不生成或执行 DSL，不操作浏览器，不代表商品已录入或发布。
- **单次执行**：每个 `<runDir>` 最多执行一次数据生成命令；不得搜索、复用其他运行目录或自动重试。
- **结果判定**：退出码只表示技术执行是否完成；商品是否可用只根据有效结果中的 `status` 判断。
- **路径保真**：只使用 Excel 配置及 `issues[]` 实际返回的路径；不得搜索或猜测替代路径，也不得将 Excel 所在目录、附件目录或当前 workspace 推断为素材包根目录。只有用户明确提供正确绝对路径并要求修改时，才可更新 Excel；不得自行创建素材路径。

## 输入要求

确认用户已提供当前环境可访问的商品发布素材包目录，或 `.xlsx`、`.xls` 商品信息表；未提供时，让用户提供。

- 用户提供素材包目录时，优先使用根目录下的 `商品信息.xlsx`。该文件不存在时，在素材包目录内递归查找 `.xlsx`、`.xls` 文件，只有一个候选文件时直接使用，存在多个候选文件时让用户选择，没有候选文件时说明素材包中缺少商品信息表。
- 用户直接提供 Excel 时使用该文件；其他格式需要用户另存为支持的格式。
- 平台、类目、商品字段和素材目录以表格中的实际内容为准，不根据商品标题、图片或描述推测类目。
- 图片和视频根据表格配置的素材目录关联。素材目录可以位于当前 workspace 外，但必须在当前环境中可访问；不自行推测、替换或改写素材路径。

## 生成商品数据

由 Agent 为本次执行确定 `<runDir>` 并传入脚本，不向用户索要。`<runDir>` 必须是当前 workspace 内的绝对路径。

以当前 workspace 根目录作为命令工作目录，执行：

```bash
<python> "<skillDir>/scripts/excel_to_data.py" \
  --excel "<excelPath>" \
  --out-dir "<runDir>" \
  --out "<runDir>/data_generation_result.json"
```

`<excelPath>` 使用最终选定的商品信息表绝对路径。

## 处理结果

每个 `<runDir>` 最多执行一次数据生成命令。命令结束后，只读取本次指定的 `<runDir>/data_generation_result.json`，不得搜索或复用其他运行目录的结果。

- 退出码非 `0`：属于技术执行失败，不信任目录中的任何产物，使用命令实际返回的错误信息说明原因。
- 退出码为 `0`，但结果文件不存在、无法解析或协议无效：属于技术执行失败，不自行构造或修改结果。
- 退出码为 `0` 且结果协议有效：脚本已正常完成，商品数据是否可用只根据 `status` 判断。

- `ready`：使用生成的全部商品数据。
- `partial`：使用 `items[]` 中已经生成的商品数据，并根据 `issues[]` 说明未生成商品的具体问题。
- `failed`：没有可使用的商品数据，根据 `issues[]` 说明具体失败原因，不得只说明“生成失败”。

取得协议有效的结果后，无论 `status` 为何，本次执行结束；发生技术执行失败时，停止并说明实际错误。不得自动重试。只有用户明确要求重新执行时，才能使用新的 `<runDir>`；若存在需要修复的输入、路径或权限问题，应先确认问题已经修复。

### 素材路径问题

以下错误表示 Excel 配置的素材绝对路径无法使用：

| 错误码 | 含义 |
| --- | --- |
| `invalid-asset-package-path` | 素材包根目录为空或不是绝对路径 |
| `unreadable-asset-package-path` | 素材包根目录不存在、不是目录或不可读 |
| `invalid-platform-asset-path` | 平台素材目录使用符号链接或超出素材包根目录 |
| `missing-platform-asset-path` | 当前平台没有可使用的素材目录配置 |
| `unreadable-platform-asset-path` | 平台素材目录不存在、不是目录或不可读 |

向用户说明 `issue.message`，并附带问题中实际返回的 `platform`、`sheetName`、`row`、`column`、`configuredPath` 或 `expectedPath`；没有返回的字段不得自行补充。`configuredPath` 是 Excel 中实际配置的素材包路径，`expectedPath` 是脚本根据素材包和平台规则计算出的预期目录。

命中上述任一素材路径错误后，**不得自行修复路径、修改 Excel 或重新生成数据**。`partial` 继续使用已有 `items[]`，受阻商品不重新生成；`failed` 说明实际问题后结束本次数据生成。**用户明确提供正确绝对路径并要求修改时**，才可更新 Excel；**用户确认路径或权限已修复并明确要求重新生成时**，才可使用新的 `<runDir>` 执行。

## 填写校验（lint）错误码

数据生成时会同时执行填写方式校验、平台文本长度与素材规则校验，错误码如下。

错误码表只描述稳定的触发语义、Issue 返回信息和处理方式。对于“按规则配置”的通用错误码，不在表中固定某个平台、字段、阈值或 severity；这些内容以本次加载的 `rules/{platform}.json`、FieldSpec 和实际 Issue 为准。仅当错误码本身就是平台专项逻辑时，才在说明中保留平台限定。

| 错误码 | severity | 含义与处理 |
| --- | --- | --- |
| `continuation-row-has-ordinary-fields` | error | 未填商品标识的规格行填写了商品信息，系统无法确定该行规格属于哪个商品。按 `suggestion` 转述 |
| `product-has-invalid-continuation-row` | error | 因上述规格行归属不明，关联商品本次未生成数据（防止缺规格发布）。按提示修正后重新生成 |
| `non-sku-group-on-continuation-row` | error | 规格行填写了按模板元数据仅允许在商品第一行出现的字段组。按 `message` 转述实际命中的字段组，并按 `suggestion` 清空该规格行中的相应内容；该商品本次不生成数据 |
| `enum-value-normalized` | warning | 下拉字段值经归一化后命中选项（如去除弯引号），已按 `fixedValue` 写入数据。`rawValue` 为原值，仅告知无需操作 |
| `enum-value-not-allowed` | 必填字段 error；非必填字段 warning | 下拉字段值不是有效选项，`suggestion` 给出最接近的合法值与候选 |
| `numeric-value-not-pure` | error | 数值字段不符合该列要求的纯数字、精度或有限数格式。按 `message` 转述实际值和格式要求，并按 `suggestion` 修正；该商品本次不生成数据 |
| `price-not-in-sku-prices` | error | 仅淘宝/天猫：一口价与任一有库存（`skuStock > 0`）SKU 的价格都不一致。`message` 和 `suggestion` 只展示可匹配的有库存 SKU 价格。商品无 SKU、一口价为空或不存在有效正库存 SKU 时不触发，交其它必填/数值/库存门禁处理 |
| `sku-combine-content-not-barcode` | error | 当前仅淘宝启用：SKU「包含产品」列的值不符合平台要求的条形码格式。按 `message` 转述实际值和格式要求，并按 `suggestion` 提示填写可关联商品的有效条形码；该商品本次不生成数据 |
| `date-value-invalid` | error | 必填日期字段不符合模板携带的 FieldSpec `dateFormat`，或日历/时间值越界；商品不生成，按 `suggestion` 修正后重新生成 |
| `date-value-invalid-omitted` | warning | 可选日期字段格式或日历值非法，已从生成数据中省略；`rawValue` 为原值，`suggestion` 给出正确格式。仅告知 |
| `sku-spec-name-looks-like-filename` | error | SKU 自定义规格名以图片/视频扩展名结尾，疑似把文件名或扩展名误填到规格文案列；商品不生成，删除规格名后缀并把图片文件名保留在规格图片列 |
| `sku-spec-name-forbidden-character` | error | 当前仅淘宝启用：SKU「自定义规格名」包含平台不允许的字符。按 `message` 转述原值和实际命中的字符，并按 `suggestion` 提示用户删除或替换；该商品本次不生成数据 |
| `text-length-exceeded` / `text-length-insufficient` | 按规则配置 | 文本长度超过规则配置的上限或不足下限。按 `message` 与 `suggestion` 转述字段名称、实际字符数、限制和修改建议；severity 为 error 时，该商品本次不生成数据。具体字段阈值以本次加载的平台规则和 issue 返回值为准 |
| `dependent-enum-value-not-allowed` | error | 级联复合字段的子值不属于当前父值对应的 FieldSpec 候选；生成 DSL 前阻断 |
| `dependent-enum-value-ambiguous` | error | 当前父值下存在多个同名子候选，无法可靠选择；生成 DSL 前阻断 |
| `duplicate-composite-record` | warning | 多行字段组填写了多条完全相同的记录，已合并为 1 条（`rawValue`→`fixedValue` 为条数）。仅告知 |
| `1688-dimension-spec-row-mismatch` | warning | 1688 `按产品规格报价` 时，规格报价有多行但 `件重尺` 只填写 1 行；不影响生成/发品，仅提醒确认各规格是否共用同一长宽高重量 |
| `asset-count-exceeded` / `asset-count-insufficient` | 按规则配置 | 素材数量超过规则配置的上限或少于下限。按 `message` 与 `suggestion` 转述素材类型、实际数量、限制和需增删的数量；是否阻断以 issue 的 severity 为准 |
| `asset-size-exceeded` / `asset-dimension-violation` / `asset-format-not-allowed` | 按规则配置 | 图片素材不符合规则配置的大小、尺寸、宽高比或格式要求。`message` 会折叠列出违规文件；尺寸问题同时给出实际宽高和规则要求，格式问题同时给出实际格式和允许格式。是否阻断以 issue 的 severity 为准 |
| `video-size-exceeded` / `video-duration-violation` / `video-aspect-ratio-not-allowed` | 按规则配置 | 文件大小始终校验；成功读取视频元数据时再校验时长与宽高比。元数据无法读取时不报错、不阻断，由最终提交阶段校验 |
| `platform-rules-stale` | warning | 平台规则文件核实日期超过 90 天，提示核对平台公告，不影响生成 |

issue 的可选字段：`suggestion`（修复建议）、`rawValue`/`fixedValue`（自动修正的前后值）。这些字段存在时必须转述给用户；不存在时不得自行编造建议。

### 补充字段

部分 issue 会附带以下可选字段。**存在时一并转述，不存在时不得编造**：

| 字段 | 类型 | 转述方式 |
| --- | --- | --- |
| `fieldNote` | string | 该字段的填写说明，直接转述给用户 |
| `enumOptions` | string[] | 完整候选值。`suggestion` 只列前 5 个，需要给用户完整清单时用它 |
| `enumOptionCount` | number | 候选总数。**≤20 全列，>20 先给最接近值和总数**，用户要求再全列（最长 279 项，全列会刷屏） |

`missing-asset` 类错误可能携带 `suggestion`（相近文件名提示，如"是否为笔误"）。只向用户转述，**不得自行改名文件或修改 Excel**。

## 产物：lint-report.json

`<runDir>/lint-report.json` 与结果文件同时生成（协议 `excel-product-lint.v1`）：`status` 为 `pass`（无问题）/`warn`（仅警告或自动修正）/`fail`（存在错误）；`summary` 含 `errors`、`warnings`、`autoFixed` 计数。结果文件 `summary.autoFixed` 表示本次自动修正的条数。自动修正只改写生成的数据，**从不修改用户的 Excel 原件**。

## 向用户说明问题的格式

向用户转述 `issues[]` 时遵守以下规则：

1. **按商品分组**，不按错误码分组；每个商品下先说必须修复的问题，再说已自动修正的事项。
2. **三类分桶**：🔴 必须修复（error，商品未生成）；🟡 已自动修正（`enum-value-normalized`、`duplicate-composite-record`、`date-value-invalid-omitted`，仅告知）；⚪ 建议关注（其余 warning）。
3. 每条问题用两句话：先说位置和现象（Sheet、行号、字段名、实际值），再给修复动作（优先使用 issue 的 `suggestion`）。
4. 同一商品同类问题超过 3 条时，列前 3 条并说明"另有 N 处同类问题"。
5. 结尾给一句状态总结，例如"修复以上 2 处后重新生成，预计全部商品可通过"。
6. **用词规范**：不使用"续行""主行""多行字段""composite"等内部术语，改说"规格行""商品的第一行""商品信息"；提到行号时明确写"Excel 第 N 行"，并尽量带上该行的可见内容帮助定位（如"规格「24V」所在行"）；说明后果时讲清原因而非只讲结果（不说"商品无法生成"，说"无法确定该行的规格属于哪个商品，为避免缺规格发布，暂未生成该商品的数据"）。

示例（仅供句式参考，内容以实际 issue 为准）：

> **商品A — 需修复 1 处**
> Excel 第 6 行（规格「24V」所在行）没有填写商品标识，却填写了"标题、型号"等商品信息，系统无法确定这一行的规格属于哪个商品。如果它是商品A的另一个规格，请清空该行的商品信息，只保留规格相关列；如果是新商品，请在 A 列填写商品标识。
> **已自动修正**：提取方式的值含中文引号，已按"使用物流配送"处理，无需操作。

## 交付结果

- 作为上层流程的一部分调用时，将本次结果文件的绝对路径交给上层流程，不单独回复用户。
- 用户直接要求生成商品数据时，先说明成功和失败的商品数量，再按"向用户说明问题的格式"说明用户可以处理的问题。字段或素材问题应说明平台、商品标识、所在行和具体原因；同一商品的多个问题可以合并说明。需要提供文件时，只提供本次结果文件。
- 数据生成成功只表示商品数据已经准备完成，不表示商品已录入、保存草稿或正式上架。
- 除非用户明确要求排查，不展示内部问题码、字段 key、商品数据文件内容、大段 JSON、内部日志或异常栈。
