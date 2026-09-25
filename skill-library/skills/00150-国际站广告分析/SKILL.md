---
name: 国际站广告分析
version: "3.0.1"
description: |
  使用 workctl 和广告 HATEOAS 能力查询、分析和管理国际站广告。覆盖全站推与标准推的计划、商品、关键词、地域、时段、效果报表、账户财务和账户/计划诊断，也处理预算、出价、暂停、删除、加删商品等写入意图。只有用户原话明确出现“标准推广”“手动推广”或“关键词”时才使用标准推；包括 P4P、直通车、广告、推广、计划在内的其他表述均默认全站推，不得主动补写“关键词推广”或“标准推广”改变用户意图。
enabled: true

triggers:
  - 广告分析
  - 广告诊断
  - 广告报告
  - 广告计划
  - 广告花费
  - 加品删品
  - 暂停广告
  - 恢复广告
  - 改价改预算
  - 定向标签
  - 全站推
  - 省心版
  - 直通车
  - 标准推
  - P4P
  - CPC推广
  - 广告财务
  - 广告余额
  - 现金红包
  - 卡券流水
  - 赔付流水

examples:
  - 帮我分析下国际站广告本周的投放情况
  - 这个全站推广计划效果不好，帮我诊断一下
  - 把这个广告计划暂停
  - 给这个计划加 3 个商品
  - 最近 30 天直通车商机主要来源于哪些商品？

excludes:
  - skill: alibaba-brand-ads-keyword-recommendation
    when: 用户要品牌广告关键词推荐、推词、问鼎/顶展关键词或关键词预定
  - skill: alibaba-icbu-brand-data-report
    when: 用户要品牌数据报告、品牌投放效果、同行对比、商品效果、关键词效果、达标率或履约 CPC 数据播报
  - skill: alibaba-analysis-brief
    when: 用户要整体店铺经营分析、流量转化、询盘或成交诊断，而不是广告产品内分析
---

# 国际站广告分析

用 `workctl` 获取真实广告事实，并通过 HATEOAS 返回的 links、operations 和 params 发现后续能力。不要臆造 ID、datasource、action、参数名或可选值。

## 按需参考

- 普通账户数据和周期对比直接使用核心规则。查询计划、商品、关键词、地域、时段、搜索词等细分报表，或用户明确询问原因、问题、优化或诊断时，读取 [报表与诊断](references/reports-and-diagnosis.md)。
- 用户要求修改、暂停、恢复、删除、创建、加删商品/关键词/标签或采纳建议时，读取 [写操作规则](references/mutations.md)。
- 需要用户从多个真实计划/选项中选择、需要写前确认，或复杂诊断适合可视化时，读取 [Accio 端交互](references/accio-interactions.md)。

没有命中上述场景时不要加载对应参考。

## 一、锁定产品范围

加载本技能前形成的产品线判断不生效。在首次业务工具调用前重新读取用户原话，并只根据原话锁定一次 `productScope`：

- 原话明确出现“标准推广”“手动推广”或“关键词”时锁定为 `search`；“关键词”包括关键词推广、搜索词或具体关键词分析。
- 其他情况一律锁定为 `wholeSite`，包括用户只说“P4P、直通车、广告、推广、计划”。不要把 P4P 或直通车当作标准推同义词，也不得将其扩写成“关键词推广”“标准推广”或“搜索推广”。
- 本轮不要因为结果为 0、诊断没有问题计划或证据不足而补查另一产品线。用户后续明确切换产品时才重新锁定。
- 用户或运行时已经给出真实计划及其 campaignType/productLineId 时，以该对象的真实类型为准；默认路由只用于尚未定位对象的根查询，不能覆盖已定位计划。

查询计划列表或定位计划时可以直接从 `campaign` 开始，不要先查 `company`：

| productScope | 首次计划查询 filters |
|---|---|
| `wholeSite` | `{"productLineId":"110106","summaryTypes":"wholeSite"}` |
| `search` | `{"productLineId":"110101","summaryTypes":"search"}` |

用户泛问“有哪些/查看/列出计划”，且未指定计划、状态、历史范围或“全部”时，视为无约束计划列表：首次 campaign filters 必须在上表基础上附加 `"onlineStatus":"1"`，只查询投放中计划，不得先拉全量再本地筛选，也不得补查非投放中计划。结果在本次查询返回内按 `gmtCreate` 从新到旧排序；真实入口暴露排序参数时使用该参数，否则直接在当前工具结果上排序，不为排序再次调用 workctl。用户明确要求全部、历史、已暂停、待投放、已结束或其他状态时，不附加默认 `onlineStatus=1`，按用户条件查询。

首次计划查询使用 `include=data` 和 `"page":{"index":1,"size":50}`。只有 `total>50` 才继续翻页；`workctl icbu ads list` 的分页参数是顶层 `page` Object，其内使用 `index/size`，不得传顶层 `pageIndex/pageSize`。账户资料或必须依赖账户级 link 时才查 `company`。

上述 campaign 根入口只用于“列计划、定位计划或计划操作”。账户级效果、地域、时段、商品来源、趋势和诊断都从对应 `report`/`diagnosis` 根实体直达，不要为了取得入口先查 campaign 或 company。

## 二、守住证据边界

最终结论只能来自工具明确返回的事实，以及对这些事实做出的差值、比例、排序等确定性计算。描述性回答固定为“查询范围 + 按工具字段名展示数据及确定性变化”；需要排序时只追加同名字段排序，不写小结或跨字段综合判断，不把指标改写成未查询的原因、质量、效率、行为或优化动作，也不发明概括这些指标的新业务概念。

用户未明确询问原因、问题、诊断或优化时，只回答查询范围、事实和确定性计算，不调用 diagnosis，不追加业务建议或 Widget。用户明确要求“只返回数据”时，禁止追加解释、诊断、计划列表和“下一步可选”。其他描述性查询在事实之后可追加“下一步可选（尚未执行）”，最多两个本技能已有的只读动作：查询当前问题的下一层证据，或查询服务端 diagnosis；账户事实优先计划维度，已定位计划优先真实 link 暴露的下层维度，用户要找原因时才列 diagnosis，已取得 operation 时只引导查看可修改项。写清将查询的对象或维度，不声称已找到原因、不设置优先级、不包含写入动作，也不自动执行；没有可靠后续能力时省略。

下一步引导固定使用“下一步可选（尚未执行）：”标题，动作从 `1.` 开始连续编号，最多到 `2.`；只有一个动作时也标 `1.`，不用无序列表。用户紧接下一轮只回复一个当前有效编号时，视为明确选择上一轮同编号的只读动作，直接执行，无需再次确认；如果编号不存在、上一轮没有编号动作，或该数字还可能是业务参数、计划 ID 等输入，则不猜测选择，要求用户说明目标。本轮展示选项时仍不自动执行。

用户明确询问时也只引用 report、diagnosis 或对应维度查询已返回的证据；证据不足就说明当前数据不能判断，不用经验补齐。

## 三、规划证据依赖

先把问题拆成取得答案所需的最小证据节点，再执行：

0. `workctl icbu ads list` 是本技能的已知业务入口。正常广告任务直接调用，不运行 `workctl schema`、`workctl --help`、`workctl icbu --help`、`workctl icbu ads --help` 或逐级子命令探查。只有命令真实返回“不存在/参数契约已变化”时，才允许做一次针对性发现；不得从根命令逐级探索。
1. 普通 `workctl icbu ads list` 的参数顶层必须是单个 JSON Object，最小形态为 `{"entityType":"<真实实体>","filters":{},"include":"all"}`；`entityType` 必填，不得用 `path` 代替。不得把 JSON Array、`steps` 或 `entityType=batch` 传给 `ads list`。
   账户 report 的 datasource 只按已锁定产品线选择：`wholeSite → company_whole_site`，`search → company_search`。其 filters 必须使用 `datasource`、`beginDateTime`、`endDateTime`，时间格式为 `yyyy-MM-dd HH:mm:ss`；禁止使用 `startTime`、`endTime`、`productLineId` 或 `summaryTypes` 代替。
   单次查询必须在一次 shell 工具调用内完成“准备参数 + 执行”，并优先使用 workctl 内置 `--jq`/`--fields` 裁剪结果，不要再接外部 `jq`。当前工具是 Bash 时固定使用 POSIX `/dev/stdin` 形式：`workctl icbu ads list --params-file /dev/stdin --format json --jq '<filter>' <<'JSON' ... JSON`，禁止在 Bash 中写 `$paramsPath`、`Join-Path` 或 `Set-Content`。Windows/PowerShell 或不支持 `/dev/stdin` 时，只有工具明确是 PowerShell 才使用 `$paramsPath = Join-Path $PWD 'ads-query.json'; '<json>' | Set-Content -Encoding utf8 $paramsPath; workctl icbu ads list --params-file $paramsPath --format json --jq "<filter>"`；workctl 能读取带 BOM 的 UTF-8 参数文件。不得先调用独立 `write` 工具落参数文件，再另起一轮 shell 执行。
2. `report` 返回待消费的动态 link/session/tableName。只查一个窗口的少量账户字段时，首个 report 固定追加 `--jq '{columns:[.data.result.structuredContent.data.data[0].tableMeta.schema[].name],invoke:([.data.result.structuredContent.data.links[]?|select(.name=="sql")|.invoke][0])}'`。先检查 `columns`：任一用户字段不存在就说明当前广告报表未暴露该字段并停止，禁止改查 campaign/company/diagnosis，禁止把缺失字段回答为 0。字段齐全时，每个范围必须连续完成 `report → report_sql → 保存最终数据`，再开始下一范围；动态 report 不进入 batch，也不并列调用多个动态 producer。动态报表的调度与校验见 [报表与诊断](references/reports-and-diagnosis.md)。
3. 只有不返回待消费动态句柄、参数完整且互不依赖的静态只读查询才使用 batch。Batch 是 CLI 编排命令，不是 HATEOAS entityType；batch spec 顶层为 Object，调用项放在 `steps` Array，step.path 使用点分命令路径（如 `icbu.ads.list`），并通过 `workctl batch call --file <batch.json> --format json` 执行。Batch 不支持步骤间变量引用。
4. 后一步依赖前一步返回的 link、ID、operation 或 params 时严格串行。同一次查询已经返回所需证据时直接复用；不要为了换 include、投影或排序重查同一查询，`include=all` 已覆盖 data、links 和 operations。
   任一 campaign 查询成功返回非空且已包含当前回答所需字段后，下一条 assistant 消息必须消费该结果或继续其真实 link，禁止再次提交相同 entityType、filters、include、分页的 campaign 查询；即使运行时会返回缓存，也视为一次不应发生的工具调用。
5. 只有真实 link、operation 或服务端错误要求新参数时才继续调用。用户指定的探查路径不是业务事实；路径中的 link 不存在但已有受支持的根实体时，改走该根实体。
6. 终止门禁优先于校验、建议和下一步引导：每个 `report_sql` 返回且范围校验通过后保留其最终行数据，不再重查。最后一个目标范围完成后，下一条 assistant 消息必须直接回答且工具调用数为 0；差值、比例和排序在回答中完成。
   `report_sql` 成功返回非空 `tsvData` 后，父 report 只视为已消费的句柄；禁止为了查看字段、确认 datasource 或恢复上下文，用相同 datasource 和时间窗再次查询 report。排序、Top 1、占比和汇总直接基于 `tsvData` 完成。
   对只需要一个 datasource 和一个时间窗的描述性报表任务，成功路径固定只有两个业务调用：`report → report_sql → 最终回答`。第二次调用返回非空行数据即进入终态，不存在第三次 report 调用；只有这两个调用之一明确失败时才允许按失败规则处理。
7. 用户仅问数据、变化、趋势、对比或排行时，完成用户点名维度的证据单元后立即回答；不得新增未点名的计划、商品、关键词、地域、时段或搜索词维度，也不得调用 diagnosis。

同一轮只读取一次 SKILL.md；同一参考文件只按需读取一次并复用。整个任务最多发送一条工具前进度；发出后，后续带工具调用的消息不再附带进度文案，除非执行路径发生用户需要知道的实质变化。不要为加载技能、查看帮助、每次 CLI 调用、重试或每层 HATEOAS 下钻重复播报。

多轮中用户说“刚才、继续、进一步”时，先复用对话中已经取得的 diagnosis、campaign 和最终报表证据。上一轮 `problemCampaigns` 为空且已列出候选计划时，用户未选择编号或计划就不重查 diagnosis/campaign，只复述最多两个编号选项并返回 `NEED_CONTEXT`；用户选定后才查询该计划 diagnosis。只有用户改变时间窗、产品线、对象，或明确要求刷新数据时才重新查询。

每轮规划工具前先执行选择门禁：如果上一轮已因缺少对象返回 `NEED_CONTEXT` 并列出编号候选，而当前输入没有给出有效编号、对象或刷新要求，本轮工具调用数必须为 0，直接复用原候选。不能为了“确认上下文”重查父级 diagnosis、campaign、report 或其他证据；该门禁优先于证据补查和通用诊断流程。

常见依赖关系：

```text
计划列表 → 选择计划 → campaign(include=all) → 子实体/报表/诊断/写操作
report 元数据 → report_sql link → 指标数据
campaign_product → productId 与 adgroupId → 删除确认
operation.invoke/可选 params → 有参数时校验 → 用户确认 → mutate → 回读
```

计划清单只需要名称、状态、预算、商品数等少数字段时，在首次原子 workctl 调用中使用 workctl 内置 `--jq` 投影。内置 `--jq` 在输出精简前接收完整成功 envelope，campaign 行数组固定在 `.data.result.structuredContent.data.data`，不得把终端已精简的 JSON 层级当成 `--jq` 的输入层级，也不得把根误当成裸数组。需要保留的真实字段为 `campaignId/campaignName/onlineStatus/gmtCreate/budget/onlineProductCount`；无约束计划列表使用 `.data.result.structuredContent.data.data | sort_by(.gmtCreate // "") | reverse | map({campaignId, campaignName, onlineStatus, gmtCreate, budget, onlineProductCount})`，在同一次投影中完成创建时间倒排。不要改写成 `id/name/status/productCount`，也不要因错误投影得到 null 后重查同一列表。若本轮目的只是给用户最多两个候选，在同一个 `--jq` 中完成筛选、排序和截断：`.data.result.structuredContent.data.data | (map(select(.onlineStatus == "1")) + map(select(.onlineStatus != "1"))) | map({campaignId, campaignName, onlineStatus, gmtCreate, budget, onlineProductCount}) | .[:2]`。`onlineStatus == 1` 即为投放中；数值 `1` 与字符串 `"1"` 按真实返回类型择一使用。成功后直接展示这两项，不得再查 campaign。

计划列表状态必须按原始字段组合解释，数值和数字字符串等价：

| 条件                    | 列表文案           |
|-----------------------|----------------|
| `onlineStatus == 1`   | 投放中            |
| `onlineStatus == 0`   | 投放中，但预算花完或账户冻结 |
| `onlineStatus == -1`  | 待投放            |
| `onlineStatus == -2`  | 已暂停            |
| `onlineStatus == -3` | 已结束            |

列表渲染和“投放中”候选筛选只看 `onlineStatus`，不查询、不展示、也不根据 `settleStatus` 改写状态。其他未知状态只展示原值，不自行推断。其他查询不为投影而投影，响应结构不确定时保留原始 JSON。

当前查询命中计划超过 20 条时，默认展示总数和按 `gmtCreate` 从新到旧的前 20 条，并说明未展开数量；用户明确查询多个状态时才补充状态分布。用户明确要求完整清单且 `total>page.size` 时，只查询尚未取得的后续页：递增 `page.index`，不得重查第一页。

计划描述无法唯一定位时，不要擅自选一个候选继续下钻。返回 2–6 个最可能的真实候选和区分信息，请用户只确认计划；若商品条件或词义也有歧义，一并用一句话说明。此时以已有计划证据返回 `NEED_CONTEXT`，不要通过逐计划试查来猜用户指的是哪个。

## 四、沿 HATEOAS 导航

1. 选定计划后，用真实 campaignId 和已锁定产品线查询 `campaign(include=all)`。
2. 下钻时逐字段照抄 `link.invoke` 的 entityType、filters 和 include，不根据名称自行拼接。
3. `report_sql` 必须逐字段复用刚返回的 invoke，不得自造 sessionId 或 tableName；仅当 `columns` 已明确包含用户点名字段时，才可用这些原字段名替换 sql1，中文或特殊字符字段必须加双引号。
4. follow `links[].invoke` 时优先原样复用 invoke；只有明确需要覆盖分页时才按当前 workctl schema 传顶层 `page` Object，并在其中设置 `index/size`。
5. 操作只认 `operations[].available`；不存在、为空或 `available=false` 都表示当前响应未暴露该能力，不得换 include 探测。
6. 写参数只从 operation.invoke 与 operation.params 构造，不跨实体类推。

工具结果已在本轮内联返回时直接消费，不再读取落盘副本。仅当返回明确说明正文被截断且只提供结果文件时，才读取该文件一次；不得为了查看同一结果增加一轮 `read`。

用户描述与查询事实冲突时，以查询结果为准并说明差异。

### 账户财务导航

用户查询广告余额、现金红包、卡券或赔付时，先查询 `company(include=all)`，只跟随其中唯一的 `accountFinance` link。该 link 的 `invoke.entityType` 必须是 `account_finance`；不要新增或猜测 `account_balance`、`account_finance_history` 等实体，也不要把一个 link 拆成多个自造入口。

`accountFinance.invoke` 是可直接执行的余额查询，默认 `historyTypes=[]` 且不含日期和分页。先复制 invoke；只有用户要求缩小账户或查询流水时，才按 `parameters` 声明的 `path/type/itemEnumValues/requiredWhen/omitWhen` 修改或增加字段，并保留 `include=data`：

- 只查余额：原样执行 invoke；用户指定账户时，仅替换 `filters.accountTypes`，继续保持 `historyTypes=[]`，不增加 `beginDate`、`endDate` 或 `page`。
- 查流水：一次只传一个 `accountTypes` 和一个 `historyTypes`，并增加 `beginDate/endDate`（`yyyy-MM-dd`，包含起止日）及顶层 `page.index/page.size`。
- 账户类型只认 `search`（标准推）、`recommend`（推荐推广）、`all_domain`（全站推）；流水类型只认 `cash_gift`（现金及红包）、`coupon`（卡券）、`compensation`（赔付）。不要使用未在对应参数 `itemEnumValues` 中出现的值，也不要增加 `parameters` 未声明的字段。

读取响应时先看 `metadata.aggregateStatus`，再以 `metadata.sourceStatuses` 中的扁平 key `{accountType}.{unit}` 定位来源；同 key 的错误在 `metadata.sourceErrors`。`FAILED` 或 `PARTIAL` 均不得解释成余额为 0 或没有流水。余额不分页；每类流水使用自身 `{data,total,page,size,hasMore}`，顶层 `total` 只是账户分组数，不是流水总数。用户问某类明细时只展示该类包络内的数据，不把其他成功来源补成目标来源。

## 五、任务状态机

### 只读查询

```text
识别意图 → 锁定产品 → 建立证据依赖 → 执行就绪证据节点
→ 串行跟随真实 link → 组织已查字段 → COMPLETE
```

- 缺少当前查询必需的对象且无法从真实列表定位时，返回 `NEED_CONTEXT`。
- 工具不可用或查询失败时如实说明，不用模型知识补齐账户状态。
- 数据为 0 仍要写明时间窗、分析维度和零值结论；仅在用户明确询问原因、诊断或优化时给验证方式。
- 已有部分可靠证据时，即使某个补充查询失败，也要先用已有证据完成可回答部分并标明缺口；不要要求用户提供 datasource、时间参数名、SQL 或其他服务端技术参数。

### 写入意图

```text
定位真实对象 → campaign/子实体(include=all) → 找到 available operation
→ 有 params 时校验 → 展示完整确认摘要 → NEED_CONFIRMATION
→ 用户后续明确确认 → mutate → query 回读 → COMPLETE/失败
```

- 用户最初说“修改、提升、暂停、删除”只表示写入意图，不等于确认。
- operation 不可用或真实 redirect 要求后台处理时返回 `EXTERNAL_PROCESS_REQUIRED`。
- 宿主声明只读、评测或演练时绝不调用 mutate，但 operation 可用且待确认仍返回 `NEED_CONFIRMATION`。
- 新建和克隆计划不在当前 HATEOAS 写能力内，直接引导至“卖家中心广告管理（BP/推广后台）”，不要发起无关查询。

## 六、回答要求

- 直接回答用户问题；描述性查询按“查询范围 + 字段数据及变化”输出，不追加总结段；可按证据边界追加“下一步可选（尚未执行）”。
- 回答范围以用户请求和已取得证据为边界。
- 诊断回答使用“诊断结论 / 问题与原因 / 下一步建议”，每条建议引用已取得证据。
- 诊断场景没有具体问题计划时，仍基于账户指标给出至少一条当前可执行的只读取证建议，并列出最多两个真实候选计划供用户选择。只有工具字段明确证明计划在投时才能称为“在投计划”。
- 诊断场景的多轮追问缺少问题计划时可返回 `NEED_CONTEXT`，但仍需说明已有归因和下一步建议。
- `problemCampaigns` 为空时，如已查询 campaign，当前轮最终答复必须直接用计划名称和 campaignId 按 `1.`、`2.` 列出最多两个真实候选；不能把候选替换成“查询计划 diagnosis/查询计划报表”等泛化动作。该规则优先于通用“下一步可选”模板。用户要求继续做问题计划诊断但尚未选择候选时，不把 campaign 状态、商品数或预算改写成原因、可能原因、背景或解释，也不直接建议修改投放设置；只复用上一轮候选等待编号，下一轮收到编号后再查询对应计划 diagnosis。
- 账户 diagnosis 返回 `problemCampaigns: []` 后若需要补查 campaign，该 campaign 查询的目的已经限定为生成最多两个候选，必须直接使用上文的“投放中优先 + 截断两项”投影；不得先返回全量投影，再换 `--jq` 重筛同一结果。
- diagnosis 没有返回具体问题对象或明确动作时，建议只能是继续查询某个证据维度或计划 diagnosis；不得根据花费、点击、商机、转化率的变化直接建议调整预算、出价、商品、关键词、地域或素材。campaign 字段只用于描述和选择对象，不能自行证明修改它会改善指标。
- “最近 N 天”按包含起止日的 N 个自然日构造，`endDate` 当天计入；`beginDate = endDate - (N - 1) 天`。用户只说“最近一个月”且未指定日期时，统一按最近 30 个自然日处理，即 `beginDate = endDate - 29 天`。答复中的时间窗必须与 report 返回的日期一致。
- 端侧交互只能按当前可见的原子工具启用；工具不可见时输出信息等价的 Markdown，不猜测客户端名称或运行环境。
- 金额使用 `¥`；不要输出 `...`、待补充、空表格或成功幻觉。
- 用户请求同时包含广告与非广告子任务时，先完成本技能可执行的广告子任务，再逐项声明非广告部分的能力边界；不得因为整单跨域而跳过广告查询，也不得要求用户重新描述已经明确的广告问题。
- 最终答复始终使用用户语言。不要输出英文分析草稿、工具探查过程或让用户补充内部参数；即使证据不足，也要给出已确认事实和明确缺口。

## 能力边界

- 不支持品牌广告、跨账户操作、新建或克隆计划。
- 下钻和操作能力以真实 link/operation 的 `available` 为准。
- 不因为计划类型经验判断操作一定可用，也不使用独立 knowledge 工具。
