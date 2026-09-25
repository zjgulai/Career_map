---
name: "accessibility"
title: "无障碍合规审计"
description: "按 WCAG 2.2 逐条审计并修复网页无障碍：对比度阈值、键盘与焦点、目标尺寸、表单标签、ARIA 与测试清单。触发词：无障碍合规审计、accessibility、按 WCAG 2.2 逐条审计并修复网页无障碍：对比度阈值、键盘与焦点、目标尺寸、表单标签、ARIA 与测试清单。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 无障碍（a11y）

基于 WCAG 2.2 与 Lighthouse 无障碍审计的完整无障碍指南。目标：让内容对所有人可用，包括残障人士。

## 以证据为准绳的审计流程

有可渲染的页面时：

1. 具备相应能力时，跑一次实时的 Lighthouse 无障碍审计；用 Chrome DevTools MCP 时使用 `lighthouse_audit`。面向公众的普通页面用移动端 navigation 模式；重新加载会丢失登录态或用户创建的状态时，用 snapshot 模式。
2. 用审计失败的节点定位到相关组件或模板，而不是在整个仓库里搜通用模式。
3. 检查渲染后的无障碍树快照，关注名称、角色、状态、landmark 与标题层级；用 Chrome DevTools MCP 时使用 `take_snapshot`。并用键盘把受影响的流程走一遍。
4. 修源码，然后重跑同一套审计与手动操作。

实时工具不可用时，用 Lighthouse CLI 或 axe 覆盖自动化检查，并完成同样的手动检查。自动化工具只能发现一部分无障碍障碍：100 分不等于符合 WCAG，分数低也不能替代逐条问题的证据。

## WCAG 原则：POUR

| 原则 | 说明 |
|-----------|-------------|
| **可感知（Perceivable）** | 内容能通过不同的感官被感知 |
| **可操作（Operable）** | 界面能被所有用户操作 |
| **可理解（Understandable）** | 内容与界面可被理解 |
| **健壮（Robust）** | 内容能与辅助技术协同工作 |

## 符合级别

| 级别 | 要求 | 目标 |
|-------|-------------|--------|
| **A** | 最低限度的无障碍 | 必须通过 |
| **AA** | 标准符合性 | 应当通过（在许多司法辖区是法律要求） |
| **AAA** | 增强的无障碍 | 有则更好 |

---

## 可感知

### 文本替代（1.1）

**图片需要 alt 文本：**
```html
<!-- ❌ Missing alt -->
<img src="chart.png">

<!-- ✅ Descriptive alt -->
<img src="chart.png" alt="Bar chart showing 40% increase in Q3 sales">

<!-- ✅ Decorative image (empty alt) -->
<img src="decorative-border.png" alt="" role="presentation">

<!-- ✅ Complex image with longer description -->
<figure>
  <img src="infographic.png" alt="2024 market trends infographic" 
       aria-describedby="infographic-desc">
  <figcaption id="infographic-desc">
    <!-- Detailed description -->
  </figcaption>
</figure>
```

**图标按钮需要可访问名称：**
```html
<!-- ❌ No accessible name -->
<button><svg><!-- menu icon --></svg></button>

<!-- ✅ Using aria-label -->
<button aria-label="Open menu">
  <svg aria-hidden="true"><!-- menu icon --></svg>
</button>

<!-- ✅ Using visually hidden text -->
<button>
  <svg aria-hidden="true"><!-- menu icon --></svg>
  <span class="visually-hidden">Open menu</span>
</button>
```

**视觉隐藏类：**
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 颜色对比度（1.4.3、1.4.6）

| 文字大小 | AA 最低 | AAA 增强 |
|-----------|------------|--------------|
| 正文（< 18px / 加粗 < 14px） | 4.5:1 | 7:1 |
| 大号文字（≥ 18px / 加粗 ≥ 14px） | 3:1 | 4.5:1 |
| UI 组件与图形 | 3:1 | 3:1 |

```css
/* ❌ Low contrast (2.5:1) */
.low-contrast {
  color: #999;
  background: #fff;
}

/* ✅ Sufficient contrast (7:1) */
.high-contrast {
  color: #333;
  background: #fff;
}

/* ✅ Focus states need contrast too (3:1 against background, WCAG 1.4.11) */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

**不要只靠颜色传达信息：**
```html
<!-- ❌ Only color indicates error -->
<input class="error-border">
<style>.error-border { border-color: red; }</style>

<!-- ✅ Color + icon + text -->
<div class="field-error">
  <input aria-invalid="true" aria-describedby="email-error">
  <span id="email-error" class="error-message">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Please enter a valid email address
  </span>
</div>
```

### 媒体替代（1.2）

```html
<!-- Video with captions -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English" default>
  <track kind="descriptions" src="descriptions.vtt" srclang="en" label="Descriptions">
</video>

<!-- Audio with transcript -->
<audio controls>
  <source src="podcast.mp3" type="audio/mp3">
</audio>
<details>
  <summary>Transcript</summary>
  <p>Full transcript text...</p>
</details>
```

---

## 可操作

### 键盘可操作（2.1）

**所有功能都必须能通过键盘操作。** 优先使用原生交互元素——`<button>`、`<a href>` 与表单控件自带 Enter/Space 激活、焦点管理与辅助技术语义。只有在无法使用原生元素时，才自己写键盘处理。

```html
<!-- ❌ Non-interactive element with click only: not focusable, no keyboard activation -->
<div class="card" onclick="handleAction()">Open</div>

<!-- ✅ Best: use a native button -->
<button type="button" onclick="handleAction()">Open</button>
```

```javascript
// ✅ When you MUST use a non-interactive element (e.g. div with role="button"),
// make it focusable AND handle keyboard activation. Do NOT add this to a native
// <button> — Enter/Space already fire click, so you'd double-trigger.
element.setAttribute('role', 'button');
element.setAttribute('tabindex', '0');
element.addEventListener('click', handleAction);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
});
```

**不能有键盘陷阱。** 用户必须能用 Tab 进入并离开每一个组件。对话框请用[模态焦点陷阱模式](references/A11Y-PATTERNS.md#modal-focus-trap)——原生的 `<dialog>` 元素会自动处理这件事。

### 焦点可见（2.4.7）

```css
/* ❌ Never remove focus outlines */
*:focus { outline: none; }

/* ✅ Use :focus-visible for keyboard-only focus */
:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid currentColor; /* inherits text color → already contrast-checked */
  outline-offset: 2px;
}

/* ✅ Or pick a brand color and verify ≥3:1 contrast against every background it lands on */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.5);
}
```

### 焦点不被遮挡（2.4.11）——2.2 新增

元素获得键盘焦点时，不得被作者创建的其他内容完全遮住，例如吸顶头部、页脚或重叠的面板。在 AAA 级（2.4.12），被聚焦元素不得有任何部分被遮挡。

```css
/* ✅ Account for sticky headers when scrolling to focused elements */
:target {
  scroll-margin-top: 80px;
}

/* ✅ Ensure focused items clear fixed/sticky bars */
:focus {
  scroll-margin-top: 80px;
  scroll-margin-bottom: 60px;
}
```

### 跳转链接（2.4.1）

提供跳转链接，让键盘用户可以绕过重复出现的导航。完整标记与样式见[跳转链接模式](references/A11Y-PATTERNS.md#skip-link)。

### 目标尺寸（2.5.8）——2.2 新增

交互目标的尺寸至少为 **24 × 24 CSS 像素**（AA）。例外：行内文本链接、尺寸由浏览器控制的元素，以及以目标包围盒为中心画一个 24px 圆不会与其它目标重叠的情形。

```css
/* ✅ Minimum target size */
button,
[role="button"],
input[type="checkbox"] + label,
input[type="radio"] + label {
  min-width: 24px;
  min-height: 24px;
}

/* ✅ Comfortable target size (recommended 44×44) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

### 拖拽操作（2.5.7）——2.2 新增

任何需要拖拽的操作，都必须提供单指针的替代方式（例如按钮、输入框）。可排序列表的示例见[拖拽操作模式](references/A11Y-PATTERNS.md#dragging-movements)。

### 时限（2.2）

```javascript
// Allow users to extend time limits
function showSessionWarning() {
  const modal = createModal({
    title: 'Session Expiring',
    content: 'Your session will expire in 2 minutes.',
    actions: [
      { label: 'Extend session', action: extendSession },
      { label: 'Log out', action: logout }
    ],
    timeout: 120000
  });
}
```

### 动效（2.3）

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 可理解

### 页面语言（3.1.1）

```html
<!-- ❌ No language specified -->
<html>

<!-- ✅ Language specified -->
<html lang="en">

<!-- ✅ Language changes within page -->
<p>The French word for hello is <span lang="fr">bonjour</span>.</p>
```

### 一致的导航（3.2.3）

```html
<!-- Navigation should be consistent across pages -->
<nav aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

### 一致的帮助入口（3.2.6）——2.2 新增

如果某种帮助机制（联系方式、聊天组件、FAQ 链接、自助入口）在多个页面上重复出现，它每次都必须处于**相同的相对顺序**。依赖固定位置的用户，不该在每个页面重新寻找帮助入口。

### 表单标签（3.3.2）

每个输入控件都需要以程序方式关联的标签。显式、隐式与带操作说明的示例见[表单标签模式](references/A11Y-PATTERNS.md#form-labels)。

### 错误处理（3.3.1、3.3.3）

用 `role="alert"` 或 `aria-live` 把错误播报给屏幕阅读器，在校验未通过的字段上设置 `aria-invalid="true"`，并在提交时把焦点移到第一个错误。完整标记与 JS 见[错误处理模式](references/A11Y-PATTERNS.md#error-handling)。

### 重复录入（3.3.7）——2.2 新增

不要强迫用户重新输入他们在同一次会话中已经提供过的信息。从先前的步骤自动填充，或让用户从已填过的值中选择。例外：安全层面的再次确认，以及已经过期失效的内容。

```html
<!-- ✅ Auto-fill shipping address from billing -->
<fieldset>
  <legend>Shipping address</legend>
  <label>
    <input type="checkbox" id="same-as-billing" checked>
    Same as billing address
  </label>
  <!-- Fields auto-populated when checked -->
</fieldset>
```

### 可访问的身份认证（3.3.8）——2.2 新增

登录流程不得依赖认知功能测试（例如记住密码、解谜题），除非至少满足以下一项：
- 提供复制粘贴或自动填充机制
- 存在替代方式（例如 passkey、SSO、邮件链接）
- 该测试基于物体识别或个人内容（仅 AA 允许；AAA 取消这一例外）

```html
<!-- ✅ Allow paste in password fields -->
<input type="password" id="password" autocomplete="current-password">

<!-- ✅ Offer passwordless alternatives -->
<button type="button">Sign in with passkey</button>
<button type="button">Email me a login link</button>
```

---

## 健壮

### ARIA 用法（4.1.2）

**优先使用原生元素：**
```html
<!-- ❌ ARIA role on div -->
<div role="button" tabindex="0">Click me</div>

<!-- ✅ Native button -->
<button>Click me</button>

<!-- ❌ ARIA checkbox -->
<div role="checkbox" aria-checked="false">Option</div>

<!-- ✅ Native checkbox -->
<label><input type="checkbox"> Option</label>
```

**确实需要 ARIA 时**，使用正确的角色与状态。完整的 tablist 示例见 [ARIA tabs 模式](references/A11Y-PATTERNS.md#aria-tabs)。

### 实时区域（4.1.3）

用 `aria-live` 区域在不移动焦点的前提下播报动态内容变化。标记示例与 `showNotification()` 辅助函数见[实时区域模式](references/A11Y-PATTERNS.md#live-regions-and-notifications)。

---

## 测试清单

### 自动化测试

优先使用能把失败节点直接返回给 agent 的实时 Lighthouse 审计。用 Chrome DevTools MCP 时就是 `lighthouse_audit`。否则：

```bash
# Lighthouse accessibility audit
npx lighthouse https://example.com --only-categories=accessibility

# axe-core
npm install @axe-core/cli -g
axe https://example.com
```

### 手动测试

- [ ] **键盘导航：** 用 Tab 走遍整个页面，用 Enter/Space 激活
- [ ] **屏幕阅读器：** 用 VoiceOver（Mac）、NVDA（Windows）或 TalkBack（Android）测试
- [ ] **缩放：** 200% 缩放时内容仍然可用
- [ ] **高对比度：** 用 Windows 高对比度模式测试
- [ ] **减弱动效：** 用 `prefers-reduced-motion: reduce` 测试
- [ ] **焦点顺序：** 合乎逻辑，且与视觉顺序一致
- [ ] **目标尺寸：** 交互元素满足 24×24px 的最低要求

VoiceOver 与 NVDA 的快捷键见[屏幕阅读器命令参考](references/A11Y-PATTERNS.md#screen-reader-commands)。

---

## 按影响排序的常见问题

### 严重（立即修复）
1. 缺少表单标签
2. 图片缺少 alt 文本
3. 颜色对比度不足
4. 键盘陷阱
5. 没有焦点指示

### 重要（上线前修复）
1. 缺少页面语言声明
2. 缺少标题层级结构
3. 链接文字没有描述性
4. 自动播放的媒体
5. 缺少跳转链接

### 中等（尽快修复）
1. 图标缺少 ARIA 标签
2. 导航不一致
3. 缺少错误标识
4. 有限时但没有控制手段
5. 缺少 landmark 区域

## 参考资料

- [WCAG 2.2 快速参考](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Deque axe Rules](https://dequeuniversity.com/rules/axe/)
- [Web Quality Audit](../web-quality-audit/SKILL.md)
- [WCAG 条款参考](references/WCAG.md)
- [无障碍代码模式](references/A11Y-PATTERNS.md)
