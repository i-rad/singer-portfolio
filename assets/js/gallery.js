/* ===================================
   GALLERY PAGE JAVASCRIPT
   =================================== */

const GALLERY_I18N_FALLBACK = {
  'gallery.loading': 'Loading gallery…',
  'gallery.noImages': 'No images or videos yet',
  'gallery.subtitle': 'A collection of moments and memories'
};

document.addEventListener('DOMContentLoaded', async function () {
  const galleryGrid = document.getElementById('gallery-grid');

  function t(key) {
    if (window.i18n) {
      const val = window.i18n.get(key);
      if (val != null && val !== key) return val;
    }
    return GALLERY_I18N_FALLBACK[key] || key;
  }

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (window.i18n && typeof window.i18n.loadTranslations === 'function') {
    try {
      await window.i18n.loadTranslations();
    } catch (e) {
      console.warn('Gallery: could not load translations', e);
    }
  }

  galleryGrid.innerHTML = `<div class="gallery-loading">${t('gallery.loading')}</div>`;

  async function fetchGalleryItems() {
    const [galleryRes, videosRes] = await Promise.all([
      fetch('/api/gallery', { method: 'GET', headers: { 'Content-Type': 'application/json' }, mode: 'cors' }),
      fetch('/api/videos', { method: 'GET', headers: { 'Content-Type': 'application/json' }, mode: 'cors' })
    ]);

    if (!galleryRes.ok) {
      throw new Error(`Gallery HTTP ${galleryRes.status}`);
    }

    const galleryData = await galleryRes.json();
    if (!galleryData.success) {
      throw new Error(galleryData.error || 'Failed to load gallery');
    }

    const images = (galleryData.images || []).map((row) => ({
      type: 'image',
      src: row.src,
      description: row.description || ''
    }));

    let videos = [];
    if (videosRes.ok) {
      const videosData = await videosRes.json();
      if (videosData.success && videosData.videos) {
        videos = videosData.videos.map((row) => ({
          type: 'video',
          src: row.src,
          description: row.description || ''
        }));
      }
    }

    return [...images, ...videos];
  }

  async function loadGallery() {
    try {
      const items = await fetchGalleryItems();

      if (items.length === 0) {
        galleryGrid.innerHTML = `
          <div class="gallery-empty">
            <h2>${t('gallery.noImages')}</h2>
            <p>${t('gallery.subtitle')}</p>
          </div>
        `;
        return;
      }

      renderGallery(items);
    } catch (error) {
      console.error('Error loading gallery:', error);
      galleryGrid.innerHTML = `
        <div class="gallery-loading">
          <p>Error loading gallery.</p>
          <p>Please check that the server is running and try refreshing the page.</p>
          <p>Error: ${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }

  function renderGallery(items) {
    galleryGrid.innerHTML = '';

    items.forEach((item, idx) => {
      const el = createGalleryItem(item, idx, items);
      galleryGrid.appendChild(el);
    });

    const title = document.querySelector('title');
    if (title) {
      title.textContent = `Gallery (${items.length}) | Petras Music Atelier`;
    }
  }

  function createGalleryItem(item, idx, items) {
    const div = document.createElement('div');
    div.className = 'gallery-item' + (item.type === 'video' ? ' gallery-item--video' : '');

    const desc = escapeHtml(item.description || '');
    if (item.type === 'video') {
      div.innerHTML = `
        <video class="gallery-item-video" src="${escapeHtml(item.src)}" muted playsinline preload="metadata"></video>
        <div class="gallery-item-description">${desc}</div>
      `;
    } else {
      div.innerHTML = `
        <img src="${escapeHtml(item.src)}" alt="${desc}" loading="lazy">
        <div class="gallery-item-description">${desc}</div>
      `;
    }

    div.addEventListener('click', function () {
      openLightbox(idx, items);
    });

    return div;
  }

  function openLightbox(startIdx, items) {
    let currentIdx = startIdx;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
        <div class="lightbox-media" id="lightbox-media">
          <img src="" alt="" id="lightbox-img">
          <video controls playsinline id="lightbox-video" style="display:none"></video>
        </div>
        <button class="lightbox-next" aria-label="Next">&#10095;</button>
        <div id="lightbox-description" style="margin-top: 1rem;"></div>
      </div>
    `;

    lightbox.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const content = lightbox.querySelector('.lightbox-content');
    content.style.cssText = `
      position: relative;
      max-width: 90%;
      max-height: 90%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    const mediaWrap = lightbox.querySelector('#lightbox-media');
    mediaWrap.style.cssText = `
      position: relative;
      max-width: 100%;
      max-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const img = lightbox.querySelector('#lightbox-img');
    img.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 8px;
      margin: 0 2.5rem;
    `;

    const video = lightbox.querySelector('#lightbox-video');
    video.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      border-radius: 8px;
      margin: 0 2.5rem;
    `;

    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.style.cssText = `
      position: absolute;
      top: -40px;
      right: 0;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      background: none;
      border: none;
    `;

    const prevBtn = lightbox.querySelector('.lightbox-prev');
    prevBtn.style.cssText = `
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 2.5rem;
      cursor: pointer;
      z-index: 1;
      padding: 0 1rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;

    const nextBtn = lightbox.querySelector('.lightbox-next');
    nextBtn.style.cssText = `
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 2.5rem;
      cursor: pointer;
      z-index: 1;
      padding: 0 1rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;

    const descEl = lightbox.querySelector('#lightbox-description');
    descEl.style.cssText = `
      color: white;
      font-family: 'Montserrat', sans-serif;
      font-weight: 300;
      margin-top: 1rem;
      font-size: 1.1rem;
      text-align: center;
      word-break: break-word;
    `;

    function updateLightbox(idx) {
      const item = items[idx];
      descEl.textContent = item.description || '';

      if (item.type === 'video') {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = item.src;
        video.load();
      } else {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.style.display = 'none';
        img.style.display = 'block';
        img.src = item.src;
        img.alt = item.description || '';
      }
    }

    document.body.appendChild(lightbox);

    setTimeout(() => {
      lightbox.style.opacity = '1';
    }, 10);

    function showPrev() {
      currentIdx = (currentIdx - 1 + items.length) % items.length;
      updateLightbox(currentIdx);
    }
    function showNext() {
      currentIdx = (currentIdx + 1) % items.length;
      updateLightbox(currentIdx);
    }
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    function keyHandler(e) {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeLightbox();
    }
    document.addEventListener('keydown', keyHandler);

    function closeLightbox() {
      video.pause();
      video.removeAttribute('src');
      lightbox.style.opacity = '0';
      setTimeout(() => {
        if (lightbox.parentNode) {
          document.body.removeChild(lightbox);
        }
        document.removeEventListener('keydown', keyHandler);
      }, 300);
    }
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    updateLightbox(currentIdx);
  }

  loadGallery();

  window.refreshGallery = function () {
    loadGallery();
  };
});
