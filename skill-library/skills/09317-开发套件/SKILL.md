# API开发套件

为功能快速创建遵循项目规范的API路由。整套输出包含：zod校验、错误处理、速率限制、类型安全、流式支持、测试文件。

## 使用方式

在Codex中输入 `/api {功能描述}` 或引用此Skill后描述API需求。

## 前置条件

- 项目已初始化，AGENTS.md已配置
- 已确定API路由结构（`app/api/` 或独立后端）

## 执行流程

### 第一步：确认需求

在写代码前确认：
- 这个API的职责是什么？（单一职责原则，一个API只做一件事）
- 输入什么？（精确到字段类型、必填/可选、约束条件）
- 输出什么？（成功格式 + 错误格式）
- 涉及LLM调用吗？（决定是否需要流式响应）
- 涉及Agent工具调用吗？（决定是否需要异步处理）

### 第二步：生成标准API路由

```typescript
// 模板结构（以Next.js App Router为例）
// app/api/{resource}/route.ts

import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
// 从项目的统一封装中导入
import { createLLMClient } from "@/lib/ai/client";
import { rateLimit } from "@/lib/middleware/rate-limit";
import { AppError, errorResponse } from "@/lib/errors";

// ===== 1. Zod入参校验 =====
const RequestSchema = z.object({
  // 每个字段必须有 .describe() —— 这对AI生成和文档都有用
  query: z.string().min(1).max(2000).describe("用户查询内容"),
  context: z.object({
    conversation_id: z.string().uuid().optional(),
    user_role: z.enum(["free", "pro", "enterprise"]).default("free"),
  }).optional(),
  options: z.object({
    stream: z.boolean().default(true),
    model: z.enum(["auto", "fast", "precise"]).default("auto"),
  }).optional(),
});

// ===== 2. 统一错误处理 =====
// 使用项目标准的错误类和响应格式
// 不要在路由中散落 try-catch

// ===== 3. 速率限制 =====
// 使用项目统一的限流配置

export async function POST(req: NextRequest) {
  // 速率限制检查
  const rateLimitResult = await rateLimit(req, {
    identifier: "api-chat",
    maxRequests: 20,    // 每分钟20次（按你的产品策略调整）
    windowMs: 60_000,
  });
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  // 入参校验
  const parsed = RequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", parsed.error.flatten());
  }

  // 业务逻辑（走统一LLM客户端，不要直接调OpenAI SDK）
  // ...
}
```

### 第三步：配套输出

每个API路由生成时，同时创建：

**1. 测试文件**（`.http` 文件，方便在IDE中手动测试）：
```
### 正常请求
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "query": "今天天气怎么样？",
  "options": {"stream": false}
}

### 流式请求
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "query": "给我讲一个关于AI的长故事",
  "options": {"stream": true}
}

### 边界：超长输入
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "query": "{{$randomString 3000}}",
  "options": {"stream": false}
}

### 边界：空输入
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "query": ""
}

### 边界：缺失必填字段
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "options": {"stream": false}
}
```

**2. 类型定义**（如果涉及新的类型，添加到项目类型文件）

**3. 变更日志注释**（在文件头部标注创建日期和用途）

### 第四步：自检

生成后自动运行：
- `tsc --noEmit` — 类型检查
- 检查是否正确使用了项目的统一LLM客户端（而非直接调用OpenAI SDK）
- 检查是否遵循了AGENTS.md中的API开发规范
- 检查流式响应是否正确配置（如果是AI API）

## 关键规范

必须遵循（来自AGENTS.md）：
- 所有API路由使用zod校验入参，每个字段有`.describe()`
- 错误处理使用项目统一的错误格式，不要在路由中散落try-catch
- LLM调用走 `lib/ai/client.ts` 统一封装
- AI响应默认支持流式（SSE）
- 禁止在API路由中硬编码API密钥或敏感配置

## 反模式（绝对不能做的）

```
❌ 直接 import OpenAI from "openai" 在API路由中
   → 使用项目的 lib/ai/client.ts 统一封装

❌ 自定义错误格式
   → 使用项目统一的 errorResponse 函数

❌ 忘记速率限制
   → 每个面向用户的API都需要限流

❌ 在流式响应中没有错误处理
   → 流式响应中的错误也需要优雅降级

❌ console.log 调试
   → 使用结构化日志
```
