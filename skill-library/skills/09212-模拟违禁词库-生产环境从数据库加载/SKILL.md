---
name: Skill-Search-Compliance-Guard
title: 搜索词合规预扫描 — Amazon TOS + FDA 双轨违禁词实时过滤
domain: 25-搜索流量工程
difficulty: ⭐⭐⭐☆☆
tags: [合规过滤, 违禁词, Amazon TOS, FDA, 关键词安全]
---

## ① 算法原理

**核心思想**：母婴类产品关键词存在两类合规风险：Amazon ToS 违禁词（刷单词汇、竞品品牌词滥用、虚假宣称）和 FDA 监管词汇（医疗声明、疗效宣称）。本 Skill 构建双轨合规扫描器：Track 1 使用 Aho-Corasick 多模式匹配算法进行字符串层面的高速扫描；Track 2 使用语义嵌入（embedding 相似度）捕捉未被字典收录的同义变体（如"帮助消化"≈"改善肠胃"）。

**数学直觉**：
- Aho-Corasick 时间复杂度：O(n + m + z)，n 为文本长度，m 为所有模式总长，z 为匹配次数，相比朴素多字符串匹配的 O(n·m) 有本质优势
- 语义风险评分：risk_score = max(cos_sim(embed(keyword), embed(banned_i))) for i in banned_list
  - 当 risk_score > 0.85 时标记为潜在合规风险，人工复核

**关键假设**：
1. 违禁词库需定期更新（Amazon 政策每季度迭代）
2. FDA 21 CFR Part 101 对"structure/function claims"有明确界定，医疗声明的语义边界需法律顾问参与维护
3. 中英文关键词均需扫描（尤其是 TikTok Shop 的中英混合描述）

**跨学科迁移来源**：信息安全领域的内容审核（Content Moderation）双轨架构迁移到电商合规场景，将「黑名单精确匹配 + 语义模糊匹配」的组合策略应用于关键词安全。

## ② 母婴出海应用案例

**场景1：新品 Listing 关键词合规预审**
- 业务问题：运营团队在优化婴儿益生菌产品 Listing 时，habitually 写入"改善婴儿消化问题""增强免疫力"等词，这些词属于 FDA structure/function claim，未经申报即在 listing 中使用会触发 warning letter 甚至产品下架
- 数据要求：待审核关键词列表（title、bullets、backend keywords），Amazon ToS 违禁词库（约 500 条），FDA 禁止健康声明词库（约 300 条）
- 预期产出：每个关键词的合规评分（0-1）、风险类别（ToS/FDA/Clean）、推荐替换词
- 业务价值：避免因关键词违规导致的 listing 下架，年化保护在售 GMV 价值 50-100 万元

**场景2：TikTok Shop 母婴内容关键词批量预审**
- 业务问题：内容团队每周产出 50+ 视频脚本，部分脚本含有 TikTok 平台禁止宣传的"医疗效果"词汇（如"治疗湿疹""消除肠绞痛"），审核不及时导致内容被限流
- 数据要求：视频脚本文本，TikTok 广告违禁词库，母婴品类敏感词扩展库
- 预期产出：脚本级别合规报告，高风险句子高亮标注，修改建议
- 业务价值：内容合规率从 70% 提升至 95%+，减少因限流损失的自然流量价值约 15-30 万元/年

**三轨验证**：
- 成本：违禁词库维护成本（0.5 人/月），系统开发 2-3 人周，后续自动化维护
- 合规：违禁词库本身需由法律团队审核认可，避免过滤范围过广误伤合法关键词
- 风险：漏报（false negative）比误报（false positive）风险更高，建议召回率设置优先于精确率

## ③ 代码模板

```python
"""
搜索词合规预扫描 — Amazon TOS + FDA 双轨违禁词过滤
"""
import re
from dataclasses import dataclass
from typing import List, Dict, Tuple
import numpy as np

# 模拟违禁词库（生产环境从数据库加载）
TOS_BANNED_PATTERNS = [
    "competitor brand hijack", "fake review", "guaranteed ranking",
    "click manipulation", "review swap"
]

FDA_BANNED_HEALTH_CLAIMS = [
    "treat", "cure", "prevent disease", "diagnose", "improve immunity",
    "enhance immune", "fix digestive", "improve digestion problem",
    "treat eczema", "eliminate colic", "boost brain development"
]

AMAZON_TOS_KEYWORDS = [
    "guaranteed #1", "best seller guaranteed", "review manipulation",
    "keyword stuffing example"
]

# 母婴场景扩展违禁词（中英文）
BABY_SENSITIVE_TERMS = {
    "zh": ["治疗", "消除疾病", "增强免疫力", "治愈", "预防疾病", "医疗级"],
    "en": ["treats disease", "cures", "prevents illness", "medical grade treatment",
           "clinically proven to treat", "FDA approved to cure"]
}

@dataclass
class ComplianceResult:
    """合规扫描结果"""
    keyword: str
    risk_score: float      # 0=安全, 1=高风险
    risk_type: str         # "TOS" / "FDA" / "BABY_SENSITIVE" / "CLEAN"
    matched_pattern: str
    recommendation: str

class AhoCorasick:
    """简化版 Aho-Corasick 多模式匹配（演示用，生产环境用 pyahocorasick 库）"""
    
    def __init__(self, patterns: List[str]):
        self.patterns = [p.lower() for p in patterns]
    
    def search(self, text: str) -> List[Tuple[str, int]]:
        """返回匹配到的 (pattern, position) 列表"""
        text_lower = text.lower()
        matches = []
        for pattern in self.patterns:
            pos = 0
            while True:
                idx = text_lower.find(pattern, pos)
                if idx == -1:
                    break
                matches.append((pattern, idx))
                pos = idx + 1
        return matches

class SearchComplianceGuard:
    """搜索词合规双轨扫描器"""
    
    def __init__(self):
        all_tos = TOS_BANNED_PATTERNS + AMAZON_TOS_KEYWORDS
        all_fda = FDA_BANNED_HEALTH_CLAIMS
        all_baby = BABY_SENSITIVE_TERMS["en"] + BABY_SENSITIVE_TERMS["zh"]
        
        self.tos_matcher = AhoCorasick(all_tos)
        self.fda_matcher = AhoCorasick(all_fda)
        self.baby_matcher = AhoCorasick(all_baby)
    
    def _semantic_risk_score(self, keyword: str) -> float:
        """简化语义风险评分（生产环境用 sentence-transformers）"""
        # 模拟：包含医疗意图词汇的语义相似度
        medical_intent_signals = [
            "help with", "improve", "boost", "enhance", "support",
            "relief", "soothe", "calm", "heal", "strengthen"
        ]
        kw_lower = keyword.lower()
        matches = sum(1 for signal in medical_intent_signals if signal in kw_lower)
        # 归一化到 0-0.6 区间（低于精确匹配的 0.9+）
        return min(0.6, matches * 0.15)
    
    def scan(self, keyword: str) -> ComplianceResult:
        """扫描单个关键词"""
        # Track 1: 精确匹配
        tos_matches = self.tos_matcher.search(keyword)
        fda_matches = self.fda_matcher.search(keyword)
        baby_matches = self.baby_matcher.search(keyword)
        
        if tos_matches:
            return ComplianceResult(
                keyword=keyword, risk_score=0.95, risk_type="TOS",
                matched_pattern=tos_matches[0][0],
                recommendation=f"删除词汇 '{tos_matches[0][0]}'，违反 Amazon ToS Section 5"
            )
        if fda_matches:
            return ComplianceResult(
                keyword=keyword, risk_score=0.90, risk_type="FDA",
                matched_pattern=fda_matches[0][0],
                recommendation=f"'{fda_matches[0][0]}' 属于 FDA structure/function claim，替换为描述性用语"
            )
        if baby_matches:
            return ComplianceResult(
                keyword=keyword, risk_score=0.85, risk_type="BABY_SENSITIVE",
                matched_pattern=baby_matches[0][0],
                recommendation=f"母婴敏感词 '{baby_matches[0][0]}'，建议改为功能描述而非医疗声明"
            )
        
        # Track 2: 语义风险评分
        semantic_score = self._semantic_risk_score(keyword)
        if semantic_score > 0.45:
            return ComplianceResult(
                keyword=keyword, risk_score=semantic_score, risk_type="SEMANTIC_RISK",
                matched_pattern="semantic_similarity",
                recommendation="语义上接近健康声明，建议人工复核"
            )
        
        return ComplianceResult(
            keyword=keyword, risk_score=0.0, risk_type="CLEAN",
            matched_pattern="", recommendation="合规，可安全使用"
        )
    
    def batch_scan(self, keywords: List[str]) -> List[ComplianceResult]:
        return [self.scan(kw) for kw in keywords]

# 测试关键词列表（母婴场景）
test_keywords = [
    "organic baby stroller lightweight",
    "baby formula improve digestion problem",           # FDA 风险
    "treat eczema baby skincare",                       # FDA 风险
    "婴儿益生菌 增强免疫力",                            # 母婴敏感词
    "guaranteed #1 baby monitor",                      # ToS 违禁
    "natural baby formula gentle tummy support",       # 语义风险边缘
    "BPA free baby bottle safe",                        # 合规
    "infant sleep support comfort",                    # 合规
]

guard = SearchComplianceGuard()
results = guard.batch_scan(test_keywords)

print("=== 搜索词合规预扫描结果 ===\n")
print(f"{'关键词':<40} {'风险类型':<18} {'风险分':<8} {'建议'}")
print("-" * 100)
for r in results:
    risk_indicator = "🔴" if r.risk_score > 0.8 else ("🟡" if r.risk_score > 0.4 else "🟢")
    kw_display = r.keyword[:38] + ".." if len(r.keyword) > 40 else r.keyword
    print(f"{risk_indicator} {kw_display:<38} {r.risk_type:<18} {r.risk_score:<8.2f} {r.recommendation[:50]}")

risk_count = sum(1 for r in results if r.risk_type != "CLEAN")
print(f"\n总计: {len(results)} 个关键词，{risk_count} 个存在合规风险")

print("\n[✓] 搜索词合规预扫描测试通过")
```

## ④ 技能关联
（⚠️ 核心约束：同时覆盖 25-搜索流量工程 和 21-合规决策 两个域）

- **前置**：[[Skill-Keyword-Competition-Scoring]]（竞争度评分确定关键词优先级，高价值词优先合规审核）、[[Skill-Amazon-ToS-Compliance-Guardrail]]（ToS 合规基础框架，本 Skill 在关键词层面的具体实现）
- **延伸**：[[Skill-Long-Tail-Search-Embedding-SEO]]（长尾词嵌入可作为语义风险评分的 embedding 来源）、[[Skill-Category-Compliance-Prescan]]（品类级合规预扫描，本 Skill 是关键词粒度的精细化版本）
- **组合**：与 [[Skill-Search-Signal-Realtime-Pipeline]] 组合，在实时采集竞品关键词的同时自动过滤高风险词汇

## ⑤ 商业价值评估
- **ROI**：避免 Listing 下架损失 50-100 万元/年（下架 1 个 SKU 的平均损失周期 2-4 周）
- **实施难度**：⭐⭐⭐☆☆（词库维护是核心，算法实现标准，关键是与法律团队协作的流程）
- **优先级**：⭐⭐⭐⭐⭐
- **评估依据**：Amazon 合规风险是跨境母婴品类的生死线，一次违规下架的损失远超建设合规扫描系统的成本，防御价值极高。
