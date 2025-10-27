/* ===================================
   INTERNATIONALIZATION (i18n) MODULE
   =================================== */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'de';
        this.translations = {};
    }

    async loadTranslations() {
        try {
            const response = await fetch(`/assets/locales/${this.currentLang}.json`);
            this.translations = await response.json();
            this.updatePage();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English if German fails
            if (this.currentLang === 'de') {
                const response = await fetch(`/assets/locales/en.json`);
                this.translations = await response.json();
                this.currentLang = 'en';
                localStorage.setItem('language', 'en');
                this.updatePage();
            }
        }
    }

    get(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    }

    async setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        await this.loadTranslations();
        this.updateLanguageToggle();
    }

    updateLanguageToggle() {
        // Desktop buttons
        const deButton = document.getElementById('lang-de');
        const enButton = document.getElementById('lang-en');

        if (deButton && enButton) {
            if (this.currentLang === 'de') {
                deButton.classList.add('active');
                enButton.classList.remove('active');
            } else {
                enButton.classList.add('active');
                deButton.classList.remove('active');
            }
        }

        // Mobile buttons
        const deButtonMobile = document.getElementById('lang-de-mobile');
        const enButtonMobile = document.getElementById('lang-en-mobile');

        if (deButtonMobile && enButtonMobile) {
            if (this.currentLang === 'de') {
                deButtonMobile.classList.add('active');
                enButtonMobile.classList.remove('active');
            } else {
                enButtonMobile.classList.add('active');
                deButtonMobile.classList.remove('active');
            }
        }
    }

    updatePage() {
        // Update navigation
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.get(key);

            // Preserve HTML if element has children (like quotes)
            if (element.children.length > 0) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        });

        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const text = this.get(key);
            element.setAttribute('title', text);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const text = this.get(key);
            element.setAttribute('placeholder', text);
        });

        // Update innerHTML for complex content
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const text = this.get(key);
            element.innerHTML = text;
        });

        // Update page title
        this.updatePageTitle();
    }

    updatePageTitle() {
        const page = document.body.getAttribute('data-page') || 'home';
        const key = `${page}.title`;
        const title = this.get(key);
        if (title && title !== key) {
            document.title = `${title} | Petras Music Atelier`;
        }
    }
}

// Create global instance
const i18n = new I18n();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    await i18n.loadTranslations();

    // Wait for navbar to be loaded and ensure language toggle is updated
    setTimeout(() => {
        i18n.updatePage(); // Update page content with translations
        addLanguageToggleListeners();
        i18n.updateLanguageToggle();
    }, 300);
});

// Update page content and language toggle when page fully loads
window.addEventListener('load', () => {
    i18n.updatePage();
    i18n.updateLanguageToggle();
});

function addLanguageToggleListeners() {
    // Desktop buttons
    const deButton = document.getElementById('lang-de');
    const enButton = document.getElementById('lang-en');

    if (deButton && !deButton.dataset.listenerAdded) {
        deButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await i18n.setLanguage('de');
        });
        deButton.dataset.listenerAdded = 'true';
    }

    if (enButton && !enButton.dataset.listenerAdded) {
        enButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await i18n.setLanguage('en');
        });
        enButton.dataset.listenerAdded = 'true';
    }

    // Mobile buttons
    const deButtonMobile = document.getElementById('lang-de-mobile');
    const enButtonMobile = document.getElementById('lang-en-mobile');

    if (deButtonMobile && !deButtonMobile.dataset.listenerAdded) {
        deButtonMobile.addEventListener('click', async (e) => {
            e.preventDefault();
            await i18n.setLanguage('de');
        });
        deButtonMobile.dataset.listenerAdded = 'true';
    }

    if (enButtonMobile && !enButtonMobile.dataset.listenerAdded) {
        enButtonMobile.addEventListener('click', async (e) => {
            e.preventDefault();
            await i18n.setLanguage('en');
        });
        enButtonMobile.dataset.listenerAdded = 'true';
    }
}

// Watch for navbar component loading and re-add listeners only when needed
let listenersAdded = false;

const initObserver = () => {
    const observer = new MutationObserver(() => {
        const deButton = document.getElementById('lang-de');
        const enButton = document.getElementById('lang-en');
        const deButtonMobile = document.getElementById('lang-de-mobile');
        const enButtonMobile = document.getElementById('lang-en-mobile');

        // Only add listeners ONCE when buttons first appear
        if (!listenersAdded && (deButton || enButton || deButtonMobile || enButtonMobile)) {
            addLanguageToggleListeners();
            listenersAdded = true;
        }
    });

    // Observe only the navbar container instead of entire body
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        observer.observe(navbarContainer, { childList: true, subtree: true });
    }
};

// Initialize observer
initObserver();

// Export for use in other scripts
window.i18n = i18n;

