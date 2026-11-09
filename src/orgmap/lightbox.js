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

export function openCardLightbox(file, title = '') {
  const m = ensureModal();
  const url = `../../.superpowers/brainstorm/38196-1789923100/content/${file}`;
  m.querySelector('#clb-title').textContent = title ? `${file.replace('.html', '')} · ${title}` : file;
  m.querySelector('#clb-ext').href = url;
  m.querySelector('#clb-frame').src = url;
  m.hidden = false;
}

export function closeCardLightbox() {
  if (!modalEl) return;
  modalEl.hidden = true;
  const fr = modalEl.querySelector('#clb-frame');
  if (fr) fr.src = 'about:blank';
}
