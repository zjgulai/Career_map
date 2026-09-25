---
name: "code-documenter"
title: "代码文档化"
description: "补 docstring 与 JSDoc、生成 OpenAPI 规格与文档站、写用户指南，并校验示例可编译，产出覆盖率报告。触发词：代码文档化、code-documenter、补 docstring 与 JSDoc、生成 OpenAPI 规格与文档站、写用户指南，并校验示例可编译，产出覆盖率报告。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 代码文档化（Code Documenter）

面向内联文档、API 规格、文档站与开发者指南的文档专家。

## 何时使用本技能

适用于任何涉及代码文档、API 规格或面向开发者的指南的任务。具体子主题见下面的参考表。

## 核心工作流

1. **探查** —— 询问格式偏好与排除项
2. **识别** —— 判断语言与框架
3. **分析** —— 找出未文档化的代码
4. **撰写** —— 套用统一的格式
5. **校验** —— 测试文档里的所有代码示例能否编译／运行：
   - Python：doctest 块用 `python -m doctest file.py`；模块级检查用 `pytest --doctest-modules`
   - TypeScript/JavaScript：用 `tsc --noEmit` 确认带类型的示例能编译
   - OpenAPI：用 `npx @redocly/cli lint openapi.yaml` 校验规格
   - 校验失败时：修好示例并重新校验，然后才进入报告步骤
6. **报告** —— 生成覆盖率摘要

## 速查示例

### Google 风格 docstring（Python）
```python
def fetch_user(user_id: int, active_only: bool = True) -> dict:
    """Fetch a single user record by ID.

    Args:
        user_id: Unique identifier for the user.
        active_only: When True, raise an error for inactive users.

    Returns:
        A dict containing user fields (id, name, email, created_at).

    Raises:
        ValueError: If user_id is not a positive integer.
        UserNotFoundError: If no matching user exists.
    """
```

### NumPy 风格 docstring（Python）
```python
def compute_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors.

    Parameters
    ----------
    vec_a : np.ndarray
        First input vector, shape (n,).
    vec_b : np.ndarray
        Second input vector, shape (n,).

    Returns
    -------
    float
        Cosine similarity in the range [-1, 1].

    Raises
    ------
    ValueError
        If vectors have different lengths.
    """
```

### JSDoc（TypeScript）
```typescript
/**
 * Fetches a paginated list of products from the catalog.
 *
 * @param {string} categoryId - The category to filter by.
 * @param {number} [page=1] - Page number (1-indexed).
 * @param {number} [limit=20] - Maximum items per page.
 * @returns {Promise<ProductPage>} Resolves to a page of product records.
 * @throws {NotFoundError} If the category does not exist.
 *
 * @example
 * const page = await fetchProducts('electronics', 2, 10);
 * console.log(page.items);
 */
async function fetchProducts(
  categoryId: string,
  page = 1,
  limit = 20
): Promise<ProductPage> { ... }
```

## 参考指南

按场景加载详细指引：

| 主题 | 参考文件 | 何时加载 |
|-------|-----------|-----------|
| Python docstring | `references/python-docstrings.md` | 需要 Google、NumPy、Sphinx 风格时 |
| TypeScript JSDoc | `references/typescript-jsdoc.md` | 需要 JSDoc 模式、TypeScript 时 |
| FastAPI/Django API | `references/api-docs-fastapi-django.md` | 写 Python API 文档时 |
| NestJS/Express API | `references/api-docs-nestjs-express.md` | 写 Node.js API 文档时 |
| 覆盖率报告 | `references/coverage-reports.md` | 生成文档报告时 |
| 文档系统 | `references/documentation-systems.md` | 文档站、静态生成器、搜索、测试 |
| 交互式 API 文档 | `references/interactive-api-docs.md` | OpenAPI 3.1、门户、GraphQL、WebSocket、gRPC、SDK |
| 用户指南与教程 | `references/user-guides-tutorials.md` | 快速上手、教程、故障排查、FAQ |

## 约束

### 必须做
- 动手前先问清格式偏好
- 识别框架，以选对 API 文档策略
- 为所有公开函数／类写文档
- 写明参数类型与说明
- 写明异常／错误
- 测试文档里的代码示例
- 生成覆盖率报告

### 绝不要做
- 不问就假定 docstring 格式
- 对框架套用错误的 API 文档策略
- 写出不准确或未经验证的文档
- 漏掉错误相关文档
- 为显而易见的 getter/setter 写冗长文档
- 产出难以维护的文档

## 输出格式

视任务提供：

1. **代码文档：** 带文档的源文件 ＋ 覆盖率报告
2. **API 文档：** OpenAPI 规格 ＋ 门户配置
3. **文档站：** 站点配置 ＋ 内容结构 ＋ 构建说明
4. **指南／教程：** 带示例与配图的结构化 Markdown

## 知识范围

Google/NumPy/Sphinx 风格 docstring、JSDoc、OpenAPI 3.0/3.1、AsyncAPI、gRPC/protobuf、FastAPI、Django、NestJS、Express、GraphQL、Docusaurus、MkDocs、VitePress、Swagger UI、Redoc、Stoplight

[文档](https://jeffallan.github.io/claude-skills/skills/quality/code-documenter/)
