---
name: lute-brand-icons
description: 生成 LUTE 品牌风格的方形徽章类人漫画头像 icon（爸爸/妈妈/宝宝角色，品牌绿 #58B848 细描边方形框，头部占比 80-85%，胸口职业徽章）。Use when creating avatar/badge icons for agent presets, workplace role cards, team members, or any square badge icon in the LUTE brand style.
enabled: "true"
user-invocable: true
workflow: "确定角色与配件；选择或新建 catalog 条目；运行 build.js 生成 SVG 与 manifest；双主题预览验收；交付并接入预设"
title: "lute-brand-icons"
input_contract: 角色（爸爸/妈妈/宝宝）+职业或岗位与配件
output_contract: 品牌绿方形徽章头像：SVG源文件+图标索引+明暗双主题预览图
example: 说「给产品经理角色画个头像」→ 得到品牌绿细描边方形徽章SVG与双主题预览

---

# LUTE 品牌方形徽章头像（lute-brand-icons）

生成与 LUTE Agentic System 品牌一致的方形圆角徽章头像。本 skill 沉淀自 DSH Desktop「Agent 预设」卡片头像的最终验收版设计（2026-09-04），核心价值：**任意 Agent 读本规范即可无脑复现同一家族风格**。

## 触发场景
- 为 agent 预设 / 岗位卡片 / 团队成员生成头像 icon
- 需要"爸爸/妈妈/宝宝"类人漫画角色
- 需要与品牌绿 #58B848 调性一致的方形徽章

## 品牌规范（强制参数，不得偏离）

### 徽章框架
- viewBox `0 0 100 100`；外框 `rect x=4.5 y=4.5 w=91 h=91 rx=18`，描边 `#58B848` `stroke-width=2.2`
- 单层底部投影 `rect y+3.7 fill rgba(0,0,0,0.12)`（立体感但轻薄）
- 内衬渐变（上→下）`#EDF6E6 → #D3EAC2 → #B4D9A0`
- 左上径向高光 `rgba(255,255,255,0.68)`（cx 0.3 cy 0.2）
- 内斜面：左上白描边 1.5px `rgba(255,255,255,0.55)`；右下深绿描边 1.5px `rgba(46,125,60,0.35)`
- 内容裁剪区 `rect x=6.5 y=6.5 w=87 h=87 rx=15.5`

### 头部占比（80-85%，铁律）
- 成人：脸 `circle cx=50 cy=44 r=34`；耳 `cx=15.5/84.5 cy=45 r=4.2`；颈 `rect 44.5,70 11x13`
- 宝宝：脸 `circle cx=50 cy=43 r=36`；耳 `cx=13.5/86.5 cy=44 r=4`；颈 `rect 44,72 12x12`
- 肩带：`M12 100 C12 84 27 80 50 80 C73 80 88 84 88 100 Z`（只留底部约 13px）

### 五官坐标（两套）
- 成人：眼 `(41,44)(59,44) r=2.9`，高光点 `(41.9,43.1)(59.9,43.1) r=1.05`；眉 `M37 38.5 Q41 36 45 38` / `M55 38 Q59 36 63 38.5`；鼻 `M48.6 48.5 Q49.5 51.5 50.6 48.5`；嘴微笑 `M44 56 Q50 60.5 56 56`；腮红 `(34,51)(66,51) rx=5.4`
- 宝宝：眼 `(40,42.5)(60,42.5) r=4.1`，高光 `(41.3,41.3)(61.3,41.3) r=1.5`；眯眯眼弧 `M35.5 42 Q40 37.5 44.5 42`（对称）；嘴张开 `M42.5 54 Q50 62 57.5 54 Q50 58 42.5 54 Z`；腮红 `(32,49)(68,49) rx=5.8`

### 色板
- 品牌绿：主 `#58B848`，深 `#2E7D3C`，浅 `#8FD48A`，薄荷 `#DCF1D6`
- 肤色：`#F6D7B8` / `#EFC49E` / `#FBE3C8` / `#E8B78A`；颈阴影：`#E2B48C` / `#D9A37C` / `#EBC9A4` / `#CE9C72`
- 发色：黑 `#2E2A28`、棕 `#6B4B2E`、栗 `#7A4A2B`、红棕 `#9C5B33`、灰 `#9BA0A8`
- 唇 `#B5674B`、眼墨 `#2B2622`、高光 `#FFFFFF`

### 职业徽章（胸口，约 16px，位于 (50,88)）
- 深绿/主绿衬衫 → 白色徽章；浅绿/薄荷/白衬衫 → 深绿 `#2E7D3C` 徽章
- 徽章用 1-3 个极简几何形状（2px 描边），如：</>、柱状图、齿轮、算盘、盾牌、云朵、信封、火箭…

## 工作流
1. 读取用户请求，确定角色（职业/家庭/通用）与配件（发型、眼镜、帽子、胸口徽章）。
2. 从 `scripts/catalog.js` 中选择或新建条目（id/name/cat/skin/shade/hair/acc/shirt/emblem）。
3. 运行 `node scripts/build.js` 生成：`assets/icons/*.svg` + `assets/manifest.json`（含 base64 data URI）+ `assets/preview-dark.html` / `preview-light.html` 总览。
4. 验收：暗/浅双主题截图检查——徽章不越出内框、头部占比 80-85%、描边细（2.2px）、徽章对比清晰。
5. 交付：SVG 源文件 + JSON 索引 + 总览 PNG；接入 DSH 预设时把 `manifest.json` 中该条 `icon` 写入 `~/.dsh/.agent-presets/<id>/preset.yml` 的 `icon:` 字段。

## 铁律
- 头部占比必须 80-85%，不画全身、不画大块背景。
- 不用动物，全部为类人漫画（爸爸/妈妈/宝宝）。
- 不引入品牌绿以外的彩色（肤色/发色/白/灰除外）。
- 描边保持 2.2px 细线；投影只用单层 12%。
- 每个新图标必须过暗/浅双主题预览验收。

> 2026-09-07 SkillOpt b5 rollout：3 任务均分 88，轻量修复
