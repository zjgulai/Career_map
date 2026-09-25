import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT;
const outputDir = process.env.B01_TRIAL_OUTPUT_DIR;
const renderDir = process.env.B01_TRIAL_RENDER_DIR;

if (!root || !outputDir || !renderDir) {
  throw new Error("CAREER_ROOT, B01_TRIAL_OUTPUT_DIR and B01_TRIAL_RENDER_DIR are required.");
}

const fixture = JSON.parse(await fs.readFile(path.join(root, "skill-library", "fixtures", "b01_trial_01_wearable_pump.json"), "utf8"));
const result = JSON.parse(await fs.readFile(path.join(root, "skill-library", "outputs", "2026-09-23-b01-trial-01", "b01_trial_01_results.json"), "utf8"));
const workbook = Workbook.create();
const font = "Arial";
const colors = {
  ink: "#2B2527",
  muted: "#6F6362",
  rose: "#B87062",
  plum: "#33272A",
  sage: "#2F6957",
  gold: "#7A5D19",
  red: "#9D3F3A",
  paper: "#FBF8F5",
  warning: "#FFF8DF",
  line: "#E1D8D3",
  white: "#FFFFFF",
};

function setTitle(sheet, title, subtitle) {
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = {
    font: { name: font, size: 16, bold: true, color: colors.ink },
    verticalAlignment: "center",
  };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = {
    font: { name: font, size: 10, italic: true, color: colors.muted },
    verticalAlignment: "center",
  };
}

function styleHeader(range) {
  range.format = {
    fill: colors.plum,
    font: { name: font, size: 10, bold: true, color: colors.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.white },
  };
}

function styleTable(range) {
  range.format = {
    font: { name: font, size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: colors.line },
  };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width;
  });
}

function pairText(pairs) {
  if (!pairs || pairs.length === 0) return "未映射";
  return pairs.map(([aspect, sentiment]) => `${aspect} / ${sentiment}`).join("；");
}

function objectText(value) {
  return Object.entries(value || {}).map(([key, item]) => `${key}: ${item}`).join("；");
}

const reviewById = Object.fromEntries(fixture.reviews.map((item) => [item.id, item]));
const queryById = Object.fromEntries(fixture.search_signals.map((item) => [item.query_id, item]));
const d01Semantic = result.semantic_spot_check.d01;
const d02Semantic = result.semantic_spot_check.d02;

const summary = workbook.worksheets.add("试跑总览");
summary.showGridLines = false;
summary.tabColor = colors.plum;
setTitle(summary, "B01 同题试跑：D01 / D02 质量复核", "合成受控样本。只验证候选实现的可回溯性与语义质量，不产生消费者洞察或新品经营结论。生成日期：2026-09-23");
summary.getRange("A5:H5").values = [["样本性质", "试跑编号", "评论输入", "搜索输入", "交付契约", "D01 语义闸口", "D02 语义闸口", "真实样本准入"]];
summary.getRange("A6:H6").values = [[
  result.sample_classification,
  result.trial_id,
  fixture.reviews.length,
  fixture.search_signals.length,
  `${result.checks.filter((item) => item.passed).length}/${result.checks.length} 通过`,
  d01Semantic.quality_gate,
  d02Semantic.quality_gate,
  "不准入",
]];
styleHeader(summary.getRange("A5:H5"));
summary.getRange("A6:H6").format = {
  fill: colors.paper,
  font: { name: font, size: 10, bold: true, color: colors.ink },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: colors.line },
};
summary.getRange("A8:H8").values = [["能力站位", "语义通过", "抽检总数", "精确匹配率", "90% 门槛", "质量闸口", "已验证的交付能力", "当前不能做什么"]];
styleHeader(summary.getRange("A8:H8"));
summary.getRange("A9:H10").values = [
  ["D01 评论中的需求证据拆解", null, null, null, 0.9, null, "每条三元组保留 review_id；词典外评论保留为未映射。", "不能作为真实评论的需求判断。"],
  ["D02 购买前需求信号归集", null, null, null, 0.9, null, "每条信号保留 query_id、月份、合成量级与规则状态。", "不能输出真实未覆盖需求或产品优先级。"],
];
summary.getRange("B9").formulas = [["=COUNTIFS('D01 语义复核'!J6:J29,\"通过\")"]];
summary.getRange("B10").formulas = [["=COUNTIFS('D02 语义复核'!J6:J23,\"通过\")"]];
summary.getRange("C9").formulas = [["=COUNTA('D01 语义复核'!A6:A29)"]];
summary.getRange("C10").formulas = [["=COUNTA('D02 语义复核'!A6:A23)"]];
summary.getRange("D9").formulas = [["=B9/C9"]];
summary.getRange("D10").formulas = [["=B10/C10"]];
summary.getRange("F9").formulas = [["=IF(D9>=E9,\"通过\",\"未通过，不能进入真实样本判断\")"]];
summary.getRange("F10").formulas = [["=IF(D10>=E10,\"通过\",\"未通过，不能进入真实样本判断\")"]];
styleTable(summary.getRange("A9:H10"));
summary.getRange("B9:E10").format.horizontalAlignment = "center";
summary.getRange("D9:E10").format.numberFormat = "0.0%";
summary.getRange("F9:F10").conditionalFormats.add("containsText", {
  text: "未通过",
  format: { fill: "#FDEEEE", font: { bold: true, color: colors.red } },
});
summary.getRange("A12").values = [["同题对照：两侧记录在受控样本中的读法"]];
summary.getRange("A12:H12").format = {
  fill: colors.paper,
  font: { name: font, size: 11, bold: true, color: colors.ink },
  verticalAlignment: "center",
  borders: { preset: "outside", style: "thin", color: colors.line },
};
summary.getRange("A13:G13").values = [["主题", "D01 规则正面", "D01 规则负面", "D01 规则中性", "搜索记录", "D02 规则命中", "受控样本读法"]];
styleHeader(summary.getRange("A13:G13"));
summary.getRange(`A14:G${13 + result.cross_source_view.length}`).values = result.cross_source_view.map((item) => [
  item.topic,
  item.review_positive,
  item.review_negative,
  item.review_neutral,
  item.search_records,
  item.search_rule_hits,
  item.controlled_reading,
]);
styleTable(summary.getRange(`A14:G${13 + result.cross_source_view.length}`));
summary.getRange("A20:B20").values = [["业务问题", result.business_question]];
summary.mergeCells("B20:H20");
summary.getRange("A20").format = { fill: colors.warning, font: { name: font, size: 10, bold: true, color: colors.gold }, verticalAlignment: "top" };
summary.getRange("B20:H20").format = { fill: colors.warning, font: { name: font, size: 10, color: colors.gold }, verticalAlignment: "top", wrapText: true };
summary.getRange("A21:B21").values = [["本轮边界", "所有输入与量级均为合成数据。交付契约通过不等于语义质量、样本代表性、真实趋势或业务可用性通过。"]];
summary.mergeCells("B21:H21");
summary.getRange("A21").format = { fill: "#FDEEEE", font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top" };
summary.getRange("B21:H21").format = { fill: "#FDEEEE", font: { name: font, size: 10, color: colors.red }, verticalAlignment: "top", wrapText: true };
setWidths(summary, [29, 14, 14, 14, 13, 29, 35, 34]);
summary.getRange("A2:H2").format.rowHeight = 28;
summary.getRange("A3:H3").format.rowHeight = 26;
summary.getRange("A5:H6").format.rowHeight = 36;
summary.getRange("A8:H10").format.rowHeight = 52;
summary.getRange(`A14:G${13 + result.cross_source_view.length}`).format.rowHeight = 46;
summary.getRange("A20:H21").format.rowHeight = 52;
summary.freezePanes.freezeRows(8);

const d01Sheet = workbook.worksheets.add("D01 语义复核");
d01Sheet.showGridLines = false;
d01Sheet.tabColor = colors.rose;
setTitle(d01Sheet, "D01：评论方面级情感拆解的语义复核", "评的是规则输出是否符合语义明确的合成句子；逐条精确匹配低于门槛时，不得进入真实样本判断。");
d01Sheet.getRange("A5:J5").values = [["评论 ID", "评分", "日期", "合成评论文本", "预期方面 / 情感", "实际方面 / 情感", "缺失项", "多余项", "映射状态", "语义复核"]];
styleHeader(d01Sheet.getRange("A5:J5"));
d01Sheet.getRange("A6:J29").values = d01Semantic.records.map((check) => {
  const source = reviewById[check.record_id];
  const execution = result.d01.rows.find((item) => item.review_id === check.record_id);
  return [
    check.record_id,
    source.rating,
    new Date(`${source.submitted_on}T00:00:00`),
    source.text,
    pairText(check.expected),
    pairText(check.actual),
    pairText(check.missing),
    pairText(check.unexpected),
    execution.mapping_state,
    check.exact_match ? "通过" : "未通过",
  ];
});
styleTable(d01Sheet.getRange("A6:J29"));
d01Sheet.getRange("B6:B29").format.numberFormat = "0";
d01Sheet.getRange("C6:C29").format.numberFormat = "yyyy-mm-dd";
d01Sheet.getRange("J6:J29").conditionalFormats.add("containsText", {
  text: "未通过",
  format: { fill: "#FDEEEE", font: { bold: true, color: colors.red } },
});
d01Sheet.getRange("I6:I29").conditionalFormats.add("containsText", {
  text: "未映射",
  format: { fill: colors.warning, font: { bold: true, color: colors.gold } },
});
d01Sheet.getRange("A32:B32").values = [["D01 本轮结论", `精确匹配 ${d01Semantic.exact_match_count}/${d01Semantic.total}（${(d01Semantic.exact_match_rate * 100).toFixed(1)}%），低于 90% 门槛。主要问题是局部词义扩散、方面误挂与混合情感处理失真。`]];
d01Sheet.mergeCells("B32:J32");
d01Sheet.getRange("A32").format = { fill: "#FDEEEE", font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top" };
d01Sheet.getRange("B32:J32").format = { fill: "#FDEEEE", font: { name: font, size: 10, color: colors.red }, verticalAlignment: "top", wrapText: true };
setWidths(d01Sheet, [11, 8, 13, 58, 27, 32, 25, 28, 18, 12]);
d01Sheet.getRange("A2:J2").format.rowHeight = 28;
d01Sheet.getRange("A3:J3").format.rowHeight = 26;
d01Sheet.getRange("A5:J5").format.rowHeight = 34;
d01Sheet.getRange("A6:J29").format.rowHeight = 72;
d01Sheet.getRange("A32:J32").format.rowHeight = 54;
d01Sheet.freezePanes.freezeRows(5);

const d02Sheet = workbook.worksheets.add("D02 语义复核");
d02Sheet.showGridLines = false;
d02Sheet.tabColor = colors.sage;
setTitle(d02Sheet, "D02：购买前搜索信号归集的语义复核", "搜索词均为合成记录。此表同时检验意图与情感分类，不把属性、比较或功能型表达改写成产品痛点。");
d02Sheet.getRange("A5:J5").values = [["查询 ID", "月份", "合成搜索表达", "合成量级", "点击代理", "预期意图 / 情感", "实际意图 / 情感", "规则命中", "复核差异", "语义复核"]];
styleHeader(d02Sheet.getRange("A5:J5"));
d02Sheet.getRange("A6:J23").values = d02Semantic.records.map((check) => {
  const source = queryById[check.record_id];
  const execution = result.d02.rows.find((item) => item.query_id === check.record_id);
  const expected = objectText(check.expected);
  const actual = objectText(check.actual);
  return [
    check.record_id,
    source.month,
    source.query,
    source.volume_proxy,
    source.click_proxy,
    expected,
    actual,
    execution.opportunity_rule_hit ? "命中" : "未命中",
    check.exact_match ? "" : `预期：${expected}；实际：${actual}`,
    check.exact_match ? "通过" : "未通过",
  ];
});
styleTable(d02Sheet.getRange("A6:J23"));
d02Sheet.getRange("D6:D23").format.numberFormat = "#,##0";
d02Sheet.getRange("E6:E23").format.numberFormat = "0%";
d02Sheet.getRange("J6:J23").conditionalFormats.add("containsText", {
  text: "未通过",
  format: { fill: "#FDEEEE", font: { bold: true, color: colors.red } },
});
d02Sheet.getRange("H6:H23").conditionalFormats.add("containsText", {
  text: "命中",
  format: { fill: "#EEF8F3", font: { bold: true, color: colors.sage } },
});
d02Sheet.getRange("A26:B26").values = [["D02 本轮结论", `精确匹配 ${d02Semantic.exact_match_count}/${d02Semantic.total}（${(d02Semantic.exact_match_rate * 100).toFixed(1)}%），低于 90% 门槛。office/work 场景词的规则顺序导致分类不稳定。`]];
d02Sheet.mergeCells("B26:J26");
d02Sheet.getRange("A26").format = { fill: "#FDEEEE", font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top" };
d02Sheet.getRange("B26:J26").format = { fill: "#FDEEEE", font: { name: font, size: 10, color: colors.red }, verticalAlignment: "top", wrapText: true };
setWidths(d02Sheet, [11, 10, 48, 13, 12, 27, 27, 13, 42, 12]);
d02Sheet.getRange("A2:J2").format.rowHeight = 28;
d02Sheet.getRange("A3:J3").format.rowHeight = 26;
d02Sheet.getRange("A5:J5").format.rowHeight = 34;
d02Sheet.getRange("A6:J23").format.rowHeight = 54;
d02Sheet.getRange("A26:J26").format.rowHeight = 48;
d02Sheet.freezePanes.freezeRows(5);

const nextSheet = workbook.worksheets.add("证据链与下一关");
nextSheet.showGridLines = false;
nextSheet.tabColor = colors.gold;
setTitle(nextSheet, "证据链与下一关", "把已验证的交付契约、未通过的语义质量闸口、真实样本前的工作和不可作出的结论分开。 ");
nextSheet.getRange("A5:C5").values = [["检查项", "本轮可确认事实", "对下一关的影响"]];
styleHeader(nextSheet.getRange("A5:C5"));
const traceRows = [
  ["样本性质", "24 条评论与 18 条搜索信号均为合成受控数据。", "不能外推为真实消费者、市场或品牌结论。"],
  ["D01 原始实现", `已只读运行；实现版本指纹 ${result.source_implementations.D01.sha256.slice(0, 12)}。`, "交付链可回溯，但 14/24 语义精确匹配未达门槛。"],
  ["D02 原始实现", `已只读运行；实现版本指纹 ${result.source_implementations.D02.sha256.slice(0, 12)}。`, "交付链可回溯，但 15/18 语义精确匹配未达门槛。"],
  ["交付契约", `${result.checks.filter((item) => item.passed).length}/${result.checks.length} 项检查通过。`, "可继续修复候选实现，不能跳过质量闸口进入真实数据。"],
  ["C-018 对齐", "支持、反证、未映射和来源 ID 均可被展示。", "修复后才可用真实、授权且说明范围的数据形成需求证据与问题地图。"],
];
nextSheet.getRange(`A6:C${5 + traceRows.length}`).values = traceRows;
styleTable(nextSheet.getRange(`A6:C${5 + traceRows.length}`));
nextSheet.getRange("A13:C13").values = [["进入真实样本前必须完成", "说明", "完成判据"]];
styleHeader(nextSheet.getRange("A13:C13"));
const nextRows = [
  ["修复 D01 方面与窗口策略", "限制情感词在局部方面窗口内的作用，清除误挂方面。", "人工标注验证集上的语义精确匹配达到预设门槛。"],
  ["修复 D02 意图分类", "将场景词、功能词与属性词拆开，复核规则优先顺序。", "不再把 quiet/silent + office/work 类场景词误归。"],
  ["补齐品类方面表", "新增防漏、会话记录等当前未映射主题，并定义例外处理。", "未映射记录有可复核的转交或新增方面决策。"],
  ["取得真实数据授权", "说明来源、市场、语言、时间窗、去重与抽样规则。", "数据可合法使用，且能追溯到原记录。"],
  ["交叉证据复核", "让评论、搜索、访谈或其他证据并列，保留冲突与未知。", "C-018 的来源、范围、支持、反证和未知均完整。"],
];
nextSheet.getRange(`A14:C${13 + nextRows.length}`).values = nextRows;
styleTable(nextSheet.getRange(`A14:C${13 + nextRows.length}`));
nextSheet.getRange("A22:C22").values = [["本轮明确不作出的结论", "不代表真实消费者偏好、市场规模、品牌或品类问题。", "不构成产品定义、投入优先级、发布、采购、投放、岗位任命或业务授权。"]];
nextSheet.getRange("A22:C22").format = {
  fill: "#FDEEEE",
  font: { name: font, size: 10, color: colors.red, bold: true },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#E8B9B4" },
};
setWidths(nextSheet, [29, 57, 57]);
nextSheet.getRange("A2:C2").format.rowHeight = 28;
nextSheet.getRange("A3:C3").format.rowHeight = 26;
nextSheet.getRange("A5:C10").format.rowHeight = 46;
nextSheet.getRange("A13:C18").format.rowHeight = 54;
nextSheet.getRange("A22:C22").format.rowHeight = 48;
nextSheet.freezePanes.freezeRows(5);

workbook.recalculate();
const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "试跑总览!A5:H21",
  include: "values,formulas",
  tableMaxRows: 24,
  tableMaxCols: 8,
});
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
await fs.mkdir(renderDir, { recursive: true });
for (const sheetName of ["试跑总览", "D01 语义复核", "D02 语义复核", "证据链与下一关"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}
await fs.mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "b01_trial_01_controlled_fixture.xlsx");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({
  outputPath,
  summaryCheck: summaryCheck.ndjson,
  formulaErrors: formulaErrors.ndjson,
  sheets: ["试跑总览", "D01 语义复核", "D02 语义复核", "证据链与下一关"],
}, null, 2));
