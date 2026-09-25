---
name: dingtalk-h5-signature-pad
description: Implement electronic signature capture using signature_pad in DingTalk WebView H5 pages. Covers canvas initialization, touch coordinate mapping pitfalls, DPR scaling issues, and backend integration for training/course sign-off workflows. Use when building signature features in mobile H5 apps running inside DingTalk or similar enterprise WebViews.
version: 1.0.0
---

# DingTalk H5 电子签字实现 (signature_pad)

## 适用场景

在钉钉 WebView 内的 H5 页面中实现手写电子签名，用于培训确认签字、课程完成签退等场景。技术栈：Vue 3 + signature_pad + FastAPI 后端。

## 核心架构

### 前端流程（SignatureView.vue）

两步式签字流程：
1. **引导页**：展示课程信息 + 承诺词 + 签字预览区（点击开始签字）
2. **签字页**：全屏 canvas 手写签名 → 确认 → 回到预览 → 提交

签字完成后合成白色背景 PNG，以 base64 DataURL 提交到后端。

### 后端存储

- `signature_record` 表：`employee_id + course_id` UNIQUE 约束
- 字段：`sign_image_url`（签名图片路径）、`oath_text`（承诺词）、`sign_time`、`ip`、`user_agent`
- 签名图片由 MediaService 保存为文件，返回 URL

### API 设计

- `POST /api/learning/signature` — 提交签名（base64 图片 + 承诺词）
- `GET /api/learning/signature-status/{course_id}` — 查询签字状态
- `GET /api/learning/my-signatures` — 我的签字记录列表
- `GET /api/learning/signatures` — 管理端签字列表
- `GET /api/learning/signatures/export` — 导出 Excel（openpyxl 嵌入图片）
- `GET /api/learning/signatures/batch-images` — 批量下载签名图片（zip）

## Canvas 初始化（关键代码）

```javascript
function initPad() {
  const canvas = canvasEl.value
  const wrap = canvasWrap.value
  if (!canvas || !wrap) return

  const w = wrap.clientWidth
  const h = wrap.clientHeight
  if (w < 10 || h < 10) {
    setTimeout(initPad, 200)  // 布局未完成时重试
    return
  }

  // ★ 关键：不用 DPR 缩放，canvas.width = CSS width，保证 1:1 坐标映射
  canvas.width = w
  canvas.height = h
  canvas.style.setProperty('width', w + 'px', 'important')
  canvas.style.setProperty('height', h + 'px', 'important')

  requestAnimationFrame(() => {
    if (pad) pad.off()
    pad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(0,0,0,0)',  // 透明背景，导出时合成白色
      penColor: 'rgb(0, 0, 0)',
      minWidth: 0.8,
      maxWidth: 3,
      throttle: 16,
      velocityFilterWeight: 0.7,
      minDistance: 3,
      onBegin: () => { isEmpty.value = false },
    })
  })
}
```

## 签名导出（合成白色背景）

```javascript
function doneSigning() {
  if (!pad || pad.isEmpty()) return
  const dataUrl = pad.toDataURL('image/png')
  const c = canvasEl.value
  const tmp = document.createElement('canvas')
  tmp.width = c.width; tmp.height = c.height
  const ctx = tmp.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, tmp.width, tmp.height)
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    previewUrl.value = tmp.toDataURL('image/png')
    hasSigned.value = true
  }
  img.src = dataUrl
}
```

## 致命陷阱（必须避免）

### 1. 禁止 DPR 缩放
**错误做法**：`canvas.width = w * devicePixelRatio`，然后 CSS 缩小显示。
**后果**：钉钉 WebView 中 CSS 缩放不生效，`getBoundingClientRect()` 返回 buffer 尺寸（如 1080px）而非 CSS 尺寸（360px），signature_pad 坐标映射全部偏移，笔画挤在左上角。
**正确做法**：`canvas.width = w`，DPR=1，buffer 与显示 1:1。

### 2. 禁止 CSS transform: rotate() 强制横屏
CSS 旋转只改变视觉渲染，触摸坐标不跟随旋转，所有笔画映射到同一角落。

### 3. 禁止 canvas 上写 CSS width/height
CSS 类中的 `width: 100%; height: 100%` 会覆盖 JS inline style，导致像素缓冲区与显示尺寸不匹配。只用 JS inline style 设置尺寸。

### 4. 禁止 @touchstart.prevent
Vue 的 `@touchstart.prevent` 会拦截触控事件，signature_pad 收不到落笔点。改用 CSS `touch-action: none` 防滚动。

### 5. 签字页布局用纯页面流
**避免**：`position: fixed`、van-popup、teleport、任何 overlay 方式。钉钉 WebView 中 overlay 内的 canvas 触摸坐标映射异常。
**正确做法**：`display: flex; flex-direction: column; height: 100vh;` 纯页面流布局。进入签字模式时锁定滚动：`document.body.style.overflow = 'hidden'`。

### 6. 签字页 CSS 结构

```scss
.signing-page {
  display: flex;
  flex-direction: column;
  height: 100vh;       // 纯页面流，无 fixed
  background: #f5f6f8;

  &__canvas {
    flex: 1;            // 填满剩余空间
    position: relative;
    margin: 12px;
    overflow: hidden;
    touch-action: none;

    canvas {
      display: block;
      touch-action: none;
      // ★ 不写 CSS width/height，由 JS 设置
    }
  }
}
```

## 前端辅助功能

### 课程列表"待签字"标签

- 后端 `get_my_courses` 返回 `signed`（bool）和 `need_sign`（bool）
- `need_sign = (progress >= 100 or status == 2) and not signed`
- 前端在"已完成"标签旁显示闪烁的"待签字"标签（不替换已完成）

### 课程详情签字横幅

- `get_course_detail` 返回 `signed` 和 `need_sign`
- 页面底部显示橙色横幅"课程已完成，请签字确认"+ 立即签字按钮

## 验证方式

1. 在钉钉中打开 H5 页面，进入已完成课程
2. 点击"待签字"标签进入签字页
3. 手写签名，确认笔画位置与手指位置一致
4. 确认签字 → 预览 → 提交
5. 管理端签字管理页面可查看签名预览、导出 Excel、批量下载
