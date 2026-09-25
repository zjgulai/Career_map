---
name: shopify-hydrogen-scaffold
description: 脚手架并部署 Shopify Hydrogen(agent-first headless 店面)。当用户说"headless/Hydrogen/自定义前端/Oxygen 部署"时使用。
---
# Hydrogen 脚手架(节点 02)
**步骤**
1. `npm create @shopify/hydrogen@latest -- --quickstart --mock-shop`(先本地试)→ 正式项目去掉 mock。
2. `shopify hydrogen link` 连真实店;`shopify-hydrogen` skill 让 Claude Code 补全/校验。
3. `/api/mcp` 内置 Storefront MCP 代理(供买家侧 Agent)。
4. 部署:Oxygen(`npm i -g @shopify/oxygen` → `shopify hydrogen deploy`)或 Vercel/CF/Node。
**人审闸**:上线、域名、结账(核心结账保持原生)。
**提醒**:all-new Hydrogen 当前预览,生产前评估。
**关联**:[[02-建站与基础设施/Hydrogen脚手架SOP]]
