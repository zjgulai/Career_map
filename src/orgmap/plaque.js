// 纯矢量钛金规则碑 SVG（零 Three.js 依赖），供 2D 工作视图与 3D 展示视图渲染 T4 决策权规则包（MGT-001..003）
// 色彩对齐 sagegogo.com 深空钛蓝与冷银描边体系。
export function renderPlaqueSvg(seat, size = 32) {
  const sid = (seat && (seat.seat_id || seat.id)) || 'MGT';
  const alias = (seat && seat.alias) || '規則';
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
    <rect x="4" y="8" width="72" height="64" rx="10" fill="#142033" stroke="#aec8e2" stroke-width="2.5"/>
    <rect x="10" y="14" width="60" height="52" rx="6" fill="none" stroke="#396397" stroke-width="1.4" stroke-dasharray="4 2"/>
    <circle cx="40" cy="21" r="2.2" fill="#74bfe8"/>
    <text x="40" y="42" text-anchor="middle" fill="#f4f7fb" font-size="16" font-weight="700" font-family="Arial,PingFang SC,sans-serif">${alias}</text>
    <text x="40" y="57" text-anchor="middle" fill="#aec8e2" font-size="10" font-family="monospace">${sid}</text>
  </svg>`;
}
