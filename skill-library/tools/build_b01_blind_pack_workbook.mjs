import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT || process.cwd();
const packRoot = path.join(root, "skill-library", "blind-tests", "b01_blind_test_v1");
const outputDir = process.env.B01_BLIND_OUTPUT_DIR || path.join(root, "skill-library", "outputs", "2026-09-23-b01-blind-pack");
const renderDir = path.join(outputDir, "renders");
const inputs = JSON.parse(await fs.readFile(path.join(packRoot, "inputs", "b01_blind_test_inputs.json"), "utf8"));
const manifest = JSON.parse(await fs.readFile(path.join(packRoot, "b01_blind_test_manifest.json"), "utf8"));

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

function setTitle(sheet, title, subtitle, endColumn) {
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = { font: { name: font, size: 15, bold: true, color: colors.ink } };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: font, size: 10, italic: true, color: colors.muted }, wrapText: true };
  sheet.getRange(`A4:${endColumn}4`).format.borders = { bottom: { style: "thin", color: colors.rose } };
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

// Every formula target exists before formulas are added.
const summary = workbook.worksheets.add("盲测执行总览");
const inputsSheet = workbook.worksheets.add("盲测输入目录");
const scoring = workbook.worksheets.add("评分与关卡");
const log = workbook.worksheets.add("执行登记");

for (const sheet of [summary, inputsSheet, scoring, log]) sheet.showGridLines = false;
summary.tabColor = colors.rose;
inputsSheet.tabColor = colors.sage;
scoring.tabColor = colors.gold;
log.tabColor = colors.ink;

setTitle(summary, "B01 独立盲测执行包", "当前状态：待独立评审。此表帮助交接和记录，不展示金标，也不产生盲测结论。", "E");
summary.getRange("A5:E5").values = [["关键项", "当前状态", "数量或门槛", "业务含义", "下一步"]];
styleHeader(summary.getRange("A5:E5"));
summary.getRange("A6:E12").values = [
  ["盲测协议", manifest.protocol_id, "固定", "只检查 D01/D02 在独立合成输入上的语义与规则边界。", "按协议执行，不改写输入或门槛。"],
  ["D01 合成评论", "已准备", "=COUNTIFS('盲测输入目录'!B6:B93,\"D01\")", "检验方面、局部情感、转折和未知主题是否保留。", "由独立执行人逐条运行候选。"],
  ["D02 合成搜索表达", "已准备", "=COUNTIFS('盲测输入目录'!B6:B93,\"D02\")", "检验意图优先级、问题边界和机会规则阈值。", "由独立执行人逐条运行候选。"],
  ["拟议金标", "待独立复核并锁定", "未展示", "金标不能由当前实现或原有标签设计者自行确认。", "独立复核后登记指纹和锁定时间。"],
  ["候选输出", "待独立执行", "必须覆盖全部输入", "没有逐条 ID 与候选版本指纹的结果不可评分。", "使用提交模板填写完整输出。"],
  ["脚本评分", "待独立复核", "D01/D02 语义至少 90%；D02 规则 100%", "评分通过只说明下一步可以设计真实样本数据合同。", "锁定金标后运行评分脚本。"],
  ["真实样本", "未授权", "0 条", "本包全部为合成数据，不能替代消费者证据。", "盲测通过后另行设计数据合同。"],
];
styleTable(summary.getRange("A6:E12"));
summary.getRange("C7:C8").formulas = [
  ["=COUNTIFS('盲测输入目录'!B6:B93,\"D01\")"],
  ["=COUNTIFS('盲测输入目录'!B6:B93,\"D02\")"],
];
summary.getRange("C7:C8").format = { fill: colors.sageLight, font: { name: font, size: 10, bold: true, color: colors.sage }, horizontalAlignment: "center", verticalAlignment: "center" };
summary.getRange("B9:B12").format = { fill: colors.goldLight, font: { name: font, size: 10, bold: true, color: colors.gold }, verticalAlignment: "center", wrapText: true };
summary.getRange("B12").format = { fill: colors.redLight, font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "center", wrapText: true };
summary.getRange("A14:E14").values = [["本轮明确边界", "不接入真实数据；不做消费者、市场、经营或任命结论。", "", "", ""]];
summary.getRange("A14:E14").format = { fill: colors.redLight, font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#E8B9B4" } };
summary.getRange("A16:E16").values = [["使用提示", "金标和锁定记录不应在执行人可访问的交接视图中展开。当前本地文件夹无技术隔离，独立性依赖实际交接、角色分离与执行记录。", "", "", ""]];
summary.getRange("A16:E16").format = { fill: colors.roseLight, font: { name: font, size: 10, bold: true, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: colors.rose } };
setWidths(summary, [23, 31, 24, 55, 40]);
summary.getRange("A3:E3").format.rowHeight = 46;
summary.getRange("A5:E5").format.rowHeight = 30;
summary.getRange("A6:E12").format.rowHeight = 46;
summary.getRange("A14:E14").format.rowHeight = 48;
summary.getRange("A16:E16").format.rowHeight = 50;

setTitle(inputsSheet, "B01 盲测输入目录", "仅展示合成输入与覆盖设计。预期标签位于独立金标文件，不写入本工作簿。", "H");
inputsSheet.getRange("A5:H5").values = [["记录 ID", "试题类型", "覆盖维度", "检查重点", "输入文本", "月份", "合成量级", "点击代理"]];
styleHeader(inputsSheet.getRange("A5:H5"));
const d01Rows = inputs.reviews.map((item) => [item.record_id, item.input_type, item.coverage_family, item.challenge, item.text, "", "", ""]);
const d02Rows = inputs.search_signals.map((item) => [item.record_id, item.input_type, item.coverage_family, item.challenge, item.query, item.month, item.volume_proxy, item.click_proxy]);
const inputRows = [...d01Rows, ...d02Rows];
inputsSheet.getRange(`A6:H${5 + inputRows.length}`).values = inputRows;
styleTable(inputsSheet.getRange(`A6:H${5 + inputRows.length}`));
inputsSheet.getRange(`G${6 + d01Rows.length}:G${5 + inputRows.length}`).format.numberFormat = "#,##0";
inputsSheet.getRange(`H${6 + d01Rows.length}:H${5 + inputRows.length}`).format.numberFormat = "0%";
inputsSheet.getRange(`A${6 + d01Rows.length}:H${6 + d01Rows.length}`).format.borders = { top: { style: "medium", color: colors.rose } };
inputsSheet.getRange(`A${6 + d01Rows.length}:H${6 + d01Rows.length}`).format.fill = "#FFF9F5";
inputsSheet.getRange(`A${7 + inputRows.length}:H${7 + inputRows.length}`).values = [["输入边界", "全量合成", "不含金标", "不能读取为真实消费者或经营数据", "未知主题、反例和阈值边界都被保留，避免只用易命中样本。", "", "", ""]];
inputsSheet.getRange(`A${7 + inputRows.length}:H${7 + inputRows.length}`).format = { fill: colors.roseLight, font: { name: font, size: 10, bold: true, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: colors.rose } };
setWidths(inputsSheet, [12, 11, 18, 22, 66, 12, 13, 12]);
inputsSheet.getRange("A3:H3").format.rowHeight = 30;
inputsSheet.getRange("A5:H5").format.rowHeight = 32;
inputsSheet.getRange(`A6:H${5 + inputRows.length}`).format.rowHeight = 42;
inputsSheet.getRange(`A${7 + inputRows.length}:H${7 + inputRows.length}`).format.rowHeight = 44;
inputsSheet.freezePanes.freezeRows(5);

setTitle(scoring, "评分与硬门槛", "评分前先检查角色分离、金标锁定、输入完整性与候选版本指纹；任一缺失都应拒绝评分。", "D");
scoring.getRange("A5:D5").values = [["检查项", "通过标准", "为什么要检查", "未通过时"]];
styleHeader(scoring.getRange("A5:D5"));
scoring.getRange("A6:D12").values = [
  ["独立金标锁定", "金标指纹、独立复核责任、锁定时间齐全", "防止实现者或原有标签设计者在看见候选结果后改标。", "拒绝评分，回到独立复核。"],
  ["D01 覆盖完整性", "48 条输入逐条返回 ID 与方面/情感输出", "缺记录会把未表现当作未出错。", "拒绝评分，重新提交。"],
  ["D01 精确匹配", "至少 90%", "检验局部方面、情感和未知主题是否稳定。", "回到候选修复。"],
  ["D02 覆盖完整性", "40 条输入逐条返回 ID、意图、情感与规则命中", "确保结果可回到原始输入和候选版本。", "拒绝评分，重新提交。"],
  ["D02 语义精确匹配", "至少 90%", "检验比较、问题、功能、导航与属性边界。", "回到候选修复。"],
  ["D02 规则边界", "100%", "机会规则不能静默跨过问题意图、负面表达或量级门槛。", "回到候选修复。"],
  ["通过后的下一步", "只可设计真实样本数据合同", "盲测不是数据授权，也不是经营决定。", "不得直接接入真实数据。"],
];
styleTable(scoring.getRange("A6:D12"));
scoring.getRange("A14:D14").values = [["评分脚本的硬拒绝条件", "没有 gold_label_lock.json、指纹不一致、角色/时间缺失、输入或输出记录集合不完整。", "", ""]];
scoring.getRange("A14:D14").format = { fill: colors.redLight, font: { name: font, size: 10, bold: true, color: colors.red }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: "#E8B9B4" } };
setWidths(scoring, [25, 33, 54, 28]);
scoring.getRange("A3:D3").format.rowHeight = 30;
scoring.getRange("A5:D5").format.rowHeight = 30;
scoring.getRange("A6:D12").format.rowHeight = 48;
scoring.getRange("A14:D14").format.rowHeight = 44;

setTitle(log, "独立盲测执行登记", "本页用于记录实际交接。空白表示尚未完成，不可补写为通过。", "F");
log.getRange("A5:F5").values = [["步骤", "责任角色", "完成时间", "证据或文件指纹", "状态", "复核结论"]];
styleHeader(log.getRange("A5:F5"));
log.getRange("A6:F10").values = [
  ["复核并锁定金标", "独立标注复核", "", "gold_label_lock.json", "待独立评审", ""],
  ["核对候选版本", "独立执行", "", "D01/D02 SHA-256", "待独立执行", ""],
  ["运行并提交逐条输出", "独立执行", "", "独立提交 JSON", "待独立执行", ""],
  ["运行评分与复核结果", "结果复核", "", "b01_blind_evaluation_result.json", "待独立复核", ""],
  ["设计真实样本数据合同", "有权责任方与数据责任方", "", "合同或批准记录", "未开始", "不得接入真实数据"],
];
styleTable(log.getRange("A6:F10"));
log.getRange("E6:E10").conditionalFormats.add("containsText", { text: "待", format: { fill: colors.goldLight, font: { bold: true, color: colors.gold } } });
log.getRange("E6:E10").conditionalFormats.add("containsText", { text: "未开始", format: { fill: colors.redLight, font: { bold: true, color: colors.red } } });
log.getRange("A12:F12").values = [["记录原则", "角色分离、完成时间、版本指纹和结果复核都需要留痕；没有记录的步骤视为未完成。", "", "", "", ""]];
log.getRange("A12:F12").format = { fill: colors.roseLight, font: { name: font, size: 10, bold: true, color: colors.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "outside", style: "thin", color: colors.rose } };
setWidths(log, [29, 26, 18, 38, 18, 38]);
log.getRange("A3:F3").format.rowHeight = 30;
log.getRange("A5:F5").format.rowHeight = 30;
log.getRange("A6:F10").format.rowHeight = 42;
log.getRange("A12:F12").format.rowHeight = 42;
log.freezePanes.freezeRows(5);

workbook.recalculate();
const inspection = await workbook.inspect({ kind: "workbook,sheet,table", maxChars: 5000, tableMaxRows: 6, tableMaxCols: 8 });
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 200 }, summary: "formula error scan" });
if (String(errors).match(/#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/)) {
  throw new Error(`Formula error scan failed: ${errors}`);
}
for (const sheetName of ["盲测执行总览", "盲测输入目录", "评分与关卡", "执行登记"]) {
  const image = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await image.arrayBuffer()));
}
const outputPath = path.join(outputDir, "b01_blind_test_execution_pack.xlsx");
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, inspection: String(inspection).slice(0, 800), errorScan: String(errors).slice(0, 500) }, null, 2));
