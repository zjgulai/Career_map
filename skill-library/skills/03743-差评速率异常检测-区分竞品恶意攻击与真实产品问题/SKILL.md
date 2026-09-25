---
name: "p2s-review-velocity-anomaly-detector"
title: "差评速率异常检测 — 区分竞品恶意攻击与真实产品问题"
description: "触发词：差评速率、CUSUM、异常告警、攻击识别、批次质量预警。何时不用：要逐条判断评论真伪走假评论检测；只看长期评分趋势可用更轻的统计分析。安全边界：采集须遵守平台爬虫协议与个人信息保护要求，卡页建议取得官方数据合作授权。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 质量分析"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Review-Velocity-Anomaly-Detector"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "盯差评出现的速度，几小时内分辨是竞品攻击还是产品真出了问题。"
user_try: "试试：这个 SKU 两天内多了二十多条一星差评，判断是攻击还是产品问题。"
whenToUse: "差评在短时间内集中出现、需要尽快区分攻击与真实问题时用；要逐条判断评论真伪请转假评论检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 差评速率异常检测 — 区分竞品恶意攻击与真实产品问题

## ① 解决的问题

亚马逊运营面临"48小时内涌入23条1星差评无法判断是攻击还是产品问题"——CUSUM异常检测将识别时间从48小时→2小时，拦截攻击后单SKU月均多保留8.5万美元销售额

## ② 核心算法逻辑

差评速率异常检测通过时序统计方法识别评论速率突变，区分两类场景：

## ③ 业务应用场景

场景A：婴儿配方奶粉竞品攻击预警 - 业务问题：某SKU在48小时内新增23条1星差评（正常基准：日均0.3条），评分从4.6星骤降至4.1星 - 检测结果：CUSUM在第8条时触发告警，账号平均年龄17天，Verified Purchase仅4%（正常>70%） - 判断：竞品恶意攻击，置信度92% - 处置：立即向Amazon提交Review Removal Request，提供统计证据；5天内移除18条，评分恢复4.5星 - 业务价值：Sales rank从#124恢复至#67，当月多保留约8.5万美元销售额
场景B：吸奶器产品批次质量问题早期预警 - 业务问题：某批次(2024Q3生产)吸奶器差评在3周内缓慢增加，但内容高度一致（"噪音大"） - 检测结果：CUSUM在第14天触发趋势告警，评论地理分布多样（美国15个州），文本相似度中等（0.45） - 判断：真实产品问题，置信度88% - 处置：召回该批次联系换货，同步更新产品设计，损失控制在45万元内 - 业务价值：早期干预vs晚期差评积累，避免评分<4.0导致的长期排名受损（年均损失估算>300万）
三轨验证 | 成本轨：月均成本3,200元（云计算资源1,500元+人工审核16小时/月@100元/小时+API调用200元+存储维护500元） | 合规轨：符合《电商法》第五条数据采集规范，遵循Amazon爬虫协议robots.txt，获取公开商品信息合规；需补充《个人信息保护法》合规声明，建议获得Amazon官方数据合作授权 | 风险轨：IP被封禁概率15%（需轮换代理池），数据延迟导致价格偏差概率8%（可接受范围），Amazon服务条款变更风险12%（需月度合规审查）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI 预估：评分每下降0.1星销量降低5-8%；及时检测攻击（2小时vs48小时），避免差评在高峰期累积，年均保护销售额约30-80万元/SKU
实施难度：⭐⭐☆☆☆（CUSUM算法简单，主要工作在数据采集管道）
优先级：⭐⭐⭐⭐⭐（差评攻击是Amazon运营最高频紧急事件，7×24监控必备）

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（189 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
差评速率异常检测系统 - CUSUM + 评论元数据分析
区分竞品恶意攻击 vs 真实产品问题
"""
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import random


@dataclass
class ReviewRecord:
    """评论记录"""
    review_id: str
    rating: int               # 1-5星
    timestamp: datetime
    reviewer_age_days: int    # 账号年龄（天）
    is_verified_purchase: bool
    country_code: str         # 评论者国家
    text_length: int          # 评论文字长度
    text_hash: str            # 评论内容哈希（用于相似度比较）


class CUSUMDetector:
    """CUSUM累积和控制图差评速率异常检测"""

    def __init__(self, baseline_rate: float, k_factor: float = 0.5, h_threshold: float = 5.0):
        """
        baseline_rate: 基准差评率（日均负评数，如0.3）
        k_factor: 允许漂移系数（通常=0.5*sigma）
        h_threshold: 告警阈值（通常=4*sigma）
        """
        self.baseline_rate = baseline_rate
        self.k = k_factor
        self.h = h_threshold
        self.s_pos = 0.0  # 上行累积和
        self.s_neg = 0.0  # 下行累积和
        self.alerts = []

    def update(self, day: int, negative_count: float) -> Optional[str]:
        """处理单日差评数量，返回告警类型或None"""
        x = negative_count
        mu = self.baseline_rate

        self.s_pos = max(0, self.s_pos + (x - mu - self.k))
        self.s_neg = max(0, self.s_neg + (-x + mu - self.k))

        if self.s_pos > self.h:
            alert = f"Day {day}: 差评速率异常升高 (S+={self.s_pos:.2f} > h={self.h})"
            self.alerts.append(alert)
            self.s_pos = 0  # 重置
            return "SPIKE_UP"
        if self.s_neg > self.h:
            alert = f"Day {day}: 差评速率异常下降 (S-={self.s_neg:.2f} > h={self.h})"
            self.alerts.append(alert)
            self.s_neg = 0
            return "SPIKE_DOWN"
        return None
```

## ⑧ 论文来源

**出处待人工判定**：卡页写的是 arXiv:2006.06870。

本卡可用的英文标题词只有 1 个，机器判据给不出可信结论，故**不做断言**。需要引用时请人工看一眼这篇论文是否对口。

## 输入 / 输出契约

**输入**：评论记录（评分、时间戳、账号年龄、是否验证购买等）与差评速率的正常基准

**输出**：异常触发时点与判定结论（攻击或真实问题，含置信度），以及申诉证据或批次召回线索的输入

## 执行步骤

1. 统计目标 SKU 的差评速率基准与正常波动范围。
2. 用 CUSUM 一类累积和检测捕捉速率突变。
3. 结合账号年龄、验证购买比例、文本相似度与地理分布做归因判断。
4. 按结论分流：攻击走平台申诉，真实问题走批次召回与设计改进。

## 边界与不做

- 何时不用：要逐条判断评论真伪时请转假评论检测；只看长期评分趋势可先用更轻的统计分析。
- 能力边界：输出是异常判定与置信度，不代提交平台申诉，也不代决定召回。
- 安全边界：采集须遵守平台爬虫协议与个人信息保护要求，卡页建议取得官方数据合作授权。

## 技能关联

- **前置**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Dark-Pattern-Review-Detection.html、Skill-Dark-Pattern-Review-Detection、Skill-Data-Quality-Monitor-Alert.html、Skill-Data-Quality-Monitor-Alert、Skill-Negative-Review-Root-Cause-Analyzer.html、Skill-Negative-Review-Root-Cause-Analyzer、Skill-Review-Defense-Vine-Optimizer.html、Skill-Review-Defense-Vine-Optimizer
- **延伸**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Dark-Pattern-Review-Detection.html、Skill-Dark-Pattern-Review-Detection、Skill-Negative-Review-Root-Cause-Analyzer.html、Skill-Negative-Review-Root-Cause-Analyzer、Skill-Review-Defense-Vine-Optimizer.html、Skill-Review-Defense-Vine-Optimizer
- **可组合**：Skill-Amazon-SP-API-Data-Pipeline.html、Skill-Amazon-SP-API-Data-Pipeline、Skill-Dark-Pattern-Review-Detection.html、Skill-Dark-Pattern-Review-Detection、Skill-Review-Defense-Vine-Optimizer.html、Skill-Review-Defense-Vine-Optimizer、Skill-Review-Velocity-Anomaly-Detector

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Review-Velocity-Anomaly-Detector`