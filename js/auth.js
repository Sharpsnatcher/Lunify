// Authentication Manager with Google Sign-In
class AuthManager {
    constructor() {
        this.user = null;
        this.isGuest = false;
    }

    init() {
        console.log('🔐 Auth Manager initialized');

        // Load saved user from localStorage
        const savedUser = localStorage.getItem('lunify_user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
            this.showProfileState();
        }

        // Check for guest mode
        this.isGuest = localStorage.getItem('lunify_guest_mode') === 'true';
        if (this.isGuest) {
            this.showProfileState(true);
        }

        this.attachEventListeners();
        this.loadGoogleAPI();
    }

    loadGoogleAPI() {
        // Load Google Sign-In API
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.initializeGoogleSignIn();
        };
        document.head.appendChild(script);
    }

    initializeGoogleSignIn() {
        // Initialize Google Sign-In
        // Note: You need to replace 'YOUR_CLIENT_ID' with actual Google OAuth Client ID
        // Get it from: https://console.cloud.google.com/apis/credentials

        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                callback: (response) => this.handleGoogleSignIn(response)
            });

            console.log('✅ Google Sign-In initialized');
        }
    }

    attachEventListeners() {
        const googleSignInBtn = document.getElementById('googleSignInBtn');
        const continueGuestBtn = document.getElementById('continueGuestBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const syncDataBtn = document.getElementById('syncDataBtn');
        const exportDataBtn = document.getElementById('exportDataBtn');

        if (googleSignInBtn) {
            googleSignInBtn.addEventListener('click', () => {
                this.signInWithGoogle();
            });
        }

        if (continueGuestBtn) {
            continueGuestBtn.addEventListener('click', () => {
                this.continueAsGuest();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        if (syncDataBtn) {
            syncDataBtn.addEventListener('click', () => {
                this.syncData();
            });
        }

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    signInWithGoogle() {
        if (typeof google !== 'undefined') {
            // Trigger Google Sign-In
            google.accounts.id.prompt();
        } else {
            // Fallback: Show demo login
            alert('Google Sign-In в демо-режиме.\n\nДля полноценной работы необходимо:\n1. Создать проект в Google Cloud Console\n2. Настроить OAuth 2.0\n3. Получить Client ID\n4. Заменить YOUR_GOOGLE_CLIENT_ID в auth.js');

            // Demo login
            this.handleDemoLogin();
        }
    }

    handleDemoLogin() {
        // Demo user for testing
        const demoUser = {
            id: 'demo_' + Date.now(),
            name: 'Демо Пользователь',
            email: 'demo@lunify.app',
            avatar: '',
            joinDate: new Date().toISOString()
        };

        this.user = demoUser;
        localStorage.setItem('lunify_user', JSON.stringify(this.user));
        this.showProfileState();

        console.log('✅ Demo login successful');
    }

    handleGoogleSignIn(response) {
        try {
            // Decode JWT token
            const payload = this.parseJwt(response.credential);

            const user = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                avatar: payload.picture,
                joinDate: new Date().toISOString()
            };

            this.user = user;
            localStorage.setItem('lunify_user', JSON.stringify(this.user));
            this.showProfileState();

            console.log('✅ Google Sign-In successful:', user.name);
        } catch (error) {
            console.error('Google Sign-In error:', error);
            alert('Ошибка входа. Попробуйте снова.');
        }
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    continueAsGuest() {
        this.isGuest = true;
        localStorage.setItem('lunify_guest_mode', 'true');
        this.showProfileState(true);
        console.log('✅ Guest mode activated');
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            this.user = null;
            this.isGuest = false;
            localStorage.removeItem('lunify_user');
            localStorage.removeItem('lunify_guest_mode');

            // Sign out from Google
            if (typeof google !== 'undefined') {
                google.accounts.id.disableAutoSelect();
            }

            this.showLoginState();
            console.log('✅ Logged out');
        }
    }

    showLoginState() {
        const loginState = document.getElementById('loginState');
        const profileState = document.getElementById('profileState');

        if (loginState) loginState.style.display = 'block';
        if (profileState) profileState.style.display = 'none';
    }

    showProfileState(isGuest = false) {
        const loginState = document.getElementById('loginState');
        const profileState = document.getElementById('profileState');

        if (loginState) loginState.style.display = 'none';
        if (profileState) profileState.style.display = 'block';

        // Update profile UI
        if (isGuest) {
            document.getElementById('userName').textContent = 'Гостевой режим';
            document.getElementById('userEmail').textContent = 'Данные хранятся локально';
            document.getElementById('avatarImg').style.display = 'none';
            document.querySelector('.avatar-placeholder').style.display = 'flex';
        } else if (this.user) {
            document.getElementById('userName').textContent = this.user.name;
            document.getElementById('userEmail').textContent = this.user.email;

            if (this.user.avatar) {
                const avatarImg = document.getElementById('avatarImg');
                avatarImg.src = this.user.avatar;
                avatarImg.style.display = 'block';
                document.querySelector('.avatar-placeholder').style.display = 'none';
            }
        }

        // Update stats
        this.updateStats();
    }

    updateStats() {
        // Calculate stats from localStorage data
        const moodData = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const habitsData = JSON.parse(localStorage.getItem('habits') || '[]');

        const joinDate = this.user ? new Date(this.user.joinDate) : new Date();
        const daysSinceJoin = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

        document.getElementById('statDays').textContent = daysSinceJoin || 1;
        document.getElementById('statMoods').textContent = moodData.length;
        document.getElementById('statHabits').textContent = habitsData.length;
    }

    syncData() {
        if (this.isGuest) {
            alert('Войдите через Google, чтобы синхронизировать данные между устройствами');
            return;
        }

        // Simulate sync
        alert('Синхронизация данных...\n\nВ продакшене здесь будет:\n- Отправка данных на сервер\n- Загрузка данных с сервера\n- Объединение локальных и удаленных данных');
        console.log('🔄 Syncing data...');
    }

    exportData() {
        // Collect all user data
        const allData = {
            user: this.user,
            moodHistory: JSON.parse(localStorage.getItem('moodHistory') || '[]'),
            habits: JSON.parse(localStorage.getItem('habits') || '[]'),
            analytics: JSON.parse(localStorage.getItem('mindcare_history') || '[]'),
            theme: localStorage.getItem('lunify_theme') || 'light',
            exportDate: new Date().toISOString()
        };

        // Create JSON file
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        // Download file
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lunify-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📥 Data exported');
    }

    isLoggedIn() {
        return this.user !== null || this.isGuest;
    }

    getUser() {
        return this.user;
    }
}

// Initialize and export
window.authManager = new AuthManager();
