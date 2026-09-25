import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT || process.cwd();
const outputDir = process.env.B01_TRIAL_02_OUTPUT_DIR || path.join(root, "skill-library", "outputs", "2026-09-23-b01-trial-02");
const renderDir = process.env.B01_TRIAL_02_RENDER_DIR || path.join(outputDir, "renders");
const result = JSON.parse(await fs.readFile(path.join(outputDir, "b01_trial_02_results.json"), "utf8"));
const fixture = JSON.parse(await fs.readFile(path.join(root, "skill-library", "fixtures", "b01_trial_02_candidate_retest.json"), "utf8"));

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(renderDir, { recursive: true });

const workbook = Workbook.create();
const font = "Arial";
const colors = {
  ink: "#2B2527",
  muted: "#6F6362",
  line: "#E1D8D3",
  rose: "#B87062",
  roseLight: "#FFF1EB",
  sage: "#2F6957",
  sageLight: "#EEF8F3",
  gold: "#7A5D19",
  goldLight: "#FFF8E4",
  red: "#A73535",
  redLight: "#FDEEEE",
  surface: "#FFFDFB",
};

function setTitle(sheet, title, subtitle) {
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = { font: { name: font, size: 15, bold: true, color: colors.ink } };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: font, size: 10, italic: true, color: colors.muted }, wrapText: true };
  sheet.getRange("A4:K4").format.borders = { bottom: { style: "thin", color: colors.rose } };
}

function styleHeader(range) {
  range.format = {
    fill: colors.rose,
    font: { name: font, size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: colors.rose },
  };
}

function styleTable(range) {
  range.format = {
    font: { name: font, size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: colors.line },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function tuplesText(value) {
  return (value || []).map(([aspect, sentiment]) => `${aspect} / ${sentiment}`).join("；") || "未映射";
}

function objectText(value) {
  return `意图：${value.intent}；情感：${value.sentiment}`;
}

const d01Quality = result.semantic_quality.d01;
const d02Quality = result.semantic_quality.d02;
const reviewById = Object.fromEntries(fixture.reviews.map((item) => [item.id, item]));
const signalById = Object.fromEntries(fixture.search_signals.map((item) => [item.query_id, item]));

// Create all formula targets before writing any cross-sheet formulas.
const summary = workbook.worksheets.add("复测总览");
const d01Sheet = workbook.worksheets.add("D01 受控复测");
const d02Sheet = workbook.worksheets.add("D02 受控复测");
const evidence = workbook.worksheets.add("复测证据");
summary.showGridLines = false;
summary.tabColor = colors.rose;
setTitle(summary, "B01 候选适配器受控复测", "业务结论：当前候选可进入独立盲测；不进入真实样本、不形成消费者或新品结论。");
summary.getRange("A5:D5").values = [["判断项", "Trial 01 原始基线", "Trial 02 当前受控复测", "业务含义"]];
styleHeader(summary.getRange("A5:D5"));
summary.getRange("A6:D11").values = [
  ["D01 语义样本数", "24", "=COUNTA('D01 受控复测'!A6:A65)", "评论方面、情感、意见词是否与人工定义的句义一致。"],
  ["D01 精确匹配", result.baseline.d01_exact, "=COUNTIFS('D01 受控复测'!J6:J65,\"通过\")", "只代表当前合成集内的逐条一致性。"],
  ["D01 精确匹配率", "58.3%", "=C7/C6", "达到预设 90% 门槛，仍需独立盲测。"],
  ["D02 语义样本数", "18", "=COUNTA('D02 受控复测'!A6:A53)", "搜索表达的意图与情感是否没有被规则顺序改写。"],
  ["D02 精确匹配", result.baseline.d02_exact, "=COUNTIFS('D02 受控复测'!J6:J53,\"通过\")", "只代表当前合成集内的逐条一致性。"],
  ["D02 精确匹配率", "83.3%", "=C10/C9", "达到预设 90% 门槛，仍需独立盲测。"],
];
styleTable(summary.getRange("A6:D11"));
summary.getRange("C6:C11").formulas = [
  ["=COUNTA('D01 受控复测'!A6:A65)"],
  ["=COUNTIFS('D01 受控复测'!J6:J65,\"通过\")"],
  ["=C7/C6"],
  ["=COUNTA('D02 受控复测'!A6:A53)"],
  ["=COUNTIFS('D02 受控复测'!J6:J53,\"通过\")"],
  ["=C10/C9"],
];
summary.getRange("C6:C11").format.fill = colors.sageLight;
summary.getRange("C8:C8").format.numberFormat = "0.0%";
summary.getRange("C11:C11").format.numberFormat = "0.0%";
summary.getRange("A13:D13").values = [["交付契约", "预设门槛", "当前结果", "下一步"]];
styleHeader(summary.getRange("A13:D13"));
summary.getRange("A14:D18").values = [
  ["逐条回溯", "每个输出回到唯一输入 ID", "=COUNTIFS('复测证据'!C6:C10,\"通过\")", "候选适配器的输入输出链可以审阅。"],
  ["语义闸口", "D01/D02 均不低于 90%", "=IF(AND(C8>=0.9,C11>=0.9),\"通过\",\"未通过\")", "未通过则不能进入独立盲测。"],
  ["候选定位", "不改动原始实现", "本地受控 candidate adapter", "原始实现保留为失败基线，不被覆盖。"],
  ["独立性风险", "实现者与标注者分离", "未满足", "下一轮由未参与本轮的人建立独立盲测集。"],
  ["真实样本准入", "独立盲测与数据合同都完成", "未满足", "当前不接入真实评论、搜索或任何经营数据。"],
];
styleTable(summary.getRange("A14:D18"));
summary.getRange("C14:C15").formulas = [
  ["=COUNTIFS('复测证据'!C6:C10,\"通过\")"],
  ["=IF(AND(C8>=0.9,C11>=0.9),\"通过\",\"未通过\")"],
];
summary.getRange("C14:C14").format = { fill: colors.sageLight, font: { name: font, size: 10, bold: true, color: colors.sage }, horizontalAlignment: "center", verticalAlignment: "center" };
summary.getRange("C15:C15").format = { fill: colors.sageLight, font: { name: font, size: 10, bold: true, color: colors.sage }, horizontalAlignment: "center", verticalAlignment: "center" };
summary.getRange("C17:C18").format = { fill: colors.goldLight, font: { name: font, size: 10, bold: true, color: colors.gold }, horizontalAlignment: "center", verticalAlignment: "center" };
summary.getRange("A20:D20").values = [["本轮决定", "=IF(AND(C8>=0.9,C11>=0.9,C14=5,C15=\"通过\"),\"可进入独立盲测（不进入真实样本）\",\"留在候选修复，不进入独立盲测\")", "原因", result.decision.reason]];
summary.getRange("A20:D20").format = {
  fill: colors.roseLight,
  font: { name: font, size: 10, bold: true, color: colors.ink },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: colors.rose },
};
summary.getRange("B20").formulas = [["=IF(AND(C8>=0.9,C11>=0.9,C14=5,C15=\"通过\"),\"可进入独立盲测（不进入真实样本）\",\"留在候选修复，不进入独立盲测\")"]];
summary.getRange("A22:D22").values = [["明确不作出的结论", fixture.non_conclusions.join(" "), "", ""]];
summary.getRange("A22:D22").format = {
  fill: colors.redLight,
  font: { name: font, size: 10, bold: true, color: colors.red },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#E8B9B4" },
};
setWidths(summary, [27, 27, 29, 56]);
summary.getRange("A3:D3").format.rowHeight = 30;
summary.getRange("A5:D5").format.rowHeight = 30;
summary.getRange("A6:D11").format.rowHeight = 38;
summary.getRange("A13:D13").format.rowHeight = 30;
summary.getRange("A14:D18").format.rowHeight = 42;
summary.getRange("A20:D20").format.rowHeight = 52;
summary.getRange("A22:D22").format.rowHeight = 48;

d01Sheet.showGridLines = false;
d01Sheet.tabColor = colors.sage;
setTitle(d01Sheet, "D01 评论中的需求证据拆解", "人工标注的合成评论；局部方面窗口、局部否定与未映射主题的逐条复核。未映射不是漏填，而是保留能力边界。");
d01Sheet.getRange("A5:J5").values = [["评论 ID", "评分", "日期", "合成评论", "预期方面 / 情感", "实际方面 / 情感", "缺失", "多余", "映射状态", "语义复核"]];
styleHeader(d01Sheet.getRange("A5:J5"));
d01Sheet.getRange("A6:J65").values = d01Quality.records.map((check) => {
  const source = reviewById[check.record_id];
  const execution = result.d01.rows.find((item) => item.review_id === check.record_id);
  return [
    check.record_id,
    source.rating,
    source.submitted_on,
    source.text,
    tuplesText(check.expected),
    tuplesText(check.actual),
    tuplesText(check.missing),
    tuplesText(check.unexpected),
    execution.mapping_state,
    check.exact_match ? "通过" : "未通过",
  ];
});
styleTable(d01Sheet.getRange("A6:J65"));
d01Sheet.getRange("J6:J65").conditionalFormats.add("containsText", { text: "通过", format: { fill: colors.sageLight, font: { bold: true, color: colors.sage } } });
d01Sheet.getRange("J6:J65").conditionalFormats.add("containsText", { text: "未通过", format: { fill: colors.redLight, font: { bold: true, color: colors.red } } });
d01Sheet.getRange("I6:I65").conditionalFormats.add("containsText", { text: "未映射", format: { fill: colors.goldLight, font: { bold: true, color: colors.gold } } });
d01Sheet.getRange("A68:J68").values = [["当前结论", `精确匹配 ${d01Quality.exact_match_count}/${d01Quality.total}（${(d01Quality.exact_match_rate * 100).toFixed(1)}%）。本轮候选可进入独立盲测，但不能据此接入真实评论或下业务结论。`, "", "", "", "", "", "", "", ""]];
d01Sheet.getRange("A68:J68").format = { fill: colors.sageLight, font: { name: font, size: 10, bold: true, color: colors.sage }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#B8D9CA" } };
setWidths(d01Sheet, [10, 8, 13, 54, 29, 29, 18, 18, 18, 12]);
d01Sheet.getRange("A3:J3").format.rowHeight = 30;
d01Sheet.getRange("A5:J5").format.rowHeight = 32;
d01Sheet.getRange("A6:J65").format.rowHeight = 47;
d01Sheet.getRange("A68:J68").format.rowHeight = 40;
d01Sheet.freezePanes.freezeRows(5);

d02Sheet.showGridLines = false;
d02Sheet.tabColor = colors.gold;
setTitle(d02Sheet, "D02 购买前需求信号归集", "人工标注的合成搜索表达；比较、问题、功能、属性、导航的优先级与机会规则边界逐条复核。");
d02Sheet.getRange("A5:K5").values = [["查询 ID", "月份", "合成搜索表达", "合成量级", "点击代理", "预期意图 / 情感", "实际意图 / 情感", "应命中规则", "实际规则", "语义复核", "规则复核"]];
styleHeader(d02Sheet.getRange("A5:K5"));
d02Sheet.getRange("A6:K53").values = d02Quality.records.map((check) => {
  const source = signalById[check.record_id];
  return [
    check.record_id,
    source.month,
    source.query,
    source.volume_proxy,
    source.click_proxy,
    objectText(check.expected),
    objectText(check.actual),
    check.expected_rule_hit ? "命中" : "未命中",
    check.actual_rule_hit ? "命中" : "未命中",
    check.exact_match ? "通过" : "未通过",
    check.rule_match ? "通过" : "未通过",
  ];
});
styleTable(d02Sheet.getRange("A6:K53"));
d02Sheet.getRange("D6:D53").format.numberFormat = "#,##0";
d02Sheet.getRange("E6:E53").format.numberFormat = "0%";
d02Sheet.getRange("J6:K53").conditionalFormats.add("containsText", { text: "通过", format: { fill: colors.sageLight, font: { bold: true, color: colors.sage } } });
d02Sheet.getRange("J6:K53").conditionalFormats.add("containsText", { text: "未通过", format: { fill: colors.redLight, font: { bold: true, color: colors.red } } });
d02Sheet.getRange("H6:I53").conditionalFormats.add("containsText", { text: "命中", format: { fill: colors.goldLight, font: { bold: true, color: colors.gold } } });
d02Sheet.getRange("A56:K56").values = [["当前结论", `意图/情感 ${d02Quality.exact_match_count}/${d02Quality.total}；规则边界 ${d02Quality.rule_match_count}/${d02Quality.total}。当前候选可进入独立盲测，但不能据此接入真实搜索或下业务结论。`, "", "", "", "", "", "", "", "", ""]];
d02Sheet.getRange("A56:K56").format = { fill: colors.sageLight, font: { name: font, size: 10, bold: true, color: colors.sage }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#B8D9CA" } };
setWidths(d02Sheet, [10, 10, 48, 12, 12, 27, 27, 13, 13, 12, 12]);
d02Sheet.getRange("A3:K3").format.rowHeight = 30;
d02Sheet.getRange("A5:K5").format.rowHeight = 32;
d02Sheet.getRange("A6:K53").format.rowHeight = 43;
d02Sheet.getRange("A56:K56").format.rowHeight = 40;
d02Sheet.freezePanes.freezeRows(5);

evidence.showGridLines = false;
evidence.tabColor = colors.ink;
setTitle(evidence, "复测证据与下一道门槛", "区分：原始失败基线、候选适配器当前结果、独立性风险与真实样本准入条件。");
evidence.getRange("A5:C5").values = [["检查项", "本轮可确认事实", "状态"]];
styleHeader(evidence.getRange("A5:C5"));
evidence.getRange("A6:C10").values = result.checks.map((check) => [check.name, check.detail, check.passed ? "通过" : "未通过"]);
styleTable(evidence.getRange("A6:C10"));
evidence.getRange("C6:C10").conditionalFormats.add("containsText", { text: "通过", format: { fill: colors.sageLight, font: { bold: true, color: colors.sage } } });
evidence.getRange("A13:C13").values = [["对象", "只读原始基线", "本地候选适配器"]];
styleHeader(evidence.getRange("A13:C13"));
evidence.getRange("A14:C15").values = [
  ["D01", `${result.original_read_only_implementations.D01.sha256.slice(0, 12)}；Trial 01 ${result.baseline.d01_exact}`, `${result.candidate_implementations.D01.sha256.slice(0, 12)}；局部窗口、局部否定、未知保留`],
  ["D02", `${result.original_read_only_implementations.D02.sha256.slice(0, 12)}；Trial 01 ${result.baseline.d02_exact}`, `${result.candidate_implementations.D02.sha256.slice(0, 12)}；显式意图优先级、规则边界`],
];
styleTable(evidence.getRange("A14:C15"));
evidence.getRange("A18:C18").values = [["独立盲测前的工作", "为什么要做", "完成判据"]];
styleHeader(evidence.getRange("A18:C18"));
evidence.getRange("A19:C22").values = [
  ["分离样本与实现责任", "当前样本和候选实现来自同一轮设计，存在过拟合风险。", "未参与本轮实现和标注的人定义新的独立盲测集。"],
  ["复测两类语义质量", "分别防止评论局部语义误挂和搜索意图误归。", "D01 方面/情感、D02 意图/情感及规则边界都达到预设门槛。"],
  ["设计真实样本数据合同", "真实数据的范围、合法性和质量不能靠规则通过来推定。", "说明授权、脱敏、来源、市场、语言、时间窗、去重和抽样规则。"],
  ["进入 C-018 证据链", "真实记录需要同时保留支持、反证、未知与适用范围。", "不直接跳到产品定义、投入、发布或任何业务动作。"],
];
styleTable(evidence.getRange("A19:C22"));
evidence.getRange("A25:C25").values = [["当前边界", "所有记录均为合成，适配器为本地候选，独立性风险尚未解除。", "因此本轮只允许进入独立盲测，不允许接入真实样本。"]];
evidence.getRange("A25:C25").format = { fill: colors.redLight, font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#E8B9B4" } };
setWidths(evidence, [29, 58, 58]);
evidence.getRange("A3:C3").format.rowHeight = 30;
evidence.getRange("A5:C5").format.rowHeight = 30;
evidence.getRange("A6:C10").format.rowHeight = 42;
evidence.getRange("A13:C15").format.rowHeight = 42;
evidence.getRange("A18:C18").format.rowHeight = 30;
evidence.getRange("A19:C22").format.rowHeight = 52;
evidence.getRange("A25:C25").format.rowHeight = 44;

workbook.recalculate();
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 200 }, summary: "formula error scan" });
if (errors && String(errors).includes("#REF!")) {
  throw new Error(`Formula error scan failed: ${errors}`);
}
for (const sheetName of ["复测总览", "D01 受控复测", "D02 受控复测", "复测证据"]) {
  const image = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await image.arrayBuffer()));
}
const outputPath = path.join(outputDir, "b01_trial_02_candidate_retest.xlsx");
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, sheets: ["复测总览", "D01 受控复测", "D02 受控复测", "复测证据"], errorScan: String(errors).slice(0, 500) }, null, 2));
