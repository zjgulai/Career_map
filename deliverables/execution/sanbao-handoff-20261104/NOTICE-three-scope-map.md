---
title: 3D 组织空间视觉技法、模型装配与全息采样算法来源声明
doc_type: other
module: handoff
topic: notice-three-scope-map
status: review
created: 2026-11-09
updated: 2026-11-09
owner: self
source: human+ai
---

# 3D 组织空间视觉技法、模型装配与全息采样算法来源声明

本文件记录 `src/orgmap/` 在批次 18–21 升级中所参考的四个外部/同系来源的知识产权与许可证边界。

---

## 1. `https://sagegogo.com/` 与本地 `Sage-2.0-main`

| 项 | 说明 |
| --- | --- |
| **权利归属** | 用户自有项目资产 |
| **引用范围** | 2D 工作视图（Editorial Light：`#ffffff / #f4f7fb / #edf3f9 / #202b38 / #396397`）与 3D 展示空间（Deep-Space Hero Dark：`#030408 / #07121c / #0b1521 / #142033 / #c4d0dc / #aec8e2`）色彩变量、`signal-point` 呼吸光点样式及 `WorldPilot Collection 06` 数字员工头像 WebP 资产 |

---

## 2. `songsummer920-dazzle/three-scope-map-skill`

| 项 | 说明 |
| --- | --- |
| **上游仓库** | `https://github.com/songsummer920-dazzle/three-scope-map-skill` |
| **上游许可证** | `GPL-3.0-or-later` |
| **上游作者声明** | `作者全平台ID：宋夏天Dazzle；公众号：送你整个夏天` |
| **本仓库使用边界** | 本仓库**未复制**该仓库的 Vue 组件、GeoJSON 地图数据或贴图文件；仅在 `src/orgmap/theme.js` 与 `src/orgmap/showcase.js` 中以 clean-room 方式重写了单主色 HSL 增量派生数学、多层厚板侧墙 `smoothstep` 渐变数学、外轮廓分段 quad 追光衰减公式（`pow(1 - d/tail, 1.65)`）、底部同心 `RingGeometry` HUD 环布局及预设相机缓动思想。特此保留对上游作者方法论的致谢声明 |

---

## 3. `https://polyfork.dev/`（`lucas-martinic/polyfork-catalog`）

| 项 | 说明 |
| --- | --- |
| **上游来源** | `https://polyfork.dev/` · `https://github.com/lucas-martinic/polyfork-catalog` |
| **上游许可证** | Mesh 资产 `CC BY 4.0`；`.mjs` 源码为 Polyfork 专有许可（不可再分发源码文件） |
| **本仓库使用边界** | 本仓库**未分发** Polyfork 的 `.mjs` 源码文件，也未引入外部 `.glb` 依赖；仅借鉴其公开文档记录的低多边形装配规范（Y-up、底面 `y=0`、正面 `+Z`、`flatShading: true` + `vertexColors: true`、静态部件合并为单 draw call / `InstancedMesh`），在 `src/orgmap/avatars.js` 与 `src/orgmap/showcase.js` 中自建低多边形科技工装人物与双联屏算力工位 |

---

## 4. `lijiejoy/dsh-skill-image2threejs`

| 项 | 说明 |
| --- | --- |
| **上游仓库** | `https://github.com/lijiejoy/dsh-skill-image2threejs`（参考 `hannesro/image2threejs`） |
| **上游许可证** | `MIT License` |
| **本仓库使用边界** | 借鉴其「离屏 Canvas 网格采样 + 颜色量化 + 亮度映射 Z 轴厚度」思想，在 `src/orgmap/holo.js` 中使用单个 `THREE.InstancedMesh`（1 draw call）全新实现选中数字员工头像的 3D 全息体素扫描投影台 |
