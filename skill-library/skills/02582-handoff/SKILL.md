---
name: "handoff"
title: "会话交接"
description: "把会话交接给新 agent 的交接文档。触发词：会话交接、handoff、把会话交接给新 agent 的交接文档。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

写一份交接文档（handoff document），总结当前会话，让一个全新的 agent 能够继续这项工作。保存到用户操作系统的临时目录——而不是当前工作区。

在文档中包含一个「suggested skills」章节，指明下一个 agent 应该对哪些技能调用 Skill 工具（Skill tool）。

不要重复其他产物（spec、计划、ADR、issue、提交、diff）中已经记录的内容。改为通过路径或 URL 引用它们。

对任何敏感信息做脱敏处理，例如 API key、密码或个人身份信息。

如果用户传入了参数，把它们当作对下一个会话关注点的描述，并据此定制文档。
