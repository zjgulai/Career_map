---
name: multi-platform-inventory-warning
description: 仅在用户显式调用 /multi-platform-inventory-warning、$multi-platform-inventory-warning 或明确点名 multi-platform-inventory-warning 时执行。面向多平台只读采集店铺商品总可售库存，当前支持淘宝、天猫，支持按单个商品 ID/商品链接、库存列表当前顺序的前 N 个商品或店铺全部商品查询，输出商品维度库存 JSON 和 Excel；不采集 SKU、仓、批次库存，不修改库存或店铺配置，也不接入意图 Router。
---

# 多平台商品库存预警

本 Skill 使用统一模型建立多平台商品维度的库存快照；当前采集适配器仅支持淘宝和天猫。本期读取商品总可售库存和预扣库存，为后续预警规则提供数据。任何编辑库存、库存回补、批量导入、仓库或渠道库存操作都不在本 Skill 范围内。

## 启用边界

- 仅接受显式 Skill 调用。普通“库存分析”“库存预警”请求不得由 Router 自动转入本 Skill。
- 只支持账号管理中的 `platformId=taobao` 或 `platformId=tmall`，两个平台严格区分，不互相代查登录态。
- 支持三种范围：一个商品 ID/商品链接使用 `single`；明确要求前 N 个商品使用 `top`；明确要求全店、全部商品使用 `all`。
- `top` 只表示库存管理列表当前顺序的前 N 个商品。平台列表顺序可能变化，不能解释为销量、销售额、库存量或经营排名。
- 一次只查询一个商品 ID。多个 ID 不得拼到 `itemIds`，应说明当前版本暂不支持并停止。
- 仅做只读采集。用户要求修改、补回、同步、冻结或分配库存时，说明本 Skill 不支持写操作并停止。

## 工作流

1. **准备运行环境**：在账号发现和浏览器执行前运行 `python3 ../multi-platform-intention-router/scripts/check_python_env.py --json -m openpyxl`。只有退出码为 `0` 且 stdout 语义成功才继续；依赖准备失败时保留原始诊断并停止，不得手工运行 `pip`。准备脚本本身也会在落盘前复检该依赖并返回 `MISSING_DEPENDENCY`，因此依赖问题一定在打开浏览器之前暴露，不会浪费一整轮采集。
2. **解析范围**：从本轮 query 判断平台和范围。商品 URL 只用于识别淘宝/天猫平台及提取 `id` 参数，不打开商品前台页。范围不明确时，必须用 `ask_user(mode="form")` 提供三个互斥选项：“查单个商品（提供商品链接或商品 ID）”“查前 N 个商品（按库存列表当前顺序，顺序无法保证）”“查全店商品”。选择单品后收集一个商品链接或 ID；选择前 N 品后收集正整数 N。平台未明确时，再用表单在“淘宝 / 天猫”中确认；禁止默认选择、禁止零参数扫描账号。
3. **发现账号**：完整读取 `../discover-store-accounts/SKILL.md`，按本轮平台只调用一次 `discover_store_accounts({"platformIdList":[...]})`。数组必须非空，只能包含本轮明确选择的 `taobao`、`tmall`，并保留同一次返回的完整 `accounts[]`。
4. **确定店铺**：只保留 `isMerchantBackendAccount=true` 且平台匹配的候选。店铺消歧、脱敏账号展示和 `enable` 登录门禁遵循 `../multi-platform-intention-router/references/common/store-scope-contract.md`；多候选时只能使用 `ask_user(mode="form")`，不能按店铺名猜测 Profile。
5. **准备采集**：逐个已登录目标店铺运行 `scripts/prepare_inventory_collection.py`。每个店铺使用独立的 `<runDir>/<platform>-<storeAccountId>/`，禁止把多个店铺写入同一结果对象。准备脚本会为每次调用生成新的 `collectionId`，并在启动浏览器前固化本轮 `collectedAt`；这两个字段只进入内部 context，用于阻止旧确认跨采集轮次复用和避免用户确认耗时改写快照时间。
6. **执行 RPA**：完整读取 `../browser-rpa-launch/SKILL.md`。使用准备脚本 stdout 中的 `launch` 对象调用一次单 item `browser_rpa_launch`，顶层 `platformId/storeId/storeAccountId` 必须来自同一条账号发现记录，且与准备脚本上下文完全一致；`closeOnFinish=true`。这组三元组是库存页不展示店铺名时的店铺归属依据。DSL 仅在页面明确展示“当前店铺 / 当前商家 / 当前卖家：名称”时尽力读取额外身份证据，不能用预期店铺名反向搜索页面完成自证。
7. **提取结果**：只把返回项的准确 `outputsPath` 交给 `scripts/extract_inventory_result.py`，把同一返回项的 `status` 原样传给 `--rpa-status`，并将准备脚本 stdout 的 `resultFiles.json` 原样传给 `--output`。任务状态以 `browser_rpa_launch.items[0].status` 为主；旧版 `outputsPath` 缺少状态和 schema 时保持兼容，文件存在这些元数据时必须与外层状态及 `browser-rpa-run.outputs.v1` 契约一致。同一次提取确定性生成同名的 JSON 和 Excel，两者作为一个整体落盘，失败时不会留下单独的孤儿文件；不得由 Agent 手工解析、改写或补造页面数据。RPA 不是 `success`、缺少 `outputsPath`、提取器非 `status=ok` 或任一正式产物缺失时，禁止交付成功结果。页面没有店铺身份文本时按已绑定的 Profile 三元组继续；若提取器返回 `STORE_IDENTITY_MISMATCH`，说明页面明确展示了其它当前店铺，必须直接停止该店，禁止把数据改标成目标店铺；若返回 `INVENTORY_CONFIRMATION_REQUIRED`，立即停止本轮提取，不得跳过该商品或生成部分 JSON/XLSX。stdout 必须同时包含 `details` 和 `confirmationRequest`；缺失请求路径或出现 `confirmationRequestError` 时直接报告并停止，禁止手写恢复文件。使用 `ask_user(mode="form")` 展示商品名称、商品 ID、库存字段、页面原值和原因，明确询问“该商品的某某库存是多少”。用户回答必须是非负整数；随后运行 `scripts/record_inventory_confirmation.py --request <confirmationRequest> --value <用户回答>`，并把成功 stdout 的 `output` 作为 `--confirmations` 重跑原提取命令。该次重跑因为用户提供了新证据而允许执行；若继续返回另一个 `INVENTORY_CONFIRMATION_REQUIRED`，按同一流程逐项确认。确认 sidecar 必须与 context 的 `collectionId`、平台、店铺账号、商品字段和当前页面原值全部一致；任一不一致立即停止，禁止人工修改正式产物。返回 `UNEXPECTED_ERROR` 时按原始消息排查运行环境，不得以不变输入重试。
8. **交付 JSON 和 Excel**：每个店铺必须同时交付一份 JSON 和一份 Excel，命名为 `店铺商品库存<YYYY-MM-DDTHHmm>_<平台名>.json/.xlsx`。最终回复必须分别给出两个文件的可点击链接和绝对路径，并说明平台、店铺、商品数及失败项。`top` 结果必须再次说明“商品来自库存列表当前顺序，顺序无法保证”。

## 采集命令

单品：

```bash
python3 scripts/prepare_inventory_collection.py \
  --platform tmall --scope single --product 'https://detail.tmall.com/item.htm?id=832263044849' \
  --store-name '示例旗舰店' --store-id '<storeId>' --store-account-id '<storeAccountId>' \
  --account '示***号' --run-dir '<runDir>/tmall-<storeAccountId>'
```

全店：

```bash
python3 scripts/prepare_inventory_collection.py \
  --platform taobao --scope all \
  --store-name '示例淘宝店' --store-id '<storeId>' --store-account-id '<storeAccountId>' \
  --account '示***号' --run-dir '<runDir>/taobao-<storeAccountId>'
```

前 N 品：

```bash
python3 scripts/prepare_inventory_collection.py \
  --platform tmall --scope top --limit 150 \
  --store-name '示例旗舰店' --store-id '<storeId>' --store-account-id '<storeAccountId>' \
  --account '示***号' --run-dir '<runDir>/tmall-<storeAccountId>'
```

RPA 成功后：

```bash
python3 scripts/extract_inventory_result.py \
  --context '<storeRunDir>/collection-context.json' \
  --input '<browser-rpa-launch items[0].outputsPath>' \
  --rpa-status '<browser-rpa-launch items[0].status>' \
  --output '<prepare stdout resultFiles.json>'
```

提取命令的 `--output` 仍指向准备脚本确定的 JSON 路径；Excel 路径来自同一个 context。两个文件位于同一目录、共享生成分钟和平台后缀。脚本 stdout 只能按 [inventory-contract.md](references/inventory-contract.md) 的机器协议判断，不能只看进程退出码。开发或排障时可使用 `--dry-run`：准备脚本只验证并渲染内存中的 DSL，提取脚本只验证结果而不落盘；即使验证结果需要人工确认，也只在 stdout 返回问题详情，不创建确认请求文件。

需要用户确认库存时：

```bash
python3 scripts/record_inventory_confirmation.py \
  --request '<extract stdout confirmationRequest>' \
  --value '<用户明确确认的非负整数>'

python3 scripts/extract_inventory_result.py \
  --context '<storeRunDir>/collection-context.json' \
  --input '<同一次 browser-rpa-launch items[0].outputsPath>' \
  --rpa-status 'success' \
  --output '<prepare stdout resultFiles.json>' \
  --confirmations '<record stdout output>'
```

`record_inventory_confirmation.py` 只能消费提取器自动生成的请求文件，按商品 ID 和库存字段幂等更新 `inventory-confirmations.v2` sidecar；不得自行手写或改写请求中的采集轮次、平台、店铺、页面原值。确认文件只作为内部恢复证据，不改变正式 JSON/XLSX 字段；使用过人工确认时，最终回复额外给出该 sidecar 的链接和路径。

## 页面与失败门禁

- 单品固定打开 `itemType=itemInventory&pageSize=10&itemIds=<商品ID>`；解析出的行 ID 必须与请求 ID 完全一致。
- 店铺归属必须由同一次账号发现记录的 `platformId/storeId/storeAccountId` 精确绑定到浏览器 Profile。库存页没有可见店铺身份时不阻塞；若页面明确展示“当前店铺 / 当前商家 / 当前卖家”且与 `storeName` 不一致，则按冲突证据阻塞。不得把预期店铺名注入定位器，也不得把商品表格中的同名文本当成页面身份。
- 单品、前 N 品和全店首屏都必须先等待异步加载层挂载并消失；页面未展示加载提示时使用保守稳定等待。随后优先等待商品行或权限错误，只有该窗口结束后仍持续展示已知空态，才允许判断为空店铺或商品不存在，禁止用 SPA 请求中的临时空表格提前结束采集。
- 前 N 品和全店都固定打开 `itemType=itemInventory&pageSize=100` 并复用同一分页模板。前 N 品达到覆盖 N 个商品所需的页数或页面没有下一页时停止；全店直到最后一个“下一页”按钮带 `disabled`。每次点击下一页后先等待异步加载层挂载；检测到 Next Loading 时等待其消失，页面未展示加载提示时使用保守稳定等待；商品行可见后再留出短稳定窗口，最后读取页码和商品行。最多 1000 次循环，且提取器必须证明每轮页码严格递增。
- 全店结果必须同时通过：商品 ID 唯一、库存字段为非负整数、最终页码已到末页、页面“共 N 条”与去重后商品数一致。任一证据不一致都按不完整采集失败，不得输出看似完整的正式产物。
- 前 N 品结果必须为 `min(N, 页面商品总数)` 个：页面商品不少于 N 时只交付列表前 N 个；不足 N 时必须证明已经到达末页。最后一页仍按整页行数校验完整性，但仅解析和校验交付范围内商品的字段与唯一性，超出 N 的商品不能反向阻塞本轮结果。不得把前 N 品描述成 Top 商品或承诺顺序稳定。
- 单品出现“没有数据”或“暂无数据”，或返回其它商品 ID 时，直接提示用户检查商品链接或商品 ID，不得改成全店查询。
- 页面出现“无权限 / 没有权限 / 权限不足 / 未授权 / 403 / Forbidden”时立即停止，把页面实际错误文本原样告诉用户，要求先处理权限；权限错误优先于店铺身份门禁，不得被“身份无法确认”覆盖，也不得切换其它店铺或其它页面绕过。
- 商品详情链接和主图链接按行尽力读取，字段始终存在；页面确实未提供时写 `null`，不得编造 URL。商品 ID、名称、状态、库存模式、可售库存和预扣库存为必填，缺失即失败。
- 复合库存文本允许总量、分项标签、冒号和数量之间出现页面布局产生的空格或换行。总量与分项之和冲突、库存为空或格式仍无法识别时返回 `INVENTORY_CONFIRMATION_REQUIRED`；必须停下来询问具体商品的具体库存，不得删除异常行后继续交付。用户确认只能通过提取器请求和 `inventory-confirmations.v2` sidecar 回填；仅当 `collectionId`、平台、店铺账号、商品 ID、字段及页面原值全部一致时生效，且不能覆盖本来可正常解析的平台值。

## 输出契约

正式 JSON 只能包含以下结构，不得增加 Profile ID、原始页面文本、内部路径或调试字段：

```json
{
  "schemaVersion": "inventory-warning-result.v1",
  "platformName": "天猫",
  "storeName": "示例旗舰店",
  "account": "示***号",
  "collectedAt": "2026-09-05 14:24:36",
  "collectedDate": "2026-09-05",
  "products": [
    {
      "productId": "832263044849",
      "productName": "示例商品",
      "productDetailUrl": "https://detail.tmall.com/item.htm?id=832263044849",
      "mainImageUrl": "https://img.alicdn.com/example.jpg",
      "productStatus": "仓库中",
      "inventoryMode": "普通商品库存",
      "availableStock": 20,
      "preDeductedStock": 0
    }
  ]
}
```

正式 Excel 的 Sheet 名为“商品库存”，每个商品一行。列顺序固定为：平台名称、店铺名称、账号名、采集时间、日期、商品ID、商品名称、商品详情链接、商品主图链接、商品状态、库存模式、可售库存、预扣库存。平台名称、店铺名称、账号名、采集时间和日期必须在每个商品行中冗余；账号名沿用账号发现结果中的脱敏值，不得还原。商品ID、账号名、采集时间和日期按文本保存，两个库存字段按整数保存。采集时间为准备脚本在启动浏览器前固化的 `UTC+08:00` 本轮快照时间，格式 `YYYY-MM-DD HH:MM:SS`；日期取其 `YYYY-MM-DD` 部分，等待用户确认不能改变这两个值。空店铺也生成只有表头的 Excel。

字段、脚本 stdout、空数据、权限错误和完整性规则的唯一详细事实源为 [inventory-contract.md](references/inventory-contract.md)。选择 DSL 前读取 [rpa-dsl/manifest.json](references/rpa-dsl/manifest.json)，只能使用其中登记的三个 flow；`top` 与 `all` 必须共用分页模板。

## 禁止事项

- 不调用或修改 `multi-platform-intention-router`，不把本 Skill 加入 Router 的目标清单或关键词。
- 不点击“编辑库存”“库存回补”“批量导入编辑商品库存”“更多”等写操作入口。
- 不读取 SKU、货品、仓、渠道、区域或批次库存来覆盖商品总可售库存。
- 不用浏览器当前页、店铺名、脱敏账号或历史上下文猜 Profile；必须复用本轮账号发现记录的三个 ID。
- 不把 RPA `partial`、分页数量不一致、重复商品冲突或字段解析失败包装成完成。
