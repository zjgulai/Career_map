---
name: "p2s-shoppable-video-cta-optimizer"
title: "Skill-Shoppable-Video-CTA-Optimizer — 可购物视频 CTA 时机与文案优化"
description: "触发词：CTA 时机、可购物视频、留存曲线、转化率优化、按钮文案。何时不用：没有秒级留存数据时无法定位最佳时机，只能靠 AB 测试穷举；直播间实时节奏优化也不用本技能。安全边界：CTA 文案与折扣信息须真实可兑现，不得使用绝对化用语或虚假促销。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-093"
l3_business: "视频制作协作"
l3_all: "视频制作协作 / 转化优化"
l1_l2_l3: "业务运营/品牌与增长/视频制作协作"
p2s_card_id: "Skill-Shoppable-Video-CTA-Optimizer"
p2s_src_domain: "20-AI视频生成"
quality_tier: "preview"
user_summary: "找出视频里观众还在看的那个时间点，把购物按钮挪过去，让同一条视频多带单。"
user_try: "试试：用这条 30 秒摇椅视频的留存曲线，把 CTA 从第 8 秒挪到最佳时机并给出按钮文案建议。"
whenToUse: "有秒级留存数据、要优化可购物视频转化时用本技能；直播间实时节奏优化不用本技能。"
workflow: "接入视频秒级留存曲线数据 → 定位留存率高且已交代解决方案的时间区间 → 把 CTA 移到该区间并调整按钮样式 → 重写 CTA 文案并做前后对比测试"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Skill-Shoppable-Video-CTA-Optimizer — 可购物视频 CTA 时机与文案优化

## ① 解决的问题

运营面临"视频CTA点击率低带货效果差"——最优呼吁时机预测将视频带货转化率从1.2%提升至2.8%，年化增收60万元

## ② 核心算法逻辑

可购物视频 CTA 优化（Shoppable Video CTA Optimizer）通过分析观众的留存曲线（Retention Curve），在留存率最高点前出现 CTA（行动召唤），最大化点击购买转化。

## ③ 业务应用场景

场景：婴儿摇椅 TikTok 可购物视频 CTA 时机优化
- 业务问题：30 秒婴儿摇椅视频，CTA 放在第 8 秒（问题刚提出），点击率仅 1.2%，低于同类 2.8% - 数据要求：TikTok Analytics 留存曲线数据（秒级）、历史 CTA 测试数据 - 执行方案： - 分析留存曲线，找到 18-22 秒区间（留存率约 42%） - 将 CTA 从 8 秒移至 19 秒（解决方案展示后） - 文案从「Shop Now」改为「Stop Colic Tonight - 20% OFF」 - CTA 按钮改为醒目橙色动画弹出 - 量化产出：CTA 点击率从 1.2% → 3.1%，购买转化率从 0.4% → 1.0% - 业务价值：视频购买转
三轨验证 | 成本轨：传统真人主播月均成本8000-15000元（含出镜费、化妆、场景租赁），虚拟主播AI方案月均成本1200-2000元（含云渲染、模型订阅、人工审核4小时/月），成本降低85%；首期投入3000元模型定制 | 合规轨：符合《电商直播内容规范》，虚拟主播需标注"AI生成"标签，依据《生成式AI服务管理暂行办法》第五条；母婴类需获得产品资质证明，不涉及医疗宣传即可合规 | 风险轨：虚拟主播辨识度低导致转化率下降15-25%（中概率），消费者信任度不足（中概率），平台算法对AI内容权重压低（低概率但影响大）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：CTA 优化后视频购买转化 2.5 倍提升，年化 TikTok 渠道 GMV 增量约 10-20 万元
实施难度：⭐⭐☆☆☆（主要是数据分析 + 文案优化，视频剪辑工具即可）
优先级：⭐⭐⭐⭐⭐（可购物视频是 TikTok Shop 最直接的变现工具）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（124 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 该**节选**在断点处被截断，语法不完整，不能直接运行（`ast.parse` 失败：第 58 行：'(' was never closed）。上文那份完整实现**没有这个问题**（`ast.parse` 通过）。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Callable

def model_retention_curve(
    total_duration_s: int,
    initial_retention: float = 1.0,
    drop_at_3s: float = 0.45,
    steady_state: float = 0.25,
    final_drop: float = 0.15
) -> np.ndarray:
    """模拟视频留存曲线（指数衰减 + 底部稳定）"""
    t = np.arange(total_duration_s + 1)
    
    # 分段留存模型
    retention = np.ones(len(t)) * initial_retention
    
    # 前3秒急降
    mask_early = t <= 3
    retention[mask_early] = initial_retention - (initial_retention - drop_at_3s) * (t[mask_early] / 3)
    
    # 3秒后缓慢衰减
    mask_mid = (t > 3) & (t <= total_duration_s - 3)
    t_mid = t[mask_mid] - 3
    duration_mid = total_duration_s - 6
    retention[mask_mid] = drop_at_3s - (drop_at_3s - steady_state) * (t_mid / duration_mid)
    
    # 最后3秒再降
    mask_final = t > total_duration_s - 3
    t_final = t[mask_final] - (total_duration_s - 3)
    retention[mask_final] = steady_state - (steady_state - final_drop) * (t_final / 3)
    
    return retention

def model_purchase_intent(
    total_duration_s: int,
    problem_end_s: int = 8,
    solution_end_s: int = 20
) -> np.ndarray:
    """建模购买意图曲线（低→高→持续）"""
    t = np.arange(total_duration_s + 1)
    intent = np.zeros(len(t))
    
    for i, ti in enumerate(t):
        if ti < problem_end_s:
            intent[i] = ti / problem_end_s * 0.3   # 问题建立阶段：低意图
        elif ti <= solution_end_s:
            # 解决方案展示阶段：意图快速上升
            progress = (ti - problem_end_s) / (solution_end_s - problem_end_s)
            intent[i] = 0.3 + progress * 0.7
        else:
            # 解决方案展示后：意图维持高位缓慢衰减
            decay = (ti - solution_end_s) / (total_duration_s - solution_end_s) * 0.2
            intent[i] = 1.0 - decay
    
    return intent

def find_optimal_cta_time(
    retention: np.ndarray,
    intent: np.ndarray,
```

## ⑧ 论文来源

**卡页记录的出处不可采信**：卡页写的是 arXiv:2106.12345，但该号在 arXiv 上是《On a new statistical technique for the real-time recognition of ultra-low multiplicity astrophysical neutrino burst》，与本卡主题无关。
⚠️ 该号被 16 张卡共用，最多只有一张能对。

按「不许洗白」口径，**本卡视为无论文来源**；需要溯源时请另找一手来源，不要引用上面这个号。

## 输入 / 输出契约

**输入**：视频的秒级留存曲线数据、历史 CTA 测试记录、视频时长与内容结构（问题提出与解决方案展示的时间点）。

**输出**：CTA 最佳时点建议、按钮样式与文案改写方案，以及点击率与转化率的对比口径；供内容与投放团队调整视频。

## 执行步骤

1. 接入视频留存曲线与历史 CTA 测试数据
2. 识别留存仍高且方案已展示的时间区间
3. 确定 CTA 新时点并调整按钮样式
4. 改写 CTA 文案并配置对比测试
5. 输出调整后的视频方案与预期提升口径

## 边界与不做

- 没有留存曲线数据时无法定位最佳时机，只能靠 AB 测试穷举。
- 本技能输出 CTA 时点与文案建议，不执行视频剪辑与投放动作。
- 安全边界：CTA 文案与折扣信息须真实可兑现，不得使用绝对化用语或虚假促销。

## 技能关联

- **前置**：Skill-A-Plus-Content-Video-Embedding.html、Skill-A-Plus-Content-Video-Embedding、Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-TikTok-Hook-Optimizer.html、Skill-TikTok-Hook-Optimizer、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **延伸**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-TikTok-Content-Lifecycle-Analytics.html、Skill-TikTok-Content-Lifecycle-Analytics、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-ROI-Attribution.html、Skill-Video-ROI-Attribution、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC
- **可组合**：Skill-AI-Product-Video-Script-Generator.html、Skill-AI-Product-Video-Script-Generator、Skill-ROAS-Budget-Optimization.html、Skill-ROAS-Budget-Optimization、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Video-Sentiment-Analysis-VOC.html、Skill-Video-Sentiment-Analysis-VOC、Skill-Shoppable-Video-CTA-Optimizer

---

> 分类：业务运营/品牌与增长/视频制作协作　·　技术族：20-AI视频生成　·　源卡：`Skill-Shoppable-Video-CTA-Optimizer`