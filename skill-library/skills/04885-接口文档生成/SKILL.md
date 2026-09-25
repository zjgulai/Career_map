---
name: generate-api-docs
description: 根据 Java Controller 源码生成 Markdown 接口文档，包含接口名称、请求方式(GET/POST/PUT/DELETE)、请求路径、请求头(token)、请求 Body/Query 参数表(字段名/类型/备注/是否必填)、返回 JSON 示例、错误码说明，适配服务端(若依 AjaxResult)与客户端后端(ApiResponse)两种响应结构。Use when 用户要求生成接口文档、API 文档、接口清单，或需要输出给前端/第三方对接的接口说明时。
---

# 接口文档生成

根据 Controller 源码逆向生成 Markdown 接口文档。**所有信息必须来自真实代码，不得臆造**；源码中无法确定的字段在备注列标注"待补充"。

## 两个后端的关键差异

| 项目 | 服务端 (auxiliary-ompounding-server) | 客户端后端 (auxiliary-ompounding-system-client/backend) |
|---|---|---|
| Controller 位置 | `ruoyi-admin/src/main/java/com/ruoyi/web/controller/` | `backend/src/main/java/com/auxiliary/compounding/`（各模块 `interfaces/` 子包为主） |
| 基础地址 | `http://127.0.0.1:8080`（context-path `/`） | `http://127.0.0.1:18080`，路径前缀 `/api/v1` |
| 认证方式 | 请求头 `[REDACTED]`（JWT，登录 `POST /login` 获取） | Cookie `JSESSIONID`（会话认证，登录 `POST /api/v1/auth/login` 建立会话） |
| 成功响应 | `{"code":200,"msg":"操作成功","data":...}`（AjaxResult） | `{"success":true,"data":...}`（ApiResponse，error 为 null 时省略） |
| 分页响应 | `{"code":200,"msg":"查询成功","rows":[...],"total":n}`（TableDataInfo） | 无统一分页包装，分页结构在 data 内 |
| 业务错误 | `{"code":500,"msg":"..."}`；警告 code=601 | `{"success":false,"error":{"code":"XXX","message":"..."}}` |
| 权限 | `@PreAuthorize("@ss.hasPermi('xxx')")` 权限标识 | 无权限注解 |

## 工作流程

1. **确定范围**：用户指定了 Controller/模块就只处理它；否则先按模块名搜索列出候选 Controller，让用户圈定范围，避免一次生成全量文档。
2. **读取源码**：每个接口至少分析三处：
   - Controller 方法的 Mapping 注解（`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`，路径要与类级 `@RequestMapping` 前缀拼接）
   - 方法参数：`@RequestBody`/`@RequestParam`/`@PathVariable`；`required=false` 或有 `defaultValue` 表示可选；`@Valid` + DTO 上的 `@NotBlank`/`@NotNull` 决定必填
   - 返回值：`AjaxResult.success(x)`/`getDataTable(list)`/`ApiResponse.success(x)` 中 x 的实际类型，追到 record/VO/Service 返回结构逐字段还原
3. **生成文档**：按 [template.md](template.md) 的模板逐接口填写，写入 `docs/api/<模块名>.md`（服务端接口写到服务端仓库的 `docs/api/`，客户端后端接口写到 client 仓库的 `docs/api/`）。
4. **错误码收集**：
   - 服务端：通用码固定为 200 成功 / 500 失败 / 601 警告；再列出该接口代码中实际 `AjaxResult.error("...")` 返回的 msg 作为业务错误说明
   - 客户端后端：追该接口调用链上实际 `throw new BusinessException("<CODE>", "<说明>")` / `ExternalServiceException(...)` 的全部错误码，逐个列出
5. **自检清单**：
   - [ ] 路径已拼接类级 `@RequestMapping` 前缀
   - [ ] 请求方式与 Mapping 注解一致
   - [ ] 每个参数都标注了位置（Body/Query/Path）和必填/可选
   - [ ] 返回示例 JSON 的字段名与 record/VO 字段名完全一致（客户端后端 Jackson 配置 `non_null`，值为 null 的字段不输出，示例中不要出现）
   - [ ] 错误码来自代码中真实抛出的异常或错误分支

## 参数表填写规则

| 参数来源 | 位置 | 必填判断 |
|---|---|---|
| `@RequestBody XxxRequest` | Body(JSON) | DTO 字段上有 `@NotNull`/`@NotBlank`/`@NotEmpty` 校验的必填；无校验注解的看代码空值分支 |
| `@RequestParam String x` | Query | 默认必填；`required=false` 或有 `defaultValue` 可选 |
| `@PathVariable` | Path | 必填 |
| `@RequestParam("file") MultipartFile` | Body(form-data) | 必填，注明 Content-Type 为 multipart/form-data |

类型统一写 JSON 类型：String / Integer / Long / Boolean / Array / Object；日期时间注明实际格式（如 `yyyy-MM-dd`、ISO 8601）。

## 输出规范

- 一个模块一个文件：`docs/api/<模块名>.md`，文件开头放接口目录（Markdown 锚点跳转）
- 返回 JSON 示例的值用贴近业务的中文示例（药品名、单号、科室等），不要用 "test"/"xxx"
- 已存在同名文档时，只更新涉及的接口段落，保留其余内容，并在文件头部更新修改时间
