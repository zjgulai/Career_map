---
name: "p2s-voc-triggered-inventory-signal"
title: "VOC Triggered Inventory Signal — VOC触发库存信号（差评激增→供应链预警）"
description: "触发词：差评预警、差评激增、批次质量预警、VOC 监控、暂停出库。何时不用：要从退货记录反推批次与供应商多层根因用「退货根因归因图谱」，要自动派改善任务用「客诉聚类」类技能。安全边界：暂停出库与启动质检仅为建议，须人工确认后由仓库执行，模型不直接冻结库存。"
l1_id: "PLN-OPS"
l1_plane: "业务运营"
l2_id: "DOM-03"
l2_domain: "供应与履约"
l3_id: "DOM-03-055"
l3_business: "纠正预防措施"
l3_all: "纠正预防措施 / 质量分析"
l1_l2_l3: "业务运营/供应与履约/纠正预防措施"
p2s_card_id: "Skill-VOC-Triggered-Inventory-Signal"
p2s_src_domain: "07-NLP-VOC"
user_summary: "盯着差评率有没有突然跳高，一旦异常就点出可疑批次并提醒暂停出库、启动质检。"
user_try: "试试：帮我每天盯这款奶粉的差评率，一旦比过去 30 天明显异常就提醒我，并指出可能是哪个批次。"
whenToUse: "有每日差评数/差评率与批次信息、需要做批次质量早期预警时用；要从退货记录反推多层根因用「退货根因归因图谱」。"
workflow: "按天汇总差评率，取最近 30 天作基线均值与标准差 → 用基线加 2σ / Z 分判定异常并分级 → 结合差评关键词与批次信息定位可疑批次 → 输出预警与暂停出库建议"
enabled: "true"
disable-model-invocation: "true"
user-invocable: "true"
---

# VOC Triggered Inventory Signal — VOC触发库存信号（差评激增→供应链预警）

## ① 解决的问题

供应链团队面临"差评激增是批次质量问题但发现滞后导致大量问题产品流出"——VOC异常触发供应链预警将问题批次发现时间从2周缩短至3天，年化减少质量召回损失30-80万元

## ② 核心算法逻辑

差评激增往往是供应链质量问题的早期信号：某批次产品生产缺陷会在24周后反映为差评潮。本Skill实时监控差评率异常（比较前30天均值+2σ），一旦触发自动推送供应链预警，暂停同批次商品出库，同时触发质检流程。

## ③ 业务应用场景

场景1：婴儿辅食批次质量问题早期预警 - 业务问题：某批次奶粉口感问题在上线3周后差评率从2%突升至8%，已影响BSR排名 - 数据要求：每日差评数 + 差评关键词提取 + 批次信息 - 预期产出：差评率异常预警（触发时间/触发词/影响批次）+ 暂停出库建议 - 业务价值：提前发现批次质量问题，减少召回损失，年化价值30-80万元
**三轨验证**： - 成本：实时评论监控API约500元/月 - 合规：监控自有产品评论完全合规 - 风险：误报可能导致正常批次被暂停，需校准阈值

## ④ 输入数据要求

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑤ 输出结果

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## ⑥ 业务价值 / ROI

ROI：提前发现批次质量问题，减少召回损失，年化价值30-80万元
实施难度：⭐⭐⭐☆☆
优先级：⭐⭐⭐⭐☆
评估依据：提前发现批次质量问题，减少召回损失，年化价值30-80万元

## ⑦ 代码模板

代码块数量：1 · 路径：未检测到

 Python26 行 · 可运行复制
import numpy as np

def detect_review_anomaly(daily_ratings: list, threshold_sigma: float = 2.0) -> dict:
 if len(daily_ratings) < 7:
 return {"anomaly": False, "reason": "数据不足"}
 baseline = daily_ratings[:-3]
 recent = daily_ratings[-3:]
 mean_baseline = np.mean(baseline)
 std_baseline = np.std(baseline)
 recent_avg = np.mean(recent)
 z_score = (recent_avg - mean_baseline) / (std_baseline + 0.01)
 anomaly = z_score > threshold_sigma
 return {
 "anomaly": anomaly,
 "baseline_avg": round(mean_baseline, 3),
 "recent_avg": round(recent_avg, 3),
 "z_score": round(z_score, 2),
 "alert_level": "CRITICAL" if z_score > 3 else ("HIGH" if anomaly else "OK"),
 }

daily_bad_rate = [0.02, 0.025, 0.018, 0.022, 0.019, 0.021, 0.023,
 0.020, 0.025, 0.078, 0.082, 0.091] # 最后3天异常
result = detect_review_anomaly(daily_bad_rate)
print(f"差评异常: {result[&#x27;anomaly&#x27;]} | Z分={result[&#x27;z_score&#x27;]} | 级别={result[&#x27;alert_level&#x27;]}")
assert result["anomaly"] and result["alert_level"] in ["HIGH","CRITICAL"]
print("[✓] VOC Triggered Inventory Signal 测试通过")

## ⑧ 论文来源

（卡页此段为占位内容，实际输入/输出规格见下方「输入 / 输出契约」。）

## 输入 / 输出契约

**输入**：按天的差评数据：日期、差评数（或差评率）、总评论数，模板要求至少 7 天、基线取最近 30 天；差评关键词提取结果；SKU 与批次信息（批次号、生产日期、出库记录）。

**输出**：异常判定结果（anomaly、基线均值、近 3 天均值、Z 分、告警级别 OK/HIGH/CRITICAL），以及触发时间、触发词、疑似影响批次与暂停出库建议；供供应链质检与仓储执行参考。

## 执行步骤

1. 按天汇总差评数与差评率，取最近 30 天算基线均值与标准差
2. 用近 3 天均值与基线比较算 Z 分，超过 2σ 判异常、超过 3σ 标为 CRITICAL
3. 把异常与差评关键词、批次信息关联，指出疑似问题批次
4. 输出预警（触发时间、触发词、影响批次）并给出暂停该批次出库、启动质检的建议
5. 跟踪预警后差评率是否回落，回看阈值校准以减少误报

## 边界与不做

- 数据不满足时不用：少于 7 天差评数据时模板直接返回数据不足，无法判异常。
- 只输出预警与暂停出库建议，不直接冻结批次、不直接停止发货。
- 卡页写明误报会导致正常批次被暂停、需校准阈值；ROI（问题批次发现从 2 周缩短至 3 天、年化减少召回损失 30-80 万元）为估算口径。

## 技能关联

- **可组合**：Skill-VOC-Triggered-Inventory-Signal

---

> 分类：业务运营/供应与履约/纠正预防措施　·　技术族：07-NLP-VOC　·　源卡：`Skill-VOC-Triggered-Inventory-Signal`