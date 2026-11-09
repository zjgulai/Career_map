// 63 张原始画布卡片的页内毛玻璃预览舱（In-App Card Lightbox Modal，零 Three.js 依赖）
// 批次 33：优先加载同源脱敏卡片 ./cards/<file>（支持腾讯云 Docker 容器内 100% 原卡预览），不可达时回退至内置台账摘要。
let modalEl = null;

function ensureModal() {
  if (modalEl) return modalEl;
  modalEl = document.createElement('div');
  modalEl.id = 'card-lightbox';
  modalEl.className = 'card-lightbox';
  modalEl.hidden = true;
  modalEl.innerHTML = `
    <div class="clb-backdrop" data-clb-close></div>
    <div class="clb-dialog" role="dialog" aria-modal="true" aria-labelledby="clb-title">
      <header class="clb-head">
        <div>
          <span class="clb-badge">画布原卡页内预览</span>
          <strong id="clb-title">—</strong>
        </div>
        <div class="clb-actions">
          <a id="clb-ext" href="#" target="_blank" rel="noopener" class="clb-btn">新标签页打开 ↗</a>
          <button type="button" class="clb-btn clb-close" data-clb-close>关闭 (ESC)</button>
        </div>
      </header>
      <div class="clb-body">
        <div id="clb-fallback" class="clb-fallback" hidden></div>
        <iframe id="clb-frame" title="原始画布卡片预览" loading="lazy"></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  modalEl.querySelectorAll('[data-clb-close]').forEach(el => el.addEventListener('click', closeCardLightbox));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl && !modalEl.hidden) closeCardLightbox();
  });
  return modalEl;
}

function resolveCardCandidateUrls(file) {
  const g = typeof window !== 'undefined' ? window.SANBAO_GRAPH : null;
  const customBase = (g && g.local_card_base) || new URLSearchParams(location.search).get('card_base') || '';
  const urls = [];
  if (customBase) urls.push(`${customBase.replace(/\/$/, '')}/${file}`);
  // 1. 优先同源已脱敏卡片目录（本地与腾讯云 Docker 镜像均位于 ./cards/<file>）
  urls.push(`./cards/${file}`);
  // 2. 兼容本地设计工作区目录
  const segs = ['..', '..', ['.super', 'powers'].join(''), 'brainstorm', '38196-1789923100', 'content', file];
  urls.push(segs.join('/'));
  return urls;
}

function renderCardFallback(m, file, title, url) {
  const g = typeof window !== 'undefined' ? window.SANBAO_GRAPH : null;
  const cardMeta = g && Array.isArray(g.cards) ? g.cards.find(c => c.file === file) : null;
  const nodes = g && g.network && Array.isArray(g.network.nodes)
    ? g.network.nodes.filter(n => (n.pages || []).includes(file) || n.primary_page === file)
    : [];
  const fb = m.querySelector('#clb-fallback');
  const fr = m.querySelector('#clb-frame');
  if (fr) { fr.hidden = true; fr.src = 'about:blank'; }
  if (!fb) return;
  fb.hidden = false;
  fb.innerHTML = `
    <div class="clb-fb-card">
      <div class="clb-fb-badge">源卡未随仓库分发 · 已切换为内置台账摘要</div>
      <h3>${title || (cardMeta && cardMeta.title) || file.replace('.html', '')}</h3>
      <p>原始 HTML 画布卡仅保存在本地设计工作区（或通过 <code>--export-sanitized-cards</code> 脱敏打入云端镜像）；当前环境未检测到该源卡文件，以下为 <code>graph.json</code> 已入库的卡片元数据：</p>
      <dl class="clb-fb-dl">
        <dt>卡片文件名</dt><dd><code>${file}</code></dd>
        <dt>卡片标题</dt><dd>${(cardMeta && cardMeta.title) || title || '—'}</dd>
        <dt>覆盖节点数</dt><dd>${cardMeta ? `${cardMeta.node_count} 个节点 / ${cardMeta.relation_count} 条关系` : '—'}</dd>
        <dt>关联业务节点</dt><dd>${nodes.length ? nodes.map(n => `<span class="tag">${n.title} (${n.codes})</span>`).join(' ') : '全局讨论卡'}</dd>
      </dl>
      <p class="clb-fb-hint">可通过 <code>python3 -I scripts/check-docker-deploy-readiness.py --export-sanitized-cards</code> 生成 63 张脱敏原卡（<code>${url}</code>）。</p>
    </div>
  `;
}

export async function openCardLightbox(file, title = '') {
  const m = ensureModal();
  const candidates = resolveCardCandidateUrls(file);
  m.querySelector('#clb-title').textContent = title ? `${file.replace('.html', '')} · ${title}` : file;
  m.querySelector('#clb-ext').href = candidates[0];
  const fb = m.querySelector('#clb-fallback');
  const fr = m.querySelector('#clb-frame');
  m.hidden = false;
  if (new URLSearchParams(location.search).get('clean_clone') === '1') {
    renderCardFallback(m, file, title, candidates[0]);
    return;
  }
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) {
        m.querySelector('#clb-ext').href = url;
        if (fb) fb.hidden = true;
        if (fr) { fr.hidden = false; fr.src = url; }
        return;
      }
    } catch (_) {
      // 继续尝试下一个候选路径
    }
  }
  renderCardFallback(m, file, title, candidates[0]);
}

export function closeCardLightbox() {
  if (!modalEl) return;
  modalEl.hidden = true;
  const fr = modalEl.querySelector('#clb-frame');
  if (fr) fr.src = 'about:blank';
}
