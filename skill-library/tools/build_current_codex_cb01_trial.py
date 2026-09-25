#!/usr/bin/env python3
"""Prepare, but do not run, a controlled CB01 trial for one current Codex skill.

CB01 places Product And Business Analysis beside, not in place of, the existing
B01-C01 commercial-argument candidate. All evidence is synthetic by design.
"""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path


ROOT = Path("/Users/lute/project/Career/skill-library")
SCREENING = ROOT / "current_codex_bid_screening.json"
TRIAL_ROOT = ROOT / "current_codex_trials" / "cb01_product_business_analysis"
FIXTURE = TRIAL_ROOT / "cb01_synthetic_decision_fixture.json"
SUBMISSION = TRIAL_ROOT / "candidate_submission_template.md"
REVIEW = TRIAL_ROOT / "independent_reviewer_record.md"
TRIAL_DATA = ROOT / "current_codex_cb01_trial.json"
REPORT = ROOT / "CURRENT_CODEX_CB01_TRIAL_PREPARATION.md"
SITE_DATA = ROOT / "site" / "current-codex-cb01-data.js"


def iso_now() -> str:
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=8))).replace(microsecond=0).isoformat()


def source_candidate() -> dict:
    entries = json.loads(SCREENING.read_text(encoding="utf-8"))
    matches = [entry for entry in entries if entry["Skill"] == "Product And Business Analysis"]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one Product And Business Analysis entry, found {len(matches)}")
    candidate = matches[0]
    if candidate["初筛去向"] != "进入业务验证设计":
        raise RuntimeError("Candidate must remain in the business-validation design route")
    if candidate["原有竞聘准备度"] != "暂停竞聘":
        raise RuntimeError("CB01 must not bypass the existing readiness gate")
    return candidate


def fixture() -> dict:
    return {
        "fixture_id": "CB01-SYN-001",
        "classification": "完全合成；不含真实消费者、市场、SKU、渠道或财务数据",
        "decision_question": "在一个虚构的家用喂养辅助设备品类中，团队应优先验证哪个改善方向，还是暂不投入？",
        "audience": "负责商业论证的经营事项主责与独立复核人",
        "scope": "仅评价候选能否把证据、前提、选项、未知和验证建议组织成可比较的经营材料。",
        "decision_options": [
            {
                "option": "A",
                "name": "夜间静音配件包",
                "customer_value_hypothesis": "降低夜间使用时的噪声干扰和准备成本。",
                "economics": {"proposed_price_usd": 18, "estimated_unit_cost_usd": 7, "estimated_fulfillment_usd": 3, "gross_margin_before_marketing": "44%"},
                "delivery_condition": "现有供应商声称 10 周可完成首批样件；噪声改善没有外部验证。",
                "known_risk": "用户是否愿意为配件单独付费未知；现有产品兼容范围待定义。",
            },
            {
                "option": "B",
                "name": "易清洁部件套装",
                "customer_value_hypothesis": "减少清洗与晾干的时间成本，并降低部件残留担忧。",
                "economics": {"proposed_price_usd": 22, "estimated_unit_cost_usd": 8, "estimated_fulfillment_usd": 3, "gross_margin_before_marketing": "50%"},
                "delivery_condition": "现有供应商声称 14 周可完成首批样件；材料耐久性和合规适用范围待验证。",
                "known_risk": "清洁痛点是否足以形成购买转换未知；材料变更可能影响交付条件。",
            },
            {
                "option": "N",
                "name": "维持现有计划，不新增配件",
                "customer_value_hypothesis": "不增加新的用户价值假设，保留当前资源与交付安排。",
                "economics": {"proposed_price_usd": 0, "estimated_unit_cost_usd": 0, "estimated_fulfillment_usd": 0, "gross_margin_before_marketing": "不适用"},
                "delivery_condition": "不新增开发与验证工作。",
                "known_risk": "可能错过需要进一步验证的用户问题，但不应把机会成本量化为事实。",
            },
        ],
        "evidence": [
            {"id": "E01", "type": "合成购买后反馈", "coverage": "300 条虚构、已去重的短反馈", "finding": "108 条提及清洗步骤繁琐；81 条提及夜间使用噪声或干扰；同一条可命中多个主题。", "limit": "不代表真实人群、真实比例、真实语言或真实购买行为。"},
            {"id": "E02", "type": "合成购买前搜索表达", "coverage": "180 条虚构搜索表达", "finding": "64 条包含易清洁相关词；51 条包含静音或夜间相关词；意图与实际成交均未知。", "limit": "不代表真实搜索量、排名、需求规模或转化意愿。"},
            {"id": "E03", "type": "合成竞品观察", "coverage": "12 个虚构产品页面摘要", "finding": "7 个页面强调易清洁，4 个页面强调静音；没有价格、销量、真实性或同口径比较保证。", "limit": "不能推导市场份额、差异化强弱或竞争优势。"},
            {"id": "E04", "type": "合成单位经济假设", "coverage": "A/B 的价格、成本和履约假设", "finding": "B 的假设毛利高于 A；两者均未包含退货、渠道、投放、研发、认证或现金占用。", "limit": "不是财务预测、承诺、预算或利润结论。"},
            {"id": "E05", "type": "合成交付条件", "coverage": "供应商的假定样件周期和待验证条件", "finding": "A 假定 10 周，B 假定 14 周；均含尚未证明的前提。", "limit": "不等同于供应商承诺、采购计划或量产准备。"},
        ],
        "required_lenses": ["客户价值与证据覆盖", "经济条件与遗漏成本", "兑现条件与风险", "不行动基线", "不确定性与下一步验证"],
        "prohibited_claims": ["把合成信号说成真实消费者或市场事实", "把相关主题数写成需求规模、转化率或因果结论", "把毛利假设写成盈利承诺", "把候选推荐写成采购、发布、投放、资源或产品定义授权"],
    }


def trial(candidate: dict, data: dict) -> dict:
    return {
        "id": "CB01-C01D",
        "name": "产品与经营选项分析：受控试跑准备",
        "state": "准备完成，待指定独立复核人，尚未启动",
        "status_explanation": "任务、合成输入、提交模板和评分表已准备；没有候选提交、没有评分、没有通过或失败结论。",
        "candidate": {"skill": candidate["Skill"], "cn": candidate["中文名称"], "source": candidate["原文入口"], "version": candidate["Codex 版本"], "existing_readiness": candidate["原有竞聘准备度"]},
        "position": {"code": "B01-C01D", "name": "商业论证：数据支持的经营选项分析", "relationship_to_existing_b01": "与 B01 现有 C01 的情景比较候选平行竞争，不替代、不合并，也不继承其条件入围状态。"},
        "selection_reason": [
            "它的原文要求从明确决策出发，以数据、背景、比较和不确定性形成推荐，直接贴合 C-021 的最小交付。",
            "现有 B01 的 D01/D02 仍在独立盲测硬门槛前；CB01 不复用其输出、标签或分数，只复用“受控、可追溯、独立复核”的方法纪律。",
            "本任务可用完全合成输入检验交付结构，不读取真实消费者、市场、财务或供应链数据。",
        ],
        "fixture": data,
        "submission_contract": [
            "候选只能使用任务包中的 E01-E05，不得补造外部来源或把虚构数据写成真实事实。",
            "提交一份不超过 1,200 字的经营选项备忘录，并附一张 A/B/N 对照表。",
            "逐条标出事实、假设、推断和未知；每个关键判断回指 E01-E05。",
            "给出暂定推荐或“证据不足不推荐”，并说明最小验证行动，但不得授权任何真实业务动作。",
        ],
        "rubric": [
            {"dimension": "决策边界", "max_score": 12, "look_for": "问题、读者、范围、A/B/N 比较和不在范围内的事项明确。"},
            {"dimension": "证据可追溯", "max_score": 18, "look_for": "关键主张能回到 E01-E05，且不误读合成证据。"},
            {"dimension": "选项可比较", "max_score": 20, "look_for": "客户价值、经济条件、兑现条件、风险和不行动基线同框比较。"},
            {"dimension": "前提与不确定性", "max_score": 16, "look_for": "假设、遗漏成本、覆盖缺口与可能改变结论的条件明确。"},
            {"dimension": "建议与验证", "max_score": 16, "look_for": "建议与证据强度相称，给出最小、可验证的下一步而非伪确定结论。"},
            {"dimension": "交接与业务边界", "max_score": 18, "look_for": "输出可交给商业论证责任方；不越权到产品定义、采购、发布、投放或资源决定。"},
        ],
        "hard_gates": [
            "独立复核人未指定，不得启动候选提交或评分。",
            "候选提交人与复核人不得参与本任务包的设计、数据构造或评分规则改写。",
            "任何将合成数据表述成真实事实、遗漏 A/B/N 任一选项、或产生真实业务授权的提交，直接判为不合格。",
            "完成独立复核后，只能得到“交付结构是否达到受控门槛”的结论，不能得到真实新品、市场或投资结论。",
        ],
        "role_separation": [
            {"role": "候选执行人", "must_do": "按固定任务包提交备忘录与对照表。", "must_not": "不得改输入、评分规则或自评。"},
            {"role": "独立复核人", "must_do": "在未参与任务包设计与候选执行的前提下，逐项记录评分和硬门槛裁决。", "must_not": "不得替候选补写结论、补造数据或在评分后修改任务包。"},
            {"role": "商业论证接收方", "must_do": "仅判断交付能否作为后续材料，记录缺口和下一步。", "must_not": "不得把受控试跑结果转成投入、资源或执行授权。"},
        ],
        "non_conclusions": [
            "不证明真实消费者需求、市场规模、价格弹性、竞争差异化、供应可行性或财务收益。",
            "不产生产品定义、采购、合规、渠道、投放、资源、岗位、Preset、Agent 或生产上线决定。",
            "不改变 Product And Business Analysis 在总表中的“暂停竞聘”准备度。",
        ],
        "next_gate": "由用户指定一名未参与包设计或候选提交的独立复核人；其确认角色分离后，才可向候选执行人发放固定任务包。",
    }


def write_templates(pack: dict) -> None:
    SUBMISSION.write_text("""# CB01-C01D 候选提交模板

状态：未提交。候选只能使用 `cb01_synthetic_decision_fixture.json` 中的 E01-E05。

## 1. 决策问题与范围

## 2. A / B / N 对照表

| 选项 | 客户价值证据 | 经济条件 | 兑现条件与风险 | 未知与可能改变结论的条件 |
| --- | --- | --- | --- | --- |
| A |  |  |  |  |
| B |  |  |  |  |
| N |  |  |  |  |

## 3. 暂定建议或证据不足说明

## 4. 最小验证建议与交接

## 5. 事实 / 假设 / 推断 / 未知清单

不得把合成输入写成真实事实；不得给出任何真实业务授权。
""", encoding="utf-8")
    REVIEW.write_text("""# CB01-C01D 独立复核记录

状态：待独立复核人指定，未评分。

## 角色分离确认

- 复核人姓名/角色：待指定
- 未参与任务包设计：待确认
- 未参与候选提交：待确认
- 评分日期：待填写

## 硬门槛

- [ ] 提交只引用 E01-E05，且明确其为合成输入。
- [ ] A、B、N 三个选项均被比较。
- [ ] 没有把假设或关联写成事实、因果、承诺或授权。
- [ ] 没有产生产品、采购、发布、投放、资源或岗位决定。

## 评分

| 维度 | 满分 | 得分 | 复核证据与缺口 |
| --- | ---: | ---: | --- |
| 决策边界 | 12 |  |  |
| 证据可追溯 | 18 |  |  |
| 选项可比较 | 20 |  |  |
| 前提与不确定性 | 16 |  |  |
| 建议与验证 | 16 |  |  |
| 交接与业务边界 | 18 |  |  |
| 合计 | 100 |  |  |

## 裁决

只能填写“交付结构达到受控门槛 / 未达到受控门槛 / UNVERIFIABLE”。不得据此得出真实经营结论。
""", encoding="utf-8")


def write_report(pack: dict) -> None:
    lines = [
        "# CB01-C01D：Product And Business Analysis 受控试跑准备", "",
        f"- 当前状态：{pack['state']}",
        "- 本次只完成任务准备，不含候选提交、独立复核、评分、通过或失败结论。",
        "- 与 B01 的关系：B01-C01 的平行候选，不替代原有 `p2s-sc-whatif-scenario-analysis-engine`。", "",
        "## 为什么先选它", "",
        *[f"- {reason}" for reason in pack["selection_reason"]], "",
        "## 固定业务题", "", f"{pack['fixture']['decision_question']}", "",
        "## 需要交付", "", *[f"- {line}" for line in pack["submission_contract"]], "",
        "## 独立复核门槛", "", *[f"- {line}" for line in pack["hard_gates"]], "",
        "## 不作出的结论", "", *[f"- {line}" for line in pack["non_conclusions"]], "",
        "## 下一步", "", f"{pack['next_gate']}", "",
    ]
    REPORT.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    candidate = source_candidate()
    data = fixture()
    pack = trial(candidate, data)
    TRIAL_ROOT.mkdir(parents=True, exist_ok=True)
    FIXTURE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    TRIAL_DATA.write_text(json.dumps(pack, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SITE_DATA.write_text("window.CURRENT_CODEX_CB01_DATA = " + json.dumps(pack, ensure_ascii=False) + ";\n", encoding="utf-8")
    write_templates(pack)
    write_report(pack)
    print(json.dumps({"id": pack["id"], "state": pack["state"], "fixture": str(FIXTURE)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
