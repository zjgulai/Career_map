---
name: shopify-store-scaffold
description: 用 AI 脚手架/搭建 Shopify 店面(主题或 headless)。当用户说"建站/开店/搭主题/做店面/初始化店铺"时使用。
---
# Shopify 建站脚手架(节点 02)
**适用**:从零或改版搭建店面。
**前置**:已装 Shopify AI-Toolkit(Claude Code 插件)+ Shopify CLI 已登录;测试店铺优先。
**步骤**
1. `shopify-dev` 拉取 API 文档/GraphQL schema(实时,避免过时写法)。
2. 主题路线:`shopify-liquid` 脚手架/改主题,内置模板校验;或 headless 路线见 skill `shopify-hydrogen-scaffold`。
3. 用 `shopify-custom-data` 设计 metafields/metaobjects(PDP/帮助中心字段)。
4. 本地预览 → code validation 通过 → 部署。
**人审闸**:支付、域名、税费、合规配置由人确认;变更走 `shopify-admin-execution` 时必须人审。
**关联**:[[02-建站与基础设施]]、[[90-AI能力地图/AI-Toolkit技能SOP_每节点]]
