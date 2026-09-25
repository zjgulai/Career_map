---
name: "implement"
title: "规格实施"
description: "按规格或任务卡实施一段工作。触发词：规格实施、implement、按规格或任务卡实施一段工作。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

实施用户在 spec 或工单（tickets）中描述的工作。

在可能的情况下，于预先商定的接缝（seam）处使用 /tdd。

定期运行类型检查，定期运行单个测试文件，最后运行一次完整测试套件。

完成后，使用 /code-review 审查所做的工作。

将你的工作提交到当前分支。
