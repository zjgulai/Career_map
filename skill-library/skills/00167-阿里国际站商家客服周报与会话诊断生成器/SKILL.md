---
name: alibaba-global-chat-analysis-pro
version: "2.0.0"
description: |
  Alibaba.com merchant chat analysis and weekly diagnostic report generator. Deeply integrates store reception data with real conversation content to review salesperson response performance, inquiry buyer insights, and communication quality. Performs full-conversation Pipeline stage diagnosis (Inquiry → Quotation → Negotiation → Won → Fulfillment → Lost), highlights discovery, and issue detection to help merchants achieve data-driven operations and improve inquiry-to-order conversion.（阿里国际站商家客服周报与会话诊断。深度打通店铺接待数据与真实会话内容，复盘业务员响应表现、询盘买家洞察与沟通质量，进行 Pipeline 阶段诊断、沟通亮点发现与问题诊断，助力数据驱动运营，提升询盘到订单的转化率。）Use when: user asks to generate customer service weekly report, analyze reception data, review communication quality, diagnose conversation issues, analyze inquiries, or improve message/inquiry conversion rate. 用户要求生成客服周报、分析接待数据、复盘沟通质量、诊断会话问题、查看询盘情况、提升消息/询盘转化率。Do NOT use when: user only needs to configure AI auto-reception strategy or fence rules (use auto-reception-setting skill); user only needs a single buyer profile (use buyer-profile skill).
workflow: >
  确定时间范围 → 采集诊断数据与会话数据（MCP工具） → 检测用户语言 → 使用并行子任务（subagent/map）逐个买卖家关系对深度测评（Pipeline阶段定位+订单识别+亮点发现+问题诊断） → 汇总整体接待数据/业务员接待分析/询盘买家分析 → 若回复率指标差则查询 Auto reception 配置并诊断 → 按模板输出Markdown周报（含自动接待引导建议）
enabled: true
---

# Alibaba.com Seller Chat Analysis & Weekly Diagnostic Report / 阿里国际站商家客服周报与会话诊断生成器

本 Skill 帮助阿里国际站 B 端商家自动生成客服周报，汇总诊断数据与真实会话内容，提供运营洞察和改进建议。本版本深度融合了基于真实会话内容的诊断能力，将 Pipeline 阶段分布、沟通亮点与问题诊断无缝嵌入到整体接待数据与业务员接待分析中。

This Skill helps Alibaba.com B2B merchants automatically generate customer service weekly reports, consolidating diagnostic data with real conversation content to provide operational insights and improvement recommendations.

## When to Use

| 用户意图 / User Intent | 中文示例 | English Examples |
|------------------------|---------|-----------------|
| 生成客服周报 / Generate CS weekly report | "生成上周周报"、"帮我生成客服周报" | "Generate last week's report", "Create a customer service weekly report" |
| 分析接待数据 / Analyze reception data | "查看上周客服绩效"、"分析上周聊天数据" | "Analyze last week's chat data", "Show me customer service performance" |
| 复盘沟通质量 / Review communication quality | "帮我分析复盘业务上一周的所有沟通" | "Review all communications from last week", "Analyze reply quality and depth" |
| 诊断会话问题 / Diagnose conversation issues | "帮我诊断一下最近的会话接待质量" | "Diagnose recent conversation quality", "Check reception issues" |
| 分析询盘情况 / Analyze inquiries | "帮我分析今日的询盘情况" | "Analyze today's inquiries", "Summarize inquiry and TM conversations" |
| 提升转化率 / Improve conversion rate | "帮我提升询盘转化率" | "Tell me how I can improve conversion rate of messages and inquiries" |
| 综合分析 / Comprehensive analysis | "帮我做一下店铺接待诊断跟询盘分析" | "Run a full store reception diagnosis with inquiry analysis" |

## When NOT to Use

| 场景 / Scenario | 原因 / Reason | 建议替代 / Alternative |
|----------------|--------------|----------------------|
| 仅配置 AI 自动接待策略/围栏 | 本 Skill 聚焦诊断分析，不负责策略配置 | auto-reception-setting skill |
| 仅查看单个买家画像 | 本 Skill 面向店铺/团队级分析 | buyer-profile skill |
| 仅需实时监控数据看板 | 本 Skill 生成离线报告，非实时看板 | 平台后台数据面板 |
| 修改知识库或 AI 回复模板 | 本 Skill 仅输出诊断和建议，不执行配置变更 | knowledge-base skill |

## 功能概览

本 Skill 生成的报告包含三大核心模块：

- **整体接待数据**：分别展示全量买家和 L1+ 买家的店铺核心指标与行业对比，结合真实会话的 Pipeline 阶段分布和转化漏斗（AB → Order），全面评估店铺整体商机转化效率。
- **业务员接待分析**：分别展示全量买家和 L1+ 买家范围下各客服的绩效指标，结合真实会话的沟通亮点发现与问题诊断（按严重程度分组），并支持多子账号的客服表现横向对比。
- **询盘买家分析**：基于真实会话的询盘总揽、客户全览、产品热度分析。

## 触发指令

当用户说出以下类型的话时，自动激活本 Skill：

**中文触发**：
- "生成上周周报"
- "帮我生成客服周报"
- "我要一份沟通数据周报"
- "生成周度诊断报告"
- "查看上周客服绩效"
- "分析上周聊天数据"
- "帮我分析复盘业务上一周的所有沟通"
- "抓取上周的询盘及TM沟通内容，帮我做客户分析"
- "帮我分析最近一周各个业务的回复沟通质量和深度"
- "帮我分析今日的询盘情况"
- "运用技能统计分析今天和昨天的询盘+TM"
- "分析阿里国际站最近一周接待数据以及询盘客户情况"
- "帮我做一下店铺接待诊断跟询盘分析"
- "帮我诊断一下最近的会话接待质量"

**English triggers**：
- "Generate last week's weekly report"
- "Analyze customer service performance"
- "Review communication quality for my sales team"
- "Diagnose recent conversation reception quality"
- "Analyze today's inquiries"
- "How can I improve my inquiry-to-order conversion rate"
- "Tell me how I can improve conversion rate of messages and inquiries"
- "Run a full store reception diagnosis"
- "Summarize last week's chat data and inquiry analysis"

## Multilingual Output Support

**语言检测规则**：在 Step 1 中检测用户输入语言，后续所有报告文本跟随该语言输出。

- 检测到中文（含CJK字符）→ 报告使用中文
- 检测到英文 → 报告使用英文
- 检测到其他语种（日文、韩文、西班牙文等）→ 报告使用对应语种
- 无法识别 → 默认使用英文

**功能名词保持英文不翻译**：以下术语在任何语言的报告中均保持英文原文：
- Pipeline 阶段名：Inquiry、Quotation、Negotiation、Won、Fulfillment、Lost
- 平台概念：GGS、Trade Assurance、MOQ、PI
- 角色标识：Seller、Buyer、AI Autopilot

## 核心工作流程

### Step 1. 确定时间范围与语言检测

**自动计算日期**：
- 当前日期为基准，按照用户要求，计算他所需要的时间段的日期。
- **默认时间范围：当用户未指定具体时间段时，默认分析最近一周（当前日期往前推7天）。**
- 常见时间范围：单日（如“今日”、“昨天”）、多日（如“最近3天”）、一周（如“上周”）。
- 格式：YYYY-MM-DD。
- **重要**：后续所有数据查询的时间范围应与此处确定的范围一致。

**语言检测**：
- 分析用户输入文本，确定输出语言（参见 Multilingual Output Support 章节）。
- 将检测结果记录为 `output_lang`，后续所有步骤的文本输出均使用此语言。

### Step 2. 数据采集

使用以下 MCP 工具查询数据：

#### 2.1 诊断数据接口（仅主账号）

**重要**：以下诊断数据接口**仅使用主账号**查询，子账号无需查询。

1. **店铺维度诊断**：`query_seller_shop_dim_diag_data`
2. **账号维度诊断**：`query_seller_acct_dim_diag_data`
3. **聊天质检明细**：`query_seller_chat_quality_check_detail`

店铺维度和账号维度必须分别采集并展示两套买家范围：`buyerType=0` 为全量买家，`buyerType=1` 为 L1+ 买家，禁止合并、相减或互相补值。`replyTime` 的原始单位是小时，直接参与均值计算并按小时展示，禁止乘除换算；`replyTime=0` 是有效值，`fiveMinReplyRate=0` 表示没有买家在 5 分钟内获得极速回复，二者都不得视为空值。

聊天质检成功返回空数组表示本周期未发现质检问题。此时应输出「本周期未发现质检问题（0 条）」，不得当成数据缺失；只有工具调用错误或返回不完整时才按异常处理。

#### 2.2 会话数据接口（用于询盘买家分析与会话深度诊断）

**账号说明**：
- 会话数据需要查询**主账号和所有子账号**。
- 子账号信息通过 `subaccount_query` 接口动态获取。

1. **查询最近会话列表**：通过 MCP 调用 `mcp_icbu-im-server_query_recent_conversation`
2. **查询会话消息内容**：通过 MCP 调用 `mcp_icbu-im-server_query_conversation_msg`

### Step 3. 数据汇总与深度诊断分析

> **执行方式**：本步骤的会话深度诊断部分**必须使用并行子任务（subagent/map）执行**。将每个买卖家关系对的会话作为独立子任务分发，确保每个会话获得充分的上下文空间和分析深度。每个子任务的分析步骤为：
> 1. **Pipeline 阶段定位与订单状态识别**（同一步完成）：识别会话所处 Pipeline 阶段，同时判断订单状态（has_order / is_paid）。订单卡片的两层判断是 Pipeline 定位的核心依据，两者不可拆分。
> 2. **沟通亮点与问题诊断**：识别亮点和问题，含严重程度、问题类型、证据引用、改进建议。
> 3. **输出结构化 JSON**：返回 pipeline_stage、has_order、is_paid、highlights、issues 等字段。
>
> 主任务汇总所有子任务结果后整合到报告中。

#### 3.1 整体接待数据汇总（融合 Pipeline 阶段分布）

1. **店铺基础指标**：分别计算全量买家和 L1+ 买家范围内的均值指标与行业对比（5分钟回复率、平均回复时间等）。平均回复时间单位固定为小时，原始值直接展示，不换算。
2. **Pipeline 阶段定位与订单状态识别（覆盖全部商机，一体化判断）**：
   - **必须分析全部获取到的会话，不可抽样。**
   - **分析范围**：Pipeline 分布统计覆盖时间范围内**所有有消息往来的会话**，包括新商机（首次询盘）和存量商机（老客户持续沟通）。
   - **Pipeline 阶段与订单状态是同一判断过程**：分析每个会话时，同步完成 Pipeline 阶段定位和订单状态识别，因为订单卡片的两层判断（has_order / is_paid）本身就是 Pipeline 阶段定位的核心依据之一：
     - 会话中出现订单卡片 → has_order=Y → 至少为 Won（阶段4）
     - order status 为 TO_BE_DELIVER 及之后状态 → is_paid=Y → 若讨论发货/物流则为 Fulfillment（阶段5）
   - **新商机**：根据会话内容从头判断 Pipeline 阶段（Inquiry → Quotation → Negotiation → Won → Fulfillment → Lost）。
   - **存量商机**：对于非首次询盘的老客户会话，基于**当前时间窗口内的买卖家会话语义**（包括订单卡片的自然语言描述）推断当前所处阶段。
   - 详见 `references/pipeline-stages.md` 中的「阶段判断规则」和「订单卡片识别规则」。
   - 汇总各阶段会话数量，计算转化漏斗：AB → Order。
   - **Pipeline 表格排序**：表格行必须严格按 Pipeline 阶段顺序从上到下排列：Inquiry → Quotation → Negotiation → Won → Fulfillment → Lost。即使某个阶段会话数为0，也应保留该行。

#### 3.2 业务员接待分析汇总（融合亮点、问题与子账号对比）

1. **客服基础指标**：分别在全量买家和 L1+ 买家范围内按客服统计新买家总数、回复率、回复时长等；回复时长单位固定为小时。
2. **子账号检测与对比**：
   - 检查会话数据中是否存在多个子账号。
   - 若子账号数量 >= 2，触发客服表现对比，横向对比各客服的转化率、问题密度、亮点密度及首响时间。
3. **沟通亮点发现**：
   - 识别高效执行、主动推进、灵活应变、专业展示、客情维护、信任建立等 6 类亮点。
   - 每个亮点需输出：亮点类型、所在 Pipeline 阶段、子账号名称（如有）、买家ID、描述、会话证据。
4. **问题诊断**：
   - 识别答非所问、态度生硬、信息遗漏等 9 类问题，详见 `references/issue-taxonomy.md`。
   - 每个问题需输出：严重程度（严重/中等/轻微）、问题类型、所在 Pipeline 阶段、回复角色、子账号名称（如有）、买家ID、问题描述、会话证据、改进建议。

#### 3.3 询盘买家分析汇总

1. **询盘总揽**：按国家分组统计询盘类型。
2. **客户全览**：提取客户名、国家、咨询产品、需求量、意向信号等。
3. **产品热度分析**：按产品分组统计询盘次数和主要来源国。

#### 3.4 Auto reception 配置诊断与引导（条件触发，强制执行）

> **触发条件**：当 Step 3.1 中的店铺基础指标满足以下**任一**条件时，**必须（MUST）执行本步骤，不可跳过或仅在文字中提及**：
> - 5分钟回复率低于行业平均
> - 平均回复时间显著高于行业平均
> - 会话诊断中发现多个「响应慢」类问题（参见 issue-taxonomy.md 第5类）
> - 存在买家因等待过久而流失的会话（Lost 阶段且有响应慢证据）
>
> 如果以上条件均不满足，跳过本步骤。

> **❗ 执行红线：触发条件满足时，绝对不允许仅在报告中笼统地写「建议配置自动接待」。必须先调用工具查询当前配置，再基于查询结果给出具体的「当前配置 → 目标配置」对比。没有调用 `query_ggs_contact_setting_info` 就不得给出 Auto reception 相关建议。**

**强制执行流程（每一步都必须完成）**：

**步骤1：调用工具查询当前配置（MUST）**

调用 `query_ggs_contact_setting_info` 获取商家当前的自动接待配置状态。必须实际执行工具调用，不可跳过或假设。查询并记录以下信息：
- Auto reception 总开关是否已开启
- 主账号的自动接待状态
- 每个子账号的自动接待状态（开启/关闭）
- 自动回复条件配置（买家类型、报价、样品请求等）
- 转人工场景配置

**步骤2：诊断配置充分性**

基于查询结果，逐项诊断当前配置是否足以应对接待需求：

| 诊断维度 | 判断标准 | 配置不足的表现 |
|---------|---------|---------------|
| 开关状态 | Auto reception 是否已开启 | 未开启或仅部分账号开启 |
| 账号覆盖 | 所有活跃子账号是否都启用了自动接待 | 有活跃子账号未开启，导致该账号的买家无法获得自动回复 |
| 回复条件 | 自动回复条件是否覆盖常见询盘场景 | 条件过窄，大量询盘未被自动接待覆盖 |

**步骤3：在报告中输出「当前配置 → 目标配置」对比（MUST）**

在报告的「总结与改进建议」模块中，必须输出完整的 Auto reception 诊断分析，包含以下三个部分：

**部分1：问题背景（用数据说明为什么需要 Auto reception）**
- 当前 5 分钟回复率、平均回复时间 vs 行业平均
- 因响应慢导致的具体影响（如 N 个买家等待超过 XX 小时，N 个会话因此流失）

**部分2：当前配置 vs 目标配置对比表（核心输出）**

必须以表格形式展示，让商家一目了然地看到差距：

```markdown
| 配置项 | 当前配置 | 建议目标配置 | 说明 |
|---------|---------|---------------|------|
| Auto reception 总开关 | 未开启 / 已开启 | 开启 | ... |
| 主账号 [XX] | 未开启 / 已开启 | 开启 | ... |
| 子账号 [XX] | 未开启 / 已开启 | 开启 | 该账号本周有 N 个买家等待超过 XX 小时 |
| 子账号 [YY] | 已开启 | 保持 | 已配置，无需调整 |
| ... | ... | ... | ... |
```

表格必须基于 `query_ggs_contact_setting_info` 的实际返回数据填写，不可用占位符或笼统描述替代。

**部分3：引导文案（固定格式）**

在对比表之后，附上可操作的引导语：
> 您可以回复「帮我开启自动接待」或「Turn on Auto reception」来快速配置。

**注意**：本 Skill 仅负责查询和诊断 Auto reception 配置，**不执行开启或修改操作**。当商家根据引导回复开启指令时，Agent 会自动召回 smart-assistant-settings Skill 来完成配置变更。

### Step 4. 生成周报

周报模板详见 `references/weekly-report-template.md`。
报告严格按照融合后的三大模块顺序输出，直接在对话中展示 Markdown 正文。

**★ 核心交付物：直接在对话中展示的 Markdown 格式周报。**

### Step 5. 自检验证

报告生成后，执行以下检查确保质量：

| 检查项 | 验证内容 | 通过标准 |
|--------|---------|---------|
| 数据完整性 | Pipeline 各阶段会话数之和 = 总会话数 | 数量匹配 |
| 订单识别 | 含订单卡片的会话均已标记 has_order=Y（至少 Won）；order status 为 TO_BE_DELIVER 及之后状态的均已标记 is_paid=Y | 无遗漏 |
| 证据引用 | 每个问题和亮点都有买家ID和会话原文引用 | 100%覆盖 |
| 先亮后问 | 业务员接待分析中亮点在问题之前 | 顺序正确 |
| 子账号对比 | 多子账号时客服对比表格完整 | 字段齐全 |
| 买家范围 | 店铺与业务员核心指标同时包含全量买家和 L1+ 买家，且范围标注清晰 | 两套数据均展示且不混用 |
| 回复时长口径 | `replyTime` 直接按小时展示，0 值不丢弃 | 无分钟误标或单位换算 |
| 空质检语义 | 完整成功且质检数组为空时显示“本周期未发现质检问题（0 条）” | 不误报数据缺失 |
| 语言一致 | 报告语言与用户输入语言一致，功能名词保持英文 | 全文一致 |
| 不显示技术ID | 报告中无 aliId 等技术细节 | 无泄露 |

## FAILURE RECOVERY

| 失败场景 | 恢复策略 |
|---------|---------|
| 诊断数据接口超时或返回不完整 | 跳过对应店铺/账号基础指标对比，仅基于已成功的数据和会话数据生成 Pipeline 分布与诊断分析；聊天质检成功返回空数组不属于异常，应报告 0 条问题 |
| 部分会话消息获取失败 | 记录失败会话ID，在报告末尾注明"以下 N 个会话因数据获取失败未纳入分析"，用已有数据继续生成 |
| 子账号查询失败 | 退化为单账号模式，跳过客服对比模块 |
| 单个会话分析异常 | 跳过该会话的亮点/问题诊断，不影响其他会话分析 |
| 超过 30 轮仍未开始 Step 4 | 立即用已有数据生成报告，在报告中标注"部分数据未完成采集" |

## 账号获取

**子账号信息通过接口动态获取**
- 调用 `subaccount_query` 接口获取所有子账号。
- **诊断数据接口**：仅使用主账号查询。
- **会话数据接口**：需遍历主账号和所有子账号。

## 最佳实践

### 数据查询优化
- 诊断数据（仅主账号）：店铺维度和账号维度均同时采集全量买家与 L1+ 买家，聊天质检按查询日期采集。
- 会话数据（主账号 + 子账号）：遍历所有账号获取会话列表，再根据会话ID获取消息内容。

### 深度诊断执行要求
- **全量分析**：对于会话深度诊断，必须分析全部获取到的会话，不可抽样。
- **逐条深度测评（强制使用 subagent 并行处理）**：每个买卖家关系对的会话必须作为一个独立子任务进行深度测评，确保每个会话都获得充分的上下文空间和分析深度。具体执行方式：
  1. 在 Step 2 完成数据采集后，将每个买卖家关系对的会话消息内容保存为独立文件。
  2. 使用并行子任务（subagent/map）将所有会话文件分发给独立的子任务，每个子任务负责分析一个买卖家关系对的会话。
  3. 每个子任务的分析步骤（注意：步骤1是一个整体，不可拆分）：
     - 步骤1：Pipeline 阶段定位与订单状态识别（同一步完成，订单卡片两层判断是 Pipeline 定位的核心依据）
     - 步骤2：沟通亮点发现
     - 步骤3：问题诊断（含严重程度、问题类型、证据引用、改进建议）
  4. 汇总所有子任务结果，统一整合到报告的三大模块中。
- **订单状态识别（两层判断）**：有订单卡片 = has_order=Y（至少 Won）；order status 为 TO_BE_DELIVER 及之后状态 = is_paid=Y。

### 消息角色识别
- Seller：商家人工
- Buyer：买家

## 工具权限

本 Skill 使用以下 MCP 工具：
- `query_seller_acct_dim_diag_data`
- `query_seller_shop_dim_diag_data`
- `query_seller_chat_quality_check_detail`
- `mcp_icbu-im-server_query_recent_conversation`
- `mcp_icbu-im-server_query_conversation_msg`
- `query_ggs_contact_setting_info`（仅在 Step 3.4 触发时使用，查询 Auto reception 配置）

## 输出要求

1. **不显示 aliId**：报告中不要出现 aliId、账号 ID 等技术细节。
2. **用户友好**：使用商家可理解的业务语言。
3. **直接输出**：直接展示报告正文。
4. **深度融合结构**：严格按照融合后的三大模块（整体接待数据、业务员接待分析、询盘买家分析）输出，不要单独剥离出"会话深度诊断"模块。
5. **先亮点后问题**：在业务员接待分析中，先展示沟通亮点，再展示问题诊断。
6. **证据引用**：每个问题和亮点必须标注买家 ID，并引用原始会话内容作为证据。
7. **多语言输出**：报告语言跟随用户输入语言，功能名词（Pipeline 阶段名、GGS 等）保持英文。

## 注意事项

1. **账号动态获取**：通过 `subaccount_query` 接口动态获取子账号。
2. **数据延迟**：诊断数据可能有1-2天延迟。
3. **时间戳格式**：会话接口使用 13 位毫秒级时间戳。
4. **domain 参数**：会话接口必须设置 `domain: "icbu"`。
5. **多账号遍历**：需遍历主账号和所有子账号。
6. **时间范围校验**：过滤掉时间范围外的消息。
