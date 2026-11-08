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
