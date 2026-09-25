---
name: "p2s-privacy-preserving-ad-measurement"
title: "隐私保护广告测量 — OPRF+差分隐私跨平台归因"
description: "触发词：隐私保护归因、OPRF、差分隐私、跨平台测量、ID 隔离、PSI。何时不用：自有站点可正常使用 Cookie 与用户级归因时不必上本卡；本卡针对平台间用户 ID 隔离、无法回传用户级数据的场景。安全边界：只允许交换哈希集合与加噪聚合结果，不得回传明文用户 ID 或可重识别的个体数据。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-05"
l2_domain: "品牌与增长"
l3_id: "DOM-05-095"
l3_business: "投放诊断"
l3_all: "投放诊断 / 隐私需求分析"
l1_l2_l3: "业务运营/品牌与增长/投放诊断"
p2s_card_id: "Skill-Privacy-Preserving-Ad-Measurement"
p2s_src_domain: "13-广告分析"
p2s_code_level: "完整实现·可解析"
quality_tier: "preview"
user_summary: "在不上传用户原始 ID 的前提下，把跨平台的真实转化数算出来，让投放归因更可信。"
user_try: "试试：我有 TikTok 点击用户哈希集合和 Amazon 的购买用户哈希集合，帮我用 OPRF-PSI 加差分隐私估算跨平台真实转化数。"
whenToUse: "与「联邦学习相似受众」相比：要估算跨平台转化与 ROAS 用本卡的 OPRF+差分隐私测量；要扩量受众、做 Lookalike 建模用联邦学习那张卡。"
workflow: "双方各自对用户 ID 做哈希并约定 24 小时时间窗口 → 用 OPRF-PSI 求交集，得到跨平台转化用户计数 → 对交集计数加差分隐私噪声并做误差分析 → 反推真实 ROAS 并给出置信区间"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# 隐私保护广告测量 — OPRF+差分隐私跨平台归因

## ① 解决的问题

TikTok 投放→Amazon 购买的跨平台归因因用户 ID 隔离完全依赖平台自报误差——引入 OPRF+差分隐私跨平台归因，跨平台归因准确率提升50%，广告预算再分配年化 ROI 提升 20%。

## ② 核心算法逻辑

核心问题：苹果ATT、GDPR、谷歌Privacy Sandbox三重冲击后，广告平台与商家无法直接共享用户ID来匹配"谁点了广告又完成了购买"，传统像素归因失效，3050%的转化事件归因断裂。

## ③ 业务应用场景

场景A：TikTok广告 → 亚马逊购买的跨平台归因
- 业务痛点：TikTok投放婴儿推车广告，用户跳转亚马逊购买，两平台的用户ID体系完全隔离，传统方式无法归因，ROAS计算完全依赖TikTok自报的"推算转化"（误差30%+） - PrivacyGo方案：TikTok持有点击事件的哈希用户ID → 与Amazon Ads API提供的购买用户哈希ID执行OPRF-PSI → 在差分隐私保护下得到真实跨平台转化数 → 反推真实ROAS - 数据要求：TikTok Ads数据（点击用户哈希集合，24小时窗口）+ Amazon Attribution（购买用户哈希集合） - 量化产出：将归因误差从30-50%压缩至<5%，ROAS报告置信度显著提
场景B：苹果ATT选择率20%下估计iOS用户转化率

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

50%

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（211 行）。**下面 59 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，59 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：1」，但**未记录代码位置**（源站写「未检测到」）。

```python
"""
隐私保护广告测量 — OPRF+差分隐私模拟器
PrivacyGo框架简化版：哈希模拟OPRF协议 + 拉普拉斯DP噪声 + 误差分析
末尾输出: [✓] 隐私保护广告测量测试通过
"""

import hashlib
import secrets
import numpy as np
from dataclasses import dataclass
from typing import Set, Tuple


# =================== 第一层：OPRF协议模拟 ===================

class OPRFServer:
    """
    OPRF服务端（广告平台持有）
    真实实现需要椭圆曲线盲化，此处用HMAC-SHA256模拟
    """

    def __init__(self):
        # 盲化密钥（服务端持有，客户端不可见）
        self._key = secrets.token_bytes(32)

    def blind_evaluate(self, blinded_id: bytes) -> bytes:
        """
        服务端盲化计算：对客户端盲化后的ID施加密钥
        输出：F_k(blind(x))，客户端可unblind得到 F_k(x)
        """
        import hmac
        return hmac.new(self._key, blinded_id, hashlib.sha256).digest()

    def rotate_key(self):
        """盲密钥旋转：防止长期密钥泄露"""
        self._key = secrets.token_bytes(32)
        print("  [密钥轮换] OPRF密钥已旋转，历史数据无法被重放")


def simulate_oprf_psi(
    advertiser_ids: Set[str],  # 广告平台：点击用户ID集合
    merchant_ids: Set[str],    # 商家：转化用户ID集合
    oprf_server: OPRFServer,
) -> Tuple[int, Set[str]]:
    """
    模拟OPRF私有集合求交（PSI）
    真实协议中双方不知道对方的具体ID，此处为教学演示
    返回：(交集大小, 交集ID集合用于验证)
    """
    # Step 1: 商家对自己的ID进行"盲化"（真实中用随机数乘法盲化椭圆曲线点）
    def blind(user_id: str) -> bytes:
        # 模拟：加随机前缀模拟盲化
        return hashlib.sha256(f"blind:{user_id}".encode()).digest()

    def unblind(oprf_output: bytes, user_id: str) -> bytes:
        # 模拟：去除随机前缀，得到 F_k(user_id)
        # 真实协议：OPRF输出 = F_k(x)，与盲化因子无关
        import hmac
        return hmac.new(oprf_output, user_id.encode(), hashlib.sha256).digest()
```

## ⑧ 论文来源

**出处（已核验）**：arXiv:2506.20981 — PrivacyGo: Privacy-Preserving Ad Measurement with Multidimensional Intersection

核验口径：编号在 arXiv 上存在，且论文主题与本卡一致（卡内点名标题相似度或标题词重合达标）。

## 输入 / 输出契约

**输入**：广告平台侧点击用户哈希 ID 集合（24 小时窗口）与商家侧购买用户哈希 ID 集合（如 Amazon Attribution）；两侧需同一哈希口径，不传明文 ID 与个人字段。

**输出**：去偏后的跨平台真实转化数、加噪后的置信区间与修正后的 ROAS 报告，供投放与数据合规团队共用；卡页案例把归因误差从 30–50% 压到 5% 以内。

## 执行步骤

1. 梳理两侧可交换的哈希 ID 集合，统一哈希与时间窗口口径。
2. 执行 OPRF-PSI 求交，得到跨平台转化用户计数而不暴露个体。
3. 加入拉普拉斯差分隐私噪声，输出加噪计数并做误差分析。
4. 用去偏后的转化数反推真实 ROAS 与置信区间。
5. 输出可供平台自报数据校对的测量报告。

## 边界与不做

- 何时不用：两侧没有可对齐的哈希 ID、或平台未开放聚合级接口时不要用；单一平台内部归因不需要本卡。
- 能力边界：本卡产出测量与误差评估，不做跨平台用户级数据回传，也不自动调整投放。
- 安全边界：任何明文用户 ID、可重识别个体的输出都是红线，差分隐私预算 ε 须与法务确认。

## 技能关联

- **前置**：Skill-Differential-Privacy-Basics、Skill-Multi-Touch-Attribution
- **延伸**：Skill-Geo-Incrementality-DML.html、Skill-Geo-Incrementality-DML
- **可组合**：Skill-Constrained-Multi-Objective-Ad-Delivery.html、Skill-Constrained-Multi-Objective-Ad-Delivery、Skill-Customer-Churn-Prediction.html、Skill-Customer-Churn-Prediction、Skill-Federated-Learning-Ad、Skill-RELATE-RL-Ad-Text-Generation.html、Skill-RELATE-RL-Ad-Text-Generation、Skill-VOC-Aspect-Sentiment-Extraction.html、Skill-VOC-Aspect-Sentiment-Extraction、Skill-Privacy-Preserving-Ad-Measurement

---

> 分类：业务运营/品牌与增长/投放诊断　·　技术族：13-广告分析　·　源卡：`Skill-Privacy-Preserving-Ad-Measurement`