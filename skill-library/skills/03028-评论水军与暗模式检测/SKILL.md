---
name: "p2s-dark-pattern-review-detection"
title: "Dark Pattern Detection in Reviews — 评论水军与暗模式检测"
description: "触发词：水军检测、暗模式评论、差评攻击、协调行为识别、刷单自查。何时不用：只判别单条文本是否机器生成走 AI 生成内容检测；只看差评速率波动可用更轻的异常检测。安全边界：reviewer 行为分析须遵循 GDPR 数据最小化；误报会误伤真实评论，提交申诉前须设高置信阈值。"
l1_id: "PLN-PLT"
l1_plane: "数据与Agent平台"
l2_id: "DOM-08"
l2_domain: "数据与AI运行"
l3_id: "DOM-08-140"
l3_business: "数据质量"
l3_all: "数据质量 / 竞品研究"
l1_l2_l3: "数据与Agent平台/数据与AI运行/数据质量"
p2s_card_id: "Skill-Dark-Pattern-Review-Detection"
p2s_src_domain: "22-数据采集工程"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "识别成批出现的可疑评论，判断是竞品攻击还是真实差评，并整理出申诉证据。"
user_try: "试试：分析这批一星差评，判断是不是有组织的攻击，并整理申诉证据。"
whenToUse: "短时间出现成批异常评论、需要区分攻击与真实问题时用；只判别单条文本是否机器生成请用 AI 生成内容检测。"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Dark Pattern Detection in Reviews — 评论水军与暗模式检测

## ① 解决的问题

运营面临"竞品刷单水军在平台站稳脚跟导致真实口碑信号被污染"——暗模式评论检测将水军识别召回率从55%提升至91%，年化减少因虚假竞品信号导致的选品错误损失30-60万元

## ② 核心算法逻辑

评论暗模式检测（Dark Pattern Review Detection）识别平台上的协调性虚假评论攻击，攻击形态包括：刷好评（Review Bombing Positive）、踩差评（Competitor Attack）、评论集群（Review Rings）。单条评论文本分析召回率低（< 60%），需结合图神经网络和时序异常检测两个信号。

## ③ 业务应用场景

场景1：Amazon 竞品差评攻击检测 - 业务问题：婴儿安全座椅产品在 Prime Day 前 2 周内收到 47 条 1★ 差评，评分从 4.6 跌至 4.1，Buy Box 丢失，GMV 下降 35%。需要快速识别攻击并向 Amazon 申诉。 - 数据要求：该 ASIN 过去 180 天评论历史（时间戳/评分/文本/reviewer_id）+ reviewer 历史评论记录 - 预期产出：攻击评论识别列表 + 申诉证据报告（reviewer 行为异常分析）；申诉成功率提升 60-80% - 业务价值：恢复 4.6★ 评分后 Buy Box 恢复，挽回攻击期间 GMV 损失约 10-30
场景2：自身刷单风险自查（合规预防） - 业务问题：部分运营商家历史上使用过"测评返现"等灰色手段，担心被 Amazon 算法识别处罚（账号封禁风险），需要自查哪些评论有被识别为异常的风险。 - 数据要求：自家 ASIN 全量评论 + 参与测评活动的用户列表 - 预期产出：高风险评论列表（异常特征评分 > 0.7），提前删除或标记，降低被 Amazon 系统标记风险 - 业务价值：避免账号封禁（封禁损失 200-500 万元 GMV/年），合规运营
**三轨验证**： - 成本：GNN 推理 CPU 可承载（< 10 万评论），批处理模式即可；开源库 PyTorch Geometric/DGL - 合规：评论数据属于公开信息，但 reviewer 行为分析需注意 GDPR 中的数据最小化原则 - 风险：误报可能导致真实用户评论被申诉，需设置高置信度阈值（> 0.85）再提交申诉

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：每次成功识别竞品攻击并申诉成功，挽回 GMV 损失 10-30 万元/次；合规自查预防封号损失 200-500 万元/年
实施难度：⭐⭐⭐⭐☆
优先级：⭐⭐⭐⭐☆
评估依据：评论攻击在跨境电商领域极为普遍，尤其是 Prime Day 等大促前后。高价值 SKU 一旦遭受攻击，损失往往超过本 Skill 全年建设成本。主动检测是强 ROI 投资。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（218 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
评论水军与暗模式检测演示
模拟时序突增检测 + 行为特征评分 + 协调攻击识别
（无需 GNN 环境，使用特征工程 + 规则模拟 GNN 信号）
"""
import random
import math
from datetime import datetime, timedelta
from collections import defaultdict, Counter

# ── 模拟评论数据生成 ──────────────────────────────────────────────────────────
def generate_review_dataset(n_normal: int = 150, n_attack: int = 47) -> list[dict]:
    """生成含攻击事件的评论数据集"""
    reviews = []
    base_date = datetime.utcnow() - timedelta(days=180)
    attack_start = datetime.utcnow() - timedelta(days=14)

    # 正常评论：泊松分布，平均 1-2 条/天，评分正态分布
    for i in range(n_normal):
        day_offset = random.expovariate(0.02) % 166
        reviews.append({
            "review_id": f"NORM-{i:04d}",
            "reviewer_id": f"USR-{random.randint(1000, 9999):04d}",
            "asin": "B08A001",
            "rating": max(1, min(5, int(random.gauss(4.5, 0.8)))),
            "text": random.choice([
                "Great product, baby loves it!",
                "Very safe and easy to install.",
                "Good value for money.",
                "Solid quality, would recommend.",
                "Minor issue with assembly but overall good.",
            ]),
            "timestamp": base_date + timedelta(days=day_offset + random.random()),
            "reviewer_account_age_days": random.randint(180, 2000),
            "reviewer_review_count": random.randint(5, 200),
            "is_attack": False,
        })

    # 攻击评论：集中 2 周内，全 1★，账号新注册，文本相似
    attack_texts = [
        "Terrible product, dangerous for baby!",
        "Very bad quality, do not buy!",
        "Dangerous and unsafe, avoid!",
        "Worst purchase ever, total junk.",
        "This product is hazardous, 1 star.",
    ]
    for i in range(n_attack):
        reviews.append({
            "review_id": f"ATK-{i:04d}",
            "reviewer_id": f"ATK-{random.randint(100, 999):03d}",
            "asin": "B08A001",
            "rating": 1,
            "text": random.choice(attack_texts),
            "timestamp": attack_start + timedelta(hours=random.uniform(0, 336)),
            "reviewer_account_age_days": random.randint(1, 30),
            "reviewer_review_count": random.randint(1, 5),
            "is_attack": True,
        })

    return sorted(reviews, key=lambda x: x["timestamp"])
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：目标 ASIN 一段时间的评论历史（时间戳、评分、文本、reviewer_id）与 reviewer 的历史评论记录

**输出**：可疑评论识别列表、协调行为分析报告与申诉证据材料；自查场景输出高风险评论清单（异常评分大于 0.7）

## 执行步骤

1. 汇总目标 ASIN 的评论历史与 reviewer 行为数据。
2. 做时序突增检测与行为特征评分，识别协调攻击信号。
3. 把结果整理成申诉证据报告，区分攻击型与真实型评论。
4. 仅对高置信样本（卡页建议大于 0.85）提交申诉，避免误伤真实用户。

## 边界与不做

- 何时不用：只需判断单条文本是否 AI 生成时，请转 AI 生成内容检测；只看差评速率波动可先用更轻的异常检测。
- 能力边界：输出是可疑度排序与证据材料，不代向平台提交申诉，也不保证平台受理。
- 安全边界：reviewer 行为分析须遵循 GDPR 数据最小化；误报会误伤真实评论，提交申诉前须设高置信阈值（大于 0.85）。

## 技能关联

- **可组合**：Skill-Dark-Pattern-Review-Detection

---

> 分类：数据与Agent平台/数据与AI运行/数据质量　·　技术族：22-数据采集工程　·　源卡：`Skill-Dark-Pattern-Review-Detection`