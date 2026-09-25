---
name: alibaba-global-product-select
description: |
  商品圈品/筛选工具，根据用户意图筛选候选商品。
  支持通过自然语言描述圈品条件，自动推荐圈品维度组合。
  When to use:
    - 用户需要筛选特定条件的商品（如"低转化的 3C 商品"、"质量分低于 5 分的商品"）
    - 用户通过商品 ID 圈品（如"帮我优化商品 ID 为 123456 的商品"、"把这几个商品圈出来：123, 456, 789"）
    - **用户指令包含圈品条件**（如"帮我优化xxx的商品"、"优化近 90 天无曝光的商品"）→ 先使用本 Skill 圈品，再使用 alibaba-global-product-optimize 优化
  Skip for:
    - 用户已有本地 CSV 文件，直接进行优化 → 使用 alibaba-global-product-optimize
    - 单品查询/编辑 → 直接使用对应工具
workflow: |
  1. 意图解析：分析用户圈品诉求，参考 product-selection-guide.md 推荐圈品条件
  2. 调用圈品工具：通过 MCP 调用 product_governance_ai_select 创建圈品任务
  3. 轮询结果：使用 fileId 调用 query_ai_select_result 轮询圈品结果
  4. 返回 CSV：下载 CSV 文件到本地，返回 filePath 和 totalCount
enabled: true
metadata:
  author: GGS
  version: "1.0.0"
---

# GGS 商品圈品 Skill

帮助商家根据自然语言描述筛选候选商品。核心价值是将模糊的圈品意图转化为结构化的圈品条件，精准锁定目标商品集合。

## 核心规则（不可跳过）

0. **⚠️ 文档阅读规则（HARD RULE）**：本 Skill 下所有 `references/*.md` 文件在需要阅读时，**必须使用 `read_file` 工具完整读取全文（`should_read_entire_file=true`）**。这些文档均为短文档（< 300 行），包含关键的规则定义和格式约束，任何遗漏都可能导致执行错误。
   - ✅ 必须：`read_file(should_read_entire_file=true)` 读取完整文件
   - ❌ 禁止：使用 `grep`、`codebase_search` 或部分行号范围读取来替代全文阅读
   - **理由**：这些文档中的规则相互关联，grep 只能命中关键词附近的片段，容易遗漏上下文约束、注意事项和例外情况，导致执行偏差

1. **意图解析与推荐**：当用户圈品意图模糊（如仅说"帮我优化商品"）或圈品结果过载（候选商品数超上限）时，Agent **必须参考 `references/product-selection-guide.md`** 中的推荐逻辑，主动给出业务化的推荐方案和细化追问选项，引导用户缩小范围。

2. **圈品前必须消除歧义**：当用户表述模糊（如"优化一批""把差的圈出来"）时，先通过对话确认具体范围（品类、指标口径、是否全店），确认后再调用圈品工具。

3. **所有工具均通过 MCP 调用**：本 Skill 涉及的所有工具（`product_governance_ai_select` 圈品、`query_ai_select_result` 查询结果）均通过 **MCP 工具调用**方式执行，Agent 直接调用对应的 MCP 工具并传入参数即可。各工具的参数定义见 `references/tools-openapi.md`。

4. **语言适配**：Agent 所有面向用户的输出（对话回复、确认提示、错误提示等）**必须使用用户当前使用的语言**。如果用户用英文提问则用英文回复，用中文提问则用中文回复，以此类推。

5. **CSV 文件写入本地**：圈品完成后，Agent 客户端必须根据返回的 `filePath` 下载 CSV 文件到本地保存，作为后续优化或其他处理的中间产物。

6. **⚠️ 中间产物命名隔离规则（HARD RULE）**：本 Skill 产生的所有中间产物（CSV 文件、临时脚本等）的文件名**必须包含当前会话的唯一标识符（`sessionId`）**，确保不同会话之间的中间产物互不干扰。
   - **命名格式**：`<用途描述>_<sessionId>_<timestamp>.<扩展名>`
   - **示例**：`product_select_sess7a3b_20260421_1830.csv`
   - **sessionId 获取**：使用当前会话 ID 的前 8 位（或其他可区分的唯一片段）作为 `sessionId`。如果无法获取会话 ID，则使用随机生成的 8 位字符串
   - **⚠️ 禁止行为**：
     - ❌ 使用不含 `sessionId` 的通用文件名（如 `select_result.csv`）
     - ❌ 在新会话中读取或引用旧会话产生的中间产物文件
   - **目的**：避免新会话误读旧会话的中间产物，导致数据错乱或使用过期数据

6. **执行进度输出**：在执行每一步操作时，Agent **必须向用户输出当前正在做什么、准备做什么**，以缓解用户的等待焦虑。例如：
   - 调用圈品工具前：输出"正在为您筛选符合条件的商品，请稍候..."
   - 轮询结果时：输出"正在查询圈品结果，请稍等..."
   - 下载 CSV 时：输出"正在下载圈品结果文件..."

7. **思考过程打印**：在执行每一步操作时，Agent **必须打印思考过程**，说明当前为什么选择执行这一步、参数为什么选择这么传，方便后续排查。例如：
   - 调用圈品工具前：打印"选择调用 product_governance_ai_select 工具，因为用户需要筛选商品。参数 userPrompt 设置为 '低转化的 3C 商品'，因为用户明确提到了这两个条件。"
   - 轮询结果时：打印"选择调用 query_ai_select_result 工具，因为圈品任务已创建，需要查询结果。参数 fileId 设置为 'xxx'，这是上一步创建任务时返回的 ID。"

8. **⚠️ 输出完整性（HARD RULE）**：思考过程通常会被 UI 隐藏，用户**看不到**思考内容。因此，Agent 最终给用户的输出**必须是完整的、自包含的**，包含用户理解当前状态所需的全部信息。**严禁**将关键结论（如圈品结果数量、文件路径、下一步操作建议等）仅放在思考过程中而不在最终输出中体现。
   - ✅ 正确：思考过程中分析推理，最终输出中给出完整结论
   - ❌ 错误：思考过程中输出了"圈品结果共 42 个商品"，但最终输出只说"圈品完成"，用户看不到具体数量

## 🛠 执行协议 (Execution Protocol) - 重要！

**1. 超时参数注入 (Timeout Parameter Injection):**
   - ⚠️ **强制要求**：本 Skill 涉及的所有 MCP 工具调用均为长耗时操作，**每个 MCP 工具调用的超时时间为 600s（10 分钟）**。Agent 在调用 MCP 工具时需确保超时设置不低于 600s。
   - **禁止行为**：禁止使用默认的短超时（如 120s）调用本 Skill 的 MCP 工具，否则可能导致长耗时操作被中断。

## 执行流程

### Step 1：意图解析与推荐

- **Input**：用户的圈品诉求（自然语言，如"低转化的 3C 品类"）
- **Action**：
  1. **意图解析**：分析用户诉求，参考 `references/product-selection-guide.md` 中的维度字典和推荐逻辑，将自然语言映射为结构化的圈品条件
  2. **推荐方案**：若用户意图模糊，先按指南给出"默认推荐 + 引导追问"方案，待用户确认或细化后再调用工具
- **Output**：结构化的圈品条件（`user_prompt`）

### Step 2：调用圈品工具（异步）

> **⚠️ 强制动作**：调用 `product_governance_ai_select` 前，**必须先 Read `references/product-selection-guide.md`**，确认圈品维度字典、意图识别逻辑和推荐规则，确保 `user_prompt` 的构造符合规范。

- **Action**：通过 MCP 方式调用 `product_governance_ai_select`，传入合成后的 `user_prompt`
- **Output**：`fileId`（圈品任务唯一标识）

### Step 3：轮询圈品结果

- **Action**：使用返回的 `fileId`，通过 MCP 方式调用 `query_ai_select_result` 轮询圈品结果
- **轮询策略**：每 5 秒轮询一次，直到任务完成
- **Output**：`filePath`（沙盒 CSV 下载路径）、`totalCount`（候选商品数）

### Step 4：下载 CSV 到本地

- **Action**：Agent 客户端根据 `filePath` 下载 CSV 文件到本地保存
- **Output**：本地 CSV 文件，作为后续处理的中间产物

### Step 5：过载处理

若工具返回超上限澄清表单（`scenario=governance_ai_select_total_limit`），**不要简单提示"是否接受截断"**，而应参考 `references/product-selection-guide.md` 中的追问逻辑，向用户推荐 2-3 个可叠加的细化条件（如限定类目、商品类型、AI 优化状态等），引导用户缩小范围后重新调用。若用户明确表示接受截断，则以 `strict_max_candidate_limit=false` 重新调用。

## 综合场景指令拆解

当用户发出预设指令（如"转交易品"、"提升商品质量分"、"提升商品价格力"等）时，Agent 需要将综合指令**拆解为具体的圈品条件**，按上述流程执行。

> **综合场景指令拆解详情**：详见 `references/product-selection-guide.md` 中的"综合场景指令拆解"章节，其中定义了各指令的默认圈品条件。

## Dependencies

- **工具**：`product_governance_ai_select`（圈品）、`query_ai_select_result`（查询圈品结果）。**所有工具均通过 MCP 方式调用**，完整的参数定义、请求/响应格式见 `references/tools-openapi.md`
- **本地能力**：Agent 客户端需具备 CSV 文件下载的能力
- **数据**：实时候选量、CSV 文件路径等均由工具返回

## Next Steps（按需阅读）

| 主题 | 文件 |
|------|------|
| CSV 中间产物的固定表头格式与字段说明 | `references/csv-schema.md` |
| 两个 MCP 工具的参数定义、请求/响应格式 | `references/tools-openapi.md` |
| 智能圈品推荐指南（意图解析、维度字典、推荐逻辑、追问策略） | `references/product-selection-guide.md` |
