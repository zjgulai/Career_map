---
name: red-main-ui-template
description: red-main 内容营销平台的 UI 设计系统与静态模版。用于①在本会话内用 dsh-ui 组件还原平台视觉风格；②为新项目生成同风格界面骨架；③复刻平台页面布局（顶部栏/双Tab/数据表格/KOL卡片）。
user-invocable: true
disable-model-invocation: false
---

# red-main UI 模版（设计系统 + 静态壳）

来源：`/Users/lute/project/red-main`（Next.js 16 + shadcn/ui new-york + Tailwind 4，实时项目）。
本技能内置一份自包含静态 HTML 预览壳（`templates/ui-shell.html`），双击即可在浏览器打开，无构建依赖。

## 一、设计令牌（Design Tokens）

### 颜色（oklch，shadcn neutral 基色）
| 令牌 | 值 | 用途 |
|------|-----|------|
| `background` | `oklch(1 0 0)` | 页面底色（纯白） |
| `foreground` | `oklch(0.145 0 0)` | 主文字（近黑） |
| `card` | `oklch(1 0 0)` | 卡片底色 |
| `muted` / `secondary` / `accent` | `oklch(0.97 0 0)` | 浅灰填充/悬停 |
| `muted-foreground` | `oklch(0.556 0 0)` | 次要文字 |
| `border` / `input` | `oklch(0.922 0 0)` | 边框/输入框 |
| `primary` | `oklch(0.205 0 0)` | 主按钮（近黑） |
| `primary-foreground` | `oklch(0.985 0 0)` | 主按钮文字（近白） |
| `destructive` | `oklch(0.577 0.245 27.325)` | 危险操作（红） |
| `ring` | `oklch(0.708 0 0)` | 焦点环 |

### 图表序列色（chart-1..5，数据可视化专用）
- chart-1 `oklch(0.646 0.222 41.116)` 橙红
- chart-2 `oklch(0.6 0.118 184.704)` 青
- chart-3 `oklch(0.398 0.07 227.392)` 蓝
- chart-4 `oklch(0.828 0.189 84.429)` 黄绿
- chart-5 `oklch(0.769 0.188 70.08)` 黄

### 圆角 / 字体 / 阴影
- 圆角基准 `--radius: 0.625rem`（10px）；`radius-sm=-4px`、`radius-md=-2px`、`radius-lg=+0`、`radius-xl=+4px`
- 字体栈：`'PingFang SC','Hiragino Sans GB','Microsoft YaHei', ui-sans-serif, system-ui, -apple-system, ...`
- 阴影：卡片 `shadow-sm`；弹层 `shadow-md`；主题风格为 flat/极简（new-york 变体）

### 图标
- lucide 图标库（`components.json: iconLibrary: lucide`）

## 二、页面骨架（首页结构）

```
┌────────────────────────────────────────────┐
│ 顶部栏：左"内容管理系统"标题 + 右用户菜单/配额入口 │
├────────────────────────────────────────────┤
│ Tab 栏：[内容管理] [KOL管理]  （sessionStorage: cms_active_tab） │
├────────────────────────────────────────────┤
│ 工具栏：搜索框 / 平台筛选 / 活动筛选 / 添加内容按钮 │
│ 数据表：标题 | 平台 | 发布账号 | 播放/点赞/评论 | 趋势 | 操作 │
│        （三态排序：升/降/还原；行内历史数据抽屉）        │
│ KOL Tab：卡片网格（头像/名称/领域/账号粉丝/合作数据）    │
└────────────────────────────────────────────┘
```

## 三、在会话内还原 red-main 风格（dsh-ui 映射）

当需要在对话里呈现"平台风格"的 UI 时：
1. **数据表** → `table` 组件；数值列（播放量/互动）用真实数值（自动右对齐、千分位）
2. **平台标记** → `badge`（tone: accent=IG/INS 粉红系、success=YouTube、danger=TikTok、info=FB）
3. **趋势对比** → `chart`(bars) 用 chart-1..5 序列色；或 `echart` preset bar/line
4. **合作进度/预算占比** → `progress`，颜色用 chart 序列
5. **KOL 名片** → `card` + `avatar`（首字头像）+ `keyvalue`（粉丝数/国家/领域）
6. **状态提示** → `callout`（tone: info/success/warning/error）
7. 标题层级：`text` h3 为主，正文 body，注释 muted

## 四、新项目脚手架（用本模版起界面）

1. 复制 `templates/ui-shell.html` 作为静态原型（改数据即可演示）
2. 正式工程：Next.js 16 + shadcn/ui `pnpm dlx shadcn@latest init` 选 **new-york / neutral / CSS variables**
3. 把上文令牌原样写入 `globals.css`（:root 与 .dark 两套）
4. 布局按「二、页面骨架」搭：Topbar → Tabs → Toolbar → Table/Cards
5. 平台图标用 lucide 的 `Facebook` `Instagram` `Youtube` `Music2`(TikTok) `Pin`(Pinterest)

## 五、边界

- 本技能内置的是**视觉模版与设计系统**，不是可执行服务；red-main 运行时仍由项目本身提供（`cd /Users/lute/project/red-main && pnpm run dev`，端口 3000，若 5000 被占用请直启 `node node_modules/next/dist/bin/next dev --port 3000`）
- 静态壳仅用于视觉预览/原型，不含后端与鉴权逻辑
- 修改设计令牌时同步更新本文件与 `templates/ui-shell.html`
