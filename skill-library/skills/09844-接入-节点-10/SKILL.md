---
name: shopify-ucp-onboarding
description: 接入 UCP 让商品被 AI Agent 发现并成交。当用户说"UCP/代理式商务/让商品进 AI 渠道/Agent 结账/Catalog API"时使用。
---
# UCP 接入(节点 10)
**步骤(分层门禁)**
1. 先生成 UCP/Catalog readiness 包:目标市场、商品数据规范化、政策/FAQ、Shop Pay 状态、证据等级。
2. Profile / credentials:由用户在 Developer Dashboard 现场处理 agent profile 或教程 credentials;不得记录密钥值。
3. Catalog discovery:优先只读验证 Global/Storefront Catalog search / lookup / get_product。
4. Cart gate:只在测试链路生成 cart draft,记录字段摘要和废弃方式。
5. Checkout / payment gate:checkout、Shop Pay、AP2/payment mandate、身份链接必须单独审批。
6. Order gate:订单状态、履约、退换货和售后监控需要 scope、隐私和审计记录。
**人审闸**:支付授权、身份链接、订单管理、资金动作、生产写入均由人确认。
**关联**:[[10-自动化编排/UCP接入SOP]]
