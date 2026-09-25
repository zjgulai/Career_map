import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT;
const outputDir = process.env.B01_OUTPUT_DIR;
const renderDir = process.env.B01_RENDER_DIR;

if (!root || !outputDir || !renderDir) {
  throw new Error("CAREER_ROOT, B01_OUTPUT_DIR and B01_RENDER_DIR are required.");
}

const sourcePath = path.join(root, "skill-library", "b01_bid_shortlist.json");
const source = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const items = source.shortlist;
const workbook = Workbook.create();
const font = "Arial";
const colors = {
  ink: "#2B2527",
  muted: "#6F6362",
  rose: "#B87062",
  plum: "#33272A",
  sage: "#2F6957",
  gold: "#7A5D19",
  paper: "#FBF8F5",
  line: "#E1D8D3",
  white: "#FFFFFF",
};

function setTitle(sheet, title, subtitle, width) {
  sheet.getRange(`A2:${width}2`).merge();
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = {
    font: { name: font, size: 16, bold: true, color: colors.ink },
    verticalAlignment: "center",
  };
  sheet.getRange(`A3:${width}3`).merge();
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

const summary = workbook.worksheets.add("B01 初筛总览");
summary.showGridLines = false;
summary.tabColor = colors.plum;
setTitle(summary, "B01 机会洞察与商业论证：首轮 Skill 初筛", "候选交付位置、样本试跑条件与必须补证项。生成日期：2026-09-23", "H");
summary.getRange("A5:D5").values = [["本轮候选", "可开展样本试跑", "条件入围，先补证", "正式任命"]];
summary.getRange("A6:D6").values = [[items.length, items.filter((item) => item.selection_status === "可开展样本试跑").length, items.filter((item) => item.selection_status === "条件入围，先补证").length, 0]];
styleHeader(summary.getRange("A5:D5"));
summary.getRange("A6:D6").format = {
  fill: colors.paper,
  font: { name: font, size: 14, bold: true, color: colors.ink },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: colors.line },
};
summary.getRange("A8:H8").merge();
summary.getRange("A8").values = [[source.scope]];
summary.getRange("A8").format = {
  fill: "#FFF8DF",
  font: { name: font, size: 10, color: colors.gold },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#EADC99" },
};
const summaryHeaders = ["站位", "候选 Skill", "中文名称", "初筛状态", "最小交付", "样本试跑输入", "首要补证", "不能直接得出的结论"];
summary.getRange("A10:H10").values = [summaryHeaders];
summary.getRange(`A11:H${10 + items.length}`).values = items.map((item) => [
  item.position_code,
  item.english_name,
  item.chinese_name,
  item.selection_status,
  item.direct_output,
  item.trial_input,
  item.must_prove,
  item.boundary,
]);
styleHeader(summary.getRange("A10:H10"));
styleTable(summary.getRange(`A11:H${10 + items.length}`));
summary.getRange(`D11:D${10 + items.length}`).conditionalFormats.add("containsText", {
  text: "可开展样本试跑",
  format: { fill: "#EEF8F3", font: { bold: true, color: colors.sage } },
});
summary.getRange(`D11:D${10 + items.length}`).conditionalFormats.add("containsText", {
  text: "条件入围",
  format: { fill: "#FFF8DF", font: { bold: true, color: colors.gold } },
});
setWidths(summary, [10, 31, 30, 18, 30, 32, 30, 32]);
summary.getRange("A2:H2").format.rowHeight = 28;
summary.getRange("A3:H3").format.rowHeight = 20;
summary.getRange("A8:H8").format.rowHeight = 32;
summary.getRange("A10:H10").format.rowHeight = 30;
summary.getRange(`A11:H${10 + items.length}`).format.rowHeight = 100;
summary.freezePanes.freezeRows(10);

const details = workbook.worksheets.add("候选详情");
details.showGridLines = false;
details.tabColor = colors.rose;
setTitle(details, "B01 候选详情", "按最小能力站位看每位候选的业务问题、输入、输出、试跑和边界。", "N");
const detailHeaders = ["站位", "候选 Skill", "中文名称", "阶段", "初筛状态", "业务问题", "为何入围", "直接输入", "直接输出", "样本试跑输入", "样本试跑交付", "验收口径", "必须补证", "边界"];
details.getRange("A5:N5").values = [detailHeaders];
details.getRange(`A6:N${5 + items.length}`).values = items.map((item) => [
  item.position_code,
  item.english_name,
  item.chinese_name,
  item.stage,
  item.selection_status,
  item.business_question,
  item.why_selected,
  item.direct_input,
  item.direct_output,
  item.trial_input,
  item.trial_output,
  item.acceptance,
  item.must_prove,
  item.boundary,
]);
styleHeader(details.getRange("A5:N5"));
styleTable(details.getRange(`A6:N${5 + items.length}`));
setWidths(details, [9, 32, 28, 22, 18, 32, 32, 32, 30, 32, 32, 34, 34, 34]);
details.getRange("A2:N2").format.rowHeight = 28;
details.getRange("A3:N3").format.rowHeight = 20;
details.getRange("A5:N5").format.rowHeight = 34;
details.getRange(`A6:N${5 + items.length}`).format.rowHeight = 128;
details.freezePanes.freezeRows(5);

const trial = workbook.worksheets.add("试跑任务");
trial.showGridLines = false;
trial.tabColor = colors.sage;
setTitle(trial, "首轮试跑任务", "以一个已脱敏、可合法使用的品类样本包验证候选交付，不产生真实业务结论。", "G");
const trialHeaders = ["顺序", "站位", "候选 Skill", "试跑输入", "应交付什么", "验收时看什么", "停止或降级条件"];
trial.getRange("A5:G5").values = [trialHeaders];
trial.getRange(`A6:G${5 + items.length}`).values = items.map((item) => [
  item.order,
  item.position_code,
  item.english_name,
  item.trial_input,
  item.trial_output,
  item.acceptance,
  item.boundary,
]);
styleHeader(trial.getRange("A5:G5"));
styleTable(trial.getRange(`A6:G${5 + items.length}`));
setWidths(trial, [8, 10, 32, 36, 36, 38, 38]);
trial.getRange("A2:G2").format.rowHeight = 28;
trial.getRange("A3:G3").format.rowHeight = 20;
trial.getRange("A5:G5").format.rowHeight = 34;
trial.getRange(`A6:G${5 + items.length}`).format.rowHeight = 112;
trial.freezePanes.freezeRows(5);

const guide = workbook.worksheets.add("读法与边界");
guide.showGridLines = false;
guide.tabColor = "#7A5D19";
setTitle(guide, "读法与边界", "把候选 Skill、能力站位、经营判断和业务动作分开阅读。", "C");
const guideRows = [
  ["本轮目的", "验证候选 Skill 能否在一个最小能力站位交付可追溯的样本产物。"],
  ["不在本轮内", "真实新品结论、投资与资源取舍、发布、采购、投放、岗位任命、Preset 或数字员工配置。"],
  ["C-018", "需求证据与问题地图应包含来源、范围、支持、反证和未知，而不是直接成为产品规格或投入建议。"],
  ["C-021", "商业论证应输出可比较的经营选项和验证建议，说明价值假设、经济条件、风险和学习价值。"],
  ["资料质量", "本地原始 Skill 可读，但卡片示例收益不是经营事实。论文线索按每位候选的补证项处理。"],
  ["下一轮门槛", "先完成样本试跑和补证复核，再决定是否进入一个真实经营事项的能力竞聘。"],
];
guide.getRange("A5:B10").values = guideRows;
guide.getRange("A5:A10").format = {
  fill: colors.paper,
  font: { name: font, size: 10, bold: true, color: colors.ink },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "insideHorizontal", style: "thin", color: colors.line },
};
guide.getRange("B5:B10").format = {
  font: { name: font, size: 10, color: colors.ink },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "insideHorizontal", style: "thin", color: colors.line },
};
setWidths(guide, [20, 90]);
guide.getRange("A2:C2").format.rowHeight = 28;
guide.getRange("A3:C3").format.rowHeight = 20;
guide.getRange("A5:B10").format.rowHeight = 48;

workbook.recalculate();
const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "B01 初筛总览!A5:H15",
  include: "values,formulas",
  tableMaxRows: 15,
  tableMaxCols: 8,
});
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
await fs.mkdir(renderDir, { recursive: true });
for (const sheetName of ["B01 初筛总览", "候选详情", "试跑任务", "读法与边界"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "b01_opportunity_insight_bid_shortlist.xlsx");
await output.save(outputPath);
console.log(JSON.stringify({
  outputPath,
  summaryCheck: summaryCheck.ndjson,
  formulaErrors: formulaErrors.ndjson,
  sheets: ["B01 初筛总览", "候选详情", "试跑任务", "读法与边界"],
}, null, 2));
