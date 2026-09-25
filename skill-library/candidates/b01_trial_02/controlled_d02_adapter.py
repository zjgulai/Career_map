"""Controlled candidate adapter for B01 Trial 02 search-signal classification.

This local candidate only corrects the identified precedence defect. It is not
the source Skill implementation, a production classifier, or a business rule.
"""

from __future__ import annotations

from collections import Counter
import math
import re


PROBLEM_PATTERNS = (
    r"\bleak(?:ing)?\b", r"\bspill\b", r"\bweak\b", r"\bpain(?:ful)?\b",
    r"\bhurt\b", r"\buncomfortable\b", r"\bloud\b", r"\bnoisy\b", r"\bdrain(?:s|ed)?\b",
)
COMPARISON_PATTERNS = (r"\bbest\b", r"\bvs\b", r"\bcompare\b", r"\bbetter\b", r"\balternative\b", r"\btop\b")
FUNCTIONAL_PATTERNS = (r"\bhow to\b", r"\bclean(?:ing)?\b", r"\binstall\b", r"\bsterilize\b", r"\breplace(?:ment)?\b", r"\binstructions?\b")
ATTRIBUTE_PATTERNS = (
    r"\bquiet\b", r"\bsilent\b", r"\bwearable\b", r"\bhands[ -]free\b", r"\bwireless\b",
    r"\bsize\b", r"\bflange\b", r"\bbattery life\b", r"\bcharge\b", r"\busb\b",
    r"\bdouble\b", r"\bsingle\b", r"\bportable\b", r"\bsuction\b",
)
NAVIGATIONAL_PATTERNS = (r"\breturn policy\b", r"\bshipping status\b", r"\bcustomer service\b")


def _has_any(query: str, patterns: tuple[str, ...]) -> bool:
    return any(re.search(pattern, query, re.IGNORECASE) for pattern in patterns)


def classify_intent(query: str) -> str:
    """Classify by clear intent phrases, not incidental work/office words."""
    if _has_any(query, COMPARISON_PATTERNS):
        return "comparison"
    if _has_any(query, PROBLEM_PATTERNS):
        return "problem_solving"
    if _has_any(query, FUNCTIONAL_PATTERNS):
        return "functional"
    if _has_any(query, NAVIGATIONAL_PATTERNS):
        return "navigational"
    if _has_any(query, ATTRIBUTE_PATTERNS):
        return "attribute"
    return "navigational"


def simple_sentiment_score(query: str) -> str:
    if _has_any(query, PROBLEM_PATTERNS):
        return "negative_pain"
    if _has_any(query, COMPARISON_PATTERNS):
        return "positive_expectation"
    return "neutral"


def product_dev_opportunities(queries: list[tuple[str, int, float]], min_vol: int = 4000) -> list[dict]:
    opportunities = []
    for query, volume, click_proxy in queries:
        if classify_intent(query) == "problem_solving" and simple_sentiment_score(query) == "negative_pain" and volume >= min_vol:
            opportunities.append({
                "query": query,
                "monthly_search_vol": volume,
                "opportunity_score": round(volume * (1 - click_proxy), 2),
                "insight": f"受控问题表达：{query[:48]}",
            })
    return sorted(opportunities, key=lambda item: item["opportunity_score"], reverse=True)


def extract_pain_keywords(queries: list[tuple[str, int, float]], top_n: int = 10) -> list[dict]:
    selected = [query for query, _, _ in queries if classify_intent(query) == "problem_solving"]
    if not selected:
        return []
    words = []
    for query in selected:
        words.extend(re.findall(r"\b[a-z]{3,}\b", query.lower()))
    frequency = Counter(words)
    docs = Counter()
    for query in selected:
        docs.update(set(re.findall(r"\b[a-z]{3,}\b", query.lower())))
    total_docs = len(selected)
    scores = [
        {"word": word, "freq": count, "score": round(count * math.log((total_docs + 1) / (docs[word] + 1)), 3)}
        for word, count in frequency.items()
    ]
    return sorted(scores, key=lambda item: (-item["score"], item["word"]))[:top_n]
