import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = process.env.CAREER_ROOT;
const outputDir = process.env.CURRENT_CODEX_CB01_OUTPUT_DIR;
const renderDir = process.env.CURRENT_CODEX_CB01_RENDER_DIR;
if (!root || !outputDir || !renderDir) throw new Error("CAREER_ROOT, CURRENT_CODEX_CB01_OUTPUT_DIR and CURRENT_CODEX_CB01_RENDER_DIR are required.");

const pack = JSON.parse(await fs.readFile(path.join(root, "skill-library", "current_codex_cb01_trial.json"), "utf8"));
const workbook = Workbook.create();
const font = "Arial";
const c = { ink: "#2B2527", muted: "#6F6362", plum: "#33272A", rose: "#B87062", sage: "#2F6957", gold: "#7A5D19", paper: "#FBF8F5", line: "#E1D8D3", white: "#FFFFFF", paleGold: "#FFF8DF", paleGreen: "#EEF8F3" };

function title(sheet, heading, subtitle, end) {
  sheet.getRange(`A2:${end}2`).merge(); sheet.getRange("A2").values = [[heading]];
  sheet.getRange("A2").format = { font: { name: font, size: 16, bold: true, color: c.ink }, verticalAlignment: "center" };
  sheet.getRange(`A3:${end}3`).merge(); sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: font, size: 10, italic: true, color: c.muted }, verticalAlignment: "center", wrapText: true };
}
function header(range) { range.format = { fill: c.plum, font: { name: font, size: 10, bold: true, color: c.white }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true, borders: { preset: "all", style: "thin", color: c.white } }; }
function body(range) { range.format = { font: { name: font, size: 10, color: c.ink }, verticalAlignment: "top", wrapText: true, borders: { preset: "inside", style: "thin", color: c.line } }; }
function widths(sheet, values) { values.forEach((width, index) => { sheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; }); }

const overview = workbook.worksheets.add("试跑总览");
overview.showGridLines = false; overview.tabColor = c.plum;
title(overview, "CB01-C01D：产品与经营选项分析受控试跑", "状态：准备完成，待指定独立复核人，尚未启动。所有输入为完全合成数据。", "H");
overview.getRange("A5:D5").values = [["候选", "竞聘站位", "当前状态", "原有准备度"]];
overview.getRange("A6:D6").values = [[pack.candidate.skill, pack.position.name, pack.state, pack.candidate.existing_readiness]];
header(overview.getRange("A5:D5")); body(overview.getRange("A6:D6"));
overview.getRange("A8:H8").merge(); overview.getRange("A8").values = [[pack.status_explanation]];
overview.getRange("A8").format = { fill: c.paleGold, font: { name: font, size: 10, color: c.gold }, verticalAlignment: "center", wrapText: true, borders: { preset: "outside", style: "thin", color: "#EADC99" } };
overview.getRange("A10:H10").merge(); overview.getRange("A10").values = [[pack.fixture.decision_question]];
overview.getRange("A10").format = { fill: c.paper, font: { name: font, size: 12, bold: true, color: c.ink }, verticalAlignment: "center", wrapText: true };
overview.getRange("A12:F12").values = [["为什么是本候选", "", "", "", "", ""]]; overview.getRange("A12:F12").merge(); header(overview.getRange("A12:F12"));
overview.getRange("A13:F15").merge(); overview.getRange("A13").values = [[pack.selection_reason.map((entry, index) => `${index + 1}. ${entry}`).join("\n\n")]];
body(overview.getRange("A13:F15"));
overview.getRange("A17:F17").values = [["下一道硬门槛", "", "", "", "", ""]]; overview.getRange("A17:F17").merge(); header(overview.getRange("A17:F17"));
overview.getRange("A18:F18").values = [[pack.next_gate, "", "", "", "", ""]]; overview.getRange("A18:F18").merge(); body(overview.getRange("A18:F18"));
widths(overview, [28, 28, 38, 24, 24, 24, 24, 24]);
overview.getRange("A2:H2").format.rowHeight = 30; overview.getRange("A3:H3").format.rowHeight = 28; overview.getRange("A5:D5").format.rowHeight = 28; overview.getRange("A6:D6").format.rowHeight = 54; overview.getRange("A8:H8").format.rowHeight = 42; overview.getRange("A10:H10").format.rowHeight = 46; overview.getRange("A13:F15").format.rowHeight = 44; overview.getRange("A18:F18").format.rowHeight = 44;

const task = workbook.worksheets.add("候选任务包");
task.showGridLines = false; task.tabColor = c.rose;
title(task, "固定任务包：A / B / N 经营选项比较", "候选只能使用本页合成输入，不能补造外部来源或把虚构数据写成真实事实。", "H");
task.getRange("A5:H5").merge(); task.getRange("A5").values = [[pack.fixture.classification]]; task.getRange("A5").format = { fill: c.paleGold, font: { name: font, size: 10, bold: true, color: c.gold }, verticalAlignment: "center", wrapText: true };
task.getRange("A7:F7").values = [["选项", "价值假设", "价格", "单位成本", "履约", "毛利假设"]]; header(task.getRange("A7:F7"));
task.getRange("A8:F10").values = pack.fixture.decision_options.map((option) => [option.option + " · " + option.name, option.customer_value_hypothesis, option.economics.proposed_price_usd, option.economics.estimated_unit_cost_usd, option.economics.estimated_fulfillment_usd, option.economics.gross_margin_before_marketing]); body(task.getRange("A8:F10"));
task.getRange("A12:C12").values = [["选项", "兑现条件", "已知风险"]]; header(task.getRange("A12:C12"));
task.getRange("A13:C15").values = pack.fixture.decision_options.map((option) => [option.option + " · " + option.name, option.delivery_condition, option.known_risk]); body(task.getRange("A13:C15"));
task.getRange("A17:E17").values = [["证据", "类型", "覆盖", "可用观察", "限制"]]; header(task.getRange("A17:E17"));
task.getRange(`A18:E${17 + pack.fixture.evidence.length}`).values = pack.fixture.evidence.map((evidence) => [evidence.id, evidence.type, evidence.coverage, evidence.finding, evidence.limit]); body(task.getRange(`A18:E${17 + pack.fixture.evidence.length}`));
widths(task, [27, 44, 17, 17, 17, 22, 32, 32]);
task.getRange("A2:H2").format.rowHeight = 30; task.getRange("A3:H3").format.rowHeight = 28; task.getRange("A5:H5").format.rowHeight = 34; task.getRange("A7:F7").format.rowHeight = 30; task.getRange("A8:F10").format.rowHeight = 74; task.getRange("A12:C12").format.rowHeight = 30; task.getRange("A13:C15").format.rowHeight = 74; task.getRange("A17:E17").format.rowHeight = 30; task.getRange(`A18:E${17 + pack.fixture.evidence.length}`).format.rowHeight = 88; task.freezePanes.freezeRows(7);

const review = workbook.worksheets.add("独立复核表");
review.showGridLines = false; review.tabColor = c.sage;
title(review, "独立复核：评分前先确认角色分离", "评分格保持空白。任务包设计者、候选提交人与独立复核人必须相互分离。", "F");
review.getRange("A5:C5").values = [["硬门槛", "状态", "复核说明"]]; header(review.getRange("A5:C5"));
review.getRange(`A6:C${5 + pack.hard_gates.length}`).values = pack.hard_gates.map((gate) => [gate, "待独立复核", ""]); body(review.getRange(`A6:C${5 + pack.hard_gates.length}`));
const start = 8 + pack.hard_gates.length;
review.getRange(`A${start}:D${start}`).values = [["评分维度", "满分", "独立评分", "复核证据与缺口"]]; header(review.getRange(`A${start}:D${start}`));
review.getRange(`A${start + 1}:D${start + pack.rubric.length}`).values = pack.rubric.map((row) => [row.dimension, row.max_score, "", row.look_for]); body(review.getRange(`A${start + 1}:D${start + pack.rubric.length}`));
review.getRange(`A${start + pack.rubric.length + 2}:D${start + pack.rubric.length + 2}`).merge(); review.getRange(`A${start + pack.rubric.length + 2}`).values = [["裁决只能填写“交付结构达到受控门槛 / 未达到受控门槛 / UNVERIFIABLE”。不得据此得出真实经营结论。"]]; review.getRange(`A${start + pack.rubric.length + 2}`).format = { fill: c.paleGold, font: { name: font, size: 10, color: c.gold }, verticalAlignment: "center", wrapText: true };
widths(review, [42, 16, 20, 68, 20, 20]);
review.getRange("A2:F2").format.rowHeight = 30; review.getRange("A3:F3").format.rowHeight = 28; review.getRange("A5:C5").format.rowHeight = 30; review.getRange(`A6:C${5 + pack.hard_gates.length}`).format.rowHeight = 48; review.getRange(`A${start}:D${start}`).format.rowHeight = 30; review.getRange(`A${start + 1}:D${start + pack.rubric.length}`).format.rowHeight = 56; review.getRange(`A${start + pack.rubric.length + 2}:D${start + pack.rubric.length + 2}`).format.rowHeight = 42;

const boundary = workbook.worksheets.add("边界与角色");
boundary.showGridLines = false; boundary.tabColor = c.gold;
title(boundary, "边界与角色分离", "本页确保“任务准备”不会被读成“已经竞聘、已经通过或可以做真实业务”。", "C");
boundary.getRange("A5:C5").values = [["角色", "负责什么", "不能做什么"]]; header(boundary.getRange("A5:C5"));
boundary.getRange(`A6:C${5 + pack.role_separation.length}`).values = pack.role_separation.map((role) => [role.role, role.must_do, role.must_not]); body(boundary.getRange(`A6:C${5 + pack.role_separation.length}`));
boundary.getRange("A11:C11").values = [["本页不作出的结论", "", ""]]; boundary.getRange("A11:C11").merge(); header(boundary.getRange("A11:C11"));
boundary.getRange(`A12:C${11 + pack.non_conclusions.length}`).merge(); boundary.getRange("A12").values = [[pack.non_conclusions.map((conclusion) => `- ${conclusion}`).join("\n\n")]]; body(boundary.getRange(`A12:C${11 + pack.non_conclusions.length}`));
widths(boundary, [26, 58, 58]); boundary.getRange("A2:C2").format.rowHeight = 30; boundary.getRange("A3:C3").format.rowHeight = 28; boundary.getRange("A5:C5").format.rowHeight = 30; boundary.getRange("A6:C8").format.rowHeight = 64; boundary.getRange("A11:C11").format.rowHeight = 30; boundary.getRange(`A12:C${11 + pack.non_conclusions.length}`).format.rowHeight = 50;

workbook.recalculate();
const overviewCheck = await workbook.inspect({ kind: "table", range: "试跑总览!A5:D18", include: "values,formulas", tableMaxRows: 18, tableMaxCols: 4 });
const formulaErrors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 100 }, summary: "formula scan" });
await fs.mkdir(renderDir, { recursive: true });
for (const sheetName of ["试跑总览", "候选任务包", "独立复核表", "边界与角色"]) {
  const image = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(renderDir, `${sheetName}.png`), new Uint8Array(await image.arrayBuffer()));
}
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "current_codex_cb01_product_business_analysis_trial.xlsx");
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, overviewCheck: overviewCheck.ndjson, formulaErrors: formulaErrors.ndjson }, null, 2));
