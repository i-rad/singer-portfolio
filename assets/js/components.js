/* ===================================
   COMPONENT LOADER UTILITY
   =================================== */

class ComponentLoader {
    constructor() {
        this.components = new Map();
    }

    /**
     * Load a component from a file and insert it into the specified element
     * @param {string} componentPath - Path to the component HTML file
     * @param {string} targetId - ID of the target element to insert the component
     * @param {Object} options - Additional options for the component
     */
    async loadComponent(componentPath, targetId, options = {}) {
        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${response.statusText}`);
            }

            const html = await response.text();
            const targetElement = document.getElementById(targetId);

            if (!targetElement) {
                throw new Error(`Target element with ID '${targetId}' not found`);
            }

            targetElement.innerHTML = html;

            // Store component for potential updates
            this.components.set(targetId, {
                path: componentPath,
                html: html,
                options: options
            });

            // Execute any post-load callbacks
            if (options.onLoad) {
                options.onLoad(targetElement);
            }

            console.log(`Component loaded successfully: ${componentPath} -> #${targetId}`);

        } catch (error) {
            console.error(`Error loading component ${componentPath}:`, error);
        }
    }

    /**
     * Load multiple components in parallel
     * @param {Array} components - Array of component configurations
     */
    async loadComponents(components) {
        const loadPromises = components.map(component =>
            this.loadComponent(component.path, component.targetId, component.options)
        );

        await Promise.all(loadPromises);
    }

    /**
     * Set active navigation item based on current page
     * @param {string} pageName - Name of the current page (home, about, gallery, blog)
     */
    setActiveNavItem(pageName) {
        // Remove active class from all nav items
        const navItems = document.querySelectorAll('#nav-links a');
        navItems.forEach(item => item.classList.remove('active'));

        // Add active class to current page
        const activeItem = document.querySelector(`.nav-${pageName}`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * Initialize common components for all pages
     * @param {string} currentPage - Current page name for navigation highlighting
     */
    async initCommonComponents(currentPage = 'home') {
        const components = [
            {
                path: 'components/floating-contact.html',
                targetId: 'floating-contact-container',
                options: {
                    onLoad: () => {
                        // Initialize floating contact functionality
                        this.initFloatingContact();
                    }
                }
            },
            {
                path: 'components/navbar.html',
                targetId: 'navbar-container',
                options: {
                    onLoad: () => {
                        // Set active navigation item
                        this.setActiveNavItem(currentPage);
                        // Initialize mobile menu functionality
                        this.initMobileMenu();
                        // Initialize navbar scroll effect
                        this.initNavbarScroll();
                        // Update language toggle state
                        if (window.i18n) {
                            setTimeout(() => {
                                window.i18n.updateLanguageToggle();
                            }, 50);
                        }
                    }
                }
            },
            {
                path: 'components/footer.html',
                targetId: 'footer-container'
            }
        ];

        await this.loadComponents(components);
    }

    /**
     * Initialize floating contact bar functionality
     */
    initFloatingContact() {
        const contactToggle = document.getElementById('contact-toggle');
        const contactIcons = document.getElementById('contact-icons');
        const floatingBar = document.getElementById('floating-bar');

        if (contactToggle && contactIcons) {
            contactToggle.addEventListener('click', () => {
                const isExpanded = contactIcons.classList.contains('expanded');

                if (isExpanded) {
                    contactIcons.classList.remove('expanded');
                    contactToggle.classList.remove('expanded');
                    contactToggle.querySelector('i').style.transform = 'rotate(0deg)';
                } else {
                    contactIcons.classList.add('expanded');
                    contactToggle.classList.add('expanded');
                    contactToggle.querySelector('i').style.transform = 'rotate(45deg)';
                }
            });
        }
    }

    /**
     * Initialize mobile menu functionality
     */
    initMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('nav-links');
        const mobileOverlay = document.getElementById('mobileMenuOverlay');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                const isOpen = navLinks.classList.contains('open');

                if (isOpen) {
                    navLinks.classList.remove('open');
                    hamburger.classList.remove('open');
                    if (mobileOverlay) {
                        mobileOverlay.classList.remove('active');
                    }
                } else {
                    navLinks.classList.add('open');
                    hamburger.classList.add('open');
                    if (mobileOverlay) {
                        mobileOverlay.classList.add('active');
                    }
                }
            });
        }

        // Close mobile menu when clicking on overlay
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('open');
                mobileOverlay.classList.remove('active');
            });
        }

        // Close mobile menu when clicking on nav links
        if (navLinks) {
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navLinks.classList.remove('open');
                    hamburger.classList.remove('open');
                    if (mobileOverlay) {
                        mobileOverlay.classList.remove('active');
                    }
                }
            });
        }
    }

    /**
     * Initialize navbar scroll effect
     */
    initNavbarScroll() {
        const navbar = document.querySelector('.navbar');

        if (navbar) {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            };

            // Add scroll event listener
            window.addEventListener('scroll', handleScroll);

            // Check initial scroll position
            handleScroll();
        }
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get current page from body class or data attribute
    const currentPage = document.body.dataset.page || 'home';
    window.componentLoader.initCommonComponents(currentPage);
});
