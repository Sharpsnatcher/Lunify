// Главный файл приложения
const voiceAnalyzer = new VoiceAnalyzer();
const aiChat = new AIChat();
let sessionHistory = JSON.parse(localStorage.getItem('mindcare_history') || '[]');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 MindCare загружен');
    console.log('Провайдер AI:', AI_CONFIG.provider);

    // Initialize all modules
    initTabs();
    initVoice();
    initChat();
    initTabToggle();
    initSidebarToggle(); // NEW: Initialize sidebar toggle
    initResultsClose(); // NEW: Initialize results close button

    // Initialize new features
    if (window.moodDiary) window.moodDiary.init();
    if (window.breathingExercises) window.breathingExercises.init();
    if (window.habitsTracker) window.habitsTracker.init();
    if (window.analyticsManager) window.analyticsManager.init();
    if (window.authManager) window.authManager.init();
    if (window.themeManager) window.themeManager.init();
});

// NEW: Initialize Results Close Button
function initResultsClose() {
    const closeBtn = document.getElementById('closeResultsBtn');
    const resultsCard = document.getElementById('resultsCard');

    if (closeBtn && resultsCard) {
        closeBtn.addEventListener('click', () => {
            resultsCard.classList.remove('show');
            // Reset voice button for new recording
            const voiceBtn = document.getElementById('voiceBtn');
            const voiceStatus = document.getElementById('voiceStatus');
            if (voiceBtn && voiceStatus) {
                voiceBtn.textContent = '🎤';
                voiceStatus.textContent = 'Нажмите для новой записи';
            }
        });
    }
}

// NEW: Initialize Sidebar Toggle (Yandex Music Style)
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('appSidebar');

    if (!toggleBtn || !sidebar) {
        console.log('Sidebar elements not found');
        return;
    }

    // Toggle sidebar on button click
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = sidebar.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed', isCollapsed);

        // Update chat input position
        const chatInput = document.getElementById('chatInputContainer');
        if (chatInput) {
            chatInput.style.left = isCollapsed ? '0' : '280px';
        }

        // Save state to localStorage
        localStorage.setItem('sidebarCollapsed', isCollapsed);

        console.log('Sidebar toggled:', isCollapsed ? 'collapsed' : 'expanded');
    });

    // Restore saved state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        toggleBtn.classList.add('collapsed');

        // Also update chat input position
        const chatInput = document.getElementById('chatInputContainer');
        if (chatInput) {
            chatInput.style.left = '0';
        }
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 640) {
            const isClickInside = sidebar.contains(e.target) || toggleBtn.contains(e.target);
            if (!isClickInside && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 640) {
                sidebar.classList.remove('active');
            }
        }, 250);
    });

    console.log('✅ Sidebar toggle initialized');
}

// OLD: Toggle sidebar (keeping for backward compatibility)
function initTabToggle() {
    const toggleBtn = document.getElementById('tabToggleBtn');
    const sidebar = document.getElementById('sidebarTabs');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');

            // Save state
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });

        // Restore state
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
}

// Табы
function initTabs() {
    const tabs = document.querySelectorAll('.ios-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ios-tab').forEach(t => t.classList.remove('active'));

    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    const chatInput = document.getElementById('chatInputContainer');
    chatInput.style.display = tabName === 'chat' ? 'flex' : 'none';

    // Hide/show status bar and tabs for voice tab
    const statusBar = document.querySelector('.status-bar');
    const container = document.querySelector('.container');

    if (statusBar && container) {
        if (tabName === 'voice') {
            statusBar.style.opacity = '0';
            statusBar.style.pointerEvents = 'none';
            container.style.paddingTop = '0';
            // Tabs will auto-hide via CSS :has selector
        } else {
            statusBar.style.opacity = '1';
            statusBar.style.pointerEvents = 'auto';
            container.style.paddingTop = 'calc(44px + var(--safe-area-top) + 60px)';
        }
    }

    // Initialize theme toggle when switching to profile tab
    if (tabName === 'profile' && window.themeManager) {
        // Wait longer to ensure profile state is shown
        setTimeout(() => {
            console.log('🔧 Attempting to initialize theme toggle from switchTab...');
            window.themeManager.setupToggleButton();
        }, 200);
    }

    // Update analytics when switching to analytics tab
    if (tabName === 'analytics' && window.analyticsManager) {
        window.analyticsManager.updateAnalytics();
    }
}

// Голосовой анализ
function initVoice() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    
    voiceBtn.addEventListener('click', async () => {
        if (!voiceAnalyzer.isRecording) {
            const success = await voiceAnalyzer.startRecording();
            if (!success) return;
            
            voiceBtn.classList.add('recording');
            voiceBtn.textContent = '⏹️';
            voiceStatus.textContent = 'Идет запись... Говорите свободно';
            voiceStatus.classList.add('recording');
            
        } else {
            voiceBtn.classList.remove('recording');
            voiceBtn.textContent = '🎤';
            voiceStatus.textContent = 'Анализирую голос...';
            voiceStatus.classList.remove('recording');
            
            const audioBlob = await voiceAnalyzer.stopRecording();
            await processVoiceRecording(audioBlob);
        }
    });
}

async function processVoiceRecording(audioBlob) {
    const status = document.getElementById('voiceStatus');
    
    try {
        status.textContent = 'Извлекаю характеристики голоса...';
        
        const features = await voiceAnalyzer.analyzeAudio(audioBlob);
        
        status.textContent = 'Определяю эмоциональное состояние...';
        
        const emotionalState = voiceAnalyzer.detectEmotionalState(features);
        
        if (AI_CONFIG.provider !== 'demo') {
            status.textContent = 'Получаю комментарий от ИИ...';
            const aiInsights = await aiChat.getVoiceAnalysisInsight(features, emotionalState);
            if (aiInsights) {
                emotionalState.aiInsights = aiInsights;
            }
        }
        
        status.textContent = 'Анализ завершен!';
        
        displayResults(emotionalState);
        saveToHistory(emotionalState);
        
        setTimeout(() => {
            status.textContent = 'Нажмите для новой записи';
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка анализа:', error);
        status.textContent = 'Ошибка анализа. Попробуйте снова';
        setTimeout(() => {
            status.textContent = 'Нажмите для записи';
        }, 2000);
    }
}

// Чат
function initChat() {
    const sendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    
    sendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
    
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addChatMessage('user', message);
    input.value = '';
    input.style.height = 'auto';
    
    showTyping();
    
    try {
        const result = await aiChat.sendMessage(message);
        hideTyping();
        addChatMessage('assistant', result.response);
        
        if (result.hasCrisis) {
            showEmergencyInChat();
        }
    } catch (error) {
        hideTyping();
        console.error('Ошибка чата:', error);
        addChatMessage('assistant', 'Извините, произошла ошибка. Попробуйте позже.');
    }
}

function addChatMessage(role, content) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    bubble.textContent = content;
    
    messageDiv.appendChild(bubble);
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing';
    typingDiv.className = 'chat-message';
    typingDiv.innerHTML = `
        <div class="chat-bubble assistant">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

function showEmergencyInChat() {
    const container = document.getElementById('chatMessages');
    const emergencyDiv = document.createElement('div');
    emergencyDiv.className = 'emergency-card';
    emergencyDiv.style.margin = '16px 0';
    emergencyDiv.innerHTML = `
        <div class="emergency-title">⚠️ Экстренная помощь</div>
        <div class="emergency-text">
            Пожалуйста, немедленно обратитесь за профессиональной помощью:
        </div>
        <button class="emergency-button" onclick="callHotline()">
            📞 Телефон доверия
            <span style="font-size: 15px; opacity: 0.8;">8-800-2000-122</span>
        </button>
        <button class="emergency-button" onclick="callEmergency()">
            🚑 Скорая помощь
            <span style="font-size: 15px; opacity: 0.8;">112</span>
        </button>
    `;
    container.appendChild(emergencyDiv);
    container.scrollTop = container.scrollHeight;
}

// Отображение результатов
function displayResults(scenario) {
    const card = document.getElementById('resultsCard');
    const banner = document.getElementById('resultBanner');
    const icon = document.getElementById('resultIcon');
    const title = document.getElementById('resultTitle');
    const subtitle = document.getElementById('resultSubtitle');
    const badge = document.getElementById('resultBadge');
    const message = document.getElementById('resultMessage');
    const actionsList = document.getElementById('actionsList');
    const exercisesList = document.getElementById('exercisesList');
    const emergency = document.getElementById('emergencyCard');

    banner.className = `result-banner ${scenario.state}`;
    icon.textContent = scenario.icon;
    title.textContent = scenario.title;
    subtitle.textContent = scenario.subtitle;
    badge.textContent = scenario.badge;
    badge.className = `ios-badge ${scenario.badgeClass}`;
    message.innerHTML = scenario.message.replace(/\n/g, '<br>');
    
    if (scenario.aiInsights) {
        message.innerHTML += `<br><br><strong>💡 Комментарий ИИ:</strong><br>${scenario.aiInsights}`;
    }

    actionsList.innerHTML = '';
    scenario.actions.forEach(action => {
        const item = document.createElement('div');
        item.className = 'ios-list-item';
        item.style.cssText = 'padding: 20px; border: none; border-radius: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: flex-start; gap: 16px;';
        item.innerHTML = `
            <div class="list-item-icon" style="font-size: 28px;">✓</div>
            <div class="list-item-content">
                <div class="list-item-text" style="font-size: 17px; color: #ffffff; line-height: 1.7; letter-spacing: -0.3px;">${action}</div>
            </div>
        `;
        actionsList.appendChild(item);
    });

    exercisesList.innerHTML = '';
    if (scenario.exercises && scenario.exercises.length > 0) {
        scenario.exercises.forEach(exercise => {
            const item = document.createElement('div');
            item.className = 'ios-list-item';
            item.style.cssText = 'padding: 20px; border: none; border-radius: 12px; margin-bottom: 8px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: flex-start; gap: 16px;';
            item.innerHTML = `
                <div class="list-item-icon" style="font-size: 28px;">🧘</div>
                <div class="list-item-content">
                    <div class="list-item-text" style="font-size: 17px; color: #ffffff; line-height: 1.7; letter-spacing: -0.3px;">${exercise}</div>
                </div>
            `;
            exercisesList.appendChild(item);
        });
    } else {
        exercisesList.innerHTML = '<div class="ios-list-item" style="padding: 20px; border: none; border-radius: 12px; background: rgba(255, 255, 255, 0.05);"><div class="list-item-text" style="font-size: 17px; color: #ffffff; letter-spacing: -0.3px;">Срочно обратитесь к специалисту</div></div>';
    }

    emergency.style.display = scenario.crisis ? 'block' : 'none';
    card.classList.add('show');
    card.scrollIntoView({ behavior: 'smooth' });
}

// История
function saveToHistory(scenario) {
    const session = {
        date: new Date().toISOString(),
        state: scenario.title,
        icon: scenario.icon,
        badge: scenario.badge,
        badgeClass: scenario.badgeClass
    };
    
    sessionHistory.unshift(session);
    if (sessionHistory.length > 10) {
        sessionHistory = sessionHistory.slice(0, 10);
    }
    
    localStorage.setItem('mindcare_history', JSON.stringify(sessionHistory));
}

// Экстренные контакты
function callHotline() {
    if (confirm('Позвонить на телефон доверия 8-800-2000-122?')) {
        window.location.href = 'tel:88002000122';
    }
}

function callEmergency() {
    if (confirm('Позвонить в скорую помощь 112?')) {
        window.location.href = 'tel:112';
    }
}

// Инициализация экстренных кнопок
document.addEventListener('DOMContentLoaded', () => {
    const hotlineBtn = document.getElementById('hotlineBtn');
    const emergencyBtn = document.getElementById('emergencyBtn');
    
    if (hotlineBtn) hotlineBtn.addEventListener('click', callHotline);
    if (emergencyBtn) emergencyBtn.addEventListener('click', callEmergency);
});