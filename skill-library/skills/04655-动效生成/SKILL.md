---
name: motion
version: 1.0.0
description: Generate motion effects and animations for e-commerce channel design — splash screen animations, micro-interactions, demo presentations, and transition effects. Uses Galacean Effects API to generate animation JSON configurations and preview demo HTML pages. Use when the user says '做个开屏动效', '加微交互', '生成 demo', '做个转场', or any motion/animation creation intent.
description_zh: 为电商频道设计生成动效 —— 开屏品牌动效、微交互动效、Demo 演示、转场动效。基于 Galacean Effects API 生成动效 JSON 配置和预览 Demo HTML 页面。当用户说'做个开屏动效'、'加微交互'、'生成 demo'、'做个转场'或任何动效/动画创建意图时使用。
user-invocable: true
argument-hint: "<动效描述> 或 '做个开屏动效' / '加微交互' / '生成 demo'"
---

# 动效生成 —— Motion

电商频道动效生成工具。开屏动效、微交互、Demo 演示、转场动效。

## 读取配置（自动生成，请勿删除）

执行任何动作前，读 `~/.qoderwork/plugins/config/super-design-studio/QODERWORK.md`。
- 文件不存在或仍含 `[PLACEHOLDER]` → 停下来，回复用户运行 `/super-design-studio:onboarding`，不要继续。
- 本 skill 会用到配置里的：## 业务规则（设计规范引用路径、频道/产品线）、## 命名规范、## 输出目录偏好
- 配置没覆盖到的字段：反问用户 → 把答案写回 QODERWORK.md → 继续。不要在内存里假设默认值。

## 触发语

- "做个开屏动效"
- "加微交互"
- "生成 demo"
- "做个转场"
- "加个加载动画"
- "做个 [动效描述]"

## Galacean Effects API 参考

本 skill 基于 Galacean Effects 动画引擎。核心 API：

```typescript
// 创建播放器实例
const player = new Player(config: PlayerConfig);

// 加载动效场景
await player.loadScene(url: string | json: object);

// 播放控制
player.play();
player.pause();
player.resume();
player.dispose();  // 销毁并释放资源

// 事件监听
player.on('message', (data) => { /* 动效消息回调 */ });
player.on('error', (err) => { /* 错误处理 */ });
player.on('end', () => { /* 播放结束回调 */ });
```

**PlayerConfig 关键参数：**
- `container`: HTMLElement — 挂载容器
- `pixelRatio`: number — 像素比（默认 window.devicePixelRatio）
- `interactive`: boolean — 是否启用交互
- `autoplay`: boolean — 是否自动播放

**API 文档：** https://galacean.antgroup.com/effects/api/effects/2.9/Player

## 执行流程

### 1. 确定动效类型

根据用户描述判断动效类型：

| 类型 | 典型场景 | 时长参考 | 复杂度 |
|---|---|---|---|
| 开屏品牌动效 | App 启动、频道进入、活动开场 | 2-4 秒 | 高（多图层+时间轴） |
| 微交互动效 | 按钮点击反馈、卡片展开、数字跳动、收藏动效 | 0.2-0.5 秒 | 中（单元素+缓动） |
| Demo 演示 | 功能演示、流程展示、产品讲解 | 5-15 秒 | 高（多步骤+编排） |
| 转场动效 | 页面切换、Tab 切换、弹窗进出 | 0.3-0.6 秒 | 低（容器+过渡） |

**确认流程：**
1. 解析用户描述，判断动效类型
2. 如果描述模糊，询问：
   - 使用场景（哪个页面/模块）？
   - 触发方式（自动播放 / 用户交互触发）？
   - 期望效果（入场/出场/持续/循环）？
3. 确认动效关键参数：
   - 时长
   - 缓动曲线（ease-out 推荐用于入场，ease-in 用于出场）
   - 是否循环

### 2. 生成 Galacean Effects JSON 配置

根据动效类型生成对应的 JSON 配置：

**JSON 结构（简化示意）：**
```json
{
  "version": "2.0",
  "compositions": [
    {
      "name": "main",
      "duration": 3.0,
      "items": [
        {
          "type": "sprite",
          "name": "logo",
          "transform": {
            "position": [0, 0, 0],
            "scale": [1, 1, 1],
            "rotation": [0, 0, 0]
          },
          "content": {
            "renderer": {
              "texture": { "source": "logo.png" }
            }
          },
          "animation": {
            "position": [
              { "time": 0, "value": [0, 100, 0] },
              { "time": 0.5, "value": [0, 0, 0], "easing": "ease-out" }
            ],
            "opacity": [
              { "time": 0, "value": 0 },
              { "time": 0.3, "value": 1 }
            ]
          }
        }
      ]
    }
  ]
}
```

**各类型动效的 JSON 生成要点：**

**开屏品牌动效：**
- 多图层编排：背景 → 品牌元素 → 文字 → CTA
- 时间轴错开入场（staggered entrance）：每层延迟 0.1-0.3s
- 入场使用 ease-out（快入慢停），出场使用 ease-in（慢入快出）
- 结尾留 0.5s 静帧让用户看清最终画面

**微交互动效：**
- 单元素为主，关注缓动曲线的自然感
- 按钮点击：scale 0.95 → 1.0 + 轻微 bounce
- 数字跳动：数值从 0 滚动到目标值，ease-out-cubic
- 收藏/点赞：心跳缩放 + 粒子扩散
- 循环微动效要确保首尾无缝衔接

**Demo 演示：**
- 多步骤编排，步骤间有清晰的视觉节奏
- 每个步骤包含：进入动效 → 停留展示 → 退出动效
- 步骤切换使用统一的转场模式
- 支持 onMessage 事件在关键节点触发文字提示

**转场动效：**
- 进场和出场成对设计
- 方向一致性：同一层级的转场方向应统一（如从左到右）
- 时长严格控制在 0.3-0.6s，超过会感觉卡顿
- 尊重 prefers-reduced-motion：提供降级方案

### 3. 生成预览 Demo HTML

创建一个可直接在浏览器打开的 HTML 预览页：

**HTML 模板结构：**
```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{动效名称} — Demo</title>
  <script src="https://unpkg.com/@galacean/effects/dist/index.min.js"></script>
  <style>
    /* 容器样式 */
    #player-container {
      width: 375px;
      height: 667px;
      margin: 0 auto;
      position: relative;
      background: #000;
    }
    /* 控制栏 */
    .controls { display: flex; gap: 8px; padding: 16px; justify-content: center; }
    .controls button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="player-container"></div>
  <div class="controls">
    <button onclick="player.play()">播放</button>
    <button onclick="player.pause()">暂停</button>
    <button onclick="player.dispose()">重置</button>
  </div>
  <script>
    const player = new ge.Player({
      container: document.getElementById('player-container'),
      interactive: true,
    });
    const sceneJSON = { /* 内嵌动效 JSON */ };
    player.loadScene(sceneJSON);
    player.on('end', () => console.log('Animation ended'));
    player.on('error', (err) => console.error('Animation error:', err));
  </script>
</body>
</html>
```

**预览页要求：**
- 容器尺寸模拟真实设备（375x667 移动端 / 1440x900 桌面端）
- 提供播放/暂停/重置控制按钮
- 显示当前播放进度
- 包含动效参数说明（时长、缓动曲线、触发方式）
- 深色/浅色背景切换（验证不同背景下效果）

### 4. 输出前端可用代码包

将动效打包为前端可直接使用的代码：

**代码包内容：**
- `animation.json` — Galacean Effects 动效配置 JSON
- `demo.html` — 预览 Demo 页面
- `integration-guide.md` — 前端集成指南（如何在项目中引入此动效）

**集成指南模板：**
```markdown
## {动效名称} 集成指南

### 安装依赖
npm install @galacean/effects

### 使用方式
import { Player } from '@galacean/effects';
const player = new Player({ container: document.getElementById('xxx') });
await player.loadScene('./animation.json');
player.play();

### 注意事项
- 容器尺寸建议：{width}x{height}
- 自动播放需要用户交互后才能生效（浏览器策略）
- 支持 prefers-reduced-motion 降级
```

## 产出

- `output/{case-id}/motion/{effect-name}/animation.json` — 动效配置 JSON
- `output/{case-id}/motion/{effect-name}/demo.html` — 预览 Demo 页面
- `output/{case-id}/motion/{effect-name}/integration-guide.md` — 前端集成指南

## Pitfalls
- **不要忽略 prefers-reduced-motion** — 每个动效都必须提供降级方案。在 Demo 页和集成指南中明确说明如何检测和降级。
- **时长控制是关键** — 微交互超过 0.5s 会感觉迟钝，转场超过 0.6s 会感觉卡顿，开屏超过 4s 会引起用户烦躁。严格遵守时长参考。
- **缓动曲线不要全用 linear** — linear 运动看起来不自然。入场用 ease-out（快入慢停），出场用 ease-in（慢入快出），弹性效果用 spring/cubic-bezier。
- **Demo 页不要缺少控制按钮** — 动效预览必须提供播放/暂停/重置控制，方便设计师和开发反复查看效果。
- **资源引用用相对路径** — animation.json 中引用的纹理/图片使用相对路径，不要硬编码绝对路径。
- **不要过度设计** — 电商频道的动效应服务于信息传达和体验流畅度，不要为了炫技而加入不必要的动效。每个动效都要回答"它解决了什么体验问题？"。
- **JSON 配置要合法** — 生成 Galacean Effects JSON 前，确认结构符合其 schema 规范。时间轴关键帧必须按时间升序排列，easing 值必须是引擎支持的标准名称。
