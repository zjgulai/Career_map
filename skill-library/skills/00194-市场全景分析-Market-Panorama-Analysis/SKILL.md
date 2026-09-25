---
name: 市场全景分析
version: "2.20.8"
description: |
  针对一个品类/市场一次性跑全维度（规模+增速+竞争+国家+买家+趋势）分析，输出一份市场全景报告，给出「是否值得介入 + 如何切入」决策结论与行动清单。
  品类词是唯一必填输入：优先取 query 品类词，其次取商家主营品类画像，两者都拿不到才追问一次；目标市场默认全球、统计周期默认 30 天；一次执行聚焦一个品类/市场。
  只做品类/市场级全景概览与介入判断；不做竞品店铺发现与逐店拆解（此类诉求用竞品对标分析）、不做店铺经营数据分析、不做单一产品级选品验证、不执行发品与店铺操作本身。
enabled: true

triggers:
  - 市场全景
  - 市场分析
  - 市场怎么样
  - 值不值得做
  - 是否值得介入
  - 如何切入
  - 市场规模
  - 竞争格局
  - 买家画像
  - 市场机会
  - market analysis
  - market entry

examples:
  - 竹家具这个市场值不值得做？帮我出一份市场全景分析
  - 全面分析咖啡研磨器市场的规模、增速、竞争、国家需求、买家和趋势
  - 近一个月俄罗斯、墨西哥最畅销的工程机械零件是哪些？
  - 欧美市场晚礼服的买家偏好是什么？
  - 智能窗帘在国际站的优势潜力如何，有哪些切入机会？

excludes:
  - skill: alibaba-analysis-brief
    when: 用户分析自有店铺经营数据或经营指标，而非品类/市场全景
  - skill: alibaba-hot-product-insight
    when: 用户只要多平台热销榜单/爆品排行，没有市场全局或介入判断诉求
  - skill: alibaba-blue-ocean-finder
    when: 用户主诉求是找蓝海/供需错配/低竞争细分，而非完整市场全景
  - skill: alibaba-jungle-scout-deep-dive-analyzer
    when: 用户要 Amazon/ASIN/竞品/关键词的单品级深度选品报告
  - skill: alibaba-1688-product-research
    when: 用户要在 1688 找货源、找同款、图搜或链搜
  - skill: alibaba-competitor-analysis
    when: 用户要找标杆同行、竞品对标或定时监控指定店铺/商品，要求具体竞品对象

workflow: |
  Step 1: 语言检测 + 抽取品类（多品类/多市场分开要 → 引导先聚焦一个；仅品类无法确定时追问一次）+ Gap 前置比对
  Step 2: 并发跑全维度取数，失败按分层兜底降级
  Step 3: 汇总评分 → 写入全景报告 .md 文件 + XLSX 导出 + HTML 渲染 + 终止序列收尾 → 对话输出 summary + 追问段
---

# 市场全景分析（Market Panorama Analysis）

## 路由表（排他）

| 用户意图 | 走哪个 skill |
|---------|------------|
| 给品类/市场 → 看全局 + 是否介入 + 如何切入（含单维侧重，仍出全景） | **本 skill** |
| 单类目 8 维结构化深度报告 | alibaba-jungle-scout-deep-dive-analyzer |
| 找蓝海/供需错配/低竞争细分 | alibaba-blue-ocean-finder |
| 只要多平台热销榜 | alibaba-hot-product-insight |
| 分析自有店铺经营数据 | alibaba-analysis-brief |

## How to Use

- 流程主线：Step 1 槽位抽取（品类词唯一必填：query 品类词 → 主营品类画像 → 追问一次；目标市场默认全球、统计周期默认 30 天；一次执行聚焦一个品类/市场）+ Gap 前置比对 → Step 2 全维度并发取数（失败按分层兜底降级）→ Step 3 汇总评分 → 一次性写入全景报告 .md + XLSX 导出 + HTML 渲染 + 终止序列收尾 → 对话输出 summary + 追问段。
- 典型 query："全面分析咖啡研磨器市场的规模、增速、竞争、国家需求、买家和趋势"——任意维度侧重均走同一条全景主线，不拆单维。

> ★ **始终全景、永远一份报告**：用户给一个品类/市场就**一次性跑全维度**（规模+增速+竞争+国家+买家+趋势），先展开各维度，再给**「是否介入 + 如何切入」决策结论**，最后以行动清单收束全文。**不做意图判定、不做场景分支、不因用户只问某一维就降级为单维**——用户强调的维度只是"重点展开"，其余维度照常覆盖。
> ★ **完整报告写入 `.md` 文件，对话仅输出 summary + 追问段**。禁止在对话中输出完整报告。
> ★ **目标 3-5 分钟，报告交付是唯一目标**：第一阶段完成全部取数；第二阶段一次性写入报告；第三阶段 HTML 渲染。**两阶段严禁穿插**。
> ★ **工具/命令报错是降级信号，不是 bug**——按降级路径处理，不调试、不修 PATH。买家维度统一调用：`workctl workflow market fetch-buyer <cateId> --output buyer.json`（其余参数详见 `references/data-acquisition.md`）。
> ★ **禁止探测文件**——不用 head/cat/ls/grep/find/glob/list。数据处理统一走 workctl workflow market 命令链，references/ 命令直接复制执行，无需也无场景自写脚本。
> ★ **禁止编造任何数据**——无数据写 `-` 或省略，即使用户明确要求也不可编造。
> ★ **交付数值口径**：JSON 数值无值写 `null`（禁 `NaN`/`None`/`N/A`），文件一律 UTF-8 无 BOM（细则见 `references/export-render.md`）；`abCnt`/`abCntIdx` 只称「市场规模指数」，严禁说成「X 条询盘」「X 位买家」等询盘绝对量。
> ★ **数值口径三查（写入报告前逐项过，防失真）**：①单位换算不错位——web_search 来源的 K/M/B（千/百万/十亿）换算中文口径须核对量级（"5 billion" 是 50 亿不是 5 亿），换算后全文单位统一（如统一 USD 并注明）；指数值（`abCntIdx` 等）不得与金额/数量混算换算。②跨轮时点不混同——引用历史轮次/上一份报告的数值必须标注其统计周期与来源时点，不得与本次取数数据混排为同一口径。③精度保真——估算/区间值不得写成确定值（估算须带「约/预计」并配 🟠/🔴 徽章）；实测值保留工具输出原始精度（如 12.3% 不简写为 12%），不得对精确值追加「约」类模糊词。
> ★ **禁止猜测命令/禁止 `&&`/禁止创建 Task/禁止读其他 skill 文件**——报错时允许 `--help` 重试一次；重试以错误 envelope 的 `retry_policy` 为准（`retryable:false` = 确定性失败 → 立即转降级路径；无 `retry_policy` 则同参数同错再次失败即降级），目标是恢复而非重复；每次 workctl 独立执行；单轮执行；结构化参数（JSON 数组/对象）走 `@file` 或 `--json-file` 文件通道（先 write 后引用），`@file` 值用双引号包裹（PowerShell 会把行首 @ 解释为 splatting），禁止命令行内联。
> ★ 不要暴露内部工具名、参数、评分公式。报告中用平台名（“阿里巴巴国际站市场数据”等）。
>
> 文件写入白名单、工具调用范式、JSON/编码规范详见 `references/export-render.md`。

## Bilingual: CJK（U+4E00–U+9FFF）→ `zh`，否则 → `en`。报告语言跟随用户 query 语言。

---

## When to Use / When NOT to Use

| ✅ 适用 | ❌ 改用其他 skill |
|------|------|
| 给品类/市场要"看清全局 + 是否值得介入 + 如何切入" | 8 维深度报告 → deep-dive |
| 综合行业/市场规模 + 增速调研 | 纯热销榜 → hot-product-insight |
| 热销 TopN + 国家 + 买家 + 趋势（任意侧重，仍出全景） | 蓝海 → blue-ocean-finder |
| 单品/赛道在国际站的优势潜力评估 | 店铺经营 → analysis-brief |

> 店铺发现/逐店拆解诉求转 alibaba-competitor-analysis（其支持店铺发现、筛选、监控与逐店拆解，无需用户预先提供店铺链接）；用户无竞品对象诉求、仅想了解该店主营品类的市场面时，才按其主营品类转全景分析。

---

## Step 1: 槽位抽取（最小追问）

> ★ **能不问就不问。** 只有「品类」是硬前提；市场、周期用默认值静默填充。多目标引导（下方 ⚠️ 多目标判定）在进入流程前执行，不计入追问。

| 槽位 | 必填 | 缺失处理 |
|------|-----|---------|
| `category` | ✅ | query 品类词 → 画像品类 → **追问一次**（唯一允许追问的情况） |
| `target_market` | ❌ | 静默默认全球 |
| `period` | ❌ | 静默默认 30d。仅作口径提示，不改变取数窗口（30d 统一口径约定详见 `references/data-acquisition.md`「Gap 声明」段）；非 30d 请求按下方 Gap 前置比对声明 |

> ⚠️ 除"连品类都无法确定"外，**任何情况都不得追问**。用户只问某一维时，该维重点展开，其余仍跑全。
> ⚠️ **多目标判定**（进入取数前执行）：请求含**多个品类**（如"保温杯+竹家具"）或要求**多个市场分开各出一份**（如"美国、欧洲各出一份报告"）→ 一次市场全景分析聚焦一个品类/市场，引导先选一个执行（其余可随后逐个发起），**不拆成多份报告在本轮并跑**。措辞 = 一句话说明 + 一个引导问句（如："市场全景分析一次聚焦一个品类/市场，您想先看保温杯还是竹家具？看完可再发起下一个。"）。多国对比（如"俄罗斯、墨西哥"同一份报告内看）与"欧美市场"这类合并表述**不属多目标**，照常跑全景（`country_rank` 一次返回全部国家）。
> ⚠️ **Gap 前置比对**（正常路径也执行，不止降级场景）：识别用户请求的时间窗/市场/平台覆盖，与取数口径比对（口径约定——30d 统一窗口、买家 7d/30d、Amazon marketplace 仅 us/uk/de/jp——见 `references/data-acquisition.md`「Gap 声明」段）。不可得项在报告顶部（数据来源行下方）+ 对应 section 强制标注口径（如「⚠️ 用户请求 7 天窗口，本报告统一按 30 天口径呈现（保证各维度数据可比）」），summary 明说。

---

## Step 2: 多源数据获取（全维度并发）

1. **读取 `references/data-acquisition.md`**，遵守其中「取数执行纪律」。
2. **类目预测只做一次**：`data_advisor_category_infer` 取 cateId 后复用至全部维度。唯一合规的二次调用场景 = `cateDesc` 相关性复核重试（结果不相关才重试，最多 2 次，**结果相关即止**，见 `references/data-acquisition.md` Phase 0）——复核式/补充式重复调用仅限此通道，其余场景一律复用已取得的 cateId。
   - **query 精简规则**：传给 `--categoryDesc` 的必须是核心品类词（1-3 个），去修饰词。
3. **并发执行**六大维度取数（`workctl batch call` 或并行 tool_call）——**分批调度以 `references/data-acquisition.md`「并发分组」调度总注为准：采集阶段（取数/write）并行、导出/收尾按既有串行纪律；站外块 B web_search 与站内批 1 各自汇聚同批一次性发出，禁止按维度拆批串行**：

   | 维度 | 主工具 |
   |------|--------|
   | ① 行业规模+增速 | `web_search` + `market_detail` + `market_trend` + `cate_rank` |
   | ② 竞争格局+TopN | `product_selection` + `seller_portrait` |
   | ③ 国家需求 | `country_rank` + `web_search` |
   | ④ 买家画像 | `workctl workflow market fetch-buyer`（禁手工散调） |
   | ④½ 机会发现 | `opportunity_discovery` |
   | ⑤ 站外验证 | `js_product_database_query` + `web_search` |
   | ⑥ 趋势热点 | `web_search` |

4. **数据处理**：全部用 `workctl workflow market extract-*` 命令（stdout JSON），**不要 read_file 读结果文件**（例外仅 `buyer.json`/`amazon_buyer.json`，消费口径见 `references/data-acquisition.md`）。
5. **汇总评分**（必须执行）：`workctl workflow market score`，§6 结论必须基于评分输出。**豁免口径**：L3 全量降级（workctl 完全不可用）时 score 客观无法执行 → §6 改为基于 web_search 的定性判断，并在 §6 结论处显式标注「⚠️ 评分未执行（数据工具不可用）」。**单点失败同口径**：workctl 可用但 score 本身单次调用报错/输出残缺（缺 `label`/`reasoning` 关键键）→ 同走 web_search 定性判断，标注「⚠️ 评分未执行（评分命令报错/输出残缺）」，不排查原因、不做参数变体重试（按 `references/data-acquisition.md`「错误即降级信号」降级触发点纪律）。**score 成功但 `missing_dimensions` 非空**（该形态语义见 `references/data-acquisition.md`「汇总评分」段）→ 非豁免，§6 正常使用评分输出，并在评分结论处标注「⚠️ {维度} 维度数据缺失，未参与评分（confidence 已降级）」（{维度} 逐一取自 `missing_dimensions` 数组）。

> ⚠️ 市场参谋命令若返回"命令不存在"，按 `data-acquisition.md` 降级路径处理。**任一维度失败不阻塞其余维度**。

> ### 何时进入 Step 3
> 六大维度是否都有了结果（成功/降级/确认不可用）→ 全部有结果即进入报告写入。
> 🔴 **④买家维度特判**：必须走 `workctl workflow market fetch-buyer`（含父类目回退）。
> **每维最多试两轮**：主工具 → 扩展词重试 → 降级路径 → 完成。

### 降级状态机

| 状态 | 事件 | 动作 | 下一状态 |
|------|------|------|----------|
| 主工具 | 成功 | 记录数据 | 维度完成 |
| 主工具 | 失败 | 精简/扩展词重试（≤2次） | 重试 |
| 重试 | 仍失败 | 调用 fallback | fallback |
| fallback | 仍失败 | web_search 定性补充 | 降级完成(🟠/🔴) |

---

## Step 3: 汇总 + 写入全景报告

> ⛔ **进入本步骤后禁止发起任何工具调用**（例外仅限六类：① XLSX 导出 `export-xlsx`（含其输入 `report_data.json` 的 write）；② HTML 渲染 `render-report`（用户显式排除章节时带豁免参数调用，见豁免条款）；③ 终止序列用 write 工具生成收尾文件 `manifest.json` / `direct_answer.md`；④ 终止序列交付 `present_files`；⑤ 完成闸门/阻断式自检未过时的报告修正——用 write/edit 工具修正已写出的报告 `.md` 或补降级标注（`references/checklist.md`「报告数据一致性闸门」修正出口），修正后按 `references/export-render.md` 终止序列步骤 3 原则同步受影响的收尾文件；⑥ 响应用户显式指定替代交付形态的必要工具调用（如用户明确只要 .md 报告不需要 HTML → 豁免渲染，summary 标注按用户要求执行）——仅限用户显式指令，agent 不得自行认定或扩大）。报告写入必须一次性连续输出（超长被截断时按 `references/export-render.md`「超长报告分段写入」处理，分段写入不属多次报告）。

### 全景报告输出结构

```
# 《[品类][市场]市场全景分析》
> 数据来源：[实际成功来源 + 时间] | 分析方式：[数据/AI推断]

## 1. 行业规模 & 大盘增速（web_search 宏观为主体 + 站内数据表格补充）
## 2. 竞争格局（TopN 含缩略图+链接 / 价格带 / 卖家画像）
## 3. 目标国家需求分布（5 列表格 |#|国家/地区|需求强度|规格/款式偏好|文化/季节背景|，N=实际返回数，最多 10）
## 4. 买家画像 & 痛点（站内数据为主）
## 5. 机会与切入路径（只分析机会，不做决策/行动）
## 6. 决策结论（是否介入 + 如何切入 + 风险提示，基于 score 输出）
## 7. 行动清单（编号行动项 + 推荐商品表 + 下游技能入口）
```

> - 七大 section 全部保留，不因用户侧重或数据缺失删段（数据缺失按降级标注，不删段）。
> - **用户显式指令豁免（原则本体）**：用户在本次请求中的**显式指令**优先于本 skill 的模板默认——仅限用户明确表达的内容（如显式排除某章节「不要行动清单」「不需要决策结论」、指定展示范围如维度③「全部国家/排名区间」），agent 不得推断、暗示或主动建议删段。被显式排除的章节可省略：在原位置标注「（按用户要求省略）」、summary 明说，该章节的数据来源行/降级标注义务随之免除；其余章节照常承担全部义务。省略任一标准章节时**渲染带豁免参数**（`render-report --allow-missing-sections`，HTML 照常产出、缺节由渲染器在 HTML 顶部自动标注，.md 兕底仅在渲染失败时启用，详见 `references/export-render.md`「HTML 报告渲染」豁免渲染分支）。
> - §2 TopN 含 `![img](imageUrl)` + `[名称](productUrl)`；§3 必须为表格，5 列与 XLSX `country_demand` 4 键 country/strength/preference/background 映射（# 为序号列）；strength 对应 `abCntIdx` 指数口径，preference/background 需 agent 归纳（定义见 `references/data-acquisition.md` 维度③）。
> - §5 只说"有什么机会"，§6 说"要不要做、怎么做"。
> - §1-§4 逐段末尾附 `> 数据来源：` 行。
> - 标题格式：`《[品类][市场]市场全景分析》`，无特殊连接符。
> - 报告标题避免文件系统非法字符（`: / \ ? * " < > |`）及半角括号 `( )`（Markdown 链接 `](url)` 语法在 `)` 处截断，含括号的文件名会使交付链接失效；需要括注时用全角（）或短横线），确保标题可直接作为文件名且可作为 Markdown 链接。

### 表格格式规则

每行 `|` 开头结尾；分隔行只用 `|` `-` 空格；表格前后各一空行；列数一致；价格纯数字标单位；区间用 `-`；全 `-` 列删除。

### 数据来源摘要

报告顶部只列**实际成功贡献数据的来源** + 时间。禁止出现失败/降级等过程性说明。

### XLSX 导出 + HTML 渲染 + Manifest

详见 `references/export-render.md`（导出步骤、渲染步骤、交付规则、Manifest visibility 映射、summary_path 回退、终止序列）。

### 对话追问（必须出现）

详见 `references/followup-rules.md`（URL 发品白名单、场景 A/B 判定、输出格式、交付单元绑定）。

> ⛔ **终止序列完成、summary + 追问段输出后立即停止**——不再发起任何工具调用。收尾文件生成顺序与闸门确认时机见 `references/export-render.md`「终止序列」。

---

## 错误处理与降级交付

- **L1 单维降级**：该维走状态机，其余照常。
- **L2 多维降级**（≥3 维失败）：保留全部 section，§6 前列未覆盖项+重试引导。
- **L3 全量降级**：web_search 出通用策略，顶部标 ⚠️。**score 豁免口径**：workctl 完全不可用时 score 客观无法执行 → §6 改为基于 web_search 的定性判断，并在 §6 结论处显式标注「⚠️ 评分未执行（数据工具不可用）」。

降级铁律：部分交付 > 全有或全无（降级后仍要交付）| 不调试、不搜索修复，失败即走降级路径 | 每维最多两轮，数据 Gap 声明按 Step 1 前置比对执行（正常路径与降级场景都执行）。

各维度降级路径速查表详见 `references/data-acquisition.md`。

---

## 完成闸门 + 自检

详见 `references/checklist.md`（完成闸门硬检查 + 阻断式自检验收 + MA 特有自检项）。

---

## Dependencies

| Tool | Purpose |
|------|---------|
| `data_advisor_industry_cate_rank` | 站内行业大盘/子类目排名 |
| `data_advisor_industry_country_rank` | 站内国家需求排名 |
| `data_advisor_industry_market_detail` | 站内行业规模/增速/转化/供需 |
| `data_advisor_industry_market_trend` | 站内行业趋势时间序列 |
| `data_advisor_industry_seller_portrait` | 站内卖家画像 |
| `data_advisor_industry_buyer_profile` | 站内买家画像 |
| `data_advisor_industry_buyer_channel` | 站内买家渠道偏好 |
| `data_advisor_industry_crowd_insight` | 站内人群洞察 |
| `data_advisor_category_infer` | 类目预测（cateId） |
| `data_advisor_product_selection` | 站内商品排行 TopN |
| `data_advisor_opportunity_discovery` | 站内机会发现 |
| `js_product_database_query` | Amazon 需求数据 |
| `web_search` | 趋势/资讯/fallback |
| `product_supplier_search` | 站内供给兜底 |
| `workctl workflow market fetch-buyer` | 买家画像统一取数（profile/channel/crowd + 父类目回退） |
| `workctl workflow market extract-*` | 数据提取 |
| `workctl workflow market score` | 4D 市场机会评分 |
| `workctl workflow market export-xlsx` | XLSX 导出 |
| `workctl workflow render-report --skill ma` | HTML 渲染（用户显式排除章节时追加 `--allow-missing-sections` 豁免参数，见 `references/export-render.md`「HTML 报告渲染」豁免渲染分支） |
| `read_file` | 读 `fetch-buyer --output` 落盘的 `buyer.json` 控制字段 + `product-database-query --output` 落盘的 `amazon_buyer.json` 评分/评论分布（禁止 read_file 读结果文件的仅有的两个例外，口径见 `references/data-acquisition.md`） |
| `ask_user` | 品类词缺失时追问一次（唯一允许追问的场景） |
| `present_files` | 终止序列交付 user 可见文件 |

---

## Examples

> 所有问法**都走同一条全景主线**，差别仅在用户强调的维度重点展开。命令来自 `references/data-acquisition.md`。

**"竹家具这个市场值不值得做"**（标准全景）
- Phase 1：类目预测 → 全维度并发（复用 cateId）→ 汇总评分
- Phase 2：一次性写入 7 段报告 + XLSX 导出
- Phase 3：HTML 渲染 → 终止序列（收尾文件 + 闸门确认 + present_files 交付）→ summary + 追问段

**任一维度数据为空/失败**（兜底）
- Phase 1：主工具失败 → 重试 → 降级 web_search
- Phase 2：缺数据段标"⚠️ 基于公开来源估算"，保留全部 7 段标题
- Phase 3：HTML 渲染失败则降级标注，.md 兜底交付；XLSX 导出失败则降级标注（无替代交付物，交付清单 ❌ 项标注「无替代交付物」）

> 📖 场景化示例（榜单/国家/买家单维侧重、非 30d 时间窗）见 `references/examples.md`——**用户请求命中以下任一场景时先读该文件**：侧重单一维度的问法（TopN 榜单 / 指定国家 / 买家偏好），或请求时间窗 ≠ 30d。均与上方标准全景同走一条主线。
