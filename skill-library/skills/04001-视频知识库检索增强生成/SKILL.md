---
name: "p2s-videorag-video-knowledge-retrieval"
title: "VideoRAG — 视频知识库检索增强生成"
description: "触发词：视频知识库、直播回放检索、跨模态检索、带时间戳引用、素材复用。何时不用：要把视频里的商品识别出来并挂购物链接用视频商品标签化技能，本技能解决已拍素材与直播回放的检索复用。安全边界：回放与问询日志须脱敏并遵守平台内容政策，仅限内部检索使用，不得对外输出含用户信息的片段。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-089"
l3_business: "内容策划"
l3_all: "内容策划 / 素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/内容策划"
p2s_card_id: "Skill-VideoRAG-Video-Knowledge-Retrieval"
p2s_src_domain: "08-知识图谱"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "把上百场直播回放变成能搜的知识库，问一句就能定位到具体场次和时间点。"
user_try: "试试：把这 120 场直播回放建成可检索知识库，我提问推车退货流程，直接给我相关片段和时间戳。"
whenToUse: "客服、采购等角色需要从大量已录直播或视频素材里快速定位讲解片段时用本技能；识别视频中的商品并挂链接用视频商品标签化技能，评估内容传播潜力用病毒潜力或情感共鸣类技能。"
workflow: "把直播回放切成时序片段 → 双路编码视觉帧与语音转写文本 → 建向量库并做跨模态对齐检索 → 返回相关片段与时间戳 → 生成带时间戳引用的答案"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VideoRAG — 视频知识库检索增强生成

## ① 解决的问题

运营团队面临TikTok直播回放内容无法检索——VideoRAG视频知识库使100场回放可精准检索，内容复用率+300%，年化内容价值42万元

## ② 核心算法逻辑

核心思想：将视频转化为可检索的知识库。通过双路编码（视觉帧特征向量 $\mathbf{v}_i$ + 语音ASR文本 $\mathbf{t}_i$）构建时序片段索引，采用跨模态对齐检索（余弦相似度 $\text{sim}(\mathbf{q}, \mathbf{k}) = \frac{\mathbf{q} \cdot \mathbf{k}}{|\mathbf{q}||\mathbf{k}|}$）定位视频片段，最后生成带时间戳的引用答案。

## ③ 业务应用场景

场景A：TikTok直播回放知识库——婴儿推车退货处理 - 业务问题：母婴品牌在TikTok进行120场直播，每场涉及产品讲解、退货政策、使用技巧等内容。客服每天收到50+关于「推车如何退货」的重复问询，需从历史直播中找到对应讲解片段，目前平均耗时25分钟/次，月均浪费400小时客服时间。 - 数据要求：120场直播视频（每场30-60分钟）、ASR自动转录文本、视觉帧特征（CLIP编码）、客户问询日志（过去3个月5000+条） - 预期产出：客服查询「推车退货流程」，系统在3秒内返回3场相关直播的具体时间戳（如「第2场直播第18分32秒」），准确率88%，覆盖率92% - 业务价值：月均客服
三轨验证 | 成本轨：月均成本800元（视频存储+API调用+模型微调），年均9600元 | 合规轨：符合GDPR（用户数据脱敏处理）、TikTok内容政策（仅内部客服使用） | 风险轨：模型过拟合概率8%（120场样本量有限），ASR识别错误率3-5%（英文/中文混合直播）
场景B：有机辅食品牌——营养成分对标检索 - 业务问题：有机婴儿辅食品牌在YouTube/TikTok进行80场产品对标直播，讲解自家产品vs竞品的营养成分差异。采购团队需快速找到「某竞品的钙含量讲解」来支持产品定价决策，目前需人工逐一查看直播记录，平均耗时40分钟/次，月均影响15个采购决策。 - 数据要求：80场直播视频、营养成分表单数据、竞品名称库、采购决策历史记录 - 预期产出：采购人员输入「竞品A的钙吸收率对比」，系统返回5场相关直播片段（精准率85%），包含讲解时间戳和关键数据截图 - 业务价值：采购决策周期缩短60%，年均加快15个产品定价决策，年化ROI 42万元（每个决策平均

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：母婴品牌客服团队面临「直播内容查询低效」的场景——VideoRAG将客服平均查询时间从25分钟降至3秒，年化节省客服成本58万元；采购团队面临「竞品对标决策缓慢」的场景——VideoRAG将采购决策周期缩短60%，年化加快15个产品定价决策，年化ROI 42万元。合计年化商业价值100万元。
实施难度：⭐⭐⭐☆☆
数据准备（中等难度）：需收集120场直播视频、ASR转录、视觉帧提取
模型部署（中等难度）：CLIP编码器微调、向量数据库搭建
业务集成（低难度）：客服系统/采购系统API接入
优先级：⭐⭐⭐⭐☆

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（262 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from datetime import timedelta
import json

# ============ VideoRAG 母婴跨境场景实现 ============

class VideoRAGSystem:
    def __init__(self, video_corpus_size=120, segment_length_sec=30):
        """
        初始化VideoRAG系统
        Args:
            video_corpus_size: 直播回放总数（如TikTok 120场直播）
            segment_length_sec: 时序片段长度（秒）
        """
        self.video_corpus_size = video_corpus_size
        self.segment_length_sec = segment_length_sec
        self.video_segments = []  # 存储所有视频片段的元数据
        self.visual_embeddings = None  # 视觉特征矩阵 (N, 512)
        self.text_embeddings = None   # 文本特征矩阵 (N, 512)
        self.multimodal_embeddings = None  # 跨模态融合特征 (N, 512)
        
    def build_video_corpus(self):
        """
        构建视频知识库：模拟120场母婴直播回放
        场景：婴儿推车品牌TikTok直播 + 有机辅食品牌YouTube直播
        """
        np.random.seed(42)
        segment_id = 0
        
        # 场景A：婴儿推车品牌 60场直播
        for video_idx in range(60):
            video_duration_min = np.random.randint(30, 61)  # 30-60分钟
            num_segments = int(video_duration_min * 60 / self.segment_length_sec)
            
            for seg_idx in range(num_segments):
                start_time_sec = seg_idx * self.segment_length_sec
                end_time_sec = start_time_sec + self.segment_length_sec
                
                # 模拟片段内容标签（退货、使用技巧、对比等）
                content_topics = ["退货流程", "使用技巧", "产品对比", "价格政策", "配件介绍"]
                topic = np.random.choice(content_topics)
                
                self.video_segments.append({
                    'segment_id': segment_id,
                    'video_id': f'stroller_live_{video_idx:03d}',
                    'category': 'baby_stroller',
                    'start_time': start_time_sec,
                    'end_time': end_time_sec,
                    'duration_sec': self.segment_length_sec,
                    'topic': topic,
                    'asr_text': f"This segment discusses {topic} for baby stroller product",
                    'platform': 'TikTok'
                })
                segment_id += 1
        
        # 场景B：有机辅食品牌 60场直播
        for video_idx in range(60):
            video_duration_min = np.random.randint(25, 51)  # 25-50分钟
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2501.05874 — VideoRAG: Retrieval-Augmented Generation over Video Corpus

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：直播或视频素材（卡页口径为 120 场、每场 30-60 分钟）、ASR 自动转录文本、视觉帧特征（CLIP 编码），以及检索侧的历史问询日志（如近 3 个月 5000 条以上）。

**输出**：针对查询返回的相关片段列表与具体时间戳（如第几场第几分几秒）、带时间戳引用的答案；卡页口径查询响应 3 秒内、准确率 88%、覆盖率 92%。

## 执行步骤

1. 收集直播或视频素材并切成固定时长的时序片段。
2. 对片段做语音转写与视觉帧编码，构建跨模态索引。
3. 搭建向量库，把查询与片段做跨模态相似度对齐检索。
4. 返回相关片段的场次与时间戳，并生成带引用的答案。
5. 用问询日志回测检索准确率与覆盖率并迭代索引。

## 边界与不做

- 素材量过少或缺少 ASR 转录时检索质量不可靠，不要用于对外答复；卡页口径为 120 场量级。
- 能力边界：本技能做检索与引用，不判断内容对错；ASR 识别错误率与有限样本会导致过拟合，中英混合直播需额外校验。
- 数据合规：回放与问询日志须脱敏并遵守平台内容政策，仅限内部检索使用，不得对外输出含用户信息的片段。

## 技能关联

- **前置**：Skill-CLIP-Vision-Language-Model、Skill-Customer-Service-Bot-Multilingual、Skill-Dense-Passage-Retrieval.html、Skill-Dense-Passage-Retrieval、Skill-Live-Stream-Highlight-Extraction.html、Skill-Live-Stream-Highlight-Extraction、Skill-Multimodal-RAG.html、Skill-Multimodal-RAG、Skill-Temporal-Grounding-Video、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VisRAG-Vision-Document-RAG.html、Skill-VisRAG-Vision-Document-RAG
- **延伸**：Skill-Customer-Service-Bot-Multilingual、Skill-Live-Stream-Highlight-Extraction.html、Skill-Live-Stream-Highlight-Extraction、Skill-Temporal-Grounding-Video、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VisRAG-Vision-Document-RAG.html、Skill-VisRAG-Vision-Document-RAG
- **可组合**：Skill-Customer-Service-Bot-Multilingual、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VideoRAG-Video-Knowledge-Retrieval

---

> 分类：业务运营/品牌与增长/内容策划　·　技术族：08-知识图谱　·　源卡：`Skill-VideoRAG-Video-Knowledge-Retrieval`