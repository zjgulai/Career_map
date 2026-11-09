// 单一主题源与 HSL 角色派生引擎（零 Three.js 依赖，供 2D 工作视图与 3D 展示空间共享）
// 色彩体系 1:1 对齐 https://sagegogo.com/（Editorial Light + Deep-Space Hero Dark）
// 派生数学参考 three-scope-map-skill 的单主色 HSL 增量偏移方法（clean-room 重写）。

export const ORG_THEME_PRIMARY = '#396397';
const LEGACY_PRIMARY = '#396397';

export function normalizeHex(val) {
  const s = String(val || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(s)) {
    return '#' + s.split('').map(c => c + c).join('').toLowerCase();
  }
  if (!/^[0-9a-f]{6}$/i.test(s)) {
    throw new Error(`Invalid hex color: ${val}`);
  }
  return '#' + s.toLowerCase();
}

export function hexToInt(val) {
  return Number.parseInt(normalizeHex(val).slice(1), 16);
}

export function hexToRgb(val) {
  const h = normalizeHex(val).slice(1);
  return {
    r: Number.parseInt(h.slice(0, 2), 16),
    g: Number.parseInt(h.slice(2, 4), 16),
    b: Number.parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  const ch = v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

export function hslToRgb({ h, s, l }) {
  const hue = ((h % 1) + 1) % 1;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const sec = hue * 6;
  const x = c * (1 - Math.abs((sec % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (sec < 1) [r, g] = [c, x];
  else if (sec < 2) [r, g] = [x, c];
  else if (sec < 3) [g, b] = [c, x];
  else if (sec < 4) [g, b] = [x, c];
  else if (sec < 5) [r, b] = [x, c];
  else [r, b] = [c, x];
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const clamp01 = v => Math.max(0, Math.min(1, v));

export function deriveThemeColor(roleHex, sourceHex = ORG_THEME_PRIMARY, baseHex = LEGACY_PRIMARY) {
  const src = normalizeHex(sourceHex);
  const base = normalizeHex(baseHex);
  const role = normalizeHex(roleHex);
  if (src === base) return role;
  const sHsl = rgbToHsl(hexToRgb(src));
  const bHsl = rgbToHsl(hexToRgb(base));
  const rHsl = rgbToHsl(hexToRgb(role));
  return rgbToHex(hslToRgb({
    h: rHsl.h + (sHsl.h - bHsl.h),
    s: clamp01(rHsl.s + (sHsl.s - bHsl.s)),
    l: clamp01(rHsl.l + (sHsl.l - bHsl.l)),
  }));
}

// 2D 正交工作视图（Sagegogo Editorial Light）
export const SAGE_LIGHT = {
  bg: '#ffffff',
  board: '#f4f7fb',
  band: '#edf3f9',
  block: '#ffffff',
  pad: '#e4e9ef',
  gov: '#fff0cf',
  card: '#ffffff',
  line: '#dce5ef',
  ink: '#202b38',
  muted: '#526171',
  accent: deriveThemeColor('#396397'),
  action: deriveThemeColor('#aec8e2'),
  baseline: deriveThemeColor('#396397'),
  feedback: '#935011',
  plain: '#63758a',
  baselineDim: '#b8cce3',
  feedbackDim: '#e4cfb0',
  plainDim: '#cdd6e0',
  shadow: 'rgba(20, 36, 58, 0.06)',
};

// 3D 深空数字孪生舞台（Sagegogo Hero Dark + Three-Scope-Map Slab Roles）
export const SAGE_DARK = {
  stageBg: '#030408',
  fogBg: '#07121c',
  panel: '#0b1521',
  surface: '#142033',
  surface2: '#1b3042',
  line: '#26344a',
  ink: '#f4f7fb',
  muted: '#aab8ca',
  accent: deriveThemeColor('#c4d0dc'),
  accentSoft: deriveThemeColor('#aec8e2'),
  brandBlue: deriveThemeColor('#396397'),
  good: '#8adac4',
  warn: '#edb76c',
  danger: '#f19b9b',
  // 厚板与侧墙渐变色阶
  topFill: '#0b1521',
  sideTop: deriveThemeColor('#aec8e2'),
  sideMid: deriveThemeColor('#396397'),
  sideBottom: '#07121c',
  outlineTop: deriveThemeColor('#c4d0dc'),
  outlineBottom: deriveThemeColor('#526171'),
  chaseHead: '#ffffff',
  hudRing: deriveThemeColor('#74bfe8'),
  // 流线颜色
  flowBaseline: deriveThemeColor('#74bfe8'),
  flowFeedback: '#edb76c',
  flowPlain: '#63758a',
  // 四大部门平面（对应 sagegogo --kg-* 图谱色）
  depts: {
    ops:      { fill: '#0b1929', edge: '#74bfe8', coat: '#74bfe8', name: '业务运营' },
    mgmt:     { fill: '#0d1b2e', edge: '#396397', coat: '#6f93bd', name: '经营管理' },
    control:  { fill: '#1c1810', edge: '#edb76c', coat: '#d8b47a', name: '独立控制' },
    platform: { fill: '#151224', edge: '#bd98e5', coat: '#b9a0d8', name: '数据与Agent平台' },
  },
};

// ---------- 3D 场景三套主题色盘（批次 49-51） ----------
// dark 逐值等于原硬编码色（保证深色首屏零回归）；light 为 Editorial 冰川手工色盘（常规混合 + 墨彩）；
// emerald 由 deriveThemeColor 以纯色相源 #399781（与 #396397 同饱和度/明度，色相 213°→166°）整体旋转派生，
// 琥珀/珊瑚/紫等语义色与部门分类色保持不动，避免分类撞色。
const deptMap = key => Object.fromEntries(Object.entries(SAGE_DARK.depts).map(([k, d]) => [k, d[key]]));

const DARK_3D = {
  label: '深空钛蓝', icon: '☾', next: 'light', additive: true, exposure: 0.96, avatarTone: 'dark',
  bg: SAGE_DARK.fogBg,
  env: ['#dce5ee', '#eef3f8', '#26344a', '#030408'],
  hemi: ['#c4d0dc', '#07121c'], key: '#f4f7fb', fill: '#aec8e2', point: '#c4d0dc',
  floor: { base: '#0b1521', v0: 14, grid: '#396397', gridAlpha: 0.34 },
  zoneFill: deptMap('fill'),
  zoneEdge: deptMap('edge'),
  side: ['#030408', '#396397', '#aec8e2'],
  outline: ['#c4d0dc', '#396397', '#74bfe8'],
  chase: ['#ffffff', '#74bfe8'],
  hud: ['#74bfe8', '#aec8e2', '#396397', '#74bfe8'],
  mat: {
    desk: '#1b3042', deskEdge: '#74bfe8', deskEdgeEmissive: '#396397', metal: '#142033', seat: '#142332',
    glass: '#aec8e2', rail: '#c4d0dc', stone: '#0b1521', pedestal: '#142033', cap: '#c4d0dc',
    plant: '#2b4a56', pot: '#142033',
  },
  sign: ['#aec8e2', '#74bfe8'],
  netBand: ['#0b1521', '#74bfe8'],
  sky: '#74bfe8',
  ceiling: ['#142033', '#aec8e2'],
  plaque: ['#142033', '#aec8e2', '#396397'],
  led: ['#74bfe8', '#edb76c', '#396397'],
  pilot: ['#74bfe8', '#edb76c'],
  flow: { baseline: SAGE_DARK.flowBaseline, feedback: SAGE_DARK.flowFeedback, plain: SAGE_DARK.flowPlain },
  beam: {
    direct_reuse: '#74bfe8', sub_contributor: '#aec8e2', evidence_input: '#8adac4',
    boundary_contributor: '#edb76c', readonly_consumer: '#89a9f1', platform_steward: '#bd98e5',
  },
  holo: { palette: ['#1b3042', '#396397', '#74bfe8', '#aec8e2', '#f4f7fb'], ring: '#74bfe8', scan: '#aec8e2', base: '#142033' },
};

const LIGHT_3D = {
  label: '极昼冰川', icon: '☀', next: 'emerald', additive: false, exposure: 1.0, avatarTone: 'light',
  bg: '#dfe9f5',
  env: ['#ffffff', '#f4f7fb', '#c9d6e4', '#a9bccf'],
  hemi: ['#ffffff', '#b8c8da'], key: '#ffffff', fill: '#dfe9f5', point: '#ffffff',
  floor: { base: '#edf3f9', v0: 198, grid: '#396397', gridAlpha: 0.16 },
  zoneFill: { ops: '#e3eff9', mgmt: '#e2e9f3', control: '#f6eddd', platform: '#ece6f6' },
  zoneEdge: { ops: '#2b6f9e', mgmt: '#396397', control: '#935011', platform: '#6f4fa0' },
  side: ['#9fb4ca', '#c9d8e8', '#ffffff'],
  outline: ['#396397', '#7f9bb8', '#5b86b5'],
  chase: ['#1e4b7a', '#5b86b5'],
  hud: ['#396397', '#5b86b5', '#7f9bb8', '#396397'],
  mat: {
    desk: '#f4f7fb', deskEdge: '#5b86b5', deskEdgeEmissive: '#2a5a8c', metal: '#c3cfdc', seat: '#d7e1ec',
    glass: '#aec8e2', rail: '#9fb0c2', stone: '#e8eef5', pedestal: '#dde6f0', cap: '#5b86b5',
    plant: '#4f7d6a', pot: '#c9d4e0',
  },
  sign: ['#396397', '#2a5a8c'],
  netBand: ['#dfe7f0', '#396397'],
  sky: '#396397',
  ceiling: ['#c9d4e0', '#ffffff'],
  plaque: ['#cdd8e4', '#396397', '#1e4b7a'],
  led: ['#2b6f9e', '#935011', '#5b86b5'],
  pilot: ['#2b6f9e', '#935011'],
  flow: { baseline: '#396397', feedback: '#935011', plain: '#7f8fa3' },
  beam: {
    direct_reuse: '#2b6f9e', sub_contributor: '#5b86b5', evidence_input: '#246b50',
    boundary_contributor: '#935011', readonly_consumer: '#4a64b8', platform_steward: '#6f4fa0',
  },
  holo: { palette: ['#0f2a47', '#1e4b7a', '#396397', '#7fa2c7', '#c9d8e8'], ring: '#396397', scan: '#5b86b5', base: '#dde6f0' },
};

export const EMERALD_SOURCE = '#399781';
const EMERALD_FIXED = new Set(['#edb76c', '#f19b9b', '#bd98e5', '#ffffff', '#1c1810', '#151224']);

function rotateToEmerald(v) {
  if (typeof v === 'string') {
    const hex = v.toLowerCase();
    return /^#[0-9a-f]{6}$/.test(hex) && !EMERALD_FIXED.has(hex) ? deriveThemeColor(hex, EMERALD_SOURCE) : v;
  }
  if (Array.isArray(v)) return v.map(rotateToEmerald);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rotateToEmerald(x)]));
  return v;
}

export const THEME_3D = {
  dark: DARK_3D,
  light: LIGHT_3D,
  emerald: { ...rotateToEmerald(DARK_3D), label: '量子青碧', icon: '◆', next: 'dark' },
};
export const THEME_ORDER = ['dark', 'light', 'emerald'];
