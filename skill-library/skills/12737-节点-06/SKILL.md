---
name: shopify-cro-function
description: 用 Shopify Functions 做转化优化(满赠/折扣/结账校验/购物车变换)。当用户说"满赠/加购/折扣/结账规则/CRO/AB"时使用。
---
# CRO · Shopify Functions(节点 06)
**步骤**
1. 明确规则(如:满 X 赠 Y、Buy now、结账校验)。
2. `shopify-functions` 生成 function 代码;`shopify-dev` 校验 schema。
3. 本地 `validate` → 部署到店铺;结账 UI 用 checkout UI 扩展。
4. 配 AB 实验,观测转化(见 [[07-数据与归因]])。
**人审闸**:实验上线、价格/折扣逻辑由人确认。
**关联**:[[06-转化优化CRO]]
