---
name: "performance"
title: "网页性能优化"
description: "按真实用户指标定位瓶颈后动手优化：关键渲染路径、图片与字体、缓存、运行时与三方脚本，逐项附可直接套用的代码模式。触发词：网页性能优化、performance、按真实用户指标定位瓶颈后动手优化：关键渲染路径、图片与字体、缓存、运行时与三方脚本，逐项附可直接套用的代码模式。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 网页性能优化（Performance optimization）

以证据为准绳的性能优化：用真实用户信号排优先级，用浏览器 trace 做诊断。聚焦加载速度、运行时响应性与资源投递。

## 工作方式

1. 如果页面能跑起来，先读[测量工作流](references/MEASUREMENT.md)，在动手前建立「现场数据 ＋ 实验室数据」的基线。
2. 优先处理表现糟糕的真实用户 Core Web Vitals。用 DevTools 性能 trace 及其针对性 insights 找出原因。
3. 只检查和改动与实测瓶颈相关的代码或资源。
4. 重跑等价的实验室测量，报告前后数值、条件与不确定性。在积累到足够的新用户数据之前，现场验证仍属未完成。

没有可运行的页面时，做静态检查，但把发现称为**假设**，而不是实测到的回归。对每条高影响的假设，给出可用于验证它的命令或浏览器操作流程。

优先选用能录性能 trace 并给出针对性 insights 的浏览器工具。用 Chrome DevTools MCP 时，使用 `performance_start_trace` 与 `performance_analyze_insight`；不要把性能问题交给 `lighthouse_audit` 处理，它覆盖的是 Lighthouse 的非性能类别。

## 起始性能预算

预算必须反映产品的目标设备、网络、页面类型与用户旅程。下表数值只是典型内容页或电商页的初始护栏，不是通用的通过／不通过标准。项目里已经定义了预算时，沿用既有的。

| 资源 | 预算 | 理由 |
|----------|--------|-----------|
| 页面总重 | < 1.5 MB | 约束受限目标网络下的传输时间与流量成本；用有代表性的页面校准 |
| JavaScript（压缩后） | < 300 KB | 控制解析与执行成本 |
| CSS（压缩后） | < 100 KB | 限制阻塞渲染的工作量 |
| 图片（首屏） | < 500 KB | 保护最可能成为 LCP 的资源 |
| 字体 | < 100 KB | 限制关键字体传输 |
| 第三方 | < 200 KB | 约束产品无法掌控的代码 |

## 关键渲染路径

### 服务端响应
* **TTFB < 800ms。** 首字节时间要快。用 CDN、缓存与高效的后端。
* **启用压缩。** 文本资源用 Gzip 或 Brotli，优先 Brotli（体积小 15-20%）。
* **HTTP/2 或 HTTP/3。** 多路复用降低连接开销。
* **边缘缓存。** 条件允许时在 CDN 边缘缓存 HTML。
* **实测到文档延迟时，考虑用 Early Hints（HTTP 103）。** 如果 trace 显示 HTML 生成慢、而关键子资源稳定，就在同一次请求的正常最终响应之前，先发一个带 `Link` 头的临时 `103`。需使用 HTTP/2 或更高版本。CDN 可以从更早那次 `200` 的 `Link` 头合成 `103`，也可以由源站／边缘处理器直接发出。不支持的客户端会继续等待最终响应，但要确认当前浏览器与基础设施的支持情况。提示只限于已被证实的 critical preload 或 preconnect：不准确的提示会浪费带宽。Cloudflare 曾在一个刻意构造的图片密集型测试中报告 LCP 改善 20–30%；把这当作厂商案例，而不是可预期的收益，并实测你自己的结果。参见 [MDN 的 103 实现示例](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/103) 与 [Cloudflare 的研究](https://blog.cloudflare.com/early-hints-performance/)。

### 资源加载

**预连接到必需的源：**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

**预加载关键资源：**

只预加载那些在 trace 里能看到「发现过晚」的资源。每个 preload 都在争抢带宽，一个不必要的高优先级请求会拖慢 LCP。

```html
<!-- LCP image -->
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">

<!-- Critical font -->
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**用 [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) 预渲染接下来可能访问的导航：**
```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/*" },
    "eagerness": "moderate"
  }]
}
</script>
```
`moderate` 比 eager 模式等待更强的意图信号。测量预测命中率、传输字节数与服务端成本；一次预渲染猜错基本等于一次没派上用场的导航。取舍与埋点所需的 `prerenderingchange` 门控见 [core-web-vitals → LCP](../core-web-vitals/SKILL.md#lcp-largest-contentful-paint)。

**延后非关键 CSS：**
```html
<!-- Critical CSS inlined -->
<style>/* Above-fold styles */</style>

<!-- Non-critical CSS -->
<link rel="preload" href="/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/styles.css"></noscript>
```

### JavaScript 优化

**延后非必需脚本：**
```html
<!-- Parser-blocking (avoid) -->
<script src="/critical.js"></script>

<!-- Deferred (preferred) -->
<script defer src="/app.js"></script>

<!-- Async (for independent scripts) -->
<script async src="/analytics.js"></script>

<!-- Module (deferred by default) -->
<script type="module" src="/app.mjs"></script>
```

**代码拆分模式：**
```javascript
// Route-based splitting
const Dashboard = lazy(() => import('./Dashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));

// Feature-based splitting
if (user.isPremium) {
  const PremiumFeatures = await import('./PremiumFeatures');
}
```

**tree shaking 最佳实践：**
```javascript
// ❌ Imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

## 图片优化

### 格式选择
| 格式 | 适用场景 | 浏览器支持 |
|--------|----------|-----------------|
| AVIF | 照片，压缩率最好 | 92%+ |
| WebP | 照片，良好的回退选项 | 97%+ |
| PNG | 需要透明通道的图形 | 全平台 |
| SVG | 图标、标志、插画 | 全平台 |

### 响应式图片
```html
<picture>
  <!-- AVIF for modern browsers -->
  <source 
    type="image/avif"
    srcset="hero-400.avif 400w,
            hero-800.avif 800w,
            hero-1200.avif 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- WebP fallback -->
  <source 
    type="image/webp"
    srcset="hero-400.webp 400w,
            hero-800.webp 800w,
            hero-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">
  
  <!-- JPEG fallback -->
  <img 
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w,
            hero-800.jpg 800w,
            hero-1200.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="1200" 
    height="600"
    alt="Hero image"
    loading="lazy"
    decoding="async">
</picture>
```

### LCP 图片的优先级
```html
<!-- Above-fold LCP image: eager loading, high priority -->
<img 
  src="hero.webp" 
  fetchpriority="high"
  loading="eager"
  decoding="sync"
  alt="Hero">

<!-- Below-fold images: lazy loading -->
<img 
  src="product.webp" 
  loading="lazy"
  decoding="async"
  alt="Product">
```

## 字体优化

### 加载策略
```css
/* System font stack as fallback */
body {
  font-family: 'Custom Font', -apple-system, BlinkMacSystemFont, 
               'Segoe UI', Roboto, sans-serif;
}

/* Prevent invisible text */
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or optional for non-critical */
  font-weight: 400;
  font-style: normal;
  unicode-range: U+0000-00FF; /* Subset to Latin */
}
```

### 预加载关键字体
```html
<link rel="preload" href="/fonts/heading.woff2" as="font" type="font/woff2" crossorigin>
```

### 可变字体
```css
/* One file instead of multiple weights */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

## 缓存策略

### Cache-Control 响应头
```
# HTML (short or no cache)
Cache-Control: no-cache, must-revalidate

# Static assets with hash (immutable)
Cache-Control: public, max-age=31536000, immutable

# Static assets without hash
Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# API responses
Cache-Control: private, max-age=0, must-revalidate
```

### Service Worker 缓存
```javascript
// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open('static-v1').then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
```

## 运行时性能

### 避免布局抖动
```javascript
// ❌ Forces multiple reflows
elements.forEach(el => {
  const height = el.offsetHeight; // Read
  el.style.height = height + 10 + 'px'; // Write
});

// ✅ Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px'; // All writes
});
```

### 对昂贵操作做防抖
```javascript
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Debounce scroll/resize handlers
window.addEventListener('scroll', debounce(handleScroll, 100));
```

### 使用 requestAnimationFrame
```javascript
// ❌ May cause jank
setInterval(animate, 16);

// ✅ Synced with display refresh
function animate() {
  // Animation logic
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### 长列表虚拟化
```javascript
// For lists > 100 items, render only visible items
// Use libraries like react-window, vue-virtual-scroller, or native CSS:
.virtual-list {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* Estimated item height */
}
```

### 用 View Transitions 让导航更顺滑

[View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions) 让浏览器用一个 GPU 合成的快照在两个 DOM 状态之间做交叉淡入（或自定义动画）——不必双重渲染、不会有布局抖动，而且这个快照不计入 CLS。

**同文档（SPA 风格）——Baseline 2026：**
```javascript
// Wrap the DOM mutation that swaps the view
function navigate(newView) {
  if (!document.startViewTransition) return swapDOM(newView);
  document.startViewTransition(() => swapDOM(newView));
}
```

**跨文档（MPA 风格）——Chromium 已稳定，其他浏览器做渐进增强：**
```css
/* On both source and destination pages */
@view-transition { navigation: auto; }
```
集成就这一行——同源导航现在会自动淡入淡出。要让特定元素参与共享元素过渡（例如缩略图放大成 hero 图），给它们一个相同的 `view-transition-name`：
```css
.product-thumb[data-id="42"], .product-hero { view-transition-name: product-42; }
```

与（上文的）Speculation Rules 搭配，就能得到瞬时且有动画的导航。

## 第三方脚本

### 加载策略
```javascript
// ❌ Blocks main thread
<script src="https://analytics.example.com/script.js"></script>

// ✅ Async loading
<script async src="https://analytics.example.com/script.js"></script>

// ✅ Delay until interaction
<script>
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://widget.example.com/embed.js';
      document.body.appendChild(script);
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector('#widget-container'));
});
</script>
```

### 门面（facade）模式
```html
<!-- Show static placeholder until interaction -->
<div class="youtube-facade" 
     data-video-id="abc123" 
     onclick="loadYouTube(this)">
  <img src="/thumbnails/abc123.jpg" alt="Video title">
  <button aria-label="Play video">▶</button>
</div>
```

## 测量

只要 URL 能跑起来，就用[测量工作流](references/MEASUREMENT.md)。它定义了 Chrome DevTools MCP 的路由方式、CrUX 与备选数据源、可复现的实验室条件，以及一套紧凑的证据格式。

| 指标 | 类别 | 解读 |
|--------|------|----------------|
| p75 的 LCP、INP、CLS | 现场（Field） | 反映用户结果的 Core Web Vitals；用于判定优先级 |
| trace 中的 LCP、CLS | 实验室（Lab） | 单次导航的可复现诊断值 |
| TBT | 实验室（Lab） | 主线程阻塞诊断值，也是 INP 的粗略代理，不等于现场 INP |
| FCP、Speed Index | 实验室（Lab） | 加载诊断值，不属于 Core Web Vitals |

裸的 `PerformanceObserver` 片段对当前浏览器会话有用，但它们本身不是真实用户数据。用户需要生产环境遥测时，读[第一方 RUM 参考](references/RUM.md)，并优先使用 `web-vitals`，而不是自己手写指标实现。

## 参考资料

针对 Core Web Vitals 的专项优化，见 [Core Web Vitals](../core-web-vitals/SKILL.md)。
