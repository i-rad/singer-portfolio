/* ===================================
   GALLERY PAGE JAVASCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
  const galleryGrid = document.getElementById('gallery-grid');

  // Function to get translated text
  function t(key) {
    if (window.i18n) {
      return window.i18n.get(key);
    }
    return key;
  }

  // Show loading state
  galleryGrid.innerHTML = `<div class="gallery-loading">${t('gallery.loading')}</div>`;

  // Function to fetch images from the backend API
  async function fetchGalleryImages() {
    try {
      console.log('Fetching gallery images from API...');

      const response = await fetch('/api/gallery', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Failed to load gallery');
      }

      return data.images;

    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  }

  // Function to load and render the gallery
  async function loadGallery() {
    try {
      const images = await fetchGalleryImages();

      if (images.length === 0) {
        // Show message if no images found
        galleryGrid.innerHTML = `
          <div class="gallery-empty">
            <h2>${t('gallery.noImages')}</h2>
            <p>${t('gallery.subtitle')}</p>
          </div>
        `;
        return;
      }

      // Render the gallery
      renderGallery(images);

    } catch (error) {
      // Show error message
      galleryGrid.innerHTML = `
        <div class="gallery-loading">
          <p>Error loading gallery images.</p>
          <p>Please check that the server is running and try refreshing the page.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }

  // Function to render the gallery
  function renderGallery(images) {
    // Clear loading state
    galleryGrid.innerHTML = '';

    // Add images to grid
    images.forEach((imageData, idx) => {
      const item = createGalleryItem(imageData, idx, images);
      galleryGrid.appendChild(item);
    });

    // Update page title with image count
    const title = document.querySelector('title');
    if (title) {
      title.textContent = `Gallery (${images.length} images) | Petras Music Atelier`;
    }
  }

  // Function to create gallery item
  function createGalleryItem(imageData, idx, images) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    item.innerHTML = `
      <img src="${imageData.src}" alt="${imageData.description}" loading="lazy">
      <div class="gallery-item-description">${imageData.description}</div>
    `;

    // Add click event to open image in lightbox
    item.addEventListener('click', function () {
      openLightbox(idx, images);
    });

    return item;
  }

  // Function to open lightbox
  function openLightbox(startIdx, images) {
    let currentIdx = startIdx;

    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <span class="lightbox-close">&times;</span>
        <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
        <img src="" alt="" id="lightbox-img">
        <button class="lightbox-next" aria-label="Next image">&#10095;</button>
        <div id="lightbox-description" style="margin-top: 1rem;"></div>
      </div>
    `;

    // Add lightbox styles
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

    const img = lightbox.querySelector('#lightbox-img');
    img.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
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
      img.src = images[idx].src;
      img.alt = images[idx].description;
      descEl.textContent = images[idx].description;
    }

    // Add to page
    document.body.appendChild(lightbox);

    // Fade in
    setTimeout(() => {
      lightbox.style.opacity = '1';
    }, 10);

    // Navigation
    function showPrev() {
      currentIdx = (currentIdx - 1 + images.length) % images.length;
      updateLightbox(currentIdx);
    }
    function showNext() {
      currentIdx = (currentIdx + 1) % images.length;
      updateLightbox(currentIdx);
    }
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Keyboard navigation
    function keyHandler(e) {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeLightbox();
    }
    document.addEventListener('keydown', keyHandler);

    // Close functionality
    function closeLightbox() {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(lightbox);
        document.removeEventListener('keydown', keyHandler);
      }, 300);
    }
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Initial image
    updateLightbox(currentIdx);
  }

  // Start loading gallery
  loadGallery();

  // Function to refresh gallery (for future use)
  window.refreshGallery = function () {
    loadGallery();
  };
}); 