---
name: "p2s-lmm-searcher-multimodal-context"
title: "LMM-Searcher — 长链多模态 Agent：UID 占位符按需加载图片"
description: "触发词：多模态上下文、图片按需加载、占位符注册、长链搜索、token瘦身。何时不用：会话里只有一两张图时直接内联更快；纯文本检索场景用文本检索技能。安全边界：图片存外部注册中心时须设访问控制与过期清理，避免业务图片被长期暴露为公开地址。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现 / 容量管理"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-LMM-Searcher-Multimodal-Context"
p2s_src_domain: "16-智能体工程"
quality_tier: "preview"
user_summary: "长链搜索里不再把几十张图塞进上下文，只放占位符，需要细看时再按需取图，token 占用降下大半。"
user_try: "试试：这 10 个竞品共 70 张图，先只给我占位清单，等我指定要看哪几张再加载。"
whenToUse: "属于「业务工具实现」：多轮会话要读大量图片、上下文预算吃紧时用；若只有一两张图，直接内联更快；若全流程都是文本，用文本检索与压缩技能即可。"
workflow: "注册阶段：把图片存入外部注册中心并生成 UID → 上下文里只保留 UID 占位串，不内联图片内容 → 判断当前问题是否需要图像细节，只在需要时触发取图 → 按需加载少量关键图片，控制单轮 token 占用 → 会话结束后按策略清理临时图片并回收 UID"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# LMM-Searcher — 长链多模态 Agent：UID 占位符按需加载图片

## ① 解决的问题

运营分析师面临图文资料检索低效——LMM Searcher将检索命中率58%提到86%，年化省13万元

## ② 核心算法逻辑

LMMSearcher 解决长链多模态 Agent 的上下文爆炸问题：在 100 轮搜索会话中，若每张图片直接嵌入为 base64（约 1,0003,000 tokens），50 张图片就会占用 50,000150,000 tokens，远超实用预算。

## ③ 业务应用场景

业务问题：选品 Agent 一次搜索 10 个竞品，每个竞品有 6-8 张产品图（主图、详情图、包装图），Agent 需跨图对比外观、认证标志、卖点差异。
传统做法：全部图片嵌入 context，10 竞品 × 7 图 × 2,000 tokens = 14 万 tokens，每次查询成本约 ¥2.1。
UID 占位模式： - 注册阶段：70 张图存入 ImageRegistry，context 仅含 UID 占位串（70 × 30 = 2,100 tokens） - Agent 决策：仅在需要"细节对比"时 fetch（通常 5-8 张），按需加载 5 × 2,000 = 10,000 tokens - token 减少约 70%，成本降至 ¥0.63/次 - 每月节省（100 次/天 × 30 天）：约 ¥180-300

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

（卡页此段是占位串，本卡未记录 ROI。）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（308 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页另声明「代码块数量：1」并记录位置 `paper2skills-code/llm_agent_engineering/lmm_searcher_multimodal_context` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/16-智能体工程/Skill-LMM-Searcher-Multimodal-Context.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
LMM-Searcher: UID 占位符 + 按需加载图片的长链多模态 Agent 上下文管理
参考: arXiv:2604.12890 — LMM-Searcher: Long-horizon Agentic Multimodal Search
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────
# 1. ImageRegistry：图片外部存储与 UID 管理
# ─────────────────────────────────────────────

class ImageRegistry:
    """
    外部图片注册中心。图片以 base64 存储在内存 dict 中（生产环境可替换为文件系统/对象存储）。
    register_image() → uid；fetch_image(uid) → base64 字符串
    """

    def __init__(self):
        self._store: dict[str, str] = {}         # uid → base64
        self._meta: dict[str, dict] = {}          # uid → metadata
        self._counter: int = 0

    def register_image(
        self,
        source: str | bytes,
        description: str = "",
        metadata: Optional[dict] = None,
    ) -> str:
        """
        注册图片，返回 UID。
        source: 本地文件路径、URL字符串，或原始 bytes
        """
        uid = f"IMG_UID_{self._counter:04d}"
        self._counter += 1

        if isinstance(source, bytes):
            b64 = base64.b64encode(source).decode()
        elif isinstance(source, str) and os.path.isfile(source):
            with open(source, "rb") as f:
                b64 = base64.b64encode(f.read()).decode()
        elif isinstance(source, str) and source.startswith("http"):
            # 生产环境替换为真实 HTTP 下载；此处用 mock 数据
            mock_bytes = f"[MOCK_IMAGE_DATA:{source}]".encode()
            b64 = base64.b64encode(mock_bytes).decode()
        else:
            b64 = base64.b64encode(str(source).encode()).decode()

        self._store[uid] = b64
        self._meta[uid] = {
            "description": description,
            "source": str(source)[:100],
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2604.12890 — Towards Long-horizon Agentic Multimodal Search

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：待检索的图片集及其元数据（卡页示例：10 个竞品乘 6-8 张产品图，共约 70 张）与业务查询问题；卡页第 4 段未给字段级规格，落地前需确认图片存储位置与访问方式。

**输出**：含 UID 占位符的上下文与按需加载的图片：卡页示例中 10 竞品乘 7 图内联需 14 万 tokens、单次成本约 2.1 元；改为占位串（70 乘 30 等于 2,100 tokens）并按需加载 5 张（约 10,000 tokens）后成本降至 0.63 元每次、token 减少约 70%，检索命中率从 58% 提升至 86%。

## 执行步骤

1. 注册阶段：把图片存入外部注册中心并生成 UID
2. 上下文里只保留 UID 占位串，不内联图片内容
3. 判断当前问题是否需要图像细节，只在需要时触发取图
4. 按需加载少量关键图片，控制单轮 token 占用
5. 会话结束后按策略清理临时图片并回收 UID

## 边界与不做

- 数据不满足时不用：图片数量很少，或任务本身不依赖图像细节时，占位符机制只增加实现复杂度。
- 能力边界：本卡产出上下文管理机制，不提升图像理解模型本身的能力。
- 本技能承载的是**规则与契约产物**（DAG 定序规则 / 熔断阈值与退避策略 / 置信门控与判据），不是执行器；真正的编排与冻结动作由模型外的确定性控制层执行。

## 技能关联

- **前置**：Skill-Active-Context-Pruning.html、Skill-Active-Context-Pruning、Skill-Context-Compression.html、Skill-Context-Compression、Skill-VLM-Ecommerce-Adaptation.html、Skill-VLM-Ecommerce-Adaptation
- **延伸**：Skill-Agentic-Memory-Management.html、Skill-Agentic-Memory-Management、Skill-Memory-as-Action.html、Skill-Memory-as-Action
- **可组合**：Skill-Listing-Quality-Scoring.html、Skill-Listing-Quality-Scoring、Skill-Shopping-Companion-Agent.html、Skill-Shopping-Companion-Agent、Skill-Tool-Call-Decision-Framework.html、Skill-Tool-Call-Decision-Framework、Skill-XSkill-Multimodal-Self-Improvement.html、Skill-XSkill-Multimodal-Self-Improvement、Skill-LMM-Searcher-Multimodal-Context

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-LMM-Searcher-Multimodal-Context`