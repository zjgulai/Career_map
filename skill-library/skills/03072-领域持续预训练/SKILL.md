---
name: "p2s-domain-adaptive-continual-pretraining"
title: "Domain Adaptive Continual Pretraining — 领域持续预训练"
description: "触发词：领域预训练、持续预训练、专有术语理解、本地小模型、微调方案。何时不用：只缺少量领域知识时用知识注入/RAG 即可，不必动模型权重；只为降低 token 成本时用上下文压缩。安全边界：训练语料必须为自有或已获授权的数据，不得灌入客户隐私或平台受限数据，模型权重与语料不得外发。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-144"
l3_business: "业务工具实现"
l3_all: "业务工具实现"
l1_l2_l3: "数据与Agent平台/数据与AI运行/业务工具实现"
p2s_card_id: "Skill-Domain-Adaptive-Continual-Pretraining"
p2s_src_domain: "16-智能体工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "用自家业务语料继续预训练一个小模型，让它听懂 ACoS、DOS 这类专有概念，并把云端调用费换成自有推理。"
user_try: "试试：用我们的 Skill 卡片和业务报告语料，规划一次 QLoRA 领域预训练与本地部署方案。"
whenToUse: "属于「业务工具实现」：通用模型听不懂自家专有术语、且希望本地化降低调用成本时用；若只是检索不到知识，用领域自适应 RAG 或知识注入；若只是上下文过长，用上下文压缩。"
workflow: "构建领域语料：汇总自有 Skill 卡片、业务报告与合规文档 → 配置 QLoRA 参数：基座模型、rank、目标模块、学习率、回放比例 → 执行持续预训练，混入通用语料回放以保住通用能力 → 评估领域术语理解与下游任务指标，与通用模型基线对比 → 本地部署推理服务，切换业务调用并监控质量回退"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Domain Adaptive Continual Pretraining — 领域持续预训练

## ① 解决的问题

技术负责人面临"通用DeepSeek不懂ACoS/DOS/FBA等母婴跨境专有概念分析深度有上限"——QLoRA领域预训练将专业术语理解从60%提升至89%，本地部署后年节省API费用1500元

## ② 核心算法逻辑

领域自适应预训练（DAPT） 在特定领域语料上持续预训练 LLM，使其获得领域专业性，同时保留通用能力：

## ③ 业务应用场景

场景 A：paper2skills 专属小模型
- 业务痛点：DeepSeek 每次调用 0.002 元，21 个 Agent × 日均 100 次 = 每日 4.2 元 = 年 1500 元；更重要的是，通用模型不懂「DOS」「ACoS」等专有概念，分析质量有上限 - 方案： 1. 用 1044 个 Skill 卡片 + 飞书 Agent 报告构建 ~5M tokens 领域语料 2. QLoRA 微调 Qwen2.5-7B-Instruct（24GB 单卡，约 4 小时） 3. 本地部署（vLLM + Ollama），零 API 费用 - 量化产出： - 领域术语理解准确率：60% → 89% - API 费用：年 1500 元 → 0
- 业务痛点：CPSC 合规 Agent 不懂 HTS 码、GCC 文档格式、eFiling 字段规则 - 方案：TAPT 阶段用 500 份合规文档 + Skill 卡片（21-合规决策域）进行任务级预训练 - 量化产出：合规问题回答 F1：通用模型 0.51 → DAPT+TAPT 后 0.84

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

领域术语理解准确率：通用模型 60% → DAPT 后 89%（+48%）
API 费用节省：年 1500 元（云端）→ 0（本地 QLoRA 模型）
合规问题回答 F1：0.51 → 0.84（+65%）
本地推理延迟：云端 2-5 秒 → 0.5-1 秒（5x 加速）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（180 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 57 行：'{' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

@dataclass
class DAPTConfig:
    base_model: str = "Qwen/Qwen2.5-7B-Instruct"
    lora_r: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.05
    target_modules: list = None
    learning_rate: float = 2e-5
    num_train_epochs: int = 3
    per_device_batch_size: int = 4
    gradient_accumulation_steps: int = 8
    max_seq_length: int = 2048
    load_in_4bit: bool = True
    replay_ratio: float = 0.1

    def __post_init__(self):
        if self.target_modules is None:
            self.target_modules = ["q_proj", "v_proj", "k_proj", "o_proj"]

def build_domain_corpus(
    vault_path: str,
    output_path: str,
    general_corpus_ratio: float = 0.1,
) -> dict:
    vault = Path(vault_path)
    skill_files = list(vault.rglob("Skill-*.md"))
    domain_texts = []
    for sf in skill_files:
        try:
            content = sf.read_text(encoding="utf-8")
            sections = []
            for line in content.split("\n"):
                if line.startswith("#") or len(line.strip()) > 20:
                    sections.append(line.strip())
            if sections:
                domain_texts.append("\n".join(sections[:50]))
        except Exception:
            pass
    replay_texts = [
        "What is the capital of France? Paris.",
        "Explain Newton's first law of motion.",
        "What is photosynthesis?",
    ]
    n_replay = max(1, int(len(domain_texts) * general_corpus_ratio))
    all_texts = domain_texts + replay_texts[:n_replay]
    dataset = [{"text": t, "source": "domain" if i < len(domain_texts) else "replay"}
               for i, t in enumerate(all_texts)]
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    return {
        "domain_samples": len(domain_texts),
        "replay_samples": min(n_replay, len(replay_texts)),
        "total_samples": len(dataset),
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：领域语料与训练资源：卡页示例用 1044 个 Skill 卡片加业务报告约 5M tokens，合规场景用 500 份合规文档；算力示例为 24GB 单卡约 4 小时，或 8×A100 / 4×H100 级别。

**输出**：领域增强后的模型权重与训练配置（DAPTConfig）以及本地推理服务；卡页示例量化产出为术语理解 60% 提升至 89%、合规问答 F1 0.51 提升至 0.84、API 费用由年 1500 元降至 0。

## 执行步骤

1. 汇总自有语料：Skill 卡片、业务报告、合规文档，清洗成预训练格式
2. 配置 QLoRA 参数：基座模型、LoRA rank 与 alpha、目标模块、学习率、回放比例
3. 执行领域持续预训练，混入通用语料回放避免能力退化
4. 评估术语理解与下游任务指标，与通用模型基线逐项对比
5. 本地化部署推理服务，切流并监控质量回退

## 边界与不做

- 数据不满足时不用：语料量不足或没有算力（卡页示例需 24GB 单卡及以上）时不要启动，少量知识缺口用检索增强补齐更划算。
- 能力边界：本卡产出训练方案与领域模型，不含推理服务运维与线上调度，模型效果需用业务指标复验。
- 训练语料必须为自有或已授权数据，不得灌入客户隐私与平台受限数据，模型权重与语料不得外发。

## 技能关联

- **前置**：Skill-Agent-Knowledge-Distillation-SOP.html、Skill-Agent-Knowledge-Distillation-SOP、Skill-FastKGE-Incremental-LoRA-KG-Embedding.html、Skill-FastKGE-Incremental-LoRA-KG-Embedding
- **延伸**：Skill-ATLAS-Gradient-Free-Continual.html、Skill-ATLAS-Gradient-Free-Continual、Skill-AutoSkill-Lifelong-Learning.html、Skill-AutoSkill-Lifelong-Learning、Skill-CASCADE-Deployment-Time-Learning.html、Skill-CASCADE-Deployment-Time-Learning
- **可组合**：Skill-FActScore-Claim-Verification-Pipeline.html、Skill-FActScore-Claim-Verification-Pipeline、Skill-RAGAS-RAG-Evaluation-Framework.html、Skill-RAGAS-RAG-Evaluation-Framework、Skill-Domain-Adaptive-Continual-Pretraining

---

> 分类：数据与Agent平台/数据与AI运行/业务工具实现　·　技术族：16-智能体工程　·　源卡：`Skill-Domain-Adaptive-Continual-Pretraining`