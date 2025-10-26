/* ===================================
   MAIN JAVASCRIPT FILE
   =================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // Navbar scroll behavior
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    // If navbar is not loaded yet, wait a bit and try again
    if (!navbar) {
      setTimeout(initNavbarScroll, 100);
      return;
    }

    // Check if we're on the gallery or blog page (no hero section)
    const isGalleryPage = !document.querySelector('.hero');

    window.addEventListener('scroll', () => {
      // On gallery/blog page, always keep navbar scrolled state
      if (isGalleryPage) {
        if (navbar) navbar.classList.add('scrolled');
        return;
      }

      // On main page, apply normal scroll behavior
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  // Initialize navbar scroll
  initNavbarScroll();

  // Smooth scrolling for navigation links
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.navbar ul li a');

    if (!navLinks || navLinks.length === 0) {
      setTimeout(initSmoothScroll, 100);
      return;
    }

    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  initSmoothScroll();

  // Banner column click handlers (for future functionality)
  const bannerColumns = document.querySelectorAll('.banner-column');

  bannerColumns.forEach(column => {
    column.addEventListener('click', function () {
      const action = this.querySelector('h3').textContent.toLowerCase();

      // Add your custom functionality here
      console.log(`Clicked: ${action}`);

      // Example: You could add links or modal triggers here
      // switch(action) {
      //   case 'listen':
      //     // Open music streaming link
      //     break;
      //   case 'watch':
      //     // Open video gallery
      //     break;
      //   case 'book':
      //     // Open booking form
      //     break;
      // }
    });
  });

  // Floating contact bar functionality
  function initFloatingContact() {
    const floatingBar = document.getElementById('floating-bar');
    const contactToggle = document.getElementById('contact-toggle');
    const contactIcons = document.getElementById('contact-icons');

    // If floating contact is not present, skip initialization
    if (!floatingBar || !contactToggle || !contactIcons) {
      return;
    }

    // Toggle contact bar visibility
    contactToggle.addEventListener('click', function () {
      contactIcons.classList.toggle('expanded');
      this.classList.toggle('expanded');
    });

    // Auto-collapse when clicking outside
    document.addEventListener('click', function (e) {
      if (!floatingBar.contains(e.target)) {
        contactIcons.classList.remove('expanded');
        contactToggle.classList.remove('expanded');
      }
    });

    // Auto-collapse on mobile after 3 seconds of inactivity
    let mobileTimeout;
    if (window.innerWidth <= 768) {
      mobileTimeout = setTimeout(() => {
        contactIcons.classList.remove('expanded');
        contactToggle.classList.remove('expanded');
      }, 3000);
    }

    // Reset timeout on interaction
    floatingBar.addEventListener('mouseenter', function () {
      if (mobileTimeout) {
        clearTimeout(mobileTimeout);
      }
    });
  }

  // Initialize floating contact
  initFloatingContact();

  // Add loading animation class to body
  document.body.classList.add('loaded');

  // Scrollspy: highlight nav link for section in view (only on pages with sections)
  function initScrollSpy() {
    const navLinks = document.querySelectorAll('.navbar ul li a');

    if (!navLinks || navLinks.length === 0) {
      setTimeout(initScrollSpy, 100);
      return;
    }

    const sectionIds = ['home', 'about', 'gallery'];
    const sectionElements = sectionIds.map(id => document.getElementById(id));
    const navLinkMap = {};

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        navLinkMap[id] = link;
      }
    });

    function onScrollSpy() {
      let current = sectionIds[0];
      const scrollY = window.scrollY + 100; // Offset for fixed navbar
      for (let i = 0; i < sectionElements.length; i++) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollY) {
          current = sectionIds[i];
        }
      }
      navLinks.forEach(link => link.classList.remove('active'));
      if (navLinkMap[current]) navLinkMap[current].classList.add('active');
    }

    // Only initialize scrollspy if we're on a page with sections
    const hasSections = sectionElements.some(el => el !== null);
    if (hasSections) {
      window.addEventListener('scroll', onScrollSpy);
      onScrollSpy();
    }
  }

  initScrollSpy();

});