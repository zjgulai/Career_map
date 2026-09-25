---
name: "apify-mcp"
title: "Apify 网页抓取"
description: "Apify MCP 工具：搜索与调用 Apify Store 的 Actor 完成网页抓取、数据提取与自动化任务；预置网页转 Markdown（web-fetch）与网页搜索抓取（rag-web-browser）。触发词：Apify、apify、Actor、调用 Actor。何时不用：不涉及 Apify 的普通网页浏览（用浏览器工具）；跨境选品 SKU 校验（用 cross-border-selection）；只设计采集字段不执行采集（用 web-scraping-plan-designer）。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
input_contract: 一句抓取/自动化诉求（目标网址或数据需求），工具直连 Apify 平台执行
output_contract: 抓取结果（Markdown/列表数据）；付费 Actor 先报成本等你确认；长任务轮询到终态
example: 说「用 Apify 抓取这个网页并给我 markdown」→ 直接返回页面内容
---

# Apify 网页抓取 · 业务指引

本技能是「万物互联」中 **Apify（官方远程 MCP）** 的模型侧入口。12 个工具已挂载为 mcp__apify__ 前缀；本文件把「业务黑话」映射到正确工具。

## 业务场景速查（用户怎么说 → 用哪个工具）

| 场景 | 用户怎么说 | 首选工具（mcp__apify__ 前缀省略） |
| --- | --- | --- |
| 找工具 | 帮我找抓取 Instagram 的 Actor | search_actors |
| 找工具 | 查一下 apify/web-fetch 需要哪些参数 | fetch_actor_details |
| 跑任务 | 用这个 Actor 抓取这个网页 | call_actor（执行·先确认） |
| 跑任务 | 任务跑完了吗？ | get_actor_run |
| 跑任务 | 停掉刚才那个任务 | abort_actor_run（执行·先确认） |
| 取结果 | 把抓到的数据给我 | get_dataset_items |
| 取结果 | 读出这个结果文件的内容 | get_key_value_store_record |
| 网页直取 | 用 Apify 抓取这个网页并给我 markdown | apify--web_fetch |
| 网页直取 | 用 Apify 搜索并抓取这个主题的资料 | apify--rag_web_browser |
| 文档与反馈 | 查 Apify 文档里 Proxy 的用法 | search_apify_docs |
| 文档与反馈 | 打开这篇文档 | fetch_apify_docs |
| 文档与反馈 | 把这个工具报错反馈给 Apify | report_problem（执行·先确认） |

## 标准工作流

1. **选工具**：网页内容直取优先用预置 apify--web_fetch（网页→Markdown）或 apify--rag_web_browser（搜索+抓取）；其他需求 search_actors 找合适 Actor。
2. **查参数**：调用任意 Actor 前必须 fetch_actor_details 拿输入 schema，按 schema 构造 input，禁止瞎编参数。
3. **提交**：call_actor 提交任务（waitSecs 设短，如 30-60s；超时未完成转轮询 get_actor_run）。
4. **取结果**：列表数据 get_dataset_items（datasetId 来自 run 结果），单条记录 get_key_value_store_record。
5. **止损**：跑偏或超额时 abort_actor_run 中止。

## 护栏（必须遵守）

1. **付费先确认**：调用付费 Actor 或大并发/大额度消耗前，先告知用户「该 Actor 计费/预计消耗」，得到确认后再调用。
2. **规模克制**：maxResults/limit 默认取小（如 10-20），用户明确要大才放大。
3. **错误原样转达**：额度不足、参数非法、限流等错误如实告知，不重试轰炸；工具缺陷可用 report_problem 反馈 Apify。
4. **数据真实**：只交付工具实际返回的数据，不编造抓取结果。
5. 凭证由宿主管理，模型不可见，禁止索取 API Token。

## 注意

- 平台文档查询用 search_apify_docs / fetch_apify_docs（Apify 与 Crawlee）。
- 两个预置工具名称含双连字符（apify--web_fetch / apify--rag_web_browser），调用时保持原样。
<!-- business-meta v1 2026-09-08 -->
