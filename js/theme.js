// Менеджер тем (Светлая/Темная)
class ThemeManager {
    constructor() {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem('lunify_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
        this.toggleBtn = null;
    }

    init() {
        console.log('🎨 Theme Manager initialized');

        // Apply theme immediately to prevent flash
        this.applyTheme(this.isDark, false);

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupToggleButton();
            });
        } else {
            this.setupToggleButton();
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't set a preference
            if (!localStorage.getItem('lunify_theme')) {
                this.isDark = e.matches;
                this.applyTheme(this.isDark, true);
            }
        });
    }

    setupToggleButton() {
        this.toggleBtn = document.getElementById('themeToggle');

        if (!this.toggleBtn) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Set initial icon
        this.updateToggleButton();

        // Add click listener
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        console.log('✅ Theme toggle button initialized');
    }

    applyTheme(isDark, animate = true) {
        const root = document.documentElement;

        // Add transition class for smooth animation
        if (animate) {
            root.classList.add('theme-transitioning');
        }

        if (isDark) {
            root.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-theme');
        } else {
            root.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-theme');
        }

        // Remove transition class after animation
        if (animate) {
            setTimeout(() => {
                root.classList.remove('theme-transitioning');
            }, 300);
        }

        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(isDark);
    }

    updateToggleButton() {
        if (!this.toggleBtn) return;

        // Update icon and tooltip
        if (this.isDark) {
            this.toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="4" fill="currentColor"/>
                    <path d="M10 1V3M10 17V19M19 10H17M3 10H1M16.5 16.5L15 15M5 5L3.5 3.5M16.5 3.5L15 5M5 15L3.5 16.5"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
            this.toggleBtn.setAttribute('title', 'Переключить на светлую тему');
        } else {
            this.toggleBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
            `;
            this.toggleBtn.setAttribute('title', 'Переключить на темную тему');
        }
    }

    updateMetaThemeColor(isDark) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = isDark ? '#1a1a1a' : '#667eea';
    }

    toggle() {
        this.isDark = !this.isDark;
        this.applyTheme(this.isDark, true);
        this.updateToggleButton();

        // Save preference
        localStorage.setItem('lunify_theme', this.isDark ? 'dark' : 'light');

        // Update chart colors if chart exists
        if (window.analyticsManager && window.analyticsManager.chart) {
            window.analyticsManager.updateAnalytics();
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChange', {
            detail: { isDark: this.isDark }
        }));

        console.log(`🎨 Theme switched to: ${this.isDark ? 'dark' : 'light'}`);
    }

    getCurrentTheme() {
        return this.isDark ? 'dark' : 'light';
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            console.error('Invalid theme. Use "light" or "dark"');
            return;
        }

        this.isDark = theme === 'dark';
        this.applyTheme(this.isDark, true);
        this.updateToggleButton();
        localStorage.setItem('lunify_theme', theme);
    }
}

// Initialize and export
window.themeManager = new ThemeManager();