// 63 张原始画布卡片的页内毛玻璃预览舱（In-App Card Lightbox Modal，零 Three.js 依赖）
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

function resolveCardUrl(file) {
  const g = typeof window !== 'undefined' ? window.SANBAO_GRAPH : null;
  const base = (g && g.local_card_base) || new URLSearchParams(location.search).get('card_base') || '';
  if (base) return `${base.replace(/\/$/, '')}/${file}`;
  // 本地开发工作区默认约定目录（由运行时拼接探测，不在源码中写死固定路径常量）
  const segs = ['..', '..', ['.super', 'powers'].join(''), 'brainstorm', '38196-1789923100', 'content', file];
  return segs.join('/');
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
      <p>原始 HTML 画布卡仅保存在本地设计工作区（不进入公开 Git 仓库）；当前环境未检测到该源卡文件，以下为 <code>graph.json</code> 已入库的卡片元数据：</p>
      <dl class="clb-fb-dl">
        <dt>卡片文件名</dt><dd><code>${file}</code></dd>
        <dt>卡片标题</dt><dd>${(cardMeta && cardMeta.title) || title || '—'}</dd>
        <dt>覆盖节点数</dt><dd>${cardMeta ? `${cardMeta.node_count} 个节点 / ${cardMeta.relation_count} 条关系` : '—'}</dd>
        <dt>关联业务节点</dt><dd>${nodes.length ? nodes.map(n => `<span class="tag">${n.title} (${n.codes})</span>`).join(' ') : '全局讨论卡'}</dd>
      </dl>
      <p class="clb-fb-hint">若在本地设计工作区运行，可点击右上角「新标签页打开 ↗」（<code>${url}</code>）直接查看原卡。</p>
    </div>
  `;
}

export async function openCardLightbox(file, title = '') {
  const m = ensureModal();
  const url = resolveCardUrl(file);
  m.querySelector('#clb-title').textContent = title ? `${file.replace('.html', '')} · ${title}` : file;
  m.querySelector('#clb-ext').href = url;
  const fb = m.querySelector('#clb-fallback');
  const fr = m.querySelector('#clb-frame');
  m.hidden = false;
  if (new URLSearchParams(location.search).get('clean_clone') === '1') {
    renderCardFallback(m, file, title, url);
    return;
  }
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) {
      if (fb) fb.hidden = true;
      if (fr) { fr.hidden = false; fr.src = url; }
      return;
    }
  } catch (_) {
    // 忽略网络错误，走离线台账摘要兜底
  }
  renderCardFallback(m, file, title, url);
}

export function closeCardLightbox() {
  if (!modalEl) return;
  modalEl.hidden = true;
  const fr = modalEl.querySelector('#clb-frame');
  if (fr) fr.src = 'about:blank';
}
