---
name: "p2s-recommendation-compliance-filter"
title: "Recommendation Compliance Filter — 推荐系统实时合规内容过滤"
description: "触发词：推荐过滤、合规黑名单、候选集清洗、误报率、大促风控、账号保护。何时不用：要审文案与图片宣称是否违规时用「AIGC 内容合规审查」，要从评论挖合规信号时用「VOC 合规信号挖掘」。安全边界：只做候选集剔除与留痕，不下架商品、不改动平台侧数据。"
l1_id: "PLN-CTL"
l1_plane: "独立控制"
l2_id: "DOM-07"
l2_domain: "财务与合规"
l3_id: "DOM-07-131"
l3_business: "产品准入核对"
l3_all: "产品准入核对 / 规则监测 / 账号诊断"
l1_l2_l3: "独立控制/财务与合规/产品准入核对"
p2s_card_id: "Skill-Recommendation-Compliance-Filter"
p2s_src_domain: "05-推荐系统"
quality_tier: "preview"
user_summary: "大促流量一上来，先把混进推荐候选集的违规品拦掉，别让自家账号跟着受牵连。"
user_try: "试试：给推荐系统加一层合规过滤，把候选 ASIN 里命中黑名单的剔掉并给出过滤原因。"
whenToUse: "推荐或搜索候选集需要实时剔除违规商品、防止关联账号受限时用；要审文案宣称时用「AIGC 内容合规审查」；要从评论挖合规信号时用「VOC 合规信号挖掘」。"
workflow: "加载最新合规黑名单与候选 ASIN 列表 → 对候选商品标题与类目做风险打分 → 按阈值剔除高风险商品并记录过滤原因 → 监控误报率并回捞被误杀商品 → 输出过滤后的合规候选集与日志"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# Recommendation Compliance Filter — 推荐系统实时合规内容过滤

## ① 解决的问题

运营面临"推荐系统偶发推送违规品导致关联账号受限风险"——实时合规过滤层将违规品推荐概率降至<0.1%，年化防止账号受限保护价值50-200万元

## ② 核心算法逻辑

核心思想：在推荐系统召回层之后、排序层之前插入合规过滤层，将违禁品、政策禁止词商品、下架风险商品从推荐候选集中实时剔除，防止平台因推荐违规内容导致的账号风险。

## ③ 业务应用场景

场景1：大促期间推荐系统防止违禁品突破（618/Prime Day 高风险期） - 业务问题：大促期间流量激增，有竞品 ASIN 通过刷评混入推荐候选集，若推荐了被平台标记的违规品，关联账号可能被限制 - 数据要求：候选 ASIN 列表 + 最新合规黑名单 + 产品标题/类目信息 - 预期产出：过滤后的合规候选集 + 被过滤 ASIN 日志 + 过滤原因 - 业务价值：防止因推荐违规品导致的账号受限，年化保护账号价值 50-200 万元
**三轨验证**： - 成本：黑名单维护人力 0.5 人/周，过滤层增加推荐延迟约 8-15ms（可接受） - 合规：过滤系统本身无合规风险，且正向降低账号违规概率 - 风险：过滤过于激进可能误杀正常商品，需设置误报率监控阈值（< 2%）

## ④ 输入数据要求

（卡页此段是占位串，实际输入规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段是占位串，实际输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：单次账号受限损失 10-50 万元（广告暂停 + 排名下滑），年化防范价值 50-200 万元
实施难度：⭐⭐☆☆☆
优先级：⭐⭐⭐⭐⭐
评估依据：账号安全是母婴出海最高优先级，合规过滤层是推荐系统的必要保险；实施成本极低，防范风险极高。

## ⑦ 代码节选

> **本节的完整实现在同目录的 `references/implementation.py`（61 行）。**下面 60 行是它的**开头**，源站发布时就截在这里。
> 已校验：卡面节选正是该文件的头部（逐行连续前缀，偏移恒为第 1 行）。
> 源站对代码预览设了 60 行上限：本卡节选 **60 行，已顶到上限** —— 其余部分见 `references/implementation.py`。
> 节选语法完整（`ast.parse` 通过，60 行），但仍是节选，未必可独立运行。
> 卡页声明「代码块数量：2」，但**未记录代码位置**（源站写「未检测到」）。

```python
from dataclasses import dataclass, field
from typing import List, Set
import time

@dataclass
class ComplianceFilter:
    blacklist: Set[str] = field(default_factory=set)
    risk_threshold: float = 0.8

    def load_blacklist(self, asin_list: List[str]):
        self.blacklist.update(asin_list)

    def _risk_score(self, asin: str, title: str) -> float:
        """简化版风险评分（生产中用 ML 模型替换）"""
        risky_terms = ["cure", "treat disease", "fda approved", "guaranteed results",
                       "no side effects", "clinically proven weight loss"]
        title_lower = title.lower()
        score = sum(0.3 for term in risky_terms if term in title_lower)
        return min(score, 1.0)

    def filter_candidates(self, candidates: List[dict]) -> dict:
        """
        candidates: [{"asin": str, "title": str, "score": float}, ...]
        """
        start = time.time()
        passed, blocked = [], []
        for item in candidates:
            asin = item["asin"]
            if asin in self.blacklist:
                blocked.append({**item, "reason": "blacklist"})
                continue
            risk = self._risk_score(asin, item.get("title", ""))
            if risk >= self.risk_threshold:
                blocked.append({**item, "reason": f"risk_score={risk:.2f}"})
            else:
                passed.append(item)
        latency_ms = (time.time() - start) * 1000
        return {
            "passed": passed,
            "blocked": blocked,
            "pass_rate": len(passed) / len(candidates) if candidates else 0,
            "latency_ms": round(latency_ms, 2),
        }

if __name__ == "__main__":
    cf = ComplianceFilter(risk_threshold=0.6)
    cf.load_blacklist(["B00BANNED1", "B00BANNED2"])
    candidates = [
        {"asin": "B001OK", "title": "organic baby formula DHA ARA", "score": 0.9},
        {"asin": "B00BANNED1", "title": "baby supplement", "score": 0.85},
        {"asin": "B003RISKY", "title": "infant drops clinically proven treat colic", "score": 0.7},
        {"asin": "B004OK", "title": "baby wipes sensitive skin", "score": 0.8},
        {"asin": "B005OK", "title": "cotton swaddle blanket newborn", "score": 0.75},
    ]
    result = cf.filter_candidates(candidates)
    print(f"候选集: {len(candidates)} → 通过: {len(result['passed'])} 过滤: {len(result['blocked'])}")
    print(f"通过率: {result['pass_rate']:.1%} | 延迟: {result['latency_ms']}ms")
    print(f"被过滤: {[(b['asin'], b['reason']) for b in result['blocked']]}")
    assert result["pass_rate"] < 1.0, "应有商品被过滤"
    assert result["latency_ms"] < 100, "延迟应 < 100ms"
```

## ⑧ 论文来源

（卡页此段未自动抽取，本卡未记录论文出处。）

## 输入 / 输出契约

**输入**：候选 ASIN 列表、最新合规黑名单、产品标题与类目信息；风险阈值默认 0.8；粒度：单次推荐请求对应的候选商品集合。

**输出**：过滤后的合规候选集、被过滤 ASIN 日志与过滤原因、通过率与延迟指标（过滤层增加约 8-15ms）；供推荐系统实时调用并留痕，目标为违规品推荐概率低于 0.1%。

## 执行步骤

1. 加载黑名单与候选 ASIN 列表
2. 对候选商品标题与类目做风险打分
3. 按阈值剔除高风险商品并记原因
4. 监控误报率并回捞被误杀商品
5. 输出合规候选集与过滤日志

## 边界与不做

- 数据不满足时不用：黑名单未及时更新时过滤形同虚设；候选集缺标题与类目信息时无法打分。
- 能力边界：只做候选集剔除与留痕，不下架商品、不修改平台侧数据；过滤过激会误杀正常商品，须把误报率控制在 2% 以内。
- 口径边界：过滤会牺牲部分推荐多样性，属预期代价，调阈值前需与推荐效果指标联合评估。

## 技能关联

- **可组合**：Skill-Recommendation-Compliance-Filter

---

> 分类：独立控制/财务与合规/产品准入核对　·　技术族：05-推荐系统　·　源卡：`Skill-Recommendation-Compliance-Filter`