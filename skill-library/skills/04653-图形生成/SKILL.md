---
name: graphic
version: 1.1.0
description: Generate graphic assets for e-commerce channel design — icons, illustrations, banners, and decorative elements. Routes between three generation paths: SVG code graphics, AI image generation, and hybrid (AI base + SVG overlay). Use when the user says '画个图标', '生成插画', '做个 banner', '做个素材', or any graphic asset creation intent.
description_zh: 为电商频道设计生成图形资产 —— 图标、插画、Banner、装饰元素。根据需求在三条生成路径间路由：SVG 代码图形、AI 生图、混合模式（AI 底图 + SVG 叠加）。当用户说'画个图标'、'生成插画'、'做个 banner'、'做个素材'或任何图形资产创建意图时使用。
user-invocable: true
argument-hint: "<图形描述> 或 '画个图标' / '生成插画' / '做个 banner'"
---

# 图形生成 —— Graphic

电商频道图形资产生成工具。图标、插画、Banner、装饰元素。

## 读取配置（自动生成，请勿删除）

执行任何动作前，读 `~/.qoderwork/plugins/config/super-design-studio/QODERWORK.md`。
- 文件不存在或仍含 `[PLACEHOLDER]` → 停下来，回复用户运行 `/super-design-studio:onboarding`，不要继续。
- 本 skill 会用到配置里的：## 业务规则（设计规范引用路径、频道/产品线）、## 命名规范、## 输出目录偏好
- 配置没覆盖到的字段：反问用户 → 把答案写回 QODERWORK.md → 继续。不要在内存里假设默认值。

## 触发语

- "画个图标"
- "生成插画"
- "做个 banner"
- "做个素材"
- "画一个 [图形描述]"
- "生成 [场景] 的背景图"

## 执行流程

### 1. 类型判断与路由

根据用户描述判断图形类型，路由到对应生成路径：

**判断维度：**

| 需求特征 | 路由 | 原因 |
|---|---|---|
| 图标、Logo、简单几何图形、线条图 | SVG 路径 | 矢量、可缩放、代码可控 |
| 写实场景、摄影风格、复杂插画、纹理背景 | AI 生图路径 | 需要像素级画面表现力 |
| Banner（含文字+图）、卡片背景（含品牌元素）、活动氛围图 | 混合路径 | 底图 AI 生成 + 文字/品牌元素 SVG 叠加确保清晰 |

**路由确认：**
1. 解析用户描述，判断图形类型
2. 如果判断不确定（如"做个图"），向用户确认：
   - 需要矢量图（可无限缩放）还是位图（丰富画面）？
   - 是否需要包含文字内容？
   - 使用场景（页面内嵌 / 全屏背景 / 社交媒体）？
3. 向用户说明将采用的路径和预期产出格式

### 2A. SVG 路径

适用于图标、简单插画、几何图形、Banner 文字排版。

**执行步骤：**
1. 根据描述确定 SVG 参数：
   - viewBox 尺寸（图标 24x24 / 插画 400x300 / Banner 750x400）
   - 风格：线性（stroke-based）/ 面性（fill-based）/ 混合
   - 颜色方案：从设计系统取色（如有），或根据描述配色
2. 生成 SVG 代码：
   - 使用语义化标签（`<title>`, `<desc>` 提升无障碍性）
   - 路径使用简洁的 d 属性（避免冗余节点）
   - 颜色使用 CSS 变量或 currentColor 以便主题适配
   - 添加适当的 aria-label
3. 输出 SVG 文件 + HTML 预览页

**SVG 质量检查：**
- 所有路径闭合
- 无重叠不可见元素
- viewBox 与实际内容匹配
- 在 16px 和 512px 两个尺寸下测试可读性

### 2B. AI 生图路径

适用于写实插画、摄影风格素材、复杂场景、纹理背景。

**前提：需要 AI 生图 MCP 已连接。**

检查 `## 已连接的工具` 中 AI 生图状态：

**已连接（✓）：**
1. 根据用户描述构建 prompt：
   - 明确画面内容、风格、色调、构图
   - 加入电商频道相关上下文（如促销氛围、品牌调性）
   - 指定输出尺寸和比例
2. 调用 AI 生图 API 生成素材
3. 保存到 output/{case-id}/graphic/ 目录

**未连接（✗）：**
1. 告知用户："AI 生图工具未连接，无法生成位图素材。"
2. 提供替代方案：
   - 切换为 SVG 路径生成矢量近似版本
   - 生成带标注的占位图（灰色块 + 描述文字），用户后续替换
3. 不要假装已生成图片

### 2C. 混合路径

适用于 Banner（文字 + 背景图）、卡片背景（品牌元素 + 纹理）、活动氛围图。

**执行步骤：**
1. **底图层（AI 生成或 SVG 图案）：**
   - 如果 AI 生图 MCP 已连接：生成背景底图（模糊/渐变/纹理/场景）
   - 如果未连接：用 SVG 生成几何图案底图（渐变、点阵、波浪等）
2. **叠加层（SVG 代码）：**
   - 文字内容：标题、副标题、价格信息（使用 SVG text 确保字体渲染一致）
   - 品牌元素：Logo、标签、角标
   - 装饰元素：边框、分隔线、图标
   - CTA 按钮：文字 + 形状
3. **合成输出：**
   - HTML 版（底图 `<img>` + SVG overlay 绝对定位叠加）
   - 纯 SVG 版（如果底图也是 SVG，全部合到一个 SVG 文件）
   - PNG 导出说明（标注推荐导出尺寸和工具）

### 3. 产出输出

**文件组织：**
- `output/{case-id}/graphic/{asset-name}.svg` — SVG 文件
- `output/{case-id}/graphic/{asset-name}.png` — PNG 文件（AI 生图路径）
- `output/{case-id}/graphic/{asset-name}-preview.html` — HTML 预览页
- `output/{case-id}/graphic/{asset-name}-composite.html` — 混合路径合成 HTML

## SVG 图形技术规范

生成 SVG 代码时必须遵循的技术标准，确保产出物可直接集成到生产环境。

### viewBox 和尺寸约定

| 图形类型 | viewBox | 说明 |
|---|---|---|
| 功能图标 | `0 0 24 24` | 与 Material Icons 体系兼容，描边宽度 1.5-2px |
| 装饰图标 | `0 0 32 32` | 装饰性更强的图标，允许更复杂的细节 |
| 插画 | `0 0 400 300` | 4:3 比例插画，适合卡片内嵌和空状态 |
| Banner 横版 | `0 0 750 400` | 电商频道通用 Banner 比例 |
| Banner 全幅 | `0 0 1125 600` | 移动端全幅 Banner（375*3 宽度 @3x） |
| 角标/徽章 | `0 0 48 48` | 商品卡片角标（新品、热销、折扣等） |

### currentColor 使用规则

1. **可染色图标（tintable icons）：**
   - 所有单色图标的 fill/stroke 必须使用 `currentColor`
   - 外层容器通过 CSS `color` 属性控制图标颜色
   - 示例：`<svg fill="currentColor" ...>` 而非 `<svg fill="#FF6600" ...>`
2. **多色图标：**
   - 主色使用 CSS 变量 `var(--icon-primary, currentColor)`
   - 辅色使用 `var(--icon-secondary, #666)`
   - 不使用硬编码十六进制色值（除非是固定品牌色）
3. **例外情况：**
   - 品牌 Logo 类图形使用固定品牌色（不随主题变化）
   - 状态色图标（成功/警告/错误）使用固定语义色

### 路径优化

1. **减少锚点：**
   - 直线段合并：连续水平/垂直线段合并为单条路径指令
   - 曲线简化：用二次贝塞尔（Q）替代不必要的三次贝塞尔（C）
   - 删除不可见路径（被其他元素完全遮挡的 path）
2. **合并同色路径：**
   - 相同 fill/stroke 的相邻 path 合并为单个 `<path>` 元素
   - 使用 `<g>` 分组管理同色系元素，便于统一样式控制
3. **清理冗余：**
   - 去除编辑器生成的元数据（Adobe Illustrator / Sketch / Figma 导出注释）
   - 去除 `<defs>` 中未被引用的渐变、滤镜、裁剪路径
   - 去除空的 `<g>` 分组和重复的 `transform` 属性
4. **文件大小目标：**
   - 功能图标 < 1KB（优化后）
   - 装饰图标 < 3KB
   - 插画 < 15KB
   - Banner < 30KB

### 响应式 SVG

1. **preserveAspectRatio 策略：**
   - 图标：`preserveAspectRatio="xMidYMid meet"`（默认，等比缩放居中）
   - Banner 背景：`preserveAspectRatio="xMidYMid slice"`（裁切填充，无空白）
   - 装饰图案：`preserveAspectRatio="none"`（拉伸填满容器，仅限纯几何图案）
2. **尺寸声明：**
   - 不在 SVG 标签上设置固定 `width`/`height`，由外层 CSS 控制
   - 仅声明 `viewBox`，让 SVG 自适应容器尺寸
   - 如需固定宽高比，在外层容器设置 `aspect-ratio` CSS 属性

### SVG Sprite + use 机制

1. **Sprite 格式：**
   - 所有功能图标统一收录到 `icons-sprite.svg`
   - 每个图标用 `<symbol id="icon-{name}" viewBox="0 0 24 24">` 包裹
   - 与 ui-design-engineer 的图标系统兼容，通过 `<use href="#icon-{name}">` 引用
2. **命名规范：**
   - 功能图标：`icon-{动作}-{对象}`（如 `icon-arrow-right`、`icon-cart-add`）
   - 状态图标：`icon-status-{状态}`（如 `icon-status-success`、`icon-status-error`）
   - 品牌图标：`icon-brand-{品牌名}`（如 `icon-brand-tmall`）
3. **使用示例：**
   ```html
   <!-- 引用 Sprite 中的图标 -->
   <svg width="24" height="24" aria-label="加入购物车">
     <use href="icons-sprite.svg#icon-cart-add" />
   </svg>
   ```

## AI 生图 Prompt 工程

构建高质量 AI 生图 prompt 的模板和最佳实践。

### 电商场景 Prompt 模板

1. **商品展示图：**
   ```
   [商品名称], product photography, studio lighting, clean white/gradient background,
   centered composition, high resolution, commercial quality,
   e-commerce product listing style, no text overlay
   ```
2. **频道背景图：**
   ```
   abstract [风格] background, [色调] color palette, soft gradient,
   subtle texture, e-commerce banner background,
   wide aspect ratio 16:9, no text, no objects, clean and minimal
   ```
3. **营销氛围素材：**
   ```
   [节日/活动名称] celebration atmosphere, [色调] festive colors,
   [元素描述] confetti/ribbons/sparkles, dynamic composition,
   promotional material style, vibrant and energetic, no text
   ```
4. **场景化插画：**
   ```
   [场景描述], [风格] illustration style, [色调] color scheme,
   flat design / isometric / watercolor, e-commerce context,
   friendly and approachable mood, no text
   ```

### 风格控制关键词

| 风格 | 正面关键词 | 适用场景 |
|---|---|---|
| 扁平 | flat design, vector art, clean lines, minimal shading | 功能插画、空状态、引导页 |
| 拟物 | skeuomorphic, realistic textures, depth, shadows, gradients | 高端品牌频道、质感背景 |
| 3D | 3D render, volumetric lighting, clay material, soft shadows, blender style | 新品发布、科技品类、潮流频道 |
| 手绘 | hand-drawn, sketch style, pencil lines, watercolor wash, organic shapes | 文艺品类、手工艺频道（谨慎使用） |
| 像素 | pixel art, 8-bit style, retro gaming aesthetic | 游戏品类、怀旧主题活动 |

### 负面 Prompt

生成时必须附加的负面 prompt（避免不需要的元素）：

```
text, watermark, logo, signature, blurry, low quality, distorted,
deformed, ugly, duplicate, bad anatomy, extra limbs,
human face, real person, celebrity likeness, trademark symbols
```

**电商场景特别排除：**
- `no real brand logos` — 避免生成真实品牌标识引发版权问题
- `no human faces` — 避免人脸生成质量不稳定和肖像权风险
- `no readable text` — AI 生成的文字通常不可读，文字内容一律用 SVG 叠加

### 后处理流程

AI 生图完成后，根据用途进行后处理：

1. **裁切（Crop）：**
   - 去除 AI 生成图片边缘的模糊/畸变区域（通常 2-5% 边距）
   - 按目标比例裁切（Banner 16:9 / 卡片背景 4:3 / 方形 1:1）
2. **调色（Color Adjust）：**
   - 根据设计系统色板微调主色调（色相偏移 ±10 度以内）
   - 统一亮度和对比度（避免与页面其他元素视觉落差过大）
   - 确保输出 sRGB 色彩空间（Web 标准）
3. **叠加（Overlay）— 混合路径专属：**
   - 底图模糊处理（高斯模糊 radius=2-4px）后作为背景层
   - SVG 叠加层定位到正确位置（文字、品牌元素、CTA 按钮）
   - 检查叠加层与底图的对比度（文字可读性优先）

## 产出

- SVG / PNG / HTML 文件（取决于路由路径）
- HTML 预览页（展示图形在不同尺寸下的效果）

## MCP 依赖

| MCP 工具 | 用途 | 未连接时 fallback |
|---|---|---|
| AI 生图 | 生成素材图、背景图、写实插画 | 纯 SVG 路径 / 占位图标注 |

## Pitfalls / 质量红线

- **不用手绘/涂鸦风格 SVG** — AI 生成的 sketchy/hand-drawn 风格 SVG 质量差（路径抖动、锚点冗余、缩放失真）。手绘风格需求统一使用 AI 生图路径生成位图，而非 SVG 模拟。SVG 路径只产出干净的几何/扁平风格图形。
- **AI 生图结果必须人工审核后才能使用** — AI 生成的图片可能包含不恰当内容（隐性版权元素、不合规文字、不当形象）。所有 AI 生图产出必须标注 `[AI 生成 — 待人工审核]`，用户确认后才可集成到最终设计稿。不得将 AI 生图结果直接作为最终交付物。
- **SVG 代码必须经过优化** — 禁止直接输出编辑器（Illustrator/Sketch/Figma）导出的未优化 SVG。必须清理：编辑器元数据注释、未引用的 `<defs>` 定义、冗余 transform 属性、重复的 style 声明。优化前后文件大小差异应 > 30%。
- **颜色必须遵循设计系统的色板** — SVG 中的颜色必须从 QODERWORK.md 中引用的设计系统色板取值，不得随意使用取色器选色。如果设计系统未定义某个所需颜色，向用户确认后补充到色板中，而非自行决定。使用 CSS 变量引用色值（如 `var(--color-brand-primary)`）。
- **产出物必须标注来源** — 每个图形资产必须在元数据或配套说明中标注生成方式：`[SVG 手写]`、`[AI 生成 — {模型名} — {日期}]`、`[混合 — AI 底图 + SVG 叠加]`。遵循 QODERWORK.md 引用来源标注规则，确保图形资产可追溯。
- **不要生成有版权风险的图形** — 不要生成包含真实品牌 Logo、真人面部、知名 IP 形象的图形。如需品牌元素，使用占位标注。
- **SVG 不要过度复杂** — 单文件 SVG 控制在 500 行以内。超过时应拆分为多个组件或使用 `<symbol>` + `<use>` 复用。
- **混合路径的层级要清晰** — 底图和叠加层的 z-index 关系必须明确，不要让叠加元素被底图遮挡。
- **AI 生图 prompt 要具体** — 不要写"一张好看的图"，要写明风格（扁平/写实/3D）、色调（暖色/冷色/品牌色）、构图（居中/对角/三分法）、用途（Banner 背景/商品卡片装饰）。
- **始终提供预览** — 无论哪条路径，都要生成 HTML 预览页让用户在浏览器中查看效果，而非只输出源文件。
- **颜色要可定制** — SVG 中尽量使用 CSS 变量（`var(--brand-primary)`）或 `currentColor`，方便后续主题切换。
