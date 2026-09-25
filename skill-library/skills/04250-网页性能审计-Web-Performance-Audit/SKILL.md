---
name: "web-perf"
title: "网页性能审计"
description: "采性能 trace 并对照 CWV 阈值，逐阶段审计网络、无障碍与打包配置，输出按影响排序的整改清单。触发词：网页性能审计、web-perf、采性能 trace 并对照 CWV 阈值，逐阶段审计网络、无障碍与打包配置，输出按影响排序的整改清单。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 网页性能审计（Web Performance Audit）

你对 Web 性能指标、阈值与工具 API 的知识可能已经过时。引用具体数字或建议时，**优先检索，而不是凭记忆**。

## 检索来源

| 来源 | 检索方式 | 用途 |
|--------|----------------|---------|
| web.dev | `https://web.dev/articles/vitals` | Core Web Vitals 的阈值与定义 |
| Chrome DevTools 文档 | `https://developer.chrome.com/docs/devtools/performance` | 工具 API、trace 分析 |
| Lighthouse 评分 | `https://developer.chrome.com/docs/lighthouse/performance/performance-scoring` | 分数权重、指标阈值 |

## 第一步：确认可用的 MCP 工具

开始之前，先摸清有哪些浏览器与性能工具可用。按本次审计实际具备的能力来做。如果 trace 工具不可用，就继续做有价值的源码或网络分析，并说明哪些测量没能采集到。

用户想配置 Chrome DevTools MCP 时，查阅它的[安装指南](https://github.com/ChromeDevTools/chrome-devtools-mcp#quick-start)，并使用最新的包版本。只有在用户授权范围内才改动 MCP 配置；否则先问。对使用 `command` 与 `args` 的客户端，一条示例服务器配置是：

```json
"chrome-devtools": {
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest"]
}
```

## 关键准则

- **要笃定**：通过检查网络请求、DOM 或代码库来核实判断，然后明确给出结论。
- **先核实再建议**：确认某样东西确实没被使用，再建议移除。
- **量化影响**：使用 insights 给出的预计节省量。影响为 0ms 的改动不要排进优先级。
- **放过非问题**：如果阻塞渲染的资源的预计影响是 0ms，记一笔即可，不要建议动手。
- **说具体**：说「把 hero.png（450KB）压成 WebP」，别说「优化图片」。
- **毫不留情地排优先级**：LCP 200ms、CLS 为 0 的站点已经足够好——照实说。

## 速查表

| 任务 | 工具调用 |
|------|-----------|
| 加载页面 | `navigate_page(url: "...")` |
| 开始 trace | `performance_start_trace(autoStop: true, reload: true)` |
| 分析 insight | `performance_analyze_insight(insightSetId: "...", insightName: "...")` |
| 列出请求 | `list_network_requests(resourceTypes: ["Script", "Stylesheet", ...])` |
| 请求详情 | `get_network_request(reqid: <id>)` |
| 无障碍快照 | `take_snapshot(verbose: true)` |

## 工作流

复制这份清单来跟踪进度：

```
审计进度：
- [ ] 阶段 1：性能 trace（导航 ＋ 录制）
- [ ] 阶段 2：Core Web Vitals 分析（含 CLS 元凶）
- [ ] 阶段 3：网络分析
- [ ] 阶段 4：无障碍快照
- [ ] 阶段 5：代码库分析（审计第三方站点时跳过）
```

### 阶段 1：性能 trace

1. 导航到目标 URL：
   ```
   navigate_page(url: "<target-url>")
   ```

2. 启动带 reload 的性能 trace，以捕获冷启动加载指标：
   ```
   performance_start_trace(autoStop: true, reload: true)
   ```

3. 等 trace 跑完，再取回结果。

**排查：**
- trace 返回为空或失败时，先用 `navigate_page` 确认页面正常加载
- insight 名称对不上时，查看 trace 响应，列出可用的 insights

### 阶段 2：Core Web Vitals 分析

用 `performance_analyze_insight` 提取关键指标。

**注意：** insight 名称在不同 Chrome DevTools 版本之间可能不同。某个 insight 名称不生效时，查看 trace 响应里的 `insightSetId`，找出可用的 insights。

常见 insight 名称：

| 指标 | Insight 名称 | 关注什么 |
|--------|--------------|------------------|
| LCP | `LCPBreakdown` | 最大内容绘制耗时；TTFB、资源加载、渲染延迟的拆解 |
| CLS | `CLSCulprits` | 造成布局偏移的元素（没有尺寸的图片、注入的内容、字体替换） |
| 阻塞渲染 | `RenderBlocking` | 阻塞首次绘制的 CSS/JS |
| 文档延迟 | `DocumentLatency` | 服务端响应时间问题 |
| 网络依赖 | `NetworkRequestsDepGraph` | 拖慢关键资源的请求链 |

示例：
```
performance_analyze_insight(insightSetId: "<id-from-trace>", insightName: "LCPBreakdown")
```

**关键阈值（良好／需要改进／差）：**
- TTFB: < 800ms / < 1.8s / > 1.8s
- FCP: < 1.8s / < 3s / > 3s
- LCP: < 2.5s / < 4s / > 4s
- INP: < 200ms / < 500ms / > 500ms
- TBT: < 200ms / < 600ms / > 600ms
- CLS: < 0.1 / < 0.25 / > 0.25
- Speed Index: < 3.4s / < 5.8s / > 5.8s

### 阶段 3：网络分析

列出全部网络请求，找出优化机会：
```
list_network_requests(resourceTypes: ["Script", "Stylesheet", "Document", "Font", "Image"])
```

**重点看：**

1. **阻塞渲染的资源**：`<head>` 里没有 `async`/`defer`/`media` 属性的 JS/CSS
2. **网络链**：因为要等其他资源先加载、发现得过晚的资源（例如 CSS import、由 JS 加载的字体）
3. **缺少 preload**：关键资源（字体、首屏大图、关键脚本）没有预加载
4. **缓存问题**：缺少或过于宽松的 `Cache-Control`、`ETag`、`Last-Modified` 响应头
5. **过大的载荷**：未压缩或体积超标的 JS/CSS 包
6. **没用上的 preconnect**：被标记时，检查是否有**任何**请求发往该源。请求数为零，就是确定没用上——建议移除。有请求、但加载偏晚时，preconnect 可能仍然有价值。

查看请求详情：
```
get_network_request(reqid: <id>)
```

### 阶段 4：无障碍快照

抓一份无障碍树快照：
```
take_snapshot(verbose: true)
```

**标出高层的缺口：**
- ARIA ID 缺失或重复
- 对比度不足的元素（对照 WCAG AA：正文 4.5:1，大号文字 3:1）
- 焦点陷阱或缺少焦点指示
- 没有可访问名称的交互元素

## 阶段 5：代码库分析

**审计无代码库权限的第三方站点时跳过。**

分析代码库，弄清哪里可以改进。

### 识别框架与打包器

查找配置文件以识别技术栈：

| 工具 | 配置文件 |
|------|--------------|
| Webpack | `webpack.config.js`、`webpack.*.js` |
| Vite | `vite.config.js`、`vite.config.ts` |
| Rollup | `rollup.config.js`、`rollup.config.mjs` |
| esbuild | `esbuild.config.js`、含 `esbuild` 的构建脚本 |
| Parcel | `.parcelrc`、`package.json`（parcel 字段） |
| Next.js | `next.config.js`、`next.config.mjs` |
| Nuxt | `nuxt.config.js`、`nuxt.config.ts` |
| SvelteKit | `svelte.config.js` |
| Astro | `astro.config.mjs` |

同时检查 `package.json` 里的框架依赖与构建脚本。

### Tree shaking 与死代码

- **Webpack**：检查 `mode: 'production'`、package.json 里的 `sideEffects`、`usedExports` 优化
- **Vite/Rollup**：默认启用 tree shaking；检查 `treeshake` 选项
- **留意**：桶文件（`index.js` 转出口）、被整包引入的大型工具库（lodash、moment）

### 未使用的 JS/CSS

- 检查用的是 CSS-in-JS 还是抽取成静态 CSS
- 查找 PurgeCSS/UnCSS 配置（Tailwind 的 `content` 配置）
- 分辨动态 import 与预加载（eager loading）

### Polyfill

- 检查 `@babel/preset-env` 的 targets 与 `useBuiltIns` 设置
- 查找 `core-js` 引入（体积通常过大）
- 检查 `browserslist` 配置是否覆盖过宽

### 压缩与精简

- 检查是否用 `terser`、`esbuild` 或 `swc` 做压缩
- 查看构建产物或服务端配置里是否有 gzip/brotli 压缩
- 检查生产构建里的 source map（应当外置或关闭）

## 输出格式

按以下结构呈现发现：

1. **Core Web Vitals 摘要** —— 含指标、数值与评级（良好／需要改进／差）的表格
2. **主要问题** —— 按优先级排序的问题清单，附预计影响（高／中／低）
3. **改进建议** —— 具体可执行的修复，附代码片段或配置改动
4. **代码库发现** —— 识别出的框架／打包器与优化机会（无代码库权限时省略）
