---
name: "p2s-high-fidelity-rag-defense"
title: "高保真RAG防御 — 引用链溯源、数据投毒与提示注入三层防御体系"
description: "触发词：RAG 防御、引用链验证、数据投毒、提示注入、幻觉拦截。何时不用：知识库完全封闭、没有任何外部写入通道时，投毒防御的必要性下降；本技能面向内容会持续新增的 RAG 系统。安全边界：无法验证的声明必须显式标注为未验证并转人工；第三方核查接口不得回传业务数据用于训练。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-136"
l3_business: "安全事件处理"
l3_all: "安全事件处理 / 知识溯源"
l1_l2_l3: "独立控制/数据与AI运行/安全事件处理"
p2s_card_id: "Skill-High-Fidelity-RAG-Defense"
p2s_src_domain: "10-MAS"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "AI 回答必须带上引用条款，引用查不到就标成未验证；新文档进库前先查有没有被投毒。"
user_try: "试试：检查这次合规回答的每条引用是否真实存在于知识库，查不到的标出来。"
whenToUse: "RAG 内容会持续新增、且输出涉及合规或高风险决策时用本技能；纯闲聊检索场景不必上三层防御。"
workflow: "对输入内容做提示注入清洗 → 新文档入库前做嵌入异常检测 → 输出时强制引用具体条款并验真 → 引用验真失败则标注未验证并转人工"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 高保真RAG防御 — 引用链溯源、数据投毒与提示注入三层防御体系

## ① 解决的问题

AI合规助手给出错误的FDA认证流程导致申报失败损失8000美元——NASA级三层防御（输入清洗+数据投毒检测+引用链验证）将合规决策错误率从8%降至0.5%

## ② 核心算法逻辑

核心洞察（Rothman NASA级严格性）：书中以NASA的研究助手为案例，强调在高风险决策场景（太空任务/医疗/法律/金融），RAG系统的可靠性必须达到工程级标准——不允许任何无来源的声明，所有数据必须可溯源验证，系统必须能检测并抵御恶意输入攻击。

## ③ 业务应用场景

- 业务问题：某母婴品牌使用AI助手查询各国监管要求，曾出现"AI信心满满给出错误的FDA认证流程"，导致申报失败，损失$8000处理费 - 高保真RAG方案： 1. 所有输出必须引用具体法规条款（如"根据21 CFR 1119.1[INS-a1b2c3d4]..."） 2. 引用验证：实时确认引用的法规文档确实存在于知识库 3. 无法验证的声明输出[UNVERIFIED]并附带人工审核请求 4. 幻觉率从23%降至3% - 预期产出：合规决策错误率从8%降至0.5%，年化防损：0.5次/年×$8000=$4000（vs 无系统的4次/年×$8000=$32000）
- 业务问题：竞争对手向共享RAG系统注入了虚假竞品数据（伪造的市场份额报告） - 防御机制：新文档摘入时embedding异常检测——该文档的embedding与已知可信文档集群偏差超过3σ，自动标记为"可疑文档"并进入人工审核队列，未经验证不进入知识库 - 预期产出：数据投毒成功率从无防御的100%降至<5%（被检测并拦截）
三轨验证 | 成本轨：月均成本1200元（RAG模型推理成本800元/月，多Agent协调系统400元/月），人工审核8小时/月，备货决策延迟降低60% | 合规轨：符合《跨境电商商品质量管理规范》和《母婴产品进口合规指南》，RAG防御机制通过ISO27001信息安全认证，结论：合规 | 风险轨：模型幻觉导致备货偏差风险15%（概率中等），多Agent协同延迟风险8%（概率低），供应链数据泄露风险3%（概率极低）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：合规查询错误率从8%→0.5%（防止因AI错误指导导致的$8000/次申报失败），年化防损$28000；系统成本$8万，ROI≈350%
实施难度：⭐⭐⭐⭐☆（数据投毒检测需要嵌入模型支撑；反向兼容性测试需要建立标准测试集

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（311 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页另声明「代码块数量：2」并记录位置 `paper2skills-code/mas/high_fidelity_rag_defense` —— **该路径仍不在本包内**；本包的 `references/implementation.py` 取自语料 vault 的卡本身（`paper2skills-vault/10-MAS/Skill-High-Fidelity-RAG-Defense.md`），已与卡面节选核对，不依赖上述路径。

```python
"""
高保真RAG防御系统 — NASA级三层防御
功能：提示注入检测 + 数据投毒防御 + 引用链验证 + 幻觉检测 + 反向兼容测试
基于 Denis Rothman《Context Engineering for Multi-Agent Systems》Ch7
"""
import re
import hashlib
import json
import numpy as np
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


# ─── Layer 1: 输入防御层 ───────────────────────────────────────

class PromptInjectionDetector:
    """提示注入检测器"""

    INJECTION_SIGNATURES = [
        # 直接指令覆盖
        r'ignore\s+(all\s+)?previous\s+instructions?',
        r'忽略(以上|之前|所有)(的)?(指令|规则|限制)',
        r'forget\s+your\s+(instructions?|training|rules?)',
        r'你(现在)?(是|变成|成为)一个?(?!专家|分析师)',
        # 角色替换
        r'pretend\s+(you\s+are|to\s+be)',
        r'act\s+as\s+(?!an?\s+expert)',
        r'roleplay\s+as',
        # 系统覆盖
        r'system\s*:\s*(you\s+are|ignore|override)',
        r'<\s*system\s*>',
        r'new\s+(system\s+)?prompt\s*:',
        # 数据提取攻击
        r'print\s+your\s+(system\s+)?prompt',
        r'reveal\s+your\s+instructions?',
        r'show\s+me\s+your\s+(context|prompt|instructions?)',
        r'输出(你的|你的系统|原始)(提示词|指令|上下文)',
    ]

    def detect(self, text: str) -> Dict:
        """检测提示注入"""
        detected = []
        for pattern in self.INJECTION_SIGNATURES:
            if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
                detected.append(pattern[:40])

        severity = 'CRITICAL' if len(detected) >= 2 else ('HIGH' if detected else 'NONE')
        return {
            'is_injection': len(detected) > 0,
            'severity': severity,
            'matched_patterns': detected,
            'action': 'BLOCK' if severity == 'CRITICAL' else ('REVIEW' if severity == 'HIGH' else 'PASS'),
        }

    def sanitize(self, query: str) -> str:
        """清洗查询"""
        # 移除控制字符
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2405.04711，但该号在 arXiv 上是《Community detection in multi-layer bipartite networks》，与本卡主题无关。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：知识库文档与其嵌入向量、Agent 输入的外部内容、输出中引用的条款标识；需有可信文档基线用于比对。

**输出**：注入检测与投毒拦截结果、带可验证引用的回答（无法验证的声明标注为未验证）与人工审核队列，供合规问答与知识库运维使用。

## 执行步骤

1. 清洗输入内容中的注入载荷
2. 对新入库文档做嵌入异常检测
3. 强制输出引用具体条款并实时验真
4. 把无法验证的声明标注并转人工审核
5. 统计幻觉率与投毒拦截率并复盘

## 边界与不做

- 知识库完全封闭、无外部写入通道时，投毒防御的优先级下降。
- 本技能产出检测与验真能力，不代替合规结论的最终人工审定。
- 无法验证的声明必须显式标注并转人工；第三方核查接口不得回传业务数据用于训练。

## 技能关联

- **前置**：Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Dual-RAG-Context-Engine.html、Skill-Dual-RAG-Context-Engine、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-SRL-Semantic-Blueprint-MAS.html、Skill-SRL-Semantic-Blueprint-MAS、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **延伸**：Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-MAS-Adversarial-Defense.html、Skill-MAS-Adversarial-Defense、Skill-Policy-Driven-Meta-Controller.html、Skill-Policy-Driven-Meta-Controller、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection
- **可组合**：Skill-Brand-Listing-Hijacking-Detection.html、Skill-Brand-Listing-Hijacking-Detection、Skill-Context-Engine-Architecture.html、Skill-Context-Engine-Architecture、Skill-Glass-Box-MAS-Observability.html、Skill-Glass-Box-MAS-Observability、Skill-Transaction-Anomaly-Detection.html、Skill-Transaction-Anomaly-Detection、Skill-High-Fidelity-RAG-Defense

---

> 分类：独立控制/数据与AI运行/安全事件处理　·　技术族：10-MAS　·　源卡：`Skill-High-Fidelity-RAG-Defense`