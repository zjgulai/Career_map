---
name: "p2s-live-stream-highlight-extraction"
title: "Live-Stream-Highlight-Extraction — 直播高光片段自动提取与二次传播内容生产"
description: "触发词：直播高光、互动峰值、片段提取、二次传播、剪辑自动化。何时不用：没有直播互动数据、只有录屏文件时无法按峰值提取；原创短视频制作不用本技能。安全边界：AI 提取的片段须人工审核，不得含医疗功效宣传等违规内容；虚拟形象内容须标注 AI 生成。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 素材版本管理"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Live-Stream-Highlight-Extraction"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "三小时直播自动剪成十条高光短视频，人工剪辑的几个小时变成几分钟。"
user_try: "试试：用这场 3 小时母婴直播的互动数据提取 Top-10 高光片段，每段 30-60 秒并适配三个平台。"
whenToUse: "有直播回放与逐秒互动数据、需要批量产出二次传播素材时用本技能；原创短视频制作不用本技能。"
workflow: "接入直播逐秒互动数据序列 → 按阈值识别互动峰值区间 → 合并邻近片段并保留 Top-N → 导出高光短视频并适配各平台发布规格"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Live-Stream-Highlight-Extraction — 直播高光片段自动提取与二次传播内容生产

## ① 解决的问题

内容团队面临"3小时直播素材无法快速转为短视频"——互动峰值自动提取将剪辑工时从6h缩短至5分钟，二次发布带来额外GMV贡献15-20%

## ② 核心算法逻辑

论文：LiveStreamHighlight: RealTime Highlight Detection for Live Commerce via MultiModal Interaction Signals | 年份：2021

## ③ 业务应用场景

场景：TikTok Shop 3小时母婴直播的高光提取 - 直播结束后用互动数据自动提取 Top-10 高光片段（每段 30-60 秒） - 将 3 小时直播压缩为 10 条短视频素材，同步发布到 TikTok/Instagram Reels/YouTube Shorts - 量化价值：人工剪辑 3 小时素材需 4-6 小时，自动提取 < 5 分钟，年化节省剪辑工时 300+ 小时，二次流量 GMV 贡献 15-20%
三轨验证 | 成本轨：直播亮点提取自动化，月均成本降低85%，从原月均3000元（人工剪辑师1.5人×2000元/人）降至450元（AI工具订阅300元+人工审核4小时/月×37.5元/小时）；ROI周期2个月 | 合规轨：符合《电商直播内容规范》和《母婴产品广告法》要求，AI生成内容需人工审核确保不涉及医疗功效宣传；依据：GB7100母婴产品标准+平台社区规范 | 风险轨：①AI识别错误率3-5%导致不当内容上线（概率中等15%）②虚拟主播形象与真实主播信任度差异（概率高40%）③用户投诉虚假宣传风险（概率低8%）
**三轨验证** | 成本轨：批量直播亮点库建设，初期投入8000元（AI模型定制+数据标注），月均运维成本600元（云存储200元+人工维护8小时/月×50元/小时）；年度成本9200元，相比传统团队年均36000元节省74% | 合规轨：需获得直播平台官方认可，虚拟主播需标注"AI生成"标签；依据：《网络直播营销管理办法》第12条+抖音/小红书虚拟人物规范 | 风险轨：①用户信任度下降导致转化率下滑10-20%（概率高35%）②平台算法对虚拟内容限流（概率中等25%）③竞品投诉虚假宣传触发行政处罚（概率低5%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI量化: 3 小时直播生产 10 条短视频，年化节省剪辑工时 300+ 小时，二次内容带来额外 GMV 15-20%
实施难度: ⭐⭐（容易，主要是互动数据接入）
优先级: ⭐⭐⭐⭐（高频直播卖家刚需）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（62 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
from typing import List, Tuple, Dict

def extract_live_stream_highlights(
    interaction_series: List[float],
    fps: float = 1.0,
    z_threshold: float = 2.5,
    min_duration_sec: float = 3.0,
    window_expand_sec: float = 15.0,
    merge_gap_sec: float = 10.0,
    top_n: int = 10
) -> List[Dict]:
    arr = np.array(interaction_series)
    mean, std = arr.mean(), arr.std()
    if std == 0:
        return []

    z_scores = (arr - mean) / std
    peak_frames = np.where(z_scores > z_threshold)[0]

    if len(peak_frames) == 0:
        return []

    min_frames = int(min_duration_sec * fps)
    expand_frames = int(window_expand_sec * fps)
    merge_frames = int(merge_gap_sec * fps)

    segments = []
    i = 0
    while i < len(peak_frames):
        start = max(0, peak_frames[i] - expand_frames)
        end = peak_frames[i] + expand_frames
        while i + 1 < len(peak_frames) and peak_frames[i + 1] - peak_frames[i] < merge_frames:
            i += 1
            end = peak_frames[i] + expand_frames
        end = min(len(arr) - 1, end)
        if end - start >= min_frames:
            score = float(z_scores[start:end + 1].max())
            segments.append({"start_sec": start / fps, "end_sec": end / fps, "score": round(score, 2)})
        i += 1

    segments.sort(key=lambda x: -x["score"])
    for seg in segments:
        seg["duration_sec"] = round(seg["end_sec"] - seg["start_sec"], 1)
        seg["recommended_format"] = "15s" if seg["duration_sec"] <= 20 else "30s" if seg["duration_sec"] <= 45 else "60s"

    return segments[:top_n]


if __name__ == "__main__":
    np.random.seed(42)
    baseline = np.random.exponential(10, 3600)
    for t in [300, 900, 1800, 2700, 3300]:
        baseline[t:t + 30] += np.random.exponential(50, 30)

    highlights = extract_live_stream_highlights(baseline, fps=1.0, top_n=5)
    print(f"提取高光片段: {len(highlights)} 个")
    for i, h in enumerate(highlights):
        print(f"  #{i+1} {h['start_sec']:.0f}s - {h['end_sec']:.0f}s ({h['duration_sec']}s, 评分:{h['score']}, 规格:{h['recommended_format']})")
    assert len(highlights) > 0
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2104.12345，但该号在 arXiv 上是《Machine Learning-based Lie Detector applied to a Novel Annotated Game Dataset》，与本卡主题无关。
⚠️ 该号被 2 张卡共用，最多只有一张能对。
⚠️ 卡页 ② 段点名的论文是《LiveStreamHighlight: RealTime Highlight Detection for Live Commerce via MultiModal Interaction Signals》，与这个号指的不是同一篇。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：直播的逐秒（或按固定 fps 采样）互动数据序列，以及源视频与目标平台规格；片段最短时长、Top-N 上限等参数可配置。

**输出**：Top-N 高光片段清单（起止时间、时长）与导出的短视频素材；供剪辑与二次分发使用。

## 执行步骤

1. 接入直播互动数据序列
2. 按阈值识别超出均值的互动峰值区间
3. 合并邻近片段并筛出 Top-N
4. 导出高光短视频并适配各平台规格
5. 人工审核确认无违规内容后发布

## 边界与不做

- 缺少直播互动数据、或只有录屏文件时不用本技能，无法定位高光。
- 本技能输出片段定位与素材，不代替人工终审与发布动作。
- 安全边界：提取片段须人工审核，不得含医疗功效宣传等违规内容；虚拟主播内容须标注 AI 生成。

## 技能关联

- **可组合**：Skill-Live-Stream-Highlight-Extraction

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Live-Stream-Highlight-Extraction`