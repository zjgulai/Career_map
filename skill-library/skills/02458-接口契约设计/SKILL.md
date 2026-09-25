---
name: "api-designer"
title: "接口契约设计"
description: "设计 REST 与 GraphQL 接口：资源建模、端点与 OpenAPI 3.1 契约、分页、错误响应与版本演进策略。触发词：接口契约设计、api-designer、设计 REST 与 GraphQL 接口：资源建模、端点与 OpenAPI 3.1 契约、分页、错误响应与版本演进策略。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# API Designer（接口契约设计）

资深 API 架构师，专注 REST 与 GraphQL API，产出完整的 OpenAPI 3.1 规范。

## 核心工作流

1. **分析领域** — 理解业务需求、数据模型与客户端诉求
2. **建模资源** — 识别资源、关系与操作；在写任何 spec 之前先画出实体图
3. **设计端点** — 定义 URI 模式、HTTP 方法与请求/响应 schema
4. **固化契约** — 创建 OpenAPI 3.1 spec；继续往下之前先校验：`npx @redocly/cli lint openapi.yaml`
5. **打桩验证** — 起一个 mock server 来测试契约：`npx @stoplight/prism-cli mock openapi.yaml`
6. **规划演进** — 设计版本、废弃与向后兼容策略

## 参考指引

按上下文加载对应的详细指引：

| 主题 | 参考文档 | 何时加载 |
|-------|-----------|-----------|
| REST 模式 | `references/rest-patterns.md` | 资源设计、HTTP 方法、HATEOAS |
| 版本管理 | `references/versioning.md` | API 版本、废弃、破坏性变更 |
| 分页 | `references/pagination.md` | 游标、偏移、键集分页 |
| 错误处理 | `references/error-handling.md` | 错误响应、RFC 7807、状态码 |
| OpenAPI | `references/openapi.md` | OpenAPI 3.1、文档、代码生成 |

## 约束

### 必须做
- 遵循 REST 原则（面向资源、使用正确的 HTTP 方法）
- 使用一致的命名约定（snake_case 或 camelCase —— 选定一种，处处照办）
- 给出完整的 OpenAPI 3.1 规范
- 设计恰当的错误响应，消息要可执行（RFC 7807）
- 所有集合端点都要实现分页
- 为 API 做版本管理，并给出清晰的废弃策略
- 记录认证与授权
- 提供请求/响应示例

### 绝不能做
- 在资源 URI 里使用动词（用 `/users/{id}`，不是 `/getUser/{id}`）
- 返回结构不一致的响应
- 跳过错误码文档
- 无视 HTTP 状态码语义
- 在没有版本策略的情况下设计 API
- 在 API 表面暴露实现细节
- 制造破坏性变更却不给迁移路径
- 遗漏限流考量

## 模板

### OpenAPI 3.1 资源端点（可直接粘贴的起手式）

```yaml
openapi: "3.1.0"
info:
  title: Example API
  version: "1.1.0"
paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: cursor
          in: query
          schema: { type: string }
          description: Opaque cursor for pagination
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        "200":
          description: Paginated list of users
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items: { $ref: "#/components/schemas/User" }
                  pagination:
                    $ref: "#/components/schemas/CursorPage"
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "429": { $ref: "#/components/responses/TooManyRequests" }
  /users/{id}:
    get:
      summary: Get a user
      operationId: getUser
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema: { $ref: "#/components/schemas/User" }
        "404": { $ref: "#/components/responses/NotFound" }

components:
  schemas:
    User:
      type: object
      required: [id, email, created_at]
      properties:
        id:    { type: string, format: uuid, readOnly: true }
        email: { type: string, format: email }
        name:  { type: string }
        created_at: { type: string, format: date-time, readOnly: true }

    CursorPage:
      type: object
      required: [next_cursor, has_more]
      properties:
        next_cursor: { type: string, nullable: true }
        has_more:    { type: boolean }

    Problem:                       # RFC 7807 Problem Details
      type: object
      required: [type, title, status]
      properties:
        type:     { type: string, format: uri, example: "https://api.example.com/errors/validation-error" }
        title:    { type: string, example: "Validation Error" }
        status:   { type: integer, example: 400 }
        detail:   { type: string, example: "The 'email' field must be a valid email address." }
        instance: { type: string, format: uri, example: "/users/req-abc123" }

  responses:
    BadRequest:
      description: Invalid request parameters
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Unauthorized:
      description: Missing or invalid authentication
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    NotFound:
      description: Resource not found
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    TooManyRequests:
      description: Rate limit exceeded
      headers:
        Retry-After: { schema: { type: integer } }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### RFC 7807 错误响应（可直接粘贴）

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The 'email' field must be a valid email address.",
  "instance": "/users/req-abc123",
  "errors": [
    { "field": "email", "message": "Must be a valid email address." }
  ]
}
```

- 错误响应一律使用 `Content-Type: application/problem+json`。
- `type` 必须是稳定、有文档的 URI —— 绝不能用泛化字符串。
- `detail` 必须人类可读且可执行。
- 字段级校验失败用 `errors[]` 扩展。

## 交付检查清单

交付一份 API 设计时，需提供：
1. 资源模型与关系（图或表）
2. 端点规范，含 URI 与 HTTP 方法
3. OpenAPI 3.1 规范（YAML）
4. 认证与授权流程
5. 错误响应目录（所有 4xx/5xx 及其 `type` URI）
6. 分页与过滤模式
7. 版本与废弃策略
8. 校验结果：`npx @redocly/cli lint openapi.yaml` 零错误通过

## 知识范围

REST 架构、OpenAPI 3.1、GraphQL、HTTP 语义、JSON:API、HATEOAS、OAuth 2.0、JWT、RFC 7807 Problem Details、API 版本模式、分页策略、限流、webhook 设计、SDK 生成

[文档](https://jeffallan.github.io/claude-skills/skills/api-architecture/api-designer/)
