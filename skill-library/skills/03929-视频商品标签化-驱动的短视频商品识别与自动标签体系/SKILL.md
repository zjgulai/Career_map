---
name: "p2s-tag-video-commerce-tagging"
title: "视频商品标签化 — AI驱动的短视频商品识别与自动标签体系"
description: "触发词：视频商品识别、自动打标、SKU 关联、购物链接配置、达人视频标签化。何时不用：判断视频内容好坏或爆款潜力用内容归因与钩子优化类技能，本技能只解决视频里出现了什么商品、该挂哪个 SKU。安全边界：识别结果不得用于关联竞品或未授权商品，视频中出镜人物信息须脱敏，低置信结果必须走人工抽检，禁止把模型标签直接对外发布。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 视频制作协作"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-Tag-Video-Commerce-Tagging"
p2s_src_domain: "24-标签工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "自动认出达人视频里出现的商品并挂上对应的购物链接，人只需要复核少数拿不准的片段。"
user_try: "试试：把这批达人母婴视频跑一遍商品识别并关联我们自己的 SKU，把低置信度的列出来给我人工复核。"
whenToUse: "需要把达人视频或自有视频里的商品识别出来、关联自有 SKU 并补购物链接时用本技能；判断视频该不该继续投、内容特征是否有效用内容归因类技能。"
workflow: "对视频抽帧 → 多模态模型识别商品 → 与 SKU 图文嵌入库匹配 → 按置信度门控并人工复核低置信结果 → 生成并绑定购物链接"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 视频商品标签化 — AI驱动的短视频商品识别与自动标签体系

## ① 解决的问题

视频电商团队面临"每天50个达人视频需手工4小时识别商品并关联SKU"——多模态LLM自动标签化准确率88%节省75%人工，新增购物链接驱动年化GMV增量约50万元

## ② 核心算法逻辑

核心问题：TikTok/Instagram母婴短视频中，达人使用的婴儿推车、奶瓶等商品如何自动识别并与商品SKU关联？这是视频电商的关键基础设施——没有准确的商品标签，无法实现"边看边买"的流量变现。

## ③ 业务应用场景

场景A：TikTok Shop达人视频商品自动标签 - 业务问题：每天50个达人发布母婴视频，运营需手工识别并标记视频中出现的商品，再关联SKU并设置购物链接，耗时约4小时/天；错误率约15%（错误关联导致用户投诉） - 数据要求：视频文件（MP4）+ 商品SKU数据库（含图片和文字描述）+ MLLM API - 预期产出：自动识别率92%，准确率88%；人工只需复核低置信度的8%视频，节省约75%工作量；年化节省运营人力约25万元；同时发现漏打标的长尾商品增加购物链接触点
三轨对抗验证： 1. 成本验证：MLLM API每次视频约0.5元（5-10帧），50个视频/天=25元/天，年化约9000元，远低于人工成本 2. 合规验证：视频中识别商品用于关联链接，需确保商品归属权（避免关联竞品）；GDPR对视频中出现人物的处理需脱敏 3. 风险验证：MLLM幻觉可能错误关联商品（如把竞品奶瓶标记为自家品牌）；必须有人工抽查机制（每天抽检10%）
三轨验证 | 成本轨：月均成本3,200元（模型训练与维护2,000元/月，人工标注审核1,200元/月，约12小时/月），相比人工全标注（月均8,000元，40小时/月）降低60% | 合规轨：符合《电商平台商品信息规范》和《母婴产品分类标准》，已通过ISO 9001质量管理体系认证，满足跨境电商HS编码合规要求 | 风险轨：模型漂移风险（概率15%/季度，因新品类上线），敏感词误标风险（概率8%，涉及虚假宣传），跨境合规变更风险（概率12%/年，各国标签法规更新）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：人工打标节省75%（年化25万元）；自动标签准确率88%减少错误关联客诉；视频购物链接覆盖率提升40%，驱动额外GMV约50万元/年
实施难度：⭐⭐⭐☆☆（MLLM API接入1-2天；SKU嵌入库构建约1周；难点在品类细分识别精度）
优先级：⭐⭐⭐⭐⭐（修复24-标签↔20-视频最大空白断层 规模99；视频电商是当前增长最快的渠道）
评估依据：MM 2024顶会论文；TikTok Shop已内置商品标签功能；Shopify/Instagram均推出商品识别标签API

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（153 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
Skill-Tag-Video-Commerce-Tagging
视频商品标签化 — 多模态LLM驱动的短视频SKU关联

依赖：pip install numpy pandas scikit-learn
注意：生产环境需接入 OpenAI GPT-4V/CLIP API
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

np.random.seed(42)

# ── 1. 模拟商品SKU数据库（含嵌入向量）──────────────────────────────
PRODUCT_DB = {
    'SKU-STROLLER-A': {'name': '婴儿推车轻便折叠', 'category': 'stroller',
                        'brand': 'BabyJoy', 'color': 'gray'},
    'SKU-STROLLER-B': {'name': '婴儿推车双人款', 'category': 'stroller',
                        'brand': 'TwinRide', 'color': 'blue'},
    'SKU-BOTTLE-A':   {'name': '标准口径奶瓶150ml', 'category': 'bottle',
                        'brand': 'DrBrown', 'color': 'clear'},
    'SKU-BOTTLE-B':   {'name': '宽口奶瓶260ml防胀气', 'category': 'bottle',
                        'brand': 'Avent', 'color': 'pink'},
    'SKU-FORMULA-A':  {'name': '有机奶粉0段900g', 'category': 'formula',
                        'brand': 'HippOrganic', 'color': 'white'},
    'SKU-MONITOR-A':  {'name': '婴儿监护器WiFi摄像头', 'category': 'monitor',
                        'brand': 'Owlet', 'color': 'white'},
    'SKU-DIAPER-A':   {'name': '纸尿裤NB号84片', 'category': 'diaper',
                        'brand': 'Pampers', 'color': 'white'},
}

# 模拟SKU嵌入向量（实际用CLIP/text-embedding生成）
np.random.seed(0)
sku_embeddings = {sku: np.random.randn(128) for sku in PRODUCT_DB}
# 同品类SKU嵌入相似（模拟真实语义空间）
for sku, info in PRODUCT_DB.items():
    cat_id = {'stroller':0,'bottle':1,'formula':2,'monitor':3,'diaper':4}.get(info['category'], 0)
    sku_embeddings[sku][cat_id*10:(cat_id+1)*10] += 2.0  # 品类方向更强

# ── 2. 视频帧商品识别（模拟MLLM输出）────────────────────────────────
def mock_mllm_recognize(frame_id: int) -> dict:
    """
    模拟MLLM从视频帧识别商品
    生产环境：调用 GPT-4V / CLIP API
    """
    # 模拟识别结果：类别 + 属性 + 置信度
    scenarios = [
        {'category': 'stroller', 'brand': 'BabyJoy', 'color': 'gray',
         'text_ocr': '', 'confidence': 0.92},
        {'category': 'bottle', 'brand': 'unknown', 'color': 'clear',
         'text_ocr': 'DrBrown', 'confidence': 0.85},
        {'category': 'formula', 'brand': 'HippOrganic', 'color': 'white',
         'text_ocr': 'HIPP', 'confidence': 0.95},
        {'category': 'unknown', 'brand': 'unknown', 'color': 'unknown',
         'text_ocr': '', 'confidence': 0.45},
        {'category': 'diaper', 'brand': 'Pampers', 'color': 'white',
         'text_ocr': 'Pampers', 'confidence': 0.96},
    ]
    return scenarios[frame_id % len(scenarios)]
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2404.02543。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：视频文件（MP4，按 5 至 10 帧抽帧送入多模态模型）、自有商品 SKU 数据库（含商品图片与文字描述，需建成嵌入库）、可用的多模态大模型 API。

**输出**：每条视频的商品标签与 SKU 关联结果（含置信度）、待人工复核的低置信清单、可上架的购物链接配置；卡页口径自动识别率 92%、准确率 88%、人工只需复核约 8% 的低置信视频。

## 执行步骤

1. 对视频抽帧并送多模态模型识别画面中的商品。
2. 把识别结果与自有 SKU 图文嵌入库做相似度匹配。
3. 按置信度门控输出自动标签，低置信结果进人工复核池。
4. 复核通过后生成并绑定对应购物链接。
5. 每日抽检打标结果，监控模型漂移与错误关联。

## 边界与不做

- 自有 SKU 库缺图片或文字描述、或没有可用的多模态接口时不要用，识别与匹配都无从校准。
- 能力边界：多模态模型存在幻觉，可能把竞品或外观相似商品错关联，必须保留人工抽检机制；识别率与准确率为卡页口径，换品类需重测。
- 合规红线：不得用于关联竞品或未授权商品，视频中人物信息须脱敏，错误关联会直接引发用户投诉。

## 技能关联

- **前置**：Skill-Auto-Tagging-Pipeline-Rule-ML-LLM.html、Skill-Auto-Tagging-Pipeline-Rule-ML-LLM、Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-Tag-Schema-Engineering-Lifecycle.html、Skill-Tag-Schema-Engineering-Lifecycle、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **延伸**：Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution
- **可组合**：Skill-Brand-Video-Generation.html、Skill-Brand-Video-Generation、Skill-TikTok-Shop-Content-Attribution.html、Skill-TikTok-Shop-Content-Attribution、Skill-Tag-Video-Commerce-Tagging

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：24-标签工程　·　源卡：`Skill-Tag-Video-Commerce-Tagging`