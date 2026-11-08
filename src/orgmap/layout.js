// 纯布局函数：输入 graph 的 org/network，输出世界坐标。不碰 DOM、不碰 three。
// 坐标系：左上原点，x 向右、y 向下，板面 1600×1600（C-032 正方形）。

export const BOARD = 1600;
const MARGIN = 40;
const CELL_W = 110;
const CELL_H = 56;
const PAD = 12;
const LABEL_H = 30;
const BLOCK_GAP = 22;
const BAND_GAP = 30;
const MAX_W = BOARD - MARGIN * 2;
const BAND_TITLE_H = 46;

function packBlocks(blocks, maxWidth, gap) {
  const rows = [];
  let row = { items: [], w: 0, h: 0 };
  for (const b of blocks) {
    if (row.items.length && row.w + gap + b.w > maxWidth) {
      rows.push(row);
      row = { items: [], w: 0, h: 0 };
    }
    row.items.push(b);
    row.w += (row.items.length > 1 ? gap : 0) + b.w;
    row.h = Math.max(row.h, b.h);
  }
  if (row.items.length) rows.push(row);
  return rows;
}

export function layoutOrg(org, opt = {}) {
  // 可选尺寸包：不传时逐项等于原常量，工作视图输出不变；3D 办公场景传入厘米级尺寸复用同一算法。
  const CELL_W = opt.cellW ?? 110, CELL_H = opt.cellH ?? 56;
  const PAD = opt.pad ?? 12, LABEL_H = opt.labelH ?? 30;
  const BLOCK_GAP = opt.blockGap ?? 22, BAND_GAP = opt.bandGap ?? 30;
  const BAND_TITLE_H = opt.bandTitleH ?? 46, MARGIN = opt.margin ?? 40;
  const BOARD_SIZE = opt.board ?? BOARD;
  const MAX_W = opt.maxW ?? BOARD_SIZE - MARGIN * 2;
  const level1 = [...org.level1].sort((a, b) => b.seat_count - a.seat_count);
  const seatById = new Map(org.seats.map(s => [s.seat_id, s]));
  const groupsByLevel1 = new Map();
  for (const g of org.level2) {
    if (!groupsByLevel1.has(g.level1_id)) groupsByLevel1.set(g.level1_id, []);
    groupsByLevel1.get(g.level1_id).push(g);
  }

  const blocks = [];
  for (const l1 of level1) {
    const groups = (groupsByLevel1.get(l1.id) || []).sort((a, b) => b.seat_ids.length - a.seat_ids.length);
    for (const g of groups) {
      const cols = Math.min(4, g.seat_ids.length);
      const rows = Math.ceil(g.seat_ids.length / cols);
      const cells = Math.max(cols, 2);
      blocks.push({
        level1: l1.id, level1Name: l1.name,
        level2: g.id, level2Name: g.name,
        shared: g.shared_with.length,
        seats: g.seat_ids.map(id => seatById.get(id)).filter(Boolean),
        cols, rows, cells, offsetCells: (cells - cols) / 2,
        w: cells * CELL_W + PAD * 2,
        h: LABEL_H + rows * CELL_H + PAD * 2,
      });
    }
  }

  const seats = [];
  const blocksOut = [];
  const bands = [];
  let y = MARGIN;
  for (const l1 of level1) {
    const bandBlocks = blocks.filter(b => b.level1 === l1.id);
    if (!bandBlocks.length) continue;
    const rows = packBlocks(bandBlocks, MAX_W, BLOCK_GAP);
    const bandH = BAND_TITLE_H + rows.reduce((s, r) => s + r.h, 0) + (rows.length - 1) * BLOCK_GAP;
    bands.push({ id: l1.id, name: l1.name, x: MARGIN, y, w: MAX_W, h: bandH, seat_count: l1.seat_count });
    let ry = y + BAND_TITLE_H;
    for (const row of rows) {
      let rx = MARGIN + (MAX_W - row.w) / 2;
      for (const b of row.items) {
        blocksOut.push({ ...b, x: rx, y: ry, h: row.h });
        b.seats.forEach((seat, i) => {
          const cx = rx + PAD + (b.offsetCells + (i % b.cols)) * CELL_W;
          const cy = ry + LABEL_H + PAD + Math.floor(i / b.cols) * CELL_H;
          seats.push({
            id: seat.seat_id, alias: seat.alias, title: seat.title,
            level1: b.level1, level1Name: b.level1Name,
            level2: b.level2, level2Name: b.level2Name,
            tier: seat.tier, status: seat.admission_status,
            slot_id: seat.slot_id, slot_title: seat.slot_title, slot_basis: seat.slot_basis,
            pilot_role: seat.pilot_role, node_links: seat.node_links || [],
            x: cx, y: cy, w: CELL_W - 6, h: CELL_H - 6,
          });
        });
        rx += b.w + BLOCK_GAP;
      }
      ry += row.h + BLOCK_GAP;
    }
    y += bandH + BAND_GAP;
  }

  const contentH = y - BAND_GAP - MARGIN;
  const offset = (BOARD_SIZE - contentH) / 2 - MARGIN;
  for (const s of seats) s.y += offset;
  for (const b of blocksOut) b.y += offset;
  for (const b of bands) b.y += offset;

  const top = Math.min(...bands.map(b => b.y));
  return {
    bands, blocks: blocksOut, seats,
    governance: org.governance.map((g, i) => ({
      id: g.seat_id, alias: g.alias, title: g.title,
      slot_id: g.slot_id, slot_title: g.slot_title, slot_basis: g.slot_basis,
      x: MARGIN + i * 300, y: top - 96, w: 280, h: 46,
    })),
    bounds: { w: BOARD_SIZE, h: BOARD_SIZE },
  };
}

export function layoutNetwork(network) {
  // 源数据里 16 个节点有 4×4 的 row/col；另外 4 个是跨域镜头，不属于主网格。
  // 不跨页合并坐标：不同卡片的 x/y 来自不同版式，混用会重叠。
  const CELL_W = 360, CELL_H = 250, X0 = 88, Y0 = 190;
  const grid = network.nodes.filter(n => Number.isInteger(n.row) && Number.isInteger(n.col));
  const lens = network.nodes.filter(n => !(Number.isInteger(n.row) && Number.isInteger(n.col)));
  const placed = [];
  for (const n of grid) {
    placed.push({ ...n, x: X0 + n.col * CELL_W, y: Y0 + n.row * CELL_H, w: 320, h: 204 });
  }
  const lensY = Y0 + 4 * CELL_H + 40;
  lens.forEach((n, i) => {
    placed.push({ ...n, x: X0 + i * CELL_W, y: lensY, w: 320, h: 204, lens: true });
  });
  const byId = new Map(placed.map(n => [n.id, n]));
  const xs = [...new Set(placed.map(n => n.x))].sort((a, b) => a - b);
  const ys = [...new Set(placed.map(n => n.y))].sort((a, b) => a - b);
  const lanes = { xs, ys, colGaps: xs.slice(1).map((x, i) => (xs[i] + 320 + x) / 2),
                  rowGaps: ys.slice(1).map((y, i) => (ys[i] + 204 + y) / 2) };
  const edges = network.relations.map((r, i) => route(byId.get(r.source), byId.get(r.target), i, lanes, r));
  return { nodes: placed, edges, unresolved: network.unresolved_relations || [],
           lensY, bounds: { w: BOARD, h: BOARD } };
}

// 正交路由：两端各出一个短桩，再走中缝，避免穿过卡片。

function nearestBelow(arr, v) { const x = arr.find(a => a > v); return x === undefined ? null : x; }
function nearestAbove(arr, v) { const list = arr.filter(a => a < v); return list.length ? list[list.length - 1] : null; }

// 走「列间空档 + 行间空档」两条总线：纵向永远在列缝，横向永远在行缝，不穿卡片。
function route(a, b, index, lanes, rel) {
  if (!a || !b) return null;
  const lane = ((index % 5) - 2) * 3;
  const right = b.x >= a.x;
  const down = b.y >= a.y;
  const vLane = (right ? nearestBelow(lanes.colGaps, a.x + a.w) : nearestAbove(lanes.colGaps, a.x))
             ?? (right ? a.x + a.w + 20 : a.x - 20);
  const hLane = (down ? nearestAbove(lanes.rowGaps, b.y) : nearestBelow(lanes.rowGaps, b.y + b.h))
             ?? (down ? b.y - 23 : b.y + b.h + 23);
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const sameRow = Math.abs(b.y - a.y) < 1;
  const sameCol = Math.abs(b.x - a.x) < 1;
  if (sameRow && !sameCol) {
    const y = hLane + lane;
    return { id: index, source: a.id, target: b.id,
             object: rel ? rel.object : "", codes: rel ? rel.codes : [],
             baseline: !!(rel && rel.baseline), feedback: !!(rel && rel.feedback),
             points: [{ x: ac.x, y: down ? a.y + a.h : a.y }, { x: ac.x, y }, { x: bc.x, y }, { x: bc.x, y: down ? b.y : b.y + b.h }],
             kind: rel && rel.feedback ? 'feedback' : rel && rel.baseline ? 'baseline' : 'plain' };
  }
  if (sameCol && !sameRow) {
    const x = vLane + lane;
    return { id: index, source: a.id, target: b.id,
             object: rel ? rel.object : "", codes: rel ? rel.codes : [],
             baseline: !!(rel && rel.baseline), feedback: !!(rel && rel.feedback),
             points: [{ x: right ? a.x + a.w : a.x, y: ac.y }, { x, y: ac.y }, { x, y: bc.y }, { x: right ? b.x : b.x + b.w, y: bc.y }],
             kind: rel && rel.feedback ? 'feedback' : rel && rel.baseline ? 'baseline' : 'plain' };
  }
  return { id: index, source: a.id, target: b.id,
           object: rel ? rel.object : "", codes: rel ? rel.codes : [],
           baseline: !!(rel && rel.baseline), feedback: !!(rel && rel.feedback),
           points: [{ x: right ? a.x + a.w : a.x, y: ac.y },
                    { x: vLane + lane, y: ac.y },
                    { x: vLane + lane, y: hLane + lane },
                    { x: bc.x, y: hLane + lane },
                    { x: bc.x, y: down ? b.y : b.y + b.h }],
           kind: rel && rel.feedback ? 'feedback' : rel && rel.baseline ? 'baseline' : 'plain' };
}
