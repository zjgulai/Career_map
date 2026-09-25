---
name: xlsx
description: >-
  Comprehensive spreadsheet creation, editing, and analysis. Use when working with spreadsheets (.xlsx, .xlsm, .xls, .csv, .tsv, etc) for: (1) Creating new spreadsheets, (2) Modify existing spreadsheets while preserving formulas, (3) Data analysis and visualization in spreadsheets, or any other spreadsheet tasks
enabled: true
---

# XLSX creation, editing, and analysis

You build spreadsheets with **raw Python (openpyxl / pandas)**. You own every styling decision, so you can make each workbook look purpose-built rather than templated. The sections below are the quality bar: meet it, but vary your typography, palette, and layout to fit the content. Two production-grade reference snippets show the mechanics — adapt them, don't copy them verbatim.

## Tool choice

| Tool | Use for |
|---|---|
| **pandas** | Reading, analysis, bulk transforms, simple CSV→xlsx export. `read_excel` defaults to `sheet_name=0` (first sheet only, no warning) — pass `sheet_name=None` for multi-sheet files |
| **openpyxl** | Formulas, cell-level formatting, charts, conditional formatting, editing existing files. Cannot open `.xls` |

openpyxl is the engine for every deliverable: it is the only library that both **writes and edits** workbooks while preserving formulas. Use pandas to prepare data, then hand the values to openpyxl for formatting.

Note:
**Legacy `.xls`**: read-only analysis → `pd.read_excel(path, sheet_name=None)`. Editing/modification → First convert to `.xlsx` using the `xls_to_xlsx.py` script, and then work on the `.xlsx` with openpyxl as usual:
```bash
python "{skillDir}/scripts/xls_to_xlsx.py" input.xls output.xlsx
```

## Non-negotiables

1. **Zero formula errors.** Every model ships with no `#REF! #DIV/0! #VALUE! #N/A #NAME?`. Guard denominators; verify cross-sheet refs (`Sheet1!A1`).
2. **Formulas, not baked numbers.** Write `=SUM(B2:B9)`, never compute in Python and hardcode the result. Applies to all totals, ratios, %, deltas. Keeps the workbook live.
   ```python
   sheet['B10'] = '=SUM(B2:B9)'      # ✅  Excel evaluates
   sheet['B10'] = df['Sales'].sum()  # ❌  bakes in a dead number
   ```
3. **CJK-capable font, set as the workbook default.** openpyxl's default Calibri has no Chinese glyphs.
   ```python
   from openpyxl.styles import Font
   wb._named_styles['Normal'].font = Font(name='Microsoft YaHei', size=12)
   ```
4. **Run the QA pipeline before delivery** (see [Mandatory QA](#mandatory-qa)).
5. **When editing an existing file, match its conventions** — its style always overrides this guide. Never load with `data_only=True` if you will save back (it destroys formulas).

## Workflow — creating a new workbook

Follow this order; each step has its own section below.

1. **Design the theme** — colors, font, type scale (see Design system). Define them as constants first.
2. **Plan the structure** — choose a sheet skeleton and lay out tables/charts (see Workbook structure).
3. **Build tables & charts** — write data, formulas, and styling. Every deliverable table and chart MUST meet the [Table quality bar](#table-quality-bar) and [Chart quality bar](#chart-quality-bar); adapt the [reference snippets](#reference-styled-table) for the mechanics.
4. **Save, then verify** — run the QA pipeline (recalc + structural lint) and fix everything it flags before delivery.

## Design system — design one first, never default

**Before writing any cell, design a cohesive theme for this workbook** to fit the content and audience (a board memo, a growth deck, and a legal exhibit should NOT look alike), then apply it everywhere. Never ship the openpyxl defaults (Calibri, black gridlines, no fills) — that is the "data dump" look you are avoiding.

Decide colors for these surfaces, then use them where the *data* calls for it:
- **Header** fill + text · **alternate-row** band tint · **chart series** palette (≤8, one family)
- **Font color** to encode meaning (e.g. negatives, gains, KPIs, secondary values)
- **Cell fill** to flag totals / inputs / status / sections
- **Sheet tab color** (`ws.sheet_properties.tabColor`) to orient multi-sheet books
- **Borders / accents** for titles, key columns, result blocks

Define these as constants at the top of your script and reference them so every table, chart, and tab share one identity. The reference snippets below show this constants-first pattern; substitute your own designed values.

## Table quality bar

Apply every row of this checklist to deliverable tables. A "data dump" fails most of these — that is the gap you are closing.

| Aspect | Requirement |
|---|---|
| **Header** | Bold + white text on the theme's solid header fill; centered; thin border; slightly larger than body. Never leave a header naked. |
| **Type size** | Use a comfortable, readable body size; don't ship tiny cramped text. |
| **Banding** | Alternate data rows with the light band tint. Big readability win on ≥6 rows. |
| **Semantic color** | Where the data has meaning, encode it: red font for negatives, a fill on the total/subtotal row, accent on a key column. Prefer conditional formatting so it tracks live values. |
| **Sheet tab** | Set `ws.sheet_properties.tabColor` by role so multi-sheet books are navigable. |
| **Borders** | Thin theme-border (`BFBFBF`-ish) around data cells; a `double` top border on a total row. |
| **Number formats** | Apply per-column from the [Number formats](#number-formats) table. Right-aligned numerics. Consistent decimals within a column. |
| **Units** | State units in the header text — `Revenue ($mm)`, `Margin (%)`, not bare `Revenue`. Charts reuse the header as the legend label. |
| **Column width** | Size to longest cell. Estimate width counting CJK chars as 2, ASCII as 1; clamp ~10–50. |
| **Title banner** | For a section/sheet title, merge a row across the table width above the header with the header fill — do **not** drop a title into one un-merged cell. |
| **Totals** | Append a `=SUM(...)` row over numeric columns when it aids reading; bold it. |
| **Freeze panes** | Freeze the header once data exceeds ~15 rows; also freeze col A when ≥8 cols and col A is a text label. Small tables: no freeze. |
| **Layout** | One table starts at `A1`; no stray blank leading rows/cols. Use banner rows, not blank spacers. |

**Optional emphasis layers** (for cross-comparison grids — margin matrices, KPI scorecards, scenario tables; skip for plain dumps):
- **Conditional formatting** (`openpyxl.formatting.rule`) so emphasis follows live data: `CellIsRule` (threshold text/fill — red for negatives), `DataBarRule` (in-cell bars), `ColorScaleRule` (heatmap), `IconSetRule` (directional icons).
- **Column-group tints** — tint contiguous business sections with soft pastel fills (re-apply banding inside each group, ~6% darker) so the grid reads as sections.
- **Column separators** — a `medium` right border at section boundaries.

## Number formats

Use consistent format strings. Finance forms include red-negative-in-parens and zero-as-dash; `simple_*` forms drop those.

| Purpose | Format string |
|---|---|
| Integer | `#,##0;[Red](#,##0);"-"` |
| 1-dp / 2-dp decimal | `#,##0.0;[Red](#,##0.0);"-"` · `#,##0.00;[Red](#,##0.00);"-"` |
| Dollars / + cents | `$#,##0;[Red]($#,##0);"-"` · `$#,##0.00;[Red]($#,##0.00);"-"` |
| Percent 0 / 1 / 2-dp | `0%;[Red](0%);"-"` · `0.0%;[Red](0.0%);"-"` · `0.00%;[Red](0.00%);"-"` |
| Multiple (12.5x) | `0.0"x"` |
| Dates | `yyyy-mm-dd` · `mm/dd/yyyy` · `"Q"q yyyy` · `mmm yyyy` |
| Year as text (no comma) | `0` |
| Force text (keep leading zeros) | `@` |
| Simple (no neg-paren/dash) | `#,##0` · `#,##0.00` · `$#,##0` · `0.0%` |

```python
ws['B2'].number_format = '$#,##0;[Red]($#,##0);"-"'
ws['C2'].number_format = '0.0%;[Red](0.0%);"-"'
```

## Chart quality bar

Raw openpyxl charts default to a 2007-era look (heavy navy gridlines, blank X-axis, legend on top of bars). The [reference snippet](#reference-clean-chart) bakes in correct defaults — every item below is required:

| Item | Requirement | Why |
|---|---|---|
| **Categories** | Set **inline `strLit`** categories, not a `numRef` to text cells. | A `numRef` pointing at text labels (e.g. "2024 Q2") renders a **blank X-axis** in macOS Excel / WPS / Numbers. This is the #1 silent chart defect. |
| **varyColors** | `chart.varyColors = False` | Otherwise a single series is rainbow-colored and the legend lists categories. |
| **Series** | One series per column/row — never one series per data point. Keep ≤8 series. | Per-point series → unreadable legend. |
| **Palette** | Color series from your theme palette via `series.graphicalProperties`. | Cohesion with the table. |
| **Title** | Explicit `Title` object with `overlay=False`; put **units** here (e.g. "Revenue ($mm)"). | The `chart.title="str"` shortcut omits `<overlay>` → title floats over the plot. |
| **Legend** | `legend.position` `b`/`r`; `legend.overlay = False`. Let Excel auto-place (no manual layout). | Manual layout clips multi-row legends into the plot. |
| **Gridlines** | Y-axis: light grey (`CCCCCC`) **dashed**, ~0.75pt. Hide X-axis gridlines. | Heavy default grid screams "Python dump". |
| **Y-axis** | Set `number_format`; set explicit `scaling.min/max` + a "nice" `majorUnit` (1/2/2.5/5 ×10ⁿ). | Naked axis → sparse/ugly ticks. |
| **Y-axis baseline** | `0` for magnitudes (revenue, count) so bars compare fairly; **tight** range for %/ratio/index/price (else swings flatten). Combo: primary at 0, secondary tight. | Honest, readable scale. |
| **Axis titles** | Leave **off**; encode units in the chart title. | Bottom legend + axis title collide. |
| **CJK font** | Stamp the CJK font on title/legend/axis text (`defRPr` `latin` + `ea`). | Chinese chart text otherwise renders as boxes. |
| **Frame** | `chart.roundedCorners = False`; subtle grey border (`C8CDD3`, 0.75pt); white background. | Square, intentional frame vs. clip-art corners. |
| **Consistency** | Same `(width, height)` for every chart on a sheet (within 30%). | Visual harmony. |
| **Placement** | Anchor charts in a dedicated empty zone — right of data or below all data. Convert size to a row/col span first, then arrange the charts without overlap. Never guess offsets from the data table layout. | Charts covering cell contents or each other look broken. |

**Chart kind:** `clustered_bar` (compare few series across categories) · `stacked_bar` (part-to-whole) · `line` (trend over time) · `area` (cumulative/composition) · combo bar+line on a secondary axis (mixed magnitude + rate, e.g. revenue + margin%).

## Workbook structure

For non-trivial work, pick a skeleton up front — don't cram everything into one sheet.

| Skeleton | Sheets (in order) |
|---|---|
| Data export | `Data` |
| Dashboard report | `README`, `Dashboard`, `Data` |
| Analysis model | `README`, `Inputs`, `Calc`, `Output`, `Sources` |
| Audit / reconciliation | `README`, `Source_A`, `Source_B`, `Variance`, `Notes` |

Conventions: 
- `README` carries purpose / date / legend / owner.
- Cite every hardcoded number in `Sources`/`Notes`.
- Hide scratch sheets (`ws.sheet_state='hidden'`) instead of deleting.
- Put a `Dashboard` first (`wb.move_sheet(ws, offset=-len(wb.sheetnames))`).
- Color sheet tabs by role (`ws.sheet_properties.tabColor`) — e.g. header hue for dashboards/outputs, a warm tone for inputs, grey for raw/scratch.
- Style text-heavy sheets (README, Sources) with the same theme so they don't look broken next to data.
- These are starting points — split or merge as needed.

## Mandatory QA

Run after saving — each pass catches a different defect class; do not skip.

1. **Recalc formulas** (if any formulas exist):
   ```bash
   python "{skillDir}/scripts/recalc.py" path/to/your.xlsx
   # If soffice is missing → fallback (sets fullCalcOnLoad, preserves formulas):
   python "{skillDir}/scripts/recalc_fallback.py" path/to/your.xlsx
   ```
   If `status` is `errors_found`, fix the cells in `error_summary` and re-run. Never "fix" by overwriting a formula with a literal.
2. **Structural lint** — must reach **0 errors** before delivery:
   ```bash
   python "{skillDir}/scripts/verify_workbook.py" path/to/your.xlsx
   ```
   Catches what recalc can't: blank-X-axis category refs, per-point series, naked/heavy gridlines, unscaled y-axis, unstyled headers, missing freeze panes, non-CJK default font, off-library number formats. Treat warnings as fix-list items, not noise.

Before scaling formulas, sanity-check 2–3 references first (col 64 = `BL`; DataFrame row 5 = Excel row 6 with a header).

## Reference: styled table

Adapt freely — change palette, formats, emphasis to fit the data. This is the mechanism, not a mandate.

```python
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# --- theme: replace these with the values YOU designed for this workbook ---
FONT, HEADER_FILL, HEADER_TXT, BAND, BORDER = 'Microsoft YaHei', '1F3864', 'FFFFFF', 'F2F2F2', 'BFBFBF'
FMT = {'Revenue ($mm)': '$#,##0;[Red]($#,##0);"-"', 'Margin (%)': '0.0%;[Red](0.0%);"-"'}

wb = Workbook()
wb._named_styles['Normal'].font = Font(name=FONT, size=12)   # CJK default, readable body
ws = wb.active; ws.title = 'Data'
ws.sheet_properties.tabColor = HEADER_FILL                  # color the sheet tab by role
df = pd.DataFrame({'Quarter': ['2024 Q1','2024 Q2','2024 Q3','2024 Q4'],
                   'Revenue ($mm)': [120, 138, 151, 167], 'Margin (%)': [.18,.205,.221,.236]})

thin = Side(style='thin', color=BORDER)
border = Border(left=thin, right=thin, top=thin, bottom=thin)
header_font = Font(name=FONT, size=13, bold=True, color=HEADER_TXT)   # 1pt above body
header_fill = PatternFill('solid', start_color=HEADER_FILL)
band_fill   = PatternFill('solid', start_color=BAND)

cols = list(df.columns)
for j, name in enumerate(cols, 1):                            # header row
    c = ws.cell(1, j, name); c.font = header_font; c.fill = header_fill
    c.alignment = Alignment(horizontal='center', vertical='center'); c.border = border
for i, rec in enumerate(df.itertuples(index=False), start=2): # data rows + banding + formats
    for j, val in enumerate(rec, 1):
        c = ws.cell(i, j, val); c.border = border
        if (i % 2) == 1: c.fill = band_fill
        if cols[j-1] in FMT: c.number_format = FMT[cols[j-1]]
last = len(df) + 1
total_fill = PatternFill('solid', start_color=BAND)          # subtle fill marks the total row
tot = ws.cell(last + 1, 1, 'Total'); tot.font = Font(name=FONT, size=12, bold=True); tot.fill = total_fill
for j, name in enumerate(cols, 1):
    if name == 'Quarter': continue
    L = get_column_letter(j)
    c = ws.cell(last + 1, j, f'=SUM({L}2:{L}{last})')
    c.font = Font(name=FONT, size=12, bold=True); c.fill = total_fill
    c.number_format = FMT.get(name, '#,##0')
    c.border = Border(top=Side(style='double', color=HEADER_FILL), bottom=thin, left=thin, right=thin)
for j, name in enumerate(cols, 1):                            # auto width (CJK=2)
    width = max(sum(2 if ord(ch) > 127 else 1 for ch in str(v)) for v in [name, *df.iloc[:, j-1]])
    ws.column_dimensions[get_column_letter(j)].width = min(max(width + 2, 10), 50)
if len(df) >= 15: ws.freeze_panes = 'A2'                      # freeze header for tall tables
wb.save('output.xlsx')
```

## Reference: clean chart

Implements every row of the [Chart quality bar](#chart-quality-bar). The `strLit` categories and the explicit Title/frame are the parts most easily gotten wrong.

```python
from openpyxl.chart import BarChart, Reference
from openpyxl.chart.axis import ChartLines
from openpyxl.chart.data_source import AxDataSource, StrData, StrVal
from openpyxl.chart.shapes import GraphicalProperties
from openpyxl.chart.title import Title
from openpyxl.chart.text import RichText, Text
from openpyxl.chart.legend import Legend
from openpyxl.drawing.line import LineProperties
from openpyxl.drawing.text import (Paragraph, ParagraphProperties,
    CharacterProperties, RichTextProperties, RegularTextRun, Font as DFont)

PALETTE = ['1F3864', 'ED7D31', '70AD47', '5B9BD5']   # YOUR designed series palette (match the table)
CJK = 'Microsoft YaHei'
cats = ['2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4']  # the X labels (text)

ch = BarChart(); ch.type = 'col'; ch.grouping = 'clustered'
ch.varyColors = False; ch.gapWidth = 80
ch.add_data(Reference(ws, min_col=2, max_col=2, min_row=1, max_row=5), titles_from_data=True)

# 1) inline strLit categories — prevents the blank-X-axis bug
src = AxDataSource(strLit=StrData(ptCount=len(cats),
        pt=[StrVal(idx=i, v=v) for i, v in enumerate(cats)]))
for s in ch.series: s.cat = src
# 2) series palette
for i, s in enumerate(ch.series):
    s.graphicalProperties = GraphicalProperties(solidFill=PALETTE[i % len(PALETTE)])
# 3) title with overlay=False (units go here, not on an axis)
cp = CharacterProperties(sz=1600, b=True, latin=DFont(typeface=CJK), ea=DFont(typeface=CJK))
para = Paragraph(pPr=ParagraphProperties(defRPr=cp), r=[RegularTextRun(rPr=cp, t='Revenue ($mm)')])
ch.title = Title(tx=Text(rich=RichText(bodyPr=RichTextProperties(), p=[para]))); ch.title.overlay = False
# 4) legend, no overlay
ch.legend = Legend(); ch.legend.position = 'b'; ch.legend.overlay = False
# 5) y-axis: format, zero baseline for magnitudes, nice majorUnit
ch.y_axis.number_format = '#,##0'
ch.y_axis.scaling.min, ch.y_axis.scaling.max, ch.y_axis.majorUnit = 0, 200, 50
ch.y_axis.delete = False; ch.x_axis.delete = False; ch.x_axis.title = None; ch.y_axis.title = None
# 6) gridlines: light grey dashed on Y, none on X
ch.y_axis.majorGridlines = ChartLines(spPr=GraphicalProperties(
    ln=LineProperties(w=9525, solidFill='CCCCCC', prstDash='dash')))
ch.x_axis.majorGridlines = None
# 7) CJK font on axis text
axfont = RichText(bodyPr=RichTextProperties(), p=[Paragraph(
    pPr=ParagraphProperties(defRPr=CharacterProperties(sz=1100,
        latin=DFont(typeface=CJK), ea=DFont(typeface=CJK))), r=[])])
ch.x_axis.txPr = ch.y_axis.txPr = axfont
# 8) square white frame
ch.roundedCorners = False
ch.graphical_properties = GraphicalProperties(
    ln=LineProperties(w=9525, solidFill='C8CDD3'), solidFill='FFFFFF')
ch.width, ch.height = 19, 9.5                          # cm; keep equal across a sheet
ws.add_chart(ch, 'E2')
wb.save('output.xlsx')
```

For **combo bar+line**: build a `LineChart`, set `line.y_axis.axId = 200` and `line.y_axis.crosses = 'max'`, then `bar += line`; force the overlay's `y_axis.majorGridlines = None` (it otherwise serializes a heavy black grid). For **non-contiguous columns**, add each as its own `Reference`.

## Editing existing workbooks

```python
from openpyxl import load_workbook
wb = load_workbook('existing.xlsx')          # NOT data_only=True if saving back
ws = wb['SheetName']
ws['A1'] = 'New Value'
ws.insert_rows(2); ws.delete_cols(3)
wb.create_sheet('NewSheet')['A1'] = 'Data'
wb.save('modified.xlsx')
```
openpyxl is 1-based (`row=1, col=1` → A1). Saving a `data_only=True` workbook permanently destroys formulas. Use `read_only` / `write_only` for very large files. Apply the same table/chart quality bar to new content you add.

## Dependencies
- `pip install openpyxl` — core engine (formulas, formatting, charts).
- `pip install pandas` — read/analyze workflow.
- `pip install formulas` — used by `scripts/recalc_fallback.py` for static formula scanning when LibreOffice is absent.
- `pip install xlrd` — only for reading legacy `.xls` (xlrd ≥2.0 reads .xls exclusively, not .xlsx); used by `scripts/xls_to_xlsx.py`.

> **CN users:** add a mirror to avoid timeouts, e.g. `pip install openpyxl pandas formulas -i https://pypi.tuna.tsinghua.edu.cn/simple`
