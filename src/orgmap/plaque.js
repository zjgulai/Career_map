// 纯矢量铜牌 SVG（零 Three.js 依赖），供 2D 工作视图与 3D 展示视图渲染 T4 决策权规则包（MGT-001..003）
export function renderPlaqueSvg(seat, size = 32) {
  const sid = (seat && (seat.seat_id || seat.id)) || 'MGT';
  const alias = (seat && seat.alias) || '規則';
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true">
    <rect x="4" y="10" width="72" height="60" rx="8" fill="#2a2212" stroke="#c9a96a" stroke-width="3"/>
    <rect x="9" y="15" width="62" height="50" rx="5" fill="none" stroke="#8a7038" stroke-width="1.2" stroke-dasharray="3 2"/>
    <text x="40" y="38" text-anchor="middle" fill="#e5d09c" font-size="16" font-weight="700" font-family="serif">${alias}</text>
    <text x="40" y="54" text-anchor="middle" fill="#b89b60" font-size="10" font-family="monospace">${sid}</text>
  </svg>`;
}
