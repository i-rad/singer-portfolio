/* ===================================
   MAIN JAVASCRIPT FILE
   =================================== */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // Navbar scroll behavior
  const navbar = document.querySelector('.navbar');

  // Check if we're on the gallery page (no hero section)
  const isGalleryPage = !document.querySelector('.hero');

  window.addEventListener('scroll', () => {
    // On gallery page, always keep navbar scrolled state
    if (isGalleryPage) {
      navbar.classList.add('scrolled');
      return;
    }

    // On main page, apply normal scroll behavior
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Navbar active link switching
  const navLinks = document.querySelectorAll('.navbar ul li a');

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Hamburger menu for mobile with overlay and color toggle
  const hamburger = document.getElementById('hamburger');
  const navUl = document.getElementById('nav-links');
  const menuOverlay = document.getElementById('mobileMenuOverlay');

  function openMenu() {
    navUl.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    if (menuOverlay) menuOverlay.classList.add('active');
  }
  function closeMenu() {
    navUl.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (menuOverlay) menuOverlay.classList.remove('active');
  }

  hamburger.addEventListener('click', () => {
    if (navUl.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  // Close nav on link click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 800) {
        closeMenu();
      }
    });
  });

  // Smooth scrolling for navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      if (href.startsWith('#')) {
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
  const floatingBar = document.getElementById('floating-bar');
  const contactToggle = document.getElementById('contact-toggle');
  const contactIcons = document.getElementById('contact-icons');

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

  // Add loading animation class to body
  document.body.classList.add('loaded');

  // Scrollspy: highlight nav link for section in view
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
  window.addEventListener('scroll', onScrollSpy);
  onScrollSpy();

});