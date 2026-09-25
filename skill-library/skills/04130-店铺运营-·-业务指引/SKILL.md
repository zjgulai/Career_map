---
name: "shopify-store-ops"
title: "Shopify 店铺运营"
description: "Shopify 店铺运营（万物互联 MCP 直连）：查商品/订单/客户，改价格、订单备注、客户标签、新建商品等。触发词：Shopify、店铺运营、查订单、查商品、查客户、查库存、改价格、订单备注、新建商品、修改商品。何时不用：与 Shopify 店铺数据无关的电商问题（选品/广告/竞品分析走对应技能）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
input_contract: 一句店铺运营诉求（查/改商品、订单、客户），工具直连店铺 Admin API
output_contract: 店铺数据结果（列表/详情）；写操作执行前先向你确认，无写权限时如实说明
example: 说「帮我查店铺最近 10 个订单」→ 直接返回订单清单
---

# Shopify 店铺运营 · 业务指引

本技能是「万物互联」中 **Shopify（社区 MCP）** 的模型侧入口。14 个工具已挂载为 mcp__shopify__ 前缀；本文件把「业务黑话」映射到正确工具，让模型在用户说人话时选对工具。

## 业务场景速查（用户怎么说 → 用哪个工具）

| 场景 | 用户怎么说 | 首选工具（mcp__shopify__ 前缀省略） |
| --- | --- | --- |
| 商品 | 店铺里有哪些商品？ | get_products |
| 商品 | 查一下商品 1234567890 的详情 | get_product_by_id |
| 订单 | 帮我查店铺最近 10 个订单 | get_orders |
| 订单 | 订单 #1001 里买了什么？ | get_order_by_id |
| 客户 | 店铺一共有多少客户？ | get_customers |
| 客户 | 客户 xxx 买过哪些东西？ | get_customer_orders |
| 商品 | 帮我创建一个新商品：标题 xxx，价格 99 | create_product（写入·先确认） |
| 商品 | 把商品 xxx 的价格改成 129 | update_product（写入·先确认） |
| 商品 | 删除商品 xxx（先向我确认） | delete_product（写入·先确认） |
| 商品 | 给商品 xxx 加上「颜色」选项 | manage_product_options（写入·先确认） |
| 商品 | 给商品 xxx 增加 XL 码变体 | manage_product_variants（写入·先确认） |
| 商品 | 删掉商品 xxx 的 XL 码变体（先向我确认） | delete_product_variants（写入·先确认） |
| 客户 | 给客户 xxx 打上「VIP」标签 | update_customer（写入·先确认） |
| 订单 | 给订单 #1001 加一条内部备注 | update_order（写入·先确认） |

## 护栏（必须遵守）

1. **只读优先**：查信息直接调 get_* 工具，不要用写工具去「探测」。
2. **写操作先确认**：create / update / delete / manage 类工具执行前，必须向用户复述「将要执行的操作 + 对象」，得到明确确认后才能调用；delete 不可恢复，用户未点名删除对象时默认不做。
3. **写权限边界**：店铺只授 read scopes 时写操作会被 Shopify 平台拒绝（HTTP 403）。此时如实告知用户「店铺未授写权限」，给出后台补权限路径，不要反复重试。
4. **数据真实**：只转述工具返回的店铺数据，不编造商品/订单/客户信息。

## 标准工作流

1. 查清单：get_products / get_orders / get_customers 拿列表与 ID。
2. 查详情：get_product_by_id / get_order_by_id / get_customer_orders 按 ID 深挖。
3. 写操作：先确认 → 再调用 update_* / create_* / manage_*。
4. 失败处理：权限/参数错误原样转达，不重试轰炸。

## 注意

- 本技能只做映射与流程指引；客户端 ID、加密密钥由宿主管理，模型不可见，禁止索取。
<!-- business-meta v1 2026-09-08 -->
