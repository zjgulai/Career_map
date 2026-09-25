---
id: tiktok-hook-writer
title: TikTok 前 3 秒 Hook（新妈妈痛点场景）
description: 当需要为 TikTok/Reels 类短视频生成前 3 秒 Hook 文案与镜头建议（夜奶、背奶、职场哺乳等场景）且已有信任型 brief 时调用；输出需再经品牌调性与 FTC/GDPR 合规门。
skill_version: "0.1.0"
l2_pillar: 营销
ref_domain:
  - D
risk_tier: P1_standard
execution_boundary: internal
market_profile: both
---

## 目标

为每条视频生成 **3 秒 Hook**（口播/字幕）+ **画面建议** + **安全声明占位**，与 `trust-content-generator` 的事实与模块对齐。

## 前置条件

- 已有 `trust-content-generator` 产出的模块或等价 brief。  
- 已选 **语言**（如 EN-US、DE）与 **单条视频目标**（认知/转化/引流）。

## 步骤

1. 从 brief 中选 **一个主痛点** + **一个产品利益点**，禁止单条堆砌超过 2 个利益点。  
2. 写 **3 个 Hook 变体**（疑问 / 共鸣 / 反常识），每句 ≤ 12 个英文词或等价长度。  
3. 给 **镜头建议**（中景/特写/字幕节奏），标注 **禁止画面**（婴儿不当展示、医疗场景暗示等 — 细化在合规门）。  
4. 附 **CTA 占位**（软/硬各一），不写具体促销数字除非已提供。

## 输出格式

- 表：`HookID | 语言 | 口播/字幕 | 镜头 | 禁用项自查 | CTA`  
- 附 **推荐排序**：首选 Hook + 理由（1 句）。

## When NOT to use

- 整支逐秒分镜脚本 — 需人工或专用制作工具；本 Skill 只覆盖 Hook 层。  
- 长图文或邮件 — 用 `ad-copy-matrix` 或独立模板。

## 相关 Skill

- 上游：`trust-content-generator`（`next`）  
- 下游：`brand-voice-guardian`（`next`）
