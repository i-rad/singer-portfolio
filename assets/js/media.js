/* ===================================
   MEDIA PAGE (videos + audio)
   =================================== */

const MEDIA_I18N_FALLBACK = {
  'media.loading': 'Loading media…',
  'media.noItems': 'No videos or audio yet',
  'media.subtitle': 'Videos and audio'
};

document.addEventListener('DOMContentLoaded', async function () {
  const mediaGrid = document.getElementById('media-grid');

  function t(key) {
    if (window.i18n) {
      const val = window.i18n.get(key);
      if (val != null && val !== key) return val;
    }
    return MEDIA_I18N_FALLBACK[key] || key;
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
      console.warn('Media: could not load translations', e);
    }
  }

  mediaGrid.innerHTML = `<div class="gallery-loading">${t('media.loading')}</div>`;

  async function fetchMediaItems() {
    const [videosRes, audioRes] = await Promise.all([
      fetch('/api/videos', { method: 'GET', headers: { 'Content-Type': 'application/json' }, mode: 'cors' }),
      fetch('/api/audio', { method: 'GET', headers: { 'Content-Type': 'application/json' }, mode: 'cors' })
    ]);

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

    let audioItems = [];
    if (audioRes.ok) {
      const audioData = await audioRes.json();
      if (audioData.success && audioData.audio) {
        audioItems = audioData.audio.map((row) => ({
          type: 'audio',
          src: row.src,
          description: row.description || ''
        }));
      }
    }

    return [...videos, ...audioItems];
  }

  async function loadMedia() {
    try {
      const items = await fetchMediaItems();

      if (items.length === 0) {
        mediaGrid.innerHTML = `
          <div class="gallery-empty">
            <h2>${t('media.noItems')}</h2>
            <p>${t('media.subtitle')}</p>
          </div>
        `;
        return;
      }

      renderMedia(items);
    } catch (error) {
      console.error('Error loading media:', error);
      mediaGrid.innerHTML = `
        <div class="gallery-loading">
          <p>Error loading media.</p>
          <p>Please check that the server is running and try refreshing the page.</p>
          <p>Error: ${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }

  function renderMedia(items) {
    mediaGrid.innerHTML = '';

    items.forEach((item, idx) => {
      const el = createMediaItem(item, idx, items);
      mediaGrid.appendChild(el);
    });

    const title = document.querySelector('title');
    if (title) {
      title.textContent = `${t('media.title')} (${items.length}) | Petras Music Atelier`;
    }
  }

  let activeInlineAudio = null;

  function createMediaItem(item, idx, items) {
    const div = document.createElement('div');
    div.className = 'gallery-item' +
      (item.type === 'video' ? ' gallery-item--video' : '') +
      (item.type === 'audio' ? ' gallery-item--audio' : '');

    const desc = escapeHtml(item.description || '');
    if (item.type === 'video') {
      div.innerHTML = `
        <div class="gallery-item-media">
          <video class="gallery-item-video" src="${escapeHtml(item.src)}" muted playsinline preload="metadata"></video>
          <span class="gallery-video-play" aria-hidden="true"><i class="fas fa-play"></i></span>
        </div>
        <div class="gallery-item-description">${desc}</div>
      `;
      div.addEventListener('click', function () {
        openVideoLightbox(idx, items);
      });
    } else if (item.type === 'audio') {
      div.innerHTML = `
        <div class="gallery-item-media gallery-item-media--audio">
          <span class="gallery-audio-icon" aria-hidden="true"><i class="fas fa-music"></i></span>
        </div>
        <div class="gallery-item-description">${desc}</div>
      `;
      div.addEventListener('click', function (e) {
        if (e.target.closest('audio')) return;
        const wrap = div.querySelector('.gallery-inline-audio-wrap');
        if (!wrap) {
          const w = document.createElement('div');
          w.className = 'gallery-inline-audio-wrap';
          const audio = document.createElement('audio');
          audio.setAttribute('controls', '');
          audio.setAttribute('playsinline', '');
          audio.preload = 'metadata';
          audio.className = 'media-inline-audio';
          audio.src = item.src;
          w.appendChild(audio);
          div.querySelector('.gallery-item-media--audio').appendChild(w);
          div.classList.add('gallery-item--audio-open');
          if (activeInlineAudio && activeInlineAudio !== audio) {
            activeInlineAudio.pause();
          }
          activeInlineAudio = audio;
          return;
        }
        wrap.classList.toggle('gallery-inline-audio--collapsed');
        const a = wrap.querySelector('audio');
        if (wrap.classList.contains('gallery-inline-audio--collapsed')) {
          if (a) a.pause();
        } else if (a) {
          if (activeInlineAudio && activeInlineAudio !== a) activeInlineAudio.pause();
          activeInlineAudio = a;
        }
      });
    }

    return div;
  }

  function openVideoLightbox(startIdx, items) {
    const item = items[startIdx];
    if (item.type !== 'video') return;
    const videosOnly = items.filter((i) => i.type === 'video');
    if (videosOnly.length === 0) return;
    let currentIdx = videosOnly.findIndex((v) => v.src === item.src);
    if (currentIdx < 0) currentIdx = 0;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
        <div class="lightbox-media" id="lightbox-media">
          <video controls playsinline id="lightbox-video"></video>
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

    function updateLightbox(vIdx) {
      const v = videosOnly[vIdx];
      descEl.textContent = v.description || '';
      video.src = v.src;
      video.load();
    }

    document.body.appendChild(lightbox);

    setTimeout(() => {
      lightbox.style.opacity = '1';
    }, 10);

    function showPrev() {
      currentIdx = (currentIdx - 1 + videosOnly.length) % videosOnly.length;
      updateLightbox(currentIdx);
    }
    function showNext() {
      currentIdx = (currentIdx + 1) % videosOnly.length;
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

  loadMedia();

  window.refreshMedia = function () {
    loadMedia();
  };
});
