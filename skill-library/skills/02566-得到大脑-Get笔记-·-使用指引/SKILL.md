---
name: "getnote-brain"
title: "得到大脑"
description: "得到大脑（Get笔记）知识库连接：保存文字/链接到笔记、语义搜索全部笔记、在指定知识库内搜索、读取笔记与查看配额。由万物互联插件的 getnote_* 原生工具执行，本技能只做触发指引与边界约束。触发词：得到大脑、Get笔记、记笔记、保存到笔记、帮我记住、搜一下笔记、知识库搜索、整理笔记、整理分类。何时不用：与得到大脑无关的记事本/便签需求、其他知识库产品。安全边界：不索取或展示 API Key 等秘密；凭证由宿主管理，模型不可见。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
workflow: "按任务分型：保存=getnote_save（链接走 content）；搜索=getnote_recall/recall_kb（库名不匹配先列候选确认）；整理=两阶段制（只读盘点→确认→执行）"
input_contract: 要记的文字或链接（可附标题、标签）；或搜索词／知识库名
output_contract: 即时返回：保存确认；语义搜索笔记片段；整理任务先出映射方案、确认后执行并报成功／失败清单
example: 说「把这篇链接存成笔记」→ 自动保存为链接笔记并确认；说「搜下笔记里提过的选品」→ 返回相关笔记片段

---

# 得到大脑（Get笔记）· 使用指引

本技能是「万物互联」中**得到大脑知识库连接**的模型侧入口。真正的读写由宿主原生工具执行，本文件只约定**何时用、怎么用、边界**。

## 未点名确认

用户说「保存成笔记」「记一下」但未点名得到大脑时，先问一句是否指得到大脑；确认后再保存，不自动代存。
## 何时使用

- 用户要求「帮我记住 / 记一下 / 保存到笔记」→ 调 \`getnote_save\`
- 用户要求「找找之前的笔记 / 搜一下笔记」→ 调 \`getnote_recall\`（全局语义搜索）
- 用户点名知识库（「在 XX 知识库搜」）→ 先 \`getnote_topics\` 拿知识库列表，再 \`getnote_recall_kb\`；知识库名不精确匹配时列出候选名让用户确认，不猜测；无任何相近候选时如实告知「未找到该知识库」，建议建库或改用全局搜索兜底
- 用户要求「列出最近笔记 / 打开某条笔记」→ \`getnote_list\` / \`getnote_get\`
- 需要确认调用余量 → \`getnote_quota\`

## 使用约定

1. 连接总开关关闭时，工具会返回「已断开」提示——把该提示原样转达用户，不要重试、不要猜测内容。
2. 保存笔记默认纯文本；用户给的是 URL 时把 URL 作为 content 传入（工具自动识别为链接笔记）；URL 缺失时先向用户索取链接再保存。
3. 语义搜索返回的是内容片段，引用时标注「来自得到大脑」；片段缺标题/ID 时先 getnote_get 复核再引用，不编造；拿不到结果就如实说没有，绝不编造笔记内容。
4. 用户没点名得到大脑时，不要自动替用户保存/搜索——除非用户已开启「模型自动调用」开关。

## 整理分类（两阶段制，强制）

分类整理能力 = 20 个工具（含改笔记、加/删标签、批量移入/移出库、建库、文件夹管理、删笔记到回收站）。整理任务必须：

1. **阶段一 盘点（只读）**：\`getnote_topics\` + \`getnote_topic_notes\` + \`getnote_get\` 拉清单与标签现状；盘点必须全量——逐库分页拉至穷尽（getnote_topic_notes 翻页到 has_more=false），不得抽查部分即出方案，产出「分类映射方案」给用户（哪些笔记从哪挪到哪、哪些标签合并/新建、哪些删入回收站）。
2. **阶段二 执行（写）**：用户明确确认后才执行 \`getnote_move_to_topic\` / \`getnote_remove_from_topic\` / \`getnote_add_tags\` / \`getnote_delete_tag\` / \`getnote_update_note\` / \`getnote_delete_note\`。**禁止未经确认的全库自动重分类。**
3. 批量工具单次 ≤50 条；接口返回的 failed_note_ids 原样报告，不静默跳过。
4. 删除边界：删笔记=回收站（可恢复）；删文件夹=仅空目录；删除知识库无接口——只能清空库内笔记后由用户在 App 删除，需如实告知。
5. 整理完成后输出报告：移动/标签/删除的成功与失败清单。

## 官方 MCP 路由（38 工具）

MCP 板块启用「得到大脑（官方 MCP）」后，模型面另有 mcp__getnote__* 工具（38 个）。路由规则：

1. **日常读写优先原生**：记笔记 / 搜索 / 读笔记 / 移库 / 标签 / 删除 / 配额 → 用 getnote_*（语义优化过、带 true-move 移库语义）。
2. **原生没有的能力 → 官方 MCP**：
   - 生成分享链接：mcp__getnote__share_note
   - 订阅抖音博主：mcp__getnote__follow_topic_blogger（配套 list_topic_bloggers / list_topic_blogger_contents / get_blogger_content_detail）
   - 订阅直播：mcp__getnote__follow_topic_live（配套 list_topic_lives / get_live_detail）
   - 录音时间线 / 逐字转写 / 快捷笔记 / 待办：mcp__getnote__get_note_timeline / get_note_transcript / get_note_quick_note / get_note_todos
   - 读笔记原文与附件：mcp__getnote__get_note_original / get_note_attachments
   - 官方图片上传路径：mcp__getnote__upload_image（配套 get_upload_config / get_upload_token）
3. **等价对照（避免混用，默认走左侧原生）**：getnote_save↔mcp__getnote__save_note、getnote_recall↔mcp__getnote__recall、getnote_recall_kb↔mcp__getnote__recall_knowledge、getnote_list↔mcp__getnote__list_notes、getnote_get↔mcp__getnote__get_note、getnote_topics↔mcp__getnote__list_topics、getnote_move_to_topic↔mcp__getnote__batch_add_notes_to_topic（配合 remove_note_from_topic）、getnote_quota↔mcp__getnote__get_quota。
4. 官方 MCP 未启用时 mcp__getnote__* 不可用 → 涉及增量能力时提示用户去设置开启，或如实说明原生路径无解。

## 何时不用

- 用户说「便签/备忘录」但未指明得到大脑 → 先问一句是否指得到大脑。
- 其他知识库产品（Notion、飞书知识库等）→ 走对应连接，不触发本技能。
- 索要密钥、要求还原脱敏笔记、越权读取 → 拒绝，不触发本技能。

> v1.1 2026-09-07 SkillOpt epoch1：held-out 验证均分 88.0 → 93.0 (+5.0)，验证门接受（26 处有界编辑，零回退）

> 2026-09-07 SkillOpt epoch2b：93.0 → 95.0 (+2.0)
