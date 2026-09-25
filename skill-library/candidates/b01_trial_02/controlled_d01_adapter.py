"""Controlled candidate adapter for B01 Trial 02.

This is a local, deterministic remediation candidate.  It preserves the D01
input/output contract but is intentionally separate from the source Skill's
read-only implementation.  It is not a production model or an appointed
business capability.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
import re


@dataclass
class AspectSentimentTuple:
    aspect: str
    opinion: str
    sentiment: str
    confidence: float
    raw_span: str


@dataclass
class ABSAResult:
    review_id: str
    text: str
    tuples: list[AspectSentimentTuple] = field(default_factory=list)
    overall_sentiment: str = "neutral"


# Keep high-ambiguity words such as "power", "fast", and "slow" out of
# aspect routing. They may still act as local sentiment only after a specific
# aspect has already been identified.
ASPECT_KEYWORDS = {
    "吸力": ("suction power", "pump strength", "suction level", "pumping power", "suction", "powerful"),
    "噪音": ("noise", "sound", "loud", "quiet", "silent", "noisy", "decibel"),
    "充电": ("battery life", "charging", "battery", "charge", "usb"),
    "尺寸重量": ("lightweight", "portable", "compact", "bulky", "heavy", "weight", "size", "large", "small"),
    "舒适度": ("comfortable", "comfort", "painful", "pain", "hurt", "flange", "sore", "fit"),
    "易用性": ("instructions", "assembly", "assemble", "setup", "complicated", "difficult", "simple", "easy"),
    "客服": ("customer service", "customer support", "support"),
    "物流": ("shipping", "delivery", "package", "arrived", "arrival"),
    "价格": ("affordable", "expensive", "reasonable", "price", "worth", "value", "cost"),
}

POSITIVE_WORDS = {
    "excellent", "great", "good", "amazing", "wonderful", "perfect", "love", "quiet",
    "silent", "strong", "easy", "simple", "comfortable", "efficient", "powerful", "fast",
    "quickly", "affordable", "reasonable", "worth", "recommend", "happy", "satisfied",
    "awesome", "compact", "portable", "small", "lightweight", "helpful", "responsive",
    "early", "safely", "soft", "clear", "long", "lasts",
}

NEGATIVE_WORDS = {
    "bad", "terrible", "awful", "poor", "weak", "loud", "noisy", "painful", "pain",
    "hurt", "hurts", "sore", "difficult", "complicated", "disappointing", "slow", "expensive",
    "broken", "uncomfortable", "useless", "waste", "regret", "return", "late", "delayed",
    "damaged", "ignored", "drains", "drain", "dead", "heavy", "bulky", "leaked", "spill", "high",
}

NEGATIONS = {"not", "no", "never", "without", "cannot", "cant", "wouldnt", "dont", "doesnt"}
TOKEN_RE = re.compile(r"[a-z]+")
CLAUSE_SPLIT_RE = re.compile(r"(?<=[.!?;])\s+|\b(?:but|however|although|yet)\b", re.IGNORECASE)


def _tokens(text: str) -> list[tuple[str, int, int]]:
    return [(match.group(), match.start(), match.end()) for match in TOKEN_RE.finditer(text.lower())]


def _sentiment_near_phrase(clause: str, phrase_start: int, phrase_end: int) -> tuple[str, str, float]:
    """Use only the clause and the nearest local opinion word for this aspect."""
    candidates: list[tuple[int, str, int, int]] = []
    for word, start, end in _tokens(clause):
        if word in POSITIVE_WORDS or word in NEGATIVE_WORDS:
            if start <= phrase_end and end >= phrase_start:
                distance = 0
            elif end < phrase_start:
                distance = phrase_start - end
            else:
                distance = start - phrase_end
            if distance <= 56:
                candidates.append((distance, word, start, end))
    if not candidates:
        return "neutral", "", 0.50

    _, opinion, start, _ = min(candidates, key=lambda item: (item[0], item[2]))
    polarity = 1 if opinion in POSITIVE_WORDS else -1
    local_tokens = _tokens(clause)
    token_index = next((index for index, (_, token_start, _) in enumerate(local_tokens) if token_start == start), 0)
    before = {word for word, _, _ in local_tokens[max(0, token_index - 2):token_index]}
    if before & NEGATIONS:
        polarity *= -1
    return ("positive" if polarity > 0 else "negative"), opinion, 0.82


class ControlledLocalABSA:
    """Local-window aspect extraction for the B01 Trial 02 candidate only."""

    def extract(self, text: str, review_id: str = "r0") -> ABSAResult:
        lower = text.lower()
        tuples: list[AspectSentimentTuple] = []
        for aspect, keywords in ASPECT_KEYWORDS.items():
            candidates: list[tuple[int, AspectSentimentTuple]] = []
            for clause_match in re.finditer(r"[^.!?;]+", lower):
                clause = clause_match.group()
                # Contrast words create independent local evidence windows.
                offset = clause_match.start()
                for segment_match in re.finditer(r"(?:(?!\b(?:but|however|although|yet)\b).)+", clause, re.IGNORECASE):
                    segment = segment_match.group().strip()
                    if not segment:
                        continue
                    segment_offset = offset + segment_match.start()
                    for keyword in keywords:
                        found = re.search(r"\b" + re.escape(keyword) + r"\b", segment)
                        if not found:
                            continue
                        if aspect == "易用性" and keyword in {"easy", "simple", "difficult", "complicated"}:
                            local_context = segment[max(0, found.start() - 24):found.end() + 24]
                            if any(term in local_context for term in ("charging", "battery", "cable")):
                                continue
                        sentiment, opinion, confidence = _sentiment_near_phrase(segment, found.start(), found.end())
                        raw_start = max(0, segment_offset + found.start() - 16)
                        raw_end = min(len(text), segment_offset + found.end() + 32)
                        candidates.append((0 if sentiment != "neutral" else 1, AspectSentimentTuple(
                            aspect=aspect,
                            opinion=opinion or keyword,
                            sentiment=sentiment,
                            confidence=confidence,
                            raw_span=text[raw_start:raw_end],
                        )))
                        break
            if candidates:
                tuples.append(sorted(candidates, key=lambda item: item[0])[0][1])

        positive = sum(item.sentiment == "positive" for item in tuples)
        negative = sum(item.sentiment == "negative" for item in tuples)
        overall = "positive" if positive > negative else "negative" if negative > positive else "neutral"
        return ABSAResult(review_id=review_id, text=text, tuples=tuples, overall_sentiment=overall)

    def batch_extract(self, reviews: list[dict]) -> list[ABSAResult]:
        return [self.extract(item["text"], item["id"]) for item in reviews]


def aggregate_aspect_report(results: list[ABSAResult]) -> dict:
    stats = defaultdict(lambda: {"pos": 0, "neg": 0, "neu": 0, "opinions": []})
    for result in results:
        for item in result.tuples:
            stats[item.aspect][item.sentiment[:3]] += 1
            stats[item.aspect]["opinions"].append(item.opinion)
    report = {}
    for aspect, item in stats.items():
        total = item["pos"] + item["neg"] + item["neu"]
        report[aspect] = {
            "total_mentions": total,
            "positive_rate": round(item["pos"] / total, 2),
            "negative_rate": round(item["neg"] / total, 2),
            "top_negative_opinions": sorted(set(item["opinions"]), key=item["opinions"].count, reverse=True)[:3],
        }
    return dict(sorted(report.items(), key=lambda pair: pair[0]))
