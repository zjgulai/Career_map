---
name: "grilling"
title: "无情访谈"
description: "连续追问打磨方案与设计，产出更锋利的计划。触发词：无情访谈、grilling、连续追问打磨方案与设计，产出更锋利的计划。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---


对用户进行不间断的访谈，直到你们达成共识。把整个过程映射为一棵**设计树**：每个决策都会分出挂在它下面的子决策。

按**轮次**推进这棵树。**前沿**是所有前置条件已经确定的决策：也就是你_现在_就能提出、而不必去猜尚未听到的答案的那些问题。一轮之内问完整个前沿：给每个问题编号，并给出你的推荐答案。然后等用户回答，再进行下一轮。

一轮的格式如下：

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

用户每一轮的回答都会重塑这棵树：已确定的决策把前沿向外推进，并解锁依赖于它们的那些问题。重新计算前沿，再问下一轮。某个问题的答案若取决于本轮中仍未回答的另一个问题，它就属于_之后_的某一轮，而不是本轮。

查找_事实_是你的职责，永远不是用户的。当前沿问题需要来自环境（文件系统、工具等）的事实时，派一个子代理去找；凡是你能自己查到的，都不要问用户。不要因此阻塞：进行中的探索只是一个未确定的前置条件，因此只有它下游的问题需要等子代理回报；前沿的其余部分现在就问。_决策_属于用户：把每一个都交给他们，然后等待。

当前沿为空时，会话即告完成：设计树的每个分支都已遍历，没有任何东西被悄悄假定。在用户确认你们已达成共识之前，不要据此采取行动。
