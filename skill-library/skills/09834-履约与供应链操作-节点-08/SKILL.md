---
name: shopify-fulfillment-ops
description: 库存/订单/履约的 AI 操作与自动化(库存同步、海外仓推单、改履约状态)。当用户说"改库存/补货/履约/发货状态/退款排查"时使用。
---
# 履约与供应链操作(节点 08)
**步骤**
1. `shopify-admin`(只读)查库存/订单状态。
2. 规则化:库存阈值告警、自动推单(Shopify Flow / Sidekick 自然语言建 Flow)。
3. 真改(调库存/履约)→ `shopify-admin-execution`,先预演 mutation。
**人审闸(必须)**:库存调整、退款、取消、批量履约变更。
**关联**:[[08-订单履约与供应链]]
