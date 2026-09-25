---
name: shopify-bulk-listing
description: 批量上架/更新 Shopify 商品与 Listing。当用户说"上架/批量改商品/写 listing/建 PDP 字段/多语言商品"时使用。
---
# 批量上架 Listing(节点 03)
**步骤**
1. `shopify-admin`(只读)查现有商品/集合结构与字段。
2. 生成文案:Shopify Magic 或外部模型(ChatGPT/DeepSeek);多语言用 DeepL/Gemini。
3. `shopify-custom-data` 建/填 metafields(卖点、规格、PDP 模块)。
4. **预演**:让 Agent 先打印将执行的 GraphQL mutation 清单。
5. 人审通过后 → `shopify-admin-execution` 批量创建/更新商品。
**人审闸(必须)**:上架前确认 mutation;卖点真实性/功效合规措辞(母婴敏感)。
**关联**:[[03-商品上架与Listing]]、[[91-合规与风控]]
