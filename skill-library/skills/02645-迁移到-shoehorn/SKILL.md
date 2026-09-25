---
name: "migrate-to-shoehorn"
title: "Shoehorn 结构迁移"
description: "把代码迁移到 shoehorn 结构。触发词：Shoehorn 结构迁移、migrate-to-shoehorn、把代码迁移到 shoehorn 结构。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 迁移到 shoehorn

## 为什么用 shoehorn？

`shoehorn` 让你在测试中传入部分数据，同时让 TypeScript 满意。它用类型安全的替代方案取代 `as` 断言。

**只用于测试代码。**绝不要在生产代码中使用 shoehorn。

在测试中使用 `as` 的问题：

- 被训练成不要使用它
- 必须手动指定目标类型
- 故意传入错误数据时要用双重 as（`as unknown as Type`）

## 安装

```bash
npm i @total-typescript/shoehorn
```

## 迁移模式

### 只需要少数属性的巨大对象

之前：

```ts
type Request = {
  body: { id: string };
  headers: Record<string, string>;
  cookies: Record<string, string>;
  // ...20 more properties
};

it("gets user by id", () => {
  // Only care about body.id but must fake entire Request
  getUser({
    body: { id: "123" },
    headers: {},
    cookies: {},
    // ...fake all 20 properties
  });
});
```

之后：

```ts
import { fromPartial } from "@total-typescript/shoehorn";

it("gets user by id", () => {
  getUser(
    fromPartial({
      body: { id: "123" },
    }),
  );
});
```

### `as Type` → `fromPartial()`

之前：

```ts
getUser({ body: { id: "123" } } as Request);
```

之后：

```ts
import { fromPartial } from "@total-typescript/shoehorn";

getUser(fromPartial({ body: { id: "123" } }));
```

### `as unknown as Type` → `fromAny()`

之前：

```ts
getUser({ body: { id: 123 } } as unknown as Request); // wrong type on purpose
```

之后：

```ts
import { fromAny } from "@total-typescript/shoehorn";

getUser(fromAny({ body: { id: 123 } }));
```

## 何时用哪个

| 函数            | 使用场景                                           |
| --------------- | -------------------------------------------------- |
| `fromPartial()` | 传入仍然通过类型检查的部分数据                     |
| `fromAny()`     | 传入故意错误的数据（保留自动补全）                 |
| `fromExact()`   | 强制要求完整对象（之后与 fromPartial 互换）        |

## 工作流程

1. **收集需求**——询问用户：
   - 哪些测试文件里的 `as` 断言造成了问题？
   - 他们是否在处理只有部分属性重要的大型对象？
   - 他们是否需要为错误测试故意传入类型错误的数据？

2. **安装并迁移**：
   - [ ] 安装：`npm i @total-typescript/shoehorn`
   - [ ] 找出带 `as` 断言的测试文件：`grep -r " as [A-Z]" --include="*.test.ts" --include="*.spec.ts"`
   - [ ] 把 `as Type` 替换为 `fromPartial()`
   - [ ] 把 `as unknown as Type` 替换为 `fromAny()`
   - [ ] 从 `@total-typescript/shoehorn` 添加 import
   - [ ] 运行类型检查验证
