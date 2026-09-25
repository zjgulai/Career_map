---
name: "pixpix-ecommerce"
title: "PixPix 电商视觉"
description: "PixPix 电商视觉工作台：爆款复刻海报、商品套图、服装套图、模特试穿（服装/鞋/内衣/通用穿戴）、A+ 详情页、15 秒带货视频、竞品视频复刻、商品精修/换色/抠图、图片与视频高清化、视频压缩/去水印/抠背景、AI 生图/生视频/配音、生成模特、积分与会员权益查询。触发词：爆款复刻、竞品海报、商品套图、主图、白底图、服装套图、模特试穿、试穿海报、A+ 详情页、详情页模块、带货视频、电商视频、视频复刻、商品精修、修图、换色、抠图、去背景、高清放大、画质修复、视频压缩、去水印、AI 生图、AI 配音、生成模特。何时不用：与电商视觉无关的通用绘画；网页端专属的亚马逊合成人像合规标记（synthetic-performer-tagger）无 MCP 工具，指引用户去网页操作。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# PixPix 电商视觉 · 业务指引

本技能是「万物互联」中 **PixPix（AI 图像 MCP）** 的模型侧入口。37 个工具均已挂载为 mcp__pixpix__ 前缀；本文件把「业务黑话」映射到正确工具，让模型在用户说人话时选对工具。

## 业务场景速查（用户怎么说 → 用哪个工具）

| 用户业务诉求 | 首选工具（mcp__pixpix__ 前缀省略） |
| --- | --- |
| 爆款复刻 / 参考竞品海报风格做自家图 | run_tool-generation-bestseller-replica |
| 商品套图 / 一整套主图 / 白底图+场景图+卖点图 | run_tool-generation-product-suite |
| 服装套图（白底/模特/细节/卖点） | run_tool-generation-apparel-set |
| 把衣服穿到模特身上 / 试穿 | run_tool-generation-apparel-try-on |
| 把鞋穿到模特脚上 / 试穿海报 | run_tool-generation-footwear-try-on |
| 内衣试穿 | run_tool-generation-lingerie-try-on |
| 配饰/眼镜/帽子等穿戴展示 | run_tool-generation-ai-wear-anything |
| A+ 详情页 / 详情页模块图 | run_tool-generation-a-plus-detail |
| 15 秒带货视频 / 口播 / 短视频带货 | run_generation-viral-ecommerce-video |
| 参考竞品视频换自家商品 / 视频复刻 | run_tool-generation-video-replication |
| 修图 / 划痕 / 光泽 / 透视校正 | run_tool-generation-product-retouch |
| 商品换色（保持材质） | run_tool-generation-product-recolor |
| 抠图 / 去背景（图片） | run_generation-remove-bg |
| 图片高清放大 | run_generation-high-definition-image |
| 视频放大 / 超分 | run_generation-flux-video-upscale |
| 老片/真人视频画质修复 | run_generation-high-definition-video |
| 视频抠背景 | run_generation-video-remove-bg |
| 视频去水印 | run_generation-video-remove-watermark |
| 视频压缩 | run_generation-video-compression |
| 生成模特人像 | run_generation-model |
| AI 生图（文生图/图生图） | generate_image |
| AI 生视频 | generate_video |
| 文案配音 / TTS | generate_tts |
| 查历史生成记录 / 收藏 | list_generation_tasks |
| 某项能力没有专门工具时的兜底 | run_generation_tool |

## 标准工作流（生成类任务）

1. **素材上传**（本地图/视频）：prepare_image_upload → 原生 HTTP PUT → complete_image_upload（视频同理 prepare_video_upload / complete_video_upload）。会话内已有图片附件优先直接使用，不要让用户重复选图。
2. **提交任务**：调用上表对应工具，只返回 taskId，不直接返回成片。
3. **轮询进度**：get_generation_status（单个）或 get_generation_status_batch（批量），到终态后再取结果。
4. **展示结果**：本宿主用 get_generation_status 返回的下载链接交付给用户。
5. **成本预估**：生成前可先 get_generation_credits 估算积分；get_membership_benefit 查会员与余额。
6. **模型能力**：不确定模型/参数时先 list_generation_models。

## 注意

- 生成任务异步完成，提交后必须轮询状态，不要谎称「已完成」。
- 工具返回的错误（积分不足、参数非法、限流）原样转达用户，不要重试轰炸。
- 真人素材需用户确认已获使用授权；AI 合成人像用于亚马逊上架时，合规标记（contains-synthetic-performer）需在 PixPix 网页端工具完成（synthetic-performer-tagger，MCP 未暴露）。
- 本技能只做映射与流程指引；凭证、token 由宿主管理，模型不可见，禁止索取。
- 宿主专用工具（get_generation_status_for_workbuddy、render_generation_result_for_codex/in_app）为其他宿主（WorkBuddy/Codex/Claude）使用，本宿主不暴露，无需调用。
<!-- v2 2026-09-08 -->
