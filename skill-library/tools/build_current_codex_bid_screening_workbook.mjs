import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT;
const outputDir = process.env.CURRENT_CODEX_SCREENING_OUTPUT_DIR;
const renderDir = process.env.CURRENT_CODEX_SCREENING_RENDER_DIR;

if (!root || !outputDir || !renderDir) {
  throw new Error("CAREER_ROOT, CURRENT_CODEX_SCREENING_OUTPUT_DIR and CURRENT_CODEX_SCREENING_RENDER_DIR are required.");
}

const source = JSON.parse(await fs.readFile(path.join(root, "skill-library", "current_codex_bid_screening.json"), "utf8"));
const summary = JSON.parse(await fs.readFile(path.join(root, "skill-library", "current_codex_bid_screening_summary.json"), "utf8"));
const workbook = Workbook.create();
const font = "Arial";
const colors = { ink: "#2B2527", muted: "#6F6362", rose: "#B87062", plum: "#33272A", sage: "#2F6957", gold: "#7A5D19", paper: "#FBF8F5", line: "#E1D8D3", white: "#FFFFFF", paleGreen: "#EEF8F3", paleGold: "#FFF8DF", paleRose: "#FDEFEA", paleGray: "#F1EFF0" };
const routes = ["进入业务验证设计", "先作为能力供给试验", "保留为工程运行支撑", "暂不进入当前三宝竞聘"];

function setTitle(sheet, title, subtitle, range) {
  sheet.getRange(`A2:${range}2`).merge();
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = { font: { name: font, size: 16, bold: true, color: colors.ink }, verticalAlignment: "center" };
  sheet.getRange(`A3:${range}3`).merge();
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: font, size: 10, italic: true, color: colors.muted }, verticalAlignment: "center", wrapText: true };
}

function styleHeader(range) {
  range.format = { fill: colors.plum, font: { name: font, size: 10, bold: true, color: colors.white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "all", style: "thin", color: colors.white } };
}

function styleBody(range) {
  range.format = { font: { name: font, size: 10, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "inside", style: "thin", color: colors.line } };
}

function setWidths(sheet, widths) {
  widths.forEach((width, index) => { sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
}

const overview = workbook.worksheets.add("初筛总览");
overview.showGridLines = false;
overview.tabColor = colors.plum;
setTitle(overview, "当前 Codex Skill：第一轮业务初筛", "43 个当前可用、新纳入待业务复核的 Skill。先看业务位置与可验收交付，再决定是否进入下一道受控验证。", "H");
overview.getRange("A5:D5").values = [["进入业务验证设计", "先作为能力供给试验", "工程运行支撑", "当前范围外"]];
overview.getRange("A6:D6").values = [[summary.counts[routes[0]], summary.counts[routes[1]], summary.counts[routes[2]], summary.counts[routes[3]]]];
styleHeader(overview.getRange("A5:D5"));
overview.getRange("A6:D6").format = { fill: colors.paper, font: { name: font, size: 16, bold: true, color: colors.ink }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "all", style: "thin", color: colors.line } };
overview.getRange("A8:H8").merge();
overview.getRange("A8").values = [[summary.boundary]];
overview.getRange("A8").format = { fill: colors.paleGold, font: { name: font, size: 10, color: colors.gold }, verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: "#EADC99" } };
const descriptions = {
  "进入业务验证设计": ["能对应当前蓝图的最小经营问题，先比受控题中的交付质量。", "使用脱敏、受控业务题验证输入、输出、证据与边界。", "不代表通过竞聘、得到任命或业务授权。"],
  "先作为能力供给试验": ["可支撑数据、方法、工作台或沟通，需要先明确服务对象和接收方。", "确定一个明确使用者和最小交付，再做能力供给试验。", "不代表已经成为岗位、Preset 或正式平台功能。"],
  "保留为工程运行支撑": ["价值在工具、工程变更、发布、预览或特定项目治理，不与业务能力抢同一赛道。", "按未来技术栈需要做工程可靠性验证。", "不代表当前三宝经营能力，亦不自动进入业务竞聘。"],
  "暂不进入当前三宝竞聘": ["当前没有已确认的业务接收位置或技术路线，先保留来源。", "出现明确产品技术路线和验收标准后再重审。", "不代表没有价值，只表示本轮没有合格的竞聘题。"],
};
overview.getRange("A10:F10").values = [["初筛去向", "数量", "代表 Skill", "业务读法", "下一步", "不代表什么"]];
overview.getRange("A11:F14").values = routes.map((route) => {
  const items = source.filter((entry) => entry["初筛去向"] === route);
  const [reading, next, boundary] = descriptions[route];
  return [route, items.length, items.slice(0, 6).map((entry) => entry.Skill).join("；"), reading, next, boundary];
});
styleHeader(overview.getRange("A10:F10"));
styleBody(overview.getRange("A11:F14"));
setWidths(overview, [23, 10, 52, 40, 43, 43]);
overview.getRange("A2:H2").format.rowHeight = 30;
overview.getRange("A3:H3").format.rowHeight = 30;
overview.getRange("A5:D5").format.rowHeight = 26;
overview.getRange("A6:D6").format.rowHeight = 34;
overview.getRange("A8:H8").format.rowHeight = 38;
overview.getRange("A10:F10").format.rowHeight = 30;
overview.getRange("A11:F14").format.rowHeight = 86;
overview.freezePanes.freezeRows(10);

const details = workbook.worksheets.add("43项初筛明细");
details.showGridLines = false;
details.tabColor = colors.rose;
setTitle(details, "当前 Codex Skill：43 项逐项业务初筛", "每项均回到当前 SKILL.md 的用途、前置条件、工作流和边界。此表的“初筛去向”独立于原有“暂停竞聘”门槛。", "P");
const detailHeaders = ["序号", "Skill", "中文名称", "初筛去向", "三宝位置", "一句话作用", "最小业务问题", "关键输入", "可验收输出", "建议的受控验证", "验收要点", "为什么这样分流", "不能直接得出的结论", "下一道门槛", "原有竞聘准备度", "原文入口"];
details.getRange("A5:P5").values = [detailHeaders];
details.getRange(`A6:P${5 + source.length}`).values = source.map((entry) => [entry["序号"], entry.Skill, entry["中文名称"], entry["初筛去向"], entry["三宝位置"], entry["一句话作用"], entry["最小业务问题"], entry["关键输入"], entry["可验收输出"], entry["建议的受控验证"], entry["验收要点"], entry["为什么这样分流"], entry["不能直接得出的结论"], entry["分流重点"], entry["原有竞聘准备度"], entry["原文入口"]]);
styleHeader(details.getRange("A5:P5"));
styleBody(details.getRange(`A6:P${5 + source.length}`));
details.getRange(`D6:D${5 + source.length}`).conditionalFormats.add("containsText", { text: "进入业务验证设计", format: { fill: colors.paleGreen, font: { bold: true, color: colors.sage } } });
details.getRange(`D6:D${5 + source.length}`).conditionalFormats.add("containsText", { text: "先作为能力供给试验", format: { fill: colors.paleGold, font: { bold: true, color: colors.gold } } });
details.getRange(`D6:D${5 + source.length}`).conditionalFormats.add("containsText", { text: "保留为工程运行支撑", format: { fill: colors.paleGray, font: { bold: true, color: colors.muted } } });
details.getRange(`D6:D${5 + source.length}`).conditionalFormats.add("containsText", { text: "暂不进入当前三宝竞聘", format: { fill: colors.paleRose, font: { bold: true, color: colors.rose } } });
setWidths(details, [7, 29, 25, 24, 35, 34, 38, 39, 39, 39, 38, 39, 40, 38, 20, 60]);
details.getRange("A2:P2").format.rowHeight = 30;
details.getRange("A3:P3").format.rowHeight = 32;
details.getRange("A5:P5").format.rowHeight = 38;
details.getRange(`A6:P${5 + source.length}`).format.rowHeight = 126;
details.freezePanes.freezeRows(5);

const trials = workbook.worksheets.add("受控验证任务");
trials.showGridLines = false;
trials.tabColor = colors.sage;
setTitle(trials, "下一道门槛：受控验证任务", "全部使用脱敏或合成输入。验证候选交付，不产生真实经营结论、授权、任命或上线结论。", "I");
trials.getRange("A5:I5").values = [["Skill", "中文名称", "初筛去向", "三宝位置", "受控验证输入", "应交付什么", "验收要点", "下一道门槛", "不能直接得出的结论"]];
trials.getRange(`A6:I${5 + source.length}`).values = source.map((entry) => [entry.Skill, entry["中文名称"], entry["初筛去向"], entry["三宝位置"], entry["建议的受控验证"], entry["可验收输出"], entry["验收要点"], entry["分流重点"], entry["不能直接得出的结论"]]);
styleHeader(trials.getRange("A5:I5"));
styleBody(trials.getRange(`A6:I${5 + source.length}`));
setWidths(trials, [30, 25, 24, 37, 43, 42, 40, 40, 43]);
trials.getRange("A2:I2").format.rowHeight = 30;
trials.getRange("A3:I3").format.rowHeight = 32;
trials.getRange("A5:I5").format.rowHeight = 36;
trials.getRange(`A6:I${5 + source.length}`).format.rowHeight = 112;
trials.freezePanes.freezeRows(5);

const guide = workbook.worksheets.add("读法与边界");
guide.showGridLines = false;
guide.tabColor = colors.gold;
setTitle(guide, "业务读法与边界", "把可调用、可试验、可竞聘、可承接和可授权分开，避免能力库变成不受控的工具清单。", "C");
const guideRows = [
  ["初筛去向", "每个 Skill 只能有一个去向，形成互斥且完整的第一轮分流；三宝位置只说明最接近的业务接收位置。"],
  ["进入业务验证设计", "只说明能进入一个脱敏、受控的业务题，验证输入、输出、证据、未知和边界。不是通过竞聘。"],
  ["能力供给试验", "先确认谁使用、交给谁、如何验收，再验证它是否适合作为数据、方法、工作台或沟通供给。"],
  ["工程运行支撑", "工具、发布、预览、工程改动与特定项目治理能力单列，不与经营责任抢同一赛道。"],
  ["当前范围外", "没有明确的三宝业务接收位置或技术路线时先不竞聘，保留来源等待真正需求。"],
  ["原有准备度", "43 项在原总表中仍是“暂停竞聘”。本工作簿不改变这个保守质量门槛。"],
  ["不在本轮内", "真实消费者结论、市场进入决定、资源投入、发布、采购、投放、岗位任命、Preset 组装和生产上线。"],
];
guide.getRange(`A5:B${4 + guideRows.length}`).values = guideRows;
guide.getRange(`A5:A${4 + guideRows.length}`).format = { fill: colors.paper, font: { name: font, size: 10, bold: true, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "insideHorizontal", style: "thin", color: colors.line } };
guide.getRange(`B5:B${4 + guideRows.length}`).format = { font: { name: font, size: 10, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "insideHorizontal", style: "thin", color: colors.line } };
setWidths(guide, [25, 105]);
guide.getRange("A2:C2").format.rowHeight = 30;
guide.getRange("A3:C3").format.rowHeight = 28;
guide.getRange(`A5:B${4 + guideRows.length}`).format.rowHeight = 50;

workbook.recalculate();
const overviewCheck = await workbook.inspect({ kind: "table", range: "初筛总览!A5:F14", include: "values,formulas", tableMaxRows: 14, tableMaxCols: 6 });
const formulaErrors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 100 }, summary: "final formula error scan" });
await fs.mkdir(renderDir, { recursive: true });
for (const sheetName of ["初筛总览", "43项初筛明细", "受控验证任务", "读法与边界"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "current_codex_bid_screening.xlsx");
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, overviewCheck: overviewCheck.ndjson, formulaErrors: formulaErrors.ndjson, rows: source.length }, null, 2));
