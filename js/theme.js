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

        // DON'T initialize toggle button on page load - it's hidden in profile tab
        // It will be initialized when user opens profile tab (see app.js switchTab function)

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
        console.log('🔍 setupToggleButton() called');

        // Check if profile state is visible
        const profileState = document.getElementById('profileState');
        console.log('🔍 profileState:', profileState);
        if (profileState) {
            const profileDisplay = window.getComputedStyle(profileState).display;
            console.log('🔍 profileState display:', profileDisplay);
        }

        // Try to find all elements with these IDs
        const allElements = document.querySelectorAll('[id]');
        const ids = Array.from(allElements).map(el => el.id);
        console.log('🔍 All IDs on page:', ids.filter(id => id.includes('theme') || id.includes('toggle')));

        // New toggle switch in profile
        const toggleSwitch = document.getElementById('themeToggleSwitch');
        const themeToggleItem = document.getElementById('themeToggleItem');

        console.log('🔍 toggleSwitch:', toggleSwitch);
        console.log('🔍 themeToggleItem:', themeToggleItem);

        // Try querySelector as backup
        if (!toggleSwitch) {
            const toggleSwitchAlt = document.querySelector('#themeToggleSwitch');
            const themeToggleItemAlt = document.querySelector('#themeToggleItem');
            console.log('🔍 toggleSwitch (querySelector):', toggleSwitchAlt);
            console.log('🔍 themeToggleItem (querySelector):', themeToggleItemAlt);
        }

        if (!toggleSwitch) {
            console.log('⚠️ Theme toggle button not found - will retry when profile tab is opened');
            return;
        }

        // Prevent duplicate initialization
        if (toggleSwitch.dataset.initialized === 'true') {
            console.log('Theme toggle already initialized, just updating UI');
            // Just update the UI
            toggleSwitch.checked = this.isDark;
            this.updateProfileThemeUI();
            return;
        }

        console.log('🎨 Initializing theme toggle for the FIRST time...');

        // Mark as initialized
        toggleSwitch.dataset.initialized = 'true';

        // Set initial state
        toggleSwitch.checked = this.isDark;
        this.updateProfileThemeUI();

        // Simple toggle function
        const doToggle = () => {
            console.log('🔄 doToggle called, current isDark:', this.isDark);
            this.isDark = !this.isDark;
            toggleSwitch.checked = this.isDark;
            console.log('📝 Applying theme:', this.isDark ? 'dark' : 'light');
            this.applyTheme(this.isDark, true);
            this.updateProfileThemeUI();
            localStorage.setItem('lunify_theme', this.isDark ? 'dark' : 'light');

            // Update chart colors if chart exists
            if (window.analyticsManager && window.analyticsManager.chart) {
                window.analyticsManager.updateAnalytics();
            }

            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('themeChange', {
                detail: { isDark: this.isDark }
            }));

            console.log(`✅ Theme switched to: ${this.isDark ? 'dark' : 'light'}`);
        };

        // Click on the whole item
        if (themeToggleItem) {
            const itemClickHandler = (e) => {
                console.log('🖱️ Theme toggle ITEM clicked! Event:', e);
                console.log('🖱️ Event target:', e.target);
                console.log('🖱️ Current target:', e.currentTarget);
                e.preventDefault();
                e.stopPropagation();
                doToggle();
            };

            themeToggleItem.addEventListener('click', itemClickHandler);
            console.log('✅ Added click handler to themeToggleItem');

            // Test if element is clickable
            const styles = window.getComputedStyle(themeToggleItem);
            console.log('🎨 themeToggleItem pointer-events:', styles.pointerEvents);
            console.log('🎨 themeToggleItem display:', styles.display);
            console.log('🎨 themeToggleItem visibility:', styles.visibility);
        } else {
            console.log('❌ themeToggleItem not found!');
        }

        // Also add handler to the checkbox itself as backup
        const switchChangeHandler = (e) => {
            console.log('🖱️ Toggle SWITCH changed! Event:', e);
            e.stopPropagation();
            doToggle();
        };

        toggleSwitch.addEventListener('change', switchChangeHandler);
        console.log('✅ Added change handler to toggleSwitch');

        console.log('✅ Theme toggle fully initialized in profile');
    }

    updateProfileThemeUI() {
        const themeIcon = document.getElementById('themeIconProfile');
        const themeSubtitle = document.getElementById('themeSubtitle');

        if (themeIcon && themeSubtitle) {
            if (this.isDark) {
                themeIcon.textContent = '☀️';
                themeSubtitle.textContent = 'Темная';
            } else {
                themeIcon.textContent = '🌙';
                themeSubtitle.textContent = 'Светлая';
            }
        }
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


    updateMetaThemeColor(isDark) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }

        metaThemeColor.content = isDark ? '#1a1a1a' : '#667eea';
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
        this.setupToggleButton();
        this.updateProfileThemeUI();
        localStorage.setItem('lunify_theme', theme);
    }
}

// Initialize and export
window.themeManager = new ThemeManager();